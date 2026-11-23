export type Side = 'left' | 'right'

export interface SeatDef {
  /** Identificador exibido: fileira + número (ex.: "C11"). */
  id: string
  row: string
  rowIndex: number
  number: number
  side: Side
  /** Coluna global (0..2*maxCols-1), usada na navegação por teclado. */
  col: number
}

export interface RowDef {
  letter: string
  index: number
  left: SeatDef[]
  right: SeatDef[]
}

export type SeatStatus = 'available' | 'selected' | 'held' | 'occupied'

export interface Buyer {
  fullName: string
  email: string
  phone: string
  /** CPF mascarado — nunca armazenamos o número completo. */
  cpfMasked: string | null
}

export type TicketStatus = 'valid' | 'cancelled'

export interface Ticket {
  id: string
  orderId: string
  seatId: string
  row: string
  number: number
  side: Side
  holderName: string
  priceCents: number
  status: TicketStatus
  createdAt: string
}

export interface Order {
  id: string
  buyer: Buyer
  ticketIds: string[]
  totalCents: number
  createdAt: string
}

export interface SeatSnapshot {
  occupied: Set<string>
  heldByOthers: Set<string>
  heldByMe: Set<string>
  /** Expiração da reserva desta sessão (epoch ms), se houver. */
  myHoldExpiresAt: number | null
}
