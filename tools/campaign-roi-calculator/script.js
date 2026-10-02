// Campaign ROI & Equity Calculator - Core Client-Side Engine
// Handles luxury financial modeling, LTV projection, ROAS/ROMI calculations, and executive reporting.

const PRESETS = {
  soiree: {
    name: 'Private VIP Soirée',
    description: 'Intimate private collector salon & cocktail dinner (Vendôme).',
    venue: 75000,
    talent: 35000,
    media: 10000,
    hospitality: 60000,
    revenue: 650000,
    margin: 78,
    acquisitions: 22,
    repeatProb: 55,
    repeatFreq: 2.5,
    equityHalo: 1.25
  },
  jewelry: {
    name: 'High Jewelry Editorial',
    description: 'Exclusive Met Gala / Cannes editorial feature with high-jewelry loaning.',
    venue: 110000,
    talent: 140000,
    media: 40000,
    hospitality: 30000,
    revenue: 1250000,
    margin: 82,
    acquisitions: 14,
    repeatProb: 40,
    repeatFreq: 1.8,
    equityHalo: 1.35
  },
  digital: {
    name: 'Digital Paid Acquisition',
    description: 'Targeted programmatic & bespoke concierge ad acquisition for private sales.',
    venue: 15000,
    talent: 10000,
    media: 65000,
    hospitality: 5000,
    revenue: 340000,
    margin: 74,
    acquisitions: 85,
    repeatProb: 32,
    repeatFreq: 1.5,
    equityHalo: 1.10
  },
  ambassador: {
    name: 'Ambassador Sponsorship',
    description: 'Global equestrian grand prix or film festival brand ambassador partnership.',
    venue: 80000,
    talent: 450000,
    media: 80000,
    hospitality: 40000,
    revenue: 2400000,
    margin: 80,
    acquisitions: 110,
    repeatProb: 48,
    repeatFreq: 2.0,
    equityHalo: 1.50
  },
  popup: {
    name: 'Pop-up Boutique',
    description: 'Ephemeral winter salon in St. Moritz / Courchevel ski residence.',
    venue: 160000,
    talent: 20000,
    media: 35000,
    hospitality: 45000,
    revenue: 920000,
    margin: 76,
    acquisitions: 68,
    repeatProb: 50,
    repeatFreq: 2.2,
    equityHalo: 1.20
  }
};

const CURRENCIES = {
  USD: { symbol: '$', code: 'USD' },
  EUR: { symbol: '€', code: 'EUR' },
  GBP: { symbol: '£', code: 'GBP' },
  CHF: { symbol: 'Fr. ', code: 'CHF' }
};

