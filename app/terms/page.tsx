import type { Metadata } from 'next'
import Link from 'next/link'
import { absoluteUrl } from '@/lib/brand'

export const metadata: Metadata = {
  title: 'Terms of Service | MarineYard',
  description: 'Read the MarineYard Terms of Service. Using our ship parts marketplace means you agree to terms on accounts, listings, prohibited items, credits, subscription plans and liability.',
  alternates: { canonical: absoluteUrl('/terms') },
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

export default function TermsOfServicePage() {
  return (
    <div className="min-h-screen pt-28 pb-20 px-6" style={{ background: 'var(--bg-primary)' }}>
      <div className="max-w-3xl mx-auto">

        {/* Header */}
        <div className="mb-12">
          <nav className="flex items-center gap-2 text-xs mb-6" style={{ color: 'var(--text-muted)' }}>
            <Link href="/" className="hover:underline">Home</Link>
            <span>/</span>
            <span style={{ color: 'var(--text-primary)' }}>Terms of Service</span>
          </nav>
          <h1 className="font-playfair text-4xl md:text-5xl font-bold mb-4" style={{ color: 'var(--text-primary)' }}>
            Terms of Service
          </h1>
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
            Last updated: <strong style={{ color: 'var(--text-primary)' }}>{LAST_UPDATED}</strong>
          </p>
          <div className="mt-6 p-4 rounded-xl text-sm" style={{ background: 'var(--accent-bg)', border: '1px solid var(--border)' }}>
            <p style={{ color: 'var(--text-primary)' }}>
              Please read these Terms of Service carefully before using <strong>MarineYard</strong> (marineyard.com). By accessing or using our service — whether you browse, list or buy — you agree to be bound by these terms. If you do not agree, please do not use the service.
            </p>
          </div>
        </div>

        <div style={{ borderTop: '1px solid var(--border)' }} className="pt-10">

          <Section title="1. About the Service">
            <p>
              MarineYard ("the Service", "we", "us") is operated by <strong style={{ color: 'var(--text-primary)' }}>Isloo Marketing</strong> and provides an online marketplace where registered users can list ship spare parts, marine equipment and related items, and where visitors can browse those listings and contact sellers. The Service also publishes marine engineering articles in its Resources section.
            </p>
            <p>
              MarineYard is a <strong style={{ color: 'var(--text-primary)' }}>listing venue only</strong>. We are not a party to any sale between users, we do not take possession of items, we do not hold or process payments for sales, and we do not guarantee the quality, safety, legality, authenticity or suitability of any item listed. Resources articles are for general information and are not a substitute for manufacturer instructions, class requirements or professional engineering advice.
            </p>
          </Section>

          <Section title="2. Eligibility">
            <p>
              You must be at least 18 years of age (or the age of majority where you live) and able to enter into a binding contract to create an account, list items or buy items through the Service. If you use the Service on behalf of a company or other organisation, you confirm that you are authorised to accept these Terms on its behalf.
            </p>
          </Section>

          <Section title="3. User Accounts">
            <p>
              Anyone can browse listings without an account. To create listings, save Resources articles or subscribe to a paid plan, you must create an account using your email address and a password, or by signing in with Google.
            </p>
            <p>When creating an account, you agree to:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Provide accurate and complete information, including your name and country</li>
              <li>Keep your password secure and confidential</li>
              <li>Notify us immediately if you suspect unauthorised access</li>
              <li>Be responsible for all activity and listings under your account</li>
            </ul>
            <p>
              We reserve the right to suspend or terminate accounts that violate these Terms or engage in fraudulent or abusive behaviour.
            </p>
          </Section>

          <Section title="4. Credits, Listings and Plans">
            <p>
              Listings on the Service use credits. Each listing uses <strong style={{ color: 'var(--text-primary)' }}>10 credits</strong>. Every free account receives <strong style={{ color: 'var(--text-primary)' }}>90 credits</strong> — enough for 9 listings — and you may earn bonus credits through our referral program. For more listings, you can subscribe to a monthly plan:
            </p>
            <ul className="list-disc pl-5 space-y-1">
              <li><strong style={{ color: 'var(--text-primary)' }}>Starter</strong> — $4.99/month — 12 listings per month</li>
              <li><strong style={{ color: 'var(--text-primary)' }}>Explorer</strong> — $9.99/month — 55 listings per month, plus featured placement</li>
              <li><strong style={{ color: 'var(--text-primary)' }}>Pro</strong> — $19.99/month — 120 listings per month, plus top placement and priority support</li>
            </ul>
            <p>
              All prices are listed in USD and may be subject to applicable taxes, which Paddle calculates at checkout. New subscriptions include a <strong style={{ color: 'var(--text-primary)' }}>7-day free trial</strong> and <strong style={{ color: 'var(--text-primary)' }}>50% off the first month</strong>. Unless you cancel before the trial ends, your subscription begins and then renews automatically every month at the current plan price until you cancel. You can cancel anytime; cancellation stops future renewals.
            </p>
            <p>
              Featured and top placement increase the visibility of your listings but do not guarantee views, enquiries or sales. Credits are non-transferable and cannot be exchanged for cash. If credits are deducted because of a technical error on our side, contact us and we will restore them.
            </p>
            <p>
              Plan features and prices are shown on our <Link href="/pricing" className="hover:underline" style={{ color: 'var(--accent)' }}>Pricing</Link> page. If we change the price of your plan, we will tell you in advance and the new price will apply from your next billing period.
            </p>
          </Section>

          <Section title="5. Refund Policy">
            <p>
              All payments are processed by <strong style={{ color: 'var(--text-primary)' }}>Paddle.com</strong> as our authorised reseller and Merchant of Record. We offer a <strong style={{ color: 'var(--text-primary)' }}>14-day money-back guarantee</strong> on subscription charges. If you are not satisfied with your plan for any reason, you may request a full refund of a charge within 14 days of the transaction date.
            </p>
            <p>
              To request a refund, contact us at{' '}
              <a href="mailto:support@marineyard.com" className="hover:underline" style={{ color: 'var(--accent)' }}>support@marineyard.com</a>{' '}
              or contact Paddle directly at{' '}
              <a href="https://paddle.net" target="_blank" rel="noopener noreferrer" className="hover:underline" style={{ color: 'var(--accent)' }}>paddle.net</a>.
              Refunds are processed by Paddle and may take 5–10 business days to appear on your statement.
              For full details, see our <Link href="/refund" className="hover:underline" style={{ color: 'var(--accent)' }}>Refund Policy</Link>.
            </p>
            <p>
              MarineYard does not process payments for items sold between users, so we cannot issue refunds for those purchases. Any refund, return or warranty claim for an item must be agreed between the buyer and the seller.
            </p>
          </Section>

          <Section title="6. Seller Responsibilities">
            <p>If you create a listing, you are solely responsible for it and you confirm that:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>You own the item or are authorised to sell it</li>
              <li>The listing is accurate and complete — including maker, model, part number, condition (new, used or reconditioned; genuine OEM or not), quantity, location and price</li>
              <li>Your photos show the actual item, or are clearly labelled as representative</li>
              <li>You disclose known defects, missing parts and missing or expired certificates or documentation</li>
              <li>The sale complies with all laws that apply to you and the buyer, including export controls, sanctions, customs and dangerous-goods rules</li>
              <li>You keep your listings up to date and remove items that are sold or no longer available</li>
            </ul>
          </Section>

          <Section title="7. Prohibited Items and Conduct">
            <p>You may not list:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Stolen goods or items obtained illegally</li>
              <li>Weapons, ammunition or explosives</li>
              <li>Counterfeit, replica or misrepresented parts, including non-OEM parts presented as genuine OEM parts</li>
              <li>Equipment with falsified or misrepresented certification, such as life-saving appliances or fire-fighting equipment</li>
              <li>Hazardous substances or dangerous goods that cannot lawfully be sold or transported</li>
              <li>Items whose sale would breach sanctions, embargoes or export restrictions</li>
              <li>Anything else that is illegal to sell where you or the buyer are located</li>
            </ul>
            <p>You also agree not to use the Service to:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Post spam, duplicate listings, or listings for items you do not have</li>
              <li>Commit fraud, phishing, or request payment for items you do not intend to supply</li>
              <li>Scrape, copy or harvest listings or user data, or circumvent usage limits through automated bots or scripts</li>
              <li>Harass other users, or upload illegal, harmful or offensive content</li>
              <li>Upload images containing personal data of others without their consent</li>
            </ul>
            <p>
              Violation of these rules may result in removal of your listings, immediate account suspension or termination, and forfeiture of remaining credits without refund. We may report illegal activity to the relevant authorities.
            </p>
          </Section>

          <Section title="8. Moderation">
            <p>
              We may, but are not obliged to, review listings before or after they are published. We may refuse, hide, edit the category or formatting of, or remove any listing at our discretion — including where we believe it breaks these Terms or could harm users or third parties. Credits used for a listing that is removed for breaking these Terms are not refunded.
            </p>
            <p>
              If you see a listing that you believe breaks these Terms, please report it through our <Link href="/contact" className="hover:underline" style={{ color: 'var(--accent)' }}>Contact Form</Link> and include the listing link.
            </p>
          </Section>

          <Section title="9. Transactions Between Users">
            <div className="p-4 rounded-xl" style={{ background: 'rgba(255,100,100,0.06)', border: '1px solid rgba(255,100,100,0.2)' }}>
              <p className="font-semibold mb-2" style={{ color: '#e05555' }}>⚠️ Important — MarineYard Is Not a Party to Sales</p>
              <p>
                Buyers contact sellers directly, and any sale is a contract solely between the buyer and the seller. MarineYard does not hold money, process payments for items, provide escrow, arrange shipping or inspect items. We do not verify users&apos; identities or the accuracy of listings, and we do not guarantee that any part is genuine, as described, compatible with your equipment or fit for any purpose, or that the other party will complete a sale.
              </p>
              <p className="mt-3">
                <strong style={{ color: 'var(--text-primary)' }}>Buyers are responsible for checking a part before they pay.</strong> Confirm the maker, model and part number against your equipment, request photos of the actual item, certificates and test reports, and inspect the item where possible. Installing any part on a vessel is at your own risk and should follow the manufacturer&apos;s instructions, class requirements and applicable regulations.
              </p>
              <p className="mt-3">
                MarineYard accepts <strong style={{ color: 'var(--text-primary)' }}>no liability</strong> for any loss, damage, injury, delay or off-hire arising from transactions between users or from items bought or sold through listings on the Service. Any dispute about a sale must be resolved between the buyer and the seller.
              </p>
            </div>
          </Section>

          <Section title="10. Intellectual Property">
            <p>
              All content on MarineYard — including but not limited to the website design, Resources articles, written content, and branding — is owned by or licensed to MarineYard and protected by copyright and intellectual property laws.
            </p>
            <p>
              You retain ownership of the photos and text you upload in your listings. By publishing a listing, you grant us a worldwide, non-exclusive, royalty-free licence to host, display, reproduce and format that content in order to operate and promote the Service (for example, in search results and on social media) for as long as it remains on the Service. You confirm you have the rights to the content you upload. Manufacturer names, trademarks and part numbers may be used only to describe an item accurately; they remain the property of their owners and do not imply any endorsement.
            </p>
          </Section>

          <Section title="11. Limitation of Liability">
            <p>
              To the maximum extent permitted by applicable law, MarineYard and its operators shall not be liable for any indirect, incidental, special, consequential, or punitive damages arising from:
            </p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Use or inability to use the Service</li>
              <li>Listings, content or conduct of other users</li>
              <li>Any transaction, or failed transaction, between users</li>
              <li>Items that are defective, counterfeit, not as described, or unsuitable for your equipment</li>
              <li>Decisions made based on listings or Resources articles</li>
              <li>Unauthorised access to your account</li>
              <li>Any errors, interruptions, or loss of data</li>
            </ul>
            <p>
              Our total liability to you for any claim arising from use of the Service shall not exceed the amount you paid us for the Service in the 12 months preceding the claim.
            </p>
          </Section>

          <Section title="12. Indemnity">
            <p>
              You agree to indemnify and hold harmless MarineYard and its operators from any claims, losses or costs (including reasonable legal fees) arising from your listings, your transactions with other users, or your breach of these Terms.
            </p>
          </Section>

          <Section title="13. Service Availability">
            <p>
              We strive to maintain a reliable service but do not guarantee 100% uptime. We may temporarily suspend the Service for maintenance, updates, or circumstances beyond our control. We will attempt to provide advance notice of planned downtime where possible.
            </p>
          </Section>

          <Section title="14. Changes to Terms">
            <p>
              We may update these Terms of Service at any time. The updated version will be posted on this page with a revised date. Continued use of the Service after changes constitutes your acceptance of the new terms. For material changes, we will notify registered users by email at least 14 days in advance.
            </p>
          </Section>

          <Section title="15. Governing Law">
            <p>
              These Terms are governed by and construed in accordance with applicable international law. Any disputes arising from these Terms shall first be attempted to be resolved through good-faith negotiation. If resolution cannot be reached, disputes shall be subject to binding arbitration.
            </p>
          </Section>

          <Section title="16. Contact">
            <p>If you have questions about these Terms, please contact us:</p>
            <div className="p-4 rounded-xl" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
              <p><strong style={{ color: 'var(--text-primary)' }}>Isloo Marketing</strong></p>
              <p><strong style={{ color: 'var(--text-primary)' }}>MarineYard.com</strong></p>
              <p>Email: <a href="mailto:support@marineyard.com" className="hover:underline" style={{ color: 'var(--accent)' }}>support@marineyard.com</a></p>
              <p>Website: <Link href="/contact" className="hover:underline" style={{ color: 'var(--accent)' }}>Contact Form</Link></p>
            </div>
          </Section>
        </div>

        <div className="mt-12 pt-8 flex flex-col sm:flex-row items-center gap-4" style={{ borderTop: '1px solid var(--border)' }}>
          <Link href="/privacy" className="text-sm hover:underline" style={{ color: 'var(--accent)' }}>
            → Privacy Policy
          </Link>
          <Link href="/pricing" className="text-sm hover:underline" style={{ color: 'var(--text-muted)' }}>
            → View Pricing Plans
          </Link>
        </div>
      </div>
    </div>
  )
}
