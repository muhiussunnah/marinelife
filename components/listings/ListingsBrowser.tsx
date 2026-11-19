import Link from 'next/link'
import { Search, SlidersHorizontal, Plus, PackageSearch, ChevronLeft, ChevronRight } from 'lucide-react'
import ListingCard from '@/components/listings/ListingCard'
import CategoryIcon from '@/components/listings/CategoryIcon'
import { searchListings, getListingCountries, type ListingSort } from '@/lib/listings'
import { CATEGORY_BY_SLUG, LISTING_CATEGORIES, LISTING_CONDITIONS, categoryPath } from '@/lib/listings-meta'

export type SP = { [k: string]: string | string[] | undefined }
export const one = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v) || ''

/** True when the URL carries filters, sorting or paging (those views are noindex). */
export function hasListingFilters(sp: SP) {
  return !!(one(sp.q) || one(sp.country) || one(sp.condition) || one(sp.page) || one(sp.sort))
}

/**
 * The marketplace grid with search, filters, category chips, sorting and
 * paging. Used by /listings (all categories) and /listings/<category>.
 */
export default async function ListingsBrowser({
  searchParams,
  category = '',
  heading,
}: {
  searchParams: SP
  /** category slug when rendered on /listings/<category> */
  category?: string
  heading?: { h1: string; intro: string }
}) {
  const q = one(searchParams.q).slice(0, 120)
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
  const basePath = cat ? categoryPath(cat.slug) : '/listings'

  const href = (patch: Record<string, string | number | null>, path = basePath) => {
    const p = new URLSearchParams()
    const cur: Record<string, string> = { q, country, condition, sort: sort === 'featured' ? '' : sort, page: '' }
    for (const [k, v] of Object.entries({ ...cur, ...patch })) if (v !== null && v !== '' && v !== undefined) p.set(k, String(v))
    const s = p.toString()
    return `${path}${s ? `?${s}` : ''}`
  }

  const selectStyle = { background: 'var(--bg-card)', border: '1px solid var(--border)', color: 'var(--text-primary)' }
  const intro = heading?.intro || ''

  return (
    <div className="min-h-screen pt-28 pb-20 px-4 sm:px-6">
      <div className="max-w-7xl mx-auto">
        {cat && (
          <nav className="flex items-center flex-wrap gap-1 text-xs mb-4" style={{ color: 'var(--text-muted)' }} aria-label="Breadcrumb">
            <Link href="/" className="hover:underline">Home</Link>
            <ChevronRight className="w-3 h-3" />
            <Link href="/listings" className="hover:underline">Listings</Link>
            <ChevronRight className="w-3 h-3" />
            <span style={{ color: 'var(--text-primary)' }}>{cat.name}</span>
          </nav>
        )}

        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-5 mb-8">
          <div className="max-w-3xl">
            <p className="text-xs font-bold uppercase tracking-[0.18em] mb-2" style={{ color: 'var(--accent)' }}>
              Marketplace
            </p>
            <h1 className="font-playfair text-3xl sm:text-4xl md:text-5xl font-bold leading-tight" style={{ color: 'var(--text-primary)' }}>
              {heading?.h1 || (cat ? cat.name : 'Ship parts & marine equipment')}
            </h1>
            {intro ? (
              <div className="mt-3 space-y-2 text-sm sm:text-base leading-relaxed" style={{ color: 'var(--text-muted)' }}>
                {intro.split(/\n{2,}/).map((para, i) => (
                  <p key={i}>{para}</p>
                ))}
              </div>
            ) : (
              <p className="mt-2 text-sm sm:text-base max-w-2xl" style={{ color: 'var(--text-muted)' }}>
                {cat ? cat.blurb + '.' : 'Spare parts, machinery and equipment listed by owners, superintendents, chandlers and surplus dealers around the world.'}
              </p>
            )}
            <p className="mt-2 text-sm" style={{ color: 'var(--text-muted)' }}>
              <span className="font-semibold" style={{ color: 'var(--text-primary)' }}>{total.toLocaleString('en-US')}</span> {total === 1 ? 'listing' : 'listings'}
              {cat ? ' in this category' : ''}.
            </p>
          </div>
          <Link
            href="/dashboard/listings/new"
            className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-full text-sm font-semibold text-white shadow-lg hover:opacity-90 transition flex-shrink-0"
            style={{ background: 'linear-gradient(135deg,#0a5c9e,#0891b2)' }}
          >
            <Plus className="w-4 h-4" /> List a part — free
          </Link>
        </div>

        {/* Filters (plain GET form: works without JavaScript and is shareable).
            It always posts to /listings; the middleware moves ?category=x
            to the clean /listings/x path with a 301. */}
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
            href={href({ page: null }, '/listings')}
            className="flex-shrink-0 px-3.5 py-2 rounded-full text-xs font-semibold transition"
            style={!category ? { background: 'var(--btn-primary)', color: '#fff' } : { background: 'var(--bg-card)', color: 'var(--text-muted)', border: '1px solid var(--border)' }}
          >
            All
          </Link>
          {LISTING_CATEGORIES.map((c) => (
            <Link
              key={c.slug}
              href={href({ page: null }, categoryPath(c.slug))}
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
              {q || country || condition ? 'Nothing matches those filters yet' : cat ? `No ${cat.name.toLowerCase()} listed yet` : 'Be the first to list here'}
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
