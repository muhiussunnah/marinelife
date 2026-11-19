import Link from "next/link";
import { Shield, Mail, Gift, Sparkles, Check } from "lucide-react";
import type { MenuItem } from "@/lib/menus";
import type { SocialLink, PaymentMethod, FooterBadge } from "@/lib/site-content";

// =============================================================================
// FALLBACKS — used only when admin-managed content is empty / migration not applied
// =============================================================================
const FALLBACK_EXPLORE: { href: string; label: string; target: "_self" | "_blank" }[] = [
  { href: "/listings", label: "Ship Parts Marketplace", target: "_self" },
  { href: "/listings/main-engine", label: "Main Engine Parts", target: "_self" },
  { href: "/listings/turbochargers", label: "Turbochargers", target: "_self" },
  { href: "/listings/navigation-communication", label: "Navigation Equipment", target: "_self" },
  { href: "/dashboard/listings/new", label: "Sell Ship Parts", target: "_self" },
  { href: "/resources", label: "Marine Resources", target: "_self" },
];

const FALLBACK_COMPANY: { href: string; label: string; target: "_self" | "_blank" }[] = [
  { href: "/about", label: "About Us", target: "_self" },
  { href: "/pricing", label: "Pricing", target: "_self" },
  { href: "/resources", label: "Resources", target: "_self" },
  { href: "/contact", label: "Contact", target: "_self" },
  { href: "/privacy", label: "Privacy Policy", target: "_self" },
  { href: "/terms", label: "Terms of Service", target: "_self" },
  { href: "/refund", label: "Refund Policy", target: "_self" },
];

const FALLBACK_BOTTOM: { href: string; label: string; target: "_self" | "_blank" }[] = [
  { href: "/privacy", label: "Privacy", target: "_self" },
  { href: "/terms", label: "Terms", target: "_self" },
  { href: "/refund", label: "Refund Policy", target: "_self" },
];

// Detects whether a brand-logo value should be rendered as an image (URL / path)
// or as plain text (emoji / glyph). Admins can paste either into the same field.
const isImageLogo = (v: string): boolean =>
  /^(\/|https?:\/\/|data:image\/)/i.test(v) || /\.(png|jpe?g|svg|webp|gif|avif)(\?|$)/i.test(v)

const FALLBACK_SETTINGS: Record<string, string> = {
  brand_logo_emoji:        "/logo-header.png",
  brand_name_prefix:       "Marine",
  brand_name_suffix:       "Yard",
  footer_description_1:    "The global marketplace for ship spare parts and marine equipment — list surplus spares, find hard-to-get parts, and reach buyers in every port.",
  footer_description_2:    "Built for ship owners, superintendents, chandlers, surplus dealers and marine engineers. Free accounts list 9 items.",
  footer_highlight:        "Free to start — no signup required.",
  contact_email:           "support@marineyard.com",
  cta_heading:             "Got spare parts on board or in the warehouse?",
  cta_subtitle:            "List them on MarineYard and reach marine buyers worldwide — your first 9 listings are free.",
  cta_primary_text:        "List a part free →",
  cta_primary_href:        "/signup?next=/dashboard/listings/new",
  cta_secondary_text:      "Browse listings",
  cta_secondary_href:      "/listings",
  payment_heading:         "Secure Payment",
  payment_badge_label:     "Guaranteed",
  payment_badge_sublabel:  "Secure Payment",
  payment_description:     "256-bit SSL encryption · No hidden charges",
  payment_accept_label:    "We Accept",
  premium_cta_text:        "✦ Get Premium Access",
  premium_cta_href:        "/pricing",
  footer_explore_heading:  "Explore",
  footer_company_heading:  "Company",
  copyright_text:          "© 2026 MarineYard.com · All rights reserved",
  safety_disclaimer:       "Marketplace notice: MarineYard is a listing platform. Listings are created by independent sellers, who are responsible for their accuracy. MarineYard is not a party to any sale — verify parts, certificates and sellers before you pay.",
};

const FALLBACK_SOCIALS: SocialLink[] = [
];

