const fs = require('fs');
const path = require('path');

function walk(dir) {
  let files = [];
  for (const f of fs.readdirSync(dir)) {
    if (f === '.git' || f === 'node_modules' || f === 'assets') continue;
    const p = path.join(dir, f);
    if (fs.statSync(p).isDirectory()) files = files.concat(walk(p));
    else files.push(p);
  }
  return files;
}

const allFiles = walk('.');
const patterns = [
  // Heuristic patterns used by GitGuardian, TruffleHog, and GitHub Secret Scanning
  { name: 'Generic Secret/Key Assignment', regex: /(?:api_?key|secret_?key|auth_?token|access_?token|client_?secret)\s*[:=]\s*['"][a-zA-Z0-9_\-\.]{12,}['"]/i },
  { name: 'Password Assignment', regex: /(?:password|passwd|pwd)\s*[:=]\s*['"][^'"]{6,}['"]/i },
  { name: 'Non-Example Email with Credentials', regex: /[a-zA-Z0-9._%+-]+@(?!example\.(?:com|org|net)|gmail\.com|github\.io)[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/i },
  { name: 'Private Key Block', regex: /-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----/i },
  { name: 'Real-looking Bank/SWIFT details', regex: /SWIFT:\s*[A-Z]{6,8}|Account:\s*\d{4}-\d{4}-\d{4}/i }
];

const results = [];

allFiles.forEach(f => {
  if (!f.endsWith('.js') && !f.endsWith('.html') && !f.endsWith('.json')) return;
  if (f.includes('security-audit.js') || f.includes('sanitize') || f.includes('univer.bundle.js')) return;
  try {
    const content = fs.readFileSync(f, 'utf8');
    const lines = content.split('\n');
    lines.forEach((line, idx) => {
      // Exclude common safe HTML/UI strings
      if (line.includes('type="password"') || line.includes("type='password'")) return;
      if (line.includes('Password Generator') || line.includes('placeholder="Enter password"')) return;
      if (line.includes('mdsamiislam2006@gmail.com')) return; // Author email

      for (const p of patterns) {
        if (p.regex.test(line)) {
          results.push({
            file: f.replace(/\\/g, '/'),
            line: idx + 1,
            rule: p.name,
            content: line.trim()
          });
          break;
        }
      }
    });
  } catch (err) {}
});

console.log('Total Security Scanner findings:', results.length);
results.forEach(r => {
  console.log(`[${r.rule}] ${r.file}:${r.line} -> ${r.content.slice(0, 90)}`);
});
