import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = { title: "Regras e privacidade · Classificados do Deus Quer" };

export default function TermosPage() {
  return (
    <main className="min-h-screen bg-slate-50 p-4">
      <div className="mx-auto max-w-2xl py-10">
        <Link href="/entrar" className="text-sm font-semibold text-brand-700 hover:underline">← Voltar</Link>
        <h1 className="mt-3 text-2xl font-bold text-slate-800">Regras e privacidade</h1>
        <div className="card mt-5 space-y-5 p-6 text-sm leading-relaxed text-slate-600">
          <section>
            <h2 className="font-semibold text-slate-800">Quem pode participar</h2>
            <p>O espaço é para moradores e comerciantes do bairro Deus Quer. Todo cadastro passa por aprovação da equipe.</p>
          </section>
          <section>
            <h2 className="font-semibold text-slate-800">Anúncios</h2>
            <p>Todo anúncio é analisado antes de ser publicado. Não permitimos produtos ilegais, armas, drogas, documentos falsos ou qualquer item proibido por lei.</p>
            <p className="mt-2">Use fotos reais do produto, informe o estado e combine a entrega em local seguro.</p>
          </section>
          <section>
            <h2 className="font-semibold text-slate-800">Segurança</h2>
            <p>Não envie dinheiro adiantado para desconhecidos. Prefira encontros em locais movimentados e confirme o produto antes de pagar.</p>
          </section>
          <section>
            <h2 className="font-semibold text-slate-800">Impulsionamento</h2>
            <p>O destaque é opcional e pago. O anúncio fica no topo do feed pelo período contratado após a confirmação da equipe.</p>
          </section>
          <section>
            <h2 className="font-semibold text-slate-800">Privacidade</h2>
            <p>Guardamos seu nome, e-mail e foto pública do Google, além do WhatsApp informado nos anúncios. Usamos esses dados apenas para o funcionamento do classificados. Você pode pedir a exclusão da conta à equipe.</p>
          </section>
        </div>
      </div>
    </main>
  );
}
