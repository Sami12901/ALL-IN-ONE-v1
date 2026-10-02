// Forecast Calculator - Production Client-Side Logic
// Supports Linear Regression, 3-Period & 5-Period Moving Averages, Exponential Smoothing, and Confidence Intervals.

document.addEventListener('DOMContentLoaded', () => {
  // Preset Datasets
  const PRESETS = {
    saas: [
      { label: 'Jan', value: 12500 },
      { label: 'Feb', value: 14200 },
      { label: 'Mar', value: 15800 },
      { label: 'Apr', value: 18100 },
      { label: 'May', value: 19400 },
      { label: 'Jun', value: 22000 },
      { label: 'Jul', value: 23800 },
      { label: 'Aug', value: 25900 },
      { label: 'Sep', value: 27400 },
      { label: 'Oct', value: 29800 },
      { label: 'Nov', value: 32100 },
      { label: 'Dec', value: 34500 }
    ],
    retail: [
      { label: 'M01', value: 45000 },
      { label: 'M02', value: 42000 },
      { label: 'M03', value: 48000 },
      { label: 'M04', value: 51000 },
      { label: 'M05', value: 53500 },
      { label: 'M06', value: 59000 },
      { label: 'M07', value: 57500 },
      { label: 'M08', value: 62000 },
      { label: 'M09', value: 68000 },
      { label: 'M10', value: 74000 },
      { label: 'M11', value: 92000 },
      { label: 'M12', value: 108000 }
    ],
    tech: [
      { label: 'Q1-23', value: 180000 },
      { label: 'Q2-23', value: 195000 },
      { label: 'Q3-23', value: 210000 },
      { label: 'Q4-23', value: 235000 },
      { label: 'Q1-24', value: 242000 },
      { label: 'Q2-24', value: 260000 },
      { label: 'Q3-24', value: 278000 },
      { label: 'Q4-24', value: 310000 }
    ]
  };

  // State
  let dataPoints = JSON.parse(JSON.stringify(PRESETS.saas));
  let primaryModel = 'linear'; // 'linear', 'sma3', 'sma5', 'exp'
  let horizonPeriods = 6;
  let confidenceLevel = 0.95;
  let alphaFactor = 0.30;
  let visibleSeries = {
    actual: true,
    linear: true,
    sma3: true,
    sma5: true,
    exp: true,
    ci: true
  };

  // DOM Elements
  const primaryModelSelect = document.getElementById('primary-model');
  const horizonSelect = document.getElementById('forecast-periods');
  const confidenceSelect = document.getElementById('confidence-level');
  const alphaSlider = document.getElementById('alpha-slider');
  const alphaValDisplay = document.getElementById('alpha-val');
  const tableBody = document.getElementById('historical-tbody');
  const projectionTbody = document.getElementById('projection-tbody');
  const comparisonTbody = document.getElementById('comparison-tbody');
  const pointCountSpan = document.getElementById('data-point-count');
  const modelActiveBadge = document.getElementById('model-active-badge');
  const ciNote = document.getElementById('ci-note');

  // KPI Elements
  const kpiNext = document.getElementById('kpi-next-forecast');
  const kpiNextDelta = document.getElementById('kpi-next-delta');
  const kpiTotal = document.getElementById('kpi-total-forecast');
  const kpiHorizonLbl = document.getElementById('kpi-horizon-lbl');
  const kpiR2 = document.getElementById('kpi-r2');
  const kpiFitQuality = document.getElementById('kpi-fit-quality');
  const kpiGrowth = document.getElementById('kpi-growth-rate');
  const kpiSlopeLbl = document.getElementById('kpi-slope-lbl');
  const kpiMae = document.getElementById('kpi-mae');

  // Tabs
  const tabTableBtn = document.getElementById('tab-table-btn');
  const tabPasteBtn = document.getElementById('tab-paste-btn');
  const viewTable = document.getElementById('view-table-editor');
  const viewPaste = document.getElementById('view-paste-editor');
  const rawPasteInput = document.getElementById('raw-paste-input');
  const btnApplyPaste = document.getElementById('btn-apply-paste');

  // Action Buttons
  const btnAddRow = document.getElementById('btn-add-row');
  const btnClearData = document.getElementById('btn-clear-data');
  const btnResetPreset = document.getElementById('btn-reset-preset');
  const btnExportCsv = document.getElementById('btn-export-csv');
  const btnCopySummary = document.getElementById('btn-copy-summary');

  // Presets Buttons
  const presetSaasBtn = document.getElementById('preset-saas');
  const presetRetailBtn = document.getElementById('preset-retail');
  const presetTechBtn = document.getElementById('preset-tech');

  // SVG and Tooltip
  const svg = document.getElementById('forecast-svg');
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

  function formatNumber(val, decimals = 2) {
    if (isNaN(val)) return '0.00';
    return Number(val).toLocaleString('en-US', {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals
    });
  }

  // --- Mathematical Time-Series Projection Models ---

  // 1. Linear Regression (y = mx + b)
  function computeLinearRegression(data) {
    const n = data.length;
    if (n < 2) {
      return { slope: 0, intercept: data[0]?.value || 0, r2: 0, fitted: data.map(d => d.value), se: 0 };
    }

    let sumX = 0, sumY = 0, sumXY = 0, sumXX = 0;
    for (let i = 0; i < n; i++) {
      const x = i + 1;
      const y = data[i].value;
      sumX += x;
      sumY += y;
      sumXY += x * y;
      sumXX += x * x;
    }

    const meanX = sumX / n;
    const meanY = sumY / n;
    const denominator = sumXX - sumX * meanX;
    const slope = denominator === 0 ? 0 : (sumXY - sumX * meanY) / denominator;
    const intercept = meanY - slope * meanX;

    let ssTot = 0, ssRes = 0;
    const fitted = [];
    for (let i = 0; i < n; i++) {
      const x = i + 1;
      const y = data[i].value;
      const yHat = slope * x + intercept;
      fitted.push(yHat);
      ssTot += Math.pow(y - meanY, 2);
      ssRes += Math.pow(y - yHat, 2);
    }

    const r2 = ssTot === 0 ? 1 : Math.max(0, 1 - (ssRes / ssTot));
    const se = Math.sqrt(ssRes / Math.max(1, n - 2));

    return { slope, intercept, r2, fitted, se, meanX, ssX: denominator };
  }

  // 2. Simple Moving Average (SMA-k)
  function computeMovingAverage(data, windowSize, horizon) {
    const n = data.length;
    const fitted = [];
    for (let i = 0; i < n; i++) {
      if (i < windowSize - 1) {
        fitted.push(null);
      } else {
        let sum = 0;
        for (let j = 0; j < windowSize; j++) {
          sum += data[i - j].value;
        }
        fitted.push(sum / windowSize);
      }
    }

    // Iterative projections into horizon
    const future = [];
    const pool = data.map(d => d.value);
    for (let h = 0; h < horizon; h++) {
      let sum = 0;
      const startIdx = pool.length - windowSize;
      for (let j = 0; j < windowSize; j++) {
        sum += pool[startIdx + j] || 0;
      }
      const nextVal = sum / windowSize;
      future.push(nextVal);
      pool.push(nextVal);
    }

    return { fitted, future };
  }

  // 3. Exponential Smoothing (Holt-Winters Trend Adjusted)
  function computeExponentialSmoothing(data, alpha, horizon) {
    const n = data.length;
    if (n === 0) return { fitted: [], future: [] };
    if (n === 1) {
      return {
        fitted: [data[0].value],
        future: Array(horizon).fill(data[0].value)
      };
    }

    const beta = 0.20; // Trend smoothing parameter
    let level = data[0].value;
    let trend = data[1].value - data[0].value;

    const fitted = [level];

    for (let i = 1; i < n; i++) {
      const prevLevel = level;
      const prevTrend = trend;
      const actual = data[i].value;

      level = alpha * actual + (1 - alpha) * (prevLevel + prevTrend);
      trend = beta * (level - prevLevel) + (1 - beta) * prevTrend;
      fitted.push(level);
    }

    const future = [];
    for (let h = 1; h <= horizon; h++) {
      future.push(level + h * trend);
    }

    return { fitted, future };
  }

  // Compute confidence interval multiplier
  function getZMultiplier(ci) {
    if (ci <= 0.82) return 1.282; // 80%
    if (ci <= 0.92) return 1.645; // 90%
    return 1.960; // 95%
  }

  // Calculate MAE (Mean Absolute Error)
  function calculateMAE(actuals, fitted) {
    let sumAbs = 0;
    let count = 0;
    for (let i = 0; i < actuals.length; i++) {
      if (fitted[i] !== null && !isNaN(fitted[i])) {
        sumAbs += Math.abs(actuals[i].value - fitted[i]);
        count++;
      }
    }
    return count > 0 ? sumAbs / count : 0;
  }

  // Generate Future Period Label
  function getNextPeriodLabel(lastLabel, step) {
    if (!lastLabel) return `Period ${step}`;
    // If ends in year/month pattern (e.g., M01, Jan, Q1)
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const monthIdx = monthNames.indexOf(lastLabel);
    if (monthIdx !== -1) {
      const nextIdx = (monthIdx + step) % 12;
      return monthNames[nextIdx];
    }
    const qMatch = lastLabel.match(/Q([1-4])[-/ ]?(\d{2,4})?/i);
    if (qMatch) {
      let q = parseInt(qMatch[1], 10);
      let yr = qMatch[2] ? parseInt(qMatch[2], 10) : 25;
      const totalQ = q - 1 + step;
      const newQ = (totalQ % 4) + 1;
      const addedYears = Math.floor(totalQ / 4);
      return `Q${newQ}-${yr + addedYears}`;
    }
    const numMatch = lastLabel.match(/(\d+)$/);
    if (numMatch) {
      const num = parseInt(numMatch[1], 10);
      const prefix = lastLabel.slice(0, numMatch.index);
      return `${prefix}${num + step}`;
    }
    return `${lastLabel} +${step}`;
  }

  // --- Main Calculation & Refresh Loop ---
  function updateCalculations() {
    if (dataPoints.length === 0) {
      renderEmptyState();
      return;
    }

    const n = dataPoints.length;
    const horizon = horizonPeriods;
    const alpha = alphaFactor;
    const z = getZMultiplier(confidenceLevel);

    // 1. Models computation
    const linearModel = computeLinearRegression(dataPoints);
    const linearFuture = [];
    for (let h = 1; h <= horizon; h++) {
      linearFuture.push(linearModel.slope * (n + h) + linearModel.intercept);
    }

    const sma3Model = computeMovingAverage(dataPoints, 3, horizon);
    const sma5Model = computeMovingAverage(dataPoints, 5, horizon);
    const expModel = computeExponentialSmoothing(dataPoints, alpha, horizon);

    // Pick active model for projections
    let activeFuture = linearFuture;
    let activeFitted = linearModel.fitted;
    let modelName = 'Linear Regression';

    if (primaryModel === 'sma3') {
      activeFuture = sma3Model.future;
      activeFitted = sma3Model.fitted;
      modelName = '3-Period Moving Average';
    } else if (primaryModel === 'sma5') {
      activeFuture = sma5Model.future;
      activeFitted = sma5Model.fitted;
      modelName = '5-Period Moving Average';
    } else if (primaryModel === 'exp') {
      activeFuture = expModel.future;
      activeFitted = expModel.fitted;
      modelName = `Exp Smoothing (α = ${alpha.toFixed(2)})`;
    }

    modelActiveBadge.textContent = `${modelName} Active`;

    // Standard Error for Confidence Bounds
    const activeMAE = calculateMAE(dataPoints, activeFitted);
    const seEstimate = linearModel.se > 0 ? linearModel.se : (activeMAE * 1.25);

    const confidenceBounds = activeFuture.map((val, idx) => {
      const step = idx + 1;
      const seK = seEstimate * Math.sqrt(1 + (step / Math.max(1, n)));
      const margin = z * seK;
      return {
        lower: Math.max(0, val - margin),
        upper: val + margin
      };
    });

    // Update KPI Cards
    const nextForecast = activeFuture[0] || 0;
    const lastActual = dataPoints[n - 1].value;
    const nextDeltaPct = lastActual !== 0 ? ((nextForecast - lastActual) / lastActual) * 100 : 0;
    const totalProjected = activeFuture.reduce((acc, curr) => acc + curr, 0);

    kpiNext.textContent = formatCurrency(nextForecast);
    kpiNextDelta.textContent = `${nextDeltaPct >= 0 ? '+' : ''}${formatNumber(nextDeltaPct, 1)}% vs Last Actual`;
    kpiNextDelta.style.color = nextDeltaPct >= 0 ? 'var(--success)' : 'var(--error)';

    kpiTotal.textContent = formatCurrency(totalProjected);
    kpiHorizonLbl.textContent = `Next ${horizon} Periods Cumulative`;

    kpiR2.textContent = formatNumber(linearModel.r2, 3);
    if (linearModel.r2 > 0.85) {
      kpiFitQuality.textContent = 'High explanatory power';
      kpiFitQuality.style.color = 'var(--success)';
    } else if (linearModel.r2 > 0.50) {
      kpiFitQuality.textContent = 'Moderate predictive power';
      kpiFitQuality.style.color = 'var(--warning)';
    } else {
      kpiFitQuality.textContent = 'Weak linear correlation';
      kpiFitQuality.style.color = 'var(--error)';
    }

    const firstActual = dataPoints[0].value;
    const avgGrowthPct = n > 1 && firstActual !== 0 ? (((lastActual - firstActual) / firstActual) / (n - 1)) * 100 : 0;
    kpiGrowth.textContent = `${avgGrowthPct >= 0 ? '+' : ''}${formatNumber(avgGrowthPct, 1)}%`;
    kpiSlopeLbl.textContent = `Linear Slope: ${formatCurrency(linearModel.slope)} / period`;

    kpiMae.textContent = formatCurrency(activeMAE);

    ciNote.textContent = `With ${(confidenceLevel * 100).toFixed(0)}% Confidence Interval (±${formatCurrency(z * seEstimate)})`;

    // Render Projection Table
    renderProjectionTable(activeFuture, confidenceBounds, lastActual);

    // Render Model Comparison Table
    renderComparisonTable(dataPoints, {
      linear: { fitted: linearModel.fitted, future: linearFuture, formula: `y = ${formatNumber(linearModel.slope, 1)}x + ${formatNumber(linearModel.intercept, 1)}` },
      sma3: { fitted: sma3Model.fitted, future: sma3Model.future, formula: 'SMA(3): (y_t-1 + y_t-2 + y_t-3) / 3' },
      sma5: { fitted: sma5Model.fitted, future: sma5Model.future, formula: 'SMA(5): Rolling 5-period window' },
      exp: { fitted: expModel.fitted, future: expModel.future, formula: `SES + Holt's Trend (α = ${alpha.toFixed(2)})` }
    });

    // Render SVG Visualization
    renderSVGChart({
      dataPoints,
      linearModel: { fitted: linearModel.fitted, future: linearFuture },
      sma3Model,
      sma5Model,
      expModel,
      confidenceBounds,
      activeFuture
    });
  }

  // --- Render Projection Table ---
  function renderProjectionTable(futureVals, bounds, lastActual) {
    projectionTbody.innerHTML = '';
    const lastLabel = dataPoints[dataPoints.length - 1].label;

    futureVals.forEach((val, i) => {
      const step = i + 1;
      const periodLabel = getNextPeriodLabel(lastLabel, step);
      const prevVal = i === 0 ? lastActual : futureVals[i - 1];
      const momPct = prevVal !== 0 ? ((val - prevVal) / prevVal) * 100 : 0;
      const bound = bounds[i];

      const tr = document.createElement('tr');
      tr.className = 'forecast-row';
      tr.innerHTML = `
        <td><strong style="color: var(--accent);">${periodLabel}</strong> (t+${step})</td>
        <td><strong>${formatCurrency(val)}</strong></td>
        <td style="color: var(--text-tertiary);">${formatCurrency(bound.lower)}</td>
        <td style="color: var(--text-tertiary);">${formatCurrency(bound.upper)}</td>
        <td style="color: ${momPct >= 0 ? 'var(--success)' : 'var(--error)'}; font-weight: 600;">
          ${momPct >= 0 ? '▲ +' : '▼ '}${formatNumber(momPct, 1)}%
        </td>
      `;
      projectionTbody.appendChild(tr);
    });
  }

  // --- Render Model Comparison Table ---
  function renderComparisonTable(actuals, models) {
    comparisonTbody.innerHTML = '';
    const modelKeys = [
      { key: 'linear', name: 'Linear Regression', color: '#818cf8' },
      { key: 'sma3', name: '3-Period Moving Average', color: '#34d399' },
      { key: 'sma5', name: '5-Period Moving Average', color: '#fbbf24' },
      { key: 'exp', name: 'Exponential Smoothing', color: '#f472b6' }
    ];

    modelKeys.forEach(m => {
      const mod = models[m.key];
      const mae = calculateMAE(actuals, mod.fitted);
      const nextVal = mod.future[0] || 0;
      const totalHorizon = mod.future.reduce((sum, v) => sum + v, 0);

      // Mean Absolute Percentage Error (MAPE)
      let sumPct = 0, count = 0;
      actuals.forEach((act, idx) => {
        const fit = mod.fitted[idx];
        if (fit !== null && !isNaN(fit) && act.value !== 0) {
          sumPct += Math.abs((act.value - fit) / act.value);
          count++;
        }
      });
      const mape = count > 0 ? (sumPct / count) * 100 : 0;

      const isCurrent = primaryModel === m.key;

      const tr = document.createElement('tr');
      if (isCurrent) tr.style.background = 'var(--accent-glow)';

      tr.innerHTML = `
        <td>
          <div style="display: flex; align-items: center; gap: 0.5rem;">
            <span style="display:inline-block; width:10px; height:10px; border-radius:2px; background:${m.color};"></span>
            <strong>${m.name}</strong>
            ${isCurrent ? '<span class="badge" style="font-size: 0.65rem; padding: 0.15rem 0.4rem;">Selected</span>' : ''}
          </div>
        </td>
        <td style="font-family: monospace; font-size: 0.8rem; color: var(--text-tertiary);">${mod.formula}</td>
        <td><strong>${formatCurrency(mae)}</strong></td>
        <td>MAPE: ${formatNumber(mape, 1)}%</td>
        <td><strong>${formatCurrency(nextVal)}</strong></td>
        <td>${formatCurrency(totalHorizon)}</td>
      `;
      comparisonTbody.appendChild(tr);
    });
  }

  // --- SVG Chart Visualizer ---
  function renderSVGChart(chartData) {
    const { dataPoints, linearModel, sma3Model, sma5Model, expModel, confidenceBounds, activeFuture } = chartData;
    const n = dataPoints.length;
    const horizon = horizonPeriods;
    const totalPoints = n + horizon;

    // ViewBox dimensions
    const width = 800;
    const height = 400;
    const margin = { top: 30, right: 35, bottom: 45, left: 75 };
    const plotWidth = width - margin.left - margin.right;
    const plotHeight = height - margin.top - margin.bottom;

    // Determine Min & Max Values across all active datasets
    let allVals = dataPoints.map(d => d.value);
    if (visibleSeries.linear) allVals.push(...linearModel.future);
    if (visibleSeries.sma3) allVals.push(...sma3Model.future);
    if (visibleSeries.sma5) allVals.push(...sma5Model.future);
    if (visibleSeries.exp) allVals.push(...expModel.future);
    if (visibleSeries.ci) {
      confidenceBounds.forEach(b => {
        allVals.push(b.lower);
        allVals.push(b.upper);
      });
    }

    const minRaw = Math.min(...allVals);
    const maxRaw = Math.max(...allVals);
    const padding = (maxRaw - minRaw) * 0.12 || 1000;
    const yMin = Math.max(0, Math.floor((minRaw - padding) / 1000) * 1000);
    const yMax = Math.ceil((maxRaw + padding) / 1000) * 1000;

    // Coordinate scale mappers
    function getX(i) {
      // i from 0 to totalPoints - 1
      return margin.left + (i / Math.max(1, totalPoints - 1)) * plotWidth;
    }

    function getY(val) {
      if (val === null || isNaN(val)) return null;
      const clamped = Math.max(yMin, Math.min(yMax, val));
      const pct = (clamped - yMin) / (yMax - yMin || 1);
      return margin.top + plotHeight - pct * plotHeight;
    }

    // Build SVG Elements
    let svgHtml = '';

    // 1. Gridlines & Y-Axis Labels
    const ySteps = 5;
    for (let s = 0; s <= ySteps; s++) {
      const stepVal = yMin + ((yMax - yMin) / ySteps) * s;
      const yPos = getY(stepVal);
      svgHtml += `
        <line x1="${margin.left}" y1="${yPos}" x2="${width - margin.right}" y2="${yPos}" stroke="var(--border)" stroke-dasharray="3,3" opacity="0.6" />
        <text x="${margin.left - 12}" y="${yPos + 4}" fill="var(--text-tertiary)" font-size="11" text-anchor="end" font-family="sans-serif">${formatCurrency(stepVal)}</text>
      `;
    }

    // 2. Vertical Forecast Divider Line
    const dividerX = getX(n - 1);
    svgHtml += `
      <line x1="${dividerX}" y1="${margin.top}" x2="${dividerX}" y2="${height - margin.bottom}" stroke="var(--text-tertiary)" stroke-width="1.5" stroke-dasharray="4,4" />
      <text x="${dividerX - 8}" y="${margin.top + 14}" fill="var(--text-tertiary)" font-size="10" text-anchor="end" font-weight="600">HISTORICAL</text>
      <text x="${dividerX + 8}" y="${margin.top + 14}" fill="var(--accent)" font-size="10" text-anchor="start" font-weight="600">PROJECTION</text>
    `;

    // 3. Confidence Interval Corridor (Area Polygon)
    if (visibleSeries.ci) {
      const upperPoints = [];
      const lowerPoints = [];
      
      // Anchor at last actual
      const lastX = getX(n - 1);
      const lastY = getY(dataPoints[n - 1].value);
      upperPoints.push(`${lastX},${lastY}`);
      lowerPoints.push(`${lastX},${lastY}`);

      for (let h = 0; h < horizon; h++) {
        const xPos = getX(n + h);
        const yUpper = getY(confidenceBounds[h].upper);
        const yLower = getY(confidenceBounds[h].lower);
        upperPoints.push(`${xPos},${yUpper}`);
        lowerPoints.unshift(`${xPos},${yLower}`);
      }

      const corridorPath = upperPoints.concat(lowerPoints).join(' ');
      svgHtml += `
        <polygon points="${corridorPath}" fill="rgba(129, 140, 248, 0.12)" stroke="rgba(129, 140, 248, 0.35)" stroke-dasharray="2,2" />
      `;
    }

    // Helper to generate path d attribute
    function makePathD(pts) {
      return pts.reduce((acc, p, i) => {
        if (p.y === null) return acc;
        return `${acc} ${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`;
      }, '');
    }

    // 4. Moving Average 5 Series
    if (visibleSeries.sma5) {
      const pts = [];
      // Fitted
      for (let i = 0; i < n; i++) {
        if (sma5Model.fitted[i] !== null) {
          pts.push({ x: getX(i), y: getY(sma5Model.fitted[i]) });
        }
      }
      // Future
      for (let h = 0; h < horizon; h++) {
        pts.push({ x: getX(n + h), y: getY(sma5Model.future[h]) });
      }
      if (pts.length > 0) {
        svgHtml += `<path d="${makePathD(pts)}" fill="none" stroke="#fbbf24" stroke-width="2" stroke-dasharray="5,4" opacity="0.85" />`;
      }
    }

    // 5. Moving Average 3 Series
    if (visibleSeries.sma3) {
      const pts = [];
      for (let i = 0; i < n; i++) {
        if (sma3Model.fitted[i] !== null) {
          pts.push({ x: getX(i), y: getY(sma3Model.fitted[i]) });
        }
      }
      for (let h = 0; h < horizon; h++) {
        pts.push({ x: getX(n + h), y: getY(sma3Model.future[h]) });
      }
      if (pts.length > 0) {
        svgHtml += `<path d="${makePathD(pts)}" fill="none" stroke="#34d399" stroke-width="2" stroke-dasharray="4,3" opacity="0.85" />`;
      }
    }

    // 6. Exponential Smoothing Series
    if (visibleSeries.exp) {
      const pts = [];
      for (let i = 0; i < n; i++) {
        pts.push({ x: getX(i), y: getY(expModel.fitted[i]) });
      }
      for (let h = 0; h < horizon; h++) {
        pts.push({ x: getX(n + h), y: getY(expModel.future[h]) });
      }
      svgHtml += `<path d="${makePathD(pts)}" fill="none" stroke="#f472b6" stroke-width="2.2" opacity="0.85" />`;
    }

    // 7. Linear Regression Series
    if (visibleSeries.linear) {
      const pts = [];
      for (let i = 0; i < n; i++) {
        pts.push({ x: getX(i), y: getY(linearModel.fitted[i]) });
      }
      for (let h = 0; h < horizon; h++) {
        pts.push({ x: getX(n + h), y: getY(linearModel.future[h]) });
      }
      svgHtml += `<path d="${makePathD(pts)}" fill="none" stroke="#818cf8" stroke-width="2.5" />`;
    }

    // 8. Historical Actuals Line & Circles
    if (visibleSeries.actual) {
      const actualPts = dataPoints.map((d, i) => ({ x: getX(i), y: getY(d.value) }));
      const actualD = makePathD(actualPts);
      
      // Gradient stroke
      svgHtml += `
        <defs>
          <linearGradient id="actualGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stop-color="#38bdf8" />
            <stop offset="100%" stop-color="#818cf8" />
          </linearGradient>
        </defs>
        <path d="${actualD}" fill="none" stroke="url(#actualGrad)" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" />
      `;

      // Historical Data Nodes (Interactive)
      actualPts.forEach((pt, i) => {
        svgHtml += `
          <circle cx="${pt.x}" cy="${pt.y}" r="4.5" fill="#38bdf8" stroke="var(--bg-secondary)" stroke-width="2" class="chart-point" data-type="actual" data-idx="${i}" style="cursor: pointer; transition: transform 0.2s;" />
        `;
      });
    }

    // 9. Projected Active Nodes
    activeFuture.forEach((val, h) => {
      const ptX = getX(n + h);
      const ptY = getY(val);
      svgHtml += `
        <circle cx="${ptX}" cy="${ptY}" r="4" fill="var(--bg-secondary)" stroke="#818cf8" stroke-width="2.5" class="chart-point" data-type="forecast" data-step="${h + 1}" style="cursor: pointer;" />
      `;
    });

    // 10. X-Axis Labels
    const lastLabel = dataPoints[n - 1].label;
    for (let i = 0; i < totalPoints; i++) {
      const xPos = getX(i);
      let lbl = '';
      if (i < n) {
        lbl = dataPoints[i].label;
      } else {
        const step = i - n + 1;
        lbl = getNextPeriodLabel(lastLabel, step);
      }

      // Skip alternate labels if too dense
      if (totalPoints > 14 && i % 2 !== 0 && i !== totalPoints - 1) continue;

      svgHtml += `
        <text x="${xPos}" y="${height - margin.bottom + 20}" fill="${i >= n ? 'var(--accent)' : 'var(--text-tertiary)'}" font-size="10" text-anchor="middle" font-family="sans-serif" font-weight="${i >= n ? '600' : '400'}">${lbl}</text>
      `;
    }

    svg.innerHTML = svgHtml;

    // Attach Tooltip Listeners to Nodes
    attachChartTooltips({ dataPoints, activeFuture, confidenceBounds, lastLabel });
  }

  // --- Attach Interactive SVG Tooltip ---
  function attachChartTooltips({ dataPoints, activeFuture, confidenceBounds, lastLabel }) {
    const points = svg.querySelectorAll('.chart-point');

    points.forEach(point => {
      point.addEventListener('mouseenter', (e) => {
        const type = point.getAttribute('data-type');
        const rect = point.getBoundingClientRect();
        const wrapRect = chartWrap.getBoundingClientRect();

        const x = rect.left - wrapRect.left + rect.width / 2;
        const y = rect.top - wrapRect.top;

        if (type === 'actual') {
          const idx = parseInt(point.getAttribute('data-idx'), 10);
          const item = dataPoints[idx];
          tooltip.innerHTML = `
            <div style="font-weight: 700; color: #38bdf8;">${item.label} (Historical)</div>
            <div>Actual Value: <strong>${formatCurrency(item.value)}</strong></div>
          `;
        } else {
          const step = parseInt(point.getAttribute('data-step'), 10);
          const val = activeFuture[step - 1];
          const bound = confidenceBounds[step - 1];
          const lbl = getNextPeriodLabel(lastLabel, step);

          tooltip.innerHTML = `
            <div style="font-weight: 700; color: #818cf8;">${lbl} (Projected t+${step})</div>
            <div>Forecast: <strong>${formatCurrency(val)}</strong></div>
            <div style="color: #94a3b8; font-size: 0.7rem;">95% Range: ${formatCurrency(bound.lower)} – ${formatCurrency(bound.upper)}</div>
          `;
        }

        tooltip.style.left = `${x}px`;
        tooltip.style.top = `${y}px`;
        tooltip.style.opacity = '1';
      });

      point.addEventListener('mouseleave', () => {
        tooltip.style.opacity = '0';
      });
    });
  }

  // --- Render Historical Input Table ---
  function renderInputTable() {
    tableBody.innerHTML = '';
    pointCountSpan.textContent = dataPoints.length;

    dataPoints.forEach((pt, idx) => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td style="color: var(--text-tertiary); font-size: 0.8rem;">#${idx + 1}</td>
        <td>
          <input type="text" class="table-input cell-label" data-idx="${idx}" value="${pt.label}" />
        </td>
        <td>
          <input type="number" class="table-input cell-value" data-idx="${idx}" value="${pt.value}" step="any" />
        </td>
        <td style="text-align: center;">
          <button class="btn-del-row" data-idx="${idx}" style="background:transparent; border:none; color:var(--text-tertiary); cursor:pointer; font-size:1.1rem; padding: 0.1rem 0.4rem;" title="Remove row">✕</button>
        </td>
      `;
      tableBody.appendChild(tr);
    });

    // Attach listeners
    tableBody.querySelectorAll('.cell-label').forEach(inp => {
      inp.addEventListener('input', (e) => {
        const idx = parseInt(e.target.getAttribute('data-idx'), 10);
        dataPoints[idx].label = e.target.value.trim();
        updateCalculations();
      });
    });

    tableBody.querySelectorAll('.cell-value').forEach(inp => {
      inp.addEventListener('input', (e) => {
        const idx = parseInt(e.target.getAttribute('data-idx'), 10);
        const val = parseFloat(e.target.value);
        dataPoints[idx].value = isNaN(val) ? 0 : val;
        updateCalculations();
      });
    });

    tableBody.querySelectorAll('.btn-del-row').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const idx = parseInt(e.currentTarget.getAttribute('data-idx'), 10);
        dataPoints.splice(idx, 1);
        renderInputTable();
        updateCalculations();
      });
    });
  }

  function renderEmptyState() {
    projectionTbody.innerHTML = '<tr><td colspan="5" style="text-align: center; color: var(--text-tertiary); padding: 2rem;">Please add at least 2 historical data points.</td></tr>';
    comparisonTbody.innerHTML = '<tr><td colspan="6" style="text-align: center; color: var(--text-tertiary); padding: 1.5rem;">No data available for model benchmarks.</td></tr>';
    svg.innerHTML = '<text x="400" y="200" fill="var(--text-tertiary)" font-size="14" text-anchor="middle">No data points entered.</text>';
    kpiNext.textContent = '$0.00';
    kpiTotal.textContent = '$0.00';
    kpiR2.textContent = '0.000';
    kpiGrowth.textContent = '0.0%';
    kpiMae.textContent = '$0.00';
  }

  // --- Batch Raw Paste Parser ---
  function parseBatchPaste(rawText) {
    if (!rawText.trim()) return [];
    const lines = rawText.split(/\r?\n/).filter(line => line.trim().length > 0);
    const parsed = [];

    lines.forEach((line, idx) => {
      // Split by tab, comma, semicolon or colon
      const parts = line.split(/[,\t;:]/).map(p => p.trim());
      if (parts.length >= 2) {
        const label = parts[0];
        // Strip currency symbols and commas from number
        const numStr = parts[1].replace(/[\$, ]/g, '');
        const val = parseFloat(numStr);
        if (!isNaN(val)) {
          parsed.push({ label, value: val });
        }
      } else if (parts.length === 1) {
        const numStr = parts[0].replace(/[\$, ]/g, '');
        const val = parseFloat(numStr);
        if (!isNaN(val)) {
          parsed.push({ label: `Period ${idx + 1}`, value: val });
        }
      }
    });

    return parsed;
  }

  // --- Export Forecast CSV ---
  function exportForecastCSV() {
    if (dataPoints.length === 0) return;
    const n = dataPoints.length;
    const horizon = horizonPeriods;
    const alpha = alphaFactor;
    const z = getZMultiplier(confidenceLevel);

    const linearModel = computeLinearRegression(dataPoints);
    const linearFuture = [];
    for (let h = 1; h <= horizon; h++) {
      linearFuture.push(linearModel.slope * (n + h) + linearModel.intercept);
    }
    const sma3Model = computeMovingAverage(dataPoints, 3, horizon);
    const sma5Model = computeMovingAverage(dataPoints, 5, horizon);
    const expModel = computeExponentialSmoothing(dataPoints, alpha, horizon);

    let activeFuture = linearFuture;
    let modelTitle = 'Linear Regression';
    if (primaryModel === 'sma3') {
      activeFuture = sma3Model.future;
      modelTitle = 'SMA 3';
    } else if (primaryModel === 'sma5') {
      activeFuture = sma5Model.future;
      modelTitle = 'SMA 5';
    } else if (primaryModel === 'exp') {
      activeFuture = expModel.future;
      modelTitle = 'Exponential Smoothing';
    }

    const activeMAE = calculateMAE(dataPoints, linearModel.fitted);
    const seEstimate = linearModel.se > 0 ? linearModel.se : (activeMAE * 1.25);
    const lastLabel = dataPoints[n - 1].label;

    let csvContent = 'Type,Period,Actual_Value,Forecast_Selected,Lower_CI,Upper_CI,Linear_Reg,SMA_3,SMA_5,Exp_Smooth\r\n';

    // Historical rows
    dataPoints.forEach((pt, i) => {
      csvContent += `"Historical","${pt.label}",${pt.value},${pt.value},"","","${linearModel.fitted[i] || ''}","${sma3Model.fitted[i] || ''}","${sma5Model.fitted[i] || ''}","${expModel.fitted[i] || ''}"\r\n`;
    });

    // Projected rows
    activeFuture.forEach((val, i) => {
      const step = i + 1;
      const periodLabel = getNextPeriodLabel(lastLabel, step);
      const seK = seEstimate * Math.sqrt(1 + (step / Math.max(1, n)));
      const lower = Math.max(0, val - z * seK);
      const upper = val + z * seK;

      csvContent += `"Forecast","${periodLabel}","","${val.toFixed(2)}","${lower.toFixed(2)}","${upper.toFixed(2)}","${linearFuture[i].toFixed(2)}","${sma3Model.future[i].toFixed(2)}","${sma5Model.future[i].toFixed(2)}","${expModel.future[i].toFixed(2)}"\r\n`;
    });

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `forecast_projections_${modelTitle.toLowerCase().replace(/\s+/g, '_')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  // --- Copy Summary Report ---
  function copySummaryReport() {
    const nextVal = kpiNext.textContent;
    const totVal = kpiTotal.textContent;
    const r2Val = kpiR2.textContent;
    const growthVal = kpiGrowth.textContent;
    const model = primaryModelSelect.options[primaryModelSelect.selectedIndex].text;

    const summaryText = `FORECAST PROJECTION SUMMARY\n------------------------------------\nActive Model: ${model}\nNext Period Forecast: ${nextVal}\nHorizon Projected Total (${horizonPeriods} periods): ${totVal}\nRegression R² Fit: ${r2Val}\nEstimated Growth Rate: ${growthVal}\nConfidence Level: ${(confidenceLevel * 100).toFixed(0)}%\n\nGenerated via ALL-IN-ONE Forecast Calculator`;

    navigator.clipboard.writeText(summaryText).then(() => {
      btnCopySummary.textContent = 'Copied!';
      setTimeout(() => {
        btnCopySummary.innerHTML = `
          <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
          Copy Summary
        `;
      }, 2000);
    });
  }

  // --- Event Listeners Setup ---

  // Model & Horizon Controls
  primaryModelSelect.addEventListener('change', (e) => {
    primaryModel = e.target.value;
    updateCalculations();
  });

  horizonSelect.addEventListener('change', (e) => {
    horizonPeriods = parseInt(e.target.value, 10);
    updateCalculations();
  });

  confidenceSelect.addEventListener('change', (e) => {
    confidenceLevel = parseFloat(e.target.value);
    updateCalculations();
  });

  alphaSlider.addEventListener('input', (e) => {
    alphaFactor = parseFloat(e.target.value);
    alphaValDisplay.textContent = alphaFactor.toFixed(2);
    updateCalculations();
  });

  // Presets
  function setPreset(key, btn) {
    [presetSaasBtn, presetRetailBtn, presetTechBtn].forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    dataPoints = JSON.parse(JSON.stringify(PRESETS[key]));
    renderInputTable();
    updateCalculations();
  }

  presetSaasBtn.addEventListener('click', () => setPreset('saas', presetSaasBtn));
  presetRetailBtn.addEventListener('click', () => setPreset('retail', presetRetailBtn));
  presetTechBtn.addEventListener('click', () => setPreset('tech', presetTechBtn));

  // Table Actions
  btnAddRow.addEventListener('click', () => {
    const nextIdx = dataPoints.length + 1;
    const lastLabel = dataPoints.length > 0 ? dataPoints[dataPoints.length - 1].label : 'Period 0';
    const newLabel = getNextPeriodLabel(lastLabel, 1);
    const lastVal = dataPoints.length > 0 ? dataPoints[dataPoints.length - 1].value : 10000;
    dataPoints.push({ label: newLabel, value: Math.round(lastVal * 1.05) });
    renderInputTable();
    updateCalculations();
  });

  btnClearData.addEventListener('click', () => {
    dataPoints = [];
    renderInputTable();
    updateCalculations();
  });

  btnResetPreset.addEventListener('click', () => {
    setPreset('saas', presetSaasBtn);
  });

  // Tab Switching
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
    // Pre-populate paste with current data
    rawPasteInput.value = dataPoints.map(d => `${d.label}, ${d.value}`).join('\n');
  });

  btnApplyPaste.addEventListener('click', () => {
    const parsed = parseBatchPaste(rawPasteInput.value);
    if (parsed.length >= 2) {
      dataPoints = parsed;
      renderInputTable();
      updateCalculations();
      tabTableBtn.click();
    } else {
      alert('Please provide at least 2 valid lines in the format: Label, Value');
    }
  });

  // Legend Toggle Click
  document.querySelectorAll('.legend-item').forEach(item => {
    item.addEventListener('click', () => {
      const series = item.getAttribute('data-series');
      if (series) {
        visibleSeries[series] = !visibleSeries[series];
        item.classList.toggle('dimmed', !visibleSeries[series]);
        updateCalculations();
      }
    });
  });

  // Action Buttons
  btnExportCsv.addEventListener('click', exportForecastCSV);
  btnCopySummary.addEventListener('click', copySummaryReport);

  // Initialize
  renderInputTable();
  updateCalculations();
});