"use client";

import { useState } from "react";
import { CATEGORIAS, CONDICOES } from "@/lib/constantes";
import { centavosParaInput } from "@/lib/format";

type AnuncioExistente = {
  id: number;
  titulo: string;
  descricao: string;
  preco_centavos: number;
  categoria: string;
  condicao: string;
  bairro: string | null;
  whatsapp: string | null;
  fotos: string[];
};

type Props = {
  action: (formData: FormData) => void | Promise<void>;
  anuncio?: AnuncioExistente;
  modo: "criar" | "editar";
  erro?: string;
};

const ERROS: Record<string, string> = {
  campos: "Confira os campos: título, descrição (mín. 10 caracteres), categoria, condição e WhatsApp com DDD.",
  termos: "Você precisa aceitar as regras para publicar.",
  foto: "Não foi possível enviar a foto. Use JPG, PNG ou WEBP de até 5 MB. Em produção, o armazenamento de fotos precisa estar configurado.",
};

export function AnuncioForm({ action, anuncio, modo, erro }: Props) {
  const [previews, setPreviews] = useState<string[]>([]);
  const [remover, setRemover] = useState<string[]>([]);

  const fotosAtuais = anuncio?.fotos ?? [];

  function selecionarFotos(event: React.ChangeEvent<HTMLInputElement>) {
    const arquivos = Array.from(event.target.files ?? []).slice(0, 5);
    setPreviews(arquivos.map((arquivo) => URL.createObjectURL(arquivo)));
  }

  function alternarRemocao(url: string) {
    setRemover((atual) => (atual.includes(url) ? atual.filter((item) => item !== url) : [...atual, url]));
  }

  return (
    <form action={action} encType="multipart/form-data" className="space-y-5">
      {anuncio ? <input type="hidden" name="id" value={anuncio.id} /> : null}
      <input type="hidden" name="fotos_atuais" value={JSON.stringify(fotosAtuais)} />
      {remover.map((url) => (
        <input key={url} type="hidden" name="remover_foto" value={url} />
      ))}

      {erro ? (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-sm font-medium text-red-600">
          {ERROS[erro] ?? "Não foi possível salvar. Tente novamente."}
        </p>
      ) : null}

      <div className="card p-5">
        <h2 className="mb-4 text-sm font-semibold text-slate-700">O que você está anunciando?</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className="label" htmlFor="titulo">Título *</label>
            <input
              id="titulo"
              name="titulo"
              required
              minLength={3}
              maxLength={90}
              defaultValue={anuncio?.titulo ?? ""}
              className="input"
              placeholder="Ex.: Bicicleta aro 26 em bom estado"
            />
          </div>
          <div>
            <label className="label" htmlFor="categoria">Categoria *</label>
            <select id="categoria" name="categoria" required defaultValue={anuncio?.categoria ?? ""} className="input">
              <option value="" disabled>Selecione</option>
              {CATEGORIAS.map((c) => (
                <option key={c.valor} value={c.valor}>{c.rotulo}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="label" htmlFor="condicao">Condição *</label>
            <select id="condicao" name="condicao" required defaultValue={anuncio?.condicao ?? "usado"} className="input">
              {CONDICOES.map((c) => (
                <option key={c.valor} value={c.valor}>{c.rotulo}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="label" htmlFor="preco">Preço (R$)</label>
            <input
              id="preco"
              name="preco"
              inputMode="decimal"
              defaultValue={anuncio ? centavosParaInput(anuncio.preco_centavos) : ""}
              className="input"
              placeholder="0,00 (deixe 0 para doação)"
            />
          </div>
          <div>
            <label className="label" htmlFor="bairro">Bairro</label>
            <input id="bairro" name="bairro" defaultValue={anuncio?.bairro ?? "Deus Quer"} className="input" />
          </div>
          <div>
            <label className="label" htmlFor="whatsapp">WhatsApp com DDD *</label>
            <input
              id="whatsapp"
              name="whatsapp"
              required
              defaultValue={anuncio?.whatsapp ?? ""}
              className="input"
              placeholder="(86) 99999-0000"
            />
          </div>
          <div className="sm:col-span-2">
            <label className="label" htmlFor="descricao">Descrição *</label>
            <textarea
              id="descricao"
              name="descricao"
              required
              minLength={10}
              maxLength={1500}
              rows={5}
              defaultValue={anuncio?.descricao ?? ""}
              className="input"
              placeholder="Conte o estado, tempo de uso, o que acompanha e como retirar."
            />
          </div>
        </div>
      </div>

      <div className="card p-5">
        <h2 className="text-sm font-semibold text-slate-700">Fotos</h2>
        <p className="mb-3 mt-1 text-xs text-slate-500">Até 5 fotos, JPG/PNG/WEBP, máximo 5 MB cada.</p>

        {fotosAtuais.length > 0 ? (
          <div className="mb-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
            {fotosAtuais.map((url) => {
              const marcada = remover.includes(url);
              return (
                <label
                  key={url}
                  className={`relative cursor-pointer overflow-hidden rounded-lg border-2 transition ${
                    marcada ? "border-red-400 opacity-50" : "border-transparent"
                  }`}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={url} alt="Foto do anúncio" className="h-28 w-full object-cover" />
                  <span className="absolute inset-x-0 bottom-0 flex items-center gap-1 bg-black/50 px-2 py-1 text-[11px] font-medium text-white">
                    <input
                      type="checkbox"
                      checked={marcada}
                      onChange={() => alternarRemocao(url)}
                      className="h-3 w-3"
                    />
                    Remover
                  </span>
                </label>
              );
            })}
          </div>
        ) : null}

        <input
          type="file"
          name="fotos"
          accept="image/jpeg,image/png,image/webp"
          multiple
          onChange={selecionarFotos}
          className="block w-full cursor-pointer rounded-lg border border-dashed border-slate-300 bg-slate-50 px-3 py-6 text-sm text-slate-500 file:mr-3 file:rounded-md file:border-0 file:bg-brand-600 file:px-3 file:py-1.5 file:text-xs file:font-semibold file:text-white"
        />

        {previews.length > 0 ? (
          <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3">
            {previews.map((url) => (
              // eslint-disable-next-line @next/next/no-img-element
              <img key={url} src={url} alt="Prévia da foto" className="h-28 w-full rounded-lg object-cover" />
            ))}
          </div>
        ) : null}
      </div>

      {modo === "criar" ? (
        <label className="flex items-start gap-2 text-sm text-slate-600">
          <input type="checkbox" name="termos" required className="mt-0.5 h-4 w-4" />
          <span>
            Confirmo que as informações são verdadeiras e aceito as{" "}
            <a href="/termos" className="font-semibold text-brand-700 hover:underline" target="_blank">
              regras do bairro
            </a>.
          </span>
        </label>
      ) : (
        <p className="rounded-lg bg-amber-50 px-3 py-2 text-xs font-medium text-amber-800">
          Ao salvar, o anúncio volta para análise da equipe antes de aparecer novamente.
        </p>
      )}

      <div className="flex flex-wrap items-center gap-2">
        <button type="submit" className="btn-primary">
          {modo === "criar" ? "Enviar para aprovação" : "Salvar alterações"}
        </button>
        <a href={anuncio ? `/anuncio/${anuncio.id}` : "/"} className="btn-secondary">Cancelar</a>
      </div>
    </form>
  );
}
