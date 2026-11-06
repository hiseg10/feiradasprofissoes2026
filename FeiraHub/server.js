const http = require("node:http");
const fs = require("node:fs");
const path = require("node:path");
const os = require("node:os");
const dns = require("node:dns").promises;
const net = require("node:net");
const { spawn } = require("node:child_process");
const QRCode = require("qrcode");
const treeKill = require("tree-kill");

const RAIZ = __dirname;
const CAMINHO_CONFIG = process.env.HUB_CONFIG || path.join(RAIZ, "config.json");
const CONFIG = JSON.parse(fs.readFileSync(CAMINHO_CONFIG, "utf8"));
const PORTA_HUB = Number(process.env.HUB_PORT || CONFIG.hubPort || 4000);
const AUTOSTART =
  process.argv.includes("--autostart") || process.env.AUTOSTART === "1";
const PUBLICO = path.join(RAIZ, "public");

const gerenciados = new Map();
const logs = new Map();

let cacheRede = null;
let cacheRedeEm = 0;

const MIME = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".svg": "image/svg+xml; charset=utf-8",
  ".png": "image/png",
};

function json(res, status, dados) {
  res.writeHead(status, {
    "Content-Type": "application/json; charset=utf-8",
    "Cache-Control": "no-store",
  });
  res.end(JSON.stringify(dados));
}

function lerJson(req) {
  return new Promise((resolve) => {
    let dados = "";
    req.on("data", (parte) => {
      dados += parte;
      if (dados.length > 1_000_000) req.destroy();
    });
    req.on("end", () => {
      try {
        resolve(JSON.parse(dados || "{}"));
      } catch {
        resolve({});
      }
    });
    req.on("error", () => resolve({}));
  });
}

function ehLocal(req) {
  const ip = req.socket.remoteAddress ?? "";
  return ip === "127.0.0.1" || ip === "::1" || ip === "::ffff:127.0.0.1";
}

function prioridadeIp(endereco) {
  if (endereco.startsWith("192.168.")) return 0;
  if (endereco.startsWith("10.")) return 1;
  if (/^172\.(1[6-9]|2\d|3[0-1])\./.test(endereco)) return 2;
  return 3;
}

function listarIps() {
  const interfaces = os.networkInterfaces();
  const ips = [];

  for (const [nome, enderecos] of Object.entries(interfaces)) {
    for (const endereco of enderecos ?? []) {
      if (endereco.family === "IPv4" && !endereco.internal) {
        ips.push({
          interface: nome,
          endereco: endereco.address,
          mascara: endereco.netmask,
          mac: endereco.mac,
        });
      }
    }
  }

  return ips;
}

function comTimeout(promessa, ms) {
  return Promise.race([
    promessa,
    new Promise((_, reject) => {
      const timer = setTimeout(() => reject(new Error("timeout")), ms);
      if (typeof timer.unref === "function") timer.unref();
    }),
  ]);
}

async function infoRede() {
  if (cacheRede && Date.now() - cacheRedeEm < 20_000) return cacheRede;

  const hostname = os.hostname();
  const ips = listarIps().sort(
    (a, b) => prioridadeIp(a.endereco) - prioridadeIp(b.endereco),
  );

  let hostnameIp = null;
  let mdns = null;

  try {
    hostnameIp = (await comTimeout(dns.lookup(hostname), 1200)).address;
  } catch {
    // hostname pode não resolver
  }

  try {
    mdns = (await comTimeout(dns.lookup(`${hostname}.local`), 1200)).address;
  } catch {
    // mDNS pode não estar disponível
  }

  cacheRede = { hostname, ips, hostnameIp, mdns, hubPort: PORTA_HUB };
  cacheRedeEm = Date.now();
  return cacheRede;
}

function portaAberta(porta) {
  return new Promise((resolve) => {
    const socket = net.connect({ port: porta, host: "127.0.0.1" });
    const finalizar = (aberta) => {
      socket.destroy();
      resolve(aberta);
    };

    socket.setTimeout(700);
    socket.once("connect", () => finalizar(true));
    socket.once("timeout", () => finalizar(false));
    socket.once("error", () => finalizar(false));
  });
}

