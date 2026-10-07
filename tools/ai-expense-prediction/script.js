// AI Expense Prediction & Operational Cost Modeling

const CATEGORIES_DEF = [
  {
    id: 'payroll',
    name: 'Payroll & Salaries',
    type: 'Fixed / Semi-Variable',
    elasticityType: 'Headcount (1.0x)',
    defaultAmount: 45000,
    driver: 'headcount',
    calcGrowth: (hc, sales, inf) => (1 + hc * 1.0) * (1 + inf * 0.6) - 1
  },
  {
    id: 'cloud',
    name: 'Cloud & Infrastructure',
    type: 'Variable',
    elasticityType: 'Sales / Usage (0.8x)',
    defaultAmount: 14000,
    driver: 'sales',
    calcGrowth: (hc, sales, inf) => (1 + sales * 0.8) * (1 + inf * 0.2) - 1
  },
  {
    id: 'marketing',
    name: 'Paid Ads & Marketing',
    type: 'Variable',
    elasticityType: 'Sales / Ad Spend (1.15x)',
    defaultAmount: 18000,
    driver: 'sales',
    calcGrowth: (hc, sales, inf) => (1 + sales * 1.15) - 1
  },
  {
    id: 'office',
    name: 'Office & Facilities',
    type: 'Fixed',
    elasticityType: 'Inflation (1.0x)',
    defaultAmount: 4000,
    driver: 'inflation',
    calcGrowth: (hc, sales, inf) => (1 + inf * 1.0) - 1
  },
  {
    id: 'saas',
    name: 'Software & SaaS Tools',
    type: 'Semi-Variable',
    elasticityType: 'Headcount (0.85x)',
    defaultAmount: 6500,
    driver: 'headcount',
    calcGrowth: (hc, sales, inf) => (1 + hc * 0.85) * (1 + inf * 0.5) - 1
  },
  {
    id: 'legal',
    name: 'Legal & Professional',
    type: 'Fixed',
    elasticityType: 'Inflation (0.7x)',
    defaultAmount: 3200,
    driver: 'inflation',
    calcGrowth: (hc, sales, inf) => (1 + inf * 0.7) - 1
  },
  {
    id: 'processing',
    name: 'Payment & Fulfillment',
    type: 'Variable',
    elasticityType: 'Sales Revenue (1.0x)',
    defaultAmount: 5500,
    driver: 'sales',
    calcGrowth: (hc, sales, inf) => (1 + sales * 1.0) - 1
  }
];

const PRESETS = {
  tech: {
    hcGrowth: 30,
    salesGrowth: 45,
    inflation: 3.5,
    horizon: 12,
    amounts: { payroll: 48000, cloud: 16000, marketing: 19000, office: 4200, saas: 7500, legal: 3500, processing: 5800 }
  },
  ecom: {
    hcGrowth: 10,
    salesGrowth: 50,
    inflation: 3.5,
    horizon: 12,
    amounts: { payroll: 22000, cloud: 5500, marketing: 42000, office: 2500, saas: 3800, legal: 2200, processing: 18500 }
  },
  agency: {
    hcGrowth: 15,
    salesGrowth: 20,
    inflation: 3.0,
    horizon: 12,
    amounts: { payroll: 42000, cloud: 2500, marketing: 5000, office: 5500, saas: 4500, legal: 3000, processing: 2200 }
  }
};

let currentAmounts = {};
CATEGORIES_DEF.forEach(c => {
  currentAmounts[c.id] = c.defaultAmount;
});

const formatCurrency = (val) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(val);
const formatCompact = (val) => {
  if (val >= 1000000) return `$${(val / 1000000).toFixed(1)}M`;
  if (val >= 1000) return `$${(val / 1000).toFixed(0)}k`;
  return `$${Math.round(val)}`;
};

