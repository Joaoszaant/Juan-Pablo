import { Menu, Ticket, X } from 'lucide-react'
import { useEffect, useState } from 'react'
import { EVENT } from '../../config/event'

export const NAV_LINKS = [
  { id: 'inicio', label: 'Início' },
  { id: 'espetaculo', label: 'O espetáculo' },
  { id: 'artistas', label: 'Artistas' },
  { id: 'juan-pablo', label: 'Juan Pablo' },
  { id: 'ingressos', label: 'Ingressos' },
  { id: 'consulta', label: 'Consultar ingresso' },
]

export function Monogram({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 48 48" className={className} aria-hidden="true">
      <path d="M24 2l22 22-22 22L2 24z" fill="none" stroke="#d6ac57" strokeWidth="1.2" />
      <path d="M24 6l18 18-18 18L6 24z" fill="#1c0910" stroke="#d6ac57" strokeWidth="0.6" opacity="0.9" />
      <text x="24" y="29.5" textAnchor="middle" fontFamily="Limelight, serif" fontSize="15" fill="#e8c878">JP</text>
    </svg>
  )
}

export function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen] = useState(false)
  const [active, setActive] = useState('inicio')

  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 40)
      const probe = window.innerHeight * 0.35
      let current = NAV_LINKS[0].id
      for (const { id } of NAV_LINKS) {
        const el = document.getElementById(id)
        if (el && el.getBoundingClientRect().top <= probe) current = id
      }
      setActive(current)
    }
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : ''
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false)
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open])

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-500 ${
        scrolled || open ? 'border-b border-gold-500/25 bg-velvet-950/90 backdrop-blur-md' : 'bg-transparent'
      }`}
    >
      <nav aria-label="Navegação principal" className="mx-auto flex h-18 max-w-7xl items-center justify-between px-5 lg:px-8">
        <a href="#inicio" className="group flex items-center gap-3" onClick={() => setOpen(false)}>
          <Monogram className="h-10 w-10 transition-transform duration-500 group-hover:rotate-45" />
          <span className="hidden leading-none sm:block">
            <span className="block font-display text-lg tracking-wider text-gold-200">{EVENT.showName}</span>
            <span className="mt-1 block text-[0.62rem] tracking-[0.4em] text-cream/60 uppercase">com {EVENT.host}</span>
          </span>
        </a>

        <ul className="hidden items-center gap-1 lg:flex">
          {NAV_LINKS.filter((l) => l.id !== 'ingressos').map((l) => (
            <li key={l.id}>
              <a
                href={`#${l.id}`}
                aria-current={active === l.id ? 'true' : undefined}
                className={`relative px-3 py-2 text-[0.72rem] font-semibold tracking-[0.2em] uppercase transition-colors ${
                  active === l.id ? 'text-gold-200' : 'text-cream/70 hover:text-gold-200'
                }`}
              >
                {l.label}
                <span
                  className={`absolute inset-x-3 -bottom-0.5 h-px origin-center bg-gold-300 transition-transform duration-300 ${
                    active === l.id ? 'scale-x-100' : 'scale-x-0'
                  }`}
                />
              </a>
            </li>
          ))}
          <li className="ml-3">
            <a href="#ingressos" className="btn btn-gold !px-5 !py-2.5 !text-[0.7rem]">
              <Ticket size={15} aria-hidden="true" /> Ingressos
            </a>
          </li>
        </ul>

        <button
          type="button"
          className="flex h-11 w-11 items-center justify-center border border-gold-500/40 text-gold-200 lg:hidden"
          aria-expanded={open}
          aria-controls="mobile-menu"
          aria-label={open ? 'Fechar menu' : 'Abrir menu'}
          onClick={() => setOpen((v) => !v)}
        >
          {open ? <X size={20} /> : <Menu size={20} />}
        </button>
      </nav>

      <div
        id="mobile-menu"
        className={`fixed inset-x-0 top-18 bottom-0 bg-velvet-950/98 transition-all duration-500 lg:hidden ${
          open ? 'visible opacity-100' : 'invisible opacity-0'
        }`}
      >
        <ul className="flex h-full flex-col items-center justify-center gap-2 pb-20">
          {NAV_LINKS.map((l, i) => (
            <li key={l.id} style={{ transitionDelay: open ? `${i * 50}ms` : '0ms' }} className={`transition-all duration-500 ${open ? 'translate-y-0 opacity-100' : 'translate-y-3 opacity-0'}`}>
              <a
                href={`#${l.id}`}
                onClick={() => setOpen(false)}
                className={`block px-6 py-3 text-center font-serif text-3xl ${active === l.id ? 'text-gold' : 'text-cream/85'}`}
              >
                {l.label}
              </a>
            </li>
          ))}
        </ul>
      </div>
    </header>
  )
}
