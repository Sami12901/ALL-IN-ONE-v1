// VIP Customer Analytics & RFM Segmentation Suite

const CLIENTS_PRESET = [
  { id: 'C01', name: 'Apex Global Logistics', industry: 'Supply Chain', recency: 12, frequency: 28, monetary: 142000 },
  { id: 'C02', name: 'Nexus Health Systems', industry: 'Healthcare', recency: 18, frequency: 22, monetary: 98000 },
  { id: 'C03', name: 'Starlight Digital Media', industry: 'Media & AdTech', recency: 25, frequency: 19, monetary: 86500 },
  { id: 'C04', name: 'Vanguard Asset Capital', industry: 'FinTech', recency: 140, frequency: 16, monetary: 112000 },
  { id: 'C05', name: 'Beacon Genomics Labs', industry: 'Biotechnology', recency: 185, frequency: 14, monetary: 76000 },
  { id: 'C06', name: 'Quantum Cloud Hosting', industry: 'SaaS / IT', recency: 8, frequency: 32, monetary: 175000 },
  { id: 'C07', name: 'Solaris Energy Group', industry: 'Renewables', recency: 35, frequency: 12, monetary: 48000 },
  { id: 'C08', name: 'Aegis Defense Systems', industry: 'Aerospace', recency: 210, frequency: 18, monetary: 135000 },
  { id: 'C09', name: 'Hyperion E-Commerce', industry: 'Retail', recency: 15, frequency: 24, monetary: 64000 },
  { id: 'C10', name: 'Silverline Manufacturing', industry: 'Industrial', recency: 42, frequency: 10, monetary: 32000 },
  { id: 'C11', name: 'Velocity Motors', industry: 'Automotive', recency: 260, frequency: 4, monetary: 12000 },
  { id: 'C12', name: 'Crestview Capital Partners', industry: 'Private Equity', recency: 22, frequency: 14, monetary: 54000 },
  { id: 'C13', name: 'Bluefin Maritime Shipping', industry: 'Logistics', recency: 65, frequency: 8, monetary: 28000 },
  { id: 'C14', name: 'Orion Software Labs', industry: 'Enterprise SaaS', recency: 10, frequency: 26, monetary: 118000 },
  { id: 'C15', name: 'Titan Heavy Machinery', industry: 'Construction', recency: 160, frequency: 9, monetary: 42000 },
  { id: 'C16', name: 'Zodiac Interactive Games', industry: 'Gaming', recency: 14, frequency: 2, monetary: 9500 },
  { id: 'C17', name: 'Helios Solar Microgrids', industry: 'CleanTech', recency: 290, frequency: 2, monetary: 4800 },
  { id: 'C18', name: 'Kodiak Retail Brands', industry: 'CPG', recency: 48, frequency: 11, monetary: 39000 },
  { id: 'C19', name: 'Summit Pharmaceuticals', industry: 'Pharma', recency: 175, frequency: 21, monetary: 128000 },
  { id: 'C20', name: 'Pioneer AgriTech Solutions', industry: 'Agriculture', recency: 19, frequency: 2, monetary: 8200 },
  { id: 'C21', name: 'Atlas Property REIT', industry: 'Real Estate', recency: 78, frequency: 7, monetary: 24000 },
  { id: 'C22', name: 'Northstar Cyber Security', industry: 'Security', recency: 16, frequency: 18, monetary: 72000 },
  { id: 'C23', name: 'Ironclad Metal Works', industry: 'Fabrication', recency: 320, frequency: 1, monetary: 3100 },
  { id: 'C24', name: 'Optima Vision Clinics', industry: 'Healthcare', recency: 55, frequency: 6, monetary: 18500 },
  { id: 'C25', name: 'Zenith Robotic Systems', industry: 'Robotics', recency: 7, frequency: 29, monetary: 154000 },
  { id: 'C26', name: 'Polaris Maritime Logistics', industry: 'Maritime', recency: 220, frequency: 3, monetary: 7400 },
  { id: 'C27', name: 'Vertex BioEngineering', industry: 'Life Sciences', recency: 38, frequency: 9, monetary: 36000 },
  { id: 'C28', name: 'Cobalt Telecom Networks', industry: 'Telecom', recency: 190, frequency: 15, monetary: 89000 },
  { id: 'C29', name: 'Lumina Consumer Tech', industry: 'Hardware', recency: 14, frequency: 3, monetary: 14200 },
  { id: 'C30', name: 'Alpha Horizon Airlines', industry: 'Aviation', recency: 340, frequency: 2, monetary: 5200 }
];

