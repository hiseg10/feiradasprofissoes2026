# Cavalete do evento

## Objetivo

Receber o visitante na entrada do estande com as informações práticas: o que é a feira, quais são os cinco projetos, a programação e onde encontrar cada coisa.

## Especificação

| Item | Valor |
|---|---|
| Pôster | **80 × 150 cm (retrato)** |
| Sangria | 3 cm em todos os lados |
| Margem de segurança | 8 cm |
| Impressão | **Gráfica:** lona 440 g, couché 250 g colado em foam board/PVC ou adesivo |
| Cavalete | Madeira ou metal, altura de 1,60 m a 1,80 m, base larga |
| Local | Entrada do estande, levemente inclinado |
| Distância de leitura | 2 a 4 metros |
| Fixação | Fita dupla face, presilhas ou parafusos no cavalete |

## Layout

```
┌──────────────────────────────┐
│ FEIRA DAS PROFISSÕES 2026  ●│
│ Tecnologia que conecta      │
│ o futuro            [FLO]   │
├──────────────────────────────┤
│ BEM-VINDO!                  │
│ Conheça cinco projetos      │
│ feitos por alunos.          │
├──────────────────────────────┤
│ ● CDQ              [CÓDIGO] │
│   Economia local   [DADOS]  │
│ ● Bolsa Fácil      [CONEXÃO]│
│   Educação financeira       │
│ ● AgroSmart                 │
│   Agro e IoT                │
│ ● Florestan Conecta         │
│   Turismo e comércio        │
│ ● Story Games               │
│   Jogos narrativos          │
├──────────────────────────────┤
│ PROGRAMAÇÃO                 │
│ [hora] Abertura             │
│ [hora] Demonstrações        │
│ [hora] Quiz e perguntas     │
├──────────────────────────────┤
│ [MAPA]          [QR CODE]   │
│ Pátio (embaixo, à esquerda) │
│ Biblioteca (em cima, à dir.)│
│ Corredor de 2 m entre eles  │
│ Robótica/horta + CDQ/Story  │
├──────────────────────────────┤
│ Realização: 2º DS + 1º MD   │
└──────────────────────────────┘
```

## Conteúdo

1. **Cabeçalho**: escola **CETI Professor Florestan Fernandes**, nome do evento, ano, tema, data **05/12/2026**, horário **8h às 11h30** e local **na escola**.
2. **Boas-vindas**: duas linhas explicando a feira.
3. **Cinco projetos**: nome, uma linha e cor de cada um.
4. **Programação**: três a cinco horários (preencher).
5. **Mapa da feira**: pátio abaixo à esquerda, biblioteca acima à direita e corredor de 2 m entre eles; a robótica e a horta ficam ao lado esquerdo da porta da biblioteca, e o CDQ e o Story Games ficam dentro dela.
6. **QR code**: programação completa ou link dos projetos.
7. **Mascote Flo**: personagem no topo direito, com a assinatura “FLO · o conectado”.
8. **Elementos de tecnologia**: cards de código, dados e conexão; linhas de movimento, brilho e sombras.
9. **Rodapé**: realização, escola e redes sociais.

## Tipografia

| Elemento | Tamanho |
|---|---|
| Nome do evento | 120–140 pt |
| Tema | 100–110 pt |
| "Bem-vindo" | 44–48 pt |
| Nomes dos apps | 50–56 pt |
| Corpo e programação | 36–40 pt |
| Rodapé | 30–34 pt |

## Cores

- Fundo em gradiente de `#0B1220` a `#0F2A3A`, com pontos vetoriais e brilhos suaves.
- Faixa superior turquesa `#14B8A6`, com linha amarela `#FACC15`.
- Nomes dos apps nas cores de cada projeto.
- Programação em branco com horários em amarelo `#FACC15`.
- QR code em fundo branco.
- Cards digitais com sombra deslocada, sem filtros de desfoque.

## Elementos de tecnologia e sombras

Como o cavalete é **impresso**, as “animações” são estáticas: a sensação de movimento vem de linhas tracejadas, cards flutuantes, brilho e sombras.

