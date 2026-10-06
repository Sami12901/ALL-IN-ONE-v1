// Date Difference Calculator - Complete Client-Side Engine
document.addEventListener('DOMContentLoaded', () => {
  // DOM Elements
  const startDateInput = document.getElementById('start-date');
  const endDateInput = document.getElementById('end-date');
  const startDayText = document.getElementById('start-day-text');
  const endDayText = document.getElementById('end-day-text');
  
  const btnStartToday = document.getElementById('btn-start-today');
  const btnEndToday = document.getElementById('btn-end-today');
  const btnSwapDates = document.getElementById('btn-swap-dates');
  
  const btnPresetMonth = document.getElementById('btn-preset-month');
  const btnPresetYear = document.getElementById('btn-preset-year');
  const btnPreset30 = document.getElementById('btn-preset-30');
  const btnPreset90 = document.getElementById('btn-preset-90');
  const btnPreset365 = document.getElementById('btn-preset-365');
  
  const toggleIncludeEnd = document.getElementById('toggle-include-end');
  const toggleBusinessOnly = document.getElementById('toggle-business-only');
  
  const heroStatusBadge = document.getElementById('hero-status-badge');
  const heroMainDiff = document.getElementById('hero-main-diff');
  const heroSubDiff = document.getElementById('hero-sub-diff');
  const btnCopySummary = document.getElementById('btn-copy-summary');
  const copyTextSpan = document.getElementById('copy-text');
  
  const valTotalDays = document.getElementById('val-total-days');
  const subTotalDays = document.getElementById('sub-total-days');
  const valBusinessDays = document.getElementById('val-business-days');
  const subBusinessDays = document.getElementById('sub-business-days');
  const valWeeksDays = document.getElementById('val-weeks-days');
  const subWeeksDays = document.getElementById('sub-weeks-days');
  const valWeekendDays = document.getElementById('val-weekend-days');
  const valTotalHours = document.getElementById('val-total-hours');
  const valTotalMinutes = document.getElementById('val-total-minutes');
  const subTotalSeconds = document.getElementById('sub-total-seconds');
  
  const barLabelBusiness = document.getElementById('bar-label-business');
  const barLabelWeekend = document.getElementById('bar-label-weekend');
  const businessBarFill = document.getElementById('business-bar-fill');
  
  // Milestone elements
  const msNewYearTitle = document.getElementById('ms-new-year-title');
  const msNewYearDate = document.getElementById('ms-new-year-date');
  const msNewYearDays = document.getElementById('ms-new-year-days');
  const msFridayDate = document.getElementById('ms-friday-date');
  const msFridayDays = document.getElementById('ms-friday-days');
  const msWeekendDate = document.getElementById('ms-weekend-date');
  const msWeekendDays = document.getElementById('ms-weekend-days');
  const msMonthTitle = document.getElementById('ms-month-title');
  const msMonthDate = document.getElementById('ms-month-date');
  const msMonthDays = document.getElementById('ms-month-days');
  const btnMilestones = document.querySelectorAll('.btn-set-milestone');

  // Helper: Format Date to YYYY-MM-DD
  function toDateString(d) {
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  // Helper: Parse YYYY-MM-DD as local midnight date
  function parseLocalDate(str) {
    if (!str) return null;
    const parts = str.split('-').map(Number);
    if (parts.length !== 3 || isNaN(parts[0]) || isNaN(parts[1]) || isNaN(parts[2])) return null;
    return new Date(parts[0], parts[1] - 1, parts[2]);
  }

  // Format readable weekday & date
  function formatFriendlyDate(d) {
    if (!d) return '';
    return d.toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'short', day: 'numeric' });
  }

  // Initialize Default Dates
  const now = new Date();
  startDateInput.value = toDateString(now);
  const defaultEnd = new Date(now);
  defaultEnd.setDate(defaultEnd.getDate() + 30);
  endDateInput.value = toDateString(defaultEnd);

  // Exact calendar difference: years, months, days
  function getExactYMD(d1, d2) {
    let start = new Date(d1);
    let end = new Date(d2);

    let years = end.getFullYear() - start.getFullYear();
    let months = end.getMonth() - start.getMonth();
    let days = end.getDate() - start.getDate();

    if (days < 0) {
      months--;
      // Get days in preceding month of end date
      const prevMonthLast = new Date(end.getFullYear(), end.getMonth(), 0).getDate();
      days += prevMonthLast;
    }

    if (months < 0) {
      years--;
      months += 12;
    }

    return { years, months, days };
  }

  // Calculate Business Days and Weekend Days
  function countBusinessAndWeekendDays(start, end, inclusive) {
    let businessDays = 0;
    let weekendDays = 0;
    let curr = new Date(start);

    // If inclusive, loop <= end, else loop < end
    while (inclusive ? curr <= end : curr < end) {
      const day = curr.getDay();
      if (day === 0 || day === 6) {
        weekendDays++;
      } else {
        businessDays++;
      }
      curr.setDate(curr.getDate() + 1);
    }

    return { businessDays, weekendDays };
  }

  // Main Calculation Routine
  function calculateDifference() {
    const rawStart = parseLocalDate(startDateInput.value);
    const rawEnd = parseLocalDate(endDateInput.value);

    if (!rawStart || !rawEnd) {
      heroMainDiff.textContent = 'Please select valid dates';
      heroSubDiff.textContent = '';
      return;
    }

    startDayText.textContent = formatFriendlyDate(rawStart);
    endDayText.textContent = formatFriendlyDate(rawEnd);

    const isInclusive = toggleIncludeEnd.checked;
    const isBusinessOnly = toggleBusinessOnly.checked;

    let d1 = new Date(rawStart);
    let d2 = new Date(rawEnd);
    let isReversed = false;

    if (d1.getTime() > d2.getTime()) {
      isReversed = true;
      const tmp = d1;
      d1 = d2;
      d2 = tmp;
    }

    // Inclusive adjustment for calendar interval
    let calcEnd = new Date(d2);
    if (isInclusive) {
      calcEnd.setDate(calcEnd.getDate() + 1);
    }

    // Exact YMD
    const ymd = getExactYMD(d1, calcEnd);

    // Day calculations
    const msDiff = d2.getTime() - d1.getTime();
    let totalDays = Math.round(msDiff / (1000 * 60 * 60 * 24));
    if (isInclusive) {
      totalDays += 1;
    }

    const { businessDays, weekendDays } = countBusinessAndWeekendDays(d1, d2, isInclusive);

    // Weeks calculation
    const effectiveDays = isBusinessOnly ? businessDays : totalDays;
    const weeks = Math.floor(effectiveDays / 7);
    const remainingDays = effectiveDays % 7;

    // Time calculations
    const hours = effectiveDays * 24;
    const minutes = hours * 60;
    const seconds = minutes * 60;

    // Format Hero Display
    heroStatusBadge.textContent = isReversed ? 'Reverse Interval (Past)' : (isInclusive ? 'Inclusive Interval' : 'Standard Interval');
    heroStatusBadge.style.background = isReversed ? 'rgba(239, 68, 68, 0.15)' : 'rgba(78, 133, 191, 0.15)';
    heroStatusBadge.style.color = isReversed ? 'var(--error)' : 'var(--accent)';

    const parts = [];
    if (ymd.years > 0) parts.push(`${ymd.years} ${ymd.years === 1 ? 'Year' : 'Years'}`);
    if (ymd.months > 0) parts.push(`${ymd.months} ${ymd.months === 1 ? 'Month' : 'Months'}`);
    if (ymd.days > 0 || parts.length === 0) parts.push(`${ymd.days} ${ymd.days === 1 ? 'Day' : 'Days'}`);

    const intervalString = parts.join(', ');
    heroMainDiff.innerHTML = `${isReversed ? '− ' : ''}<span class="highlight">${intervalString}</span>`;
    
    if (isBusinessOnly) {
      heroSubDiff.textContent = `or ${businessDays.toLocaleString()} business days (${weekendDays.toLocaleString()} weekend days excluded)`;
    } else {
      heroSubDiff.textContent = `or ${totalDays.toLocaleString()} calendar days total (${weeks} weeks, ${remainingDays} days)`;
    }

    // Update Metric Cards
    valTotalDays.textContent = totalDays.toLocaleString();
    subTotalDays.textContent = isInclusive ? 'inclusive of end date' : 'exclusive of end date';

    valBusinessDays.textContent = businessDays.toLocaleString();
    subBusinessDays.textContent = `${((businessDays / (totalDays || 1)) * 100).toFixed(0)}% of total period`;

    valWeeksDays.textContent = `${weeks}w ${remainingDays}d`;
    subWeeksDays.textContent = `${weeks.toLocaleString()} full weeks`;

    valWeekendDays.textContent = weekendDays.toLocaleString();

    valTotalHours.textContent = hours.toLocaleString();
    valTotalMinutes.textContent = minutes.toLocaleString();
    subTotalSeconds.textContent = `${seconds.toLocaleString()} seconds`;

    // Progress bar
    barLabelBusiness.textContent = `Business Days: ${businessDays.toLocaleString()}`;
    barLabelWeekend.textContent = `Weekends: ${weekendDays.toLocaleString()}`;
    const busPercent = totalDays > 0 ? Math.round((businessDays / totalDays) * 100) : 0;
    businessBarFill.style.width = `${busPercent}%`;
  }

  // Update Milestone Countdown Cards
  function updateMilestones() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // 1. Next New Year
    const currentYear = today.getFullYear();
    const nextNewYear = new Date(currentYear + 1, 0, 1);
    const msNewYearDiff = Math.ceil((nextNewYear - today) / (1000 * 60 * 60 * 24));
    msNewYearTitle.textContent = `New Year ${currentYear + 1}`;
    msNewYearDate.textContent = formatFriendlyDate(nextNewYear);
    msNewYearDays.textContent = msNewYearDiff.toLocaleString();

    // 2. Next Friday
    const nextFriday = new Date(today);
    const dayOfWeek = today.getDay(); // 0 is Sun, 5 is Fri
    let daysToFriday = (5 - dayOfWeek + 7) % 7;
    if (daysToFriday === 0) daysToFriday = 7; // next week's friday if today is friday
    nextFriday.setDate(today.getDate() + daysToFriday);
    msFridayDate.textContent = formatFriendlyDate(nextFriday);
    msFridayDays.textContent = daysToFriday.toString();

    // 3. Next Weekend (Saturday)
    const nextSaturday = new Date(today);
    let daysToSat = (6 - dayOfWeek + 7) % 7;
    if (daysToSat === 0) daysToSat = 7;
    nextSaturday.setDate(today.getDate() + daysToSat);
    msWeekendDate.textContent = formatFriendlyDate(nextSaturday);
    msWeekendDays.textContent = daysToSat.toString();

    // 4. Next 1st of Month
    const nextMonthFirst = new Date(today.getFullYear(), today.getMonth() + 1, 1);
    const daysToMonth = Math.ceil((nextMonthFirst - today) / (1000 * 60 * 60 * 24));
    const nextMonthName = nextMonthFirst.toLocaleDateString(undefined, { month: 'long', year: 'numeric' });
    msMonthTitle.textContent = nextMonthName;
    msMonthDate.textContent = formatFriendlyDate(nextMonthFirst);
    msMonthDays.textContent = daysToMonth.toString();
  }

  // Set Milestone as End Date Handler
  btnMilestones.forEach(btn => {
    btn.addEventListener('click', () => {
      const target = btn.getAttribute('data-target');
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      let targetDate = new Date(today);

      if (target === 'newyear') {
        targetDate = new Date(today.getFullYear() + 1, 0, 1);
      } else if (target === 'friday') {
        let diff = (5 - today.getDay() + 7) % 7;
        if (diff === 0) diff = 7;
        targetDate.setDate(today.getDate() + diff);
      } else if (target === 'weekend') {
        let diff = (6 - today.getDay() + 7) % 7;
        if (diff === 0) diff = 7;
        targetDate.setDate(today.getDate() + diff);
      } else if (target === 'nextmonth') {
        targetDate = new Date(today.getFullYear(), today.getMonth() + 1, 1);
      }

      startDateInput.value = toDateString(today);
      endDateInput.value = toDateString(targetDate);
      calculateDifference();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  });

  // Action Buttons
  btnStartToday.addEventListener('click', () => {
    startDateInput.value = toDateString(new Date());
    calculateDifference();
  });

  btnEndToday.addEventListener('click', () => {
    endDateInput.value = toDateString(new Date());
    calculateDifference();
  });

  btnSwapDates.addEventListener('click', () => {
    const tmp = startDateInput.value;
    startDateInput.value = endDateInput.value;
    endDateInput.value = tmp;
    calculateDifference();
  });

  // Presets
  btnPresetMonth.addEventListener('click', () => {
    const t = new Date();
    const firstDay = new Date(t.getFullYear(), t.getMonth(), 1);
    startDateInput.value = toDateString(firstDay);
    endDateInput.value = toDateString(t);
    calculateDifference();
  });

  btnPresetYear.addEventListener('click', () => {
    const t = new Date();
    const firstDay = new Date(t.getFullYear(), 0, 1);
    startDateInput.value = toDateString(firstDay);
    endDateInput.value = toDateString(t);
    calculateDifference();
  });

  function addDaysToStart(days) {
    const start = parseLocalDate(startDateInput.value) || new Date();
    const target = new Date(start);
    target.setDate(target.getDate() + days);
    endDateInput.value = toDateString(target);
    calculateDifference();
  }

  btnPreset30.addEventListener('click', () => addDaysToStart(30));
  btnPreset90.addEventListener('click', () => addDaysToStart(90));
  btnPreset365.addEventListener('click', () => addDaysToStart(365));

  // Toggles & Input change listeners
  startDateInput.addEventListener('input', calculateDifference);
  endDateInput.addEventListener('input', calculateDifference);
  toggleIncludeEnd.addEventListener('change', calculateDifference);
  toggleBusinessOnly.addEventListener('change', calculateDifference);

  // Copy Summary Clipboard
  btnCopySummary.addEventListener('click', () => {
    const start = startDateInput.value;
    const end = endDateInput.value;
    const summary = [
      `Date Difference Summary`,
      `-----------------------`,
      `Start Date: ${formatFriendlyDate(parseLocalDate(start))} (${start})`,
      `End Date:   ${formatFriendlyDate(parseLocalDate(end))} (${end})`,
      `Interval:   ${heroMainDiff.textContent.trim()}`,
      `Total Days: ${valTotalDays.textContent} calendar days`,
      `Business Days: ${valBusinessDays.textContent} days (excluding weekends)`,
      `Weeks:      ${valWeeksDays.textContent}`,
      `Elapsed:    ${valTotalHours.textContent} hours (${valTotalMinutes.textContent} minutes)`
    ].join('\n');

    navigator.clipboard.writeText(summary).then(() => {
      copyTextSpan.textContent = 'Copied!';
      btnCopySummary.style.color = 'var(--success)';
      setTimeout(() => {
        copyTextSpan.textContent = 'Copy Summary';
        btnCopySummary.style.color = '';
      }, 2000);
    }).catch(() => {
      copyTextSpan.textContent = 'Failed';
      setTimeout(() => { copyTextSpan.textContent = 'Copy Summary'; }, 2000);
    });
  });

  // Initial runs
  calculateDifference();
  updateMilestones();
});