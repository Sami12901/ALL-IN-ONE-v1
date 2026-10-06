// Break-Even Calculator Implementation
document.addEventListener('DOMContentLoaded', () => {
  // DOM Elements - Inputs
  const fixedCostsInput = document.getElementById('fixed-costs-input');
  const fixedCostsRange = document.getElementById('fixed-costs-range');
  const fixedCostsBadge = document.getElementById('fixed-costs-badge');

  const btnToggleFixedBreakdown = document.getElementById('btn-toggle-fixed-breakdown');
  const fixedBreakdownDrawer = document.getElementById('fixed-breakdown-drawer');
  const costRent = document.getElementById('cost-rent');
  const costSalaries = document.getElementById('cost-salaries');
  const costSoftware = document.getElementById('cost-software');
  const costInsurance = document.getElementById('cost-insurance');
  const btnApplyItemized = document.getElementById('btn-apply-itemized');

  const variableCostInput = document.getElementById('variable-cost-input');
  const variableCostRange = document.getElementById('variable-cost-range');
  const variableCostBadge = document.getElementById('variable-cost-badge');

  const sellingPriceInput = document.getElementById('selling-price-input');
  const sellingPriceRange = document.getElementById('selling-price-range');
  const sellingPriceBadge = document.getElementById('selling-price-badge');

  const customVolumeInput = document.getElementById('custom-volume-input');
  const targetVolumeBadge = document.getElementById('target-volume-badge');

  const btnResetBe = document.getElementById('btn-reset-be');

  // DOM Elements - Outputs & KPIs
  const beAlert = document.getElementById('be-alert');
  const statusTag = document.getElementById('status-tag');
  const kpiBeUnits = document.getElementById('kpi-be-units');
  const kpiBeUnitsSub = document.getElementById('kpi-be-units-sub');
  const kpiBeRevenue = document.getElementById('kpi-be-revenue');
  const kpiContribMargin = document.getElementById('kpi-contrib-margin');
  const kpiContribSub = document.getElementById('kpi-contrib-sub');
  const kpiContribRatio = document.getElementById('kpi-contrib-ratio');

  // DOM Elements - Chart & Table
  const beSvg = document.getElementById('be-svg');
  const chartTooltip = document.getElementById('chart-tooltip');
  const sensitivityTbody = document.getElementById('sensitivity-tbody');
  const btnExportBeCsv = document.getElementById('btn-export-be-csv');

  // State
  let sensitivityRows = [];

  // Currency Formatter
  const formatCurrency = (val, decimals = 2) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals
    }).format(val);
  };

  const formatNumber = (val) => {
    return new Intl.NumberFormat('en-US').format(Math.round(val));
  };

  const formatCompact = (val) => {
    if (val >= 1000000) return `$${(val / 1000000).toFixed(1)}M`;
    if (val >= 1000) return `$${(val / 1000).toFixed(0)}K`;
    return `$${Math.round(val)}`;
  };

  // Calculate Break-Even
  function calculateBreakEven() {
    const fixedCosts = Math.max(0, parseFloat(fixedCostsInput.value) || 0);
    const variableCost = Math.max(0, parseFloat(variableCostInput.value) || 0);
    const sellingPrice = Math.max(0.01, parseFloat(sellingPriceInput.value) || 0);
    const customUnits = Math.max(1, parseInt(customVolumeInput.value, 10) || 1);

    // Update Badges
    fixedCostsBadge.textContent = formatCurrency(fixedCosts, 0);
    variableCostBadge.textContent = formatCurrency(variableCost);
    sellingPriceBadge.textContent = formatCurrency(sellingPrice);
    targetVolumeBadge.textContent = `${formatNumber(customUnits)} Units`;

    const unitContribMargin = sellingPrice - variableCost;
    const contribRatio = sellingPrice > 0 ? (unitContribMargin / sellingPrice) * 100 : 0;

    // Check if profitable
    if (unitContribMargin <= 0) {
      beAlert.classList.remove('hidden');
      statusTag.textContent = 'Deficit / No Break-Even';
      statusTag.style.color = 'var(--error)';

      kpiBeUnits.textContent = 'Impossible';
      kpiBeUnitsSub.textContent = 'Price ≤ Variable Cost';
      kpiBeRevenue.textContent = 'N/A';
      kpiContribMargin.textContent = formatCurrency(unitContribMargin);
      kpiContribMargin.style.color = 'var(--error)';
      kpiContribRatio.textContent = `${contribRatio.toFixed(1)}%`;
      kpiContribRatio.style.color = 'var(--error)';

      sensitivityTbody.innerHTML = `<tr><td colspan="8" style="text-align: center; padding: 2rem; color: var(--error);">Cannot compute sensitivity: Selling price is lower than or equal to variable cost.</td></tr>`;
      beSvg.innerHTML = '';
      return;
    }

    beAlert.classList.add('hidden');
    statusTag.textContent = 'Operational';
    statusTag.style.color = 'var(--accent)';

    const beUnitsExact = fixedCosts / unitContribMargin;
    const beUnitsRounded = Math.ceil(beUnitsExact);
    const beRevenue = beUnitsRounded * sellingPrice;

    // Update KPI UI
    kpiBeUnits.textContent = `${formatNumber(beUnitsRounded)} Units`;
    kpiBeUnitsSub.textContent = `Exact: ${beUnitsExact.toFixed(1)} units`;

    kpiBeRevenue.textContent = formatCurrency(beRevenue, 0);

    kpiContribMargin.textContent = formatCurrency(unitContribMargin);
    kpiContribMargin.style.color = 'var(--success)';
    kpiContribSub.textContent = `${formatCurrency(sellingPrice)} price - ${formatCurrency(variableCost)} cost`;

    kpiContribRatio.textContent = `${contribRatio.toFixed(1)}%`;
    kpiContribRatio.style.color = 'var(--accent)';

    // Generate Sensitivity Scenarios
    generateSensitivity(beUnitsExact, fixedCosts, variableCost, sellingPrice, customUnits);

    // Render SVG Break-Even Chart
    renderChart(beUnitsExact, fixedCosts, variableCost, sellingPrice, customUnits);
  }

  // Generate Sensitivity Analysis
  function generateSensitivity(beUnits, fixedCosts, variableCost, price, customUnits) {
    const percentages = [
      { label: '50% Break-Even Volume', pct: 0.5 },
      { label: '75% Break-Even Volume', pct: 0.75 },
      { label: '100% Break-Even Point', pct: 1.0, isBe: true },
      { label: '125% Break-Even Volume', pct: 1.25 },
      { label: '150% Break-Even Volume', pct: 1.5 },
      { label: '200% Break-Even Volume', pct: 2.0 }
    ];

    sensitivityRows = percentages.map(item => {
      const units = Math.max(1, Math.round(beUnits * item.pct));
      const rev = units * price;
      const vc = units * variableCost;
      const tc = fixedCosts + vc;
      const profit = rev - tc;
      const margin = rev > 0 ? (profit / rev) * 100 : 0;
      return {
        scenario: item.label,
        units,
        revenue: rev,
        vc,
        fc: fixedCosts,
        tc,
        profit,
        margin,
        isBe: item.isBe
      };
    });

    // Add Custom Target Volume Scenario
    const customRev = customUnits * price;
    const customVc = customUnits * variableCost;
    const customTc = fixedCosts + customVc;
    const customProfit = customRev - customTc;
    const customMargin = customRev > 0 ? (customProfit / customRev) * 100 : 0;

    sensitivityRows.push({
      scenario: `Custom Target (${formatNumber(customUnits)} units)`,
      units: customUnits,
      revenue: customRev,
      vc: customVc,
      fc: fixedCosts,
      tc: customTc,
      profit: customProfit,
      margin: customMargin,
      isCustom: true
    });

    // Sort or keep in logical order
    sensitivityTbody.innerHTML = '';
    const fragment = document.createDocumentFragment();

    sensitivityRows.forEach(row => {
      const tr = document.createElement('tr');
      if (row.isBe) tr.classList.add('row-be');
      if (row.isCustom) tr.style.background = 'rgba(78, 133, 191, 0.1)';

      const profitColor = row.profit > 0 ? 'var(--success)' : row.profit < 0 ? 'var(--error)' : 'var(--text-primary)';
      const profitFormatted = row.profit < 0 ? `(${formatCurrency(Math.abs(row.profit))})` : formatCurrency(row.profit);

      tr.innerHTML = `
        <td style="font-weight: 700;">${row.scenario}</td>
        <td>${formatNumber(row.units)}</td>
        <td style="font-weight: 600;">${formatCurrency(row.revenue, 0)}</td>
        <td style="color: var(--text-tertiary);">${formatCurrency(row.vc, 0)}</td>
        <td style="color: var(--text-tertiary);">${formatCurrency(row.fc, 0)}</td>
        <td style="color: #ef4444;">${formatCurrency(row.tc, 0)}</td>
        <td style="font-weight: 800; color: ${profitColor};">${profitFormatted}</td>
        <td style="color: ${profitColor}; font-weight: 600;">${row.margin.toFixed(1)}%</td>
      `;
      fragment.appendChild(tr);
    });

    sensitivityTbody.appendChild(fragment);
  }

  // Render SVG Break-Even Chart
  function renderChart(beUnits, fixedCosts, variableCost, price, customUnits) {
    beSvg.innerHTML = '';
    const width = 600;
    const height = 260;
    const padLeft = 65;
    const padRight = 30;
    const padTop = 25;
    const padBottom = 35;

    const chartW = width - padLeft - padRight;
    const chartH = height - padTop - padBottom;

    const maxUnits = Math.max(beUnits * 2.2, customUnits * 1.25, 20);
    const maxRev = maxUnits * price;
    const maxCost = fixedCosts + maxUnits * variableCost;
    const maxY = Math.max(maxRev, maxCost) * 1.1;

    const getX = (u) => padLeft + (u / maxUnits) * chartW;
    const getY = (dollars) => padTop + chartH - (dollars / maxY) * chartH;

    // Y Grid lines
    const yTicks = 4;
    for (let i = 0; i <= yTicks; i++) {
      const val = (maxY / yTicks) * i;
      const yPos = getY(val);

      const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
      line.setAttribute('x1', padLeft);
      line.setAttribute('y1', yPos);
      line.setAttribute('x2', width - padRight);
      line.setAttribute('y2', yPos);
      line.setAttribute('stroke', 'rgba(255,255,255,0.08)');
      line.setAttribute('stroke-dasharray', '3,3');
      beSvg.appendChild(line);

      const label = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      label.setAttribute('x', padLeft - 8);
      label.setAttribute('y', yPos + 4);
      label.setAttribute('text-anchor', 'end');
      label.setAttribute('fill', 'var(--text-tertiary)');
      label.setAttribute('font-size', '11');
      label.textContent = formatCompact(val);
      beSvg.appendChild(label);
    }

    // X Grid Units
    const xTicks = 4;
    for (let i = 0; i <= xTicks; i++) {
      const u = Math.round((maxUnits / xTicks) * i);
      const xPos = getX(u);

      const label = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      label.setAttribute('x', xPos);
      label.setAttribute('y', height - 10);
      label.setAttribute('text-anchor', 'middle');
      label.setAttribute('fill', 'var(--text-tertiary)');
      label.setAttribute('font-size', '11');
      label.textContent = `${formatNumber(u)}u`;
      beSvg.appendChild(label);
    }

    // Coordinates
    const x0 = getX(0);
    const xEnd = getX(maxUnits);
    const xBE = getX(beUnits);
    const yBE = getY(beUnits * price);

    const yFC = getY(fixedCosts);
    const yCostEnd = getY(fixedCosts + maxUnits * variableCost);
    const yRev0 = getY(0);
    const yRevEnd = getY(maxUnits * price);

    // Loss Zone Polygon (0 to BE: Total Cost > Revenue)
    const lossPoly = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');
    lossPoly.setAttribute('points', `${x0},${yFC} ${xBE},${yBE} ${x0},${yRev0}`);
    lossPoly.setAttribute('fill', 'rgba(239, 68, 68, 0.15)');
    beSvg.appendChild(lossPoly);

    // Profit Zone Polygon (BE to End: Revenue > Total Cost)
    const profitPoly = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');
    profitPoly.setAttribute('points', `${xBE},${yBE} ${xEnd},${yRevEnd} ${xEnd},${yCostEnd}`);
    profitPoly.setAttribute('fill', 'rgba(16, 185, 129, 0.18)');
    beSvg.appendChild(profitPoly);

    // Fixed Cost Line (Dashed)
    const fcLine = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    fcLine.setAttribute('x1', x0);
    fcLine.setAttribute('y1', yFC);
    fcLine.setAttribute('x2', xEnd);
    fcLine.setAttribute('y2', yFC);
    fcLine.setAttribute('stroke', '#6b7280');
    fcLine.setAttribute('stroke-dasharray', '4,4');
    fcLine.setAttribute('stroke-width', '1.5');
    beSvg.appendChild(fcLine);

    // Total Cost Line (Red)
    const tcLine = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    tcLine.setAttribute('x1', x0);
    tcLine.setAttribute('y1', yFC);
    tcLine.setAttribute('x2', xEnd);
    tcLine.setAttribute('y2', yCostEnd);
    tcLine.setAttribute('stroke', '#ef4444');
    tcLine.setAttribute('stroke-width', '2.5');
    beSvg.appendChild(tcLine);

    // Total Revenue Line (Green)
    const revLine = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    revLine.setAttribute('x1', x0);
    revLine.setAttribute('y1', yRev0);
    revLine.setAttribute('x2', xEnd);
    revLine.setAttribute('y2', yRevEnd);
    revLine.setAttribute('stroke', '#10b981');
    revLine.setAttribute('stroke-width', '2.5');
    beSvg.appendChild(revLine);

    // Break-Even Point Circle
    const beCircle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    beCircle.setAttribute('cx', xBE);
    beCircle.setAttribute('cy', yBE);
    beCircle.setAttribute('r', '6');
    beCircle.setAttribute('fill', 'var(--accent)');
    beCircle.setAttribute('stroke', '#ffffff');
    beCircle.setAttribute('stroke-width', '2');
    beSvg.appendChild(beCircle);

    // Break-Even Point Text
    const beLabel = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    beLabel.setAttribute('x', xBE);
    beLabel.setAttribute('y', yBE - 12);
    beLabel.setAttribute('text-anchor', 'middle');
    beLabel.setAttribute('fill', 'var(--accent)');
    beLabel.setAttribute('font-size', '11');
    beLabel.setAttribute('font-weight', 'bold');
    beLabel.textContent = `BE: ${formatNumber(beUnits)}u`;
    beSvg.appendChild(beLabel);

    // Interactive Hover Vertical Guideline
    const hoverLine = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    hoverLine.setAttribute('y1', padTop);
    hoverLine.setAttribute('y2', padTop + chartH);
    hoverLine.setAttribute('stroke', '#ffffff');
    hoverLine.setAttribute('stroke-dasharray', '2,2');
    hoverLine.setAttribute('stroke-width', '1.5');
    hoverLine.setAttribute('style', 'display: none;');
    beSvg.appendChild(hoverLine);

    // Overlay for Mouse Events
    const overlay = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
    overlay.setAttribute('x', padLeft);
    overlay.setAttribute('y', padTop);
    overlay.setAttribute('width', chartW);
    overlay.setAttribute('height', chartH);
    overlay.setAttribute('fill', 'transparent');
    overlay.setAttribute('cursor', 'crosshair');
    beSvg.appendChild(overlay);

    overlay.addEventListener('mousemove', (e) => {
      const rect = beSvg.getBoundingClientRect();
      const mouseX = ((e.clientX - rect.left) / rect.width) * width;
      const clampedX = Math.max(padLeft, Math.min(width - padRight, mouseX));

      const unitsAtX = Math.round(((clampedX - padLeft) / chartW) * maxUnits);
      const revAtX = unitsAtX * price;
      const tcAtX = fixedCosts + unitsAtX * variableCost;
      const profitAtX = revAtX - tcAtX;

      hoverLine.setAttribute('x1', clampedX);
      hoverLine.setAttribute('x2', clampedX);
      hoverLine.setAttribute('style', 'display: block;');

      const pctX = (clampedX / width) * 100;
      const pctY = (getY(Math.max(revAtX, tcAtX)) / height) * 100;

      chartTooltip.style.left = `${pctX}%`;
      chartTooltip.style.top = `${pctY}%`;
      chartTooltip.style.display = 'block';

      const profitColor = profitAtX >= 0 ? '#10b981' : '#ef4444';
      const profitText = profitAtX >= 0 ? `Net Profit: +${formatCurrency(profitAtX)}` : `Net Loss: -${formatCurrency(Math.abs(profitAtX))}`;

      chartTooltip.innerHTML = `
        <div style="font-weight: 700; color: #ffffff; margin-bottom: 0.25rem;">${formatNumber(unitsAtX)} Units</div>
        <div style="color: #10b981;">Revenue: ${formatCurrency(revAtX, 0)}</div>
        <div style="color: #ef4444;">Total Costs: ${formatCurrency(tcAtX, 0)}</div>
        <div style="color: ${profitColor}; font-weight: 700;">${profitText}</div>
      `;
    });

    overlay.addEventListener('mouseleave', () => {
      hoverLine.setAttribute('style', 'display: none;');
      chartTooltip.style.display = 'none';
    });
  }

  // Export Sensitivity CSV
  function exportCSV() {
    if (!sensitivityRows || sensitivityRows.length === 0) {
      alert('No sensitivity data to export.');
      return;
    }

    const headers = ['Scenario', 'Units Sold', 'Revenue ($)', 'Variable Costs ($)', 'Fixed Costs ($)', 'Total Costs ($)', 'Net Profit / Loss ($)', 'Margin (%)'];
    const csvRows = [headers.join(',')];

    sensitivityRows.forEach(r => {
      csvRows.push([
        `"${r.scenario}"`,
        r.units,
        r.revenue.toFixed(2),
        r.vc.toFixed(2),
        r.fc.toFixed(2),
        r.tc.toFixed(2),
        r.profit.toFixed(2),
        r.margin.toFixed(2)
      ].join(','));
    });

    const csvContent = 'data:text/csv;charset=utf-8,' + encodeURIComponent(csvRows.join('\n'));
    const link = document.createElement('a');
    link.setAttribute('href', csvContent);
    link.setAttribute('download', `break-even-sensitivity-${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  // Synchronize Ranges & Inputs
  fixedCostsInput.addEventListener('input', () => {
    fixedCostsRange.value = fixedCostsInput.value;
    updateChipActiveState('preset-fixed', fixedCostsInput.value);
    calculateBreakEven();
  });
  fixedCostsRange.addEventListener('input', () => {
    fixedCostsInput.value = fixedCostsRange.value;
    updateChipActiveState('preset-fixed', fixedCostsRange.value);
    calculateBreakEven();
  });

  variableCostInput.addEventListener('input', () => {
    variableCostRange.value = variableCostInput.value;
    updateChipActiveState('preset-variable', variableCostInput.value);
    calculateBreakEven();
  });
  variableCostRange.addEventListener('input', () => {
    variableCostInput.value = variableCostRange.value;
    updateChipActiveState('preset-variable', variableCostRange.value);
    calculateBreakEven();
  });

  sellingPriceInput.addEventListener('input', () => {
    sellingPriceRange.value = sellingPriceInput.value;
    updateChipActiveState('preset-price', sellingPriceInput.value);
    calculateBreakEven();
  });
  sellingPriceRange.addEventListener('input', () => {
    sellingPriceInput.value = sellingPriceRange.value;
    updateChipActiveState('preset-price', sellingPriceRange.value);
    calculateBreakEven();
  });

  customVolumeInput.addEventListener('input', calculateBreakEven);

  // Preset Chips
  document.querySelectorAll('[data-preset-fixed]').forEach(btn => {
    btn.addEventListener('click', () => {
      const val = btn.getAttribute('data-preset-fixed');
      fixedCostsInput.value = val;
      fixedCostsRange.value = val;
      updateChipActiveState('preset-fixed', val);
      calculateBreakEven();
    });
  });

  document.querySelectorAll('[data-preset-variable]').forEach(btn => {
    btn.addEventListener('click', () => {
      const val = btn.getAttribute('data-preset-variable');
      variableCostInput.value = val;
      variableCostRange.value = val;
      updateChipActiveState('preset-variable', val);
      calculateBreakEven();
    });
  });

  document.querySelectorAll('[data-preset-price]').forEach(btn => {
    btn.addEventListener('click', () => {
      const val = btn.getAttribute('data-preset-price');
      sellingPriceInput.value = val;
      sellingPriceRange.value = val;
      updateChipActiveState('preset-price', val);
      calculateBreakEven();
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

  // Itemized Fixed Overhead Drawer
  btnToggleFixedBreakdown.addEventListener('click', () => {
    const isHidden = fixedBreakdownDrawer.style.display === 'none';
    fixedBreakdownDrawer.style.display = isHidden ? 'block' : 'none';
  });

  btnApplyItemized.addEventListener('click', () => {
    const rent = parseFloat(costRent.value) || 0;
    const salaries = parseFloat(costSalaries.value) || 0;
    const software = parseFloat(costSoftware.value) || 0;
    const insurance = parseFloat(costInsurance.value) || 0;
    const sum = rent + salaries + software + insurance;

    fixedCostsInput.value = sum;
    fixedCostsRange.value = Math.min(fixedCostsRange.max, sum);
    calculateBreakEven();
  });

  // Reset to Defaults
  btnResetBe.addEventListener('click', () => {
    fixedCostsInput.value = 12000;
    fixedCostsRange.value = 12000;
    variableCostInput.value = 25.00;
    variableCostRange.value = 25;
    sellingPriceInput.value = 65.00;
    sellingPriceRange.value = 65;
    customVolumeInput.value = 500;

    updateChipActiveState('preset-fixed', 12000);
    updateChipActiveState('preset-variable', 25);
    updateChipActiveState('preset-price', 65);

    calculateBreakEven();
  });

  btnExportBeCsv.addEventListener('click', exportCSV);

  window.addEventListener('resize', calculateBreakEven);

  // Initial Calculation
  calculateBreakEven();
});