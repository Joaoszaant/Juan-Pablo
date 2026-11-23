import { Info } from 'lucide-react'
import { ARTISTS } from '../config/artists'
import { DecoCorners, SectionHeading, Sunburst } from '../components/ui/Ornaments'
import { useReveal } from '../hooks/useReveal'

export function Artists() {
  const ref = useReveal<HTMLElement>()
  return (
    <section ref={ref} id="artistas" aria-labelledby="artists-title" className="relative overflow-hidden bg-velvet-950 py-24 sm:py-32">
      <div
        aria-hidden="true"
        className="absolute inset-0"
        style={{ background: 'radial-gradient(ellipse 60% 40% at 50% 0%, rgb(122 19 38 / .35), transparent 70%)' }}
      />
      <div className="relative mx-auto max-w-6xl px-5 lg:px-8">
        <div className="reveal">
          <SectionHeading id="artists-title" eyebrow="O universo da noite" title="Quem sobe ao palco?">
            Seis lendas da música, seis pistas. Descubra quem será homenageado, ou deixe para descobrir na noite do espetáculo.
          </SectionHeading>
        </div>

        <ul className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {ARTISTS.map((a, i) => (
            <li key={a.title} className="reveal" style={{ transitionDelay: `${(i % 3) * 110}ms` }}>
              <article
                tabIndex={0}
                aria-label={`Homenagem nº ${i + 1}: ${a.title}`}
                className="group relative h-full overflow-hidden border border-gold-500/40 bg-gradient-to-b from-velvet-800 to-velvet-950 px-7 pt-8 pb-7 text-center transition-all duration-500 hover:-translate-y-1.5 hover:border-gold-300/80 hover:shadow-[0_24px_60px_-28px_rgb(232_200_120/.45)] focus-visible:-translate-y-1.5"
              >
                <DecoCorners size={22} inset={8} />
                {/* Brilho que atravessa o card */}
                <span
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-y-0 -left-1/2 w-1/2 -skew-x-12 bg-gradient-to-r from-transparent via-gold-100/10 to-transparent transition-transform duration-1000 group-hover:translate-x-[300%]"
                />
                <p className="font-sans text-[0.65rem] tracking-[0.45em] text-gold-400/80 uppercase">
                  Nº {String(i + 1).padStart(2, '0')}
                </p>

                <div className="relative mx-auto mt-5 h-36 w-36">
                  <Sunburst className="absolute inset-0 h-full w-full transition-transform duration-[2500ms] ease-out group-hover:rotate-45" rays={40} />
                  <div className="absolute inset-[18%] flex items-center justify-center rounded-full border border-gold-300/70 bg-velvet-950 shadow-[inset_0_0_20px_rgb(0_0_0/.8)]">
                    <span className="text-gold font-display text-5xl" aria-hidden="true">?</span>
                  </div>
                </div>

                <h3 className="mt-6 font-serif text-2xl font-bold text-gold-100 sm:text-[1.6rem]">{a.title}</h3>
                <p className="mt-3 font-editorial text-lg leading-snug text-cream/80">{a.hint}</p>
                <p className="mt-3 text-[0.7rem] tracking-[0.25em] text-cream/55 uppercase">
                  {a.style} · {a.origin}
                </p>
                <div className="mx-auto mt-5 h-px w-16 bg-gold-500/50 transition-all duration-500 group-hover:w-28" />
                <p className="mt-4 text-[0.62rem] font-semibold tracking-[0.38em] text-gold-300/80 uppercase">Homenagem · Interpretação</p>
              </article>
            </li>
          ))}
        </ul>

        <p className="reveal mx-auto mt-12 flex max-w-3xl items-start gap-3 border border-gold-500/25 bg-velvet-900/60 px-5 py-4 text-sm leading-relaxed text-cream/70">
          <Info size={18} className="mt-0.5 shrink-0 text-gold-400" aria-hidden="true" />
          <span>
            Os artistas sugeridos pelas pistas são referências para as homenagens e interpretações do espetáculo. Não se trata de participações
            confirmadas dos artistas originais.
          </span>
        </p>
      </div>
    </section>
  )
}
