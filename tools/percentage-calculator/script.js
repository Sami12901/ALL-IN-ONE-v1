// 4-in-1 Percentage Calculator Engine
// Provides real-time calculation, mathematical formula breakdown, and clipboard export.

document.addEventListener('DOMContentLoaded', () => {
  // Format utility
  function formatNumber(num, maxDecimals = 4) {
    if (num === null || num === undefined || isNaN(num) || !isFinite(num)) {
      return '—';
    }
    // Round to avoid floating point precision artifacts like 0.30000000000000004
    const rounded = Number(Math.round(Number(num + 'e' + maxDecimals)) + 'e-' + maxDecimals);
    return rounded.toLocaleString('en-US', {
      maximumFractionDigits: maxDecimals,
      useGrouping: true
    });
  }

  // Copy helper
  document.querySelectorAll('.copy-res-btn').forEach(btn => {
    btn.addEventListener('click', async () => {
      const targetId = btn.getAttribute('data-target');
      const targetEl = document.getElementById(targetId);
      if (!targetEl) return;
      const textToCopy = targetEl.textContent.trim();
      if (!textToCopy || textToCopy === '—') return;

      try {
        await navigator.clipboard.writeText(textToCopy);
        const originalHTML = btn.innerHTML;
        btn.innerHTML = `<span style="color: #10b981;">✓ Copied</span>`;
        setTimeout(() => {
          btn.innerHTML = originalHTML;
        }, 1800);
      } catch (err) {
        console.error('Copy failed:', err);
      }
    });
  });

  // ==========================================
  // Calculator 1: What is X% of Y?
  // ==========================================
  const c1X = document.getElementById('c1-x');
  const c1Y = document.getElementById('c1-y');
  const c1Result = document.getElementById('c1-result');
  const c1Formula = document.getElementById('c1-formula');

  function updateCalc1() {
    const xVal = parseFloat(c1X.value);
    const yVal = parseFloat(c1Y.value);

    if (isNaN(xVal) || isNaN(yVal)) {
      c1Result.textContent = '—';
      c1Formula.innerHTML = `Formula: <span class="formula-code">(X ÷ 100) × Y</span>`;
      return;
    }

    const res = (xVal / 100) * yVal;
    const formattedRes = formatNumber(res);
    c1Result.textContent = formattedRes;
    c1Formula.innerHTML = `Formula: <span class="formula-code">(${xVal} ÷ 100) × ${yVal} = ${formattedRes}</span>`;
  }

  c1X.addEventListener('input', updateCalc1);
  c1Y.addEventListener('input', updateCalc1);

  document.querySelectorAll('[data-c1]').forEach(btn => {
    btn.addEventListener('click', () => {
      const [x, y] = btn.getAttribute('data-c1').split(',');
      c1X.value = x;
      c1Y.value = y;
      updateCalc1();
    });
  });

  // ==========================================
  // Calculator 2: X is what percent of Y?
  // ==========================================
  const c2X = document.getElementById('c2-x');
  const c2Y = document.getElementById('c2-y');
  const c2Result = document.getElementById('c2-result');
  const c2Formula = document.getElementById('c2-formula');

  function updateCalc2() {
    const xVal = parseFloat(c2X.value);
    const yVal = parseFloat(c2Y.value);

    if (isNaN(xVal) || isNaN(yVal)) {
      c2Result.textContent = '—';
      c2Formula.innerHTML = `Formula: <span class="formula-code">(X ÷ Y) × 100</span>`;
      return;
    }

    if (yVal === 0) {
      c2Result.textContent = 'Undefined';
      c2Formula.innerHTML = `Formula: <span class="formula-code">Cannot divide by zero (Y = 0)</span>`;
      return;
    }

    const pct = (xVal / yVal) * 100;
    const formattedPct = formatNumber(pct) + '%';
    c2Result.textContent = formattedPct;
    c2Formula.innerHTML = `Formula: <span class="formula-code">(${xVal} ÷ ${yVal}) × 100 = ${formattedPct}</span>`;
  }

  c2X.addEventListener('input', updateCalc2);
  c2Y.addEventListener('input', updateCalc2);

  document.querySelectorAll('[data-c2]').forEach(btn => {
    btn.addEventListener('click', () => {
      const [x, y] = btn.getAttribute('data-c2').split(',');
      c2X.value = x;
      c2Y.value = y;
      updateCalc2();
    });
  });

  // ==========================================
  // Calculator 3: Percentage Increase / Decrease
  // ==========================================
  const c3X = document.getElementById('c3-x');
  const c3Y = document.getElementById('c3-y');
  const c3Result = document.getElementById('c3-result');
  const c3Diff = document.getElementById('c3-diff');
  const c3ChangeLabel = document.getElementById('c3-change-label');
  const c3Formula = document.getElementById('c3-formula');
  const c3Swap = document.getElementById('c3-swap');

  function updateCalc3() {
    const xVal = parseFloat(c3X.value);
    const yVal = parseFloat(c3Y.value);

    if (isNaN(xVal) || isNaN(yVal)) {
      c3Result.textContent = '—';
      c3Result.className = 'result-val';
      c3Diff.textContent = '—';
      c3Formula.innerHTML = `Formula: <span class="formula-code">((Y - X) ÷ |X|) × 100</span>`;
      return;
    }

    const diff = yVal - xVal;
    c3Diff.textContent = (diff > 0 ? '+' : '') + formatNumber(diff);

    if (xVal === 0) {
      if (yVal === 0) {
        c3Result.textContent = '0.00%';
        c3Result.className = 'result-val';
        c3ChangeLabel.textContent = 'No Change';
        c3Formula.innerHTML = `Formula: <span class="formula-code">Values are both 0 (0% change)</span>`;
      } else {
        c3Result.textContent = diff > 0 ? '+∞% (From 0)' : '-∞% (From 0)';
        c3Result.className = diff > 0 ? 'result-val positive' : 'result-val negative';
        c3ChangeLabel.textContent = diff > 0 ? 'Infinite Increase' : 'Infinite Decrease';
        c3Formula.innerHTML = `Formula: <span class="formula-code">Initial value is 0 (division by zero)</span>`;
      }
      return;
    }

    const pctChange = (diff / Math.abs(xVal)) * 100;
    const formattedPct = formatNumber(Math.abs(pctChange));

    if (pctChange > 0) {
      c3Result.textContent = `+${formattedPct}%`;
      c3Result.className = 'result-val positive';
      c3ChangeLabel.textContent = 'Increase (+)';
      c3Formula.innerHTML = `Formula: <span class="formula-code">((${yVal} - ${xVal}) ÷ |${xVal}|) × 100 = +${formattedPct}% Increase</span>`;
    } else if (pctChange < 0) {
      c3Result.textContent = `-${formattedPct}%`;
      c3Result.className = 'result-val negative';
      c3ChangeLabel.textContent = 'Decrease (−)';
      c3Formula.innerHTML = `Formula: <span class="formula-code">((${yVal} - ${xVal}) ÷ |${xVal}|) × 100 = -${formattedPct}% Decrease</span>`;
    } else {
      c3Result.textContent = `0.00%`;
      c3Result.className = 'result-val';
      c3ChangeLabel.textContent = 'No Change';
      c3Formula.innerHTML = `Formula: <span class="formula-code">Values are identical (0% change)</span>`;
    }
  }

  c3X.addEventListener('input', updateCalc3);
  c3Y.addEventListener('input', updateCalc3);

  c3Swap.addEventListener('click', () => {
    const temp = c3X.value;
    c3X.value = c3Y.value;
    c3Y.value = temp;
    updateCalc3();
  });

  document.querySelectorAll('[data-c3]').forEach(btn => {
    btn.addEventListener('click', () => {
      const [x, y] = btn.getAttribute('data-c3').split(',');
      c3X.value = x;
      c3Y.value = y;
      updateCalc3();
    });
  });

  // ==========================================
  // Calculator 4: Find Original Value Before X% Change
  // ==========================================
  const c4Y = document.getElementById('c4-y');
  const c4X = document.getElementById('c4-x');
  const c4TypeInc = document.getElementById('c4-type-inc');
  const c4TypeDec = document.getElementById('c4-type-dec');
  const c4Result = document.getElementById('c4-result');
  const c4Diff = document.getElementById('c4-diff');
  const c4Formula = document.getElementById('c4-formula');

  let c4IsIncrease = true;

  function setC4Type(isInc) {
    c4IsIncrease = isInc;
    if (isInc) {
      c4TypeInc.classList.add('active');
      c4TypeDec.classList.remove('active');
    } else {
      c4TypeDec.classList.add('active');
      c4TypeInc.classList.remove('active');
    }
    updateCalc4();
  }

  c4TypeInc.addEventListener('click', () => setC4Type(true));
  c4TypeDec.addEventListener('click', () => setC4Type(false));

  function updateCalc4() {
    const yVal = parseFloat(c4Y.value);
    const xVal = parseFloat(c4X.value);

    if (isNaN(yVal) || isNaN(xVal)) {
      c4Result.textContent = '—';
      c4Diff.textContent = '—';
      c4Formula.innerHTML = `Formula: <span class="formula-code">Y ÷ (1 ± (X ÷ 100))</span>`;
      return;
    }

    const rate = xVal / 100;
    const factor = c4IsIncrease ? (1 + rate) : (1 - rate);

    if (factor === 0) {
      c4Result.textContent = 'Undefined';
      c4Diff.textContent = '—';
      c4Formula.innerHTML = `Formula: <span class="formula-code">Division by zero (1 ${c4IsIncrease ? '+' : '-'} ${rate} = 0)</span>`;
      return;
    }

    const originalVal = yVal / factor;
    const diff = Math.abs(yVal - originalVal);

    const formattedOriginal = formatNumber(originalVal);
    const formattedDiff = formatNumber(diff);

    c4Result.textContent = formattedOriginal;
    c4Diff.textContent = formattedDiff;

    const opStr = c4IsIncrease ? '+' : '-';
    c4Formula.innerHTML = `Formula: <span class="formula-code">${yVal} ÷ (1 ${opStr} ${rate}) = ${formattedOriginal} (Original)</span>`;
  }

  c4Y.addEventListener('input', updateCalc4);
  c4X.addEventListener('input', updateCalc4);

  document.querySelectorAll('[data-c4]').forEach(btn => {
    btn.addEventListener('click', () => {
      const [y, x, type] = btn.getAttribute('data-c4').split(',');
      c4Y.value = y;
      c4X.value = x;
      setC4Type(type === 'inc');
    });
  });

  // Initial runs
  updateCalc1();
  updateCalc2();
  updateCalc3();
  updateCalc4();
});