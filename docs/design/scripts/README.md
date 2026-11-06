# Scripts de impressão

Páginas prontas para imprimir e recortar. Não precisam de servidor: abra os arquivos HTML no Chrome ou Edge.

## Atalho

Dê duplo clique em `abrir-impressao.bat`. Ele abre:

- `../cartolinas/imprimir-cartolinas.html` — cartolinas A4 (4 por folha);
- `imprimir-letras.html` — moldes de letras grandes dos nomes dos apps.

Se o navegador bloquear, abra os arquivos manualmente.

## Cartolinas A4

- 5 cartolinas, 4 por folha A4.
- Imprima em A4, 100%, com margens padrão.
- Ative **Gráficos de plano de fundo** para as faixas coloridas.
- Recorte nas linhas tracejadas: cada folha rende 4 cartolinas.
- Conteúdo em `../cartolinas/dados.js`.

## Moldes de letras

- Letras grandes dos nomes dos apps, para recortar em TNT.
- Escolha o nome no seletor e clique em **Imprimir**.
- Cada letra sai em uma folha A4, com a maiúscula em torno de **10 cm** (fonte de 14 cm).
- Imprima em A4, 100%, sem margens extras.
- Recorte a letra e use como molde no TNT.
- Nomes disponíveis: CDQ, Bolsa Fácil, AgroSmart, Florestan Conecta, Story Games e Sabor do Florestan.
- Dados em `letras.js`.

## Dicas

- Teste a altura com uma régua antes de cortar o TNT.
- Para letras com acento (Á), confira se o acento saiu completo na folha.
- Use papel sulfite 120 g ou 180 g para os moldes; o papel mais firme facilita o recorte.
- Guarde os moldes em um envelope por nome para reutilizar.

## Arquivos

```
scripts/
  abrir-impressao.bat
  letras.js
  imprimir-letras.html
  README.md
```
