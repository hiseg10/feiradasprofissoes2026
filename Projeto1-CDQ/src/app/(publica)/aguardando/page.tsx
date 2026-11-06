import { redirect } from "next/navigation";
import { exigirUsuario } from "@/lib/auth";

export default async function AguardandoPage() {
  const usuario = await exigirUsuario();
  if (usuario.status === "aprovado") redirect("/");
  if (usuario.status === "bloqueado") redirect("/bloqueado");

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 p-4">
      <div className="w-full max-w-md">
        <div className="card space-y-4 p-6 text-center">
          <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-100 text-2xl font-black text-amber-700">
            !
          </span>
          <div>
            <h1 className="text-xl font-bold text-slate-800">Acesso em análise</h1>
            <p className="mt-1 text-sm text-slate-500">
              Olá, {usuario.nome}. Sua conta foi criada e está aguardando a aprovação da equipe do bairro.
            </p>
          </div>
          <div className="rounded-lg bg-slate-50 px-3 py-2 text-xs text-slate-500">
            E-mail: <span className="font-semibold text-slate-700">{usuario.email}</span>
          </div>
          <p className="text-xs leading-relaxed text-slate-400">
            Assim que aprovado, você poderá ver os anúncios e publicar. Se demorar, procure a equipe do bairro.
          </p>
          <a href="/api/auth/logout" className="btn-secondary w-full">Sair</a>
        </div>
      </div>
    </main>
  );
}
