// Capital ROI & NPV Feasibility Analytics Logic
// Client-side discounted cash flow (DCF), IRR, payback, SVG trajectory chart, and CSV export.

(function () {
  'use strict';

  // Presets
  const PRESETS = {
    cloud: {
      capex: 90000,
      discountRate: 10.0,
      flows: [28000, 34000, 38000, 42000, 45000]
    },
    mfg: {
      capex: 280000,
      discountRate: 9.0,
      flows: [75000, 85000, 95000, 95000, 110000]
    },
    saas: {
      capex: 150000,
      discountRate: 12.0,
      flows: [20000, 45000, 75000, 110000, 150000]
    }
  };

  // State
  let currentModel = JSON.parse(JSON.stringify(PRESETS.cloud));
  let currentPreset = 'cloud';

  // Formatters
  const currencyFormatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0
  });

  const compactFormatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    notation: 'compact',
    maximumFractionDigits: 1
  });

  function formatCurrency(val) {
    return currencyFormatter.format(val || 0);
  }

  function formatCompact(val) {
    return compactFormatter.format(val || 0);
  }

  function formatPct(val) {
    if (!isFinite(val) || isNaN(val)) return '0.0%';
    const sign = val > 0 ? '+' : '';
    return sign + val.toFixed(1) + '%';
  }

  // Internal Rate of Return (IRR) calculation via bisection
  function calculateIRR(capex, flows) {
    let low = -0.5;
    let high = 5.0;
    const maxIterations = 100;
    const tolerance = 0.0001;

    function npvAtRate(r) {
      let sum = -capex;
      for (let t = 0; t < flows.length; t++) {
        sum += flows[t] / Math.pow(1 + r, t + 1);
      }
      return sum;
    }

    if (npvAtRate(low) * npvAtRate(high) > 0) {
      // If no root in range, return NaN or estimate
      return NaN;
    }

    for (let i = 0; i < maxIterations; i++) {
      const mid = (low + high) / 2;
      const npvMid = npvAtRate(mid);

      if (Math.abs(npvMid) < tolerance) {
        return mid * 100;
      }

      if (npvAtRate(low) * npvMid < 0) {
        high = mid;
      } else {
        low = mid;
      }
    }

    return ((low + high) / 2) * 100;
  }

  // Format years into "X Yrs, Y Mo"
  function formatYearsMonths(yearsFrac) {
    if (!isFinite(yearsFrac) || yearsFrac <= 0) return '> 5.0 Yrs';
    if (yearsFrac > 5.0) return '> 5.0 Yrs';

    const wholeYears = Math.floor(yearsFrac);
    const months = Math.round((yearsFrac - wholeYears) * 12);
    if (months === 12) {
      return `${wholeYears + 1} Yrs, 0 Mo`;
    }
    return `${wholeYears} Yrs, ${months} Mo`;
  }

  function updateDashboard() {
    const capex = Math.max(1, currentModel.capex);
    const r = Math.max(0.001, currentModel.discountRate / 100);
    const flows = currentModel.flows.map(v => Math.max(0, Number(v) || 0));

    // Calculate Discount Factors, Present Values, and Cumulative Cash Flows
    let totalNominalInflow = 0;
    let totalPvInflow = 0;

    const schedule = [];
    let cumNominal = -capex;
    let cumDiscounted = -capex;
    let nominalPaybackYears = null;
    let discountedPaybackYears = null;

    flows.forEach((cf, idx) => {
      const year = idx + 1;
      const df = 1 / Math.pow(1 + r, year);
      const pv = cf * df;

      totalNominalInflow += cf;
      totalPvInflow += pv;

      const prevCumNominal = cumNominal;
      cumNominal += cf;

      if (nominalPaybackYears === null && cumNominal >= 0) {
        const needed = -prevCumNominal;
        nominalPaybackYears = (year - 1) + (cf > 0 ? (needed / cf) : 0);
      }

      const prevCumDisc = cumDiscounted;
      cumDiscounted += pv;

      if (discountedPaybackYears === null && cumDiscounted >= 0) {
        const neededDisc = -prevCumDisc;
        discountedPaybackYears = (year - 1) + (pv > 0 ? (neededDisc / pv) : 0);
      }

      schedule.push({
        year,
        cf,
        df,
        pv,
        cumNominal,
        cumDiscounted
      });
    });

    // Core Metrics
    const npv = totalPvInflow - capex;
    const pi = totalPvInflow / capex;
    const nominalNetProfit = totalNominalInflow - capex;
    const roi = (nominalNetProfit / capex) * 100;
    const irr = calculateIRR(capex, flows);

    // Update Hero Stats
    document.getElementById('stat-npv').textContent = formatCurrency(npv);
    document.getElementById('stat-npv').style.color = npv >= 0 ? 'var(--text-primary)' : '#ef4444';
    document.getElementById('stat-npv-sub').textContent = npv >= 0 ? 'Discounted Value Added' : 'Destroys Value (Negative NPV)';

    const paybackStr = nominalPaybackYears !== null ? formatYearsMonths(nominalPaybackYears) : '> 5 Years';
    const discPaybackStr = discountedPaybackYears !== null ? formatYearsMonths(discountedPaybackYears) : '> 5 Years';
    document.getElementById('stat-payback').textContent = paybackStr;
    document.getElementById('stat-disc-payback-sub').textContent = `Discounted Payback: ${discPaybackStr}`;

    document.getElementById('stat-roi').textContent = `${formatPct(roi)}`;
    document.getElementById('stat-nominal-net-sub').textContent = `Nominal Profit: ${formatCurrency(nominalNetProfit)}`;

    const irrElem = document.getElementById('stat-irr');
    if (isNaN(irr)) {
      irrElem.textContent = 'N/A';
    } else {
      irrElem.textContent = `${irr.toFixed(1)}%`;
      irrElem.style.color = irr >= currentModel.discountRate ? '#10b981' : '#ef4444';
    }
    document.getElementById('stat-hurdle-sub').textContent = `Cost of Capital (WACC): ${currentModel.discountRate.toFixed(1)}%`;

    // Update Decision Banner
    renderDecisionCard({ npv, pi, nominalPaybackYears, capex, irr });

    // Update Schedule Table Display
    document.getElementById('cf-disp-y0').textContent = `-${formatCurrency(capex)}`;
    document.getElementById('pv-disp-y0').textContent = `-${formatCurrency(capex)}`;

    schedule.forEach((s) => {
      const dfElem = document.getElementById(`df-y${s.year}`);
      const pvElem = document.getElementById(`pv-y${s.year}`);
      if (dfElem) dfElem.textContent = s.df.toFixed(4);
      if (pvElem) pvElem.textContent = formatCurrency(s.pv);
    });

    // Update Scorecard
    document.getElementById('scorecard-total-inflows').textContent = formatCurrency(totalNominalInflow);
    document.getElementById('scorecard-pv-inflows').textContent = formatCurrency(totalPvInflow);
    const npvMargin = (npv / capex) * 100;
    document.getElementById('scorecard-npv-margin').textContent = `${npvMargin >= 0 ? '+' : ''}${npvMargin.toFixed(1)}%`;
    const irrSpread = !isNaN(irr) ? (irr - currentModel.discountRate) : 0;
    document.getElementById('scorecard-irr-spread').textContent = `${irrSpread >= 0 ? '+' : ''}${irrSpread.toFixed(1)}%`;

    // Narrative Summary
    const narrativeElem = document.getElementById('scorecard-summary-narrative');
    if (npv > 0) {
      narrativeElem.innerHTML = `This project generates a net present value surplus of <strong>${formatCurrency(npv)}</strong> above the ${currentModel.discountRate.toFixed(1)}% hurdle rate. Every dollar invested returns <strong>$${pi.toFixed(2)}</strong> in present value. Nominal capital recovery is attained in <strong>${paybackStr}</strong>.`;
    } else {
      narrativeElem.innerHTML = `This capital project falls short of the required hurdle rate by <strong>${formatCurrency(Math.abs(npv))}</strong>. Future cash inflows do not compensate for the initial outlay and time-value of capital at ${currentModel.discountRate.toFixed(1)}% WACC.`;
    }

    // Render SVG Trajectory Chart
    renderChart(capex, schedule);
  }

  // Dynamic Investment Recommendation Card
  function renderDecisionCard({ npv, pi, nominalPaybackYears, capex, irr }) {
    const banner = document.getElementById('decision-banner');
    const badge = document.getElementById('decision-badge');
    const headline = document.getElementById('decision-headline');
    const subtext = document.getElementById('decision-subtext');
    const bannerPi = document.getElementById('banner-pi');

    bannerPi.textContent = `${pi.toFixed(2)}x`;

    if (npv > 0 && pi >= 1.25 && (nominalPaybackYears !== null && nominalPaybackYears <= 3.2)) {
      banner.className = 'decision-banner go-strong';
      badge.className = 'decision-badge strong';
      badge.textContent = 'STRONG GO — APPROVE';
      headline.textContent = 'Project generates substantial economic surplus above hurdle rate.';
      subtext.textContent = `High profitability index (${pi.toFixed(2)}x) with prompt nominal payback in ${nominalPaybackYears.toFixed(1)} years. Recommended for immediate capital allocation.`;
      bannerPi.style.color = '#10b981';
    } else if (npv > 0 && pi >= 1.0) {
      banner.className = 'decision-banner go-moderate';
      badge.className = 'decision-badge moderate';
      badge.textContent = 'CONDITIONAL GO — ACCEPTABLE';
      headline.textContent = 'Positive NPV created; verify cash flow risk sensitivity.';
      subtext.textContent = `Creates positive economic value (NPV: +${formatCurrency(npv)}). Ensure conservative sensitivity buffers against revenue slippage.`;
      bannerPi.style.color = '#89aacc';
    } else {
      banner.className = 'decision-banner no-go';
      badge.className = 'decision-badge reject';
      badge.textContent = 'NO-GO — REJECT PROJECT';
      headline.textContent = 'Investment destroys enterprise value under hurdle criteria.';
      subtext.textContent = `Generates negative Net Present Value (${formatCurrency(npv)}). Consider renegotiating vendor CapEx or requiring higher contract commitments.`;
      bannerPi.style.color = '#ef4444';
    }
  }

  // Interactive SVG Cash Flow & Cumulative NPV Chart
  function renderChart(capex, schedule) {
    const container = document.getElementById('svg-roi-chart-wrapper');
    if (!container) return;

    const width = 640;
    const height = 240;
    const padding = { top: 25, right: 35, bottom: 40, left: 65 };

    const chartW = width - padding.left - padding.right;
    const chartH = height - padding.top - padding.bottom;

    // Timeline points: Y0, Y1, Y2, Y3, Y4, Y5
    const points = [
      { year: 'Y0', cf: -capex, cumDiscounted: -capex },
      ...schedule.map(s => ({ year: `Y${s.year}`, cf: s.cf, cumDiscounted: s.cumDiscounted }))
    ];

    const allValues = [
      -capex,
      ...schedule.map(s => s.cf),
      ...schedule.map(s => s.cumDiscounted)
    ];

    const minVal = Math.min(...allValues, -capex);
    const maxVal = Math.max(...allValues, 10000);

    const absMax = Math.max(Math.abs(minVal), Math.abs(maxVal));
    const yRangeMax = Math.ceil((absMax * 1.15) / 10000) * 10000;
    const yRangeMin = -yRangeMax;

    const getY = (val) => padding.top + chartH / 2 - (val / yRangeMax) * (chartH / 2);
    const zeroY = getY(0);

    const n = points.length;
    const colWidth = chartW / n;
    const getX = (i) => padding.left + i * colWidth + colWidth / 2;

    let svg = `<svg viewBox="0 0 ${width} ${height}" style="width: 100%; height: auto; overflow: visible; font-family: var(--font-sans);" role="img" aria-label="ROI Cash Flow Chart">`;

    // Horizontal Zero Axis Line (Breakeven)
    svg += `
      <line x1="${padding.left}" y1="${zeroY}" x2="${width - padding.right}" y2="${zeroY}" stroke="var(--text-tertiary)" stroke-width="1.5" stroke-dasharray="3,3" opacity="0.8" />
      <text x="${padding.left - 8}" y="${zeroY + 4}" font-size="10" fill="var(--text-secondary)" text-anchor="end" font-weight="600">$0</text>
    `;

    // Top and Bottom grid lines
    const topY = getY(yRangeMax);
    const botY = getY(yRangeMin);

    svg += `
      <line x1="${padding.left}" y1="${topY}" x2="${width - padding.right}" y2="${topY}" stroke="var(--border)" stroke-width="1" stroke-dasharray="4,4" opacity="0.4" />
      <text x="${padding.left - 8}" y="${topY + 4}" font-size="9" fill="var(--text-tertiary)" text-anchor="end">+${compactFormatter.format(yRangeMax)}</text>
      <line x1="${padding.left}" y1="${botY}" x2="${width - padding.right}" y2="${botY}" stroke="var(--border)" stroke-width="1" stroke-dasharray="4,4" opacity="0.4" />
      <text x="${padding.left - 8}" y="${botY + 4}" font-size="9" fill="var(--text-tertiary)" text-anchor="end">-${compactFormatter.format(yRangeMax)}</text>
    `;

    // Bars for Annual Cash Flows
    const barWidth = Math.max(12, colWidth * 0.4);

    points.forEach((p, idx) => {
      const cx = getX(idx);
      const bx = cx - barWidth / 2;
      const isNegative = p.cf < 0;
      const barH = Math.max(2, (Math.abs(p.cf) / yRangeMax) * (chartH / 2));
      const by = isNegative ? zeroY : (zeroY - barH);
      const color = isNegative ? '#ef4444' : '#4e85bf';

      svg += `
        <g style="cursor: pointer;">
          <rect x="${bx}" y="${by}" width="${barWidth}" height="${barH}" fill="${color}" rx="2" opacity="0.75">
            <title>${p.year} Cash Flow: ${formatCurrency(p.cf)}</title>
          </rect>
          <text x="${cx}" y="${height - 12}" font-size="10.5" fill="var(--text-secondary)" text-anchor="middle" font-weight="600">${p.year}</text>
        </g>
      `;
    });

    // Cumulative Discounted Trajectory Line
    let pathD = '';
    points.forEach((p, idx) => {
      const cx = getX(idx);
      const cy = getY(p.cumDiscounted);
      if (idx === 0) pathD += `M ${cx} ${cy}`;
      else pathD += ` L ${cx} ${cy}`;
    });

    svg += `<path d="${pathD}" fill="none" stroke="#10b981" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" />`;

    // Points along Cumulative Line
    points.forEach((p, idx) => {
      const cx = getX(idx);
      const cy = getY(p.cumDiscounted);
      svg += `
        <circle cx="${cx}" cy="${cy}" r="4" fill="#ffffff" stroke="#10b981" stroke-width="2.5">
          <title>${p.year} Cumulative Discounted: ${formatCurrency(p.cumDiscounted)}</title>
        </circle>
      `;
    });

    svg += `</svg>`;
    container.innerHTML = svg;
  }

  // Export CSV Schedule
  function exportCSV() {
    let csv = 'Period,Annual Cash Flow ($),Discount Factor,Discounted Cash Flow (PV),Cumulative PV ($)\r\n';
    const r = currentModel.discountRate / 100;
    const capex = currentModel.capex;

    csv += `Year 0 (CapEx),-${capex},1.0000,-${capex},-${capex}\r\n`;

    let cumPv = -capex;
    currentModel.flows.forEach((cf, idx) => {
      const year = idx + 1;
      const df = 1 / Math.pow(1 + r, year);
      const pv = cf * df;
      cumPv += pv;

      csv += `Year ${year},${cf},${df.toFixed(4)},${pv.toFixed(2)},${cumPv.toFixed(2)}\r\n`;
    });

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `capital_roi_dcf_schedule_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  // Initialization
  document.addEventListener('DOMContentLoaded', () => {
    // Preset buttons
    const presetCloud = document.getElementById('preset-cloud');
    const presetMfg = document.getElementById('preset-mfg');
    const presetSaas = document.getElementById('preset-saas');

    function applyPreset(key, btn) {
      document.querySelectorAll('.preset-chip').forEach(c => c.classList.remove('active'));
      btn.classList.add('active');
      currentModel = JSON.parse(JSON.stringify(PRESETS[key]));
      currentPreset = key;

      document.getElementById('inp-capex').value = currentModel.capex;
      document.getElementById('inp-discount-rate').value = currentModel.discountRate;
      document.getElementById('val-discount-rate').textContent = `${currentModel.discountRate.toFixed(1)}%`;

      currentModel.flows.forEach((val, idx) => {
        const inp = document.getElementById(`cf-y${idx + 1}`);
        if (inp) inp.value = val;
      });

      updateDashboard();
    }

    if (presetCloud) presetCloud.addEventListener('click', () => applyPreset('cloud', presetCloud));
    if (presetMfg) presetMfg.addEventListener('click', () => applyPreset('mfg', presetMfg));
    if (presetSaas) presetSaas.addEventListener('click', () => applyPreset('saas', presetSaas));

    // CapEx input
    const capexInput = document.getElementById('inp-capex');
    if (capexInput) {
      capexInput.addEventListener('input', (e) => {
        currentModel.capex = Math.max(1, parseFloat(e.target.value) || 0);
        updateDashboard();
      });
    }

    // Discount Rate slider
    const discountInput = document.getElementById('inp-discount-rate');
    if (discountInput) {
      discountInput.addEventListener('input', (e) => {
        currentModel.discountRate = parseFloat(e.target.value) || 1;
        document.getElementById('val-discount-rate').textContent = `${currentModel.discountRate.toFixed(1)}%`;
        updateDashboard();
      });
    }

    // Annual cash flows inputs
    for (let i = 1; i <= 5; i++) {
      const flowInp = document.getElementById(`cf-y${i}`);
      if (flowInp) {
        flowInp.addEventListener('input', (e) => {
          currentModel.flows[i - 1] = parseFloat(e.target.value) || 0;
          updateDashboard();
        });
      }
    }

    // Export CSV
    const btnExport = document.getElementById('btn-export-csv');
    if (btnExport) btnExport.addEventListener('click', exportCSV);

    // Reset Data
    const btnReset = document.getElementById('btn-reset-data');
    if (btnReset) {
      btnReset.addEventListener('click', () => {
        currentModel = JSON.parse(JSON.stringify(PRESETS[currentPreset] || PRESETS.cloud));
        document.getElementById('inp-capex').value = currentModel.capex;
        document.getElementById('inp-discount-rate').value = currentModel.discountRate;
        document.getElementById('val-discount-rate').textContent = `${currentModel.discountRate.toFixed(1)}%`;

        currentModel.flows.forEach((val, idx) => {
          const inp = document.getElementById(`cf-y${idx + 1}`);
          if (inp) inp.value = val;
        });

        updateDashboard();
      });
    }

    // Initial render
    updateDashboard();
  });
})();