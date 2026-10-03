// Image Watermark Studio - Client-side Logic

document.addEventListener('DOMContentLoaded', () => {
  // Elements
  const dropZone = document.getElementById('drop-zone');
  const baseFileInput = document.getElementById('base-file-input');
  const browseBtn = document.getElementById('browse-btn');
  const sampleBtn = document.getElementById('sample-btn');

  const infoStrip = document.getElementById('info-strip');
  const studioGrid = document.getElementById('studio-grid');
  const fileNameEl = document.getElementById('file-name');
  const baseDimsEl = document.getElementById('base-dims');
  const modeBadge = document.getElementById('mode-badge');
  const changeImageBtn = document.getElementById('change-image-btn');

  const stageWrapper = document.getElementById('stage-wrapper');
  const canvas = document.getElementById('preview-canvas');
  const ctx = canvas.getContext('2d');

  // Mode Tabs
  const tabText = document.getElementById('tab-text');
  const tabLogo = document.getElementById('tab-logo');
  const textSection = document.getElementById('text-settings-section');
  const logoSection = document.getElementById('logo-settings-section');

  // Text Controls
  const wmTextInput = document.getElementById('wm-text');
  const fontSizeSlider = document.getElementById('font-size-slider');
  const fontSizeVal = document.getElementById('font-size-val');
  const fontFamilySelect = document.getElementById('font-family-select');
  const btnBold = document.getElementById('btn-bold');
  const btnItalic = document.getElementById('btn-italic');
  const textColorInput = document.getElementById('text-color');
  const textOpacitySlider = document.getElementById('text-opacity-slider');
  const textOpacityVal = document.getElementById('text-opacity-val');
  const textRotationSlider = document.getElementById('text-rotation-slider');
  const textRotationVal = document.getElementById('text-rotation-val');

  // Logo Controls
  const logoDropZone = document.getElementById('logo-drop-zone');
  const logoFileInput = document.getElementById('logo-file-input');
  const logoThumb = document.getElementById('logo-thumb');
  const logoPrompt = document.getElementById('logo-prompt');
  const useDefaultLogoBtn = document.getElementById('use-default-logo-btn');
  const useShieldLogoBtn = document.getElementById('use-shield-logo-btn');
  const logoScaleSlider = document.getElementById('logo-scale-slider');
  const logoScaleVal = document.getElementById('logo-scale-val');
  const logoOpacitySlider = document.getElementById('logo-opacity-slider');
  const logoOpacityVal = document.getElementById('logo-opacity-val');
  const logoRotationSlider = document.getElementById('logo-rotation-slider');
  const logoRotationVal = document.getElementById('logo-rotation-val');

  // Placement Controls
  const tileToggle = document.getElementById('tile-toggle');
  const gridPositionBox = document.getElementById('grid-position-box');
  const tileSpacingBox = document.getElementById('tile-spacing-box');
  const posButtons = document.querySelectorAll('.pos-grid-btn');
  const marginSlider = document.getElementById('margin-slider');
  const marginVal = document.getElementById('margin-val');
  const tileGapSlider = document.getElementById('tile-gap-slider');
  const tileGapVal = document.getElementById('tile-gap-val');

  // Export & Download
  const exportFormat = document.getElementById('export-format');
  const downloadBtn = document.getElementById('download-btn');
  const toast = document.getElementById('toast');

  // State
  let baseImage = null;
  let baseFileName = 'photo.jpg';
  let activeMode = 'text'; // 'text' | 'logo'

  let textBold = true;
  let textItalic = false;

  let logoImage = null;
  let activePosition = 'bottom-right';

  // SVG default shields for logo testing
  const SHIELD_SVG = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 24 24" fill="none" stroke="%234e85bf" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path><path d="m9 12 2 2 4-4"></path></svg>`;
  const EMBLEM_SVG = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="240" height="240" viewBox="0 0 100 100"><circle cx="50" cy="50" r="46" fill="%234e85bf" fill-opacity="0.2" stroke="%234e85bf" stroke-width="4"/><circle cx="50" cy="50" r="38" fill="none" stroke="%23ffffff" stroke-width="2" stroke-dasharray="4,4"/><text x="50" y="44" font-family="sans-serif" font-weight="900" font-size="14" fill="%23ffffff" text-anchor="middle">AUTHENTIC</text><text x="50" y="60" font-family="sans-serif" font-weight="bold" font-size="11" fill="%2389aacc" text-anchor="middle">ORIGINAL</text><text x="50" y="74" font-family="sans-serif" font-size="9" fill="%23ffffff" text-anchor="middle">★ ★ ★</text></svg>`;

  // Toast
  function showToast(message, isSuccess = true) {
    if (!toast) return;
    toast.textContent = message;
    toast.className = `wm-toast show ${isSuccess ? 'success' : ''}`;
    setTimeout(() => {
      toast.className = 'wm-toast';
    }, 2800);
  }

  // Load Base Image
  function loadBaseImage(file) {
    if (!file || !file.type.startsWith('image/')) {
      alert('Please upload a valid image file.');
      return;
    }

    baseFileName = file.name || 'photo.jpg';
    fileNameEl.textContent = baseFileName;

    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        baseImage = img;
        initStudio();
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  }

  // Sample Photo
  function loadSamplePhoto() {
    baseFileName = 'nature-scenery.jpg';
    fileNameEl.textContent = baseFileName;

    const sample = document.createElement('canvas');
    sample.width = 1600;
    sample.height = 1000;
    const sCtx = sample.getContext('2d');

    // Sky gradient
    const sky = sCtx.createLinearGradient(0, 0, 0, 600);
    sky.addColorStop(0, '#1e3a8a');
    sky.addColorStop(0.5, '#3b82f6');
    sky.addColorStop(1, '#93c5fd');
    sCtx.fillStyle = sky;
    sCtx.fillRect(0, 0, 1600, 1000);

    // Glowing sun
    const sun = sCtx.createRadialGradient(800, 300, 10, 800, 300, 160);
    sun.addColorStop(0, '#fef08a');
    sun.addColorStop(0.4, '#fde047');
    sun.addColorStop(1, 'rgba(253, 224, 71, 0)');
    sCtx.fillStyle = sun;
    sCtx.beginPath();
    sCtx.arc(800, 300, 160, 0, Math.PI * 2);
    sCtx.fill();

    // Mountains
    sCtx.fillStyle = '#1e293b';
    sCtx.beginPath();
    sCtx.moveTo(0, 750);
    sCtx.lineTo(350, 420);
    sCtx.lineTo(700, 680);
    sCtx.lineTo(1100, 380);
    sCtx.lineTo(1600, 750);
    sCtx.lineTo(1600, 1000);
    sCtx.lineTo(0, 1000);
    sCtx.closePath();
    sCtx.fill();

    // Foreground hills
    sCtx.fillStyle = '#0f172a';
    sCtx.beginPath();
    sCtx.moveTo(0, 850);
    sCtx.quadraticCurveTo(500, 700, 1000, 880);
    sCtx.quadraticCurveTo(1300, 820, 1600, 890);
    sCtx.lineTo(1600, 1000);
    sCtx.lineTo(0, 1000);
    sCtx.closePath();
    sCtx.fill();

    const img = new Image();
    img.onload = () => {
      baseImage = img;
      initStudio();
    };
    img.src = sample.toDataURL('image/jpeg', 0.92);
  }

  // Load Logo Image from file or URL
  function loadLogo(src) {
    const img = new Image();
    img.onload = () => {
      logoImage = img;
      logoThumb.src = src;
      logoThumb.style.display = 'block';
      logoPrompt.textContent = 'Click to change logo';
      render();
    };
    img.src = src;
  }

  // Init Studio
  function initStudio() {
    baseDimsEl.textContent = `${baseImage.naturalWidth} × ${baseImage.naturalHeight} px`;

    dropZone.style.display = 'none';
    infoStrip.style.display = 'flex';
    studioGrid.style.display = 'grid';

    // Load default logo in background if not already loaded
    if (!logoImage) {
      loadLogo(EMBLEM_SVG);
    }

    render();
  }

  // Draw full watermarked canvas (used for both preview and final export)
  function drawWatermarkedCanvas(targetCanvas) {
    if (!baseImage) return;

    const bW = baseImage.naturalWidth;
    const bH = baseImage.naturalHeight;

    targetCanvas.width = bW;
    targetCanvas.height = bH;
    const tCtx = targetCanvas.getContext('2d');

    // 1. Draw base photo
    tCtx.drawImage(baseImage, 0, 0, bW, bH);

    // 2. Determine watermark parameters
    const isTile = tileToggle.checked;

    if (activeMode === 'text') {
      const text = wmTextInput.value || 'WATERMARK';
      const fontSize = parseInt(fontSizeSlider.value, 10) || 40;
      const fontFamily = fontFamilySelect.value;
      const weight = textBold ? 'bold' : 'normal';
      const style = textItalic ? 'italic' : 'normal';
      const color = textColorInput.value;
      const opacity = parseInt(textOpacitySlider.value, 10) / 100;
      const angle = (parseInt(textRotationSlider.value, 10) * Math.PI) / 180;

      // Font scaling relative to high-res base image
      // Base reference width: 1000px
      const scaleFactor = Math.max(0.6, bW / 1000);
      const effectiveFontSize = Math.round(fontSize * scaleFactor);

      tCtx.font = `${style} ${weight} ${effectiveFontSize}px ${fontFamily}`;
      const textMetrics = tCtx.measureText(text);
      const itemW = textMetrics.width;
      const itemH = effectiveFontSize;

      tCtx.save();
      tCtx.fillStyle = color;
      tCtx.globalAlpha = opacity;
      tCtx.textAlign = 'center';
      tCtx.textBaseline = 'middle';

      if (isTile) {
        // Repeated tiled watermark across canvas
        const gap = (parseInt(tileGapSlider.value, 10) || 180) * scaleFactor;
        const stepX = Math.max(120, itemW + gap);
        const stepY = Math.max(80, itemH + gap * 0.7);

        tCtx.translate(bW / 2, bH / 2);
        // Default slight tilt if rotation is zero, else user angle
        const tileAngle = angle === 0 ? -0.45 : angle;
        tCtx.rotate(tileAngle);

        const diag = Math.sqrt(bW * bW + bH * bH);
        let row = 0;
        for (let y = -diag; y <= diag; y += stepY) {
          const offsetX = (row % 2) * (stepX / 2);
          for (let x = -diag; x <= diag; x += stepX) {
            tCtx.fillText(text, x + offsetX, y);
          }
          row++;
        }
      } else {
        // 9-Point Alignment
        const margin = (parseInt(marginSlider.value, 10) || 30) * scaleFactor;
        const coords = getAnchorCoords(bW, bH, itemW, itemH, margin, activePosition);

        tCtx.translate(coords.x, coords.y);
        tCtx.rotate(angle);
        tCtx.fillText(text, 0, 0);
      }

      tCtx.restore();
    } else if (activeMode === 'logo' && logoImage) {
      const scalePercent = parseInt(logoScaleSlider.value, 10) / 100;
      const opacity = parseInt(logoOpacitySlider.value, 10) / 100;
      const angle = (parseInt(logoRotationSlider.value, 10) * Math.PI) / 180;

      const itemW = bW * scalePercent;
      const itemH = itemW * (logoImage.naturalHeight / logoImage.naturalWidth);

      tCtx.save();
      tCtx.globalAlpha = opacity;

      if (isTile) {
        const scaleFactor = Math.max(0.6, bW / 1000);
        const gap = (parseInt(tileGapSlider.value, 10) || 180) * scaleFactor;
        const stepX = Math.max(120, itemW + gap);
        const stepY = Math.max(80, itemH + gap * 0.8);

        tCtx.translate(bW / 2, bH / 2);
        const tileAngle = angle === 0 ? -0.45 : angle;
        tCtx.rotate(tileAngle);

        const diag = Math.sqrt(bW * bW + bH * bH);
        let row = 0;
        for (let y = -diag; y <= diag; y += stepY) {
          const offsetX = (row % 2) * (stepX / 2);
          for (let x = -diag; x <= diag; x += stepX) {
            tCtx.drawImage(logoImage, x + offsetX - itemW / 2, y - itemH / 2, itemW, itemH);
          }
          row++;
        }
      } else {
        const scaleFactor = Math.max(0.6, bW / 1000);
        const margin = (parseInt(marginSlider.value, 10) || 30) * scaleFactor;
        const coords = getAnchorCoords(bW, bH, itemW, itemH, margin, activePosition);

        tCtx.translate(coords.x, coords.y);
        tCtx.rotate(angle);
        tCtx.drawImage(logoImage, -itemW / 2, -itemH / 2, itemW, itemH);
      }

      tCtx.restore();
    }
  }

  // Anchor Coordinates for 9-Point Grid
  function getAnchorCoords(totalW, totalH, wmW, wmH, margin, pos) {
    let x = totalW / 2;
    let y = totalH / 2;

    switch (pos) {
      case 'top-left':
        x = margin + wmW / 2;
        y = margin + wmH / 2;
        break;
      case 'top-center':
        x = totalW / 2;
        y = margin + wmH / 2;
        break;
      case 'top-right':
        x = totalW - margin - wmW / 2;
        y = margin + wmH / 2;
        break;
      case 'center-left':
        x = margin + wmW / 2;
        y = totalH / 2;
        break;
      case 'center':
        x = totalW / 2;
        y = totalH / 2;
        break;
      case 'center-right':
        x = totalW - margin - wmW / 2;
        y = totalH / 2;
        break;
      case 'bottom-left':
        x = margin + wmW / 2;
        y = totalH - margin - wmH / 2;
        break;
      case 'bottom-center':
        x = totalW / 2;
        y = totalH - margin - wmH / 2;
        break;
      case 'bottom-right':
      default:
        x = totalW - margin - wmW / 2;
        y = totalH - margin - wmH / 2;
        break;
    }

    return { x, y };
  }

  // Render to Live Preview Canvas
  function render() {
    if (!baseImage) return;

    // We render at baseImage full resolution onto canvas,
    // and let CSS max-width/max-height handle smooth downscaling!
    drawWatermarkedCanvas(canvas);
  }

  // Mode Switch Tabs
  tabText.addEventListener('click', () => {
    activeMode = 'text';
    tabText.classList.add('active');
    tabLogo.classList.remove('active');
    textSection.style.display = 'block';
    logoSection.style.display = 'none';
    modeBadge.textContent = 'Text Mode';
    render();
  });

  tabLogo.addEventListener('click', () => {
    activeMode = 'logo';
    tabLogo.classList.add('active');
    tabText.classList.remove('active');
    logoSection.style.display = 'block';
    textSection.style.display = 'none';
    modeBadge.textContent = 'Logo Mode';
    render();
  });

  // Text Inputs Listeners
  wmTextInput.addEventListener('input', render);
  fontFamilySelect.addEventListener('change', render);

  fontSizeSlider.addEventListener('input', () => {
    fontSizeVal.textContent = `${fontSizeSlider.value}px`;
    render();
  });

  btnBold.addEventListener('click', () => {
    textBold = !textBold;
    btnBold.classList.toggle('active', textBold);
    render();
  });

  btnItalic.addEventListener('click', () => {
    textItalic = !textItalic;
    btnItalic.classList.toggle('active', textItalic);
    render();
  });

  textColorInput.addEventListener('input', render);

  textOpacitySlider.addEventListener('input', () => {
    textOpacityVal.textContent = `${textOpacitySlider.value}%`;
    render();
  });

  textRotationSlider.addEventListener('input', () => {
    textRotationVal.textContent = `${textRotationSlider.value}°`;
    render();
  });

  // Logo Inputs Listeners
  logoScaleSlider.addEventListener('input', () => {
    logoScaleVal.textContent = `${logoScaleSlider.value}%`;
    render();
  });

  logoOpacitySlider.addEventListener('input', () => {
    logoOpacityVal.textContent = `${logoOpacitySlider.value}%`;
    render();
  });

  logoRotationSlider.addEventListener('input', () => {
    logoRotationVal.textContent = `${logoRotationSlider.value}°`;
    render();
  });

  useDefaultLogoBtn.addEventListener('click', () => {
    loadLogo(EMBLEM_SVG);
    showToast('Emblem logo loaded.');
  });

  useShieldLogoBtn.addEventListener('click', () => {
    loadLogo(SHIELD_SVG);
    showToast('Shield badge loaded.');
  });

  // Logo file selection
  logoDropZone.addEventListener('click', () => logoFileInput.click());
  logoFileInput.addEventListener('change', (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onload = (evt) => loadLogo(evt.target.result);
      reader.readAsDataURL(file);
    }
  });

  // Placement Listeners
  tileToggle.addEventListener('change', () => {
    if (tileToggle.checked) {
      gridPositionBox.style.display = 'none';
      tileSpacingBox.style.display = 'block';
    } else {
      gridPositionBox.style.display = 'flex';
      tileSpacingBox.style.display = 'none';
    }
    render();
  });

  posButtons.forEach((btn) => {
    btn.addEventListener('click', () => {
      posButtons.forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');
      activePosition = btn.getAttribute('data-pos');
      render();
    });
  });

  marginSlider.addEventListener('input', () => {
    marginVal.textContent = `${marginSlider.value}px`;
    render();
  });

  tileGapSlider.addEventListener('input', () => {
    tileGapVal.textContent = `${tileGapSlider.value}px`;
    render();
  });

  // Base Image Upload / Drop Handlers
  browseBtn.addEventListener('click', () => baseFileInput.click());
  sampleBtn.addEventListener('click', loadSamplePhoto);
  changeImageBtn.addEventListener('click', () => baseFileInput.click());

  baseFileInput.addEventListener('change', (e) => {
    if (e.target.files && e.target.files[0]) {
      loadBaseImage(e.target.files[0]);
    }
  });

  ['dragenter', 'dragover'].forEach((eventName) => {
    dropZone.addEventListener(eventName, (e) => {
      e.preventDefault();
      dropZone.classList.add('drag-over');
    });
  });

  ['dragleave', 'drop'].forEach((eventName) => {
    dropZone.addEventListener(eventName, (e) => {
      e.preventDefault();
      dropZone.classList.remove('drag-over');
    });
  });

  dropZone.addEventListener('drop', (e) => {
    if (e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files[0]) {
      loadBaseImage(e.dataTransfer.files[0]);
    }
  });

  dropZone.addEventListener('click', (e) => {
    if (e.target === dropZone || e.target.closest('h2') || e.target.closest('p') || e.target.closest('svg')) {
      baseFileInput.click();
    }
  });

  // Download Action
  downloadBtn.addEventListener('click', () => {
    if (!baseImage) return;

    const outCanvas = document.createElement('canvas');
    drawWatermarkedCanvas(outCanvas);

    const format = exportFormat.value;
    let ext = 'jpg';
    if (format === 'image/png') ext = 'png';
    else if (format === 'image/webp') ext = 'webp';

    const baseName = baseFileName.replace(/\.[^/.]+$/, '');
    const downloadName = `${baseName}_watermarked.${ext}`;

    outCanvas.toBlob(
      (blob) => {
        if (!blob) return;
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = downloadName;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        showToast(`Saved as ${downloadName}`);
      },
      format,
      0.92
    );
  });
});