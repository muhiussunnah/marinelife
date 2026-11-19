/**
 * Branded listing images, drawn in the MarineYard look (logo, Sora + Inter,
 * navy/sky/amber palette):
 *
 *   brandedPhoto() — a seller's photo placed on a clean frame with the
 *                    MarineYard bar underneath (1200×900 WebP)
 *   specCard()     — a spec sheet for the listing (1200×900 WebP)
 *
 * Text is laid out with Satori (the engine behind next/og) using the font
 * files in /public/fonts, and sharp does the resizing and WebP encoding.
 */
import { promises as fs } from 'node:fs'
import path from 'node:path'
import sharp from 'sharp'
import { ImageResponse } from 'next/server'

const W = 1200
const H = 900

const C = {
  navy: '#0a1f33',
  deep: '#0b2a4a',
  accent: '#0a5c9e',
  sky: '#0b7fc0',
  skySoft: '#bfe3f7',
  amber: '#f59e0b',
  amberSoft: '#fbbf24',
  paper: '#f3f7fb',
  line: '#d9e5f0',
  muted: '#5b7690',
}

type Font = { name: string; data: ArrayBuffer; weight: 400 | 500 | 600 | 700 | 800; style: 'normal' }
let fontCache: Promise<Font[]> | null = null
let logoCache: Promise<string> | null = null

function publicFile(rel: string) {
  return path.join(process.cwd(), 'public', rel)
}

function loadFonts(): Promise<Font[]> {
  if (!fontCache) {
    const list: [string, string, Font['weight']][] = [
      ['Inter', 'fonts/inter-400.woff', 400],
      ['Inter', 'fonts/inter-600.woff', 600],
      ['Inter', 'fonts/inter-700.woff', 700],
      ['Sora', 'fonts/sora-700.woff', 700],
      ['Sora', 'fonts/sora-800.woff', 800],
    ]
    fontCache = Promise.all(
      list.map(async ([name, file, weight]) => {
        const b = await fs.readFile(publicFile(file))
        return { name, weight, style: 'normal' as const, data: b.buffer.slice(b.byteOffset, b.byteOffset + b.byteLength) as ArrayBuffer }
      }),
    ).catch((e) => {
      fontCache = null
      throw e
    })
  }
  return fontCache
}

function loadLogo(): Promise<string> {
  if (!logoCache) {
    logoCache = fs
      .readFile(publicFile('logo-512.png'))
      .then((b) => `data:image/png;base64,${b.toString('base64')}`)
      .catch((e) => {
        logoCache = null
        throw e
      })
  }
  return logoCache
}

/* Satori takes React-like element objects; this keeps the templates readable without JSX. */
type El = { type: string; props: Record<string, any> }
function h(type: string, props: Record<string, any> | null, ...children: any[]): El {
  const kids = children.flat().filter((c) => c !== null && c !== undefined && c !== false && c !== '')
  return { type, props: { ...(props || {}), children: kids.length === 0 ? undefined : kids.length === 1 ? kids[0] : kids } }
}

function cut(s: string | null | undefined, max: number) {
  const t = String(s || '').replace(/\s+/g, ' ').trim()
  return t.length > max ? `${t.slice(0, max - 1).trimEnd()}…` : t
}

async function render(el: El): Promise<Buffer> {
  const res = new ImageResponse(el as any, { width: W, height: H, fonts: (await loadFonts()) as any })
  const png = Buffer.from(await res.arrayBuffer())
  return sharp(png).webp({ quality: 86, effort: 5 }).toBuffer()
}

function brandMark(logo: string, size: number, onDark: boolean) {
  return h(
    'div',
    { style: { display: 'flex', alignItems: 'center', gap: Math.round(size * 0.28) } },
    h('img', { src: logo, width: size, height: size, style: { borderRadius: Math.round(size * 0.24) } }),
    h(
      'div',
      { style: { display: 'flex', fontFamily: 'Sora', fontWeight: 800, fontSize: Math.round(size * 0.52), letterSpacing: -0.5 } },
      h('span', { style: { color: onDark ? '#ffffff' : C.navy } }, 'Marine'),
      h('span', { style: { color: onDark ? '#5cc0f5' : C.accent } }, 'Yard'),
    ),
  )
}

