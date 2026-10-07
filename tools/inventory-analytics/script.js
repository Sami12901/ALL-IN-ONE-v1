// Inventory Analytics & ABC Pareto Suite

const PRESET_BENCHMARKS = {
  electronics: {
    beginInv: 380000,
    endInv: 420000,
    cogs: 2560000,
    leadTime: 24,
    skus: [
      { sku: 'ELEC-101', name: 'UltraHD 4K Curved Display 32"', unitCost: 320, demand: 3200 },
      { sku: 'ELEC-102', name: 'Wireless ANC Noise-Canceling Headset', unitCost: 110, demand: 5400 },
      { sku: 'ELEC-103', name: 'Mechanical RGB Gaming Keyboard', unitCost: 65, demand: 4200 },
      { sku: 'ELEC-104', name: 'Thunderbolt 4 Docking Station', unitCost: 140, demand: 1800 },
      { sku: 'ELEC-105', name: 'Ergonomic Precision Optical Mouse', unitCost: 38, demand: 4800 },
      { sku: 'ELEC-106', name: 'USB-C Braided Fast Charge Cable 2M', unitCost: 6.5, demand: 18000 },
      { sku: 'ELEC-107', name: '100W GaN Wall Adapter Charger', unitCost: 28, demand: 3100 },
      { sku: 'ELEC-108', name: 'Microfiber Screen Cleaning Cloth', unitCost: 1.8, demand: 22000 },
      { sku: 'ELEC-109', name: 'Silicone Keyboard Dust Cover', unitCost: 3.2, demand: 8500 },
      { sku: 'ELEC-110', name: 'Cable Management Clip 10-Pack', unitCost: 2.5, demand: 9500 }
    ]
  },
  fashion: {
    beginInv: 540000,
    endInv: 620000,
    cogs: 2436000,
    leadTime: 45,
    skus: [
      { sku: 'FASH-201', name: 'Italian Cashmere Overcoat', unitCost: 280, demand: 3400 },
      { sku: 'FASH-202', name: 'Merino Wool Knit Sweater', unitCost: 85, demand: 6200 },
      { sku: 'FASH-203', name: 'Raw Selvedge Denim Jeans', unitCost: 72, demand: 4800 },
      { sku: 'FASH-204', name: 'Tailored Oxford Cotton Shirt', unitCost: 45, demand: 5100 },
      { sku: 'FASH-205', name: 'Full-Grain Leather Dress Belt', unitCost: 34, demand: 3200 },
      { sku: 'FASH-206', name: 'Organic Supima Cotton Crew T-Shirt', unitCost: 16, demand: 12000 },
      { sku: 'FASH-207', name: 'Linen Casual Summer Shorts', unitCost: 28, demand: 2800 },
      { sku: 'FASH-208', name: 'Bamboo Fiber Dress Socks 3-Pack', unitCost: 7.5, demand: 8500 },
      { sku: 'FASH-209', name: 'Enamel Collar Pin Set', unitCost: 3.5, demand: 6000 },
      { sku: 'FASH-210', name: 'Cotton Drawstring Garment Bag', unitCost: 2.2, demand: 9000 }
    ]
  },
  grocery: {
    beginInv: 85000,
    endInv: 95000,
    cogs: 1665000,
    leadTime: 6,
    skus: [
      { sku: 'GROC-301', name: 'Single Origin Organic Espresso Roast', unitCost: 14.5, demand: 42000 },
      { sku: 'GROC-302', name: 'Cold-Pressed Extra Virgin Olive Oil', unitCost: 12.0, demand: 35000 },
      { sku: 'GROC-303', name: 'Organic Raw Manuka Honey 500g', unitCost: 22.0, demand: 16000 },
      { sku: 'GROC-304', name: 'Artisan Sourdough Loaf', unitCost: 3.2, demand: 48000 },
      { sku: 'GROC-305', name: 'Greek Organic Whole Milk Yogurt 1kg', unitCost: 4.5, demand: 28000 },
      { sku: 'GROC-306', name: 'Organic Rolled Oats 1kg', unitCost: 2.8, demand: 32000 },
      { sku: 'GROC-307', name: 'Pink Himalayan Rock Salt Grinder', unitCost: 3.8, demand: 12000 },
      { sku: 'GROC-308', name: 'Natural Spring Mineral Water 1L', unitCost: 0.6, demand: 65000 },
      { sku: 'GROC-309', name: 'Eco Paper Grocery Tote Bag', unitCost: 0.25, demand: 85000 },
      { sku: 'GROC-310', name: 'Organic Spearmint Gum Pack', unitCost: 0.8, demand: 18000 }
    ]
  }
};

