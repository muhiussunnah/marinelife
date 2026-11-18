import { NextRequest, NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'
import { getPool } from '@/lib/db/pool'
import { getSessionUser } from '@/lib/session'
import { isAdminEmail } from '@/lib/admin'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
const STATUSES = ['active', 'pending', 'rejected', 'sold', 'hidden']

async function requireAdmin() {
  const user = await getSessionUser()
  return user && isAdminEmail(user.email) ? user : null
}

/** GET ?status=&q=&page= — every listing for moderation, plus the auto-approve setting. */
export async function GET(req: NextRequest) {
  if (!(await requireAdmin())) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const pool = getPool()
  if (!pool) return NextResponse.json({ error: 'Database unavailable' }, { status: 503 })

  const sp = req.nextUrl.searchParams
  const status = sp.get('status') || ''
  const q = (sp.get('q') || '').trim().slice(0, 100)
  const page = Math.max(1, Number(sp.get('page')) || 1)
  const params: any[] = []
  const where: string[] = []
  if (STATUSES.includes(status)) {
    params.push(status)
    where.push(`l.status = $${params.length}`)
  }
  if (q) {
    params.push(`%${q}%`)
    where.push(`(l.title ILIKE $${params.length} OR l.brand ILIKE $${params.length} OR p.email ILIKE $${params.length} OR l.country ILIKE $${params.length})`)
  }
  const whereSql = where.length ? `WHERE ${where.join(' AND ')}` : ''
  const [rows, total, counts, setting] = await Promise.all([
    pool.query(
      `SELECT l.id, l.slug, l.title, l.category, l.brand, l.condition, l.price, l.currency, l.price_on_request, l.country,
              l.city, l.images, l.status, l.is_featured, l.reject_reason, l.views, l.inquiries, l.created_at,
              p.email AS seller_email, p.full_name AS seller_name, p.plan AS seller_plan
         FROM listings l LEFT JOIN profiles p ON p.id = l.user_id
         ${whereSql}
        ORDER BY (l.status = 'pending') DESC, l.created_at DESC
        LIMIT 50 OFFSET ${(page - 1) * 50}`,
      params
    ),
    pool.query(`SELECT count(*)::int AS n FROM listings l LEFT JOIN profiles p ON p.id = l.user_id ${whereSql}`, params),
    pool.query(`SELECT status, count(*)::int AS n FROM listings GROUP BY status`),
    pool.query(`SELECT value FROM site_settings WHERE key = 'listings_auto_approve'`),
  ])
  return NextResponse.json({
    listings: rows.rows,
    total: total.rows[0]?.n ?? 0,
    counts: Object.fromEntries(counts.rows.map((r: any) => [r.status, r.n])),
    autoApprove: (setting.rows[0]?.value ?? 'true') !== 'false',
  })
}

/**
 * PATCH — { id, status?, is_featured?, reject_reason? } moderates one listing;
 *         { autoApprove: boolean } changes the publishing setting.
 */
export async function PATCH(req: NextRequest) {
  if (!(await requireAdmin())) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const pool = getPool()
  if (!pool) return NextResponse.json({ error: 'Database unavailable' }, { status: 503 })
  const body = await req.json().catch(() => null)
  if (!body) return NextResponse.json({ error: 'Invalid request' }, { status: 400 })

  if (typeof body.autoApprove === 'boolean') {
    await pool.query(
      `INSERT INTO site_settings (key, value, type, group_name, label, sort_order)
       VALUES ('listings_auto_approve', $1, 'text', 'listings', 'Publish new listings instantly', 1)
       ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = now()`,
      [body.autoApprove ? 'true' : 'false']
    )
    return NextResponse.json({ ok: true })
  }

  const id = String(body.id || '')
  if (!UUID.test(id)) return NextResponse.json({ error: 'Invalid id' }, { status: 400 })
  const sets: string[] = []
  const params: any[] = [id]
  if (body.status !== undefined) {
    if (!STATUSES.includes(body.status)) return NextResponse.json({ error: 'Invalid status' }, { status: 400 })
    params.push(body.status)
    sets.push(`status = $${params.length}`)
    sets.push(`published_at = CASE WHEN $${params.length} = 'active' THEN COALESCE(published_at, now()) ELSE published_at END`)
    params.push(body.status === 'rejected' ? String(body.reject_reason || '').slice(0, 500) || null : null)
    sets.push(`reject_reason = $${params.length}`)
  }
  if (typeof body.is_featured === 'boolean') {
    params.push(body.is_featured)
    sets.push(`is_featured = $${params.length}`)
  }
  if (!sets.length) return NextResponse.json({ error: 'Nothing to change' }, { status: 400 })
  const { rows } = await pool.query(`UPDATE listings SET ${sets.join(', ')} WHERE id = $1 RETURNING slug`, params)
  if (!rows[0]) return NextResponse.json({ error: 'Listing not found' }, { status: 404 })
  revalidatePath('/listings')
  revalidatePath(`/listings/${rows[0].slug}`)
  revalidatePath('/')
  return NextResponse.json({ ok: true })
}

/** DELETE ?id= — remove a listing permanently. */
export async function DELETE(req: NextRequest) {
  if (!(await requireAdmin())) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const pool = getPool()
  const id = req.nextUrl.searchParams.get('id') || ''
  if (!pool || !UUID.test(id)) return NextResponse.json({ error: 'Invalid id' }, { status: 400 })
  const { rows } = await pool.query(`DELETE FROM listings WHERE id = $1 RETURNING slug`, [id])
  if (rows[0]) {
    revalidatePath('/listings')
    revalidatePath(`/listings/${rows[0].slug}`)
  }
  return NextResponse.json({ ok: true })
}
