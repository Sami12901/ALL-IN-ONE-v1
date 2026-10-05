// Temperature Converter - Thermal Scale Matrix & Thermometer Logic
// Complete Client-Side Vanilla JS Implementation

const SCALES = {
  C: {
    name: 'Celsius',
    symbol: '°C',
    tag: 'Metric (SI)',
    toCelsius: (v) => v,
    fromCelsius: (c) => c,
    formulaFromC: 'T = T_C',
    desc: 'Centigrade water-freezing reference scale'
  },
  F: {
    name: 'Fahrenheit',
    symbol: '°F',
    tag: 'Imperial',
    toCelsius: (v) => (v - 32) * (5 / 9),
    fromCelsius: (c) => (c * (9 / 5)) + 32,
    formulaFromC: 'T = (T_C × 9/5) + 32',
    desc: 'United States customary temperature scale'
  },
  K: {
    name: 'Kelvin',
    symbol: 'K',
    tag: 'Thermodynamic Base',
    toCelsius: (v) => v - 273.15,
    fromCelsius: (c) => c + 273.15,
    formulaFromC: 'T = T_C + 273.15',
    desc: 'Absolute temperature scale with zero at 0 K'
  },
  R: {
    name: 'Rankine',
    symbol: '°R',
    tag: 'Absolute Imperial',
    toCelsius: (v) => (v - 491.67) * (5 / 9),
    fromCelsius: (c) => (c + 273.15) * (9 / 5),
    formulaFromC: 'T = (T_C + 273.15) × 9/5',
    desc: 'Absolute Fahrenheit scale'
  },
  Re: {
    name: 'Réaumur',
    symbol: '°Ré',
    tag: 'Historical Europe',
    toCelsius: (v) => v * (5 / 4),
    fromCelsius: (c) => c * (4 / 5),
    formulaFromC: 'T = T_C × 4/5',
    desc: 'Historical French 80-degree division scale'
  },
  Ro: {
    name: 'Rømer',
    symbol: '°Rø',
    tag: 'Historical Nordic',
    toCelsius: (v) => (v - 7.5) * (40 / 21),
    fromCelsius: (c) => (c * (21 / 40)) + 7.5,
    formulaFromC: 'T = (T_C × 21/40) + 7.5',
    desc: 'Ole Rømer astronomical calibration scale'
  }
};

// Application State
let currentCelsius = 20.0; // Default to comfortable room temp
let precision = 2;
let activeScaleKey = 'C';

// Formatting Helper
function formatTemp(num) {
  if (num === null || isNaN(num)) return '';
  if (num === 0) return '0';
  let fixed = num.toFixed(precision);
  if (fixed.includes('.')) {
    fixed = fixed.replace(/\.?0+$/, '');
  }
  return fixed === '' ? '0' : fixed;
}

