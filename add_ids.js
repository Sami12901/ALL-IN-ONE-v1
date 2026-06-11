const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');

// Add IDs
html = html.replace(
  '<div style="font-size: 2.5rem; font-family: var(--font-display); font-weight: 800; color: var(--text-primary);">12</div>',
  '<div id="stat-travel" style="font-size: 2.5rem; font-family: var(--font-display); font-weight: 800; color: var(--text-primary);">12</div>'
);
html = html.replace(
  '<div style="font-size: 2.5rem; font-family: var(--font-display); font-weight: 800; color: var(--text-primary);">15</div>',
  '<div id="stat-ecom" style="font-size: 2.5rem; font-family: var(--font-display); font-weight: 800; color: var(--text-primary);">15</div>'
);
html = html.replace(
  '<div style="font-size: 2.5rem; font-family: var(--font-display); font-weight: 800; color: var(--text-primary);">10</div>',
  '<div id="stat-luxury" style="font-size: 2.5rem; font-family: var(--font-display); font-weight: 800; color: var(--text-primary);">10</div>'
);
html = html.replace(
  '<div style="font-size: 2.5rem; font-family: var(--font-display); font-weight: 800; color: var(--text-primary);">20</div>',
  '<div id="stat-biz" style="font-size: 2.5rem; font-family: var(--font-display); font-weight: 800; color: var(--text-primary);">20</div>'
);
html = html.replace(
  '<span style="display: inline-block; padding: 0.5rem 1rem; background: rgba(16, 185, 129, 0.1); color: #10b981; border-radius: 20px; font-weight: 600; margin-right: 1rem;">Active: 1</span>',
  '<span id="stat-active" style="display: inline-block; padding: 0.5rem 1rem; background: rgba(16, 185, 129, 0.1); color: #10b981; border-radius: 20px; font-weight: 600; margin-right: 1rem;">Active: 1</span>'
);
html = html.replace(
  '<span style="display: inline-block; padding: 0.5rem 1rem; background: rgba(99, 102, 241, 0.1); color: var(--accent); border-radius: 20px; font-weight: 600;">Coming Soon: 56</span>',
  '<span id="stat-coming" style="display: inline-block; padding: 0.5rem 1rem; background: rgba(99, 102, 241, 0.1); color: var(--accent); border-radius: 20px; font-weight: 600;">Coming Soon: 56</span>'
);

fs.writeFileSync('index.html', html);
console.log('index.html updated successfully.');
