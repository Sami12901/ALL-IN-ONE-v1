// Multi-Algorithm Cryptographic Hash Generator & Verifier
// Supports SHA-256, SHA-512, SHA-384, SHA-1 (Web Crypto API) and pure JS MD5 (RFC 1321)
// Supports HMAC mode and real-time checksum comparison

// Pure JavaScript MD5 Implementation (RFC 1321 compliant)
function md5(input) {
  let bytes;
  if (typeof input === 'string') {
    bytes = new TextEncoder().encode(input);
  } else if (input instanceof Uint8Array) {
    bytes = input;
  } else if (input instanceof ArrayBuffer) {
    bytes = new Uint8Array(input);
  } else {
    bytes = new Uint8Array(0);
  }

  const origLen = bytes.length;
  const bitLen = origLen * 8;
  const padLen = (origLen % 64 < 56) ? (56 - (origLen % 64)) : (56 + 64 - (origLen % 64));
  const totalLen = origLen + padLen + 8;
  const buf = new Uint8Array(totalLen);
  buf.set(bytes, 0);
  buf[origLen] = 0x80;

  const view = new DataView(buf.buffer);
  view.setUint32(totalLen - 8, bitLen & 0xffffffff, true);
  view.setUint32(totalLen - 4, Math.floor(bitLen / 0x100000000), true);

  const K = new Uint32Array(64);
  for (let i = 0; i < 64; i++) {
    K[i] = Math.floor(Math.abs(Math.sin(i + 1)) * 0x100000000) >>> 0;
  }
  const S = [
    7, 12, 17, 22,  7, 12, 17, 22,  7, 12, 17, 22,  7, 12, 17, 22,
    5,  9, 14, 20,  5,  9, 14, 20,  5,  9, 14, 20,  5,  9, 14, 20,
    4, 11, 16, 23,  4, 11, 16, 23,  4, 11, 16, 23,  4, 11, 16, 23,
    6, 10, 15, 21,  6, 10, 15, 21,  6, 10, 15, 21,  6, 10, 15, 21
  ];

  let a0 = 0x67452301 >>> 0;
  let b0 = 0xefcdab89 >>> 0;
  let c0 = 0x98badcfe >>> 0;
  let d0 = 0x10325476 >>> 0;

  for (let offset = 0; offset < totalLen; offset += 64) {
    let A = a0;
    let B = b0;
    let C = c0;
    let D = d0;

    for (let i = 0; i < 64; i++) {
      let F, g;
      if (i < 16) {
        F = (B & C) | (~B & D);
        g = i;
      } else if (i < 32) {
        F = (D & B) | (~D & C);
        g = (5 * i + 1) % 16;
      } else if (i < 48) {
        F = B ^ C ^ D;
        g = (3 * i + 5) % 16;
      } else {
        F = C ^ (B | ~D);
        g = (7 * i) % 16;
      }

      const Mg = view.getUint32(offset + g * 4, true);
      const temp = D;
      D = C;
      C = B;
      const sum = (A + F + K[i] + Mg) >>> 0;
      const rot = ((sum << S[i]) | (sum >>> (32 - S[i]))) >>> 0;
      B = (B + rot) >>> 0;
      A = temp;
    }

    a0 = (a0 + A) >>> 0;
    b0 = (b0 + B) >>> 0;
    c0 = (c0 + C) >>> 0;
    d0 = (d0 + D) >>> 0;
  }

  const outBuf = new Uint8Array(16);
  const outView = new DataView(outBuf.buffer);
  outView.setUint32(0, a0, true);
  outView.setUint32(4, b0, true);
  outView.setUint32(8, c0, true);
  outView.setUint32(12, d0, true);

  return outBuf;
}

// HMAC-MD5 (RFC 2104 compliant)
function hmacMd5(keyInput, msgInput) {
  let keyBytes;
  if (typeof keyInput === 'string') {
    keyBytes = new TextEncoder().encode(keyInput);
  } else if (keyInput instanceof Uint8Array) {
    keyBytes = keyInput;
  } else if (keyInput instanceof ArrayBuffer) {
    keyBytes = new Uint8Array(keyInput);
  } else {
    keyBytes = new Uint8Array(0);
  }

  let msgBytes;
  if (typeof msgInput === 'string') {
    msgBytes = new TextEncoder().encode(msgInput);
  } else if (msgInput instanceof Uint8Array) {
    msgBytes = msgInput;
  } else if (msgInput instanceof ArrayBuffer) {
    msgBytes = new Uint8Array(msgInput);
  } else {
    msgBytes = new Uint8Array(0);
  }

  const blockSize = 64;
  const k = new Uint8Array(blockSize);

  if (keyBytes.length > blockSize) {
    const hashedKey = md5(keyBytes);
    k.set(hashedKey, 0);
  } else {
    k.set(keyBytes, 0);
  }

  const ipad = new Uint8Array(blockSize);
  const opad = new Uint8Array(blockSize);
  for (let i = 0; i < blockSize; i++) {
    ipad[i] = k[i] ^ 0x36;
    opad[i] = k[i] ^ 0x5c;
  }

  const innerMsg = new Uint8Array(blockSize + msgBytes.length);
  innerMsg.set(ipad, 0);
  innerMsg.set(msgBytes, blockSize);
  const innerHash = md5(innerMsg);

  const outerMsg = new Uint8Array(blockSize + innerHash.length);
  outerMsg.set(opad, 0);
  outerMsg.set(innerHash, blockSize);
  const outerHash = md5(outerMsg);

  return outerHash;
}

