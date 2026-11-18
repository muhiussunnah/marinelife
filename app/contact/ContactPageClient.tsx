'use client'
import { useState } from 'react'
import { Mail, Clock, AlertTriangle, ChevronDown, CheckCircle2, MessageSquare, Bug, Lightbulb, ShieldAlert, ArrowRight, Flag, Anchor, CreditCard } from 'lucide-react'
import Link from 'next/link'
import { createClient } from '@/lib/browser-client'

const SUBJECTS = [
  { value: 'General', label: 'General Question', icon: MessageSquare },
  { value: 'Listings & Account', label: 'Listings & Account Help', icon: Anchor },
  { value: 'Billing', label: 'Plans & Billing', icon: CreditCard },
  { value: 'Report a Listing', label: 'Report a Listing', icon: ShieldAlert },
  { value: 'Bug Report', label: 'Bug Report', icon: Bug },
  { value: 'Feature Request', label: 'Feature Request', icon: Lightbulb },
]

const FAQ_ITEMS = [
  {
    q: 'Is it free to list ship parts on MarineYard?',
    a: 'Yes. Every free account includes 90 credits — enough for 9 listings, as each listing uses 10 credits. You can also earn bonus credits through the referral program. If you need more, paid plans add listings every month.',
  },
  {
    q: 'What do the paid plans include?',
    a: 'Starter ($4.99/mo) gives you 12 listings a month. Explorer ($9.99/mo) gives 55 listings a month plus featured placement. Pro ($19.99/mo) gives 120 listings a month, top placement and priority support. Every plan starts with a 7-day free trial and 50% off the first month, and you can cancel anytime.',
  },
  {
    q: 'How do I list a part for sale?',
    a: 'Create an account with your email or Google, then open your dashboard and add a new listing. Clear photos of the actual item, the maker, model and part number, condition, quantity, price and location help buyers find and trust your listing.',
  },
  {
    q: 'Does MarineYard handle payment or shipping?',
    a: 'No. MarineYard is a listing venue: buyers contact sellers directly and agree price, payment and shipping between themselves. We are not a party to any sale, we never hold money and we do not inspect or guarantee parts — so always verify part numbers, condition and documents before you pay.',
  },
  {
    q: 'How do I report a suspicious or prohibited listing?',
    a: 'Send us the listing link using the form below with the subject "Report a Listing" and tell us what is wrong. Our moderators review reports and remove listings that break our rules, including stolen goods, weapons and counterfeit or misrepresented parts.',
  },
  {
    q: 'How long does support take to respond?',
    a: 'We respond to all enquiries within 24 hours on business days (Monday–Friday). Reports of fraudulent or prohibited listings are prioritised. For problems with a specific listing, including its link helps us resolve it faster.',
  },
]

