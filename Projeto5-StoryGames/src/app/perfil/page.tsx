import type { Metadata } from "next";
import ProfileView from "@/components/ProfileView";

export const metadata: Metadata = {
  title: "Perfil · Story Games",
  description: "Conta simulada com estatísticas e conquistas da loja.",
};

export default function PerfilPage() {
  return (
    <main className="mx-auto max-w-7xl px-4 py-8">
      <header className="max-w-2xl">
        <p className="eyebrow">Perfil</p>
        <h1 className="mt-1 text-3xl font-black tracking-tight text-white sm:text-4xl">
          Sua conta na Story Games
        </h1>
        <p className="mt-2 text-sm text-slate-400">
          Tudo fica salvo no navegador. Nenhum dado é enviado para um servidor.
        </p>
      </header>
      <ProfileView />
    </main>
  );
}
