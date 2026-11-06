# Bridge serial — Arduino para o AgroSmart

O Arduino UNO/Nano não tem Wi-Fi. Este script faz a ponte entre a porta USB e a API do AgroSmart:

```
Arduino (USB)  →  bridge.js  →  POST /api/estufa/leituras
       ↑                              │
       └────── "BOMBA:1" / "BOMBA:0" ─┘
```

O Arduino envia uma linha JSON a cada 10 segundos. O bridge repassa para a API e devolve o estado da bomba, que o Arduino usa para acionar o relé.

## Requisitos

- Node.js 18 ou superior (o projeto usa Node 24).
- Arduino conectado por USB.
- App do AgroSmart rodando (`npm run dev` na pasta do projeto).

## Instalação

```powershell
cd firmware/bridge-serial
npm install
```

## Atalho no Windows

Dê duplo clique em `run-bridge.bat` (ou em `..\..\run-bridge.bat`, na raiz do AgroSmart). O script:

- instala as dependências se necessário;
- lista as portas seriais;
- pergunta a porta do Arduino;
- inicia o bridge apontando para o app.

O app precisa estar rodando. Se você usar o menu `run.bat` da raiz, o AgroSmart sobe na porta 3102 e o atalho do bridge já usa essa porta.

## Descobrir a porta

Feche o **Monitor Serial** da Arduino IDE antes de rodar o bridge.

```powershell
npm run listar
```

Exemplo de saída:

```
┌─────────┬────────────┬────────────┐
│ porta   │ fabricante │ descricao  │
├─────────┼────────────┼────────────┤
│ COM3    │ Arduino    │ Arduino Uno│
└─────────┴────────────┴────────────┘
```

No Linux/macOS a porta costuma ser `/dev/ttyUSB0` ou `/dev/ttyACM0`.

## Rodar

```powershell
$env:SERIAL_PORT="COM3"
npm start
```

Ou em uma linha:

```powershell
$env:SERIAL_PORT="COM3"; npm start
```

Saída esperada:

```
Conectado em COM3 a 9600 baud.
Enviando leituras para http://localhost:3000/api/estufa/leituras
Leitura enviada | solo 32% | temp 26.4°C | bomba LIGADA
```

## Variáveis de ambiente

| Variável | Padrão | Para que serve |
|---|---|---|
| `SERIAL_PORT` | `COM3` | Porta do Arduino |
| `SERIAL_BAUD` | `9600` | Velocidade do firmware |
| `API_URL` | `http://localhost:3000/api/estufa/leituras` | Endpoint do app |
| `ESTUFA_TOKEN` | vazio | Mesmo token do `.env.local`, se configurado |

## Problemas comuns

| Problema | Solução |
|---|---|
| `Access denied` / porta ocupada | Feche o Monitor Serial da Arduino IDE |
| Porta não aparece | Instale o driver CH340/CP2102 e troque o cabo USB |
| `Não foi possível conectar` | Confira o nome da porta com `npm run listar` |
| API 404/500 | Confirme se o app está rodando em `localhost:3000` ou no `API_URL` configurado |
| Leitura não chega | Confira o baud rate (9600) e o firmware gravado |
| Bomba não reage | Verifique o relé no pino D7 e a alimentação |
| Token não carrega | Salve o `.env.local` como UTF-8 sem BOM ou defina `ESTUFA_TOKEN` no terminal |

## Dica para a feira

- Rode o app e o bridge no mesmo notebook, com o Arduino conectado.
- Deixe o terminal do bridge visível para mostrar os dados chegando.
- Se o Arduino falhar, use o modo simulação do painel como plano B.
- Leve um cabo USB reserva e uma fonte para o relé/bomba.

## Alternativa

Se você conseguir um ESP32, use o firmware `../esp32_horta.ino`: ele envia os dados direto por Wi-Fi, sem precisar do bridge.
