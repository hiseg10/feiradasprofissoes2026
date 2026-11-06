# Banner central da feira

## Objetivo

Ser a primeira leitura do visitante: identificar o evento, entender o tema e enxergar os cinco projetos de longe.

## Especificação

| Item | Valor |
|---|---|
| Formato final | **250 × 110 cm (horizontal)** |
| Sangria | 3 cm em todos os lados |
| Margem de segurança | 8 cm |
| Material | Lona 440 g/m², impressão digital |
| Acabamento | Ilhós a cada 50 cm; bastão superior e inferior |
| Local | Fundo do estande ou parede de entrada |
| Distância de leitura | 2 a 6 metros |

## Layout

```
┌──────────────────────────────────────────────────────────────────────┐
│ [ESCUDO] CETI PROFESSOR FLORESTAN FERNANDES  [LOGO SEDUC-PI]        │
│          FEIRA DAS PROFISSÕES                                        │
│                                                                      │
│  TECNOLOGIA QUE CONECTA O FUTURO                                     │
│  Cinco projetos. Um bairro. Muitas possibilidades.                   │
│                                                                      │
│  [CDQ]   [BOLSA FÁCIL]  [AGROSMART]  [FLORESTAN]  [STORY GAMES]     │
│  Economia Educação       Agro e IoT   Turismo e     Jogos            │
│  local    financeira                  comércio      narrativos       │
│                                                                      │
│  05/12/2026 · 08h às 11h30 · NA ESCOLA        [QR CODE]             │
└──────────────────────────────────────────────────────────────────────┘
```

Os cinco cartões têm **44 cm de largura**, **23 cm de altura** e **5 cm de espaço** entre eles. As margens laterais são de **5 cm**.

## Hierarquia e tamanhos

| Elemento | Altura aproximada | Observação |
|---|---|---|
| Assinatura do evento | 3,5 cm | Caixa alta, branco |
| "FEIRA DAS PROFISSÕES" | 8,4 cm | Montserrat ExtraBold; tema em destaque, "PROFISSÕES" em amarelo |
| Headline "TECNOLOGIA QUE CONECTA O FUTURO" | 10,8 cm | Uma linha |
| Subhead | 3,5 cm | Cinza-azulado `#CBD5E1` |
| Nomes dos apps | 2,8 a 3,6 cm | Dentro dos cinco cartões |
| Data/local | 3 cm | Amarelo ou branco |
| Escudo da escola | 12 × 12 cm | Topo esquerdo, ao lado do nome da escola |
| Logo SEDUC-PI | 49 × 17 cm | Painel branco translúcido no topo direito, cantos arredondados |
| QR code | 14 × 14 cm | Canto inferior direito |

## Cores

- Fundo: gradiente de `#0B1220` para `#0F2A3A`.
- Turquesa `#14B8A6`: linhas, ícones e a palavra "FUTURO".
- Amarelo `#FACC15`: a palavra "PROFISSÕES", data, local e QR code.
- Cartões dos apps: fundo branco a 8% de opacidade, borda na cor de cada app.
- Painel da SEDUC-PI: branco a 45% de opacidade, cantos bem arredondados, para integrar ao fundo sem competir com o tema.
- Texto: branco; apoio em `#CBD5E1`.

## Conteúdo obrigatório

1. **Escudo oficial da escola**, no topo esquerdo.
2. Nome da escola: **CETI Professor Florestan Fernandes**.
3. "FEIRA DAS PROFISSÕES" como tema em destaque.
4. Headline do tema.
5. Subhead com a ideia dos cinco projetos.
6. Nome e uma linha de cada um dos cinco apps.
7. Data: **05/12/2026**, das **8h às 11h30**; local: **na escola — CETI Professor Florestan Fernandes**.
8. QR code para a URL fixa do lançador (`https://feira-florestan.pages.dev/`), que reúne os seis projetos. Não usar IP local.
9. **Logo da SEDUC-PI**, no topo direito, em painel branco translúcido.
10. Realização: "2º ano de Desenvolvimento de Sistemas + 1º ano de Marketing Digital".

## Logos institucionais

| Logo | Arquivo | Posição | Cuidado |
|---|---|---|---|
| Escudo da escola | `logos/escudo-escola.png` | Topo esquerdo, 12 × 12 cm | Versão com fundo transparente gerada a partir de `escudo-escola.jpg`. Se for usar o JPG original, aplique `mix-blend-mode: screen` para o preto sumir no fundo escuro. |
| SEDUC-PI | `logos/seduc-pi.png` | Topo direito, painel branco translúcido de 49 × 17 cm com cantos arredondados | Preservar a proporção 1720 × 577. O fundo transparente do arquivo deixa o painel aparecer; manter contraste suficiente para leitura. |

Não distorcer, não recortar e não alterar as cores das logos oficiais.

As duas logos já estão **embutidas em base64** no arquivo `banner-central.svg`. Ele é autossuficiente para impressão: não é necessário manter a pasta `logos/` ao lado do SVG. A pasta guarda os arquivos originais para edição.

## Produção

1. Fechar os textos e revisar acentuação.
2. Confirmar a URL fixa do lançador e gerar o QR com `cd FeiraHub; npm run qr -- https://feira-florestan.pages.dev/`.
3. Substituir o QR ilustrativo do banner pelo QR gerado e decodificá-lo com o celular.
4. Substituir os arquivos em `assets/logos/` pelas versões oficiais mais recentes, se necessário.
5. Exportar em PDF com fontes incorporadas (ou curvas) e imagens embutidas.
6. Enviar para a gráfica com 3 cm de sangria.
7. Conferir a prova de cor (principalmente o amarelo, o turquesa e as logos).
8. Pedir ilhós e bastão.
9. Testar a leitura do QR code impresso antes da montagem.
10. Não alterar a URL depois de enviar o banner para a gráfica.

## Erros a evitar

- Texto pequeno demais para 2 a 6 metros.
- Muitas cores brilhantes competindo.
- Colocar QR code sem instrução.
- Usar IP local ou URL temporária no QR.
- Trocar a URL depois de imprimir o banner.
- Não esquecer o nome da escola e o local (na escola) no banner.
- Usar imagens de baixa resolução.

## Referência visual

- `docs/design/assets/banner-central.svg`

## Checklist

- [ ] Dimensões 250 × 110 cm conferidas
- [ ] Escudo da escola aplicado no topo esquerdo
- [ ] Logo da SEDUC-PI aplicada no topo direito
- [ ] Logos sem distorção e com boa resolução
- [ ] Textos aprovados por DS + Marketing
- [ ] Nome da escola e local (na escola) conferidos
- [ ] Data 05/12/2026, das 8h às 11h30, confirmada
- [ ] QR aponta para a URL fixa do lançador, decodificado e testado impresso
- [ ] Sangria e margem conferidas
- [ ] Prova de cor aprovada
- [ ] Ilhós e bastão encomendados
- [ ] Plano B para pendurar (fita, corda, suporte)
