const fs = require('fs');
const dbFile = 'data/tools-db.json';
const db = JSON.parse(fs.readFileSync(dbFile, 'utf8'));

const existingNames = db.map(t => t.name.toLowerCase());

const rawText = `
SEO Tools
Keyword Density Checker
Meta Tag Generator
Robots.txt Generator
Sitemap Generator
Open Graph Generator
Schema Markup Generator
SERP Preview Tool
URL Slug Generator
SEO Title Generator
SEO Description Generator

Social Media Tools
Hashtag Generator
Instagram Caption Generator
YouTube Title Generator
YouTube Description Generator
Facebook Post Generator
LinkedIn Post Formatter
Social Media Calendar Generator
Emoji Picker

Content Marketing Tools
Blog Title Generator
Blog Outline Generator
FAQ Generator
Call To Action Generator
Content Idea Generator
Headline Analyzer
Readability Checker
Grammar Checker (Basic)

Advertising Tools
ROI Calculator
CPC Calculator
CPM Calculator
CPA Calculator
Ad Budget Calculator
Campaign Profit Calculator
Marketing Funnel Calculator

Email Marketing Tools
Email Subject Line Tester
Email Template Generator
Newsletter Builder
Email Signature Generator

E-commerce Marketing Tools
Product Description Generator
Discount Calculator
Profit Margin Calculator
Sales Forecast Calculator
Pricing Calculator
Customer Lifetime Value Calculator

Analytics Tools
UTM Builder
UTM Analyzer
Traffic Calculator
Conversion Rate Calculator
Bounce Rate Calculator
Engagement Rate Calculator
`;

let currentSub = '';
const lines = rawText.split('\n').map(l => l.trim()).filter(l => l.length > 0);

lines.forEach(line => {
  if (line.endsWith('Tools') && !line.includes('Generator') && !line.includes('Calculator')) {
    currentSub = line;
  } else {
    // It's a tool
    if (!existingNames.includes(line.toLowerCase())) {
      let category = 'digital-marketing';
      if (currentSub === 'SEO Tools') category = 'seo';
      
      const id = line.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
      
      db.push({
        id: id,
        name: line,
        description: `Create, analyze, and manage your ${line} online.`,
        category: category,
        tags: ["marketing", "digital", currentSub.split(' ')[0].toLowerCase()],
        active: false
      });
    }
  }
});

fs.writeFileSync(dbFile, JSON.stringify(db, null, 2));
console.log('Added new tools.');
