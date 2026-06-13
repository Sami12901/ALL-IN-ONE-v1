const fs = require('fs');
const path = require('path');

const dbPath = path.join(__dirname, 'data', 'tools-db.json');
let db = JSON.parse(fs.readFileSync(dbPath, 'utf8'));

const newTools = [
  // Excel / Core Analytics (category: 'excel')
  { name: 'Data Analyzer', desc: 'Analyze rows, columns, missing data, and calculate Data Quality Score.', category: 'excel' },
  { name: 'CSV Analyzer', desc: 'Deep dive into CSV files and extract business insights instantly.', category: 'excel' },
  { name: 'Excel Analyzer', desc: 'Advanced Excel file analytics with automatic data profiling.', category: 'excel' },
  { name: 'JSON Analyzer', desc: 'Visualize and analyze complex JSON data structures.', category: 'excel' },
  { name: 'TXT Analyzer', desc: 'Extract and analyze text data from raw TXT files.', category: 'excel' },
  { name: 'Dashboard Generator', desc: 'Auto-generate dashboards, KPIs, and charts (Bar, Pie, Line, Area).', category: 'excel' },
  { name: 'Data Cleaner', desc: 'Remove duplicates, empty rows, fix formatting, and normalize data.', category: 'excel' },
  { name: 'Data Profiler', desc: 'Column analysis, data types, unique values, and null value detection.', category: 'excel' },
  { name: 'Report Generator', desc: 'Generate comprehensive Business, Excel, and PDF Reports.', category: 'excel' },
  { name: 'KPI Dashboard Builder', desc: 'Build custom KPI dashboards and business metrics trackers.', category: 'excel' },
  { name: 'Forecast Calculator', desc: 'Calculate Revenue, Sales, and Expense forecasts.', category: 'excel' },
  { name: 'Trend Analyzer', desc: 'Analyze growth trends and seasonal patterns in your data.', category: 'excel' },
  { name: 'Smart Data Analytics Suite', desc: 'All-in-one suite to upload, clean, analyze, chart, and export data.', category: 'excel' },
  
  // Business Analytics (category: 'business')
  { name: 'Revenue Analytics', desc: 'Track Monthly/Yearly Revenue and Growth Rates.', category: 'business' },
  { name: 'Expense Analytics', desc: 'Categorize expenses and track spending trends.', category: 'business' },
  { name: 'Profit Analytics', desc: 'Calculate net profit based on revenue and expenses.', category: 'business' },
  { name: 'Campaign Analytics', desc: 'Analyze ad clicks, impressions, and conversions.', category: 'business' },
  { name: 'ROI Analytics', desc: 'Calculate Return on Investment from your ad spend.', category: 'business' },
  { name: 'Social Media Analytics', desc: 'Track engagement rates, reach, and audience growth.', category: 'business' },
  
  // Travel Analytics (category: 'travel')
  { name: 'Customer Analytics (Travel)', desc: 'Track total, new, and returning travel customers.', category: 'travel' },
  { name: 'Visa Analytics', desc: 'Analyze visa revenue, processing costs, and profit margins.', category: 'travel' },
  { name: 'Ticket Analytics', desc: 'Track ticket sales, commissions, and total revenue.', category: 'travel' },
  { name: 'Hajj & Umrah Analytics', desc: 'Monitor package sales, pilgrim count, and profit margins.', category: 'travel' },
  
  // E-commerce Analytics (category: 'ecommerce')
  { name: 'Product Analytics', desc: 'Identify top products, low performers, and best sellers.', category: 'ecommerce' },
  { name: 'Sales Analytics', desc: 'Track daily/monthly sales and total revenue.', category: 'ecommerce' },
  { name: 'VIP Customer Analytics', desc: 'Identify VIP clients and track repeat customer metrics.', category: 'ecommerce' },
  { name: 'Inventory Analytics', desc: 'Monitor stock levels, low stock alerts, and dead stock.', category: 'ecommerce' },
  
  // Luxury Brand Analytics (category: 'luxury')
  { name: 'Brand Performance', desc: 'Measure brand revenue, customer value, and brand growth.', category: 'luxury' },
  { name: 'VIP Client Analytics', desc: 'Track top luxury clients and their complete purchase history.', category: 'luxury' },
  
  // AI Coming Soon
  { name: 'AI Data Analyst', desc: 'Automated AI agent to analyze your data and find hidden insights.', category: 'excel' },
  { name: 'AI Business Insights', desc: 'AI-generated actionable insights for your business.', category: 'business' },
  { name: 'AI Revenue Prediction', desc: 'Predict future revenue using machine learning models.', category: 'business' },
  { name: 'AI Sales Prediction', desc: 'Forecast e-commerce sales based on historical data.', category: 'ecommerce' },
  { name: 'AI Expense Prediction', desc: 'Forecast future expenses and budget requirements.', category: 'business' },
  { name: 'AI Customer Segmentation', desc: 'Automatically group customers using AI clustering.', category: 'luxury' },
  { name: 'AI Trend Detection', desc: 'Spot emerging market trends automatically.', category: 'excel' },
  { name: 'AI KPI Generator', desc: 'Automatically suggest and track the most relevant KPIs.', category: 'excel' },
  { name: 'AI Dashboard Builder', desc: 'Generate entire BI dashboards from a text prompt.', category: 'excel' },
  { name: 'AI Report Writer', desc: 'Write professional data reports using natural language generation.', category: 'excel' }
];

// Add if not exist
newTools.forEach(nt => {
  const id = nt.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  if (!db.find(t => t.id === id)) {
    db.push({
      id: id,
      name: nt.name,
      description: nt.desc,
      category: nt.category,
      active: false,
      tags: ['analytics', 'data', nt.category, id.replace(/-/g, ' ')]
    });
  }
});

fs.writeFileSync(dbPath, JSON.stringify(db, null, 2));
console.log('Added Analytics tools to database.');
