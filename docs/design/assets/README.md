# Assets de design

Arquivos de design e impressão. Os **SVGs** são os fontes vetoriais editáveis; os **PDFs com sangria** são os arquivos recomendados para a gráfica. Envie sempre o SVG + PDF com sangria.

## Arquivos

| Arquivo | O que é |
|---|---|
| `banner-central.svg` | Banner 250 × 110 cm, fonte vetorial com escudo, SEDUC-PI e 21ª GRE embutidos em base64 |
| `banner-central.pdf` | PDF de referência 250 × 110 cm, vetorial (textos/formas/QR) com logos raster embutidas |
| `banner-central-sangria.pdf` | PDF para a gráfica 256 × 116 cm (3 cm de sangria em cada lado; corte final 250 × 110 cm) |
| `banner-qr.svg` | QR definitivo do banner, gerado por `FeiraHub/gerar-qr-banner.js` |
| `banner-qr.png` | Prova do QR em PNG (2048 px) |
| `logos/escudo-escola.jpg` | Escudo oficial da escola (arquivo original, fundo preto) |
| `logos/escudo-escola.png` | Escudo com fundo transparente, usado no banner |
| `logos/seduc-pi.png` | Logo da Secretaria da Educação / Governo do Piauí |
| `logos/21gre-logo.jpeg` | Logo original da 21ª GRE (JPEG, fundo branco) |
| `logos/21gre-logo.png` | Logo da 21ª GRE com fundo transparente, usada no banner e no cavalete (574×106 px; verificar resolução para impressão) |
| `cavalete-evento.svg` | Mockup do pôster 100 × 155 cm do cavalete, com cards digitais e o mascote embutido |
| `cavalete-evento.pdf` | PDF de referência 100 × 155 cm, 1 página, vetorial |
| `cavalete-evento-sangria.pdf` | PDF para a gráfica 106 × 161 cm (3 cm de sangria em cada lado; corte final 100 × 155 cm), vetorial |
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

**Banner**

- **Gráfica:** `banner-central-sangria.pdf` (256 × 116 cm, com 3 cm de sangria). Corte final **250 × 110 cm**.
- **Referência/prova:** `banner-central.pdf` (250 × 110 cm).
- Enviar também o vetorial `banner-central.svg`.

**Cavalete**

- **Gráfica:** `cavalete-evento-sangria.pdf` (106 × 161 cm, com 3 cm de sangria). Corte final **100 × 155 cm**.
- **Referência/prova:** `cavalete-evento.pdf` (100 × 155 cm).
- Enviar também o vetorial `cavalete-evento.svg`.

Os PDFs são vetoriais para textos, formas e QR; as logos institucionais estão embutidas como imagens. O PDF com sangria foi gerado a partir do SVG com o fundo e a faixa superior estendidos.

## Antes de imprimir

1. Trocar os textos entre `[colchetes]`, se houver.
2. Conferir o QR real do lançador no banner e no cavalete.
3. Conferir medidas, sangria e margens.
4. Enviar à gráfica o **SVG + PDF com sangria** de cada peça.
5. Exportar em PDF CMYK quando a gráfica pedir.

## Fontes

- **Montserrat** — https://fonts.google.com/specimen/Montserrat
- **Inter** — https://fonts.google.com/specimen/Inter
- **Bebas Neue** (alternativa condensada) — https://fonts.google.com/specimen/Bebas+Neue

## Observação

O banner e o cavalete já usam o QR real do lançador (`FeiraLauncher/`), nunca um IP local. Os QR codes ainda ilustrativos em outros SVGs devem ser substituídos antes de imprimir. O QR do banner é gerado por `FeiraHub/gerar-qr-banner.js` e salvo em `banner-qr.svg`.
