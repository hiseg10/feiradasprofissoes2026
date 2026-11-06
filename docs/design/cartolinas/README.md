# Cartolinas A4

Cartolinas descritivas dos 5 apps, em formato **A4 recortado em 4 quadrantes** (cada cartolina fica com cerca de 95 × 138,5 mm, tamanho próximo de A6).

## Arquivos

| Arquivo | Para que serve |
|---|---|
| `dados.js` | Conteúdo de cada cartolina (nome, frase, problema, proposta, destaques, tecnologias, equipe e QR) |
| `imprimir-cartolinas.html` | Página de impressão: 4 cartolinas por folha A4 |
| `../scripts/abrir-impressao.bat` | Abre as páginas de cartolinas e de moldes de letras |

## Como imprimir

1. Abra `imprimir-cartolinas.html` no Chrome ou Edge.
2. Clique em **Imprimir cartolinas**.
3. Escolha **A4**, escala **100%** e margens padrão.
4. Ative **Gráficos de plano de fundo** para as faixas coloridas aparecerem.
5. Imprima.
6. Recorte nas linhas tracejadas: cada folha rende **4 cartolinas**.

## Dimensões

- Folha A4: 210 × 297 mm.
- Margem de impressão: 8 mm.
- Área útil: 194 × 281 mm.
- Grade: 2 × 2 quadrantes com 4 mm de espaço.
- Cada cartolina: aproximadamente 95 × 138,5 mm.

## Medida final (a confirmar)

A referência da equipe é que cada cartolina ocupe cerca de **6 folhas A4**. Isso corresponde a uma montagem de **2 colunas × 3 linhas** de A4. A página atual imprime **4 cartolinas por A4** (cada uma ~A6) para o protótipo; quando a medida for confirmada, a impressão será ajustada para a grade 2×3.

Enquanto isso, use a versão atual para testar o conteúdo ou para cartolinas menores.

## Papel sugerido

- Cartolina 250 g ou couché 250 g.
- Alternativa: papel sulfite 180 g, se for plastificar.
- Plastificação fosca para durar a feira.

## Como editar

Abra `dados.js` e altere os campos de cada app:

| Campo | Conteúdo |
|---|---|
| `nome` | Nome do app |
| `subtitulo` | Linha de apoio |
| `frase` | Frase de efeito |
| `cor` | Cor principal da faixa |
| `corTexto` | Cor do texto na faixa (`#FFFFFF` ou `#0B1220`) |
| `problema` | Duas ou três linhas |
| `proposta` | Duas ou três linhas |
| `destaques` | Três itens |
| `tecnologias` | Stack em uma linha |
| `equipe` | Nomes e turma |
| `qr` | Texto do espaço do QR; cole o QR impresso do hub |

Mantenha os textos curtos para caber no quadrante.

## Observações

- O QR code de cada app é gerado pelo **Feira Hub**. Imprima o QR e cole no espaço reservado.
- As cartolinas são dos 5 apps. A cantina usa o cardápio e a placa de pagamentos.
- A versão A2 está descrita em `../pecas/cartolina-descritiva.md`; esta pasta é a versão econômica em A4.
