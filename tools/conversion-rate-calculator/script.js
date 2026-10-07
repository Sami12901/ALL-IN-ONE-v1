// Conversion Rate & A/B Testing Statistical Significance Engine
// Implements two-proportion Z-test, p-value, normal CDF erf approximation, confidence intervals, and single-funnel analysis.

(function () {
  'use strict';

  // Math helper: Error function (erf) approximation (Abramowitz & Stegun 7.1.26)
  function erf(x) {
    const a1 = 0.254829592;
    const a2 = -0.284496736;
    const a3 = 1.421413741;
    const a4 = -1.453152027;
    const a5 = 1.061405429;
    const p = 0.3275911;

    const sign = x < 0 ? -1 : 1;
    const absX = Math.abs(x);

    const t = 1.0 / (1.0 + p * absX);
    const y = 1.0 - (((((a5 * t + a4) * t) + a3) * t + a2) * t + a1) * t * Math.exp(-absX * absX);

    return sign * y;
  }

  // Standard Normal Cumulative Distribution Function Phi(z)
  function normalCdf(z) {
    return 0.5 * (1.0 + erf(z / Math.SQRT2));
  }

  // Critical Z for confidence levels
  function getZCritical(confLevel) {
    if (confLevel >= 99) return 2.576;
    if (confLevel >= 95) return 1.960;
    if (confLevel >= 90) return 1.645;
    return 1.960;
  }

  // Formatting helpers
  const currencyFormatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });

  const numberFormatter = new Intl.NumberFormat('en-US');

  function formatCurrency(val) {
    return currencyFormatter.format(isNaN(val) ? 0 : val);
  }

  function formatNumber(val) {
    return numberFormatter.format(Math.round(val || 0));
  }

  function formatPct(val, decimals = 2, showPlus = false) {
    if (isNaN(val) || !isFinite(val)) return '0.00%';
    const sign = (showPlus && val > 0) ? '+' : '';
    return sign + val.toFixed(decimals) + '%';
  }

  // Toast Notification
  function showToast(message) {
    let toast = document.getElementById('app-toast');
    if (!toast) {
      toast = document.createElement('div');
      toast.id = 'app-toast';
      toast.className = 'toast-popup';
      toast.style.cssText = 'position:fixed;bottom:2rem;right:2rem;background:var(--surface,#1e293b);border:1px solid var(--accent,#4e85bf);box-shadow:0 10px 30px rgba(0,0,0,0.4);color:var(--text-primary,#fff);padding:0.75rem 1.4rem;border-radius:8px;font-size:0.875rem;font-weight:600;opacity:0;transform:translateY(100px);transition:all 0.3s ease;z-index:9999;pointer-events:none;';
      document.body.appendChild(toast);
    }
    toast.textContent = message;
    toast.style.opacity = '1';
    toast.style.transform = 'translateY(0)';
    clearTimeout(toast._timer);
    toast._timer = setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(100px)';
    }, 2400);
  }

  function copyText(text, successMsg = 'Copied to clipboard!') {
    if (!text) return;
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(() => {
        showToast(successMsg);
      }).catch(() => {
        fallbackCopy(text, successMsg);
      });
    } else {
      fallbackCopy(text, successMsg);
    }
  }

  function fallbackCopy(text, successMsg) {
    const ta = document.createElement('textarea');
    ta.value = text;
    ta.style.position = 'fixed';
    ta.style.opacity = '0';
    document.body.appendChild(ta);
    ta.select();
    try {
      document.execCommand('copy');
      showToast(successMsg);
    } catch (e) {
      showToast('Copy failed');
    }
    document.body.removeChild(ta);
  }

  // Test Presets
  const PRESETS = {
    checkout: {
      ctrlVis: 12500,
      ctrlConv: 625,
      ctrlAov: 45.00,
      varVis: 12750,
      varConv: 740,
      varAov: 45.00,
      targetConf: 95
    },
    cta: {
      ctrlVis: 8200,
      ctrlConv: 410,
      ctrlAov: 30.00,
      varVis: 8150,
      varConv: 420,
      varAov: 30.00,
      targetConf: 95
    },
    pricing: {
      ctrlVis: 22000,
      ctrlConv: 440,
      ctrlAov: 120.00,
      varVis: 21800,
      varConv: 545,
      varAov: 120.00,
      targetConf: 95
    },
    negative: {
      ctrlVis: 15000,
      ctrlConv: 900,
      ctrlAov: 50.00,
      varVis: 15200,
      varConv: 760,
      varAov: 50.00,
      targetConf: 95
    }
  };

  // Main UI Controller
  document.addEventListener('DOMContentLoaded', () => {
    // Mode Switching
    const tabModeAb = document.getElementById('tab-mode-ab');
    const tabModeSingle = document.getElementById('tab-mode-single');
    const sectionAbInputs = document.getElementById('section-ab-inputs');
    const sectionAbResults = document.getElementById('section-ab-results');
    const sectionSingleInputs = document.getElementById('section-single-inputs');
    const sectionSingleResults = document.getElementById('section-single-results');

    let currentMode = 'ab'; // 'ab' | 'single'

    function switchMode(mode) {
      currentMode = mode;
      if (mode === 'ab') {
        tabModeAb?.classList.add('active');
        tabModeSingle?.classList.remove('active');
        if (sectionAbInputs) sectionAbInputs.style.display = 'block';
        if (sectionAbResults) sectionAbResults.style.display = 'flex';
        if (sectionSingleInputs) sectionSingleInputs.style.display = 'none';
        if (sectionSingleResults) sectionSingleResults.style.display = 'none';
        calculateAB();
      } else {
        tabModeAb?.classList.remove('active');
        tabModeSingle?.classList.add('active');
        if (sectionAbInputs) sectionAbInputs.style.display = 'none';
        if (sectionAbResults) sectionAbResults.style.display = 'none';
        if (sectionSingleInputs) sectionSingleInputs.style.display = 'block';
        if (sectionSingleResults) sectionSingleResults.style.display = 'flex';
        calculateSingle();
      }
    }

    tabModeAb?.addEventListener('click', () => switchMode('ab'));
    tabModeSingle?.addEventListener('click', () => switchMode('single'));

    // A/B Inputs
    const abCtrlVisInput = document.getElementById('ab-ctrl-visitors');
    const abCtrlConvInput = document.getElementById('ab-ctrl-conversions');
    const abCtrlAovInput = document.getElementById('ab-ctrl-aov');
    const abVarVisInput = document.getElementById('ab-var-visitors');
    const abVarConvInput = document.getElementById('ab-var-conversions');
    const abVarAovInput = document.getElementById('ab-var-aov');
    const abConfTargetSelect = document.getElementById('ab-confidence-target');

    // A/B Output Elements
    const abVerdictBox = document.getElementById('ab-verdict-box');
    const abVerdictTitle = document.getElementById('ab-verdict-title');
    const abVerdictDesc = document.getElementById('ab-verdict-desc');
    const barCtrlVal = document.getElementById('bar-ctrl-val');
    const barCtrlFill = document.getElementById('bar-ctrl-fill');
    const barVarVal = document.getElementById('bar-var-val');
    const barVarFill = document.getElementById('bar-var-fill');

    const metricAbLift = document.getElementById('metric-ab-lift');
    const metricAbDiff = document.getElementById('metric-ab-diff');
    const metricAbConfidence = document.getElementById('metric-ab-confidence');
    const metricAbPval = document.getElementById('metric-ab-pval');
    const metricAbZscore = document.getElementById('metric-ab-zscore');
    const metricAbRpv = document.getElementById('metric-ab-rpv');
    const metricAbTotRev = document.getElementById('metric-ab-tot-rev');

    const tableAbCi = document.getElementById('table-ab-ci');
    const tableAbSe = document.getElementById('table-ab-se');
    const tableAbSample = document.getElementById('table-ab-sample');
    const tableAbCtrlRpv = document.getElementById('table-ab-ctrl-rpv');
    const tableAbVarRpv = document.getElementById('table-ab-var-rpv');

    // Single Funnel Inputs
    const singleVisInput = document.getElementById('single-visitors');
    const singleConvInput = document.getElementById('single-conversions');
    const singleAovInput = document.getElementById('single-aov');

    // Single Funnel Outputs
    const singleCrVal = document.getElementById('single-cr-val');
    const singleCiRange = document.getElementById('single-ci-range');
    const singleMoe = document.getElementById('single-moe');
    const singleRpv = document.getElementById('single-rpv');
    const singleTotRev = document.getElementById('single-tot-rev');
    const singleDropoff = document.getElementById('single-dropoff');
    const singleUnconverted = document.getElementById('single-unconverted');
    const singlePerThousand = document.getElementById('single-per-thousand');

    // Buttons
    const btnExport = document.getElementById('btn-export-summary');
    const btnReset = document.getElementById('btn-reset-calc');

    let lastAbResults = null;
    let lastSingleResults = null;

    // A/B Calculation
    function calculateAB() {
      const n1 = Math.max(1, parseFloat(abCtrlVisInput?.value) || 0);
      const c1 = Math.max(0, Math.min(n1, parseFloat(abCtrlConvInput?.value) || 0));
      const aov1 = Math.max(0, parseFloat(abCtrlAovInput?.value) || 0);

      const n2 = Math.max(1, parseFloat(abVarVisInput?.value) || 0);
      const c2 = Math.max(0, Math.min(n2, parseFloat(abVarConvInput?.value) || 0));
      const aov2 = Math.max(0, parseFloat(abVarAovInput?.value) || 0);

      const targetConf = parseFloat(abConfTargetSelect?.value) || 95;

      const cr1 = c1 / n1;
      const cr2 = c2 / n2;

      const absDiff = cr2 - cr1;
      const relLift = cr1 > 0 ? (absDiff / cr1) * 100 : 0;

      // Pooled Proportion & Standard Error
      const pooledP = (c1 + c2) / (n1 + n2);
      const sePooled = Math.sqrt(pooledP * (1 - pooledP) * (1 / n1 + 1 / n2));

      // Z-Score & Two-Tailed p-value
      let zScore = 0;
      if (sePooled > 0) {
        zScore = absDiff / sePooled;
      }
      const pValue = 2.0 * (1.0 - normalCdf(Math.abs(zScore)));
      const confidence = Math.max(0, Math.min(100, (1.0 - pValue) * 100));

      // Unpooled Standard Error for Confidence Interval
      const seUnpooled = Math.sqrt((cr1 * (1 - cr1) / n1) + (cr2 * (1 - cr2) / n2));
      const zCrit = getZCritical(targetConf);
      const ciLower = (absDiff - zCrit * seUnpooled) * 100;
      const ciUpper = (absDiff + zCrit * seUnpooled) * 100;

      // Revenue Metrics
      const rpv1 = cr1 * aov1;
      const rpv2 = cr2 * aov2;
      const rpvDiff = rpv2 - rpv1;
      const totalRevGain = rpvDiff * n2;

      // Verdict Logic
      const isSignificant = confidence >= targetConf;
      let verdictStatus = 'neutral';
      let verdictTitleText = '';
      let verdictDescText = '';

      if (isSignificant) {
        if (absDiff > 0) {
          verdictStatus = 'success';
          verdictTitleText = '🏆 Variation (B) is the Winner!';
          verdictDescText = `Variation B achieved a statistically significant lift of ${formatPct(relLift, 1, true)} with ${confidence.toFixed(1)}% confidence (p = ${pValue.toFixed(4)}). You have reached the ${targetConf}% threshold and can safely deploy Variation B to 100% of traffic.`;
        } else if (absDiff < 0) {
          verdictStatus = 'loss';
          verdictTitleText = '⚠️ Control (A) Outperforms Variation (B)';
          verdictDescText = `Variation B caused a statistically significant drop of ${formatPct(relLift, 1, true)} with ${confidence.toFixed(1)}% confidence. Retain Control A and avoid rolling out Variation B.`;
        } else {
          verdictStatus = 'neutral';
          verdictTitleText = '⚖️ No Detectable Difference';
          verdictDescText = 'Both variations produced identical conversion rates. No significant lift detected.';
        }
      } else {
        verdictStatus = 'neutral';
        verdictTitleText = '⏳ Test Inconclusive (Keep Running)';
        verdictDescText = `Current confidence is ${confidence.toFixed(1)}%, which is below your target threshold of ${targetConf}%. Continue collecting traffic until enough sample size is gathered to verify the lift.`;
      }

      // Update Verdict UI
      if (abVerdictBox) {
        abVerdictBox.className = `verdict-banner verdict-${verdictStatus}`;
      }
      if (abVerdictTitle) {
        abVerdictTitle.className = `verdict-title text-${verdictStatus}`;
        abVerdictTitle.innerHTML = `<span>${verdictTitleText}</span>`;
      }
      if (abVerdictDesc) {
        abVerdictDesc.textContent = verdictDescText;
      }

      // Update Bar Graphic (Normalize relative to max of both or 10%)
      const maxCr = Math.max(cr1, cr2, 0.05);
      const widthCtrl = Math.min(100, Math.max(4, (cr1 / maxCr) * 85));
      const widthVar = Math.min(100, Math.max(4, (cr2 / maxCr) * 85));

      if (barCtrlVal) barCtrlVal.textContent = formatPct(cr1 * 100, 2);
      if (barVarVal) barVarVal.textContent = formatPct(cr2 * 100, 2);
      if (barCtrlFill) barCtrlFill.style.width = `${widthCtrl}%`;
      if (barVarFill) barVarFill.style.width = `${widthVar}%`;

      // Update Metrics Cards
      if (metricAbLift) {
        metricAbLift.textContent = formatPct(relLift, 1, true);
        metricAbLift.style.color = relLift > 0 ? '#34d399' : relLift < 0 ? '#f87171' : 'var(--text-primary)';
      }
      if (metricAbDiff) {
        metricAbDiff.textContent = `${formatPct(absDiff * 100, 2, true)} abs diff`;
      }
      if (metricAbConfidence) {
        metricAbConfidence.textContent = `${confidence.toFixed(1)}%`;
      }
      if (metricAbPval) {
        metricAbPval.textContent = `p = ${pValue < 0.0001 ? '< 0.0001' : pValue.toFixed(4)}`;
      }
      if (metricAbZscore) {
        metricAbZscore.textContent = (zScore >= 0 ? '+' : '') + zScore.toFixed(2);
      }
      if (metricAbRpv) {
        metricAbRpv.textContent = (rpvDiff >= 0 ? '+' : '') + formatCurrency(rpvDiff);
      }
      if (metricAbTotRev) {
        metricAbTotRev.textContent = `Est. gain: ${formatCurrency(totalRevGain)}`;
      }

      // Update Table
      if (tableAbCi) {
        tableAbCi.textContent = `[${formatPct(ciLower, 2, true)}, ${formatPct(ciUpper, 2, true)}]`;
      }
      if (tableAbSe) {
        tableAbSe.textContent = sePooled.toFixed(5);
      }
      if (tableAbSample) {
        const totalSample = n1 + n2;
        if (totalSample > 10000) {
          tableAbSample.textContent = `High power (${formatNumber(totalSample)} visitors)`;
        } else if (totalSample > 2000) {
          tableAbSample.textContent = `Adequate sample (${formatNumber(totalSample)} visitors)`;
        } else {
          tableAbSample.textContent = `Low sample size (${formatNumber(totalSample)} visitors) — continue test`;
        }
      }
      if (tableAbCtrlRpv) {
        tableAbCtrlRpv.textContent = formatCurrency(rpv1);
      }
      if (tableAbVarRpv) {
        tableAbVarRpv.textContent = formatCurrency(rpv2);
      }

      lastAbResults = {
        n1, c1, aov1, cr1, rpv1,
        n2, c2, aov2, cr2, rpv2,
        relLift, absDiff, zScore, pValue, confidence, targetConf,
        ciLower, ciUpper, sePooled, totalRevGain, verdictTitleText
      };
    }

    // Single Funnel Calculation
    function calculateSingle() {
      const n = Math.max(1, parseFloat(singleVisInput?.value) || 0);
      const c = Math.max(0, Math.min(n, parseFloat(singleConvInput?.value) || 0));
      const aov = Math.max(0, parseFloat(singleAovInput?.value) || 0);

      const cr = c / n;
      const se = Math.sqrt((cr * (1 - cr)) / n);
      const moe = 1.96 * se;

      const ciLow = Math.max(0, (cr - moe) * 100);
      const ciHigh = Math.min(100, (cr + moe) * 100);

      const rpv = cr * aov;
      const totalRev = c * aov;
      const dropoffRate = (1.0 - cr) * 100;
      const unconverted = n - c;
      const perThousand = Math.round(cr * 1000);

      if (singleCrVal) {
        singleCrVal.textContent = formatPct(cr * 100, 2);
      }
      if (singleCiRange) {
        singleCiRange.textContent = `95% Confidence Interval: [${formatPct(ciLow, 2)} — ${formatPct(ciHigh, 2)}]`;
      }
      if (singleMoe) {
        singleMoe.textContent = `±${formatPct(moe * 100, 2)}`;
      }
      if (singleRpv) {
        singleRpv.textContent = formatCurrency(rpv);
      }
      if (singleTotRev) {
        singleTotRev.textContent = `Total Rev: ${formatCurrency(totalRev)}`;
      }
      if (singleDropoff) {
        singleDropoff.textContent = formatPct(dropoffRate, 2);
      }
      if (singleUnconverted) {
        singleUnconverted.textContent = `${formatNumber(unconverted)} drop-offs`;
      }
      if (singlePerThousand) {
        singlePerThousand.textContent = formatNumber(perThousand);
      }

      lastSingleResults = {
        n, c, aov, cr, se, moe, ciLow, ciHigh,
        rpv, totalRev, dropoffRate, unconverted, perThousand
      };
    }

    // Event Listeners for Live Reactive Recalculation
    [abCtrlVisInput, abCtrlConvInput, abCtrlAovInput, abVarVisInput, abVarConvInput, abVarAovInput, abConfTargetSelect].forEach(el => {
      el?.addEventListener('input', calculateAB);
      el?.addEventListener('change', calculateAB);
    });

    [singleVisInput, singleConvInput, singleAovInput].forEach(el => {
      el?.addEventListener('input', calculateSingle);
      el?.addEventListener('change', calculateSingle);
    });

    // Preset Chips
    document.querySelectorAll('.preset-chip').forEach(chip => {
      chip.addEventListener('click', () => {
        const testKey = chip.getAttribute('data-test');
        const p = PRESETS[testKey];
        if (!p) return;

        switchMode('ab');

        if (abCtrlVisInput) abCtrlVisInput.value = p.ctrlVis;
        if (abCtrlConvInput) abCtrlConvInput.value = p.ctrlConv;
        if (abCtrlAovInput) abCtrlAovInput.value = p.ctrlAov;
        if (abVarVisInput) abVarVisInput.value = p.varVis;
        if (abVarConvInput) abVarConvInput.value = p.varConv;
        if (abVarAovInput) abVarAovInput.value = p.varAov;
        if (abConfTargetSelect) abConfTargetSelect.value = p.targetConf;

        calculateAB();
        showToast(`Loaded test preset: ${chip.textContent.trim()}`);
      });
    });

    // Reset Button
    btnReset?.addEventListener('click', () => {
      if (currentMode === 'ab') {
        const def = PRESETS.checkout;
        if (abCtrlVisInput) abCtrlVisInput.value = def.ctrlVis;
        if (abCtrlConvInput) abCtrlConvInput.value = def.ctrlConv;
        if (abCtrlAovInput) abCtrlAovInput.value = def.ctrlAov;
        if (abVarVisInput) abVarVisInput.value = def.varVis;
        if (abVarConvInput) abVarConvInput.value = def.varConv;
        if (abVarAovInput) abVarAovInput.value = def.varAov;
        if (abConfTargetSelect) abConfTargetSelect.value = 95;
        calculateAB();
        showToast('A/B inputs reset to defaults');
      } else {
        if (singleVisInput) singleVisInput.value = 10000;
        if (singleConvInput) singleConvInput.value = 420;
        if (singleAovInput) singleAovInput.value = 50.00;
        calculateSingle();
        showToast('Single funnel inputs reset to defaults');
      }
    });

    // Export Summary Report
    btnExport?.addEventListener('click', () => {
      const now = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
      let report = '';

      if (currentMode === 'ab' && lastAbResults) {
        const r = lastAbResults;
        report = `=================================================\n` +
          `A/B SPLIT TEST SIGNIFICANCE AUDIT REPORT\n` +
          `Date: ${now}\n` +
          `=================================================\n\n` +
          `VERDICT: ${r.verdictTitleText}\n\n` +
          `CONTROL (A):\n` +
          `  Visitors: ${formatNumber(r.n1)}\n` +
          `  Conversions: ${formatNumber(r.c1)}\n` +
          `  Conversion Rate: ${formatPct(r.cr1 * 100, 2)}\n` +
          `  Revenue Per Visitor: ${formatCurrency(r.rpv1)}\n\n` +
          `VARIATION (B):\n` +
          `  Visitors: ${formatNumber(r.n2)}\n` +
          `  Conversions: ${formatNumber(r.c2)}\n` +
          `  Conversion Rate: ${formatPct(r.cr2 * 100, 2)}\n` +
          `  Revenue Per Visitor: ${formatCurrency(r.rpv2)}\n\n` +
          `STATISTICAL ANALYSIS:\n` +
          `  Relative Lift: ${formatPct(r.relLift, 2, true)}\n` +
          `  Absolute Difference: ${formatPct(r.absDiff * 100, 2, true)}\n` +
          `  Statistical Confidence: ${r.confidence.toFixed(2)}%\n` +
          `  P-Value (Two-Tailed): ${r.pValue.toFixed(5)}\n` +
          `  Z-Score: ${r.zScore.toFixed(3)}\n` +
          `  Confidence Interval: [${formatPct(r.ciLower, 2, true)}, ${formatPct(r.ciUpper, 2, true)}]\n` +
          `  Target Required Confidence: ${r.targetConf}%\n` +
          `  Estimated Revenue Lift: ${formatCurrency(r.totalRevGain)}\n\n` +
          `=================================================\n` +
          `Report generated by ALL IN ONE CRO Engine\n` +
          `=================================================`;
      } else if (lastSingleResults) {
        const s = lastSingleResults;
        report = `=================================================\n` +
          `SINGLE FUNNEL CONVERSION AUDIT REPORT\n` +
          `Date: ${now}\n` +
          `=================================================\n\n` +
          `Total Visitors: ${formatNumber(s.n)}\n` +
          `Total Conversions: ${formatNumber(s.c)}\n` +
          `Conversion Rate: ${formatPct(s.cr * 100, 2)}\n` +
          `Margin of Error (95%): ±${formatPct(s.moe * 100, 2)}\n` +
          `95% Confidence Interval: [${formatPct(s.ciLow, 2)} — ${formatPct(s.ciHigh, 2)}]\n` +
          `Drop-off Rate: ${formatPct(s.dropoffRate, 2)} (${formatNumber(s.unconverted)} non-converters)\n` +
          `Yield per 1,000 Visitors: ${s.perThousand}\n` +
          `Revenue per Visitor: ${formatCurrency(s.rpv)}\n` +
          `Total Funnel Revenue: ${formatCurrency(s.totalRev)}\n\n` +
          `=================================================\n` +
          `Report generated by ALL IN ONE CRO Engine\n` +
          `=================================================`;
      }

      copyText(report, 'Conversion report copied to clipboard!');
    });

    // Initial trigger
    calculateAB();
  });
})();