const FALLBACK_PAYMENTS: PaymentMethod[] = [
  { id: "v", label: "VISA",       display_html: "VISA",                                                     bg_color: "#1A1F71", text_color: "#ffffff", sort_order: 1, enabled: true },
  { id: "m", label: "MasterCard", display_html: '<span style="width:16px;height:16px;border-radius:9999px;display:inline-block;background:#EB001B"></span><span style="width:16px;height:16px;border-radius:9999px;display:inline-block;background:#F79E1B;opacity:0.9;margin-left:-8px"></span>', bg_color: "#252525", text_color: "#ffffff", sort_order: 2, enabled: true },
  { id: "pp", label: "PayPal",    display_html: 'Pay<span style="color:#009CDE">Pal</span>',                bg_color: "#003087", text_color: "#ffffff", sort_order: 3, enabled: true },
  { id: "ax", label: "AMEX",      display_html: "AMEX",                                                     bg_color: "#2E77BC", text_color: "#ffffff", sort_order: 4, enabled: true },
  { id: "ap", label: "Apple Pay", display_html: "⌘ Pay",                                                    bg_color: "#000000", text_color: "#ffffff", sort_order: 5, enabled: true },
  { id: "gp", label: "Google Pay", display_html: "G Pay",                                                   bg_color: "#ffffff", text_color: "#3c4043", sort_order: 6, enabled: true },
  { id: "pd", label: "Paddle",    display_html: "Paddle",                                                   bg_color: "#0070E0", text_color: "#ffffff", sort_order: 7, enabled: true },
];

// Fallbacks intentionally empty — the ShowMeBest.ai and Fazier badges that
// used to live here have been removed at the user's request. Admins can still
// add badges back via /admin/footer-settings; the eBadges/cBadges arrays only
// fall through to these fallbacks when admin returns nothing.
const FALLBACK_EXPLORE_BADGES: FooterBadge[] = [];
const FALLBACK_COMPANY_BADGES: FooterBadge[] = [];

