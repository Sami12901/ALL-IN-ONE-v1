// Cross-Channel Social Media Analytics & ROI Dashboard

const DEFAULT_PLATFORMS = [
  {
    id: 'instagram',
    name: 'Instagram',
    iconClass: 'channel-instagram',
    followers: 125000,
    impressions: 620000,
    engagementRate: 3.4, // %
    ctr: 1.8,            // %
    spend: 4200,         // $
    revenue: 14800,      // $
    orders: 210
  },
  {
    id: 'youtube',
    name: 'YouTube',
    iconClass: 'channel-youtube',
    followers: 84000,
    impressions: 410000,
    engagementRate: 5.2,
    ctr: 3.1,
    spend: 5800,
    revenue: 26400,
    orders: 340
  },
  {
    id: 'linkedin',
    name: 'LinkedIn',
    iconClass: 'channel-linkedin',
    followers: 46000,
    impressions: 195000,
    engagementRate: 2.8,
    ctr: 2.4,
    spend: 3500,
    revenue: 16500,
    orders: 78
  },
  {
    id: 'x',
    name: 'X (Twitter)',
    iconClass: 'channel-x',
    followers: 92000,
    impressions: 510000,
    engagementRate: 1.9,
    ctr: 1.2,
    spend: 2100,
    revenue: 5200,
    orders: 95
  },
  {
    id: 'tiktok',
    name: 'TikTok',
    iconClass: 'channel-tiktok',
    followers: 210000,
    impressions: 1450000,
    engagementRate: 6.8,
    ctr: 1.5,
    spend: 6400,
    revenue: 19200,
    orders: 390
  }
];

const PRESETS = {
  ecommerce: [
    { id: 'instagram', followers: 185000, impressions: 840000, engagementRate: 4.1, ctr: 2.3, spend: 6500, revenue: 24500, orders: 360 },
    { id: 'youtube', followers: 62000, impressions: 320000, engagementRate: 4.8, ctr: 2.9, spend: 4500, revenue: 18200, orders: 210 },
    { id: 'linkedin', followers: 18000, impressions: 75000, engagementRate: 1.9, ctr: 1.4, spend: 1200, revenue: 2900, orders: 22 },
    { id: 'x', followers: 64000, impressions: 380000, engagementRate: 2.2, ctr: 1.1, spend: 1800, revenue: 4100, orders: 75 },
    { id: 'tiktok', followers: 340000, impressions: 2200000, engagementRate: 7.2, ctr: 2.1, spend: 8900, revenue: 38700, orders: 740 }
  ],
  b2b: [
    { id: 'instagram', followers: 32000, impressions: 110000, engagementRate: 2.1, ctr: 1.1, spend: 1500, revenue: 3200, orders: 18 },
    { id: 'youtube', followers: 95000, impressions: 480000, engagementRate: 4.9, ctr: 3.4, spend: 7200, revenue: 34000, orders: 120 },
    { id: 'linkedin', followers: 142000, impressions: 720000, engagementRate: 4.3, ctr: 3.8, spend: 9500, revenue: 58000, orders: 190 },
    { id: 'x', followers: 88000, impressions: 450000, engagementRate: 2.8, ctr: 2.2, spend: 3200, revenue: 11400, orders: 65 },
    { id: 'tiktok', followers: 45000, impressions: 280000, engagementRate: 3.2, ctr: 0.9, spend: 1800, revenue: 2200, orders: 14 }
  ],
  creator: [
    { id: 'instagram', followers: 290000, impressions: 1400000, engagementRate: 5.5, ctr: 2.6, spend: 2800, revenue: 21000, orders: 420 },
    { id: 'youtube', followers: 450000, impressions: 2100000, engagementRate: 7.8, ctr: 4.2, spend: 5200, revenue: 56000, orders: 980 },
    { id: 'linkedin', followers: 24000, impressions: 90000, engagementRate: 2.4, ctr: 1.6, spend: 600, revenue: 4200, orders: 35 },
    { id: 'x', followers: 175000, impressions: 980000, engagementRate: 3.6, ctr: 2.1, spend: 1400, revenue: 9800, orders: 160 },
    { id: 'tiktok', followers: 580000, impressions: 3800000, engagementRate: 8.4, ctr: 2.8, spend: 4100, revenue: 32000, orders: 690 }
  ]
};

