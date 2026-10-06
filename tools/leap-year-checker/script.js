// Leap Year Checker & Gregorian Algorithm Engine
document.addEventListener('DOMContentLoaded', () => {
  // DOM Elements - Mode Switcher
  const tabSingle = document.getElementById('tab-single');
  const tabRange = document.getElementById('tab-range');
  const viewSingleYear = document.getElementById('view-single-year');
  const viewRangeExplorer = document.getElementById('view-range-explorer');

  // DOM Elements - Single Year
  const inputYear = document.getElementById('input-year');
  const btnYearPrev10 = document.getElementById('btn-year-prev-10');
  const btnYearPrev1 = document.getElementById('btn-year-prev-1');
  const btnYearNext1 = document.getElementById('btn-year-next-1');
  const btnYearNext10 = document.getElementById('btn-year-next-10');
  const btnCurrentYear = document.getElementById('btn-current-year');
  const btnRandomYear = document.getElementById('btn-random-year');

  const heroResultCard = document.getElementById('hero-result-card');
  const heroBadgeTag = document.getElementById('hero-badge-tag');
  const heroVerdictTitle = document.getElementById('hero-verdict-title');
  const heroVerdictDesc = document.getElementById('hero-verdict-desc');

  const stepCard1 = document.getElementById('step-card-1');
  const stepStatusIcon1 = document.getElementById('step-status-icon-1');
  const stepMath1 = document.getElementById('step-math-1');
  const stepDesc1 = document.getElementById('step-desc-1');

  const stepCard2 = document.getElementById('step-card-2');
  const stepStatusIcon2 = document.getElementById('step-status-icon-2');
  const stepMath2 = document.getElementById('step-math-2');
  const stepDesc2 = document.getElementById('step-desc-2');

  const stepCard3 = document.getElementById('step-card-3');
  const stepStatusIcon3 = document.getElementById('step-status-icon-3');
  const stepMath3 = document.getElementById('step-math-3');
  const stepDesc3 = document.getElementById('step-desc-3');

  const ruleVerdictCallout = document.getElementById('rule-verdict-callout');

  const valYearDays = document.getElementById('val-year-days');
  const subYearDays = document.getElementById('sub-year-days');
  const valFebDays = document.getElementById('val-feb-days');
  const subFebDays = document.getElementById('sub-feb-days');
  const valYearHours = document.getElementById('val-year-hours');
  const valYearMinutes = document.getElementById('val-year-minutes');
  const valYearSeconds = document.getElementById('val-year-seconds');

  const upcomingLeapList = document.getElementById('upcoming-leap-list');
  const btnSetYears = document.querySelectorAll('.btn-set-year');

  // DOM Elements - Range Explorer
  const rangeStartYear = document.getElementById('range-start-year');
  const rangeEndYear = document.getElementById('range-end-year');
  const rangeTotalYears = document.getElementById('range-total-years');
  const rangeLeapCount = document.getElementById('range-leap-count');
  const rangeLeapPct = document.getElementById('range-leap-pct');
  const rangeCommonCount = document.getElementById('range-common-count');
  const rangeTotalDays = document.getElementById('range-total-days');
  const rangeTilesContainer = document.getElementById('range-tiles-container');

  const filterAll = document.getElementById('filter-all');
  const filterLeapOnly = document.getElementById('filter-leap-only');
  const filterCenturies = document.getElementById('filter-centuries');
  const btnCopyLeapList = document.getElementById('btn-copy-leap-list');
  const btnSetRanges = document.querySelectorAll('.btn-set-range');

  let currentRangeFilter = 'all'; // 'all' | 'leap' | 'centuries'

  // Gregorian Leap Year Logic
  function evaluateLeapYear(year) {
    const y = parseInt(year, 10);
    const div4 = (y % 4 === 0);
    const div100 = (y % 100 === 0);
    const div400 = (y % 400 === 0);

    let isLeap = false;
    let reason = '';

    if (!div4) {
      isLeap = false;
      reason = `${y} is not divisible by 4, so it is a common year (365 days).`;
    } else if (!div100) {
      isLeap = true;
      reason = `${y} is divisible by 4 and is not a century year (not divisible by 100), making it a leap year (366 days).`;
    } else if (div400) {
      isLeap = true;
      reason = `${y} is a century year (divisible by 100) AND also divisible by 400. The 400-year exception makes it a leap year (366 days).`;
    } else {
      isLeap = false;
      reason = `${y} is a century year (divisible by 100) but NOT divisible by 400 (e.g. like 1700, 1800, 1900, 2100). Therefore, it is a common year (365 days).`;
    }

    return { y, div4, div100, div400, isLeap, reason };
  }

  // Single Year Analysis Routine
  function analyzeYear(year) {
    const y = parseInt(year, 10);
    if (isNaN(y) || y < 1) return;

    inputYear.value = y;
    const res = evaluateLeapYear(y);

    // 1. Update Hero Card
    if (res.isLeap) {
      heroResultCard.className = 'leap-hero-card leap-hero-is-leap';
      heroBadgeTag.textContent = 'Astronomical Leap Year';
      heroBadgeTag.style.background = 'rgba(16, 185, 129, 0.2)';
      heroBadgeTag.style.color = '#6ee7b7';
      heroVerdictTitle.textContent = `${y} IS a Leap Year! 🎉`;
      heroVerdictTitle.style.color = '#34d399';
      heroVerdictDesc.textContent = `${y} contains 366 days. February has 29 days, correcting the ~6 hour annual calendar drift.`;
    } else {
      heroResultCard.className = 'leap-hero-card leap-hero-not-leap';
      heroBadgeTag.textContent = 'Standard Common Year';
      heroBadgeTag.style.background = 'rgba(78, 133, 191, 0.2)';
      heroBadgeTag.style.color = 'var(--accent)';
      heroVerdictTitle.textContent = `${y} is NOT a Leap Year`;
      heroVerdictTitle.style.color = 'var(--text-primary)';
      heroVerdictDesc.textContent = `${y} is a standard common year with 365 calendar days. February has 28 days.`;
    }

    // 2. 3-Step Gregorian Algorithm Visual Breakdown
    // Step 1: Divisible by 4
    stepMath1.textContent = `${y} ÷ 4 = ${(y / 4).toFixed(res.div4 ? 0 : 2)} (Remainder: ${y % 4})`;
    if (res.div4) {
      stepCard1.className = 'step-rule-card step-passed';
      stepStatusIcon1.textContent = '✓ Passed';
      stepStatusIcon1.style.color = 'var(--success)';
      stepDesc1.textContent = 'Evenly divisible by 4. Proceeding to century rule check.';
    } else {
      stepCard1.className = 'step-rule-card step-failed';
      stepStatusIcon1.textContent = '✗ Failed';
      stepStatusIcon1.style.color = 'var(--error)';
      stepDesc1.textContent = 'Not divisible by 4. Disqualified; cannot be a leap year.';
    }

    // Step 2: Century Rule (divisible by 100)
    stepMath2.textContent = `${y} ÷ 100 = ${(y / 100).toFixed(res.div100 ? 0 : 2)} (Remainder: ${y % 100})`;
    if (!res.div4) {
      stepCard2.className = 'step-rule-card step-neutral';
      stepStatusIcon2.textContent = '— Skipped';
      stepStatusIcon2.style.color = 'var(--text-tertiary)';
      stepDesc2.textContent = 'Step skipped because Step 1 failed.';
    } else if (res.div100) {
      stepCard2.className = 'step-rule-card step-failed';
      stepStatusIcon2.textContent = '⚠️ Century';
      stepStatusIcon2.style.color = 'var(--warning)';
      stepDesc2.textContent = 'Century year detected! Must check 400-year exception.';
    } else {
      stepCard2.className = 'step-rule-card step-passed';
      stepStatusIcon2.textContent = '✓ Not Century';
      stepStatusIcon2.style.color = 'var(--success)';
      stepDesc2.textContent = 'Not a century year. Leap year confirmed without Step 3.';
    }

    // Step 3: Divisible by 400
    stepMath3.textContent = `${y} ÷ 400 = ${(y / 400).toFixed(res.div400 ? 0 : 2)} (Remainder: ${y % 400})`;
    if (!res.div100) {
      stepCard3.className = 'step-rule-card step-neutral';
      stepStatusIcon3.textContent = '— Not Needed';
      stepStatusIcon3.style.color = 'var(--text-tertiary)';
      stepDesc3.textContent = 'Century exception check not required for non-centurial years.';
    } else if (res.div400) {
      stepCard3.className = 'step-rule-card step-passed';
      stepStatusIcon3.textContent = '✓ Passed';
      stepStatusIcon3.style.color = 'var(--success)';
      stepDesc3.textContent = 'Divisible by 400! Special 400-year quadricentennial leap year.';
    } else {
      stepCard3.className = 'step-rule-card step-failed';
      stepStatusIcon3.textContent = '✗ Failed';
      stepStatusIcon3.style.color = 'var(--error)';
      stepDesc3.textContent = 'Century year not divisible by 400. Common year rule applies.';
    }

    // Plain English Verdict Callout
    ruleVerdictCallout.innerHTML = `
      <strong>Algorithm Verdict:</strong> ${res.reason}
    `;

    // 3. Update Calendar Metrics
    const daysInYear = res.isLeap ? 366 : 365;
    const daysInFeb = res.isLeap ? 29 : 28;
    const hoursInYear = daysInYear * 24;
    const minutesInYear = hoursInYear * 60;
    const secondsInYear = minutesInYear * 60;

    valYearDays.textContent = daysInYear.toLocaleString();
    subYearDays.textContent = res.isLeap ? 'Leap year (366 days)' : 'Common year (365 days)';

    valFebDays.textContent = daysInFeb.toString();
    const febDate = new Date(y, 1, daysInFeb);
    const febDayName = febDate.toLocaleDateString(undefined, { weekday: 'long' });
    subFebDays.textContent = `Feb ${daysInFeb} is ${febDayName}`;

    valYearHours.textContent = hoursInYear.toLocaleString();
    valYearMinutes.textContent = minutesInYear.toLocaleString();
    valYearSeconds.textContent = secondsInYear.toLocaleString();

    // 4. Update Upcoming 10 Leap Years
    renderUpcomingLeapYears(y);
  }

  // Next 10 Leap Years Generator
  function renderUpcomingLeapYears(currentYear) {
    upcomingLeapList.innerHTML = '';
    let count = 0;
    let testY = currentYear + 1;

    while (count < 10 && testY < 9999) {
      if (evaluateLeapYear(testY).isLeap) {
        const btn = document.createElement('button');
        btn.className = 'year-pill-btn is-leap-tag';
        btn.textContent = testY;
        btn.title = `Inspect ${testY}`;
        btn.addEventListener('click', () => {
          analyzeYear(testY);
          window.scrollTo({ top: 150, behavior: 'smooth' });
        });
        upcomingLeapList.appendChild(btn);
        count++;
      }
      testY++;
    }
  }

  // Multi-Year Range Explorer Routine
  function analyzeRange() {
    let start = parseInt(rangeStartYear.value, 10);
    let end = parseInt(rangeEndYear.value, 10);

    if (isNaN(start) || isNaN(end) || start < 1 || end < 1) return;
    if (start > end) {
      const tmp = start;
      start = end;
      end = tmp;
      rangeStartYear.value = start;
      rangeEndYear.value = end;
    }

    // Limit maximum span to 1000 years for seamless UI responsiveness
    if (end - start > 1000) {
      end = start + 1000;
      rangeEndYear.value = end;
    }

    const totalYears = end - start + 1;
    let leapYears = [];
    let commonCount = 0;
    let totalDays = 0;

    rangeTilesContainer.innerHTML = '';

    for (let y = start; y <= end; y++) {
      const isLeap = evaluateLeapYear(y).isLeap;
      const isCentury = (y % 100 === 0);

      if (isLeap) {
        leapYears.push(y);
        totalDays += 366;
      } else {
        commonCount++;
        totalDays += 365;
      }

      // Check filter
      let show = true;
      if (currentRangeFilter === 'leap' && !isLeap) show = false;
      if (currentRangeFilter === 'centuries' && !isCentury) show = false;

      if (show) {
        const tile = document.createElement('div');
        tile.className = `range-tile ${isLeap ? 'tile-leap' : 'tile-common'}`;
        tile.textContent = y;
        tile.title = `${y}: ${isLeap ? 'Leap Year (366 days)' : 'Common Year (365 days)'}`;
        tile.addEventListener('click', () => {
          switchToSingleYear(y);
        });
        rangeTilesContainer.appendChild(tile);
      }
    }

    // Update Range Metrics
    rangeTotalYears.textContent = totalYears.toLocaleString();
    rangeLeapCount.textContent = leapYears.length.toLocaleString();
    rangeLeapPct.textContent = `${((leapYears.length / totalYears) * 100).toFixed(1)}% of total years`;
    rangeCommonCount.textContent = commonCount.toLocaleString();
    rangeTotalDays.textContent = totalDays.toLocaleString();

    // Cache current leap list for copy
    btnCopyLeapList.onclick = () => {
      const text = `Leap Years from ${start} to ${end} (${leapYears.length} total):\n` + leapYears.join(', ');
      navigator.clipboard.writeText(text).then(() => {
        const orig = btnCopyLeapList.textContent;
        btnCopyLeapList.textContent = 'Copied!';
        btnCopyLeapList.style.color = 'var(--success)';
        setTimeout(() => {
          btnCopyLeapList.textContent = orig;
          btnCopyLeapList.style.color = '';
        }, 2000);
      });
    };
  }

  // Switch to single year view from tile click
  function switchToSingleYear(year) {
    tabSingle.classList.add('active');
    tabRange.classList.remove('active');
    viewSingleYear.style.display = 'grid';
    viewRangeExplorer.style.display = 'none';
    analyzeYear(year);
    window.scrollTo({ top: 100, behavior: 'smooth' });
  }

  // Mode Switchers
  tabSingle.addEventListener('click', () => {
    tabSingle.classList.add('active');
    tabRange.classList.remove('active');
    viewSingleYear.style.display = 'grid';
    viewRangeExplorer.style.display = 'none';
  });

  tabRange.addEventListener('click', () => {
    tabRange.classList.add('active');
    tabSingle.classList.remove('active');
    viewSingleYear.style.display = 'none';
    viewRangeExplorer.style.display = 'grid';
    analyzeRange();
  });

  // Range Filters
  function setRangeFilter(filter) {
    currentRangeFilter = filter;
    filterAll.classList.toggle('active', filter === 'all');
    filterLeapOnly.classList.toggle('active', filter === 'leap');
    filterCenturies.classList.toggle('active', filter === 'centuries');
    analyzeRange();
  }

  filterAll.addEventListener('click', () => setRangeFilter('all'));
  filterLeapOnly.addEventListener('click', () => setRangeFilter('leap'));
  filterCenturies.addEventListener('click', () => setRangeFilter('centuries'));

  // Range Presets
  btnSetRanges.forEach(btn => {
    btn.addEventListener('click', () => {
      rangeStartYear.value = btn.getAttribute('data-start');
      rangeEndYear.value = btn.getAttribute('data-end');
      analyzeRange();
    });
  });

  rangeStartYear.addEventListener('input', analyzeRange);
  rangeEndYear.addEventListener('input', analyzeRange);

  // Steppers & Quick Year Buttons
  inputYear.addEventListener('input', () => analyzeYear(inputYear.value));

  btnYearPrev10.addEventListener('click', () => analyzeYear((parseInt(inputYear.value, 10) || 2026) - 10));
  btnYearPrev1.addEventListener('click', () => analyzeYear((parseInt(inputYear.value, 10) || 2026) - 1));
  btnYearNext1.addEventListener('click', () => analyzeYear((parseInt(inputYear.value, 10) || 2026) + 1));
  btnYearNext10.addEventListener('click', () => analyzeYear((parseInt(inputYear.value, 10) || 2026) + 10));

  btnCurrentYear.addEventListener('click', () => analyzeYear(new Date().getFullYear()));
  btnRandomYear.addEventListener('click', () => {
    const rand = Math.floor(Math.random() * (2200 - 1800 + 1)) + 1800;
    analyzeYear(rand);
  });

  btnSetYears.forEach(btn => {
    btn.addEventListener('click', () => {
      const y = parseInt(btn.getAttribute('data-year'), 10);
      switchToSingleYear(y);
    });
  });

  // Initial Run
  analyzeYear(2026);
});