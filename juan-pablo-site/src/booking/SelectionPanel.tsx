import { ArrowRight, LoaderCircle, X } from 'lucide-react'
import { EVENT } from '../config/event'
import { formatMoney } from '../domain/format'
import { sortSeatIds } from '../domain/seats'

interface Props {
  selected: Set<string>
  onRemove: (id: string) => void
  onClear: () => void
  onContinue: () => void
  busy: boolean
}

export function SelectionPanel({ selected, onRemove, onClear, onContinue, busy }: Props) {
  const ids = sortSeatIds(selected)
  const count = ids.length
  const total = count * EVENT.pricing.unitPriceCents

  return (
    <aside aria-label="Resumo da seleção" className="relative border border-gold-500/40 bg-velvet-900/80 p-6 backdrop-blur-sm lg:sticky lg:top-24">
      <p className="eyebrow">Sua seleção</p>
      <div className="mt-4 flex items-baseline justify-between">
        <p className="font-serif text-3xl text-gold-100">
          {count} <span className="text-lg text-cream/60">{count === 1 ? 'ingresso' : 'ingressos'}</span>
        </p>
        {count > 0 && (
          <button type="button" onClick={onClear} className="text-xs tracking-[0.2em] text-cream/50 uppercase underline-offset-4 hover:text-gold-200 hover:underline">
            Limpar
          </button>
        )}
      </div>

      <ul className="mt-4 flex min-h-12 flex-wrap gap-2" aria-live="polite">
        {count === 0 && <li className="font-editorial text-lg text-cream/50 italic">Escolha seus lugares no mapa.</li>}
        {ids.map((id) => (
          <li key={id}>
            <button
              type="button"
              onClick={() => onRemove(id)}
              aria-label={`Remover assento ${id}`}
              className="group flex items-center gap-1.5 border border-scarlet/70 bg-scarlet/25 py-1 pr-2 pl-3 font-serif text-sm text-gold-100 transition-colors hover:bg-scarlet/50"
            >
              {id}
              <X size={13} className="opacity-60 group-hover:opacity-100" />
            </button>
          </li>
        ))}
      </ul>

      {EVENT.pricing.showPrices && (<>
      <dl className="mt-6 space-y-2 border-t border-gold-500/25 pt-5 text-sm">
        <div className="flex justify-between text-cream/70">
          <dt>Valor unitário</dt>
          <dd>{formatMoney(EVENT.pricing.unitPriceCents)}</dd>
        </div>
        <div className="flex items-baseline justify-between">
          <dt className="tracking-[0.2em] text-cream/80 uppercase">Total</dt>
          <dd className="font-serif text-3xl text-gold-200" aria-live="polite">{formatMoney(total)}</dd>
        </div>
      </dl>
      {EVENT.pricing.isPlaceholder && <p className="mt-2 text-xs text-cream/45">Valor provisório, sujeito a definição.</p>}
      </>)}

      <button type="button" className="btn btn-gold mt-6 w-full" disabled={count === 0 || busy} onClick={onContinue}>
        {busy ? <LoaderCircle size={17} className="animate-spin" /> : null}
        {busy ? 'Reservando…' : 'Continuar'}
        {!busy && <ArrowRight size={17} />}
      </button>
      <p className="mt-3 text-center text-xs text-cream/45">Até {EVENT.maxSeatsPerOrder} ingressos por compra.</p>
    </aside>
  )
}

/** Barra fixa no rodapé para celulares. */
export function MobileSelectionBar({ selected, onContinue, busy }: Pick<Props, 'selected' | 'onContinue' | 'busy'>) {
  const count = selected.size
  if (!count) return null
  return (
    <div className="fixed inset-x-0 bottom-0 z-40 border-t border-gold-500/40 bg-velvet-950/95 px-4 py-3 backdrop-blur-md lg:hidden">
      <div className="mx-auto flex max-w-xl items-center justify-between gap-4">
        <div>
          <p className="text-xs tracking-[0.15em] text-cream/60 uppercase">
            {count} {count === 1 ? 'ingresso' : 'ingressos'} · {sortSeatIds(selected).slice(0, 4).join(', ')}
            {count > 4 ? '…' : ''}
          </p>
          {EVENT.pricing.showPrices && <p className="font-serif text-xl text-gold-200">{formatMoney(count * EVENT.pricing.unitPriceCents)}</p>}
        </div>
        <button type="button" className="btn btn-gold !px-5 !py-3" onClick={onContinue} disabled={busy}>
          {busy ? <LoaderCircle size={16} className="animate-spin" /> : null}
          Continuar
        </button>
      </div>
    </div>
  )
}
