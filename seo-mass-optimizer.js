const fs = require('fs');
const path = require('path');

const WORKSPACE = __dirname;
const TOOLS_DB_PATH = path.join(WORKSPACE, 'data', 'tools-db.json');
const TOOLS_DIR = path.join(WORKSPACE, 'tools');

if (!fs.existsSync(TOOLS_DB_PATH)) {
  console.error('tools-db.json not found!');
  process.exit(1);
}

const toolsDb = JSON.parse(fs.readFileSync(TOOLS_DB_PATH, 'utf-8'));
const toolsById = new Map();
toolsDb.forEach(t => toolsById.set(t.id, t));

const toolDirs = fs.readdirSync(TOOLS_DIR);

const categoryMap = {
  excel: 'BusinessApplication',
  business: 'BusinessApplication',
  finance: 'FinanceApplication',
  luxury: 'BusinessApplication',
  travel: 'TravelUtility',
  text: 'UtilityApplication',
  converter: 'UtilityApplication',
  developer: 'DeveloperApplication',
  math: 'EducationalApplication',
  design: 'DesignApplication',
  image: 'MultimediaApplication',
  audio: 'AudioApplication',
  video: 'MultimediaApplication',
  seo: 'SEOApplication',
  social: 'SocialNetworkingApplication',
  security: 'SecurityApplication',
  analytics: 'AnalyticsPage',
  music: 'MusicApplication',
  productivity: 'ProductivityTool'
};