// Render 6 Thermal Scale Cards
function renderScaleCards() {
  const container = document.getElementById('temp-cards-container');
  if (!container) return;

  container.innerHTML = '';

  Object.entries(SCALES).forEach(([key, info]) => {
    const card = document.createElement('div');
    card.className = `temp-card ${key === activeScaleKey ? 'active-card' : ''}`;
    card.id = `temp-card-${key}`;

    card.innerHTML = `
      <div class="temp-header">
        <div class="temp-symbol-box">
          <span class="temp-symbol">${info.symbol}</span>
          <span class="temp-name">${info.name}</span>
        </div>
        <span class="temp-tag">${info.tag}</span>
      </div>
      <div class="temp-input-wrap">
        <input type="text" 
               inputmode="decimal" 
               id="temp-input-${key}" 
               class="temp-input" 
               data-scale="${key}" 
               value="${formatTemp(info.fromCelsius(currentCelsius))}"
               placeholder="0"
               aria-label="${info.name}">
        <button type="button" class="temp-copy-btn" data-copy-scale="${key}" title="Copy ${info.symbol} value" aria-label="Copy ${info.name}">
          <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
            <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
          </svg>
        </button>
      </div>
    `;

    container.appendChild(card);
  });

  // Attach Input Handlers
  container.querySelectorAll('.temp-input').forEach(input => {
    input.addEventListener('input', (e) => {
      const scaleKey = e.target.getAttribute('data-scale');
      const valStr = e.target.value.trim();

      if (valStr === '' || isNaN(Number(valStr))) {
        if (valStr === '') {
          updateInputsExcept(scaleKey, '');
        }
        return;
      }

      const num = parseFloat(valStr);
      currentCelsius = SCALES[scaleKey].toCelsius(num);
      activeScaleKey = scaleKey;

      updateInputsExcept(scaleKey);
      updateThermometerVisual();
      updateFormulaCards();
    });

    input.addEventListener('focus', (e) => {
      const scaleKey = e.target.getAttribute('data-scale');
      activeScaleKey = scaleKey;
      setActiveCard(scaleKey);
      updateFormulaCards();
    });
  });

  // Attach Copy Handlers
  container.querySelectorAll('.temp-copy-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const targetBtn = e.currentTarget;
      const scaleKey = targetBtn.getAttribute('data-copy-scale');
      const inputEl = document.getElementById(`temp-input-${scaleKey}`);
      if (inputEl) {
        copyToClipboard(inputEl.value, SCALES[scaleKey].symbol);
        showCopiedState(targetBtn);
      }
    });
  });
}

// Update all input values except the one being edited
function updateInputsExcept(exceptKey, overrideVal = null) {
  Object.keys(SCALES).forEach(key => {
    if (key === exceptKey) return;
    const input = document.getElementById(`temp-input-${key}`);
    if (input) {
      if (overrideVal !== null) {
        input.value = overrideVal;
      } else {
        const val = SCALES[key].fromCelsius(currentCelsius);
        input.value = formatTemp(val);
      }
    }
  });

  setActiveCard(activeScaleKey);
}

function setActiveCard(scaleKey) {
  document.querySelectorAll('.temp-card').forEach(card => card.classList.remove('active-card'));
  const active = document.getElementById(`temp-card-${scaleKey}`);
  if (active) active.classList.add('active-card');
}

// Animated Vertical Thermometer Graphic & Color Transitions
function updateThermometerVisual() {
  const stem = document.getElementById('thermo-liquid-stem');
  const bulb = document.getElementById('thermo-liquid-bulb');
  const stopBulb = document.getElementById('grad-stop-bulb');
  const stopMeniscus = document.getElementById('grad-stop-meniscus');
  const readout = document.getElementById('thermo-digital-val');
  const descEl = document.getElementById('thermo-state-desc');
  const statusPill = document.getElementById('thermo-status-pill');

  if (!stem || !bulb) return;

  // Temperature ranges: visual calibration between -50°C (bottom) and 100°C (top)
  const minC = -50;
  const maxC = 100;
  let fraction = (currentCelsius - minC) / (maxC - minC);
  fraction = Math.max(0.02, Math.min(0.98, fraction));

  // Travel height calculation:
  // Base at y = 255. Min height = 12px, Max height = 215px.
  const height = 12 + fraction * 203;
  const y = 255 - height;

  stem.setAttribute('height', height.toFixed(1));
  stem.setAttribute('y', y.toFixed(1));

  // Color gradient transition palette
  let bulbColor, meniscusColor, stateText, statusTagColor;

  if (currentCelsius <= -270) {
    bulbColor = '#00f2fe';
    meniscusColor = '#4facfe';
    stateText = 'Near Absolute Zero (Cryogenic)';
    statusTagColor = 'var(--accent)';
  } else if (currentCelsius < 0) {
    bulbColor = '#00c6ff';
    meniscusColor = '#0072ff';
    stateText = 'Sub-Zero Freezing Range';
    statusTagColor = '#38bdf8';
  } else if (currentCelsius >= 0 && currentCelsius < 18) {
    bulbColor = '#38ef7d';
    meniscusColor = '#11998e';
    stateText = 'Cool / Chilly Range';
    statusTagColor = '#34d399';
  } else if (currentCelsius >= 18 && currentCelsius <= 26) {
    bulbColor = '#10b981';
    meniscusColor = '#059669';
    stateText = 'Comfortable Room Temperature';
    statusTagColor = 'var(--success)';
  } else if (currentCelsius > 26 && currentCelsius <= 38) {
    bulbColor = '#f59e0b';
    meniscusColor = '#d97706';
    stateText = 'Warm / Human Body Range';
    statusTagColor = '#fbbf24';
  } else if (currentCelsius > 38 && currentCelsius <= 100) {
    bulbColor = '#ef4444';
    meniscusColor = '#dc2626';
    stateText = 'Hot / Water Boiling Boundary';
    statusTagColor = 'var(--error)';
  } else {
    bulbColor = '#a855f7';
    meniscusColor = '#ec4899';
    stateText = 'Superheated / Plasma State';
    statusTagColor = '#f43f5e';
  }

  bulb.setAttribute('fill', bulbColor);
  if (stopBulb) stopBulb.setAttribute('stop-color', bulbColor);
  if (stopMeniscus) stopMeniscus.setAttribute('stop-color', meniscusColor);

  if (readout) {
    readout.textContent = `${formatTemp(currentCelsius)} °C / ${formatTemp(SCALES.F.fromCelsius(currentCelsius))} °F`;
  }

  if (descEl) {
    descEl.textContent = stateText;
  }

  if (statusPill) {
    statusPill.textContent = stateText;
    statusPill.style.color = statusTagColor;
    statusPill.style.borderColor = statusTagColor;
  }
}

