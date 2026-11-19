import { promises as fs } from 'node:fs'
import { resolveUploadPath, siteUrl } from '@/lib/db/storage'

/**
 * Pixel size of an image we host under /uploads/…, read from the file header
 * (PNG, JPEG, WebP, GIF) — no image library needed. Returns null for remote
 * images or anything it can't read.
 */
export async function uploadedImageSize(url: string | null | undefined): Promise<{ width: number; height: number } | null> {
  try {
    if (!url) return null
    const u = new URL(url, siteUrl())
    if (u.origin !== new URL(siteUrl()).origin || !u.pathname.startsWith('/uploads/')) return null
    const target = resolveUploadPath(decodeURIComponent(u.pathname.slice('/uploads/'.length)))
    if (!target) return null
    const fh = await fs.open(target.full, 'r')
    try {
      const buf = Buffer.alloc(64 * 1024)
      const { bytesRead } = await fh.read(buf, 0, buf.length, 0)
      return parseSize(buf.subarray(0, bytesRead))
    } finally {
      await fh.close()
    }
  } catch {
    return null
  }
}

function parseSize(b: Buffer): { width: number; height: number } | null {
  if (b.length < 30) return null
  // PNG
  if (b.readUInt32BE(0) === 0x89504e47) return { width: b.readUInt32BE(16), height: b.readUInt32BE(20) }
  // GIF
  if (b.toString('ascii', 0, 3) === 'GIF') return { width: b.readUInt16LE(6), height: b.readUInt16LE(8) }
  // WebP
  if (b.toString('ascii', 0, 4) === 'RIFF' && b.toString('ascii', 8, 12) === 'WEBP') {
    const chunk = b.toString('ascii', 12, 16)
    if (chunk === 'VP8X') return { width: 1 + b.readUIntLE(24, 3), height: 1 + b.readUIntLE(27, 3) }
    if (chunk === 'VP8 ') return { width: b.readUInt16LE(26) & 0x3fff, height: b.readUInt16LE(28) & 0x3fff }
    if (chunk === 'VP8L') {
      const bits = b.readUInt32LE(21)
      return { width: 1 + (bits & 0x3fff), height: 1 + ((bits >> 14) & 0x3fff) }
    }
    return null
  }
  // JPEG: walk the markers to the first SOFn frame header
  if (b[0] === 0xff && b[1] === 0xd8) {
    let i = 2
    while (i + 9 < b.length) {
      if (b[i] !== 0xff) {
        i++
        continue
      }
      const marker = b[i + 1]
      const len = b.readUInt16BE(i + 2)
      if (marker >= 0xc0 && marker <= 0xcf && ![0xc4, 0xc8, 0xcc].includes(marker)) {
        return { height: b.readUInt16BE(i + 5), width: b.readUInt16BE(i + 7) }
      }
      i += 2 + len
    }
  }
  return null
}

/** alt text of the <img> in `html` whose src matches `src` (else the first <img> with an alt). */
export function imageAltFromHtml(html: string | null | undefined, src?: string | null): string | null {
  const tags = String(html || '').match(/<img\b[^>]*>/gi) || []
  const attr = (tag: string, name: string) => {
    const m = tag.match(new RegExp(`\\s${name}\\s*=\\s*(?:"([^"]*)"|'([^']*)')`, 'i'))
    return m ? (m[1] ?? m[2] ?? '').trim() : ''
  }
  const file = (s: string) => s.split('?')[0].split('/').pop() || ''
  if (src) {
    const want = file(src)
    const match = tags.find((t) => want && file(attr(t, 'src')) === want && attr(t, 'alt'))
    if (match) return attr(match, 'alt')
  }
  const first = tags.find((t) => attr(t, 'alt'))
  return first ? attr(first, 'alt') : null
}
