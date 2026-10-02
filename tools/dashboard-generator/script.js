/**
 * Dashboard Generator - Instant BI Synthesizer & Analytics Suite
 * Pure Client-Side JavaScript Engine with Interactive SVG Visualizations
 */

// Preset Business Datasets
const PRESET_DATASETS = {
  sales: {
    name: 'Quarterly Sales & Revenue',
    categoryCol: 'Region',
    metricCol: 'Revenue',
    trendCol: 'Quarter',
    unitPrefix: '$',
    data: `Region,Quarter,SalesRep,ProductLine,UnitsSold,Revenue,NetProfit
North America,Q1 2026,E. Vance,Enterprise Cloud,420,480000,168000
EMEA,Q1 2026,M. Dupont,Fintech Core,310,390000,144000
Asia Pacific,Q1 2026,K. Tanaka,AI Acceleration,560,620000,248000
Latin America,Q1 2026,C. Morales,Cyber Defense,180,210000,73500
North America,Q2 2026,E. Vance,Enterprise Cloud,490,560000,201600
EMEA,Q2 2026,M. Dupont,Fintech Core,350,440000,167200
Asia Pacific,Q2 2026,K. Tanaka,AI Acceleration,640,730000,306600
Latin America,Q2 2026,C. Morales,Cyber Defense,220,270000,99900
North America,Q3 2026,E. Vance,Enterprise Cloud,540,630000,233100
EMEA,Q3 2026,M. Dupont,Fintech Core,400,510000,198900
Asia Pacific,Q3 2026,K. Tanaka,AI Acceleration,720,840000,361200
Latin America,Q3 2026,C. Morales,Cyber Defense,260,330000,128700
North America,Q4 2026,E. Vance,Enterprise Cloud,610,720000,273600
EMEA,Q4 2026,M. Dupont,Fintech Core,460,590000,236000
Asia Pacific,Q4 2026,K. Tanaka,AI Acceleration,830,980000,431200
Latin America,Q4 2026,C. Morales,Cyber Defense,290,380000,152000`
  },

  saas: {
    name: 'SaaS MRR & Churn Analytics',
    categoryCol: 'PlanTier',
    metricCol: 'MRR',
    trendCol: 'Month',
    unitPrefix: '$',
    data: `PlanTier,Month,ActiveUsers,MRR,ARPU,ChurnRate
Starter,Jan 2026,3400,68000,20.00,3.2%
Growth,Jan 2026,1850,148000,80.00,2.1%
Enterprise,Jan 2026,320,384000,1200.00,0.8%
Starter,Feb 2026,3620,72400,20.00,3.0%
Growth,Feb 2026,2010,160800,80.00,1.9%
Enterprise,Feb 2026,345,414000,1200.00,0.7%
Starter,Mar 2026,3910,78200,20.00,2.8%
Growth,Mar 2026,2190,175200,80.00,1.8%
Enterprise,Mar 2026,370,444000,1200.00,0.6%
Starter,Apr 2026,4200,84000,20.00,2.6%
Growth,Apr 2026,2400,192000,80.00,1.7%
Enterprise,Apr 2026,405,486000,1200.00,0.5%`
  },

  retail: {
    name: 'Omnichannel E-Commerce',
    categoryCol: 'Channel',
    metricCol: 'GrossSales',
    trendCol: 'Period',
    unitPrefix: '$',
    data: `Channel,Period,OrdersCount,GrossSales,AdSpend,ReturnRate
Flagship Mobile App,W01,5400,324000,42000,4.2%
Shopify Direct,W01,4100,287000,38000,5.1%
Amazon Storefront,W01,6800,408000,56000,7.8%
Wholesale B2B,W01,120,490000,12000,1.2%
Private Salon,W01,85,210000,15000,0.8%
Flagship Mobile App,W02,5900,365800,44000,4.0%
Shopify Direct,W02,4450,311500,40000,4.9%
Amazon Storefront,W02,7200,439200,59000,7.5%
Wholesale B2B,W02,140,560000,14000,1.1%
Private Salon,W02,95,245000,16000,0.7%
Flagship Mobile App,W03,6350,398500,47000,3.9%
Shopify Direct,W03,4800,342000,42000,4.7%
Amazon Storefront,W03,7700,475000,63000,7.3%
Wholesale B2B,W03,165,640000,15000,1.0%
Private Salon,W03,110,290000,18000,0.6%`
  },

  luxury: {
    name: 'Luxury Salon & Client Spend',
    categoryCol: 'SalonCity',
    metricCol: 'TotalSpend',
    trendCol: 'Bimonthly',
    unitPrefix: '$',
    data: `SalonCity,Bimonthly,VIPTier,Transactions,AOV,TotalSpend
Geneva,Jan-Feb,Centurion,45,28500,1282500
Paris Vendôme,Jan-Feb,Imperial,62,24200,1500400
London Mayfair,Jan-Feb,Centurion,58,21800,1264400
New York Fifth Ave,Jan-Feb,Bespoke,74,19500,1443000
Dubai DIFC,Jan-Feb,Imperial,82,31000,2542000
Tokyo Ginza,Jan-Feb,Centurion,52,22400,1164800
Geneva,Mar-Apr,Centurion,50,29800,1490000
Paris Vendôme,Mar-Apr,Imperial,68,26000,1768000
London Mayfair,Mar-Apr,Centurion,64,23100,1478400
New York Fifth Ave,Mar-Apr,Bespoke,80,21000,1680000
Dubai DIFC,Mar-Apr,Imperial,95,33500,3182500
Tokyo Ginza,Mar-Apr,Centurion,58,24100,1397800`
  }
};

