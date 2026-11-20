/**
 * Turns the photos a seller uploaded into MarineYard-branded images when a
 * listing is saved, and keeps one branded spec sheet at the end of the list.
 *
 * File naming (all under /uploads/listings/<userId>/):
 *   <id>.<jpg|png|webp>        original upload, kept so we can re-brand later
 *   <id>--b-<ver>.webp         branded copy (new <ver> each render, so caches never show a stale caption)
 *   <id>-t<n>.jpg              one photo cut out of an uploaded collage, branded like any original
 *   <ts>-spec-<hex>.webp       branded spec sheet
 *   <ts>-photo-<hex>.webp      branded photo imported by an admin (no original kept)
 *
 * Branding never blocks a save: if a render fails the original photo is used.
 */
import { promises as fs } from 'node:fs'
import { randomBytes } from 'node:crypto'
import { getDb } from '@/lib/db'
import { resolveUploadPath } from '@/lib/db/storage'
import { CATEGORY_BY_SLUG, CONDITION_LABEL, MAX_LISTING_IMAGES, formatPrice, isSpecImage } from '@/lib/listings-meta'
import { brandedPhoto, specCard, splitCollage, type ListingImageInfo } from '@/lib/listing-images'

const PREFIX = '/uploads/listings/'
const BRANDED = /--b-[0-9a-z]+\.webp$/
const ADMIN_BRANDED = /-photo-[0-9a-f]+\.webp$/

export type ListingImageFields = {
  title: string
  category: string
  brand?: string | null
  model?: string | null
  part_number?: string | null
  condition: string
  quantity?: number | null
  city?: string | null
  country?: string | null
  price?: number | string | null
  currency?: string | null
  price_on_request?: boolean | null
  description?: string | null
}

export function imageInfo(l: ListingImageFields): ListingImageInfo {
  return {
    title: l.title,
    brand: l.brand,
    model: l.model,
    part_number: l.part_number,
    categoryName: CATEGORY_BY_SLUG[l.category]?.name || null,
    conditionLabel: CONDITION_LABEL[l.condition] || null,
    quantity: l.quantity ?? null,
    location: [l.city, l.country].filter(Boolean).join(', '),
    priceLabel: formatPrice({
      price: l.price == null || l.price === '' ? null : Number(l.price),
      currency: l.currency || 'USD',
      price_on_request: !!l.price_on_request,
    } as any),
    description: l.description,
  }
}

// Fields printed on a branded photo's caption bar, and on the spec sheet.
const CAPTION_KEYS: (keyof ListingImageFields)[] = ['title', 'brand', 'model', 'condition', 'city', 'country']
const SPEC_KEYS: (keyof ListingImageFields)[] = [
  ...CAPTION_KEYS, 'category', 'part_number', 'quantity', 'price', 'currency', 'price_on_request', 'description',
]
const norm = (v: unknown) => (v === null || v === undefined ? '' : typeof v === 'number' ? String(v) : String(v).trim())
const changed = (a: any, b: any, keys: (keyof ListingImageFields)[]) => keys.some((k) => norm(a?.[k]) !== norm(b?.[k]))

/** "/uploads/listings/u/x.jpg" → path inside the listings bucket ("u/x.jpg"). */
const bucketPath = (url: string) => url.slice(PREFIX.length)

