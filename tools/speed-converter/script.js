// Speed & Velocity Converter - Matrix, Speedometer Dial & Travel Calculator
// Complete Client-Side Vanilla JS Implementation

const SPEED_UNITS = {
  kmh:   { name: 'Kilometers per Hour', symbol: 'km/h', toMs: 1 / 3.6, category: 'Metric' },
  mph:   { name: 'Miles per Hour', symbol: 'mph', toMs: 0.44704, category: 'Imperial' },
  ms:    { name: 'Meters per Second', symbol: 'm/s', toMs: 1.0, category: 'SI Base' },
  fts:   { name: 'Feet per Second', symbol: 'ft/s', toMs: 0.3048, category: 'Imperial' },
  kn:    { name: 'Knots (Nautical)', symbol: 'kn', toMs: 1852 / 3600, category: 'Aviation / Marine' },
  mach:  { name: 'Mach (Sound at 20°C)', symbol: 'Ma', toMs: 343.0, category: 'Aerospace' },
  c_pct: { name: '% Speed of Light', symbol: '% c', toMs: 2997924.58, category: 'Relativistic' }
};

// Application State
let currentMs = 100 / 3.6; // Default to 100 km/h
let precision = 2;
let activeUnitKey = 'kmh';

// Number Formatting Helper
function formatSpeed(num) {
  if (num === null || isNaN(num)) return '';
  if (num === 0) return '0';

  const abs = Math.abs(num);
  if (abs < 0.0001 && abs > 0) {
    return num.toExponential(4);
  }

  let fixed = num.toFixed(precision);
  if (fixed.includes('.')) {
    fixed = fixed.replace(/\.?0+$/, '');
  }
  return fixed === '' ? '0' : fixed;
}

function toBaseMs(val, unitKey) {
  const factor = SPEED_UNITS[unitKey]?.toMs || 1.0;
  return val * factor;
}

function fromBaseMs(ms, unitKey) {
  const factor = SPEED_UNITS[unitKey]?.toMs || 1.0;
  return ms / factor;
}

// Render Speed Cards
function renderSpeedCards() {
  const container = document.getElementById('speed-cards-container');
  if (!container) return;

  container.innerHTML = '';

  Object.entries(SPEED_UNITS).forEach(([key, info]) => {
    const card = document.createElement('div');
    card.className = `speed-unit-card ${key === activeUnitKey ? 'active-unit' : ''}`;
    card.id = `speed-card-${key}`;

    card.innerHTML = `
      <div class="speed-header">
        <div class="speed-title-group">
          <span class="speed-symbol">${info.symbol}</span>
          <span class="speed-name">${info.name}</span>
        </div>
        <span class="speed-tag">${info.category}</span>
      </div>
      <div class="speed-input-wrapper">
        <input type="text" 
               inputmode="decimal" 
               id="speed-input-${key}" 
               class="speed-input" 
               data-unit="${key}" 
               value="${formatSpeed(fromBaseMs(currentMs, key))}"
               placeholder="0"
               aria-label="${info.name}">
        <button type="button" class="speed-copy-btn" data-copy-unit="${key}" title="Copy ${info.symbol} value" aria-label="Copy ${info.name}">
          <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
            <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
          </svg>
        </button>
      </div>
    `;

    container.appendChild(card);
  });

  // Attach card input events
  container.querySelectorAll('.speed-input').forEach(input => {
    input.addEventListener('input', (e) => {
      const unitKey = e.target.getAttribute('data-unit');
      const valStr = e.target.value.trim();

      if (valStr === '' || isNaN(Number(valStr))) {
        if (valStr === '') {
          currentMs = 0;
          updateInputsExcept(unitKey, '');
        }
        return;
      }

      const num = parseFloat(valStr);
      currentMs = toBaseMs(num, unitKey);
      activeUnitKey = unitKey;

      updateInputsExcept(unitKey);
      updateSpeedometer();
      updateTravelTime();
    });

    input.addEventListener('focus', (e) => {
      const unitKey = e.target.getAttribute('data-unit');
      activeUnitKey = unitKey;
      setActiveCard(unitKey);
    });
  });

  // Attach 1-click copy buttons
  container.querySelectorAll('.speed-copy-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const targetBtn = e.currentTarget;
      const unitKey = targetBtn.getAttribute('data-copy-unit');
      const inputEl = document.getElementById(`speed-input-${unitKey}`);
      if (inputEl) {
        copyToClipboard(inputEl.value, SPEED_UNITS[unitKey].symbol);
        showCopiedState(targetBtn);
      }
    });
  });
}

