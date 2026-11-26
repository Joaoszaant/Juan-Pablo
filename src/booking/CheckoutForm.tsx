import { ArrowLeft, Clock, LoaderCircle, ShieldAlert, Users } from 'lucide-react'
import { useId, useState, type FormEvent, type ReactNode } from 'react'
import { EVENT } from '../config/event'
import { formatEventDate, formatEventTime, formatMoney } from '../domain/format'
import { SEAT_BY_ID, sideLabel, sortSeatIds } from '../domain/seats'
import type { Buyer } from '../domain/types'
import { maskCpf, maskPhone, redactCpf, validateCheckout, validateName, type CheckoutFields, type FieldErrors } from '../domain/validation'
import { useCountdown } from '../hooks/useMediaQuery'

interface Props {
  seatIds: string[]
  holdExpiresAt: number | null
  submitting: boolean
  onBack: () => void
  onExpire: () => void
  onSubmit: (buyer: Buyer, holderNames: Record<string, string>) => void
}

function FormField({
  id, label, error, hint, children,
}: { id: string; label: string; error?: string; hint?: string; children: ReactNode }) {
  return (
    <div>
      <label htmlFor={id} className="mb-2 block text-xs font-semibold tracking-[0.22em] text-gold-200/90 uppercase">
        {label}
      </label>
      {children}
      {error ? (
        <p id={`${id}-error`} role="alert" className="mt-1.5 text-sm text-[#f08a9a]">{error}</p>
      ) : hint ? (
        <p id={`${id}-hint`} className="mt-1.5 text-xs text-cream/45">{hint}</p>
      ) : null}
    </div>
  )
}

