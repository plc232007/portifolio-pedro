# Currículo

`curriculo.html` é a fonte do PDF em `assets/docs/curriculo-pedro-leite-campos.pdf`.
Edite o HTML e gere o PDF de novo com o Chromium do Playwright:

```bash
node curriculo/gerar-pdf.js "$PWD/curriculo/curriculo.html" assets/docs/curriculo-pedro-leite-campos.pdf
```

A fonte é Carlito (TrueType, mesma métrica da Calibri). TrueType mantém o texto extraível para sistemas de triagem (ATS).
