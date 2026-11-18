'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Mail, Phone, MessageSquare, Inbox } from 'lucide-react'

export default function InquiriesPage() {
  const [items, setItems] = useState<any[] | null>(null)

  useEffect(() => {
    fetch('/api/listings/inquiries')
      .then((r) => r.json())
      .then((j) => {
        setItems(j.inquiries || [])
        if ((j.inquiries || []).some((i: any) => !i.read_at)) {
          fetch('/api/listings/inquiries', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: '{}' }).catch(() => {})
        }
      })
      .catch(() => setItems([]))
  }, [])

  const card = { background: 'var(--bg-card)', border: '1px solid var(--border)' }

  return (
    <div className="max-w-4xl">
      <p className="text-sm mb-6" style={{ color: 'var(--text-muted)' }}>Messages buyers sent about your listings. Reply to them directly by email, phone or WhatsApp.</p>
      {items === null ? (
        <div className="w-8 h-8 border-4 border-t-transparent rounded-full animate-spin" style={{ borderColor: 'var(--accent)', borderTopColor: 'transparent' }} />
      ) : items.length === 0 ? (
        <div className="rounded-3xl px-6 py-14 text-center" style={{ ...card, borderStyle: 'dashed' }}>
          <Inbox className="w-10 h-10 mx-auto mb-3" style={{ color: 'var(--accent)' }} />
          <p className="font-semibold mb-1" style={{ color: 'var(--text-primary)' }}>No messages yet</p>
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>When a buyer contacts you about a listing, it shows up here.</p>
        </div>
      ) : (
        <ul className="space-y-3">
          {items.map((i) => (
            <li key={i.id} className="rounded-2xl p-4 sm:p-5" style={{ ...card, borderLeft: i.read_at ? card.border : '4px solid var(--accent)' }}>
              <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                <Link href={`/listings/${i.listing_slug}`} className="text-sm font-semibold hover:underline" style={{ color: 'var(--accent)' }}>
                  {i.listing_title}
                </Link>
                <span className="text-xs" style={{ color: 'var(--text-faint)' }}>{new Date(i.created_at).toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' })}</span>
              </div>
              <p className="text-sm whitespace-pre-line mb-3" style={{ color: 'var(--text-primary)' }}>{i.message}</p>
              <div className="flex flex-wrap gap-3 text-xs" style={{ color: 'var(--text-muted)' }}>
                <span className="inline-flex items-center gap-1"><MessageSquare className="w-3.5 h-3.5" /> {i.buyer_name || 'Buyer'}</span>
                <a href={`mailto:${i.buyer_email}?subject=${encodeURIComponent(`Re: ${i.listing_title} (MarineYard)`)}`} className="inline-flex items-center gap-1 underline" style={{ color: 'var(--accent)' }}>
                  <Mail className="w-3.5 h-3.5" /> {i.buyer_email}
                </a>
                {i.buyer_phone && (
                  <a href={`tel:${String(i.buyer_phone).replace(/[^+0-9]/g, '')}`} className="inline-flex items-center gap-1" style={{ color: 'var(--accent)' }}>
                    <Phone className="w-3.5 h-3.5" /> {i.buyer_phone}
                  </a>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
