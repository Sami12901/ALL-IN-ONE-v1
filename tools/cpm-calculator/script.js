// CPM Calculator Client Logic

document.addEventListener('DOMContentLoaded', () => {
  // Currency state
  let currentCurrency = 'USD';
  let currencySymbol = '$';
  let currentMode = 'solve-cpm'; // 'solve-cpm' | 'solve-spend' | 'solve-impressions'

  // DOM Elements - Tabs
  const modeTabs = document.querySelectorAll('#mode-tabs .mode-tab');

  // DOM Elements - Inputs
  const inputAdSpend = document.getElementById('input-ad-spend');
  const inputImpressions = document.getElementById('input-impressions');
  const inputCpm = document.getElementById('input-cpm');
  const inputCtr = document.getElementById('input-ctr');
  const inputCvr = document.getElementById('input-cvr');

  const labelSpend = document.getElementById('label-spend');
  const labelImpressions = document.getElementById('label-impressions');
  const labelCpm = document.getElementById('label-cpm');
  const hintImpressions = document.getElementById('hint-impressions');
  const hintCpm = document.getElementById('hint-cpm');

  const currPrefixes = document.querySelectorAll('.curr-prefix');
  const currPills = document.querySelectorAll('#currency-pills .curr-pill');

  // DOM Elements - Outputs
  const heroResultLabel = document.getElementById('hero-result-label');
  const heroResultVal = document.getElementById('hero-result-val');
  const heroCpiVal = document.getElementById('hero-cpi-val');
  const heroSpendSummary = document.getElementById('hero-spend-summary');

  const kpiEstClicks = document.getElementById('kpi-est-clicks');
  const kpiEffCpc = document.getElementById('kpi-eff-cpc');
  const kpiEstConversions = document.getElementById('kpi-est-conversions');
  const kpiEstCpa = document.getElementById('kpi-est-cpa');

  const benchmarkTbody = document.getElementById('benchmark-tbody');
  const copyResultBtn = document.getElementById('copy-result-btn');
  const resetCpmBtn = document.getElementById('reset-cpm-btn');

  const toastMsg = document.getElementById('toast-msg');
  const toastText = document.getElementById('toast-text');

  // Format Helpers
  function formatMoney(amount, decimals = 2) {
    if (isNaN(amount) || !isFinite(amount)) amount = 0;
    return `${currencySymbol}${amount.toLocaleString('en-US', {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals
    })}`;
  }

  function formatNumber(num) {
    if (isNaN(num) || !isFinite(num)) num = 0;
    return Math.round(num).toLocaleString('en-US');
  }

  // Toast
  let toastTimer = null;
  function showToast(text) {
    if (toastTimer) clearTimeout(toastTimer);
    toastText.textContent = text;
    toastMsg.classList.add('show');
    toastTimer = setTimeout(() => {
      toastMsg.classList.remove('show');
    }, 2800);
  }

  // Industry Benchmarks Data
  const benchmarks = [
    { channel: 'Google Display Network (GDN)', range: '$0.50 – $2.50', median: 1.50 },
    { channel: 'Facebook Ads (Feed & Story)', range: '$4.50 – $14.00', median: 8.50 },
    { channel: 'Instagram Ads (Reels & Feed)', range: '$5.00 – $15.50', median: 9.20 },
    { channel: 'TikTok Ads (In-Feed Video)', range: '$3.20 – $9.80', median: 5.50 },
    { channel: 'YouTube Ads (TrueView / Shorts)', range: '$6.00 – $18.50', median: 10.00 },
    { channel: 'LinkedIn Ads (B2B Sponsored)', range: '$22.00 – $48.00', median: 32.00 },
    { channel: 'Pinterest Ads (Promoted Pins)', range: '$2.80 – $6.50', median: 4.20 },
    { channel: 'X / Twitter (Promoted Posts)', range: '$3.50 – $10.00', median: 6.00 }
  ];

  // Render Benchmarks Table
  function renderBenchmarks() {
    let html = '';
    benchmarks.forEach(item => {
      html += `
        <tr>
          <td><strong>${item.channel}</strong></td>
          <td style="color: var(--text-secondary);">${currencySymbol}${item.median.toFixed(2)} (${item.range})</td>
          <td style="text-align: right;">
            <button type="button" class="bench-apply-btn" data-median="${item.median}">
              Apply ${currencySymbol}${item.median.toFixed(2)}
            </button>
          </td>
        </tr>
      `;
    });
    benchmarkTbody.innerHTML = html;

    // Attach click listeners to Apply buttons
    benchmarkTbody.querySelectorAll('.bench-apply-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const targetRate = parseFloat(btn.dataset.median);
        inputCpm.value = targetRate.toFixed(2);

        // If we are currently in solve-cpm mode, switch to solve-spend or solve-impressions
        if (currentMode === 'solve-cpm') {
          setMode('solve-spend');
        } else {
          calculate();
        }
        showToast(`Applied ${currencySymbol}${targetRate.toFixed(2)} CPM benchmark.`);
      });
    });
  }

  // Update Field States Depending on Mode
  function updateInputModeStyles() {
    if (currentMode === 'solve-cpm') {
      inputAdSpend.removeAttribute('readonly');
      inputAdSpend.style.opacity = '1';
      inputImpressions.removeAttribute('readonly');
      inputImpressions.style.opacity = '1';
      inputCpm.setAttribute('readonly', 'true');
      inputCpm.style.opacity = '0.75';

      labelCpm.textContent = 'Cost Per Mille (CPM) — Calculated';
      labelSpend.textContent = 'Total Ad Spend / Cost';
      labelImpressions.textContent = 'Total Ad Impressions';
    } else if (currentMode === 'solve-spend') {
      inputAdSpend.setAttribute('readonly', 'true');
      inputAdSpend.style.opacity = '0.75';
      inputImpressions.removeAttribute('readonly');
      inputImpressions.style.opacity = '1';
      inputCpm.removeAttribute('readonly');
      inputCpm.style.opacity = '1';

      labelSpend.textContent = 'Total Ad Spend / Budget — Calculated';
      labelCpm.textContent = 'Target Cost Per Mille (CPM)';
      labelImpressions.textContent = 'Planned Ad Impressions';
    } else if (currentMode === 'solve-impressions') {
      inputImpressions.setAttribute('readonly', 'true');
      inputImpressions.style.opacity = '0.75';
      inputAdSpend.removeAttribute('readonly');
      inputAdSpend.style.opacity = '1';
      inputCpm.removeAttribute('readonly');
      inputCpm.style.opacity = '1';

      labelImpressions.textContent = 'Total Ad Impressions — Calculated';
      labelSpend.textContent = 'Total Ad Budget';
      labelCpm.textContent = 'Target Cost Per Mille (CPM)';
    }
  }

  // Set Mode
  function setMode(mode) {
    currentMode = mode;
    modeTabs.forEach(tab => {
      tab.classList.toggle('active', tab.dataset.mode === mode);
    });
    updateInputModeStyles();
    calculate();
  }

  modeTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      setMode(tab.dataset.mode);
    });
  });

  // Calculate Function
  function calculate() {
    let spend = Math.max(0, parseFloat(inputAdSpend.value) || 0);
    let impressions = Math.max(0, parseFloat(inputImpressions.value) || 0);
    let cpm = Math.max(0, parseFloat(inputCpm.value) || 0);
    const ctr = Math.max(0, parseFloat(inputCtr.value) || 0);
    const cvr = Math.max(0, parseFloat(inputCvr.value) || 0);

    // 3-way equation logic
    if (currentMode === 'solve-cpm') {
      if (impressions > 0) {
        cpm = (spend / impressions) * 1000;
        inputCpm.value = cpm.toFixed(2);
      } else {
        cpm = 0;
        inputCpm.value = '0.00';
      }
      heroResultLabel.textContent = 'Computed Cost Per Mille (CPM)';
      heroResultVal.textContent = formatMoney(cpm);
    } else if (currentMode === 'solve-spend') {
      spend = (cpm * impressions) / 1000;
      inputAdSpend.value = spend.toFixed(2);

      heroResultLabel.textContent = 'Computed Ad Spend / Budget';
      heroResultVal.textContent = formatMoney(spend);
    } else if (currentMode === 'solve-impressions') {
      if (cpm > 0) {
        impressions = (spend / cpm) * 1000;
        inputImpressions.value = Math.round(impressions);
      } else {
        impressions = 0;
        inputImpressions.value = '0';
      }
      heroResultLabel.textContent = 'Computed Ad Impressions';
      heroResultVal.textContent = formatNumber(impressions);
    }

    // Secondary metrics
    const cpi = impressions > 0 ? spend / impressions : 0;
    const estClicks = impressions * (ctr / 100);
    const effCpc = estClicks > 0 ? spend / estClicks : 0;
    const estConversions = estClicks * (cvr / 100);
    const estCpa = estConversions > 0 ? spend / estConversions : 0;

    heroCpiVal.textContent = `${currencySymbol}${cpi.toFixed(4)}`;
    heroSpendSummary.textContent = formatMoney(spend);

    kpiEstClicks.textContent = formatNumber(estClicks);
    kpiEffCpc.textContent = formatMoney(effCpc);
    kpiEstConversions.textContent = formatNumber(estConversions);
    kpiEstCpa.textContent = formatMoney(estCpa);

    return {
      mode: currentMode,
      spend,
      impressions,
      cpm,
      ctr,
      cvr,
      cpi,
      estClicks,
      effCpc,
      estConversions,
      estCpa
    };
  }

  // Currency Selection
  function setCurrency(currency, symbol) {
    currentCurrency = currency;
    currencySymbol = symbol;

    currPrefixes.forEach(prefix => {
      prefix.textContent = symbol;
    });

    currPills.forEach(pill => {
      pill.classList.toggle('active', pill.dataset.currency === currency);
    });

    renderBenchmarks();
    calculate();
  }

  currPills.forEach(pill => {
    pill.addEventListener('click', () => {
      setCurrency(pill.dataset.currency, pill.dataset.symbol);
    });
  });

  // Listeners
  [inputAdSpend, inputImpressions, inputCpm, inputCtr, inputCvr].forEach(inp => {
    inp.addEventListener('input', calculate);
  });

  // Reset
  resetCpmBtn.addEventListener('click', () => {
    inputAdSpend.value = 2500;
    inputImpressions.value = 350000;
    inputCpm.value = 7.14;
    inputCtr.value = 1.20;
    inputCvr.value = 3.5;
    setCurrency('USD', '$');
    setMode('solve-cpm');
    showToast('Reset to default values.');
  });

  // 1-Click Copy Result
  copyResultBtn.addEventListener('click', () => {
    const data = calculate();
    const summary = `=== DIGITAL MARKETING CPM ANALYSIS ===
Cost Per Mille (CPM): ${formatMoney(data.cpm)}
Total Ad Spend: ${formatMoney(data.spend)}
Total Impressions: ${formatNumber(data.impressions)}
Cost Per Impression (CPI): ${currencySymbol}${data.cpi.toFixed(4)}
--------------------------------------
Click-Through Rate (CTR): ${data.ctr.toFixed(2)}%
Estimated Clicks: ${formatNumber(data.estClicks)}
Effective CPC: ${formatMoney(data.effCpc)}
Conversion Rate (CVR): ${data.cvr.toFixed(2)}%
Estimated Conversions: ${formatNumber(data.estConversions)}
Estimated CPA: ${formatMoney(data.estCpa)}
Currency: ${currentCurrency}`;

    navigator.clipboard.writeText(summary).then(() => {
      showToast('CPM result & summary copied to clipboard!');
    }).catch(() => {
      showToast('Copied to clipboard.');
    });
  });

  // Initial render
  renderBenchmarks();
  updateInputModeStyles();
  calculate();
});