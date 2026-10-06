// GCD & LCM Calculator Logic

// BigInt Helper Math Functions
function bigAbs(n) {
  return n < 0n ? -n : n;
}

function bigGcdWithSteps(a, b) {
  let x = bigAbs(a);
  let y = bigAbs(b);
  const steps = [];

  if (x < y) {
    steps.push({ a: x, b: y, q: 0n, r: x, note: `Rearrange so larger number ${y} comes first` });
    const temp = x;
    x = y;
    y = temp;
  }

  while (y !== 0n) {
    const q = x / y;
    const r = x % y;
    steps.push({
      a: x,
      b: y,
      q,
      r,
      equation: `${x} = ${y} × ${q} + ${r}`
    });
    x = y;
    y = r;
  }

  return { gcd: x, steps };
}

function bigLcm(a, b, gcdVal) {
  if (a === 0n || b === 0n) return 0n;
  return (bigAbs(a) * bigAbs(b)) / gcdVal;
}

// Prime Factorization
function getPrimeFactors(num) {
  let n = typeof num === 'bigint' ? num : BigInt(num);
  n = bigAbs(n);
  const factors = {};

  if (n <= 1n) return factors;

  let d = 2n;
  while (d * d <= n) {
    if (n % d === 0n) {
      let count = 0;
      while (n % d === 0n) {
        count++;
        n /= d;
      }
      factors[d.toString()] = count;
    }
    d = d === 2n ? 3n : d + 2n;
  }
  if (n > 1n) {
    factors[n.toString()] = (factors[n.toString()] || 0) + 1;
  }
  return factors;
}

// All positive divisors
function getAllDivisors(num) {
  const n = Number(num);
  if (!Number.isSafeInteger(n) || n > 10000000) {
    return null; // Skip for very huge numbers
  }
  const divs = [];
  for (let i = 1; i * i <= n; i++) {
    if (n % i === 0) {
      divs.push(i);
      if (i * i !== n) {
        divs.push(n / i);
      }
    }
  }
  divs.sort((a, b) => a - b);
  return divs;
}

function formatFactorization(factors) {
  const entries = Object.entries(factors);
  if (entries.length === 0) return '1';
  return entries
    .map(([prime, power]) => (power > 1 ? `${prime}<sup>${power}</sup>` : `${prime}`))
    .join(' × ');
}

function formatFactorizationText(factors) {
  const entries = Object.entries(factors);
  if (entries.length === 0) return '1';
  return entries
    .map(([prime, power]) => (power > 1 ? `${prime}^${power}` : `${prime}`))
    .join(' × ');
}

// Copy to Clipboard Utility
async function copyText(text, btnElement) {
  try {
    await navigator.clipboard.writeText(text);
    if (btnElement) {
      const originalText = btnElement.innerHTML;
      btnElement.innerHTML = `✓ Copied!`;
      btnElement.classList.add('copied');
      setTimeout(() => {
        btnElement.innerHTML = originalText;
        btnElement.classList.remove('copied');
      }, 2000);
    }
  } catch {
    const textarea = document.createElement('textarea');
    textarea.value = text;
    document.body.appendChild(textarea);
    textarea.select();
    document.execCommand('copy');
    document.body.removeChild(textarea);
    if (btnElement) {
      const originalText = btnElement.innerHTML;
      btnElement.innerHTML = `✓ Copied!`;
      setTimeout(() => {
        btnElement.innerHTML = originalText;
      }, 2000);
    }
  }
}

