import { createAdminClient as createClient } from '@/lib/db'
import { getListingSitemapEntries } from '@/lib/listings'
import { LISTING_CATEGORIES, categoryPath } from '@/lib/listings-meta'
import { BRAND } from '@/lib/brand'

// Sitemap entries (static pages, marketplace categories, listings and
// published Resources articles, each with its images), served as XML by
// app/sitemap.xml/route.ts on every request. (A sitemap.ts metadata route is
// frozen at build time in Next 13.5, so new posts never showed up.)

const BASE_URL = BRAND.url

export interface SitemapEntry {
  url: string
  lastModified?: Date
  changeFrequency?: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never'
  priority?: number
  /** absolute image URLs for <image:image> blocks */
  images?: string[]
}

/** Absolute URL for an image path found in a post or listing. */
function absoluteImage(src: string): string | null {
  const s = String(src || '').trim().replace(/&amp;/g, '&')
  if (!s || s.startsWith('data:')) return null
  if (/^https?:\/\//i.test(s)) return s
  if (s.startsWith('//')) return `https:${s}`
  return `${BASE_URL}${s.startsWith('/') ? '' : '/'}${s}`
}

/** Featured image + every <img src> in the article HTML, absolute and de-duplicated. */
export function articleImages(featured: string | null | undefined, html: string | null | undefined): string[] {
  const out = new Set<string>()
  const add = (u: string | null) => {
    if (u) out.add(u)
  }
  add(absoluteImage(featured || ''))
  const re = /<img\b[^>]*?\ssrc\s*=\s*(?:"([^"]+)"|'([^']+)')/gi
  let m: RegExpExecArray | null
  while ((m = re.exec(String(html || '')))) add(absoluteImage(m[1] || m[2] || ''))
  return Array.from(out)
}

export default async function sitemap(): Promise<SitemapEntry[]> {
  const lastMod = new Date('2026-11-19')

  const staticPages: SitemapEntry[] = [
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

  const categoryPages: SitemapEntry[] = LISTING_CATEGORIES.map((c) => ({
    url: `${BASE_URL}${categoryPath(c.slug)}`,
    lastModified: lastMod,
    changeFrequency: 'daily' as const,
    priority: 0.85,
  }))

  const listingPages: SitemapEntry[] = (await getListingSitemapEntries()).map((l) => ({
    url: `${BASE_URL}/listings/${l.slug}`,
    lastModified: new Date(l.updated_at),
    changeFrequency: 'weekly' as const,
    priority: 0.7,
    images: (l.images || []).map((src) => absoluteImage(src)).filter(Boolean) as string[],
  }))

  let postPages: SitemapEntry[] = []
  try {
    const { data: posts } = await createClient()
      .from('blog_posts')
      .select('slug, updated_at, published_at, created_at, featured_image, content')
      .eq('status', 'published')
    postPages = ((posts ?? []) as any[]).map((p) => ({
      url: `${BASE_URL}${String(p.slug).startsWith('/') ? p.slug : `/${p.slug}`}`,
      lastModified: new Date(p.updated_at || p.published_at || p.created_at),
      changeFrequency: 'monthly' as const,
      priority: 0.8,
      images: articleImages(p.featured_image, p.content),
    }))
  } catch (err) {
    console.error('[sitemap] Failed to fetch posts:', err)
  }

  return [...staticPages, ...categoryPages, ...listingPages, ...postPages]
}
