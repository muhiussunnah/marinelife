import { COUNTRIES } from '@/lib/countries'
import {
  CATEGORY_BY_SLUG,
  CURRENCIES,
  LISTING_CONDITIONS,
  MAX_LISTING_IMAGES,
} from '@/lib/listings-meta'

export interface ListingInput {
  title: string
  category: string
  brand: string | null
  model: string | null
  part_number: string | null
  condition: string
  price: number | null
  currency: string
  price_on_request: boolean
  quantity: number
  country: string
  city: string | null
  description: string
  images: string[]
  contact_name: string | null
  contact_email: string | null
  contact_phone: string | null
  whatsapp: string | null
}

const clean = (v: any, max: number) => {
  const s = String(v ?? '')
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, '')
    .trim()
    .slice(0, max)
  return s
}
const opt = (v: any, max: number) => clean(v, max) || null

/**
 * Validate a create/edit payload from the listing form. Image URLs must be
 * files this user uploaded through /api/listings/upload.
 */
export function validateListing(body: any, userId: string): { value?: ListingInput; error?: string } {
  const title = clean(body?.title, 120)
  if (title.length < 6) return { error: 'Please write a title of at least 6 characters.' }
  const category = clean(body?.category, 60)
  if (!CATEGORY_BY_SLUG[category]) return { error: 'Please pick a category.' }
  const condition = clean(body?.condition, 30)
  if (!LISTING_CONDITIONS.some((c) => c.value === condition)) return { error: 'Please pick the condition.' }
  const description = clean(body?.description, 6000)
  if (description.length < 20) return { error: 'Please describe the item in at least 20 characters.' }
  const country = clean(body?.country, 80)
  if (!(COUNTRIES as readonly string[]).includes(country)) return { error: 'Please pick the country where the item is located.' }

  const price_on_request = !!body?.price_on_request
  let price: number | null = null
  if (!price_on_request) {
    const raw = String(body?.price ?? '').replace(/[, ]/g, '')
    if (raw === '') return { error: 'Enter a price or tick "Price on request".' }
    const n = Number(raw)
    if (!isFinite(n) || n < 0 || n > 1e11) return { error: 'Please enter a valid price.' }
    price = Math.round(n * 100) / 100
  }
  const currency = clean(body?.currency, 3).toUpperCase() || 'USD'
  if (!(CURRENCIES as readonly string[]).includes(currency)) return { error: 'Unsupported currency.' }
  const quantity = Math.floor(Number(body?.quantity ?? 1))
  if (!isFinite(quantity) || quantity < 1 || quantity > 1_000_000) return { error: 'Quantity must be at least 1.' }

  const ownPrefix = `/uploads/listings/${userId}/`
  const images = (Array.isArray(body?.images) ? body.images : [])
    .map((u: any) => clean(u, 400))
    .filter((u: string) => {
      try {
        const path = u.startsWith('/') ? u : new URL(u).pathname
        return path.startsWith(ownPrefix) && !path.includes('..')
      } catch {
        return false
      }
    })
    .slice(0, MAX_LISTING_IMAGES)

  const contact_email = opt(body?.contact_email, 200)
  if (contact_email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contact_email)) return { error: 'Please enter a valid contact email.' }
  const phoneOk = (p: string | null) => !p || /^[+0-9 ()\-.]{5,30}$/.test(p)
  const contact_phone = opt(body?.contact_phone, 30)
  const whatsapp = opt(body?.whatsapp, 30)
  if (!phoneOk(contact_phone) || !phoneOk(whatsapp)) return { error: 'Please enter phone numbers with digits only (and + for the country code).' }

  return {
    value: {
      title,
      category,
      brand: opt(body?.brand, 80),
      model: opt(body?.model, 80),
      part_number: opt(body?.part_number, 80),
      condition,
      price,
      currency,
      price_on_request,
      quantity,
      country,
      city: opt(body?.city, 80),
      description,
      images,
      contact_name: opt(body?.contact_name, 120),
      contact_email,
      contact_phone,
      whatsapp,
    },
  }
}
