import type { Metadata } from 'next'
import Link from 'next/link'
import ContactPageClient from './ContactPageClient'
import { BRAND, absoluteUrl } from '@/lib/brand'

export const metadata: Metadata = {
  title: 'Contact MarineYard – Support & Inquiries',
  description: 'Contact MarineYard for help with your account, listings, plans and billing, to report a listing, or about partnerships. We reply within 24 hours on business days.',
  alternates: { canonical: absoluteUrl('/contact') },
  openGraph: {
    type: 'website',
    title: 'Contact MarineYard – We\'re Here to Help',
    description: 'Reach our support team about listings, accounts, plans or a suspicious listing, and browse our FAQ. Response within 24 hours.',
    url: absoluteUrl('/contact'),
    images: [{ url: absoluteUrl(BRAND.ogImage), width: 1200, height: 630 }],
  },
}

const schemaData = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'ContactPage',
      '@id': absoluteUrl('/contact'),
      url: absoluteUrl('/contact'),
      name: 'Contact MarineYard',
      description: 'Contact our support team for questions about accounts, listings, plans and billing on the MarineYard ship parts marketplace.',
      isPartOf: { '@id': absoluteUrl('/#website') },
      breadcrumb: {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Home', item: BRAND.url },
          { '@type': 'ListItem', position: 2, name: 'Contact', item: absoluteUrl('/contact') },
        ],
      },
    },
    {
      '@type': 'FAQPage',
      mainEntity: [
        {
          '@type': 'Question',
          name: 'Is it free to list ship parts on MarineYard?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Yes. Every free account includes 90 credits, enough for 9 listings (each listing uses 10 credits). Paid plans add more listings every month: Starter $4.99/mo for 12 listings, Explorer $9.99/mo for 55 listings with featured placement, and Pro $19.99/mo for 120 listings with top placement and priority support.',
          },
        },
        {
          '@type': 'Question',
          name: 'How do I list a part for sale?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Create a free account with your email or Google, then open your dashboard and add a new listing. Include clear photos, the maker, model and part number, condition, quantity, price and location, then submit.',
          },
        },
        {
          '@type': 'Question',
          name: 'Does MarineYard handle payment or shipping?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'No. MarineYard is a listing venue. Buyers contact sellers directly and agree price, payment and shipping between themselves. MarineYard is not a party to the sale, does not hold money and does not guarantee parts.',
          },
        },
        {
          '@type': 'Question',
          name: 'How do I report a suspicious or prohibited listing?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Use the contact form with the subject "Report a Listing" and include the listing link and what is wrong. Our moderators review reports and remove listings that break our rules, such as stolen goods, weapons or counterfeit parts.',
          },
        },
        {
          '@type': 'Question',
          name: 'Can I cancel my plan or get a refund?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Yes. Paid plans are monthly and can be cancelled at any time. Billing is handled by Paddle, our Merchant of Record, and you can request a refund within 14 days of a charge.',
          },
        },
        {
          '@type': 'Question',
          name: 'How long does it take to get a response from support?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'We aim to respond to all support enquiries within 24 hours on business days (Monday–Friday). Reports of fraudulent or prohibited listings are prioritised.',
          },
        },
      ],
    },
  ],
}

export default function ContactPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaData) }} />
      <div className="min-h-screen pt-24 pb-20" style={{ background: 'var(--bg-primary)' }}>
        <div className="max-w-5xl mx-auto px-5 md:px-6">

          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-xs mb-10" style={{ color: 'var(--text-faint)' }}>
            <Link href="/" className="hover:underline" style={{ color: 'var(--accent)' }}>Home</Link>
            <span>/</span>
            <span>Contact</span>
          </nav>

          <ContactPageClient />
        </div>
      </div>
    </>
  )
}
