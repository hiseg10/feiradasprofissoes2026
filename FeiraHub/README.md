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
- **Projetos**: nome, pasta, porta configurada, porta real, status (online/offline/iniciando/porta ocupada), URL local e QR code individual.
- **Controles**: iniciar, parar, iniciar todos, parar todos, atualizar e imprimir QR codes.
- **Logs**: saída de cada processo iniciado pelo hub, útil para diagnosticar erros.
- **Impressão**: o botão "Imprimir QRs" gera uma folha limpa com os QR codes e as URLs.

## Como funciona

1. O servidor lê `config.json` com a lista de projetos e portas.
2. Detecta `os.hostname()` e os IPv4 de `os.networkInterfaces()`, priorizando `192.168.x.x`, `10.x.x.x` e `172.16–31.x.x`.
3. Tenta resolver o hostname e o `.local` via DNS/mDNS.
4. Escaneia as portas configuradas e as `faixasPortas`, abre o HTML de cada porta aberta e confere o `marcador` de cada projeto.
5. Se o marcador aparece na porta configurada, usa essa porta; se aparece em outra, detecta o projeto do mesmo jeito e mostra a porta real.
6. Monta a URL `http://<IP-escolhido>:<porta-real>` e gera o QR code localmente com a biblioteca `qrcode` (SVG para a tela, PNG para baixar).
7. O botão "Iniciar" roda `npm run dev -- -p <porta> -H 0.0.0.0` na pasta do projeto.
8. O botão "Parar" encerra a árvore de processos com `tree-kill`.

## Rede e celular

- O notebook e o celular precisam estar **na mesma rede Wi-Fi**.
- O QR code usa o IP selecionado na página. Se houver mais de um IP (Wi-Fi, Ethernet, Docker, WSL), escolha o da rede que o celular usa.
- Na primeira vez, o Windows pode pedir para liberar o Node.js no firewall. Permita em **redes privadas**.
- Redes de visitantes com isolamento de clientes podem bloquear o acesso entre dispositivos.
- VPNs e adaptadores virtuais podem confundir o IP; desligue-os durante a feira se necessário.

## Segurança

- O hub escuta em `0.0.0.0` para os celulares acessarem a página e os QR codes.
- **Iniciar/parar só funciona a partir do próprio notebook.** Requisições vindas da rede recebem 403.
- Os logs também só são enviados para o notebook.
- Não exponha o hub diretamente na internet. Para acesso externo, use um túnel (Cloudflare Tunnel, ngrok) com autenticação.

## Configuração

Edite `config.json`:

```json
{
  "hubPort": 4000,
  "modo": "dev",
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
| `faixasPortas` | Faixas extras de portas para descobrir projetos em portas diferentes |
| `pasta` | Caminho do projeto, relativo à pasta `FeiraHub` |
| `porta` | Porta configurada do projeto |
| `cor` | Cor do cartão na interface |
| `marcador` | Texto que o hub procura no HTML para confirmar que a porta é do projeto |

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
| Porta já em uso | Pare o processo que está usando a porta ou mude a porta no `config.json` |
| Projeto aparece offline com "porta ocupada" | Outro serviço está na porta configurada; o hub valida o conteúdo e não confunde. Pare o outro processo ou mude a porta. |
| Projeto aparece online em outra porta | O hub encontrou o `marcador` em outra porta e usou a porta real no QR. Para usar a porta configurada, pare o processo antigo. |
| Projeto não inicia | Confira `node_modules` e os logs do cartão; rode o `run.bat` do projeto uma vez |
| Projeto online mas sem botão "Parar" | Ele foi iniciado fora do hub; pare pelo `run.bat` ou pelo Gerenciador de Tarefas |
| `EADDRINUSE` no hub | Defina `HUB_PORT` com outra porta |
| mDNS indisponível | Normal em algumas redes; use o IP |

## Observações

- O hub valida o conteúdo das portas com o `marcador`; assim, não confunde o projeto com outro serviço que esteja usando a mesma porta.
- O hub inicia os projetos em **modo desenvolvimento** por padrão. Para a feira, isso é suficiente.
- Ao fechar o hub com Ctrl+C, os projetos iniciados por ele são encerrados. Se a janela for fechada à força, eles podem continuar rodando.
- O **CDQ** usa login Google: se o visitante acessar pelo IP da rede, o callback `http://<IP>:3000/api/auth/google/callback` precisa estar cadastrado no Google Cloud Console. Caso contrário, use o login de desenvolvimento ou abra o CDQ no próprio notebook.
- Os QR codes são gerados localmente; nenhum serviço externo é usado.
- O hub é uma ferramenta interna da feira, não um site público.

