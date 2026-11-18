'use client'
import { useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ImagePlus, Loader2, X, ArrowLeft, ArrowRight, Info, Gem } from 'lucide-react'
import { COUNTRIES } from '@/lib/countries'
import {
  CURRENCIES, LISTING_CATEGORIES, LISTING_CONDITIONS, LISTING_CREDIT_COST, MAX_IMAGE_BYTES, MAX_LISTING_IMAGES, POPULAR_BRANDS,
} from '@/lib/listings-meta'

export interface ListingFormValues {
  title: string
  category: string
  brand: string
  model: string
  part_number: string
  condition: string
  price: string
  currency: string
  price_on_request: boolean
  quantity: string
  country: string
  city: string
  description: string
  images: string[]
  contact_name: string
  contact_email: string
  contact_phone: string
  whatsapp: string
}

export const EMPTY_LISTING: ListingFormValues = {
  title: '', category: '', brand: '', model: '', part_number: '', condition: 'used', price: '', currency: 'USD',
  price_on_request: false, quantity: '1', country: '', city: '', description: '', images: [], contact_name: '',
  contact_email: '', contact_phone: '', whatsapp: '',
}

export default function ListingForm({
  initial,
  listingId,
  credits,
}: {
  initial: ListingFormValues
  /** set when editing an existing listing */
  listingId?: string
  credits?: number | null
}) {
  const router = useRouter()
  const [v, setV] = useState<ListingFormValues>(initial)
  const [uploading, setUploading] = useState(0)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [outOfCredits, setOutOfCredits] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)
  const editing = !!listingId

  const set = <K extends keyof ListingFormValues>(k: K, val: ListingFormValues[K]) => setV((p) => ({ ...p, [k]: val }))

  const onFiles = async (files: FileList | null) => {
    if (!files?.length) return
    setError('')
    const room = MAX_LISTING_IMAGES - v.images.length
    const list = Array.from(files).slice(0, Math.max(0, room))
    if (!list.length) {
      setError(`You can add up to ${MAX_LISTING_IMAGES} photos.`)
      return
    }
    for (const file of list) {
      if (file.size > MAX_IMAGE_BYTES) {
        setError(`${file.name} is larger than 6 MB.`)
        continue
      }
      setUploading((n) => n + 1)
      try {
        const fd = new FormData()
        fd.append('file', file)
        const res = await fetch('/api/listings/upload', { method: 'POST', body: fd })
        const json = await res.json().catch(() => ({}))
        if (!res.ok || !json.url) throw new Error(json.error || 'Upload failed')
        setV((p) => ({ ...p, images: [...p.images, json.url].slice(0, MAX_LISTING_IMAGES) }))
      } catch (err: any) {
        setError(err.message)
      } finally {
        setUploading((n) => n - 1)
      }
    }
    if (fileRef.current) fileRef.current.value = ''
  }

  const move = (i: number, d: number) =>
    setV((p) => {
      const imgs = [...p.images]
      const j = i + d
      if (j < 0 || j >= imgs.length) return p
      ;[imgs[i], imgs[j]] = [imgs[j], imgs[i]]
      return { ...p, images: imgs }
    })

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setOutOfCredits(false)
    if (uploading) {
      setError('Please wait for the photos to finish uploading.')
      return
    }
    setSaving(true)
    try {
      const res = await fetch(editing ? `/api/listings/${listingId}` : '/api/listings', {
        method: editing ? 'PATCH' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...v, quantity: Number(v.quantity) || 1 }),
      })
      const json = await res.json().catch(() => ({}))
      if (res.status === 402) {
        setOutOfCredits(true)
        throw new Error(json.message || 'You are out of listing credits.')
      }
      if (!res.ok) throw new Error(json.error || 'Could not save the listing')
      router.push(`/dashboard/listings?saved=${editing ? 'updated' : json.listing?.status || 'active'}`)
      router.refresh()
    } catch (err: any) {
      setError(err.message)
      setSaving(false)
    }
  }

  const field = 'w-full px-3.5 py-2.5 rounded-xl text-sm outline-none focus:ring-2 focus:ring-sky-400/40'
  const fieldStyle = { background: 'var(--bg-secondary)', border: '1px solid var(--border)', color: 'var(--text-primary)' }
  const label = 'block text-xs font-semibold uppercase tracking-wide mb-1.5'
  const section = 'rounded-2xl p-5 sm:p-6 space-y-4'
  const sectionStyle = { background: 'var(--bg-card)', border: '1px solid var(--border)' }

  return (
    <form onSubmit={submit} className="space-y-5 max-w-3xl">
      {!editing && credits != null && (
        <div className="flex items-start gap-3 p-4 rounded-2xl text-sm" style={{ background: 'var(--accent-bg)', border: '1px solid var(--border-hover)', color: 'var(--text-primary)' }}>
          <Gem className="w-5 h-5 flex-shrink-0" style={{ color: 'var(--accent)' }} />
          <span>
            Publishing uses <strong>{LISTING_CREDIT_COST} credits</strong>. You have <strong>{credits}</strong> credits
            ({Math.floor(credits / LISTING_CREDIT_COST)} listing{Math.floor(credits / LISTING_CREDIT_COST) === 1 ? '' : 's'} left).
            {credits < LISTING_CREDIT_COST && <> <Link href="/pricing" className="underline font-semibold">Upgrade your plan</Link> to list more.</>}
          </span>
        </div>
      )}

      <div className={section} style={sectionStyle}>
        <h2 className="font-semibold" style={{ color: 'var(--text-primary)' }}>What are you selling?</h2>
        <div>
          <label className={label} style={{ color: 'var(--text-muted)' }} htmlFor="title">Title *</label>
          <input id="title" required minLength={6} maxLength={120} value={v.title} onChange={(e) => set('title', e.target.value)} className={field} style={fieldStyle} placeholder="e.g. MAN B&W L23/30H cylinder head, reconditioned" />
        </div>
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className={label} style={{ color: 'var(--text-muted)' }} htmlFor="category">Category *</label>
            <select id="category" required value={v.category} onChange={(e) => set('category', e.target.value)} className={field} style={fieldStyle}>
              <option value="">Choose a category</option>
              {LISTING_CATEGORIES.map((c) => <option key={c.slug} value={c.slug}>{c.name}</option>)}
            </select>
          </div>
          <div>
            <label className={label} style={{ color: 'var(--text-muted)' }} htmlFor="condition">Condition *</label>
            <select id="condition" required value={v.condition} onChange={(e) => set('condition', e.target.value)} className={field} style={fieldStyle}>
              {LISTING_CONDITIONS.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
            </select>
          </div>
        </div>
        <div className="grid sm:grid-cols-3 gap-4">
          <div>
            <label className={label} style={{ color: 'var(--text-muted)' }} htmlFor="brand">Maker / brand</label>
            <input id="brand" list="brand-list" maxLength={80} value={v.brand} onChange={(e) => set('brand', e.target.value)} className={field} style={fieldStyle} placeholder="Wärtsilä" />
            <datalist id="brand-list">{POPULAR_BRANDS.map((b) => <option key={b} value={b} />)}</datalist>
          </div>
          <div>
            <label className={label} style={{ color: 'var(--text-muted)' }} htmlFor="model">Model</label>
            <input id="model" maxLength={80} value={v.model} onChange={(e) => set('model', e.target.value)} className={field} style={fieldStyle} placeholder="6L20" />
          </div>
          <div>
            <label className={label} style={{ color: 'var(--text-muted)' }} htmlFor="pn">Part number</label>
            <input id="pn" maxLength={80} value={v.part_number} onChange={(e) => set('part_number', e.target.value)} className={field} style={fieldStyle} placeholder="PAAE123456" />
          </div>
        </div>
        <div>
          <label className={label} style={{ color: 'var(--text-muted)' }} htmlFor="desc">Description *</label>
          <textarea id="desc" required minLength={20} maxLength={6000} rows={7} value={v.description} onChange={(e) => set('description', e.target.value)} className={field} style={fieldStyle}
            placeholder="Condition details, running hours, certificates (class / maker), what's included, packing, delivery options…" />
          <p className="text-[11px] mt-1 text-right" style={{ color: 'var(--text-faint)' }}>{v.description.length} / 6000</p>
        </div>
      </div>

      <div className={section} style={sectionStyle}>
        <h2 className="font-semibold" style={{ color: 'var(--text-primary)' }}>Photos <span className="text-xs font-normal" style={{ color: 'var(--text-muted)' }}>(up to {MAX_LISTING_IMAGES}, JPG/PNG/WebP, 6 MB each — the first photo is the cover)</span></h2>
        <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
          {v.images.map((src, i) => (
            <div key={src} className="relative aspect-square rounded-xl overflow-hidden group" style={{ border: '1px solid var(--border)' }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={src} alt="" className="w-full h-full object-cover" />
              {i === 0 && <span className="absolute top-1.5 left-1.5 px-1.5 py-0.5 rounded text-[10px] font-bold bg-black/60 text-white">Cover</span>}
              <button type="button" onClick={() => set('images', v.images.filter((x) => x !== src))} className="absolute top-1.5 right-1.5 w-6 h-6 rounded-full bg-black/60 text-white flex items-center justify-center" aria-label="Remove photo">
                <X className="w-3.5 h-3.5" />
              </button>
              <div className="absolute bottom-1.5 inset-x-1.5 flex justify-between opacity-0 group-hover:opacity-100 transition">
                <button type="button" onClick={() => move(i, -1)} className="w-6 h-6 rounded-full bg-black/60 text-white flex items-center justify-center" aria-label="Move left"><ArrowLeft className="w-3.5 h-3.5" /></button>
                <button type="button" onClick={() => move(i, 1)} className="w-6 h-6 rounded-full bg-black/60 text-white flex items-center justify-center" aria-label="Move right"><ArrowRight className="w-3.5 h-3.5" /></button>
              </div>
            </div>
          ))}
          {Array.from({ length: uploading }).map((_, i) => (
            <div key={`up-${i}`} className="aspect-square rounded-xl flex items-center justify-center" style={{ border: '1px dashed var(--border-hover)' }}>
              <Loader2 className="w-6 h-6 animate-spin" style={{ color: 'var(--accent)' }} />
            </div>
          ))}
          {v.images.length + uploading < MAX_LISTING_IMAGES && (
            <button type="button" onClick={() => fileRef.current?.click()} className="aspect-square rounded-xl flex flex-col items-center justify-center gap-1 text-xs font-medium transition hover:opacity-80" style={{ border: '1.5px dashed var(--border-hover)', color: 'var(--accent)', background: 'var(--accent-bg)' }}>
              <ImagePlus className="w-6 h-6" /> Add photos
            </button>
          )}
        </div>
        <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp" multiple hidden onChange={(e) => onFiles(e.target.files)} />
      </div>

      <div className={section} style={sectionStyle}>
        <h2 className="font-semibold" style={{ color: 'var(--text-primary)' }}>Price & location</h2>
        <div className="grid sm:grid-cols-[1fr_120px_110px] gap-4">
          <div>
            <label className={label} style={{ color: 'var(--text-muted)' }} htmlFor="price">Price</label>
            <input id="price" inputMode="decimal" disabled={v.price_on_request} value={v.price_on_request ? '' : v.price} onChange={(e) => set('price', e.target.value)} className={`${field} disabled:opacity-50`} style={fieldStyle} placeholder={v.price_on_request ? 'On request' : '2500'} />
          </div>
          <div>
            <label className={label} style={{ color: 'var(--text-muted)' }} htmlFor="currency">Currency</label>
            <select id="currency" value={v.currency} onChange={(e) => set('currency', e.target.value)} className={field} style={fieldStyle}>
              {CURRENCIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label className={label} style={{ color: 'var(--text-muted)' }} htmlFor="qty">Quantity</label>
            <input id="qty" type="number" min={1} value={v.quantity} onChange={(e) => set('quantity', e.target.value)} className={field} style={fieldStyle} />
          </div>
        </div>
        <label className="flex items-center gap-2 text-sm cursor-pointer" style={{ color: 'var(--text-primary)' }}>
          <input type="checkbox" checked={v.price_on_request} onChange={(e) => set('price_on_request', e.target.checked)} className="w-4 h-4 accent-sky-600" />
          Price on request
        </label>
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className={label} style={{ color: 'var(--text-muted)' }} htmlFor="country">Country *</label>
            <select id="country" required value={v.country} onChange={(e) => set('country', e.target.value)} className={field} style={fieldStyle}>
              <option value="">Where is the item?</option>
              {COUNTRIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label className={label} style={{ color: 'var(--text-muted)' }} htmlFor="city">City / port</label>
            <input id="city" maxLength={80} value={v.city} onChange={(e) => set('city', e.target.value)} className={field} style={fieldStyle} placeholder="Piraeus" />
          </div>
        </div>
      </div>

      <div className={section} style={sectionStyle}>
        <h2 className="font-semibold" style={{ color: 'var(--text-primary)' }}>How buyers reach you</h2>
        <p className="text-xs flex items-start gap-1.5" style={{ color: 'var(--text-muted)' }}>
          <Info className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" /> Contact details are only shown to signed-in members. Buyers can also message you through MarineYard.
        </p>
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className={label} style={{ color: 'var(--text-muted)' }} htmlFor="cname">Contact name / company</label>
            <input id="cname" maxLength={120} value={v.contact_name} onChange={(e) => set('contact_name', e.target.value)} className={field} style={fieldStyle} />
          </div>
          <div>
            <label className={label} style={{ color: 'var(--text-muted)' }} htmlFor="cemail">Contact email</label>
            <input id="cemail" type="email" maxLength={200} value={v.contact_email} onChange={(e) => set('contact_email', e.target.value)} className={field} style={fieldStyle} placeholder="Defaults to your account email" />
          </div>
          <div>
            <label className={label} style={{ color: 'var(--text-muted)' }} htmlFor="cphone">Phone</label>
            <input id="cphone" maxLength={30} value={v.contact_phone} onChange={(e) => set('contact_phone', e.target.value)} className={field} style={fieldStyle} placeholder="+30 210 000 0000" />
          </div>
          <div>
            <label className={label} style={{ color: 'var(--text-muted)' }} htmlFor="wa">WhatsApp</label>
            <input id="wa" maxLength={30} value={v.whatsapp} onChange={(e) => set('whatsapp', e.target.value)} className={field} style={fieldStyle} placeholder="+65 8000 0000" />
          </div>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-2xl text-sm" style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.35)', color: '#b91c1c' }}>
          {error}
          {outOfCredits && <> <Link href="/pricing" className="underline font-semibold">See plans →</Link></>}
        </div>
      )}

      <div className="flex flex-wrap items-center gap-3">
        <button type="submit" disabled={saving || uploading > 0} className="inline-flex items-center gap-2 px-6 py-3 rounded-full text-sm font-semibold text-white disabled:opacity-60" style={{ background: 'linear-gradient(135deg,#0a5c9e,#0891b2)' }}>
          {saving && <Loader2 className="w-4 h-4 animate-spin" />}
          {editing ? 'Save changes' : `Publish listing (${LISTING_CREDIT_COST} credits)`}
        </button>
        <Link href="/dashboard/listings" className="px-5 py-3 rounded-full text-sm font-medium" style={{ color: 'var(--text-muted)' }}>Cancel</Link>
      </div>
      <p className="text-[11px]" style={{ color: 'var(--text-faint)' }}>
        By publishing you confirm you have the right to sell this item and that the description is accurate. See our <Link href="/terms" className="underline">terms</Link>.
      </p>
    </form>
  )
}
