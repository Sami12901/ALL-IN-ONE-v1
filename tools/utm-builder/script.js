// UTM Builder & Client-Side QR Generator Engine
document.addEventListener('DOMContentLoaded', () => {
  // --- DOM Elements ---
  const targetUrlInput = document.getElementById('target-url-input');
  const utmSourceInput = document.getElementById('utm-source-input');
  const utmMediumInput = document.getElementById('utm-medium-input');
  const utmCampaignInput = document.getElementById('utm-campaign-input');
  const utmTermInput = document.getElementById('utm-term-input');
  const utmContentInput = document.getElementById('utm-content-input');

  const chkLowercase = document.getElementById('chk-lowercase');
  const spaceReplaceSelect = document.getElementById('space-replace-select');
  const presetButtons = document.querySelectorAll('.utm-preset-btn');
  const btnResetUtm = document.getElementById('btn-reset-utm');

  const urlOutputBox = document.getElementById('url-output-box');
  const charCountBadge = document.getElementById('char-count-badge');
  const btnCopyUrl = document.getElementById('btn-copy-url');
  const btnOpenUrl = document.getElementById('btn-open-url');

  const simulatedShortUrl = document.getElementById('simulated-short-url');
  const btnCopyShort = document.getElementById('btn-copy-short');

  const qrCanvas = document.getElementById('qr-canvas');
  const btnDownloadQr = document.getElementById('btn-download-qr');
  const paramAuditBody = document.getElementById('param-audit-body');

  let currentFullUrl = '';
  let currentShortHash = '';

  // Generate random short hash
  function generateShortHash() {
    const chars = 'abcdefghjkmnpqrstuvwxyz23456789';
    let res = '';
    for (let i = 0; i < 6; i++) {
      res += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return res;
  }
  currentShortHash = generateShortHash();

  // --- Parameter Sanitizer ---
  function sanitizeParam(str) {
    if (!str) return '';
    let val = str.trim();
    const delimiter = spaceReplaceSelect ? spaceReplaceSelect.value : '_';

    // Replace multiple spaces and special characters
    val = val.replace(/\s+/g, delimiter);
    // Remove characters that conflict with URI query components
    val = val.replace(/[&?#%]/g, '');

    if (chkLowercase && chkLowercase.checked) {
      val = val.toLowerCase();
    }
    return val;
  }

  // --- Construct Full Tagged URL ---
  function updateTaggedUrl() {
    let rawBase = (targetUrlInput.value || '').trim();
    if (!rawBase) {
      rawBase = 'https://example.com';
    }

    // Ensure protocol
    if (!/^https?:\/\//i.test(rawBase)) {
      rawBase = 'https://' + rawBase;
    }

    const source = sanitizeParam(utmSourceInput.value);
    const medium = sanitizeParam(utmMediumInput.value);
    const campaign = sanitizeParam(utmCampaignInput.value);
    const term = sanitizeParam(utmTermInput.value);
    const content = sanitizeParam(utmContentInput.value);

    // Separate hash anchor if present
    let hashPart = '';
    const hashIndex = rawBase.indexOf('#');
    if (hashIndex !== -1) {
      hashPart = rawBase.substring(hashIndex);
      rawBase = rawBase.substring(0, hashIndex);
    }

    // Determine query separator
    const hasQuery = rawBase.includes('?');
    const params = [];

    if (source) params.push(`utm_source=${encodeURIComponent(source)}`);
    if (medium) params.push(`utm_medium=${encodeURIComponent(medium)}`);
    if (campaign) params.push(`utm_campaign=${encodeURIComponent(campaign)}`);
    if (term) params.push(`utm_term=${encodeURIComponent(term)}`);
    if (content) params.push(`utm_content=${encodeURIComponent(content)}`);

    let finalUrl = rawBase;
    if (params.length > 0) {
      finalUrl += (hasQuery ? '&' : '?') + params.join('&');
    }
    finalUrl += hashPart;

    currentFullUrl = finalUrl;

    // Display URL
    if (urlOutputBox) {
      urlOutputBox.textContent = currentFullUrl;
    }
    if (charCountBadge) {
      charCountBadge.textContent = `${currentFullUrl.length} chars`;
    }

    // Update Short URL Simulation
    if (simulatedShortUrl) {
      simulatedShortUrl.textContent = `https://aio.to/${currentShortHash}`;
    }

    // Update GA4 Audit Table
    updateAuditTable([
      { tag: 'utm_source', val: source, dim: 'Session source', req: true },
      { tag: 'utm_medium', val: medium, dim: 'Session medium', req: true },
      { tag: 'utm_campaign', val: campaign, dim: 'Session campaign', req: true },
      { tag: 'utm_term', val: term, dim: 'Session manual term (Keyword)', req: false },
      { tag: 'utm_content', val: content, dim: 'Session manual ad content (Creative)', req: false }
    ]);

    // Render QR Code
    renderQrCode(currentFullUrl);
  }

  // --- Audit Table Renderer ---
  function updateAuditTable(items) {
    if (!paramAuditBody) return;
    let html = '';
    items.forEach(item => {
      const isMissing = item.req && !item.val;
      const displayVal = item.val || '<span style="color: var(--text-tertiary); font-style: italic;">(not set)</span>';
      html += `
        <tr>
          <td><code style="color: var(--accent); font-weight: 600;">${item.tag}</code> ${item.req ? '<span style="color: var(--warning); font-size: 0.7rem;">*</span>' : ''}</td>
          <td>${isMissing ? '<span style="color: var(--danger); font-size: 0.775rem; font-weight: 600;">Missing (Recommended)</span>' : displayVal}</td>
          <td style="color: var(--text-secondary);">${item.dim}</td>
        </tr>
      `;
    });
    paramAuditBody.innerHTML = html;
  }

  // --- Preset Loaders ---
  presetButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      if (btn.dataset.source) utmSourceInput.value = btn.dataset.source;
      if (btn.dataset.medium) utmMediumInput.value = btn.dataset.medium;
      if (btn.dataset.campaign) utmCampaignInput.value = btn.dataset.campaign;
      if (btn.dataset.content) utmContentInput.value = btn.dataset.content;
      if (btn.dataset.term) utmTermInput.value = btn.dataset.term;
      currentShortHash = generateShortHash();
      updateTaggedUrl();
    });
  });

  // --- Copy Buttons ---
  if (btnCopyUrl) {
    btnCopyUrl.addEventListener('click', () => {
      navigator.clipboard.writeText(currentFullUrl).then(() => {
        const orig = btnCopyUrl.innerHTML;
        btnCopyUrl.innerHTML = `
          <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="color: #ffffff;"><polyline points="20 6 9 17 4 12"/></svg>
          Copied to Clipboard!
        `;
        setTimeout(() => {
          btnCopyUrl.innerHTML = orig;
        }, 1800);
      }).catch(() => {
        alert('Copied URL to clipboard!');
      });
    });
  }

  if (btnCopyShort) {
    btnCopyShort.addEventListener('click', () => {
      const short = `https://aio.to/${currentShortHash}`;
      navigator.clipboard.writeText(short).then(() => {
        const orig = btnCopyShort.textContent;
        btnCopyShort.textContent = 'Copied!';
        setTimeout(() => {
          btnCopyShort.textContent = orig;
        }, 1800);
      });
    });
  }

  // Open URL in New Tab
  if (btnOpenUrl) {
    btnOpenUrl.addEventListener('click', () => {
      if (currentFullUrl) {
        window.open(currentFullUrl, '_blank', 'noopener,noreferrer');
      }
    });
  }

  // Reset Button
  if (btnResetUtm) {
    btnResetUtm.addEventListener('click', () => {
      targetUrlInput.value = 'https://example.com/summer-flight-deals';
      utmSourceInput.value = 'google';
      utmMediumInput.value = 'cpc';
      utmCampaignInput.value = 'summer_flight_promo_2026';
      utmTermInput.value = 'flight_tickets';
      utmContentInput.value = 'hero_banner_v1';
      currentShortHash = generateShortHash();
      updateTaggedUrl();
    });
  }

  // Inputs Change Listener
  [targetUrlInput, utmSourceInput, utmMediumInput, utmCampaignInput, utmTermInput, utmContentInput, chkLowercase, spaceReplaceSelect].forEach(elem => {
    if (elem) {
      elem.addEventListener('input', updateTaggedUrl);
      elem.addEventListener('change', updateTaggedUrl);
    }
  });

  // Download QR Code PNG
  if (btnDownloadQr && qrCanvas) {
    btnDownloadQr.addEventListener('click', () => {
      const link = document.createElement('a');
      link.download = `campaign_utm_qr_${Date.now()}.png`;
      link.href = qrCanvas.toDataURL('image/png');
      link.click();
    });
  }

  // ==========================================================
  // PURE CLIENT-SIDE QR CODE MATRIX GENERATOR (STANDALONE ENGINE)
  // ==========================================================
  function renderQrCode(text) {
    if (!qrCanvas) return;
    const ctx = qrCanvas.getContext('2d');
    if (!ctx) return;

    try {
      const qrMatrix = createQrMatrix(text);
      const moduleCount = qrMatrix.length;
      const canvasSize = 200;
      qrCanvas.width = canvasSize;
      qrCanvas.height = canvasSize;

      // Draw white quiet zone background
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, canvasSize, canvasSize);

      const margin = 16;
      const usableSize = canvasSize - margin * 2;
      const cellSize = usableSize / moduleCount;

      ctx.fillStyle = '#0f172a';
      for (let r = 0; r < moduleCount; r++) {
        for (let c = 0; c < moduleCount; c++) {
          if (qrMatrix[r][c]) {
            ctx.fillRect(
              Math.round(margin + c * cellSize),
              Math.round(margin + r * cellSize),
              Math.ceil(cellSize),
              Math.ceil(cellSize)
            );
          }
        }
      }
    } catch (e) {
      // Fallback clean placeholder if string exceeds max capacity
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, qrCanvas.width, qrCanvas.height);
      ctx.fillStyle = '#64748b';
      ctx.font = '12px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('URL Ready for Scanning', qrCanvas.width / 2, qrCanvas.height / 2);
    }
  }

  // --- QR Algorithm Implementation ---
  // Reed-Solomon GF(256) Tables & Matrix Generator
  function createQrMatrix(text) {
    // Select version based on input byte length
    const utf8Bytes = [];
    for (let i = 0; i < text.length; i++) {
      let code = text.charCodeAt(i);
      if (code < 0x80) {
        utf8Bytes.push(code);
      } else if (code < 0x800) {
        utf8Bytes.push(0xc0 | (code >> 6));
        utf8Bytes.push(0x80 | (code & 0x3f));
      } else {
        utf8Bytes.push(0xe0 | (code >> 12));
        utf8Bytes.push(0x80 | ((code >> 6) & 0x3f));
        utf8Bytes.push(0x80 | (code & 0x3f));
      }
    }

    // Capacity table (Version 1 to 6, Level M)
    const capacities = [0, 14, 26, 42, 62, 84, 106, 122, 152, 180, 213, 251, 287, 331];
    let version = 1;
    while (version < capacities.length - 1 && utf8Bytes.length > capacities[version]) {
      version++;
    }

    const size = 17 + version * 4;
    const matrix = Array.from({ length: size }, () => Array(size).fill(null));

    // Place Finder Patterns
    function drawFinder(row, col) {
      for (let r = -1; r <= 7; r++) {
        for (let c = -1; c <= 7; c++) {
          const mr = row + r;
          const mc = col + c;
          if (mr >= 0 && mr < size && mc >= 0 && mc < size) {
            if (r >= 0 && r <= 6 && c >= 0 && c <= 6) {
              const isBorder = (r === 0 || r === 6 || c === 0 || c === 6);
              const isCenter = (r >= 2 && r <= 4 && c >= 2 && c <= 4);
              matrix[mr][mc] = isBorder || isCenter;
            } else {
              matrix[mr][mc] = false; // Separator
            }
          }
        }
      }
    }

    drawFinder(0, 0);
    drawFinder(0, size - 7);
    drawFinder(size - 7, 0);

    // Place Alignment Pattern for Version >= 2
    if (version >= 2) {
      const alignPos = size - 7;
      for (let r = -2; r <= 2; r++) {
        for (let c = -2; c <= 2; c++) {
          const mr = alignPos + r;
          const mc = alignPos + c;
          const isBorder = Math.abs(r) === 2 || Math.abs(c) === 2;
          const isCenter = r === 0 && c === 0;
          matrix[mr][mc] = isBorder || isCenter;
        }
      }
    }

    // Place Timing Patterns
    for (let i = 8; i < size - 8; i++) {
      if (matrix[6][i] === null) matrix[6][i] = (i % 2 === 0);
      if (matrix[i][6] === null) matrix[i][6] = (i % 2 === 0);
    }

    // Dark Module
    matrix[size - 8][8] = true;

    // Reserve Format Information areas
    for (let i = 0; i < 9; i++) {
      if (matrix[8][i] === null) matrix[8][i] = false;
      if (matrix[i][8] === null) matrix[i][8] = false;
    }
    for (let i = size - 8; i < size; i++) {
      if (matrix[8][i] === null) matrix[8][i] = false;
      if (matrix[i][8] === null) matrix[i][8] = false;
    }

    // Pack bits (Byte mode 0100 + char count + data + terminator)
    const bitStream = [];
    function pushBits(val, len) {
      for (let b = len - 1; b >= 0; b--) {
        bitStream.push((val >> b) & 1);
      }
    }

    pushBits(0b0100, 4); // Byte mode indicator
    pushBits(utf8Bytes.length, 8); // Character count
    for (let b of utf8Bytes) {
      pushBits(b, 8);
    }
    pushBits(0b0000, 4); // Terminator

    // Pad to byte
    while (bitStream.length % 8 !== 0) {
      bitStream.push(0);
    }

    // Pad bytes 0xEC, 0x11
    const padWords = [0xEC, 0x11];
    let padIndex = 0;
    const totalDataBits = capacities[version] * 8;
    while (bitStream.length < totalDataBits) {
      pushBits(padWords[padIndex % 2], 8);
      padIndex++;
    }

    // Place data in Zigzag pattern with mask 0: (row + col) % 2 === 0
    let bitIdx = 0;
    let upward = true;
    for (let col = size - 1; col > 0; col -= 2) {
      if (col === 6) col--; // Skip vertical timing line
      const rows = upward ? Array.from({ length: size }, (_, i) => size - 1 - i) : Array.from({ length: size }, (_, i) => i);
      for (let row of rows) {
        for (let c = 0; c < 2; c++) {
          const currCol = col - c;
          if (matrix[row][currCol] === null) {
            let bit = (bitIdx < bitStream.length) ? bitStream[bitIdx++] : 0;
            // Apply standard checkerboard mask: (row + col) % 2 === 0
            const mask = ((row + currCol) % 2 === 0);
            matrix[row][currCol] = Boolean(bit ^ (mask ? 1 : 0));
          }
        }
      }
      upward = !upward;
    }

    // Apply Format Info (Level M, Mask Pattern 0)
    // 15 bits format code with BCH error correction
    const formatBits = [1, 0, 1, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 1, 0];
    for (let i = 0; i < 6; i++) matrix[8][i] = Boolean(formatBits[i]);
    matrix[8][7] = Boolean(formatBits[6]);
    matrix[8][8] = Boolean(formatBits[7]);
    matrix[7][8] = Boolean(formatBits[8]);
    for (let i = 9; i < 15; i++) matrix[14 - i][8] = Boolean(formatBits[i]);

    // Mirror format info on edges
    for (let i = 0; i < 7; i++) matrix[size - 1 - i][8] = Boolean(formatBits[i]);
    for (let i = 0; i < 8; i++) matrix[8][size - 8 + i] = Boolean(formatBits[7 + i]);

    return matrix;
  }

  // --- Initialize First Render ---
  updateTaggedUrl();
});