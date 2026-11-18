'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import ListingForm, { type ListingFormValues } from '@/components/listings/ListingForm'

export default function EditListingPage({ params }: { params: { id: string } }) {
  const [initial, setInitial] = useState<ListingFormValues | null>(null)
  const [error, setError] = useState('')

  useEffect(() => {
    fetch(`/api/listings/${params.id}`)
      .then(async (r) => {
        const j = await r.json().catch(() => ({}))
        if (!r.ok) throw new Error(j.error || 'Listing not found')
        const l = j.listing
        setInitial({
          title: l.title || '', category: l.category || '', brand: l.brand || '', model: l.model || '',
          part_number: l.part_number || '', condition: l.condition || 'used',
          price: l.price != null ? String(l.price) : '', currency: l.currency || 'USD', price_on_request: !!l.price_on_request,
          quantity: String(l.quantity || 1), country: l.country || '', city: l.city || '', description: l.description || '',
          images: l.images || [], contact_name: l.contact_name || '', contact_email: l.contact_email || '',
          contact_phone: l.contact_phone || '', whatsapp: l.whatsapp || '',
        })
      })
      .catch((e) => setError(e.message))
  }, [params.id])

  return (
    <div>
      {error ? (
        <p className="text-sm" style={{ color: 'var(--text-muted)' }}>{error}. <Link href="/dashboard/listings" className="underline">Back to my listings</Link></p>
      ) : initial ? (
        <ListingForm initial={initial} listingId={params.id} />
      ) : (
        <div className="w-8 h-8 border-4 border-t-transparent rounded-full animate-spin" style={{ borderColor: 'var(--accent)', borderTopColor: 'transparent' }} />
      )}
    </div>
  )
}