function wave(width: number, color: string) {
  // the amber wave from the logo, as a thin divider
  const d = Array.from({ length: Math.ceil(width / 48) }, (_, i) => `q12 -7 24 0 t24 0`).join(' ')
  return h('img', {
    width,
    height: 14,
    src: `data:image/svg+xml;utf8,${encodeURIComponent(
      `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="14" viewBox="0 0 ${width} 14"><path d="M2 7 ${d}" fill="none" stroke="${color}" stroke-width="3.2" stroke-linecap="round"/></svg>`,
    )}`,
  })
}

export type ListingImageInfo = {
  title: string
  brand?: string | null
  model?: string | null
  part_number?: string | null
  categoryName?: string | null
  conditionLabel?: string | null
  quantity?: number | null
  location?: string | null
  priceLabel?: string | null
  description?: string | null
}

/** Short product name for captions: "MTU 16V4000 M71", else the title. */
function shortName(i: ListingImageInfo) {
  const bm = [i.brand && i.brand !== 'Assorted' ? i.brand : '', i.model || ''].filter(Boolean).join(' ')
  return bm.length >= 4 ? bm : cut(i.title, 48)
}

/* ── seller photo on a branded frame ──────────────────────────────── */

export async function brandedPhoto(photo: Buffer, info: ListingImageInfo): Promise<Buffer> {
  const [logo] = await Promise.all([loadLogo()])
  const BAR = 150
  const boxW = W - 2 * 36 - 2 * 28
  const boxH = H - BAR - 2 * 30 - 2 * 24

  const fitted = await sharp(photo)
    .rotate()
    .resize({ width: boxW, height: boxH, fit: 'inside', kernel: 'lanczos3', withoutEnlargement: false })
    .sharpen({ sigma: 0.7 })
    .jpeg({ quality: 92 })
    .toBuffer({ resolveWithObject: true })
  const src = `data:image/jpeg;base64,${fitted.data.toString('base64')}`

  const meta = [info.conditionLabel, info.location].filter(Boolean).join('  ·  ')

  return render(
    h(
      'div',
      { style: { width: W, height: H, display: 'flex', flexDirection: 'column', background: C.paper, fontFamily: 'Inter' } },
      // photo
      h(
        'div',
        { style: { flex: 1, display: 'flex', padding: '30px 36px' } },
        h(
          'div',
          {
            style: {
              flex: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: '#ffffff',
              borderRadius: 28,
              border: `2px solid ${C.line}`,
              boxShadow: '0 10px 30px rgba(10,31,51,0.08)',
            },
          },
          h('img', { src, width: fitted.info.width, height: fitted.info.height, style: { borderRadius: 14 } }),
        ),
      ),
      // brand bar
      h(
        'div',
        {
          style: {
            height: BAR,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0 44px',
            backgroundImage: `linear-gradient(120deg, ${C.deep} 0%, ${C.accent} 70%, ${C.sky} 100%)`,
            borderTop: `5px solid ${C.amber}`,
          },
        },
        brandMark(logo, 70, true),
        h(
          'div',
          { style: { display: 'flex', flexDirection: 'column', alignItems: 'flex-end', maxWidth: 700 } },
          h('div', { style: { fontFamily: 'Sora', fontWeight: 700, fontSize: 34, color: '#ffffff', letterSpacing: -0.5 } }, cut(shortName(info), 34)),
          h('div', { style: { fontSize: 22, fontWeight: 600, color: C.skySoft, marginTop: 6 } }, cut(meta ? `${meta}  ·  marineyard.com` : 'marineyard.com', 58)),
        ),
      ),
    ),
  )
}

/* ── spec card ────────────────────────────────────────────────────── */

const SKIP_HIGHLIGHT = /^(make|maker|manufacturer|model|maker and model|item|part|quantity|location|condition|stock status|type|turbocharger type|engine|matching engine)$/i

/** "Label: value" bullets from the description's specification block, minus what the grid already shows. */
export function specHighlights(description: string | null | undefined, max = 4): { label: string; value: string }[] {
  const out: { label: string; value: string }[] = []
  for (const raw of String(description || '').split('\n')) {
    if (!/^\s*[•\-*]\s/.test(raw)) continue // bullet lines only
    const line = raw.replace(/^\s*[•\-*]\s*/, '').trim()
    const m = line.match(/^([^:]{2,32}):\s*(.{1,40})$/)
    if (!m || SKIP_HIGHLIGHT.test(m[1])) continue
    out.push({ label: m[1].trim(), value: m[2].trim() })
    if (out.length >= max) break
  }
  return out
}

