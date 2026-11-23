import { createClient, type PostgrestError, type SupabaseClient } from '@supabase/supabase-js'
import { EVENT } from '../config/event'
import { SEAT_BY_ID } from '../domain/seats'
import type { Order, SeatSnapshot, Ticket } from '../domain/types'
import { BookingError, type BookingErrorCode, type PurchaseInput, type PurchaseResult, type TicketRepository } from './TicketRepository'

/** IDs dos ingressos comprados neste navegador (para "Ingressos emitidos neste dispositivo"). */
const MY_TICKETS_KEY = 'jp-show:supabase:my-tickets'

interface TicketRow {
  id: string
  orderId: string
  seatId: string
  holderName: string
  priceCents: number
  status: Ticket['status']
  createdAt: string
}

function toTicket(r: TicketRow): Ticket {
  const seat = SEAT_BY_ID.get(r.seatId)
  return {
    ...r,
    row: seat?.row ?? r.seatId.replace(/\d+/g, ''),
    number: seat?.number ?? Number(r.seatId.replace(/\D+/g, '')),
    side: seat?.side ?? 'left',
  }
}

const MESSAGES: Record<BookingErrorCode, (seats: string[]) => string> = {
  SEAT_UNAVAILABLE: (s) => `Assento(s) ${s.join(', ')} acabaram de ficar indisponíveis.`,
  HOLD_EXPIRED: () => 'O tempo de reserva expirou. Selecione os assentos novamente.',
  LIMIT_EXCEEDED: () => `Limite de ${EVENT.maxSeatsPerOrder} ingressos por compra.`,
  EMPTY: () => 'Selecione ao menos um assento.',
  UNKNOWN: () => 'Não foi possível concluir. Verifique sua conexão e tente novamente.',
}

function toBookingError(err: PostgrestError | Error): BookingError {
  const msg = err.message ?? ''
  const code = (Object.keys(MESSAGES) as BookingErrorCode[]).find((c) => msg.includes(c)) ?? 'UNKNOWN'
  const details = 'details' in err && typeof err.details === 'string' ? err.details : ''
  const seats = code === 'SEAT_UNAVAILABLE' || code === 'HOLD_EXPIRED' ? details.split(',').filter(Boolean) : []
  if (code === 'UNKNOWN' && msg.includes('check constraint')) return new BookingError('UNKNOWN', 'Dados do comprador inválidos.')
  return new BookingError(code, MESSAGES[code](seats), seats)
}

function readMyIds(): string[] {
  try {
    return JSON.parse(localStorage.getItem(MY_TICKETS_KEY) ?? '[]') as string[]
  } catch {
    return []
  }
}

export class SupabaseTicketRepository implements TicketRepository {
  private db: SupabaseClient
  private listeners = new Set<() => void>()

  constructor(url: string, anonKey: string) {
    this.db = createClient(url, anonKey, { auth: { persistSession: false } })
    window.addEventListener('storage', (e) => e.key === MY_TICKETS_KEY && this.emit())
  }

  private emit() {
    this.listeners.forEach((l) => l())
  }

  subscribe(listener: () => void) {
    this.listeners.add(listener)
    return () => {
      this.listeners.delete(listener)
    }
  }

  async getSnapshot(sessionId: string): Promise<SeatSnapshot> {
    const { data, error } = await this.db.rpc('get_seat_map', { p_session: sessionId })
    if (error) throw toBookingError(error)
    const snap: SeatSnapshot = { occupied: new Set(), heldByOthers: new Set(), heldByMe: new Set(), myHoldExpiresAt: null }
    for (const r of data as { seat_id: string; state: string; expires_at: string | null }[]) {
      if (r.state === 'occupied') snap.occupied.add(r.seat_id)
      else if (r.state === 'held_mine') {
        snap.heldByMe.add(r.seat_id)
        if (r.expires_at) snap.myHoldExpiresAt = new Date(r.expires_at).getTime()
      } else snap.heldByOthers.add(r.seat_id)
    }
    return snap
  }

  async holdSeats(sessionId: string, seatIds: string[]) {
    const { data, error } = await this.db.rpc('hold_seats', {
      p_session: sessionId,
      p_seats: seatIds,
      p_minutes: EVENT.holdMinutes,
    })
    if (error) throw toBookingError(error)
    this.emit()
    return { expiresAt: new Date(data as string).getTime() }
  }

  async releaseHold(sessionId: string) {
    await this.db.rpc('release_hold', { p_session: sessionId })
    this.emit()
  }

  async purchase(input: PurchaseInput): Promise<PurchaseResult> {
    const { data, error } = await this.db.rpc('purchase', {
      p_session: input.sessionId,
      p_seats: input.seatIds,
      p_buyer: input.buyer,
      p_holders: input.holderNames ?? {},
      p_price_cents: input.unitPriceCents,
    })
    if (error) throw toBookingError(error)
    const res = data as { order: Order; tickets: TicketRow[] }
    const tickets = res.tickets.map(toTicket)
    try {
      localStorage.setItem(MY_TICKETS_KEY, JSON.stringify([...readMyIds(), ...tickets.map((t) => t.id)]))
    } catch {
      /* armazenamento indisponível: os ingressos continuam no banco */
    }
    this.emit()
    return { order: res.order, tickets }
  }

  private async fetchTickets(ids: string[]): Promise<Ticket[]> {
    if (!ids.length) return []
    const { data, error } = await this.db.rpc('find_tickets', { p_ids: ids })
    if (error) throw toBookingError(error)
    return (data as TicketRow[]).map(toTicket)
  }

  async findTicket(id: string) {
    const [ticket] = await this.fetchTickets([id])
    if (!ticket) return null
    // A consulta pública não expõe contatos do comprador.
    const order: Order = {
      id: ticket.orderId,
      buyer: { fullName: ticket.holderName, email: '', phone: '', cpfMasked: null },
      ticketIds: [ticket.id],
      totalCents: ticket.priceCents,
      createdAt: ticket.createdAt,
    }
    return { ticket, order }
  }

  async listTickets() {
    return this.fetchTickets(readMyIds())
  }

  /** Só limpa a lista deste navegador. Para zerar o banco, rode supabase/reset.sql. */
  async resetSimulation() {
    localStorage.removeItem(MY_TICKETS_KEY)
    this.emit()
  }
}
