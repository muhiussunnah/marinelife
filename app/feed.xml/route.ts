import { createAdminClient as createClient } from '@/lib/db'
import { BLOG_HIDDEN_SLUGS } from '@/lib/blog-hidden-slugs'
import { BRAND } from '@/lib/brand'

// Rebuilt from the database at most every 5 minutes (publish routes also
// call revalidatePath('/feed.xml')).
export const revalidate = 300

const SITE_URL = BRAND.url

/** Wrap text in CDATA, splitting any literal "]]>" so the XML stays valid. */
const cdata = (s: string) => `<![CDATA[${String(s).replace(/]]>/g, ']]]]><![CDATA[>')}]]>`

export async function GET() {
  const supabase = createClient()

  // Published Resources articles (blog_posts table)
  const { data: posts } = await supabase
    .from('blog_posts')
    .select('title, slug, excerpt, published_at, created_at')
    .eq('status', 'published')
    .order('published_at', { ascending: false, nullsFirst: false })
    .limit(50)

  const now = new Date().toUTCString()

  // Drop policy / meta posts (e.g. Editorial Policy) so they don't appear in
  // subscribers' feed readers alongside editorial content.
  const items = (posts || []).filter((p: any) => p?.slug && !BLOG_HIDDEN_SLUGS.has(p.slug)).map((post: any) => {
    const pubDate = new Date(post.published_at || post.created_at).toUTCString()
    const link = `${SITE_URL}${post.slug.startsWith('/') ? '' : '/'}${post.slug}`
    const description = post.excerpt ? `\n      <description>${cdata(post.excerpt)}</description>` : ''
    return `    <item>
      <title>${cdata(post.title)}</title>
      <link>${link}</link>
      <guid isPermaLink="true">${link}</guid>
      <pubDate>${pubDate}</pubDate>${description}
    </item>`
  })

  const rss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom" xmlns:content="http://purl.org/rss/1.0/modules/content/">
  <channel>
    <title>${BRAND.name} Resources — Marine Engineering &amp; Spare Parts Guides</title>
    <link>${SITE_URL}/resources</link>
    <description>Marine engineering articles from ${BRAND.name}: ship machinery, marine engines, maintenance and repair, SOLAS &amp; MARPOL safety and regulations, careers at sea, and guides to buying ship spare parts.</description>
    <language>en-us</language>
    <lastBuildDate>${now}</lastBuildDate>
    <atom:link href="${SITE_URL}/feed.xml" rel="self" type="application/rss+xml" />
    <image>
      <url>${SITE_URL}/android-chrome-512x512.png</url>
      <title>${BRAND.name}</title>
      <link>${SITE_URL}</link>
      <width>512</width>
      <height>512</height>
    </image>
${items.join('\n')}
  </channel>
</rss>`

  return new Response(rss, {
    headers: {
      'Content-Type': 'application/rss+xml; charset=utf-8',
      'Cache-Control': 'public, max-age=3600, s-maxage=3600',
    },
  })
}
