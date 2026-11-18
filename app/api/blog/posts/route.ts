import { NextResponse } from 'next/server'
import { createAdminClient as createClient } from '@/lib/db'
import { BLOG_HIDDEN_SLUGS } from '@/lib/blog-hidden-slugs'
import { DEFAULT_RESOURCE_CATEGORY } from '@/lib/content-helpers'

// Cache for 5 minutes (ISR). This used to be force-dynamic + revalidate 0,
// which re-queried Supabase on EVERY call AND pulled every post's full HTML
// `content` (only to derive a thumbnail) — the dominant source of database
// egress that exhausted the free-tier quota. We now (a) never select
// `content` here (featured_image + excerpt are backfilled on every post) and
// (b) cache the response, so bots/repeat visitors don't re-hit the database.
export const revalidate = 300

export async function GET() {
  // Use service role key for reliable server-side reads (bypasses RLS)
  const supabase = createClient()

  // Intentionally does NOT select `content`: featured_image + excerpt are
  // backfilled on every post, so the multi-KB article HTML never needs to
  // leave the database just to build listing cards.
  const { data: posts, error } = await supabase
    .from('blog_posts')
    .select('id, title, slug, excerpt, featured_image, category, is_premium, views, read_time, status, created_at, published_at')
    .eq('status', 'published')
    .order('published_at', { ascending: false, nullsFirst: false })
    .order('created_at', { ascending: false })

  if (error) {
    console.error('[blog/posts] Supabase error:', error.message)
    return NextResponse.json({ posts: [] })
  }

  // Drop policy / meta posts from the listing — direct URLs still work,
  // they just don't mix in alongside editorial articles.
  // Then map to the article format used by the /resources client.
  const mapped = (posts ?? [])
    .filter((p: any) => !BLOG_HIDDEN_SLUGS.has(p.slug))
    .map((p: any) => ({
    id: p.id,
    title: p.title,
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

  return NextResponse.json({ posts: mapped })
}
