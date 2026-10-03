// Epoch Unix Converter - Client-Side Logic
document.addEventListener('DOMContentLoaded', () => {
  // --- DOM Elements: Live Clock ---
  const liveSecEl = document.getElementById('live-epoch-sec');
  const liveMsEl = document.getElementById('live-epoch-ms');
  const liveUtcPreviewEl = document.getElementById('live-utc-preview');
  const liveLocalPreviewEl = document.getElementById('live-local-preview');
  const copyLiveSecBtn = document.getElementById('copy-live-sec');
  const copyLiveMsBtn = document.getElementById('copy-live-ms');

  // --- DOM Elements: Timestamp to Date ---
  const inputTs = document.getElementById('input-timestamp');
  const selectUnit = document.getElementById('select-unit');
  const btnConvertTs = document.getElementById('btn-convert-timestamp');
  const btnUseNowTs = document.getElementById('btn-use-now-ts');
  const btnClearTs = document.getElementById('btn-clear-ts');
  const tsError = document.getElementById('ts-error');
  const tsResults = document.getElementById('ts-results');
  const tsDetectedBadge = document.getElementById('ts-detected-badge');
  const btnCopyAllTs = document.getElementById('btn-copy-all-ts');

  const resUtc = document.getElementById('res-utc');
  const resLocal = document.getElementById('res-local');
  const resRelative = document.getElementById('res-relative');
  const resIso = document.getElementById('res-iso');
  const resExtra = document.getElementById('res-extra');

  // --- DOM Elements: Date to Timestamp ---
  const inputYear = document.getElementById('date-year');
  const inputMonth = document.getElementById('date-month');
  const inputDay = document.getElementById('date-day');
  const inputHour = document.getElementById('date-hour');
  const inputMinute = document.getElementById('date-minute');
  const inputSecond = document.getElementById('date-second');
  const tzLocalRadio = document.getElementById('tz-local');
  const tzUtcRadio = document.getElementById('tz-utc');
  const btnConvertDate = document.getElementById('btn-convert-date');
  const btnSetNow = document.getElementById('btn-set-now');
  const btnClearDate = document.getElementById('btn-clear-date');
  const dateError = document.getElementById('date-error');
  const dateResults = document.getElementById('date-results');

  const resDateSec = document.getElementById('res-date-sec');
  const resDateMs = document.getElementById('res-date-ms');
  const resDateIso = document.getElementById('res-date-iso');
  const resDateRfc = document.getElementById('res-date-rfc');
  const copyResSec = document.getElementById('copy-res-sec');
  const copyResMs = document.getElementById('copy-res-ms');

  // --- DOM Elements: Milestones Table ---
  const milestonesBody = document.getElementById('milestones-body');

  // ==========================================
  // 1. Live Ticking Epoch Clock
  // ==========================================
  function updateLiveClock() {
    const now = new Date();
    const ms = now.getTime();
    const sec = Math.floor(ms / 1000);

    if (liveSecEl) liveSecEl.textContent = sec.toString();
    if (liveMsEl) liveMsEl.textContent = ms.toString();
    if (liveUtcPreviewEl) liveUtcPreviewEl.textContent = `UTC: ${now.toUTCString()}`;
    if (liveLocalPreviewEl) {
      liveLocalPreviewEl.textContent = `Local: ${now.toLocaleString()} (${Intl.DateTimeFormat().resolvedOptions().timeZone || 'Local'})`;
    }
  }

  updateLiveClock();
  setInterval(updateLiveClock, 50);

  function handleCopy(button, textToCopy) {
    if (!textToCopy) return;
    navigator.clipboard.writeText(textToCopy).then(() => {
      const original = button.textContent;
      button.textContent = 'Copied!';
      button.classList.add('copied');
      setTimeout(() => {
        button.textContent = original;
        button.classList.remove('copied');
      }, 1800);
    }).catch(err => {
      console.error('Clipboard copy failed:', err);
    });
  }

  if (copyLiveSecBtn) {
    copyLiveSecBtn.addEventListener('click', () => {
      handleCopy(copyLiveSecBtn, liveSecEl.textContent);
    });
  }
  if (copyLiveMsBtn) {
    copyLiveMsBtn.addEventListener('click', () => {
      handleCopy(copyLiveMsBtn, liveMsEl.textContent);
    });
  }

  // ==========================================
  // 2. Relative Time Helper
  // ==========================================
  function getRelativeTimeString(date) {
    const diffMs = date.getTime() - Date.now();
    const isFuture = diffMs > 0;
    const absSeconds = Math.round(Math.abs(diffMs) / 1000);

    if (absSeconds < 5) return 'just now';

    const intervals = [
      { label: 'year', seconds: 31536000 },
      { label: 'month', seconds: 2592000 },
      { label: 'week', seconds: 604800 },
      { label: 'day', seconds: 86400 },
      { label: 'hour', seconds: 3600 },
      { label: 'minute', seconds: 60 },
      { label: 'second', seconds: 1 }
    ];

    for (const interval of intervals) {
      const count = Math.floor(absSeconds / interval.seconds);
      if (count >= 1) {
        const plural = count === 1 ? interval.label : `${interval.label}s`;
        return isFuture ? `in ${count} ${plural}` : `${count} ${plural} ago`;
      }
    }
    return 'just now';
  }

  // Day of year & ISO week calculation
  function getExtraDateDetails(date) {
    const start = new Date(Date.UTC(date.getUTCFullYear(), 0, 1));
    const diff = date.getTime() - start.getTime() + ((start.getTimezoneOffset() - date.getTimezoneOffset()) * 60000);
    const dayOfYear = Math.floor(diff / 86400000) + 1;

    // ISO week number
    const target = new Date(date.valueOf());
    const dayNr = (date.getUTCDay() + 6) % 7;
    target.setUTCDate(target.getUTCDate() - dayNr + 3);
    const firstThursday = target.valueOf();
    target.setUTCMonth(0, 1);
    if (target.getUTCDay() !== 4) {
      target.setUTCMonth(0, 1 + ((4 - target.getUTCDay()) + 7) % 7);
    }
    const weekNr = 1 + Math.ceil((firstThursday - target) / 604800000);

    const year = date.getUTCFullYear();
    const isLeap = (year % 4 === 0 && year % 100 !== 0) || (year % 400 === 0);

    return `Day ${dayOfYear} of ${year} | Week ${weekNr} | ${isLeap ? 'Leap Year' : 'Common Year'}`;
  }

  // ==========================================
  // 3. Tool 1: Timestamp to Human Date
  // ==========================================
  function convertTimestamp() {
    tsError.style.display = 'none';
    tsResults.style.display = 'none';

    const raw = (inputTs.value || '').trim();
    if (!raw) {
      tsError.textContent = 'Please enter a Unix timestamp.';
      tsError.style.display = 'block';
      return;
    }

    // Support negative numbers for dates before 1970
    if (!/^-?\d+(\.\d+)?$/.test(raw)) {
      tsError.textContent = 'Invalid timestamp. Must be a numeric value.';
      tsError.style.display = 'block';
      return;
    }

    const num = parseFloat(raw);
    const selectedMode = selectUnit.value;
    let msValue;
    let detectedText = '';

    const digits = raw.replace('-', '').split('.')[0].length;

    if (selectedMode === 'auto') {
      if (digits <= 11) {
        msValue = num * 1000;
        detectedText = 'Auto-Detected: Seconds';
      } else if (digits <= 14) {
        msValue = num;
        detectedText = 'Auto-Detected: Milliseconds';
      } else if (digits <= 17) {
        msValue = num / 1000;
        detectedText = 'Auto-Detected: Microseconds';
      } else {
        msValue = num / 1000000;
        detectedText = 'Auto-Detected: Nanoseconds';
      }
    } else if (selectedMode === 's') {
      msValue = num * 1000;
      detectedText = 'Unit: Seconds';
    } else if (selectedMode === 'ms') {
      msValue = num;
      detectedText = 'Unit: Milliseconds';
    } else if (selectedMode === 'us') {
      msValue = num / 1000;
      detectedText = 'Unit: Microseconds';
    } else if (selectedMode === 'ns') {
      msValue = num / 1000000;
      detectedText = 'Unit: Nanoseconds';
    }

    const date = new Date(msValue);
    if (isNaN(date.getTime())) {
      tsError.textContent = 'Out-of-range timestamp could not be parsed into a valid Date.';
      tsError.style.display = 'block';
      return;
    }

    tsDetectedBadge.textContent = detectedText;
    resUtc.textContent = date.toUTCString();
    resLocal.textContent = `${date.toLocaleString()} (${Intl.DateTimeFormat().resolvedOptions().timeZone || 'Local'})`;
    resRelative.textContent = getRelativeTimeString(date);
    resIso.textContent = date.toISOString();
    resExtra.textContent = getExtraDateDetails(date);

    tsResults.style.display = 'flex';
  }

  btnConvertTs.addEventListener('click', convertTimestamp);

  inputTs.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      convertTimestamp();
    }
  });

  btnUseNowTs.addEventListener('click', () => {
    inputTs.value = Math.floor(Date.now() / 1000).toString();
    selectUnit.value = 'auto';
    convertTimestamp();
  });

  btnClearTs.addEventListener('click', () => {
    inputTs.value = '';
    tsError.style.display = 'none';
    tsResults.style.display = 'none';
    inputTs.focus();
  });

  if (btnCopyAllTs) {
    btnCopyAllTs.addEventListener('click', () => {
      const summary = [
        `Timestamp: ${inputTs.value.trim()}`,
        `UTC: ${resUtc.textContent}`,
        `Local: ${resLocal.textContent}`,
        `Relative: ${resRelative.textContent}`,
        `ISO 8601: ${resIso.textContent}`
      ].join('\n');
      handleCopy(btnCopyAllTs, summary);
    });
  }

  // ==========================================
  // 4. Tool 2: Human Date to Timestamp
  // ==========================================
  function setDateFormToNow() {
    const now = new Date();
    const useUtc = tzUtcRadio.checked;

    if (useUtc) {
      inputYear.value = now.getUTCFullYear();
      inputMonth.value = now.getUTCMonth() + 1;
      inputDay.value = now.getUTCDate();
      inputHour.value = now.getUTCHours();
      inputMinute.value = now.getUTCMinutes();
      inputSecond.value = now.getUTCSeconds();
    } else {
      inputYear.value = now.getFullYear();
      inputMonth.value = now.getMonth() + 1;
      inputDay.value = now.getDate();
      inputHour.value = now.getHours();
      inputMinute.value = now.getMinutes();
      inputSecond.value = now.getSeconds();
    }
  }

  function convertDateToEpoch() {
    dateError.style.display = 'none';
    dateResults.style.display = 'none';

    const y = parseInt(inputYear.value, 10);
    const m = parseInt(inputMonth.value, 10);
    const d = parseInt(inputDay.value, 10);
    const hh = parseInt(inputHour.value || '0', 10);
    const mm = parseInt(inputMinute.value || '0', 10);
    const ss = parseInt(inputSecond.value || '0', 10);

    if (isNaN(y) || isNaN(m) || isNaN(d)) {
      dateError.textContent = 'Please enter a valid Year, Month (1-12), and Day (1-31).';
      dateError.style.display = 'block';
      return;
    }

    if (m < 1 || m > 12) {
      dateError.textContent = 'Month must be between 1 and 12.';
      dateError.style.display = 'block';
      return;
    }
    if (d < 1 || d > 31) {
      dateError.textContent = 'Day must be between 1 and 31.';
      dateError.style.display = 'block';
      return;
    }
    if (hh < 0 || hh > 23 || mm < 0 || mm > 59 || ss < 0 || ss > 59) {
      dateError.textContent = 'Hour (0-23), Minute (0-59), or Second (0-59) out of valid range.';
      dateError.style.display = 'block';
      return;
    }

    let dateObj;
    if (tzUtcRadio.checked) {
      dateObj = new Date(Date.UTC(y, m - 1, d, hh, mm, ss));
    } else {
      dateObj = new Date(y, m - 1, d, hh, mm, ss);
    }

    if (isNaN(dateObj.getTime())) {
      dateError.textContent = 'Invalid date calendar combination.';
      dateError.style.display = 'block';
      return;
    }

    const epochMs = dateObj.getTime();
    const epochSec = Math.floor(epochMs / 1000);

    resDateSec.textContent = epochSec.toString();
    resDateMs.textContent = epochMs.toString();
    resDateIso.textContent = dateObj.toISOString();
    resDateRfc.textContent = dateObj.toUTCString();

    dateResults.style.display = 'flex';
  }

  btnConvertDate.addEventListener('click', convertDateToEpoch);
  btnSetNow.addEventListener('click', () => {
    setDateFormToNow();
    convertDateToEpoch();
  });
  btnClearDate.addEventListener('click', () => {
    inputYear.value = '';
    inputMonth.value = '';
    inputDay.value = '';
    inputHour.value = '';
    inputMinute.value = '';
    inputSecond.value = '';
    dateError.style.display = 'none';
    dateResults.style.display = 'none';
    inputYear.focus();
  });

  tzLocalRadio.addEventListener('change', () => {
    if (dateResults.style.display === 'flex') convertDateToEpoch();
  });
  tzUtcRadio.addEventListener('change', () => {
    if (dateResults.style.display === 'flex') convertDateToEpoch();
  });

  copyResSec.addEventListener('click', () => {
    handleCopy(copyResSec, resDateSec.textContent);
  });
  copyResMs.addEventListener('click', () => {
    handleCopy(copyResMs, resDateMs.textContent);
  });

  // ==========================================
  // 5. Reference Table of Epoch Milestones
  // ==========================================
  function renderMilestones() {
    const now = new Date();

    // Start of today UTC
    const startOfDayUtc = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), 0, 0, 0));
    // Start of month UTC
    const startOfMonthUtc = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1, 0, 0, 0));
    // Start of year UTC
    const startOfYearUtc = new Date(Date.UTC(now.getUTCFullYear(), 0, 1, 0, 0, 0));

    const milestones = [
      {
        name: 'Start of Today (UTC)',
        ts: Math.floor(startOfDayUtc.getTime() / 1000),
        date: startOfDayUtc.toUTCString(),
        note: 'Midnight UTC today'
      },
      {
        name: 'Start of This Month (UTC)',
        ts: Math.floor(startOfMonthUtc.getTime() / 1000),
        date: startOfMonthUtc.toUTCString(),
        note: 'First day of current month'
      },
      {
        name: 'Start of This Year (UTC)',
        ts: Math.floor(startOfYearUtc.getTime() / 1000),
        date: startOfYearUtc.toUTCString(),
        note: 'January 1st of current year'
      },
      {
        name: 'Unix Epoch Inception',
        ts: 0,
        date: 'Thu, 01 Jan 1970 00:00:00 GMT',
        note: 'Baseline time 0 for Unix systems'
      },
      {
        name: '1 Billion Seconds (1 Gs)',
        ts: 1000000000,
        date: 'Sun, 09 Sep 2001 01:46:40 GMT',
        note: 'Celebrated Unix billion second jubilee'
      },
      {
        name: '1.5 Billion Seconds',
        ts: 1500000000,
        date: 'Fri, 14 Jul 2017 02:40:00 GMT',
        note: 'Milestone reached in mid-2017'
      },
      {
        name: '2 Billion Seconds',
        ts: 2000000000,
        date: 'Wed, 18 May 2033 03:33:20 GMT',
        note: 'Upcoming milestone in year 2033'
      },
      {
        name: 'Year 2038 Problem (Y2K38)',
        ts: 2147483647,
        date: 'Tue, 19 Jan 2038 03:14:07 GMT',
        note: 'Max 32-bit signed integer timestamp overflow limit'
      }
    ];

    milestonesBody.innerHTML = milestones.map(m => `
      <tr data-ts="${m.ts}" title="Click to load into converter">
        <td style="font-weight: 600; color: var(--text-primary);">${m.name}</td>
        <td style="font-family: monospace; color: var(--accent); font-weight: 700;">${m.ts}</td>
        <td style="font-family: monospace;">${m.date}</td>
        <td style="color: var(--text-secondary);">${m.note}</td>
      </tr>
    `).join('');

    milestonesBody.querySelectorAll('tr').forEach(row => {
      row.addEventListener('click', () => {
        const val = row.getAttribute('data-ts');
        if (val !== null) {
          inputTs.value = val;
          selectUnit.value = 's';
          convertTimestamp();
          inputTs.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      });
    });
  }

  // Prepopulate Human Date with Now
  setDateFormToNow();
  renderMilestones();

  // Pre-fill Timestamp tool with current timestamp so it shows results on launch
  inputTs.value = Math.floor(Date.now() / 1000).toString();
  convertTimestamp();
});