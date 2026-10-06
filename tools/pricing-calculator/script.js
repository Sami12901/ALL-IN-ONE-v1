// Strategic Pricing Model Suite & Margin Erosion Engine

document.addEventListener('DOMContentLoaded', () => {
  // --- DOM Elements ---
  const modeTabs = document.querySelectorAll('.mode-tab-btn');
  const sectionCostplus = document.getElementById('section-costplus');
  const sectionValuebased = document.getElementById('section-valuebased');
  const sectionCompetitor = document.getElementById('section-competitor');

  // Mode 1: Cost-Plus
  const inputCpCogs = document.getElementById('input-cp-cogs');
  const inputCpMarkup = document.getElementById('input-cp-markup');

  // Mode 2: Value-Based
  const inputVbValue = document.getElementById('input-vb-value');
  const inputVbCapture = document.getElementById('input-vb-capture');
  const inputVbCogs = document.getElementById('input-vb-cogs');

  // Mode 3: Competitor
  const inputCompBase = document.getElementById('input-comp-base');
  const selectCompPosition = document.getElementById('select-comp-position');
  const inputCompCogs = document.getElementById('input-comp-cogs');

  // Common: Fixed Costs & Units
  const inputFixedCosts = document.getElementById('input-fixed-costs');
  const inputTargetUnits = document.getElementById('input-target-units');

  // Outputs
  const valRetailPrice = document.getElementById('val-retail-price');
  const badgeMargin = document.getElementById('badge-margin');
  const valPriceSub = document.getElementById('val-price-sub');

  const valGrossMargin = document.getElementById('val-gross-margin');
  const valCogsSub = document.getElementById('val-cogs-sub');
  const valBeUnits = document.getElementById('val-be-units');
  const valBeRev = document.getElementById('val-be-rev');
  const valNetProfit = document.getElementById('val-net-profit');
  const valVolumeSub = document.getElementById('val-volume-sub');
  const valCmRatio = document.getElementById('val-cm-ratio');

  // Discount Sensitivity Elements
  const sliderDiscount = document.getElementById('slider-discount');
  const lblDiscountVal = document.getElementById('lbl-discount-val');
  const txtErosionDisc = document.getElementById('txt-erosion-disc');
  const txtDiscountUnitProfit = document.getElementById('txt-discount-unit-profit');
  const txtMoreUnitsNeeded = document.getElementById('txt-more-units-needed');
  const erosionAlert = document.getElementById('erosion-alert');
  const sensitivityTableBody = document.getElementById('sensitivity-table-body');

  // Presets and Buttons
  const presetButtons = document.querySelectorAll('.preset-chip-btn');
  const btnCopy = document.getElementById('btn-copy-summary');
  const btnExport = document.getElementById('btn-export-csv');

  let activeMode = 'costplus';

  // Formatters
  const fmtMoney = (n) => {
    if (!isFinite(n) || isNaN(n)) return '$0.00';
    return (n < 0 ? '-$' : '$') + Math.abs(n).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };
  const fmtInt = (n) => {
    if (!isFinite(n) || isNaN(n)) return '0';
    return Math.round(n).toLocaleString('en-US');
  };
  const fmtPct = (n) => {
    if (!isFinite(n) || isNaN(n)) return '0.0%';
    return n.toFixed(1) + '%';
  };

  const presets = {
    physical: { mode: 'costplus', cogs: 35, markup: 150, fixed: 12000, units: 350 },
    saas: { mode: 'costplus', cogs: 12, markup: 450, fixed: 25000, units: 600 },
    consulting: { mode: 'valuebased', val: 10000, cap: 25, cogs: 500, fixed: 20000, units: 15 },
    wholesale: { mode: 'competitor', comp: 80, pos: '0.0', cogs: 28, fixed: 15000, units: 500 }
  };

  function switchMode(newMode) {
    activeMode = newMode;
    modeTabs.forEach(tab => {
      tab.classList.toggle('active', tab.dataset.mode === newMode);
    });

    sectionCostplus.style.display = newMode === 'costplus' ? 'block' : 'none';
    sectionValuebased.style.display = newMode === 'valuebased' ? 'block' : 'none';
    sectionCompetitor.style.display = newMode === 'competitor' ? 'block' : 'none';

    calculate();
  }

  function calculate() {
    let retailPrice = 0;
    let unitCogs = 0;

    if (activeMode === 'costplus') {
      unitCogs = Math.max(0, parseFloat(inputCpCogs.value) || 0);
      const markup = Math.max(0, parseFloat(inputCpMarkup.value) || 0) / 100;
      retailPrice = unitCogs * (1 + markup);
    } else if (activeMode === 'valuebased') {
      const valCreated = Math.max(0, parseFloat(inputVbValue.value) || 0);
      const capturePct = Math.max(0, parseFloat(inputVbCapture.value) || 0) / 100;
      unitCogs = Math.max(0, parseFloat(inputVbCogs.value) || 0);
      retailPrice = valCreated * capturePct;
    } else if (activeMode === 'competitor') {
      const compBase = Math.max(0, parseFloat(inputCompBase.value) || 0);
      const positionMult = parseFloat(selectCompPosition.value) || 0;
      unitCogs = Math.max(0, parseFloat(inputCompCogs.value) || 0);
      retailPrice = compBase * (1 + positionMult);
    }

    const fixedCosts = Math.max(0, parseFloat(inputFixedCosts.value) || 0);
    const targetUnits = Math.max(1, parseFloat(inputTargetUnits.value) || 1);

    // Unit Economics
    const unitProfit = retailPrice - unitCogs;
    const grossMarginPct = retailPrice > 0 ? (unitProfit / retailPrice) * 100 : 0;
    const contributionMargin = unitProfit; // variable cost assumed = COGS
    const cmRatio = retailPrice > 0 ? (contributionMargin / retailPrice) * 100 : 0;

    // Break-Even
    const beUnits = contributionMargin > 0 ? Math.ceil(fixedCosts / contributionMargin) : 0;
    const beRevenue = beUnits * retailPrice;

    // Projected Monthly Net Profit
    const totalGrossProfit = targetUnits * contributionMargin;
    const netProfit = totalGrossProfit - fixedCosts;

    // Render Highlights
    valRetailPrice.textContent = fmtMoney(retailPrice);
    valPriceSub.textContent = `Contribution Margin: ${fmtMoney(contributionMargin)} per unit`;

    badgeMargin.textContent = `${grossMarginPct.toFixed(1)}% Gross Margin`;
    badgeMargin.className = 'badge-pill ' + (grossMarginPct >= 40 ? 'success' : (grossMarginPct > 0 ? 'warning' : 'danger'));

    valGrossMargin.textContent = fmtPct(grossMarginPct);
    valCogsSub.textContent = `Unit COGS: ${fmtMoney(unitCogs)}`;

    valBeUnits.textContent = contributionMargin > 0 ? `${fmtInt(beUnits)} Units` : 'N/A (Cost > Price)';
    valBeRev.textContent = contributionMargin > 0 ? `Break-Even Sales: ${fmtMoney(beRevenue)}` : 'Zero Contribution';

    valNetProfit.textContent = (netProfit >= 0 ? '+' : '') + fmtMoney(netProfit);
    valNetProfit.style.color = netProfit >= 0 ? '#10b981' : '#ef4444';
    valVolumeSub.textContent = `At ${fmtInt(targetUnits)} monthly units`;

    valCmRatio.textContent = fmtPct(cmRatio);

    // Calculate Discount Sensitivity
    renderDiscountAnalysis(retailPrice, unitCogs, fixedCosts, contributionMargin);
  }

  function renderDiscountAnalysis(basePrice, cogs, fixedCosts, originalCM) {
    const discountPct = parseFloat(sliderDiscount.value) || 0;
    lblDiscountVal.textContent = `${discountPct}% Discount`;
    txtErosionDisc.textContent = `${discountPct}%`;

    const discPrice = basePrice * (1 - discountPct / 100);
    const discCM = discPrice - cogs;
    txtDiscountUnitProfit.textContent = fmtMoney(discCM);

    if (discCM <= 0) {
      txtMoreUnitsNeeded.textContent = 'Infinite (Selling at/below Cost)';
      erosionAlert.style.borderColor = 'rgba(239, 68, 68, 0.7)';
    } else {
      const extraUnitsPct = originalCM > 0 ? ((originalCM / discCM) - 1) * 100 : 0;
      txtMoreUnitsNeeded.textContent = (extraUnitsPct >= 0 ? '+' : '') + extraUnitsPct.toFixed(1) + '%';
      erosionAlert.style.borderColor = discountPct > 20 ? 'rgba(239, 68, 68, 0.5)' : 'rgba(245, 158, 11, 0.4)';
    }

    // Build Table for Preset Discount Tiers
    const tiers = [0, 5, 10, 15, 20, 25, 30, 40];
    let rowsHtml = '';

    tiers.forEach(d => {
      const p = basePrice * (1 - d / 100);
      const cm = p - cogs;
      const gm = p > 0 ? (cm / p) * 100 : 0;
      const be = cm > 0 ? Math.ceil(fixedCosts / cm) : 'Loss';
      let extraPctStr = '0.0%';

      if (cm <= 0) {
        extraPctStr = 'Deficit';
      } else if (originalCM > 0) {
        const extra = ((originalCM / cm) - 1) * 100;
        extraPctStr = (extra > 0 ? '+' : '') + extra.toFixed(1) + '%';
      }

      const isCurrentSlider = Math.abs(discountPct - d) < 2.5;

      rowsHtml += `
        <tr class="${isCurrentSlider ? 'active-discount-row' : ''}">
          <td>${d}%</td>
          <td>${fmtMoney(p)}</td>
          <td style="color: ${cm > 0 ? '#10b981' : '#ef4444'};">${fmtMoney(cm)}</td>
          <td>${fmtPct(gm)}</td>
          <td>${typeof be === 'number' ? fmtInt(be) + ' units' : be}</td>
          <td style="color: ${cm <= 0 || (originalCM / cm) > 1.5 ? '#ef4444' : 'inherit'};">${extraPctStr}</td>
        </tr>
      `;
    });

    sensitivityTableBody.innerHTML = rowsHtml;
  }

  // Event Listeners for Tab Switching
  modeTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      switchMode(tab.dataset.mode);
    });
  });

  // Inputs
  [
    inputCpCogs, inputCpMarkup,
    inputVbValue, inputVbCapture, inputVbCogs,
    inputCompBase, selectCompPosition, inputCompCogs,
    inputFixedCosts, inputTargetUnits, sliderDiscount
  ].forEach(el => {
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
        switchMode(conf.mode);
        if (conf.mode === 'costplus') {
          inputCpCogs.value = conf.cogs;
          inputCpMarkup.value = conf.markup;
        } else if (conf.mode === 'valuebased') {
          inputVbValue.value = conf.val;
          inputVbCapture.value = conf.cap;
          inputVbCogs.value = conf.cogs;
        } else if (conf.mode === 'competitor') {
          inputCompBase.value = conf.comp;
          selectCompPosition.value = conf.pos;
          inputCompCogs.value = conf.cogs;
        }
        inputFixedCosts.value = conf.fixed;
        inputTargetUnits.value = conf.units;
        calculate();
      }
    });
  });

  // Copy Summary
  btnCopy.addEventListener('click', async () => {
    const summary = [
      `--- Strategic Pricing Model Summary (${activeMode.toUpperCase()}) ---`,
      `Recommended Retail Price: ${valRetailPrice.textContent}`,
      `Gross Margin: ${valGrossMargin.textContent}`,
      `Unit Contribution Margin: ${valPriceSub.textContent}`,
      `Monthly Fixed Costs: ${fmtMoney(parseFloat(inputFixedCosts.value))}`,
      `Break-Even Volume: ${valBeUnits.textContent} (${valBeRev.textContent})`,
      `Expected Sales Volume: ${inputTargetUnits.value} units`,
      `Projected Monthly Net Profit: ${valNetProfit.textContent}`,
      `Discount Sensitivity: At ${sliderDiscount.value}% discount, required volume increases by ${txtMoreUnitsNeeded.textContent} to hold profit flat.`
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
      ['Pricing Framework', activeMode],
      ['Recommended Price', valRetailPrice.textContent.replace('$', '')],
      ['Gross Margin (%)', valGrossMargin.textContent.replace('%', '')],
      ['Monthly Fixed Costs', inputFixedCosts.value],
      ['Expected Unit Sales', inputTargetUnits.value],
      ['Break-Even Units', valBeUnits.textContent.replace(' Units', '')],
      ['Projected Net Profit', valNetProfit.textContent.replace('$', '').replace(/,/g, '')],
      ['Active Discount (%)', sliderDiscount.value],
      ['Extra Volume Required to Offset Discount', txtMoreUnitsNeeded.textContent]
    ].map(row => row.map(c => `"${c}"`).join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `pricing-strategy-audit-${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  });

  // Initial Calculation
  calculate();
});