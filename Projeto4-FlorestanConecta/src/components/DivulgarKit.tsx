"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import {
  BAIRRO,
  CIDADE,
  CORES_CATEGORIA,
  type Ponto,
} from "@/lib/conteudo";
import {
  CANAIS_LEGENDA,
  legendaPonto,
  linksRedes,
  linkDoPonto,
  sitesEspecializados,
  type CanalLegenda,
} from "@/lib/divulgacao";

type Props = {
  pontos: Ponto[];
  pontoInicial?: string;
};

export default function DivulgarKit({ pontos, pontoInicial }: Props) {
  const [slug, setSlug] = useState(() => {
    const encontrado = pontoInicial && pontos.some((item) => item.slug === pontoInicial);
    return encontrado ? pontoInicial : (pontos[0]?.slug ?? "");
  });
  const [canal, setCanal] = useState<CanalLegenda>("instagram");
  const [copiado, setCopiado] = useState<string | null>(null);

  const ponto = pontos.find((item) => item.slug === slug) ?? pontos[0];

  if (!ponto) {
    return (
      <main className="mx-auto max-w-6xl px-4 py-10">
        <p className="text-sm text-slate-600">Nenhum ponto cadastrado no guia.</p>
      </main>
    );
  }

  const cores = CORES_CATEGORIA[ponto.categoria];
  const linkPublico = linkDoPonto(ponto, "link");
  const linkLegenda = linkDoPonto(ponto, canal);
  const legenda = legendaPonto(ponto, canal, linkLegenda);
  const redes = linksRedes(ponto);
  const sites = sitesEspecializados(ponto);
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(
    linkDoPonto(ponto, "qr"),
  )}`;
  const bio = `${ponto.emoji} ${ponto.nome} · ${ponto.categoria} no ${BAIRRO} · ${CIDADE}`;
  const status = `${ponto.emoji} ${ponto.nome} no ${BAIRRO}! ${ponto.horario}. Veja no guia: ${linkDoPonto(
    ponto,
    "whatsapp",
  )}`;

  function selecionarPonto(novoSlug: string) {
    setSlug(novoSlug);
    setCopiado(null);

    if (typeof window !== "undefined") {
      const url = new URL(window.location.href);
      url.searchParams.set("ponto", novoSlug);
      window.history.replaceState(null, "", url.toString());
    }
  }

  async function copiar(texto: string, chave: string) {
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(texto);
      } else {
        const area = document.createElement("textarea");
        area.value = texto;
        area.setAttribute("readonly", "");
        area.style.position = "fixed";
        area.style.opacity = "0";
        document.body.appendChild(area);
        area.select();
        document.execCommand("copy");
        document.body.removeChild(area);
      }

      setCopiado(chave);
      window.setTimeout(() => setCopiado(null), 2200);
    } catch {
      setCopiado("erro");
    }
  }

  async function compartilharNativo() {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${ponto.nome} · Florestan Conecta`,
          text: legenda,
        });
        return;
      } catch (erro) {
        if (erro instanceof DOMException && erro.name === "AbortError") return;
      }
    }

    await copiar(legenda, "compartilhar");
  }

  return (
    <main className="mx-auto max-w-6xl px-4 py-10">
      <div className="print:hidden">
        <header className="max-w-3xl">
          <p className="eyebrow">Kit do parceiro</p>
          <h1 className="mt-1 text-3xl font-black tracking-tight text-slate-900 sm:text-4xl">
            Divulgue seu ponto no bairro
          </h1>
          <p className="mt-3 text-sm leading-relaxed text-slate-600">
            Escolha um ponto do guia e monte a divulgação: legenda pronta, cartaz com QR code e
            links diretos para redes sociais e sites especializados. O material usa os dados
            públicos do Florestan Conecta.
          </p>
        </header>

        <div className="mt-7 grid gap-6 lg:grid-cols-[1.05fr_1fr]">
          <section className="space-y-4">
            <div className="card p-5">
              <label htmlFor="ponto-parceiro" className="label">
                Escolha o ponto comercial
              </label>
              <select
                id="ponto-parceiro"
                className="input"
                value={ponto.slug}
                onChange={(evento) => selecionarPonto(evento.target.value)}
              >
                {pontos.map((item) => (
                  <option key={item.slug} value={item.slug}>
                    {item.emoji} {item.nome} · {item.categoria}
                  </option>
                ))}
              </select>
              <p className="mt-2 text-xs leading-relaxed text-slate-500">
                Confirme horário, telefone e formas de pagamento antes de publicar. O guia reúne
                dados do bairro e não substitui os canais oficiais do estabelecimento.
              </p>
            </div>

            <article
              className={`overflow-hidden rounded-3xl bg-gradient-to-br ${cores.gradiente} text-white shadow-sm`}
            >
              <div className="p-6">
                <div className="flex items-start gap-4">
                  <span className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-white/20 text-3xl backdrop-blur">
                    {ponto.emoji}
                  </span>
                  <div>
                    <span className="badge bg-white/20 text-white">{ponto.categoria}</span>
                    <h2 className="mt-2 text-2xl font-black tracking-tight">{ponto.nome}</h2>
                    <p className="mt-1 text-xs text-white/80">
                      {ponto.tags
                        .slice(0, 3)
                        .map((tag) => `#${tag.replace(/\s+/g, "")}`)
                        .join(" · ")}
                    </p>
                  </div>
                </div>
                <p className="mt-4 text-sm leading-relaxed text-white/90">{ponto.descricao}</p>
                <div className="mt-4 grid gap-2 text-xs text-white/85 sm:grid-cols-2">
                  <p>📍 {ponto.endereco}</p>
                  <p>🕒 {ponto.horario}</p>
                </div>
              </div>
            </article>

            <div className="grid gap-3">
              <div className="card flex items-center gap-3 p-4">
                <Image
                  src={qrUrl}
                  alt={`QR code de ${ponto.nome}`}
                  width={96}
                  height={96}
                  unoptimized
                  loading="eager"
                  className="h-24 w-24 rounded-lg bg-white"
                />
                <div>
                  <p className="text-xs font-bold text-slate-800">QR do ponto</p>
                  <p className="mt-1 text-[11px] leading-relaxed text-slate-500">
                    Aponta para a página pública com UTM de QR code.
                  </p>
                </div>
              </div>

              <div className="card min-w-0 p-4">
                <p className="text-xs font-bold text-slate-800">Link para compartilhar</p>
                <p className="mt-1 break-all font-mono text-[11px] leading-relaxed text-slate-500">
                  {linkPublico}
                </p>
                <div className="mt-2 flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={() => copiar(linkPublico, "link")}
                    className="btn-secondary px-3 py-1.5 text-xs"
                  >
                    Copiar link
                  </button>
                  <Link
                    href={`/pontos/${ponto.slug}`}
                    className="btn-secondary px-3 py-1.5 text-xs"
                  >
                    Ver página
                  </Link>
                  {copiado === "link" ? (
                    <span className="text-xs font-semibold text-emerald-700">Copiado!</span>
                  ) : null}
                </div>
              </div>

              <div className="card p-5">
                <h2 className="text-sm font-bold text-slate-900">Ideias de publicação</h2>
                <ul className="mt-2 space-y-2 text-xs leading-relaxed text-slate-600">
                  <li>
                    <strong className="text-slate-800">Feed:</strong> use a legenda do Instagram
                    com o cartaz abaixo.
                  </li>
                  <li>
                    <strong className="text-slate-800">Stories:</strong> poste o cartaz e adicione
                    o sticker de link do ponto.
                  </li>
                  <li>
                    <strong className="text-slate-800">WhatsApp:</strong> envie o link para grupos
                    e contatos do bairro.
                  </li>
                  <li>
                    <strong className="text-slate-800">Google:</strong> atualize fotos, horário e
                    formas de contato na ficha do negócio.
                  </li>
                </ul>
              </div>

              <div className="card p-5">
                <h2 className="text-sm font-bold text-slate-900">Textos curtos</h2>
                <p className="mt-1 text-xs leading-relaxed text-slate-500">
                  Para bio, status do WhatsApp e mensagens rápidas.
                </p>

                <div className="mt-3 space-y-3">
                  <div>
                    <p className="text-[11px] font-bold uppercase tracking-wide text-slate-400">
                      Bio do Instagram
                    </p>
                    <p className="mt-1 rounded-lg bg-slate-50 p-2 text-xs leading-relaxed text-slate-700">
                      {bio}
                    </p>
                    <button
                      type="button"
                      onClick={() => copiar(bio, "bio")}
                      className="btn-secondary mt-2 px-3 py-1.5 text-xs"
                    >
                      {copiado === "bio" ? "Bio copiada!" : "Copiar bio"}
                    </button>
                  </div>

                  <div>
                    <p className="text-[11px] font-bold uppercase tracking-wide text-slate-400">
                      Status do WhatsApp
                    </p>
                    <p className="mt-1 rounded-lg bg-slate-50 p-2 text-xs leading-relaxed text-slate-700">
                      {status}
                    </p>
                    <button
                      type="button"
                      onClick={() => copiar(status, "status")}
                      className="btn-secondary mt-2 px-3 py-1.5 text-xs"
                    >
                      {copiado === "status" ? "Status copiado!" : "Copiar status"}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section className="space-y-4">
            <div className="card p-5">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h2 className="text-sm font-bold text-slate-900">1. Legenda pronta</h2>
                <span className="text-[11px] text-slate-400">Escolha o canal</span>
              </div>
              <div className="mt-3 flex flex-wrap gap-1.5" aria-label="Canal da legenda">
                {CANAIS_LEGENDA.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    aria-pressed={canal === item.id}
                    onClick={() => setCanal(item.id)}
                    className={`rounded-full px-3 py-1.5 text-xs font-semibold transition ${
                      canal === item.id
                        ? "bg-teal-600 text-white"
                        : "border border-slate-300 bg-white text-slate-600 hover:border-teal-300 hover:text-teal-700"
                    }`}
                  >
                    {item.emoji} {item.nome}
                  </button>
                ))}
              </div>
              <pre className="mt-3 max-h-72 overflow-auto whitespace-pre-wrap rounded-xl bg-slate-50 p-3 text-xs leading-relaxed text-slate-700">
                {legenda}
              </pre>
              <div className="mt-3 flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => copiar(legenda, "legenda")}
                  className="btn-primary"
                >
                  {copiado === "legenda" ? "Copiado!" : "Copiar legenda"}
                </button>
                <button type="button" onClick={compartilharNativo} className="btn-secondary">
                  {copiado === "compartilhar" ? "Texto copiado!" : "Compartilhar…"}
                </button>
              </div>
              {copiado === "erro" ? (
                <p className="mt-2 text-xs font-semibold text-rose-600">
                  Não foi possível copiar. Selecione o texto e copie manualmente.
                </p>
              ) : null}
              <p className="mt-3 text-[11px] leading-relaxed text-slate-400">
                No Instagram, o link da legenda não fica clicável. Use o cartaz com QR code ou
                coloque o link na bio.
              </p>
            </div>

            <div className="card p-5">
              <h2 className="text-sm font-bold text-slate-900">2. Publique nas redes</h2>
              <p className="mt-1 text-xs leading-relaxed text-slate-500">
                Os links já abrem a rede com a legenda e a URL marcada com UTM para acompanhar a
                divulgação.
              </p>
              <div className="mt-3 grid gap-2 sm:grid-cols-2">
                {redes.map((rede) => (
                  <a
                    key={rede.id}
                    href={rede.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="rounded-xl border border-slate-200 p-3 transition hover:border-teal-300 hover:bg-teal-50"
                  >
                    <p className="text-sm font-bold text-slate-800">
                      {rede.emoji} {rede.nome}
                    </p>
                    <p className="mt-0.5 text-[11px] leading-relaxed text-slate-500">
                      {rede.descricao}
                    </p>
                  </a>
                ))}
                <a
                  href="https://www.instagram.com/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-xl border border-slate-200 p-3 transition hover:border-teal-300 hover:bg-teal-50"
                >
                  <p className="text-sm font-bold text-slate-800">📸 Instagram</p>
                  <p className="mt-0.5 text-[11px] leading-relaxed text-slate-500">
                    Copie a legenda e use o cartaz com QR code no feed ou nos stories.
                  </p>
                </a>
              </div>
            </div>

            <div className="card p-5">
              <h2 className="text-sm font-bold text-slate-900">3. Sites especializados</h2>
              <p className="mt-1 text-xs leading-relaxed text-slate-500">
                Cadastre ou atualize o ponto nos serviços abaixo. Alguns exigem criar conta e
                confirmar que o estabelecimento é seu.
              </p>
              <div className="mt-3 space-y-2">
                {sites.map((site) => (
                  <a
                    key={site.nome}
                    href={site.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-start gap-3 rounded-xl border border-slate-200 px-3 py-2 transition hover:border-teal-300 hover:bg-teal-50"
                  >
                    <span className="mt-0.5 text-lg">{site.emoji}</span>
                    <span>
                      <span className="block text-xs font-bold text-slate-800">{site.nome}</span>
                      <span className="mt-0.5 block text-[11px] leading-relaxed text-slate-500">
                        {site.descricao}
                      </span>
                    </span>
                  </a>
                ))}
              </div>
              <div className="mt-3 flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => copiar(ponto.endereco, "endereco")}
                  className="btn-secondary px-3 py-1.5 text-xs"
                >
                  Copiar endereço
                </button>
                {copiado === "endereco" ? (
                  <span className="text-xs font-semibold text-emerald-700">Copiado!</span>
                ) : null}
              </div>
            </div>

            <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5">
              <h2 className="text-sm font-bold text-amber-900">Checklist rápido do parceiro</h2>
              <ul className="mt-2 space-y-1.5 text-xs leading-relaxed text-amber-900/80">
                <li>✅ Confirme horário, telefone e formas de pagamento antes de publicar.</li>
                <li>✅ Use o cartaz com QR code no balcão, na vitrine e nos stories.</li>
                <li>✅ Publique a legenda no Instagram e envie o link nos grupos do WhatsApp.</li>
                <li>✅ Atualize fotos e horários no Google Maps e no Google Business Profile.</li>
                <li>✅ Use as hashtags da campanha para aparecer nas buscas do bairro.</li>
              </ul>
            </div>
          </section>
        </div>
      </div>

      <section className="mt-10 print:mt-0">
        <div className="flex flex-wrap items-end justify-between gap-3 print:hidden">
          <div>
            <p className="eyebrow">Cartaz</p>
            <h2 className="mt-1 text-2xl font-black tracking-tight text-slate-900">
              Pronto para imprimir ou salvar em PDF
            </h2>
            <p className="mt-1 text-sm leading-relaxed text-slate-600">
              Use no balcão, na vitrine ou como imagem para stories. Ative a impressão de cores
              para manter o fundo.
            </p>
          </div>
          <button type="button" onClick={() => window.print()} className="btn-primary">
            Imprimir cartaz
          </button>
        </div>

        <div className="mt-4 rounded-3xl bg-slate-100 p-4 print:bg-white print:p-0">
          <article
            id="cartao-divulgacao"
            className="cartao-impressao mx-auto max-w-md overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-lg print:max-w-none print:rounded-none print:border-0 print:shadow-none"
          >
            <div className={`bg-gradient-to-br ${cores.gradiente} p-6 text-white`}>
              <div className="flex items-center justify-between gap-3">
                <span className="text-xs font-black uppercase tracking-[0.18em] text-white/80">
                  Florestan Conecta
                </span>
                <span className="badge bg-white/20 text-white">{ponto.categoria}</span>
              </div>
              <div className="mt-8 flex items-end gap-4">
                <span className="text-5xl">{ponto.emoji}</span>
                <div>
                  <h3 className="text-3xl font-black leading-tight tracking-tight">
                    {ponto.nome}
                  </h3>
                  <p className="mt-1 text-sm text-white/80">
                    {BAIRRO} · {CIDADE}
                  </p>
                </div>
              </div>
            </div>

            <div className="p-6">
              <p className="text-sm leading-relaxed text-slate-700">{ponto.descricao}</p>
              <dl className="mt-4 space-y-1.5 text-xs text-slate-600">
                <div>
                  <dt className="inline font-bold text-slate-800">Endereço: </dt>
                  <dd className="inline">{ponto.endereco}</dd>
                </div>
                <div>
                  <dt className="inline font-bold text-slate-800">Horário: </dt>
                  <dd className="inline">{ponto.horario}</dd>
                </div>
              </dl>

              <div className="mt-5 flex items-center gap-4 rounded-2xl border border-slate-200 bg-slate-50 p-3">
                <Image
                  src={qrUrl}
                  alt={`QR code de ${ponto.nome}`}
                  width={128}
                  height={128}
                  unoptimized
                  loading="eager"
                  className="h-28 w-28 rounded-lg bg-white"
                />
                <div>
                  <p className="text-sm font-bold text-slate-900">Aponte a câmera</p>
                  <p className="mt-1 text-xs leading-relaxed text-slate-500">
                    Abra a página do ponto no guia do bairro e compartilhe com a vizinhança.
                  </p>
                </div>
              </div>

              <div className="mt-4 flex items-center justify-between gap-3 border-t border-slate-100 pt-3 text-[10px] font-semibold uppercase tracking-wide text-slate-400">
                <span>Guia do {BAIRRO}</span>
                <span>Feira das Profissões 2026</span>
              </div>
            </div>
          </article>
        </div>
      </section>
    </main>
  );
}
