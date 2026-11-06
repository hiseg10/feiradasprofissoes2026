# Assets de design

Arquivos SVG de **referência visual**. Não são arquivos finais de impressão: ajuste textos, QR codes reais, data, local e nomes antes de enviar para a gráfica.

## Arquivos

| Arquivo | O que é |
|---|---|
| `banner-central.svg` | Mockup do banner 250 × 110 cm, com escudo da escola e logo da SEDUC-PI embutidos em base64 |
| `banner-qr.svg` | QR definitivo do banner, gerado por `FeiraHub/gerar-qr-banner.js` |
| `banner-qr.png` | Prova do QR em PNG (2048 px) |
| `logos/escudo-escola.jpg` | Escudo oficial da escola (arquivo original, fundo preto) |
| `logos/escudo-escola.png` | Escudo com fundo transparente, usado no banner |
| `logos/seduc-pi.png` | Logo da Secretaria da Educação / Governo do Piauí |
| `cavalete-evento.svg` | Mockup do pôster 80 × 150 cm do cavalete, com cards digitais e o mascote embutido |
| `cavalete-evento.pdf` | PDF de referência 80 × 150 cm, 1 página, vetorial |
| `cavalete-evento-sangria.pdf` | PDF para a gráfica 86 × 156 cm (3 cm de sangria em cada lado; corte final 80 × 150 cm), vetorial |
| `mascote-flo.svg` | Desenho do mascote Flo, de frente, para referência da fantasia/standee |
| `cortina-template.svg` | Template da cortina 200 × 180 cm com medidas |
| `cortina-cdq.svg` | Exemplo preenchido do CDQ |
| `cortina-bolsa-facil.svg` | Exemplo preenchido do Bolsa Fácil |
| `cortina-agrosmart.svg` | Exemplo preenchido do AgroSmart |
| `cortina-florestan-conecta.svg` | Exemplo preenchido do Florestan Conecta |
| `cortina-story-games.svg` | Exemplo preenchido do Story Games |
| `cartolina-template.svg` | Template da cartolina A2 paisagem |

## Como editar

- **Inkscape** (gratuito): abrir o SVG, editar textos e exportar PDF.
- **Figma**: importar o SVG e converter em frames editáveis.
- **Illustrator**: abrir e substituir as fontes por Montserrat e Inter.

O `cavalete-evento.svg` já tem o mascote **embutido como vetor** (o grupo `#flo` foi copiado para dentro do cavalete), então ele é autossuficiente para impressão e não perde resolução. Para trocar o mascote, edite `mascote-flo.svg` e copie novamente o grupo `#flo` para o cavalete, dentro do `transform` que posiciona o personagem. O mascote também pode ser usado separado em redes sociais e no standee.

## PDFs prontos

- **Gráfica:** use `cavalete-evento-sangria.pdf` (86 × 156 cm, com 3 cm de sangria). A gráfica corta para **80 × 150 cm**.
- **Referência/prova:** use `cavalete-evento.pdf` (80 × 150 cm).
- Os dois PDFs são **vetoriais**: textos, formas e mascote não perdem resolução. O PDF com sangria foi gerado a partir do SVG com o fundo e a faixa superior estendidos.

## Antes de imprimir

1. Trocar os textos entre `[colchetes]`.
2. Substituir o QR code de exemplo pelo QR real do lançador (`cd FeiraHub; npm run qr -- https://seu-projeto.pages.dev/`) e testar.
3. Converter textos em curvas ou incorporar as fontes.
4. Conferir medidas, sangria e margens.
5. Exportar em PDF CMYK quando a gráfica pedir.

## Fontes

- **Montserrat** — https://fonts.google.com/specimen/Montserrat
- **Inter** — https://fonts.google.com/specimen/Inter
- **Bebas Neue** (alternativa condensada) — https://fonts.google.com/specimen/Bebas+Neue

## Observação

Os QR codes desenhados nos SVGs são apenas ilustrativos. O QR definitivo do banner é gerado por `FeiraHub/gerar-qr-banner.js` e salvo em `banner-qr.svg`; ele deve apontar para a URL fixa do lançador (`FeiraLauncher/`), nunca para um IP local.