export async function specCard(info: ListingImageInfo): Promise<Buffer> {
  const logo = await loadLogo()
  const rows: [string, string | null | undefined][] = [
    ['Maker', info.brand && !/^(assorted|various|mixed)$/i.test(info.brand.trim()) ? info.brand : null],
    ['Model', info.model],
    ['Part number', info.part_number],
    ['Condition', info.conditionLabel],
    ['Quantity', info.quantity ? `${info.quantity} ${info.quantity === 1 ? 'unit' : 'units'}` : null],
    ['Location', info.location],
  ]
  const facts = rows.filter(([, v]) => v && String(v).trim()).slice(0, 6)
  const highlights = specHighlights(info.description, 4)
  const titleSize = info.title.length > 70 ? 50 : info.title.length > 48 ? 54 : 60

  const cell = (label: string, value: string, wide: boolean) =>
    h(
      'div',
      {
        style: {
          display: 'flex',
          flexDirection: 'column',
          width: wide ? 1048 : 340,
          padding: '16px 20px',
          borderRadius: 16,
          background: '#ffffff',
          border: `1.5px solid ${C.line}`,
        },
      },
      h('div', { style: { fontSize: 16, fontWeight: 700, color: C.muted, letterSpacing: 1.6, textTransform: 'uppercase' } }, label),
      h('div', { style: { fontSize: wide ? 24 : 26, fontWeight: 700, color: C.navy, marginTop: 6, lineHeight: 1.3 } }, cut(value, wide ? 150 : 20)),
    )

  return render(
    h(
      'div',
      {
        style: {
          width: W,
          height: H,
          display: 'flex',
          flexDirection: 'column',
          fontFamily: 'Inter',
          backgroundImage: `linear-gradient(135deg, ${C.deep} 0%, #0a4d85 55%, ${C.sky} 100%)`,
          padding: '44px 56px 40px',
        },
      },
      // header
      h(
        'div',
        { style: { display: 'flex', alignItems: 'center', justifyContent: 'space-between' } },
        brandMark(logo, 64, true),
        info.categoryName
          ? h(
              'div',
              {
                style: {
                  display: 'flex',
                  padding: '10px 22px',
                  borderRadius: 999,
                  background: 'rgba(255,255,255,0.12)',
                  border: '1.5px solid rgba(191,227,247,0.35)',
                  color: '#ffffff',
                  fontSize: 21,
                  fontWeight: 600,
                },
              },
              cut(info.categoryName, 40),
            )
          : null,
      ),
      // title, facts and highlights, centred in the space between header and footer
      h(
        'div',
        { style: { flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' } },
      h(
        'div',
        { style: { display: 'flex', fontFamily: 'Sora', fontWeight: 800, fontSize: titleSize, lineHeight: 1.12, color: '#ffffff', letterSpacing: -1 } },
        cut(info.title, 96),
      ),
      // spec grid
      h(
        'div',
        {
          style: {
            display: 'flex',
            flexWrap: 'wrap',
            gap: 14,
            marginTop: 30,
            padding: 20,
            borderRadius: 24,
            background: 'rgba(243,247,251,0.97)',
          },
        },
        ...facts.map(([label, value]) => cell(label, String(value), label === 'Part number' && String(value).length > 20)),
      ),
      // highlights
      highlights.length
        ? h(
            'div',
            { style: { display: 'flex', flexWrap: 'wrap', gap: 12, marginTop: 22 } },
            ...highlights.map((x) =>
              h(
                'div',
                {
                  style: {
                    display: 'flex',
                    alignItems: 'center',
                    gap: 10,
                    padding: '10px 18px',
                    borderRadius: 14,
                    background: 'rgba(255,255,255,0.10)',
                    border: '1.5px solid rgba(191,227,247,0.30)',
                    fontSize: 21,
                  },
                },
                h('div', { style: { color: C.skySoft, fontWeight: 600 } }, `${cut(x.label, 26)}:`),
                h('div', { style: { color: '#ffffff', fontWeight: 700 } }, cut(x.value, 28)),
              ),
            ),
          )
        : null,
      ),
      // footer
      h(
        'div',
        { style: { display: 'flex', flexDirection: 'column' } },
        wave(W - 112, C.amber),
        h(
          'div',
          { style: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 14 } },
          h('div', { style: { fontFamily: 'Sora', fontWeight: 800, fontSize: 34, color: C.amberSoft } }, cut(info.priceLabel || 'Price on request', 30)),
          h('div', { style: { fontSize: 24, fontWeight: 600, color: '#ffffff' } }, 'Contact the seller on marineyard.com'),
        ),
      ),
    ),
  )
}
