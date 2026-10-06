// Prime Factorization Calculator Engine
// Supports integer factorization, exponential notation, visual factor trees, and divisor analysis.

document.addEventListener('DOMContentLoaded', () => {
  const inputEl = document.getElementById('number-input');
  const calcBtn = document.getElementById('calc-btn');
  const randomBtn = document.getElementById('random-btn');
  const errorEl = document.getElementById('error-message');
  
  const statusBadge = document.getElementById('prime-status-badge');
  const canonicalEl = document.getElementById('canonical-output');
  const factorsListEl = document.getElementById('factors-list');
  const uniquePrimesEl = document.getElementById('unique-primes');
  const divisorsCountEl = document.getElementById('divisors-count');
  const divisorsCountLabel = document.getElementById('divisors-count-label');
  const divisorsSumEl = document.getElementById('divisors-sum');
  const divisorsGridEl = document.getElementById('divisors-grid');
  const stepsTableBody = document.getElementById('steps-table-body');
  const treeSvg = document.getElementById('tree-svg');
  
  const copyCanonicalBtn = document.getElementById('copy-canonical-btn');
  const copySummaryBtn = document.getElementById('copy-summary-btn');
  const copyDivisorsBtn = document.getElementById('copy-divisors-btn');
  
  let currentCalculation = null;

  // Tab switching
  const tabBtns = document.querySelectorAll('.tab-btn');
  tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      tabBtns.forEach(b => b.classList.remove('active'));
      document.querySelectorAll('.tab-content').forEach(c => c.style.display = 'none');
      btn.classList.add('active');
      const targetId = btn.getAttribute('data-tab');
      const targetContent = document.getElementById(targetId);
      if (targetContent) targetContent.style.display = 'block';
    });
  });

  // Preset chips
  document.querySelectorAll('.preset-chip[data-value]').forEach(chip => {
    chip.addEventListener('click', () => {
      inputEl.value = chip.getAttribute('data-value');
      runFactorization();
    });
  });

  // Quick random samples
  const randomSamples = [12, 45, 84, 180, 256, 360, 540, 720, 1024, 1260, 2027, 2310, 4896, 7919, 13195, 65536, 104729];
  randomBtn.addEventListener('click', () => {
    const pick = randomSamples[Math.floor(Math.random() * randomSamples.length)];
    inputEl.value = pick;
    runFactorization();
  });

  calcBtn.addEventListener('click', runFactorization);
  inputEl.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      runFactorization();
    }
  });

  // Copy helpers
  function setupCopyButton(btn, getTextCallback) {
    if (!btn) return;
    btn.addEventListener('click', async () => {
      const text = getTextCallback();
      if (!text) return;
      try {
        await navigator.clipboard.writeText(text);
        const originalText = btn.innerHTML;
        btn.innerHTML = `<span style="color:#10b981;">✓ Copied!</span>`;
        setTimeout(() => {
          btn.innerHTML = originalText;
        }, 1800);
      } catch (err) {
        console.error('Copy failed:', err);
      }
    });
  }

  setupCopyButton(copyCanonicalBtn, () => currentCalculation ? currentCalculation.canonicalText : '');
  setupCopyButton(copySummaryBtn, () => currentCalculation ? formatSummaryText(currentCalculation) : '');
  setupCopyButton(copyDivisorsBtn, () => currentCalculation ? currentCalculation.divisors.join(', ') : '');

  // Superscript numbers
  const SUPERSCRIPTS = {
    '0': '⁰', '1': '¹', '2': '²', '3': '³', '4': '⁴',
    '5': '⁵', '6': '⁶', '7': '⁷', '8': '⁸', '9': '⁹'
  };

  function toSuperscript(num) {
    return String(num).split('').map(ch => SUPERSCRIPTS[ch] || ch).join('');
  }

  // Core Factorization Logic
  function factorize(n) {
    if (n < 1) {
      throw new Error('Please enter a positive integer greater than or equal to 1.');
    }
    if (n > 10000000000000) {
      throw new Error('Number is too large. Please enter an integer up to 10,000,000,000,000.');
    }

    if (n === 1) {
      return {
        number: 1,
        isPrime: false,
        isNeither: true,
        factors: [1],
        primeMap: {},
        canonicalText: '1 (neither prime nor composite)',
        divisors: [1],
        divisorCount: 1,
        divisorSum: 1,
        steps: [{ step: 1, dividend: 1, divisor: 1, quotient: 1 }],
        tree: { value: 1, isPrime: false, isLeaf: true }
      };
    }

    let temp = n;
    const factors = [];
    const steps = [];
    let stepNum = 1;

    // Trial division
    while (temp % 2 === 0) {
      const q = temp / 2;
      factors.push(2);
      steps.push({ step: stepNum++, dividend: temp, divisor: 2, quotient: q });
      temp = q;
    }

    while (temp % 3 === 0) {
      const q = temp / 3;
      factors.push(3);
      steps.push({ step: stepNum++, dividend: temp, divisor: 3, quotient: q });
      temp = q;
    }

    let d = 5;
    while (d * d <= temp) {
      while (temp % d === 0) {
        const q = temp / d;
        factors.push(d);
        steps.push({ step: stepNum++, dividend: temp, divisor: d, quotient: q });
        temp = q;
      }
      const d2 = d + 2;
      while (temp % d2 === 0) {
        const q = temp / d2;
        factors.push(d2);
        steps.push({ step: stepNum++, dividend: temp, divisor: d2, quotient: q });
        temp = q;
      }
      d += 6;
    }

    if (temp > 1) {
      factors.push(temp);
      steps.push({ step: stepNum++, dividend: temp, divisor: temp, quotient: 1 });
    }

    const isPrime = factors.length === 1;

    // Group factors into frequency map
    const primeMap = {};
    factors.forEach(f => {
      primeMap[f] = (primeMap[f] || 0) + 1;
    });

    // Format canonical exponential form
    const canonicalParts = Object.keys(primeMap).sort((a, b) => Number(a) - Number(b)).map(p => {
      const power = primeMap[p];
      return power > 1 ? `${p}${toSuperscript(power)}` : `${p}`;
    });
    const canonicalText = canonicalParts.join(' × ');

    // Generate all positive divisors
    const primes = Object.keys(primeMap).map(Number).sort((a, b) => a - b);
    let divisors = [1];
    primes.forEach(p => {
      const count = primeMap[p];
      const newDivs = [];
      let multiplier = 1;
      for (let i = 0; i <= count; i++) {
        divisors.forEach(dVal => {
          newDivs.push(dVal * multiplier);
        });
        multiplier *= p;
      }
      divisors = newDivs;
    });

    divisors.sort((a, b) => a - b);
    const divisorCount = divisors.length;
    const divisorSum = divisors.reduce((acc, curr) => acc + curr, 0);

    // Build binary factor tree structure
    const tree = buildFactorTree(n, factors);

    return {
      number: n,
      isPrime,
      isNeither: false,
      factors,
      primeMap,
      canonicalText,
      divisors,
      divisorCount,
      divisorSum,
      steps,
      tree
    };
  }

  // Build binary factor tree recursively
  function buildFactorTree(num, primeFactors) {
    if (primeFactors.length <= 1) {
      return { value: num, isPrime: true, isLeaf: true };
    }

    // Split off the first prime factor on left, rest on right
    const leftFactor = primeFactors[0];
    const rightVal = num / leftFactor;
    const remainingPrimes = primeFactors.slice(1);

    return {
      value: num,
      isPrime: false,
      isLeaf: false,
      left: { value: leftFactor, isPrime: true, isLeaf: true },
      right: buildFactorTree(rightVal, remainingPrimes)
    };
  }

  // Render Factor Tree to SVG
  function renderFactorTreeSvg(rootNode) {
    if (!treeSvg) return;
    treeSvg.innerHTML = '';

    if (!rootNode) return;

    // If single prime or 1
    if (rootNode.isLeaf) {
      treeSvg.setAttribute('viewBox', '0 0 200 120');
      treeSvg.setAttribute('height', '120');
      treeSvg.setAttribute('width', '200');

      const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
      const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
      circle.setAttribute('cx', '100');
      circle.setAttribute('cy', '60');
      circle.setAttribute('r', '32');
      circle.setAttribute('fill', rootNode.isPrime ? 'rgba(16, 185, 129, 0.2)' : 'rgba(78, 133, 191, 0.2)');
      circle.setAttribute('stroke', rootNode.isPrime ? '#10b981' : '#4e85bf');
      circle.setAttribute('stroke-width', '2.5');

      const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      text.setAttribute('x', '100');
      text.setAttribute('y', '66');
      text.setAttribute('text-anchor', 'middle');
      text.setAttribute('fill', '#ffffff');
      text.setAttribute('font-size', '16');
      text.setAttribute('font-weight', '700');
      text.textContent = String(rootNode.value);

      g.appendChild(circle);
      g.appendChild(text);
      treeSvg.appendChild(g);
      return;
    }

    // Calculate layout coordinates
    // Tree shape: Left child is leaf, right child continues down-right
    // Let's position nodes with clear depth and x offsets
    let current = rootNode;
    const depthList = [];
    let d = 0;
    while (current && !current.isLeaf) {
      depthList.push(current);
      current = current.right;
      d++;
    }
    const totalSteps = depthList.length;

    const nodeRadius = 24;
    const yStep = 64;
    const xStep = 60;
    const startX = 60 + totalSteps * 30;
    const startY = 40;

    const svgWidth = Math.max(380, startX + totalSteps * xStep + 80);
    const svgHeight = Math.max(260, startY + (totalSteps + 1) * yStep + 50);

    treeSvg.setAttribute('viewBox', `0 0 ${svgWidth} ${svgHeight}`);
    treeSvg.setAttribute('width', `${svgWidth}`);
    treeSvg.setAttribute('height', `${svgHeight}`);

    // Create lines group and nodes group
    const linesGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    const nodesGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    treeSvg.appendChild(linesGroup);
    treeSvg.appendChild(nodesGroup);

    function drawNode(x, y, value, isPrimeLeaf) {
      const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
      const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
      circle.setAttribute('cx', x);
      circle.setAttribute('cy', y);
      circle.setAttribute('r', nodeRadius);

      if (isPrimeLeaf) {
        circle.setAttribute('fill', 'rgba(16, 185, 129, 0.25)');
        circle.setAttribute('stroke', '#10b981');
        circle.setAttribute('stroke-width', '2.5');
      } else {
        circle.setAttribute('fill', 'rgba(78, 133, 191, 0.2)');
        circle.setAttribute('stroke', '#4e85bf');
        circle.setAttribute('stroke-width', '2');
      }

      const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      text.setAttribute('x', x);
      text.setAttribute('y', y + 5);
      text.setAttribute('text-anchor', 'middle');
      text.setAttribute('fill', '#ffffff');
      const valStr = String(value);
      const fontSize = valStr.length > 5 ? 11 : valStr.length > 3 ? 13 : 15;
      text.setAttribute('font-size', `${fontSize}`);
      text.setAttribute('font-weight', '700');
      text.textContent = valStr;

      g.appendChild(circle);
      g.appendChild(text);
      nodesGroup.appendChild(g);
    }

    function drawEdge(x1, y1, x2, y2) {
      const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
      line.setAttribute('x1', x1);
      line.setAttribute('y1', y1);
      line.setAttribute('x2', x2);
      line.setAttribute('y2', y2);
      line.setAttribute('stroke', 'rgba(255, 255, 255, 0.25)');
      line.setAttribute('stroke-width', '2');
      line.setAttribute('stroke-linecap', 'round');
      linesGroup.appendChild(line);
    }

    // Traverse and position nodes
    let currX = startX;
    let currY = startY;

    for (let i = 0; i < depthList.length; i++) {
      const node = depthList[i];
      drawNode(currX, currY, node.value, false);

      const leftX = currX - xStep;
      const leftY = currY + yStep;
      const rightX = currX + xStep;
      const rightY = currY + yStep;

      // Draw edges
      drawEdge(currX, currY, leftX, leftY);
      drawEdge(currX, currY, rightX, rightY);

      // Draw left leaf
      drawNode(leftX, leftY, node.left.value, true);

      // If next is leaf, draw right leaf
      if (node.right.isLeaf) {
        drawNode(rightX, rightY, node.right.value, true);
      }

      currX = rightX;
      currY = rightY;
    }
  }

  // Summary Text Formatter
  function formatSummaryText(calc) {
    const lines = [
      `Prime Factorization of ${calc.number}:`,
      `Status: ${calc.isPrime ? 'Prime Number' : calc.isNeither ? 'Neither Prime nor Composite' : 'Composite Number'}`,
      `Exponential Notation: ${calc.canonicalText}`,
      `Prime Factors: ${calc.factors.join(', ')}`,
      `Unique Prime Factors: ${Object.keys(calc.primeMap).join(', ')}`,
      `Total Divisors: ${calc.divisorCount}`,
      `Sum of Divisors: ${calc.divisorSum.toLocaleString()}`,
      `All Divisors: ${calc.divisors.join(', ')}`
    ];
    return lines.join('\n');
  }

  // Update UI with calculated results
  function updateUI(calc) {
    currentCalculation = calc;
    errorEl.style.display = 'none';

    // Status Badge
    if (calc.isNeither) {
      statusBadge.className = 'prime-badge neutral';
      statusBadge.textContent = 'Neither (1)';
    } else if (calc.isPrime) {
      statusBadge.className = 'prime-badge prime';
      statusBadge.innerHTML = '<span>★</span> Prime Number';
    } else {
      statusBadge.className = 'prime-badge composite';
      statusBadge.textContent = 'Composite Number';
    }

    // Canonical & Metrics
    canonicalEl.textContent = calc.canonicalText;
    factorsListEl.textContent = calc.factors.join(', ');
    uniquePrimesEl.textContent = Object.keys(calc.primeMap).length;
    divisorsCountEl.textContent = calc.divisorCount.toLocaleString();
    divisorsCountLabel.textContent = calc.divisorCount.toLocaleString();
    divisorsSumEl.textContent = calc.divisorSum.toLocaleString();

    // Render Factor Tree
    renderFactorTreeSvg(calc.tree);

    // Populate Steps Table
    stepsTableBody.innerHTML = '';
    calc.steps.forEach(step => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td style="color: var(--text-tertiary); font-weight: 600;">#${step.step}</td>
        <td style="font-family: monospace; font-weight: 600;">${step.dividend.toLocaleString()}</td>
        <td style="font-family: monospace; color: #10b981; font-weight: 700;">÷ ${step.divisor}</td>
        <td style="font-family: monospace; font-weight: 700; color: var(--accent);">${step.quotient.toLocaleString()}</td>
      `;
      stepsTableBody.appendChild(tr);
    });

    // Populate Divisors Grid
    divisorsGridEl.innerHTML = '';
    const maxShow = 500;
    const toRender = calc.divisors.slice(0, maxShow);
    toRender.forEach(div => {
      const span = document.createElement('span');
      span.className = 'divisor-badge';
      span.textContent = div.toLocaleString();
      span.title = `Divisor: ${div}`;
      span.addEventListener('click', () => {
        inputEl.value = div;
        runFactorization();
      });
      divisorsGridEl.appendChild(span);
    });

    if (calc.divisors.length > maxShow) {
      const moreSpan = document.createElement('span');
      moreSpan.className = 'divisor-badge';
      moreSpan.style.background = 'transparent';
      moreSpan.style.border = 'none';
      moreSpan.style.color = 'var(--text-tertiary)';
      moreSpan.textContent = `+ ${calc.divisors.length - maxShow} more...`;
      divisorsGridEl.appendChild(moreSpan);
    }
  }

  function runFactorization() {
    const rawVal = inputEl.value.trim();
    if (!rawVal) {
      errorEl.textContent = 'Please enter a positive integer.';
      errorEl.style.display = 'block';
      return;
    }

    const n = parseInt(rawVal, 10);
    if (isNaN(n) || n < 1 || !Number.isInteger(Number(rawVal))) {
      errorEl.textContent = 'Please enter a valid positive integer (>= 1).';
      errorEl.style.display = 'block';
      return;
    }

    try {
      const result = factorize(n);
      updateUI(result);
    } catch (err) {
      errorEl.textContent = err.message || 'An error occurred during factorization.';
      errorEl.style.display = 'block';
    }
  }

  // Initial calculation with default 360
  runFactorization();
});