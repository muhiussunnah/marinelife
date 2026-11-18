import { Shield, Zap, Globe, Search, BookOpen, AlertTriangle, CheckCircle2, Anchor, Ship, Wrench, ArrowRight, Package, Recycle, UserPlus, Upload, MessageSquare, ShieldCheck, FileText, Store } from 'lucide-react'
import Link from 'next/link'
import type { Metadata } from 'next'
import { BRAND, absoluteUrl } from '@/lib/brand'

export const metadata: Metadata = {
  title: 'About MarineYard – Global Marketplace for Ship Parts',
  description: 'Learn about MarineYard — the global marketplace where ship owners, chandlers, surplus dealers and marine engineers list and find ship spare parts and marine equipment.',
  alternates: { canonical: absoluteUrl('/about') },
  openGraph: {
    type: 'website',
    title: 'About MarineYard – Connecting the Maritime World with the Parts It Needs',
    description: 'Our mission: make it simple to list, find and reuse ship spare parts and marine equipment worldwide — less waste, less downtime.',
    url: absoluteUrl('/about'),
    images: [{ url: absoluteUrl(BRAND.ogImage), width: 1200, height: 630 }],
  },
}

const schemaData = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'Organization',
      '@id': absoluteUrl('/#organization'),
      name: BRAND.name,
      url: BRAND.url,
      description: BRAND.description,
      email: BRAND.supportEmail,
      areaServed: 'Worldwide',
      knowsAbout: [
        'Ship Spare Parts',
        'Marine Equipment',
        'Marine Engines',
        'Turbochargers',
        'Marine Pumps',
        'Navigation Equipment',
        'Deck Machinery',
        'Marine Engineering',
      ],
      hasOfferCatalog: {
        '@type': 'OfferCatalog',
        name: 'MarineYard Listing Plans',
        itemListElement: [
          { '@type': 'Offer', itemOffered: { '@type': 'Service', name: 'Free Marketplace Listings' } },
          { '@type': 'Offer', itemOffered: { '@type': 'Service', name: 'Featured Listing Plans' } },
        ],
      },
    },
    {
      '@type': 'WebPage',
      '@id': absoluteUrl('/about'),
      url: absoluteUrl('/about'),
      name: 'About MarineYard – Global Marketplace for Ship Parts',
      description: 'Learn about MarineYard, our mission to connect the maritime industry with the spare parts it needs, and how the marketplace works.',
      isPartOf: { '@id': absoluteUrl('/#website') },
      breadcrumb: {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Home', item: BRAND.url },
          { '@type': 'ListItem', position: 2, name: 'About', item: absoluteUrl('/about') },
        ],
      },
    },
  ],
}

const STATS = [
  { value: '9', label: 'Free Listings', desc: 'Every free account includes 90 credits — enough for 9 listings, no card required', icon: Package },
  { value: '7-Day', label: 'Free Trial', desc: 'Paid plans start with a 7-day free trial and 50% off the first month. Cancel anytime', icon: CheckCircle2 },
  { value: 'Direct', label: 'Buyer to Seller', desc: 'Buyers contact sellers directly — no middleman, and we never hold your money', icon: MessageSquare },
  { value: 'Global', label: 'Reach', desc: 'List a part once and put it in front of buyers in ports all over the world', icon: Globe },
]

const STEPS = [
  {
    step: '01',
    icon: UserPlus,
    title: 'Create a Free Account',
    desc: 'Sign up with your email or Google account in under a minute. Your free account includes 90 credits — enough for 9 listings.',
  },
  {
    step: '02',
    icon: Upload,
    title: 'List Your Part',
    desc: 'Add clear photos, the maker, model and part number, condition, quantity and where the part is located. Each listing uses 10 credits.',
  },
  {
    step: '03',
    icon: MessageSquare,
    title: 'Buyers Contact You',
    desc: 'Interested buyers reach you directly. You agree the price, payment and shipping between yourselves — MarineYard is not a party to the sale.',
  },
]

