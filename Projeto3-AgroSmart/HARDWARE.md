# Hardware do AgroSmart

O projeto funciona com **ESP32** (Wi-Fi) ou com **Arduino UNO/Nano** (USB + bridge no notebook). Escolha a opção conforme o material disponível.

## Comparação

| Item | ESP32 | Arduino UNO/Nano |
|---|---|---|
| Wi-Fi | Sim, nativo | Não |
| Conexão com a API | Direta | Bridge serial no notebook |
| ADC | 12 bits (0–4095) | 10 bits (0–1023) |
| Preço aproximado | R$ 45–60 | R$ 35–50 (placa que você já tem) |
| Complexidade | Baixa | Baixa (com o bridge pronto) |
| Precisa de notebook | Só para o app | Sim, para o app + bridge |
| Recomendação | Se conseguir o ESP32 | Melhor opção com o material atual |

> **Resumo:** com Arduino você não fica impedido de participar. O bridge serial faz o papel do Wi-Fi.

## Opção A — ESP32

### Ligações

| Componente | Pino |
|---|---|
| DHT22 (dados) | GPIO 4 |
| Sensor de solo (AOUT) | GPIO 34 |
| LDR (divisor) | GPIO 35 |
| Relé da bomba (IN) | GPIO 26 |
| Alimentação | 5V e GND |

### Firmware

1. Abra `firmware/esp32_horta.ino` na Arduino IDE.
2. Instale a biblioteca **DHT sensor library** (Adafruit) e **Adafruit Unified Sensor**.
3. Ajuste `WIFI_SSID`, `WIFI_SENHA` e `API_URL` (IP do notebook que roda o app).
4. Se usar `ESTUFA_TOKEN`, coloque o mesmo valor no firmware e no `.env.local`.
5. Grave e abra o Monitor Serial para conferir as leituras.

### Calibração

```cpp
const int SOLO_SECO = 3200;    // leitura no ar
const int SOLO_MOLHADO = 1200; // leitura na água
```

## Opção B — Arduino UNO/Nano + bridge serial

### Ligações

| Componente | Pino |
|---|---|
| DHT22 (dados) | D2 |
| Sensor de solo (AOUT) | A0 |
| LDR (divisor) | A1 |
| Relé da bomba (IN) | D7 |
| Alimentação | 5V e GND |

### Como funciona

```
Arduino (USB)  →  bridge.js  →  POST /api/estufa/leituras
       ↑                              │
       └────── "BOMBA:1" / "BOMBA:0" ─┘
```

O Arduino envia uma linha JSON a cada 10 segundos. O bridge repassa para a API e devolve o estado da bomba.

### 1. Gravar o firmware

1. Abra `firmware/arduino_horta.ino` na Arduino IDE.
2. Instale a biblioteca **DHT sensor library** (Adafruit) e **Adafruit Unified Sensor**.
3. Selecione a placa (Arduino UNO ou Nano) e a porta.
4. Grave o código.

### 2. Calibrar o sensor de solo

O Arduino tem ADC de 10 bits (0 a 1023):

```cpp
const int SOLO_SECO = 800;    // sensor no ar
const int SOLO_MOLHADO = 350; // sensor na água
```

Coloque o sensor no ar, abra o Monitor Serial e anote o valor. Depois mergulhe na água (até a marca) e anote de novo. Ajuste as constantes e grave novamente.

### 3. Rodar o bridge

Feche o **Monitor Serial** da Arduino IDE (ele ocupa a porta).

**Atalho no Windows:** dê duplo clique em `run-bridge.bat` (na pasta do bridge) ou em `..\..\run-bridge.bat` (na raiz do AgroSmart). Ele instala, lista as portas, pergunta a COM e inicia.

Manual:

```powershell
cd firmware/bridge-serial
npm install
npm run listar
```

Descubra a porta (ex.: `COM3`) e rode:

```powershell
$env:SERIAL_PORT="COM3"
npm start
```

Saída esperada:

