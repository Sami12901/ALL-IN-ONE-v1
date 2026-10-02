// Excel Data Typing Practice - Client-side Logic

const DATA_CATALOG = {
  inventory: [
    { id: "1001", name: "Logitech MX Master 3S", sku: "LOG-3921", qty: "15", price: "99.99", date: "2025-01-14", status: "In Stock" },
    { id: "1002", name: "Keychron K2 Wireless", sku: "KEY-2084", qty: "8", price: "79.00", date: "2025-01-18", status: "Low Stock" },
    { id: "1003", name: "Dell UltraSharp 27\"", sku: "MON-7714", qty: "24", price: "349.50", date: "2025-01-22", status: "In Stock" },
    { id: "1004", name: "Anker 737 PowerBank", sku: "ANK-8820", qty: "50", price: "149.99", date: "2025-01-25", status: "In Stock" },
    { id: "1005", name: "Sony WH-1000XM5", sku: "SON-1102", qty: "6", price: "399.00", date: "2025-01-29", status: "Low Stock" },
    { id: "1006", name: "Apple Magic Trackpad", sku: "APP-9034", qty: "12", price: "129.00", date: "2025-02-02", status: "In Stock" },
    { id: "1007", name: "Samsung T7 Shield 1TB", sku: "SAM-5519", qty: "35", price: "89.95", date: "2025-02-08", status: "In Stock" },
    { id: "1008", name: "Elgato Stream Deck MK.2", sku: "ELG-3012", qty: "18", price: "149.99", date: "2025-02-12", status: "In Stock" },
    { id: "1009", name: "CalDigit TS4 Dock", sku: "CAL-8190", qty: "4", price: "399.95", date: "2025-02-16", status: "Reordered" },
    { id: "1010", name: "Shure MV7 Microphone", sku: "SHU-4401", qty: "10", price: "249.00", date: "2025-02-20", status: "In Stock" },
    { id: "1011", name: "BenQ ScreenBar Halo", sku: "BNQ-6120", qty: "22", price: "179.00", date: "2025-02-24", status: "In Stock" },
    { id: "1012", name: "Herman Miller Embody", sku: "HML-9910", qty: "3", price: "1695.00", date: "2025-02-28", status: "Low Stock" },
    { id: "1013", name: "ASUS ROG Swift OLED", sku: "ASU-5041", qty: "7", price: "899.99", date: "2025-03-03", status: "In Stock" },
    { id: "1014", name: "Razer BlackShark V2", sku: "RZR-2234", qty: "40", price: "59.99", date: "2025-03-07", status: "In Stock" },
    { id: "1015", name: "SanDisk Extreme 2TB", sku: "SND-7811", qty: "19", price: "149.50", date: "2025-03-11", status: "In Stock" },
    { id: "1016", name: "Ubiquiti UniFi U6-Pro", sku: "UBI-4109", qty: "14", price: "159.00", date: "2025-03-15", status: "In Stock" },
    { id: "1017", name: "Synology DS923+ NAS", sku: "SYN-8022", qty: "5", price: "599.99", date: "2025-03-19", status: "Reordered" },
    { id: "1018", name: "Corsair RM850x PSU", sku: "COR-3310", qty: "28", price: "139.99", date: "2025-03-23", status: "In Stock" },
    { id: "1019", name: "Noctua NH-D15 Chromax", sku: "NOC-1092", qty: "16", price: "119.95", date: "2025-03-27", status: "In Stock" },
    { id: "1020", name: "Belkin 3-in-1 MagSafe", sku: "BLK-6604", qty: "30", price: "149.99", date: "2025-03-31", status: "In Stock" }
  ],
  sales: [
    { id: "4001", name: "Apex Tech Solutions", sku: "INV-5011", qty: "10", price: "1250.00", date: "2025-04-02", status: "Paid" },
    { id: "4002", name: "Nexus Global Media", sku: "INV-5012", qty: "4", price: "450.50", date: "2025-04-05", status: "Pending" },
    { id: "4003", name: "Vanguard Logistics", sku: "INV-5013", qty: "25", price: "3200.00", date: "2025-04-09", status: "Paid" },
    { id: "4004", name: "Beacon Health Systems", sku: "INV-5014", qty: "8", price: "890.00", date: "2025-04-12", status: "Processing" },
    { id: "4005", name: "Quantum Cloud Corp", sku: "INV-5015", qty: "50", price: "5400.00", date: "2025-04-16", status: "Paid" },
    { id: "4006", name: "Summit Retail Inc", sku: "INV-5016", qty: "15", price: "780.25", date: "2025-04-20", status: "Pending" },
    { id: "4007", name: "Aegis Cyber Defense", sku: "INV-5017", qty: "6", price: "2150.00", date: "2025-04-24", status: "Paid" },
    { id: "4008", name: "Cobalt Analytics", sku: "INV-5018", qty: "12", price: "1680.00", date: "2025-04-28", status: "Paid" },
    { id: "4009", name: "Horizon Solar Energy", sku: "INV-5019", qty: "30", price: "4100.50", date: "2025-05-02", status: "Overdue" },
    { id: "4010", name: "Pinnacle Architecture", sku: "INV-5020", qty: "3", price: "950.00", date: "2025-05-06", status: "Paid" },
    { id: "4011", name: "Atlas BioSciences", sku: "INV-5021", qty: "18", price: "2890.00", date: "2025-05-10", status: "Processing" },
    { id: "4012", name: "Crestview Media Lab", sku: "INV-5022", qty: "7", price: "640.00", date: "2025-05-14", status: "Paid" }
  ],
  payroll: [
    { id: "801", name: "Sarah Jenkins", sku: "ENG-L4", qty: "40", price: "65.00", date: "2025-05-15", status: "Approved" },
    { id: "802", name: "David Chen", sku: "DES-L3", qty: "38", price: "48.50", date: "2025-05-15", status: "Approved" },
    { id: "803", name: "Elena Rostova", sku: "OPS-L2", qty: "40", price: "32.00", date: "2025-05-15", status: "Submitted" },
    { id: "804", name: "Marcus Brody", sku: "MGT-L5", qty: "45", price: "85.00", date: "2025-05-15", status: "Approved" },
    { id: "805", name: "Amina Al-Mansoor", sku: "FIN-L4", qty: "42", price: "58.00", date: "2025-05-15", status: "Audited" },
    { id: "806", name: "Liam O'Connor", sku: "SAL-L3", qty: "35", price: "40.00", date: "2025-05-15", status: "Approved" },
    { id: "807", name: "Chloe Dupont", sku: "HR-L2", qty: "40", price: "34.50", date: "2025-05-15", status: "Approved" },
    { id: "808", name: "Kenji Sato", sku: "SEC-L4", qty: "40", price: "72.00", date: "2025-05-15", status: "Review" },
    { id: "809", name: "Maya Patel", sku: "PRD-L3", qty: "39", price: "52.00", date: "2025-05-15", status: "Approved" },
    { id: "810", name: "Lucas Vance", sku: "QA-L2", qty: "40", price: "30.00", date: "2025-05-15", status: "Submitted" }
  ]
};

