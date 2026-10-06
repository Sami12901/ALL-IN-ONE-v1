// Quadratic Equation Solver Logic

function formatNumber(num, maxDecimals = 4) {
  if (Number.isInteger(num)) return num.toString();
  const rounded = Number(num.toFixed(maxDecimals));
  return rounded.toString();
}

function formatSign(num) {
  return num >= 0 ? `+ ${formatNumber(num)}` : `- ${formatNumber(Math.abs(num))}`;
}

function formatEquationString(a, b, c) {
  let partA = '';
  if (a === 1) partA = 'x²';
  else if (a === -1) partA = '-x²';
  else partA = `${formatNumber(a)}x²`;

  let partB = '';
  if (b > 0) partB = ` + ${b === 1 ? '' : formatNumber(b)}x`;
  else if (b < 0) partB = ` - ${b === -1 ? '' : formatNumber(Math.abs(b))}x`;

  let partC = '';
  if (c > 0) partC = ` + ${formatNumber(c)}`;
  else if (c < 0) partC = ` - ${formatNumber(Math.abs(c))}`;
  else if (!partA && !partB) partC = '0';

  return `${partA}${partB}${partC} = 0`;
}

// Copy Helper
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
    const original = btnElement.innerHTML;
    btnElement.innerHTML = `✓ Copied!`;
    setTimeout(() => {
      btnElement.innerHTML = original;
    }, 2000);
  }
}

