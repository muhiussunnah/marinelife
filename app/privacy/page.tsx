import type { Metadata } from 'next'
import Link from 'next/link'
import { absoluteUrl } from '@/lib/brand'

export const metadata: Metadata = {
  title: 'Privacy Policy | MarineYard',
  description: 'Read the MarineYard Privacy Policy to learn how our ship parts marketplace collects, uses, and protects your personal data, including account, listing and billing information.',
  alternates: { canonical: absoluteUrl('/privacy') },
}

const LAST_UPDATED = 'November 18, 2026'

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mb-10">
      <h2 className="font-playfair text-2xl font-bold mb-4" style={{ color: 'var(--text-primary)' }}>{title}</h2>
      <div className="space-y-4 text-sm leading-relaxed" style={{ color: 'var(--text-muted)' }}>
        {children}
      </div>
    </section>
  )
}

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen pt-28 pb-20 px-6" style={{ background: 'var(--bg-primary)' }}>
      <div className="max-w-3xl mx-auto">

        {/* Header */}
        <div className="mb-12">
          <nav className="flex items-center gap-2 text-xs mb-6" style={{ color: 'var(--text-muted)' }}>
            <Link href="/" className="hover:underline">Home</Link>
            <span>/</span>
            <span style={{ color: 'var(--text-primary)' }}>Privacy Policy</span>
          </nav>
          <h1 className="font-playfair text-4xl md:text-5xl font-bold mb-4" style={{ color: 'var(--text-primary)' }}>
            Privacy Policy
          </h1>
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
            Last updated: <strong style={{ color: 'var(--text-primary)' }}>{LAST_UPDATED}</strong>
          </p>
          <div className="mt-6 p-4 rounded-xl text-sm" style={{ background: 'var(--accent-bg)', border: '1px solid var(--border)' }}>
            <p style={{ color: 'var(--text-primary)' }}>
              This Privacy Policy explains how <strong>MarineYard</strong> ("we", "us", or "our") collects, uses, and protects your personal information when you use our website at <strong>marineyard.com</strong> (the "Service") — including the ship parts and marine equipment marketplace, your account dashboard, and our Resources articles.
            </p>
          </div>
        </div>

        <div style={{ borderTop: '1px solid var(--border)' }} className="pt-10">

          <Section title="1. Information We Collect">
            <p>We collect information in the following ways:</p>
            <p><strong style={{ color: 'var(--text-primary)' }}>Information you provide directly:</strong></p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Email address and password when you create an account (or your Google account details if you sign in with Google)</li>
              <li>Your name or display name, country and, optionally, a profile photo</li>
              <li>Listing content — photos, titles, descriptions, part details (such as maker, model, part number and condition), quantity, price, item location, and any contact details you choose to include</li>
              <li>Resources articles you save to your account</li>
              <li>Messages you send us via the contact form or support email, including reports about other listings</li>
              <li>Billing information — processed securely by Paddle, our Merchant of Record (we never see or store your full card number)</li>
            </ul>
            <p><strong style={{ color: 'var(--text-primary)' }}>Information collected automatically:</strong></p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Device type, operating system, and browser type</li>
              <li>IP address and approximate geographic location, used for security and to prevent fraud, spam and duplicate accounts</li>
              <li>Pages viewed and general usage activity</li>
              <li>Your listing history, credits balance, plan and subscription status, and transaction records</li>
            </ul>
            <p><strong style={{ color: 'var(--text-primary)' }}>Information from third parties:</strong></p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Authentication data (your email and basic profile) if you sign in with Google</li>
              <li>Subscription and payment status from Paddle (for example, whether a payment succeeded, your plan and renewal date) — not your full card details</li>
            </ul>
          </Section>

          <Section title="2. How We Use Your Information">
            <p>We use your information for the following purposes:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>To provide and operate the marketplace — publishing your listings and letting buyers find and contact you</li>
              <li>To manage your account, credits balance, subscription plan, and billing history</li>
              <li>To review and moderate listings, enforce our <Link href="/terms" className="hover:underline" style={{ color: 'var(--accent)' }}>Terms of Service</Link>, and act on reports of prohibited or fraudulent listings</li>
              <li>To send transactional emails (e.g., account, subscription and password-reset messages)</li>
              <li>To show advertisements on the website (see Section 6)</li>
              <li>To understand how the Service is used and improve it</li>
              <li>To detect and prevent fraudulent, abusive, or automated activity</li>
              <li>To comply with legal obligations and respond to your support requests</li>
            </ul>
            <p>We do <strong style={{ color: 'var(--text-primary)' }}>not</strong> sell your personal data to third parties, and we do not use your data for unsolicited marketing without your explicit consent.</p>
          </Section>

          <Section title="3. Your Listings and Public Information">
            <p>
              Listings are public. The photos, descriptions, part details, price, location and any contact details you include in a listing can be seen by anyone who visits the Service, may be indexed by search engines, and may be copied by others. Only include information you are happy to make public, and avoid photos that show faces, documents, vessel crew or other personal data.
            </p>
            <p>
              Buyers and sellers deal with each other directly. When you contact another user or share details with them, they receive that information and are responsible for how they use it. MarineYard is not a party to transactions between users and is not responsible for how other users handle information you give them.
            </p>
            <p>
              Our moderators may review listing content and related account information to keep the marketplace safe. When you delete a listing, or we remove it, it is taken off public view; we may keep a copy for a limited time where needed for moderation, fraud prevention or legal reasons.
            </p>
          </Section>

          <Section title="4. Cookies and Similar Technologies">
            <p>On the website we use cookies and similar technologies to:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Keep you signed in to your account (authentication session cookies)</li>
              <li>Remember your theme preference (dark/light mode)</li>
              <li>Measure usage with analytics to improve the service</li>
              <li>Show and measure advertising through Ezoic and its partners, subject to your consent choices (see Section 6)</li>
            </ul>
            <p>
              You can disable cookies in your browser settings, though disabling authentication cookies will prevent you from staying logged in.
            </p>
          </Section>

          <Section title="5. Data Storage and Security">
            <p>
              Your account data, listings and uploaded photos are stored on our own Hetzner servers in Germany, with encrypted connections (TLS 1.2+). Subscription payments are handled by Paddle; we do not store raw payment card data on our servers.
            </p>
            <p>
              We implement access controls, encrypted connections, and regular security reviews. However, no internet service can guarantee absolute security. If you suspect unauthorised access to your account, please contact us immediately at <a href="mailto:support@marineyard.com" className="hover:underline" style={{ color: 'var(--accent)' }}>support@marineyard.com</a>.
            </p>
          </Section>

          <Section title="6. Advertising">
            <p>
              The website displays advertisements through <strong style={{ color: 'var(--text-primary)' }}>Ezoic</strong> and its advertising partners. They may use cookies and similar technologies to serve, personalise and measure ads. Where the law requires it, a consent notice lets you accept or refuse these technologies, and you can change your browser&apos;s cookie settings at any time. See{' '}
              <a href="https://www.ezoic.com/privacy-policy/" target="_blank" rel="noopener noreferrer" className="hover:underline" style={{ color: 'var(--accent)' }}>Ezoic&apos;s Privacy Policy</a>.
            </p>
          </Section>

          <Section title="7. Data Retention">
            <p>
              We retain your account data for as long as your account is active. If you delete your account, we will delete your personal data and listings within 30 days, except where we are legally required to retain certain records (e.g., financial transaction records for tax compliance, typically up to 7 years) or need them to investigate fraud or abuse. See our{' '}
              <Link href="/delete-account" className="hover:underline" style={{ color: 'var(--accent)' }}>Account &amp; Data Deletion</Link> page for how to request deletion.
            </p>
            <p>Anonymous, non-identifiable usage data may be retained indefinitely for analytical purposes.</p>
          </Section>

          <Section title="8. Third-Party Services">
            <p>We use the following third-party services that may process your data:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li><strong style={{ color: 'var(--text-primary)' }}>Hetzner</strong> — our own servers in Germany host the website, database, authentication, and file storage (hetzner.com)</li>
              <li><strong style={{ color: 'var(--text-primary)' }}>Paddle</strong> — Merchant of Record for subscription billing, payments, taxes and refunds (paddle.com)</li>
              <li><strong style={{ color: 'var(--text-primary)' }}>Ezoic</strong> — advertising on the website (ezoic.com)</li>
              <li><strong style={{ color: 'var(--text-primary)' }}>Google Analytics</strong> — website usage analytics (google.com)</li>
              <li><strong style={{ color: 'var(--text-primary)' }}>Google Sign-In</strong> — optional authentication (google.com)</li>
            </ul>
            <p>Each of these services has its own privacy policy. We only share the minimum data necessary for these services to function.</p>
          </Section>

          <Section title="9. Your Rights (GDPR / Global Privacy)">
            <p>Depending on your location, you may have the following rights regarding your personal data:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li><strong style={{ color: 'var(--text-primary)' }}>Right of access</strong> — request a copy of your personal data</li>
              <li><strong style={{ color: 'var(--text-primary)' }}>Right to rectification</strong> — request correction of inaccurate data</li>
              <li><strong style={{ color: 'var(--text-primary)' }}>Right to erasure</strong> — request deletion of your personal data ("right to be forgotten")</li>
              <li><strong style={{ color: 'var(--text-primary)' }}>Right to data portability</strong> — receive your data in a machine-readable format</li>
              <li><strong style={{ color: 'var(--text-primary)' }}>Right to restrict processing</strong> — ask us to stop processing your data in certain circumstances</li>
              <li><strong style={{ color: 'var(--text-primary)' }}>Right to object</strong> — object to processing based on legitimate interests</li>
            </ul>
            <p>
              To exercise any of these rights, email us at <a href="mailto:support@marineyard.com" className="hover:underline" style={{ color: 'var(--accent)' }}>support@marineyard.com</a>. We will respond within 30 days.
            </p>
          </Section>

          <Section title="10. Children's Privacy">
            <p>
              MarineYard is a marketplace for adults and businesses and is not directed at children. You must be at least 18 to create an account, and we do not knowingly collect personal data from children under 13. If you believe a child has provided us with personal information, please contact us and we will delete it promptly.
            </p>
          </Section>

          <Section title="11. Changes to This Policy">
            <p>
              We may update this Privacy Policy from time to time. When we do, we will update the "Last updated" date at the top of this page. Continued use of the Service after changes constitutes acceptance of the updated policy. For material changes, we will notify registered users by email.
            </p>
          </Section>

          <Section title="12. Contact Us">
            <p>
              If you have questions, concerns, or requests regarding this Privacy Policy or your personal data, please contact us:
            </p>
            <div className="p-4 rounded-xl" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
              <p><strong style={{ color: 'var(--text-primary)' }}>MarineYard</strong></p>
              <p>Email: <a href="mailto:support@marineyard.com" className="hover:underline" style={{ color: 'var(--accent)' }}>support@marineyard.com</a></p>
              <p>Website: <Link href="/contact" className="hover:underline" style={{ color: 'var(--accent)' }}>Contact Form</Link></p>
            </div>
          </Section>
        </div>

        <div className="mt-12 pt-8 flex flex-col sm:flex-row items-center gap-4" style={{ borderTop: '1px solid var(--border)' }}>
          <Link href="/delete-account" className="text-sm hover:underline" style={{ color: 'var(--accent)' }}>
            → Delete Your Account &amp; Data
          </Link>
          <Link href="/terms" className="text-sm hover:underline" style={{ color: 'var(--accent)' }}>
            → Terms of Service
          </Link>
          <Link href="/contact" className="text-sm hover:underline" style={{ color: 'var(--text-muted)' }}>
            → Contact Us
          </Link>
        </div>
      </div>
    </div>
  )
}