function bytesToHex(bytes, uppercase = false) {
  let hex = '';
  for (let i = 0; i < bytes.length; i++) {
    hex += bytes[i].toString(16).padStart(2, '0');
  }
  return uppercase ? hex.toUpperCase() : hex.toLowerCase();
}

document.addEventListener('DOMContentLoaded', () => {
  // Elements
  const tabText = document.getElementById('tab-text');
  const tabFile = document.getElementById('tab-file');
  const textInputSection = document.getElementById('text-input-section');
  const fileInputSection = document.getElementById('file-input-section');
  const textActionsBar = document.getElementById('text-actions-bar');

  const hashTextInput = document.getElementById('hash-text-input');
  const fileDropZone = document.getElementById('file-drop-zone');
  const filePicker = document.getElementById('file-picker');
  const fileCard = document.getElementById('file-card');
  const selectedFileName = document.getElementById('selected-file-name');
  const selectedFileMeta = document.getElementById('selected-file-meta');
  const btnRemoveFile = document.getElementById('btn-remove-file');

  const btnSample = document.getElementById('btn-sample');
  const btnClear = document.getElementById('btn-clear');
  const hmacToggle = document.getElementById('hmac-toggle');
  const hmacKeyGroup = document.getElementById('hmac-key-group');
  const hmacKey = document.getElementById('hmac-key');
  const optUppercase = document.getElementById('opt-uppercase');
  const btnCopyAll = document.getElementById('btn-copy-all');

  const outputPanelTitle = document.getElementById('output-panel-title');
  const hashSha256 = document.getElementById('hash-sha256');
  const hashSha512 = document.getElementById('hash-sha512');
  const hashSha384 = document.getElementById('hash-sha384');
  const hashSha1 = document.getElementById('hash-sha1');
  const hashMd5 = document.getElementById('hash-md5');

  const cardSha256 = document.getElementById('card-sha256');
  const cardSha512 = document.getElementById('card-sha512');
  const cardSha384 = document.getElementById('card-sha384');
  const cardSha1 = document.getElementById('card-sha1');
  const cardMd5 = document.getElementById('card-md5');

  const verifierInput = document.getElementById('verifier-input');
  const verifierFeedback = document.getElementById('verifier-feedback');

  let currentInputMode = 'text'; // 'text' or 'file'
  let loadedFileBuffer = null;
  let currentComputedHashes = {
    'SHA-256': '',
    'SHA-512': '',
    'SHA-384': '',
    'SHA-1': '',
    'MD5': ''
  };

  // Switch tabs
  function setInputMode(mode) {
    currentInputMode = mode;
    if (mode === 'text') {
      tabText.classList.add('active');
      tabFile.classList.remove('active');
      textInputSection.style.display = 'flex';
      fileInputSection.style.display = 'none';
      textActionsBar.style.display = 'flex';
    } else {
      tabFile.classList.add('active');
      tabText.classList.remove('active');
      textInputSection.style.display = 'none';
      fileInputSection.style.display = 'flex';
      textActionsBar.style.display = 'none';
    }
    computeAllHashes();
  }

  tabText.addEventListener('click', () => setInputMode('text'));
  tabFile.addEventListener('click', () => setInputMode('file'));

  // File picker and drop zone
  fileDropZone.addEventListener('click', () => filePicker.click());

  fileDropZone.addEventListener('dragover', (e) => {
    e.preventDefault();
    fileDropZone.classList.add('dragover');
  });

  fileDropZone.addEventListener('dragleave', () => {
    fileDropZone.classList.remove('dragover');
  });

  fileDropZone.addEventListener('drop', (e) => {
    e.preventDefault();
    fileDropZone.classList.remove('dragover');
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFile(e.dataTransfer.files[0]);
    }
  });

  filePicker.addEventListener('change', () => {
    if (filePicker.files && filePicker.files.length > 0) {
      handleFile(filePicker.files[0]);
    }
  });

  function formatBytes(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  function handleFile(file) {
    selectedFileName.textContent = file.name;
    selectedFileMeta.textContent = `${formatBytes(file.size)} • ${file.type || 'Binary / Unknown'}`;
    fileCard.style.display = 'flex';
    fileDropZone.style.display = 'none';

    const reader = new FileReader();
    reader.onload = (e) => {
      loadedFileBuffer = e.target.result;
      computeAllHashes();
    };
    reader.readAsArrayBuffer(file);
  }

  btnRemoveFile.addEventListener('click', () => {
    loadedFileBuffer = null;
    filePicker.value = '';
    fileCard.style.display = 'none';
    fileDropZone.style.display = 'block';
    computeAllHashes();
  });

  // HMAC Mode Toggle
  hmacToggle.addEventListener('change', () => {
    if (hmacToggle.checked) {
      hmacKeyGroup.style.display = 'flex';
      outputPanelTitle.textContent = 'Computed HMAC Hashes';
    } else {
      hmacKeyGroup.style.display = 'none';
      outputPanelTitle.textContent = 'Computed Hashes';
    }
    computeAllHashes();
  });

  hmacKey.addEventListener('input', computeAllHashes);
  optUppercase.addEventListener('change', computeAllHashes);
  hashTextInput.addEventListener('input', computeAllHashes);

  // Compute Hashes
  async function computeAllHashes() {
    let buffer;

    if (currentInputMode === 'text') {
      const text = hashTextInput.value;
      if (!text) {
        clearHashDisplay();
        return;
      }
      buffer = new TextEncoder().encode(text).buffer;
    } else {
      if (!loadedFileBuffer) {
        clearHashDisplay();
        return;
      }
      buffer = loadedFileBuffer;
    }

    const isHmac = hmacToggle.checked;
    const keyStr = hmacKey.value || '';
    const uppercase = optUppercase.checked;
    const keyBuffer = new TextEncoder().encode(keyStr);

    try {
      let sha256Bytes, sha512Bytes, sha384Bytes, sha1Bytes, md5Bytes;

      if (isHmac) {
        // SHA-256 HMAC
        const k256 = await crypto.subtle.importKey(
          'raw', keyBuffer, { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']
        );
        sha256Bytes = new Uint8Array(await crypto.subtle.sign('HMAC', k256, buffer));

        // SHA-512 HMAC
        const k512 = await crypto.subtle.importKey(
          'raw', keyBuffer, { name: 'HMAC', hash: 'SHA-512' }, false, ['sign']
        );
        sha512Bytes = new Uint8Array(await crypto.subtle.sign('HMAC', k512, buffer));

        // SHA-384 HMAC
        const k384 = await crypto.subtle.importKey(
          'raw', keyBuffer, { name: 'HMAC', hash: 'SHA-384' }, false, ['sign']
        );
        sha384Bytes = new Uint8Array(await crypto.subtle.sign('HMAC', k384, buffer));

        // SHA-1 HMAC
        const k1 = await crypto.subtle.importKey(
          'raw', keyBuffer, { name: 'HMAC', hash: 'SHA-1' }, false, ['sign']
        );
        sha1Bytes = new Uint8Array(await crypto.subtle.sign('HMAC', k1, buffer));

        // MD5 HMAC
        md5Bytes = hmacMd5(keyStr, new Uint8Array(buffer));
      } else {
        // Standard Hashing
        sha256Bytes = new Uint8Array(await crypto.subtle.digest('SHA-256', buffer));
        sha512Bytes = new Uint8Array(await crypto.subtle.digest('SHA-512', buffer));
        sha384Bytes = new Uint8Array(await crypto.subtle.digest('SHA-384', buffer));
        sha1Bytes = new Uint8Array(await crypto.subtle.digest('SHA-1', buffer));
        md5Bytes = md5(new Uint8Array(buffer));
      }

      currentComputedHashes['SHA-256'] = bytesToHex(sha256Bytes, uppercase);
      currentComputedHashes['SHA-512'] = bytesToHex(sha512Bytes, uppercase);
      currentComputedHashes['SHA-384'] = bytesToHex(sha384Bytes, uppercase);
      currentComputedHashes['SHA-1'] = bytesToHex(sha1Bytes, uppercase);
      currentComputedHashes['MD5'] = bytesToHex(md5Bytes, uppercase);

      setHashText(hashSha256, currentComputedHashes['SHA-256']);
      setHashText(hashSha512, currentComputedHashes['SHA-512']);
      setHashText(hashSha384, currentComputedHashes['SHA-384']);
      setHashText(hashSha1, currentComputedHashes['SHA-1']);
      setHashText(hashMd5, currentComputedHashes['MD5']);

      verifyChecksum();
    } catch (err) {
      console.error('Hashing error:', err);
    }
  }

  function setHashText(el, text) {
    el.textContent = text;
    el.classList.remove('empty');
  }

  function clearHashDisplay() {
    currentComputedHashes = {
      'SHA-256': '',
      'SHA-512': '',
      'SHA-384': '',
      'SHA-1': '',
      'MD5': ''
    };
    const emptyMsg = 'Enter text or drop a file to compute';
    [hashSha256, hashSha512, hashSha384, hashSha1, hashMd5].forEach(el => {
      el.textContent = emptyMsg;
      el.classList.add('empty');
    });
    verifyChecksum();
  }

  // Real-Time Verifier Logic
  function verifyChecksum() {
    const inputVal = (verifierInput.value || '').trim().toLowerCase();

    // Reset card matched styles
    [cardSha256, cardSha512, cardSha384, cardSha1, cardMd5].forEach(c => c.classList.remove('matched'));

    if (!inputVal) {
      verifierInput.className = 'form-input verifier-input';
      verifierFeedback.className = 'verifier-feedback neutral';
      verifierFeedback.innerHTML = '<span>ℹ Enter an expected hash value above to verify match.</span>';
      return;
    }

    let matchAlgo = null;
    let matchCard = null;

    const pairs = [
      { algo: 'SHA-256', val: currentComputedHashes['SHA-256'], card: cardSha256 },
      { algo: 'SHA-512', val: currentComputedHashes['SHA-512'], card: cardSha512 },
      { algo: 'SHA-384', val: currentComputedHashes['SHA-384'], card: cardSha384 },
      { algo: 'SHA-1', val: currentComputedHashes['SHA-1'], card: cardSha1 },
      { algo: 'MD5', val: currentComputedHashes['MD5'], card: cardMd5 }
    ];

    for (const p of pairs) {
      if (p.val && p.val.toLowerCase() === inputVal) {
        matchAlgo = p.algo;
        matchCard = p.card;
        break;
      }
    }

    if (matchAlgo) {
      verifierInput.className = 'form-input verifier-input match';
      verifierFeedback.className = 'verifier-feedback match';
      verifierFeedback.innerHTML = `✓ <strong>MATCH FOUND:</strong> Entered checksum matches <strong>${matchAlgo}</strong> hash exactly!`;
      if (matchCard) matchCard.classList.add('matched');
    } else {
      verifierInput.className = 'form-input verifier-input mismatch';
      verifierFeedback.className = 'verifier-feedback mismatch';
      verifierFeedback.innerHTML = `✗ <strong>HASH MISMATCH:</strong> Entered value does not match any currently computed hash algorithm.`;
    }
  }

  verifierInput.addEventListener('input', verifyChecksum);

  // Individual copy button handler
  document.querySelectorAll('.btn-copy-hash').forEach(btn => {
    btn.addEventListener('click', () => {
      const targetId = btn.dataset.target;
      const targetEl = document.getElementById(targetId);
      if (!targetEl || targetEl.classList.contains('empty')) return;
      const text = targetEl.textContent;

      navigator.clipboard.writeText(text).then(() => {
        const orig = btn.textContent;
        btn.textContent = 'Copied!';
        setTimeout(() => {
          btn.textContent = orig;
        }, 1500);
      });
    });
  });

  // Copy All button
  btnCopyAll.addEventListener('click', () => {
    const lines = [];
    const algos = ['SHA-256', 'SHA-512', 'SHA-384', 'SHA-1', 'MD5'];
    for (const a of algos) {
      if (currentComputedHashes[a]) {
        lines.push(`${a}: ${currentComputedHashes[a]}`);
      }
    }
    if (lines.length === 0) return;

    navigator.clipboard.writeText(lines.join('\n')).then(() => {
      const orig = btnCopyAll.innerHTML;
      btnCopyAll.innerHTML = '<span style="color: var(--success); font-weight: 700;">Copied All!</span>';
      setTimeout(() => {
        btnCopyAll.innerHTML = orig;
      }, 1500);
    });
  });

  // Sample Text
  btnSample.addEventListener('click', () => {
    setInputMode('text');
    hashTextInput.value = 'The quick brown fox jumps over the lazy dog';
    computeAllHashes();
  });

  // Clear
  btnClear.addEventListener('click', () => {
    hashTextInput.value = '';
    loadedFileBuffer = null;
    filePicker.value = '';
    fileCard.style.display = 'none';
    fileDropZone.style.display = 'block';
    verifierInput.value = '';
    clearHashDisplay();
    hashTextInput.focus();
  });

  // Initial demo hash
  hashTextInput.value = 'The quick brown fox jumps over the lazy dog';
  computeAllHashes();
});