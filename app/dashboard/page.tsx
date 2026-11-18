'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { PlusCircle, Package, Gem, Eye, MessageSquare, ArrowRight, Crown, Anchor } from 'lucide-react'
import CategoryIcon from '@/components/listings/CategoryIcon'
import { LISTING_CREDIT_COST, LISTING_STATUS_LABEL, formatPrice } from '@/lib/listings-meta'

export default function DashboardPage() {
  const [data, setData] = useState<{ listings: any[]; profile: any; unreadInquiries: number } | null>(null)

  useEffect(() => {
    fetch('/api/listings')
      .then((r) => r.json())
      .then((j) => setData({ listings: j.listings || [], profile: j.profile, unreadInquiries: j.unreadInquiries || 0 }))
      .catch(() => setData({ listings: [], profile: null, unreadInquiries: 0 }))
  }, [])

  const profile = data?.profile
  const listings = data?.listings ?? []
  const credits = profile?.credits ?? 0
  const plan = profile?.plan ?? 'free'
  const maxCredits = plan === 'pro' ? 1200 : plan === 'explorer' ? 550 : plan === 'starter' ? 120 : 90
  const pct = Math.max(0, Math.min(100, (credits / maxCredits) * 100))
  const planLabel = plan === 'pro' ? 'Pro' : plan === 'explorer' ? 'Explorer' : plan === 'starter' ? 'Starter' : 'Free'
  const planColor = plan === 'pro' ? '#f59e0b' : plan === 'explorer' ? '#8b5cf6' : plan === 'starter' ? '#3b82f6' : 'var(--accent)'
  const live = listings.filter((l) => l.status === 'active').length
  const views = listings.reduce((s, l) => s + (l.views || 0), 0)
  const inquiries = listings.reduce((s, l) => s + (l.inquiries || 0), 0)
  const left = Math.floor(credits / LISTING_CREDIT_COST)

  const stats = [
    { label: 'Live listings', value: live, icon: <Package className="w-5 h-5" />, color: '#0891b2', bg: '#0891b218', sub: `${listings.length} in total` },
    { label: 'Listings left', value: left, icon: <Gem className="w-5 h-5" />, color: 'var(--accent)', bg: 'var(--accent-bg)', sub: `${credits} credits` },
    { label: 'Listing views', value: views, icon: <Eye className="w-5 h-5" />, color: '#8b5cf6', bg: '#8b5cf618', sub: 'all time' },
    { label: 'Buyer inquiries', value: inquiries, icon: <MessageSquare className="w-5 h-5" />, color: '#f59e0b', bg: '#f59e0b18', sub: data?.unreadInquiries ? `${data.unreadInquiries} unread` : 'all read' },
  ]

  const card = { background: 'var(--bg-card)', border: '1px solid var(--border)' }

  return (
    <>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        {stats.map((s) => (
          <div key={s.label} className="p-4 rounded-2xl" style={card}>
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs font-medium leading-tight" style={{ color: 'var(--text-faint)' }}>{s.label}</p>
              <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: s.bg, color: s.color }}>{s.icon}</div>
            </div>
            <p className="font-playfair text-3xl font-bold" style={{ color: s.color }}>{data ? s.value.toLocaleString('en-US') : '—'}</p>
            <p className="text-xs mt-1" style={{ color: 'var(--text-faint)' }}>{s.sub}</p>
          </div>
        ))}
      </div>

      <div className="p-5 rounded-2xl mb-6" style={card}>
        <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <Gem className="w-4 h-4" style={{ color: 'var(--accent)' }} />
            <span className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>Listing credits</span>
            <span className="text-xs px-2 py-0.5 rounded-full font-medium" style={{ background: planColor + '20', color: planColor }}>{planLabel} Plan</span>
          </div>
          <span className="text-xs font-medium" style={{ color: 'var(--text-muted)' }}>
            {credits} credits · {LISTING_CREDIT_COST} per listing
          </span>
        </div>
        <div className="h-2.5 rounded-full" style={{ background: 'var(--bg-secondary)' }}>
          <div className="h-full rounded-full transition-all duration-500" style={{ width: `${pct}%`, background: credits >= 30 ? 'var(--accent)' : credits >= LISTING_CREDIT_COST ? '#f59e0b' : '#ef4444' }} />
        </div>
        {credits < 30 && data && (
          <p className="text-xs mt-2" style={{ color: credits < LISTING_CREDIT_COST ? '#ef4444' : '#f59e0b' }}>
            {credits < LISTING_CREDIT_COST ? 'No listing credits left.' : 'Running low.'}{' '}
            <Link href="/pricing" className="underline font-semibold">Upgrade plan →</Link>
          </p>
        )}
      </div>

      <h2 className="font-semibold text-base mb-3" style={{ color: 'var(--text-primary)' }}>Quick actions</h2>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
        {[
          { href: '/dashboard/listings/new', icon: <PlusCircle className="w-6 h-6" />, label: 'New listing', desc: 'Sell a part or equipment', color: 'var(--accent)', bg: 'var(--accent-bg)' },
          { href: '/listings', icon: <Anchor className="w-6 h-6" />, label: 'Browse marketplace', desc: 'Find parts from sellers worldwide', color: '#0891b2', bg: '#0891b218' },
          { href: '/pricing', icon: <Crown className="w-6 h-6" />, label: 'Upgrade plan', desc: 'More listings & featured placement', color: '#f59e0b', bg: '#f59e0b18' },
        ].map((a) => (
          <Link key={a.label} href={a.href} className="flex items-center gap-4 p-4 rounded-2xl transition-all hover:scale-[1.02] group" style={card}>
            <div className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: a.bg, color: a.color }}>{a.icon}</div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>{a.label}</p>
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{a.desc}</p>
            </div>
            <ArrowRight className="w-4 h-4 flex-shrink-0 group-hover:translate-x-1 transition-transform" style={{ color: 'var(--text-faint)' }} />
          </Link>
        ))}
      </div>

      <h2 className="font-semibold text-base mb-3" style={{ color: 'var(--text-primary)' }}>Recent listings</h2>
      <div className="rounded-2xl mb-6 overflow-hidden" style={card}>
        {listings.length === 0 ? (
          <div className="p-8 text-center">
            <Package className="w-10 h-10 mx-auto mb-3" style={{ color: 'var(--accent)' }} />
            <p className="text-sm font-medium mb-1" style={{ color: 'var(--text-primary)' }}>No listings yet</p>
            <p className="text-xs mb-4" style={{ color: 'var(--text-faint)' }}>Your free account can publish {left || 9} listings.</p>
            <Link href="/dashboard/listings/new" className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold" style={{ background: 'var(--accent)', color: '#fff' }}>
              <PlusCircle className="w-4 h-4" /> List your first part
            </Link>
          </div>
        ) : (
          <>
            {listings.slice(0, 4).map((l, i) => (
              <Link key={l.id} href={`/dashboard/listings/${l.id}/edit`} className="flex items-center gap-4 px-5 py-4 hover:opacity-90" style={{ borderBottom: i < Math.min(listings.length, 4) - 1 ? '1px solid var(--border)' : 'none' }}>
                <div className="w-12 h-12 rounded-xl overflow-hidden flex items-center justify-center flex-shrink-0" style={{ background: 'linear-gradient(135deg,#0b2a4a,#0b6aa8)' }}>
                  {l.images?.[0] ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={l.images[0]} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <CategoryIcon slug={l.category} className="w-5 h-5" style={{ color: '#bfe3f7' }} />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm truncate" style={{ color: 'var(--text-primary)' }}>{l.title}</p>
                  <p className="text-xs truncate" style={{ color: 'var(--text-faint)' }}>{formatPrice(l)} · {l.views} views · {l.inquiries} inquiries</p>
                </div>
                <span className="px-2 py-1 rounded-full text-xs font-semibold flex-shrink-0" style={{ background: 'var(--accent-bg)', color: 'var(--accent)' }}>
                  {LISTING_STATUS_LABEL[l.status] || l.status}
                </span>
              </Link>
            ))}
            <div className="px-5 py-3" style={{ borderTop: '1px solid var(--border)' }}>
              <Link href="/dashboard/listings" className="text-sm font-semibold flex items-center gap-1" style={{ color: 'var(--accent)' }}>
                Manage all listings <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
          </>
        )}
      </div>

      {plan === 'free' && (
        <div className="relative p-5 rounded-2xl overflow-hidden" style={{ background: 'linear-gradient(135deg, #0a5c9e 0%, #0891b2 100%)' }}>
          <Anchor className="absolute right-4 top-3 w-14 h-14 opacity-15 text-white" />
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div>
              <p className="font-bold text-white text-base mb-1">Sell more, get seen first</p>
              <p className="text-sm text-white/85">Paid plans add 12–120 listings every month, featured placement and priority support.</p>
            </div>
            <Link href="/pricing" className="flex-shrink-0 px-5 py-2.5 rounded-xl font-semibold text-sm hover:opacity-90 transition-opacity" style={{ background: '#fff', color: '#0a5c9e' }}>
              View plans →
            </Link>
          </div>
        </div>
      )}
    </>
  )
}
