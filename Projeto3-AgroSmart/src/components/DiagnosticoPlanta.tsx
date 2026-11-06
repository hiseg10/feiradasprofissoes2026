"use client";

import { useState, type ChangeEvent, type FormEvent } from "react";

type Resultado = {
  resposta: string;
  provedor: string;
  modelo: string;
  usadoFallback: boolean;
};

const LIMITE_MB = 4;

export default function DiagnosticoPlanta() {
  const [preview, setPreview] = useState<string | null>(null);
  const [imagem, setImagem] = useState<string | null>(null);
  const [cultura, setCultura] = useState("");
  const [resultado, setResultado] = useState<Resultado | null>(null);
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  function escolherArquivo(evento: ChangeEvent<HTMLInputElement>) {
    const arquivo = evento.target.files?.[0];
    if (!arquivo) return;

    if (!arquivo.type.startsWith("image/")) {
      setErro("Escolha um arquivo de imagem (JPG, PNG ou WEBP).");
      return;
    }
    if (arquivo.size > LIMITE_MB * 1024 * 1024) {
      setErro(`A imagem deve ter no máximo ${LIMITE_MB} MB.`);
      return;
    }

    const leitor = new FileReader();
    leitor.onload = () => {
      const dataUrl = String(leitor.result);
      setPreview(dataUrl);
      setImagem(dataUrl);
      setResultado(null);
      setErro(null);
    };
    leitor.onerror = () => setErro("Não foi possível ler a imagem.");
    leitor.readAsDataURL(arquivo);
  }

  async function analisar(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault();
    if (!imagem) {
      setErro("Escolha uma foto da folha antes de analisar.");
      return;
    }

    setCarregando(true);
    setErro(null);

    try {
      const resposta = await fetch("/api/ia/diagnostico", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imagem, cultura }),
      });
      const dados = (await resposta.json()) as Resultado & { erro?: string };
      if (!resposta.ok || !dados.resposta) {
        throw new Error(dados.erro ?? "Falha ao analisar a imagem");
      }
      setResultado(dados);
    } catch (falha) {
      setErro(falha instanceof Error ? falha.message : "Erro inesperado");
    } finally {
      setCarregando(false);
    }
  }

  function limpar() {
    setPreview(null);
    setImagem(null);
    setResultado(null);
    setErro(null);
  }

  return (
    <div className="grid gap-5 lg:grid-cols-[1fr_1.1fr]">
      <form onSubmit={analisar} className="card space-y-4 p-6">
        <div>
          <h2 className="text-lg font-bold text-slate-900">Foto da planta</h2>
          <p className="mt-1 text-sm text-slate-500">
            Prefira uma folha com boa luz, mostrando frente e verso. A imagem é enviada apenas para
            a análise.
          </p>
        </div>

        <div>
          <label htmlFor="foto" className="label">
            Arquivo de imagem
          </label>
          <input
            id="foto"
            type="file"
            accept="image/*"
            onChange={escolherArquivo}
            className="block w-full cursor-pointer rounded-xl border border-dashed border-slate-300 bg-slate-50 px-3 py-6 text-sm text-slate-600 file:mr-3 file:rounded-lg file:border-0 file:bg-brand-600 file:px-3 file:py-2 file:text-sm file:font-semibold file:text-white hover:file:bg-brand-700"
          />
        </div>

        <div>
          <label htmlFor="cultura" className="label">
            Cultura (opcional)
          </label>
          <input
            id="cultura"
            className="input"
            value={cultura}
            onChange={(evento) => setCultura(evento.target.value)}
            placeholder="Ex.: alface, tomate, couve"
            maxLength={60}
          />
        </div>

        {preview ? (
          <div
            role="img"
            aria-label="Prévia da foto enviada"
            className="h-48 w-full rounded-xl border border-slate-200 bg-cover bg-center"
            style={{ backgroundImage: `url(${preview})` }}
          />
        ) : (
          <div className="flex h-40 items-center justify-center rounded-xl border border-dashed border-slate-300 bg-slate-50 text-xs text-slate-400">
            A prévia da imagem aparece aqui
          </div>
        )}

        <div className="flex flex-wrap gap-2">
          <button type="submit" className="btn-primary" disabled={carregando || !imagem}>
            {carregando ? "Analisando..." : "Analisar com IA"}
          </button>
          {preview ? (
            <button type="button" onClick={limpar} className="btn-secondary" disabled={carregando}>
              Limpar
            </button>
          ) : null}
        </div>

        {erro ? (
          <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{erro}</p>
        ) : null}
      </form>

      <div className="space-y-4">
        <div className="card min-h-[260px] p-6">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-lg font-bold text-slate-900">Diagnóstico educativo</h2>
            {resultado ? (
              <span className="badge bg-slate-100 text-slate-600">
                {resultado.provedor} · {resultado.modelo}
              </span>
            ) : null}
          </div>

          {carregando ? (
            <p className="mt-6 text-sm text-slate-500">
              Analisando a imagem e montando hipóteses...
            </p>
          ) : resultado ? (
            <div className="mt-4">
              <p className="whitespace-pre-line text-sm leading-relaxed text-slate-700">
                {resultado.resposta}
              </p>
              {resultado.usadoFallback ? (
                <p className="mt-4 rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-800">
                  A IA não estava disponível, então foi usado o checklist local.
                </p>
              ) : null}
            </div>
          ) : (
            <p className="mt-6 text-sm leading-relaxed text-slate-500">
              Envie uma foto para receber hipóteses, nível de confiança e próximos passos. A análise
              é educativa e não substitui a visita de um engenheiro agrônomo.
            </p>
          )}
        </div>

        <div className="rounded-2xl border border-brand-200 bg-brand-50 p-5 text-xs leading-relaxed text-brand-900">
          <p className="font-bold">O que a IA observa</p>
          <ul className="mt-2 space-y-1">
            <li>Manchas, bordas secas e coloração das folhas</li>
            <li>Sinais de insetos, teias ou bolor</li>
            <li>Possível excesso ou falta de água</li>
            <li>Deficiências nutricionais comuns</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
