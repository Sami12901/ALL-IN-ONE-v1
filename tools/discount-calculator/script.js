// Discount & Sale Savings Calculator Logic
document.addEventListener('DOMContentLoaded', () => {
  // Elements
  const currencySelect = document.getElementById('currency-select');
  const currencySymbolAffix = document.getElementById('currency-symbol-affix');
  const originalPriceInput = document.getElementById('original-price-input');
  const discountInput = document.getElementById('discount-percent-input');
  const discountRange = document.getElementById('discount-percent-range');
  const discountBadge = document.getElementById('discount-badge');
  const pillBtns = document.querySelectorAll('.pill-btn');
  const quantityInput = document.getElementById('quantity-input');
  const qtyBadge = document.getElementById('qty-badge');
  const couponToggle = document.getElementById('coupon-toggle');
  const couponDrawer = document.getElementById('coupon-drawer');
  const couponPercentInput = document.getElementById('coupon-percent-input');
  const stackModeSelect = document.getElementById('stack-mode-select');
  const btnReset = document.getElementById('btn-reset-discount');
  const btnCopyDeal = document.getElementById('btn-copy-deal');
  const copyDealText = document.getElementById('copy-deal-text');

  // Outputs
  const effectiveRateBadge = document.getElementById('effective-rate-badge');
  const kpiFinalPrice = document.getElementById('kpi-final-price');
  const kpiFinalSubtext = document.getElementById('kpi-final-subtext');
  const kpiTotalSavings = document.getElementById('kpi-total-savings');
  const kpiSavingsSubtext = document.getElementById('kpi-savings-subtext');
  const kpiEffectiveRate = document.getElementById('kpi-effective-rate');
  const kpiRateSubtext = document.getElementById('kpi-rate-subtext');

  // Visual Bar
  const payRatioText = document.getElementById('pay-ratio-text');
  const barPay = document.getElementById('bar-pay');
  const barSave = document.getElementById('bar-save');
  const legendPayText = document.getElementById('legend-pay-text');
  const legendSaveText = document.getElementById('legend-save-text');

  // Summary Card
  const dealTimestamp = document.getElementById('deal-timestamp');
  const summaryOriginalPrice = document.getElementById('summary-original-price');
  const summaryPrimaryDiscount = document.getElementById('summary-primary-discount');
  const summaryCouponRow = document.getElementById('summary-coupon-row');
  const summaryCouponDiscount = document.getElementById('summary-coupon-discount');
  const summaryQtyRow = document.getElementById('summary-qty-row');
  const summaryQtyVal = document.getElementById('summary-qty-val');
  const summaryFinalPrice = document.getElementById('summary-final-price');
  const discountComparisonTbody = document.getElementById('discount-comparison-tbody');

  if (dealTimestamp) {
    dealTimestamp.textContent = `Calculated on ${new Date().toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}`;
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
    const rawPrice = parseFloat(originalPriceInput.value);
    const unitPrice = isNaN(rawPrice) || rawPrice < 0 ? 0 : rawPrice;

    const rawDiscount = parseFloat(discountInput.value);
    const discount1 = isNaN(rawDiscount) || rawDiscount < 0 ? 0 : Math.min(100, rawDiscount);

    const rawQty = parseInt(quantityInput.value, 10);
    const qty = isNaN(rawQty) || rawQty < 1 ? 1 : rawQty;
    qtyBadge.textContent = qty === 1 ? '1 Item' : `${qty} Items`;

    const hasCoupon = couponToggle.checked;
    const rawCoupon = parseFloat(couponPercentInput.value);
    const couponVal = hasCoupon && !isNaN(rawCoupon) && rawCoupon > 0 ? Math.min(100, rawCoupon) : 0;
    const stackMode = stackModeSelect.value; // 'compound' | 'additive'

    // Compute effective discount
    let effectiveRate = 0;
    let unitFinalPrice = 0;
    let primaryUnitSavings = unitPrice * (discount1 / 100);
    let promoUnitSavings = 0;

    if (!hasCoupon || couponVal === 0) {
      effectiveRate = discount1;
      unitFinalPrice = unitPrice - primaryUnitSavings;
    } else {
      if (stackMode === 'compound') {
        const afterPrimary = unitPrice - primaryUnitSavings;
        promoUnitSavings = afterPrimary * (couponVal / 100);
        unitFinalPrice = Math.max(0, afterPrimary - promoUnitSavings);
        effectiveRate = unitPrice > 0 ? ((unitPrice - unitFinalPrice) / unitPrice) * 100 : 0;
      } else {
        // Additive
        effectiveRate = Math.min(100, discount1 + couponVal);
        unitFinalPrice = Math.max(0, unitPrice * (1 - effectiveRate / 100));
        promoUnitSavings = (unitPrice * (effectiveRate / 100)) - primaryUnitSavings;
      }
    }

    const totalOriginal = unitPrice * qty;
    const totalFinal = unitFinalPrice * qty;
    const totalSavings = totalOriginal - totalFinal;

    // Update KPIs
    kpiFinalPrice.textContent = formatMoney(totalFinal);
    kpiFinalSubtext.textContent = qty > 1 ? `${formatMoney(unitFinalPrice)} each × ${qty} units` : 'You pay this total';

    kpiTotalSavings.textContent = formatMoney(totalSavings);
    kpiSavingsSubtext.textContent = qty > 1 ? `${formatMoney(unitPrice - unitFinalPrice)} per item` : 'Cash kept in pocket';

    kpiEffectiveRate.textContent = `${effectiveRate.toFixed(1)}%`;
    kpiRateSubtext.textContent = hasCoupon ? `Stacked ${discount1}% + ${couponVal}% promo` : 'Total list price discount';
    effectiveRateBadge.textContent = `${effectiveRate.toFixed(1)}% Effective Savings`;

    // Visual Savings Bar
    const payPercent = totalOriginal > 0 ? (totalFinal / totalOriginal) * 100 : 100;
    const savePercent = totalOriginal > 0 ? (totalSavings / totalOriginal) * 100 : 0;

    barPay.style.width = `${payPercent.toFixed(2)}%`;
    barSave.style.width = `${savePercent.toFixed(2)}%`;
    payRatioText.textContent = `You pay ${payPercent.toFixed(1)}% of original list price`;

    legendPayText.textContent = `You Pay: ${formatMoney(totalFinal)} (${payPercent.toFixed(1)}%)`;
    legendSaveText.textContent = `You Save: ${formatMoney(totalSavings)} (${savePercent.toFixed(1)}%)`;

    // Update Deal Summary Receipt
    summaryOriginalPrice.textContent = formatMoney(totalOriginal);
    summaryPrimaryDiscount.textContent = `${discount1}% (-${formatMoney(primaryUnitSavings * qty)})`;

    if (hasCoupon && couponVal > 0) {
      summaryCouponRow.style.display = 'flex';
      summaryCouponDiscount.textContent = `${couponVal}% extra (-${formatMoney(promoUnitSavings * qty)})`;
    } else {
      summaryCouponRow.style.display = 'none';
    }

    if (qty > 1) {
      summaryQtyRow.style.display = 'flex';
      summaryQtyVal.textContent = `${qty} units @ ${formatMoney(unitFinalPrice)} / ea`;
    } else {
      summaryQtyRow.style.display = 'none';
    }

    summaryFinalPrice.textContent = formatMoney(totalFinal);

    // Update Quick Comparison Table
    updateComparisonTable(unitPrice, discount1, qty);
  }

  function updateComparisonTable(baseUnitPrice, activeDiscount, qty) {
    if (!discountComparisonTbody) return;
    const brackets = [10, 15, 20, 25, 30, 40, 50, 60, 70, 80];

    let rowsHtml = '';
    brackets.forEach(pct => {
      const perUnitSavings = baseUnitPrice * (pct / 100);
      const perUnitPay = baseUnitPrice - perUnitSavings;
      const totalPay = perUnitPay * qty;
      const totalSaved = perUnitSavings * qty;

      const isCurrent = Math.abs(pct - activeDiscount) < 0.01;
      const rowClass = isCurrent ? 'class="active-discount-row"' : '';
      const currentLabel = isCurrent ? ' <span style="color:var(--accent);font-size:0.75rem;">(Active)</span>' : '';

      rowsHtml += `
        <tr ${rowClass}>
          <td><strong>${pct}% OFF</strong>${currentLabel}</td>
          <td>${formatMoney(totalPay)}</td>
          <td style="color: #10b981;">${formatMoney(totalSaved)}</td>
          <td>${pct}%</td>
        </tr>
      `;
    });

    discountComparisonTbody.innerHTML = rowsHtml;
  }

  function checkActivePill(val) {
    pillBtns.forEach(pill => {
      const p = parseFloat(pill.dataset.percent);
      if (Math.abs(p - val) < 0.01) {
        pill.classList.add('active');
      } else {
        pill.classList.remove('active');
      }
    });
  }

  // Event Listeners
  currencySelect.addEventListener('change', () => {
    currencySymbolAffix.textContent = getCurrencySymbol();
    calculate();
  });

  originalPriceInput.addEventListener('input', calculate);

  discountInput.addEventListener('input', () => {
    let val = parseFloat(discountInput.value);
    if (isNaN(val)) val = 0;
    discountBadge.textContent = `${val.toFixed(0)}% OFF`;
    if (val >= 0 && val <= 100) {
      discountRange.value = val;
    }
    checkActivePill(val);
    calculate();
  });

  discountRange.addEventListener('input', () => {
    const val = parseFloat(discountRange.value);
    discountInput.value = val;
    discountBadge.textContent = `${val.toFixed(0)}% OFF`;
    checkActivePill(val);
    calculate();
  });

  pillBtns.forEach(pill => {
    pill.addEventListener('click', () => {
      const p = parseFloat(pill.dataset.percent);
      discountInput.value = p;
      discountRange.value = p;
      discountBadge.textContent = `${p}% OFF`;
      pillBtns.forEach(b => b.classList.remove('active'));
      pill.classList.add('active');
      calculate();
    });
  });

  quantityInput.addEventListener('input', calculate);

  couponToggle.addEventListener('change', () => {
    couponDrawer.style.display = couponToggle.checked ? 'block' : 'none';
    calculate();
  });

  couponPercentInput.addEventListener('input', calculate);
  stackModeSelect.addEventListener('change', calculate);

  // Reset
  btnReset.addEventListener('click', () => {
    currencySelect.value = '$';
    currencySymbolAffix.textContent = '$';
    originalPriceInput.value = '80.00';
    discountInput.value = '25';
    discountRange.value = '25';
    discountBadge.textContent = '25% OFF';
    quantityInput.value = '1';
    couponToggle.checked = false;
    couponDrawer.style.display = 'none';
    couponPercentInput.value = '10';
    stackModeSelect.value = 'compound';
    checkActivePill(25);
    calculate();
  });

  // Copy Deal Summary
  btnCopyDeal.addEventListener('click', async () => {
    const summaryText = [
      `=== DISCOUNT & SAVINGS SUMMARY ===`,
      `Original List Price: ${summaryOriginalPrice.textContent}`,
      `Primary Discount: ${summaryPrimaryDiscount.textContent}`,
      couponToggle.checked ? `Additional Promo: ${summaryCouponDiscount.textContent}` : null,
      parseInt(quantityInput.value, 10) > 1 ? `Quantity: ${quantityInput.value} units` : null,
      `Effective Discount: ${kpiEffectiveRate.textContent}`,
      `Total Dollars Saved: ${kpiTotalSavings.textContent}`,
      `---------------------------------`,
      `Final You Pay Price: ${summaryFinalPrice.textContent}`,
      `Generated by ALL IN ONE Discount Calculator`
    ].filter(Boolean).join('\n');

    try {
      await navigator.clipboard.writeText(summaryText);
      const orig = copyDealText.textContent;
      copyDealText.textContent = 'Copied!';
      btnCopyDeal.style.borderColor = 'var(--success)';
      setTimeout(() => {
        copyDealText.textContent = orig;
        btnCopyDeal.style.borderColor = '';
      }, 2000);
    } catch {
      const ta = document.createElement('textarea');
      ta.value = summaryText;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
      copyDealText.textContent = 'Copied!';
      setTimeout(() => {
        copyDealText.textContent = 'Copy Summary';
      }, 2000);
    }
  });

  // Initial Run
  calculate();
});