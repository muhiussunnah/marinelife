import { NextRequest, NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'
import { getPool } from '@/lib/db/pool'
import { getSessionUser } from '@/lib/session'
import { validateListing } from '@/lib/listings-validate'
import { MAX_LISTING_IMAGES, isSpecImage } from '@/lib/listings-meta'
import { prepareListingImagesLater } from '@/lib/listing-images-store'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

async function ownListing(id: string, userId: string) {
  const pool = getPool()
  if (!pool || !UUID.test(id)) return null
  const { rows } = await pool.query(`SELECT * FROM listings WHERE id = $1 AND user_id = $2`, [id, userId])
  return rows[0] || null
}

/** GET — one of the seller's own listings, with contact fields (edit form). */
export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const user = await getSessionUser()
  if (!user) return NextResponse.json({ error: 'Not signed in' }, { status: 401 })
  const listing = await ownListing(params.id, user.id)
  if (!listing) return NextResponse.json({ error: 'Listing not found' }, { status: 404 })
  return NextResponse.json({ listing })
}

/**
 * PATCH — edit the listing (full form payload) or change its state:
 *   { action: 'mark-sold' | 'relist' | 'hide' | 'unhide' }
 */
export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const user = await getSessionUser()
  if (!user) return NextResponse.json({ error: 'Not signed in' }, { status: 401 })
  const pool = getPool()
  const listing = await ownListing(params.id, user.id)
  if (!pool || !listing) return NextResponse.json({ error: 'Listing not found' }, { status: 404 })

  let body: any
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
  }

  if (body?.action) {
    const transitions: Record<string, { from: string[]; to: string }> = {
      'mark-sold': { from: ['active', 'hidden'], to: 'sold' },
      relist: { from: ['sold'], to: 'active' },
      hide: { from: ['active'], to: 'hidden' },
      unhide: { from: ['hidden'], to: 'active' },
    }
    const t = transitions[String(body.action)]
    if (!t) return NextResponse.json({ error: 'Unknown action' }, { status: 400 })
    if (!t.from.includes(listing.status)) {
      return NextResponse.json({ error: `This listing is ${listing.status}; that change isn't possible.` }, { status: 409 })
    }
    await pool.query(
      `UPDATE listings SET status = $2, published_at = COALESCE(published_at, CASE WHEN $2 = 'active' THEN now() END) WHERE id = $1`,
      [listing.id, t.to]
    )
    revalidatePath('/listings')
    revalidatePath(`/listings/${listing.slug}`)
    return NextResponse.json({ ok: true, status: t.to })
  }

  const { value, error } = validateListing(body, user.id)
  if (!value) return NextResponse.json({ error }, { status: 400 })
  // Keep the current spec sheet until the background job below refreshes the images.
  const prevSpec = ((listing.images || []) as string[]).find((u) => isSpecImage(u))
  const images = [...value.images.filter((u) => !isSpecImage(u)), ...(prevSpec ? [prevSpec] : [])].slice(0, MAX_LISTING_IMAGES)
  // A rejected listing that is edited goes back into the review queue.
  const nextStatus = listing.status === 'rejected' ? 'pending' : listing.status
  await pool.query(
    `UPDATE listings SET title=$2, category=$3, brand=$4, model=$5, part_number=$6, condition=$7, price=$8, currency=$9,
            price_on_request=$10, quantity=$11, country=$12, city=$13, description=$14, images=$15, contact_name=$16,
            contact_email=$17, contact_phone=$18, whatsapp=$19, status=$20,
            reject_reason = CASE WHEN $20 = 'pending' THEN NULL ELSE reject_reason END
      WHERE id = $1`,
    [
      listing.id, value.title, value.category, value.brand, value.model, value.part_number, value.condition, value.price,
      value.currency, value.price_on_request, value.quantity, value.country, value.city, value.description, images,
      value.contact_name, value.contact_email || user.email, value.contact_phone, value.whatsapp, nextStatus,
    ]
  )
  // Brand new photos, re-brand if the caption changed and refresh the spec sheet, after answering.
  prepareListingImagesLater(listing.id, { userId: user.id, images, next: value, prev: listing })
  revalidatePath('/listings')
  revalidatePath(`/listings/${listing.slug}`)
  return NextResponse.json({ ok: true, slug: listing.slug, status: nextStatus })
}

/** DELETE — remove the listing (credits are not refunded). */
export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  const user = await getSessionUser()
  if (!user) return NextResponse.json({ error: 'Not signed in' }, { status: 401 })
  const pool = getPool()
  const listing = await ownListing(params.id, user.id)
  if (!pool || !listing) return NextResponse.json({ error: 'Listing not found' }, { status: 404 })
  await pool.query(`DELETE FROM listings WHERE id = $1`, [listing.id])
  revalidatePath('/listings')
  revalidatePath(`/listings/${listing.slug}`)
  return NextResponse.json({ ok: true })
}