document.addEventListener('DOMContentLoaded', () => {
  const inputA = document.getElementById('coeff-a');
  const inputB = document.getElementById('coeff-b');
  const inputC = document.getElementById('coeff-c');

  const solveBtn = document.getElementById('solve-btn');
  const resetBtn = document.getElementById('reset-btn');
  const copyRootsBtn = document.getElementById('copy-roots-btn');
  const resetZoomBtn = document.getElementById('reset-zoom-btn');
  const errorEl = document.getElementById('solver-error');

  const eqBannerText = document.getElementById('equation-banner-text');
  const eqSubtext = document.getElementById('equation-subtext');

  const root1ValEl = document.getElementById('root-1-val');
  const root1SubEl = document.getElementById('root-1-sub');
  const root2ValEl = document.getElementById('root-2-val');
  const root2SubEl = document.getElementById('root-2-sub');
  const discValEl = document.getElementById('disc-val');
  const discNatureEl = document.getElementById('disc-nature');
  const vertexValEl = document.getElementById('vertex-val');
  const vertexTypeEl = document.getElementById('vertex-type');
  const axisValEl = document.getElementById('axis-val');
  const yIntValEl = document.getElementById('y-int-val');

  const stepsEl = document.getElementById('derivation-steps');

  // Canvas
  const canvas = document.getElementById('parabola-canvas');
  const canvasContainer = document.getElementById('canvas-container');
  const tooltip = document.getElementById('graph-tooltip');
  const ctx = canvas.getContext('2d');

  let currentSolution = null;

  // Preset Buttons
  document.querySelectorAll('.preset-chip').forEach(chip => {
    chip.addEventListener('click', () => {
      inputA.value = chip.getAttribute('data-a');
      inputB.value = chip.getAttribute('data-b');
      inputC.value = chip.getAttribute('data-c');
      solveQuadratic();
    });
  });

  function solveQuadratic() {
    errorEl.style.display = 'none';
    errorEl.textContent = '';

    const a = parseFloat(inputA.value);
    const b = parseFloat(inputB.value);
    const c = parseFloat(inputC.value);

    if (isNaN(a) || isNaN(b) || isNaN(c)) {
      errorEl.textContent = 'Please enter valid numerical values for all coefficients a, b, and c.';
      errorEl.style.display = 'block';
      return;
    }

    if (a === 0) {
      if (b === 0) {
        errorEl.textContent = c === 0 ? 'Infinite solutions (0 = 0).' : `No solution (${c} = 0 is impossible).`;
      } else {
        const linearRoot = -c / b;
        errorEl.innerHTML = `<strong>Linear Equation Note:</strong> Since a = 0, this is a linear equation: ${formatNumber(b)}x + ${formatNumber(c)} = 0. Solution: <strong>x = ${formatNumber(linearRoot)}</strong>.`;
      }
      errorEl.style.display = 'block';
      return;
    }

    // Discriminant Δ = b² - 4ac
    const disc = b * b - 4 * a * c;
    const h = -b / (2 * a);
    const k = c - (b * b) / (4 * a);

    // Format equation banner
    eqBannerText.textContent = formatEquationString(a, b, c);
    const opensUp = a > 0;
    eqSubtext.textContent = opensUp
      ? `Parabola opens upwards (a > 0) with minimum vertex at (${formatNumber(h)}, ${formatNumber(k)})`
      : `Parabola opens downwards (a < 0) with maximum vertex at (${formatNumber(h)}, ${formatNumber(k)})`;

    let root1 = null;
    let root2 = null;
    let rootType = '';

    if (disc > 0) {
      const sqrtD = Math.sqrt(disc);
      const r1 = (-b + sqrtD) / (2 * a);
      const r2 = (-b - sqrtD) / (2 * a);
      root1 = { val: r1, str: formatNumber(r1), isComplex: false };
      root2 = { val: r2, str: formatNumber(r2), isComplex: false };
      rootType = 'real_distinct';

      root1ValEl.textContent = root1.str;
      root1SubEl.textContent = 'Real Distinct Root';
      root2ValEl.textContent = root2.str;
      root2SubEl.textContent = 'Real Distinct Root';
      discNatureEl.textContent = 'Δ > 0 (Two distinct real roots)';
    } else if (disc === 0) {
      const r = -b / (2 * a);
      root1 = { val: r, str: formatNumber(r), isComplex: false };
      root2 = { val: r, str: formatNumber(r), isComplex: false };
      rootType = 'real_equal';

      root1ValEl.textContent = root1.str;
      root1SubEl.textContent = 'Repeated Double Root';
      root2ValEl.textContent = root2.str;
      root2SubEl.textContent = 'Repeated Double Root';
      discNatureEl.textContent = 'Δ = 0 (One repeated real root)';
    } else {
      const realPart = -b / (2 * a);
      const imagPart = Math.sqrt(-disc) / (2 * Math.abs(a));
      const str1 = `${formatNumber(realPart)} + ${formatNumber(imagPart)}i`;
      const str2 = `${formatNumber(realPart)} - ${formatNumber(imagPart)}i`;

      root1 = { val: null, str: str1, isComplex: true, real: realPart, imag: imagPart };
      root2 = { val: null, str: str2, isComplex: true, real: realPart, imag: -imagPart };
      rootType = 'complex';

      root1ValEl.textContent = str1;
      root1SubEl.textContent = 'Complex Root (No real x-intercept)';
      root2ValEl.textContent = str2;
      root2SubEl.textContent = 'Complex Conjugate';
      discNatureEl.textContent = 'Δ < 0 (Two complex conjugate roots)';
    }

    discValEl.textContent = formatNumber(disc);
    vertexValEl.textContent = `(${formatNumber(h)}, ${formatNumber(k)})`;
    vertexTypeEl.textContent = opensUp ? 'Absolute Minimum' : 'Absolute Maximum';
    axisValEl.textContent = `x = ${formatNumber(h)}`;
    yIntValEl.textContent = `(0, ${formatNumber(c)})`;

    currentSolution = { a, b, c, disc, h, k, root1, root2, rootType, opensUp };

    // Render Steps
    renderDerivationSteps(currentSolution);

    // Render Canvas
    drawParabolaGraph(currentSolution);
  }

  function renderDerivationSteps(sol) {
    const { a, b, c, disc, h, k, root1, root2, rootType, opensUp } = sol;

    const bSq = b * b;
    const fourAc = 4 * a * c;
    const twoA = 2 * a;

    let stepsHtml = `
      <div class="step-card">
        <div class="step-badge">1. Identify Coefficients</div>
        <div class="step-math">a = ${formatNumber(a)}, &nbsp; b = ${formatNumber(b)}, &nbsp; c = ${formatNumber(c)}</div>
      </div>

      <div class="step-card">
        <div class="step-badge">2. Calculate Discriminant (Δ)</div>
        <div style="font-size: 0.85rem; color: var(--text-secondary); margin-bottom: 0.35rem;">
          Formula: Δ = b² - 4ac
        </div>
        <div class="step-math">
          Δ = (${formatNumber(b)})² - 4(${formatNumber(a)})(${formatNumber(c)})<br>
          Δ = ${formatNumber(bSq)} - (${formatNumber(fourAc)}) = <strong>${formatNumber(disc)}</strong>
        </div>
      </div>

      <div class="step-card">
        <div class="step-badge">3. Apply Quadratic Formula</div>
        <div style="font-size: 0.85rem; color: var(--text-secondary); margin-bottom: 0.35rem;">
          Formula: x = (-b ± √Δ) / 2a
        </div>
        <div class="step-math">
          x = (-(${formatNumber(b)}) ± √${formatNumber(disc)}) / 2(${formatNumber(a)})<br>
          x = (${formatNumber(-b)} ± √${formatNumber(disc)}) / ${formatNumber(twoA)}
        </div>
      </div>
    `;

    if (rootType === 'real_distinct') {
      const sqrtD = Math.sqrt(disc);
      stepsHtml += `
        <div class="step-card">
          <div class="step-badge">4. Compute Individual Roots</div>
          <div class="step-math">
            x₁ = (${formatNumber(-b)} + ${formatNumber(sqrtD)}) / ${formatNumber(twoA)} = <strong>${root1.str}</strong><br>
            x₂ = (${formatNumber(-b)} - ${formatNumber(sqrtD)}) / ${formatNumber(twoA)} = <strong>${root2.str}</strong>
          </div>
        </div>
      `;
    } else if (rootType === 'real_equal') {
      stepsHtml += `
        <div class="step-card">
          <div class="step-badge">4. Compute Single Repeated Root</div>
          <div class="step-math">
            Since √0 = 0:<br>
            x = ${formatNumber(-b)} / ${formatNumber(twoA)} = <strong>${root1.str}</strong>
          </div>
        </div>
      `;
    } else {
      const sqrtNegD = Math.sqrt(-disc);
      stepsHtml += `
        <div class="step-card">
          <div class="step-badge">4. Express in Complex Form (i = √-1)</div>
          <div class="step-math">
            √${formatNumber(disc)} = √(-1 × ${formatNumber(-disc)}) = ${formatNumber(sqrtNegD)}i<br>
            x = (${formatNumber(-b)} ± ${formatNumber(sqrtNegD)}i) / ${formatNumber(twoA)}<br>
            x₁ = <strong>${root1.str}</strong><br>
            x₂ = <strong>${root2.str}</strong>
          </div>
        </div>
      `;
    }

    // Vertex Form
    const hSign = h >= 0 ? `- ${formatNumber(h)}` : `+ ${formatNumber(Math.abs(h))}`;
    const kSign = k >= 0 ? `+ ${formatNumber(k)}` : `- ${formatNumber(Math.abs(k))}`;
    const vertexForm = `${a === 1 ? '' : a === -1 ? '-' : formatNumber(a)}(x ${hSign})² ${kSign}`;

    stepsHtml += `
      <div class="step-card">
        <div class="step-badge">5. Vertex & Standard Vertex Form</div>
        <div style="font-size: 0.85rem; color: var(--text-secondary); margin-bottom: 0.35rem;">
          Vertex (h, k) = (-b/2a, c - b²/4a):
        </div>
        <div class="step-math">
          Vertex = (<strong>${formatNumber(h)}</strong>, <strong>${formatNumber(k)}</strong>)<br>
          Vertex Form: y = <strong>${vertexForm}</strong>
        </div>
      </div>
    `;

    stepsEl.innerHTML = stepsHtml;
  }

  // Canvas Plotting
  function drawParabolaGraph(sol) {
    if (!sol) return;
    const { a, b, c, h, k, root1, root2, rootType } = sol;

    const rect = canvasContainer.getBoundingClientRect();
    const width = rect.width || 560;
    const height = 380;

    const dpr = window.devicePixelRatio || 1;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    ctx.resetTransform?.();
    ctx.scale(dpr, dpr);

    // Calculate domain & range to view nicely
    let xMin, xMax, yMin, yMax;

    if (rootType !== 'complex' && root1 && root2) {
      const rx1 = Math.min(root1.val, root2.val);
      const rx2 = Math.max(root1.val, root2.val);
      const spanX = Math.max(rx2 - rx1, 2);
      xMin = Math.min(rx1 - spanX * 0.6, h - 3);
      xMax = Math.max(rx2 + spanX * 0.6, h + 3);
    } else {
      xMin = h - 6;
      xMax = h + 6;
    }

    // Ensure 0 is visible
    xMin = Math.min(xMin, -2);
    xMax = Math.max(xMax, 2);

    // Compute sample Y values to find vertical range
    const yAtH = k;
    const yAtMin = a * xMin * xMin + b * xMin + c;
    const yAtMax = a * xMax * xMax + b * xMax + c;
    const allY = [yAtH, yAtMin, yAtMax, c, 0];
    yMin = Math.min(...allY);
    yMax = Math.max(...allY);

    const padY = Math.max((yMax - yMin) * 0.15, 2);
    yMin -= padY;
    yMax += padY;

    // Coordinate mapping functions
    function toCanvasX(x) {
      return ((x - xMin) / (xMax - xMin)) * width;
    }
    function toCanvasY(y) {
      return height - ((y - yMin) / (yMax - yMin)) * height;
    }
    function fromCanvasX(cx) {
      return xMin + (cx / width) * (xMax - xMin);
    }

    // Store for mouse interaction
    sol.canvasBounds = { xMin, xMax, yMin, yMax, width, height, toCanvasX, toCanvasY, fromCanvasX };

    // Background
    ctx.fillStyle = '#090d14';
    ctx.fillRect(0, 0, width, height);

    // Grid lines
    ctx.lineWidth = 1;
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.06)';

    // Step calculation
    const calcStep = range => {
      const rough = range / 8;
      const mag = Math.pow(10, Math.floor(Math.log10(rough)));
      const rel = rough / mag;
      if (rel < 2) return mag;
      if (rel < 5) return 2 * mag;
      return 5 * mag;
    };

    const xStep = calcStep(xMax - xMin);
    const yStep = calcStep(yMax - yMin);

    // Draw vertical grid lines
    ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
    ctx.font = '10px monospace';
    ctx.textAlign = 'center';

    const startX = Math.floor(xMin / xStep) * xStep;
    for (let x = startX; x <= xMax; x += xStep) {
      const cx = toCanvasX(x);
      ctx.beginPath();
      ctx.moveTo(cx, 0);
      ctx.lineTo(cx, height);
      ctx.stroke();
      if (Math.abs(x) > 0.0001) {
        ctx.fillText(formatNumber(x, 2), cx, height - 6);
      }
    }

    // Draw horizontal grid lines
    ctx.textAlign = 'left';
    const startY = Math.floor(yMin / yStep) * yStep;
    for (let y = startY; y <= yMax; y += yStep) {
      const cy = toCanvasY(y);
      ctx.beginPath();
      ctx.moveTo(0, cy);
      ctx.lineTo(width, cy);
      ctx.stroke();
      if (Math.abs(y) > 0.0001) {
        ctx.fillText(formatNumber(y, 2), 6, cy - 3);
      }
    }

    // Major Axes (x = 0, y = 0)
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.25)';
    ctx.lineWidth = 1.5;

    // Y-Axis (x = 0)
    if (xMin <= 0 && xMax >= 0) {
      const zeroX = toCanvasX(0);
      ctx.beginPath();
      ctx.moveTo(zeroX, 0);
      ctx.lineTo(zeroX, height);
      ctx.stroke();
    }

    // X-Axis (y = 0)
    if (yMin <= 0 && yMax >= 0) {
      const zeroY = toCanvasY(0);
      ctx.beginPath();
      ctx.moveTo(0, zeroY);
      ctx.lineTo(width, zeroY);
      ctx.stroke();
    }

    // Axis of Symmetry line (dashed)
    ctx.save();
    ctx.setLineDash([4, 4]);
    ctx.strokeStyle = 'rgba(245, 158, 11, 0.5)';
    ctx.lineWidth = 1.5;
    const axisCx = toCanvasX(h);
    ctx.beginPath();
    ctx.moveTo(axisCx, 0);
    ctx.lineTo(axisCx, height);
    ctx.stroke();
    ctx.restore();

    // Plot Parabola curve
    ctx.strokeStyle = '#4e85bf';
    ctx.lineWidth = 2.5;
    ctx.beginPath();

    const stepPx = 2;
    let started = false;
    for (let px = 0; px <= width; px += stepPx) {
      const x = fromCanvasX(px);
      const y = a * x * x + b * x + c;
      const py = toCanvasY(y);

      if (!started) {
        ctx.moveTo(px, py);
        started = true;
      } else {
        ctx.lineTo(px, py);
      }
    }
    ctx.stroke();

    // Key Points
    // 1. Vertex (Amber)
    const vCx = toCanvasX(h);
    const vCy = toCanvasY(k);
    drawMarker(vCx, vCy, '#f59e0b', `Vertex (${formatNumber(h)}, ${formatNumber(k)})`);

    // 2. Y-Intercept (Red)
    const yIntCx = toCanvasX(0);
    const yIntCy = toCanvasY(c);
    drawMarker(yIntCx, yIntCy, '#ef4444', `Y-Int (0, ${formatNumber(c)})`);

    // 3. Roots / X-Intercepts (Emerald)
    if (rootType !== 'complex') {
      if (root1 && root1.val !== null) {
        const r1Cx = toCanvasX(root1.val);
        const r1Cy = toCanvasY(0);
        drawMarker(r1Cx, r1Cy, '#10b981', `x₁ = ${root1.str}`);
      }
      if (root2 && root2.val !== null && rootType === 'real_distinct') {
        const r2Cx = toCanvasX(root2.val);
        const r2Cy = toCanvasY(0);
        drawMarker(r2Cx, r2Cy, '#10b981', `x₂ = ${root2.str}`);
      }
    }
  }

  function drawMarker(cx, cy, color, label) {
    if (isNaN(cx) || isNaN(cy)) return;
    ctx.save();
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(cx, cy, 5, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    ctx.fillStyle = color;
    ctx.font = 'bold 10px monospace';
    ctx.fillText(label, cx + 8, cy - 6);
    ctx.restore();
  }

  // Interactive Hover on Canvas
  canvas.addEventListener('mousemove', e => {
    if (!currentSolution || !currentSolution.canvasBounds) return;
    const { fromCanvasX, toCanvasX, toCanvasY, width, height } = currentSolution.canvasBounds;
    const { a, b, c } = currentSolution;

    const rect = canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    if (mouseX < 0 || mouseX > width || mouseY < 0 || mouseY > height) {
      tooltip.style.display = 'none';
      return;
    }

    const xVal = fromCanvasX(mouseX);
    const yVal = a * xVal * xVal + b * xVal + c;

    // Show tooltip
    tooltip.style.display = 'block';
    tooltip.innerHTML = `x: ${formatNumber(xVal, 2)}<br>y: ${formatNumber(yVal, 2)}`;

    // Position tooltip safely
    const tipX = Math.min(mouseX + 12, rect.width - 100);
    const tipY = Math.max(mouseY - 45, 10);
    tooltip.style.left = `${tipX}px`;
    tooltip.style.top = `${tipY}px`;
  });

  canvas.addEventListener('mouseleave', () => {
    tooltip.style.display = 'none';
  });

  // Window resize handler
  window.addEventListener('resize', () => {
    if (currentSolution) {
      drawParabolaGraph(currentSolution);
    }
  });

  // Action Buttons
  solveBtn.addEventListener('click', solveQuadratic);

  [inputA, inputB, inputC].forEach(inp => {
    inp.addEventListener('input', () => {
      solveQuadratic();
    });
    inp.addEventListener('keydown', e => {
      if (e.key === 'Enter') solveQuadratic();
    });
  });

  resetBtn.addEventListener('click', () => {
    inputA.value = '1';
    inputB.value = '-5';
    inputC.value = '6';
    solveQuadratic();
  });

  resetZoomBtn.addEventListener('click', () => {
    if (currentSolution) {
      drawParabolaGraph(currentSolution);
    }
  });

  copyRootsBtn.addEventListener('click', () => {
    if (!currentSolution) return;
    const { a, b, c, disc, root1, root2, h, k } = currentSolution;
    const text = `Quadratic Equation Solution:
Equation: ${formatEquationString(a, b, c)}
Discriminant (Δ): ${formatNumber(disc)}
Root 1 (x₁): ${root1.str}
Root 2 (x₂): ${root2.str}
Vertex: (${formatNumber(h)}, ${formatNumber(k)})
Axis of Symmetry: x = ${formatNumber(h)}
Generated via ALL IN ONE Quadratic Equation Solver`;

    copyToClipboard(text, copyRootsBtn);
  });

  // Initial Run
  solveQuadratic();
});