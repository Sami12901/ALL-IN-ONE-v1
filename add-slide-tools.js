const fs = require('fs');
const path = require('path');

const dbPath = path.join(__dirname, 'data', 'tools-db.json');
let db = JSON.parse(fs.readFileSync(dbPath, 'utf8'));

const newTools = [
  // Main Tools
  { name: 'Presentation Builder Pro', desc: 'Create, edit, and export professional presentations to PPTX and PDF.' },
  { name: 'Blank Presentation Creator', desc: 'Start from scratch with text, images, charts, and shapes.' },
  { name: 'Business Presentation Suite', desc: 'Create Company Profiles, Business Proposals, and Sales Reports.' },
  { name: 'Travel Agency Presentation Maker', desc: 'Design Tour Packages, Visa Services, and Travel Proposals.' },
  { name: 'E-commerce Presentation Maker', desc: 'Create engaging Product, Sales, and Marketing presentations.' },
  
  // Design Tools
  { name: 'Theme Generator', desc: 'Generate Light, Dark, Corporate, Luxury, and Travel themes.' },
  { name: 'Color Palette Generator', desc: 'Extract and apply brand colors to your slides.' },
  { name: 'Font Manager', desc: 'Manage Google Fonts, Business, and Luxury typography.' },
  
  // Charts & Media
  { name: 'Chart Builder (Slides)', desc: 'Generate Bar, Pie, Line, and Area charts directly in your slides.' },
  { name: 'Dashboard Slides', desc: 'Create Revenue, Sales, and Business KPI dashboard slides.' },
  { name: 'Image Manager', desc: 'Insert, crop, and compress images directly inside presentations.' },
  { name: 'Video Slides', desc: 'Embed videos and YouTube links into your presentations.' },
  { name: 'Icon Library', desc: 'Access hundreds of Business, Travel, and Marketing icons.' },
  
  // Document Conversion
  { name: 'Convert to Slides', desc: 'Convert Excel, CSV, PDF, and Text files directly into PPT slides.' },
  { name: 'Export to PPTX & PDF', desc: 'Export your presentation to PPTX, PDF, Images, or HTML.' },
  
  // Industry Specific
  { name: 'Travel Proposal Builder', desc: 'Create beautiful Client, Tour, and Visa proposals.' },
  { name: 'Umrah & Hajj Deck Builder', desc: 'Design detailed Umrah and Hajj package presentations.' },
  { name: 'Hotel Presentation Builder', desc: 'Showcase Hotel and Resort packages beautifully.' },
  { name: 'Product Catalog Presentation', desc: 'Display e-commerce products, pricing, and features.' },
  { name: 'Sales Deck Builder', desc: 'Create Monthly Sales and Growth Report presentations.' },
  { name: 'Brand Presentation Builder', desc: 'Showcase Brand Stories, Luxury Products, and Brand Guidelines.' },
  { name: 'Investor Pitch Deck Builder', desc: 'Design professional Company Overviews, Revenue, and Growth analysis.' },
  
  // Ready-Made Templates
  { name: 'Ready-Made Slide Templates', desc: 'Access Business, Marketing, Travel, and Education templates.' },
  
  // Premium Features
  { name: 'Presentation Analytics', desc: 'Analyze slide count, reading time, and content depth.' },
  { name: 'Smart Slide Generator', desc: 'Auto-generate layout, design, and charts intelligently.' },
  
  // Coming Soon AI
  { name: 'AI Presentation Builder', desc: 'Generate entire presentations from a simple text prompt.' },
  { name: 'AI Pitch Deck Generator', desc: 'Let AI design high-converting startup pitch decks.' },
  { name: 'AI Slide Designer', desc: 'AI-assisted design suggestions for beautiful slides.' },
  { name: 'AI Speaker Notes', desc: 'Automatically generate speaker notes for your presentations.' },
  { name: 'AI Presentation Summary', desc: 'Summarize long presentations into a few key slides.' },
  { name: 'AI Brand Deck Generator', desc: 'Generate a complete brand guidelines deck with AI.' },
  { name: 'AI Travel Proposal Generator', desc: 'Generate travel proposals instantly using AI.' },
  { name: 'AI Marketing Deck Generator', desc: 'Auto-generate digital marketing reports using AI.' }
];

// Add if not exist
newTools.forEach(nt => {
  const id = nt.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  if (!db.find(t => t.id === id)) {
    db.push({
      id: id,
      name: nt.name,
      description: nt.desc,
      category: 'slide',
      active: false,
      tags: ['slide', 'presentation', 'pitch', 'deck', id.replace(/-/g, ' ')]
    });
  }
});

fs.writeFileSync(dbPath, JSON.stringify(db, null, 2));
console.log('Added Slide Deck tools to database.');
