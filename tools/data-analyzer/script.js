// Data Analyzer - Complete Client-Side Statistical Engine & Quality Scoring
document.addEventListener('DOMContentLoaded', () => {
  // Elements
  const rawInput = document.getElementById('raw-input');
  const fileDropZone = document.getElementById('file-drop-zone');
  const fileInput = document.getElementById('file-input');
  const selectDelimiter = document.getElementById('select-delimiter');
  const chkHasHeaders = document.getElementById('chk-has-headers');
  const btnParseData = document.getElementById('btn-parse-data');
  const btnClearData = document.getElementById('btn-clear-data');
  const presetButtons = document.querySelectorAll('.preset-btn');

  // Results elements
  const resultsSection = document.getElementById('results-section');
  const kpiRows = document.getElementById('kpi-rows');
  const kpiCols = document.getElementById('kpi-cols');
  const kpiNumCols = document.getElementById('kpi-num-cols');
  const kpiQualityScore = document.getElementById('kpi-quality-score');
  const kpiQualityBadge = document.getElementById('kpi-quality-badge');
  const kpiMissingCells = document.getElementById('kpi-missing-cells');
  const kpiMissingPct = document.getElementById('kpi-missing-pct');
  const kpiOutliersCount = document.getElementById('kpi-outliers-count');

  // Tabs
  const tabBtns = document.querySelectorAll('.tab-btn');
  const tabContents = document.querySelectorAll('.tab-content');

  // Matrix Table
  const matrixTable = document.getElementById('matrix-table');
  const matrixTbody = document.getElementById('matrix-tbody');
  const btnExportStatsCsv = document.getElementById('btn-export-stats-csv');
  const btnCopyStats = document.getElementById('btn-copy-stats');

  // Deep Dive Inspector
  const selectInspectCol = document.getElementById('select-inspect-col');
  const inspectColMeta = document.getElementById('inspect-col-meta');
  const inspectKpiGrid = document.getElementById('inspect-kpi-grid');
  const histogramWrapper = document.getElementById('histogram-wrapper');
  const boxplotWrapper = document.getElementById('boxplot-wrapper');
  const percentilesGrid = document.getElementById('percentiles-grid');

  // Quality Audit
  const scoreCompleteness = document.getElementById('score-completeness');
  const barCompleteness = document.getElementById('bar-completeness');
  const scoreUniqueness = document.getElementById('score-uniqueness');
  const barUniqueness = document.getElementById('bar-uniqueness');
  const scoreOutliers = document.getElementById('score-outliers');
  const barOutliers = document.getElementById('bar-outliers');
  const scoreUniformity = document.getElementById('score-uniformity');
  const barUniformity = document.getElementById('bar-uniformity');
  const qualityAdvisories = document.getElementById('quality-advisories');
  const outlierBadgeCount = document.getElementById('outlier-badge-count');
  const outliersTbody = document.getElementById('outliers-tbody');

  // Data Preview Table
  const dataTableHead = document.getElementById('data-table-head');
  const dataTableBody = document.getElementById('data-table-body');
  const tableSearch = document.getElementById('table-search');
  const chkHighlightOutliers = document.getElementById('chk-highlight-outliers');
  const chkFilterOutliersOnly = document.getElementById('chk-filter-outliers-only');
  const btnExportCsv = document.getElementById('btn-export-csv');
  const paginationInfo = document.getElementById('pagination-info');
  const btnPrevPage = document.getElementById('btn-prev-page');
  const btnNextPage = document.getElementById('btn-next-page');
  const currentPageNum = document.getElementById('current-page-num');

  // State
  let dataset = {
    headers: [],
    rows: [],
    columnStats: {},
    overallStats: {},
    outliersList: [],
    qualityBreakdown: {}
  };
  let tableState = {
    currentPage: 1,
    pageSize: 25,
    searchQuery: '',
    filterOutliersOnly: false,
    highlightOutliers: true
  };

  // Sample Presets Data
  const PRESETS = {
    ecommerce: `OrderID,Customer,Category,Units,UnitPrice,DiscountPct,Revenue,Rating,ReturnStatus
ORD-1001,Apex Retail,Electronics,4,499.00,0.05,1896.20,4.8,No
ORD-1002,Zenith Labs,Office Supplies,25,18.50,0.10,416.25,4.2,No
ORD-1003,Starlight Media,Electronics,12,320.00,0.15,3264.00,4.9,No
ORD-1004,BlueWave Corp,Furniture,2,850.00,0.00,1700.00,3.7,No
ORD-1005,Nexus Dynamics,Office Supplies,80,12.00,0.20,768.00,4.1,No
ORD-1006,Summit Corp,Electronics,1,1200.00,0.00,1200.00,5.0,No
ORD-1007,Horizon Tech,Office Supplies,15,35.00,0.05,498.75,,No
ORD-1008,Alpha Logistics,Furniture,6,450.00,0.10,2430.00,4.3,Yes
ORD-1009,Apex Retail,Electronics,8,550.00,0.05,4180.00,4.6,No
ORD-1010,Pinnacle Systems,Hardware,110,65.00,0.25,5362.50,4.5,No
ORD-1011,Global Pulse,Office Supplies,4,22.00,0.00,88.00,3.9,No
ORD-1012,Titan Ventures,Electronics,14,310.00,0.10,3906.00,4.7,No
ORD-1013,Zenith Labs,Furniture,3,920.00,0.15,2346.00,4.0,No
ORD-1014,Vanguard Co,Hardware,35,75.00,0.10,2362.50,4.4,No
ORD-1015,Apex Retail,Electronics,150,520.00,0.30,54600.00,4.9,No
ORD-1016,Quantum Byte,Electronics,7,480.00,0.05,3192.00,4.5,No
ORD-1017,Starlight Media,Office Supplies,,15.00,0.00,,3.8,No
ORD-1018,Echo Valley,Hardware,18,80.00,0.05,1368.00,4.2,No
ORD-1019,Summit Corp,Electronics,5,650.00,0.10,2925.00,4.8,No
ORD-1020,BlueWave Corp,Electronics,3,700.00,0.00,2100.00,4.1,No
ORD-1021,Horizon Tech,Furniture,8,380.00,0.10,2736.00,4.6,No
ORD-1022,Silverline Inc,Office Supplies,50,14.50,0.10,652.50,4.3,No
ORD-1023,Titan Ventures,Hardware,200,95.00,0.35,12350.00,4.9,No
ORD-1024,Apex Retail,Electronics,9,490.00,0.05,4189.50,4.7,No
ORD-1025,Zenith Labs,Office Supplies,30,19.00,0.05,541.50,4.2,No
ORD-1026,Nexus Dynamics,Furniture,1,1450.00,0.00,1450.00,3.9,Yes
ORD-1027,Vanguard Co,Electronics,6,520.00,0.10,2808.00,4.4,No
ORD-1028,Global Pulse,Hardware,12,85.00,0.00,1020.00,4.0,No
ORD-1029,Quantum Byte,Electronics,10,500.00,0.08,4600.00,4.6,No
ORD-1030,MegaCorp Global,Electronics,500,480.00,0.40,144000.00,5.0,No`,

    hr: `EmpID,Department,Role,ExperienceYears,Salary,BonusPct,PerformanceScore,OvertimeHours,AbsentDays
EMP-001,Engineering,Software Engineer,3,82000,0.08,4.2,12,3
EMP-002,Sales,Account Executive,5,75000,0.15,4.5,24,1
EMP-003,Engineering,Senior Engineer,7,125000,0.12,4.8,18,2
EMP-004,Marketing,Content Specialist,2,54000,0.05,3.9,5,4
EMP-005,HR,Talent Partner,4,68000,0.07,4.1,4,2
EMP-006,Engineering,Staff Architect,12,175000,0.20,4.9,15,1
EMP-007,Finance,Financial Analyst,3,72000,0.10,4.3,28,0
EMP-008,Operations,Logistics Lead,6,79000,0.08,4.0,32,5
EMP-009,Sales,Sales Manager,8,118000,0.22,4.7,20,3
EMP-010,Marketing,Brand Director,11,142000,0.18,4.6,10,2
EMP-011,Engineering,Frontend Engineer,1,65000,0.05,3.7,8,6
EMP-012,Finance,Controller,14,160000,0.20,4.8,16,1
EMP-013,Operations,Supply Specialist,2,49000,0.04,3.8,14,4
EMP-014,Engineering,Engineering VP,18,340000,0.45,4.9,25,0
EMP-015,Sales,SDR,1,48000,0.10,3.6,12,5
EMP-016,Engineering,DevOps Lead,8,138000,0.15,4.7,22,2
EMP-017,HR,HR Director,13,145000,0.18,4.5,8,3
EMP-018,Marketing,SEO Analyst,4,63000,0.06,,6,2
EMP-019,Operations,Warehouse Manager,9,88000,0.10,4.2,45,4
EMP-020,Engineering,QA Engineer,3,71000,0.07,4.0,10,1`,

    sensors: `DeviceID,Location,Temperature,Humidity,Pressure,Voltage,ErrorCode,SignalStrength
DEV-101,Warehouse A,22.4,45.2,1013.2,3.31,0,-65
DEV-102,Warehouse A,23.1,44.8,1012.8,3.29,0,-68
DEV-103,Warehouse B,21.8,48.1,1013.5,3.30,0,-71
DEV-104,Cold Storage,4.2,85.6,1014.1,3.32,0,-58
DEV-105,Cold Storage,3.9,86.2,1014.0,3.31,0,-59
DEV-106,Furnace Rm,88.5,18.2,1008.4,3.15,2,-82
DEV-107,Server Room,19.2,38.5,1013.8,3.30,0,-52
DEV-108,Server Room,18.9,39.1,1013.9,3.30,0,-54
DEV-109,Warehouse B,22.0,47.4,1013.4,3.28,0,-70
DEV-110,Outdoor North,16.5,62.4,1011.9,3.25,0,-78
DEV-111,Outdoor South,17.2,60.8,1012.1,3.26,0,-75
DEV-112,Cold Storage,-1.5,91.0,1015.0,3.10,1,-88
DEV-113,Warehouse A,22.8,45.0,1013.0,3.30,0,-67
DEV-114,Furnace Rm,94.2,16.5,1007.8,3.12,3,-85
DEV-115,Server Room,19.5,38.0,1013.7,3.30,0,-53
DEV-116,Production Line,26.4,52.1,1012.5,3.28,0,-62
DEV-117,Production Line,27.1,51.8,1012.3,3.27,0,-63
DEV-118,Warehouse B,,48.0,1013.3,3.29,0,-69
DEV-119,Outdoor Roof,15.8,65.2,1011.5,3.24,0,-80
DEV-120,Battery Room,24.5,42.0,1013.1,3.33,0,-60`,

    clinical: `PatientID,Age,SystolicBP,DiastolicBP,Cholesterol,Glucose,BMI,HeartRate,LengthOfStayDays
PT-2001,45,122,80,195,92,24.8,72,2
PT-2002,62,148,92,245,138,31.2,78,5
PT-2003,34,115,75,170,88,22.4,68,1
PT-2004,78,165,98,280,185,28.5,84,14
PT-2005,51,130,82,210,104,26.3,74,3
PT-2006,29,110,70,162,85,21.0,65,1
PT-2007,85,178,105,315,220,33.4,92,28
PT-2008,42,125,81,188,95,25.1,70,2
PT-2009,58,142,88,230,126,29.8,76,6
PT-2010,67,155,95,260,162,32.0,80,9
PT-2011,38,118,78,175,90,23.5,69,1
PT-2012,71,158,94,272,174,30.5,82,11
PT-2013,49,128,84,205,101,25.8,73,3
PT-2014,55,138,86,225,118,27.9,75,4
PT-2015,64,152,90,250,145,30.8,79,7
PT-2016,22,108,68,155,82,20.2,62,1
PT-2017,80,185,110,340,255,34.8,96,35
PT-2018,47,126,82,198,98,24.9,71,2
PT-2019,60,144,89,235,132,28.7,77,5
PT-2020,53,,83,215,108,26.7,74,3`
  };

  // Setup Event Listeners
  presetButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const presetKey = btn.getAttribute('data-preset');
      if (PRESETS[presetKey]) {
        rawInput.value = PRESETS[presetKey];
        selectDelimiter.value = ',';
        chkHasHeaders.checked = true;
        processInput();
      }
    });
  });

  btnClearData.addEventListener('click', () => {
    rawInput.value = '';
    resultsSection.style.display = 'none';
    dataset = { headers: [], rows: [], columnStats: {}, overallStats: {}, outliersList: [], qualityBreakdown: {} };
  });

  btnParseData.addEventListener('click', () => {
    processInput();
  });

  // Tab switching
  tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      tabBtns.forEach(b => b.classList.remove('active'));
      tabContents.forEach(c => c.classList.remove('active'));
      btn.classList.add('active');
      const targetId = btn.getAttribute('data-tab');
      const targetEl = document.getElementById(targetId);
      if (targetEl) targetEl.classList.add('active');
    });
  });

  // Drag and drop
  fileDropZone.addEventListener('click', () => fileInput.click());
  fileDropZone.addEventListener('dragover', (e) => {
    e.preventDefault();
    fileDropZone.classList.add('dragover');
  });
  fileDropZone.addEventListener('dragleave', () => fileDropZone.classList.remove('dragover'));
  fileDropZone.addEventListener('drop', (e) => {
    e.preventDefault();
    fileDropZone.classList.remove('dragover');
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileUpload(e.dataTransfer.files[0]);
    }
  });

  fileInput.addEventListener('change', () => {
    if (fileInput.files && fileInput.files.length > 0) {
      handleFileUpload(fileInput.files[0]);
    }
  });

  function handleFileUpload(file) {
    const reader = new FileReader();
    reader.onload = (e) => {
      rawInput.value = e.target.result;
      processInput();
    };
    reader.readAsText(file);
  }

  // Column deep dive change
  selectInspectCol.addEventListener('change', () => {
    renderColumnDeepDive(selectInspectCol.value);
  });

  // Search and filter table
  tableSearch.addEventListener('input', (e) => {
    tableState.searchQuery = e.target.value.toLowerCase();
    tableState.currentPage = 1;
    renderDataTable();
  });

  chkHighlightOutliers.addEventListener('change', (e) => {
    tableState.highlightOutliers = e.target.checked;
    renderDataTable();
  });

  chkFilterOutliersOnly.addEventListener('change', (e) => {
    tableState.filterOutliersOnly = e.target.checked;
    tableState.currentPage = 1;
    renderDataTable();
  });

  btnPrevPage.addEventListener('click', () => {
    if (tableState.currentPage > 1) {
      tableState.currentPage--;
      renderDataTable();
    }
  });

  btnNextPage.addEventListener('click', () => {
    const totalPages = Math.ceil(getFilteredRows().length / tableState.pageSize);
    if (tableState.currentPage < totalPages) {
      tableState.currentPage++;
      renderDataTable();
    }
  });

  btnExportStatsCsv.addEventListener('click', () => exportStatsCSV());
  btnCopyStats.addEventListener('click', () => copyStatsSummary());
  btnExportCsv.addEventListener('click', () => exportRawCSV());

  // Core Processing Routine
  function processInput() {
    const text = rawInput.value.trim();
    if (!text) {
      alert('Please enter or upload tabular data to analyze.');
      return;
    }

    try {
      const parsed = parseTabularText(text, selectDelimiter.value, chkHasHeaders.checked);
      if (!parsed || parsed.rows.length === 0) {
        alert('Could not parse any valid data rows. Check format.');
        return;
      }

      dataset.headers = parsed.headers;
      dataset.rows = parsed.rows;

      // Analyze dataset
      computeStatistics();
      computeQualityScore();

      // Render all views
      renderKpiCards();
      renderMatrixTable();
      populateInspectDropdown();
      renderQualityAudit();
      renderDataTable();

      resultsSection.style.display = 'flex';
      resultsSection.scrollIntoView({ behavior: 'smooth' });
    } catch (err) {
      console.error(err);
      alert('Error analyzing dataset: ' + err.message);
    }
  }

  // CSV/TSV/JSON Parser
  function parseTabularText(raw, delimiterMode, hasHeaders) {
    const trimmed = raw.trim();
    
    // Check if JSON array of objects
    if ((trimmed.startsWith('[') && trimmed.endsWith(']')) || (trimmed.startsWith('{') && trimmed.endsWith('}'))) {
      try {
        const jsonData = JSON.parse(trimmed);
        const arr = Array.isArray(jsonData) ? jsonData : [jsonData];
        if (arr.length > 0 && typeof arr[0] === 'object' && arr[0] !== null) {
          const keys = Array.from(new Set(arr.flatMap(o => Object.keys(o))));
          const rows = arr.map(obj => keys.map(k => obj[k] !== undefined && obj[k] !== null ? String(obj[k]) : ''));
          return { headers: keys, rows };
        }
      } catch (e) {
        // Fallback to text parsing
      }
    }

    // Determine Delimiter
    let delimiter = delimiterMode;
    if (delimiter === 'auto') {
      const sampleLines = trimmed.split(/\r?\n/).slice(0, 5).join('\n');
      const commaCount = (sampleLines.match(/,/g) || []).length;
      const tabCount = (sampleLines.match(/\t/g) || []).length;
      const semiCount = (sampleLines.match(/;/g) || []).length;
      const pipeCount = (sampleLines.match(/\|/g) || []).length;

      if (tabCount >= commaCount && tabCount >= semiCount && tabCount >= pipeCount && tabCount > 0) delimiter = '\t';
      else if (semiCount > commaCount && semiCount > pipeCount && semiCount > 0) delimiter = ';';
      else if (pipeCount > commaCount && pipeCount > semiCount && pipeCount > 0) delimiter = '|';
      else delimiter = ',';
    }

    // Parse lines with RFC 4180 quote support
    const lines = parseCSVRows(trimmed, delimiter);
    if (lines.length === 0) return null;

    let headers = [];
    let rows = [];

    if (hasHeaders) {
      headers = lines[0].map((h, i) => h.trim() || `Col_${i + 1}`);
      rows = lines.slice(1);
    } else {
      const colCount = Math.max(...lines.map(l => l.length));
      headers = Array.from({ length: colCount }, (_, i) => `Col_${i + 1}`);
      rows = lines;
    }

    // Normalize row lengths
    rows = rows.filter(r => r.some(c => c.trim() !== '')).map(row => {
      while (row.length < headers.length) row.push('');
      return row.slice(0, headers.length);
    });

    return { headers, rows };
  }

  function parseCSVRows(text, delimiter) {
    const rows = [];
    let currentRow = [];
    let currentCell = '';
    let insideQuotes = false;

    for (let i = 0; i < text.length; i++) {
      const char = text[i];
      const nextChar = text[i + 1];

      if (char === '"') {
        if (insideQuotes && nextChar === '"') {
          currentCell += '"';
          i++; // skip escaped quote
        } else {
          insideQuotes = !insideQuotes;
        }
      } else if (char === delimiter && !insideQuotes) {
        currentRow.push(currentCell.trim());
        currentCell = '';
      } else if ((char === '\r' || char === '\n') && !insideQuotes) {
        if (char === '\r' && nextChar === '\n') i++; // Handle CRLF
        currentRow.push(currentCell.trim());
        currentCell = '';
        if (currentRow.length > 0) {
          rows.push(currentRow);
          currentRow = [];
        }
      } else {
        currentCell += char;
      }
    }

    if (currentCell || currentRow.length > 0) {
      currentRow.push(currentCell.trim());
      rows.push(currentRow);
    }

    return rows;
  }

  // Statistical Computations
  function computeStatistics() {
    dataset.columnStats = {};
    dataset.outliersList = [];
    const numRows = dataset.rows.length;
    let totalCells = 0;
    let totalMissingCells = 0;
    let numericColsCount = 0;

    dataset.headers.forEach((header, colIdx) => {
      const rawValues = dataset.rows.map(r => r[colIdx]);
      let validNums = [];
      let missingCount = 0;
      let nonNumericStrings = 0;
      const freqMap = {};

      rawValues.forEach((val, rowIdx) => {
        totalCells++;
        if (val === undefined || val === null || val.trim() === '') {
          missingCount++;
          totalMissingCells++;
          return;
        }
        
        freqMap[val] = (freqMap[val] || 0) + 1;

        // Try numeric parsing (handle currency, commas, percentages)
        let cleaned = val.replace(/^[$\u20AC\u00A3\u00A5]/, '').replace(/%$/, '').replace(/,/g, '').trim();
        const num = parseFloat(cleaned);
        if (!isNaN(num) && isFinite(num) && cleaned !== '') {
          validNums.push({ val: num, rowIdx, raw: val });
        } else {
          nonNumericStrings++;
        }
      });

      const isNumeric = validNums.length > 0 && (validNums.length / (rawValues.length - missingCount || 1)) >= 0.65;
      if (isNumeric) numericColsCount++;

      // Compute Descriptive Stats if numeric
      let stats = {
        name: header,
        index: colIdx,
        isNumeric,
        totalCount: numRows,
        missingCount,
        missingPct: ((missingCount / numRows) * 100).toFixed(1),
        uniqueCount: Object.keys(freqMap).length,
        frequencyMap: freqMap
      };

      if (isNumeric && validNums.length > 0) {
        const sortedNums = validNums.map(n => n.val).sort((a, b) => a - b);
        const count = sortedNums.length;
        const sum = sortedNums.reduce((acc, v) => acc + v, 0);
        const mean = sum / count;

        // Median
        let median;
        const mid = Math.floor(count / 2);
        if (count % 2 === 0) {
          median = (sortedNums[mid - 1] + sortedNums[mid]) / 2;
        } else {
          median = sortedNums[mid];
        }

        // Mode
        let maxFreq = 0;
        let modes = [];
        for (const [k, v] of Object.entries(freqMap)) {
          if (v > maxFreq) {
            maxFreq = v;
            modes = [k];
          } else if (v === maxFreq && maxFreq > 1) {
            modes.push(k);
          }
        }
        const modeStr = (maxFreq > 1 && modes.length <= 3) ? modes.join(', ') : (maxFreq > 1 ? `${modes[0]} (+${modes.length - 1} more)` : 'None (All Unique)');

        // Variance & Standard Deviation
        let sampleVariance = 0;
        let popVariance = 0;
        if (count > 1) {
          const sumSqDiff = sortedNums.reduce((acc, v) => acc + Math.pow(v - mean, 2), 0);
          sampleVariance = sumSqDiff / (count - 1);
          popVariance = sumSqDiff / count;
        }
        const sampleStdDev = Math.sqrt(sampleVariance);
        const popStdDev = Math.sqrt(popVariance);

        // Min, Max, Range
        const min = sortedNums[0];
        const max = sortedNums[count - 1];
        const range = max - min;

        // Percentiles (Q1, Q3, IQR)
        const q1 = getPercentile(sortedNums, 0.25);
        const q3 = getPercentile(sortedNums, 0.75);
        const iqr = q3 - q1;

        // Outlier thresholds
        const lowerBound = q1 - 1.5 * iqr;
        const upperBound = q3 + 1.5 * iqr;
        const extremeLower = q1 - 3.0 * iqr;
        const extremeUpper = q3 + 3.0 * iqr;

        // Flag Outliers
        let columnOutliers = [];
        validNums.forEach(item => {
          if (item.val < lowerBound || item.val > upperBound) {
            const isExtreme = item.val < extremeLower || item.val > extremeUpper;
            const outlierRecord = {
              rowIdx: item.rowIdx,
              rowNumber: item.rowIdx + 1,
              colName: header,
              colIdx,
              value: item.val,
              rawValue: item.raw,
              lowerBound,
              upperBound,
              severity: isExtreme ? 'Extreme' : 'Mild',
              zScore: sampleStdDev > 0 ? ((item.val - mean) / sampleStdDev).toFixed(2) : 0
            };
            columnOutliers.push(outlierRecord);
            dataset.outliersList.push(outlierRecord);
          }
        });

        // Skewness (Fisher-Pearson)
        let skewness = 0;
        if (count > 2 && sampleStdDev > 0) {
          const sumCubed = sortedNums.reduce((acc, v) => acc + Math.pow((v - mean) / sampleStdDev, 3), 0);
          skewness = (count / ((count - 1) * (count - 2))) * sumCubed;
        }

        stats = {
          ...stats,
          validCount: count,
          sum,
          mean,
          median,
          mode: modeStr,
          sampleVariance,
          popVariance,
          sampleStdDev,
          popStdDev,
          min,
          max,
          range,
          q1,
          q3,
          iqr,
          lowerBound,
          upperBound,
          extremeLower,
          extremeUpper,
          skewness,
          sortedValues: sortedNums,
          outliers: columnOutliers,
          outlierCount: columnOutliers.length
        };
      }

      dataset.columnStats[header] = stats;
    });

    dataset.overallStats = {
      totalRows: numRows,
      totalCols: dataset.headers.length,
      numericColsCount,
      totalCells,
      totalMissingCells,
      missingPct: totalCells > 0 ? ((totalMissingCells / totalCells) * 100).toFixed(1) : 0,
      totalOutliers: dataset.outliersList.length
    };
  }

  function getPercentile(sortedArr, p) {
    if (sortedArr.length === 0) return 0;
    if (sortedArr.length === 1) return sortedArr[0];
    const index = (sortedArr.length - 1) * p;
    const lower = Math.floor(index);
    const upper = Math.ceil(index);
    const weight = index - lower;
    return sortedArr[lower] * (1 - weight) + sortedArr[upper] * weight;
  }

  // Composite Data Quality Score
  function computeQualityScore() {
    const { totalRows, totalCells, totalMissingCells, totalOutliers, numericColsCount } = dataset.overallStats;
    if (totalCells === 0) return;

    // 1. Completeness Score (0-100)
    const completeness = Math.max(0, 100 - (totalMissingCells / totalCells) * 100);

    // 2. Uniqueness Score (duplicate row check)
    const rowSignatures = new Set();
    let duplicateRows = 0;
    dataset.rows.forEach(r => {
      const sig = r.join('|||');
      if (rowSignatures.has(sig)) duplicateRows++;
      else rowSignatures.add(sig);
    });
    const uniqueness = Math.max(0, 100 - (duplicateRows / totalRows) * 100);

    // 3. Outlier Health Score
    let totalNumericEntries = 0;
    Object.values(dataset.columnStats).forEach(s => {
      if (s.isNumeric) totalNumericEntries += s.validCount || 0;
    });
    const outlierRate = totalNumericEntries > 0 ? (totalOutliers / totalNumericEntries) : 0;
    const outlierScore = Math.max(0, 100 - (outlierRate * 200)); // 5% outliers -> 90 score, 10% -> 80

    // 4. Type Uniformity Score
    let uniformCells = 0;
    let evalCells = 0;
    Object.values(dataset.columnStats).forEach(s => {
      dataset.rows.forEach(r => {
        const val = r[s.index];
        if (val && val.trim() !== '') {
          evalCells++;
          if (s.isNumeric) {
            const cleaned = val.replace(/^[$\u20AC\u00A3\u00A5]/, '').replace(/%$/, '').replace(/,/g, '').trim();
            if (!isNaN(parseFloat(cleaned))) uniformCells++;
          } else {
            uniformCells++;
          }
        }
      });
    });
    const uniformity = evalCells > 0 ? (uniformCells / evalCells) * 100 : 100;

    // Composite Weighted Score: Completeness 35%, Uniformity 25%, Uniqueness 20%, Outlier Health 20%
    const compositeScore = Math.round(
      completeness * 0.35 +
      uniformity * 0.25 +
      uniqueness * 0.20 +
      outlierScore * 0.20
    );

    dataset.qualityBreakdown = {
      compositeScore,
      completeness: Math.round(completeness),
      uniqueness: Math.round(uniqueness),
      outlierScore: Math.round(outlierScore),
      uniformity: Math.round(uniformity),
      duplicateRows
    };
  }

  // Render KPI Cards
  function renderKpiCards() {
    const o = dataset.overallStats;
    const q = dataset.qualityBreakdown;

    kpiRows.textContent = o.totalRows.toLocaleString();
    kpiCols.textContent = o.totalCols;
    kpiNumCols.textContent = o.numericColsCount;
    kpiQualityScore.textContent = `${q.compositeScore}%`;
    kpiMissingCells.textContent = o.totalMissingCells.toLocaleString();
    kpiMissingPct.textContent = `${o.missingPct}%`;
    kpiOutliersCount.textContent = o.totalOutliers.toLocaleString();

    // Badge styling
    kpiQualityBadge.className = 'quality-badge';
    if (q.compositeScore >= 90) {
      kpiQualityBadge.classList.add('quality-excellent');
      kpiQualityBadge.textContent = 'Excellent Quality';
    } else if (q.compositeScore >= 75) {
      kpiQualityBadge.classList.add('quality-good');
      kpiQualityBadge.textContent = 'Good Quality';
    } else if (q.compositeScore >= 55) {
      kpiQualityBadge.classList.add('quality-fair');
      kpiQualityBadge.textContent = 'Fair / Needs Cleaning';
    } else {
      kpiQualityBadge.classList.add('quality-poor');
      kpiQualityBadge.textContent = 'Poor Quality';
    }
  }

  // Render Descriptive Statistics Matrix
  function renderMatrixTable() {
    const numericCols = dataset.headers.filter(h => dataset.columnStats[h]?.isNumeric);
    
    if (numericCols.length === 0) {
      matrixTable.innerHTML = `<tr><td style="padding: 2rem; text-align: center; color: var(--text-tertiary);">No numeric columns detected in this dataset.</td></tr>`;
      return;
    }

    const metrics = [
      { id: 'validCount', label: 'Valid Count (N)', format: v => v.toLocaleString() },
      { id: 'missingCount', label: 'Missing Cells', format: (v, s) => `${v} (${s.missingPct}%)` },
      { id: 'uniqueCount', label: 'Distinct Values', format: v => v.toLocaleString() },
      { id: 'mean', label: 'Mean (\u03BC / x\u0304)', format: formatNum },
      { id: 'median', label: 'Median (50th %)', format: formatNum },
      { id: 'mode', label: 'Mode (Most Frequent)', format: v => v },
      { id: 'sampleStdDev', label: 'Sample Std Dev (s)', format: formatNum },
      { id: 'sampleVariance', label: 'Variance (s\u00B2)', format: formatNum },
      { id: 'min', label: 'Minimum', format: formatNum },
      { id: 'max', label: 'Maximum', format: formatNum },
      { id: 'range', label: 'Range (Max - Min)', format: formatNum },
      { id: 'q1', label: '25th Percentile (Q1)', format: formatNum },
      { id: 'q3', label: '75th Percentile (Q3)', format: formatNum },
      { id: 'iqr', label: 'IQR (Q3 - Q1)', format: formatNum },
      { id: 'skewness', label: 'Skewness', format: formatNum },
      { id: 'outlierCount', label: 'Flagged Outliers (IQR)', format: (v) => v > 0 ? `<span class="outlier-tag">${v} Outliers</span>` : '0' }
    ];

    let headerHtml = `<tr><th>Metric</th>` + numericCols.map(c => `<th>${escapeHtml(c)}</th>`).join('') + `</tr>`;
    let rowsHtml = metrics.map(m => {
      let cells = `<td><strong>${m.label}</strong></td>`;
      cells += numericCols.map(col => {
        const stats = dataset.columnStats[col];
        const val = stats[m.id];
        return `<td>${val !== undefined ? m.format(val, stats) : '-'}</td>`;
      }).join('');
      return `<tr>${cells}</tr>`;
    }).join('');

    matrixTable.querySelector('thead').innerHTML = headerHtml;
    matrixTbody.innerHTML = rowsHtml;
  }

  // Populate Dropdown for Tab 2
  function populateInspectDropdown() {
    selectInspectCol.innerHTML = '';
    const numericCols = dataset.headers.filter(h => dataset.columnStats[h]?.isNumeric);
    const colsToPopulate = numericCols.length > 0 ? numericCols : dataset.headers;

    colsToPopulate.forEach(col => {
      const opt = document.createElement('option');
      opt.value = col;
      opt.textContent = col + (dataset.columnStats[col]?.isNumeric ? ' (Numeric)' : ' (Text)');
      selectInspectCol.appendChild(opt);
    });

    if (colsToPopulate.length > 0) {
      renderColumnDeepDive(colsToPopulate[0]);
    }
  }

  // Render Column Deep Dive & Charts
  function renderColumnDeepDive(colName) {
    const stats = dataset.columnStats[colName];
    if (!stats) return;

    inspectColMeta.textContent = `Type: ${stats.isNumeric ? 'Continuous Numeric' : 'Categorical / Text'} | Total: ${stats.totalCount} | Missing: ${stats.missingCount} (${stats.missingPct}%)`;

    // Render KPI Grid
    if (stats.isNumeric) {
      inspectKpiGrid.innerHTML = `
        <div class="kpi-card"><span class="kpi-value">${formatNum(stats.mean)}</span><span class="kpi-label">Mean</span></div>
        <div class="kpi-card"><span class="kpi-value">${formatNum(stats.median)}</span><span class="kpi-label">Median</span></div>
        <div class="kpi-card"><span class="kpi-value">${formatNum(stats.sampleStdDev)}</span><span class="kpi-label">Std Dev</span></div>
        <div class="kpi-card"><span class="kpi-value">${formatNum(stats.iqr)}</span><span class="kpi-label">IQR</span></div>
        <div class="kpi-card"><span class="kpi-value">${formatNum(stats.min)}</span><span class="kpi-label">Min</span></div>
        <div class="kpi-card"><span class="kpi-value">${formatNum(stats.max)}</span><span class="kpi-label">Max</span></div>
      `;

      renderHistogram(stats);
      renderBoxPlot(stats);

      percentilesGrid.innerHTML = `
        <div><div style="font-weight:700; color:var(--text-primary);">${formatNum(stats.q1)}</div><div style="color:var(--text-tertiary);">Q1 (25%)</div></div>
        <div><div style="font-weight:700; color:var(--text-primary);">${formatNum(stats.median)}</div><div style="color:var(--text-tertiary);">Median (50%)</div></div>
        <div><div style="font-weight:700; color:var(--text-primary);">${formatNum(stats.q3)}</div><div style="color:var(--text-tertiary);">Q3 (75%)</div></div>
        <div><div style="font-weight:700; color:#ef4444;">&lt; ${formatNum(stats.lowerBound)}</div><div style="color:var(--text-tertiary);">Lower IQR Bound</div></div>
        <div><div style="font-weight:700; color:var(--accent);">${formatNum(stats.iqr)}</div><div style="color:var(--text-tertiary);">IQR Span</div></div>
        <div><div style="font-weight:700; color:#ef4444;">&gt; ${formatNum(stats.upperBound)}</div><div style="color:var(--text-tertiary);">Upper IQR Bound</div></div>
      `;
    } else {
      inspectKpiGrid.innerHTML = `
        <div class="kpi-card"><span class="kpi-value">${stats.uniqueCount}</span><span class="kpi-label">Distinct Values</span></div>
        <div class="kpi-card"><span class="kpi-value">${stats.missingCount}</span><span class="kpi-label">Missing Rows</span></div>
        <div class="kpi-card"><span class="kpi-value" style="font-size:1.1rem;">${escapeHtml(stats.mode || 'N/A')}</span><span class="kpi-label">Top Value</span></div>
      `;
      histogramWrapper.innerHTML = renderCategoryBarChart(stats.frequencyMap);
      boxplotWrapper.innerHTML = `<div style="padding:1rem; text-align:center; color:var(--text-tertiary);">Box plot not applicable to text column.</div>`;
      percentilesGrid.innerHTML = '';
    }
  }

  // SVG Histogram Generator
  function renderHistogram(stats) {
    const values = stats.sortedValues;
    if (!values || values.length === 0) {
      histogramWrapper.innerHTML = 'No data';
      return;
    }

    const binCount = Math.min(12, Math.max(5, Math.ceil(Math.sqrt(values.length))));
    const min = stats.min;
    const max = stats.max;
    const binWidth = (max - min) / binCount || 1;

    const bins = Array.from({ length: binCount }, () => 0);
    values.forEach(v => {
      let idx = Math.floor((v - min) / binWidth);
      if (idx >= binCount) idx = binCount - 1;
      bins[idx]++;
    });

    const maxFreq = Math.max(...bins, 1);
    const width = 500;
    const height = 180;
    const padding = { top: 15, right: 20, bottom: 30, left: 35 };
    const chartW = width - padding.left - padding.right;
    const chartH = height - padding.top - padding.bottom;

    const barW = chartW / binCount;

    let barsSvg = '';
    bins.forEach((count, i) => {
      const barH = (count / maxFreq) * chartH;
      const x = padding.left + i * barW;
      const y = padding.top + (chartH - barH);
      const binStart = min + i * binWidth;
      const binEnd = binStart + binWidth;
      barsSvg += `
        <rect class="bar-rect" x="${x + 2}" y="${y}" width="${Math.max(1, barW - 4)}" height="${barH}" rx="3">
          <title>${formatNum(binStart)} to ${formatNum(binEnd)}: ${count} items</title>
        </rect>
      `;
    });

    // Reference lines for Mean and Median
    const getXPos = (val) => {
      if (max === min) return padding.left + chartW / 2;
      return padding.left + ((val - min) / (max - min)) * chartW;
    };

    const meanX = getXPos(stats.mean);
    const medianX = getXPos(stats.median);

    const svg = `
      <svg class="chart-svg" viewBox="0 0 ${width} ${height}" preserveAspectRatio="none">
        <line x1="${padding.left}" y1="${padding.top + chartH}" x2="${width - padding.right}" y2="${padding.top + chartH}" class="axis-line" />
        <line x1="${padding.left}" y1="${padding.top}" x2="${padding.left}" y2="${padding.top + chartH}" class="axis-line" />
        ${barsSvg}
        <line x1="${meanX}" y1="${padding.top}" x2="${meanX}" y2="${padding.top + chartH}" class="chart-mean-line">
          <title>Mean: ${formatNum(stats.mean)}</title>
        </line>
        <line x1="${medianX}" y1="${padding.top}" x2="${medianX}" y2="${padding.top + chartH}" class="chart-median-line">
          <title>Median: ${formatNum(stats.median)}</title>
        </line>
        <text x="${padding.left}" y="${height - 10}" class="axis-text">${formatNum(min)}</text>
        <text x="${width - padding.right}" y="${height - 10}" class="axis-text" text-anchor="end">${formatNum(max)}</text>
      </svg>
    `;
    histogramWrapper.innerHTML = svg;
  }

  // SVG Box Plot Generator
  function renderBoxPlot(stats) {
    const width = 500;
    const height = 90;
    const padding = { left: 40, right: 40, y: 40 };
    const chartW = width - padding.left - padding.right;

    const min = stats.min;
    const max = stats.max;
    if (max === min) {
      boxplotWrapper.innerHTML = `<div style="text-align:center; padding:1rem; color:var(--text-tertiary);">Constant value (${min})</div>`;
      return;
    }

    const scaleX = (val) => padding.left + ((val - min) / (max - min)) * chartW;

    // Whisker ends (limited to min/max within 1.5 IQR)
    const whiskerLow = Math.max(min, stats.lowerBound);
    const whiskerHigh = Math.min(max, stats.upperBound);

    const xWhiskerLow = scaleX(whiskerLow);
    const xWhiskerHigh = scaleX(whiskerHigh);
    const xQ1 = scaleX(stats.q1);
    const xQ3 = scaleX(stats.q3);
    const xMed = scaleX(stats.median);

    // Outlier points
    let outliersSvg = '';
    if (stats.outliers) {
      stats.outliers.forEach(o => {
        const ox = scaleX(o.value);
        outliersSvg += `
          <circle cx="${ox}" cy="${padding.y}" r="4.5" fill="#ef4444" stroke="#ffffff" stroke-width="1.5">
            <title>Outlier Value: ${formatNum(o.value)} (Row #${o.rowNumber})</title>
          </circle>
        `;
      });
    }

    const svg = `
      <svg class="box-plot-svg" viewBox="0 0 ${width} ${height}">
        <!-- Whiskers -->
        <line x1="${xWhiskerLow}" y1="${padding.y}" x2="${xQ1}" y2="${padding.y}" stroke="var(--accent)" stroke-width="2" />
        <line x1="${xQ3}" y1="${padding.y}" x2="${xWhiskerHigh}" y2="${padding.y}" stroke="var(--accent)" stroke-width="2" />
        <line x1="${xWhiskerLow}" y1="${padding.y - 12}" x2="${xWhiskerLow}" y2="${padding.y + 12}" stroke="var(--accent)" stroke-width="2" />
        <line x1="${xWhiskerHigh}" y1="${padding.y - 12}" x2="${xWhiskerHigh}" y2="${padding.y + 12}" stroke="var(--accent)" stroke-width="2" />

        <!-- Box (IQR) -->
        <rect x="${xQ1}" y="${padding.y - 18}" width="${Math.max(2, xQ3 - xQ1)}" height="36" fill="var(--bg-tertiary)" stroke="var(--accent)" stroke-width="2" rx="4" />

        <!-- Median Line -->
        <line x1="${xMed}" y1="${padding.y - 18}" x2="${xMed}" y2="${padding.y + 18}" stroke="#10b981" stroke-width="3">
          <title>Median: ${formatNum(stats.median)}</title>
        </line>

        <!-- Outlier dots -->
        ${outliersSvg}

        <!-- Labels -->
        <text x="${padding.left}" y="${height - 12}" class="axis-text" text-anchor="middle">${formatNum(min)}</text>
        <text x="${width - padding.right}" y="${height - 12}" class="axis-text" text-anchor="middle">${formatNum(max)}</text>
      </svg>
    `;
    boxplotWrapper.innerHTML = svg;
  }

  function renderCategoryBarChart(freqMap) {
    const entries = Object.entries(freqMap).sort((a, b) => b[1] - a[1]).slice(0, 8);
    const maxVal = Math.max(...entries.map(e => e[1]), 1);

    return `
      <div style="display: flex; flex-direction: column; gap: 0.6rem; padding: 0.5rem 0;">
        ${entries.map(([label, count]) => `
          <div>
            <div style="display: flex; justify-content: space-between; font-size: 0.8rem; margin-bottom: 0.2rem;">
              <span style="color: var(--text-primary);">${escapeHtml(label || '(Empty)')}</span>
              <span style="color: var(--accent); font-weight: 600;">${count}</span>
            </div>
            <div style="height: 6px; background: var(--bg-tertiary); border-radius: 999px; overflow: hidden;">
              <div style="width: ${(count / maxVal) * 100}%; height: 100%; background: var(--accent);"></div>
            </div>
          </div>
        `).join('')}
      </div>
    `;
  }

  // Quality Audit & Outlier Breakdown
  function renderQualityAudit() {
    const q = dataset.qualityBreakdown;
    scoreCompleteness.textContent = `${q.completeness}%`;
    barCompleteness.style.width = `${q.completeness}%`;
    barCompleteness.style.background = getScoreColor(q.completeness);

    scoreUniqueness.textContent = `${q.uniqueness}%`;
    barUniqueness.style.width = `${q.uniqueness}%`;
    barUniqueness.style.background = getScoreColor(q.uniqueness);

    scoreOutliers.textContent = `${q.outlierScore}%`;
    barOutliers.style.width = `${q.outlierScore}%`;
    barOutliers.style.background = getScoreColor(q.outlierScore);

    scoreUniformity.textContent = `${q.uniformity}%`;
    barUniformity.style.width = `${q.uniformity}%`;
    barUniformity.style.background = getScoreColor(q.uniformity);

    // Advisories
    const advisories = [];
    if (q.completeness < 95) {
      advisories.push(`⚠️ <strong>Missing Data:</strong> ${dataset.overallStats.totalMissingCells} empty cells detected (${dataset.overallStats.missingPct}% of dataset). Consider data imputation.`);
    } else {
      advisories.push(`✅ <strong>Completeness:</strong> Dataset has excellent fill integrity with minimal empty values.`);
    }

    if (q.duplicateRows > 0) {
      advisories.push(`⚠️ <strong>Duplicate Rows:</strong> Found ${q.duplicateRows} exact duplicate row(s). Review data cleaning.`);
    } else {
      advisories.push(`✅ <strong>Uniqueness:</strong> All records appear unique.`);
    }

    if (dataset.outliersList.length > 0) {
      advisories.push(`🔍 <strong>Outlier Alert:</strong> Flagged ${dataset.outliersList.length} values exceeding the 1.5 &times; IQR threshold across numeric fields.`);
    } else {
      advisories.push(`✅ <strong>Outlier Health:</strong> No significant anomalous values detected.`);
    }

    qualityAdvisories.innerHTML = advisories.map(a => `
      <div style="background: var(--bg-secondary); border: 1px solid var(--border); padding: 0.65rem 0.85rem; border-radius: var(--radius-sm); font-size: 0.825rem; color: var(--text-secondary);">
        ${a}
      </div>
    `).join('');

    // Outlier Table
    outlierBadgeCount.textContent = `${dataset.outliersList.length} Detected`;
    if (dataset.outliersList.length === 0) {
      outliersTbody.innerHTML = `<tr><td colspan="5" style="text-align: center; color: var(--text-tertiary); padding: 1.5rem;">No IQR outliers flagged in this dataset!</td></tr>`;
    } else {
      outliersTbody.innerHTML = dataset.outliersList.slice(0, 50).map(o => `
        <tr>
          <td><strong>#${o.rowNumber}</strong></td>
          <td style="color: var(--accent);">${escapeHtml(o.colName)}</td>
          <td><span class="outlier-tag">${formatNum(o.value)}</span></td>
          <td style="font-size: 0.78rem; color: var(--text-tertiary);">[${formatNum(o.lowerBound)}, ${formatNum(o.upperBound)}]</td>
          <td><span class="badge" style="background: ${o.severity === 'Extreme' ? 'rgba(239, 68, 68, 0.2)' : 'rgba(245, 158, 11, 0.2)'}; color: ${o.severity === 'Extreme' ? '#ef4444' : '#f59e0b'};">${o.severity}</span></td>
        </tr>
      `).join('');
    }
  }

  function getScoreColor(val) {
    if (val >= 90) return '#10b981';
    if (val >= 75) return '#3b82f6';
    if (val >= 50) return '#f59e0b';
    return '#ef4444';
  }

  // Interactive Data Table & Filtering
  function getFilteredRows() {
    let rows = dataset.rows.map((row, idx) => ({ row, idx, rowNumber: idx + 1 }));

    // Outlier rows only filter
    if (tableState.filterOutliersOnly) {
      const outlierRowIndices = new Set(dataset.outliersList.map(o => o.rowIdx));
      rows = rows.filter(r => outlierRowIndices.has(r.idx));
    }

    // Search query
    if (tableState.searchQuery) {
      rows = rows.filter(r => r.row.some(cell => String(cell).toLowerCase().includes(tableState.searchQuery)));
    }

    return rows;
  }

  function renderDataTable() {
    const filtered = getFilteredRows();
    const totalCount = filtered.length;
    const totalPages = Math.max(1, Math.ceil(totalCount / tableState.pageSize));

    if (tableState.currentPage > totalPages) tableState.currentPage = totalPages;

    const startIdx = (tableState.currentPage - 1) * tableState.pageSize;
    const endIdx = Math.min(startIdx + tableState.pageSize, totalCount);
    const pageRows = filtered.slice(startIdx, endIdx);

    // Header
    dataTableHead.innerHTML = `<tr><th>#</th>` + dataset.headers.map(h => `<th>${escapeHtml(h)}</th>`).join('') + `</tr>`;

    // Map outliers for quick cell lookup
    const outlierCellMap = new Set(dataset.outliersList.map(o => `${o.rowIdx}-${o.colIdx}`));

    // Body
    if (pageRows.length === 0) {
      dataTableBody.innerHTML = `<tr><td colspan="${dataset.headers.length + 1}" style="text-align: center; padding: 2rem; color: var(--text-tertiary);">No matching records found.</td></tr>`;
    } else {
      dataTableBody.innerHTML = pageRows.map(r => {
        let cells = `<td style="font-weight:600; color:var(--text-tertiary);">${r.rowNumber}</td>`;
        cells += r.row.map((cell, cIdx) => {
          const isMissing = cell === undefined || cell === null || cell.trim() === '';
          const isOutlier = tableState.highlightOutliers && outlierCellMap.has(`${r.idx}-${cIdx}`);

          if (isMissing) {
            return `<td class="cell-null">&lt;null&gt;</td>`;
          } else if (isOutlier) {
            return `<td class="cell-outlier">${escapeHtml(cell)}</td>`;
          } else {
            return `<td>${escapeHtml(cell)}</td>`;
          }
        }).join('');
        return `<tr>${cells}</tr>`;
      }).join('');
    }

    // Pagination info
    paginationInfo.textContent = totalCount > 0 ? `Showing ${startIdx + 1} to ${endIdx} of ${totalCount.toLocaleString()} rows` : '0 rows';
    currentPageNum.textContent = `${tableState.currentPage} / ${totalPages}`;
    btnPrevPage.disabled = tableState.currentPage <= 1;
    btnNextPage.disabled = tableState.currentPage >= totalPages;
  }

  // Exports
  function exportStatsCSV() {
    const numericCols = dataset.headers.filter(h => dataset.columnStats[h]?.isNumeric);
    if (numericCols.length === 0) return;

    const metrics = [
      'validCount', 'missingCount', 'uniqueCount', 'mean', 'median',
      'mode', 'sampleStdDev', 'sampleVariance', 'min', 'max',
      'range', 'q1', 'q3', 'iqr', 'skewness', 'outlierCount'
    ];

    let csv = `Metric,` + numericCols.map(c => `"${c.replace(/"/g, '""')}"`).join(',') + `\n`;
    metrics.forEach(m => {
      let row = [m];
      numericCols.forEach(col => {
        const val = dataset.columnStats[col][m];
        row.push(val !== undefined ? `"${String(val).replace(/"/g, '""')}"` : '');
      });
      csv += row.join(',') + `\n`;
    });

    downloadBlob(csv, 'data_analyzer_descriptive_statistics.csv', 'text/csv;charset=utf-8;');
  }

  function exportRawCSV() {
    let csv = dataset.headers.map(h => `"${h.replace(/"/g, '""')}"`).join(',') + '\n';
    dataset.rows.forEach(r => {
      csv += r.map(c => `"${String(c).replace(/"/g, '""')}"`).join(',') + '\n';
    });
    downloadBlob(csv, 'dataset_export.csv', 'text/csv;charset=utf-8;');
  }

  function copyStatsSummary() {
    const { totalRows, totalCols, numericColsCount } = dataset.overallStats;
    const { compositeScore } = dataset.qualityBreakdown;
    let txt = `DATA ANALYZER STATISTICAL SUMMARY\n`;
    txt += `Total Rows: ${totalRows} | Columns: ${totalCols} (${numericColsCount} Numeric)\n`;
    txt += `Composite Data Quality Score: ${compositeScore}%\n`;
    txt += `Flagged Outliers: ${dataset.outliersList.length}\n\n`;

    const numericCols = dataset.headers.filter(h => dataset.columnStats[h]?.isNumeric);
    numericCols.forEach(col => {
      const s = dataset.columnStats[col];
      txt += `--- ${col} ---\n`;
      txt += `  Mean: ${formatNum(s.mean)}, Median: ${formatNum(s.median)}, StdDev: ${formatNum(s.sampleStdDev)}\n`;
      txt += `  Min: ${formatNum(s.min)}, Max: ${formatNum(s.max)}, Range: ${formatNum(s.range)}\n`;
      txt += `  Q1: ${formatNum(s.q1)}, Q3: ${formatNum(s.q3)}, IQR: ${formatNum(s.iqr)}\n`;
      txt += `  Outliers: ${s.outlierCount}\n\n`;
    });

    navigator.clipboard.writeText(txt).then(() => {
      const originalText = btnCopyStats.textContent;
      btnCopyStats.textContent = 'Copied!';
      btnCopyStats.classList.add('copied');
      setTimeout(() => {
        btnCopyStats.textContent = originalText;
        btnCopyStats.classList.remove('copied');
      }, 2000);
    });
  }

  function downloadBlob(content, filename, contentType) {
    const blob = new Blob([content], { type: contentType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  function formatNum(val) {
    if (val === undefined || val === null || isNaN(val)) return '-';
    if (Math.abs(val) >= 1000 || (Math.abs(val) < 0.01 && val !== 0)) {
      return Number(val.toFixed(2)).toLocaleString();
    }
    return Number(val.toFixed(3)).toString();
  }

  function escapeHtml(str) {
    if (str === null || str === undefined) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }
});