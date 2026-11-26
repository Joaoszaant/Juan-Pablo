/**
 * CONFIGURAÇÃO CENTRAL DO ESPETÁCULO
 * ------------------------------------------------------------------
 * Tudo que ainda não foi definido oficialmente fica aqui.
 * Campos `null` aparecem no site como "a anunciar".
 * Altere apenas este arquivo para publicar as informações definitivas.
 */

export interface EventConfig {
  /** Nome do espetáculo. Provisório até a definição oficial. */
  showName: string
  /** Nome alternativo considerado (apenas referência). */
  alternativeShowName: string
  /** Quando true, exibe um aviso discreto de título provisório. */
  showNameIsProvisional: boolean
  host: string
  tagline: string
  intro: string
  /** Data no formato ISO `YYYY-MM-DD`. */
  date: string | null
  /** Horário de início `HH:MM`. */
  time: string | null
  /** Abertura das portas `HH:MM`. */
  doorsOpen: string | null
  venue: {
    name: string | null
    address: string | null
    city: string | null
  }
  pricing: {
    /** Valor unitário em centavos. */
    unitPriceCents: number
    currency: 'BRL'
    /** Quando true, o site indica que o valor é provisório. */
    isPlaceholder: boolean
    /** Quando false, nenhum valor aparece no site (entrada sem preço). */
    showPrices: boolean
  }
  /** Limite de ingressos por compra. */
  maxSeatsPerOrder: number
  /** Limite total por pessoa (mesmo e-mail ou telefone). No Supabase, ajuste também em migration-002. */
  maxTicketsPerPerson: number
  /** Minutos em que os assentos ficam reservados durante o checkout. */
  holdMinutes: number
  /** Prefixo dos IDs de ingresso (ex.: JP-7K2M-Q9XA). */
  ticketIdPrefix: string
  /** Caminho/URL de uma foto de Juan Pablo (ex.: '/juan-pablo.jpg'). */
  hostPhoto: string | null
  /** Classificação indicativa, quando definida. */
  ageRating: string | null
}

export const EVENT: EventConfig = {
  showName: 'The Last Dance',
  alternativeShowName: 'Sonho Musical',
  showNameIsProvisional: true,
  host: 'Juan Pablo',
  tagline: 'Uma noite. Grandes artistas. Uma história para contar.',
  intro:
    'Prepare-se para uma experiência que une música, entretenimento, entrevistas e performances inesquecíveis. Juan Pablo recebe grandes nomes da música em um espetáculo que celebra a arte, os encontros e as emoções.',

  date: '2026-11-27',
  time: '13:00',
  doorsOpen: null,
  venue: { name: 'Auditório do CEFET/RJ', address: null, city: 'Campus Nova Iguaçu' },

  // Preços ocultos. Para exibir, defina unitPriceCents e showPrices: true.
  pricing: { unitPriceCents: 0, currency: 'BRL', isPlaceholder: false, showPrices: false },

  maxSeatsPerOrder: 4,
  maxTicketsPerPerson: 4,
  holdMinutes: 10,
  ticketIdPrefix: 'JP',
  hostPhoto: null,
  ageRating: null,
}
