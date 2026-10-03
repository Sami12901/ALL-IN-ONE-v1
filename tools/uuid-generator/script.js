// UUID/GUID Generator Logic
// Supports RFC 4122 (v4 Random, v1 Timestamp) and RFC 9562 (v7 Time-ordered)

// V1 State
let v1ClockSeq = Math.floor(Math.random() * 0x3fff);
let lastV1Time = 0n;
const v1Node = new Uint8Array(6);
crypto.getRandomValues(v1Node);
v1Node[0] |= 0x01; // Multicast bit for randomized node ID

document.addEventListener('DOMContentLoaded', () => {
  // Elements
  const cardV4 = document.getElementById('card-v4');
  const cardV7 = document.getElementById('card-v7');
  const cardV1 = document.getElementById('card-v1');
  const versionCards = [cardV4, cardV7, cardV1];

  const qtyButtons = document.querySelectorAll('.qty-btn');
  const formatCase = document.getElementById('format-case');
  const optHyphens = document.getElementById('opt-hyphens');
  const optBraces = document.getElementById('opt-braces');
  const formatQuotes = document.getElementById('format-quotes');
  const btnGenerate = document.getElementById('btn-generate');

  const uuidResultsList = document.getElementById('uuid-results-list');
  const resultsCountBadge = document.getElementById('results-count-badge');
  const btnCopyAll = document.getElementById('btn-copy-all');
  const btnDownloadTxt = document.getElementById('btn-download-txt');
  const btnClearList = document.getElementById('btn-clear-list');

  const anatomyDisplay = document.getElementById('anatomy-display');
  const lblP1 = document.getElementById('lbl-p1');
  const lblP2 = document.getElementById('lbl-p2');
  const lblVer = document.getElementById('lbl-ver');
  const lblP3 = document.getElementById('lbl-p3');

  let currentVersion = 'v4';
  let currentQuantity = 5;
  let generatedUUIDs = [];

  // Version 4: Cryptographically random (RFC 4122)
  function generateRawV4() {
    const bytes = new Uint8Array(16);
    crypto.getRandomValues(bytes);
    bytes[6] = (bytes[6] & 0x0f) | 0x40; // Version 4
    bytes[8] = (bytes[8] & 0x3f) | 0x80; // Variant 10xx
    return bytes;
  }

  // Version 7: Time-ordered Unix epoch milliseconds (RFC 9562)
  function generateRawV7() {
    const bytes = new Uint8Array(16);
    crypto.getRandomValues(bytes);
    const now = Date.now();
    // 48-bit timestamp in milliseconds
    bytes[0] = Math.floor(now / 0x10000000000) & 0xff;
    bytes[1] = Math.floor(now / 0x100000000) & 0xff;
    bytes[2] = Math.floor(now / 0x1000000) & 0xff;
    bytes[3] = Math.floor(now / 0x10000) & 0xff;
    bytes[4] = Math.floor(now / 0x100) & 0xff;
    bytes[5] = now & 0xff;
    // Version 7
    bytes[6] = (bytes[6] & 0x0f) | 0x70;
    // Variant 10xx
    bytes[8] = (bytes[8] & 0x3f) | 0x80;
    return bytes;
  }

  // Version 1: 60-bit 100ns Gregorian timestamp (RFC 4122)
  function generateRawV1() {
    const nowMs = BigInt(Date.now());
    let nsecs = nowMs * 10000n + 122192928000000000n;
    if (nsecs <= lastV1Time) {
      v1ClockSeq = (v1ClockSeq + 1) & 0x3fff;
    }
    lastV1Time = nsecs;

    const timeLow = Number(nsecs & 0xffffffffn);
    const timeMid = Number((nsecs >> 32n) & 0xffffn);
    const timeHi = Number((nsecs >> 48n) & 0x0fffn) | 0x1000; // Version 1
    const clockSeqHi = ((v1ClockSeq >> 8) & 0x3f) | 0x80; // Variant
    const clockSeqLow = v1ClockSeq & 0xff;

    const bytes = new Uint8Array(16);
    bytes[0] = (timeLow >>> 24) & 0xff;
    bytes[1] = (timeLow >>> 16) & 0xff;
    bytes[2] = (timeLow >>> 8) & 0xff;
    bytes[3] = timeLow & 0xff;
    bytes[4] = (timeMid >>> 8) & 0xff;
    bytes[5] = timeMid & 0xff;
    bytes[6] = (timeHi >>> 8) & 0xff;
    bytes[7] = timeHi & 0xff;
    bytes[8] = clockSeqHi;
    bytes[9] = clockSeqLow;
    bytes.set(v1Node, 10);
    return bytes;
  }

  function bytesToHex(bytes) {
    let hex = '';
    for (let i = 0; i < 16; i++) {
      hex += bytes[i].toString(16).padStart(2, '0');
    }
    return hex;
  }

  // Format options application
  function formatUUID(rawHex, options) {
    let str = rawHex;
    if (options.hyphens) {
      str = `${str.slice(0, 8)}-${str.slice(8, 12)}-${str.slice(12, 16)}-${str.slice(16, 20)}-${str.slice(20, 32)}`;
    }
    if (options.casing === 'upper') {
      str = str.toUpperCase();
    } else {
      str = str.toLowerCase();
    }
    if (options.braces) {
      str = `{${str}}`;
    }
    if (options.quotes === 'double') {
      str = `"${str}"`;
    } else if (options.quotes === 'single') {
      str = `'${str}'`;
    }
    return str;
  }

  function getFormatOptions() {
    return {
      hyphens: optHyphens.checked,
      casing: formatCase.value,
      braces: optBraces.checked,
      quotes: formatQuotes.value
    };
  }

  // Generate UUID list
  function generateUUIDs() {
    const options = getFormatOptions();
    generatedUUIDs = [];

    let firstRawHex = '';

    for (let i = 0; i < currentQuantity; i++) {
      let rawBytes;
      if (currentVersion === 'v7') {
        rawBytes = generateRawV7();
      } else if (currentVersion === 'v1') {
        rawBytes = generateRawV1();
      } else {
        rawBytes = generateRawV4();
      }
      const rawHex = bytesToHex(rawBytes);
      if (i === 0) firstRawHex = rawHex;
      const formatted = formatUUID(rawHex, options);
      generatedUUIDs.push({ raw: rawHex, formatted });
    }

    renderResults();
    updateAnatomy(firstRawHex);
  }

  // Render results in DOM
  function renderResults() {
    resultsCountBadge.textContent = `${generatedUUIDs.length} Generated (${currentVersion.toUpperCase()})`;

    if (generatedUUIDs.length === 0) {
      uuidResultsList.innerHTML = '<div style="text-align: center; color: var(--text-tertiary); padding: 2rem;">No UUIDs generated. Click Generate UUIDs above.</div>';
      return;
    }

    uuidResultsList.innerHTML = generatedUUIDs.map((item, index) => `
      <div class="uuid-item">
        <span class="uuid-index">#${index + 1}</span>
        <span class="uuid-string" title="Click to copy">${escapeHtml(item.formatted)}</span>
        <button class="btn-item-copy" type="button" data-index="${index}" title="Copy this UUID">Copy</button>
      </div>
    `).join('');
  }

  // Update Anatomy Inspector Breakdown
  function updateAnatomy(hex) {
    if (!hex || hex.length !== 32) return;
    const isUpper = formatCase.value === 'upper';
    const h = isUpper ? hex.toUpperCase() : hex.toLowerCase();

    const p1 = h.slice(0, 8);
    const p2 = h.slice(8, 12);
    const ver = h.slice(12, 13);
    const p3 = h.slice(13, 16);
    const variant = h.slice(16, 17);
    const p4 = h.slice(17, 20);
    const p5 = h.slice(20, 32);

    anatomyDisplay.innerHTML = `
      <span class="anatomy-part part-time-low" title="High 32 bits">${p1}</span>-
      <span class="anatomy-part part-time-mid" title="Middle 16 bits">${p2}</span>-
      <span class="anatomy-part part-ver" title="Version">${ver}</span><span>${p3}</span>-
      <span class="anatomy-part part-var" title="Variant">${variant}</span><span>${p4}</span>-
      <span class="anatomy-part part-node" title="Node / Rand">${p5}</span>
    `;

    lblVer.textContent = ver;

    if (currentVersion === 'v7') {
      lblP1.textContent = 'unix_ts_ms (high 32)';
      lblP2.textContent = 'unix_ts_ms (low 16)';
      lblP3.textContent = 'rand_b (62 bits)';
    } else if (currentVersion === 'v1') {
      lblP1.textContent = 'time_low (32 bits)';
      lblP2.textContent = 'time_mid (16 bits)';
      lblP3.textContent = 'node MAC (48 bits)';
    } else {
      lblP1.textContent = 'random (32 bits)';
      lblP2.textContent = 'random (16 bits)';
      lblP3.textContent = 'random (48 bits)';
    }
  }

  function escapeHtml(str) {
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  // Version Selector clicks
  versionCards.forEach(card => {
    card.addEventListener('click', () => {
      versionCards.forEach(c => c.classList.remove('active'));
      card.classList.add('active');
      currentVersion = card.dataset.version;
      generateUUIDs();
    });
  });

  // Quantity clicks
  qtyButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      qtyButtons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentQuantity = parseInt(btn.dataset.qty, 10);
      generateUUIDs();
    });
  });

  // Formatting changes trigger re-generation or re-format
  formatCase.addEventListener('change', generateUUIDs);
  optHyphens.addEventListener('change', generateUUIDs);
  optBraces.addEventListener('change', generateUUIDs);
  formatQuotes.addEventListener('change', generateUUIDs);
  btnGenerate.addEventListener('click', generateUUIDs);

  // Individual copy click delegation
  uuidResultsList.addEventListener('click', (e) => {
    const copyBtn = e.target.closest('.btn-item-copy');
    const uuidStr = e.target.closest('.uuid-string');

    let textToCopy = '';
    let btnToUpdate = null;

    if (copyBtn) {
      const idx = parseInt(copyBtn.dataset.index, 10);
      textToCopy = generatedUUIDs[idx]?.formatted;
      btnToUpdate = copyBtn;
    } else if (uuidStr) {
      const item = uuidStr.closest('.uuid-item');
      btnToUpdate = item.querySelector('.btn-item-copy');
      textToCopy = uuidStr.textContent.trim();
    }

    if (textToCopy && btnToUpdate) {
      navigator.clipboard.writeText(textToCopy).then(() => {
        btnToUpdate.textContent = 'Copied!';
        btnToUpdate.classList.add('copied');
        setTimeout(() => {
          btnToUpdate.textContent = 'Copy';
          btnToUpdate.classList.remove('copied');
        }, 1500);
      });
    }
  });

  // Master Copy All
  btnCopyAll.addEventListener('click', () => {
    if (generatedUUIDs.length === 0) return;
    const allText = generatedUUIDs.map(u => u.formatted).join('\n');
    navigator.clipboard.writeText(allText).then(() => {
      const orig = btnCopyAll.innerHTML;
      btnCopyAll.innerHTML = '<span style="color: var(--success); font-weight: 700;">Copied All!</span>';
      setTimeout(() => {
        btnCopyAll.innerHTML = orig;
      }, 1600);
    });
  });

  // Download .txt
  btnDownloadTxt.addEventListener('click', () => {
    if (generatedUUIDs.length === 0) return;
    const allText = generatedUUIDs.map(u => u.formatted).join('\n');
    const blob = new Blob([allText], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `uuids_${currentVersion}_${generatedUUIDs.length}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  });

  // Clear
  btnClearList.addEventListener('click', () => {
    generatedUUIDs = [];
    renderResults();
    anatomyDisplay.innerHTML = '<span style="color: var(--text-tertiary);">Generate UUIDs to inspect bits...</span>';
  });

  // Initialize
  generateUUIDs();
});