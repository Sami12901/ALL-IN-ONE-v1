// Stopwatch & Countdown Timer - Interactive Vanilla JS
document.addEventListener('DOMContentLoaded', () => {
  // DOM References - Navigation
  const tabCountdownMode = document.getElementById('tab-countdown-mode');
  const tabStopwatchMode = document.getElementById('tab-stopwatch-mode');
  const countdownSection = document.getElementById('countdown-studio-section');
  const stopwatchSection = document.getElementById('stopwatch-section');

  // DOM References - Countdown
  const eventTitleInput = document.getElementById('event-title-input');
  const eventDatetimeInput = document.getElementById('event-datetime-input');
  const stageEventTitle = document.getElementById('stage-event-title');
  const stageTargetTimeText = document.getElementById('stage-target-time-text');
  const unitDays = document.getElementById('unit-days');
  const unitHours = document.getElementById('unit-hours');
  const unitMinutes = document.getElementById('unit-minutes');
  const unitSeconds = document.getElementById('unit-seconds');
  const celebrationBanner = document.getElementById('celebration-banner');

  const presetNewYear = document.getElementById('preset-new-year');
  const presetWeekend = document.getElementById('preset-weekend');
  const presetTomorrow = document.getElementById('preset-tomorrow');
  const preset1hr = document.getElementById('preset-1hr');
  const preset24hr = document.getElementById('preset-24hr');

  const saveCountdownBtn = document.getElementById('save-countdown-btn');
  const shareCountdownBtn = document.getElementById('share-countdown-btn');
  const savedEventsContainer = document.getElementById('saved-events-container');

  // DOM References - Stopwatch
  const swMainTime = document.getElementById('sw-main-time');
  const swFraction = document.getElementById('sw-fraction');
  const swToggleBtn = document.getElementById('sw-toggle-btn');
  const swResetBtn = document.getElementById('sw-reset-btn');
  const swLapBtn = document.getElementById('sw-lap-btn');
  const lapTableBox = document.getElementById('lap-table-box');
  const lapTableBody = document.getElementById('lap-table-body');

  const toast = document.getElementById('toast');
  const toastText = document.getElementById('toast-text');

  // Web Audio Context (Celebration Chime)
  let audioCtx = null;
  function initAudio() {
    if (!audioCtx) {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      if (AudioContextClass) audioCtx = new AudioContextClass();
    }
    if (audioCtx && audioCtx.state === 'suspended') {
      audioCtx.resume();
    }
  }

  function playCelebrationFanfare() {
    try {
      initAudio();
      if (!audioCtx) return;
      const now = audioCtx.currentTime;
      // Celebratory major arpeggio
      const notes = [440, 554.37, 659.25, 880];
      notes.forEach((freq, idx) => {
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, now + idx * 0.15);

        gain.gain.setValueAtTime(0.001, now + idx * 0.15);
        gain.gain.exponentialRampToValueAtTime(0.3, now + idx * 0.15 + 0.05);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + idx * 0.15 + 1.2);

        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.start(now + idx * 0.15);
        osc.stop(now + idx * 0.15 + 1.3);
      });
    } catch (e) {
      console.warn('Audio playback error:', e);
    }
  }

  // Toast Helper
  let toastTimer = null;
  function showToast(msg) {
    if (toastTimer) clearTimeout(toastTimer);
    toastText.textContent = msg;
    toast.classList.add('show');
    toastTimer = setTimeout(() => {
      toast.classList.remove('show');
    }, 2800);
  }

  // Format Helper: date to datetime-local input string (YYYY-MM-DDTHH:mm)
  function toLocalDatetimeString(date) {
    const tzOffset = date.getTimezoneOffset() * 60000;
    const localISOTime = (new Date(date.getTime() - tzOffset)).toISOString().slice(0, 16);
    return localISOTime;
  }

  // ================= COUNTDOWN LOGIC =================
  let currentTargetTime = null;
  let countdownInterval = null;
  let hasCelebrated = false;
  let savedCountdowns = [];

  function loadSavedEvents() {
    try {
      const stored = localStorage.getItem('aio_saved_countdowns');
      if (stored) savedCountdowns = JSON.parse(stored);
    } catch (e) {
      console.warn('Could not read saved countdowns:', e);
    }
  }

  function persistSavedEvents() {
    try {
      localStorage.setItem('aio_saved_countdowns', JSON.stringify(savedCountdowns));
    } catch (e) {
      console.warn('Could not write saved countdowns:', e);
    }
  }

  function renderSavedEvents() {
    savedEventsContainer.innerHTML = '';
    if (savedCountdowns.length === 0) {
      savedEventsContainer.innerHTML = `<span style="font-size: 0.825rem; color: var(--text-tertiary);">No saved countdowns yet. Click "Save Countdown" above to store active events.</span>`;
      return;
    }

    savedCountdowns.forEach((ev) => {
      const item = document.createElement('div');
      item.className = 'saved-event-item';

      const targetD = new Date(ev.targetIso);
      const isPast = targetD.getTime() < Date.now();

      item.innerHTML = `
        <div style="flex: 1; min-width: 0; cursor: pointer;" class="load-event-trigger">
          <div style="font-weight: 700; font-size: 0.875rem; color: var(--text-primary); text-overflow: ellipsis; overflow: hidden; white-space: nowrap;">${ev.title}</div>
          <div style="font-size: 0.775rem; color: var(--text-tertiary);">${targetD.toLocaleDateString()} ${targetD.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} ${isPast ? '• Concluded' : ''}</div>
        </div>
        <div style="display: flex; gap: 0.35rem;">
          <button class="btn btn-secondary load-btn" style="padding: 0.25rem 0.55rem; font-size: 0.75rem;">Load</button>
          <button class="btn btn-secondary delete-btn" style="padding: 0.25rem 0.55rem; font-size: 0.75rem; color: var(--error);">
            <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
          </button>
        </div>
      `;

      const loadAction = () => {
        eventTitleInput.value = ev.title;
        eventDatetimeInput.value = toLocalDatetimeString(new Date(ev.targetIso));
        setCountdownTarget(new Date(ev.targetIso), ev.title);
        showToast(`Loaded "${ev.title}"`);
      };

      item.querySelector('.load-event-trigger').addEventListener('click', loadAction);
      item.querySelector('.load-btn').addEventListener('click', loadAction);

      item.querySelector('.delete-btn').addEventListener('click', () => {
        savedCountdowns = savedCountdowns.filter(e => e.id !== ev.id);
        persistSavedEvents();
        renderSavedEvents();
        showToast('Countdown removed');
      });

      savedEventsContainer.appendChild(item);
    });
  }

  function setCountdownTarget(targetDate, title) {
    currentTargetTime = targetDate;
    stageEventTitle.textContent = title || 'Custom Event';

    const formattedTarget = targetDate.toLocaleDateString(undefined, {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
    stageTargetTimeText.textContent = `Target: ${formattedTarget}`;
    hasCelebrated = false;

    updateCountdownTick();
  }

  function updateCountdownTick() {
    if (!currentTargetTime) return;

    const now = Date.now();
    const diff = currentTargetTime.getTime() - now;

    if (diff <= 0) {
      unitDays.textContent = '00';
      unitHours.textContent = '00';
      unitMinutes.textContent = '00';
      unitSeconds.textContent = '00';
      celebrationBanner.style.display = 'block';

      if (!hasCelebrated) {
        hasCelebrated = true;
        playCelebrationFanfare();
        showToast('Countdown reached zero!');
      }
      return;
    }

    celebrationBanner.style.display = 'none';

    const seconds = Math.floor((diff / 1000) % 60);
    const minutes = Math.floor((diff / (1000 * 60)) % 60);
    const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    unitDays.textContent = String(days).padStart(2, '0');
    unitHours.textContent = String(hours).padStart(2, '0');
    unitMinutes.textContent = String(minutes).padStart(2, '0');
    unitSeconds.textContent = String(seconds).padStart(2, '0');
  }

  // Presets Handlers
  presetNewYear.addEventListener('click', () => {
    const nextYear = new Date().getFullYear() + 1;
    const nyDate = new Date(nextYear, 0, 1, 0, 0, 0);
    eventTitleInput.value = `New Year ${nextYear}`;
    eventDatetimeInput.value = toLocalDatetimeString(nyDate);
    setCountdownTarget(nyDate, `New Year ${nextYear}`);
    showToast(`Preset: New Year ${nextYear}`);
  });

  presetWeekend.addEventListener('click', () => {
    const d = new Date();
    const day = d.getDay(); // 0 is Sunday, 5 is Friday
    let daysUntilFriday = (5 - day + 7) % 7;
    if (daysUntilFriday === 0 && d.getHours() >= 17) daysUntilFriday = 7;
    const weekendDate = new Date(d.getFullYear(), d.getMonth(), d.getDate() + daysUntilFriday, 17, 0, 0);
    eventTitleInput.value = 'Weekend Kick-Off';
    eventDatetimeInput.value = toLocalDatetimeString(weekendDate);
    setCountdownTarget(weekendDate, 'Weekend Kick-Off');
    showToast('Preset: Next Weekend');
  });

  presetTomorrow.addEventListener('click', () => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    d.setHours(9, 0, 0, 0);
    eventTitleInput.value = 'Tomorrow Morning';
    eventDatetimeInput.value = toLocalDatetimeString(d);
    setCountdownTarget(d, 'Tomorrow Morning');
    showToast('Preset: Tomorrow at 9:00 AM');
  });

  preset1hr.addEventListener('click', () => {
    const d = new Date(Date.now() + 60 * 60 * 1000);
    eventTitleInput.value = '1 Hour Focus Countdown';
    eventDatetimeInput.value = toLocalDatetimeString(d);
    setCountdownTarget(d, '1 Hour Focus Countdown');
    showToast('Preset: +1 Hour');
  });

  preset24hr.addEventListener('click', () => {
    const d = new Date(Date.now() + 24 * 60 * 60 * 1000);
    eventTitleInput.value = '24-Hour Countdown';
    eventDatetimeInput.value = toLocalDatetimeString(d);
    setCountdownTarget(d, '24-Hour Countdown');
    showToast('Preset: +24 Hours');
  });

  // Inputs sync
  eventTitleInput.addEventListener('input', () => {
    stageEventTitle.textContent = eventTitleInput.value.trim() || 'Custom Event';
  });

  eventDatetimeInput.addEventListener('change', () => {
    const val = eventDatetimeInput.value;
    if (val) {
      const parsed = new Date(val);
      if (!isNaN(parsed.getTime())) {
        setCountdownTarget(parsed, eventTitleInput.value.trim() || 'Custom Event');
      }
    }
  });

  // Save Event
  saveCountdownBtn.addEventListener('click', () => {
    if (!currentTargetTime) return;
    const title = eventTitleInput.value.trim() || 'Custom Event';
    const newEntry = {
      id: 'cd-' + Date.now(),
      title: title,
      targetIso: currentTargetTime.toISOString(),
      createdAt: new Date().toISOString()
    };
    savedCountdowns.unshift(newEntry);
    persistSavedEvents();
    renderSavedEvents();
    showToast(`Saved "${title}" to LocalStorage!`);
  });

  // Share Link
  shareCountdownBtn.addEventListener('click', () => {
    if (!currentTargetTime) return;
    const url = new URL(window.location.href);
    url.searchParams.set('title', eventTitleInput.value.trim() || 'Event');
    url.searchParams.set('date', currentTargetTime.toISOString());
    navigator.clipboard.writeText(url.toString()).then(() => {
      window.history.replaceState({}, '', url.toString());
      showToast('Shareable countdown link copied!');
    });
  });

  // Read URL params
  function initCountdownFromUrl() {
    const params = new URLSearchParams(window.location.search);
    const titleParam = params.get('title');
    const dateParam = params.get('date');

    if (dateParam) {
      const parsed = new Date(dateParam);
      if (!isNaN(parsed.getTime())) {
        const title = titleParam || 'Shared Event';
        eventTitleInput.value = title;
        eventDatetimeInput.value = toLocalDatetimeString(parsed);
        setCountdownTarget(parsed, title);
        return true;
      }
    }
    return false;
  }

  // ================= STOPWATCH LOGIC =================
  let swStartTime = 0;
  let swElapsedTime = 0;
  let swRunning = false;
  let swInterval = null;
  let laps = [];
  let lastLapTime = 0;

  function formatStopwatchTime(ms) {
    const totalSecs = Math.floor(ms / 1000);
    const hours = Math.floor(totalSecs / 3600);
    const minutes = Math.floor((totalSecs % 3600) / 60);
    const seconds = totalSecs % 60;
    const hundredths = Math.floor((ms % 1000) / 10);

    const mainStr = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
    const fracStr = `.${String(hundredths).padStart(2, '0')}`;
    return { mainStr, fracStr, formattedFull: `${mainStr}${fracStr}` };
  }

  function updateStopwatchDisplay() {
    const current = swRunning ? (Date.now() - swStartTime + swElapsedTime) : swElapsedTime;
    const { mainStr, fracStr } = formatStopwatchTime(current);
    swMainTime.textContent = mainStr;
    swFraction.textContent = fracStr;
  }

  function startStopwatch() {
    initAudio();
    swRunning = true;
    swStartTime = Date.now();
    swToggleBtn.textContent = 'Pause';
    swToggleBtn.classList.remove('btn-primary');
    swToggleBtn.classList.add('btn-secondary');

    swInterval = setInterval(updateStopwatchDisplay, 10);
  }

  function pauseStopwatch() {
    swRunning = false;
    swElapsedTime += Date.now() - swStartTime;
    clearInterval(swInterval);
    swInterval = null;

    swToggleBtn.textContent = 'Resume';
    swToggleBtn.classList.remove('btn-secondary');
    swToggleBtn.classList.add('btn-primary');
    updateStopwatchDisplay();
  }

  function resetStopwatch() {
    swRunning = false;
    clearInterval(swInterval);
    swInterval = null;
    swStartTime = 0;
    swElapsedTime = 0;
    lastLapTime = 0;
    laps = [];

    swToggleBtn.textContent = 'Start';
    swToggleBtn.classList.remove('btn-secondary');
    swToggleBtn.classList.add('btn-primary');

    swMainTime.textContent = '00:00:00';
    swFraction.textContent = '.00';

    lapTableBox.style.display = 'none';
    lapTableBody.innerHTML = '';
  }

  function addLap() {
    if (!swRunning && swElapsedTime === 0) return;
    const totalCurrent = swRunning ? (Date.now() - swStartTime + swElapsedTime) : swElapsedTime;
    const split = totalCurrent - lastLapTime;
    lastLapTime = totalCurrent;

    const lapNumber = laps.length + 1;
    laps.unshift({
      lapNumber: lapNumber,
      split: split,
      total: totalCurrent
    });

    renderLaps();
  }

  function renderLaps() {
    if (laps.length === 0) {
      lapTableBox.style.display = 'none';
      return;
    }
    lapTableBox.style.display = 'block';
    lapTableBody.innerHTML = '';

    laps.forEach(lap => {
      const row = document.createElement('tr');
      row.innerHTML = `
        <td style="color: var(--text-tertiary);">Lap ${lap.lapNumber}</td>
        <td style="color: var(--accent); font-weight: 700;">+${formatStopwatchTime(lap.split).formattedFull}</td>
        <td>${formatStopwatchTime(lap.total).formattedFull}</td>
      `;
      lapTableBody.appendChild(row);
    });
  }

  swToggleBtn.addEventListener('click', () => {
    if (swRunning) {
      pauseStopwatch();
    } else {
      startStopwatch();
    }
  });

  swResetBtn.addEventListener('click', () => {
    resetStopwatch();
    showToast('Stopwatch reset');
  });

  swLapBtn.addEventListener('click', () => {
    addLap();
  });

  // Mode Switch Tabs
  tabCountdownMode.addEventListener('click', () => {
    tabCountdownMode.classList.add('active');
    tabStopwatchMode.classList.remove('active');
    countdownSection.style.display = 'flex';
    stopwatchSection.style.display = 'none';
  });

  tabStopwatchMode.addEventListener('click', () => {
    tabStopwatchMode.classList.add('active');
    tabCountdownMode.classList.remove('active');
    countdownSection.style.display = 'none';
    stopwatchSection.style.display = 'flex';
  });

  // Initial Boot
  loadSavedEvents();
  renderSavedEvents();

  if (!initCountdownFromUrl()) {
    // Default: 3 days in the future
    const defDate = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000);
    defDate.setHours(12, 0, 0, 0);
    eventDatetimeInput.value = toLocalDatetimeString(defDate);
    setCountdownTarget(defDate, 'Product Launch');
  }

  // Ticking interval for countdown
  countdownInterval = setInterval(updateCountdownTick, 1000);
});