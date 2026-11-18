import Link from 'next/link'
import { Anchor } from 'lucide-react'
import { DEFAULT_AUTHOR_NAME, DEFAULT_AUTHOR_ROLE } from '@/lib/content-helpers'

interface AuthorBlockProps {
  updatedAt?: string
  name?: string
  role?: string
}

export default function AuthorBlock({
  updatedAt,
  name = DEFAULT_AUTHOR_NAME,
  role = DEFAULT_AUTHOR_ROLE,
}: AuthorBlockProps = {}) {
  return (
    <div
      className="flex items-center gap-3 my-6 px-4 py-3 rounded-xl"
      style={{ background: 'var(--accent-bg)', border: '1px solid var(--border-hover)' }}
    >
      <div
        className="flex-shrink-0 rounded-full flex items-center justify-center"
        style={{
          width: 56,
          height: 56,
          background: 'var(--bg-card)',
          border: '2px solid var(--border-hover)',
          color: 'var(--accent)',
        }}
        aria-hidden
      >
        <Anchor className="w-7 h-7" />
      </div>
      <div className="flex-1 min-w-0">
        <Link href="/about" className="font-semibold text-sm leading-tight hover:underline" style={{ color: 'var(--text-primary)' }}>
          {name}
        </Link>
        <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
          {role}
        </p>
      </div>
      {updatedAt && (
        <div className="text-right flex-shrink-0">
          <p className="text-xs" style={{ color: 'var(--text-faint)' }}>Updated</p>
          <p className="text-xs font-medium" style={{ color: 'var(--text-muted)' }}>{updatedAt}</p>
        </div>
      )}
    </div>
  )
}
