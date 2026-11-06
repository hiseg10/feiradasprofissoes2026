"use client";

import { useState, type FormEvent } from "react";
import type { EstadoEstufa } from "@/lib/types";

export default function ConfigIrrigacao({ inicial }: { inicial: EstadoEstufa }) {
  const [minimo, setMinimo] = useState(inicial.limites.umidadeSoloMin);
  const [maximo, setMaximo] = useState(inicial.limites.umidadeSoloMax);
  const [temperaturaMax, setTemperaturaMax] = useState(inicial.limites.temperaturaMax);
  const [estado, setEstado] = useState(inicial);
  const [salvando, setSalvando] = useState(false);
  const [mensagem, setMensagem] = useState<string | null>(null);
  const [erro, setErro] = useState<string | null>(null);

  async function salvar(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault();
    setSalvando(true);
    setMensagem(null);
    setErro(null);

    try {
      const resposta = await fetch("/api/estufa/irrigar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          limites: {
            umidadeSoloMin: minimo,
            umidadeSoloMax: maximo,
            temperaturaMax,
          },
        }),
      });
      const dados = (await resposta.json()) as EstadoEstufa & { erro?: string };
      if (!resposta.ok) throw new Error(dados.erro ?? "Falha ao salvar limites");

      setEstado(dados);
      setMinimo(dados.limites.umidadeSoloMin);
      setMaximo(dados.limites.umidadeSoloMax);
      setTemperaturaMax(dados.limites.temperaturaMax);
      setMensagem("Limites atualizados com sucesso.");
    } catch (falha) {
      setErro(falha instanceof Error ? falha.message : "Erro inesperado");
    } finally {
      setSalvando(false);
    }
  }

  return (
    <div className="grid gap-5 lg:grid-cols-[1.2fr_1fr]">
      <form onSubmit={salvar} className="card space-y-5 p-6">
        <div>
          <h2 className="text-lg font-bold text-slate-900">Limites de irrigação</h2>
          <p className="mt-1 text-sm text-slate-500">
            O modo automático usa estes valores para decidir quando ligar e desligar a bomba.
          </p>
        </div>

        <div>
          <label htmlFor="umidade-min" className="label">
            Umidade mínima do solo: <strong className="text-brand-700">{minimo}%</strong>
          </label>
          <input
            id="umidade-min"
            type="range"
            min={5}
            max={80}
            step={1}
            value={minimo}
            onChange={(evento) => setMinimo(Number(evento.target.value))}
            className="w-full accent-brand-600"
          />
          <p className="mt-1 text-xs text-slate-400">
            Abaixo deste valor, a bomba liga automaticamente.
          </p>
        </div>

        <div>
          <label htmlFor="umidade-max" className="label">
            Umidade máxima do solo: <strong className="text-brand-700">{maximo}%</strong>
          </label>
          <input
            id="umidade-max"
            type="range"
            min={10}
            max={100}
            step={1}
            value={maximo}
            onChange={(evento) => setMaximo(Number(evento.target.value))}
            className="w-full accent-brand-600"
          />
          <p className="mt-1 text-xs text-slate-400">
            Acima deste valor, a bomba desliga para evitar encharcamento.
          </p>
        </div>

        <div>
          <label htmlFor="temperatura-max" className="label">
            Temperatura máxima: <strong className="text-terra-700">{temperaturaMax}°C</strong>
          </label>
          <input
            id="temperatura-max"
            type="range"
            min={20}
            max={50}
            step={1}
            value={temperaturaMax}
            onChange={(evento) => setTemperaturaMax(Number(evento.target.value))}
            className="w-full accent-terra-500"
          />
          <p className="mt-1 text-xs text-slate-400">
            Usada para emitir alerta de calor na estufa.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button type="submit" className="btn-primary" disabled={salvando}>
            {salvando ? "Salvando..." : "Salvar limites"}
          </button>
          <span className="text-xs text-slate-500">
            Modo atual: <strong>{estado.modo === "auto" ? "automático" : "manual"}</strong>
          </span>
        </div>

        {mensagem ? (
          <p className="rounded-lg bg-brand-50 px-3 py-2 text-sm text-brand-800">{mensagem}</p>
        ) : null}
        {erro ? (
          <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{erro}</p>
        ) : null}
      </form>

      <aside className="space-y-4">
        <div className="card p-5">
          <h2 className="text-sm font-bold text-slate-900">Como a decisão funciona</h2>
          <ol className="mt-3 space-y-2 text-xs leading-relaxed text-slate-600">
            <li>1. A leitura chega pelo painel, pelo ESP32 ou pelo Arduino.</li>
            <li>2. Se o modo for manual, a bomba obedece ao botão.</li>
            <li>3. Se for automático e o solo estiver abaixo do mínimo, a bomba liga.</li>
            <li>4. Quando o solo passa de mínimo + 8%, a bomba desliga.</li>
            <li>5. A histerese evita liga/desliga em sequência.</li>
          </ol>
        </div>

        <div className="rounded-2xl border border-terra-200 bg-terra-50 p-5 text-xs leading-relaxed text-terra-800">
          <p className="font-bold">Dica de segurança</p>
          <p className="mt-1">
            Na maquete, use fonte de 5V ou 12V compatível com o relé e mantenha a parte elétrica
            longe da água. Um profissional deve revisar a montagem antes da feira.
          </p>
        </div>

        <div className="card p-5">
          <h2 className="text-sm font-bold text-slate-900">Leitura atual</h2>
          <dl className="mt-3 space-y-1.5 text-xs text-slate-600">
            <div className="flex justify-between gap-2">
              <dt>Solo</dt>
              <dd className="font-semibold text-slate-800">
                {estado.leituras[estado.leituras.length - 1]?.umidadeSolo ?? "--"}%
              </dd>
            </div>
            <div className="flex justify-between gap-2">
              <dt>Temperatura</dt>
              <dd className="font-semibold text-slate-800">
                {estado.leituras[estado.leituras.length - 1]?.temperatura ?? "--"}°C
              </dd>
            </div>
            <div className="flex justify-between gap-2">
              <dt>Bomba</dt>
              <dd className="font-semibold text-slate-800">
                {estado.bombaLigada ? "Ligada" : "Desligada"}
              </dd>
            </div>
          </dl>
        </div>
      </aside>
    </div>
  );
}
