import './globals.css'
import type { Metadata } from 'next'
import { Inter, Sora } from 'next/font/google'
import Script from 'next/script'
import { ThemeProvider } from '@/components/providers/ThemeProvider'
import LayoutShell from '@/components/layout/LayoutShell'
import ScrollToTop from '@/components/ui/ScrollToTop'
import { getEnabledScripts, groupByPosition } from '@/lib/site-scripts'
import { renderHeadScript } from '@/lib/render-head-script'
import { getMenus } from '@/lib/menus'
import { getSiteContent } from '@/lib/site-content'
import { buildThemeCSS } from '@/lib/theme-colors'
import { BRAND } from '@/lib/brand'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

// Display font for headings. The CSS variable keeps its old name
// (--font-playfair / .font-playfair) so every existing heading picks it up.
const playfair = Sora({
  subsets: ['latin'],
  variable: '--font-playfair',
  display: 'swap',
  weight: ['600', '700'],
})

const SITE_TITLE = 'MarineYard – Buy & Sell Ship Spare Parts and Marine Equipment Worldwide'
const SITE_DESCRIPTION = BRAND.description

export const metadata: Metadata = {
  metadataBase: new URL(BRAND.url),
  title: SITE_TITLE,
  description: SITE_DESCRIPTION,
  applicationName: BRAND.name,
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: '48x48' },
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
      { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/favicon.svg', type: 'image/svg+xml' },
    ],
    apple: '/apple-touch-icon.png',
  },
  manifest: '/site.webmanifest',
  openGraph: {
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    url: BRAND.url,
    siteName: BRAND.name,
    type: 'website',
    images: [{ url: `${BRAND.url}${BRAND.ogImage}`, width: 1200, height: 630, alt: 'MarineYard – ship spare parts marketplace' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    images: [`${BRAND.url}${BRAND.ogImage}`],
  },
  robots: {
    index: true,
    follow: true,
  },
}

// Pages re-read menus / site settings / header scripts from the database at
// most every 60 s (the Supabase fetch cache used the same window); admin
// saves refresh them at once through revalidateTag / revalidatePath.
export const revalidate = 60

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // Fetch admin-managed data in PARALLEL — running these three Supabase
  // calls sequentially was the dominant contributor to a 3+ second TTFB
  // and caused the dreaded "blank gradient" pause on every full page load.
  // Promise.all collapses the wall-clock cost to roughly the slowest of
  // the three, instead of the sum.
  const [siteScripts, menus, siteContent] = await Promise.all([
    getEnabledScripts(),  // Google Analytics, Search Console, Meta Pixel, etc.
    getMenus(),           // header + footer menu items
    getSiteContent(),     // logo, brand, CTA, social icons, payment badges, etc.
  ])
  const { head: headScripts, bodyStart: bodyStartScripts, bodyEnd: bodyEndScripts } = groupByPosition(siteScripts)

  // Build admin-managed theme-color overrides (<style> block that wins over globals.css)
  const themeCSS = buildThemeCSS(siteContent.settings)
  const gaId = (process.env.GA_MEASUREMENT_ID || process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID || '').trim()

  return (
    <html lang="en" className={`${inter.variable} ${playfair.variable}`} suppressHydrationWarning>
      <head>
        {/* Search engine ownership tags — set GOOGLE_SITE_VERIFICATION /
            BING_SITE_VERIFICATION in Coolify (or paste the tag in
            Admin → Header Scripts). */}
        {process.env.GOOGLE_SITE_VERIFICATION && (
          <meta name="google-site-verification" content={process.env.GOOGLE_SITE_VERIFICATION} />
        )}
        {process.env.BING_SITE_VERIFICATION && (
          <meta name="msvalidate.01" content={process.env.BING_SITE_VERIFICATION} />
        )}
        {/* RSS Feed for search engine auto-discovery */}
        <link rel="alternate" type="application/rss+xml" title="MarineYard Resources RSS Feed" href="/feed.xml" />
        {/* Preconnect to external origins — saves DNS+TCP+TLS time */}
        {/* Hint browser to give max priority to the critical CSS chunk on the critical path */}
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        {/* Critical inline CSS — paints body background instantly, before
            globals.css finishes downloading. Without this, every full-page
            load (including admin → homepage navigation) flashes a white
            screen for the few hundred ms it takes the external CSS chunk
            to land. The colors mirror --body-bg in globals.css. */}
        <style dangerouslySetInnerHTML={{ __html: `html,body{margin:0;padding:0;background:linear-gradient(160deg,#f3f8fd 0%,#e7f1fa 40%,#e2eef8 70%,#f4f8fc 100%);color:#0a1f33;min-height:100vh}html[data-theme="dark"],html[data-theme="dark"] body{background:linear-gradient(160deg,#06121f 0%,#0a1c30 35%,#0c2238 65%,#06121f 100%);color:#eaf3fb}` }} />
        {/* Inline theme script — site is light-mode only (dark mode UI
            removed). Force the data-theme attribute to 'light' synchronously
            before first paint so any leftover localStorage value or stale
            DOM state can't cause a flash of dark theme. */}
        <script dangerouslySetInnerHTML={{ __html: `document.documentElement.setAttribute('data-theme','light');` }} />
        {/* Site-wide identity schema — single Organization + WebSite */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@graph': [
                {
                  '@type': 'Organization',
                  '@id': `${BRAND.url}/#organization`,
                  name: BRAND.name,
                  url: `${BRAND.url}/`,
                  logo: `${BRAND.url}/logo-512.png`,
                  email: BRAND.supportEmail,
                  description: BRAND.description,
                },
                {
                  '@type': 'WebSite',
                  '@id': `${BRAND.url}/#website`,
                  url: `${BRAND.url}/`,
                  name: BRAND.name,
                  description: BRAND.tagline,
                  publisher: { '@id': `${BRAND.url}/#organization` },
                  potentialAction: {
                    '@type': 'SearchAction',
                    target: { '@type': 'EntryPoint', urlTemplate: `${BRAND.url}/listings?q={search_term_string}` },
                    'query-input': 'required name=search_term_string',
                  },
                },
              ],
            }),
          }}
        />
        {/* Admin-managed scripts — <head> position (GA, Search Console, Bing,
            Meta Pixel init, etc.). Each pasted snippet is parsed into the
            correct native element (<meta>, <link>, <script>, <style>) by
            renderHeadScript so the document head stays valid HTML. The old
            implementation wrapped each snippet in a <span>, which the HTML
            parser treats as flow content — the moment one appeared inside
            <head>, browsers auto-closed <head> and dragged every following
            tag into <body>. That broke Bing/Google verification AND was
            the cause of the long blank-screen pause users were seeing. */}
        {headScripts.map((s) => renderHeadScript(s.code, s.id))}
        {/* Admin-managed theme colors — overrides CSS variables from globals.css per data-theme */}
        {themeCSS && (
          <style
            data-site-theme-colors=""
            dangerouslySetInnerHTML={{ __html: themeCSS }}
          />
        )}
        {/* Admin-managed global Custom CSS — injected LAST so rules win by source-order specificity (WordPress "Additional CSS" behavior) */}
        {siteContent.settings.global_custom_css && (
          <style
            data-site-custom-css=""
            dangerouslySetInnerHTML={{ __html: siteContent.settings.global_custom_css }}
          />
        )}
      </head>
      <body suppressHydrationWarning>
        {/* Admin-managed scripts — body start (GTM noscript, etc.) */}
        {bodyStartScripts.map((s) => (
          <span key={s.id} dangerouslySetInnerHTML={{ __html: s.code }} />
        ))}

        <ThemeProvider>
          <LayoutShell menus={menus} siteContent={siteContent}>{children}</LayoutShell>
          <ScrollToTop />
        </ThemeProvider>

        {/* Google Analytics 4 — measurement id from GA_MEASUREMENT_ID (Coolify env) */}
        {gaId && (
          <>
            <Script src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`} strategy="lazyOnload" />
            <Script id="google-analytics" strategy="lazyOnload">
              {`window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('js', new Date());
gtag('config', '${gaId}');`}
            </Script>
          </>
        )}

        {/* Admin-managed scripts — body end (chat widgets, deferred analytics, etc.) */}
        {bodyEndScripts.map((s) => (
          <span key={s.id} dangerouslySetInnerHTML={{ __html: s.code }} />
        ))}
      </body>
    </html>
  )
}
