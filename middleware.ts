import { NextResponse, type NextRequest } from 'next/server'
import { CATEGORY_BY_SLUG } from '@/lib/listings-meta'

/**
 * 1. /listings?category=<slug>[&…] → 301 /listings/<slug>[?…] (clean category
 *    URLs; the filter form and old links still send ?category=).
 *
 * 2. Next 13.5 self-hosted ISR bug: when a cached page is (re)generated during a
 *    conditional request (If-None-Match / If-Modified-Since), the 304 status is
 *    stored with the page and then served to EVERY visitor as an empty 304,
 *    which crashes the app. Dropping the conditional headers before Next
 *    renders means it always answers 200 with the full page; pages are still
 *    cached by Next's ISR on the server.
 */
export function middleware(req: NextRequest) {
  const { pathname, searchParams } = req.nextUrl
  if (pathname === '/listings' && searchParams.has('category')) {
    const slug = searchParams.get('category') || ''
    const rest = new URLSearchParams(searchParams)
    rest.delete('category')
    // Behind the proxy req.url is http://0.0.0.0:3000 — build the public origin
    // from the forwarded headers so the Location points at the real site.
    const host = req.headers.get('x-forwarded-host') || req.headers.get('host') || req.nextUrl.host
    const proto = (req.headers.get('x-forwarded-proto') || req.nextUrl.protocol.replace(':', '')).split(',')[0]
    // An empty or unknown category just drops the parameter.
    const path = CATEGORY_BY_SLUG[slug] ? `/listings/${slug}` : '/listings'
    const qs = rest.toString()
    return NextResponse.redirect(`${proto}://${host}${path}${qs ? `?${qs}` : ''}`, 301)
  }

  if (!req.headers.has('if-none-match') && !req.headers.has('if-modified-since')) return NextResponse.next()
  const headers = new Headers(req.headers)
  headers.delete('if-none-match')
  headers.delete('if-modified-since')
  return NextResponse.next({ request: { headers } })
}

export const config = {
  // Pages only — static assets, images, uploads and API routes are untouched.
  matcher: ['/((?!_next/static|_next/image|uploads/|api/|favicon|.*\\.(?:png|jpg|jpeg|webp|avif|gif|svg|ico|txt|xml)$).*)'],
}
