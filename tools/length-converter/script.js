// Length Converter - Precision Distance Matrix
// Complete Client-Side Vanilla JS Implementation

// Unit definitions with conversion factor to base meter (m)
const UNITS = {
  nm: { name: 'Nanometers', symbol: 'nm', toMeters: 1e-9, category: 'Nanoscale' },
  um: { name: 'Micrometers', symbol: 'µm', toMeters: 1e-6, category: 'Microscopic' },
  mm: { name: 'Millimeters', symbol: 'mm', toMeters: 0.001, category: 'Metric' },
  cm: { name: 'Centimeters', symbol: 'cm', toMeters: 0.01, category: 'Metric' },
  m:  { name: 'Meters', symbol: 'm', toMeters: 1.0, category: 'Metric (SI Base)' },
  km: { name: 'Kilometers', symbol: 'km', toMeters: 1000.0, category: 'Metric' },
  in: { name: 'Inches', symbol: 'in', toMeters: 0.0254, category: 'Imperial' },
  ft: { name: 'Feet', symbol: 'ft', toMeters: 0.3048, category: 'Imperial' },
  yd: { name: 'Yards', symbol: 'yd', toMeters: 0.9144, category: 'Imperial' },
  mi: { name: 'Miles', symbol: 'mi', toMeters: 1609.344, category: 'Imperial' },
  nmi: { name: 'Nautical Miles', symbol: 'nmi', toMeters: 1852.0, category: 'Maritime' }
};

// Application State
let currentBaseMeters = 1.0;
let precision = 4;
let isScientific = false;
let activeUnitKey = 'm';
let heroFromKey = 'm';
let heroToKey = 'ft';

// Helper to format numbers according to precision & scientific settings
function formatValue(num) {
  if (num === null || isNaN(num)) return '';
  if (num === 0) return '0';

  if (isScientific) {
    return num.toExponential(precision);
  }

  // If number is extremely small or large and precision is small, auto-exponential
  const abs = Math.abs(num);
  if ((abs < 1e-6 && abs > 0) || abs >= 1e12) {
    return num.toExponential(precision);
  }

  // Format to decimal places and strip trailing zeros for clean readability
  let fixed = num.toFixed(precision);
  if (fixed.includes('.')) {
    fixed = fixed.replace(/\.?0+$/, '');
  }
  return fixed === '' ? '0' : fixed;
}

// Convert from any unit to base meters
function convertToMeters(value, fromKey) {
  const factor = UNITS[fromKey]?.toMeters || 1.0;
  return value * factor;
}

// Convert from base meters to any unit
function convertFromMeters(meters, toKey) {
  const factor = UNITS[toKey]?.toMeters || 1.0;
  return meters / factor;
}