const TECH = [
  {
    icon: Search,
    title: 'Built for Marine Equipment',
    desc: 'Listings cover the parts ships actually need — main and auxiliary engine spares, turbochargers, pumps, purifiers, compressors, navigation gear, deck machinery and more.',
  },
  {
    icon: FileText,
    title: 'Detailed, Useful Listings',
    desc: 'Every listing can carry the maker, model, part number, condition and location, so buyers can match the right part to their equipment before they get in touch.',
  },
  {
    icon: ShieldCheck,
    title: 'Moderated Marketplace',
    desc: 'Listings may be reviewed by our moderators, and anything that breaks our rules — stolen goods, weapons, counterfeit parts — is removed.',
  },
  {
    icon: BookOpen,
    title: 'Marine Engineering Resources',
    desc: 'Our Resources section publishes practical articles on marine machinery, maintenance and spares to help engineers and buyers make better decisions.',
  },
]

const VALUES = [
  {
    icon: Shield,
    color: '#ef4444',
    bg: '#ef444415',
    title: 'Honest Listings',
    desc: 'We ask sellers to describe parts accurately — real photos of the actual item, correct part numbers, true condition. Listings that mislead buyers or break our rules are removed.',
  },
  {
    icon: Recycle,
    color: '#3b82f6',
    bg: '#3b82f615',
    title: 'Less Waste, Less Downtime',
    desc: 'A surplus spare sitting in a warehouse can keep another vessel running. Reusing good parts shortens lead times, reduces off-hire and keeps serviceable equipment out of the scrapyard.',
  },
  {
    icon: Globe,
    color: '#0891b2',
    bg: '#0891b215',
    title: 'Open to Everyone',
    desc: 'Anyone can create an account and list — a ship owner clearing a store room, a chandler, a surplus dealer or an engineer with one spare pump. Free accounts get 9 listings.',
  },
  {
    icon: BookOpen,
    color: '#f59e0b',
    bg: '#f59e0b15',
    title: 'Practical Knowledge',
    desc: 'Finding the right part starts with understanding the machinery. Our Resources articles share practical marine engineering know-how, free to read.',
  },
]