let platformsState = JSON.parse(JSON.stringify(DEFAULT_PLATFORMS));
let currentChartMetric = 'roi';

// Formatters
const formatNumber = (num) => new Intl.NumberFormat('en-US').format(Math.round(num));
const formatCurrency = (num) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(num);
const formatPercent = (num) => `${(num).toFixed(1)}%`;
const formatCompact = (num) => {
  if (num >= 1000000) return `${(num / 1000000).toFixed(2)}M`;
  if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
  return String(Math.round(num));
};

function calculatePlatformMetrics(platform) {
  const followers = Math.max(0, Number(platform.followers) || 0);
  const impressions = Math.max(0, Number(platform.impressions) || 0);
  const engagementRate = Math.max(0, Number(platform.engagementRate) || 0);
  const ctr = Math.max(0, Number(platform.ctr) || 0);
  const spend = Math.max(0, Number(platform.spend) || 0);
  const revenue = Math.max(0, Number(platform.revenue) || 0);
  const orders = Math.max(0, Number(platform.orders) || 0);

  // Derived
  const traffic = Math.round(impressions * (ctr / 100));
  const engagements = Math.round(impressions * (engagementRate / 100));
  const profit = revenue - spend;
  const roi = spend > 0 ? ((revenue - spend) / spend) * 100 : (revenue > 0 ? 100 : 0);
  const conversionRate = traffic > 0 ? (orders / traffic) * 100 : 0;
  const cpc = traffic > 0 ? (spend / traffic) : 0;
  const aov = orders > 0 ? (revenue / orders) : 0;

  return {
    ...platform,
    followers,
    impressions,
    engagementRate,
    ctr,
    spend,
    revenue,
    orders,
    traffic,
    engagements,
    profit,
    roi,
    conversionRate,
    cpc,
    aov
  };
}

function getAggregates() {
  const computed = platformsState.map(calculatePlatformMetrics);

  const totalFollowers = computed.reduce((acc, p) => acc + p.followers, 0);
  const totalImpressions = computed.reduce((acc, p) => acc + p.impressions, 0);
  const totalTraffic = computed.reduce((acc, p) => acc + p.traffic, 0);
  const totalSpend = computed.reduce((acc, p) => acc + p.spend, 0);
  const totalRevenue = computed.reduce((acc, p) => acc + p.revenue, 0);
  const totalOrders = computed.reduce((acc, p) => acc + p.orders, 0);
  const totalEngagements = computed.reduce((acc, p) => acc + p.engagements, 0);

  const blendedEngagementRate = totalImpressions > 0 ? (totalEngagements / totalImpressions) * 100 : 0;
  const blendedRoi = totalSpend > 0 ? ((totalRevenue - totalSpend) / totalSpend) * 100 : 0;
  const blendedConversionRate = totalTraffic > 0 ? (totalOrders / totalTraffic) * 100 : 0;

  // Best ROI Channel
  let bestChannel = computed[0];
  computed.forEach(p => {
    if (p.roi > bestChannel.roi) {
      bestChannel = p;
    }
  });

  return {
    computed,
    totalFollowers,
    totalImpressions,
    totalTraffic,
    totalSpend,
    totalRevenue,
    totalOrders,
    blendedEngagementRate,
    blendedRoi,
    blendedConversionRate,
    bestChannel
  };
}

function renderKPIs() {
  const aggs = getAggregates();

  const kpiTotalFollowers = document.getElementById('kpi-total-followers');
  const kpiTotalImpressions = document.getElementById('kpi-total-impressions');
  const kpiBlendedEngagement = document.getElementById('kpi-blended-engagement');
  const kpiTotalTraffic = document.getElementById('kpi-total-traffic');
  const kpiTotalSales = document.getElementById('kpi-total-sales');
  const kpiBestChannel = document.getElementById('kpi-best-channel');
  const kpiBestRoiSub = document.getElementById('kpi-best-roi-sub');
  const kpiSalesSub = document.getElementById('kpi-sales-sub');

  if (kpiTotalFollowers) kpiTotalFollowers.textContent = formatCompact(aggs.totalFollowers);
  if (kpiTotalImpressions) kpiTotalImpressions.textContent = formatCompact(aggs.totalImpressions);
  if (kpiBlendedEngagement) kpiBlendedEngagement.textContent = `${aggs.blendedEngagementRate.toFixed(2)}%`;
  if (kpiTotalTraffic) kpiTotalTraffic.textContent = formatCompact(aggs.totalTraffic);
  if (kpiTotalSales) kpiTotalSales.textContent = formatCurrency(aggs.totalRevenue);
  if (kpiSalesSub) kpiSalesSub.textContent = `Blended ROI: ${aggs.blendedRoi >= 0 ? '+' : ''}${aggs.blendedRoi.toFixed(0)}%`;

  if (kpiBestChannel) {
    kpiBestChannel.textContent = aggs.bestChannel ? aggs.bestChannel.name : '—';
  }
  if (kpiBestRoiSub) {
    kpiBestRoiSub.textContent = aggs.bestChannel ? `${aggs.bestChannel.roi >= 0 ? '+' : ''}${aggs.bestChannel.roi.toFixed(1)}% ROI (${formatCurrency(aggs.bestChannel.revenue)})` : '—';
  }
}

