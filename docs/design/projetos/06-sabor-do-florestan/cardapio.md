# Cardápio — Sabor do Florestan

## Objetivo

Mostrar o cardápio completo, com preços legíveis, para o cliente escolher antes de chegar ao caixa e para a equipe conferir os itens.

## Formato

| Item | Valor |
|---|---|
| Formato sugerido | A2 (42 × 59,4 cm) no balcão ou A1 (59,4 × 84,1 cm) na parede |
| Impressão | Couché 250 g ou adesivo sobre foam board/PVC |
| Acabamento | Plastificação fosca ou papel contact |
| Local | Balcão da cantina ou parede atrás do caixa |
| Distância de leitura | 1 a 3 metros |

## Layout

```
┌──────────────────────────────────────────────┐
│  [SF]  SABOR DO FLORESTAN                    │
│  Comida boa, pagamento fácil.                │
├──────────────────────────────────────────────┤
│  SALGADOS                                     │
│  🍗 Coxinha de frango          R$ 7,00       │
│  🥟 Pastel de carne            R$ 8,00       │
│  ...                                          │
├──────────────────────────────────────────────┤
│  DOCES                                        │
│  🍰 Bolo de pote               R$ 8,00       │
│  ...                                          │
├──────────────────────────────────────────────┤
│  BEBIDAS                                      │
│  🧃 Suco natural               R$ 6,00       │
│  ...                                          │
├──────────────────────────────────────────────┤
│  COMBOS                                       │
│  🍱 Combo lanche + bebida      R$ 18,00      │
│  ...                                          │
├──────────────────────────────────────────────┤
│  PIX · CARTÃO · DINHEIRO                     │
│  Feira das Profissões Florestan 2026 · 2º A  │
└──────────────────────────────────────────────┘
```

## Conteúdo

1. Logo "SF" e nome **SABOR DO FLORESTAN**.
2. Frase "Comida boa, pagamento fácil."
3. Categorias: Salgados, Doces, Bebidas e Combos.
4. Nome, descrição curta e preço de cada item.
5. Rodapé com as formas de pagamento e a identificação da turma.
6. Aviso "Preços sujeitos a alteração" em letra pequena.

## Tipografia

| Elemento | Tamanho |
|---|---|
| Nome da cantina | 60–72 pt |
| Categorias | 28–32 pt |
| Nome do produto | 16–18 pt |
| Descrição | 10–12 pt |
| Preço | 18–22 pt |
| Rodapé | 10–12 pt |

## Cores

- Fundo creme `#FFF7ED`.
- Cabeçalho laranja `#EA580C` com texto branco.
- Títulos de categoria em laranja-escuro `#9A3412`.
- Preços em marrom `#431407` ou laranja.
- Rodapé com os três métodos: Pix verde, cartão azul, dinheiro âmbar.

## Como produzir

1. Abra `http://localhost:3105/cardapio` com o cardápio atualizado.
2. Clique em **Imprimir cardápio** e confira a prévia.
3. Se for imprimir em gráfica, recrie o layout em A2/A1 com as mesmas informações.
4. Confira os preços com a gestão do PDV antes de imprimir.
5. Plastifique para resistir ao manuseio e à gordura.

## Checklist

- [ ] Preços conferidos com o sistema
- [ ] Nomes e descrições revisados
- [ ] Categorias na ordem do cardápio
- [ ] Rodapé com Pix, cartão e dinheiro
- [ ] Data/turma no rodapé
- [ ] Impressão legível a 1 metro
- [ ] Placa plastificada e apoiada