// =============================================================================
// Footer component
// =============================================================================
export default function Footer({
  footerExplore,
  footerCompany,
  footerBottom,
  settings,
  socialLinks,
  paymentMethods,
  exploreBadges,
  companyBadges,
}: {
  footerExplore?: MenuItem[]
  footerCompany?: MenuItem[]
  footerBottom?: MenuItem[]
  settings?: Record<string, string>
  socialLinks?: SocialLink[]
  paymentMethods?: PaymentMethod[]
  exploreBadges?: FooterBadge[]
  companyBadges?: FooterBadge[]
} = {}) {
  // Resolve menu columns
  const exploreLinks =
    footerExplore && footerExplore.length > 0
      ? footerExplore.map((m) => ({ href: m.url, label: m.label, target: m.target }))
      : FALLBACK_EXPLORE
  const companyLinks =
    footerCompany && footerCompany.length > 0
      ? footerCompany.map((m) => ({ href: m.url, label: m.label, target: m.target }))
      : FALLBACK_COMPANY
  const bottomLinks =
    footerBottom && footerBottom.length > 0
      ? footerBottom.map((m) => ({ href: m.url, label: m.label, target: m.target }))
      : FALLBACK_BOTTOM

  // Resolve settings with fallback per-key (so partial migration doesn't break layout)
  const s = (key: string): string => settings?.[key] || FALLBACK_SETTINGS[key] || ""

  // Resolve repeatable content
  const socials   = socialLinks && socialLinks.length > 0     ? socialLinks      : FALLBACK_SOCIALS
  const payments  = paymentMethods && paymentMethods.length > 0 ? paymentMethods : FALLBACK_PAYMENTS

  // Hard blacklist for legacy badges the admin UI couldn't delete from the
  // DB cleanly. Filter is applied to BOTH admin-supplied and fallback arrays
  // so these specific URLs never render again, regardless of DB state.
  const BADGE_BLACKLIST = ["showmebest.ai", "fazier.com"]
  const stripBlacklisted = (list: FooterBadge[] | undefined): FooterBadge[] =>
    (list || []).filter(b =>
      !BADGE_BLACKLIST.some(d =>
        (b.image_url || "").includes(d) || (b.link_url || "").includes(d)
      )
    )

  const eBadgesRaw = exploreBadges && exploreBadges.length > 0 ? exploreBadges : FALLBACK_EXPLORE_BADGES
  const cBadgesRaw = companyBadges && companyBadges.length > 0 ? companyBadges : FALLBACK_COMPANY_BADGES
  const eBadges    = stripBlacklisted(eBadgesRaw)
  const cBadges    = stripBlacklisted(cBadgesRaw)

  return (
    <>
      {/* ── Sitewide CTA — appears above footer on every page ── */}
      <section className="py-14 sm:py-20 px-6 relative overflow-hidden" style={{ background: "var(--bg-primary)" }}>
        {/* Ambient radial glows — two layered orbs for depth */}
        <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
          <div
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full blur-3xl opacity-25"
            style={{ background: "radial-gradient(circle, var(--accent) 0%, transparent 65%)" }}
          />
          <div
            className="absolute top-0 right-0 w-[300px] h-[300px] rounded-full blur-3xl opacity-15"
            style={{ background: "radial-gradient(circle, var(--accent) 0%, transparent 70%)" }}
          />
        </div>

        <div className="relative z-10 max-w-4xl mx-auto">
          {/* Free-tier pill — eye-catching ribbon at the top.
              Footer renders on EVERY page including the homepage where
              most visitors land and never reach the pricing page; surface
              what they actually get on free signup (30 credits) instead
              of the paid-plan trial perks. The 7-day trial wording lives
              on /pricing where it's contextually accurate for Paddle. */}
          <div className="flex justify-center mb-6">
            <div
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs sm:text-sm font-bold tracking-wide uppercase"
              style={{
                background: "linear-gradient(90deg, rgba(8,145,178,0.15), rgba(8,145,178,0.08))",
                border: "1px solid rgba(8,145,178,0.35)",
                color: "#0891b2",
              }}
            >
              <Gift className="w-4 h-4" />
              <span>9 Free Listings · No Credit Card Required</span>
              <Sparkles className="w-4 h-4" />
            </div>
          </div>

          {/* Heading */}
          <h2
            className="font-playfair text-4xl md:text-5xl lg:text-6xl font-bold text-center mb-4 leading-tight"
            style={{ color: "var(--text-primary)" }}
          >
            {s("cta_heading")}
          </h2>

          {/* Subtitle */}
          <p
            className="text-base sm:text-lg md:text-xl text-center mb-8 max-w-2xl mx-auto"
            style={{ color: "var(--text-muted)" }}
          >
            {s("cta_subtitle")}
          </p>

          {/* Primary + secondary buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 mb-8">
            <Link
              href={s("cta_primary_href")}
              className="px-8 py-4 rounded-full text-base sm:text-lg font-semibold glow-green hover:scale-[1.03] transition-all shadow-lg"
              style={{
                background: "var(--btn-primary)",
                color: "#fff",
                boxShadow: "0 10px 30px -10px rgba(8,145,178,0.6)",
              }}
            >
              {s("cta_primary_text")}
            </Link>
            <Link
              href={s("cta_secondary_href")}
              className="px-8 py-4 rounded-full text-base sm:text-lg font-semibold hover:border-emerald-400 transition-all"
              style={{ border: "2px solid var(--border)", color: "var(--text-primary)" }}
            >
              {s("cta_secondary_text")}
            </Link>
          </div>

          {/* Trust-signal strip — green checks in a flexible row.
              Order matters: free-tier signals first because that's what
              most homepage visitors actually use, then a single
              paid-plan trial signal so the upgrade path still has a hook
              without dominating the row (and stays Paddle-compliant —
              the trial DOES exist for paid plans). */}
          <div className="flex flex-wrap items-center justify-center gap-x-5 sm:gap-x-6 gap-y-2 text-xs sm:text-sm">
            {[
              "9 free listings",
              "No credit card required",
              "No commission on sales",
              "Premium plans: 7-day free trial",
            ].map((text) => (
              <span
                key={text}
                className="inline-flex items-center gap-1.5 font-medium"
                style={{ color: "var(--text-primary)" }}
              >
                <Check className="w-4 h-4 flex-shrink-0" style={{ color: "#0891b2" }} />
                {text}
              </span>
            ))}
          </div>
        </div>
      </section>

      <footer style={{ borderTop: "1px solid var(--border)", background: "var(--bg-secondary)" }}>
        <div className="max-w-7xl mx-auto px-6 pt-16 pb-10">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12">

            {/* ── Brand column ── */}
            <div>
              <Link href="/" className="flex items-center gap-2 mb-4 w-fit" aria-label="MarineYard home">
                {isImageLogo(s("brand_logo_emoji")) ? (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img
                    src={s("brand_logo_emoji")}
                    alt={`${s("brand_name_prefix")}${s("brand_name_suffix")} logo`}
                    width={40}
                    height={40}
                    className="rounded-lg object-contain select-none"
                    style={{ width: 40, height: 40 }}
                  />
                ) : (
                  <span className="text-3xl select-none">{s("brand_logo_emoji")}</span>
                )}
                <span className="font-playfair text-xl font-bold" style={{ color: "var(--text-primary)" }}>
                  {s("brand_name_prefix")}<span style={{ color: "var(--accent)" }}>{s("brand_name_suffix")}</span>
                </span>
              </Link>
              {s("footer_description_1") && (
                <p className="text-sm leading-relaxed mb-3" style={{ color: "var(--text-muted)" }}>{s("footer_description_1")}</p>
              )}
              {s("footer_description_2") && (
                <p className="text-sm leading-relaxed mb-3" style={{ color: "var(--text-muted)" }}>{s("footer_description_2")}</p>
              )}
              {s("footer_highlight") && (
                <p className="text-sm leading-relaxed mb-5 font-medium" style={{ color: "var(--text-muted)" }}>{s("footer_highlight")}</p>
              )}
              {s("contact_email") && (
                <a href={`mailto:${s("contact_email")}`} className="flex items-center gap-2 text-sm hover:underline mb-5 w-fit" style={{ color: "var(--text-muted)" }}>
                  <Mail className="w-4 h-4 flex-shrink-0" style={{ color: "var(--accent)" }} />
                  {s("contact_email")}
                </a>
              )}
              <div className="flex items-center flex-wrap gap-2">
                {socials.map((item) => (
                  <a
                    key={item.id}
                    href={item.href}
                    aria-label={item.label}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-8 h-8 rounded-full flex items-center justify-center transition-opacity hover:opacity-80"
                    style={{ background: item.bg_color, color: item.icon_color }}
                    dangerouslySetInnerHTML={{ __html: item.icon_svg }}
                  />
                ))}
              </div>
            </div>

            {/* ── Explore column ── */}
            <div>
              <div className="font-semibold mb-5 uppercase tracking-widest" style={{ color: "var(--accent)", fontSize: "0.875rem" }}>
                {s("footer_explore_heading")}
              </div>
              <ul className="space-y-3 mb-6">
                {exploreLinks.map(({ href, label, target }) => (
                  <li key={`${href}-${label}`}>
                    <Link href={href} target={target} rel={target === "_blank" ? "noopener noreferrer" : undefined}
                          className="text-sm transition-all hover:translate-x-1 inline-block hover:opacity-100"
                          style={{ color: "var(--text-muted)" }}>
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
              {eBadges.map((b) => (
                <div className="pt-2" key={b.id}>
                  <a href={b.link_url} target="_blank" rel="noopener noreferrer">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={b.image_url} alt={b.alt_text || ""} width={b.width} height={b.height || undefined}
                         className="rounded shadow-sm hover:opacity-90 transition-opacity" />
                  </a>
                </div>
              ))}
            </div>

            {/* ── Company column ── */}
            <div>
              <div className="font-semibold mb-5 uppercase tracking-widest" style={{ color: "var(--accent)", fontSize: "0.875rem" }}>
                {s("footer_company_heading")}
              </div>
              <ul className="space-y-3 mb-6">
                {companyLinks.map(({ href, label, target }) => (
                  <li key={`${href}-${label}`}>
                    <Link href={href} target={target} rel={target === "_blank" ? "noopener noreferrer" : undefined}
                          className="text-sm transition-all hover:translate-x-1 inline-block hover:opacity-100"
                          style={{ color: "var(--text-muted)" }}>
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
              {cBadges.map((b) => (
                <div className="pt-2" key={b.id}>
                  <a href={b.link_url} target="_blank" rel="noopener noreferrer">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={b.image_url} alt={b.alt_text || ""} width={b.width} height={b.height || undefined}
                         className="hover:opacity-90 transition-opacity" />
                  </a>
                </div>
              ))}
            </div>

            {/* ── Secure Payment column ── */}
            <div>
              <div className="font-semibold mb-5 uppercase tracking-widest" style={{ color: "var(--accent)", fontSize: "0.875rem" }}>
                {s("payment_heading")}
              </div>

              <div className="p-4 rounded-xl mb-4" style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}>
                <div className="flex items-center gap-3 mb-1">
                  <div className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: "var(--accent)", color: "#fff" }}>
                    <Shield className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold tracking-widest uppercase" style={{ color: "var(--text-muted)" }}>
                      {s("payment_badge_label")}
                    </p>
                    <p className="text-sm font-bold leading-tight" style={{ color: "var(--text-primary)" }}>
                      {s("payment_badge_sublabel")}
                    </p>
                  </div>
                </div>
                <p className="text-xs mt-2" style={{ color: "var(--text-muted)" }}>
                  {s("payment_description")}
                </p>
              </div>

              <p className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: "var(--text-muted)" }}>
                {s("payment_accept_label")}
              </p>
              <div className="flex flex-wrap gap-2">
                {payments.map((p) => (
                  <div key={p.id}
                       aria-label={p.label}
                       className="flex items-center justify-center px-3 py-1.5 rounded-md text-xs font-bold tracking-wide select-none"
                       style={{ background: p.bg_color, color: p.text_color, minWidth: 52, border: "1px solid rgba(0,0,0,0.08)" }}
                       dangerouslySetInnerHTML={{ __html: p.display_html }} />
                ))}
              </div>

              <Link href={s("premium_cta_href")}
                    className="mt-5 w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-opacity hover:opacity-90 glow-green"
                    style={{ background: "var(--btn-primary)", color: "#fff", display: "flex" }}>
                {s("premium_cta_text")}
              </Link>
            </div>
          </div>

          <div className="mt-12" />

          {/* ── Bottom bar ── */}
          <div className="mt-6 pt-6 flex flex-col md:flex-row items-center justify-between gap-4" style={{ borderTop: "1px solid var(--border)" }}>
            <p className="text-xs" style={{ color: "var(--text-faint)" }}>
              {s("copyright_text")}
            </p>
            <div className="flex items-center gap-4">
              {bottomLinks.map(({ href, label, target }, idx) => (
                <span key={`${href}-${label}`} className="flex items-center gap-4">
                  {idx > 0 && <span style={{ color: "var(--border-hover)" }}>·</span>}
                  <Link href={href} target={target} rel={target === "_blank" ? "noopener noreferrer" : undefined}
                        className="text-xs hover:underline" style={{ color: "var(--text-faint)" }}>
                    {label}
                  </Link>
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* ── Safety disclaimer ── */}
        {/* `whiteSpace: pre-line` honours `\n\n` paragraph breaks coming
            from the admin-editable string, so the disclaimer can carry
            its "Never consume… / Always confirm…" second paragraph
            without splitting it into two database fields. */}
        {s("safety_disclaimer") && (
          <div className="px-6 py-4 text-center" style={{ background: "var(--accent-bg)", borderTop: "1px solid var(--border)" }}>
            <p className="text-xs font-medium leading-relaxed max-w-4xl mx-auto" style={{ color: "var(--text-primary)", whiteSpace: "pre-line" }}>
              {s("safety_disclaimer")}
            </p>
          </div>
        )}
      </footer>
    </>
  );
}
