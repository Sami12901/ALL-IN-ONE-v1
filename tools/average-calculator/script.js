// Average & Statistics Calculator Logic

document.addEventListener('DOMContentLoaded', () => {
  const inputEl = document.getElementById('numbers-input');
  const precisionEl = document.getElementById('decimal-precision');
  const excludeOutliersEl = document.getElementById('exclude-outliers-toggle');
  const btnCalculate = document.getElementById('btn-calculate');
  const btnClear = document.getElementById('btn-clear');
  const btnCopyReport = document.getElementById('btn-copy-report');
  const presetChips = document.querySelectorAll('.preset-chip');

  // Hero displays
  const heroMean = document.getElementById('hero-mean');
  const heroMedian = document.getElementById('hero-median');
  const heroMode = document.getElementById('hero-mode');
  const heroRange = document.getElementById('hero-range');

  // Table statistics
  const statCount = document.getElementById('stat-count');
  const statSum = document.getElementById('stat-sum');
  const statMean = document.getElementById('stat-mean');
  const statMedian = document.getElementById('stat-median');
  const statMode = document.getElementById('stat-mode');
  const statGeomMean = document.getElementById('stat-geom-mean');
  const statHarmMean = document.getElementById('stat-harm-mean');
  const statRms = document.getElementById('stat-rms');
  const statMin = document.getElementById('stat-min');
  const statMax = document.getElementById('stat-max');
  const statRange = document.getElementById('stat-range');
  const statQ1 = document.getElementById('stat-q1');
  const statQ3 = document.getElementById('stat-q3');
  const statIqr = document.getElementById('stat-iqr');
  const statSampleStd = document.getElementById('stat-sample-std');
  const statPopStd = document.getElementById('stat-pop-std');
  const statSampleVar = document.getElementById('stat-sample-var');
  const statPopVar = document.getElementById('stat-pop-var');

  // Outlier and chip previews
  const outlierBox = document.getElementById('outlier-alert-box');
  const outlierText = document.getElementById('outlier-text');
  const outlierIcon = document.getElementById('outlier-icon');
  const sortedChipsList = document.getElementById('sorted-chips-list');
  const sortedCountBadge = document.getElementById('sorted-count-badge');

  const presets = {
    'exam-grades': '78, 85, 92, 88, 76, 95, 89, 92, 84, 90, 88, 79',
    'with-outliers': '14, 15, 14, 16, 15, 13, 85, 14, 16, 12, 3, 15',
    'temperatures': '68.5, 71.2, 70.0, 72.8, 69.4, 73.1, 71.5, 69.9',
    'growth-rates': '1.05, 1.08, 1.02, 1.12, 1.04, 1.07, 1.09'
  };

  // Helper to parse numbers from textarea
  function parseNumbers(rawText) {
    if (!rawText || !rawText.trim()) return [];
    // Split by commas, semicolons, whitespace, tabs, newlines
    const tokens = rawText.split(/[\s,;]+/);
    const validNumbers = [];
    for (const token of tokens) {
      const trimmed = token.trim();
      if (trimmed !== '') {
        const num = Number(trimmed);
        if (!isNaN(num) && isFinite(num)) {
          validNumbers.push(num);
        }
      }
    }
    return validNumbers;
  }

  // Format number based on selected precision
  function formatNum(value, precision) {
    if (typeof value !== 'number' || isNaN(value)) return 'N/A';
    if (!isFinite(value)) return value > 0 ? '+Infinity' : '-Infinity';
    if (precision === 'auto') {
      return Number(value.toPrecision(12)).toString();
    }
    const dec = parseInt(precision, 10);
    return value.toLocaleString('en-US', {
      minimumFractionDigits: dec,
      maximumFractionDigits: dec
    });
  }

  // Calculate median of sorted array
  function getMedian(sortedArr) {
    const len = sortedArr.length;
    if (len === 0) return 0;
    const mid = Math.floor(len / 2);
    if (len % 2 !== 0) {
      return sortedArr[mid];
    } else {
      return (sortedArr[mid - 1] + sortedArr[mid]) / 2;
    }
  }

  // Calculate quartiles Q1, Q3 and IQR
  function calculateQuartiles(sortedArr) {
    const len = sortedArr.length;
    if (len === 0) return { q1: 0, q3: 0, iqr: 0 };
    if (len === 1) return { q1: sortedArr[0], q3: sortedArr[0], iqr: 0 };

    let lowerHalf, upperHalf;
    const mid = Math.floor(len / 2);

    if (len % 2 === 0) {
      lowerHalf = sortedArr.slice(0, mid);
      upperHalf = sortedArr.slice(mid);
    } else {
      lowerHalf = sortedArr.slice(0, mid);
      upperHalf = sortedArr.slice(mid + 1);
    }

    const q1 = getMedian(lowerHalf);
    const q3 = getMedian(upperHalf);
    const iqr = q3 - q1;
    return { q1, q3, iqr };
  }

  // Detect outliers via IQR method
  function identifyOutliers(sortedArr, q1, q3, iqr) {
    const lowerFence = q1 - 1.5 * iqr;
    const upperFence = q3 + 1.5 * iqr;
    const outliers = [];
    const outlierIndices = new Set();

    sortedArr.forEach((val, idx) => {
      if (val < lowerFence || val > upperFence) {
        outliers.push(val);
        outlierIndices.add(idx);
      }
    });

    return { lowerFence, upperFence, outliers, outlierIndices };
  }

  // Calculate mode
  function calculateMode(numbers) {
    if (numbers.length === 0) return { modeStr: 'N/A', modes: [] };
    const counts = new Map();
    let maxFreq = 0;

    for (const num of numbers) {
      const cnt = (counts.get(num) || 0) + 1;
      counts.set(num, cnt);
      if (cnt > maxFreq) maxFreq = cnt;
    }

    if (maxFreq === 1 && numbers.length > 1) {
      return { modeStr: 'No mode (all unique)', modes: [] };
    }

    // Check if every distinct number has the same frequency
    let allSame = true;
    for (const cnt of counts.values()) {
      if (cnt !== maxFreq) {
        allSame = false;
        break;
      }
    }
    if (allSame && counts.size > 1) {
      return { modeStr: 'No mode (uniform freq)', modes: [] };
    }

    const modes = [];
    counts.forEach((freq, val) => {
      if (freq === maxFreq) modes.push(val);
    });

    modes.sort((a, b) => a - b);
    return {
      modeStr: modes.map(m => m.toString()).join(', ') + ` (freq: ${maxFreq})`,
      modes
    };
  }

  function calculateAll() {
    const rawNumbers = parseNumbers(inputEl.value);
    const precision = precisionEl.value;
    const excludeOutliers = excludeOutliersEl.checked;

    if (rawNumbers.length === 0) {
      // Clear display
      heroMean.textContent = '-';
      heroMedian.textContent = '-';
      heroMode.textContent = '-';
      heroRange.textContent = '-';

      statCount.textContent = '-';
      statSum.textContent = '-';
      statMean.textContent = '-';
      statMedian.textContent = '-';
      statMode.textContent = '-';
      statGeomMean.textContent = '-';
      statHarmMean.textContent = '-';
      statRms.textContent = '-';
      statMin.textContent = '-';
      statMax.textContent = '-';
      statRange.textContent = '-';
      statQ1.textContent = '-';
      statQ3.textContent = '-';
      statIqr.textContent = '-';
      statSampleStd.textContent = '-';
      statPopStd.textContent = '-';
      statSampleVar.textContent = '-';
      statPopVar.textContent = '-';

      outlierBox.style.display = 'none';
      sortedChipsList.innerHTML = '<span style="font-size: 0.8rem; color: var(--text-tertiary); font-style: italic;">Enter numbers above to see sorted list...</span>';
      sortedCountBadge.textContent = '0 numbers';
      return;
    }

    // Sort full dataset ascending
    const sortedAll = [...rawNumbers].sort((a, b) => a - b);
    const { q1, q3, iqr } = calculateQuartiles(sortedAll);
    const { lowerFence, upperFence, outliers, outlierIndices } = identifyOutliers(sortedAll, q1, q3, iqr);

    // Active dataset for statistics
    let activeNumbers = sortedAll;
    if (excludeOutliers && outliers.length > 0) {
      activeNumbers = sortedAll.filter(n => n >= lowerFence && n <= upperFence);
    }

    const n = activeNumbers.length;
    const sum = activeNumbers.reduce((acc, x) => acc + x, 0);
    const mean = sum / n;
    const median = getMedian(activeNumbers);
    const { modeStr } = calculateMode(activeNumbers);
    const min = activeNumbers[0];
    const max = activeNumbers[activeNumbers.length - 1];
    const range = max - min;

    // Geometric Mean: valid if all numbers > 0
    let geomMeanText = 'N/A';
    const allPositive = activeNumbers.every(x => x > 0);
    if (allPositive) {
      const logSum = activeNumbers.reduce((acc, x) => acc + Math.log(x), 0);
      const geom = Math.exp(logSum / n);
      geomMeanText = formatNum(geom, precision);
    } else {
      geomMeanText = 'Requires all values > 0';
    }

    // Harmonic Mean: valid if all numbers > 0
    let harmMeanText = 'N/A';
    if (allPositive) {
      const invSum = activeNumbers.reduce((acc, x) => acc + (1 / x), 0);
      const harm = n / invSum;
      harmMeanText = formatNum(harm, precision);
    } else {
      harmMeanText = 'Requires all values > 0';
    }

    // RMS (Quadratic Mean)
    const sumSquares = activeNumbers.reduce((acc, x) => acc + (x * x), 0);
    const rms = Math.sqrt(sumSquares / n);

    // Variances & Standard Deviations
    const sumSqDiff = activeNumbers.reduce((acc, x) => acc + Math.pow(x - mean, 2), 0);
    const popVar = sumSqDiff / n;
    const popStd = Math.sqrt(popVar);
    const sampleVar = n > 1 ? sumSqDiff / (n - 1) : 0;
    const sampleStd = Math.sqrt(sampleVar);

    // Display Hero Stats
    heroMean.textContent = formatNum(mean, precision);
    heroMedian.textContent = formatNum(median, precision);
    heroMode.textContent = modeStr.split(' (')[0];
    heroRange.textContent = formatNum(range, precision);

    // Display Table Stats
    statCount.textContent = n.toString() + (excludeOutliers && outliers.length > 0 ? ` (${outliers.length} excluded)` : '');
    statSum.textContent = formatNum(sum, precision);
    statMean.textContent = formatNum(mean, precision);
    statMedian.textContent = formatNum(median, precision);
    statMode.textContent = modeStr;
    statGeomMean.textContent = geomMeanText;
    statHarmMean.textContent = harmMeanText;
    statRms.textContent = formatNum(rms, precision);
    statMin.textContent = formatNum(min, precision);
    statMax.textContent = formatNum(max, precision);
    statRange.textContent = formatNum(range, precision);
    statQ1.textContent = formatNum(q1, precision);
    statQ3.textContent = formatNum(q3, precision);
    statIqr.textContent = formatNum(iqr, precision);
    statSampleStd.textContent = n > 1 ? formatNum(sampleStd, precision) : 'N/A (N < 2)';
    statPopStd.textContent = formatNum(popStd, precision);
    statSampleVar.textContent = n > 1 ? formatNum(sampleVar, precision) : 'N/A (N < 2)';
    statPopVar.textContent = formatNum(popVar, precision);

    // Render Outlier Status Banner
    outlierBox.style.display = 'flex';
    if (outliers.length > 0) {
      outlierBox.className = 'outlier-alert has-outliers';
      outlierIcon.innerHTML = '<path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line>';
      outlierText.innerHTML = `<strong>${outliers.length} Outlier${outliers.length > 1 ? 's' : ''} Detected:</strong> [${outliers.join(', ')}]<br><span style="font-size:0.775rem;">IQR Fences: Lower &lt; ${formatNum(lowerFence, 2)}, Upper &gt; ${formatNum(upperFence, 2)}</span>`;
    } else {
      outlierBox.className = 'outlier-alert no-outliers';
      outlierIcon.innerHTML = '<circle cx="12" cy="12" r="10"></circle><path d="m9 12 2 2 4-4"></path>';
      outlierText.innerHTML = `<strong>No Statistical Outliers Found.</strong> All data points reside within IQR boundaries [${formatNum(lowerFence, 2)}, ${formatNum(upperFence, 2)}].`;
    }

    // Render sorted chips list
    sortedCountBadge.textContent = `${sortedAll.length} items`;
    sortedChipsList.innerHTML = '';
    sortedAll.forEach((num, idx) => {
      const chip = document.createElement('span');
      const isOutlier = outlierIndices.has(idx);
      chip.className = `num-chip ${isOutlier ? 'outlier' : ''}`;
      chip.title = isOutlier ? `Outlier (${num}) outside fences` : `Value: ${num}`;
      chip.textContent = num;
      sortedChipsList.appendChild(chip);
    });
  }

  // Preset loading
  presetChips.forEach(chip => {
    chip.addEventListener('click', () => {
      const key = chip.getAttribute('data-preset');
      if (presets[key]) {
        inputEl.value = presets[key];
        calculateAll();
      }
    });
  });

  // Copy Summary Report
  btnCopyReport.addEventListener('click', () => {
    const rawNumbers = parseNumbers(inputEl.value);
    if (rawNumbers.length === 0) {
      alert('Please enter a dataset first.');
      return;
    }

    const report = [
      '========================================',
      '   ALL IN ONE - STATISTICAL SUMMARY',
      '========================================',
      `Count (N):             ${statCount.textContent}`,
      `Sum:                   ${statSum.textContent}`,
      `Mean (Average):        ${statMean.textContent}`,
      `Median:                ${statMedian.textContent}`,
      `Mode:                  ${statMode.textContent}`,
      `Range:                 ${statRange.textContent}`,
      `Min / Max:             ${statMin.textContent} / ${statMax.textContent}`,
      `Geometric Mean:        ${statGeomMean.textContent}`,
      `Harmonic Mean:         ${statHarmMean.textContent}`,
      `Quadratic Mean (RMS):  ${statRms.textContent}`,
      `Quartiles (Q1, Q3):    ${statQ1.textContent}, ${statQ3.textContent}`,
      `IQR:                   ${statIqr.textContent}`,
      `Sample Std Dev (s):    ${statSampleStd.textContent}`,
      `Population Std Dev:    ${statPopStd.textContent}`,
      `Sample Variance:       ${statSampleVar.textContent}`,
      `Population Variance:   ${statPopVar.textContent}`,
      '----------------------------------------',
      outlierText.textContent.replace(/<[^>]*>/g, ' '),
      '========================================'
    ].join('\n');

    navigator.clipboard.writeText(report).then(() => {
      const originalHtml = btnCopyReport.innerHTML;
      btnCopyReport.innerHTML = `
        <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <polyline points="20 6 9 17 4 12"></polyline>
        </svg>
        <span>Copied!</span>
      `;
      setTimeout(() => {
        btnCopyReport.innerHTML = originalHtml;
      }, 2000);
    }).catch(err => {
      console.error('Failed to copy: ', err);
    });
  });

  // Events
  inputEl.addEventListener('input', calculateAll);
  precisionEl.addEventListener('change', calculateAll);
  excludeOutliersEl.addEventListener('change', calculateAll);
  btnCalculate.addEventListener('click', calculateAll);

  btnClear.addEventListener('click', () => {
    inputEl.value = '';
    calculateAll();
    inputEl.focus();
  });

  // Initialize with default preset for instant preview
  inputEl.value = presets['exam-grades'];
  calculateAll();
});