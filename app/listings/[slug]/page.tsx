import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import {
  MapPin, Eye, Calendar, Tag, Package, Factory, Hash, Boxes, ShieldAlert, Mail, Phone, MessageCircle,
  Lock, ChevronRight, Crown, Star, User, Globe2, Info, BookOpen,
} from 'lucide-react'
import ListingGallery from '@/components/listings/ListingGallery'
import ListingCard from '@/components/listings/ListingCard'
import InquiryForm from '@/components/listings/InquiryForm'
import ListingDescription from '@/components/listings/ListingDescription'
import CategoryIcon from '@/components/listings/CategoryIcon'
import ListingsBrowser, { hasListingFilters, type SP } from '@/components/listings/ListingsBrowser'
import { getListingBySlug, getRelatedListings, incrementListingViews, userHasPaidPlan, getCategoryIntroOverrides, getGuidesForCategory } from '@/lib/listings'
import { uploadedImageSize } from '@/lib/image-size'
import { CATEGORY_BY_SLUG, CONDITION_LABEL, formatPrice, categoryPath, isPaidLead, isSpecImage } from '@/lib/listings-meta'
import { CATEGORY_INTROS } from '@/lib/category-intros'
import { getSessionUser } from '@/lib/session'
import { isAdminEmail } from '@/lib/admin'
import { BRAND } from '@/lib/brand'

export const dynamic = 'force-dynamic'

const abs = (u: string) => (u.startsWith('http') ? u : `${BRAND.url}${u}`)

/* ── /listings/<category> ─────────────────────────────────────────── */

async function categoryHeading(slug: string) {
  const cat = CATEGORY_BY_SLUG[slug]
  const copy = CATEGORY_INTROS[slug]
  const overrides = await getCategoryIntroOverrides()
  return {
    h1: copy?.h1 || cat.name,
    intro: overrides[slug] || copy?.intro || `${cat.blurb}.`,
    metaTitle: copy?.metaTitle || `${cat.name} for Sale | MarineYard`,
    metaDescription:
      copy?.metaDescription || `Buy and sell ${cat.name.toLowerCase()} worldwide: ${cat.blurb.toLowerCase()}. Contact sellers directly on MarineYard.`,
  }
}

/* ── metadata ─────────────────────────────────────────────────────── */

export async function generateMetadata({ params, searchParams }: { params: { slug: string }; searchParams: SP }): Promise<Metadata> {
  const cat = CATEGORY_BY_SLUG[params.slug]
  if (cat) {
    const h = await categoryHeading(cat.slug)
    const url = `${BRAND.url}${categoryPath(cat.slug)}`
    return {
      title: h.metaTitle,
      description: h.metaDescription,
      alternates: { canonical: url },
      robots: hasListingFilters(searchParams) ? { index: false, follow: true } : undefined,
      openGraph: { title: h.metaTitle, description: h.metaDescription, url, type: 'website' },
      twitter: { card: 'summary_large_image', title: h.metaTitle, description: h.metaDescription },
    }
  }

  const l = await getListingBySlug(params.slug)
  if (!l || !['active', 'sold'].includes(l.status)) return { title: 'Listing not found | MarineYard', robots: { index: false } }
  const title =
    l.meta_title?.trim() ||
    `${l.title}${l.brand && !l.title.toLowerCase().includes(l.brand.toLowerCase()) ? ` – ${l.brand}` : ''} | MarineYard`
  const description =
    l.meta_description?.trim() ||
    `${CONDITION_LABEL[l.condition] || ''} ${l.title} in ${[l.city, l.country].filter(Boolean).join(', ')}. ${formatPrice(l)}. ${l.description}`
      .replace(/\s+/g, ' ')
      .trim()
      .slice(0, 158)
  const url = `${BRAND.url}/listings/${l.slug}`
  const ogSrc = l.images?.[0] ? abs(l.images[0]) : null
  const ogSize = ogSrc ? await uploadedImageSize(ogSrc) : null
  return {
    title: { absolute: title },
    description,
    alternates: { canonical: url },
    robots: l.status === 'sold' ? { index: false, follow: true } : undefined,
    openGraph: {
      title,
      description,
      url,
      type: 'website',
      images: ogSrc
        ? [{ url: ogSrc, ...(ogSize || {}), alt: l.title }]
        : [{ url: `${BRAND.url}${BRAND.ogImage}`, width: 1200, height: 630, alt: 'MarineYard' }],
    },
    twitter: { card: 'summary_large_image', title, description },
  }
}

