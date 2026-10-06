// Credit Card Validator & Luhn Algorithm Verification

const CARD_BRANDS = [
  {
    name: 'Visa',
    slug: 'visa',
    pattern: /^4/,
    lengths: [13, 16, 19],
    format: [4, 4, 4, 4, 3],
    iin: 'Prefix starts with 4'
  },
  {
    name: 'Mastercard',
    slug: 'mastercard',
    pattern: /^(5[1-5]|2(2(2[1-9]|[3-9]\d)|[3-6]\d\d|7([01]\d|20)))/,
    lengths: [16],
    format: [4, 4, 4, 4],
    iin: 'Prefix 51–55 or 2221–2720'
  },
  {
    name: 'American Express',
    slug: 'amex',
    pattern: /^3[47]/,
    lengths: [15],
    format: [4, 6, 5],
    iin: 'Prefix 34 or 37'
  },
  {
    name: 'Discover',
    slug: 'discover',
    pattern: /^(6011|65|64[4-9]|622(1(2[6-9]|[3-9]\d)|[2-8]\d\d|9([01]\d|2[0-5])))/,
    lengths: [16, 19],
    format: [4, 4, 4, 4, 3],
    iin: 'Prefix 6011, 622126-622925, 644-649, 65'
  },
  {
    name: 'JCB',
    slug: 'jcb',
    pattern: /^35(2[89]|[3-8]\d)/,
    lengths: [16, 17, 18, 19],
    format: [4, 4, 4, 4, 3],
    iin: 'Prefix 3528–3589'
  },
  {
    name: 'Diners Club',
    slug: 'diners',
    pattern: /^(30[0-5]|36|38|39)/,
    lengths: [14, 16],
    format: [4, 6, 4, 2],
    iin: 'Prefix 300–305, 36, 38, or 39'
  }
];

// Identify brand based on raw numeric string
function detectCardBrand(digits) {
  for (const brand of CARD_BRANDS) {
    if (brand.pattern.test(digits)) {
      return brand;
    }
  }
  return null;
}

// Format card digits with grouping spaces
function formatCardNumber(digits, brand) {
  if (!digits) return '';
  const grouping = (brand && brand.format) ? brand.format : [4, 4, 4, 4, 4];
  
  const parts = [];
  let startIndex = 0;
  for (const groupLen of grouping) {
    if (startIndex >= digits.length) break;
    parts.push(digits.substring(startIndex, startIndex + groupLen));
    startIndex += groupLen;
  }
  // If there are leftover digits beyond format
  if (startIndex < digits.length) {
    parts.push(digits.substring(startIndex));
  }
  return parts.join(' ');
}

// Luhn Algorithm calculation and step breakdown
function calculateLuhn(digits) {
  if (!digits || digits.length < 2) {
    return {
      isValid: false,
      sum: 0,
      checkDigit: digits.length === 1 ? parseInt(digits[0], 10) : null,
      steps: []
    };
  }

  const steps = [];
  let sum = 0;
  let isDoubled = false;

  for (let i = digits.length - 1; i >= 0; i--) {
    const originalDigit = parseInt(digits.charAt(i), 10);
    const posFromRight = digits.length - i;
    const multiplier = isDoubled ? 2 : 1;
    let product = originalDigit * multiplier;
    let adjusted = product;

    if (product > 9) {
      adjusted = product - 9;
    }

    sum += adjusted;

    steps.push({
      posFromRight,
      index: i,
      digit: originalDigit,
      multiplier,
      product,
      adjusted,
      currentSum: sum
    });

    isDoubled = !isDoubled;
  }

  const checkDigit = parseInt(digits.charAt(digits.length - 1), 10);

  return {
    isValid: sum % 10 === 0,
    sum,
    checkDigit,
    steps
  };
}

