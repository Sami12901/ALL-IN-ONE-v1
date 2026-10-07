// AI Sales Prediction & E-Commerce SKU Demand Forecasting

const SKU_CATALOG = [
  { sku: 'SKU-001', name: 'Pro ANC Wireless Headphones', basePrice: 180, baseDemand: 850, currentStock: 620, ped: -1.4 },
  { sku: 'SKU-002', name: 'Smart Fitness Tracker Band', basePrice: 75, baseDemand: 1400, currentStock: 2600, ped: -1.8 },
  { sku: 'SKU-003', name: 'Ergonomic Lumbar Office Chair', basePrice: 240, baseDemand: 420, currentStock: 210, ped: -0.9 },
  { sku: 'SKU-004', name: 'Stainless Steel Thermal Tumbler', basePrice: 28, baseDemand: 2200, currentStock: 2800, ped: -1.2 },
  { sku: 'SKU-005', name: 'Mechanical 60% RGB Keyboard', basePrice: 95, baseDemand: 960, currentStock: 480, ped: -1.5 }
];

const SEASONALITY_FACTORS = {
  Q1: 0.85,
  Q2: 1.05,
  Q3: 0.95,
  Q4: 1.35
};

const formatCurrency = (val) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(val);
const formatNumber = (val) => new Intl.NumberFormat('en-US').format(Math.round(val));

function computeDemandForecast() {
  const qSelect = document.getElementById('sel-quarter');
  const quarter = qSelect ? qSelect.value : 'Q4';
  const seasonFactor = SEASONALITY_FACTORS[quarter] || 1.0;

  const priceChangeInput = document.getElementById('range-price-change');
  const plannedPriceChange = priceChangeInput ? parseFloat(priceChangeInput.value) : 0;

  const promoActiveCheck = document.getElementById('chk-promo-active');
  const isPromo = promoActiveCheck ? promoActiveCheck.checked : true;

  const promoDiscountInput = document.getElementById('range-promo-discount');
  const promoDiscount = (isPromo && promoDiscountInput) ? parseFloat(promoDiscountInput.value) : 0;

  const marketingLiftInput = document.getElementById('range-marketing-lift');
  const marketingLift = (isPromo && marketingLiftInput) ? parseFloat(marketingLiftInput.value) : 0;

  // Net price adjustment %
  const netPriceChangePct = plannedPriceChange - promoDiscount;
  const adLiftMultiplier = 1 + (marketingLift / 100);

  let totalForecastUnits = 0;
  let totalRevenue = 0;
  let stockoutCount = 0;
  let overstockCount = 0;

  const skusForecasted = SKU_CATALOG.map(item => {
    // Effective price
    const effectivePrice = Math.max(1, item.basePrice * (1 + netPriceChangePct / 100));

    // Elasticity impact: % Delta Q = PED * % Delta P
    const elasticityDeltaQ = item.ped * (netPriceChangePct / 100);
    const elasticityMultiplier = Math.max(0.1, 1 + elasticityDeltaQ);

    // Final Forecast Demand Units
    const forecastUnits = Math.max(1, Math.round(item.baseDemand * seasonFactor * elasticityMultiplier * adLiftMultiplier));
    const varianceUnits = item.currentStock - forecastUnits;
    const gmv = forecastUnits * effectivePrice;

    totalForecastUnits += forecastUnits;
    totalRevenue += gmv;

    let status = 'Optimal Stock';
    let badgeClass = 'badge-optimal';
    let action = 'Stock level balanced (maintain standard reorder cycle)';

    if (item.currentStock < forecastUnits) {
      stockoutCount++;
      const deficit = forecastUnits - item.currentStock;
      if (item.currentStock < forecastUnits * 0.5) {
        status = 'Critical Stockout';
        badgeClass = 'badge-stockout';
        action = `URGENT: Expedite ${formatNumber(deficit)} units via air freight immediately`;
      } else {
        status = 'Stockout Risk';
        badgeClass = 'badge-stockout';
        action = `Reorder ${formatNumber(deficit)} units to support peak demand`;
      }
    } else if (item.currentStock > forecastUnits * 1.4) {
      overstockCount++;
      const surplus = item.currentStock - forecastUnits;
      status = 'Excess Overstock';
      badgeClass = 'badge-overstock';
      action = `Launch clearance bundle to liquidate ${formatNumber(surplus)} surplus units`;
    }

    return {
      ...item,
      effectivePrice,
      forecastUnits,
      varianceUnits,
      gmv,
      status,
      badgeClass,
      action
    };
  });

  return {
    quarter,
    seasonFactor,
    netPriceChangePct,
    isPromo,
    promoDiscount,
    marketingLift,
    totalForecastUnits,
    totalRevenue,
    stockoutCount,
    overstockCount,
    skus: skusForecasted
  };
}

