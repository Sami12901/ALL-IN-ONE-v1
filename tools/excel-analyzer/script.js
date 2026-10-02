// Excel Analyzer - Multi-Tab Worksheet Explorer, Schema Detector, Distribution & Pivot Aggregator
// Vanilla JavaScript implementation

(() => {
  'use strict';

  // --- Workbook State ---
  let workbook = {
    name: 'Enterprise_Performance_2026',
    sheets: []
  };
  let activeSheetIndex = 0;
  let gridSearchQuery = '';

  // --- CSV Parser Helper ---
  function parseCSV(text) {
    const rows = [];
    let currentRow = [];
    let currentField = '';
    let insideQuotes = false;
    // Auto-detect comma vs semicolon
    const firstLine = text.split(/\r\n|\n/)[0] || '';
    const delimiter = (firstLine.match(/;/g) || []).length > (firstLine.match(/,/g) || []).length ? ';' : ',';

    for (let i = 0; i < text.length; i++) {
      const char = text[i];
      const nextChar = text[i + 1];

      if (char === '"') {
        if (insideQuotes && nextChar === '"') {
          currentField += '"';
          i++;
        } else {
          insideQuotes = !insideQuotes;
        }
      } else if (char === delimiter && !insideQuotes) {
        currentRow.push(currentField.trim());
        currentField = '';
      } else if ((char === '\r' || char === '\n') && !insideQuotes) {
        if (char === '\r' && nextChar === '\n') i++;
        currentRow.push(currentField.trim());
        currentField = '';
        if (currentRow.some(c => c !== '')) rows.push(currentRow);
        currentRow = [];
      } else {
        currentField += char;
      }
    }
    if (currentField || currentRow.length > 0) {
      currentRow.push(currentField.trim());
      if (currentRow.some(c => c !== '')) rows.push(currentRow);
    }
    return rows;
  }

  // --- Type Inference ---
  function inferColumnType(values) {
    const nonBlanks = values.filter(v => v !== '' && v !== null && v !== undefined);
    if (!nonBlanks.length) return 'Empty';

    let currencyCount = 0;
    let percentCount = 0;
    let intCount = 0;
    let floatCount = 0;
    let dateCount = 0;
    let emailCount = 0;

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const dateRegex = /^\d{4}[-/]\d{1,2}[-/]\d{1,2}$|^\d{1,2}[-/]\d{1,2}[-/]\d{2,4}$/;

    nonBlanks.forEach(val => {
      const str = String(val).trim();
      if (str.startsWith('$') || str.endsWith('$')) {
        const rawNum = str.replace(/[\$,]/g, '');
        if (!isNaN(Number(rawNum)) && rawNum !== '') currencyCount++;
      } else if (str.endsWith('%')) {
        const rawNum = str.replace(/%/g, '');
        if (!isNaN(Number(rawNum)) && rawNum !== '') percentCount++;
      } else if (dateRegex.test(str)) {
        dateCount++;
      } else if (emailRegex.test(str)) {
        emailCount++;
      } else if (!isNaN(Number(str))) {
        if (Number.isInteger(Number(str))) intCount++;
        else floatCount++;
      }
    });

    const total = nonBlanks.length;
    if (currencyCount / total >= 0.7) return 'Currency';
    if (percentCount / total >= 0.7) return 'Percentage';
    if (dateCount / total >= 0.7) return 'Date';
    if (emailCount / total >= 0.7) return 'Email';
    if ((intCount + floatCount) / total >= 0.7) {
      return floatCount > 0 ? 'Decimal' : 'Integer';
    }
    return 'Text';
  }

  function cleanNumeric(val) {
    if (val === null || val === undefined) return NaN;
    const str = String(val).replace(/[\$,%]/g, '').trim();
    return Number(str);
  }

  // --- Schema Analysis ---
  function analyzeSheetSchema(sheet) {
    const totalRows = sheet.rows.length;
    const schema = [];

    sheet.headers.forEach((header, colIdx) => {
      const colValues = sheet.rows.map(r => (r[colIdx] !== undefined ? r[colIdx] : ''));
      const nonBlanks = colValues.filter(v => String(v).trim() !== '');
      const uniqueSet = new Set(nonBlanks);
      const inferredType = inferColumnType(colValues);

      const nullCount = totalRows - nonBlanks.length;
      const densityPct = totalRows > 0 ? Math.round((nonBlanks.length / totalRows) * 100) : 100;
      const isKeyCandidate = nullCount === 0 && uniqueSet.size === totalRows && totalRows > 0;

      // Sample or range
      let rangeOrSample = '';
      if (inferredType === 'Integer' || inferredType === 'Decimal' || inferredType === 'Currency' || inferredType === 'Percentage') {
        const nums = nonBlanks.map(cleanNumeric).filter(n => !isNaN(n));
        if (nums.length) {
          const min = Math.min(...nums);
          const max = Math.max(...nums);
          rangeOrSample = `[${min} ... ${max}]`;
        }
      } else {
        rangeOrSample = Array.from(uniqueSet).slice(0, 3).join(', ') + (uniqueSet.size > 3 ? '...' : '');
      }

      schema.push({
        colIdx,
        header,
        type: inferredType,
        nullCount,
        densityPct,
        uniqueCount: uniqueSet.size,
        isKeyCandidate,
        rangeOrSample
      });
    });

    return schema;
  }

  // --- UI Elements ---
  const sheetTabsBar = document.getElementById('sheet-tabs-bar');
  const btnAddTab = document.getElementById('btn-add-tab');
  const activeSheetBadge = document.getElementById('active-sheet-badge');
  const excelFileInput = document.getElementById('excel-file-input');
  const btnLoadCorp = document.getElementById('btn-load-corp');
  const btnLoadSupply = document.getElementById('btn-load-supply');
  const btnExportSheet = document.getElementById('btn-export-sheet');
  const btnExportWorkbook = document.getElementById('btn-export-workbook');

  // KPI Metrics
  const kpiTotalRows = document.getElementById('kpi-total-rows');
  const kpiRowsSub = document.getElementById('kpi-rows-sub');
  const kpiTotalCols = document.getElementById('kpi-total-cols');
  const kpiColsSub = document.getElementById('kpi-cols-sub');
  const kpiMemory = document.getElementById('kpi-memory');
  const kpiMemorySub = document.getElementById('kpi-memory-sub');
  const kpiDensity = document.getElementById('kpi-density');
  const kpiDensitySub = document.getElementById('kpi-density-sub');

  // View Switcher
  const viewBtns = document.querySelectorAll('.view-btn');
  const viewPanels = document.querySelectorAll('.view-panel');

  // Grid View
  const gridSearchInput = document.getElementById('grid-search-input');
  const gridStatusInfo = document.getElementById('grid-status-info');
  const gridThead = document.getElementById('grid-thead');
  const gridTbody = document.getElementById('grid-tbody');

  // Schema View
  const schemaTbody = document.getElementById('schema-tbody');

  // Distribution View
  const distColSelect = document.getElementById('dist-col-select');
  const distSummaryLabel = document.getElementById('dist-summary-label');
  const distChartTitle = document.getElementById('dist-chart-title');
  const distSvg = document.getElementById('dist-svg');

  // Pivot View
  const pivotGroupCol = document.getElementById('pivot-group-col');
  const pivotValCol = document.getElementById('pivot-val-col');
  const pivotAggFunc = document.getElementById('pivot-agg-func');
  const btnExportPivotCsv = document.getElementById('btn-export-pivot-csv');
  const pivotSvg = document.getElementById('pivot-svg');
  const pivotTbody = document.getElementById('pivot-tbody');
  const pivotChartTitle = document.getElementById('pivot-chart-title');

  // --- View Switcher Handling ---
  viewBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      viewBtns.forEach(b => b.classList.remove('active'));
      viewPanels.forEach(p => p.classList.remove('active'));

      btn.classList.add('active');
      const targetView = btn.getAttribute('data-view');
      const targetPanel = document.getElementById(targetView);
      if (targetPanel) targetPanel.classList.add('active');
    });
  });

  // --- Active Sheet Retrieval ---
  function getActiveSheet() {
    if (!workbook.sheets.length) return null;
    if (activeSheetIndex < 0 || activeSheetIndex >= workbook.sheets.length) activeSheetIndex = 0;
    return workbook.sheets[activeSheetIndex];
  }

  // --- Render Sheet Tabs Bar ---
  function renderTabs() {
    sheetTabsBar.querySelectorAll('.sheet-tab').forEach(t => t.remove());

    workbook.sheets.forEach((sh, idx) => {
      const tab = document.createElement('div');
      tab.className = `sheet-tab ${idx === activeSheetIndex ? 'active' : ''}`;
      tab.textContent = sh.name;
      tab.addEventListener('click', () => {
        activeSheetIndex = idx;
        renderActiveSheet();
      });
      sheetTabsBar.insertBefore(tab, btnAddTab);
    });

    const cur = getActiveSheet();
    activeSheetBadge.textContent = cur ? `Sheet: ${cur.name}` : 'No Sheet';
  }

  // --- Render Active Sheet & Sub-views ---
  function renderActiveSheet() {
    renderTabs();
    const sheet = getActiveSheet();
    if (!sheet) return;

    renderKPIs(sheet);
    renderGrid(sheet);
    renderSchema(sheet);
    populateSelectOptions(sheet);
    renderDistributionChart(sheet);
    renderPivot(sheet);
  }

  // --- Render KPI Overview ---
  function renderKPIs(sheet) {
    const totalRows = sheet.rows.length;
    const totalCols = sheet.headers.length;
    const totalCells = totalRows * totalCols;

    let emptyCells = 0;
    let byteSize = 0;

    sheet.headers.forEach(h => { byteSize += h.length * 2; });
    sheet.rows.forEach(r => {
      r.forEach(c => {
        const str = String(c || '');
        if (!str.trim()) emptyCells++;
        byteSize += str.length * 2 + 8; // Estimate string & cell pointer overhead
      });
    });

    const memoryKb = (byteSize / 1024).toFixed(1);
    const densityPct = totalCells > 0 ? (((totalCells - emptyCells) / totalCells) * 100).toFixed(1) : '100';

    kpiTotalRows.textContent = totalRows.toLocaleString();
    kpiRowsSub.textContent = `${totalRows} records loaded`;

    kpiTotalCols.textContent = totalCols;
    kpiColsSub.textContent = `Attributes per row`;

    kpiMemory.textContent = memoryKb < 1024 ? `${memoryKb} KB` : `${(memoryKb / 1024).toFixed(2)} MB`;
    kpiMemorySub.textContent = `~${byteSize.toLocaleString()} bytes`;

    kpiDensity.textContent = `${densityPct}%`;
    kpiDensitySub.textContent = `${emptyCells} empty cells`;
  }

  // --- Render Grid ---
  function renderGrid(sheet) {
    let theadHtml = '<tr><th style="width: 48px; text-align: center;">#</th>';
    sheet.headers.forEach(h => {
      theadHtml += `<th>${h}</th>`;
    });
    theadHtml += '</tr>';
    gridThead.innerHTML = theadHtml;

    let filtered = sheet.rows;
    if (gridSearchQuery.trim()) {
      const q = gridSearchQuery.toLowerCase();
      filtered = sheet.rows.filter(r => r.some(cell => String(cell).toLowerCase().includes(q)));
    }

    gridStatusInfo.textContent = `Displaying ${filtered.length} of ${sheet.rows.length} rows`;

    let tbodyHtml = '';
    const displayRows = filtered.slice(0, 100); // Limit to top 100 for fast responsiveness
    displayRows.forEach((row, idx) => {
      tbodyHtml += `<tr><td style="text-align: center; color: var(--text-tertiary); font-weight: 600;">${idx + 1}</td>`;
      row.forEach(cell => {
        tbodyHtml += `<td>${cell !== undefined && cell !== null ? cell : ''}</td>`;
      });
      tbodyHtml += '</tr>';
    });

    if (filtered.length === 0) {
      tbodyHtml = `<tr><td colspan="${sheet.headers.length + 1}" style="text-align: center; padding: 2rem; color: var(--text-tertiary);">No records match the filter query.</td></tr>`;
    }

    gridTbody.innerHTML = tbodyHtml;
  }

  // --- Render Schema Table ---
  function renderSchema(sheet) {
    const schema = analyzeSheetSchema(sheet);
    let html = '';

    schema.forEach(item => {
      const typeClass = `type-${item.type.toLowerCase()}`;
      html += `<tr>
        <td style="font-weight: 700; color: var(--text-primary);">${item.header}</td>
        <td><span class="schema-badge ${typeClass}">${item.type}</span></td>
        <td>${item.nullCount === 0 ? '<span style="color: var(--success); font-weight: 600;">Required (0% null)</span>' : `<span style="color: var(--warning);">${item.nullCount} nulls</span>`}</td>
        <td><strong>${item.densityPct}%</strong></td>
        <td>${item.uniqueCount} distinct</td>
        <td>${item.isKeyCandidate ? '<span class="badge" style="background: rgba(16, 185, 129, 0.2); color: var(--success); border-color: var(--success);">Primary Key</span>' : '<span style="color: var(--text-tertiary);">-</span>'}</td>
        <td style="font-family: monospace; font-size: 0.8rem; color: var(--text-secondary);">${item.rangeOrSample}</td>
      </tr>`;
    });

    schemaTbody.innerHTML = html;
  }

  // --- Populate Dropdown Options for Distribution & Pivot ---
  function populateSelectOptions(sheet) {
    const schema = analyzeSheetSchema(sheet);

    // Distribution selector
    distColSelect.innerHTML = sheet.headers.map((h, i) => `<option value="${i}">${h} (${schema[i].type})</option>`).join('');

    // Pivot group (all columns, preferably categorical)
    pivotGroupCol.innerHTML = sheet.headers.map((h, i) => `<option value="${i}">${h}</option>`).join('');

    // Pivot value (preferably numeric/currency, but fallback to any)
    pivotValCol.innerHTML = sheet.headers.map((h, i) => `<option value="${i}">${h} [${schema[i].type}]</option>`).join('');

    // Default intelligent column picker for pivot:
    // First non-numeric for group, first numeric for value
    const firstCat = schema.find(s => s.type === 'Text' || s.type === 'Date');
    const firstNum = schema.find(s => s.type === 'Integer' || s.type === 'Decimal' || s.type === 'Currency');

    if (firstCat) pivotGroupCol.value = firstCat.colIdx;
    if (firstNum) pivotValCol.value = firstNum.colIdx;
  }

  // --- Render Distribution SVG Vector Chart ---
  function renderDistributionChart(sheet) {
    const colIdx = parseInt(distColSelect.value, 10) || 0;
    const header = sheet.headers[colIdx] || 'Column';
    const schema = analyzeSheetSchema(sheet);
    const colMeta = schema[colIdx];
    const colValues = sheet.rows.map(r => (r[colIdx] !== undefined ? r[colIdx] : '')).filter(v => String(v).trim() !== '');

    distChartTitle.textContent = `Value Distribution: ${header}`;

    if (!colValues.length) {
      distSvg.innerHTML = `<text x="400" y="160" text-anchor="middle" fill="var(--text-tertiary)">No non-blank data in this column</text>`;
      distSummaryLabel.textContent = '0 data points';
      return;
    }

    const isNumeric = colMeta.type === 'Integer' || colMeta.type === 'Decimal' || colMeta.type === 'Currency' || colMeta.type === 'Percentage';

    if (isNumeric) {
      const numbers = colValues.map(cleanNumeric).filter(n => !isNaN(n)).sort((a, b) => a - b);
      if (!numbers.length) return;

      const min = numbers[0];
      const max = numbers[numbers.length - 1];
      distSummaryLabel.textContent = `Numeric range: ${min.toLocaleString()} to ${max.toLocaleString()} (${numbers.length} values)`;

      // Histogram: 6 bins
      const binCount = Math.min(6, numbers.length);
      const binWidth = (max - min) / binCount || 1;
      const bins = Array.from({ length: binCount }, (_, i) => ({
        from: min + i * binWidth,
        to: min + (i + 1) * binWidth,
        count: 0
      }));

      numbers.forEach(n => {
        let bIdx = Math.floor((n - min) / binWidth);
        if (bIdx >= binCount) bIdx = binCount - 1;
        bins[bIdx].count++;
      });

      const maxCount = Math.max(...bins.map(b => b.count), 1);

      // SVG Construction
      const svgWidth = 800;
      const svgHeight = 320;
      const padLeft = 60;
      const padRight = 40;
      const padTop = 30;
      const padBottom = 60;
      const chartW = svgWidth - padLeft - padRight;
      const chartH = svgHeight - padTop - padBottom;
      const barSpacing = 15;
      const barW = (chartW - (binCount - 1) * barSpacing) / binCount;

      let svgContent = `<defs>
        <linearGradient id="distGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#89aacc"/>
          <stop offset="100%" stop-color="#4e85bf"/>
        </linearGradient>
      </defs>`;

      // Horizontal grid lines
      for (let g = 0; g <= 4; g++) {
        const y = padTop + (chartH / 4) * g;
        const val = Math.round(maxCount - (maxCount / 4) * g);
        svgContent += `<line x1="${padLeft}" y1="${y}" x2="${svgWidth - padRight}" y2="${y}" stroke="var(--border)" stroke-dasharray="3,3" />`;
        svgContent += `<text x="${padLeft - 10}" y="${y + 4}" fill="var(--text-tertiary)" font-size="11" text-anchor="end">${val}</text>`;
      }

      bins.forEach((b, i) => {
        const barH = (b.count / maxCount) * chartH;
        const x = padLeft + i * (barW + barSpacing);
        const y = padTop + chartH - barH;

        svgContent += `<rect x="${x}" y="${y}" width="${barW}" height="${barH}" rx="4" fill="url(#distGrad)" opacity="0.9">
          <title>Range: ${Math.round(b.from)} - ${Math.round(b.to)}: ${b.count} records</title>
        </rect>`;

        // Count above bar
        if (b.count > 0) {
          svgContent += `<text x="${x + barW / 2}" y="${y - 8}" fill="var(--text-primary)" font-size="12" font-weight="700" text-anchor="middle">${b.count}</text>`;
        }

        // Label below bar
        const label = `${Math.round(b.from)}`;
        svgContent += `<text x="${x + barW / 2}" y="${svgHeight - padBottom + 20}" fill="var(--text-secondary)" font-size="11" text-anchor="middle">${label}</text>`;
      });

      distSvg.innerHTML = svgContent;
    } else {
      // Categorical Frequency Bars
      const freqMap = new Map();
      colValues.forEach(v => {
        const s = String(v).trim();
        freqMap.set(s, (freqMap.get(s) || 0) + 1);
      });

      const topCats = Array.from(freqMap.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, 7);

      distSummaryLabel.textContent = `${freqMap.size} distinct categories (${colValues.length} total)`;
      const maxCount = Math.max(...topCats.map(c => c[1]), 1);

      const svgWidth = 800;
      const svgHeight = 320;
      const padLeft = 140;
      const padRight = 80;
      const padTop = 30;
      const padBottom = 20;
      const chartW = svgWidth - padLeft - padRight;
      const chartH = svgHeight - padTop - padBottom;
      const barH = Math.min(28, (chartH / topCats.length) - 8);

      let svgContent = `<defs>
        <linearGradient id="catGrad" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stop-color="#4e85bf"/>
          <stop offset="100%" stop-color="#89aacc"/>
        </linearGradient>
      </defs>`;

      topCats.forEach(([catName, cnt], i) => {
        const y = padTop + i * ((chartH / topCats.length));
        const barW = (cnt / maxCount) * chartW;
        const pct = Math.round((cnt / colValues.length) * 100);

        // Category Label
        const displayLabel = catName.length > 16 ? catName.slice(0, 15) + '…' : catName;
        svgContent += `<text x="${padLeft - 15}" y="${y + barH / 1.4}" fill="var(--text-primary)" font-size="12" font-weight="600" text-anchor="end">${displayLabel}</text>`;

        // Bar
        svgContent += `<rect x="${padLeft}" y="${y}" width="${barW}" height="${barH}" rx="4" fill="url(#catGrad)" opacity="0.95"></rect>`;

        // Count + Pct Label
        svgContent += `<text x="${padLeft + barW + 10}" y="${y + barH / 1.4}" fill="var(--accent)" font-size="12" font-weight="700">${cnt} (${pct}%)</text>`;
      });

      distSvg.innerHTML = svgContent;
    }
  }

  // --- Render Pivot Aggregator & SVG Chart ---
  function renderPivot(sheet) {
    const groupColIdx = parseInt(pivotGroupCol.value, 10) || 0;
    const valColIdx = parseInt(pivotValCol.value, 10) || 0;
    const aggFunc = pivotAggFunc.value || 'SUM';

    const groupHeader = sheet.headers[groupColIdx] || 'Group';
    const valHeader = sheet.headers[valColIdx] || 'Metric';

    pivotChartTitle.textContent = `${aggFunc} of ${valHeader} by ${groupHeader}`;

    // Compute Groups
    const groupMap = new Map(); // groupKey -> { values: [], count: 0 }

    sheet.rows.forEach(r => {
      const gKey = (r[groupColIdx] !== undefined && String(r[groupColIdx]).trim() !== '') ? String(r[groupColIdx]).trim() : '(Blank)';
      const rawVal = r[valColIdx];
      const numVal = cleanNumeric(rawVal);

      if (!groupMap.has(gKey)) {
        groupMap.set(gKey, { values: [], count: 0 });
      }
      const gEntry = groupMap.get(gKey);
      gEntry.count++;
      if (!isNaN(numVal)) {
        gEntry.values.push(numVal);
      }
    });

    const pivotResults = [];
    let grandSum = 0;

    groupMap.forEach((entry, gKey) => {
      let aggregated = 0;
      const vals = entry.values;

      switch (aggFunc) {
        case 'SUM':
          aggregated = vals.reduce((a, b) => a + b, 0);
          break;
        case 'AVERAGE':
          aggregated = vals.length ? vals.reduce((a, b) => a + b, 0) / vals.length : 0;
          break;
        case 'COUNT':
          aggregated = entry.count;
          break;
        case 'MIN':
          aggregated = vals.length ? Math.min(...vals) : 0;
          break;
        case 'MAX':
          aggregated = vals.length ? Math.max(...vals) : 0;
          break;
      }

      aggregated = Math.round(aggregated * 100) / 100;
      grandSum += aggregated;
      pivotResults.push({
        group: gKey,
        count: entry.count,
        aggregated
      });
    });

    // Sort by aggregated value descending
    pivotResults.sort((a, b) => b.aggregated - a.aggregated);

    // Render Table
    let tableHtml = '';
    pivotResults.forEach(p => {
      const pct = grandSum > 0 ? ((p.aggregated / grandSum) * 100).toFixed(1) : '0';
      tableHtml += `<tr>
        <td style="font-weight: 700; color: var(--text-primary);">${p.group}</td>
        <td>${p.count}</td>
        <td><strong style="color: var(--accent); font-family: monospace;">${p.aggregated.toLocaleString()}</strong></td>
        <td>${pct}%</td>
      </tr>`;
    });
    pivotTbody.innerHTML = tableHtml;

    // Render SVG Bar Chart
    const svgWidth = 800;
    const svgHeight = 320;
    const padLeft = 140;
    const padRight = 90;
    const padTop = 30;
    const padBottom = 20;
    const chartW = svgWidth - padLeft - padRight;
    const chartH = svgHeight - padTop - padBottom;

    const displayGroups = pivotResults.slice(0, 8);
    const maxAgg = Math.max(...displayGroups.map(d => d.aggregated), 1);
    const barH = Math.min(26, (chartH / displayGroups.length) - 6);

    let svgContent = `<defs>
      <linearGradient id="pivotGrad" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0%" stop-color="#10b981"/>
        <stop offset="100%" stop-color="#4e85bf"/>
      </linearGradient>
    </defs>`;

    displayGroups.forEach((dg, i) => {
      const y = padTop + i * (chartH / displayGroups.length);
      const barW = (Math.max(0, dg.aggregated) / maxAgg) * chartW;
      const displayLabel = dg.group.length > 15 ? dg.group.slice(0, 14) + '…' : dg.group;

      svgContent += `<text x="${padLeft - 15}" y="${y + barH / 1.4}" fill="var(--text-primary)" font-size="12" font-weight="600" text-anchor="end">${displayLabel}</text>`;
      svgContent += `<rect x="${padLeft}" y="${y}" width="${barW}" height="${barH}" rx="4" fill="url(#pivotGrad)" opacity="0.9"></rect>`;
      svgContent += `<text x="${padLeft + barW + 10}" y="${y + barH / 1.4}" fill="var(--text-primary)" font-size="12" font-weight="700">${dg.aggregated.toLocaleString()}</text>`;
    });

    pivotSvg.innerHTML = svgContent;
  }

  // --- Export Functions ---
  function exportSheetCSV() {
    const sheet = getActiveSheet();
    if (!sheet) return;

    const lines = [];
    lines.push(sheet.headers.map(h => `"${h.replace(/"/g, '""')}"`).join(','));
    sheet.rows.forEach(r => {
      lines.push(r.map(c => `"${String(c || '').replace(/"/g, '""')}"`).join(','));
    });

    const blob = new Blob([lines.join('\r\n')], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${sheet.name}_export.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  function exportPivotCSV() {
    const sheet = getActiveSheet();
    if (!sheet) return;

    const rows = Array.from(pivotTbody.querySelectorAll('tr')).map(tr => {
      return Array.from(tr.querySelectorAll('td')).map(td => `"${td.textContent.trim().replace(/"/g, '""')}"`).join(',');
    });

    const header = `"Group","Records Count","Aggregated Value","% of Total"`;
    const content = [header, ...rows].join('\r\n');

    const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `pivot_table_export_${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  function exportWorkbookJSON() {
    const jsonBlob = new Blob([JSON.stringify(workbook, null, 2)], { type: 'application/json;charset=utf-8;' });
    const url = URL.createObjectURL(jsonBlob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${workbook.name}_full_workbook.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  // --- Multi-Tab Sample Datasets ---
  function loadCorporateSample() {
    workbook = {
      name: 'Global_SaaS_Enterprise_2026',
      sheets: [
        {
          name: 'Revenue_Streams',
          headers: ['Plan_Tier', 'Region', 'ARR_USD', 'Net_Expansion_Pct', 'Churn_Rate_Pct', 'Active_Accounts'],
          rows: [
            ['Enterprise Core', 'North America', '1450000', '128%', '1.8%', '142'],
            ['Enterprise Pro', 'North America', '2850000', '135%', '1.2%', '115'],
            ['Enterprise Core', 'EMEA', '980000', '118%', '2.4%', '94'],
            ['Enterprise Pro', 'EMEA', '1750000', '124%', '1.6%', '68'],
            ['Growth Tier', 'APAC', '620000', '142%', '3.1%', '210'],
            ['Enterprise Pro', 'APAC', '1120000', '130%', '1.9%', '42'],
            ['Growth Tier', 'North America', '1200000', '115%', '3.4%', '340'],
            ['Growth Tier', 'EMEA', '840000', '112%', '3.8%', '220'],
            ['Startup Launchpad', 'Global', '450000', '95%', '5.5%', '780']
          ]
        },
        {
          name: 'OpEx_Headcount',
          headers: ['Department', 'Headcount', 'Avg_Base_Salary', 'Total_Payroll', 'Primary_Hub', 'Remote_Ratio'],
          rows: [
            ['Engineering & AI', '64', '168000', '10752000', 'San Francisco', '75%'],
            ['Product Design', '18', '142000', '2556000', 'New York', '60%'],
            ['Enterprise Sales', '32', '125000', '4000000', 'London', '50%'],
            ['Customer Success', '28', '88000', '2464000', 'Dublin', '85%'],
            ['Marketing & Growth', '15', '110000', '1650000', 'San Francisco', '55%'],
            ['General & Admin', '12', '135000', '1620000', 'New York', '40%']
          ]
        },
        {
          name: 'Cloud_Infrastructure',
          headers: ['Service_Cluster', 'Cloud_Provider', 'Monthly_Cost_USD', 'Usage_TB', 'Uptime_SLA_Pct', 'Peak_QPS'],
          rows: [
            ['Vector Search Cluster', 'AWS', '34500', '180.5', '99.99%', '45000'],
            ['Primary Relational DB', 'AWS', '28000', '95.0', '99.99%', '32000'],
            ['Edge Cache CDN', 'Cloudflare', '12500', '450.0', '100.00%', '120000'],
            ['Inference GPU Fleet', 'GCP', '52000', '42.0', '99.95%', '18500'],
            ['Observability & Logs', 'Datadog', '18500', '65.0', '99.90%', '8500'],
            ['Object Storage', 'GCP', '8900', '1200.0', '99.99%', '14000']
          ]
        },
        {
          name: 'Marketing_ROI',
          headers: ['Channel', 'Monthly_Budget', 'Impressions', 'Clicks', 'New_Demos', 'Cost_Per_Acq'],
          rows: [
            ['Developer Sponsorships', '45000', '850000', '28000', '320', '140.62'],
            ['Search Intent Ads', '65000', '420000', '31000', '410', '158.53'],
            ['Technical Conferences', '35000', '120000', '9500', '180', '194.44'],
            ['Partner Co-Marketing', '25000', '280000', '14000', '215', '116.27'],
            ['Podcast Sponsorships', '20000', '540000', '11000', '145', '137.93']
          ]
        }
      ]
    };
    activeSheetIndex = 0;
    renderActiveSheet();
  }

  function loadSupplySample() {
    workbook = {
      name: 'Global_Supply_Chain_Logistics',
      sheets: [
        {
          name: 'Warehouse_Inventory',
          headers: ['Warehouse_Code', 'Location', 'Available_Capacity_Units', 'Occupied_Units', 'Daily_Turnover_Rate'],
          rows: [
            ['WH-NA-01', 'Chicago Hub', '150000', '124000', '8.4%'],
            ['WH-NA-02', 'Dallas Center', '180000', '162000', '7.9%'],
            ['WH-EU-01', 'Rotterdam Port', '220000', '195000', '9.2%'],
            ['WH-EU-02', 'Frankfurt Logistics', '140000', '98000', '6.8%'],
            ['WH-AP-01', 'Singapore Gateway', '200000', '175000', '11.5%']
          ]
        },
        {
          name: 'Carrier_Performance',
          headers: ['Carrier_Name', 'Mode', 'On_Time_Delivery_Pct', 'Avg_Transit_Days', 'Claims_Rate_Pct', 'Freight_Spend'],
          rows: [
            ['Global Freight Express', 'Air', '96.5%', '2.4', '0.2%', '1420000'],
            ['Pacific Ocean Lines', 'Ocean', '88.2%', '18.5', '0.8%', '890000'],
            ['EuroRail Trans', 'Rail', '92.4%', '5.8', '0.4%', '450000'],
            ['Interstate Cargo Corp', 'Trucking', '94.8%', '3.1', '0.3%', '780000']
          ]
        }
      ]
    };
    activeSheetIndex = 0;
    renderActiveSheet();
  }

  // --- Setup Event Listeners ---
  function setupEventListeners() {
    // Add tab
    btnAddTab.addEventListener('click', () => {
      const tabName = prompt('Enter new worksheet name:', `Sheet${workbook.sheets.length + 1}`);
      if (tabName && tabName.trim()) {
        workbook.sheets.push({
          name: tabName.trim(),
          headers: ['ID', 'Title', 'Value', 'Status'],
          rows: [
            ['1', 'Sample Alpha', '100', 'Active'],
            ['2', 'Sample Beta', '250', 'Pending']
          ]
        });
        activeSheetIndex = workbook.sheets.length - 1;
        renderActiveSheet();
      }
    });

    // File input (import CSV as new tab or replace)
    excelFileInput.addEventListener('change', (e) => {
      const file = e.target.files && e.target.files[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = (evt) => {
        const text = evt.target.result;
        const parsed = parseCSV(text);
        if (parsed.length > 1) {
          const sheetName = file.name.replace(/\.[^/.]+$/, '').replace(/[^a-zA-Z0-9_]/g, '_');
          workbook.sheets.push({
            name: sheetName,
            headers: parsed[0],
            rows: parsed.slice(1)
          });
          activeSheetIndex = workbook.sheets.length - 1;
          renderActiveSheet();
        }
      };
      reader.readAsText(file);
      excelFileInput.value = '';
    });

    // Preset sample loaders
    btnLoadCorp.addEventListener('click', loadCorporateSample);
    btnLoadSupply.addEventListener('click', loadSupplySample);

    // Export buttons
    btnExportSheet.addEventListener('click', exportSheetCSV);
    btnExportPivotCsv.addEventListener('click', exportPivotCSV);
    btnExportWorkbook.addEventListener('click', exportWorkbookJSON);

    // Grid search
    gridSearchInput.addEventListener('input', (e) => {
      gridSearchQuery = e.target.value;
      const sheet = getActiveSheet();
      if (sheet) renderGrid(sheet);
    });

    // Distribution target column select
    distColSelect.addEventListener('change', () => {
      const sheet = getActiveSheet();
      if (sheet) renderDistributionChart(sheet);
    });

    // Pivot controls change
    pivotGroupCol.addEventListener('change', () => {
      const sheet = getActiveSheet();
      if (sheet) renderPivot(sheet);
    });

    pivotValCol.addEventListener('change', () => {
      const sheet = getActiveSheet();
      if (sheet) renderPivot(sheet);
    });

    pivotAggFunc.addEventListener('change', () => {
      const sheet = getActiveSheet();
      if (sheet) renderPivot(sheet);
    });
  }

  // --- Initializer ---
  document.addEventListener('DOMContentLoaded', () => {
    setupEventListeners();
    loadCorporateSample(); // Default preset
  });

})();