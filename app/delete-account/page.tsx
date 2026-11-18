import type { Metadata } from 'next'
import Link from 'next/link'
import { absoluteUrl } from '@/lib/brand'

export const metadata: Metadata = {
  title: 'Delete Your Account & Data | MarineYard',
  description: 'How to delete your MarineYard account and personal data. Request deletion of your account, listings, saved articles and all associated data.',
  alternates: { canonical: absoluteUrl('/delete-account') },
}

const LAST_UPDATED = 'November 18, 2026'
const SUPPORT_EMAIL = 'support@marineyard.com'
const DELETE_SUBJECT = 'Delete my account and data'

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

export default function DeleteAccountPage() {
  const mailto = `mailto:${SUPPORT_EMAIL}?subject=${encodeURIComponent(DELETE_SUBJECT)}`

  return (
    <div className="min-h-screen pt-28 pb-20 px-6" style={{ background: 'var(--bg-primary)' }}>
      <div className="max-w-3xl mx-auto">

        {/* Header */}
        <div className="mb-12">
          <nav className="flex items-center gap-2 text-xs mb-6" style={{ color: 'var(--text-muted)' }}>
            <Link href="/" className="hover:underline">Home</Link>
            <span>/</span>
            <span style={{ color: 'var(--text-primary)' }}>Delete Account &amp; Data</span>
          </nav>
          <h1 className="font-playfair text-4xl md:text-5xl font-bold mb-4" style={{ color: 'var(--text-primary)' }}>
            Delete Your Account &amp; Data
          </h1>
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
            Last updated: <strong style={{ color: 'var(--text-primary)' }}>{LAST_UPDATED}</strong>
          </p>
          <div className="mt-6 p-4 rounded-xl text-sm" style={{ background: 'var(--accent-bg)', border: '1px solid var(--border)' }}>
            <p style={{ color: 'var(--text-primary)' }}>
              This page explains how to permanently delete your <strong>MarineYard</strong> account and personal data from marineyard.com, including your listings and everything linked to your account.
            </p>
          </div>
        </div>

        <div style={{ borderTop: '1px solid var(--border)' }} className="pt-10">

          <Section title="Option 1 — Request deletion by email (recommended)">
            <p>
              To delete your account and all associated personal data, send us an email from the email address linked to your account:
            </p>
            <div className="p-5 rounded-xl" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
              <p className="mb-1"><strong style={{ color: 'var(--text-primary)' }}>To:</strong> <a href={mailto} className="hover:underline" style={{ color: 'var(--accent)' }}>{SUPPORT_EMAIL}</a></p>
              <p className="mb-1"><strong style={{ color: 'var(--text-primary)' }}>Subject:</strong> {DELETE_SUBJECT}</p>
              <p><strong style={{ color: 'var(--text-primary)' }}>Message:</strong> Please delete my MarineYard account and all associated data.</p>
            </div>
            <div className="pt-2">
              <a
                href={mailto}
                className="inline-block px-6 py-3 rounded-xl text-sm font-semibold"
                style={{ background: 'var(--btn-primary, var(--accent))', color: '#ffffff' }}
              >
                Email us to delete my account
              </a>
            </div>
            <p>
              We verify the request comes from the account owner, then permanently delete your account. You&apos;ll receive a confirmation once it&apos;s done.
            </p>
          </Section>

          <Section title="Option 2 — Just remove your listings">
            <p>
              If you only want to take parts off the marketplace, you don&apos;t need to close your account:
            </p>
            <ol className="list-decimal pl-5 space-y-1">
              <li>Sign in to <strong style={{ color: 'var(--text-primary)' }}>MarineYard</strong>.</li>
              <li>Open your dashboard and go to <Link href="/dashboard/listings" className="hover:underline" style={{ color: 'var(--accent)' }}>My Listings</Link>.</li>
              <li>Delete the listings you no longer want to show.</li>
            </ol>
            <p>
              Deleted listings are taken off public view straight away. To remove your account and all of your data, use Option 1 above.
            </p>
          </Section>

          <Section title="What gets deleted">
            <p>When your account is deleted, we permanently remove:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Your account, email, password, and profile (name, country and avatar)</li>
              <li>All of your listings, including their photos, descriptions and contact details</li>
              <li>Your saved Resources articles</li>
              <li>Your credits balance, plan details and referral data</li>
            </ul>
          </Section>

          <Section title="What may be retained (and why)">
            <p>
              For legal and accounting reasons, we may retain a limited set of records after deletion:
            </p>
            <ul className="list-disc pl-5 space-y-1">
              <li><strong style={{ color: 'var(--text-primary)' }}>Transaction / subscription records</strong> — kept for tax and financial compliance, typically up to 7 years. Managed and stored by Paddle, our Merchant of Record, not linked to your deleted profile.</li>
              <li><strong style={{ color: 'var(--text-primary)' }}>Moderation and fraud records</strong> — limited records of listings removed for breaking our rules, or of reported fraud, kept only as long as needed to prevent abuse and meet legal obligations.</li>
              <li><strong style={{ color: 'var(--text-primary)' }}>Anonymous, non-identifiable usage data</strong> — cannot be traced back to you and may be kept for analytics.</li>
            </ul>
            <p>
              Everything else that identifies you is deleted from our active systems within <strong style={{ color: 'var(--text-primary)' }}>30 days</strong>. Backups are purged on our normal rotation cycle shortly after.
            </p>
          </Section>

          <Section title="Note about paid plans">
            <p>
              If you have an active Starter, Explorer or Pro plan, please cancel it from your account dashboard (or ask us to cancel it in your deletion email) so you are not billed again. Billing is handled by Paddle, and our <Link href="/refund" className="hover:underline" style={{ color: 'var(--accent)' }}>Refund Policy</Link> still applies. Deleting your account is permanent and cannot be undone.
            </p>
          </Section>

          <Section title="Contact">
            <p>
              Questions about deleting your data? Reach us any time:
            </p>
            <div className="p-4 rounded-xl" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
              <p><strong style={{ color: 'var(--text-primary)' }}>MarineYard</strong></p>
              <p>Email: <a href={mailto} className="hover:underline" style={{ color: 'var(--accent)' }}>{SUPPORT_EMAIL}</a></p>
              <p>Website: <Link href="/contact" className="hover:underline" style={{ color: 'var(--accent)' }}>Contact Form</Link></p>
            </div>
          </Section>
        </div>

        <div className="mt-12 pt-8 flex flex-col sm:flex-row items-center gap-4" style={{ borderTop: '1px solid var(--border)' }}>
          <Link href="/privacy" className="text-sm hover:underline" style={{ color: 'var(--accent)' }}>
            → Privacy Policy
          </Link>
          <Link href="/terms" className="text-sm hover:underline" style={{ color: 'var(--text-muted)' }}>
            → Terms of Service
          </Link>
        </div>
      </div>
    </div>
  )
}
