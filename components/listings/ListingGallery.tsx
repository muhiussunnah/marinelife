'use client'
import { useRef, useState } from 'react'
import { ChevronLeft, ChevronRight, ZoomIn, Camera } from 'lucide-react'
import CategoryIcon from './CategoryIcon'

/**
 * Product gallery: one large image with hover-to-zoom (the image is scaled
 * 2.5x around the cursor, like most e-commerce stores), arrows, and a row of
 * thumbnails below that switch the main image. On touch screens a tap opens
 * the full-size photo.
 */
export default function ListingGallery({ images, title, category }: { images: string[]; title: string; category: string }) {
  const [i, setI] = useState(0)
  const [zoom, setZoom] = useState<{ x: number; y: number } | null>(null)
  const [scale, setScale] = useState(2.5)
  const frame = useRef<HTMLDivElement>(null)
  const n = images.length
  // Branded spec sheets are stored as "...-spec-<id>.webp"; everything else is a photo.
  const isSpec = (src: string) => /-spec-[0-9a-f]+\.webp$/.test(src)
  const altFor = (src: string, k: number) =>
    isSpec(src) ? `${title} – specification sheet` : `${title} – photo ${k + 1}${n > 1 ? ` of ${n}` : ''}`

  if (!n) {
    return (
      <div
        className="relative aspect-[4/3] rounded-3xl flex flex-col items-center justify-center gap-4 overflow-hidden"
        style={{ background: 'radial-gradient(120% 90% at 70% 10%, #11528a 0%, #0a2f52 50%, #061a2e 100%)' }}
      >
        <div className="w-24 h-24 rounded-3xl flex items-center justify-center" style={{ background: 'rgba(124,200,240,0.12)', border: '1px solid rgba(124,200,240,0.25)' }}>
          <CategoryIcon slug={category} className="w-12 h-12" style={{ color: '#bfe3f7' }} />
        </div>
        <p className="inline-flex items-center gap-2 text-sm font-medium" style={{ color: '#bfe3f7' }}>
          <Camera className="w-4 h-4" /> Photos available from the seller on request
        </p>
      </div>
    )
  }

  const go = (d: number) => {
    setZoom(null)
    setI((v) => (v + d + n) % n)
  }

  const onMove = (e: React.MouseEvent) => {
    const r = frame.current?.getBoundingClientRect()
    if (!r) return
    setZoom({
      x: Math.min(100, Math.max(0, ((e.clientX - r.left) / r.width) * 100)),
      y: Math.min(100, Math.max(0, ((e.clientY - r.top) / r.height) * 100)),
    })
  }

  return (
    <div>
      <div
        ref={frame}
        className="group relative aspect-[4/3] rounded-3xl overflow-hidden select-none"
        style={{ background: '#ffffff', border: '1px solid var(--border)', cursor: zoom ? 'zoom-in' : 'default' }}
        onMouseMove={onMove}
        onMouseLeave={() => setZoom(null)}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={images[i]}
          alt={altFor(images[i], i)}
          className="absolute inset-0 w-full h-full object-contain transition-transform duration-150 ease-out"
          style={
            zoom
              ? { transform: `scale(${scale})`, transformOrigin: `${zoom.x}% ${zoom.y}%` }
              : { transform: 'scale(1)', transformOrigin: 'center' }
          }
          draggable={false}
          onLoad={(e) => {
            // Zoom further on sharp, large photos and less on small ones, so the zoomed view stays crisp.
            const w = frame.current?.clientWidth || 800
            const natural = e.currentTarget.naturalWidth || w
            setScale(Math.min(2.5, Math.max(1.6, (natural / w) * 1.8)))
          }}
          onClick={() => {
            // Touch screens have no hover: open the full-size photo instead.
            if (window.matchMedia('(hover: none)').matches) window.open(images[i], '_blank', 'noopener')
          }}
        />
        {!zoom && (
          <span className="absolute top-3 right-3 hidden md:inline-flex items-center gap-1 px-2 py-1 rounded-md text-[11px] font-medium bg-black/55 text-white">
            <ZoomIn className="w-3.5 h-3.5" /> Hover to zoom
          </span>
        )}
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
        <div className="grid grid-cols-5 sm:grid-cols-6 gap-2 mt-3">
          {images.map((src, k) => (
            <button
              key={src + k}
              type="button"
              onClick={() => {
                setZoom(null)
                setI(k)
              }}
              onMouseEnter={() => setI(k)}
              className="relative aspect-square rounded-xl overflow-hidden bg-white transition"
              style={{
                outline: k === i ? '2px solid var(--accent)' : '1px solid var(--border)',
                outlineOffset: k === i ? 2 : 0,
                opacity: k === i ? 1 : 0.75,
              }}
              aria-label={`Show photo ${k + 1}`}
              aria-current={k === i}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={src} alt="" className={`w-full h-full ${isSpec(src) ? 'object-cover object-left-top' : 'object-cover'}`} loading="lazy" />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
