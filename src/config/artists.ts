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
    title: 'A Lenda',
    hint: 'Começou criança, dividindo o palco com os irmãos. Terminou coroado sem nunca ter tido um trono.',
    style: 'Pop',
    origin: 'América do Norte',
  },
  {
    title: 'O Fenômeno',
    hint: 'Antes de lotar estádios, empacotava compras num supermercado. Nunca precisou trocar de idioma para conquistar o mundo.',
    style: 'Música latina',
    origin: 'Caribe',
  },
  {
    title: 'A Voz',
    hint: 'Saiu de uma escola de artes de Londres conhecida por revelar estrelas. Seus discos contam tempo, não faixas.',
    style: 'Soul',
    origin: 'Europa',
  },
  {
    title: 'O Ícone',
    hint: 'Foi artesão antes de subir ao palco. Ficou conhecido primeiro com o rosto pintado, e depois sem medo de mostrá-lo.',
    style: 'Música brasileira',
    origin: 'Brasil',
  },
  {
    title: 'O Encontro',
    hint: 'Vieram do Norte do país. O nome que as apresenta é a soma de quem canta.',
    style: 'Música brasileira',
    origin: 'Brasil',
  },
  {
    title: 'A Contadora de Histórias',
    hint: 'Regravou a própria obra para ter de volta o que era seu.',
    style: 'Pop',
    origin: 'América do Norte',
  },
]