function renderTable() {
  const tbody = document.getElementById('channel-table-tbody');
  if (!tbody) return;

  const aggs = getAggregates();
  tbody.innerHTML = '';

  aggs.computed.forEach((p, index) => {
    const tr = document.createElement('tr');

    const roiClass = p.roi >= 0 ? 'positive-stat' : 'negative-stat';
    const isTop = aggs.bestChannel && aggs.bestChannel.id === p.id;

    tr.innerHTML = `
      <td>
        <div class="channel-tag">
          <span class="channel-icon ${p.iconClass}">${p.name[0]}</span>
          <span>${p.name}</span>
          ${isTop ? '<span class="top-performer-badge">Top ROI</span>' : ''}
        </div>
      </td>
      <td>
        <input type="number" class="table-input" data-index="${index}" data-field="followers" value="${p.followers}" min="0" step="500">
      </td>
      <td>
        <input type="number" class="table-input" data-index="${index}" data-field="impressions" value="${p.impressions}" min="0" step="1000">
      </td>
      <td>
        <input type="number" class="table-input" data-index="${index}" data-field="engagementRate" value="${p.engagementRate}" min="0" max="100" step="0.1" style="width: 65px;">%
      </td>
      <td>
        <input type="number" class="table-input" data-index="${index}" data-field="ctr" value="${p.ctr}" min="0" max="100" step="0.1" style="width: 65px;">%
      </td>
      <td style="font-weight: 600;">${formatNumber(p.traffic)}</td>
      <td>
        <input type="number" class="table-input" data-index="${index}" data-field="spend" value="${p.spend}" min="0" step="100">
      </td>
      <td>
        <input type="number" class="table-input" data-index="${index}" data-field="revenue" value="${p.revenue}" min="0" step="500">
      </td>
      <td>
        <input type="number" class="table-input" data-index="${index}" data-field="orders" value="${p.orders}" min="0" step="5" style="width: 70px;">
      </td>
      <td>${p.conversionRate.toFixed(2)}%</td>
      <td class="${roiClass}">${p.roi >= 0 ? '+' : ''}${p.roi.toFixed(1)}%</td>
    `;

    tbody.appendChild(tr);
  });

  // Attach input event listeners
  const inputs = tbody.querySelectorAll('.table-input');
  inputs.forEach(input => {
    input.addEventListener('input', (e) => {
      const idx = parseInt(e.target.dataset.index, 10);
      const field = e.target.dataset.field;
      const val = parseFloat(e.target.value) || 0;

      platformsState[idx][field] = val;
      updateAll(false); // Don't full re-render inputs to maintain focus
    });
  });
}