function renderCategoryInputs() {
  const container = document.getElementById('category-inputs-container');
  if (!container) return;

  container.innerHTML = CATEGORIES_DEF.map(cat => `
    <div class="category-input-group">
      <span class="category-label">${cat.name}</span>
      <input type="number" class="category-input" id="inp-cat-${cat.id}" data-id="${cat.id}" value="${currentAmounts[cat.id]}" min="0" step="500">
    </div>
  `).join('');

  container.querySelectorAll('.category-input').forEach(inp => {
    inp.addEventListener('input', (e) => {
      const id = e.target.dataset.id;
      currentAmounts[id] = Math.max(0, parseFloat(e.target.value) || 0);
      calculateAndRender();
    });
  });
}

function calculateModel() {
  const hcGrowthRaw = parseFloat(document.getElementById('inp-headcount-growth').value) || 0;
  const salesGrowthRaw = parseFloat(document.getElementById('inp-sales-growth').value) || 0;
  const inflationRaw = parseFloat(document.getElementById('inp-inflation').value) || 0;
  const horizon = parseInt(document.getElementById('sel-horizon').value, 10) || 12;

  // Horizon fraction
  const t = horizon / 12;

  // Compound drivers for horizon period
  const hcCompound = ((1 + hcGrowthRaw / 100) ** t) - 1;
  const salesCompound = ((1 + salesGrowthRaw / 100) ** t) - 1;
  const infCompound = ((1 + inflationRaw / 100) ** t) - 1;

  let totalBaseline = 0;
  let totalProjected = 0;
  let totalFixed = 0;
  let totalVariable = 0;

  const categories = CATEGORIES_DEF.map(cat => {
    const base = currentAmounts[cat.id] || 0;
    const growthRate = cat.calcGrowth(hcCompound, salesCompound, infCompound);
    const projected = Math.round(base * (1 + growthRate));
    const dollarIncrease = projected - base;

    totalBaseline += base;
    totalProjected += projected;

    if (cat.type.includes('Fixed')) {
      totalFixed += base;
    } else {
      totalVariable += base;
    }

    // Runaway check: does category growth significantly outpace sales growth or exceed 35% annualized?
    const isRunaway = (growthRate > (salesCompound * 1.05) && growthRate > 0.20) || (growthRate > 0.35 && base > 5000);

    return {
      ...cat,
      baseline: base,
      growthRate,
      projected,
      dollarIncrease,
      isRunaway
    };
  });

  const totalGrowthPct = totalBaseline > 0 ? ((totalProjected - totalBaseline) / totalBaseline) * 100 : 0;
  const fixedRatio = totalBaseline > 0 ? Math.round((totalFixed / totalBaseline) * 100) : 50;
  const variableRatio = 100 - fixedRatio;

  // Find runaway category with highest dollar expansion
  const runawayCats = categories.filter(c => c.isRunaway).sort((a, b) => b.dollarIncrease - a.dollarIncrease);
  const primaryRunaway = runawayCats.length > 0 ? runawayCats[0] : null;

  return {
    hcGrowthRaw,
    salesGrowthRaw,
    inflationRaw,
    horizon,
    categories,
    totalBaseline,
    totalProjected,
    totalGrowthPct,
    fixedRatio,
    variableRatio,
    primaryRunaway
  };
}

function renderKPIs(model) {
  const kpiCurrent = document.getElementById('kpi-current-opex');
  const kpiProj = document.getElementById('kpi-projected-opex');
  const kpiProjSub = document.getElementById('kpi-projected-opex-sub');
  const kpiRunaway = document.getElementById('kpi-runaway-cat');
  const kpiRunawaySub = document.getElementById('kpi-runaway-sub');
  const kpiMix = document.getElementById('kpi-mix-ratio');

  if (kpiCurrent) kpiCurrent.textContent = formatCurrency(model.totalBaseline);
  if (kpiProj) kpiProj.textContent = formatCurrency(model.totalProjected);
  if (kpiProjSub) kpiProjSub.textContent = `+${model.totalGrowthPct.toFixed(1)}% Expansion (${model.horizon} Mo)`;

  if (kpiRunaway) {
    if (model.primaryRunaway) {
      kpiRunaway.textContent = model.primaryRunaway.name;
      if (kpiRunawaySub) kpiRunawaySub.textContent = `+${(model.primaryRunaway.growthRate * 100).toFixed(1)}% growth (+$${Math.round(model.primaryRunaway.dollarIncrease).toLocaleString()})`;
    } else {
      kpiRunaway.textContent = 'None Detected';
      if (kpiRunawaySub) kpiRunawaySub.textContent = 'All categories within growth bounds';
    }
  }

  if (kpiMix) kpiMix.textContent = `${model.fixedRatio}% / ${model.variableRatio}%`;
}

