import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import {
  MapPin, Eye, Calendar, Tag, Package, Factory, Hash, Boxes, ShieldAlert, Mail, Phone, MessageCircle,
  Lock, ChevronRight, Crown, Star, User,
} from 'lucide-react'
import ListingGallery from '@/components/listings/ListingGallery'
import ListingCard from '@/components/listings/ListingCard'
import InquiryForm from '@/components/listings/InquiryForm'
import CategoryIcon from '@/components/listings/CategoryIcon'
import { getListingBySlug, getRelatedListings, incrementListingViews } from '@/lib/listings'
import { CATEGORY_BY_SLUG, CONDITION_LABEL, formatPrice } from '@/lib/listings-meta'
import { getSessionUser } from '@/lib/session'
import { isAdminEmail } from '@/lib/admin'
import { BRAND } from '@/lib/brand'

export const dynamic = 'force-dynamic'

const abs = (u: string) => (u.startsWith('http') ? u : `${BRAND.url}${u}`)

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const l = await getListingBySlug(params.slug)
  if (!l || !['active', 'sold'].includes(l.status)) return { title: 'Listing not found | MarineYard', robots: { index: false } }
  const title = `${l.title}${l.brand && !l.title.toLowerCase().includes(l.brand.toLowerCase()) ? ` – ${l.brand}` : ''} | MarineYard`
  const description = `${CONDITION_LABEL[l.condition] || ''} ${l.title} in ${[l.city, l.country].filter(Boolean).join(', ')}. ${formatPrice(l)}. ${l.description}`
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 158)
  const url = `${BRAND.url}/listings/${l.slug}`
  return {
    title,
    description,
    alternates: { canonical: url },
    robots: l.status === 'sold' ? { index: false, follow: true } : undefined,
    openGraph: {
      title,
      description,
      url,
      type: 'website',
      images: l.images?.[0] ? [{ url: abs(l.images[0]) }] : [{ url: `${BRAND.url}/logo-512.png` }],
    },
    twitter: { card: 'summary_large_image', title, description },
  }
}

