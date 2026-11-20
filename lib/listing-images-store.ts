/**
 * Turns the photos a seller uploaded into MarineYard-branded images when a
 * listing is saved: every photo goes on the branded frame (caption bar +
 * corner mark), a collage also becomes single photos, and one spec sheet
 * goes last. 10 images at most.
 *
 * Files (under /uploads/listings/<userId>/):
 *   <id>.<jpg|png|webp>                 original upload, kept so we can re-brand later
 *   <id>-t<n>.jpg                       one photo cut out of an uploaded collage (also kept)
 *   <listing8>/<seo-name>-<n>.webp      branded picture n, e.g. ingersoll-rand-rr100-f30-d-regulator-relay-valve-3.webp
 *   <listing8>/<seo-name>-specifications.webp
 * The stored URL carries ?v=<version> so a re-render (new caption) is never
 * served from a stale cache. listings.image_sources maps each branded path to
 * its original, its kind (photo / collage / tile / spec) and its pixel size.
 *
 * Older listings may still hold <id>--b-<ver>.webp, <ts>-photo-<hex>.webp and
 * <ts>-spec-<hex>.webp files; they are renamed to the new scheme on the next save.
 *
 * Branding never blocks a save: if a render fails the original photo is used.
 */
import { promises as fs } from 'node:fs'
import { randomBytes } from 'node:crypto'
import sharp from 'sharp'
import { getDb } from '@/lib/db'
import { getPool } from '@/lib/db/pool'
import { resolveUploadPath } from '@/lib/db/storage'
import { CATEGORY_BY_SLUG, CONDITION_LABEL, MAX_LISTING_IMAGES, formatPrice, isSpecImage } from '@/lib/listings-meta'
import { brandedPhoto, specCard, splitCollage, type ListingImageInfo } from '@/lib/listing-images'

const PREFIX = '/uploads/listings/'
const LEGACY_BRANDED = /--b-[0-9a-z]+\.webp$/
const LEGACY_ADMIN = /-photo-[0-9a-f]+\.webp$/
const LEGACY_GENERATED = /(-spec-[0-9a-f]+|-photo-[0-9a-f]+|--b-[0-9a-z]+)\.webp$/
const OUT_W = 1200
const OUT_H = 900

export type ImageKind = 'photo' | 'collage' | 'tile' | 'spec'
export type ImageSource = { src?: string | null; kind: ImageKind; w?: number; h?: number }
export type ImageSources = Record<string, ImageSource>

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

/** The item name without the selling points after the dash: "Ingersoll-Rand RR100-F30-D Regulator Relay Valve with Solenoid". */
export function itemName(title: string) {
  return String(title || '').split(/\s+[–—-]\s+/)[0].trim() || String(title || '').trim()
}

const STOP_END = new Set(['with', 'for', 'and', 'of', 'the', 'in', 'from', 'to', 'a', 'an', 'on'])

/** File-name base for a listing's pictures, e.g. "ingersoll-rand-rr100-f30-d-regulator-relay-valve". */
export function seoFileBase(title: string, max = 60) {
  let s = itemName(title)
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/\b([a-z])&([a-z])\b/g, '$1$2') // B&W -> bw
    .replace(/&/g, ' and ')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
  if (s.length > max) s = s.slice(0, max).replace(/-[^-]*$/, '')
  const parts = s.split('-').filter(Boolean)
  while (parts.length > 1 && STOP_END.has(parts[parts.length - 1])) parts.pop()
  return parts.join('-') || 'listing-photo'
}

// Fields printed on a branded photo's caption bar, and on the spec sheet.
const CAPTION_KEYS: (keyof ListingImageFields)[] = ['title', 'brand', 'model', 'condition', 'city', 'country']
const SPEC_KEYS: (keyof ListingImageFields)[] = [
  ...CAPTION_KEYS, 'category', 'part_number', 'quantity', 'price', 'currency', 'price_on_request', 'description',
]
const norm = (v: unknown) => (v === null || v === undefined ? '' : typeof v === 'number' ? String(v) : String(v).trim())
const changed = (a: any, b: any, keys: (keyof ListingImageFields)[]) => keys.some((k) => norm(a?.[k]) !== norm(b?.[k]))

const pathOf = (url: string) => String(url || '').split('?')[0]
/** "/uploads/listings/u/x.jpg" → path inside the listings bucket ("u/x.jpg"). */
const bucketPath = (url: string) => pathOf(url).slice(PREFIX.length)
const ver = () => `${Date.now().toString(36)}${randomBytes(2).toString('hex')}`

