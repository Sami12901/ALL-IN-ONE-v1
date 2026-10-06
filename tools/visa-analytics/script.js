/**
 * Visa Analytics Dashboard
 * Application metrics, approval rates, rejection risk analysis, turnaround times, and fee revenue auditor.
 */

document.addEventListener('DOMContentLoaded', () => {
  // --- DOM Element References ---
  const currencySelect = document.getElementById('currency-select');
  const addVisaForm = document.getElementById('add-visa-form');
  const inputCountry = document.getElementById('input-country');
  const inputCategory = document.getElementById('input-category');
  const inputApps = document.getElementById('input-apps');
  const inputApproved = document.getElementById('input-approved');
  const inputRejected = document.getElementById('input-rejected');
  const inputDays = document.getElementById('input-days');
  const inputRevenue = document.getElementById('input-revenue');

  const filterSearch = document.getElementById('filter-search');
  const filterCategory = document.getElementById('filter-category');
  const visaTableBody = document.getElementById('visa-table-body');
  const recordCountBadge = document.getElementById('record-count-badge');

  const kpiTotalApps = document.getElementById('kpi-total-apps');
  const kpiActiveCountries = document.getElementById('kpi-active-countries');
  const kpiApprovalRate = document.getElementById('kpi-approval-rate');
  const kpiApprovedCount = document.getElementById('kpi-approved-count');
  const kpiRejectionRate = document.getElementById('kpi-rejection-rate');
  const kpiRejectedCount = document.getElementById('kpi-rejected-count');
  const kpiTurnaround = document.getElementById('kpi-turnaround');
  const kpiTotalRevenue = document.getElementById('kpi-total-revenue');
  const kpiAvgRevApp = document.getElementById('kpi-avg-rev-app');
  const kpiPendingCount = document.getElementById('kpi-pending-count');
  const kpiPendingRate = document.getElementById('kpi-pending-rate');

  const riskBannerText = document.getElementById('risk-banner-text');

  const btnViewRates = document.getElementById('btn-view-rates');
  const btnViewRev = document.getElementById('btn-view-rev');
  const visaChartSvg = document.getElementById('visa-chart-svg');
  const chartTooltip = document.getElementById('chart-tooltip');
  const chartLegend = document.getElementById('chart-legend');
  const categorySummaryList = document.getElementById('category-summary-list');

  const btnExportCsv = document.getElementById('btn-export-csv');
  const btnClearAll = document.getElementById('btn-clear-all');
  const btnCopySummary = document.getElementById('btn-copy-summary');

  const presetButtons = document.querySelectorAll('.preset-btn');
  const sortableHeaders = document.querySelectorAll('.visa-table th[data-sort]');

  // --- Initial State & Presets ---
  let currentChartView = 'rates'; // 'rates' | 'rev'
  let sortColumn = 'apps';
  let sortAscending = false;

  let visaRecords = [
    {
      id: 'v-1',
      country: 'Saudi Arabia',
      category: 'Pilgrimage',
      applications: 320,
      approved: 304,
      rejected: 8,
      avgDays: 2.5,
      revenue: 48000
    },
    {
      id: 'v-2',
      country: 'Saudi Arabia',
      category: 'Tourist',
      applications: 180,
      approved: 172,
      rejected: 4,
      avgDays: 1.5,
      revenue: 25200
    },
    {
      id: 'v-3',
      country: 'UAE',
      category: 'Tourist',
      applications: 210,
      approved: 202,
      rejected: 5,
      avgDays: 3.0,
      revenue: 27300
    },
    {
      id: 'v-4',
      country: 'UAE',
      category: 'Business',
      applications: 45,
      approved: 41,
      rejected: 2,
      avgDays: 12.0,
      revenue: 31500
    },
    {
      id: 'v-5',
      country: 'UK',
      category: 'Student',
      applications: 130,
      approved: 116,
      rejected: 9,
      avgDays: 16.0,
      revenue: 71500
    },
    {
      id: 'v-6',
      country: 'France',
      category: 'Tourist',
      applications: 140,
      approved: 114,
      rejected: 20,
      avgDays: 15.0,
      revenue: 28000
    },
    {
      id: 'v-7',
      country: 'Malaysia',
      category: 'Tourist',
      applications: 190,
      approved: 184,
      rejected: 3,
      avgDays: 4.0,
      revenue: 19000
    }
  ];

  const PRESETS = {
    'gcc-middle-east': [
      { id: 'g1', country: 'Saudi Arabia', category: 'Pilgrimage', applications: 350, approved: 336, rejected: 7, avgDays: 2.5, revenue: 52500 },
      { id: 'g2', country: 'Saudi Arabia', category: 'Tourist', applications: 220, approved: 211, rejected: 5, avgDays: 1.5, revenue: 30800 },
      { id: 'g3', country: 'UAE', category: 'Tourist', applications: 240, approved: 231, rejected: 6, avgDays: 3.0, revenue: 31200 },
      { id: 'g4', country: 'UAE', category: 'Business', applications: 55, approved: 50, rejected: 3, avgDays: 12.0, revenue: 38500 },
      { id: 'g5', country: 'Qatar', category: 'Business', applications: 75, approved: 72, rejected: 1, avgDays: 4.0, revenue: 11250 },
      { id: 'g6', country: 'Oman', category: 'Tourist', applications: 95, approved: 92, rejected: 2, avgDays: 2.0, revenue: 7600 }
    ],
    'global-student': [
      { id: 's1', country: 'UK', category: 'Student', applications: 150, approved: 135, rejected: 10, avgDays: 18.0, revenue: 82500 },
      { id: 's2', country: 'Canada', category: 'Student', applications: 120, approved: 90, rejected: 24, avgDays: 35.0, revenue: 54000 },
      { id: 's3', country: 'USA', category: 'Student', applications: 95, approved: 69, rejected: 21, avgDays: 28.0, revenue: 47500 },
      { id: 's4', country: 'Australia', category: 'Student', applications: 105, approved: 86, rejected: 15, avgDays: 22.0, revenue: 57750 },
      { id: 's5', country: 'Malaysia', category: 'Student', applications: 175, approved: 166, rejected: 6, avgDays: 10.0, revenue: 35000 },
      { id: 's6', country: 'Germany', category: 'Student', applications: 80, approved: 72, rejected: 5, avgDays: 25.0, revenue: 20000 }
    ],
    'european-schengen': [
      { id: 'e1', country: 'France', category: 'Tourist', applications: 160, approved: 132, rejected: 22, avgDays: 15.0, revenue: 32000 },
      { id: 'e2', country: 'Germany', category: 'Business', applications: 100, approved: 91, rejected: 6, avgDays: 12.0, revenue: 25000 },
      { id: 'e3', country: 'Italy', category: 'Tourist', applications: 130, approved: 109, rejected: 16, avgDays: 16.0, revenue: 26000 },
      { id: 'e4', country: 'Spain', category: 'Tourist', applications: 115, approved: 98, rejected: 13, avgDays: 14.0, revenue: 23000 },
      { id: 'e5', country: 'Switzerland', category: 'Business', applications: 65, approved: 61, rejected: 2, avgDays: 10.0, revenue: 16250 },
      { id: 'e6', country: 'Netherlands', category: 'Tourist', applications: 85, approved: 74, rejected: 8, avgDays: 13.0, revenue: 17000 }
    ]
  };

  const PALETTE = ['#38bdf8', '#fbbf24', '#34d399', '#c084fc', '#f87171', '#818cf8', '#f472b6', '#4ade80'];

  // --- Formatting Helpers ---
  function getCurrency() {
    return currencySelect ? currencySelect.value : '$';
  }

  function formatMoney(amount) {
    const sym = getCurrency();
    if (isNaN(amount) || !isFinite(amount)) return `${sym}0.00`;
    return `${sym}${Number(amount).toLocaleString('en-US', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    })}`;
  }

  function formatPercent(val) {
    if (isNaN(val) || !isFinite(val)) return '0.0%';
    return `${val.toFixed(1)}%`;
  }

  function formatDays(val) {
    if (isNaN(val) || !isFinite(val)) return '0 Days';
    return `${Number(val).toFixed(1)} Days`;
  }

  // --- Calculations & Analytics ---
  function calculateMetrics() {
    let totalApps = 0;
    let totalApproved = 0;
    let totalRejected = 0;
    let totalPending = 0;
    let totalRevenue = 0;
    let weightedDaysSum = 0;

    const countriesSet = new Set();
    const countryMap = {};
    const categoryMap = {};

    const enriched = visaRecords.map(rec => {
      const apps = rec.applications;
      const apprv = rec.approved;
      const rej = rec.rejected;
      const pending = Math.max(0, apps - (apprv + rej));
      const apprvRate = apps > 0 ? (apprv / apps) * 100 : 0;
      const rejRate = apps > 0 ? (rej / apps) * 100 : 0;
      const pendingRate = apps > 0 ? (pending / apps) * 100 : 0;

      totalApps += apps;
      totalApproved += apprv;
      totalRejected += rej;
      totalPending += pending;
      totalRevenue += rec.revenue;
      weightedDaysSum += rec.avgDays * apps;

      countriesSet.add(rec.country);

      // Group by Country
      if (!countryMap[rec.country]) {
        countryMap[rec.country] = {
          country: rec.country,
          applications: 0,
          approved: 0,
          rejected: 0,
          pending: 0,
          revenue: 0,
          weightedDays: 0
        };
      }
      countryMap[rec.country].applications += apps;
      countryMap[rec.country].approved += apprv;
      countryMap[rec.country].rejected += rej;
      countryMap[rec.country].pending += pending;
      countryMap[rec.country].revenue += rec.revenue;
      countryMap[rec.country].weightedDays += rec.avgDays * apps;

      // Group by Category
      if (!categoryMap[rec.category]) {
        categoryMap[rec.category] = {
          category: rec.category,
          applications: 0,
          approved: 0,
          rejected: 0,
          revenue: 0
        };
      }
      categoryMap[rec.category].applications += apps;
      categoryMap[rec.category].approved += apprv;
      categoryMap[rec.category].rejected += rej;
      categoryMap[rec.category].revenue += rec.revenue;

      return {
        ...rec,
        pending,
        approvalRate: apprvRate,
        rejectionRate: rejRate,
        pendingRate
      };
    });

    const overallApprovalRate = totalApps > 0 ? (totalApproved / totalApps) * 100 : 0;
    const overallRejectionRate = totalApps > 0 ? (totalRejected / totalApps) * 100 : 0;
    const overallPendingRate = totalApps > 0 ? (totalPending / totalApps) * 100 : 0;
    const avgTurnaround = totalApps > 0 ? weightedDaysSum / totalApps : 0;
    const avgRevPerApp = totalApps > 0 ? totalRevenue / totalApps : 0;

    // Process Country Aggregates
    const countryAggregates = Object.values(countryMap).map(c => {
      const rate = c.applications > 0 ? (c.approved / c.applications) * 100 : 0;
      const rejRate = c.applications > 0 ? (c.rejected / c.applications) * 100 : 0;
      const turnaround = c.applications > 0 ? c.weightedDays / c.applications : 0;
      return {
        ...c,
        approvalRate: rate,
        rejectionRate: rejRate,
        turnaround
      };
    });

    // Strategic Insights: find highest risk (highest rejection rate) & fastest/slowest turnaround
    let highestRejection = null;
    let fastestCountry = null;
    let slowestCountry = null;

    if (countryAggregates.length > 0) {
      const sortedByRej = [...countryAggregates].sort((a, b) => b.rejectionRate - a.rejectionRate);
      highestRejection = sortedByRej[0];

      const sortedBySpeed = [...countryAggregates].sort((a, b) => a.turnaround - b.turnaround);
      fastestCountry = sortedBySpeed[0];
      slowestCountry = sortedBySpeed[sortedBySpeed.length - 1];
    }

    return {
      records: enriched,
      totalApps,
      totalApproved,
      totalRejected,
      totalPending,
      totalRevenue,
      overallApprovalRate,
      overallRejectionRate,
      overallPendingRate,
      avgTurnaround,
      avgRevPerApp,
      uniqueCountriesCount: countriesSet.size,
      countryAggregates,
      categoryMap,
      highestRejection,
      fastestCountry,
      slowestCountry
    };
  }

  // --- Update UI ---
  function updateUI() {
    const data = calculateMetrics();

    // 1. KPI Cards
    if (kpiTotalApps) kpiTotalApps.textContent = data.totalApps.toLocaleString();
    if (kpiActiveCountries) kpiActiveCountries.textContent = `${data.uniqueCountriesCount} Destination Countries`;

    if (kpiApprovalRate) kpiApprovalRate.textContent = formatPercent(data.overallApprovalRate);
    if (kpiApprovedCount) kpiApprovedCount.textContent = `${data.totalApproved.toLocaleString()} Visas Approved`;

    if (kpiRejectionRate) kpiRejectionRate.textContent = formatPercent(data.overallRejectionRate);
    if (kpiRejectedCount) kpiRejectedCount.textContent = `${data.totalRejected.toLocaleString()} Visas Rejected`;

    if (kpiTurnaround) kpiTurnaround.textContent = formatDays(data.avgTurnaround);
    if (kpiTotalRevenue) kpiTotalRevenue.textContent = formatMoney(data.totalRevenue);
    if (kpiAvgRevApp) kpiAvgRevApp.textContent = `Avg ${formatMoney(data.avgRevPerApp)} / application`;

    if (kpiPendingCount) kpiPendingCount.textContent = data.totalPending.toLocaleString();
    if (kpiPendingRate) kpiPendingRate.textContent = `${formatPercent(data.overallPendingRate)} in embassy pipeline`;

    if (recordCountBadge) recordCountBadge.textContent = `${visaRecords.length} Cohort${visaRecords.length === 1 ? '' : 's'}`;

    // 2. Risk Insights Banner
    if (riskBannerText) {
      if (data.highestRejection && data.highestRejection.rejectionRate > 10) {
        riskBannerText.innerHTML = `<strong>Attention Required:</strong> High rejection rate for <strong>${data.highestRejection.country}</strong> (${formatPercent(data.highestRejection.rejectionRate)} rejection rate, ${data.highestRejection.rejected} refusals). Review documentation compliance. Fastest turnaround: <strong>${data.fastestCountry.country}</strong> (${formatDays(data.fastestCountry.turnaround)}).`;
      } else if (data.fastestCountry && data.slowestCountry) {
        riskBannerText.innerHTML = `<strong>Portfolio Health:</strong> Approval rate stable at ${formatPercent(data.overallApprovalRate)}. Fastest processing: <strong>${data.fastestCountry.country}</strong> (${formatDays(data.fastestCountry.turnaround)}), Longest queue: <strong>${data.slowestCountry.country}</strong> (${formatDays(data.slowestCountry.turnaround)}).`;
      } else {
        riskBannerText.textContent = `Healthy consular metrics across all active streams.`;
      }
    }

    // 3. Render Table
    renderTable(data);

    // 4. Render Chart
    renderChart(data);

    // 5. Render Category Summary List
    renderCategorySummary(data);
  }

  // --- Render Table with Search, Filter & Sorting ---
  function renderTable(data) {
    if (!visaTableBody) return;
    visaTableBody.innerHTML = '';

    const searchTerm = (filterSearch.value || '').toLowerCase().trim();
    const filterCat = filterCategory.value || 'ALL';

    let filtered = data.records.filter(r => {
      const matchCat = filterCat === 'ALL' || r.category === filterCat;
      const matchSearch = r.country.toLowerCase().includes(searchTerm) || r.category.toLowerCase().includes(searchTerm);
      return matchCat && matchSearch;
    });

    // Sorting
    filtered.sort((a, b) => {
      let valA, valB;
      switch (sortColumn) {
        case 'country': valA = a.country; valB = b.country; break;
        case 'category': valA = a.category; valB = b.category; break;
        case 'apps': valA = a.applications; valB = b.applications; break;
        case 'approvalRate': valA = a.approvalRate; valB = b.approvalRate; break;
        case 'rejectionRate': valA = a.rejectionRate; valB = b.rejectionRate; break;
        case 'days': valA = a.avgDays; valB = b.avgDays; break;
        case 'revenue': valA = a.revenue; valB = b.revenue; break;
        default: valA = a.applications; valB = b.applications;
      }

      if (typeof valA === 'string') {
        return sortAscending ? valA.localeCompare(valB) : valB.localeCompare(valA);
      }
      return sortAscending ? valA - valB : valB - valA;
    });

    if (filtered.length === 0) {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td colspan="8" style="text-align: center; color: var(--text-tertiary); padding: 2rem;">
          No visa records match your filter. Add a new cohort or select a preset template above.
        </td>
      `;
      visaTableBody.appendChild(tr);
      return;
    }

    filtered.forEach(rec => {
      const tr = document.createElement('tr');

      let rateColorClass = 'rate-high';
      if (rec.approvalRate < 75) rateColorClass = 'rate-low';
      else if (rec.approvalRate < 90) rateColorClass = 'rate-medium';

      tr.innerHTML = `
        <td>
          <div style="font-weight: 700; color: var(--text-primary);">${escapeHtml(rec.country)}</div>
          <div style="font-size: 0.7rem; color: var(--text-tertiary);">${rec.pending} pending</div>
        </td>
        <td>
          <span class="category-chip">${rec.category}</span>
        </td>
        <td style="font-weight: 700; font-family: monospace; color: var(--accent);">${rec.applications.toLocaleString()}</td>
        <td>
          <div style="display: flex; align-items: center; gap: 0.5rem;">
            <span style="font-weight: 700; font-family: monospace;">${formatPercent(rec.approvalRate)}</span>
            <span style="font-size: 0.75rem; color: var(--text-tertiary);">(${rec.approved})</span>
          </div>
          <div class="rate-bar-container">
            <div class="rate-bar-fill ${rateColorClass}" style="width: ${Math.min(100, rec.approvalRate)}%;"></div>
          </div>
        </td>
        <td>
          <span style="color: ${rec.rejectionRate > 10 ? '#f87171' : 'var(--text-secondary)'}; font-weight: 600;">
            ${formatPercent(rec.rejectionRate)}
          </span>
          <span style="font-size: 0.75rem; color: var(--text-tertiary);">(${rec.rejected})</span>
        </td>
        <td style="font-family: monospace; color: var(--text-primary);">${rec.avgDays.toFixed(1)} d</td>
        <td style="font-weight: 700; color: #34d399; font-family: monospace;">${formatMoney(rec.revenue)}</td>
        <td style="text-align: right; white-space: nowrap;">
          <button type="button" class="action-icon-btn btn-duplicate" data-id="${rec.id}" title="Duplicate Stream">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
          </button>
          <button type="button" class="action-icon-btn danger btn-delete" data-id="${rec.id}" title="Delete Stream">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
          </button>
        </td>
      `;

      visaTableBody.appendChild(tr);
    });

    // Actions
    visaTableBody.querySelectorAll('.btn-duplicate').forEach(btn => {
      btn.addEventListener('click', () => duplicateRecord(btn.getAttribute('data-id')));
    });

    visaTableBody.querySelectorAll('.btn-delete').forEach(btn => {
      btn.addEventListener('click', () => deleteRecord(btn.getAttribute('data-id')));
    });
  }

  // --- Render Chart ---
  function renderChart(data) {
    if (!visaChartSvg) return;

    if (currentChartView === 'rates') {
      renderRatesBarChart(data);
    } else {
      renderRevenueDonutChart(data);
    }
  }

  // --- Approval Rates Chart by Country ---
  function renderRatesBarChart(data) {
    const width = 380;
    const height = 280;
    const paddingLeft = 65;
    const paddingRight = 35;
    const paddingTop = 25;
    const paddingBottom = 25;

    const chartW = width - paddingLeft - paddingRight;
    const chartH = height - paddingTop - paddingBottom;

    const items = [...data.countryAggregates].slice(0, 6); // Top 6 countries

    if (items.length === 0) {
      visaChartSvg.innerHTML = `<text x="${width/2}" y="${height/2}" text-anchor="middle" fill="var(--text-tertiary)" font-size="12">No visa data available</text>`;
      if (chartLegend) chartLegend.innerHTML = '';
      return;
    }

    const barHeight = Math.min(22, (chartH / items.length) - 8);
    const stepY = chartH / items.length;

    let svg = `
      <defs>
        <linearGradient id="rateGradGreen" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stop-color="#10b981" />
          <stop offset="100%" stop-color="#34d399" />
        </linearGradient>
        <linearGradient id="rateGradYellow" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stop-color="#f59e0b" />
          <stop offset="100%" stop-color="#fbbf24" />
        </linearGradient>
        <linearGradient id="rateGradRed" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stop-color="#ef4444" />
          <stop offset="100%" stop-color="#f87171" />
        </linearGradient>
      </defs>
    `;

    // Benchmark line at 85%
    const benchmarkX = paddingLeft + (chartW * 0.85);
    svg += `
      <line x1="${benchmarkX}" y1="${paddingTop - 10}" x2="${benchmarkX}" y2="${height - paddingBottom}" stroke="#89aacc" stroke-dasharray="3,3" stroke-width="1" opacity="0.6" />
      <text x="${benchmarkX}" y="${paddingTop - 13}" text-anchor="middle" fill="#89aacc" font-size="8.5" font-weight="600">85% Target</text>
    `;

    items.forEach((item, idx) => {
      const y = paddingTop + idx * stepY + (stepY - barHeight) / 2;
      const barW = (Math.min(100, item.approvalRate) / 100) * chartW;

      let grad = 'url(#rateGradGreen)';
      if (item.approvalRate < 75) grad = 'url(#rateGradRed)';
      else if (item.approvalRate < 90) grad = 'url(#rateGradYellow)';

      const nameTrunc = item.country.length > 8 ? item.country.slice(0, 7) + '…' : item.country;

      svg += `
        <g class="chart-rate-bar" data-country="${escapeHtml(item.country)}" data-rate="${formatPercent(item.approvalRate)}" data-apps="${item.applications}" data-rej="${item.rejected}" data-days="${formatDays(item.turnaround)}">
          <!-- Country Name -->
          <text x="${paddingLeft - 8}" y="${y + barHeight / 2 + 3}" text-anchor="end" fill="var(--text-secondary)" font-size="9.5" font-weight="500">
            ${escapeHtml(nameTrunc)}
          </text>
          <!-- Background Track -->
          <rect x="${paddingLeft}" y="${y}" width="${chartW}" height="${barHeight}" rx="3" fill="var(--bg-tertiary)" />
          <!-- Filled Bar -->
          <rect x="${paddingLeft}" y="${y}" width="${barW}" height="${barHeight}" rx="3" fill="${grad}" style="cursor:pointer;" />
          <!-- Label Percentage -->
          <text x="${paddingLeft + barW + 5}" y="${y + barHeight / 2 + 3}" fill="var(--text-primary)" font-size="9" font-family="monospace" font-weight="700">
            ${formatPercent(item.approvalRate)}
          </text>
        </g>
      `;
    });

    visaChartSvg.innerHTML = svg;
    attachRatesTooltips();

    // Legend
    if (chartLegend) {
      chartLegend.innerHTML = `
        <span style="display:inline-flex; align-items:center; gap:0.35rem; color:var(--text-secondary);">
          <span style="width:8px; height:8px; background:#34d399; border-radius:2px;"></span> &gt;90% High Success
        </span>
        <span style="display:inline-flex; align-items:center; gap:0.35rem; color:var(--text-secondary);">
          <span style="width:8px; height:8px; background:#fbbf24; border-radius:2px;"></span> 75-90% Moderate
        </span>
        <span style="display:inline-flex; align-items:center; gap:0.35rem; color:var(--text-secondary);">
          <span style="width:8px; height:8px; background:#f87171; border-radius:2px;"></span> &lt;75% High Risk
        </span>
      `;
    }
  }

  // --- Revenue Donut Chart by Country ---
  function renderRevenueDonutChart(data) {
    const width = 380;
    const height = 280;
    const centerX = width / 2;
    const centerY = height / 2 - 10;
    const radius = 85;
    const innerRadius = 52;

    const countries = data.countryAggregates.filter(c => c.revenue > 0);
    const totalRev = data.totalRevenue;

    if (countries.length === 0 || totalRev <= 0) {
      visaChartSvg.innerHTML = `<text x="${centerX}" y="${centerY}" text-anchor="middle" fill="var(--text-tertiary)" font-size="12">No fee revenue data</text>`;
      if (chartLegend) chartLegend.innerHTML = '';
      return;
    }

    let startAngle = 0;
    let svg = '';

    countries.forEach((c, idx) => {
      const sliceAngle = (c.revenue / totalRev) * 2 * Math.PI;
      const endAngle = startAngle + sliceAngle;
      const color = PALETTE[idx % PALETTE.length];

      const x1 = centerX + radius * Math.cos(startAngle);
      const y1 = centerY + radius * Math.sin(startAngle);
      const x2 = centerX + radius * Math.cos(endAngle);
      const y2 = centerY + radius * Math.sin(endAngle);

      const ix1 = centerX + innerRadius * Math.cos(endAngle);
      const iy1 = centerY + innerRadius * Math.sin(endAngle);
      const ix2 = centerX + innerRadius * Math.cos(startAngle);
      const iy2 = centerY + innerRadius * Math.sin(startAngle);

      const largeArc = sliceAngle > Math.PI ? 1 : 0;
      const pathData = `M ${x1} ${y1} A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2} L ${ix1} ${iy1} A ${innerRadius} ${innerRadius} 0 ${largeArc} 0 ${ix2} ${iy2} Z`;

      const sharePct = (c.revenue / totalRev) * 100;

      svg += `
        <path d="${pathData}" fill="${color}" stroke="var(--surface)" stroke-width="2" class="donut-rev-slice" style="cursor:pointer;"
          data-country="${escapeHtml(c.country)}" data-rev="${formatMoney(c.revenue)}" data-share="${formatPercent(sharePct)}" data-apps="${c.applications}" />
      `;

      startAngle = endAngle;
    });

    // Center text
    svg += `
      <text x="${centerX}" y="${centerY - 6}" text-anchor="middle" fill="var(--text-tertiary)" font-size="9" font-weight="600" text-transform="uppercase">Total Fees</text>
      <text x="${centerX}" y="${centerY + 14}" text-anchor="middle" fill="#34d399" font-size="13" font-weight="800" font-family="monospace">${formatMoney(totalRev)}</text>
    `;

    visaChartSvg.innerHTML = svg;
    attachRevenueDonutTooltips();

    // Legend
    if (chartLegend) {
      chartLegend.innerHTML = countries.map((c, idx) => {
        const color = PALETTE[idx % PALETTE.length];
        const share = ((c.revenue / totalRev) * 100).toFixed(0);
        return `
          <span style="display:inline-flex; align-items:center; gap:0.35rem; color:var(--text-secondary);">
            <span style="width:8px; height:8px; background:${color}; border-radius:50%;"></span> ${c.country} (${share}%)
          </span>
        `;
      }).join('');
    }
  }

  // --- Attach Chart Tooltips ---
  function attachRatesTooltips() {
    const bars = visaChartSvg.querySelectorAll('.chart-rate-bar');
    bars.forEach(b => {
      b.addEventListener('mouseenter', e => {
        const country = b.getAttribute('data-country');
        const rate = b.getAttribute('data-rate');
        const apps = b.getAttribute('data-apps');
        const rej = b.getAttribute('data-rej');
        const days = b.getAttribute('data-days');

        chartTooltip.innerHTML = `
          <div style="font-weight:700; color:var(--accent); margin-bottom:0.25rem;">${country}</div>
          <div><strong>Approval Rate:</strong> <span style="color:#34d399;">${rate}</span></div>
          <div><strong>Total Applications:</strong> ${apps}</div>
          <div><strong>Rejections:</strong> ${rej}</div>
          <div><strong>Turnaround:</strong> ${days}</div>
        `;
        chartTooltip.style.display = 'block';
      });

      b.addEventListener('mousemove', e => {
        const box = visaChartSvg.getBoundingClientRect();
        chartTooltip.style.left = `${e.clientX - box.left + 10}px`;
        chartTooltip.style.top = `${e.clientY - box.top + 10}px`;
      });

      b.addEventListener('mouseleave', () => {
        chartTooltip.style.display = 'none';
      });
    });
  }

  function attachRevenueDonutTooltips() {
    const slices = visaChartSvg.querySelectorAll('.donut-rev-slice');
    slices.forEach(s => {
      s.addEventListener('mouseenter', e => {
        const country = s.getAttribute('data-country');
        const rev = s.getAttribute('data-rev');
        const share = s.getAttribute('data-share');
        const apps = s.getAttribute('data-apps');

        chartTooltip.innerHTML = `
          <div style="font-weight:700; color:var(--accent); margin-bottom:0.25rem;">${country} Revenue</div>
          <div><strong>Total Fees:</strong> <span style="color:#34d399;">${rev}</span></div>
          <div><strong>Portfolio Share:</strong> ${share}</div>
          <div><strong>Volume:</strong> ${apps} apps</div>
        `;
        chartTooltip.style.display = 'block';
      });

      s.addEventListener('mousemove', e => {
        const box = visaChartSvg.getBoundingClientRect();
        chartTooltip.style.left = `${e.clientX - box.left + 10}px`;
        chartTooltip.style.top = `${e.clientY - box.top + 10}px`;
      });

      s.addEventListener('mouseleave', () => {
        chartTooltip.style.display = 'none';
      });
    });
  }

  // --- Category Breakdown List ---
  function renderCategorySummary(data) {
    if (!categorySummaryList) return;
    categorySummaryList.innerHTML = '';

    const categories = Object.values(data.categoryMap);
    if (categories.length === 0) {
      categorySummaryList.innerHTML = `<span style="color:var(--text-tertiary);">No category data available.</span>`;
      return;
    }

    categories.sort((a, b) => b.applications - a.applications);

    categories.forEach(cat => {
      const rate = cat.applications > 0 ? (cat.approved / cat.applications) * 100 : 0;
      const item = document.createElement('div');
      item.style.display = 'flex';
      item.style.justifyContent = 'space-between';
      item.style.alignItems = 'center';
      item.style.padding = '0.4rem 0.6rem';
      item.style.background = 'var(--bg-tertiary)';
      item.style.borderRadius = 'var(--radius-sm)';
      item.style.border = '1px solid var(--border)';

      item.innerHTML = `
        <div>
          <span style="font-weight:600; color:var(--text-primary);">${cat.category}</span>
          <span style="font-size:0.75rem; color:var(--text-tertiary); margin-left:0.5rem;">${cat.applications} apps</span>
        </div>
        <div style="text-align: right;">
          <span style="font-weight:700; color:${rate >= 85 ? '#34d399' : '#fbbf24'}; font-family:monospace;">${formatPercent(rate)}</span>
          <span style="font-size:0.75rem; color:var(--text-secondary); margin-left:0.5rem;">${formatMoney(cat.revenue)}</span>
        </div>
      `;

      categorySummaryList.appendChild(item);
    });
  }

  // --- Record Actions ---
  function addRecord(e) {
    e.preventDefault();

    const country = inputCountry.value.trim();
    const category = inputCategory.value;
    const apps = Math.max(1, parseInt(inputApps.value, 10) || 1);
    const approved = Math.max(0, parseInt(inputApproved.value, 10) || 0);
    const rejected = Math.max(0, parseInt(inputRejected.value, 10) || 0);
    const avgDays = Math.max(0.5, parseFloat(inputDays.value) || 1);
    const revenue = Math.max(0, parseFloat(inputRevenue.value) || 0);

    if (!country) return;

    if (approved + rejected > apps) {
      alert(`Approved (${approved}) + Rejected (${rejected}) cannot exceed Total Applications (${apps})!`);
      return;
    }

    visaRecords.push({
      id: `v-${Date.now()}`,
      country,
      category,
      applications: apps,
      approved,
      rejected,
      avgDays,
      revenue
    });

    inputCountry.value = '';
    inputApps.value = '100';
    inputApproved.value = '88';
    inputRejected.value = '8';
    inputDays.value = '5';
    inputRevenue.value = '18500';

    updateUI();
  }

  function deleteRecord(id) {
    visaRecords = visaRecords.filter(r => r.id !== id);
    updateUI();
  }

  function duplicateRecord(id) {
    const orig = visaRecords.find(r => r.id === id);
    if (!orig) return;

    visaRecords.push({
      ...orig,
      id: `v-${Date.now()}`,
      country: `${orig.country} (Copy)`
    });

    updateUI();
  }

  function clearAllData() {
    if (confirm('Are you sure you want to clear all visa application records?')) {
      visaRecords = [];
      updateUI();
    }
  }

  // --- CSV Export ---
  function exportCsv() {
    const data = calculateMetrics();
    const curr = getCurrency();

    let csv = `Visa Application Analytics Dashboard Report\n`;
    csv += `Total Applications,${data.totalApps}\n`;
    csv += `Total Approved,${data.totalApproved}\n`;
    csv += `Total Rejected,${data.totalRejected}\n`;
    csv += `Overall Approval Rate,${data.overallApprovalRate.toFixed(2)}%\n`;
    csv += `Overall Rejection Rate,${data.overallRejectionRate.toFixed(2)}%\n`;
    csv += `Weighted Average Processing Days,${data.avgTurnaround.toFixed(2)} Days\n`;
    csv += `Total Fee Revenue,${curr}${data.totalRevenue.toFixed(2)}\n\n`;

    csv += `Country,Category,Applications,Approved,Rejected,Pending,Approval Rate %,Rejection Rate %,Avg Processing Days,Revenue\n`;
    data.records.forEach(r => {
      csv += `"${r.country.replace(/"/g, '""')}","${r.category}",${r.applications},${r.approved},${r.rejected},${r.pending},${r.approvalRate.toFixed(2)}%,${r.rejectionRate.toFixed(2)}%,${r.avgDays},${r.revenue}\n`;
    });

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `visa_analytics_report_${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  // --- Copy Executive Visa Report ---
  function copyReport() {
    const data = calculateMetrics();
    const curr = getCurrency();

    const text = [
      `📑 VISA PROCESSING ANALYTICS AUDIT`,
      `-----------------------------------`,
      `Total Cohort Applications: ${data.totalApps.toLocaleString()}`,
      `Total Visas Approved: ${data.totalApproved.toLocaleString()} (${formatPercent(data.overallApprovalRate)})`,
      `Total Refusals / Rejected: ${data.totalRejected.toLocaleString()} (${formatPercent(data.overallRejectionRate)})`,
      `Active in Embassy Queue: ${data.totalPending.toLocaleString()} (${formatPercent(data.overallPendingRate)})`,
      `Average Processing Turnaround: ${formatDays(data.avgTurnaround)}`,
      `Total Consular Fee Revenue: ${curr}${data.totalRevenue.toLocaleString()} (Avg ${formatMoney(data.avgRevPerApp)} / app)`,
      ``,
      `DESTINATION STREAMS:`,
      ...data.countryAggregates.map(c => `• ${c.country}: ${c.applications} apps | ${formatPercent(c.approvalRate)} approval | ${formatDays(c.turnaround)} | ${curr}${c.revenue.toLocaleString()}`)
    ].join('\n');

    navigator.clipboard.writeText(text).then(() => {
      const orig = btnCopySummary.innerHTML;
      btnCopySummary.innerHTML = `✓ Copied!`;
      setTimeout(() => { btnCopySummary.innerHTML = orig; }, 2000);
    }).catch(() => {
      alert('Report copied to clipboard!');
    });
  }

  // --- Preset Loader ---
  function loadPreset(key) {
    if (!PRESETS[key]) return;
    visaRecords = JSON.parse(JSON.stringify(PRESETS[key]));

    presetButtons.forEach(b => {
      if (b.getAttribute('data-preset') === key) b.classList.add('active');
      else b.classList.remove('active');
    });

    updateUI();
  }

  function escapeHtml(str) {
    return str.replace(/[&<>'"]/g, tag => ({
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      "'": '&#39;',
      '"': '&quot;'
    }[tag] || tag));
  }

  // --- Event Listeners ---
  if (addVisaForm) addVisaForm.addEventListener('submit', addRecord);
  if (filterSearch) filterSearch.addEventListener('input', () => renderTable(calculateMetrics()));
  if (filterCategory) filterCategory.addEventListener('change', () => renderTable(calculateMetrics()));
  if (currencySelect) currencySelect.addEventListener('change', updateUI);

  if (btnExportCsv) btnExportCsv.addEventListener('click', exportCsv);
  if (btnClearAll) btnClearAll.addEventListener('click', clearAllData);
  if (btnCopySummary) btnCopySummary.addEventListener('click', copyReport);

  if (btnViewRates) {
    btnViewRates.addEventListener('click', () => {
      currentChartView = 'rates';
      btnViewRates.classList.add('active');
      btnViewRev.classList.remove('active');
      renderChart(calculateMetrics());
    });
  }

  if (btnViewRev) {
    btnViewRev.addEventListener('click', () => {
      currentChartView = 'rev';
      btnViewRev.classList.add('active');
      btnViewRates.classList.remove('active');
      renderChart(calculateMetrics());
    });
  }

  // Table header sorting
  sortableHeaders.forEach(th => {
    th.addEventListener('click', () => {
      const col = th.getAttribute('data-sort');
      if (sortColumn === col) {
        sortAscending = !sortAscending;
      } else {
        sortColumn = col;
        sortAscending = false;
      }
      renderTable(calculateMetrics());
    });
  });

  presetButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const key = btn.getAttribute('data-preset');
      loadPreset(key);
    });
  });

  // Initial render
  updateUI();
});