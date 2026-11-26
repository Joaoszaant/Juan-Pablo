import type { Buyer, Order, SeatSnapshot, Ticket } from '../domain/types'

/**
 * Contrato da camada de dados. A implementação atual usa localStorage;
 * para migrar para um backend, basta criar uma classe (ex.: HttpTicketRepository)
 * que implemente esta interface e trocá-la em `services/index.ts`.
 */
export interface TicketRepository {
  getSnapshot(sessionId: string): Promise<SeatSnapshot>
  /** Reserva temporária dos assentos durante o checkout. Falha se algum já estiver indisponível. */
  holdSeats(sessionId: string, seatIds: string[]): Promise<{ expiresAt: number }>
  releaseHold(sessionId: string): Promise<void>
  purchase(input: PurchaseInput): Promise<PurchaseResult>
  /** Só encontra o ingresso se o e-mail for o do comprador. */
  findTicket(id: string, email: string): Promise<{ ticket: Ticket; order: Order } | null>
  listTickets(): Promise<Ticket[]>
  /** Remove todas as compras simuladas deste navegador. */
  resetSimulation(): Promise<void>
  subscribe(listener: () => void): () => void
}

export interface PurchaseInput {
  sessionId: string
  seatIds: string[]
  buyer: Buyer
  /** Nome por assento; quando ausente, usa o nome do comprador. */
  holderNames?: Record<string, string>
  unitPriceCents: number
}

export interface PurchaseResult {
  order: Order
  tickets: Ticket[]
}

export type BookingErrorCode = 'SEAT_UNAVAILABLE' | 'HOLD_EXPIRED' | 'LIMIT_EXCEEDED' | 'PERSON_LIMIT' | 'EMPTY' | 'UNKNOWN'

export class BookingError extends Error {
  code: BookingErrorCode
  seatIds: string[]
  constructor(code: BookingErrorCode, message: string, seatIds: string[] = []) {
    super(message)
    this.name = 'BookingError'
    this.code = code
    this.seatIds = seatIds
  }
}
