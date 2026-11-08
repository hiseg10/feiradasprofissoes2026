# Tutorial de Git — do commit ao deploy

Este tutorial explica, passo a passo, o fluxo que usamos para subir as mudanças
do **Sabor do Florestan** até a `main` e disparar o deploy na Vercel. Serve tanto
para repetir o processo quanto para entender o porquê de cada comando.

> Ambiente de referência: Windows + PowerShell 5.1, repositório
> `hiseg10/feiradasprofissoes2026`, projetos em subpastas (ex.:
> `Projeto6-SaborDoFlorestan`).

---

## 1. Conceitos rápidos

| Conceito | O que é |
| --- | --- |
| **Repositório** | Pasta versionada pelo Git (aqui, a raiz `FeiraProfissoes2026`). |
| **Branch** | Linha independente de trabalho. A `main` é a principal. |
| **Commit** | Foto do projeto em um momento, com mensagem. |
| **Remote (`origin`)** | Cópia no GitHub (`https://github.com/hiseg10/feiradasprofissoes2026.git`). |
| **Push** | Envia commits locais para o remote. |
| **Pull** | Traz commits do remote para o local. |
| **PR (Pull Request)** | Pedido para juntar uma branch na `main`, com revisão e CI. |
| **CI** | Verificações automáticas (lint, build) que rodam no GitHub Actions. |
| **Branch protegida** | Regras que impedem push direto e exigem PR/aprovação/CI. |

---

## 2. Antes de começar: conferir o estado

Sempre comece olhando onde você está e o que mudou:

```powershell
git status            # arquivos modificados/novos
git branch --show-current
git log --oneline -10 # últimos commits
git diff --stat       # resumo das mudanças
```

O ideal é criar uma branch nova a partir da `main` atualizada:

```powershell
git checkout main
git pull --ff-only origin main
git checkout -b fix/descricao-curta
```

> Neste trabalho usamos a branch `fix/sabor-confirmar-pagamento`, já existente.

Boas práticas de nome de branch:

- `feat/...` para funcionalidade nova
- `fix/...` para correção
- `docs/...` para documentação
- `chore/...` para tarefas internas

---

## 3. Stage e commit

### Ver o que vai entrar

```powershell
git status
git diff            # mudanças ainda não preparadas
```

### Adicionar arquivos

```powershell
git add Projeto6-SaborDoFlorestan
# ou arquivo por arquivo:
git add caminho/do/arquivo.ts
```

> Evite `git add .` sem olhar o `git status`: você pode commitar arquivos
> indesejados. Neste repositório `data/` e `.env*` já estão no `.gitignore`.

### Criar o commit

```powershell
git commit -m "Adiciona fluxo de pedidos, autoatendimento e permissoes por cargo"
```

Uma boa mensagem de commit:

- curta, no imperativo ("Adiciona", "Corrige", "Atualiza");
- diz **o que** e, se preciso, **por quê**;
- um assunto por commit quando possível.

### Antes de commitar: lint e build

```powershell
npm run lint
npm run build
```

No CI do repositório (`.github/workflows/ci.yml`) rodam `npm ci`, `npm run lint`
e `npm run build` para cada projeto alterado. Se falhar localmente, vai falhar
no PR.

---

## 4. Enviar para o GitHub

```powershell
git push origin fix/sabor-confirmar-pagamento
```

Se for a primeira vez da branch:

```powershell
git push -u origin fix/sabor-confirmar-pagamento
```

---

## 5. Abrir o Pull Request

### Opção A — pela interface web

1. Abra o repositório no GitHub.
2. Clique em **Compare & pull request** (ou **Pull requests → New**).
3. Base: `main` · Compare: `fix/sabor-confirmar-pagamento`.
4. Escreva título e descrição (o que mudou, como testar).
5. Clique em **Create pull request**.

### Opção B — com GitHub CLI (`gh`)

Instalação no Windows:

```powershell
winget install GitHub.cli
gh auth login
```

Criar o PR:

```powershell
gh pr create --base main --head fix/sabor-confirmar-pagamento --title "Titulo" --body "Descricao"
gh pr view --web        # abre no navegador
gh pr checks            # acompanha o CI
```

> Neste trabalho o `gh` não estava instalado; usamos a interface web e, para
> automação, a API REST do GitHub (`https://api.github.com`). A API é opcional:
> tudo é possível pela web.

---

## 6. CI e revisão

Depois do push, o GitHub roda o CI. No PR você vê:

- **Checks**: cada projeto alterado (CDQ, Bolsa Fácil, …, Sabor) com lint/build.
- **Review required**: a régua de proteção da `main`.

A regra do repositório ("Proteção da main") exige:

- **1 aprovação** de alguém com acesso de escrita;
- o check **CI** aprovado;
- merge apenas via PR;
- proibido `push` direto e force-push.

Ponto importante que travou nosso merge:

> O GitHub **não permite que o autor aprove o próprio PR**. Como o PR foi aberto
> pelo `hiseg10`, a aprovação teve de vir de outra conta com **Write**
> (`helioprofcaic`).

Para aprovar (na conta revisora):

1. **Files changed** → **Review changes**.
2. Selecione **Approve**.
3. Clique em **Submit review** (sem isso a revisão não é registrada).

Ver o estado:

```powershell
gh pr checks
gh pr view --json reviewDecision,mergeable,mergeStateStatus
```

---

## 7. Merge

Há três formas de juntar a branch na `main`:

| Método | Efeito | Quando usar |
| --- | --- | --- |
| **Merge commit** | Preserva os commits + cria um commit de merge. | Histórico detalhado. |
| **Squash and merge** | Junta tudo em **1 commit** na `main`. | PR com muitos commits pequenos; histórico limpo. |
| **Rebase and merge** | Reaplica os commits em cima da `main`, sem merge commit. | Histórico linear (requer cuidado). |

Usamos **Squash and merge**. Resultado:

- `main` recebeu um único commit: `Fluxo de pedidos, autoatendimento e permissoes por cargo (#2)`;
- o SHA final ficou `4090481`.

Pela interface: clique em **Squash and merge → Confirm squash and merge**.

Com `gh`:

```powershell
gh pr merge --squash --delete-branch
```

> Se quiser apagar a branch remota depois, use `git push origin --delete nome-da-branch`.

---

## 8. Atualizar o repositório local depois do merge

```powershell
git checkout main
git pull --ff-only origin main
git log --oneline -3
```

Agora o `main` local aponta para o commit de squash. Se você continuar
trabalhando, crie outra branch a partir dessa `main` atualizada.

---

## 9. O que aconteceu com a Vercel

A Vercel está conectada ao repositório. Cada push gera:

- **Preview deployment** para branches/PRs;
- **Production deployment** quando a `main` muda.

Neste caso, o merge em `main` disparou o deploy de produção e o status
`Vercel - feira-sabor` ficou **success**.

Confira se o projeto tem as variáveis de ambiente necessárias. O Sabor usa banco
libSQL/Turso:

- `DATABASE_URL` — ex.: `libsql://...`
- `DATABASE_AUTH_TOKEN`

Sem elas, o build passa, mas as rotas que consultam o banco falham em runtime.

---

## 10. Erros comuns (e como resolver)

### `remote: error: GH013: Repository rule violations found`

Você tentou `push` direto na `main` protegida.

**Solução:** crie uma branch, faça push dela e abra um PR.

### `422 Unprocessable Entity` ao criar PR

Normalmente já existe um PR aberto para aquela branch. Verifique:

```powershell
gh pr list --head fix/sabor-confirmar-pagamento
```

### `405 Method Not Allowed` ao tentar merge

O corpo da resposta diz o motivo. O nosso foi:

```
At least 1 approving review is required by reviewers with write access.
```

**Solução:** outra pessoa (conta diferente do autor) precisa aprovar — ou o
administrador ajusta a regra temporariamente.

### Autor não consegue aprovar o próprio PR

É regra do GitHub. Use outra conta com acesso de escrita.

### `fatal: Authentication failed` / credencial vencida

O Git Credential Manager guarda o login. Se a conta mudou:

```powershell
git config --get credential.helper
git credential-manager configure
```

E refaça o login no GitHub Desktop/VS Code/terminal. Em último caso, remova a
credencial do Windows (Gerenciador de Credenciais → Credenciais do Windows) e
faça `git push` de novo para autenticar.

### Esqueci de criar a branch e commitei na `main`

Enquanto não deu push:

```powershell
git branch minha-branch     # marca o commit atual
git reset --hard origin/main
git checkout minha-branch
```

---

## 11. Resumo (cola rápida)

```powershell
# 1. atualizar e criar branch
git checkout main
git pull --ff-only origin main
git checkout -b fix/minha-correcao

# 2. trabalhar, conferir e commitar
git status
git diff
git add caminho/do/arquivo
git commit -m "Corrige ..."

# 3. validar
npm run lint
npm run build

# 4. enviar
git push -u origin fix/minha-correcao

# 5. abrir PR (web ou gh)
gh pr create --base main --head fix/minha-correcao --title "..." --body "..."

# 6. após aprovação + CI verde
gh pr merge --squash --delete-branch

# 7. sincronizar local
git checkout main
git pull --ff-only origin main
```

---

## 12. Regras de ouro

1. Nunca faça `push` direto na `main` protegida.
2. Um PR = uma mudança com propósito claro.
3. Rode lint e build antes de enviar.
4. Escreva mensagens de commit no imperativo.
5. Só faça merge com CI verde e revisão aprovada.
6. Depois do merge, atualize sua `main` local.
7. Nunca commite segredos (`.env`, tokens, senhas) — use variáveis de ambiente.
