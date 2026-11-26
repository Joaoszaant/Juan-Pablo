# The Last Dance · Juan Pablo

Site oficial do talk show musical **The Last Dance**, apresentado por Juan Pablo. Tem divulgação do espetáculo,
mapa de assentos, compra de ingressos (simulada, sem pagamento), ingresso digital com QR Code em PNG/PDF e
consulta de ingresso por código.

> Os ingressos são fictícios: nenhum pagamento é solicitado ou processado.

**Data:** 27/11/2026 · **Horário:** 13h · **Local:** Auditório do CEFET/RJ, Campus Nova Iguaçu

---

## Sumário

1. [Tecnologias](#tecnologias)
2. [Estrutura de pastas](#estrutura-de-pastas)
3. [Rodar no computador](#rodar-no-computador)
4. [Configurar o banco (Supabase)](#configurar-o-banco-supabase)
5. [Publicar no GitHub Pages](#publicar-no-github-pages)
6. [Onde editar o conteúdo](#onde-editar-o-conteúdo)
7. [Administração](#administração)
8. [Regras do sistema de ingressos](#regras-do-sistema-de-ingressos)

---

## Tecnologias

React 19 · TypeScript · Vite · Tailwind CSS v4 · Supabase (Postgres) · Lucide · qrcode · html-to-image · jsPDF.
Fontes locais via `@fontsource` (Limelight, Playfair Display, Cormorant Garamond, Josefin Sans).

## Estrutura de pastas

```
.
├── index.html                  Página de entrada (o Vite monta o site a partir dela)
├── public/                     Arquivos copiados sem alteração (favicon, foto de Juan Pablo)
├── src/
│   ├── main.tsx                Ponto de partida do React
│   ├── App.tsx                 Ordem das seções da página
│   ├── index.css               Tema: cores, fontes, botões, assentos, texturas
│   ├── config/                 ← CONTEÚDO EDITÁVEL
│   │   ├── event.ts            Nome, data, horário, local, preço, limites
│   │   ├── seating.ts          Fileiras e lugares do auditório
│   │   └── artists.ts          Pistas dos artistas homenageados
│   ├── sections/               Seções da página (Hero, Espetáculo, Artistas, Juan Pablo, Ingressos, Consulta)
│   ├── booking/                Mapa de assentos, resumo da seleção, formulário, confirmação
│   ├── tickets/                Ingresso digital e exportação PNG/PDF
│   ├── components/             Navbar, rodapé e ornamentos visuais
│   ├── domain/                 Regras: assentos, IDs, validação, formatação, tipos
│   ├── services/               Acesso a dados (Supabase ou localStorage)
│   └── hooks/                  Hooks React reutilizáveis
├── supabase/
│   ├── schema.sql              Cria tabelas, funções e permissões (rodar 1x)
│   └── reset.sql               Zera compras, ingressos e reservas
├── .github/workflows/deploy.yml  Publicação automática no GitHub Pages
└── .env.example                Modelo das variáveis de ambiente
```

## Rodar no computador

Requisito: Node.js 20 ou superior.

```bash
npm install
cp .env.example .env    # preencha com os dados do Supabase (opcional, veja abaixo)
npm run dev             # abre em http://localhost:5173
```

Sem o `.env`, o site funciona em **modo local**: as compras ficam salvas só no seu navegador. Isso serve para testar.

| Comando | O que faz |
|---|---|
| `npm run dev` | Servidor de desenvolvimento |
| `npm run build` | Verifica os tipos e gera o site final em `dist/` |
| `npm run preview` | Serve o conteúdo de `dist/` para conferência |
| `npm run lint` | Análise estática do código |

## Configurar o banco (Supabase)

O banco guarda quem tem cada lugar, e todos os visitantes veem o mesmo mapa.

1. Crie um projeto grátis em [supabase.com](https://supabase.com).
2. Abra o **SQL Editor**, cole todo o conteúdo de `supabase/schema.sql` e clique em **Run**. Depois, numa nova query, faça o mesmo com `supabase/migration-002-restricoes.sql`.
3. Em **Project Settings → API**, copie a **Project URL** e a chave **anon public**.
4. Coloque esses dois valores no `.env` (para rodar no computador) e nos secrets do GitHub (para publicar).

> ⚠️ Use só a chave **anon**. A chave `service_role` dá acesso total ao banco e nunca pode ir para o código nem
> para o GitHub.

## Publicar no GitHub Pages

> O `index.html` deste repositório é o código-fonte e **não abre sozinho**. Quem monta o site final é o GitHub
> Actions, a cada push. Não use a opção "Deploy from a branch".

1. Crie um repositório no GitHub e envie o projeto:
   ```bash
   git remote add origin https://github.com/SEU-USUARIO/SEU-REPOSITORIO.git
   git push -u origin main
   ```
2. No repositório: **Settings → Secrets and variables → Actions → New repository secret**. Crie dois:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
3. **Settings → Pages → Build and deployment → Source: GitHub Actions**.
4. Em **Actions**, rode o workflow **Deploy** (ou faça um novo push). O endereço aparece ao final:
   `https://SEU-USUARIO.github.io/SEU-REPOSITORIO/`.

Depois disso, cada push na branch `main` publica o site de novo automaticamente.

## Onde editar o conteúdo

| O quê | Arquivo |
|---|---|
| Nome do espetáculo, data, horário, local, limite por compra, tempo de reserva | `src/config/event.ts` |
| Preço (oculto por padrão: `showPrices: false`) | `src/config/event.ts` |
| Foto de Juan Pablo | coloque em `public/` e preencha `hostPhoto` em `src/config/event.ts` |
| Fileiras e lugares | `src/config/seating.ts` |
| Pistas dos artistas | `src/config/artists.ts` |

Campos `null` aparecem no site como "A anunciar".

## Administração

- **Quem está em cada lugar:** Supabase → **Table Editor** → view `ocupacao` (assento, nome no ingresso, comprador,
  e-mail, telefone, código do ingresso). Só aparece para você: visitantes não têm acesso.
- **Zerar o banco:** rode `supabase/reset.sql` no SQL Editor. Essa ação apaga tudo e não pode ser desfeita.
- **Cancelar um ingresso:** no Table Editor, mude `status` do ingresso para `cancelled`. O lugar volta a ficar livre.

## Regras do sistema de ingressos

- 276 lugares: 17 fileiras (A–Q) em cada lado do corredor. O palco fica junto à fileira Q.
- Numeração contínua da esquerda para a direita: lado esquerdo 1..n, lado direito n+1..2n (ex.: A1–A8 | A9–A16).
- Estados do assento: disponível, selecionado, em processo de compra e ocupado.
- Ao clicar em **Continuar**, os lugares ficam reservados por 10 minutos.
- O banco aceita **um único ingresso válido por assento**, e reservas e compras são feitas sob trava, então
  não há venda duplicada mesmo com cliques simultâneos.
- IDs únicos no formato `JP-XXXX-XXXX`, sem caracteres ambíguos.
- O CPF é opcional, validado e guardado só mascarado (`***.***.123-45`).
- Limite de 4 ingressos por pessoa (mesmo e-mail **ou** mesmo telefone), verificado no banco. Para mudar, altere
  `_max_tickets_per_person` em `supabase/migration-002-restricoes.sql` (e rode de novo) e `maxTicketsPerPerson` em `src/config/event.ts`.
- A consulta de ingresso exige o **código e o e-mail** de quem comprou; só o código não abre o ingresso.
- Os lugares do mapa são **ilustrativos**: no dia, os assentos são livres. O aviso aparece no mapa, no checkout e no ingresso.
