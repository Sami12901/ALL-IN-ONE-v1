// Compound Interest Simulator Implementation
document.addEventListener('DOMContentLoaded', () => {
  // DOM Elements - Inputs
  const initialPrincipalInput = document.getElementById('initial-principal');
  const principalRange = document.getElementById('principal-range');
  const principalBadge = document.getElementById('principal-badge');

  const monthlyDepositInput = document.getElementById('monthly-deposit');
  const depositRange = document.getElementById('deposit-range');
  const depositBadge = document.getElementById('deposit-badge');

  const annualRateInput = document.getElementById('annual-rate');
  const rateRange = document.getElementById('rate-range');
  const rateBadge = document.getElementById('rate-badge');

  const investmentYearsInput = document.getElementById('investment-years');
  const yearsRange = document.getElementById('years-range');
  const yearsBadge = document.getElementById('years-badge');

  const compoundFrequencySelect = document.getElementById('compound-frequency');
  const depositTimingSelect = document.getElementById('deposit-timing');
  const btnResetCi = document.getElementById('btn-reset-ci');

  // DOM Elements - Outputs & KPIs
  const forecastTermBadge = document.getElementById('forecast-term-badge');
  const kpiFutureValue = document.getElementById('kpi-future-value');
  const kpiGrowthMultiplier = document.getElementById('kpi-growth-multiplier');
  const kpiTotalContributions = document.getElementById('kpi-total-contributions');
  const kpiContributionsSub = document.getElementById('kpi-contributions-sub');
  const kpiTotalInterest = document.getElementById('kpi-total-interest');
  const kpiInterestPercentage = document.getElementById('kpi-interest-percentage');

  // DOM Elements - Chart & Table
  const growthSvg = document.getElementById('growth-svg');
  const chartTooltip = document.getElementById('chart-tooltip');
  const svgChartWrapper = document.getElementById('svg-chart-wrapper');
  const ciTableTbody = document.getElementById('ci-table-tbody');
  const btnExportCiCsv = document.getElementById('btn-export-ci-csv');

  // State
  let yearlyRecords = [];

  // Currency Formatter
  const formatCurrency = (val, decimals = 2) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals
    }).format(val);
  };

  const formatCompact = (val) => {
    if (val >= 1000000) return `$${(val / 1000000).toFixed(1)}M`;
    if (val >= 1000) return `$${(val / 1000).toFixed(0)}K`;
    return `$${Math.round(val)}`;
  };

  // Perform Simulation
  function calculateCompoundInterest() {
    const principal = Math.max(0, parseFloat(initialPrincipalInput.value) || 0);
    const monthlyDeposit = Math.max(0, parseFloat(monthlyDepositInput.value) || 0);
    const annualRate = Math.max(0, parseFloat(annualRateInput.value) || 0);
    const years = Math.max(1, Math.min(60, parseInt(investmentYearsInput.value, 10) || 1));
    const compFreq = parseInt(compoundFrequencySelect.value, 10) || 12;
    const isBeginning = depositTimingSelect.value === 'start';

    // Update Badges
    principalBadge.textContent = formatCurrency(principal, 0);
    depositBadge.textContent = `${formatCurrency(monthlyDeposit, 0)}/mo`;
    rateBadge.textContent = `${annualRate.toFixed(2)}%`;
    yearsBadge.textContent = `${years} Year${years > 1 ? 's' : ''}`;
    forecastTermBadge.textContent = `Year ${years} Projection`;

    // Monthly effective interest rate: (1 + r/n)^(n/12) - 1
    const nominalRate = annualRate / 100;
    const monthlyRate = nominalRate > 0 ? Math.pow(1 + nominalRate / compFreq, compFreq / 12) - 1 : 0;

    let balance = principal;
    let totalContributions = principal;
    const records = [];

    // Year 0 record
    records.push({
      year: 0,
      startBalance: principal,
      annualDeposits: 0,
      interestEarned: 0,
      cumulativeContributions: principal,
      cumulativeInterest: 0,
      endBalance: principal
    });

    for (let y = 1; y <= years; y++) {
      const yearStartBalance = balance;
      let yearDeposits = 0;
      let yearInterest = 0;

      for (let m = 1; m <= 12; m++) {
        if (isBeginning) {
          balance += monthlyDeposit;
          yearDeposits += monthlyDeposit;
          totalContributions += monthlyDeposit;
        }

        const monthInterest = balance * monthlyRate;
        balance += monthInterest;
        yearInterest += monthInterest;

        if (!isBeginning) {
          balance += monthlyDeposit;
          yearDeposits += monthlyDeposit;
          totalContributions += monthlyDeposit;
        }
      }

      const totalInterestSoFar = balance - totalContributions;

      records.push({
        year: y,
        startBalance: yearStartBalance,
        annualDeposits: yearDeposits,
        interestEarned: yearInterest,
        cumulativeContributions: totalContributions,
        cumulativeInterest: Math.max(0, totalInterestSoFar),
        endBalance: balance
      });
    }

    yearlyRecords = records;
    const finalRecord = records[records.length - 1];
    const finalBalance = finalRecord.endBalance;
    const finalContributions = finalRecord.cumulativeContributions;
    const finalInterest = finalRecord.cumulativeInterest;

    // Update KPIs
    kpiFutureValue.textContent = formatCurrency(finalBalance, 0);
    const multiplier = finalContributions > 0 ? (finalBalance / finalContributions).toFixed(2) : '1.00';
    kpiGrowthMultiplier.textContent = `${multiplier}x of all invested contributions`;

    kpiTotalContributions.textContent = formatCurrency(finalContributions, 0);
    kpiContributionsSub.textContent = `${formatCurrency(principal, 0)} initial + ${formatCurrency(finalContributions - principal, 0)} deposits`;

    kpiTotalInterest.textContent = formatCurrency(finalInterest, 0);
    const interestPct = finalBalance > 0 ? ((finalInterest / finalBalance) * 100).toFixed(1) : '0.0';
    kpiInterestPercentage.textContent = `${interestPct}% of final balance`;

    // Render Table and SVG Chart
    renderTable();
    renderSvgChart();
  }

  // Render Table
  function renderTable() {
    ciTableTbody.innerHTML = '';
    const fragment = document.createDocumentFragment();

    yearlyRecords.slice(1).forEach(rec => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td style="font-weight: 700;">Year ${rec.year}</td>
        <td>${formatCurrency(rec.startBalance, 0)}</td>
        <td style="color: var(--accent);">${formatCurrency(rec.annualDeposits, 0)}</td>
        <td style="color: var(--success);">${formatCurrency(rec.interestEarned, 0)}</td>
        <td style="color: var(--text-tertiary);">${formatCurrency(rec.cumulativeContributions, 0)}</td>
        <td style="font-weight: 700;">${formatCurrency(rec.endBalance, 0)}</td>
      `;
      fragment.appendChild(tr);
    });

    ciTableTbody.appendChild(fragment);
  }

  // Render SVG Growth Chart
  function renderSvgChart() {
    growthSvg.innerHTML = '';
    const width = 600;
    const height = 260;
    const padLeft = 65;
    const padRight = 20;
    const padTop = 20;
    const padBottom = 35;

    const chartW = width - padLeft - padRight;
    const chartH = height - padTop - padBottom;

    const totalYears = yearlyRecords.length - 1;
    const maxVal = Math.max(100, ...yearlyRecords.map(r => r.endBalance)) * 1.08;

    const getX = (year) => padLeft + (year / totalYears) * chartW;
    const getY = (val) => padTop + chartH - (val / maxVal) * chartH;

    // Grid lines and Y-axis labels
    const yTicks = 4;
    for (let i = 0; i <= yTicks; i++) {
      const val = (maxVal / yTicks) * i;
      const yPos = getY(val);

      const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
      line.setAttribute('x1', padLeft);
      line.setAttribute('y1', yPos);
      line.setAttribute('x2', width - padRight);
      line.setAttribute('y2', yPos);
      line.setAttribute('stroke', 'rgba(255,255,255,0.08)');
      line.setAttribute('stroke-dasharray', '3,3');
      growthSvg.appendChild(line);

      const label = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      label.setAttribute('x', padLeft - 8);
      label.setAttribute('y', yPos + 4);
      label.setAttribute('text-anchor', 'end');
      label.setAttribute('fill', 'var(--text-tertiary)');
      label.setAttribute('font-size', '11');
      label.textContent = formatCompact(val);
      growthSvg.appendChild(label);
    }

    // X-axis Year labels (every 5 years or spaced appropriately)
    const yearStep = totalYears <= 10 ? 1 : totalYears <= 25 ? 5 : 10;
    for (let y = 0; y <= totalYears; y += yearStep) {
      const xPos = getX(y);
      const label = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      label.setAttribute('x', xPos);
      label.setAttribute('y', height - 10);
      label.setAttribute('text-anchor', 'middle');
      label.setAttribute('fill', 'var(--text-tertiary)');
      label.setAttribute('font-size', '11');
      label.textContent = `Y${y}`;
      growthSvg.appendChild(label);
    }

    // Points for Total Contributions Path
    let contribPathD = `M ${getX(0)} ${getY(0)}`;
    yearlyRecords.forEach(r => {
      contribPathD += ` L ${getX(r.year)} ${getY(r.cumulativeContributions)}`;
    });
    const contribAreaD = `${contribPathD} L ${getX(totalYears)} ${getY(0)} Z`;

    // Points for Ending Balance Path
    let balancePathD = `M ${getX(0)} ${getY(0)}`;
    yearlyRecords.forEach(r => {
      balancePathD += ` L ${getX(r.year)} ${getY(r.endBalance)}`;
    });
    const balanceAreaD = `${balancePathD} L ${getX(totalYears)} ${getY(0)} Z`;

    // Balance Area (Green / Top Area)
    const balanceArea = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    balanceArea.setAttribute('d', balanceAreaD);
    balanceArea.setAttribute('fill', 'rgba(16, 185, 129, 0.22)');
    growthSvg.appendChild(balanceArea);

    // Balance Line
    const balanceLine = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    balanceLine.setAttribute('d', balancePathD);
    balanceLine.setAttribute('fill', 'none');
    balanceLine.setAttribute('stroke', '#10b981');
    balanceLine.setAttribute('stroke-width', '2.5');
    growthSvg.appendChild(balanceLine);

    // Contributions Area (Accent / Base Area)
    const contribArea = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    contribArea.setAttribute('d', contribAreaD);
    contribArea.setAttribute('fill', 'rgba(78, 133, 191, 0.35)');
    growthSvg.appendChild(contribArea);

    // Contributions Line
    const contribLine = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    contribLine.setAttribute('d', contribPathD);
    contribLine.setAttribute('fill', 'none');
    contribLine.setAttribute('stroke', 'var(--accent)');
    contribLine.setAttribute('stroke-width', '2.5');
    growthSvg.appendChild(contribLine);

    // Interactive Hover Elements (vertical cursor line & circles)
    const hoverLine = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    hoverLine.setAttribute('y1', padTop);
    hoverLine.setAttribute('y2', padTop + chartH);
    hoverLine.setAttribute('stroke', '#ffffff');
    hoverLine.setAttribute('stroke-dasharray', '2,2');
    hoverLine.setAttribute('stroke-width', '1.5');
    hoverLine.setAttribute('style', 'display: none;');
    growthSvg.appendChild(hoverLine);

    const hoverDotBalance = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    hoverDotBalance.setAttribute('r', '5');
    hoverDotBalance.setAttribute('fill', '#10b981');
    hoverDotBalance.setAttribute('stroke', '#ffffff');
    hoverDotBalance.setAttribute('stroke-width', '2');
    hoverDotBalance.setAttribute('style', 'display: none;');
    growthSvg.appendChild(hoverDotBalance);

    const hoverDotContrib = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    hoverDotContrib.setAttribute('r', '5');
    hoverDotContrib.setAttribute('fill', 'var(--accent)');
    hoverDotContrib.setAttribute('stroke', '#ffffff');
    hoverDotContrib.setAttribute('stroke-width', '2');
    hoverDotContrib.setAttribute('style', 'display: none;');
    growthSvg.appendChild(hoverDotContrib);

    // Transparent Overlay for Mouse Events
    const overlay = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
    overlay.setAttribute('x', padLeft);
    overlay.setAttribute('y', padTop);
    overlay.setAttribute('width', chartW);
    overlay.setAttribute('height', chartH);
    overlay.setAttribute('fill', 'transparent');
    overlay.setAttribute('cursor', 'crosshair');
    growthSvg.appendChild(overlay);

    overlay.addEventListener('mousemove', (e) => {
      const rect = growthSvg.getBoundingClientRect();
      const mouseX = ((e.clientX - rect.left) / rect.width) * width;
      const clampedX = Math.max(padLeft, Math.min(width - padRight, mouseX));
      
      const yearFraction = ((clampedX - padLeft) / chartW) * totalYears;
      const closestYear = Math.round(yearFraction);
      const rec = yearlyRecords[closestYear] || yearlyRecords[0];

      const xPos = getX(rec.year);
      const yBal = getY(rec.endBalance);
      const yContrib = getY(rec.cumulativeContributions);

      hoverLine.setAttribute('x1', xPos);
      hoverLine.setAttribute('x2', xPos);
      hoverLine.setAttribute('style', 'display: block;');

      hoverDotBalance.setAttribute('cx', xPos);
      hoverDotBalance.setAttribute('cy', yBal);
      hoverDotBalance.setAttribute('style', 'display: block;');

      hoverDotContrib.setAttribute('cx', xPos);
      hoverDotContrib.setAttribute('cy', yContrib);
      hoverDotContrib.setAttribute('style', 'display: block;');

      // Tooltip position & text
      const pctX = (xPos / width) * 100;
      const pctY = (yBal / height) * 100;
      chartTooltip.style.left = `${pctX}%`;
      chartTooltip.style.top = `${pctY}%`;
      chartTooltip.style.display = 'block';
      chartTooltip.innerHTML = `
        <div style="font-weight: 700; color: #ffffff; margin-bottom: 0.25rem;">Year ${rec.year}</div>
        <div style="color: #10b981; font-weight: 600;">Total Balance: ${formatCurrency(rec.endBalance, 0)}</div>
        <div style="color: var(--accent);">Deposits: ${formatCurrency(rec.cumulativeContributions, 0)}</div>
        <div style="color: #f59e0b;">Interest: ${formatCurrency(rec.cumulativeInterest, 0)}</div>
      `;
    });

    overlay.addEventListener('mouseleave', () => {
      hoverLine.setAttribute('style', 'display: none;');
      hoverDotBalance.setAttribute('style', 'display: none;');
      hoverDotContrib.setAttribute('style', 'display: none;');
      chartTooltip.style.display = 'none';
    });
  }

  // Export CSV
  function exportCSV() {
    if (!yearlyRecords || yearlyRecords.length <= 1) {
      alert('No compound growth data to export.');
      return;
    }

    const headers = ['Year', 'Starting Balance', 'Annual Deposits', 'Interest Earned', 'Total Contributions', 'Ending Balance'];
    const csvRows = [headers.join(',')];

    yearlyRecords.slice(1).forEach(rec => {
      const fields = [
        rec.year,
        rec.startBalance.toFixed(2),
        rec.annualDeposits.toFixed(2),
        rec.interestEarned.toFixed(2),
        rec.cumulativeContributions.toFixed(2),
        rec.endBalance.toFixed(2)
      ];
      csvRows.push(fields.join(','));
    });

    const csvContent = 'data:text/csv;charset=utf-8,' + encodeURIComponent(csvRows.join('\n'));
    const link = document.createElement('a');
    link.setAttribute('href', csvContent);
    link.setAttribute('download', `compound-interest-growth-${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  // Event Listeners - Synchronize Ranges and Inputs
  initialPrincipalInput.addEventListener('input', () => {
    principalRange.value = initialPrincipalInput.value;
    updateChipActiveState('preset-principal', initialPrincipalInput.value);
    calculateCompoundInterest();
  });
  principalRange.addEventListener('input', () => {
    initialPrincipalInput.value = principalRange.value;
    updateChipActiveState('preset-principal', principalRange.value);
    calculateCompoundInterest();
  });

  monthlyDepositInput.addEventListener('input', () => {
    depositRange.value = monthlyDepositInput.value;
    updateChipActiveState('preset-deposit', monthlyDepositInput.value);
    calculateCompoundInterest();
  });
  depositRange.addEventListener('input', () => {
    monthlyDepositInput.value = depositRange.value;
    updateChipActiveState('preset-deposit', depositRange.value);
    calculateCompoundInterest();
  });

  annualRateInput.addEventListener('input', () => {
    rateRange.value = annualRateInput.value;
    updateChipActiveState('preset-rate', annualRateInput.value);
    calculateCompoundInterest();
  });
  rateRange.addEventListener('input', () => {
    annualRateInput.value = rateRange.value;
    updateChipActiveState('preset-rate', rateRange.value);
    calculateCompoundInterest();
  });

  investmentYearsInput.addEventListener('input', () => {
    yearsRange.value = investmentYearsInput.value;
    updateChipActiveState('preset-years', investmentYearsInput.value);
    calculateCompoundInterest();
  });
  yearsRange.addEventListener('input', () => {
    investmentYearsInput.value = yearsRange.value;
    updateChipActiveState('preset-years', yearsRange.value);
    calculateCompoundInterest();
  });

  compoundFrequencySelect.addEventListener('change', calculateCompoundInterest);
  depositTimingSelect.addEventListener('change', calculateCompoundInterest);

  // Preset Chips
  document.querySelectorAll('[data-preset-principal]').forEach(btn => {
    btn.addEventListener('click', () => {
      const val = btn.getAttribute('data-preset-principal');
      initialPrincipalInput.value = val;
      principalRange.value = val;
      updateChipActiveState('preset-principal', val);
      calculateCompoundInterest();
    });
  });

  document.querySelectorAll('[data-preset-deposit]').forEach(btn => {
    btn.addEventListener('click', () => {
      const val = btn.getAttribute('data-preset-deposit');
      monthlyDepositInput.value = val;
      depositRange.value = val;
      updateChipActiveState('preset-deposit', val);
      calculateCompoundInterest();
    });
  });

  document.querySelectorAll('[data-preset-rate]').forEach(btn => {
    btn.addEventListener('click', () => {
      const val = btn.getAttribute('data-preset-rate');
      annualRateInput.value = val;
      rateRange.value = val;
      updateChipActiveState('preset-rate', val);
      calculateCompoundInterest();
    });
  });

  document.querySelectorAll('[data-preset-years]').forEach(btn => {
    btn.addEventListener('click', () => {
      const val = btn.getAttribute('data-preset-years');
      investmentYearsInput.value = val;
      yearsRange.value = val;
      updateChipActiveState('preset-years', val);
      calculateCompoundInterest();
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
  btnResetCi.addEventListener('click', () => {
    initialPrincipalInput.value = 10000;
    principalRange.value = 10000;
    monthlyDepositInput.value = 500;
    depositRange.value = 500;
    annualRateInput.value = 8.0;
    rateRange.value = 8.0;
    investmentYearsInput.value = 20;
    yearsRange.value = 20;
    compoundFrequencySelect.value = '12';
    depositTimingSelect.value = 'end';

    updateChipActiveState('preset-principal', 10000);
    updateChipActiveState('preset-deposit', 500);
    updateChipActiveState('preset-rate', 8);
    updateChipActiveState('preset-years', 20);

    calculateCompoundInterest();
  });

  btnExportCiCsv.addEventListener('click', exportCSV);

  // Resize listener for responsive redraw of SVG
  window.addEventListener('resize', renderSvgChart);

  // Initial Calculation
  calculateCompoundInterest();
});