// Ratio & Proportion Calculator Logic

document.addEventListener('DOMContentLoaded', () => {
  // Mode tabs switching
  const modeTabs = document.querySelectorAll('.mode-tab-btn');
  const sections = {
    solve: document.getElementById('section-solve'),
    simplify: document.getElementById('section-simplify'),
    divide: document.getElementById('section-divide'),
    aspect: document.getElementById('section-aspect')
  };

  modeTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      modeTabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');

      const targetMode = tab.getAttribute('data-mode');
      Object.keys(sections).forEach(mode => {
        if (sections[mode]) {
          sections[mode].style.display = (mode === targetMode) ? 'grid' : 'none';
        }
      });
    });
  });

  // ==========================================
  // HELPER: Math Utilities
  // ==========================================
  function gcd(a, b) {
    a = Math.abs(Math.round(a));
    b = Math.abs(Math.round(b));
    while (b) {
      const t = b;
      b = a % b;
      a = t;
    }
    return a;
  }

  function gcdArray(arr) {
    if (arr.length === 0) return 1;
    return arr.reduce((acc, val) => gcd(acc, val));
  }

  function formatDisplayNum(num) {
    if (isNaN(num)) return 'NaN';
    if (!isFinite(num)) return num > 0 ? 'Infinity' : '-Infinity';
    return Number(Number(num).toFixed(4)).toString();
  }

  // ==========================================
  // MODE 1: PROPORTION SOLVER (A/B = C/D)
  // ==========================================
  const propA = document.getElementById('prop-a');
  const propB = document.getElementById('prop-b');
  const propC = document.getElementById('prop-c');
  const propD = document.getElementById('prop-d');
  const btnPropSolve = document.getElementById('btn-prop-solve');
  const btnPropReset = document.getElementById('btn-prop-reset');
  const propResultVal = document.getElementById('prop-result-val');
  const propResultSub = document.getElementById('prop-result-sub');
  const propStepsContainer = document.getElementById('prop-steps-container');

  function isUnknown(val) {
    if (val === null || val === undefined) return true;
    const str = val.toString().trim().toLowerCase();
    return str === '' || str === 'x' || str === '?' || isNaN(Number(str));
  }

  function solveProportion() {
    const raw = {
      a: propA.value.trim(),
      b: propB.value.trim(),
      c: propC.value.trim(),
      d: propD.value.trim()
    };

    const unknowns = [];
    if (isUnknown(raw.a)) unknowns.push('A');
    if (isUnknown(raw.b)) unknowns.push('B');
    if (isUnknown(raw.c)) unknowns.push('C');
    if (isUnknown(raw.d)) unknowns.push('D');

    if (unknowns.length > 1) {
      propResultVal.textContent = 'Error';
      propResultSub.textContent = 'Please provide 3 known values';
      propStepsContainer.innerHTML = `<div class="solution-step" style="color: var(--error);">Cannot solve: found ${unknowns.length} unknowns (${unknowns.join(', ')}). Exactly 1 unknown is required.</div>`;
      return;
    }

    if (unknowns.length === 0) {
      const a = Number(raw.a);
      const b = Number(raw.b);
      const c = Number(raw.c);
      const d = Number(raw.d);

      if (b === 0 || d === 0) {
        propResultVal.textContent = 'Undefined';
        propResultSub.textContent = 'Division by zero';
        propStepsContainer.innerHTML = '<div class="solution-step" style="color: var(--error);">Error: Denominator B or D cannot be zero.</div>';
        return;
      }

      const leftRatio = a / b;
      const rightRatio = c / d;
      const isEq = Math.abs(leftRatio - rightRatio) < 1e-7;

      propResultVal.textContent = isEq ? 'True (=)' : 'False (≠)';
      propResultSub.textContent = isEq ? 'Proportion is balanced' : 'Ratios are unequal';
      propStepsContainer.innerHTML = `
        <div class="solution-step">1. Ratio A/B: ${a} / ${b} = ${formatDisplayNum(leftRatio)}</div>
        <div class="solution-step">2. Ratio C/D: ${c} / ${d} = ${formatDisplayNum(rightRatio)}</div>
        <div class="solution-step">3. Cross products: (${a} &times; ${d}) = ${a * d}, (${b} &times; ${c}) = ${b * c}</div>
        <div class="solution-step" style="color: ${isEq ? 'var(--success)' : 'var(--error)'}; font-weight: 600;">
          ${isEq ? '✓ The proportion is exact!' : '✗ The values do not form an equal proportion.'}
        </div>
      `;
      return;
    }

    const missing = unknowns[0];
    let calculated = 0;
    const steps = [];

    steps.push(`<div class="solution-step">1. Standard proportion equation: <strong>A / B = C / D</strong></div>`);
    steps.push(`<div class="solution-step">2. Cross multiplication property: <strong>A &times; D = B &times; C</strong></div>`);

    if (missing === 'D') {
      const a = Number(raw.a);
      const b = Number(raw.b);
      const c = Number(raw.c);
      if (a === 0) {
        propResultVal.textContent = 'Undefined';
        propResultSub.textContent = 'Division by zero (A = 0)';
        propStepsContainer.innerHTML = '<div class="solution-step" style="color: var(--error);">Cannot solve for D because A = 0 causes division by zero.</div>';
        return;
      }
      calculated = (b * c) / a;
      propD.value = formatDisplayNum(calculated);
      steps.push(`<div class="solution-step">3. Isolate D: D = (B &times; C) / A</div>`);
      steps.push(`<div class="solution-step">4. Substitute values: D = (${b} &times; ${c}) / ${a} = ${b * c} / ${a}</div>`);
      steps.push(`<div class="solution-step" style="color: var(--accent); font-weight:700;">5. Solved: D = ${formatDisplayNum(calculated)}</div>`);
    } else if (missing === 'C') {
      const a = Number(raw.a);
      const b = Number(raw.b);
      const d = Number(raw.d);
      if (b === 0) {
        propResultVal.textContent = 'Undefined';
        propResultSub.textContent = 'Division by zero (B = 0)';
        return;
      }
      calculated = (a * d) / b;
      propC.value = formatDisplayNum(calculated);
      steps.push(`<div class="solution-step">3. Isolate C: C = (A &times; D) / B</div>`);
      steps.push(`<div class="solution-step">4. Substitute values: C = (${a} &times; ${d}) / ${b} = ${a * d} / ${b}</div>`);
      steps.push(`<div class="solution-step" style="color: var(--accent); font-weight:700;">5. Solved: C = ${formatDisplayNum(calculated)}</div>`);
    } else if (missing === 'B') {
      const a = Number(raw.a);
      const c = Number(raw.c);
      const d = Number(raw.d);
      if (c === 0) {
        propResultVal.textContent = 'Undefined';
        propResultSub.textContent = 'Division by zero (C = 0)';
        return;
      }
      calculated = (a * d) / c;
      propB.value = formatDisplayNum(calculated);
      steps.push(`<div class="solution-step">3. Isolate B: B = (A &times; D) / C</div>`);
      steps.push(`<div class="solution-step">4. Substitute values: B = (${a} &times; ${d}) / ${c} = ${a * d} / ${c}</div>`);
      steps.push(`<div class="solution-step" style="color: var(--accent); font-weight:700;">5. Solved: B = ${formatDisplayNum(calculated)}</div>`);
    } else if (missing === 'A') {
      const b = Number(raw.b);
      const c = Number(raw.c);
      const d = Number(raw.d);
      if (d === 0) {
        propResultVal.textContent = 'Undefined';
        propResultSub.textContent = 'Division by zero (D = 0)';
        return;
      }
      calculated = (b * c) / d;
      propA.value = formatDisplayNum(calculated);
      steps.push(`<div class="solution-step">3. Isolate A: A = (B &times; C) / D</div>`);
      steps.push(`<div class="solution-step">4. Substitute values: A = (${b} &times; ${c}) / ${d} = ${b * c} / ${d}</div>`);
      steps.push(`<div class="solution-step" style="color: var(--accent); font-weight:700;">5. Solved: A = ${formatDisplayNum(calculated)}</div>`);
    }

    propResultVal.textContent = `${missing} = ${formatDisplayNum(calculated)}`;
    propResultSub.textContent = `Completed via cross multiplication`;
    propStepsContainer.innerHTML = steps.join('');
  }

  btnPropSolve.addEventListener('click', solveProportion);
  [propA, propB, propC, propD].forEach(inp => {
    inp.addEventListener('keydown', e => {
      if (e.key === 'Enter') solveProportion();
    });
  });

  btnPropReset.addEventListener('click', () => {
    propA.value = '4';
    propB.value = '10';
    propC.value = '8';
    propD.value = '';
    propResultVal.textContent = '-';
    propResultSub.textContent = 'Ready to solve';
    propStepsContainer.innerHTML = '<div class="solution-step" style="color: var(--text-tertiary);">Fill values on the left and click "Solve Proportion".</div>';
  });

  document.querySelectorAll('.prop-example').forEach(btn => {
    btn.addEventListener('click', () => {
      propA.value = btn.getAttribute('data-a');
      propB.value = btn.getAttribute('data-b');
      propC.value = btn.getAttribute('data-c');
      propD.value = btn.getAttribute('data-d');
      solveProportion();
    });
  });

  // ==========================================
  // MODE 2: RATIO SIMPLIFIER
  // ==========================================
  const simplifyInput = document.getElementById('simplify-input');
  const btnSimplifyCalc = document.getElementById('btn-simplify-calc');
  const btnSimplifyReset = document.getElementById('btn-simplify-reset');
  const simplifyResultRatio = document.getElementById('simplify-result-ratio');
  const simplifyResultGcd = document.getElementById('simplify-result-gcd');
  const simplifyExplanation = document.getElementById('simplify-explanation');

  function simplifyRatio() {
    const raw = simplifyInput.value.trim();
    if (!raw) {
      simplifyResultRatio.textContent = '-';
      simplifyResultGcd.textContent = 'GCD: -';
      simplifyExplanation.innerHTML = '<div class="solution-step">Please enter a valid ratio.</div>';
      return;
    }

    // Split by colons, commas, or spaces
    const parts = raw.split(/[:,\s]+/).map(p => p.trim()).filter(p => p !== '');
    if (parts.length < 2) {
      simplifyResultRatio.textContent = 'Invalid';
      simplifyResultGcd.textContent = 'Error';
      simplifyExplanation.innerHTML = '<div class="solution-step" style="color: var(--error);">Please provide at least 2 numbers in the ratio (e.g. 1920:1080).</div>';
      return;
    }

    const numbers = parts.map(Number);
    if (numbers.some(n => isNaN(n) || n <= 0)) {
      simplifyResultRatio.textContent = 'Invalid';
      simplifyResultGcd.textContent = 'Error';
      simplifyExplanation.innerHTML = '<div class="solution-step" style="color: var(--error);">All ratio terms must be positive numbers.</div>';
      return;
    }

    // Detect decimal scaling
    let maxDecimals = 0;
    parts.forEach(p => {
      if (p.includes('.')) {
        const decs = p.split('.')[1].length;
        if (decs > maxDecimals) maxDecimals = decs;
      }
    });

    const scale = Math.pow(10, maxDecimals);
    const intParts = numbers.map(n => Math.round(n * scale));
    const commonDivisor = gcdArray(intParts);
    const simplified = intParts.map(n => n / commonDivisor);

    simplifyResultRatio.textContent = simplified.join(' : ');
    simplifyResultGcd.textContent = maxDecimals > 0 ? `Scaled by ${scale} &times; GCD: ${commonDivisor}` : `Greatest Common Divisor (GCD): ${commonDivisor}`;

    const steps = [];
    if (maxDecimals > 0) {
      steps.push(`<div class="solution-step">1. Convert decimal terms by multiplying by ${scale}: [${intParts.join(', ')}]</div>`);
      steps.push(`<div class="solution-step">2. Find Greatest Common Divisor (GCD) of [${intParts.join(', ')}] = <strong>${commonDivisor}</strong></div>`);
      steps.push(`<div class="solution-step">3. Divide each term by ${commonDivisor}: [${intParts.map(n => `${n}/${commonDivisor}`).join(', ')}]</div>`);
    } else {
      steps.push(`<div class="solution-step">1. Find Greatest Common Divisor (GCD) of [${intParts.join(', ')}] = <strong>${commonDivisor}</strong></div>`);
      steps.push(`<div class="solution-step">2. Divide each term by GCD (${commonDivisor}): ${intParts.map(n => `${n} &divide; ${commonDivisor} = ${n / commonDivisor}`).join(', ')}</div>`);
    }

    if (simplified.length === 2) {
      const normalized = (simplified[0] / simplified[1]).toFixed(3);
      steps.push(`<div class="solution-step">3. Normalized unit ratio: <strong>${normalized} : 1</strong></div>`);
    }

    steps.push(`<div class="solution-step" style="color: var(--accent); font-weight: 700; margin-top: 0.5rem;">Result in lowest terms: ${simplified.join(' : ')}</div>`);
    simplifyExplanation.innerHTML = steps.join('');
  }

  btnSimplifyCalc.addEventListener('click', simplifyRatio);
  simplifyInput.addEventListener('keydown', e => {
    if (e.key === 'Enter') simplifyRatio();
  });
  btnSimplifyReset.addEventListener('click', () => {
    simplifyInput.value = '';
    simplifyRatio();
  });

  document.querySelectorAll('.simp-example').forEach(btn => {
    btn.addEventListener('click', () => {
      simplifyInput.value = btn.getAttribute('data-val');
      simplifyRatio();
    });
  });

  // ==========================================
  // MODE 3: DIVIDE A QUANTITY
  // ==========================================
  const divideTotal = document.getElementById('divide-total');
  const divideRatio = document.getElementById('divide-ratio');
  const btnDivideCalc = document.getElementById('btn-divide-calc');
  const divideSumParts = document.getElementById('divide-sum-parts');
  const divideValPerPart = document.getElementById('divide-val-per-part');
  const divideTableBody = document.getElementById('divide-table-body');

  function calculateDivideQuantity() {
    const total = parseFloat(divideTotal.value);
    const ratioStr = divideRatio.value.trim();

    if (isNaN(total) || !ratioStr) {
      divideSumParts.textContent = '-';
      divideValPerPart.textContent = 'Value per single part: -';
      divideTableBody.innerHTML = '<tr><td colspan="4" style="text-align: center; color: var(--error);">Please enter a valid total and ratio.</td></tr>';
      return;
    }

    const parts = ratioStr.split(/[:,\s]+/).map(p => p.trim()).filter(p => p !== '').map(Number);
    if (parts.length < 2 || parts.some(p => isNaN(p) || p <= 0)) {
      divideTableBody.innerHTML = '<tr><td colspan="4" style="text-align: center; color: var(--error);">Please provide at least 2 positive ratio values.</td></tr>';
      return;
    }

    const sumParts = parts.reduce((a, b) => a + b, 0);
    const unitValue = total / sumParts;

    divideSumParts.textContent = formatDisplayNum(sumParts);
    divideValPerPart.textContent = `1 Part = ${formatDisplayNum(unitValue)}`;

    divideTableBody.innerHTML = '';
    parts.forEach((part, idx) => {
      const shareVal = part * unitValue;
      const percentage = (part / sumParts) * 100;

      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td style="font-weight: 600;">Part ${idx + 1}</td>
        <td class="mono">${part} (${part}/${sumParts})</td>
        <td class="mono" style="color: var(--accent); font-weight:700;">${formatDisplayNum(shareVal)}</td>
        <td class="mono">${percentage.toFixed(2)}%</td>
      `;
      divideTableBody.appendChild(tr);
    });
  }

  btnDivideCalc.addEventListener('click', calculateDivideQuantity);
  [divideTotal, divideRatio].forEach(inp => {
    inp.addEventListener('input', calculateDivideQuantity);
  });

  document.querySelectorAll('.divide-example').forEach(btn => {
    btn.addEventListener('click', () => {
      divideTotal.value = btn.getAttribute('data-total');
      divideRatio.value = btn.getAttribute('data-ratio');
      calculateDivideQuantity();
    });
  });

  // ==========================================
  // MODE 4: ASPECT RATIO SCALER
  // ==========================================
  const aspectW = document.getElementById('aspect-ratio-w');
  const aspectH = document.getElementById('aspect-ratio-h');
  const aspectPxW = document.getElementById('aspect-px-w');
  const aspectPxH = document.getElementById('aspect-px-h');
  const aspectLock = document.getElementById('aspect-lock-toggle');
  const aspectDecimalVal = document.getElementById('aspect-decimal-val');
  const aspectMpVal = document.getElementById('aspect-mp-val');
  const aspectTotalPixels = document.getElementById('aspect-total-pixels');
  const aspectBoxPreview = document.getElementById('aspect-box-preview');
  const previewTextDims = document.getElementById('preview-text-dims');
  const previewTextRatio = document.getElementById('preview-text-ratio');

  function updateAspectDisplay() {
    const rw = parseFloat(aspectW.value) || 1;
    const rh = parseFloat(aspectH.value) || 1;
    const pw = parseInt(aspectPxW.value, 10) || 1;
    const ph = parseInt(aspectPxH.value, 10) || 1;

    // Decimal ratio
    const decimalRatio = pw / ph;
    aspectDecimalVal.textContent = `${decimalRatio.toFixed(2)}:1`;

    // Megapixels
    const totalPx = pw * ph;
    const mp = totalPx / 1000000;
    aspectMpVal.textContent = `${mp.toFixed(2)} MP`;
    aspectTotalPixels.textContent = `${totalPx.toLocaleString()} pixels`;

    // Preview box sizing
    const maxStageW = 280;
    const maxStageH = 180;
    let boxW, boxH;

    if (decimalRatio >= 1) {
      boxW = maxStageW;
      boxH = maxStageW / decimalRatio;
      if (boxH > maxStageH) {
        boxH = maxStageH;
        boxW = maxStageH * decimalRatio;
      }
    } else {
      boxH = maxStageH;
      boxW = maxStageH * decimalRatio;
      if (boxW > maxStageW) {
        boxW = maxStageW;
        boxH = maxStageW / decimalRatio;
      }
    }

    aspectBoxPreview.style.width = `${Math.round(boxW)}px`;
    aspectBoxPreview.style.height = `${Math.round(boxH)}px`;
    previewTextDims.textContent = `${pw} × ${ph}`;

    const dGcd = gcd(pw, ph);
    const simW = Math.round(pw / dGcd);
    const simH = Math.round(ph / dGcd);
    previewTextRatio.textContent = `(${simW}:${simH})`;
  }

  aspectPxW.addEventListener('input', () => {
    if (aspectLock.checked) {
      const rw = parseFloat(aspectW.value) || 1;
      const rh = parseFloat(aspectH.value) || 1;
      const curW = parseFloat(aspectPxW.value) || 0;
      aspectPxH.value = Math.round(curW * (rh / rw));
    }
    updateAspectDisplay();
  });

  aspectPxH.addEventListener('input', () => {
    if (aspectLock.checked) {
      const rw = parseFloat(aspectW.value) || 1;
      const rh = parseFloat(aspectH.value) || 1;
      const curH = parseFloat(aspectPxH.value) || 0;
      aspectPxW.value = Math.round(curH * (rw / rh));
    }
    updateAspectDisplay();
  });

  aspectW.addEventListener('input', () => {
    if (aspectLock.checked) {
      const rw = parseFloat(aspectW.value) || 1;
      const rh = parseFloat(aspectH.value) || 1;
      const curW = parseFloat(aspectPxW.value) || 0;
      aspectPxH.value = Math.round(curW * (rh / rw));
    }
    updateAspectDisplay();
  });

  aspectH.addEventListener('input', () => {
    if (aspectLock.checked) {
      const rw = parseFloat(aspectW.value) || 1;
      const rh = parseFloat(aspectH.value) || 1;
      const curW = parseFloat(aspectPxW.value) || 0;
      aspectPxH.value = Math.round(curW * (rh / rw));
    }
    updateAspectDisplay();
  });

  document.querySelectorAll('.aspect-chip').forEach(chip => {
    chip.addEventListener('click', () => {
      document.querySelectorAll('.aspect-chip').forEach(c => c.classList.remove('active'));
      chip.classList.add('active');

      const w = chip.getAttribute('data-w');
      const h = chip.getAttribute('data-h');
      aspectW.value = w;
      aspectH.value = h;

      if (aspectLock.checked) {
        const curW = parseFloat(aspectPxW.value) || 1920;
        aspectPxH.value = Math.round(curW * (parseFloat(h) / parseFloat(w)));
      }
      updateAspectDisplay();
    });
  });

  document.querySelectorAll('.res-example').forEach(btn => {
    btn.addEventListener('click', () => {
      aspectPxW.value = btn.getAttribute('data-w');
      aspectPxH.value = btn.getAttribute('data-h');
      updateAspectDisplay();
    });
  });

  // Initial runs
  solveProportion();
  simplifyRatio();
  calculateDivideQuantity();
  updateAspectDisplay();
});