export default function AboutPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaData) }} />

      <div className="min-h-screen pt-24 pb-20" style={{ background: 'var(--bg-primary)' }}>

        {/* ── Hero ──────────────────────────────────────────── */}
        <section className="max-w-4xl mx-auto px-5 md:px-6 text-center mb-24">
          <nav className="flex items-center justify-center gap-2 text-xs mb-10" style={{ color: 'var(--text-faint)' }}>
            <Link href="/" className="hover:underline" style={{ color: 'var(--accent)' }}>Home</Link>
            <span>/</span>
            <span>About</span>
          </nav>

          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-semibold mb-8" style={{ background: 'var(--accent-bg)', color: 'var(--accent)', border: '1px solid var(--accent)' }}>
            <Anchor className="w-3.5 h-3.5" />
            Our Story &amp; Mission
          </div>

          <h1 className="font-playfair text-4xl md:text-6xl font-bold leading-tight mb-6" style={{ color: 'var(--text-primary)' }}>
            Keeping Ships Running<br />
            <span style={{ color: 'var(--accent)' }}>With the Right Parts</span><br />
            From Any Port
          </h1>
          <p className="text-lg md:text-xl leading-relaxed max-w-2xl mx-auto" style={{ color: 'var(--text-muted)' }}>
            MarineYard is a global marketplace where ship owners, superintendents, chandlers, surplus dealers and marine engineers list and find ship spare parts and marine equipment — from engine components and turbochargers to pumps, navigation gear and deck machinery.
          </p>
        </section>

        {/* ── Stats ─────────────────────────────────────────── */}
        <section className="max-w-5xl mx-auto px-5 md:px-6 mb-24" aria-label="Platform highlights">
          <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-5">
            {STATS.map((s) => (
              <div key={s.label} className="p-6 rounded-2xl flex flex-col" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
                <s.icon className="w-6 h-6 mb-4" style={{ color: 'var(--accent)' }} />
                <p className="font-playfair text-3xl font-bold mb-1" style={{ color: 'var(--text-primary)' }}>{s.value}</p>
                <p className="text-sm font-semibold mb-2" style={{ color: 'var(--accent)' }}>{s.label}</p>
                <p className="text-xs leading-relaxed" style={{ color: 'var(--text-faint)' }}>{s.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ── Mission + Vision ──────────────────────────────── */}
        <section className="max-w-4xl mx-auto px-5 md:px-6 mb-24" aria-labelledby="mission-heading">
          <div className="grid md:grid-cols-2 gap-6">
            <div className="p-8 rounded-2xl" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
              <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-5" style={{ background: 'var(--accent-bg)' }}>
                <Zap className="w-5 h-5" style={{ color: 'var(--accent)' }} />
              </div>
              <h2 id="mission-heading" className="font-playfair text-2xl font-bold mb-4" style={{ color: 'var(--text-primary)' }}>Our Mission</h2>
              <p className="leading-relaxed mb-4" style={{ color: 'var(--text-muted)' }}>
                To make it simple for anyone in the maritime industry to list, find and source ship spare parts and marine equipment — wherever the vessel is trading and whoever holds the part.
              </p>
              <p className="leading-relaxed" style={{ color: 'var(--text-muted)' }}>
                When a critical spare is hard to find, a vessel waits. Connecting the people who need parts with the people who have them cuts downtime and costly emergency orders.
              </p>
            </div>

            <div className="p-8 rounded-2xl" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
              <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-5" style={{ background: '#0891b215' }}>
                <Ship className="w-5 h-5" style={{ color: '#0891b2' }} />
              </div>
              <h2 className="font-playfair text-2xl font-bold mb-4" style={{ color: 'var(--text-primary)' }}>Our Vision</h2>
              <p className="leading-relaxed mb-4" style={{ color: 'var(--text-muted)' }}>
                A maritime industry where good spare parts are reused, not scrapped — where surplus stock from one fleet keeps another fleet sailing.
              </p>
              <p className="leading-relaxed" style={{ color: 'var(--text-muted)' }}>
                We want a more connected, less wasteful supply chain for ship spares, built on honest, detailed listings and direct contact between buyers and sellers.
              </p>
            </div>
          </div>
        </section>

        {/* ── Who runs this site ─────────────────────────── */}
        <section className="max-w-4xl mx-auto px-5 md:px-6 mb-24" aria-labelledby="team-heading">
          <div className="p-8 rounded-2xl" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
            <h2 id="team-heading" className="font-playfair text-2xl font-bold mb-4" style={{ color: 'var(--text-primary)' }}>Who Runs MarineYard</h2>
            <p className="leading-relaxed mb-4" style={{ color: 'var(--text-muted)' }}>
              MarineYard is built and run by the MarineYard team, who look after the marketplace, listing moderation and our Resources section. Resources articles are published under the MarineYard Editorial Team byline and link the sources they rely on.
            </p>
            <p className="leading-relaxed" style={{ color: 'var(--text-muted)' }}>
              MarineYard is a listing venue, not a seller: we don&apos;t take part in sales, hold payments or inspect the parts listed here. Our{' '}
              <Link href="/editorial-policy" className="underline" style={{ color: 'var(--accent)' }}>editorial policy</Link>
              {' '}explains how we research and correct our articles.
            </p>
          </div>
        </section>

        {/* ── How It Works ──────────────────────────────────── */}
        <section className="max-w-5xl mx-auto px-5 md:px-6 mb-24" aria-labelledby="how-it-works-heading">
          <div className="text-center mb-12">
            <h2 id="how-it-works-heading" className="font-playfair text-3xl md:text-4xl font-bold mb-4" style={{ color: 'var(--text-primary)' }}>
              How MarineYard Works
            </h2>
            <p className="text-lg max-w-xl mx-auto" style={{ color: 'var(--text-muted)' }}>
              Three steps from a spare part on the shelf to a buyer in another port.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {STEPS.map((step) => (
              <div key={step.step} className="relative p-8 rounded-2xl" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
                <div className="text-5xl font-playfair font-bold mb-4 opacity-10 select-none" style={{ color: 'var(--accent)' }}>
                  {step.step}
                </div>
                <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-4" style={{ background: 'var(--accent-bg)' }}>
                  <step.icon className="w-5 h-5" style={{ color: 'var(--accent)' }} />
                </div>
                <h3 className="font-semibold text-lg mb-3" style={{ color: 'var(--text-primary)' }}>{step.title}</h3>
                <p className="text-sm leading-relaxed" style={{ color: 'var(--text-muted)' }}>{step.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ── Technology ────────────────────────────────────── */}
        <section className="max-w-5xl mx-auto px-5 md:px-6 mb-24" aria-labelledby="technology-heading">
          <div className="text-center mb-12">
            <h2 id="technology-heading" className="font-playfair text-3xl md:text-4xl font-bold mb-4" style={{ color: 'var(--text-primary)' }}>
              Built for the Maritime Industry
            </h2>
            <p className="text-lg max-w-xl mx-auto" style={{ color: 'var(--text-muted)' }}>
              A marketplace designed around how ship spares are actually bought and sold.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 gap-5">
            {TECH.map((t) => (
              <div key={t.title} className="p-6 rounded-2xl flex gap-5" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
                <div className="flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'var(--accent-bg)' }}>
                  <t.icon className="w-5 h-5" style={{ color: 'var(--accent)' }} />
                </div>
                <div>
                  <h3 className="font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>{t.title}</h3>
                  <p className="text-sm leading-relaxed" style={{ color: 'var(--text-muted)' }}>{t.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ── Values ────────────────────────────────────────── */}
        <section className="max-w-5xl mx-auto px-5 md:px-6 mb-24" aria-labelledby="values-heading">
          <div className="text-center mb-12">
            <h2 id="values-heading" className="font-playfair text-3xl md:text-4xl font-bold mb-4" style={{ color: 'var(--text-primary)' }}>
              What We Stand For
            </h2>
            <p className="text-lg max-w-xl mx-auto" style={{ color: 'var(--text-muted)' }}>
              Four principles guide every decision we make — from how listings work to what we publish.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 gap-5">
            {VALUES.map((v) => (
              <div key={v.title} className="p-8 rounded-2xl" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
                <div className="w-11 h-11 rounded-xl flex items-center justify-center mb-5" style={{ background: v.bg }}>
                  <v.icon className="w-5 h-5" style={{ color: v.color }} />
                </div>
                <h3 className="font-playfair text-xl font-bold mb-3" style={{ color: 'var(--text-primary)' }}>{v.title}</h3>
                <p className="text-sm leading-relaxed" style={{ color: 'var(--text-muted)' }}>{v.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ── Safety Commitment ─────────────────────────────── */}
        <section className="max-w-4xl mx-auto px-5 md:px-6 mb-24" aria-labelledby="safety-commitment-heading">
          <div className="p-8 md:p-10 rounded-2xl" style={{ background: '#ef444410', border: '1px solid #ef444430' }}>
            <div className="flex items-start gap-5">
              <div className="flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center" style={{ background: '#ef444420' }}>
                <AlertTriangle className="w-6 h-6" style={{ color: '#ef4444' }} />
              </div>
              <div>
                <h2 id="safety-commitment-heading" className="font-playfair text-2xl font-bold mb-4" style={{ color: 'var(--text-primary)' }}>
                  Trade Safely on MarineYard
                </h2>
                <p className="leading-relaxed mb-4" style={{ color: 'var(--text-muted)' }}>
                  MarineYard connects buyers and sellers — it is <strong style={{ color: 'var(--text-primary)' }}>not a party to any sale</strong>. We don&apos;t hold payments, inspect parts or guarantee that a listing is accurate, genuine or fit for your equipment.
                </p>
                <p className="leading-relaxed mb-6" style={{ color: 'var(--text-muted)' }}>
                  <strong style={{ color: 'var(--text-primary)' }}>Before you pay, check the part against your equipment.</strong> Confirm the maker, model and part number, ask for photos of the actual item and any certificates or test reports, and use a payment method you trust. If a deal looks too good to be true, report the listing.
                </p>
                <div className="flex flex-wrap gap-4">
                  <div className="flex items-center gap-2 text-sm font-medium" style={{ color: '#ef4444' }}>
                    <CheckCircle2 className="w-4 h-4" />
                    Verify part numbers
                  </div>
                  <div className="flex items-center gap-2 text-sm font-medium" style={{ color: '#ef4444' }}>
                    <CheckCircle2 className="w-4 h-4" />
                    Ask for certificates
                  </div>
                  <div className="flex items-center gap-2 text-sm font-medium" style={{ color: '#ef4444' }}>
                    <CheckCircle2 className="w-4 h-4" />
                    Report suspicious listings
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── Who We Serve ──────────────────────────────────── */}
        <section className="max-w-4xl mx-auto px-5 md:px-6 mb-24" aria-labelledby="who-we-serve-heading">
          <div className="text-center mb-10">
            <h2 id="who-we-serve-heading" className="font-playfair text-3xl font-bold mb-4" style={{ color: 'var(--text-primary)' }}>
              Who MarineYard Is For
            </h2>
          </div>
          <div className="grid sm:grid-cols-3 gap-5">
            {[
              { icon: Ship, label: 'Ship Owners & Superintendents', desc: 'Source hard-to-find spares for your fleet, and turn surplus stock from sold or scrapped vessels into value.' },
              { icon: Store, label: 'Chandlers & Surplus Dealers', desc: 'Put your inventory of new, used and reconditioned marine equipment in front of buyers around the world.' },
              { icon: Wrench, label: 'Marine Engineers & Crew', desc: 'Find the right part for the machinery you maintain, and learn from practical articles in our Resources section.' },
            ].map((item) => (
              <div key={item.label} className="p-6 rounded-2xl text-center" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
                <div className="w-10 h-10 rounded-xl flex items-center justify-center mx-auto mb-4" style={{ background: 'var(--accent-bg)' }}>
                  <item.icon className="w-5 h-5" style={{ color: 'var(--accent)' }} />
                </div>
                <h3 className="font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>{item.label}</h3>
                <p className="text-sm leading-relaxed" style={{ color: 'var(--text-muted)' }}>{item.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ── CTA ───────────────────────────────────────────── */}
        <section className="max-w-3xl mx-auto px-5 md:px-6 text-center">
          <div className="p-10 md:p-14 rounded-3xl" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
            <h2 className="font-playfair text-3xl md:text-4xl font-bold mb-4" style={{ color: 'var(--text-primary)' }}>
              Have Spare Parts to Sell?
            </h2>
            <p className="text-lg mb-8" style={{ color: 'var(--text-muted)' }}>
              Create a free account and list up to 9 parts — or browse what other sellers have already listed.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/dashboard/listings/new"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-full text-base font-semibold glow-green hover:opacity-90 transition-opacity"
                style={{ background: 'var(--btn-primary)', color: '#fff' }}
              >
                List a Part Free
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/listings"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-full text-base font-semibold transition-opacity hover:opacity-80"
                style={{ background: 'var(--bg-primary)', border: '1px solid var(--border)', color: 'var(--text-primary)' }}
              >
                Browse Listings
              </Link>
            </div>
          </div>
        </section>

      </div>
    </>
  )
}