function renderChart(model) {
  const svg = document.getElementById('expense-comparison-svg');
  if (!svg) return;

  const svgWidth = 760;
  const svgHeight = 290;
  const margin = { top: 25, right: 30, bottom: 50, left: 60 };
  const width = svgWidth - margin.left - margin.right;
  const height = svgHeight - margin.top - margin.bottom;

  const data = model.categories;
  const maxVal = Math.max(...data.map(d => Math.max(d.baseline, d.projected)), 1000) * 1.15;

  const getY = (val) => margin.top + height - (val / maxVal) * height;

  const groupCount = data.length;
  const groupWidth = width / groupCount;
  const barWidth = Math.min(22, groupWidth * 0.38);

  let svgContent = `
    <defs>
      <linearGradient id="barGradBase" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#89aacc" stop-opacity="0.8"/>
        <stop offset="100%" stop-color="#89aacc" stop-opacity="0.3"/>
      </linearGradient>
      <linearGradient id="barGradProj" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#10b981" stop-opacity="0.9"/>
        <stop offset="100%" stop-color="#10b981" stop-opacity="0.35"/>
      </linearGradient>
      <linearGradient id="barGradRunaway" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#ef4444" stop-opacity="0.95"/>
        <stop offset="100%" stop-color="#ef4444" stop-opacity="0.4"/>
      </linearGradient>
    </defs>
  `;

  // Grid & Y Ticks
  const ticks = 4;
  for (let i = 0; i <= ticks; i++) {
    const val = (maxVal / ticks) * i;
    const yPos = getY(val);
    svgContent += `
      <line x1="${margin.left}" y1="${yPos}" x2="${margin.left + width}" y2="${yPos}" stroke="rgba(255,255,255,0.06)" stroke-dasharray="3 3"/>
      <text x="${margin.left - 10}" y="${yPos + 4}" fill="var(--text-tertiary)" font-size="10" text-anchor="end">${formatCompact(val)}</text>
    `;
  }

  // Draw Bars
  data.forEach((d, idx) => {
    const groupX = margin.left + idx * groupWidth;
    const xBase = groupX + (groupWidth - barWidth * 2 - 4) / 2;
    const xProj = xBase + barWidth + 4;

    const yBase = getY(d.baseline);
    const hBase = Math.max(2, margin.top + height - yBase);

    const yProj = getY(d.projected);
    const hProj = Math.max(2, margin.top + height - yProj);

    const projGrad = d.isRunaway ? 'url(#barGradRunaway)' : 'url(#barGradProj)';
    const projStroke = d.isRunaway ? '#ef4444' : '#10b981';

    // Short category name
    const shortName = d.name.split(' ')[0];

    svgContent += `
      <!-- Base Bar -->
      <rect x="${xBase}" y="${yBase}" width="${barWidth}" height="${hBase}" rx="3" fill="url(#barGradBase)" stroke="#89aacc" stroke-width="1"/>
      
      <!-- Projected Bar -->
      <rect x="${xProj}" y="${yProj}" width="${barWidth}" height="${hProj}" rx="3" fill="${projGrad}" stroke="${projStroke}" stroke-width="1.5"/>

      <!-- Value text for projected -->
      <text x="${xProj + barWidth / 2}" y="${yProj - 6}" fill="${d.isRunaway ? '#ef4444' : 'var(--text-primary)'}" font-size="9" font-weight="700" text-anchor="middle">${formatCompact(d.projected)}</text>

      <!-- Label -->
      <text x="${groupX + groupWidth / 2}" y="${margin.top + height + 22}" fill="var(--text-secondary)" font-size="10" font-weight="500" text-anchor="middle">${shortName}</text>
    `;
  });

  // Chart Legend at top right
  svgContent += `
    <g transform="translate(${margin.left + width - 170}, ${margin.top - 10})">
      <rect x="0" y="0" width="10" height="10" rx="2" fill="#89aacc"/>
      <text x="14" y="9" fill="var(--text-secondary)" font-size="10">Baseline</text>
      <rect x="75" y="0" width="10" height="10" rx="2" fill="#10b981"/>
      <text x="89" y="9" fill="var(--text-secondary)" font-size="10">Projected</text>
    </g>
  `;

  svg.innerHTML = svgContent;
}

