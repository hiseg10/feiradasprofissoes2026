# Feira das Profissões Florestan 2026

Portfólio de projetos dos alunos do **2º ano A e B do curso técnico em Desenvolvimento de Sistemas**, em colaboração com o **1º ano do curso técnico em Marketing Digital**.

**Data da feira: 05/12/2026, das 8h10 às 11h.**  
**Local: CETI Professor Florestan Fernandes (na própria escola).**

## Projetos

| # | Projeto | Tema | Pasta | Turma responsável |
|---|---|---|---|---|
| 1 | **CDQ — Classificados do Deus Quer** | Economia local / marketplace de bairro | `Projeto1-CDQ` | 2º A |
| 2 | **Bolsa Fácil** | Educação financeira e mercado de capitais | `Projeto2-BolsaFacil` | 2º A |
| 3 | **AgroSmart** | Robótica e IoT na indústria do agro | `Projeto3-AgroSmart` | 2º B |
| 4 | **Florestan Conecta** | Turismo, comércio local e acessibilidade digital | `Projeto4-FlorestanConecta` | 2º B |
| 5 | **Story Games** | Loja de jogos narrativos inspirada na Steam | `Projeto5-StoryGames` | 2º B |
| 6 | **Sabor do Florestan** | Cantina e PDV com Pix, cartão e dinheiro | `Projeto6-SaborDoFlorestan` | 2º A |

> A divisão acima é uma sugestão. Pode ser ajustada conforme o número de alunos e a afinidade de cada grupo.

## Documentação de design

- [Design da feira](docs/design/README.md) — banner central, cavalete, cortinas com letras recortadas, cartolinas, medidas, materiais e orçamento.
- [Folders por projeto](docs/design/projetos) — motivação, proposta, cortina e cartolina de cada app, incluindo o Story Games e a cantina.
- [Tarefas pendentes](docs/TAREFAS.md) — OAuth do CDQ, dados reais, hardware do AgroSmart e produção das peças.
- [Cartolinas A4 e moldes de letras](docs/design/scripts/README.md) — impressão para recortar.
- [Mascote Flo](docs/design/pecas/mascote.md) — conceito, roupa com máscara, standee de 1,60 m e produção.

## Mapa da feira

- **Pátio (abaixo à esquerda):** cavalete do evento, quiosque da comida (Sabor do Florestan), Florestan Conecta e Bolsa Fácil.
- **Biblioteca (acima à direita):** CDQ e Story Games.
- **Corredor de 2 m entre os dois:** a bancada de robótica e a horta inteligente (AgroSmart) ficam ao lado esquerdo da porta da biblioteca.

Mapa visual e instruções: [docs/design/pecas/mapa-feira.md](docs/design/pecas/mapa-feira.md).

## Papel de cada turma

### 2º ano — Desenvolvimento de Sistemas

- Modelagem de dados e regras de negócio
- Desenvolvimento front-end (Next.js, React, Tailwind)
- APIs, integrações externas e IA
- Deploy, testes e monitoramento
- Documentação técnica (README, briefing, backlog)

### 1º ano — Marketing Digital

Cada projeto de DS recebe uma **squad de marketing** responsável por:

- Briefing, personas e proposta de valor
- Identidade visual (logo, paleta, tipografia)
- Copy da landing page e roteiro do pitch
- Posts, reels e calendário de divulgação
- QR codes e materiais do estande
- Pesquisa com visitantes e métricas (Google Forms / planilha)

## Modelo de colaboração

```
2º ano (DS)                        1º ano (Marketing)
─────────────                      ──────────────────
Product Owner do projeto  ←→  Líder de campanha
Desenvolvedores           ←→  Conteúdo e copy
Design de UI              ←→  Identidade visual
Dados e IA                ←→  Pesquisa e personas
Deploy                    ←→  Divulgação e QR codes
```

**Ritual sugerido:** 1 reunião semanal de 30 min (DS apresenta o que entrou no ar; Marketing apresenta o que vai publicar). Decisões registradas em um quadro compartilhado.

