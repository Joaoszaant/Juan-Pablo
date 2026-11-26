import { EVENT } from '../config/event'
import { generateUniqueId } from '../domain/ids'
import { HOUSE, SEAT_BY_ID, sortSeatIds } from '../domain/seats'
import type { Order, SeatSnapshot, Ticket } from '../domain/types'
import { BookingError, type PurchaseInput, type PurchaseResult, type TicketRepository } from './TicketRepository'

const NS = 'jp-show:v2'
const KEY_ORDERS = `${NS}:orders`
const KEY_TICKETS = `${NS}:tickets`
const KEY_HOLDS = `${NS}:holds`

type Holds = Record<string, { sessionId: string; expiresAt: number }>

const wait = (ms: number) => new Promise((r) => setTimeout(r, ms))

function read<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key)
    return raw ? (JSON.parse(raw) as T) : fallback
  } catch {
    return fallback
  }
}

function write(key: string, value: unknown) {
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch {
    throw new BookingError('UNKNOWN', 'Não foi possível salvar os dados neste navegador.')
  }
}

export class LocalStorageTicketRepository implements TicketRepository {
  private listeners = new Set<() => void>()
  /** Latência simulada, para os estados de carregamento serem perceptíveis. */
  private latency: number

  constructor(latency = 350) {
    this.latency = latency
    if (typeof window !== 'undefined') {
      window.addEventListener('storage', (e) => {
        if (e.key?.startsWith(NS)) this.emit()
      })
    }
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

  private activeHolds(): Holds {
    const now = Date.now()
    const holds = read<Holds>(KEY_HOLDS, {})
    const active: Holds = {}
    for (const [seat, h] of Object.entries(holds)) if (h.expiresAt > now) active[seat] = h
    return active
  }

  private soldSeatIds(): Set<string> {
    const tickets = read<Ticket[]>(KEY_TICKETS, [])
    return new Set(tickets.filter((t) => t.status === 'valid').map((t) => t.seatId))
  }

  private computeSnapshot(sessionId: string): SeatSnapshot {
    const occupied = new Set([...HOUSE.occupied, ...this.soldSeatIds()])
    const heldByOthers = new Set([...HOUSE.held].filter((s) => !occupied.has(s)))
    const heldByMe = new Set<string>()
    let myHoldExpiresAt: number | null = null
    for (const [seat, h] of Object.entries(this.activeHolds())) {
      if (occupied.has(seat)) continue
      if (h.sessionId === sessionId) {
        heldByMe.add(seat)
        myHoldExpiresAt = h.expiresAt
      } else heldByOthers.add(seat)
    }
    return { occupied, heldByOthers, heldByMe, myHoldExpiresAt }
  }

  async getSnapshot(sessionId: string) {
    return this.computeSnapshot(sessionId)
  }

  async holdSeats(sessionId: string, seatIds: string[]) {
    await wait(this.latency)
    if (!seatIds.length) throw new BookingError('EMPTY', 'Selecione ao menos um assento.')
    if (seatIds.length > EVENT.maxSeatsPerOrder)
      throw new BookingError('LIMIT_EXCEEDED', `Limite de ${EVENT.maxSeatsPerOrder} ingressos por compra.`)

    const snap = this.computeSnapshot(sessionId)
    const conflicts = seatIds.filter((s) => !SEAT_BY_ID.has(s) || snap.occupied.has(s) || snap.heldByOthers.has(s))
    if (conflicts.length)
      throw new BookingError(
        'SEAT_UNAVAILABLE',
        `Assento(s) ${sortSeatIds(conflicts).join(', ')} acabaram de ficar indisponíveis.`,
        conflicts,
      )

    const holds = this.activeHolds()
    for (const [seat, h] of Object.entries(holds)) if (h.sessionId === sessionId) delete holds[seat]
    const expiresAt = Date.now() + EVENT.holdMinutes * 60_000
    for (const s of seatIds) holds[s] = { sessionId, expiresAt }
    write(KEY_HOLDS, holds)
    this.emit()
    return { expiresAt }
  }

  async releaseHold(sessionId: string) {
    const holds = this.activeHolds()
    for (const [seat, h] of Object.entries(holds)) if (h.sessionId === sessionId) delete holds[seat]
    write(KEY_HOLDS, holds)
    this.emit()
  }

  async purchase(input: PurchaseInput): Promise<PurchaseResult> {
    await wait(this.latency * 4)
    const { sessionId, seatIds, buyer, holderNames = {}, unitPriceCents } = input
    if (!seatIds.length) throw new BookingError('EMPTY', 'Nenhum assento selecionado.')

    // Revalida imediatamente antes de gravar — evita compra duplicada do mesmo assento.
    const tickets0 = read<Ticket[]>(KEY_TICKETS, [])
    const orders0 = read<Order[]>(KEY_ORDERS, [])
    const digits = (p: string) => p.replace(/\D/g, '')
    const mineOrders = new Set(
      orders0
        .filter((o) => o.buyer.email === buyer.email || digits(o.buyer.phone) === digits(buyer.phone))
        .map((o) => o.id),
    )
    const already = tickets0.filter((t) => t.status === 'valid' && mineOrders.has(t.orderId)).length
    const max = EVENT.maxTicketsPerPerson
    if (already + seatIds.length > max)
      throw new BookingError(
        'PERSON_LIMIT',
        max - already > 0
          ? `Cada pessoa pode emitir até ${max} ingressos. Você ainda pode emitir ${max - already}.`
          : `Cada pessoa pode emitir até ${max} ingressos, e esse limite já foi atingido com este e-mail ou telefone.`,
      )

    const snap = this.computeSnapshot(sessionId)
    const taken = seatIds.filter((s) => snap.occupied.has(s) || snap.heldByOthers.has(s))
    if (taken.length)
      throw new BookingError('SEAT_UNAVAILABLE', `Assento(s) ${sortSeatIds(taken).join(', ')} já foram vendidos.`, taken)
    const notHeld = seatIds.filter((s) => !snap.heldByMe.has(s))
    if (notHeld.length)
      throw new BookingError('HOLD_EXPIRED', 'O tempo de reserva expirou. Selecione os assentos novamente.', notHeld)

    const tickets = read<Ticket[]>(KEY_TICKETS, [])
    const orders = read<Order[]>(KEY_ORDERS, [])
    const takenIds = new Set([...tickets.map((t) => t.id), ...orders.map((o) => o.id)])
    const now = new Date().toISOString()
    const orderId = generateUniqueId(takenIds, 'PED')

    const newTickets: Ticket[] = sortSeatIds(seatIds).map((seatId) => {
      const seat = SEAT_BY_ID.get(seatId)!
      return {
        id: generateUniqueId(takenIds),
        orderId,
        seatId,
        row: seat.row,
        number: seat.number,
        side: seat.side,
        holderName: holderNames[seatId]?.trim() || buyer.fullName,
        priceCents: unitPriceCents,
        status: 'valid',
        createdAt: now,
      }
    })

    const order: Order = {
      id: orderId,
      buyer,
      ticketIds: newTickets.map((t) => t.id),
      totalCents: unitPriceCents * newTickets.length,
      createdAt: now,
    }

    write(KEY_TICKETS, [...tickets, ...newTickets])
    write(KEY_ORDERS, [...orders, order])
    await this.releaseHold(sessionId)
    return { order, tickets: newTickets }
  }

  async findTicket(id: string, email: string) {
    await wait(this.latency)
    const ticket = read<Ticket[]>(KEY_TICKETS, []).find((t) => t.id === id)
    if (!ticket) return null
    const order = read<Order[]>(KEY_ORDERS, []).find((o) => o.id === ticket.orderId)
    return order && order.buyer.email === email.trim().toLowerCase() ? { ticket, order } : null
  }

  async listTickets() {
    return read<Ticket[]>(KEY_TICKETS, []).slice().reverse()
  }

  async resetSimulation() {
    ;[KEY_TICKETS, KEY_ORDERS, KEY_HOLDS].forEach((k) => localStorage.removeItem(k))
    this.emit()
  }
}
