// Time Zone Converter & Meeting Planner Engine
document.addEventListener('DOMContentLoaded', () => {
  // Required Default Timezones
  const DEFAULT_TIMEZONES = [
    { id: 'UTC', city: 'UTC', country: 'Universal' },
    { id: 'America/New_York', city: 'New York', country: 'United States' },
    { id: 'Europe/London', city: 'London', country: 'United Kingdom' },
    { id: 'Europe/Paris', city: 'Paris', country: 'France' },
    { id: 'Asia/Dubai', city: 'Dubai', country: 'United Arab Emirates' },
    { id: 'Asia/Dhaka', city: 'Dhaka', country: 'Bangladesh' },
    { id: 'Asia/Tokyo', city: 'Tokyo', country: 'Japan' },
    { id: 'Australia/Sydney', city: 'Sydney', country: 'Australia' },
    { id: 'America/Los_Angeles', city: 'Los Angeles', country: 'United States' }
  ];

  // Optional Extra Locations
  const EXTRA_LOCATIONS = {
    'Europe/Berlin': { id: 'Europe/Berlin', city: 'Berlin', country: 'Germany' },
    'Asia/Singapore': { id: 'Asia/Singapore', city: 'Singapore', country: 'Singapore' },
    'Asia/Hong_Kong': { id: 'Asia/Hong_Kong', city: 'Hong Kong', country: 'Hong Kong' },
    'Asia/Kolkata': { id: 'Asia/Kolkata', city: 'Mumbai', country: 'India' },
    'America/Chicago': { id: 'America/Chicago', city: 'Chicago', country: 'United States' },
    'America/Toronto': { id: 'America/Toronto', city: 'Toronto', country: 'Canada' },
    'America/Sao_Paulo': { id: 'America/Sao_Paulo', city: 'São Paulo', country: 'Brazil' },
    'Pacific/Auckland': { id: 'Pacific/Auckland', city: 'Auckland', country: 'New Zealand' }
  };

  // State
  let activeTimezones = [...DEFAULT_TIMEZONES];
  let is24Hour = false;

  // DOM Elements
  const meetingDateInput = document.getElementById('meeting-date');
  const btnDateToday = document.getElementById('btn-date-today');
  const sourceTzSelect = document.getElementById('source-tz-select');
  const btnFormat12h = document.getElementById('btn-format-12h');
  const btnFormat24h = document.getElementById('btn-format-24h');
  const btnSnapNow = document.getElementById('btn-snap-now');

  const sliderSourceLabel = document.getElementById('slider-source-label');
  const sliderTimeText = document.getElementById('slider-time-text');
  const sliderDateText = document.getElementById('slider-date-text');
  const masterTimeSlider = document.getElementById('master-time-slider');
  const meetingQualityBadge = document.getElementById('meeting-quality-badge');
  const meetingQualityDesc = document.getElementById('meeting-quality-desc');

  const btnStepTime = document.querySelectorAll('.btn-step-time');
  const btnAnchorTime = document.querySelectorAll('.btn-anchor-time');

  const timelineRowsContainer = document.getElementById('timeline-rows-container');
  const tzCardsGrid = document.getElementById('tz-cards-grid');
  const addCitySelect = document.getElementById('add-city-select');
  const btnResetDefaultTzs = document.getElementById('btn-reset-default-tzs');

  const btnCopyFormatted = document.getElementById('btn-copy-formatted');
  const meetingPreviewText = document.getElementById('meeting-preview-text');

  // Helpers
  function toDateString(d) {
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  // Exact UTC timestamp resolver for specific timeZone
  function getTimeInTz(year, month, day, hours, minutes, timeZone) {
    if (timeZone === 'UTC') {
      return new Date(Date.UTC(year, month - 1, day, hours, minutes, 0));
    }
    let utcDate = new Date(Date.UTC(year, month - 1, day, hours, minutes, 0));
    const formatter = new Intl.DateTimeFormat('en-US', {
      timeZone,
      year: 'numeric', month: 'numeric', day: 'numeric',
      hour: 'numeric', minute: 'numeric', second: 'numeric',
      hour12: false
    });
    for (let i = 0; i < 3; i++) {
      const parts = formatter.formatToParts(utcDate);
      const p = {};
      parts.forEach(x => { p[x.type] = parseInt(x.value, 10); });
      if (p.hour === 24) p.hour = 0;
      const tzDateAsUtc = Date.UTC(p.year, p.month - 1, p.day, p.hour, p.minute, p.second);
      const targetUtc = Date.UTC(year, month - 1, day, hours, minutes, 0);
      const diff = targetUtc - tzDateAsUtc;
      if (diff === 0) break;
      utcDate = new Date(utcDate.getTime() + diff);
    }
    return utcDate;
  }

  // Work Status Category:
  // 9 to 17 -> Work (Green)
  // 7 to 9 & 17 to 21 -> Shoulder (Yellow)
  // Else -> Night (Off)
  function getWorkStatus(hourFloat) {
    if (hourFloat >= 9 && hourFloat < 17) {
      return { type: 'work', label: 'Working Hours 💼', cssClass: 'status-work', badgeClass: 'status-badge-work' };
    }
    if ((hourFloat >= 7 && hourFloat < 9) || (hourFloat >= 17 && hourFloat < 21)) {
      return { type: 'shoulder', label: 'Extended Hours ☕', cssClass: 'status-shoulder', badgeClass: 'status-badge-shoulder' };
    }
    return { type: 'night', label: 'Night / Off Hours 🌙', cssClass: 'status-night', badgeClass: 'status-badge-night' };
  }

  // Time Formatter for UI
  function formatTzTime(utcDate, tzId, use24h) {
    const timeOptions = {
      timeZone: tzId,
      hour: '2-digit',
      minute: '2-digit',
      hour12: !use24h
    };
    return new Intl.DateTimeFormat('en-US', timeOptions).format(utcDate);
  }

  function getTzParts(utcDate, tzId) {
    const formatter = new Intl.DateTimeFormat('en-US', {
      timeZone: tzId,
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      weekday: 'short',
      hour: 'numeric',
      minute: 'numeric',
      hour12: false,
      timeZoneName: 'short'
    });
    const parts = formatter.formatToParts(utcDate);
    const res = {};
    parts.forEach(p => { res[p.type] = p.value; });
    const hourNum = parseInt(res.hour === '24' ? '0' : res.hour, 10);
    const minNum = parseInt(res.minute, 10);
    res.hourNum = hourNum;
    res.minNum = minNum;
    res.hourFloat = hourNum + (minNum / 60);
    return res;
  }

  // Initialize Date & Time
  const now = new Date();
  meetingDateInput.value = toDateString(now);

  // Set initial slider to current time rounded to nearest 15 mins
  function setSliderToCurrentTime() {
    const cur = new Date();
    meetingDateInput.value = toDateString(cur);
    const sourceTz = sourceTzSelect.value;
    const parts = getTzParts(cur, sourceTz);
    const quarters = Math.round((parts.hourNum * 4) + (parts.minNum / 15));
    masterTimeSlider.value = Math.min(95, Math.max(0, quarters));
    updateClocks();
  }

  // 12H / 24H Toggle
  btnFormat12h.addEventListener('click', () => {
    is24Hour = false;
    btnFormat12h.classList.add('active');
    btnFormat24h.classList.remove('active');
    updateClocks();
  });

  btnFormat24h.addEventListener('click', () => {
    is24Hour = true;
    btnFormat24h.classList.add('active');
    btnFormat12h.classList.remove('active');
    updateClocks();
  });

  // Step and Anchor Buttons
  btnStepTime.forEach(btn => {
    btn.addEventListener('click', () => {
      const step = parseInt(btn.getAttribute('data-step'), 10);
      let val = parseInt(masterTimeSlider.value, 10) + step;
      if (val < 0) val = 0;
      if (val > 95) val = 95;
      masterTimeSlider.value = val;
      updateClocks();
    });
  });

  btnAnchorTime.forEach(btn => {
    btn.addEventListener('click', () => {
      masterTimeSlider.value = parseInt(btn.getAttribute('data-quarter'), 10);
      updateClocks();
    });
  });

  btnDateToday.addEventListener('click', () => {
    meetingDateInput.value = toDateString(new Date());
    updateClocks();
  });

  btnSnapNow.addEventListener('click', setSliderToCurrentTime);

  // Main Calculation and UI Render
  function updateClocks() {
    const rawDate = meetingDateInput.value;
    if (!rawDate) return;
    const [y, m, d] = rawDate.split('-').map(Number);
    const sliderVal = parseInt(masterTimeSlider.value, 10);
    const sourceHours = Math.floor(sliderVal / 4);
    const sourceMinutes = (sliderVal % 4) * 15;
    const sourceTz = sourceTzSelect.value;

    // Get current UTC date object corresponding to chosen source time
    const currentUtc = getTimeInTz(y, m, d, sourceHours, sourceMinutes, sourceTz);

    // Source display
    const sourceParts = getTzParts(currentUtc, sourceTz);
    const sourceFormattedTime = formatTzTime(currentUtc, sourceTz, is24Hour);
    sliderTimeText.textContent = sourceFormattedTime;
    sliderSourceLabel.textContent = `Base: ${sourceTzSelect.options[sourceTzSelect.selectedIndex].text}`;
    sliderDateText.textContent = new Intl.DateTimeFormat('en-US', {
      timeZone: sourceTz,
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }).format(currentUtc);

    // Render Timezone Cards
    tzCardsGrid.innerHTML = '';
    let workCount = 0;
    let shoulderCount = 0;
    let nightCount = 0;

    const summaryLines = [
      `📅 World Time Synchronization Schedule`,
      `Meeting Date: ${sliderDateText.textContent}`,
      `Base Time: ${sourceFormattedTime} (${sourceParts.timeZoneName || sourceTz})`,
      `--------------------------------------------------`
    ];

    activeTimezones.forEach(tz => {
      const parts = getTzParts(currentUtc, tz.id);
      const formattedTime = formatTzTime(currentUtc, tz.id, is24Hour);
      const status = getWorkStatus(parts.hourFloat);

      if (status.type === 'work') workCount++;
      else if (status.type === 'shoulder') shoulderCount++;
      else nightCount++;

      // Day difference relative to base date
      let dayDiffHtml = '';
      let dayDiffText = '';
      if (parts.day !== sourceParts.day) {
        // Find if ahead or behind
        const targetDate = new Date(Date.UTC(parts.year, 0, parts.day));
        const srcDate = new Date(Date.UTC(sourceParts.year, 0, sourceParts.day));
        if (targetDate > srcDate) {
          dayDiffHtml = `<span class="tz-day-diff-badge day-ahead">+1 Day</span>`;
          dayDiffText = '(+1 Day)';
        } else {
          dayDiffHtml = `<span class="tz-day-diff-badge day-behind">-1 Day</span>`;
          dayDiffText = '(-1 Day)';
        }
      } else {
        dayDiffHtml = `<span class="tz-day-diff-badge">Same Day</span>`;
      }

      summaryLines.push(
        `• ${tz.city} (${tz.id}): ${formattedTime} ${parts.timeZoneName} ${dayDiffText} [${status.label}]`
      );

      // Card element
      const card = document.createElement('div');
      card.className = `tz-card ${status.cssClass}`;

      card.innerHTML = `
        <div>
          <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 0.25rem;">
            <div>
              <h3 style="font-size: 1.2rem; font-weight: 700; margin: 0; line-height: 1.2;">${tz.city}</h3>
              <span style="font-size: 0.75rem; color: var(--text-tertiary);">${tz.country}</span>
            </div>
            ${dayDiffHtml}
          </div>
          <span style="font-size: 0.75rem; color: var(--text-secondary); font-family: monospace;">
            ${parts.timeZoneName} · ${tz.id}
          </span>
        </div>

        <div style="margin: 0.5rem 0;">
          <div class="tz-time-big">${formattedTime}</div>
          <div style="font-size: 0.8rem; color: var(--text-tertiary);">
            ${parts.weekday}, ${parts.month} ${parts.day}
          </div>
        </div>

        <div style="display: flex; justify-content: space-between; align-items: center;">
          <span class="tz-status-badge ${status.badgeClass}">
            ${status.label}
          </span>
        </div>
      `;

      // Allow removing non-source cards if more than 2 timezones
      if (activeTimezones.length > 2 && tz.id !== sourceTz) {
        const removeBtn = document.createElement('button');
        removeBtn.className = 'card-remove-btn';
        removeBtn.title = 'Remove Location';
        removeBtn.innerHTML = `<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>`;
        removeBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          activeTimezones = activeTimezones.filter(t => t.id !== tz.id);
          updateClocks();
        });
        card.appendChild(removeBtn);
      }

      tzCardsGrid.appendChild(card);
    });

    // Meeting Window Quality
    if (nightCount === 0 && shoulderCount === 0) {
      meetingQualityBadge.className = 'tz-status-badge status-badge-work';
      meetingQualityBadge.textContent = 'Meeting Window: Excellent';
      meetingQualityDesc.textContent = 'All locations are within core business hours (9am - 5pm).';
    } else if (nightCount === 0) {
      meetingQualityBadge.className = 'tz-status-badge status-badge-shoulder';
      meetingQualityBadge.textContent = 'Meeting Window: Good (Extended)';
      meetingQualityDesc.textContent = `${workCount} in core hours, ${shoulderCount} in morning/evening shoulder hours.`;
    } else if (nightCount === 1) {
      meetingQualityBadge.className = 'tz-status-badge status-badge-night';
      meetingQualityBadge.textContent = 'Meeting Window: Notice (1 Sleeping)';
      meetingQualityDesc.textContent = `1 participant is currently in night/sleeping hours.`;
    } else {
      meetingQualityBadge.className = 'tz-status-badge status-badge-night';
      meetingQualityBadge.textContent = `Meeting Window: Suboptimal (${nightCount} Sleeping)`;
      meetingQualityDesc.textContent = `${nightCount} locations are during night hours.`;
    }

    // Render 24-Hour Visual Schedule Timeline
    renderTimeline(currentUtc, sourceTz, sourceHours);

    // Update Export text
    meetingPreviewText.textContent = summaryLines.join('\n');
  }

  // Render 24-Hour Timeline
  function renderTimeline(currentUtc, sourceTz, currentSourceHour) {
    timelineRowsContainer.innerHTML = '';

    activeTimezones.forEach(tz => {
      const row = document.createElement('div');
      row.className = 'timeline-row';

      const label = document.createElement('div');
      label.className = 'timeline-label';
      label.textContent = tz.city;
      label.title = `${tz.city} (${tz.id})`;
      row.appendChild(label);

      // Generate 24 hour cells corresponding to source hour 0 to 23
      const [y, m, d] = meetingDateInput.value.split('-').map(Number);

      for (let h = 0; h < 24; h++) {
        // What local hour is it in tz when source is at hour h?
        const testUtc = getTimeInTz(y, m, d, h, 0, sourceTz);
        const parts = getTzParts(testUtc, tz.id);
        const targetHour = parts.hourNum;
        const workStatus = getWorkStatus(targetHour);

        const cell = document.createElement('div');
        cell.className = `timeline-cell cell-${workStatus.type}`;
        if (h === currentSourceHour) {
          cell.classList.add('active-hour');
        }

        // Show hour number
        const displayH = is24Hour ? String(targetHour).padStart(2, '0') : (targetHour % 12 || 12);
        cell.textContent = displayH;
        cell.title = `${tz.city}: ${targetHour}:00 (${workStatus.label})\nClick to select ${h}:00 in base timezone`;

        // Click on cell jumps slider
        cell.addEventListener('click', () => {
          masterTimeSlider.value = h * 4;
          updateClocks();
        });

        row.appendChild(cell);
      }

      timelineRowsContainer.appendChild(row);
    });
  }

  // Listeners
  masterTimeSlider.addEventListener('input', updateClocks);
  meetingDateInput.addEventListener('change', updateClocks);
  sourceTzSelect.addEventListener('change', updateClocks);

  // Add City Dropdown Listener
  addCitySelect.addEventListener('change', () => {
    const tzId = addCitySelect.value;
    if (tzId && !activeTimezones.some(t => t.id === tzId)) {
      if (EXTRA_LOCATIONS[tzId]) {
        activeTimezones.push(EXTRA_LOCATIONS[tzId]);
      } else {
        const cityName = tzId.split('/').pop().replace('_', ' ');
        activeTimezones.push({ id: tzId, city: cityName, country: 'World' });
      }
      updateClocks();
    }
    addCitySelect.value = '';
  });

  // Reset Default Timezones
  btnResetDefaultTzs.addEventListener('click', () => {
    activeTimezones = [...DEFAULT_TIMEZONES];
    updateClocks();
  });

  // Copy Meeting Schedule Button
  btnCopyFormatted.addEventListener('click', () => {
    const text = meetingPreviewText.textContent;
    navigator.clipboard.writeText(text).then(() => {
      const origText = btnCopyFormatted.innerHTML;
      btnCopyFormatted.innerHTML = `✓ Copied Schedule!`;
      btnCopyFormatted.style.background = 'var(--success)';
      setTimeout(() => {
        btnCopyFormatted.innerHTML = origText;
        btnCopyFormatted.style.background = '';
      }, 2000);
    });
  });

  // Initial Run
  setSliderToCurrentTime();
});