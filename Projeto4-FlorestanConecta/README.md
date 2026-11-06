# Florestan Conecta

Guia digital de turismo, comércio e cultura local, com roteiros sugeridos por IA. Projeto da **Feira das Profissões Florestan 2026**, desenvolvido pelo **2º ano do curso técnico em Desenvolvimento de Sistemas** em colaboração com o **1º ano de Marketing Digital**.

## O que o projeto faz

- **Explorar pontos**: busca por texto e filtro por categoria (Comer, Artesanato, Turismo, Serviços e Agro).
- **Página de cada ponto**: descrição, endereço, horário, telefone, dica e tags.
- **QR code** por ponto para divulgação no estande e no comércio.
- **Mapa**: link direto para o Google Maps com o endereço.
- **Guia com IA**: chat que monta roteiros curtos usando apenas os pontos cadastrados.
- **Modo local**: sem chave de IA, o guia responde com sugestões baseadas na lista.

## Stack

- Next.js 16 (App Router) + React 19 + TypeScript
- Tailwind CSS 4
- IA plugável: Gemini (padrão), DeepSeek ou Groq
- QR codes via `api.qrserver.com`

## Rodando

```powershell
npm install
Copy-Item .env.example .env.local
npm run dev
```

Acesse `http://localhost:3000`.

**No Windows:** dê duplo clique em `run.bat`. Ele instala as dependências na primeira vez, cria o `.env.local` se necessário e inicia o app.

## Variáveis de ambiente

| Variável | Para que serve |
|---|---|
| `IA_PROVIDER` | `gemini` (padrão), `deepseek` ou `groq` |
| `GEMINI_API_KEY` / `GEMINI_MODEL` | Chave e modelo do Gemini |
| `DEEPSEEK_API_KEY` / `DEEPSEEK_MODEL` | Chave e modelo da DeepSeek |
| `GROQ_API_KEY` / `GROQ_MODEL` | Chave e modelo da Groq |

## API

### `POST /api/ia/guia`

Recebe o histórico da conversa:

```json
{
  "historico": [
    { "papel": "user", "texto": "Monte um roteiro de 2 horas para mim" }
  ]
}
```

Resposta:

```json
{
  "resposta": "Sugiro começar pelo Café do Bairro...",
  "provedor": "gemini",
  "modelo": "gemini-2.5-flash",
  "usadoFallback": false
}
```

## Estrutura

```
src/
  app/
    api/ia/guia/          rota do guia com IA
    guia/                 página do chat
    pontos/[slug]/        detalhe de cada ponto
    page.tsx              landing + explorar
  components/             Header, Explorar, ChatGuia, QRCodePonto
  lib/
    conteudo.ts           pontos, categorias, cores e contexto da IA
    ia.ts                 camada plugável de IA e fallback local
```

## Dados de demonstração

Os pontos em `src/lib/conteudo.ts` são **fictícios** e servem de modelo. Antes da feira:

1. Convidem os comerciantes reais do bairro.
2. Peçam autorização para divulgar nome, endereço e telefone.
3. Substituam os dados e confiram horários.
4. Tirem fotos (com autorização) e troquem os emojis/gradientes por imagens, se quiserem.

## Backlog para os alunos

### Sprint 1 — Base
- [ ] Substituir os dados fictícios por parceiros reais
- [ ] Revisar os textos com a squad de Marketing
- [ ] Criar página "Sobre o projeto"
- [ ] Melhorar acessibilidade e contraste

### Sprint 2 — Descoberta
- [ ] Adicionar filtro por "aberto agora"
- [ ] Criar ordenação por destaque e proximidade
- [ ] Adicionar página de categorias
- [ ] Integrar mapa incorporado (Leaflet ou OpenStreetMap)

### Sprint 3 — IA e QR
- [ ] Melhorar o prompt do guia com tempo disponível e perfil do visitante
- [ ] Gerar QR codes localmente (sem serviço externo)
- [ ] Criar roteiros prontos para 1h, 2h e 4h
- [ ] Adicionar botão "copiar roteiro" e "compartilhar no WhatsApp"

### Sprint 4 — Feira
- [ ] Modo quiosque no estande
- [ ] QR codes impressos para cada parceiro
- [ ] Roteiro de demonstração de 3 minutos
- [ ] Formulário de avaliação para visitantes

## Colaboração com Marketing Digital

| Entregável | Responsável |
|---|---|
| Identidade visual e nome | Marketing |
| Fotos e textos dos parceiros | Marketing |
| Posts e reels de divulgação | Marketing |
| QR codes e mapa impresso do estande | Marketing |
| Pesquisa com visitantes | Marketing |
| Plataforma, IA e deploy | DS |
| Roteiro técnico do pitch | DS + Marketing |

## Deploy

1. Publique na Vercel.
2. Configure a chave do provedor de IA.
3. Rode `npm run build` antes de publicar.
4. Teste o QR code no domínio publicado.

## Observações

- Confirme horários e contatos antes de divulgar.
- Respeite a LGPD: peça autorização para divulgar telefone e fotos.
- O guia de IA não inventa lugares: ele usa a lista cadastrada.
- O QR code usa um serviço externo; se a internet falhar, mostre o link impresso como plano B.
