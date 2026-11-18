'use client'

import { useCallback, useEffect, useState } from 'react'
import Link from 'next/link'
import { Anchor, Check, X, Star, Trash2, EyeOff, Loader2, Search, ExternalLink } from 'lucide-react'
import { useTheme } from '@/components/providers/ThemeProvider'
import { useModal } from '@/components/admin/AdminModal'
import { CATEGORY_BY_SLUG, LISTING_STATUS_LABEL, formatPrice } from '@/lib/listings-meta'

const TABS = [
  { key: '', label: 'All' },
  { key: 'pending', label: 'Pending' },
  { key: 'active', label: 'Live' },
  { key: 'rejected', label: 'Rejected' },
  { key: 'hidden', label: 'Hidden' },
  { key: 'sold', label: 'Sold' },
]

export default function AdminListingsPage() {
  const { theme } = useTheme()
  const dark = theme === 'dark'
  const { showConfirm, showPrompt } = useModal()
  const [status, setStatus] = useState('')
  const [q, setQ] = useState('')
  const [query, setQuery] = useState('')
  const [data, setData] = useState<{ listings: any[]; total: number; counts: Record<string, number>; autoApprove: boolean } | null>(null)
  const [busy, setBusy] = useState<string | null>(null)
  const [error, setError] = useState('')

  const load = useCallback(async () => {
    setError('')
    const p = new URLSearchParams()
    if (status) p.set('status', status)
    if (query) p.set('q', query)
    const res = await fetch(`/api/admin/listings?${p}`)
    const json = await res.json().catch(() => ({}))
    if (!res.ok) {
      setError(json.error || 'Failed to load')
      return
    }
    setData(json)
  }, [status, query])

  useEffect(() => {
    load()
  }, [load])

  const patch = async (body: any) => {
    setBusy(body.id || 'setting')
    const res = await fetch('/api/admin/listings', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
    if (!res.ok) setError((await res.json().catch(() => ({}))).error || 'Update failed')
    setBusy(null)
    load()
  }

  const reject = async (id: string) => {
    const reason = await showPrompt('Reject listing', 'Reason shown to the seller (optional):', { placeholder: 'e.g. Please add real photos of the item' })
    if (reason === null) return
    patch({ id, status: 'rejected', reject_reason: reason })
  }

  const remove = async (id: string, title: string) => {
    const ok = await showConfirm('Delete listing?', `"${title}" will be removed permanently.`)
    if (!ok) return
    setBusy(id)
    await fetch(`/api/admin/listings?id=${id}`, { method: 'DELETE' })
    setBusy(null)
    load()
  }

  const card = dark ? 'bg-[#0c1120] border-white/[0.06]' : 'bg-white border-slate-200'
  const text = dark ? 'text-white' : 'text-slate-900'
  const muted = dark ? 'text-slate-400' : 'text-slate-500'

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-6xl">
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-sky-500/10 flex items-center justify-center"><Anchor className="w-5 h-5 text-sky-500" /></div>
          <div>
            <h1 className={`text-xl font-bold ${text}`}>Marketplace listings</h1>
            <p className={`text-sm ${muted}`}>Approve, feature, hide or remove what members list.</p>
          </div>
        </div>
        {data && (
          <label className={`flex items-center gap-3 px-4 py-2.5 rounded-xl border ${card} cursor-pointer`}>
            <input
              type="checkbox"
              checked={data.autoApprove}
              disabled={busy === 'setting'}
              onChange={(e) => patch({ autoApprove: e.target.checked })}
              className="w-4 h-4 accent-sky-600"
            />
            <span className={`text-sm ${text}`}>
              Publish free listings instantly
              <span className={`block text-xs ${muted}`}>Off = free accounts wait for your approval (paid plans always go live)</span>
            </span>
          </label>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-2 mb-4">
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setStatus(t.key)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium border ${status === t.key ? 'bg-sky-600 text-white border-sky-600' : `${card} ${muted}`}`}
          >
            {t.label}
            {t.key && data?.counts?.[t.key] ? <span className="ml-1.5 text-xs opacity-80">{data.counts[t.key]}</span> : null}
          </button>
        ))}
        <form
          onSubmit={(e) => {
            e.preventDefault()
            setQuery(q.trim())
          }}
          className="ml-auto relative"
        >
          <Search className={`w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 ${muted}`} />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Title, brand, seller email, country" className={`pl-9 pr-3 py-2 rounded-lg text-sm border ${card} ${text} w-72 max-w-full`} />
        </form>
      </div>

      {error && <p className="mb-4 text-sm text-red-500">{error}</p>}

      {!data ? (
        <Loader2 className="w-6 h-6 animate-spin text-sky-500" />
      ) : data.listings.length === 0 ? (
        <div className={`rounded-2xl border p-10 text-center ${card} ${muted}`}>No listings here yet.</div>
      ) : (
        <div className="space-y-2">
          {data.listings.map((l) => (
            <div key={l.id} className={`rounded-2xl border p-3 flex flex-col md:flex-row md:items-center gap-3 ${card} ${busy === l.id ? 'opacity-50' : ''}`}>
              <div className="w-full md:w-24 h-32 md:h-16 rounded-lg overflow-hidden bg-slate-800 flex-shrink-0">
                {l.images?.[0] && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={l.images[0]} alt="" className="w-full h-full object-cover" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2 text-xs mb-0.5">
                  <span className={`px-2 py-0.5 rounded-full font-semibold ${l.status === 'pending' ? 'bg-amber-500/15 text-amber-600' : l.status === 'active' ? 'bg-green-500/15 text-green-600' : 'bg-slate-500/15 ' + muted}`}>
                    {LISTING_STATUS_LABEL[l.status] || l.status}
                  </span>
                  {l.is_featured && <span className="px-2 py-0.5 rounded-full font-semibold bg-amber-400/20 text-amber-600">Featured</span>}
                  <span className={muted}>{CATEGORY_BY_SLUG[l.category]?.name}</span>
                </div>
                <p className={`font-semibold truncate ${text}`}>{l.title}</p>
                <p className={`text-xs ${muted}`}>
                  {formatPrice(l)} · {[l.city, l.country].filter(Boolean).join(', ')} · {l.seller_email || 'unknown seller'} ({l.seller_plan || 'free'}) · {l.views} views · {l.inquiries} inquiries
                </p>
                {l.reject_reason && <p className="text-xs text-red-500">Reason: {l.reject_reason}</p>}
              </div>
              <div className="flex flex-wrap gap-1.5">
                <Link href={`/listings/${l.slug}`} target="_blank" className={`p-2 rounded-lg border ${card} ${muted}`} title="Open"><ExternalLink className="w-4 h-4" /></Link>
                {l.status !== 'active' && <button onClick={() => patch({ id: l.id, status: 'active' })} className="p-2 rounded-lg bg-green-600 text-white" title="Approve / publish"><Check className="w-4 h-4" /></button>}
                {l.status !== 'rejected' && <button onClick={() => reject(l.id)} className={`p-2 rounded-lg border ${card} text-red-500`} title="Reject"><X className="w-4 h-4" /></button>}
                {l.status === 'active' && <button onClick={() => patch({ id: l.id, status: 'hidden' })} className={`p-2 rounded-lg border ${card} ${muted}`} title="Hide"><EyeOff className="w-4 h-4" /></button>}
                <button onClick={() => patch({ id: l.id, is_featured: !l.is_featured })} className={`p-2 rounded-lg border ${card} ${l.is_featured ? 'text-amber-500' : muted}`} title={l.is_featured ? 'Remove featured' : 'Feature'}><Star className="w-4 h-4" fill={l.is_featured ? 'currentColor' : 'none'} /></button>
                <button onClick={() => remove(l.id, l.title)} className={`p-2 rounded-lg border ${card} text-red-500`} title="Delete"><Trash2 className="w-4 h-4" /></button>
              </div>
            </div>
          ))}
          <p className={`text-xs pt-2 ${muted}`}>{data.total} listing{data.total === 1 ? '' : 's'}</p>
        </div>
      )}
    </div>
  )
}