function updateInputsExcept(exceptKey, overrideVal = null) {
  Object.keys(SPEED_UNITS).forEach(key => {
    if (key === exceptKey) return;
    const input = document.getElementById(`speed-input-${key}`);
    if (input) {
      if (overrideVal !== null) {
        input.value = overrideVal;
      } else {
        const converted = fromBaseMs(currentMs, key);
        input.value = formatSpeed(converted);
      }
    }
  });

  setActiveCard(activeUnitKey);
}

function setActiveCard(unitKey) {
  document.querySelectorAll('.speed-unit-card').forEach(card => card.classList.remove('active-unit'));
  const active = document.getElementById(`speed-card-${unitKey}`);
  if (active) active.classList.add('active-unit');
}

// Animated Speedometer Dial & Needle Physics
function updateSpeedometer() {
  const needleGroup = document.getElementById('speedo-needle-g');
  const digitalNum = document.getElementById('speedo-digital-num');
  const digitalUnit = document.getElementById('speedo-digital-unit');
  const zoneBadge = document.getElementById('speedo-zone-badge');
  const summaryText = document.getElementById('speedo-summary-text');

  if (!needleGroup) return;

  const kmh = Math.max(0, currentMs * 3.6);

  // Speedometer needle calculation:
  // -135deg (0 km/h) to +135deg (max / cosmic)
  let angle = -135;
  if (kmh <= 100) {
    // 0 to 100 km/h maps from -135deg to 0deg (straight up)
    angle = -135 + 135 * Math.pow(kmh / 100, 0.7);
  } else {
    // 100 to 28,000 km/h maps from 0deg to +135deg
    const ratio = Math.log10(kmh / 100) / Math.log10(28000 / 100);
    angle = Math.min(135, ratio * 135);
  }

  needleGroup.style.transform = `rotate(${angle.toFixed(1)}deg)`;

  // Update Digital Readout
  if (digitalNum) {
    const activeVal = fromBaseMs(currentMs, activeUnitKey);
    digitalNum.textContent = formatSpeed(activeVal);
  }
  if (digitalUnit) {
    digitalUnit.textContent = SPEED_UNITS[activeUnitKey]?.symbol.toUpperCase() || 'KM/H';
  }

  // Velocity Zones and descriptions
  let zoneName = 'Highway Speed';
  let zoneColor = 'var(--accent)';
  let desc = 'Typical vehicular cruising speed.';

  if (kmh < 0.1) {
    zoneName = 'Stationary';
    zoneColor = 'var(--text-tertiary)';
    desc = 'Zero velocity (at rest).';
  } else if (kmh < 7) {
    zoneName = 'Walking Pace';
    zoneColor = '#00f2fe';
    desc = 'Human walking or gentle stroll (~5 km/h).';
  } else if (kmh < 50) {
    zoneName = 'City Traffic';
    zoneColor = '#38ef7d';
    desc = 'Urban driving and cycling speed (6 - 50 km/h).';
  } else if (kmh <= 125) {
    zoneName = 'Highway Cruising';
    zoneColor = '#10b981';
    desc = 'Standard motorway or highway cruising velocity.';
  } else if (kmh < 350) {
    zoneName = 'High-Speed Rail';
    zoneColor = '#f59e0b';
    desc = 'Shinkansen and bullet train express velocity (120 - 350 km/h).';
  } else if (kmh < 1000) {
    zoneName = 'Commercial Jet';
    zoneColor = '#f97316';
    desc = 'Commercial airline passenger cruise speed (850 - 950 km/h).';
  } else if (kmh < 3000) {
    zoneName = 'Supersonic / Mach 1+';
    zoneColor = '#ef4444';
    desc = 'Breaking the sound barrier into supersonic flight (Mach 1 - 2.5).';
  } else {
    zoneName = 'Orbital / Relativistic';
    zoneColor = '#a855f7';
    desc = 'Low Earth Orbit (ISS: 27,600 km/h) or relativistic cosmic velocity.';
  }

  if (zoneBadge) {
    zoneBadge.textContent = zoneName;
    zoneBadge.style.color = zoneColor;
    zoneBadge.style.borderColor = zoneColor;
  }
  if (summaryText) {
    summaryText.textContent = desc;
  }
}