function portasParaScan() {
  const portas = new Set(
    CONFIG.projetos.map((projeto) => Number(projeto.porta)),
  );

  for (const faixa of CONFIG.faixasPortas ?? []) {
    const inicio = Number(faixa.inicio);
    const fim = Number(faixa.fim);
    if (!Number.isFinite(inicio) || !Number.isFinite(fim)) continue;
    for (let porta = inicio; porta <= fim; porta += 1) {
      portas.add(porta);
    }
  }

  return [...portas].sort((a, b) => a - b);
}

async function htmlDaPorta(porta) {
  try {
    const resposta = await fetch(`http://127.0.0.1:${porta}/`, {
      signal: AbortSignal.timeout(3500),
      redirect: "follow",
      headers: { "User-Agent": "FeiraHub/1.0" },
    });
    if (!resposta.ok) return "";
    return await resposta.text();
  } catch {
    return "";
  }
}

async function detectarPortas() {
  const portas = portasParaScan();
  const abertas = await Promise.all(portas.map((porta) => portaAberta(porta)));
  const portasAbertas = portas.filter((_, indice) => abertas[indice]);
  const htmls = await Promise.all(
    portasAbertas.map((porta) => htmlDaPorta(porta)),
  );
  const mapa = new Map();

  portasAbertas.forEach((porta, indice) => {
    mapa.set(porta, htmls[indice]);
  });

  return { portas, portasAbertas, htmls: mapa };
}

function detectarProjeto(projeto, deteccao) {
  const marcador = projeto.marcador ?? projeto.nome;
  const htmlConfigurada = deteccao.htmls.get(projeto.porta) ?? "";

  if (htmlConfigurada.includes(marcador)) {
    return { online: true, portaReal: projeto.porta, portaOcupada: false };
  }

  for (const [porta, html] of deteccao.htmls.entries()) {
    if (html.includes(marcador)) {
      return { online: true, portaReal: porta, portaOcupada: false };
    }
  }

  return {
    online: false,
    portaReal: null,
    portaOcupada: deteccao.portasAbertas.includes(projeto.porta),
  };
}

function registrarLog(id, prefixo, texto) {
  const linhas = String(texto)
    .split(/\r?\n/)
    .map((linha) => linha.trimEnd())
    .filter((linha) => linha.trim().length > 0);

  if (!linhas.length) return;

  const atuais = logs.get(id) ?? [];
  for (const linha of linhas) {
    atuais.push(`[${prefixo}] ${linha}`);
  }
  if (atuais.length > 250) atuais.splice(0, atuais.length - 250);
  logs.set(id, atuais);
}

function projetoPorId(id) {
  return CONFIG.projetos.find((projeto) => projeto.id === id);
}

async function iniciarProjeto(id) {
  const projeto = projetoPorId(id);
  if (!projeto) return { ok: false, erro: "Projeto desconhecido." };
  if (gerenciados.has(id)) {
    return { ok: false, erro: "O hub já está gerenciando este projeto." };
  }

  const pasta = path.resolve(RAIZ, projeto.pasta);
  if (!fs.existsSync(pasta)) {
    return { ok: false, erro: `Pasta não encontrada: ${pasta}` };
  }
  if (!fs.existsSync(path.join(pasta, "node_modules"))) {
    return {
      ok: false,
      erro: "Dependências não instaladas. Rode o run.bat do projeto uma vez.",
    };
  }

  const deteccao = await detectarPortas();
  const det = detectarProjeto(projeto, deteccao);

  if (det.online) {
    return {
      ok: false,
      erro: `Já está rodando na porta ${det.portaReal}. Pare-o antes de iniciar novamente.`,
    };
  }
  if (det.portaOcupada) {
    return {
      ok: false,
      erro: `A porta ${projeto.porta} está ocupada por outro serviço.`,
    };
  }

  const modo = projeto.modo ?? CONFIG.modo ?? "dev";
  const comando = process.platform === "win32" ? "npm.cmd" : "npm";
  const argumentos = [
    "run",
    modo,
    "--",
    "-p",
    String(projeto.porta),
    "-H",
    "0.0.0.0",
  ];

  logs.set(id, []);

  const child = spawn(comando, argumentos, {
    cwd: pasta,
    shell: process.platform === "win32",
    windowsHide: true,
    env: { ...process.env, FORCE_COLOR: "0" },
  });

  gerenciados.set(id, { child, iniciadoEm: new Date().toISOString() });
  registrarLog(
    id,
    "hub",
    `Iniciando ${projeto.nome} em http://0.0.0.0:${projeto.porta} (${modo})...`,
  );

  child.stdout.on("data", (dados) => registrarLog(id, "out", dados));
  child.stderr.on("data", (dados) => registrarLog(id, "err", dados));
  child.on("error", (erro) => {
    registrarLog(id, "hub", `Erro ao iniciar: ${erro.message}`);
  });
  child.on("exit", (codigo) => {
    registrarLog(id, "hub", `Processo encerrado (código ${codigo ?? "?"}).`);
    gerenciados.delete(id);
  });

  return { ok: true };
}

