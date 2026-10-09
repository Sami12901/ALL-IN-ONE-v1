// RFC 2606 Universal Mock Email Sanitizer
// Replaces all sample/mock emails across tools/ with reserved example domains (@example.com, @example.org)

const fs = require('fs');
const path = require('path');

const TOOLS_DIR = path.join(__dirname, '..', 'tools');

const ALLOWED_EMAILS = new Set([
  'mdsamiislam2006@gmail.com'
]);

const ALLOWED_DOMAINS = new Set([
  'example.com',
  'example.org',
  'example.net'
]);

let totalFilesModified = 0;
let totalEmailsReplaced = 0;

function walkDir(dir) {
  const entries = fs.readdirSync(dir);
  for (const entry of entries) {
    const fullPath = path.join(dir, entry);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      walkDir(fullPath);
    } else if (/\.(html|js|json)$/i.test(entry)) {
      sanitizeFile(fullPath);
    }
  }
}

function sanitizeFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let changed = false;

  // Regex for RFC email pattern
  // Avoid matching inside URLs like https://... or schema.org
  const emailRegex = /([a-zA-Z0-9._%+-]+)@([a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/g;

  const newContent = content.replace(emailRegex, (match, user, domain) => {
    const lowerMatch = match.toLowerCase();
    const lowerDomain = domain.toLowerCase();

    if (ALLOWED_EMAILS.has(lowerMatch)) return match;
    if (ALLOWED_DOMAINS.has(lowerDomain)) return match;

    // Check if domain ends with any allowed domain (e.g. sub.example.com)
    for (const allowed of ALLOWED_DOMAINS) {
      if (lowerDomain.endsWith('.' + allowed)) return match;
    }

    // Ignore obvious non-email false positives (e.g. npm packages @foo/bar or decorators)
    if (domain.includes('/') || domain.includes('\\')) return match;

    totalEmailsReplaced++;
    changed = true;

    if (lowerDomain.endsWith('.org') || lowerDomain.endsWith('.gov') || lowerDomain.endsWith('.edu')) {
      return `${user}@example.org`;
    }
    return `${user}@example.com`;
  });

  if (changed) {
    fs.writeFileSync(filePath, newContent, 'utf8');
    totalFilesModified++;
    console.log(`[Sanitized] ${path.relative(path.join(__dirname, '..'), filePath)}`);
  }
}

console.log('--- Scanning and sanitizing all mock emails across tools/ ---');
walkDir(TOOLS_DIR);
console.log(`--- Finished! Modified ${totalFilesModified} files, replaced ${totalEmailsReplaced} emails. ---`);
