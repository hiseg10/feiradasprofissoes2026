# Configuração de pagamentos — Sabor do Florestan

Como configurar e operar as formas de pagamento do app, incluindo o que já
existe, o que é feito na maquininha e o que é necessário para aceitar
**Google Pay** no celular do cliente.

---

## 1. Resumo das formas de pagamento

| Forma | Status no app | Como o dinheiro é recebido |
| --- | --- | --- |
| **Pix** | Implementado (QR dinâmico por pedido) | Cai na chave Pix configurada em `PIX_KEY`. |
| **Cartão de débito/crédito** | Implementado como registro | Na **maquininha** (o app não processa cartão). |
| **NFC / aproximação (Point Tap)** | Fora do site (app do Mercado Pago) | Celular do caixa com o app do MP recebe por aproximação. |
| **Dinheiro** | Implementado (calcula troco) | No caixa. |
| **Google Pay** | **Não implementado** | Precisa de um gateway de pagamento (veja seção 5). |
| **Apple Pay** | Não implementado | Necessário para iPhone/Safari (mesma lógica de gateway). |

---

## 2. Pix

### Onde configurar

Variáveis de ambiente (nunca no código):

```env
PIX_KEY=chave-real-da-cantina
PIX_MERCHANT_NAME=SABOR DO FLORESTAN
PIX_MERCHANT_CITY=TERESINA
```

- **Local:** `Projeto6-SaborDoFlorestan/.env.local`
- **Produção (Vercel):** Project → Settings → Environment Variables
  (marque Production/Preview conforme o caso) e faça um novo deploy.

O arquivo `.env.local` é ignorado pelo Git (`.env*` no `.gitignore`). Mas quem
tem acesso ao servidor/Vercel consegue ver a chave — trate como segredo.

### Como funciona

1. O caixa monta o pedido.
2. Ao escolher **Pix**, o app chama `POST /api/pix`.
3. O servidor calcula o total e gera um **QR novo** com o valor exato.
4. O cliente paga e o operador confirma o recebimento na tela.

Se `PIX_KEY` não estiver configurada, o app mostra "Pix indisponível" e sugere
cartão ou dinheiro.

### Qual chave usar (importante)

Usar uma chave **pessoal** faz o dinheiro cair na conta pessoal. Para uma feira
escolar isso pode gerar problema de prestação de contas com a turma e a escola.

Recomendação:

- combinar com a turma/professora qual conta/chave será usada;
- preferir uma chave da **cantina/turma** ou de um **responsável** pela prestação
  de contas;
- registrar por escrito quem recebe e como o valor será repassado;
- nunca colocar a chave real em documento, print ou no Git.

---

## 3. Cartão de débito/crédito (maquininha)

O app **não processa cartão**. Ele apenas:

1. registra que a forma é cartão (débito ou crédito);
2. mostra "Passe o cartão na maquininha";
3. o operador confirma que a maquininha aprovou.

Portanto é necessário ter uma **maquininha** (da escola, do professor ou
alugada). No fechamento, o app soma os pedidos por forma de pagamento.

---

## 3.1. NFC / aproximação (Point Tap)

O Mercado Pago permite receber por **aproximação usando o próprio celular** com
o **Point Tap**, sem comprar maquininha. O cliente encosta o cartão virtual
(Google Pay/Samsung Pay/Apple Pay) ou o cartão físico no celular do caixa, que
está com o app do Mercado Pago.

Importante:

- Isso roda **no app do Mercado Pago**, não no nosso site. O navegador não lê
  NFC nem funciona como maquininha.
- No nosso app, o caixa registra a venda como **NFC/maquininha** e confirma o
  recebimento manualmente (como já acontece com o cartão).
- Para automatizar (o pedido mudar de status sozinho), seria necessário integrar
  com a **API do Point**/webhooks do Mercado Pago — projeto separado.
- Confirme se o celular do caixa tem NFC (Android) ou use o **Tap to Pay no
  iPhone**. O Point Tap é gratuito.

---

## 4. Dinheiro

O operador informa o valor recebido; o app calcula e exibe o **troco**. É
importante ter troco em espécie no caixa.

---

## 5. Google Pay (pagar pelo celular na página)

### O que é

Google Pay é uma **carteira digital**: o cliente paga com o cartão que já está
salvo na conta Google dele. O app não recebe os dados do cartão — recebe um
**token** que precisa ser cobrado por um **gateway de pagamento**.

