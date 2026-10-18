# Pedro Leite Campos | Portfólio

Portfólio de Pedro Leite Campos: IA e visão computacional com Python (PyTorch, YOLO, OpenCV), com base fullstack em React/Next.js.

**No ar:** https://plc232007.github.io/portifolio-pedro/

## Decisões técnicas

- **HTML, CSS e JS sem framework nem build.** É uma página estática de conteúdo, sem estado. React ou Next.js
  aqui só trariam bundle e build sem nenhum ganho para quem lê.
- **Progressive enhancement.** Todo o conteúdo está no HTML. O JS só adiciona a revelação por scroll, o tema e a
  mesa interativa do hero. Sem JS, nada fica escondido: a classe `js-reveal` só é aplicada quando o script roda.
- **Sem dependências de terceiros em runtime**, a não ser as fontes do Google Fonts.
- **Peso:** HTML + CSS + JS + foto somam ~120 KB. As imagens são WebP com `width`/`height` explícitos para
  evitar CLS.
- **Acessibilidade:** headings em ordem (h1 → h2 → h3), `prefers-reduced-motion` respeitado e foco visível nos
  controles.

## Estrutura

```
index.html
assets/css/style.css      base: tema, layout e componentes
assets/css/enhance.css    revelação por scroll, navegação lateral, fundo
assets/css/workspace.css  mesa do hero, projetos, stack e formação
assets/js/script.js       tema, voltar ao topo, header
assets/js/interactions.js revelação por scroll, progresso, navegação lateral
assets/js/workspace.js    perspectiva da mesa e monitor com os projetos em destaque
```

## Como rodar

```bash
python3 -m http.server 8000
# http://localhost:8000
```

## Contato

- E-mail: pleitecampos@gmail.com
- GitHub: https://github.com/plc232007
- LinkedIn: https://www.linkedin.com/in/pedro-campos-1473a5345/
