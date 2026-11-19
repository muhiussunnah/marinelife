import { NextRequest, NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'
import { getPool } from '@/lib/db/pool'
import { getSessionUser } from '@/lib/session'
import { isAdminEmail } from '@/lib/admin'
import { CATEGORY_BY_SLUG } from '@/lib/listings-meta'
import { validateListing } from '@/lib/listings-validate'
import { makeListingSlug } from '@/lib/listings'

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
  const [rows, total, counts, setting, intros] = await Promise.all([
    pool.query(
      `SELECT l.id, l.slug, l.title, l.category, l.brand, l.condition, l.price, l.currency, l.price_on_request, l.country,
              l.city, l.images, l.status, l.is_featured, l.reject_reason, l.views, l.inquiries, l.created_at,
              l.contact_tier, l.is_public_offer,
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
    pool.query(`SELECT key, value FROM site_settings WHERE key LIKE 'listing_category_intro:%'`),
  ])
  return NextResponse.json({
    listings: rows.rows,
    total: total.rows[0]?.n ?? 0,
    counts: Object.fromEntries(counts.rows.map((r: any) => [r.status, r.n])),
    autoApprove: (setting.rows[0]?.value ?? 'true') !== 'false',
    categoryIntros: Object.fromEntries(
      intros.rows.map((r: any) => [String(r.key).slice('listing_category_intro:'.length), r.value || ''])
    ),
  })
}

/**
 * POST — an admin adds a listing directly (no credits charged), e.g. a public
 * offer a seller published elsewhere. Extra fields: contact_tier
 * ('members' | 'paid'), is_public_offer, meta_title, meta_description.
 */
export async function POST(req: NextRequest) {
  const admin = await requireAdmin()
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const pool = getPool()
  if (!pool) return NextResponse.json({ error: 'Database unavailable' }, { status: 503 })
  const body = await req.json().catch(() => null)
  const { value, error } = validateListing(body, admin.id)
  if (!value) return NextResponse.json({ error }, { status: 400 })
  const tier = body?.contact_tier === 'paid' ? 'paid' : 'members'
  const metaTitle = String(body?.meta_title || '').trim().slice(0, 70) || null
  const metaDescription = String(body?.meta_description || '').trim().slice(0, 170) || null
  let slug = makeListingSlug(value.title)
  if ((await pool.query(`SELECT 1 FROM listings WHERE slug = $1`, [slug])).rowCount) slug = makeListingSlug(value.title)
  const { rows } = await pool.query(
    `INSERT INTO listings (user_id, slug, title, category, brand, model, part_number, condition, price, currency,
                           price_on_request, quantity, country, city, description, images, contact_name, contact_email,
                           contact_phone, whatsapp, status, published_at, contact_tier, is_public_offer, meta_title, meta_description)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,'active',now(),$21,$22,$23,$24)
     RETURNING id, slug`,
    [
      admin.id, slug, value.title, value.category, value.brand, value.model, value.part_number, value.condition, value.price,
      value.currency, value.price_on_request, value.quantity, value.country, value.city, value.description, value.images,
      value.contact_name, value.contact_email, value.contact_phone, value.whatsapp, tier, !!body?.is_public_offer, metaTitle,
      metaDescription,
    ]
  )
  revalidatePath('/listings')
  revalidatePath(`/listings/${value.category}`)
  revalidatePath('/')
  return NextResponse.json({ listing: rows[0] })
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

  if (body.categoryIntro && typeof body.categoryIntro === 'object') {
    const slug = String(body.categoryIntro.slug || '')
    if (!CATEGORY_BY_SLUG[slug]) return NextResponse.json({ error: 'Unknown category' }, { status: 400 })
    const text = String(body.categoryIntro.text || '').trim().slice(0, 3000)
    await pool.query(
      `INSERT INTO site_settings (key, value, type, group_name, label, sort_order)
       VALUES ($1, $2, 'textarea', 'listings', $3, 10)
       ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = now()`,
      [`listing_category_intro:${slug}`, text, `Intro text for /listings/${slug}`]
    )
    revalidatePath(`/listings/${slug}`)
    return NextResponse.json({ ok: true })
  }

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
  if (body.contact_tier === 'paid' || body.contact_tier === 'members') {
    params.push(body.contact_tier)
    sets.push(`contact_tier = $${params.length}`)
  }
  if (typeof body.is_public_offer === 'boolean') {
    params.push(body.is_public_offer)
    sets.push(`is_public_offer = $${params.length}`)
  }
  for (const k of ['meta_title', 'meta_description'] as const) {
    if (typeof body[k] === 'string') {
      params.push(body[k].trim().slice(0, k === 'meta_title' ? 70 : 170) || null)
      sets.push(`${k} = $${params.length}`)
    }
  }
  if (!sets.length) return NextResponse.json({ error: 'Nothing to change' }, { status: 400 })
  const { rows } = await pool.query(`UPDATE listings SET ${sets.join(', ')} WHERE id = $1 RETURNING slug, category`, params)
  if (!rows[0]) return NextResponse.json({ error: 'Listing not found' }, { status: 404 })
  revalidatePath('/listings')
  revalidatePath(`/listings/${rows[0].slug}`)
  revalidatePath(`/listings/${rows[0].category}`)
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
