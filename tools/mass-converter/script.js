// Mass & Weight Converter - Universal Matrix & Balance Scale
// Complete Client-Side Vanilla JS Implementation

const MASS_UNITS = {
  mg:    { name: 'Milligrams', symbol: 'mg', toKg: 1e-6, category: 'Metric' },
  g:     { name: 'Grams', symbol: 'g', toKg: 1e-3, category: 'Metric' },
  kg:    { name: 'Kilograms', symbol: 'kg', toKg: 1.0, category: 'SI Base' },
  t:     { name: 'Metric Tonnes', symbol: 't', toKg: 1000.0, category: 'Heavy Metric' },
  oz:    { name: 'Ounces', symbol: 'oz', toKg: 0.028349523125, category: 'Imperial' },
  lb:    { name: 'Pounds', symbol: 'lb', toKg: 0.45359237, category: 'Imperial' },
  st:    { name: 'Stone', symbol: 'st', toKg: 6.35029318, category: 'UK / Imperial' },
  uston: { name: 'Short Tons', symbol: 'US tn', toKg: 907.18474, category: 'US Customary' },
  ukton: { name: 'Long Tons', symbol: 'UK tn', toKg: 1016.0469088, category: 'Imperial Heavy' },
  ozt:   { name: 'Troy Ounces', symbol: 'oz t', toKg: 0.0311034768, category: 'Precious Metals' },
  ct:    { name: 'Carats', symbol: 'ct', toKg: 0.0002, category: 'Gems & Jewelry' }
};

const BENCHMARKS = {
  sand:       { name: 'Grain of Sand', kg: 0.00000005, display: '0.05 mg' },
  penny:      { name: 'US Penny', kg: 0.0025, display: '2.5 g' },
  smartphone: { name: 'Smartphone', kg: 0.18, display: '180 g' },
  water_gal:  { name: 'Gallon of Water', kg: 3.78541, display: '3.785 kg' },
  human:      { name: 'Adult Human', kg: 70.0, display: '70 kg' },
  gold_bar:   { name: 'Standard Gold Bar', kg: 12.44139, display: '400 oz t (12.44 kg)' },
  car:        { name: 'Compact Car', kg: 1400.0, display: '1,400 kg' }
};

// Application State
let currentKg = 1.0;
let precision = 4;
let isScientific = false;
let activeUnitKey = 'kg';
let compareBenchmarkKey = 'human';

// Number Formatting Helper
function formatMass(num) {
  if (num === null || isNaN(num)) return '';
  if (num === 0) return '0';

  if (isScientific) {
    return num.toExponential(precision);
  }

  const abs = Math.abs(num);
  if ((abs < 1e-5 && abs > 0) || abs >= 1e11) {
    return num.toExponential(precision);
  }

  let fixed = num.toFixed(precision);
  if (fixed.includes('.')) {
    fixed = fixed.replace(/\.?0+$/, '');
  }
  return fixed === '' ? '0' : fixed;
}

// Convert functions
function toBaseKg(val, unitKey) {
  const factor = MASS_UNITS[unitKey]?.toKg || 1.0;
  return val * factor;
}

function fromBaseKg(kg, unitKey) {
  const factor = MASS_UNITS[unitKey]?.toKg || 1.0;
  return kg / factor;
}

