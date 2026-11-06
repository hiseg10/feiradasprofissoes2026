# Tarefas pendentes

**Data da feira: 05/12/2026, das 8h às 11h30.**

## Prioridade alta

- [ ] **QR do banner — URL fixa e lançador geral**
  - Publicar `FeiraLauncher/` no Cloudflare Pages e anotar a URL final (`https://<projeto>.pages.dev`).
  - Não alterar a URL depois de imprimir o banner; só atualizar o lançador e os redirects.
  - Trocar os destinos em `FeiraLauncher/_redirects` no dia da feira.
  - Gerar o QR com `cd FeiraHub; npm run qr -- https://<projeto>.pages.dev/`.
  - Substituir o QR ilustrativo do banner pelo QR gerado e testar a prova impressa.
  - Manter o projeto do Pages ativo, com 2FA, e monitorar a URL até a feira.

- [ ] **Publicação online e CI/CD**
  - Criar repositório no GitHub e proteger a branch `main`.
  - Subir o monorepo sem `node_modules`, `.next`, `.env.local` e `*.zip` (o `.gitignore` já cobre).
  - Publicar o lançador no Cloudflare Pages (projeto `feira-florestan`).
  - Publicar os 6 apps na Vercel, um projeto por pasta (`Projeto1-CDQ` a `Projeto6-SaborDoFlorestan`).
  - Configurar Turso para o CDQ e o Sabor; Vercel Blob para o CDQ; OAuth do Google com a URL publicada.
  - Atualizar `FeiraLauncher/_redirects` com as URLs da Vercel e redeployar o lançador.
  - Ativar `.github/workflows/ci.yml` e exigir o check `CI` nos pull requests.

- [ ] **CDQ — endurecer login Google para produção**
  - Calcular a origem do callback com `x-forwarded-proto` / `x-forwarded-host` (ou variável `APP_URL`).
  - Usar cookie `secure` somente quando a requisição for HTTPS.
  - Melhorar as mensagens de erro do OAuth em desenvolvimento.
  - Testar com credenciais reais e com o domínio publicado.
  - Arquivos: `Projeto1-CDQ/src/app/api/auth/google/route.ts` e `.../callback/route.ts`.

- [ ] **CDQ — preencher credenciais do Google**
  - `GOOGLE_CLIENT_ID` e `GOOGLE_CLIENT_SECRET` estão vazios no `.env.local`.
  - Cadastrar as URIs de redirecionamento no Google Cloud Console:
    - `http://localhost:3000/api/auth/google/callback`
    - `https://SEU-DOMINIO/api/auth/google/callback`

## Prioridade média

- [ ] **Bolsa Fácil — ligar dados reais**
  - Criar conta na brapi.dev e preencher `BRAPI_TOKEN`.
  - Criar chave no Google AI Studio e preencher `GEMINI_API_KEY`.
  - Testar o curador com dados reais e revisar o disclaimer.

- [ ] **AgroSmart — conectar o hardware (ESP32 ou Arduino)**
  - Confirmar o modelo das placas Arduino disponíveis (UNO, Nano, Mega) e testar o bridge serial.
  - Pedir um ESP32 (opcional, para conexão Wi-Fi direta).
  - Definir `ESTUFA_TOKEN` e configurar o mesmo valor no firmware/bridge.
  - **ESP32:** apontar `API_URL` para o IP do servidor na rede local.
  - **Arduino:** instalar o bridge serial (`firmware/bridge-serial`) e descobrir a porta com `npm run listar`.
  - Calibrar `SOLO_SECO` e `SOLO_MOLHADO` conforme o ADC (12 bits no ESP32, 10 bits no Arduino).
  - Levantar o kit mínimo de sensores (DHT22, solo, LDR, relé e bomba) ou usar o modo bancada com potenciômetros.

- [ ] **Florestan Conecta — substituir dados de demonstração**
  - Convidar parceiros reais e obter autorização de divulgação.
  - Atualizar nomes, endereços, horários e telefones em `src/lib/conteudo.ts`.

