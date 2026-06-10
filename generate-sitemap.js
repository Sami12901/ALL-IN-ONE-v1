const fs = require('fs');
const path = require('path');

const WORKSPACE = __dirname;
const TOOLS_DB_PATH = path.join(WORKSPACE, 'data', 'tools-db.json');
const SITEMAP_PATH = path.join(WORKSPACE, 'seo', 'sitemap.xml');

if (!fs.existsSync(TOOLS_DB_PATH)) {
  console.error('tools-db.json not found!');
  process.exit(1);
}

const tools = JSON.parse(fs.readFileSync(TOOLS_DB_PATH, 'utf-8'));
const today = new Date().toISOString().split('T')[0];

let xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <!-- Core Homepage -->
  <url>
    <loc>https://sami12901.github.io/ALL-IN-ONE-v1/</loc>
    <lastmod>${today}</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
  <!-- Core Information Pages -->
  <url>
    <loc>https://sami12901.github.io/ALL-IN-ONE-v1/pages/about.html</loc>
    <lastmod>${today}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.5</priority>
  </url>
  <url>
    <loc>https://sami12901.github.io/ALL-IN-ONE-v1/pages/contact.html</loc>
    <lastmod>${today}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.5</priority>
  </url>
  <url>
    <loc>https://sami12901.github.io/ALL-IN-ONE-v1/pages/privacy.html</loc>
    <lastmod>${today}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.3</priority>
  </url>
  <url>
    <loc>https://sami12901.github.io/ALL-IN-ONE-v1/pages/terms.html</loc>
    <lastmod>${today}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.3</priority>
  </url>
`;

tools.forEach(tool => {
  xml += `  <url>
    <loc>https://sami12901.github.io/ALL-IN-ONE-v1/tools/${tool.id}/</loc>
    <lastmod>${today}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>
`;
});

xml += `</urlset>`;

fs.writeFileSync(SITEMAP_PATH, xml, 'utf-8');
console.log('Sitemap.xml generated successfully inside /seo directory.');
