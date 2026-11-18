import { MetadataRoute } from 'next'
import { createAdminClient as createClient } from '@/lib/db'
import { getListingSitemapEntries } from '@/lib/listings'
import { LISTING_CATEGORIES } from '@/lib/listings-meta'
import { BRAND } from '@/lib/brand'

// Sitemap entries (static pages, marketplace categories, listings and
// published Resources articles), served as XML by app/sitemap.xml/route.ts on
// every request. (A sitemap.ts metadata route is frozen at build time in
// Next 13.5, so new posts never showed up.)

const BASE_URL = BRAND.url

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const lastMod = new Date('2026-11-18')

  const staticPages: MetadataRoute.Sitemap = [
    { url: `${BASE_URL}/`, lastModified: lastMod, changeFrequency: 'daily', priority: 1.0 },
    { url: `${BASE_URL}/listings`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.95 },
    { url: `${BASE_URL}/resources`, lastModified: lastMod, changeFrequency: 'weekly', priority: 0.9 },
    { url: `${BASE_URL}/pricing`, lastModified: lastMod, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${BASE_URL}/about`, lastModified: lastMod, changeFrequency: 'monthly', priority: 0.6 },
    { url: `${BASE_URL}/contact`, lastModified: lastMod, changeFrequency: 'monthly', priority: 0.6 },
    { url: `${BASE_URL}/privacy`, lastModified: lastMod, changeFrequency: 'yearly', priority: 0.3 },
    { url: `${BASE_URL}/terms`, lastModified: lastMod, changeFrequency: 'yearly', priority: 0.3 },
    { url: `${BASE_URL}/refund`, lastModified: lastMod, changeFrequency: 'yearly', priority: 0.3 },
  ]

  const categoryPages: MetadataRoute.Sitemap = LISTING_CATEGORIES.map((c) => ({
    url: `${BASE_URL}/listings?category=${c.slug}`,
    lastModified: lastMod,
    changeFrequency: 'daily' as const,
    priority: 0.85,
  }))

  const listingPages: MetadataRoute.Sitemap = (await getListingSitemapEntries()).map((l) => ({
    url: `${BASE_URL}/listings/${l.slug}`,
    lastModified: new Date(l.updated_at),
    changeFrequency: 'weekly' as const,
    priority: 0.7,
  }))

  let postPages: MetadataRoute.Sitemap = []
  try {
    const { data: posts } = await createClient()
      .from('blog_posts')
      .select('slug, updated_at, published_at, created_at')
      .eq('status', 'published')
    postPages = ((posts ?? []) as any[]).map((p) => ({
      url: `${BASE_URL}${String(p.slug).startsWith('/') ? p.slug : `/${p.slug}`}`,
      lastModified: new Date(p.updated_at || p.published_at || p.created_at),
      changeFrequency: 'monthly' as const,
      priority: 0.8,
    }))
  } catch (err) {
    console.error('[sitemap] Failed to fetch posts:', err)
  }

  return [...staticPages, ...categoryPages, ...listingPages, ...postPages]
}