document.addEventListener('DOMContentLoaded', () => {
  // DOM Elements - Inputs
  const currencySelect = document.getElementById('currency-select');
  const activePresetDesc = document.getElementById('active-preset-desc');
  
  const inpCostVenue = document.getElementById('inp-cost-venue');
  const rangeCostVenue = document.getElementById('range-cost-venue');
  const pctCostVenue = document.getElementById('pct-cost-venue');

  const inpCostTalent = document.getElementById('inp-cost-talent');
  const rangeCostTalent = document.getElementById('range-cost-talent');
  const pctCostTalent = document.getElementById('pct-cost-talent');

  const inpCostMedia = document.getElementById('inp-cost-media');
  const rangeCostMedia = document.getElementById('range-cost-media');
  const pctCostMedia = document.getElementById('pct-cost-media');

  const inpCostHospitality = document.getElementById('inp-cost-hospitality');
  const rangeCostHospitality = document.getElementById('range-cost-hospitality');
  const pctCostHospitality = document.getElementById('pct-cost-hospitality');

  const inpRevenue = document.getElementById('inp-revenue');
  const rangeRevenue = document.getElementById('range-revenue');

  const inpMargin = document.getElementById('inp-margin');
  const dispMarginVal = document.getElementById('disp-margin-val');

  const inpAcquisitionCount = document.getElementById('inp-acquisition-count');
  const rangeAcquisitionCount = document.getElementById('range-acquisition-count');
  const dispVipVal = document.getElementById('disp-vip-val');

  const inpRepeatProb = document.getElementById('inp-repeat-prob');
  const dispRepeatVal = document.getElementById('disp-repeat-val');

  const inpRepeatFreq = document.getElementById('inp-repeat-freq');
  const dispRepeatFreq = document.getElementById('disp-repeat-freq');

  const inpEquityHalo = document.getElementById('inp-equity-halo');
  const dispEquityHalo = document.getElementById('disp-equity-halo');

  // Breakdown Segments
  const segVenue = document.getElementById('seg-venue');
  const segTalent = document.getElementById('seg-talent');
  const segMedia = document.getElementById('seg-media');
  const segHosp = document.getElementById('seg-hosp');

  // Displays & KPI Cards
  const dispTotalBudget = document.getElementById('disp-total-budget');
  const kpiImmediateRoi = document.getElementById('kpi-immediate-roi');
  const badgeRoiStatus = document.getElementById('badge-roi-status');
  const kpiImmediateProfitSub = document.getElementById('kpi-immediate-profit-sub');

  const kpiLtvRoi = document.getElementById('kpi-ltv-roi');
  const kpiLtvValSub = document.getElementById('kpi-ltv-val-sub');

  const kpiCac = document.getElementById('kpi-cac');
  const kpiCacRatio = document.getElementById('kpi-cac-ratio');
  const kpiAovSub = document.getElementById('kpi-aov-sub');

  const kpiRoas = document.getElementById('kpi-roas');
  const kpiMediaSpendSub = document.getElementById('kpi-media-spend-sub');

  const kpiRomi = document.getElementById('kpi-romi');
  const kpiBreakevenRev = document.getElementById('kpi-breakeven-rev');
  const kpiBreakevenUnits = document.getElementById('kpi-breakeven-units');

  // Waterfall Steps
  const wfSpend = document.getElementById('wf-spend');
  const wfGrossProfit = document.getElementById('wf-gross-profit');
  const wfMarginNote = document.getElementById('wf-margin-note');
  const wfRepeatProfit = document.getElementById('wf-repeat-profit');
  const wfRepeatNote = document.getElementById('wf-repeat-note');
  const wfTotalNet = document.getElementById('wf-total-net');

  // Ledger Table
  const tableImmRev = document.getElementById('table-imm-rev');
  const tableProjRev = document.getElementById('table-proj-rev');
  const tableRevMultiple = document.getElementById('table-rev-multiple');
  const tableImmCogs = document.getElementById('table-imm-cogs');
  const tableProjCogs = document.getElementById('table-proj-cogs');
  const tableImmGp = document.getElementById('table-imm-gp');
  const tableProjGp = document.getElementById('table-proj-gp');
  const tableGpMultiple = document.getElementById('table-gp-multiple');
  const tableImmSpend = document.getElementById('table-imm-spend');
  const tableProjSpend = document.getElementById('table-proj-spend');
  const tableImmNet = document.getElementById('table-imm-net');
  const tableProjNet = document.getElementById('table-proj-net');
  const tableNetGain = document.getElementById('table-net-gain');

  // Executive Brief
  const executiveBriefText = document.getElementById('executive-brief-text');
  const briefTimestamp = document.getElementById('brief-timestamp');
  const btnCopyBrief = document.getElementById('btn-copy-brief');
  const btnSampleExport = document.getElementById('btn-sample-export');
  const btnPrintBrief = document.getElementById('btn-print-brief');
  const btnExportJson = document.getElementById('btn-export-json');
  const btnReset = document.getElementById('btn-reset');

  // Preset Buttons
  const presetChips = document.querySelectorAll('.preset-chip');

  // Current State
  let currentPresetKey = 'soiree';
  let currencyCode = 'USD';

  // Format Helper
  function formatMoney(amount, decimals = 0) {
    const sym = CURRENCIES[currencyCode]?.symbol || '$';
    const isNeg = amount < 0;
    const absVal = Math.abs(amount);
    const formatted = absVal.toLocaleString('en-US', {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals
    });
    return isNeg ? `-${sym}${formatted}` : `${sym}${formatted}`;
  }

  function formatPercent(pct, decimals = 1) {
    const sign = pct > 0 ? '+' : '';
    return `${sign}${pct.toFixed(decimals)}%`;
  }

  // Calculate & Refresh UI
  function calculate() {
    const venue = Math.max(0, parseFloat(inpCostVenue.value) || 0);
    const talent = Math.max(0, parseFloat(inpCostTalent.value) || 0);
    const media = Math.max(0, parseFloat(inpCostMedia.value) || 0);
    const hospitality = Math.max(0, parseFloat(inpCostHospitality.value) || 0);

    const totalBudget = venue + talent + media + hospitality;
    const revenue = Math.max(0, parseFloat(inpRevenue.value) || 0);
    const marginPct = Math.min(90, Math.max(70, parseFloat(inpMargin.value) || 78));
    const marginDec = marginPct / 100;
    const acquisitions = Math.max(1, parseInt(inpAcquisitionCount.value, 10) || 1);
    const repeatProbPct = Math.min(90, Math.max(10, parseFloat(inpRepeatProb.value) || 50));
    const repeatProbDec = repeatProbPct / 100;
    const repeatFreq = Math.max(1, parseFloat(inpRepeatFreq.value) || 2);
    const equityHalo = Math.max(1.0, parseFloat(inpEquityHalo.value) || 1.25);

    // Update Percentage Labels & Breakdown bar
    if (totalBudget > 0) {
      const vPct = (venue / totalBudget) * 100;
      const tPct = (talent / totalBudget) * 100;
      const mPct = (media / totalBudget) * 100;
      const hPct = (hospitality / totalBudget) * 100;

      pctCostVenue.textContent = `${vPct.toFixed(1)}%`;
      pctCostTalent.textContent = `${tPct.toFixed(1)}%`;
      pctCostMedia.textContent = `${mPct.toFixed(1)}%`;
      pctCostHospitality.textContent = `${hPct.toFixed(1)}%`;

      segVenue.style.width = `${vPct}%`;
      segTalent.style.width = `${tPct}%`;
      segMedia.style.width = `${mPct}%`;
      segHosp.style.width = `${hPct}%`;
    } else {
      pctCostVenue.textContent = '0%';
      pctCostTalent.textContent = '0%';
      pctCostMedia.textContent = '0%';
      pctCostHospitality.textContent = '0%';
      segVenue.style.width = '25%';
      segTalent.style.width = '25%';
      segMedia.style.width = '25%';
      segHosp.style.width = '25%';
    }

    // Core Financial Metrics
    const immediateGrossProfit = revenue * marginDec;
    const immediateCOGS = revenue - immediateGrossProfit;
    const immediateNetProfit = immediateGrossProfit - totalBudget;
    const immediateRoiPct = totalBudget > 0 ? (immediateNetProfit / totalBudget) * 100 : 0;

    // Commercial Metrics
    const romiMultiple = totalBudget > 0 ? (immediateGrossProfit / totalBudget) : 0;
    const roasMultiple = media > 0 ? (revenue / media) : null;
    const cac = totalBudget / acquisitions;
    const aov = revenue / acquisitions;

    // Breakeven Calculations
    const breakevenRevenue = marginDec > 0 ? (totalBudget / marginDec) : 0;
    const breakevenUnits = aov > 0 ? Math.ceil(breakevenRevenue / aov) : 0;

    // Long-Term Lifetime Value (3-Year Horizon)
    // Client repeat expectation
    const expectedRepeatOrdersPerClient = repeatProbDec * repeatFreq;
    const totalRepeatRevenue = acquisitions * expectedRepeatOrdersPerClient * aov;
    const totalRepeatGrossProfit = totalRepeatRevenue * marginDec;
    const totalRepeatCOGS = totalRepeatRevenue - totalRepeatGrossProfit;

    // Brand Equity & Halo Spillover Effect
    const equitySpilloverRevenue = revenue * (equityHalo - 1.0);
    const equitySpilloverGrossProfit = equitySpilloverRevenue * marginDec;

    const total3YrGrossValue = immediateGrossProfit + totalRepeatGrossProfit + equitySpilloverGrossProfit;
    const total3YrNetValue = total3YrGrossValue - totalBudget;
    const ltvAdjustedRoiPct = totalBudget > 0 ? (total3YrNetValue / totalBudget) * 100 : 0;

    const projectedTotalRevenue = revenue + totalRepeatRevenue + equitySpilloverRevenue;
    const projectedTotalCOGS = immediateCOGS + totalRepeatCOGS + (equitySpilloverRevenue - equitySpilloverGrossProfit);

    // Update Primary Displays
    dispTotalBudget.textContent = formatMoney(totalBudget);
    dispMarginVal.textContent = `${marginPct}%`;
    dispVipVal.textContent = `${acquisitions} VIPs`;
    dispRepeatVal.textContent = `${repeatProbPct}%`;
    dispRepeatFreq.textContent = `${repeatFreq.toFixed(1)} orders`;
    dispEquityHalo.textContent = `${equityHalo.toFixed(2)}x`;

    // KPI Cards
    kpiImmediateRoi.textContent = formatPercent(immediateRoiPct);
    if (immediateRoiPct >= 0) {
      badgeRoiStatus.textContent = `${formatPercent(immediateRoiPct)} Net`;
      badgeRoiStatus.className = 'kpi-pill pill-positive';
      kpiImmediateRoi.className = 'kpi-value emerald';
    } else {
      badgeRoiStatus.textContent = `${formatPercent(immediateRoiPct)} Deficit`;
      badgeRoiStatus.className = 'kpi-pill pill-neutral';
      kpiImmediateRoi.className = 'kpi-value';
      kpiImmediateRoi.style.color = 'var(--rose-accent)';
    }

    kpiImmediateProfitSub.innerHTML = `Immediate Net Profit: <strong style="color: #fff;">${formatMoney(immediateNetProfit)}</strong>`;

    kpiLtvRoi.textContent = formatPercent(ltvAdjustedRoiPct);
    kpiLtvValSub.innerHTML = `Total 3-Yr Net Value: <strong style="color: #fff;">${formatMoney(total3YrNetValue)}</strong>`;

    kpiCac.textContent = formatMoney(cac);
    const cacRatio = aov > 0 ? ((cac / aov) * 100).toFixed(1) : 0;
    kpiCacRatio.textContent = `${cacRatio}% of AOV`;
    kpiAovSub.innerHTML = `Avg. Order Value (AOV): <strong style="color: var(--text-primary);">${formatMoney(aov)}</strong>`;

    kpiRoas.textContent = roasMultiple !== null ? `${roasMultiple.toFixed(2)}x` : 'N/A';
    kpiMediaSpendSub.innerHTML = `On Paid Media Spend of <strong>${formatMoney(media)}</strong>`;

    kpiRomi.textContent = `${romiMultiple.toFixed(2)}x`;

    kpiBreakevenRev.textContent = formatMoney(breakevenRevenue);
    kpiBreakevenUnits.textContent = `${breakevenUnits} VIP Clients`;

    // Waterfall step amounts
    wfSpend.textContent = formatMoney(totalBudget);
    wfGrossProfit.textContent = formatMoney(immediateGrossProfit);
    wfMarginNote.textContent = `At ${marginPct}% Gross Margin`;
    wfRepeatProfit.textContent = formatMoney(totalRepeatGrossProfit + equitySpilloverGrossProfit);
    wfRepeatNote.textContent = `${repeatProbPct}% Prob. + ${equityHalo.toFixed(2)}x Halo`;
    wfTotalNet.textContent = formatMoney(total3YrNetValue);

    // Ledger Table
    tableImmRev.textContent = formatMoney(revenue);
    tableProjRev.textContent = formatMoney(projectedTotalRevenue);
    const revExpansion = revenue > 0 ? (projectedTotalRevenue / revenue).toFixed(2) : '1.0';
    tableRevMultiple.textContent = `${revExpansion}x Expansion`;

    tableImmCogs.textContent = `(${formatMoney(immediateCOGS)})`;
    tableProjCogs.textContent = `(${formatMoney(projectedTotalCOGS)})`;

    tableImmGp.textContent = formatMoney(immediateGrossProfit);
    tableProjGp.textContent = formatMoney(total3YrGrossValue);
    const gpYieldGain = immediateGrossProfit > 0 ? (((total3YrGrossValue - immediateGrossProfit) / immediateGrossProfit) * 100).toFixed(1) : '0';
    tableGpMultiple.textContent = `+${gpYieldGain}% Yield`;

    tableImmSpend.textContent = `(${formatMoney(totalBudget)})`;
    tableProjSpend.textContent = `(${formatMoney(totalBudget)})`;

    tableImmNet.textContent = formatMoney(immediateNetProfit);
    tableProjNet.textContent = formatMoney(total3YrNetValue);
    const netExpansion = immediateNetProfit > 0 ? (((total3YrNetValue - immediateNetProfit) / immediateNetProfit) * 100).toFixed(1) : 'N/A';
    tableNetGain.textContent = netExpansion !== 'N/A' ? `+${netExpansion}% Lifetime Expansion` : 'Expanded Portfolio';

    // Update Executive Brief Text
    const presetName = PRESETS[currentPresetKey]?.name || 'Custom Campaign';
    const now = new Date();
    const dateStr = now.toLocaleDateString('en-US', { month: 'long', year: 'numeric', day: 'numeric' });
    briefTimestamp.textContent = dateStr;

    const briefText = `================================================================================
MAISON HAUTE DIRECTION INVESTMENT BRIEF
CAMPAIGN: ${presetName.toUpperCase()}
DATE: ${dateStr} | CURRENCY: ${currencyCode}
================================================================================

1. CAPITAL DEPLOYMENT & SPEND ALLOCATION:
   • Total Budget:            ${formatMoney(totalBudget)}
     - Production & Venue:    ${formatMoney(venue)} (${((venue / (totalBudget || 1)) * 100).toFixed(1)}%)
     - Talent & Ambassador:   ${formatMoney(talent)} (${((talent / (totalBudget || 1)) * 100).toFixed(1)}%)
     - Paid Media & Amplif.:  ${formatMoney(media)} (${((media / (totalBudget || 1)) * 100).toFixed(1)}%)
     - VIP Hospitality & Ops: ${formatMoney(hospitality)} (${((hospitality / (totalBudget || 1)) * 100).toFixed(1)}%)

2. IMMEDIATE COMMERCIAL RETURNS:
   • Attributed Revenue:      ${formatMoney(revenue)}
   • Luxury Gross Margin:     ${marginPct}% (${formatMoney(immediateGrossProfit)} Gross Profit)
   • Immediate Net Profit:    ${formatMoney(immediateNetProfit)}
   • Immediate Margin ROI:    ${formatPercent(immediateRoiPct)}
   • Return on Ad Spend:      ${roasMultiple !== null ? `${roasMultiple.toFixed(2)}x` : 'N/A (Direct / Editorial)'}
   • ROMI (Efficiency):       ${romiMultiple.toFixed(2)}x gross margin per budget unit

3. HIGH-NET-WORTH (HNW) CLIENT VALUE & REPEAT ACQUISITION:
   • Acquired VIP Clients:    ${acquisitions} collectors
   • Average Order Value:     ${formatMoney(aov)}
   • Cost per Acquired VIP:   ${formatMoney(cac)} (${cacRatio}% of AOV)
   • Repeat Purchase Prob.:   ${repeatProbPct}% (Over 3-Yr Horizon)
   • Breakeven Sales Vol.:    ${formatMoney(breakevenRevenue)} (${breakevenUnits} VIP transactions)

4. 3-YEAR BRAND EQUITY & LIFETIME VALUE PROJECTION:
   • Expected Repeat GP:      ${formatMoney(totalRepeatGrossProfit)}
   • Brand Equity Halo Yield: ${formatMoney(equitySpilloverGrossProfit)} (${equityHalo.toFixed(2)}x halo multiplier)
   • Total 3-Yr Net Creation: ${formatMoney(total3YrNetValue)}
   • 3-Yr LTV-Adjusted ROI:   ${formatPercent(ltvAdjustedRoiPct)}

STRATEGIC CONCLUSION:
This activation exhibits robust luxury unit economics. With a CAC of ${formatMoney(cac)} against an AOV of ${formatMoney(aov)}, the immediate payback is verified, while downstream repurchase probabilities expand initial returns to ${formatPercent(ltvAdjustedRoiPct)} net economic surplus over 36 months.
================================================================================`;

    executiveBriefText.textContent = briefText;
  }

  // Two-way synchronization helper between input and range
  function syncPair(inputElem, rangeElem, isFloat = false) {
    inputElem.addEventListener('input', () => {
      rangeElem.value = inputElem.value;
      calculate();
    });
    rangeElem.addEventListener('input', () => {
      inputElem.value = isFloat ? parseFloat(rangeElem.value).toFixed(1) : rangeElem.value;
      calculate();
    });
  }

  syncPair(inpCostVenue, rangeCostVenue);
  syncPair(inpCostTalent, rangeCostTalent);
  syncPair(inpCostMedia, rangeCostMedia);
  syncPair(inpCostHospitality, rangeCostHospitality);
  syncPair(inpRevenue, rangeRevenue);
  syncPair(inpAcquisitionCount, rangeAcquisitionCount);

  inpMargin.addEventListener('input', calculate);
  inpRepeatProb.addEventListener('input', calculate);
  inpRepeatFreq.addEventListener('input', calculate);
  inpEquityHalo.addEventListener('input', calculate);

  // Currency select
  currencySelect.addEventListener('change', (e) => {
    currencyCode = e.target.value;
    document.querySelectorAll('.currency-symbol').forEach(sym => {
      sym.textContent = CURRENCIES[currencyCode]?.symbol || '$';
    });
    calculate();
  });

  // Apply Preset Function
  function applyPreset(presetKey) {
    const p = PRESETS[presetKey];
    if (!p) return;
    currentPresetKey = presetKey;

    activePresetDesc.textContent = p.description;

    inpCostVenue.value = p.venue;
    rangeCostVenue.value = p.venue;

    inpCostTalent.value = p.talent;
    rangeCostTalent.value = p.talent;

    inpCostMedia.value = p.media;
    rangeCostMedia.value = p.media;

    inpCostHospitality.value = p.hospitality;
    rangeCostHospitality.value = p.hospitality;

    inpRevenue.value = p.revenue;
    rangeRevenue.value = p.revenue;

    inpMargin.value = p.margin;
    inpAcquisitionCount.value = p.acquisitions;
    rangeAcquisitionCount.value = p.acquisitions;

    inpRepeatProb.value = p.repeatProb;
    inpRepeatFreq.value = p.repeatFreq;
    inpEquityHalo.value = p.equityHalo;

    presetChips.forEach(chip => {
      chip.classList.toggle('active', chip.dataset.preset === presetKey);
    });

    calculate();
  }

  // Preset chip clicks
  presetChips.forEach(chip => {
    chip.addEventListener('click', () => {
      applyPreset(chip.dataset.preset);
    });
  });

  // Reset Button
  btnReset.addEventListener('click', () => {
    applyPreset('soiree');
  });

  // Copy Executive Brief Handler
  function copyBriefToClipboard() {
    const text = executiveBriefText.textContent;
    navigator.clipboard.writeText(text).then(() => {
      const originalHtml = btnCopyBrief.innerHTML;
      btnCopyBrief.innerHTML = `
        <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"></polyline></svg>
        Copied to Clipboard!
      `;
      btnCopyBrief.style.background = 'var(--emerald-accent)';
      btnCopyBrief.style.color = '#ffffff';

      setTimeout(() => {
        btnCopyBrief.innerHTML = originalHtml;
        btnCopyBrief.style.background = '';
        btnCopyBrief.style.color = '';
      }, 2500);
    }).catch(() => {
      // Fallback
      const textarea = document.createElement('textarea');
      textarea.value = text;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      alert('Executive brief copied to clipboard.');
    });
  }

  btnCopyBrief.addEventListener('click', copyBriefToClipboard);
  btnSampleExport.addEventListener('click', copyBriefToClipboard);

  // Print Executive Brief Handler
  btnPrintBrief.addEventListener('click', () => {
    window.print();
  });

  // Export JSON Model Handler
  btnExportJson.addEventListener('click', () => {
    const venue = parseFloat(inpCostVenue.value) || 0;
    const talent = parseFloat(inpCostTalent.value) || 0;
    const media = parseFloat(inpCostMedia.value) || 0;
    const hospitality = parseFloat(inpCostHospitality.value) || 0;
    const totalBudget = venue + talent + media + hospitality;
    const revenue = parseFloat(inpRevenue.value) || 0;
    const margin = parseFloat(inpMargin.value) || 78;
    const acquisitions = parseInt(inpAcquisitionCount.value, 10) || 1;
    const repeatProb = parseFloat(inpRepeatProb.value) || 50;

    const exportData = {
      maisonReport: "Campaign ROI & Equity Model",
      preset: PRESETS[currentPresetKey]?.name || "Custom",
      currency: currencyCode,
      generatedAt: new Date().toISOString(),
      financials: {
        totalBudget,
        productionVenue: venue,
        talentFees: talent,
        mediaSpend: media,
        hospitalityOps: hospitality,
        attributedRevenue: revenue,
        grossMarginPct: margin,
        vipAcquisitions: acquisitions,
        repeatProbabilityPct: repeatProb
      },
      executiveSummary: executiveBriefText.textContent
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `campaign-roi-model-${currentPresetKey}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  });

  // Initial Calculation
  calculate();
});