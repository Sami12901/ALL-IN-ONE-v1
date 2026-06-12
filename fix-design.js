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

    // Fix <main>
    content = content.replace(/<main class="workspace-container">/, '<main class="tool-layout">\n    <div class="container tool-container">');
    // Fix closing </main>
    content = content.replace(/<\/main>/, '</div>\n  </main>');

    // Extract tool name from <app-breadcrumb> to generate <div class="tool-header">
    const breadcrumbMatch = content.match(/<app-breadcrumb tool-name="(.*?)"><\/app-breadcrumb>/);
    if (breadcrumbMatch) {
      const toolName = breadcrumbMatch[1];
      const replacement = `<app-breadcrumbs></app-breadcrumbs>
      <div class="tool-header">
        <h1>${toolName}</h1>
      </div>`;
      content = content.replace(breadcrumbMatch[0], replacement);
    }

    // Replace classes
    content = content.replace(/class="workspace-grid([^"]*)"/g, 'class="tool-workarea split-view"');
    content = content.replace(/workspace-panel/g, 'tool-panel');
    content = content.replace(/input-element/g, 'form-input');

    fs.writeFileSync(filePath, content);
    console.log(`Fixed ${file}`);
  }
});
