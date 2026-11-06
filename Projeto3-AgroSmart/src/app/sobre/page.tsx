import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sobre o projeto · AgroSmart",
  description: "Hardware, arquitetura, API e plano de colaboração do AgroSmart.",
};

const COMPONENTES = [
  { item: "Arduino UNO/Nano ou ESP32", funcao: "Microcontrolador (USB ou Wi-Fi)", estimativa: "R$ 35 a R$ 60" },
  { item: "Sensor DHT22", funcao: "Temperatura e umidade do ar", estimativa: "R$ 25" },
  { item: "Sensor capacitivo de solo", funcao: "Umidade do solo", estimativa: "R$ 20" },
  { item: "LDR + resistor", funcao: "Luminosidade", estimativa: "R$ 5" },
  { item: "Módulo relé 5V", funcao: "Acionar a bomba", estimativa: "R$ 12" },
  { item: "Mini bomba d'água 5V", funcao: "Irrigação", estimativa: "R$ 20" },
  { item: "Mangueira e reservatório", funcao: "Circulação de água", estimativa: "R$ 25" },
  { item: "Fonte 5V", funcao: "Alimentação do conjunto", estimativa: "R$ 20" },
];

const LIGACOES = [
  { componente: "DHT22 (dados)", esp32: "GPIO 4", arduino: "D2" },
  { componente: "Sensor de solo", esp32: "GPIO 34", arduino: "A0" },
  { componente: "LDR", esp32: "GPIO 35", arduino: "A1" },
  { componente: "Relé da bomba", esp32: "GPIO 26", arduino: "D7" },
  { componente: "Alimentação", esp32: "5V e GND", arduino: "5V e GND" },
];

