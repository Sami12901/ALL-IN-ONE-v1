// Matrix Calculator Studio Logic

function cleanNumber(num, maxDecimals = 4) {
  if (Math.abs(num) < 1e-12) return 0;
  if (Number.isInteger(num)) return num;
  return Number(num.toFixed(maxDecimals));
}

function formatMatrixLatex(matrix) {
  const rows = matrix.map(row => row.map(v => cleanNumber(v)).join(' & '));
  return `\\begin{pmatrix}\n${rows.join(' \\\\\n')}\n\\end{pmatrix}`;
}

function formatMatrixPlain(matrix) {
  return matrix.map(row => row.map(v => cleanNumber(v)).join('\t')).join('\n');
}

// 2x2 Matrix Inversion
function invert2x2(m) {
  const det = m[0][0] * m[1][1] - m[0][1] * m[1][0];
  if (Math.abs(det) < 1e-10) return null;
  const inv = [
    [m[1][1] / det, -m[0][1] / det],
    [-m[1][0] / det, m[0][0] / det]
  ];
  return { inv, det };
}

// 3x3 Determinant & Inversion
function det3x3(m) {
  return (
    m[0][0] * (m[1][1] * m[2][2] - m[1][2] * m[2][1]) -
    m[0][1] * (m[1][0] * m[2][2] - m[1][2] * m[2][0]) +
    m[0][2] * (m[1][0] * m[2][1] - m[1][1] * m[2][0])
  );
}

function invert3x3(m) {
  const det = det3x3(m);
  if (Math.abs(det) < 1e-10) return null;

  // Cofactor matrix
  const c = [
    [
      (m[1][1] * m[2][2] - m[1][2] * m[2][1]),
      -(m[1][0] * m[2][2] - m[1][2] * m[2][0]),
      (m[1][0] * m[2][1] - m[1][1] * m[2][0])
    ],
    [
      -(m[0][1] * m[2][2] - m[0][2] * m[2][1]),
      (m[0][0] * m[2][2] - m[0][2] * m[2][0]),
      -(m[0][0] * m[2][1] - m[0][1] * m[2][0])
    ],
    [
      (m[0][1] * m[1][2] - m[0][2] * m[1][1]),
      -(m[0][0] * m[1][2] - m[0][2] * m[1][0]),
      (m[0][0] * m[1][1] - m[0][1] * m[1][0])
    ]
  ];

  // Adjugate is transpose of cofactors
  const adj = [
    [c[0][0], c[1][0], c[2][0]],
    [c[0][1], c[1][1], c[2][1]],
    [c[0][2], c[1][2], c[2][2]]
  ];

  const inv = adj.map(row => row.map(v => v / det));
  return { inv, det, cofactors: c, adjugate: adj };
}

