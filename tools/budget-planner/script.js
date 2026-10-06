// 50/30/20 Monthly Budget Planner Logic
document.addEventListener('DOMContentLoaded', () => {
  // Elements
  const currencySelect = document.getElementById('currency-select');
  const currencySymbolAffix = document.getElementById('currency-symbol-affix');
  const payFrequencySelect = document.getElementById('pay-frequency-select');
  const incomeInput = document.getElementById('income-input');
  const incomeInputLabel = document.getElementById('income-input-label');
  const normalizedMonthlyBadge = document.getElementById('normalized-monthly-badge');

  // Sliders
  const needsSlider = document.getElementById('needs-slider');
  const wantsSlider = document.getElementById('wants-slider');
  const savingsSlider = document.getElementById('savings-slider');
  const needsPctBadge = document.getElementById('needs-pct-badge');
  const wantsPctBadge = document.getElementById('wants-pct-badge');
  const savingsPctBadge = document.getElementById('savings-pct-badge');
  const needsAllocatedAmount = document.getElementById('needs-allocated-amount');
  const wantsAllocatedAmount = document.getElementById('wants-allocated-amount');
  const savingsAllocatedAmount = document.getElementById('savings-allocated-amount');
  const allocationBalanceBadge = document.getElementById('allocation-balance-badge');

  // KPI cards
  const kpiNeedsAmount = document.getElementById('kpi-needs-amount');
  const kpiNeedsSub = document.getElementById('kpi-needs-sub');
  const kpiWantsAmount = document.getElementById('kpi-wants-amount');
  const kpiWantsSub = document.getElementById('kpi-wants-sub');
  const kpiSavingsAmount = document.getElementById('kpi-savings-amount');
  const kpiSavingsSub = document.getElementById('kpi-savings-sub');

  // Donut chart elements
  const donutSliceNeeds = document.getElementById('donut-slice-needs');
  const donutSliceWants = document.getElementById('donut-slice-wants');
  const donutSliceSavings = document.getElementById('donut-slice-savings');
  const donutTotalIncome = document.getElementById('donut-total-income');
  const legendNeedsText = document.getElementById('legend-needs-text');
  const legendWantsText = document.getElementById('legend-wants-text');
  const legendSavingsText = document.getElementById('legend-savings-text');

  // Itemized tracking elements
  const itemizedInputs = document.querySelectorAll('.itemized-exp');
  const needsActualSum = document.getElementById('needs-actual-sum');
  const needsStatusBadge = document.getElementById('needs-status-badge');
  const wantsActualSum = document.getElementById('wants-actual-sum');
  const wantsStatusBadge = document.getElementById('wants-status-badge');
  const savingsActualSum = document.getElementById('savings-actual-sum');
  const savingsStatusBadge = document.getElementById('savings-status-badge');

  // Action buttons
  const btnRebalance = document.getElementById('btn-rebalance-503020');
  const btnResetAll = document.getElementById('btn-reset-all');
  const btnPrint = document.getElementById('btn-print-budget');
  const btnCopy = document.getElementById('btn-copy-budget');
  const copyLabel = document.getElementById('copy-budget-label');

  // Circumference for r=38 circle: 2 * pi * 38 ≈ 238.76104
  const CIRCUMFERENCE = 2 * Math.PI * 38;

  function getCurrencySymbol() {
    return currencySelect ? currencySelect.value : '$';
  }

  function formatMoney(amount) {
    const symbol = getCurrencySymbol();
    const formatted = Math.abs(amount).toLocaleString(undefined, {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2
    });
    return amount < 0 ? `-${symbol}${formatted}` : `${symbol}${formatted}`;
  }

  function getMonthlyIncome() {
    const raw = parseFloat(incomeInput.value);
    const amount = isNaN(raw) || raw < 0 ? 0 : raw;
    const freq = payFrequencySelect.value;

    if (freq === 'biweekly') {
      return (amount * 26) / 12;
    } else if (freq === 'weekly') {
      return (amount * 52) / 12;
    } else if (freq === 'annual') {
      return amount / 12;
    }
    return amount;
  }

  function calculate() {
    const monthlyIncome = getMonthlyIncome();
    const symbol = getCurrencySymbol();

    // Update label & badge
    const freq = payFrequencySelect.value;
    if (freq === 'biweekly') {
      incomeInputLabel.textContent = 'Bi-Weekly Paycheck';
    } else if (freq === 'weekly') {
      incomeInputLabel.textContent = 'Weekly Paycheck';
    } else if (freq === 'annual') {
      incomeInputLabel.textContent = 'Annual Net Salary';
    } else {
      incomeInputLabel.textContent = 'Monthly Take-Home Pay';
    }
    normalizedMonthlyBadge.textContent = `${formatMoney(monthlyIncome)} / month`;

    // Sliders
    const needsPct = parseInt(needsSlider.value, 10) || 0;
    const wantsPct = parseInt(wantsSlider.value, 10) || 0;
    const savingsPct = parseInt(savingsSlider.value, 10) || 0;
    const totalAllocated = needsPct + wantsPct + savingsPct;

    // Badges
    needsPctBadge.textContent = `${needsPct}%`;
    wantsPctBadge.textContent = `${wantsPct}%`;
    savingsPctBadge.textContent = `${savingsPct}%`;

    // Allocations
    const needsTarget = monthlyIncome * (needsPct / 100);
    const wantsTarget = monthlyIncome * (wantsPct / 100);
    const savingsTarget = monthlyIncome * (savingsPct / 100);

    needsAllocatedAmount.textContent = formatMoney(needsTarget);
    wantsAllocatedAmount.textContent = formatMoney(wantsTarget);
    savingsAllocatedAmount.textContent = formatMoney(savingsTarget);

    // Balance status badge
    if (totalAllocated === 100) {
      allocationBalanceBadge.className = 'balance-badge balance-balanced';
      allocationBalanceBadge.textContent = '100% Total (Balanced)';
    } else {
      allocationBalanceBadge.className = 'balance-badge balance-warning';
      const diff = totalAllocated - 100;
      allocationBalanceBadge.textContent = `${totalAllocated}% Total (${diff > 0 ? `+${diff}% Over` : `${diff}% Under`})`;
    }

    // Update KPIs
    kpiNeedsAmount.textContent = formatMoney(needsTarget);
    kpiNeedsSub.textContent = `${needsPct}% of monthly income`;

    kpiWantsAmount.textContent = formatMoney(wantsTarget);
    kpiWantsSub.textContent = `${wantsPct}% of monthly income`;

    kpiSavingsAmount.textContent = formatMoney(savingsTarget);
    kpiSavingsSub.textContent = `${savingsPct}% of monthly income`;

    // Update SVG Donut Chart
    updateDonutChart(needsPct, wantsPct, savingsPct, monthlyIncome);

    // Update Itemized Expenses
    updateItemizedExpenses(needsTarget, wantsTarget, savingsTarget);
  }

  function updateDonutChart(needsPct, wantsPct, savingsPct, income) {
    donutTotalIncome.textContent = formatMoney(income);

    const safeTotal = (needsPct + wantsPct + savingsPct) || 1;
    // Normalize to 100% for the visual donut if not 100
    const nRatio = needsPct / safeTotal;
    const wRatio = wantsPct / safeTotal;
    const sRatio = savingsPct / safeTotal;

    const nLen = nRatio * CIRCUMFERENCE;
    const wLen = wRatio * CIRCUMFERENCE;
    const sLen = sRatio * CIRCUMFERENCE;

    // Needs starts at 0
    donutSliceNeeds.setAttribute('stroke-dasharray', `${nLen} ${CIRCUMFERENCE}`);
    donutSliceNeeds.setAttribute('stroke-dashoffset', '0');

    // Wants starts after needs
    donutSliceWants.setAttribute('stroke-dasharray', `${wLen} ${CIRCUMFERENCE}`);
    donutSliceWants.setAttribute('stroke-dashoffset', `-${nLen}`);

    // Savings starts after needs + wants
    donutSliceSavings.setAttribute('stroke-dasharray', `${sLen} ${CIRCUMFERENCE}`);
    donutSliceSavings.setAttribute('stroke-dashoffset', `-${nLen + wLen}`);

    // Update Legends
    const nTarget = income * (needsPct / 100);
    const wTarget = income * (wantsPct / 100);
    const sTarget = income * (savingsPct / 100);

    legendNeedsText.textContent = `Needs: ${needsPct}% (${formatMoney(nTarget)})`;
    legendWantsText.textContent = `Wants: ${wantsPct}% (${formatMoney(wTarget)})`;
    legendSavingsText.textContent = `Savings: ${savingsPct}% (${formatMoney(sTarget)})`;
  }

  function sumGroup(className) {
    let sum = 0;
    document.querySelectorAll(`.${className}`).forEach(input => {
      const val = parseFloat(input.value);
      if (!isNaN(val) && val > 0) sum += val;
    });
    return sum;
  }

  function updateItemizedExpenses(needsTarget, wantsTarget, savingsTarget) {
    const actualNeeds = sumGroup('exp-needs');
    const actualWants = sumGroup('exp-wants');
    const actualSavings = sumGroup('exp-savings');

    // Needs
    needsActualSum.textContent = `${formatMoney(actualNeeds)} / ${formatMoney(needsTarget)}`;
    applyStatusBadge(needsStatusBadge, actualNeeds, needsTarget);

    // Wants
    wantsActualSum.textContent = `${formatMoney(actualWants)} / ${formatMoney(wantsTarget)}`;
    applyStatusBadge(wantsStatusBadge, actualWants, wantsTarget);

    // Savings
    savingsActualSum.textContent = `${formatMoney(actualSavings)} / ${formatMoney(savingsTarget)}`;
    applyStatusBadge(savingsStatusBadge, actualSavings, savingsTarget, true);
  }

  function applyStatusBadge(badgeElem, actual, target, isSavings = false) {
    if (actual === 0 && target === 0) {
      badgeElem.className = 'badge';
      badgeElem.textContent = 'Zero';
      return;
    }
    const diff = actual - target;

    if (isSavings) {
      // For savings, higher actual than target is great!
      if (diff >= 0) {
        badgeElem.className = 'badge';
        badgeElem.style.background = 'rgba(16, 185, 129, 0.2)';
        badgeElem.style.color = '#10b981';
        badgeElem.textContent = diff === 0 ? 'Target Reached' : `+${formatMoney(diff)} Ahead`;
      } else {
        badgeElem.className = 'badge';
        badgeElem.style.background = 'rgba(239, 68, 68, 0.2)';
        badgeElem.style.color = '#ef4444';
        badgeElem.textContent = `${formatMoney(Math.abs(diff))} Short`;
      }
    } else {
      // For expenses (needs/wants), lower or equal is good
      if (diff <= 0) {
        badgeElem.className = 'badge';
        badgeElem.style.background = 'rgba(16, 185, 129, 0.2)';
        badgeElem.style.color = '#10b981';
        badgeElem.textContent = diff === 0 ? 'Exact Budget' : `${formatMoney(Math.abs(diff))} Left`;
      } else {
        badgeElem.className = 'badge';
        badgeElem.style.background = 'rgba(239, 68, 68, 0.2)';
        badgeElem.style.color = '#ef4444';
        badgeElem.textContent = `+${formatMoney(diff)} Over`;
      }
    }
  }

  // Event Listeners
  currencySelect.addEventListener('change', () => {
    currencySymbolAffix.textContent = getCurrencySymbol();
    calculate();
  });

  payFrequencySelect.addEventListener('change', calculate);
  incomeInput.addEventListener('input', calculate);

  // Sliders
  needsSlider.addEventListener('input', calculate);
  wantsSlider.addEventListener('input', calculate);
  savingsSlider.addEventListener('input', calculate);

  // Itemized inputs
  itemizedInputs.forEach(input => {
    input.addEventListener('input', calculate);
  });

  // Action Buttons
  btnRebalance.addEventListener('click', () => {
    needsSlider.value = 50;
    wantsSlider.value = 30;
    savingsSlider.value = 20;
    calculate();
  });

  btnResetAll.addEventListener('click', () => {
    currencySelect.value = '$';
    currencySymbolAffix.textContent = '$';
    payFrequencySelect.value = 'monthly';
    incomeInput.value = '4500';
    needsSlider.value = 50;
    wantsSlider.value = 30;
    savingsSlider.value = 20;

    // Reset itemized defaults
    const defaults = {
      'exp-rent': '1200',
      'exp-groceries': '450',
      'exp-utilities': '180',
      'exp-transport': '120',
      'exp-dining': '350',
      'exp-entertainment': '200',
      'exp-shopping': '150',
      'exp-subs': '80',
      'exp-emergency': '400',
      'exp-invest': '300',
      'exp-debt': '100'
    };
    for (const [id, val] of Object.entries(defaults)) {
      const el = document.getElementById(id);
      if (el) el.value = val;
    }
    calculate();
  });

  btnPrint.addEventListener('click', () => {
    window.print();
  });

  btnCopy.addEventListener('click', async () => {
    const monthlyIncome = getMonthlyIncome();
    const needsPct = needsSlider.value;
    const wantsPct = wantsSlider.value;
    const savingsPct = savingsSlider.value;

    const summary = [
      `=== 50/30/20 MONTHLY BUDGET PLAN ===`,
      `Monthly Take-Home Income: ${formatMoney(monthlyIncome)}`,
      `------------------------------------`,
      `Needs (${needsPct}%): ${kpiNeedsAmount.textContent} (Actual: ${needsActualSum.textContent.split('/')[0].trim()})`,
      `Wants (${wantsPct}%): ${kpiWantsAmount.textContent} (Actual: ${wantsActualSum.textContent.split('/')[0].trim()})`,
      `Savings (${savingsPct}%): ${kpiSavingsAmount.textContent} (Actual: ${savingsActualSum.textContent.split('/')[0].trim()})`,
      `------------------------------------`,
      `Generated by ALL IN ONE Budget Planner`
    ].join('\n');

    try {
      await navigator.clipboard.writeText(summary);
      const orig = copyLabel.textContent;
      copyLabel.textContent = 'Copied!';
      btnCopy.style.borderColor = 'var(--success)';
      setTimeout(() => {
        copyLabel.textContent = orig;
        btnCopy.style.borderColor = '';
      }, 2000);
    } catch {
      const ta = document.createElement('textarea');
      ta.value = summary;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
      copyLabel.textContent = 'Copied!';
      setTimeout(() => {
        copyLabel.textContent = 'Copy';
      }, 2000);
    }
  });

  // Initial calculation
  calculate();
});