function renderKPIs(res) {
  const kpiUnits = document.getElementById('kpi-forecast-units');
  const kpiUnitsSub = document.getElementById('kpi-forecast-units-sub');
  const kpiRev = document.getElementById('kpi-forecast-rev');
  const kpiRevSub = document.getElementById('kpi-forecast-rev-sub');
  const kpiStockout = document.getElementById('kpi-stockout-count');
  const kpiStockoutSub = document.getElementById('kpi-stockout-sub');
  const kpiOverstock = document.getElementById('kpi-overstock-count');
  const kpiOverstockSub = document.getElementById('kpi-overstock-sub');

  if (kpiUnits) kpiUnits.textContent = `${formatNumber(res.totalForecastUnits)} Units`;
  if (kpiUnitsSub) kpiUnitsSub.textContent = `Season: ${res.quarter} (${res.seasonFactor}x factor)`;

  if (kpiRev) kpiRev.textContent = formatCurrency(res.totalRevenue);
  if (kpiRevSub) kpiRevSub.textContent = `Gross merchandise volume (GMV)`;

  if (kpiStockout) kpiStockout.textContent = `${res.stockoutCount} SKUs`;
  if (kpiStockoutSub) kpiStockoutSub.textContent = res.stockoutCount > 0 ? `${res.stockoutCount} items risk stockout depletion` : 'All inventory adequate';

  if (kpiOverstock) kpiOverstock.textContent = `${res.overstockCount} SKUs`;
  if (kpiOverstockSub) kpiOverstockSub.textContent = res.overstockCount > 0 ? `${res.overstockCount} items tied in slow inventory` : 'No excess capital trapped';
}

function renderChart(res) {
  const svg = document.getElementById('sales-demand-svg');
  if (!svg) return;

  const svgWidth = 760;
  const svgHeight = 280;
  const margin = { top: 25, right: 30, bottom: 45, left: 60 };
  const width = svgWidth - margin.left - margin.right;
  const height = svgHeight - margin.top - margin.bottom;

  const skus = res.skus;
  const maxVal = Math.max(...skus.map(s => Math.max(s.currentStock, s.forecastUnits)), 500) * 1.15;

  const getY = (val) => margin.top + height - (val / maxVal) * height;

  const groupCount = skus.length;
  const groupWidth = width / groupCount;
  const barWidth = Math.min(26, groupWidth * 0.35);

  let svgContent = `
    <defs>
      <linearGradient id="barCurrent" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#89aacc" stop-opacity="0.85"/>
        <stop offset="100%" stop-color="#89aacc" stop-opacity="0.35"/>
      </linearGradient>
      <linearGradient id="barDemand" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#10b981" stop-opacity="0.95"/>
        <stop offset="100%" stop-color="#10b981" stop-opacity="0.4"/>
      </linearGradient>
      <linearGradient id="barDangerDemand" x1="0" y1="0" x2="0" y2="1">
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
      <text x="${margin.left - 10}" y="${yPos + 4}" fill="var(--text-tertiary)" font-size="10" text-anchor="end">${formatNumber(val)}</text>
    `;
  }

  // Draw Bars
  skus.forEach((s, idx) => {
    const groupX = margin.left + idx * groupWidth;
    const xStock = groupX + (groupWidth - barWidth * 2 - 4) / 2;
    const xDemand = xStock + barWidth + 4;

    const yStock = getY(s.currentStock);
    const hStock = Math.max(2, margin.top + height - yStock);

    const yDemand = getY(s.forecastUnits);
    const hDemand = Math.max(2, margin.top + height - yDemand);

    const isDeficit = s.currentStock < s.forecastUnits;
    const demandGrad = isDeficit ? 'url(#barDangerDemand)' : 'url(#barDemand)';
    const demandStroke = isDeficit ? '#ef4444' : '#10b981';

    svgContent += `
      <!-- Stock Bar -->
      <rect x="${xStock}" y="${yStock}" width="${barWidth}" height="${hStock}" rx="3" fill="url(#barCurrent)" stroke="#89aacc" stroke-width="1">
        <title>${s.sku}: Current Stock = ${s.currentStock}</title>
      </rect>

      <!-- Demand Bar -->
      <rect x="${xDemand}" y="${yDemand}" width="${barWidth}" height="${hDemand}" rx="3" fill="${demandGrad}" stroke="${demandStroke}" stroke-width="1.5">
        <title>${s.sku}: Forecast Demand = ${s.forecastUnits}</title>
      </rect>

      <!-- Label -->
      <text x="${groupX + groupWidth / 2}" y="${margin.top + height + 20}" fill="var(--text-secondary)" font-size="10" font-weight="600" text-anchor="middle">${s.sku}</text>

      <!-- Values above demand -->
      <text x="${xDemand + barWidth / 2}" y="${yDemand - 6}" fill="${isDeficit ? '#ef4444' : 'var(--text-primary)'}" font-size="9" font-weight="700" text-anchor="middle">${formatNumber(s.forecastUnits)}</text>
    `;
  });

  svg.innerHTML = svgContent;
}

