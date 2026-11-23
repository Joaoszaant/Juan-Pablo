# The Last Dance · Juan Pablo — site oficial (simulação)

Site de divulgação e **venda fictícia** de ingressos do talk show musical de Juan Pablo.
Nenhum pagamento é solicitado ou processado; os ingressos não têm valor comercial.

## Rodar

```bash
npm install
npm run dev      # desenvolvimento
npm run build    # produção (gera /dist)
npm run preview  # serve o build
```

Stack: React 19 + TypeScript + Vite + Tailwind CSS v4 + Lucide + `qrcode` + `html-to-image` + `jspdf`.
Fontes servidas localmente via `@fontsource` (Limelight, Playfair Display, Cormorant Garamond, Josefin Sans).

## Banco de dados (Supabase)

Quem tem cada lugar fica gravado no Supabase, compartilhado entre todos os visitantes.

1. Crie um projeto grátis em supabase.com.
2. No **SQL Editor**, rode `supabase/schema.sql` inteiro.
3. Em **Project Settings → API**, copie a *Project URL* e a chave **anon**.
4. Local: copie `.env.example` para `.env` e preencha. `npm run dev`.
5. GitHub Pages: em *Settings → Secrets and variables → Actions*, crie `VITE_SUPABASE_URL` e
   `VITE_SUPABASE_ANON_KEY`; em *Settings → Pages*, escolha **GitHub Actions**. Cada push na `main` publica
   (`.github/workflows/deploy.yml`).

Sem essas variáveis o site funciona em modo local (localStorage, dados só no navegador).

**Ver quem está em cada lugar:** Supabase → *Table Editor* → view `ocupacao` (assento, nome no ingresso,
comprador, e-mail, telefone, código). Só você vê isso: o público não tem acesso às tabelas.

**Zerar o banco:** rode `supabase/reset.sql` no SQL Editor (apaga compras, ingressos e reservas).

Garantias no banco: um único ingresso válido por assento (índice único), reservas e compras sob trava
(sem venda duplicada mesmo com cliques simultâneos), consulta pública sem e-mail/telefone.

## Onde editar

| O quê | Arquivo |
|---|---|
| Nome do espetáculo, data, horário, local, preço, limite por compra, tempo de reserva, foto de Juan Pablo | `src/config/event.ts` |
| Layout das fileiras / simulação de vendas prévias | `src/config/seating.ts` |
| Artistas homenageados | `src/config/artists.ts` |

Campos `null` aparecem no site como "A anunciar". Preços ficam ocultos (`showPrices: false`). Para exibir, defina `unitPriceCents` e `showPrices: true`.

> O briefing cita 139 lugares por lado/278 no total, mas 11×8 + 4×9 + 1×8 + 1×6 = **138 por lado / 276**.
> O mapa segue as fileiras descritas. Para corrigir, ajuste `SIDE_ROW_SEATS`.

## Arquitetura

```
src/
  config/      configuração central (evento, assentos, artistas)
  domain/      tipos, geração do mapa, IDs, validação, formatação
  services/    TicketRepository (interface) + LocalStorageTicketRepository
  hooks/       snapshot de assentos, reveal, media query, contagem regressiva
  sections/    Hero, About, Artists, Host, Tickets, Lookup
  booking/     SeatMap, SelectionPanel, CheckoutForm, Confirmation
  tickets/     TicketCard (ingresso), exportação PNG/PDF
```

Camada de dados: `TicketRepository` com duas implementações (`SupabaseTicketRepository` e `LocalStorageTicketRepository`), escolhida em `src/services/index.ts`.

### Regras de negócio implementadas
- Numeração: fileiras A–Q (A mais próxima do palco); lado esquerdo 1..n, lado direito n+1..2n (ex.: A1–A8 / A9–A16).
- Estados: disponível, selecionado, em processo de compra (reserva temporária) e ocupado.
- Ao clicar em CONTINUAR, os assentos ficam reservados por `holdMinutes` (visível como "em processo de compra" em outras abas).
- Compra revalida disponibilidade imediatamente antes de gravar → sem venda duplicada do mesmo assento.
- IDs únicos `JP-XXXX-XXXX` (alfabeto sem caracteres ambíguos), verificados contra os existentes.
- CPF opcional, validado por dígito verificador; armazenado apenas mascarado.
- Sincronização entre abas via evento `storage`.
- Acessibilidade: navegação do mapa por setas (roving tabindex), `aria-pressed`, rótulos por assento, `prefers-reduced-motion`.