async function readUpload(url: string): Promise<Buffer | null> {
  const target = resolveUploadPath(url.replace(/^\/uploads\//, ''))
  if (!target) return null
  try {
    return await fs.readFile(target.full)
  } catch {
    return null
  }
}

async function findOriginal(brandedUrl: string): Promise<string | null> {
  const base = brandedUrl.replace(BRANDED, '')
  for (const ext of ['jpg', 'png', 'webp']) {
    const target = resolveUploadPath(`${base}.${ext}`.replace(/^\/uploads\//, ''))
    if (!target) continue
    try {
      await fs.access(target.full)
      return `${base}.${ext}`
    } catch {
      /* try the next extension */
    }
  }
  return null
}

/**
 * Returns the image list to store for a listing. `prev` is the row before an
 * edit (omit it when creating). Old branded files that are replaced are deleted.
 */
export async function prepareListingImages(opts: {
  userId: string
  images: string[]
  next: ListingImageFields
  prev?: (ListingImageFields & { images?: string[] | null }) | null
  /** cut collages into single photos, placed after the seller's own photos (default true) */
  split?: boolean
}): Promise<string[]> {
  const { userId, next, prev } = opts
  const own = `${PREFIX}${userId}/`
  const info = imageInfo(next)
  const captionChanged = !prev || changed(prev, next, CAPTION_KEYS)
  const db = getDb()
  const bucket = db.storage.from('listings')
  const stale: string[] = []
  const out: string[] = []
  const fresh: { original: string; bytes: Buffer }[] = []
  const ver = () => `${Date.now().toString(36)}${randomBytes(2).toString('hex')}`
  const brandTo = async (original: string, bytes: Buffer) => {
    const name = `${original.replace(/\.[a-z0-9]+$/i, '')}--b-${ver()}.webp`
    const { error } = await bucket.upload(bucketPath(name), await brandedPhoto(bytes, info), { contentType: 'image/webp', upsert: true })
    if (error) throw new Error(error.message)
    return name
  }

  for (const url of opts.images.filter((u) => !isSpecImage(u)).slice(0, MAX_LISTING_IMAGES)) {
    if (!url.startsWith(own) || ADMIN_BRANDED.test(url)) {
      out.push(url)
      continue
    }
    let original: string | null = url
    if (BRANDED.test(url)) {
      if (!captionChanged) {
        out.push(url)
        continue
      }
      original = await findOriginal(url)
      if (!original) {
        out.push(url)
        continue
      }
    }
    try {
      const bytes = await readUpload(original)
      if (!bytes) throw new Error('original missing')
      out.push(await brandTo(original, bytes))
      if (BRANDED.test(url)) stale.push(url)
      // only a new upload is checked for a collage; tiles from earlier saves are already in the list
      else if (!/-t\d+\.[a-z]+$/i.test(original)) fresh.push({ original, bytes })
    } catch (e: any) {
      console.error('[listing-images] branding failed:', e?.message || e)
      out.push(url)
    }
  }

  // Collages: keep the all-in-one picture and add each photo in it as its own image,
  // after the seller's photos and leaving one place for the spec sheet.
  if (opts.split !== false) {
    for (const { original, bytes } of fresh) {
      if (out.length >= MAX_LISTING_IMAGES - 1) break
      let tiles: Buffer[] = []
      try {
        tiles = await splitCollage(bytes)
      } catch (e: any) {
        console.error('[listing-images] collage split failed:', e?.message || e)
      }
      for (let i = 0; i < tiles.length && out.length < MAX_LISTING_IMAGES - 1; i++) {
        try {
          const tileOriginal = `${original.replace(/\.[a-z0-9]+$/i, '')}-t${i + 1}.jpg`
          const { error } = await bucket.upload(bucketPath(tileOriginal), tiles[i], { contentType: 'image/jpeg', upsert: true })
          if (error) throw new Error(error.message)
          out.push(await brandTo(tileOriginal, tiles[i]))
        } catch (e: any) {
          console.error('[listing-images] tile failed:', e?.message || e)
        }
      }
    }
  }

  // One spec sheet, always last, while there is room for it.
  const prevSpec = (prev?.images || []).find((u) => isSpecImage(u) && u.startsWith(own)) || null
  if (out.length < MAX_LISTING_IMAGES) {
    if (prevSpec && prev && !changed(prev, next, SPEC_KEYS)) {
      out.push(prevSpec)
    } else {
      try {
        const name = `${own}${Date.now().toString(36)}-spec-${randomBytes(5).toString('hex')}.webp`
        const { error } = await bucket.upload(bucketPath(name), await specCard(info), { contentType: 'image/webp' })
        if (error) throw new Error(error.message)
        out.push(name)
        if (prevSpec) stale.push(prevSpec)
      } catch (e: any) {
        console.error('[listing-images] spec card failed:', e?.message || e)
        if (prevSpec) out.push(prevSpec)
      }
    }
  } else if (prevSpec) {
    stale.push(prevSpec)
  }

  const gone = stale.filter((u) => !out.includes(u))
  if (gone.length) await bucket.remove(gone.map(bucketPath)).catch(() => {})
  return out
}