// Initialize and render all Matrix Unit Cards
function renderMatrixCards() {
  const container = document.getElementById('unit-cards-container');
  if (!container) return;

  container.innerHTML = '';

  Object.entries(UNITS).forEach(([key, info]) => {
    const card = document.createElement('div');
    card.className = `unit-card ${key === activeUnitKey ? 'active-unit' : ''}`;
    card.id = `unit-card-${key}`;

    card.innerHTML = `
      <div class="unit-header">
        <div class="unit-title-group">
          <span class="unit-symbol">${info.symbol}</span>
          <span class="unit-name">${info.name}</span>
        </div>
        <span class="unit-tag">${info.category}</span>
      </div>
      <div class="unit-input-wrapper">
        <input type="text" 
               inputmode="decimal" 
               id="input-${key}" 
               class="unit-input" 
               data-unit="${key}" 
               value="${formatValue(convertFromMeters(currentBaseMeters, key))}"
               placeholder="0"
               aria-label="${info.name}">
        <button type="button" class="card-copy-btn" data-copy-unit="${key}" title="Copy ${info.symbol} value" aria-label="Copy ${info.name} value">
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
  container.querySelectorAll('.unit-input').forEach(input => {
    input.addEventListener('input', (e) => {
      const unitKey = e.target.getAttribute('data-unit');
      const valStr = e.target.value.trim();

      if (valStr === '' || isNaN(Number(valStr))) {
        if (valStr === '') {
          currentBaseMeters = 0;
          updateAllUIExcept(unitKey, '');
        }
        return;
      }

      const numVal = parseFloat(valStr);
      currentBaseMeters = convertToMeters(numVal, unitKey);
      activeUnitKey = unitKey;
      heroFromKey = unitKey;

      updateAllUIExcept(unitKey);
      updateHeroInputs();
      updateFormulaCard();
      updateScaleRuler();
    });

    input.addEventListener('focus', (e) => {
      const unitKey = e.target.getAttribute('data-unit');
      setActiveCard(unitKey);
    });
  });

  // Attach 1-click copy buttons
  container.querySelectorAll('.card-copy-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const targetBtn = e.currentTarget;
      const unitKey = targetBtn.getAttribute('data-copy-unit');
      const inputEl = document.getElementById(`input-${unitKey}`);
      if (inputEl) {
        copyToClipboard(inputEl.value, UNITS[unitKey].symbol);
        showCopiedState(targetBtn);
      }
    });
  });
}

// Update all card inputs except the one currently being typed in
function updateAllUIExcept(exceptKey, overrideVal = null) {
  Object.keys(UNITS).forEach(key => {
    if (key === exceptKey) return;
    const input = document.getElementById(`input-${key}`);
    if (input) {
      if (overrideVal !== null) {
        input.value = overrideVal;
      } else {
        const converted = convertFromMeters(currentBaseMeters, key);
        input.value = formatValue(converted);
      }
    }
  });

  setActiveCard(activeUnitKey);
}

// Highlight active card
function setActiveCard(unitKey) {
  document.querySelectorAll('.unit-card').forEach(card => card.classList.remove('active-unit'));
  const activeCard = document.getElementById(`unit-card-${unitKey}`);
  if (activeCard) activeCard.classList.add('active-unit');
}

// Update Hero Converter Controls
function updateHeroInputs() {
  const fromInput = document.getElementById('hero-from-val');
  const toInput = document.getElementById('hero-to-val');
  const fromSelect = document.getElementById('hero-from-unit');
  const toSelect = document.getElementById('hero-to-unit');

  if (fromSelect) fromSelect.value = heroFromKey;
  if (toSelect) toSelect.value = heroToKey;

  if (fromInput) {
    const fromVal = convertFromMeters(currentBaseMeters, heroFromKey);
    fromInput.value = formatValue(fromVal);
  }

  if (toInput) {
    const toVal = convertFromMeters(currentBaseMeters, heroToKey);
    toInput.value = formatValue(toVal);
  }
}

// Update Dynamic Formula Breakdown Card
function updateFormulaCard() {
  const textEl = document.getElementById('formula-text');
  const stepsEl = document.getElementById('formula-steps');
  const baseEl = document.getElementById('formula-base-step');
  if (!textEl || !stepsEl) return;

  const fromInfo = UNITS[heroFromKey];
  const toInfo = UNITS[heroToKey];
  if (!fromInfo || !toInfo) return;

  // Conversion ratio: 1 from = (fromToMeters / toToMeters) to
  const ratio = fromInfo.toMeters / toInfo.toMeters;
  const ratioFormatted = formatValue(ratio);

  textEl.textContent = `1 ${fromInfo.symbol} = ${ratioFormatted} ${toInfo.symbol}`;

  if (heroFromKey === heroToKey) {
    stepsEl.textContent = `Identical units. Value remains unchanged.`;
  } else if (ratio > 1) {
    stepsEl.innerHTML = `Multiply the length in <strong>${fromInfo.name}</strong> by <code>${ratioFormatted}</code> to get <strong>${toInfo.name}</strong>.`;
  } else {
    const inverse = 1 / ratio;
    const invFormatted = formatValue(inverse);
    stepsEl.innerHTML = `Divide the length in <strong>${fromInfo.name}</strong> by <code>${invFormatted}</code> (or multiply by <code>${ratioFormatted}</code>) to get <strong>${toInfo.name}</strong>.`;
  }

  if (baseEl) {
    baseEl.textContent = `Base SI Relation: 1 ${fromInfo.symbol} = ${formatValue(fromInfo.toMeters)} m | 1 ${toInfo.symbol} = ${formatValue(toInfo.toMeters)} m`;
  }
}

// Update Logarithmic Visual Ruler Pointer & Scale Indicator
function updateScaleRuler() {
  const pointer = document.getElementById('ruler-pointer');
  const badge = document.getElementById('pointer-badge');
  const textDesc = document.getElementById('scale-indicator-text');
  if (!pointer || !badge) return;

  const meters = Math.max(1e-12, Math.abs(currentBaseMeters));
  // Range: 1e-9 m (nm) to 4e7 m (~Earth circumference)
  // log10(1e-9) = -9, log10(4e7) ~ 7.6. Total span = 16.6
  const minLog = -9;
  const maxLog = 7.6;
  const curLog = Math.log10(meters);

  let percent = ((curLog - minLog) / (maxLog - minLog)) * 100;
  percent = Math.max(2, Math.min(98, percent));

  pointer.style.left = `${percent}%`;

  // Determine friendly scale category description
  let desc = 'Human Scale';
  if (meters < 1e-7) {
    desc = 'Atomic & Nanoscale';
  } else if (meters < 1e-4) {
    desc = 'Microscopic (Cells & Dust)';
  } else if (meters < 0.01) {
    desc = 'Millimeter (Everyday Small)';
  } else if (meters < 10) {
    desc = 'Everyday Object & Human Scale';
  } else if (meters < 1000) {
    desc = 'Architecture & Athletic Fields';
  } else if (meters < 100000) {
    desc = 'Geographic & City Scale';
  } else {
    desc = 'Planetary & Continental Scale';
  }

  badge.textContent = `${formatValue(convertFromMeters(currentBaseMeters, activeUnitKey))} ${UNITS[activeUnitKey]?.symbol || 'm'}`;
  if (textDesc) {
    textDesc.textContent = `${desc} (~${formatValue(meters)} m)`;
  }
}

// 1-Click Copy with Clipboard API and Toast
function copyToClipboard(text, symbol) {
  if (!text) return;
  const copyStr = `${text} ${symbol ? symbol : ''}`.trim();
  navigator.clipboard.writeText(copyStr).then(() => {
    showToast(`Copied ${copyStr} to clipboard!`);
  }).catch(() => {
    // Fallback for older browsers
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

// Set up event listeners
function initEventListeners() {
  // Precision Slider
  const precisionSlider = document.getElementById('precision-slider');
  const precisionVal = document.getElementById('precision-val');
  if (precisionSlider) {
    precisionSlider.addEventListener('input', (e) => {
      precision = parseInt(e.target.value, 10);
      if (precisionVal) precisionVal.textContent = precision;
      updateAllUIExcept(null);
      updateHeroInputs();
      updateFormulaCard();
      updateScaleRuler();
    });
  }

  // Scientific Notation Toggle
  const sciToggle = document.getElementById('sci-toggle');
  if (sciToggle) {
    sciToggle.addEventListener('change', (e) => {
      isScientific = e.target.checked;
      updateAllUIExcept(null);
      updateHeroInputs();
      updateFormulaCard();
      updateScaleRuler();
    });
  }

  // Reset Button
  const resetBtn = document.getElementById('reset-btn');
  if (resetBtn) {
    resetBtn.addEventListener('click', () => {
      currentBaseMeters = 1.0;
      activeUnitKey = 'm';
      heroFromKey = 'm';
      heroToKey = 'ft';
      updateAllUIExcept(null);
      updateHeroInputs();
      updateFormulaCard();
      updateScaleRuler();
      showToast('Reset to 1 Meter');
    });
  }

  // Clear Button
  const clearBtn = document.getElementById('clear-btn');
  if (clearBtn) {
    clearBtn.addEventListener('click', () => {
      currentBaseMeters = 0;
      updateAllUIExcept(null, '');
      const fromInput = document.getElementById('hero-from-val');
      const toInput = document.getElementById('hero-to-val');
      if (fromInput) fromInput.value = '';
      if (toInput) toInput.value = '';
      updateFormulaCard();
      updateScaleRuler();
      showToast('Cleared input values');
    });
  }

  // Hero From Input
  const heroFromVal = document.getElementById('hero-from-val');
  if (heroFromVal) {
    heroFromVal.addEventListener('input', (e) => {
      const val = parseFloat(e.target.value);
      if (isNaN(val)) {
        currentBaseMeters = 0;
        updateAllUIExcept(null, '');
      } else {
        currentBaseMeters = convertToMeters(val, heroFromKey);
        activeUnitKey = heroFromKey;
        updateAllUIExcept(null);
        updateHeroInputs();
        updateFormulaCard();
        updateScaleRuler();
      }
    });
  }

  // Hero From Unit Select
  const heroFromUnit = document.getElementById('hero-from-unit');
  if (heroFromUnit) {
    heroFromUnit.addEventListener('change', (e) => {
      heroFromKey = e.target.value;
      activeUnitKey = heroFromKey;
      const heroFromValEl = document.getElementById('hero-from-val');
      const val = parseFloat(heroFromValEl?.value || '1');
      currentBaseMeters = convertToMeters(val, heroFromKey);

      updateAllUIExcept(null);
      updateHeroInputs();
      updateFormulaCard();
      updateScaleRuler();
    });
  }

  // Hero To Unit Select
  const heroToUnit = document.getElementById('hero-to-unit');
  if (heroToUnit) {
    heroToUnit.addEventListener('change', (e) => {
      heroToKey = e.target.value;
      updateHeroInputs();
      updateFormulaCard();
    });
  }

  // Hero Swap Button
  const heroSwapBtn = document.getElementById('hero-swap-btn');
  if (heroSwapBtn) {
    heroSwapBtn.addEventListener('click', () => {
      const tempKey = heroFromKey;
      heroFromKey = heroToKey;
      heroToKey = tempKey;

      activeUnitKey = heroFromKey;
      updateHeroInputs();
      updateFormulaCard();
      setActiveCard(activeUnitKey);
      showToast(`Swapped units: ${UNITS[heroFromKey].name} ⇄ ${UNITS[heroToKey].name}`);
    });
  }

  // Milestone Benchmark Pills
  document.querySelectorAll('.benchmark-pill').forEach(btn => {
    btn.addEventListener('click', () => {
      const unit = btn.getAttribute('data-unit');
      const val = parseFloat(btn.getAttribute('data-val'));
      if (isNaN(val) || !UNITS[unit]) return;

      currentBaseMeters = convertToMeters(val, unit);
      activeUnitKey = unit;
      heroFromKey = unit;

      updateAllUIExcept(null);
      updateHeroInputs();
      updateFormulaCard();
      updateScaleRuler();
      showToast(`Loaded benchmark: ${val} ${UNITS[unit].symbol}`);
    });
  });
}

// Initialize on DOM ready
document.addEventListener('DOMContentLoaded', () => {
  renderMatrixCards();
  initEventListeners();
  updateHeroInputs();
  updateFormulaCard();
  updateScaleRuler();
});