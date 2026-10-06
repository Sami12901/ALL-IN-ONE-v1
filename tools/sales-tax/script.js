// Sales Tax & VAT Calculator Logic
document.addEventListener('DOMContentLoaded', () => {
  // Elements
  const btnModeAdd = document.getElementById('btn-mode-add');
  const btnModeRemove = document.getElementById('btn-mode-remove');
  const currencySelect = document.getElementById('currency-select');
  const currencySymbolAffix = document.getElementById('currency-symbol-affix');
  const amountInput = document.getElementById('tax-amount-input');
  const amountLabel = document.getElementById('amount-label');
  const rateInput = document.getElementById('tax-rate-input');
  const rateRange = document.getElementById('tax-rate-range');
  const rateBadge = document.getElementById('rate-badge');
  const presetChips = document.querySelectorAll('.tax-chip');
  const splitToggle = document.getElementById('split-local-tax-toggle');
  const splitDrawer = document.getElementById('split-tax-drawer');
  const stateTaxInput = document.getElementById('state-tax-input');
  const localTaxInput = document.getElementById('local-tax-input');
  const btnApplySplit = document.getElementById('btn-apply-split');
  const btnReset = document.getElementById('btn-reset-tax');
  const btnCopySummary = document.getElementById('btn-copy-summary');
  const copySummaryText = document.getElementById('copy-summary-text');

  // Output elements
  const modeBadgeIndicator = document.getElementById('mode-badge-indicator');
  const kpiNetAmount = document.getElementById('kpi-net-amount');
  const kpiNetSubtext = document.getElementById('kpi-net-subtext');
  const kpiTaxAmount = document.getElementById('kpi-tax-amount');
  const kpiTaxSubtext = document.getElementById('kpi-tax-subtext');
  const kpiGrossAmount = document.getElementById('kpi-gross-amount');
  const kpiGrossSubtext = document.getElementById('kpi-gross-subtext');
  const taxShareLabel = document.getElementById('tax-share-label');
  const barNet = document.getElementById('bar-net');
  const barTax = document.getElementById('bar-tax');
  const legendNetText = document.getElementById('legend-net-text');
  const legendTaxText = document.getElementById('legend-tax-text');

  // Invoice elements
  const invoiceDate = document.getElementById('invoice-date');
  const invValNet = document.getElementById('inv-val-net');
  const invValRate = document.getElementById('inv-val-rate');
  const invValTax = document.getElementById('inv-val-tax');
  const invValGross = document.getElementById('inv-val-gross');
  const rateComparisonTbody = document.getElementById('rate-comparison-tbody');
  const formulaMath = document.getElementById('formula-math');

  // State
  let currentMode = 'add'; // 'add' | 'remove'

  if (invoiceDate) {
    invoiceDate.textContent = `Generated: ${new Date().toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}`;
  }

  function getCurrencySymbol() {
    return currencySelect ? currencySelect.value : '$';
  }

  function formatMoney(amount) {
    const symbol = getCurrencySymbol();
    const formatted = Math.abs(amount).toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
    return amount < 0 ? `-${symbol}${formatted}` : `${symbol}${formatted}`;
  }

  function calculate() {
    const rawAmount = parseFloat(amountInput.value);
    const amount = isNaN(rawAmount) || rawAmount < 0 ? 0 : rawAmount;
    const rawRate = parseFloat(rateInput.value);
    const rate = isNaN(rawRate) || rawRate < 0 ? 0 : rawRate;
    const rateDec = rate / 100;
    const symbol = getCurrencySymbol();

    let net = 0;
    let tax = 0;
    let gross = 0;

    if (currentMode === 'add') {
      // Amount entered is pre-tax (net)
      net = amount;
      tax = net * rateDec;
      gross = net + tax;

      modeBadgeIndicator.textContent = 'Add Tax Mode';
      amountLabel.textContent = 'Net Amount (Before Tax)';
      kpiNetSubtext.textContent = 'Original amount before tax';
      kpiGrossSubtext.textContent = 'Final payable amount';
      formulaMath.textContent = `Gross = Net × (1 + Rate) = ${formatMoney(net)} × (1 + ${rateDec.toFixed(4)}) = ${formatMoney(gross)} (Tax: ${formatMoney(tax)})`;
    } else {
      // Amount entered is gross (tax inclusive)
      gross = amount;
      net = gross / (1 + rateDec);
      tax = gross - net;

      modeBadgeIndicator.textContent = 'Remove / Reverse Tax Mode';
      amountLabel.textContent = 'Gross Amount (Tax Included)';
      kpiNetSubtext.textContent = 'Calculated pre-tax amount';
      kpiGrossSubtext.textContent = 'Original tax-inclusive total';
      formulaMath.textContent = `Net = Gross ÷ (1 + Rate) = ${formatMoney(gross)} ÷ (1 + ${rateDec.toFixed(4)}) = ${formatMoney(net)} (Tax: ${formatMoney(tax)})`;
    }

    // Update KPIs
    kpiNetAmount.textContent = formatMoney(net);
    kpiTaxAmount.textContent = formatMoney(tax);
    kpiGrossAmount.textContent = formatMoney(gross);
    kpiTaxSubtext.textContent = `Based on ${rate.toFixed(2)}% tax rate`;

    // Update Visual Ratio Bar
    const netPercent = gross > 0 ? (net / gross) * 100 : 100;
    const taxPercent = gross > 0 ? (tax / gross) * 100 : 0;
    barNet.style.width = `${netPercent.toFixed(2)}%`;
    barTax.style.width = `${taxPercent.toFixed(2)}%`;
    taxShareLabel.textContent = `Tax is ${taxPercent.toFixed(1)}% of Total Gross`;
    legendNetText.textContent = `Net Amount: ${formatMoney(net)} (${netPercent.toFixed(1)}%)`;
    legendTaxText.textContent = `Tax: ${formatMoney(tax)} (${taxPercent.toFixed(1)}%)`;

    // Update Invoice Card
    invValNet.textContent = formatMoney(net);
    invValRate.textContent = `${rate.toFixed(2)}%`;
    invValTax.textContent = formatMoney(tax);
    invValGross.textContent = formatMoney(gross);

    // Update Rate Comparison Table
    updateComparisonTable(amount, rate, currentMode, symbol);
  }

  function updateComparisonTable(baseAmount, activeRate, mode, symbol) {
    if (!rateComparisonTbody) return;
    const comparisonRates = [0, 5, 7, 8.875, 10, 13, 15, 19, 20, 25];

    let rowsHtml = '';
    comparisonRates.forEach(compRate => {
      const dec = compRate / 100;
      let cNet, cTax, cGross;

      if (mode === 'add') {
        cNet = baseAmount;
        cTax = cNet * dec;
        cGross = cNet + cTax;
      } else {
        cGross = baseAmount;
        cNet = cGross / (1 + dec);
        cTax = cGross - cNet;
      }

      const isCurrent = Math.abs(compRate - activeRate) < 0.01;
      const rowClass = isCurrent ? 'class="active-rate-row"' : '';
      const currentIndicator = isCurrent ? ' <span style="color:var(--accent);font-size:0.75rem;">(Active)</span>' : '';

      rowsHtml += `
        <tr ${rowClass}>
          <td><strong>${compRate}%</strong>${currentIndicator}</td>
          <td>${formatMoney(cNet)}</td>
          <td style="color: #f59e0b;">${formatMoney(cTax)}</td>
          <td><strong>${formatMoney(cGross)}</strong></td>
        </tr>
      `;
    });

    rateComparisonTbody.innerHTML = rowsHtml;
  }

  // Event Listeners for Mode Toggle
  btnModeAdd.addEventListener('click', () => {
    currentMode = 'add';
    btnModeAdd.classList.add('active');
    btnModeRemove.classList.remove('active');
    calculate();
  });

  btnModeRemove.addEventListener('click', () => {
    currentMode = 'remove';
    btnModeRemove.classList.add('active');
    btnModeAdd.classList.remove('active');
    calculate();
  });

  // Currency select
  currencySelect.addEventListener('change', () => {
    currencySymbolAffix.textContent = getCurrencySymbol();
    calculate();
  });

  // Amount input
  amountInput.addEventListener('input', calculate);

  // Rate input & range synchronization
  rateInput.addEventListener('input', () => {
    let val = parseFloat(rateInput.value);
    if (isNaN(val)) val = 0;
    rateBadge.textContent = `${val.toFixed(2)}%`;
    if (val >= 0 && val <= 40) {
      rateRange.value = val;
    }
    // Clear active chips if custom value
    checkActivePreset(val);
    calculate();
  });

  rateRange.addEventListener('input', () => {
    const val = parseFloat(rateRange.value);
    rateInput.value = val.toFixed(2);
    rateBadge.textContent = `${val.toFixed(2)}%`;
    checkActivePreset(val);
    calculate();
  });

  function checkActivePreset(val) {
    presetChips.forEach(chip => {
      const chipRate = parseFloat(chip.dataset.presetRate);
      if (Math.abs(chipRate - val) < 0.01) {
        chip.classList.add('active');
      } else {
        chip.classList.remove('active');
      }
    });
  }

  // Presets
  presetChips.forEach(chip => {
    chip.addEventListener('click', () => {
      const rateVal = parseFloat(chip.dataset.presetRate);
      rateInput.value = rateVal.toFixed(2);
      rateRange.value = Math.min(rateVal, 40);
      rateBadge.textContent = `${rateVal.toFixed(2)}%`;
      presetChips.forEach(c => c.classList.remove('active'));
      chip.classList.add('active');
      calculate();
    });
  });

  // Split State & Local Tax
  splitToggle.addEventListener('change', () => {
    splitDrawer.style.display = splitToggle.checked ? 'block' : 'none';
  });

  function updateSplitButtonText() {
    const s = parseFloat(stateTaxInput.value) || 0;
    const l = parseFloat(localTaxInput.value) || 0;
    btnApplySplit.textContent = `Apply Combined Rate (${(s + l).toFixed(2)}%)`;
  }
  stateTaxInput.addEventListener('input', updateSplitButtonText);
  localTaxInput.addEventListener('input', updateSplitButtonText);

  btnApplySplit.addEventListener('click', () => {
    const s = parseFloat(stateTaxInput.value) || 0;
    const l = parseFloat(localTaxInput.value) || 0;
    const combined = s + l;
    rateInput.value = combined.toFixed(2);
    rateRange.value = Math.min(combined, 40);
    rateBadge.textContent = `${combined.toFixed(2)}%`;
    checkActivePreset(combined);
    calculate();
  });

  // Reset
  btnReset.addEventListener('click', () => {
    currentMode = 'add';
    btnModeAdd.classList.add('active');
    btnModeRemove.classList.remove('active');
    currencySelect.value = '$';
    currencySymbolAffix.textContent = '$';
    amountInput.value = '100.00';
    rateInput.value = '7.00';
    rateRange.value = 7;
    rateBadge.textContent = '7.00%';
    splitToggle.checked = false;
    splitDrawer.style.display = 'none';
    stateTaxInput.value = '4.0';
    localTaxInput.value = '3.0';
    updateSplitButtonText();
    checkActivePreset(7.0);
    calculate();
  });

  // Copy Summary
  btnCopySummary.addEventListener('click', async () => {
    const symbol = getCurrencySymbol();
    const modeName = currentMode === 'add' ? 'Add Sales Tax' : 'Remove / Reverse Tax';
    const summaryText = [
      `=== SALES TAX / VAT SUMMARY ===`,
      `Calculation Mode: ${modeName}`,
      `Pre-Tax (Net) Amount: ${invValNet.textContent}`,
      `Tax Rate: ${invValRate.textContent}`,
      `Sales Tax / VAT: ${invValTax.textContent}`,
      `---------------------------------`,
      `Total Gross Amount: ${invValGross.textContent}`,
      `Generated by ALL IN ONE Sales Tax Calculator`
    ].join('\n');

    try {
      await navigator.clipboard.writeText(summaryText);
      const originalText = copySummaryText.textContent;
      copySummaryText.textContent = 'Copied!';
      btnCopySummary.style.borderColor = 'var(--success)';
      setTimeout(() => {
        copySummaryText.textContent = originalText;
        btnCopySummary.style.borderColor = '';
      }, 2000);
    } catch {
      // Fallback
      const ta = document.createElement('textarea');
      ta.value = summaryText;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
      copySummaryText.textContent = 'Copied!';
      setTimeout(() => {
        copySummaryText.textContent = 'Copy Summary';
      }, 2000);
    }
  });

  // Initial Calculation
  calculate();
});