// Hash Matcher & Checksum Verifier - Complete Client-Side Implementation

document.addEventListener('DOMContentLoaded', () => {
  // DOM Elements - Mode Switcher
  const tabCompare = document.getElementById('tab-mode-compare');
  const tabCompute = document.getElementById('tab-mode-compute');
  const viewCompare = document.getElementById('view-compare');
  const viewCompute = document.getElementById('view-compute');

  // DOM Elements - Options
  const optCaseInsensitive = document.getElementById('opt-case-insensitive');
  const optTrimWhitespace = document.getElementById('opt-trim-whitespace');
  const optIgnoreDelimiters = document.getElementById('opt-ignore-delimiters');

  // DOM Elements - Status Banner
  const statusBanner = document.getElementById('status-banner');
  const statusIcon = document.getElementById('status-icon');
  const statusTitle = document.getElementById('status-title');
  const statusDesc = document.getElementById('status-desc');

  // DOM Elements - Compare Mode Inputs
  const hashInputA = document.getElementById('hash-input-a');
  const hashInputB = document.getElementById('hash-input-b');
  const hashLenA = document.getElementById('hash-len-a');
  const hashLenB = document.getElementById('hash-len-b');
  const hashTypeA = document.getElementById('hash-type-a');
  const hashTypeB = document.getElementById('hash-type-b');
  const pasteHashA = document.getElementById('paste-hash-a');
  const pasteHashB = document.getElementById('paste-hash-b');

  // DOM Elements - Compute Mode Inputs
  const computeTextInput = document.getElementById('compute-text-input');
  const computeAlgoSelect = document.getElementById('compute-algo-select');
  const computedHashDisplay = document.getElementById('computed-hash-display');
  const copyComputedBtn = document.getElementById('copy-computed-btn');
  const computeExpectedInput = document.getElementById('compute-expected-input');
  const computeExpectedLen = document.getElementById('compute-expected-len');
  const computeExpectedType = document.getElementById('compute-expected-type');
  const pasteExpectedBtn = document.getElementById('paste-expected-btn');

  // DOM Elements - Actions
  const btnSwap = document.getElementById('btn-swap');
  const btnSampleMatch = document.getElementById('btn-sample-match');
  const btnSampleMismatch = document.getElementById('btn-sample-mismatch');
  const btnClear = document.getElementById('btn-clear');
  const diffPanel = document.getElementById('diff-panel');
  const diffContentA = document.getElementById('diff-content-a');
  const diffContentB = document.getElementById('diff-content-b');

  // Toast
  const appToast = document.getElementById('app-toast');
  let toastTimer = null;

  // Active state
  let currentMode = 'compare'; // 'compare' | 'compute'

  // SVGs for status banner
  const ICONS = {
    neutral: `<svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>`,
    match: `<svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>`,
    mismatch: `<svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line></svg>`,
    calculating: `<svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="spinning"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 14 14"></polyline></svg>`
  };

  function showToast(message) {
    if (toastTimer) clearTimeout(toastTimer);
    appToast.textContent = message;
    appToast.classList.add('show');
    toastTimer = setTimeout(() => {
      appToast.classList.remove('show');
    }, 2200);
  }

  // Pure JavaScript MD5 Implementation (RFC 1321) for Client-side verification
  function md5(string) {
    function rotateLeft(lValue, iShiftBits) {
      return (lValue << iShiftBits) | (lValue >>> (32 - iShiftBits));
    }
    function addUnsigned(lX, lY) {
      const lX4 = (lX & 0x40000000);
      const lY4 = (lY & 0x40000000);
      const lX8 = (lX & 0x80000000);
      const lY8 = (lY & 0x80000000);
      const lResult = (lX & 0x3FFFFFFF) + (lY & 0x3FFFFFFF);
      if (lX4 & lY4) return (lResult ^ 0x80000000 ^ lX8 ^ lY8);
      if (lX4 | lY4) {
        if (lResult & 0x40000000) return (lResult ^ 0xC0000000 ^ lX8 ^ lY8);
        return (lResult ^ 0x40000000 ^ lX8 ^ lY8);
      }
      return (lResult ^ lX8 ^ lY8);
    }
    function F(x, y, z) { return (x & y) | ((~x) & z); }
    function G(x, y, z) { return (x & z) | (y & (~z)); }
    function H(x, y, z) { return (x ^ y ^ z); }
    function I(x, y, z) { return (y ^ (x | (~z))); }
    function FF(a, b, c, d, x, s, ac) {
      a = addUnsigned(a, addUnsigned(addUnsigned(F(b, c, d), x), ac));
      return addUnsigned(rotateLeft(a, s), b);
    }
    function GG(a, b, c, d, x, s, ac) {
      a = addUnsigned(a, addUnsigned(addUnsigned(G(b, c, d), x), ac));
      return addUnsigned(rotateLeft(a, s), b);
    }
    function HH(a, b, c, d, x, s, ac) {
      a = addUnsigned(a, addUnsigned(addUnsigned(H(b, c, d), x), ac));
      return addUnsigned(rotateLeft(a, s), b);
    }
    function II(a, b, c, d, x, s, ac) {
      a = addUnsigned(a, addUnsigned(addUnsigned(I(b, c, d), x), ac));
      return addUnsigned(rotateLeft(a, s), b);
    }

    function convertToWordArray(str) {
      const utf8 = unescape(encodeURIComponent(str));
      const wordCount = ((utf8.length + 8) >> 6) + 1;
      const words = new Array(wordCount * 16).fill(0);
      let bytePosition = 0;
      let byteCount = 0;
      while (byteCount < utf8.length) {
        const wordPosition = (byteCount >> 2);
        bytePosition = (byteCount % 4) * 8;
        words[wordPosition] = words[wordPosition] | (utf8.charCodeAt(byteCount) << bytePosition);
        byteCount++;
      }
      const wordPosition = (byteCount >> 2);
      bytePosition = (byteCount % 4) * 8;
      words[wordPosition] = words[wordPosition] | (0x80 << bytePosition);
      words[wordCount * 16 - 2] = (utf8.length * 8) & 0xFFFFFFFF;
      words[wordCount * 16 - 1] = (utf8.length * 8) >>> 32;
      return words;
    }

    function wordToHex(lValue) {
      let wordToHexValue = '', wordToHexValueTemp = '';
      for (let lCount = 0; lCount <= 3; lCount++) {
        const lByte = (lValue >>> (lCount * 8)) & 255;
        wordToHexValueTemp = '0' + lByte.toString(16);
        wordToHexValue = wordToHexValue + wordToHexValueTemp.substr(wordToHexValueTemp.length - 2, 2);
      }
      return wordToHexValue;
    }

    const x = convertToWordArray(string);
    let a = 0x67452301, b = 0xEFCDAB89, c = 0x98BADCFE, d = 0x10325476;
    const S11 = 7, S12 = 12, S13 = 17, S14 = 22;
    const S21 = 5, S22 = 9, S23 = 14, S24 = 20;
    const S31 = 4, S32 = 11, S33 = 16, S34 = 23;
    const S41 = 6, S42 = 10, S43 = 15, S44 = 21;

    for (let k = 0; k < x.length; k += 16) {
      const AA = a, BB = b, CC = c, DD = d;
      a = FF(a, b, c, d, x[k + 0], S11, 0xD76AA478);
      d = FF(d, a, b, c, x[k + 1], S12, 0xE8C7B756);
      c = FF(c, d, a, b, x[k + 2], S13, 0x242070DB);
      b = FF(b, c, d, a, x[k + 3], S14, 0xC1BDCEEE);
      a = FF(a, b, c, d, x[k + 4], S11, 0xF57C0FAF);
      d = FF(d, a, b, c, x[k + 5], S12, 0x4787C62A);
      c = FF(c, d, a, b, x[k + 6], S13, 0xA8304613);
      b = FF(b, c, d, a, x[k + 7], S14, 0xFD469501);
      a = FF(a, b, c, d, x[k + 8], S11, 0x698098D8);
      d = FF(d, a, b, c, x[k + 9], S12, 0x8B44F7AF);
      c = FF(c, d, a, b, x[k + 10], S13, 0xFFFF5BB1);
      b = FF(b, c, d, a, x[k + 11], S14, 0x895CD7BE);
      a = FF(a, b, c, d, x[k + 12], S11, 0x6B901122);
      d = FF(d, a, b, c, x[k + 13], S12, 0xFD987193);
      c = FF(c, d, a, b, x[k + 14], S13, 0xA679438E);
      b = FF(b, c, d, a, x[k + 15], S14, 0x49B40821);

      a = GG(a, b, c, d, x[k + 1], S21, 0xF61E2562);
      d = GG(d, a, b, c, x[k + 6], S22, 0xC040B340);
      c = GG(c, d, a, b, x[k + 11], S23, 0x265E5A51);
      b = GG(b, c, d, a, x[k + 0], S24, 0xE9B6C7AA);
      a = GG(a, b, c, d, x[k + 5], S21, 0xD62F105D);
      d = GG(d, a, b, c, x[k + 10], S22, 0x2441453);
      c = GG(c, d, a, b, x[k + 15], S23, 0xD8A1E681);
      b = GG(b, c, d, a, x[k + 4], S24, 0xE7D3FBC8);
      a = GG(a, b, c, d, x[k + 9], S21, 0x21E1CDE6);
      d = GG(d, a, b, c, x[k + 14], S22, 0xC33707D6);
      c = GG(c, d, a, b, x[k + 3], S23, 0xF4D50D87);
      b = GG(b, c, d, a, x[k + 8], S24, 0x455A14ED);
      a = GG(a, b, c, d, x[k + 13], S21, 0xA9E3E905);
      d = GG(d, a, b, c, x[k + 2], S22, 0xFCEFA3F8);
      c = GG(c, d, a, b, x[k + 7], S23, 0x676F02D9);
      b = GG(b, c, d, a, x[k + 12], S24, 0x8D2A4C8A);

      a = HH(a, b, c, d, x[k + 5], S31, 0xFFFA3942);
      d = HH(d, a, b, c, x[k + 8], S32, 0x8771F681);
      c = HH(c, d, a, b, x[k + 11], S33, 0x6D9D6122);
      b = HH(b, c, d, a, x[k + 14], S34, 0xFDE5380C);
      a = HH(a, b, c, d, x[k + 1], S31, 0xA4BEEA44);
      d = HH(d, a, b, c, x[k + 4], S32, 0x4BDECFA9);
      c = HH(c, d, a, b, x[k + 7], S33, 0xF6BB4B60);
      b = HH(b, c, d, a, x[k + 10], S34, 0xBEBFBC70);
      a = HH(a, b, c, d, x[k + 13], S31, 0x289B7EC6);
      d = HH(d, a, b, c, x[k + 0], S32, 0xEAA127FA);
      c = HH(c, d, a, b, x[k + 3], S33, 0xD4EF3085);
      b = HH(b, c, d, a, x[k + 6], S34, 0x4881D05);
      a = HH(a, b, c, d, x[k + 9], S31, 0xD9D4D039);
      d = HH(d, a, b, c, x[k + 12], S32, 0xE6DB99E5);
      c = HH(c, d, a, b, x[k + 15], S33, 0x1FA27CF8);
      b = HH(b, c, d, a, x[k + 2], S34, 0xC4AC5665);

      a = II(a, b, c, d, x[k + 0], S41, 0xF4292244);
      d = II(d, a, b, c, x[k + 7], S42, 0x432AFF97);
      c = II(c, d, a, b, x[k + 14], S43, 0xAB9423A7);
      b = II(b, c, d, a, x[k + 5], S44, 0xFC93A039);
      a = II(a, b, c, d, x[k + 12], S41, 0x655B59C3);
      d = II(d, a, b, c, x[k + 3], S42, 0x8F0CCC92);
      c = II(c, d, a, b, x[k + 10], S43, 0xFFEFF47D);
      b = II(b, c, d, a, x[k + 1], S44, 0x85845DD1);
      a = II(a, b, c, d, x[k + 8], S41, 0x6FA87E4F);
      d = II(d, a, b, c, x[k + 15], S42, 0xFE2CE6E0);
      c = II(c, d, a, b, x[k + 6], S43, 0xA3014314);
      b = II(b, c, d, a, x[k + 13], S44, 0x4E0811A1);
      a = II(a, b, c, d, x[k + 4], S41, 0xF7537E82);
      d = II(d, a, b, c, x[k + 11], S42, 0xBD3AF235);
      c = II(c, d, a, b, x[k + 2], S43, 0x2AD7D2BB);
      b = II(b, c, d, a, x[k + 9], S44, 0xEB86D391);

      a = addUnsigned(a, AA);
      b = addUnsigned(b, BB);
      c = addUnsigned(c, CC);
      d = addUnsigned(d, DD);
    }
    return (wordToHex(a) + wordToHex(b) + wordToHex(c) + wordToHex(d)).toLowerCase();
  }

  // Cryptographic digest calculation
  async function computeHash(algo, text) {
    if (algo === 'MD5') {
      return md5(text);
    }
    const encoder = new TextEncoder();
    const data = encoder.encode(text);
    const hashBuffer = await crypto.subtle.digest(algo, data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  }

  // Identify algorithm family by hex character length
  function detectAlgorithm(hex) {
    if (!hex) return 'Empty';
    const len = hex.length;
    const isHex = /^[0-9a-fA-F]+$/.test(hex);
    if (!isHex) return 'Non-Hex String';

    switch (len) {
      case 32: return 'MD5 (128-bit)';
      case 40: return 'SHA-1 (160-bit)';
      case 56: return 'SHA-224 (224-bit)';
      case 64: return 'SHA-256 (256-bit)';
      case 96: return 'SHA-384 (384-bit)';
      case 128: return 'SHA-512 (512-bit)';
      default: return `${len} Hex chars`;
    }
  }

  // Normalize hash string based on user options
  function normalizeHash(str) {
    if (!str) return '';
    let res = str;
    if (optTrimWhitespace.checked) {
      res = res.trim();
    }
    if (optIgnoreDelimiters.checked) {
      res = res.replace(/[\s\:\-]+/g, '');
    }
    if (optCaseInsensitive.checked) {
      res = res.toLowerCase();
    }
    return res;
  }

  // Update UI comparison state
  function updateComparison(hashA, hashB, contextA = 'Target', contextB = 'Downloaded') {
    const rawA = hashA || '';
    const rawB = hashB || '';
    const normA = normalizeHash(rawA);
    const normB = normalizeHash(rawB);

    if (!normA && !normB) {
      statusBanner.className = 'status-banner neutral';
      statusIcon.innerHTML = ICONS.neutral;
      statusTitle.textContent = 'Awaiting Input';
      statusDesc.textContent = 'Enter or paste hashes to verify cryptographic integrity.';
      diffPanel.style.display = 'none';
      return;
    }

    if (!normA || !normB) {
      statusBanner.className = 'status-banner neutral';
      statusIcon.innerHTML = ICONS.neutral;
      statusTitle.textContent = 'Incomplete Pair';
      statusDesc.textContent = `Please enter both ${contextA} and ${contextB} hashes to perform comparison.`;
      diffPanel.style.display = 'none';
      return;
    }

    if (normA === normB) {
      statusBanner.className = 'status-banner match';
      statusIcon.innerHTML = ICONS.match;
      statusTitle.textContent = 'MATCH CONFIRMED - HASHES ARE IDENTICAL';
      const detected = detectAlgorithm(normA);
      statusDesc.textContent = `Cryptographic integrity verified. Both hashes match 100% (${normA.length} characters, identified as ${detected}).`;
      diffPanel.style.display = 'none';
    } else {
      statusBanner.className = 'status-banner mismatch';
      statusIcon.innerHTML = ICONS.mismatch;
      statusTitle.textContent = 'MISMATCH DETECTED - CHECKSUMS DIFFER';

      let reason = '';
      if (normA.length !== normB.length) {
        reason = `Length mismatch: ${contextA} is ${normA.length} chars, while ${contextB} is ${normB.length} chars.`;
      } else {
        let firstDiff = -1;
        let diffCount = 0;
        for (let i = 0; i < normA.length; i++) {
          if (normA[i] !== normB[i]) {
            if (firstDiff === -1) firstDiff = i;
            diffCount++;
          }
        }
        reason = `Same length (${normA.length} chars), but ${diffCount} character(s) diverge. First difference at index ${firstDiff + 1}.`;
      }
      statusDesc.textContent = `Verification failed. Integrity warning! ${reason}`;

      renderDiff(normA, normB);
      diffPanel.style.display = 'block';
    }
  }

  // Render character by character divergence
  function renderDiff(strA, strB) {
    const maxLen = Math.max(strA.length, strB.length);
    let htmlA = '';
    let htmlB = '';

    for (let i = 0; i < maxLen; i++) {
      const charA = strA[i];
      const charB = strB[i];

      if (charA === undefined) {
        // strA ended early
      } else if (charA === charB) {
        htmlA += `<span class="diff-match">${escapeHtml(charA)}</span>`;
      } else {
        htmlA += `<span class="diff-mismatch">${escapeHtml(charA)}</span>`;
      }

      if (charB === undefined) {
        // strB ended early
      } else if (charA === charB) {
        htmlB += `<span class="diff-match">${escapeHtml(charB)}</span>`;
      } else {
        htmlB += `<span class="diff-mismatch">${escapeHtml(charB)}</span>`;
      }
    }

    diffContentA.innerHTML = htmlA || '<em>(Empty)</em>';
    diffContentB.innerHTML = htmlB || '<em>(Empty)</em>';
  }

  function escapeHtml(char) {
    if (char === '&') return '&amp;';
    if (char === '<') return '&lt;';
    if (char === '>') return '&gt;';
    if (char === '"') return '&quot;';
    return char;
  }

  // Handler for Compare Mode
  function onCompareInputsChanged() {
    const rawA = hashInputA.value;
    const rawB = hashInputB.value;
    const normA = normalizeHash(rawA);
    const normB = normalizeHash(rawB);

    hashLenA.textContent = normA.length;
    hashTypeA.textContent = detectAlgorithm(normA);
    hashLenB.textContent = normB.length;
    hashTypeB.textContent = detectAlgorithm(normB);

    updateComparison(rawA, rawB, 'Target', 'Downloaded');
  }

  // Handler for Compute Mode
  async function onComputeInputsChanged() {
    const text = computeTextInput.value;
    const algo = computeAlgoSelect.value;
    const expected = computeExpectedInput.value;

    if (!text) {
      computedHashDisplay.value = '';
    } else {
      try {
        const computed = await computeHash(algo, text);
        computedHashDisplay.value = computed;
      } catch (err) {
        computedHashDisplay.value = 'Error computing hash';
        console.error('Hash error:', err);
      }
    }

    const normExpected = normalizeHash(expected);
    computeExpectedLen.textContent = normExpected.length;
    computeExpectedType.textContent = detectAlgorithm(normExpected);

    updateComparison(expected, computedHashDisplay.value, 'Expected', 'Computed');
  }

  // Mode Switchers
  tabCompare.addEventListener('click', () => {
    currentMode = 'compare';
    tabCompare.classList.add('active');
    tabCompare.setAttribute('aria-selected', 'true');
    tabCompute.classList.remove('active');
    tabCompute.setAttribute('aria-selected', 'false');
    viewCompare.style.display = 'grid';
    viewCompute.style.display = 'none';
    btnSwap.style.display = 'inline-flex';
    onCompareInputsChanged();
  });

  tabCompute.addEventListener('click', () => {
    currentMode = 'compute';
    tabCompute.classList.add('active');
    tabCompute.setAttribute('aria-selected', 'true');
    tabCompare.classList.remove('active');
    tabCompare.setAttribute('aria-selected', 'false');
    viewCompute.style.display = 'grid';
    viewCompare.style.display = 'none';
    btnSwap.style.display = 'none';
    onComputeInputsChanged();
  });

  // Event Listeners for Compare mode
  hashInputA.addEventListener('input', onCompareInputsChanged);
  hashInputB.addEventListener('input', onCompareInputsChanged);

  // Event Listeners for Compute mode
  computeTextInput.addEventListener('input', onComputeInputsChanged);
  computeAlgoSelect.addEventListener('change', onComputeInputsChanged);
  computeExpectedInput.addEventListener('input', onComputeInputsChanged);

  // Options toggled
  [optCaseInsensitive, optTrimWhitespace, optIgnoreDelimiters].forEach(chk => {
    chk.addEventListener('change', () => {
      if (currentMode === 'compare') {
        onCompareInputsChanged();
      } else {
        onComputeInputsChanged();
      }
    });
  });

  // Paste helpers
  async function pasteInto(textarea, callback) {
    try {
      const text = await navigator.clipboard.readText();
      textarea.value = text;
      callback();
      showToast('Pasted from clipboard');
    } catch {
      showToast('Please press Ctrl+V to paste');
      textarea.focus();
    }
  }

  pasteHashA.addEventListener('click', () => pasteInto(hashInputA, onCompareInputsChanged));
  pasteHashB.addEventListener('click', () => pasteInto(hashInputB, onCompareInputsChanged));
  pasteExpectedBtn.addEventListener('click', () => pasteInto(computeExpectedInput, onComputeInputsChanged));

  // Copy computed hash
  copyComputedBtn.addEventListener('click', async () => {
    const val = computedHashDisplay.value;
    if (!val || val.includes('Error')) {
      showToast('No hash to copy');
      return;
    }
    try {
      await navigator.clipboard.writeText(val);
      showToast('Computed hash copied!');
    } catch {
      showToast('Failed to copy');
    }
  });

  // Action Buttons
  btnSwap.addEventListener('click', () => {
    if (currentMode === 'compare') {
      const temp = hashInputA.value;
      hashInputA.value = hashInputB.value;
      hashInputB.value = temp;
      onCompareInputsChanged();
      showToast('Swapped target & calculated hashes');
    }
  });

  btnSampleMatch.addEventListener('click', () => {
    if (currentMode === 'compare') {
      const sample = 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855'; // SHA-256 of empty string
      hashInputA.value = sample.toUpperCase();
      hashInputB.value = sample.toLowerCase();
      onCompareInputsChanged();
    } else {
      computeTextInput.value = 'Hello World';
      computeAlgoSelect.value = 'SHA-256';
      // SHA-256 of 'Hello World'
      computeExpectedInput.value = 'a591a6d40bf420404a011733cfb7b190d62c65bf0bcda32b57b277d9ad9f146e';
      onComputeInputsChanged();
    }
    showToast('Loaded sample matching pair');
  });

  btnSampleMismatch.addEventListener('click', () => {
    if (currentMode === 'compare') {
      hashInputA.value = 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855';
      hashInputB.value = 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b899'; // last 2 chars differ
      onCompareInputsChanged();
    } else {
      computeTextInput.value = 'Hello World';
      computeAlgoSelect.value = 'SHA-256';
      computeExpectedInput.value = 'a591a6d40bf420404a011733cfb7b190d62c65bf0bcda32b57b277d9ad9f9999';
      onComputeInputsChanged();
    }
    showToast('Loaded sample mismatching pair');
  });

  btnClear.addEventListener('click', () => {
    if (currentMode === 'compare') {
      hashInputA.value = '';
      hashInputB.value = '';
      onCompareInputsChanged();
    } else {
      computeTextInput.value = '';
      computeExpectedInput.value = '';
      onComputeInputsChanged();
    }
    showToast('Cleared inputs');
  });

  // Initialize
  onCompareInputsChanged();
});