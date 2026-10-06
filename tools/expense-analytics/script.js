// Operational Expense & Runway Analytics Logic
// Client-side calculations, budget variance audits, SVG donut distribution, and recommendations.

(function () {
  'use strict';

  // Preset Datasets
  const PRESETS = {
    seed: [
      { name: 'Core Team Salaries & Benefits', type: 'Fixed', budget: 38000, actual: 40500 },
      { name: 'Office Space & Coworking', type: 'Fixed', budget: 4500, actual: 4500 },
      { name: 'Cloud & AWS Infrastructure', type: 'Variable', budget: 5000, actual: 7200 },
      { name: 'SaaS Tooling & AI APIs', type: 'Fixed', budget: 2800, actual: 3400 },
      { name: 'Paid Ads & Lead Acquisition', type: 'Variable', budget: 8000, actual: 9500 },
      { name: 'Legal, Tax & Compliance', type: 'Fixed', budget: 1500, actual: 1200 },
      { name: 'Contractor Engineering Support', type: 'Variable', budget: 6000, actual: 5500 },
      { name: 'Travel, Dinners & Offsites', type: 'Variable', budget: 2000, actual: 3800 }
    ],
    bootstrap: [
      { name: 'Founder Salaries', type: 'Fixed', budget: 12000, actual: 12000 },
      { name: 'Hosting & Server Infrastructure', type: 'Variable', budget: 1200, actual: 1450 },
      { name: 'Software & Developer Subscriptions', type: 'Fixed', budget: 800, actual: 920 },
      { name: 'Freelance Content & SEO', type: 'Variable', budget: 2500, actual: 2200 },
      { name: 'Targeted Search Ads', type: 'Variable', budget: 3000, actual: 3100 },
      { name: 'Stripe & Gateway Processing Fees', type: 'Variable', budget: 1100, actual: 1350 }
    ],
    agency: [
      { name: 'Account Managers & Creatives', type: 'Fixed', budget: 28000, actual: 28000 },
      { name: 'Studio Lease & Utilities', type: 'Fixed', budget: 3500, actual: 3500 },
      { name: 'Client Performance Ad Reserves', type: 'Variable', budget: 25000, actual: 28500 },
      { name: 'Freelance Video & 3D Specialists', type: 'Variable', budget: 6500, actual: 8200 },
      { name: 'Creative Cloud & MarTech SaaS', type: 'Fixed', budget: 2200, actual: 2400 },
      { name: 'Pitch Travel & Client Hospitality', type: 'Variable', budget: 1800, actual: 2900 }
    ]
  };

  // State
  let expenseItems = JSON.parse(JSON.stringify(PRESETS.seed));
  let cashBalance = 250000;
  let currentPreset = 'seed';

  // Formatters
  const currencyFormatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0
  });

  function formatCurrency(val) {
    return currencyFormatter.format(val || 0);
  }

  function formatPct(val) {
    if (!isFinite(val) || isNaN(val)) return '0.0%';
    const sign = val > 0 ? '+' : '';
    return sign + val.toFixed(1) + '%';
  }

  function updateDashboard() {
    if (!expenseItems || expenseItems.length === 0) {
      renderEmptyState();
      return;
    }

    let totalBudget = 0;
    let totalActual = 0;
    let totalFixed = 0;
    let totalVariable = 0;

    const evaluatedItems = expenseItems.map(item => {
      const budget = Math.max(0, Number(item.budget) || 0);
      const actual = Math.max(0, Number(item.actual) || 0);
      const variance = actual - budget;
      const varPct = budget > 0 ? (variance / budget) * 100 : (actual > 0 ? 100 : 0);

      totalBudget += budget;
      totalActual += actual;

      if (item.type === 'Fixed') {
        totalFixed += actual;
      } else {
        totalVariable += actual;
      }

      return {
        ...item,
        budget,
        actual,
        variance,
        varPct
      };
    });

    // Burn rate
    const monthlyBurn = totalActual;

    // Runway
    const runwayMonths = monthlyBurn > 0 ? (cashBalance / monthlyBurn) : 999;

    // Projected Zero-Cash Date
    const zeroDate = new Date();
    zeroDate.setDate(zeroDate.getDate() + Math.round(runwayMonths * 30.4375));
    const zeroDateStr = runwayMonths > 120 ? 'Perpetual Runway' : zeroDate.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });

    // Net variance
    const netVariance = totalActual - totalBudget;
    const netVarPct = totalBudget > 0 ? (netVariance / totalBudget) * 100 : 0;

    // Fixed vs Variable %
    const fixedPct = totalActual > 0 ? (totalFixed / totalActual) * 100 : 0;
    const variablePct = totalActual > 0 ? (totalVariable / totalActual) * 100 : 0;

    // Update Hero Stats
    document.getElementById('stat-burn-rate').textContent = formatCurrency(monthlyBurn);
    document.getElementById('stat-burn-budget-sub').textContent = `Target Budget: ${formatCurrency(totalBudget)}/mo`;

    const runwayElem = document.getElementById('stat-runway-months');
    if (runwayMonths >= 999) {
      runwayElem.textContent = '∞ Months';
    } else {
      runwayElem.textContent = `${runwayMonths.toFixed(1)} Mo`;
    }
    document.getElementById('stat-zero-cash-date').textContent = `Zero-Cash Horizon: ${zeroDateStr}`;

    const statNetVar = document.getElementById('stat-net-variance');
    const badgeVar = document.getElementById('badge-variance-status');
    statNetVar.textContent = formatCurrency(Math.abs(netVariance));

    if (netVariance > 0) {
      badgeVar.className = 'variance-badge over';
      badgeVar.innerHTML = `▲ +${formatCurrency(netVariance)} (+${netVarPct.toFixed(1)}%) Over Budget`;
    } else if (netVariance < 0) {
      badgeVar.className = 'variance-badge under';
      badgeVar.innerHTML = `▼ ${formatCurrency(Math.abs(netVariance))} (${Math.abs(netVarPct).toFixed(1)}%) Under Budget`;
    } else {
      badgeVar.className = 'variance-badge exact';
      badgeVar.innerHTML = `✔ Exactly On Budget`;
    }

    document.getElementById('stat-cost-ratio').textContent = `${fixedPct.toFixed(0)}% / ${variablePct.toFixed(0)}%`;

    // Render Table
    renderTable(evaluatedItems);

    // Render Donut Chart
    renderDonutChart(evaluatedItems, totalActual, totalFixed, totalVariable);

    // Render Alerts & Recommendations
    renderRecommendations({
      cashBalance,
      monthlyBurn,
      runwayMonths,
      netVariance,
      netVarPct,
      fixedPct,
      variablePct,
      evaluatedItems
    });

    document.getElementById('expense-count-label').textContent = `${evaluatedItems.length} Line Items`;
  }

  // Render Table
  function renderTable(items) {
    const tbody = document.getElementById('expense-table-body');
    tbody.innerHTML = '';

    items.forEach((item, index) => {
      const tr = document.createElement('tr');

      const isOver = item.variance > 0;
      const isUnder = item.variance < 0;

      let varColor = 'var(--text-tertiary)';
      let varSign = '';
      if (isOver) {
        varColor = '#ef4444';
        varSign = '+';
      } else if (isUnder) {
        varColor = '#10b981';
      }

      const varDollarFormatted = formatCurrency(item.variance);
      const varPctFormatted = (item.varPct > 0 ? '+' : '') + item.varPct.toFixed(1) + '%';

      tr.innerHTML = `
        <td>
          <input type="text" class="table-input-cell" style="text-align: left; font-family: var(--font-sans);" data-idx="${index}" data-field="name" value="${escapeHtml(item.name)}">
        </td>
        <td>
          <select class="table-input-cell" style="text-align: left; font-size: 0.75rem;" data-idx="${index}" data-field="type">
            <option value="Fixed" ${item.type === 'Fixed' ? 'selected' : ''}>Fixed</option>
            <option value="Variable" ${item.type === 'Variable' ? 'selected' : ''}>Variable</option>
          </select>
        </td>
        <td>
          <input type="number" class="table-input-cell" data-idx="${index}" data-field="budget" value="${item.budget}" min="0" step="50">
        </td>
        <td>
          <input type="number" class="table-input-cell" data-idx="${index}" data-field="actual" value="${item.actual}" min="0" step="50">
        </td>
        <td style="font-family: monospace; font-weight: 600; color: ${varColor};">
          ${varSign}${varDollarFormatted}
        </td>
        <td style="font-family: monospace; font-size: 0.8rem; color: ${varColor}; font-weight: 600;">
          ${varPctFormatted}
        </td>
        <td style="text-align: center;">
          <button type="button" class="action-btn-icon" data-del="${index}" title="Remove Item" aria-label="Remove Item">
            <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
          </button>
        </td>
      `;
      tbody.appendChild(tr);
    });

    // Cell edit listeners
    tbody.querySelectorAll('.table-input-cell').forEach(input => {
      input.addEventListener('change', onCellEdit);
    });

    // Delete item listeners
    tbody.querySelectorAll('[data-del]').forEach(btn => {
      btn.addEventListener('click', () => {
        const delIdx = parseInt(btn.getAttribute('data-del'), 10);
        expenseItems.splice(delIdx, 1);
        updateDashboard();
      });
    });
  }

  function onCellEdit(e) {
    const idx = parseInt(e.target.getAttribute('data-idx'), 10);
    const field = e.target.getAttribute('data-field');
    const val = (field === 'name' || field === 'type') ? e.target.value : (parseFloat(e.target.value) || 0);

    if (expenseItems[idx]) {
      expenseItems[idx][field] = val;
      updateDashboard();
    }
  }

  // Interactive SVG Donut Chart
  function renderDonutChart(items, totalActual, totalFixed, totalVariable) {
    const wrapper = document.getElementById('svg-donut-wrapper');
    const legend = document.getElementById('donut-legend-list');

    if (!wrapper || totalActual <= 0) {
      wrapper.innerHTML = '<div style="color:var(--text-tertiary); font-size:0.85rem;">No spend data to chart</div>';
      if (legend) legend.innerHTML = '';
      return;
    }

    // Palette shades
    const fixedColors = ['#4e85bf', '#3b6f9e', '#6ba1d6', '#2b5277', '#8bb4df'];
    const variableColors = ['#f59e0b', '#d97706', '#fbbf24', '#b45309', '#fcd34d'];

    let fixedColorIdx = 0;
    let variableColorIdx = 0;

    const chartItems = items.filter(d => d.actual > 0);
    let cumulativeAngle = 0;

    const size = 240;
    const center = size / 2;
    const outerRadius = 90;
    const innerRadius = 55;

    let pathsSvg = '';

    chartItems.forEach((d) => {
      const share = d.actual / totalActual;
      const sliceAngle = share * 2 * Math.PI;

      const startAngle = cumulativeAngle;
      const endAngle = cumulativeAngle + sliceAngle;
      cumulativeAngle = endAngle;

      // Color selection
      const color = d.type === 'Fixed'
        ? fixedColors[fixedColorIdx++ % fixedColors.length]
        : variableColors[variableColorIdx++ % variableColors.length];

      d.color = color;

      // Calculate path arc points
      const x1 = center + outerRadius * Math.sin(startAngle);
      const y1 = center - outerRadius * Math.cos(startAngle);
      const x2 = center + outerRadius * Math.sin(endAngle);
      const y2 = center - outerRadius * Math.cos(endAngle);

      const ix1 = center + innerRadius * Math.sin(endAngle);
      const iy1 = center - innerRadius * Math.cos(endAngle);
      const ix2 = center + innerRadius * Math.sin(startAngle);
      const iy2 = center - innerRadius * Math.cos(startAngle);

      const largeArc = sliceAngle > Math.PI ? 1 : 0;

      // Path command
      let dPath;
      if (chartItems.length === 1) {
        // Full circle special case
        dPath = `
          M ${center} ${center - outerRadius}
          A ${outerRadius} ${outerRadius} 0 1 1 ${center} ${center + outerRadius}
          A ${outerRadius} ${outerRadius} 0 1 1 ${center} ${center - outerRadius}
          M ${center} ${center - innerRadius}
          A ${innerRadius} ${innerRadius} 0 1 0 ${center} ${center + innerRadius}
          A ${innerRadius} ${innerRadius} 0 1 0 ${center} ${center - innerRadius}
          Z
        `;
      } else {
        dPath = `
          M ${x1} ${y1}
          A ${outerRadius} ${outerRadius} 0 ${largeArc} 1 ${x2} ${y2}
          L ${ix1} ${iy1}
          A ${innerRadius} ${innerRadius} 0 ${largeArc} 0 ${ix2} ${iy2}
          Z
        `;
      }

      pathsSvg += `
        <path d="${dPath}" fill="${color}" stroke="var(--surface)" stroke-width="1.5" style="cursor: pointer; transition: opacity 0.2s;" opacity="0.95">
          <title>${escapeHtml(d.name)} (${d.type}): ${formatCurrency(d.actual)} (${(share * 100).toFixed(1)}%)</title>
        </path>
      `;
    });

    const svg = `
      <svg viewBox="0 0 ${size} ${size}" width="${size}" height="${size}" style="overflow: visible; font-family: var(--font-sans);" role="img" aria-label="Cost Distribution Donut">
        ${pathsSvg}
        <!-- Donut Center Text -->
        <text x="${center}" y="${center - 6}" font-size="16" font-weight="700" fill="var(--text-primary)" text-anchor="middle" font-family="var(--font-sans)">${formatCurrency(totalActual)}</text>
        <text x="${center}" y="${center + 14}" font-size="10" fill="var(--text-secondary)" text-anchor="middle">Monthly Burn</text>
      </svg>
    `;

    wrapper.innerHTML = svg;

    // Render mini legend
    if (legend) {
      legend.innerHTML = '';
      chartItems.slice(0, 6).forEach(d => {
        const itemEl = document.createElement('div');
        itemEl.style.display = 'flex';
        itemEl.style.alignItems = 'center';
        itemEl.style.gap = '0.35rem';
        itemEl.innerHTML = `
          <span style="width: 8px; height: 8px; border-radius: 2px; background: ${d.color}; flex-shrink: 0;"></span>
          <span style="overflow: hidden; text-overflow: ellipsis; white-space: nowrap; color: var(--text-secondary); max-width: 90px;" title="${escapeHtml(d.name)}">${escapeHtml(d.name)}</span>
          <span style="font-weight: 600; margin-left: auto;">${((d.actual / totalActual) * 100).toFixed(0)}%</span>
        `;
        legend.appendChild(itemEl);
      });
    }
  }

  // Cost reduction alerts and smart audits
  function renderRecommendations(stats) {
    const container = document.getElementById('alerts-container');
    container.innerHTML = '';

    const alerts = [];

    // 1. Runway Critical / Health Checks
    if (stats.runwayMonths < 3) {
      alerts.push({
        type: 'danger',
        title: 'Critical Runway Alert (< 3 Months Remaining)',
        message: `At the current burn rate of ${formatCurrency(stats.monthlyBurn)}/mo, cash reserves will deplete in approximately <strong>${stats.runwayMonths.toFixed(1)} months</strong>. Immediate measures: freeze non-essential variable contracts, defer discretionary CapEx, and initiate bridge financing.`
      });
    } else if (stats.runwayMonths < 6) {
      alerts.push({
        type: 'warning',
        title: 'Runway Caution: Under 6 Months Buffer',
        message: `Current runway is <strong>${stats.runwayMonths.toFixed(1)} months</strong>. Venture standard dictates kicking off fundraising or cash optimization when runway drops beneath 6 months.`
      });
    } else if (stats.runwayMonths >= 18) {
      alerts.push({
        type: 'success',
        title: 'Strong Capital Runway (> 18 Months)',
        message: `Healthy runway of <strong>${stats.runwayMonths.toFixed(1)} months</strong>. Strong financial resilience allows for deliberate R&D roadmap execution and strategic hiring.`
      });
    }

    // 2. Over-budget line items inspection
    const severeOverruns = stats.evaluatedItems.filter(item => item.variance > 0 && item.varPct > 15 && item.variance >= 500);
    if (severeOverruns.length > 0) {
      const itemNames = severeOverruns.map(i => `<strong>${escapeHtml(i.name)}</strong> (+${formatCurrency(i.variance)} / +${i.varPct.toFixed(0)}%)`).join(', ');
      alerts.push({
        type: 'danger',
        title: 'Budget Variance Overrun Detected',
        message: `The following line items exceeded their budgeted allocation by >15%: ${itemNames}. Audit invoice discrepancies or renegotiate vendor contracts.`
      });
    }

    // 3. Cost structure flexibility audit
    if (stats.fixedPct > 75) {
      alerts.push({
        type: 'info',
        title: 'High Fixed Cost Rigidity (75%+)',
        message: `Fixed commitments account for <strong>${stats.fixedPct.toFixed(1)}%</strong> of monthly burn. High structural fixed overhead reduces flexibility during downturns. Consider utilizing on-demand contractors for future expansions.`
      });
    } else if (stats.variablePct > 50) {
      alerts.push({
        type: 'info',
        title: 'High Variable Cost Agility',
        message: `Variable spending represents <strong>${stats.variablePct.toFixed(1)}%</strong> of total burn. If revenues compress, the company has agile levers to trim burn rate immediately without headcount reduction.`
      });
    }

    // 4. Net Variance overall
    if (stats.netVariance <= 0) {
      alerts.push({
        type: 'success',
        title: 'Disciplined Budgetary Adherence',
        message: `Operational spending is currently tracking <strong>${formatCurrency(Math.abs(stats.netVariance))}</strong> below budgeted projections. Commendable budget discipline.`
      });
    }

    alerts.forEach(alert => {
      const card = document.createElement('div');
      card.className = `alert-card ${alert.type}`;
      card.innerHTML = `
        <div style="flex-shrink: 0; padding-top: 2px;">
          ${alert.type === 'danger' ? '⛔' : alert.type === 'warning' ? '⚠️' : alert.type === 'success' ? '✅' : '💡'}
        </div>
        <div>
          <div style="font-weight: 600; margin-bottom: 0.2rem;">${alert.title}</div>
          <div style="color: var(--text-secondary); font-size: 0.8rem;">${alert.message}</div>
        </div>
      `;
      container.appendChild(card);
    });
  }

  // Export CSV
  function exportCSV() {
    if (!expenseItems || expenseItems.length === 0) return;

    let csv = 'Expense Item,Cost Type,Budgeted ($),Actual ($),Variance ($),Variance %,Status\r\n';

    expenseItems.forEach(item => {
      const budget = Number(item.budget) || 0;
      const actual = Number(item.actual) || 0;
      const variance = actual - budget;
      const varPct = budget > 0 ? ((variance / budget) * 100).toFixed(1) + '%' : '0.0%';
      const status = variance > 0 ? 'Over Budget' : variance < 0 ? 'Under Budget' : 'On Target';

      const cleanName = `"${item.name.replace(/"/g, '""')}"`;
      csv += `${cleanName},${item.type},${budget},${actual},${variance},${varPct},${status}\r\n`;
    });

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `expense_analytics_report_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  function renderEmptyState() {
    document.getElementById('expense-table-body').innerHTML = `
      <tr><td colspan="7" style="text-align:center; padding: 2rem; color: var(--text-tertiary);">No expense items recorded. Load a preset or add items above.</td></tr>
    `;
    document.getElementById('svg-donut-wrapper').innerHTML = '';
  }

  function escapeHtml(str) {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  // Initialization
  document.addEventListener('DOMContentLoaded', () => {
    // Preset buttons
    const presetSeed = document.getElementById('preset-seed');
    const presetBootstrap = document.getElementById('preset-bootstrap');
    const presetAgency = document.getElementById('preset-agency');

    function setPreset(key, btn) {
      document.querySelectorAll('.preset-chip').forEach(c => c.classList.remove('active'));
      btn.classList.add('active');
      expenseItems = JSON.parse(JSON.stringify(PRESETS[key]));
      currentPreset = key;
      updateDashboard();
    }

    if (presetSeed) presetSeed.addEventListener('click', () => setPreset('seed', presetSeed));
    if (presetBootstrap) presetBootstrap.addEventListener('click', () => setPreset('bootstrap', presetBootstrap));
    if (presetAgency) presetAgency.addEventListener('click', () => setPreset('agency', presetAgency));

    // Cash Balance input
    const cashInput = document.getElementById('input-cash-balance');
    if (cashInput) {
      cashInput.addEventListener('input', (e) => {
        cashBalance = Math.max(0, parseFloat(e.target.value) || 0);
        updateDashboard();
      });
    }

    // Add Item Form
    const addForm = document.getElementById('add-expense-form');
    if (addForm) {
      addForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const name = document.getElementById('new-item-name').value.trim();
        const type = document.getElementById('new-item-type').value;
        const budget = parseFloat(document.getElementById('new-item-budget').value) || 0;
        const actual = parseFloat(document.getElementById('new-item-actual').value) || 0;

        if (!name) return;

        expenseItems.push({ name, type, budget, actual });
        addForm.reset();
        document.getElementById('new-item-type').value = 'Fixed';
        updateDashboard();
      });
    }

    // Export CSV
    const btnExport = document.getElementById('btn-export-csv');
    if (btnExport) btnExport.addEventListener('click', exportCSV);

    // Reset Data
    const btnReset = document.getElementById('btn-reset-data');
    if (btnReset) {
      btnReset.addEventListener('click', () => {
        expenseItems = JSON.parse(JSON.stringify(PRESETS[currentPreset] || PRESETS.seed));
        cashBalance = 250000;
        if (cashInput) cashInput.value = '250000';
        updateDashboard();
      });
    }

    // Initial render
    updateDashboard();
  });
})();