const http = require("node:http");
const fs = require("node:fs");
const path = require("node:path");
const os = require("node:os");
const dns = require("node:dns").promises;
const net = require("node:net");
const { spawn, execFile } = require("node:child_process");
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

const cacheProcessos = new Map();
const TTL_PROCESSO = 30_000;
const PROCESSOS_SEGUROS = new Set([
  "node",
  "node.exe",
  "cmd",
  "cmd.exe",
  "conhost",
  "conhost.exe",
  "npm",
  "npm.cmd",
  "powershell",
  "powershell.exe",
  "pwsh",
  "pwsh.exe",
]);

const ENTIDADES = {
  nbsp: " ",
  amp: "&",
  lt: "<",
  gt: ">",
  quot: '"',
  apos: "'",
  aacute: "á",
  agrave: "à",
  acirc: "â",
  atilde: "ã",
  ccedil: "ç",
  eacute: "é",
  ecirc: "ê",
  iacute: "í",
  oacute: "ó",
  ocirc: "ô",
  otilde: "õ",
  uacute: "ú",
  ordf: "ª",
  ordm: "º",
};

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

function executar(comando, argumentos, timeout = 8000) {
  return new Promise((resolve) => {
    execFile(
      comando,
      argumentos,
      {
        timeout,
        windowsHide: true,
        maxBuffer: 8 * 1024 * 1024,
      },
      (erro, stdout) => {
        resolve(erro ? "" : String(stdout));
      },
    );
  });
}

function decodificarEntidades(texto) {
  return String(texto).replace(/&(#x[0-9a-f]+|#\d+|[a-z]+);/gi, (original, codigo) => {
    const chave = codigo.toLowerCase();
    let numero = null;

    if (chave.startsWith("#x")) {
      numero = Number.parseInt(chave.slice(2), 16);
    } else if (chave.startsWith("#")) {
      numero = Number.parseInt(chave.slice(1), 10);
    } else {
      return ENTIDADES[chave] ?? original;
    }

    return Number.isInteger(numero) && numero >= 0 && numero <= 0x10ffff
      ? String.fromCodePoint(numero)
      : original;
  });
}

function normalizarTexto(texto) {
  return decodificarEntidades(texto)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/\s+/g, " ")
    .trim();
}

function normalizarCaminho(caminho) {
  return String(caminho).replace(/\\/g, "/").toLowerCase();
}

function pidsDoMapa(mapa) {
  const pids = new Set();
  for (const lista of mapa.values()) {
    for (const pid of lista) pids.add(pid);
  }
  return [...pids];
}

async function pidsEmEscuta(portas) {
  const alvo = new Set(portas.map(Number));
  const mapa = new Map();
  if (!alvo.size) return mapa;

  if (process.platform === "win32") {
    const saida = await executar("netstat", ["-ano", "-p", "TCP"]);
    for (const linha of saida.split(/\r?\n/)) {
      const partes = linha.trim().split(/\s+/);
      if (partes.length < 5 || partes[0].toUpperCase() !== "TCP") continue;
      if (partes[3].toUpperCase() !== "LISTENING") continue;
      const porta = Number(partes[1].split(":").pop());
      const pid = Number(partes[4]);
      if (!alvo.has(porta) || !Number.isFinite(pid) || pid <= 0) continue;
      if (!mapa.has(porta)) mapa.set(porta, new Set());
      mapa.get(porta).add(pid);
    }
    return mapa;
  }

  const saida = await executar("lsof", ["-nP", "-iTCP", "-sTCP:LISTEN"]);
  for (const linha of saida.split(/\r?\n/)) {
    const partes = linha.trim().split(/\s+/);
    if (partes.length < 9) continue;
    const pid = Number(partes[1]);
    const encontrado = (partes[8].match(/:(\d+)$/) ?? [])[1];
    const porta = Number(encontrado);
    if (!alvo.has(porta) || !Number.isFinite(pid) || pid <= 0) continue;
    if (!mapa.has(porta)) mapa.set(porta, new Set());
    mapa.get(porta).add(pid);
  }
  return mapa;
}

function guardarProcesso(item, consultadoEm) {
  const pid = Number(item.ProcessId ?? item.pid);
  if (!Number.isFinite(pid)) return;
  cacheProcessos.set(pid, {
    pid,
    pai: Number(item.ParentProcessId ?? item.pai) || 0,
    nome: String(item.Name ?? item.nome ?? "processo"),
    comando: String(item.CommandLine ?? item.comando ?? ""),
    consultadoEm,
  });
}