document.addEventListener('DOMContentLoaded', () => {
  const inputEl = document.getElementById('numbers-input');
  const errorEl = document.getElementById('input-error');
  const calcBtn = document.getElementById('calc-btn');
  const clearBtn = document.getElementById('clear-btn');
  const copySummaryBtn = document.getElementById('copy-summary-btn');
  const copyGcdBtn = document.getElementById('copy-gcd-btn');
  const copyLcmBtn = document.getElementById('copy-lcm-btn');

  const gcdValEl = document.getElementById('gcd-val');
  const lcmValEl = document.getElementById('lcm-val');
  const coprimeValEl = document.getElementById('coprime-val');
  const countSubEl = document.getElementById('count-sub');

  const primeContainer = document.getElementById('prime-factors-container');
  const euclideanStepsEl = document.getElementById('euclidean-steps');
  const primeMethodStepsEl = document.getElementById('prime-method-steps');
  const commonDivisorsStepsEl = document.getElementById('common-divisors-steps');

  // Tab switching
  const tabBtns = document.querySelectorAll('.tab-btn');
  tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      tabBtns.forEach(b => b.classList.remove('active'));
      document.querySelectorAll('.tab-pane').forEach(p => (p.style.display = 'none'));

      btn.classList.add('active');
      const targetId = btn.getAttribute('data-tab');
      const targetPane = document.getElementById(targetId);
      if (targetPane) targetPane.style.display = 'block';
    });
  });

  // Preset chips
  document.querySelectorAll('.preset-chip').forEach(chip => {
    chip.addEventListener('click', () => {
      inputEl.value = chip.getAttribute('data-preset');
      runCalculation();
    });
  });

  // Parse input numbers
  function parseInput(raw) {
    if (!raw || !raw.trim()) return [];
    const tokens = raw.trim().split(/[\s,;]+/);
    const nums = [];
    for (const token of tokens) {
      if (!token) continue;
      if (!/^\d+$/.test(token)) {
        throw new Error(`"${token}" is not a valid positive integer.`);
      }
      const b = BigInt(token);
      if (b <= 0n) {
        throw new Error('All numbers must be strictly positive (> 0).');
      }
      nums.push(b);
    }
    return nums;
  }

  function runCalculation() {
    errorEl.style.display = 'none';
    errorEl.textContent = '';

    let nums = [];
    try {
      nums = parseInput(inputEl.value);
    } catch (err) {
      errorEl.textContent = err.message;
      errorEl.style.display = 'block';
      return;
    }

    if (nums.length < 2) {
      errorEl.textContent = 'Please enter at least two positive integers to compute GCD & LCM.';
      errorEl.style.display = 'block';
      gcdValEl.textContent = '-';
      lcmValEl.textContent = '-';
      coprimeValEl.textContent = '-';
      countSubEl.textContent = 'Total numbers analyzed: 0';
      primeContainer.innerHTML = '';
      euclideanStepsEl.innerHTML = '';
      primeMethodStepsEl.innerHTML = '';
      commonDivisorsStepsEl.innerHTML = '';
      return;
    }

    // 1. Pairwise Euclidean GCD & LCM
    let currentGcd = nums[0];
    let currentLcm = nums[0];
    const euclideanHistory = [];

    for (let i = 1; i < nums.length; i++) {
      const nextNum = nums[i];
      const { gcd, steps } = bigGcdWithSteps(currentGcd, nextNum);
      euclideanHistory.push({
        numA: currentGcd,
        numB: nextNum,
        resultGcd: gcd,
        steps
      });
      currentGcd = gcd;
      currentLcm = bigLcm(currentLcm, nextNum, bigGcdWithSteps(currentLcm, nextNum).gcd);
    }

    // Display summary stats
    gcdValEl.textContent = currentGcd.toString();
    lcmValEl.textContent = currentLcm.toString();
    const isCoprime = currentGcd === 1n;
    coprimeValEl.textContent = isCoprime ? 'Yes (Coprime)' : 'No';
    coprimeValEl.style.color = isCoprime ? '#10b981' : 'var(--text-primary)';
    countSubEl.textContent = `Total numbers analyzed: ${nums.length} [${nums.map(n => n.toString()).join(', ')}]`;

    // 2. Prime factorizations for each number
    const factorizations = nums.map(n => ({
      num: n,
      factors: getPrimeFactors(n)
    }));

    // Render Prime Factors Cards
    renderPrimeFactorCards(factorizations, currentGcd, currentLcm);

    // 3. Render Euclidean steps
    renderEuclideanSteps(euclideanHistory, currentGcd);

    // 4. Render Prime method steps
    renderPrimeMethodSteps(factorizations, currentGcd, currentLcm);

    // 5. Render Common Divisors
    renderCommonDivisors(nums, currentGcd);
  }

  function renderPrimeFactorCards(factorizations, overallGcd, overallLcm) {
    let html = '';
    factorizations.forEach(({ num, factors }) => {
      const formatted = formatFactorization(factors);
      const factorList = Object.entries(factors).flatMap(([p, count]) => Array(count).fill(p));

      html += `
        <div style="background: var(--bg-secondary); border: 1px solid var(--border); border-radius: var(--radius-md); padding: 1rem;">
          <div style="display: flex; justify-content: space-between; align-items: baseline; flex-wrap: wrap; gap: 0.5rem; margin-bottom: 0.5rem;">
            <strong style="font-size: 1.1rem; color: var(--accent);">${num.toString()}</strong>
            <span style="font-size: 0.95rem; font-family: monospace;">Prime Factor Form: <strong>${formatted}</strong></span>
          </div>
          <div class="factor-pill-group">
            <span style="font-size: 0.8rem; color: var(--text-tertiary); align-self: center; margin-right: 0.25rem;">Factors:</span>
            ${factorList.map(f => `<span class="factor-pill prime">${f}</span>`).join('')}
          </div>
        </div>
      `;
    });

    primeContainer.innerHTML = html;
  }

  function renderEuclideanSteps(euclideanHistory, finalGcd) {
    let html = '';
    euclideanHistory.forEach((item, index) => {
      html += `
        <div class="step-box">
          <div class="step-title">
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 18 15 12 9 6"></polyline></svg>
            Step ${index + 1}: Compute GCD(${item.numA.toString()}, ${item.numB.toString()})
          </div>
          <p style="font-size: 0.85rem; color: var(--text-secondary); margin-bottom: 0.75rem;">
            Applying the Euclidean Division Lemma: a = b × quotient + remainder until remainder = 0.
          </p>
          <div style="display: flex; flex-direction: column; gap: 0.3rem;">
            ${item.steps
              .map(s => {
                if (s.equation) {
                  return `<div class="step-calc-line"><strong>${s.equation}</strong> (rem = ${s.r})</div>`;
                }
                return `<div class="step-calc-line" style="color: var(--text-tertiary);">${s.note}</div>`;
              })
              .join('')}
          </div>
          <div style="margin-top: 0.75rem; font-size: 0.9rem; font-weight: 600; color: var(--text-primary);">
            Result for pair: GCD(${item.numA.toString()}, ${item.numB.toString()}) = <span style="color: var(--accent);">${item.resultGcd.toString()}</span>
          </div>
        </div>
      `;
    });

    if (euclideanHistory.length > 1) {
      html += `
        <div class="step-box" style="border-color: var(--accent); background: rgba(78, 133, 191, 0.05);">
          <div class="step-title" style="color: var(--accent);">Final Conclusion</div>
          <p style="font-size: 0.9rem; color: var(--text-primary);">
            By iteratively combining pairwise GCD results, the overall Greatest Common Divisor is <strong>${finalGcd.toString()}</strong>.
          </p>
        </div>
      `;
    }

    euclideanStepsEl.innerHTML = html;
  }

  function renderPrimeMethodSteps(factorizations, overallGcd, overallLcm) {
    // Collect all unique primes
    const allPrimes = new Set();
    factorizations.forEach(({ factors }) => {
      Object.keys(factors).forEach(p => allPrimes.add(p));
    });
    const sortedPrimes = Array.from(allPrimes).sort((a, b) => Number(a) - Number(b));

    // Calculate min and max power for each prime
    const gcdPrimeParts = [];
    const lcmPrimeParts = [];

    sortedPrimes.forEach(p => {
      let minPower = Infinity;
      let maxPower = 0;

      factorizations.forEach(({ factors }) => {
        const count = factors[p] || 0;
        if (count < minPower) minPower = count;
        if (count > maxPower) maxPower = count;
      });

      if (minPower > 0) {
        gcdPrimeParts.push({ prime: p, power: minPower });
      }
      if (maxPower > 0) {
        lcmPrimeParts.push({ prime: p, power: maxPower });
      }
    });

    const gcdFormula = gcdPrimeParts.length > 0
      ? gcdPrimeParts.map(x => (x.power > 1 ? `${x.prime}<sup>${x.power}</sup>` : `${x.prime}`)).join(' × ')
      : '1';

    const lcmFormula = lcmPrimeParts.length > 0
      ? lcmPrimeParts.map(x => (x.power > 1 ? `${x.prime}<sup>${x.power}</sup>` : `${x.prime}`)).join(' × ')
      : '1';

    let html = `
      <div class="step-box">
        <div class="step-title">1. Prime Factorization Alignment</div>
        <div style="overflow-x: auto; margin-bottom: 1rem;">
          <table style="width: 100%; border-collapse: collapse; font-size: 0.875rem; text-align: left;">
            <thead>
              <tr style="border-bottom: 1px solid var(--border); color: var(--text-tertiary);">
                <th style="padding: 0.5rem;">Number</th>
                <th style="padding: 0.5rem;">Prime Factor Product</th>
                ${sortedPrimes.map(p => `<th style="padding: 0.5rem; text-align: center;">p = ${p}</th>`).join('')}
              </tr>
            </thead>
            <tbody>
              ${factorizations
                .map(
                  f => `
                <tr style="border-bottom: 1px solid rgba(255,255,255,0.05);">
                  <td style="padding: 0.5rem; font-weight: 700; color: var(--accent);">${f.num.toString()}</td>
                  <td style="padding: 0.5rem; font-family: monospace;">${formatFactorization(f.factors)}</td>
                  ${sortedPrimes
                    .map(p => {
                      const count = f.factors[p] || 0;
                      return `<td style="padding: 0.5rem; text-align: center; font-family: monospace;">${count > 0 ? count : '<span style="color:var(--text-tertiary); opacity:0.4;">0</span>'}</td>`;
                    })
                    .join('')}
                </tr>
              `
                )
                .join('')}
            </tbody>
          </table>
        </div>
      </div>

      <div class="step-box">
        <div class="step-title">2. Calculate GCD (Minimum Exponent of Common Primes)</div>
        <p style="font-size: 0.85rem; color: var(--text-secondary); margin-bottom: 0.5rem;">
          Take each prime factor present in <em>all</em> numbers with its minimum exponent across the set:
        </p>
        <div class="step-calc-line">
          GCD = ${gcdFormula} = <strong>${overallGcd.toString()}</strong>
        </div>
      </div>

      <div class="step-box">
        <div class="step-title">3. Calculate LCM (Maximum Exponent of All Primes)</div>
        <p style="font-size: 0.85rem; color: var(--text-secondary); margin-bottom: 0.5rem;">
          Take every prime factor present in <em>any</em> number with its highest exponent across the set:
        </p>
        <div class="step-calc-line">
          LCM = ${lcmFormula} = <strong>${overallLcm.toString()}</strong>
        </div>
      </div>
    `;

    primeMethodStepsEl.innerHTML = html;
  }

  function renderCommonDivisors(nums, gcdVal) {
    const gcdNum = Number(gcdVal);
    let commonDivs = [];
    if (Number.isSafeInteger(gcdNum) && gcdNum <= 10000000) {
      commonDivs = getAllDivisors(gcdNum) || [];
    }

    let html = `
      <div class="step-box">
        <div class="step-title">All Common Divisors of [${nums.map(n => n.toString()).join(', ')}]</div>
        <p style="font-size: 0.85rem; color: var(--text-secondary); margin-bottom: 0.75rem;">
          Any common divisor of a set of numbers is also an exact divisor of their GCD (${gcdVal.toString()}).
        </p>
        <div class="factor-pill-group">
          ${
            commonDivs.length > 0
              ? commonDivs
                  .map(
                    d =>
                      `<span class="factor-pill ${d === gcdNum ? 'prime' : ''}" style="${d === gcdNum ? 'font-weight: 700;' : ''}">${d}${d === gcdNum ? ' (GCD)' : ''}</span>`
                  )
                  .join('')
              : `<span class="factor-pill">GCD is ${gcdVal.toString()}</span>`
          }
        </div>
        <div style="margin-top: 0.75rem; font-size: 0.825rem; color: var(--text-tertiary);">
          Total number of common divisors: ${commonDivs.length || 'N/A'}
        </div>
      </div>
    `;

    commonDivisorsStepsEl.innerHTML = html;
  }

  // Event Listeners
  calcBtn.addEventListener('click', runCalculation);
  inputEl.addEventListener('keydown', e => {
    if (e.key === 'Enter') {
      runCalculation();
    }
  });

  inputEl.addEventListener('input', () => {
    // Quick debounce calculate
    clearTimeout(inputEl._timer);
    inputEl._timer = setTimeout(runCalculation, 300);
  });

  clearBtn.addEventListener('click', () => {
    inputEl.value = '';
    gcdValEl.textContent = '-';
    lcmValEl.textContent = '-';
    coprimeValEl.textContent = '-';
    countSubEl.textContent = 'Total numbers analyzed: 0';
    primeContainer.innerHTML = '';
    euclideanStepsEl.innerHTML = '';
    primeMethodStepsEl.innerHTML = '';
    commonDivisorsStepsEl.innerHTML = '';
    errorEl.style.display = 'none';
  });

  copyGcdBtn.addEventListener('click', () => {
    const val = gcdValEl.textContent;
    if (val && val !== '-') {
      copyText(val, copyGcdBtn);
    }
  });

  copyLcmBtn.addEventListener('click', () => {
    const val = lcmValEl.textContent;
    if (val && val !== '-') {
      copyText(val, copyLcmBtn);
    }
  });

  copySummaryBtn.addEventListener('click', () => {
    const raw = inputEl.value;
    const gcd = gcdValEl.textContent;
    const lcm = lcmValEl.textContent;
    const coprime = coprimeValEl.textContent;

    if (!gcd || gcd === '-') return;

    const report = `GCD & LCM Calculation Report
Numbers: ${raw}
Greatest Common Divisor (GCD): ${gcd}
Least Common Multiple (LCM): ${lcm}
Coprime: ${coprime}
Generated via ALL IN ONE GCD & LCM Calculator`;

    copyText(report, copySummaryBtn);
  });

  // Run initial calculation
  runCalculation();
});