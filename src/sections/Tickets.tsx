import { CircleAlert, Info, LoaderCircle } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { CheckoutForm } from '../booking/CheckoutForm'
import { Confirmation } from '../booking/Confirmation'
import { Legend, SeatMap } from '../booking/SeatMap'
import { MobileSelectionBar, SelectionPanel } from '../booking/SelectionPanel'
import { SectionHeading } from '../components/ui/Ornaments'
import { EVENT } from '../config/event'
import { TOTAL_SEATS, sortSeatIds } from '../domain/seats'
import type { Buyer, SeatDef } from '../domain/types'
import { useSeatSnapshot } from '../hooks/useSeatSnapshot'
import { BookingError, repository, sessionId, type PurchaseResult } from '../services'

type Step = 'select' | 'checkout' | 'done'

const STEPS: { key: Step; label: string }[] = [
  { key: 'select', label: 'Assentos' },
  { key: 'checkout', label: 'Dados' },
  { key: 'done', label: 'Ingressos' },
]

export function Tickets() {
  const { snapshot, loading, error: mapError, refresh } = useSeatSnapshot()
  const [step, setStep] = useState<Step>('select')
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [holding, setHolding] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [holdExpiresAt, setHoldExpiresAt] = useState<number | null>(null)
  const [notice, setNotice] = useState<string | null>(null)
  const [result, setResult] = useState<PurchaseResult | null>(null)
  const topRef = useRef<HTMLDivElement>(null)

  // Se outro comprador (outra aba) ocupar um assento selecionado, removemos da seleção.
  useEffect(() => {
    if (step !== 'select') return
    const lost = [...selected].filter((id) => snapshot.occupied.has(id) || snapshot.heldByOthers.has(id))
    if (lost.length) {
      setSelected((s) => new Set([...s].filter((id) => !lost.includes(id))))
      setNotice(`O(s) assento(s) ${sortSeatIds(lost).join(', ')} acabou(aram) de ser reservado(s) por outra pessoa.`)
    }
  }, [snapshot, selected, step])

  // Retomar reserva existente desta aba após recarregar a página.
  useEffect(() => {
    if (step === 'select' && !selected.size && snapshot.heldByMe.size) void repository.releaseHold(sessionId)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [snapshot.heldByMe.size])

  const scrollTop = () => topRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })

  const toggle = (seat: SeatDef) => {
    setNotice(null)
    setSelected((prev) => {
      const next = new Set(prev)
      if (next.has(seat.id)) next.delete(seat.id)
      else if (next.size >= EVENT.maxSeatsPerOrder) {
        setNotice(`Você pode selecionar até ${EVENT.maxSeatsPerOrder} ingressos por compra.`)
        return prev
      } else next.add(seat.id)
      return next
    })
  }

  const handleBookingError = (err: unknown) => {
    if (err instanceof BookingError) {
      if (err.seatIds.length && err.code === 'SEAT_UNAVAILABLE')
        setSelected((s) => new Set([...s].filter((id) => !err.seatIds.includes(id))))
      setNotice(err.message)
    } else setNotice('Algo deu errado. Tente novamente.')
  }

  const continueToCheckout = async () => {
    setHolding(true)
    setNotice(null)
    try {
      const { expiresAt } = await repository.holdSeats(sessionId, [...selected])
      setHoldExpiresAt(expiresAt)
      setStep('checkout')
      scrollTop()
    } catch (err) {
      handleBookingError(err)
      await refresh()
    } finally {
      setHolding(false)
    }
  }

  const backToSeats = async (message?: string) => {
    await repository.releaseHold(sessionId)
    setHoldExpiresAt(null)
    setStep('select')
    if (message) setNotice(message)
    scrollTop()
  }

  const finalize = async (buyer: Buyer, holderNames: Record<string, string>) => {
    setSubmitting(true)
    setNotice(null)
    try {
      const res = await repository.purchase({
        sessionId,
        seatIds: [...selected],
        buyer,
        holderNames,
        unitPriceCents: EVENT.pricing.unitPriceCents,
      })
      setResult(res)
      setSelected(new Set())
      setHoldExpiresAt(null)
      setStep('done')
      scrollTop()
    } catch (err) {
      handleBookingError(err)
      await repository.releaseHold(sessionId)
      setStep('select')
      scrollTop()
    } finally {
      setSubmitting(false)
    }
  }

  const newPurchase = () => {
    setResult(null)
    setStep('select')
    scrollTop()
  }

  const available = TOTAL_SEATS - snapshot.occupied.size - snapshot.heldByOthers.size
  const stepIndex = STEPS.findIndex((s) => s.key === step)

  return (
    <section id="ingressos" aria-labelledby="tickets-title" className="relative bg-velvet-950 py-24 sm:py-32">
      <div aria-hidden="true" className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-gold-500/50 to-transparent" />
      <div ref={topRef} className="mx-auto max-w-7xl scroll-mt-24 px-5 lg:px-8">
        <SectionHeading id="tickets-title" eyebrow="Bilheteria" title="Escolha o seu lugar">
          Selecione seus assentos no mapa do auditório e receba seu ingresso digital na hora.
        </SectionHeading>

        <p className="mx-auto mt-8 flex max-w-2xl items-start justify-center gap-2 border border-gold-500/30 bg-velvet-900/60 px-4 py-3 text-center text-sm text-cream/75">
          <Info size={17} className="mt-0.5 shrink-0 text-gold-400" aria-hidden="true" />
          <span><strong className="text-gold-200">Simulação:</strong> os ingressos são fictícios e não representam compra real. Nenhum pagamento é solicitado.</span>
        </p>

        {/* Etapas */}
        <ol className="mx-auto mt-10 flex max-w-md items-center justify-between" aria-label="Etapas da compra">
          {STEPS.map((s, i) => (
            <li key={s.key} className="flex flex-1 items-center last:flex-none" aria-current={i === stepIndex ? 'step' : undefined}>
              <span className="flex flex-col items-center gap-2">
                <span
                  className={`flex h-9 w-9 rotate-45 items-center justify-center border transition-colors ${
                    i <= stepIndex ? 'border-gold-300 bg-gold-400 text-ink' : 'border-gold-500/40 text-cream/50'
                  }`}
                >
                  <span className="-rotate-45 font-serif text-sm font-bold">{i + 1}</span>
                </span>
                <span className={`text-[0.65rem] tracking-[0.25em] uppercase ${i <= stepIndex ? 'text-gold-200' : 'text-cream/40'}`}>{s.label}</span>
              </span>
              {i < STEPS.length - 1 && <span className={`mx-2 mb-6 h-px flex-1 ${i < stepIndex ? 'bg-gold-400' : 'bg-gold-500/25'}`} />}
            </li>
          ))}
        </ol>

        {mapError && (
          <p role="alert" className="mx-auto mt-8 flex max-w-2xl items-start gap-2 border border-scarlet/70 bg-scarlet/15 px-4 py-3 text-sm text-cream">
            <CircleAlert size={17} className="mt-0.5 shrink-0 text-[#f08a9a]" aria-hidden="true" /> Não foi possível atualizar o mapa. Verifique sua conexão; tentaremos de novo em instantes.
          </p>
        )}
        {notice && (
          <p role="alert" className="mx-auto mt-8 flex max-w-2xl items-start gap-2 border border-scarlet/70 bg-scarlet/15 px-4 py-3 text-sm text-cream">
            <CircleAlert size={17} className="mt-0.5 shrink-0 text-[#f08a9a]" aria-hidden="true" /> {notice}
          </p>
        )}

        <div className="mt-12">
          {step === 'select' && (
            <div className="grid gap-10 lg:grid-cols-[1fr_340px]">
              <div className="relative min-w-0 border border-gold-500/25 bg-gradient-to-b from-velvet-900/80 to-velvet-950 px-2 py-8 sm:px-6">
                <div className="mb-8">
                  <Legend />
                </div>
                {loading ? (
                  <div className="flex h-96 items-center justify-center text-gold-300" role="status">
                    <LoaderCircle className="animate-spin" aria-hidden="true" /> <span className="ml-3">Carregando mapa…</span>
                  </div>
                ) : (
                  <SeatMap snapshot={snapshot} selected={selected} onToggle={toggle} />
                )}
                <p className="mt-6 text-center text-xs tracking-[0.2em] text-cream/45 uppercase">
                  {available} de {TOTAL_SEATS} lugares disponíveis
                </p>
              </div>
              <div className="hidden lg:block">
                <SelectionPanel
                  selected={selected}
                  busy={holding}
                  onRemove={(id) => setSelected((s) => new Set([...s].filter((x) => x !== id)))}
                  onClear={() => setSelected(new Set())}
                  onContinue={continueToCheckout}
                />
              </div>
              <MobileSelectionBar selected={selected} busy={holding} onContinue={continueToCheckout} />
            </div>
          )}

          {step === 'checkout' && (
            <CheckoutForm
              seatIds={[...selected]}
              holdExpiresAt={holdExpiresAt}
              submitting={submitting}
              onBack={() => backToSeats()}
              onExpire={() => backToSeats('O tempo de reserva expirou. Os assentos foram liberados — selecione-os novamente.')}
              onSubmit={finalize}
            />
          )}

          {step === 'done' && result && <Confirmation result={result} onNewPurchase={newPurchase} />}
        </div>
      </div>
    </section>
  )
}
