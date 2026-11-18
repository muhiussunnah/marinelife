'use client'
import { useState } from 'react'
import { Loader2, Send, CheckCircle2 } from 'lucide-react'

export default function InquiryForm({ listingId, listingTitle }: { listingId: string; listingTitle: string }) {
  const [message, setMessage] = useState(`Hello, I'm interested in "${listingTitle}". Is it still available? Please share the final price, condition details and delivery options.`)
  const [phone, setPhone] = useState('')
  const [state, setState] = useState<'idle' | 'sending' | 'sent'>('idle')
  const [error, setError] = useState('')

  const send = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setState('sending')
    try {
      const res = await fetch(`/api/listings/${listingId}/inquiry`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message, phone }),
      })
      const json = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(json?.error || 'Could not send your message')
      setState('sent')
    } catch (err: any) {
      setError(err.message)
      setState('idle')
    }
  }

  if (state === 'sent') {
    return (
      <div className="flex items-start gap-3 p-4 rounded-2xl text-sm" style={{ background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.35)', color: 'var(--text-primary)' }}>
        <CheckCircle2 className="w-5 h-5 flex-shrink-0 text-green-600" />
        <span>Message sent. The seller sees it in their MarineYard dashboard and will reply to your email.</span>
      </div>
    )
  }

  const field = { background: 'var(--bg-secondary)', border: '1px solid var(--border)', color: 'var(--text-primary)' }
  return (
    <form onSubmit={send} className="space-y-3">
      <textarea
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        rows={5}
        maxLength={3000}
        required
        className="w-full px-3 py-2.5 rounded-xl text-sm outline-none focus:ring-2 focus:ring-sky-400/40"
        style={field}
        aria-label="Your message"
      />
      <input
        value={phone}
        onChange={(e) => setPhone(e.target.value)}
        placeholder="Your phone / WhatsApp (optional)"
        className="w-full px-3 py-2.5 rounded-xl text-sm outline-none focus:ring-2 focus:ring-sky-400/40"
        style={field}
      />
      {error && <p className="text-sm text-red-600">{error}</p>}
      <button
        type="submit"
        disabled={state === 'sending'}
        className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl text-sm font-semibold text-white disabled:opacity-60"
        style={{ background: 'var(--btn-primary)' }}
      >
        {state === 'sending' ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
        Send message to seller
      </button>
    </form>
  )
}