function escapeHtml(str) {
  if (!str) return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

function cleanText(str) {
  if (!str) return '';
  return str.replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .trim();
}

let stats = {
  totalProcessed: 0,
  titlesUpdated: 0,
  descriptionsUpdated: 0,
  keywordsInjected: 0,
  canonicalsInjectedOrUpdated: 0,
  ogCardsInjected: 0,
  schemasInjected: 0,
  schemasUpdated: 0
};

toolDirs.forEach(toolId => {
  const indexPath = path.join(TOOLS_DIR, toolId, 'index.html');
  if (!fs.existsSync(indexPath)) return;

  let html = fs.readFileSync(indexPath, 'utf-8');
  const toolData = toolsById.get(toolId) || {};
  const toolName = toolData.name || toolId.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
  const appCategory = categoryMap[toolData.category] || 'UtilityApplication';
  const canonicalUrl = `https://sami12901.github.io/ALL-IN-ONE-v1/tools/${toolId}/`;
  const defaultIconUrl = 'https://sami12901.github.io/ALL-IN-ONE-v1/assets/icons/icon-512.png';

  // 1. Extract or determine Title
  const titleMatch = html.match(/<title>([^<]*)<\/title>/i);
  let currentTitle = titleMatch ? cleanText(titleMatch[1]) : '';
  let finalTitle = currentTitle;

  if (!finalTitle) {
    finalTitle = `${toolName} - Free Online Tool - ALL IN ONE`;
    stats.titlesUpdated++;
  } else if (!finalTitle.endsWith('ALL IN ONE')) {
    finalTitle = `${finalTitle} - ALL IN ONE`;
    stats.titlesUpdated++;
  } else if (finalTitle === `${toolName} - ALL IN ONE`) {
    finalTitle = `${toolName} - Free Online Tool - ALL IN ONE`;
    stats.titlesUpdated++;
  }

  // 2. Extract or determine Description
  const descMatch = html.match(/<meta\s+name=["']description["']\s+content=["']([^"']*)["']/i);
  let currentDesc = descMatch ? cleanText(descMatch[1]) : '';
  let finalDesc = currentDesc;

  if (!finalDesc || finalDesc.length < 38) {
    const baseDesc = toolData.description || `Instant client-side ${toolName.toLowerCase()} utility.`;
    finalDesc = `Free online ${toolName}. ${baseDesc.trim()} Fast, private, and client-side with zero server tracking.`;
    stats.descriptionsUpdated++;
  }

  // 3. Extract or determine Keywords
  const keywordsMatch = html.match(/<meta\s+name=["']keywords["']\s+content=["']([^"']*)["']/i);
  let finalKeywords = keywordsMatch ? cleanText(keywordsMatch[1]) : '';

  if (!finalKeywords) {
    const tags = toolData.tags || [];
    const baseTags = [
      ...tags,
      toolName.toLowerCase(),
      toolData.category,
      'free online tool',
      'client-side',
      'all in one'
    ].filter(Boolean);
    finalKeywords = [...new Set(baseTags.map(t => t.toLowerCase().trim()))].join(', ');
    stats.keywordsInjected++;
  }

  // 4. Update the Head metadata block
  // Locate the segment between <head> and the first <link rel="stylesheet"
  const headOpenIdx = html.indexOf('<head>');
  const firstStyleIdx = html.indexOf('<link rel="stylesheet"');

  if (headOpenIdx !== -1 && firstStyleIdx !== -1 && firstStyleIdx > headOpenIdx) {
    const metaBlock = `  <meta charset="UTF-8">\n` +
      `  <meta name="viewport" content="width=device-width, initial-scale=1.0">\n` +
      `  <title>${escapeHtml(finalTitle)}</title>\n` +
      `  <meta name="description" content="${escapeHtml(finalDesc)}">\n` +
      `  <meta name="keywords" content="${escapeHtml(finalKeywords)}">\n` +
      `  <meta name="robots" content="index, follow">\n` +
      `  <link rel="canonical" href="${canonicalUrl}">\n\n` +
      `  <!-- Open Graph / Facebook -->\n` +
      `  <meta property="og:type" content="website">\n` +
      `  <meta property="og:site_name" content="ALL IN ONE">\n` +
      `  <meta property="og:url" content="${canonicalUrl}">\n` +
      `  <meta property="og:title" content="${escapeHtml(finalTitle)}">\n` +
      `  <meta property="og:description" content="${escapeHtml(finalDesc)}">\n` +
      `  <meta property="og:image" content="${defaultIconUrl}">\n` +
      `  <meta property="og:image:secure_url" content="${defaultIconUrl}">\n` +
      `  <meta property="og:image:width" content="512">\n` +
      `  <meta property="og:image:height" content="512">\n` +
      `  <meta property="og:image:alt" content="${escapeHtml(toolName)} - ALL IN ONE">\n` +
      `  <meta property="og:locale" content="en_US">\n\n` +
      `  <!-- Twitter Card -->\n` +
      `  <meta name="twitter:card" content="summary_large_image">\n` +
      `  <meta name="twitter:url" content="${canonicalUrl}">\n` +
      `  <meta name="twitter:title" content="${escapeHtml(finalTitle)}">\n` +
      `  <meta name="twitter:description" content="${escapeHtml(finalDesc)}">\n` +
      `  <meta name="twitter:image" content="${defaultIconUrl}">\n` +
      `  <meta name="twitter:image:alt" content="${escapeHtml(toolName)} - ALL IN ONE">\n\n  `;

    html = html.substring(0, headOpenIdx + 6) + '\n' + metaBlock + html.substring(firstStyleIdx);
    stats.ogCardsInjected++;
    stats.canonicalsInjectedOrUpdated++;
  } else {
    console.warn(`Could not find standard head/link boundaries in: ${toolId}`);
  }

  // 5. Check and update or inject JSON-LD Structured Data
  const schemaRegex = /<script\s+type=["']application\/ld\+json["']>([\s\S]*?)<\/script>/i;
  const existingSchemaMatch = html.match(schemaRegex);

  const newSchemaObject = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    "name": toolName,
    "url": canonicalUrl,
    "description": finalDesc,
    "applicationCategory": appCategory,
    "operatingSystem": "All",
    "browserRequirements": "Requires JavaScript. Requires HTML5."
  };

  const formattedSchema = `  <!-- Structured schema for search engine rich snippets -->\n  <script type="application/ld+json">\n  ${JSON.stringify(newSchemaObject, null, 2).replace(/\n/g, '\n  ')}\n  </script>`;

  if (!existingSchemaMatch) {
    // Inject right before </body>
    const bodyCloseIdx = html.lastIndexOf('</body>');
    if (bodyCloseIdx !== -1) {
      html = html.substring(0, bodyCloseIdx) + formattedSchema + '\n' + html.substring(bodyCloseIdx);
      stats.schemasInjected++;
    } else {
      console.warn(`Could not find </body> in: ${toolId}`);
    }
  } else {
    // Check if existing schema is valid and has proper description
    try {
      const existingData = JSON.parse(existingSchemaMatch[1].trim());
      if (!existingData.description || existingData.description.length < 20 || existingData.url !== canonicalUrl) {
        html = html.replace(schemaRegex, () => formattedSchema);
        stats.schemasUpdated++;
      }
    } catch (e) {
      html = html.replace(schemaRegex, () => formattedSchema);
      stats.schemasUpdated++;
    }
  }

  fs.writeFileSync(indexPath, html, 'utf-8');
  stats.totalProcessed++;
});

console.log('=== SEO Mass Optimizer Summary ===');
console.log(JSON.stringify(stats, null, 2));
