/*
 * AgroSmart — firmware para Arduino UNO / Nano / Mega
 * Placa: Arduino UNO R3 (ou compatível)
 *
 * O Arduino NÃO tem Wi-Fi. Ele envia uma linha JSON pela porta USB
 * e o script firmware/bridge-serial faz o POST para a API.
 *
 * Ligações:
 *   DHT22 (dados)          -> D2
 *   Sensor de solo (AOUT)  -> A0
 *   LDR (divisor)          -> A1
 *   Relé da bomba (IN)     -> D7
 *
 * Bibliotecas:
 *   - DHT sensor library (Adafruit)
 *   - Adafruit Unified Sensor
 *
 * O servidor decide quando ligar a bomba e devolve "BOMBA:1" ou "BOMBA:0".
 */

#include <DHT.h>

#define PINO_DHT 2
#define TIPO_DHT DHT22
#define PINO_SOLO A0
#define PINO_LDR A1
#define PINO_RELE 7

DHT dht(PINO_DHT, TIPO_DHT);

// Calibração para Arduino (ADC de 10 bits, 0 a 1023).
// Coloque o sensor no ar e anote o valor; depois na água e anote de novo.
const int SOLO_SECO = 800;
const int SOLO_MOLHADO = 350;

// Muitos módulos de relé são ativos em LOW. Se a bomba ligar invertida,
// troque HIGH por LOW (e vice-versa) nas chamadas digitalWrite do relé.

const unsigned long INTERVALO_LEITURA = 10000;
unsigned long ultimaLeitura = 0;
String comando = "";

float lerUmidadeSolo() {
  int bruto = analogRead(PINO_SOLO);
  int percentual = map(bruto, SOLO_SECO, SOLO_MOLHADO, 0, 100);
  return constrain(percentual, 0, 100);
}

float lerLuz() {
  int bruto = analogRead(PINO_LDR);
  return map(bruto, 0, 1023, 0, 1000);
}

void processarComando(const String &linha) {
  if (!linha.startsWith("BOMBA:")) return;
  int valor = linha.substring(6).toInt();
  digitalWrite(PINO_RELE, valor ? HIGH : LOW);
  Serial.print("RELE:");
  Serial.println(valor ? 1 : 0);
}

void lerComandos() {
  while (Serial.available() > 0) {
    char caractere = (char)Serial.read();
    if (caractere == '\n') {
      comando.trim();
      if (comando.length() > 0) processarComando(comando);
      comando = "";
    } else if (caractere != '\r') {
      comando += caractere;
    }
  }
}

void enviarLeitura() {
  float temperatura = dht.readTemperature();
  float umidadeAr = dht.readHumidity();

  if (isnan(temperatura) || isnan(umidadeAr)) {
    Serial.println("ERRO:DHT");
    return;
  }

  float umidadeSolo = lerUmidadeSolo();
  float luz = lerLuz();

  // Uma linha JSON por leitura. O bridge serial lê esta linha.
  Serial.print("{\"temperatura\":");
  Serial.print(temperatura, 1);
  Serial.print(",\"umidadeAr\":");
  Serial.print(umidadeAr, 0);
  Serial.print(",\"umidadeSolo\":");
  Serial.print(umidadeSolo, 0);
  Serial.print(",\"luz\":");
  Serial.print(luz, 0);
  Serial.println(",\"fonte\":\"arduino\"}");
}

void setup() {
  Serial.begin(9600);
  dht.begin();
  pinMode(PINO_RELE, OUTPUT);
  digitalWrite(PINO_RELE, LOW);
}

void loop() {
  lerComandos();

  if (millis() - ultimaLeitura >= INTERVALO_LEITURA) {
    ultimaLeitura = millis();
    enviarLeitura();
  }
}