export default function SobrePage() {
  return (
    <main className="mx-auto max-w-6xl px-4 py-10">
      <header className="max-w-3xl">
        <p className="eyebrow">Sobre o projeto</p>
        <h1 className="mt-1 text-3xl font-black tracking-tight text-slate-900 sm:text-4xl">
          Robótica e IoT na indústria do agro
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-slate-600">
          O AgroSmart é uma horta inteligente de baixo custo. Sensores medem o ambiente, um
          microcontrolador envia os dados e o sistema decide quando irrigar. A IA entra como apoio
          educativo para identificar problemas nas plantas.
        </p>
      </header>

      <section className="mt-8 grid gap-4 lg:grid-cols-2">
        <div className="card p-5">
          <h2 className="text-lg font-bold text-slate-900">Lista de materiais</h2>
          <div className="mt-3 overflow-x-auto">
            <table className="w-full min-w-[380px] text-left text-xs">
              <thead className="text-slate-500">
                <tr>
                  <th className="py-1.5 font-semibold">Item</th>
                  <th className="py-1.5 font-semibold">Função</th>
                  <th className="py-1.5 text-right font-semibold">Estimativa</th>
                </tr>
              </thead>
              <tbody>
                {COMPONENTES.map((componente) => (
                  <tr key={componente.item} className="border-t border-slate-100">
                    <td className="py-1.5 font-medium text-slate-800">{componente.item}</td>
                    <td className="py-1.5 text-slate-500">{componente.funcao}</td>
                    <td className="py-1.5 text-right text-slate-600">{componente.estimativa}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-3 text-[11px] text-slate-400">
            Valores aproximados para orçamento escolar. Confirme a compatibilidade elétrica com o
            professor responsável.
          </p>
        </div>

        <div className="space-y-4">
          <div className="card p-5">
            <h2 className="text-lg font-bold text-slate-900">Ligações sugeridas</h2>
            <div className="mt-3 overflow-x-auto">
              <table className="w-full min-w-[360px] text-left text-xs">
                <thead className="text-slate-500">
                  <tr>
                    <th className="py-1.5 font-semibold">Componente</th>
                    <th className="py-1.5 text-right font-semibold">ESP32</th>
                    <th className="py-1.5 text-right font-semibold">Arduino UNO</th>
                  </tr>
                </thead>
                <tbody>
                  {LIGACOES.map((linha) => (
                    <tr key={linha.componente} className="border-t border-slate-100">
                      <td className="py-1.5 text-slate-600">{linha.componente}</td>
                      <td className="py-1.5 text-right font-semibold text-slate-800">{linha.esp32}</td>
                      <td className="py-1.5 text-right font-semibold text-slate-800">{linha.arduino}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          <div className="rounded-2xl border border-terra-200 bg-terra-50 p-5 text-xs leading-relaxed text-terra-800">
            <p className="font-bold">Segurança em primeiro lugar</p>
            <p className="mt-1">
              Use fonte adequada, proteja a eletrônica da água e peça revisão de um adulto. Nunca
              ligue a bomba diretamente no GPIO: use relé ou driver.
            </p>
          </div>
          <div className="rounded-2xl border border-brand-200 bg-brand-50 p-5 text-xs leading-relaxed text-brand-900">
            <p className="font-bold">Sem ESP32? Use o Arduino.</p>
            <p className="mt-1">
              O Arduino UNO/Nano não tem Wi-Fi. Conecte-o ao notebook por USB e rode o bridge serial
              em <code className="rounded bg-white/70 px-1">firmware/bridge-serial</code>. O bridge
              lê o JSON da porta serial e envia para a API. Instruções completas em{" "}
              <code className="rounded bg-white/70 px-1">HARDWARE.md</code>.
            </p>
          </div>
        </div>
      </section>

      <section className="mt-6 grid gap-4 lg:grid-cols-3">
        <div className="card p-5">
          <h2 className="text-sm font-bold text-slate-900">Arquitetura</h2>
          <pre className="mt-3 overflow-x-auto rounded-xl bg-slate-950 p-3 text-[11px] leading-relaxed text-slate-200">
{`ESP32 (Wi-Fi)
ou Arduino + bridge (USB)
  └─ POST /api/estufa/leituras
        │
        ▼
Next.js (servidor)
  ├─ regra de irrigação
  ├─ histórico em memória
  └─ GET /api/estufa/leituras
        │
        ▼
Painel (polling 5s)`}
          </pre>
        </div>
        <div className="card p-5">
          <h2 className="text-sm font-bold text-slate-900">Regra de irrigação</h2>
          <ul className="mt-3 space-y-1.5 text-xs leading-relaxed text-slate-600">
            <li>Solo &lt; mínimo → bomba liga</li>
            <li>Solo &gt; mínimo + 8% → bomba desliga</li>
            <li>Modo manual → obedece ao botão</li>
            <li>Temperatura &gt; limite → alerta no painel</li>
          </ul>
        </div>
        <div className="card p-5">
          <h2 className="text-sm font-bold text-slate-900">Próximos passos</h2>
          <ul className="mt-3 space-y-1.5 text-xs leading-relaxed text-slate-600">
            <li>Persistir leituras em banco (Turso ou SQLite)</li>
            <li>Enviar alertas por Telegram</li>
            <li>Adicionar câmera (ESP32-CAM ou módulo USB)</li>
            <li>Criar aplicativo para o produtor</li>
          </ul>
        </div>
      </section>

      <section className="mt-8 rounded-2xl border border-brand-200 bg-brand-50 p-6">
        <h2 className="text-lg font-bold text-brand-900">Colaboração com Marketing Digital</h2>
        <p className="mt-2 text-sm leading-relaxed text-brand-900/80">
          A squad de Marketing cuida da identidade visual, dos posts sobre agro sustentável, dos QR
          codes do estande e do roteiro do pitch. A squad de DS cuida do hardware, do painel, da API
          e da IA. A apresentação deve mostrar o ciclo completo: sensor → dados → decisão.
        </p>
        <div className="mt-4 grid gap-2 text-xs sm:grid-cols-3">
          <div className="rounded-xl bg-white/70 p-3">
            <p className="font-bold text-brand-800">Marketing</p>
            <p className="mt-1 text-brand-900/70">Identidade, conteúdo, QR codes e pesquisa</p>
          </div>
          <div className="rounded-xl bg-white/70 p-3">
            <p className="font-bold text-brand-800">DS</p>
            <p className="mt-1 text-brand-900/70">Hardware, API, painel, IA e deploy</p>
          </div>
          <div className="rounded-xl bg-white/70 p-3">
            <p className="font-bold text-brand-800">Juntos</p>
            <p className="mt-1 text-brand-900/70">Pitch de 3 min e demonstração ao vivo</p>
          </div>
        </div>
      </section>
    </main>
  );
}
