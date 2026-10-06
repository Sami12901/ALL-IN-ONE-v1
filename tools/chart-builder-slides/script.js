/**
 * Chart Builder for Slides
 * Fully client-side interactive presentation chart generator
 */

// Preset Palettes
const PALETTES = [
  { id: 'gold', name: 'Luxury Gold', colors: ['#d4af37', '#f3e5ab', '#c59b27', '#e6ca65', '#997316', '#eedc82'] },
  { id: 'cyan', name: 'Neon Cyan', colors: ['#06b6d4', '#3b82f6', '#0ea5e9', '#6366f1', '#8b5cf6', '#38bdf8'] },
  { id: 'emerald', name: 'Emerald', colors: ['#10b981', '#059669', '#34d399', '#047857', '#6ee7b7', '#10b981'] },
  { id: 'sunset', name: 'Sunset', colors: ['#f43f5e', '#fb923c', '#f59e0b', '#e11d48', '#ec4899', '#fb7185'] },
  { id: 'minimal', name: 'Minimal Dark', colors: ['#94a3b8', '#64748b', '#cbd5e1', '#475569', '#e2e8f0', '#94a3b8'] }
];

// Preset Data
const PRESETS = {
  revenue: [
    { label: 'Q1 FY26', value: 14.2 },
    { label: 'Q2 FY26', value: 18.6 },
    { label: 'Q3 FY26', value: 24.8 },
    { label: 'Q4 FY26', value: 38.5 }
  ],
  market: [
    { label: 'North America', value: 42 },
    { label: 'EMEA Region', value: 28 },
    { label: 'APAC Expansion', value: 19 },
    { label: 'Latin America', value: 11 }
  ],
  conversion: [
    { label: 'Top-of-Funnel', value: 100 },
    { label: 'Product Signups', value: 48 },
    { label: 'Weekly Active', value: 26 },
    { label: 'Paid Enterprise', value: 12 }
  ],
  users: [
    { label: 'Jan', value: 24 },
    { label: 'Feb', value: 38 },
    { label: 'Mar', value: 55 },
    { label: 'Apr', value: 78 },
    { label: 'May', value: 112 },
    { label: 'Jun', value: 156 }
  ]
};

// Application State
let state = {
  mode: 'bar', // 'bar' | 'line' | 'donut' | 'kpi'
  title: 'Q4 FY2026 Revenue & Expansion Traction',
  subtitle: 'Demonstrating accelerated enterprise adoption and record recurring performance.',
  category: 'FINANCIAL BENCHMARKS',
  unitPrefix: '$',
  unitSuffix: 'M',
  theme: 'dark-glass',
  paletteId: 'gold',
  showLegend: true,
  showValLabels: true,
  showGridlines: true,
  animated: true,
  data: JSON.parse(JSON.stringify(PRESETS.revenue))
};

