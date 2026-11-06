"use client";

import { useState } from "react";
import { QUIZ } from "@/lib/conteudo";

export default function Quiz() {
  const [indice, setIndice] = useState(0);
  const [selecionada, setSelecionada] = useState<number | null>(null);
  const [acertos, setAcertos] = useState(0);
  const [finalizado, setFinalizado] = useState(false);

  const pergunta = QUIZ[indice];

  function confirmar() {
    if (selecionada === null) return;
    if (selecionada === pergunta.correta) setAcertos((valor) => valor + 1);
  }

  function avancar() {
    if (indice + 1 >= QUIZ.length) {
      setFinalizado(true);
      return;
    }
    setIndice((valor) => valor + 1);
    setSelecionada(null);
  }

  function reiniciar() {
    setIndice(0);
    setSelecionada(null);
    setAcertos(0);
    setFinalizado(false);
  }

  if (finalizado) {
    const aproveitamento = Math.round((acertos / QUIZ.length) * 100);
    const mensagem =
      aproveitamento >= 80
        ? "Excelente! Você já domina o básico do mercado."
        : aproveitamento >= 50
          ? "Bom caminho! Revise as trilhas e tente de novo."
          : "Sem problema: volte às trilhas educativas e tente outra vez.";
    return (
      <div className="card mx-auto max-w-xl p-8 text-center">
        <p className="text-5xl">🏁</p>
        <h2 className="mt-4 text-2xl font-black text-slate-900">
          {acertos} de {QUIZ.length} acertos
        </h2>
        <p className="mt-1 text-sm text-slate-500">{aproveitamento}% de aproveitamento</p>
        <p className="mt-3 text-sm text-slate-600">{mensagem}</p>
        <button type="button" onClick={reiniciar} className="btn-primary mt-6">
          Jogar novamente
        </button>
      </div>
    );
  }

  const respondida = selecionada !== null;

  return (
    <div className="card mx-auto max-w-2xl p-6 sm:p-8">
      <div className="flex items-center justify-between text-xs font-semibold text-slate-500">
        <span>
          Pergunta {indice + 1} de {QUIZ.length}
        </span>
        <span>{acertos} acertos</span>
      </div>
      <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-slate-100">
        <div
          className="h-full rounded-full bg-brand-500 transition-all"
          style={{ width: `${((indice + (respondida ? 1 : 0)) / QUIZ.length) * 100}%` }}
        />
      </div>

      <h2 className="mt-6 text-xl font-bold text-slate-900">{pergunta.pergunta}</h2>

      <div className="mt-5 space-y-2.5">
        {pergunta.opcoes.map((opcao, posicao) => {
          const certa = posicao === pergunta.correta;
          const escolhida = posicao === selecionada;
          let classe =
            "border-slate-200 bg-white text-slate-700 hover:border-brand-300 hover:bg-brand-50";
          if (respondida && certa) classe = "border-brand-500 bg-brand-50 text-brand-900";
          if (respondida && escolhida && !certa) classe = "border-red-300 bg-red-50 text-red-700";
          return (
            <button
              key={opcao}
              type="button"
              disabled={respondida}
              onClick={() => setSelecionada(posicao)}
              className={`flex w-full items-center gap-3 rounded-xl border px-4 py-3 text-left text-sm font-medium transition disabled:cursor-default ${classe}`}
            >
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-current text-xs font-bold">
                {String.fromCharCode(65 + posicao)}
              </span>
              {opcao}
            </button>
          );
        })}
      </div>

      {respondida ? (
        <div className="mt-4 rounded-xl bg-slate-50 px-4 py-3 text-sm text-slate-600">
          <span className="font-semibold text-slate-800">
            {selecionada === pergunta.correta ? "Acertou! " : "Quase. "}
          </span>
          {pergunta.explicacao}
        </div>
      ) : null}

      <div className="mt-5 flex justify-end gap-2">
        {!respondida ? (
          <button type="button" onClick={confirmar} className="btn-primary" disabled={selecionada === null}>
            Confirmar
          </button>
        ) : (
          <button type="button" onClick={avancar} className="btn-primary">
            {indice + 1 >= QUIZ.length ? "Ver resultado" : "Próxima"}
          </button>
        )}
      </div>
    </div>
  );
}
