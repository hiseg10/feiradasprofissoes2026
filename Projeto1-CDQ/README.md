# Classificados do Deus Quer (CDQ)

Classificados de bairro: login com Google, aprovação de moradores pela equipe, publicação de anúncios com fotos, moderação e impulsionamento pago de anúncios.

## Recursos

- **Login com Google** (OAuth 2.0) e sessão em cookie assinado.
- **Aprovação para entrar**: todo novo usuário fica pendente até a equipe aprovar.
- **Publicação com moderação**: anúncio novo entra como “Em análise” e só aparece após aprovação.
- **Equipe admin**: aprova/bloqueia usuários, aprova/rejeita anúncios, promove outros admins.
- **Anúncios**: fotos (até 5), título, descrição, preço, categoria, condição, bairro e WhatsApp.
- **Busca e filtros** por texto e categoria.
- **Destaque (impulsionamento)**: morador solicita, a equipe confirma o pagamento (Pix) e o anúncio fica no topo por 3, 7, 15 ou 30 dias. Preço por dia configurável.
- **Meus anúncios**: editar, marcar como vendido e excluir.

## Tecnologias

- Next.js 16 (App Router) + React 19 + TypeScript
- Tailwind CSS 4
- libSQL (arquivo local ou Turso)
- Vercel Blob para fotos em produção (opcional; local usa `public/uploads`)
- OAuth do Google implementado nas rotas `/api/auth/google`

## Rodando localmente

```bash
npm install
npm run dev

```

Acesse http://localhost:3000. No ambiente de desenvolvimento aparece o botão **“Entrar como equipe (dev)”** — ele entra como administrador sem precisar do Google.

**No Windows:** dê duplo clique em `run.bat`. Ele instala as dependências na primeira vez, cria o `.env.local` se necessário e inicia o app.

O banco é criado em `data/cdq.db` e, com `SEED_DEMO=1`, inclui anúncios e usuários de exemplo.

## Variáveis de ambiente

| Variável | Descrição |
|---|---|
| `DATABASE_URL` | `file:./data/cdq.db` (local) ou `libsql://...` (Turso) |
| `DATABASE_AUTH_TOKEN` | Token do Turso |
| `AUTH_SECRET` | Segredo para assinar a sessão (string aleatória longa) |
| `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` | Credenciais OAuth do Google |
| `ADMIN_EMAILS` | E-mails que entram como admin (separados por vírgula) |
| `DEV_LOGIN` | `1` habilita o login de teste (apenas em desenvolvimento) |
| `SEED_DEMO` | `1` cria dados de exemplo no primeiro acesso |
| `BLOB_READ_WRITE_TOKEN` | Token do Vercel Blob para fotos em produção |

Copie `.env.example` para `.env.local` e ajuste. **Nunca** versione o `.env.local`.

## Configurando o login com Google

1. No [Google Cloud Console](https://console.cloud.google.com/), crie um projeto.
2. Ative **APIs e serviços → Credenciais → OAuth 2.0**.
3. Crie um **ID do cliente OAuth** do tipo “Aplicativo da Web”.
4. Em **URIs de redirecionamento autorizados**, adicione:
   - `http://localhost:3000/api/auth/google/callback`
   - `https://SEU-DOMINIO/api/auth/google/callback`
5. Copie o Client ID e o Client Secret para `GOOGLE_CLIENT_ID` e `GOOGLE_CLIENT_SECRET`.

**Primeiro admin em produção:** coloque o e-mail Google de quem vai administrar em `ADMIN_EMAILS`. Ao entrar, essa conta já nasce aprovada como admin. Depois ela pode promover outras pessoas pelo painel.

## Fluxo de aprovação

1. Morador entra com Google → conta fica **pendente**.
2. Admin aprova em **Admin → Usuários**.
3. Morador publica um anúncio → fica **Em análise**.
4. Admin aprova em **Admin → Anúncios**.
5. Anúncio aparece no feed. O morador pode solicitar **destaque**.
6. Admin confirma o pagamento em **Admin → Impulsionamentos**.

## Deploy (Vercel + Turso)

1. Crie um banco no [Turso](https://turso.tech) e copie a URL (`libsql://...`) e um token.
2. Publique o projeto na Vercel.
3. Configure as variáveis: `DATABASE_URL`, `DATABASE_AUTH_TOKEN`, `AUTH_SECRET`, `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `ADMIN_EMAILS`.
4. Para fotos, crie um **Vercel Blob** e configure `BLOB_READ_WRITE_TOKEN` (sem isso, o upload local não funciona na Vercel).
5. Ajuste a URI de callback do Google para o domínio publicado.
6. Faça o deploy. As tabelas são criadas automaticamente no primeiro acesso.

## Observações

- Sem `BLOB_READ_WRITE_TOKEN`, as fotos são salvas em `public/uploads` (bom para local, não persiste na nuvem).
- O app bloqueia o uso de banco em arquivo quando detecta ambiente Vercel, para evitar perda de dados.
- LGPD: o app guarda nome, e-mail e foto pública do Google, além do WhatsApp informado nos anúncios.
- Não use a marca “OLX” no nome ou na divulgação.
