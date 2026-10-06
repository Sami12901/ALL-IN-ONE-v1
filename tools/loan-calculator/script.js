// Loan & Mortgage Calculator Implementation
document.addEventListener('DOMContentLoaded', () => {
  // DOM Elements - Inputs
  const loanAmountInput = document.getElementById('loan-amount');
  const loanAmountRange = document.getElementById('loan-amount-range');
  const loanAmountBadge = document.getElementById('loan-amount-badge');

  const interestRateInput = document.getElementById('interest-rate');
  const interestRateRange = document.getElementById('interest-rate-range');
  const interestRateBadge = document.getElementById('interest-rate-badge');

  const loanTermInput = document.getElementById('loan-term');
  const loanTermUnit = document.getElementById('loan-term-unit');
  const loanTermBadge = document.getElementById('loan-term-badge');

  const extraPaymentInput = document.getElementById('extra-payment');
  const extraPaymentBadge = document.getElementById('extra-payment-badge');

  const startMonthYearInput = document.getElementById('start-month-year');
  const btnResetLoan = document.getElementById('btn-reset-loan');

  // DOM Elements - Outputs & KPIs
  const kpiMonthlyPayment = document.getElementById('kpi-monthly-payment');
  const kpiPaymentBreakdown = document.getElementById('kpi-payment-breakdown');
  const kpiTotalInterest = document.getElementById('kpi-total-interest');
  const kpiInterestRatio = document.getElementById('kpi-interest-ratio');
  const kpiTotalPayment = document.getElementById('kpi-total-payment');
  const kpiPayoffDate = document.getElementById('kpi-payoff-date');
  const kpiPayoffSub = document.getElementById('kpi-payoff-sub');
  const totalTermTag = document.getElementById('total-term-tag');

  const savingsBanner = document.getElementById('savings-banner');
  const savingsTitle = document.getElementById('savings-title');
  const savingsDetails = document.getElementById('savings-details');

  const barPrincipal = document.getElementById('bar-principal');
  const barInterest = document.getElementById('bar-interest');
  const breakdownRatioText = document.getElementById('breakdown-ratio-text');
  const legendPrincipalVal = document.getElementById('legend-principal-val');
  const legendInterestVal = document.getElementById('legend-interest-val');

  // DOM Elements - Schedule Table
  const scheduleCountBadge = document.getElementById('schedule-count-badge');
  const scheduleSearch = document.getElementById('schedule-search');
  const btnExportCsv = document.getElementById('btn-export-csv');
  const scheduleTbody = document.getElementById('schedule-tbody');
  const schedulePageSize = document.getElementById('schedule-page-size');
  const paginationInfo = document.getElementById('pagination-info');
  const btnPagePrev = document.getElementById('btn-page-prev');
  const btnPageNext = document.getElementById('btn-page-next');
  const currentPageNum = document.getElementById('current-page-num');

  // State
  let fullSchedule = [];
  let filteredSchedule = [];
  let currentPage = 1;

  // Initialize Default Date to Current Month/Year
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = String(now.getMonth() + 1).padStart(2, '0');
  startMonthYearInput.value = `${currentYear}-${currentMonth}`;

  // Currency Formatter
  const formatCurrency = (val, decimals = 2) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals
    }).format(val);
  };

  const formatNumber = (val) => {
    return new Intl.NumberFormat('en-US').format(val);
  };

  // Helper to format date month and year
  const getPaymentDate = (baseYear, baseMonthZeroIndexed, monthOffset) => {
    const d = new Date(baseYear, baseMonthZeroIndexed + monthOffset, 1);
    return d.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
  };

  // Calculate Amortization
  function calculateLoan() {
    const principal = Math.max(0, parseFloat(loanAmountInput.value) || 0);
    const annualRate = Math.max(0, parseFloat(interestRateInput.value) || 0);
    const rawTerm = Math.max(1, parseFloat(loanTermInput.value) || 1);
    const termUnit = loanTermUnit.value;
    const extraPayment = Math.max(0, parseFloat(extraPaymentInput.value) || 0);

    const totalMonths = termUnit === 'years' ? Math.round(rawTerm * 12) : Math.round(rawTerm);
    const monthlyRate = annualRate / 100 / 12;

    // Update badges
    loanAmountBadge.textContent = formatCurrency(principal, 0);
    interestRateBadge.textContent = `${annualRate.toFixed(2)}%`;
    loanTermBadge.textContent = termUnit === 'years' ? `${rawTerm} Years` : `${rawTerm} Months`;
    extraPaymentBadge.textContent = extraPayment > 0 ? `+${formatCurrency(extraPayment, 0)}/mo` : '$0';

    if (principal <= 0) {
      clearResults();
      return;
    }

    // Standard Base Payment (without extra payments)
    let standardMonthlyPayment = 0;
    if (monthlyRate === 0) {
      standardMonthlyPayment = principal / totalMonths;
    } else {
      const pow = Math.pow(1 + monthlyRate, totalMonths);
      standardMonthlyPayment = principal * (monthlyRate * pow) / (pow - 1);
    }

    // Standard Schedule without extra payment (for comparison)
    let stdBalance = principal;
    let stdTotalInterest = 0;
    let stdMonthsCount = 0;

    for (let m = 1; m <= totalMonths && stdBalance > 0.001; m++) {
      stdMonthsCount++;
      const interestForMonth = stdBalance * monthlyRate;
      stdTotalInterest += interestForMonth;
      const principalForMonth = Math.min(stdBalance, standardMonthlyPayment - interestForMonth);
      stdBalance -= principalForMonth;
    }

    // Actual Schedule with Extra Payments
    const schedule = [];
    let currentBalance = principal;
    let totalInterestPaid = 0;
    let totalPrincipalPaid = 0;
    let totalExtraPaid = 0;

    const [startYearStr, startMonthStr] = startMonthYearInput.value.split('-');
    const startYear = parseInt(startYearStr, 10) || currentYear;
    const startMonth = (parseInt(startMonthStr, 10) || 1) - 1; // 0-indexed

    let monthIndex = 1;
    // Cap safety at 1200 months (100 years)
    while (currentBalance > 0.005 && monthIndex <= 1200) {
      const interestForMonth = currentBalance * monthlyRate;
      let scheduledPrincipal = standardMonthlyPayment - interestForMonth;
      
      let actualExtra = extraPayment;
      let principalPaid = scheduledPrincipal + actualExtra;

      // Handle final partial payment
      let totalMonthPayment = standardMonthlyPayment + actualExtra;
      if (principalPaid >= currentBalance) {
        principalPaid = currentBalance;
        actualExtra = Math.max(0, principalPaid - scheduledPrincipal);
        totalMonthPayment = interestForMonth + principalPaid;
        currentBalance = 0;
      } else {
        currentBalance -= principalPaid;
      }

      totalInterestPaid += interestForMonth;
      totalPrincipalPaid += principalPaid;
      totalExtraPaid += actualExtra;

      const paymentDate = getPaymentDate(startYear, startMonth, monthIndex - 1);

      schedule.push({
        number: monthIndex,
        date: paymentDate,
        totalPayment: totalMonthPayment,
        principal: principalPaid,
        interest: interestForMonth,
        extra: actualExtra,
        totalInterest: totalInterestPaid,
        remainingBalance: Math.max(0, currentBalance)
      });

      monthIndex++;
    }

    fullSchedule = schedule;
    const actualMonthsCount = schedule.length;
    const totalCostOfLoan = principal + totalInterestPaid;
    const finalDate = schedule.length > 0 ? schedule[schedule.length - 1].date : getPaymentDate(startYear, startMonth, totalMonths - 1);

    // Update KPI UI
    kpiMonthlyPayment.textContent = formatCurrency(standardMonthlyPayment + (extraPayment > 0 ? extraPayment : 0));
    if (extraPayment > 0) {
      kpiPaymentBreakdown.textContent = `Base: ${formatCurrency(standardMonthlyPayment)} + Extra: ${formatCurrency(extraPayment)}`;
    } else {
      kpiPaymentBreakdown.textContent = `Base P&I Payment`;
    }

    kpiTotalInterest.textContent = formatCurrency(totalInterestPaid);
    const intRatio = ((totalInterestPaid / principal) * 100).toFixed(1);
    kpiInterestRatio.textContent = `${intRatio}% of loan amount`;

    kpiTotalPayment.textContent = formatCurrency(totalCostOfLoan);
    kpiPayoffDate.textContent = finalDate;
    
    const payoffYears = (actualMonthsCount / 12).toFixed(1);
    kpiPayoffSub.textContent = `In ${payoffYears} years (${actualMonthsCount} payments)`;
    totalTermTag.textContent = `${actualMonthsCount} Total Payments`;

    // Visual Composition Bar
    const principalPct = Math.max(1, Math.min(99, (principal / totalCostOfLoan) * 100));
    const interestPct = 100 - principalPct;
    barPrincipal.style.width = `${principalPct}%`;
    barInterest.style.width = `${interestPct}%`;
    breakdownRatioText.textContent = `Principal: ${principalPct.toFixed(1)}% | Interest: ${interestPct.toFixed(1)}%`;
    legendPrincipalVal.textContent = formatCurrency(principal, 0);
    legendInterestVal.textContent = formatCurrency(totalInterestPaid, 0);

    // Extra Payment Savings
    if (extraPayment > 0 && actualMonthsCount < stdMonthsCount) {
      const interestSaved = Math.max(0, stdTotalInterest - totalInterestPaid);
      const monthsSaved = stdMonthsCount - actualMonthsCount;
      const yearsSaved = Math.floor(monthsSaved / 12);
      const remMonthsSaved = monthsSaved % 12;

      let timeSavedStr = '';
      if (yearsSaved > 0 && remMonthsSaved > 0) {
        timeSavedStr = `${yearsSaved} year${yearsSaved > 1 ? 's' : ''} and ${remMonthsSaved} month${remMonthsSaved > 1 ? 's' : ''}`;
      } else if (yearsSaved > 0) {
        timeSavedStr = `${yearsSaved} year${yearsSaved > 1 ? 's' : ''}`;
      } else {
        timeSavedStr = `${remMonthsSaved} month${remMonthsSaved > 1 ? 's' : ''}`;
      }

      savingsTitle.textContent = `Accelerated Debt Free: Save ${formatCurrency(interestSaved, 0)}!`;
      savingsDetails.innerHTML = `By making an extra payment of <strong>${formatCurrency(extraPayment, 0)}/mo</strong>, you will pay off this loan <strong>${timeSavedStr} earlier</strong> and save <strong>${formatCurrency(interestSaved, 2)}</strong> in interest fees!`;
      savingsBanner.classList.remove('hidden');
    } else {
      savingsBanner.classList.add('hidden');
    }

    scheduleCountBadge.textContent = `${actualMonthsCount} Months`;

    // Apply Filter & Render Table
    applyFilterAndRender();
  }

  function clearResults() {
    kpiMonthlyPayment.textContent = '$0.00';
    kpiTotalInterest.textContent = '$0.00';
    kpiTotalPayment.textContent = '$0.00';
    kpiPayoffDate.textContent = '---';
    fullSchedule = [];
    filteredSchedule = [];
    renderTable();
  }

  // Filter Schedule by search keyword
  function applyFilterAndRender() {
    const query = (scheduleSearch.value || '').trim().toLowerCase();
    if (!query) {
      filteredSchedule = fullSchedule;
    } else {
      filteredSchedule = fullSchedule.filter(row => {
        return (
          row.number.toString().includes(query) ||
          row.date.toLowerCase().includes(query)
        );
      });
    }
    currentPage = 1;
    renderTable();
  }

  // Render Table Page
  function renderTable() {
    scheduleTbody.innerHTML = '';
    const pageSizeVal = schedulePageSize.value;
    const pageSize = pageSizeVal === 'all' ? filteredSchedule.length : parseInt(pageSizeVal, 10);
    const totalRows = filteredSchedule.length;

    if (totalRows === 0) {
      scheduleTbody.innerHTML = `<tr><td colspan="8" style="text-align: center; padding: 2rem; color: var(--text-tertiary);">No amortization payments match your criteria.</td></tr>`;
      paginationInfo.textContent = 'Showing 0 of 0';
      btnPagePrev.disabled = true;
      btnPageNext.disabled = true;
      currentPageNum.textContent = '1';
      return;
    }

    const totalPages = Math.ceil(totalRows / pageSize) || 1;
    if (currentPage > totalPages) currentPage = totalPages;
    if (currentPage < 1) currentPage = 1;

    const startIdx = (currentPage - 1) * pageSize;
    const endIdx = Math.min(startIdx + pageSize, totalRows);
    const visibleRows = filteredSchedule.slice(startIdx, endIdx);

    const fragment = document.createDocumentFragment();
    visibleRows.forEach(row => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td style="font-weight: 600;">${row.number}</td>
        <td>${row.date}</td>
        <td style="font-weight: 600;">${formatCurrency(row.totalPayment)}</td>
        <td style="color: var(--accent);">${formatCurrency(row.principal)}</td>
        <td style="color: #f59e0b;">${formatCurrency(row.interest)}</td>
        <td style="color: var(--success);">${row.extra > 0 ? formatCurrency(row.extra) : '-'}</td>
        <td style="color: var(--text-tertiary);">${formatCurrency(row.totalInterest)}</td>
        <td style="font-weight: 700;">${formatCurrency(row.remainingBalance)}</td>
      `;
      fragment.appendChild(tr);
    });
    scheduleTbody.appendChild(fragment);

    paginationInfo.textContent = `Showing ${startIdx + 1}-${endIdx} of ${formatNumber(totalRows)}`;
    currentPageNum.textContent = `${currentPage} / ${totalPages}`;
    btnPagePrev.disabled = currentPage <= 1;
    btnPageNext.disabled = currentPage >= totalPages;
  }

  // Export CSV
  function exportCSV() {
    if (!fullSchedule || fullSchedule.length === 0) {
      alert('No amortization schedule to export.');
      return;
    }

    const headers = ['Payment #', 'Payment Date', 'Total Payment', 'Principal Paid', 'Interest Paid', 'Extra Payment', 'Cumulative Interest', 'Remaining Balance'];
    const csvRows = [headers.join(',')];

    fullSchedule.forEach(row => {
      const fields = [
        row.number,
        `"${row.date}"`,
        row.totalPayment.toFixed(2),
        row.principal.toFixed(2),
        row.interest.toFixed(2),
        row.extra.toFixed(2),
        row.totalInterest.toFixed(2),
        row.remainingBalance.toFixed(2)
      ];
      csvRows.push(fields.join(','));
    });

    const csvContent = 'data:text/csv;charset=utf-8,' + encodeURIComponent(csvRows.join('\n'));
    const link = document.createElement('a');
    link.setAttribute('href', csvContent);
    link.setAttribute('download', `loan-amortization-schedule-${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  // Event Listeners - Synchronize Ranges and Inputs
  loanAmountInput.addEventListener('input', () => {
    loanAmountRange.value = loanAmountInput.value;
    updateChipActiveState('preset-amount', loanAmountInput.value);
    calculateLoan();
  });
  loanAmountRange.addEventListener('input', () => {
    loanAmountInput.value = loanAmountRange.value;
    updateChipActiveState('preset-amount', loanAmountRange.value);
    calculateLoan();
  });

  interestRateInput.addEventListener('input', () => {
    interestRateRange.value = interestRateInput.value;
    updateChipActiveState('preset-rate', interestRateInput.value);
    calculateLoan();
  });
  interestRateRange.addEventListener('input', () => {
    interestRateInput.value = interestRateRange.value;
    updateChipActiveState('preset-rate', interestRateRange.value);
    calculateLoan();
  });

  loanTermInput.addEventListener('input', () => {
    updateChipActiveState('preset-term', loanTermInput.value);
    calculateLoan();
  });
  loanTermUnit.addEventListener('change', () => {
    calculateLoan();
  });

  extraPaymentInput.addEventListener('input', () => {
    updateChipActiveState('preset-extra', extraPaymentInput.value);
    calculateLoan();
  });

  startMonthYearInput.addEventListener('change', () => {
    calculateLoan();
  });

  // Preset Chips
  document.querySelectorAll('[data-preset-amount]').forEach(btn => {
    btn.addEventListener('click', () => {
      const val = btn.getAttribute('data-preset-amount');
      loanAmountInput.value = val;
      loanAmountRange.value = val;
      updateChipActiveState('preset-amount', val);
      calculateLoan();
    });
  });

  document.querySelectorAll('[data-preset-rate]').forEach(btn => {
    btn.addEventListener('click', () => {
      const val = btn.getAttribute('data-preset-rate');
      interestRateInput.value = val;
      interestRateRange.value = val;
      updateChipActiveState('preset-rate', val);
      calculateLoan();
    });
  });

  document.querySelectorAll('[data-preset-term]').forEach(btn => {
    btn.addEventListener('click', () => {
      const termVal = btn.getAttribute('data-preset-term');
      const unitVal = btn.getAttribute('data-unit') || 'years';
      loanTermInput.value = termVal;
      loanTermUnit.value = unitVal;
      updateChipActiveState('preset-term', termVal);
      calculateLoan();
    });
  });

  document.querySelectorAll('[data-preset-extra]').forEach(btn => {
    btn.addEventListener('click', () => {
      const val = btn.getAttribute('data-preset-extra');
      extraPaymentInput.value = val;
      updateChipActiveState('preset-extra', val);
      calculateLoan();
    });
  });

  function updateChipActiveState(attribute, value) {
    document.querySelectorAll(`[data-${attribute}]`).forEach(el => {
      if (el.getAttribute(`data-${attribute}`) === String(value)) {
        el.classList.add('active');
      } else {
        el.classList.remove('active');
      }
    });
  }

  // Reset to Defaults
  btnResetLoan.addEventListener('click', () => {
    loanAmountInput.value = 300000;
    loanAmountRange.value = 300000;
    interestRateInput.value = 5.50;
    interestRateRange.value = 5.5;
    loanTermInput.value = 30;
    loanTermUnit.value = 'years';
    extraPaymentInput.value = 0;
    startMonthYearInput.value = `${currentYear}-${currentMonth}`;
    scheduleSearch.value = '';
    schedulePageSize.value = '12';

    updateChipActiveState('preset-amount', 300000);
    updateChipActiveState('preset-rate', 5.5);
    updateChipActiveState('preset-term', 30);
    updateChipActiveState('preset-extra', 0);

    calculateLoan();
  });

  // Table Search and Pagination
  scheduleSearch.addEventListener('input', applyFilterAndRender);
  schedulePageSize.addEventListener('change', () => {
    currentPage = 1;
    renderTable();
  });

  btnPagePrev.addEventListener('click', () => {
    if (currentPage > 1) {
      currentPage--;
      renderTable();
    }
  });

  btnPageNext.addEventListener('click', () => {
    const pageSizeVal = schedulePageSize.value;
    const pageSize = pageSizeVal === 'all' ? filteredSchedule.length : parseInt(pageSizeVal, 10);
    const totalPages = Math.ceil(filteredSchedule.length / pageSize) || 1;
    if (currentPage < totalPages) {
      currentPage++;
      renderTable();
    }
  });

  btnExportCsv.addEventListener('click', exportCSV);

  // Initial Calculation
  calculateLoan();
});