function renderChart() {
  const svg = document.getElementById('sma-bar-svg');
  if (!svg) return;

  const aggs = getAggregates();
  const data = aggs.computed;

  // Chart Dimensions
  const svgWidth = 760;
  const svgHeight = 280;
  const margin = { top: 30, right: 30, bottom: 45, left: 60 };
  const width = svgWidth - margin.left - margin.right;
  const height = svgHeight - margin.top - margin.bottom;

  // Extract metric values
  let values = [];
  let unit = '';
  let isCurrency = false;
  let isPercent = false;

  switch (currentChartMetric) {
    case 'roi':
      values = data.map(d => d.roi);
      unit = '%';
      isPercent = true;
      break;
    case 'revenue':
      values = data.map(d => d.revenue);
      unit = '$';
      isCurrency = true;
      break;
    case 'traffic':
      values = data.map(d => d.traffic);
      break;
    case 'impressions':
      values = data.map(d => d.impressions);
      break;
    case 'engagementRate':
      values = data.map(d => d.engagementRate);
      unit = '%';
      isPercent = true;
      break;
    default:
      values = data.map(d => d.roi);
      unit = '%';
      isPercent = true;
  }

  const maxVal = Math.max(...values, 0);
  const minVal = Math.min(...values, 0);
  const rangeSpan = Math.max(maxVal - (minVal < 0 ? minVal : 0), 1);
  const chartMax = maxVal > 0 ? maxVal * 1.15 : 100;
  const chartMin = minVal < 0 ? minVal * 1.15 : 0;
  const totalRange = chartMax - chartMin;

  const getY = (val) => {
    return margin.top + height - ((val - chartMin) / totalRange) * height;
  };
  const zeroY = getY(0);

  const barCount = data.length;
  const barSpacing = width / barCount;
  const barWidth = Math.min(65, barSpacing * 0.58);

  let svgContent = `
    <defs>
      <linearGradient id="barGrad" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="var(--accent)" stop-opacity="0.9"/>
        <stop offset="100%" stop-color="var(--accent)" stop-opacity="0.3"/>
      </linearGradient>
      <linearGradient id="barGradBest" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#10b981" stop-opacity="0.95"/>
        <stop offset="100%" stop-color="#10b981" stop-opacity="0.35"/>
      </linearGradient>
      <linearGradient id="barGradNeg" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#ef4444" stop-opacity="0.3"/>
        <stop offset="100%" stop-color="#ef4444" stop-opacity="0.9"/>
      </linearGradient>
    </defs>
  `;

  // Grid Lines & Y-Axis ticks
  const ticks = 4;
  for (let i = 0; i <= ticks; i++) {
    const tickVal = chartMin + (totalRange / ticks) * i;
    const yPos = getY(tickVal);

    let displayTick = Math.round(tickVal);
    if (isCurrency) displayTick = formatCompact(tickVal);
    else if (isPercent) displayTick = `${tickVal.toFixed(0)}%`;
    else displayTick = formatCompact(tickVal);

    svgContent += `
      <line x1="${margin.left}" y1="${yPos}" x2="${margin.left + width}" y2="${yPos}" stroke="rgba(255,255,255,0.06)" stroke-dasharray="3 3"/>
      <text x="${margin.left - 10}" y="${yPos + 4}" fill="var(--text-tertiary)" font-size="10" text-anchor="end">${displayTick}</text>
    `;
  }

  // Zero axis line
  svgContent += `
    <line x1="${margin.left}" y1="${zeroY}" x2="${margin.left + width}" y2="${zeroY}" stroke="var(--border)" stroke-width="1.5"/>
  `;

  // Draw Bars
  data.forEach((d, idx) => {
    const val = values[idx];
    const isTop = aggs.bestChannel && aggs.bestChannel.id === d.id && currentChartMetric === 'roi';
    const isNeg = val < 0;

    const x = margin.left + idx * barSpacing + (barSpacing - barWidth) / 2;
    let y = isNeg ? zeroY : getY(val);
    let barH = Math.max(2, Math.abs(getY(val) - zeroY));

    let fillGrad = isTop ? 'url(#barGradBest)' : (isNeg ? 'url(#barGradNeg)' : 'url(#barGrad)');
    let strokeCol = isTop ? '#10b981' : (isNeg ? '#ef4444' : 'var(--accent)');

    let displayVal = '';
    if (isCurrency) displayVal = `$${formatCompact(val)}`;
    else if (isPercent) displayVal = `${val.toFixed(1)}%`;
    else displayVal = formatCompact(val);

    const valY = isNeg ? (y + barH + 14) : (y - 8);

    svgContent += `
      <g class="chart-bar-group" data-platform="${d.name}" data-value="${val}">
        <rect x="${x}" y="${y}" width="${barWidth}" height="${barH}" rx="4" fill="${fillGrad}" stroke="${strokeCol}" stroke-width="1.5" style="transition: all 0.3s ease;"/>
        <text x="${x + barWidth / 2}" y="${valY}" fill="var(--text-primary)" font-size="11" font-weight="600" text-anchor="middle">${displayVal}</text>
        <text x="${x + barWidth / 2}" y="${margin.top + height + 24}" fill="var(--text-secondary)" font-size="11" font-weight="500" text-anchor="middle">${d.name}</text>
      </g>
    `;
  });

  svg.innerHTML = svgContent;
}

