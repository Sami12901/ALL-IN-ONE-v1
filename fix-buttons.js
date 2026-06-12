const fs = require('fs');
const path = require('path');

const files = [
  'tools/excel-data-typing-practice/index.html',
  'tools/facebook-post-generator/index.html',
  'tools/flight-fare-calculator/index.html',
  'tools/instagram-caption-generator/index.html',
  'tools/luxury-catalog-builder/index.html',
  'tools/typing-certificate-generator/index.html',
  'tools/typing-practice/index.html',
  'tools/visa-profit-calculator/index.html'
];

files.forEach(file => {
  const filePath = path.join(__dirname, file);
  if (fs.existsSync(filePath)) {
    let content = fs.readFileSync(filePath, 'utf8');

    content = content.replace(/class="action-btn primary-btn"/g, 'class="btn btn-primary"');
    content = content.replace(/class="action-btn secondary-btn"/g, 'class="btn btn-secondary"');

    fs.writeFileSync(filePath, content);
    console.log(`Fixed buttons in ${file}`);
  }
});
