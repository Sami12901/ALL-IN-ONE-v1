// Invoice Typing Practice - Enterprise Billing Benchmark

document.addEventListener('DOMContentLoaded', () => {
  // Elements
  const industrySelect = document.getElementById('industry-select');
  const durationGroup = document.getElementById('duration-group');
  const soundToggle = document.getElementById('sound-toggle');
  const soundIcon = document.getElementById('sound-icon');

  const statTime = document.getElementById('stat-time');
  const statIph = document.getElementById('stat-iph');
  const statAccuracy = document.getElementById('stat-accuracy');
  const statKph = document.getElementById('stat-kph');
  const statInvoicesDone = document.getElementById('stat-invoices-done');
  const progressBar = document.getElementById('progress-bar');

  const invVendor = document.getElementById('inv-vendor');
  const invAddress = document.getElementById('inv-address');
  const invNumber = document.getElementById('inv-number');
  const invClient = document.getElementById('inv-client');
  const invTerms = document.getElementById('inv-terms');

  const invoiceTbody = document.getElementById('invoice-tbody');
  const invSubtotal = document.getElementById('inv-subtotal');
  const invTax = document.getElementById('inv-tax');
  const invGrandTotal = document.getElementById('inv-grand-total');
  const linesCounter = document.getElementById('lines-counter');
  const btnRestart = document.getElementById('btn-restart');

  // Modal elements
  const scorecardModal = document.getElementById('scorecard-modal');
  const modalIph = document.getElementById('modal-iph');
  const modalAccuracy = document.getElementById('modal-accuracy');
  const modalKph = document.getElementById('modal-kph');
  const modalRating = document.getElementById('modal-rating');
  const modalInvoicesLines = document.getElementById('modal-invoices-lines');
  const modalVolumeTotal = document.getElementById('modal-volume-total');
  const modalDrillTime = document.getElementById('modal-drill-time');
  const modalBtnCopy = document.getElementById('modal-btn-copy');
  const modalBtnRetry = document.getElementById('modal-btn-retry');

  // Audio state
  let soundEnabled = true;
  let audioCtx = null;

  function playTick(isError = false) {
    if (!soundEnabled) return;
    try {
      if (!audioCtx) {
        audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      }
      if (audioCtx.state === 'suspended') {
        audioCtx.resume();
      }
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.connect(gain);
      gain.connect(audioCtx.destination);

      if (isError) {
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(150, audioCtx.currentTime);
        gain.gain.setValueAtTime(0.08, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.12);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.12);
      } else {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(600, audioCtx.currentTime);
        gain.gain.setValueAtTime(0.04, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.05);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.05);
      }
    } catch (_) {}
  }

  // Invoice Database
  const database = {
    cloud: {
      vendor: 'Apex Cloud Infrastructure Ltd.',
      address: '742 Enterprise Blvd, Suite 400 • Austin, TX 78701',
      terms: 'Net 30 Days',
      invoices: [
        {
          num: 'INV-2026-9814',
          client: 'Meridian Technologies Inc.',
          items: [
            { desc: 'Managed Kubernetes Cluster Node Pool', sku: 'K8S-ENT-04', qty: 12, price: 149.50 },
            { desc: 'Ultra-Fast NVMe Block Storage (5TB)', sku: 'SAN-NVME-05', qty: 5, price: 185.00 },
            { desc: 'Enterprise DDoS Shield & WAF Defense', sku: 'SEC-WAF-99', qty: 1, price: 650.00 },
            { desc: 'Global Content Delivery Network Tier-1', sku: 'CDN-GB-500', qty: 25, price: 38.20 }
          ]
        },
        {
          num: 'INV-2026-9815',
          client: 'Vanguard Analytics Corp.',
          items: [
            { desc: 'Dedicated GPU Instance (H100 Tensor)', sku: 'GPU-H100-SX', qty: 4, price: 1250.00 },
            { desc: 'PostgreSQL Multi-AZ Failover Cluster', sku: 'DB-PG-HA01', qty: 2, price: 420.00 },
            { desc: 'Cold Glacier Archive Storage (20TB)', sku: 'ARC-GLAC-20', qty: 20, price: 18.00 },
            { desc: '24/7 Dedicated Solutions Architect Tier', sku: 'SUP-ENT-PRI', qty: 1, price: 800.00 }
          ]
        },
        {
          num: 'INV-2026-9816',
          client: 'Cobalt Media Streaming LLC',
          items: [
            { desc: 'Realtime Transcoding Encoding Nodes', sku: 'ENC-4K-LIVE', qty: 6, price: 310.00 },
            { desc: 'Cross-Region Data Egress Transit (10TB)', sku: 'NET-XFR-10T', qty: 10, price: 65.00 },
            { desc: 'SSL Wildcard Multi-Domain Certificate', sku: 'SEC-SSL-WLD', qty: 2, price: 125.00 },
            { desc: 'Redis Distributed InMemory Cache Tier', sku: 'MEM-RED-16G', qty: 4, price: 195.00 }
          ]
        }
      ]
    },
    logistics: {
      vendor: 'Oceanic Global Freight Carriers LLC',
      address: '100 Pierhead Terminal Road • Long Beach, CA 90802',
      terms: 'Net 15 Days',
      invoices: [
        {
          num: 'FRT-2026-4401',
          client: 'Pacific Rim Trade Importers',
          items: [
            { desc: '40ft High Cube Ocean Container Transit', sku: 'OCN-40HC-TP', qty: 3, price: 2150.00 },
            { desc: 'Customs Clearance & Documentation Entry', sku: 'CST-CLR-DOC', qty: 3, price: 220.00 },
            { desc: 'Port Terminal Handling Charge (THC)', sku: 'TRM-HND-CHG', qty: 3, price: 340.00 },
            { desc: 'Inland Intermodal Rail Drayage Service', sku: 'RL-DRY-300M', qty: 3, price: 780.00 }
          ]
        },
        {
          num: 'FRT-2026-4402',
          client: 'Nordic Express Supply GmbH',
          items: [
            { desc: 'Priority Air Cargo Freight (500kg pallet)', sku: 'AIR-EXP-500', qty: 2, price: 1680.00 },
            { desc: 'Dangerous Goods IATA Inspection Fee', sku: 'HAZ-INS-FE0', qty: 2, price: 175.00 },
            { desc: 'Airport Security & Screening Surcharge', sku: 'AIR-SCR-SR9', qty: 2, price: 95.00 },
            { desc: 'Dedicated First-Mile Temperature Transit', sku: 'TMP-TRN-COL', qty: 1, price: 450.00 }
          ]
        }
      ]
    },
    medical: {
      vendor: 'Nexus BioHealth Medical Instruments',
      address: '88 Innovation Way • Cambridge, MA 02142',
      terms: 'Net 30 Days',
      invoices: [
        {
          num: 'MED-2026-1180',
          client: 'Saint Jude Memorial Hospital',
          items: [
            { desc: 'Sterile Surgical Laparoscopy Trocar Kit', sku: 'LAP-TRC-ST5', qty: 20, price: 85.00 },
            { desc: 'Disposable Anesthesia Breathing Circuits', sku: 'ANS-BRT-CIR', qty: 50, price: 24.50 },
            { desc: 'High-Precision Infusion Syringe Pumps', sku: 'INF-PMP-DIG', qty: 4, price: 680.00 },
            { desc: 'Biocompatible Titanium Suture Anchors', sku: 'TIT-SUT-ANC', qty: 15, price: 110.00 }
          ]
        }
      ]
    },
    hardware: {
      vendor: 'Vanguard Industrial Automation Corp.',
      address: '500 Heavy Machinery Parkway • Detroit, MI 48201',
      terms: 'Net 45 Days',
      invoices: [
        {
          num: 'IND-2026-7200',
          client: 'Apex Advanced Manufacturing Ltd.',
          items: [
            { desc: 'Brushless High-Torque Servo Motor 4kW', sku: 'SRV-MOT-4KW', qty: 8, price: 540.00 },
            { desc: 'Programmable Logic Controller (PLC CPU)', sku: 'PLC-CPU-64I', qty: 2, price: 1150.00 },
            { desc: 'Industrial Touchscreen HMI Panel 12in', sku: 'HMI-TCH-12D', qty: 2, price: 780.00 },
            { desc: 'Shielded Variable Frequency Drive VFD', sku: 'VFD-INV-10H', qty: 4, price: 420.00 }
          ]
        }
      ]
    }
  };

  // State
  let currentDurationMode = 60; // 60, 120, 180, or 'invoices'
  let targetInvoicesCount = 3;
  let currentInvoiceIndex = 0;
  let completedInvoicesCount = 0;
  let totalKeystrokes = 0;
  let correctKeystrokes = 0;
  let errorKeystrokes = 0;
  let startTime = null;
  let timerInterval = null;
  let isRunning = false;
  let totalFinancialVolume = 0;

  function formatMoney(amount) {
    return '$' + amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }

  function getActiveIndustryInvoices() {
    const ind = industrySelect.value;
    return database[ind] || database.cloud;
  }

  function renderCurrentInvoice() {
    const dataset = getActiveIndustryInvoices();
    const invoiceList = dataset.invoices;
    const invData = invoiceList[currentInvoiceIndex % invoiceList.length];

    invVendor.textContent = dataset.vendor;
    invAddress.textContent = dataset.address;
    invNumber.textContent = invData.num;
    invClient.textContent = invData.client;
    invTerms.textContent = dataset.terms;

    invoiceTbody.innerHTML = '';
    let subtotal = 0;

    invData.items.forEach((item, idx) => {
      const lineTotal = item.qty * item.price;
      subtotal += lineTotal;

      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td style="font-weight: 700; color: var(--text-tertiary); text-align: center;">${idx + 1}</td>
        <td>
          <span class="itp-target-cell" data-target="${item.desc}">${item.desc}</span>
          <input type="text" class="itp-cell-input" data-col="desc" data-target="${item.desc}" placeholder="Type description..." autocomplete="off" spellcheck="false">
        </td>
        <td>
          <span class="itp-target-cell" data-target="${item.sku}">${item.sku}</span>
          <input type="text" class="itp-cell-input" data-col="sku" data-target="${item.sku}" placeholder="Type SKU..." autocomplete="off" spellcheck="false">
        </td>
        <td>
          <span class="itp-target-cell" data-target="${item.qty}">${item.qty}</span>
          <input type="text" class="itp-cell-input" data-col="qty" data-target="${item.qty}" placeholder="Qty..." autocomplete="off" spellcheck="false" style="max-width: 90px;">
        </td>
        <td>
          <span class="itp-target-cell" data-target="${item.price.toFixed(2)}">${item.price.toFixed(2)}</span>
          <input type="text" class="itp-cell-input" data-col="price" data-target="${item.price.toFixed(2)}" placeholder="Price..." autocomplete="off" spellcheck="false" style="max-width: 120px;">
        </td>
        <td style="font-family: monospace; font-weight: 700; color: var(--text-primary); text-align: right;" class="cell-line-total">
          ${formatMoney(lineTotal)}
        </td>
      `;
      invoiceTbody.appendChild(tr);
    });

    const tax = subtotal * 0.0825;
    const grand = subtotal + tax;
    invSubtotal.textContent = formatMoney(subtotal);
    invTax.textContent = formatMoney(tax);
    invGrandTotal.textContent = formatMoney(grand);
    totalFinancialVolume += grand;

    updateLinesProgress();
    attachCellListeners();
  }

  function updateLinesProgress() {
    const rows = invoiceTbody.querySelectorAll('tr');
    let completedRows = 0;

    rows.forEach(r => {
      const inputs = r.querySelectorAll('.itp-cell-input');
      const allDone = Array.from(inputs).every(inp => inp.classList.contains('correct'));
      if (allDone) completedRows++;
    });

    linesCounter.textContent = `${completedRows} / ${rows.length}`;

    // Check if entire current invoice is complete
    if (completedRows === rows.length && rows.length > 0) {
      completedInvoicesCount++;
      statInvoicesDone.textContent = completedInvoicesCount;

      if (currentDurationMode === 'invoices' && completedInvoicesCount >= targetInvoicesCount) {
        finishBenchmark();
      } else {
        currentInvoiceIndex++;
        renderCurrentInvoice();
        // Focus first cell
        const first = invoiceTbody.querySelector('.itp-cell-input');
        if (first) first.focus();
      }
    }
  }

  function attachCellListeners() {
    const inputs = invoiceTbody.querySelectorAll('.itp-cell-input');
    inputs.forEach((input, index) => {
      input.addEventListener('input', (e) => {
        if (!isRunning) startBenchmark();

        const val = input.value;
        const target = input.getAttribute('data-target');

        totalKeystrokes++;

        if (val === target) {
          input.classList.remove('error');
          input.classList.add('correct');
          correctKeystrokes++;
          playTick(false);
          updateLinesProgress();
        } else if (target.startsWith(val)) {
          input.classList.remove('error', 'correct');
          correctKeystrokes++;
          playTick(false);
        } else {
          input.classList.remove('correct');
          input.classList.add('error');
          errorKeystrokes++;
          playTick(true);
        }

        updateLiveStats();
      });

      input.addEventListener('keydown', (e) => {
        if (e.key === 'Tab' || e.key === 'Enter') {
          e.preventDefault();
          const next = inputs[index + 1];
          if (next) {
            next.focus();
          } else {
            // Check if finished
            updateLinesProgress();
          }
        }
      });
    });
  }

  function startBenchmark() {
    if (isRunning) return;
    isRunning = true;
    startTime = Date.now();

    timerInterval = setInterval(() => {
      const elapsedSec = (Date.now() - startTime) / 1000;

      if (typeof currentDurationMode === 'number') {
        const remaining = Math.max(0, currentDurationMode - Math.floor(elapsedSec));
        statTime.textContent = remaining;

        const pct = Math.min(100, (elapsedSec / currentDurationMode) * 100);
        progressBar.style.width = `${pct}%`;

        if (remaining <= 0) {
          finishBenchmark();
        }
      } else {
        // Invoices mode: timer counts up
        statTime.textContent = Math.floor(elapsedSec) + 's';
        const pct = Math.min(100, (completedInvoicesCount / targetInvoicesCount) * 100);
        progressBar.style.width = `${pct}%`;
      }

      updateLiveStats();
    }, 250);
  }

  function updateLiveStats() {
    if (!startTime) return;
    const elapsedMinutes = Math.max(0.01, (Date.now() - startTime) / 60000);
    const elapsedHours = elapsedMinutes / 60;

    // Accuracy
    const totalTyped = correctKeystrokes + errorKeystrokes;
    const acc = totalTyped > 0 ? Math.round((correctKeystrokes / totalTyped) * 100) : 100;
    statAccuracy.textContent = `${acc}%`;

    // Invoices Per Hour (IPH)
    const iph = Math.round((completedInvoicesCount / elapsedHours) * 10) / 10;
    statIph.textContent = iph > 0 ? iph : Math.round(completedInvoicesCount / elapsedHours);

    // Keystrokes Per Hour (KPH)
    const kph = Math.round(totalKeystrokes / elapsedHours);
    statKph.textContent = kph.toLocaleString();
  }

  function finishBenchmark() {
    clearInterval(timerInterval);
    isRunning = false;

    const totalSeconds = ((Date.now() - startTime) / 1000).toFixed(1);
    const elapsedHours = (Date.now() - startTime) / 3600000;
    const iph = elapsedHours > 0 ? (completedInvoicesCount / elapsedHours).toFixed(1) : '0';
    const totalTyped = correctKeystrokes + errorKeystrokes;
    const acc = totalTyped > 0 ? ((correctKeystrokes / totalTyped) * 100).toFixed(1) : '100';
    const kph = elapsedHours > 0 ? Math.round(totalKeystrokes / elapsedHours).toLocaleString() : '0';

    modalIph.textContent = iph;
    modalAccuracy.textContent = `${acc}%`;
    modalKph.textContent = kph;
    modalDrillTime.textContent = `${totalSeconds}s`;
    modalInvoicesLines.textContent = `${completedInvoicesCount} invoices completed`;
    modalVolumeTotal.textContent = `${formatMoney(totalFinancialVolume)} volume keyed`;

    const iphNum = parseFloat(iph);
    if (iphNum >= 35) {
      modalRating.textContent = 'Top 1% Elite Billing Specialist';
    } else if (iphNum >= 25) {
      modalRating.textContent = 'Top 5% Senior Billing Specialist';
    } else if (iphNum >= 15) {
      modalRating.textContent = 'Proficient ERP Billing Associate';
    } else {
      modalRating.textContent = 'Standard Entry Operator';
    }

    scorecardModal.classList.add('show');
  }

  function resetBenchmark() {
    clearInterval(timerInterval);
    isRunning = false;
    startTime = null;
    totalKeystrokes = 0;
    correctKeystrokes = 0;
    errorKeystrokes = 0;
    completedInvoicesCount = 0;
    currentInvoiceIndex = 0;
    totalFinancialVolume = 0;

    statTime.textContent = typeof currentDurationMode === 'number' ? currentDurationMode : '60';
    statIph.textContent = '0';
    statAccuracy.textContent = '100%';
    statKph.textContent = '0';
    statInvoicesDone.textContent = '0';
    progressBar.style.width = '0%';

    scorecardModal.classList.remove('show');
    renderCurrentInvoice();

    const first = invoiceTbody.querySelector('.itp-cell-input');
    if (first) first.focus();
  }

  // Duration buttons
  durationGroup.querySelectorAll('.itp-pill-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      durationGroup.querySelectorAll('.itp-pill-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const dur = btn.getAttribute('data-duration');
      if (dur === 'invoices') {
        currentDurationMode = 'invoices';
      } else {
        currentDurationMode = parseInt(dur, 10);
      }
      resetBenchmark();
    });
  });

  // Industry select
  industrySelect.addEventListener('change', () => {
    resetBenchmark();
  });

  // Sound toggle
  soundToggle.addEventListener('click', () => {
    soundEnabled = !soundEnabled;
    soundIcon.textContent = soundEnabled ? '🔊 Sound' : '🔇 Muted';
  });

  // Restart buttons
  btnRestart.addEventListener('click', resetBenchmark);
  modalBtnRetry.addEventListener('click', resetBenchmark);

  // Esc shortcut
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      resetBenchmark();
    }
  });

  // Modal Copy
  modalBtnCopy.addEventListener('click', () => {
    const text = `Commercial ERP Billing Benchmark Results:\n- Invoices / Hour (IPH): ${modalIph.textContent}\n- Accuracy: ${modalAccuracy.textContent}\n- Keystrokes / Hr (KPH): ${modalKph.textContent}\n- Rating: ${modalRating.textContent}\n- Invoices Completed: ${modalInvoicesLines.textContent}\n- Financial Volume: ${modalVolumeTotal.textContent}`;
    navigator.clipboard.writeText(text).then(() => {
      modalBtnCopy.textContent = '✅ Copied!';
      setTimeout(() => { modalBtnCopy.textContent = '📋 Copy Scorecard'; }, 2000);
    });
  });

  // Initial load
  resetBenchmark();
});