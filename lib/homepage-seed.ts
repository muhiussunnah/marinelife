/**
 * Seed data for the homepage block editor.
 *
 * When the admin clicks "Import current homepage content" on /admin/homepage
 * we insert these blocks in order. It is a short, neutral MarineYard starting
 * point — every block is fully editable (or deletable) in the admin UI.
 */

export interface SeedBlock {
  block_type:
    | 'heading' | 'rich-text' | 'image' | 'two-column'
    | 'visual-break' | 'cta-box' | 'feature-grid'
  data: Record<string, any>
}

export const HOMEPAGE_SEED_BLOCKS: SeedBlock[] = [
  // ── 1. Intro ───────────────────────────────────────────────────────
  {
    block_type: 'heading',
    data: {
      title: 'The Global Marketplace for Ship Spare Parts & Marine Equipment',
      subtitle: 'List surplus spares for free and reach buyers in ports around the world.',
      level: 'h2',
      align: 'center',
    },
  },
  {
    block_type: 'rich-text',
    data: {
      html: `<p>MarineYard connects ship owners, technical superintendents, chief engineers, shipyards and marine suppliers who buy and sell spare parts. Anyone can create an account, list engine, pump, deck, electrical and navigation equipment, and talk directly with buyers.</p>
<p>Alongside the marketplace, our <a href="/resources">Resources</a> section covers ship machinery, maintenance, safety regulations and practical buying guides written for people who work with vessels every day.</p>`,
    },
  },

  // ── 2. How it works ────────────────────────────────────────────────
  {
    block_type: 'feature-grid',
    data: {
      title: 'How MarineYard works',
      columns: 3,
      items: [
        { title: '01 · Create a free account', description: 'Sign up in a minute — individuals, ship managers, yards and suppliers are all welcome.' },
        { title: '02 · List your spare parts', description: 'Add photos, maker, model and part numbers, condition and location so buyers can find the right part fast.' },
        { title: '03 · Connect with buyers', description: 'Buyers contact you directly. Agree price, inspection and shipping on your own terms.' },
      ],
    },
  },

  // ── 3. Call to action ──────────────────────────────────────────────
  {
    block_type: 'cta-box',
    data: {
      variant: 'accent',
      heading: 'Have spare parts on board?',
      text: 'List surplus and reconditioned ship spares free on MarineYard and reach buyers worldwide.',
      buttonText: 'List parts free',
      buttonHref: '/dashboard/listings/new',
    },
  },
]
