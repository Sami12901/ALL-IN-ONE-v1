// Date Offset Calculator - Complete Client-Side Engine
document.addEventListener('DOMContentLoaded', () => {
  // DOM Elements
  const btnOpAdd = document.getElementById('btn-op-add');
  const btnOpSub = document.getElementById('btn-op-sub');
  const startDateInput = document.getElementById('start-date');
  const startDayText = document.getElementById('start-day-text');
  const btnToday = document.getElementById('btn-today');
  
  const offsetYearsInput = document.getElementById('offset-years');
  const offsetMonthsInput = document.getElementById('offset-months');
  const offsetWeeksInput = document.getElementById('offset-weeks');
  const offsetDaysInput = document.getElementById('offset-days');
  const stepperBtns = document.querySelectorAll('.stepper-btn');
  const toggleBusinessDays = document.getElementById('toggle-business-days');
  
  const resultOpLabel = document.getElementById('result-op-label');
  const targetDateTitle = document.getElementById('target-date-title');
  const targetCountdownBadge = document.getElementById('target-countdown-badge');
  const metaDayOfYear = document.getElementById('meta-day-of-year');
  const metaWeekNum = document.getElementById('meta-week-num');
  const metaQuarter = document.getElementById('meta-quarter');
  const metaLeapYear = document.getElementById('meta-leap-year');
  
  const btnCopyIso = document.getElementById('btn-copy-iso');
  const btnCopyLong = document.getElementById('btn-copy-long');
  
  // Calendar DOM Elements
  const calPrevMonth = document.getElementById('cal-prev-month');
  const calNextMonth = document.getElementById('cal-next-month');
  const calMonthTitle = document.getElementById('cal-month-title');
  const calDaysGrid = document.getElementById('cal-days-grid');
  const calJumpTarget = document.getElementById('cal-jump-target');
  
  const quickPresets = document.querySelectorAll('.btn-quick-preset');

  // State
  let currentOp = 'add'; // 'add' | 'sub'
  let targetDate = new Date();
  let calendarViewDate = new Date(); // Month currently viewed in mini calendar

  // Helpers
  function toDateString(d) {
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  function parseLocalDate(str) {
    if (!str) return null;
    const parts = str.split('-').map(Number);
    if (parts.length !== 3 || isNaN(parts[0]) || isNaN(parts[1]) || isNaN(parts[2])) return null;
    return new Date(parts[0], parts[1] - 1, parts[2]);
  }

  function formatFriendlyDate(d) {
    if (!d) return '';
    return d.toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  }

  function isLeapYear(y) {
    return (y % 4 === 0 && y % 100 !== 0) || (y % 400 === 0);
  }

  function getDayOfYear(d) {
    const start = new Date(d.getFullYear(), 0, 0);
    const diff = d - start;
    const oneDay = 1000 * 60 * 60 * 24;
    return Math.floor(diff / oneDay);
  }

  function getISOWeek(d) {
    const date = new Date(d.getTime());
    date.setHours(0, 0, 0, 0);
    // Thursday in current week decides the year.
    date.setDate(date.getDate() + 3 - (date.getDay() + 6) % 7);
    // January 4 is always in week 1.
    const week1 = new Date(date.getFullYear(), 0, 4);
    // Adjust to Thursday in week 1 and count number of weeks from date to week1.
    return 1 + Math.round(((date.getTime() - week1.getTime()) / 86400000 - 3 + (week1.getDay() + 6) % 7) / 7);
  }

  // Safe Month & Year offset with end-of-month clamp
  function addMonthsSafe(d, months) {
    const originalDay = d.getDate();
    d.setMonth(d.getMonth() + months);
    if (d.getDate() !== originalDay) {
      d.setDate(0); // clamps to last day of target month
    }
  }

  // Safe Year offset
  function addYearsSafe(d, years) {
    const originalMonth = d.getMonth();
    d.setFullYear(d.getFullYear() + years);
    if (d.getMonth() !== originalMonth) {
      d.setDate(0);
    }
  }

  // Initialize
  const now = new Date();
  startDateInput.value = toDateString(now);

  // Stepper Buttons (+ and -)
  stepperBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const targetId = btn.getAttribute('data-target');
      const delta = parseInt(btn.getAttribute('data-delta'), 10);
      const input = document.getElementById(targetId);
      if (input) {
        let val = Math.max(0, (parseInt(input.value, 10) || 0) + delta);
        input.value = val;
        calculateTargetDate();
      }
    });
  });

  // Operation Switcher
  function setOperation(op) {
    currentOp = op;
    if (op === 'add') {
      btnOpAdd.classList.add('active');
      btnOpSub.classList.remove('active');
      resultOpLabel.textContent = 'Target Date (+ Offset)';
      resultOpLabel.style.color = 'var(--accent)';
      resultOpLabel.style.background = 'rgba(78, 133, 191, 0.2)';
    } else {
      btnOpSub.classList.add('active');
      btnOpAdd.classList.remove('active');
      resultOpLabel.textContent = 'Target Date (− Offset)';
      resultOpLabel.style.color = 'var(--warning)';
      resultOpLabel.style.background = 'rgba(245, 158, 11, 0.2)';
    }
    calculateTargetDate();
  }

  btnOpAdd.addEventListener('click', () => setOperation('add'));
  btnOpSub.addEventListener('click', () => setOperation('sub'));

  // Presets
  quickPresets.forEach(btn => {
    btn.addEventListener('click', () => {
      if (btn.hasAttribute('data-clear')) {
        offsetYearsInput.value = 0;
        offsetMonthsInput.value = 0;
        offsetWeeksInput.value = 0;
        offsetDaysInput.value = 0;
      } else if (btn.hasAttribute('data-days')) {
        offsetYearsInput.value = 0;
        offsetMonthsInput.value = 0;
        offsetWeeksInput.value = 0;
        offsetDaysInput.value = parseInt(btn.getAttribute('data-days'), 10);
      } else if (btn.hasAttribute('data-years')) {
        offsetYearsInput.value = parseInt(btn.getAttribute('data-years'), 10);
        offsetMonthsInput.value = 0;
        offsetWeeksInput.value = 0;
        offsetDaysInput.value = 0;
      }
      calculateTargetDate();
    });
  });

  // Calculate Target Date Logic
  function calculateTargetDate() {
    const rawStart = parseLocalDate(startDateInput.value);
    if (!rawStart) {
      targetDateTitle.textContent = 'Invalid start date';
      return;
    }

    startDayText.textContent = formatFriendlyDate(rawStart);

    const years = Math.max(0, parseInt(offsetYearsInput.value, 10) || 0);
    const months = Math.max(0, parseInt(offsetMonthsInput.value, 10) || 0);
    const weeks = Math.max(0, parseInt(offsetWeeksInput.value, 10) || 0);
    const days = Math.max(0, parseInt(offsetDaysInput.value, 10) || 0);
    const isBusinessOnly = toggleBusinessDays.checked;

    let res = new Date(rawStart);

    if (currentOp === 'add') {
      // Step 1: Add Years and Months
      if (years > 0) addYearsSafe(res, years);
      if (months > 0) addMonthsSafe(res, months);

      // Step 2: Add Weeks and Days
      if (isBusinessOnly) {
        let remainingBusinessDays = (weeks * 5) + days;
        while (remainingBusinessDays > 0) {
          res.setDate(res.getDate() + 1);
          const dow = res.getDay();
          if (dow !== 0 && dow !== 6) {
            remainingBusinessDays--;
          }
        }
      } else {
        const totalDays = (weeks * 7) + days;
        res.setDate(res.getDate() + totalDays);
      }
    } else {
      // Subtract
      if (isBusinessOnly) {
        let remainingBusinessDays = (weeks * 5) + days;
        while (remainingBusinessDays > 0) {
          res.setDate(res.getDate() - 1);
          const dow = res.getDay();
          if (dow !== 0 && dow !== 6) {
            remainingBusinessDays--;
          }
        }
      } else {
        const totalDays = (weeks * 7) + days;
        res.setDate(res.getDate() - totalDays);
      }

      if (months > 0) addMonthsSafe(res, -months);
      if (years > 0) addYearsSafe(res, -years);
    }

    targetDate = res;
    calendarViewDate = new Date(res);

    // Update Hero Display
    targetDateTitle.textContent = formatFriendlyDate(targetDate);

    // Countdown / Delta from today
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const diffFromToday = Math.round((targetDate - today) / (1000 * 60 * 60 * 24));

    if (diffFromToday === 0) {
      targetCountdownBadge.textContent = 'Target date is Today!';
    } else if (diffFromToday > 0) {
      targetCountdownBadge.textContent = `In ${diffFromToday.toLocaleString()} day${diffFromToday === 1 ? '' : 's'} from today`;
    } else {
      const absDiff = Math.abs(diffFromToday);
      targetCountdownBadge.textContent = `${absDiff.toLocaleString()} day${absDiff === 1 ? '' : 's'} ago relative to today`;
    }

    // Target Date Metadata
    const totalDaysInYear = isLeapYear(targetDate.getFullYear()) ? 366 : 365;
    metaDayOfYear.textContent = `Day ${getDayOfYear(targetDate)} of ${totalDaysInYear}`;
    metaWeekNum.textContent = `ISO Week ${getISOWeek(targetDate)}`;
    const quarter = Math.floor(targetDate.getMonth() / 3) + 1;
    metaQuarter.textContent = `Quarter Q${quarter}`;
    metaLeapYear.textContent = isLeapYear(targetDate.getFullYear()) ? `${targetDate.getFullYear()} (Leap Year)` : `${targetDate.getFullYear()} (Common Year)`;

    // Render Mini Calendar
    renderCalendar();
  }

  // Render Mini Calendar Grid
  function renderCalendar() {
    const year = calendarViewDate.getFullYear();
    const month = calendarViewDate.getMonth();

    // Month Title
    calMonthTitle.textContent = calendarViewDate.toLocaleDateString(undefined, { month: 'long', year: 'numeric' });

    // Days in current view month
    const firstDayIndex = new Date(year, month, 1).getDay(); // 0 = Sun
    const lastDayOfMonth = new Date(year, month + 1, 0).getDate();

    calDaysGrid.innerHTML = '';

    // Empty cells for preceding month
    for (let i = 0; i < firstDayIndex; i++) {
      const emptyCell = document.createElement('div');
      emptyCell.className = 'cal-day empty';
      calDaysGrid.appendChild(emptyCell);
    }

    const todayStr = toDateString(new Date());
    const startStr = startDateInput.value;
    const targetStr = toDateString(targetDate);

    // Days of current month
    for (let d = 1; d <= lastDayOfMonth; d++) {
      const cellDate = new Date(year, month, d);
      const cellStr = toDateString(cellDate);
      const dayCell = document.createElement('div');
      dayCell.className = 'cal-day';
      dayCell.textContent = d;

      const dow = cellDate.getDay();
      if (dow === 0 || dow === 6) {
        dayCell.classList.add('is-weekend');
      }

      if (cellStr === targetStr) {
        dayCell.classList.add('is-target');
      }
      if (cellStr === startStr) {
        dayCell.classList.add('is-start');
        dayCell.title = 'Start Date';
      }
      if (cellStr === todayStr) {
        dayCell.classList.add('is-today');
      }

      // Clicking a day in calendar sets it as new target and computes offset
      dayCell.addEventListener('click', () => {
        const start = parseLocalDate(startDateInput.value);
        if (start) {
          const diffDays = Math.round((cellDate - start) / (1000 * 60 * 60 * 24));
          if (diffDays >= 0) {
            setOperation('add');
            offsetYearsInput.value = 0;
            offsetMonthsInput.value = 0;
            offsetWeeksInput.value = 0;
            offsetDaysInput.value = diffDays;
          } else {
            setOperation('sub');
            offsetYearsInput.value = 0;
            offsetMonthsInput.value = 0;
            offsetWeeksInput.value = 0;
            offsetDaysInput.value = Math.abs(diffDays);
          }
          toggleBusinessDays.checked = false;
          calculateTargetDate();
        }
      });

      calDaysGrid.appendChild(dayCell);
    }
  }

  // Calendar Month Navigation
  calPrevMonth.addEventListener('click', () => {
    calendarViewDate.setMonth(calendarViewDate.getMonth() - 1);
    renderCalendar();
  });

  calNextMonth.addEventListener('click', () => {
    calendarViewDate.setMonth(calendarViewDate.getMonth() + 1);
    renderCalendar();
  });

  calJumpTarget.addEventListener('click', () => {
    calendarViewDate = new Date(targetDate);
    renderCalendar();
  });

  // Inputs Listeners
  startDateInput.addEventListener('input', calculateTargetDate);
  offsetYearsInput.addEventListener('input', calculateTargetDate);
  offsetMonthsInput.addEventListener('input', calculateTargetDate);
  offsetWeeksInput.addEventListener('input', calculateTargetDate);
  offsetDaysInput.addEventListener('input', calculateTargetDate);
  toggleBusinessDays.addEventListener('change', calculateTargetDate);

  btnToday.addEventListener('click', () => {
    startDateInput.value = toDateString(new Date());
    calculateTargetDate();
  });

  // Copy Buttons
  function flashButton(btn, text) {
    const orig = btn.textContent;
    btn.textContent = text;
    btn.style.color = 'var(--success)';
    setTimeout(() => {
      btn.textContent = orig;
      btn.style.color = '';
    }, 2000);
  }

  btnCopyIso.addEventListener('click', () => {
    const iso = toDateString(targetDate);
    navigator.clipboard.writeText(iso).then(() => flashButton(btnCopyIso, 'Copied!'));
  });

  btnCopyLong.addEventListener('click', () => {
    const formatted = formatFriendlyDate(targetDate);
    navigator.clipboard.writeText(formatted).then(() => flashButton(btnCopyLong, 'Copied!'));
  });

  // Initial Calculation
  calculateTargetDate();
});