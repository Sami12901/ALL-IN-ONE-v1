/**
 * Cryptographically Secure Random Number & Sequence Generator
 * Powered by Web Crypto API (window.crypto.getRandomValues)
 */

document.addEventListener('DOMContentLoaded', () => {
  // State
  let currentMode = 'single';
  let activeDie = 6;
  let originalResults = [];
  let currentResults = [];

  // DOM Elements - Tabs
  const tabButtons = document.querySelectorAll('.rng-tab-btn');
  const modeContents = document.querySelectorAll('.mode-content');

  // DOM Elements - Output
  const heroCard = document.getElementById('hero-result-card');
  const heroValue = document.getElementById('hero-result-value');
  const heroLabel = document.getElementById('result-mode-label');
  const heroSub = document.getElementById('result-mode-sub');
  const visualContainer = document.getElementById('visual-container');
  const multiContainer = document.getElementById('multi-result-container');
  const chipsList = document.getElementById('results-chips-list');
  const itemsCountBadge = document.getElementById('items-count-badge');
  const rawBox = document.getElementById('raw-output-box');
  const rawText = document.getElementById('raw-output-text');
  const resultActions = document.getElementById('result-actions');
  const statsSummary = document.getElementById('stats-summary');
  const statCount = document.getElementById('stat-count');
  const statSum = document.getElementById('stat-sum');
  const statMean = document.getElementById('stat-mean');
  const statMinMax = document.getElementById('stat-minmax');
  const distChartBox = document.getElementById('dist-chart-box');
  const distBarsList = document.getElementById('dist-bars-list');
  const outputMeta = document.getElementById('output-meta');

  // Buttons & Controls
  const btnGenSingle = document.getElementById('btn-gen-single');
  const btnGenList = document.getElementById('btn-gen-list');
  const btnRollDice = document.getElementById('btn-roll-dice');
  const btnFlipCoin = document.getElementById('btn-flip-coin');
  const btnGenChars = document.getElementById('btn-gen-chars');
  const btnGenSeq = document.getElementById('btn-gen-seq');

  const btnSortAsc = document.getElementById('btn-sort-asc');
  const btnSortDesc = document.getElementById('btn-sort-desc');
  const btnSortOrig = document.getElementById('btn-sort-orig');
  const btnCopyAll = document.getElementById('btn-copy-all');
  const btnCopyRaw = document.getElementById('btn-copy-raw');
  const btnClear = document.getElementById('btn-clear-results');

  // Inputs
  const singleMin = document.getElementById('single-min');
  const singleMax = document.getElementById('single-max');
  const singleType = document.getElementById('single-type');
  const singleDecGroup = document.getElementById('single-dec-group');
  const singleDecimals = document.getElementById('single-decimals');

  const listCount = document.getElementById('list-count');
  const listType = document.getElementById('list-type');
  const listMin = document.getElementById('list-min');
  const listMax = document.getElementById('list-max');
  const listDecGroup = document.getElementById('list-dec-group');
  const listDecimals = document.getElementById('list-decimals');
  const listUnique = document.getElementById('list-unique');
  const listSortAuto = document.getElementById('list-sort-auto');
  const listDelimiter = document.getElementById('list-delimiter');

  const diceBtns = document.querySelectorAll('.dice-btn');
  const diceCount = document.getElementById('dice-count');
  const diceMod = document.getElementById('dice-mod');

  const coinCount = document.getElementById('coin-count');
  const presetFlip1 = document.getElementById('preset-flip-1');
  const presetFlip10 = document.getElementById('preset-flip-10');
  const presetFlip100 = document.getElementById('preset-flip-100');

  const charCount = document.getElementById('char-count');
  const charUpper = document.getElementById('char-upper');
  const charLower = document.getElementById('char-lower');
  const charDigits = document.getElementById('char-digits');
  const charSymbols = document.getElementById('char-symbols');
  const charUnique = document.getElementById('char-unique');
  const charCustom = document.getElementById('char-custom');

  const seqStart = document.getElementById('seq-start');
  const seqEnd = document.getElementById('seq-end');
  const seqStep = document.getElementById('seq-step');
  const seqShuffle = document.getElementById('seq-shuffle');

  // --- CSPRNG Engine ---
  function getSecureRandomUint32() {
    const array = new Uint32Array(1);
    window.crypto.getRandomValues(array);
    return array[0];
  }

  function getSecureRandomFloat() {
    return getSecureRandomUint32() / (0xFFFFFFFF + 1);
  }

  function getSecureRandomInt(min, max) {
    if (min > max) [min, max] = [max, min];
    const range = max - min + 1;
    if (range <= 0 || range === 1) return min;

    const maxUint = 0xFFFFFFFF;
    const bucketLimit = Math.floor(maxUint / range) * range;
    let rand;
    do {
      rand = getSecureRandomUint32();
    } while (rand >= bucketLimit);

    return min + (rand % range);
  }

  function getSecureRandomFloatRange(min, max, decimals = 2) {
    if (min > max) [min, max] = [max, min];
    const val = min + getSecureRandomFloat() * (max - min);
    return parseFloat(val.toFixed(decimals));
  }

  function shuffleArray(arr) {
    const clone = [...arr];
    for (let i = clone.length - 1; i > 0; i--) {
      const j = getSecureRandomInt(0, i);
      [clone[i], clone[j]] = [clone[j], clone[i]];
    }
    return clone;
  }

  // --- Tab Navigation ---
  tabButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      tabButtons.forEach(b => b.classList.remove('active'));
      modeContents.forEach(c => c.classList.remove('active'));
      btn.classList.add('active');
      currentMode = btn.dataset.mode;
      const target = document.getElementById(`mode-${currentMode}`);
      if (target) target.classList.add('active');
    });
  });

  // Toggle Decimal precision inputs
  singleType.addEventListener('change', () => {
    singleDecGroup.style.display = singleType.value === 'float' ? 'block' : 'none';
  });

  listType.addEventListener('change', () => {
    listDecGroup.style.display = listType.value === 'float' ? 'block' : 'none';
  });

  // Dice selector buttons
  diceBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      diceBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      activeDie = parseInt(btn.dataset.die, 10);
    });
  });

  // Coin presets
  presetFlip1.addEventListener('click', () => { coinCount.value = 1; generateCoins(); });
  presetFlip10.addEventListener('click', () => { coinCount.value = 10; generateCoins(); });
  presetFlip100.addEventListener('click', () => { coinCount.value = 100; generateCoins(); });

  // --- Display Animation & State Updates ---
  function animateHero(val) {
    heroValue.textContent = val;
    heroValue.classList.remove('animating');
    void heroValue.offsetWidth; // Trigger reflow
    heroValue.classList.add('animating');
    setTimeout(() => heroValue.classList.remove('animating'), 300);
  }

  function renderChipsAndRaw(delimiterStr = ', ') {
    chipsList.innerHTML = '';
    currentResults.forEach(item => {
      const chip = document.createElement('span');
      chip.className = 'num-chip-item';
      chip.textContent = item;
      chipsList.appendChild(chip);
    });
    itemsCountBadge.textContent = `${currentResults.length} item${currentResults.length === 1 ? '' : 's'}`;

    const formattedText = currentResults.join(delimiterStr);
    rawText.textContent = formattedText;
  }

  function updateStatistics(numbers) {
    if (!numbers || numbers.length === 0) {
      statsSummary.style.display = 'none';
      distChartBox.style.display = 'none';
      return;
    }

    const n = numbers.length;
    const sum = numbers.reduce((acc, v) => acc + v, 0);
    const mean = sum / n;
    const min = Math.min(...numbers);
    const max = Math.max(...numbers);

    statCount.textContent = n.toLocaleString();
    statSum.textContent = Number.isInteger(sum) ? sum.toLocaleString() : sum.toFixed(2);
    statMean.textContent = mean.toFixed(2);
    statMinMax.textContent = `${min} / ${max}`;
    statsSummary.style.display = 'grid';

    // Render distribution
    renderDistribution(numbers, min, max);
  }

  function renderDistribution(numbers, min, max) {
    distBarsList.innerHTML = '';
    distChartBox.style.display = 'block';

    const count = numbers.length;
    const range = max - min;

    // Determine bins
    let bins = [];
    if (range < 10 && numbers.every(v => Number.isInteger(v))) {
      // Discrete bins
      const freq = {};
      numbers.forEach(v => { freq[v] = (freq[v] || 0) + 1; });
      for (let v = min; v <= max; v++) {
        bins.push({ label: `${v}`, count: freq[v] || 0 });
      }
    } else {
      // 5 to 8 range intervals
      const numBins = Math.min(8, Math.max(4, Math.floor(Math.sqrt(count))));
      const binWidth = (range + 1) / numBins;
      for (let i = 0; i < numBins; i++) {
        const binStart = min + i * binWidth;
        const binEnd = min + (i + 1) * binWidth;
        bins.push({
          start: binStart,
          end: binEnd,
          label: `${Math.round(binStart)}-${Math.round(binEnd)}`,
          count: 0
        });
      }
      numbers.forEach(val => {
        let placed = false;
        for (let i = 0; i < bins.length; i++) {
          if (val >= bins[i].start && (val < bins[i].end || (i === bins.length - 1 && val <= bins[i].end))) {
            bins[i].count++;
            placed = true;
            break;
          }
        }
        if (!placed && bins.length > 0) bins[bins.length - 1].count++;
      });
    }

    const maxCount = Math.max(1, ...bins.map(b => b.count));
    bins.forEach(bin => {
      const pct = ((bin.count / count) * 100).toFixed(1);
      const barWidth = Math.max(1, (bin.count / maxCount) * 100);

      const row = document.createElement('div');
      row.className = 'dist-bar-row';
      row.innerHTML = `
        <div class="dist-bar-label" title="${bin.label}">${bin.label}</div>
        <div class="dist-bar-track">
          <div class="dist-bar-fill" style="width: ${barWidth}%;"></div>
        </div>
        <div class="dist-bar-count">${bin.count} (${pct}%)</div>
      `;
      distBarsList.appendChild(row);
    });
  }

  // --- Mode 1: Single Number ---
  function generateSingle() {
    const min = parseFloat(singleMin.value) || 0;
    const max = parseFloat(singleMax.value) || 100;
    const isFloat = singleType.value === 'float';
    const dec = parseInt(singleDecimals.value, 10) || 2;

    let result;
    if (isFloat) {
      result = getSecureRandomFloatRange(min, max, dec);
    } else {
      result = getSecureRandomInt(Math.round(min), Math.round(max));
    }

    heroCard.style.display = 'flex';
    heroLabel.textContent = `Random ${isFloat ? 'Float' : 'Integer'}`;
    heroSub.textContent = `Range: [${min} ... ${max}]`;
    animateHero(result);

    multiContainer.style.display = 'none';
    visualContainer.style.display = 'none';
    rawBox.style.display = 'none';
    resultActions.style.display = 'none';
    statsSummary.style.display = 'none';
    distChartBox.style.display = 'none';
    outputMeta.textContent = 'Generated via CSPRNG';

    originalResults = [result];
    currentResults = [result];
  }

  // --- Mode 2: Bulk List ---
  function generateList() {
    const count = Math.min(5000, Math.max(1, parseInt(listCount.value, 10) || 10));
    const min = parseFloat(listMin.value) || 1;
    const max = parseFloat(listMax.value) || 100;
    const isFloat = listType.value === 'float';
    const dec = parseInt(listDecimals.value, 10) || 2;
    const unique = listUnique.checked;
    const autoSort = listSortAuto.checked;
    let delim = listDelimiter.value;
    if (delim === '\\n') delim = '\n';

    if (unique && !isFloat) {
      const possibleUnique = Math.floor(max) - Math.ceil(min) + 1;
      if (count > possibleUnique) {
        alert(`Cannot generate ${count} unique integers in range [${min}, ${max}] (only ${possibleUnique} possible).`);
        return;
      }
    }

    const results = [];
    if (unique && !isFloat) {
      // Range sample
      const possible = [];
      for (let i = Math.ceil(min); i <= Math.floor(max); i++) {
        possible.push(i);
      }
      const shuffled = shuffleArray(possible);
      for (let i = 0; i < count; i++) {
        results.push(shuffled[i]);
      }
    } else {
      for (let i = 0; i < count; i++) {
        if (isFloat) {
          results.push(getSecureRandomFloatRange(min, max, dec));
        } else {
          results.push(getSecureRandomInt(Math.round(min), Math.round(max)));
        }
      }
    }

    originalResults = [...results];
    if (autoSort) {
      results.sort((a, b) => a - b);
    }
    currentResults = results;

    heroCard.style.display = 'none';
    visualContainer.style.display = 'none';
    multiContainer.style.display = 'block';
    rawBox.style.display = 'block';
    resultActions.style.display = 'flex';

    renderChipsAndRaw(delim);
    updateStatistics(currentResults);
    outputMeta.textContent = `${count} values generated`;
  }

  // --- Mode 3: Dice Roller ---
  function rollDice() {
    const count = Math.min(100, Math.max(1, parseInt(diceCount.value, 10) || 1));
    const modifier = parseInt(diceMod.value, 10) || 0;
    const sides = activeDie;

    const rolls = [];
    let sum = 0;
    for (let i = 0; i < count; i++) {
      const roll = getSecureRandomInt(1, sides);
      rolls.push(roll);
      sum += roll;
    }
    const finalTotal = sum + modifier;

    heroCard.style.display = 'flex';
    heroLabel.textContent = `Dice Roll Result: ${count}d${sides}${modifier !== 0 ? (modifier > 0 ? `+${modifier}` : modifier) : ''}`;
    heroSub.textContent = `Sum: ${sum} ${modifier !== 0 ? `| Mod: ${modifier > 0 ? `+${modifier}` : modifier} = ${finalTotal}` : ''}`;
    animateHero(finalTotal);

    visualContainer.innerHTML = '';
    visualContainer.style.display = 'block';

    const diceContainer = document.createElement('div');
    diceContainer.className = 'dice-items-container';

    rolls.forEach((val, idx) => {
      const dieFace = document.createElement('div');
      dieFace.className = 'die-face';
      if (val === sides) dieFace.classList.add('die-max');
      if (val === 1) dieFace.classList.add('die-min');
      dieFace.textContent = val;
      dieFace.title = `Die #${idx + 1}: ${val}`;
      diceContainer.appendChild(dieFace);
    });
    visualContainer.appendChild(diceContainer);

    multiContainer.style.display = 'none';
    rawBox.style.display = 'block';
    rawText.textContent = `Rolls (${count}d${sides}): [${rolls.join(', ')}]\nDice Sum: ${sum}\nModifier: ${modifier}\nTotal: ${finalTotal}`;
    resultActions.style.display = 'flex';

    originalResults = [...rolls];
    currentResults = [...rolls];
    updateStatistics(rolls);
    outputMeta.textContent = `${count}d${sides} rolled`;
  }

  // --- Mode 4: Coin Flipper ---
  function generateCoins() {
    const count = Math.min(5000, Math.max(1, parseInt(coinCount.value, 10) || 1));
    let heads = 0;
    let tails = 0;
    const flips = [];

    for (let i = 0; i < count; i++) {
      const isHeads = getSecureRandomInt(0, 1) === 0;
      if (isHeads) {
        heads++;
        flips.push('Heads');
      } else {
        tails++;
        flips.push('Tails');
      }
    }

    const headsPct = ((heads / count) * 100).toFixed(1);
    const tailsPct = ((tails / count) * 100).toFixed(1);

    heroCard.style.display = 'flex';
    if (count === 1) {
      heroLabel.textContent = 'Coin Flip Outcome';
      heroSub.textContent = flips[0] === 'Heads' ? '🪙 Heads (50% probability)' : '🪙 Tails (50% probability)';
      animateHero(flips[0]);
      visualContainer.style.display = 'none';
    } else {
      heroLabel.textContent = `Coin Flips (${count} total)`;
      heroSub.textContent = `Heads: ${heads} (${headsPct}%) | Tails: ${tails} (${tailsPct}%)`;
      animateHero(`${heads}H / ${tails}T`);

      visualContainer.innerHTML = '';
      visualContainer.style.display = 'block';
      const coinsWrapper = document.createElement('div');
      coinsWrapper.className = 'coins-wrapper';
      const sampleFlips = flips.slice(0, 120); // render max 120 visual badges
      sampleFlips.forEach(f => {
        const b = document.createElement('span');
        b.className = `coin-badge ${f.toLowerCase()}`;
        b.textContent = f === 'Heads' ? 'H' : 'T';
        b.title = f;
        coinsWrapper.appendChild(b);
      });
      if (count > 120) {
        const extra = document.createElement('span');
        extra.style.cssText = 'font-size:0.8rem; color:var(--text-tertiary); align-self:center; margin-left:0.5rem;';
        extra.textContent = `+ ${count - 120} more...`;
        coinsWrapper.appendChild(extra);
      }
      visualContainer.appendChild(coinsWrapper);
    }

    multiContainer.style.display = 'none';
    rawBox.style.display = 'block';
    rawText.textContent = `Coin Flips (${count} flips):\nHeads: ${heads} (${headsPct}%)\nTails: ${tails} (${tailsPct}%)\nRatio: ${(heads / (tails || 1)).toFixed(3)}\n\nSequence:\n${flips.join(', ')}`;
    resultActions.style.display = 'flex';

    originalResults = [...flips];
    currentResults = [...flips];

    // Render bar distribution for coins
    distBarsList.innerHTML = '';
    distChartBox.style.display = 'block';
    const rowH = document.createElement('div');
    rowH.className = 'dist-bar-row';
    rowH.innerHTML = `
      <div class="dist-bar-label">Heads</div>
      <div class="dist-bar-track"><div class="dist-bar-fill" style="width: ${headsPct}%;"></div></div>
      <div class="dist-bar-count">${heads} (${headsPct}%)</div>
    `;
    const rowT = document.createElement('div');
    rowT.className = 'dist-bar-row';
    rowT.innerHTML = `
      <div class="dist-bar-label">Tails</div>
      <div class="dist-bar-track"><div class="dist-bar-fill" style="width: ${tailsPct}%;"></div></div>
      <div class="dist-bar-count">${tails} (${tailsPct}%)</div>
    `;
    distBarsList.appendChild(rowH);
    distBarsList.appendChild(rowT);

    statsSummary.style.display = 'none';
    outputMeta.textContent = `${count} flips executed`;
  }

  // --- Mode 5: Letters & Chars ---
  function generateLetters() {
    const length = Math.min(1000, Math.max(1, parseInt(charCount.value, 10) || 12));
    let pool = '';

    if (charCustom.value.trim().length > 0) {
      pool = charCustom.value.trim();
    } else {
      if (charUpper.checked) pool += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
      if (charLower.checked) pool += 'abcdefghijklmnopqrstuvwxyz';
      if (charDigits.checked) pool += '0123456789';
      if (charSymbols.checked) pool += '!@#$%^&*()-_=+[]{}|;:,.<>?';
    }

    if (pool.length === 0) {
      alert('Please select at least one character set or provide custom characters.');
      return;
    }

    const unique = charUnique.checked;
    if (unique && length > pool.length) {
      alert(`Cannot generate ${length} unique characters from pool of length ${pool.length}.`);
      return;
    }

    let result = '';
    if (unique) {
      const poolArr = pool.split('');
      const shuffled = shuffleArray(poolArr);
      result = shuffled.slice(0, length).join('');
    } else {
      for (let i = 0; i < length; i++) {
        const idx = getSecureRandomInt(0, pool.length - 1);
        result += pool[idx];
      }
    }

    heroCard.style.display = 'flex';
    heroLabel.textContent = `Random String (${length} chars)`;
    heroSub.textContent = `Character pool size: ${pool.length} unique symbols`;
    heroValue.style.fontSize = length > 20 ? 'clamp(1.5rem, 4vw, 2.5rem)' : 'clamp(2.5rem, 8vw, 4.5rem)';
    animateHero(result);

    multiContainer.style.display = 'none';
    visualContainer.style.display = 'none';
    rawBox.style.display = 'block';
    rawText.textContent = result;
    resultActions.style.display = 'flex';
    statsSummary.style.display = 'none';
    distChartBox.style.display = 'none';

    originalResults = [result];
    currentResults = [result];
    outputMeta.textContent = `${length} characters generated`;
  }

  // --- Mode 6: Sequence Range ---
  function generateSequence() {
    const start = parseInt(seqStart.value, 10) || 1;
    const end = parseInt(seqEnd.value, 10) || 50;
    const step = Math.max(1, parseInt(seqStep.value, 10) || 1);
    const shouldShuffle = seqShuffle.checked;

    const min = Math.min(start, end);
    const max = Math.max(start, end);

    const items = [];
    if (start <= end) {
      for (let i = start; i <= end; i += step) items.push(i);
    } else {
      for (let i = start; i >= end; i -= step) items.push(i);
    }

    if (items.length > 5000) {
      alert(`Sequence contains ${items.length} items, which exceeds the limit of 5,000.`);
      return;
    }

    let finalSeq = shouldShuffle ? shuffleArray(items) : items;
    originalResults = [...finalSeq];
    currentResults = [...finalSeq];

    heroCard.style.display = 'none';
    visualContainer.style.display = 'none';
    multiContainer.style.display = 'block';
    rawBox.style.display = 'block';
    resultActions.style.display = 'flex';

    renderChipsAndRaw(', ');
    updateStatistics(currentResults);
    outputMeta.textContent = `${currentResults.length} numbers in sequence`;
  }

  // --- Sorting Controls ---
  btnSortAsc.addEventListener('click', () => {
    if (currentResults.length === 0) return;
    if (typeof currentResults[0] === 'number') {
      currentResults.sort((a, b) => a - b);
    } else {
      currentResults.sort((a, b) => String(a).localeCompare(String(b)));
    }
    renderChipsAndRaw(', ');
  });

  btnSortDesc.addEventListener('click', () => {
    if (currentResults.length === 0) return;
    if (typeof currentResults[0] === 'number') {
      currentResults.sort((a, b) => b - a);
    } else {
      currentResults.sort((a, b) => String(b).localeCompare(String(a)));
    }
    renderChipsAndRaw(', ');
  });

  btnSortOrig.addEventListener('click', () => {
    currentResults = [...originalResults];
    renderChipsAndRaw(', ');
  });

  // --- Copy Actions ---
  function copyToClipboard(text, btn) {
    if (!text) return;
    navigator.clipboard.writeText(text).then(() => {
      const originalText = btn.innerHTML;
      btn.textContent = 'Copied!';
      btn.classList.add('copied');
      setTimeout(() => {
        btn.innerHTML = originalText;
        btn.classList.remove('copied');
      }, 1500);
    }).catch(err => {
      console.error('Clipboard copy error:', err);
    });
  }

  btnCopyAll.addEventListener('click', () => {
    const textToCopy = rawText.textContent || heroValue.textContent;
    copyToClipboard(textToCopy, btnCopyAll);
  });

  btnCopyRaw.addEventListener('click', () => {
    copyToClipboard(rawText.textContent, btnCopyRaw);
  });

  // --- Clear Action ---
  btnClear.addEventListener('click', () => {
    originalResults = [];
    currentResults = [];
    heroValue.textContent = '-';
    chipsList.innerHTML = '';
    rawText.textContent = '';
    statsSummary.style.display = 'none';
    distChartBox.style.display = 'none';
    multiContainer.style.display = 'none';
    visualContainer.style.display = 'none';
    rawBox.style.display = 'none';
    resultActions.style.display = 'none';
    outputMeta.textContent = 'Cleared';
  });

  // Attach Generate Event Listeners
  btnGenSingle.addEventListener('click', generateSingle);
  btnGenList.addEventListener('click', generateList);
  btnRollDice.addEventListener('click', rollDice);
  btnFlipCoin.addEventListener('click', generateCoins);
  btnGenChars.addEventListener('click', generateLetters);
  btnGenSeq.addEventListener('click', generateSequence);

  // Initialize with a single roll
  generateSingle();
});