```
Conectado em COM3 a 9600 baud.
Enviando leituras para http://localhost:3000/api/estufa/leituras
Leitura enviada | solo 32% | temp 26.4°C | bomba LIGADA
```

### 4. Testar

1. Abra o app em `http://localhost:3000`.
2. O selo deve mostrar **Sensor Arduino**.
3. Aproxime o sensor de solo da água e veja a leitura subir.
4. Se o solo ficar abaixo do mínimo, a bomba deve ligar.

## Contrato da API

```json
POST /api/estufa/leituras
Content-Type: application/json

{
  "temperatura": 26.5,
  "umidadeAr": 61,
  "umidadeSolo": 32,
  "luz": 720,
  "fonte": "arduino"
}
```

Aceita `fonte: "esp32"`, `fonte: "arduino"` ou `fonte: "simulacao"`.

Se `ESTUFA_TOKEN` estiver definido no `.env.local`, envie o header:

```
x-estufa-token: SEU_TOKEN
```

O bridge já faz isso quando `ESTUFA_TOKEN` está definido no ambiente dele.

## Lista de materiais

| Item | Função | Estimativa |
|---|---|---|
| Arduino UNO/Nano ou ESP32 | Microcontrolador | R$ 35–60 |
| DHT22 | Temperatura e umidade do ar | R$ 25 |
| Sensor capacitivo de solo | Umidade do solo | R$ 20 |
| LDR + resistor 10 kΩ | Luminosidade | R$ 5 |
| Módulo relé 5V | Acionar a bomba | R$ 12 |
| Mini bomba d'água 5V | Irrigação | R$ 20 |
| Mangueira e reservatório | Circulação de água | R$ 25 |
| Fonte 5V | Alimentação | R$ 20 |
| Jumpers e protoboard | Montagem | R$ 15 |

## Se faltar algum sensor

Dá para demonstrar mesmo com o kit incompleto:

| Falta | Alternativa |
|---|---|
| DHT22 | Envie temperatura e umidade fixas no firmware ou use um potenciômetro em A2 |
| Sensor de solo | Use um potenciômetro em A0 para simular 0 a 100% de umidade |
| LDR | Envie um valor fixo de luz (ex.: 600) |
| Bomba d'água | Use um LED no lugar da bomba para mostrar o acionamento do relé |
| Relé | Use um LED com resistor no pino D7 para indicar a decisão do sistema |

O importante na feira é mostrar o ciclo **sensor → dados → decisão**. Mesmo com potenciômetros, o painel e a regra de irrigação funcionam de verdade.

## Segurança

- Use relé ou driver para a bomba; nunca ligue direto no pino do Arduino.
- Mantenha a eletrônica longe da água e do reservatório.
- Use fonte compatível com a bomba e com o relé.
- Peça revisão de um adulto antes de ligar.
- Não deixe o sistema ligado sem supervisão.

## Problemas comuns

| Problema | Solução |
|---|---|
| Porta não aparece | Instale o driver CH340/CP2102 e troque o cabo USB |
| Porta ocupada | Feche o Monitor Serial da Arduino IDE |
| Leitura errada de solo | Recalibre `SOLO_SECO` e `SOLO_MOLHADO` |
| DHT retorna `NaN` | Confira o resistor pull-up de 10 kΩ e a ligação |
| Bomba não liga | Confira o pino D7, o relé e a fonte externa |
| Bomba liga invertida | Muitos relés são ativos em LOW: inverta HIGH/LOW no firmware |
| API não recebe | Confirme se o app está rodando e se a URL está correta |
| Token inválido | Use o mesmo `ESTUFA_TOKEN` no app e no bridge |

## Plano para a feira

1. Monte a maquete com o Arduino preso e os fios organizados.
2. Deixe o notebook rodando o app e o bridge.
3. Abra o terminal do bridge ao lado do painel para mostrar os dados chegando.
4. Tenha o modo simulação como plano B.
5. Leve cabo USB reserva, jumpers e fonte extra.
