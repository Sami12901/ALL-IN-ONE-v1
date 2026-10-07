// AI Revenue Prediction & Forecasting Engine

const PRESETS = {
  steady: [42000, 43500, 45200, 47100, 48900, 50200, 52100, 53900, 55800, 58100, 60400, 62900],
  hyper: [25000, 28000, 32500, 37000, 43200, 51000, 60500, 71200, 84000, 99500, 118000, 140000],
  seasonal: [58000, 52000, 49000, 53000, 56000, 61000, 63000, 59000, 65000, 78000, 96000, 112000],
  plateau: [72000, 74500, 76100, 78200, 79000, 80400, 80100, 81200, 80800, 81500, 81900, 82400]
};

let historicalData = [...PRESETS.steady];

const formatCurrency = (val) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(val);
const formatCompact = (val) => {
  if (val >= 1000000) return `$${(val / 1000000).toFixed(2)}M`;
  if (val >= 1000) return `$${(val / 1000).toFixed(1)}k`;
  return `$${Math.round(val)}`;
};

function renderInputGrid() {
  const container = document.getElementById('hist-inputs-container');
  if (!container) return;

  container.innerHTML = '';
  const monthNames = ['M1 (Jan)', 'M2 (Feb)', 'M3 (Mar)', 'M4 (Apr)', 'M5 (May)', 'M6 (Jun)', 'M7 (Jul)', 'M8 (Aug)', 'M9 (Sep)', 'M10 (Oct)', 'M11 (Nov)', 'M12 (Dec)'];

  historicalData.forEach((val, idx) => {
    const item = document.createElement('div');
    item.className = 'hist-input-item';
    item.innerHTML = `
      <label for="hist-inp-${idx}">${monthNames[idx] || 'M' + (idx + 1)}</label>
      <input type="number" id="hist-inp-${idx}" data-idx="${idx}" value="${val}" min="0" step="1000">
    `;
    container.appendChild(item);
  });

  container.querySelectorAll('input').forEach(input => {
    input.addEventListener('input', (e) => {
      const idx = parseInt(e.target.dataset.idx, 10);
      const num = Math.max(0, parseFloat(e.target.value) || 0);
      historicalData[idx] = num;
      calculateAndRender();
    });
  });
}

function computeForecast() {
  const n = historicalData.length;
  const x = Array.from({ length: n }, (_, i) => i + 1);
  const y = [...historicalData];

  // 1. Linear Regression
  const sumX = x.reduce((a, b) => a + b, 0);
  const sumY = y.reduce((a, b) => a + b, 0);
  const meanX = sumX / n;
  const meanY = sumY / n;

  let numSlope = 0;
  let denSlope = 0;
  for (let i = 0; i < n; i++) {
    numSlope += (x[i] - meanX) * (y[i] - meanY);
    denSlope += (x[i] - meanX) ** 2;
  }
  const slope = denSlope !== 0 ? numSlope / denSlope : 0;
  const intercept = meanY - slope * meanX;

  // Fit stats & R2
  let ssTot = 0;
  let ssRes = 0;
  for (let i = 0; i < n; i++) {
    const yHat = slope * x[i] + intercept;
    ssTot += (y[i] - meanY) ** 2;
    ssRes += (y[i] - yHat) ** 2;
  }
  const r2 = ssTot > 0 ? Math.max(0, Math.min(1, 1 - (ssRes / ssTot))) : 0.9;
  const standardError = Math.sqrt(ssRes / Math.max(1, n - 2));

  // 2. Holt's Exponential Smoothing
  const alphaSlider = document.getElementById('slider-alpha');
  const alpha = alphaSlider ? parseFloat(alphaSlider.value) : 0.35;
  const beta = 0.2;

  let level = y[0];
  let trend = (y[1] !== undefined ? y[1] - y[0] : 0);

  for (let i = 1; i < n; i++) {
    const prevLevel = level;
    const prevTrend = trend;
    level = alpha * y[i] + (1 - alpha) * (prevLevel + prevTrend);
    trend = beta * (level - prevLevel) + (1 - beta) * prevTrend;
  }

  // Model Selection
  const modelType = document.getElementById('sel-model') ? document.getElementById('sel-model').value : 'ensemble';
  const horizon = document.getElementById('sel-horizon') ? parseInt(document.getElementById('sel-horizon').value, 10) : 12;

  const projections = [];
  for (let h = 1; h <= horizon; h++) {
    const xFuture = n + h;

    // Linear forecast
    const linY = slope * xFuture + intercept;
    // Holt forecast
    const holtY = level + h * trend;

    let projY = linY;
    if (modelType === 'ensemble') {
      projY = (linY + holtY) / 2;
    } else if (modelType === 'holt') {
      projY = holtY;
    }

    projY = Math.max(0, projY);

    // 95% Confidence Interval: Margin of Error
    // ME = 1.96 * SE * sqrt(1 + 1/n + (x0 - meanX)^2 / sum(xi - meanX)^2)
    const varianceFactor = 1 + (1 / n) + ((xFuture - meanX) ** 2 / (denSlope || 1));
    const me = 1.96 * standardError * Math.sqrt(varianceFactor);

    const lowerCi = Math.max(0, projY - me);
    const upperCi = projY + me;

    projections.push({
      monthIndex: xFuture,
      monthLabel: `M${xFuture} (Proj)`,
      projected: Math.round(projY),
      lowerCi: Math.round(lowerCi),
      upperCi: Math.round(upperCi)
    });
  }

  return {
    n,
    x,
    y,
    slope,
    intercept,
    r2,
    standardError,
    projections,
    horizon
  };
}

