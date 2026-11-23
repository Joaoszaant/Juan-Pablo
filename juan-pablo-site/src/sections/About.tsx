import { Mic, Music, Sparkles } from 'lucide-react'
import { EVENT } from '../config/event'
import { SectionHeading } from '../components/ui/Ornaments'
import { useReveal } from '../hooks/useReveal'

const PILLARS = [
  {
    n: 'I',
    icon: Mic,
    title: 'Entrevistas',
    text: 'Conversas conduzidas por Juan Pablo, com histórias, bastidores e a trajetória por trás de cada canção.',
  },
  {
    n: 'II',
    icon: Music,
    title: 'Performances',
    text: 'Interpretações ao vivo de repertórios que marcaram gerações, do pop internacional à música brasileira.',
  },
  {
    n: 'III',
    icon: Sparkles,
    title: 'Encontros',
    text: 'Participações especiais e momentos únicos, pensados para acontecer uma única vez, diante desta plateia.',
  },
]

export function About() {
  const ref = useReveal<HTMLElement>()
  return (
    <section ref={ref} id="espetaculo" aria-labelledby="about-title" className="paper relative overflow-hidden py-24 text-velvet-900 sm:py-32">
      {/* Faixas de cartaz */}
      <div aria-hidden="true" className="absolute inset-x-0 top-0 h-2 bg-crimson" />
      <div aria-hidden="true" className="absolute inset-x-0 top-3 h-px bg-crimson/60" />
      <div aria-hidden="true" className="absolute inset-x-0 bottom-0 h-2 bg-crimson" />
      <div aria-hidden="true" className="absolute inset-x-0 bottom-3 h-px bg-crimson/60" />

      <div className="mx-auto max-w-6xl px-5 lg:px-8">
        <div className="reveal">
          <SectionHeading id="about-title" tone="light" eyebrow="O espetáculo" title={<>Um talk show.<br className="sm:hidden" /> Um grande musical.</>} />
        </div>

        <div className="mt-16 grid gap-12 lg:grid-cols-[1.15fr_1fr] lg:gap-20">
          <div className="reveal font-editorial text-xl leading-[1.7] text-sepia sm:text-[1.4rem]">
            <p className="first-letter:float-left first-letter:mt-1 first-letter:mr-3 first-letter:font-display first-letter:text-[4.6rem] first-letter:leading-[0.8] first-letter:text-crimson">
              <strong className="font-medium text-velvet-900">{EVENT.showName}</strong> é um talk show musical comandado por{' '}
              {EVENT.host}, que recebe grandes artistas nacionais e internacionais para participações especiais, entrevistas e
              performances ao vivo.
            </p>
            <p className="mt-6">
              A proposta é unir a atmosfera íntima de um programa de entrevistas à grandiosidade de um espetáculo musical: a
              conversa abre caminho para a canção, e a canção revela aquilo que a conversa não alcança.
            </p>
            <blockquote className="mt-10 border-l-2 border-crimson pl-6 font-serif text-2xl leading-snug text-velvet-900 italic sm:text-3xl">
              “Cada convidado traz uma história. Cada história termina em música.”
            </blockquote>
          </div>

          <ol className="space-y-5">
            {PILLARS.map(({ n, icon: Icon, title, text }, i) => (
              <li
                key={title}
                className="reveal group relative flex gap-5 border border-velvet-900/15 bg-white/25 p-6 transition-all duration-500 hover:-translate-y-1 hover:border-crimson/40 hover:bg-white/40 hover:shadow-[0_18px_40px_-24px_rgb(75_14_28/.6)]"
                style={{ transitionDelay: `${i * 90}ms` }}
              >
                <span className="w-12 shrink-0 font-serif text-4xl leading-none text-crimson/80 italic">{n}</span>
                <div>
                  <h3 className="flex items-center gap-2 font-sans text-sm font-bold tracking-[0.3em] text-velvet-900 uppercase">
                    <Icon size={16} className="text-crimson" aria-hidden="true" /> {title}
                  </h3>
                  <p className="mt-2 font-editorial text-lg leading-relaxed text-sepia">{text}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  )
}
