// Trend Analyzer - Production Client-Side Logic
// Calculates MoM, YoY, CAGR, Seasonality Index, Volatility Index, and interactive SVG visualization.

document.addEventListener('DOMContentLoaded', () => {
  // Preset Datasets
  const PRESETS = {
    saas: [
      // 36 months (2022-2024)
      { label: '2022-01', value: 24500 }, { label: '2022-02', value: 25800 },
      { label: '2022-03', value: 27900 }, { label: '2022-04', value: 29400 },
      { label: '2022-05', value: 31200 }, { label: '2022-06', value: 33800 },
      { label: '2022-07', value: 35100 }, { label: '2022-08', value: 37400 },
      { label: '2022-09', value: 39800 }, { label: '2022-10', value: 42100 },
      { label: '2022-11', value: 45600 }, { label: '2022-12', value: 48900 },
      { label: '2023-01', value: 47800 }, { label: '2023-02', value: 50200 },
      { label: '2023-03', value: 54100 }, { label: '2023-04', value: 57500 },
      { label: '2023-05', value: 60800 }, { label: '2023-06', value: 65200 },
      { label: '2023-07', value: 68100 }, { label: '2023-08', value: 72400 },
      { label: '2023-09', value: 76900 }, { label: '2023-10', value: 81200 },
      { label: '2023-11', value: 87500 }, { label: '2023-12', value: 93200 },
      { label: '2024-01', value: 91500 }, { label: '2024-02', value: 95400 },
      { label: '2024-03', value: 102100 }, { label: '2024-04', value: 108500 },
      { label: '2024-05', value: 114200 }, { label: '2024-06', value: 122800 },
      { label: '2024-07', value: 128400 }, { label: '2024-08', value: 135900 },
      { label: '2024-09', value: 143200 }, { label: '2024-10', value: 151400 },
      { label: '2024-11', value: 164000 }, { label: '2024-12', value: 176500 }
    ],
    retail: [
      // 24 months (2023-2024) with seasonal holiday surges
      { label: '2023-01', value: 65000 }, { label: '2023-02', value: 58000 },
      { label: '2023-03', value: 72000 }, { label: '2023-04', value: 74500 },
      { label: '2023-05', value: 79000 }, { label: '2023-06', value: 84000 },
      { label: '2023-07', value: 81500 }, { label: '2023-08', value: 89000 },
      { label: '2023-09', value: 95000 }, { label: '2023-10', value: 104000 },
      { label: '2023-11', value: 148000 }, { label: '2023-12', value: 185000 },
      { label: '2024-01', value: 78000 }, { label: '2024-02', value: 71000 },
      { label: '2024-03', value: 88000 }, { label: '2024-04', value: 92000 },
      { label: '2024-05', value: 99500 }, { label: '2024-06', value: 106000 },
      { label: '2024-07', value: 103000 }, { label: '2024-08', value: 114000 },
      { label: '2024-09', value: 122000 }, { label: '2024-10', value: 136000 },
      { label: '2024-11', value: 198000 }, { label: '2024-12', value: 245000 }
    ],
    quarterly: [
      // 16 Quarters (2021 Q1 to 2024 Q4)
      { label: '2021-Q1', value: 310000 }, { label: '2021-Q2', value: 345000 },
      { label: '2021-Q3', value: 375000 }, { label: '2021-Q4', value: 420000 },
      { label: '2022-Q1', value: 410000 }, { label: '2022-Q2', value: 455000 },
      { label: '2022-Q3', value: 490000 }, { label: '2022-Q4', value: 550000 },
      { label: '2023-Q1', value: 535000 }, { label: '2023-Q2', value: 590000 },
      { label: '2023-Q3', value: 635000 }, { label: '2023-Q4', value: 720000 },
      { label: '2024-Q1', value: 695000 }, { label: '2024-Q2', value: 765000 },
      { label: '2024-Q3', value: 830000 }, { label: '2024-Q4', value: 950000 }
    ]
  };

  // State
  let dataPoints = JSON.parse(JSON.stringify(PRESETS.saas));
  let frequency = 12; // 12 = monthly, 4 = quarterly, 1 = annual
  let chartMode = 'both'; // 'both', 'values', 'growth'

  // DOM Elements
  const freqSelect = document.getElementById('series-frequency');
  const chartModeSelect = document.getElementById('chart-mode');
  const pointCountSpan = document.getElementById('data-point-count');
  const seriesTableBody = document.getElementById('series-tbody');
  const growthTableBody = document.getElementById('growth-tbody');
  const seasonTableBody = document.getElementById('season-tbody');

  // KPI Elements
  const kpiCagr = document.getElementById('kpi-cagr');
  const kpiCagrSpan = document.getElementById('kpi-cagr-span');
  const kpiAvgMom = document.getElementById('kpi-avg-mom');
  const kpiMomWinrate = document.getElementById('kpi-mom-winrate');
  const kpiVolatility = document.getElementById('kpi-volatility');
  const kpiVolRating = document.getElementById('kpi-volatility-rating');
  const kpiPeakSeason = document.getElementById('kpi-peak-season');
  const kpiPeakIndex = document.getElementById('kpi-peak-index');
  const kpiMaxDrawdown = document.getElementById('kpi-max-drawdown');
  const kpiDrawdownPeriod = document.getElementById('kpi-drawdown-period');
  const trendSummaryBadge = document.getElementById('trend-summary-badge');

  // Volatility Subview Elements
  const volMean = document.getElementById('vol-mean');
  const volStd = document.getElementById('vol-std');
  const volCv = document.getElementById('vol-cv');
  const volDrawdown = document.getElementById('vol-drawdown');
  const volAnalysisText = document.getElementById('volatility-analysis-text');

  // Seasonality Subview Elements
  const seasonPeakVal = document.getElementById('season-peak-val');
  const seasonPeakDesc = document.getElementById('season-peak-desc');
  const seasonTroughVal = document.getElementById('season-trough-val');
  const seasonTroughDesc = document.getElementById('season-trough-desc');

  // Tabs & Views
  const tabTableBtn = document.getElementById('tab-table-btn');
  const tabPasteBtn = document.getElementById('tab-paste-btn');
  const viewTable = document.getElementById('view-table-editor');
  const viewPaste = document.getElementById('view-paste-editor');
  const rawPasteInput = document.getElementById('raw-paste-input');
  const btnApplyPaste = document.getElementById('btn-apply-paste');

  const subtabGrowthBtn = document.getElementById('subtab-growth-btn');
  const subtabSeasonBtn = document.getElementById('subtab-season-btn');
  const subtabVolBtn = document.getElementById('subtab-volatility-btn');
  const subviewGrowth = document.getElementById('subview-growth');
  const subviewSeason = document.getElementById('subview-season');
  const subviewVol = document.getElementById('subview-volatility');

  // Presets & Buttons
  const presetSaasBtn = document.getElementById('preset-saas');
  const presetRetailBtn = document.getElementById('preset-retail');
  const presetQuarterlyBtn = document.getElementById('preset-quarterly');
  const btnAddRow = document.getElementById('btn-add-row');
  const btnClearData = document.getElementById('btn-clear-data');
  const btnResetPreset = document.getElementById('btn-reset-preset');
  const btnExportCsv = document.getElementById('btn-export-csv');
  const btnCopySummary = document.getElementById('btn-copy-summary');

  // Chart SVG & Tooltip
  const svg = document.getElementById('trend-svg');
  const chartWrap = document.getElementById('chart-wrap');
  const tooltip = document.getElementById('chart-tooltip');

  // Formatters
  function formatCurrency(val) {
    if (isNaN(val) || val === null || val === undefined) return '$0.00';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0
    }).format(val);
  }

  function formatPct(val, decimals = 1) {
    if (isNaN(val) || val === null || !isFinite(val)) return 'N/A';
    return `${val >= 0 ? '+' : ''}${val.toFixed(decimals)}%`;
  }

  // --- Analytical Calculations ---

  // 1. Period-over-Period (MoM/QoQ) and Year-over-Year (YoY)
  function computeGrowthMetrics(data, freq) {
    const n = data.length;
    const records = [];

    for (let i = 0; i < n; i++) {
      const cur = data[i].value;
      let momChange = null;
      let momPct = null;
      let yoyChange = null;
      let yoyPct = null;

      if (i > 0) {
        const prev = data[i - 1].value;
        momChange = cur - prev;
        momPct = prev !== 0 ? (momChange / prev) * 100 : 0;
      }

      if (i >= freq) {
        const prevYearVal = data[i - freq].value;
        yoyChange = cur - prevYearVal;
        yoyPct = prevYearVal !== 0 ? (yoyChange / prevYearVal) * 100 : 0;
      }

      records.push({
        label: data[i].label,
        value: cur,
        momChange,
        momPct,
        yoyChange,
        yoyPct
      });
    }

    return records;
  }

  // 2. Compound Annual Growth Rate (CAGR)
  function computeCAGR(data, freq) {
    const n = data.length;
    if (n < 2) return { cagr: 0, years: 0 };
    const firstVal = data[0].value;
    const lastVal = data[n - 1].value;
    if (firstVal <= 0 || lastVal <= 0) return { cagr: 0, years: (n - 1) / freq };

    const years = (n - 1) / freq;
    if (years === 0) return { cagr: 0, years: 0 };

    const cagr = (Math.pow(lastVal / firstVal, 1 / years) - 1) * 100;
    return { cagr, years };
  }

  // 3. Volatility Index & Risk
  function computeVolatility(data) {
    const n = data.length;
    if (n === 0) return { mean: 0, std: 0, cv: 0, maxDrawdown: 0, drawdownPeriod: '' };

    const vals = data.map(d => d.value);
    const sum = vals.reduce((a, b) => a + b, 0);
    const mean = sum / n;

    const variance = vals.reduce((acc, v) => acc + Math.pow(v - mean, 2), 0) / (n > 1 ? n - 1 : 1);
    const std = Math.sqrt(variance);
    const cv = mean !== 0 ? (std / mean) * 100 : 0;

    // Peak-to-Trough Drawdown
    let maxDrawdown = 0;
    let peak = vals[0];
    let peakIdx = 0;
    let ddPeriod = '';

    vals.forEach((v, i) => {
      if (v > peak) {
        peak = v;
        peakIdx = i;
      } else {
        const dd = peak > 0 ? ((peak - v) / peak) * 100 : 0;
        if (dd > maxDrawdown) {
          maxDrawdown = dd;
          ddPeriod = `from ${data[peakIdx].label} to ${data[i].label}`;
        }
      }
    });

    return { mean, std, cv, maxDrawdown, drawdownPeriod: ddPeriod || 'No drawdown' };
  }

  // 4. Seasonality Index Extraction
  function computeSeasonality(data, freq) {
    const n = data.length;
    if (n < freq) {
      return { indices: [], peak: null, trough: null };
    }

    const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    const quarterNames = ['Q1 - Winter/Early Spring', 'Q2 - Spring/Pre-Summer', 'Q3 - Summer/Back to School', 'Q4 - Holiday/Fiscal Close'];

    // Group values by cycle bucket (0 to freq - 1)
    const buckets = Array.from({ length: freq }, () => []);
    data.forEach((d, i) => {
      const bucketIdx = i % freq;
      buckets[bucketIdx].push(d.value);
    });

    const seriesMean = data.reduce((a, b) => a + b.value, 0) / n;
    const rawAverages = buckets.map(arr => arr.length > 0 ? (arr.reduce((a, b) => a + b, 0) / arr.length) : seriesMean);
    const overallAvgOfBuckets = rawAverages.reduce((a, b) => a + b, 0) / freq;

    // Seasonal Index = bucketAvg / overallAvgOfBuckets (Normalized so mean = 1.0)
    const indices = rawAverages.map((avg, i) => {
      const indexVal = overallAvgOfBuckets > 0 ? avg / overallAvgOfBuckets : 1;
      let name = `Period ${i + 1}`;
      if (freq === 12) name = monthNames[i];
      if (freq === 4) name = quarterNames[i];
      return {
        cycleIndex: i,
        name,
        index: indexVal,
        variancePct: (indexVal - 1) * 100
      };
    });

    // Sort to find peak and trough
    const sorted = [...indices].sort((a, b) => b.index - a.index);
    const peak = sorted[0];
    const trough = sorted[sorted.length - 1];

    return { indices, peak, trough };
  }

  // 5. Linear Trend Overlay (y = mx + b)
  function computeLinearTrend(data) {
    const n = data.length;
    if (n < 2) return data.map(d => d.value);

    let sumX = 0, sumY = 0, sumXY = 0, sumXX = 0;
    for (let i = 0; i < n; i++) {
      const x = i;
      const y = data[i].value;
      sumX += x;
      sumY += y;
      sumXY += x * y;
      sumXX += x * x;
    }
    const meanX = sumX / n;
    const meanY = sumY / n;
    const denom = sumXX - sumX * meanX;
    const slope = denom === 0 ? 0 : (sumXY - sumX * meanY) / denom;
    const intercept = meanY - slope * meanX;

    return data.map((_, i) => slope * i + intercept);
  }

  // --- Main Refresh Controller ---
  function updateAll() {
    if (dataPoints.length === 0) {
      renderEmptyState();
      return;
    }

    pointCountSpan.textContent = dataPoints.length;
    const n = dataPoints.length;

    // Run Calculations
    const growthRecords = computeGrowthMetrics(dataPoints, frequency);
    const { cagr, years } = computeCAGR(dataPoints, frequency);
    const vol = computeVolatility(dataPoints);
    const seasonality = computeSeasonality(dataPoints, frequency);
    const trendLine = computeLinearTrend(dataPoints);

    // Compute MoM Statistics
    const momValid = growthRecords.filter(r => r.momPct !== null);
    const avgMom = momValid.length > 0 ? (momValid.reduce((a, b) => a + b.momPct, 0) / momValid.length) : 0;
    const positivePeriods = momValid.filter(r => r.momPct > 0).length;
    const winRate = momValid.length > 0 ? (positivePeriods / momValid.length) * 100 : 0;

    // Update KPI Header Cards
    kpiCagr.textContent = `${cagr >= 0 ? '+' : ''}${cagr.toFixed(1)}%`;
    kpiCagrSpan.textContent = `Annualized (${years.toFixed(1)} Yrs)`;

    kpiAvgMom.textContent = formatPct(avgMom);
    kpiMomWinrate.textContent = `${winRate.toFixed(0)}% Positive Intervals`;

    kpiVolatility.textContent = `${vol.cv.toFixed(1)}%`;
    if (vol.cv < 15) {
      kpiVolRating.textContent = 'Low / Stable Volatility';
      kpiVolRating.style.color = 'var(--success)';
    } else if (vol.cv <= 30) {
      kpiVolRating.textContent = 'Moderate Volatility';
      kpiVolRating.style.color = 'var(--warning)';
    } else {
      kpiVolRating.textContent = 'High Volatility';
      kpiVolRating.style.color = 'var(--error)';
    }

    if (seasonality.peak) {
      kpiPeakSeason.textContent = seasonality.peak.name.slice(0, 3);
      kpiPeakIndex.textContent = `${seasonality.peak.variancePct >= 0 ? '+' : ''}${seasonality.peak.variancePct.toFixed(0)}% vs Baseline`;
    } else {
      kpiPeakSeason.textContent = 'N/A';
      kpiPeakIndex.textContent = 'Needs ≥ 1 Cycle';
    }

    kpiMaxDrawdown.textContent = `-${vol.maxDrawdown.toFixed(1)}%`;
    kpiDrawdownPeriod.textContent = vol.drawdownPeriod;

    // Update Summary Badge
    if (cagr > 20 && avgMom > 1.5) {
      trendSummaryBadge.textContent = 'Strong Bullish Expansion';
      trendSummaryBadge.style.color = 'var(--success)';
    } else if (cagr > 5) {
      trendSummaryBadge.textContent = 'Moderate Upward Trend';
      trendSummaryBadge.style.color = 'var(--accent)';
    } else if (cagr > -5) {
      trendSummaryBadge.textContent = 'Horizontal Consolidation';
      trendSummaryBadge.style.color = 'var(--warning)';
    } else {
      trendSummaryBadge.textContent = 'Contraction / Downtrend';
      trendSummaryBadge.style.color = 'var(--error)';
    }

    // Render Subview 1: Growth Table
    renderGrowthTable(growthRecords);

    // Render Subview 2: Seasonality
    renderSeasonality(seasonality);

    // Render Subview 3: Volatility & Risk
    renderVolatility(vol, avgMom);

    // Render Interactive SVG Visualizer
    renderSVG({
      dataPoints,
      growthRecords,
      trendLine,
      seasonality,
      chartMode
    });
  }

  // --- Render Growth Table ---
  function renderGrowthTable(records) {
    growthTableBody.innerHTML = '';
    records.forEach(r => {
      const tr = document.createElement('tr');
      const momBadge = r.momPct === null
        ? '<span class="growth-tag growth-flat">Baseline</span>'
        : `<span class="growth-tag ${r.momPct >= 0 ? 'growth-up' : 'growth-down'}">${formatPct(r.momPct)}</span>`;

      const yoyBadge = r.yoyPct === null
        ? '<span style="color: var(--text-tertiary); font-size: 0.8rem;">–</span>'
        : `<span class="growth-tag ${r.yoyPct >= 0 ? 'growth-up' : 'growth-down'}">${formatPct(r.yoyPct)}</span>`;

      tr.innerHTML = `
        <td><strong style="color: var(--text-primary);">${r.label}</strong></td>
        <td><strong>${formatCurrency(r.value)}</strong></td>
        <td style="color: ${r.momChange >= 0 ? 'var(--success)' : (r.momChange < 0 ? 'var(--error)' : 'inherit')};">
          ${r.momChange !== null ? formatCurrency(r.momChange) : '–'}
        </td>
        <td>${momBadge}</td>
        <td>${yoyBadge}</td>
      `;
      growthTableBody.appendChild(tr);
    });
  }

  // --- Render Seasonality Subview ---
  function renderSeasonality(seasonality) {
    seasonTableBody.innerHTML = '';
    if (!seasonality.peak || seasonality.indices.length === 0) {
      seasonTableBody.innerHTML = '<tr><td colspan="4" style="text-align: center; color: var(--text-tertiary); padding: 1.5rem;">Insufficient data points for full seasonal cycle decomposition (requires at least 1 full cycle).</td></tr>';
      seasonPeakVal.textContent = 'N/A';
      seasonTroughVal.textContent = 'N/A';
      return;
    }

    seasonPeakVal.textContent = seasonality.peak.name;
    seasonPeakDesc.textContent = `Index ${seasonality.peak.index.toFixed(2)} (${formatPct(seasonality.peak.variancePct)} vs baseline)`;

    seasonTroughVal.textContent = seasonality.trough.name;
    seasonTroughDesc.textContent = `Index ${seasonality.trough.index.toFixed(2)} (${formatPct(seasonality.trough.variancePct)} vs baseline)`;

    seasonality.indices.forEach(item => {
      const pctOfMax = Math.min(100, (item.index / (seasonality.peak.index || 1)) * 100);
      const isPeak = item.cycleIndex === seasonality.peak.cycleIndex;
      const isTrough = item.cycleIndex === seasonality.trough.cycleIndex;

      const barColor = isPeak ? 'var(--success)' : (isTrough ? 'var(--error)' : 'var(--accent)');

      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>
          <strong>${item.name}</strong>
          ${isPeak ? ' <span class="badge" style="background: rgba(16,185,129,0.2); color: var(--success); font-size: 0.65rem;">Peak</span>' : ''}
          ${isTrough ? ' <span class="badge" style="background: rgba(239,68,68,0.2); color: var(--error); font-size: 0.65rem;">Trough</span>' : ''}
        </td>
        <td><strong>${item.index.toFixed(2)}</strong></td>
        <td style="width: 35%;">
          <div class="season-bar-container">
            <div class="season-bar" style="width: ${pctOfMax}%; background: ${barColor};"></div>
          </div>
        </td>
        <td style="font-weight: 600; color: ${item.variancePct >= 0 ? 'var(--success)' : 'var(--error)'};">
          ${formatPct(item.variancePct)}
        </td>
      `;
      seasonTableBody.appendChild(tr);
    });
  }

  // --- Render Volatility & Risk ---
  function renderVolatility(vol, avgMom) {
    volMean.textContent = formatCurrency(vol.mean);
    volStd.textContent = formatCurrency(vol.std);
    volCv.textContent = `${vol.cv.toFixed(1)}%`;
    volDrawdown.textContent = `-${vol.maxDrawdown.toFixed(1)}%`;

    let assessment = '';
    if (vol.cv < 15) {
      assessment = `<strong>Low Volatility Profile:</strong> The dataset exhibits remarkable structural stability with a Coefficient of Variation of <strong>${vol.cv.toFixed(1)}%</strong>. Period-over-period variance is predictable, making standard forecasting highly reliable. Maximum drawdown is contained at <strong>-${vol.maxDrawdown.toFixed(1)}%</strong>.`;
    } else if (vol.cv <= 30) {
      assessment = `<strong>Moderate Volatility Profile:</strong> The dataset shows healthy cyclical or seasonal amplitude (CV of <strong>${vol.cv.toFixed(1)}%</strong>). Fluctuations correlate with seasonal swings or marketing pushes, but fundamental momentum remains intact with average interval growth of <strong>${formatPct(avgMom)}</strong>.`;
    } else {
      assessment = `<strong>High Volatility / Irregular Profile:</strong> Elevated variability detected with a Coefficient of Variation of <strong>${vol.cv.toFixed(1)}%</strong> and peak drawdown of <strong>-${vol.maxDrawdown.toFixed(1)}%</strong> (${vol.drawdownPeriod}). Recommend applying smoothing filters or deeper anomaly inspection.`;
    }

    volAnalysisText.innerHTML = assessment;
  }

  // --- Interactive SVG Visualizer ---
  function renderSVG({ dataPoints, growthRecords, trendLine, seasonality, chartMode }) {
    const n = dataPoints.length;
    const width = 800;
    const height = 400;

    const margin = { top: 30, right: 30, bottom: 45, left: 75 };
    const plotWidth = width - margin.left - margin.right;
    const plotHeight = height - margin.top - margin.bottom;

    // Split heights depending on chart mode
    let topPaneHeight = plotHeight;
    let bottomPaneHeight = 0;
    let paneGap = 0;

    if (chartMode === 'both') {
      topPaneHeight = plotHeight * 0.65;
      bottomPaneHeight = plotHeight * 0.28;
      paneGap = plotHeight * 0.07;
    } else if (chartMode === 'growth') {
      topPaneHeight = 0;
      bottomPaneHeight = plotHeight;
    }

    // Value Axis Bounds (Top Pane)
    const vals = dataPoints.map(d => d.value);
    const minVal = Math.min(...vals, ...trendLine);
    const maxVal = Math.max(...vals, ...trendLine);
    const padVal = (maxVal - minVal) * 0.1 || 1000;
    const yValMin = Math.max(0, Math.floor((minVal - padVal) / 1000) * 1000);
    const yValMax = Math.ceil((maxVal + padVal) / 1000) * 1000;

    // Growth Axis Bounds (Bottom Pane)
    const momVals = growthRecords.map(r => r.momPct).filter(v => v !== null);
    const maxAbsMom = momVals.length > 0 ? Math.max(10, Math.ceil(Math.max(...momVals.map(Math.abs)) * 1.25)) : 20;

    // Coordinates mapping
    function getX(i) {
      return margin.left + (i / Math.max(1, n - 1)) * plotWidth;
    }

    function getYVal(val) {
      const pct = (val - yValMin) / (yValMax - yValMin || 1);
      return margin.top + topPaneHeight - pct * topPaneHeight;
    }

    function getYGrowth(pct) {
      const bTop = margin.top + topPaneHeight + paneGap;
      const zeroY = bTop + bottomPaneHeight / 2;
      const offset = (pct / maxAbsMom) * (bottomPaneHeight / 2);
      return zeroY - offset;
    }

    let svgHtml = '';

    // --- RENDER TOP PANE (Values & Trend) ---
    if (chartMode !== 'growth') {
      // Top Gridlines
      const ySteps = 4;
      for (let s = 0; s <= ySteps; s++) {
        const val = yValMin + ((yValMax - yValMin) / ySteps) * s;
        const yPos = getYVal(val);
        svgHtml += `
          <line x1="${margin.left}" y1="${yPos}" x2="${width - margin.right}" y2="${yPos}" stroke="var(--border)" stroke-dasharray="3,3" opacity="0.6" />
          <text x="${margin.left - 10}" y="${yPos + 4}" fill="var(--text-tertiary)" font-size="10" text-anchor="end">${formatCurrency(val)}</text>
        `;
      }

      // Linear Trendline
      let trendD = '';
      trendLine.forEach((val, i) => {
        trendD += `${i === 0 ? 'M' : 'L'} ${getX(i)} ${getYVal(val)} `;
      });
      svgHtml += `<path d="${trendD}" fill="none" stroke="#818cf8" stroke-width="2" stroke-dasharray="6,4" opacity="0.75" />`;

      // Value Area Gradient & Line
      let areaD = `M ${getX(0)} ${getYVal(vals[0])} `;
      let lineD = `M ${getX(0)} ${getYVal(vals[0])} `;
      for (let i = 1; i < n; i++) {
        const ptX = getX(i);
        const ptY = getYVal(vals[i]);
        areaD += `L ${ptX} ${ptY} `;
        lineD += `L ${ptX} ${ptY} `;
      }
      areaD += `L ${getX(n - 1)} ${margin.top + topPaneHeight} L ${getX(0)} ${margin.top + topPaneHeight} Z`;

      svgHtml += `
        <defs>
          <linearGradient id="trendAreaGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stop-color="#38bdf8" stop-opacity="0.25" />
            <stop offset="100%" stop-color="#38bdf8" stop-opacity="0.0" />
          </linearGradient>
        </defs>
        <path d="${areaD}" fill="url(#trendAreaGrad)" />
        <path d="${lineD}" fill="none" stroke="#38bdf8" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" />
      `;

      // Value Points
      dataPoints.forEach((d, i) => {
        const ptX = getX(i);
        const ptY = getYVal(d.value);
        svgHtml += `
          <circle cx="${ptX}" cy="${ptY}" r="4" fill="var(--bg-secondary)" stroke="#38bdf8" stroke-width="2" class="chart-point" data-idx="${i}" style="cursor: pointer;" />
        `;
      });
    }

    // --- RENDER BOTTOM PANE (MoM Growth % Bars) ---
    if (chartMode !== 'values') {
      const bTop = chartMode === 'both' ? (margin.top + topPaneHeight + paneGap) : margin.top;
      const bHeight = chartMode === 'both' ? bottomPaneHeight : plotHeight;
      const zeroY = bTop + bHeight / 2;

      // Zero Baseline
      svgHtml += `
        <line x1="${margin.left}" y1="${zeroY}" x2="${width - margin.right}" y2="${zeroY}" stroke="var(--text-tertiary)" stroke-width="1.2" />
        <text x="${margin.left - 10}" y="${zeroY + 3}" fill="var(--text-tertiary)" font-size="10" text-anchor="end">0.0%</text>
        <text x="${margin.left - 10}" y="${bTop + 10}" fill="var(--text-tertiary)" font-size="10" text-anchor="end">+${maxAbsMom}%</text>
        <text x="${margin.left - 10}" y="${bTop + bHeight - 2}" fill="var(--text-tertiary)" font-size="10" text-anchor="end">-${maxAbsMom}%</text>
      `;

      // Render Growth Bars
      const barWidth = Math.max(3, Math.min(18, (plotWidth / n) * 0.6));

      growthRecords.forEach((rec, i) => {
        if (rec.momPct === null) return;
        const xPos = getX(i);
        const yPos = getYGrowth(rec.momPct);
        const isPos = rec.momPct >= 0;
        const barH = Math.abs(yPos - zeroY);
        const barTop = isPos ? yPos : zeroY;

        svgHtml += `
          <rect x="${xPos - barWidth / 2}" y="${barTop}" width="${barWidth}" height="${Math.max(1, barH)}" fill="${isPos ? '#10b981' : '#ef4444'}" opacity="0.8" rx="2" class="chart-bar" data-idx="${i}" style="cursor: pointer;" />
        `;
      });
    }

    // --- X-AXIS LABELS ---
    const labelY = height - margin.bottom + 18;
    const stepLabel = n > 20 ? Math.ceil(n / 10) : 1;

    dataPoints.forEach((d, i) => {
      if (i % stepLabel === 0 || i === n - 1) {
        svgHtml += `
          <text x="${getX(i)}" y="${labelY}" fill="var(--text-tertiary)" font-size="10" text-anchor="middle" font-family="sans-serif">${d.label}</text>
        `;
      }
    });

    svg.innerHTML = svgHtml;

    // Attach Tooltip
    attachChartTooltip(dataPoints, growthRecords);
  }

  // --- Attach Tooltips ---
  function attachChartTooltip(dataPoints, growthRecords) {
    const targets = svg.querySelectorAll('.chart-point, .chart-bar');

    targets.forEach(el => {
      el.addEventListener('mouseenter', () => {
        const idx = parseInt(el.getAttribute('data-idx'), 10);
        const item = dataPoints[idx];
        const rec = growthRecords[idx];

        const rect = el.getBoundingClientRect();
        const wrapRect = chartWrap.getBoundingClientRect();

        const x = rect.left - wrapRect.left + rect.width / 2;
        const y = rect.top - wrapRect.top;

        tooltip.innerHTML = `
          <div style="font-weight: 700; color: #38bdf8;">${item.label}</div>
          <div>Value: <strong>${formatCurrency(item.value)}</strong></div>
          <div>MoM Change: <strong style="color:${rec.momPct >= 0 ? 'var(--success)' : 'var(--error)'};">${formatPct(rec.momPct)} (${rec.momChange !== null ? formatCurrency(rec.momChange) : '–'})</strong></div>
          ${rec.yoyPct !== null ? `<div>YoY Growth: <strong style="color:${rec.yoyPct >= 0 ? 'var(--success)' : 'var(--error)'};">${formatPct(rec.yoyPct)}</strong></div>` : ''}
        `;

        tooltip.style.left = `${x}px`;
        tooltip.style.top = `${y}px`;
        tooltip.style.opacity = '1';
      });

      el.addEventListener('mouseleave', () => {
        tooltip.style.opacity = '0';
      });
    });
  }

  // --- Render Input Table ---
  function renderSeriesTable() {
    seriesTableBody.innerHTML = '';
    dataPoints.forEach((d, idx) => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td style="color: var(--text-tertiary); font-size: 0.8rem;">#${idx + 1}</td>
        <td><input type="text" class="table-input cell-label" data-idx="${idx}" value="${d.label}" /></td>
        <td><input type="number" class="table-input cell-value" data-idx="${idx}" value="${d.value}" step="any" /></td>
        <td style="text-align: center;">
          <button class="btn-del-row" data-idx="${idx}" style="background:transparent; border:none; color:var(--text-tertiary); cursor:pointer; font-size:1.1rem; padding: 0.1rem 0.4rem;" title="Remove row">✕</button>
        </td>
      `;
      seriesTableBody.appendChild(tr);
    });

    seriesTableBody.querySelectorAll('.cell-label').forEach(inp => {
      inp.addEventListener('input', (e) => {
        const idx = parseInt(e.target.getAttribute('data-idx'), 10);
        dataPoints[idx].label = e.target.value.trim();
        updateAll();
      });
    });

    seriesTableBody.querySelectorAll('.cell-value').forEach(inp => {
      inp.addEventListener('input', (e) => {
        const idx = parseInt(e.target.getAttribute('data-idx'), 10);
        const val = parseFloat(e.target.value);
        dataPoints[idx].value = isNaN(val) ? 0 : val;
        updateAll();
      });
    });

    seriesTableBody.querySelectorAll('.btn-del-row').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const idx = parseInt(e.currentTarget.getAttribute('data-idx'), 10);
        dataPoints.splice(idx, 1);
        renderSeriesTable();
        updateAll();
      });
    });
  }

  function renderEmptyState() {
    growthTableBody.innerHTML = '<tr><td colspan="5" style="text-align: center; color: var(--text-tertiary); padding: 2rem;">Please add historical data points.</td></tr>';
    seasonTableBody.innerHTML = '<tr><td colspan="4" style="text-align: center; color: var(--text-tertiary); padding: 1.5rem;">No data available.</td></tr>';
    svg.innerHTML = '<text x="400" y="200" fill="var(--text-tertiary)" font-size="14" text-anchor="middle">No data loaded.</text>';
    kpiCagr.textContent = '0.0%';
    kpiAvgMom.textContent = '0.0%';
    kpiVolatility.textContent = '0.0%';
    kpiMaxDrawdown.textContent = '-0.0%';
  }

  // --- Batch Raw Paste Parser ---
  function parseBatchPaste(rawText) {
    if (!rawText.trim()) return [];
    const lines = rawText.split(/\r?\n/).filter(line => line.trim().length > 0);
    const parsed = [];

    lines.forEach((line, idx) => {
      const parts = line.split(/[,\t;:]/).map(p => p.trim());
      if (parts.length >= 2) {
        const label = parts[0];
        const val = parseFloat(parts[1].replace(/[\$, ]/g, ''));
        if (!isNaN(val)) parsed.push({ label, value: val });
      } else if (parts.length === 1) {
        const val = parseFloat(parts[0].replace(/[\$, ]/g, ''));
        if (!isNaN(val)) parsed.push({ label: `Period ${idx + 1}`, value: val });
      }
    });

    return parsed;
  }

  // --- Export CSV ---
  function exportCSV() {
    if (dataPoints.length === 0) return;
    const records = computeGrowthMetrics(dataPoints, frequency);
    let csv = 'Period,Value,MoM_Change,MoM_Percent,YoY_Percent\r\n';

    records.forEach(r => {
      csv += `"${r.label}",${r.value},${r.momChange !== null ? r.momChange : ''},${r.momPct !== null ? r.momPct.toFixed(2) : ''},${r.yoyPct !== null ? r.yoyPct.toFixed(2) : ''}\r\n`;
    });

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'trend_growth_analysis.csv';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  // --- Copy Summary Report ---
  function copySummaryReport() {
    const cagr = kpiCagr.textContent;
    const mom = kpiAvgMom.textContent;
    const vol = kpiVolatility.textContent;
    const peak = `${kpiPeakSeason.textContent} (${kpiPeakIndex.textContent})`;
    const dd = kpiMaxDrawdown.textContent;

    const report = `TREND ANALYZER EXECUTIVE SUMMARY\n---------------------------------------\nAnnualized CAGR: ${cagr}\nAverage Period Growth (MoM): ${mom}\nVolatility Index (CV): ${vol}\nPeak Seasonality: ${peak}\nMax Drawdown: ${dd}\nData Points: ${dataPoints.length}\n\nGenerated via ALL-IN-ONE Trend Analyzer`;

    navigator.clipboard.writeText(report).then(() => {
      btnCopySummary.textContent = 'Copied!';
      setTimeout(() => {
        btnCopySummary.innerHTML = `
          <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
          Copy Report
        `;
      }, 2000);
    });
  }

  // --- Event Listeners Setup ---
  freqSelect.addEventListener('change', (e) => {
    frequency = parseInt(e.target.value, 10);
    updateAll();
  });

  chartModeSelect.addEventListener('change', (e) => {
    chartMode = e.target.value;
    updateAll();
  });

  function setPreset(key, btn, freq) {
    [presetSaasBtn, presetRetailBtn, presetQuarterlyBtn].forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    dataPoints = JSON.parse(JSON.stringify(PRESETS[key]));
    frequency = freq;
    freqSelect.value = freq;
    renderSeriesTable();
    updateAll();
  }

  presetSaasBtn.addEventListener('click', () => setPreset('saas', presetSaasBtn, 12));
  presetRetailBtn.addEventListener('click', () => setPreset('retail', presetRetailBtn, 12));
  presetQuarterlyBtn.addEventListener('click', () => setPreset('quarterly', presetQuarterlyBtn, 4));

  btnAddRow.addEventListener('click', () => {
    const lastLabel = dataPoints.length > 0 ? dataPoints[dataPoints.length - 1].label : 'P0';
    const lastVal = dataPoints.length > 0 ? dataPoints[dataPoints.length - 1].value : 50000;
    dataPoints.push({ label: `${lastLabel}+1`, value: Math.round(lastVal * 1.03) });
    renderSeriesTable();
    updateAll();
  });

  btnClearData.addEventListener('click', () => {
    dataPoints = [];
    renderSeriesTable();
    updateAll();
  });

  btnResetPreset.addEventListener('click', () => {
    setPreset('saas', presetSaasBtn, 12);
  });

  // Table vs Paste Tabs
  tabTableBtn.addEventListener('click', () => {
    tabTableBtn.classList.add('active');
    tabPasteBtn.classList.remove('active');
    viewTable.classList.remove('hidden');
    viewPaste.classList.add('hidden');
  });

  tabPasteBtn.addEventListener('click', () => {
    tabPasteBtn.classList.add('active');
    tabTableBtn.classList.remove('active');
    viewPaste.classList.remove('hidden');
    viewTable.classList.add('hidden');
    rawPasteInput.value = dataPoints.map(d => `${d.label}, ${d.value}`).join('\n');
  });

  btnApplyPaste.addEventListener('click', () => {
    const parsed = parseBatchPaste(rawPasteInput.value);
    if (parsed.length >= 2) {
      dataPoints = parsed;
      renderSeriesTable();
      updateAll();
      tabTableBtn.click();
    } else {
      alert('Please provide at least 2 valid lines in the format: Label, Value');
    }
  });

  // Subtabs
  function setSubtab(activeBtn, activeView) {
    [subtabGrowthBtn, subtabSeasonBtn, subtabVolBtn].forEach(b => b.classList.remove('active'));
    [subviewGrowth, subviewSeason, subviewVol].forEach(v => v.classList.add('hidden'));
    activeBtn.classList.add('active');
    activeView.classList.remove('hidden');
  }

  subtabGrowthBtn.addEventListener('click', () => setSubtab(subtabGrowthBtn, subviewGrowth));
  subtabSeasonBtn.addEventListener('click', () => setSubtab(subtabSeasonBtn, subviewSeason));
  subtabVolBtn.addEventListener('click', () => setSubtab(subtabVolBtn, subviewVol));

  // Action Buttons
  btnExportCsv.addEventListener('click', exportCSV);
  btnCopySummary.addEventListener('click', copySummaryReport);

  // Initialize
  renderSeriesTable();
  updateAll();
});