function renderKPIs(forecast) {
  const projs = forecast.projections;

  const kpi3m = document.getElementById('kpi-proj-3m');
  const kpi3mSub = document.getElementById('kpi-proj-3m-sub');
  const kpi6m = document.getElementById('kpi-proj-6m');
  const kpi6mSub = document.getElementById('kpi-proj-6m-sub');
  const kpi12m = document.getElementById('kpi-proj-12m');
  const kpi12mSub = document.getElementById('kpi-proj-12m-sub');
  const kpiR2 = document.getElementById('kpi-r2');
  const kpiR2Sub = document.getElementById('kpi-r2-sub');

  // Month 3
  if (projs.length >= 3) {
    const m3Val = projs[2].projected;
    const cum3m = projs.slice(0, 3).reduce((a, b) => a + b.projected, 0);
    if (kpi3m) kpi3m.textContent = formatCurrency(m3Val);
    if (kpi3mSub) kpi3mSub.textContent = `Cum. 3-Mo: ${formatCompact(cum3m)}`;
  }

  // Month 6
  if (projs.length >= 6) {
    const m6Val = projs[5].projected;
    const cum6m = projs.slice(0, 6).reduce((a, b) => a + b.projected, 0);
    if (kpi6m) kpi6m.textContent = formatCurrency(m6Val);
    if (kpi6mSub) kpi6mSub.textContent = `Cum. 6-Mo: ${formatCompact(cum6m)}`;
  } else {
    if (kpi6m) kpi6m.textContent = '—';
    if (kpi6mSub) kpi6mSub.textContent = 'Select 6 or 12 Mo Horizon';
  }

  // Month 12
  if (projs.length >= 12) {
    const m12Val = projs[11].projected;
    const cum12m = projs.slice(0, 12).reduce((a, b) => a + b.projected, 0);
    if (kpi12m) kpi12m.textContent = formatCurrency(m12Val);
    if (kpi12mSub) kpi12mSub.textContent = `Cum. 12-Mo: ${formatCompact(cum12m)}`;
  } else {
    if (kpi12m) kpi12m.textContent = '—';
    if (kpi12mSub) kpi12mSub.textContent = 'Select 12 Mo Horizon';
  }

  // R2
  if (kpiR2) {
    kpiR2.textContent = forecast.r2.toFixed(3);
    if (kpiR2Sub) {
      if (forecast.r2 >= 0.90) kpiR2Sub.textContent = 'Very High Reliability (Fit > 90%)';
      else if (forecast.r2 >= 0.70) kpiR2Sub.textContent = 'Moderate Predictive Trend';
      else kpiR2Sub.textContent = 'Volatile / Irregular Series';
    }
  }
}

