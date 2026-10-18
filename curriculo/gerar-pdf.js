// Gera o PDF do currículo: node gerar-pdf.js <caminho absoluto do HTML> <saída.pdf>
const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' }).catch(() => chromium.launch());
  const p = await b.newPage();
  await p.goto('file://' + process.argv[2], { waitUntil: 'load' });
  await p.pdf({ path: process.argv[3], format: 'A4', printBackground: true, displayHeaderFooter: true,
    headerTemplate: '<span></span>',
    footerTemplate: '<div style="width:100%;text-align:center;font-size:7px;color:#8aa0b8;font-family:Carlito,sans-serif">Pedro Leite Campos · pleitecampos@gmail.com · página <span class="pageNumber"></span> de <span class="totalPages"></span></div>',
    margin: { top: '0', bottom: '14mm' } });
  await b.close();
})();