// Step-by-Step Conversion Formula Cards
function updateFormulaCards() {
  const container = document.getElementById('formula-cards-container');
  const label = document.getElementById('active-scale-label');
  if (!container) return;

  const active = SCALES[activeScaleKey];
  if (label) label.textContent = `${active.name} (${active.symbol})`;

  container.innerHTML = '';

  const activeVal = active.fromCelsius(currentCelsius);
  const activeValStr = formatTemp(activeVal);

  Object.entries(SCALES).forEach(([key, info]) => {
    if (key === activeScaleKey) return;

    const card = document.createElement('div');
    card.className = 'formula-card-item';

    // Build specific algebraic equation and calculated value step
    let equation = '';
    let stepCalc = '';
    const targetVal = formatTemp(info.fromCelsius(currentCelsius));

    if (activeScaleKey === 'C') {
      if (key === 'F') {
        equation = `[°F] = ([°C] × 9/5) + 32`;
        stepCalc = `(${activeValStr} × 1.8) + 32 = ${targetVal} °F`;
      } else if (key === 'K') {
        equation = `[K] = [°C] + 273.15`;
        stepCalc = `${activeValStr} + 273.15 = ${targetVal} K`;
      } else if (key === 'R') {
        equation = `[°R] = ([°C] + 273.15) × 9/5`;
        stepCalc = `(${activeValStr} + 273.15) × 1.8 = ${targetVal} °R`;
      } else if (key === 'Re') {
        equation = `[°Ré] = [°C] × 4/5`;
        stepCalc = `${activeValStr} × 0.8 = ${targetVal} °Ré`;
      } else if (key === 'Ro') {
        equation = `[°Rø] = ([°C] × 21/40) + 7.5`;
        stepCalc = `(${activeValStr} × 0.525) + 7.5 = ${targetVal} °Rø`;
      }
    } else if (activeScaleKey === 'F') {
      if (key === 'C') {
        equation = `[°C] = ([°F] - 32) × 5/9`;
        stepCalc = `(${activeValStr} - 32) × 0.5556 = ${targetVal} °C`;
      } else if (key === 'K') {
        equation = `[K] = ([°F] - 32) × 5/9 + 273.15`;
        stepCalc = `(${activeValStr} - 32) / 1.8 + 273.15 = ${targetVal} K`;
      } else if (key === 'R') {
        equation = `[°R] = [°F] + 459.67`;
        stepCalc = `${activeValStr} + 459.67 = ${targetVal} °R`;
      } else {
        equation = `Convert via Celsius: [${info.symbol}]`;
        stepCalc = `${activeValStr} °F → ${formatTemp(currentCelsius)} °C → ${targetVal} ${info.symbol}`;
      }
    } else if (activeScaleKey === 'K') {
      if (key === 'C') {
        equation = `[°C] = [K] - 273.15`;
        stepCalc = `${activeValStr} - 273.15 = ${targetVal} °C`;
      } else if (key === 'F') {
        equation = `[°F] = ([K] - 273.15) × 9/5 + 32`;
        stepCalc = `(${activeValStr} - 273.15) × 1.8 + 32 = ${targetVal} °F`;
      } else if (key === 'R') {
        equation = `[°R] = [K] × 1.8`;
        stepCalc = `${activeValStr} × 1.8 = ${targetVal} °R`;
      } else {
        equation = `Convert via Celsius: [${info.symbol}]`;
        stepCalc = `${activeValStr} K → ${formatTemp(currentCelsius)} °C → ${targetVal} ${info.symbol}`;
      }
    } else {
      equation = `Convert via Celsius reference [${info.symbol}]`;
      stepCalc = `${activeValStr} ${active.symbol} → ${formatTemp(currentCelsius)} °C → ${targetVal} ${info.symbol}`;
    }

    card.innerHTML = `
      <div class="formula-card-title">${active.name} to ${info.name}</div>
      <div class="formula-eq">${equation}</div>
      <div class="formula-step-calc">${stepCalc}</div>
    `;

    container.appendChild(card);
  });
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

// Event Listeners Initialization
function initEventListeners() {
  // Precision Slider
  const precisionSlider = document.getElementById('temp-precision-slider');
  const precisionVal = document.getElementById('temp-precision-val');
  if (precisionSlider) {
    precisionSlider.addEventListener('input', (e) => {
      precision = parseInt(e.target.value, 10);
      if (precisionVal) precisionVal.textContent = precision;
      updateInputsExcept(null);
      updateThermometerVisual();
      updateFormulaCards();
    });
  }

  // Quick Preset Buttons
  const resetRoomBtn = document.getElementById('reset-room-btn');
  if (resetRoomBtn) {
    resetRoomBtn.addEventListener('click', () => {
      currentCelsius = 20.0;
      activeScaleKey = 'C';
      updateInputsExcept(null);
      updateThermometerVisual();
      updateFormulaCards();
      showToast('Set to Room Temperature (20 °C)');
    });
  }

  const freezeBtn = document.getElementById('freeze-btn');
  if (freezeBtn) {
    freezeBtn.addEventListener('click', () => {
      currentCelsius = 0.0;
      activeScaleKey = 'C';
      updateInputsExcept(null);
      updateThermometerVisual();
      updateFormulaCards();
      showToast('Set to Freezing Point (0 °C)');
    });
  }

  const boilBtn = document.getElementById('boil-btn');
  if (boilBtn) {
    boilBtn.addEventListener('click', () => {
      currentCelsius = 100.0;
      activeScaleKey = 'C';
      updateInputsExcept(null);
      updateThermometerVisual();
      updateFormulaCards();
      showToast('Set to Boiling Point (100 °C)');
    });
  }

  // Benchmark Milestone Pills
  document.querySelectorAll('.benchmark-pill').forEach(btn => {
    btn.addEventListener('click', () => {
      const cVal = parseFloat(btn.getAttribute('data-c'));
      if (isNaN(cVal)) return;

      currentCelsius = cVal;
      activeScaleKey = 'C';
      updateInputsExcept(null);
      updateThermometerVisual();
      updateFormulaCards();
      showToast(`Loaded milestone: ${cVal} °C`);
    });
  });
}

// DOM Ready
document.addEventListener('DOMContentLoaded', () => {
  renderScaleCards();
  initEventListeners();
  updateThermometerVisual();
  updateFormulaCards();
});