export default async function ListingPage({ params }: { params: { slug: string } }) {
  const [listing, viewer] = await Promise.all([getListingBySlug(params.slug), getSessionUser()])
  if (!listing) notFound()
  const isOwner = !!viewer && viewer.id === listing.user_id
  const isAdmin = !!viewer && isAdminEmail(viewer.email)
  const isPublic = ['active', 'sold'].includes(listing.status)
  if (!isPublic && !isOwner && !isAdmin) notFound()
  if (!isOwner && listing.status === 'active') await incrementListingViews(listing.id)

  const related = await getRelatedListings(listing, 4)
  const cat = CATEGORY_BY_SLUG[listing.category]
  const location = [listing.city, listing.country].filter(Boolean).join(', ')
  const listedOn = new Date(listing.published_at || listing.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })

  const specs: { icon: any; label: string; value: string | null }[] = [
    { icon: Tag, label: 'Category', value: cat?.name || listing.category },
    { icon: Factory, label: 'Maker / brand', value: listing.brand },
    { icon: Package, label: 'Model', value: listing.model },
    { icon: Hash, label: 'Part number', value: listing.part_number },
    { icon: ShieldAlert, label: 'Condition', value: CONDITION_LABEL[listing.condition] || listing.condition },
    { icon: Boxes, label: 'Quantity', value: String(listing.quantity) },
    { icon: MapPin, label: 'Location', value: location },
    { icon: Calendar, label: 'Listed', value: listedOn },
  ]

  const itemCondition =
    listing.condition === 'new' || listing.condition === 'new-surplus'
      ? 'https://schema.org/NewCondition'
      : listing.condition === 'reconditioned'
        ? 'https://schema.org/RefurbishedCondition'
        : 'https://schema.org/UsedCondition'
  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Product',
        name: listing.title,
        description: listing.description.slice(0, 5000),
        sku: listing.part_number || undefined,
        mpn: listing.part_number || undefined,
        brand: listing.brand ? { '@type': 'Brand', name: listing.brand } : undefined,
        category: cat?.name,
        image: listing.images.length ? listing.images.map(abs) : undefined,
        ...(listing.price != null && !listing.price_on_request
          ? {
              offers: {
                '@type': 'Offer',
                price: listing.price,
                priceCurrency: listing.currency,
                availability: listing.status === 'sold' ? 'https://schema.org/SoldOut' : 'https://schema.org/InStock',
                itemCondition,
                url: `${BRAND.url}/listings/${listing.slug}`,
                areaServed: listing.country,
              },
            }
          : {}),
      },
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Home', item: `${BRAND.url}/` },
          { '@type': 'ListItem', position: 2, name: 'Listings', item: `${BRAND.url}/listings` },
          ...(cat ? [{ '@type': 'ListItem', position: 3, name: cat.name, item: `${BRAND.url}/listings?category=${cat.slug}` }] : []),
          { '@type': 'ListItem', position: cat ? 4 : 3, name: listing.title, item: `${BRAND.url}/listings/${listing.slug}` },
        ],
      },
    ],
  }

  const card = { background: 'var(--bg-card)', border: '1px solid var(--border)' }
  const nextPath = `/listings/${listing.slug}`

  return (
    <div className="min-h-screen pt-28 pb-20 px-4 sm:px-6">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, '\\u003c') }} />
      <div className="max-w-7xl mx-auto">
        {/* Breadcrumb */}
        <nav className="flex items-center flex-wrap gap-1 text-xs mb-5" style={{ color: 'var(--text-muted)' }} aria-label="Breadcrumb">
          <Link href="/" className="hover:underline">Home</Link>
          <ChevronRight className="w-3 h-3" />
          <Link href="/listings" className="hover:underline">Listings</Link>
          {cat && (
            <>
              <ChevronRight className="w-3 h-3" />
              <Link href={`/listings?category=${cat.slug}`} className="hover:underline">{cat.name}</Link>
            </>
          )}
        </nav>

        {!isPublic && (
          <div className="mb-5 p-4 rounded-2xl text-sm" style={{ background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.4)', color: 'var(--text-primary)' }}>
            Only you{isAdmin && !isOwner ? ' (admin)' : ''} can see this page — the listing is <strong>{listing.status}</strong>.
            {isOwner && <> Manage it from <Link href="/dashboard/listings" className="underline font-semibold">My listings</Link>.</>}
          </div>
        )}

        <div className="grid lg:grid-cols-[minmax(0,1fr)_380px] gap-8">
          {/* Left */}
          <div className="min-w-0">
            <ListingGallery images={listing.images || []} title={listing.title} category={listing.category} />

            <section className="mt-8 rounded-3xl p-6 sm:p-8" style={card}>
              <h2 className="font-playfair text-xl font-bold mb-4" style={{ color: 'var(--text-primary)' }}>Specifications</h2>
              <dl className="grid xl:grid-cols-2 gap-x-8">
                {specs.filter((s) => s.value).map(({ icon: Icon, label, value }) => (
                  <div key={label} className="flex items-start gap-3 py-3" style={{ borderBottom: '1px solid var(--border)' }}>
                    <Icon className="w-4 h-4 mt-0.5 flex-shrink-0" style={{ color: 'var(--accent)' }} />
                    <dt className="text-sm w-28 flex-shrink-0" style={{ color: 'var(--text-muted)' }}>{label}</dt>
                    <dd className="text-sm font-medium break-words min-w-0" style={{ color: 'var(--text-primary)' }}>{value}</dd>
                  </div>
                ))}
              </dl>
            </section>

            <section className="mt-6 rounded-3xl p-6 sm:p-8" style={card}>
              <h2 className="font-playfair text-xl font-bold mb-4" style={{ color: 'var(--text-primary)' }}>Description</h2>
              <div className="text-[15px] leading-relaxed whitespace-pre-line break-words" style={{ color: 'var(--text-primary)' }}>
                {listing.description}
              </div>
            </section>
          </div>

          {/* Right */}
          <aside className="space-y-5 lg:sticky lg:top-28 self-start">
            <div className="rounded-3xl p-6" style={card}>
              <div className="flex items-center gap-2 mb-3 flex-wrap">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold" style={{ background: 'var(--accent-bg)', color: 'var(--accent)' }}>
                  <CategoryIcon slug={listing.category} className="w-3.5 h-3.5" /> {cat?.name}
                </span>
                {listing.priority >= 2 ? (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold" style={{ background: '#f59e0b', color: '#1f1300' }}><Crown className="w-3 h-3" /> Top seller</span>
                ) : listing.priority >= 1 ? (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold" style={{ background: '#fbbf24', color: '#1f1300' }}><Star className="w-3 h-3" /> Featured</span>
                ) : null}
                {listing.status === 'sold' && <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-slate-900 text-white">Sold</span>}
              </div>
              <h1 className="font-playfair text-2xl sm:text-3xl font-bold leading-tight mb-3" style={{ color: 'var(--text-primary)' }}>
                {listing.title}
              </h1>
              <p className="text-3xl font-bold mb-1" style={{ color: 'var(--accent)' }}>{formatPrice(listing)}</p>
              {listing.quantity > 1 && <p className="text-xs mb-1" style={{ color: 'var(--text-muted)' }}>{listing.quantity} units available</p>}
              <div className="flex items-center gap-4 text-xs mt-3" style={{ color: 'var(--text-muted)' }}>
                <span className="inline-flex items-center gap-1"><MapPin className="w-3.5 h-3.5" /> {location}</span>
                <span className="inline-flex items-center gap-1"><Eye className="w-3.5 h-3.5" /> {listing.views.toLocaleString('en-US')} views</span>
              </div>
            </div>

            <div className="rounded-3xl p-6" style={card}>
              <h2 className="font-semibold mb-4 flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
                <User className="w-4 h-4" style={{ color: 'var(--accent)' }} /> Contact the seller
              </h2>
              {isOwner ? (
                <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
                  This is your listing. Buyer messages arrive in your <Link href="/dashboard/inquiries" className="underline font-semibold" style={{ color: 'var(--accent)' }}>Inquiries</Link>.
                </p>
              ) : listing.status !== 'active' ? (
                <p className="text-sm" style={{ color: 'var(--text-muted)' }}>This item is no longer available.</p>
              ) : viewer ? (
                <div className="space-y-4">
                  <ul className="space-y-2 text-sm">
                    {listing.contact_name && <li className="flex items-center gap-2" style={{ color: 'var(--text-primary)' }}><User className="w-4 h-4" style={{ color: 'var(--text-faint)' }} /> {listing.contact_name}</li>}
                    {listing.contact_email && (
                      <li className="flex items-center gap-2 min-w-0">
                        <Mail className="w-4 h-4 flex-shrink-0" style={{ color: 'var(--text-faint)' }} />
                        <a href={`mailto:${listing.contact_email}?subject=${encodeURIComponent(`MarineYard: ${listing.title}`)}`} className="underline truncate" style={{ color: 'var(--accent)' }}>{listing.contact_email}</a>
                      </li>
                    )}
                    {listing.contact_phone && (
                      <li className="flex items-center gap-2"><Phone className="w-4 h-4" style={{ color: 'var(--text-faint)' }} /><a href={`tel:${listing.contact_phone.replace(/[^+0-9]/g, '')}`} style={{ color: 'var(--accent)' }}>{listing.contact_phone}</a></li>
                    )}
                    {listing.whatsapp && (
                      <li className="flex items-center gap-2"><MessageCircle className="w-4 h-4" style={{ color: 'var(--text-faint)' }} /><a href={`https://wa.me/${listing.whatsapp.replace(/[^0-9]/g, '')}`} target="_blank" rel="noopener noreferrer nofollow" style={{ color: 'var(--accent)' }}>WhatsApp {listing.whatsapp}</a></li>
                    )}
                  </ul>
                  <InquiryForm listingId={listing.id} listingTitle={listing.title} />
                </div>
              ) : (
                <div className="text-center py-2">
                  <Lock className="w-8 h-8 mx-auto mb-3" style={{ color: 'var(--accent)' }} />
                  <p className="text-sm mb-4" style={{ color: 'var(--text-muted)' }}>
                    Sign in (free) to see the seller&apos;s email, phone and WhatsApp, or send a message.
                  </p>
                  <div className="flex gap-2">
                    <Link href={`/login?next=${encodeURIComponent(nextPath)}`} className="flex-1 px-4 py-2.5 rounded-xl text-sm font-semibold text-white" style={{ background: 'var(--btn-primary)' }}>Sign in</Link>
                    <Link href={`/signup?next=${encodeURIComponent(nextPath)}`} className="flex-1 px-4 py-2.5 rounded-xl text-sm font-semibold" style={{ border: '1px solid var(--border-hover)', color: 'var(--text-primary)' }}>Create account</Link>
                  </div>
                </div>
              )}
            </div>

            <div className="rounded-3xl p-5 text-xs leading-relaxed" style={{ background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.3)', color: 'var(--text-muted)' }}>
              <p className="font-semibold mb-1.5 flex items-center gap-1.5" style={{ color: 'var(--text-primary)' }}><ShieldAlert className="w-4 h-4 text-amber-500" /> Trade safely</p>
              MarineYard connects buyers and sellers but is not a party to the sale. Verify the part number, ask for photos of the nameplate and
              certificates, inspect before paying where possible, and never send money by untraceable methods. Report suspicious listings to{' '}
              <a href={`mailto:${BRAND.supportEmail}`} className="underline">{BRAND.supportEmail}</a>.
            </div>
          </aside>
        </div>

        {related.length > 0 && (
          <section className="mt-16">
            <div className="flex items-end justify-between mb-5">
              <h2 className="font-playfair text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>More {cat?.name.toLowerCase() || 'listings'}</h2>
              <Link href={`/listings?category=${listing.category}`} className="text-sm font-semibold" style={{ color: 'var(--accent)' }}>View all →</Link>
            </div>
            <div className="grid gap-5 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
              {related.map((r) => <ListingCard key={r.id} listing={r} compact />)}
            </div>
          </section>
        )}
      </div>
    </div>
  )
}
