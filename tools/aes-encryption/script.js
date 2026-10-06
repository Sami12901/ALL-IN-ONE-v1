// AES-256-GCM Encryption & Decryption Simulator - Complete Client-Side Implementation
document.addEventListener('DOMContentLoaded', () => {
  // Elements
  const tabEncrypt = document.getElementById('tab-encrypt');
  const tabDecrypt = document.getElementById('tab-decrypt');
  
  const panelInputTitle = document.getElementById('panel-input-title');
  const panelOutputTitle = document.getElementById('panel-output-title');
  const mainInputLabel = document.getElementById('main-input-label');
  const mainInput = document.getElementById('main-input');
  const mainOutput = document.getElementById('main-output');
  const passphraseInput = document.getElementById('passphrase-input');
  const togglePassVisibilityBtn = document.getElementById('toggle-pass-visibility-btn');
  const passEyeIcon = document.getElementById('pass-eye-icon');
  const genKeyBtn = document.getElementById('gen-key-btn');
  const loadSampleBtn = document.getElementById('load-sample-btn');

  const actionBtn = document.getElementById('action-btn');
  const actionBtnText = document.getElementById('action-btn-text');
  const clearAllBtn = document.getElementById('clear-all-btn');
  const copyOutputBtn = document.getElementById('copy-output-btn');
  const downloadOutputBtn = document.getElementById('download-output-btn');

  const outputTabsContainer = document.getElementById('output-tabs-container');
  const tabFmtPacked = document.getElementById('tab-fmt-packed');
  const tabFmtJson = document.getElementById('tab-fmt-json');

  const errorBanner = document.getElementById('error-banner');
  const errorMessage = document.getElementById('error-message');

  const appToast = document.getElementById('app-toast');
  const toastMessage = document.getElementById('toast-message');
  let toastTimer = null;

  // Active State
  let currentMode = 'encrypt'; // 'encrypt' | 'decrypt'
  let outputFormat = 'packed'; // 'packed' | 'json'
  let cachedEncryptResult = null;

  function showToast(msg) {
    if (toastTimer) clearTimeout(toastTimer);
    toastMessage.textContent = msg;
    appToast.classList.add('show');
    toastTimer = setTimeout(() => {
      appToast.classList.remove('show');
    }, 2500);
  }

  function showError(msg) {
    errorMessage.textContent = msg;
    errorBanner.classList.add('show');
  }

  function hideError() {
    errorBanner.classList.remove('show');
  }

  // Binary / Base64 Helpers
  function uint8ToBase64(bytes) {
    let binary = '';
    const len = bytes.byteLength;
    for (let i = 0; i < len; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
  }

  function base64ToUint8(base64) {
    const clean = base64.replace(/[\s\r\n]+/g, '');
    const binary = atob(clean);
    const len = binary.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
      bytes[i] = binary.charCodeAt(i);
    }
    return bytes;
  }

  function uint8ToHex(bytes) {
    return Array.from(bytes).map(b => b.toString(16).padStart(2, '0')).join('');
  }

  function hexToUint8(hexStr) {
    const clean = hexStr.replace(/[^0-9a-fA-F]/g, '');
    const bytes = new Uint8Array(clean.length / 2);
    for (let i = 0; i < clean.length; i += 2) {
      bytes[i / 2] = parseInt(clean.substring(i, i + 2), 16);
    }
    return bytes;
  }

  // PBKDF2 Key Derivation
  async function deriveKey(passphrase, saltBytes, iterations = 100000) {
    const enc = new TextEncoder();
    const keyMaterial = await window.crypto.subtle.importKey(
      'raw',
      enc.encode(passphrase),
      { name: 'PBKDF2' },
      false,
      ['deriveKey']
    );

    return await window.crypto.subtle.deriveKey(
      {
        name: 'PBKDF2',
        salt: saltBytes,
        iterations: iterations,
        hash: 'SHA-256'
      },
      keyMaterial,
      { name: 'AES-GCM', length: 256 },
      false,
      ['encrypt', 'decrypt']
    );
  }

  // AES-GCM Encrypt
  async function performEncryption(plaintext, passphrase) {
    const salt = window.crypto.getRandomValues(new Uint8Array(16));
    const iv = window.crypto.getRandomValues(new Uint8Array(12));
    const key = await deriveKey(passphrase, salt, 100000);

    const plaintextBytes = new TextEncoder().encode(plaintext);
    const encryptedBuffer = await window.crypto.subtle.encrypt(
      { name: 'AES-GCM', iv: iv },
      key,
      plaintextBytes
    );

    const ciphertextBytes = new Uint8Array(encryptedBuffer);

    // Pack salt (16) + iv (12) + ciphertext (includes 16-byte auth tag)
    const packed = new Uint8Array(16 + 12 + ciphertextBytes.length);
    packed.set(salt, 0);
    packed.set(iv, 16);
    packed.set(ciphertextBytes, 28);

    const packedBase64 = uint8ToBase64(packed);

    const jsonEnvelope = JSON.stringify({
      schema: "all-in-one-aes-v1",
      cipher: "AES-GCM-256",
      kdf: "PBKDF2-SHA256",
      iterations: 100000,
      salt: uint8ToHex(salt),
      iv: uint8ToHex(iv),
      ciphertext: uint8ToBase64(ciphertextBytes)
    }, null, 2);

    return {
      packedBase64,
      jsonEnvelope
    };
  }

  // AES-GCM Decrypt
  async function performDecryption(rawInput, passphrase) {
    let salt, iv, ciphertext;
    const trimmed = rawInput.trim();

    // Check if JSON format
    if (trimmed.startsWith('{') && trimmed.endsWith('}')) {
      try {
        const obj = JSON.parse(trimmed);
        if (obj.salt && obj.iv && obj.ciphertext) {
          salt = obj.salt.length === 32 ? hexToUint8(obj.salt) : base64ToUint8(obj.salt);
          iv = obj.iv.length === 24 ? hexToUint8(obj.iv) : base64ToUint8(obj.iv);
          ciphertext = base64ToUint8(obj.ciphertext);
        }
      } catch (err) {
        // Fallback to packed base64 parsing
      }
    }

    if (!salt || !iv || !ciphertext) {
      let packedBytes;
      try {
        packedBytes = base64ToUint8(trimmed);
      } catch (err) {
        throw new Error('Invalid input: Ciphertext is not valid Base64.');
      }

      if (packedBytes.length < 28 + 16) {
        throw new Error('Invalid payload: Ciphertext is too short to contain a valid Salt (16B), IV (12B), and Auth Tag (16B).');
      }

      salt = packedBytes.slice(0, 16);
      iv = packedBytes.slice(16, 28);
      ciphertext = packedBytes.slice(28);
    }

    const key = await deriveKey(passphrase, salt, 100000);

    const decryptedBuffer = await window.crypto.subtle.decrypt(
      { name: 'AES-GCM', iv: iv },
      key,
      ciphertext
    );

    return new TextDecoder().decode(decryptedBuffer);
  }

  // Switch Mode
  function setMode(mode) {
    currentMode = mode;
    hideError();

    if (mode === 'encrypt') {
      tabEncrypt.classList.add('active');
      tabDecrypt.classList.remove('active');
      panelInputTitle.innerHTML = `
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="color: var(--accent);">
          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
          <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
        </svg> Plaintext Message Input`;
      mainInputLabel.textContent = 'Plaintext Message';
      mainInput.placeholder = 'Type sensitive message to encrypt...';

      panelOutputTitle.innerHTML = `
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="color: var(--accent);">
          <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline>
        </svg> Ciphertext Output (Base64)`;
      mainOutput.placeholder = 'Encrypted ciphertext will appear here...';

      actionBtnText.textContent = 'Encrypt Message';
      outputTabsContainer.style.display = 'flex';
      loadSampleBtn.textContent = 'Load Sample Text';
      
      mainInput.value = '';
      mainOutput.value = '';
      cachedEncryptResult = null;
    } else {
      tabDecrypt.classList.add('active');
      tabEncrypt.classList.remove('active');
      panelInputTitle.innerHTML = `
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="color: var(--accent);">
          <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
          <path d="M7 11V7a5 5 0 0 1 9.9-1"></path>
        </svg> Ciphertext Input (Base64 or JSON)`;
      mainInputLabel.textContent = 'Ciphertext Payload';
      mainInput.placeholder = 'Paste Base64 or JSON ciphertext payload here...';

      panelOutputTitle.innerHTML = `
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="color: var(--accent);">
          <polyline points="20 6 9 17 4 12"></polyline>
        </svg> Decrypted Plaintext Output`;
      mainOutput.placeholder = 'Decrypted plaintext will appear here...';

      actionBtnText.textContent = 'Decrypt Message';
      outputTabsContainer.style.display = 'none';
      loadSampleBtn.textContent = 'Load Demo Ciphertext';

      mainInput.value = '';
      mainOutput.value = '';
      cachedEncryptResult = null;
    }
  }

  tabEncrypt.addEventListener('click', () => setMode('encrypt'));
  tabDecrypt.addEventListener('click', () => setMode('decrypt'));

  // Toggle Output Format tabs
  tabFmtPacked.addEventListener('click', () => {
    outputFormat = 'packed';
    tabFmtPacked.classList.add('active');
    tabFmtJson.classList.remove('active');
    if (cachedEncryptResult) {
      mainOutput.value = cachedEncryptResult.packedBase64;
    }
  });

  tabFmtJson.addEventListener('click', () => {
    outputFormat = 'json';
    tabFmtJson.classList.add('active');
    tabFmtPacked.classList.remove('active');
    if (cachedEncryptResult) {
      mainOutput.value = cachedEncryptResult.jsonEnvelope;
    }
  });

  // Toggle Passphrase Visibility
  let isPassVisible = false;
  togglePassVisibilityBtn.addEventListener('click', () => {
    isPassVisible = !isPassVisible;
    passphraseInput.type = isPassVisible ? 'text' : 'password';
    passEyeIcon.innerHTML = isPassVisible
      ? `<path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path><line x1="1" y1="1" x2="23" y2="23"></line>`
      : `<path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle>`;
  });

  // Generate Random Key
  genKeyBtn.addEventListener('click', () => {
    const randomBytes = new Uint8Array(24);
    window.crypto.getRandomValues(randomBytes);
    const key = uint8ToBase64(randomBytes).replace(/[+/=]/g, '').slice(0, 24);
    passphraseInput.value = key;
    passphraseInput.type = 'text';
    isPassVisible = true;
    showToast('New random secure passphrase generated!');
  });

  // Load Sample
  loadSampleBtn.addEventListener('click', async () => {
    hideError();
    if (currentMode === 'encrypt') {
      passphraseInput.value = 'QuantumCipherKey#2026';
      mainInput.value = `CONFIDENTIAL BRIEFING:\nAll system credentials must adhere to zero-knowledge authenticated AES-GCM standards.\nDerivation: PBKDF2 with 100,000 iterations.\nStatus: VERIFIED & SECURE.`;
      showToast('Sample plaintext loaded.');
    } else {
      passphraseInput.value = 'QuantumCipherKey#2026';
      // Generate a sample ciphertext on the fly
      const sampleResult = await performEncryption(
        `CONFIDENTIAL BRIEFING:\nAll system credentials must adhere to zero-knowledge authenticated AES-GCM standards.\nDerivation: PBKDF2 with 100,000 iterations.\nStatus: VERIFIED & SECURE.`,
        'QuantumCipherKey#2026'
      );
      mainInput.value = sampleResult.packedBase64;
      showToast('Sample encrypted payload loaded.');
    }
  });

  // Action Button (Encrypt / Decrypt)
  actionBtn.addEventListener('click', async () => {
    hideError();
    const passphrase = passphraseInput.value;
    const inputContent = mainInput.value.trim();

    if (!passphrase) {
      showError('Please enter a secret passphrase or generate one.');
      passphraseInput.focus();
      return;
    }

    if (!inputContent) {
      showError(currentMode === 'encrypt' ? 'Please enter a message to encrypt.' : 'Please enter ciphertext to decrypt.');
      mainInput.focus();
      return;
    }

    actionBtn.disabled = true;

    try {
      if (currentMode === 'encrypt') {
        const result = await performEncryption(inputContent, passphrase);
        cachedEncryptResult = result;
        mainOutput.value = outputFormat === 'packed' ? result.packedBase64 : result.jsonEnvelope;
        showToast('Message encrypted with AES-256-GCM!');
      } else {
        const decrypted = await performDecryption(inputContent, passphrase);
        mainOutput.value = decrypted;
        showToast('Message successfully decrypted and authenticated!');
      }
    } catch (err) {
      console.error(err);
      if (currentMode === 'decrypt') {
        showError('Decryption Failed: Authentication tag mismatch or invalid passphrase. Ensure your passphrase matches the encryption key.');
      } else {
        showError(`Encryption error: ${err.message || 'Operation failed.'}`);
      }
      mainOutput.value = '';
    } finally {
      actionBtn.disabled = false;
    }
  });

  // Clear All
  clearAllBtn.addEventListener('click', () => {
    mainInput.value = '';
    mainOutput.value = '';
    cachedEncryptResult = null;
    hideError();
  });

  // Copy Output
  copyOutputBtn.addEventListener('click', () => {
    const val = mainOutput.value;
    if (!val) {
      showToast('Nothing to copy.');
      return;
    }
    navigator.clipboard.writeText(val).then(() => {
      copyOutputBtn.textContent = 'Copied!';
      copyOutputBtn.classList.add('copied');
      showToast('Output copied to clipboard!');
      setTimeout(() => {
        copyOutputBtn.textContent = 'Copy';
        copyOutputBtn.classList.remove('copied');
      }, 2000);
    });
  });

  // Download Output
  downloadOutputBtn.addEventListener('click', () => {
    const val = mainOutput.value;
    if (!val) {
      showToast('Output is empty.');
      return;
    }
    const ext = (currentMode === 'encrypt' && outputFormat === 'json') ? 'json' : 'txt';
    const filename = `${currentMode === 'encrypt' ? 'ciphertext' : 'decrypted-message'}.${ext}`;
    const blob = new Blob([val], { type: 'text/plain;charset=utf-8' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    link.click();
    showToast(`Downloaded ${filename}!`);
  });
});