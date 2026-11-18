/**
 * Shared helpers for post content processing.
 */

/**
 * Canonical article categories for the Resources section. Used by the
 * Resources filter, the admin editor, and the Writerfy publish/categories
 * endpoints so every surface offers the same list.
 */
export const RESOURCE_CATEGORIES = [
  'Marine Engineering',
  'Ship Machinery',
  'Maintenance & Repair',
  'Spare Parts Guides',
  'Safety & Regulations',
  'Navigation & Electronics',
  'Careers',
  'Industry News',
] as const

export const DEFAULT_RESOURCE_CATEGORY = 'Marine Engineering'

/** Byline used when a post has no explicit author (matches db/schema.sql defaults). */
export const DEFAULT_AUTHOR_NAME = 'MarineYard Editorial Team'
export const DEFAULT_AUTHOR_ROLE = 'Marine engineers & industry writers'

/**
 * `blog_posts.risk_level` and `blog_posts.region` are legacy columns that the
 * UI no longer shows. New and edited posts store these neutral values.
 */
export const LEGACY_RISK_LEVEL = 'General'
export const LEGACY_REGION = 'Worldwide'

/**
 * Extracts the `src` of the first `<img>` tag in an HTML blob.
 *
 * Used by the "auto featured image from content" fallback — when an admin
 * (or Writerfy) saves a post without explicitly setting featured_image,
 * we pick the first image embedded in the body so the Resources listing,
 * social cards, and article header always have something to show.
 *
 * Returns `null` when:
 *   • input is empty / not a string
 *   • no `<img>` tag is found
 *   • the matched src is empty / whitespace
 *
 * Regex approach is fine here — we only need the first match, not a
 * full HTML parse. Handles both single and double quotes.
 */
export function extractFirstImage(html: string | null | undefined): string | null {
  if (!html || typeof html !== 'string') return null

  // Match the src attribute of the first <img> tag.
  // [^>]* allows for other attributes before src (class, alt, etc.)
  const match = html.match(/<img[^>]*\ssrc\s*=\s*["']([^"']+)["']/i)
  if (!match) return null

  const src = match[1].trim()
  if (!src) return null
  return src
}

/**
 * Resolves the "effective" featured image for a post: use the explicit
 * featured_image if set, otherwise fall back to the first image in the
 * content. Returns empty string if neither exists so downstream code can
 * check truthiness.
 */
export function resolveFeaturedImage(
  featuredImage: string | null | undefined,
  content: string | null | undefined,
): string {
  const explicit = (featuredImage || '').trim()
  if (explicit) return explicit
  return extractFirstImage(content) || ''
}

/**
 * Dedupe Writerfy product-heading duplicates.
 *
 * Why this exists: the AI inside Writerfy is occasionally generating a
 * markdown heading (e.g. `### 4. Heavy-Duty Marine Fuel Filter Kit`)
 * IMMEDIATELY before pasting the verbatim writerify-product-heading block
 * (`<h3 class="writerify-product-heading">…same text…</h3>`). The result on
 * the public article is the product title rendered twice — once as a
 * generic black heading, once as the styled centered heading — even
 * though the admin RichEditor shows only the styled one because of how the
 * contentEditable view collapses repeats visually.
 *
 * Fix: scan the saved HTML for `<hN>X</hN>` followed by optional
 * whitespace/empty paragraphs followed by a writerify-product-heading
 * whose visible text equals X (after stripping numbers, links, and
 * punctuation). Drop the redundant first heading.
 *
 * Idempotent — running it twice on the same HTML produces the same output.
 * Safe for posts without product blocks: if no product-heading is present, nothing
 * is touched.
 */
export function dedupeProductHeadings(html: string | null | undefined): string {
  if (!html || typeof html !== 'string') return html || ''
  if (!html.includes('writerify-product-heading')) return html

  // Plain text comparison: drop tags, NBSPs, leading numbering ("3. "),
  // collapse whitespace, lowercase. Works for either heading rendering
  // its text inside an <a>, <strong>, or directly.
  const norm = (s: string): string =>
    s
      .replace(/<[^>]+>/g, ' ')
      .replace(/&nbsp;/gi, ' ')
      .replace(/&amp;/gi, '&')
      .replace(/^\s*\d+\.\s*/, '')
      .replace(/\s+/g, ' ')
      .trim()
      .toLowerCase()

  // 1) Plain heading right before product heading.
  // Group 1: level (2|3|4) of the leading heading
  // Group 2: leading heading inner HTML
  // Group 3: optional whitespace + empty <p> noise between
  // Group 4: product-heading element (kept as-is)
  // Group 5: product-heading level (matched for closing tag)
  // Group 6: product-heading inner HTML
  const pattern =
    /<h([2-4])\b(?![^>]*\bwriterify-product-heading\b)[^>]*>([\s\S]*?)<\/h\1>(\s*(?:<p[^>]*>(?:\s|&nbsp;|<br\s*\/?>)*<\/p>\s*)*)(<h([2-4])\b[^>]*\bwriterify-product-heading\b[^>]*>([\s\S]*?)<\/h\5>)/gi

  return html.replace(
    pattern,
    (full, _level, firstInner, between, productEl, _pLevel, productInner) => {
      const a = norm(firstInner)
      const b = norm(productInner)
      if (!a || !b) return full
      // Match either exact equality OR one being a clean superset (e.g. AI
      // wrote "Marine Fuel Filter" while product heading has "4. Heavy-Duty
      // Marine Fuel Filter Kit" — the leading number is already
      // stripped by `norm`, and we treat shared 80%+ tokens as a dupe).
      if (a === b) return between + productEl
      // Token overlap fallback for the "AI shortened the title" case.
      const tokens = (s: string) => new Set(s.split(/\s+/).filter(Boolean))
      const ta = tokens(a)
      const tb = tokens(b)
      if (ta.size === 0 || tb.size === 0) return full
      const small = ta.size < tb.size ? ta : tb
      const large = ta.size < tb.size ? tb : ta
      let shared = 0
      for (const t of Array.from(small)) if (large.has(t)) shared++
      const ratio = shared / small.size
      if (ratio >= 0.8 && small.size >= 2) return between + productEl
      return full
    },
  )
}