function podarCacheProcessos(agora) {
  if (cacheProcessos.size <= 500) return;
  for (const [pid, item] of cacheProcessos.entries()) {
    if (agora - item.consultadoEm > 300_000) cacheProcessos.delete(pid);
  }
}

function resultadoProcessos(pids) {
  const resultado = new Map();
  for (const pid of pids) {
    const item = cacheProcessos.get(pid);
    if (item && !item.inexistente) resultado.set(pid, item);
  }
  return resultado;
}

async function detalhesProcessos(pids) {
  const agora = Date.now();
  const alvo = [...new Set(pids)].filter((pid) => Number.isFinite(pid) && pid > 0);
  const faltando = alvo.filter((pid) => {
    const item = cacheProcessos.get(pid);
    return !item || agora - item.consultadoEm > TTL_PROCESSO;
  });

  if (faltando.length) {
    if (process.platform === "win32") {
      const filtro = faltando.map((pid) => `ProcessId=${pid}`).join(" OR ");
      const script =
        "$ErrorActionPreference='SilentlyContinue'; " +
        `Get-CimInstance Win32_Process -Filter "${filtro}" | ` +
        "Select-Object ProcessId,ParentProcessId,Name,CommandLine | ConvertTo-Json -Compress";
      const saida = await executar("powershell.exe", [
        "-NoProfile",
        "-NonInteractive",
        "-Command",
        script,
      ]);
      if (saida.trim()) {
        try {
          const bruto = JSON.parse(saida);
          for (const item of Array.isArray(bruto) ? bruto : [bruto]) {
            guardarProcesso(item, agora);
          }
        } catch {
          return resultadoProcessos(alvo);
        }
      }
    } else {
      const lista = faltando.join(",");
      const saida = await executar("ps", [
        "-o",
        "pid=,ppid=,comm=,args=",
        "-p",
        lista,
      ]);
      for (const linha of saida.split(/\r?\n/)) {
        const achado = linha.trim().match(/^(\d+)\s+(\d+)\s+(\S+)\s+(.*)$/);
        if (!achado) continue;
        guardarProcesso(
          {
            pid: Number(achado[1]),
            pai: Number(achado[2]),
            nome: achado[3],
            comando: achado[4],
          },
          agora,
        );
      }
    }

    for (const pid of faltando) {
      if (!cacheProcessos.has(pid)) {
        cacheProcessos.set(pid, {
          pid,
          pai: 0,
          nome: "desconhecido",
          comando: "",
          consultadoEm: agora,
          inexistente: true,
        });
      }
    }

    podarCacheProcessos(agora);
  }

  return resultadoProcessos(alvo);
}

async function ocupantesDasPortas(portas) {
  const pidsPorPorta = await pidsEmEscuta(portas);
  const infos = await detalhesProcessos(pidsDoMapa(pidsPorPorta));
  const mapa = new Map();

  for (const [porta, lista] of pidsPorPorta.entries()) {
    mapa.set(
      porta,
      [...lista].map(
        (pid) =>
          infos.get(pid) ?? {
            pid,
            nome: "desconhecido",
            comando: "",
            pai: 0,
          },
      ),
    );
  }

  return mapa;
}

