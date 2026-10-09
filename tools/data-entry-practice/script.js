// Data Entry Practice - Commercial Speed Test & 10-Key Analytics

const SAMPLE_RECORDS = [
  { firstName: "Sophia", lastName: "Vanderbilt", email: "sophia.v@example.com", phone: "(415) 555-0194", zip: "94107", amount: "$1,845.50" },
  { firstName: "Alexander", lastName: "Wright", email: "a.wright@example.com", phone: "(212) 555-0182", zip: "10001", amount: "$4,230.00" },
  { firstName: "Elena", lastName: "Rostova", email: "elena.r@example.org", phone: "(312) 555-0138", zip: "60601", amount: "$890.75" },
  { firstName: "Marcus", lastName: "Chen", email: "marcus.c@example.com", phone: "(206) 555-0149", zip: "98101", amount: "$2,610.25" },
  { firstName: "Isabella", lastName: "Fontana", email: "i.fontana@example.com", phone: "(617) 555-0193", zip: "02108", amount: "$5,120.80" },
  { firstName: "Lucas", lastName: "Moreau", email: "lucas.m@example.com", phone: "(512) 555-0177", zip: "78701", amount: "$3,415.00" },
  { firstName: "Chloe", lastName: "Kowalski", email: "c.kowalski@example.com", phone: "(303) 555-0164", zip: "80202", amount: "$945.30" },
  { firstName: "Liam", lastName: "O'Connor", email: "liam.oc@example.com", phone: "(404) 555-0155", zip: "30303", amount: "$1,275.60" },
  { firstName: "Maya", lastName: "Patel", email: "maya.p@example.com", phone: "(650) 555-0128", zip: "94025", amount: "$6,890.00" },
  { firstName: "Julian", lastName: "Sterling", email: "j.sterling@example.com", phone: "(202) 555-0119", zip: "20005", amount: "$7,350.40" }
];

const FIELD_SEQUENCE = ['firstName', 'lastName', 'email', 'phone', 'zip', 'amount'];

