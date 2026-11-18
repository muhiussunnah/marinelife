import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient as createAdmin } from '@/lib/db'
import { checkWriterfyAuth } from '@/lib/writerfy-auth'
import { RESOURCE_CATEGORIES, LEGACY_RISK_LEVEL, LEGACY_REGION } from '@/lib/content-helpers'

/**
 * GET /api/writerfy/categories
 *
 * Returns the list of Resources categories Writerfy can pick from when
 * publishing. Categories are a hardcoded enum on this site (not a
 * standalone table — see RESOURCE_CATEGORIES in lib/content-helpers.ts),
 * so this endpoint returns the canonical values plus a published-post
 * count per category so the Writerfy UI can show usage stats.
 *
 * `risk_levels` and `regions` are kept for backwards compatibility with the
 * Writerfy client but only carry one neutral value each: those legacy
 * columns are no longer shown anywhere on the site.
 *
 * Same Bearer token as the other /api/writerfy/* endpoints.
 */

export const runtime = 'nodejs'

// Cache the response briefly — this list changes rarely and Writerfy
// may hit this on every "compose article" dialog open.
export const revalidate = 120

const CATEGORIES: string[] = [...RESOURCE_CATEGORIES]
const RISK_LEVELS: string[] = [LEGACY_RISK_LEVEL]
const REGIONS: string[] = [LEGACY_REGION]

function slugify(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
}

function supabase() {
  return createAdmin()
}

export async function GET(req: NextRequest) {
  if (!checkWriterfyAuth(req)) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  }

  // Fetch every published post's category in one query, then count in JS.
  // Cheaper and simpler than one SELECT COUNT per category; the table
  // is small enough (< few thousand rows) that this is fine.
  const db = supabase()
  const { data, error } = await db
    .from('blog_posts')
    .select('category')
    .eq('status', 'published')

  // If the count query fails we still return the enum list with count=0 so
  // Writerfy isn't blocked on a Supabase hiccup.
  const counts: Record<string, number> = {}
  if (!error && Array.isArray(data)) {
    for (const row of data) {
      const c = (row as any).category
      if (c) counts[c] = (counts[c] || 0) + 1
    }
  }

  const categories = CATEGORIES.map((name) => ({
    id: slugify(name),
    name,
    slug: slugify(name),
    count: counts[name] || 0,
  }))

  return NextResponse.json({
    categories,
    // Bonus enums Writerfy's UI can surface the same way if it wants to.
    risk_levels: RISK_LEVELS.map((name) => ({
      id: slugify(name),
      name,
      slug: slugify(name),
    })),
    regions: REGIONS.map((name) => ({
      id: slugify(name),
      name,
      slug: slugify(name),
    })),
  })
}
