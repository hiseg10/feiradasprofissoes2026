# AgroSmart

Horta inteligente de baixo custo para a **Feira das Profissões Florestan 2026**. Projeto de robótica e IoT na indústria do agro, desenvolvido pelo **2º ano do curso técnico em Desenvolvimento de Sistemas** em colaboração com o **1º ano de Marketing Digital**.

## O que o projeto faz

- **Painel ao vivo** com temperatura, umidade do ar, umidade do solo e luminosidade.
- **Histórico** das últimas 24 leituras em gráfico.
- **Irrigação automática** com histerese (liga abaixo do mínimo, desliga acima de mínimo + 8%).
- **Controle manual** da bomba pelo painel.
- **Modo simulação** para demonstrar sem hardware.
- **API aberta** para ESP32 ou Arduino enviarem leituras.
- **Diagnóstico por IA**: envie uma foto da folha e receba hipóteses, confiança e cuidados.
- **Configuração de limites** de solo e temperatura.

## Stack

- Next.js 16 (App Router) + React 19 + TypeScript
- Tailwind CSS 4
- IA plugável: Gemini (padrão, com visão), DeepSeek ou Groq
- Hardware: ESP32 (Wi-Fi) **ou** Arduino UNO/Nano + bridge serial USB, com DHT22, sensor capacitivo de solo, LDR, relé e bomba

## Rodando

```powershell
npm install
Copy-Item .env.example .env.local
npm run dev
```

Acesse `http://localhost:3000`.

**No Windows:** dê duplo clique em `run.bat`. Ele instala as dependências na primeira vez, cria o `.env.local` se necessário e inicia o app.

Sem chave de IA, o diagnóstico cai em um **checklist local**. Sem hardware, use a página **Simulador** para gerar leituras.

## Variáveis de ambiente

| Variável | Para que serve |
|---|---|
| `IA_PROVIDER` | `gemini` (padrão), `deepseek` ou `groq` |
| `GEMINI_API_KEY` / `GEMINI_MODEL` | Chave e modelo do Gemini (visão para diagnóstico) |
| `DEEPSEEK_API_KEY` / `DEEPSEEK_MODEL` | Chave e modelo da DeepSeek (texto) |
| `GROQ_API_KEY` / `GROQ_MODEL` | Chave e modelo da Groq (texto) |
| `ESTUFA_TOKEN` | Opcional: token que o ESP32 ou o bridge do Arduino enviam no header `x-estufa-token` |

## API

### `GET /api/estufa/leituras`

Retorna o estado atual:

```json
{
  "leituras": [
    {
      "id": 24,
      "temperatura": 26.4,
      "umidadeAr": 62,
      "umidadeSolo": 34,
      "luz": 540,
      "bombaLigada": true,
      "criadaEm": "2026-11-04T12:00:00.000Z"
    }
  ],
  "bombaLigada": true,
  "modo": "auto",
  "limites": { "umidadeSoloMin": 35, "umidadeSoloMax": 70, "temperaturaMax": 34 },
  "atualizadoEm": "2026-11-04T12:00:00.000Z",
  "fonte": "simulacao"
}
```

### `POST /api/estufa/leituras`

Recebe uma leitura do painel, do ESP32 ou do Arduino:

```json
{
  "temperatura": 26.5,
  "umidadeAr": 61,
  "umidadeSolo": 32,
  "luz": 720,
  "fonte": "esp32"
}
```

Campos obrigatórios: `temperatura`, `umidadeAr`, `umidadeSolo`, `luz`.

### `POST /api/estufa/irrigar`

Ações:

```json
{ "acao": "ligar" }
{ "acao": "desligar" }
{ "acao": "auto" }
```

Limites:

```json
{
  "limites": {
    "umidadeSoloMin": 35,
    "umidadeSoloMax": 70,
    "temperaturaMax": 34
  }
}
```

### `POST /api/estufa/simular`

Gera uma leitura sintética com base no estado atual.

### `POST /api/ia/diagnostico`

```json
{
  "imagem": "data:image/jpeg;base64,...",
  "cultura": "alface"
}
```

Limite de 5 MB. A imagem é processada no servidor e não é armazenada.

## Estrutura

```
firmware/
  esp32_horta.ino        firmware do ESP32 (Wi-Fi)
  arduino_horta.ino      firmware do Arduino UNO/Nano (USB)
  bridge-serial/         ponte Node.js entre o Arduino e a API
HARDWARE.md              guia das duas opções de hardware
src/
  app/
    api/estufa/           leituras, irrigação e simulação
    api/ia/diagnostico/   análise de imagem
    diagnostico/          upload e resultado
    irrigacao/            configuração de limites
    simulador/            envio manual de leituras
    sobre/                hardware, arquitetura e colaboração
  components/             painel, gráfico, formulários
  lib/
    estufa.ts             estado em memória, regras e simulação
    ia.ts                 camada de IA (Gemini Vision + fallback)
```

## Persistência

