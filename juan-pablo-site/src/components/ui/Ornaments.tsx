import type { ReactNode } from 'react'

/** Divisor art déco com losango central. */
export function DecoDivider({ className = '' }: { className?: string }) {
  return (
    <div className={`flex items-center justify-center gap-3 ${className}`} aria-hidden="true">
      <span className="gold-rule w-16 sm:w-28" />
      <svg width="46" height="14" viewBox="0 0 46 14" fill="none">
        <path d="M0 7h14M32 7h14" stroke="#d6ac57" strokeWidth="1" />
        <path d="M23 1l6 6-6 6-6-6 6-6z" stroke="#e8c878" strokeWidth="1" />
        <path d="M23 4.5l2.5 2.5-2.5 2.5L20.5 7 23 4.5z" fill="#e8c878" />
        <circle cx="15.5" cy="7" r="1.2" fill="#d6ac57" />
        <circle cx="30.5" cy="7" r="1.2" fill="#d6ac57" />
      </svg>
      <span className="gold-rule w-16 sm:w-28" />
    </div>
  )
}

/** Cantos art déco para molduras douradas. */
export function DecoCorners({ size = 26, color = '#d6ac57', inset = 6 }: { size?: number; color?: string; inset?: number }) {
  const corner = (
    <svg width={size} height={size} viewBox="0 0 26 26" fill="none">
      <path d="M1 25V1h24" stroke={color} strokeWidth="1.2" />
      <path d="M5 25V5h20" stroke={color} strokeWidth="0.8" opacity="0.7" />
      <path d="M1 1l6 6" stroke={color} strokeWidth="1" />
      <circle cx="9" cy="9" r="1.6" fill={color} />
    </svg>
  )
  const pos = { top: inset, left: inset, right: inset, bottom: inset }
  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0">
      <span className="absolute" style={{ top: pos.top, left: pos.left }}>{corner}</span>
      <span className="absolute rotate-90" style={{ top: pos.top, right: pos.right }}>{corner}</span>
      <span className="absolute rotate-180" style={{ bottom: pos.bottom, right: pos.right }}>{corner}</span>
      <span className="absolute -rotate-90" style={{ bottom: pos.bottom, left: pos.left }}>{corner}</span>
    </div>
  )
}

/** Raios de sol art déco (fundo de medalhões). */
export function Sunburst({ className = '', rays = 36, color = '#d6ac57' }: { className?: string; rays?: number; color?: string }) {
  return (
    <svg viewBox="-100 -100 200 200" className={className} aria-hidden="true">
      {Array.from({ length: rays }, (_, i) => (
        <path
          key={i}
          d="M0 0 L-3 -100 L3 -100 Z"
          fill={color}
          opacity={i % 2 ? 0.35 : 0.7}
          transform={`rotate(${(360 / rays) * i})`}
        />
      ))}
    </svg>
  )
}

export function SectionHeading({
  eyebrow,
  title,
  children,
  tone = 'dark',
  id,
}: {
  eyebrow: string
  title: ReactNode
  children?: ReactNode
  tone?: 'dark' | 'light'
  id?: string
}) {
  return (
    <header className="mx-auto max-w-3xl text-center">
      <p className={`eyebrow ${tone === 'light' ? '!text-crimson' : ''}`}>{eyebrow}</p>
      <h2
        id={id}
        className={`mt-4 font-serif text-4xl leading-[1.05] font-bold sm:text-5xl md:text-6xl ${
          tone === 'light' ? 'text-velvet-900' : 'text-gold'
        }`}
      >
        {title}
      </h2>
      <DecoDivider className="mt-6" />
      {children && (
        <div className={`mt-6 font-editorial text-xl leading-relaxed sm:text-2xl ${tone === 'light' ? 'text-sepia' : 'text-cream/80'}`}>
          {children}
        </div>
      )}
    </header>
  )
}