// Theme Palettes
const THEME_PALETTES = {
  gold: ['#d4af37', '#f3e5ab', '#e6c875', '#c59b27', '#b38714', '#946e0e', '#735508'],
  emerald: ['#10b981', '#34d399', '#6ee7b7', '#059669', '#047857', '#065f46', '#064e3b'],
  sapphire: ['#38bdf8', '#60a5fa', '#93c5fd', '#2563eb', '#1d4ed8', '#1e40af', '#172554'],
  cyber: ['#a855f7', '#ec4899', '#f43f5e', '#8b5cf6', '#06b6d4', '#10b981', '#f59e0b']
};

class DashboardGenerator {
  constructor() {
    this.currentPresetKey = 'sales';
    this.rawText = PRESET_DATASETS.sales.data;
    this.parsedRows = [];
    this.headers = [];
    
    // Mapping config
    this.categoryCol = PRESET_DATASETS.sales.categoryCol;
    this.metricCol = PRESET_DATASETS.sales.metricCol;
    this.trendCol = PRESET_DATASETS.sales.trendCol;
    this.unitPrefix = PRESET_DATASETS.sales.unitPrefix;
    this.palette = 'gold';

    // Table state
    this.searchQuery = '';
    this.sortCol = null;
    this.sortAsc = true;

    this.init();
  }

  init() {
    this.cacheDom();
    this.bindEvents();
    this.loadPreset('sales');
  }

  cacheDom() {
    // Controls
    this.presetSelect = document.getElementById('dataset-preset-select');
    this.btnLoadPreset = document.getElementById('btn-load-preset');
    this.fileUploader = document.getElementById('file-uploader');
    this.btnToggleEditor = document.getElementById('btn-toggle-editor');
    this.editorToggleLabel = document.getElementById('editor-toggle-label');
    this.dataDrawer = document.getElementById('data-drawer');
    this.rawDataInput = document.getElementById('raw-data-input');
    
    this.selectCategoryCol = document.getElementById('select-category-col');
    this.selectMetricCol = document.getElementById('select-metric-col');
    this.selectTrendCol = document.getElementById('select-trend-col');
    this.selectUnitPrefix = document.getElementById('select-unit-prefix');
    this.selectPalette = document.getElementById('select-palette');
    this.btnParseApply = document.getElementById('btn-parse-apply');

    this.btnExportCsv = document.getElementById('btn-export-csv');
    this.btnExportJson = document.getElementById('btn-export-json');
    this.btnPrintDashboard = document.getElementById('btn-print-dashboard');

    // KPI & Charts
    this.kpiCardsGrid = document.getElementById('kpi-cards-grid');
    this.barChartContainer = document.getElementById('bar-chart-container');
    this.donutChartContainer = document.getElementById('donut-chart-container');
    this.donutLegend = document.getElementById('donut-legend');
    this.lineChartContainer = document.getElementById('line-chart-container');
    this.barChartTitle = document.getElementById('bar-chart-title');
    this.lineChartTitle = document.getElementById('line-chart-title');
    this.barChartStat = document.getElementById('bar-chart-stat');
    this.donutTotalBadge = document.getElementById('donut-total-badge');
    this.lineChartGrowth = document.getElementById('line-chart-growth');

    // Table
    this.tableSearch = document.getElementById('table-search');
    this.tableRowCount = document.getElementById('table-row-count');
    this.dataTableHeader = document.getElementById('data-table-head');
    this.dataTableBody = document.getElementById('data-table-body');

    // Tooltip
    this.tooltip = document.getElementById('dashboard-tooltip');
    this.tooltipTitle = document.getElementById('tooltip-title');
    this.tooltipMetric = document.getElementById('tooltip-metric');
    this.tooltipSub = document.getElementById('tooltip-sub');
  }

