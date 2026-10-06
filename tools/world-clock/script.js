// World Clock Tracker Studio Logic
document.addEventListener('DOMContentLoaded', () => {
  // Elements
  const cityCardsContainer = document.getElementById('city-cards-container');
  const formatToggle = document.getElementById('format-toggle');
  const faceToggle = document.getElementById('face-toggle');
  const citySelectPicker = document.getElementById('city-select-picker');
  const btnAddCity = document.getElementById('btn-add-city');
  const plannerSlider = document.getElementById('planner-slider');
  const plannerVal = document.getElementById('planner-val');
  const plannerOffsetLabel = document.getElementById('planner-offset-label');
  const btnResetPlanner = document.getElementById('btn-reset-planner');

  // State
  let timeFormat = '12'; // '12' or '24'
  let clockFaceMode = 'both'; // 'both' or 'digital'
  let plannerOffsetHours = 0;

  // Local Timezone
  const userTz = Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC';

  // Active Cities List
  let cities = [
    { id: 'local', name: 'Local Time (You)', country: 'Current Location', tz: userTz, isLocal: true },
    { id: 'london', name: 'London', country: 'United Kingdom', tz: 'Europe/London' },
    { id: 'new-york', name: 'New York', country: 'United States', tz: 'America/New_York' },
    { id: 'tokyo', name: 'Tokyo', country: 'Japan', tz: 'Asia/Tokyo' },
    { id: 'dubai', name: 'Dubai', country: 'United Arab Emirates', tz: 'Asia/Dubai' },
    { id: 'dhaka', name: 'Dhaka', country: 'Bangladesh', tz: 'Asia/Dhaka' },
    { id: 'paris', name: 'Paris', country: 'France', tz: 'Europe/Paris' },
    { id: 'sydney', name: 'Sydney', country: 'Australia', tz: 'Australia/Sydney' }
  ];

  // Helper: Extract date/time parts for timezone
  function getTimeInfo(tz, offsetHours = 0) {
    const baseNow = new Date(Date.now() + offsetHours * 3600 * 1000);

    const formatter = new Intl.DateTimeFormat('en-US', {
      timeZone: tz,
      hourCycle: 'h23',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      weekday: 'short',
      hour: 'numeric',
      minute: 'numeric',
      second: 'numeric',
      timeZoneName: 'short'
    });

    const parts = {};
    formatter.formatToParts(baseNow).forEach(p => {
      parts[p.type] = p.value;
    });

    const hour24 = parseInt(parts.hour, 10) || 0;
    const minute = parseInt(parts.minute, 10) || 0;
    const second = parseInt(parts.second, 10) || 0;

    // Calculate time difference in minutes from user local
    let diffMinutes = 0;
    try {
      const targetLocalStr = baseNow.toLocaleString('en-US', { timeZone: tz });
      const userLocalStr = baseNow.toLocaleString('en-US', { timeZone: userTz });
      const targetDate = new Date(targetLocalStr);
      const userDate = new Date(userLocalStr);
      diffMinutes = Math.round((targetDate.getTime() - userDate.getTime()) / 60000);
    } catch {
      diffMinutes = 0;
    }

    return {
      hour24,
      minute,
      second,
      day: parts.day,
      month: parts.month,
      year: parts.year,
      weekday: parts.weekday,
      tzCode: parts.timeZoneName || '',
      diffMinutes
    };
  }

  // Format digital string
  function formatDigitalTime(hour24, minute, second, format) {
    const pad = (n) => String(n).padStart(2, '0');
    if (format === '24') {
      return `${pad(hour24)}:${pad(minute)}:${pad(second)}`;
    }
    const ampm = hour24 >= 12 ? 'PM' : 'AM';
    const hour12 = hour24 % 12 || 12;
    return `${pad(hour12)}:${pad(minute)}:${pad(second)} <span style="font-size: 1rem; color: var(--accent); font-weight: 600;">${ampm}</span>`;
  }

  // Get status badge info
  function getWorkStatus(hour24) {
    if (hour24 >= 9 && hour24 < 17) {
      return { text: 'Working Hours', className: 'status-work' };
    } else if (hour24 >= 17 && hour24 < 22) {
      return { text: 'Evening Off-work', className: 'status-evening' };
    } else if (hour24 >= 22 || hour24 < 6) {
      return { text: 'Night / Sleeping', className: 'status-sleep' };
    } else {
      return { text: 'Early Morning', className: 'status-evening' };
    }
  }

  // Render or rebuild all cards DOM
  function renderCards() {
    cityCardsContainer.innerHTML = '';

    cities.forEach(city => {
      const card = document.createElement('div');
      card.className = `city-card ${city.isLocal ? 'local-card' : ''}`;
      card.dataset.id = city.id;
      card.dataset.tz = city.tz;

      // Header
      const header = document.createElement('div');
      header.className = 'city-card-header';

      const titleBox = document.createElement('div');
      titleBox.className = 'city-title-box';
      titleBox.innerHTML = `
        <div class="city-name">
          ${city.name}
          ${city.isLocal ? '<span style="font-size: 0.65rem; background: var(--accent); color: #fff; padding: 0.15rem 0.45rem; border-radius: var(--radius-full); font-weight: 700;">YOU</span>' : ''}
        </div>
        <div class="city-meta">${city.country} &bull; <span class="tz-code-label"></span></div>
      `;
      header.appendChild(titleBox);

      if (!city.isLocal) {
        const removeBtn = document.createElement('button');
        removeBtn.className = 'card-remove-btn';
        removeBtn.innerHTML = '&times;';
        removeBtn.title = 'Remove city';
        removeBtn.addEventListener('click', () => {
          cities = cities.filter(c => c.id !== city.id);
          renderCards();
        });
        header.appendChild(removeBtn);
      }
      card.appendChild(header);

      // Analog Clock
      const analogWrap = document.createElement('div');
      analogWrap.className = 'analog-clock-wrap';
      analogWrap.style.display = clockFaceMode === 'digital' ? 'none' : 'flex';

      const dial = document.createElement('div');
      dial.className = 'analog-clock';

      // 12 hour tick marks
      for (let i = 0; i < 12; i++) {
        const dot = document.createElement('div');
        dot.className = 'clock-dial-dot';
        const angle = (i * 30) * (Math.PI / 180);
        const radius = 44; // px from center
        const x = 52 + radius * Math.sin(angle);
        const y = 52 - radius * Math.cos(angle);
        dot.style.left = `${x}px`;
        dot.style.top = `${y}px`;
        if (i % 3 === 0) {
          dot.style.width = '6px';
          dot.style.height = '6px';
          dot.style.background = 'var(--text-secondary)';
        }
        dial.appendChild(dot);
      }

      const handHour = document.createElement('div');
      handHour.className = 'clock-hand hand-hour';
      const handMin = document.createElement('div');
      handMin.className = 'clock-hand hand-min';
      const handSec = document.createElement('div');
      handSec.className = 'clock-hand hand-sec';
      const hub = document.createElement('div');
      hub.className = 'clock-center-hub';

      dial.appendChild(handHour);
      dial.appendChild(handMin);
      dial.appendChild(handSec);
      dial.appendChild(hub);

      analogWrap.appendChild(dial);
      card.appendChild(analogWrap);

      // Digital display
      const digitalBox = document.createElement('div');
      digitalBox.className = 'digital-time-box';
      digitalBox.innerHTML = `
        <div class="digital-time-display">--:--:--</div>
        <div class="digital-date-display">---, --- --</div>
      `;
      card.appendChild(digitalBox);

      // Footer
      const footer = document.createElement('div');
      footer.className = 'card-footer-info';
      footer.innerHTML = `
        <div class="difference-badge">Local Time</div>
        <div class="status-badge status-work">Work Hours</div>
      `;
      card.appendChild(footer);

      cityCardsContainer.appendChild(card);
    });

    updateAllClocks();
  }

  // Update clock needles and digital text on all cards
  function updateAllClocks() {
    const cards = cityCardsContainer.querySelectorAll('.city-card');
    cards.forEach(card => {
      const tz = card.dataset.tz;
      const isLocal = card.classList.contains('local-card');
      const info = getTimeInfo(tz, plannerOffsetHours);

      // Label
      const tzLabel = card.querySelector('.tz-code-label');
      if (tzLabel) tzLabel.textContent = info.tzCode;

      // Analog Hands
      const handHour = card.querySelector('.hand-hour');
      const handMin = card.querySelector('.hand-min');
      const handSec = card.querySelector('.hand-sec');

      if (handHour && handMin && handSec) {
        const hourDeg = (info.hour24 % 12) * 30 + (info.minute / 60) * 30;
        const minDeg = info.minute * 6 + (info.second / 60) * 6;
        const secDeg = info.second * 6;

        handHour.style.transform = `rotate(${hourDeg}deg)`;
        handMin.style.transform = `rotate(${minDeg}deg)`;
        handSec.style.transform = `rotate(${secDeg}deg)`;
      }

      // Digital Text
      const timeDisplay = card.querySelector('.digital-time-display');
      const dateDisplay = card.querySelector('.digital-date-display');
      if (timeDisplay) {
        timeDisplay.innerHTML = formatDigitalTime(info.hour24, info.minute, info.second, timeFormat);
      }
      if (dateDisplay) {
        dateDisplay.textContent = `${info.weekday}, ${info.month} ${info.day}, ${info.year}`;
      }

      // Difference comparator
      const diffBadge = card.querySelector('.difference-badge');
      if (diffBadge) {
        if (isLocal) {
          diffBadge.textContent = 'Your Timezone';
        } else {
          const diffHours = (info.diffMinutes / 60).toFixed(1).replace('.0', '');
          let diffStr = '';
          if (info.diffMinutes === 0) {
            diffStr = 'Same time';
          } else if (info.diffMinutes > 0) {
            diffStr = `+${diffHours}h ahead of you`;
          } else {
            diffStr = `${Math.abs(diffHours)}h behind you`;
          }
          diffBadge.textContent = diffStr;
        }
      }

      // Status
      const statusBadge = card.querySelector('.status-badge');
      if (statusBadge) {
        const st = getWorkStatus(info.hour24);
        statusBadge.textContent = st.text;
        statusBadge.className = `status-badge ${st.className}`;
      }
    });
  }

  // Format Toggle
  formatToggle.addEventListener('click', (e) => {
    const btn = e.target.closest('.toggle-pill');
    if (!btn) return;
    formatToggle.querySelectorAll('.toggle-pill').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    timeFormat = btn.dataset.format;
    updateAllClocks();
  });

  // Face Mode Toggle
  faceToggle.addEventListener('click', (e) => {
    const btn = e.target.closest('.toggle-pill');
    if (!btn) return;
    faceToggle.querySelectorAll('.toggle-pill').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    clockFaceMode = btn.dataset.face;
    cityCardsContainer.querySelectorAll('.analog-clock-wrap').forEach(wrap => {
      wrap.style.display = clockFaceMode === 'digital' ? 'none' : 'flex';
    });
  });

  // Add City Event
  btnAddCity.addEventListener('click', () => {
    const selectedVal = citySelectPicker.value;
    if (!selectedVal) return;

    const [tz, name, country] = selectedVal.split('|');
    const id = `custom-${name.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}`;

    // Check if already in list
    const exists = cities.some(c => c.tz === tz && c.name === name);
    if (exists) {
      alert(`${name} is already added to the board.`);
      return;
    }

    cities.push({ id, name, country, tz });
    renderCards();
    citySelectPicker.value = '';
  });

  // Meeting Planner Scrubber
  plannerSlider.addEventListener('input', () => {
    plannerOffsetHours = parseFloat(plannerSlider.value);
    const sign = plannerOffsetHours > 0 ? '+' : '';
    plannerVal.textContent = `${sign}${plannerOffsetHours.toFixed(1)} hrs`;
    if (plannerOffsetHours === 0) {
      plannerOffsetLabel.textContent = 'Live Current Time (0h offset)';
    } else {
      plannerOffsetLabel.textContent = `Projected Time: ${sign}${plannerOffsetHours.toFixed(1)} hours forward`;
    }
    updateAllClocks();
  });

  btnResetPlanner.addEventListener('click', () => {
    plannerSlider.value = 0;
    plannerOffsetHours = 0;
    plannerVal.textContent = '+0.0 hrs';
    plannerOffsetLabel.textContent = 'Live Current Time (0h offset)';
    updateAllClocks();
  });

  // Ticking Loop
  setInterval(updateAllClocks, 1000);

  // Initial Render
  renderCards();
});