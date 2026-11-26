import { Calendar, ChevronDown, Clock, MapPin, Ticket } from 'lucide-react'
import { EVENT } from '../config/event'
import { formatEventDate, formatEventTime, formatVenue } from '../domain/format'

function Bulbs({ count, className = '', vertical = false }: { count: number; className?: string; vertical?: boolean }) {
  return (
    <div className={`flex ${vertical ? 'flex-col' : ''} justify-between ${className}`} aria-hidden="true">
      {Array.from({ length: count }, (_, i) => (
        <span key={i} className={`bulb ${i % 2 ? 'max-sm:hidden' : ''}`} style={{ animationDelay: `${(i % 6) * 0.4}s` }} />
      ))}
    </div>
  )
}

function Curtain({ side }: { side: 'left' | 'right' }) {
  const isLeft = side === 'left'
  return (
    <div
      aria-hidden="true"
      className={`velvet absolute top-0 bottom-0 z-10 w-[17vw] min-w-[54px] max-w-[300px] ${isLeft ? 'left-0' : 'right-0'}`}
      style={{
        animation: `${isLeft ? 'curtain-left' : 'curtain-right'} 2.2s cubic-bezier(.3,.7,.2,1) both`,
        clipPath: isLeft
          ? 'polygon(0 0, 100% 0, 92% 30%, 62% 58%, 78% 100%, 0 100%)'
          : 'polygon(0 0, 100% 0, 100% 100%, 22% 100%, 38% 58%, 8% 30%)',
        boxShadow: 'inset 0 0 60px rgb(0 0 0 / .6)',
      }}
    >
      <div
        className={`absolute inset-y-0 ${isLeft ? 'right-0' : 'left-0'} w-1/2`}
        style={{ background: `linear-gradient(${isLeft ? 'to left' : 'to right'}, rgb(0 0 0 / .5), transparent)` }}
      />
      {/* Prendedor dourado */}
      <span
        className="absolute top-[57%] h-3 w-[70%] rounded-full"
        style={{
          [isLeft ? 'left' : 'right']: '0',
          background: 'linear-gradient(180deg,#f6dc96,#b98b3a 60%,#7d5a20)',
          boxShadow: '0 4px 10px rgb(0 0 0 / .5)',
        }}
      />
    </div>
  )
}

