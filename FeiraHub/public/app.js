let estado = null;
let ipEscolhido = localStorage.getItem("feirahub:ip") || "";
let ultimaAssinatura = "";

const elProjetos = document.getElementById("projetos");
const elRede = document.getElementById("rede-conteudo");
const elPrint = document.getElementById("print-cabecalho");

function escapar(texto) {
  return String(texto).replace(/[&<>"']/g, (caractere) => {
    const mapa = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;",
    };
    return mapa[caractere];
  });
}

function assinatura(dados) {
  return JSON.stringify({
    ip: ipEscolhido,
    local: dados.local,
    ips: dados.rede.ips.map((item) => item.endereco),
    projetos: dados.projetos.map((projeto) => [
      projeto.id,
      projeto.online,
      projeto.portaReal,
      projeto.portaOcupada,
      projeto.gerenciado,
      projeto.iniciando,
      projeto.logs?.length ?? 0,
    ]),
  });
}

async function carregar(forcar = false) {
  try {
    const resposta = await fetch("/api/status", { cache: "no-store" });
    if (!resposta.ok) throw new Error(`status ${resposta.status}`);

    const dados = await resposta.json();

    if (
      !ipEscolhido ||
      !dados.rede.ips.some((item) => item.endereco === ipEscolhido)
    ) {
      ipEscolhido = dados.rede.ips[0]?.endereco ?? "localhost";
    }

    estado = dados;
    const novaAssinatura = assinatura(dados);

    if (forcar || novaAssinatura !== ultimaAssinatura) {
      ultimaAssinatura = novaAssinatura;
      render();
    }
  } catch (erro) {
    elProjetos.innerHTML = `<div class="card erro">Falha ao falar com o hub: ${escapar(
      erro.message,
    )}</div>`;
  }
}

function render() {
  if (!estado) return;
  renderRede();
  renderProjetos();
  renderBotoes();
}

function renderRede() {
  const rede = estado.rede;

  const opcoes = rede.ips.length
    ? rede.ips
        .map(
          (item) =>
            `<option value="${escapar(item.endereco)}"${
              item.endereco === ipEscolhido ? " selected" : ""
            }>${escapar(item.endereco)} — ${escapar(item.interface)}</option>`,
        )
        .join("")
    : `<option value="localhost" selected>localhost</option>`;

  const urlHub = `http://${ipEscolhido}:${estado.hubPort}`;

  elRede.innerHTML = `
    <div class="rede-info">
      <p><span>Notebook</span><strong>${escapar(rede.hostname)}</strong></p>
      <p><span>IP do QR</span><select id="seletor-ip">${opcoes}</select></p>
      <p><span>Hub</span><a href="${urlHub}" target="_blank" rel="noreferrer">${escapar(
        urlHub,
      )}</a></p>
      <p><span>mDNS</span>${
        rede.mdns
          ? `<code>${escapar(rede.hostname)}.local</code>`
          : "<em>indisponível</em>"
      }</p>
      ${
        rede.ips.length
          ? ""
          : `<p class="aviso">Nenhum IP de rede encontrado. Conecte o notebook ao Wi-Fi para os celulares acessarem.</p>`
      }
      <p class="dica">O celular precisa estar na mesma rede Wi-Fi. Se não abrir, libere o Node.js no firewall do Windows.</p>
    </div>
    <div class="rede-qr">
      <img src="/api/qr?text=${encodeURIComponent(
        urlHub,
      )}&format=svg" alt="QR code do hub" width="160" height="160">
      <span>QR do hub</span>
    </div>
  `;

  const seletor = document.getElementById("seletor-ip");
  if (seletor) {
    seletor.addEventListener("change", (evento) => {
      ipEscolhido = evento.target.value;
      localStorage.setItem("feirahub:ip", ipEscolhido);
      render();
      ultimaAssinatura = assinatura(estado);
    });
  }

  elPrint.innerHTML = `
    <h1>QR Codes — Feira das Profissões Florestan 2026</h1>
    <p>Rede: ${escapar(ipEscolhido)} · Hub: ${escapar(urlHub)}</p>
  `;
}