let currentSkus = JSON.parse(JSON.stringify(PRESET_BENCHMARKS.electronics.skus));

const formatCurrency = (val) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(val);
const formatNumber = (val) => new Intl.NumberFormat('en-US').format(Math.round(val));
const formatCompact = (val) => {
  if (val >= 1000000) return `$${(val / 1000000).toFixed(2)}M`;
  if (val >= 1000) return `$${(val / 1000).toFixed(0)}k`;
  return `$${Math.round(val)}`;
};

function computeInventoryAnalytics() {
  const beginInv = Math.max(0, parseFloat(document.getElementById('inp-begin-inv').value) || 0);
  const endInv = Math.max(0, parseFloat(document.getElementById('inp-end-inv').value) || 0);
  const cogs = Math.max(1, parseFloat(document.getElementById('inp-cogs').value) || 1);
  const leadTime = Math.max(1, parseInt(document.getElementById('inp-lead-time').value, 10) || 1);

  const avgInv = Math.max(1, (beginInv + endInv) / 2);
  const turnoverRatio = cogs / avgInv;
  const dsi = (avgInv / cogs) * 365;

  // Approximate GMROI
  const gmroi = turnoverRatio * 0.48;

  // Stockout Risk Score (0-100)
  // Higher lead time + faster turnover = higher stockout vulnerability
  const leadTimeFactor = Math.min(50, (leadTime / 45) * 50);
  const velocityFactor = Math.min(50, (turnoverRatio / 12) * 50);
  const bufferDeduction = (endInv / avgInv) * 10;
  const riskScore = Math.min(100, Math.max(5, Math.round(leadTimeFactor + velocityFactor - bufferDeduction)));

  // ABC Pareto Processing on SKUs
  const skusProcessed = currentSkus.map(s => {
    const totalVal = s.unitCost * s.demand;
    return { ...s, totalVal };
  });

  // Sort descending by total consumption value
  skusProcessed.sort((a, b) => b.totalVal - a.totalVal);

  const totalCatalogValue = skusProcessed.reduce((acc, s) => acc + s.totalVal, 0);

  let cumulativeVal = 0;
  const finalSkus = skusProcessed.map(s => {
    cumulativeVal += s.totalVal;
    const sharePct = (s.totalVal / totalCatalogValue) * 100;
    const cumPct = (cumulativeVal / totalCatalogValue) * 100;

    let abcClass = 'C';
    let badgeClass = 'badge-class-c';
    if (cumPct <= 80 || (cumPct > 80 && cumPct - sharePct < 70)) {
      abcClass = 'A';
      badgeClass = 'badge-class-a';
    } else if (cumPct <= 95) {
      abcClass = 'B';
      badgeClass = 'badge-class-b';
    } else {
      abcClass = 'C';
      badgeClass = 'badge-class-c';
    }

    // Reorder Point (ROP): (Daily Demand * Lead Time) + 50% safety stock
    const dailyDemand = s.demand / 365;
    const ropUnits = Math.ceil((dailyDemand * leadTime) * 1.5);

    return {
      ...s,
      sharePct,
      cumPct,
      abcClass,
      badgeClass,
      ropUnits
    };
  });

  return {
    beginInv,
    endInv,
    cogs,
    leadTime,
    avgInv,
    turnoverRatio,
    dsi,
    gmroi,
    riskScore,
    totalCatalogValue,
    skus: finalSkus
  };
}

