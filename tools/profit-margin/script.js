// Profit Margin & Markup Calculator Implementation
document.addEventListener('DOMContentLoaded', () => {
  // DOM Elements - Modes
  const tabModePrice = document.getElementById('tab-mode-price');
  const tabModeMargin = document.getElementById('tab-mode-margin');
  const tabModeMarkup = document.getElementById('tab-mode-markup');

  const groupSellingPrice = document.getElementById('group-selling-price');
  const groupTargetMargin = document.getElementById('group-target-margin');
  const groupTargetMarkup = document.getElementById('group-target-markup');

  // DOM Elements - Inputs
  const cogsInput = document.getElementById('cogs-input');
  const cogsBadge = document.getElementById('cogs-badge');

  const priceInput = document.getElementById('price-input');
  const priceBadge = document.getElementById('price-badge');

  const marginInput = document.getElementById('margin-input');
  const marginBadge = document.getElementById('margin-badge');

  const markupInput = document.getElementById('markup-input');
  const markupBadge = document.getElementById('markup-badge');

  const quantityInput = document.getElementById('quantity-input');
  const quantityBadge = document.getElementById('quantity-badge');

  const btnResetPm = document.getElementById('btn-reset-pm');

  // Overhead Inputs
  const overheadShipping = document.getElementById('overhead-shipping');
  const overheadGatewayPct = document.getElementById('overhead-gateway-pct');
  const overheadMarketing = document.getElementById('overhead-marketing');
  const overheadFixed = document.getElementById('overhead-fixed');

  // DOM Elements - Outputs & KPIs
  const priceSummaryBadge = document.getElementById('price-summary-badge');
  const kpiGrossProfit = document.getElementById('kpi-gross-profit');
  const kpiGrossProfitSub = document.getElementById('kpi-gross-profit-sub');
  const kpiMarginPct = document.getElementById('kpi-margin-pct');
  const kpiMarkupPct = document.getElementById('kpi-markup-pct');
  const kpiRevenue = document.getElementById('kpi-revenue');
  const kpiRevenueSub = document.getElementById('kpi-revenue-sub');

  const barCost = document.getElementById('bar-cost');
  const barProfit = document.getElementById('bar-profit');
  const compositionText = document.getElementById('composition-text');
  const legendCostVal = document.getElementById('legend-cost-val');
  const legendProfitVal = document.getElementById('legend-profit-val');

  const netMarginBadge = document.getElementById('net-margin-badge');
  const overheadTotalVal = document.getElementById('overhead-total-val');
  const netProfitVal = document.getElementById('net-profit-val');

  const matrixTbody = document.getElementById('matrix-tbody');
  const btnExportMarginCsv = document.getElementById('btn-export-margin-csv');

  // State
  let currentMode = 'price'; // 'price' | 'margin' | 'markup'

  // Currency Formatter
  const formatCurrency = (val, decimals = 2) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals
    }).format(val);
  };

  // Switch Mode
  function setMode(mode) {
    currentMode = mode;
    [tabModePrice, tabModeMargin, tabModeMarkup].forEach(tab => tab.classList.remove('active'));

    groupSellingPrice.style.display = 'none';
    groupTargetMargin.style.display = 'none';
    groupTargetMarkup.style.display = 'none';

    if (mode === 'price') {
      tabModePrice.classList.add('active');
      groupSellingPrice.style.display = 'flex';
    } else if (mode === 'margin') {
      tabModeMargin.classList.add('active');
      groupTargetMargin.style.display = 'flex';
    } else if (mode === 'markup') {
      tabModeMarkup.classList.add('active');
      groupTargetMarkup.style.display = 'flex';
    }

    calculateProfit();
  }

  // Calculate Profit and Margins
  function calculateProfit() {
    const cost = Math.max(0.0001, parseFloat(cogsInput.value) || 0);
    const quantity = Math.max(1, parseInt(quantityInput.value, 10) || 1);

    let price = 0;
    let marginPct = 0;
    let markupPct = 0;
    let profitPerUnit = 0;

    if (currentMode === 'price') {
      price = Math.max(0, parseFloat(priceInput.value) || 0);
      profitPerUnit = price - cost;
      marginPct = price > 0 ? (profitPerUnit / price) * 100 : 0;
      markupPct = cost > 0 ? (profitPerUnit / cost) * 100 : 0;

      // Sync the other inputs in background
      marginInput.value = marginPct.toFixed(1);
      markupInput.value = markupPct.toFixed(1);
    } else if (currentMode === 'margin') {
      marginPct = Math.min(99.9, Math.max(0, parseFloat(marginInput.value) || 0));
      price = marginPct < 100 ? cost / (1 - marginPct / 100) : 0;
      profitPerUnit = price - cost;
      markupPct = cost > 0 ? (profitPerUnit / cost) * 100 : 0;

      priceInput.value = price.toFixed(2);
      markupInput.value = markupPct.toFixed(1);
    } else if (currentMode === 'markup') {
      markupPct = Math.max(0, parseFloat(markupInput.value) || 0);
      profitPerUnit = cost * (markupPct / 100);
      price = cost + profitPerUnit;
      marginPct = price > 0 ? (profitPerUnit / price) * 100 : 0;

      priceInput.value = price.toFixed(2);
      marginInput.value = marginPct.toFixed(1);
    }

    // Update Badges
    cogsBadge.textContent = formatCurrency(cost);
    priceBadge.textContent = formatCurrency(price);
    marginBadge.textContent = `${marginPct.toFixed(1)}%`;
    markupBadge.textContent = `${markupPct.toFixed(1)}%`;
    quantityBadge.textContent = `${quantity} ${quantity === 1 ? 'Unit' : 'Units'}`;
    priceSummaryBadge.textContent = `${formatCurrency(price)} / unit`;

    // Totals with Quantity Multiplier
    const totalRevenue = price * quantity;
    const totalGrossProfit = profitPerUnit * quantity;
    const totalCost = cost * quantity;

    kpiGrossProfit.textContent = formatCurrency(totalGrossProfit);
    kpiGrossProfitSub.textContent = quantity > 1 ? `${formatCurrency(profitPerUnit)} / unit (${quantity} units)` : `$${profitPerUnit.toFixed(2)} per unit`;

    kpiMarginPct.textContent = `${marginPct.toFixed(1)}%`;
    kpiMarginPct.style.color = marginPct >= 0 ? 'var(--success)' : 'var(--error)';

    kpiMarkupPct.textContent = `${markupPct.toFixed(1)}%`;
    kpiMarkupPct.style.color = markupPct >= 0 ? 'var(--accent)' : 'var(--error)';

    kpiRevenue.textContent = formatCurrency(totalRevenue);
    kpiRevenueSub.textContent = quantity > 1 ? `Gross revenue from ${quantity} units` : `Gross revenue per unit`;

    // Visual Composition Bar
    let costBarPct = price > 0 ? Math.min(100, Math.max(0, (cost / price) * 100)) : 100;
    let profitBarPct = 100 - costBarPct;
    if (profitPerUnit < 0) {
      costBarPct = 100;
      profitBarPct = 0;
    }
    barCost.style.width = `${costBarPct}%`;
    barProfit.style.width = `${profitBarPct}%`;
    compositionText.textContent = `Cost: ${costBarPct.toFixed(1)}% | Profit: ${profitBarPct.toFixed(1)}%`;
    legendCostVal.textContent = formatCurrency(totalCost);
    legendProfitVal.textContent = formatCurrency(totalGrossProfit);

    // Overhead & Net Margin
    const ship = Math.max(0, parseFloat(overheadShipping.value) || 0);
    const gatewayPct = Math.max(0, parseFloat(overheadGatewayPct.value) || 0);
    const mkt = Math.max(0, parseFloat(overheadMarketing.value) || 0);
    const fixedOverhead = Math.max(0, parseFloat(overheadFixed.value) || 0);

    const gatewayFee = price * (gatewayPct / 100);
    const totalOverheadPerUnit = ship + gatewayFee + mkt + fixedOverhead;
    const netProfitPerUnit = profitPerUnit - totalOverheadPerUnit;
    const netMarginPct = price > 0 ? (netProfitPerUnit / price) * 100 : 0;

    overheadTotalVal.textContent = `${formatCurrency(totalOverheadPerUnit)} / unit`;
    netProfitVal.textContent = formatCurrency(netProfitPerUnit * quantity);
    netProfitVal.style.color = netProfitPerUnit >= 0 ? 'var(--success)' : 'var(--error)';

    netMarginBadge.textContent = `Net Margin: ${netMarginPct.toFixed(1)}%`;
    netMarginBadge.style.color = netMarginPct >= 0 ? 'var(--success)' : 'var(--error)';

    // Render Quick Reference Matrix
    renderReferenceMatrix(cost, marginPct);
  }

  // Render Matrix Table
  const standardMargins = [5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55, 60, 65, 70, 75, 80];

  function renderReferenceMatrix(currentCost, activeMarginPct) {
    matrixTbody.innerHTML = '';
    const fragment = document.createDocumentFragment();

    standardMargins.forEach(m => {
      const requiredPrice = currentCost / (1 - m / 100);
      const eqMarkup = (m / (100 - m)) * 100;
      const profit = requiredPrice - currentCost;
      const isActive = Math.abs(m - activeMarginPct) < 2.5;

      const tr = document.createElement('tr');
      if (isActive) tr.classList.add('active-row');

      tr.innerHTML = `
        <td style="font-weight: 700; color: var(--accent);">${m}%</td>
        <td>${eqMarkup.toFixed(1)}%</td>
        <td style="font-weight: 600;">${formatCurrency(requiredPrice)}</td>
        <td style="color: var(--success);">${formatCurrency(profit)}</td>
      `;
      fragment.appendChild(tr);
    });

    matrixTbody.appendChild(fragment);
  }

  // Export Matrix CSV
  function exportCSV() {
    const cost = parseFloat(cogsInput.value) || 40;
    const headers = ['Target Margin (%)', 'Markup (%)', 'Required Selling Price ($)', 'Gross Profit ($)'];
    const csvRows = [headers.join(',')];

    standardMargins.forEach(m => {
      const reqPrice = cost / (1 - m / 100);
      const eqMarkup = (m / (100 - m)) * 100;
      const profit = reqPrice - cost;
      csvRows.push([
        `${m}%`,
        eqMarkup.toFixed(2),
        reqPrice.toFixed(2),
        profit.toFixed(2)
      ].join(','));
    });

    const csvContent = 'data:text/csv;charset=utf-8,' + encodeURIComponent(csvRows.join('\n'));
    const link = document.createElement('a');
    link.setAttribute('href', csvContent);
    link.setAttribute('download', `profit-margin-matrix-${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  // Event Listeners - Modes
  tabModePrice.addEventListener('click', () => setMode('price'));
  tabModeMargin.addEventListener('click', () => setMode('margin'));
  tabModeMarkup.addEventListener('click', () => setMode('markup'));

  // Inputs
  cogsInput.addEventListener('input', () => {
    updateChipActiveState('preset-cost', cogsInput.value);
    calculateProfit();
  });

  priceInput.addEventListener('input', () => {
    updateChipActiveState('preset-price', priceInput.value);
    calculateProfit();
  });

  marginInput.addEventListener('input', () => {
    updateChipActiveState('preset-margin', marginInput.value);
    calculateProfit();
  });

  markupInput.addEventListener('input', () => {
    updateChipActiveState('preset-markup', markupInput.value);
    calculateProfit();
  });

  quantityInput.addEventListener('input', () => {
    updateChipActiveState('preset-qty', quantityInput.value);
    calculateProfit();
  });

  // Overhead inputs
  overheadShipping.addEventListener('input', calculateProfit);
  overheadGatewayPct.addEventListener('input', calculateProfit);
  overheadMarketing.addEventListener('input', calculateProfit);
  overheadFixed.addEventListener('input', calculateProfit);

  // Preset Chips
  document.querySelectorAll('[data-preset-cost]').forEach(btn => {
    btn.addEventListener('click', () => {
      const val = btn.getAttribute('data-preset-cost');
      cogsInput.value = val;
      updateChipActiveState('preset-cost', val);
      calculateProfit();
    });
  });

  document.querySelectorAll('[data-preset-price]').forEach(btn => {
    btn.addEventListener('click', () => {
      const val = btn.getAttribute('data-preset-price');
      priceInput.value = val;
      updateChipActiveState('preset-price', val);
      calculateProfit();
    });
  });

  document.querySelectorAll('[data-preset-margin]').forEach(btn => {
    btn.addEventListener('click', () => {
      const val = btn.getAttribute('data-preset-margin');
      marginInput.value = val;
      updateChipActiveState('preset-margin', val);
      calculateProfit();
    });
  });

  document.querySelectorAll('[data-preset-markup]').forEach(btn => {
    btn.addEventListener('click', () => {
      const val = btn.getAttribute('data-preset-markup');
      markupInput.value = val;
      updateChipActiveState('preset-markup', val);
      calculateProfit();
    });
  });

  document.querySelectorAll('[data-preset-qty]').forEach(btn => {
    btn.addEventListener('click', () => {
      const val = btn.getAttribute('data-preset-qty');
      quantityInput.value = val;
      updateChipActiveState('preset-qty', val);
      calculateProfit();
    });
  });

  function updateChipActiveState(attribute, value) {
    document.querySelectorAll(`[data-${attribute}]`).forEach(el => {
      if (el.getAttribute(`data-${attribute}`) === String(value)) {
        el.classList.add('active');
      } else {
        el.classList.remove('active');
      }
    });
  }

  // Reset to Defaults
  btnResetPm.addEventListener('click', () => {
    cogsInput.value = 40.00;
    priceInput.value = 100.00;
    marginInput.value = 60.0;
    markupInput.value = 150.0;
    quantityInput.value = 1;

    overheadShipping.value = 5.00;
    overheadGatewayPct.value = 2.9;
    overheadMarketing.value = 7.00;
    overheadFixed.value = 0.00;

    updateChipActiveState('preset-cost', 40);
    updateChipActiveState('preset-price', 100);
    updateChipActiveState('preset-qty', 1);

    setMode('price');
  });

  btnExportMarginCsv.addEventListener('click', exportCSV);

  // Initial Calculation
  calculateProfit();
});