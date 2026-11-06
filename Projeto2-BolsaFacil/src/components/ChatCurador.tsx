"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import type { MensagemIA } from "@/lib/types";

type Meta = {
  provedor: string;
  modelo: string;
  usadoFallback: boolean;
};

const SUGESTOES = [
  "O que é a Selic e como ela afeta meus investimentos?",
  "Qual a diferença entre CDB e Tesouro Direto?",
  "Como funcionam os fundos imobiliários?",
  "Por que diversificar reduz o risco?",
  "Ações são seguras para quem está começando?",
];

const MENSAGEM_INICIAL =
  "Olá! Eu sou o Curador do Bolsa Fácil. Posso explicar renda fixa, ações, FIIs, ETFs, juros compostos e riscos usando os dados de mercado do painel. O que você quer entender hoje?";

export default function ChatCurador() {
  const [mensagens, setMensagens] = useState<MensagemIA[]>([
    { papel: "assistant", texto: MENSAGEM_INICIAL },
  ]);
  const [entrada, setEntrada] = useState("");
  const [carregando, setCarregando] = useState(false);
  const [meta, setMeta] = useState<Meta | null>(null);
  const [erro, setErro] = useState<string | null>(null);
  const fim = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fim.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [mensagens, carregando]);

  async function enviar(texto: string) {
    const pergunta = texto.trim();
    if (!pergunta || carregando) return;

    const historico: MensagemIA[] = [...mensagens, { papel: "user", texto: pergunta }];
    setMensagens(historico);
    setEntrada("");
    setErro(null);
    setCarregando(true);

    try {
      const resposta = await fetch("/api/ia/curador", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ historico }),
      });
      const dados = (await resposta.json()) as {
        resposta?: string;
        provedor?: string;
        modelo?: string;
        usadoFallback?: boolean;
        erro?: string;
      };

      if (!resposta.ok || !dados.resposta) {
        throw new Error(dados.erro ?? "Falha ao consultar o curador");
      }

      setMensagens([...historico, { papel: "assistant", texto: dados.resposta }]);
      setMeta({
        provedor: dados.provedor ?? "desconhecido",
        modelo: dados.modelo ?? "desconhecido",
        usadoFallback: Boolean(dados.usadoFallback),
      });
    } catch (falha) {
      const mensagem = falha instanceof Error ? falha.message : "Erro inesperado";
      setErro(mensagem);
      setMensagens([
        ...historico,
        {
          papel: "assistant",
          texto:
            "Não consegui falar com o provedor de IA agora. Tente novamente em instantes ou confira as trilhas educativas.",
        },
      ]);
    } finally {
      setCarregando(false);
    }
  }

  function aoEnviar(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault();
    void enviar(entrada);
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_280px]">
      <div className="card flex h-[560px] flex-col overflow-hidden">
        <div className="flex items-center gap-3 border-b border-slate-200 px-4 py-3">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-100 text-lg">
            🤖
          </span>
          <div>
            <p className="text-sm font-bold text-slate-900">Curador Bolsa Fácil</p>
            <p className="text-xs text-slate-500">Educação financeira com dados de mercado</p>
          </div>
          {meta ? (
            <span className="ml-auto rounded-full bg-slate-100 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-slate-500">
              {meta.provedor} · {meta.modelo}
            </span>
          ) : null}
        </div>

        <div className="flex-1 space-y-4 overflow-y-auto bg-slate-50/60 px-4 py-4">
          {mensagens.map((mensagem, indice) => {
            const doUsuario = mensagem.papel === "user";
            return (
              <div
                key={`${mensagem.papel}-${indice}`}
                className={`flex ${doUsuario ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[85%] whitespace-pre-line rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed ${
                    doUsuario
                      ? "rounded-br-md bg-brand-600 text-white"
                      : "rounded-bl-md border border-slate-200 bg-white text-slate-700"
                  }`}
                >
                  {mensagem.texto}
                </div>
              </div>
            );
          })}
          {carregando ? (
            <div className="flex justify-start">
              <div className="rounded-2xl rounded-bl-md border border-slate-200 bg-white px-4 py-3 text-sm text-slate-500">
                <span className="inline-flex items-center gap-1.5">
                  <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-brand-500 [animation-delay:-0.2s]" />
                  <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-brand-500 [animation-delay:-0.1s]" />
                  <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-brand-500" />
                  Consultando dados...
                </span>
              </div>
            </div>
          ) : null}
          <div ref={fim} />
        </div>

        {erro ? (
          <p className="border-t border-red-100 bg-red-50 px-4 py-2 text-xs text-red-600">{erro}</p>
        ) : null}

        <form onSubmit={aoEnviar} className="flex gap-2 border-t border-slate-200 p-3">
          <input
            className="input"
            value={entrada}
            onChange={(evento) => setEntrada(evento.target.value)}
            placeholder="Pergunte sobre investimentos..."
            aria-label="Sua pergunta"
            disabled={carregando}
          />
          <button type="submit" className="btn-primary shrink-0" disabled={carregando || !entrada.trim()}>
            Enviar
          </button>
        </form>
      </div>

      <aside className="space-y-4">
        <div className="card p-4">
          <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
            Perguntas sugeridas
          </p>
          <div className="mt-3 space-y-2">
            {SUGESTOES.map((sugestao) => (
              <button
                key={sugestao}
                type="button"
                onClick={() => void enviar(sugestao)}
                disabled={carregando}
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-left text-xs font-medium text-slate-600 transition hover:border-brand-300 hover:bg-brand-50 hover:text-brand-800 disabled:opacity-60"
              >
                {sugestao}
              </button>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-xs leading-relaxed text-amber-800">
          <p className="font-bold">Aviso importante</p>
          <p className="mt-1">
            O curador é educativo e não faz recomendação de investimento. Ele usa os dados do painel,
            que podem estar em modo demonstração.
          </p>
        </div>
      </aside>
    </div>
  );
}
