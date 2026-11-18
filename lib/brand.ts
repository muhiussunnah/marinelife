/**
 * MarineYard — one place for the brand name, domain and contact details.
 * Import from here instead of hard-coding the strings in new code.
 */
export const BRAND = {
  name: 'MarineYard',
  shortName: 'MarineYard',
  domain: 'marineyard.com',
  url: (process.env.NEXT_PUBLIC_SITE_URL || 'https://marineyard.com').replace(/\/$/, ''),
  tagline: 'The global marketplace for ship parts & marine equipment',
  description:
    'Buy and sell ship spare parts, marine engines and equipment worldwide. List your parts for free, reach buyers in every port, and read practical marine engineering resources.',
  supportEmail: 'support@marineyard.com',
  ogImage: '/og-marineyard.png',
} as const

export function absoluteUrl(path = '/') {
  return `${BRAND.url}${path.startsWith('/') ? path : `/${path}`}`
}