let clients = JSON.parse(JSON.stringify(CLIENTS_PRESET));
let activeSegmentFilter = 'all';
let searchQuery = '';

const formatCurrency = (val) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(val);
const formatCompact = (val) => {
  if (val >= 1000000) return `$${(val / 1000000).toFixed(2)}M`;
  if (val >= 1000) return `$${(val / 1000).toFixed(0)}k`;
  return `$${Math.round(val)}`;
};

function scoreRFM(client) {
  // Recency score (1-5)
  let r = 1;
  if (client.recency <= 25) r = 5;
  else if (client.recency <= 55) r = 4;
  else if (client.recency <= 110) r = 3;
  else if (client.recency <= 200) r = 2;
  else r = 1;

  // Frequency score (1-5)
  let f = 1;
  if (client.frequency >= 18) f = 5;
  else if (client.frequency >= 11) f = 4;
  else if (client.frequency >= 6) f = 3;
  else if (client.frequency >= 3) f = 2;
  else f = 1;

  // Monetary score (1-5)
  let m = 1;
  if (client.monetary >= 65000) m = 5;
  else if (client.monetary >= 35000) m = 4;
  else if (client.monetary >= 15000) m = 3;
  else if (client.monetary >= 6000) m = 2;
  else m = 1;

  // Segment classification
  let segment = 'Hibernating';
  let badgeClass = 'badge-hibernating';
  let vipAction = 'Automated $500 Credit Winback';

  if (r >= 4 && f >= 4 && m >= 4) {
    segment = 'Champions';
    badgeClass = 'badge-champion';
    vipAction = 'Executive Sponsor & Advisory Seat';
  } else if (r <= 2 && (f >= 3 || m >= 4)) {
    segment = 'At Risk';
    badgeClass = 'badge-atrisk';
    vipAction = 'Urgent C-Suite Retention Call';
  } else if (r >= 3 && f >= 3) {
    segment = 'Loyalists';
    badgeClass = 'badge-loyalist';
    vipAction = 'Cross-Sell Add-on & Volume Rebate';
  } else if (r >= 4 && f <= 2) {
    segment = 'Potential Loyalists';
    badgeClass = 'badge-promising';
    vipAction = 'VIP Onboarding Concierge Call';
  } else {
    segment = 'Hibernating';
    badgeClass = 'badge-hibernating';
    vipAction = 'Automated Win-Back Offer';
  }

  return {
    ...client,
    r,
    f,
    m,
    rfmScore: `${r}${f}${m}`,
    segment,
    badgeClass,
    vipAction
  };
}

function getSegmentedData() {
  const scored = clients.map(scoreRFM);

  const totalRev = scored.reduce((a, b) => a + b.monetary, 0);
  const totalOrders = scored.reduce((a, b) => a + b.frequency, 0);
  const aov = totalOrders > 0 ? (totalRev / totalOrders) : 0;

  const champions = scored.filter(c => c.segment === 'Champions');
  const champRev = champions.reduce((a, b) => a + b.monetary, 0);
  const champShare = totalRev > 0 ? ((champRev / totalRev) * 100) : 0;

  const atRisk = scored.filter(c => c.segment === 'At Risk');
  const atRiskRev = atRisk.reduce((a, b) => a + b.monetary, 0);

  return {
    scored,
    totalRev,
    totalOrders,
    aov,
    champions,
    champRev,
    champShare,
    atRisk,
    atRiskRev
  };
}