export default function ContactPageClient() {
  const [formData, setFormData] = useState({ name: '', email: '', subject: 'General', message: '' })
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)
  const [openFaq, setOpenFaq] = useState<number | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    const supabase = createClient()
    await supabase.from('contact_requests').insert([formData])
    setSubmitted(true)
    setLoading(false)
    setFormData({ name: '', email: '', subject: 'General', message: '' })
  }

  return (
    <>
      {/* ── Hero ──────────────────────────────────────────── */}
      <div className="text-center mb-16">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-semibold mb-6" style={{ background: 'var(--accent-bg)', color: 'var(--accent)', border: '1px solid var(--accent)' }}>
          <MessageSquare className="w-3.5 h-3.5" />
          Support &amp; Contact
        </div>
        <h1 className="font-playfair text-4xl md:text-5xl font-bold mb-4" style={{ color: 'var(--text-primary)' }}>
          How Can We Help You?
        </h1>
        <p className="text-lg max-w-xl mx-auto" style={{ color: 'var(--text-muted)' }}>
          Whether you need help with a listing, your plan or billing, want to report a suspicious listing, or just want to say hello — we read every message and reply within 24 hours.
        </p>
      </div>

      {/* ── Contact Info Cards ─────────────────────────────── */}
      <div className="grid sm:grid-cols-3 gap-4 mb-14">
        {[
          {
            icon: Mail,
            title: 'Email Us',
            value: 'support@marineyard.com',
            sub: 'We reply to every email',
            color: 'var(--accent)',
            bg: 'var(--accent-bg)',
          },
          {
            icon: Clock,
            title: 'Response Time',
            value: 'Within 24 Hours',
            sub: 'Monday – Friday, business days',
            color: '#3b82f6',
            bg: '#3b82f615',
          },
          {
            icon: CheckCircle2,
            title: 'Marketplace',
            value: 'Open 24/7',
            sub: 'Browse and list parts any time',
            color: '#0891b2',
            bg: '#0891b215',
          },
        ].map((card) => (
          <div key={card.title} className="p-6 rounded-2xl flex flex-col items-center text-center" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
            <div className="w-11 h-11 rounded-xl flex items-center justify-center mb-4" style={{ background: card.bg }}>
              <card.icon className="w-5 h-5" style={{ color: card.color }} />
            </div>
            <p className="text-xs font-semibold uppercase tracking-widest mb-1" style={{ color: 'var(--text-faint)' }}>{card.title}</p>
            <p className="font-semibold text-sm mb-1" style={{ color: 'var(--text-primary)' }}>{card.value}</p>
            <p className="text-xs" style={{ color: 'var(--text-faint)' }}>{card.sub}</p>
          </div>
        ))}
      </div>

      {/* ── Suspicious Listing Protocol ────────────────────── */}
      <div className="p-6 md:p-8 rounded-2xl mb-14" style={{ background: '#ef444410', border: '1px solid #ef444430' }}>
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0 w-11 h-11 rounded-xl flex items-center justify-center" style={{ background: '#ef444425' }}>
            <AlertTriangle className="w-5 h-5" style={{ color: '#ef4444' }} />
          </div>
          <div className="flex-1">
            <h2 className="font-playfair text-xl font-bold mb-1" style={{ color: '#ef4444' }}>
              Suspicious Listing or Payment Request? Stop and Report It.
            </h2>
            <p className="text-sm mb-5" style={{ color: 'var(--text-muted)' }}>
              MarineYard never asks for payment, card details or passwords by message, and we never hold money for a sale. If something about a listing, buyer or seller feels wrong:
            </p>

            <ol className="text-sm space-y-2 mb-6" style={{ color: 'var(--text-muted)' }}>
              {[
                'Stop — don\'t send money or share card, bank or login details',
                'Keep the listing link and any messages or emails you received',
                'Report it to us using the form below with the subject "Report a Listing"',
                'Don\'t pay someone you haven\'t verified by gift card, crypto or other untraceable methods',
                'If you have already paid, contact your bank or card provider straight away',
                'For theft or fraud, report it to your local police as well',
              ].map((step, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold mt-0.5" style={{ background: '#ef444425', color: '#ef4444' }}>{i + 1}</span>
                  {step}
                </li>
              ))}
            </ol>

            <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-3">
              {[
                { flag: 'Too good to be true', detail: 'Price far below market for a new or OEM part' },
                { flag: 'Pressure to pay fast', detail: 'Urgent deadlines or "other buyers are waiting"' },
                { flag: 'Unusual payment', detail: 'Gift cards, crypto or suddenly changed bank details' },
                { flag: 'No real photos', detail: 'Only stock images, nothing of the actual item' },
                { flag: 'Missing documents', detail: 'No serial number, certificate or test report' },
                { flag: 'Details don\'t match', detail: 'Company name, email and bank account differ' },
              ].map((c) => (
                <div key={c.flag} className="p-3 rounded-xl text-xs" style={{ background: '#ef444410', border: '1px solid #ef444420' }}>
                  <p className="font-bold mb-1 flex items-center gap-1" style={{ color: '#ef4444' }}>
                    <Flag className="w-3 h-3" /> {c.flag}
                  </p>
                  <p style={{ color: 'var(--text-muted)' }}>{c.detail}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── Form + Side Info ──────────────────────────────── */}
      <div className="grid md:grid-cols-5 gap-10 mb-20">

        {/* Side info */}
        <div className="md:col-span-2 space-y-6">
          <div>
            <h2 className="font-playfair text-2xl font-bold mb-3" style={{ color: 'var(--text-primary)' }}>
              What Can We Help With?
            </h2>
            <p className="text-sm leading-relaxed" style={{ color: 'var(--text-muted)' }}>
              Use the form to reach us about anything related to MarineYard — listings, accounts, plans or partnerships.
            </p>
          </div>

          <div className="space-y-3">
            {SUBJECTS.map((s) => (
              <div key={s.value} className="flex items-center gap-3 p-3 rounded-xl" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
                <s.icon className="w-4 h-4" style={{ color: 'var(--accent)' }} />
                <span className="text-sm" style={{ color: 'var(--text-muted)' }}>{s.label}</span>
              </div>
            ))}
          </div>

          <div className="p-5 rounded-2xl" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
            <p className="text-sm font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>Tips for faster help</p>
            <ul className="text-xs space-y-2" style={{ color: 'var(--text-muted)' }}>
              <li className="flex items-start gap-2"><CheckCircle2 className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" style={{ color: 'var(--accent)' }} />Include a screenshot for technical issues</li>
              <li className="flex items-start gap-2"><CheckCircle2 className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" style={{ color: 'var(--accent)' }} />Include the listing link for listing questions or reports</li>
              <li className="flex items-start gap-2"><CheckCircle2 className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" style={{ color: 'var(--accent)' }} />Mention your browser/device for bug reports</li>
            </ul>
          </div>
        </div>

        {/* Form */}
        <div className="md:col-span-3">
          {submitted ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-12 rounded-2xl" style={{ background: 'var(--accent-bg)', border: '1px solid var(--accent)' }}>
              <div className="w-16 h-16 rounded-full flex items-center justify-center mb-6" style={{ background: 'var(--btn-primary)' }}>
                <CheckCircle2 className="w-8 h-8 text-white" />
              </div>
              <h3 className="font-playfair text-2xl font-bold mb-3" style={{ color: 'var(--text-primary)' }}>Message Received!</h3>
              <p className="mb-6" style={{ color: 'var(--text-muted)' }}>Thank you for reaching out. We'll get back to you within 24 hours on business days.</p>
              <button
                onClick={() => setSubmitted(false)}
                className="px-6 py-3 rounded-full font-semibold hover:opacity-90 transition-opacity"
                style={{ background: 'var(--btn-primary)', color: '#fff' }}
              >
                Send Another Message
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5 p-8 rounded-2xl" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
              <h2 className="font-playfair text-2xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>Send Us a Message</h2>
              <p className="text-sm mb-6" style={{ color: 'var(--text-muted)' }}>Fill out the form below and we'll reply within 24 hours.</p>

              <div className="grid sm:grid-cols-2 gap-5">
                <div>
                  <label htmlFor="contact-name" className="block text-sm font-medium mb-2" style={{ color: 'var(--text-primary)' }}>
                    Your Name <span style={{ color: '#ef4444' }}>*</span>
                  </label>
                  <input
                    id="contact-name"
                    type="text"
                    required
                    placeholder="Jane Smith"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl text-sm focus:outline-none transition-colors"
                    style={{ background: 'var(--bg-primary)', border: '1px solid var(--border)', color: 'var(--text-primary)' }}
                  />
                </div>
                <div>
                  <label htmlFor="contact-email" className="block text-sm font-medium mb-2" style={{ color: 'var(--text-primary)' }}>
                    Email Address <span style={{ color: '#ef4444' }}>*</span>
                  </label>
                  <input
                    id="contact-email"
                    type="email"
                    required
                    placeholder="jane@example.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl text-sm focus:outline-none transition-colors"
                    style={{ background: 'var(--bg-primary)', border: '1px solid var(--border)', color: 'var(--text-primary)' }}
                  />
                </div>
              </div>

              <div>
                <label htmlFor="contact-subject" className="block text-sm font-medium mb-2" style={{ color: 'var(--text-primary)' }}>Subject</label>
                <select
                  id="contact-subject"
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl text-sm focus:outline-none"
                  style={{ background: 'var(--bg-primary)', border: '1px solid var(--border)', color: 'var(--text-primary)' }}
                >
                  {SUBJECTS.map((s) => (
                    <option key={s.value} value={s.value}>{s.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="contact-message" className="block text-sm font-medium mb-2" style={{ color: 'var(--text-primary)' }}>
                  Message <span style={{ color: '#ef4444' }}>*</span>
                </label>
                <textarea
                  id="contact-message"
                  required
                  rows={6}
                  placeholder="Describe your question or issue in detail. Include listing links where relevant..."
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl text-sm focus:outline-none resize-none"
                  style={{ background: 'var(--bg-primary)', border: '1px solid var(--border)', color: 'var(--text-primary)' }}
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 px-6 py-4 rounded-xl font-semibold text-sm glow-green hover:opacity-90 transition-opacity disabled:opacity-60"
                style={{ background: 'var(--btn-primary)', color: '#fff' }}
              >
                {loading ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    Send Message
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          )}
        </div>
      </div>

      {/* ── FAQ ───────────────────────────────────────────── */}
      <section aria-labelledby="faq-heading">
        <div className="text-center mb-10">
          <h2 id="faq-heading" className="font-playfair text-3xl font-bold mb-3" style={{ color: 'var(--text-primary)' }}>
            Frequently Asked Questions
          </h2>
          <p style={{ color: 'var(--text-muted)' }}>Quick answers to the questions we hear most often.</p>
        </div>

        <div className="space-y-3 max-w-3xl mx-auto">
          {FAQ_ITEMS.map((item, i) => (
            <div
              key={i}
              className="rounded-2xl overflow-hidden"
              style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}
            >
              <button
                onClick={() => setOpenFaq(openFaq === i ? null : i)}
                className="w-full flex items-center justify-between gap-4 px-6 py-5 text-left"
                aria-expanded={openFaq === i}
              >
                <span className="font-medium text-sm" style={{ color: 'var(--text-primary)' }}>{item.q}</span>
                <ChevronDown
                  className="w-4 h-4 flex-shrink-0 transition-transform duration-200"
                  style={{ color: 'var(--accent)', transform: openFaq === i ? 'rotate(180deg)' : 'rotate(0deg)' }}
                />
              </button>
              {openFaq === i && (
                <div className="px-6 pb-5">
                  <p className="text-sm leading-relaxed" style={{ color: 'var(--text-muted)' }}>{item.a}</p>
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="text-center mt-10">
          <p className="text-sm mb-4" style={{ color: 'var(--text-muted)' }}>Have spare parts to sell?</p>
          <Link
            href="/dashboard/listings/new"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full text-sm font-semibold glow-green hover:opacity-90 transition-opacity"
            style={{ background: 'var(--btn-primary)', color: '#fff' }}
          >
            List a Part Free <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>
    </>
  )
}
