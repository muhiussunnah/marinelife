import { NextRequest, NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'
import { randomBytes } from 'node:crypto'
import { getPool } from '@/lib/db/pool'
import { getDb } from '@/lib/db'
import { getSessionUser } from '@/lib/session'
import { isAdminEmail } from '@/lib/admin'
import { MAX_IMAGE_BYTES, MAX_LISTING_IMAGES, isSpecImage } from '@/lib/listings-meta'
import { prepareListingImages } from '@/lib/listing-images-store'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'
export const maxDuration = 300

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

function sniff(b: Uint8Array): { ext: string; type: string } | null {
  if (b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff) return { ext: 'jpg', type: 'image/jpeg' }
  if (b[0] === 0x89 && b[1] === 0x50 && b[2] === 0x4e && b[3] === 0x47) return { ext: 'png', type: 'image/png' }
  if (b[0] === 0x52 && b[1] === 0x49 && b[2] === 0x46 && b[3] === 0x46 && b[8] === 0x57 && b[9] === 0x45 && b[10] === 0x42 && b[11] === 0x50)
    return { ext: 'webp', type: 'image/webp' }
  return null
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
 *   { listingId, urls?: string[], replace?: boolean, splitCollage?: boolean (alias: split) }
 *
 * Downloads each photo on the server and saves the original in the listing
 * owner's upload folder, then runs the same pipeline as a seller's save:
 * every photo goes on the MarineYard frame with the corner mark, a collage is
 * also cut into its single photos (splitCollage, default true), and the spec
 * sheet goes last (10 images at most). replace: true drops the listing's
 * current images. With no urls it re-renders the current images from their
 * originals (e.g. after a design change); with splitCollage it also re-checks
 * them for collages.
 */
export async function POST(req: NextRequest) {
  const user = await getSessionUser()
  if (!user || !isAdminEmail(user.email)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json().catch(() => ({}))
  const listingId = String(body?.listingId || '')
  if (!UUID.test(listingId)) return NextResponse.json({ error: 'Bad listing id' }, { status: 400 })
  const urls: string[] = (Array.isArray(body?.urls) ? body.urls : []).map(String).slice(0, MAX_LISTING_IMAGES)

  const pool = getPool()
  if (!pool) return NextResponse.json({ error: 'Database unavailable' }, { status: 503 })
  const { rows } = await pool.query(
    `SELECT id, user_id, slug, title, category, brand, model, part_number, condition, quantity, city, country,
            price, currency, price_on_request, description, images, image_sources
       FROM listings WHERE id = $1`,
    [listingId],
  )
  const l = rows[0]
  if (!l) return NextResponse.json({ error: 'Listing not found' }, { status: 404 })

  const bucket = getDb().storage.from('listings')
  const originals: string[] = []
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
      const kind = sniff(bytes)
      if (!kind) throw new Error('Not a JPG, PNG or WebP image')
      const name = `${l.user_id}/${Date.now().toString(36)}-${randomBytes(5).toString('hex')}.${kind.ext}`
      const { error } = await bucket.upload(name, bytes, { contentType: kind.type })
      if (error) throw new Error(error.message)
      originals.push(`/uploads/listings/${name}`)
    } catch (e: any) {
      failed.push({ url: raw, error: String(e?.message || e).slice(0, 160) })
    }
  }

  const split = body?.splitCollage ?? body?.split
  const current: string[] = (l.images || []).filter((u: string) => !isSpecImage(u))
  // No URLs = re-render what the listing already has, from the originals we kept.
  let input = body?.replace ? originals : [...current, ...originals]
  if (!urls.length && split === true) {
    // re-check the current pictures for collages: start again from their originals
    const srcs = current
      .map((u) => (l.image_sources || {})[u.split('?')[0]])
      .filter((x: any) => x && x.src && x.kind !== 'tile')
      .map((x: any) => x.src as string)
    if (srcs.length) input = srcs
  }
  const out = await prepareListingImages({
    listingId: l.id,
    userId: l.user_id,
    images: input,
    next: l,
    prev: l,
    rerender: true,
    split: split !== false,
  })
  await pool.query(`UPDATE listings SET images = $2, image_sources = $3::jsonb, updated_at = now() WHERE id = $1`, [
    listingId,
    out.images,
    JSON.stringify(out.sources),
  ])
  const images = out.images

  revalidatePath('/listings')
  revalidatePath(`/listings/${l.slug}`)
  revalidatePath(`/listings/${l.category}`)
  revalidatePath('/')
  return NextResponse.json({ images, failed })
}