document.addEventListener('DOMContentLoaded', () => {
  const ccInput = document.getElementById('cc-input');
  const holderInput = document.getElementById('holder-input');
  const expiryInput = document.getElementById('expiry-input');
  const clearBtn = document.getElementById('clear-btn');
  const validateBtn = document.getElementById('validate-btn');
  const copyCardBtn = document.getElementById('copy-card-btn');
  const sampleChips = document.querySelectorAll('.sample-chip');

  // UI elements
  const cardMockup = document.getElementById('card-mockup');
  const cardBrandBadge = document.getElementById('card-brand-badge');
  const brandText = document.getElementById('brand-text');
  const cardNumberDisplay = document.getElementById('card-number-display');
  const cardHolderDisplay = document.getElementById('card-holder-display');
  const cardExpiryDisplay = document.getElementById('card-expiry-display');
  const cardValidityPill = document.getElementById('card-validity-pill');

  const statusBadge = document.getElementById('status-badge');
  const detBrand = document.getElementById('det-brand');
  const detLength = document.getElementById('det-length');
  const detPrefix = document.getElementById('det-prefix');
  const detLuhn = document.getElementById('det-luhn');
  const detSum = document.getElementById('det-sum');
  const luhnFormula = document.getElementById('luhn-formula');
  const luhnTableBody = document.getElementById('luhn-table-body');

  function updateValidator() {
    const rawVal = ccInput.value;
    const cleanDigits = rawVal.replace(/\D/g, '');
    const brand = detectCardBrand(cleanDigits);

    // Format input field without jumping cursor inappropriately
    const formatted = formatCardNumber(cleanDigits, brand);
    if (ccInput.value !== formatted) {
      ccInput.value = formatted;
    }

    // 1. Update Mockup Card Brand Theme
    cardMockup.className = 'card-mockup';
    if (brand) {
      cardMockup.classList.add(`brand-${brand.slug}`);
      brandText.textContent = brand.name;
    } else {
      brandText.textContent = cleanDigits.length > 0 ? 'UNKNOWN BRAND' : 'CARD';
    }

    // 2. Update Mockup Number
    if (cleanDigits.length === 0) {
      cardNumberDisplay.textContent = '•••• •••• •••• ••••';
    } else {
      const displayFormatted = formatCardNumber(cleanDigits, brand);
      cardNumberDisplay.textContent = displayFormatted;
    }

    // 3. Update Holder & Expiry Mockup
    cardHolderDisplay.textContent = (holderInput && holderInput.value.trim()) 
      ? holderInput.value.trim().toUpperCase() 
      : 'YOUR NAME';

    cardExpiryDisplay.textContent = (expiryInput && expiryInput.value.trim()) 
      ? expiryInput.value.trim() 
      : 'MM/YY';

    // 4. Perform Luhn Check
    const luhn = calculateLuhn(cleanDigits);
    const hasEnoughDigits = cleanDigits.length >= 12;
    const isBrandLengthValid = brand ? brand.lengths.includes(cleanDigits.length) : (cleanDigits.length >= 13 && cleanDigits.length <= 19);

    // 5. Update Status Pill & Badges
    if (cleanDigits.length === 0) {
      cardValidityPill.className = 'card-validity-pill';
      cardValidityPill.textContent = 'AWAITING INPUT';

      statusBadge.className = 'status-badge-lg pending';
      statusBadge.innerHTML = `
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="12" cy="12" r="10"></circle>
          <line x1="12" y1="8" x2="12" y2="12"></line>
          <line x1="12" y1="16" x2="12.01" y2="16"></line>
        </svg>
        <span>Enter card number to validate</span>
      `;

      detBrand.textContent = 'None';
      detLength.textContent = '0 digits';
      detPrefix.textContent = 'Awaiting digits';
      detLuhn.textContent = '-';
      detSum.textContent = 'Sum: 0 | Check Digit: -';
      luhnFormula.textContent = '';
      luhnTableBody.innerHTML = '<tr><td colspan="5" style="color: var(--text-tertiary);">Enter a card number to view step-by-step math.</td></tr>';
      return;
    }

    // If we have digits:
    detBrand.innerHTML = brand ? `<strong>${brand.name}</strong>` : '<span style="color: var(--warning);">Unknown / Unrecognized</span>';
    
    // Length feedback
    if (brand) {
      const lengthOk = brand.lengths.includes(cleanDigits.length);
      const expectedStr = brand.lengths.join(' or ');
      detLength.innerHTML = `${cleanDigits.length} digits ` + (lengthOk 
        ? `<span style="color: var(--success); font-weight:700;">(Expected: ${expectedStr}) ✓</span>` 
        : `<span style="color: var(--warning);">(Expected: ${expectedStr})</span>`);
    } else {
      detLength.textContent = `${cleanDigits.length} digits`;
    }

    // IIN prefix feedback
    detPrefix.textContent = brand ? brand.iin : 'No matching IIN profile found';

    // Luhn feedback
    if (cleanDigits.length < 8) {
      cardValidityPill.className = 'card-validity-pill';
      cardValidityPill.textContent = 'INCOMPLETE';

      statusBadge.className = 'status-badge-lg pending';
      statusBadge.innerHTML = `<span>Incomplete Number (${cleanDigits.length} digits)</span>`;
      detLuhn.innerHTML = '<span style="color: var(--text-secondary);">Needs more digits</span>';
    } else if (luhn.isValid && (!brand || isBrandLengthValid)) {
      cardValidityPill.className = 'card-validity-pill valid';
      cardValidityPill.textContent = 'VALID CHECKSUM';

      statusBadge.className = 'status-badge-lg valid';
      statusBadge.innerHTML = `
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
          <polyline points="20 6 9 17 4 12"></polyline>
        </svg>
        <span>Valid Card Checksum (Passed Luhn Check)</span>
      `;

      detLuhn.innerHTML = '<span style="color: var(--success); font-weight: 700;">PASSED (Valid Checksum)</span>';
    } else if (luhn.isValid && brand && !isBrandLengthValid) {
      cardValidityPill.className = 'card-validity-pill';
      cardValidityPill.style.color = 'var(--warning)';
      cardValidityPill.textContent = 'LENGTH MISMATCH';

      statusBadge.className = 'status-badge-lg pending';
      statusBadge.innerHTML = `<span>Luhn Passed, but incorrect length for ${brand.name}</span>`;
      detLuhn.innerHTML = '<span style="color: var(--warning); font-weight: 700;">PASSED LUHN (Length Incomplete)</span>';
    } else {
      cardValidityPill.className = 'card-validity-pill invalid';
      cardValidityPill.textContent = 'INVALID CHECKSUM';

      statusBadge.className = 'status-badge-lg invalid';
      statusBadge.innerHTML = `
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
          <line x1="18" y1="6" x2="6" y2="18"></line>
          <line x1="6" y1="6" x2="18" y2="18"></line>
        </svg>
        <span>Invalid Checksum (Failed Luhn MOD 10 Check)</span>
      `;

      detLuhn.innerHTML = '<span style="color: var(--error); font-weight: 700;">FAILED (Invalid Number)</span>';
    }

    detSum.textContent = `Sum: ${luhn.sum} | Check Digit: ${luhn.checkDigit ?? '-'}`;
    
    // Formula badge
    luhnFormula.textContent = `Sum: ${luhn.sum} mod 10 = ${luhn.sum % 10} (${luhn.isValid ? 'Valid' : 'Invalid'})`;

    // Render Luhn Step-by-Step Table
    if (luhn.steps.length > 0) {
      let rowsHtml = '';
      luhn.steps.forEach(st => {
        const isAdjusted = st.product > 9;
        rowsHtml += `
          <tr>
            <td>#${st.posFromRight}</td>
            <td style="font-weight:600;">${st.digit}</td>
            <td>×${st.multiplier}</td>
            <td>${st.product}</td>
            <td class="highlight-cell">${st.adjusted}${isAdjusted ? ` <span style="font-size:0.7rem; color:var(--text-tertiary);">(${st.product}-9)</span>` : ''}</td>
          </tr>
        `;
      });
      luhnTableBody.innerHTML = rowsHtml;
    } else {
      luhnTableBody.innerHTML = '<tr><td colspan="5" style="color: var(--text-tertiary);">Enter more digits to view calculation.</td></tr>';
    }
  }

  // Events
  ccInput.addEventListener('input', updateValidator);

  if (holderInput) {
    holderInput.addEventListener('input', () => {
      cardHolderDisplay.textContent = holderInput.value.trim() 
        ? holderInput.value.trim().toUpperCase() 
        : 'YOUR NAME';
    });
  }

  if (expiryInput) {
    expiryInput.addEventListener('input', (e) => {
      let val = e.target.value.replace(/\D/g, '');
      if (val.length >= 2) {
        val = val.substring(0, 2) + '/' + val.substring(2, 4);
      }
      e.target.value = val;
      cardExpiryDisplay.textContent = val || 'MM/YY';
    });
  }

  if (clearBtn) {
    clearBtn.addEventListener('click', () => {
      ccInput.value = '';
      if (holderInput) holderInput.value = '';
      if (expiryInput) expiryInput.value = '';
      updateValidator();
      ccInput.focus();
    });
  }

  if (validateBtn) {
    validateBtn.addEventListener('click', updateValidator);
  }

  // Sample Chips
  sampleChips.forEach(chip => {
    chip.addEventListener('click', () => {
      const sampleNum = chip.dataset.sample;
      ccInput.value = sampleNum;
      updateValidator();
    });
  });

  // Copy card button
  if (copyCardBtn) {
    copyCardBtn.addEventListener('click', async () => {
      const cleanDigits = ccInput.value.replace(/\D/g, '');
      if (!cleanDigits) return;
      try {
        await navigator.clipboard.writeText(cleanDigits);
        const originalText = copyCardBtn.textContent;
        copyCardBtn.textContent = 'Copied!';
        copyCardBtn.classList.add('copied');
        setTimeout(() => {
          copyCardBtn.textContent = originalText;
          copyCardBtn.classList.remove('copied');
        }, 1800);
      } catch (err) {
        console.error('Clipboard copy failed', err);
      }
    });
  }

  // Initial check
  updateValidator();
});