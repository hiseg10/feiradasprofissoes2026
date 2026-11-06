/*
 * Bridge serial do AgroSmart
 *
 * Lê as linhas JSON enviadas pelo Arduino pela porta USB, faz POST para a API
 * e devolve o estado da bomba para o Arduino no formato "BOMBA:1" ou "BOMBA:0".
 *
 * Uso:
 *   node bridge.js --list
 *   node bridge.js
 *
 * Variáveis:
 *   SERIAL_PORT   porta do Arduino (ex.: COM3 ou /dev/ttyUSB0)
 *   SERIAL_BAUD   velocidade (padrão 9600)
 *   API_URL       padrão http://localhost:3000/api/estufa/leituras
 *   ESTUFA_TOKEN  opcional, se configurado no .env.local do app
 */

const { SerialPort } = require("serialport");
const { ReadlineParser } = require("@serialport/parser-readline");

const PORTA = process.env.SERIAL_PORT || "COM3";
const BAUD = Number(process.env.SERIAL_BAUD || 9600);
const API = process.env.API_URL || "http://localhost:3000/api/estufa/leituras";
const TOKEN = process.env.ESTUFA_TOKEN || "";

async function listarPortas() {
  try {
    const portas = await SerialPort.list();
    if (!portas.length) {
      console.log("Nenhuma porta serial encontrada. O Arduino está conectado?");
      return;
    }
    console.table(
      portas.map((porta) => ({
        porta: porta.path,
        fabricante: porta.manufacturer || "",
        descricao: porta.friendlyName || porta.pnpId || "",
      })),
    );
  } catch (erro) {
    console.error("Erro ao listar portas:", erro.message);
  }
}

function iniciar() {
  const porta = new SerialPort({ path: PORTA, baudRate: BAUD });
  const leitor = porta.pipe(new ReadlineParser({ delimiter: "\n" }));

  porta.on("open", () => {
    console.log(`Conectado em ${PORTA} a ${BAUD} baud.`);
    console.log(`Enviando leituras para ${API}`);
    console.log("Pressione Ctrl+C para encerrar.");
  });

  porta.on("error", (erro) => {
    console.error("Erro na porta serial:", erro.message);
    console.error("Feche o Monitor Serial da Arduino IDE e confira a porta com --list.");
  });

  leitor.on("data", async (linha) => {
    const texto = String(linha).trim();
    if (!texto.startsWith("{")) {
      if (texto) console.log("Arduino:", texto);
      return;
    }

    let dados;
    try {
      dados = JSON.parse(texto);
    } catch {
      console.error("JSON inválido recebido:", texto);
      return;
    }

    try {
      const resposta = await fetch(API, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(TOKEN ? { "x-estufa-token": TOKEN } : {}),
        },
        body: JSON.stringify({ ...dados, fonte: "arduino" }),
      });

      if (!resposta.ok) {
        console.error(`API respondeu ${resposta.status}:`, await resposta.text());
        return;
      }

      const estado = await resposta.json();
      const bomba = Boolean(estado.bombaLigada);
      porta.write(`BOMBA:${bomba ? 1 : 0}\n`);

      const ultima = estado.leituras?.[estado.leituras.length - 1];
      console.log(
        `Leitura enviada | solo ${ultima?.umidadeSolo ?? "?"}% | temp ${ultima?.temperatura ?? "?"}°C | bomba ${bomba ? "LIGADA" : "desligada"}`,
      );
    } catch (erro) {
      console.error("Falha ao enviar para a API:", erro.message);
    }
  });
}

if (process.argv.includes("--list")) {
  listarPortas();
} else {
  iniciar();
}