export function CheckoutForm({ seatIds, holdExpiresAt, submitting, onBack, onExpire, onSubmit }: Props) {
  const uid = useId()
  const [fields, setFields] = useState<CheckoutFields>({ fullName: '', email: '', phone: '', cpf: '', acceptedSimulation: false })
  const [errors, setErrors] = useState<FieldErrors>({})
  const [touched, setTouched] = useState<Partial<Record<keyof CheckoutFields, boolean>>>({})
  const [customNames, setCustomNames] = useState(false)
  const [names, setNames] = useState<Record<string, string>>({})
  const [nameErrors, setNameErrors] = useState<Record<string, string>>({})
  const left = useCountdown(holdExpiresAt, onExpire)

  const ids = sortSeatIds(seatIds)
  const total = ids.length * EVENT.pricing.unitPriceCents

  const set = <K extends keyof CheckoutFields>(key: K, value: CheckoutFields[K]) => {
    const next = { ...fields, [key]: value }
    setFields(next)
    if (touched[key]) setErrors((e) => ({ ...e, [key]: validateCheckout(next)[key] }))
  }
  const blur = (key: keyof CheckoutFields) => {
    setTouched((t) => ({ ...t, [key]: true }))
    setErrors((e) => ({ ...e, [key]: validateCheckout(fields)[key] }))
  }

  const submit = (e: FormEvent) => {
    e.preventDefault()
    const errs = validateCheckout(fields)
    const nErrs: Record<string, string> = {}
    if (customNames) for (const id of ids) {
      const v = names[id]?.trim()
      if (v) {
        const err = validateName(v)
        if (err) nErrs[id] = err
      }
    }
    setErrors(errs)
    setNameErrors(nErrs)
    setTouched({ fullName: true, email: true, phone: true, cpf: true, acceptedSimulation: true })
    const firstError = Object.keys(errs)[0] ?? (Object.keys(nErrs)[0] ? `name-${Object.keys(nErrs)[0]}` : null)
    if (firstError) {
      document.getElementById(`${uid}-${firstError}`)?.focus()
      return
    }
    onSubmit(
      {
        fullName: fields.fullName.trim().replace(/\s+/g, ' '),
        email: fields.email.trim().toLowerCase(),
        phone: fields.phone,
        cpfMasked: fields.cpf.trim() ? redactCpf(fields.cpf) : null,
      },
      customNames ? names : {},
    )
  }

  const fid = (k: string) => `${uid}-${k}`
  const mm = left !== null ? String(Math.floor(left / 60)).padStart(2, '0') : '--'
  const ss = left !== null ? String(left % 60).padStart(2, '0') : '--'

  return (
    <div className="grid gap-8 lg:grid-cols-[1.3fr_1fr]">
      <form noValidate onSubmit={submit} className="border border-gold-500/35 bg-velvet-900/70 p-6 sm:p-8" aria-labelledby={`${uid}-title`}>
        <div className="flex flex-wrap items-center justify-between gap-4">
          <h3 id={`${uid}-title`} className="font-serif text-3xl text-gold-100">Seus dados</h3>
          <p
            className={`flex items-center gap-2 border px-3 py-1.5 text-xs tracking-[0.18em] uppercase ${left !== null && left < 60 ? 'border-scarlet text-[#f08a9a]' : 'border-gold-500/40 text-gold-200'}`}
            aria-live={left !== null && left < 60 ? 'assertive' : 'off'}
          >
            <Clock size={14} aria-hidden="true" /> Reserva: {mm}:{ss}
          </p>
        </div>
        <p className="mt-2 text-sm text-cream/60">Seus assentos estão reservados temporariamente enquanto você conclui.</p>

        <div className="mt-8 grid gap-5 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <FormField id={fid('fullName')} label="Nome completo *" error={errors.fullName}>
              <input
                id={fid('fullName')} className="field-input" autoComplete="name" value={fields.fullName}
                aria-invalid={!!errors.fullName} aria-describedby={errors.fullName ? `${fid('fullName')}-error` : undefined}
                onChange={(e) => set('fullName', e.target.value)} onBlur={() => blur('fullName')}
              />
            </FormField>
          </div>
          <FormField id={fid('email')} label="E-mail *" error={errors.email}>
            <input
              id={fid('email')} type="email" inputMode="email" className="field-input" autoComplete="email" value={fields.email}
              aria-invalid={!!errors.email} aria-describedby={errors.email ? `${fid('email')}-error` : undefined}
              onChange={(e) => set('email', e.target.value)} onBlur={() => blur('email')}
            />
          </FormField>
          <FormField id={fid('phone')} label="Telefone *" error={errors.phone}>
            <input
              id={fid('phone')} type="tel" inputMode="tel" className="field-input" autoComplete="tel" placeholder="(11) 91234-5678" value={fields.phone}
              aria-invalid={!!errors.phone} aria-describedby={errors.phone ? `${fid('phone')}-error` : undefined}
              onChange={(e) => set('phone', maskPhone(e.target.value))} onBlur={() => blur('phone')}
            />
          </FormField>
          <div className="sm:col-span-2">
            <FormField id={fid('cpf')} label="CPF (opcional)" error={errors.cpf} hint="Usado apenas na simulação. Guardamos somente os últimos dígitos.">
              <input
                id={fid('cpf')} inputMode="numeric" className="field-input" placeholder="000.000.000-00" value={fields.cpf}
                aria-invalid={!!errors.cpf} aria-describedby={errors.cpf ? `${fid('cpf')}-error` : `${fid('cpf')}-hint`}
                onChange={(e) => set('cpf', maskCpf(e.target.value))} onBlur={() => blur('cpf')}
              />
            </FormField>
          </div>
        </div>

        {ids.length > 1 && (
          <div className="mt-6 border-t border-gold-500/20 pt-6">
            <label className="flex cursor-pointer items-center gap-3 text-sm text-cream/80">
              <input type="checkbox" className="h-4 w-4 accent-[#d6ac57]" checked={customNames} onChange={(e) => setCustomNames(e.target.checked)} />
              <Users size={16} className="text-gold-400" aria-hidden="true" /> Personalizar o nome em cada ingresso
            </label>
            {customNames && (
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                {ids.map((id) => (
                  <div key={id}>
                    <label htmlFor={fid(`name-${id}`)} className="mb-1 block text-xs tracking-[0.2em] text-cream/60 uppercase">Assento {id}</label>
                    <input
                      id={fid(`name-${id}`)} className="field-input !py-2.5" placeholder={fields.fullName || 'Nome do comprador'}
                      value={names[id] ?? ''} aria-invalid={!!nameErrors[id]}
                      onChange={(e) => setNames((n) => ({ ...n, [id]: e.target.value }))}
                    />
                    {nameErrors[id] && <p role="alert" className="mt-1 text-xs text-[#f08a9a]">{nameErrors[id]}</p>}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        <div className="mt-6 border border-gold-500/30 bg-velvet-950/60 p-4">
          <label className="flex cursor-pointer items-start gap-3 text-sm leading-relaxed text-cream/80" htmlFor={fid('acceptedSimulation')}>
            <input
              id={fid('acceptedSimulation')} type="checkbox" className="mt-1 h-4 w-4 shrink-0 accent-[#d6ac57]"
              checked={fields.acceptedSimulation} aria-invalid={!!errors.acceptedSimulation}
              onChange={(e) => set('acceptedSimulation', e.target.checked)}
            />
            <span>
              Entendo que esta é uma <strong className="text-gold-200">compra fictícia</strong>: nenhum pagamento é solicitado ou
              processado, os ingressos gerados não têm valor comercial e o <strong className="text-gold-200">assento é
              ilustrativo</strong>: no dia, posso me sentar em outro lugar.
            </span>
          </label>
          {errors.acceptedSimulation && <p role="alert" className="mt-2 text-sm text-[#f08a9a]">{errors.acceptedSimulation}</p>}
        </div>

        <div className="mt-8 flex flex-col-reverse gap-3 sm:flex-row sm:justify-between">
          <button type="button" className="btn btn-outline" onClick={onBack} disabled={submitting}>
            <ArrowLeft size={16} /> Voltar aos assentos
          </button>
          <button type="submit" className="btn btn-gold" disabled={submitting || left === 0}>
            {submitting && <LoaderCircle size={17} className="animate-spin" />}
            {submitting ? 'Processando…' : 'Finalizar compra'}
          </button>
        </div>
      </form>

      <aside aria-label="Resumo da compra" className="paper relative h-fit p-7 text-velvet-900 shadow-[0_30px_60px_-30px_rgb(0_0_0/.9)]">
        <div aria-hidden="true" className="absolute inset-2 border border-crimson/40" />
        <p className="text-[0.65rem] font-semibold tracking-[0.4em] text-crimson uppercase">Resumo da compra</p>
        <h4 className="mt-3 font-display text-3xl leading-tight">{EVENT.showName}</h4>
        <p className="font-editorial text-lg text-sepia italic">com {EVENT.host}</p>
        <p className="mt-1 text-xs tracking-[0.15em] text-sepia/80 uppercase">{EVENT.date || EVENT.time ? `${formatEventDate('short')} · ${formatEventTime()}` : 'Data e horário a anunciar'}</p>

        <div className="my-5 border-t border-dashed border-velvet-900/30" />
        <ul className="space-y-1.5 text-sm">
          {ids.map((id) => {
            const s = SEAT_BY_ID.get(id)!
            return (
              <li key={id} className="flex justify-between">
                <span>
                  <strong className="font-serif">{id}</strong> <span className="text-sepia/80">· Fileira {s.row} · {sideLabel(s.side)}</span>
                </span>
                {EVENT.pricing.showPrices && <span>{formatMoney(EVENT.pricing.unitPriceCents)}</span>}
              </li>
            )
          })}
        </ul>
        <div className="my-5 border-t border-dashed border-velvet-900/30" />
        <dl className="space-y-1.5 text-sm">
          <div className="flex justify-between"><dt>Quantidade</dt><dd>{ids.length}</dd></div>
          {EVENT.pricing.showPrices && <div className="flex justify-between"><dt>Valor unitário</dt><dd>{formatMoney(EVENT.pricing.unitPriceCents)}</dd></div>}
          {EVENT.pricing.showPrices && <div className="flex items-baseline justify-between pt-2">
            <dt className="text-xs font-semibold tracking-[0.3em] uppercase">Total</dt>
            <dd className="font-serif text-3xl font-bold text-crimson">{formatMoney(total)}</dd>
          </div>}
        </dl>
        <p className="mt-6 flex items-start gap-2 text-xs leading-relaxed text-sepia">
          <ShieldAlert size={15} className="mt-0.5 shrink-0 text-crimson" aria-hidden="true" />
          Simulação. Nenhum pagamento é solicitado.
        </p>
      </aside>
    </div>
  )
}
