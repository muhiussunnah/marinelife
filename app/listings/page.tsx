import type { Metadata } from 'next'
import Link from 'next/link'
import { Search, SlidersHorizontal, Plus, PackageSearch, ChevronLeft, ChevronRight } from 'lucide-react'
import ListingCard from '@/components/listings/ListingCard'
import CategoryIcon from '@/components/listings/CategoryIcon'
import { searchListings, getListingCountries, type ListingSort } from '@/lib/listings'
import { CATEGORY_BY_SLUG, LISTING_CATEGORIES, LISTING_CONDITIONS } from '@/lib/listings-meta'

export const dynamic = 'force-dynamic'

type SP = { [k: string]: string | string[] | undefined }
const one = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v) || ''

export async function generateMetadata({ searchParams }: { searchParams: SP }): Promise<Metadata> {
  const cat = CATEGORY_BY_SLUG[one(searchParams.category)]
  const title = cat
    ? `${cat.name} for Sale – Ship Spare Parts Marketplace | MarineYard`
    : 'Ship Spare Parts & Marine Equipment for Sale | MarineYard'
  const description = cat
    ? `Buy and sell ${cat.name.toLowerCase()} worldwide: ${cat.blurb.toLowerCase()}. Contact sellers directly on MarineYard.`
    : 'Browse ship spare parts, marine engines, turbochargers, pumps, navigation and deck equipment listed by sellers worldwide. List your own parts free.'
  const filtered = !!(one(searchParams.q) || one(searchParams.country) || one(searchParams.condition) || one(searchParams.page) || one(searchParams.sort))
  return {
    title,
    description,
    alternates: { canonical: `https://marineyard.com/listings${cat ? `?category=${cat.slug}` : ''}` },
    robots: filtered ? { index: false, follow: true } : undefined,
    openGraph: { title, description, url: 'https://marineyard.com/listings', type: 'website' },
  }
}