function renderKPIs(res) {
  const kpiTurnover = document.getElementById('kpi-turnover');
  const kpiTurnoverSub = document.getElementById('kpi-turnover-sub');
  const kpiDsi = document.getElementById('kpi-dsi');
  const kpiAvgInv = document.getElementById('kpi-avg-inv');
  const kpiGmroi = document.getElementById('kpi-gmroi');

  if (kpiTurnover) kpiTurnover.textContent = `${res.turnoverRatio.toFixed(1)}x`;
  if (kpiTurnoverSub) kpiTurnoverSub.textContent = `${res.turnoverRatio >= 6 ? 'High Velocity' : (res.turnoverRatio >= 3 ? 'Standard Velocity' : 'Slow Moving')} cycles`;

  if (kpiDsi) kpiDsi.textContent = `${res.dsi.toFixed(1)} Days`;
  if (kpiAvgInv) kpiAvgInv.textContent = formatCurrency(res.avgInv);
  if (kpiGmroi) kpiGmroi.textContent = `${res.gmroi.toFixed(1)}x`;

  // Risk Score Gauge
  const riskNum = document.getElementById('risk-score-num');
  const riskBadge = document.getElementById('risk-score-badge');
  const riskBar = document.getElementById('risk-score-bar');
  const riskDesc = document.getElementById('risk-score-desc');

  if (riskNum) riskNum.textContent = res.riskScore;

  if (riskBar) {
    riskBar.style.width = `${res.riskScore}%`;
    if (res.riskScore >= 70) {
      riskBar.style.background = '#ef4444';
      if (riskBadge) {
        riskBadge.textContent = 'High Stockout Risk';
        riskBadge.style.color = '#ef4444';
        riskBadge.style.background = 'rgba(239, 68, 68, 0.2)';
      }
      if (riskDesc) riskDesc.textContent = 'Elevated turnover speed relative to supplier lead times. Safety buffer is vulnerable to supply disruptions.';
    } else if (res.riskScore >= 40) {
      riskBar.style.background = '#f59e0b';
      if (riskBadge) {
        riskBadge.textContent = 'Moderate Exposure';
        riskBadge.style.color = '#f59e0b';
        riskBadge.style.background = 'rgba(245, 158, 11, 0.2)';
      }
      if (riskDesc) riskDesc.textContent = 'Balanced stock velocity. Monitor Class A reorder thresholds to prevent stockout spikes during demand surges.';
    } else {
      riskBar.style.background = '#10b981';
      if (riskBadge) {
        riskBadge.textContent = 'Low Risk';
        riskBadge.style.color = '#10b981';
        riskBadge.style.background = 'rgba(16, 185, 129, 0.2)';
      }
      if (riskDesc) riskDesc.textContent = 'Safety buffer is adequate. Reorder triggers provide sufficient lead time protection with minimal stockout exposure.';
    }
  }
}

