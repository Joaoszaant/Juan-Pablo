import { EVENT } from '../config/event'

// Sem caracteres ambíguos (0/O, 1/I/L).
const ALPHABET = '23456789ABCDEFGHJKMNPQRSTUVWXYZ'

function randomBlock(length: number): string {
  const bytes = new Uint8Array(length)
  crypto.getRandomValues(bytes)
  return Array.from(bytes, (b) => ALPHABET[b % ALPHABET.length]).join('')
}

/** Gera um ID no formato PREFIXO-XXXX-XXXX garantindo que não colida com `taken`. */
export function generateUniqueId(taken: Set<string>, prefix = EVENT.ticketIdPrefix): string {
  for (let i = 0; i < 1000; i++) {
    const id = `${prefix}-${randomBlock(4)}-${randomBlock(4)}`
    if (!taken.has(id)) {
      taken.add(id)
      return id
    }
  }
  throw new Error('Não foi possível gerar um ID único.')
}

export const TICKET_ID_PATTERN = new RegExp(`^${EVENT.ticketIdPrefix}-[${ALPHABET}]{4}-[${ALPHABET}]{4}$`)

/** Normaliza o que o usuário digitou: maiúsculas, sem espaços, hífens recolocados. */
export function normalizeTicketId(raw: string): string {
  const compact = raw.toUpperCase().replace(/[^A-Z0-9]/g, '')
  const p = EVENT.ticketIdPrefix
  if (compact.startsWith(p) && compact.length === p.length + 8) {
    const body = compact.slice(p.length)
    return `${p}-${body.slice(0, 4)}-${body.slice(4)}`
  }
  return raw.trim().toUpperCase()
}