  bindEvents() {
    this.btnLoadPreset.addEventListener('click', () => {
      this.loadPreset(this.presetSelect.value);
    });

    this.presetSelect.addEventListener('change', () => {
      this.loadPreset(this.presetSelect.value);
    });

    this.btnToggleEditor.addEventListener('click', () => {
      this.toggleEditorDrawer();
    });

    this.btnParseApply.addEventListener('click', () => {
      this.parseAndSynthesize();
    });

    this.fileUploader.addEventListener('change', (e) => {
      this.handleFileUpload(e);
    });

    this.btnExportCsv.addEventListener('click', () => {
      this.exportCsv();
    });

    this.btnExportJson.addEventListener('click', () => {
      this.exportJson();
    });

    this.btnPrintDashboard.addEventListener('click', () => {
      window.print();
    });

    this.tableSearch.addEventListener('input', (e) => {
      this.searchQuery = e.target.value.toLowerCase();
      this.renderTable();
    });

    // Color theme change
    this.selectPalette.addEventListener('change', () => {
      this.palette = this.selectPalette.value;
      this.synthesizeVisualizations();
    });

    this.selectUnitPrefix.addEventListener('change', () => {
      this.unitPrefix = this.selectUnitPrefix.value;
      this.synthesizeVisualizations();
    });

    this.selectMetricCol.addEventListener('change', () => {
      this.metricCol = this.selectMetricCol.value;
      this.synthesizeVisualizations();
    });

    this.selectCategoryCol.addEventListener('change', () => {
      this.categoryCol = this.selectCategoryCol.value;
      this.synthesizeVisualizations();
    });

    this.selectTrendCol.addEventListener('change', () => {
      this.trendCol = this.selectTrendCol.value;
      this.synthesizeVisualizations();
    });
  }

  toggleEditorDrawer(forceOpen = null) {
    const isCollapsed = this.dataDrawer.classList.contains('collapsed');
    const open = forceOpen !== null ? forceOpen : isCollapsed;
    if (open) {
      this.dataDrawer.classList.remove('collapsed');
      this.editorToggleLabel.textContent = 'Close Editor';
    } else {
      this.dataDrawer.classList.add('collapsed');
      this.editorToggleLabel.textContent = 'Edit Raw Data';
    }
  }

  loadPreset(key) {
    const preset = PRESET_DATASETS[key] || PRESET_DATASETS.sales;
    this.currentPresetKey = key;
    this.rawText = preset.data;
    this.rawDataInput.value = preset.data;
    this.categoryCol = preset.categoryCol;
    this.metricCol = preset.metricCol;
    this.trendCol = preset.trendCol;
    this.unitPrefix = preset.unitPrefix;
    this.selectUnitPrefix.value = preset.unitPrefix;
    this.parseAndSynthesize();
  }