// Travel Duration Calculator
function updateTravelTime() {
  const distInput = document.getElementById('travel-distance-input');
  const unitSelect = document.getElementById('travel-distance-unit');
  const timeDisplay = document.getElementById('travel-time-display');
  const detailDisplay = document.getElementById('travel-detail-display');

  if (!distInput || !unitSelect || !timeDisplay) return;

  const distVal = parseFloat(distInput.value);
  const unit = unitSelect.value;

  if (isNaN(distVal) || distVal <= 0) {
    timeDisplay.textContent = '0 seconds';
    if (detailDisplay) detailDisplay.textContent = 'Enter distance above.';
    return;
  }

  // Convert distance to meters
  let distMeters = distVal * 1000; // default km
  let distDesc = `${distVal} km`;

  if (unit === 'km') {
    distMeters = distVal * 1000;
    distDesc = `${distVal} km`;
  } else if (unit === 'mi') {
    distMeters = distVal * 1609.344;
    distDesc = `${distVal} miles`;
  } else if (unit === 'm') {
    distMeters = distVal;
    distDesc = `${distVal} meters`;
  } else if (unit === 'marathon') {
    distMeters = 42195;
    distDesc = `Official Marathon (42.2 km)`;
  } else if (unit === 'earth_moon') {
    distMeters = 384400000;
    distDesc = `Earth to Moon (384,400 km)`;
  } else if (unit === 'earth_sun') {
    distMeters = 149597870700;
    distDesc = `Earth to Sun (1 AU / ~150M km)`;
  }

  if (currentMs <= 0.0001) {
    timeDisplay.textContent = 'Infinite (Speed is 0)';
    if (detailDisplay) detailDisplay.textContent = 'Vehicle is stationary.';
    return;
  }

  const seconds = distMeters / currentMs;

  // Format seconds into human duration
  let formattedTime = '';
  if (seconds < 0.001) {
    formattedTime = `${(seconds * 1e6).toFixed(1)} microseconds`;
  } else if (seconds < 1) {
    formattedTime = `${(seconds * 1000).toFixed(1)} milliseconds`;
  } else if (seconds < 60) {
    formattedTime = `${seconds.toFixed(2)} seconds`;
  } else if (seconds < 3600) {
    const mins = Math.floor(seconds / 60);
    const secs = Math.round(seconds % 60);
    formattedTime = `${mins} min ${secs} sec`;
  } else if (seconds < 86400) {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    formattedTime = `${hrs} hour${hrs > 1 ? 's' : ''} ${mins} min`;
  } else if (seconds < 31536000) {
    const days = Math.floor(seconds / 86400);
    const hrs = Math.floor((seconds % 86400) / 3600);
    formattedTime = `${days} day${days > 1 ? 's' : ''} ${hrs} hr`;
  } else {
    const years = (seconds / 31536000).toFixed(2);
    formattedTime = `${years} years`;
  }

  timeDisplay.textContent = formattedTime;
  if (detailDisplay) {
    const kmh = currentMs * 3.6;
    const mph = currentMs / 0.44704;
    detailDisplay.textContent = `Traveling ${distDesc} at ${formatSpeed(kmh)} km/h (${formatSpeed(mph)} mph)`;
  }
}