function pararProjeto(id) {
  const item = gerenciados.get(id);
  if (!item) {
    return Promise.resolve({
      ok: false,
      erro: "Este projeto não foi iniciado pelo hub.",
    });
  }

  return new Promise((resolve) => {
    treeKill(item.child.pid, "SIGTERM", (erro) => {
      if (erro) {
        registrarLog(id, "hub", `Falha ao encerrar: ${erro.message}`);
        resolve({ ok: false, erro: erro.message });
        return;
      }
      gerenciados.delete(id);
      registrarLog(id, "hub", "Processo encerrado pelo hub.");
      resolve({ ok: true });
    });
  });
}

async function iniciarTodos() {
  const estadoAtual = await status(false);
  const resultados = [];

  for (const projeto of estadoAtual.projetos) {
    if (projeto.online) {
      resultados.push({
        id: projeto.id,
        ok: false,
        erro: `Já está online na porta ${projeto.portaReal}.`,
      });
      continue;
    }
    if (projeto.portaOcupada) {
      resultados.push({
        id: projeto.id,
        ok: false,
        erro: `Porta ${projeto.porta} ocupada por outro serviço.`,
      });
      continue;
    }
    resultados.push({
      id: projeto.id,
      ...(await iniciarProjeto(projeto.id)),
    });
  }

  return resultados;
}

async function pararTodos() {
  const resultados = [];
  for (const id of [...gerenciados.keys()]) {
    resultados.push({ id, ...(await pararProjeto(id)) });
  }
  return resultados;
}

async function status(local) {
  const rede = await infoRede();
  const deteccao = await detectarPortas();

  const projetos = CONFIG.projetos.map((projeto) => {
    const det = detectarProjeto(projeto, deteccao);
    const gerenciado = gerenciados.has(projeto.id);
    const item = {
      ...projeto,
      ...det,
      gerenciado,
      iniciando: gerenciado && !det.online,
    };
    if (local) {
      item.logs = (logs.get(projeto.id) ?? []).slice(-30);
    }
    return item;
  });

  return {
    hubPort: PORTA_HUB,
    rede,
    portasScan: deteccao.portas,
    projetos,
  };
}

async function gerarQr(texto, formato) {
  const opcoes = {
    margin: 1,
    width: 320,
    color: { dark: "#0B1220", light: "#FFFFFF" },
  };

  if (formato === "svg") {
    return {
      tipo: "image/svg+xml; charset=utf-8",
      dados: await QRCode.toString(texto, { ...opcoes, type: "svg" }),
    };
  }

  return {
    tipo: "image/png",
    dados: await QRCode.toBuffer(texto, { ...opcoes, type: "png" }),
  };
}

function servirArquivo(res, nome) {
  const caminho = path.join(PUBLICO, nome);

  if (!caminho.startsWith(PUBLICO) || !fs.existsSync(caminho)) {
    res.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
    res.end("Arquivo não encontrado.");
    return;
  }

  res.writeHead(200, {
    "Content-Type": MIME[path.extname(caminho)] ?? "application/octet-stream",
    "Cache-Control": "no-store",
  });
  fs.createReadStream(caminho).pipe(res);
}