  handleFileUpload(event) {
    const file = event.target.files && event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      this.rawText = e.target.result;
      this.rawDataInput.value = this.rawText;
      this.toggleEditorDrawer(true);
      this.parseAndSynthesize();
    };
    reader.readAsText(file);
    event.target.value = '';
  }

  // Parse CSV / TSV / Tabular data
  parseData(text) {
    if (!text || !text.trim()) return { headers: [], rows: [] };

    const lines = text.trim().split(/\r?\n/).filter(line => line.trim().length > 0);
    if (lines.length < 2) return { headers: [], rows: [] };

    // Auto-detect delimiter: comma or tab or semicolon
    const firstLine = lines[0];
    let delimiter = ',';
    if (firstLine.includes('\t')) delimiter = '\t';
    else if (firstLine.includes(';') && !firstLine.includes(',')) delimiter = ';';

    const parseLine = (line) => {
      const result = [];
      let cur = '';
      let inQuotes = false;
      for (let i = 0; i < line.length; i++) {
        const char = line[i];
        if (char === '"' || char === "'") {
          inQuotes = !inQuotes;
        } else if (char === delimiter && !inQuotes) {
          result.push(cur.trim().replace(/^["']|["']$/g, ''));
          cur = '';
        } else {
          cur += char;
        }
      }
      result.push(cur.trim().replace(/^["']|["']$/g, ''));
      return result;
    };

    const headers = parseLine(lines[0]);
    const rows = [];

    for (let i = 1; i < lines.length; i++) {
      const vals = parseLine(lines[i]);
      if (vals.length === headers.length) {
        const rowObj = {};
        headers.forEach((h, idx) => {
          rowObj[h] = vals[idx];
        });
        rows.push(rowObj);
      }
    }

    return { headers, rows };
  }

  parseAndSynthesize() {
    this.rawText = this.rawDataInput.value;
    const { headers, rows } = this.parseData(this.rawText);

    if (headers.length === 0 || rows.length === 0) {
      alert('Unable to parse tabular data. Please ensure column headers and data rows exist.');
      return;
    }

    this.headers = headers;
    this.parsedRows = rows;

    this.updateColumnSelectors();
    this.synthesizeVisualizations();
    this.renderTable();
  }

  updateColumnSelectors() {
    // Populate select options
    const populate = (selectElem, preferredVal, fallbackIdx = 0) => {
      selectElem.innerHTML = '';
      this.headers.forEach(h => {
        const opt = document.createElement('option');
        opt.value = h;
        opt.textContent = h;
        selectElem.appendChild(opt);
      });

      if (this.headers.includes(preferredVal)) {
        selectElem.value = preferredVal;
      } else if (this.headers[fallbackIdx]) {
        selectElem.value = this.headers[fallbackIdx];
      }
    };

    // Heuristics: detect numeric vs string columns
    const numericCols = this.headers.filter(h => {
      const sample = this.parsedRows.slice(0, 5);
      return sample.every(r => !isNaN(this.cleanNumber(r[h])));
    });

    const nonNumericCols = this.headers.filter(h => !numericCols.includes(h));

    populate(this.selectCategoryCol, this.categoryCol, nonNumericCols[0] ? this.headers.indexOf(nonNumericCols[0]) : 0);
    populate(this.selectMetricCol, this.metricCol, numericCols[0] ? this.headers.indexOf(numericCols[0]) : this.headers.length - 1);
    populate(this.selectTrendCol, this.trendCol, nonNumericCols[1] ? this.headers.indexOf(nonNumericCols[1]) : 1);

    this.categoryCol = this.selectCategoryCol.value;
    this.metricCol = this.selectMetricCol.value;
    this.trendCol = this.selectTrendCol.value;
  }

  cleanNumber(val) {
    if (val === undefined || val === null) return NaN;
    if (typeof val === 'number') return val;
    // Strip currency symbols, commas, percent, whitespace
    const cleaned = String(val).replace(/[\$,€£¥%\s]/g, '').trim();
    return parseFloat(cleaned);
  }

  formatNumber(val) {
    if (isNaN(val)) return '0';
    if (Math.abs(val) >= 1_000_000) {
      return (val / 1_000_000).toLocaleString('en-US', { minimumFractionDigits: 1, maximumFractionDigits: 2 }) + 'M';
    }
    if (Math.abs(val) >= 1_000) {
      return (val / 1_000).toLocaleString('en-US', { minimumFractionDigits: 1, maximumFractionDigits: 2 }) + 'k';
    }
    return val.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 2 });
  }

  formatCurrency(val) {
    const formatted = this.formatNumber(val);
    return `${this.unitPrefix}${formatted}`;
  }

  synthesizeVisualizations() {
    if (!this.parsedRows.length) return;

    // 1. Group by category
    const categoryMap = new Map();
    let totalMetric = 0;
    let validMetricCount = 0;

    this.parsedRows.forEach(row => {
      const cat = row[this.categoryCol] || 'Uncategorized';
      const rawNum = this.cleanNumber(row[this.metricCol]);
      const num = isNaN(rawNum) ? 0 : rawNum;

      totalMetric += num;
      validMetricCount++;

      const prev = categoryMap.get(cat) || { count: 0, sum: 0 };
      categoryMap.set(cat, {
        count: prev.count + 1,
        sum: prev.sum + num
      });
    });

    const categoryData = Array.from(categoryMap.entries()).map(([name, stat]) => ({
      name,
      value: stat.sum,
      count: stat.count,
      avg: stat.count > 0 ? stat.sum / stat.count : 0,
      share: totalMetric > 0 ? (stat.sum / totalMetric) * 100 : 0
    })).sort((a, b) => b.value - a.value);

    // 2. Group by trend column
    const trendMap = new Map();
    this.parsedRows.forEach(row => {
      const period = row[this.trendCol] || 'P';
      const num = this.cleanNumber(row[this.metricCol]) || 0;
      trendMap.set(period, (trendMap.get(period) || 0) + num);
    });
    const trendData = Array.from(trendMap.entries()).map(([period, value]) => ({
      period,
      value
    }));

    // 3. Render Top KPI Metric Cards
    this.renderKpiCards(totalMetric, categoryData);

    // 4. Render SVG Bar Chart
    this.renderBarChart(categoryData, totalMetric);

    // 5. Render SVG Donut Chart
    this.renderDonutChart(categoryData, totalMetric);

    // 6. Render SVG Line Trend Chart
    this.renderLineChart(trendData);
  }

  renderKpiCards(totalMetric, categoryData) {
    const avgCategory = categoryData.length > 0 ? totalMetric / categoryData.length : 0;
    const topCategory = categoryData[0] || { name: 'N/A', value: 0, share: 0 };
    const rowCount = this.parsedRows.length;

    // Calculate max individual transaction/row
    let maxRowVal = 0;
    let maxRowItem = 'N/A';
    this.parsedRows.forEach(r => {
      const num = this.cleanNumber(r[this.metricCol]) || 0;
      if (num > maxRowVal) {
        maxRowVal = num;
        maxRowItem = r[this.categoryCol] || 'Row';
      }
    });

    this.kpiCardsGrid.innerHTML = `
      <div class="kpi-card gold">
        <div class="kpi-header">
          <span class="kpi-label">Total ${this.metricCol}</span>
          <span class="kpi-badge" style="color: var(--gold-secondary); border-color: var(--gold-border);">Aggregate</span>
        </div>
        <div class="kpi-value">${this.formatCurrency(totalMetric)}</div>
        <div class="kpi-footer">
          <span class="kpi-subtext">Across ${categoryData.length} distinct categories</span>
          <span style="font-weight: 600; color: var(--gold-primary);">100% Volume</span>
        </div>
      </div>

      <div class="kpi-card emerald">
        <div class="kpi-header">
          <span class="kpi-label">Top Performer (${topCategory.name})</span>
          <span class="kpi-badge" style="color: var(--emerald-accent); border-color: rgba(16, 185, 129, 0.3);">#1 Leader</span>
        </div>
        <div class="kpi-value">${this.formatCurrency(topCategory.value)}</div>
        <div class="kpi-footer">
          <span class="kpi-subtext">${topCategory.share.toFixed(1)}% portfolio market share</span>
          <span style="font-weight: 600; color: var(--emerald-accent);">&uarr; Dominant</span>
        </div>
      </div>

      <div class="kpi-card sapphire">
        <div class="kpi-header">
          <span class="kpi-label">Category Mean / Average</span>
          <span class="kpi-badge" style="color: var(--sapphire-accent); border-color: rgba(56, 189, 248, 0.3);">Benchmark</span>
        </div>
        <div class="kpi-value">${this.formatCurrency(avgCategory)}</div>
        <div class="kpi-footer">
          <span class="kpi-subtext">Normalized mean distribution</span>
          <span style="font-weight: 600; color: var(--sapphire-accent);">&plusmn; Parity</span>
        </div>
      </div>

      <div class="kpi-card purple">
        <div class="kpi-header">
          <span class="kpi-label">Single Peak Maximum</span>
          <span class="kpi-badge" style="color: var(--purple-accent); border-color: rgba(168, 85, 247, 0.3);">Record Peak</span>
        </div>
        <div class="kpi-value">${this.formatCurrency(maxRowVal)}</div>
        <div class="kpi-footer">
          <span class="kpi-subtext">Origin: ${maxRowItem}</span>
          <span style="font-weight: 600; color: var(--purple-accent);">&star; Apex</span>
        </div>
      </div>

      <div class="kpi-card amber">
        <div class="kpi-header">
          <span class="kpi-label">Dataset Breadth</span>
          <span class="kpi-badge" style="color: var(--amber-accent); border-color: rgba(245, 158, 11, 0.3);">Telemetry</span>
        </div>
        <div class="kpi-value">${rowCount} <span style="font-size: 1.1rem; color: var(--text-secondary); font-family: var(--font-sans);">Rows</span></div>
        <div class="kpi-footer">
          <span class="kpi-subtext">${this.headers.length} attributes / metrics mapped</span>
          <span style="font-weight: 600; color: var(--amber-accent);">&bull; Live</span>
        </div>
      </div>
    `;

    this.barChartTitle.textContent = `${this.metricCol} by ${this.categoryCol}`;
    this.barChartStat.textContent = `${topCategory.name}: ${topCategory.share.toFixed(0)}% Share`;
    this.donutTotalBadge.textContent = `${this.formatCurrency(totalMetric)}`;
  }

  // --- SVG BAR CHART ---
  renderBarChart(data, totalMetric) {
    if (!data.length) {
      this.barChartContainer.innerHTML = '<div style="display:flex;align-items:center;justify-content:center;height:100%;color:var(--text-secondary);">No category data available</div>';
      return;
    }

    const items = data.slice(0, 8); // Top 8 categories for clean visual
    const maxVal = Math.max(...items.map(d => d.value), 1);
    const palette = THEME_PALETTES[this.palette] || THEME_PALETTES.gold;

    const width = 640;
    const height = 300;
    const padding = { top: 25, right: 30, bottom: 50, left: 65 };
    const chartW = width - padding.left - padding.right;
    const chartH = height - padding.top - padding.bottom;

    const barWidth = Math.max(16, Math.min(50, (chartW / items.length) * 0.65));
    const step = chartW / items.length;

    // Y Axis ticks
    const yTicks = [0, 0.25, 0.5, 0.75, 1].map(ratio => ({
      y: padding.top + chartH * (1 - ratio),
      val: maxVal * ratio
    }));

    let svg = `<svg viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="${palette[0]}" stop-opacity="0.95" />
          <stop offset="100%" stop-color="${palette[1] || palette[0]}" stop-opacity="0.4" />
        </linearGradient>
      </defs>`;

    // Horizontal Grid Lines
    yTicks.forEach(tick => {
      svg += `
        <line x1="${padding.left}" y1="${tick.y}" x2="${width - padding.right}" y2="${tick.y}" stroke="rgba(255,255,255,0.08)" stroke-dasharray="3,3" />
        <text x="${padding.left - 10}" y="${tick.y + 4}" fill="var(--text-secondary)" font-size="10" text-anchor="end" font-family="monospace">${this.formatNumber(tick.val)}</text>
      `;
    });

    // Bars
    items.forEach((d, idx) => {
      const x = padding.left + idx * step + (step - barWidth) / 2;
      const barH = (d.value / maxVal) * chartH;
      const y = padding.top + chartH - barH;
      const label = d.name.length > 10 ? d.name.slice(0, 9) + '…' : d.name;

      svg += `
        <g class="chart-bar-group" data-title="${d.name}" data-metric="${this.formatCurrency(d.value)}" data-sub="Share: ${d.share.toFixed(1)}% | Rows: ${d.count}">
          <rect x="${x}" y="${y}" width="${barWidth}" height="${barH}" rx="4" fill="url(#barGradient)" style="cursor:pointer; transition: opacity 0.2s;" />
          <text x="${x + barWidth / 2}" y="${height - padding.bottom + 20}" fill="var(--text-secondary)" font-size="11" text-anchor="middle" font-weight="500">${label}</text>
        </g>
      `;
    });

    svg += '</svg>';
    this.barChartContainer.innerHTML = svg;
    this.attachSvgTooltips(this.barChartContainer, '.chart-bar-group');
  }

  // --- SVG DONUT CHART ---
  renderDonutChart(data, totalMetric) {
    if (!data.length || totalMetric === 0) {
      this.donutChartContainer.innerHTML = '<div style="display:flex;align-items:center;justify-content:center;height:100%;color:var(--text-secondary);">No distribution data</div>';
      this.donutLegend.innerHTML = '';
      return;
    }

    const items = data.slice(0, 6);
    const otherSum = data.slice(6).reduce((acc, cur) => acc + cur.value, 0);
    if (otherSum > 0) {
      items.push({
        name: 'Other Categories',
        value: otherSum,
        share: (otherSum / totalMetric) * 100,
        count: data.slice(6).reduce((acc, cur) => acc + cur.count, 0)
      });
    }

    const palette = THEME_PALETTES[this.palette] || THEME_PALETTES.gold;
    const width = 260;
    const height = 260;
    const cx = width / 2;
    const cy = height / 2;
    const rOuter = 95;
    const rInner = 60;

    let cumulativeAngle = -Math.PI / 2; // start from top
    let svg = `<svg viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">`;

    const legendHtml = [];

    items.forEach((item, idx) => {
      const sliceAngle = (item.value / totalMetric) * 2 * Math.PI;
      const startAngle = cumulativeAngle;
      const endAngle = cumulativeAngle + sliceAngle;
      cumulativeAngle = endAngle;

      const x1Outer = cx + rOuter * Math.cos(startAngle);
      const y1Outer = cy + rOuter * Math.sin(startAngle);
      const x2Outer = cx + rOuter * Math.cos(endAngle);
      const y2Outer = cy + rOuter * Math.sin(endAngle);

      const x1Inner = cx + rInner * Math.cos(endAngle);
      const y1Inner = cy + rInner * Math.sin(endAngle);
      const x2Inner = cx + rInner * Math.cos(startAngle);
      const y2Inner = cy + rInner * Math.sin(startAngle);

      const largeArc = sliceAngle > Math.PI ? 1 : 0;
      const color = palette[idx % palette.length];

      // Donut slice path
      const pathData = `M ${x1Outer} ${y1Outer} A ${rOuter} ${rOuter} 0 ${largeArc} 1 ${x2Outer} ${y2Outer} L ${x1Inner} ${y1Inner} A ${rInner} ${rInner} 0 ${largeArc} 0 ${x2Inner} ${y2Inner} Z`;

      svg += `
        <path d="${pathData}" fill="${color}" stroke="var(--bg-secondary)" stroke-width="2" style="cursor:pointer; transition: transform 0.2s, opacity 0.2s;" class="donut-slice" data-title="${item.name}" data-metric="${this.formatCurrency(item.value)}" data-sub="Share: ${item.share.toFixed(1)}%" />
      `;

      legendHtml.push(`
        <div class="donut-legend-item">
          <span class="donut-dot" style="background:${color};"></span>
          <span>${item.name} (${item.share.toFixed(0)}%)</span>
        </div>
      `);
    });

    // Center cutout text
    svg += `
      <circle cx="${cx}" cy="${cy}" r="${rInner - 2}" fill="var(--bg-secondary)" />
      <text x="${cx}" y="${cy - 4}" fill="var(--gold-secondary)" font-size="13" font-weight="700" text-anchor="middle" font-family="var(--font-sans)">TOTAL</text>
      <text x="${cx}" y="${cy + 16}" fill="var(--text-primary)" font-size="12" font-weight="600" text-anchor="middle" font-family="monospace">${this.formatCurrency(totalMetric)}</text>
    </svg>`;

    this.donutChartContainer.innerHTML = svg;
    this.donutLegend.innerHTML = legendHtml.join('');
    this.attachSvgTooltips(this.donutChartContainer, '.donut-slice');
  }

  // --- SVG LINE TREND CHART ---
  renderLineChart(trendData) {
    if (!trendData.length) {
      this.lineChartContainer.innerHTML = '<div style="display:flex;align-items:center;justify-content:center;height:100%;color:var(--text-secondary);">No timeline trend data</div>';
      return;
    }

    const palette = THEME_PALETTES[this.palette] || THEME_PALETTES.gold;
    const width = 900;
    const height = 300;
    const padding = { top: 30, right: 40, bottom: 50, left: 75 };
    const chartW = width - padding.left - padding.right;
    const chartH = height - padding.top - padding.bottom;

    const values = trendData.map(d => d.value);
    const maxVal = Math.max(...values, 1);
    const minVal = Math.min(...values, 0);

    const stepX = trendData.length > 1 ? chartW / (trendData.length - 1) : chartW / 2;

    const points = trendData.map((d, i) => {
      const x = padding.left + (trendData.length > 1 ? i * stepX : chartW / 2);
      const ratio = (d.value - minVal) / (maxVal - minVal || 1);
      const y = padding.top + chartH * (1 - ratio);
      return { x, y, ...d };
    });

    const pathD = points.reduce((acc, pt, i) => `${acc} ${i === 0 ? 'M' : 'L'} ${pt.x} ${pt.y}`, '');
    const areaD = `${pathD} L ${points[points.length - 1].x} ${padding.top + chartH} L ${points[0].x} ${padding.top + chartH} Z`;

    // Compute trajectory growth
    if (trendData.length >= 2) {
      const first = trendData[0].value;
      const last = trendData[trendData.length - 1].value;
      const pct = first > 0 ? ((last - first) / first) * 100 : 0;
      const sign = pct >= 0 ? '+' : '';
      this.lineChartGrowth.textContent = `${sign}${pct.toFixed(1)}% Trajectory`;
      this.lineChartGrowth.style.color = pct >= 0 ? 'var(--emerald-accent)' : 'var(--rose-accent)';
    }

    let svg = `<svg viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="lineAreaGradient" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="${palette[0]}" stop-opacity="0.3" />
          <stop offset="100%" stop-color="${palette[0]}" stop-opacity="0.0" />
        </linearGradient>
      </defs>`;

    // Y Axis Grid
    [0, 0.33, 0.66, 1].forEach(ratio => {
      const y = padding.top + chartH * (1 - ratio);
      const val = minVal + (maxVal - minVal) * ratio;
      svg += `
        <line x1="${padding.left}" y1="${y}" x2="${width - padding.right}" y2="${y}" stroke="rgba(255,255,255,0.06)" stroke-dasharray="4,4" />
        <text x="${padding.left - 12}" y="${y + 4}" fill="var(--text-secondary)" font-size="10" text-anchor="end" font-family="monospace">${this.formatNumber(val)}</text>
      `;
    });

    // Area Fill
    svg += `<path d="${areaD}" fill="url(#lineAreaGradient)" />`;

    // Line Path
    svg += `<path d="${pathD}" fill="none" stroke="${palette[0]}" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" />`;

    // Points & Labels
    points.forEach((pt, idx) => {
      const prevVal = idx > 0 ? points[idx - 1].value : pt.value;
      const delta = prevVal > 0 ? ((pt.value - prevVal) / prevVal) * 100 : 0;
      const deltaStr = idx > 0 ? `${delta >= 0 ? '+' : ''}${delta.toFixed(1)}% vs prior` : 'Baseline';

      svg += `
        <g class="chart-line-node" data-title="${pt.period}" data-metric="${this.formatCurrency(pt.value)}" data-sub="${deltaStr}">
          <circle cx="${pt.x}" cy="${pt.y}" r="6" fill="${palette[0]}" stroke="var(--bg-secondary)" stroke-width="2" style="cursor:pointer;" />
          <circle cx="${pt.x}" cy="${pt.y}" r="11" fill="${palette[0]}" opacity="0.15" style="cursor:pointer;" />
          <text x="${pt.x}" y="${height - padding.bottom + 20}" fill="var(--text-secondary)" font-size="11" text-anchor="middle">${pt.period}</text>
        </g>
      `;
    });

    svg += '</svg>';
    this.lineChartContainer.innerHTML = svg;
    this.attachSvgTooltips(this.lineChartContainer, '.chart-line-node');
  }

  // --- INTERACTIVE TOOLTIP HANDLER ---
  attachSvgTooltips(container, selector) {
    const elements = container.querySelectorAll(selector);
    elements.forEach(elem => {
      elem.addEventListener('mouseenter', (e) => {
        const title = elem.getAttribute('data-title') || '';
        const metric = elem.getAttribute('data-metric') || '';
        const sub = elem.getAttribute('data-sub') || '';

        this.tooltipTitle.textContent = title;
        this.tooltipMetric.textContent = metric;
        this.tooltipSub.textContent = sub;
        this.tooltip.classList.add('visible');
        this.moveTooltip(e);
      });

      elem.addEventListener('mousemove', (e) => {
        this.moveTooltip(e);
      });

      elem.addEventListener('mouseleave', () => {
        this.tooltip.classList.remove('visible');
      });
    });
  }

  moveTooltip(e) {
    this.tooltip.style.left = `${e.clientX}px`;
    this.tooltip.style.top = `${e.clientY - 12}px`;
  }

  // --- DATA TABLE RENDER & SORT ---
  renderTable() {
    let rows = [...this.parsedRows];

    // Filter
    if (this.searchQuery) {
      rows = rows.filter(r => {
        return Object.values(r).some(v => String(v).toLowerCase().includes(this.searchQuery));
      });
    }

    // Sort
    if (this.sortCol) {
      rows.sort((a, b) => {
        const valA = a[this.sortCol];
        const valB = b[this.sortCol];
        const numA = this.cleanNumber(valA);
        const numB = this.cleanNumber(valB);

        if (!isNaN(numA) && !isNaN(numB)) {
          return this.sortAsc ? numA - numB : numB - numA;
        }
        return this.sortAsc
          ? String(valA).localeCompare(String(valB))
          : String(valB).localeCompare(String(valA));
      });
    }

    this.tableRowCount.textContent = `${rows.length} of ${this.parsedRows.length} rows`;

    // Render Headers
    this.dataTableHeader.innerHTML = `
      <tr>
        <th style="width: 45px; text-align: center;">#</th>
        ${this.headers.map(h => `
          <th data-col="${h}">
            ${h} ${this.sortCol === h ? (this.sortAsc ? '▲' : '▼') : ''}
          </th>
        `).join('')}
      </tr>
    `;

    // Bind header click
    this.dataTableHeader.querySelectorAll('th[data-col]').forEach(th => {
      th.addEventListener('click', () => {
        const col = th.getAttribute('data-col');
        if (this.sortCol === col) {
          this.sortAsc = !this.sortAsc;
        } else {
          this.sortCol = col;
          this.sortAsc = true;
        }
        this.renderTable();
      });
    });

    // Render Body Rows (limit 150 for fluid DOM performance)
    const visibleRows = rows.slice(0, 150);
    this.dataTableBody.innerHTML = visibleRows.map((r, i) => `
      <tr>
        <td style="color: var(--text-secondary); text-align: center; font-family: monospace;">${i + 1}</td>
        ${this.headers.map(h => {
          const val = r[h];
          const isNum = !isNaN(this.cleanNumber(val));
          return `<td style="${isNum ? 'font-family: monospace;' : ''}">${val || '-'}</td>`;
        }).join('')}
      </tr>
    `).join('');
  }

  // --- EXPORT UTILITIES ---
  exportCsv() {
    if (!this.parsedRows.length) return;
    const headerLine = this.headers.join(',');
    const dataLines = this.parsedRows.map(r => {
      return this.headers.map(h => {
        const val = r[h] !== undefined ? String(r[h]) : '';
        return val.includes(',') ? `"${val}"` : val;
      }).join(',');
    });

    const csvContent = 'data:text/csv;charset=utf-8,' + encodeURIComponent([headerLine, ...dataLines].join('\n'));
    const link = document.createElement('a');
    link.setAttribute('href', csvContent);
    link.setAttribute('download', `dashboard_export_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  exportJson() {
    if (!this.parsedRows.length) return;
    const jsonStr = JSON.stringify({
      generatedAt: new Date().toISOString(),
      categoryDimension: this.categoryCol,
      metricDimension: this.metricCol,
      timelineDimension: this.trendCol,
      records: this.parsedRows
    }, null, 2);

    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `dashboard_data_${Date.now()}.json`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }
}

// Instantiate on DOMContentLoaded
document.addEventListener('DOMContentLoaded', () => {
  new DashboardGenerator();
});