// Render Mass Cards
function renderMassCards() {
  const container = document.getElementById('mass-cards-container');
  if (!container) return;

  container.innerHTML = '';

  Object.entries(MASS_UNITS).forEach(([key, info]) => {
    const card = document.createElement('div');
    card.className = `mass-unit-card ${key === activeUnitKey ? 'active-unit' : ''}`;
    card.id = `mass-card-${key}`;

    card.innerHTML = `
      <div class="mass-header">
        <div class="mass-title-group">
          <span class="mass-symbol">${info.symbol}</span>
          <span class="mass-name">${info.name}</span>
        </div>
        <span class="mass-tag">${info.category}</span>
      </div>
      <div class="mass-input-wrapper">
        <input type="text" 
               inputmode="decimal" 
               id="mass-input-${key}" 
               class="mass-input" 
               data-unit="${key}" 
               value="${formatMass(fromBaseKg(currentKg, key))}"
               placeholder="0"
               aria-label="${info.name}">
        <button type="button" class="mass-copy-btn" data-copy-unit="${key}" title="Copy ${info.symbol} value" aria-label="Copy ${info.name}">
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
  container.querySelectorAll('.mass-input').forEach(input => {
    input.addEventListener('input', (e) => {
      const unitKey = e.target.getAttribute('data-unit');
      const valStr = e.target.value.trim();

      if (valStr === '' || isNaN(Number(valStr))) {
        if (valStr === '') {
          currentKg = 0;
          updateInputsExcept(unitKey, '');
        }
        return;
      }

      const num = parseFloat(valStr);
      currentKg = toBaseKg(num, unitKey);
      activeUnitKey = unitKey;

      updateInputsExcept(unitKey);
      updateBalanceScale();
      updateFormulaCard();
    });

    input.addEventListener('focus', (e) => {
      const unitKey = e.target.getAttribute('data-unit');
      activeUnitKey = unitKey;
      setActiveCard(unitKey);
      updateFormulaCard();
    });
  });

  // Attach 1-click copy buttons
  container.querySelectorAll('.mass-copy-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const targetBtn = e.currentTarget;
      const unitKey = targetBtn.getAttribute('data-copy-unit');
      const inputEl = document.getElementById(`mass-input-${unitKey}`);
      if (inputEl) {
        copyToClipboard(inputEl.value, MASS_UNITS[unitKey].symbol);
        showCopiedState(targetBtn);
      }
    });
  });
}

// Update all input values except active one
function updateInputsExcept(exceptKey, overrideVal = null) {
  Object.keys(MASS_UNITS).forEach(key => {
    if (key === exceptKey) return;
    const input = document.getElementById(`mass-input-${key}`);
    if (input) {
      if (overrideVal !== null) {
        input.value = overrideVal;
      } else {
        const converted = fromBaseKg(currentKg, key);
        input.value = formatMass(converted);
      }
    }
  });

  setActiveCard(activeUnitKey);
}

function setActiveCard(unitKey) {
  document.querySelectorAll('.mass-unit-card').forEach(card => card.classList.remove('active-unit'));
  const active = document.getElementById(`mass-card-${unitKey}`);
  if (active) active.classList.add('active-unit');
}

// Interactive Balance Scale Animation & Physics
function updateBalanceScale() {
  const beamGroup = document.getElementById('scale-beam-group');
  const needle = document.getElementById('scale-needle');
  const leftPan = document.getElementById('left-pan-group');
  const rightPan = document.getElementById('right-pan-group');
  const statusText = document.getElementById('scale-status-text');
  const detailsText = document.getElementById('scale-details-text');
  const leftDot = document.getElementById('left-pan-dot');
  const rightDot = document.getElementById('right-pan-dot');

  if (!beamGroup || !needle || !leftPan || !rightPan) return;

  // Determine comparison weight
  let targetKg = 70.0;
  let targetName = 'Adult Human (70 kg)';

  if (compareBenchmarkKey === 'custom') {
    targetKg = currentKg;
    targetName = 'Current Active Weight';
  } else if (BENCHMARKS[compareBenchmarkKey]) {
    targetKg = BENCHMARKS[compareBenchmarkKey].kg;
    targetName = `${BENCHMARKS[compareBenchmarkKey].name} (${BENCHMARKS[compareBenchmarkKey].display})`;
  }

  // Calculate tilt physics angle
  // fulcrum at (170, 75). Half beam length = 120
  const beamHalfLen = 120;
  let angleDeg = 0;

  const diff = currentKg - targetKg;
  const maxWeight = Math.max(currentKg, targetKg);

  if (maxWeight > 0 && Math.abs(diff) > 1e-9) {
    // Logarithmic ratio for broad dynamic range
    const ratio = Math.log10(Math.max(1e-9, currentKg)) - Math.log10(Math.max(1e-9, targetKg));
    // Clamped angle between -15 deg and +15 deg
    // Counter-clockwise (negative angle): left drops, right rises
    angleDeg = -Math.max(-15, Math.min(15, ratio * 7.5));
  }

  // Rotate beam group around fulcrum (170, 75)
  beamGroup.setAttribute('transform', `rotate(${angleDeg}, 170, 75)`);

  // Needle rotates with beam
  needle.setAttribute('transform', `rotate(${angleDeg}, 170, 75)`);

  // Calculate vertical offset of ends to translate pans keeping them hanging straight down
  const angleRad = (angleDeg * Math.PI) / 180;
  const dy = beamHalfLen * Math.sin(angleRad); // left end moves by dy, right end moves by -dy

  leftPan.setAttribute('transform', `translate(0, ${dy})`);
  rightPan.setAttribute('transform', `translate(0, ${-dy})`);

  // Update object dot radius based on mass visual scale
  if (leftDot) {
    const leftRadius = Math.max(5, Math.min(14, 5 + Math.log10(Math.max(1, currentKg * 1000)) * 1.5));
    leftDot.setAttribute('r', leftRadius.toFixed(1));
  }
  if (rightDot) {
    const rightRadius = Math.max(5, Math.min(14, 5 + Math.log10(Math.max(1, targetKg * 1000)) * 1.5));
    rightDot.setAttribute('r', rightRadius.toFixed(1));
  }

  // Status & text badge
  const percentDiff = maxWeight > 0 ? (Math.abs(diff) / maxWeight) * 100 : 0;
  if (percentDiff < 0.5 || Math.abs(diff) < 1e-9) {
    statusText.textContent = '⚖️ Equilibrium: Perfect Balance!';
    statusText.style.color = 'var(--success)';
    detailsText.textContent = `Left (${formatMass(currentKg)} kg) is equal to Right (${formatMass(targetKg)} kg)`;
  } else if (currentKg > targetKg) {
    statusText.textContent = 'Left Pan is Heavier ⬇';
    statusText.style.color = 'var(--accent)';
    detailsText.textContent = `Active (${formatMass(currentKg)} kg) outweighs ${targetName}`;
  } else {
    statusText.textContent = 'Right Pan is Heavier ⬇';
    statusText.style.color = '#f59e0b';
    detailsText.textContent = `${targetName} outweighs Active (${formatMass(currentKg)} kg)`;
  }
}

// Update Formula Card
function updateFormulaCard() {
  const textEl = document.getElementById('mass-formula-text');
  const stepsEl = document.getElementById('mass-formula-steps');
  const troyEl = document.getElementById('mass-formula-troy');
  if (!textEl || !stepsEl) return;

  const active = MASS_UNITS[activeUnitKey];
  if (!active) return;

  // Formula relative to Pounds (lb) or Kilograms (kg)
  const toKgRatio = active.toKg;
  const toLbRatio = active.toKg / MASS_UNITS.lb.toKg;

  textEl.textContent = `1 ${active.symbol} = ${formatMass(toKgRatio)} kg = ${formatMass(toLbRatio)} lb`;

  if (activeUnitKey === 'kg') {
    stepsEl.innerHTML = `<strong>Kilograms (kg)</strong> is the International SI Base Unit. 1 kg = 2.20462262 lb (avoirdupois).`;
  } else if (activeUnitKey === 'ozt') {
    stepsEl.innerHTML = `<strong>Troy Ounce (oz t)</strong>: Standard international measurement for Gold, Silver, and Platinum bullion. 1 oz t = 31.1034768 grams.`;
  } else if (activeUnitKey === 'ct') {
    stepsEl.innerHTML = `<strong>Carat (ct)</strong>: Global standard unit for diamonds and precious gemstones. 1 carat = exactly 200 milligrams (0.2 g).`;
  } else {
    stepsEl.innerHTML = `To convert from <strong>${active.name}</strong> to Kilograms, multiply by <code>${formatMass(toKgRatio)}</code>.`;
  }

  if (troyEl) {
    troyEl.textContent = `Precious Metals: 1 Troy Oz = 31.103 g | 1 Gold Bar = 400 oz t (~12.44 kg) | 1 Carat = 0.200 g`;
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
  const precisionSlider = document.getElementById('mass-precision-slider');
  const precisionVal = document.getElementById('mass-precision-val');
  if (precisionSlider) {
    precisionSlider.addEventListener('input', (e) => {
      precision = parseInt(e.target.value, 10);
      if (precisionVal) precisionVal.textContent = precision;
      updateInputsExcept(null);
      updateBalanceScale();
      updateFormulaCard();
    });
  }

  // Scientific Notation Toggle
  const sciToggle = document.getElementById('mass-sci-toggle');
  if (sciToggle) {
    sciToggle.addEventListener('change', (e) => {
      isScientific = e.target.checked;
      updateInputsExcept(null);
      updateBalanceScale();
      updateFormulaCard();
    });
  }

  // Reset Button
  const resetKgBtn = document.getElementById('reset-kg-btn');
  if (resetKgBtn) {
    resetKgBtn.addEventListener('click', () => {
      currentKg = 1.0;
      activeUnitKey = 'kg';
      updateInputsExcept(null);
      updateBalanceScale();
      updateFormulaCard();
      showToast('Reset to 1 Kilogram');
    });
  }

  // Clear Button
  const clearBtn = document.getElementById('mass-clear-btn');
  if (clearBtn) {
    clearBtn.addEventListener('click', () => {
      currentKg = 0;
      updateInputsExcept(null, '');
      updateBalanceScale();
      updateFormulaCard();
      showToast('Cleared mass values');
    });
  }

  // Scale Compare Selector
  const compareSelect = document.getElementById('scale-compare-select');
  if (compareSelect) {
    compareSelect.addEventListener('change', (e) => {
      compareBenchmarkKey = e.target.value;
      updateBalanceScale();
    });
  }

  // Benchmark Milestone Pills
  document.querySelectorAll('.benchmark-pill').forEach(btn => {
    btn.addEventListener('click', () => {
      const unit = btn.getAttribute('data-unit');
      const val = parseFloat(btn.getAttribute('data-val'));
      if (isNaN(val) || !MASS_UNITS[unit]) return;

      currentKg = toBaseKg(val, unit);
      activeUnitKey = unit;

      updateInputsExcept(null);
      updateBalanceScale();
      updateFormulaCard();
      showToast(`Loaded benchmark: ${val} ${MASS_UNITS[unit].symbol}`);
    });
  });
}

// DOM Ready
document.addEventListener('DOMContentLoaded', () => {
  renderMassCards();
  initEventListeners();
  updateBalanceScale();
  updateFormulaCard();
});