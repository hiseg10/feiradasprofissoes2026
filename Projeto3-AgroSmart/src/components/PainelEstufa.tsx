"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import GraficoHistorico from "./GraficoHistorico";
import { dataHora, numero } from "@/lib/format";
import type { EstadoEstufa } from "@/lib/types";

type KpiProps = {
  titulo: string;
  valor: string;
  unidade: string;
  nota: string;
  alerta?: boolean;
};

function Kpi({ titulo, valor, unidade, nota, alerta = false }: KpiProps) {
  return (
    <div className={`card p-4 ${alerta ? "border-terra-200 bg-terra-50" : ""}`}>
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{titulo}</p>
      <p className="mt-1 text-2xl font-black tracking-tight text-slate-900">
        {valor}
        <span className="ml-1 text-sm font-semibold text-slate-400">{unidade}</span>
      </p>
      <p className={`mt-1 text-[11px] leading-relaxed ${alerta ? "text-terra-700" : "text-slate-400"}`}>
        {nota}
      </p>
    </div>
  );
}

export default function PainelEstufa({ inicial }: { inicial: EstadoEstufa }) {
  const [estado, setEstado] = useState(inicial);
  const [ocupado, setOcupado] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  useEffect(() => {
    let ativo = true;

    async function atualizar() {
      try {
        const resposta = await fetch("/api/estufa/leituras", { cache: "no-store" });
        if (!resposta.ok) return;
        const dados = (await resposta.json()) as EstadoEstufa;
        if (ativo) setEstado(dados);
      } catch {
        // mantém a última leitura
      }
    }

    const id = setInterval(atualizar, 5_000);
    return () => {
      ativo = false;
      clearInterval(id);
    };
  }, []);

  async function executar(url: string, corpo?: unknown) {
    setOcupado(true);
    setErro(null);
    try {
      const resposta = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(corpo ?? {}),
      });
      const dados = (await resposta.json()) as EstadoEstufa & { erro?: string };
      if (!resposta.ok) throw new Error(dados.erro ?? "Falha na operação");
      setEstado(dados);
    } catch (falha) {
      setErro(falha instanceof Error ? falha.message : "Erro inesperado");
    } finally {
      setOcupado(false);
    }
  }

  const ultima = estado.leituras[estado.leituras.length - 1];
  const soloBaixo = ultima ? ultima.umidadeSolo < estado.limites.umidadeSoloMin : false;
  const soloAlto = ultima ? ultima.umidadeSolo > estado.limites.umidadeSoloMax : false;
  const temperaturaAlta = ultima ? ultima.temperatura > estado.limites.temperaturaMax : false;
  const rotuloFonte =
    estado.fonte === "esp32"
      ? "Sensor ESP32"
      : estado.fonte === "arduino"
        ? "Sensor Arduino"
        : "Modo demonstração";

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-2">
        <span
          aria-live="polite"
          className={`badge gap-1.5 ${
            estado.bombaLigada ? "bg-brand-100 text-brand-800" : "bg-slate-100 text-slate-600"
          }`}
        >
          <span
            className={`h-1.5 w-1.5 rounded-full ${
              estado.bombaLigada ? "animate-pulse bg-brand-500" : "bg-slate-400"
            }`}
          />
          {estado.bombaLigada ? "Bomba ligada" : "Bomba desligada"}
        </span>
        <span className="badge bg-slate-100 text-slate-600">
          Modo {estado.modo === "auto" ? "automático" : "manual"}
        </span>
        <span className="badge bg-terra-100 text-terra-700">{rotuloFonte}</span>
        <span className="ml-auto text-xs text-slate-500">
          Última leitura: {dataHora(estado.atualizadoEm)}
        </span>
      </div>

      {ultima && (soloBaixo || soloAlto || temperaturaAlta) ? (
        <div className="rounded-2xl border border-terra-200 bg-terra-50 px-4 py-3 text-sm text-terra-800">
          <p className="font-semibold">Atenção na estufa</p>
          <ul className="mt-1 space-y-0.5 text-xs">
            {soloBaixo ? <li>Solo abaixo do mínimo ({estado.limites.umidadeSoloMin}%). Irrigação recomendada.</li> : null}
            {soloAlto ? <li>Solo acima do máximo ({estado.limites.umidadeSoloMax}%). Risco de encharcamento.</li> : null}
            {temperaturaAlta ? <li>Temperatura acima de {estado.limites.temperaturaMax}°C. Considere sombreamento.</li> : null}
          </ul>
        </div>
      ) : null}

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Kpi
          titulo="Temperatura"
          valor={ultima ? numero(ultima.temperatura, 1) : "--"}
          unidade="°C"
          nota={ultima && ultima.temperatura > estado.limites.temperaturaMax ? `Acima do limite de ${estado.limites.temperaturaMax}°C` : "Faixa ideal até 34°C"}
          alerta={temperaturaAlta}
        />
        <Kpi
          titulo="Umidade do solo"
          valor={ultima ? numero(ultima.umidadeSolo, 0) : "--"}
          unidade="%"
          nota={`Faixa configurada: ${estado.limites.umidadeSoloMin}% a ${estado.limites.umidadeSoloMax}%`}
          alerta={soloBaixo || soloAlto}
        />
        <Kpi
          titulo="Umidade do ar"
          valor={ultima ? numero(ultima.umidadeAr, 0) : "--"}
          unidade="%"
          nota="Ambiente da estufa"
        />
        <Kpi
          titulo="Luminosidade"
          valor={ultima ? numero(ultima.luz, 0) : "--"}
          unidade="lux"
          nota="Leitura do sensor LDR"
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-[1.5fr_1fr]">
        <div className="card p-5">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-900">Histórico recente</h2>
            <span className="text-xs text-slate-400">atualiza a cada 5s</span>
          </div>
          <GraficoHistorico leituras={estado.leituras} />
        </div>

        <div className="card space-y-4 p-5">
          <div>
            <h2 className="text-sm font-bold text-slate-900">Controle da irrigação</h2>
            <p className="mt-1 text-xs leading-relaxed text-slate-500">
              No modo automático, a bomba liga quando o solo fica abaixo de{" "}
              {estado.limites.umidadeSoloMin}% e desliga acima de{" "}
              {estado.limites.umidadeSoloMin + 8}%.
            </p>
          </div>

          <div className="grid gap-2">
            <button
              type="button"
              onClick={() => void executar("/api/estufa/irrigar", { acao: "ligar" })}
              disabled={ocupado}
              className="btn-primary w-full"
            >
              Irrigar agora
            </button>
            <button
              type="button"
              onClick={() => void executar("/api/estufa/irrigar", { acao: "desligar" })}
              disabled={ocupado}
              className="btn-secondary w-full"
            >
              Desligar bomba
            </button>
            <button
              type="button"
              onClick={() => void executar("/api/estufa/irrigar", { acao: "auto" })}
              disabled={ocupado}
              className="btn-secondary w-full"
            >
              Voltar ao automático
            </button>
            <button
              type="button"
              onClick={() => void executar("/api/estufa/simular")}
              disabled={ocupado}
              className="btn-accent w-full"
            >
              Simular nova leitura
            </button>
          </div>

          <Link href="/irrigacao" className="block text-center text-xs font-semibold text-brand-700 hover:underline">
            Configurar limites de umidade
          </Link>

          {erro ? (
            <p className="rounded-lg bg-red-50 px-3 py-2 text-xs text-red-600">{erro}</p>
          ) : null}
        </div>
      </div>
    </div>
  );
}