function renderChart(res) {
  const svg = document.getElementById('abc-pareto-svg');
  if (!svg) return;

  const svgWidth = 760;
  const svgHeight = 290;
  const margin = { top: 25, right: 55, bottom: 45, left: 65 };
  const width = svgWidth - margin.left - margin.right;
  const height = svgHeight - margin.top - margin.bottom;

  const skus = res.skus;
  const maxVal = Math.max(...skus.map(s => s.totalVal), 1000) * 1.1;

  const getBarX = (idx) => margin.left + (idx / skus.length) * width + (width / skus.length) * 0.15;
  const getBarWidth = () => (width / skus.length) * 0.7;
  const getYLeft = (val) => margin.top + height - (val / maxVal) * height;
  const getYRight = (pct) => margin.top + height - (pct / 100) * height;

  let svgContent = `
    <defs>
      <linearGradient id="barA" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#10b981" stop-opacity="0.9"/>
        <stop offset="100%" stop-color="#10b981" stop-opacity="0.35"/>
      </linearGradient>
      <linearGradient id="barB" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#f59e0b" stop-opacity="0.9"/>
        <stop offset="100%" stop-color="#f59e0b" stop-opacity="0.35"/>
      </linearGradient>
      <linearGradient id="barC" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#9ca3af" stop-opacity="0.9"/>
        <stop offset="100%" stop-color="#9ca3af" stop-opacity="0.35"/>
      </linearGradient>
    </defs>
  `;

  // Grid Lines
  for (let i = 0; i <= 4; i++) {
    const pct = i * 25;
    const yPos = getYRight(pct);
    const val = (maxVal / 4) * i;

    svgContent += `
      <line x1="${margin.left}" y1="${yPos}" x2="${margin.left + width}" y2="${yPos}" stroke="rgba(255,255,255,0.06)" stroke-dasharray="3 3"/>
      <text x="${margin.left - 10}" y="${yPos + 4}" fill="var(--text-tertiary)" font-size="10" text-anchor="end">${formatCompact(val)}</text>
      <text x="${margin.left + width + 10}" y="${yPos + 4}" fill="var(--text-tertiary)" font-size="10" text-anchor="start">${pct}%</text>
    `;
  }

  // 80% and 95% Cutoff Threshold Lines
  const y80 = getYRight(80);
  const y95 = getYRight(95);

  svgContent += `
    <line x1="${margin.left}" y1="${y80}" x2="${margin.left + width}" y2="${y80}" stroke="#10b981" stroke-dasharray="4 4" stroke-width="1.2"/>
    <text x="${margin.left + width - 5}" y="${y80 - 4}" fill="#10b981" font-size="9" font-weight="700" text-anchor="end">80% Class A</text>

    <line x1="${margin.left}" y1="${y95}" x2="${margin.left + width}" y2="${y95}" stroke="#f59e0b" stroke-dasharray="4 4" stroke-width="1.2"/>
    <text x="${margin.left + width - 5}" y="${y95 - 4}" fill="#f59e0b" font-size="9" font-weight="700" text-anchor="end">95% Class B</text>
  `;

  // Draw SKU Value Bars
  skus.forEach((s, idx) => {
    const x = getBarX(idx);
    const bw = getBarWidth();
    const y = getYLeft(s.totalVal);
    const h = Math.max(2, margin.top + height - y);

    let fillGrad = 'url(#barA)';
    let strokeCol = '#10b981';
    if (s.abcClass === 'B') { fillGrad = 'url(#barB)'; strokeCol = '#f59e0b'; }
    else if (s.abcClass === 'C') { fillGrad = 'url(#barC)'; strokeCol = '#9ca3af'; }

    svgContent += `
      <rect x="${x}" y="${y}" width="${bw}" height="${h}" rx="3" fill="${fillGrad}" stroke="${strokeCol}" stroke-width="1">
        <title>${s.sku}: ${s.name}\nValue: ${formatCurrency(s.totalVal)}\nClass: ${s.abcClass}</title>
      </rect>
      <text x="${x + bw / 2}" y="${margin.top + height + 18}" fill="var(--text-secondary)" font-size="9" text-anchor="middle">#${idx + 1}</text>
    `;
  });

  // Draw Pareto Cumulative Line
  let linePath = '';
  skus.forEach((s, idx) => {
    const x = getBarX(idx) + getBarWidth() / 2;
    const y = getYRight(s.cumPct);
    linePath += (idx === 0 ? `M ${x} ${y}` : ` L ${x} ${y}`);
  });

  svgContent += `
    <path d="${linePath}" fill="none" stroke="#89aacc" stroke-width="2.5"/>
  `;

  // Draw Pareto Dots
  skus.forEach((s, idx) => {
    const x = getBarX(idx) + getBarWidth() / 2;
    const y = getYRight(s.cumPct);
    svgContent += `
      <circle cx="${x}" cy="${y}" r="3.5" fill="#89aacc" stroke="var(--bg-primary)" stroke-width="2">
        <title>Cumulative: ${s.cumPct.toFixed(1)}%</title>
      </circle>
    `;
  });

  svg.innerHTML = svgContent;
}

