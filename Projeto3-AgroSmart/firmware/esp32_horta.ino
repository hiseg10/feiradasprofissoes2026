/*
 * AgroSmart — firmware da horta inteligente
 * Placa: ESP32 DevKit
 *
 * Ligações:
 *   DHT22 (dados)          -> GPIO 4
 *   Sensor de solo (AOUT)  -> GPIO 34
 *   LDR (divisor)          -> GPIO 35
 *   Relé da bomba (IN)     -> GPIO 26
 *
 * Ajuste WIFI_SSID, WIFI_SENHA e API_URL antes de gravar.
 * O servidor decide quando ligar a bomba e devolve o estado no JSON.
 */

#include <WiFi.h>
#include <HTTPClient.h>
#include <DHT.h>

const char* WIFI_SSID = "SUA_REDE";
const char* WIFI_SENHA = "SUA_SENHA";
const char* API_URL = "http://192.168.0.10:3000/api/estufa/leituras";
const char* ESTUFA_TOKEN = "";

#define PINO_DHT 4
#define TIPO_DHT DHT22
#define PINO_SOLO 34
#define PINO_LDR 35
#define PINO_RELE 26

DHT dht(PINO_DHT, TIPO_DHT);

const int SOLO_SECO = 3200;
const int SOLO_MOLHADO = 1200;

void conectarWiFi() {
  Serial.printf("Conectando em %s", WIFI_SSID);
  WiFi.mode(WIFI_STA);
  WiFi.begin(WIFI_SSID, WIFI_SENHA);
  int tentativas = 0;
  while (WiFi.status() != WL_CONNECTED && tentativas < 30) {
    delay(500);
    Serial.print(".");
    tentativas++;
  }
  if (WiFi.status() == WL_CONNECTED) {
    Serial.printf("\nConectado. IP: %s\n", WiFi.localIP().toString().c_str());
  } else {
    Serial.println("\nFalha ao conectar. Tentando novamente no loop.");
  }
}

float lerUmidadeSolo() {
  int bruto = analogRead(PINO_SOLO);
  int percentual = map(bruto, SOLO_SECO, SOLO_MOLHADO, 0, 100);
  return constrain(percentual, 0, 100);
}

float lerLuz() {
  int bruto = analogRead(PINO_LDR);
  return map(bruto, 0, 4095, 0, 1000);
}

void enviarLeitura(float temperatura, float umidadeAr, float umidadeSolo, float luz) {
  String corpo = String("{") +
    "\"temperatura\":" + String(temperatura, 1) + "," +
    "\"umidadeAr\":" + String(umidadeAr, 0) + "," +
    "\"umidadeSolo\":" + String(umidadeSolo, 0) + "," +
    "\"luz\":" + String(luz, 0) + "," +
    "\"fonte\":\"esp32\"" +
    "}";

  HTTPClient http;
  http.begin(API_URL);
  http.addHeader("Content-Type", "application/json");
  if (strlen(ESTUFA_TOKEN) > 0) {
    http.addHeader("x-estufa-token", ESTUFA_TOKEN);
  }

  int codigo = http.POST(corpo);
  if (codigo > 0) {
    String resposta = http.getString();
    bool ligarBomba = resposta.indexOf("\"bombaLigada\":true") >= 0;
    digitalWrite(PINO_RELE, ligarBomba ? HIGH : LOW);
    Serial.printf("HTTP %d | bomba: %s\n", codigo, ligarBomba ? "LIGADA" : "desligada");
    Serial.println(resposta);
  } else {
    Serial.printf("Falha HTTP: %d\n", codigo);
  }

  http.end();
}

void setup() {
  Serial.begin(115200);
  dht.begin();
  pinMode(PINO_RELE, OUTPUT);
  digitalWrite(PINO_RELE, LOW);
  conectarWiFi();
}

void loop() {
  if (WiFi.status() != WL_CONNECTED) {
    conectarWiFi();
    delay(2000);
    return;
  }

  float temperatura = dht.readTemperature();
  float umidadeAr = dht.readHumidity();

  if (isnan(temperatura) || isnan(umidadeAr)) {
    Serial.println("Falha ao ler o DHT22. Verifique a ligação.");
    delay(5000);
    return;
  }

  float umidadeSolo = lerUmidadeSolo();
  float luz = lerLuz();

  enviarLeitura(temperatura, umidadeAr, umidadeSolo, luz);

  // A bomba é comandada pelo servidor, mas o relé mantém o estado até a próxima leitura.
  delay(10000);
}
