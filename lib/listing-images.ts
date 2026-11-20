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

/* ── seller photo on a branded frame, with a logo watermark ──────── */
//
// Satori/resvg run on the main thread, so they only draw what is shared: the
// frame + caption bar (once per listing caption) and the watermark (once per
// process). Each photo is then resized and composited by sharp, which works
// on libuv's thread pool and doesn't hold up other requests.

/** Small photos (collage tiles) are enlarged at most this much, so they stay reasonably sharp. */
const MAX_UPSCALE = 4.5
const BAR = 150
/** the white box the photo sits in */
const BOX = { x: 36, y: 30, w: W - 72, h: H - BAR - 60 }
const PHOTO_MAX = { w: BOX.w - 56, h: BOX.h - 48 }

async function renderPng(el: El, width = W, height = H): Promise<Buffer> {
  const res = new ImageResponse(el as any, { width, height, fonts: (await loadFonts()) as any })
  return Buffer.from(await res.arrayBuffer())
}

const frameCache = new Map<string, Promise<Buffer>>()

/** 1200×900 PNG: light page, empty white photo box, navy caption bar. */
function frameFor(info: ListingImageInfo): Promise<Buffer> {
  const name = cut(shortName(info), 34)
  const meta = [info.conditionLabel, info.location].filter(Boolean).join('  ·  ')
  const line = cut(meta ? `${meta}  ·  marineyard.com` : 'marineyard.com', 58)
  const key = `${name}\n${line}`
  let p = frameCache.get(key)
  if (!p) {
    if (frameCache.size > 40) frameCache.clear()
    p = (async () => {
      const logo = await loadLogo()
      return renderPng(
        h(
          'div',
          { style: { width: W, height: H, display: 'flex', flexDirection: 'column', background: C.paper, fontFamily: 'Inter' } },
          h(
            'div',
            { style: { flex: 1, display: 'flex', padding: `${BOX.y}px ${BOX.x}px` } },
            h('div', {
              style: {
                flex: 1,
                display: 'flex',
                background: '#ffffff',
                borderRadius: 28,
                border: `2px solid ${C.line}`,
                boxShadow: '0 10px 30px rgba(10,31,51,0.08)',
              },
            }),
          ),
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
              h('div', { style: { fontFamily: 'Sora', fontWeight: 700, fontSize: 34, color: '#ffffff', letterSpacing: -0.5 } }, name),
              h('div', { style: { fontSize: 22, fontWeight: 600, color: C.skySoft, marginTop: 6 } }, line),
            ),
          ),
        ),
      )
    })().catch((e) => {
      frameCache.delete(key)
      throw e
    })
    frameCache.set(key, p)
  }
  return p
}

let watermarkCache: Promise<Buffer> | null = null

/** Transparent PNG of the centred watermark: logo + "MarineYard" over "marineyard.com", already faded. */
function watermarkPng(): Promise<Buffer> {
  if (!watermarkCache) {
    watermarkCache = (async () => {
      const logo = await loadLogo()
      const size = 200
      const png = await renderPng(
        h(
          'div',
          { style: { width: 1000, height: 380, display: 'flex', alignItems: 'center', justifyContent: 'center' } },
          h(
            'div',
            { style: { display: 'flex', flexDirection: 'column', alignItems: 'center', opacity: 0.22 } },
            h(
              'div',
              { style: { display: 'flex', alignItems: 'center', gap: Math.round(size * 0.25) } },
              h('img', { src: logo, width: size, height: size, style: { borderRadius: Math.round(size * 0.24) } }),
              h(
                'div',
                { style: { display: 'flex', fontFamily: 'Sora', fontWeight: 800, fontSize: Math.round(size * 0.62), color: '#ffffff', textShadow: '0 2px 8px rgba(6,26,46,0.45)', letterSpacing: -2 } },
                'MarineYard',
              ),
            ),
            h(
              'div',
              { style: { display: 'flex', marginTop: Math.round(size * 0.08), fontSize: Math.round(size * 0.5), fontWeight: 700, color: '#ffffff', textShadow: '0 2px 6px rgba(6,26,46,0.45)', letterSpacing: 3 } },
              'marineyard.com',
            ),
          ),
        ),
        1000,
        380,
      )
      return sharp(png).trim().png().toBuffer()
    })().catch((e) => {
      watermarkCache = null
      throw e
    })
  }
  return watermarkCache
}

