import type { Metadata } from 'next'
import PricingClient from './PricingClient'
import { BRAND } from '@/lib/brand'

const title = 'Pricing & Plans — MarineYard Ship Parts Marketplace'
const description =
  'List 9 ship parts free. Paid plans from $4.99/month add 12–120 listings a month, featured placement and priority support. 7-day free trial, cancel anytime.'

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: `${BRAND.url}/pricing` },
  openGraph: {
    type: 'website',
    title,
    description,
    url: `${BRAND.url}/pricing`,
    images: [{ url: `${BRAND.url}${BRAND.ogImage}`, width: 1200, height: 630 }],
  },
}

export default function PricingPage() {
  return <PricingClient />
}
