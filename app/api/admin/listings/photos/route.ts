import { NextRequest, NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'
import { randomBytes } from 'node:crypto'
import { getPool } from '@/lib/db/pool'
import { getDb } from '@/lib/db'
import { getSessionUser } from '@/lib/session'
import { isAdminEmail } from '@/lib/admin'
import { MAX_IMAGE_BYTES, MAX_LISTING_IMAGES, CATEGORY_BY_SLUG, CONDITION_LABEL, formatPrice } from '@/lib/listings-meta'
import { brandedPhoto, specCard, type ListingImageInfo } from '@/lib/listing-images'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'
export const maxDuration = 120

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

function isImage(b: Uint8Array) {
  const jpg = b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff
  const png = b[0] === 0x89 && b[1] === 0x50 && b[2] === 0x4e && b[3] === 0x47
  const webp = b[0] === 0x52 && b[1] === 0x49 && b[2] === 0x46 && b[3] === 0x46 && b[8] === 0x57 && b[9] === 0x45 && b[10] === 0x42 && b[11] === 0x50
  return jpg || png || webp
}

/** Only public web hosts: no localhost, private ranges or internal names. */
function publicHttpUrl(raw: string): URL | null {
  try {
    const u = new URL(raw)
    if (!['http:', 'https:'].includes(u.protocol)) return null
    const h = u.hostname.toLowerCase()
    if (h === 'localhost' || /\.(localhost|internal|local)$/.test(h) || h.startsWith('[')) return null
    if (/^(127\.|10\.|0\.|169\.254\.|192\.168\.|172\.(1[6-9]|2\d|3[01])\.)/.test(h)) return null
    return u
  } catch {
    return null
  }
}

/**
 * POST /api/admin/listings/photos — admin only.
 *   { listingId, urls?: string[], replace?: boolean, brand?: boolean, specCard?: boolean }
 *
 * Downloads each photo on the server and (unless brand === false) places it
 * on the MarineYard frame — logo, Sora/Inter type, navy bar — then stores it
 * under the listing owner's upload folder so the normal edit form keeps
 * working. specCard: true also adds a branded spec-sheet image at the end.
 */
export async function POST(req: NextRequest) {
  const user = await getSessionUser()
  if (!user || !isAdminEmail(user.email)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json().catch(() => ({}))
  const listingId = String(body?.listingId || '')
  if (!UUID.test(listingId)) return NextResponse.json({ error: 'Bad listing id' }, { status: 400 })
  const urls: string[] = (Array.isArray(body?.urls) ? body.urls : []).map(String).slice(0, MAX_LISTING_IMAGES)
  const wantSpec = !!body?.specCard
  const brand = body?.brand !== false
  if (!urls.length && !wantSpec) return NextResponse.json({ error: 'Nothing to add' }, { status: 400 })

  const pool = getPool()
  if (!pool) return NextResponse.json({ error: "Database not configured" }, { status: 500 })
  const { rows } = await pool.query(
    `SELECT id, user_id, slug, title, category, brand, model, part_number, condition, quantity, city, country,
            price, currency, price_on_request, description, images
       FROM listings WHERE id = $1`,
    [listingId],
  )
  const l = rows[0]
  if (!l) return NextResponse.json({ error: 'Listing not found' }, { status: 404 })

  const info: ListingImageInfo = {
    title: l.title,
    brand: l.brand,
    model: l.model,
    part_number: l.part_number,
    categoryName: CATEGORY_BY_SLUG[l.category]?.name || null,
    conditionLabel: CONDITION_LABEL[l.condition] || null,
    quantity: l.quantity,
    location: [l.city, l.country].filter(Boolean).join(', '),
    priceLabel: formatPrice({ price: l.price == null ? null : Number(l.price), currency: l.currency, price_on_request: l.price_on_request }),
    description: l.description,
  }

  const db = getDb()
  const store = async (bytes: Buffer, kind: string, ext: string, type: string) => {
    const name = `${l.user_id}/${Date.now().toString(36)}-${kind}-${randomBytes(5).toString('hex')}.${ext}`
    const { error } = await db.storage.from('listings').upload(name, bytes, { contentType: type })
    if (error) throw new Error(error.message)
    return `/uploads/listings/${name}`
  }

  const saved: string[] = []
  const failed: { url: string; error: string }[] = []
  for (const raw of urls) {
    const u = publicHttpUrl(raw)
    if (!u) {
      failed.push({ url: raw, error: 'Not a public http(s) URL' })
      continue
    }
    try {
      const res = await fetch(u, { redirect: 'follow', signal: AbortSignal.timeout(20000), headers: { 'User-Agent': 'MarineYardBot/1.0 (+https://marineyard.com)' } })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      if (Number(res.headers.get('content-length') || 0) > MAX_IMAGE_BYTES) throw new Error('Photo larger than 6 MB')
      const bytes = Buffer.from(await res.arrayBuffer())
      if (bytes.length > MAX_IMAGE_BYTES) throw new Error('Photo larger than 6 MB')
      if (!isImage(bytes)) throw new Error('Not a JPG, PNG or WebP image')
      saved.push(brand ? await store(await brandedPhoto(bytes, info), 'photo', 'webp', 'image/webp') : await store(bytes, 'photo', 'jpg', 'image/jpeg'))
    } catch (e: any) {
      failed.push({ url: raw, error: String(e?.message || e).slice(0, 160) })
    }
  }

  let base: string[] = body?.replace ? [] : (l.images || [])
  if (wantSpec) {
    try {
      // one spec card per listing: drop an older one before adding the new one
      base = base.filter((p) => !/-spec-[0-9a-f]+\.webp$/.test(p))
      const card = await store(await specCard(info), 'spec', 'webp', 'image/webp')
      base = [...base, ...saved].slice(0, MAX_LISTING_IMAGES - 1)
      saved.length = 0
      base.push(card)
    } catch (e: any) {
      failed.push({ url: 'spec-card', error: String(e?.message || e).slice(0, 160) })
    }
  }
  const images = [...base, ...saved].slice(0, MAX_LISTING_IMAGES)
  await pool.query(`UPDATE listings SET images = $2, updated_at = now() WHERE id = $1`, [listingId, images])

  // Delete generated files (branded photos, spec sheets) this call dropped from the listing.
  const own = `/uploads/listings/${l.user_id}/`
  const dropped = (l.images || []).filter(
    (u: string) => !images.includes(u) && u.startsWith(own) && /(-spec-[0-9a-f]+|-photo-[0-9a-f]+|--b-[0-9a-z]+)\.webp$/.test(u),
  )
  if (dropped.length) await db.storage.from('listings').remove(dropped.map((u: string) => u.slice('/uploads/listings/'.length))).catch(() => {})

  revalidatePath('/listings')
  revalidatePath(`/listings/${l.slug}`)
  revalidatePath(`/listings/${l.category}`)
  revalidatePath('/')
  return NextResponse.json({ images, failed })
}
