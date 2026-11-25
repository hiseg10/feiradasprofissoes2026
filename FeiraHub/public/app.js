let estado = null;
let ipEscolhido = localStorage.getItem("feirahub:ip") || "";
let ultimaAssinatura = "";
let carregando = false;
let recarregarDepois = false;

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
    avisos: dados.avisos ?? [],
    ips: dados.rede.ips.map((item) => item.endereco),
    projetos: dados.projetos.map((projeto) => [
      projeto.id,
      projeto.estado,
      projeto.online,
      projeto.portaReal,
      projeto.portaEfetiva,
      projeto.portaSugerida,
      projeto.portaOcupada,
      projeto.gerenciado,
      projeto.iniciando,
      projeto.ocupante?.pid ?? null,
      projeto.processoDoProjeto?.pid ?? null,
      projeto.logs?.length ?? 0,
    ]),
  });
}

async function carregar(forcar = false) {
  if (carregando) {
    if (forcar) recarregarDepois = true;
    return;
  }
  carregando = true;

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
  } finally {
    carregando = false;
    if (recarregarDepois) {
      recarregarDepois = false;
      carregar(true);
    }
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
      ${
        (estado.avisos ?? []).length
          ? `<p class="aviso">${estado.avisos.map(escapar).join("<br>")}</p>`
          : ""
      }
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
      const porta = projeto.portaReal ?? projeto.portaEfetiva ?? projeto.porta;
      const url = `http://${ipEscolhido}:${porta}`;
      const status =
        projeto.estado ??
        (projeto.online
          ? "online"
          : projeto.iniciando
            ? "iniciando"
            : projeto.portaOcupada
              ? "porta-ocupada"
              : "offline");
      const rotulos = {
        online: "Online",
        iniciando: "Iniciando...",
        "sem-resposta": "Sem resposta",
        "porta-ocupada": "Porta ocupada",
        offline: "Offline",
      };
      const rotulo = rotulos[status] ?? "Offline";

      let acoes = "";

      if (estado.local) {
        if (projeto.online) {
          acoes = projeto.gerenciado
            ? `<button class="btn perigo" data-acao="stop" data-id="${projeto.id}">Parar</button>`
            : `<span class="tag externo">iniciado fora do hub</span>
               <button class="btn perigo" data-liberar="1" data-id="${projeto.id}" data-porta="${porta}">Liberar porta</button>`;
        } else if (projeto.iniciando) {
          acoes = `<button class="btn" disabled>Iniciando...</button>`;
        } else if (projeto.processoDoProjeto) {
          acoes = `<button class="btn primario" data-acao="restart" data-id="${projeto.id}">Reiniciar</button>
             <button class="btn perigo" data-liberar="1" data-id="${projeto.id}" data-porta="${projeto.processoDoProjeto.porta}">Liberar porta</button>`;
        } else if (projeto.portaOcupada) {
          const iniciar = projeto.portaSugerida
            ? `<button class="btn primario" data-acao="start" data-id="${projeto.id}">Iniciar na porta ${projeto.portaSugerida}</button>`
            : `<button class="btn" disabled>Sem porta livre</button>`;
          acoes = `${iniciar}
             <button class="btn perigo" data-liberar="1" data-id="${projeto.id}" data-porta="${projeto.porta}">Liberar porta ${projeto.porta}</button>`;
        } else {
          const rotuloIniciar =
            projeto.portaSugerida &&
            projeto.portaSugerida !== Number(projeto.porta)
              ? `Iniciar na porta ${projeto.portaSugerida}`
              : "Iniciar";
          acoes = `<button class="btn primario" data-acao="start" data-id="${projeto.id}">${rotuloIniciar}</button>`;
        }
      } else {
        acoes = `<span class="tag">controle apenas no notebook</span>`;
      }

      const detalhes = [
        `Pasta <code>${escapar(projeto.pasta)}</code>`,
        `Porta configurada <strong>${projeto.porta}</strong>`,
      ];

      if (
        projeto.portaEfetiva &&
        Number(projeto.portaEfetiva) !== Number(projeto.porta)
      ) {
        detalhes.push(`usando <strong>${projeto.portaEfetiva}</strong>`);
      }

      if (
        projeto.online &&
        projeto.portaReal &&
        Number(projeto.portaReal) !== Number(projeto.porta) &&
        Number(projeto.portaReal) !== Number(projeto.portaEfetiva)
      ) {
        detalhes.push(`rodando na <strong>${projeto.portaReal}</strong>`);
      }

      if (projeto.processoDoProjeto) {
        detalhes.push(
          `processo sem resposta (PID ${projeto.processoDoProjeto.pid}, ${escapar(
            projeto.processoDoProjeto.nome,
          )}) na porta ${projeto.processoDoProjeto.porta}`,
        );
      } else if (projeto.portaOcupada && !projeto.online && projeto.ocupante) {
        const dono = projeto.ocupante.projetoNome
          ? ` do projeto ${escapar(projeto.ocupante.projetoNome)}`
          : "";
        detalhes.push(
          `ocupada por ${escapar(projeto.ocupante.nome)} (PID ${
            projeto.ocupante.pid
          })${dono}`,
        );
      }

      if (
        !projeto.online &&
        projeto.portaOcupada &&
        projeto.portaSugerida &&
        Number(projeto.portaSugerida) !== Number(projeto.porta)
      ) {
        detalhes.push(
          `sugestão: porta <strong>${projeto.portaSugerida}</strong>`,
        );
      }

      if (projeto.gerenciado) detalhes.push("gerenciado pelo hub");

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
          <p class="detalhe">${detalhes.join(" · ")}</p>
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
  document.getElementById("btn-limpar-portas").hidden = !local;
}

