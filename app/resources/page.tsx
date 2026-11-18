import type { Metadata } from 'next'
import { createAdminClient as createClient } from '@/lib/db'
import ResourcesPageClient, { type ResourceArticle } from './ResourcesPageClient'
import { BLOG_HIDDEN_SLUGS } from '@/lib/blog-hidden-slugs'
import { DEFAULT_RESOURCE_CATEGORY } from '@/lib/content-helpers'
import { BRAND, absoluteUrl } from '@/lib/brand'

// ISR: re-render at most every 5 minutes. New posts surface sooner thanks to
// revalidatePath('/resources') calls from the admin + Writerfy publish routes
// and the scheduled-publishing cron.
export const revalidate = 300

const TITLE = 'Marine Resources – Ship Machinery, Maintenance & Spare Parts Guides'
const DESCRIPTION =
  'Practical marine engineering articles: ship machinery, marine engines, maintenance and repair, SOLAS & MARPOL safety rules, navigation electronics, careers at sea and how to buy the right spare parts.'

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: absoluteUrl('/resources') },
  openGraph: {
    type: 'website',
    siteName: BRAND.name,
    title: TITLE,
    description: DESCRIPTION,
    url: absoluteUrl('/resources'),
    images: [{ url: absoluteUrl(BRAND.ogImage), width: 1200, height: 630, alt: `${BRAND.name} Resources` }],
  },
  twitter: {
    card: 'summary_large_image',
    title: `${BRAND.name} Resources – Marine Engineering Guides`,
    description: 'Ship machinery, maintenance, safety & regulations, and spare parts buying guides.',
  },
}

// Fetch published posts at request time so the count is correct on first paint.
// Any failure (missing table, network) degrades to an empty list, which the
// client renders as a clean "No articles yet" state.
async function getDbPosts(): Promise<ResourceArticle[]> {
  try {
    const supabase = createClient()

    const { data: posts, error } = await supabase
      .from('blog_posts')
      .select('id, title, slug, excerpt, featured_image, category, is_premium, views, read_time, status, created_at, published_at')
      .eq('status', 'published')
      .order('published_at', { ascending: false, nullsFirst: false })
      .order('created_at', { ascending: false })

    if (error) {
      console.error('[resources] Supabase error:', error.message)
      return []
    }

    // Drop policy / meta posts (e.g. Editorial Policy) from the listing.
    // Their direct URLs still work — they just don't mix in with articles.
    return (posts ?? [])
      .filter((p: any) => p?.slug && !BLOG_HIDDEN_SLUGS.has(p.slug))
      .map((p: any): ResourceArticle => ({
        id: p.id,
        title: p.title || 'Untitled article',
        // excerpt is backfilled on every post, so `content` is never pulled here.
        excerpt: p.excerpt || '',
        category: p.category || DEFAULT_RESOURCE_CATEGORY,
        date: p.published_at
          ? new Date(p.published_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
          : '',
        // read_time is stored as e.g. "7 min read" (or a bare number on old rows).
        readTime: `${parseInt(String(p.read_time ?? ''), 10) || 5} min`,
        slug: p.slug,
        image: p.featured_image || '',
        views: p.views || 0,
        is_premium: p.is_premium || false,
      }))
  } catch {
    return []
  }
}

export default async function ResourcesPage() {
  const dbPosts = await getDbPosts()
  return <ResourcesPageClient dbPosts={dbPosts} />
}
