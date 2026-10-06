// Customer Lifetime Value (LTV:CAC) Auditor Engine

document.addEventListener('DOMContentLoaded', () => {
  // --- DOM Elements ---
  const inputApv = document.getElementById('input-apv');
  const inputFreq = document.getElementById('input-freq');
  const inputLifespan = document.getElementById('input-lifespan');
  const inputMargin = document.getElementById('input-margin');
  const inputCac = document.getElementById('input-cac');

  // Outputs
  const valLtvRatio = document.getElementById('val-ltv-ratio');
  const badgeRatioStatus = document.getElementById('badge-ratio-status');
  const valRatioSub = document.getElementById('val-ratio-sub');

  const valClv = document.getElementById('val-clv');
  const valClvRevenue = document.getElementById('val-clv-revenue');
  const valPayback = document.getElementById('val-payback');
  const valPaybackSub = document.getElementById('val-payback-sub');
  const valMaxCac = document.getElementById('val-max-cac');
  const valTargetCac = document.getElementById('val-target-cac');

  // Gauge & Verdict
  const gaugeNeedle = document.getElementById('gauge-needle');
  const txtNeedleVal = document.getElementById('txt-needle-val');
  const verdictExplanation = document.getElementById('verdict-explanation');

  // Table rows
  const tblCustValue = document.getElementById('tbl-cust-value');
  const tblTotalOrders = document.getElementById('tbl-total-orders');
  const tblLifetimeRev = document.getElementById('tbl-lifetime-rev');
  const tblGrossLtv = document.getElementById('tbl-gross-ltv');
  const tblCac = document.getElementById('tbl-cac');
  const tblNetLtv = document.getElementById('tbl-net-ltv');

  // Action buttons & Presets
  const btnCopy = document.getElementById('btn-copy-summary');
  const btnExport = document.getElementById('btn-export-csv');
  const presetButtons = document.querySelectorAll('.preset-chip-btn');

  const presets = {
    ecommerce: { apv: 75, freq: 3.2, lifespan: 2.5, margin: 60, cac: 45 },
    saas: { apv: 120, freq: 12, lifespan: 3.5, margin: 80, cac: 850 },
    subbox: { apv: 35, freq: 12, lifespan: 1.5, margin: 65, cac: 60 },
    agency: { apv: 3500, freq: 4, lifespan: 2.0, margin: 70, cac: 4500 }
  };

  // Formatters
  const fmtMoney = (n) => {
    if (!isFinite(n) || isNaN(n)) return '$0.00';
    return (n < 0 ? '-$' : '$') + Math.abs(n).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };
  const fmtNum = (n, dec = 1) => {
    if (!isFinite(n) || isNaN(n)) return '0';
    return n.toLocaleString('en-US', { minimumFractionDigits: dec, maximumFractionDigits: dec });
  };

  function calculate() {
    const apv = Math.max(0, parseFloat(inputApv.value) || 0);
    const freq = Math.max(0.01, parseFloat(inputFreq.value) || 0.01);
    const lifespan = Math.max(0.01, parseFloat(inputLifespan.value) || 0.01);
    const marginPct = Math.min(100, Math.max(0.1, parseFloat(inputMargin.value) || 1));
    const cac = Math.max(0, parseFloat(inputCac.value) || 0);

    const marginDec = marginPct / 100;
    const annualCustValue = apv * freq;
    const totalPurchases = freq * lifespan;
    const lifetimeRevenue = apv * totalPurchases;
    const clv = lifetimeRevenue * marginDec;
    const netProfitPerCust = clv - cac;

    const ratio = cac > 0 ? clv / cac : (clv > 0 ? 99 : 0);

    // Payback Period in Months
    const monthlyGrossMargin = (annualCustValue * marginDec) / 12;
    const paybackMonths = monthlyGrossMargin > 0 ? cac / monthlyGrossMargin : 0;

    // Break-even and Target CAC
    const maxAllowableCac = clv;
    const targetBenchmarkCac = clv / 3;

    // Highlights
    valLtvRatio.textContent = ratio >= 99 ? '>50x' : ratio.toFixed(2) + 'x';
    valRatioSub.textContent = `Net Profit Per Customer: ${(netProfitPerCust >= 0 ? '+' : '') + fmtMoney(netProfitPerCust)}`;

    valClv.textContent = fmtMoney(clv);
    valClvRevenue.textContent = `Lifetime Gross Revenue: ${fmtMoney(lifetimeRevenue)}`;

    valPayback.textContent = paybackMonths > 0 ? `${paybackMonths.toFixed(1)} Mos` : 'Immediate';
    valPaybackSub.textContent = monthlyGrossMargin > 0 ? `${fmtMoney(monthlyGrossMargin)}/mo gross margin` : 'N/A';

    valMaxCac.textContent = fmtMoney(maxAllowableCac);
    valTargetCac.textContent = fmtMoney(targetBenchmarkCac);

    // Needle position & Verdict
    // Map ratio onto 0..100% scale
    // 0 to 1x -> 0% to 20%
    // 1x to 3x -> 20% to 50%
    // 3x to 5x -> 50% to 80%
    // 5x to 8x+ -> 80% to 98%
    let needlePct = 50;
    if (ratio < 1.0) {
      needlePct = Math.max(2, (ratio / 1.0) * 20);
    } else if (ratio < 3.0) {
      needlePct = 20 + ((ratio - 1.0) / 2.0) * 30;
    } else if (ratio < 5.0) {
      needlePct = 50 + ((ratio - 3.0) / 2.0) * 30;
    } else {
      needlePct = Math.min(98, 80 + ((Math.min(ratio, 10.0) - 5.0) / 5.0) * 18);
    }

    gaugeNeedle.style.left = `${needlePct}%`;
    txtNeedleVal.textContent = `${ratio.toFixed(2)}x LTV:CAC`;

    if (ratio < 1.0) {
      badgeRatioStatus.className = 'verdict-pill danger';
      badgeRatioStatus.textContent = 'Danger: Losing Money';
      verdictExplanation.innerHTML = `<strong>🚨 Critical Warning (${ratio.toFixed(2)}x):</strong> Customer acquisition cost exceeds lifetime gross profit. You are losing <strong>${fmtMoney(Math.abs(netProfitPerCust))}</strong> on every customer acquired. Cut ad spend, eliminate low-intent traffic, or raise prices immediately to avoid insolvency.`;
    } else if (ratio < 3.0) {
      badgeRatioStatus.className = 'verdict-pill warning';
      badgeRatioStatus.textContent = 'Caution: Sub-Optimal';
      verdictExplanation.innerHTML = `<strong>⚠️ Caution (${ratio.toFixed(2)}x):</strong> Unit economics are tight. While gross profit technically exceeds direct CAC, operating overhead and customer support will eat up your net margin. Improve onboarding and retention, or optimize ad funnels to reduce acquisition cost.`;
    } else if (ratio < 5.0) {
      badgeRatioStatus.className = 'verdict-pill healthy';
      badgeRatioStatus.textContent = 'Healthy & Sustainable';
      verdictExplanation.innerHTML = `<strong>✅ Healthy & Scalable (${ratio.toFixed(2)}x):</strong> Excellent unit economics. This 3x–5x range is the venture and private-equity gold standard for viable, profitable growth. Your margins comfortably support operational overhead.`;
    } else {
      badgeRatioStatus.className = 'verdict-pill hyperefficient';
      badgeRatioStatus.textContent = 'Hyper-Efficient';
      verdictExplanation.innerHTML = `<strong>🚀 Hyper-Efficient (${ratio.toFixed(2)}x):</strong> Customer lifetime value substantially outpaces acquisition costs. You are generating massive cash-flow return per user and likely leaving market share on the table. You can afford to bid higher on ad channels to accelerate customer acquisition.`;
    }

    // Table
    tblCustValue.textContent = `${fmtMoney(annualCustValue)} / yr`;
    tblTotalOrders.textContent = `${fmtNum(totalPurchases, 1)} purchases`;
    tblLifetimeRev.textContent = fmtMoney(lifetimeRevenue);
    tblGrossLtv.textContent = fmtMoney(clv);
    tblCac.textContent = fmtMoney(cac);
    tblNetLtv.textContent = (netProfitPerCust >= 0 ? '+' : '') + fmtMoney(netProfitPerCust);
    tblNetLtv.style.color = netProfitPerCust >= 0 ? '#10b981' : '#ef4444';
  }

  // Event listeners
  [inputApv, inputFreq, inputLifespan, inputMargin, inputCac].forEach(el => {
    el.addEventListener('input', calculate);
  });

  // Presets
  presetButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      presetButtons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const pKey = btn.dataset.preset;
      const conf = presets[pKey];
      if (conf) {
        inputApv.value = conf.apv;
        inputFreq.value = conf.freq;
        inputLifespan.value = conf.lifespan;
        inputMargin.value = conf.margin;
        inputCac.value = conf.cac;
        calculate();
      }
    });
  });

  // Copy Summary
  btnCopy.addEventListener('click', async () => {
    const summary = [
      `--- Customer Lifetime Value (LTV:CAC) Audit ---`,
      `Average Purchase Value (APV): ${fmtMoney(parseFloat(inputApv.value))}`,
      `Purchase Frequency: ${inputFreq.value} orders / yr`,
      `Customer Lifespan: ${inputLifespan.value} years`,
      `Gross Profit Margin: ${inputMargin.value}%`,
      `Customer Acquisition Cost (CAC): ${fmtMoney(parseFloat(inputCac.value))}`,
      `Customer Lifetime Value (LTV): ${valClv.textContent}`,
      `LTV:CAC Ratio: ${valLtvRatio.textContent} (${badgeRatioStatus.textContent})`,
      `Net Profit Per Customer: ${valRatioSub.textContent.replace('Net Profit Per Customer: ', '')}`,
      `CAC Payback Period: ${valPayback.textContent}`,
      `Max Allowable CPA (Break-Even): ${valMaxCac.textContent}`,
      `Target Scalable CPA (3:1): ${valTargetCac.textContent}`
    ].join('\n');

    try {
      await navigator.clipboard.writeText(summary);
      const orig = btnCopy.innerHTML;
      btnCopy.innerHTML = `✓ Copied!`;
      setTimeout(() => { btnCopy.innerHTML = orig; }, 2000);
    } catch {
      alert('Copied to clipboard!\n\n' + summary);
    }
  });

  // Export CSV
  btnExport.addEventListener('click', () => {
    const csvContent = [
      ['Metric', 'Value'],
      ['Average Purchase Value ($)', inputApv.value],
      ['Purchase Frequency (/yr)', inputFreq.value],
      ['Customer Lifespan (yrs)', inputLifespan.value],
      ['Gross Profit Margin (%)', inputMargin.value],
      ['Customer Acquisition Cost (CAC)', inputCac.value],
      ['Customer Lifetime Value (LTV)', valClv.textContent.replace('$', '').replace(/,/g, '')],
      ['LTV:CAC Ratio', valLtvRatio.textContent.replace('x', '')],
      ['Health Status', badgeRatioStatus.textContent],
      ['CAC Payback (Months)', valPayback.textContent.replace(' Mos', '')],
      ['Max Allowable CPA', valMaxCac.textContent.replace('$', '').replace(/,/g, '')],
      ['Target Scalable CPA (3:1)', valTargetCac.textContent.replace('$', '').replace(/,/g, '')]
    ].map(row => row.map(c => `"${c}"`).join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `ltv-cac-audit-${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  });

  // Initial Calculation
  calculate();
});