### Por que não dá só com a chave Pix

A chave Pix recebe **Pix**, não cartão. Google Pay cobra **cartão**. São redes
diferentes. Para aceitar Google Pay é obrigatório contratar um gateway/PSP.

### O que é necessário

1. **Conta de gateway** com suporte a Google Pay no Brasil
   (ex.: Stripe, Mercado Pago, PagBank — confirme a disponibilidade atual do
   Google Pay no país e no plano).
2. **Conta de comerciante** (CPF/CNPJ) aprovada no gateway.
3. **Chaves de API** (publishable/public key e secret key) configuradas como
   variáveis de ambiente — a secret **nunca** vai para o navegador nem para o
   Git.
4. **HTTPS** (a Vercel já fornece).
5. **Chrome + conta Google com cartão salvo** no celular do cliente.
   Observação: no iPhone, o Google Pay normalmente não está disponível no
   Chrome; nesse caso seria necessário **Apple Pay**.

### Como ficaria no app

1. No checkout do autoatendimento, apareceria a opção **Google Pay** (somente se
   o navegador suportar e o gateway estiver configurado).
2. O navegador abre a folha de pagamento do Google Pay.
3. O gateway devolve um token de cartão.
4. O servidor cria a cobrança no gateway e, se aprovada, o pedido é marcado como
   pago e entra na fila.
5. O gateway envia um **webhook** para confirmar o pagamento (recomendado).

Esse fluxo exige backend (rotas de API) e cadastro no gateway; não é possível
apenas com HTML/JS no cliente.

### Ponto de atenção: app nativo × site

Gateways como Stripe, Adyen, Mercado Pago e PagBank costumam oferecer Google Pay
por meio do **SDK do próprio gateway** — não é preciso implementar a tokenização
do Google manualmente. Porém isso varia por:

- **canal**: SDK de app nativo (Android/Flutter/React Native) é diferente do SDK
  **web** (o nosso caso, site aberto no Chrome do celular);
- **país e produto**: o Google Pay precisa estar habilitado para o Brasil no
  produto de checkout usado.

Na documentação pública do checkout **web** do Mercado Pago (Bricks/Checkout
API), os meios listados são cartão, Pix, boleto e débito virtual Caixa — o
**Google Pay não aparece**. Antes de escolher o Mercado Pago para esse fim,
confirme no painel/suporte se o Google Pay está disponível para **site no
Brasil**. Se não estiver, use um gateway que documente Google Pay para web
(ex.: Stripe) ou deixe o Google Pay de fora.

> O Google **não cobra taxa** do lojista pelo Google Pay. A taxa é a normal do
> gateway sobre a transação de cartão.

### Opções para a feira

- **Sem gateway:** manter Pix + cartão na maquininha + dinheiro. É o caminho mais
  simples e sem custo de integração.
- **Com gateway (Google Pay de verdade):** escolher um gateway que suporte
  Google Pay **para web no Brasil**, criar conta, pegar as chaves de **teste** e
  implementar o fluxo acima. Leva tempo e depende de aprovação da conta.
- **Somente Android:** se o objetivo for só Android, o Google Pay também pode ser
  oferecido pelo SDK do gateway no app; mas o nosso caso é site.

---

## 6. Segurança e prestação de contas

- Segredos apenas em `.env.local`/Vercel, nunca no Git.
- Uma pessoa responsável pelo caixa e outra pela conferência.
- Fechar o caixa por forma de pagamento (o app já tem resumo).
- Guardar o comprovante/relatório do gateway (quando houver).
- Definir antes da feira qual chave Pix e qual conta receberão os valores.

---

## 7. Checklist antes da feira

- [ ] `PIX_KEY` configurada (local e Vercel) com a chave acordada pela equipe.
- [ ] `PIX_MERCHANT_NAME` e `PIX_MERCHANT_CITY` corretos.
- [ ] Teste de QR Pix com valor real (ou de teste) no celular.
- [ ] Maquininha disponível, carregada e com sinal.
- [ ] Troco separado.
- [ ] Se for usar Google Pay: conta no gateway aprovada, chaves de teste
      configuradas e fluxo testado em um celular Android com Chrome.
- [ ] Responsáveis definidos para receber e conferir os valores.
