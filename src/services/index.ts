import { LocalStorageTicketRepository } from './LocalStorageTicketRepository'
import { SupabaseTicketRepository } from './SupabaseTicketRepository'
import type { TicketRepository } from './TicketRepository'

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL as string | undefined
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined

/** true quando o site grava no banco compartilhado (Supabase). */
export const usingSharedDatabase = Boolean(SUPABASE_URL && SUPABASE_ANON_KEY)

/**
 * Com as variáveis do Supabase definidas, usa o banco compartilhado.
 * Sem elas (ex.: desenvolvimento local), cai no localStorage deste navegador.
 */
export const repository: TicketRepository = usingSharedDatabase
  ? new SupabaseTicketRepository(SUPABASE_URL!, SUPABASE_ANON_KEY!)
  : new LocalStorageTicketRepository()

if (!usingSharedDatabase && import.meta.env.PROD)
  console.warn('[ingressos] VITE_SUPABASE_URL/VITE_SUPABASE_ANON_KEY ausentes: usando localStorage (dados só neste navegador).')

const SESSION_KEY = 'jp-show:session'

/** Identifica esta aba/sessão para as reservas temporárias de assentos. */
export const sessionId: string = (() => {
  try {
    const existing = sessionStorage.getItem(SESSION_KEY)
    if (existing) return existing
    const id = crypto.randomUUID()
    sessionStorage.setItem(SESSION_KEY, id)
    return id
  } catch {
    return crypto.randomUUID()
  }
})()

export { BookingError } from './TicketRepository'
export type { TicketRepository, PurchaseResult } from './TicketRepository'
