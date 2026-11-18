'use client'
import { useCallback, useEffect, useState } from 'react'
import Link from 'next/link'
import { Plus, Eye, MessageSquare, Pencil, Trash2, CheckCircle2, EyeOff, RotateCcw, ExternalLink, Gem, Package } from 'lucide-react'
import CategoryIcon from '@/components/listings/CategoryIcon'
import { CATEGORY_BY_SLUG, LISTING_CREDIT_COST, LISTING_STATUS_LABEL, formatPrice } from '@/lib/listings-meta'

const STATUS_STYLE: Record<string, React.CSSProperties> = {
  active: { background: 'rgba(34,197,94,0.12)', color: '#15803d' },
  pending: { background: 'rgba(245,158,11,0.14)', color: '#b45309' },
  rejected: { background: 'rgba(239,68,68,0.12)', color: '#b91c1c' },
  sold: { background: 'rgba(10,31,51,0.1)', color: 'var(--text-primary)' },
  hidden: { background: 'rgba(100,116,139,0.14)', color: '#475569' },
}

export default function MyListingsPage() {
  const [data, setData] = useState<{ listings: any[]; profile: any; unreadInquiries: number } | null>(null)
  const [busy, setBusy] = useState<string | null>(null)
  const [notice, setNotice] = useState('')

  const load = useCallback(() => {
    fetch('/api/listings')
      .then((r) => r.json())
      .then((j) => setData({ listings: j.listings || [], profile: j.profile, unreadInquiries: j.unreadInquiries || 0 }))
      .catch(() => setData({ listings: [], profile: null, unreadInquiries: 0 }))
  }, [])

  useEffect(() => {
    load()
    const saved = new URLSearchParams(window.location.search).get('saved')
    if (saved === 'active') setNotice('Your listing is live on MarineYard.')
    else if (saved === 'pending') setNotice('Thanks! Your listing will go live as soon as a moderator approves it.')
    else if (saved === 'updated') setNotice('Changes saved.')
  }, [load])

  const act = async (id: string, action: string) => {
    setBusy(id)
    await fetch(`/api/listings/${id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action }) })
    setBusy(null)
    load()
  }
  const remove = async (id: string, title: string) => {
    if (!confirm(`Delete "${title}"? This can't be undone and the credits are not refunded.`)) return
    setBusy(id)
    await fetch(`/api/listings/${id}`, { method: 'DELETE' })
    setBusy(null)
    load()
  }

  if (!data) {
    return (
      <div className="py-8">
        <div className="w-8 h-8 border-4 border-t-transparent rounded-full animate-spin" style={{ borderColor: 'var(--accent)', borderTopColor: 'transparent' }} />
      </div>
    )
  }

  const credits = data.profile?.credits ?? 0
  const left = Math.floor(credits / LISTING_CREDIT_COST)
  const card = { background: 'var(--bg-card)', border: '1px solid var(--border)' }

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-4 mb-6">
        <div>
          <h1 className="font-playfair text-2xl sm:text-3xl font-bold" style={{ color: 'var(--text-primary)' }}>My listings</h1>
          <p className="text-sm mt-1 flex items-center gap-1.5" style={{ color: 'var(--text-muted)' }}>
            <Gem className="w-4 h-4" style={{ color: 'var(--accent)' }} /> {credits} credits · {left} listing{left === 1 ? '' : 's'} left
            {left < 2 && <Link href="/pricing" className="ml-1 underline font-semibold" style={{ color: 'var(--accent)' }}>Get more</Link>}
          </p>
        </div>
        <div className="flex gap-2">
          <Link href="/dashboard/inquiries" className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full text-sm font-semibold" style={{ ...card, color: 'var(--text-primary)' }}>
            <MessageSquare className="w-4 h-4" /> Inquiries
            {data.unreadInquiries > 0 && <span className="px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-red-500 text-white">{data.unreadInquiries}</span>}
          </Link>
          <Link href="/dashboard/listings/new" className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full text-sm font-semibold text-white" style={{ background: 'var(--btn-primary)' }}>
            <Plus className="w-4 h-4" /> New listing
          </Link>
        </div>
      </div>

      {notice && (
        <div className="mb-5 flex items-center gap-2 p-4 rounded-2xl text-sm" style={{ background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.35)', color: 'var(--text-primary)' }}>
          <CheckCircle2 className="w-5 h-5 text-green-600" /> {notice}
        </div>
      )}

      {data.listings.length === 0 ? (
        <div className="rounded-3xl px-6 py-16 text-center" style={{ ...card, borderStyle: 'dashed' }}>
          <Package className="w-12 h-12 mx-auto mb-4" style={{ color: 'var(--accent)' }} />
          <h2 className="font-playfair text-2xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>No listings yet</h2>
          <p className="text-sm max-w-md mx-auto mb-6" style={{ color: 'var(--text-muted)' }}>
            Turn surplus spares into cash. Your free account can publish {left} listing{left === 1 ? '' : 's'} right now.
          </p>
          <Link href="/dashboard/listings/new" className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold text-white" style={{ background: 'var(--btn-primary)' }}>
            <Plus className="w-4 h-4" /> List your first part
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {data.listings.map((l) => (
            <div key={l.id} className="rounded-2xl p-3 sm:p-4 flex flex-col sm:flex-row gap-4" style={{ ...card, opacity: busy === l.id ? 0.6 : 1 }}>
              <div className="w-full sm:w-32 h-40 sm:h-24 rounded-xl overflow-hidden flex-shrink-0 flex items-center justify-center" style={{ background: 'linear-gradient(135deg,#0b2a4a,#0b6aa8)' }}>
                {l.images?.[0] ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={l.images[0]} alt="" className="w-full h-full object-cover" />
                ) : (
                  <CategoryIcon slug={l.category} className="w-8 h-8" style={{ color: '#bfe3f7' }} />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2 mb-1">
                  <span className="px-2 py-0.5 rounded-full text-[11px] font-bold" style={STATUS_STYLE[l.status]}>{LISTING_STATUS_LABEL[l.status] || l.status}</span>
                  <span className="text-xs" style={{ color: 'var(--text-faint)' }}>{CATEGORY_BY_SLUG[l.category]?.name}</span>
                </div>
                <h3 className="font-semibold truncate" style={{ color: 'var(--text-primary)' }}>{l.title}</h3>
                <p className="text-sm" style={{ color: 'var(--text-muted)' }}>{formatPrice(l)} · {[l.city, l.country].filter(Boolean).join(', ')}</p>
                {l.status === 'rejected' && l.reject_reason && (
                  <p className="text-xs mt-1 text-red-600">Moderator note: {l.reject_reason} — edit the listing to send it for review again.</p>
                )}
                <div className="flex items-center gap-4 text-xs mt-2" style={{ color: 'var(--text-faint)' }}>
                  <span className="inline-flex items-center gap-1"><Eye className="w-3.5 h-3.5" /> {l.views}</span>
                  <span className="inline-flex items-center gap-1"><MessageSquare className="w-3.5 h-3.5" /> {l.inquiries}</span>
                  <span>{new Date(l.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                </div>
              </div>
              <div className="flex sm:flex-col flex-wrap gap-1.5 sm:items-end">
                <Link href={`/listings/${l.slug}`} target="_blank" className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium" style={{ color: 'var(--accent)', background: 'var(--accent-bg)' }}><ExternalLink className="w-3.5 h-3.5" /> View</Link>
                <Link href={`/dashboard/listings/${l.id}/edit`} className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium" style={{ color: 'var(--text-primary)', border: '1px solid var(--border)' }}><Pencil className="w-3.5 h-3.5" /> Edit</Link>
                {l.status === 'active' && (
                  <>
                    <button onClick={() => act(l.id, 'mark-sold')} className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium" style={{ color: 'var(--text-primary)', border: '1px solid var(--border)' }}><CheckCircle2 className="w-3.5 h-3.5" /> Mark sold</button>
                    <button onClick={() => act(l.id, 'hide')} className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium" style={{ color: 'var(--text-primary)', border: '1px solid var(--border)' }}><EyeOff className="w-3.5 h-3.5" /> Hide</button>
                  </>
                )}
                {l.status === 'hidden' && <button onClick={() => act(l.id, 'unhide')} className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium" style={{ color: 'var(--text-primary)', border: '1px solid var(--border)' }}><RotateCcw className="w-3.5 h-3.5" /> Show again</button>}
                {l.status === 'sold' && <button onClick={() => act(l.id, 'relist')} className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium" style={{ color: 'var(--text-primary)', border: '1px solid var(--border)' }}><RotateCcw className="w-3.5 h-3.5" /> Relist</button>}
                <button onClick={() => remove(l.id, l.title)} className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium text-red-600" style={{ border: '1px solid rgba(239,68,68,0.3)' }}><Trash2 className="w-3.5 h-3.5" /> Delete</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
