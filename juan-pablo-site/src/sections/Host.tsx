import { EVENT } from '../config/event'
import { DecoCorners, DecoDivider } from '../components/ui/Ornaments'
import { useReveal } from '../hooks/useReveal'

function Portrait() {
  return (
    <figure className="relative mx-auto w-full max-w-sm">
      <div className="relative aspect-[3/4] overflow-hidden border border-gold-400/70 bg-velvet-900 p-3 shadow-[0_40px_80px_-30px_rgb(0_0_0/.9)]">
        <div className="relative h-full w-full overflow-hidden border border-gold-500/40">
          {EVENT.hostPhoto ? (
            <img src={EVENT.hostPhoto} alt={`Retrato de ${EVENT.host}`} className="h-full w-full object-cover sepia-[.25]" />
          ) : (
            <div className="relative flex h-full w-full items-end justify-center overflow-hidden" role="img" aria-label={`Espaço reservado para o retrato de ${EVENT.host}`}>
              <div className="absolute inset-0" style={{ background: 'radial-gradient(ellipse 70% 55% at 50% 30%, rgb(255 236 190 / .28), transparent 70%), linear-gradient(180deg,#3a0f1a,#120609)' }} />
              {/* Silhueta estilizada: apresentador ao microfone */}
              <svg viewBox="0 0 300 400" className="relative h-[84%] w-auto" aria-hidden="true">
                <defs>
                  <linearGradient id="sil" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0" stopColor="#0b0406" />
                    <stop offset="1" stopColor="#1c0910" />
                  </linearGradient>
                </defs>
                <circle cx="150" cy="118" r="44" fill="url(#sil)" />
                <path d="M62 400c4-96 34-176 88-176s84 80 88 176z" fill="url(#sil)" />
                <path d="M128 222l22 30 22-30" fill="none" stroke="#d6ac57" strokeWidth="2" opacity=".6" />
                {/* microfone vintage */}
                <rect x="206" y="168" width="22" height="40" rx="11" fill="#2a0d16" stroke="#d6ac57" strokeWidth="2" />
                <path d="M210 178h14M210 186h14M210 194h14" stroke="#d6ac57" strokeWidth="1" opacity=".7" />
                <path d="M217 208v192" stroke="#d6ac57" strokeWidth="3" opacity=".75" />
              </svg>
              <p className="absolute top-4 left-1/2 -translate-x-1/2 text-[0.6rem] tracking-[0.4em] whitespace-nowrap text-gold-300/60 uppercase">
                Retrato oficial em breve
              </p>
            </div>
          )}
        </div>
        <DecoCorners size={28} inset={-1} color="#e8c878" />
      </div>
      <figcaption className="relative z-10 mx-auto -mt-6 w-fit border border-gold-400/60 bg-velvet-950 px-6 py-2 text-center">
        <span className="font-display text-lg tracking-widest text-gold-200">{EVENT.host}</span>
        <span className="block text-[0.58rem] tracking-[0.4em] text-cream/55 uppercase">Anfitrião & idealizador</span>
      </figcaption>
    </figure>
  )
}

export function Host() {
  const ref = useReveal<HTMLElement>()
  return (
    <section ref={ref} id="juan-pablo" aria-labelledby="host-title" className="relative overflow-hidden bg-ink py-24 sm:py-32">
      <div aria-hidden="true" className="spotlight absolute top-0 left-[28%] h-full w-[80%] -translate-x-1/2 opacity-50" />
      <div className="relative mx-auto grid max-w-6xl items-center gap-16 px-5 lg:grid-cols-[0.9fr_1.1fr] lg:px-8">
        <div className="reveal">
          <Portrait />
        </div>

        <div className="reveal">
          <p className="eyebrow">O anfitrião da noite</p>
          <h2 id="host-title" className="text-gold mt-4 font-serif text-5xl leading-[1.02] font-bold sm:text-6xl">
            {EVENT.host}
          </h2>
          <DecoDivider className="mt-6 !justify-start" />

          <div className="mt-8 space-y-5 font-editorial text-xl leading-[1.7] text-cream/80 sm:text-[1.35rem]">
            <p>
              Apresentador e idealizador do talk show, {EVENT.host} construiu este formato a partir de uma convicção simples: a
              música fica ainda maior quando vem acompanhada da história de quem a canta.
            </p>
            <p>
              No palco, ele conduz a noite entre conversas e canções, aproximando a plateia dos artistas e transformando cada
              entrevista em um encontro. É entretenimento feito com cuidado, ritmo e emoção na medida certa.
            </p>
            <p>
              Esta apresentação tem um significado especial: é o <strong className="font-medium text-gold-200">último espetáculo
              neste formato</strong>. Uma despedida pensada para celebrar o que foi construído e encerrar um ciclo da maneira que
              ele merece, ao vivo e de perto.
            </p>
          </div>

          <div className="mt-10 inline-flex items-center gap-4 border-y border-gold-500/40 py-3 pr-6">
            <span className="font-display text-3xl text-scarlet">✦</span>
            <p className="font-sans text-xs font-semibold tracking-[0.35em] text-gold-200 uppercase">
              Uma última noite · Um ciclo que se encerra
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
