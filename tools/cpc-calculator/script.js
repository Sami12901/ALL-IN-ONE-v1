// CPC & Paid Advertising Metric Solver Engine
document.addEventListener('DOMContentLoaded', () => {
  // --- DOM Elements ---
  const fields = {
    spend: { input: document.getElementById('input-spend'), badge: document.getElementById('badge-spend'), card: document.getElementById('card-spend'), isInt: false, isMoney: true },
    impressions: { input: document.getElementById('input-impressions'), badge: document.getElementById('badge-impressions'), card: document.getElementById('card-impressions'), isInt: true, isMoney: false },
    clicks: { input: document.getElementById('input-clicks'), badge: document.getElementById('badge-clicks'), card: document.getElementById('card-clicks'), isInt: true, isMoney: false },
    cpc: { input: document.getElementById('input-cpc'), badge: document.getElementById('badge-cpc'), card: document.getElementById('card-cpc'), isInt: false, isMoney: true },
    cpm: { input: document.getElementById('input-cpm'), badge: document.getElementById('badge-cpm'), card: document.getElementById('card-cpm'), isInt: false, isMoney: true },
    ctr: { input: document.getElementById('input-ctr'), badge: document.getElementById('badge-ctr'), card: document.getElementById('card-ctr'), isInt: false, isMoney: false, isPct: true },
    conversions: { input: document.getElementById('input-conversions'), badge: document.getElementById('badge-conversions'), card: document.getElementById('card-conversions'), isInt: true, isMoney: false },
    cr: { input: document.getElementById('input-cr'), badge: document.getElementById('badge-cr'), card: document.getElementById('card-cr'), isInt: false, isMoney: false, isPct: true },
    cpa: { input: document.getElementById('input-cpa'), badge: document.getElementById('badge-cpa'), card: document.getElementById('card-cpa'), isInt: false, isMoney: true }
  };

  const btnCalculate = document.getElementById('btn-calculate');
  const btnResetSolver = document.getElementById('btn-reset-solver');
  const btnExportCsv = document.getElementById('btn-export-ppc-csv');
  const btnCopySummary = document.getElementById('btn-copy-ppc-summary');

  // KPI Deck Elements
  const kpiSpend = document.getElementById('kpi-spend');
  const kpiCpa = document.getElementById('kpi-cpa');
  const kpiCtr = document.getElementById('kpi-ctr');
  const kpiCr = document.getElementById('kpi-cr');

  // Funnel Elements
  const funnelImpressions = document.getElementById('funnel-impressions');
  const funnelCtrTag = document.getElementById('funnel-ctr-tag');
  const funnelClicks = document.getElementById('funnel-clicks');
  const funnelCrTag = document.getElementById('funnel-cr-tag');
  const funnelConversions = document.getElementById('funnel-conversions');

  const benchmarkButtons = document.querySelectorAll('.btn-apply-benchmark');

  // Track manually entered user inputs: fieldKey -> number
  const userEntered = new Map();

  // Helper: Format numbers
  function formatNum(val, decimals = 2) {
    if (val === null || isNaN(val) || !isFinite(val)) return '0.00';
    return Number(val).toLocaleString(undefined, {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals
    });
  }

  // --- Multi-Pass Propagation Solver ---
  function solveMetrics() {
    // Current working values map
    const val = {
      spend: userEntered.has('spend') ? userEntered.get('spend') : null,
      impressions: userEntered.has('impressions') ? userEntered.get('impressions') : null,
      clicks: userEntered.has('clicks') ? userEntered.get('clicks') : null,
      cpc: userEntered.has('cpc') ? userEntered.get('cpc') : null,
      cpm: userEntered.has('cpm') ? userEntered.get('cpm') : null,
      ctr: userEntered.has('ctr') ? userEntered.get('ctr') : null,
      conversions: userEntered.has('conversions') ? userEntered.get('conversions') : null,
      cr: userEntered.has('cr') ? userEntered.get('cr') : null,
      cpa: userEntered.has('cpa') ? userEntered.get('cpa') : null
    };

    // Run iterative deduction passes
    let changed = true;
    let iteration = 0;
    while (changed && iteration < 12) {
      changed = false;
      iteration++;

      // 1. Spend deductions
      if (val.spend === null) {
        if (val.clicks !== null && val.cpc !== null) {
          val.spend = val.clicks * val.cpc;
          changed = true;
        } else if (val.impressions !== null && val.cpm !== null) {
          val.spend = (val.impressions / 1000) * val.cpm;
          changed = true;
        } else if (val.conversions !== null && val.cpa !== null) {
          val.spend = val.conversions * val.cpa;
          changed = true;
        }
      }

      // 2. Clicks deductions
      if (val.clicks === null) {
        if (val.spend !== null && val.cpc !== null && val.cpc > 0) {
          val.clicks = val.spend / val.cpc;
          changed = true;
        } else if (val.impressions !== null && val.ctr !== null) {
          val.clicks = (val.impressions * val.ctr) / 100;
          changed = true;
        } else if (val.conversions !== null && val.cr !== null && val.cr > 0) {
          val.clicks = (val.conversions / val.cr) * 100;
          changed = true;
        }
      }

      // 3. Impressions deductions
      if (val.impressions === null) {
        if (val.spend !== null && val.cpm !== null && val.cpm > 0) {
          val.impressions = (val.spend / val.cpm) * 1000;
          changed = true;
        } else if (val.clicks !== null && val.ctr !== null && val.ctr > 0) {
          val.impressions = (val.clicks / val.ctr) * 100;
          changed = true;
        }
      }

      // 4. CPC deductions
      if (val.cpc === null) {
        if (val.spend !== null && val.clicks !== null && val.clicks > 0) {
          val.cpc = val.spend / val.clicks;
          changed = true;
        } else if (val.cpm !== null && val.ctr !== null && val.ctr > 0) {
          val.cpc = (val.cpm / 1000) / (val.ctr / 100);
          changed = true;
        } else if (val.cpa !== null && val.cr !== null) {
          val.cpc = val.cpa * (val.cr / 100);
          changed = true;
        }
      }

      // 5. CPM deductions
      if (val.cpm === null) {
        if (val.spend !== null && val.impressions !== null && val.impressions > 0) {
          val.cpm = (val.spend / val.impressions) * 1000;
          changed = true;
        } else if (val.cpc !== null && val.ctr !== null) {
          val.cpm = val.cpc * (val.ctr / 100) * 1000;
          changed = true;
        }
      }

      // 6. CTR deductions
      if (val.ctr === null) {
        if (val.clicks !== null && val.impressions !== null && val.impressions > 0) {
          val.ctr = (val.clicks / val.impressions) * 100;
          changed = true;
        } else if (val.cpm !== null && val.cpc !== null && val.cpc > 0) {
          val.ctr = (val.cpm / (val.cpc * 1000)) * 100;
          changed = true;
        }
      }

      // 7. Conversions deductions
      if (val.conversions === null) {
        if (val.clicks !== null && val.cr !== null) {
          val.conversions = (val.clicks * val.cr) / 100;
          changed = true;
        } else if (val.spend !== null && val.cpa !== null && val.cpa > 0) {
          val.conversions = val.spend / val.cpa;
          changed = true;
        }
      }

      // 8. Conversion Rate (CR) deductions
      if (val.cr === null) {
        if (val.conversions !== null && val.clicks !== null && val.clicks > 0) {
          val.cr = (val.conversions / val.clicks) * 100;
          changed = true;
        } else if (val.cpc !== null && val.cpa !== null && val.cpa > 0) {
          val.cr = (val.cpc / val.cpa) * 100;
          changed = true;
        }
      }

      // 9. CPA deductions
      if (val.cpa === null) {
        if (val.spend !== null && val.conversions !== null && val.conversions > 0) {
          val.cpa = val.spend / val.conversions;
          changed = true;
        } else if (val.cpc !== null && val.cr !== null && val.cr > 0) {
          val.cpa = val.cpc / (val.cr / 100);
          changed = true;
        }
      }
    }

    // --- Update Form Input Displays and Status Badges ---
    for (const [key, conf] of Object.entries(fields)) {
      const isManual = userEntered.has(key);
      const computed = val[key];

      if (isManual) {
        conf.badge.textContent = 'User Input';
        conf.badge.className = 'solver-badge user';
      } else if (computed !== null && !isNaN(computed) && isFinite(computed)) {
        conf.badge.textContent = 'Calculated';
        conf.badge.className = 'solver-badge calculated';
        // Fill calculated value into field if user hasn't typed in it
        if (conf.isInt) {
          conf.input.value = Math.round(computed);
        } else {
          conf.input.value = parseFloat(computed.toFixed(conf.isMoney ? 2 : 2));
        }
      } else {
        conf.badge.textContent = '—';
        conf.badge.className = 'solver-badge empty';
        if (!isManual) {
          conf.input.value = '';
        }
      }
    }

    // --- Update Executive KPI Displays ---
    if (kpiSpend) kpiSpend.textContent = `$${formatNum(val.spend)}`;
    if (kpiCpa) kpiCpa.textContent = `$${formatNum(val.cpa)}`;
    if (kpiCtr) kpiCtr.textContent = `${formatNum(val.ctr)}%`;
    if (kpiCr) kpiCr.textContent = `${formatNum(val.cr)}%`;

    // --- Update Funnel Visualizer ---
    if (funnelImpressions) funnelImpressions.textContent = formatNum(val.impressions, 0);
    if (funnelCtrTag) funnelCtrTag.textContent = `CTR: ${formatNum(val.ctr)}%`;
    if (funnelClicks) funnelClicks.textContent = formatNum(val.clicks, 0);
    if (funnelCrTag) funnelCrTag.textContent = `CR: ${formatNum(val.cr)}%`;
    if (funnelConversions) funnelConversions.textContent = formatNum(val.conversions, 0);

    return val;
  }

  // --- Input Change Handlers ---
  for (const [key, conf] of Object.entries(fields)) {
    conf.input.addEventListener('input', () => {
      const rawVal = conf.input.value.trim();
      if (rawVal === '') {
        userEntered.delete(key);
      } else {
        const parsed = parseFloat(rawVal);
        if (!isNaN(parsed) && parsed >= 0) {
          userEntered.set(key, parsed);
        } else {
          userEntered.delete(key);
        }
      }
      solveMetrics();
    });
  }

  // Calculate Button
  if (btnCalculate) {
    btnCalculate.addEventListener('click', () => {
      solveMetrics();
    });
  }

  // Reset Solver Button
  if (btnResetSolver) {
    btnResetSolver.addEventListener('click', () => {
      userEntered.clear();
      for (const [key, conf] of Object.entries(fields)) {
        conf.input.value = '';
        conf.badge.textContent = '—';
        conf.badge.className = 'solver-badge empty';
      }
      solveMetrics();
    });
  }

  // --- Industry Benchmarks Application ---
  benchmarkButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      userEntered.clear();
      if (btn.dataset.spend) userEntered.set('spend', parseFloat(btn.dataset.spend));
      if (btn.dataset.cpc) userEntered.set('cpc', parseFloat(btn.dataset.cpc));
      if (btn.dataset.ctr) userEntered.set('ctr', parseFloat(btn.dataset.ctr));
      if (btn.dataset.cr) userEntered.set('cr', parseFloat(btn.dataset.cr));

      // Put values into inputs
      if (fields.spend.input) fields.spend.input.value = btn.dataset.spend;
      if (fields.cpc.input) fields.cpc.input.value = btn.dataset.cpc;
      if (fields.ctr.input) fields.ctr.input.value = btn.dataset.ctr;
      if (fields.cr.input) fields.cr.input.value = btn.dataset.cr;

      // Solve all remaining
      solveMetrics();

      // Smooth scroll to top of workspace
      window.scrollTo({ top: 150, behavior: 'smooth' });
    });
  });

  // --- Export Audit Report as CSV ---
  if (btnExportCsv) {
    btnExportCsv.addEventListener('click', () => {
      const data = solveMetrics();
      const csvRows = [
        'PPC_Metric,Value,Unit,Origin',
        `Ad_Spend,${data.spend !== null ? data.spend.toFixed(2) : 'N/A'},USD,${userEntered.has('spend') ? 'Manual' : 'Calculated'}`,
        `Impressions,${data.impressions !== null ? Math.round(data.impressions) : 'N/A'},Count,${userEntered.has('impressions') ? 'Manual' : 'Calculated'}`,
        `Clicks,${data.clicks !== null ? Math.round(data.clicks) : 'N/A'},Count,${userEntered.has('clicks') ? 'Manual' : 'Calculated'}`,
        `Cost_Per_Click_CPC,${data.cpc !== null ? data.cpc.toFixed(2) : 'N/A'},USD,${userEntered.has('cpc') ? 'Manual' : 'Calculated'}`,
        `Cost_Per_Mille_CPM,${data.cpm !== null ? data.cpm.toFixed(2) : 'N/A'},USD,${userEntered.has('cpm') ? 'Manual' : 'Calculated'}`,
        `Click_Through_Rate_CTR,${data.ctr !== null ? data.ctr.toFixed(2) : 'N/A'},Percent,${userEntered.has('ctr') ? 'Manual' : 'Calculated'}`,
        `Conversions_Acquisitions,${data.conversions !== null ? Math.round(data.conversions) : 'N/A'},Count,${userEntered.has('conversions') ? 'Manual' : 'Calculated'}`,
        `Conversion_Rate_CR,${data.cr !== null ? data.cr.toFixed(2) : 'N/A'},Percent,${userEntered.has('cr') ? 'Manual' : 'Calculated'}`,
        `Cost_Per_Acquisition_CPA,${data.cpa !== null ? data.cpa.toFixed(2) : 'N/A'},USD,${userEntered.has('cpa') ? 'Manual' : 'Calculated'}`
      ];

      const csvContent = 'data:text/csv;charset=utf-8,' + encodeURIComponent(csvRows.join('\n'));
      const downloadAnchor = document.createElement('a');
      const dateStr = new Date().toISOString().split('T')[0];
      downloadAnchor.setAttribute('href', csvContent);
      downloadAnchor.setAttribute('download', `ppc_campaign_metric_report_${dateStr}.csv`);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      document.body.removeChild(downloadAnchor);
    });
  }

  // --- Copy Summary to Clipboard ---
  if (btnCopySummary) {
    btnCopySummary.addEventListener('click', () => {
      const data = solveMetrics();
      const summaryText = [
        `===========================================`,
        `PPC CAMPAIGN PERFORMANCE AUDIT SUMMARY`,
        `===========================================`,
        `Ad Spend:          $${formatNum(data.spend)}`,
        `Impressions:       ${formatNum(data.impressions, 0)}`,
        `Clicks:            ${formatNum(data.clicks, 0)}`,
        `CTR:               ${formatNum(data.ctr)}%`,
        `CPC:               $${formatNum(data.cpc)}`,
        `CPM:               $${formatNum(data.cpm)}`,
        `-------------------------------------------`,
        `Conversions:       ${formatNum(data.conversions, 0)}`,
        `Conversion Rate:   ${formatNum(data.cr)}%`,
        `Cost / Acq (CPA):  $${formatNum(data.cpa)}`,
        `-------------------------------------------`,
        `Generated:         ${new Date().toLocaleString()}`,
        `===========================================`
      ].join('\n');

      navigator.clipboard.writeText(summaryText).then(() => {
        const orig = btnCopySummary.innerHTML;
        btnCopySummary.innerHTML = `
          <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="color: var(--success);"><polyline points="20 6 9 17 4 12"/></svg>
          Summary Copied!
        `;
        setTimeout(() => {
          btnCopySummary.innerHTML = orig;
        }, 1800);
      });
    });
  }

  // --- Initial Preset Load ---
  // Load initial demo values (Travel benchmark: Spend $2500, CPC $1.53, CTR 4.68%, CR 3.55%)
  userEntered.set('spend', 2500);
  userEntered.set('cpc', 1.53);
  userEntered.set('ctr', 4.68);
  userEntered.set('cr', 3.55);
  fields.spend.input.value = 2500;
  fields.cpc.input.value = 1.53;
  fields.ctr.input.value = 4.68;
  fields.cr.input.value = 3.55;

  solveMetrics();
});