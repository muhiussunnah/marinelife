import type { Metadata } from 'next'
import Link from 'next/link'
import {
  Search, ArrowRight, Globe2, MessageSquare, BadgeCheck, Percent, Gift, ShieldCheck, Upload, Camera, Handshake,
  PackageSearch, Mail, Star, Crown, BookOpen, Wrench, Ship, Anchor,
} from 'lucide-react'
import HeroIllustration from '@/components/homepage/HeroIllustration'
import ListingCard from '@/components/listings/ListingCard'
import CategoryIcon from '@/components/listings/CategoryIcon'
import HomepageBlocks from '@/components/homepage/HomepageBlocks'
import AdSlot from '@/components/adify/AdSlot'
import { getHomepageBlocks } from '@/lib/homepage-blocks'
import { getFeaturedListings, getMarketStats } from '@/lib/listings'
import { LISTING_CATEGORIES } from '@/lib/listings-meta'
import { createCachedClient } from '@/lib/db'
import { BRAND } from '@/lib/brand'

export const revalidate = 60

const TITLE = 'MarineYard – Buy & Sell Ship Spare Parts and Marine Equipment Worldwide'
const DESCRIPTION =
  'The global marketplace for ship spare parts, marine engines, turbochargers, pumps, navigation and deck equipment. List 9 parts free and reach buyers in every port.'

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: `${BRAND.url}/` },
  openGraph: { title: TITLE, description: DESCRIPTION, url: `${BRAND.url}/`, type: 'website', siteName: BRAND.name },
  twitter: { card: 'summary_large_image', title: TITLE, description: DESCRIPTION },
}

const FAQ = [
  {
    q: 'What can I sell on MarineYard?',
    a: 'Ship spare parts and marine equipment of every kind: main and auxiliary engine parts, turbochargers, pumps, compressors, purifiers, boilers, deck machinery, navigation and communication electronics, electrical and automation parts, propulsion and steering components, valves, safety equipment and workshop tools. New, surplus, reconditioned and used items are all welcome.',
  },
  {
    q: 'How much does it cost to list a part?',
    a: 'Every new account gets 9 free listings. If you list regularly, paid plans start at $4.99 a month for 12 listings, with a 7-day free trial and 50% off the first month. MarineYard takes no commission on sales.',
  },
  {
    q: 'How do buyers and sellers get in touch?',
    a: 'Signed-in members can see the seller’s email, phone and WhatsApp on each listing, or send a message that lands in the seller’s MarineYard inbox. You agree on price, payment, inspection and shipping directly with each other.',
  },
  {
    q: 'Does MarineYard check the parts or handle payment?',
    a: 'No. MarineYard is a listing platform and is not a party to any sale. Moderators remove listings that break our rules, but buyers should always verify part numbers, certificates and the seller before paying.',
  },
  {
    q: 'Which countries can I sell to?',
    a: 'Anywhere. Listings show the country and port where the item is located, and buyers can filter by location, so a part sitting in Piraeus, Singapore, Rotterdam or Chittagong can find a buyer anywhere in the world.',
  },
]

async function getLatestResources() {
  try {
    const { data } = await createCachedClient(['posts'], 300)
      .from('blog_posts')
      .select('title, slug, excerpt, featured_image, category, published_at')
      .eq('status', 'published')
      .order('published_at', { ascending: false })
      .limit(3)
    return (data ?? []) as { title: string; slug: string; excerpt: string | null; featured_image: string | null; category: string | null; published_at: string | null }[]
  } catch {
    return []
  }
}