document.addEventListener('DOMContentLoaded', () => {
  // DOM References
  const svgEl = document.getElementById('slide-svg-element');
  const tableBody = document.getElementById('data-table-body');
  const paletteGrid = document.getElementById('palette-grid');

  const inpTitle = document.getElementById('inp-slide-title');
  const inpSubtitle = document.getElementById('inp-slide-subtitle');
  const inpCategory = document.getElementById('inp-slide-category');
  const inpUnitPrefix = document.getElementById('inp-unit-prefix');
  const inpUnitSuffix = document.getElementById('inp-suffix');
  const selectTheme = document.getElementById('select-chart-theme');

  const toggleLegend = document.getElementById('toggle-legend');
  const toggleValLabels = document.getElementById('toggle-val-labels');
  const toggleGridlines = document.getElementById('toggle-gridlines');
  const toggleAnimated = document.getElementById('toggle-animated');

  const btnAddRow = document.getElementById('btn-add-row');
  const btnImportCsv = document.getElementById('btn-import-csv');
  const fileInputCsv = document.getElementById('csv-file-input');
  const btnExportCsv = document.getElementById('btn-export-csv-data');

  const btnExportSvg = document.getElementById('btn-export-svg');
  const btnExportPng = document.getElementById('btn-export-png');
  const btnCopySvgCode = document.getElementById('btn-copy-svg-code');

  const statTotal = document.getElementById('stat-total-val');
  const statAvg = document.getElementById('stat-avg-val');
  const statPeak = document.getElementById('stat-peak-val');

  // Render Palette Selectors
  function renderPalettes() {
    paletteGrid.innerHTML = '';
    PALETTES.forEach(pal => {
      const card = document.createElement('div');
      card.className = `palette-card ${pal.id === state.paletteId ? 'active' : ''}`;
      card.dataset.id = pal.id;

      let swatchesHtml = '';
      pal.colors.slice(0, 5).forEach(c => {
        swatchesHtml += `<span style="background: ${c};"></span>`;
      });

      card.innerHTML = `
        <div class="palette-name">${pal.name}</div>
        <div class="palette-swatches">${swatchesHtml}</div>
      `;

      card.addEventListener('click', () => {
        state.paletteId = pal.id;
        document.querySelectorAll('.palette-card').forEach(c => c.classList.remove('active'));
        card.classList.add('active');
        renderSlideSVG();
      });

      paletteGrid.appendChild(card);
    });
  }

  // Render Data Table
  function renderDataTable() {
    tableBody.innerHTML = '';
    state.data.forEach((row, index) => {
      const tr = document.createElement('tr');

      tr.innerHTML = `
        <td><input type="text" class="inp-row-label" value="${escapeHtml(row.label)}" data-index="${index}"></td>
        <td><input type="number" step="any" class="inp-row-val" value="${row.value}" data-index="${index}"></td>
        <td style="text-align: center;">
          <button class="btn-row-delete" data-index="${index}" title="Remove entry">
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
          </button>
        </td>
      `;

      tableBody.appendChild(tr);
    });

    // Attach listeners
    tableBody.querySelectorAll('.inp-row-label').forEach(inp => {
      inp.addEventListener('input', (e) => {
        const idx = parseInt(e.target.dataset.index, 10);
        state.data[idx].label = e.target.value;
        renderSlideSVG();
      });
    });

    tableBody.querySelectorAll('.inp-row-val').forEach(inp => {
      inp.addEventListener('input', (e) => {
        const idx = parseInt(e.target.dataset.index, 10);
        state.data[idx].value = parseFloat(e.target.value) || 0;
        renderSlideSVG();
      });
    });

    tableBody.querySelectorAll('.btn-row-delete').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const btnTarget = e.currentTarget;
        const idx = parseInt(btnTarget.dataset.index, 10);
        if (state.data.length <= 1) {
          showToast('At least one data row is required.');
          return;
        }
        state.data.splice(idx, 1);
        renderDataTable();
        renderSlideSVG();
      });
    });

    updateStats();
  }

  // Update Summary Stats Bar
  function updateStats() {
    if (state.data.length === 0) return;
    const total = state.data.reduce((sum, d) => sum + (Number(d.value) || 0), 0);
    const avg = total / state.data.length;
    let peak = state.data[0];
    state.data.forEach(d => {
      if (Number(d.value) > Number(peak.value)) peak = d;
    });

    statTotal.textContent = `${state.unitPrefix}${formatNum(total)}${state.unitSuffix}`;
    statAvg.textContent = `${state.unitPrefix}${formatNum(avg.toFixed(1))}${state.unitSuffix}`;
    statPeak.textContent = `${peak.label} (${state.unitPrefix}${formatNum(peak.value)}${state.unitSuffix})`;
  }

  function formatNum(val) {
    return Number(val).toLocaleString();
  }

  function escapeHtml(str) {
    return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  // Get Current Palette Colors
  function getColors() {
    const pal = PALETTES.find(p => p.id === state.paletteId) || PALETTES[0];
    return pal.colors;
  }

  // Main SVG Render Function
  function renderSlideSVG() {
    const W = 1920;
    const H = 1080;
    const colors = getColors();

    // Theme Background Specs
    let bgFill = '#090d16';
    let textColor = '#f8fafc';
    let subtitleColor = '#94a3b8';
    let cardBg = 'rgba(255, 255, 255, 0.04)';
    let cardBorder = 'rgba(255, 255, 255, 0.1)';
    let gridColor = 'rgba(255, 255, 255, 0.08)';

    if (state.theme === 'midnight-navy') {
      bgFill = '#0a1128';
      cardBg = 'rgba(255, 255, 255, 0.05)';
      cardBorder = 'rgba(64, 93, 230, 0.2)';
      gridColor = 'rgba(255, 255, 255, 0.07)';
    } else if (state.theme === 'obsidian-gold') {
      bgFill = '#0d0d0d';
      cardBg = 'rgba(212, 175, 55, 0.05)';
      cardBorder = 'rgba(212, 175, 55, 0.25)';
      gridColor = 'rgba(212, 175, 55, 0.1)';
    } else if (state.theme === 'clean-light') {
      bgFill = '#f8fafc';
      textColor = '#0f172a';
      subtitleColor = '#64748b';
      cardBg = '#ffffff';
      cardBorder = 'rgba(0, 0, 0, 0.08)';
      gridColor = 'rgba(0, 0, 0, 0.06)';
    }

    let defs = `
      <defs>
        <linearGradient id="chartGrad1" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="${colors[0]}" stop-opacity="1"/>
          <stop offset="100%" stop-color="${colors[1] || colors[0]}" stop-opacity="0.75"/>
        </linearGradient>
        <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="${colors[0]}" stop-opacity="0.45"/>
          <stop offset="100%" stop-color="${colors[0]}" stop-opacity="0.0"/>
        </linearGradient>
        <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="8" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>
        <filter id="cardShadow" x="-10%" y="-10%" width="120%" height="120%">
          <feDropShadow dx="0" dy="16" stdDeviation="24" flood-color="rgba(0,0,0,0.3)"/>
        </filter>
      </defs>
    `;

    // Slide Header & Frame Elements
    let svgContent = `
      ${defs}
      <!-- Slide Background -->
      <rect width="${W}" height="${H}" fill="${bgFill}"/>
      
      <!-- Decorative ambient gradient circles -->
      <circle cx="150" cy="150" r="300" fill="${colors[0]}" opacity="0.06" filter="url(#glow)"/>
      <circle cx="${W - 150}" cy="${H - 150}" r="350" fill="${colors[1] || colors[0]}" opacity="0.05" filter="url(#glow)"/>

      <!-- Category Pill -->
      <g transform="translate(100, 90)">
        <rect width="210" height="34" rx="17" fill="${cardBg}" stroke="${cardBorder}" stroke-width="1"/>
        <circle cx="20" cy="17" r="5" fill="${colors[0]}"/>
        <text x="36" y="22" font-family="Inter, sans-serif" font-size="14" font-weight="700" fill="${textColor}" letter-spacing="1.5">${escapeHtml(state.category)}</text>
      </g>

      <!-- Slide Title & Subtitle -->
      <text x="100" y="180" font-family="'Instrument Serif', serif, Inter" font-size="52" font-weight="700" fill="${textColor}">${escapeHtml(state.title)}</text>
      <text x="100" y="225" font-family="Inter, sans-serif" font-size="22" font-weight="400" fill="${subtitleColor}">${escapeHtml(state.subtitle)}</text>

      <!-- Slide Footer Meta -->
      <line x1="100" y1="990" x2="${W - 100}" y2="990" stroke="${cardBorder}" stroke-width="1.5"/>
      <text x="100" y="1025" font-family="Inter, sans-serif" font-size="16" fill="${subtitleColor}" letter-spacing="1">ALL-IN-ONE PRESENTATION SUITE // CONFIDENTIAL</text>
      <text x="${W - 100}" y="1025" text-anchor="end" font-family="Inter, sans-serif" font-size="16" fill="${subtitleColor}">EXECUTIVE DECK &bull; 2026</text>
    `;

    // Render Mode-specific Chart Content inside Slide Canvas Area
    const chartX = 100;
    const chartY = 270;
    const chartW = W - 200; // 1720
    const chartH = 680;

    if (state.mode === 'bar') {
      svgContent += renderBarMode(chartX, chartY, chartW, chartH, colors, textColor, subtitleColor, gridColor, cardBg, cardBorder);
    } else if (state.mode === 'line') {
      svgContent += renderLineMode(chartX, chartY, chartW, chartH, colors, textColor, subtitleColor, gridColor, cardBg, cardBorder);
    } else if (state.mode === 'donut') {
      svgContent += renderDonutMode(chartX, chartY, chartW, chartH, colors, textColor, subtitleColor, cardBg, cardBorder);
    } else if (state.mode === 'kpi') {
      svgContent += renderKpiMode(chartX, chartY, chartW, chartH, colors, textColor, subtitleColor, cardBg, cardBorder);
    }

    svgEl.innerHTML = svgContent;
  }

  // 1. BAR CHART RENDERER
  function renderBarMode(x, y, w, h, colors, textColor, subtitleColor, gridColor, cardBg, cardBorder) {
    const data = state.data;
    if (data.length === 0) return '';

    const maxVal = Math.max(...data.map(d => Number(d.value) || 0), 1) * 1.15;
    const innerLeft = x + 80;
    const innerRight = x + w - 40;
    const innerTop = y + 40;
    const innerBottom = y + h - 100;
    const plotW = innerRight - innerLeft;
    const plotH = innerBottom - innerTop;

    let res = `<g class="chart-plot-group">`;

    // Background Card
    res += `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="20" fill="${cardBg}" stroke="${cardBorder}" stroke-width="1.5" />`;

    // Horizontal Gridlines
    if (state.showGridlines) {
      const gridSteps = 5;
      for (let i = 0; i <= gridSteps; i++) {
        const gy = innerBottom - (plotH * (i / gridSteps));
        const gridVal = (maxVal * (i / gridSteps)).toFixed(1);
        res += `
          <line x1="${innerLeft}" y1="${gy}" x2="${innerRight}" y2="${gy}" stroke="${gridColor}" stroke-width="1" stroke-dasharray="4 4" />
          <text x="${innerLeft - 18}" y="${gy + 6}" text-anchor="end" font-family="Inter, sans-serif" font-size="16" fill="${subtitleColor}">${state.unitPrefix}${gridVal}${state.unitSuffix}</text>
        `;
      }
    }

    // Bars
    const totalBars = data.length;
    const bandWidth = plotW / totalBars;
    const barWidth = Math.min(bandWidth * 0.55, 140);

    data.forEach((d, i) => {
      const barHeight = (Number(d.value) / maxVal) * plotH;
      const bx = innerLeft + (i * bandWidth) + ((bandWidth - barWidth) / 2);
      const by = innerBottom - barHeight;
      const barColor = colors[i % colors.length];

      // Bar with rounded top
      res += `
        <rect x="${bx}" y="${by}" width="${barWidth}" height="${barHeight}" rx="8" fill="${barColor}" opacity="0.92">
          ${state.animated ? `<animate attributeName="height" from="0" to="${barHeight}" dur="0.8s" fill="freeze" calcMode="spline" keySplines="0.25 0.1 0.25 1"/>
          <animate attributeName="y" from="${innerBottom}" to="${by}" dur="0.8s" fill="freeze" calcMode="spline" keySplines="0.25 0.1 0.25 1"/>` : ''}
        </rect>
      `;

      // Top value badge
      if (state.showValLabels) {
        res += `
          <text x="${bx + barWidth / 2}" y="${by - 14}" text-anchor="middle" font-family="Inter, sans-serif" font-size="20" font-weight="700" fill="${textColor}">
            ${state.unitPrefix}${formatNum(d.value)}${state.unitSuffix}
          </text>
        `;
      }

      // X-axis Category Label
      res += `
        <text x="${bx + barWidth / 2}" y="${innerBottom + 40}" text-anchor="middle" font-family="Inter, sans-serif" font-size="18" font-weight="600" fill="${textColor}">
          ${escapeHtml(d.label)}
        </text>
      `;
    });

    res += `</g>`;
    return res;
  }

  // 2. LINE CHART RENDERER
  function renderLineMode(x, y, w, h, colors, textColor, subtitleColor, gridColor, cardBg, cardBorder) {
    const data = state.data;
    if (data.length === 0) return '';

    const maxVal = Math.max(...data.map(d => Number(d.value) || 0), 1) * 1.2;
    const innerLeft = x + 80;
    const innerRight = x + w - 60;
    const innerTop = y + 50;
    const innerBottom = y + h - 100;
    const plotW = innerRight - innerLeft;
    const plotH = innerBottom - innerTop;

    let res = `<g class="chart-line-group">`;
    res += `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="20" fill="${cardBg}" stroke="${cardBorder}" stroke-width="1.5" />`;

    // Gridlines
    if (state.showGridlines) {
      const gridSteps = 5;
      for (let i = 0; i <= gridSteps; i++) {
        const gy = innerBottom - (plotH * (i / gridSteps));
        const gridVal = (maxVal * (i / gridSteps)).toFixed(1);
        res += `
          <line x1="${innerLeft}" y1="${gy}" x2="${innerRight}" y2="${gy}" stroke="${gridColor}" stroke-width="1" stroke-dasharray="4 4" />
          <text x="${innerLeft - 18}" y="${gy + 6}" text-anchor="end" font-family="Inter, sans-serif" font-size="16" fill="${subtitleColor}">${state.unitPrefix}${gridVal}${state.unitSuffix}</text>
        `;
      }
    }

    // Calculate Points
    const stepX = data.length > 1 ? plotW / (data.length - 1) : 0;
    const points = data.map((d, i) => {
      const px = innerLeft + (i * stepX);
      const py = innerBottom - ((Number(d.value) / maxVal) * plotH);
      return { x: px, y: py, val: d.value, label: d.label };
    });

    // Smooth Bezier Curve Path
    let pathD = `M ${points[0].x} ${points[0].y}`;
    for (let i = 0; i < points.length - 1; i++) {
      const p0 = points[i];
      const p1 = points[i + 1];
      const cx1 = p0.x + (p1.x - p0.x) / 2;
      const cy1 = p0.y;
      const cx2 = p0.x + (p1.x - p0.x) / 2;
      const cy2 = p1.y;
      pathD += ` C ${cx1} ${cy1}, ${cx2} ${cy2}, ${p1.x} ${p1.y}`;
    }

    // Closed Area Path for gradient fill
    const areaD = `${pathD} L ${points[points.length - 1].x} ${innerBottom} L ${points[0].x} ${innerBottom} Z`;

    // Area fill
    res += `<path d="${areaD}" fill="url(#areaGrad)" />`;

    // Line Path
    res += `
      <path d="${pathD}" fill="none" stroke="${colors[0]}" stroke-width="5" stroke-linecap="round" stroke-linejoin="round" filter="url(#glow)">
        ${state.animated ? `<animate attributeName="stroke-dashoffset" from="3000" to="0" dur="1.2s" fill="freeze"/>` : ''}
      </path>
    `;

    // Markers and Labels
    points.forEach((pt, i) => {
      res += `
        <!-- Outer Glow Ring -->
        <circle cx="${pt.x}" cy="${pt.y}" r="11" fill="${colors[0]}" opacity="0.3"/>
        <!-- Inner Core Marker -->
        <circle cx="${pt.x}" cy="${pt.y}" r="6" fill="#ffffff" stroke="${colors[0]}" stroke-width="3"/>
      `;

      if (state.showValLabels) {
        res += `
          <rect x="${pt.x - 45}" y="${pt.y - 48}" width="90" height="30" rx="8" fill="rgba(15, 23, 42, 0.85)" stroke="${cardBorder}" stroke-width="1"/>
          <text x="${pt.x}" y="${pt.y - 28}" text-anchor="middle" font-family="Inter, sans-serif" font-size="16" font-weight="700" fill="${textColor}">
            ${state.unitPrefix}${formatNum(pt.val)}${state.unitSuffix}
          </text>
        `;
      }

      // X Label
      res += `
        <text x="${pt.x}" y="${innerBottom + 38}" text-anchor="middle" font-family="Inter, sans-serif" font-size="18" font-weight="600" fill="${textColor}">
          ${escapeHtml(pt.label)}
        </text>
      `;
    });

    res += `</g>`;
    return res;
  }

  // 3. DONUT / PIE CHART RENDERER
  function renderDonutMode(x, y, w, h, colors, textColor, subtitleColor, cardBg, cardBorder) {
    const data = state.data;
    if (data.length === 0) return '';

    const total = data.reduce((s, d) => s + (Number(d.value) || 0), 0);
    const centerX = x + (w * 0.38);
    const centerY = y + (h * 0.5);
    const radius = Math.min(w * 0.28, h * 0.38);
    const innerRadius = radius * 0.62; // Donut hole

    let res = `<g class="chart-donut-group">`;
    res += `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="20" fill="${cardBg}" stroke="${cardBorder}" stroke-width="1.5" />`;

    let currentAngle = -Math.PI / 2; // Start from 12 o'clock

    data.forEach((d, i) => {
      const sliceVal = Number(d.value) || 0;
      const angle = total > 0 ? (sliceVal / total) * (Math.PI * 2) : 0;
      const endAngle = currentAngle + angle;
      const sliceColor = colors[i % colors.length];

      // Arc coordinates
      const x1 = centerX + radius * Math.cos(currentAngle);
      const y1 = centerY + radius * Math.sin(currentAngle);
      const x2 = centerX + radius * Math.cos(endAngle);
      const y2 = centerY + radius * Math.sin(endAngle);

      const ix1 = centerX + innerRadius * Math.cos(endAngle);
      const iy1 = centerY + innerRadius * Math.sin(endAngle);
      const ix2 = centerX + innerRadius * Math.cos(currentAngle);
      const iy2 = centerY + innerRadius * Math.sin(currentAngle);

      const largeArc = angle > Math.PI ? 1 : 0;

      const pathData = `
        M ${x1} ${y1}
        A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2}
        L ${ix1} ${iy1}
        A ${innerRadius} ${innerRadius} 0 ${largeArc} 0 ${ix2} ${iy2}
        Z
      `;

      res += `<path d="${pathData}" fill="${sliceColor}" stroke="${cardBg}" stroke-width="4" opacity="0.95" />`;

      currentAngle = endAngle;
    });

    // Donut Center Text
    res += `
      <text x="${centerX}" y="${centerY - 10}" text-anchor="middle" font-family="Inter, sans-serif" font-size="20" fill="${subtitleColor}">TOTAL ALLOCATION</text>
      <text x="${centerX}" y="${centerY + 32}" text-anchor="middle" font-family="'Instrument Serif', serif, Inter" font-size="44" font-weight="700" fill="${textColor}">
        ${state.unitPrefix}${formatNum(total)}${state.unitSuffix}
      </text>
    `;

    // Legend on the Right
    const legendX = x + (w * 0.65);
    const legendStartY = y + 100;
    const legendItemGap = 54;

    res += `<g transform="translate(${legendX}, ${legendStartY})">`;
    data.forEach((d, i) => {
      const itemY = i * legendItemGap;
      const sliceColor = colors[i % colors.length];
      const pct = total > 0 ? ((d.value / total) * 100).toFixed(1) : '0';

      res += `
        <g transform="translate(0, ${itemY})">
          <rect width="20" height="20" rx="6" fill="${sliceColor}" />
          <text x="32" y="16" font-family="Inter, sans-serif" font-size="20" font-weight="600" fill="${textColor}">
            ${escapeHtml(d.label)}
          </text>
          <text x="360" y="16" text-anchor="end" font-family="Inter, sans-serif" font-size="20" font-weight="700" fill="${textColor}">
            ${pct}%
          </text>
          <text x="440" y="16" text-anchor="end" font-family="Inter, sans-serif" font-size="18" fill="${subtitleColor}">
            (${state.unitPrefix}${formatNum(d.value)}${state.unitSuffix})
          </text>
        </g>
      `;
    });
    res += `</g>`;

    res += `</g>`;
    return res;
  }

  // 4. METRIC KPI CARD RENDERER
  function renderKpiMode(x, y, w, h, colors, textColor, subtitleColor, cardBg, cardBorder) {
    const data = state.data;
    if (data.length === 0) return '';

    const heroItem = data[0];
    const total = data.reduce((s, d) => s + (Number(d.value) || 0), 0);

    let res = `<g class="chart-kpi-group">`;
    res += `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="20" fill="${cardBg}" stroke="${cardBorder}" stroke-width="1.5" />`;

    // Left Giant Hero Card
    const heroW = w * 0.44;
    const heroH = h - 80;
    const heroX = x + 40;
    const heroY = y + 40;

    res += `
      <g transform="translate(${heroX}, ${heroY})">
        <rect width="${heroW}" height="${heroH}" rx="16" fill="rgba(255,255,255,0.03)" stroke="${cardBorder}" stroke-width="1.5"/>
        
        <text x="40" y="70" font-family="Inter, sans-serif" font-size="20" font-weight="700" fill="${subtitleColor}" letter-spacing="1">PRIMARY TARGET METRIC</text>
        <text x="40" y="125" font-family="Inter, sans-serif" font-size="28" font-weight="700" fill="${textColor}">${escapeHtml(heroItem.label)}</text>
        
        <text x="40" y="240" font-family="'Instrument Serif', serif, Inter" font-size="96" font-weight="800" fill="${colors[0]}">
          ${state.unitPrefix}${formatNum(heroItem.value)}${state.unitSuffix}
        </text>

        <!-- Momentum Badge -->
        <rect x="40" y="280" width="160" height="36" rx="18" fill="rgba(16, 185, 129, 0.15)" stroke="#10b981" stroke-width="1"/>
        <path d="M56 298 L64 290 L72 298 M64 290 L64 304" stroke="#10b981" stroke-width="2.5" stroke-linecap="round"/>
        <text x="80" y="304" font-family="Inter, sans-serif" font-size="16" font-weight="700" fill="#10b981">+28.4% MoM</text>

        <!-- Progress bar toward Q4 goal -->
        <text x="40" y="390" font-family="Inter, sans-serif" font-size="18" fill="${subtitleColor}">Progress to Milestone Goal</text>
        <rect x="40" y="410" width="${heroW - 80}" height="14" rx="7" fill="rgba(255,255,255,0.1)"/>
        <rect x="40" y="410" width="${(heroW - 80) * 0.84}" height="14" rx="7" fill="${colors[0]}"/>
        <text x="${heroW - 40}" y="445" text-anchor="end" font-family="Inter, sans-serif" font-size="16" font-weight="600" fill="${textColor}">84% Completed</text>
      </g>
    `;

    // Right Column Grid of Secondary KPI Cards
    const rightX = heroX + heroW + 40;
    const rightW = w - heroW - 120;
    const items = data.slice(1);
    const cardHeight = Math.min((h - 80 - ((items.length - 1) * 20)) / Math.max(items.length, 1), 160);

    items.forEach((item, idx) => {
      const cardY = y + 40 + (idx * (cardHeight + 20));
      const cardColor = colors[(idx + 1) % colors.length];

      res += `
        <g transform="translate(${rightX}, ${cardY})">
          <rect width="${rightW}" height="${cardHeight}" rx="14" fill="rgba(255,255,255,0.03)" stroke="${cardBorder}" stroke-width="1"/>
          
          <circle cx="40" cy="${cardHeight / 2}" r="12" fill="${cardColor}"/>
          <text x="70" y="${cardHeight / 2 + 7}" font-family="Inter, sans-serif" font-size="22" font-weight="600" fill="${textColor}">
            ${escapeHtml(item.label)}
          </text>

          <text x="${rightW - 40}" y="${cardHeight / 2 + 10}" text-anchor="end" font-family="'Instrument Serif', serif, Inter" font-size="42" font-weight="700" fill="${cardColor}">
            ${state.unitPrefix}${formatNum(item.value)}${state.unitSuffix}
          </text>
        </g>
      `;
    });

    res += `</g>`;
    return res;
  }

  // Toast Helper
  function showToast(msg) {
    let t = document.getElementById('chart-builder-toast');
    if (!t) {
      t = document.createElement('div');
      t.id = 'chart-builder-toast';
      t.style.cssText = `
        position: fixed;
        bottom: 24px;
        right: 24px;
        background: #090d16;
        color: #f8fafc;
        border: 1px solid var(--accent);
        border-radius: var(--radius-md);
        padding: 0.75rem 1.25rem;
        font-size: 0.85rem;
        font-weight: 600;
        box-shadow: 0 10px 30px rgba(0,0,0,0.5);
        z-index: 9999;
        transition: opacity 0.3s ease, transform 0.3s ease;
        opacity: 0;
        transform: translateY(10px);
        pointer-events: none;
      `;
      document.body.appendChild(t);
    }
    t.textContent = msg;
    t.style.opacity = '1';
    t.style.transform = 'translateY(0)';
    setTimeout(() => {
      t.style.opacity = '0';
      t.style.transform = 'translateY(10px)';
    }, 2500);
  }

  // EXPORT SVG FILE
  function downloadSvgFile() {
    const serializer = new XMLSerializer();
    const svgStr = serializer.serializeToString(svgEl);
    const blob = new Blob([svgStr], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${slugify(state.title || 'slide-chart')}.svg`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showToast('Downloaded Slide SVG file!');
  }

  // EXPORT PNG FILE (1920x1080 Full HD Canvas Rasterizer)
  function downloadPngFile() {
    showToast('Rendering high-resolution 1080p PNG slide...');
    const serializer = new XMLSerializer();
    const svgStr = serializer.serializeToString(svgEl);
    const blob = new Blob([svgStr], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);

    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = 1920;
      canvas.height = 1080;
      const ctx = canvas.getContext('2d');
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';
      ctx.drawImage(img, 0, 0, 1920, 1080);
      URL.revokeObjectURL(url);

      canvas.toBlob((pngBlob) => {
        if (!pngBlob) {
          showToast('Failed to create PNG blob.');
          return;
        }
        const pngUrl = URL.createObjectURL(pngBlob);
        const a = document.createElement('a');
        a.href = pngUrl;
        a.download = `${slugify(state.title || 'presentation-slide')}.png`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(pngUrl);
        showToast('Presentation slide PNG exported (1920x1080)!');
      }, 'image/png');
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      showToast('Error rendering PNG from SVG.');
    };
    img.src = url;
  }

  // COPY SVG CODE
  function copySvgCode() {
    const serializer = new XMLSerializer();
    const svgStr = serializer.serializeToString(svgEl);
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(svgStr).then(() => {
        showToast('Slide SVG markup copied to clipboard!');
      });
    } else {
      const ta = document.createElement('textarea');
      ta.value = svgStr;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
      showToast('Slide SVG markup copied to clipboard!');
    }
  }

  // EXPORT CSV
  function exportCsvData() {
    let csv = 'Label,Value\n';
    state.data.forEach(d => {
      csv += `"${d.label.replace(/"/g, '""')}",${d.value}\n`;
    });
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${slugify(state.title || 'chart-data')}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showToast('Exported CSV dataset!');
  }

  function slugify(text) {
    return text.toString().toLowerCase().trim()
      .replace(/\s+/g, '-')
      .replace(/[^\w\-]+/g, '')
      .replace(/\-\-+/g, '-');
  }

  // Event Listeners for Controls
  inpTitle.addEventListener('input', (e) => {
    state.title = e.target.value;
    renderSlideSVG();
  });

  inpSubtitle.addEventListener('input', (e) => {
    state.subtitle = e.target.value;
    renderSlideSVG();
  });

  inpCategory.addEventListener('input', (e) => {
    state.category = e.target.value;
    renderSlideSVG();
  });

  inpUnitPrefix.addEventListener('change', (e) => {
    state.unitPrefix = e.target.value;
    renderSlideSVG();
    updateStats();
  });

  inpUnitSuffix.addEventListener('change', (e) => {
    state.unitSuffix = e.target.value;
    renderSlideSVG();
    updateStats();
  });

  selectTheme.addEventListener('change', (e) => {
    state.theme = e.target.value;
    renderSlideSVG();
  });

  toggleLegend.addEventListener('change', (e) => {
    state.showLegend = e.target.checked;
    renderSlideSVG();
  });

  toggleValLabels.addEventListener('change', (e) => {
    state.showValLabels = e.target.checked;
    renderSlideSVG();
  });

  toggleGridlines.addEventListener('change', (e) => {
    state.showGridlines = e.target.checked;
    renderSlideSVG();
  });

  toggleAnimated.addEventListener('change', (e) => {
    state.animated = e.target.checked;
    renderSlideSVG();
  });

  // Mode Tabs
  document.querySelectorAll('.mode-tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.mode-tab-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      state.mode = btn.dataset.mode;
      renderSlideSVG();
    });
  });

  // Preset Chips
  document.querySelectorAll('[data-preset]').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('[data-preset]').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const presetKey = btn.dataset.preset;
      if (PRESETS[presetKey]) {
        state.data = JSON.parse(JSON.stringify(PRESETS[presetKey]));
        renderDataTable();
        renderSlideSVG();
        showToast(`Loaded ${btn.textContent} preset.`);
      }
    });
  });

  // Add Data Row
  btnAddRow.addEventListener('click', () => {
    state.data.push({ label: `Metric ${state.data.length + 1}`, value: 10 });
    renderDataTable();
    renderSlideSVG();
  });

  // CSV Import
  btnImportCsv.addEventListener('click', () => {
    fileInputCsv.click();
  });

  fileInputCsv.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (evt) => {
      const text = evt.target.result;
      const lines = text.split(/\r?\n/).filter(l => l.trim().length > 0);
      const parsedData = [];
      lines.forEach((line, i) => {
        // Skip header if first row has text
        const parts = line.split(',');
        if (parts.length >= 2) {
          const rawLabel = parts[0].trim().replace(/^["']|["']$/g, '');
          const rawVal = parseFloat(parts[1].trim());
          if (i === 0 && isNaN(rawVal)) return; // Header row
          if (!isNaN(rawVal)) {
            parsedData.push({ label: rawLabel || `Item ${parsedData.length + 1}`, value: rawVal });
          }
        }
      });
      if (parsedData.length > 0) {
        state.data = parsedData;
        renderDataTable();
        renderSlideSVG();
        showToast(`Imported ${parsedData.length} records from CSV!`);
      } else {
        showToast('Could not parse valid CSV data.');
      }
      fileInputCsv.value = '';
    };
    reader.readAsText(file);
  });

  // Exports
  btnExportSvg.addEventListener('click', downloadSvgFile);
  btnExportPng.addEventListener('click', downloadPngFile);
  btnCopySvgCode.addEventListener('click', copySvgCode);
  btnExportCsv.addEventListener('click', exportCsvData);

  // Initial Boot
  renderPalettes();
  renderDataTable();
  renderSlideSVG();
});