export async function brandedPhoto(photo: Buffer, info: ListingImageInfo): Promise<Buffer> {
  const [frame, wm] = await Promise.all([frameFor(info), watermarkPng()])

  // transparent PNGs go on white, not black
  const flat = await sharp(photo).rotate().flatten({ background: '#ffffff' }).png().toBuffer({ resolveWithObject: true })
  const scale = Math.min(PHOTO_MAX.w / flat.info.width, PHOTO_MAX.h / flat.info.height, MAX_UPSCALE)
  const pw = Math.max(1, Math.round(flat.info.width * scale))
  const ph = Math.max(1, Math.round(flat.info.height * scale))

  // watermark: about 90% of the photo's short side wide, never wider than 80% of the photo
  const wmMeta = await sharp(wm).metadata()
  let wmW = Math.max(40, Math.round(Math.min(pw * 0.8, Math.min(pw, ph) * 0.9)))
  if (wmMeta.width && wmMeta.height && (wmW * wmMeta.height) / wmMeta.width > ph * 0.8) wmW = Math.round((ph * 0.8 * wmMeta.width) / wmMeta.height)
  const wmScaled = await sharp(wm).resize({ width: wmW }).png().toBuffer()

  const rounded = Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${pw}" height="${ph}"><rect width="${pw}" height="${ph}" rx="14" ry="14" fill="#fff"/></svg>`)
  const shot = await sharp(flat.data)
    .resize({ width: pw, height: ph, fit: 'fill', kernel: 'lanczos3' })
    .sharpen({ sigma: scale > 1.5 ? 0.9 : 0.6 })
    .png()
    .toBuffer()
  const marked = await sharp(shot)
    .composite([{ input: wmScaled, gravity: 'center' }, { input: rounded, blend: 'dest-in' }])
    .png()
    .toBuffer()

  return sharp(frame)
    .composite([{ input: marked, left: Math.round(BOX.x + (BOX.w - pw) / 2), top: Math.round(BOX.y + (BOX.h - ph) / 2) }])
    .webp({ quality: 86, effort: 5 })
    .toBuffer()
}

/* ── collage → single photos ──────────────────────────────────────── */

type Rect = { x: number; y: number; w: number; h: number }

/**
 * Many sellers send one picture made of several photos separated by white
 * gutters. This finds those photos (cutting along full-width or full-height
 * white lines, recursively) and returns each one as its own JPEG, in reading
 * order. Returns [] when the image is not a collage.
 */
export async function splitCollage(input: Buffer, maxTiles = 16): Promise<Buffer[]> {
  const full = await sharp(input).rotate().flatten({ background: '#ffffff' }).png().toBuffer({ resolveWithObject: true })
  const FW = full.info.width
  const FH = full.info.height
  if (FW < 200 || FH < 150) return []
  // analyse a copy of at most 1200 px, cut the full-size image
  const k = Math.min(1, 1200 / Math.max(FW, FH))
  const { data, info } = await sharp(full.data)
    .resize({ width: Math.max(1, Math.round(FW * k)), height: Math.max(1, Math.round(FH * k)), fit: 'fill' })
    .removeAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true })
  const AW = info.width
  const AH = info.height
  const ch = info.channels
  const light = new Uint8Array(AW * AH)
  for (let i = 0, p = 0; i < AW * AH; i++, p += ch) light[i] = data[p] > 232 && data[p + 1] > 232 && data[p + 2] > 232 ? 1 : 0

  const gutterRow = (r: Rect, y: number) => {
    let n = 0
    for (let x = r.x; x < r.x + r.w; x++) n += light[y * AW + x]
    return n >= r.w * 0.985
  }
  const gutterCol = (r: Rect, x: number) => {
    let n = 0
    for (let y = r.y; y < r.y + r.h; y++) n += light[y * AW + x]
    return n >= r.h * 0.985
  }
  // runs of content between gutter lines along one axis
  const segments = (r: Rect, rows: boolean): Rect[] => {
    const len = rows ? r.h : r.w
    const out: Rect[] = []
    let start = -1
    for (let i = 0; i <= len; i++) {
      const gutter = i === len || (rows ? gutterRow(r, r.y + i) : gutterCol(r, r.x + i))
      if (!gutter && start < 0) start = i
      if (gutter && start >= 0) {
        if (i - start >= 12) out.push(rows ? { x: r.x, y: r.y + start, w: r.w, h: i - start } : { x: r.x + start, y: r.y, w: i - start, h: r.h })
        start = -1
      }
    }
    return out
  }
  const leaves: Rect[] = []
  const walk = (r: Rect, depth: number) => {
    if (leaves.length > maxTiles * 2) return
    if (depth < 6) {
      for (const rows of [true, false]) {
        const segs = segments(r, rows)
        if (segs.length >= 2) {
          segs.forEach((s) => walk(s, depth + 1))
          return
        }
        // one run smaller than r only trims white margins: keep looking inside it
        if (segs.length === 1 && (segs[0].w < r.w - 2 || segs[0].h < r.h - 2)) {
          walk(segs[0], depth + 1)
          return
        }
      }
    }
    leaves.push(r)
  }
  walk({ x: 0, y: 0, w: AW, h: AH }, 0)

  const minSide = Math.max(40, Math.min(AW, AH) * 0.12)
  const tiles = leaves.filter((r) => r.w >= minSide && r.h >= minSide && r.w * r.h >= AW * AH * 0.015)
  if (tiles.length < 2 || tiles.length > maxTiles) return []
  // a real collage is mostly photos with thin gutters
  const covered = tiles.reduce((a, r) => a + r.w * r.h, 0)
  if (covered < AW * AH * 0.55) return []

  const out: Buffer[] = []
  for (const r of tiles) {
    const left = Math.max(0, Math.floor(r.x / k))
    const top = Math.max(0, Math.floor(r.y / k))
    const width = Math.max(1, Math.min(FW - left, Math.ceil(r.w / k)))
    const height = Math.max(1, Math.min(FH - top, Math.ceil(r.h / k)))
    out.push(await sharp(full.data).extract({ left, top, width, height }).jpeg({ quality: 94 }).toBuffer())
  }
  return out
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