function renderStrategicInsights() {
  const container = document.getElementById('strategic-insights-container');
  if (!container) return;

  const aggs = getAggregates();
  const sortedByRoi = [...aggs.computed].sort((a, b) => b.roi - a.roi);
  const sortedByTraffic = [...aggs.computed].sort((a, b) => b.traffic - a.traffic);
  const best = sortedByRoi[0];
  const lowestRoi = sortedByRoi[sortedByRoi.length - 1];
  const trafficLeader = sortedByTraffic[0];

  const insights = [
    {
      title: `Capital Allocation: Scale ${best.name}`,
      tag: 'High ROI Driver',
      tagClass: 'tag-growth',
      body: `<strong>${best.name}</strong> is generating an exceptional <strong>+${best.roi.toFixed(1)}% ROI</strong> with $${formatNumber(best.revenue)} revenue against $${formatNumber(best.spend)} ad spend. Reallocating an additional 20–30% of underperforming ad budget here can accelerate gross margins.`
    },
    {
      title: `Funnel Optimization: ${trafficLeader.name}`,
      tag: 'Volume Scale',
      tagClass: 'tag-scale',
      body: `<strong>${trafficLeader.name}</strong> drives the highest top-of-funnel traffic (${formatNumber(trafficLeader.traffic)} clicks, ${trafficLeader.conversionRate.toFixed(2)}% conv rate). Improving checkout flow or offering personalized landing pages will turn high volume into revenue.`
    },
    {
      title: `Channel Review: ${lowestRoi.name}`,
      tag: lowestRoi.roi < 50 ? 'Efficiency Leak' : 'Cost Watch',
      tagClass: 'tag-warning',
      body: `<strong>${lowestRoi.name}</strong> has current ROI at <strong>${lowestRoi.roi.toFixed(1)}%</strong> ($${formatNumber(lowestRoi.spend)} spend vs $${formatNumber(lowestRoi.revenue)} revenue). Audit audience targeting parameters and creative fatigue before increasing campaign bids.`
    },
    {
      title: 'Blended Cross-Channel Health',
      tag: 'Portfolio Health',
      tagClass: 'tag-roi',
      body: `Your blended cross-channel portfolio delivers a <strong>${aggs.blendedRoi.toFixed(1)}% marketing ROI</strong> and a weighted <strong>${aggs.blendedEngagementRate.toFixed(2)}% engagement rate</strong>. Average order value stands at <strong>${formatCurrency(aggs.totalOrders > 0 ? aggs.totalRevenue / aggs.totalOrders : 0)}</strong>.`
    }
  ];

  container.innerHTML = insights.map(item => `
    <div class="insight-card">
      <div class="insight-header">
        <h4 style="font-size: 0.95rem; font-weight: 700; color: var(--text-primary);">${item.title}</h4>
        <span class="insight-tag ${item.tagClass}">${item.tag}</span>
      </div>
      <p style="font-size: 0.825rem; color: var(--text-secondary); line-height: 1.55;">
        ${item.body}
      </p>
    </div>
  `).join('');
}

function updateAll(reRenderTable = true) {
  renderKPIs();
  if (reRenderTable) {
    renderTable();
  } else {
    // Only update non-input cells
    const aggs = getAggregates();
    const tbody = document.getElementById('channel-table-tbody');
    if (tbody) {
      const rows = tbody.querySelectorAll('tr');
      rows.forEach((row, idx) => {
        const p = aggs.computed[idx];
        if (p) {
          const cells = row.querySelectorAll('td');
          if (cells.length >= 11) {
            cells[5].textContent = formatNumber(p.traffic);
            cells[9].textContent = `${p.conversionRate.toFixed(2)}%`;
            cells[10].textContent = `${p.roi >= 0 ? '+' : ''}${p.roi.toFixed(1)}%`;
            cells[10].className = p.roi >= 0 ? 'positive-stat' : 'negative-stat';
          }
        }
      });
    }
  }
  renderChart();
  renderStrategicInsights();
}

