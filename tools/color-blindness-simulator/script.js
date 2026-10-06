// Color Blindness Simulator - Fully Interactive Client-Side Logic
// Implements linearized Brettel & Viénot LMS color transformations on HTML5 Canvas.

document.addEventListener('DOMContentLoaded', () => {
  // --- DOM Elements ---
  const tabPaletteBtn = document.getElementById('tab-palette-btn');
  const tabImageBtn = document.getElementById('tab-image-btn');
  const paletteWorkspace = document.getElementById('palette-workspace');
  const imageWorkspace = document.getElementById('image-workspace');

  const severitySlider = document.getElementById('severity-slider');
  const severityVal = document.getElementById('severity-val');
  const exportPngBtn = document.getElementById('export-png-btn');

  // Palette DOM
  const paletteColorPicker = document.getElementById('palette-color-picker');
  const paletteHexText = document.getElementById('palette-hex-text');
  const addColorBtn = document.getElementById('add-color-btn');
  const randomPaletteBtn = document.getElementById('random-palette-btn');
  const clearPaletteBtn = document.getElementById('clear-palette-btn');
  const presetPillsList = document.getElementById('preset-pills-list');
  const swatchesChipList = document.getElementById('swatches-chip-list');

  // Swatch Containers per vision type
  const swatchesRows = {
    normal: document.getElementById('swatches-normal'),
    protanopia: document.getElementById('swatches-protanopia'),
    deuteranopia: document.getElementById('swatches-deuteranopia'),
    tritanopia: document.getElementById('swatches-tritanopia'),
    achromatopsia: document.getElementById('swatches-achromatopsia')
  };

  // Image DOM
  const imageDropArea = document.getElementById('image-drop-area');
  const imageFileInput = document.getElementById('image-file-input');
  const imageCvdSelect = document.getElementById('image-cvd-select');
  const viewModeSplitBtn = document.getElementById('view-mode-split-btn');
  const viewModeDualBtn = document.getElementById('view-mode-dual-btn');
  const downloadSimulatedImgBtn = document.getElementById('download-simulated-img-btn');

  const imageSplitViewContainer = document.getElementById('image-split-view-container');
  const imageGridViewContainer = document.getElementById('image-grid-view-container');
  const imageQuadGridContainer = document.getElementById('image-quad-grid-container');

  const splitSliderBox = document.getElementById('split-slider-box');
  const splitOriginalCanvas = document.getElementById('split-original-canvas');
  const splitSimulatedCanvas = document.getElementById('split-simulated-canvas');
  const splitDivider = document.getElementById('split-divider');
  const splitLabelSimText = document.getElementById('split-label-sim-text');
  const currentSimBadge = document.getElementById('current-sim-badge');

  const gridOriginalCanvas = document.getElementById('grid-original-canvas');
  const gridSimulatedCanvas = document.getElementById('grid-simulated-canvas');
  const gridSimTitle = document.getElementById('grid-sim-title');
  const gridSimBadge = document.getElementById('grid-sim-badge');

  const quadCanvasProtan = document.getElementById('quad-canvas-protan');
  const quadCanvasDeutan = document.getElementById('quad-canvas-deutan');
  const quadCanvasTritan = document.getElementById('quad-canvas-tritan');
  const quadCanvasAchromat = document.getElementById('quad-canvas-achromat');

  const exportCompositeCanvas = document.getElementById('export-composite-canvas');
  const toast = document.getElementById('toast');
  const toastText = document.getElementById('toast-text');

  // --- State ---
  let activeTab = 'palette'; // 'palette' | 'image'
  let currentSeverity = 1.0; // 0.0 to 1.0
  let currentPalette = ['#EF4444', '#F59E0B', '#10B981', '#3B82F6', '#8B5CF6', '#EC4899'];
  let currentImage = null; // HTMLImageElement or Canvas
  let activeImageView = 'split'; // 'split' | 'dual' | 'quad'
  let splitPercent = 50;
  let isDraggingSplit = false;

  // --- Toast Helper ---
  let toastTimer = null;
  function showToast(msg) {
    if (toastTimer) clearTimeout(toastTimer);
    toastText.textContent = msg;
    toast.classList.add('show');
    toastTimer = setTimeout(() => {
      toast.classList.remove('show');
    }, 2400);
  }

  // --- Mathematically Accurate Brettel & Viénot LMS Matrices (Linear sRGB Space) ---
  const CVD_MATRICES = {
    protanopia: [
      0.56667, 0.43333, 0.00000,
      0.55833, 0.44167, 0.00000,
      0.00000, 0.24167, 0.75833
    ],
    deuteranopia: [
      0.62500, 0.37500, 0.00000,
      0.70000, 0.30000, 0.00000,
      0.00000, 0.30000, 0.70000
    ],
    tritanopia: [
      0.95000, 0.05000, 0.00000,
      0.00000, 0.43333, 0.56667,
      0.00000, 0.47500, 0.52500
    ],
    achromatopsia: [
      0.21260, 0.71520, 0.07220,
      0.21260, 0.71520, 0.07220,
      0.21260, 0.71520, 0.07220
    ]
  };

  // Precomputed sRGB to Linear LUT for performance
  const SRGB_TO_LINEAR_LUT = new Float32Array(256);
  for (let i = 0; i < 256; i++) {
    const c = i / 255;
    SRGB_TO_LINEAR_LUT[i] = c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  }

  function linearToSrgb(c) {
    c = Math.max(0, Math.min(1, c));
    return Math.round((c <= 0.0031308 ? 12.92 * c : 1.055 * Math.pow(c, 1 / 2.4) - 0.055) * 255);
  }

  // Get effective 3x3 matrix for deficiency type and severity
  function getEffectiveMatrix(type, severity) {
    if (type === 'normal') {
      return [
        1, 0, 0,
        0, 1, 0,
        0, 0, 1
      ];
    }
    const base = CVD_MATRICES[type] || CVD_MATRICES.deuteranopia;
    const s = Math.max(0, Math.min(1, severity));
    const inv = 1 - s;
    return [
      inv + s * base[0], s * base[1], s * base[2],
      s * base[3], inv + s * base[4], s * base[5],
      s * base[6], s * base[7], inv + s * base[8]
    ];
  }

  // Transform single RGB [0..255]
  function simulateRgb(r, g, b, type, severity) {
    if (type === 'normal' || severity === 0) return { r, g, b };
    const m = getEffectiveMatrix(type, severity);
    const rLin = SRGB_TO_LINEAR_LUT[r];
    const gLin = SRGB_TO_LINEAR_LUT[g];
    const bLin = SRGB_TO_LINEAR_LUT[b];

    const rSimLin = m[0] * rLin + m[1] * gLin + m[2] * bLin;
    const gSimLin = m[3] * rLin + m[4] * gLin + m[5] * bLin;
    const bSimLin = m[6] * rLin + m[7] * gLin + m[8] * bLin;

    return {
      r: linearToSrgb(rSimLin),
      g: linearToSrgb(gSimLin),
      b: linearToSrgb(bSimLin)
    };
  }

  // Color Helpers
  function hexToRgb(hex) {
    let clean = hex.replace(/^#/, '');
    if (clean.length === 3) {
      clean = clean.split('').map(c => c + c).join('');
    }
    const val = parseInt(clean, 16);
    if (isNaN(val) || clean.length !== 6) return { r: 0, g: 0, b: 0 };
    return {
      r: (val >> 16) & 255,
      g: (val >> 8) & 255,
      b: val & 255
    };
  }

  function rgbToHex(r, g, b) {
    const toH = c => Math.max(0, Math.min(255, Math.round(c))).toString(16).padStart(2, '0');
    return `#${toH(r)}${toH(g)}${toH(b)}`.toUpperCase();
  }

  function simulateHex(hex, type, severity) {
    const { r, g, b } = hexToRgb(hex);
    const sim = simulateRgb(r, g, b, type, severity);
    return rgbToHex(sim.r, sim.g, sim.b);
  }

  // Curated Preset Palettes
  const PRESET_PALETTES = [
    {
      name: 'Status Alerts',
      colors: ['#EF4444', '#F59E0B', '#10B981', '#3B82F6']
    },
    {
      name: 'Spectrum',
      colors: ['#EF4444', '#F97316', '#EAB308', '#22C55E', '#06B6D4', '#6366F1', '#A855F7']
    },
    {
      name: 'Data Viz',
      colors: ['#4E79A7', '#F28E2B', '#E15759', '#76B7B2', '#59A14F', '#EDC948', '#B07AA1']
    },
    {
      name: 'Traffic Signs',
      colors: ['#DC2626', '#FACC15', '#16A34A', '#2563EB', '#1E293B']
    },
    {
      name: 'Ocean Breeze',
      colors: ['#03045E', '#0077B6', '#00B4D8', '#90E0EF', '#CAF0F8']
    }
  ];

  // --- Render Preset Pills ---
  function renderPresets() {
    presetPillsList.innerHTML = '';
    PRESET_PALETTES.forEach(preset => {
      const btn = document.createElement('button');
      btn.className = 'preset-pill';
      btn.type = 'button';

      const dots = document.createElement('div');
      dots.className = 'preset-mini-dots';
      preset.colors.slice(0, 4).forEach(c => {
        const dot = document.createElement('div');
        dot.className = 'preset-dot';
        dot.style.backgroundColor = c;
        dots.appendChild(dot);
      });

      btn.appendChild(dots);
      const span = document.createElement('span');
      span.textContent = preset.name;
      btn.appendChild(span);

      btn.addEventListener('click', () => {
        currentPalette = [...preset.colors];
        renderPaletteWorkspace();
        showToast(`Loaded "${preset.name}" preset`);
      });

      presetPillsList.appendChild(btn);
    });
  }

  // --- Render Palette Workspace ---
  function renderPaletteWorkspace() {
    // 1. Swatches Chip List
    swatchesChipList.innerHTML = '';
    if (currentPalette.length === 0) {
      swatchesChipList.innerHTML = '<span style="font-size: 0.825rem; color: var(--text-tertiary); padding: 0.25rem 0.5rem;">No swatches in palette. Add a color above.</span>';
    } else {
      currentPalette.forEach((hex, index) => {
        const chip = document.createElement('div');
        chip.className = 'swatch-chip';
        chip.innerHTML = `
          <div class="swatch-chip-color" style="background-color: ${hex};"></div>
          <span>${hex}</span>
          <button class="swatch-chip-remove" title="Remove swatch">&times;</button>
        `;
        chip.querySelector('.swatch-chip-remove').addEventListener('click', () => {
          currentPalette.splice(index, 1);
          renderPaletteWorkspace();
        });
        swatchesChipList.appendChild(chip);
      });
    }

    // 2. Render each deficiency card swatches row
    const types = ['normal', 'protanopia', 'deuteranopia', 'tritanopia', 'achromatopsia'];
    types.forEach(type => {
      const container = swatchesRows[type];
      if (!container) return;
      container.innerHTML = '';

      if (currentPalette.length === 0) {
        container.innerHTML = '<div style="flex:1; display:flex; align-items:center; justify-content:center; color: var(--text-tertiary); font-size: 0.8rem; height: 80px;">Empty Palette</div>';
        return;
      }

      currentPalette.forEach(origHex => {
        const simHex = simulateHex(origHex, type, currentSeverity);
        const swatch = document.createElement('div');
        swatch.className = 'cvd-mini-swatch';
        swatch.style.backgroundColor = simHex;
        swatch.title = `Original: ${origHex} \nSimulated (${type}): ${simHex}\nClick to copy`;

        const hexBadge = document.createElement('span');
        hexBadge.className = 'cvd-swatch-hex';
        hexBadge.textContent = simHex;
        swatch.appendChild(hexBadge);

        swatch.addEventListener('click', () => {
          navigator.clipboard.writeText(simHex).then(() => {
            showToast(`Copied ${simHex} (${type})`);
          });
        });

        container.appendChild(swatch);
      });
    });
  }

  // --- Add Swatch Event ---
  function addColorFromInputs() {
    let hex = paletteHexText.value.trim().toUpperCase();
    if (!hex.startsWith('#')) hex = '#' + hex;
    if (!/^#[0-9A-F]{6}$/i.test(hex)) {
      showToast('Please enter a valid 6-digit hex color (e.g. #3B82F6)');
      return;
    }
    currentPalette.push(hex);
    renderPaletteWorkspace();
    showToast(`Added ${hex} to palette`);
  }

  addColorBtn.addEventListener('click', addColorFromInputs);
  paletteHexText.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') addColorFromInputs();
  });

  paletteColorPicker.addEventListener('input', (e) => {
    paletteHexText.value = e.target.value.toUpperCase();
  });
  paletteHexText.addEventListener('input', (e) => {
    let val = e.target.value.trim();
    if (!val.startsWith('#')) val = '#' + val;
    if (/^#[0-9A-F]{6}$/i.test(val)) {
      paletteColorPicker.value = val;
    }
  });

  randomPaletteBtn.addEventListener('click', () => {
    const randomHex = () => '#' + Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0').toUpperCase();
    currentPalette = Array.from({ length: 5 }, () => randomHex());
    renderPaletteWorkspace();
    showToast('Generated random palette');
  });

  clearPaletteBtn.addEventListener('click', () => {
    currentPalette = [];
    renderPaletteWorkspace();
    showToast('Cleared palette');
  });

  // Copy Palette Button on Cards
  document.querySelectorAll('.copy-palette-card-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const type = btn.getAttribute('data-type');
      const simColors = currentPalette.map(c => simulateHex(c, type, currentSeverity));
      const text = simColors.join(', ');
      navigator.clipboard.writeText(text).then(() => {
        showToast(`Copied ${type} palette (${simColors.length} colors)`);
      });
    });
  });

  // Severity Slider
  severitySlider.addEventListener('input', (e) => {
    const val = parseInt(e.target.value, 10);
    currentSeverity = val / 100;
    severityVal.textContent = `${val}%`;
    renderPaletteWorkspace();
    if (activeTab === 'image' && currentImage) {
      processImageSimulation();
    }
  });

  // --- TAB NAVIGATION ---
  tabPaletteBtn.addEventListener('click', () => {
    activeTab = 'palette';
    tabPaletteBtn.classList.add('active');
    tabImageBtn.classList.remove('active');
    paletteWorkspace.style.display = 'flex';
    imageWorkspace.classList.remove('active');
  });

  tabImageBtn.addEventListener('click', () => {
    activeTab = 'image';
    tabImageBtn.classList.add('active');
    tabPaletteBtn.classList.remove('active');
    paletteWorkspace.style.display = 'none';
    imageWorkspace.classList.add('active');
    if (!currentImage) {
      loadSampleImage('rainbow');
    } else {
      processImageSimulation();
    }
  });

  // --- IMAGE SIMULATION LOGIC ---
  // Apply matrix to Canvas ImageData
  function applyCvdToImageData(imageData, type, severity) {
    if (type === 'normal' || severity === 0) return imageData;
    const m = getEffectiveMatrix(type, severity);
    const data = imageData.data;
    const len = data.length;

    for (let i = 0; i < len; i += 4) {
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];

      const rLin = SRGB_TO_LINEAR_LUT[r];
      const gLin = SRGB_TO_LINEAR_LUT[g];
      const bLin = SRGB_TO_LINEAR_LUT[b];

      const rSimLin = m[0] * rLin + m[1] * gLin + m[2] * bLin;
      const gSimLin = m[3] * rLin + m[4] * gLin + m[5] * bLin;
      const bSimLin = m[6] * rLin + m[7] * gLin + m[8] * bLin;

      data[i] = linearToSrgb(rSimLin);
      data[i + 1] = linearToSrgb(gSimLin);
      data[i + 2] = linearToSrgb(bSimLin);
    }
    return imageData;
  }

  // Draw image source onto target canvas preserving aspect ratio
  function drawScaledSourceToCanvas(canvas, imgSource, maxDim = 800) {
    let width = imgSource.width || imgSource.naturalWidth || 600;
    let height = imgSource.height || imgSource.naturalHeight || 400;

    if (width > maxDim || height > maxDim) {
      const scale = Math.min(maxDim / width, maxDim / height);
      width = Math.round(width * scale);
      height = Math.round(height * scale);
    }

    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    ctx.clearRect(0, 0, width, height);
    ctx.drawImage(imgSource, 0, 0, width, height);
    return ctx;
  }

  // Master image simulation pipeline
  function processImageSimulation() {
    if (!currentImage) return;

    const selectedType = imageCvdSelect.value;
    const typeLabel = imageCvdSelect.options[imageCvdSelect.selectedIndex].text;

    if (selectedType === 'all-grid') {
      // 4-Way Quad Grid Mode
      imageSplitViewContainer.style.display = 'none';
      imageGridViewContainer.style.display = 'none';
      imageQuadGridContainer.style.display = 'grid';

      const quadConfigs = [
        { canvas: quadCanvasProtan, type: 'protanopia' },
        { canvas: quadCanvasDeutan, type: 'deuteranopia' },
        { canvas: quadCanvasTritan, type: 'tritanopia' },
        { canvas: quadCanvasAchromat, type: 'achromatopsia' }
      ];

      quadConfigs.forEach(({ canvas, type }) => {
        const ctx = drawScaledSourceToCanvas(canvas, currentImage, 500);
        const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        applyCvdToImageData(imgData, type, currentSeverity);
        ctx.putImageData(imgData, 0, 0);
      });
      return;
    }

    imageQuadGridContainer.style.display = 'none';

    if (activeImageView === 'split') {
      imageSplitViewContainer.style.display = 'flex';
      imageGridViewContainer.style.display = 'none';

      // Draw original
      drawScaledSourceToCanvas(splitOriginalCanvas, currentImage);

      // Draw simulated
      const simCtx = drawScaledSourceToCanvas(splitSimulatedCanvas, currentImage);
      const imgData = simCtx.getImageData(0, 0, splitSimulatedCanvas.width, splitSimulatedCanvas.height);
      applyCvdToImageData(imgData, selectedType, currentSeverity);
      simCtx.putImageData(imgData, 0, 0);

      currentSimBadge.textContent = typeLabel.split(' ')[0];
      splitLabelSimText.textContent = typeLabel.split(' ')[0];
      updateSplitDivider(splitPercent);
    } else {
      // Dual Cards Mode
      imageSplitViewContainer.style.display = 'none';
      imageGridViewContainer.style.display = 'grid';

      drawScaledSourceToCanvas(gridOriginalCanvas, currentImage);

      const simCtx = drawScaledSourceToCanvas(gridSimulatedCanvas, currentImage);
      const imgData = simCtx.getImageData(0, 0, gridSimulatedCanvas.width, gridSimulatedCanvas.height);
      applyCvdToImageData(imgData, selectedType, currentSeverity);
      simCtx.putImageData(imgData, 0, 0);

      gridSimTitle.textContent = `Simulated (${typeLabel.split(' ')[0]})`;
      gridSimBadge.textContent = typeLabel.split(' ')[0];
    }
  }

  // --- Split View Slider Logic ---
  function updateSplitDivider(percent) {
    splitPercent = Math.max(0, Math.min(100, percent));
    splitDivider.style.left = `${splitPercent}%`;
    splitSimulatedCanvas.style.clipPath = `polygon(${splitPercent}% 0, 100% 0, 100% 100%, ${splitPercent}% 100%)`;
  }

  function handleSplitPointer(e) {
    const rect = splitSliderBox.getBoundingClientRect();
    if (rect.width <= 0) return;
    const clientX = e.clientX || (e.touches && e.touches[0] ? e.touches[0].clientX : 0);
    const pos = clientX - rect.left;
    const percent = (pos / rect.width) * 100;
    updateSplitDivider(percent);
  }

  splitSliderBox.addEventListener('pointerdown', (e) => {
    isDraggingSplit = true;
    splitSliderBox.setPointerCapture(e.pointerId);
    handleSplitPointer(e);
  });

  splitSliderBox.addEventListener('pointermove', (e) => {
    if (isDraggingSplit) {
      handleSplitPointer(e);
    }
  });

  const stopSplitDrag = (e) => {
    if (isDraggingSplit) {
      isDraggingSplit = false;
      try { splitSliderBox.releasePointerCapture(e.pointerId); } catch (_) {}
    }
  };
  splitSliderBox.addEventListener('pointerup', stopSplitDrag);
  splitSliderBox.addEventListener('pointercancel', stopSplitDrag);

  // --- Image View Switcher Buttons ---
  viewModeSplitBtn.addEventListener('click', () => {
    if (imageCvdSelect.value === 'all-grid') {
      imageCvdSelect.value = 'deuteranopia';
    }
    activeImageView = 'split';
    viewModeSplitBtn.classList.add('active');
    viewModeDualBtn.classList.remove('active');
    processImageSimulation();
  });

  viewModeDualBtn.addEventListener('click', () => {
    if (imageCvdSelect.value === 'all-grid') {
      imageCvdSelect.value = 'deuteranopia';
    }
    activeImageView = 'dual';
    viewModeDualBtn.classList.add('active');
    viewModeSplitBtn.classList.remove('active');
    processImageSimulation();
  });

  imageCvdSelect.addEventListener('change', () => {
    if (imageCvdSelect.value === 'all-grid') {
      viewModeSplitBtn.classList.remove('active');
      viewModeDualBtn.classList.remove('active');
    } else {
      if (activeImageView === 'split') viewModeSplitBtn.classList.add('active');
      else viewModeDualBtn.classList.add('active');
    }
    processImageSimulation();
  });

  // --- Image File Upload / Drag & Drop Handling ---
  function handleImageFile(file) {
    if (!file || !file.type.startsWith('image/')) {
      showToast('Please upload a valid image file (PNG, JPG, WebP, SVG)');
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        currentImage = img;
        if (activeTab !== 'image') {
          tabImageBtn.click();
        } else {
          processImageSimulation();
        }
        showToast('Image loaded successfully');
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  }

  imageDropArea.addEventListener('click', () => imageFileInput.click());
  imageFileInput.addEventListener('change', (e) => {
    if (e.target.files && e.target.files[0]) {
      handleImageFile(e.target.files[0]);
    }
  });

  ['dragenter', 'dragover'].forEach(name => {
    imageDropArea.addEventListener(name, (e) => {
      e.preventDefault();
      imageDropArea.classList.add('dragover');
    });
  });

  ['dragleave', 'drop'].forEach(name => {
    imageDropArea.addEventListener(name, (e) => {
      e.preventDefault();
      imageDropArea.classList.remove('dragover');
    });
  });

  imageDropArea.addEventListener('drop', (e) => {
    if (e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleImageFile(e.dataTransfer.files[0]);
    }
  });

  // Clipboard Paste Support (Ctrl+V)
  window.addEventListener('paste', (e) => {
    if (e.clipboardData && e.clipboardData.items) {
      for (const item of e.clipboardData.items) {
        if (item.type.indexOf('image') !== -1) {
          const file = item.getAsFile();
          handleImageFile(file);
          break;
        }
      }
    }
  });

  // --- Sample Images Generators (Canvas Procedural Art) ---
  function loadSampleImage(sampleType) {
    const c = document.createElement('canvas');
    c.width = 640;
    c.height = 420;
    const ctx = c.getContext('2d');

    if (sampleType === 'rainbow') {
      // Vibrant radial and linear color spectrum
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(0, 0, 640, 420);

      // Radial color wheel
      const cx = 320, cy = 210, radius = 150;
      for (let angle = 0; angle < 360; angle += 0.5) {
        const rad = (angle * Math.PI) / 180;
        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.arc(cx, cy, radius, rad, rad + 0.015);
        ctx.closePath();
        ctx.fillStyle = `hsl(${angle}, 100%, 50%)`;
        ctx.fill();
      }

      // Center white fade
      const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, radius);
      grad.addColorStop(0, 'rgba(255,255,255,1)');
      grad.addColorStop(0.2, 'rgba(255,255,255,0.7)');
      grad.addColorStop(1, 'rgba(255,255,255,0)');
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(cx, cy, radius, 0, Math.PI * 2);
      ctx.fill();

      // Color bars at bottom
      const bars = ['#EF4444', '#F97316', '#FACC15', '#22C55E', '#06B6D4', '#3B82F6', '#A855F7'];
      const barW = 640 / bars.length;
      bars.forEach((color, i) => {
        ctx.fillStyle = color;
        ctx.fillRect(i * barW, 380, barW, 40);
      });
    } else if (sampleType === 'traffic') {
      // Traffic Lights and Road Warning
      ctx.fillStyle = '#1e293b';
      ctx.fillRect(0, 0, 640, 420);

      // Traffic Light Box
      ctx.fillStyle = '#0f172a';
      ctx.strokeStyle = '#334155';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.roundRect(80, 40, 140, 340, 24);
      ctx.fill();
      ctx.stroke();

      // Red, Amber, Green Lights
      const lights = [
        { color: '#EF4444', glow: 'rgba(239,68,68,0.8)', y: 100 },
        { color: '#F59E0B', glow: 'rgba(245,158,11,0.8)', y: 210 },
        { color: '#10B981', glow: 'rgba(16,185,129,0.8)', y: 320 }
      ];
      lights.forEach(l => {
        const radGrad = ctx.createRadialGradient(150, l.y, 10, 150, l.y, 45);
        radGrad.addColorStop(0, '#ffffff');
        radGrad.addColorStop(0.4, l.color);
        radGrad.addColorStop(1, l.glow);
        ctx.fillStyle = radGrad;
        ctx.beginPath();
        ctx.arc(150, l.y, 42, 0, Math.PI * 2);
        ctx.fill();
      });

      // Warning Sign
      ctx.beginPath();
      ctx.moveTo(420, 60);
      ctx.lineTo(580, 320);
      ctx.lineTo(260, 320);
      ctx.closePath();
      ctx.fillStyle = '#FACC15';
      ctx.fill();
      ctx.strokeStyle = '#000000';
      ctx.lineWidth = 14;
      ctx.stroke();

      ctx.fillStyle = '#000000';
      ctx.font = 'bold 80px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('!', 420, 280);
    } else if (sampleType === 'fruit') {
      // Fruit & Berries
      ctx.fillStyle = '#090d16';
      ctx.fillRect(0, 0, 640, 420);

      // Red Apple
      ctx.fillStyle = '#DC2626';
      ctx.beginPath();
      ctx.arc(180, 220, 90, 0, Math.PI * 2);
      ctx.fill();

      // Green Leaf
      ctx.fillStyle = '#16A34A';
      ctx.beginPath();
      ctx.ellipse(190, 115, 35, 18, Math.PI / 4, 0, Math.PI * 2);
      ctx.fill();

      // Orange Citrus
      ctx.fillStyle = '#EA580C';
      ctx.beginPath();
      ctx.arc(360, 230, 80, 0, Math.PI * 2);
      ctx.fill();

      // Purple Blueberries
      const berries = [
        { x: 480, y: 260, r: 35, c: '#4338CA' },
        { x: 530, y: 220, r: 32, c: '#3730A3' },
        { x: 520, y: 280, r: 30, c: '#6B21A8' }
      ];
      berries.forEach(b => {
        ctx.fillStyle = b.c;
        ctx.beginPath();
        ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2);
        ctx.fill();
      });
    } else if (sampleType === 'ui') {
      // UI Dashboard Mockup
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(0, 0, 640, 420);

      const badges = [
        { label: 'System Online (Success)', bg: '#10B981', y: 60 },
        { label: 'High CPU Load (Warning)', bg: '#F59E0B', y: 140 },
        { label: 'Critical Incident (Error)', bg: '#EF4444', y: 220 },
        { label: 'Software Update (Info)', bg: '#3B82F6', y: 300 }
      ];

      badges.forEach(b => {
        ctx.fillStyle = '#1e293b';
        ctx.beginPath();
        ctx.roundRect(60, b.y, 520, 60, 12);
        ctx.fill();

        ctx.fillStyle = b.bg;
        ctx.beginPath();
        ctx.arc(100, b.y + 30, 14, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#f8fafc';
        ctx.font = 'bold 18px Inter, sans-serif';
        ctx.textAlign = 'left';
        ctx.fillText(b.label, 130, b.y + 36);

        ctx.fillStyle = b.bg;
        ctx.beginPath();
        ctx.roundRect(470, b.y + 16, 90, 28, 6);
        ctx.fill();
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 12px Inter, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('STATUS', 515, b.y + 34);
      });
    }

    const img = new Image();
    img.onload = () => {
      currentImage = img;
      processImageSimulation();
    };
    img.src = c.toDataURL();
  }

  // Sample Image Buttons
  document.querySelectorAll('.sample-img-pill').forEach(btn => {
    btn.addEventListener('click', () => {
      const sample = btn.getAttribute('data-sample');
      loadSampleImage(sample);
      showToast(`Loaded sample: ${btn.textContent.trim()}`);
    });
  });

  // Download Simulated Image Button
  downloadSimulatedImgBtn.addEventListener('click', () => {
    let sourceCanvas = null;
    const selectedType = imageCvdSelect.value;

    if (selectedType === 'all-grid') {
      sourceCanvas = quadCanvasDeutan;
    } else if (activeImageView === 'split') {
      sourceCanvas = splitSimulatedCanvas;
    } else {
      sourceCanvas = gridSimulatedCanvas;
    }

    if (!sourceCanvas || sourceCanvas.width === 0) {
      showToast('No simulated image to download');
      return;
    }

    const link = document.createElement('a');
    link.download = `color-blindness-${selectedType}-${Date.now()}.png`;
    link.href = sourceCanvas.toDataURL('image/png');
    link.click();
    showToast('Downloaded simulated image');
  });

  // --- Export Full Comparison Sheet PNG (Palette or Image) ---
  exportPngBtn.addEventListener('click', () => {
    const canvas = exportCompositeCanvas;
    const ctx = canvas.getContext('2d');

    if (activeTab === 'palette') {
      // Export Palette Sheet
      const width = 1000;
      const height = 750;
      canvas.width = width;
      canvas.height = height;

      // Dark background
      ctx.fillStyle = '#0a0d14';
      ctx.fillRect(0, 0, width, height);

      // Title & Header
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 28px Inter, sans-serif';
      ctx.fillText('Color Blindness Palette Simulation', 40, 55);

      ctx.fillStyle = '#94a3b8';
      ctx.font = '14px Inter, sans-serif';
      ctx.fillText(`Severity: ${(currentSeverity * 100).toFixed(0)}% • Model: Linearized Brettel / Viénot LMS Matrix`, 40, 85);

      const typesMeta = [
        { key: 'normal', name: 'Normal Trichromacy', note: 'Standard Human Vision Baseline' },
        { key: 'protanopia', name: 'Protanopia (Red-Blind)', note: 'L-Cone Deficient (~1.3% males)' },
        { key: 'deuteranopia', name: 'Deuteranopia (Green-Blind)', note: 'M-Cone Deficient (~5.0% males)' },
        { key: 'tritanopia', name: 'Tritanopia (Blue-Blind)', note: 'S-Cone Deficient (Rare)' },
        { key: 'achromatopsia', name: 'Achromatopsia (Monochrome)', note: 'Complete Color Blindness' }
      ];

      let startY = 120;
      typesMeta.forEach(meta => {
        // Label
        ctx.fillStyle = '#f1f5f9';
        ctx.font = 'bold 16px Inter, sans-serif';
        ctx.fillText(meta.name, 40, startY + 18);

        ctx.fillStyle = '#64748b';
        ctx.font = '12px Inter, sans-serif';
        ctx.fillText(meta.note, 40, startY + 36);

        // Swatch Bar
        const barX = 340;
        const barW = 620;
        const swatchW = barW / (currentPalette.length || 1);
        const swatchH = 65;

        currentPalette.forEach((origHex, i) => {
          const simHex = simulateHex(origHex, meta.key, currentSeverity);
          ctx.fillStyle = simHex;
          ctx.fillRect(barX + i * swatchW, startY, swatchW, swatchH);

          // Hex label
          ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
          ctx.fillRect(barX + i * swatchW + 4, startY + swatchH - 24, swatchW - 8, 20);
          ctx.fillStyle = '#ffffff';
          ctx.font = 'bold 11px monospace';
          ctx.textAlign = 'center';
          ctx.fillText(simHex, barX + i * swatchW + swatchW / 2, startY + swatchH - 10);
          ctx.textAlign = 'left';
        });

        startY += 105;
      });

      // Footer
      ctx.fillStyle = '#475569';
      ctx.font = '12px Inter, sans-serif';
      ctx.fillText('Generated by ALL IN ONE Color Blindness Simulator • https://sami12901.github.io/ALL-IN-ONE-v1/', 40, height - 25);
    } else {
      // Export Image Comparison Sheet
      if (!currentImage) {
        showToast('Please load an image first');
        return;
      }

      const cardW = 460;
      const cardH = 300;
      const width = 1000;
      const height = 760;
      canvas.width = width;
      canvas.height = height;

      ctx.fillStyle = '#0a0d14';
      ctx.fillRect(0, 0, width, height);

      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 26px Inter, sans-serif';
      ctx.fillText('Color Blindness Image Comparison Sheet', 40, 50);

      ctx.fillStyle = '#94a3b8';
      ctx.font = '14px Inter, sans-serif';
      ctx.fillText(`Severity: ${(currentSeverity * 100).toFixed(0)}% • Brettel/Viénot Transformations`, 40, 78);

      const quads = [
        { name: 'Original (Trichromacy)', type: 'normal', x: 40, y: 105 },
        { name: 'Protanopia (Red-Blind)', type: 'protanopia', x: 500, y: 105 },
        { name: 'Deuteranopia (Green-Blind)', type: 'deuteranopia', x: 40, y: 420 },
        { name: 'Tritanopia (Blue-Blind)', type: 'tritanopia', x: 500, y: 420 }
      ];

      const tempCanvas = document.createElement('canvas');
      quads.forEach(q => {
        ctx.fillStyle = '#e2e8f0';
        ctx.font = 'bold 15px Inter, sans-serif';
        ctx.fillText(q.name, q.x, q.y + 18);

        const tempCtx = drawScaledSourceToCanvas(tempCanvas, currentImage, 400);
        const imgData = tempCtx.getImageData(0, 0, tempCanvas.width, tempCanvas.height);
        applyCvdToImageData(imgData, q.type, currentSeverity);
        tempCtx.putImageData(imgData, 0, 0);

        ctx.drawImage(tempCanvas, q.x, q.y + 28, cardW, cardH - 35);
      });
    }

    const link = document.createElement('a');
    link.download = `cvd-comparison-sheet-${Date.now()}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
    showToast('Comparison sheet exported as PNG');
  });

  // --- Initial Launch ---
  renderPresets();
  renderPaletteWorkspace();
});