function renderKPIs(data) {
  const kpiChampCount = document.getElementById('kpi-champ-count');
  const kpiChampRev = document.getElementById('kpi-champ-rev');
  const kpiAtRiskRev = document.getElementById('kpi-atrisk-rev');
  const kpiAtRiskCount = document.getElementById('kpi-atrisk-count');
  const kpiTotalAccounts = document.getElementById('kpi-total-accounts');
  const kpiTotalRev = document.getElementById('kpi-total-revenue');
  const kpiAovSub = document.getElementById('kpi-aov-sub');

  if (kpiChampCount) kpiChampCount.textContent = data.champions.length;
  if (kpiChampRev) kpiChampRev.textContent = `${formatCurrency(data.champRev)} (${data.champShare.toFixed(1)}% of Revenue)`;

  if (kpiAtRiskRev) kpiAtRiskRev.textContent = formatCurrency(data.atRiskRev);
  if (kpiAtRiskCount) kpiAtRiskCount.textContent = `${data.atRisk.length} High-Value Accounts at Risk`;

  if (kpiTotalAccounts) kpiTotalAccounts.textContent = data.scored.length;
  if (kpiTotalRev) kpiTotalRev.textContent = formatCompact(data.totalRev);
  if (kpiAovSub) kpiAovSub.textContent = `AOV: ${formatCurrency(data.aov)}`;
}

function renderMatrix(data) {
  const svg = document.getElementById('rfm-matrix-svg');
  if (!svg) return;

  const svgWidth = 760;
  const svgHeight = 290;
  const margin = { top: 25, right: 35, bottom: 45, left: 65 };
  const width = svgWidth - margin.left - margin.right;
  const height = svgHeight - margin.top - margin.bottom;

  // X axis: Recency (0 to 360 days)
  const maxRecency = 360;
  // Y axis: Monetary ($0 to $200,000)
  const maxMonetary = 200000;

  const getX = (rec) => margin.left + (Math.min(rec, maxRecency) / maxRecency) * width;
  const getY = (mon) => margin.top + height - (Math.min(mon, maxMonetary) / maxMonetary) * height;
  const getRadius = (freq) => Math.min(14, Math.max(5, freq * 0.45));

  let svgContent = `
    <defs>
      <filter id="bubbleShadow" x="-30%" y="-30%" width="160%" height="160%">
        <feDropShadow dx="0" dy="2" stdDeviation="2" flood-color="rgba(0,0,0,0.5)"/>
      </filter>
    </defs>
  `;

  // Grid & Axis
  for (let m = 0; m <= 4; m++) {
    const val = (maxMonetary / 4) * m;
    const yPos = getY(val);
    svgContent += `
      <line x1="${margin.left}" y1="${yPos}" x2="${margin.left + width}" y2="${yPos}" stroke="rgba(255,255,255,0.06)" stroke-dasharray="3 3"/>
      <text x="${margin.left - 10}" y="${yPos + 4}" fill="var(--text-tertiary)" font-size="10" text-anchor="end">${formatCompact(val)}</text>
    `;
  }

  // Recency Ticks
  const rTicks = [0, 60, 120, 180, 240, 300, 360];
  rTicks.forEach(r => {
    const xPos = getX(r);
    svgContent += `
      <text x="${xPos}" y="${margin.top + height + 20}" fill="var(--text-tertiary)" font-size="10" text-anchor="middle">${r}d</text>
    `;
  });

  // Axis Labels
  svgContent += `
    <text x="${margin.left + width / 2}" y="${margin.top + height + 38}" fill="var(--text-secondary)" font-size="10" font-weight="600" text-anchor="middle">Recency &rarr; (Days Since Last Order)</text>
  `;

  // Quadrant lines
  const quadX = getX(90);
  const quadY = getY(40000);
  svgContent += `
    <line x1="${quadX}" y1="${margin.top}" x2="${quadX}" y2="${margin.top + height}" stroke="rgba(255,255,255,0.12)" stroke-dasharray="4 4"/>
    <line x1="${margin.left}" y1="${quadY}" x2="${margin.left + width}" y2="${quadY}" stroke="rgba(255,255,255,0.12)" stroke-dasharray="4 4"/>
  `;

  // Quadrant Labels
  svgContent += `
    <text x="${margin.left + 15}" y="${margin.top + 20}" fill="rgba(16, 185, 129, 0.4)" font-size="12" font-weight="800">CHAMPIONS ZONE</text>
    <text x="${margin.left + width - 15}" y="${margin.top + 20}" fill="rgba(239, 68, 68, 0.4)" font-size="12" font-weight="800" text-anchor="end">AT RISK ZONE</text>
    <text x="${margin.left + width - 15}" y="${margin.top + height - 15}" fill="rgba(156, 163, 175, 0.3)" font-size="12" font-weight="800" text-anchor="end">HIBERNATING</text>
  `;

  // Draw Client Bubbles
  data.scored.forEach(c => {
    const cx = getX(c.recency);
    const cy = getY(c.monetary);
    const r = getRadius(c.frequency);

    let color = '#9ca3af';
    if (c.segment === 'Champions') color = '#10b981';
    else if (c.segment === 'Loyalists') color = '#60a5fa';
    else if (c.segment === 'At Risk') color = '#ef4444';
    else if (c.segment === 'Potential Loyalists') color = '#c084fc';

    svgContent += `
      <g class="matrix-bubble" data-name="${c.name}">
        <circle cx="${cx}" cy="${cy}" r="${r}" fill="${color}" fill-opacity="0.8" stroke="#ffffff" stroke-width="1.5" filter="url(#bubbleShadow)">
          <title>${c.name} (${c.industry})\nSpend: ${formatCurrency(c.monetary)}\nOrders: ${c.frequency}\nRecency: ${c.recency} days\nSegment: ${c.segment}</title>
        </circle>
      </g>
    `;
  });

  svg.innerHTML = svgContent;
}

