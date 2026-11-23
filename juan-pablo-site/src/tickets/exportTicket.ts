import { toPng } from 'html-to-image'
import { TICKET_H, TICKET_W } from './TicketCard'

async function capture(node: HTMLElement): Promise<string> {
  await document.fonts.ready
  // A primeira captura às vezes sai sem fontes embutidas; capturar duas vezes é o contorno conhecido.
  await toPng(node, { pixelRatio: 1, cacheBust: true })
  return toPng(node, { pixelRatio: 2.5, cacheBust: true })
}

function triggerDownload(href: string, filename: string) {
  const a = document.createElement('a')
  a.href = href
  a.download = filename
  document.body.appendChild(a)
  a.click()
  a.remove()
}

export async function downloadTicketPng(node: HTMLElement, ticketId: string) {
  triggerDownload(await capture(node), `ingresso-${ticketId}.png`)
}

export async function downloadTicketsPdf(nodes: HTMLElement[], filename: string) {
  const { jsPDF } = await import('jspdf')
  const pdf = new jsPDF({ orientation: 'landscape', unit: 'px', format: [TICKET_W, TICKET_H], hotfixes: ['px_scaling'] })
  for (let i = 0; i < nodes.length; i++) {
    if (i > 0) pdf.addPage([TICKET_W, TICKET_H], 'landscape')
    pdf.addImage(await capture(nodes[i]), 'PNG', 0, 0, TICKET_W, TICKET_H)
  }
  pdf.save(filename)
}
