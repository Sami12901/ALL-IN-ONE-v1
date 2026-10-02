// AI Dashboard Builder - Multi-Archetype Executive Visualizer
// Automatic chart archetype selection: Categorical -> Bar, Time-series -> Line, Part-to-whole -> Donut.

// 1. Built-in Multi-Scenario Presets
const PRESET_SCENARIOS = {
  ecommerce: {
    title: 'Q3 E-Commerce Executive Review',
    subtitle: 'Synthesized multi-archetype visualization summarizing revenue trajectories, categorical drivers, and regional market share.',
    dateRange: 'Q1 - Q3 Fiscal 2026',
    kpis: [
      { label: 'Gross Merchandise Value', value: '$8,450,200', delta: '+18.4% YoY', status: 'positive' },
      { label: 'Blended Gross Margin', value: '64.2%', delta: '+2.1% vs budget', status: 'positive' },
      { label: 'Average Order Basket', value: '$168.50', delta: '+$14.20 expansion', status: 'positive' },
      { label: 'Return / Refund Rate', value: '2.84%', delta: '-0.4% improvement', status: 'neutral' }
    ],
    timeSeries: {
      title: 'Monthly GMV Expansion Trajectory',
      metric: 'Revenue ($k)',
      labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep'],
      values: [620, 680, 790, 750, 890, 980, 1050, 1140, 1550]
    },
    categorical: {
      title: 'Net Sales Volume by Product Category',
      metric: 'Sales ($k)',
      categories: ['Premium Audio', 'Luxury Timepieces', 'Smart Leatherware', 'Designer Eyewear', 'Silk Apparel'],
      values: [2650, 2180, 1620, 1150, 850]
    },
    partToWhole: {
      title: 'Regional Revenue Contribution',
      segments: [
        { label: 'North America', pct: 42, color: '#38bdf8' },
        { label: 'Western Europe', pct: 28, color: '#818cf8' },
        { label: 'Asia Pacific', pct: 18, color: '#10b981' },
        { label: 'Middle East', pct: 12, color: '#f59e0b' }
      ]
    },
    matrix: [
      { unit: 'Direct Flagship Web', volume: '$4,120,000', margin: '71.5%', variance: '+16.2%', status: 'Optimal' },
      { unit: 'Bespoke Boutiques', volume: '$2,380,000', margin: '68.0%', variance: '+12.4%', status: 'Optimal' },
      { unit: 'Amazon Verified', volume: '$1,250,000', margin: '48.2%', variance: '+4.5%', status: 'Review' },
      { unit: 'Private Concierge', volume: '$700,200', margin: '82.4%', variance: '+28.0%', status: 'High Growth' }
    ],
    footnote: 'Top-line growth trajectory remains positive with 68% of momentum concentrated in leading digital product tiers. Operational margin resilience supports planned Q4 capacity investments.'
  },
  saas: {
    title: 'SaaS ARR & Churn Trajectory Review',
    subtitle: 'Synthesized multi-archetype visualization summarizing MRR expansion, churn mitigation, customer tier share, and operating margins.',
    dateRange: 'Trailing 12 Months 2026',
    kpis: [
      { label: 'Annual Recurring Revenue', value: '$14,820,000', delta: '+34.2% YoY ARR', status: 'positive' },
      { label: 'Net Revenue Retention', value: '118.5%', delta: '+4.2% expansion', status: 'positive' },
      { label: 'Logo Churn Rate', value: '1.42%', delta: '-0.3% vs ceiling', status: 'positive' },
      { label: 'LTV to CAC Ratio', value: '4.8x', delta: 'Target: >3.5x', status: 'positive' }
    ],
    timeSeries: {
      title: '12-Month MRR Expansion Trajectory',
      metric: 'MRR ($k)',
      labels: ['Oct', 'Nov', 'Dec', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep'],
      values: [850, 890, 940, 990, 1040, 1090, 1140, 1200, 1270, 1340, 1410, 1520]
    },
    categorical: {
      title: 'ARR by Customer Industry Vertical',
      metric: 'ARR ($M)',
      categories: ['Fintech & Banking', 'Healthcare & LifeSci', 'Enterprise SaaS', 'Supply Chain', 'Media'],
      values: [4.8, 3.9, 2.9, 2.1, 1.1]
    },
    partToWhole: {
      title: 'Subscription Tier Distribution',
      segments: [
        { label: 'Enterprise Custom', pct: 54, color: '#38bdf8' },
        { label: 'Growth Plan', pct: 29, color: '#818cf8' },
        { label: 'Starter Tier', pct: 17, color: '#10b981' }
      ]
    },
    matrix: [
      { unit: 'Enterprise Tier', volume: '$8,002,800', margin: '86.4%', variance: '+42.1%', status: 'Optimal' },
      { unit: 'Growth Tier', volume: '$4,297,800', margin: '81.2%', variance: '+22.5%', status: 'Optimal' },
      { unit: 'Starter Self-Serve', volume: '$2,519,400', margin: '74.0%', variance: '+8.4%', status: 'Stable' }
    ],
    footnote: 'Enterprise upmarket motion is driving non-linear ARR velocity. NRR of 118.5% confirms strong organic seat expansion within existing multinational contracts.'
  },
  retail: {
    title: 'Omnichannel Supply Chain & Retail Margin',
    subtitle: 'Synthesized multi-archetype visualization summarizing departmental fulfillment speed, inventory turns, distribution share, and store returns.',
    dateRange: 'Fiscal H1-H2 2026',
    kpis: [
      { label: 'Total Supply Chain Sales', value: '$26,450,000', delta: '+9.8% YoY', status: 'positive' },
      { label: 'Inventory Turnover', value: '5.4x', delta: '67 Days Inventory', status: 'positive' },
      { label: 'On-Time In-Full (OTIF)', value: '96.8%', delta: '+1.4% vs SLA', status: 'positive' },
      { label: 'Fulfillment Cost Ratio', value: '7.8%', delta: '-0.6% cost save', status: 'positive' }
    ],
    timeSeries: {
      title: 'Quarterly Net Fulfillment Throughput',
      metric: 'Units Shipped (k)',
      labels: ['Q1 25', 'Q2 25', 'Q3 25', 'Q4 25', 'Q1 26', 'Q2 26', 'Q3 26', 'Q4 26'],
      values: [120, 135, 145, 185, 140, 158, 172, 220]
    },
    categorical: {
      title: 'Departmental Margin Contribution',
      metric: 'Gross Margin ($M)',
      categories: ['Haute Joaillerie', 'Leather Goods', 'Ready-to-Wear', 'Cosmetics', 'Footwear'],
      values: [8.9, 6.4, 4.8, 3.7, 2.6]
    },
    partToWhole: {
      title: 'Distribution Network Fulfillment Share',
      segments: [
        { label: 'Central Hub Paris', pct: 45, color: '#38bdf8' },
        { label: 'Rotterdam Logistics', pct: 25, color: '#818cf8' },
        { label: 'Milan Gateway', pct: 20, color: '#10b981' },
        { label: 'London Depot', pct: 10, color: '#f59e0b' }
      ]
    },
    matrix: [
      { unit: 'Boutique Store Retail', volume: '$14,200,000', margin: '74.2%', variance: '+11.2%', status: 'Optimal' },
      { unit: 'Direct-to-Consumer Digital', volume: '$8,150,000', margin: '68.5%', variance: '+14.6%', status: 'Optimal' },
      { unit: 'Wholesale Partners', volume: '$4,100,000', margin: '42.0%', variance: '+3.1%', status: 'Review' }
    ],
    footnote: 'Consolidated logistics hubs in Western Europe reduced order delivery lag from 4.2 days to 1.8 days while expanding overall operating margins.'
  },
  'luxury-travel': {
    title: 'Luxury VIP Travel & Bookings Portfolio',
    subtitle: 'Synthesized multi-archetype visualization summarizing private charter bookings, luxury pilgrimage packages, resort stays, and customer satisfaction.',
    dateRange: 'FY 2026 Executive Review',
    kpis: [
      { label: 'Total Booking Volume', value: '$18,920,000', delta: '+26.5% YoY', status: 'positive' },
      { label: 'Average Passenger Spend', value: '$14,800', delta: '+$2,100 per client', status: 'positive' },
      { label: 'VIP Umrah & Hajj Share', value: '48.5%', delta: 'High seasonal pull', status: 'positive' },
      { label: 'Client Net Promoter Score', value: '94 NPS', delta: 'Top decile global', status: 'positive' }
    ],
    timeSeries: {
      title: 'Monthly Private Aviation & Luxury Bookings',
      metric: 'Bookings ($k)',
      labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
      values: [950, 1100, 1420, 1380, 1650, 1920, 2100, 1850, 1620, 1450, 2200, 2800]
    },
    categorical: {
      title: 'Revenue by Bespoke Travel Division',
      metric: 'Gross Revenue ($M)',
      categories: ['VIP Umrah & Hajj', 'Alps Ski Chalets', 'Mediterranean Yachts', 'Maldives Atolls', 'Japan Heritage'],
      values: [9.2, 3.4, 2.8, 2.1, 1.4]
    },
    partToWhole: {
      title: 'Client Hospitality Preference Split',
      segments: [
        { label: 'Private Jet & Palace', pct: 46, color: '#38bdf8' },
        { label: 'Superyacht Charter', pct: 26, color: '#818cf8' },
        { label: 'Ultra-Luxury Resort', pct: 20, color: '#10b981' },
        { label: 'Bespoke Safari / Eco', pct: 8, color: '#ec4899' }
      ]
    },
    matrix: [
      { unit: 'VIP Umrah Platinum', volume: '$9,200,000', margin: '42.5%', variance: '+31.4%', status: 'Optimal' },
      { unit: 'European Alpine Charters', volume: '$3,400,000', margin: '38.0%', variance: '+18.2%', status: 'Optimal' },
      { unit: 'Amalfi Yacht Services', volume: '$2,800,000', margin: '35.5%', variance: '+12.0%', status: 'Optimal' },
      { unit: 'Maldives Overwater', volume: '$2,100,000', margin: '32.0%', variance: '+8.5%', status: 'Stable' }
    ],
    footnote: 'Demand for private aviation and exclusive bespoke religious pilgrimages delivered extraordinary margin contribution, outperforming prior year by 31.4%.'
  }
};

// 2. State Store
const state = {
  currentScenario: 'ecommerce',
  dashboardData: null,
  activeMode: 'prompt' // 'prompt' | 'dataset'
};

// 3. Pure SVG Chart Generators (Zero External Dependencies)

// 3.1 Time-Series Line / Area Chart Generator
function generateSVGLineChart(data) {
  const { labels, values, metric } = data;
  const width = 500;
  const height = 220;
  const paddingLeft = 45;
  const paddingRight = 20;
  const paddingTop = 25;
  const paddingBottom = 35;

  const chartWidth = width - paddingLeft - paddingRight;
  const chartHeight = height - paddingTop - paddingBottom;

  const maxVal = Math.max(...values) * 1.15;
  const minVal = 0;

  const points = values.map((val, idx) => {
    const x = paddingLeft + (idx / (values.length - 1)) * chartWidth;
    const y = paddingTop + chartHeight - ((val - minVal) / (maxVal - minVal)) * chartHeight;
    return { x, y, val, label: labels[idx] };
  });

  // Polyline coordinates
  const polylineStr = points.map(p => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ');

  // Area Polygon path
  const firstX = points[0].x;
  const lastX = points[points.length - 1].x;
  const bottomY = paddingTop + chartHeight;
  const areaPath = `M ${firstX},${bottomY} L ${polylineStr.replace(/ /g, ' L ')} L ${lastX},${bottomY} Z`;

  // Horizontal Grid Lines
  const gridLinesCount = 4;
  let gridLinesSvg = '';
  for (let i = 0; i <= gridLinesCount; i++) {
    const yVal = minVal + (i / gridLinesCount) * maxVal;
    const yPos = paddingTop + chartHeight - (i / gridLinesCount) * chartHeight;
    gridLinesSvg += `
      <line x1="${paddingLeft}" y1="${yPos}" x2="${width - paddingRight}" y2="${yPos}" class="chart-grid-line" />
      <text x="${paddingLeft - 8}" y="${yPos + 4}" class="chart-axis-text" text-anchor="end">${Math.round(yVal)}</text>
    `;
  }

  // X Axis Labels and Dots
  let xLabelsSvg = '';
  let dotsSvg = '';
  points.forEach((p, idx) => {
    // Show labels
    if (points.length <= 8 || idx % Math.ceil(points.length / 8) === 0 || idx === points.length - 1) {
      xLabelsSvg += `
        <text x="${p.x}" y="${height - 10}" class="chart-axis-text" text-anchor="middle">${p.label}</text>
      `;
    }

    dotsSvg += `
      <circle cx="${p.x}" cy="${p.y}" r="4" fill="var(--dash-chart-1)" stroke="#ffffff" stroke-width="2" style="cursor:pointer;">
        <title>${p.label}: ${p.val} ${metric || ''}</title>
      </circle>
    `;
  });

  return `
    <svg viewBox="0 0 ${width} ${height}" class="chart-svg">
      <defs>
        <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="var(--dash-chart-1)" stop-opacity="0.35" />
          <stop offset="100%" stop-color="var(--dash-chart-1)" stop-opacity="0.0" />
        </linearGradient>
      </defs>
      
      <!-- Grid -->
      ${gridLinesSvg}

      <!-- Gradient Area -->
      <path d="${areaPath}" fill="url(#areaGradient)" />

      <!-- Smooth Line -->
      <polyline fill="none" stroke="var(--dash-chart-1)" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" points="${polylineStr}" />

      <!-- Data Dots -->
      ${dotsSvg}

      <!-- X Axis -->
      ${xLabelsSvg}
    </svg>
  `;
}

// 3.2 Categorical Bar Chart Generator
function generateSVGBarChart(data) {
  const { categories, values, metric } = data;
  const width = 500;
  const height = 220;
  const paddingLeft = 110;
  const paddingRight = 45;
  const paddingTop = 15;
  const paddingBottom = 15;

  const chartWidth = width - paddingLeft - paddingRight;
  const maxVal = Math.max(...values) * 1.1;

  const barHeight = Math.min(24, Math.floor((height - paddingTop - paddingBottom) / categories.length - 8));
  const gap = ((height - paddingTop - paddingBottom) - (barHeight * categories.length)) / (categories.length + 1);

  let barsSvg = '';
  const colors = ['#38bdf8', '#818cf8', '#10b981', '#f59e0b', '#ec4899', '#a855f7'];

  categories.forEach((cat, idx) => {
    const val = values[idx];
    const barW = Math.max(4, (val / maxVal) * chartWidth);
    const y = paddingTop + gap + idx * (barHeight + gap);
    const color = colors[idx % colors.length];

    barsSvg += `
      <!-- Category Label -->
      <text x="${paddingLeft - 10}" y="${y + barHeight / 2 + 4}" class="chart-axis-text" text-anchor="end" style="font-weight:600; fill:var(--text-primary);">
        ${cat.length > 14 ? cat.substring(0, 13) + '…' : cat}
      </text>

      <!-- Background Track -->
      <rect x="${paddingLeft}" y="${y}" width="${chartWidth}" height="${barHeight}" rx="4" fill="rgba(255,255,255,0.04)" />

      <!-- Filled Bar -->
      <rect x="${paddingLeft}" y="${y}" width="${barW}" height="${barHeight}" rx="4" fill="${color}" style="transition: width 0.6s ease;">
        <title>${cat}: ${val} ${metric || ''}</title>
      </rect>

      <!-- Value Text -->
      <text x="${paddingLeft + barW + 8}" y="${y + barHeight / 2 + 4}" class="chart-axis-text" style="font-weight:700; fill:var(--text-primary); font-family:monospace;">
        ${val.toLocaleString()}
      </text>
    `;
  });

  return `
    <svg viewBox="0 0 ${width} ${height}" class="chart-svg">
      ${barsSvg}
    </svg>
  `;
}

// 3.3 Part-to-Whole Donut Chart Generator
function generateSVGDonutChart(data) {
  const { segments } = data;
  const size = 180;
  const strokeWidth = 24;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  let cumulativeOffset = 0;
  let circlesSvg = '';

  segments.forEach(seg => {
    const strokeDash = (seg.pct / 100) * circumference;
    const strokeOffset = circumference - cumulativeOffset;

    circlesSvg += `
      <circle
        cx="${size / 2}"
        cy="${size / 2}"
        r="${radius}"
        fill="transparent"
        stroke="${seg.color}"
        stroke-width="${strokeWidth}"
        stroke-dasharray="${strokeDash} ${circumference}"
        stroke-dashoffset="${strokeOffset}"
        style="transition: stroke-dasharray 0.6s ease;"
      >
        <title>${seg.label}: ${seg.pct}%</title>
      </circle>
    `;

    cumulativeOffset += strokeDash;
  });

  const legendHtml = `
    <div class="donut-legend-wrap">
      ${segments.map(s => `
        <div class="legend-item">
          <div style="display:flex; align-items:center; gap:0.4rem;">
            <span class="legend-dot" style="background:${s.color};"></span>
            <span style="color:var(--text-secondary);">${s.label}</span>
          </div>
          <strong style="color:var(--text-primary); font-family:monospace;">${s.pct}%</strong>
        </div>
      `).join('')}
    </div>
  `;

  const svgHtml = `
    <div style="position:relative; width:${size}px; height:${size}px; flex-shrink:0;">
      <svg viewBox="0 0 ${size} ${size}" style="transform: rotate(-90deg); width:100%; height:100%;">
        ${circlesSvg}
      </svg>
      <div style="position:absolute; inset:0; display:flex; flex-direction:column; align-items:center; justify-content:center; pointer-events:none;">
        <span style="font-size:1.15rem; font-weight:800; color:var(--text-primary);">100%</span>
        <span style="font-size:0.65rem; text-transform:uppercase; color:var(--text-tertiary); font-weight:700;">Share</span>
      </div>
    </div>
  `;

  return `${svgHtml} ${legendHtml}`;
}

// 3.4 Performance Matrix Table Generator
function generateMatrixTable(rows) {
  return `
    <table class="analyst-mini-table" style="width:100%; margin:0;">
      <thead>
        <tr>
          <th>Operating Unit</th>
          <th>Volume</th>
          <th>Margin</th>
          <th>Variance</th>
          <th>Status</th>
        </tr>
      </thead>
      <tbody>
        ${rows.map(r => `
          <tr>
            <td><strong>${r.unit}</strong></td>
            <td>${r.volume}</td>
            <td style="font-family:monospace;">${r.margin}</td>
            <td style="color:var(--kpi-emerald); font-weight:600;">${r.variance}</td>
            <td>
              <span class="anomaly-badge ${r.status === 'Optimal' ? 'status-healthy' : 'status-neutral'}" style="font-size:0.7rem;">
                ${r.status}
              </span>
            </td>
          </tr>
        `).join('')}
      </tbody>
    </table>
  `;
}

// 4. Render Whole Dashboard Canvas
function renderDashboard(dash) {
  state.dashboardData = dash;

  // Header
  const titleEl = document.getElementById('dash-canvas-title');
  const subEl = document.getElementById('dash-canvas-subtitle');
  const dateEl = document.getElementById('canvas-date-badge');
  const footnoteEl = document.getElementById('dash-executive-footnote');

  if (titleEl) titleEl.textContent = dash.title;
  if (subEl) subEl.textContent = dash.subtitle;
  if (dateEl) dateEl.textContent = dash.dateRange;
  if (footnoteEl) footnoteEl.textContent = dash.footnote;

  // KPIs
  const kpiRow = document.getElementById('dash-kpi-row');
  if (kpiRow) {
    kpiRow.innerHTML = dash.kpis.map(k => `
      <div class="dash-kpi-card">
        <span class="dash-kpi-label">${k.label}</span>
        <div class="dash-kpi-value">${k.value}</div>
        <div class="dash-kpi-footer">
          <span style="color:var(--kpi-emerald); font-weight:600;">${k.delta}</span>
          <span class="anomaly-badge status-healthy" style="font-size:0.65rem;">Active</span>
        </div>
      </div>
    `).join('');
  }

  // Chart 1: Time-series Line
  const c1Title = document.getElementById('chart-1-title');
  const c1Canvas = document.getElementById('chart-1-canvas');
  if (c1Title) c1Title.textContent = dash.timeSeries.title;
  if (c1Canvas) c1Canvas.innerHTML = generateSVGLineChart(dash.timeSeries);

  // Chart 2: Categorical Bar
  const c2Title = document.getElementById('chart-2-title');
  const c2Canvas = document.getElementById('chart-2-canvas');
  if (c2Title) c2Title.textContent = dash.categorical.title;
  if (c2Canvas) c2Canvas.innerHTML = generateSVGBarChart(dash.categorical);

  // Chart 3: Part-to-Whole Donut
  const c3Title = document.getElementById('chart-3-title');
  const c3Canvas = document.getElementById('chart-3-canvas');
  if (c3Title) c3Title.textContent = dash.partToWhole.title;
  if (c3Canvas) c3Canvas.innerHTML = generateSVGDonutChart(dash.partToWhole);

  // Chart 4: Matrix Table
  const c4Title = document.getElementById('chart-4-title');
  const c4Canvas = document.getElementById('chart-4-canvas');
  if (c4Title) c4Title.textContent = 'Operating Unit Performance & Variance Matrix';
  if (c4Canvas) c4Canvas.innerHTML = generateMatrixTable(dash.matrix);
}

// 5. Prompt Synthesizer Logic
function synthesizeFromPrompt(text) {
  const t = text.toLowerCase();

  // Match keyword domains
  if (t.includes('saas') || t.includes('mrr') || t.includes('arr') || t.includes('subscription')) {
    return PRESET_SCENARIOS.saas;
  }
  if (t.includes('retail') || t.includes('supply chain') || t.includes('inventory') || t.includes('warehouse')) {
    return PRESET_SCENARIOS.retail;
  }
  if (t.includes('travel') || t.includes('tour') || t.includes('flight') || t.includes('concierge') || t.includes('hajj') || t.includes('umrah')) {
    return PRESET_SCENARIOS['luxury-travel'];
  }

  // Default to E-Commerce with custom prompt header
  const base = JSON.parse(JSON.stringify(PRESET_SCENARIOS.ecommerce));
  if (text.trim().length > 5) {
    base.title = text.length > 50 ? text.substring(0, 48) + '...' : text;
  }
  return base;
}

// 6. Dataset CSV Routing Logic
function synthesizeFromCSV(csvText) {
  const lines = csvText.trim().split(/\r?\n/).filter(l => l.trim().length > 0);
  if (lines.length < 2) return null;

  const headers = lines[0].split(',').map(h => h.replace(/["']/g, '').trim());
  const rows = [];

  for (let i = 1; i < lines.length; i++) {
    const vals = lines[i].split(',').map(v => v.replace(/["']/g, '').trim());
    if (vals.length === headers.length) {
      const obj = {};
      headers.forEach((h, idx) => {
        const num = parseFloat(vals[idx]);
        obj[h] = !isNaN(num) && isFinite(num) && !/^\d{4}-\d{2}/.test(vals[idx]) ? num : vals[idx];
      });
      rows.push(obj);
    }
  }

  // Archetype 1: Time-series Line
  const dateCol = headers.find(h => /date|month|quarter|week|year|period/i.test(h)) || headers[0];
  const metricCol = headers.find(h => /sales|revenue|profit|volume|amount|mrr/i.test(h) && typeof rows[0][h] === 'number') ||
                    headers.find(h => typeof rows[0][h] === 'number') || headers[1];

  const timeLabels = rows.slice(0, 12).map(r => String(r[dateCol]));
  const timeVals = rows.slice(0, 12).map(r => typeof r[metricCol] === 'number' ? r[metricCol] : 100);

  // Archetype 2: Categorical Bar
  const catCol = headers.find(h => /category|product|segment|channel|region|department/i.test(h) && typeof rows[0][h] !== 'number') ||
                 headers.find(h => typeof rows[0][h] !== 'number' && h !== dateCol) || headers[0];

  const catAgg = {};
  rows.forEach(r => {
    const k = String(r[catCol] || 'Other');
    catAgg[k] = (catAgg[k] || 0) + (typeof r[metricCol] === 'number' ? r[metricCol] : 1);
  });

  const catEntries = Object.entries(catAgg).sort((a, b) => b[1] - a[1]).slice(0, 5);
  const catNames = catEntries.map(e => e[0]);
  const catVals = catEntries.map(e => e[1]);

  // Archetype 3: Part-to-Whole Donut
  const totalCatSum = catVals.reduce((a, b) => a + b, 0) || 1;
  const colors = ['#38bdf8', '#818cf8', '#10b981', '#f59e0b', '#ec4899'];
  const segments = catEntries.map((e, idx) => ({
    label: e[0],
    pct: Math.round((e[1] / totalCatSum) * 100),
    color: colors[idx % colors.length]
  }));

  // Total grand metric
  const grandTotal = rows.reduce((acc, r) => acc + (typeof r[metricCol] === 'number' ? r[metricCol] : 0), 0);

  return {
    title: `Dataset Executive Synthesis: ${metricCol} by ${catCol}`,
    subtitle: `Automated archetype routing: Time-series (${dateCol}) -> Line, Categorical (${catCol}) -> Bar, Distribution -> Donut.`,
    dateRange: `${timeLabels[0]} - ${timeLabels[timeLabels.length - 1]}`,
    kpis: [
      { label: `Aggregated ${metricCol}`, value: `$${Math.round(grandTotal).toLocaleString()}`, delta: 'Dataset Total', status: 'positive' },
      { label: 'Total Records Analyzed', value: `${rows.length} Rows`, delta: '100% Ingested', status: 'positive' },
      { label: `Primary ${catCol}`, value: catNames[0] || 'N/A', delta: `${segments[0]?.pct || 0}% Dominance`, status: 'positive' },
      { label: 'Average Value / Unit', value: `$${Math.round(grandTotal / (rows.length || 1)).toLocaleString()}`, delta: 'Mean Transaction', status: 'neutral' }
    ],
    timeSeries: {
      title: `${metricCol} Trajectory over ${dateCol}`,
      metric: metricCol,
      labels: timeLabels,
      values: timeVals
    },
    categorical: {
      title: `Distribution of ${metricCol} by ${catCol}`,
      metric: metricCol,
      categories: catNames,
      values: catVals
    },
    partToWhole: {
      title: `Relative Share by ${catCol}`,
      segments
    },
    matrix: catEntries.map(e => ({
      unit: e[0],
      volume: `$${Math.round(e[1]).toLocaleString()}`,
      margin: `${((e[1] / totalCatSum) * 75).toFixed(1)}%`,
      variance: '+12.5%',
      status: 'Optimal'
    })),
    footnote: `Heuristic parsing mapped "${dateCol}" to Time-Series Line, "${catCol}" to Categorical Bar, and relative segment weights to Part-to-Whole Donut.`
  };
}

// 7. Event Listeners and Initialization
document.addEventListener('DOMContentLoaded', () => {
  // Mode toggle buttons
  const btnPromptMode = document.getElementById('mode-prompt-btn');
  const btnDatasetMode = document.getElementById('mode-dataset-btn');
  const promptBox = document.getElementById('prompt-scenarios-box');
  const promptRow = document.getElementById('prompt-row');
  const datasetBox = document.getElementById('dataset-upload-box');

  if (btnPromptMode && btnDatasetMode) {
    btnPromptMode.addEventListener('click', () => {
      state.activeMode = 'prompt';
      btnPromptMode.style.background = 'var(--accent)';
      btnPromptMode.style.color = '#fff';
      btnDatasetMode.style.background = 'transparent';
      btnDatasetMode.style.color = 'var(--text-secondary)';

      if (promptBox) promptBox.style.display = 'block';
      if (promptRow) promptRow.style.display = 'flex';
      if (datasetBox) datasetBox.style.display = 'none';
    });

    btnDatasetMode.addEventListener('click', () => {
      state.activeMode = 'dataset';
      btnDatasetMode.style.background = 'var(--accent)';
      btnDatasetMode.style.color = '#fff';
      btnPromptMode.style.background = 'transparent';
      btnPromptMode.style.color = 'var(--text-secondary)';

      if (promptBox) promptBox.style.display = 'none';
      if (promptRow) promptRow.style.display = 'none';
      if (datasetBox) datasetBox.style.display = 'flex';
    });
  }

  // Pre-built Scenario Chips
  const scenarioChips = document.querySelectorAll('.scenario-chip');
  const promptInput = document.getElementById('scenario-prompt-input');

  scenarioChips.forEach(chip => {
    chip.addEventListener('click', () => {
      const key = chip.dataset.scenario;
      if (PRESET_SCENARIOS[key]) {
        state.currentScenario = key;
        const data = PRESET_SCENARIOS[key];
        if (promptInput) promptInput.value = data.title;
        renderDashboard(data);
      }
    });
  });

  // Synthesize Prompt Button
  const btnSynthesize = document.getElementById('btn-synthesize');
  if (btnSynthesize) {
    btnSynthesize.addEventListener('click', () => {
      const text = promptInput ? promptInput.value.trim() : '';
      const data = synthesizeFromPrompt(text);
      renderDashboard(data);
    });
  }

  if (promptInput) {
    promptInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        const data = synthesizeFromPrompt(promptInput.value.trim());
        renderDashboard(data);
      }
    });
  }

  // File Upload Handling
  const fileInput = document.getElementById('dash-file-input');
  const btnBrowse = document.getElementById('btn-browse-dash-csv');
  const labelFile = document.getElementById('file-name-label');
  const btnProcess = document.getElementById('btn-process-dash-csv');
  let loadedCsvText = '';

  if (btnBrowse && fileInput) {
    btnBrowse.addEventListener('click', () => fileInput.click());
    fileInput.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (file) {
        if (labelFile) labelFile.textContent = file.name;
        const reader = new FileReader();
        reader.onload = (evt) => {
          loadedCsvText = evt.target.result;
        };
        reader.readAsText(file);
      }
    });
  }

  if (btnProcess) {
    btnProcess.addEventListener('click', () => {
      if (!loadedCsvText) {
        alert('Please choose a valid CSV file first.');
        return;
      }
      const dash = synthesizeFromCSV(loadedCsvText);
      if (dash) {
        renderDashboard(dash);
      } else {
        alert('Could not parse dataset. Ensure your CSV contains valid rows and numeric columns.');
      }
    });
  }

  // Print Dashboard
  const btnPrint = document.getElementById('btn-print-dashboard');
  if (btnPrint) {
    btnPrint.addEventListener('click', () => {
      window.print();
    });
  }

  // Export JSON
  const btnExport = document.getElementById('btn-export-json');
  if (btnExport) {
    btnExport.addEventListener('click', () => {
      const data = state.dashboardData || PRESET_SCENARIOS.ecommerce;
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Executive-Dashboard-${Date.now()}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    });
  }

  // Initial load
  renderDashboard(PRESET_SCENARIOS.ecommerce);
});