const servidor = http.createServer(async (req, res) => {
  try {
    const url = new URL(req.url, `http://${req.headers.host || "localhost"}`);
    const local = ehLocal(req);

    if (
      req.method === "GET" &&
      (url.pathname === "/" || url.pathname === "/index.html")
    ) {
      return servirArquivo(res, "index.html");
    }

    if (req.method === "GET" && url.pathname === "/app.js") {
      return servirArquivo(res, "app.js");
    }

    if (req.method === "GET" && url.pathname === "/styles.css") {
      return servirArquivo(res, "styles.css");
    }

    if (req.method === "GET" && url.pathname === "/api/status") {
      const dados = await status(local);
      dados.local = local;
      return json(res, 200, dados);
    }

    if (req.method === "GET" && url.pathname === "/api/qr") {
      const texto = url.searchParams.get("text");
      if (!texto) {
        return json(res, 400, { erro: "Informe o parâmetro text." });
      }

      const formato =
        (url.searchParams.get("format") ?? "png").toLowerCase() === "svg"
          ? "svg"
          : "png";
      const qr = await gerarQr(texto, formato);
      const cabecalhos = {
        "Content-Type": qr.tipo,
        "Cache-Control": "no-store",
      };

      if (url.searchParams.get("download") === "1") {
        const nome =
          (url.searchParams.get("nome") || "qrcode").replace(
            /[^a-zA-Z0-9-_]/g,
            "",
          ) || "qrcode";
        cabecalhos["Content-Disposition"] =
          `attachment; filename="${nome}.${formato}"`;
      }

      res.writeHead(200, cabecalhos);
      return res.end(qr.dados);
    }

    if (req.method === "POST" && url.pathname.startsWith("/api/")) {
      if (!local) {
        return json(res, 403, {
          erro: "Controles disponíveis apenas no notebook.",
        });
      }

      const corpo = await lerJson(req);

      if (url.pathname === "/api/start") {
        return json(res, 200, await iniciarProjeto(corpo.id));
      }
      if (url.pathname === "/api/stop") {
        return json(res, 200, await pararProjeto(corpo.id));
      }
      if (url.pathname === "/api/start-all") {
        return json(res, 200, { resultados: await iniciarTodos() });
      }
      if (url.pathname === "/api/stop-all") {
        return json(res, 200, { resultados: await pararTodos() });
      }

      return json(res, 404, { erro: "Rota de API não encontrada." });
    }

    if (req.method === "GET" && url.pathname === "/health") {
      return json(res, 200, { ok: true });
    }

    return json(res, 404, { erro: "Rota não encontrada." });
  } catch (erro) {
    console.error(erro);
    return json(res, 500, { erro: erro.message });
  }
});

servidor.listen(PORTA_HUB, "0.0.0.0", async () => {
  console.log(`\nFeira Hub rodando em http://localhost:${PORTA_HUB}`);
  const rede = await infoRede();
  const ip = rede.ips[0]?.endereco;

  if (ip) {
    console.log(`Na rede local: http://${ip}:${PORTA_HUB}`);
  } else {
    console.log(
      "Nenhum IP de rede encontrado. Conecte o notebook ao Wi-Fi para os celulares acessarem.",
    );
  }

  if (AUTOSTART) {
    console.log("Autostart ativado. Iniciando projetos...");
    const resultados = await iniciarTodos();
    console.log(resultados);
  }
});

servidor.on("error", (erro) => {
  console.error("Erro no hub:", erro.message);
  if (erro.code === "EADDRINUSE") {
    console.error(
      `A porta ${PORTA_HUB} já está em uso. Defina HUB_PORT com outra porta.`,
    );
  }
  process.exit(1);
});

let encerrando = false;
async function encerrar() {
  if (encerrando) return;
  encerrando = true;
  console.log("\nEncerrando hub e projetos iniciados por ele...");
  await pararTodos();
  process.exit(0);
}

process.on("SIGINT", encerrar);
process.on("SIGTERM", encerrar);
