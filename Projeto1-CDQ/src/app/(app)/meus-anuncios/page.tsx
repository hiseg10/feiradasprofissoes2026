export const dynamic = "force-dynamic";

import Link from "next/link";
import {
  excluirAnuncioAction,
  marcarVendidoAction,
  solicitarImpulsionamentoAction,
} from "@/app/actions/anuncios";
import { BotaoConfirmar } from "@/components/BotaoConfirmar";
import { FotoAnuncio } from "@/components/CardAnuncio";
import { StatusAnuncioBadge } from "@/components/StatusBadges";
import { exigirAprovado } from "@/lib/auth";
import { DIAS_IMPULSIONAMENTO } from "@/lib/constantes";
import { estaImpulsionado, getPrecoDiaCentavos, listarMeusAnuncios } from "@/lib/data";
import { formatarData, formatarMoeda } from "@/lib/format";

const AVISOS: Record<string, { texto: string; cor: string }> = {
  enviado: { texto: "Anúncio enviado! Ele será publicado após a análise da equipe.", cor: "bg-brand-50 text-brand-800" },
  editado: { texto: "Alterações salvas. O anúncio voltou para análise.", cor: "bg-brand-50 text-brand-800" },
  excluido: { texto: "Anúncio excluído.", cor: "bg-slate-100 text-slate-600" },
  vendido: { texto: "Anúncio marcado como vendido.", cor: "bg-slate-100 text-slate-600" },
  impulsionamento: { texto: "Solicitação de destaque enviada. A equipe vai confirmar o pagamento.", cor: "bg-amber-50 text-amber-800" },
};

export default async function MeusAnunciosPage({
  searchParams,
}: {
  searchParams: Promise<{ [chave: string]: string | undefined }>;
}) {
  const usuario = await exigirAprovado();
  const params = await searchParams;
  const [anuncios, precoDia] = await Promise.all([
    listarMeusAnuncios(usuario.id),
    getPrecoDiaCentavos(),
  ]);

  const aviso = Object.keys(AVISOS).find((chave) => params[chave] === "1" || params[chave] === "erro");
  const erroImpulsionamento = params.erro === "impulsionamento";

  const publicados = anuncios.filter((a) => a.status === "aprovado").length;
  const emAnalise = anuncios.filter((a) => a.status === "pendente").length;

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Meus anúncios</h1>
          <p className="text-sm text-slate-500">
            {anuncios.length} no total · {publicados} publicado(s) · {emAnalise} em análise
          </p>
        </div>
        <Link href="/anuncios/novo" className="btn-primary">+ Novo anúncio</Link>
      </div>

      {aviso ? <p className={`rounded-lg px-3 py-2 text-sm font-medium ${AVISOS[aviso].cor}`}>{AVISOS[aviso].texto}</p> : null}
      {erroImpulsionamento ? (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-sm font-medium text-red-600">
          Não foi possível solicitar o destaque. Verifique se o anúncio está publicado e sem pedido pendente.
        </p>
      ) : null}

      {anuncios.length === 0 ? (
        <div className="card p-10 text-center">
          <p className="text-sm font-medium text-slate-600">Você ainda não tem anúncios.</p>
          <Link href="/anuncios/novo" className="btn-primary mt-4">Criar meu primeiro anúncio</Link>
        </div>
      ) : (
        <div className="space-y-3">
          {anuncios.map((anuncio) => {
            const destaque = estaImpulsionado(anuncio);
            return (
              <article key={anuncio.id} className="card overflow-hidden">
                <div className="flex flex-col gap-3 p-3 sm:flex-row">
                  <Link href={`/anuncio/${anuncio.id}`} className="h-24 w-full shrink-0 overflow-hidden rounded-lg bg-slate-100 sm:h-24 sm:w-32">
                    <FotoAnuncio anuncio={anuncio} />
                  </Link>

                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <StatusAnuncioBadge status={anuncio.status} />
                      {destaque ? (
                        <span className="badge bg-amber-100 text-amber-800">Destaque até {formatarData(anuncio.impulsionado_ate)}</span>
                      ) : null}
                    </div>
                    <Link href={`/anuncio/${anuncio.id}`} className="mt-1 block truncate text-sm font-semibold text-slate-800 hover:text-brand-700">
                      {anuncio.titulo}
                    </Link>
                    <p className="text-sm font-bold text-brand-700">
                      {anuncio.preco_centavos === 0 ? "Grátis" : formatarMoeda(anuncio.preco_centavos)}
                    </p>
                    {anuncio.status === "rejeitado" ? (
                      <p className="mt-1 text-xs text-red-600">Motivo: {anuncio.motivo_rejeicao || "não informado"}</p>
                    ) : null}

                    <div className="mt-2 flex flex-wrap items-center gap-2">
                      <Link href={`/anuncios/${anuncio.id}/editar`} className="text-xs font-semibold text-brand-700 hover:underline">
                        Editar
                      </Link>
                      {anuncio.status !== "vendido" ? (
                        <form action={marcarVendidoAction}>
                          <input type="hidden" name="id" value={anuncio.id} />
                          <button type="submit" className="text-xs font-semibold text-slate-500 hover:underline">
                            Marcar vendido
                          </button>
                        </form>
                      ) : null}
                      <form action={excluirAnuncioAction}>
                        <input type="hidden" name="id" value={anuncio.id} />
                        <BotaoConfirmar className="text-xs font-semibold text-red-600 hover:underline" mensagem="Excluir este anúncio?">
                          Excluir
                        </BotaoConfirmar>
                      </form>
                    </div>

                    {anuncio.status === "aprovado" ? (
                      <form action={solicitarImpulsionamentoAction} className="mt-2 flex flex-wrap items-center gap-2">
                        <input type="hidden" name="id" value={anuncio.id} />
                        <select name="dias" className="input w-auto py-1 text-xs" defaultValue="7">
                          {DIAS_IMPULSIONAMENTO.map((dias) => (
                            <option key={dias} value={dias}>
                              {dias} dias — {formatarMoeda(precoDia * dias)}
                            </option>
                          ))}
                        </select>
                        <button type="submit" className="btn-accent px-3 py-1 text-xs">Impulsionar</button>
                      </form>
                    ) : null}
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}
