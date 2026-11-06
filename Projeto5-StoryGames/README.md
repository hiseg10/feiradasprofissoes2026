# Story Games

Loja fictícia de jogos narrativos inspirada na **Steam**, criada pelos alunos do **2º ano do curso técnico em Desenvolvimento de Sistemas** para a **Feira das Profissões Florestan 2026**, em colaboração com o **1º ano de Marketing Digital**.

> Não somos afiliados à Steam. O catálogo é original e nenhum pagamento real é processado.

## O que o projeto faz

- **Catálogo** com 16 jogos narrativos originais, gêneros, tags, notas e descontos.
- **Busca e filtros** por texto, gênero, preço e ordenação.
- **Página do jogo** com descrição, destaques, requisitos, avaliações e jogos semelhantes.
- **Carrinho** com subtotal, descontos e finalização simulada.
- **Biblioteca** com lançador simulado e instalação fictícia.
- **Lista de desejos** para salvar jogos.
- **Perfil** com estatísticas e conquistas.
- **Recomendador com IA**: gênero + tempo + clima → três jogos do catálogo com explicação.
- **Persistência local** de carrinho, desejos, biblioteca e nome no `localStorage`.

## Stack

- Next.js 16 (App Router) + React 19 + TypeScript
- Tailwind CSS 4
- `localStorage` para a conta simulada (sem banco de dados)
- IA plugável: Gemini (padrão), DeepSeek ou Groq, com fallback local

## Rodando

```powershell
npm install
Copy-Item .env.example .env.local
npm run dev
```

Acesse `http://localhost:3000`.

**No Windows:** dê duplo clique em `run.bat`. Ele instala as dependências na primeira vez, cria o `.env.local` e inicia o app.

Sem chave de IA, o recomendador usa o **modo local**: escolhe os três jogos com uma pontuação baseada em gênero, duração, clima, nota e desconto.

## Variáveis de ambiente

| Variável | Para que serve |
|---|---|
| `IA_PROVIDER` | `gemini` (padrão), `deepseek` ou `groq` |
| `GEMINI_API_KEY` / `GEMINI_MODEL` | Chave e modelo do Gemini |
| `DEEPSEEK_API_KEY` / `DEEPSEEK_MODEL` | Chave e modelo da DeepSeek |
| `GROQ_API_KEY` / `GROQ_MODEL` | Chave e modelo da Groq |

## Estrutura

```
src/
  app/
    api/ia/recomendar/   recomendação com IA
    biblioteca/          jogos comprados e lançador
    carrinho/            carrinho e compra simulada
    descobrir/           formulário de recomendação
    jogo/[slug]/         página de cada jogo
    lista-desejos/       lista de desejos
    loja/                catálogo com filtros
    perfil/              conta simulada
    page.tsx             home
  components/
    Header, Footer, Hero, GameCard, PriceTag
    StoreExplorer, GameActions, CartView
    LibraryView, WishlistView, ProfileView
    RecommendationForm, ReviewList, ScreenshotGallery
    LojaProvider         contexto + localStorage
  lib/
    catalogo.ts          catálogo, tipos e requisitos
    recommend.ts         recomendador local
    ia.ts                camada plugável de IA
    format.ts            moeda e datas
```

## Catálogo

Os jogos são **fictícios** e foram criados para o projeto. Cada um tem:

- título, estúdio, publicadora e data de lançamento;
- gêneros, tags, nota, número de avaliações e conquistas;
- preço em centavos, desconto e duração média;
- capa em gradiente + emoji (sem imagens de terceiros);
- descrição, destaques, requisitos e duas avaliações.

Para adicionar um jogo, edite `src/lib/catalogo.ts` e preencha o objeto no array `JOGOS`.

## Como a IA é usada

1. O formulário de `/descobrir` envia gênero, duração e clima.
2. A API calcula três recomendações locais (sempre válidas).
3. Monta um contexto com o catálogo e pede uma explicação ao provedor de IA.
4. Se não houver chave ou a chamada falhar, retorna o texto do recomendador local.
5. A resposta inclui os slugs recomendados, usados para renderizar os cards.

## Backlog para os alunos

### Sprint 1 — Base
- [ ] Revisar textos e nomes do catálogo com Marketing
- [ ] Adicionar mais jogos e gêneros
- [ ] Melhorar acessibilidade (foco visível, contraste, teclado)
- [ ] Criar página "Sobre a loja"

### Sprint 2 — Experiência
- [ ] Adicionar carrossel de destaques
- [ ] Criar filtro por "em promoção" e "curtos"
- [ ] Adicionar ordenação por lançamento
- [ ] Permitir remover do carrinho na própria página do jogo

### Sprint 3 — IA e dados
- [ ] Melhorar o prompt com histórico de navegação
- [ ] Criar "modo presente": recomendar para outra pessoa
- [ ] Adicionar conquistas desbloqueáveis de verdade
- [ ] Persistir dados em banco (Turso) para múltiplos dispositivos

### Sprint 4 — Feira
- [ ] Modo quiosque na home
- [ ] QR code para a loja e para o recomendador
- [ ] Roteiro de demonstração de 3 minutos
- [ ] Plano B sem internet (tudo já funciona local)

## Colaboração com Marketing Digital

| Entregável | Responsável |
|---|---|
| Identidade visual e nome | Marketing |
| Textos da loja e dos jogos | Marketing + DS |
| Posts e reels de divulgação | Marketing |
| QR codes e materiais do estande | Marketing |
| Pesquisa com visitantes | Marketing |
| Catálogo, carrinho, biblioteca e IA | DS |
| Roteiro técnico do pitch | DS + Marketing |

## Deploy

1. Publique na Vercel.
2. Configure a chave do provedor de IA.
3. Rode `npm run build` antes de publicar.
4. Teste carrinho, biblioteca e recomendador no domínio publicado.

## Observações

- A "conta" fica no navegador; trocar de dispositivo começa do zero.
- Nenhum pagamento real é processado.
- O catálogo é original e não usa capas ou marcas de terceiros.
- A interface é inspirada na organização de lojas de jogos, sem copiar a Steam.