// Clipboard Helper
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
  let currentDim = 2; // 2 or 3
  let currentOp = 'add'; // 'add', 'sub', 'mul', 'det-a', etc.

  // Elements
  const dim2Btn = document.getElementById('dim-2-btn');
  const dim3Btn = document.getElementById('dim-3-btn');
  const gridA = document.getElementById('grid-a');
  const gridB = document.getElementById('grid-b');
  const gridResult = document.getElementById('grid-result');
  const resultBracketBox = document.getElementById('result-bracket-box');
  const resultScalarBox = document.getElementById('result-scalar-box');
  const scalarLabel = document.getElementById('scalar-label');
  const scalarVal = document.getElementById('scalar-val');
  const scalarKInput = document.getElementById('scalar-k');
  const resultOpTitle = document.getElementById('result-operation-title');
  const matrixError = document.getElementById('matrix-error');
  const stepsContainer = document.getElementById('matrix-steps-container');

  const detABadge = document.getElementById('mat-a-det-badge');
  const detBBadge = document.getElementById('mat-b-det-badge');

  const swapBtn = document.getElementById('swap-matrices-btn');
  const copyResultBtn = document.getElementById('copy-result-btn');
  const copyLatexBtn = document.getElementById('copy-latex-btn');
  const sendToABtn = document.getElementById('send-to-a-btn');

  // Matrix internal state
  let matrixA = [
    [1, 2],
    [3, 4]
  ];
  let matrixB = [
    [5, 6],
    [7, 8]
  ];
  let latestResultMatrix = null;

  // Initialize Grids
  function renderGrids() {
    gridA.className = `matrix-grid dim-${currentDim}`;
    gridB.className = `matrix-grid dim-${currentDim}`;
    gridResult.className = `matrix-grid dim-${currentDim}`;

    gridA.innerHTML = '';
    gridB.innerHTML = '';

    for (let r = 0; r < currentDim; r++) {
      for (let c = 0; c < currentDim; c++) {
        const inputA = document.createElement('input');
        inputA.type = 'number';
        inputA.step = 'any';
        inputA.className = 'matrix-cell';
        inputA.value = matrixA[r] && matrixA[r][c] !== undefined ? matrixA[r][c] : (r === c ? 1 : 0);
        inputA.dataset.row = r;
        inputA.dataset.col = c;
        inputA.dataset.matrix = 'A';
        gridA.appendChild(inputA);

        const inputB = document.createElement('input');
        inputB.type = 'number';
        inputB.step = 'any';
        inputB.className = 'matrix-cell';
        inputB.value = matrixB[r] && matrixB[r][c] !== undefined ? matrixB[r][c] : (r === c ? 1 : 0);
        inputB.dataset.row = r;
        inputB.dataset.col = c;
        inputB.dataset.matrix = 'B';
        gridB.appendChild(inputB);
      }
    }

    bindCellListeners();
    recalculate();
  }

  function readMatrix(matrixLetter) {
    const grid = matrixLetter === 'A' ? gridA : gridB;
    const inputs = grid.querySelectorAll('input');
    const mat = [];
    for (let r = 0; r < currentDim; r++) {
      mat[r] = [];
      for (let c = 0; c < currentDim; c++) {
        const idx = r * currentDim + c;
        const val = parseFloat(inputs[idx]?.value);
        mat[r][c] = isNaN(val) ? 0 : val;
      }
    }
    return mat;
  }

  function setMatrixValues(matrixLetter, mat) {
    const grid = matrixLetter === 'A' ? gridA : gridB;
    const inputs = grid.querySelectorAll('input');
    for (let r = 0; r < currentDim; r++) {
      for (let c = 0; c < currentDim; c++) {
        const idx = r * currentDim + c;
        if (inputs[idx] && mat[r] && mat[r][c] !== undefined) {
          inputs[idx].value = cleanNumber(mat[r][c]);
        }
      }
    }
    if (matrixLetter === 'A') matrixA = mat;
    else matrixB = mat;
    recalculate();
  }

  function bindCellListeners() {
    [gridA, gridB].forEach(grid => {
      grid.querySelectorAll('input').forEach(inp => {
        inp.addEventListener('input', () => {
          recalculate();
        });
        inp.addEventListener('keydown', e => {
          if (e.key === 'Enter') recalculate();
        });
      });
    });
  }

  // Dimension Change
  dim2Btn.addEventListener('click', () => {
    if (currentDim === 2) return;
    currentDim = 2;
    dim2Btn.classList.add('active');
    dim3Btn.classList.remove('active');
    matrixA = [
      [matrixA[0]?.[0] || 1, matrixA[0]?.[1] || 2],
      [matrixA[1]?.[0] || 3, matrixA[1]?.[1] || 4]
    ];
    matrixB = [
      [matrixB[0]?.[0] || 5, matrixB[0]?.[1] || 6],
      [matrixB[1]?.[0] || 7, matrixB[1]?.[1] || 8]
    ];
    renderGrids();
  });

  dim3Btn.addEventListener('click', () => {
    if (currentDim === 3) return;
    currentDim = 3;
    dim3Btn.classList.add('active');
    dim2Btn.classList.remove('active');
    matrixA = [
      [matrixA[0]?.[0] || 1, matrixA[0]?.[1] || 2, 0],
      [matrixA[1]?.[0] || 3, matrixA[1]?.[1] || 4, 0],
      [0, 0, 1]
    ];
    matrixB = [
      [matrixB[0]?.[0] || 5, matrixB[0]?.[1] || 6, 0],
      [matrixB[1]?.[0] || 7, matrixB[1]?.[1] || 8, 0],
      [0, 0, 1]
    ];
    renderGrids();
  });

  // Operations click handler
  document.querySelectorAll('.op-action-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.op-action-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentOp = btn.getAttribute('data-op');
      recalculate();
    });
  });

  scalarKInput.addEventListener('input', () => {
    if (currentOp === 'scalar-a') recalculate();
  });

  // Quick Action Buttons
  function setupMatrixQuickActions(prefix, matGetter, matSetter) {
    document.getElementById(`${prefix}-action-identity`).addEventListener('click', () => {
      const mat = [];
      for (let r = 0; r < currentDim; r++) {
        mat[r] = [];
        for (let c = 0; c < currentDim; c++) {
          mat[r][c] = r === c ? 1 : 0;
        }
      }
      matSetter(prefix.toUpperCase(), mat);
    });

    document.getElementById(`${prefix}-action-zero`).addEventListener('click', () => {
      const mat = [];
      for (let r = 0; r < currentDim; r++) {
        mat[r] = [];
        for (let c = 0; c < currentDim; c++) {
          mat[r][c] = 0;
        }
      }
      matSetter(prefix.toUpperCase(), mat);
    });

    document.getElementById(`${prefix}-action-random`).addEventListener('click', () => {
      const mat = [];
      for (let r = 0; r < currentDim; r++) {
        mat[r] = [];
        for (let c = 0; c < currentDim; c++) {
          mat[r][c] = Math.floor(Math.random() * 19) - 9;
        }
      }
      matSetter(prefix.toUpperCase(), mat);
    });

    document.getElementById(`${prefix}-action-transpose`).addEventListener('click', () => {
      const current = matGetter(prefix.toUpperCase());
      const mat = [];
      for (let r = 0; r < currentDim; r++) {
        mat[r] = [];
        for (let c = 0; c < currentDim; c++) {
          mat[r][c] = current[c][r];
        }
      }
      matSetter(prefix.toUpperCase(), mat);
    });

    document.getElementById(`${prefix}-action-negate`).addEventListener('click', () => {
      const current = matGetter(prefix.toUpperCase());
      const mat = current.map(row => row.map(v => -v));
      matSetter(prefix.toUpperCase(), mat);
    });
  }

  setupMatrixQuickActions('a', readMatrix, setMatrixValues);
  setupMatrixQuickActions('b', readMatrix, setMatrixValues);

  // Swap Matrices
  swapBtn.addEventListener('click', () => {
    const curA = readMatrix('A');
    const curB = readMatrix('B');
    setMatrixValues('A', curB);
    setMatrixValues('B', curA);
  });

  // Presets
  document.getElementById('preset-standard').addEventListener('click', () => {
    if (currentDim === 2) {
      setMatrixValues('A', [[1, 2], [3, 4]]);
      setMatrixValues('B', [[2, 0], [1, 2]]);
    } else {
      setMatrixValues('A', [[1, 2, 3], [0, 1, 4], [5, 6, 0]]);
      setMatrixValues('B', [[2, -1, 0], [0, 3, 1], [1, 0, 2]]);
    }
  });

  document.getElementById('preset-symmetric').addEventListener('click', () => {
    if (currentDim === 2) {
      setMatrixValues('A', [[2, 3], [3, 5]]);
      setMatrixValues('B', [[4, 1], [1, 3]]);
    } else {
      setMatrixValues('A', [[1, 7, 3], [7, 4, -5], [3, -5, 6]]);
      setMatrixValues('B', [[3, 0, 2], [0, 5, -1], [2, -1, 4]]);
    }
  });

  document.getElementById('preset-singular').addEventListener('click', () => {
    if (currentDim === 2) {
      setMatrixValues('A', [[2, 4], [1, 2]]); // det = 0
      setMatrixValues('B', [[3, 6], [2, 4]]);
    } else {
      setMatrixValues('A', [[1, 2, 3], [2, 4, 6], [1, 1, 1]]); // linearly dependent rows
      setMatrixValues('B', [[1, 0, 1], [0, 1, 0], [1, 1, 1]]);
    }
  });

  document.getElementById('preset-identity').addEventListener('click', () => {
    const idMat = [];
    for (let r = 0; r < currentDim; r++) {
      idMat[r] = [];
      for (let c = 0; c < currentDim; c++) {
        idMat[r][c] = r === c ? 1 : 0;
      }
    }
    setMatrixValues('A', idMat);
    setMatrixValues('B', idMat);
  });

  // Calculate Determinants for badges
  function computeDeterminant(mat) {
    if (currentDim === 2) {
      return mat[0][0] * mat[1][1] - mat[0][1] * mat[1][0];
    } else {
      return det3x3(mat);
    }
  }

  // Recalculate everything
  function recalculate() {
    matrixError.style.display = 'none';
    matrixError.textContent = '';

    const A = readMatrix('A');
    const B = readMatrix('B');

    const detA = computeDeterminant(A);
    const detB = computeDeterminant(B);

    detABadge.textContent = `det(A) = ${cleanNumber(detA)}`;
    detBBadge.textContent = `det(B) = ${cleanNumber(detB)}`;

    let isScalarResult = false;
    let scalarOutputVal = 0;
    let resultMatrix = null;
    let title = '';
    const steps = [];

    switch (currentOp) {
      case 'add': {
        title = 'Result of Matrix Addition (A + B)';
        resultMatrix = [];
        const additions = [];
        for (let r = 0; r < currentDim; r++) {
          resultMatrix[r] = [];
          for (let c = 0; c < currentDim; c++) {
            const sum = A[r][c] + B[r][c];
            resultMatrix[r][c] = sum;
            additions.push(`c<sub>${r+1}${c+1}</sub> = a<sub>${r+1}${c+1}</sub> + b<sub>${r+1}${c+1}</sub> = ${cleanNumber(A[r][c])} + ${cleanNumber(B[r][c])} = <strong>${cleanNumber(sum)}</strong>`);
          }
        }
        steps.push({
          title: 'Cell-by-cell Addition Formula: C[i, j] = A[i, j] + B[i, j]',
          math: additions.join('<br>')
        });
        break;
      }

      case 'sub': {
        title = 'Result of Matrix Subtraction (A − B)';
        resultMatrix = [];
        const subtractions = [];
        for (let r = 0; r < currentDim; r++) {
          resultMatrix[r] = [];
          for (let c = 0; c < currentDim; c++) {
            const diff = A[r][c] - B[r][c];
            resultMatrix[r][c] = diff;
            subtractions.push(`c<sub>${r+1}${c+1}</sub> = ${cleanNumber(A[r][c])} − ${cleanNumber(B[r][c])} = <strong>${cleanNumber(diff)}</strong>`);
          }
        }
        steps.push({
          title: 'Cell-by-cell Subtraction Formula: C[i, j] = A[i, j] − B[i, j]',
          math: subtractions.join('<br>')
        });
        break;
      }

      case 'sub-ba': {
        title = 'Result of Matrix Subtraction (B − A)';
        resultMatrix = [];
        const subtractions = [];
        for (let r = 0; r < currentDim; r++) {
          resultMatrix[r] = [];
          for (let c = 0; c < currentDim; c++) {
            const diff = B[r][c] - A[r][c];
            resultMatrix[r][c] = diff;
            subtractions.push(`c<sub>${r+1}${c+1}</sub> = ${cleanNumber(B[r][c])} − ${cleanNumber(A[r][c])} = <strong>${cleanNumber(diff)}</strong>`);
          }
        }
        steps.push({
          title: 'Cell-by-cell Subtraction Formula: C[i, j] = B[i, j] − A[i, j]',
          math: subtractions.join('<br>')
        });
        break;
      }

      case 'mul': {
        title = 'Result of Matrix Multiplication (A × B)';
        resultMatrix = multiplyMatricesWithSteps(A, B, 'A', 'B', steps);
        break;
      }

      case 'mul-ba': {
        title = 'Result of Matrix Multiplication (B × A)';
        resultMatrix = multiplyMatricesWithSteps(B, A, 'B', 'A', steps);
        break;
      }

      case 'sq-a': {
        title = 'Result of Matrix Squaring (A² = A × A)';
        resultMatrix = multiplyMatricesWithSteps(A, A, 'A', 'A', steps);
        break;
      }

      case 'det-a': {
        title = 'Determinant of Matrix A: det(A)';
        isScalarResult = true;
        scalarOutputVal = detA;
        explainDeterminant(A, 'A', detA, steps);
        break;
      }

      case 'det-b': {
        title = 'Determinant of Matrix B: det(B)';
        isScalarResult = true;
        scalarOutputVal = detB;
        explainDeterminant(B, 'B', detB, steps);
        break;
      }

      case 'inv-a': {
        title = 'Inverse of Matrix A (A⁻¹)';
        if (Math.abs(detA) < 1e-10) {
          matrixError.textContent = 'Matrix A is singular (non-invertible) because det(A) = 0. An inverse matrix does not exist.';
          matrixError.style.display = 'block';
          steps.push({
            title: 'Invertibility Check: det(A)',
            math: `det(A) = ${cleanNumber(detA)} = 0. Since the determinant is 0, Matrix A is singular and cannot be inverted.`
          });
        } else {
          resultMatrix = explainInversion(A, 'A', detA, steps);
        }
        break;
      }

      case 'inv-b': {
        title = 'Inverse of Matrix B (B⁻¹)';
        if (Math.abs(detB) < 1e-10) {
          matrixError.textContent = 'Matrix B is singular (non-invertible) because det(B) = 0. An inverse matrix does not exist.';
          matrixError.style.display = 'block';
          steps.push({
            title: 'Invertibility Check: det(B)',
            math: `det(B) = ${cleanNumber(detB)} = 0. Since the determinant is 0, Matrix B is singular and cannot be inverted.`
          });
        } else {
          resultMatrix = explainInversion(B, 'B', detB, steps);
        }
        break;
      }

      case 'trans-a': {
        title = 'Transpose of Matrix A (Aᵀ)';
        resultMatrix = [];
        for (let r = 0; r < currentDim; r++) {
          resultMatrix[r] = [];
          for (let c = 0; c < currentDim; c++) {
            resultMatrix[r][c] = A[c][r];
          }
        }
        steps.push({
          title: 'Transpose Operation: Swap rows and columns (Aᵀ[i, j] = A[j, i])',
          math: `Row 1 becomes Column 1, Row 2 becomes Column 2${currentDim === 3 ? ', Row 3 becomes Column 3' : ''}.`
        });
        break;
      }

      case 'trans-b': {
        title = 'Transpose of Matrix B (Bᵀ)';
        resultMatrix = [];
        for (let r = 0; r < currentDim; r++) {
          resultMatrix[r] = [];
          for (let c = 0; c < currentDim; c++) {
            resultMatrix[r][c] = B[c][r];
          }
        }
        steps.push({
          title: 'Transpose Operation: Swap rows and columns (Bᵀ[i, j] = B[j, i])',
          math: `Row 1 becomes Column 1, Row 2 becomes Column 2${currentDim === 3 ? ', Row 3 becomes Column 3' : ''}.`
        });
        break;
      }

      case 'trace-a': {
        title = 'Trace of Matrix A: tr(A)';
        isScalarResult = true;
        let tr = 0;
        const diagTerms = [];
        for (let i = 0; i < currentDim; i++) {
          tr += A[i][i];
          diagTerms.push(`a<sub>${i+1}${i+1}</sub> = ${cleanNumber(A[i][i])}`);
        }
        scalarOutputVal = tr;
        steps.push({
          title: 'Trace Definition: Sum of main diagonal elements',
          math: `tr(A) = ${diagTerms.join(' + ')} = <strong>${cleanNumber(tr)}</strong>`
        });
        break;
      }

      case 'scalar-a': {
        const k = parseFloat(scalarKInput.value) || 0;
        title = `Scalar Multiplication: ${cleanNumber(k)} × Matrix A`;
        resultMatrix = [];
        const mults = [];
        for (let r = 0; r < currentDim; r++) {
          resultMatrix[r] = [];
          for (let c = 0; c < currentDim; c++) {
            const product = k * A[r][c];
            resultMatrix[r][c] = product;
            mults.push(`c<sub>${r+1}${c+1}</sub> = ${cleanNumber(k)} × ${cleanNumber(A[r][c])} = <strong>${cleanNumber(product)}</strong>`);
          }
        }
        steps.push({
          title: `Multiply each element by scalar k = ${cleanNumber(k)}`,
          math: mults.join('<br>')
        });
        break;
      }
    }

    resultOpTitle.textContent = title;

    // Render results
    if (isScalarResult) {
      resultBracketBox.style.display = 'none';
      resultScalarBox.style.display = 'block';
      scalarLabel.textContent = title;
      scalarVal.textContent = cleanNumber(scalarOutputVal);
      latestResultMatrix = null;
    } else {
      resultBracketBox.style.display = 'inline-flex';
      resultScalarBox.style.display = 'none';
      renderResultMatrix(resultMatrix);
      latestResultMatrix = resultMatrix;
    }

    // Render Steps
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

  function multiplyMatricesWithSteps(m1, m2, name1, name2, steps) {
    const res = [];
    const stepLines = [];

    for (let r = 0; r < currentDim; r++) {
      res[r] = [];
      for (let c = 0; c < currentDim; c++) {
        let sum = 0;
        const products = [];
        for (let k = 0; k < currentDim; k++) {
          const p = m1[r][k] * m2[k][c];
          sum += p;
          products.push(`(${cleanNumber(m1[r][k])} × ${cleanNumber(m2[k][c])})`);
        }
        res[r][c] = sum;
        stepLines.push(`c<sub>${r+1}${c+1}</sub> = [Row ${r+1} of ${name1}] • [Col ${c+1} of ${name2}] = ${products.join(' + ')} = <strong>${cleanNumber(sum)}</strong>`);
      }
    }

    steps.push({
      title: `Matrix Multiplication Dot Products (${name1} × ${name2})`,
      math: stepLines.join('<br>')
    });

    return res;
  }

  function explainDeterminant(m, name, det, steps) {
    if (currentDim === 2) {
      steps.push({
        title: `2×2 Determinant Formula: det(${name}) = a₁₁·a₂₂ − a₁₂·a₂₁`,
        math: `
          det(${name}) = (${cleanNumber(m[0][0])})(${cleanNumber(m[1][1])}) − (${cleanNumber(m[0][1])})(${cleanNumber(m[1][0])})<br>
          = ${cleanNumber(m[0][0] * m[1][1])} − ${cleanNumber(m[0][1] * m[1][0])} = <strong>${cleanNumber(det)}</strong>
        `
      });
    } else {
      const term1 = m[0][0] * (m[1][1] * m[2][2] - m[1][2] * m[2][1]);
      const term2 = m[0][1] * (m[1][0] * m[2][2] - m[1][2] * m[2][0]);
      const term3 = m[0][2] * (m[1][0] * m[2][1] - m[1][1] * m[2][0]);

      steps.push({
        title: `3×3 Determinant Expansion Along Row 1:`,
        math: `
          det(${name}) = a₁₁·M₁₁ − a₁₂·M₁₂ + a₁₃·M₁₃<br>
          = ${cleanNumber(m[0][0])} × [(${cleanNumber(m[1][1])})(${cleanNumber(m[2][2])}) − (${cleanNumber(m[1][2])})(${cleanNumber(m[2][1])})]<br>
          &nbsp;&nbsp;− ${cleanNumber(m[0][1])} × [(${cleanNumber(m[1][0])})(${cleanNumber(m[2][2])}) − (${cleanNumber(m[1][2])})(${cleanNumber(m[2][0])})]<br>
          &nbsp;&nbsp;+ ${cleanNumber(m[0][2])} × [(${cleanNumber(m[1][0])})(${cleanNumber(m[2][1])}) − (${cleanNumber(m[1][1])})(${cleanNumber(m[2][0])})]<br><br>
          = ${cleanNumber(term1)} − (${cleanNumber(term2)}) + ${cleanNumber(term3)} = <strong>${cleanNumber(det)}</strong>
        `
      });
    }
  }

  function explainInversion(m, name, det, steps) {
    if (currentDim === 2) {
      const { inv } = invert2x2(m);
      steps.push({
        title: `1. Determinant Check: det(${name}) = ${cleanNumber(det)} ≠ 0`,
        math: `Since determinant is non-zero, ${name} is invertible.`
      });
      steps.push({
        title: `2. Adjugate Matrix: Swap main diagonal, negate off-diagonal`,
        math: `
          adj(${name}) = [ [${cleanNumber(m[1][1])}, ${cleanNumber(-m[0][1])}], [${cleanNumber(-m[1][0])}, ${cleanNumber(m[0][0])}] ]
        `
      });
      steps.push({
        title: `3. Invert Matrix: (${name})⁻¹ = (1 / det(${name})) × adj(${name})`,
        math: `
          (${name})⁻¹ = (1 / ${cleanNumber(det)}) × adj(${name})<br>
          = [ [${cleanNumber(inv[0][0])}, ${cleanNumber(inv[0][1])}], [${cleanNumber(inv[1][0])}, ${cleanNumber(inv[1][1])}] ]
        `
      });
      return inv;
    } else {
      const { inv, cofactors, adjugate } = invert3x3(m);
      steps.push({
        title: `1. Invertibility Check: det(${name}) = ${cleanNumber(det)} ≠ 0`,
        math: `Determinant is non-zero; therefore the inverse matrix exists.`
      });
      steps.push({
        title: `2. Matrix of Cofactors C`,
        math: `
          C = [ [${cleanNumber(cofactors[0][0])}, ${cleanNumber(cofactors[0][1])}, ${cleanNumber(cofactors[0][2])}],
                [${cleanNumber(cofactors[1][0])}, ${cleanNumber(cofactors[1][1])}, ${cleanNumber(cofactors[1][2])}],
                [${cleanNumber(cofactors[2][0])}, ${cleanNumber(cofactors[2][1])}, ${cleanNumber(cofactors[2][2])}] ]
        `
      });
      steps.push({
        title: `3. Adjugate Matrix: adj(${name}) = Cᵀ (Transpose of Cofactors)`,
        math: `
          adj(${name}) = [ [${cleanNumber(adjugate[0][0])}, ${cleanNumber(adjugate[0][1])}, ${cleanNumber(adjugate[0][2])}],
                     [${cleanNumber(adjugate[1][0])}, ${cleanNumber(adjugate[1][1])}, ${cleanNumber(adjugate[1][2])}],
                     [${cleanNumber(adjugate[2][0])}, ${cleanNumber(adjugate[2][1])}, ${cleanNumber(adjugate[2][2])}] ]
        `
      });
      steps.push({
        title: `4. Multiply by (1 / det(${name})): (${name})⁻¹ = (1 / ${cleanNumber(det)}) × adj(${name})`,
        math: `
          (${name})⁻¹ = [ [${cleanNumber(inv[0][0])}, ${cleanNumber(inv[0][1])}, ${cleanNumber(inv[0][2])}],
                    [${cleanNumber(inv[1][0])}, ${cleanNumber(inv[1][1])}, ${cleanNumber(inv[1][2])}],
                    [${cleanNumber(inv[2][0])}, ${cleanNumber(inv[2][1])}, ${cleanNumber(inv[2][2])}] ]
        `
      });
      return inv;
    }
  }

  function renderResultMatrix(resMat) {
    gridResult.innerHTML = '';
    if (!resMat) return;

    for (let r = 0; r < currentDim; r++) {
      for (let c = 0; c < currentDim; c++) {
        const cell = document.createElement('div');
        cell.className = 'result-cell-box';
        cell.textContent = cleanNumber(resMat[r][c]);
        gridResult.appendChild(cell);
      }
    }
  }

  // Action Buttons
  copyResultBtn.addEventListener('click', () => {
    if (!latestResultMatrix) return;
    const text = formatMatrixPlain(latestResultMatrix);
    copyToClipboard(text, copyResultBtn);
  });

  copyLatexBtn.addEventListener('click', () => {
    if (!latestResultMatrix) return;
    const text = formatMatrixLatex(latestResultMatrix);
    copyToClipboard(text, copyLatexBtn);
  });

  sendToABtn.addEventListener('click', () => {
    if (!latestResultMatrix) return;
    setMatrixValues('A', latestResultMatrix);
  });

  // Initial Grid Initialization
  renderGrids();
});