function renderTable(res) {
  const tbody = document.getElementById('sku-table-tbody');
  if (!tbody) return;

  tbody.innerHTML = res.skus.map((s, idx) => `
    <tr>
      <td style="font-family: monospace; font-weight: 700; color: var(--accent);">${s.sku}</td>
      <td style="font-weight: 600; color: var(--text-primary);">${s.name}</td>
      <td>${formatCurrency(s.unitCost)}</td>
      <td>${formatNumber(s.demand)}</td>
      <td style="font-weight: 700;">${formatCurrency(s.totalVal)}</td>
      <td>${s.sharePct.toFixed(1)}%</td>
      <td style="color: var(--text-secondary);">${s.cumPct.toFixed(1)}%</td>
      <td><span class="${s.badgeClass}">Class ${s.abcClass}</span></td>
      <td style="font-weight: 700; color: #10b981;">${formatNumber(s.ropUnits)} units</td>
    </tr>
  `).join('');
}

function calculateAndRender() {
  const res = computeInventoryAnalytics();
  renderKPIs(res);
  renderChart(res);
  renderTable(res);
}

function exportCSV() {
  const res = computeInventoryAnalytics();
  const headers = ['SKU', 'Description', 'Unit_Cost', 'Annual_Demand', 'Total_Consumption_Value', 'Value_Share_Pct', 'Cumulative_Share_Pct', 'ABC_Class', 'Reorder_Point_ROP'];
  const rows = res.skus.map(s => [
    s.sku,
    `"${s.name}"`,
    s.unitCost,
    s.demand,
    s.totalVal,
    s.sharePct.toFixed(2),
    s.cumPct.toFixed(2),
    s.abcClass,
    s.ropUnits
  ]);

  const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `inventory-analytics-abc-${new Date().toISOString().slice(0, 10)}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function initEventHandlers() {
  const inputs = ['inp-begin-inv', 'inp-end-inv', 'inp-cogs', 'inp-lead-time'];
  inputs.forEach(id => {
    const el = document.getElementById(id);
    if (el) el.addEventListener('input', calculateAndRender);
  });

  const btnRecalc = document.getElementById('btn-recalculate');
  if (btnRecalc) btnRecalc.addEventListener('click', calculateAndRender);

  const btnExport = document.getElementById('btn-export-csv');
  if (btnExport) btnExport.addEventListener('click', exportCSV);

  // Presets
  const btnElec = document.getElementById('preset-electronics');
  const btnFash = document.getElementById('preset-fashion');
  const btnGroc = document.getElementById('preset-grocery');

  const applyPreset = (key, clickedBtn) => {
    document.querySelectorAll('.preset-bar .chip-btn').forEach(b => b.classList.remove('active'));
    if (clickedBtn) clickedBtn.classList.add('active');

    const p = PRESET_BENCHMARKS[key];
    if (p) {
      document.getElementById('inp-begin-inv').value = p.beginInv;
      document.getElementById('inp-end-inv').value = p.endInv;
      document.getElementById('inp-cogs').value = p.cogs;
      document.getElementById('inp-lead-time').value = p.leadTime;
      currentSkus = JSON.parse(JSON.stringify(p.skus));
      calculateAndRender();
    }
  };

  if (btnElec) btnElec.addEventListener('click', () => applyPreset('electronics', btnElec));
  if (btnFash) btnFash.addEventListener('click', () => applyPreset('fashion', btnFash));
  if (btnGroc) btnGroc.addEventListener('click', () => applyPreset('grocery', btnGroc));

  calculateAndRender();
}

document.addEventListener('DOMContentLoaded', () => {
  initEventHandlers();
});