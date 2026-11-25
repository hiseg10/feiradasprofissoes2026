# Feira Hub

Bootloader local e gerador de QR codes da **Feira das Profissões Florestan 2026**.

O hub roda no notebook, detecta o IP da rede local, verifica as portas dos seis projetos, inicia/para os servidores e gera um **QR code individual** para cada app. O celular do visitante escaneia o QR e abre o projeto direto no navegador, desde que esteja na mesma rede Wi-Fi.

## Rodando

```powershell
cd FeiraHub
npm install
npm start
```

Ou dê duplo clique em `start-hub.bat`.

Acesse `http://localhost:4000`.

No menu da raiz, a opção **7** também abre o hub.

## QR do banner (URL fixa)

O QR impresso no banner não deve apontar para o IP local. Ele aponta para o lançador público (`FeiraLauncher/`), que redireciona para os apps. Para gerar o QR definitivo:

```powershell
cd FeiraHub
npm run qr -- https://seu-projeto.pages.dev/
```

O comando grava `docs/design/assets/banner-qr.svg` e `.png` com correção de erro **H**, margem 4 e preto puro. Use o SVG no banner e teste a prova impressa antes de enviar à gráfica. Não mude a URL depois de gerar o QR.

## O que a página mostra

- **Rede local**: hostname do notebook, IPs disponíveis, seletor de IP, mDNS (quando disponível) e QR code do próprio hub.
- **Projetos**: nome, pasta, porta configurada, porta real, status (online/offline/iniciando/sem resposta/porta ocupada), URL local e QR code individual.
- **Portas**: mostra o PID e o processo que ocupa cada porta, sugere uma porta livre e permite encerrar processos travados.
- **Controles**: iniciar, parar, reiniciar, liberar porta, iniciar todos, parar todos, limpar portas, atualizar e imprimir QR codes.
- **Logs**: saída de cada processo iniciado pelo hub, útil para diagnosticar erros.
- **Impressão**: o botão "Imprimir QRs" gera uma folha limpa com os QR codes e as URLs.

## Como funciona

1. O servidor lê `config.json` com a lista de projetos e portas.
2. Detecta `os.hostname()` e os IPv4 de `os.networkInterfaces()`, priorizando `192.168.x.x`, `10.x.x.x` e `172.16–31.x.x`.
3. Tenta resolver o hostname e o `.local` via DNS/mDNS.
4. Escaneia a porta configurada de cada projeto, as portas seguintes (`portasReserva`) e as `faixasPortas`.
5. Confere o HTML de cada porta aberta com o `marcador` (sem diferenciar maiúsculas, acentos ou entidades HTML) para identificar o projeto.
6. Identifica o processo que escuta cada porta: PID, nome e linha de comando. Isso permite diferenciar "porta ocupada por outro app" de "processo do próprio projeto travado".
7. Se a porta preferida estiver ocupada, o botão "Iniciar" escolhe automaticamente a próxima porta livre e mostra a porta usada no cartão e no QR code.
8. O botão "Parar" encerra a árvore de processos com `tree-kill`. Os botões "Liberar porta", "Reiniciar" e "Limpar portas" encerram processos travados ou órfãos (somente Node/cmd) antes de liberar a porta.
9. Monta a URL `http://<IP-escolhido>:<porta-real>` e gera o QR code localmente com a biblioteca `qrcode` (SVG para a tela, PNG para baixar).

## Rede e celular

- O notebook e o celular precisam estar **na mesma rede Wi-Fi**.
- O QR code usa o IP selecionado na página. Se houver mais de um IP (Wi-Fi, Ethernet, Docker, WSL), escolha o da rede que o celular usa.
- Na primeira vez, o Windows pode pedir para liberar o Node.js no firewall. Permita em **redes privadas**.
- Redes de visitantes com isolamento de clientes podem bloquear o acesso entre dispositivos.
- VPNs e adaptadores virtuais podem confundir o IP; desligue-os durante a feira se necessário.

## Segurança

- O hub escuta em `0.0.0.0` para os celulares acessarem a página e os QR codes.
- **Iniciar/parar/liberar portas só funciona a partir do próprio notebook.** Requisições vindas da rede recebem 403.
- Encerrar processos exige confirmação na interface e só atinge processos `node`/`cmd`, nunca o próprio hub.
- Os logs também só são enviados para o notebook.
- Não exponha o hub diretamente na internet. Para acesso externo, use um túnel (Cloudflare Tunnel, ngrok) com autenticação.

## Configuração

Edite `config.json`:

```json
{
  "hubPort": 4000,
  "modo": "dev",
  "portasReserva": 8,
  "faixasPortas": [
    { "inicio": 3000, "fim": 3005 },
    { "inicio": 3100, "fim": 3105 }
  ],
  "projetos": [
    {
      "id": "story-games",
      "nome": "Story Games",
      "descricao": "Loja de jogos narrativos",
      "pasta": "../Projeto5-StoryGames",
      "porta": 3104,
      "cor": "#66C0F4",
      "marcador": "Story Games"
    }
  ]
}
```

| Campo | Para que serve |
|---|---|
| `hubPort` | Porta do hub (padrão 4000) |
| `modo` | `dev` (npm run dev) ou `start` (npm run start, exige build) |
| `portasReserva` | Quantas portas depois da configurada o hub pode usar e escanear (padrão 8) |
| `faixasPortas` | Faixas extras de portas para descobrir projetos em portas diferentes |
| `pasta` | Caminho do projeto, relativo à pasta `FeiraHub` |
| `porta` | Porta preferida do projeto (o hub troca se estiver ocupada) |
| `cor` | Cor do cartão na interface |
| `marcador` | Texto que o hub procura no HTML para confirmar que a porta é do projeto |
| `marcadores` | Lista opcional de textos aceitos como marcador |

Para adicionar um projeto, copie um bloco, ajuste `id`, `nome`, `pasta`, `porta`, `cor` e `marcador`.

Se quiser usar `next start`, rode `npm run build` em cada projeto antes e mude `modo` para `"start"`.

## Variáveis de ambiente

| Variável | Padrão | Para que serve |
|---|---|---|
| `HUB_PORT` | `4000` | Porta do hub |
| `AUTOSTART` | desligado | `1` inicia todos os projetos ao subir o hub |
| `HUB_CONFIG` | `config.json` | Caminho alternativo do arquivo de configuração |

Para iniciar tudo automaticamente:

```powershell
$env:AUTOSTART="1"; npm start
```

Ou `node server.js --autostart`.

## Problemas comuns

| Problema | Solução |
|---|---|
| Celular não abre o link | Confirme a mesma Wi-Fi, o IP escolhido e o firewall do Windows |
| QR aponta para `localhost` | Nenhum IP de rede foi encontrado; conecte o notebook ao Wi-Fi |
| Porta já em uso | O hub identifica o processo e sugere outra porta. Use "Iniciar na porta N" ou "Liberar porta". |
| Projeto aparece "sem resposta" | Há um processo do projeto que aceita conexão mas não responde. Use "Reiniciar" ou "Liberar porta". |
| Projeto aparece offline com "porta ocupada" | Outro serviço está na porta configurada. Use "Iniciar na porta N" para trocar de porta ou "Limpar portas". |
| Projeto aparece online em outra porta | O hub encontrou o `marcador` em outra porta e usou a porta real no QR. Para voltar à porta preferida, encerre o processo antigo e reinicie. |
| Projeto não inicia | Confira `node_modules` e os logs do cartão; rode o `run.bat` do projeto uma vez |
| Projeto online mas sem botão "Parar" | Ele foi iniciado fora do hub; use "Liberar porta" ou pare pelo `run.bat` |
| `EADDRINUSE` no hub | Defina `HUB_PORT` com outra porta |
| mDNS indisponível | Normal em algumas redes; use o IP |

## Observações

- O hub valida o conteúdo das portas com o `marcador`; assim, não confunde o projeto com outro serviço que esteja usando a mesma porta.
- Se a porta preferida estiver ocupada, o hub inicia o projeto na próxima porta livre e usa essa porta no QR code. O cartão mostra "usando 31xx".
- Ao fechar o hub com Ctrl+C, os projetos iniciados por ele são encerrados. Se a janela for fechada à força, eles podem continuar rodando; nesse caso, use "Limpar portas".
- "Limpar portas" só encerra processos `node`/`cmd` relacionados às portas dos projetos. Outros aplicativos precisam ser fechados manualmente.
- O hub inicia os projetos em **modo desenvolvimento** por padrão. Para a feira, isso é suficiente.
- O **CDQ** usa login Google: se o visitante acessar pelo IP da rede, o callback `http://<IP>:3000/api/auth/google/callback` precisa estar cadastrado no Google Cloud Console. Caso contrário, use o login de desenvolvimento ou abra o CDQ no próprio notebook.
- Os QR codes são gerados localmente; nenhum serviço externo é usado.
- O hub é uma ferramenta interna da feira, não um site público.

