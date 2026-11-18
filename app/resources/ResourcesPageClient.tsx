'use client'

import { useState, useMemo, useEffect, useCallback } from 'react'
import Link from 'next/link'
import {
  Search, ChevronDown, BookOpen, Anchor,
  ChevronLeft, ChevronRight, Eye, Heart, Lock,
  Crown, Tag, CheckCircle2, X,
} from 'lucide-react'
import { createClient } from '@/lib/browser-client'
import { RESOURCE_CATEGORIES, DEFAULT_AUTHOR_NAME } from '@/lib/content-helpers'
import MarketplaceCTA from '@/components/blog/MarketplaceCTA'

type PricingFilter = 'All' | 'Free' | 'Premium'

export interface ResourceArticle {
  id: number
  title: string
  excerpt: string
  category: string
  date: string
  readTime: string
  slug: string
  image?: string
  views: number
  is_premium: boolean
}

const ARTICLES_PER_PAGE = 9
const ALL_CATEGORIES = 'All Topics'

const pricingOptions: { value: PricingFilter; label: string }[] = [
  { value: 'All',     label: 'All Articles' },
  { value: 'Free',    label: 'Free' },
  { value: 'Premium', label: 'Premium' },
]

const articleHref = (slug: string) => (slug.startsWith('/') ? slug : `/${slug}`)