// 1-Click Clipboard Copy
function copyToClipboard(text, symbol) {
  if (!text) return;
  const copyStr = `${text} ${symbol || ''}`.trim();
  navigator.clipboard.writeText(copyStr).then(() => {
    showToast(`Copied ${copyStr} to clipboard!`);
  }).catch(() => {
    const ta = document.createElement('textarea');
    ta.value = copyStr;
    document.body.appendChild(ta);
    ta.select();
    document.execCommand('copy');
    document.body.removeChild(ta);
    showToast(`Copied ${copyStr}!`);
  });
}

function showCopiedState(btn) {
  btn.classList.add('copied');
  const originalSvg = btn.innerHTML;
  btn.innerHTML = `<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="color:var(--success);"><polyline points="20 6 9 17 4 12"></polyline></svg>`;
  setTimeout(() => {
    btn.classList.remove('copied');
    btn.innerHTML = originalSvg;
  }, 1800);
}

let toastTimer = null;
function showToast(message) {
  const toast = document.getElementById('toast');
  const msgEl = document.getElementById('toast-msg');
  if (!toast || !msgEl) return;

  msgEl.textContent = message;
  toast.classList.add('show');

  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => {
    toast.classList.remove('show');
  }, 2200);
}

// Event Listeners
function initEventListeners() {
  // Precision Slider
  const precisionSlider = document.getElementById('speed-precision-slider');
  const precisionVal = document.getElementById('speed-precision-val');
  if (precisionSlider) {
    precisionSlider.addEventListener('input', (e) => {
      precision = parseInt(e.target.value, 10);
      if (precisionVal) precisionVal.textContent = precision;
      updateInputsExcept(null);
      updateSpeedometer();
      updateTravelTime();
    });
  }

  // Reset Button
  const resetBtn = document.getElementById('reset-speed-btn');
  if (resetBtn) {
    resetBtn.addEventListener('click', () => {
      currentMs = 100 / 3.6;
      activeUnitKey = 'kmh';
      updateInputsExcept(null);
      updateSpeedometer();
      updateTravelTime();
      showToast('Reset to 100 km/h');
    });
  }

  // Clear Button
  const clearBtn = document.getElementById('speed-clear-btn');
  if (clearBtn) {
    clearBtn.addEventListener('click', () => {
      currentMs = 0;
      updateInputsExcept(null, '');
      updateSpeedometer();
      updateTravelTime();
      showToast('Cleared speed values');
    });
  }

  // Travel Calculator inputs
  const distInput = document.getElementById('travel-distance-input');
  if (distInput) {
    distInput.addEventListener('input', updateTravelTime);
  }
  const distUnit = document.getElementById('travel-distance-unit');
  if (distUnit) {
    distUnit.addEventListener('change', updateTravelTime);
  }

  // Benchmark Milestone Pills
  document.querySelectorAll('.benchmark-pill').forEach(btn => {
    btn.addEventListener('click', () => {
      const unit = btn.getAttribute('data-unit');
      const val = parseFloat(btn.getAttribute('data-val'));
      if (isNaN(val) || !SPEED_UNITS[unit]) return;

      currentMs = toBaseMs(val, unit);
      activeUnitKey = unit;

      updateInputsExcept(null);
      updateSpeedometer();
      updateTravelTime();
      showToast(`Loaded milestone: ${val} ${SPEED_UNITS[unit].symbol}`);
    });
  });
}

// DOM Ready
document.addEventListener('DOMContentLoaded', () => {
  renderSpeedCards();
  initEventListeners();
  updateSpeedometer();
  updateTravelTime();
});