function renderProjetos() {
  const abertos = new Set(
    [...document.querySelectorAll("details.logs[open]")].map(
      (elemento) => elemento.dataset.logId,
    ),
  );

  elProjetos.innerHTML = estado.projetos
    .map((projeto) => {
      const porta = projeto.portaReal ?? projeto.porta;
      const url = `http://${ipEscolhido}:${porta}`;
      const status = projeto.online
        ? "online"
        : projeto.iniciando
          ? "iniciando"
          : "offline";
      const rotulo = projeto.online
        ? "Online"
        : projeto.iniciando
          ? "Iniciando..."
          : "Offline";

      let acoes = "";

      if (estado.local) {
        if (projeto.online) {
          const detalhePorta =
            projeto.portaReal && projeto.portaReal !== projeto.porta
              ? ` · porta ${projeto.portaReal}`
              : "";
          acoes = projeto.gerenciado
            ? `<button class="btn perigo" data-acao="stop" data-id="${projeto.id}">Parar</button>`
            : `<span class="tag externo">iniciado fora do hub${detalhePorta}</span>`;
        } else if (projeto.iniciando) {
          acoes = `<button class="btn" disabled>Iniciando...</button>`;
        } else if (projeto.portaOcupada) {
          acoes = `<button class="btn" disabled title="Outro serviço está usando esta porta">Porta ocupada</button>`;
        } else {
          acoes = `<button class="btn primario" data-acao="start" data-id="${projeto.id}">Iniciar</button>`;
        }
      } else {
        acoes = `<span class="tag">controle apenas no notebook</span>`;
      }

      const logs = projeto.logs?.length
        ? `<details class="logs" data-log-id="${projeto.id}"${
            abertos.has(projeto.id) ? " open" : ""
          }><summary>Logs (${projeto.logs.length})</summary><pre>${escapar(
            projeto.logs.join("\n"),
          )}</pre></details>`
        : "";

      return `
        <article class="card projeto" style="--cor:${escapar(projeto.cor)}">
          <div class="projeto-topo">
            <span class="dot"></span>
            <h3>${escapar(projeto.nome)}</h3>
            <span class="badge ${status}">${rotulo}</span>
          </div>
          <p class="descricao">${escapar(projeto.descricao ?? "")}</p>
          <p class="detalhe">Pasta <code>${escapar(projeto.pasta)}</code> · Porta configurada <strong>${projeto.porta}</strong>${
            projeto.portaReal && projeto.portaReal !== projeto.porta
              ? ` · rodando na <strong>${projeto.portaReal}</strong>`
              : ""
          }${
            projeto.portaOcupada && !projeto.online
              ? " · porta ocupada por outro serviço"
              : ""
          }${projeto.gerenciado ? " · gerenciado pelo hub" : ""}</p>
          <a class="url" href="${url}" target="_blank" rel="noreferrer">${url}</a>
          <div class="qr-area">
            <img src="/api/qr?text=${encodeURIComponent(
              url,
            )}&format=svg" alt="QR code de ${escapar(
              projeto.nome,
            )}" width="180" height="180">
            <a class="baixar" href="/api/qr?text=${encodeURIComponent(
              url,
            )}&format=png&download=1&nome=qrcode-${projeto.id}" download="qrcode-${
              projeto.id
            }.png">Baixar PNG</a>
          </div>
          <div class="acoes">${acoes}</div>
          ${logs}
        </article>
      `;
    })
    .join("");
}

function renderBotoes() {
  const local = Boolean(estado?.local);
  document.getElementById("btn-iniciar-todos").hidden = !local;
  document.getElementById("btn-parar-todos").hidden = !local;
}

async function acao(nomeAcao, id) {
  try {
    const resposta = await fetch(`/api/${nomeAcao}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    const dados = await resposta.json();

    if (!resposta.ok || dados.ok === false) {
      alert(dados.erro ?? "Falha na ação.");
    }

    await carregar(true);
  } catch (erro) {
    alert(`Falha ao falar com o hub: ${erro.message}`);
  }
}

async function acaoTodos(nomeAcao) {
  const botoes = [
    document.getElementById("btn-iniciar-todos"),
    document.getElementById("btn-parar-todos"),
  ];
  botoes.forEach((botao) => {
    botao.disabled = true;
  });

  try {
    const resposta = await fetch(`/api/${nomeAcao}`, { method: "POST" });
    if (!resposta.ok) {
      const dados = await resposta.json();
      alert(dados.erro ?? "Falha na ação.");
    }
    await carregar(true);
  } catch (erro) {
    alert(`Falha ao falar com o hub: ${erro.message}`);
  } finally {
    botoes.forEach((botao) => {
      botao.disabled = false;
    });
  }
}

document.getElementById("btn-atualizar").addEventListener("click", () => {
  carregar(true);
});

document.getElementById("btn-imprimir").addEventListener("click", () => {
  window.print();
});

document.getElementById("btn-iniciar-todos").addEventListener("click", () => {
  acaoTodos("start-all");
});

document.getElementById("btn-parar-todos").addEventListener("click", () => {
  acaoTodos("stop-all");
});

elProjetos.addEventListener("click", (evento) => {
  const botao = evento.target.closest("[data-acao]");
  if (!botao) return;
  evento.preventDefault();
  acao(botao.dataset.acao, botao.dataset.id);
});

carregar(true);
setInterval(() => carregar(), 5000);