export default async function ListingsPage({ searchParams }: { searchParams: SP }) {
  const q = one(searchParams.q).slice(0, 120)
  const category = CATEGORY_BY_SLUG[one(searchParams.category)] ? one(searchParams.category) : ''
  const country = one(searchParams.country).slice(0, 80)
  const condition = one(searchParams.condition)
  const sort = (['featured', 'newest', 'price-asc', 'price-desc'].includes(one(searchParams.sort)) ? one(searchParams.sort) : 'featured') as ListingSort
  const page = Math.max(1, Number(one(searchParams.page)) || 1)
  const perPage = 24

  const [{ rows, total }, countries] = await Promise.all([
    searchListings({ q, category, country, condition, sort, page, perPage }),
    getListingCountries(),
  ])
  const pages = Math.max(1, Math.ceil(total / perPage))
  const cat = category ? CATEGORY_BY_SLUG[category] : null

  const href = (patch: Record<string, string | number | null>) => {
    const p = new URLSearchParams()
    const cur: Record<string, string> = { q, category, country, condition, sort: sort === 'featured' ? '' : sort, page: '' }
    for (const [k, v] of Object.entries({ ...cur, ...patch })) if (v !== null && v !== '' && v !== undefined) p.set(k, String(v))
    const s = p.toString()
    return `/listings${s ? `?${s}` : ''}`
  }

  const selectStyle = { background: 'var(--bg-card)', border: '1px solid var(--border)', color: 'var(--text-primary)' }

  return (
    <div className="min-h-screen pt-28 pb-20 px-4 sm:px-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-5 mb-8">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] mb-2" style={{ color: 'var(--accent)' }}>
              Marketplace
            </p>
            <h1 className="font-playfair text-3xl sm:text-4xl md:text-5xl font-bold leading-tight" style={{ color: 'var(--text-primary)' }}>
              {cat ? cat.name : 'Ship parts & marine equipment'}
            </h1>
            <p className="mt-2 text-sm sm:text-base max-w-2xl" style={{ color: 'var(--text-muted)' }}>
              {cat ? cat.blurb + '.' : 'Spare parts, machinery and equipment listed by owners, superintendents, chandlers and surplus dealers around the world.'}{' '}
              <span className="font-semibold" style={{ color: 'var(--text-primary)' }}>{total.toLocaleString('en-US')}</span> {total === 1 ? 'listing' : 'listings'}.
            </p>
          </div>
          <Link
            href="/dashboard/listings/new"
            className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-full text-sm font-semibold text-white shadow-lg hover:opacity-90 transition"
            style={{ background: 'linear-gradient(135deg,#0a5c9e,#0891b2)' }}
          >
            <Plus className="w-4 h-4" /> List a part — free
          </Link>
        </div>

        {/* Filters (plain GET form: works without JavaScript and is shareable) */}
        <form action="/listings" method="get" className="rounded-2xl p-3 sm:p-4 mb-6 grid gap-3 md:grid-cols-12" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
          <label className="md:col-span-4 relative">
            <span className="sr-only">Search</span>
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-faint)' }} />
            <input
              name="q"
              defaultValue={q}
              placeholder="Part name, maker, model or part no."
              className="w-full pl-9 pr-3 py-2.5 rounded-xl text-sm outline-none focus:ring-2 focus:ring-sky-400/40"
              style={selectStyle}
            />
          </label>
          <select name="category" defaultValue={category} className="md:col-span-3 px-3 py-2.5 rounded-xl text-sm" style={selectStyle} aria-label="Category">
            <option value="">All categories</option>
            {LISTING_CATEGORIES.map((c) => (
              <option key={c.slug} value={c.slug}>{c.name}</option>
            ))}
          </select>
          <select name="country" defaultValue={country} className="md:col-span-2 px-3 py-2.5 rounded-xl text-sm" style={selectStyle} aria-label="Location">
            <option value="">Any location</option>
            {countries.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
          <select name="condition" defaultValue={condition} className="md:col-span-2 px-3 py-2.5 rounded-xl text-sm" style={selectStyle} aria-label="Condition">
            <option value="">Any condition</option>
            {LISTING_CONDITIONS.map((c) => (
              <option key={c.value} value={c.value}>{c.label}</option>
            ))}
          </select>
          <button type="submit" className="md:col-span-1 inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl text-sm font-semibold text-white" style={{ background: 'var(--btn-primary)' }}>
            <SlidersHorizontal className="w-4 h-4" /> <span className="md:hidden lg:inline">Go</span>
          </button>
          {sort !== 'featured' && <input type="hidden" name="sort" value={sort} />}
        </form>

        {/* Category chips */}
        <div className="flex gap-2 overflow-x-auto pb-3 mb-4 -mx-4 px-4 sm:mx-0 sm:px-0 [scrollbar-width:thin]">
          <Link
            href={href({ category: null, page: null })}
            className="flex-shrink-0 px-3.5 py-2 rounded-full text-xs font-semibold transition"
            style={!category ? { background: 'var(--btn-primary)', color: '#fff' } : { background: 'var(--bg-card)', color: 'var(--text-muted)', border: '1px solid var(--border)' }}
          >
            All
          </Link>
          {LISTING_CATEGORIES.map((c) => (
            <Link
              key={c.slug}
              href={href({ category: c.slug, page: null })}
              className="flex-shrink-0 inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full text-xs font-semibold transition"
              style={category === c.slug ? { background: 'var(--btn-primary)', color: '#fff' } : { background: 'var(--bg-card)', color: 'var(--text-muted)', border: '1px solid var(--border)' }}
            >
              <CategoryIcon slug={c.slug} className="w-3.5 h-3.5" />
              {c.name}
            </Link>
          ))}
        </div>

        {/* Sort */}
        <div className="flex items-center justify-between gap-3 mb-5 text-sm" style={{ color: 'var(--text-muted)' }}>
          <span>
            {total > 0 ? `Showing ${(page - 1) * perPage + 1}–${Math.min(page * perPage, total)} of ${total.toLocaleString('en-US')}` : 'No matching listings'}
          </span>
          <div className="flex items-center gap-1 flex-wrap justify-end">
            {([
              ['featured', 'Featured'],
              ['newest', 'Newest'],
              ['price-asc', 'Price ↑'],
              ['price-desc', 'Price ↓'],
            ] as const).map(([value, label]) => (
              <Link
                key={value}
                href={href({ sort: value === 'featured' ? null : value, page: null })}
                className="px-2.5 py-1 rounded-lg text-xs font-medium"
                style={sort === value ? { background: 'var(--accent-bg)', color: 'var(--accent)' } : {}}
              >
                {label}
              </Link>
            ))}
          </div>
        </div>

        {rows.length > 0 ? (
          <div className="grid gap-5 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {rows.map((l) => (
              <ListingCard key={l.id} listing={l} />
            ))}
          </div>
        ) : (
          <div className="rounded-3xl px-6 py-16 text-center" style={{ background: 'var(--bg-card)', border: '1px dashed var(--border-hover)' }}>
            <PackageSearch className="w-12 h-12 mx-auto mb-4" style={{ color: 'var(--accent)' }} />
            <h2 className="font-playfair text-2xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>
              {q || category || country || condition ? 'Nothing matches those filters yet' : 'Be the first to list here'}
            </h2>
            <p className="text-sm max-w-md mx-auto mb-6" style={{ color: 'var(--text-muted)' }}>
              New parts are added every day. Have surplus spares on board or in the warehouse? A free account lists 9 items.
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              <Link href="/dashboard/listings/new" className="px-5 py-2.5 rounded-full text-sm font-semibold text-white" style={{ background: 'var(--btn-primary)' }}>
                List a part
              </Link>
              {(q || category || country || condition) && (
                <Link href="/listings" className="px-5 py-2.5 rounded-full text-sm font-semibold" style={{ border: '1px solid var(--border-hover)', color: 'var(--text-primary)' }}>
                  Clear filters
                </Link>
              )}
            </div>
          </div>
        )}

        {pages > 1 && (
          <nav className="flex items-center justify-center gap-2 mt-10" aria-label="Pagination">
            {page > 1 && (
              <Link href={href({ page: page - 1 })} className="inline-flex items-center gap-1 px-4 py-2 rounded-full text-sm font-medium" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', color: 'var(--text-primary)' }}>
                <ChevronLeft className="w-4 h-4" /> Prev
              </Link>
            )}
            <span className="px-3 text-sm" style={{ color: 'var(--text-muted)' }}>
              Page {page} of {pages}
            </span>
            {page < pages && (
              <Link href={href({ page: page + 1 })} className="inline-flex items-center gap-1 px-4 py-2 rounded-full text-sm font-medium" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', color: 'var(--text-primary)' }}>
                Next <ChevronRight className="w-4 h-4" />
              </Link>
            )}
          </nav>
        )}
      </div>
    </div>
  )
}