export default async function HomePage() {
  const [featured, stats, posts, blocks] = await Promise.all([
    getFeaturedListings(8),
    getMarketStats(),
    getLatestResources(),
    getHomepageBlocks(),
  ])

  const popular = ['main-engine', 'turbochargers', 'separators', 'navigation-communication', 'deck-machinery']

  const statItems =
    stats.listings >= 20
      ? [
          { value: stats.listings.toLocaleString('en-US'), label: 'parts listed' },
          { value: stats.countries.toLocaleString('en-US'), label: 'countries' },
          { value: stats.sellers.toLocaleString('en-US'), label: 'sellers' },
          { value: '0%', label: 'commission' },
        ]
      : [
          { value: '15', label: 'equipment categories' },
          { value: '190+', label: 'countries to sell to' },
          { value: '9', label: 'free listings per account' },
          { value: '0%', label: 'commission on sales' },
        ]

  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: FAQ.map((f) => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a } })),
  }

  return (
    <div className="overflow-hidden">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />

      {/* ── Hero ─────────────────────────────────────────────── */}
      <section className="relative pt-28 sm:pt-32 pb-16 px-4 sm:px-6">
        <div className="absolute inset-0 -z-10" style={{ background: 'radial-gradient(60% 50% at 15% 20%, rgba(14,116,190,0.14), transparent 70%), radial-gradient(50% 45% at 90% 10%, rgba(245,158,11,0.10), transparent 70%)' }} />
        <div className="max-w-7xl mx-auto grid lg:grid-cols-[1.05fr_1fr] gap-10 lg:gap-14 items-center">
          <div>
            <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold mb-6" style={{ background: 'var(--accent-bg)', color: 'var(--accent)', border: '1px solid var(--border-hover)' }}>
              <Globe2 className="w-3.5 h-3.5" /> Ship parts marketplace · every port, every flag
            </span>
            <h1 className="font-playfair text-[2.5rem] leading-[1.08] sm:text-5xl lg:text-6xl font-bold tracking-tight" style={{ color: 'var(--text-primary)' }}>
              Find the part.{' '}
              <span className="bg-clip-text text-transparent" style={{ backgroundImage: 'linear-gradient(100deg,#0a5c9e 0%,#0891b2 55%,#0ea5e9 100%)' }}>
                Sell the spares.
              </span>{' '}
              Keep ships moving.
            </h1>
            <p className="mt-5 text-base sm:text-lg max-w-xl leading-relaxed" style={{ color: 'var(--text-muted)' }}>
              MarineYard connects ship owners, superintendents, chandlers and surplus dealers worldwide. Search engine
              spares, turbochargers, pumps and navigation gear — or list your own surplus in minutes.
            </p>

            <form action="/listings" method="get" className="mt-8 flex flex-col sm:flex-row gap-2 p-2 rounded-2xl shadow-xl" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
              <label className="relative flex-1">
                <span className="sr-only">Search parts</span>
                <Search className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-faint)' }} />
                <input
                  name="q"
                  placeholder="Search by part, maker or part number — e.g. Wärtsilä 6L20"
                  className="w-full pl-11 pr-3 py-3.5 rounded-xl text-[15px] bg-transparent outline-none"
                  style={{ color: 'var(--text-primary)' }}
                />
              </label>
              <button type="submit" className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl text-sm font-semibold text-white" style={{ background: 'linear-gradient(135deg,#0a5c9e,#0891b2)' }}>
                Search parts <ArrowRight className="w-4 h-4" />
              </button>
            </form>

            <div className="mt-4 flex flex-wrap items-center gap-2 text-xs" style={{ color: 'var(--text-muted)' }}>
              <span className="font-semibold">Popular:</span>
              {popular.map((slug) => {
                const c = LISTING_CATEGORIES.find((x) => x.slug === slug)!
                return (
                  <Link key={slug} href={`/listings/${slug}`} className="px-2.5 py-1 rounded-full hover:opacity-80" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
                    {c.name}
                  </Link>
                )
              })}
            </div>

            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/signup?next=/dashboard/listings/new" className="inline-flex items-center gap-2 px-6 py-3 rounded-full text-sm font-semibold text-white shadow-lg hover:opacity-90" style={{ background: '#0a1f33' }}>
                <Upload className="w-4 h-4" /> List a part — 9 free
              </Link>
              <Link href="/listings" className="inline-flex items-center gap-2 px-6 py-3 rounded-full text-sm font-semibold hover:opacity-80" style={{ border: '1px solid var(--border-hover)', color: 'var(--text-primary)' }}>
                Browse marketplace
              </Link>
            </div>
          </div>

          <HeroIllustration />
        </div>
      </section>

      {/* ── Stats band ───────────────────────────────────────── */}
      <section className="px-4 sm:px-6">
        <div className="max-w-7xl mx-auto rounded-3xl px-6 py-8 sm:py-10 grid grid-cols-2 md:grid-cols-4 gap-6 text-center" style={{ background: 'linear-gradient(120deg,#0a1f33 0%,#0a3a63 60%,#0b5a8f 100%)' }}>
          {statItems.map((s) => (
            <div key={s.label}>
              <p className="font-playfair text-3xl sm:text-4xl font-bold text-white">{s.value}</p>
              <p className="text-xs sm:text-sm mt-1" style={{ color: '#a9cde8' }}>{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Categories ───────────────────────────────────────── */}
      <section className="px-4 sm:px-6 pt-20">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3 mb-8">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.18em] mb-2" style={{ color: 'var(--accent)' }}>Browse by system</p>
              <h2 className="font-playfair text-3xl sm:text-4xl font-bold" style={{ color: 'var(--text-primary)' }}>From the engine room to the bridge</h2>
            </div>
            <Link href="/listings" className="text-sm font-semibold inline-flex items-center gap-1" style={{ color: 'var(--accent)' }}>
              All listings <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
            {LISTING_CATEGORIES.map((c) => (
              <Link
                key={c.slug}
                href={`/listings/${c.slug}`}
                className="group p-4 sm:p-5 rounded-2xl card-lift"
                style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}
              >
                <div className="w-11 h-11 rounded-xl flex items-center justify-center mb-3 transition-transform group-hover:scale-110" style={{ background: 'linear-gradient(135deg,rgba(10,92,158,0.12),rgba(8,145,178,0.16))' }}>
                  <CategoryIcon slug={c.slug} className="w-5 h-5" style={{ color: 'var(--accent)' }} />
                </div>
                <p className="font-semibold text-sm leading-snug" style={{ color: 'var(--text-primary)' }}>{c.name}</p>
                <p className="text-xs mt-1 line-clamp-2" style={{ color: 'var(--text-muted)' }}>{c.blurb}</p>
                {stats.byCategory[c.slug] ? (
                  <p className="text-[11px] mt-2 font-semibold" style={{ color: 'var(--accent)' }}>{stats.byCategory[c.slug]} listed</p>
                ) : null}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── Listings ─────────────────────────────────────────── */}
      <section className="px-4 sm:px-6 pt-20">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3 mb-8">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.18em] mb-2" style={{ color: 'var(--accent)' }}>On the market</p>
              <h2 className="font-playfair text-3xl sm:text-4xl font-bold" style={{ color: 'var(--text-primary)' }}>Featured & latest listings</h2>
            </div>
            <Link href="/listings?sort=newest" className="text-sm font-semibold inline-flex items-center gap-1" style={{ color: 'var(--accent)' }}>
              See what&apos;s new <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          {featured.length > 0 ? (
            <div className="grid gap-5 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
              {featured.map((l) => <ListingCard key={l.id} listing={l} />)}
            </div>
          ) : (
            <div className="rounded-3xl p-8 sm:p-12 grid md:grid-cols-[auto_1fr_auto] gap-6 items-center" style={{ background: 'var(--bg-card)', border: '1px dashed var(--border-hover)' }}>
              <div className="w-16 h-16 rounded-2xl flex items-center justify-center" style={{ background: 'var(--accent-bg)' }}>
                <PackageSearch className="w-8 h-8" style={{ color: 'var(--accent)' }} />
              </div>
              <div>
                <h3 className="font-playfair text-2xl font-bold mb-1" style={{ color: 'var(--text-primary)' }}>The marketplace has just opened</h3>
                <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
                  Early sellers get the most attention. List your surplus spares now — the first 9 listings on every account are free.
                </p>
              </div>
              <Link href="/signup?next=/dashboard/listings/new" className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full text-sm font-semibold text-white whitespace-nowrap" style={{ background: 'var(--btn-primary)' }}>
                <Upload className="w-4 h-4" /> Be an early seller
              </Link>
            </div>
          )}
        </div>
      </section>

      <AdSlot placement="in_content" className="px-4 pt-12" />

      {/* ── How it works ─────────────────────────────────────── */}
      <section className="px-4 sm:px-6 pt-20">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <p className="text-xs font-bold uppercase tracking-[0.18em] mb-2" style={{ color: 'var(--accent)' }}>How it works</p>
            <h2 className="font-playfair text-3xl sm:text-4xl font-bold" style={{ color: 'var(--text-primary)' }}>From storeroom shelf to new owner</h2>
          </div>
          <div className="grid lg:grid-cols-2 gap-6">
            {[
              {
                title: 'For sellers',
                icon: <Ship className="w-5 h-5" />,
                steps: [
                  { icon: <BadgeCheck className="w-5 h-5" />, t: 'Create a free account', d: '90 credits are added straight away — enough for 9 listings.' },
                  { icon: <Camera className="w-5 h-5" />, t: 'List the part', d: 'Add photos, maker, model, part number, condition, price and the port it sits in.' },
                  { icon: <MessageSquare className="w-5 h-5" />, t: 'Answer buyers', d: 'Inquiries arrive in your dashboard, with the buyer’s email and phone.' },
                ],
                cta: { href: '/signup?next=/dashboard/listings/new', label: 'Start selling' },
              },
              {
                title: 'For buyers',
                icon: <Wrench className="w-5 h-5" />,
                steps: [
                  { icon: <Search className="w-5 h-5" />, t: 'Search & filter', d: 'By system, maker, part number, condition and country.' },
                  { icon: <Mail className="w-5 h-5" />, t: 'Contact the seller', d: 'Sign in to see contact details or send a message from the listing.' },
                  { icon: <Handshake className="w-5 h-5" />, t: 'Deal directly', d: 'Agree price, inspection and shipping with the seller — no commission.' },
                ],
                cta: { href: '/listings', label: 'Find parts' },
              },
            ].map((col) => (
              <div key={col.title} className="rounded-3xl p-6 sm:p-8" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
                <div className="flex items-center gap-2 mb-6">
                  <span className="w-9 h-9 rounded-xl flex items-center justify-center text-white" style={{ background: 'linear-gradient(135deg,#0a5c9e,#0891b2)' }}>{col.icon}</span>
                  <h3 className="font-playfair text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>{col.title}</h3>
                </div>
                <ol className="space-y-5">
                  {col.steps.map((s, i) => (
                    <li key={s.t} className="flex gap-4">
                      <div className="relative flex-shrink-0">
                        <span className="w-10 h-10 rounded-full flex items-center justify-center" style={{ background: 'var(--accent-bg)', color: 'var(--accent)' }}>{s.icon}</span>
                        <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full text-[10px] font-bold flex items-center justify-center text-white" style={{ background: '#f59e0b' }}>{i + 1}</span>
                      </div>
                      <div>
                        <p className="font-semibold" style={{ color: 'var(--text-primary)' }}>{s.t}</p>
                        <p className="text-sm" style={{ color: 'var(--text-muted)' }}>{s.d}</p>
                      </div>
                    </li>
                  ))}
                </ol>
                <Link href={col.cta.href} className="mt-7 inline-flex items-center gap-1.5 text-sm font-semibold" style={{ color: 'var(--accent)' }}>
                  {col.cta.label} <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Why MarineYard ───────────────────────────────────── */}
      <section className="px-4 sm:px-6 pt-20">
        <div className="max-w-7xl mx-auto rounded-[2rem] px-6 sm:px-10 py-12 sm:py-14 relative overflow-hidden" style={{ background: 'linear-gradient(135deg,#061a2e 0%,#0a2f52 55%,#0b4f86 100%)' }}>
          <Anchor className="absolute -right-6 -bottom-6 w-56 h-56 opacity-[0.06] text-white" />
          <div className="max-w-2xl mb-10">
            <p className="text-xs font-bold uppercase tracking-[0.18em] mb-2" style={{ color: '#7cc8f0' }}>Why MarineYard</p>
            <h2 className="font-playfair text-3xl sm:text-4xl font-bold text-white">Built for how marine spares actually change hands</h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {[
              { icon: <Globe2 className="w-5 h-5" />, t: 'Worldwide reach', d: 'Every listing shows its port and country, and buyers filter by location.' },
              { icon: <Percent className="w-5 h-5" />, t: 'No commission', d: 'You keep 100% of the sale. Plans are flat and optional.' },
              { icon: <Gift className="w-5 h-5" />, t: 'Free to start', d: '9 free listings on every account — no card required.' },
              { icon: <MessageSquare className="w-5 h-5" />, t: 'Built-in inquiries', d: 'Buyers message you from the listing; replies go straight to their inbox.' },
              { icon: <Star className="w-5 h-5" />, t: 'Featured placement', d: 'Explorer and Pro listings appear first in search and categories.' },
              { icon: <ShieldCheck className="w-5 h-5" />, t: 'Moderated', d: 'Listings that break the rules are removed, and anyone can report one.' },
            ].map((f) => (
              <div key={f.t} className="rounded-2xl p-5" style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }}>
                <span className="w-10 h-10 rounded-xl flex items-center justify-center mb-3" style={{ background: 'rgba(124,200,240,0.14)', color: '#7cc8f0' }}>{f.icon}</span>
                <p className="font-semibold text-white">{f.t}</p>
                <p className="text-sm mt-1" style={{ color: '#a9cde8' }}>{f.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Plans teaser ─────────────────────────────────────── */}
      <section className="px-4 sm:px-6 pt-20">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <p className="text-xs font-bold uppercase tracking-[0.18em] mb-2" style={{ color: 'var(--accent)' }}>Plans</p>
            <h2 className="font-playfair text-3xl sm:text-4xl font-bold" style={{ color: 'var(--text-primary)' }}>Start free. Upgrade when you list more.</h2>
            <p className="text-sm sm:text-base mt-3" style={{ color: 'var(--text-muted)' }}>7-day free trial and 50% off the first month on every paid plan. Cancel anytime.</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { name: 'Free', price: '$0', note: 'forever', items: ['9 listings', 'Buyer inquiries inbox', 'Standard placement'], icon: <Gift className="w-4 h-4" /> },
              { name: 'Starter', price: '$4.99', note: '/month', items: ['12 listings / month', 'Listings live instantly', 'Up to 8 photos each'], icon: <BadgeCheck className="w-4 h-4" /> },
              { name: 'Explorer', price: '$9.99', note: '/month', items: ['55 listings / month', 'Featured badge', 'Shown above free listings'], icon: <Star className="w-4 h-4" />, hot: true },
              { name: 'Pro', price: '$19.99', note: '/month', items: ['120 listings / month', 'Top placement', 'Priority support'], icon: <Crown className="w-4 h-4" /> },
            ].map((p) => (
              <div key={p.name} className="rounded-2xl p-6 flex flex-col" style={{ background: 'var(--bg-card)', border: p.hot ? '2px solid var(--accent)' : '1px solid var(--border)' }}>
                <div className="flex items-center justify-between mb-3">
                  <span className="inline-flex items-center gap-1.5 font-semibold" style={{ color: 'var(--text-primary)' }}>
                    <span style={{ color: 'var(--accent)' }}>{p.icon}</span> {p.name}
                  </span>
                  {p.hot && <span className="text-[10px] font-bold px-2 py-0.5 rounded-full text-white" style={{ background: 'var(--accent)' }}>POPULAR</span>}
                </div>
                <p className="mb-4">
                  <span className="font-playfair text-3xl font-bold" style={{ color: 'var(--text-primary)' }}>{p.price}</span>
                  <span className="text-sm" style={{ color: 'var(--text-muted)' }}> {p.note}</span>
                </p>
                <ul className="space-y-1.5 text-sm flex-1" style={{ color: 'var(--text-muted)' }}>
                  {p.items.map((i) => <li key={i}>✓ {i}</li>)}
                </ul>
              </div>
            ))}
          </div>
          <div className="text-center mt-8">
            <Link href="/pricing" className="inline-flex items-center gap-2 px-6 py-3 rounded-full text-sm font-semibold text-white" style={{ background: 'var(--btn-primary)' }}>
              Compare plans <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* ── Resources ────────────────────────────────────────── */}
      <section className="px-4 sm:px-6 pt-20">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3 mb-8">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.18em] mb-2" style={{ color: 'var(--accent)' }}>Resources</p>
              <h2 className="font-playfair text-3xl sm:text-4xl font-bold" style={{ color: 'var(--text-primary)' }}>Marine engineering know-how</h2>
            </div>
            <Link href="/resources" className="text-sm font-semibold inline-flex items-center gap-1" style={{ color: 'var(--accent)' }}>
              All resources <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          {posts.length > 0 ? (
            <div className="grid md:grid-cols-3 gap-5">
              {posts.map((p) => {
                const href = p.slug.startsWith('/') ? p.slug : `/${p.slug}`
                return (
                  <Link key={p.slug} href={href} className="group rounded-2xl overflow-hidden card-lift flex flex-col" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
                    <div className="aspect-[16/9] overflow-hidden" style={{ background: 'linear-gradient(135deg,#0b2a4a,#0b6aa8)' }}>
                      {p.featured_image ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={p.featured_image} alt={p.title} loading="lazy" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center"><BookOpen className="w-10 h-10" style={{ color: '#bfe3f7' }} /></div>
                      )}
                    </div>
                    <div className="p-5 flex-1">
                      {p.category && <p className="text-[11px] font-bold uppercase tracking-wide mb-1" style={{ color: 'var(--accent)' }}>{p.category}</p>}
                      <h3 className="font-semibold leading-snug line-clamp-2" style={{ color: 'var(--text-primary)' }}>{p.title}</h3>
                      {p.excerpt && <p className="text-sm mt-2 line-clamp-2" style={{ color: 'var(--text-muted)' }}>{p.excerpt}</p>}
                    </div>
                  </Link>
                )
              })}
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                ['Ship machinery', 'How main engines, purifiers and boilers work — and what wears out.'],
                ['Maintenance & repair', 'Overhaul intervals, troubleshooting and running-hour planning.'],
                ['Spare parts guides', 'Reading part numbers, OEM vs. pattern parts, buying surplus safely.'],
                ['Safety & regulations', 'SOLAS, MARPOL and class rules explained for crews and owners.'],
              ].map(([t, d]) => (
                <Link key={t} href="/resources" className="rounded-2xl p-5 card-lift" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
                  <BookOpen className="w-5 h-5 mb-3" style={{ color: 'var(--accent)' }} />
                  <p className="font-semibold" style={{ color: 'var(--text-primary)' }}>{t}</p>
                  <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>{d}</p>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Admin-managed homepage blocks (Admin → Homepage) */}
      {blocks.length > 0 && (
        <section className="px-4 sm:px-6 pt-20">
          <div className="max-w-5xl mx-auto">
            <HomepageBlocks blocks={blocks} />
          </div>
        </section>
      )}

      {/* ── FAQ ──────────────────────────────────────────────── */}
      <section className="px-4 sm:px-6 py-20">
        <div className="max-w-3xl mx-auto">
          <h2 className="font-playfair text-3xl sm:text-4xl font-bold text-center mb-10" style={{ color: 'var(--text-primary)' }}>Questions, answered</h2>
          <div className="space-y-3">
            {FAQ.map((f) => (
              <details key={f.q} className="group p-5 sm:p-6 rounded-2xl" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
                <summary className="font-semibold cursor-pointer flex items-start justify-between gap-3 list-none" style={{ color: 'var(--text-primary)' }}>
                  {f.q}
                  <span className="text-xl leading-none flex-shrink-0 transition-transform group-open:rotate-45" style={{ color: 'var(--accent)' }}>+</span>
                </summary>
                <p className="mt-3 text-sm leading-relaxed" style={{ color: 'var(--text-muted)' }}>{f.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
