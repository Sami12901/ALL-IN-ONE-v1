// SVG to PNG Converter — Professional Client-Side Rasterizer

document.addEventListener('DOMContentLoaded', () => {
  // DOM References
  const tabFileBtn = document.getElementById('tab-file-btn');
  const tabCodeBtn = document.getElementById('tab-code-btn');
  const panelFile = document.getElementById('panel-file');
  const panelCode = document.getElementById('panel-code');
  const clearAllBtn = document.getElementById('clear-all-btn');

  const dropZone = document.getElementById('drop-zone');
  const fileInput = document.getElementById('file-input');
  const svgTextarea = document.getElementById('svg-textarea');
  const charCount = document.getElementById('char-count');

  const sampleButtons = document.querySelectorAll('.stp-sample-btn');
  const presetButtons = document.querySelectorAll('.stp-res-btn');
  const dimWidthInput = document.getElementById('dim-width');
  const dimHeightInput = document.getElementById('dim-height');
  const aspectLockBtn = document.getElementById('aspect-lock-btn');
  const lockIcon = document.getElementById('lock-icon');
  const aspectRatioLabel = document.getElementById('aspect-ratio-label');

  const bgButtons = document.querySelectorAll('.stp-bg-btn');
  const customColorRow = document.getElementById('custom-color-row');
  const customColorPicker = document.getElementById('custom-color-picker');
  const customColorText = document.getElementById('custom-color-text');
  const customColorChip = document.getElementById('custom-color-chip');

  const stageViewport = document.getElementById('stage-viewport');
  const stagePlaceholder = document.getElementById('stage-placeholder');
  const canvasWrapper = document.getElementById('canvas-wrapper');
  const previewCanvas = document.getElementById('preview-canvas');

  const badgeSourceDim = document.getElementById('badge-source-dim');
  const badgeTargetDim = document.getElementById('badge-target-dim');
  const badgePngSize = document.getElementById('badge-png-size');

  const zoomSlider = document.getElementById('zoom-slider');
  const zoomValue = document.getElementById('zoom-value');
  const zoomInBtn = document.getElementById('zoom-in-btn');
  const zoomOutBtn = document.getElementById('zoom-out-btn');
  const zoomFitBtn = document.getElementById('zoom-fit-btn');

  const copyPngBtn = document.getElementById('copy-png-btn');
  const downloadBtn = document.getElementById('download-btn');
  const downloadAnchor = document.getElementById('download-anchor');
  const toast = document.getElementById('stp-toast');

  // Application State
  let currentSvgRaw = '';
  let sourceFileName = 'vector_export';
  let baseWidth = 512;
  let baseHeight = 512;
  let currentMultiplier = 1;
  let isAspectLocked = true;
  let aspectRatio = 1;
  let currentBg = 'transparent'; // 'transparent' | '#ffffff' | '#000000' | custom hex
  let currentZoom = 100;
  let currentBlob = null;
  let renderDebounceTimer = null;
  let isUpdatingDims = false;

  // ─── SAMPLE SVGs ───────────────────────────────────────────
  const SAMPLES = {
    'app-icon': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512">
  <defs>
    <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#0f172a" />
      <stop offset="50%" stop-color="#1e1b4b" />
      <stop offset="100%" stop-color="#311042" />
    </linearGradient>
    <linearGradient id="rocketGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#60a5fa" />
      <stop offset="100%" stop-color="#a855f7" />
    </linearGradient>
    <linearGradient id="flameGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#fbbf24" />
      <stop offset="100%" stop-color="#ef4444" />
    </linearGradient>
    <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
      <feGaussianBlur stdDeviation="12" result="blur" />
      <feComposite in="SourceGraphic" in2="blur" operator="over" />
    </filter>
  </defs>
  <!-- Squircle Base -->
  <rect x="32" y="32" width="448" height="448" rx="104" fill="url(#bgGrad)" stroke="rgba(255,255,255,0.15)" stroke-width="4"/>
  <!-- Ambient Orbit Rings -->
  <circle cx="256" cy="256" r="160" fill="none" stroke="rgba(168,85,247,0.2)" stroke-width="2" stroke-dasharray="10 10"/>
  <circle cx="256" cy="256" r="120" fill="none" stroke="rgba(96,165,250,0.25)" stroke-width="1.5"/>
  <!-- Rocket Exhaust Flames -->
  <path d="M210 320 C190 380, 230 420, 256 430 C282 420, 322 380, 302 320 Z" fill="url(#flameGrad)" filter="url(#glow)"/>
  <path d="M230 330 C220 370, 245 395, 256 405 C267 395, 292 370, 282 330 Z" fill="#ffffff" opacity="0.9"/>
  <!-- Rocket Ship Fuselage -->
  <path d="M256 100 C210 170, 210 270, 220 320 L292 320 C302 270, 302 170, 256 100 Z" fill="url(#rocketGrad)"/>
  <!-- Wings / Fins -->
  <path d="M220 280 L160 330 L185 360 L220 325 Z" fill="#3b82f6"/>
  <path d="M292 280 L352 330 L327 360 L292 325 Z" fill="#9333ea"/>
  <!-- Cabin Porthole -->
  <circle cx="256" cy="210" r="32" fill="#0f172a" stroke="#ffffff" stroke-width="5"/>
  <circle cx="256" cy="210" r="22" fill="#38bdf8"/>
  <circle cx="264" cy="202" r="7" fill="#ffffff" opacity="0.8"/>
  <!-- Twinkling Stars -->
  <polygon points="130,150 134,162 146,166 134,170 130,182 126,170 114,166 126,162" fill="#ffffff" opacity="0.85"/>
  <polygon points="380,180 383,189 392,192 383,195 380,204 377,195 368,192 377,189" fill="#facc15" opacity="0.9"/>
  <polygon points="340,110 342,116 348,118 342,120 340,126 338,120 332,118 338,116" fill="#38bdf8" opacity="0.75"/>
</svg>`,

    'vector-logo': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 600" width="600" height="600">
  <defs>
    <linearGradient id="gemL" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#06b6d4" />
      <stop offset="100%" stop-color="#3b82f6" />
    </linearGradient>
    <linearGradient id="gemR" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#6366f1" />
      <stop offset="100%" stop-color="#a855f7" />
    </linearGradient>
    <linearGradient id="gemTop" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#38bdf8" />
      <stop offset="100%" stop-color="#c084fc" />
    </linearGradient>
    <linearGradient id="gemBottom" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#1d4ed8" />
      <stop offset="100%" stop-color="#7e22ce" />
    </linearGradient>
  </defs>
  <!-- Background Glow Aura -->
  <circle cx="300" cy="300" r="230" fill="#3b82f6" opacity="0.08"/>
  <!-- Outer Hexagonal Frame -->
  <polygon points="300,70 490,180 490,420 300,530 110,420 110,180" fill="none" stroke="rgba(255,255,255,0.12)" stroke-width="4"/>
  <polygon points="300,95 470,195 470,405 300,505 130,405 130,195" fill="none" stroke="url(#gemL)" stroke-width="2" opacity="0.6"/>
  <!-- Central Faceted Crystal Gem -->
  <polygon points="300,140 440,240 300,340 160,240" fill="url(#gemTop)"/>
  <polygon points="160,240 300,340 300,480 160,380" fill="url(#gemL)"/>
  <polygon points="440,240 300,340 300,480 440,380" fill="url(#gemR)"/>
  <polygon points="300,340 440,380 300,480 160,380" fill="url(#gemBottom)" opacity="0.75"/>
  <!-- Light Reflections -->
  <polygon points="300,140 370,190 300,240 230,190" fill="#ffffff" opacity="0.35"/>
  <line x1="300" y1="140" x2="300" y2="480" stroke="#ffffff" stroke-width="2.5" opacity="0.5"/>
</svg>`,

    'geometric-art': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 800" width="800" height="800">
  <defs>
    <radialGradient id="artGlow" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#f43f5e" stop-opacity="0.8"/>
      <stop offset="40%" stop-color="#8b5cf6" stop-opacity="0.5"/>
      <stop offset="70%" stop-color="#06b6d4" stop-opacity="0.3"/>
      <stop offset="100%" stop-color="#000000" stop-opacity="0"/>
    </radialGradient>
  </defs>
  <!-- Background Aura -->
  <rect width="800" height="800" fill="#090a10"/>
  <circle cx="400" cy="400" r="380" fill="url(#artGlow)"/>
  <!-- Concentric Polygonal Stars -->
  <g transform="translate(400,400)" stroke-width="2">
    <!-- Layer 1 -->
    <g stroke="#38bdf8" fill="none" opacity="0.5">
      <polygon points="0,-320 226,-226 320,0 226,226 0,320 -226,226 -320,0 -226,-226" transform="rotate(0)"/>
      <polygon points="0,-320 226,-226 320,0 226,226 0,320 -226,226 -320,0 -226,-226" transform="rotate(22.5)"/>
      <polygon points="0,-320 226,-226 320,0 226,226 0,320 -226,226 -320,0 -226,-226" transform="rotate(45)"/>
      <polygon points="0,-320 226,-226 320,0 226,226 0,320 -226,226 -320,0 -226,-226" transform="rotate(67.5)"/>
    </g>
    <!-- Layer 2 -->
    <g stroke="#ec4899" fill="rgba(236,72,153,0.05)">
      <polygon points="0,-240 170,-170 240,0 170,170 0,240 -170,170 -240,0 -170,-170" transform="rotate(11.25)"/>
      <polygon points="0,-240 170,-170 240,0 170,170 0,240 -170,170 -240,0 -170,-170" transform="rotate(33.75)"/>
      <polygon points="0,-240 170,-170 240,0 170,170 0,240 -170,170 -240,0 -170,-170" transform="rotate(56.25)"/>
      <polygon points="0,-240 170,-170 240,0 170,170 0,240 -170,170 -240,0 -170,-170" transform="rotate(78.75)"/>
    </g>
    <!-- Layer 3 -->
    <g stroke="#f59e0b" fill="rgba(245,158,11,0.08)">
      <circle r="150" stroke="#f59e0b" stroke-width="2"/>
      <polygon points="0,-150 130,-75 130,75 0,150 -130,75 -130,-75"/>
      <polygon points="0,-150 130,-75 130,75 0,150 -130,75 -130,-75" transform="rotate(30)"/>
      <polygon points="0,-150 130,-75 130,75 0,150 -130,75 -130,-75" transform="rotate(60)"/>
    </g>
    <!-- Center Core -->
    <circle r="60" fill="#6366f1" stroke="#ffffff" stroke-width="3"/>
    <circle r="30" fill="#ffffff" opacity="0.9"/>
  </g>
</svg>`
  };

  // ─── TAB SWITCHING ───────────────────────────────────────────
  function switchTab(mode) {
    if (mode === 'file') {
      tabFileBtn.classList.add('active');
      tabCodeBtn.classList.remove('active');
      tabFileBtn.setAttribute('aria-selected', 'true');
      tabCodeBtn.setAttribute('aria-selected', 'false');
      panelFile.style.display = 'block';
      panelCode.style.display = 'none';
    } else {
      tabCodeBtn.classList.add('active');
      tabFileBtn.classList.remove('active');
      tabCodeBtn.setAttribute('aria-selected', 'true');
      tabFileBtn.setAttribute('aria-selected', 'false');
      panelCode.style.display = 'block';
      panelFile.style.display = 'none';
    }
  }

  tabFileBtn.addEventListener('click', () => switchTab('file'));
  tabCodeBtn.addEventListener('click', () => switchTab('code'));

  // ─── DRAG & DROP & FILE SELECTION ───────────────────────────
  dropZone.addEventListener('click', () => fileInput.click());

  ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(ev => {
    dropZone.addEventListener(ev, e => {
      e.preventDefault();
      e.stopPropagation();
    });
  });

  ['dragenter', 'dragover'].forEach(ev => {
    dropZone.addEventListener(ev, () => dropZone.classList.add('dragover'));
  });

  ['dragleave', 'drop'].forEach(ev => {
    dropZone.addEventListener(ev, () => dropZone.classList.remove('dragover'));
  });

  dropZone.addEventListener('drop', e => {
    const files = e.dataTransfer.files;
    if (files.length > 0) handleFile(files[0]);
  });

  fileInput.addEventListener('change', () => {
    if (fileInput.files.length > 0) handleFile(fileInput.files[0]);
  });

  function handleFile(file) {
    if (!file) return;
    if (!file.name.toLowerCase().endsWith('.svg') && file.type !== 'image/svg+xml') {
      showToast('Please upload a valid SVG file (.svg)');
      return;
    }

    sourceFileName = file.name.replace(/\.[^/.]+$/, '');
    const reader = new FileReader();
    reader.onload = e => {
      const svgContent = e.target.result;
      setSvgContent(svgContent, sourceFileName);
      showToast(`Loaded ${file.name}`);
    };
    reader.readAsText(file);
  }

  // ─── SAMPLE BUTTONS ──────────────────────────────────────────
  sampleButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const sampleKey = btn.getAttribute('data-sample');
      if (SAMPLES[sampleKey]) {
        sourceFileName = sampleKey;
        setSvgContent(SAMPLES[sampleKey], sampleKey);
        showToast(`Loaded "${btn.textContent.trim()}" sample`);
      }
    });
  });

  // ─── CODE EDITOR INPUT ───────────────────────────────────────
  svgTextarea.addEventListener('input', () => {
    charCount.textContent = `${svgTextarea.value.length.toLocaleString()} chars`;
    debouncedRender();
  });

  function debouncedRender() {
    clearTimeout(renderDebounceTimer);
    renderDebounceTimer = setTimeout(() => {
      const code = svgTextarea.value.trim();
      if (code) {
        parseAndScheduleRasterize(code);
      }
    }, 300);
  }

  function setSvgContent(svgString, name = 'vector_export') {
    currentSvgRaw = svgString;
    sourceFileName = name;
    svgTextarea.value = svgString;
    charCount.textContent = `${svgString.length.toLocaleString()} chars`;
    parseAndScheduleRasterize(svgString);
  }

  // ─── SVG PARSER & DIMENSION EXTRACTION ──────────────────────
  function parseAndScheduleRasterize(svgString) {
    if (!svgString || !svgString.trim()) {
      showPlaceholder();
      return;
    }

    try {
      const parser = new DOMParser();
      const doc = parser.parseFromString(svgString, 'image/svg+xml');
      const parserError = doc.querySelector('parsererror');
      if (parserError) {
        showToast('SVG XML syntax error in code. Please check markup.');
        return;
      }

      const svgEl = doc.querySelector('svg');
      if (!svgEl) {
        showToast('No <svg> root element found.');
        return;
      }

      // Extract Base Dimensions
      let parsedWidth = 0;
      let parsedHeight = 0;

      const attrWidth = svgEl.getAttribute('width');
      const attrHeight = svgEl.getAttribute('height');
      const viewBox = svgEl.getAttribute('viewBox');

      if (attrWidth && !attrWidth.includes('%')) {
        parsedWidth = parseFloat(attrWidth);
      }
      if (attrHeight && !attrHeight.includes('%')) {
        parsedHeight = parseFloat(attrHeight);
      }

      if ((!parsedWidth || !parsedHeight) && viewBox) {
        const parts = viewBox.trim().split(/[\s,]+/).map(parseFloat);
        if (parts.length === 4 && parts[2] > 0 && parts[3] > 0) {
          if (!parsedWidth) parsedWidth = parts[2];
          if (!parsedHeight) parsedHeight = parts[3];
        }
      }

      // Sensible fallbacks
      if (!parsedWidth || isNaN(parsedWidth) || parsedWidth <= 0) parsedWidth = 512;
      if (!parsedHeight || isNaN(parsedHeight) || parsedHeight <= 0) parsedHeight = 512;

      baseWidth = Math.round(parsedWidth);
      baseHeight = Math.round(parsedHeight);
      aspectRatio = baseWidth / baseHeight;

      // Update Aspect Ratio Label
      aspectRatioLabel.textContent = `Aspect ${(aspectRatio >= 1 ? (aspectRatio).toFixed(2) + ':1' : '1:' + (1 / aspectRatio).toFixed(2))}`;

      // Update target inputs according to current multiplier
      updateTargetDimensionsFromMultiplier();

      // Rasterize onto canvas
      rasterizeSvg();

    } catch (err) {
      console.error('SVG Parsing Error:', err);
      showToast('Error parsing SVG content.');
    }
  }

  function updateTargetDimensionsFromMultiplier() {
    isUpdatingDims = true;
    const targetW = Math.round(baseWidth * currentMultiplier);
    const targetH = Math.round(baseHeight * currentMultiplier);
    dimWidthInput.value = targetW;
    dimHeightInput.value = targetH;
    badgeSourceDim.textContent = `SVG: ${baseWidth} × ${baseHeight}`;
    badgeTargetDim.textContent = `PNG: ${targetW} × ${targetH}`;
    isUpdatingDims = false;
  }

  // ─── RESOLUTION PRESETS & ASPECT LOCK ────────────────────────
  presetButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      presetButtons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentMultiplier = parseFloat(btn.getAttribute('data-scale')) || 1;
      updateTargetDimensionsFromMultiplier();
      rasterizeSvg();
    });
  });

  aspectLockBtn.addEventListener('click', () => {
    isAspectLocked = !isAspectLocked;
    if (isAspectLocked) {
      aspectLockBtn.classList.add('locked');
      aspectLockBtn.title = 'Aspect ratio locked';
      lockIcon.innerHTML = `
        <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
        <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
      `;
      // Re-sync height based on current width
      const w = parseInt(dimWidthInput.value, 10);
      if (w > 0 && aspectRatio > 0) {
        dimHeightInput.value = Math.max(1, Math.round(w / aspectRatio));
        rasterizeSvg();
      }
    } else {
      aspectLockBtn.classList.remove('locked');
      aspectLockBtn.title = 'Aspect ratio unlocked';
      lockIcon.innerHTML = `
        <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
        <path d="M7 11V7a5 5 0 0 1 9.9-1"></path>
      `;
    }
  });

  dimWidthInput.addEventListener('input', () => {
    if (isUpdatingDims) return;
    let w = parseInt(dimWidthInput.value, 10);
    if (!w || w <= 0) return;
    w = Math.min(16384, Math.max(1, w));

    if (isAspectLocked && aspectRatio > 0) {
      isUpdatingDims = true;
      dimHeightInput.value = Math.max(1, Math.round(w / aspectRatio));
      isUpdatingDims = false;
    }
    // De-activate multiplier preset active state if custom
    clearPresetSelection();
    rasterizeSvg();
  });

  dimHeightInput.addEventListener('input', () => {
    if (isUpdatingDims) return;
    let h = parseInt(dimHeightInput.value, 10);
    if (!h || h <= 0) return;
    h = Math.min(16384, Math.max(1, h));

    if (isAspectLocked && aspectRatio > 0) {
      isUpdatingDims = true;
      dimWidthInput.value = Math.max(1, Math.round(h * aspectRatio));
      isUpdatingDims = false;
    }
    clearPresetSelection();
    rasterizeSvg();
  });

  function clearPresetSelection() {
    presetButtons.forEach(b => b.classList.remove('active'));
  }

  // ─── BACKGROUND OPTIONS ──────────────────────────────────────
  bgButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      bgButtons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const bgType = btn.getAttribute('data-bg');
      if (bgType === 'custom') {
        customColorRow.style.display = 'flex';
        currentBg = customColorPicker.value;
      } else {
        customColorRow.style.display = 'none';
        currentBg = bgType;
      }

      updateViewportBackgroundTheme();
      rasterizeSvg();
    });
  });

  customColorPicker.addEventListener('input', () => {
    customColorText.value = customColorPicker.value;
    customColorChip.style.backgroundColor = customColorPicker.value;
    currentBg = customColorPicker.value;
    updateViewportBackgroundTheme();
    rasterizeSvg();
  });

  customColorText.addEventListener('input', () => {
    const val = customColorText.value.trim();
    if (/^#[0-9a-fA-F]{6}$/.test(val)) {
      customColorPicker.value = val;
      customColorChip.style.backgroundColor = val;
      currentBg = val;
      updateViewportBackgroundTheme();
      rasterizeSvg();
    }
  });

  function updateViewportBackgroundTheme() {
    stageViewport.classList.remove('bg-checker', 'bg-white', 'bg-black');
    if (currentBg === 'transparent') {
      stageViewport.classList.add('bg-checker');
      stageViewport.style.backgroundColor = '';
    } else if (currentBg === '#ffffff') {
      stageViewport.classList.add('bg-white');
      stageViewport.style.backgroundColor = '#ffffff';
    } else if (currentBg === '#000000') {
      stageViewport.classList.add('bg-black');
      stageViewport.style.backgroundColor = '#050508';
    } else {
      stageViewport.style.backgroundColor = currentBg;
    }
  }

  // ─── RASTERIZATION CORE ──────────────────────────────────────
  function rasterizeSvg() {
    const svgCode = svgTextarea.value.trim();
    if (!svgCode) {
      showPlaceholder();
      return;
    }

    const targetWidth = Math.min(16384, Math.max(1, parseInt(dimWidthInput.value, 10) || baseWidth));
    const targetHeight = Math.min(16384, Math.max(1, parseInt(dimHeightInput.value, 10) || baseHeight));

    badgeTargetDim.textContent = `PNG: ${targetWidth} × ${targetHeight}`;

    try {
      const parser = new DOMParser();
      const doc = parser.parseFromString(svgCode, 'image/svg+xml');
      const svgEl = doc.querySelector('svg');

      if (!svgEl) return;

      // Ensure proper attributes for high-resolution vector rendering
      if (!svgEl.hasAttribute('xmlns')) {
        svgEl.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
      }

      // If viewBox is missing, inject one from base dims
      if (!svgEl.hasAttribute('viewBox')) {
        svgEl.setAttribute('viewBox', `0 0 ${baseWidth} ${baseHeight}`);
      }

      // Set explicit dimensions on cloned SVG so Image renderer respects target sizing
      svgEl.setAttribute('width', targetWidth);
      svgEl.setAttribute('height', targetHeight);

      const serializer = new XMLSerializer();
      const serializedSvg = serializer.serializeToString(svgEl);

      const blob = new Blob([serializedSvg], { type: 'image/svg+xml;charset=utf-8' });
      const blobUrl = URL.createObjectURL(blob);

      const img = new Image();
      img.onload = () => {
        // Draw onto Canvas
        previewCanvas.width = targetWidth;
        previewCanvas.height = targetHeight;
        const ctx = previewCanvas.getContext('2d');

        ctx.clearRect(0, 0, targetWidth, targetHeight);

        // Fill background if not transparent
        if (currentBg !== 'transparent') {
          ctx.fillStyle = currentBg;
          ctx.fillRect(0, 0, targetWidth, targetHeight);
        }

        // Crisp vector rendering
        ctx.drawImage(img, 0, 0, targetWidth, targetHeight);
        URL.revokeObjectURL(blobUrl);

        // Reveal Canvas Stage
        stagePlaceholder.style.display = 'none';
        canvasWrapper.style.display = 'inline-flex';
        applyZoom();

        // Export PNG Blob for size & download
        previewCanvas.toBlob(pngBlob => {
          if (pngBlob) {
            currentBlob = pngBlob;
            badgePngSize.textContent = formatBytes(pngBlob.size);
            badgePngSize.style.display = 'inline-flex';
            downloadBtn.disabled = false;
            copyPngBtn.disabled = false;
          }
        }, 'image/png');
      };

      img.onerror = () => {
        URL.revokeObjectURL(blobUrl);
        showToast('Rasterizer could not render SVG. Please check vector syntax.');
      };

      img.src = blobUrl;

    } catch (e) {
      console.error('Rasterization execution error:', e);
      showToast('Error during rasterization.');
    }
  }

  function showPlaceholder() {
    stagePlaceholder.style.display = 'flex';
    canvasWrapper.style.display = 'none';
    downloadBtn.disabled = true;
    copyPngBtn.disabled = true;
    badgePngSize.style.display = 'none';
  }

  // ─── ZOOM CONTROLS ───────────────────────────────────────────
  function applyZoom() {
    zoomValue.textContent = `${currentZoom}%`;
    zoomSlider.value = currentZoom;
    canvasWrapper.style.transform = `scale(${currentZoom / 100})`;
  }

  zoomSlider.addEventListener('input', () => {
    currentZoom = parseInt(zoomSlider.value, 10);
    applyZoom();
  });

  zoomInBtn.addEventListener('click', () => {
    currentZoom = Math.min(400, currentZoom + 25);
    applyZoom();
  });

  zoomOutBtn.addEventListener('click', () => {
    currentZoom = Math.max(25, currentZoom - 25);
    applyZoom();
  });

  zoomFitBtn.addEventListener('click', () => {
    // Calculate best fit scale relative to stageViewport
    const viewW = stageViewport.clientWidth - 64;
    const viewH = stageViewport.clientHeight - 64;
    const canvasW = previewCanvas.width;
    const canvasH = previewCanvas.height;

    if (canvasW > 0 && canvasH > 0 && viewW > 0 && viewH > 0) {
      const scaleX = viewW / canvasW;
      const scaleY = viewH / canvasH;
      const fit = Math.min(scaleX, scaleY, 1);
      currentZoom = Math.max(25, Math.min(400, Math.round(fit * 100)));
    } else {
      currentZoom = 100;
    }
    applyZoom();
  });

  // ─── DOWNLOAD & COPY ─────────────────────────────────────────
  downloadBtn.addEventListener('click', () => {
    if (!currentBlob) return;

    const targetW = previewCanvas.width;
    const targetH = previewCanvas.height;
    const filename = `${sourceFileName}_${targetW}x${targetH}.png`;

    const url = URL.createObjectURL(currentBlob);
    downloadAnchor.href = url;
    downloadAnchor.download = filename;
    downloadAnchor.click();

    setTimeout(() => URL.revokeObjectURL(url), 1000);
    showToast(`Downloaded ${filename}`);
  });

  copyPngBtn.addEventListener('click', async () => {
    if (!currentBlob) return;

    try {
      if (navigator.clipboard && window.ClipboardItem) {
        await navigator.clipboard.write([
          new ClipboardItem({ 'image/png': currentBlob })
        ]);
        showToast('PNG copied to clipboard!');
      } else {
        showToast('Clipboard image copying is not supported in this browser.');
      }
    } catch (err) {
      console.warn('Clipboard write error:', err);
      showToast('Could not copy to clipboard.');
    }
  });

  // ─── CLEAR / RESET ───────────────────────────────────────────
  clearAllBtn.addEventListener('click', () => {
    svgTextarea.value = '';
    charCount.textContent = '0 chars';
    fileInput.value = '';
    showPlaceholder();
    showToast('Workspace cleared.');
  });

  // ─── HELPERS ─────────────────────────────────────────────────
  function formatBytes(bytes) {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  }

  let toastTimer = null;
  function showToast(msg) {
    clearTimeout(toastTimer);
    toast.textContent = msg;
    toast.classList.add('show');
    toastTimer = setTimeout(() => {
      toast.classList.remove('show');
    }, 2800);
  }

  // Initialize with Sample "App Icon"
  setSvgContent(SAMPLES['app-icon'], 'app_icon');
});