document.addEventListener('DOMContentLoaded', () => {
  // DOM Elements
  const durationButtons = document.querySelectorAll('#duration-group .dep-pill-btn');
  const soundToggle = document.getElementById('sound-toggle');
  const soundIcon = document.getElementById('sound-icon');
  const btnRestart = document.getElementById('btn-restart');

  const statTime = document.getElementById('stat-time');
  const statFpm = document.getElementById('stat-fpm');
  const statAccuracy = document.getElementById('stat-accuracy');
  const statTenKey = document.getElementById('stat-ten-key');
  const statRecords = document.getElementById('stat-records');
  const progressBar = document.getElementById('progress-bar');
  const keystrokeCounter = document.getElementById('keystroke-counter');

  const refRecordId = document.getElementById('ref-record-id');
  const refRecordCounter = document.getElementById('ref-record-counter');
  const formFieldIndicator = document.getElementById('form-field-indicator');

  // Input elements
  const inputs = {
    firstName: document.getElementById('input-firstName'),
    lastName: document.getElementById('input-lastName'),
    email: document.getElementById('input-email'),
    phone: document.getElementById('input-phone'),
    zip: document.getElementById('input-zip'),
    amount: document.getElementById('input-amount')
  };

  // Ref boxes
  const refBoxes = {
    firstName: document.getElementById('ref-box-firstName'),
    lastName: document.getElementById('ref-box-lastName'),
    email: document.getElementById('ref-box-email'),
    phone: document.getElementById('ref-box-phone'),
    zip: document.getElementById('ref-box-zip'),
    amount: document.getElementById('ref-box-amount')
  };

  const refVals = {
    firstName: document.getElementById('ref-val-firstName'),
    lastName: document.getElementById('ref-val-lastName'),
    email: document.getElementById('ref-val-email'),
    phone: document.getElementById('ref-val-phone'),
    zip: document.getElementById('ref-val-zip'),
    amount: document.getElementById('ref-val-amount')
  };

  // Status spans
  const statusSpans = {
    firstName: document.getElementById('status-firstName'),
    lastName: document.getElementById('status-lastName'),
    email: document.getElementById('status-email'),
    phone: document.getElementById('status-phone'),
    zip: document.getElementById('status-zip'),
    amount: document.getElementById('status-amount')
  };

  // Modal Elements
  const scorecardModal = document.getElementById('scorecard-modal');
  const modalFpm = document.getElementById('modal-fpm');
  const modalAccuracy = document.getElementById('modal-accuracy');
  const modalTenKey = document.getElementById('modal-ten-key');
  const modalTierBadge = document.getElementById('modal-tier-badge');
  const modalRecordsFields = document.getElementById('modal-records-fields');
  const modalErrorCount = document.getElementById('modal-error-count');
  const modalDrillTime = document.getElementById('modal-drill-time');
  const modalBtnCopy = document.getElementById('modal-btn-copy');
  const modalBtnRetry = document.getElementById('modal-btn-retry');

  // State
  let targetMode = 60; // 60, 120, 180, or 'records' (5 records)
  let isSoundEnabled = true;

  let recordPool = [...SAMPLE_RECORDS];
  let currentRecordIndex = 0;
  let activeRecord = null;
  let activeFieldIndex = 0; // 0 to 5

  let isStarted = false;
  let isFinished = false;
  let startTime = null;
  let timerInterval = null;

  let totalKeystrokes = 0;
  let numericKeystrokes = 0;
  let attemptedFields = 0;
  let correctFields = 0;
  let errorFields = 0;
  let recordsCompleted = 0;

  // Web Audio Context
  let audioCtx = null;

  function initAudio() {
    if (!audioCtx) {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      if (AudioContextClass) audioCtx = new AudioContextClass();
    }
  }

  function playSound(type) {
    if (!isSoundEnabled) return;
    try {
      initAudio();
      if (!audioCtx) return;
      if (audioCtx.state === 'suspended') audioCtx.resume();

      const now = audioCtx.currentTime;
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();

      if (type === 'error') {
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(140, now);
        osc.frequency.exponentialRampToValueAtTime(70, now + 0.1);
        gain.gain.setValueAtTime(0.2, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.1);
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.start(now);
        osc.stop(now + 0.1);
      } else if (type === 'advance') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(600, now);
        osc.frequency.exponentialRampToValueAtTime(800, now + 0.05);
        gain.gain.setValueAtTime(0.12, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.start(now);
        osc.stop(now + 0.05);
      } else {
        // Standard mechanical key click
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(520, now);
        osc.frequency.exponentialRampToValueAtTime(180, now + 0.03);
        gain.gain.setValueAtTime(0.08, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.03);
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.start(now);
        osc.stop(now + 0.03);
      }
    } catch (_) {}
  }

  function shuffle(array) {
    const arr = [...array];
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }

  function resetDrill() {
    clearInterval(timerInterval);
    timerInterval = null;

    isStarted = false;
    isFinished = false;
    startTime = null;

    totalKeystrokes = 0;
    numericKeystrokes = 0;
    attemptedFields = 0;
    correctFields = 0;
    errorFields = 0;
    recordsCompleted = 0;
    currentRecordIndex = 0;

    recordPool = shuffle(SAMPLE_RECORDS);
    activeRecord = recordPool[0];

    statFpm.textContent = '0';
    statAccuracy.textContent = '100%';
    statTenKey.textContent = '0';
    statRecords.textContent = '0';
    keystrokeCounter.textContent = '0';
    progressBar.style.width = '0%';

    if (targetMode === 'records') {
      statTime.textContent = '5 Rec';
    } else {
      statTime.textContent = targetMode;
    }

    scorecardModal.classList.remove('show');
    loadRecord(0);
  }

  function loadRecord(index) {
    if (index >= recordPool.length) {
      // Loop with reshuffle
      recordPool = shuffle(SAMPLE_RECORDS);
      index = 0;
      currentRecordIndex = 0;
    }

    activeRecord = recordPool[index];
    refRecordId.textContent = `#${1040 + index}`;
    refRecordCounter.textContent = targetMode === 'records' 
      ? `Record ${recordsCompleted + 1} of 5` 
      : `Record ${recordsCompleted + 1}`;

    // Populate reference card
    FIELD_SEQUENCE.forEach(field => {
      refVals[field].textContent = activeRecord[field];
      inputs[field].value = '';
      inputs[field].className = 'dep-input';
      statusSpans[field].textContent = '';
    });

    activeFieldIndex = 0;
    setActiveFieldHighlight(0);
    inputs.firstName.focus();
  }

  function setActiveFieldHighlight(fieldIdx) {
    activeFieldIndex = fieldIdx;
    const fieldName = FIELD_SEQUENCE[fieldIdx];

    FIELD_SEQUENCE.forEach((fn, idx) => {
      if (idx === fieldIdx) {
        refBoxes[fn].classList.add('active-ref');
      } else {
        refBoxes[fn].classList.remove('active-ref');
      }
    });

    formFieldIndicator.textContent = `Field ${fieldIdx + 1} / 6`;
  }

  function startIfNeeded() {
    if (isStarted || isFinished) return;
    isStarted = true;
    startTime = performance.now();
    initAudio();

    timerInterval = setInterval(() => {
      const elapsedSeconds = (performance.now() - startTime) / 1000;
      const elapsedMinutes = elapsedSeconds / 60;

      if (targetMode === 'records') {
        const mins = Math.floor(elapsedSeconds / 60);
        const secs = Math.floor(elapsedSeconds % 60);
        statTime.textContent = `${mins}:${secs.toString().padStart(2, '0')}`;
      } else {
        const remaining = Math.max(0, Math.ceil(targetMode - elapsedSeconds));
        statTime.textContent = remaining;

        const progress = Math.min(100, Math.round((elapsedSeconds / targetMode) * 100));
        progressBar.style.width = `${progress}%`;

        if (remaining <= 0) {
          finishDrill();
          return;
        }
      }

      computeLiveStats(elapsedMinutes);
    }, 250);
  }

  function computeLiveStats(elapsedMinutes) {
    if (elapsedMinutes <= 0.01) return;

    // Fields per minute
    const fpm = Math.max(0, Math.round(correctFields / elapsedMinutes));
    const accuracy = attemptedFields > 0 
      ? Math.max(0, Math.min(100, ((attemptedFields - errorFields) / attemptedFields) * 100)) 
      : 100;

    // 10-Key Keystrokes Per Hour
    const tenKeyKph = Math.max(0, Math.round((numericKeystrokes / elapsedMinutes) * 60));

    statFpm.textContent = fpm;
    statAccuracy.textContent = `${accuracy.toFixed(1)}%`;
    statTenKey.textContent = tenKeyKph.toLocaleString();
    statRecords.textContent = recordsCompleted;
    keystrokeCounter.textContent = totalKeystrokes;
  }

  function commitField(fieldIdx) {
    const fieldName = FIELD_SEQUENCE[fieldIdx];
    const inputEl = inputs[fieldName];
    const userVal = inputEl.value.trim();
    const expectedVal = activeRecord[fieldName].trim();

    attemptedFields++;

    const isMatch = (userVal === expectedVal);

    if (isMatch) {
      correctFields++;
      inputEl.classList.remove('input-error');
      inputEl.classList.add('input-matched');
      statusSpans[fieldName].textContent = '✓ Valid';
      statusSpans[fieldName].style.color = '#22c55e';
      playSound('advance');
    } else {
      errorFields++;
      inputEl.classList.remove('input-matched');
      inputEl.classList.add('input-error');
      statusSpans[fieldName].textContent = '✗ Mismatch';
      statusSpans[fieldName].style.color = '#ef4444';
      playSound('error');
    }

    // Advance to next field or complete record
    if (fieldIdx < FIELD_SEQUENCE.length - 1) {
      const nextIdx = fieldIdx + 1;
      setActiveFieldHighlight(nextIdx);
      inputs[FIELD_SEQUENCE[nextIdx]].focus();
    } else {
      // Completed all 6 fields in this record!
      recordsCompleted++;
      statRecords.textContent = recordsCompleted;

      if (targetMode === 'records' && recordsCompleted >= 5) {
        finishDrill();
        return;
      }

      // Load next record
      currentRecordIndex++;
      loadRecord(currentRecordIndex);
    }
  }

  function finishDrill() {
    if (isFinished) return;
    isFinished = true;
    clearInterval(timerInterval);
    timerInterval = null;

    const totalSeconds = (performance.now() - startTime) / 1000;
    const totalMinutes = Math.max(0.05, totalSeconds / 60);

    const fpm = Math.max(0, Math.round(correctFields / totalMinutes));
    const accuracy = attemptedFields > 0 
      ? Math.max(0, Math.min(100, ((attemptedFields - errorFields) / attemptedFields) * 100)) 
      : 100;
    const tenKeyKph = Math.max(0, Math.round((numericKeystrokes / totalMinutes) * 60));

    // Commercial Tier evaluation
    let tierTitle = "Commercial Data Operator";
    if (fpm >= 48 && tenKeyKph >= 7500 && accuracy >= 97) {
      tierTitle = "Tier 1 Specialist (Executive Master)";
    } else if (fpm >= 38 && tenKeyKph >= 6000 && accuracy >= 94) {
      tierTitle = "Tier 2 Senior Operator (Billing Grade)";
    } else if (fpm >= 28) {
      tierTitle = "Commercial Clerk (Standard Qualified)";
    } else {
      tierTitle = "Entry Level Operator (Training Cadence)";
    }

    modalFpm.textContent = fpm;
    modalAccuracy.textContent = `${accuracy.toFixed(1)}%`;
    modalTenKey.textContent = tenKeyKph.toLocaleString();
    modalTierBadge.textContent = tierTitle;
    modalRecordsFields.textContent = `${recordsCompleted} records (${correctFields} clean / ${attemptedFields} total fields)`;
    modalErrorCount.textContent = `${errorFields} field errors (${(100 - accuracy).toFixed(1)}% error rate)`;
    modalDrillTime.textContent = `${totalSeconds.toFixed(1)}s`;

    scorecardModal.classList.add('show');
  }

  // Handle Input events and Tab/Enter navigation
  FIELD_SEQUENCE.forEach((fieldName, idx) => {
    const inputEl = inputs[fieldName];

    inputEl.addEventListener('focus', () => {
      setActiveFieldHighlight(idx);
    });

    inputEl.addEventListener('input', (e) => {
      startIfNeeded();
      totalKeystrokes++;

      // Check if numeric field: phone, zip, amount
      if (['phone', 'zip', 'amount'].includes(fieldName)) {
        if (/[\d\.\$\(\)\-\s]/.test(e.data || '')) {
          numericKeystrokes++;
        }
      }

      // Real-time visual feedback
      const expected = activeRecord[fieldName];
      const val = inputEl.value;

      if (val.length > 0) {
        if (expected.startsWith(val)) {
          inputEl.classList.remove('input-error');
          if (val === expected) {
            inputEl.classList.add('input-matched');
          }
        } else {
          inputEl.classList.add('input-error');
          inputEl.classList.remove('input-matched');
        }
      } else {
        inputEl.classList.remove('input-error', 'input-matched');
      }

      playSound('key');
    });

    inputEl.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        resetDrill();
        return;
      }

      if (e.key === 'Enter' || e.key === 'Tab') {
        e.preventDefault(); // Prevent default focus jump or form submit
        commitField(idx);
      }
    });
  });

  // Duration selection
  durationButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      durationButtons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const val = btn.dataset.duration;
      targetMode = val === 'records' ? 'records' : parseInt(val, 10);
      resetDrill();
    });
  });

  // Sound toggle
  soundToggle.addEventListener('click', () => {
    isSoundEnabled = !isSoundEnabled;
    soundIcon.textContent = isSoundEnabled ? '🔊 Sound' : '🔇 Muted';
    initAudio();
  });

  // Restart Button
  btnRestart.addEventListener('click', resetDrill);

  modalBtnRetry.addEventListener('click', () => {
    scorecardModal.classList.remove('show');
    resetDrill();
  });

  // Copy report
  modalBtnCopy.addEventListener('click', async () => {
    const reportText = `═══════════════════════════════════════════
📊 COMMERCIAL DATA ENTRY SPEED REPORT
Operator Tier: ${modalTierBadge.textContent}
Throughput: ${modalFpm.textContent} Fields/Min (FPM)
Accuracy: ${modalAccuracy.textContent}
10-Key Speed: ${modalTenKey.textContent} KPH
Records Completed: ${recordsCompleted} (${modalDrillTime.textContent})
Evaluated at: https://sami12901.github.io/ALL-IN-ONE-v1/tools/data-entry-practice/
═══════════════════════════════════════════`;

    try {
      await navigator.clipboard.writeText(reportText);
      const prev = modalBtnCopy.textContent;
      modalBtnCopy.textContent = '✅ Copied!';
      setTimeout(() => modalBtnCopy.textContent = prev, 2000);
    } catch (_) {
      alert(reportText);
    }
  });

  scorecardModal.addEventListener('click', (e) => {
    if (e.target === scorecardModal) {
      scorecardModal.classList.remove('show');
    }
  });

  // Init
  resetDrill();
});