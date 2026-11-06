# Bolsa Fácil

Projeto educativo de mercado financeiro para o cidadão comum, desenvolvido pelos alunos do **2º ano do curso técnico em Desenvolvimento de Sistemas** para a **Feira das Profissões Florestan 2026**, em colaboração com o **1º ano de Marketing Digital**.

> Conteúdo educativo. Não é recomendação de investimento.

## O que o projeto faz

- **Painel de mercado**: cotações de ações e FIIs com atualização automática.
- **Indicadores macro**: Selic, CDI e IPCA.
- **Trilhas educativas**: renda fixa, renda variável, risco, juros compostos e prevenção a golpes.
- **Glossário** com 16 termos traduzidos do "economês".
- **Comparador** de investimentos por risco, liquidez, retorno e perfil ideal.
- **Simulador de juros compostos** com aportes mensais e cenários.
- **Quiz gamificado** com explicação em cada resposta.
- **Curador com IA**: chat que recebe os dados do painel e explica em linguagem simples.

## Stack

- Next.js 16 (App Router) + React 19 + TypeScript
- Tailwind CSS 4
- APIs de dados: [brapi.dev](https://brapi.dev) e [Banco Central do Brasil](https://dadosabertos.bcb.gov.br)
- IA plugável: Gemini (padrão), DeepSeek ou Groq

## Rodando

```powershell
npm install
Copy-Item .env.example .env.local
npm run dev
```

Acesse `http://localhost:3000`.

**No Windows:** dê duplo clique em `run.bat`. Ele instala as dependências na primeira vez, cria o `.env.local` se necessário e inicia o app.

Sem `BRAPI_TOKEN` e sem chave de IA, o app funciona em **modo demonstração**: dados simulados e respostas locais do curador.

## Variáveis de ambiente

| Variável | Para que serve |
|---|---|
| `BRAPI_TOKEN` | Cotações reais da brapi.dev (plano gratuito) |
| `IA_PROVIDER` | `gemini` (padrão), `deepseek` ou `groq` |
| `GEMINI_API_KEY` / `GEMINI_MODEL` | Chave e modelo do Google Gemini |
| `DEEPSEEK_API_KEY` / `DEEPSEEK_MODEL` | Chave e modelo da DeepSeek |
| `GROQ_API_KEY` / `GROQ_MODEL` | Chave e modelo da Groq |

**Nunca** coloque chaves em variáveis `NEXT_PUBLIC_*` nem no código do cliente. Todas as chamadas de IA passam por rotas de servidor.

## APIs do projeto

| Rota | Método | Descrição |
|---|---|---|
| `/api/mercado/cotacoes` | GET | Cotações. Aceita `?tickers=PETR4,VALE3` |
| `/api/mercado/indicadores` | GET | Selic, CDI e IPCA |
| `/api/ia/curador` | POST | Recebe `{ historico: [{ papel, texto }] }` |

### Exemplo de resposta de cotações

```json
{
  "cotacoes": [
    {
      "simbolo": "PETR4",
      "nome": "Petrobras PN",
      "preco": 38.42,
      "variacaoPercentual": 1.48,
      "fonte": "brapi",
      "historico": [36.9, 37.2, 37.8, 38.42]
    }
  ],
  "fonte": "brapi",
  "atualizadoEm": "2026-11-04T12:00:00.000Z"
}
```

## Estrutura

```
src/
  app/
    api/                 rotas de mercado e IA
    aprender/            trilhas e glossário
    comparar/            comparador de investimentos
    curador/             chat com IA
    quiz/                quiz gamificado
    simulador/           simulador de juros compostos
    termos/              termos e privacidade
  components/            Header, TickerTape, Gráfico, Chat, Quiz, Simulador
  lib/
    mercado.ts           integração brapi + Banco Central + fallback
    ia.ts                camada plugável de IA
    conteudo.ts          trilhas, glossário, comparativo e quiz
    mock.ts              dados de demonstração
```

## Como a IA é usada

1. A rota `/api/ia/curador` coleta cotações e indicadores no servidor.
2. Monta um contexto textual com os dados e o envia junto do histórico.
3. O provedor responde seguindo um system prompt educativo, com proibição de recomendação.
4. Sem chave ou em caso de falha, cai em um **modo local baseado em regras**.

Para trocar de provedor, basta mudar `IA_PROVIDER` no `.env.local`.

## Backlog para os alunos

### Sprint 1 — Base
- [ ] Revisar textos das trilhas com a squad de Marketing
- [ ] Adicionar mais ativos à watchlist
- [ ] Melhorar acessibilidade (foco visível, contraste, leitores de tela)
- [ ] Criar página "Sobre o projeto"

### Sprint 2 — Dados
- [ ] Implementar cache com revalidação e tratamento de limite da brapi
- [ ] Adicionar gráfico histórico de 1 mês por ativo
- [ ] Incluir alerta de "dados de demonstração" mais visível
- [ ] Criar testes para o fallback de APIs

### Sprint 3 — IA e experiência
- [ ] Adicionar sugestões de perguntas por trilha
- [ ] Permitir que o curador cite a fonte dos dados
- [ ] Criar modo "professor" com perguntas guiadas
- [ ] Registrar métricas de uso no estande (sem dados pessoais)

### Sprint 4 — Feira
- [ ] Modo quiosque (tela cheia, sem navegação)
- [ ] QR code para o site e para o quiz
- [ ] Roteiro de demonstração de 3 minutos
- [ ] Plano B para internet instável (dados mock)

## Colaboração com Marketing Digital

| Entregável | Responsável |
|---|---|
| Identidade visual e logo | Marketing |
| Copy da landing e das trilhas | Marketing + DS |
| Personas e pesquisa com visitantes | Marketing |
| Posts e reels de divulgação | Marketing |
| QR codes e materiais do estande | Marketing |
| Implementação e deploy | DS |
| Roteiro técnico do pitch | DS + Marketing |

## Deploy

1. Publique na Vercel.
2. Configure `BRAPI_TOKEN` e a chave do provedor de IA.
3. Rode `npm run build` antes para garantir que não há erros.
4. Teste o chat e o painel no domínio publicado.

## Licença e uso

Projeto escolar sem fins comerciais. Respeite os termos de uso das APIs externas e cite as fontes na apresentação.
