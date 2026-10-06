// Percent Error Calculator Logic

document.addEventListener('DOMContentLoaded', () => {
  const expValInput = document.getElementById('exp-val');
  const theoValInput = document.getElementById('theo-val');
  const precisionSelect = document.getElementById('precision-select');
  const btnCalc = document.getElementById('btn-calc');
  const btnReset = document.getElementById('btn-reset');
  const btnCopy = document.getElementById('btn-copy');

  // Outputs
  const resPercentError = document.getElementById('res-percent-error');
  const resDirectionTag = document.getElementById('res-direction-tag');
  const resAbsError = document.getElementById('res-abs-error');
  const resRelError = document.getElementById('res-rel-error');
  const accuracyBadge = document.getElementById('accuracy-badge');
  const badgeText = document.getElementById('badge-text');
  const stepBox = document.getElementById('step-box');

  function parseInput(val) {
    if (val === null || val === undefined) return NaN;
    const str = val.toString().trim().replace(/,/g, '');
    if (str === '') return NaN;
    return Number(str);
  }

  function formatValue(num, precision) {
    if (isNaN(num)) return 'NaN';
    if (!isFinite(num)) return num > 0 ? 'Infinity' : '-Infinity';

    if (precision === 'auto') {
      if (Math.abs(num) !== 0 && (Math.abs(num) < 0.0001 || Math.abs(num) >= 1e7)) {
        return num.toExponential(4);
      }
      return Number(num.toPrecision(7)).toString();
    }

    const dec = parseInt(precision, 10);
    if (Math.abs(num) !== 0 && (Math.abs(num) < 1 / Math.pow(10, dec))) {
      return num.toExponential(dec);
    }

    return num.toLocaleString('en-US', {
      minimumFractionDigits: dec,
      maximumFractionDigits: dec
    });
  }

  function calculatePercentError() {
    const ve = parseInput(expValInput.value);
    const vt = parseInput(theoValInput.value);
    const precision = precisionSelect.value;

    if (isNaN(ve) || isNaN(vt)) {
      resPercentError.textContent = '-';
      resDirectionTag.textContent = 'Please enter valid numerical values.';
      resAbsError.textContent = '-';
      resRelError.textContent = '-';
      accuracyBadge.className = 'accuracy-badge';
      accuracyBadge.style.opacity = '0.5';
      badgeText.textContent = 'Awaiting input';
      stepBox.innerHTML = '<div class="step-item">Enter both Experimental and Theoretical values to generate calculations.</div>';
      return;
    }

    accuracyBadge.style.opacity = '1';

    if (vt === 0) {
      resPercentError.textContent = 'Undefined';
      resDirectionTag.textContent = 'Theoretical value cannot be zero (division by zero).';
      resAbsError.textContent = formatValue(Math.abs(ve), precision);
      resRelError.textContent = 'Undefined';
      accuracyBadge.className = 'accuracy-badge accuracy-high';
      badgeText.textContent = 'Undefined (Vt = 0)';
      stepBox.innerHTML = `
        <div class="step-item">1. Formula: % Error = (|V<sub>e</sub> - V<sub>t</sub>| / |V<sub>t</sub>|) &times; 100%</div>
        <div class="step-item" style="color: var(--error);">2. Error: Theoretical value V<sub>t</sub> = 0 makes the denominator zero. Percent error is mathematically undefined when accepted value is zero.</div>
      `;
      return;
    }

    const signedDiff = ve - vt;
    const absDiff = Math.abs(signedDiff);
    const relError = absDiff / Math.abs(vt);
    const pctError = relError * 100;
    const signedPctError = (signedDiff / Math.abs(vt)) * 100;

    // Display primary metric
    resPercentError.textContent = `${formatValue(pctError, precision)}%`;
    resAbsError.textContent = formatValue(absDiff, precision);
    resRelError.textContent = formatValue(relError, precision);

    // Direction and Accuracy assessment
    if (absDiff === 0) {
      resDirectionTag.textContent = 'Perfect match: Experimental value equals Theoretical value.';
      accuracyBadge.className = 'accuracy-badge accuracy-excellent';
      badgeText.textContent = 'Exact (0% Error)';
    } else if (ve > vt) {
      resDirectionTag.textContent = `Overestimated by +${formatValue(pctError, 2)}% (${formatValue(signedDiff, precision)} units above accepted)`;
    } else {
      resDirectionTag.textContent = `Underestimated by -${formatValue(pctError, 2)}% (${formatValue(Math.abs(signedDiff), precision)} units below accepted)`;
    }

    // Set badge classes
    if (pctError < 1.0) {
      accuracyBadge.className = 'accuracy-badge accuracy-excellent';
      badgeText.textContent = 'Excellent (< 1%)';
    } else if (pctError < 5.0) {
      accuracyBadge.className = 'accuracy-badge accuracy-good';
      badgeText.textContent = 'Good (< 5%)';
    } else if (pctError < 10.0) {
      accuracyBadge.className = 'accuracy-badge accuracy-moderate';
      badgeText.textContent = 'Moderate (< 10%)';
    } else {
      accuracyBadge.className = 'accuracy-badge accuracy-high';
      badgeText.textContent = 'High Error (≥ 10%)';
    }

    // Generate Step-by-Step Derivation
    stepBox.innerHTML = `
      <div class="step-item">1. <strong>Percent Error Formula:</strong><br>
        % Error = (|V<sub>observed</sub> - V<sub>accepted</sub>| / |V<sub>accepted</sub>|) &times; 100%
      </div>
      <div class="step-item">2. <strong>Calculate Absolute Error:</strong><br>
        |${ve} - ${vt}| = |${formatValue(signedDiff, precision)}| = <strong>${formatValue(absDiff, precision)}</strong>
      </div>
      <div class="step-item">3. <strong>Calculate Relative Error:</strong><br>
        ${formatValue(absDiff, precision)} / |${vt}| = <strong>${formatValue(relError, precision)}</strong>
      </div>
      <div class="step-item" style="color: var(--accent); font-weight: 700;">4. <strong>Convert to Percentage:</strong><br>
        ${formatValue(relError, precision)} &times; 100% = <strong>${formatValue(pctError, precision)}%</strong>
        ${signedPctError !== pctError ? `<br><span style="font-size:0.85rem; font-weight:normal; color:var(--text-secondary);">(Signed relative error: ${formatValue(signedPctError, precision)}%)</span>` : ''}
      </div>
    `;
  }

  // Presets
  document.querySelectorAll('.exp-preset').forEach(btn => {
    btn.addEventListener('click', () => {
      expValInput.value = btn.getAttribute('data-exp');
      theoValInput.value = btn.getAttribute('data-theo');
      calculatePercentError();
    });
  });

  // Events
  [expValInput, theoValInput].forEach(inp => {
    inp.addEventListener('input', calculatePercentError);
  });
  precisionSelect.addEventListener('change', calculatePercentError);
  btnCalc.addEventListener('click', calculatePercentError);

  btnReset.addEventListener('click', () => {
    expValInput.value = '';
    theoValInput.value = '';
    calculatePercentError();
    expValInput.focus();
  });

  // Copy report
  btnCopy.addEventListener('click', () => {
    const ve = expValInput.value.trim();
    const vt = theoValInput.value.trim();
    if (!ve || !vt) {
      alert('Please calculate percent error first.');
      return;
    }

    const report = [
      '========================================',
      '   ALL IN ONE - PERCENT ERROR REPORT',
      '========================================',
      `Experimental Value (Ve): ${ve}`,
      `Theoretical Value (Vt):  ${vt}`,
      `Absolute Error:          ${resAbsError.textContent}`,
      `Relative Error:          ${resRelError.textContent}`,
      `Percent Error:           ${resPercentError.textContent}`,
      `Accuracy Level:          ${badgeText.textContent}`,
      `Assessment:              ${resDirectionTag.textContent}`,
      '----------------------------------------',
      'Formula: (|Ve - Vt| / |Vt|) * 100%',
      '========================================'
    ].join('\n');

    navigator.clipboard.writeText(report).then(() => {
      const orig = btnCopy.textContent;
      btnCopy.textContent = 'Copied!';
      setTimeout(() => {
        btnCopy.textContent = orig;
      }, 2000);
    });
  });

  // Run initial calculation
  calculatePercentError();
});