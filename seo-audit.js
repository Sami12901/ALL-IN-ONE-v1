const fs = require('fs');
const path = require('path');

const toolsDb = JSON.parse(fs.readFileSync('data/tools-db.json', 'utf8'));
const toolDirs = fs.readdirSync('tools');

let withSchema = 0;
let withOg = 0;
let withTwitter = 0;
let withCanonical = 0;
let withDescription = 0;
let withKeywords = 0;
let withRobots = 0;
let missingFiles = [];

let missingCanonical = [];
let missingSchema = [];
let invalidSchema = [];
let shortSchema = [];
let shortDesc = [];
let mismatchedUrls = [];
let appCategories = new Set();

toolDirs.forEach(dir => {
  const p = path.join('tools', dir, 'index.html');
  if (!fs.existsSync(p)) {
    missingFiles.push(dir);
    return;
  }
  const content = fs.readFileSync(p, 'utf8');
  
  // JSON-LD Schema
  const schemaMatch = content.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/i);
  if (schemaMatch) {
    withSchema++;
    try {
      const data = JSON.parse(schemaMatch[1].trim());
      if (data.applicationCategory) appCategories.add(data.applicationCategory);
      const expectedUrl = `https://sami12901.github.io/ALL-IN-ONE-v1/tools/${dir}/`;
      if (data.url !== expectedUrl) {
        mismatchedUrls.push({ dir, actual: data.url, expectedUrl });
      }
      if (!data.description || data.description.length < 15) {
        shortSchema.push({ id: dir, desc: data.description });
      }
    } catch (e) {
      invalidSchema.push({ id: dir, err: e.message });
    }
  } else {
    missingSchema.push(dir);
  }

  // Open Graph
  if (content.includes('og:title') && content.includes('og:image') && content.includes('og:url')) {
    withOg++;
  }

  // Twitter Card
  if (content.includes('twitter:card') && content.includes('twitter:title') && content.includes('twitter:image')) {
    withTwitter++;
  }

  // Canonical
  if (content.includes('rel="canonical"') || content.includes("rel='canonical'")) {
    withCanonical++;
  } else {
    missingCanonical.push(dir);
  }

  // Robots
  if (content.includes('name="robots"')) {
    withRobots++;
  }

  // Meta Description
  const descMatch = content.match(/<meta\s+name="description"\s+content="([^"]*)"/i);
  if (descMatch) {
    withDescription++;
    if (descMatch[1].length < 35) {
      shortDesc.push({ id: dir, desc: descMatch[1], len: descMatch[1].length });
    }
  }

  // Meta Keywords
  if (content.includes('name="keywords"')) {
    withKeywords++;
  }
});

console.log('=== SEO Complete Audit Results ===');
console.log({
  totalChecked: toolDirs.length,
  missingIndexHtml: missingFiles.length,
  withSchema,
  withOg,
  withTwitter,
  withCanonical,
  withRobots,
  withDescription,
  withKeywords,
  missingCanonicalCount: missingCanonical.length,
  missingSchemaCount: missingSchema.length,
  invalidSchemaCount: invalidSchema.length,
  shortSchemaCount: shortSchema.length,
  shortDescCount: shortDesc.length,
  mismatchedUrlsCount: mismatchedUrls.length,
  appCategories: Array.from(appCategories)
});
