import Link from 'next/link'
import { MapPin, Star, Crown } from 'lucide-react'
import CategoryIcon from './CategoryIcon'
import { CATEGORY_BY_SLUG, CONDITION_LABEL, formatPrice, timeAgo, type PublicListing } from '@/lib/listings-meta'

/** Marketplace card — used on /listings, the homepage and related listings. */
export default function ListingCard({ listing, compact = false }: { listing: PublicListing; compact?: boolean }) {
  const cover = listing.images?.[0]
  const cat = CATEGORY_BY_SLUG[listing.category]
  const top = listing.priority >= 2
  const featured = listing.priority >= 1
  return (
    <Link
      href={`/listings/${listing.slug}`}
      className="group my-card flex flex-col rounded-2xl overflow-hidden card-lift h-full"
      style={{
        background: 'var(--bg-card)',
        border: featured ? '1.5px solid rgba(245,158,11,0.55)' : '1px solid var(--border)',
        boxShadow: featured ? '0 10px 30px -18px rgba(245,158,11,0.6)' : undefined,
      }}
    >
      <div className="relative aspect-[4/3] overflow-hidden" style={{ background: 'linear-gradient(135deg,#0b2a4a,#0b6aa8)' }}>
        {cover ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={cover}
            alt={listing.title}
            loading="lazy"
            className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <CategoryIcon slug={listing.category} className="w-14 h-14 opacity-80" style={{ color: '#bfe3f7' }} />
          </div>
        )}
        <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
          {top ? (
            <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide" style={{ background: '#f59e0b', color: '#1f1300' }}>
              <Crown className="w-3 h-3" /> Top
            </span>
          ) : featured ? (
            <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide" style={{ background: '#fbbf24', color: '#1f1300' }}>
              <Star className="w-3 h-3" /> Featured
            </span>
          ) : null}
          {listing.status === 'sold' && (
            <span className="px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide" style={{ background: '#0a1f33', color: '#fff' }}>
              Sold
            </span>
          )}
        </div>
        <span
          className="absolute bottom-3 left-3 px-2 py-1 rounded-md text-[11px] font-semibold backdrop-blur"
          style={{ background: 'rgba(10,31,51,0.72)', color: '#eaf3fb' }}
        >
          {CONDITION_LABEL[listing.condition] || listing.condition}
        </span>
      </div>
      <div className="flex flex-col flex-1 p-4">
        <div className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide mb-1.5" style={{ color: 'var(--accent)' }}>
          <CategoryIcon slug={listing.category} className="w-3.5 h-3.5" />
          <span className="truncate">{cat?.name || 'Marine equipment'}</span>
        </div>
        <h3 className="font-semibold leading-snug line-clamp-2 mb-1" style={{ color: 'var(--text-primary)' }}>
          {listing.title}
        </h3>
        {!compact && (listing.brand || listing.model || listing.part_number) && (
          <p className="text-xs truncate mb-2" style={{ color: 'var(--text-muted)' }}>
            {[listing.brand, listing.model, listing.part_number && `P/N ${listing.part_number}`].filter(Boolean).join(' · ')}
          </p>
        )}
        <div className="mt-auto pt-3 flex items-end justify-between gap-2" style={{ borderTop: '1px dashed var(--border)' }}>
          <div className="min-w-0">
            <p className="text-lg font-bold leading-tight" style={{ color: listing.price_on_request ? 'var(--text-muted)' : 'var(--text-primary)', fontSize: listing.price_on_request ? '0.95rem' : undefined }}>
              {formatPrice(listing)}
            </p>
            <p className="flex items-center gap-1 text-xs mt-0.5 truncate" style={{ color: 'var(--text-muted)' }}>
              <MapPin className="w-3 h-3 flex-shrink-0" />
              {[listing.city, listing.country].filter(Boolean).join(', ')}
            </p>
          </div>
          <span className="text-[11px] whitespace-nowrap" style={{ color: 'var(--text-faint)' }}>
            {timeAgo(listing.published_at || listing.created_at)}
          </span>
        </div>
      </div>
    </Link>
  )
}