function renderTable(res) {
  const tbody = document.getElementById('demand-table-tbody');
  if (!tbody) return;

  tbody.innerHTML = res.skus.map(s => {
    const varText = s.varianceUnits >= 0 ? `+${formatNumber(s.varianceUnits)}` : `${formatNumber(s.varianceUnits)}`;
    const varColor = s.varianceUnits < 0 ? '#ef4444' : (s.varianceUnits > s.forecastUnits * 0.4 ? '#f59e0b' : 'var(--success)');

    return `
      <tr>
        <td style="font-family: monospace; font-weight: 700; color: var(--accent);">${s.sku}</td>
        <td style="font-weight: 600; color: var(--text-primary);">${s.name}</td>
        <td>${formatCurrency(s.effectivePrice)}</td>
        <td style="font-weight: 600;">${formatNumber(s.currentStock)}</td>
        <td style="font-weight: 800; color: #10b981;">${formatNumber(s.forecastUnits)}</td>
        <td style="font-weight: 700; color: ${varColor};">${varText}</td>
        <td style="font-weight: 700;">${formatCurrency(s.gmv)}</td>
        <td><span class="${s.badgeClass}">${s.status}</span></td>
        <td style="font-size: 0.8rem; color: var(--text-secondary);">${s.action}</td>
      </tr>
    `;
  }).join('');
}

function calculateAndRender() {
  const res = computeDemandForecast();
  renderKPIs(res);
  renderChart(res);
  renderTable(res);
}

function exportCSV() {
  const res = computeDemandForecast();
  const headers = ['SKU', 'Product_Name', 'Unit_Price', 'Current_Stock', 'Forecast_Demand', 'Variance_Units', 'Expected_GMV', 'Status', 'Recommended_Action'];
  const rows = res.skus.map(s => [
    s.sku,
    `"${s.name}"`,
    s.effectivePrice.toFixed(2),
    s.currentStock,
    s.forecastUnits,
    s.varianceUnits,
    s.gmv.toFixed(2),
    `"${s.status}"`,
    `"${s.action}"`
  ]);

  const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `sales-demand-forecast-${new Date().toISOString().slice(0, 10)}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function initEventHandlers() {
  const selQuarter = document.getElementById('sel-quarter');
  if (selQuarter) selQuarter.addEventListener('change', calculateAndRender);

  const rangePrice = document.getElementById('range-price-change');
  const valPrice = document.getElementById('val-price-change');
  if (rangePrice) {
    rangePrice.addEventListener('input', (e) => {
      const v = parseFloat(e.target.value);
      if (valPrice) valPrice.textContent = `${v >= 0 ? '+' : ''}${v}%`;
      calculateAndRender();
    });
  }

  const chkPromo = document.getElementById('chk-promo-active');
  const promoOptions = document.getElementById('promo-options-box');
  if (chkPromo) {
    chkPromo.addEventListener('change', (e) => {
      if (promoOptions) {
        promoOptions.style.opacity = e.target.checked ? '1' : '0.4';
        promoOptions.style.pointerEvents = e.target.checked ? 'auto' : 'none';
      }
      calculateAndRender();
    });
  }

  const rangePromoDisc = document.getElementById('range-promo-discount');
  const valPromoDisc = document.getElementById('val-promo-discount');
  if (rangePromoDisc) {
    rangePromoDisc.addEventListener('input', (e) => {
      if (valPromoDisc) valPromoDisc.textContent = `${e.target.value}%`;
      calculateAndRender();
    });
  }

  const rangeMktgLift = document.getElementById('range-marketing-lift');
  const valMktgLift = document.getElementById('val-marketing-lift');
  if (rangeMktgLift) {
    rangeMktgLift.addEventListener('input', (e) => {
      if (valMktgLift) valMktgLift.textContent = `+${e.target.value}%`;
      calculateAndRender();
    });
  }

  const btnRecalc = document.getElementById('btn-recalc-demand');
  if (btnRecalc) btnRecalc.addEventListener('click', calculateAndRender);

  const btnExport = document.getElementById('btn-export-csv');
  if (btnExport) btnExport.addEventListener('click', exportCSV);

  calculateAndRender();
}

document.addEventListener('DOMContentLoaded', () => {
  initEventHandlers();
});