async function readUpload(url: string): Promise<Buffer | null> {
  const target = resolveUploadPath(pathOf(url).replace(/^\/uploads\//, ''))
  if (!target) return null
  try {
    return await fs.readFile(target.full)
  } catch {
    return null
  }
}

async function findLegacyOriginal(brandedPath: string): Promise<string | null> {
  const base = brandedPath.replace(LEGACY_BRANDED, '')
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

type Item = {
  kind: ImageKind
  /** original we can (re-)render from */
  src: string | null
  /** current public URL, when the item already exists */
  current?: string
  /** keep this URL untouched (not ours / can't be moved) */
  foreign?: boolean
  /** new upload or tile: always rendered */
  fresh?: boolean
  srcBytes?: Buffer
}

export type PreparedImages = { images: string[]; sources: ImageSources; stale: string[] }

/**
 * Works out the images to store for a listing. `prev` is the row before an
 * edit (omit it when creating). Generated files that are no longer used are
 * deleted unless keepStale is set (then they are returned in `stale`).
 */
export async function prepareListingImages(opts: {
  listingId: string
  userId: string
  images: string[]
  next: ListingImageFields
  prev?: (ListingImageFields & { images?: string[] | null; image_sources?: ImageSources | null }) | null
  /** cut collages into single photos, placed after the seller's own photos (default true) */
  split?: boolean
  /** render every picture again (e.g. after a design change) */
  rerender?: boolean
  keepStale?: boolean
}): Promise<PreparedImages> {
  const { userId, next, prev } = opts
  const own = `${PREFIX}${userId}/`
  const dir = `${own}${opts.listingId.slice(0, 8)}/`
  const seo = seoFileBase(next.title)
  const info = imageInfo(next)
  const prevSources: ImageSources = (prev?.image_sources as ImageSources) || {}
  const redraw = !!opts.rerender || !prev || changed(prev, next, CAPTION_KEYS)
  const bucket = getDb().storage.from('listings')

  // 1. what we were given
  const items: Item[] = []
  for (const url of opts.images.filter((u) => !isSpecImage(u)).slice(0, MAX_LISTING_IMAGES)) {
    const p = pathOf(url)
    if (!p.startsWith(own)) items.push({ kind: 'photo', src: null, current: url, foreign: true })
    else if (prevSources[p]) items.push({ kind: prevSources[p].kind === 'spec' ? 'photo' : prevSources[p].kind, src: prevSources[p].src || null, current: url })
    else if (LEGACY_BRANDED.test(p)) items.push({ kind: /-t\d+--b-/.test(p) ? 'tile' : 'photo', src: await findLegacyOriginal(p), current: url })
    else if (LEGACY_ADMIN.test(p) || p.startsWith(dir)) items.push({ kind: 'photo', src: null, current: url })
    else items.push({ kind: 'photo', src: p, fresh: true })
  }

  // 2. collages among the new uploads → single photos, largest first when there isn't room for all
  const tiles: { item: Item; area: number; order: number }[] = []
  for (const it of items) {
    if (!it.fresh || !it.src) continue
    it.srcBytes = (await readUpload(it.src)) || undefined
    if (!it.srcBytes || opts.split === false) continue
    let cut: Buffer[] = []
    try {
      cut = await splitCollage(it.srcBytes)
    } catch (e: any) {
      console.error('[listing-images] collage split failed:', e?.message || e)
    }
    if (cut.length < 2) continue
    it.kind = 'collage'
    const base = it.src.replace(/\.[a-z0-9]+$/i, '')
    for (let i = 0; i < cut.length; i++) {
      const tileSrc = `${base}-t${i + 1}.jpg`
      const { error } = await bucket.upload(bucketPath(tileSrc), cut[i], { contentType: 'image/jpeg', upsert: true })
      if (error) continue
      const m = await sharp(cut[i]).metadata()
      tiles.push({ item: { kind: 'tile', src: tileSrc, fresh: true, srcBytes: cut[i] }, area: (m.width || 0) * (m.height || 0), order: tiles.length })
    }
  }
  const room = Math.max(0, MAX_LISTING_IMAGES - 1 - items.length)
  const chosen = tiles
    .slice()
    .sort((a, b) => b.area - a.area)
    .slice(0, room)
    .sort((a, b) => a.order - b.order)
    .map((t) => t.item)
  const all = [...items, ...chosen].slice(0, MAX_LISTING_IMAGES)

  // 3. pixels for every picture, read or rendered before anything is written
  //    (pictures can swap places, so a target file may still be another picture's source)
  const bytes: (Buffer | null)[] = []
  for (const it of all) {
    if (it.foreign) {
      bytes.push(null)
      continue
    }
    const render = it.fresh || (redraw && !!it.src)
    try {
      if (render) {
        const src = it.srcBytes || (it.src ? await readUpload(it.src) : null)
        if (!src) throw new Error('original missing')
        bytes.push(await brandedPhoto(src, info))
      } else {
        bytes.push(it.current ? await readUpload(it.current) : null)
      }
    } catch (e: any) {
      console.error('[listing-images] branding failed:', e?.message || e)
      bytes.push(it.current ? await readUpload(it.current) : null)
    }
  }

  // 4. write <seo>-<n>.webp
  const images: string[] = []
  const sources: ImageSources = {}
  for (let i = 0; i < all.length; i++) {
    const it = all[i]
    const target = `${dir}${seo}-${i + 1}.webp`
    const unchanged = it.current && pathOf(it.current) === target && !(it.fresh || (redraw && it.src))
    if (it.foreign || (!bytes[i] && it.current)) {
      images.push(it.current!)
      continue
    }
    if (!bytes[i]) {
      if (it.src) images.push(it.src) // render failed on a new upload: show the plain photo
      continue
    }
    if (unchanged) {
      images.push(it.current!)
    } else {
      const { error } = await bucket.upload(bucketPath(target), bytes[i]!, { contentType: 'image/webp', upsert: true })
      if (error) {
        if (it.current) images.push(it.current)
        continue
      }
      images.push(`${target}?v=${ver()}`)
    }
    sources[target] = { src: it.src, kind: it.kind, w: OUT_W, h: OUT_H }
  }

  // 5. spec sheet, always last, while there is room
  const specTarget = `${dir}${seo}-specifications.webp`
  const prevSpec = (prev?.images || []).find((u) => isSpecImage(u) && pathOf(u).startsWith(own)) || null
  if (images.length < MAX_LISTING_IMAGES) {
    try {
      const keep = prevSpec && prev && !opts.rerender && !changed(prev, next, SPEC_KEYS)
      if (keep && pathOf(prevSpec!) === specTarget) {
        images.push(prevSpec!)
      } else {
        const card = keep ? (await readUpload(prevSpec!)) || (await specCard(info)) : await specCard(info)
        const { error } = await bucket.upload(bucketPath(specTarget), card, { contentType: 'image/webp', upsert: true })
        if (error) throw new Error(error.message)
        images.push(`${specTarget}?v=${ver()}`)
      }
      sources[specTarget] = { kind: 'spec', w: OUT_W, h: OUT_H }
    } catch (e: any) {
      console.error('[listing-images] spec card failed:', e?.message || e)
    }
  }

  // 6. generated files nobody uses any more
  const used = new Set(images.map(pathOf))
  const before = Array.from(new Set([...(prev?.images || []), ...opts.images].map(pathOf)))
  const stale = before.filter((p) => p.startsWith(own) && !used.has(p) && (p.startsWith(dir) || LEGACY_GENERATED.test(p)))
  if (stale.length && !opts.keepStale) await bucket.remove(stale.map(bucketPath)).catch(() => {})
  return { images, sources, stale }
}

/**
 * Same as prepareListingImages, but runs after the request has been answered
 * (a collage can take several seconds to turn into ten branded images). The
 * result is saved only if the listing still has the images it was started
 * with, so a newer save is never overwritten; files it replaced are deleted
 * only after that save succeeds.
 */
export function prepareListingImagesLater(opts: Parameters<typeof prepareListingImages>[0]) {
  const started = [...opts.images]
  void (async () => {
    try {
      const out = await prepareListingImages({ ...opts, keepStale: true })
      const pool = getPool()
      if (!pool) return
      const res = await pool.query(
        `UPDATE listings SET images = $2, image_sources = $3::jsonb WHERE id = $1 AND images = $4::text[]`,
        [opts.listingId, out.images, JSON.stringify(out.sources), started],
      )
      if (!res.rowCount) return // the seller saved again meanwhile; that save does its own images
      if (out.stale.length) await getDb().storage.from('listings').remove(out.stale.map(bucketPath)).catch(() => {})
    } catch (e: any) {
      console.error('[listing-images] background branding failed:', e?.message || e)
    }
  })()
}