async function arvoreProcessos() {
  const mapa = new Map();

  if (process.platform === "win32") {
    const script =
      "$ErrorActionPreference='SilentlyContinue'; " +
      "Get-CimInstance Win32_Process | " +
      "Select-Object ProcessId,ParentProcessId,Name,CommandLine | ConvertTo-Json -Compress";
    const saida = await executar(
      "powershell.exe",
      ["-NoProfile", "-NonInteractive", "-Command", script],
      15000,
    );
    if (!saida.trim()) return mapa;
    try {
      const bruto = JSON.parse(saida);
      for (const item of Array.isArray(bruto) ? bruto : [bruto]) {
        const pid = Number(item.ProcessId);
        if (!Number.isFinite(pid)) continue;
        mapa.set(pid, {
          pid,
          pai: Number(item.ParentProcessId) || 0,
          nome: String(item.Name ?? "processo"),
          comando: String(item.CommandLine ?? ""),
        });
      }
    } catch {
      return mapa;
    }
    return mapa;
  }

  const saida = await executar("ps", ["-e", "-o", "pid=,ppid=,comm=,args="]);
  for (const linha of saida.split(/\r?\n/)) {
    const achado = linha.trim().match(/^(\d+)\s+(\d+)\s+(\S+)\s+(.*)$/);
    if (!achado) continue;
    mapa.set(Number(achado[1]), {
      pid: Number(achado[1]),
      pai: Number(achado[2]),
      nome: achado[3],
      comando: achado[4],
    });
  }
  return mapa;
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

function quantidadeReserva(projeto) {
  const valor = Number(projeto?.portasReserva ?? CONFIG.portasReserva ?? 8);
  if (!Number.isFinite(valor) || valor < 0) return 8;
  return Math.min(50, Math.floor(valor));
}

function portasCandidatas(projeto) {
  const preferida = Number(projeto.porta);
  const portas = [];

  const adicionar = (porta) => {
    if (!Number.isInteger(porta)) return;
    if (porta <= 0 || porta >= 65536 || porta === PORTA_HUB) return;
    if (!portas.includes(porta)) portas.push(porta);
  };

  if (Number.isFinite(preferida)) {
    adicionar(preferida);
    for (let indice = 1; indice <= quantidadeReserva(projeto); indice += 1) {
      adicionar(preferida + indice);
    }
  }

  for (const faixa of projeto.faixasPortas ?? CONFIG.faixasPortas ?? []) {
    const inicio = Number(faixa.inicio);
    const fim = Number(faixa.fim);
    if (!Number.isFinite(inicio) || !Number.isFinite(fim)) continue;
    for (let porta = inicio; porta <= fim; porta += 1) adicionar(porta);
  }

  return portas;
}

function portasParaScan() {
  const portas = new Set();

  for (const projeto of CONFIG.projetos) {
    for (const porta of portasCandidatas(projeto)) portas.add(porta);
  }

  for (const item of gerenciados.values()) {
    const porta = Number(item.portaEfetiva);
    if (Number.isFinite(porta)) portas.add(porta);
  }

  portas.delete(PORTA_HUB);
  return [...portas].sort((a, b) => a - b);
}

function portasReservadas(projetoId) {
  const reservadas = new Set([PORTA_HUB]);

  for (const projeto of CONFIG.projetos) {
    if (projeto.id === projetoId) continue;
    const porta = Number(projeto.porta);
    if (Number.isFinite(porta)) reservadas.add(porta);
  }

  for (const [id, item] of gerenciados.entries()) {
    if (id === projetoId) continue;
    const porta = Number(item.portaEfetiva);
    if (Number.isFinite(porta)) reservadas.add(porta);
  }

  return reservadas;
}

function escolherPorta(projeto, deteccao) {
  const preferida = Number(projeto.porta);
  const reservadas = portasReservadas(projeto.id);
  const abertas = new Set(deteccao.portasAbertas);

  for (const porta of portasCandidatas(projeto)) {
    if (porta !== preferida && reservadas.has(porta)) continue;
    if (abertas.has(porta)) continue;
    return porta;
  }

  return null;
}

function projetoDoProcesso(info, cache) {
  if (!info) return null;
  if (cache?.has(info.pid)) return cache.get(info.pid);

  const comando = normalizarCaminho(info.comando ?? "");
  let encontrado = null;

  if (comando) {
    for (const projeto of CONFIG.projetos) {
      const pasta = normalizarCaminho(path.resolve(RAIZ, projeto.pasta));
      if (comando.includes(pasta)) {
        encontrado = projeto;
        break;
      }
    }
  }

  cache?.set(info.pid, encontrado);
  return encontrado;
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
  const normalizados = new Map();

  portasAbertas.forEach((porta, indice) => {
    mapa.set(porta, htmls[indice]);
    normalizados.set(porta, normalizarTexto(htmls[indice]));
  });

  const ocupantes = await ocupantesDasPortas(portasAbertas);

  return {
    portas,
    portasAbertas,
    htmls: mapa,
    htmlsNormalizados: normalizados,
    ocupantes,
    donos: new Map(),
  };
}

function marcadoresDoProjeto(projeto) {
  const lista = Array.isArray(projeto.marcadores)
    ? projeto.marcadores
    : [projeto.marcador ?? projeto.nome];

  return lista.map(normalizarTexto).filter(Boolean);
}

function contemMarcador(html, marcadores) {
  return marcadores.some((marcador) => marcador && html.includes(marcador));
}

function detectarProjeto(projeto, deteccao) {
  const marcadores = marcadoresDoProjeto(projeto);
  const portaConfigurada = Number(projeto.porta);
  const htmlConfigurada =
    deteccao.htmlsNormalizados.get(portaConfigurada) ?? "";

  if (contemMarcador(htmlConfigurada, marcadores)) {
    return {
      online: true,
      portaReal: portaConfigurada,
      portaOcupada: false,
      ocupante: null,
      portaOcupadaPor: null,
      processoDoProjeto: null,
    };
  }

  for (const [porta, html] of deteccao.htmlsNormalizados.entries()) {
    if (contemMarcador(html, marcadores)) {
      return {
        online: true,
        portaReal: porta,
        portaOcupada: false,
        ocupante: null,
        portaOcupadaPor: null,
        processoDoProjeto: null,
      };
    }
  }

  const listaOcupantes = deteccao.ocupantes.get(portaConfigurada) ?? [];
  const ocupante = listaOcupantes[0] ?? null;
  const donoConfigurada = projetoDoProcesso(ocupante, deteccao.donos);

  let processoDoProjeto = null;
  for (const [porta, lista] of deteccao.ocupantes.entries()) {
    for (const info of lista) {
      const dono = projetoDoProcesso(info, deteccao.donos);
      if (dono?.id === projeto.id) {
        processoDoProjeto = { porta, pid: info.pid, nome: info.nome };
        break;
      }
    }
    if (processoDoProjeto) break;
  }

  return {
    online: false,
    portaReal: null,
    portaOcupada: deteccao.portasAbertas.includes(portaConfigurada),
    ocupante: ocupante
      ? {
          pid: ocupante.pid,
          nome: ocupante.nome,
          projetoId: donoConfigurada?.id ?? null,
          projetoNome: donoConfigurada?.nome ?? null,
        }
      : null,
    portaOcupadaPor:
      donoConfigurada && donoConfigurada.id !== projeto.id
        ? { id: donoConfigurada.id, nome: donoConfigurada.nome }
        : null,
    processoDoProjeto,
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
  if (det.processoDoProjeto) {
    return {
      ok: false,
      erro: `Há um processo do próprio projeto sem resposta (PID ${det.processoDoProjeto.pid}) na porta ${det.processoDoProjeto.porta}. Use "Reiniciar" ou "Liberar porta".`,
    };
  }

  const porta = escolherPorta(projeto, deteccao);
  if (!porta) {
    return {
      ok: false,
      erro: `Nenhuma porta livre para ${projeto.nome}. Libere uma porta entre ${Number(projeto.porta)} e ${Number(projeto.porta) + quantidadeReserva(projeto)}.`,
    };
  }

  const modo = projeto.modo ?? CONFIG.modo ?? "dev";
  const comando = process.platform === "win32" ? "npm.cmd" : "npm";
  const argumentos = [
    "run",
    modo,
    "--",
    "-p",
    String(porta),
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

  gerenciados.set(id, {
    child,
    portaEfetiva: porta,
    iniciadoEm: new Date().toISOString(),
  });
  registrarLog(
    id,
    "hub",
    `Iniciando ${projeto.nome} em http://0.0.0.0:${porta} (${modo})...`,
  );
  if (porta !== Number(projeto.porta)) {
    registrarLog(
      id,
      "hub",
      `Porta ${projeto.porta} indisponível; usando a porta ${porta}.`,
    );
  }

  child.stdout.on("data", (dados) => registrarLog(id, "out", dados));
  child.stderr.on("data", (dados) => registrarLog(id, "err", dados));
  child.on("error", (erro) => {
    registrarLog(id, "hub", `Erro ao iniciar: ${erro.message}`);
  });
  child.on("exit", (codigo) => {
    registrarLog(id, "hub", `Processo encerrado (código ${codigo ?? "?"}).`);
    gerenciados.delete(id);
  });

  return {
    ok: true,
    porta,
    aviso:
      porta !== Number(projeto.porta)
        ? `Porta ${projeto.porta} ocupada; iniciado na porta ${porta}.`
        : null,
  };
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
    if (projeto.processoDoProjeto) {
      resultados.push({
        id: projeto.id,
        ok: false,
        erro: `Processo sem resposta na porta ${projeto.processoDoProjeto.porta}. Use "Reiniciar" ou "Limpar portas".`,
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

async function esperarPortaLivre(porta, ms = 6000) {
  const limite = Date.now() + ms;
  while (Date.now() < limite) {
    if (!(await portaAberta(porta))) return true;
    await new Promise((resolve) => setTimeout(resolve, 250));
  }
  return false;
}

function encerrarProcesso(pid) {
  return new Promise((resolve) => {
    treeKill(pid, "SIGTERM", (erro) => {
      if (!erro) return resolve(true);
      treeKill(pid, "SIGKILL", (erroFinal) => resolve(!erroFinal));
    });
  });
}

function processoEhSeguro(info) {
  if (!info || info.pid === process.pid) return false;
  return PROCESSOS_SEGUROS.has(String(info.nome).toLowerCase());
}

async function liberarPorta(id, portaPedida) {
  const projeto = projetoPorId(id);
  if (!projeto) return { ok: false, erro: "Projeto desconhecido." };

  if (gerenciados.has(projeto.id)) {
    return {
      ok: false,
      erro: "Este projeto foi iniciado pelo hub. Use o botão Parar.",
    };
  }

  const candidatas = new Set(portasCandidatas(projeto));
  const portas = new Set();
  const pedida = Number(portaPedida);

  if (Number.isFinite(pedida) && candidatas.has(pedida)) portas.add(pedida);

  if (!portas.size) {
    const deteccao = await detectarPortas();
    const det = detectarProjeto(projeto, deteccao);

    if (det.processoDoProjeto) portas.add(det.processoDoProjeto.porta);
    if (det.portaReal) portas.add(det.portaReal);
    if (det.portaOcupada) portas.add(Number(projeto.porta));

    for (const porta of [...portas]) {
      if (!candidatas.has(porta)) portas.delete(porta);
    }
  }

  if (!portas.size) {
    return { ok: false, erro: "Nenhuma porta ocupada para liberar." };
  }

  const pidsPorPorta = await pidsEmEscuta([...portas]);
  const pids = pidsDoMapa(pidsPorPorta).filter((pid) => pid !== process.pid);
  if (!pids.length) {
    return { ok: false, erro: "A porta já está livre." };
  }

  const arvore = await arvoreProcessos();
  const pastaProjeto = normalizarCaminho(path.resolve(RAIZ, projeto.pasta));
  const alvos = new Map();

  for (const pid of pids) {
    const info = arvore.get(pid);
    if (!info) continue;
    if (!processoEhSeguro(info)) {
      return {
        ok: false,
        erro: `A porta está ocupada por ${info.nome} (PID ${pid}), que não é um servidor Node. Encerre esse processo manualmente.`,
      };
    }

    let raiz = info;
    let atual = info;

    while (atual.pai && arvore.has(atual.pai)) {
      const pai = arvore.get(atual.pai);
      if (pai.pid === process.pid || !processoEhSeguro(pai)) break;

      const comando = normalizarCaminho(pai.comando ?? "");
      const usaPorta = [...portas].some((porta) =>
        new RegExp(`(^|\\s)-p\\s*${porta}(\\s|$)`).test(comando),
      );
      const relacionado =
        usaPorta || (pastaProjeto && comando.includes(pastaProjeto));

      if (!relacionado) break;
      raiz = pai;
      atual = pai;
    }

    alvos.set(raiz.pid, raiz);
  }

  if (!alvos.size) {
    return { ok: false, erro: "Não foi possível identificar o processo." };
  }

  const encerrados = [];
  for (const alvo of alvos.values()) {
    const encerrado = await encerrarProcesso(alvo.pid);
    if (encerrado) encerrados.push({ pid: alvo.pid, nome: alvo.nome });
  }

  for (const porta of portas) await esperarPortaLivre(porta, 5000);

  if (!encerrados.length) {
    return { ok: false, erro: "Não foi possível encerrar o processo." };
  }

  registrarLog(
    projeto.id,
    "hub",
    `Porta(s) liberada(s): ${[...portas].join(", ")}.`,
  );

  return { ok: true, encerrados, portas: [...portas] };
}

async function liberarPortasOcupadas() {
  const deteccao = await detectarPortas();
  const resultados = [];

  for (const projeto of CONFIG.projetos) {
    if (gerenciados.has(projeto.id)) continue;

    const det = detectarProjeto(projeto, deteccao);
    if (det.online) continue;

    if (!det.processoDoProjeto && !det.portaOcupada) continue;

    const porta = det.processoDoProjeto?.porta ?? Number(projeto.porta);
    resultados.push({
      id: projeto.id,
      porta,
      ...(await liberarPorta(projeto.id, porta)),
    });
  }

  return resultados;
}

async function reiniciarProjeto(id) {
  const projeto = projetoPorId(id);
  if (!projeto) return { ok: false, erro: "Projeto desconhecido." };

  const itemGerenciado = gerenciados.get(id);
  if (itemGerenciado) {
    const portaAnterior =
      Number(itemGerenciado.portaEfetiva) || Number(projeto.porta);
    const parado = await pararProjeto(id);
    if (!parado.ok) return parado;
    await esperarPortaLivre(portaAnterior, 5000);
  }

  const deteccao = await detectarPortas();
  const det = detectarProjeto(projeto, deteccao);
  const portaParaLiberar =
    det.processoDoProjeto?.porta ?? det.portaReal ?? Number(projeto.porta);

  if (det.online || det.processoDoProjeto) {
    const liberado = await liberarPorta(projeto.id, portaParaLiberar);
    if (!liberado.ok) return liberado;
  }

  await esperarPortaLivre(Number(projeto.porta), 5000);

  return iniciarProjeto(id);
}

function validarConfig() {
  const avisos = [];
  const vistos = new Map();

  for (const projeto of CONFIG.projetos) {
    const porta = Number(projeto.porta);
    if (!Number.isInteger(porta) || porta < 1 || porta > 65535) {
      avisos.push(`${projeto.nome}: porta inválida (${projeto.porta}).`);
      continue;
    }
    if (porta === PORTA_HUB) {
      avisos.push(`${projeto.nome}: usa a mesma porta do hub (${PORTA_HUB}).`);
    }
    if (vistos.has(porta)) {
      avisos.push(
        `${projeto.nome} e ${vistos.get(porta)} estão configurados na mesma porta ${porta}.`,
      );
    } else {
      vistos.set(porta, projeto.nome);
    }
  }

  return avisos;
}

async function status(local) {
  const rede = await infoRede();
  const deteccao = await detectarPortas();

  const projetos = CONFIG.projetos.map((projeto) => {
    const det = detectarProjeto(projeto, deteccao);
    const itemGerenciado = gerenciados.get(projeto.id);
    const gerenciado = Boolean(itemGerenciado);
    const iniciadoEm = itemGerenciado?.iniciadoEm ?? null;
    const idade = iniciadoEm ? Date.now() - new Date(iniciadoEm).getTime() : 0;
    const iniciando = Boolean(gerenciado && !det.online && idade < 120_000);
    const semResposta = Boolean(!det.online && det.processoDoProjeto);
    const estado = det.online
      ? "online"
      : iniciando
        ? "iniciando"
        : semResposta
          ? "sem-resposta"
          : det.portaOcupada
            ? "porta-ocupada"
            : "offline";

    const item = {
      ...projeto,
      ...det,
      gerenciado,
      iniciando,
      iniciadoEm,
      portaEfetiva: itemGerenciado?.portaEfetiva ?? null,
      portaSugerida:
        det.online || semResposta ? null : escolherPorta(projeto, deteccao),
      estado,
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
    avisos: validarConfig(),
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
      if (url.pathname === "/api/restart") {
        return json(res, 200, await reiniciarProjeto(corpo.id));
      }
      if (url.pathname === "/api/free-port") {
        if (corpo.confirmar !== true) {
          return json(res, 400, {
            ok: false,
            erro: "Confirmação obrigatória para encerrar processos.",
          });
        }
        return json(res, 200, await liberarPorta(corpo.id, corpo.porta));
      }
      if (url.pathname === "/api/free-all") {
        if (corpo.confirmar !== true) {
          return json(res, 400, {
            ok: false,
            erro: "Confirmação obrigatória para encerrar processos.",
          });
        }
        return json(res, 200, { resultados: await liberarPortasOcupadas() });
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
