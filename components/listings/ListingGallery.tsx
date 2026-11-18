'use client'
import { useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import CategoryIcon from './CategoryIcon'

export default function ListingGallery({ images, title, category }: { images: string[]; title: string; category: string }) {
  const [i, setI] = useState(0)
  const n = images.length
  if (!n) {
    return (
      <div className="aspect-[4/3] rounded-3xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg,#0b2a4a,#0b6aa8)' }}>
        <CategoryIcon slug={category} className="w-20 h-20" style={{ color: '#bfe3f7' }} />
      </div>
    )
  }
  const go = (d: number) => setI((v) => (v + d + n) % n)
  return (
    <div>
      <div className="relative aspect-[4/3] rounded-3xl overflow-hidden" style={{ background: '#0a1f33' }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={images[i]} alt={`${title} — photo ${i + 1}`} className="absolute inset-0 w-full h-full object-contain" />
        {n > 1 && (
          <>
            <button type="button" onClick={() => go(-1)} aria-label="Previous photo" className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full flex items-center justify-center bg-black/45 text-white hover:bg-black/65">
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button type="button" onClick={() => go(1)} aria-label="Next photo" className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full flex items-center justify-center bg-black/45 text-white hover:bg-black/65">
              <ChevronRight className="w-5 h-5" />
            </button>
            <span className="absolute bottom-3 right-3 px-2 py-0.5 rounded-md text-xs bg-black/55 text-white">
              {i + 1} / {n}
            </span>
          </>
        )}
      </div>
      {n > 1 && (
        <div className="flex gap-2 mt-3 overflow-x-auto pb-1">
          {images.map((src, k) => (
            <button
              key={src + k}
              type="button"
              onClick={() => setI(k)}
              className="relative flex-shrink-0 w-20 h-16 rounded-xl overflow-hidden"
              style={{ outline: k === i ? '2px solid var(--accent)' : '1px solid var(--border)', outlineOffset: k === i ? 2 : 0 }}
              aria-label={`Show photo ${k + 1}`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={src} alt="" className="w-full h-full object-cover" loading="lazy" />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