function exportCSV() {
  const aggs = getAggregates();
  const headers = ['Channel', 'Followers', 'Impressions', 'Engagement Rate %', 'CTR %', 'Traffic (Clicks)', 'Ad Spend ($)', 'Revenue ($)', 'Sales Orders', 'Conversion Rate %', 'ROI %'];
  const rows = aggs.computed.map(p => [
    p.name,
    p.followers,
    p.impressions,
    p.engagementRate,
    p.ctr,
    p.traffic,
    p.spend,
    p.revenue,
    p.orders,
    p.conversionRate.toFixed(2),
    p.roi.toFixed(2)
  ]);

  const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `social-media-analytics-${new Date().toISOString().slice(0, 10)}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function copySummaryReport() {
  const aggs = getAggregates();
  const summary = `--- Social Media Analytics Summary ---
Total Followers: ${formatNumber(aggs.totalFollowers)}
Gross Impressions: ${formatNumber(aggs.totalImpressions)}
Total Traffic Driven: ${formatNumber(aggs.totalTraffic)}
Blended Engagement Rate: ${aggs.blendedEngagementRate.toFixed(2)}%
Total Spend: ${formatCurrency(aggs.totalSpend)}
Total Revenue: ${formatCurrency(aggs.totalRevenue)}
Blended ROI: ${aggs.blendedRoi.toFixed(1)}%
Top Performing Channel: ${aggs.bestChannel ? aggs.bestChannel.name : 'N/A'} (+${aggs.bestChannel ? aggs.bestChannel.roi.toFixed(1) : 0}%)

Channel Breakdown:
${aggs.computed.map(p => `• ${p.name}: Revenue: ${formatCurrency(p.revenue)} | Spend: ${formatCurrency(p.spend)} | ROI: ${p.roi.toFixed(1)}% | Traffic: ${formatNumber(p.traffic)}`).join('\n')}
Generated via ALL IN ONE Tools.`;

  navigator.clipboard.writeText(summary).then(() => {
    const btn = document.getElementById('btn-copy-summary');
    if (btn) {
      const original = btn.innerHTML;
      btn.textContent = 'Copied to Clipboard!';
      setTimeout(() => { btn.innerHTML = original; }, 2000);
    }
  });
}

function initEventHandlers() {
  // Chart Tabs
  const chartTabs = document.getElementById('chart-metric-tabs');
  if (chartTabs) {
    chartTabs.addEventListener('click', (e) => {
      const btn = e.target.closest('.chart-tab-btn');
      if (!btn) return;
      chartTabs.querySelectorAll('.chart-tab-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentChartMetric = btn.dataset.metric;
      renderChart();
    });
  }

  // Presets
  const btnEcom = document.getElementById('preset-ecommerce');
  const btnB2b = document.getElementById('preset-b2b');
  const btnCreator = document.getElementById('preset-creator');
  const btnReset = document.getElementById('preset-reset');

  const setPreset = (presetKey, clickedBtn) => {
    document.querySelectorAll('.preset-bar .chip-btn').forEach(b => b.classList.remove('active'));
    if (clickedBtn) clickedBtn.classList.add('active');

    if (presetKey === 'reset') {
      platformsState = JSON.parse(JSON.stringify(DEFAULT_PLATFORMS));
    } else if (PRESETS[presetKey]) {
      const source = PRESETS[presetKey];
      platformsState = DEFAULT_PLATFORMS.map(p => {
        const found = source.find(s => s.id === p.id);
        return found ? { ...p, ...found } : { ...p };
      });
    }
    updateAll(true);
  };

  if (btnEcom) btnEcom.addEventListener('click', () => setPreset('ecommerce', btnEcom));
  if (btnB2b) btnB2b.addEventListener('click', () => setPreset('b2b', btnB2b));
  if (btnCreator) btnCreator.addEventListener('click', () => setPreset('creator', btnCreator));
  if (btnReset) btnReset.addEventListener('click', () => setPreset('reset', btnReset));

  // Export & Copy
  const btnExport = document.getElementById('btn-export-csv');
  if (btnExport) btnExport.addEventListener('click', exportCSV);

  const btnCopy = document.getElementById('btn-copy-summary');
  if (btnCopy) btnCopy.addEventListener('click', copySummaryReport);
}

// Lifecycle
document.addEventListener('DOMContentLoaded', () => {
  initEventHandlers();
  updateAll(true);
});