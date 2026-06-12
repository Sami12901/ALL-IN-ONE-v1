const fs = require('fs');
const html = `<!DOCTYPE html>
<html>
<head>
  <script src="https://unpkg.com/react@18.3.1/umd/react.production.min.js"></script>
  <script src="https://unpkg.com/react-dom@18.3.1/umd/react-dom.production.min.js"></script>
  <script src="https://unpkg.com/rxjs/dist/bundles/rxjs.umd.min.js"></script>
  <script src="https://unpkg.com/@univerjs/presets@0.25.0/lib/umd/index.js"></script>
  <script src="https://unpkg.com/@univerjs/preset-sheets-core@0.25.0/lib/umd/index.js"></script>
</head>
<body></body>
</html>`;
fs.writeFileSync('test.html', html);
const puppeteer = require('puppeteer');
(async () => {
  try {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.goto('file://' + __dirname + '/test.html', {waitUntil: 'networkidle0'});
    const keys = await page.evaluate(() => Object.keys(window).filter(k => k.toLowerCase().includes('univer')));
    console.log("KEYS:", keys);
    const presetsType = await page.evaluate(() => typeof window.UniverPresets);
    console.log("UniverPresets typeof:", presetsType);
    await browser.close();
  } catch(e) {
    console.log(e);
  }
})();
