import { FileDown, ImageDown, LoaderCircle } from 'lucide-react'
import { useState } from 'react'
import { downloadTicketPng, downloadTicketsPdf } from './exportTicket'

type Busy = null | 'png' | 'pdf'

export function TicketActions({ getNode, ticketId }: { getNode: () => HTMLElement | null; ticketId: string }) {
  const [busy, setBusy] = useState<Busy>(null)
  const [error, setError] = useState<string | null>(null)

  const run = async (kind: Exclude<Busy, null>) => {
    const node = getNode()
    if (!node) return
    setBusy(kind)
    setError(null)
    try {
      if (kind === 'png') await downloadTicketPng(node, ticketId)
      else await downloadTicketsPdf([node], `ingresso-${ticketId}.pdf`)
    } catch {
      setError('Não foi possível gerar o arquivo. Tente novamente.')
    } finally {
      setBusy(null)
    }
  }

  return (
    <div className="flex flex-wrap items-center gap-3">
      <button type="button" className="btn btn-outline !px-4 !py-2.5 !text-[0.68rem]" disabled={!!busy} onClick={() => run('pdf')}>
        {busy === 'pdf' ? <LoaderCircle size={15} className="animate-spin" /> : <FileDown size={15} />} Baixar PDF
      </button>
      <button type="button" className="btn btn-outline !px-4 !py-2.5 !text-[0.68rem]" disabled={!!busy} onClick={() => run('png')}>
        {busy === 'png' ? <LoaderCircle size={15} className="animate-spin" /> : <ImageDown size={15} />} Baixar imagem
      </button>
      {error && <p role="alert" className="text-sm text-[#f08a9a]">{error}</p>}
    </div>
  )
}
