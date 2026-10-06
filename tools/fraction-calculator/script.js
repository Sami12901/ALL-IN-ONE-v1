// Fraction Calculator & Reducer Logic

function bigAbs(n) {
  return n < 0n ? -n : n;
}

function bigGcd(a, b) {
  let x = bigAbs(a);
  let y = bigAbs(b);
  while (y !== 0n) {
    const temp = x % y;
    x = y;
    y = temp;
  }
  return x;
}

function bigLcm(a, b) {
  if (a === 0n || b === 0n) return 0n;
  const g = bigGcd(a, b);
  return (bigAbs(a) * bigAbs(b)) / g;
}

function getPrimeFactors(num) {
  let n = typeof num === 'bigint' ? num : BigInt(num);
  n = bigAbs(n);
  const factors = [];
  if (n <= 1n) return factors;

  let d = 2n;
  while (d * d <= n) {
    while (n % d === 0n) {
      factors.push(d.toString());
      n /= d;
    }
    d = d === 2n ? 3n : d + 2n;
  }
  if (n > 1n) {
    factors.push(n.toString());
  }
  return factors;
}

function formatMixed(num, den) {
  const n = BigInt(num);
  const d = BigInt(den);
  if (d === 0n) return 'Undefined';
  if (n === 0n) return '0';
  if (d === 1n) return n.toString();

  const isNeg = (n < 0n && d > 0n) || (n > 0n && d < 0n);
  const absN = bigAbs(n);
  const absD = bigAbs(d);

  const whole = absN / absD;
  const rem = absN % absD;

  if (whole === 0n) {
    return `${isNeg ? '-' : ''}${rem}/${absD}`;
  }
  if (rem === 0n) {
    return `${isNeg ? '-' : ''}${whole}`;
  }
  return `${isNeg ? '-' : ''}${whole} ${rem}/${absD}`;
}

async function copyToClipboard(text, btnElement) {
  try {
    await navigator.clipboard.writeText(text);
  } catch {
    const ta = document.createElement('textarea');
    ta.value = text;
    document.body.appendChild(ta);
    ta.select();
    document.execCommand('copy');
    document.body.removeChild(ta);
  }
  if (btnElement) {
    const orig = btnElement.innerHTML;
    btnElement.innerHTML = `✓ Copied!`;
    setTimeout(() => {
      btnElement.innerHTML = orig;
    }, 2000);
  }
}