function renderChart(forecast) {
  const svg = document.getElementById('revenue-forecast-svg');
  if (!svg) return;

  const svgWidth = 760;
  const svgHeight = 310;
  const margin = { top: 25, right: 35, bottom: 45, left: 65 };
  const width = svgWidth - margin.left - margin.right;
  const height = svgHeight - margin.top - margin.bottom;

  const hist = forecast.y;
  const projs = forecast.projections;
  const totalPoints = hist.length + projs.length;

  // Find min and max
  let allY = [...hist, ...projs.map(p => p.projected), ...projs.map(p => p.upperCi)];
  let maxY = Math.max(...allY) * 1.1;
  let minY = Math.min(...hist, ...projs.map(p => p.lowerCi), 0);

  const getX = (index) => margin.left + (index / (totalPoints - 1)) * width;
  const getY = (val) => margin.top + height - ((val - minY) / (maxY - minY)) * height;

  let svgContent = `
    <defs>
      <linearGradient id="ciGradient" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#10b981" stop-opacity="0.28"/>
        <stop offset="100%" stop-color="#10b981" stop-opacity="0.06"/>
      </linearGradient>
      <filter id="glowEffect" x="-20%" y="-20%" width="140%" height="140%">
        <feGaussianBlur stdDeviation="3" result="blur"/>
        <feComposite in="SourceGraphic" in2="blur" operator="over"/>
      </filter>
    </defs>
  `;

  // Grid Lines & Ticks
  const yTicks = 5;
  for (let i = 0; i <= yTicks; i++) {
    const val = minY + ((maxY - minY) / yTicks) * i;
    const yPos = getY(val);
    svgContent += `
      <line x1="${margin.left}" y1="${yPos}" x2="${margin.left + width}" y2="${yPos}" stroke="rgba(255,255,255,0.06)" stroke-dasharray="3 3"/>
      <text x="${margin.left - 10}" y="${yPos + 4}" fill="var(--text-tertiary)" font-size="10" text-anchor="end">${formatCompact(val)}</text>
    `;
  }

  // 95% Confidence Interval Polygon
  if (projs.length > 0) {
    const lastHistIdx = hist.length - 1;
    const lastHistX = getX(lastHistIdx);
    const lastHistY = getY(hist[lastHistIdx]);

    let upperPoints = [`${lastHistX},${lastHistY}`];
    let lowerPoints = [`${lastHistX},${lastHistY}`];

    projs.forEach((p, idx) => {
      const ptX = getX(lastHistIdx + 1 + idx);
      upperPoints.push(`${ptX},${getY(p.upperCi)}`);
      lowerPoints.unshift(`${ptX},${getY(p.lowerCi)}`);
    });

    const polygonCoords = [...upperPoints, ...lowerPoints].join(' ');
    svgContent += `
      <polygon points="${polygonCoords}" fill="url(#ciGradient)" stroke="rgba(16, 185, 129, 0.3)" stroke-dasharray="2 2"/>
    `;
  }

  // Historical Line Path
  let histPath = '';
  hist.forEach((val, idx) => {
    const xPos = getX(idx);
    const yPos = getY(val);
    histPath += (idx === 0 ? `M ${xPos} ${yPos}` : ` L ${xPos} ${yPos}`);
  });

  svgContent += `
    <path d="${histPath}" fill="none" stroke="#89aacc" stroke-width="2.5"/>
  `;

  // Projection Line Path
  const lastHistIdx = hist.length - 1;
  let projPath = `M ${getX(lastHistIdx)} ${getY(hist[lastHistIdx])}`;
  projs.forEach((p, idx) => {
    const xPos = getX(lastHistIdx + 1 + idx);
    const yPos = getY(p.projected);
    projPath += ` L ${xPos} ${yPos}`;
  });

  svgContent += `
    <path d="${projPath}" fill="none" stroke="#10b981" stroke-width="2.5" stroke-dasharray="5 4" filter="url(#glowEffect)"/>
  `;

  // Historical Points
  hist.forEach((val, idx) => {
    const xPos = getX(idx);
    const yPos = getY(val);
    svgContent += `
      <circle cx="${xPos}" cy="${yPos}" r="3.5" fill="#89aacc" stroke="var(--bg-primary)" stroke-width="2"/>
    `;
  });

  // Projection Points
  projs.forEach((p, idx) => {
    const xPos = getX(lastHistIdx + 1 + idx);
    const yPos = getY(p.projected);
    svgContent += `
      <circle cx="${xPos}" cy="${yPos}" r="4.5" fill="#10b981" stroke="#ffffff" stroke-width="1.5"/>
    `;
  });

  // X Axis Labels (Sample every 2 months if crowded)
  const step = totalPoints > 16 ? 2 : 1;
  for (let i = 0; i < totalPoints; i += step) {
    const xPos = getX(i);
    const label = i < hist.length ? `M${i + 1}` : `P${i - hist.length + 1}`;
    const isProj = i >= hist.length;
    svgContent += `
      <text x="${xPos}" y="${margin.top + height + 20}" fill="${isProj ? '#10b981' : 'var(--text-tertiary)'}" font-size="10" font-weight="${isProj ? '700' : '500'}" text-anchor="middle">${label}</text>
    `;
  }

  // Divider line between Historical and Projection
  const divideX = getX(lastHistIdx);
  svgContent += `
    <line x1="${divideX}" y1="${margin.top}" x2="${divideX}" y2="${margin.top + height}" stroke="rgba(255,255,255,0.15)" stroke-dasharray="4 3"/>
    <text x="${divideX - 6}" y="${margin.top + 12}" fill="var(--text-tertiary)" font-size="9" text-anchor="end">HISTORICAL</text>
    <text x="${divideX + 6}" y="${margin.top + 12}" fill="#10b981" font-size="9" font-weight="700" text-anchor="start">FORECAST</text>
  `;

  svg.innerHTML = svgContent;
}

