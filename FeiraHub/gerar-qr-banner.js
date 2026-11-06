const fs = require("node:fs");
const path = require("node:path");
const QRCode = require("qrcode");

async function main() {
  const url = process.argv[2];

  if (!url) {
    console.error(
      "Uso: node gerar-qr-banner.js https://seu-site.pages.dev [caminho-base]",
    );
    process.exit(1);
  }

  let parsed;
  try {
    parsed = new URL(url);
  } catch {
    console.error("URL inválida. Informe uma URL completa, com https://.");
    process.exit(1);
  }

  if (parsed.protocol !== "https:") {
    console.warn("Atenção: o QR do banner deve apontar para uma URL HTTPS.");
  }

  const base =
    process.argv[3] ||
    path.join(__dirname, "..", "docs", "design", "assets", "banner-qr");

  const opcoes = {
    errorCorrectionLevel: "H",
    margin: 4,
    color: { dark: "#000000", light: "#FFFFFF" },
  };

  const svg = await QRCode.toString(url, {
    ...opcoes,
    type: "svg",
    width: 1024,
  });
  fs.writeFileSync(`${base}.svg`, svg);

  const png = await QRCode.toBuffer(url, {
    ...opcoes,
    type: "png",
    width: 2048,
  });
  fs.writeFileSync(`${base}.png`, png);

  console.log(`URL: ${url}`);
  console.log(`SVG: ${base}.svg`);
  console.log(`PNG: ${base}.png`);
  console.log(
    "Teste com pelo menos 3 celulares e uma prova impressa. Depois de congelar a URL, não altere o QR.",
  );
}

main().catch((erro) => {
  console.error(erro);
  process.exit(1);
});