export function Hero() {
  const info = [
    { icon: Calendar, label: 'Data', value: formatEventDate() },
    { icon: Clock, label: 'Horário', value: formatEventTime() },
    { icon: MapPin, label: 'Local', value: formatVenue() },
  ]

  return (
    <section id="inicio" aria-labelledby="hero-title" className="relative isolate flex min-h-[100svh] items-center overflow-hidden bg-ink">
      {/* Fundo: parede do teatro */}
      <div
        aria-hidden="true"
        className="absolute inset-0 -z-10"
        style={{
          background:
            'radial-gradient(ellipse 70% 55% at 50% 42%, rgb(122 19 38 / .55), transparent 70%), radial-gradient(ellipse 120% 60% at 50% 110%, rgb(214 172 87 / .16), transparent 60%), linear-gradient(180deg, #0d0507, #1c0910 60%, #0d0507)',
        }}
      />
      {/* Holofotes */}
      <div aria-hidden="true" className="spotlight absolute top-0 left-1/2 -z-10 h-[120%] w-[160%] -translate-x-1/2 opacity-90" />
      <div aria-hidden="true" className="spotlight absolute -top-10 left-[12%] -z-10 h-[110%] w-[90%] -translate-x-1/2 rotate-[-24deg] opacity-40" />
      <div aria-hidden="true" className="spotlight absolute -top-10 left-[88%] -z-10 h-[110%] w-[90%] -translate-x-1/2 rotate-[24deg] opacity-40" />

      {/* Bambolina (sanefa superior) */}
      <div aria-hidden="true" className="absolute inset-x-0 top-0 z-20 h-16 sm:h-20">
        <div
          className="velvet h-full"
          style={{
            WebkitMaskImage: 'radial-gradient(circle at 50% 100%, transparent 22px, #000 23px)',
            maskImage: 'radial-gradient(circle at 50% 100%, transparent 22px, #000 23px)',
            WebkitMaskSize: '64px 100%',
            maskSize: '64px 100%',
            WebkitMaskPosition: 'center',
            maskPosition: 'center',
          }}
        />
        <div className="absolute inset-x-0 top-[calc(100%-26px)] h-[3px] bg-gradient-to-r from-gold-700 via-gold-200 to-gold-700 opacity-80" />
      </div>

      <Curtain side="left" />
      <Curtain side="right" />

      {/* Palco */}
      <div aria-hidden="true" className="absolute inset-x-0 bottom-0 -z-10 h-[22%]">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/70" />
        <div className="absolute inset-x-[10%] top-0 h-px bg-gradient-to-r from-transparent via-gold-400/60 to-transparent" />
        <div className="absolute top-0 left-1/2 h-24 w-[70%] -translate-x-1/2 rounded-[50%] bg-gold-200/10 blur-2xl" />
      </div>

      <div className="relative z-30 mx-auto w-full max-w-5xl px-[12vw] pt-28 pb-20 text-center sm:px-[17vw] lg:px-8">
        <p className="eyebrow animate-fade-up max-sm:!tracking-[0.28em]" style={{ animationDelay: '.4s' }}>
          Talk show musical · Ao vivo<span className="max-sm:hidden"> · Última temporada</span>
        </p>

        <p
          className="animate-fade-up mt-6 font-display text-3xl tracking-[0.08em] text-gold-200 uppercase sm:text-5xl md:text-6xl"
          style={{ animationDelay: '.6s', textShadow: '0 0 24px rgb(232 200 120 / .45)' }}
        >
          {EVENT.showName}
        </p>

        {/* Letreiro luminoso */}
        <div className="animate-fade-up relative mx-auto mt-7 max-w-3xl" style={{ animationDelay: '.85s' }}>
          <div
            className="relative border-2 border-gold-400/80 px-4 py-6 sm:px-10 sm:py-9"
            style={{
              background: 'linear-gradient(180deg, rgb(42 13 22 / .92), rgb(18 6 9 / .92))',
              boxShadow: '0 0 0 6px rgb(18 6 9 / .9), 0 0 0 7px rgb(214 172 87 / .5), 0 30px 80px -20px rgb(0 0 0 / .9), 0 0 60px rgb(232 200 120 / .12)',
            }}
          >
            <Bulbs count={22} className="absolute inset-x-3 -top-[5px]" />
            <Bulbs count={22} className="absolute inset-x-3 -bottom-[5px]" />
            <Bulbs count={5} vertical className="absolute inset-y-3 -left-[5px]" />
            <Bulbs count={5} vertical className="absolute inset-y-3 -right-[5px]" />

            <p className="text-[0.62rem] tracking-[0.5em] text-cream/70 uppercase sm:text-xs">apresentado por</p>
            <h1
              id="hero-title"
              className="text-gold mt-2 font-serif text-[2.6rem] leading-[0.95] font-black tracking-tight uppercase sm:text-7xl md:text-8xl"
              style={{ filter: 'drop-shadow(0 4px 18px rgb(232 200 120 / .25))' }}
            >
              Juan Pablo
            </h1>
          </div>
        </div>

        <p
          className="animate-fade-up mt-9 font-editorial text-2xl text-gold-100 italic sm:text-3xl"
          style={{ animationDelay: '1.1s' }}
        >
          {EVENT.tagline}
        </p>
        <p
          className="animate-fade-up mx-auto mt-5 max-w-2xl font-editorial text-lg leading-relaxed text-cream/75 sm:text-xl"
          style={{ animationDelay: '1.25s' }}
        >
          {EVENT.intro}
        </p>

        <div className="animate-fade-up mt-9 flex flex-col items-center justify-center gap-4 sm:flex-row" style={{ animationDelay: '1.4s' }}>
          <a href="#ingressos" className="btn btn-gold w-full sm:w-auto">
            <Ticket size={17} aria-hidden="true" /> Garantir meu ingresso
          </a>
          <a href="#espetaculo" className="btn btn-outline w-full sm:w-auto">
            Conhecer o espetáculo
          </a>
        </div>

        <dl
          className="animate-fade-up mx-auto mt-12 grid max-w-3xl grid-cols-1 border-y border-gold-500/30 sm:grid-cols-3"
          style={{ animationDelay: '1.6s' }}
        >
          {info.map(({ icon: Icon, label, value }, i) => (
            <div key={label} className={`flex items-center justify-center gap-3 px-4 py-4 ${i ? 'border-t border-gold-500/20 sm:border-t-0 sm:border-l' : ''}`}>
              <Icon size={18} className="shrink-0 text-gold-400" aria-hidden="true" />
              <div className="text-left">
                <dt className="text-[0.62rem] tracking-[0.35em] text-cream/50 uppercase">{label}</dt>
                <dd className="font-serif text-base text-gold-100 [font-variant-numeric:lining-nums]">{value}</dd>
              </div>
            </div>
          ))}
        </dl>
      </div>

      <a
        href="#espetaculo"
        aria-label="Rolar para o espetáculo"
        className="absolute bottom-6 left-1/2 z-30 -translate-x-1/2 text-gold-300/70 transition-colors hover:text-gold-200"
      >
        <ChevronDown className="animate-bounce" />
      </a>
    </section>
  )
}
