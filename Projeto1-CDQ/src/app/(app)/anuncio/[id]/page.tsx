export const dynamic = "force-dynamic";

import Link from "next/link";
import { notFound } from "next/navigation";
import {
  excluirAnuncioAction,
  marcarVendidoAction,
  solicitarImpulsionamentoAction,
} from "@/app/actions/anuncios";
import { aprovarAnuncioAction, rejeitarAnuncioAction } from "@/app/actions/admin";
import { BotaoConfirmar } from "@/components/BotaoConfirmar";
import { FotoAnuncio } from "@/components/CardAnuncio";
import { StatusAnuncioBadge } from "@/components/StatusBadges";
import { exigirAprovado } from "@/lib/auth";
import {
  DIAS_IMPULSIONAMENTO,
  rotuloCategoria,
  rotuloCondicao,
} from "@/lib/constantes";
import { estaImpulsionado, fotosDe, getPrecoDiaCentavos, obterAnuncio } from "@/lib/data";
import { formatarData, formatarMoeda, iniciais, linkWhatsApp } from "@/lib/format";

export default async function AnuncioPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const anuncioId = Number.parseInt(id, 10);
  if (!Number.isFinite(anuncioId)) notFound();

  const viewer = await exigirAprovado();
  const anuncio = await obterAnuncio(anuncioId);
  if (!anuncio) notFound();

  const dono = anuncio.usuario_id === viewer.id;
  const admin = viewer.role === "admin";
  const podeVer =
    anuncio.status === "aprovado" ||
    anuncio.status === "vendido" ||
    dono ||
    admin;
  if (!podeVer) notFound();

  const fotos = fotosDe(anuncio);
  const destaque = estaImpulsionado(anuncio);
  const precoDia = await getPrecoDiaCentavos();
  const whatsapp = linkWhatsApp(anuncio.whatsapp);

  return (
    <div className="space-y-5">
      <Link href="/" className="text-sm font-medium text-brand-700 hover:underline">← Voltar aos anúncios</Link>

      {!dono && !admin && anuncio.status === "vendido" ? (
        <p className="rounded-lg bg-slate-100 px-3 py-2 text-sm font-medium text-slate-600">
          Este anúncio já foi vendido.
        </p>
      ) : null}

      {dono || admin ? (
        anuncio.status !== "aprovado" ? (
          <div className="flex flex-wrap items-center gap-2 rounded-lg bg-slate-100 px-3 py-2 text-sm">
            <StatusAnuncioBadge status={anuncio.status} />
            {anuncio.status === "pendente" ? <span className="text-slate-600">Aguardando análise da equipe.</span> : null}
            {anuncio.status === "rejeitado" ? (
              <span className="text-slate-600">Motivo: {anuncio.motivo_rejeicao || "não informado"}</span>
            ) : null}
            {anuncio.status === "vendido" ? <span className="text-slate-600">Marcado como vendido.</span> : null}
          </div>
        ) : null
      ) : null}

      <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
        <div className="space-y-5">
          <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
            <div className="aspect-[4/3] bg-slate-100">
              <FotoAnuncio anuncio={anuncio} prioridade />
            </div>
            {fotos.length > 1 ? (
              <div className="grid grid-cols-4 gap-1 p-1">
                {fotos.slice(1, 9).map((url) => (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img key={url} src={url} alt={anuncio.titulo} className="aspect-square w-full rounded object-cover" />
                ))}
              </div>
            ) : null}
          </div>

          <div className="card p-5">
            <div className="flex flex-wrap items-center gap-2">
              <span className="badge bg-brand-50 text-brand-700">{rotuloCategoria(anuncio.categoria)}</span>
              <span className="badge bg-slate-100 text-slate-600">{rotuloCondicao(anuncio.condicao)}</span>
              {destaque ? <span className="badge bg-amber-100 text-amber-800">Destaque</span> : null}
            </div>
            <h1 className="mt-2 text-2xl font-bold text-slate-800">{anuncio.titulo}</h1>
            <p className="mt-1 text-2xl font-bold text-brand-700">
              {anuncio.preco_centavos === 0 ? "Grátis" : formatarMoeda(anuncio.preco_centavos)}
            </p>
            <p className="mt-1 text-xs text-slate-400">
              {anuncio.bairro || "Deus Quer"} · publicado em {formatarData(anuncio.criado_em)}
            </p>
            <div className="mt-4 whitespace-pre-line text-sm leading-relaxed text-slate-600">
              {anuncio.descricao}
            </div>
          </div>
        </div>

        <aside className="space-y-4">
          <div className="card p-5">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Vendedor</p>
            <div className="mt-2 flex items-center gap-3">
              {anuncio.autor_avatar ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={anuncio.autor_avatar} alt={anuncio.autor_nome} className="h-11 w-11 rounded-full object-cover" />
              ) : (
                <span className="flex h-11 w-11 items-center justify-center rounded-full bg-brand-100 text-sm font-bold text-brand-700">
                  {iniciais(anuncio.autor_nome)}
                </span>
              )}
              <div>
                <p className="text-sm font-semibold text-slate-800">{anuncio.autor_nome}</p>
                <p className="text-xs text-slate-400">No bairro desde {formatarData(anuncio.autor_criado_em)}</p>
              </div>
            </div>

            {anuncio.status === "aprovado" && whatsapp ? (
              <a href={whatsapp} target="_blank" rel="noreferrer" className="btn-primary mt-4 w-full">
                Falar no WhatsApp
              </a>
            ) : null}

            {anuncio.status === "vendido" ? (
              <p className="mt-4 rounded-lg bg-slate-100 px-3 py-2 text-center text-sm font-medium text-slate-500">
                Anúncio vendido
              </p>
            ) : null}

            <p className="mt-3 text-[11px] leading-relaxed text-slate-400">
              Combine em local movimentado e confira o produto antes de pagar. Não envie dinheiro adiantado.
            </p>
          </div>

          {dono || admin ? (
            <div className="card space-y-3 p-5">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Ações do anúncio</p>
              <Link href={`/anuncios/${anuncio.id}/editar`} className="btn-secondary w-full">Editar anúncio</Link>

              {anuncio.status !== "vendido" ? (
                <form action={marcarVendidoAction}>
                  <input type="hidden" name="id" value={anuncio.id} />
                  <button type="submit" className="btn-secondary w-full">Marcar como vendido</button>
                </form>
              ) : null}

              <form action={excluirAnuncioAction}>
                <input type="hidden" name="id" value={anuncio.id} />
                <BotaoConfirmar className="btn-danger w-full" mensagem="Excluir este anúncio?">
                  Excluir anúncio
                </BotaoConfirmar>
              </form>
            </div>
          ) : null}

          {dono && anuncio.status === "aprovado" ? (
            <div className="card space-y-3 p-5">
              <div>
                <p className="text-sm font-semibold text-slate-800">Impulsionar anúncio</p>
                <p className="text-xs text-slate-500">
                  {destaque
                    ? `Seu anúncio está em destaque até ${formatarData(anuncio.impulsionado_ate)}.`
                    : "Fique no topo do feed por alguns dias."}
                </p>
              </div>
              <form action={solicitarImpulsionamentoAction} className="space-y-2">
                <input type="hidden" name="id" value={anuncio.id} />
                <select name="dias" className="input" defaultValue="7">
                  {DIAS_IMPULSIONAMENTO.map((dias) => (
                    <option key={dias} value={dias}>
                      {dias} dias — {formatarMoeda(precoDia * dias)}
                    </option>
                  ))}
                </select>
                <button type="submit" className="btn-accent w-full">Solicitar destaque</button>
              </form>
              <p className="text-[11px] leading-relaxed text-slate-400">
                A equipe confirma o pagamento (Pix) e ativa o destaque.
              </p>
            </div>
          ) : null}

          {admin && anuncio.status === "pendente" ? (
            <div className="card space-y-3 border-amber-200 bg-amber-50/40 p-5">
              <p className="text-sm font-semibold text-amber-900">Moderação</p>
              <form action={aprovarAnuncioAction}>
                <input type="hidden" name="id" value={anuncio.id} />
                <button type="submit" className="btn-primary w-full">Aprovar anúncio</button>
              </form>
              <form action={rejeitarAnuncioAction} className="space-y-2">
                <input type="hidden" name="id" value={anuncio.id} />
                <input name="motivo" className="input text-sm" placeholder="Motivo da rejeição" />
                <button type="submit" className="btn-danger w-full">Rejeitar</button>
              </form>
            </div>
          ) : null}
        </aside>
      </div>
    </div>
  );
}
