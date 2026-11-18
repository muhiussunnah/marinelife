import { NextResponse } from 'next/server'
import { createAdminClient as createClient } from '@/lib/db'
import { BLOG_HIDDEN_SLUGS } from '@/lib/blog-hidden-slugs'

// Cache 5 min. Was force-dynamic + selected full `content` for 20 posts on
// every sidebar render — heavy database egress for nothing but thumbnails.
// featured_image is backfilled on every post, so content is no longer needed.
export const revalidate = 300

export async function GET() {
  const supabase = createClient()

  // Popular posts: top 10 by views. No `content` — featured_image is
  // backfilled on every post, so we never pull article HTML for thumbnails.
  const { data: popular } = await supabase
    .from('blog_posts')
    .select('title, slug, featured_image, views')
    .eq('status', 'published')
    .order('views', { ascending: false, nullsFirst: false })
    .limit(10)

  // Recent posts: latest 10 by published_at — same content fallback.
  const { data: recent } = await supabase
    .from('blog_posts')
    .select('title, slug, featured_image, published_at, created_at')
    .eq('status', 'published')
    .order('published_at', { ascending: false, nullsFirst: false })
    .limit(10)

  // Hide policy / meta posts from both popular + recent rails so they
  // don't pop up alongside editorial articles in the sidebar.
  const visiblePopular = (popular ?? []).filter((p: any) => !BLOG_HIDDEN_SLUGS.has(p.slug))
  const visibleRecent  = (recent  ?? []).filter((p: any) => !BLOG_HIDDEN_SLUGS.has(p.slug))

  return NextResponse.json({
    popular: visiblePopular.map((p: any) => ({
      title: p.title,
      slug: p.slug,
      // featured_image is backfilled from the first content <img> on
      // save, so the /resources grid and the sidebar show the same image.
      image: p.featured_image || '',
      views: p.views || 0,
    })),
    recent: visibleRecent.map((p: any) => ({
      title: p.title,
      slug: p.slug,
      image: p.featured_image || '',
      date: new Date(p.published_at || p.created_at).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      }),
    })),
  })
}
