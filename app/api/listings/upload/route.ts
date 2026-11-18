import { NextRequest, NextResponse } from 'next/server'
import { randomBytes } from 'node:crypto'
import { getDb } from '@/lib/db'
import { getSessionUser } from '@/lib/session'
import { MAX_IMAGE_BYTES } from '@/lib/listings-meta'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

/** Detect the real image type from the file's first bytes (never trust the browser's MIME). */
function sniff(b: Uint8Array): { ext: string; type: string } | null {
  if (b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff) return { ext: 'jpg', type: 'image/jpeg' }
  if (b[0] === 0x89 && b[1] === 0x50 && b[2] === 0x4e && b[3] === 0x47) return { ext: 'png', type: 'image/png' }
  if (b[0] === 0x52 && b[1] === 0x49 && b[2] === 0x46 && b[3] === 0x46 && b[8] === 0x57 && b[9] === 0x45 && b[10] === 0x42 && b[11] === 0x50)
    return { ext: 'webp', type: 'image/webp' }
  return null
}

/** POST /api/listings/upload — multipart "file"; returns { url } under /uploads/listings/<userId>/. */
export async function POST(req: NextRequest) {
  const user = await getSessionUser()
  if (!user) return NextResponse.json({ error: 'Please sign in to upload photos.' }, { status: 401 })

  let file: File | null = null
  try {
    file = (await req.formData()).get('file') as File | null
  } catch {
    return NextResponse.json({ error: 'Invalid upload' }, { status: 400 })
  }
  if (!file || typeof file.arrayBuffer !== 'function') return NextResponse.json({ error: 'No file received' }, { status: 400 })
  if (file.size > MAX_IMAGE_BYTES) return NextResponse.json({ error: 'Photo too large — maximum 6 MB.' }, { status: 400 })

  const bytes = new Uint8Array(await file.arrayBuffer())
  const kind = sniff(bytes)
  if (!kind) return NextResponse.json({ error: 'Please upload a JPG, PNG or WebP photo.' }, { status: 400 })

  const name = `${user.id}/${Date.now().toString(36)}-${randomBytes(5).toString('hex')}.${kind.ext}`
  const db = getDb()
  const { error } = await db.storage.from('listings').upload(name, bytes, { contentType: kind.type })
  if (error) {
    console.error('[listings] upload failed:', error.message)
    return NextResponse.json({ error: 'Upload failed. Please try again.' }, { status: 500 })
  }
  // Store a site-relative URL so listings survive a domain change.
  return NextResponse.json({ url: `/uploads/listings/${name}` })
}