function renderTable(data) {
  const tbody = document.getElementById('customers-table-tbody');
  if (!tbody) return;

  let filtered = data.scored;

  if (activeSegmentFilter !== 'all') {
    filtered = filtered.filter(c => c.segment.toLowerCase() === activeSegmentFilter.toLowerCase());
  }

  if (searchQuery.trim()) {
    const q = searchQuery.toLowerCase();
    filtered = filtered.filter(c => c.name.toLowerCase().includes(q) || c.industry.toLowerCase().includes(q));
  }

  if (filtered.length === 0) {
    tbody.innerHTML = `<tr><td colspan="8" style="text-align: center; padding: 2rem; color: var(--text-tertiary);">No customers match the current filter.</td></tr>`;
    return;
  }

  tbody.innerHTML = filtered.map(c => `
    <tr>
      <td style="font-weight: 700; color: var(--text-primary);">${c.name}</td>
      <td style="color: var(--text-secondary);">${c.industry}</td>
      <td><strong>${c.recency}</strong> days</td>
      <td><strong>${c.frequency}</strong> orders</td>
      <td style="font-weight: 700; color: var(--accent);">${formatCurrency(c.monetary)}</td>
      <td><span style="font-family: monospace; font-weight: 700; background: var(--bg-secondary); padding: 0.15rem 0.4rem; border-radius: 4px; border: 1px solid var(--border);">${c.rfmScore}</span></td>
      <td><span class="${c.badgeClass}">${c.segment}</span></td>
      <td style="font-size: 0.8rem; color: var(--text-secondary);">${c.vipAction}</td>
    </tr>
  `).join('');
}

function calculateAndRender() {
  const data = getSegmentedData();
  renderKPIs(data);
  renderMatrix(data);
  renderTable(data);
}

function exportCSV() {
  const data = getSegmentedData();
  const headers = ['Client_ID', 'Client_Name', 'Industry', 'Recency_Days', 'Frequency_Orders', 'Monetary_Spend', 'R_Score', 'F_Score', 'M_Score', 'RFM_Score', 'Segment', 'VIP_Action'];
  const rows = data.scored.map(c => [
    c.id,
    `"${c.name}"`,
    `"${c.industry}"`,
    c.recency,
    c.frequency,
    c.monetary,
    c.r,
    c.f,
    c.m,
    c.rfmScore,
    `"${c.segment}"`,
    `"${c.vipAction}"`
  ]);

  const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `vip-customer-rfm-${new Date().toISOString().slice(0, 10)}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function initEventHandlers() {
  // Tabs
  const tabs = document.getElementById('segment-filter-tabs');
  if (tabs) {
    tabs.addEventListener('click', (e) => {
      const btn = e.target.closest('.tab-btn');
      if (!btn) return;
      tabs.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      activeSegmentFilter = btn.dataset.segment;
      calculateAndRender();
    });
  }

  // Search
  const searchInp = document.getElementById('inp-search-client');
  if (searchInp) {
    searchInp.addEventListener('input', (e) => {
      searchQuery = e.target.value;
      calculateAndRender();
    });
  }

  const btnExport = document.getElementById('btn-export-csv');
  if (btnExport) btnExport.addEventListener('click', exportCSV);

  calculateAndRender();
}

document.addEventListener('DOMContentLoaded', () => {
  initEventHandlers();
});