function renderTable(model) {
  const tbody = document.getElementById('expense-table-tbody');
  if (!tbody) return;

  tbody.innerHTML = model.categories.map(cat => {
    const isRunaway = cat.isRunaway;
    const typeTag = cat.type.includes('Fixed') ? 'tag-fixed' : 'tag-variable';
    const statusTag = isRunaway ? '<span class="tag-runaway">Runaway Risk</span>' : '<span class="tag-controlled">Controlled</span>';

    return `
      <tr>
        <td style="font-weight: 600; color: var(--text-primary);">${cat.name}</td>
        <td><span class="${typeTag}">${cat.type}</span></td>
        <td style="color: var(--text-secondary);">${cat.elasticityType}</td>
        <td>${formatCurrency(cat.baseline)}</td>
        <td style="font-weight: 700; color: ${isRunaway ? '#ef4444' : 'var(--text-primary)'};">${formatCurrency(cat.projected)}</td>
        <td style="font-weight: 700; color: ${isRunaway ? '#ef4444' : 'var(--success)'};">+${(cat.growthRate * 100).toFixed(1)}%</td>
        <td>${statusTag}</td>
      </tr>
    `;
  }).join('');
}

function renderRecommendations(model) {
  const container = document.getElementById('cost-recommendations-container');
  if (!container) return;

  const recs = [];

  if (model.primaryRunaway) {
    recs.push({
      title: `Cap Runaway Escalation: ${model.primaryRunaway.name}`,
      tag: 'Critical Action',
      tagColor: '#ef4444',
      text: `<strong>${model.primaryRunaway.name}</strong> is projected to expand by <strong>+${(model.primaryRunaway.growthRate * 100).toFixed(1)}%</strong> (+$${Math.round(model.primaryRunaway.dollarIncrease).toLocaleString()}/mo). Enact formal budget controls, institute purchase order approval tiers, and audit monthly unit volume before expenses outpace gross profits.`
    });
  }

  // Headcount vs SaaS
  const saasCat = model.categories.find(c => c.id === 'saas');
  if (saasCat && model.hcGrowthRaw > 20) {
    recs.push({
      title: 'SaaS License Governance & Seat De-provisioning',
      tag: 'Efficiency Lever',
      tagColor: 'var(--accent)',
      text: `With planned headcount expansion (+${model.hcGrowthRaw}%), software tooling will surge to <strong>${formatCurrency(saasCat.projected)}/mo</strong>. Implement a centralized Single Sign-On (SSO) directory to automate off-boarding and reclaim abandoned licenses.`
    });
  }

  // Cloud infrastructure
  const cloudCat = model.categories.find(c => c.id === 'cloud');
  if (cloudCat && cloudCat.growthRate > 0.25) {
    recs.push({
      title: 'Cloud Infrastructure & Reserved Instance Commitments',
      tag: 'Cost Optimization',
      tagColor: '#f59e0b',
      text: `Cloud hosting will grow to <strong>${formatCurrency(cloudCat.projected)}/mo</strong>. Transitioning baseline EC2 / RDS workloads to 1-to-3 year Savings Plans or Reserved Instances unlocks immediate 30–45% gross margin savings.`
    });
  }

  // Fixed overhead
  recs.push({
    title: 'Operating Margin Preservation Threshold',
    tag: 'Budget Directive',
    tagColor: '#10b981',
    text: `Total monthly OpEx is forecasted to reach <strong>${formatCurrency(model.totalProjected)}/mo</strong> (+${model.totalGrowthPct.toFixed(1)}%). Ensure sales top-line growth maintains at least a 1.25x ratio over OpEx expansion to prevent operational margin compression.`
  });

  container.innerHTML = recs.map(r => `
    <div style="background: var(--bg-tertiary); border: 1px solid var(--border); border-radius: var(--radius-md); padding: 1rem 1.25rem;">
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.35rem;">
        <h4 style="font-size: 0.95rem; font-weight: 700; color: var(--text-primary); margin: 0;">${r.title}</h4>
        <span style="font-size: 0.7rem; font-weight: 700; text-transform: uppercase; padding: 0.2rem 0.5rem; border-radius: var(--radius-full); background: rgba(255,255,255,0.08); color: ${r.tagColor};">${r.tag}</span>
      </div>
      <p style="font-size: 0.825rem; color: var(--text-secondary); line-height: 1.5; margin: 0;">${r.text}</p>
    </div>
  `).join('');
}

