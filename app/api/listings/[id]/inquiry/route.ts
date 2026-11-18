import { NextRequest, NextResponse } from 'next/server'
import { getPool } from '@/lib/db/pool'
import { getSessionUser } from '@/lib/session'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
const DAILY_LIMIT = 25

/** POST /api/listings/:id/inquiry — a signed-in buyer messages the seller. */
export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const user = await getSessionUser()
  if (!user) return NextResponse.json({ error: 'Please sign in to contact the seller.' }, { status: 401 })
  const pool = getPool()
  if (!pool || !UUID.test(params.id)) return NextResponse.json({ error: 'Listing not found' }, { status: 404 })

  let body: any
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
  }
  const message = String(body?.message ?? '').trim().slice(0, 3000)
  const phone = String(body?.phone ?? '').trim().slice(0, 30) || null
  if (message.length < 10) return NextResponse.json({ error: 'Please write a message of at least 10 characters.' }, { status: 400 })
  if (phone && !/^[+0-9 ()\-.]{5,30}$/.test(phone)) return NextResponse.json({ error: 'Please enter a valid phone number.' }, { status: 400 })

  const { rows } = await pool.query(`SELECT id, user_id, status FROM listings WHERE id = $1`, [params.id])
  const listing = rows[0]
  if (!listing || listing.status !== 'active') return NextResponse.json({ error: 'This listing is no longer available.' }, { status: 404 })
  if (listing.user_id === user.id) return NextResponse.json({ error: 'This is your own listing.' }, { status: 400 })

  const recent = await pool.query(
    `SELECT count(*)::int AS n FROM listing_inquiries WHERE buyer_id = $1 AND created_at > now() - interval '1 day'`,
    [user.id]
  )
  if ((recent.rows[0]?.n ?? 0) >= DAILY_LIMIT) {
    return NextResponse.json({ error: 'You have sent a lot of messages today. Please try again tomorrow.' }, { status: 429 })
  }

  await pool.query(
    `INSERT INTO listing_inquiries (listing_id, seller_id, buyer_id, buyer_name, buyer_email, buyer_phone, message)
     VALUES ($1, $2, $3, $4, $5, $6, $7)`,
    [listing.id, listing.user_id, user.id, user.user_metadata.full_name || '', user.email, phone, message]
  )
  await pool.query(`UPDATE listings SET inquiries = inquiries + 1 WHERE id = $1`, [listing.id])
  return NextResponse.json({ ok: true })
}
