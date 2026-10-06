// Cryptographic Token Generator - Complete Client-Side Implementation
document.addEventListener('DOMContentLoaded', () => {
  // Elements
  const formatButtons = document.querySelectorAll('.format-btn');
  const qtyButtons = document.querySelectorAll('.qty-btn');
  const lengthSlider = document.getElementById('length-slider');
  const lengthVal = document.getElementById('length-val');
  const lengthGroup = document.getElementById('length-group');
  const prefixInput = document.getElementById('prefix-input');
  const suffixInput = document.getElementById('suffix-input');
  const regenerateBtn = document.getElementById('regenerate-btn');
  
  const tokenList = document.getElementById('token-list');
  const tokenCountBadge = document.getElementById('token-count-badge');
  const copyAllBtn = document.getElementById('copy-all-btn');
  const downloadTxtBtn = document.getElementById('download-txt-btn');

  const statEntropy = document.getElementById('stat-entropy');
  const statAlphabet = document.getElementById('stat-alphabet');
  const statTier = document.getElementById('stat-tier');

  const appToast = document.getElementById('app-toast');
  const toastMessage = document.getElementById('toast-message');
  let toastTimer = null;

  // State
  let activeFormat = 'alphanumeric'; // 'hex' | 'base64url' | 'alphanumeric' | 'uuidv4' | 'nanoid'
  let activeQty = 1;
  let currentTokens = [];

  function showToast(msg) {
    if (toastTimer) clearTimeout(toastTimer);
    toastMessage.textContent = msg;
    appToast.classList.add('show');
    toastTimer = setTimeout(() => {
      appToast.classList.remove('show');
    }, 2500);
  }

  // Alphabets
  const ALPHABETS = {
    hex: '0123456789abcdef',
    base64url: 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_',
    alphanumeric: 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789',
    nanoid: 'useandom-26T198340PX75pxJACKVERYMINDBUSHWOLFG_Z0123456789'
  };

  // Cryptographically unbiased random selection
  function getRandomString(alphabet, length) {
    const alphabetLen = alphabet.length;
    // Determine bitmask
    const mask = (2 << (31 - Math.clz32((alphabetLen - 1) | 1))) - 1;
    // Buffer size
    const step = Math.ceil((1.6 * mask * length) / alphabetLen);
    const bytes = new Uint8Array(step);
    let result = '';

    while (result.length < length) {
      window.crypto.getRandomValues(bytes);
      for (let i = 0; i < bytes.length; i++) {
        const byte = bytes[i] & mask;
        if (byte < alphabetLen) {
          result += alphabet[byte];
          if (result.length === length) return result;
        }
      }
    }
    return result;
  }

  // RFC 4122 Compliant UUIDv4
  function generateUUIDv4() {
    const bytes = new Uint8Array(16);
    window.crypto.getRandomValues(bytes);

    // Version 4: set bits 4-7 of byte 6 to 0100
    bytes[6] = (bytes[6] & 0x0f) | 0x40;
    // Variant 1: set bits 6-7 of byte 8 to 10
    bytes[8] = (bytes[8] & 0x3f) | 0x80;

    const hex = Array.from(bytes).map(b => b.toString(16).padStart(2, '0'));
    return `${hex.slice(0, 4).join('')}-${hex.slice(4, 6).join('')}-${hex.slice(6, 8).join('')}-${hex.slice(8, 10).join('')}-${hex.slice(10, 16).join('')}`;
  }

  // Single Token Generator
  function generateSingleToken(format, length, prefix, suffix) {
    let raw = '';
    if (format === 'uuidv4') {
      raw = generateUUIDv4();
    } else if (format === 'hex') {
      raw = getRandomString(ALPHABETS.hex, length);
    } else if (format === 'base64url') {
      raw = getRandomString(ALPHABETS.base64url, length);
    } else if (format === 'nanoid') {
      raw = getRandomString(ALPHABETS.nanoid, length);
    } else {
      raw = getRandomString(ALPHABETS.alphanumeric, length);
    }
    return `${prefix}${raw}${suffix}`;
  }

  // Update Stats
  function updateStats() {
    const length = parseInt(lengthSlider.value, 10);
    let alphabetSize = 62;
    let bitsPerChar = Math.log2(62);
    let totalBits = 0;

    if (activeFormat === 'uuidv4') {
      alphabetSize = 16;
      totalBits = 122; // RFC 4122 exact entropy
      statAlphabet.textContent = '16 (Hex)';
      statEntropy.textContent = '122.0 bits';
    } else {
      if (activeFormat === 'hex') {
        alphabetSize = 16;
        bitsPerChar = 4;
      } else if (activeFormat === 'base64url' || activeFormat === 'nanoid') {
        alphabetSize = 64;
        bitsPerChar = 6;
      } else {
        alphabetSize = 62;
        bitsPerChar = Math.log2(62);
      }
      totalBits = length * bitsPerChar;
      statAlphabet.textContent = `${alphabetSize} chars`;
      statEntropy.textContent = `${totalBits.toFixed(1)} bits`;
    }

    if (totalBits < 64) {
      statTier.textContent = 'Standard';
      statTier.style.color = '#eab308';
    } else if (totalBits < 128) {
      statTier.textContent = 'High Security';
      statTier.style.color = '#3b82f6';
    } else {
      statTier.textContent = 'Military Grade';
      statTier.style.color = '#10b981';
    }
  }

  // Generate All Tokens
  function generateTokens() {
    const length = parseInt(lengthSlider.value, 10);
    const prefix = prefixInput.value;
    const suffix = suffixInput.value;

    currentTokens = [];
    for (let i = 0; i < activeQty; i++) {
      currentTokens.push(generateSingleToken(activeFormat, length, prefix, suffix));
    }

    renderTokenList();
    updateStats();
  }

  // Render List
  function renderTokenList() {
    tokenCountBadge.textContent = currentTokens.length;
    tokenList.innerHTML = '';

    currentTokens.forEach((tok, index) => {
      const card = document.createElement('div');
      card.className = 'token-card';

      const idxEl = document.createElement('span');
      idxEl.className = 'token-index';
      idxEl.textContent = `#${index + 1}`;

      const textEl = document.createElement('span');
      textEl.className = 'token-text';
      textEl.textContent = tok;

      const copyBtn = document.createElement('button');
      copyBtn.type = 'button';
      copyBtn.className = 'token-copy-btn';
      copyBtn.innerHTML = `
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
          <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
        </svg>
        <span>Copy</span>
      `;

      copyBtn.addEventListener('click', () => {
        navigator.clipboard.writeText(tok).then(() => {
          copyBtn.classList.add('copied');
          copyBtn.innerHTML = `
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="20 6 9 17 4 12"></polyline>
            </svg>
            <span>Copied!</span>
          `;
          showToast(`Token #${index + 1} copied!`);
          setTimeout(() => {
            copyBtn.classList.remove('copied');
            copyBtn.innerHTML = `
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
              </svg>
              <span>Copy</span>
            `;
          }, 2000);
        });
      });

      card.appendChild(idxEl);
      card.appendChild(textEl);
      card.appendChild(copyBtn);
      tokenList.appendChild(card);
    });
  }

  // Format Switch Handlers
  formatButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      formatButtons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      activeFormat = btn.dataset.format;

      if (activeFormat === 'uuidv4') {
        lengthSlider.disabled = true;
        lengthVal.textContent = '36 (RFC 4122)';
        lengthGroup.style.opacity = '0.5';
      } else {
        lengthSlider.disabled = false;
        lengthVal.textContent = lengthSlider.value;
        lengthGroup.style.opacity = '1';
      }

      generateTokens();
    });
  });

  // Quantity Handlers
  qtyButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      qtyButtons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      activeQty = parseInt(btn.dataset.qty, 10);
      generateTokens();
    });
  });

  // Slider Handler
  lengthSlider.addEventListener('input', () => {
    lengthVal.textContent = lengthSlider.value;
    generateTokens();
  });

  // Affixes Handlers
  prefixInput.addEventListener('input', generateTokens);
  suffixInput.addEventListener('input', generateTokens);

  // Regenerate Button
  regenerateBtn.addEventListener('click', () => {
    generateTokens();
    showToast('Tokens regenerated!');
  });

  // Copy All
  copyAllBtn.addEventListener('click', () => {
    if (!currentTokens.length) return;
    const all = currentTokens.join('\n');
    navigator.clipboard.writeText(all).then(() => {
      copyAllBtn.textContent = 'Copied All!';
      showToast(`${currentTokens.length} tokens copied to clipboard!`);
      setTimeout(() => {
        copyAllBtn.innerHTML = `
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
          Copy All
        `;
      }, 2000);
    });
  });

  // Download .txt
  downloadTxtBtn.addEventListener('click', () => {
    if (!currentTokens.length) return;
    const content = currentTokens.join('\r\n');
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `secure_tokens_${activeFormat}.txt`;
    link.click();
    showToast(`Downloaded ${currentTokens.length} tokens as .txt file!`);
  });

  // Initial generation
  generateTokens();
});