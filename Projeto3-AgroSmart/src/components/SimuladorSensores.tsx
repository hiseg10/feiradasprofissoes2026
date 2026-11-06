"use client";

import { useState, type FormEvent } from "react";
import type { EstadoEstufa } from "@/lib/types";

type ControleProps = {
  id: string;
  rotulo: string;
  valor: number;
  unidade: string;
  minimo: number;
  maximo: number;
  passo: number;
  aoMudar: (valor: number) => void;
};

function Controle({ id, rotulo, valor, unidade, minimo, maximo, passo, aoMudar }: ControleProps) {
  return (
    <div>
      <label htmlFor={id} className="label flex items-center justify-between">
        <span>{rotulo}</span>
        <span className="font-bold text-slate-800">
          {valor}
          {unidade}
        </span>
      </label>
      <input
        id={id}
        type="range"
        min={minimo}
        max={maximo}
        step={passo}
        value={valor}
        onChange={(evento) => aoMudar(Number(evento.target.value))}
        className="w-full accent-brand-600"
      />
    </div>
  );
}

export default function SimuladorSensores() {
  const [temperatura, setTemperatura] = useState(26);
  const [umidadeAr, setUmidadeAr] = useState(62);
  const [umidadeSolo, setUmidadeSolo] = useState(32);
  const [luz, setLuz] = useState(650);
  const [estado, setEstado] = useState<EstadoEstufa | null>(null);
  const [ocupado, setOcupado] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  async function enviar(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault();
    setOcupado(true);
    setErro(null);

    try {
      const resposta = await fetch("/api/estufa/leituras", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          temperatura,
          umidadeAr,
          umidadeSolo,
          luz,
          fonte: "simulacao",
        }),
      });
      const dados = (await resposta.json()) as EstadoEstufa & { erro?: string };
      if (!resposta.ok) throw new Error(dados.erro ?? "Falha ao enviar leitura");
      setEstado(dados);
    } catch (falha) {
      setErro(falha instanceof Error ? falha.message : "Erro inesperado");
    } finally {
      setOcupado(false);
    }
  }

  async function aleatoria() {
    setOcupado(true);
    setErro(null);
    try {
      const resposta = await fetch("/api/estufa/simular", { method: "POST" });
      const dados = (await resposta.json()) as EstadoEstufa & { erro?: string };
      if (!resposta.ok) throw new Error(dados.erro ?? "Falha ao simular");
      setEstado(dados);
    } catch (falha) {
      setErro(falha instanceof Error ? falha.message : "Erro inesperado");
    } finally {
      setOcupado(false);
    }
  }

  const ultima = estado?.leituras[estado.leituras.length - 1];

  return (
    <div className="grid gap-5 lg:grid-cols-[1.2fr_1fr]">
      <form onSubmit={enviar} className="card space-y-5 p-6">
        <div>
          <h2 className="text-lg font-bold text-slate-900">Enviar leitura manual</h2>
          <p className="mt-1 text-sm text-slate-500">
            Este formulário chama a mesma API que o ESP32 ou o Arduino usariam. Perfeito para
            demonstrar sem hardware.
          </p>
        </div>

        <Controle
          id="temperatura"
          rotulo="Temperatura"
          valor={temperatura}
          unidade="°C"
          minimo={10}
          maximo={45}
          passo={1}
          aoMudar={setTemperatura}
        />
        <Controle
          id="umidade-ar"
          rotulo="Umidade do ar"
          valor={umidadeAr}
          unidade="%"
          minimo={10}
          maximo={100}
          passo={1}
          aoMudar={setUmidadeAr}
        />
        <Controle
          id="umidade-solo"
          rotulo="Umidade do solo"
          valor={umidadeSolo}
          unidade="%"
          minimo={0}
          maximo={100}
          passo={1}
          aoMudar={setUmidadeSolo}
        />
        <Controle
          id="luz"
          rotulo="Luminosidade"
          valor={luz}
          unidade=" lux"
          minimo={0}
          maximo={1200}
          passo={50}
          aoMudar={setLuz}
        />

        <div className="flex flex-wrap gap-2">
          <button type="submit" className="btn-primary" disabled={ocupado}>
            {ocupado ? "Enviando..." : "Enviar leitura"}
          </button>
          <button type="button" onClick={() => void aleatoria()} className="btn-secondary" disabled={ocupado}>
            Leitura aleatória
          </button>
        </div>

        {erro ? (
          <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{erro}</p>
        ) : null}
      </form>

      <div className="space-y-4">
        <div className="card p-6">
          <h2 className="text-sm font-bold text-slate-900">Resultado no servidor</h2>
          {ultima && estado ? (
            <dl className="mt-3 space-y-2 text-sm">
              <div className="flex justify-between gap-3">
                <dt className="text-slate-500">Temperatura</dt>
                <dd className="font-semibold text-slate-800">{ultima.temperatura}°C</dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt className="text-slate-500">Umidade do solo</dt>
                <dd className="font-semibold text-slate-800">{ultima.umidadeSolo}%</dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt className="text-slate-500">Umidade do ar</dt>
                <dd className="font-semibold text-slate-800">{ultima.umidadeAr}%</dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt className="text-slate-500">Luz</dt>
                <dd className="font-semibold text-slate-800">{ultima.luz} lux</dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt className="text-slate-500">Bomba</dt>
                <dd className="font-semibold text-slate-800">
                  {ultima.bombaLigada ? "Ligada" : "Desligada"}
                </dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt className="text-slate-500">Modo</dt>
                <dd className="font-semibold text-slate-800">
                  {estado.modo === "auto" ? "Automático" : "Manual"}
                </dd>
              </div>
            </dl>
          ) : (
            <p className="mt-3 text-sm text-slate-500">
              Envie uma leitura para ver a resposta da API.
            </p>
          )}
        </div>

        <div className="card p-5">
          <h2 className="text-sm font-bold text-slate-900">Contrato da API</h2>
          <pre className="mt-3 overflow-x-auto rounded-xl bg-slate-950 p-3 text-[11px] leading-relaxed text-slate-200">
{`POST /api/estufa/leituras
Content-Type: application/json

{
  "temperatura": 26.5,
  "umidadeAr": 61,
  "umidadeSolo": 32,
  "luz": 720,
  "fonte": "arduino"
}`}
          </pre>
          <p className="mt-2 text-xs text-slate-500">
            Aceita <code>fonte: &quot;esp32&quot;</code> (Wi-Fi) ou{" "}
            <code>fonte: &quot;arduino&quot;</code> (via bridge serial). O corpo é o mesmo.
          </p>
        </div>
      </div>
    </div>
  );
}
