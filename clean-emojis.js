const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const scaffoldPath = path.join(__dirname, 'scaffold.js');

if (!fs.existsSync(scaffoldPath)) {
  console.error('scaffold.js not found!');
  process.exit(1);
}

let code = fs.readFileSync(scaffoldPath, 'utf-8');

// List of emoji replacements for tool headings & labels
const replacements = [
  { from: '⚙️ Configuration', to: 'Configuration' },
  { from: '⚡ Generate Password', to: 'Generate Password' },
  { from: '🛡️ Generated Result', to: 'Generated Result' },
  { from: '⚙️ Code Settings', to: 'Code Settings' },
  { from: '🖼️ QR Preview', to: 'QR Preview' },
  { from: '📥 Download PNG', to: 'Download PNG' },
  { from: '📝 Text Workbench', to: 'Text Workbench' },
  { from: '📝 Write or Paste Text', to: 'Write or Paste Text' },
  { from: '📝 Text Input', to: 'Text Input' },
  { from: '📊 Character Metrics', to: 'Character Metrics' },
  { from: '⚙️ Raw Input JSON', to: 'Raw Input JSON' },
  { from: '✨ Format / Validate', to: 'Format &amp; Validate' },
  { from: '🗜️ Minify', to: 'Minify JSON' },
  { from: '🛡️ Output Results', to: 'Output Results' },
  { from: '⚙️ Text Input / File Drop', to: 'Text Input / File Drop' },
  { from: '🛡️ Encoded Base64 Output', to: 'Encoded Base64 Output' },
  { from: '📥 Download as Text File', to: 'Download as Text File' },
  { from: '⚙️ Encoded Base64 Input', to: 'Encoded Base64 Input' },
  { from: '🔓 Decode', to: 'Decode Base64' },
  { from: '🛡️ Decoded Output', to: 'Decoded Output' },
  { from: '📥 Download Decoded File', to: 'Download Decoded File' },
  { from: '🎨 Color Selection', to: 'Color Selection' },
  { from: '🔍 Open Screen Eyedropper', to: 'Open Screen Eyedropper' },
  { from: '📊 Color Properties', to: 'Color Properties' },
  { from: '⚙️ Body Details', to: 'Body Details' },
  { from: '📊 BMI Result', to: 'BMI Result' },
  // Under Construction visual stub replacements
  { 
    from: '<div style="font-size: 3.5rem;">🚧</div>', 
    to: '<div style="margin-bottom: 1rem;"><svg viewBox="0 0 24 24" width="64" height="64" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="color: var(--accent);"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg></div>' 
  }
];

replacements.forEach(r => {
  code = code.split(r.from).join(r.to);
});

fs.writeFileSync(scaffoldPath, code, 'utf-8');
console.log('Successfully cleaned emojis from scaffold.js. Re-running scaffolding to regenerate tools...');

try {
  const output = execSync('node scaffold.js', { encoding: 'utf-8' });
  console.log(output);
  console.log('All 150 tool index.html files regenerated without emojis!');
} catch (err) {
  console.error('Error running scaffold.js:', err.message);
}
