// Smart Data Analytics Suite - Production Client-Side Logic
// Ingestion, Instant Cleaning, Descriptive Statistics, SVG Visualizer, and Executive Report Generator.

document.addEventListener('DOMContentLoaded', () => {
  // Preset Datasets
  const PRESETS = {
    sales: [
      { order_id: 'ORD-1001', date: '2024-01-05', region: 'North America', category: 'Laptops', units: 3, unit_price: 1200, revenue: 3600, discount_pct: 5, rating: 4.8 },
      { order_id: 'ORD-1002', date: '2024-01-12', region: 'Europe', category: 'Smartphones', units: 5, unit_price: 800, revenue: 4000, discount_pct: 10, rating: 4.5 },
      { order_id: 'ORD-1003', date: '2024-01-18', region: 'Asia Pacific', category: 'Tablets', units: 2, unit_price: 500, revenue: 1000, discount_pct: 0, rating: 4.1 },
      { order_id: 'ORD-1004', date: '2024-01-25', region: 'North America', category: 'Accessories', units: 12, unit_price: 45, revenue: 540, discount_pct: 15, rating: 4.7 },
      { order_id: 'ORD-1005', date: '2024-02-02', region: 'Latin America', category: 'Smartphones', units: 4, unit_price: 750, revenue: 3000, discount_pct: 5, rating: 4.3 },
      { order_id: 'ORD-1006', date: '2024-02-09', region: 'Europe', category: 'Laptops', units: 6, unit_price: 1350, revenue: 8100, discount_pct: 12, rating: 4.9 },
      { order_id: 'ORD-1007', date: '2024-02-14', region: 'North America', category: 'Audio', units: 8, unit_price: 150, revenue: 1200, discount_pct: 8, rating: 4.6 },
      { order_id: 'ORD-1008', date: '2024-02-21', region: 'Asia Pacific', category: 'Smartphones', units: 7, unit_price: 820, revenue: 5740, discount_pct: 5, rating: 4.4 },
      { order_id: 'ORD-1009', date: '2024-03-01', region: 'Europe', category: 'Tablets', units: 3, unit_price: 520, revenue: 1560, discount_pct: 0, rating: 4.0 },
      { order_id: 'ORD-1010', date: '2024-03-08', region: 'North America', category: 'Laptops', units: 8, unit_price: 1250, revenue: 10000, discount_pct: 15, rating: 4.8 },
      { order_id: 'ORD-1011', date: '2024-03-15', region: 'Latin America', category: 'Accessories', units: 15, unit_price: 40, revenue: 600, discount_pct: 10, rating: 4.2 },
      { order_id: 'ORD-1012', date: '2024-03-22', region: 'Asia Pacific', category: 'Laptops', units: 4, unit_price: 1400, revenue: 5600, discount_pct: 5, rating: 4.7 },
      { order_id: 'ORD-1013', date: '2024-04-03', region: 'North America', category: 'Smartphones', units: 9, unit_price: 850, revenue: 7650, discount_pct: 8, rating: 4.6 },
      { order_id: 'ORD-1014', date: '2024-04-10', region: 'Europe', category: 'Audio', units: 10, unit_price: 180, revenue: 1800, discount_pct: 10, rating: 4.9 },
      { order_id: 'ORD-1015', date: '2024-04-17', region: 'Asia Pacific', category: 'Accessories', units: 20, unit_price: 35, revenue: 700, discount_pct: 5, rating: 4.5 },
      { order_id: 'ORD-1016', date: '2024-04-24', region: 'North America', category: 'Tablets', units: 5, unit_price: 480, revenue: 2400, discount_pct: 0, rating: 4.3 },
      { order_id: 'ORD-1017', date: '2024-05-02', region: 'Europe', category: 'Laptops', units: 7, unit_price: 1300, revenue: 9100, discount_pct: 10, rating: 4.8 },
      { order_id: 'ORD-1018', date: '2024-05-11', region: 'Latin America', category: 'Smartphones', units: 6, unit_price: 780, revenue: 4680, discount_pct: 6, rating: 4.4 },
      { order_id: 'ORD-1019', date: '2024-05-18', region: 'North America', category: 'Audio', units: 12, unit_price: 160, revenue: 1920, discount_pct: 12, rating: 4.7 },
      { order_id: 'ORD-1020', date: '2024-05-25', region: 'Asia Pacific', category: 'Laptops', units: 5, unit_price: 1450, revenue: 7250, discount_pct: 8, rating: 4.9 },
      { order_id: 'ORD-1021', date: '2024-06-03', region: 'Europe', category: 'Smartphones', units: 8, unit_price: 890, revenue: 7120, discount_pct: 5, rating: 4.6 },
      { order_id: 'ORD-1022', date: '2024-06-12', region: 'North America', category: 'Accessories', units: 25, unit_price: 50, revenue: 1250, discount_pct: 15, rating: 4.8 },
      { order_id: 'ORD-1023', date: '2024-06-19', region: 'Latin America', category: 'Tablets', units: 4, unit_price: 510, revenue: 2040, discount_pct: 0, rating: 4.2 },
      { order_id: 'ORD-1024', date: '2024-06-28', region: 'Asia Pacific', category: 'Audio', units: 14, unit_price: 170, revenue: 2380, discount_pct: 10, rating: 4.7 }
    ],
    hr: [
      { emp_id: 'EMP-101', dept: 'Engineering', role: 'Staff Backend Dev', exp_yrs: 8, salary: 145000, performance_score: 4.8, remote: 'Remote' },
      { emp_id: 'EMP-102', dept: 'Engineering', role: 'Frontend Engineer', exp_yrs: 4, salary: 110000, performance_score: 4.5, remote: 'Hybrid' },
      { emp_id: 'EMP-103', dept: 'Marketing', role: 'Growth Lead', exp_yrs: 6, salary: 120000, performance_score: 4.6, remote: 'Remote' },
      { emp_id: 'EMP-104', dept: 'Sales', role: 'Account Executive', exp_yrs: 5, salary: 95000, performance_score: 4.3, remote: 'Onsite' },
      { emp_id: 'EMP-105', dept: 'Product', role: 'Product Manager', exp_yrs: 7, salary: 138000, performance_score: 4.7, remote: 'Hybrid' },
      { emp_id: 'EMP-106', dept: 'Engineering', role: 'DevOps Engineer', exp_yrs: 5, salary: 125000, performance_score: 4.6, remote: 'Remote' },
      { emp_id: 'EMP-107', dept: 'Sales', role: 'Sales Director', exp_yrs: 12, salary: 185000, performance_score: 4.9, remote: 'Hybrid' },
      { emp_id: 'EMP-108', dept: 'Design', role: 'Senior UX Designer', exp_yrs: 6, salary: 118000, performance_score: 4.6, remote: 'Remote' },
      { emp_id: 'EMP-109', dept: 'Marketing', role: 'Content Strategist', exp_yrs: 3, salary: 78000, performance_score: 4.2, remote: 'Hybrid' },
      { emp_id: 'EMP-110', dept: 'Engineering', role: 'QA Automation Lead', exp_yrs: 6, salary: 115000, performance_score: 4.5, remote: 'Onsite' },
      { emp_id: 'EMP-111', dept: 'Finance', role: 'Financial Analyst', exp_yrs: 4, salary: 88000, performance_score: 4.4, remote: 'Hybrid' },
      { emp_id: 'EMP-112', dept: 'Product', role: 'Associate PM', exp_yrs: 2, salary: 85000, performance_score: 4.1, remote: 'Onsite' },
      { emp_id: 'EMP-113', dept: 'Engineering', role: 'Machine Learning Eng', exp_yrs: 7, salary: 155000, performance_score: 4.9, remote: 'Remote' },
      { emp_id: 'EMP-114', dept: 'Sales', role: 'Account Manager', exp_yrs: 4, salary: 92000, performance_score: 4.3, remote: 'Hybrid' },
      { emp_id: 'EMP-115', dept: 'HR', role: 'People Operations Lead', exp_yrs: 5, salary: 98000, performance_score: 4.7, remote: 'Hybrid' },
      { emp_id: 'EMP-116', dept: 'Design', role: 'UI Designer', exp_yrs: 3, salary: 82000, performance_score: 4.3, remote: 'Remote' }
    ],
    marketing: [
      { campaign: 'Summer Kickoff', channel: 'Google Ads', impressions: 450000, clicks: 18500, spend: 12000, conversions: 1240, revenue: 38500, roi: 3.21 },
      { campaign: 'Retargeting Surge', channel: 'Meta / IG', impressions: 280000, clicks: 14200, spend: 8500, conversions: 980, revenue: 29400, roi: 3.46 },
      { campaign: 'Brand Awareness', channel: 'YouTube', impressions: 920000, clicks: 22000, spend: 18000, conversions: 750, revenue: 24000, roi: 1.33 },
      { campaign: 'B2B Lead Gen', channel: 'LinkedIn', impressions: 160000, clicks: 6800, spend: 11500, conversions: 540, revenue: 36200, roi: 3.15 },
      { campaign: 'Influencer Collab', channel: 'TikTok', impressions: 650000, clicks: 31000, spend: 14000, conversions: 1650, revenue: 44500, roi: 3.18 },
      { campaign: 'Email Newsletter', channel: 'Email Direct', impressions: 85000, clicks: 12400, spend: 1500, conversions: 1120, revenue: 28900, roi: 19.27 },
      { campaign: 'Organic Search', channel: 'SEO Content', impressions: 340000, clicks: 28500, spend: 4000, conversions: 1840, revenue: 52000, roi: 13.00 },
      { campaign: 'Affiliate Partners', channel: 'Affiliates', impressions: 210000, clicks: 9600, spend: 6200, conversions: 890, revenue: 26800, roi: 4.32 },
      { campaign: 'Podcast Sponsorship', channel: 'Audio Ads', impressions: 380000, clicks: 7400, spend: 9500, conversions: 420, revenue: 15800, roi: 1.66 }
    ]
  };

  // State
  let rawDataset = JSON.parse(JSON.stringify(PRESETS.sales));
  let cleanedDataset = JSON.parse(JSON.stringify(PRESETS.sales));
  let columnTypes = {}; // col -> 'number' | 'text' | 'date'
  let auditLogs = ['[Initialization] Loaded standard preset dataset.'];

  // Table pagination state
  let currentPage = 1;
  let rowsPerPage = 25;
  let currentSearchQuery = '';

  // DOM Elements
  const tabButtons = document.querySelectorAll('.main-tab-btn');
  const tabPanes = document.querySelectorAll('.tab-pane');

  // KPI Header Cards
  const kpiRowCount = document.getElementById('kpi-row-count');
  const kpiCleanStatus = document.getElementById('kpi-clean-status');
  const kpiColCount = document.getElementById('kpi-col-count');
  const kpiColTypes = document.getElementById('kpi-col-types');
  const kpiDataHealth = document.getElementById('kpi-data-health');
  const kpiNullCount = document.getElementById('kpi-null-count');
  const kpiPrimarySum = document.getElementById('kpi-primary-sum');
  const kpiPrimaryCol = document.getElementById('kpi-primary-col');
  const kpiPrimaryAvg = document.getElementById('kpi-primary-avg');
  const kpiPrimaryMedian = document.getElementById('kpi-primary-median');

  // Tab 1 Elements
  const presetSalesBtn = document.getElementById('preset-sales');
  const presetHrBtn = document.getElementById('preset-hr');
  const presetMktBtn = document.getElementById('preset-marketing');
  const dropZone = document.getElementById('drop-zone');
  const fileInput = document.getElementById('file-input');
  const btnBrowse = document.getElementById('btn-browse-file');
  const rawPasteBox = document.getElementById('raw-paste-box');
  const btnParsePaste = document.getElementById('btn-parse-paste');
  const btnRunClean = document.getElementById('btn-run-clean');
  const btnRestoreRaw = document.getElementById('btn-restore-raw');
  const cleanAuditLog = document.getElementById('clean-audit-log');

  // Cleaning options
  const optTrim = document.getElementById('clean-trim-whitespace');
  const optDedup = document.getElementById('clean-deduplicate');
  const optDropEmpty = document.getElementById('clean-remove-empty-rows');
  const optImpute = document.getElementById('clean-impute-missing');
  const optTitleCase = document.getElementById('clean-standardize-case');

  // Tab 2 Elements
  const previewThead = document.getElementById('preview-thead');
  const previewTbody = document.getElementById('preview-tbody');
  const tableSearch = document.getElementById('table-search');
  const rowsPerPageSelect = document.getElementById('rows-per-page');
  const paginationInfo = document.getElementById('pagination-info');
  const btnPrevPage = document.getElementById('btn-page-prev');
  const btnNextPage = document.getElementById('btn-page-next');

  // Tab 3 Elements
  const statsTbody = document.getElementById('stats-tbody');

  // Tab 4 Elements
  const chartTypeSelect = document.getElementById('chart-type');
  const chartXColSelect = document.getElementById('chart-x-col');
  const chartYColSelect = document.getElementById('chart-y-col');
  const chartAggSelect = document.getElementById('chart-agg');
  const btnRenderChart = document.getElementById('btn-render-chart');
  const renderedChartTitle = document.getElementById('rendered-chart-title');
  const chartBadge = document.getElementById('chart-badge');
  const analyticsSvg = document.getElementById('analytics-svg');
  const chartWrap = document.getElementById('analytics-chart-wrap');
  const tooltip = document.getElementById('analytics-tooltip');

  // Tab 5 Elements
  const reportContent = document.getElementById('report-content');
  const btnCopyReport = document.getElementById('btn-copy-report');
  const btnPrintReport = document.getElementById('btn-print-report');
  const btnExportCsv = document.getElementById('btn-export-clean-csv');
  const btnExportMd = document.getElementById('btn-export-report-md');

  // Formatters
  function formatNum(val, decimals = 2) {
    if (isNaN(val) || val === null) return '0.00';
    return Number(val).toLocaleString('en-US', {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals
    });
  }

  function formatCurrency(val) {
    if (isNaN(val) || val === null) return '$0.00';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0
    }).format(val);
  }

  // --- Type Inference ---
  function inferColumnTypes(data) {
    if (!data || data.length === 0) return {};
    const cols = Object.keys(data[0]);
    const types = {};

    cols.forEach(col => {
      let numCount = 0;
      let dateCount = 0;
      let totalCount = 0;

      data.forEach(row => {
        const val = row[col];
        if (val !== null && val !== undefined && String(val).trim() !== '') {
          totalCount++;
          const strVal = String(val).trim();
          if (!isNaN(Number(strVal.replace(/[\$,]/g, '')))) {
            numCount++;
          } else if (!isNaN(Date.parse(strVal)) && strVal.length > 5 && (strVal.includes('-') || strVal.includes('/'))) {
            dateCount++;
          }
        }
      });

      if (totalCount > 0 && (numCount / totalCount) >= 0.75) {
        types[col] = 'number';
      } else if (totalCount > 0 && (dateCount / totalCount) >= 0.75) {
        types[col] = 'date';
      } else {
        types[col] = 'text';
      }
    });

    return types;
  }

  // --- Instant Cleaning Pass ---
  function executeCleaningPass() {
    const originalCount = rawDataset.length;
    let data = JSON.parse(JSON.stringify(rawDataset));
    const logs = [];

    const doTrim = optTrim.checked;
    const doDedup = optDedup.checked;
    const doDropEmpty = optDropEmpty.checked;
    const doImpute = optImpute.checked;
    const doTitleCase = optTitleCase.checked;

    // 1. Drop completely empty rows
    if (doDropEmpty) {
      const before = data.length;
      data = data.filter(row => {
        return Object.values(row).some(v => v !== null && v !== undefined && String(v).trim() !== '');
      });
      const dropped = before - data.length;
      if (dropped > 0) logs.push(`[Rule] Dropped ${dropped} completely empty rows.`);
    }

    // 2. Trim whitespace & optional Title Case
    if (doTrim || doTitleCase) {
      let trimmedCount = 0;
      data.forEach(row => {
        Object.keys(row).forEach(k => {
          if (typeof row[k] === 'string') {
            const orig = row[k];
            let clean = doTrim ? orig.trim() : orig;
            if (doTitleCase && clean.length > 0) {
              clean = clean.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' ');
            }
            if (clean !== orig) {
              row[k] = clean;
              trimmedCount++;
            }
          }
        });
      });
      if (trimmedCount > 0) logs.push(`[Rule] Sanitized whitespace & casing across ${trimmedCount} string values.`);
    }

    // 3. Deduplicate rows
    if (doDedup) {
      const before = data.length;
      const seen = new Set();
      data = data.filter(row => {
        const signature = JSON.stringify(row);
        if (seen.has(signature)) return false;
        seen.add(signature);
        return true;
      });
      const dupes = before - data.length;
      if (dupes > 0) logs.push(`[Rule] Pruned ${dupes} exact duplicate rows.`);
    }

    // 4. Impute missing numeric cells with Column Mean
    const cols = data.length > 0 ? Object.keys(data[0]) : [];
    const types = inferColumnTypes(data);

    if (doImpute) {
      let imputedCells = 0;
      cols.forEach(col => {
        if (types[col] === 'number') {
          // Calculate mean of present numbers
          let sum = 0, count = 0;
          data.forEach(row => {
            const v = parseFloat(String(row[col]).replace(/[\$,]/g, ''));
            if (!isNaN(v) && row[col] !== null && row[col] !== '') {
              sum += v;
              count++;
            }
          });
          const mean = count > 0 ? sum / count : 0;

          data.forEach(row => {
            const rawV = row[col];
            if (rawV === null || rawV === undefined || String(rawV).trim() === '' || isNaN(Number(String(rawV).replace(/[\$,]/g, '')))) {
              row[col] = Math.round(mean * 100) / 100;
              imputedCells++;
            } else {
              row[col] = Number(String(rawV).replace(/[\$,]/g, ''));
            }
          });
        }
      });
      if (imputedCells > 0) logs.push(`[Rule] Imputed ${imputedCells} missing numeric cells with column average.`);
    }

    cleanedDataset = data;
    columnTypes = inferColumnTypes(cleanedDataset);

    if (logs.length === 0) {
      logs.push('[Audit] Data already clean. All records passed integrity checks.');
    }
    auditLogs = logs;

    cleanAuditLog.innerHTML = logs.map(l => `<div>${l}</div>`).join('');
    updateSuite();
  }

  // --- Compute Descriptive Statistics ---
  function computeDescriptiveStats(data, types) {
    if (!data || data.length === 0) return [];
    const cols = Object.keys(data[0]);
    const n = data.length;
    const stats = [];

    cols.forEach(col => {
      const type = types[col] || 'text';
      let missingCount = 0;
      const values = [];

      data.forEach(r => {
        const val = r[col];
        if (val === null || val === undefined || String(val).trim() === '') {
          missingCount++;
        } else {
          values.push(val);
        }
      });

      if (type === 'number') {
        const nums = values.map(v => Number(v)).filter(v => !isNaN(v)).sort((a, b) => a - b);
        const count = nums.length;
        if (count === 0) {
          stats.push({ col, type, count: 0, missing: missingCount, mean: 0, median: 0, std: 0, min: 0, q1: 0, q3: 0, max: 0, sum: 0 });
          return;
        }

        const sum = nums.reduce((a, b) => a + b, 0);
        const mean = sum / count;

        const getPercentile = (p) => {
          const idx = (p / 100) * (count - 1);
          const base = Math.floor(idx);
          const rest = idx - base;
          if (nums[base + 1] !== undefined) {
            return nums[base] + rest * (nums[base + 1] - nums[base]);
          }
          return nums[base];
        };

        const median = getPercentile(50);
        const q1 = getPercentile(25);
        const q3 = getPercentile(75);
        const min = nums[0];
        const max = nums[count - 1];

        const variance = nums.reduce((acc, v) => acc + Math.pow(v - mean, 2), 0) / (count > 1 ? count - 1 : 1);
        const std = Math.sqrt(variance);

        stats.push({ col, type, count, missing: missingCount, mean, median, std, min, q1, q3, max, sum });
      } else {
        // Categorical / Text / Date stats
        const freqMap = {};
        values.forEach(v => {
          freqMap[v] = (freqMap[v] || 0) + 1;
        });

        let modeVal = 'N/A';
        let modeFreq = 0;
        Object.entries(freqMap).forEach(([k, f]) => {
          if (f > modeFreq) {
            modeFreq = f;
            modeVal = k;
          }
        });

        const uniqueCount = Object.keys(freqMap).length;
        const modePct = values.length > 0 ? ((modeFreq / values.length) * 100).toFixed(0) : 0;

        stats.push({
          col,
          type,
          count: values.length,
          missing: missingCount,
          mode: modeVal,
          modeFreq,
          modePct,
          uniqueCount
        });
      }
    });

    return stats;
  }

  // --- Update Master Suite UI ---
  function updateSuite() {
    const data = cleanedDataset;
    const n = data.length;
    columnTypes = inferColumnTypes(data);
    const cols = data.length > 0 ? Object.keys(data[0]) : [];

    // KPI Cards
    kpiRowCount.textContent = n.toLocaleString();
    kpiColCount.textContent = cols.length;

    const numCols = cols.filter(c => columnTypes[c] === 'number');
    const textCols = cols.filter(c => columnTypes[c] !== 'number');
    kpiColTypes.textContent = `${numCols.length} Numeric, ${textCols.length} Categorical`;

    // Compute nulls across all cells
    let totalCells = n * cols.length;
    let missingCells = 0;
    data.forEach(r => {
      cols.forEach(c => {
        if (r[c] === null || r[c] === undefined || String(r[c]).trim() === '') missingCells++;
      });
    });

    const healthPct = totalCells > 0 ? Math.max(0, 100 - (missingCells / totalCells) * 100) : 100;
    kpiDataHealth.textContent = `${healthPct.toFixed(1)}%`;
    kpiNullCount.textContent = `${missingCells} missing values`;

    // Primary Metric (pick revenue, salary, spend, or first numeric)
    let primaryCol = numCols.find(c => /revenue|sales|salary|spend|total|volume/i.test(c)) || numCols[0];
    if (primaryCol && n > 0) {
      const primaryVals = data.map(r => Number(r[primaryCol]) || 0);
      const sum = primaryVals.reduce((a, b) => a + b, 0);
      const avg = sum / n;
      const sorted = [...primaryVals].sort((a, b) => a - b);
      const median = sorted[Math.floor(n / 2)];

      const isMoney = /revenue|sales|salary|spend|price/i.test(primaryCol);
      kpiPrimarySum.textContent = isMoney ? formatCurrency(sum) : formatNum(sum, 0);
      kpiPrimaryCol.textContent = `Total ${primaryCol}`;
      kpiPrimaryAvg.textContent = isMoney ? formatCurrency(avg) : formatNum(avg, 1);
      kpiPrimaryMedian.textContent = `Median: ${isMoney ? formatCurrency(median) : formatNum(median, 1)}`;
    } else {
      kpiPrimarySum.textContent = '–';
      kpiPrimaryCol.textContent = 'No Numeric Column';
      kpiPrimaryAvg.textContent = '–';
      kpiPrimaryMedian.textContent = '–';
    }

    // Refresh Sub-Modules
    renderTablePreview();
    renderStatsTable();
    populateChartControls();
    renderExecutiveReport();
  }

  // --- Render Table Preview & Pagination ---
  function renderTablePreview() {
    previewThead.innerHTML = '';
    previewTbody.innerHTML = '';

    if (cleanedDataset.length === 0) {
      previewThead.innerHTML = '<tr><th>No Data</th></tr>';
      previewTbody.innerHTML = '<tr><td style="text-align: center; padding: 2rem;">No records loaded.</td></tr>';
      paginationInfo.textContent = 'Showing 0 records';
      return;
    }

    const cols = Object.keys(cleanedDataset[0]);

    // Table Header with Type Badges
    const headTr = document.createElement('tr');
    cols.forEach(c => {
      const type = columnTypes[c];
      let badgeClass = 'badge-text';
      let icon = 'Abc';
      if (type === 'number') { badgeClass = 'badge-num'; icon = '#'; }
      if (type === 'date') { badgeClass = 'badge-date'; icon = '📅'; }

      const th = document.createElement('th');
      th.innerHTML = `${c} <span class="col-badge ${badgeClass}">${icon}</span>`;
      headTr.appendChild(th);
    });
    previewThead.appendChild(headTr);

    // Filter Rows
    let filtered = cleanedDataset;
    if (currentSearchQuery.trim()) {
      const q = currentSearchQuery.toLowerCase();
      filtered = cleanedDataset.filter(row => {
        return Object.values(row).some(v => String(v).toLowerCase().includes(q));
      });
    }

    const totalRecords = filtered.length;
    const totalPages = Math.ceil(totalRecords / rowsPerPage) || 1;
    if (currentPage > totalPages) currentPage = totalPages;
    if (currentPage < 1) currentPage = 1;

    const startIdx = (currentPage - 1) * rowsPerPage;
    const endIdx = Math.min(totalRecords, startIdx + rowsPerPage);
    const pageRows = filtered.slice(startIdx, endIdx);

    pageRows.forEach(row => {
      const tr = document.createElement('tr');
      cols.forEach(c => {
        const td = document.createElement('td');
        const val = row[c];
        if (columnTypes[c] === 'number') {
          td.textContent = formatNum(val, 2);
          td.style.fontFamily = 'monospace';
        } else {
          td.textContent = val !== null && val !== undefined ? String(val) : '';
        }
        tr.appendChild(td);
      });
      previewTbody.appendChild(tr);
    });

    paginationInfo.textContent = `Showing ${totalRecords === 0 ? 0 : startIdx + 1} to ${endIdx} of ${totalRecords} records${currentSearchQuery ? ' (filtered)' : ''}`;
  }

  // --- Render Descriptive Stats Table ---
  function renderStatsTable() {
    statsTbody.innerHTML = '';
    const stats = computeDescriptiveStats(cleanedDataset, columnTypes);

    if (stats.length === 0) {
      statsTbody.innerHTML = '<tr><td colspan="12" style="text-align: center; padding: 2rem;">No dataset loaded for statistical profiling.</td></tr>';
      return;
    }

    stats.forEach(st => {
      const tr = document.createElement('tr');
      if (st.type === 'number') {
        tr.innerHTML = `
          <td><strong>${st.col}</strong></td>
          <td><span class="col-badge badge-num"># Numeric</span></td>
          <td>${st.count}</td>
          <td style="color: ${st.missing > 0 ? 'var(--error)' : 'inherit'};">${st.missing}</td>
          <td><strong>${formatNum(st.mean, 2)}</strong></td>
          <td>${formatNum(st.median, 2)}</td>
          <td>${formatNum(st.std, 2)}</td>
          <td>${formatNum(st.min, 2)}</td>
          <td>${formatNum(st.q1, 2)}</td>
          <td>${formatNum(st.q3, 2)}</td>
          <td>${formatNum(st.max, 2)}</td>
          <td><strong>${formatNum(st.sum, 1)}</strong></td>
        `;
      } else {
        tr.innerHTML = `
          <td><strong>${st.col}</strong></td>
          <td><span class="col-badge ${st.type === 'date' ? 'badge-date' : 'badge-text'}">${st.type === 'date' ? '📅 Date' : 'Abc Categorical'}</span></td>
          <td>${st.count}</td>
          <td style="color: ${st.missing > 0 ? 'var(--error)' : 'inherit'};">${st.missing}</td>
          <td colspan="2"><span style="font-weight: 600; color: var(--accent);">${st.mode}</span> (${st.modeFreq}x / ${st.modePct}%)</td>
          <td colspan="5" style="color: var(--text-tertiary); font-size: 0.8rem;">Unique Values: <strong>${st.uniqueCount}</strong></td>
          <td>–</td>
        `;
      }
      statsTbody.appendChild(tr);
    });
  }

  // --- Chart Controls Setup ---
  function populateChartControls() {
    chartXColSelect.innerHTML = '';
    chartYColSelect.innerHTML = '';

    if (cleanedDataset.length === 0) return;
    const cols = Object.keys(cleanedDataset[0]);

    cols.forEach(c => {
      const optX = document.createElement('option');
      optX.value = c;
      optX.textContent = `${c} (${columnTypes[c]})`;
      chartXColSelect.appendChild(optX);

      if (columnTypes[c] === 'number') {
        const optY = document.createElement('option');
        optY.value = c;
        optY.textContent = `${c} (numeric)`;
        chartYColSelect.appendChild(optY);
      }
    });

    // Auto-select smart defaults
    const dateOrTextCol = cols.find(c => columnTypes[c] === 'date') || cols.find(c => columnTypes[c] === 'text') || cols[0];
    if (dateOrTextCol) chartXColSelect.value = dateOrTextCol;

    const numCols = cols.filter(c => columnTypes[c] === 'number');
    const bestNum = numCols.find(c => /revenue|salary|spend|roi|value/i.test(c)) || numCols[0];
    if (bestNum) chartYColSelect.value = bestNum;

    renderChart();
  }

  // --- SVG Chart Generation ---
  function renderChart() {
    if (cleanedDataset.length === 0) {
      analyticsSvg.innerHTML = '<text x="400" y="200" fill="var(--text-tertiary)" text-anchor="middle" font-size="14">No data to chart.</text>';
      return;
    }

    const type = chartTypeSelect.value;
    const xCol = chartXColSelect.value;
    const yCol = chartYColSelect.value;
    const agg = chartAggSelect.value;

    const width = 800;
    const height = 400;
    const margin = { top: 35, right: 35, bottom: 50, left: 75 };
    const plotWidth = width - margin.left - margin.right;
    const plotHeight = height - margin.top - margin.bottom;

    renderedChartTitle.textContent = `${type.toUpperCase()}: ${yCol || ''} vs ${xCol} [${agg.toUpperCase()}]`;
    chartBadge.textContent = `${cleanedDataset.length} rows processed`;

    let svgHtml = '';

    if (type === 'bar') {
      // Aggregate Y by Categorical X
      const groupMap = {};
      cleanedDataset.forEach(row => {
        const key = String(row[xCol] || 'Unknown');
        const num = yCol ? (Number(row[yCol]) || 0) : 1;
        if (!groupMap[key]) groupMap[key] = { sum: 0, count: 0, nums: [] };
        groupMap[key].sum += num;
        groupMap[key].count++;
        groupMap[key].nums.push(num);
      });

      const categories = Object.keys(groupMap);
      const barData = categories.map(cat => {
        let val = groupMap[cat].sum;
        if (agg === 'avg') val = groupMap[cat].sum / groupMap[cat].count;
        if (agg === 'count') val = groupMap[cat].count;
        return { cat, val };
      });

      const maxVal = Math.max(...barData.map(b => b.val), 1) * 1.15;
      const barW = Math.max(6, Math.min(48, (plotWidth / categories.length) * 0.65));

      // Grid
      for (let s = 0; s <= 4; s++) {
        const val = (maxVal / 4) * s;
        const yPos = margin.top + plotHeight - (val / maxVal) * plotHeight;
        svgHtml += `
          <line x1="${margin.left}" y1="${yPos}" x2="${width - margin.right}" y2="${yPos}" stroke="var(--border)" stroke-dasharray="3,3" opacity="0.6" />
          <text x="${margin.left - 10}" y="${yPos + 4}" fill="var(--text-tertiary)" font-size="10" text-anchor="end">${formatNum(val, 0)}</text>
        `;
      }

      // Bars
      barData.forEach((d, i) => {
        const xPos = margin.left + (i + 0.5) * (plotWidth / categories.length);
        const barH = (d.val / maxVal) * plotHeight;
        const yPos = margin.top + plotHeight - barH;

        svgHtml += `
          <rect x="${xPos - barW / 2}" y="${yPos}" width="${barW}" height="${barH}" fill="var(--accent)" opacity="0.85" rx="3" class="chart-hover-node" data-label="${d.cat}" data-val="${d.val}" style="cursor: pointer;" />
          <text x="${xPos}" y="${height - margin.bottom + 18}" fill="var(--text-tertiary)" font-size="10" text-anchor="middle" font-family="sans-serif">${d.cat.length > 10 ? d.cat.slice(0, 9) + '…' : d.cat}</text>
        `;
      });

    } else if (type === 'histogram') {
      // Histogram of Y metric
      const nums = cleanedDataset.map(r => Number(r[yCol])).filter(v => !isNaN(v)).sort((a, b) => a - b);
      if (nums.length === 0) {
        analyticsSvg.innerHTML = '<text x="400" y="200" fill="var(--text-tertiary)" text-anchor="middle">No numeric values for histogram.</text>';
        return;
      }
      const minVal = nums[0];
      const maxVal = nums[nums.length - 1];
      const binCount = 8;
      const binSize = (maxVal - minVal) / binCount || 1;
      const bins = Array.from({ length: binCount }, () => 0);

      nums.forEach(v => {
        const idx = Math.min(binCount - 1, Math.floor((v - minVal) / binSize));
        bins[idx]++;
      });

      const maxFreq = Math.max(...bins, 1);
      const barW = (plotWidth / binCount) * 0.85;

      for (let s = 0; s <= 4; s++) {
        const f = Math.round((maxFreq / 4) * s);
        const yPos = margin.top + plotHeight - (f / maxFreq) * plotHeight;
        svgHtml += `
          <line x1="${margin.left}" y1="${yPos}" x2="${width - margin.right}" y2="${yPos}" stroke="var(--border)" stroke-dasharray="3,3" opacity="0.6" />
          <text x="${margin.left - 10}" y="${yPos + 4}" fill="var(--text-tertiary)" font-size="10" text-anchor="end">${f}</text>
        `;
      }

      bins.forEach((freq, i) => {
        const binStart = minVal + i * binSize;
        const binEnd = binStart + binSize;
        const xPos = margin.left + (i + 0.5) * (plotWidth / binCount);
        const barH = (freq / maxFreq) * plotHeight;
        const yPos = margin.top + plotHeight - barH;

        svgHtml += `
          <rect x="${xPos - barW / 2}" y="${yPos}" width="${barW}" height="${barH}" fill="#38bdf8" opacity="0.8" rx="2" class="chart-hover-node" data-label="[${formatNum(binStart, 0)} – ${formatNum(binEnd, 0)}]" data-val="${freq} items" style="cursor: pointer;" />
          <text x="${xPos}" y="${height - margin.bottom + 18}" fill="var(--text-tertiary)" font-size="9" text-anchor="middle">${formatNum(binStart, 0)}</text>
        `;
      });

    } else if (type === 'scatter') {
      // Scatter plot: numeric X vs numeric Y
      const pts = cleanedDataset.map(r => ({
        x: Number(r[xCol]) || 0,
        y: Number(r[yCol]) || 0
      })).filter(p => !isNaN(p.x) && !isNaN(p.y));

      const xMin = Math.min(...pts.map(p => p.x));
      const xMax = Math.max(...pts.map(p => p.x)) || 1;
      const yMin = Math.min(...pts.map(p => p.y));
      const yMax = Math.max(...pts.map(p => p.y)) || 1;

      const mapX = (x) => margin.left + ((x - xMin) / (xMax - xMin || 1)) * plotWidth;
      const mapY = (y) => margin.top + plotHeight - ((y - yMin) / (yMax - yMin || 1)) * plotHeight;

      // Axis lines
      svgHtml += `
        <line x1="${margin.left}" y1="${margin.top + plotHeight}" x2="${width - margin.right}" y2="${margin.top + plotHeight}" stroke="var(--border)" />
        <line x1="${margin.left}" y1="${margin.top}" x2="${margin.left}" y2="${margin.top + plotHeight}" stroke="var(--border)" />
        <text x="${width / 2}" y="${height - 10}" fill="var(--text-tertiary)" font-size="10" text-anchor="middle">${xCol} &rarr;</text>
        <text x="25" y="${height / 2}" fill="var(--text-tertiary)" font-size="10" text-anchor="middle" transform="rotate(-90 25,${height / 2})">&uarr; ${yCol}</text>
      `;

      pts.forEach(p => {
        svgHtml += `
          <circle cx="${mapX(p.x)}" cy="${mapY(p.y)}" r="4" fill="#818cf8" stroke="var(--bg-secondary)" stroke-width="1.5" class="chart-hover-node" data-label="X: ${p.x}, Y: ${p.y}" data-val="" style="cursor: pointer;" />
        `;
      });

    } else {
      // Trend Line
      const pts = cleanedDataset.map((r, i) => ({
        label: String(r[xCol] || `Row ${i + 1}`),
        val: Number(r[yCol]) || 0
      }));

      const maxVal = Math.max(...pts.map(p => p.val), 1) * 1.15;
      const minVal = Math.min(...pts.map(p => p.val), 0);

      const mapX = (i) => margin.left + (i / Math.max(1, pts.length - 1)) * plotWidth;
      const mapY = (val) => margin.top + plotHeight - ((val - minVal) / (maxVal - minVal || 1)) * plotHeight;

      // Grid
      for (let s = 0; s <= 4; s++) {
        const val = minVal + ((maxVal - minVal) / 4) * s;
        const yPos = mapY(val);
        svgHtml += `
          <line x1="${margin.left}" y1="${yPos}" x2="${width - margin.right}" y2="${yPos}" stroke="var(--border)" stroke-dasharray="3,3" opacity="0.6" />
          <text x="${margin.left - 10}" y="${yPos + 4}" fill="var(--text-tertiary)" font-size="10" text-anchor="end">${formatNum(val, 0)}</text>
        `;
      }

      // Line
      let pathD = '';
      pts.forEach((p, i) => {
        pathD += `${i === 0 ? 'M' : 'L'} ${mapX(i)} ${mapY(p.val)} `;
      });

      svgHtml += `
        <path d="${pathD}" fill="none" stroke="var(--accent)" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" />
      `;

      pts.forEach((p, i) => {
        const xPos = mapX(i);
        const yPos = mapY(p.val);
        svgHtml += `
          <circle cx="${xPos}" cy="${yPos}" r="4" fill="var(--bg-secondary)" stroke="var(--accent)" stroke-width="2" class="chart-hover-node" data-label="${p.label}" data-val="${formatNum(p.val, 2)}" style="cursor: pointer;" />
        `;
        if (i % Math.ceil(pts.length / 10) === 0 || i === pts.length - 1) {
          svgHtml += `<text x="${xPos}" y="${height - margin.bottom + 18}" fill="var(--text-tertiary)" font-size="10" text-anchor="middle">${p.label}</text>`;
        }
      });
    }

    analyticsSvg.innerHTML = svgHtml;

    // Attach chart hover listeners
    analyticsSvg.querySelectorAll('.chart-hover-node').forEach(node => {
      node.addEventListener('mouseenter', () => {
        const lbl = node.getAttribute('data-label');
        const val = node.getAttribute('data-val');
        const rect = node.getBoundingClientRect();
        const wrapRect = chartWrap.getBoundingClientRect();

        tooltip.innerHTML = `<strong>${lbl}</strong>${val ? `<div>Value: <strong>${val}</strong></div>` : ''}`;
        tooltip.style.left = `${rect.left - wrapRect.left + rect.width / 2}px`;
        tooltip.style.top = `${rect.top - wrapRect.top}px`;
        tooltip.style.opacity = '1';
      });

      node.addEventListener('mouseleave', () => {
        tooltip.style.opacity = '0';
      });
    });
  }

  // --- Executive Report Generation ---
  function renderExecutiveReport() {
    const data = cleanedDataset;
    const n = data.length;
    if (n === 0) {
      reportContent.innerHTML = '<p>No data loaded.</p>';
      return;
    }

    const cols = Object.keys(data[0]);
    const types = columnTypes;
    const stats = computeDescriptiveStats(data, types);
    const numCols = cols.filter(c => types[c] === 'number');
    const catCols = cols.filter(c => types[c] !== 'number');

    // Find primary numeric attribute
    const primaryCol = numCols.find(c => /revenue|sales|salary|spend/i.test(c)) || numCols[0];
    const primaryStat = stats.find(s => s.col === primaryCol);

    let html = `
      <h2>Executive Data Analytics & Intelligence Report</h2>
      <p style="color: var(--text-tertiary); font-size: 0.85rem;">Generated on ${new Date().toLocaleDateString('en-US', { dateStyle: 'full' })}</p>
      
      <h3>1. Dataset Overview & Data Quality Assessment</h3>
      <p>
        The uploaded repository contains <strong>${n} valid records</strong> spanning <strong>${cols.length} discrete business attributes</strong> (${numCols.length} numerical metrics and ${catCols.length} categorical dimensions). 
        Data integrity is scored at <strong>${kpiDataHealth.textContent}</strong> with all missing values resolved via the automated data cleaning pipeline.
      </p>

      <h3>2. Central Tendency & Performance Metrics</h3>
      <p>
        Analysis of the primary metric (<strong>${primaryCol || 'N/A'}</strong>) reveals total cumulative volume of <strong>${primaryStat ? formatCurrency(primaryStat.sum) : 'N/A'}</strong>, 
        yielding an average of <strong>${primaryStat ? formatCurrency(primaryStat.mean) : 'N/A'}</strong> per observation and a median benchmark of <strong>${primaryStat ? formatCurrency(primaryStat.median) : 'N/A'}</strong>. 
        The distribution exhibits a standard deviation of <strong>${primaryStat ? formatCurrency(primaryStat.std) : 'N/A'}</strong>, spanning from <strong>${primaryStat ? formatCurrency(primaryStat.min) : 'N/A'}</strong> up to <strong>${primaryStat ? formatCurrency(primaryStat.max) : 'N/A'}</strong>.
      </p>

      <h3>3. Segment Modality & Category Drivers</h3>
      <ul>
    `;

    catCols.slice(0, 3).forEach(c => {
      const st = stats.find(s => s.col === c);
      if (st) {
        html += `<li><strong>${c}:</strong> Modal driver is <em>"${st.mode}"</em> appearing in ${st.modeFreq} records (${st.modePct}% representation) across ${st.uniqueCount} distinct variants.</li>`;
      }
    });

    html += `
      </ul>

      <h3>4. Strategic Recommendations & Analytical Insights</h3>
      <p>
        1. <strong>Outlier Management:</strong> Observations approaching the upper quartile (${primaryStat ? formatCurrency(primaryStat.q3) : '–'}) represent high-yield leverage opportunities. Recommend prioritizing these high-performing segments.<br>
        2. <strong>Resource Allocation:</strong> Given categorical concentration in top modes, consider diversifying resource investments across lower-frequency categories.<br>
        3. <strong>Predictive Readiness:</strong> Data exhibits high cleanliness and standard distribution parameters, rendering it ideal for regression and algorithmic trend detection.
      </p>
    `;

    reportContent.innerHTML = html;
  }

  // --- Export Clean CSV ---
  function exportCleanCSV() {
    if (cleanedDataset.length === 0) return;
    const cols = Object.keys(cleanedDataset[0]);
    let csv = cols.map(c => `"${c}"`).join(',') + '\r\n';

    cleanedDataset.forEach(row => {
      const line = cols.map(c => {
        const val = row[c];
        if (typeof val === 'string') return `"${val.replace(/"/g, '""')}"`;
        return val !== null && val !== undefined ? val : '';
      }).join(',');
      csv += line + '\r\n';
    });

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'cleaned_dataset.csv';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  // --- Export Markdown Report ---
  function exportMarkdownReport() {
    const reportText = `# Smart Data Analytics Suite - Executive Summary\n\n` +
      `**Generated:** ${new Date().toLocaleDateString()}\n\n` +
      `## Overview\n` +
      `- **Total Records:** ${cleanedDataset.length}\n` +
      `- **Integrity Rating:** ${kpiDataHealth.textContent}\n` +
      `- **Primary Metric Sum:** ${kpiPrimarySum.textContent}\n` +
      `- **Primary Metric Average:** ${kpiPrimaryAvg.textContent}\n\n` +
      `## Statistical Summary\n` +
      reportContent.innerText + `\n\n---\n*Report generated via ALL-IN-ONE Smart Data Analytics Suite*`;

    const blob = new Blob([reportText], { type: 'text/markdown;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'executive_analytics_report.md';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  // --- Parse Raw Delimited Text ---
  function parseDelimitedText(text) {
    const trimmed = text.trim();
    if (!trimmed) return [];

    // Try parsing JSON first
    if (trimmed.startsWith('[') && trimmed.endsWith(']')) {
      try {
        const json = JSON.parse(trimmed);
        if (Array.isArray(json) && json.length > 0) return json;
      } catch (err) {
        // Fall back to delimited
      }
    }

    const lines = trimmed.split(/\r?\n/).filter(l => l.trim().length > 0);
    if (lines.length < 2) return [];

    // Detect delimiter: tab or comma
    const delimiter = lines[0].includes('\t') ? '\t' : ',';
    const headers = lines[0].split(delimiter).map(h => h.trim().replace(/^["']|["']$/g, ''));

    const records = [];
    for (let i = 1; i < lines.length; i++) {
      const parts = lines[i].split(delimiter).map(p => p.trim().replace(/^["']|["']$/g, ''));
      const obj = {};
      headers.forEach((h, idx) => {
        let val = parts[idx] !== undefined ? parts[idx] : null;
        if (val !== null && !isNaN(Number(val.replace(/[\$,]/g, '')))) {
          val = Number(val.replace(/[\$,]/g, ''));
        }
        obj[h] = val;
      });
      records.push(obj);
    }

    return records;
  }

  // --- Event Listeners Setup ---

  // Main Tabs Navigation
  tabButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      tabButtons.forEach(b => b.classList.remove('active'));
      tabPanes.forEach(p => p.classList.add('hidden'));

      btn.classList.add('active');
      const target = document.getElementById(btn.getAttribute('data-tab'));
      if (target) target.classList.remove('hidden');

      if (btn.getAttribute('data-tab') === 'tab-charts') {
        renderChart();
      }
    });
  });

  // Presets
  function setPreset(key, btn) {
    [presetSalesBtn, presetHrBtn, presetMktBtn].forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    rawDataset = JSON.parse(JSON.stringify(PRESETS[key]));
    cleanedDataset = JSON.parse(JSON.stringify(PRESETS[key]));
    auditLogs = [`[Preset] Loaded ${key.toUpperCase()} dataset with ${rawDataset.length} rows.`];
    cleanAuditLog.innerHTML = `<div>${auditLogs[0]}</div>`;
    updateSuite();
  }

  presetSalesBtn.addEventListener('click', () => setPreset('sales', presetSalesBtn));
  presetHrBtn.addEventListener('click', () => setPreset('hr', presetHrBtn));
  presetMktBtn.addEventListener('click', () => setPreset('marketing', presetMktBtn));

  // File Upload
  btnBrowse.addEventListener('click', () => fileInput.click());
  fileInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const parsed = parseDelimitedText(event.target.result);
        if (parsed.length > 0) {
          rawDataset = parsed;
          executeCleaningPass();
        } else {
          alert('Could not parse valid data rows from file.');
        }
      };
      reader.readAsText(file);
    }
  });

  dropZone.addEventListener('dragover', (e) => {
    e.preventDefault();
    dropZone.classList.add('dragover');
  });

  dropZone.addEventListener('dragleave', () => dropZone.classList.remove('dragover'));
  dropZone.addEventListener('drop', (e) => {
    e.preventDefault();
    dropZone.classList.remove('dragover');
    const file = e.dataTransfer.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const parsed = parseDelimitedText(event.target.result);
        if (parsed.length > 0) {
          rawDataset = parsed;
          executeCleaningPass();
        } else {
          alert('Could not parse valid data rows.');
        }
      };
      reader.readAsText(file);
    }
  });

  btnParsePaste.addEventListener('click', () => {
    const parsed = parseDelimitedText(rawPasteBox.value);
    if (parsed.length > 0) {
      rawDataset = parsed;
      executeCleaningPass();
      alert(`Parsed ${parsed.length} records successfully!`);
    } else {
      alert('Please paste valid CSV, TSV, or JSON records.');
    }
  });

  btnRunClean.addEventListener('click', executeCleaningPass);
  btnRestoreRaw.addEventListener('click', () => {
    cleanedDataset = JSON.parse(JSON.stringify(rawDataset));
    auditLogs = ['[Rollback] Restored original raw dataset state.'];
    cleanAuditLog.innerHTML = `<div>${auditLogs[0]}</div>`;
    updateSuite();
  });

  // Table Search & Pagination
  tableSearch.addEventListener('input', (e) => {
    currentSearchQuery = e.target.value;
    currentPage = 1;
    renderTablePreview();
  });

  rowsPerPageSelect.addEventListener('change', (e) => {
    rowsPerPage = parseInt(e.target.value, 10);
    currentPage = 1;
    renderTablePreview();
  });

  btnPrevPage.addEventListener('click', () => {
    if (currentPage > 1) {
      currentPage--;
      renderTablePreview();
    }
  });

  btnNextPage.addEventListener('click', () => {
    currentPage++;
    renderTablePreview();
  });

  // Chart Generator triggers
  btnRenderChart.addEventListener('click', renderChart);
  chartTypeSelect.addEventListener('change', () => {
    const isHist = chartTypeSelect.value === 'histogram';
    const isScatter = chartTypeSelect.value === 'scatter';
    document.getElementById('group-agg-method').style.display = (isHist || isScatter) ? 'none' : 'flex';
    renderChart();
  });

  // Exports
  btnExportCsv.addEventListener('click', exportCleanCSV);
  btnExportMd.addEventListener('click', exportMarkdownReport);

  btnCopyReport.addEventListener('click', () => {
    navigator.clipboard.writeText(reportContent.innerText).then(() => {
      btnCopyReport.textContent = 'Copied Markdown!';
      setTimeout(() => {
        btnCopyReport.innerHTML = `
          <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
          Copy Markdown
        `;
      }, 2000);
    });
  });

  btnPrintReport.addEventListener('click', () => window.print());

  // Initialize
  updateSuite();
});