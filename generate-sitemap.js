const fs = require('fs');
const path = require('path');

const WORKSPACE = __dirname;
const TOOLS_DB_PATH = path.join(WORKSPACE, 'data', 'tools-db.json');
const ROOT_SITEMAP_PATH = path.join(WORKSPACE, 'sitemap.xml');
const SEO_SITEMAP_DIR = path.join(WORKSPACE, 'seo');
const SEO_SITEMAP_PATH = path.join(SEO_SITEMAP_DIR, 'sitemap.xml');

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
    <priority>0.6</priority>
  </url>
  <url>
    <loc>https://sami12901.github.io/ALL-IN-ONE-v1/pages/contact.html</loc>
    <lastmod>${today}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.6</priority>
  </url>
  <url>
    <loc>https://sami12901.github.io/ALL-IN-ONE-v1/pages/privacy.html</loc>
    <lastmod>${today}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.4</priority>
  </url>
  <url>
    <loc>https://sami12901.github.io/ALL-IN-ONE-v1/pages/terms.html</loc>
    <lastmod>${today}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.4</priority>
  </url>
`;

let activeCount = 0;
let totalTools = tools.length;

tools.forEach(tool => {
  const isActive = tool.active === true;
  if (isActive) activeCount++;
  const priority = (tool.popular || isActive) ? '0.9' : '0.8';
  
  xml += `  <url>
    <loc>https://sami12901.github.io/ALL-IN-ONE-v1/tools/${tool.id}/</loc>
    <lastmod>${today}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>${priority}</priority>
  </url>
`;
});

xml += `</urlset>\n`;

// Ensure /seo directory exists
if (!fs.existsSync(SEO_SITEMAP_DIR)) {
  fs.mkdirSync(SEO_SITEMAP_DIR, { recursive: true });
}

// Write to root sitemap.xml
fs.writeFileSync(ROOT_SITEMAP_PATH, xml, 'utf-8');
console.log(`Root sitemap.xml generated successfully at ${ROOT_SITEMAP_PATH}`);

// Write to /seo/sitemap.xml
fs.writeFileSync(SEO_SITEMAP_PATH, xml, 'utf-8');
console.log(`SEO sitemap.xml generated successfully at ${SEO_SITEMAP_PATH}`);

console.log(`Total URLs indexed: ${5 + totalTools} (Homepage + 4 Core pages + ${totalTools} Tools [${activeCount} active])`);
