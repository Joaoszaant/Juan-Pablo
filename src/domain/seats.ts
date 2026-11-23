import { HOUSE_SIMULATION, SIDE_ROW_SEATS } from '../config/seating'
import type { RowDef, SeatDef } from './types'

const LETTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'

export const MAX_COLS_PER_SIDE = Math.max(...SIDE_ROW_SEATS)

function buildLayout(): RowDef[] {
  return SIDE_ROW_SEATS.map((count, index) => {
    const letter = LETTERS[index]
    // Numeração contínua da esquerda para a direita (visão da plateia):
    // lado esquerdo 1..n, lado direito n+1..2n. Assentos encostados no corredor.
    const left: SeatDef[] = Array.from({ length: count }, (_, i) => ({
      id: `${letter}${i + 1}`,
      row: letter,
      rowIndex: index,
      number: i + 1,
      side: 'left',
      col: MAX_COLS_PER_SIDE - count + i,
    }))
    const right: SeatDef[] = Array.from({ length: count }, (_, i) => ({
      id: `${letter}${count + i + 1}`,
      row: letter,
      rowIndex: index,
      number: count + i + 1,
      side: 'right',
      col: MAX_COLS_PER_SIDE + i,
    }))
    return { letter, index, left, right }
  })
}

export const LAYOUT: RowDef[] = buildLayout()
export const ALL_SEATS: SeatDef[] = LAYOUT.flatMap((r) => [...r.left, ...r.right])
export const SEAT_BY_ID = new Map(ALL_SEATS.map((s) => [s.id, s]))
export const TOTAL_SEATS = ALL_SEATS.length
export const SEATS_PER_SIDE = TOTAL_SEATS / 2

export const sideLabel = (side: SeatDef['side']) => (side === 'left' ? 'Lado esquerdo' : 'Lado direito')

export function sortSeatIds(ids: Iterable<string>): string[] {
  return [...ids].sort((a, b) => {
    const sa = SEAT_BY_ID.get(a)
    const sb = SEAT_BY_ID.get(b)
    if (!sa || !sb) return a.localeCompare(b)
    return sa.rowIndex - sb.rowIndex || sa.number - sb.number
  })
}

/** PRNG determinístico (mulberry32). */
function mulberry32(seed: number) {
  let a = seed
  return () => {
    a |= 0
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

/** Assentos "já vendidos" e "em compra por outra pessoa" da simulação. */
export const HOUSE = (() => {
  const occupied = new Set<string>()
  const held = new Set<string>()
  if (!HOUSE_SIMULATION.enabled) return { occupied, held }
  const rnd = mulberry32(HOUSE_SIMULATION.seed)
  for (const seat of ALL_SEATS) {
    // Fileiras da frente vendem um pouco mais.
    const frontBoost = 1 + (1 - seat.rowIndex / LAYOUT.length) * 0.6
    const r = rnd()
    if (r < HOUSE_SIMULATION.occupiedRatio * frontBoost) occupied.add(seat.id)
    else if (r > 1 - HOUSE_SIMULATION.heldRatio) held.add(seat.id)
  }
  return { occupied, held }
})()
