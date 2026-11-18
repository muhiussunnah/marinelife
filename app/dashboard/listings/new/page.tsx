'use client'
import { useEffect, useState } from 'react'
import ListingForm, { EMPTY_LISTING } from '@/components/listings/ListingForm'

export default function NewListingPage() {
  const [credits, setCredits] = useState<number | null>(null)
  const [contact, setContact] = useState({ name: '', email: '' })
  const [ready, setReady] = useState(false)

  useEffect(() => {
    fetch('/api/listings')
      .then((r) => r.json())
      .then((j) => {
        setCredits(j?.profile?.credits ?? 0)
      })
      .catch(() => setCredits(null))
      .finally(() => setReady(true))
    fetch('/api/auth/get-session', { credentials: 'same-origin' })
      .then((r) => r.json())
      .then((j) => setContact({ name: j?.user?.name || '', email: j?.user?.email || '' }))
      .catch(() => {})
  }, [])

  return (
    <div>
      <p className="text-sm mb-6" style={{ color: 'var(--text-muted)' }}>
        Clear photos, the maker&apos;s part number and honest condition notes get the fastest replies.
      </p>
      {ready ? (
        <ListingForm
          key={contact.email}
          credits={credits}
          initial={{ ...EMPTY_LISTING, contact_name: contact.name, contact_email: contact.email }}
        />
      ) : (
        <div className="w-8 h-8 border-4 border-t-transparent rounded-full animate-spin" style={{ borderColor: 'var(--accent)', borderTopColor: 'transparent' }} />
      )}
    </div>
  )
}