const COLUMN_KEYS = ['id', 'name', 'sku', 'qty', 'price', 'date', 'status'];
const COLUMN_LETTERS = ['B', 'C', 'D', 'E', 'F', 'G', 'H'];

document.addEventListener('DOMContentLoaded', () => {
  // DOM Elements
  const batchButtons = document.querySelectorAll('#batch-group .tp-pill-btn');
  const catButtons = document.querySelectorAll('#category-group .tp-pill-btn');
  const btnGenerateBatch = document.getElementById('btn-generate-batch');
  const soundBtn = document.getElementById('excel-sound-btn');
  const soundLabel = document.getElementById('excel-sound-label');

  // Stats Elements
  const statExcelWpm = document.getElementById('stat-excel-wpm');
  const statExcelKpm = document.getElementById('stat-excel-kpm');
  const statExcelAcc = document.getElementById('stat-excel-accuracy');
  const statExcelRows = document.getElementById('stat-excel-rows');
  const statExcelTime = document.getElementById('stat-excel-time');
  const statNumpadKeystrokes = document.getElementById('stat-numpad-keystrokes');
  const statExcelErrors = document.getElementById('stat-excel-errors');
  const rowFeedback = document.getElementById('row-feedback');

  // Formula Bar & Reference
  const formulaCellAddr = document.getElementById('formula-cell-addr');
  const formulaCellVal = document.getElementById('formula-cell-val');
  const refRowIndicator = document.getElementById('ref-row-indicator');
  const refRowDisplay = document.getElementById('reference-row-display');
  const spreadsheetBody = document.getElementById('spreadsheet-body');

  // Modal Elements
  const excelModal = document.getElementById('excel-modal');
  const modalExcelWpm = document.getElementById('modal-excel-wpm');
  const modalExcelKpm = document.getElementById('modal-excel-kpm');
  const modalExcelAcc = document.getElementById('modal-excel-acc');
  const modalExcelRowsCount = document.getElementById('modal-excel-rows-count');
  const modalExcelErrs = document.getElementById('modal-excel-errs');
  const modalExcelDuration = document.getElementById('modal-excel-duration');
  const modalExcelBtnRetry = document.getElementById('modal-excel-btn-retry');
  const modalExcelBtnCert = document.getElementById('modal-excel-btn-cert');

  // State
  let currentBatchSize = 10;
  let currentCategory = 'inventory';
  let targetData = [];
  let currentRowIndex = 0;
  let activeColKey = 'id';
  let totalKeystrokes = 0;
  let numpadKeystrokes = 0;
  let totalErrors = 0;
  let startTime = null;
  let timerId = null;
  let isSessionActive = false;
  let isSessionFinished = false;
  let soundEnabled = true;

  // Web Audio Context
  let audioCtx = null;

  function initAudio() {
    if (!audioCtx) {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      if (AudioContextClass) audioCtx = new AudioContextClass();
    }
    if (audioCtx && audioCtx.state === 'suspended') {
      audioCtx.resume();
    }
  }

  function playTone(freq, duration = 0.05, type = 'sine') {
    if (!soundEnabled) return;
    try {
      initAudio();
      if (!audioCtx) return;
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
      gain.gain.setValueAtTime(0.05, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + duration);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + duration);
    } catch (_) {}
  }

  function playRowSuccessSound() {
    if (!soundEnabled) return;
    playTone(523.25, 0.08, 'triangle');
    setTimeout(() => playTone(659.25, 0.08, 'triangle'), 60);
    setTimeout(() => playTone(783.99, 0.14, 'triangle'), 120);
  }

  function playErrorSound() {
    if (!soundEnabled) return;
    playTone(180, 0.15, 'sawtooth');
  }

  function playCompleteSound() {
    if (!soundEnabled) return;
    [523.25, 659.25, 783.99, 1046.50].forEach((freq, i) => {
      setTimeout(() => playTone(freq, 0.2, 'triangle'), i * 80);
    });
  }

  // Shuffle & Generate Data Rows
  function generateBatch() {
    const pool = DATA_CATALOG[currentCategory] || DATA_CATALOG.inventory;
    const shuffled = [...pool].sort(() => 0.5 - Math.random());
    targetData = shuffled.slice(0, currentBatchSize);

    // If batch size is larger than pool, repeat items with varied IDs
    while (targetData.length < currentBatchSize) {
      const copy = { ...pool[targetData.length % pool.length] };
      copy.id = String(parseInt(copy.id, 10) + 100);
      targetData.push(copy);
    }

    resetSession();
    renderSpreadsheet();
    updateReferenceCard();
    focusCurrentCell('id');
  }

  function resetSession() {
    clearInterval(timerId);
    timerId = null;
    startTime = null;
    isSessionActive = false;
    isSessionFinished = false;
    currentRowIndex = 0;
    totalKeystrokes = 0;
    numpadKeystrokes = 0;
    totalErrors = 0;

    statExcelWpm.textContent = '0';
    statExcelKpm.textContent = '0';
    statExcelAcc.textContent = '100%';
    statExcelRows.textContent = `0 / ${currentBatchSize}`;
    statExcelTime.textContent = '00:00';
    statNumpadKeystrokes.textContent = '0';
    statExcelErrors.textContent = '0';
    rowFeedback.textContent = 'Type the values exactly as shown in the target row prompt above.';
    rowFeedback.style.color = 'var(--text-secondary)';

    excelModal.classList.remove('show');
  }

  function startSession() {
    if (isSessionActive) return;
    isSessionActive = true;
    startTime = Date.now();
    timerId = setInterval(updateTimerAndStats, 200);
  }

  function updateTimerAndStats() {
    if (!startTime) return;
    const elapsedSec = (Date.now() - startTime) / 1000;
    const minutes = Math.max(elapsedSec / 60, 0.01);

    // Elapsed timer display MM:SS
    const m = Math.floor(elapsedSec / 60).toString().padStart(2, '0');
    const s = Math.floor(elapsedSec % 60).toString().padStart(2, '0');
    statExcelTime.textContent = `${m}:${s}`;

    // WPM = (Total Keystrokes / 5) / minutes
    const wpm = Math.round((totalKeystrokes / 5) / minutes);
    statExcelWpm.textContent = wpm;

    // 10-Key KPM = (Numpad Keystrokes) / minutes
    const kpm = Math.round(numpadKeystrokes / minutes);
    statExcelKpm.textContent = kpm;

    // Accuracy
    const accuracy = totalKeystrokes > 0
      ? Math.max(0, Math.round(((totalKeystrokes - totalErrors) / totalKeystrokes) * 100))
      : 100;
    statExcelAcc.textContent = `${accuracy}%`;

    statNumpadKeystrokes.textContent = numpadKeystrokes;
    statExcelErrors.textContent = totalErrors;
  }

  // Render Spreadsheet Table
  function renderSpreadsheet() {
    spreadsheetBody.innerHTML = '';

    targetData.forEach((row, rIdx) => {
      const tr = document.createElement('tr');
      tr.id = `excel-row-${rIdx}`;
      if (rIdx === 0) tr.classList.add('active-row');

      // Row Header Number
      const tdNum = document.createElement('td');
      tdNum.className = 'row-num';
      tdNum.textContent = rIdx + 1;
      tr.appendChild(tdNum);

      // Data Columns
      COLUMN_KEYS.forEach((colKey, cIdx) => {
        const td = document.createElement('td');
        const input = document.createElement('input');
        input.type = 'text';
        input.className = 'cell-input';
        input.id = `cell-${rIdx}-${colKey}`;
        input.dataset.row = rIdx;
        input.dataset.col = colKey;
        input.dataset.colIdx = cIdx;
        input.autocomplete = 'off';
        input.spellcheck = false;

        // Only active row is editable, others disabled for orderly step practice
        if (rIdx !== currentRowIndex) {
          input.disabled = true;
        }

        // Cell listeners
        input.addEventListener('focus', () => {
          activeColKey = colKey;
          updateFormulaBar(rIdx, colKey, input.value);
        });

        input.addEventListener('input', () => {
          if (!isSessionActive && !isSessionFinished) {
            startSession();
          }
          updateFormulaBar(rIdx, colKey, input.value);
        });

        input.addEventListener('keydown', (e) => handleCellKeyDown(e, rIdx, colKey, input));

        td.appendChild(input);
        tr.appendChild(td);
      });

      // Verification Status column
      const tdStatus = document.createElement('td');
      tdStatus.style.textAlign = 'center';
      tdStatus.id = `status-cell-${rIdx}`;
      tdStatus.innerHTML = rIdx === 0 
        ? '<span class="status-badge badge-active">In Progress</span>' 
        : '<span class="status-badge badge-pending">Pending</span>';
      tr.appendChild(tdStatus);

      spreadsheetBody.appendChild(tr);
    });
  }

  // Update Reference Card above table
  function updateReferenceCard() {
    if (currentRowIndex >= targetData.length) {
      refRowIndicator.textContent = 'Session Complete!';
      refRowDisplay.innerHTML = '<div style="grid-column: 1 / -1; text-align: center; color: var(--success); font-weight: 700;">★ All rows successfully reconciled!</div>';
      return;
    }

    const currentTarget = targetData[currentRowIndex];
    refRowIndicator.textContent = `Row #${currentRowIndex + 1} of ${currentBatchSize}`;

    refRowDisplay.innerHTML = `
      <div class="ref-cell-item">
        <span class="ref-cell-label">ID</span>
        <span class="ref-cell-val">${currentTarget.id}</span>
      </div>
      <div class="ref-cell-item" style="min-width: 140px;">
        <span class="ref-cell-label">Name</span>
        <span class="ref-cell-val" title="${currentTarget.name}">${currentTarget.name}</span>
      </div>
      <div class="ref-cell-item">
        <span class="ref-cell-label">SKU</span>
        <span class="ref-cell-val">${currentTarget.sku}</span>
      </div>
      <div class="ref-cell-item">
        <span class="ref-cell-label">Qty</span>
        <span class="ref-cell-val">${currentTarget.qty}</span>
      </div>
      <div class="ref-cell-item">
        <span class="ref-cell-label">Price ($)</span>
        <span class="ref-cell-val">${currentTarget.price}</span>
      </div>
      <div class="ref-cell-item">
        <span class="ref-cell-label">Date</span>
        <span class="ref-cell-val">${currentTarget.date}</span>
      </div>
      <div class="ref-cell-item">
        <span class="ref-cell-label">Status</span>
        <span class="ref-cell-val">${currentTarget.status}</span>
      </div>
    `;
  }

  function updateFormulaBar(rowIdx, colKey, val) {
    const colIdx = COLUMN_KEYS.indexOf(colKey);
    const colLetter = colIdx >= 0 ? COLUMN_LETTERS[colIdx] : 'A';
    const address = `${colLetter}${rowIdx + 1}`;
    formulaCellAddr.textContent = address;
    formulaCellVal.textContent = val || '(empty cell)';
  }

  function focusCurrentCell(colKey) {
    const input = document.getElementById(`cell-${currentRowIndex}-${colKey}`);
    if (input) {
      input.disabled = false;
      input.focus();
      updateFormulaBar(currentRowIndex, colKey, input.value);
    }
  }

  // Handle KeyDown inside cells
  function handleCellKeyDown(e, rIdx, colKey, input) {
    if (isSessionFinished) return;

    // Track Numpad / Numerical inputs
    const isNumKey = /^[0-9]$/.test(e.key) || e.key === '.' || e.key === '-';
    const isNumpad = e.code && e.code.startsWith('Numpad');
    if (isNumKey || isNumpad) {
      numpadKeystrokes++;
    }

    // Track Keystrokes
    if (e.key.length === 1 || e.key === 'Backspace' || e.key === 'Enter' || e.key === 'Tab') {
      totalKeystrokes++;
      playTone(450, 0.03, 'sine');
    }

    const colIndex = COLUMN_KEYS.indexOf(colKey);

    // Tab Navigation
    if (e.key === 'Tab') {
      e.preventDefault();
      if (!isSessionActive) startSession();

      if (e.shiftKey) {
        // Move backward
        if (colIndex > 0) {
          focusCurrentCell(COLUMN_KEYS[colIndex - 1]);
        }
      } else {
        // Move forward
        if (colIndex < COLUMN_KEYS.length - 1) {
          focusCurrentCell(COLUMN_KEYS[colIndex + 1]);
        } else {
          // At last column: validate and submit row
          validateAndSubmitRow(rIdx);
        }
      }
      return;
    }

    // Enter Navigation -> Validate Row
    if (e.key === 'Enter') {
      e.preventDefault();
      if (!isSessionActive) startSession();
      validateAndSubmitRow(rIdx);
      return;
    }
  }

  // Validate Active Row
  function validateAndSubmitRow(rIdx) {
    const target = targetData[rIdx];
    let hasError = false;
    let firstErrorCol = null;

    COLUMN_KEYS.forEach(colKey => {
      const input = document.getElementById(`cell-${rIdx}-${colKey}`);
      if (!input) return;

      const userVal = input.value.trim();
      const expectedVal = target[colKey].trim();

      // Case-insensitive comparison for text, strict for numbers/SKU
      const isMatch = (colKey === 'qty' || colKey === 'price' || colKey === 'id' || colKey === 'sku')
        ? userVal === expectedVal
        : userVal.toLowerCase() === expectedVal.toLowerCase();

      if (isMatch) {
        input.classList.remove('invalid');
        input.classList.add('valid');
      } else {
        input.classList.remove('valid');
        input.classList.add('invalid');
        hasError = true;
        if (!firstErrorCol) firstErrorCol = colKey;
      }
    });

    const statusBadge = document.getElementById(`status-cell-${rIdx}`);

    if (hasError) {
      totalErrors++;
      playErrorSound();
      rowFeedback.textContent = `⚠️ Row #${rIdx + 1} validation failed: check field "${firstErrorCol.toUpperCase()}" (Expected: "${target[firstErrorCol]}")`;
      rowFeedback.style.color = 'var(--error)';
      if (statusBadge) {
        statusBadge.innerHTML = '<span class="status-badge badge-error">Error</span>';
      }
      if (firstErrorCol) {
        focusCurrentCell(firstErrorCol);
      }
    } else {
      // Row is completely valid!
      playRowSuccessSound();
      rowFeedback.textContent = `✓ Row #${rIdx + 1} validated successfully!`;
      rowFeedback.style.color = 'var(--success)';

      const currentTr = document.getElementById(`excel-row-${rIdx}`);
      if (currentTr) {
        currentTr.classList.remove('active-row');
        currentTr.classList.add('completed-row');
      }

      if (statusBadge) {
        statusBadge.innerHTML = '<span class="status-badge badge-success">&check; Verified</span>';
      }

      // Lock current row inputs
      COLUMN_KEYS.forEach(colKey => {
        const input = document.getElementById(`cell-${rIdx}-${colKey}`);
        if (input) input.disabled = true;
      });

      currentRowIndex++;
      statExcelRows.textContent = `${currentRowIndex} / ${currentBatchSize}`;

      if (currentRowIndex < targetData.length) {
        // Activate next row
        const nextTr = document.getElementById(`excel-row-${currentRowIndex}`);
        if (nextTr) nextTr.classList.add('active-row');

        const nextStatus = document.getElementById(`status-cell-${currentRowIndex}`);
        if (nextStatus) {
          nextStatus.innerHTML = '<span class="status-badge badge-active">In Progress</span>';
        }

        COLUMN_KEYS.forEach(colKey => {
          const input = document.getElementById(`cell-${currentRowIndex}-${colKey}`);
          if (input) input.disabled = false;
        });

        updateReferenceCard();
        focusCurrentCell('id');
      } else {
        // Finished all rows in the batch!
        finishExcelSession();
      }
    }

    updateTimerAndStats();
  }

  // Finish Excel Session
  function finishExcelSession() {
    isSessionFinished = true;
    isSessionActive = false;
    clearInterval(timerId);
    playCompleteSound();

    const elapsedSec = (Date.now() - startTime) / 1000;
    const minutes = Math.max(elapsedSec / 60, 0.01);
    const finalWpm = Math.round((totalKeystrokes / 5) / minutes);
    const finalKpm = Math.round(numpadKeystrokes / minutes);
    const finalAcc = totalKeystrokes > 0
      ? Math.max(0, Math.round(((totalKeystrokes - totalErrors) / totalKeystrokes) * 100))
      : 100;

    const m = Math.floor(elapsedSec / 60).toString().padStart(2, '0');
    const s = Math.floor(elapsedSec % 60).toString().padStart(2, '0');
    const durationStr = `${m}:${s}`;

    modalExcelWpm.textContent = finalWpm;
    modalExcelKpm.textContent = finalKpm;
    modalExcelAcc.textContent = `${finalAcc}%`;
    modalExcelRowsCount.textContent = `${currentBatchSize} / ${currentBatchSize}`;
    modalExcelErrs.textContent = totalErrors;
    modalExcelDuration.textContent = durationStr;

    // Pre-fill Certificate Generator URL
    const today = new Date().toISOString().split('T')[0];
    const certUrl = `../typing-certificate-generator/?wpm=${finalWpm}&acc=${finalAcc}&date=${today}&title=${encodeURIComponent('Excel Data Entry & 10-Key Certification')}`;
    modalExcelBtnCert.href = certUrl;

    excelModal.classList.add('show');
  }

  // Event Listeners
  batchButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      batchButtons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentBatchSize = parseInt(btn.dataset.batch, 10);
      generateBatch();
    });
  });

  catButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      catButtons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentCategory = btn.dataset.cat;
      generateBatch();
    });
  });

  btnGenerateBatch.addEventListener('click', generateBatch);
  modalExcelBtnRetry.addEventListener('click', generateBatch);

  soundBtn.addEventListener('click', () => {
    soundEnabled = !soundEnabled;
    soundLabel.textContent = soundEnabled ? '🔊 Audio On' : '🔇 Audio Off';
    if (soundEnabled) initAudio();
  });

  // Global Esc to regenerate
  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      if (excelModal.classList.contains('show')) {
        generateBatch();
      }
    }
  });

  // Initialize first batch
  generateBatch();
});