import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { usuarioAtual } from "@/lib/auth";

export const metadata: Metadata = { title: "Entrar · Classificados do Deus Quer" };

const ERROS: Record<string, string> = {
  google: "Não foi possível entrar com o Google. Tente novamente.",
  estado: "A sessão de login expirou. Tente novamente.",
};

export default async function EntrarPage({
  searchParams,
}: {
  searchParams: Promise<{ erro?: string }>;
}) {
  const usuario = await usuarioAtual();
  if (usuario) {
    if (usuario.status === "aprovado") redirect("/");
    if (usuario.status === "bloqueado") redirect("/bloqueado");
    redirect("/aguardando");
  }

  const { erro } = await searchParams;
  const googleConfigurado = Boolean(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET);
  const devLogin = process.env.DEV_LOGIN === "1" && process.env.NODE_ENV !== "production";

  return (
    <main className="min-h-screen bg-slate-50">
      <div className="mx-auto grid min-h-screen max-w-5xl items-center gap-10 px-4 py-10 lg:grid-cols-2">
        <section className="hidden lg:block">
          <div className="mb-6 flex items-center gap-3">
            <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-600 text-sm font-black text-white">
              CDQ
            </span>
            <div>
              <p className="text-lg font-black leading-none text-slate-800">Classificados</p>
              <p className="text-sm font-medium text-brand-700">do bairro Deus Quer</p>
            </div>
          </div>
          <h1 className="text-3xl font-bold leading-tight text-slate-800">
            Compre, venda e troque com quem está pertinho de você.
          </h1>
          <p className="mt-3 max-w-md text-sm leading-relaxed text-slate-500">
            Um espaço só para o bairro Deus Quer. Entre com sua conta Google, aguarde a aprovação da equipe e comece a anunciar.
          </p>
          <ul className="mt-6 space-y-2 text-sm text-slate-600">
            <li className="flex items-center gap-2"><span className="h-1.5 w-1.5 rounded-full bg-brand-500" /> Anúncios aprovados pela equipe do bairro</li>
            <li className="flex items-center gap-2"><span className="h-1.5 w-1.5 rounded-full bg-brand-500" /> Contato direto pelo WhatsApp</li>
            <li className="flex items-center gap-2"><span className="h-1.5 w-1.5 rounded-full bg-brand-500" /> Destaque opcional para vender mais rápido</li>
          </ul>
        </section>

        <section className="mx-auto w-full max-w-sm">
          <div className="mb-6 text-center lg:hidden">
            <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-600 text-sm font-black text-white">
              CDQ
            </span>
            <h1 className="mt-3 text-xl font-bold text-slate-800">Classificados do Deus Quer</h1>
            <p className="text-sm text-slate-500">Compre, venda e troque no bairro.</p>
          </div>

          <div className="card space-y-4 p-6">
            <div>
              <h2 className="text-base font-bold text-slate-800">Entrar</h2>
              <p className="text-sm text-slate-500">Use sua conta Google para continuar.</p>
            </div>

            {erro ? (
              <p className="rounded-lg bg-red-50 px-3 py-2 text-sm font-medium text-red-600">
                {ERROS[erro] ?? "Não foi possível entrar. Tente novamente."}
              </p>
            ) : null}

            <a
              href="/api/auth/google"
              className="flex w-full items-center justify-center gap-3 rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
            >
              <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.76h3.56c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.56-2.76c-.98.66-2.23 1.06-3.72 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84A11 11 0 0 0 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.11a6.6 6.6 0 0 1 0-4.22V7.05H2.18a11 11 0 0 0 0 9.9l3.66-2.84z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1A11 11 0 0 0 2.18 7.05l3.66 2.84C6.71 7.31 9.14 5.38 12 5.38z" />
              </svg>
              Entrar com Google
            </a>

            {!googleConfigurado ? (
              <p className="rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-800">
                Login Google ainda não configurado neste ambiente.
              </p>
            ) : null}

            {devLogin ? (
              <a href="/api/auth/dev" className="btn-secondary w-full text-xs">
                Entrar como equipe (dev)
              </a>
            ) : null}

            <p className="text-center text-xs leading-relaxed text-slate-400">
              O primeiro acesso passa por aprovação da equipe do bairro.
              <br />
              Ao entrar, você aceita as <a href="/termos" className="font-semibold text-brand-700 hover:underline">regras e a política de privacidade</a>.
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}
