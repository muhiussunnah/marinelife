import { NextRequest, NextResponse } from 'next/server'
import { getPool } from '@/lib/db/pool'
import { getSessionUser } from '@/lib/session'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

/** GET /api/listings/inquiries — messages buyers sent about the signed-in seller's listings. */
export async function GET() {
  const user = await getSessionUser()
  if (!user) return NextResponse.json({ error: 'Not signed in' }, { status: 401 })
  const pool = getPool()
  if (!pool) return NextResponse.json({ error: 'Database unavailable' }, { status: 503 })
  const { rows } = await pool.query(
    `SELECT i.id, i.listing_id, i.buyer_name, i.buyer_email, i.buyer_phone, i.message, i.read_at, i.created_at,
            l.title AS listing_title, l.slug AS listing_slug
       FROM listing_inquiries i JOIN listings l ON l.id = i.listing_id
      WHERE i.seller_id = $1 ORDER BY i.created_at DESC LIMIT 300`,
    [user.id]
  )
  return NextResponse.json({ inquiries: rows })
}

/** PATCH { ids?: string[] } — mark messages as read (all when ids is omitted). */
export async function PATCH(req: NextRequest) {
  const user = await getSessionUser()
  if (!user) return NextResponse.json({ error: 'Not signed in' }, { status: 401 })
  const pool = getPool()
  if (!pool) return NextResponse.json({ error: 'Database unavailable' }, { status: 503 })
  const body = await req.json().catch(() => ({}))
  const ids: string[] = Array.isArray(body?.ids) ? body.ids.map(String).slice(0, 300) : []
  if (ids.length) {
    await pool.query(
      `UPDATE listing_inquiries SET read_at = now() WHERE seller_id = $1 AND read_at IS NULL AND id::text = ANY($2::text[])`,
      [user.id, ids]
    )
  } else {
    await pool.query(`UPDATE listing_inquiries SET read_at = now() WHERE seller_id = $1 AND read_at IS NULL`, [user.id])
  }
  return NextResponse.json({ ok: true })
}
