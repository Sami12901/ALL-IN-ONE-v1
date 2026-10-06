// Revenue Analytics Suite
// Client-side analytics, growth modeling, dynamic SVG visualization, and CSV export.

(function () {
  'use strict';

  // Sample Presets
  const PRESETS = {
    saas: [
      { month: 'Jan', sub: 12000, onetime: 2500, services: 3000 },
      { month: 'Feb', sub: 14200, onetime: 2800, services: 3200 },
      { month: 'Mar', sub: 16800, onetime: 3100, services: 3500 },
      { month: 'Apr', sub: 19500, onetime: 3400, services: 4000 },
      { month: 'May', sub: 23100, onetime: 3800, services: 4200 },
      { month: 'Jun', sub: 27000, onetime: 4000, services: 4500 },
      { month: 'Jul', sub: 31500, onetime: 4200, services: 4800 },
      { month: 'Aug', sub: 36200, onetime: 4500, services: 5000 },
      { month: 'Sep', sub: 41000, onetime: 4700, services: 5200 },
      { month: 'Oct', sub: 46800, onetime: 5100, services: 5500 },
      { month: 'Nov', sub: 52400, onetime: 5400, services: 5800 },
      { month: 'Dec', sub: 58900, onetime: 6000, services: 6200 }
    ],
    agency: [
      { month: 'Jan', sub: 18000, onetime: 8000, services: 22000 },
      { month: 'Feb', sub: 19500, onetime: 6500, services: 24000 },
      { month: 'Mar', sub: 21000, onetime: 9000, services: 26500 },
      { month: 'Apr', sub: 22500, onetime: 7500, services: 28000 },
      { month: 'May', sub: 24000, onetime: 11000, services: 29500 },
      { month: 'Jun', sub: 25500, onetime: 8500, services: 31000 },
      { month: 'Jul', sub: 27000, onetime: 10500, services: 33000 },
      { month: 'Aug', sub: 28500, onetime: 9500, services: 34500 },
      { month: 'Sep', sub: 30000, onetime: 12000, services: 36000 },
      { month: 'Oct', sub: 32000, onetime: 11000, services: 38500 },
      { month: 'Nov', sub: 33500, onetime: 13500, services: 40000 },
      { month: 'Dec', sub: 35000, onetime: 14000, services: 42500 }
    ],
    hybrid: [
      { month: 'Jan', sub: 5000, onetime: 34000, services: 3000 },
      { month: 'Feb', sub: 5800, onetime: 31000, services: 3500 },
      { month: 'Mar', sub: 6700, onetime: 42000, services: 4000 },
      { month: 'Apr', sub: 7600, onetime: 38000, services: 3800 },
      { month: 'May', sub: 8900, onetime: 46000, services: 4200 },
      { month: 'Jun', sub: 10200, onetime: 51000, services: 4500 },
      { month: 'Jul', sub: 11500, onetime: 49000, services: 5000 },
      { month: 'Aug', sub: 12800, onetime: 54000, services: 5200 },
      { month: 'Sep', sub: 14200, onetime: 58000, services: 5500 },
      { month: 'Oct', sub: 15800, onetime: 63000, services: 6000 },
      { month: 'Nov', sub: 17500, onetime: 78000, services: 6500 },
      { month: 'Dec', sub: 19500, onetime: 89000, services: 7000 }
    ]
  };

  // State
  let revenueData = JSON.parse(JSON.stringify(PRESETS.saas));
  let currentPreset = 'saas';

  // Formatters
  const currencyFormatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0
  });

  const compactCurrencyFormatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    notation: 'compact',
    maximumFractionDigits: 1
  });

  function formatCurrency(val) {
    return currencyFormatter.format(val || 0);
  }

  function formatCompactCurrency(val) {
    return compactCurrencyFormatter.format(val || 0);
  }

  function formatPct(val) {
    if (!isFinite(val) || isNaN(val)) return '0.0%';
    const sign = val > 0 ? '+' : '';
    return sign + val.toFixed(1) + '%';
  }

  // Recalculate metrics and update DOM
  function updateDashboard() {
    if (!revenueData || revenueData.length === 0) {
      renderEmptyState();
      return;
    }

    let totalRevenue = 0;
    let totalSub = 0;
    let totalOnetime = 0;
    let totalServices = 0;

    const monthlyTotals = revenueData.map((item, idx) => {
      const sub = Number(item.sub) || 0;
      const onetime = Number(item.onetime) || 0;
      const services = Number(item.services) || 0;
      const monthTotal = sub + onetime + services;

      totalRevenue += monthTotal;
      totalSub += sub;
      totalOnetime += onetime;
      totalServices += services;

      let momPct = 0;
      if (idx > 0) {
        const prevTotal = (Number(revenueData[idx - 1].sub) || 0) +
                          (Number(revenueData[idx - 1].onetime) || 0) +
                          (Number(revenueData[idx - 1].services) || 0);
        momPct = prevTotal > 0 ? ((monthTotal - prevTotal) / prevTotal) * 100 : 0;
      }

      return {
        ...item,
        monthTotal,
        momPct
      };
    });

    const n = monthlyTotals.length;
    const latest = monthlyTotals[n - 1];
    const earliest = monthlyTotals[0];

    // Latest MoM Growth
    const latestMoM = n > 1 ? latest.momPct : 0;

    // Compound Monthly Growth Rate (CMGR)
    // CMGR = (Latest / Earliest) ^ (1 / (n - 1)) - 1
    let cmgr = 0;
    if (n > 1 && earliest.monthTotal > 0 && latest.monthTotal > 0) {
      cmgr = (Math.pow(latest.monthTotal / earliest.monthTotal, 1 / (n - 1)) - 1) * 100;
    }

    // Annual Run Rate (ARR)
    // ARR = Latest Month MRR * 12
    const arr = (Number(latest.sub) || 0) * 12;
    const totalRunRate = latest.monthTotal * 12;

    // Update Hero Stats
    document.getElementById('stat-total-revenue').textContent = formatCurrency(totalRevenue);
    document.getElementById('stat-revenue-period').textContent = `Total across ${n} periods (Avg: ${formatCurrency(totalRevenue / n)}/mo)`;
    
    const momElem = document.getElementById('stat-mom-growth');
    const badgeMom = document.getElementById('badge-mom');
    momElem.textContent = formatPct(latestMoM);
    if (latestMoM > 0) {
      badgeMom.className = 'growth-badge positive';
      badgeMom.innerHTML = `▲ MoM Growth`;
    } else if (latestMoM < 0) {
      badgeMom.className = 'growth-badge negative';
      badgeMom.innerHTML = `▼ MoM Contraction`;
    } else {
      badgeMom.className = 'growth-badge neutral';
      badgeMom.innerHTML = `― Baseline`;
    }

    document.getElementById('stat-cmgr').textContent = formatPct(cmgr);
    document.getElementById('stat-arr').textContent = formatCurrency(arr);
    document.getElementById('stat-arr-sub').textContent = `Full Gross Run-Rate: ${formatCompactCurrency(totalRunRate)}/yr`;

    // Stream Contributions
    const subPct = totalRevenue > 0 ? (totalSub / totalRevenue) * 100 : 0;
    const onetimePct = totalRevenue > 0 ? (totalOnetime / totalRevenue) * 100 : 0;
    const servicesPct = totalRevenue > 0 ? (totalServices / totalRevenue) * 100 : 0;

    document.getElementById('bar-sub-pct').style.width = `${subPct}%`;
    document.getElementById('bar-onetime-pct').style.width = `${onetimePct}%`;
    document.getElementById('bar-services-pct').style.width = `${servicesPct}%`;

    document.getElementById('val-sub-total').textContent = formatCurrency(totalSub);
    document.getElementById('pct-sub-total').textContent = `${subPct.toFixed(1)}% of total`;

    document.getElementById('val-onetime-total').textContent = formatCurrency(totalOnetime);
    document.getElementById('pct-onetime-total').textContent = `${onetimePct.toFixed(1)}% of total`;

    document.getElementById('val-services-total').textContent = formatCurrency(totalServices);
    document.getElementById('pct-services-total').textContent = `${servicesPct.toFixed(1)}% of total`;

    const stabilityBadge = document.getElementById('stream-stability-badge');
    if (subPct >= 60) {
      stabilityBadge.textContent = 'High Recurring Stability (SaaS)';
      stabilityBadge.style.color = '#10b981';
    } else if (subPct >= 30) {
      stabilityBadge.textContent = 'Balanced Recurring & Transactional';
      stabilityBadge.style.color = '#89aacc';
    } else {
      stabilityBadge.textContent = 'High Transactional Volatility';
      stabilityBadge.style.color = '#f59e0b';
    }

    // Render Table
    renderTable(monthlyTotals);

    // Render Chart
    renderChart(monthlyTotals);

    // Render Insights
    renderInsights({
      totalRevenue,
      cmgr,
      latestMoM,
      subPct,
      latest,
      earliest,
      arr,
      monthlyTotals,
      n
    });

    document.getElementById('record-count-label').textContent = `${n} Periods Recorded`;
  }

  // Render Table
  function renderTable(monthlyTotals) {
    const tbody = document.getElementById('revenue-table-body');
    tbody.innerHTML = '';

    monthlyTotals.forEach((item, index) => {
      const tr = document.createElement('tr');
      const momDisplay = index === 0 ? '<span style="color:var(--text-tertiary);">―</span>' :
        `<span style="color:${item.momPct >= 0 ? '#10b981' : '#ef4444'}; font-weight:600;">${formatPct(item.momPct)}</span>`;

      tr.innerHTML = `
        <td style="font-weight: 500;">
          <input type="text" class="table-input-cell" style="text-align: left; font-family: var(--font-sans);" data-idx="${index}" data-field="month" value="${escapeHtml(item.month)}">
        </td>
        <td>
          <input type="number" class="table-input-cell" data-idx="${index}" data-field="sub" value="${item.sub}" min="0" step="100">
        </td>
        <td>
          <input type="number" class="table-input-cell" data-idx="${index}" data-field="onetime" value="${item.onetime}" min="0" step="100">
        </td>
        <td>
          <input type="number" class="table-input-cell" data-idx="${index}" data-field="services" value="${item.services}" min="0" step="100">
        </td>
        <td style="font-family: monospace; font-weight: 700; color: var(--text-primary);">
          ${formatCurrency(item.monthTotal)}
        </td>
        <td style="font-family: monospace;">
          ${momDisplay}
        </td>
        <td style="text-align: center;">
          <button type="button" class="action-btn-icon" data-del="${index}" title="Remove Month" aria-label="Remove Month">
            <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
          </button>
        </td>
      `;
      tbody.appendChild(tr);
    });

    // Attach row input change listeners
    tbody.querySelectorAll('.table-input-cell').forEach(input => {
      input.addEventListener('change', onCellEdit);
    });

    // Attach row delete listeners
    tbody.querySelectorAll('[data-del]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const delIdx = parseInt(btn.getAttribute('data-del'), 10);
        if (revenueData.length <= 2) {
          alert('A minimum of 2 periods is required for growth velocity analysis.');
          return;
        }
        revenueData.splice(delIdx, 1);
        updateDashboard();
      });
    });
  }

  function onCellEdit(e) {
    const idx = parseInt(e.target.getAttribute('data-idx'), 10);
    const field = e.target.getAttribute('data-field');
    const val = field === 'month' ? e.target.value.trim() : (parseFloat(e.target.value) || 0);

    if (revenueData[idx]) {
      revenueData[idx][field] = val;
      updateDashboard();
    }
  }

  // Interactive Responsive SVG Chart
  function renderChart(monthlyTotals) {
    const container = document.getElementById('svg-chart-wrapper');
    if (!container || monthlyTotals.length === 0) return;

    const width = 640;
    const height = 240;
    const padding = { top: 25, right: 30, bottom: 35, left: 55 };

    const chartW = width - padding.left - padding.right;
    const chartH = height - padding.top - padding.bottom;

    const maxVal = Math.max(...monthlyTotals.map(d => d.monthTotal), 1000);
    // Round upper y-axis limit nicely
    const yMax = Math.ceil((maxVal * 1.15) / 10000) * 10000;

    const n = monthlyTotals.length;
    const colWidth = chartW / n;
    const barWidth = Math.max(8, Math.min(colWidth * 0.55, 32));

    // Scales
    const getX = (i) => padding.left + i * colWidth + colWidth / 2;
    const getY = (val) => padding.top + chartH - (val / yMax) * chartH;

    // Build SVG
    let svg = `<svg viewBox="0 0 ${width} ${height}" style="width: 100%; height: auto; overflow: visible; font-family: var(--font-sans);" role="img" aria-label="Monthly Revenue Chart">`;

    // Horizontal Grid Lines & Y Labels (4 tiers)
    const tiers = 4;
    for (let t = 0; t <= tiers; t++) {
      const val = (yMax / tiers) * t;
      const yPos = getY(val);
      svg += `
        <line x1="${padding.left}" y1="${yPos}" x2="${width - padding.right}" y2="${yPos}" stroke="var(--border)" stroke-width="1" stroke-dasharray="${t === 0 ? '0' : '4,4'}" opacity="0.6" />
        <text x="${padding.left - 8}" y="${yPos + 4}" font-size="10" fill="var(--text-tertiary)" text-anchor="end">${compactCurrencyFormatter.format(val)}</text>
      `;
    }

    // Stacked Bars
    monthlyTotals.forEach((d, i) => {
      const cx = getX(i);
      const barX = cx - barWidth / 2;

      const subH = (d.sub / yMax) * chartH;
      const onetimeH = (d.onetime / yMax) * chartH;
      const servicesH = (d.services / yMax) * chartH;

      const subY = padding.top + chartH - subH;
      const onetimeY = subY - onetimeH;
      const servicesY = onetimeY - servicesH;

      svg += `
        <g class="chart-col-group" style="cursor: pointer;">
          <!-- Subscriptions Bar (Blue) -->
          <rect x="${barX}" y="${subY}" width="${barWidth}" height="${Math.max(0, subH)}" fill="#4e85bf" rx="2">
            <title>${d.month} Subscriptions: ${formatCurrency(d.sub)}</title>
          </rect>
          <!-- One-Time Bar (Green) -->
          <rect x="${barX}" y="${onetimeY}" width="${barWidth}" height="${Math.max(0, onetimeH)}" fill="#10b981">
            <title>${d.month} One-Time: ${formatCurrency(d.onetime)}</title>
          </rect>
          <!-- Services Bar (Amber) -->
          <rect x="${barX}" y="${servicesY}" width="${barWidth}" height="${Math.max(0, servicesH)}" fill="#f59e0b" rx="2">
            <title>${d.month} Services: ${formatCurrency(d.services)}</title>
          </rect>
          <!-- Month X-Label -->
          <text x="${cx}" y="${height - 12}" font-size="11" fill="var(--text-secondary)" text-anchor="middle" font-weight="500">${escapeHtml(d.month)}</text>
        </g>
      `;
    });

    // Trend Line for Total Revenue
    let pathD = '';
    monthlyTotals.forEach((d, i) => {
      const x = getX(i);
      const y = getY(d.monthTotal);
      if (i === 0) pathD += `M ${x} ${y}`;
      else pathD += ` L ${x} ${y}`;
    });

    svg += `<path d="${pathD}" fill="none" stroke="#e2e8f0" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" opacity="0.9" />`;

    // Trend Points
    monthlyTotals.forEach((d, i) => {
      const x = getX(i);
      const y = getY(d.monthTotal);
      svg += `
        <circle cx="${x}" cy="${y}" r="4" fill="#ffffff" stroke="#4e85bf" stroke-width="2.5">
          <title>${d.month} Total: ${formatCurrency(d.monthTotal)} (${formatPct(d.momPct)} MoM)</title>
        </circle>
      `;
    });

    svg += `</svg>`;
    container.innerHTML = svg;
  }

  // Generate automated analytical insights
  function renderInsights(stats) {
    const list = document.getElementById('insights-list');
    list.innerHTML = '';

    const items = [];

    // 1. Growth trajectory
    if (stats.cmgr > 5) {
      items.push(`<strong>Accelerating Growth:</strong> Sustaining a compound monthly growth rate (CMGR) of <strong>${formatPct(stats.cmgr)}</strong>. At this velocity, monthly revenue doubles every ~${Math.max(1, Math.round(70 / stats.cmgr))} months.`);
    } else if (stats.cmgr > 0) {
      items.push(`<strong>Stable Expansion:</strong> Steady CMGR of <strong>${formatPct(stats.cmgr)}</strong>. Revenue expanded from ${formatCurrency(stats.earliest.monthTotal)} in ${stats.earliest.month} to ${formatCurrency(stats.latest.monthTotal)} in ${stats.latest.month}.`);
    } else {
      items.push(`<strong>Growth Plateau / Contraction:</strong> Negative CMGR of <strong>${formatPct(stats.cmgr)}</strong> across recorded periods. Focus on customer retention and upselling existing accounts.`);
    }

    // 2. Stream concentration
    if (stats.subPct >= 60) {
      items.push(`<strong>Predictable Cash Flow:</strong> Subscription MRR accounts for <strong>${stats.subPct.toFixed(1)}%</strong> of gross revenue. High recurring revenue significantly elevates enterprise valuation multiples.`);
    } else if (stats.subPct >= 30) {
      items.push(`<strong>Hybrid Diversification:</strong> Healthy mix of recurring subscriptions (${stats.subPct.toFixed(1)}%) and upfront sales/services. Consider converting one-off clients into maintenance retainers.`);
    } else {
      items.push(`<strong>Service/Transactional Dependency:</strong> Over <strong>${(100 - stats.subPct).toFixed(1)}%</strong> of revenue stems from one-off sales or services. Transitioning to recurring retainers will stabilize cash flow volatility.`);
    }

    // 3. Forward Projections
    const projectedArr = stats.arr;
    const projected6mMRR = stats.latest.monthTotal * Math.pow(1 + Math.max(0, stats.cmgr) / 100, 6);
    items.push(`<strong>Run-Rate Outlook:</strong> Latest annualized subscription ARR stands at <strong>${formatCurrency(projectedArr)}</strong>. Projected 6-month forward monthly run rate is ~<strong>${formatCurrency(projected6mMRR)}</strong>/mo.`);

    items.forEach(html => {
      const li = document.createElement('li');
      li.innerHTML = html;
      list.appendChild(li);
    });
  }

  // Export CSV
  function exportCSV() {
    if (!revenueData || revenueData.length === 0) return;

    let csv = 'Month,Subscriptions (MRR),One-Time Sales,Consulting & Services,Total Gross Revenue,MoM Growth %\r\n';
    let prevTotal = 0;

    revenueData.forEach((row, idx) => {
      const sub = Number(row.sub) || 0;
      const onetime = Number(row.onetime) || 0;
      const services = Number(row.services) || 0;
      const total = sub + onetime + services;
      const mom = idx === 0 || prevTotal === 0 ? '0.0%' : (((total - prevTotal) / prevTotal) * 100).toFixed(2) + '%';
      prevTotal = total;

      const cleanMonth = `"${row.month.replace(/"/g, '""')}"`;
      csv += `${cleanMonth},${sub},${onetime},${services},${total},${mom}\r\n`;
    });

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `revenue_analytics_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  function renderEmptyState() {
    document.getElementById('revenue-table-body').innerHTML = `
      <tr><td colspan="7" style="text-align:center; padding: 2rem; color: var(--text-tertiary);">No revenue records available. Load a scenario or add rows above.</td></tr>
    `;
    document.getElementById('svg-chart-wrapper').innerHTML = '';
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
    // Presets
    const presetSaas = document.getElementById('preset-saas');
    const presetAgency = document.getElementById('preset-agency');
    const presetHybrid = document.getElementById('preset-hybrid');

    function setPreset(key, btn) {
      document.querySelectorAll('.preset-chip').forEach(c => c.classList.remove('active'));
      btn.classList.add('active');
      revenueData = JSON.parse(JSON.stringify(PRESETS[key]));
      currentPreset = key;
      updateDashboard();
    }

    if (presetSaas) presetSaas.addEventListener('click', () => setPreset('saas', presetSaas));
    if (presetAgency) presetAgency.addEventListener('click', () => setPreset('agency', presetAgency));
    if (presetHybrid) presetHybrid.addEventListener('click', () => setPreset('hybrid', presetHybrid));

    // Form: Add Month
    const addForm = document.getElementById('add-month-form');
    if (addForm) {
      addForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const month = document.getElementById('new-month-name').value.trim();
        const sub = parseFloat(document.getElementById('new-month-sub').value) || 0;
        const onetime = parseFloat(document.getElementById('new-month-onetime').value) || 0;
        const services = parseFloat(document.getElementById('new-month-services').value) || 0;

        if (!month) return;

        revenueData.push({ month, sub, onetime, services });
        addForm.reset();
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
        revenueData = JSON.parse(JSON.stringify(PRESETS[currentPreset] || PRESETS.saas));
        updateDashboard();
      });
    }

    // Initial render
    updateDashboard();
  });
})();