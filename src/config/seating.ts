/**
 * LAYOUT DO AUDITÓRIO
 * ------------------------------------------------------------------
 * Quantidade de lugares de cada fileira de UM lado da sala,
 * da fileira mais próxima do palco (A) para a mais distante.
 * O mesmo layout é espelhado no lado direito.
 *
 * Conforme o briefing: 11 fileiras de 8, 4 de 9, 1 de 8 e 1 de 6.
 * Atenção: essa soma dá 138 lugares por lado (276 no total),
 * e não 139/278 como citado no briefing. Ajuste aqui se necessário.
 */
export const SIDE_ROW_SEATS: number[] = [
  8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, // A–K
  9, 9, 9, 9, //                       L–O
  8, //                                P
  6, //                                Q
]

/**
 * Simulação de vendas anteriores, para o mapa não começar vazio.
 * Gerado de forma determinística (mesma semente = mesmo resultado).
 * Desative com `enabled: false` quando houver backend real.
 */
export const HOUSE_SIMULATION = {
  enabled: false,
  seed: 1987,
  occupiedRatio: 0.18,
  heldRatio: 0.025,
}