function renderTable(forecast) {
  const tbody = document.getElementById('forecast-table-tbody');
  if (!tbody) return;

  const baselineRev = forecast.y[forecast.y.length - 1];
  let html = '';

  // Historical
  forecast.y.forEach((val, idx) => {
    const growth = idx > 0 ? ((val - forecast.y[idx - 1]) / forecast.y[idx - 1]) * 100 : 0;
    html += `
      <tr>
        <td style="font-weight: 600;">Month ${idx + 1}</td>
        <td><span class="tag-hist">Observed</span></td>
        <td style="color: var(--text-tertiary);">—</td>
        <td style="font-weight: 700;">${formatCurrency(val)}</td>
        <td style="color: var(--text-tertiary);">—</td>
        <td>${idx > 0 ? (growth >= 0 ? '+' : '') + growth.toFixed(1) + '%' : 'Baseline'}</td>
      </tr>
    `;
  });

  // Projected
  forecast.projections.forEach((p, idx) => {
    const growthVsBaseline = baselineRev > 0 ? ((p.projected - baselineRev) / baselineRev) * 100 : 0;
    html += `
      <tr>
        <td style="font-weight: 700; color: #10b981;">Month ${p.monthIndex} (+${idx + 1}m)</td>
        <td><span class="tag-proj">Projected</span></td>
        <td style="color: var(--text-secondary);">${formatCurrency(p.lowerCi)}</td>
        <td style="font-weight: 800; color: #10b981;">${formatCurrency(p.projected)}</td>
        <td style="color: var(--text-secondary);">${formatCurrency(p.upperCi)}</td>
        <td style="font-weight: 600; color: #10b981;">+${growthVsBaseline.toFixed(1)}%</td>
      </tr>
    `;
  });

  tbody.innerHTML = html;
}

function calculateAndRender() {
  const forecast = computeForecast();
  renderKPIs(forecast);
  renderChart(forecast);
  renderTable(forecast);
}

function exportCSV() {
  const forecast = computeForecast();
  const headers = ['Month', 'Period_Type', 'Lower_95_CI', 'Projected_Revenue', 'Upper_95_CI'];
  const rows = [];

  forecast.y.forEach((val, idx) => {
    rows.push([`Month_${idx + 1}`, 'Observed', '', val, '']);
  });

  forecast.projections.forEach(p => {
    rows.push([`Month_${p.monthIndex}`, 'Forecast', p.lowerCi, p.projected, p.upperCi]);
  });

  const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `revenue-forecast-${new Date().toISOString().slice(0, 10)}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function initEventHandlers() {
  renderInputGrid();

  const selModel = document.getElementById('sel-model');
  if (selModel) selModel.addEventListener('change', calculateAndRender);

  const selHorizon = document.getElementById('sel-horizon');
  if (selHorizon) selHorizon.addEventListener('change', calculateAndRender);

  const sliderAlpha = document.getElementById('slider-alpha');
  const valAlpha = document.getElementById('val-alpha');
  if (sliderAlpha) {
    sliderAlpha.addEventListener('input', (e) => {
      if (valAlpha) valAlpha.textContent = e.target.value;
      calculateAndRender();
    });
  }

  const btnRun = document.getElementById('btn-run-forecast');
  if (btnRun) btnRun.addEventListener('click', calculateAndRender);

  const btnExport = document.getElementById('btn-export-csv');
  if (btnExport) btnExport.addEventListener('click', exportCSV);

  // Randomize / Preset Buttons
  const btnSteady = document.getElementById('preset-steady');
  const btnHyper = document.getElementById('preset-hyper');
  const btnSeasonal = document.getElementById('preset-seasonal');
  const btnPlateau = document.getElementById('preset-plateau');
  const btnRandom = document.getElementById('btn-randomize');

  const applyPreset = (patternKey, btn) => {
    document.querySelectorAll('.preset-bar .chip-btn').forEach(b => b.classList.remove('active'));
    if (btn) btn.classList.add('active');

    if (PRESETS[patternKey]) {
      historicalData = [...PRESETS[patternKey]];
      renderInputGrid();
      calculateAndRender();
    }
  };

  if (btnSteady) btnSteady.addEventListener('click', () => applyPreset('steady', btnSteady));
  if (btnHyper) btnHyper.addEventListener('click', () => applyPreset('hyper', btnHyper));
  if (btnSeasonal) btnSeasonal.addEventListener('click', () => applyPreset('seasonal', btnSeasonal));
  if (btnPlateau) btnPlateau.addEventListener('click', () => applyPreset('plateau', btnPlateau));

  if (btnRandom) {
    btnRandom.addEventListener('click', () => {
      let base = 35000 + Math.random() * 20000;
      historicalData = Array.from({ length: 12 }, (_, i) => {
        base += (Math.random() * 4000 - 500);
        return Math.round(base);
      });
      renderInputGrid();
      calculateAndRender();
    });
  }

  calculateAndRender();
}

document.addEventListener('DOMContentLoaded', () => {
  initEventHandlers();
});