// Data Profiler - In-Depth Column Profiling Matrix & Schema Inference Engine
document.addEventListener('DOMContentLoaded', () => {
  // Elements
  const profilerRawInput = document.getElementById('profiler-raw-input');
  const profilerDropZone = document.getElementById('profiler-drop-zone');
  const profilerFileInput = document.getElementById('profiler-file-input');
  const selectProfilerDelimiter = document.getElementById('select-profiler-delimiter');
  const chkProfilerHeaders = document.getElementById('chk-profiler-headers');
  const btnProfileData = document.getElementById('btn-profile-data');
  const btnClearProfiler = document.getElementById('btn-clear-profiler');
  const presetButtons = document.querySelectorAll('.preset-btn');

  // Results Section Elements
  const profilerResultsSection = document.getElementById('profiler-results-section');
  const profKpiRows = document.getElementById('prof-kpi-rows');
  const profKpiCols = document.getElementById('prof-kpi-cols');
  const profKpiCompleteness = document.getElementById('prof-kpi-completeness');
  const profKpiDups = document.getElementById('prof-kpi-dups');
  const profKpiMemory = document.getElementById('prof-kpi-memory');
  const schemaCompositionPills = document.getElementById('schema-composition-pills');

  // Matrix Table & Filters
  const profilerMatrixTable = document.getElementById('profiler-matrix-table');
  const profilerMatrixTbody = document.getElementById('profiler-matrix-tbody');
  const filterColumnName = document.getElementById('filter-column-name');
  const filterColumnType = document.getElementById('filter-column-type');
  const btnExportProfileCsv = document.getElementById('btn-export-profile-csv');
  const btnCopyProfile = document.getElementById('btn-copy-profile');

  // Modal Elements
  const inspectorModal = document.getElementById('inspector-modal');
  const btnCloseModal = document.getElementById('btn-close-modal');
  const modalColTitle = document.getElementById('modal-col-title');
  const modalColSubtitle = document.getElementById('modal-col-subtitle');
  const modalBodyContent = document.getElementById('modal-body-content');

  // State
  let dataset = {
    headers: [],
    rows: [],
    columnsProfile: [],
    datasetOverview: {}
  };

  // Sample Presets Data
  const PROFILER_PRESETS = {
    financial: `InvoiceID,ClientName,Country,IssueDate,DueDate,AmountUSD,TaxRate,IsPaid,PaymentMethod,Notes
INV-2024-001,Acme Global,United States,2024-01-15,2024-02-15,$12450.00,0.08,true,Wire Transfer,Net 30 terms applied
INV-2024-002,Zenith Logistics,Germany,2024-01-18,2024-02-18,$4850.50,0.19,true,Credit Card,Expedited processing fee included
INV-2024-003,Starlight Media,Canada,2024-01-20,2024-02-20,$8920.00,0.13,false,Pending,Awaiting client AP authorization
INV-2024-004,BlueWave Corp,United Kingdom,2024-01-22,2024-02-22,$15600.00,0.20,true,Wire Transfer,Annual enterprise subscription
INV-2024-005,Nexus Dynamics,Australia,2024-01-25,2024-02-25,$3400.75,0.10,false,Pending,Discount 5% applied
INV-2024-006,Summit Corp,United States,2024-01-28,2024-02-28,$22500.00,0.08,true,Wire Transfer,Custom integration phase 1
INV-2024-007,Horizon Tech,Japan,2024-02-01,2024-03-01,$7100.00,0.10,,Credit Card,
INV-2024-008,Alpha Logistics,United States,2024-02-05,2024-03-05,$6450.25,0.08,true,ACH,Quarterly billing cycle
INV-2024-009,Pinnacle Systems,Germany,2024-02-08,2024-03-08,$18900.00,0.19,false,Wire Transfer,Dispute regarding line item 3
INV-2024-010,Global Pulse,France,2024-02-10,2024-03-10,$5200.00,0.20,true,Credit Card,Auto-renew payment successful
INV-2024-011,Titan Ventures,Singapore,2024-02-12,2024-03-12,$9800.50,0.07,true,Wire Transfer,Multi-currency settlement
INV-2024-012,Vanguard Co,United States,2024-02-15,2024-03-15,$11250.00,0.08,false,ACH,Pending ACH verification`,

    saas: `UserID,WorkspaceID,PlanTier,MonthlyActiveDays,StorageGB,LicenseSeats,AvgSessionDurationMin,AccountCreated,IsEnterpriseAdmin,NPSRating
USR-8801,WS-101,Pro,22,45.2,10,38.5,2023-04-12,false,9
USR-8802,WS-102,Enterprise,28,450.0,150,65.2,2022-11-05,true,10
USR-8803,WS-103,Free,8,1.5,1,14.8,2024-01-20,false,7
USR-8804,WS-104,Team,18,85.6,25,42.0,2023-08-15,false,8
USR-8805,WS-102,Enterprise,25,320.4,150,55.0,2022-11-08,false,9
USR-8806,WS-105,Pro,19,38.9,8,29.4,2023-06-30,false,8
USR-8807,WS-106,Free,4,0.8,1,9.5,2024-02-01,false,6
USR-8808,WS-107,Team,21,110.2,30,48.6,2023-09-12,false,
USR-8809,WS-108,Enterprise,30,890.5,250,78.4,2022-05-18,true,10
USR-8810,WS-109,Pro,16,28.0,5,33.1,2023-12-04,false,8
USR-8811,WS-110,Free,2,0.2,1,6.0,2024-02-10,false,5
USR-8812,WS-102,Enterprise,27,512.0,150,62.1,2022-11-10,false,9`,

    clinical: `PatientRecordID,SubjectAge,BiologicalSex,BloodGroup,SystolicBP,DiastolicBP,SerumCholesterol,IsSmoker,AdmissionDate,DischargeDisposition
PT-9001,48,Male,O+,124,82,195.4,false,2024-01-05,Routine Home
PT-9002,64,Female,A+,152,94,242.0,true,2024-01-08,Transferred to Rehab
PT-9003,31,Female,B-,116,74,168.5,false,2024-01-10,Routine Home
PT-9004,78,Male,O-,168,102,285.0,true,2024-01-12,Extended Care
PT-9005,55,Male,AB+,138,88,215.2,false,2024-01-15,Routine Home
PT-9006,42,Female,A-,120,78,182.0,false,2024-01-18,Routine Home
PT-9007,82,Female,O+,175,108,310.8,false,2024-01-20,Extended Care
PT-9008,39,Male,B+,128,84,199.0,true,2024-01-22,Routine Home
PT-9009,61,Male,A+,146,90,230.5,,2024-01-25,Routine Home
PT-9010,27,Female,O+,112,70,154.0,false,2024-01-28,Routine Home
PT-9011,73,Male,AB-,160,96,268.4,true,2024-01-30,Transferred to Rehab
PT-9012,50,Female,A+,132,85,208.0,false,2024-02-02,Routine Home`
  };

  // Preset Handlers
  presetButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const presetKey = btn.getAttribute('data-preset');
      if (PROFILER_PRESETS[presetKey]) {
        profilerRawInput.value = PROFILER_PRESETS[presetKey];
        selectProfilerDelimiter.value = ',';
        chkProfilerHeaders.checked = true;
        profileDataset();
      }
    });
  });

  btnClearProfiler.addEventListener('click', () => {
    profilerRawInput.value = '';
    profilerResultsSection.style.display = 'none';
    dataset = { headers: [], rows: [], columnsProfile: [], datasetOverview: {} };
  });

  btnProfileData.addEventListener('click', () => profileDataset());

  // Filter Listeners
  filterColumnName.addEventListener('input', () => renderProfilingMatrix());
  filterColumnType.addEventListener('change', () => renderProfilingMatrix());

  // Export handlers
  btnExportProfileCsv.addEventListener('click', () => exportProfileCsv());
  btnCopyProfile.addEventListener('click', () => copyProfileSummary());

  // Modal Close
  btnCloseModal.addEventListener('click', () => inspectorModal.style.display = 'none');
  inspectorModal.addEventListener('click', (e) => {
    if (e.target === inspectorModal) inspectorModal.style.display = 'none';
  });

  // Drag and Drop
  profilerDropZone.addEventListener('click', () => profilerFileInput.click());
  profilerDropZone.addEventListener('dragover', (e) => {
    e.preventDefault();
    profilerDropZone.classList.add('dragover');
  });
  profilerDropZone.addEventListener('dragleave', () => profilerDropZone.classList.remove('dragover'));
  profilerDropZone.addEventListener('drop', (e) => {
    e.preventDefault();
    profilerDropZone.classList.remove('dragover');
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleProfilerFile(e.dataTransfer.files[0]);
    }
  });

  profilerFileInput.addEventListener('change', () => {
    if (profilerFileInput.files && profilerFileInput.files.length > 0) {
      handleProfilerFile(profilerFileInput.files[0]);
    }
  });

  function handleProfilerFile(file) {
    const reader = new FileReader();
    reader.onload = (e) => {
      profilerRawInput.value = e.target.result;
      profileDataset();
    };
    reader.readAsText(file);
  }

  // Core Profiling Controller
  function profileDataset() {
    const text = profilerRawInput.value.trim();
    if (!text) {
      alert('Please provide dataset content to profile.');
      return;
    }

    try {
      const parsed = parseTabularData(text, selectProfilerDelimiter.value, chkProfilerHeaders.checked);
      if (!parsed || parsed.rows.length === 0) {
        alert('Could not parse any records.');
        return;
      }

      dataset.headers = parsed.headers;
      dataset.rows = parsed.rows;

      runColumnProfiling();
      renderDatasetKPIs();
      renderProfilingMatrix();

      profilerResultsSection.style.display = 'flex';
      profilerResultsSection.scrollIntoView({ behavior: 'smooth' });
    } catch (err) {
      console.error(err);
      alert('Error profiling dataset: ' + err.message);
    }
  }

  // Column Profiling Engine & Type Inference
  function runColumnProfiling() {
    const numRows = dataset.rows.length;
    let totalCells = 0;
    let totalMissingCells = 0;
    let totalMemoryBytes = 0;
    const typeCounts = {};

    dataset.columnsProfile = dataset.headers.map((header, colIdx) => {
      const rawValues = dataset.rows.map(r => r[colIdx]);
      let nullCount = 0;
      let validValues = [];
      let minLen = Infinity;
      let maxLen = 0;
      let colBytes = 0;
      const freqMap = {};

      rawValues.forEach(val => {
        totalCells++;
        const strVal = val !== undefined && val !== null ? String(val) : '';
        const trimmed = strVal.trim();
        const charLen = trimmed.length;

        if (trimmed === '') {
          nullCount++;
          totalMissingCells++;
        } else {
          validValues.push(trimmed);
          minLen = Math.min(minLen, charLen);
          maxLen = Math.max(maxLen, charLen);
          freqMap[trimmed] = (freqMap[trimmed] || 0) + 1;
        }

        // Memory estimate (UTF-8 encoding approx: ~1 byte per ASCII, 2-3 for unicode)
        const cellBytes = new Blob([strVal]).size;
        colBytes += cellBytes;
      });

      if (minLen === Infinity) minLen = 0;
      totalMemoryBytes += colBytes;

      const nonNullCount = numRows - nullCount;
      const nullPct = numRows > 0 ? (nullCount / numRows) * 100 : 0;
      const distinctCount = Object.keys(freqMap).length;
      const cardinalityRatio = nonNullCount > 0 ? (distinctCount / nonNullCount) : 0;

      // Incur data type inference
      const inferred = inferDataType(validValues, distinctCount, nonNullCount);
      typeCounts[inferred.type] = (typeCounts[inferred.type] || 0) + 1;

      // Cardinality Classification
      let cardBadgeClass = 'card-medium';
      let cardLabel = 'Medium';
      if (distinctCount === 1) {
        cardBadgeClass = 'card-constant';
        cardLabel = 'Constant';
      } else if (cardinalityRatio === 1.0) {
        cardBadgeClass = 'card-key';
        cardLabel = 'Unique Key';
      } else if (cardinalityRatio >= 0.5) {
        cardBadgeClass = 'card-high';
        cardLabel = 'High';
      } else if (cardinalityRatio < 0.15 || distinctCount <= 10) {
        cardBadgeClass = 'card-low';
        cardLabel = 'Low / Categorical';
      }

      // Top frequencies
      const topFrequencies = Object.entries(freqMap)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10)
        .map(([val, count]) => ({
          value: val,
          count,
          percentage: ((count / (nonNullCount || 1)) * 100).toFixed(1)
        }));

      // Numeric stats if applicable
      let numericStats = null;
      if (inferred.type === 'Integer' || inferred.type === 'Float' || inferred.type === 'Currency') {
        const nums = validValues.map(v => parseFloat(v.replace(/^[$\u20AC\u00A3\u00A5]/, '').replace(/,/g, ''))).filter(n => !isNaN(n));
        if (nums.length > 0) {
          nums.sort((a, b) => a - b);
          const sum = nums.reduce((a, b) => a + b, 0);
          const min = nums[0];
          const max = nums[nums.length - 1];
          const mean = sum / nums.length;
          const mid = Math.floor(nums.length / 2);
          const median = nums.length % 2 === 0 ? (nums[mid - 1] + nums[mid]) / 2 : nums[mid];
          numericStats = { min, max, mean, median, count: nums.length };
        }
      }

      return {
        name: header,
        index: colIdx,
        type: inferred.type,
        confidence: inferred.confidence,
        typeDetails: inferred.details,
        totalCount: numRows,
        nonNullCount,
        nullCount,
        nullPct: Number(nullPct.toFixed(1)),
        distinctCount,
        cardinalityRatio: Number((cardinalityRatio * 100).toFixed(1)),
        cardBadgeClass,
        cardLabel,
        minLen,
        maxLen,
        memoryBytes: colBytes,
        topFrequencies,
        frequencyMap: freqMap,
        numericStats,
        validValuesSample: validValues.slice(0, 5)
      };
    });

    // Check duplicate rows
    const rowSigs = new Set();
    let dupRows = 0;
    dataset.rows.forEach(r => {
      const sig = r.join('|||');
      if (rowSigs.has(sig)) dupRows++;
      else rowSigs.add(sig);
    });

    const completenessPct = totalCells > 0 ? ((totalCells - totalMissingCells) / totalCells) * 100 : 100;

    dataset.datasetOverview = {
      totalRows: numRows,
      totalCols: dataset.headers.length,
      completeness: Number(completenessPct.toFixed(1)),
      duplicateRows: dupRows,
      totalMemoryBytes,
      typeCounts
    };
  }

  // Automatic Data Type Inference Logic
  function inferDataType(validValues, distinctCount, nonNullCount) {
    if (validValues.length === 0) {
      return { type: 'Free Text', confidence: '0%', details: 'All values empty or null' };
    }

    let intMatches = 0;
    let floatMatches = 0;
    let currMatches = 0;
    let boolMatches = 0;
    let dateMatches = 0;

    const boolSet = new Set(['true', 'false', 'yes', 'no', 'y', 'n', '1', '0']);
    const dateRegexes = [
      /^\d{4}-\d{2}-\d{2}(?:[T\s]\d{2}:\d{2}(?::\d{2})?)?$/, // ISO
      /^\d{1,2}\/\d{1,2}\/\d{4}$/,                           // US / UK MM/DD/YYYY
      /^\d{1,2}-\d{1,2}-\d{4}$/                            // DD-MM-YYYY
    ];

    validValues.forEach(val => {
      // 1. Boolean check
      if (boolSet.has(val.toLowerCase())) {
        boolMatches++;
      }

      // 2. Currency check ($1,200.50, €50, etc.)
      if (/^[$€£¥₹]\s?-?\d+(?:,\d{3})*(?:\.\d+)?$/.test(val) || /^-?\d+(?:,\d{3})*(?:\.\d+)?\s?[$€£¥₹]$/.test(val)) {
        currMatches++;
      }

      // 3. Integer check
      if (/^-?\d+$/.test(val)) {
        intMatches++;
      }

      // 4. Float check
      if (/^-?\d+(?:\.\d+)$/.test(val)) {
        floatMatches++;
      }

      // 5. Date check
      if (dateRegexes.some(r => r.test(val))) {
        dateMatches++;
      } else {
        // Fallback Date.parse for valid date strings
        const parsed = Date.parse(val);
        if (!isNaN(parsed) && val.length >= 8 && /[/-]/.test(val)) {
          const yr = new Date(parsed).getFullYear();
          if (yr >= 1950 && yr <= 2080) {
            dateMatches++;
          }
        }
      }
    });

    const N = validValues.length;
    const threshold = 0.85; // 85% of non-null values must conform

    if (boolMatches / N >= threshold && distinctCount <= 4) {
      return { type: 'Boolean', confidence: `${Math.round((boolMatches / N) * 100)}%`, details: 'Boolean flags (true/false/yes/no)' };
    }

    if (currMatches / N >= threshold) {
      return { type: 'Currency', confidence: `${Math.round((currMatches / N) * 100)}%`, details: 'Monetary currency values' };
    }

    if (dateMatches / N >= threshold) {
      return { type: 'Date', confidence: `${Math.round((dateMatches / N) * 100)}%`, details: 'Date / timestamp records' };
    }

    if (intMatches / N >= threshold) {
      return { type: 'Integer', confidence: `${Math.round((intMatches / N) * 100)}%`, details: 'Whole numeric integers' };
    }

    if ((intMatches + floatMatches) / N >= threshold) {
      return { type: 'Float', confidence: `${Math.round(((intMatches + floatMatches) / N) * 100)}%`, details: 'Floating point decimals' };
    }

    // Categorical vs Free Text
    const cardinalityRatio = distinctCount / nonNullCount;
    if (distinctCount <= 25 && cardinalityRatio <= 0.35) {
      return { type: 'Categorical', confidence: `${Math.round((1 - cardinalityRatio) * 100)}%`, details: `Discrete categories (${distinctCount} unique)` };
    }

    // Average length check for Free text vs Short Identifier
    const avgLen = validValues.reduce((a, b) => a + b.length, 0) / N;
    if (avgLen > 25 || validValues.some(v => v.includes(' ') && v.length > 35)) {
      return { type: 'Free Text', confidence: 'High', details: 'Unstructured text / descriptions' };
    }

    return { type: 'Categorical', confidence: 'Moderate', details: `Nominal values (${distinctCount} unique)` };
  }

  // Render Dataset Level Summary & KPI
  function renderDatasetKPIs() {
    const o = dataset.datasetOverview;
    profKpiRows.textContent = o.totalRows.toLocaleString();
    profKpiCols.textContent = o.totalCols.toLocaleString();
    profKpiCompleteness.textContent = `${o.completeness}%`;
    profKpiDups.textContent = o.duplicateRows.toLocaleString();
    profKpiMemory.textContent = formatBytes(o.totalMemoryBytes);

    // Schema composition pills
    schemaCompositionPills.innerHTML = Object.entries(o.typeCounts).map(([type, count]) => {
      const cls = getTypeClass(type);
      return `<span class="type-pill ${cls}">${count} ${type}</span>`;
    }).join('');
  }

  // Render Matrix Table
  function renderProfilingMatrix() {
    const nameFilter = filterColumnName.value.toLowerCase().trim();
    const typeFilter = filterColumnType.value;

    const filtered = dataset.columnsProfile.filter(col => {
      const matchesName = !nameFilter || col.name.toLowerCase().includes(nameFilter);
      const matchesType = typeFilter === 'all' || col.type === typeFilter;
      return matchesName && matchesType;
    });

    if (filtered.length === 0) {
      profilerMatrixTbody.innerHTML = `<tr><td colspan="8" style="text-align: center; color: var(--text-tertiary); padding: 2rem;">No columns match filter criteria.</td></tr>`;
      return;
    }

    profilerMatrixTbody.innerHTML = filtered.map(col => {
      const typeClass = getTypeClass(col.type);
      const nullBarColor = col.nullPct > 20 ? '#ef4444' : (col.nullPct > 5 ? '#f59e0b' : '#10b981');
      
      // Mini distribution preview
      const distMini = renderInlineDistribution(col);

      return `
        <tr>
          <td>
            <div style="font-weight: 700; color: var(--text-primary);">${escapeHtml(col.name)}</div>
            <div style="font-size: 0.72rem; color: var(--text-tertiary);">Col #${col.index + 1}</div>
          </td>
          <td>
            <span class="type-pill ${typeClass}">${col.type}</span>
          </td>
          <td>
            <div class="null-meter">
              <div style="display: flex; justify-content: space-between; font-size: 0.75rem;">
                <span style="color: ${col.nullCount > 0 ? '#f59e0b' : 'var(--text-tertiary)'};">${col.nullCount} nulls</span>
                <span style="font-weight: 600;">${col.nullPct}%</span>
              </div>
              <div class="null-bar-track">
                <div class="null-bar-fill" style="width: ${col.nullPct}%; background: ${nullBarColor};"></div>
              </div>
            </div>
          </td>
          <td>
            <div style="display: flex; align-items: center; gap: 0.4rem;">
              <span style="font-weight: 600; color: var(--text-primary);">${col.distinctCount.toLocaleString()}</span>
              <span class="cardinality-badge ${col.cardBadgeClass}">${col.cardLabel}</span>
            </div>
            <div style="font-size: 0.72rem; color: var(--text-tertiary);">${col.cardinalityRatio}% ratio</div>
          </td>
          <td>
            <div style="font-size: 0.8rem; font-weight: 600; color: var(--text-primary);">${col.minLen} - ${col.maxLen} chars</div>
            <div style="font-size: 0.72rem; color: var(--text-tertiary);">${col.numericStats ? `[${formatShort(col.numericStats.min)}, ${formatShort(col.numericStats.max)}]` : 'length span'}</div>
          </td>
          <td>
            <div style="font-size: 0.8rem; font-weight: 600;">${formatBytes(col.memoryBytes)}</div>
          </td>
          <td>
            ${distMini}
          </td>
          <td>
            <button type="button" class="btn btn-secondary btn-inspect-col" data-col-index="${col.index}" style="padding: 0.3rem 0.65rem; font-size: 0.75rem;">
              Inspect
            </button>
          </td>
        </tr>
      `;
    }).join('');

    // Attach inspect buttons
    document.querySelectorAll('.btn-inspect-col').forEach(btn => {
      btn.addEventListener('click', () => {
        const idx = parseInt(btn.getAttribute('data-col-index'), 10);
        openColumnInspector(idx);
      });
    });
  }

  function renderInlineDistribution(col) {
    if (col.topFrequencies.length === 0) {
      return `<span style="font-size:0.75rem; color:var(--text-tertiary);">&lt;all empty&gt;</span>`;
    }

    const colors = ['#3b82f6', '#10b981', '#f59e0b', '#ec4899', '#8b5cf6'];
    const segments = col.topFrequencies.slice(0, 4);
    
    let segmentsHtml = '';
    segments.forEach((seg, i) => {
      const c = colors[i % colors.length];
      segmentsHtml += `
        <div class="dist-segment" style="width: ${seg.percentage}%; background: ${c};" title="${escapeHtml(seg.value)}: ${seg.count} (${seg.percentage}%)"></div>
      `;
    });

    return `
      <div style="display: flex; flex-direction: column; gap: 0.25rem;">
        <div class="mini-dist-bar">${segmentsHtml}</div>
        <div style="font-size: 0.7rem; color: var(--text-tertiary); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 130px;">
          Top: ${escapeHtml(segments[0].value || '(empty)')}
        </div>
      </div>
    `;
  }

  // Deep Dive Column Inspector Modal
  function openColumnInspector(colIdx) {
    const col = dataset.columnsProfile[colIdx];
    if (!col) return;

    modalColTitle.textContent = `${col.name} — Column Profile Deep Dive`;
    modalColSubtitle.textContent = `Inferred Type: ${col.type} (${col.confidence}) | ${col.typeDetails}`;

    let statsContent = '';
    if (col.numericStats) {
      statsContent = `
        <div class="kpi-grid" style="grid-template-columns: repeat(4, 1fr);">
          <div class="kpi-card" style="padding:0.75rem;"><span class="kpi-value" style="font-size:1.2rem;">${formatShort(col.numericStats.min)}</span><span class="kpi-label">Minimum</span></div>
          <div class="kpi-card" style="padding:0.75rem;"><span class="kpi-value" style="font-size:1.2rem;">${formatShort(col.numericStats.max)}</span><span class="kpi-label">Maximum</span></div>
          <div class="kpi-card" style="padding:0.75rem;"><span class="kpi-value" style="font-size:1.2rem;">${formatShort(col.numericStats.mean)}</span><span class="kpi-label">Mean</span></div>
          <div class="kpi-card" style="padding:0.75rem;"><span class="kpi-value" style="font-size:1.2rem;">${formatShort(col.numericStats.median)}</span><span class="kpi-label">Median</span></div>
        </div>
      `;
    }

    // Frequency Table
    const freqTableHtml = `
      <div style="margin-top: 0.5rem;">
        <h4 style="font-size: 0.95rem; margin-bottom: 0.5rem; font-weight: 700;">Top Distinct Frequencies & Occurrences</h4>
        <div class="matrix-wrapper" style="max-height: 250px;">
          <table class="matrix-table">
            <thead>
              <tr>
                <th>Value</th>
                <th>Frequency</th>
                <th>Share %</th>
                <th>Distribution Bar</th>
              </tr>
            </thead>
            <tbody>
              ${col.topFrequencies.map(f => `
                <tr>
                  <td style="font-weight: 600; color: var(--text-primary);">${escapeHtml(f.value || '<empty>')}</td>
                  <td>${f.count.toLocaleString()}</td>
                  <td>${f.percentage}%</td>
                  <td style="min-width: 140px;">
                    <div style="height: 6px; background: var(--bg-secondary); border-radius: 999px; overflow: hidden;">
                      <div style="width: ${f.percentage}%; height: 100%; background: var(--accent);"></div>
                    </div>
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>
    `;

    // Metadata List
    const metaList = `
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 0.75rem; background: var(--bg-tertiary); padding: 1rem; border-radius: var(--radius-md); font-size: 0.825rem;">
        <div><strong style="color:var(--text-primary);">Total Count:</strong> ${col.totalCount.toLocaleString()}</div>
        <div><strong style="color:var(--text-primary);">Non-Null Count:</strong> ${col.nonNullCount.toLocaleString()}</div>
        <div><strong style="color:var(--text-primary);">Null Count:</strong> ${col.nullCount.toLocaleString()} (${col.nullPct}%)</div>
        <div><strong style="color:var(--text-primary);">Distinct Cardinality:</strong> ${col.distinctCount.toLocaleString()} (${col.cardinalityRatio}%)</div>
        <div><strong style="color:var(--text-primary);">Character Length Range:</strong> ${col.minLen} to ${col.maxLen} chars</div>
        <div><strong style="color:var(--text-primary);">Estimated Memory:</strong> ${formatBytes(col.memoryBytes)}</div>
      </div>
    `;

    modalBodyContent.innerHTML = metaList + statsContent + freqTableHtml;
    inspectorModal.style.display = 'flex';
  }

  // Export functions
  function exportProfileCsv() {
    let csv = `Column Name,Inferred Type,Confidence,Total Rows,Non-Null,Null Count,Null Pct,Distinct Count,Cardinality Ratio,Min Length,Max Length,Memory Bytes\n`;
    dataset.columnsProfile.forEach(c => {
      csv += `"${c.name.replace(/"/g, '""')}","${c.type}","${c.confidence}",${c.totalCount},${c.nonNullCount},${c.nullCount},${c.nullPct}%,${c.distinctCount},${c.cardinalityRatio}%,${c.minLen},${c.maxLen},${c.memoryBytes}\n`;
    });
    downloadBlob(csv, 'data_profiler_matrix.csv', 'text/csv;charset=utf-8;');
  }

  function copyProfileSummary() {
    const o = dataset.datasetOverview;
    let txt = `DATA PROFILER SUMMARY REPORT\n`;
    txt += `Total Rows: ${o.totalRows} | Total Columns: ${o.totalCols}\n`;
    txt += `Completeness: ${o.completeness}% | Duplicate Rows: ${o.duplicateRows} | Memory: ${formatBytes(o.totalMemoryBytes)}\n\n`;
    txt += `COLUMNS PROFILE:\n`;
    dataset.columnsProfile.forEach(c => {
      txt += `- ${c.name} [${c.type}]: ${c.nonNullCount}/${c.totalCount} non-null (${c.nullPct}% nulls), ${c.distinctCount} distinct (${c.cardinalityRatio}%), Len: ${c.minLen}-${c.maxLen}\n`;
    });

    navigator.clipboard.writeText(txt).then(() => {
      const orig = btnCopyProfile.textContent;
      btnCopyProfile.textContent = 'Copied!';
      btnCopyProfile.classList.add('copied');
      setTimeout(() => {
        btnCopyProfile.textContent = orig;
        btnCopyProfile.classList.remove('copied');
      }, 2000);
    });
  }

  // Helper parsers & utilities
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

  function getTypeClass(type) {
    switch (type) {
      case 'Integer': return 'type-integer';
      case 'Float': return 'type-float';
      case 'Currency': return 'type-currency';
      case 'Date': return 'type-date';
      case 'Boolean': return 'type-boolean';
      case 'Categorical': return 'type-categorical';
      default: return 'type-text';
    }
  }

  function formatBytes(bytes) {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  }

  function formatShort(val) {
    if (val === undefined || val === null || isNaN(val)) return '-';
    if (Math.abs(val) >= 1000) return Number(val.toFixed(1)).toLocaleString();
    return Number(val.toFixed(2)).toString();
  }

  function downloadBlob(content, filename, type) {
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