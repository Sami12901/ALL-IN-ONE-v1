// Multi-Level Profitability & Breakeven Analytics Suite
// Client-side financial calculations, breakeven sensitivity, SVG waterfall chart, and P&L export.

(function () {
  'use strict';

  // Presets
  const PRESETS = {
    saas: {
      units: 1200,
      price: 150,
      cogsUnit: 22.5,
      opexRd: 28000,
      opexSm: 35000,
      opexGa: 14000,
      depr: 6000,
      interest: 1500,
      taxRate: 21
    },
    ecommerce: {
      units: 3500,
      price: 65,
      cogsUnit: 36,
      opexRd: 6000,
      opexSm: 42000,
      opexGa: 12000,
      depr: 4500,
      interest: 2200,
      taxRate: 21
    },
    consulting: {
      units: 450,
      price: 420,
      cogsUnit: 145,
      opexRd: 8000,
      opexSm: 18000,
      opexGa: 22000,
      depr: 2500,
      interest: 1200,
      taxRate: 21
    }
  };

  // State
  let model = JSON.parse(JSON.stringify(PRESETS.saas));
  let volumeSliderOffset = 0; // %
  let priceSliderOffset = 0;  // %

  // Formatters
  const currencyFormatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0
  });

  const compactFormatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    notation: 'compact',
    maximumFractionDigits: 1
  });

  function formatCurrency(val) {
    return currencyFormatter.format(val || 0);
  }

  function formatCompact(val) {
    return compactFormatter.format(val || 0);
  }

  function formatPct(val) {
    if (!isFinite(val) || isNaN(val)) return '0.0%';
    return val.toFixed(1) + '%';
  }

  function updateDashboard() {
    // Effective Values based on simulator sliders
    const effectiveUnits = Math.max(1, Math.round(model.units * (1 + volumeSliderOffset / 100)));
    const effectivePrice = Math.max(0.01, model.price * (1 + priceSliderOffset / 100));
    const cogsUnit = Math.max(0, model.cogsUnit);

    // Primary P&L Calculations
    const revenue = effectiveUnits * effectivePrice;
    const cogsTotal = effectiveUnits * cogsUnit;
    const grossProfit = revenue - cogsTotal;
    const grossMarginPct = revenue > 0 ? (grossProfit / revenue) * 100 : 0;

    const opexTotal = model.opexRd + model.opexSm + model.opexGa;
    const ebit = grossProfit - opexTotal;
    const operatingMarginPct = revenue > 0 ? (ebit / revenue) * 100 : 0;

    const ebitda = ebit + model.depr;
    const ebitdaMarginPct = revenue > 0 ? (ebitda / revenue) * 100 : 0;

    const ebt = ebit - model.interest;
    const taxExpense = ebt > 0 ? ebt * (model.taxRate / 100) : 0;
    const netProfit = ebt - taxExpense;
    const netMarginPct = revenue > 0 ? (netProfit / revenue) * 100 : 0;

    // Unit Contribution & Breakeven
    const unitContribution = effectivePrice - cogsUnit;
    const contributionMarginRatio = effectivePrice > 0 ? (unitContribution / effectivePrice) * 100 : 0;

    // Fixed overhead (OPEX + Interest + Depr)
    const fixedCosts = opexTotal + model.interest + model.depr;
    let breakevenUnits = 0;
    let breakevenRevenue = 0;
    let marginOfSafetyPct = 0;

    if (unitContribution > 0) {
      breakevenUnits = Math.ceil(fixedCosts / unitContribution);
      breakevenRevenue = breakevenUnits * effectivePrice;
      marginOfSafetyPct = effectiveUnits > 0 ? ((effectiveUnits - breakevenUnits) / effectiveUnits) * 100 : 0;
    }

    // Degree of Operating Leverage (DOL)
    const dol = ebit > 0 ? (grossProfit / ebit) : 0;

    // Update Hero Stats
    document.getElementById('stat-gross-profit').textContent = formatCurrency(grossProfit);
    const badgeGross = document.getElementById('badge-gross-margin');
    badgeGross.textContent = `${formatPct(grossMarginPct)} Gross Margin`;
    badgeGross.className = `margin-badge ${grossMarginPct >= 70 ? 'high' : grossMarginPct >= 40 ? 'medium' : 'low'}`;

    document.getElementById('stat-ebit').textContent = formatCurrency(ebit);
    const badgeEbit = document.getElementById('badge-ebit-margin');
    badgeEbit.textContent = `${formatPct(operatingMarginPct)} EBIT Margin`;
    badgeEbit.className = `margin-badge ${operatingMarginPct >= 20 ? 'high' : operatingMarginPct >= 10 ? 'medium' : 'low'}`;

    document.getElementById('stat-ebitda').textContent = formatCurrency(ebitda);
    document.getElementById('stat-ebitda-sub').textContent = `${formatPct(ebitdaMarginPct)} EBITDA Margin (${formatCompact(ebitda)}/yr)`;

    document.getElementById('stat-net-profit').textContent = formatCurrency(netProfit);
    const badgeNet = document.getElementById('badge-net-margin');
    badgeNet.textContent = `${formatPct(netMarginPct)} Net Margin`;
    badgeNet.className = `margin-badge ${netMarginPct >= 15 ? 'high' : netMarginPct > 0 ? 'medium' : 'low'}`;

    // Update Breakeven & Sensitivity Simulator Labels
    const volSign = volumeSliderOffset > 0 ? '+' : '';
    document.getElementById('sim-volume-label').textContent = `${volSign}${volumeSliderOffset}% (${effectiveUnits.toLocaleString()} units)`;

    const priceSign = priceSliderOffset > 0 ? '+' : '';
    document.getElementById('sim-price-label').textContent = `${priceSign}${priceSliderOffset}% ($${effectivePrice.toFixed(2)})`;

    if (unitContribution <= 0) {
      document.getElementById('sim-be-units').textContent = 'Negative Margin';
      document.getElementById('sim-be-revenue').textContent = 'Price below variable COGS';
      document.getElementById('sim-safety-margin').textContent = 'Unviable';
      document.getElementById('sim-safety-margin').style.color = '#ef4444';
      document.getElementById('sim-safety-desc').textContent = 'Per-unit loss incurred';
    } else {
      document.getElementById('sim-be-units').textContent = `${breakevenUnits.toLocaleString()} Units`;
      document.getElementById('sim-be-revenue').textContent = `${formatCurrency(breakevenRevenue)} Revenue Target`;

      const safetyElem = document.getElementById('sim-safety-margin');
      safetyElem.textContent = `${marginOfSafetyPct >= 0 ? '+' : ''}${marginOfSafetyPct.toFixed(1)}%`;
      if (marginOfSafetyPct >= 30) {
        safetyElem.style.color = '#10b981';
        document.getElementById('sim-safety-desc').textContent = 'Substantial buffer above breakeven';
      } else if (marginOfSafetyPct >= 0) {
        safetyElem.style.color = '#f59e0b';
        document.getElementById('sim-safety-desc').textContent = 'Operating close to breakeven';
      } else {
        safetyElem.style.color = '#ef4444';
        document.getElementById('sim-safety-desc').textContent = 'Operating at a loss (below breakeven)';
      }
    }

    // Health snapshot
    document.getElementById('stat-unit-contribution').textContent = `${formatCurrency(unitContribution)} / unit`;
    document.getElementById('stat-unit-ratio').textContent = `${formatPct(contributionMarginRatio)} of selling price`;
    document.getElementById('stat-op-leverage').textContent = dol > 0 ? `${dol.toFixed(2)}x` : 'N/A';

    // Render SVG Waterfall
    renderWaterfall({
      revenue,
      cogsTotal,
      grossProfit,
      opexTotal,
      ebit,
      belowEbit: (model.interest + taxExpense),
      netProfit
    });

    // Render P&L Table
    renderPnlTable({
      revenue,
      cogsTotal,
      grossProfit,
      opexRd: model.opexRd,
      opexSm: model.opexSm,
      opexGa: model.opexGa,
      ebitda,
      depr: model.depr,
      ebit,
      interest: model.interest,
      ebt,
      taxExpense,
      netProfit
    });
  }

  // Interactive SVG Waterfall Chart
  function renderWaterfall(d) {
    const container = document.getElementById('svg-waterfall-wrapper');
    if (!container) return;

    const width = 640;
    const height = 230;
    const padding = { top: 25, right: 30, bottom: 40, left: 55 };

    const chartW = width - padding.left - padding.right;
    const chartH = height - padding.top - padding.bottom;

    const maxVal = Math.max(d.revenue, Math.abs(d.grossProfit), 1000);
    const yMax = Math.ceil((maxVal * 1.1) / 10000) * 10000;

    const steps = [
      { name: 'Revenue', val: d.revenue, bottom: 0, height: d.revenue, type: 'total', color: '#10b981' },
      { name: 'COGS', val: -d.cogsTotal, bottom: Math.max(0, d.grossProfit), height: d.cogsTotal, type: 'minus', color: '#ef4444' },
      { name: 'Gross Profit', val: d.grossProfit, bottom: 0, height: d.grossProfit, type: 'subtotal', color: '#4e85bf' },
      { name: 'OPEX', val: -d.opexTotal, bottom: Math.max(0, d.ebit), height: d.opexTotal, type: 'minus', color: '#ef4444' },
      { name: 'EBIT', val: d.ebit, bottom: 0, height: Math.max(0, d.ebit), type: 'subtotal', color: '#4e85bf' },
      { name: 'Tax & Int.', val: -d.belowEbit, bottom: Math.max(0, d.netProfit), height: d.belowEbit, type: 'minus', color: '#ef4444' },
      { name: 'Net Profit', val: d.netProfit, bottom: 0, height: Math.abs(d.netProfit), type: 'final', color: d.netProfit >= 0 ? '#10b981' : '#ef4444' }
    ];

    const n = steps.length;
    const colWidth = chartW / n;
    const barWidth = Math.max(14, colWidth * 0.58);

    const getX = (i) => padding.left + i * colWidth + colWidth / 2;
    const getY = (val) => padding.top + chartH - (val / yMax) * chartH;

    let svg = `<svg viewBox="0 0 ${width} ${height}" style="width: 100%; height: auto; overflow: visible; font-family: var(--font-sans);" role="img" aria-label="Waterfall Chart">`;

    // Horizontal grid
    for (let t = 0; t <= 4; t++) {
      const val = (yMax / 4) * t;
      const yPos = getY(val);
      svg += `
        <line x1="${padding.left}" y1="${yPos}" x2="${width - padding.right}" y2="${yPos}" stroke="var(--border)" stroke-width="1" stroke-dasharray="${t === 0 ? '0' : '4,4'}" opacity="0.6" />
        <text x="${padding.left - 8}" y="${yPos + 4}" font-size="10" fill="var(--text-tertiary)" text-anchor="end">${compactFormatter.format(val)}</text>
      `;
    }

    // Render bars and connect lines
    steps.forEach((step, idx) => {
      const cx = getX(idx);
      const bx = cx - barWidth / 2;
      const barH = Math.max(2, (step.height / yMax) * chartH);
      const by = getY(step.bottom + step.height);

      svg += `
        <g style="cursor: pointer;">
          <rect x="${bx}" y="${by}" width="${barWidth}" height="${barH}" fill="${step.color}" rx="3" opacity="0.9">
            <title>${step.name}: ${formatCurrency(step.val)}</title>
          </rect>
          <text x="${cx}" y="${by - 6}" font-size="9.5" font-weight="600" fill="var(--text-primary)" text-anchor="middle" font-family="monospace">${compactFormatter.format(step.val)}</text>
          <text x="${cx}" y="${height - 14}" font-size="10.5" fill="var(--text-secondary)" text-anchor="middle" font-weight="500">${escapeHtml(step.name)}</text>
        </g>
      `;

      // Dashed connector to next bar
      if (idx < steps.length - 1) {
        const nextCx = getX(idx + 1);
        const nextBx = nextCx - barWidth / 2;
        let connectY;
        if (step.type === 'total' || step.type === 'subtotal') {
          connectY = getY(step.height);
        } else {
          connectY = getY(step.bottom);
        }
        svg += `
          <line x1="${bx + barWidth}" y1="${connectY}" x2="${nextBx}" y2="${connectY}" stroke="var(--text-tertiary)" stroke-width="1" stroke-dasharray="2,2" opacity="0.5" />
        `;
      }
    });

    svg += `</svg>`;
    container.innerHTML = svg;
  }

  // Render standardized P&L Table
  function renderPnlTable(d) {
    const tbody = document.getElementById('pnl-table-body');
    tbody.innerHTML = '';

    const pnlRows = [
      { name: 'Gross Revenue', val: d.revenue, highlight: true },
      { name: 'Less: Cost of Goods Sold (COGS)', val: -d.cogsTotal, highlight: false },
      { name: 'Gross Profit', val: d.grossProfit, highlight: true },
      { name: 'Less: Research & Development (R&D)', val: -d.opexRd, highlight: false },
      { name: 'Less: Sales & Marketing (S&M)', val: -d.opexSm, highlight: false },
      { name: 'Less: General & Administrative (G&A)', val: -d.opexGa, highlight: false },
      { name: 'Operating Income / EBIT', val: d.ebit, highlight: true },
      { name: 'Plus: Depreciation & Amortization', val: d.depr, highlight: false },
      { name: 'EBITDA (Cash Proxy)', val: d.ebitda, highlight: true },
      { name: 'Less: Interest Expense', val: -d.interest, highlight: false },
      { name: 'Earnings Before Tax (EBT)', val: d.ebt, highlight: false },
      { name: 'Less: Income Tax Expense', val: -d.taxExpense, highlight: false },
      { name: 'Net Income / Net Profit', val: d.netProfit, highlight: true }
    ];

    pnlRows.forEach(row => {
      const tr = document.createElement('tr');
      if (row.highlight) tr.classList.add('highlight-row');

      const pct = d.revenue > 0 ? (row.val / d.revenue) * 100 : 0;
      const isNegative = row.val < 0;
      const displayVal = formatCurrency(row.val);
      const displayPct = formatPct(pct);

      tr.innerHTML = `
        <td style="${row.highlight ? 'color: var(--text-primary); font-weight:700;' : 'color: var(--text-secondary);'}">
          ${escapeHtml(row.name)}
        </td>
        <td style="color: ${isNegative ? '#ef4444' : row.highlight ? 'var(--text-primary)' : 'var(--text-secondary)'}; font-weight: ${row.highlight ? '700' : '500'};">
          ${displayVal}
        </td>
        <td style="color: var(--text-tertiary);">
          ${displayPct}
        </td>
      `;
      tbody.appendChild(tr);
    });
  }

  // Export CSV
  function exportPnlCSV() {
    const effectiveUnits = Math.max(1, Math.round(model.units * (1 + volumeSliderOffset / 100)));
    const effectivePrice = Math.max(0.01, model.price * (1 + priceSliderOffset / 100));
    const revenue = effectiveUnits * effectivePrice;
    const cogsTotal = effectiveUnits * model.cogsUnit;
    const grossProfit = revenue - cogsTotal;
    const ebit = grossProfit - (model.opexRd + model.opexSm + model.opexGa);
    const ebitda = ebit + model.depr;
    const ebt = ebit - model.interest;
    const tax = ebt > 0 ? ebt * (model.taxRate / 100) : 0;
    const netProfit = ebt - tax;

    let csv = 'Income Statement Line Item,Amount ($),% of Revenue\r\n';
    const rows = [
      ['Gross Revenue', revenue],
      ['COGS', -cogsTotal],
      ['Gross Profit', grossProfit],
      ['R&D Expenses', -model.opexRd],
      ['Sales & Marketing', -model.opexSm],
      ['General & Admin', -model.opexGa],
      ['Operating Profit (EBIT)', ebit],
      ['Depreciation & Amortization', model.depr],
      ['EBITDA', ebitda],
      ['Interest Expense', -model.interest],
      ['Tax Expense', -tax],
      ['Net Profit', netProfit]
    ];

    rows.forEach(([item, val]) => {
      const pct = revenue > 0 ? ((val / revenue) * 100).toFixed(1) + '%' : '0.0%';
      csv += `"${item}",${val},${pct}\r\n`;
    });

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `profitability_pnl_report_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  function escapeHtml(str) {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  // DOM initialization
  document.addEventListener('DOMContentLoaded', () => {
    // Presets
    const presetSaas = document.getElementById('preset-saas');
    const presetEcom = document.getElementById('preset-ecommerce');
    const presetConsult = document.getElementById('preset-consulting');

    function applyPreset(key, btn) {
      document.querySelectorAll('.preset-chip').forEach(c => c.classList.remove('active'));
      btn.classList.add('active');
      model = JSON.parse(JSON.stringify(PRESETS[key]));

      // Populate input elements
      document.getElementById('inp-units').value = model.units;
      document.getElementById('inp-price').value = model.price;
      document.getElementById('inp-cogs-unit').value = model.cogsUnit;
      document.getElementById('inp-opex-rd').value = model.opexRd;
      document.getElementById('inp-opex-sm').value = model.opexSm;
      document.getElementById('inp-opex-ga').value = model.opexGa;
      document.getElementById('inp-depr').value = model.depr;
      document.getElementById('inp-interest').value = model.interest;
      document.getElementById('inp-tax-rate').value = model.taxRate;
      document.getElementById('val-tax-rate').textContent = `${model.taxRate}%`;

      // Reset sliders
      volumeSliderOffset = 0;
      priceSliderOffset = 0;
      document.getElementById('sim-volume-slider').value = 0;
      document.getElementById('sim-price-slider').value = 0;

      updateDashboard();
    }

    if (presetSaas) presetSaas.addEventListener('click', () => applyPreset('saas', presetSaas));
    if (presetEcom) presetEcom.addEventListener('click', () => applyPreset('ecommerce', presetEcom));
    if (presetConsult) presetConsult.addEventListener('click', () => applyPreset('consulting', presetConsult));

    // Input listeners
    const inputsMap = [
      { id: 'inp-units', key: 'units' },
      { id: 'inp-price', key: 'price' },
      { id: 'inp-cogs-unit', key: 'cogsUnit' },
      { id: 'inp-opex-rd', key: 'opexRd' },
      { id: 'inp-opex-sm', key: 'opexSm' },
      { id: 'inp-opex-ga', key: 'opexGa' },
      { id: 'inp-depr', key: 'depr' },
      { id: 'inp-interest', key: 'interest' }
    ];

    inputsMap.forEach(({ id, key }) => {
      const el = document.getElementById(id);
      if (el) {
        el.addEventListener('input', (e) => {
          model[key] = parseFloat(e.target.value) || 0;
          updateDashboard();
        });
      }
    });

    const taxInput = document.getElementById('inp-tax-rate');
    if (taxInput) {
      taxInput.addEventListener('input', (e) => {
        model.taxRate = parseFloat(e.target.value) || 0;
        document.getElementById('val-tax-rate').textContent = `${model.taxRate}%`;
        updateDashboard();
      });
    }

    // Sliders
    const volSlider = document.getElementById('sim-volume-slider');
    if (volSlider) {
      volSlider.addEventListener('input', (e) => {
        volumeSliderOffset = parseInt(e.target.value, 10);
        updateDashboard();
      });
    }

    const priceSlider = document.getElementById('sim-price-slider');
    if (priceSlider) {
      priceSlider.addEventListener('input', (e) => {
        priceSliderOffset = parseInt(e.target.value, 10);
        updateDashboard();
      });
    }

    const btnResetSliders = document.getElementById('btn-reset-sliders');
    if (btnResetSliders) {
      btnResetSliders.addEventListener('click', () => {
        volumeSliderOffset = 0;
        priceSliderOffset = 0;
        if (volSlider) volSlider.value = 0;
        if (priceSlider) priceSlider.value = 0;
        updateDashboard();
      });
    }

    // Export CSV
    const btnExport = document.getElementById('btn-export-pnl-csv');
    if (btnExport) btnExport.addEventListener('click', exportPnlCSV);

    // Initial render
    updateDashboard();
  });
})();