const fs = require('fs');

const db = JSON.parse(fs.readFileSync('data/tools-db.json', 'utf8'));
const activeTools = db.filter(t => t.active);

let mdList = '';
activeTools.forEach((t, i) => {
  mdList += `${i + 1}. **${t.name}**: ${t.description}\n`;
});

let readme = fs.readFileSync('README.md', 'utf8');

const startMarker = '## Currently Active Functional Tools\n\n';
const endMarker = '\n---';

const startIndex = readme.indexOf(startMarker);
const endIndex = readme.indexOf(endMarker, startIndex);

if (startIndex !== -1 && endIndex !== -1) {
  const before = readme.substring(0, startIndex + startMarker.length);
  const after = readme.substring(endIndex);
  const newReadme = before + mdList + after;
  fs.writeFileSync('README.md', newReadme);
  console.log('Successfully updated Currently Active Functional Tools in README.md.');
} else {
  console.error('Could not find markers in README.md');
}
