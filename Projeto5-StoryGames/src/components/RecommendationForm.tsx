"use client";

import { useState, type FormEvent } from "react";
import GameCard from "./GameCard";
import { buscarJogos, generosUnicos, type Jogo } from "@/lib/catalogo";

type Resultado = {
  resposta: string;
  recomendados: string[];
  provedor: string;
  modelo: string;
  usadoFallback: boolean;
};

const PRESETS = [
  { rotulo: "Mistério curto e tenso", genero: "Mistério", tempo: "curto", humor: "tenso" },
  { rotulo: "Cozy para relaxar", genero: "Cozy", tempo: "medio", humor: "aconchegante" },
  { rotulo: "Ficção científica longa", genero: "Ficção científica", tempo: "longo", humor: "reflexivo" },
  { rotulo: "Drama para uma noite", genero: "Drama", tempo: "curto", humor: "emocionante" },
];

export default function RecommendationForm() {
  const [genero, setGenero] = useState("tanto-faz");
  const [tempo, setTempo] = useState("tanto-faz");
  const [humor, setHumor] = useState("tanto-faz");
  const [resultado, setResultado] = useState<Resultado | null>(null);
  const [jogos, setJogos] = useState<Jogo[]>([]);
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  const generos = generosUnicos();

  async function recomendar(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault();
    setCarregando(true);
    setErro(null);

    try {
      const resposta = await fetch("/api/ia/recomendar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ genero, tempo, humor }),
      });
      const dados = (await resposta.json()) as Resultado & { erro?: string };
      if (!resposta.ok || !dados.resposta) {
        throw new Error(dados.erro ?? "Falha ao recomendar");
      }
      setResultado(dados);
      setJogos(buscarJogos(dados.recomendados));
    } catch (falha) {
      setErro(falha instanceof Error ? falha.message : "Erro inesperado");
    } finally {
      setCarregando(false);
    }
  }

  return (
    <div className="grid gap-5 lg:grid-cols-[1fr_1.4fr]">
      <form onSubmit={recomendar} className="card space-y-4 p-6">
        <div>
          <h2 className="text-lg font-bold text-white">Conte seu perfil</h2>
          <p className="mt-1 text-sm text-slate-400">
            O curador usa o catálogo da loja para sugerir três jogos.
          </p>
        </div>

        <div>
          <label htmlFor="genero" className="label">
            Gênero favorito
          </label>
          <select
            id="genero"
            className="input"
            value={genero}
            onChange={(evento) => setGenero(evento.target.value)}
          >
            <option value="tanto-faz">Tanto faz</option>
            {generos.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="tempo" className="label">
            Tempo disponível
          </label>
          <select
            id="tempo"
            className="input"
            value={tempo}
            onChange={(evento) => setTempo(evento.target.value)}
          >
            <option value="tanto-faz">Tanto faz</option>
            <option value="curto">Curto (até 4h)</option>
            <option value="medio">Médio (5 a 9h)</option>
            <option value="longo">Longo (10h ou mais)</option>
          </select>
        </div>

        <div>
          <label htmlFor="humor" className="label">
            Clima que você procura
          </label>
          <select
            id="humor"
            className="input"
            value={humor}
            onChange={(evento) => setHumor(evento.target.value)}
          >
            <option value="tanto-faz">Tanto faz</option>
            <option value="emocionante">Emocionante</option>
            <option value="misterioso">Misterioso</option>
            <option value="aconchegante">Aconchegante</option>
            <option value="tenso">Tenso</option>
            <option value="reflexivo">Reflexivo</option>
          </select>
        </div>

        <button type="submit" className="btn-primary w-full" disabled={carregando}>
          {carregando ? "Consultando o curador..." : "Recomendar jogos"}
        </button>

        <div>
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
            Combinações rápidas
          </p>
          <div className="flex flex-wrap gap-2">
            {PRESETS.map((preset) => (
              <button
                key={preset.rotulo}
                type="button"
                onClick={() => {
                  setGenero(preset.genero);
                  setTempo(preset.tempo);
                  setHumor(preset.humor);
                }}
                className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-semibold text-slate-300 transition hover:border-steam-400/50 hover:text-steam-300"
              >
                {preset.rotulo}
              </button>
            ))}
          </div>
        </div>

        {erro ? (
          <p className="rounded-lg bg-red-500/10 px-3 py-2 text-sm text-red-300">{erro}</p>
        ) : null}

        <p className="rounded-xl bg-amber-400/10 px-3 py-2 text-xs leading-relaxed text-amber-200">
          Recomendação educativa. A loja é fictícia e não processa pagamentos reais.
        </p>
      </form>

      <div className="space-y-4">
        <div className="card min-h-[220px] p-6">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-lg font-bold text-white">Sugestões do curador</h2>
            {resultado ? (
              <span className="badge bg-white/5 text-slate-400">
                {resultado.provedor} · {resultado.modelo}
              </span>
            ) : null}
          </div>

          {carregando ? (
            <p className="mt-5 text-sm text-slate-400">Analisando o catálogo...</p>
          ) : resultado ? (
            <div className="mt-4">
              <p className="whitespace-pre-line text-sm leading-relaxed text-slate-300">
                {resultado.resposta}
              </p>
              {resultado.usadoFallback ? (
                <p className="mt-3 rounded-lg bg-amber-400/10 px-3 py-2 text-xs text-amber-200">
                  A IA não estava disponível, então foi usado o recomendador local.
                </p>
              ) : null}
            </div>
          ) : (
            <p className="mt-5 text-sm leading-relaxed text-slate-400">
              Escolha seu perfil e clique em recomendar. O curador explica por que cada jogo
              combina com você.
            </p>
          )}
        </div>

        {jogos.length ? (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {jogos.map((jogo) => (
              <GameCard key={jogo.slug} jogo={jogo} />
            ))}
          </div>
        ) : null}
      </div>
    </div>
  );
}
