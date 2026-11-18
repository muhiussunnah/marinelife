/**
 * Homepage hero artwork: a cargo ship on a night sea with radar rings and
 * floating part-category tags. Pure SVG + CSS (no images to download).
 */
export default function HeroIllustration() {
  const tags = [
    { label: 'Turbochargers', x: '6%', y: '14%', d: '0s' },
    { label: 'Main engine spares', x: '52%', y: '7%', d: '1.2s' },
    { label: 'Radar & ECDIS', x: '62%', y: '30%', d: '2.1s' },
    { label: 'Purifiers', x: '10%', y: '38%', d: '0.6s' },
    { label: 'Deck cranes', x: '40%', y: '46%', d: '1.7s' },
  ]
  return (
    <div
      className="relative w-full aspect-[5/4] rounded-[2rem] overflow-hidden shadow-2xl"
      style={{ background: 'radial-gradient(120% 90% at 70% 10%, #11528a 0%, #0a2f52 45%, #061a2e 100%)' }}
      aria-hidden="true"
    >
      {/* stars / grid */}
      <svg className="absolute inset-0 w-full h-full opacity-[0.18]" viewBox="0 0 500 400" preserveAspectRatio="none">
        <defs>
          <pattern id="my-grid" width="25" height="25" patternUnits="userSpaceOnUse">
            <path d="M25 0H0V25" fill="none" stroke="#7cc8f0" strokeWidth="0.5" />
          </pattern>
        </defs>
        <rect width="500" height="400" fill="url(#my-grid)" />
      </svg>

      {/* radar rings */}
      <div className="absolute" style={{ right: '14%', top: '18%' }}>
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            className="absolute rounded-full my-ping"
            style={{
              width: 160,
              height: 160,
              left: -80,
              top: -80,
              border: '1.5px solid rgba(124,200,240,0.55)',
              animationDelay: `${i * 1.1}s`,
            }}
          />
        ))}
        <span className="absolute w-3 h-3 -left-1.5 -top-1.5 rounded-full" style={{ background: '#f59e0b', boxShadow: '0 0 18px #f59e0b' }} />
      </div>

      {/* floating category tags */}
      {tags.map((t) => (
        <span
          key={t.label}
          className="absolute my-float px-3 py-1.5 rounded-full text-[11px] sm:text-xs font-semibold whitespace-nowrap backdrop-blur"
          style={{
            left: t.x,
            top: t.y,
            animationDelay: t.d,
            background: 'rgba(255,255,255,0.1)',
            border: '1px solid rgba(255,255,255,0.22)',
            color: '#eaf3fb',
          }}
        >
          {t.label}
        </span>
      ))}

      {/* ship + sea */}
      <svg className="absolute bottom-0 left-0 w-full" viewBox="0 0 500 220" preserveAspectRatio="xMidYMax meet">
        <defs>
          <linearGradient id="my-hull" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#0b2a4a" />
            <stop offset="1" stopColor="#04121f" />
          </linearGradient>
          <linearGradient id="my-sea" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#0b6aa8" stopOpacity="0.9" />
            <stop offset="1" stopColor="#062440" />
          </linearGradient>
        </defs>
        <g className="my-bob">
          {/* containers */}
          {[
            ['#f59e0b', 120], ['#0891b2', 150], ['#e2e8f0', 180], ['#ef4444', 210], ['#0891b2', 240],
            ['#f59e0b', 270], ['#e2e8f0', 300], ['#0b74c4', 330],
          ].map(([color, x], i) => (
            <rect key={i} x={x as number} y={i % 2 ? 96 : 106} width="28" height={i % 2 ? 34 : 24} rx="2" fill={color as string} opacity="0.92" />
          ))}
          {/* bridge */}
          <rect x="366" y="70" width="44" height="60" rx="3" fill="#e2e8f0" />
          <rect x="372" y="78" width="32" height="7" rx="1.5" fill="#0b2a4a" />
          <rect x="380" y="52" width="6" height="20" fill="#cbd5e1" />
          <rect x="392" y="58" width="12" height="14" rx="2" fill="#f59e0b" />
          {/* hull */}
          <path d="M70 128 H440 L418 170 H104 Z" fill="url(#my-hull)" />
          <path d="M70 128 H440 L436 136 H76 Z" fill="#ef4444" opacity="0.9" />
          <text x="150" y="156" fill="#7cc8f0" fontSize="11" fontWeight="700" letterSpacing="3" fontFamily="sans-serif">MARINEYARD</text>
        </g>
        <path className="my-wave" d="M0 168 Q 31 158 62 168 T 125 168 T 187 168 T 250 168 T 312 168 T 375 168 T 437 168 T 500 168 T 562 168 T 625 168 V220 H0Z" fill="url(#my-sea)" />
        <path className="my-wave-2" d="M0 182 Q 31 174 62 182 T 125 182 T 187 182 T 250 182 T 312 182 T 375 182 T 437 182 T 500 182 T 562 182 T 625 182 V220 H0Z" fill="#06213a" opacity="0.85" />
      </svg>

      <style>{`
        @keyframes my-ping { 0% { transform: scale(0.2); opacity: .9 } 100% { transform: scale(1.6); opacity: 0 } }
        .my-ping { animation: my-ping 3.3s ease-out infinite; }
        @keyframes my-float { 0%,100% { transform: translateY(0) } 50% { transform: translateY(-8px) } }
        .my-float { animation: my-float 5s ease-in-out infinite; }
        @keyframes my-bob { 0%,100% { transform: translateY(0) rotate(0deg) } 50% { transform: translateY(3px) rotate(-0.6deg) } }
        .my-bob { animation: my-bob 6s ease-in-out infinite; transform-origin: 250px 150px; }
        @keyframes my-wave { from { transform: translateX(0) } to { transform: translateX(-62px) } }
        .my-wave { animation: my-wave 7s linear infinite; }
        .my-wave-2 { animation: my-wave 5s linear infinite reverse; }
        @media (prefers-reduced-motion: reduce) { .my-ping, .my-float, .my-bob, .my-wave, .my-wave-2 { animation: none } }
      `}</style>
    </div>
  )
}