As leituras ficam **em memória** no servidor (máximo de 120). Isso é suficiente para a feira, mas reinicia quando o servidor reinicia. Para evoluir:

1. Adicione `@libsql/client` e crie a tabela `leituras`.
2. Troque o array em `src/lib/estufa.ts` por consultas ao banco.
3. Configure `DATABASE_URL` apontando para Turso em produção.

## Hardware

O projeto aceita **duas configurações**. O guia completo, com calibração e solução de problemas, está em [HARDWARE.md](./HARDWARE.md).

### Opção A — ESP32 (Wi-Fi)

| Componente | Pino |
|---|---|
| DHT22 (dados) | GPIO 4 |
| Sensor de solo | GPIO 34 |
| LDR | GPIO 35 |
| Relé | GPIO 26 |

O firmware `firmware/esp32_horta.ino` envia os dados direto para a API pela rede Wi-Fi.

### Opção B — Arduino UNO/Nano + bridge USB

Ideal se você já tem placas Arduino. O Arduino não tem Wi-Fi: ele envia JSON pela USB e o script `firmware/bridge-serial` repassa para a API.

| Componente | Pino |
|---|---|
| DHT22 (dados) | D2 |
| Sensor de solo | A0 |
| LDR | A1 |
| Relé | D7 |

```powershell
cd firmware/bridge-serial
npm install
npm run listar
$env:SERIAL_PORT="COM3"
npm start
```

Se o app estiver na porta 3102 (menu da raiz), rode `run-bridge.bat 3102` ou use o atalho `Projeto3-AgroSmart\run-bridge.bat 3102`. O app e o bridge precisam estar em janelas separadas.

### Lista de materiais

| Item | Função |
|---|---|
| Arduino UNO/Nano ou ESP32 | Microcontrolador |
| DHT22 | Temperatura e umidade do ar |
| Sensor capacitivo de solo | Umidade do solo |
| LDR + resistor 10 kΩ | Luminosidade |
| Módulo relé 5V | Acionar a bomba |
| Mini bomba d'água 5V | Irrigação |
| Mangueira e reservatório | Circulação de água |
| Fonte 5V | Alimentação |

**Segurança:** use relé/driver para a bomba, mantenha a eletrônica longe da água e peça revisão de um adulto antes de ligar.

## Calibração do sensor de solo

**ESP32 (ADC de 12 bits):**

```cpp
const int SOLO_SECO = 3200;    // leitura no ar
const int SOLO_MOLHADO = 1200; // leitura na água
```

**Arduino UNO/Nano (ADC de 10 bits):**

```cpp
const int SOLO_SECO = 800;     // leitura no ar
const int SOLO_MOLHADO = 350;  // leitura na água
```

Coloque o sensor no ar, anote o valor; depois mergulhe em água (até a marca) e anote. Ajuste as constantes e grave novamente.

## Backlog para os alunos

### Sprint 1 — Base
- [ ] Validar a maquete e a segurança elétrica
- [ ] Revisar textos da página "Sobre" com Marketing
- [ ] Melhorar acessibilidade do painel
- [ ] Criar página de termos e privacidade

### Sprint 2 — Dados
- [ ] Persistir leituras em banco
- [ ] Adicionar gráfico separado de luminosidade
- [ ] Criar endpoint de exportação CSV
- [ ] Testar o hardware escolhido (ESP32 em rede local ou Arduino com bridge)

### Sprint 3 — IA e alertas
- [ ] Enviar alerta por Telegram quando o solo ficar seco
- [ ] Melhorar o prompt de diagnóstico com cultura e estágio
- [ ] Adicionar histórico de diagnósticos (sem armazenar imagens)
- [ ] Criar modo "professor" com perguntas guiadas

### Sprint 4 — Feira
- [ ] Modo quiosque no painel
- [ ] QR code para o simulador
- [ ] Roteiro de demonstração de 3 minutos
- [ ] Plano B com leituras simuladas

## Colaboração com Marketing Digital

| Entregável | Responsável |
|---|---|
| Identidade visual e nome | Marketing |
| Conteúdo sobre agro sustentável | Marketing |
| Posts e reels da maquete | Marketing |
| QR codes e materiais do estande | Marketing |
| Pesquisa com visitantes | Marketing |
| Firmware, API, painel e IA | DS |
| Roteiro técnico do pitch | DS + Marketing |

## Deploy

1. Publique na Vercel.
2. Configure a chave de IA.
3. **ESP32:** aponte `API_URL` para o IP do computador que roda o servidor (na rede local) ou para a URL pública.
4. **Arduino:** rode o app e o bridge no mesmo notebook; o bridge usa `http://localhost:3000` por padrão.
5. Em produção, o hardware precisa de uma URL pública ou de um túnel (ngrok, Cloudflare Tunnel).
6. Rode `npm run build` antes de publicar.

## Observações

- O projeto é educativo e não substitui assistência agronômica.
- A análise por imagem pode errar; sempre confirme presencialmente.
- Não armazene fotos enviadas pelos visitantes sem consentimento.

