export const dynamic = "force-dynamic";

import Link from "next/link";
import {
  aprovarAnuncioAction,
  aprovarUsuarioAction,
  bloquearUsuarioAction,
  cancelarImpulsionamentoAction,
  confirmarImpulsionamentoAction,
  promoverUsuarioAction,
  rebaixarUsuarioAction,
  rejeitarAnuncioAction,
  salvarConfigAction,
} from "@/app/actions/admin";
import { FotoAnuncio } from "@/components/CardAnuncio";
import { StatusAnuncioBadge, StatusUsuarioBadge } from "@/components/StatusBadges";
import { exigirAdmin } from "@/lib/auth";
import {
  getPrecoDiaCentavos,
  listarAnunciosAdmin,
  listarImpulsionamentosPendentes,
  listarUsuarios,
  resumoAdmin,
} from "@/lib/data";
import { centavosParaInput, formatarData, formatarDataHora, formatarMoeda } from "@/lib/format";

const OK: Record<string, string> = {
  aprovado: "Aprovação registrada.",
  bloqueado: "Usuário bloqueado.",
  admin: "Usuário promovido a administrador.",
  usuario: "Permissão de administrador removida.",
  rejeitado: "Anúncio rejeitado.",
  confirmado: "Pagamento confirmado e destaque ativado.",
  cancelado: "Pedido de destaque cancelado.",
  config: "Configuração salva.",
};

const ERROS: Record<string, string> = {
  proprio: "Você não pode bloquear ou rebaixar a si mesmo.",
  pedido: "Pedido de destaque não encontrado.",
};

const ABAS = [
  { valor: "usuarios", rotulo: "Usuários" },
  { valor: "anuncios", rotulo: "Anúncios" },
  { valor: "impulsionamentos", rotulo: "Impulsionamentos" },
  { valor: "config", rotulo: "Configurações" },
] as const;