document.addEventListener('DOMContentLoaded', () => {
  // Mode Tabs
  const modeArithmeticBtn = document.getElementById('mode-arithmetic');
  const modeSimplifyBtn = document.getElementById('mode-simplify');
  const arithmeticPanel = document.getElementById('arithmetic-panel');
  const reducerPanel = document.getElementById('reducer-panel');

  // Arithmetic Mode Inputs
  const mixedToggle = document.getElementById('mixed-toggle');
  const whole1Container = document.getElementById('whole1-container');
  const whole2Container = document.getElementById('whole2-container');
  const whole1Input = document.getElementById('whole1');
  const num1Input = document.getElementById('num1');
  const den1Input = document.getElementById('den1');
  const whole2Input = document.getElementById('whole2');
  const num2Input = document.getElementById('num2');
  const den2Input = document.getElementById('den2');
  const opBtns = document.querySelectorAll('.op-btn');
  const fracError = document.getElementById('frac-error');

  // Reducer Mode Inputs
  const redNumInput = document.getElementById('red-num');
  const redDenInput = document.getElementById('red-den');
  const redError = document.getElementById('red-error');
  const reduceBtn = document.getElementById('reduce-btn');

  // Action Buttons
  const calcFracBtn = document.getElementById('calc-frac-btn');
  const swapFracBtn = document.getElementById('swap-frac-btn');
  const copyFracResultBtn = document.getElementById('copy-frac-result-btn');

  // Display Elements
  const resultVisualBox = document.getElementById('result-visual-box');
  const statSimplified = document.getElementById('stat-simplified');
  const statMixed = document.getElementById('stat-mixed');
  const statDecimal = document.getElementById('stat-decimal');
  const statPercent = document.getElementById('stat-percent');
  const stepsContainer = document.getElementById('fraction-steps');

  let currentOp = '+';
  let activeMode = 'arithmetic'; // 'arithmetic' | 'simplify'
  let lastResultString = '';

  // Mode Switch
  modeArithmeticBtn.addEventListener('click', () => {
    activeMode = 'arithmetic';
    modeArithmeticBtn.classList.add('active');
    modeSimplifyBtn.classList.remove('active');
    arithmeticPanel.style.display = 'block';
    reducerPanel.style.display = 'none';
    calculateArithmetic();
  });

  modeSimplifyBtn.addEventListener('click', () => {
    activeMode = 'simplify';
    modeSimplifyBtn.classList.add('active');
    modeArithmeticBtn.classList.remove('active');
    arithmeticPanel.style.display = 'none';
    reducerPanel.style.display = 'block';
    calculateReducer();
  });

  // Mixed Number Toggle
  mixedToggle.addEventListener('change', () => {
    const isMixed = mixedToggle.checked;
    whole1Container.style.display = isMixed ? 'flex' : 'none';
    whole2Container.style.display = isMixed ? 'flex' : 'none';
    calculateArithmetic();
  });

  // Operator Selection
  opBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      opBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentOp = btn.getAttribute('data-op');
      calculateArithmetic();
    });
  });

  // Swap Fractions
  swapFracBtn.addEventListener('click', () => {
    const tempW = whole1Input.value;
    const tempN = num1Input.value;
    const tempD = den1Input.value;

    whole1Input.value = whole2Input.value;
    num1Input.value = num2Input.value;
    den1Input.value = den2Input.value;

    whole2Input.value = tempW;
    num2Input.value = tempN;
    den2Input.value = tempD;

    calculateArithmetic();
  });

  // Presets - Arithmetic
  document.querySelectorAll('.preset-chip[data-preset]').forEach(chip => {
    chip.addEventListener('click', () => {
      const presetStr = chip.getAttribute('data-preset');
      loadArithmeticPreset(presetStr);
    });
  });

  // Presets - Reducer
  document.querySelectorAll('.red-preset').forEach(chip => {
    chip.addEventListener('click', () => {
      redNumInput.value = chip.getAttribute('data-num');
      redDenInput.value = chip.getAttribute('data-den');
      calculateReducer();
    });
  });

  function loadArithmeticPreset(str) {
    // Example: "1/2 + 3/4", "2 1/3 * 1 1/2"
    let op = '+';
    if (str.includes(' + ')) op = '+';
    else if (str.includes(' - ')) op = '-';
    else if (str.includes(' * ')) op = '*';
    else if (str.includes(' / ')) op = '/';

    const parts = str.split(` ${op} `);
    if (parts.length === 2) {
      const parseFracPart = p => {
        p = p.trim();
        if (p.includes(' ')) {
          const [w, f] = p.split(' ');
          const [n, d] = f.split('/');
          return { whole: w, num: n, den: d, isMixed: true };
        } else {
          const [n, d] = p.split('/');
          return { whole: '0', num: n, den: d, isMixed: false };
        }
      };

      const f1 = parseFracPart(parts[0]);
      const f2 = parseFracPart(parts[1]);

      const hasMixed = f1.isMixed || f2.isMixed;
      mixedToggle.checked = hasMixed;
      whole1Container.style.display = hasMixed ? 'flex' : 'none';
      whole2Container.style.display = hasMixed ? 'flex' : 'none';

      whole1Input.value = f1.whole;
      num1Input.value = f1.num;
      den1Input.value = f1.den;

      whole2Input.value = f2.whole;
      num2Input.value = f2.num;
      den2Input.value = f2.den;

      currentOp = op;
      opBtns.forEach(btn => {
        btn.classList.toggle('active', btn.getAttribute('data-op') === op);
      });

      calculateArithmetic();
    }
  }

  // Convert (Whole, Num, Den) to Improper Fraction BigInt (n, d)
  function toImproper(wVal, nVal, dVal) {
    const w = BigInt(wVal || 0);
    const n = BigInt(nVal || 0);
    const d = BigInt(dVal || 1);

    if (d === 0n) {
      throw new Error('Denominator cannot be zero.');
    }

    if (w < 0n) {
      return { n: -((-w) * d + n), d: d };
    } else {
      return { n: w * d + n, d: d };
    }
  }

  function calculateArithmetic() {
    fracError.style.display = 'none';
    fracError.textContent = '';

    let w1 = mixedToggle.checked ? parseInt(whole1Input.value || 0, 10) : 0;
    let n1 = parseInt(num1Input.value || 0, 10);
    let d1 = parseInt(den1Input.value || 1, 10);

    let w2 = mixedToggle.checked ? parseInt(whole2Input.value || 0, 10) : 0;
    let n2 = parseInt(num2Input.value || 0, 10);
    let d2 = parseInt(den2Input.value || 1, 10);

    if (isNaN(n1) || isNaN(d1) || isNaN(n2) || isNaN(d2)) {
      fracError.textContent = 'Please enter valid integer numbers for numerators and denominators.';
      fracError.style.display = 'block';
      return;
    }

    if (d1 === 0 || d2 === 0) {
      fracError.textContent = 'Denominator cannot be 0. Division by zero is undefined.';
      fracError.style.display = 'block';
      return;
    }

    let imp1, imp2;
    try {
      imp1 = toImproper(w1, n1, d1);
      imp2 = toImproper(w2, n2, d2);
    } catch (e) {
      fracError.textContent = e.message;
      fracError.style.display = 'block';
      return;
    }

    if (currentOp === '/' && imp2.n === 0n) {
      fracError.textContent = 'Cannot divide by a fraction whose value is zero (0).';
      fracError.style.display = 'block';
      return;
    }

    let resN = 0n;
    let resD = 1n;
    const steps = [];

    // Step 1: Mixed to improper explanation if mixed toggle enabled
    if (mixedToggle.checked && (w1 !== 0 || w2 !== 0)) {
      steps.push({
        title: '1. Convert Mixed Numbers to Improper Fractions',
        math: `
          Fraction 1: ${w1 !== 0 ? `${w1} ${n1}/${d1} = (${w1} × ${d1} + ${n1})/${d1} = <strong>${imp1.n}/${imp1.d}</strong>` : `${n1}/${d1}`}<br>
          Fraction 2: ${w2 !== 0 ? `${w2} ${n2}/${d2} = (${w2} × ${d2} + ${n2})/${d2} = <strong>${imp2.n}/${imp2.d}</strong>` : `${n2}/${d2}`}
        `
      });
    }

    if (currentOp === '+' || currentOp === '-') {
      const lcd = bigLcm(imp1.d, imp2.d);
      const mult1 = lcd / imp1.d;
      const mult2 = lcd / imp2.d;
      const scaledN1 = imp1.n * mult1;
      const scaledN2 = imp2.n * mult2;

      steps.push({
        title: `${steps.length + 1}. Find Common Denominator (LCD)`,
        math: `
          Denominators are ${imp1.d} and ${imp2.d}.<br>
          Least Common Denominator (LCD = LCM(${imp1.d}, ${imp2.d})) = <strong>${lcd}</strong><br>
          Scale Fraction 1: (${imp1.n} × ${mult1}) / (${imp1.d} × ${mult1}) = <strong>${scaledN1}/${lcd}</strong><br>
          Scale Fraction 2: (${imp2.n} × ${mult2}) / (${imp2.d} × ${mult2}) = <strong>${scaledN2}/${lcd}</strong>
        `
      });

      if (currentOp === '+') {
        resN = scaledN1 + scaledN2;
        resD = lcd;
        steps.push({
          title: `${steps.length + 1}. Add the Numerators`,
          math: `(${scaledN1} + ${scaledN2}) / ${lcd} = <strong>${resN}/${resD}</strong>`
        });
      } else {
        resN = scaledN1 - scaledN2;
        resD = lcd;
        steps.push({
          title: `${steps.length + 1}. Subtract the Numerators`,
          math: `(${scaledN1} - ${scaledN2}) / ${lcd} = <strong>${resN}/${resD}</strong>`
        });
      }
    } else if (currentOp === '*') {
      resN = imp1.n * imp2.n;
      resD = imp1.d * imp2.d;
      steps.push({
        title: `${steps.length + 1}. Multiply Numerators and Denominators`,
        math: `
          Numerator: ${imp1.n} × ${imp2.n} = <strong>${resN}</strong><br>
          Denominator: ${imp1.d} × ${imp2.d} = <strong>${resD}</strong><br>
          Combined: <strong>${resN}/${resD}</strong>
        `
      });
    } else if (currentOp === '/') {
      // Invert second fraction
      const invN = imp2.d;
      const invD = imp2.n;
      resN = imp1.n * invN;
      resD = imp1.d * invD;
      steps.push({
        title: `${steps.length + 1}. Multiply by the Reciprocal (Invert Divisor)`,
        math: `
          Divisor reciprocal: ${imp2.n}/${imp2.d} ➔ <strong>${invN}/${invD}</strong><br>
          Expression becomes: (${imp1.n}/${imp1.d}) × (${invN}/${invD})<br>
          Numerator: ${imp1.n} × ${invN} = <strong>${resN}</strong><br>
          Denominator: ${imp1.d} × ${invD} = <strong>${resD}</strong><br>
          Combined: <strong>${resN}/${resD}</strong>
        `
      });
    }

    // Simplify Result
    if (resD < 0n) {
      resN = -resN;
      resD = -resD;
    }
    const gcdFinal = bigGcd(resN, resD);
    const simpN = resN / gcdFinal;
    const simpD = resD / gcdFinal;

    steps.push({
      title: `${steps.length + 1}. Simplify by Dividing by GCD`,
      math: `
        GCD(${bigAbs(resN)}, ${resD}) = <strong>${gcdFinal}</strong><br>
        Simplified Fraction: (${resN} ÷ ${gcdFinal}) / (${resD} ÷ ${gcdFinal}) = <strong>${simpN}/${simpD}</strong>
      `
    });

    displayResults(simpN, simpD, steps);
  }

  function calculateReducer() {
    redError.style.display = 'none';
    redError.textContent = '';

    const n = parseInt(redNumInput.value || 0, 10);
    const d = parseInt(redDenInput.value || 1, 10);

    if (isNaN(n) || isNaN(d)) {
      redError.textContent = 'Please enter valid integers for numerator and denominator.';
      redError.style.display = 'block';
      return;
    }

    if (d === 0) {
      redError.textContent = 'Denominator cannot be zero.';
      redError.style.display = 'block';
      return;
    }

    let bigN = BigInt(n);
    let bigD = BigInt(d);

    if (bigD < 0n) {
      bigN = -bigN;
      bigD = -bigD;
    }

    const gcdVal = bigGcd(bigN, bigD);
    const simpN = bigN / gcdVal;
    const simpD = bigD / gcdVal;

    const nFactors = getPrimeFactors(bigAbs(bigN));
    const dFactors = getPrimeFactors(bigAbs(bigD));

    const steps = [
      {
        title: '1. Identify Prime Factors of Numerator and Denominator',
        math: `
          Numerator ${bigN}: ${nFactors.length > 0 ? nFactors.join(' × ') : '1'}<br>
          Denominator ${bigD}: ${dFactors.length > 0 ? dFactors.join(' × ') : '1'}
        `
      },
      {
        title: '2. Greatest Common Divisor (GCD)',
        math: `GCD(${bigAbs(bigN)}, ${bigD}) = <strong>${gcdVal}</strong>`
      },
      {
        title: '3. Divide Numerator and Denominator by GCD',
        math: `
          (${bigN} ÷ ${gcdVal}) / (${bigD} ÷ ${gcdVal}) = <strong>${simpN}/${simpD}</strong>
        `
      }
    ];

    displayResults(simpN, simpD, steps);
  }

  function displayResults(simpN, simpD, steps) {
    const isNeg = simpN < 0n;
    const absN = bigAbs(simpN);
    const mixedStr = formatMixed(simpN, simpD);
    const simpFracStr = `${simpN} / ${simpD}`;

    statSimplified.textContent = simpD === 1n ? simpN.toString() : simpFracStr;
    statMixed.textContent = mixedStr;

    // Decimal and percent
    const decVal = Number(simpN) / Number(simpD);
    statDecimal.textContent = isFinite(decVal) ? (Number.isInteger(decVal) ? decVal.toString() : decVal.toFixed(6).replace(/\.?0+$/, '')) : 'Undefined';
    statPercent.textContent = isFinite(decVal) ? `${(decVal * 100).toFixed(4).replace(/\.?0+$/, '')}%` : 'Undefined';

    // Visual Box rendering
    if (simpD === 1n) {
      resultVisualBox.innerHTML = `<span>${simpN}</span>`;
    } else {
      const wholePart = absN / simpD;
      const remPart = absN % simpD;

      if (wholePart > 0n && remPart > 0n) {
        resultVisualBox.innerHTML = `
          <span>${isNeg ? '-' : ''}${wholePart}</span>
          <span class="visual-frac-stack">
            <span class="visual-num">${remPart}</span>
            <span class="visual-den">${simpD}</span>
          </span>
          <span style="font-size: 1.25rem; color: var(--text-tertiary); margin-left: 0.5rem;">(= ${simpN}/${simpD})</span>
        `;
      } else {
        resultVisualBox.innerHTML = `
          <span class="visual-frac-stack">
            <span class="visual-num">${simpN}</span>
            <span class="visual-den">${simpD}</span>
          </span>
        `;
      }
    }

    lastResultString = `${simpN}/${simpD} (Mixed: ${mixedStr}, Decimal: ${statDecimal.textContent})`;

    // Steps Rendering
    stepsContainer.innerHTML = steps
      .map(
        s => `
      <div class="step-card">
        <div class="step-badge">${s.title}</div>
        <div class="step-math">${s.math}</div>
      </div>
    `
      )
      .join('');
  }

  // Event Listeners for Live Update
  [whole1Input, num1Input, den1Input, whole2Input, num2Input, den2Input].forEach(inp => {
    inp.addEventListener('input', () => {
      if (activeMode === 'arithmetic') calculateArithmetic();
    });
    inp.addEventListener('keydown', e => {
      if (e.key === 'Enter' && activeMode === 'arithmetic') calculateArithmetic();
    });
  });

  [redNumInput, redDenInput].forEach(inp => {
    inp.addEventListener('input', () => {
      if (activeMode === 'simplify') calculateReducer();
    });
    inp.addEventListener('keydown', e => {
      if (e.key === 'Enter' && activeMode === 'simplify') calculateReducer();
    });
  });

  calcFracBtn.addEventListener('click', calculateArithmetic);
  reduceBtn.addEventListener('click', calculateReducer);

  copyFracResultBtn.addEventListener('click', () => {
    if (!lastResultString) return;
    const text = `Fraction Calculation Result:
Simplified: ${statSimplified.textContent}
Mixed: ${statMixed.textContent}
Decimal: ${statDecimal.textContent}
Percentage: ${statPercent.textContent}
Generated via ALL IN ONE Fraction Calculator`;
    copyToClipboard(text, copyFracResultBtn);
  });

  // Initial Calculation
  calculateArithmetic();
});