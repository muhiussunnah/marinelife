/**
 * MarineYard listing vocabulary — safe to import from client and server code.
 */

export const LISTING_CREDIT_COST = 10
export const FREE_LISTINGS = 9
export const MAX_LISTING_IMAGES = 10
export const MAX_IMAGE_BYTES = 6 * 1024 * 1024

/** Branded spec sheets: "<seo-name>-specifications.webp?v=…" (older: "...-spec-<hex>.webp"). See lib/listing-images-store.ts. */
export const isSpecImage = (url: string) => /(-spec-[0-9a-f]+|-specifications)\.webp(\?.*)?$/.test(String(url || ''))

export type CategoryIcon =
  | 'Cog' | 'Zap' | 'Fan' | 'Droplets' | 'Gauge' | 'Flame' | 'Anchor' | 'Radar'
  | 'CircuitBoard' | 'ShipWheel' | 'Wrench' | 'LifeBuoy' | 'Snowflake' | 'Hammer' | 'Package'

export interface ListingCategory {
  slug: string
  name: string
  icon: CategoryIcon
  blurb: string
}

export const LISTING_CATEGORIES: ListingCategory[] = [
  { slug: 'main-engine', name: 'Main Engine Parts', icon: 'Cog', blurb: 'Pistons, liners, cylinder heads, crankshafts, fuel pumps & injectors' },
  { slug: 'auxiliary-engines', name: 'Auxiliary Engines & Generators', icon: 'Zap', blurb: 'Gensets, alternators and diesel generator spares' },
  { slug: 'turbochargers', name: 'Turbochargers', icon: 'Fan', blurb: 'Complete turbos, cartridges, rotors and nozzle rings' },
  { slug: 'pumps-compressors', name: 'Pumps, Compressors & Hydraulics', icon: 'Droplets', blurb: 'Centrifugal & screw pumps, air compressors, hydraulic units' },
  { slug: 'separators', name: 'Separators & Purifiers', icon: 'Gauge', blurb: 'Fuel & lube oil purifiers, bowls, discs and service kits' },
  { slug: 'boilers-heat-exchangers', name: 'Boilers & Heat Exchangers', icon: 'Flame', blurb: 'Burners, economisers, plate coolers and FWGs' },
  { slug: 'deck-machinery', name: 'Deck Machinery & Cranes', icon: 'Anchor', blurb: 'Winches, windlasses, capstans, cranes, anchors & chains' },
  { slug: 'navigation-communication', name: 'Navigation & Communication', icon: 'Radar', blurb: 'Radar, ECDIS, GPS, gyro, autopilot, VHF and GMDSS' },
  { slug: 'electrical-automation', name: 'Electrical & Automation', icon: 'CircuitBoard', blurb: 'Switchboards, PLCs, sensors, motors and control cards' },
  { slug: 'propulsion-steering', name: 'Propulsion & Steering', icon: 'ShipWheel', blurb: 'Propellers, shafts, thrusters, gearboxes and steering gear' },
  { slug: 'valves-pipes-fittings', name: 'Valves, Pipes & Fittings', icon: 'Wrench', blurb: 'Butterfly, gate & safety valves, flanges, pipe fittings' },
  { slug: 'safety-lifesaving', name: 'Safety & Lifesaving', icon: 'LifeBuoy', blurb: 'Lifeboats, liferafts, fire fighting and LSA equipment' },
  { slug: 'hvac-refrigeration', name: 'HVAC & Refrigeration', icon: 'Snowflake', blurb: 'Reefer compressors, AC plants, provision cooling' },
  { slug: 'tools-workshop', name: 'Tools & Workshop', icon: 'Hammer', blurb: 'Hydraulic tools, measuring instruments, workshop machines' },
  { slug: 'other', name: 'Other Marine Equipment', icon: 'Package', blurb: 'Anything else that keeps a ship running' },
]

export const CATEGORY_BY_SLUG: Record<string, ListingCategory> = Object.fromEntries(
  LISTING_CATEGORIES.map((c) => [c.slug, c])
)

export const LISTING_CONDITIONS = [
  { value: 'new', label: 'New / OEM' },
  { value: 'new-surplus', label: 'New surplus' },
  { value: 'reconditioned', label: 'Reconditioned / overhauled' },
  { value: 'used', label: 'Used – working' },
  { value: 'as-removed', label: 'Used – as removed' },
  { value: 'for-parts', label: 'For parts / scrap' },
  { value: 'on-request', label: 'Condition on request' },
] as const

export const CONDITION_LABEL: Record<string, string> = Object.fromEntries(
  LISTING_CONDITIONS.map((c) => [c.value, c.label])
)

export const CURRENCIES = ['USD', 'EUR', 'GBP', 'SGD', 'AED', 'NOK', 'CNY', 'JPY', 'KRW', 'INR', 'TRY', 'BDT'] as const

export const POPULAR_BRANDS = [
  'MAN B&W', 'Wärtsilä', 'Sulzer', 'Caterpillar', 'Cummins', 'Yanmar', 'Daihatsu', 'Mitsubishi',
  'MaK', 'Hyundai HiMSEN', 'ABB', 'Napier', 'Alfa Laval', 'GEA Westfalia', 'Kawasaki', 'Furuno',
  'JRC', 'Kongsberg', 'Sperry Marine', 'Schottel', 'Rolls-Royce', 'Hatlapa', 'Sperre', 'Tanabe',
  'Shinko', 'Aalborg', 'Volvo Penta', 'Deutz', 'Niigata', 'Akasaka',
]

export const LISTING_STATUS_LABEL: Record<string, string> = {
  active: 'Live',
  pending: 'In review',
  rejected: 'Rejected',
  sold: 'Sold',
  hidden: 'Hidden',
}

export interface PublicListing {
  id: string
  slug: string
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
  status: string
  views: number
  created_at: string
  published_at: string | null
  /** 0 = standard, 1 = featured (Explorer / admin pick), 2 = top placement (Pro) */
  priority: number
  seller_name?: string | null
  /** 'members' = any signed-in member sees contact details, 'paid' = paid plans only */
  contact_tier?: string
  is_public_offer?: boolean
  meta_title?: string | null
  meta_description?: string | null
  /** branded picture path -> kind and pixel size (lib/listing-images-store.ts) */
  image_sources?: Record<string, { kind?: 'photo' | 'collage' | 'tile' | 'spec'; w?: number; h?: number; src?: string | null }> | null
}

/** Listings whose contact details need a paid plan ("paid leads"). */
export const isPaidLead = (l: Pick<PublicListing, 'contact_tier'>) => l.contact_tier === 'paid'

export const categoryPath = (slug: string) => `/listings/${slug}`

export function formatPrice(l: Pick<PublicListing, 'price' | 'currency' | 'price_on_request'>) {
  if (l.price_on_request || l.price == null) return 'Price on request'
  try {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: l.currency || 'USD',
      maximumFractionDigits: Number(l.price) % 1 === 0 ? 0 : 2,
    }).format(Number(l.price))
  } catch {
    return `${l.currency} ${Number(l.price).toLocaleString('en-US')}`
  }
}

export function timeAgo(iso: string | null | undefined) {
  if (!iso) return ''
  const s = Math.max(1, Math.floor((Date.now() - new Date(iso).getTime()) / 1000))
  const units: [number, string][] = [[31536000, 'y'], [2592000, 'mo'], [604800, 'w'], [86400, 'd'], [3600, 'h'], [60, 'm']]
  for (const [secs, u] of units) if (s >= secs) return `${Math.floor(s / secs)}${u} ago`
  return 'just now'
}
