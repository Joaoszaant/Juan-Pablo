import { EVENT } from '../../config/event'
import { DecoDivider } from '../ui/Ornaments'
import { Monogram, NAV_LINKS } from './Navbar'

export function Footer() {
  return (
    <footer className="velvet relative border-t border-gold-500/40 pt-16 pb-24 text-center lg:pb-12">
      <div aria-hidden="true" className="absolute inset-0 bg-ink/80" />
      <div className="relative mx-auto max-w-5xl px-5">
        <Monogram className="mx-auto h-14 w-14" />
        <p className="text-gold mt-5 font-display text-3xl uppercase">{EVENT.showName}</p>
        <p className="mt-1 text-xs tracking-[0.45em] text-cream/60 uppercase">com {EVENT.host}</p>
        <DecoDivider className="mt-8" />
        <nav aria-label="Rodapé" className="mt-8">
          <ul className="flex flex-wrap justify-center gap-x-6 gap-y-2">
            {NAV_LINKS.map((l) => (
              <li key={l.id}>
                <a href={`#${l.id}`} className="text-xs tracking-[0.25em] text-cream/65 uppercase hover:text-gold-200">{l.label}</a>
              </li>
            ))}
          </ul>
        </nav>
        <p className="mx-auto mt-10 max-w-2xl text-xs leading-relaxed text-cream/50">
          Este site é uma simulação. Os ingressos gerados são fictícios, não representam compra real e nenhum pagamento é
          solicitado ou processado. Os artistas citados são referências para homenagens e interpretações, não participações
          confirmadas.
          {EVENT.showNameIsProvisional && ' Título do espetáculo provisório.'}
        </p>
        <p className="mt-6 text-[0.65rem] tracking-[0.3em] text-cream/35 uppercase">© {new Date().getFullYear()} {EVENT.showName}</p>
      </div>
    </footer>
  )
}
