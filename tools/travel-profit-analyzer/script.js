/**
 * Travel Profit Analyzer
 * Financial revenue, unit cost, and profit margin auditor for travel agencies and tour operators.
 */

document.addEventListener('DOMContentLoaded', () => {
  // --- DOM Elements ---
  const currencySelect = document.getElementById('currency-select');
  const addPackageForm = document.getElementById('add-package-form');
  const pkgNameInput = document.getElementById('pkg-name');
  const pkgCategorySelect = document.getElementById('pkg-category');
  const pkgCostInput = document.getElementById('pkg-cost');
  const pkgPriceInput = document.getElementById('pkg-price');
  const pkgVolumeInput = document.getElementById('pkg-volume');

  const filterSearch = document.getElementById('filter-search');
  const filterCategory = document.getElementById('filter-category');
  const packageTableBody = document.getElementById('package-table-body');
  const packageCountBadge = document.getElementById('package-count-badge');

  const kpiGrossRevenue = document.getElementById('kpi-gross-revenue');
  const kpiTotalBookings = document.getElementById('kpi-total-bookings');
  const kpiCostSales = document.getElementById('kpi-cost-sales');
  const kpiCostRatio = document.getElementById('kpi-cost-ratio');
  const kpiGrossProfit = document.getElementById('kpi-gross-profit');
  const kpiGrossMargin = document.getElementById('kpi-gross-margin');
  const kpiNetProfit = document.getElementById('kpi-net-profit');
  const kpiNetMargin = document.getElementById('kpi-net-margin');
  const kpiAtv = document.getElementById('kpi-atv');
  const kpiBreakeven = document.getElementById('kpi-breakeven');
  const kpiBreakevenRev = document.getElementById('kpi-breakeven-rev');

  const overheadInputs = [
    document.getElementById('overhead-salaries'),
    document.getElementById('overhead-rent'),
    document.getElementById('overhead-marketing'),
    document.getElementById('overhead-tech')
  ];
  const overheadTotalLabel = document.getElementById('overhead-total-label');

  const btnViewBar = document.getElementById('btn-view-bar');
  const btnViewDonut = document.getElementById('btn-view-donut');
  const travelChartSvg = document.getElementById('travel-chart-svg');
  const chartTooltip = document.getElementById('chart-tooltip');
  const chartLegend = document.getElementById('chart-legend');

  const btnExportCsv = document.getElementById('btn-export-csv');
  const btnClearPackages = document.getElementById('btn-clear-packages');
  const btnCopySummary = document.getElementById('btn-copy-summary');

  const presetButtons = document.querySelectorAll('.preset-btn');

  // --- Initial State & Presets ---
  let currentChartView = 'bar'; // 'bar' | 'donut'

  let packages = [
    {
      id: 'pkg-1',
      name: 'VIP 14-Day Umrah Makkah & Madinah',
      category: 'Umrah',
      costPrice: 1850,
      sellingPrice: 2600,
      bookingsVolume: 40
    },
    {
      id: 'pkg-2',
      name: 'Economy 10-Day Umrah Express',
      category: 'Umrah',
      costPrice: 950,
      sellingPrice: 1380,
      bookingsVolume: 85
    },
    {
      id: 'pkg-3',
      name: 'Jeddah-Makkah Luxury Private Transfers',
      category: 'Custom',
      costPrice: 160,
      sellingPrice: 280,
      bookingsVolume: 60
    },
    {
      id: 'pkg-4',
      name: 'Saudi Electronic Tourist / Pilgrimage Visa',
      category: 'Visas',
      costPrice: 140,
      sellingPrice: 220,
      bookingsVolume: 125
    },
    {
      id: 'pkg-5',
      name: 'Direct Long-Haul Group Flights',
      category: 'Flights',
      costPrice: 720,
      sellingPrice: 880,
      bookingsVolume: 90
    }
  ];

  const PRESETS = {
    'umrah-hajj': [
      { id: 'u1', name: 'Deluxe 14D Umrah (Clock Tower 5-Star)', category: 'Umrah', costPrice: 2200, sellingPrice: 2950, bookingsVolume: 35 },
      { id: 'u2', name: 'Economy 10D Umrah Package', category: 'Umrah', costPrice: 980, sellingPrice: 1400, bookingsVolume: 90 },
      { id: 'u3', name: 'VIP Private Chauffeur Fleet Transfers', category: 'Custom', costPrice: 180, sellingPrice: 310, bookingsVolume: 55 },
      { id: 'u4', name: 'Saudi Visa & Medical Insurance Bundle', category: 'Visas', costPrice: 145, sellingPrice: 230, bookingsVolume: 130 },
      { id: 'u5', name: 'Madinah 5-Star Suite Extended Nights', category: 'Hotels', costPrice: 1100, sellingPrice: 1550, bookingsVolume: 28 }
    ],
    'leisure-flights': [
      { id: 'l1', name: 'Long-Haul International Scheduled Flights', category: 'Flights', costPrice: 850, sellingPrice: 1020, bookingsVolume: 140 },
      { id: 'l2', name: 'Maldives 5-Star All-Inclusive Water Villa 5N', category: 'Hotels', costPrice: 2600, sellingPrice: 3450, bookingsVolume: 22 },
      { id: 'l3', name: 'Bali Tropical Discovery Group Tour 8D', category: 'Group Tours', costPrice: 720, sellingPrice: 1050, bookingsVolume: 48 },
      { id: 'l4', name: 'Comprehensive Global Travel Insurance', category: 'Visas', costPrice: 40, sellingPrice: 95, bookingsVolume: 180 },
      { id: 'l5', name: 'Domestic Regional Connector Flights', category: 'Flights', costPrice: 160, sellingPrice: 215, bookingsVolume: 110 }
    ],
    'corporate-tours': [
      { id: 'c1', name: 'Europe 6-Country Grand Tour 12D', category: 'Group Tours', costPrice: 2300, sellingPrice: 3100, bookingsVolume: 45 },
      { id: 'c2', name: 'Annual Corporate Summit Dubai 5D', category: 'Group Tours', costPrice: 1550, sellingPrice: 2150, bookingsVolume: 70 },
      { id: 'c3', name: 'Regional Executive Jet Charter', category: 'Flights', costPrice: 9200, sellingPrice: 12400, bookingsVolume: 6 },
      { id: 'c4', name: '5-Star Business Hotel Block Bookings', category: 'Hotels', costPrice: 420, sellingPrice: 590, bookingsVolume: 140 },
      { id: 'c5', name: 'Fast-Track Business Visa Expediting', category: 'Visas', costPrice: 190, sellingPrice: 320, bookingsVolume: 85 }
    ]
  };

  const CATEGORY_COLORS = {
    'Umrah': '#fbbf24',
    'Flights': '#60a5fa',
    'Hotels': '#34d399',
    'Group Tours': '#c084fc',
    'Visas': '#38bdf8',
    'Custom': '#a1a1aa'
  };

  // --- Helpers ---
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

  function formatDecimalMoney(amount) {
    const sym = getCurrency();
    if (isNaN(amount) || !isFinite(amount)) return `${sym}0.00`;
    return `${sym}${Number(amount).toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    })}`;
  }

  function formatPercent(val) {
    if (isNaN(val) || !isFinite(val)) return '0.0%';
    return `${val.toFixed(1)}%`;
  }

  // --- Calculations ---
  function calculateFinancials() {
    let grossRevenue = 0;
    let costOfSales = 0;
    let totalBookings = 0;

    const enrichedPackages = packages.map(pkg => {
      const rev = pkg.sellingPrice * pkg.bookingsVolume;
      const cost = pkg.costPrice * pkg.bookingsVolume;
      const profit = rev - cost;
      const margin = rev > 0 ? (profit / rev) * 100 : 0;
      const markup = pkg.costPrice > 0 ? ((pkg.sellingPrice - pkg.costPrice) / pkg.costPrice) * 100 : 0;

      grossRevenue += rev;
      costOfSales += cost;
      totalBookings += pkg.bookingsVolume;

      return {
        ...pkg,
        revenue: rev,
        cost: cost,
        profit: profit,
        margin: margin,
        markup: markup
      };
    });

    const grossProfit = grossRevenue - costOfSales;
    const grossMargin = grossRevenue > 0 ? (grossProfit / grossRevenue) * 100 : 0;
    const costRatio = grossRevenue > 0 ? (costOfSales / grossRevenue) * 100 : 0;
    const atv = totalBookings > 0 ? grossRevenue / totalBookings : 0;

    // Overheads
    const overheadSalaries = Math.max(0, parseFloat(overheadInputs[0].value) || 0);
    const overheadRent = Math.max(0, parseFloat(overheadInputs[1].value) || 0);
    const overheadMarketing = Math.max(0, parseFloat(overheadInputs[2].value) || 0);
    const overheadTech = Math.max(0, parseFloat(overheadInputs[3].value) || 0);
    const totalOverhead = overheadSalaries + overheadRent + overheadMarketing + overheadTech;

    const netProfit = grossProfit - totalOverhead;
    const netMargin = grossRevenue > 0 ? (netProfit / grossRevenue) * 100 : 0;

    // Break-even
    const avgProfitPerBooking = totalBookings > 0 ? grossProfit / totalBookings : 0;
    const breakevenBookings = avgProfitPerBooking > 0 ? Math.ceil(totalOverhead / avgProfitPerBooking) : 0;
    const breakevenRevenue = breakevenBookings * atv;

    // Category breakdown
    const categoryTotals = {};
    enrichedPackages.forEach(pkg => {
      if (!categoryTotals[pkg.category]) {
        categoryTotals[pkg.category] = { revenue: 0, cost: 0, profit: 0, bookings: 0 };
      }
      categoryTotals[pkg.category].revenue += pkg.revenue;
      categoryTotals[pkg.category].cost += pkg.cost;
      categoryTotals[pkg.category].profit += pkg.profit;
      categoryTotals[pkg.category].bookings += pkg.bookingsVolume;
    });

    return {
      packages: enrichedPackages,
      grossRevenue,
      costOfSales,
      totalBookings,
      grossProfit,
      grossMargin,
      costRatio,
      atv,
      totalOverhead,
      netProfit,
      netMargin,
      breakevenBookings,
      breakevenRevenue,
      categoryTotals
    };
  }

  // --- Render UI Updates ---
  function updateUI() {
    const data = calculateFinancials();

    // 1. KPI Cards
    if (kpiGrossRevenue) kpiGrossRevenue.textContent = formatMoney(data.grossRevenue);
    if (kpiTotalBookings) kpiTotalBookings.textContent = `${data.totalBookings.toLocaleString()} Total Bookings`;

    if (kpiCostSales) kpiCostSales.textContent = formatMoney(data.costOfSales);
    if (kpiCostRatio) kpiCostRatio.textContent = `${formatPercent(data.costRatio)} of revenue`;

    if (kpiGrossProfit) kpiGrossProfit.textContent = formatMoney(data.grossProfit);
    if (kpiGrossMargin) kpiGrossMargin.textContent = `Gross Margin: ${formatPercent(data.grossMargin)}`;

    if (kpiNetProfit) {
      kpiNetProfit.textContent = `${data.netProfit >= 0 ? '+' : ''}${formatMoney(data.netProfit)}`;
      kpiNetProfit.style.color = data.netProfit >= 0 ? '#34d399' : '#f87171';
    }
    if (kpiNetMargin) kpiNetMargin.textContent = `Net Margin: ${formatPercent(data.netMargin)}`;

    if (kpiAtv) kpiAtv.textContent = formatDecimalMoney(data.atv);
    if (kpiBreakeven) kpiBreakeven.textContent = `${data.breakevenBookings.toLocaleString()} Pax`;
    if (kpiBreakevenRev) kpiBreakevenRev.textContent = `Req. ${formatMoney(data.breakevenRevenue)} rev`;

    // Overhead Total
    if (overheadTotalLabel) overheadTotalLabel.textContent = formatMoney(data.totalOverhead);

    if (packageCountBadge) packageCountBadge.textContent = `${packages.length} Package${packages.length === 1 ? '' : 's'}`;

    // 2. Render Packages Table
    renderTable(data);

    // 3. Render Chart
    renderChart(data);
  }

  // --- Render Packages Table with Search & Category Filter ---
  function renderTable(data) {
    if (!packageTableBody) return;
    packageTableBody.innerHTML = '';

    const searchTerm = (filterSearch.value || '').toLowerCase().trim();
    const filterCat = filterCategory.value || 'ALL';

    const filtered = data.packages.filter(pkg => {
      const matchCat = filterCat === 'ALL' || pkg.category === filterCat;
      const matchSearch = pkg.name.toLowerCase().includes(searchTerm) || pkg.category.toLowerCase().includes(searchTerm);
      return matchCat && matchSearch;
    });

    if (filtered.length === 0) {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td colspan="7" style="text-align: center; color: var(--text-tertiary); padding: 2rem;">
          No packages match your search filter. Add a new package above or select a preset template.
        </td>
      `;
      packageTableBody.appendChild(tr);
      return;
    }

    filtered.forEach(pkg => {
      const tr = document.createElement('tr');

      let marginClass = 'margin-medium';
      if (pkg.margin >= 25) marginClass = 'margin-high';
      else if (pkg.margin < 12) marginClass = 'margin-low';

      const catBadgeClass = `badge-${pkg.category.toLowerCase().replace(/\s+/g, '')}`;

      tr.innerHTML = `
        <td>
          <div style="font-weight: 600; color: var(--text-primary); margin-bottom: 0.2rem;">${escapeHtml(pkg.name)}</div>
          <span class="category-badge ${catBadgeClass}">${pkg.category}</span>
        </td>
        <td style="font-family: monospace;">${formatMoney(pkg.costPrice)}</td>
        <td style="font-family: monospace; font-weight: 600;">${formatMoney(pkg.sellingPrice)}</td>
        <td>
          <span class="margin-pill ${marginClass}">${formatPercent(pkg.margin)}</span>
        </td>
        <td style="font-weight: 700; color: var(--accent); font-family: monospace;">${pkg.bookingsVolume}</td>
        <td style="font-weight: 700; color: #34d399; font-family: monospace;">${formatMoney(pkg.profit)}</td>
        <td style="text-align: right; white-space: nowrap;">
          <button type="button" class="action-icon-btn btn-duplicate" data-id="${pkg.id}" title="Duplicate Package">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
          </button>
          <button type="button" class="action-icon-btn danger btn-delete" data-id="${pkg.id}" title="Delete Package">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
          </button>
        </td>
      `;

      packageTableBody.appendChild(tr);
    });

    // Attach actions
    packageTableBody.querySelectorAll('.btn-duplicate').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-id');
        duplicatePackage(id);
      });
    });

    packageTableBody.querySelectorAll('.btn-delete').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-id');
        deletePackage(id);
      });
    });
  }

  // --- Render Chart ---
  function renderChart(data) {
    if (!travelChartSvg) return;

    if (currentChartView === 'bar') {
      renderBarChart(data);
    } else {
      renderDonutChart(data);
    }
  }

  // --- Bar Chart Rendering ---
  function renderBarChart(data) {
    const width = 380;
    const height = 280;
    const paddingLeft = 40;
    const paddingRight = 15;
    const paddingTop = 25;
    const paddingBottom = 40;

    const chartW = width - paddingLeft - paddingRight;
    const chartH = height - paddingTop - paddingBottom;

    const items = data.packages.slice(0, 5); // top 5 items for clean display
    if (items.length === 0) {
      travelChartSvg.innerHTML = `<text x="${width/2}" y="${height/2}" text-anchor="middle" fill="var(--text-tertiary)" font-size="12">No packages to display</text>`;
      if (chartLegend) chartLegend.innerHTML = '';
      return;
    }

    const maxVal = Math.max(...items.map(it => Math.max(it.revenue, it.cost)), 1000);
    const groupWidth = chartW / items.length;
    const barWidth = Math.min(22, (groupWidth - 10) / 2);

    let svg = `
      <defs>
        <linearGradient id="barRevGrad" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stop-color="#38bdf8" />
          <stop offset="100%" stop-color="#0284c7" />
        </linearGradient>
        <linearGradient id="barCostGrad" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stop-color="#f87171" />
          <stop offset="100%" stop-color="#dc2626" />
        </linearGradient>
      </defs>
    `;

    // Horizontal grid lines
    for (let i = 0; i <= 4; i++) {
      const y = paddingTop + (chartH / 4) * i;
      const val = Math.round(maxVal - (maxVal / 4) * i);
      svg += `
        <line x1="${paddingLeft}" y1="${y}" x2="${width - paddingRight}" y2="${y}" stroke="var(--border)" stroke-dasharray="3,3" stroke-width="0.7" />
        <text x="${paddingLeft - 6}" y="${y + 3}" text-anchor="end" fill="var(--text-tertiary)" font-size="9" font-family="monospace">
          ${formatCompactNumber(val)}
        </text>
      `;
    }

    // Render bars
    items.forEach((pkg, idx) => {
      const groupX = paddingLeft + idx * groupWidth;
      const revH = (pkg.revenue / maxVal) * chartH;
      const costH = (pkg.cost / maxVal) * chartH;

      const revX = groupX + groupWidth / 2 - barWidth - 1;
      const costX = groupX + groupWidth / 2 + 1;

      const revY = paddingTop + chartH - revH;
      const costY = paddingTop + chartH - costH;

      const truncatedName = pkg.name.length > 8 ? pkg.name.slice(0, 7) + '…' : pkg.name;

      svg += `
        <g class="chart-group" data-title="${escapeHtml(pkg.name)}" data-rev="${formatMoney(pkg.revenue)}" data-cost="${formatMoney(pkg.cost)}" data-profit="${formatMoney(pkg.profit)}" data-margin="${formatPercent(pkg.margin)}">
          <!-- Revenue Bar -->
          <rect x="${revX}" y="${revY}" width="${barWidth}" height="${revH}" rx="3" fill="url(#barRevGrad)" opacity="0.9" style="cursor:pointer; transition: opacity 0.2s;" />
          <!-- Cost Bar -->
          <rect x="${costX}" y="${costY}" width="${barWidth}" height="${costH}" rx="3" fill="url(#barCostGrad)" opacity="0.85" style="cursor:pointer; transition: opacity 0.2s;" />
          <!-- X Axis Label -->
          <text x="${groupX + groupWidth / 2}" y="${height - 15}" text-anchor="middle" fill="var(--text-secondary)" font-size="9" font-weight="500">
            ${escapeHtml(truncatedName)}
          </text>
        </g>
      `;
    });

    travelChartSvg.innerHTML = svg;
    attachChartTooltips();

    // Legend
    if (chartLegend) {
      chartLegend.innerHTML = `
        <span style="display:inline-flex; align-items:center; gap:0.35rem; color:var(--text-secondary);">
          <span style="width:10px; height:10px; background:#38bdf8; border-radius:2px;"></span> Revenue
        </span>
        <span style="display:inline-flex; align-items:center; gap:0.35rem; color:var(--text-secondary);">
          <span style="width:10px; height:10px; background:#f87171; border-radius:2px;"></span> Cost of Sales
        </span>
      `;
    }
  }

  // --- Donut Chart Rendering (Profit Contribution) ---
  function renderDonutChart(data) {
    const width = 380;
    const height = 280;
    const centerX = width / 2;
    const centerY = height / 2 - 10;
    const radius = 85;
    const innerRadius = 52;

    const catData = Object.entries(data.categoryTotals).filter(([_, val]) => val.profit > 0);
    const totalProfit = data.grossProfit;

    if (catData.length === 0 || totalProfit <= 0) {
      travelChartSvg.innerHTML = `<text x="${centerX}" y="${centerY}" text-anchor="middle" fill="var(--text-tertiary)" font-size="12">No positive gross profit data</text>`;
      if (chartLegend) chartLegend.innerHTML = '';
      return;
    }

    let startAngle = 0;
    let svg = '';

    catData.forEach(([cat, stats]) => {
      const sliceAngle = (stats.profit / totalProfit) * 2 * Math.PI;
      const endAngle = startAngle + sliceAngle;
      const color = CATEGORY_COLORS[cat] || '#89aacc';

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

      const sharePct = (stats.profit / totalProfit) * 100;

      svg += `
        <path d="${pathData}" fill="${color}" stroke="var(--surface)" stroke-width="2" class="donut-slice" style="cursor:pointer;"
          data-title="${cat}" data-profit="${formatMoney(stats.profit)}" data-share="${formatPercent(sharePct)}" data-rev="${formatMoney(stats.revenue)}" />
      `;

      startAngle = endAngle;
    });

    // Center hole text
    svg += `
      <text x="${centerX}" y="${centerY - 6}" text-anchor="middle" fill="var(--text-tertiary)" font-size="9" font-weight="600" text-transform="uppercase">Total Profit</text>
      <text x="${centerX}" y="${centerY + 14}" text-anchor="middle" fill="#34d399" font-size="13" font-weight="800" font-family="monospace">${formatMoney(totalProfit)}</text>
    `;

    travelChartSvg.innerHTML = svg;
    attachDonutTooltips();

    // Category Legend
    if (chartLegend) {
      chartLegend.innerHTML = catData.map(([cat, stats]) => {
        const color = CATEGORY_COLORS[cat] || '#89aacc';
        const share = ((stats.profit / totalProfit) * 100).toFixed(0);
        return `
          <span style="display:inline-flex; align-items:center; gap:0.35rem; color:var(--text-secondary);">
            <span style="width:8px; height:8px; background:${color}; border-radius:50%;"></span> ${cat} (${share}%)
          </span>
        `;
      }).join('');
    }
  }

  // --- Attach Chart Tooltips ---
  function attachChartTooltips() {
    const groups = travelChartSvg.querySelectorAll('.chart-group');
    groups.forEach(g => {
      g.addEventListener('mouseenter', e => {
        const title = g.getAttribute('data-title');
        const rev = g.getAttribute('data-rev');
        const cost = g.getAttribute('data-cost');
        const profit = g.getAttribute('data-profit');
        const margin = g.getAttribute('data-margin');

        chartTooltip.innerHTML = `
          <div style="font-weight:700; color:var(--accent); margin-bottom:0.25rem;">${title}</div>
          <div><strong>Revenue:</strong> ${rev}</div>
          <div><strong>Cost:</strong> ${cost}</div>
          <div><strong>Gross Profit:</strong> <span style="color:#34d399;">${profit}</span> (${margin})</div>
        `;
        chartTooltip.style.display = 'block';
      });

      g.addEventListener('mousemove', e => {
        const box = travelChartSvg.getBoundingClientRect();
        chartTooltip.style.left = `${e.clientX - box.left + 10}px`;
        chartTooltip.style.top = `${e.clientY - box.top + 10}px`;
      });

      g.addEventListener('mouseleave', () => {
        chartTooltip.style.display = 'none';
      });
    });
  }

  function attachDonutTooltips() {
    const slices = travelChartSvg.querySelectorAll('.donut-slice');
    slices.forEach(s => {
      s.addEventListener('mouseenter', e => {
        const title = s.getAttribute('data-title');
        const profit = s.getAttribute('data-profit');
        const share = s.getAttribute('data-share');
        const rev = s.getAttribute('data-rev');

        chartTooltip.innerHTML = `
          <div style="font-weight:700; color:var(--accent); margin-bottom:0.25rem;">${title} Category</div>
          <div><strong>Profit Contribution:</strong> <span style="color:#34d399;">${profit}</span> (${share})</div>
          <div><strong>Category Revenue:</strong> ${rev}</div>
        `;
        chartTooltip.style.display = 'block';
      });

      s.addEventListener('mousemove', e => {
        const box = travelChartSvg.getBoundingClientRect();
        chartTooltip.style.left = `${e.clientX - box.left + 10}px`;
        chartTooltip.style.top = `${e.clientY - box.top + 10}px`;
      });

      s.addEventListener('mouseleave', () => {
        chartTooltip.style.display = 'none';
      });
    });
  }

  // --- Package Actions ---
  function addPackage(e) {
    e.preventDefault();

    const name = pkgNameInput.value.trim();
    const category = pkgCategorySelect.value;
    const cost = Math.max(0, parseFloat(pkgCostInput.value) || 0);
    const price = Math.max(0, parseFloat(pkgPriceInput.value) || 0);
    const volume = Math.max(1, parseInt(pkgVolumeInput.value, 10) || 1);

    if (!name) return;

    packages.push({
      id: `pkg-${Date.now()}`,
      name,
      category,
      costPrice: cost,
      sellingPrice: price,
      bookingsVolume: volume
    });

    pkgNameInput.value = '';
    pkgCostInput.value = '';
    pkgPriceInput.value = '';
    pkgVolumeInput.value = '10';

    updateUI();
  }

  function deletePackage(id) {
    packages = packages.filter(p => p.id !== id);
    updateUI();
  }

  function duplicatePackage(id) {
    const orig = packages.find(p => p.id === id);
    if (!orig) return;

    packages.push({
      ...orig,
      id: `pkg-${Date.now()}`,
      name: `${orig.name} (Copy)`
    });

    updateUI();
  }

  function clearAllPackages() {
    if (confirm('Are you sure you want to clear all travel packages?')) {
      packages = [];
      updateUI();
    }
  }

  // --- CSV Export ---
  function exportCsv() {
    const data = calculateFinancials();
    const curr = getCurrency();

    let csv = `Travel Agency Profit & Margin Audit\n`;
    csv += `Total Gross Revenue,${curr}${data.grossRevenue.toFixed(2)}\n`;
    csv += `Total Cost of Sales (COGS),${curr}${data.costOfSales.toFixed(2)}\n`;
    csv += `Total Gross Profit,${curr}${data.grossProfit.toFixed(2)}\n`;
    csv += `Gross Margin,${data.grossMargin.toFixed(2)}%\n`;
    csv += `Total Monthly Overhead,${curr}${data.totalOverhead.toFixed(2)}\n`;
    csv += `Net Profit,${curr}${data.netProfit.toFixed(2)}\n`;
    csv += `Net Profit Margin,${data.netMargin.toFixed(2)}%\n`;
    csv += `Average Ticket Value,${curr}${data.atv.toFixed(2)}\n`;
    csv += `Break-Even Bookings,${data.breakevenBookings} Pax\n\n`;

    csv += `Package Name,Category,Cost Price,Selling Price,Bookings Volume,Gross Revenue,Cost of Sales,Gross Profit,Margin %,Markup %\n`;
    data.packages.forEach(p => {
      csv += `"${p.name.replace(/"/g, '""')}","${p.category}",${p.costPrice},${p.sellingPrice},${p.bookingsVolume},${p.revenue},${p.cost},${p.profit},${p.margin.toFixed(2)}%,${p.markup.toFixed(2)}%\n`;
    });

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `travel_profit_audit_${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  // --- Copy Executive Profit Audit ---
  function copyExecutiveSummary() {
    const data = calculateFinancials();
    const curr = getCurrency();

    const text = [
      `✈️ TRAVEL AGENCY PROFITABILITY AUDIT REPORT`,
      `-------------------------------------------`,
      `Gross Revenue: ${curr}${data.grossRevenue.toLocaleString()}`,
      `Total Cost of Sales: ${curr}${data.costOfSales.toLocaleString()} (${formatPercent(data.costRatio)})`,
      `Gross Profit: ${curr}${data.grossProfit.toLocaleString()} (Gross Margin: ${formatPercent(data.grossMargin)})`,
      `Monthly Operational Overheads: ${curr}${data.totalOverhead.toLocaleString()}`,
      `Net Profit: ${curr}${data.netProfit.toLocaleString()} (Net Margin: ${formatPercent(data.netMargin)})`,
      `Average Ticket Value: ${curr}${data.atv.toFixed(2)} / booking`,
      `Break-Even Pax Required: ${data.breakevenBookings} bookings (${curr}${data.breakevenRevenue.toLocaleString()} rev)`,
      ``,
      `TOP CONTRIBUTING PACKAGES:`,
      ...data.packages.slice(0, 5).map(p => `• ${p.name}: ${curr}${p.profit.toLocaleString()} profit (${formatPercent(p.margin)} margin, ${p.bookingsVolume} pax)`)
    ].join('\n');

    navigator.clipboard.writeText(text).then(() => {
      const orig = btnCopySummary.innerHTML;
      btnCopySummary.innerHTML = `✓ Copied!`;
      setTimeout(() => { btnCopySummary.innerHTML = orig; }, 2000);
    }).catch(() => {
      alert('Report copied to clipboard!');
    });
  }

  // --- Presets ---
  function loadPreset(key) {
    if (!PRESETS[key]) return;
    packages = JSON.parse(JSON.stringify(PRESETS[key]));

    presetButtons.forEach(b => {
      if (b.getAttribute('data-preset') === key) b.classList.add('active');
      else b.classList.remove('active');
    });

    updateUI();
  }

  // --- Number Formatting Helper ---
  function formatCompactNumber(num) {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(0) + 'k';
    return num.toString();
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
  if (addPackageForm) addPackageForm.addEventListener('submit', addPackage);
  if (filterSearch) filterSearch.addEventListener('input', () => renderTable(calculateFinancials()));
  if (filterCategory) filterCategory.addEventListener('change', () => renderTable(calculateFinancials()));
  if (currencySelect) currencySelect.addEventListener('change', updateUI);

  overheadInputs.forEach(inp => {
    inp.addEventListener('input', updateUI);
  });

  if (btnExportCsv) btnExportCsv.addEventListener('click', exportCsv);
  if (btnClearPackages) btnClearPackages.addEventListener('click', clearAllPackages);
  if (btnCopySummary) btnCopySummary.addEventListener('click', copyExecutiveSummary);

  if (btnViewBar) {
    btnViewBar.addEventListener('click', () => {
      currentChartView = 'bar';
      btnViewBar.classList.add('active');
      btnViewDonut.classList.remove('active');
      renderChart(calculateFinancials());
    });
  }

  if (btnViewDonut) {
    btnViewDonut.addEventListener('click', () => {
      currentChartView = 'donut';
      btnViewDonut.classList.add('active');
      btnViewBar.classList.remove('active');
      renderChart(calculateFinancials());
    });
  }

  presetButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const key = btn.getAttribute('data-preset');
      loadPreset(key);
    });
  });

  // Initial render
  updateUI();
});