export const onlyDigits = (v: string) => v.replace(/\D/g, '')

export function maskPhone(v: string): string {
  const d = onlyDigits(v).slice(0, 11)
  if (d.length <= 2) return d.length ? `(${d}` : ''
  if (d.length <= 6) return `(${d.slice(0, 2)}) ${d.slice(2)}`
  if (d.length <= 10) return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`
  return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`
}

export function maskCpf(v: string): string {
  const d = onlyDigits(v).slice(0, 11)
  return d
    .replace(/^(\d{3})(\d)/, '$1.$2')
    .replace(/^(\d{3})\.(\d{3})(\d)/, '$1.$2.$3')
    .replace(/\.(\d{3})(\d)/, '.$1-$2')
}

export function isValidCpf(v: string): boolean {
  const d = onlyDigits(v)
  if (d.length !== 11 || /^(\d)\1{10}$/.test(d)) return false
  const calc = (len: number) => {
    let sum = 0
    for (let i = 0; i < len; i++) sum += Number(d[i]) * (len + 1 - i)
    const r = (sum * 10) % 11
    return r === 10 ? 0 : r
  }
  return calc(9) === Number(d[9]) && calc(10) === Number(d[10])
}

export const redactCpf = (v: string) => `***.***.${onlyDigits(v).slice(6, 9)}-${onlyDigits(v).slice(9)}`

export interface CheckoutFields {
  fullName: string
  email: string
  phone: string
  cpf: string
  acceptedSimulation: boolean
}

export type FieldErrors = Partial<Record<keyof CheckoutFields, string>>

const NAME_PART = /^[A-Za-zÀ-ÖØ-öø-ÿ'’-]{2,}$/

export function validateName(v: string): string | undefined {
  const parts = v.trim().split(/\s+/).filter(Boolean)
  if (!parts.length) return 'Informe seu nome completo.'
  if (parts.length < 2) return 'Informe nome e sobrenome.'
  if (!parts.every((p) => NAME_PART.test(p) || /^(da|de|do|das|dos|e)$/i.test(p)))
    return 'Use apenas letras no nome.'
  return undefined
}

export function validateCheckout(f: CheckoutFields): FieldErrors {
  const e: FieldErrors = {}
  const nameError = validateName(f.fullName)
  if (nameError) e.fullName = nameError
  if (!f.email.trim()) e.email = 'Informe seu e-mail.'
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(f.email.trim())) e.email = 'E-mail inválido.'
  const phone = onlyDigits(f.phone)
  if (!phone) e.phone = 'Informe seu telefone.'
  else if (phone.length < 10 || Number(phone.slice(0, 2)) < 11) e.phone = 'Telefone inválido. Inclua o DDD.'
  else if (phone.length === 11 && phone[2] !== '9') e.phone = 'Celular deve começar com 9 após o DDD.'
  if (f.cpf.trim() && !isValidCpf(f.cpf)) e.cpf = 'CPF inválido.'
  if (!f.acceptedSimulation) e.acceptedSimulation = 'Confirme que entende que a compra é fictícia.'
  return e
}
