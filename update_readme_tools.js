const fs = require('fs');

const db = JSON.parse(fs.readFileSync('data/tools-db.json', 'utf8'));
const activeTools = db.filter(t => t.active);

let mdList = '';
activeTools.forEach((t, i) => {
  mdList += `${i + 1}. **${t.name}**: ${t.description}\n`;
});

let readme = fs.readFileSync('README.md', 'utf8');

// Replace header number
readme = readme.replace(/# ALL IN ONE — \d+\+ Free Client-Side Browser Utilities/, `# ALL IN ONE — 496 Free Client-Side Browser Utilities (${activeTools.length} Active)`);

const startMarker = '## Currently Active Functional Tools';
const endMarker = '## Directory Architecture';

const startIndex = readme.indexOf(startMarker);
const endIndex = readme.indexOf(endMarker);

if (startIndex !== -1 && endIndex !== -1) {
  const before = readme.substring(0, startIndex + startMarker.length) + '\n\n';
  const after = '\n---\n\n' + readme.substring(endIndex);
  const newReadme = before + mdList + after;
  fs.writeFileSync('README.md', newReadme);
  console.log(`Successfully updated ${activeTools.length} Active Functional Tools in README.md.`);
} else {
  console.error('Could not find markers in README.md');
}
