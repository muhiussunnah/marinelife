import { NextRequest, NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'
import { getPool } from '@/lib/db/pool'
import { getSessionUser } from '@/lib/session'
import { makeListingSlug } from '@/lib/listings'
import { LISTING_CREDIT_COST } from '@/lib/listings-meta'
import { validateListing } from '@/lib/listings-validate'
import { prepareListingImages } from '@/lib/listing-images-store'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

/** GET /api/listings — the signed-in seller's own listings + credit balance. */
export async function GET() {
  const user = await getSessionUser()
  if (!user) return NextResponse.json({ error: 'Not signed in' }, { status: 401 })
  const pool = getPool()
  if (!pool) return NextResponse.json({ error: 'Database unavailable' }, { status: 503 })

  const [listings, profile, unread] = await Promise.all([
    pool.query(
      `SELECT id, slug, title, category, brand, model, part_number, condition, price, currency, price_on_request,
              quantity, country, city, images, status, reject_reason, views, inquiries, created_at, updated_at, published_at
         FROM listings WHERE user_id = $1 ORDER BY created_at DESC`,
      [user.id]
    ),
    pool.query(`SELECT credits, plan, subscription_status, current_period_end FROM profiles WHERE id = $1`, [user.id]),
    pool.query(`SELECT count(*)::int AS n FROM listing_inquiries WHERE seller_id = $1 AND read_at IS NULL`, [user.id]),
  ])
  return NextResponse.json({
    listings: listings.rows,
    profile: profile.rows[0] || null,
    unreadInquiries: unread.rows[0]?.n ?? 0,
  })
}

/** POST /api/listings — submit a new listing (costs LISTING_CREDIT_COST credits). */
export async function POST(req: NextRequest) {
  const user = await getSessionUser()
  if (!user) return NextResponse.json({ error: 'Please sign in to list an item.' }, { status: 401 })
  const pool = getPool()
  if (!pool) return NextResponse.json({ error: 'Database unavailable' }, { status: 503 })

  let body: any
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
  }
  const { value, error } = validateListing(body, user.id)
  if (!value) return NextResponse.json({ error }, { status: 400 })

  const client = await pool.connect()
  try {
    await client.query('BEGIN')
    const charged = await client.query(
      `UPDATE profiles SET credits = credits - $2 WHERE id = $1 AND credits >= $2
       RETURNING credits, plan, subscription_status, current_period_end`,
      [user.id, LISTING_CREDIT_COST]
    )
    if (!charged.rowCount) {
      await client.query('ROLLBACK')
      const exists = await pool.query(`SELECT 1 FROM profiles WHERE id = $1`, [user.id])
      if (!exists.rowCount) {
        return NextResponse.json({ error: 'Your account profile is missing. Please sign out and sign in again.' }, { status: 409 })
      }
      return NextResponse.json(
        { error: 'insufficient_credits', message: 'You have used all your listing credits. Upgrade your plan to keep listing.' },
        { status: 402 }
      )
    }
    const p = charged.rows[0]
    const paid =
      p.plan && p.plan !== 'free' &&
      (['active', 'trialing', 'past_due'].includes(p.subscription_status) ||
        (p.current_period_end && new Date(p.current_period_end).getTime() > Date.now()))
    const setting = await client.query(`SELECT value FROM site_settings WHERE key = 'listings_auto_approve'`)
    const autoApprove = (setting.rows[0]?.value ?? 'true') !== 'false'
    const status = paid || autoApprove ? 'active' : 'pending'

    let slug = makeListingSlug(value.title)
    for (let i = 0; i < 3; i++) {
      const taken = await client.query(`SELECT 1 FROM listings WHERE slug = $1`, [slug])
      if (!taken.rowCount) break
      slug = makeListingSlug(value.title)
    }
    const inserted = await client.query(
      `INSERT INTO listings (user_id, slug, title, category, brand, model, part_number, condition, price, currency,
                             price_on_request, quantity, country, city, description, images, contact_name,
                             contact_email, contact_phone, whatsapp, status, published_at)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21,
               CASE WHEN $21 = 'active' THEN now() ELSE NULL END)
       RETURNING id, slug, status`,
      [
        user.id, slug, value.title, value.category, value.brand, value.model, value.part_number, value.condition,
        value.price, value.currency, value.price_on_request, value.quantity, value.country, value.city,
        value.description, value.images, value.contact_name || user.user_metadata.full_name || null,
        value.contact_email || user.email, value.contact_phone, value.whatsapp, status,
      ]
    )
    await client.query('COMMIT')
    // Brand the photos and add the spec sheet now the listing exists (never fails the save).
    try {
      const images = await prepareListingImages({ userId: user.id, images: value.images, next: value })
      await pool.query(`UPDATE listings SET images = $2 WHERE id = $1`, [inserted.rows[0].id, images])
    } catch (e: any) {
      console.error('[listings] image branding failed:', e?.message || e)
    }
    if (status === 'active') {
      revalidatePath('/listings')
      revalidatePath('/')
    }
    return NextResponse.json({ listing: inserted.rows[0], credits: p.credits })
  } catch (err: any) {
    await client.query('ROLLBACK').catch(() => {})
    console.error('[listings] create failed:', err?.message || err)
    return NextResponse.json({ error: 'Could not save your listing. Please try again.' }, { status: 500 })
  } finally {
    client.release()
  }
}
