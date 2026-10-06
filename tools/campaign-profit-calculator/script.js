// Campaign Profit Calculator - Client-side Analytics Engine

document.addEventListener('DOMContentLoaded', () => {
  // --- DOM Elements ---
  const inputSpend = document.getElementById('input-spend');
  const inputImpressions = document.getElementById('input-impressions');
  const inputClicks = document.getElementById('input-clicks');
  const inputCtr = document.getElementById('input-ctr');
  const inputConversions = document.getElementById('input-conversions');
  const inputCvr = document.getElementById('input-cvr');
  const inputAov = document.getElementById('input-aov');
  const inputMargin = document.getElementById('input-margin');

  // Outputs
  const cardNetProfit = document.getElementById('card-net-profit');
  const outNetProfit = document.getElementById('out-net-profit');
  const badgeRoi = document.getElementById('badge-roi');
  const outNetSub = document.getElementById('out-net-sub');

  const outRoas = document.getElementById('out-roas');
  const outRoasSub = document.getElementById('out-roas-sub');
  const outCpa = document.getElementById('out-cpa');
  const outCpaSub = document.getElementById('out-cpa-sub');
  const outRevenue = document.getElementById('out-revenue');
  const outRevenueSub = document.getElementById('out-revenue-sub');
  const outCpc = document.getElementById('out-cpc');
  const outCpm = document.getElementById('out-cpm');

  // Visual Break-even Bar & Meter
  const badgeBeStatus = document.getElementById('badge-be-status');
  const barCogs = document.getElementById('bar-cogs');
  const barAdspend = document.getElementById('bar-adspend');
  const barProfit = document.getElementById('bar-profit');
  const pctCogs = document.getElementById('pct-cogs');
  const pctAdspend = document.getElementById('pct-adspend');
  const pctProfit = document.getElementById('pct-profit');
  const legendProfitItem = document.getElementById('legend-profit-item');

  const lblCurrRoas = document.getElementById('lbl-curr-roas');
  const lblBeRoas = document.getElementById('lbl-be-roas');
  const meterFill = document.getElementById('meter-fill');
  const meterPin = document.getElementById('meter-pin');

  // Funnel steps
  const stepImpressions = document.getElementById('step-impressions');
  const stepClicks = document.getElementById('step-clicks');
  const stepCtr = document.getElementById('step-ctr');
  const stepOrders = document.getElementById('step-orders');
  const stepCvr = document.getElementById('step-cvr');
  const stepRevenue = document.getElementById('step-revenue');

  // Table breakdown
  const tblCogs = document.getElementById('tbl-cogs');
  const tblGrossProfit = document.getElementById('tbl-gross-profit');
  const tblSpend = document.getElementById('tbl-spend');
  const tblNetProfit = document.getElementById('tbl-net-profit');
  const tblBeRoas = document.getElementById('tbl-be-roas');
  const tblBeCpa = document.getElementById('tbl-be-cpa');

  // Action buttons
  const btnCopy = document.getElementById('btn-copy-summary');
  const btnExport = document.getElementById('btn-export-csv');
  const btnReset = document.getElementById('btn-reset');
  const presetButtons = document.querySelectorAll('.preset-chip-btn');

  // Sync hint labels
  const labelCtrCalc = document.getElementById('label-ctr-calc');
  const labelCvrCalc = document.getElementById('label-cvr-calc');

  // Preset Configurations
  const presets = {
    ecommerce: { spend: 5000, impressions: 250000, ctr: 2.0, cvr: 3.5, aov: 85, margin: 65 },
    saas: { spend: 8000, impressions: 160000, ctr: 2.5, cvr: 3.0, aov: 250, margin: 85 },
    highticket: { spend: 10000, impressions: 80000, ctr: 2.0, cvr: 1.5, aov: 2400, margin: 75 },
    retail: { spend: 2500, impressions: 200000, ctr: 2.0, cvr: 3.5, aov: 45, margin: 30 }
  };

  // Helper number formatters
  const fmtMoney = (n) => {
    if (!isFinite(n) || isNaN(n)) return '$0.00';
    return (n < 0 ? '-$' : '$') + Math.abs(n).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };
  const fmtNum = (n, dec = 0) => {
    if (!isFinite(n) || isNaN(n)) return '0';
    return n.toLocaleString('en-US', { minimumFractionDigits: dec, maximumFractionDigits: dec });
  };
  const fmtPct = (n, dec = 1) => {
    if (!isFinite(n) || isNaN(n)) return '0.0%';
    return (n > 0 ? '+' : '') + n.toFixed(dec) + '%';
  };

  // Calculation Core
  function calculate() {
    const spend = Math.max(0, parseFloat(inputSpend.value) || 0);
    const impressions = Math.max(1, parseFloat(inputImpressions.value) || 1);
    const clicks = Math.max(0, parseFloat(inputClicks.value) || 0);
    const conversions = Math.max(0, parseFloat(inputConversions.value) || 0);
    const aov = Math.max(0, parseFloat(inputAov.value) || 0);
    const marginPct = Math.min(100, Math.max(0.1, parseFloat(inputMargin.value) || 1));

    // Rates
    const ctr = impressions > 0 ? (clicks / impressions) * 100 : 0;
    const cvr = clicks > 0 ? (conversions / clicks) * 100 : 0;
    const cpc = clicks > 0 ? spend / clicks : 0;
    const cpm = impressions > 0 ? (spend / impressions) * 1000 : 0;
    const cpa = conversions > 0 ? spend / conversions : 0;

    // Financials
    const grossRevenue = conversions * aov;
    const marginDec = marginPct / 100;
    const cogs = grossRevenue * (1 - marginDec);
    const grossProfit = grossRevenue * marginDec;
    const netProfit = grossProfit - spend;

    const roas = spend > 0 ? grossRevenue / spend : 0;
    const netRoi = spend > 0 ? (netProfit / spend) * 100 : 0;
    const profitMargin = grossRevenue > 0 ? (netProfit / grossRevenue) * 100 : 0;

    const breakEvenRoas = marginDec > 0 ? 1 / marginDec : 0;
    const breakEvenCpa = aov * marginDec;

    // Update KPI Card Highlights
    outNetProfit.textContent = fmtMoney(netProfit);
    outNetProfit.className = 'kpi-tile-value ' + (netProfit > 0 ? 'val-positive' : (netProfit < 0 ? 'val-negative' : ''));
    badgeRoi.textContent = fmtPct(netRoi, 1) + ' ROI';
    badgeRoi.className = 'be-badge ' + (netProfit > 0 ? 'profit' : (netProfit < 0 ? 'loss' : 'neutral'));
    outNetSub.textContent = `Net Profit Margin: ${profitMargin.toFixed(1)}%`;

    outRoas.textContent = roas.toFixed(2) + 'x';
    outRoasSub.textContent = `Break-Even: ${breakEvenRoas.toFixed(2)}x`;

    outCpa.textContent = fmtMoney(cpa);
    outCpaSub.textContent = `Max Allowable: ${fmtMoney(breakEvenCpa)}`;

    outRevenue.textContent = fmtMoney(grossRevenue);
    outRevenueSub.textContent = `${fmtNum(conversions)} Total Orders`;

    outCpc.textContent = fmtMoney(cpc);
    outCpm.textContent = `CPM: ${fmtMoney(cpm)}`;

    // Funnel Steps
    stepImpressions.textContent = fmtNum(impressions);
    stepClicks.textContent = fmtNum(clicks);
    stepCtr.textContent = ctr.toFixed(2) + '% CTR';
    stepOrders.textContent = fmtNum(conversions);
    stepCvr.textContent = cvr.toFixed(2) + '% CVR';
    stepRevenue.textContent = fmtMoney(grossRevenue);

    // Table
    tblCogs.textContent = fmtMoney(cogs);
    tblGrossProfit.textContent = fmtMoney(grossProfit);
    tblSpend.textContent = fmtMoney(spend);
    tblNetProfit.textContent = (netProfit >= 0 ? '+' : '') + fmtMoney(netProfit);
    tblNetProfit.style.color = netProfit >= 0 ? '#10b981' : '#ef4444';
    tblBeRoas.textContent = breakEvenRoas.toFixed(2) + 'x';
    tblBeCpa.textContent = fmtMoney(breakEvenCpa);

    // Revenue Allocation Bar
    const totalOutflow = cogs + spend;
    if (grossRevenue > 0) {
      if (netProfit >= 0) {
        const cogsPct = (cogs / grossRevenue) * 100;
        const spendPct = (spend / grossRevenue) * 100;
        const profitPct = (netProfit / grossRevenue) * 100;

        barCogs.style.width = `${Math.min(100, cogsPct)}%`;
        barCogs.className = 'bar-segment seg-cogs';
        barAdspend.style.width = `${Math.min(100, spendPct)}%`;
        barProfit.style.width = `${Math.min(100, profitPct)}%`;
        barProfit.className = 'bar-segment seg-profit';

        pctCogs.textContent = cogsPct.toFixed(1) + '%';
        pctAdspend.textContent = spendPct.toFixed(1) + '%';
        pctProfit.textContent = profitPct.toFixed(1) + '%';

        legendProfitItem.innerHTML = `<span class="legend-color-dot" style="background: #10b981;"></span><span>Net Margin (${profitPct.toFixed(1)}%)</span>`;
        badgeBeStatus.textContent = 'Profitable';
        badgeBeStatus.className = 'be-badge profit';
      } else {
        // Net Loss
        const totalBasis = Math.max(grossRevenue, totalOutflow);
        const cogsPct = (cogs / totalBasis) * 100;
        const spendPct = (spend / totalBasis) * 100;
        const lossPct = (Math.abs(netProfit) / totalBasis) * 100;

        barCogs.style.width = `${cogsPct}%`;
        barAdspend.style.width = `${spendPct}%`;
        barProfit.style.width = `${lossPct}%`;
        barProfit.className = 'bar-segment seg-loss';

        pctCogs.textContent = ((cogs / totalBasis) * 100).toFixed(1) + '%';
        pctAdspend.textContent = ((spend / totalBasis) * 100).toFixed(1) + '%';
        pctProfit.textContent = '-' + lossPct.toFixed(1) + '%';

        legendProfitItem.innerHTML = `<span class="legend-color-dot" style="background: #ef4444;"></span><span>Deficit (-${lossPct.toFixed(1)}%)</span>`;
        badgeBeStatus.textContent = 'Unprofitable (Loss)';
        badgeBeStatus.className = 'be-badge loss';
      }
    } else {
      barCogs.style.width = '0%';
      barAdspend.style.width = '100%';
      barProfit.style.width = '0%';
      badgeBeStatus.textContent = 'No Revenue';
      badgeBeStatus.className = 'be-badge loss';
    }

    // Break-Even ROAS Gauge
    lblCurrRoas.textContent = roas.toFixed(2) + 'x';
    lblBeRoas.textContent = breakEvenRoas.toFixed(2) + 'x';

    // Scale pin to max of 5x or 1.5x current/BE
    const maxScale = Math.max(5, breakEvenRoas * 1.6, roas * 1.3);
    const pinPos = Math.min(98, Math.max(2, (breakEvenRoas / maxScale) * 100));
    const currPos = Math.min(100, Math.max(0, (roas / maxScale) * 100));

    meterPin.style.left = `${pinPos}%`;
    meterFill.style.width = `${currPos}%`;
    meterFill.style.background = roas >= breakEvenRoas ? '#10b981' : '#f59e0b';
  }

  // Two-way synchronization handlers
  inputCtr.addEventListener('input', () => {
    const impr = parseFloat(inputImpressions.value) || 0;
    const ctr = parseFloat(inputCtr.value) || 0;
    inputClicks.value = Math.round(impr * (ctr / 100));
    // also sync conversions
    const cvr = parseFloat(inputCvr.value) || 0;
    inputConversions.value = Math.round(parseFloat(inputClicks.value) * (cvr / 100));
    calculate();
  });

  inputClicks.addEventListener('input', () => {
    const impr = parseFloat(inputImpressions.value) || 0;
    const clicks = parseFloat(inputClicks.value) || 0;
    if (impr > 0) {
      inputCtr.value = ((clicks / impr) * 100).toFixed(2);
    }
    // sync conversions from current cvr
    const cvr = parseFloat(inputCvr.value) || 0;
    inputConversions.value = Math.round(clicks * (cvr / 100));
    calculate();
  });

  inputCvr.addEventListener('input', () => {
    const clicks = parseFloat(inputClicks.value) || 0;
    const cvr = parseFloat(inputCvr.value) || 0;
    inputConversions.value = Math.round(clicks * (cvr / 100));
    calculate();
  });

  inputConversions.addEventListener('input', () => {
    const clicks = parseFloat(inputClicks.value) || 0;
    const conv = parseFloat(inputConversions.value) || 0;
    if (clicks > 0) {
      inputCvr.value = ((conv / clicks) * 100).toFixed(2);
    }
    calculate();
  });

  inputImpressions.addEventListener('input', () => {
    const impr = parseFloat(inputImpressions.value) || 0;
    const ctr = parseFloat(inputCtr.value) || 0;
    inputClicks.value = Math.round(impr * (ctr / 100));
    const cvr = parseFloat(inputCvr.value) || 0;
    inputConversions.value = Math.round(parseFloat(inputClicks.value) * (cvr / 100));
    calculate();
  });

  [inputSpend, inputAov, inputMargin].forEach(el => {
    el.addEventListener('input', calculate);
  });

  labelCtrCalc.addEventListener('click', () => {
    const impr = parseFloat(inputImpressions.value) || 0;
    const ctr = parseFloat(inputCtr.value) || 0;
    inputClicks.value = Math.round(impr * (ctr / 100));
    calculate();
  });

  labelCvrCalc.addEventListener('click', () => {
    const clicks = parseFloat(inputClicks.value) || 0;
    const cvr = parseFloat(inputCvr.value) || 0;
    inputConversions.value = Math.round(clicks * (cvr / 100));
    calculate();
  });

  // Preset Button Click
  presetButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      presetButtons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const key = btn.dataset.preset;
      const conf = presets[key];
      if (conf) {
        inputSpend.value = conf.spend;
        inputImpressions.value = conf.impressions;
        inputCtr.value = conf.ctr.toFixed(2);
        inputClicks.value = Math.round(conf.impressions * (conf.ctr / 100));
        inputCvr.value = conf.cvr.toFixed(2);
        inputConversions.value = Math.round(parseFloat(inputClicks.value) * (conf.cvr / 100));
        inputAov.value = conf.aov;
        inputMargin.value = conf.margin;
        calculate();
      }
    });
  });

  // Reset
  btnReset.addEventListener('click', () => {
    const def = presets.ecommerce;
    inputSpend.value = def.spend;
    inputImpressions.value = def.impressions;
    inputCtr.value = def.ctr.toFixed(2);
    inputClicks.value = Math.round(def.impressions * (def.ctr / 100));
    inputCvr.value = def.cvr.toFixed(2);
    inputConversions.value = Math.round(parseFloat(inputClicks.value) * (def.cvr / 100));
    inputAov.value = def.aov;
    inputMargin.value = def.margin;
    presetButtons.forEach((b, i) => b.classList.toggle('active', i === 0));
    calculate();
  });

  // Copy Summary
  btnCopy.addEventListener('click', async () => {
    const summary = [
      `--- Ad Campaign Profitability Summary ---`,
      `Total Ad Spend: ${fmtMoney(parseFloat(inputSpend.value))}`,
      `Impressions: ${fmtNum(parseFloat(inputImpressions.value))}`,
      `Clicks: ${fmtNum(parseFloat(inputClicks.value))} (CTR: ${inputCtr.value}%)`,
      `Orders: ${fmtNum(parseFloat(inputConversions.value))} (CVR: ${inputCvr.value}%)`,
      `Average Order Value (AOV): ${fmtMoney(parseFloat(inputAov.value))}`,
      `Product Margin: ${inputMargin.value}%`,
      `Gross Revenue: ${outRevenue.textContent}`,
      `Cost Per Click (CPC): ${outCpc.textContent}`,
      `Cost Per Acquisition (CPA): ${outCpa.textContent}`,
      `Net Profit: ${outNetProfit.textContent}`,
      `Net ROI: ${badgeRoi.textContent}`,
      `ROAS: ${outRoas.textContent} (Break-Even ROAS: ${outRoasSub.textContent.replace('Break-Even: ', '')})`,
      `Max Allowable CPA: ${outCpaSub.textContent.replace('Max Allowable: ', '')}`
    ].join('\n');

    try {
      await navigator.clipboard.writeText(summary);
      const originalText = btnCopy.innerHTML;
      btnCopy.innerHTML = `✓ Copied!`;
      setTimeout(() => { btnCopy.innerHTML = originalText; }, 2000);
    } catch {
      alert('Copied to clipboard!\n\n' + summary);
    }
  });

  // Export CSV
  btnExport.addEventListener('click', () => {
    const csvContent = [
      ['Metric', 'Value'],
      ['Total Ad Spend', inputSpend.value],
      ['Total Impressions', inputImpressions.value],
      ['Clicks', inputClicks.value],
      ['CTR (%)', inputCtr.value],
      ['Conversions', inputConversions.value],
      ['CVR (%)', inputCvr.value],
      ['Average Order Value', inputAov.value],
      ['Product Margin (%)', inputMargin.value],
      ['CPC', outCpc.textContent.replace('$', '')],
      ['CPA', outCpa.textContent.replace('$', '')],
      ['Gross Revenue', outRevenue.textContent.replace('$', '').replace(/,/g, '')],
      ['Cost of Goods Sold', tblCogs.textContent.replace('$', '').replace(/,/g, '')],
      ['Gross Profit', tblGrossProfit.textContent.replace('$', '').replace(/,/g, '')],
      ['Net Profit', outNetProfit.textContent.replace('$', '').replace(/,/g, '')],
      ['ROAS', outRoas.textContent.replace('x', '')],
      ['Break-Even ROAS', tblBeRoas.textContent.replace('x', '')],
      ['Break-Even CPA', tblBeCpa.textContent.replace('$', '').replace(/,/g, '')]
    ].map(row => row.map(cell => `"${cell}"`).join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `campaign-profit-audit-${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  });

  // Initial Run
  calculate();
});