export default async function AdminPage({
  searchParams,
}: {
  searchParams: Promise<{ aba?: string; status?: string; ok?: string; erro?: string }>;
}) {
  const admin = await exigirAdmin();
  const params = await searchParams;
  const aba = ABAS.some((item) => item.valor === params.aba) ? (params.aba as (typeof ABAS)[number]["valor"]) : "usuarios";
  const statusAnuncio = params.status ?? "pendente";

  const [resumo, precoDia] = await Promise.all([resumoAdmin(), getPrecoDiaCentavos()]);
  const usuarios = aba === "usuarios" ? await listarUsuarios() : [];
  const anuncios = aba === "anuncios" ? await listarAnunciosAdmin(statusAnuncio) : [];
  const pedidos = aba === "impulsionamentos" ? await listarImpulsionamentosPendentes() : [];

  const mensagem = params.ok ? OK[params.ok] : null;
  const erroMensagem = params.erro ? ERROS[params.erro] : null;

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Painel da equipe</h1>
        <p className="text-sm text-slate-500">Aprovações, moderação e destaques do bairro.</p>
      </div>

      {mensagem ? <p className="rounded-lg bg-brand-50 px-3 py-2 text-sm font-medium text-brand-800">{mensagem}</p> : null}
      {erroMensagem ? <p className="rounded-lg bg-red-50 px-3 py-2 text-sm font-medium text-red-600">{erroMensagem}</p> : null}

      <div className="flex gap-2 overflow-x-auto pb-1">
        {ABAS.map((item) => {
          const pendentes =
            item.valor === "usuarios"
              ? resumo.usuariosPendentes
              : item.valor === "anuncios"
                ? resumo.anunciosPendentes
                : item.valor === "impulsionamentos"
                  ? resumo.impulsionamentosPendentes
                  : 0;
          return (
            <Link
              key={item.valor}
              href={`/admin?aba=${item.valor}`}
              className={`shrink-0 rounded-full px-3 py-1.5 text-xs font-semibold transition ${
                aba === item.valor ? "bg-brand-600 text-white" : "bg-white text-slate-600 ring-1 ring-slate-200 hover:bg-slate-50"
              }`}
            >
              {item.rotulo}
              {pendentes > 0 ? (
                <span className="ml-1 rounded-full bg-amber-400 px-1.5 py-0.5 text-[10px] font-bold text-amber-950">{pendentes}</span>
              ) : null}
            </Link>
          );
        })}
      </div>

      {aba === "usuarios" ? (
        <div className="card overflow-hidden">
          <div className="border-b border-slate-100 px-4 py-3">
            <h2 className="text-sm font-semibold text-slate-700">
              Usuários ({resumo.usuariosTotal}) · {resumo.usuariosPendentes} aguardando aprovação
            </h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[820px]">
              <thead className="bg-slate-50">
                <tr>
                  <th className="th">Usuário</th>
                  <th className="th">Situação</th>
                  <th className="th text-center">Anúncios</th>
                  <th className="th">Desde</th>
                  <th className="th text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {usuarios.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-50">
                    <td className="td">
                      <div className="flex items-center gap-2">
                        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-xs font-bold text-slate-600">
                          {u.nome.slice(0, 2).toUpperCase()}
                        </span>
                        <div>
                          <p className="font-semibold text-slate-800">
                            {u.nome} {u.role === "admin" ? <span className="badge bg-brand-600 text-white">admin</span> : null}
                          </p>
                          <p className="text-xs text-slate-400">{u.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="td"><StatusUsuarioBadge status={u.status} /></td>
                    <td className="td text-center">{u.total_anuncios}</td>
                    <td className="td text-xs text-slate-400">{formatarData(u.criado_em)}</td>
                    <td className="td">
                      <div className="flex flex-wrap items-center justify-end gap-2">
                        {u.status !== "aprovado" ? (
                          <form action={aprovarUsuarioAction}>
                            <input type="hidden" name="id" value={u.id} />
                            <button className="rounded-md bg-brand-600 px-2.5 py-1 text-xs font-semibold text-white hover:bg-brand-700">
                              Aprovar
                            </button>
                          </form>
                        ) : null}
                        {u.status !== "bloqueado" && u.id !== admin.id ? (
                          <form action={bloquearUsuarioAction}>
                            <input type="hidden" name="id" value={u.id} />
                            <button className="rounded-md border border-red-200 px-2.5 py-1 text-xs font-semibold text-red-600 hover:bg-red-50">
                              Bloquear
                            </button>
                          </form>
                        ) : null}
                        {u.role === "admin" && u.id !== admin.id ? (
                          <form action={rebaixarUsuarioAction}>
                            <input type="hidden" name="id" value={u.id} />
                            <button className="text-xs font-semibold text-slate-500 hover:underline">Remover admin</button>
                          </form>
                        ) : null}
                        {u.role !== "admin" ? (
                          <form action={promoverUsuarioAction}>
                            <input type="hidden" name="id" value={u.id} />
                            <button className="text-xs font-semibold text-brand-700 hover:underline">Tornar admin</button>
                          </form>
                        ) : null}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : null}

      {aba === "anuncios" ? (
        <div className="space-y-3">
          <div className="flex gap-2 overflow-x-auto pb-1">
            {[
              { valor: "pendente", rotulo: "Em análise" },
              { valor: "aprovado", rotulo: "Publicados" },
              { valor: "rejeitado", rotulo: "Rejeitados" },
              { valor: "vendido", rotulo: "Vendidos" },
              { valor: "", rotulo: "Todos" },
            ].map((filtro) => (
              <Link
                key={filtro.valor || "todos"}
                href={`/admin?aba=anuncios&status=${filtro.valor}`}
                className={`shrink-0 rounded-full px-3 py-1 text-xs font-semibold ${
                  statusAnuncio === filtro.valor ? "bg-slate-800 text-white" : "bg-white text-slate-600 ring-1 ring-slate-200"
                }`}
              >
                {filtro.rotulo}
              </Link>
            ))}
          </div>

          {anuncios.length === 0 ? (
            <div className="card p-8 text-center text-sm text-slate-500">Nenhum anúncio neste filtro.</div>
          ) : (
            anuncios.map((a) => (
              <article key={a.id} className="card flex flex-col gap-3 p-3 sm:flex-row sm:items-center">
                <Link href={`/anuncio/${a.id}`} className="h-20 w-full shrink-0 overflow-hidden rounded-lg bg-slate-100 sm:w-28">
                  <FotoAnuncio anuncio={a} />
                </Link>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <StatusAnuncioBadge status={a.status} />
                    <span className="text-[11px] text-slate-400">{formatarData(a.criado_em)}</span>
                  </div>
                  <Link href={`/anuncio/${a.id}`} className="mt-1 block truncate text-sm font-semibold text-slate-800 hover:text-brand-700">
                    {a.titulo}
                  </Link>
                  <p className="text-xs text-slate-500">
                    {a.autor_nome} · {a.autor_email} · {formatarMoeda(a.preco_centavos)}
                  </p>
                  {a.motivo_rejeicao ? <p className="mt-1 text-xs text-red-600">Motivo: {a.motivo_rejeicao}</p> : null}
                </div>
                <div className="flex flex-wrap items-center gap-2 sm:justify-end">
                  {a.status === "pendente" ? (
                    <>
                      <form action={aprovarAnuncioAction}>
                        <input type="hidden" name="id" value={a.id} />
                        <button className="rounded-md bg-brand-600 px-2.5 py-1 text-xs font-semibold text-white hover:bg-brand-700">
                          Aprovar
                        </button>
                      </form>
                      <form action={rejeitarAnuncioAction} className="flex items-center gap-1">
                        <input type="hidden" name="id" value={a.id} />
                        <input name="motivo" className="input w-32 py-1 text-xs" placeholder="Motivo" />
                        <button className="rounded-md border border-red-200 px-2 py-1 text-xs font-semibold text-red-600 hover:bg-red-50">
                          Rejeitar
                        </button>
                      </form>
                    </>
                  ) : null}
                  <Link href={`/anuncio/${a.id}`} className="text-xs font-semibold text-brand-700 hover:underline">Abrir</Link>
                </div>
              </article>
            ))
          )}
        </div>
      ) : null}

      {aba === "impulsionamentos" ? (
        <div className="card overflow-hidden">
          <div className="border-b border-slate-100 px-4 py-3">
            <h2 className="text-sm font-semibold text-slate-700">
              Pedidos aguardando confirmação ({pedidos.length})
            </h2>
            <p className="text-xs text-slate-500">Confirme somente depois de receber o pagamento (Pix).</p>
          </div>
          {pedidos.length === 0 ? (
            <p className="p-8 text-center text-sm text-slate-500">Nenhum pedido pendente.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[820px]">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="th">Anúncio</th>
                    <th className="th">Solicitante</th>
                    <th className="th text-center">Dias</th>
                    <th className="th text-right">Valor</th>
                    <th className="th">Pedido em</th>
                    <th className="th text-right">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {pedidos.map((p) => (
                    <tr key={p.id} className="hover:bg-slate-50">
                      <td className="td font-medium">
                        <Link href={`/anuncio/${p.anuncio_id}`} className="hover:text-brand-700">{p.anuncio_titulo}</Link>
                      </td>
                      <td className="td text-xs">
                        <p className="font-semibold text-slate-700">{p.usuario_nome}</p>
                        <p className="text-slate-400">{p.usuario_email}</p>
                      </td>
                      <td className="td text-center">{p.dias}</td>
                      <td className="td text-right font-semibold">{formatarMoeda(p.valor_centavos)}</td>
                      <td className="td text-xs text-slate-400">{formatarDataHora(p.criado_em)}</td>
                      <td className="td">
                        <div className="flex items-center justify-end gap-2">
                          <form action={confirmarImpulsionamentoAction}>
                            <input type="hidden" name="id" value={p.id} />
                            <button className="rounded-md bg-brand-600 px-2.5 py-1 text-xs font-semibold text-white hover:bg-brand-700">
                              Confirmar pagamento
                            </button>
                          </form>
                          <form action={cancelarImpulsionamentoAction}>
                            <input type="hidden" name="id" value={p.id} />
                            <button className="text-xs font-semibold text-red-600 hover:underline">Cancelar</button>
                          </form>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      ) : null}

      {aba === "config" ? (
        <div className="card max-w-lg p-5">
          <h2 className="text-sm font-semibold text-slate-700">Valor do destaque</h2>
          <p className="mb-4 mt-1 text-xs text-slate-500">
            Preço por dia para impulsionar um anúncio. O valor é calculado no pedido do morador.
          </p>
          <form action={salvarConfigAction} className="space-y-3">
            <div>
              <label className="label" htmlFor="precoDia">Preço por dia (R$)</label>
              <input
                id="precoDia"
                name="precoDia"
                inputMode="decimal"
                defaultValue={centavosParaInput(precoDia)}
                className="input text-right"
              />
            </div>
            <button type="submit" className="btn-primary">Salvar configuração</button>
          </form>
        </div>
      ) : null}
    </div>
  );
}
