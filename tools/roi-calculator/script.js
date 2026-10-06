// ROI Calculator Client Logic

document.addEventListener('DOMContentLoaded', () => {
  // Currency state
  let currentCurrency = 'USD';
  let currencySymbol = '$';

  // DOM Elements - Inputs
  const investedInput = document.getElementById('amount-invested');
  const returnedInput = document.getElementById('amount-returned');
  const durationValInput = document.getElementById('duration-val');
  const durationUnitSelect = document.getElementById('duration-unit');

  const currPrefixes = document.querySelectorAll('.curr-prefix');
  const currPills = document.querySelectorAll('#currency-pills .curr-pill');
  const presetPills = document.querySelectorAll('.preset-pill');

  // Subcost Breakdown Elements
  const toggleSubcostsBtn = document.getElementById('toggle-subcosts-btn');
  const subcostsContainer = document.getElementById('subcosts-container');
  const subAdSpend = document.getElementById('sub-ad-spend');
  const subCreative = document.getElementById('sub-creative');
  const subManagement = document.getElementById('sub-management');
  const subTools = document.getElementById('sub-tools');
  const subInputs = [subAdSpend, subCreative, subManagement, subTools];

  // DOM Elements - Outputs
  const heroRoiPct = document.getElementById('hero-roi-pct');
  const heroNetProfit = document.getElementById('hero-net-profit');

  const kpiRoas = document.getElementById('kpi-roas');
  const kpiMargin = document.getElementById('kpi-margin');
  const kpiAnnualized = document.getElementById('kpi-annualized');
  const kpiCapitalRatio = document.getElementById('kpi-capital-ratio');

  // Gauge Elements
  const gaugeNeedle = document.getElementById('gauge-needle');
  const gaugeBadge = document.getElementById('gauge-badge');
  const gaugeBadgeText = document.getElementById('gauge-badge-text');
  const gaugeDiagnosis = document.getElementById('gauge-diagnosis');

  // Scenario Table Body
  const sensitivityTableBody = document.getElementById('sensitivity-table-body');

  // Action Buttons & Toast
  const copyReportBtn = document.getElementById('copy-report-btn');
  const printRoiBtn = document.getElementById('print-roi-btn');
  const resetRoiBtn = document.getElementById('reset-roi-btn');

  const toastMsg = document.getElementById('toast-msg');
  const toastText = document.getElementById('toast-text');

  // Format Helpers
  function formatMoney(amount) {
    if (isNaN(amount) || !isFinite(amount)) amount = 0;
    const sign = amount < 0 ? '-' : '';
    const absVal = Math.abs(amount);
    return `${sign}${currencySymbol}${absVal.toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    })}`;
  }

  function formatPct(val) {
    if (isNaN(val) || !isFinite(val)) return '0.0%';
    const sign = val > 0 ? '+' : '';
    return `${sign}${val.toFixed(1)}%`;
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

  // Calculate & Update UI
  function calculate() {
    const cost = Math.max(0.01, parseFloat(investedInput.value) || 0.01);
    const revenue = Math.max(0, parseFloat(returnedInput.value) || 0);
    const durationVal = Math.max(0.1, parseFloat(durationValInput.value) || 1);
    const durationUnit = durationUnitSelect.value;

    const netProfit = revenue - cost;
    const roiPct = (netProfit / cost) * 100;
    const roas = revenue / cost;
    const profitMargin = revenue > 0 ? (netProfit / revenue) * 100 : 0;

    // Convert duration to years for Annualized ROI
    let years = 1;
    if (durationUnit === 'months') {
      years = durationVal / 12;
    } else if (durationUnit === 'days') {
      years = durationVal / 365;
    } else {
      years = durationVal;
    }
    if (years <= 0) years = 0.01;

    let annualizedRoi = 0;
    if (revenue > 0 && cost > 0) {
      if (roas > 0) {
        annualizedRoi = (Math.pow(roas, 1 / years) - 1) * 100;
      }
    } else {
      annualizedRoi = -100;
    }

    // Update Hero ROI Display
    heroRoiPct.textContent = formatPct(roiPct);
    heroRoiPct.className = 'hero-metric-val ' + (roiPct > 15 ? 'positive' : (roiPct >= 0 ? 'neutral' : 'negative'));
    heroNetProfit.textContent = formatMoney(netProfit);

    // Update KPI Mini Cards
    kpiRoas.textContent = `${roas.toFixed(2)}x`;
    kpiMargin.textContent = `${profitMargin.toFixed(1)}%`;
    kpiAnnualized.textContent = isFinite(annualizedRoi) ? formatPct(annualizedRoi) : 'N/A';
    kpiCapitalRatio.textContent = `${roas.toFixed(1)} : 1`;

    // Map ROI to Gauge Angle (-90 deg to +90 deg)
    let needleDeg = 0;
    if (roiPct < 0) {
      // Map -100% to 0% -> -90 deg to -45 deg
      const ratio = Math.max(-1, roiPct / 100);
      needleDeg = -45 + (ratio * 45);
    } else if (roiPct <= 20) {
      // Map 0% to 20% -> -45 deg to -15 deg
      const ratio = roiPct / 20;
      needleDeg = -45 + (ratio * 30);
    } else if (roiPct <= 100) {
      // Map 20% to 100% -> -15 deg to +35 deg
      const ratio = (roiPct - 20) / 80;
      needleDeg = -15 + (ratio * 50);
    } else {
      // Map 100% to 300%+ -> +35 deg to +90 deg
      const ratio = Math.min(1, (roiPct - 100) / 200);
      needleDeg = 35 + (ratio * 55);
    }
    needleDeg = Math.max(-90, Math.min(90, needleDeg));
    gaugeNeedle.setAttribute('transform', `rotate(${needleDeg.toFixed(1)}, 100, 100)`);

    // Performance Tier Badge & Diagnosis
    gaugeBadge.className = 'gauge-badge';
    if (roiPct < 0) {
      gaugeBadge.classList.add('badge-negative');
      gaugeBadgeText.textContent = 'Negative ROI (Loss)';
      gaugeDiagnosis.textContent = `Capital loss of ${formatMoney(Math.abs(netProfit))}. Campaign returned ${currencySymbol}${(cost - revenue).toFixed(2)} less than total invested.`;
    } else if (roiPct < 15) {
      gaugeBadge.classList.add('badge-breakeven');
      gaugeBadgeText.textContent = 'Break-Even / Marginal';
      gaugeDiagnosis.textContent = `Returning approximately $${roas.toFixed(2)} per $1 invested. Generates slight or flat return with minimal safety buffer.`;
    } else if (roiPct < 100) {
      gaugeBadge.classList.add('badge-moderate');
      gaugeBadgeText.textContent = 'Solid Profitable Growth';
      gaugeDiagnosis.textContent = `Healthy performance with ${roas.toFixed(2)}x ROAS. Generating a solid profit margin of ${profitMargin.toFixed(1)}%.`;
    } else {
      gaugeBadge.classList.add('badge-exceptional');
      gaugeBadgeText.textContent = 'Exceptional / High ROI';
      gaugeDiagnosis.textContent = `Outstanding efficiency! Every $1.00 spent returns $${roas.toFixed(2)} in revenue with a remarkable ${(roiPct).toFixed(0)}% gain.`;
    }

    // Sensitivity Scenarios Table
    const scenarios = [
      { label: '-30% Slump', factor: 0.70 },
      { label: '-20% Downside', factor: 0.80 },
      { label: '-10% Conservative', factor: 0.90 },
      { label: 'Base Case (Current)', factor: 1.00, isBase: true },
      { label: '+10% Growth', factor: 1.10 },
      { label: '+20% Optimistic', factor: 1.20 },
      { label: '+30% Strong Upside', factor: 1.30 },
      { label: '+50% Surge', factor: 1.50 }
    ];

    let scRowsHtml = '';
    scenarios.forEach(sc => {
      const sRev = revenue * sc.factor;
      const sNet = sRev - cost;
      const sRoi = (sNet / cost) * 100;
      const sRoas = sRev / cost;

      const roiClass = sRoi > 0 ? 'style="color: var(--success);"' : (sRoi === 0 ? '' : 'style="color: var(--error);"');

      scRowsHtml += `
        <tr class="${sc.isBase ? 'base-row' : ''}">
          <td>${sc.label}</td>
          <td style="text-align: right;">${formatMoney(sRev)}</td>
          <td style="text-align: right;">${formatMoney(sNet)}</td>
          <td style="text-align: right;" ${roiClass}>${formatPct(sRoi)}</td>
          <td style="text-align: right; color: var(--accent);">${sRoas.toFixed(2)}x</td>
        </tr>
      `;
    });

    sensitivityTableBody.innerHTML = scRowsHtml;

    return {
      cost,
      revenue,
      durationVal,
      durationUnit,
      netProfit,
      roiPct,
      roas,
      profitMargin,
      annualizedRoi
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

    calculate();
  }

  currPills.forEach(pill => {
    pill.addEventListener('click', () => {
      setCurrency(pill.dataset.currency, pill.dataset.symbol);
    });
  });

  // Toggle Sub-costs accordion
  let subcostsVisible = false;
  toggleSubcostsBtn.addEventListener('click', () => {
    subcostsVisible = !subcostsVisible;
    subcostsContainer.style.display = subcostsVisible ? 'flex' : 'none';
    toggleSubcostsBtn.textContent = subcostsVisible ? 'Hide Breakdown' : 'Show Breakdown';
  });

  // Sync sub-costs into amount invested
  subInputs.forEach(input => {
    input.addEventListener('input', () => {
      const sum = subInputs.reduce((acc, el) => acc + (Math.max(0, parseFloat(el.value) || 0)), 0);
      investedInput.value = sum;
      calculate();
    });
  });

  // Primary Input listeners
  investedInput.addEventListener('input', calculate);
  returnedInput.addEventListener('input', calculate);
  durationValInput.addEventListener('input', calculate);
  durationUnitSelect.addEventListener('change', calculate);

  // Presets
  const presets = {
    ecommerce: { cost: 5000, rev: 18500, dur: 1, unit: 'months' },
    saas: { cost: 25000, rev: 72000, dur: 6, unit: 'months' },
    influencer: { cost: 8000, rev: 14000, dur: 2, unit: 'months' },
    breakeven: { cost: 10000, rev: 10000, dur: 3, unit: 'months' },
    loss: { cost: 10000, rev: 6500, dur: 1, unit: 'months' }
  };

  presetPills.forEach(pill => {
    pill.addEventListener('click', () => {
      const p = presets[pill.dataset.preset];
      if (!p) return;
      investedInput.value = p.cost;
      returnedInput.value = p.rev;
      durationValInput.value = p.dur;
      durationUnitSelect.value = p.unit;
      calculate();
    });
  });

  // Reset
  resetRoiBtn.addEventListener('click', () => {
    investedInput.value = 5000;
    returnedInput.value = 18500;
    durationValInput.value = 6;
    durationUnitSelect.value = 'months';
    setCurrency('USD', '$');
    showToast('Reset to default values.');
  });

  // Copy Executive Report
  copyReportBtn.addEventListener('click', () => {
    const data = calculate();
    const summary = `=== EXECUTIVE ROI & PROFITABILITY REPORT ===
Amount Invested: ${formatMoney(data.cost)}
Amount Returned / Revenue: ${formatMoney(data.revenue)}
Investment Horizon: ${data.durationVal} ${data.durationUnit}
---------------------------------------------
NET PROFIT: ${formatMoney(data.netProfit)}
RETURN ON INVESTMENT (ROI): ${formatPct(data.roiPct)}
RETURN ON AD SPEND (ROAS): ${data.roas.toFixed(2)}x
PROFIT MARGIN: ${data.profitMargin.toFixed(1)}%
ANNUALIZED ROI: ${isFinite(data.annualizedRoi) ? formatPct(data.annualizedRoi) : 'N/A'}
Currency: ${currentCurrency}`;

    navigator.clipboard.writeText(summary).then(() => {
      showToast('ROI Executive summary copied to clipboard!');
    }).catch(() => {
      showToast('Copied to clipboard.');
    });
  });

  // Print Report
  printRoiBtn.addEventListener('click', () => {
    window.print();
  });

  // Initial run
  calculate();
});