async function acao(nomeAcao, id) {
  if (
    nomeAcao === "restart" &&
    !confirm("Encerrar o processo atual e iniciar o projeto novamente?")
  ) {
    return;
  }

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

async function liberarPortaUI(id, porta) {
  const projeto = estado?.projetos.find((item) => item.id === id);
  const ocupante = projeto?.ocupante;
  const avisoDono =
    ocupante?.projetoId && ocupante.projetoId !== id
      ? `\nAtenção: essa porta é do projeto ${ocupante.projetoNome}.`
      : "";

  if (
    !confirm(
      `Encerrar o processo que está usando a porta ${porta} (${projeto?.nome ?? id})?${avisoDono}`,
    )
  ) {
    return;
  }

  try {
    const resposta = await fetch("/api/free-port", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, porta: Number(porta), confirmar: true }),
    });
    const dados = await resposta.json();

    if (!resposta.ok || dados.ok === false) {
      alert(dados.erro ?? "Falha ao liberar a porta.");
    }

    await carregar(true);
  } catch (erro) {
    alert(`Falha ao falar com o hub: ${erro.message}`);
  }
}

async function limparPortas() {
  if (
    !confirm(
      "Encerrar processos sem resposta e serviços que estão ocupando as portas dos projetos?",
    )
  ) {
    return;
  }

  const botao = document.getElementById("btn-limpar-portas");
  botao.disabled = true;

  try {
    const resposta = await fetch("/api/free-all", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ confirmar: true }),
    });
    const dados = await resposta.json();

    if (!resposta.ok) {
      alert(dados.erro ?? "Falha ao limpar as portas.");
    } else {
      const falhas = (dados.resultados ?? []).filter((item) => !item.ok);
      if (falhas.length) {
        alert(falhas.map((item) => `${item.id}: ${item.erro}`).join("\n"));
      }
    }

    await carregar(true);
  } catch (erro) {
    alert(`Falha ao falar com o hub: ${erro.message}`);
  } finally {
    botao.disabled = false;
  }
}

async function acaoTodos(nomeAcao) {
  const botoes = [
    document.getElementById("btn-iniciar-todos"),
    document.getElementById("btn-parar-todos"),
    document.getElementById("btn-limpar-portas"),
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

document
  .getElementById("btn-limpar-portas")
  .addEventListener("click", limparPortas);

elProjetos.addEventListener("click", (evento) => {
  const liberar = evento.target.closest("[data-liberar]");
  if (liberar) {
    evento.preventDefault();
    liberarPortaUI(liberar.dataset.id, liberar.dataset.porta);
    return;
  }

  const botao = evento.target.closest("[data-acao]");
  if (!botao) return;
  evento.preventDefault();
  acao(botao.dataset.acao, botao.dataset.id);
});

carregar(true);
setInterval(() => carregar(), 5000);
