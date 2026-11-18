import Link from 'next/link'
import { Anchor, ArrowRight, Package } from 'lucide-react'

/**
 * Small marketplace call-to-action for the Resources section.
 *
 *   variant="inline"  → full-width card (article footer, Resources page,
 *                       and the `[marketplace-cta]` shortcode in post HTML)
 *   variant="compact" → narrow card for the article sidebar
 *
 * Colours come from the theme CSS variables only. The card can be rendered
 * inside `.rich-content` (via the shortcode), whose global rules force
 * `color … !important` on <a>, <p> and <span>; the scoped <style> below keeps
 * the buttons readable there, and the text uses <div>s instead of <p>/<span>.
 */
const CTA_CSS = `
.marine-cta a.marine-cta-btn,
.rich-content .marine-cta a.marine-cta-btn { color: #fff !important; text-decoration: none !important; }
.marine-cta a.marine-cta-btn:hover { background: var(--btn-hover) !important; }
.marine-cta a.marine-cta-alt,
.rich-content .marine-cta a.marine-cta-alt { color: var(--accent) !important; text-decoration: none !important; }
.marine-cta a.marine-cta-alt:hover { border-color: var(--accent) !important; }
`

export default function MarketplaceCTA({
  variant = 'inline',
  className = '',
}: {
  variant?: 'inline' | 'compact'
  className?: string
}) {
  const compact = variant === 'compact'

  return (
    <aside
      className={`marine-cta not-prose rounded-2xl ${compact ? 'p-4' : 'p-5 sm:p-6'} ${className}`}
      style={{
        background: 'linear-gradient(135deg, var(--accent-bg), var(--bg-card))',
        border: '1px solid var(--border-hover)',
        boxShadow: '0 4px 20px var(--shadow)',
      }}
      aria-label="Sell or buy marine spare parts on MarineYard"
    >
      <style dangerouslySetInnerHTML={{ __html: CTA_CSS }} />

      <div className={compact ? 'flex flex-col gap-3' : 'flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6'}>
        <div
          className="flex-shrink-0 flex items-center justify-center rounded-xl"
          style={{
            width: compact ? 40 : 52,
            height: compact ? 40 : 52,
            background: 'var(--accent-bg)',
            border: '1px solid var(--border-hover)',
            color: 'var(--accent)',
          }}
          aria-hidden
        >
          <Anchor className={compact ? 'w-5 h-5' : 'w-6 h-6'} />
        </div>

        <div className="flex-1 min-w-0">
          <div
            className="text-[11px] font-bold uppercase tracking-wider mb-1"
            style={{ color: 'var(--accent)' }}
          >
            MarineYard Marketplace
          </div>
          <div
            className={`font-bold leading-snug ${compact ? 'text-sm' : 'text-lg sm:text-xl'}`}
            style={{ color: 'var(--text-primary)' }}
          >
            Have spare parts on board? List them free on MarineYard
          </div>
          <div
            className={`mt-1.5 leading-relaxed ${compact ? 'text-xs' : 'text-sm'}`}
            style={{ color: 'var(--text-muted)' }}
          >
            Reach ship owners, superintendents and engineers worldwide looking for
            engine, pump, deck and electrical spares.
          </div>
        </div>

        <div className={compact ? 'flex flex-col gap-2' : 'flex flex-col sm:flex-row gap-2 sm:flex-shrink-0'}>
          <Link
            href="/dashboard/listings/new"
            className="marine-cta-btn inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl text-sm font-semibold transition-colors"
            style={{ background: 'var(--btn-primary)', color: '#fff', whiteSpace: 'nowrap' }}
          >
            List parts free
            <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            href="/listings"
            className="marine-cta-alt inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl text-sm font-semibold transition-colors"
            style={{
              background: 'var(--bg-card)',
              border: '1px solid var(--border-hover)',
              color: 'var(--accent)',
              whiteSpace: 'nowrap',
            }}
          >
            <Package className="w-4 h-4" />
            Browse parts
          </Link>
        </div>
      </div>
    </aside>
  )
}
