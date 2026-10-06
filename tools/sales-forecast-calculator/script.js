// Sales Forecast Calculator - Client-side Revenue Trajectory & SVG Chart Engine

document.addEventListener('DOMContentLoaded', () => {
  // --- DOM Elements ---
  const inputBaseMrr = document.getElementById('input-base-mrr');
  const inputGrowthRate = document.getElementById('input-growth-rate');
  const inputChurnRate = document.getElementById('input-churn-rate');
  const inputSalesCycle = document.getElementById('input-sales-cycle');
  const inputArpu = document.getElementById('input-arpu');
  const selectSeasonality = document.getElementById('select-seasonality');
  const rangeTimeline = document.getElementById('range-timeline');
  const lblHorizon = document.getElementById('lbl-horizon');

  // Milestone outputs
  const valM3Rev = document.getElementById('val-m3-rev');
  const valM3Arr = document.getElementById('val-m3-arr');
  const valM3Cust = document.getElementById('val-m3-cust');

  const valM6Rev = document.getElementById('val-m6-rev');
  const valM6Arr = document.getElementById('val-m6-arr');
  const valM6Cust = document.getElementById('val-m6-cust');

  const valM12Rev = document.getElementById('val-m12-rev');
  const valM12Arr = document.getElementById('val-m12-arr');
  const valM12Cust = document.getElementById('val-m12-cust');

  // Table & Summary
  const tableBody = document.getElementById('table-body');
  const lblTotalCum = document.getElementById('lbl-total-cum');
  const lblNetExpansion = document.getElementById('lbl-net-expansion');
  const lblNetCust = document.getElementById('lbl-net-cust');

  // Chart Elements
  const forecastSvg = document.getElementById('forecast-svg');
  const chartTooltip = document.getElementById('chart-tooltip');
  const svgChartBox = document.getElementById('svg-chart-box');

  // Actions & Presets
  const btnCopy = document.getElementById('btn-copy-forecast');
  const btnCopyTable = document.getElementById('btn-copy-table');
  const btnExport = document.getElementById('btn-export-csv');
  const scenarioButtons = document.querySelectorAll('.preset-chip-btn');

  // Seasonality Multipliers (12-month array, cycled if timeline > 12)
  const seasonalityProfiles = {
    flat: [1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0],
    q4surge: [0.98, 0.98, 1.0, 1.0, 0.99, 1.0, 1.0, 0.99, 1.02, 1.10, 1.20, 1.28],
    b2bcycle: [0.95, 0.98, 1.05, 1.02, 1.08, 1.12, 0.88, 0.86, 1.04, 1.08, 1.18, 1.25],
    springpeak: [0.98, 1.02, 1.15, 1.22, 1.20, 1.05, 0.95, 0.94, 0.98, 1.02, 1.05, 1.0]
  };

  const scenarios = {
    steady: { mrr: 25000, growth: 8.0, churn: 1.5, cycle: 30, arpu: 250, seasonality: 'q4surge' },
    aggressive: { mrr: 50000, growth: 15.0, churn: 2.5, cycle: 45, arpu: 500, seasonality: 'q4surge' },
    organic: { mrr: 10000, growth: 4.0, churn: 1.0, cycle: 20, arpu: 100, seasonality: 'flat' },
    turnaround: { mrr: 35000, growth: 9.0, churn: 5.5, cycle: 60, arpu: 350, seasonality: 'flat' }
  };

  // Formatters
  const fmtMoney = (n) => {
    if (!isFinite(n) || isNaN(n)) return '$0';
    return (n < 0 ? '-$' : '$') + Math.round(Math.abs(n)).toLocaleString('en-US');
  };
  const fmtNum = (n) => {
    if (!isFinite(n) || isNaN(n)) return '0';
    return Math.round(n).toLocaleString('en-US');
  };
  const fmtPct = (n) => {
    if (!isFinite(n) || isNaN(n)) return '0.0%';
    return (n >= 0 ? '+' : '') + n.toFixed(1) + '%';
  };

  let cachedProjection = [];

  // Core Projection Engine
  function calculateForecast() {
    const baseMrr = Math.max(0, parseFloat(inputBaseMrr.value) || 0);
    const growthPct = Math.max(0, parseFloat(inputGrowthRate.value) || 0) / 100;
    const churnPct = Math.max(0, parseFloat(inputChurnRate.value) || 0) / 100;
    const salesCycle = Math.max(1, parseFloat(inputSalesCycle.value) || 30);
    const arpu = Math.max(1, parseFloat(inputArpu.value) || 1);
    const horizon = parseInt(rangeTimeline.value, 10) || 12;
    const seasonKey = selectSeasonality.value;
    const seasonFactors = seasonalityProfiles[seasonKey] || seasonalityProfiles.flat;

    lblHorizon.textContent = `${horizon} Months`;

    // Sales velocity ramp factor
    const cycleMonths = salesCycle / 30;
    const velocityRamp = (m) => Math.min(1.0, 0.4 + (0.6 * (m / cycleMonths)));

    let currentRev = baseMrr;
    let baseCompounding = baseMrr;
    let initialCust = Math.max(1, Math.round(baseMrr / arpu));
    let lastCust = initialCust;

    const projections = [];
    let cumulativeRev = 0;

    for (let m = 1; m <= horizon; m++) {
      const seasonIndex = (m - 1) % 12;
      const sFactor = seasonFactors[seasonIndex] || 1.0;
      const ramp = velocityRamp(m);

      const effectiveGrowth = growthPct * ramp;
      const netMoMRate = effectiveGrowth - churnPct;

      // Compound the underlying trend
      baseCompounding = baseCompounding * (1 + netMoMRate);
      const monthRev = baseCompounding * sFactor;

      cumulativeRev += monthRev;
      const arr = monthRev * 12;
      const activeCust = Math.max(1, Math.round(monthRev / arpu));
      const newCust = activeCust - lastCust;
      const momGrowth = currentRev > 0 ? ((monthRev - currentRev) / currentRev) * 100 : 0;

      projections.push({
        month: m,
        revenue: monthRev,
        arr: arr,
        activeCust: activeCust,
        newCust: newCust,
        momGrowth: momGrowth,
        seasonFactor: sFactor
      });

      lastCust = activeCust;
      currentRev = monthRev;
    }

    cachedProjection = projections;

    // Update Milestone Cards
    const m3 = projections[2] || projections[projections.length - 1];
    const m6 = projections[5] || projections[projections.length - 1];
    const m12 = projections[11] || projections[projections.length - 1];

    if (m3) {
      valM3Rev.textContent = fmtMoney(m3.revenue);
      valM3Arr.textContent = `ARR Run Rate: ${fmtMoney(m3.arr)}`;
      valM3Cust.textContent = `${fmtNum(m3.activeCust)} Active Customers (${fmtNum(m3.activeCust - initialCust)} net new)`;
    }
    if (m6) {
      valM6Rev.textContent = fmtMoney(m6.revenue);
      valM6Arr.textContent = `ARR Run Rate: ${fmtMoney(m6.arr)}`;
      valM6Cust.textContent = `${fmtNum(m6.activeCust)} Active Customers (${fmtNum(m6.activeCust - initialCust)} net new)`;
    }
    if (m12) {
      valM12Rev.textContent = fmtMoney(m12.revenue);
      valM12Arr.textContent = `ARR Run Rate: ${fmtMoney(m12.arr)}`;
      valM12Cust.textContent = `${fmtNum(m12.activeCust)} Active Customers (${fmtNum(m12.activeCust - initialCust)} net new)`;
    }

    // Table Rendering
    renderTable(projections);

    // Summary Strip
    lblTotalCum.textContent = fmtMoney(cumulativeRev);
    const totalExpansion = baseMrr > 0 ? (((projections[projections.length - 1].revenue - baseMrr) / baseMrr) * 100) : 0;
    lblNetExpansion.textContent = fmtPct(totalExpansion);
    const finalCust = projections[projections.length - 1].activeCust;
    lblNetCust.textContent = `${fmtNum(finalCust - initialCust >= 0 ? finalCust - initialCust : 0)} customers`;

    // Render SVG Line Chart
    renderChart(projections, baseMrr);
  }

  function renderTable(projections) {
    let rowsHtml = '';
    projections.forEach(p => {
      let rowClass = '';
      let tag = '';
      if (p.month === 3) { rowClass = 'row-m3'; tag = '<span class="tag-milestone">Q1</span>'; }
      if (p.month === 6) { rowClass = 'row-m6'; tag = '<span class="tag-milestone">6M</span>'; }
      if (p.month === 12) { rowClass = 'row-m12'; tag = '<span class="tag-milestone">1 Year</span>'; }

      rowsHtml += `
        <tr class="${rowClass}">
          <td>Month ${p.month} ${tag}</td>
          <td style="font-weight: 700;">${fmtMoney(p.revenue)}</td>
          <td>${fmtMoney(p.arr)}</td>
          <td>${fmtNum(p.activeCust)}</td>
          <td>${p.newCust >= 0 ? '+' : ''}${fmtNum(p.newCust)}</td>
          <td style="color: ${p.momGrowth >= 0 ? '#10b981' : '#ef4444'};">${fmtPct(p.momGrowth)}</td>
        </tr>
      `;
    });
    tableBody.innerHTML = rowsHtml;
  }

  function renderChart(projections, baseMrr) {
    const W = 650;
    const H = 260;
    const padL = 65;
    const padR = 25;
    const padT = 30;
    const padB = 40;

    const chartW = W - padL - padR;
    const chartH = H - padT - padB;

    const revenues = projections.map(p => p.revenue);
    const minVal = Math.min(baseMrr * 0.9, ...revenues);
    const maxVal = Math.max(...revenues) * 1.15;
    const valRange = maxVal - minVal || 1;

    const count = projections.length;
    const getX = (i) => padL + (i / (count - 1)) * chartW;
    const getY = (val) => padT + chartH - ((val - minVal) / valRange) * chartH;

    // Gridlines & Y-labels (4 lines)
    let gridSvg = '';
    for (let i = 0; i <= 4; i++) {
      const yVal = minVal + (valRange * (i / 4));
      const yPos = getY(yVal);
      gridSvg += `
        <line x1="${padL}" y1="${yPos}" x2="${W - padR}" y2="${yPos}" stroke="rgba(255,255,255,0.07)" stroke-dasharray="3,3" />
        <text x="${padL - 10}" y="${yPos + 4}" fill="#64748b" font-size="10" text-anchor="end" font-family="var(--font-sans)">${fmtMoney(yVal)}</text>
      `;
    }

    // Base Baseline dashed line
    const baseY = getY(baseMrr);
    const baseLineSvg = `
      <line x1="${padL}" y1="${baseY}" x2="${W - padR}" y2="${baseY}" stroke="rgba(255,255,255,0.25)" stroke-dasharray="4,4" stroke-width="1.2" />
      <text x="${W - padR - 5}" y="${baseY - 6}" fill="#94a3b8" font-size="9" text-anchor="end">Starting MRR (${fmtMoney(baseMrr)})</text>
    `;

    // Trajectory Points
    const points = projections.map((p, i) => ({
      x: getX(i),
      y: getY(p.revenue),
      month: p.month,
      revenue: p.revenue,
      arr: p.arr,
      cust: p.activeCust
    }));

    // Generate Path Data
    let pathD = `M ${points[0].x} ${points[0].y}`;
    for (let i = 1; i < points.length; i++) {
      pathD += ` L ${points[i].x} ${points[i].y}`;
    }

    // Gradient Area
    const areaD = `${pathD} L ${points[points.length - 1].x} ${padT + chartH} L ${points[0].x} ${padT + chartH} Z`;

    // X-axis month labels & circles
    let pointsSvg = '';
    let xLabelsSvg = '';

    points.forEach((pt, i) => {
      const isMilestone = pt.month === 3 || pt.month === 6 || pt.month === 12;
      const r = isMilestone ? 5 : 3.5;
      const strokeCol = isMilestone ? '#ffffff' : 'var(--accent)';
      const fillCol = isMilestone ? 'var(--accent)' : 'var(--bg-primary)';

      pointsSvg += `
        <circle cx="${pt.x}" cy="${pt.y}" r="${r}" fill="${fillCol}" stroke="${strokeCol}" stroke-width="${isMilestone ? 2.5 : 1.5}" class="chart-dot" data-index="${i}" style="cursor: pointer; transition: transform 0.2s;"></circle>
      `;

      // Label every 2nd or 3rd month depending on horizon
      const showLabel = count <= 12 ? (i % 2 === 0 || i === count - 1) : (i % 3 === 0 || i === count - 1);
      if (showLabel) {
        xLabelsSvg += `
          <text x="${pt.x}" y="${H - 12}" fill="#64748b" font-size="10" text-anchor="middle" font-family="var(--font-sans)">M${pt.month}</text>
        `;
      }
    });

    forecastSvg.innerHTML = `
      <defs>
        <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#4e85bf" stop-opacity="0.35"/>
          <stop offset="100%" stop-color="#4e85bf" stop-opacity="0.0"/>
        </linearGradient>
      </defs>
      ${gridSvg}
      ${baseLineSvg}
      <path d="${areaD}" fill="url(#chartGrad)" />
      <path d="${pathD}" fill="none" stroke="#89aacc" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" />
      ${pointsSvg}
      ${xLabelsSvg}
    `;

    // Tooltip interaction
    setupTooltip(points, svgChartBox);
  }

  function setupTooltip(points, container) {
    const dots = forecastSvg.querySelectorAll('.chart-dot');
    dots.forEach(dot => {
      dot.addEventListener('mouseenter', (e) => {
        const idx = parseInt(dot.getAttribute('data-index'), 10);
        const pt = points[idx];
        if (!pt) return;

        chartTooltip.innerHTML = `
          <div style="font-weight: 700; color: var(--accent); margin-bottom: 2px;">Month ${pt.month} Projection</div>
          <div>Monthly Revenue: <strong>${fmtMoney(pt.revenue)}</strong></div>
          <div>ARR Run Rate: <strong>${fmtMoney(pt.arr)}</strong></div>
          <div>Active Customers: <strong>${fmtNum(pt.cust)}</strong></div>
        `;
        chartTooltip.style.display = 'block';

        const rect = container.getBoundingClientRect();
        const svgRect = forecastSvg.getBoundingClientRect();
        const scaleX = svgRect.width / 650;
        const scaleY = svgRect.height / 260;

        const leftPx = pt.x * scaleX;
        const topPx = pt.y * scaleY;

        chartTooltip.style.left = `${leftPx}px`;
        chartTooltip.style.top = `${topPx}px`;
      });

      dot.addEventListener('mouseleave', () => {
        chartTooltip.style.display = 'none';
      });
    });
  }

  // Event Listeners for inputs
  [inputBaseMrr, inputGrowthRate, inputChurnRate, inputSalesCycle, inputArpu, selectSeasonality, rangeTimeline].forEach(el => {
    el.addEventListener('input', calculateForecast);
  });

  // Scenario Buttons
  scenarioButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      scenarioButtons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const scKey = btn.dataset.scenario;
      const sc = scenarios[scKey];
      if (sc) {
        inputBaseMrr.value = sc.mrr;
        inputGrowthRate.value = sc.growth;
        inputChurnRate.value = sc.churn;
        inputSalesCycle.value = sc.cycle;
        inputArpu.value = sc.arpu;
        selectSeasonality.value = sc.seasonality;
        calculateForecast();
      }
    });
  });

  // Copy Summary
  btnCopy.addEventListener('click', async () => {
    const horizon = rangeTimeline.value;
    const summary = [
      `--- Sales & Revenue Forecast Summary (${horizon} Months) ---`,
      `Starting Monthly Revenue: ${fmtMoney(parseFloat(inputBaseMrr.value))}`,
      `Monthly Growth Rate: ${inputGrowthRate.value}% | Churn: ${inputChurnRate.value}%`,
      `Sales Cycle: ${inputSalesCycle.value} days | ARPU: ${fmtMoney(parseFloat(inputArpu.value))}`,
      `Month 3 Projected: ${valM3Rev.textContent} (${valM3Arr.textContent})`,
      `Month 6 Projected: ${valM6Rev.textContent} (${valM6Arr.textContent})`,
      `Month 12 Milestone: ${valM12Rev.textContent} (${valM12Arr.textContent})`,
      `Cumulative Projected Revenue: ${lblTotalCum.textContent}`,
      `Net Trajectory Expansion: ${lblNetExpansion.textContent}`
    ].join('\n');

    try {
      await navigator.clipboard.writeText(summary);
      const orig = btnCopy.innerHTML;
      btnCopy.innerHTML = `✓ Copied!`;
      setTimeout(() => { btnCopy.innerHTML = orig; }, 2000);
    } catch {
      alert('Copied to clipboard!\n\n' + summary);
    }
  });

  // Copy Table
  btnCopyTable.addEventListener('click', async () => {
    if (!cachedProjection.length) return;
    const headers = ['Month', 'Net Revenue', 'ARR Run Rate', 'Active Customers', 'New Customers', 'MoM Growth'];
    const rows = cachedProjection.map(p => [
      `Month ${p.month}`,
      fmtMoney(p.revenue),
      fmtMoney(p.arr),
      fmtNum(p.activeCust),
      fmtNum(p.newCust),
      fmtPct(p.momGrowth)
    ]);

    const tableText = [headers.join('\t'), ...rows.map(r => r.join('\t'))].join('\n');
    try {
      await navigator.clipboard.writeText(tableText);
      const orig = btnCopyTable.textContent;
      btnCopyTable.textContent = `✓ Copied!`;
      setTimeout(() => { btnCopyTable.textContent = orig; }, 2000);
    } catch {
      alert('Table copied to clipboard!');
    }
  });

  // Export CSV
  btnExport.addEventListener('click', () => {
    if (!cachedProjection.length) return;
    const csvContent = [
      ['Month', 'Monthly Revenue', 'ARR Run Rate', 'Active Customers', 'New Customers', 'MoM Growth (%)', 'Seasonality Factor'],
      ...cachedProjection.map(p => [
        p.month,
        Math.round(p.revenue),
        Math.round(p.arr),
        p.activeCust,
        p.newCust,
        p.momGrowth.toFixed(2),
        p.seasonFactor.toFixed(2)
      ])
    ].map(row => row.map(c => `"${c}"`).join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `sales-forecast-projection-${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  });

  // Initial Calculation
  calculateForecast();
});