/* ── page ─────────────────────────────────────────────────────────── */

export default async function ListingPage({ params, searchParams }: { params: { slug: string }; searchParams: SP }) {
  const cat0 = CATEGORY_BY_SLUG[params.slug]
  if (cat0) {
    const h = await categoryHeading(cat0.slug)
    const crumbs = {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: `${BRAND.url}/` },
        { '@type': 'ListItem', position: 2, name: 'Listings', item: `${BRAND.url}/listings` },
        { '@type': 'ListItem', position: 3, name: cat0.name, item: `${BRAND.url}${categoryPath(cat0.slug)}` },
      ],
    }
    return (
      <>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(crumbs) }} />
        <ListingsBrowser searchParams={searchParams} category={cat0.slug} heading={{ h1: h.h1, intro: h.intro }} />
      </>
    )
  }

  const [listing, viewer] = await Promise.all([getListingBySlug(params.slug), getSessionUser()])
  if (!listing) notFound()
  const isOwner = !!viewer && viewer.id === listing.user_id
  const isAdmin = !!viewer && isAdminEmail(viewer.email)
  const isPublic = ['active', 'sold'].includes(listing.status)
  if (!isPublic && !isOwner && !isAdmin) notFound()
  if (!isOwner && listing.status === 'active') await incrementListingViews(listing.id)

  const paidLead = isPaidLead(listing)
  const viewerPaid = paidLead && viewer && !isOwner && !isAdmin ? await userHasPaidPlan(viewer.id) : false
  // Who may see the seller's email / phone / WhatsApp.
  const canSeeContact = !!viewer && (isOwner || isAdmin || !paidLead || viewerPaid)

  const [related, guides] = await Promise.all([getRelatedListings(listing, 4), getGuidesForCategory(listing.category, 3)])
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
        : listing.condition === 'on-request'
          ? undefined
          : 'https://schema.org/UsedCondition'
  // The seller's company name is part of what a paid lead unlocks, so it is
  // only published in the markup for ordinary listings.
  const sellerName = !paidLead ? listing.contact_name || listing.seller_name || undefined : undefined
  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Product',
        name: listing.title,
        description: (listing.meta_description || listing.description).slice(0, 5000),
        sku: listing.part_number || undefined,
        mpn: listing.part_number || undefined,
        brand: listing.brand ? { '@type': 'Brand', name: listing.brand } : undefined,
        category: cat?.name,
        image: listing.images.length ? listing.images.map(abs) : [`${BRAND.url}${BRAND.ogImage}`],
        url: `${BRAND.url}/listings/${listing.slug}`,
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
                seller: sellerName ? { '@type': 'Organization', name: sellerName } : undefined,
              },
            }
          : {}),
      },
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Home', item: `${BRAND.url}/` },
          { '@type': 'ListItem', position: 2, name: 'Listings', item: `${BRAND.url}/listings` },
          ...(cat ? [{ '@type': 'ListItem', position: 3, name: cat.name, item: `${BRAND.url}${categoryPath(cat.slug)}` }] : []),
          { '@type': 'ListItem', position: cat ? 4 : 3, name: listing.title, item: `${BRAND.url}/listings/${listing.slug}` },
        ],
      },
    ],
  }

  const card = { background: 'var(--bg-card)', border: '1px solid var(--border)' }
  const itemName = [listing.brand && listing.brand !== 'Assorted' ? listing.brand : '', listing.model || ''].filter(Boolean).join(' ')

  // Alt text per picture: "<item>, <condition>, photo 3 of 10" / "..., all photos" / "... – specification sheet"
  const pics = listing.images || []
  const picSources = listing.image_sources || {}
  const picName = listing.title.split(/\s+[–—-]\s+/)[0].trim() || listing.title
  const picCondition = CONDITION_LABEL[listing.condition] || ''
  const picInfo = pics.map((u) => picSources[u.split('?')[0]] || null)
  const picAlts = pics.map((u, k) => {
    const kind = picInfo[k]?.kind || (isSpecImage(u) ? 'spec' : 'photo')
    if (kind === 'spec') return `${picName} – specification sheet`
    const lead = [picName, picCondition].filter(Boolean).join(', ')
    return kind === 'collage' ? `${lead}, all photos` : `${lead}, photo ${k + 1} of ${pics.length}`
  })
  const picSizes = picInfo.map((x) => (x?.w && x?.h ? { w: x.w, h: x.h } : null))
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
              <Link href={categoryPath(cat.slug)} className="hover:underline">{cat.name}</Link>
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
            <ListingGallery images={pics} title={listing.title} category={listing.category} alts={picAlts} sizes={picSizes} />

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
              <h2 className="font-playfair text-xl font-bold mb-4" style={{ color: 'var(--text-primary)' }}>
                {itemName ? `About this ${itemName}` : 'About this item'}
              </h2>
              <ListingDescription text={listing.description} />
            </section>

            {guides.length > 0 && (
              <section className="mt-6 rounded-3xl p-6 sm:p-8" style={card}>
                <h2 className="font-playfair text-xl font-bold mb-1" style={{ color: 'var(--text-primary)' }}>Buyer guides</h2>
                <p className="text-sm mb-4" style={{ color: 'var(--text-muted)' }}>
                  Background reading from MarineYard Resources before you contact the seller.
                </p>
                <ul className="grid sm:grid-cols-3 gap-3">
                  {guides.map((g) => (
                    <li key={g.slug}>
                      <Link
                        href={`/${g.slug}`}
                        className="flex h-full flex-col gap-1.5 rounded-2xl p-4 transition hover:-translate-y-0.5"
                        style={{ background: 'var(--accent-bg)', border: '1px solid var(--border)' }}
                      >
                        <BookOpen className="w-4 h-4" style={{ color: 'var(--accent)' }} />
                        <span className="text-sm font-semibold leading-snug" style={{ color: 'var(--text-primary)' }}>{g.title}</span>
                        {g.excerpt && (
                          <span className="text-xs leading-relaxed line-clamp-2" style={{ color: 'var(--text-muted)' }}>{g.excerpt}</span>
                        )}
                      </Link>
                    </li>
                  ))}
                </ul>
              </section>
            )}
          </div>

          {/* Right */}
          <aside className="space-y-5 lg:sticky lg:top-28 self-start">
            <div className="rounded-3xl p-6" style={card}>
              <div className="flex items-center gap-2 mb-3 flex-wrap">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold" style={{ background: 'var(--accent-bg)', color: 'var(--accent)' }}>
                  <CategoryIcon slug={listing.category} className="w-3.5 h-3.5" /> {cat?.name}
                </span>
                {paidLead && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold" style={{ background: '#0a1f33', color: '#fbbf24' }}><Lock className="w-3 h-3" /> Paid lead</span>
                )}
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
              {isOwner && !isAdmin ? (
                <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
                  This is your listing. Buyer messages arrive in your <Link href="/dashboard/inquiries" className="underline font-semibold" style={{ color: 'var(--accent)' }}>Inquiries</Link>.
                </p>
              ) : listing.status !== 'active' && !isAdmin ? (
                <p className="text-sm" style={{ color: 'var(--text-muted)' }}>This item is no longer available.</p>
              ) : canSeeContact ? (
                <div className="space-y-4">
                  <ul className="space-y-2 text-sm">
                    {listing.contact_name && <li className="flex items-center gap-2" style={{ color: 'var(--text-primary)' }}><User className="w-4 h-4" style={{ color: 'var(--text-faint)' }} /> {listing.contact_name}</li>}
                    {listing.contact_email && (
                      <li className="flex items-center gap-2 min-w-0">
                        <Mail className="w-4 h-4 flex-shrink-0" style={{ color: 'var(--text-faint)' }} />
                        <a href={`mailto:${listing.contact_email}?subject=${encodeURIComponent(`Enquiry: ${listing.title}`)}`} className="underline truncate" style={{ color: 'var(--accent)' }}>{listing.contact_email}</a>
                      </li>
                    )}
                    {listing.contact_phone && (
                      <li className="flex items-center gap-2"><Phone className="w-4 h-4" style={{ color: 'var(--text-faint)' }} /><a href={`tel:${listing.contact_phone.replace(/[^+0-9]/g, '')}`} style={{ color: 'var(--accent)' }}>{listing.contact_phone}</a></li>
                    )}
                    {listing.whatsapp && (
                      <li className="flex items-center gap-2"><MessageCircle className="w-4 h-4" style={{ color: 'var(--text-faint)' }} /><a href={`https://wa.me/${listing.whatsapp.replace(/[^0-9]/g, '')}`} target="_blank" rel="noopener noreferrer nofollow" style={{ color: 'var(--accent)' }}>WhatsApp {listing.whatsapp}</a></li>
                    )}
                  </ul>
                  {listing.is_public_offer ? (
                    <p className="text-xs leading-relaxed flex items-start gap-1.5" style={{ color: 'var(--text-muted)' }}>
                      <Info className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" />
                      Contact this seller directly by email, phone or WhatsApp — mention MarineYard and the part number.
                    </p>
                  ) : (
                    !isOwner && <InquiryForm listingId={listing.id} listingTitle={listing.title} />
                  )}
                </div>
              ) : viewer && paidLead ? (
                <div className="text-center py-2">
                  <Lock className="w-8 h-8 mx-auto mb-3" style={{ color: '#f59e0b' }} />
                  <p className="font-semibold text-sm mb-1" style={{ color: 'var(--text-primary)' }}>Paid lead</p>
                  <p className="text-sm mb-4" style={{ color: 'var(--text-muted)' }}>
                    The seller&apos;s email, phone and WhatsApp for this offer are available on the Starter, Explorer and Pro plans — try any plan free for 7 days.
                  </p>
                  <Link href="/pricing" className="inline-flex items-center justify-center w-full px-4 py-2.5 rounded-xl text-sm font-semibold text-white" style={{ background: 'linear-gradient(135deg,#0a5c9e,#0891b2)' }}>
                    See plans &amp; unlock
                  </Link>
                </div>
              ) : (
                <div className="text-center py-2">
                  <Lock className="w-8 h-8 mx-auto mb-3" style={{ color: 'var(--accent)' }} />
                  <p className="text-sm mb-4" style={{ color: 'var(--text-muted)' }}>
                    {paidLead
                      ? 'This is a paid lead: sign in and choose a plan to see the seller’s email, phone and WhatsApp.'
                      : 'Sign in (free) to see the seller’s email, phone and WhatsApp, or send a message.'}
                  </p>
                  <div className="flex gap-2">
                    <Link href={`/login?next=${encodeURIComponent(nextPath)}`} className="flex-1 px-4 py-2.5 rounded-xl text-sm font-semibold text-white" style={{ background: 'var(--btn-primary)' }}>Sign in</Link>
                    <Link href={`/signup?next=${encodeURIComponent(nextPath)}`} className="flex-1 px-4 py-2.5 rounded-xl text-sm font-semibold" style={{ border: '1px solid var(--border-hover)', color: 'var(--text-primary)' }}>Create account</Link>
                  </div>
                </div>
              )}
            </div>

            {listing.is_public_offer && (
              <div className="rounded-3xl p-5 text-xs leading-relaxed" style={{ background: 'var(--accent-bg)', border: '1px solid var(--border-hover)', color: 'var(--text-muted)' }}>
                <p className="font-semibold mb-1.5 flex items-center gap-1.5" style={{ color: 'var(--text-primary)' }}><Globe2 className="w-4 h-4" style={{ color: 'var(--accent)' }} /> Public offer</p>
                The seller published this offer publicly and MarineYard lists it so buyers can find it. Confirm availability with the seller.
                Is this your company?{' '}
                <Link href={`/contact?subject=${encodeURIComponent(`Claim or remove listing: ${listing.slug}`)}`} className="underline font-semibold" style={{ color: 'var(--accent)' }}>
                  Claim or remove it
                </Link>
                .
              </div>
            )}

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
              <Link href={cat ? categoryPath(cat.slug) : '/listings'} className="text-sm font-semibold" style={{ color: 'var(--accent)' }}>View all →</Link>
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
