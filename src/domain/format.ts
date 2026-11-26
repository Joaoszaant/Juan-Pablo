import { EVENT } from '../config/event'

const currency = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: EVENT.pricing.currency })

export const formatMoney = (cents: number) => currency.format(cents / 100)

export const TBA = 'A anunciar'

export function formatEventDate(style: 'long' | 'short' = 'long'): string {
  if (!EVENT.date) return TBA
  const [y, m, d] = EVENT.date.split('-').map(Number)
  const date = new Date(y, m - 1, d)
  return date.toLocaleDateString('pt-BR', style === 'long'
    ? { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' }
    : { day: '2-digit', month: '2-digit', year: 'numeric' })
}

export const formatEventTime = () => (EVENT.time ? EVENT.time.replace(':00', 'h').replace(':', 'h') : TBA)

export function formatVenue(): string {
  const { name, city } = EVENT.venue
  if (!name && !city) return TBA
  return [name, city].filter(Boolean).join(' · ')
}

export const formatDateTime = (iso: string) =>
  new Date(iso).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' })