## Cronograma sugerido (10 semanas)

| Fase | Semanas | Entregáveis |
|---|---|---|
| Descoberta | 1–2 | Briefing, personas, protótipo de baixa fidelidade |
| MVP | 3–6 | Telas principais, dados simulados, API funcionando |
| Integrações | 7–8 | Dados reais, IA, hardware (quando houver) |
| Polimento | 9 | Testes, acessibilidade, responsivo, deploy |
| Feira | 10 | Estande, pitch de 3 min, demonstração ao vivo |

## Critérios de avaliação

| Critério | Peso | O que observar |
|---|---|---|
| Funcionalidade | 30% | O fluxo principal funciona de ponta a ponta? |
| Clareza do problema | 20% | O projeto resolve uma dor real e explica isso bem? |
| Colaboração DS + Marketing | 20% | As duas turmas aparecem no resultado? |
| Qualidade técnica | 15% | Código organizado, sem segredos expostos, responsivo |
| Apresentação | 15% | Pitch claro, demonstração ensaiada, domínio do tema |

## Padrões técnicos comuns

- Next.js 16 (App Router) + React 19 + TypeScript
- Tailwind CSS 4
- Rotas de API no próprio Next (`src/app/api/...`)
- Chaves de API **somente no servidor** (`.env.local`, nunca no cliente)
- `npm run dev` para desenvolver, `npm run build` antes de publicar
- Cada projeto tem seu próprio `README.md` e `BRIEFING.md`

## Como rodar

```powershell
# entre na pasta do projeto
cd Projeto2-BolsaFacil
npm install
Copy-Item .env.example .env.local
npm run dev
```

Acesse `http://localhost:3000`.

### Atalhos no Windows

- `run.bat` na raiz: menu para abrir qualquer projeto ou o bridge do Arduino.
- `ProjetoX\run.bat`: instala dependências na primeira vez, cria o `.env.local` e inicia o app.
- `Projeto3-AgroSmart\run-bridge.bat`: atalho para o bridge do Arduino.
- `Projeto3-AgroSmart\firmware\bridge-serial\run-bridge.bat`: lista as portas e conecta o Arduino.
- `FeiraHub\start-hub.bat`: bootloader e gerador de QR codes na porta 4000.

Portas usadas pelo menu: **CDQ 3000**, **Bolsa Fácil 3101**, **AgroSmart 3102**, **Florestan Conecta 3103**, **Story Games 3104**, **Sabor do Florestan 3105**, **Feira Hub 4000**.

Para o Arduino, o app e o bridge precisam rodar em **janelas separadas**. Se o AgroSmart estiver na porta 3102, rode o bridge com `run-bridge.bat 3102` (o menu já faz isso na opção 6).

## Feira Hub (QR codes e bootloader)

O **[FeiraHub](FeiraHub/README.md)** é uma ferramenta local para o notebook da feira:

- detecta hostname, IPs da rede, mDNS e portas;
- mostra o status dos seis projetos;
- inicia e para os servidores pelo navegador;
- gera um **QR code individual** por projeto, com a URL da rede local;
- tem botão de impressão dos QR codes.

Rodando:

```powershell
FeiraHub\start-hub.bat
# ou escolha a opção 7 no run.bat da raiz
```

Acesse `http://localhost:4000`. Para o celular abrir os projetos, ele precisa estar na **mesma rede Wi-Fi** do notebook. Na primeira vez, libere o Node.js no firewall do Windows para redes privadas.

O hub valida o conteúdo de cada porta, então não confunde o projeto com outro serviço. Se uma porta estiver ocupada, o cartão mostra o aviso; se o projeto estiver rodando em outra porta, o QR usa a porta real.

## Regras de segurança e LGPD

- Nunca versionar `.env.local` nem chaves de API.
- Não coletar dados pessoais sem necessidade e sem aviso.
- Usar somente dados públicos das APIs de mercado.
- Deixar claro na interface que o conteúdo é **educativo** e não é recomendação de investimento.
- Pedir autorização de imagem antes de publicar fotos de pessoas no estande.
