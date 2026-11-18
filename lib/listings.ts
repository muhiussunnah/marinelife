/**
 * MarineYard listings — server-side data access (PostgreSQL via the shared pool).
 *
 * Placement: a listing's `priority` is computed from its seller's plan at
 * query time, so upgrades/cancellations take effect on every listing at once:
 *   2 = Pro (top placement), 1 = Explorer or picked by an admin (featured),
 *   0 = standard (free / Starter).
 */
import { randomBytes } from 'node:crypto'
import { getPool, hasDatabase } from '@/lib/db/pool'
import { CATEGORY_BY_SLUG, LISTING_CONDITIONS, type PublicListing } from '@/lib/listings-meta'

const PAID_ACTIVE = `(p.subscription_status IN ('active','trialing','past_due') OR p.current_period_end > now())`

export const PRIORITY_SQL = `GREATEST(
  CASE WHEN p.plan = 'pro' AND ${PAID_ACTIVE} THEN 2
       WHEN p.plan = 'explorer' AND ${PAID_ACTIVE} THEN 1
       ELSE 0 END,
  CASE WHEN l.is_featured THEN 1 ELSE 0 END)`

const PUBLIC_COLUMNS = `l.id, l.slug, l.title, l.category, l.brand, l.model, l.part_number, l.condition,
  l.price, l.currency, l.price_on_request, l.quantity, l.country, l.city, l.description, l.images,
  l.status, l.views, l.created_at, l.published_at, ${PRIORITY_SQL} AS priority, p.full_name AS seller_name`

export type ListingSort = 'featured' | 'newest' | 'price-asc' | 'price-desc'

export interface ListingQuery {
  q?: string
  category?: string
  country?: string
  condition?: string
  sort?: ListingSort
  page?: number
  perPage?: number
}

async function query<T = any>(sql: string, params: any[] = []): Promise<T[]> {
  const pool = getPool()
  if (!pool || !hasDatabase()) return []
  try {
    const { rows } = await pool.query(sql, params)
    return rows as T[]
  } catch (err: any) {
    console.error('[listings] query failed:', err?.message || err)
    return []
  }
}

export async function searchListings(opts: ListingQuery = {}): Promise<{ rows: PublicListing[]; total: number }> {
  const where: string[] = [`l.status = 'active'`]
  const params: any[] = []
  const add = (v: any) => {
    params.push(v)
    return `$${params.length}`
  }
  const q = (opts.q || '').trim().slice(0, 120)
  if (q) {
    const p = add(`%${q.replace(/[%_\\]/g, (m) => '\\' + m)}%`)
    where.push(`(l.title ILIKE ${p} OR l.brand ILIKE ${p} OR l.model ILIKE ${p} OR l.part_number ILIKE ${p} OR l.description ILIKE ${p})`)
  }
  if (opts.category && CATEGORY_BY_SLUG[opts.category]) where.push(`l.category = ${add(opts.category)}`)
  if (opts.country) where.push(`l.country = ${add(opts.country.slice(0, 80))}`)
  if (opts.condition && LISTING_CONDITIONS.some((c) => c.value === opts.condition)) where.push(`l.condition = ${add(opts.condition)}`)

  const order =
    opts.sort === 'newest'
      ? 'l.published_at DESC NULLS LAST, l.created_at DESC'
      : opts.sort === 'price-asc'
        ? 'l.price_on_request ASC, l.price ASC NULLS LAST, l.created_at DESC'
        : opts.sort === 'price-desc'
          ? 'l.price_on_request ASC, l.price DESC NULLS LAST, l.created_at DESC'
          : 'priority DESC, l.published_at DESC NULLS LAST, l.created_at DESC'

  const perPage = Math.min(Math.max(opts.perPage || 24, 1), 60)
  const page = Math.max(opts.page || 1, 1)
  const whereSql = where.join(' AND ')

  const [rows, countRows] = await Promise.all([
    query<PublicListing>(
      `SELECT ${PUBLIC_COLUMNS} FROM listings l LEFT JOIN profiles p ON p.id = l.user_id
        WHERE ${whereSql} ORDER BY ${order} LIMIT ${perPage} OFFSET ${(page - 1) * perPage}`,
      params
    ),
    query<{ n: number }>(`SELECT count(*)::int AS n FROM listings l WHERE ${whereSql}`, params),
  ])
  return { rows, total: countRows[0]?.n ?? 0 }
}

export async function getListingBySlug(slug: string): Promise<(PublicListing & { user_id: string; contact_name: string | null; contact_email: string | null; contact_phone: string | null; whatsapp: string | null }) | null> {
  const rows = await query(
    `SELECT ${PUBLIC_COLUMNS}, l.user_id, l.contact_name, l.contact_email, l.contact_phone, l.whatsapp
       FROM listings l LEFT JOIN profiles p ON p.id = l.user_id
      WHERE l.slug = $1 LIMIT 1`,
    [String(slug).slice(0, 200)]
  )
  return (rows[0] as any) || null
}

export async function getRelatedListings(listing: { id: string; category: string }, limit = 4): Promise<PublicListing[]> {
  return query<PublicListing>(
    `SELECT ${PUBLIC_COLUMNS} FROM listings l LEFT JOIN profiles p ON p.id = l.user_id
      WHERE l.status = 'active' AND l.category = $1 AND l.id <> $2
      ORDER BY priority DESC, l.created_at DESC LIMIT ${Math.min(limit, 12)}`,
    [listing.category, listing.id]
  )
}

export async function getFeaturedListings(limit = 8): Promise<PublicListing[]> {
  return query<PublicListing>(
    `SELECT ${PUBLIC_COLUMNS} FROM listings l LEFT JOIN profiles p ON p.id = l.user_id
      WHERE l.status = 'active'
      ORDER BY priority DESC, l.published_at DESC NULLS LAST, l.created_at DESC LIMIT ${Math.min(limit, 24)}`
  )
}

export async function getMarketStats(): Promise<{ listings: number; countries: number; sellers: number; byCategory: Record<string, number> }> {
  const [totals, cats] = await Promise.all([
    query<{ listings: number; countries: number; sellers: number }>(
      `SELECT count(*)::int AS listings, count(DISTINCT country)::int AS countries, count(DISTINCT user_id)::int AS sellers
         FROM listings WHERE status = 'active'`
    ),
    query<{ category: string; n: number }>(
      `SELECT category, count(*)::int AS n FROM listings WHERE status = 'active' GROUP BY category`
    ),
  ])
  return {
    listings: totals[0]?.listings ?? 0,
    countries: totals[0]?.countries ?? 0,
    sellers: totals[0]?.sellers ?? 0,
    byCategory: Object.fromEntries(cats.map((c) => [c.category, c.n])),
  }
}

export async function getListingCountries(): Promise<string[]> {
  const rows = await query<{ country: string }>(
    `SELECT DISTINCT country FROM listings WHERE status = 'active' ORDER BY country`
  )
  return rows.map((r) => r.country)
}

export async function getListingSitemapEntries(): Promise<{ slug: string; updated_at: string }[]> {
  return query(`SELECT slug, updated_at FROM listings WHERE status IN ('active','sold') ORDER BY updated_at DESC LIMIT 45000`)
}

export async function incrementListingViews(id: string) {
  await query(`UPDATE listings SET views = views + 1 WHERE id = $1`, [id])
}

export function makeListingSlug(title: string): string {
  const base = String(title || 'listing')
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/&/g, ' and ')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 70)
    .replace(/-+$/g, '')
  return `${base || 'listing'}-${randomBytes(3).toString('hex')}`
}
