// CSV Analyzer - Complete Client-Side Analytics Engine
// Auto-delimiter detection, Column Profiling, Data Table, Anomaly Detection & Export

(() => {
  'use strict';

  // --- State ---
  let rawCSVData = '';
  let parsedHeaders = [];
  let parsedRows = []; // Array of Arrays
  let detectedDelimiter = ',';
  let activeSort = { colIndex: -1, order: 'none' }; // 'asc', 'desc', 'none'
  let searchQuery = '';
  let currentPage = 1;
  let pageSize = 25;
  let highlightedRowIndex = -1;

  // Analysis Results
  let columnStats = [];
  let anomaliesList = [];

  // --- Candidate Delimiters ---
  const CANDIDATES = [',', ';', '\t', '|'];

  // Auto-detect delimiter by scanning first lines and counting candidate frequencies
  function autoDetectDelimiter(text) {
    const lines = text.split(/\r\n|\r|\n/).filter(line => line.trim().length > 0).slice(0, 10);
    if (!lines.length) return ',';

    const scores = CANDIDATES.map(delim => {
      let counts = [];
      for (const line of lines) {
        // Count occurrences outside quotes
        let count = 0;
        let insideQuote = false;
        for (let i = 0; i < line.length; i++) {
          if (line[i] === '"') insideQuote = !insideQuote;
          else if (line[i] === delim && !insideQuote) count++;
        }
        counts.push(count);
      }

      // Check if count > 0 and variance is low across lines
      const avg = counts.reduce((a, b) => a + b, 0) / counts.length;
      if (avg === 0) return { delim, score: -1 };
      
      const variance = counts.reduce((acc, c) => acc + Math.pow(c - avg, 2), 0) / counts.length;
      // High average with low variance yields best score
      const score = (avg * 10) / (variance + 1);
      return { delim, score };
    });

    scores.sort((a, b) => b.score - a.score);
    return scores[0].score > 0 ? scores[0].delim : ',';
  }

  // Robust CSV parser supporting quotes, escaped quotes, multiline values, custom delimiter
  function parseCSV(text, delimiter) {
    const rows = [];
    let currentRow = [];
    let currentField = '';
    let insideQuotes = false;

    for (let i = 0; i < text.length; i++) {
      const char = text[i];
      const nextChar = text[i + 1];

      if (char === '"') {
        if (insideQuotes && nextChar === '"') {
          currentField += '"';
          i++; // skip escaped quote
        } else {
          insideQuotes = !insideQuotes;
        }
      } else if (char === delimiter && !insideQuotes) {
        currentRow.push(currentField);
        currentField = '';
      } else if ((char === '\r' || char === '\n') && !insideQuotes) {
        if (char === '\r' && nextChar === '\n') {
          i++;
        }
        currentRow.push(currentField);
        currentField = '';
        if (currentRow.some(c => c.trim() !== '')) {
          rows.push(currentRow);
        }
        currentRow = [];
      } else {
        currentField += char;
      }
    }

    if (currentField || currentRow.length > 0) {
      currentRow.push(currentField);
      if (currentRow.some(c => c.trim() !== '')) {
        rows.push(currentRow);
      }
    }

    return rows;
  }

  // --- Statistics & Column Profiling ---
  function analyzeColumns(headers, rows) {
    const stats = [];
    const anomalies = [];
    const totalRows = rows.length;

    // Check for Duplicate Rows
    const rowSignatures = new Map();
    rows.forEach((row, idx) => {
      const sig = JSON.stringify(row);
      if (rowSignatures.has(sig)) {
        anomalies.push({
          severity: 'severe',
          type: 'Duplicate Row',
          col: 'All Columns',
          row: idx + 1,
          detail: `Row ${idx + 1} is an identical duplicate of Row ${rowSignatures.get(sig) + 1}.`
        });
      } else {
        rowSignatures.set(sig, idx);
      }
    });

    // Profile each column
    headers.forEach((header, colIdx) => {
      const colValues = rows.map(r => (r[colIdx] !== undefined ? r[colIdx] : ''));
      let nonBlankCount = 0;
      let blankCount = 0;
      let numericCount = 0;
      let numbers = [];
      const frequencyMap = new Map();
      let whitespaceIssues = 0;

      colValues.forEach((val, rowIdx) => {
        const strVal = String(val);
        const trimmed = strVal.trim();

        if (trimmed === '') {
          blankCount++;
          anomalies.push({
            severity: 'info',
            type: 'Missing Value',
            col: header,
            row: rowIdx + 1,
            detail: `Cell in row ${rowIdx + 1}, column "${header}" is blank or missing.`
          });
        } else {
          nonBlankCount++;
          if (strVal !== trimmed) {
            whitespaceIssues++;
          }

          // Count frequency
          frequencyMap.set(trimmed, (frequencyMap.get(trimmed) || 0) + 1);

          // Check if clean number
          const num = Number(trimmed);
          if (!isNaN(num) && trimmed !== '') {
            numericCount++;
            numbers.push(num);
          }
        }
      });

      if (whitespaceIssues > 0) {
        anomalies.push({
          severity: 'info',
          type: 'Whitespace Issue',
          col: header,
          row: 'Multiple',
          detail: `${whitespaceIssues} cells in "${header}" have unneeded leading or trailing whitespace.`
        });
      }

      // Determine Data Type: Numeric if > 80% of non-blanks are numbers
      const isNumeric = nonBlankCount > 0 && (numericCount / nonBlankCount >= 0.8);
      const uniqueCount = frequencyMap.size;

      // Type Inconsistency Check
      if (isNumeric && numericCount < nonBlankCount) {
        colValues.forEach((val, rowIdx) => {
          const trimmed = String(val).trim();
          if (trimmed !== '' && isNaN(Number(trimmed))) {
            anomalies.push({
              severity: 'severe',
              type: 'Type Inconsistency',
              col: header,
              row: rowIdx + 1,
              detail: `Value "${trimmed}" in row ${rowIdx + 1} is text, but column "${header}" is predominantly numeric.`
            });
          }
        });
      }

      // Compute Numeric Stats
      let min = null, max = null, avg = null, median = null, sum = null, stdDev = null;
      if (isNumeric && numbers.length > 0) {
        numbers.sort((a, b) => a - b);
        min = numbers[0];
        max = numbers[numbers.length - 1];
        sum = numbers.reduce((acc, n) => acc + n, 0);
        avg = sum / numbers.length;

        // Median
        const mid = Math.floor(numbers.length / 2);
        median = numbers.length % 2 === 0 ? (numbers[mid - 1] + numbers[mid]) / 2 : numbers[mid];

        // Std Dev
        const variance = numbers.reduce((acc, n) => acc + Math.pow(n - avg, 2), 0) / numbers.length;
        stdDev = Math.sqrt(variance);

        // Outlier detection (> 2.5 std devs from mean)
        if (stdDev > 0) {
          colValues.forEach((val, rowIdx) => {
            const num = Number(val);
            if (!isNaN(num) && Math.abs(num - avg) > 2.5 * stdDev) {
              anomalies.push({
                severity: 'warning',
                type: 'Statistical Outlier',
                col: header,
                row: rowIdx + 1,
                detail: `Value ${num} in row ${rowIdx + 1} deviates significantly from column mean (${avg.toFixed(2)} ± ${stdDev.toFixed(2)}).`
              });
            }
          });
        }
      }

      // Top frequent values
      const topFreq = Array.from(frequencyMap.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, 3)
        .map(([val, cnt]) => ({
          value: val,
          count: cnt,
          pct: Math.round((cnt / (nonBlankCount || 1)) * 100)
        }));

      stats.push({
        colIndex: colIdx,
        header,
        type: isNumeric ? 'Numeric' : 'Text / Categorical',
        totalRows,
        nonBlankCount,
        blankCount,
        completeness: Math.round((nonBlankCount / (totalRows || 1)) * 100),
        uniqueCount,
        isNumeric,
        min,
        max,
        avg: avg !== null ? Math.round(avg * 100) / 100 : null,
        median: median !== null ? Math.round(median * 100) / 100 : null,
        sum: sum !== null ? Math.round(sum * 100) / 100 : null,
        stdDev: stdDev !== null ? Math.round(stdDev * 100) / 100 : null,
        topFreq
      });
    });

    return { stats, anomalies };
  }

  // --- UI Elements ---
  const delimiterBadge = document.getElementById('detected-delimiter-badge');
  const delimiterSelect = document.getElementById('delimiter-select');
  const hasHeaderCheck = document.getElementById('has-header-check');
  const csvFileInput = document.getElementById('csv-file-input');
  const btnLoadSampleOrders = document.getElementById('btn-load-sample-orders');
  const btnLoadSampleHR = document.getElementById('btn-load-sample-hr');
  const btnPasteToggle = document.getElementById('btn-paste-toggle');
  const pasteBoxWrapper = document.getElementById('paste-box-wrapper');
  const rawCsvTextarea = document.getElementById('raw-csv-textarea');
  const btnParsePasted = document.getElementById('btn-parse-pasted');

  // KPI Overview
  const kpiRows = document.getElementById('kpi-rows');
  const kpiRowsSub = document.getElementById('kpi-rows-sub');
  const kpiCols = document.getElementById('kpi-cols');
  const kpiColsSub = document.getElementById('kpi-cols-sub');
  const kpiCompleteness = document.getElementById('kpi-completeness');
  const kpiBlanks = document.getElementById('kpi-blanks');
  const kpiAnomalies = document.getElementById('kpi-anomalies');
  const kpiAnomaliesSub = document.getElementById('kpi-anomalies-sub');
  const tabAnomaliesBadge = document.getElementById('tab-anomalies-badge');
  const anomalySummaryPill = document.getElementById('anomaly-summary-pill');

  // Tabs
  const tabBtns = document.querySelectorAll('.tab-btn');
  const tabContents = document.querySelectorAll('.tab-content');

  // Table & Controls
  const tableSearchInput = document.getElementById('table-search-input');
  const filteredCountLabel = document.getElementById('filtered-count-label');
  const csvTable = document.getElementById('csv-table');
  const csvThead = document.getElementById('csv-thead');
  const csvTbody = document.getElementById('csv-tbody');
  const pageSizeSelect = document.getElementById('page-size-select');
  const pageControls = document.getElementById('page-controls');

  // Stats & Anomalies Containers
  const statsGrid = document.getElementById('stats-grid');
  const anomalyList = document.getElementById('anomaly-list');

  // Export Buttons
  const btnExportCsv = document.getElementById('btn-export-csv');
  const btnExportStats = document.getElementById('btn-export-stats');

  // --- Tab Navigation ---
  tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      tabBtns.forEach(b => b.classList.remove('active'));
      tabContents.forEach(c => c.classList.remove('active'));

      btn.classList.add('active');
      const targetId = btn.getAttribute('data-tab');
      const targetContent = document.getElementById(targetId);
      if (targetContent) targetContent.classList.add('active');
    });
  });

  // --- Process and Load CSV Content ---
  function processCSV(text, forcedDelimiter = null) {
    rawCSVData = text;
    if (!text.trim()) return;

    if (forcedDelimiter && forcedDelimiter !== 'auto') {
      detectedDelimiter = forcedDelimiter;
    } else {
      detectedDelimiter = autoDetectDelimiter(text);
    }

    const delimDisplayNames = {
      ',': 'Comma (,)',
      ';': 'Semicolon (;)',
      '\t': 'Tab (\\t)',
      '|': 'Pipe (|)'
    };
    delimiterBadge.textContent = `Delimiter: ${delimDisplayNames[detectedDelimiter] || detectedDelimiter}`;
    if (delimiterSelect.value !== 'auto') {
      delimiterSelect.value = detectedDelimiter;
    }

    const allRows = parseCSV(text, detectedDelimiter);
    if (!allRows.length) return;

    if (hasHeaderCheck.checked) {
      parsedHeaders = allRows[0].map((h, i) => h.trim() || `Column_${i + 1}`);
      parsedRows = allRows.slice(1);
    } else {
      const maxCols = Math.max(...allRows.map(r => r.length));
      parsedHeaders = Array.from({ length: maxCols }, (_, i) => `Column_${i + 1}`);
      parsedRows = allRows;
    }

    // Run Analytics
    const results = analyzeColumns(parsedHeaders, parsedRows);
    columnStats = results.stats;
    anomaliesList = results.anomalies;

    // Reset pagination and sort
    activeSort = { colIndex: -1, order: 'none' };
    currentPage = 1;
    highlightedRowIndex = -1;

    renderKPIs();
    renderTable();
    renderStats();
    renderAnomalies();
  }

  // --- Render KPI Overview ---
  function renderKPIs() {
    const totalCells = parsedRows.length * parsedHeaders.length;
    let totalBlanks = 0;
    columnStats.forEach(cs => { totalBlanks += cs.blankCount; });
    const completeness = totalCells > 0 ? Math.round(((totalCells - totalBlanks) / totalCells) * 100) : 100;

    kpiRows.textContent = parsedRows.length.toLocaleString();
    kpiRowsSub.textContent = `${parsedRows.length} data records`;

    kpiCols.textContent = parsedHeaders.length;
    kpiColsSub.textContent = `${columnStats.filter(c => c.isNumeric).length} numeric, ${columnStats.filter(c => !c.isNumeric).length} categorical`;

    kpiCompleteness.textContent = `${completeness}%`;
    kpiBlanks.textContent = `${totalBlanks.toLocaleString()} missing cells`;

    kpiAnomalies.textContent = anomaliesList.length;
    tabAnomaliesBadge.textContent = anomaliesList.length;
    anomalySummaryPill.textContent = `${anomaliesList.length} Quality Flags`;

    if (anomaliesList.length === 0) {
      kpiAnomaliesSub.textContent = 'Excellent data quality: 100/100';
      kpiAnomalies.style.color = 'var(--success)';
    } else if (anomaliesList.length <= 5) {
      kpiAnomaliesSub.textContent = 'Minor quality notices: 92/100';
      kpiAnomalies.style.color = 'var(--warning)';
    } else {
      kpiAnomaliesSub.textContent = 'Attention needed: 75/100';
      kpiAnomalies.style.color = 'var(--error)';
    }
  }

  // --- Filtering & Sorting ---
  function getFilteredRows() {
    let rows = parsedRows.map((r, originalIdx) => ({ rowData: r, originalIdx }));

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      rows = rows.filter(item => item.rowData.some(cell => String(cell).toLowerCase().includes(q)));
    }

    if (activeSort.order !== 'none' && activeSort.colIndex >= 0) {
      const c = activeSort.colIndex;
      const isNum = columnStats[c] && columnStats[c].isNumeric;

      rows.sort((a, b) => {
        let valA = a.rowData[c] !== undefined ? a.rowData[c] : '';
        let valB = b.rowData[c] !== undefined ? b.rowData[c] : '';

        if (isNum) {
          const numA = parseFloat(valA) || 0;
          const numB = parseFloat(valB) || 0;
          return activeSort.order === 'asc' ? numA - numB : numB - numA;
        } else {
          return activeSort.order === 'asc'
            ? String(valA).localeCompare(String(valB))
            : String(valB).localeCompare(String(valA));
        }
      });
    }

    return rows;
  }

  // --- Render Table ---
  function renderTable() {
    // Render Thead
    let theadHtml = '<tr><th style="width: 50px; text-align: center;">#</th>';
    parsedHeaders.forEach((h, colIdx) => {
      let sortIcon = '⇅';
      if (activeSort.colIndex === colIdx) {
        sortIcon = activeSort.order === 'asc' ? '▲' : (activeSort.order === 'desc' ? '▼' : '⇅');
      }
      theadHtml += `<th data-col="${colIdx}" title="Click to sort by ${h}">${h} <span style="font-size: 0.75rem; color: var(--accent);">${sortIcon}</span></th>`;
    });
    theadHtml += '</tr>';
    csvThead.innerHTML = theadHtml;

    // Filter & Paginate
    const filtered = getFilteredRows();
    const totalFiltered = filtered.length;
    const totalPages = Math.max(1, Math.ceil(totalFiltered / pageSize));
    if (currentPage > totalPages) currentPage = totalPages;

    const startIdx = (currentPage - 1) * pageSize;
    const endIdx = Math.min(startIdx + pageSize, totalFiltered);
    const pageRows = filtered.slice(startIdx, endIdx);

    filteredCountLabel.textContent = `Showing ${totalFiltered === 0 ? 0 : startIdx + 1} - ${endIdx} of ${totalFiltered} records`;

    // Render Tbody
    if (pageRows.length === 0) {
      csvTbody.innerHTML = `<tr><td colspan="${parsedHeaders.length + 1}" style="text-align: center; padding: 2rem; color: var(--text-tertiary);">No matching records found.</td></tr>`;
    } else {
      let tbodyHtml = '';
      pageRows.forEach(item => {
        const isHighlight = item.originalIdx === highlightedRowIndex;
        tbodyHtml += `<tr class="${isHighlight ? 'highlight-anomaly' : ''}">`;
        tbodyHtml += `<td style="text-align: center; font-weight: 600; color: var(--text-tertiary);">${item.originalIdx + 1}</td>`;
        item.rowData.forEach(cell => {
          const displayVal = cell !== undefined && cell !== null ? String(cell) : '';
          tbodyHtml += `<td title="${displayVal.replace(/"/g, '&quot;')}">${displayVal}</td>`;
        });
        tbodyHtml += '</tr>';
      });
      csvTbody.innerHTML = tbodyHtml;
    }

    renderPagination(totalPages);
  }

  // --- Render Pagination ---
  function renderPagination(totalPages) {
    let html = '';
    html += `<button class="page-btn" id="pg-first" ${currentPage === 1 ? 'disabled' : ''}>«</button>`;
    html += `<button class="page-btn" id="pg-prev" ${currentPage === 1 ? 'disabled' : ''}>‹</button>`;

    const startPage = Math.max(1, currentPage - 2);
    const endPage = Math.min(totalPages, startPage + 4);

    for (let p = startPage; p <= endPage; p++) {
      html += `<button class="page-btn ${p === currentPage ? 'active' : ''}" data-page="${p}">${p}</button>`;
    }

    html += `<button class="page-btn" id="pg-next" ${currentPage === totalPages ? 'disabled' : ''}>›</button>`;
    html += `<button class="page-btn" id="pg-last" ${currentPage === totalPages ? 'disabled' : ''}>»</button>`;
    pageControls.innerHTML = html;

    // Attach listeners
    pageControls.querySelectorAll('[data-page]').forEach(btn => {
      btn.addEventListener('click', () => {
        currentPage = parseInt(btn.getAttribute('data-page'), 10);
        renderTable();
      });
    });

    const btnFirst = document.getElementById('pg-first');
    const btnPrev = document.getElementById('pg-prev');
    const btnNext = document.getElementById('pg-next');
    const btnLast = document.getElementById('pg-last');

    if (btnFirst) btnFirst.onclick = () => { currentPage = 1; renderTable(); };
    if (btnPrev) btnPrev.onclick = () => { if (currentPage > 1) { currentPage--; renderTable(); } };
    if (btnNext) btnNext.onclick = () => { if (currentPage < totalPages) { currentPage++; renderTable(); } };
    if (btnLast) btnLast.onclick = () => { currentPage = totalPages; renderTable(); };
  }

  // --- Render Column Statistics Cards ---
  function renderStats() {
    let html = '';
    columnStats.forEach(cs => {
      html += `<div class="col-stat-card">
        <div class="col-stat-header">
          <div class="col-stat-title" title="${cs.header}">${cs.header}</div>
          <span class="badge" style="font-size: 0.7rem;">${cs.type}</span>
        </div>
        <div style="display: flex; flex-direction: column; gap: 0.35rem;">
          <div class="stat-row"><span>Completeness:</span> <strong>${cs.completeness}% (${cs.nonBlankCount}/${cs.totalRows})</strong></div>
          <div class="stat-row"><span>Missing / Blank:</span> <strong>${cs.blankCount}</strong></div>
          <div class="stat-row"><span>Unique Values:</span> <strong>${cs.uniqueCount}</strong></div>
        </div>`;

      if (cs.isNumeric) {
        html += `<div style="border-top: 1px solid var(--border); padding-top: 0.5rem; display: flex; flex-direction: column; gap: 0.35rem;">
          <div class="stat-row"><span>Min:</span> <strong>${cs.min}</strong></div>
          <div class="stat-row"><span>Max:</span> <strong>${cs.max}</strong></div>
          <div class="stat-row"><span>Average (Mean):</span> <strong>${cs.avg}</strong></div>
          <div class="stat-row"><span>Median:</span> <strong>${cs.median}</strong></div>
          <div class="stat-row"><span>Sum Total:</span> <strong>${cs.sum}</strong></div>
          <div class="stat-row"><span>Std Deviation:</span> <strong>${cs.stdDev}</strong></div>
        </div>`;
      } else {
        html += `<div style="border-top: 1px solid var(--border); padding-top: 0.5rem;">
          <span style="font-size: 0.8rem; font-weight: 600; color: var(--text-secondary); display: block; margin-bottom: 0.25rem;">Top Frequencies:</span>`;
        if (cs.topFreq.length === 0) {
          html += `<div style="font-size: 0.75rem; color: var(--text-tertiary);">No non-blank values</div>`;
        } else {
          cs.topFreq.forEach(tf => {
            html += `<div class="freq-bar-wrap">
              <span style="min-width: 80px; max-width: 110px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${tf.value}</span>
              <div class="freq-bar-bg"><div class="freq-bar-fill" style="width: ${tf.pct}%"></div></div>
              <span style="min-width: 32px; text-align: right; color: var(--accent); font-weight: 700;">${tf.pct}%</span>
            </div>`;
          });
        }
        html += `</div>`;
      }

      html += `</div>`;
    });

    statsGrid.innerHTML = html;
  }

  // --- Render Anomalies List ---
  function renderAnomalies() {
    if (anomaliesList.length === 0) {
      anomalyList.innerHTML = `<div class="glass-panel" style="padding: 2rem; text-align: center; color: var(--success); font-weight: 600;">
        <svg viewBox="0 0 24 24" width="36" height="36" fill="none" stroke="currentColor" stroke-width="2" style="margin-bottom: 0.5rem;"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
        <div>All clean! No data anomalies or inconsistencies detected in this dataset.</div>
      </div>`;
      return;
    }

    let html = '';
    anomaliesList.forEach((ano, idx) => {
      const isSevere = ano.severity === 'severe';
      const isInfo = ano.severity === 'info';
      const severityClass = isSevere ? 'severe' : (isInfo ? 'info' : '');
      const badgeColor = isSevere ? 'var(--error)' : (isInfo ? 'var(--accent)' : 'var(--warning)');

      html += `<div class="anomaly-card ${severityClass}" data-row-idx="${typeof ano.row === 'number' ? ano.row - 1 : -1}">
        <div style="display: flex; flex-direction: column; gap: 0.25rem;">
          <div style="display: flex; align-items: center; gap: 0.5rem;">
            <span class="badge" style="background: transparent; border-color: ${badgeColor}; color: ${badgeColor}; font-size: 0.7rem;">${ano.type}</span>
            <span style="font-weight: 700; font-size: 0.9rem; color: var(--text-primary);">${ano.col} &bull; Row ${ano.row}</span>
          </div>
          <div style="font-size: 0.825rem; color: var(--text-secondary);">${ano.detail}</div>
        </div>
        ${typeof ano.row === 'number' ? `<button class="btn btn-secondary btn-sm btn-inspect-row" data-target-row="${ano.row - 1}" style="white-space: nowrap;">Jump to Row</button>` : ''}
      </div>`;
    });

    anomalyList.innerHTML = html;

    // Attach click listeners to jump to row
    anomalyList.querySelectorAll('.btn-inspect-row').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const targetRow = parseInt(btn.getAttribute('data-target-row'), 10);
        highlightedRowIndex = targetRow;

        // Switch to Table tab
        document.querySelector('[data-tab="tab-table"]').click();

        // Calculate page
        currentPage = Math.floor(targetRow / pageSize) + 1;
        renderTable();

        const rowEl = csvTbody.querySelector('.highlight-anomaly');
        if (rowEl) {
          rowEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      });
    });
  }

  // --- Export Functions ---
  function exportCSV() {
    if (!parsedRows.length) return;
    const delimiter = detectedDelimiter || ',';

    const escapeField = (val) => {
      if (val === null || val === undefined) return '';
      const str = String(val);
      if (str.includes(delimiter) || str.includes('"') || str.includes('\n') || str.includes('\r')) {
        return '"' + str.replace(/"/g, '""') + '"';
      }
      return str;
    };

    const lines = [];
    lines.push(parsedHeaders.map(escapeField).join(delimiter));
    parsedRows.forEach(r => {
      lines.push(r.map(escapeField).join(delimiter));
    });

    const blob = new Blob([lines.join('\r\n')], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `csv_analyzer_export_${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  function exportStatsJSON() {
    const report = {
      generatedAt: new Date().toISOString(),
      summary: {
        totalRows: parsedRows.length,
        totalColumns: parsedHeaders.length,
        detectedDelimiter,
        anomaliesCount: anomaliesList.length
      },
      columns: columnStats,
      anomalies: anomaliesList
    };

    const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `csv_data_profile_${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  // --- Sample Datasets ---
  const SAMPLE_ORDERS = `OrderID,Date,Customer,Region,Category,ItemPrice,Quantity,Discount,TotalSales,Status
ORD-9011,2026-09-01,Acme Corporation,North America,Electronics,450.00,3,0.05,1282.50,Shipped
ORD-9012,2026-09-02,Globex Media,Europe,Furniture,280.00,2,0.10,504.00,Delivered
ORD-9013,2026-09-02,Soylent Tech,Asia-Pacific,Accessories,45.00,10,0.00,450.00,Shipped
ORD-9014,2026-09-03,Initech Global,North America,Electronics,1200.00,1,0.15,1020.00,Processing
ORD-9015,2026-09-04,Umbrella Labs,Europe,Office Supplies,15.50,25,0.05,368.12,Delivered
ORD-9016,2026-09-05,Hooli Digital,North America,Electronics,850.00,4,0.10,3060.00,Delivered
ORD-9017,2026-09-06,Wayne Enterprises,Europe,Furniture,620.00,1,0.00,620.00,Shipped
ORD-9018,2026-09-07,Stark Industries,North America,Hardware,9500.00,1,0.20,7600.00,Delivered
ORD-9019,2026-09-08,Cyberdyne Systems,Europe,Accessories,35.00,8,0.00,280.00,Processing
ORD-9020,2026-09-09,Massive Dynamic,Asia-Pacific,Furniture,340.00,3,0.05,969.00,Shipped
ORD-9021,2026-09-10,Acme Corporation,North America,Electronics,450.00,2,0.00,900.00,Delivered
ORD-9022,2026-09-11,Oscorp Tech,North America,Electronics,180.00,5,0.05,855.00,Shipped
ORD-9023,2026-09-12,Tyrell Corp,Asia-Pacific,Hardware,420.00,2,0.10,756.00,Delivered
ORD-9024,2026-09-13,Wonka Industries,Europe,Office Supplies,12.00,50,0.10,540.00,Shipped
ORD-9025,2026-09-14,Aperture Science,North America,Hardware,780.00,1,0.00,780.00,Delivered
ORD-9026,2026-09-15,Pied Piper,North America,Electronics,95.00,6,0.05,541.50,Shipped
ORD-9027,2026-09-16,E Corp,Europe,Furniture,490.00,2,0.00,980.00,Delivered
ORD-9028,2026-09-17,Weyland-Yutani,Asia-Pacific,Hardware,1500.00,3,0.15,3825.00,Processing
ORD-9029,2026-09-18,Gekko & Co,North America,Office Supplies,8.50,100,0.20,680.00,Delivered
ORD-9030,2026-09-19,Sutter Cane,Europe,Accessories,60.00,4,0.00,240.00,Shipped`;

  const SAMPLE_HR = `EmployeeID;FullName;Department;Role;Salary;Rating;StartDate;RemoteStatus
EMP-001;Sarah Connor;Engineering;Staff Engineer;145000;4.8;2021-03-15;Full Remote
EMP-002;John Wick;Security;Director of InfoSec;165000;4.9;2019-06-01;Hybrid
EMP-003;Ellen Ripley;Operations;VP Operations;175000;5.0;2018-01-10;On-site
EMP-004;Bruce Wayne;Executive;Chief Strategy;220000;4.7;2017-11-20;Hybrid
EMP-005;Tony Stark;Engineering;Principal Architect;210000;4.9;2018-04-12;Full Remote
EMP-006;Diana Prince;Legal;Senior Counsel;155000;4.8;2020-09-01;On-site
EMP-007;Peter Parker;Marketing;Content Strategist;72000;4.3;2023-01-15;Hybrid
EMP-008;Clark Kent;Communications;Editor in Chief;88000;4.6;2022-05-18;Full Remote
EMP-009;Natasha Romanoff;Security;Threat Analyst;125000;4.8;2021-08-22;On-site
EMP-010;Barry Allen;Engineering;Performance Engineer;115000;4.5;2022-10-05;Full Remote
EMP-011;Arthur Curry;Operations;Supply Chain Lead;98000;4.2;2022-02-14;Hybrid
EMP-012;Wanda Maximoff;Product;Director of UX;158000;4.7;2020-04-30;Full Remote
EMP-013;Stephen Strange;Data Science;Chief Scientist;195000;4.9;2019-12-01;Hybrid
EMP-014;Carol Danvers;Operations;Field Coordinator;110000;4.4;2021-11-15;On-site
EMP-015;Steve Rogers;HR;Head of Talent;135000;4.8;2019-07-04;Hybrid`;

  // --- Setup Event Listeners ---
  function setupEventListeners() {
    // File upload
    csvFileInput.addEventListener('change', (e) => {
      const file = e.target.files && e.target.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (evt) => {
        processCSV(evt.target.result);
      };
      reader.readAsText(file);
      csvFileInput.value = '';
    });

    // Sample buttons
    btnLoadSampleOrders.addEventListener('click', () => {
      processCSV(SAMPLE_ORDERS);
    });

    btnLoadSampleHR.addEventListener('click', () => {
      processCSV(SAMPLE_HR);
    });

    // Paste toggle & submit
    btnPasteToggle.addEventListener('click', () => {
      const isVisible = pasteBoxWrapper.style.display !== 'none';
      pasteBoxWrapper.style.display = isVisible ? 'none' : 'block';
    });

    btnParsePasted.addEventListener('click', () => {
      const pasted = rawCsvTextarea.value;
      if (pasted.trim()) {
        processCSV(pasted);
        pasteBoxWrapper.style.display = 'none';
      }
    });

    // Delimiter manual override
    delimiterSelect.addEventListener('change', (e) => {
      if (rawCSVData) {
        processCSV(rawCSVData, e.target.value);
      }
    });

    // Header checkbox toggle
    hasHeaderCheck.addEventListener('change', () => {
      if (rawCSVData) {
        processCSV(rawCSVData, delimiterSelect.value);
      }
    });

    // Table search
    tableSearchInput.addEventListener('input', (e) => {
      searchQuery = e.target.value;
      currentPage = 1;
      renderTable();
    });

    // Page size
    pageSizeSelect.addEventListener('change', (e) => {
      pageSize = parseInt(e.target.value, 10);
      currentPage = 1;
      renderTable();
    });

    // Table Column Sort
    csvThead.addEventListener('click', (e) => {
      const th = e.target.closest('th[data-col]');
      if (!th) return;
      const colIdx = parseInt(th.getAttribute('data-col'), 10);

      if (activeSort.colIndex === colIdx) {
        if (activeSort.order === 'asc') activeSort.order = 'desc';
        else if (activeSort.order === 'desc') activeSort.order = 'none';
        else activeSort.order = 'asc';
      } else {
        activeSort.colIndex = colIdx;
        activeSort.order = 'asc';
      }

      renderTable();
    });

    // Exports
    btnExportCsv.addEventListener('click', exportCSV);
    btnExportStats.addEventListener('click', exportStatsJSON);
  }

  // --- Initializer ---
  document.addEventListener('DOMContentLoaded', () => {
    setupEventListeners();
    // Pre-load default e-commerce orders sample
    processCSV(SAMPLE_ORDERS);
  });

})();