- [ ] **Story Games — validar catálogo e textos**
  - Revisar os 16 jogos fictícios com a squad de Marketing.
  - Decidir se o catálogo continua original ou se usará uma API pública de jogos (ex.: RAWG).
  - Testar o recomendador com e sem chave de IA.

## Operação da feira

- [ ] Testar o **Feira Hub** no notebook da feira (`FeiraHub\start-hub.bat`, porta 4000).
- [ ] Escanear os QR codes com um celular na mesma rede Wi-Fi.
- [ ] Liberar o Node.js no firewall do Windows para redes privadas.
- [ ] Antes da feira, fechar servidores antigos na porta 3000 (ex.: Story Games) e conferir se as portas 3101–3104 estão livres.
- [ ] Se o hub mostrar "porta ocupada", identificar o processo com `netstat -ano | findstr :PORTA` e encerrar.
- [ ] Testar os botões "Iniciar todos" e "Parar todos".
- [ ] Se o CDQ for acessado pelo celular com login Google, cadastrar `http://SEU-IP:3000/api/auth/google/callback` nas URIs autorizadas do Google Cloud Console.

### Cantina — Sabor do Florestan

- [ ] Configurar `PIX_KEY` real da cantina no `Projeto6-SaborDoFlorestan/.env.local`.
- [ ] Testar o QR do Pix com o app do banco em uma venda de teste.
- [ ] Testar a maquininha de cartão e o registro de débito/crédito.
- [ ] Separar o troco inicial e definir a escala de abertura/fechamento do caixa.
- [ ] Imprimir o cardápio e a placa de pagamentos.
- [ ] Usar **Gestão → Zerar vendas** antes da feira para limpar os testes.
- [ ] Imprimir o mapa da feira e instalar cópias na entrada, no corredor de 2 m e na porta da biblioteca.
- [ ] Sinalizar a bancada de robótica/horta e os quiosques do CDQ e Story Games na biblioteca.

## Prioridade de design

- [ ] Aprovar a identidade visual e os textos das peças em `docs/design`.
- [ ] **Aprovar o mascote Flo** (nome, desenho e frase “Conecta aí!”).
- [ ] Produzir a **roupa com máscara** do Flo (moletom, luvas e elmo de EVA) e/ou o **standee de 1,60 m**.
- [ ] Definir quem vai vestir o Flo, o acompanhante e os horários de pausa.
- [ ] Testar a máscara do Flo (visão, respiração e conforto) antes da feira.
- [ ] Revisar o mapa da feira com a escola (pátio, corredor e biblioteca).
- [ ] Medir o tamanho final das cartolinas (referência: ~6 folhas A4) e ajustar a página de impressão.
- [ ] Imprimir as cartolinas A4 e recortar os quadrantes.
- [ ] Imprimir os moldes de letras dos nomes dos apps e recortar em TNT.
- [ ] Testar a altura das letras (~10 cm) e o espaçamento nas cortinas.
- [ ] Fechar orçamento e fornecedores de impressão.
- [ ] Produzir banner 250 × 110 cm (com escudo da escola e logo da SEDUC-PI), cavalete 80 × 150 cm, 5 cartolinas, 5 cortinas 200 × 180 cm, 5 folders e o mascote Flo.
- [ ] **Enviar o cavalete para a gráfica** em PDF com fontes incorporadas e 3 cm de sangria; conferir a prova de cor (turquesa, amarelo e mascote).
- [ ] Revisar a montagem com o checklist de `docs/design/checklist-montagem.md`.

## Responsáveis e prazos

| Tarefa | Responsável | Prazo |
|---|---|---|
| OAuth do CDQ | | |
| Dados reais Bolsa Fácil | | |
| Hardware AgroSmart (ESP32 ou Arduino) | | |
| Parceiros Florestan Conecta | | |
| Impressão das peças | | |
| Montagem do estande | | |