export default function ResourcesPageClient({ dbPosts = [] }: { dbPosts?: ResourceArticle[] }) {
  const [searchQuery, setSearchQuery]         = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>(ALL_CATEGORIES)
  const [selectedPricing, setSelectedPricing] = useState<PricingFilter>('All')
  const [pricingOpen, setPricingOpen]         = useState(false)
  const [currentPage, setCurrentPage]         = useState(1)

  // User state
  const [isPaid, setIsPaid]           = useState(false)
  const [isLoggedIn, setIsLoggedIn]   = useState(false)
  const [favorites, setFavorites]     = useState<Set<string>>(new Set())
  const [loadingFav, setLoadingFav]   = useState<string | null>(null)

  // Real view counts from the page_views table (overlaid on the DB column)
  const [realViews, setRealViews] = useState<Record<string, number>>({})
  useEffect(() => {
    if (!dbPosts.length) return
    const slugs = dbPosts.map(a => a.slug).join(',')
    fetch(`/api/views?slugs=${encodeURIComponent(slugs)}`)
      .then(r => r.json())
      .then(d => setRealViews(d.views || {}))
      .catch(() => {})
  }, [dbPosts])

  const allArticles = useMemo(() => {
    if (Object.keys(realViews).length === 0) return dbPosts
    return dbPosts.map(a => (realViews[a.slug] !== undefined ? { ...a, views: realViews[a.slug] } : a))
  }, [dbPosts, realViews])

  // Default marine categories first, then any extra category used by a post.
  const categories = useMemo(() => {
    const list: string[] = [...RESOURCE_CATEGORIES]
    for (const a of dbPosts) {
      if (a.category && !list.includes(a.category)) list.push(a.category)
    }
    return [ALL_CATEGORIES, ...list]
  }, [dbPosts])

  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = {}
    for (const a of allArticles) counts[a.category] = (counts[a.category] || 0) + 1
    return counts
  }, [allArticles])

  useEffect(() => {
    const supabase = createClient()
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      setIsLoggedIn(true)

      const [{ data: profile }, { slugs }] = await Promise.all([
        supabase.from('profiles').select('plan').eq('id', user.id).maybeSingle(),
        fetch('/api/favorites').then(r => r.json()).catch(() => ({ slugs: [] })),
      ])

      setIsPaid(!!(profile?.plan && profile.plan !== 'free'))
      setFavorites(new Set(slugs ?? []))
    }
    init().catch(() => {})
  }, [])

  const toggleFavorite = useCallback(async (article: ResourceArticle) => {
    if (!isLoggedIn) {
      window.location.href = '/login'
      return
    }
    setLoadingFav(article.slug)
    try {
      const res = await fetch('/api/favorites', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          slug: article.slug,
          title: article.title,
          image: article.image ?? '',
          excerpt: article.excerpt,
          category: article.category,
        }),
      })
      if (!res.ok) throw new Error('Failed to save')
      const data = await res.json()
      if (typeof data.saved === 'boolean') {
        setFavorites(prev => {
          const next = new Set(prev)
          data.saved ? next.add(article.slug) : next.delete(article.slug)
          return next
        })
      }
    } catch (err) {
      console.error('Favorite toggle failed:', err)
    } finally {
      setLoadingFav(null)
    }
  }, [isLoggedIn])

  const filtered = useMemo(() => {
    const q = searchQuery.trim().toLowerCase()
    return allArticles.filter(a => {
      const matchQ = !q || a.title.toLowerCase().includes(q) || a.excerpt.toLowerCase().includes(q)
      const matchC = selectedCategory === ALL_CATEGORIES || a.category === selectedCategory
      const matchP = selectedPricing === 'All' ||
        (selectedPricing === 'Free' && !a.is_premium) ||
        (selectedPricing === 'Premium' && a.is_premium)
      return matchQ && matchC && matchP
    })
  }, [searchQuery, selectedCategory, selectedPricing, allArticles])

  // Any filter change sends the reader back to page 1.
  useEffect(() => { setCurrentPage(1) }, [searchQuery, selectedCategory, selectedPricing])

  const hasFilters = searchQuery.trim() !== '' || selectedCategory !== ALL_CATEGORIES || selectedPricing !== 'All'
  const clearFilters = () => {
    setSearchQuery('')
    setSelectedCategory(ALL_CATEGORIES)
    setSelectedPricing('All')
  }

  const totalPages = Math.max(1, Math.ceil(filtered.length / ARTICLES_PER_PAGE))
  const pageItems  = filtered.slice((currentPage - 1) * ARTICLES_PER_PAGE, currentPage * ARTICLES_PER_PAGE)

  const getPageNumbers = (): (number | '...')[] => {
    if (totalPages <= 6) return Array.from({ length: totalPages }, (_, i) => i + 1)
    if (currentPage <= 3) return [1, 2, 3, 4, '...', totalPages]
    if (currentPage >= totalPages - 2) return [1, '...', totalPages - 3, totalPages - 2, totalPages - 1, totalPages]
    return [1, '...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages]
  }

  const dropdownBase: React.CSSProperties = {
    background: 'var(--bg-card)',
    border: '1px solid var(--border)',
    color: 'var(--text-primary)',
  }

  const noPostsAtAll = dbPosts.length === 0

  return (
    <div
      className="min-h-screen pt-24 pb-16 px-4 sm:px-6"
      style={{ background: 'var(--bg-primary)' }}
      onClick={() => setPricingOpen(false)}
    >
      <div className="max-w-7xl mx-auto">

        {/* ── Page Header ──────────────────────────────────────── */}
        <div className="text-center mb-12">
          <div
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold mb-5"
            style={{ background: 'var(--accent-bg)', color: 'var(--accent)', border: '1px solid var(--border)' }}
          >
            <Anchor className="w-3.5 h-3.5" />
            MarineYard Resources
          </div>
          <h1
            className="font-playfair text-4xl sm:text-5xl md:text-6xl font-bold mb-5"
            style={{ color: 'var(--text-primary)' }}
          >
            Marine Resources
          </h1>
          <p className="text-lg sm:text-xl max-w-3xl mx-auto leading-relaxed" style={{ color: 'var(--text-muted)' }}>
            Practical guides on ship machinery, marine engines, maintenance and repair, SOLAS &amp; MARPOL
            compliance, careers at sea, and buying the right spare parts.
          </p>
        </div>

        {!noPostsAtAll && (
          <>
            {/* ── Search + Pricing ─────────────────────────────────── */}
            <div
              className="flex flex-col md:flex-row gap-3 p-4 rounded-2xl mb-4"
              style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}
              onClick={e => e.stopPropagation()}
            >
              <div className="flex-1 relative">
                <Search
                  className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none"
                  style={{ color: 'var(--text-muted)' }}
                />
                <input
                  type="search"
                  placeholder="Search articles: engines, pumps, MARPOL, purifiers…"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="w-full pl-11 pr-4 py-2.5 rounded-xl text-sm outline-none"
                  style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)', color: 'var(--text-primary)' }}
                  aria-label="Search articles"
                />
              </div>

              <div className="relative">
                <button
                  type="button"
                  onClick={() => setPricingOpen(v => !v)}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm w-full md:w-auto"
                  style={{ ...dropdownBase, minWidth: '160px' }}
                  aria-haspopup="listbox"
                  aria-expanded={pricingOpen}
                >
                  {selectedPricing === 'Premium'
                    ? <Crown className="w-4 h-4 flex-shrink-0" style={{ color: '#f59e0b' }} />
                    : selectedPricing === 'Free'
                    ? <CheckCircle2 className="w-4 h-4 flex-shrink-0" style={{ color: 'var(--accent)' }} />
                    : <Tag className="w-4 h-4 flex-shrink-0" style={{ color: 'var(--text-muted)' }} />
                  }
                  <span className="flex-1 text-left">
                    {pricingOptions.find(o => o.value === selectedPricing)?.label}
                  </span>
                  <ChevronDown
                    className="w-4 h-4 flex-shrink-0 transition-transform"
                    style={{ color: 'var(--text-muted)', transform: pricingOpen ? 'rotate(180deg)' : 'rotate(0deg)' }}
                  />
                </button>
                {pricingOpen && (
                  <div className="absolute top-full mt-2 right-0 md:left-0 w-48 rounded-xl shadow-2xl z-50 py-1.5 overflow-hidden" style={dropdownBase} role="listbox">
                    {pricingOptions.map(opt => (
                      <button
                        key={opt.value}
                        type="button"
                        role="option"
                        aria-selected={selectedPricing === opt.value}
                        onClick={() => { setSelectedPricing(opt.value); setPricingOpen(false) }}
                        className="w-full flex items-center gap-3 px-4 py-2.5 text-sm transition-colors text-left"
                        style={{ color: 'var(--text-primary)', background: selectedPricing === opt.value ? 'var(--accent-bg)' : 'transparent' }}
                      >
                        {opt.value === 'Premium'
                          ? <Crown className="w-4 h-4 flex-shrink-0" style={{ color: '#f59e0b' }} />
                          : opt.value === 'Free'
                          ? <CheckCircle2 className="w-4 h-4 flex-shrink-0" style={{ color: 'var(--accent)' }} />
                          : <Tag className="w-4 h-4 flex-shrink-0" style={{ color: 'var(--text-muted)' }} />}
                        <span className="flex-1">{opt.label}</span>
                        {selectedPricing === opt.value && <span style={{ color: 'var(--accent)', fontSize: '12px' }}>✓</span>}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* ── Category chips ───────────────────────────────────── */}
            <div className="flex gap-2 overflow-x-auto pb-2 mb-6 -mx-4 px-4 sm:mx-0 sm:px-0 sm:flex-wrap" role="tablist" aria-label="Filter by topic">
              {categories.map(cat => {
                const active = selectedCategory === cat
                const count = cat === ALL_CATEGORIES ? allArticles.length : (categoryCounts[cat] || 0)
                return (
                  <button
                    key={cat}
                    type="button"
                    role="tab"
                    aria-selected={active}
                    onClick={() => setSelectedCategory(cat)}
                    className="flex-shrink-0 inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-sm font-medium transition-colors whitespace-nowrap"
                    style={{
                      background: active ? 'var(--btn-primary)' : 'var(--bg-card)',
                      color: active ? '#fff' : 'var(--text-primary)',
                      border: `1px solid ${active ? 'var(--btn-primary)' : 'var(--border)'}`,
                    }}
                  >
                    {cat}
                    <span
                      className="text-xs px-1.5 rounded-full"
                      style={{
                        background: active ? 'rgba(255,255,255,0.2)' : 'var(--accent-bg)',
                        color: active ? '#fff' : 'var(--text-muted)',
                      }}
                    >
                      {count}
                    </span>
                  </button>
                )
              })}
            </div>

            {/* ── Results Count ─────────────────────────────────────── */}
            <div className="flex items-center justify-between gap-3 mb-8 text-sm" style={{ color: 'var(--text-muted)' }}>
              <p>
                {filtered.length === 0 ? 'No matching articles' : (
                  <>
                    Showing{' '}
                    <strong style={{ color: 'var(--text-primary)' }}>{pageItems.length}</strong>
                    {' '}of{' '}
                    <strong style={{ color: 'var(--text-primary)' }}>{filtered.length}</strong>
                    {' '}article{filtered.length !== 1 ? 's' : ''}
                  </>
                )}
              </p>
              {hasFilters && (
                <button
                  type="button"
                  onClick={clearFilters}
                  className="inline-flex items-center gap-1 font-medium hover:underline"
                  style={{ color: 'var(--accent)' }}
                >
                  <X className="w-3.5 h-3.5" /> Clear filters
                </button>
              )}
            </div>
          </>
        )}

        {/* ── Article Grid or Empty State ───────────────────────── */}
        {pageItems.length === 0 ? (
          <EmptyState hasFilters={!noPostsAtAll && hasFilters} onClear={clearFilters} />
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            {pageItems.map(article => (
              <ArticleCard
                key={`${article.id}-${article.slug}`}
                article={article}
                isPaid={isPaid}
                isLoggedIn={isLoggedIn}
                isFavorited={favorites.has(article.slug)}
                isLoadingFav={loadingFav === article.slug}
                onToggleFavorite={toggleFavorite}
              />
            ))}
          </div>
        )}

        {/* ── Pagination ────────────────────────────────────────── */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 mt-12 flex-wrap">
            <button
              type="button"
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-opacity disabled:opacity-30 hover:opacity-80"
              style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', color: 'var(--text-primary)' }}
            >
              <ChevronLeft className="w-4 h-4" /> Prev
            </button>

            {getPageNumbers().map((page, i) =>
              page === '...' ? (
                <span key={`ellipsis-${i}`} className="w-10 h-10 flex items-center justify-center text-sm" style={{ color: 'var(--text-muted)' }}>…</span>
              ) : (
                <button
                  key={page}
                  type="button"
                  onClick={() => setCurrentPage(page as number)}
                  className="w-10 h-10 rounded-lg text-sm font-semibold transition-all hover:opacity-80"
                  style={{
                    background: currentPage === page ? 'var(--btn-primary)' : 'var(--bg-card)',
                    border: `1px solid ${currentPage === page ? 'var(--btn-primary)' : 'var(--border)'}`,
                    color: currentPage === page ? '#fff' : 'var(--text-primary)',
                  }}
                >
                  {page}
                </button>
              )
            )}

            <button
              type="button"
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-opacity disabled:opacity-30 hover:opacity-80"
              style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', color: 'var(--text-primary)' }}
            >
              Next <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* ── Marketplace CTA ───────────────────────────────────── */}
        <MarketplaceCTA className="mt-14" />
      </div>
    </div>
  )
}

/* ── Article Card ─────────────────────────────────────────────── */
interface ArticleCardProps {
  article: ResourceArticle
  isPaid: boolean
  isLoggedIn: boolean
  isFavorited: boolean
  isLoadingFav: boolean
  onToggleFavorite: (article: ResourceArticle) => void
}

function ArticleCard({ article, isPaid, isLoggedIn, isFavorited, isLoadingFav, onToggleFavorite }: ArticleCardProps) {
  const isPremium = article.is_premium
  const href      = articleHref(article.slug)

  return (
    <div
      className="rounded-2xl overflow-hidden card-lift card-glow flex flex-col relative group"
      style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}
    >
      {/* Thumbnail */}
      <Link href={href} className="block relative h-48 flex-shrink-0 overflow-hidden" style={{ background: 'var(--bg-secondary)' }}>
        {article.image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={article.image}
            alt={article.title}
            loading="lazy"
            className={`w-full h-full object-cover transition-transform duration-500 group-hover:scale-105 ${isPremium && !isPaid ? 'blur-[6px] scale-110' : ''}`}
          />
        ) : (
          <div
            className="w-full h-full flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg, var(--accent-bg), var(--bg-secondary))' }}
          >
            <Anchor className="w-12 h-12 opacity-30" style={{ color: 'var(--accent)' }} />
          </div>
        )}

        {/* Category badge */}
        <span
          className="absolute top-3 left-3 px-2.5 py-1 rounded-full text-xs font-semibold z-10"
          style={{ background: 'rgba(0,0,0,0.55)', color: '#fff', backdropFilter: 'blur(4px)' }}
        >
          {article.category}
        </span>

        {/* Premium blur overlay */}
        {isPremium && !isPaid && (
          <div className="absolute inset-0 flex items-center justify-center z-10">
            <div
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold text-white"
              style={{ background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(4px)' }}
            >
              <Crown className="w-3.5 h-3.5 text-amber-400" />
              Premium Only
            </div>
          </div>
        )}
      </Link>

      {/* Action icons — top right of image */}
      <div className="absolute top-3 right-3 z-20 flex items-center gap-1.5">
        <button
          type="button"
          onClick={e => { e.stopPropagation(); onToggleFavorite(article) }}
          className="w-8 h-8 rounded-full flex items-center justify-center transition-all hover:scale-110 active:scale-95"
          style={{ background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)' }}
          title={isLoggedIn ? (isFavorited ? 'Remove from saved' : 'Save article') : 'Log in to save'}
          aria-label={isFavorited ? 'Remove from saved articles' : 'Save article'}
        >
          {isLoadingFav ? (
            <div className="w-3.5 h-3.5 rounded-full border border-white border-t-transparent animate-spin" />
          ) : (
            <Heart
              className="w-4 h-4 transition-colors"
              style={{ color: isFavorited ? '#f87171' : '#ffffff', fill: isFavorited ? '#f87171' : 'transparent' }}
            />
          )}
        </button>

        {isPremium && (
          <div
            className="flex items-center gap-1 px-2 py-1 rounded-full text-xs font-bold"
            style={{ background: 'rgba(245,158,11,0.92)', color: '#fff', backdropFilter: 'blur(4px)', letterSpacing: '0.02em' }}
            title="Premium content"
          >
            <Crown className="w-3 h-3" /> PRO
          </div>
        )}
      </div>

      {/* Body */}
      <Link href={href} className="p-5 flex flex-col flex-1" style={{ textDecoration: 'none' }}>
        <div className="flex items-center gap-2 mb-3 flex-wrap text-xs" style={{ color: 'var(--text-faint)' }}>
          {isPremium ? (
            <span
              className="px-2 py-0.5 rounded-full font-bold flex items-center gap-1"
              style={{ background: '#f59e0b22', color: '#f59e0b', border: '1px solid #f59e0b44' }}
            >
              <Crown className="w-3 h-3" /> Premium
            </span>
          ) : (
            <span
              className="px-2 py-0.5 rounded-full font-bold flex items-center gap-1"
              style={{ background: 'var(--accent-bg)', color: 'var(--accent)', border: '1px solid var(--border-hover)' }}
            >
              <CheckCircle2 className="w-3 h-3" /> Free
            </span>
          )}
          <span>{article.readTime} read</span>
        </div>

        <h2
          className="font-playfair text-xl font-bold mb-2 leading-snug"
          style={{ color: 'var(--text-primary)' }}
        >
          {article.title}
        </h2>
        <p className="text-sm mb-4 flex-1 line-clamp-2" style={{ color: 'var(--text-muted)' }}>
          {article.excerpt}
        </p>

        {/* Footer meta */}
        <div
          className="flex items-center justify-between text-xs pt-3"
          style={{ borderTop: '1px solid var(--border)' }}
        >
          <div className="flex items-center gap-2 min-w-0">
            <span
              className="w-[22px] h-[22px] rounded-full flex items-center justify-center flex-shrink-0"
              style={{ background: 'var(--accent-bg)', color: 'var(--accent)' }}
              aria-hidden
            >
              <Anchor className="w-3 h-3" />
            </span>
            <span className="truncate" style={{ color: 'var(--text-muted)', fontWeight: 500 }}>{DEFAULT_AUTHOR_NAME}</span>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <span className="flex items-center gap-1">
              <Eye className="w-3 h-3 flex-shrink-0" style={{ color: 'var(--text-faint)' }} />
              <span style={{ color: 'var(--text-faint)' }}>
                {article.views >= 1000 ? `${(article.views / 1000).toFixed(1)}k` : article.views}
              </span>
            </span>
            {article.date && (
              <>
                <span style={{ color: 'var(--text-faint)' }}>·</span>
                <span style={{ color: 'var(--text-faint)' }}>{article.date}</span>
              </>
            )}
          </div>
        </div>

        {/* Read More */}
        <div className="mt-3 flex items-center gap-1 text-sm font-semibold transition-opacity group-hover:opacity-80" style={{ color: 'var(--accent)' }}>
          {isPremium && !isPaid ? (
            <><Lock className="w-3.5 h-3.5" /> Unlock to Read</>
          ) : (
            <>Read article <span className="transition-transform group-hover:translate-x-1 inline-block">→</span></>
          )}
        </div>
      </Link>
    </div>
  )
}

/* ── Empty State ──────────────────────────────────────────────── */
function EmptyState({ hasFilters, onClear }: { hasFilters: boolean; onClear: () => void }) {
  return (
    <div
      className="flex flex-col items-center justify-center py-20 px-6 text-center rounded-2xl"
      style={{ background: 'var(--bg-card)', border: '1px dashed var(--border-hover)' }}
    >
      <div
        className="w-20 h-20 rounded-full flex items-center justify-center mb-6"
        style={{ background: 'var(--accent-bg)' }}
      >
        <BookOpen className="w-10 h-10" style={{ color: 'var(--accent)' }} />
      </div>
      <h2
        className="font-playfair text-2xl sm:text-3xl font-bold mb-3"
        style={{ color: 'var(--text-primary)' }}
      >
        {hasFilters ? 'No articles match your filters' : 'No articles yet — check back soon'}
      </h2>
      <p className="text-base max-w-lg leading-relaxed" style={{ color: 'var(--text-muted)' }}>
        {hasFilters
          ? 'Try a different search term or topic.'
          : 'Our editorial team is preparing guides on marine engines, ship machinery, maintenance, safety regulations and buying spare parts.'}
      </p>
      {hasFilters ? (
        <button
          type="button"
          onClick={onClear}
          className="mt-6 inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl text-sm font-semibold"
          style={{ background: 'var(--btn-primary)', color: '#fff' }}
        >
          <X className="w-4 h-4" /> Clear filters
        </button>
      ) : (
        <Link
          href="/listings"
          className="mt-6 inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl text-sm font-semibold"
          style={{ background: 'var(--btn-primary)', color: '#fff' }}
        >
          Browse spare parts <ChevronRight className="w-4 h-4" />
        </Link>
      )}
    </div>
  )
}
