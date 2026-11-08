"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "@/components/SessionProvider";
import type { ModoOperacao } from "@/lib/types";

type RequireOperadorProps = {
  modos?: ModoOperacao[];
  children: React.ReactNode;
};

export default function RequireOperador({
  modos = ["caixa", "atendente", "operador"],
  children,
}: RequireOperadorProps) {
  const { sessao, carregado } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (carregado && sessao.modo === "cliente") {
      router.push("/");
    }
  }, [carregado, sessao.modo, router]);

  if (!carregado) {
    return null;
  }

  if (!modos.includes(sessao.modo)) {
    return (
      <main className="mx-auto max-w-3xl px-4 py-10">
        <div className="card p-8 text-center">
          <p className="text-4xl">🔒</p>
          <h1 className="mt-3 text-2xl font-black tracking-tight text-ink">
            Acesso restrito
          </h1>
          <p className="mt-2 text-sm text-amber-900/60">
            Seu perfil não tem permissão para acessar esta área.
          </p>
          <p className="mt-1 text-xs text-amber-900/50">
            Entre com um código de operação autorizado.
          </p>
        </div>
      </main>
    );
  }

  return <>{children}</>;
}
