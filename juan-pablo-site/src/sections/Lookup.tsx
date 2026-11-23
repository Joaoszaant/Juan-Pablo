import { CircleAlert, CircleCheck, LoaderCircle, RotateCcw, Search, Ticket as TicketIcon, X } from 'lucide-react'
import { useEffect, useRef, useState, type FormEvent } from 'react'
import { SectionHeading } from '../components/ui/Ornaments'
import { formatDateTime } from '../domain/format'
import { TICKET_ID_PATTERN, normalizeTicketId } from '../domain/ids'
import { sideLabel } from '../domain/seats'
import type { Order, Ticket } from '../domain/types'
import { useTickets } from '../hooks/useSeatSnapshot'
import { repository, usingSharedDatabase } from '../services'
import { TicketActions } from '../tickets/TicketActions'
import { ScaledTicket } from '../tickets/TicketCard'

type LookupState =
  | { kind: 'idle' }
  | { kind: 'loading' }
  | { kind: 'invalid'; message: string }
  | { kind: 'notFound'; id: string }
  | { kind: 'found'; ticket: Ticket; order: Order }

const STATUS_TEXT: Record<Ticket['status'], string> = { valid: 'Válido · emitido', cancelled: 'Cancelado' }

function TicketDialog({ ticket, onClose }: { ticket: Ticket | null; onClose: () => void }) {
  const ref = useRef<HTMLDialogElement>(null)
  const node = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const d = ref.current
    if (!d) return
    if (ticket && !d.open) d.showModal()
    if (!ticket && d.open) d.close()
  }, [ticket])
  return (
    <dialog
      ref={ref}
      onClose={onClose}
      onClick={(e) => e.target === ref.current && onClose()}
      aria-label={ticket ? `Ingresso ${ticket.id}` : 'Ingresso'}
      className="m-auto w-[min(940px,94vw)] max-w-none border border-gold-500/40 bg-velvet-950 p-0 text-cream backdrop:bg-black/80 backdrop:backdrop-blur-sm"
    >
      {ticket && (
        <div className="p-5 sm:p-8">
          <div className="mb-5 flex items-center justify-between">
            <p className="eyebrow">Ingresso {ticket.seatId}</p>
            <button type="button" onClick={onClose} aria-label="Fechar" className="flex h-10 w-10 items-center justify-center border border-gold-500/40 text-gold-200 hover:bg-gold-400/10">
              <X size={18} />
            </button>
          </div>
          <ScaledTicket ticket={ticket} nodeRef={node} />
          <div className="mt-6">
            <TicketActions ticketId={ticket.id} getNode={() => node.current} />
          </div>
        </div>
      )}
    </dialog>
  )
}