function calculateAndRender() {
  const model = calculateModel();
  renderKPIs(model);
  renderChart(model);
  renderTable(model);
  renderRecommendations(model);
}

function exportCSV() {
  const model = calculateModel();
  const headers = ['Category', 'Type', 'Elasticity', 'Baseline_Cost', 'Projected_Cost', 'Growth_Pct', 'Is_Runaway'];
  const rows = model.categories.map(c => [
    `"${c.name}"`,
    `"${c.type}"`,
    `"${c.elasticityType}"`,
    c.baseline,
    c.projected,
    (c.growthRate * 100).toFixed(1),
    c.isRunaway ? 'YES' : 'NO'
  ]);

  const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `expense-forecast-${new Date().toISOString().slice(0, 10)}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function initEventHandlers() {
  renderCategoryInputs();

  const drivers = ['inp-headcount-growth', 'inp-sales-growth', 'inp-inflation', 'sel-horizon'];
  drivers.forEach(id => {
    const el = document.getElementById(id);
    if (el) el.addEventListener('input', calculateAndRender);
  });

  const btnRecalc = document.getElementById('btn-recalculate');
  if (btnRecalc) btnRecalc.addEventListener('click', calculateAndRender);

  const btnExport = document.getElementById('btn-export-csv');
  if (btnExport) btnExport.addEventListener('click', exportCSV);

  // Presets
  const btnTech = document.getElementById('preset-tech');
  const btnEcom = document.getElementById('preset-ecom');
  const btnAgency = document.getElementById('preset-agency');

  const applyPreset = (key, clickedBtn) => {
    document.querySelectorAll('.preset-bar .chip-btn').forEach(b => b.classList.remove('active'));
    if (clickedBtn) clickedBtn.classList.add('active');

    const p = PRESETS[key];
    if (p) {
      document.getElementById('inp-headcount-growth').value = p.hcGrowth;
      document.getElementById('inp-sales-growth').value = p.salesGrowth;
      document.getElementById('inp-inflation').value = p.inflation;
      document.getElementById('sel-horizon').value = p.horizon;
      currentAmounts = { ...p.amounts };
      renderCategoryInputs();
      calculateAndRender();
    }
  };

  if (btnTech) btnTech.addEventListener('click', () => applyPreset('tech', btnTech));
  if (btnEcom) btnEcom.addEventListener('click', () => applyPreset('ecom', btnEcom));
  if (btnAgency) btnAgency.addEventListener('click', () => applyPreset('agency', btnAgency));

  calculateAndRender();
}

document.addEventListener('DOMContentLoaded', () => {
  initEventHandlers();
});