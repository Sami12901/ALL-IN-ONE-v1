// Tip Calculator & Bill Splitter Logic
document.addEventListener('DOMContentLoaded', () => {
  // Elements
  const currencySelect = document.getElementById('currency-select');
  const currencySymbolAffix = document.getElementById('currency-symbol-affix');
  const billTotalInput = document.getElementById('bill-total-input');
  const tipInput = document.getElementById('tip-percent-input');
  const tipRange = document.getElementById('tip-percent-range');
  const tipBadge = document.getElementById('tip-badge');
  const tipChips = document.querySelectorAll('.tip-chip');
  const splitInput = document.getElementById('split-count-input');
  const splitBadge = document.getElementById('split-badge');
  const btnSplitDec = document.getElementById('btn-split-dec');
  const btnSplitInc = document.getElementById('btn-split-inc');
  const roundBtns = document.querySelectorAll('.round-btn');
  const btnReset = document.getElementById('btn-reset-tip');
  const btnCopyReceipt = document.getElementById('btn-copy-receipt');
  const copyReceiptText = document.getElementById('copy-receipt-text');

  // Outputs
  const partySummaryBadge = document.getElementById('party-summary-badge');
  const kpiTipAmount = document.getElementById('kpi-tip-amount');
  const kpiTipSubtext = document.getElementById('kpi-tip-subtext');
  const kpiGrandTotal = document.getElementById('kpi-grand-total');
  const kpiGrandSubtext = document.getElementById('kpi-grand-subtext');
  const kpiTipPerPerson = document.getElementById('kpi-tip-per-person');
  const kpiPpTipSubtext = document.getElementById('kpi-pp-tip-subtext');
  const kpiTotalPerPerson = document.getElementById('kpi-total-per-person');
  const kpiPpTotalSubtext = document.getElementById('kpi-pp-total-subtext');

  // Receipt Card
  const receiptDateLabel = document.getElementById('receipt-date-label');
  const recSubtotal = document.getElementById('rec-subtotal');
  const recTipLabel = document.getElementById('rec-tip-label');
  const recTipVal = document.getElementById('rec-tip-val');
  const recGrandTotal = document.getElementById('rec-grand-total');
  const recSplitHeading = document.getElementById('rec-split-heading');
  const recSplitSub = document.getElementById('rec-split-sub');
  const recSplitAmount = document.getElementById('rec-split-amount');
  const tipMatrixTbody = document.getElementById('tip-matrix-tbody');

  let roundMode = 'none'; // 'none' | 'total' | 'person'

  if (receiptDateLabel) {
    receiptDateLabel.textContent = `Date: ${new Date().toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })} • ${new Date().toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}`;
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
    const rawBill = parseFloat(billTotalInput.value);
    const subtotal = isNaN(rawBill) || rawBill < 0 ? 0 : rawBill;

    const rawTip = parseFloat(tipInput.value);
    const tipPercent = isNaN(rawTip) || rawTip < 0 ? 0 : rawTip;

    let guests = parseInt(splitInput.value, 10);
    if (isNaN(guests) || guests < 1) guests = 1;
    splitBadge.textContent = guests === 1 ? '1 Person' : `${guests} People`;
    partySummaryBadge.textContent = guests === 1 ? '1 Person Paying' : `${guests} People Splitting`;

    // Base math
    let tipAmount = subtotal * (tipPercent / 100);
    let grandTotal = subtotal + tipAmount;
    let tipPerPerson = tipAmount / guests;
    let totalPerPerson = grandTotal / guests;

    // Apply Rounding
    if (roundMode === 'total' && grandTotal > 0) {
      const roundedTotal = Math.ceil(grandTotal);
      tipAmount = Math.max(0, roundedTotal - subtotal);
      grandTotal = roundedTotal;
      tipPerPerson = tipAmount / guests;
      totalPerPerson = grandTotal / guests;
    } else if (roundMode === 'person' && totalPerPerson > 0) {
      const roundedPerPerson = Math.ceil(totalPerPerson);
      totalPerPerson = roundedPerPerson;
      grandTotal = totalPerPerson * guests;
      tipAmount = Math.max(0, grandTotal - subtotal);
      tipPerPerson = tipAmount / guests;
    }

    // Effective tip percentage
    const effectiveTipPct = subtotal > 0 ? (tipAmount / subtotal) * 100 : tipPercent;

    // Update KPI Cards
    kpiTipAmount.textContent = formatMoney(tipAmount);
    kpiTipSubtext.textContent = roundMode !== 'none'
      ? `${effectiveTipPct.toFixed(1)}% Effective Gratuity`
      : `${tipPercent}% Gratuity`;

    kpiGrandTotal.textContent = formatMoney(grandTotal);
    kpiGrandSubtext.textContent = `Bill + Gratuity`;

    kpiTipPerPerson.textContent = formatMoney(tipPerPerson);
    kpiPpTipSubtext.textContent = guests === 1 ? 'Solo diner gratuity' : `Tip share for each guest`;

    kpiTotalPerPerson.textContent = formatMoney(totalPerPerson);
    kpiPpTotalSubtext.textContent = guests === 1 ? 'Total amount due' : `Each of ${guests} guests pays`;

    // Update Receipt Card
    recSubtotal.textContent = formatMoney(subtotal);
    recTipLabel.textContent = `Gratuity (${tipPercent}%${roundMode !== 'none' ? ' rounded' : ''}):`;
    recTipVal.textContent = formatMoney(tipAmount);
    recGrandTotal.textContent = formatMoney(grandTotal);

    recSplitHeading.textContent = guests === 1 ? 'Total Bill' : `Split Between ${guests} Guests`;
    recSplitSub.textContent = guests === 1 ? 'Single payment' : `Includes ${formatMoney(tipPerPerson)} tip share`;
    recSplitAmount.textContent = `${formatMoney(totalPerPerson)} / ea`;

    // Matrix
    updateMatrix(subtotal, guests, tipPercent);
  }

  function updateMatrix(subtotal, guests, activeTip) {
    if (!tipMatrixTbody) return;
    const rates = [10, 12, 15, 18, 20, 22, 25, 30];

    let html = '';
    rates.forEach(rate => {
      let tip = subtotal * (rate / 100);
      let total = subtotal + tip;
      let pp = total / guests;

      if (roundMode === 'total' && total > 0) {
        total = Math.ceil(total);
        tip = Math.max(0, total - subtotal);
        pp = total / guests;
      } else if (roundMode === 'person' && pp > 0) {
        pp = Math.ceil(pp);
        total = pp * guests;
        tip = Math.max(0, total - subtotal);
      }

      const isCurrent = Math.abs(rate - activeTip) < 0.01;
      const rowClass = isCurrent ? 'class="row-be"' : '';
      const activeLabel = isCurrent ? ' <span style="color:var(--accent);font-size:0.75rem;">(Active)</span>' : '';

      html += `
        <tr ${rowClass}>
          <td><strong>${rate}%</strong>${activeLabel}</td>
          <td style="color: #f59e0b;">${formatMoney(tip)}</td>
          <td><strong>${formatMoney(total)}</strong></td>
          <td style="color: #10b981;">${formatMoney(pp)}</td>
        </tr>
      `;
    });

    tipMatrixTbody.innerHTML = html;
  }

  function getRatingLabel(val) {
    if (val >= 25) return 'VIP / Exceptional';
    if (val >= 20) return 'Superb';
    if (val >= 18) return 'Great';
    if (val >= 15) return 'Good';
    if (val >= 10) return 'Fair';
    return 'Custom';
  }

  function checkActiveChip(val) {
    tipChips.forEach(chip => {
      const tipVal = parseFloat(chip.dataset.tip);
      if (Math.abs(tipVal - val) < 0.01) {
        chip.classList.add('active');
      } else {
        chip.classList.remove('active');
      }
    });
  }

  // Event Listeners
  currencySelect.addEventListener('change', () => {
    currencySymbolAffix.textContent = getCurrencySymbol();
    calculate();
  });

  billTotalInput.addEventListener('input', calculate);

  tipInput.addEventListener('input', () => {
    let val = parseFloat(tipInput.value);
    if (isNaN(val)) val = 0;
    tipBadge.textContent = `${val}% (${getRatingLabel(val)})`;
    if (val >= 0 && val <= 50) {
      tipRange.value = val;
    }
    checkActiveChip(val);
    calculate();
  });

  tipRange.addEventListener('input', () => {
    const val = parseFloat(tipRange.value);
    tipInput.value = val;
    tipBadge.textContent = `${val}% (${getRatingLabel(val)})`;
    checkActiveChip(val);
    calculate();
  });

  tipChips.forEach(chip => {
    chip.addEventListener('click', () => {
      const val = parseFloat(chip.dataset.tip);
      tipInput.value = val;
      tipRange.value = Math.min(val, 50);
      tipBadge.textContent = `${val}% (${chip.dataset.label})`;
      tipChips.forEach(c => c.classList.remove('active'));
      chip.classList.add('active');
      calculate();
    });
  });

  // Stepper
  btnSplitDec.addEventListener('click', () => {
    let guests = parseInt(splitInput.value, 10) || 1;
    if (guests > 1) {
      splitInput.value = guests - 1;
      calculate();
    }
  });

  btnSplitInc.addEventListener('click', () => {
    let guests = parseInt(splitInput.value, 10) || 1;
    splitInput.value = guests + 1;
    calculate();
  });

  splitInput.addEventListener('input', calculate);

  // Rounding modes
  roundBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      roundBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      roundMode = btn.dataset.round;
      calculate();
    });
  });

  // Reset
  btnReset.addEventListener('click', () => {
    currencySelect.value = '$';
    currencySymbolAffix.textContent = '$';
    billTotalInput.value = '75.00';
    tipInput.value = '18';
    tipRange.value = 18;
    tipBadge.textContent = '18% (Great)';
    splitInput.value = '1';
    roundMode = 'none';
    roundBtns.forEach(b => b.classList.remove('active'));
    document.querySelector('.round-btn[data-round="none"]').classList.add('active');
    checkActiveChip(18);
    calculate();
  });

  // Copy Receipt Summary
  btnCopyReceipt.addEventListener('click', async () => {
    const guests = parseInt(splitInput.value, 10) || 1;
    const summaryLines = [
      `=== DINING RECEIPT SUMMARY ===`,
      `Bill Subtotal: ${recSubtotal.textContent}`,
      `Gratuity (${tipInput.value}%): ${recTipVal.textContent}`,
      `Grand Total: ${recGrandTotal.textContent}`,
      guests > 1 ? `Guests Splitting: ${guests}` : null,
      guests > 1 ? `Each Guest Pays: ${recSplitAmount.textContent}` : null,
      roundMode !== 'none' ? `Rounding: ${roundMode === 'total' ? 'Nearest Dollar Total' : 'Nearest Dollar Per Person'}` : null,
      `------------------------------`,
      `Generated by ALL IN ONE Tip Calculator`
    ].filter(Boolean).join('\n');

    try {
      await navigator.clipboard.writeText(summaryLines);
      const orig = copyReceiptText.textContent;
      copyReceiptText.textContent = 'Copied!';
      btnCopyReceipt.style.borderColor = 'var(--success)';
      setTimeout(() => {
        copyReceiptText.textContent = orig;
        btnCopyReceipt.style.borderColor = '';
      }, 2000);
    } catch {
      const ta = document.createElement('textarea');
      ta.value = summaryLines;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
      copyReceiptText.textContent = 'Copied!';
      setTimeout(() => {
        copyReceiptText.textContent = 'Copy Receipt Summary';
      }, 2000);
    }
  });

  // Initial Run
  calculate();
});