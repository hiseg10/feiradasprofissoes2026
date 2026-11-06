import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Termos e privacidade · Bolsa Fácil",
};

export default function TermosPage() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="text-3xl font-black tracking-tight text-slate-900">Termos e privacidade</h1>
      <div className="mt-6 space-y-5 text-sm leading-relaxed text-slate-600">
        <section>
          <h2 className="text-base font-bold text-slate-900">Conteúdo educativo</h2>
          <p className="mt-1">
            O Bolsa Fácil é um projeto escolar da Feira das Profissões Florestan 2026. Todo o conteúdo
            tem finalidade educativa e não constitui recomendação, oferta ou solicitação de compra e
            venda de valores mobiliários.
          </p>
        </section>
        <section>
          <h2 className="text-base font-bold text-slate-900">Dados de mercado</h2>
          <p className="mt-1">
            As cotações podem vir da brapi.dev e os indicadores do Banco Central do Brasil. Sem
            credenciais configuradas, o sistema exibe dados de demonstração. Podem existir atrasos,
            falhas ou imprecisões nas fontes externas.
          </p>
        </section>
        <section>
          <h2 className="text-base font-bold text-slate-900">Inteligência artificial</h2>
          <p className="mt-1">
            As respostas do curador são geradas por modelos de linguagem e podem conter erros.
            Sempre confirme informações em fontes oficiais e procure um profissional certificado.
          </p>
        </section>
        <section>
          <h2 className="text-base font-bold text-slate-900">Privacidade</h2>
          <p className="mt-1">
            O projeto não exige cadastro. As perguntas enviadas ao curador são processadas pelo
            provedor de IA escolhido apenas para gerar a resposta. Não envie dados pessoais,
            senhas ou informações sensíveis no chat.
          </p>
        </section>
        <section>
          <h2 className="text-base font-bold text-slate-900">Contato</h2>
          <p className="mt-1">
            Projeto desenvolvido pelos alunos do 2º ano do curso técnico em Desenvolvimento de
            Sistemas, em colaboração com o 1º ano de Marketing Digital.
          </p>
        </section>
      </div>
    </main>
  );
}
