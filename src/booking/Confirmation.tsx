import { CircleCheck, FileDown, LoaderCircle, Search, Ticket as TicketIcon } from 'lucide-react'
import { useRef, useState } from 'react'
import { EVENT } from '../config/event'
import { formatMoney } from '../domain/format'
import type { PurchaseResult } from '../services'
import { downloadTicketsPdf } from '../tickets/exportTicket'
import { TicketActions } from '../tickets/TicketActions'
import { ScaledTicket } from '../tickets/TicketCard'

export function Confirmation({ result, onNewPurchase }: { result: PurchaseResult; onNewPurchase: () => void }) {
  const nodes = useRef(new Map<string, HTMLDivElement>())
  const [busyAll, setBusyAll] = useState(false)
  const { order, tickets } = result

  const downloadAll = async () => {
    setBusyAll(true)
    try {
      const list = tickets.map((t) => nodes.current.get(t.id)).filter((n): n is HTMLDivElement => !!n)
      await downloadTicketsPdf(list, `ingressos-${order.id}.pdf`)
    } finally {
      setBusyAll(false)
    }
  }

  return (
    <div>
      <div className="mx-auto max-w-3xl text-center" role="status">
        <CircleCheck size={44} className="mx-auto text-gold-300" aria-hidden="true" />
        <h3 className="text-gold mt-4 font-serif text-4xl font-bold sm:text-5xl">Compra simulada confirmada</h3>
        <p className="mt-4 font-editorial text-xl text-cream/75">
          Obrigado, {order.buyer.fullName.split(' ')[0]}. {tickets.length === 1 ? 'Seu ingresso foi emitido' : `Seus ${tickets.length} ingressos foram emitidos`}.
          Guarde o código de cada ingresso: para consultá-lo depois, você vai precisar dele e do e-mail usado na compra. O assento é ilustrativo e, no dia, os lugares são livres.
        </p>
        <p className="mt-3 text-sm tracking-[0.15em] text-cream/50 uppercase">
          Pedido {order.id}{EVENT.pricing.showPrices ? ` · Total ${formatMoney(order.totalCents)}` : ''} · Ingressos fictícios
        </p>
        <div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row">
          {tickets.length > 1 && (
            <button type="button" className="btn btn-gold" onClick={downloadAll} disabled={busyAll}>
              {busyAll ? <LoaderCircle size={17} className="animate-spin" /> : <FileDown size={17} />} Baixar todos (PDF)
            </button>
          )}
          <a href="#consulta" className="btn btn-outline"><Search size={16} /> Consultar ingresso</a>
          <button type="button" className="btn btn-outline" onClick={onNewPurchase}><TicketIcon size={16} /> Nova compra</button>
        </div>
      </div>

      <ul className="mx-auto mt-14 max-w-[880px] space-y-12">
        {tickets.map((t, i) => (
          <li key={t.id} className="animate-fade-up" style={{ animationDelay: `${i * 150}ms` }}>
            <p className="mb-3 text-xs tracking-[0.3em] text-cream/50 uppercase">
              Ingresso {i + 1} de {tickets.length} · {t.seatId}
            </p>
            <ScaledTicket
              ticket={t}
              nodeRef={(el) => {
                if (el) nodes.current.set(t.id, el)
                else nodes.current.delete(t.id)
              }}
            />
            <div className="mt-5">
              <TicketActions ticketId={t.id} getNode={() => nodes.current.get(t.id) ?? null} />
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}
