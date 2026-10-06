// Binary Calculator & Multi-Base Converter Engine
// Full two-way live base conversion, interactive bit toggling, and bitwise operations.

document.addEventListener('DOMContentLoaded', () => {
  // Converter State
  let bitWidth = 8;
  let isSigned = false;
  let currentValue = 42; // Unsigned representation
  let isUpdating = false;

  // Converter DOM Elements
  const inputBin = document.getElementById('input-bin');
  const inputDec = document.getElementById('input-dec');
  const inputHex = document.getElementById('input-hex');
  const inputOct = document.getElementById('input-oct');
  const bitGrid = document.getElementById('bit-grid');

  const widthBtns = document.querySelectorAll('[data-width]');
  const btnUnsigned = document.getElementById('btn-unsigned');
  const btnSigned = document.getElementById('btn-signed');

  const btnSetAll = document.getElementById('bit-btn-setall');
  const btnClearAll = document.getElementById('bit-btn-clearall');
  const btnInvert = document.getElementById('bit-btn-invert');
  const btnRandom = document.getElementById('bit-btn-random');

  // Bitwise Calculator DOM Elements
  const calcOpA = document.getElementById('calc-op-a');
  const calcOpB = document.getElementById('calc-op-b');
  const opBContainer = document.getElementById('operand-b-container');
  const opBtns = document.querySelectorAll('.op-btn');
  let currentOp = 'AND';

  const calcResultDec = document.getElementById('calc-result-dec');
  const calcResultOpName = document.getElementById('calc-result-op-name');
  const traceOpA = document.getElementById('trace-op-a');
  const traceOpB = document.getElementById('trace-op-b');
  const traceRowB = document.getElementById('trace-row-b');
  const traceResBin = document.getElementById('trace-res-bin');
  const traceResHex = document.getElementById('trace-res-hex');
  const traceResOct = document.getElementById('trace-res-oct');

  const sendToConverterBtn = document.getElementById('send-to-converter-btn');
  const copyResultBtn = document.getElementById('copy-result-btn');
  const pullFromConverterABtn = document.getElementById('pull-from-converter-a');
  const pullFromConverterBBtn = document.getElementById('pull-from-converter-b');

  // Mask helper for current bit width
  function getMask() {
    if (bitWidth === 32) return 0xFFFFFFFF >>> 0;
    return (Math.pow(2, bitWidth) - 1) >>> 0;
  }

  // To signed integer helper
  function toSigned(val) {
    val = val & getMask();
    if (bitWidth === 8) {
      return (val & 0x80) ? val - 0x100 : val;
    }
    if (bitWidth === 16) {
      return (val & 0x8000) ? val - 0x10000 : val;
    }
    // 32-bit
    return (val | 0);
  }

  // Format binary with optional nibble spacing
  function formatBinary(val, spaced = false) {
    const raw = (val >>> 0).toString(2);
    const padded = raw.padStart(bitWidth, '0').slice(-bitWidth);
    if (!spaced) return padded;
    return padded.match(/.{1,4}/g)?.join(' ') || padded;
  }

  // Format Hex
  function formatHex(val) {
    const hexChars = Math.ceil(bitWidth / 4);
    const raw = (val >>> 0).toString(16).toUpperCase();
    return raw.padStart(hexChars, '0').slice(-hexChars);
  }

  // Format Octal
  function formatOct(val) {
    return (val >>> 0).toString(8);
  }

  // Render Bit Grid
  function renderBitGrid() {
    if (!bitGrid) return;
    bitGrid.innerHTML = '';

    const binStr = formatBinary(currentValue, false);
    const totalNibbles = bitWidth / 4;

    for (let nib = 0; nib < totalNibbles; nib++) {
      const groupDiv = document.createElement('div');
      groupDiv.className = 'nibble-group';

      for (let bitInNib = 0; bitInNib < 4; bitInNib++) {
        const charIdx = nib * 4 + bitInNib;
        const bitIdx = (bitWidth - 1) - charIdx;
        const bitVal = binStr[charIdx];

        const cell = document.createElement('div');
        cell.className = 'bit-cell';

        const box = document.createElement('div');
        box.className = 'bit-box' + (bitVal === '1' ? ' active' : '');
        box.textContent = bitVal;

        const label = document.createElement('div');
        label.className = 'bit-idx';
        label.textContent = String(bitIdx);

        cell.appendChild(box);
        cell.appendChild(label);

        cell.addEventListener('click', () => {
          toggleBit(bitIdx);
        });

        groupDiv.appendChild(cell);
      }

      bitGrid.appendChild(groupDiv);
    }
  }

  function toggleBit(bitIdx) {
    if (bitIdx >= 31) {
      currentValue = (currentValue ^ (1 << 31)) >>> 0;
    } else {
      currentValue = (currentValue ^ (1 << bitIdx)) >>> 0;
    }
    currentValue = currentValue & getMask();
    syncFromValue();
  }

  // Sync inputs from currentValue
  function syncFromValue() {
    if (isUpdating) return;
    isUpdating = true;

    currentValue = (currentValue & getMask()) >>> 0;

    inputBin.value = formatBinary(currentValue, false);
    inputHex.value = formatHex(currentValue);
    inputOct.value = formatOct(currentValue);

    if (isSigned) {
      inputDec.value = String(toSigned(currentValue));
    } else {
      inputDec.value = String(currentValue);
    }

    renderBitGrid();
    isUpdating = false;
  }

  // Event handlers for converter inputs
  inputBin.addEventListener('input', () => {
    if (isUpdating) return;
    isUpdating = true;
    const clean = inputBin.value.replace(/[^01]/g, '').slice(-bitWidth);
    inputBin.value = clean;
    currentValue = clean ? (parseInt(clean, 2) >>> 0) & getMask() : 0;
    inputHex.value = formatHex(currentValue);
    inputOct.value = formatOct(currentValue);
    inputDec.value = isSigned ? String(toSigned(currentValue)) : String(currentValue);
    renderBitGrid();
    isUpdating = false;
  });

  inputDec.addEventListener('input', () => {
    if (isUpdating) return;
    isUpdating = true;
    const raw = inputDec.value.trim();
    if (raw === '' || raw === '-') {
      currentValue = 0;
    } else {
      const num = parseInt(raw, 10);
      if (!isNaN(num)) {
        if (num < 0) {
          // Two's complement for negative numbers
          const mask = getMask();
          currentValue = (num + (mask + 1)) & mask;
        } else {
          currentValue = (num >>> 0) & getMask();
        }
      }
    }
    inputBin.value = formatBinary(currentValue, false);
    inputHex.value = formatHex(currentValue);
    inputOct.value = formatOct(currentValue);
    renderBitGrid();
    isUpdating = false;
  });

  inputHex.addEventListener('input', () => {
    if (isUpdating) return;
    isUpdating = true;
    const clean = inputHex.value.replace(/[^0-9a-fA-F]/g, '');
    inputHex.value = clean.toUpperCase();
    currentValue = clean ? (parseInt(clean, 16) >>> 0) & getMask() : 0;
    inputBin.value = formatBinary(currentValue, false);
    inputOct.value = formatOct(currentValue);
    inputDec.value = isSigned ? String(toSigned(currentValue)) : String(currentValue);
    renderBitGrid();
    isUpdating = false;
  });

  inputOct.addEventListener('input', () => {
    if (isUpdating) return;
    isUpdating = true;
    const clean = inputOct.value.replace(/[^0-7]/g, '');
    inputOct.value = clean;
    currentValue = clean ? (parseInt(clean, 8) >>> 0) & getMask() : 0;
    inputBin.value = formatBinary(currentValue, false);
    inputHex.value = formatHex(currentValue);
    inputDec.value = isSigned ? String(toSigned(currentValue)) : String(currentValue);
    renderBitGrid();
    isUpdating = false;
  });

  // Bit Width selector
  widthBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      widthBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      bitWidth = parseInt(btn.getAttribute('data-width'), 10);
      syncFromValue();
      runBitwiseCalc();
    });
  });

  // Signed/Unsigned toggle
  btnUnsigned.addEventListener('click', () => {
    btnUnsigned.classList.add('active');
    btnSigned.classList.remove('active');
    isSigned = false;
    syncFromValue();
  });

  btnSigned.addEventListener('click', () => {
    btnSigned.classList.add('active');
    btnUnsigned.classList.remove('active');
    isSigned = true;
    syncFromValue();
  });

  // Quick Bit Grid Actions
  btnSetAll.addEventListener('click', () => {
    currentValue = getMask();
    syncFromValue();
  });

  btnClearAll.addEventListener('click', () => {
    currentValue = 0;
    syncFromValue();
  });

  btnInvert.addEventListener('click', () => {
    currentValue = ((~currentValue) & getMask()) >>> 0;
    syncFromValue();
  });

  btnRandom.addEventListener('click', () => {
    const mask = getMask();
    currentValue = Math.floor(Math.random() * (mask + 1)) >>> 0;
    syncFromValue();
  });

  // ==========================================
  // Bitwise Logic Calculator Engine
  // ==========================================
  function parseOperand(str) {
    if (!str) return 0;
    str = str.trim();
    if (str.startsWith('0b') || str.startsWith('0B')) {
      return (parseInt(str.slice(2).replace(/[^01]/g, ''), 2) || 0) >>> 0;
    }
    if (str.startsWith('0x') || str.startsWith('0X')) {
      return (parseInt(str.slice(2).replace(/[^0-9a-fA-F]/g, ''), 16) || 0) >>> 0;
    }
    if (str.startsWith('0o') || str.startsWith('0O')) {
      return (parseInt(str.slice(2).replace(/[^0-7]/g, ''), 8) || 0) >>> 0;
    }
    const num = parseInt(str, 10);
    if (isNaN(num)) return 0;
    if (num < 0) {
      const mask = getMask();
      return (num + (mask + 1)) & mask;
    }
    return (num >>> 0) & getMask();
  }

  function runBitwiseCalc() {
    const mask = getMask();
    const a = parseOperand(calcOpA.value) & mask;
    const b = parseOperand(calcOpB.value) & mask;
    let res = 0;

    switch (currentOp) {
      case 'AND':
        res = (a & b) & mask;
        break;
      case 'OR':
        res = (a | b) & mask;
        break;
      case 'XOR':
        res = (a ^ b) & mask;
        break;
      case 'NOT':
        res = ((~a) & mask) >>> 0;
        break;
      case 'SHL':
        res = ((a << (b & (bitWidth - 1))) & mask) >>> 0;
        break;
      case 'SHR':
        res = ((a >>> (b & (bitWidth - 1))) & mask) >>> 0;
        break;
      case 'ADD':
        res = ((a + b) & mask) >>> 0;
        break;
      case 'SUB':
        res = ((a - b + (mask + 1)) & mask) >>> 0;
        break;
    }

    res = (res >>> 0);

    // Update Result View
    calcResultOpName.textContent = currentOp;
    calcResultDec.textContent = isSigned ? String(toSigned(res)) : String(res);

    // Update Trace
    traceOpA.textContent = `${formatBinary(a, true)} (${isSigned ? toSigned(a) : a})`;
    if (currentOp === 'NOT') {
      traceRowB.style.display = 'none';
    } else {
      traceRowB.style.display = '';
      traceOpB.textContent = `${formatBinary(b, true)} (${isSigned ? toSigned(b) : b})`;
    }

    traceResBin.textContent = formatBinary(res, true);
    traceResHex.textContent = '0x' + formatHex(res);
    traceResOct.textContent = '0' + formatOct(res);
  }

  // Operator Buttons
  opBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      opBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentOp = btn.getAttribute('data-op');
      if (currentOp === 'NOT') {
        opBContainer.style.opacity = '0.35';
        opBContainer.style.pointerEvents = 'none';
      } else {
        opBContainer.style.opacity = '1';
        opBContainer.style.pointerEvents = 'auto';
      }
      runBitwiseCalc();
    });
  });

  calcOpA.addEventListener('input', runBitwiseCalc);
  calcOpB.addEventListener('input', runBitwiseCalc);

  // Send to Converter
  sendToConverterBtn.addEventListener('click', () => {
    const mask = getMask();
    const resText = calcResultDec.textContent;
    const parsed = parseInt(resText, 10);
    if (!isNaN(parsed)) {
      if (parsed < 0) {
        currentValue = (parsed + (mask + 1)) & mask;
      } else {
        currentValue = (parsed >>> 0) & mask;
      }
      syncFromValue();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  });

  // Pull from Converter
  pullFromConverterABtn.addEventListener('click', () => {
    calcOpA.value = String(isSigned ? toSigned(currentValue) : currentValue);
    runBitwiseCalc();
  });

  pullFromConverterBBtn.addEventListener('click', () => {
    calcOpB.value = String(isSigned ? toSigned(currentValue) : currentValue);
    runBitwiseCalc();
  });

  // Copy result
  copyResultBtn.addEventListener('click', async () => {
    const text = `Operation: ${currentOp}\nDecimal: ${calcResultDec.textContent}\nBinary: ${traceResBin.textContent}\nHex: ${traceResHex.textContent}\nOctal: ${traceResOct.textContent}`;
    try {
      await navigator.clipboard.writeText(text);
      const original = copyResultBtn.textContent;
      copyResultBtn.textContent = '✓ Copied';
      setTimeout(() => {
        copyResultBtn.textContent = original;
      }, 1800);
    } catch (err) {
      console.error(err);
    }
  });

  // Initial Sync
  syncFromValue();
  runBitwiseCalc();
});