export function Lookup() {
  const [query, setQuery] = useState('')
  const [state, setState] = useState<LookupState>({ kind: 'idle' })
  const [viewing, setViewing] = useState<Ticket | null>(null)
  const [confirmReset, setConfirmReset] = useState(false)
  const tickets = useTickets()

  const search = async (e?: FormEvent, raw = query) => {
    e?.preventDefault()
    const id = normalizeTicketId(raw)
    if (!id) return setState({ kind: 'invalid', message: 'Digite o código do ingresso.' })
    if (!TICKET_ID_PATTERN.test(id))
      return setState({ kind: 'invalid', message: 'Código em formato inválido. Exemplo: JP-7K2M-Q9XA.' })
    setQuery(id)
    setState({ kind: 'loading' })
    try {
      const found = await repository.findTicket(id)
      setState(found ? { kind: 'found', ...found } : { kind: 'notFound', id })
    } catch {
      setState({ kind: 'invalid', message: 'Não foi possível consultar agora. Tente novamente.' })
    }
  }

  return (
    <section id="consulta" aria-labelledby="lookup-title" className="relative overflow-hidden bg-ink py-24 sm:py-32">
      <div aria-hidden="true" className="absolute inset-0" style={{ background: 'radial-gradient(ellipse 50% 40% at 50% 0%, rgb(122 19 38 / .3), transparent 70%)' }} />
      <div className="relative mx-auto max-w-5xl px-5 lg:px-8">
        <SectionHeading id="lookup-title" eyebrow="Bilheteria" title="Consultar ingresso">
          Informe o código impresso no ingresso para verificar sua validade.
        </SectionHeading>

        <form onSubmit={search} className="mx-auto mt-12 flex max-w-2xl flex-col gap-3 sm:flex-row" role="search" aria-label="Consultar ingresso por código">
          <label htmlFor="ticket-id" className="sr-only">Código do ingresso</label>
          <input
            id="ticket-id"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="JP-XXXX-XXXX"
            autoComplete="off"
            spellCheck={false}
            className="field-input flex-1 !py-4 text-center font-serif !text-xl tracking-[0.2em] uppercase sm:text-left"
            aria-invalid={state.kind === 'invalid' || state.kind === 'notFound'}
            aria-describedby="lookup-result"
          />
          <button type="submit" className="btn btn-gold" disabled={state.kind === 'loading'}>
            {state.kind === 'loading' ? <LoaderCircle size={17} className="animate-spin" /> : <Search size={17} />} Consultar
          </button>
        </form>

        <div id="lookup-result" aria-live="polite" className="mx-auto mt-8 max-w-2xl">
          {state.kind === 'invalid' && (
            <p className="flex items-center gap-2 border border-scarlet/60 bg-scarlet/15 px-4 py-3 text-sm"><CircleAlert size={17} className="text-[#f08a9a]" /> {state.message}</p>
          )}
          {state.kind === 'notFound' && (
            <p className="flex items-start gap-2 border border-scarlet/60 bg-scarlet/15 px-4 py-3 text-sm">
              <CircleAlert size={17} className="mt-0.5 shrink-0 text-[#f08a9a]" />
              <span>Nenhum ingresso encontrado com o código <strong className="font-serif tracking-wider">{state.id}</strong>. Confira se digitou corretamente.</span>
            </p>
          )}
          {state.kind === 'found' && (
            <div className="paper relative p-6 text-velvet-900 sm:p-8">
              <div aria-hidden="true" className="absolute inset-2 border border-crimson/40" />
              <div className="relative flex flex-wrap items-start justify-between gap-4">
                <div>
                  <p className="text-[0.65rem] font-semibold tracking-[0.4em] text-crimson uppercase">Ingresso encontrado</p>
                  <p className="mt-2 font-serif text-2xl font-bold tracking-wider">{state.ticket.id}</p>
                </div>
                <span className={`flex items-center gap-1.5 border px-3 py-1 text-xs font-semibold tracking-[0.15em] uppercase ${state.ticket.status === 'valid' ? 'border-emerald-800/50 bg-emerald-900/10 text-emerald-900' : 'border-crimson text-crimson'}`}>
                  <CircleCheck size={14} /> {STATUS_TEXT[state.ticket.status]}
                </span>
              </div>
              <dl className="relative mt-6 grid grid-cols-2 gap-x-6 gap-y-4 text-sm sm:grid-cols-4">
                <div className="col-span-2"><dt className="text-xs tracking-[0.2em] text-sepia/80 uppercase">Nome</dt><dd className="mt-1 font-serif text-lg">{state.ticket.holderName}</dd></div>
                <div><dt className="text-xs tracking-[0.2em] text-sepia/80 uppercase">Assento</dt><dd className="mt-1 font-serif text-lg">{state.ticket.seatId}</dd></div>
                <div><dt className="text-xs tracking-[0.2em] text-sepia/80 uppercase">Fileira</dt><dd className="mt-1 font-serif text-lg">{state.ticket.row}</dd></div>
                <div className="col-span-2"><dt className="text-xs tracking-[0.2em] text-sepia/80 uppercase">Setor</dt><dd className="mt-1">{sideLabel(state.ticket.side)}</dd></div>
                <div className="col-span-2"><dt className="text-xs tracking-[0.2em] text-sepia/80 uppercase">Emitido em</dt><dd className="mt-1">{formatDateTime(state.ticket.createdAt)} · pedido {state.order.id}</dd></div>
              </dl>
              <button type="button" className="btn btn-gold relative mt-6 !py-3" onClick={() => setViewing(state.ticket)}>
                <TicketIcon size={16} /> Ver ingresso
              </button>
            </div>
          )}
        </div>

        <div className="mt-20">
          <div className="flex flex-wrap items-end justify-between gap-4 border-b border-gold-500/30 pb-4">
            <div>
              <p className="eyebrow">Neste dispositivo</p>
              <h3 className="mt-2 font-serif text-2xl text-gold-100">Ingressos emitidos</h3>
            </div>
            {tickets.length > 0 && (
              confirmReset ? (
                <div className="flex items-center gap-3 text-sm">
                  <span className="text-cream/70">{usingSharedDatabase ? 'Limpar a lista deste dispositivo? (os ingressos continuam válidos)' : 'Apagar todas as compras simuladas?'}</span>
                  <button type="button" className="text-[#f08a9a] underline underline-offset-4" onClick={async () => { await repository.resetSimulation(); setConfirmReset(false); setState({ kind: 'idle' }) }}>{usingSharedDatabase ? 'Limpar' : 'Apagar'}</button>
                  <button type="button" className="text-cream/60 underline underline-offset-4" onClick={() => setConfirmReset(false)}>Cancelar</button>
                </div>
              ) : (
                <button type="button" onClick={() => setConfirmReset(true)} className="flex items-center gap-2 text-xs tracking-[0.2em] text-cream/50 uppercase hover:text-gold-200">
                  <RotateCcw size={14} /> {usingSharedDatabase ? 'Limpar lista' : 'Reiniciar simulação'}
                </button>
              )
            )}
          </div>

          {tickets.length === 0 ? (
            <p className="py-10 text-center font-editorial text-xl text-cream/50 italic">Nenhum ingresso emitido ainda. <a href="#ingressos" className="text-gold-300 not-italic underline underline-offset-4">Escolha seus lugares</a>.</p>
          ) : (
            <ul className="divide-y divide-gold-500/15">
              {tickets.map((t) => (
                <li key={t.id} className="flex flex-wrap items-center justify-between gap-3 py-4">
                  <div className="flex items-center gap-4">
                    <span className="flex h-12 w-14 items-center justify-center border border-gold-500/50 font-serif text-lg text-gold-200">{t.seatId}</span>
                    <div>
                      <p className="font-serif text-lg text-cream">{t.holderName}</p>
                      <p className="text-xs tracking-[0.15em] text-cream/50">{t.id} · {formatDateTime(t.createdAt)}</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button type="button" aria-label={`Consultar ingresso ${t.id}`} className="btn btn-outline !px-4 !py-2 !text-[0.65rem]" onClick={() => { setQuery(t.id); void search(undefined, t.id) }}>Consultar</button>
                    <button type="button" className="btn btn-gold !px-4 !py-2 !text-[0.65rem]" aria-label={`Ver ingresso ${t.id}`} onClick={() => setViewing(t)}>Ver ingresso</button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
      <TicketDialog ticket={viewing} onClose={() => setViewing(null)} />
    </section>
  )
}
