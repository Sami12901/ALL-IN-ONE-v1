// Wage Converter - Multi-frequency salary & wage calculator
document.addEventListener('DOMContentLoaded', () => {
  // DOM Elements
  const currencySelect = document.getElementById('currency-select');
  const wageAmountInput = document.getElementById('wage-amount');
  const frequencySelect = document.getElementById('frequency-select');
  
  const hoursSlider = document.getElementById('hours-per-week');
  const hoursVal = document.getElementById('hours-val');
  const daysSlider = document.getElementById('days-per-week');
  const daysVal = document.getElementById('days-val');
  
  const vacationSlider = document.getElementById('vacation-weeks');
  const vacationVal = document.getElementById('vacation-val');
  const vacationPaidBtn = document.getElementById('vacation-paid-btn');
  const vacationUnpaidBtn = document.getElementById('vacation-unpaid-btn');
  
  const enableOtCheck = document.getElementById('enable-ot');
  const otStatusBadge = document.getElementById('ot-status-badge');
  const otControls = document.getElementById('ot-controls');
  const otHoursSlider = document.getElementById('ot-hours');
  const otHoursVal = document.getElementById('ot-hours-val');
  const otMultiplierSelect = document.getElementById('ot-multiplier');
  const otSummaryBox = document.getElementById('ot-summary-box');
  
  // KPI Elements
  const kpiHourly = document.getElementById('kpi-hourly');
  const kpiHourlySub = document.getElementById('kpi-hourly-sub');
  const kpiWeekly = document.getElementById('kpi-weekly');
  const kpiWeeklySub = document.getElementById('kpi-weekly-sub');
  const kpiMonthly = document.getElementById('kpi-monthly');
  const kpiMonthlySub = document.getElementById('kpi-monthly-sub');
  const kpiAnnual = document.getElementById('kpi-annual');
  const kpiAnnualSub = document.getElementById('kpi-annual-sub');
  
  // OT Summary elements
  const otRegularWeekly = document.getElementById('ot-regular-weekly');
  const otRateDisplay = document.getElementById('ot-rate-display');
  const otWeeklyEarnings = document.getElementById('ot-weekly-earnings');
  const otAnnualTotal = document.getElementById('ot-annual-total');
  
  const wageTableBody = document.getElementById('wage-table-body');
  const thAdjusted = document.getElementById('th-adjusted');
  const copySummaryBtn = document.getElementById('copy-summary-btn');
  const presetChips = document.querySelectorAll('.preset-chip');

  let vacationType = 'paid'; // 'paid' or 'unpaid'

  // Format currency helper
  function formatMoney(amount, currency = '$') {
    if (isNaN(amount) || !isFinite(amount)) return `${currency}0.00`;
    return `${currency}${Number(amount).toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    })}`;
  }

  // Update slider displays
  function updateSliderLabels() {
    if (hoursVal && hoursSlider) hoursVal.textContent = `${hoursSlider.value} hrs`;
    if (daysVal && daysSlider) daysVal.textContent = `${daysSlider.value} days`;
    if (vacationVal && vacationSlider) vacationVal.textContent = `${vacationSlider.value} wks`;
    if (otHoursVal && otHoursSlider) otHoursVal.textContent = `${otHoursSlider.value} hrs`;
  }

  // Main Calculation Function
  function calculateWages() {
    const rawAmount = parseFloat(wageAmountInput.value) || 0;
    const frequency = frequencySelect.value;
    const currency = currencySelect.value || '$';
    const hoursPerWeek = parseFloat(hoursSlider.value) || 40;
    const daysPerWeek = parseFloat(daysSlider.value) || 5;
    const vacationWeeks = parseFloat(vacationSlider.value) || 0;
    const isOtEnabled = enableOtCheck.checked;
    const otHours = parseFloat(otHoursSlider.value) || 0;
    const otMultiplier = parseFloat(otMultiplierSelect.value) || 1.5;

    const hoursPerDay = daysPerWeek > 0 ? (hoursPerWeek / daysPerWeek) : 8;

    // 1. Calculate Standard Hourly Base
    let standardHourly = 0;
    switch (frequency) {
      case 'hourly':
        standardHourly = rawAmount;
        break;
      case 'daily':
        standardHourly = hoursPerDay > 0 ? rawAmount / hoursPerDay : 0;
        break;
      case 'weekly':
        standardHourly = hoursPerWeek > 0 ? rawAmount / hoursPerWeek : 0;
        break;
      case 'biweekly':
        standardHourly = (hoursPerWeek * 2) > 0 ? rawAmount / (hoursPerWeek * 2) : 0;
        break;
      case 'semimonthly':
        // 24 periods per year
        standardHourly = (hoursPerWeek * 52) > 0 ? (rawAmount * 24) / (hoursPerWeek * 52) : 0;
        break;
      case 'monthly':
        // 12 periods per year
        standardHourly = (hoursPerWeek * 52) > 0 ? (rawAmount * 12) / (hoursPerWeek * 52) : 0;
        break;
      case 'annually':
        standardHourly = (hoursPerWeek * 52) > 0 ? rawAmount / (hoursPerWeek * 52) : 0;
        break;
      default:
        standardHourly = rawAmount;
    }

    // Standard Annual Base (52 weeks)
    const standardWeekly = standardHourly * hoursPerWeek;
    const standardDaily = standardHourly * hoursPerDay;
    const standardBiWeekly = standardWeekly * 2;
    const standardAnnual = standardWeekly * 52;
    const standardSemiMonthly = standardAnnual / 24;
    const standardMonthly = standardAnnual / 12;
    const standardQuarterly = standardAnnual / 4;

    // Vacation adjustment
    const workedWeeks = Math.max(0, 52 - vacationWeeks);
    let adjustedAnnual = standardAnnual;
    if (vacationType === 'unpaid') {
      adjustedAnnual = standardWeekly * workedWeeks;
    }

    // Overtime Calculations
    const otRate = standardHourly * otMultiplier;
    const weeklyOtPay = isOtEnabled ? (otRate * otHours) : 0;
    const totalWeeklyWithOt = standardWeekly + weeklyOtPay;
    const annualOtPay = isOtEnabled ? (weeklyOtPay * workedWeeks) : 0;
    const totalAnnualWithOt = adjustedAnnual + annualOtPay;

    // Total Adjusted Rates for each frequency
    const adjustedWeekly = totalAnnualWithOt / 52;
    const adjustedHourly = (hoursPerWeek * 52) > 0 ? (totalAnnualWithOt / (hoursPerWeek * 52)) : 0;
    const adjustedDaily = (hoursPerDay > 0 && hoursPerWeek > 0) ? (adjustedWeekly / daysPerWeek) : 0;
    const adjustedBiWeekly = totalAnnualWithOt / 26;
    const adjustedSemiMonthly = totalAnnualWithOt / 24;
    const adjustedMonthly = totalAnnualWithOt / 12;
    const adjustedQuarterly = totalAnnualWithOt / 4;

    // Update KPI display
    if (kpiHourly) kpiHourly.textContent = formatMoney(standardHourly, currency);
    if (kpiHourlySub) kpiHourlySub.textContent = isOtEnabled ? `OT: ${formatMoney(otRate, currency)}/hr` : `${hoursPerWeek} hrs/week standard`;

    if (kpiWeekly) kpiWeekly.textContent = formatMoney(isOtEnabled ? totalWeeklyWithOt : standardWeekly, currency);
    if (kpiWeeklySub) kpiWeeklySub.textContent = isOtEnabled ? `Incl. ${otHours}h OT (${formatMoney(weeklyOtPay, currency)})` : `${hoursPerWeek} hrs/week`;

    if (kpiMonthly) kpiMonthly.textContent = formatMoney(isOtEnabled ? adjustedMonthly : standardMonthly, currency);
    if (kpiMonthlySub) kpiMonthlySub.textContent = `Avg ${((hoursPerWeek * 52) / 12).toFixed(1)} hrs/month`;

    if (kpiAnnual) kpiAnnual.textContent = formatMoney(isOtEnabled || vacationType === 'unpaid' ? totalAnnualWithOt : standardAnnual, currency);
    if (kpiAnnualSub) {
      if (vacationType === 'unpaid' && vacationWeeks > 0) {
        kpiAnnualSub.textContent = `${workedWeeks} paid weeks (${vacationWeeks} wks unpaid)`;
      } else if (isOtEnabled) {
        kpiAnnualSub.textContent = `Includes ${formatMoney(annualOtPay, currency)} annual OT`;
      } else {
        kpiAnnualSub.textContent = `Full-time (52 weeks)`;
      }
    }

    // Overtime summary box
    if (isOtEnabled) {
      otSummaryBox.style.display = 'block';
      if (otRegularWeekly) otRegularWeekly.textContent = formatMoney(standardWeekly, currency);
      if (otRateDisplay) otRateDisplay.textContent = formatMoney(otRate, currency);
      if (otWeeklyEarnings) otWeeklyEarnings.textContent = `${formatMoney(weeklyOtPay, currency)} (${otHours}h)`;
      if (otAnnualTotal) otAnnualTotal.textContent = formatMoney(totalAnnualWithOt, currency);
    } else {
      otSummaryBox.style.display = 'none';
    }

    // Table Column Header label
    if (thAdjusted) {
      if (isOtEnabled && vacationType === 'unpaid') {
        thAdjusted.textContent = 'With OT & Unpaid PTO';
      } else if (isOtEnabled) {
        thAdjusted.textContent = `With OT (${otHours}h @ ${otMultiplier}x)`;
      } else if (vacationType === 'unpaid' && vacationWeeks > 0) {
        thAdjusted.textContent = `With ${vacationWeeks}w Unpaid PTO`;
      } else {
        thAdjusted.textContent = 'Adjusted Pay';
      }
    }

    // Comparison rows configuration
    const rows = [
      {
        id: 'hourly',
        name: 'Hourly',
        periods: `${(hoursPerWeek * 52).toLocaleString()} hrs/yr`,
        hoursEq: '1 Hour',
        standard: standardHourly,
        adjusted: isOtEnabled ? adjustedHourly : (vacationType === 'unpaid' ? adjustedAnnual / (hoursPerWeek * 52) : standardHourly)
      },
      {
        id: 'daily',
        name: 'Daily',
        periods: `${(daysPerWeek * 52).toLocaleString()} days/yr`,
        hoursEq: `${hoursPerDay.toFixed(1)} Hours`,
        standard: standardDaily,
        adjusted: adjustedDaily
      },
      {
        id: 'weekly',
        name: 'Weekly',
        periods: '52 weeks/yr',
        hoursEq: `${hoursPerWeek} Hours`,
        standard: standardWeekly,
        adjusted: adjustedWeekly
      },
      {
        id: 'biweekly',
        name: 'Bi-Weekly',
        periods: '26 paychecks/yr',
        hoursEq: `${hoursPerWeek * 2} Hours`,
        standard: standardBiWeekly,
        adjusted: adjustedBiWeekly
      },
      {
        id: 'semimonthly',
        name: 'Semi-Monthly',
        periods: '24 paychecks/yr',
        hoursEq: `${((hoursPerWeek * 52) / 24).toFixed(1)} Hours`,
        standard: standardSemiMonthly,
        adjusted: adjustedSemiMonthly
      },
      {
        id: 'monthly',
        name: 'Monthly',
        periods: '12 months/yr',
        hoursEq: `${((hoursPerWeek * 52) / 12).toFixed(1)} Hours`,
        standard: standardMonthly,
        adjusted: adjustedMonthly
      },
      {
        id: 'quarterly',
        name: 'Quarterly',
        periods: '4 quarters/yr',
        hoursEq: `${((hoursPerWeek * 52) / 4).toLocaleString()} Hours`,
        standard: standardQuarterly,
        adjusted: adjustedQuarterly
      },
      {
        id: 'annually',
        name: 'Annually',
        periods: '1 year',
        hoursEq: `${(hoursPerWeek * 52).toLocaleString()} Hours`,
        standard: standardAnnual,
        adjusted: totalAnnualWithOt
      }
    ];

    // Populate comparison table
    wageTableBody.innerHTML = '';
    rows.forEach(r => {
      const isSelected = r.id === frequency;
      const tr = document.createElement('tr');
      if (isSelected) tr.classList.add('highlighted');

      const formattedStandard = formatMoney(r.standard, currency);
      const formattedAdjusted = formatMoney(r.adjusted, currency);

      tr.innerHTML = `
        <td>
          <div style="display:flex; align-items:center; gap:0.5rem;">
            <strong>${r.name}</strong>
            ${isSelected ? '<span class="badge" style="background:var(--accent); color:#fff; font-size:0.65rem;">Selected</span>' : ''}
          </div>
        </td>
        <td><span class="badge-freq">${r.periods}</span></td>
        <td style="color:var(--text-secondary);">${r.hoursEq}</td>
        <td class="amount-cell">${formattedStandard}</td>
        <td class="amount-cell" style="color:${(isOtEnabled || vacationType === 'unpaid') ? 'var(--success)' : 'var(--accent)'}">${formattedAdjusted}</td>
        <td>
          <button type="button" class="copy-icon-btn copy-row-btn" data-copy="${formattedStandard}" title="Copy standard amount">
            Copy
          </button>
        </td>
      `;
      wageTableBody.appendChild(tr);
    });

    // Attach copy button listeners to rows
    document.querySelectorAll('.copy-row-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const text = e.currentTarget.getAttribute('data-copy');
        navigator.clipboard.writeText(text).then(() => {
          const original = btn.textContent;
          btn.textContent = 'Copied!';
          btn.style.borderColor = 'var(--success)';
          btn.style.color = 'var(--success)';
          setTimeout(() => {
            btn.textContent = original;
            btn.style.borderColor = '';
            btn.style.color = '';
          }, 1500);
        });
      });
    });
  }

  // Event Listeners
  wageAmountInput.addEventListener('input', calculateWages);
  frequencySelect.addEventListener('change', calculateWages);
  currencySelect.addEventListener('change', calculateWages);

  hoursSlider.addEventListener('input', () => {
    updateSliderLabels();
    calculateWages();
  });

  daysSlider.addEventListener('input', () => {
    updateSliderLabels();
    calculateWages();
  });

  vacationSlider.addEventListener('input', () => {
    updateSliderLabels();
    calculateWages();
  });

  // Vacation type buttons
  vacationPaidBtn.addEventListener('click', () => {
    vacationType = 'paid';
    vacationPaidBtn.classList.add('active');
    vacationUnpaidBtn.classList.remove('active');
    calculateWages();
  });

  vacationUnpaidBtn.addEventListener('click', () => {
    vacationType = 'unpaid';
    vacationUnpaidBtn.classList.add('active');
    vacationPaidBtn.classList.remove('active');
    calculateWages();
  });

  // Overtime toggle
  enableOtCheck.addEventListener('change', () => {
    if (enableOtCheck.checked) {
      otStatusBadge.textContent = 'Active';
      otStatusBadge.style.background = 'var(--accent-glow)';
      otStatusBadge.style.color = 'var(--accent)';
      otControls.style.display = 'flex';
    } else {
      otStatusBadge.textContent = 'Off';
      otStatusBadge.style.background = 'var(--bg-secondary)';
      otStatusBadge.style.color = 'var(--text-secondary)';
      otControls.style.display = 'none';
    }
    calculateWages();
  });

  otHoursSlider.addEventListener('input', () => {
    updateSliderLabels();
    calculateWages();
  });

  otMultiplierSelect.addEventListener('change', calculateWages);

  // Preset chips
  presetChips.forEach(chip => {
    chip.addEventListener('click', () => {
      const amt = chip.getAttribute('data-amt');
      const freq = chip.getAttribute('data-freq');
      wageAmountInput.value = amt;
      frequencySelect.value = freq;
      calculateWages();
    });
  });

  // Copy Summary text
  if (copySummaryBtn) {
    copySummaryBtn.addEventListener('click', () => {
      const currency = currencySelect.value || '$';
      const amt = wageAmountInput.value;
      const freq = frequencySelect.options[frequencySelect.selectedIndex].text;
      const hRate = kpiHourly.textContent;
      const wRate = kpiWeekly.textContent;
      const mRate = kpiMonthly.textContent;
      const aRate = kpiAnnual.textContent;

      const summaryText = `Wage & Salary Conversion Summary:
Input Pay: ${currency}${amt} (${freq})
-----------------------------------------
Hourly Rate:    ${hRate}
Weekly Gross:   ${wRate} (${hoursSlider.value} hrs/wk)
Monthly Gross:  ${mRate}
Annual Salary:  ${aRate}
PTO / Vacation: ${vacationSlider.value} weeks (${vacationType})
Overtime:       ${enableOtCheck.checked ? `${otHoursSlider.value} hrs/wk @ ${otMultiplierSelect.value}x` : 'None'}
Generated with ALL-IN-ONE Wage Converter`;

      navigator.clipboard.writeText(summaryText).then(() => {
        const originalText = copySummaryBtn.innerHTML;
        copySummaryBtn.innerHTML = `
          <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="color:var(--success);"><polyline points="20 6 9 17 4 12"></polyline></svg>
          Copied Summary!
        `;
        setTimeout(() => {
          copySummaryBtn.innerHTML = originalText;
        }, 2000);
      });
    });
  }

  // Initial calculation
  updateSliderLabels();
  calculateWages();
});