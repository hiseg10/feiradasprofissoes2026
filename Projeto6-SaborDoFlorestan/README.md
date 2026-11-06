# Sabor do Florestan

PDV (ponto de venda) da cantina da **Feira das Profissões Florestan 2026**, atividade de empreendedorismo do **2º ano A** do curso técnico em Desenvolvimento de Sistemas.

O sistema controla o cardápio, o carrinho, o pagamento em **Pix, cartão e dinheiro**, a fila de pedidos da cozinha e o resumo de vendas.

## O que o projeto faz

- **Cardápio** com salgados, doces, bebidas e combos, preços e estoque.
- **Caixa touch**: busca, filtros por categoria, carrinho e cobrança.
- **Pix**: gera o **QR code real** e o código copia e cola a partir da chave configurada (BR Code).
- **Cartão**: registra débito ou crédito depois da aprovação na maquininha.
- **Dinheiro**: calcula troco e mostra quanto falta.
- **Pedidos**: painel da cozinha com status novo → preparando → pronto → entregue.
- **Gestão**: total vendido, ticket médio, totais por forma de pagamento, produtos mais vendidos, cadastro e estoque.
- **Cardápio imprimível** para o balcão.
- **Senha do pedido** gerada automaticamente (#001, #002...).

## Stack

- Next.js 16 (App Router) + React 19 + TypeScript
- Tailwind CSS 4
- libSQL / SQLite local em `data/sabor.db`
- `qrcode` para gerar o QR do Pix

## Rodando

```powershell
npm install
Copy-Item .env.example .env.local
npm run dev
```

Acesse `http://localhost:3000`.

**No Windows:** dê duplo clique em `run.bat`. Ele instala as dependências na primeira vez, cria o `.env.local` e inicia o caixa.

No menu da raiz, a opção **8** inicia o Sabor do Florestan na porta **3105**.

## Configurando o Pix

No `.env.local`:

```env
PIX_KEY=sua-chave-pix-aqui
PIX_MERCHANT_NAME=SABOR DO FLORESTAN
PIX_MERCHANT_CITY=SUA CIDADE
```

A chave pode ser CPF, CNPJ, e-mail, telefone ou chave aleatória. Use a chave real da cantina.

- Sem `PIX_KEY`, o caixa continua funcionando com cartão e dinheiro.
- O QR é gerado localmente no servidor; nenhum dado é enviado a um PSP.
- O operador confirma o recebimento no app do banco e clica em **Confirmar Pix recebido**.
- Teste o QR com o app do banco antes da feira.

## Cartão e dinheiro

- **Cartão**: o sistema não integra com a maquininha. O operador passa o cartão, confirma na maquininha e registra a venda no sistema.
- **Dinheiro**: o operador informa o valor recebido e o sistema calcula o troco. O total em dinheiro aparece no resumo da gestão.

## Banco de dados

- O banco é criado em `data/sabor.db` e semeado com 19 produtos na primeira execução.
- Para começar do zero, apague `data/sabor.db` (ou use **Gestão → Zerar vendas** para limpar pedidos e voltar o estoque para 30).
- O arquivo não deve ser versionado (já está no `.gitignore`).

## Estrutura

```
src/
  app/
    api/
      admin/reset/       zerar pedidos e estoque
      pedidos/           listar e criar pedidos
      pedidos/[id]/      atualizar status
      pix/               gerar payload e QR do Pix
      produtos/          listar e criar produtos
      produtos/[id]/     editar produto
      resumo/            totais da gestão
    admin/               página de gestão
    cardapio/            cardápio imprimível
    pedidos/             painel da cozinha
    page.tsx             caixa (PDV)
  components/
    Header, Pdv, Checkout, PedidosBoard, AdminPanel, BotaoImprimir
  lib/
    db.ts                libSQL + DDL + seed
    queries.ts           produtos, pedidos, resumo
    pix.ts               BR Code + CRC16
    seed.ts              cardápio inicial
    format.ts            moeda, hora e rótulos
    types.ts             tipos
```

## API

| Rota | Método | Para que serve |
|---|---|---|
| `/api/produtos` | GET | Lista produtos (`?todos=1` inclui inativos) |
| `/api/produtos` | POST | Cria produto |
| `/api/produtos/[id]` | PATCH | Atualiza produto |
| `/api/pedidos` | GET | Lista pedidos |
| `/api/pedidos` | POST | Cria pedido e baixa o estoque |
| `/api/pedidos/[id]` | PATCH | Atualiza status |
| `/api/pix` | POST | Gera payload e QR do Pix |
| `/api/resumo` | GET | Totais da gestão |
| `/api/admin/reset` | POST | Zera pedidos e estoque (`{ "confirmar": true }`) |

O servidor recalcula preços e valida o estoque; o cliente não pode alterar o total.

## Backlog para os alunos

### Sprint 1 — Base
- [ ] Revisar o cardápio e os preços com a turma
- [ ] Configurar a chave Pix real da cantina
- [ ] Testar o QR com o app do banco
- [ ] Definir a escala de atendimento

### Sprint 2 — Operação
- [ ] Adicionar impressão de senha/comprovante
- [ ] Criar alerta sonoro de novo pedido na cozinha
- [ ] Adicionar cancelamento de pedido com devolução de estoque
- [ ] Criar fechamento de caixa por turno

### Sprint 3 — Gestão
- [ ] Relatório por dia e por categoria
- [ ] Controle de sangria e suprimento
- [ ] Exportar vendas em CSV
- [ ] Cadastro de combos com desconto

### Sprint 4 — Feira
- [ ] Modo quiosque no caixa
- [ ] QR code do cardápio para os visitantes
- [ ] Roteiro de demonstração de 3 minutos
- [ ] Plano B sem internet (o sistema já funciona local)

## Colaboração com Marketing Digital

| Entregável | Responsável |
|---|---|
| Nome, logo e identidade da cantina | Marketing |
| Cardápio impresso e cartaz de preços | Marketing |
| Placa de pagamentos (Pix, cartão, dinheiro) | Marketing |
| Posts e reels da atividade | Marketing |
| Pesquisa com clientes | Marketing |
| PDV, Pix, pedidos e gestão | DS |
| Roteiro do pitch | DS + Marketing |

## Segurança e LGPD

- O sistema é local; não exponha o caixa na internet.
- Não colete dados pessoais além do nome opcional do cliente.
- Não armazene a chave Pix no código; use `.env.local`.
- O acesso à gestão não tem senha por padrão; use apenas no notebook da cantina.
- A maquininha de cartão é externa; o sistema só registra a forma de pagamento.

## Observações

- O QR do Pix é gerado com a chave configurada; sem ela, use cartão ou dinheiro.
- O cardápio pode mudar durante a feira; a gestão permite editar preço e estoque.
- O botão **Zerar vendas** limpa pedidos e volta o estoque para 30, mantendo os produtos cadastrados.
