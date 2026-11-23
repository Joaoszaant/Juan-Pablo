/**
 * Artistas homenageados/interpretados no espetáculo, apresentados apenas por pistas.
 * Os nomes ficam de fora de propósito (nem no código publicado aparecem).
 * IMPORTANTE: não são participações confirmadas dos artistas originais.
 *
 * Ordem (só para referência de quem edita): 1 MJ · 2 BB · 3 Adele · 4 Ney · 5 Ana Vitória · 6 TS
 */
export interface ArtistTribute {
  /** Título enigmático exibido no lugar do nome. */
  title: string
  /** Pista curta, sem revelar diretamente quem é. */
  hint: string
  style: string
  origin: string
}

export const ARTISTS: ArtistTribute[] = [
  {
    title: 'O Rei de uma Era',
    hint: 'Uma luva brilhante e passos que parecem desafiar a gravidade.',
    style: 'Pop',
    origin: 'Estados Unidos',
  },
  {
    title: 'Do Caribe para o Mundo',
    hint: 'Óculos escuros, reggaeton e um apelido que não combina com o temperamento.',
    style: 'Música urbana latina',
    origin: 'Caribe',
  },
  {
    title: 'A Voz que Conta os Anos',
    hint: 'Baladas de coração partido, com álbuns batizados pela idade em que nasceram.',
    style: 'Soul · Pop',
    origin: 'Reino Unido',
  },
  {
    title: 'O Bicho Selvagem do Palco',
    hint: 'Plumas, paetês e um falsete que desafia convenções desde os anos 70.',
    style: 'MPB',
    origin: 'Brasil',
  },
  {
    title: 'Duas Vozes, Um Só Nome',
    hint: 'Violão, delicadeza e canções sobre o amor que fica.',
    style: 'Pop · MPB',
    origin: 'Brasil',
  },
  {
    title: 'Uma Era de Cada Vez',
    hint: 'Treze é o número da sorte, e cada fase da carreira tem a sua cor.',
    style: 'Pop',
    origin: 'Estados Unidos',
  },
]
