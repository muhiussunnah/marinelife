'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
// NOTE: Recent + Popular thumbnails intentionally use raw <img>, not
// next/image. next/image refuses to load any hostname not listed in
// next.config.js images.remotePatterns and silently renders nothing for the
// rest, which breaks Writerfy posts whose featured image lives on an external
// CDN. Raw <img> works for every domain, matching the /resources cards.
import {
  Search, TrendingUp, Clock, Eye, ChevronRight, Anchor,
} from 'lucide-react'
import AdSlot from '@/components/adify/AdSlot'
import EzoicSlot from '@/components/adify/EzoicSlot'
import MarketplaceCTA from '@/components/blog/MarketplaceCTA'
import { DEFAULT_AUTHOR_NAME } from '@/lib/content-helpers'
// TableOfContents removed from sidebar — now auto-injected inside article content

type SidebarPost = { title: string; slug: string; image: string; views?: number; date?: string }

function formatViews(n: number) {
  return n >= 1000 ? `${(n / 1000).toFixed(1)}k` : String(n)
}

/** Thumbnail with an anchor placeholder for posts without a featured image. */
function Thumb({ src, alt }: { src: string; alt: string }) {
  return (
    <div
      className="flex-shrink-0 rounded-lg overflow-hidden flex items-center justify-center"
      style={{ width: 52, height: 44, background: 'var(--bg-secondary)' }}
    >
      {src ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={src} alt={alt} width={52} height={44} className="w-full h-full object-cover" loading="lazy" />
      ) : (
        <Anchor className="w-4 h-4 opacity-40" style={{ color: 'var(--accent)' }} />
      )}
    </div>
  )
}

// Skeleton rows used while data is loading
function SidebarSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <ul>
      {Array.from({ length: rows }).map((_, i) => (
        <li key={i} className="flex items-center gap-3 px-3 py-2.5" style={{ borderBottom: '1px solid var(--border)' }}>
          <div className="flex-shrink-0 rounded-lg animate-pulse" style={{ width: 52, height: 44, background: 'var(--bg-secondary)' }} />
          <div className="flex-1 min-w-0 space-y-2">
            <div className="h-3 rounded-full animate-pulse" style={{ background: 'var(--bg-secondary)', width: '90%' }} />
            <div className="h-2.5 rounded-full animate-pulse" style={{ background: 'var(--bg-secondary)', width: '40%' }} />
          </div>
        </li>
      ))}
    </ul>
  )
}

