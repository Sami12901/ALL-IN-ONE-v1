// Data Cleaner - Multi-Step Interactive Data Cleaning Pipeline
document.addEventListener('DOMContentLoaded', () => {
  // Elements
  const cleanerRawInput = document.getElementById('cleaner-raw-input');
  const cleanerDropZone = document.getElementById('cleaner-drop-zone');
  const cleanerFileInput = document.getElementById('cleaner-file-input');
  const selectCleanerDelimiter = document.getElementById('select-cleaner-delimiter');
  const chkCleanerHeaders = document.getElementById('chk-cleaner-headers');
  const btnLoadCleaner = document.getElementById('btn-load-cleaner');
  const btnClearCleaner = document.getElementById('btn-clear-cleaner');
  const presetButtons = document.querySelectorAll('.preset-btn');

  // Pipeline UI
  const pipelineSection = document.getElementById('pipeline-section');
  const btnExecutePipeline = document.getElementById('btn-execute-pipeline');

  // Step 1: Duplicates
  const chkEnableDup = document.getElementById('chk-enable-dup');
  const selectDupCols = document.getElementById('select-dup-cols');
  const selectDupStrategy = document.getElementById('select-dup-strategy');
  const chkDupCaseInsensitive = document.getElementById('chk-dup-case-insensitive');

  // Step 2: Whitespace
  const chkEnableTrim = document.getElementById('chk-enable-trim');
  const chkTrimEdges = document.getElementById('chk-trim-edges');
  const chkNormalizeInnerSpaces = document.getElementById('chk-normalize-inner-spaces');
  const chkStripInvisible = document.getElementById('chk-strip-invisible');
  const chkRemoveLinebreaks = document.getElementById('chk-remove-linebreaks');

  // Step 3: Null Handling
  const chkEnableNull = document.getElementById('chk-enable-null');
  const selectNullAction = document.getElementById('select-null-action');
  const groupCustomNullVal = document.getElementById('group-custom-null-val');
  const inputCustomNullVal = document.getElementById('input-custom-null-val');
  const selectNullTargetCol = document.getElementById('select-null-target-col');

  // Step 4: Text Casing
  const chkEnableCase = document.getElementById('chk-enable-case');
  const selectCaseTransform = document.getElementById('select-case-transform');
  const selectCaseTargetCol = document.getElementById('select-case-target-col');

  // Step 5: Special Characters
  const chkEnableSpecial = document.getElementById('chk-enable-special');
  const selectSpecialAction = document.getElementById('select-special-action');
  const selectSpecialTargetCol = document.getElementById('select-special-target-col');

  // Stats Elements
  const statOrigRows = document.getElementById('stat-orig-rows');
  const statCleanRows = document.getElementById('stat-clean-rows');
  const statDupsRemoved = document.getElementById('stat-dups-removed');
  const statSpacesTrimmed = document.getElementById('stat-spaces-trimmed');
  const statNullsHandled = document.getElementById('stat-nulls-handled');
  const statCasesConverted = document.getElementById('stat-cases-converted');
  const statCellsModified = document.getElementById('stat-cells-modified');

  // Tabs
  const tabBtns = document.querySelectorAll('.tab-btn');
  const tabContents = document.querySelectorAll('.tab-content');

  // Tables & Controls
  const cleanSearch = document.getElementById('clean-search');
  const chkHighlightChanges = document.getElementById('chk-highlight-changes');
  const theadCleaned = document.getElementById('thead-cleaned');
  const tbodyCleaned = document.getElementById('tbody-cleaned');
  const cleanPaginationInfo = document.getElementById('clean-pagination-info');
  const btnCleanPrev = document.getElementById('btn-clean-prev');
  const btnCleanNext = document.getElementById('btn-clean-next');
  const cleanPageNum = document.getElementById('clean-page-num');

  // Diff & Duplicates Tables
  const tbodyDiff = document.getElementById('tbody-diff');
  const theadDups = document.getElementById('thead-dups');
  const tbodyDups = document.getElementById('tbody-dups');
  const dupBadgeCount = document.getElementById('dup-badge-count');

  // Export Buttons
  const selectExportDelimiter = document.getElementById('select-export-delimiter');
  const btnDownloadCsv = document.getElementById('btn-download-csv');
  const btnDownloadJson = document.getElementById('btn-download-json');
  const btnCopyClean = document.getElementById('btn-copy-clean');

  // State
  let rawDataset = {
    headers: [],
    rows: []
  };

  let cleanDataset = {
    headers: [],
    rows: [],
    modificationsMap: new Map(), // key: `${rowIdx}-${colIdx}` -> { oldVal, newVal, reason }
    diffsList: [],
    duplicatesList: [],
    stats: {
      origRows: 0,
      cleanRows: 0,
      dupsRemoved: 0,
      spacesTrimmed: 0,
      nullsHandled: 0,
      casesConverted: 0,
      specialCleaned: 0,
      totalCellsModified: 0
    }
  };

  let tableState = {
    currentPage: 1,
    pageSize: 25,
    searchQuery: '',
    highlightChanges: true
  };

  // Sample Presets Data
  const DIRTY_PRESETS = {
    crm: `Customer ID,Full Name,Email Address,Phone Number,City,Status,Annual Spend
CUST-101,   john DOE  ,john.doe@example.com ,(555) 123-4567,   NEW YORK  ,Active,$4,500.00
CUST-102,JANE smith,jane.smith@domain.org,555.987.6543,chicago,Pending,2200
CUST-103,robert  JOHNSON ,  robert.j@corp.net,555-432-1098,SAN FRANCISCO,Active,8900
CUST-101,john doe,john.doe@example.com,(555) 123-4567,New York,Active,4500
CUST-104, EMILY  williams  ,,(555) 678-9012,SEATTLE,Inactive,1200
CUST-105,MICHAEL   BROWN,michael.b@webmail.com,555-890-1234,   ,Active,
CUST-106, sarah  miller ,sarah.m@test.com,(555) 345-6789,boston,Pending,3100
CUST-107,david  WILSON,david.w@firm.com,,DALLAS,Active,6400
CUST-102,jane SMITH,jane.smith@domain.org,555.987.6543,chicago,Pending,2200
CUST-108,LISA   taylor,lisa.t@service.co,555-234-5678,miami,Active,5200
CUST-109, james ANDERSON,james.a@enterprise.com,(555) 789-0123,ATLANTA,,4800
CUST-110,karen   THOMAS  ,karen.t@site.org,555.678.1234,austin,Inactive,950`,

    inventory: `SKU,Product Name,Category,Unit Price,Quantity in Stock,Supplier
SKU-901,  ultra wireless mouse  ,ELECTRONICS, 29.99 ,  150 ,LogiTech Corp
SKU-902,ergonomic mechanical KEYBOARD,Electronics,89.50,45,Keychron Ltd
SKU-903,  4K USB-C MONITOR,electronics,  349.00  ,18,Dell Global
SKU-901,ultra wireless mouse,ELECTRONICS,29.99,150,LogiTech Corp
SKU-904,desk LED lamp with usb,office supplies,,85,Xiaomi Eco
SKU-905,noise canceling HEADPHONES,ELECTRONICS,199.99,24,Sony Audio
SKU-906,ergonomic mesh CHAIR,Office Supplies,249.00,,Steelcase
SKU-907,standing desk converter,OFFICE SUPPLIES,175.50,12,FlexiSpot
SKU-908, braided usb-c cable (6ft)  ,Accessories,14.99,300,Anker Direct
SKU-903,4K USB-C MONITOR,Electronics,349.00,18,Dell Global
SKU-909, aluminum laptop stand ,ACCESSORIES,39.00,75,Satechi Co
SKU-910,high-speed thunderbolt DOCK,Electronics,189.00,20,CalDigit`,

    survey: `Respondent ID,Feedback Topic,User Sentiment,Rating (1-5),Follow Up Requested,Comments
R-001,Customer Support,POSITIVE, 5 ,YES,  Quick and super helpful agent!  
R-002,Checkout Flow,NEGATIVE,1,yes,Encountered payment error #504 during checkout!!!
R-003,Website Speed,NEUTRAL,3,NO,Site is okay but product search takes > 5 sec.
R-004,Mobile App,positive,4,no, smooth navigation, but needs dark mode. 
R-001,Customer Support,Positive,5,Yes,Quick and super helpful agent!
R-005,Product Quality,,2,yes,Item arrived scratched & damaged in transit.
R-006,Shipping Time,NEGATIVE,1,YES,Package delayed by 8 days without tracking update!
R-007,Pricing & Deals,positive,5,NO,  Loved the 25% discount coupon!  
R-008,Checkout Flow,NEUTRAL,3,,Checkout page felt cluttered with promotions.
R-009,Customer Support,NEGATIVE,2,yes, Waited 45 minutes on phone call hold... 
R-010,Website Speed,Positive,4,no,Fast response on Chrome browser.`
  };

  // Event Listeners for Presets
  presetButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const presetKey = btn.getAttribute('data-preset');
      if (DIRTY_PRESETS[presetKey]) {
        cleanerRawInput.value = DIRTY_PRESETS[presetKey];
        selectCleanerDelimiter.value = ',';
        chkCleanerHeaders.checked = true;
        loadDataset();
      }
    });
  });

  btnClearCleaner.addEventListener('click', () => {
    cleanerRawInput.value = '';
    pipelineSection.style.display = 'none';
    rawDataset = { headers: [], rows: [] };
    cleanDataset = { headers: [], rows: [], modificationsMap: new Map(), diffsList: [], duplicatesList: [], stats: {} };
  });

  btnLoadCleaner.addEventListener('click', () => loadDataset());
  btnExecutePipeline.addEventListener('click', () => runPipeline());

  // Dynamic conditional inputs
  selectNullAction.addEventListener('change', () => {
    if (selectNullAction.value === 'fill_custom') {
      groupCustomNullVal.style.display = 'flex';
    } else {
      groupCustomNullVal.style.display = 'none';
    }
  });

  // Drag and Drop File
  cleanerDropZone.addEventListener('click', () => cleanerFileInput.click());
  cleanerDropZone.addEventListener('dragover', (e) => {
    e.preventDefault();
    cleanerDropZone.classList.add('dragover');
  });
  cleanerDropZone.addEventListener('dragleave', () => cleanerDropZone.classList.remove('dragover'));
  cleanerDropZone.addEventListener('drop', (e) => {
    e.preventDefault();
    cleanerDropZone.classList.remove('dragover');
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleCleanerFileUpload(e.dataTransfer.files[0]);
    }
  });

  cleanerFileInput.addEventListener('change', () => {
    if (cleanerFileInput.files && cleanerFileInput.files.length > 0) {
      handleCleanerFileUpload(cleanerFileInput.files[0]);
    }
  });

  function handleCleanerFileUpload(file) {
    const reader = new FileReader();
    reader.onload = (e) => {
      cleanerRawInput.value = e.target.result;
      loadDataset();
    };
    reader.readAsText(file);
  }

  // Tabs
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

  // Search & Pagination
  cleanSearch.addEventListener('input', (e) => {
    tableState.searchQuery = e.target.value.toLowerCase();
    tableState.currentPage = 1;
    renderCleanedTable();
  });

  chkHighlightChanges.addEventListener('change', (e) => {
    tableState.highlightChanges = e.target.checked;
    renderCleanedTable();
  });

  btnCleanPrev.addEventListener('click', () => {
    if (tableState.currentPage > 1) {
      tableState.currentPage--;
      renderCleanedTable();
    }
  });

  btnCleanNext.addEventListener('click', () => {
    const totalPages = Math.ceil(getFilteredCleanRows().length / tableState.pageSize);
    if (tableState.currentPage < totalPages) {
      tableState.currentPage++;
      renderCleanedTable();
    }
  });

  // Export handlers
  btnDownloadCsv.addEventListener('click', () => exportCleanCsv());
  btnDownloadJson.addEventListener('click', () => exportCleanJson());
  btnCopyClean.addEventListener('click', () => copyCleanData());

  // Load and Parse Dataset
  function loadDataset() {
    const text = cleanerRawInput.value.trim();
    if (!text) {
      alert('Please enter or upload a dataset to clean.');
      return;
    }

    try {
      const parsed = parseTabularData(text, selectCleanerDelimiter.value, chkCleanerHeaders.checked);
      if (!parsed || parsed.rows.length === 0) {
        alert('Could not parse valid data rows.');
        return;
      }

      rawDataset.headers = parsed.headers;
      rawDataset.rows = parsed.rows;

      populatePipelineColumnSelects(parsed.headers);
      runPipeline();

      pipelineSection.style.display = 'flex';
      pipelineSection.scrollIntoView({ behavior: 'smooth' });
    } catch (err) {
      console.error(err);
      alert('Failed to load dataset: ' + err.message);
    }
  }

  function populatePipelineColumnSelects(headers) {
    // Populate column options for each step
    const selects = [
      { el: selectDupCols, defaultLabel: 'All Columns (Entire Row)' },
      { el: selectNullTargetCol, defaultLabel: 'All Columns' },
      { el: selectCaseTargetCol, defaultLabel: 'All Text Columns', val: 'all_text' },
      { el: selectSpecialTargetCol, defaultLabel: 'All Columns' }
    ];

    selects.forEach(({ el, defaultLabel, val }) => {
      el.innerHTML = `<option value="${val || 'all'}">${defaultLabel}</option>`;
      headers.forEach(h => {
        const opt = document.createElement('option');
        opt.value = h;
        opt.textContent = h;
        el.appendChild(opt);
      });
    });
  }

  // Multi-Step Data Cleaning Pipeline Execution
  function runPipeline() {
    if (rawDataset.rows.length === 0) return;

    // Reset cleaned state
    let rows = rawDataset.rows.map(r => [...r]);
    const headers = [...rawDataset.headers];
    const modificationsMap = new Map();
    const diffsList = [];
    let dupsRemoved = 0;
    let spacesTrimmed = 0;
    let nullsHandled = 0;
    let casesConverted = 0;
    let specialCleaned = 0;
    let duplicatesList = [];

    // Step 1: Remove Duplicates
    if (chkEnableDup.checked) {
      const matchCol = selectDupCols.value;
      const strategy = selectDupStrategy.value;
      const caseInsensitive = chkDupCaseInsensitive.checked;

      const getRowKey = (row) => {
        let keyValues = [];
        if (matchCol === 'all') {
          keyValues = row;
        } else {
          const colIdx = headers.indexOf(matchCol);
          keyValues = [colIdx !== -1 ? row[colIdx] : ''];
        }
        return keyValues.map(v => caseInsensitive ? String(v || '').trim().toLowerCase() : String(v || '').trim()).join('|||');
      };

      const keyToIndices = new Map();
      rows.forEach((row, idx) => {
        const key = getRowKey(row);
        if (!keyToIndices.has(key)) keyToIndices.set(key, []);
        keyToIndices.get(key).push(idx);
      });

      const indicesToKeep = new Set();
      keyToIndices.forEach((indices) => {
        if (indices.length === 1) {
          indicesToKeep.add(indices[0]);
        } else {
          // Multiple occurrences (Duplicates)
          indices.forEach((idx, i) => {
            duplicatesList.push({
              rowIdx: idx,
              rowNumber: idx + 1,
              row: rows[idx],
              isKept: (strategy === 'first' && i === 0) || (strategy === 'last' && i === indices.length - 1)
            });
          });

          if (strategy === 'first') {
            indicesToKeep.add(indices[0]);
          } else if (strategy === 'last') {
            indicesToKeep.add(indices[indices.length - 1]);
          }
          // if strategy === 'all', drop all duplicates (add none to indicesToKeep)
        }
      });

      dupsRemoved = rows.length - indicesToKeep.size;
      rows = rows.filter((_, idx) => indicesToKeep.has(idx));
    }

    // Step 2: Whitespace & Invisible Character Trimming
    if (chkEnableTrim.checked) {
      const trimEdges = chkTrimEdges.checked;
      const normInner = chkNormalizeInnerSpaces.checked;
      const stripInvis = chkStripInvisible.checked;
      const rmLinebreaks = chkRemoveLinebreaks.checked;

      rows = rows.map((row, rIdx) => {
        return row.map((cell, cIdx) => {
          let val = String(cell !== undefined && cell !== null ? cell : '');
          let origVal = val;

          // Strip invisible chars (BOM, zero width spaces, non-breaking spaces)
          if (stripInvis) {
            val = val.replace(/[\u200B-\u200D\uFEFF]/g, '').replace(/\u00A0/g, ' ');
          }

          // Remove linebreaks / tabs inside cell
          if (rmLinebreaks) {
            val = val.replace(/[\r\n\t]+/g, ' ');
          }

          // Collapse inner multi-spaces
          if (normInner) {
            val = val.replace(/ {2,}/g, ' ');
          }

          // Trim edges
          if (trimEdges) {
            val = val.trim();
          }

          if (val !== origVal) {
            spacesTrimmed++;
            recordDiff(modificationsMap, diffsList, rIdx, cIdx, headers[cIdx], origVal, val, 'Trimmed Whitespace');
          }

          return val;
        });
      });
    }

    // Step 3: Handle Null / Empty Cells
    if (chkEnableNull.checked) {
      const nullAction = selectNullAction.value;
      const targetCol = selectNullTargetCol.value;
      const customVal = inputCustomNullVal.value || '';

      // Compute Column Medians, Means, and Modes if needed
      const colStats = {};
      if (nullAction.startsWith('fill_')) {
        headers.forEach((h, cIdx) => {
          const colVals = rows.map(r => r[cIdx]).filter(v => v !== undefined && v !== null && v.trim() !== '');
          const nums = colVals.map(v => parseFloat(v.replace(/^[$\u20AC\u00A3\u00A5]/, '').replace(/,/g, ''))).filter(n => !isNaN(n));
          
          let mean = 0;
          let median = 0;
          if (nums.length > 0) {
            mean = nums.reduce((a, b) => a + b, 0) / nums.length;
            const sorted = [...nums].sort((a, b) => a - b);
            const mid = Math.floor(sorted.length / 2);
            median = sorted.length % 2 === 0 ? (sorted[mid - 1] + sorted[mid]) / 2 : sorted[mid];
          }

          // Mode
          const counts = {};
          colVals.forEach(v => counts[v] = (counts[v] || 0) + 1);
          let mode = '';
          let maxCount = 0;
          for (const [k, count] of Object.entries(counts)) {
            if (count > maxCount) {
              maxCount = count;
              mode = k;
            }
          }

          colStats[cIdx] = { mean: Number(mean.toFixed(2)), median: Number(median.toFixed(2)), mode: mode || 'N/A' };
        });
      }

      if (nullAction === 'drop_any') {
        const initialCount = rows.length;
        rows = rows.filter(row => {
          if (targetCol === 'all') {
            return row.every(c => c !== undefined && c !== null && c.trim() !== '');
          } else {
            const cIdx = headers.indexOf(targetCol);
            return cIdx !== -1 ? (row[cIdx] !== undefined && row[cIdx] !== null && row[cIdx].trim() !== '') : true;
          }
        });
        nullsHandled += (initialCount - rows.length);
      } else if (nullAction === 'drop_all') {
        const initialCount = rows.length;
        rows = rows.filter(row => row.some(c => c !== undefined && c !== null && c.trim() !== ''));
        nullsHandled += (initialCount - rows.length);
      } else if (nullAction.startsWith('fill_')) {
        rows = rows.map((row, rIdx) => {
          return row.map((cell, cIdx) => {
            const isTarget = targetCol === 'all' || headers[cIdx] === targetCol;
            const isEmpty = cell === undefined || cell === null || cell.trim() === '';

            if (isTarget && isEmpty) {
              let replacement = '';
              if (nullAction === 'fill_custom') replacement = customVal;
              else if (nullAction === 'fill_mean') replacement = String(colStats[cIdx].mean);
              else if (nullAction === 'fill_median') replacement = String(colStats[cIdx].median);
              else if (nullAction === 'fill_zero') replacement = '0';
              else if (nullAction === 'fill_mode') replacement = colStats[cIdx].mode;

              nullsHandled++;
              recordDiff(modificationsMap, diffsList, rIdx, cIdx, headers[cIdx], cell, replacement, `Filled Null (${nullAction})`);
              return replacement;
            }
            return cell;
          });
        });
      }
    }

    // Step 4: Text Casing Normalization
    if (chkEnableCase.checked) {
      const caseMode = selectCaseTransform.value;
      const targetCol = selectCaseTargetCol.value;

      rows = rows.map((row, rIdx) => {
        return row.map((cell, cIdx) => {
          const colName = headers[cIdx];
          const isTarget = targetCol === 'all_text' || targetCol === 'all' || colName === targetCol;

          if (isTarget && typeof cell === 'string' && cell.trim() !== '') {
            // Check if purely numeric
            if (!isNaN(Number(cell.replace(/,/g, '').trim()))) return cell;

            let converted = cell;
            if (caseMode === 'upper') {
              converted = cell.toUpperCase();
            } else if (caseMode === 'lower') {
              converted = cell.toLowerCase();
            } else if (caseMode === 'title') {
              converted = toTitleCase(cell);
            } else if (caseMode === 'sentence') {
              converted = cell.charAt(0).toUpperCase() + cell.slice(1).toLowerCase();
            }

            if (converted !== cell) {
              casesConverted++;
              recordDiff(modificationsMap, diffsList, rIdx, cIdx, colName, cell, converted, `Case Normalized (${caseMode})`);
            }
            return converted;
          }
          return cell;
        });
      });
    }

    // Step 5: Special Characters Sanitization
    if (chkEnableSpecial.checked) {
      const specialRule = selectSpecialAction.value;
      const targetCol = selectSpecialTargetCol.value;

      rows = rows.map((row, rIdx) => {
        return row.map((cell, cIdx) => {
          const colName = headers[cIdx];
          const isTarget = targetCol === 'all' || colName === targetCol;

          if (isTarget && typeof cell === 'string' && cell !== '') {
            let sanitized = cell;
            if (specialRule === 'strip_punct') {
              sanitized = cell.replace(/[!"#$%&'()*+,\-./:;<=>?@[\\\]^_`{|}~]/g, '');
            } else if (specialRule === 'alphanumeric') {
              sanitized = cell.replace(/[^a-zA-Z0-9\s]/g, '');
            } else if (specialRule === 'strip_digits') {
              sanitized = cell.replace(/\d+/g, '');
            } else if (specialRule === 'ascii_only') {
              sanitized = cell.replace(/[^\x00-\x7F]/g, '');
            }

            if (sanitized !== cell) {
              specialCleaned++;
              recordDiff(modificationsMap, diffsList, rIdx, cIdx, colName, cell, sanitized, `Stripped Special Chars (${specialRule})`);
            }
            return sanitized;
          }
          return cell;
        });
      });
    }

    // Update Cleaned Dataset State
    cleanDataset = {
      headers,
      rows,
      modificationsMap,
      diffsList,
      duplicatesList,
      stats: {
        origRows: rawDataset.rows.length,
        cleanRows: rows.length,
        dupsRemoved,
        spacesTrimmed,
        nullsHandled,
        casesConverted,
        specialCleaned,
        totalCellsModified: modificationsMap.size
      }
    };

    // Render Cleaned Views
    renderCleanStats();
    renderCleanedTable();
    renderDiffTable();
    renderDuplicatesTable();
  }

  function recordDiff(map, list, rIdx, cIdx, colName, oldVal, newVal, reason) {
    const key = `${rIdx}-${cIdx}`;
    const diff = { rIdx, cIdx, colName, oldVal, newVal, reason, rowNumber: rIdx + 1 };
    map.set(key, diff);
    list.push(diff);
  }

  function toTitleCase(str) {
    return str.toLowerCase().replace(/(?:^|\s|-|\/)\S/g, (match) => match.toUpperCase());
  }

  // Render Stats
  function renderCleanStats() {
    const s = cleanDataset.stats;
    statOrigRows.textContent = s.origRows.toLocaleString();
    statCleanRows.textContent = s.cleanRows.toLocaleString();
    statDupsRemoved.textContent = s.dupsRemoved.toLocaleString();
    statSpacesTrimmed.textContent = s.spacesTrimmed.toLocaleString();
    statNullsHandled.textContent = s.nullsHandled.toLocaleString();
    statCasesConverted.textContent = s.casesConverted.toLocaleString();
    statCellsModified.textContent = s.totalCellsModified.toLocaleString();
  }

  // Render Cleaned Data Table
  function getFilteredCleanRows() {
    let rows = cleanDataset.rows.map((row, idx) => ({ row, idx, rowNumber: idx + 1 }));
    if (tableState.searchQuery) {
      rows = rows.filter(r => r.row.some(c => String(c).toLowerCase().includes(tableState.searchQuery)));
    }
    return rows;
  }

  function renderCleanedTable() {
    const filtered = getFilteredCleanRows();
    const totalCount = filtered.length;
    const totalPages = Math.max(1, Math.ceil(totalCount / tableState.pageSize));

    if (tableState.currentPage > totalPages) tableState.currentPage = totalPages;

    const startIdx = (tableState.currentPage - 1) * tableState.pageSize;
    const endIdx = Math.min(startIdx + tableState.pageSize, totalCount);
    const pageRows = filtered.slice(startIdx, endIdx);

    // Headers
    theadCleaned.innerHTML = `<tr><th>#</th>` + cleanDataset.headers.map(h => `<th>${escapeHtml(h)}</th>`).join('') + `</tr>`;

    // Rows
    if (pageRows.length === 0) {
      tbodyCleaned.innerHTML = `<tr><td colspan="${cleanDataset.headers.length + 1}" style="text-align:center; padding:2rem; color:var(--text-tertiary);">No clean records to display.</td></tr>`;
    } else {
      tbodyCleaned.innerHTML = pageRows.map(r => {
        let cells = `<td style="font-weight:600; color:var(--text-tertiary);">${r.rowNumber}</td>`;
        cells += r.row.map((cell, cIdx) => {
          const isModified = tableState.highlightChanges && cleanDataset.modificationsMap.has(`${r.idx}-${cIdx}`);
          const modClass = isModified ? 'cell-modified' : '';
          const title = isModified ? `title="Original: ${escapeHtml(cleanDataset.modificationsMap.get(`${r.idx}-${cIdx}`).oldVal)}"` : '';
          return `<td class="${modClass}" ${title}>${escapeHtml(cell !== '' ? cell : '<empty>')}</td>`;
        }).join('');
        return `<tr>${cells}</tr>`;
      }).join('');
    }

    cleanPaginationInfo.textContent = totalCount > 0 ? `Showing ${startIdx + 1} to ${endIdx} of ${totalCount.toLocaleString()} cleaned rows` : '0 rows';
    cleanPageNum.textContent = `${tableState.currentPage} / ${totalPages}`;
    btnCleanPrev.disabled = tableState.currentPage <= 1;
    btnCleanNext.disabled = tableState.currentPage >= totalPages;
  }

  // Render Diff Table
  function renderDiffTable() {
    if (cleanDataset.diffsList.length === 0) {
      tbodyDiff.innerHTML = `<tr><td colspan="5" style="text-align: center; color: var(--text-tertiary); padding: 2rem;">No modifications were necessary; data was already clean.</td></tr>`;
      return;
    }

    tbodyDiff.innerHTML = cleanDataset.diffsList.slice(0, 50).map(d => `
      <tr>
        <td style="font-weight:600; color:var(--text-tertiary);">#${d.rowNumber}</td>
        <td style="color:var(--accent); font-weight:600;">${escapeHtml(d.colName)}</td>
        <td style="background: rgba(239, 68, 68, 0.08); font-family: monospace;">${escapeHtml(d.oldVal || '<empty>')}</td>
        <td style="background: rgba(16, 185, 129, 0.08); color: #10b981; font-family: monospace; font-weight:600;">${escapeHtml(d.newVal || '<empty>')}</td>
        <td><span class="badge" style="background: rgba(var(--accent-rgb), 0.15); color: var(--accent); font-size:0.75rem;">${d.reason}</span></td>
      </tr>
    `).join('');
  }

  // Render Duplicates Table
  function renderDuplicatesTable() {
    dupBadgeCount.textContent = `${cleanDataset.duplicatesList.length} Duplicates Identified`;
    theadDups.innerHTML = `<tr><th>Status</th><th>Row</th>` + cleanDataset.headers.map(h => `<th>${escapeHtml(h)}</th>`).join('') + `</tr>`;

    if (cleanDataset.duplicatesList.length === 0) {
      tbodyDups.innerHTML = `<tr><td colspan="${cleanDataset.headers.length + 2}" style="text-align: center; color: var(--text-tertiary); padding: 2rem;">No duplicate rows detected in dataset.</td></tr>`;
      return;
    }

    tbodyDups.innerHTML = cleanDataset.duplicatesList.slice(0, 40).map(d => {
      let cells = `<td><span class="badge-diff ${d.isKept ? 'badge-clean' : 'badge-removed'}">${d.isKept ? 'Preserved' : 'Removed'}</span></td>`;
      cells += `<td style="font-weight:600; color:var(--text-tertiary);">#${d.rowNumber}</td>`;
      cells += d.row.map(c => `<td>${escapeHtml(c)}</td>`).join('');
      return `<tr class="${d.isKept ? '' : 'row-duplicate'}">${cells}</tr>`;
    }).join('');
  }

  // Parsers and Exporters
  function parseTabularData(raw, delimiterMode, hasHeaders) {
    const trimmed = raw.trim();

    // Check JSON
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
        // Fallback
      }
    }

    let delimiter = delimiterMode;
    if (delimiter === 'auto') {
      const sample = trimmed.split(/\r?\n/).slice(0, 5).join('\n');
      const commas = (sample.match(/,/g) || []).length;
      const tabs = (sample.match(/\t/g) || []).length;
      const semis = (sample.match(/;/g) || []).length;
      const pipes = (sample.match(/\|/g) || []).length;
      if (tabs >= commas && tabs >= semis && tabs >= pipes && tabs > 0) delimiter = '\t';
      else if (semis > commas && semis > pipes && semis > 0) delimiter = ';';
      else if (pipes > commas && pipes > semis && pipes > 0) delimiter = '|';
      else delimiter = ',';
    }

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
          i++;
        } else {
          insideQuotes = !insideQuotes;
        }
      } else if (char === delimiter && !insideQuotes) {
        currentRow.push(currentCell.trim());
        currentCell = '';
      } else if ((char === '\r' || char === '\n') && !insideQuotes) {
        if (char === '\r' && nextChar === '\n') i++;
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

  function exportCleanCsv() {
    const delim = selectExportDelimiter.value;
    let csv = cleanDataset.headers.map(h => `"${h.replace(/"/g, '""')}"`).join(delim) + '\n';
    cleanDataset.rows.forEach(r => {
      csv += r.map(c => `"${String(c).replace(/"/g, '""')}"`).join(delim) + '\n';
    });
    downloadFile(csv, 'cleaned_dataset.csv', 'text/csv;charset=utf-8;');
  }

  function exportCleanJson() {
    const jsonArr = cleanDataset.rows.map(row => {
      const obj = {};
      cleanDataset.headers.forEach((h, i) => {
        obj[h] = row[i];
      });
      return obj;
    });
    const str = JSON.stringify(jsonArr, null, 2);
    downloadFile(str, 'cleaned_dataset.json', 'application/json;charset=utf-8;');
  }

  function copyCleanData() {
    const delim = selectExportDelimiter.value;
    let text = cleanDataset.headers.map(h => `"${h.replace(/"/g, '""')}"`).join(delim) + '\n';
    cleanDataset.rows.forEach(r => {
      text += r.map(c => `"${String(c).replace(/"/g, '""')}"`).join(delim) + '\n';
    });

    navigator.clipboard.writeText(text).then(() => {
      const orig = btnCopyClean.textContent;
      btnCopyClean.textContent = 'Copied!';
      btnCopyClean.classList.add('copied');
      setTimeout(() => {
        btnCopyClean.textContent = orig;
        btnCopyClean.classList.remove('copied');
      }, 2000);
    });
  }

  function downloadFile(content, filename, type) {
    const blob = new Blob([content], { type });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
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