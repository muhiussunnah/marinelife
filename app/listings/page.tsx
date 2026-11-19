import type { Metadata } from 'next'
import ListingsBrowser, { hasListingFilters, type SP } from '@/components/listings/ListingsBrowser'
import { BRAND } from '@/lib/brand'

export const dynamic = 'force-dynamic'

const TITLE = 'Ship Spare Parts & Marine Equipment for Sale | MarineYard'
const DESCRIPTION =
  'Browse ship spare parts, marine engines, turbochargers, pumps, navigation and deck equipment listed by sellers worldwide. List your own parts free.'

export async function generateMetadata({ searchParams }: { searchParams: SP }): Promise<Metadata> {
  return {
    title: TITLE,
    description: DESCRIPTION,
    alternates: { canonical: `${BRAND.url}/listings` },
    robots: hasListingFilters(searchParams) ? { index: false, follow: true } : undefined,
    openGraph: { title: TITLE, description: DESCRIPTION, url: `${BRAND.url}/listings`, type: 'website' },
  }
}

export default function ListingsPage({ searchParams }: { searchParams: SP }) {
  return <ListingsBrowser searchParams={searchParams} />
}
