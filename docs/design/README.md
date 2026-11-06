# Design da Feira — Florestan 2026

Documentação visual e de produção do estande da feira no **CETI Professor Florestan Fernandes**.

**Data da feira: 05/12/2026, das 8h às 11h30.**  
**Local: na própria escola.**

## Conceito

**"Tecnologia que conecta o futuro."**

Cinco projetos de app nascidos do bairro e para o bairro: economia local, educação financeira, agro inteligente, turismo e uma loja de jogos narrativos. A comunicação deve parecer una (mesma família visual) e, ao mesmo tempo, dar identidade própria a cada app.

Além dos 5 apps, a cantina do 2º ano A é uma atividade de empreendedorismo com peças próprias: cardápio, placa de pagamentos e uma cortina opcional.

## Peças previstas

| Peça | Quantidade | Formato | Onde fica |
|---|---|---|---|
| Banner central | 1 | 250 × 110 cm, com escudo da escola e logo da SEDUC-PI | Fundo do estande ou entrada |
| Cavalete do evento | 1 | Pôster 80 × 150 cm | Entrada do estande |
| Mapa da feira | 1–2 | A3/A2 | Entrada, corredor e biblioteca |
| Cortina com letras recortadas | 5 (uma por app) | 200 × 180 cm | Atrás de cada mesa |
| Cartolina descritiva | 5 (uma por app) | A4 recortada em 4 quadrantes (~A6) | Em frente a cada app |
| Mascote Flo | 1 roupa + 1 standee | 1,60 m (tamanho de adolescente) | Entrada e estande |
| Moldes de letras | 5 nomes | A4, uma letra por folha, ~10 cm | Produção das cortinas |
| Folder impresso | 5 (um por app) | A4 dobrado em A5 | Para o visitante levar |
| QR codes | 6+ | 6 × 6 cm | Banner, cavalete e cartolinas |

> As 5 cortinas, 5 cartolinas e 5 folders são dos 5 apps. A cantina tem cardápio, placa de pagamentos e uma cortina opcional.

## Princípios

1. **Legibilidade a 3 metros** — títulos grandes, pouco texto e contraste alto.
2. **Hierarquia clara** — nome do evento > nome do app > detalhes.
3. **Cores com função** — cada app tem uma cor; o evento usa azul-noite, turquesa e amarelo.
4. **Consistência** — mesma tipografia, mesmas margens e mesmo estilo de QR code.
5. **Acessibilidade** — contraste mínimo AA, fontes sem serifa, não depender só de cor.
6. **Acabamento simples** — materiais fáceis de cortar, colar e transportar.

## Estrutura dos arquivos

```
docs/design/
  README.md                  este guia
  identidade-visual.md       paleta, tipografia e regras
  materiais-e-orcamento.md   lista de compras e custos
  cronograma-producao.md     datas e etapas
  checklist-montagem.md      antes, durante e depois
  pecas/
    banner-central.md        conceito e layout do banner
    cavalete-evento.md       pôster e cavalete
    mapa-feira.md            percurso pátio → corredor → biblioteca
    cortinas-letras.md       sistema das cortinas
    cartolina-descritiva.md  template das cartolinas
    mascote.md               conceito, fantasia, standee e produção do Flo
  cartolinas/
    README.md                dados e impressão A4
    dados.js                 conteúdo das 5 cartolinas
    imprimir-cartolinas.html página de impressão
  scripts/
    README.md                instruções de impressão
    letras.js                nomes dos apps
    imprimir-letras.html     moldes de letras em A4
    abrir-impressao.bat      atalho para as duas páginas
  projetos/
    01-cdq/                  motivação, proposta, cortina e cartolina
    02-bolsa-facil/
    03-agrosmart/
    04-florestan-conecta/
    05-story-games/
    06-sabor-do-florestan/
  assets/
    banner-central.svg       mockup do banner
    cavalete-evento.svg      mockup do cavalete (com o Flo embutido)
    mascote-flo.svg          desenho do mascote Flo
    mapa-feira.svg           mapa visual da feira
    cortina-template.svg     template da cortina
    cortina-cdq.svg          exemplo preenchido
    cortina-bolsa-facil.svg  exemplo preenchido
    cortina-agrosmart.svg    exemplo preenchido
    cortina-florestan-conecta.svg  exemplo preenchido
    cortina-story-games.svg  exemplo preenchido
    cartolina-template.svg   template da cartolina
    logos/                   escudo da escola e logo da SEDUC-PI
    README.md                como editar os assets
```

## Mascote Flo

O mascote da feira é o **Flo**, um robô-teen de 1,60 m, com elmo escuro, tela turquesa e moletom com emblema de conexão. Ele aparece no cavalete e pode ser produzido como **roupa com máscara** (recomendado) ou **standee**. A combinação das duas versões é a mais econômica e versátil.

- [Conceito e produção do mascote](./pecas/mascote.md)
- [Desenho vetorial](./assets/mascote-flo.svg)

## Mapa da feira

- [Mapa da feira](./pecas/mapa-feira.md) — percurso e posição de cada atividade.
- [Mapa visual](./assets/mapa-feira.svg) — referência para impressão em A3/A2.

Resumo do percurso:

- **Pátio (abaixo à esquerda):** cavalete, quiosque da comida (Sabor do Florestan), Florestan Conecta e Bolsa Fácil.
- **Biblioteca (acima à direita):** CDQ e Story Games.
- **Corredor de 2 m entre os dois:** a bancada de robótica e a horta inteligente (AgroSmart) ficam ao lado esquerdo da porta da biblioteca.

## Impressão A4

- [Cartolinas A4](./cartolinas/README.md) — 5 cartolinas com dados dos apps, 4 por folha A4.
- [Moldes de letras](./scripts/imprimir-letras.html) — letras grandes dos nomes, uma por A4, ~10 cm, para recortar em TNT.
- [Scripts de impressão](./scripts/README.md) — instruções e atalho `abrir-impressao.bat`.

## Impressão em gráfica

- [Cavalete do evento](./pecas/cavalete-evento.md) — pôster 80 × 150 cm, com cards digitais e o mascote Flo.
- PDF para a gráfica: [`assets/cavalete-evento-sangria.pdf`](./assets/cavalete-evento-sangria.pdf) — 86 × 156 cm, com 3 cm de sangria; corte final 80 × 150 cm.
- PDF de referência: [`assets/cavalete-evento.pdf`](./assets/cavalete-evento.pdf) — 80 × 150 cm.
- Os dois PDFs são vetoriais; conferir a prova de cor antes de imprimir.

## Cantina do 2º A — Sabor do Florestan

Atividade de empreendedorismo com venda de comidinhas, doces, bebidas e combos. O pagamento é feito em Pix, cartão ou dinheiro.

- [Folder da cantina](./projetos/06-sabor-do-florestan/README.md)
- [Cardápio](./projetos/06-sabor-do-florestan/cardapio.md)
- [Placa de pagamentos](./projetos/06-sabor-do-florestan/pagamentos.md)
- [Cortina opcional](./projetos/06-sabor-do-florestan/cortina.md)

O PDV, o Pix e a gestão ficam em `Projeto6-SaborDoFlorestan`.

## Regra de ouro

Nada de texto miúdo no fundo. O visitante precisa entender **o nome do app** e **o que ele resolve** em menos de 5 segundos.