// ── Main Sidebar ─────────────────────────────────────────────────────────────
export default function BlogSidebar() {
  const [query, setQuery] = useState('')
  const [popular, setPopular] = useState<SidebarPost[]>([])
  const [recent, setRecent] = useState<SidebarPost[]>([])
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    let cancelled = false
    const load = async () => {
      const data = await fetch('/api/blog/sidebar').then(r => r.json()).catch(() => ({}))
      const popularList: SidebarPost[] = Array.isArray(data?.popular) ? data.popular.slice(0, 10) : []
      const recentList: SidebarPost[] = Array.isArray(data?.recent) ? data.recent.slice(0, 10) : []

      // Overlay real view counts from the page_views table.
      let realViews: Record<string, number> = {}
      if (popularList.length) {
        const slugs = popularList.map(p => p.slug).join(',')
        realViews = await fetch(`/api/views?slugs=${encodeURIComponent(slugs)}`)
          .then(r => r.json())
          .then(d => d.views || {})
          .catch(() => ({}))
      }
      if (cancelled) return
      setPopular(popularList.map(p => (realViews[p.slug] !== undefined ? { ...p, views: realViews[p.slug] } : p)))
      setRecent(recentList)
    }
    load().catch(() => {}).finally(() => { if (!cancelled) setLoaded(true) })
    return () => { cancelled = true }
  }, [])

  const q = query.trim().toLowerCase()
  const filteredPopular = q ? popular.filter(p => p.title.toLowerCase().includes(q)) : popular
  const filteredRecent = q ? recent.filter(p => p.title.toLowerCase().includes(q)) : recent
  const emptyLabel = q ? 'No articles found' : 'No articles yet — check back soon'

  return (
    // self-stretch: the aside matches the (much taller) article column, so
    // the sticky lower card can ride down the empty rail as the reader
    // scrolls, stopping automatically at the column's end.
    <aside className="hidden lg:block w-[272px] xl:w-[292px] flex-shrink-0 self-stretch">

        {/* 1. Search */}
        <div className="relative mb-4">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none"
            style={{ color: 'var(--text-faint)' }}
          />
          <input
            type="text"
            placeholder="Search articles…"
            value={query}
            onChange={e => setQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2.5 rounded-xl text-sm outline-none transition-colors"
            style={{
              background: 'var(--bg-card)',
              border: '1px solid var(--border)',
              color: 'var(--text-primary)',
            }}
            onFocus={e => (e.currentTarget.style.borderColor = 'var(--accent)')}
            onBlur={e => (e.currentTarget.style.borderColor = 'var(--border)')}
            aria-label="Search articles"
          />
        </div>

        {/* 2. About the editorial team */}
        <div
          className="rounded-xl overflow-hidden mb-5"
          style={{ border: '1px solid var(--border)', background: 'var(--bg-card)' }}
        >
          <div
            className="flex items-center justify-center"
            style={{ height: 120, background: 'linear-gradient(135deg, var(--accent-bg), var(--bg-secondary))' }}
          >
            <div
              className="rounded-full flex items-center justify-center"
              style={{
                width: 76,
                height: 76,
                background: 'var(--bg-card)',
                border: '3px solid var(--border-hover)',
                color: 'var(--accent)',
                boxShadow: '0 6px 20px var(--shadow)',
              }}
              aria-hidden
            >
              <Anchor className="w-9 h-9" />
            </div>
          </div>
          <div className="px-4 pt-3.5 pb-4 text-center">
            <h3 className="font-bold text-[15px] mb-2" style={{ color: 'var(--text-primary)' }}>
              {DEFAULT_AUTHOR_NAME}
            </h3>
            <p className="text-xs leading-relaxed mb-3.5" style={{ color: 'var(--text-muted)' }}>
              Marine engineers and industry writers covering ship machinery, maintenance,
              regulations and how to source the right spare parts.
            </p>
            <Link
              href="/about"
              className="inline-flex items-center gap-1.5 text-xs font-semibold px-4 py-2 rounded-lg transition-all hover:brightness-110"
              style={{ background: 'var(--accent-bg)', color: 'var(--accent)' }}
            >
              About MarineYard
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {/* Adify — sidebar ad #1 (after search + author) */}
        <AdSlot placement="sidebar" index={0} spaced={false} className="mb-5" />
        <EzoicSlot />

        {/* 3. Popular articles */}
        <div
          className="rounded-xl overflow-hidden mb-5"
          style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}
        >
          <div
            className="flex items-center gap-2 px-4 py-3"
            style={{ borderBottom: '1px solid var(--border)' }}
          >
            <TrendingUp className="w-4 h-4 flex-shrink-0" style={{ color: 'var(--accent)' }} />
            <span className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>
              Popular Articles
            </span>
          </div>
          {!loaded ? <SidebarSkeleton rows={5} /> : (
            <ul>
              {filteredPopular.map((post, i) => (
                <li key={post.slug} style={{ borderBottom: '1px solid var(--border)' }}>
                  <Link href={post.slug} className="flex items-center gap-3 px-3 py-2.5 transition-colors">
                    <Thumb src={post.image} alt={post.title} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start gap-1.5 mb-1">
                        <span className="text-xs font-bold flex-shrink-0" style={{ color: 'var(--accent)', opacity: 0.8 }}>
                          {String(i + 1).padStart(2, '0')}
                        </span>
                        <p className="text-xs leading-snug line-clamp-2" style={{ color: 'var(--text-primary)' }}>
                          {post.title}
                        </p>
                      </div>
                      <div className="flex items-center gap-1">
                        <Eye className="w-3 h-3 flex-shrink-0" style={{ color: 'var(--text-faint)' }} />
                        <span className="text-xs" style={{ color: 'var(--text-faint)' }}>{formatViews(post.views || 0)} views</span>
                      </div>
                    </div>
                  </Link>
                </li>
              ))}
              {filteredPopular.length === 0 && (
                <li className="px-4 py-4 text-xs text-center" style={{ color: 'var(--text-faint)' }}>{emptyLabel}</li>
              )}
            </ul>
          )}
        </div>

        {/* 4. Recent articles */}
        <div
          className="rounded-xl overflow-hidden mb-5"
          style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}
        >
          <div
            className="flex items-center gap-2 px-4 py-3"
            style={{ borderBottom: '1px solid var(--border)' }}
          >
            <Clock className="w-4 h-4 flex-shrink-0" style={{ color: 'var(--accent)' }} />
            <span className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>
              Recent Articles
            </span>
          </div>
          {!loaded ? <SidebarSkeleton rows={5} /> : (
            <ul>
              {filteredRecent.map((post) => (
                <li key={post.slug} style={{ borderBottom: '1px solid var(--border)' }}>
                  <Link href={post.slug} className="flex items-center gap-3 px-3 py-2.5 transition-colors">
                    <Thumb src={post.image} alt={post.title} />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs leading-snug line-clamp-2 mb-1" style={{ color: 'var(--text-primary)' }}>
                        {post.title}
                      </p>
                      {post.date && (
                        <div className="flex items-center gap-1">
                          <Clock className="w-3 h-3 flex-shrink-0" style={{ color: 'var(--text-faint)' }} />
                          <span className="text-xs" style={{ color: 'var(--text-faint)' }}>{post.date}</span>
                        </div>
                      )}
                    </div>
                  </Link>
                </li>
              ))}
              {filteredRecent.length === 0 && (
                <li className="px-4 py-4 text-xs text-center" style={{ color: 'var(--text-faint)' }}>{emptyLabel}</li>
              )}
            </ul>
          )}
          <Link
            href="/resources"
            className="flex items-center justify-center gap-1 px-4 py-2.5 text-xs font-semibold"
            style={{ color: 'var(--accent)' }}
          >
            All resources <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Adify — sidebar ad #2 (below Recent). allowSticky: when the
            unit's Sticky flag is on it follows the scroll down the rail. */}
        <AdSlot placement="sidebar" index={1} spaced={false} className="mb-5" allowSticky />
        <EzoicSlot />

        {/* 5. Marketplace CTA: sticks while the article scrolls */}
        <div className="lg:sticky lg:top-24 mt-5">
          <MarketplaceCTA variant="compact" />
        </div>
    </aside>
  )
}
