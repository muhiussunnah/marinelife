import { CheckCircle2 } from 'lucide-react'

/**
 * Renders a listing's plain-text description as structured content:
 *   - blocks are separated by blank lines
 *   - a short single line without a full stop ("Specifications",
 *     "Before you buy") becomes an <h3>
 *   - lines starting with "•", "-" or "*" become a list; "Label: value"
 *     bullets get the label in bold
 *   - anything else is a paragraph
 * Plain text in, plain text out: nothing the seller typed is treated as HTML.
 */
type Block = { kind: 'h'; text: string } | { kind: 'p'; text: string } | { kind: 'ul'; items: string[] }

const BULLET = /^\s*[•\-*]\s+/

export function parseDescription(text: string): Block[] {
  const blocks: Block[] = []
  for (const chunk of String(text || '').replace(/\r\n/g, '\n').split(/\n\s*\n/)) {
    const lines = chunk.split('\n').map((l) => l.trimEnd()).filter((l) => l.trim())
    if (!lines.length) continue
    if (lines.length === 1 && !BULLET.test(lines[0]) && lines[0].length <= 60 && !/[.!?:]$/.test(lines[0].trim())) {
      blocks.push({ kind: 'h', text: lines[0].trim() })
      continue
    }
    let para: string[] = []
    let list: string[] = []
    const flushPara = () => {
      if (para.length) blocks.push({ kind: 'p', text: para.join(' ') })
      para = []
    }
    const flushList = () => {
      if (list.length) blocks.push({ kind: 'ul', items: list })
      list = []
    }
    for (const line of lines) {
      if (BULLET.test(line)) {
        flushPara()
        list.push(line.replace(BULLET, '').trim())
      } else {
        flushList()
        para.push(line.trim())
      }
    }
    flushPara()
    flushList()
  }
  return blocks
}

function Item({ text }: { text: string }) {
  const m = text.match(/^([^:]{2,40}):\s+(.+)$/)
  return m ? (
    <>
      <strong className="font-semibold">{m[1]}:</strong> {m[2]}
    </>
  ) : (
    <>{text}</>
  )
}

export default function ListingDescription({ text }: { text: string }) {
  const blocks = parseDescription(text)
  return (
    <div className="space-y-4 text-[15px] leading-relaxed break-words" style={{ color: 'var(--text-primary)' }}>
      {blocks.map((b, i) =>
        b.kind === 'h' ? (
          <h3 key={i} className="font-playfair text-lg font-bold pt-2" style={{ color: 'var(--text-primary)' }}>
            {b.text}
          </h3>
        ) : b.kind === 'ul' ? (
          <ul key={i} className="space-y-2">
            {b.items.map((it, k) => (
              <li key={k} className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 mt-1 flex-shrink-0" style={{ color: 'var(--accent)' }} />
                <span>
                  <Item text={it} />
                </span>
              </li>
            ))}
          </ul>
        ) : (
          <p key={i}>{b.text}</p>
        ),
      )}
    </div>
  )
}
