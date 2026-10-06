// Standard Deviation & Statistical Dispersion Engine
// Calculates sample/population SD, variance, quartiles, and step-by-step deviations.

document.addEventListener('DOMContentLoaded', () => {
  const inputEl = document.getElementById('dataset-input');
  const calcBtn = document.getElementById('calc-btn');
  const clearBtn = document.getElementById('clear-btn');
  const errorEl = document.getElementById('error-message');
  const decimalSelect = document.getElementById('decimal-places');
  const copySummaryBtn = document.getElementById('copy-summary-btn');

  // Hero Metrics
  const sampleSdEl = document.getElementById('stat-sample-sd');
  const popSdEl = document.getElementById('stat-pop-sd');
  const sampleVarEl = document.getElementById('stat-sample-var');
  const popVarEl = document.getElementById('stat-pop-var');

  // Secondary Metrics
  const meanEl = document.getElementById('stat-mean');
  const medianEl = document.getElementById('stat-median');
  const modeEl = document.getElementById('stat-mode');
  const countEl = document.getElementById('stat-count');
  const sumEl = document.getElementById('stat-sum');
  const rangeEl = document.getElementById('stat-range');
  const minMaxEl = document.getElementById('stat-minmax');
  const ssEl = document.getElementById('stat-ss');

  // Deviations Table
  const tableBody = document.getElementById('deviations-table-body');
  const tfootSumX = document.getElementById('tfoot-sum-x');
  const tfootSumDev = document.getElementById('tfoot-sum-dev');
  const tfootSumSS = document.getElementById('tfoot-sum-ss');

  let currentStats = null;

  function getDecimals() {
    return parseInt(decimalSelect.value, 10) || 4;
  }

  function fmt(val, dec = getDecimals()) {
    if (val === null || val === undefined || isNaN(val)) return '—';
    return Number(val).toLocaleString('en-US', {
      minimumFractionDigits: 0,
      maximumFractionDigits: dec
    });
  }

  // Parse input string into numbers
  function parseData(raw) {
    if (!raw || !raw.trim()) return [];
    // Split on commas, spaces, tabs, newlines, semicolons
    const tokens = raw.trim().split(/[\s,;]+/);
    const nums = [];
    for (const t of tokens) {
      if (t === '') continue;
      const num = parseFloat(t);
      if (!isNaN(num) && isFinite(num)) {
        nums.push(num);
      }
    }
    return nums;
  }

  // Mode calculator
  function computeMode(nums) {
    const freq = {};
    let maxFreq = 0;
    nums.forEach(n => {
      freq[n] = (freq[n] || 0) + 1;
      if (freq[n] > maxFreq) maxFreq = freq[n];
    });

    if (maxFreq === 1 && nums.length > 1) {
      return 'None (All unique)';
    }

    const modes = Object.keys(freq).filter(n => freq[n] === maxFreq).map(Number);
    if (modes.length === nums.length) {
      return 'None (Equal frequencies)';
    }

    if (modes.length === 1) {
      return fmt(modes[0]);
    }
    if (modes.length === 2) {
      return `${fmt(modes[0])}, ${fmt(modes[1])} (Bimodal)`;
    }
    return `${modes.slice(0, 3).map(m => fmt(m)).join(', ')}... (Multimodal)`;
  }

  // Calculate Statistics
  function calculateStatistics(nums) {
    const n = nums.length;
    if (n === 0) {
      throw new Error('Please enter at least one valid number.');
    }

    const sum = nums.reduce((a, b) => a + b, 0);
    const mean = sum / n;

    // Sort for median and min/max
    const sorted = [...nums].sort((a, b) => a - b);
    const min = sorted[0];
    const max = sorted[n - 1];
    const range = max - min;

    // Median
    let median;
    if (n % 2 !== 0) {
      median = sorted[Math.floor(n / 2)];
    } else {
      const mid1 = sorted[n / 2 - 1];
      const mid2 = sorted[n / 2];
      median = (mid1 + mid2) / 2;
    }

    // Mode
    const mode = computeMode(nums);

    // Deviations and Sum of Squares (SS)
    const deviations = [];
    let ss = 0;
    let sumDev = 0;

    nums.forEach((val, idx) => {
      const dev = val - mean;
      const sqDev = dev * dev;
      deviations.push({ i: idx + 1, val, dev, sqDev });
      ss += sqDev;
      sumDev += dev;
    });

    // Variances & Standard Deviations
    const popVar = ss / n;
    const popSd = Math.sqrt(popVar);

    let sampleVar = null;
    let sampleSd = null;
    if (n > 1) {
      sampleVar = ss / (n - 1);
      sampleSd = Math.sqrt(sampleVar);
    }

    return {
      n,
      sum,
      mean,
      median,
      mode,
      min,
      max,
      range,
      ss,
      sumDev,
      popVar,
      popSd,
      sampleVar,
      sampleSd,
      deviations
    };
  }

  function renderStats(stats) {
    currentStats = stats;
    errorEl.style.display = 'none';

    // Hero metrics
    if (stats.n > 1) {
      sampleSdEl.textContent = fmt(stats.sampleSd);
      sampleVarEl.textContent = fmt(stats.sampleVar);
    } else {
      sampleSdEl.textContent = 'N/A (n ≥ 2)';
      sampleVarEl.textContent = 'N/A (n ≥ 2)';
    }

    popSdEl.textContent = fmt(stats.popSd);
    popVarEl.textContent = fmt(stats.popVar);

    // Secondary metrics
    meanEl.textContent = fmt(stats.mean);
    medianEl.textContent = fmt(stats.median);
    modeEl.textContent = stats.mode;
    countEl.textContent = String(stats.n);
    sumEl.textContent = fmt(stats.sum);
    rangeEl.textContent = fmt(stats.range);
    minMaxEl.textContent = `${fmt(stats.min)} / ${fmt(stats.max)}`;
    ssEl.textContent = fmt(stats.ss);

    // Table rows
    tableBody.innerHTML = '';
    const maxTableRows = 300;
    const toRender = stats.deviations.slice(0, maxTableRows);

    toRender.forEach(row => {
      const tr = document.createElement('tr');
      const devSign = row.dev > 0 ? '+' : '';
      tr.innerHTML = `
        <td style="color: var(--text-tertiary); font-weight: 600;">${row.i}</td>
        <td style="font-weight: 700;">${fmt(row.val)}</td>
        <td style="color: ${row.dev < 0 ? '#f87171' : row.dev > 0 ? '#34d399' : 'inherit'};">${devSign}${fmt(row.dev)}</td>
        <td style="color: var(--accent); font-weight: 600;">${fmt(row.sqDev)}</td>
      `;
      tableBody.appendChild(tr);
    });

    if (stats.deviations.length > maxTableRows) {
      const tr = document.createElement('tr');
      tr.innerHTML = `<td colspan="4" style="text-align: center; color: var(--text-tertiary); font-style: italic;">... and ${stats.deviations.length - maxTableRows} more entries ...</td>`;
      tableBody.appendChild(tr);
    }

    tfootSumX.textContent = fmt(stats.sum);
    tfootSumDev.textContent = Math.abs(stats.sumDev) < 1e-10 ? '0.0000' : fmt(stats.sumDev);
    tfootSumSS.textContent = fmt(stats.ss);
  }

  function runCalculation() {
    const raw = inputEl.value;
    const numbers = parseData(raw);

    if (numbers.length === 0) {
      errorEl.textContent = 'Please enter at least one numeric value.';
      errorEl.style.display = 'block';
      return;
    }

    try {
      const stats = calculateStatistics(numbers);
      renderStats(stats);
    } catch (err) {
      errorEl.textContent = err.message || 'An error occurred during calculation.';
      errorEl.style.display = 'block';
    }
  }

  // Event Listeners
  calcBtn.addEventListener('click', runCalculation);
  inputEl.addEventListener('input', () => {
    // Live update on input
    runCalculation();
  });

  decimalSelect.addEventListener('change', () => {
    if (currentStats) {
      renderStats(currentStats);
    }
  });

  clearBtn.addEventListener('click', () => {
    inputEl.value = '';
    inputEl.focus();
    errorEl.style.display = 'none';
  });

  // Presets
  const presets = {
    scores: '78, 85, 92, 88, 75, 90, 82, 95, 88, 84',
    heights: '165, 172, 168, 175, 180, 162, 170, 178',
    times: '210, 245, 195, 230, 280, 215, 205, 250, 220, 260, 215, 240',
    salaries: '45, 52, 48, 60, 55, 120, 50',
    random: () => {
      const arr = [];
      for (let i = 0; i < 10; i++) {
        arr.push(Math.floor(Math.random() * 90) + 10);
      }
      return arr.join(', ');
    }
  };

  document.querySelectorAll('[data-preset]').forEach(btn => {
    btn.addEventListener('click', () => {
      const key = btn.getAttribute('data-preset');
      const val = typeof presets[key] === 'function' ? presets[key]() : presets[key];
      inputEl.value = val;
      runCalculation();
    });
  });

  // Copy Summary Report
  copySummaryBtn.addEventListener('click', async () => {
    if (!currentStats) return;

    const report = [
      `=== Standard Deviation & Statistics Report ===`,
      `Count (N): ${currentStats.n}`,
      `Sum (Σx): ${fmt(currentStats.sum)}`,
      `Mean (μ or x̄): ${fmt(currentStats.mean)}`,
      `Median: ${fmt(currentStats.median)}`,
      `Mode: ${currentStats.mode}`,
      `Min: ${fmt(currentStats.min)} | Max: ${fmt(currentStats.max)}`,
      `Range: ${fmt(currentStats.range)}`,
      `Sum of Squares (SS): ${fmt(currentStats.ss)}`,
      `Sample Variance (s²): ${currentStats.sampleVar !== null ? fmt(currentStats.sampleVar) : 'N/A'}`,
      `Sample Std Dev (s): ${currentStats.sampleSd !== null ? fmt(currentStats.sampleSd) : 'N/A'}`,
      `Population Variance (σ²): ${fmt(currentStats.popVar)}`,
      `Population Std Dev (σ): ${fmt(currentStats.popSd)}`
    ].join('\n');

    try {
      await navigator.clipboard.writeText(report);
      const original = copySummaryBtn.innerHTML;
      copySummaryBtn.innerHTML = `<span style="color: #10b981;">✓ Copied Report!</span>`;
      setTimeout(() => {
        copySummaryBtn.innerHTML = original;
      }, 1800);
    } catch (err) {
      console.error(err);
    }
  });

  // Initial calculation
  runCalculation();
});