- **Cards flutuantes** à direita: código (`</>`), gráfico de dados e rede de conexão. Cada card tem uma sombra deslocada e uma borda na cor do tema.
- **Sombra dos cards**: retângulo escuro deslocado, com opacidade; não usar filtros de desfoque para não rasterizar na gráfica.
- **Brilho**: círculos e formas com opacidade baixa no fundo; nada de efeito pesado.
- **Linhas de movimento**: tracejados turquesa/azul, pequenos pontos e um cursor amarelo.
- **Pílula “CONECTADO”** no topo, com ponto verde, para reforçar o tom digital.
- **Flo** aparece no topo direito, integrado ao hero.

Para uma versão animada (telão, redes sociais ou QR code), usar os mesmos elementos em SVG/HTML com animação; o arquivo de impressão permanece estático.

## Mascote Flo

- Personagem no topo direito, com **21 × 35 cm** no pôster.
- Nome e assinatura: **FLO · o conectado**.
- Pode ser usado como **roupa com máscara** (moletom + elmo de EVA) ou **standee de 1,60 m**; a recomendação é começar pela roupa + standee.
- O mascote está embutido como vetor no SVG do cavalete; o arquivo-fonte é [`../assets/mascote-flo.svg`](../assets/mascote-flo.svg).
- Conceito, materiais, custos e segurança: [`./mascote.md`](./mascote.md).

## Materiais e estabilidade

- Preferir cavalete de madeira com base larga e altura compatível com 1,5 m de pôster.
- Reforçar a fixação no topo e na base: o pôster é maior e mais pesado que o formato anterior.
- Se for ao ar livre, usar peso na base e evitar dia de vento forte.
- Não apoiar o pôster em superfície molhada.
- Deixar a base do pôster a 20 cm do chão.

## Produção

1. Fechar textos e programação.
2. Use o [mapa da feira](./mapa-feira.md) e o [SVG](../assets/mapa-feira.svg); ajuste as posições conforme a escola.
3. Conferir o mascote e os elementos digitais no [SVG do cavalete](../assets/cavalete-evento.svg).
4. Enviar para a gráfica o **PDF com sangria** `docs/design/assets/cavalete-evento-sangria.pdf` (86 × 156 cm; corte final 80 × 150 cm). O PDF já é vetorial e tem fontes incorporadas.
5. A gráfica imprime em lona, couché 250 g sobre foam board/PVC ou adesivo.
6. A escola monta no cavalete e testa a inclinação.
7. Passar um pano seco antes da abertura.

## Arquivos para a gráfica

- **Com sangria (usar este):** `docs/design/assets/cavalete-evento-sangria.pdf` — **86 × 156 cm**, com **3 cm de sangria** em cada lado. A gráfica corta para **80 × 150 cm**.
- **Referência/prova:** `docs/design/assets/cavalete-evento.pdf` — 80 × 150 cm.
- **Editável:** `docs/design/assets/cavalete-evento.svg`.
- Os PDFs são vetoriais (textos, formas, cards e mascote). Conferir a prova de cor antes de imprimir.

## Referência visual

- `docs/design/assets/cavalete-evento.svg`
- `docs/design/assets/mapa-feira.svg`
- `docs/design/assets/mascote-flo.svg`
- `docs/design/pecas/mascote.md`

## Checklist

- [ ] Dimensões 80 × 150 cm conferidas
- [ ] Nome da escola e local (na escola) conferidos
- [ ] Data 05/12/2026 e horário 8h às 11h30 confirmados
- [ ] Mapa da feira revisado com a escola
- [ ] Programação confirmada
- [ ] Cinco projetos na lista
- [ ] QR code testado
- [ ] Mascote Flo aprovado e incluído no cavalete
- [ ] Cards de código, dados e conexão com sombras conferidos
- [ ] Arquivo final em PDF com sangria enviado à gráfica
- [ ] Prova de cor aprovada (turquesa, amarelo e mascote)
- [ ] Cavalete disponível e estável
- [ ] Pôster protegido da chuva/vento
- [ ] Nomes dos alunos e professores conferidos
