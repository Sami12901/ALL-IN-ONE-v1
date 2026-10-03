// Image Cropper - Client-side Interactive Logic

document.addEventListener('DOMContentLoaded', () => {
  // Elements
  const dropZone = document.getElementById('drop-zone');
  const fileInput = document.getElementById('file-input');
  const browseBtn = document.getElementById('browse-btn');
  const sampleBtn = document.getElementById('sample-btn');

  const infoStrip = document.getElementById('info-strip');
  const studioGrid = document.getElementById('studio-grid');
  const fileNameEl = document.getElementById('file-name');
  const origDimsEl = document.getElementById('orig-dims');
  const croppedDimsStripEl = document.getElementById('cropped-dims-strip');
  const ratioBadge = document.getElementById('ratio-badge');
  const changeImageBtn = document.getElementById('change-image-btn');
  const resetCropBtn = document.getElementById('reset-crop-btn');

  const stageWrapper = document.getElementById('stage-wrapper');
  const canvas = document.getElementById('crop-canvas');
  const ctx = canvas.getContext('2d');

  const aspectButtons = document.querySelectorAll('.aspect-btn');
  const rotateCcwBtn = document.getElementById('rotate-ccw-btn');
  const rotateCwBtn = document.getElementById('rotate-cw-btn');
  const flipHBtn = document.getElementById('flip-h-btn');
  const flipVBtn = document.getElementById('flip-v-btn');

  const dimCardOrig = document.getElementById('dim-card-orig');
  const dimCardCropped = document.getElementById('dim-card-cropped');
  const dimCardRatio = document.getElementById('dim-card-ratio');

  const exportFormat = document.getElementById('export-format');
  const exportQuality = document.getElementById('export-quality');
  const qualityVal = document.getElementById('quality-val');
  const qualityControl = document.getElementById('quality-control');
  const downloadBtn = document.getElementById('download-btn');
  const clipboardBtn = document.getElementById('clipboard-btn');
  const toast = document.getElementById('toast');

  // Application State
  let rawImage = null;
  let sourceFileName = 'image.jpg';
  let rotation = 0; // 0, 90, 180, 270
  let flipH = false;
  let flipV = false;

  let activeRatio = null; // null for freeform, or { w: 1, h: 1 }, etc.
  let activeRatioName = 'Freeform';

  let transformedCanvas = document.createElement('canvas');
  let transformedCtx = transformedCanvas.getContext('2d');

  let cropBox = { x: 0, y: 0, w: 100, h: 100 };
  let dragAction = null; // null | 'move' | 'nw' | 'ne' | 'se' | 'sw' | 'n' | 's' | 'e' | 'w'
  let dragStart = { x: 0, y: 0 };
  let initialBox = { x: 0, y: 0, w: 0, h: 0 };

  const HANDLE_SIZE = 9;
  const HIT_THRESHOLD = 14;

  // Show Toast
  function showToast(message, isSuccess = true) {
    if (!toast) return;
    toast.textContent = message;
    toast.className = `cropper-toast show ${isSuccess ? 'success' : ''}`;
    setTimeout(() => {
      toast.className = 'cropper-toast';
    }, 2800);
  }

  // Quality display toggle
  function updateQualityVisibility() {
    if (exportFormat.value === 'image/png') {
      qualityControl.style.opacity = '0.4';
      qualityControl.style.pointerEvents = 'none';
    } else {
      qualityControl.style.opacity = '1';
      qualityControl.style.pointerEvents = 'auto';
    }
  }

  exportFormat.addEventListener('change', updateQualityVisibility);
  exportQuality.addEventListener('input', () => {
    qualityVal.textContent = `${exportQuality.value}%`;
  });
  updateQualityVisibility();

  // Load Image File
  function loadFile(file) {
    if (!file || !file.type.startsWith('image/')) {
      alert('Please select a valid image file.');
      return;
    }

    sourceFileName = file.name || 'image.jpg';
    fileNameEl.textContent = sourceFileName;

    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        rawImage = img;
        rotation = 0;
        flipH = false;
        flipV = false;
        initStudio();
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  }

  // Create High-Res Sample Image for immediate demo
  function loadSampleImage() {
    sourceFileName = 'sample-scenery.jpg';
    fileNameEl.textContent = sourceFileName;

    const sampleCanvas = document.createElement('canvas');
    sampleCanvas.width = 1280;
    sampleCanvas.height = 800;
    const sCtx = sampleCanvas.getContext('2d');

    // Gradient Background
    const grad = sCtx.createLinearGradient(0, 0, 1280, 800);
    grad.addColorStop(0, '#1e293b');
    grad.addColorStop(0.5, '#0f172a');
    grad.addColorStop(1, '#1e1b4b');
    sCtx.fillStyle = grad;
    sCtx.fillRect(0, 0, 1280, 800);

    // Sun / Orb
    const sunGrad = sCtx.createRadialGradient(640, 340, 20, 640, 340, 240);
    sunGrad.addColorStop(0, '#f97316');
    sunGrad.addColorStop(0.6, '#ec4899');
    sunGrad.addColorStop(1, 'rgba(236, 72, 153, 0)');
    sCtx.fillStyle = sunGrad;
    sCtx.beginPath();
    sCtx.arc(640, 340, 240, 0, Math.PI * 2);
    sCtx.fill();

    // Mountain silhouettes
    sCtx.fillStyle = '#090d16';
    sCtx.beginPath();
    sCtx.moveTo(0, 800);
    sCtx.lineTo(220, 480);
    sCtx.lineTo(440, 640);
    sCtx.lineTo(720, 420);
    sCtx.lineTo(1020, 680);
    sCtx.lineTo(1280, 490);
    sCtx.lineTo(1280, 800);
    sCtx.closePath();
    sCtx.fill();

    // Grid lines / decorative elements
    sCtx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
    sCtx.lineWidth = 1;
    for (let x = 0; x < 1280; x += 80) {
      sCtx.beginPath();
      sCtx.moveTo(x, 0);
      sCtx.lineTo(x, 800);
      sCtx.stroke();
    }
    for (let y = 0; y < 800; y += 80) {
      sCtx.beginPath();
      sCtx.moveTo(0, y);
      sCtx.lineTo(1280, y);
      sCtx.stroke();
    }

    // Typography
    sCtx.fillStyle = '#ffffff';
    sCtx.font = 'bold 44px sans-serif';
    sCtx.textAlign = 'center';
    sCtx.fillText('ALL IN ONE STUDIO', 640, 720);
    sCtx.font = '20px sans-serif';
    sCtx.fillStyle = '#94a3b8';
    sCtx.fillText('Sample Canvas Image (1280 × 800 px)', 640, 755);

    const img = new Image();
    img.onload = () => {
      rawImage = img;
      rotation = 0;
      flipH = false;
      flipV = false;
      initStudio();
    };
    img.src = sampleCanvas.toDataURL('image/jpeg', 0.95);
  }

  // Update Transformed Source Canvas
  function updateTransformedCanvas() {
    if (!rawImage) return;

    const isRotated90or270 = rotation === 90 || rotation === 270;
    const tW = isRotated90or270 ? rawImage.height : rawImage.width;
    const tH = isRotated90or270 ? rawImage.width : rawImage.height;

    transformedCanvas.width = tW;
    transformedCanvas.height = tH;

    transformedCtx.save();
    transformedCtx.clearRect(0, 0, tW, tH);
    transformedCtx.translate(tW / 2, tH / 2);
    transformedCtx.rotate((rotation * Math.PI) / 180);
    transformedCtx.scale(flipH ? -1 : 1, flipV ? -1 : 1);
    transformedCtx.drawImage(rawImage, -rawImage.width / 2, -rawImage.height / 2);
    transformedCtx.restore();
  }

  // Fit display canvas to stage container
  function updateDisplayCanvasSize() {
    if (!transformedCanvas.width) return;

    const maxW = Math.max(300, stageWrapper.clientWidth - 40);
    const maxH = 540;

    const tW = transformedCanvas.width;
    const tH = transformedCanvas.height;
    const aspect = tW / tH;

    let dW = maxW;
    let dH = dW / aspect;

    if (dH > maxH) {
      dH = maxH;
      dW = dH * aspect;
    }

    canvas.width = Math.round(dW);
    canvas.height = Math.round(dH);
  }

  // Reset or initialize crop box
  function resetCropBox(keepRatio = true) {
    const cW = canvas.width;
    const cH = canvas.height;

    if (!activeRatio || !keepRatio) {
      // 80% centered default
      const w = Math.round(cW * 0.8);
      const h = Math.round(cH * 0.8);
      cropBox = {
        x: Math.round((cW - w) / 2),
        y: Math.round((cH - h) / 2),
        w: Math.max(20, w),
        h: Math.max(20, h),
      };
    } else {
      applyRatioToBox(activeRatio.w / activeRatio.h);
    }
    render();
  }

  function applyRatioToBox(ratioVal) {
    const cW = canvas.width;
    const cH = canvas.height;

    let targetW = Math.round(cW * 0.8);
    let targetH = Math.round(targetW / ratioVal);

    if (targetH > cH * 0.85) {
      targetH = Math.round(cH * 0.85);
      targetW = Math.round(targetH * ratioVal);
    }
    if (targetW > cW) {
      targetW = cW;
      targetH = Math.round(targetW / ratioVal);
    }

    cropBox = {
      x: Math.round((cW - targetW) / 2),
      y: Math.round((cH - targetH) / 2),
      w: Math.max(20, targetW),
      h: Math.max(20, targetH),
    };
  }

  // Initialize workspace when image is loaded
  function initStudio() {
    updateTransformedCanvas();

    dropZone.style.display = 'none';
    infoStrip.style.display = 'flex';
    studioGrid.style.display = 'grid';

    updateDisplayCanvasSize();
    resetCropBox(false);
  }

  // Handle Window Resize
  window.addEventListener('resize', () => {
    if (!rawImage || !canvas.width) return;
    const oldW = canvas.width;
    const oldH = canvas.height;

    updateDisplayCanvasSize();
    if (oldW > 0 && oldH > 0) {
      const scaleX = canvas.width / oldW;
      const scaleY = canvas.height / oldH;
      cropBox.x = Math.round(cropBox.x * scaleX);
      cropBox.y = Math.round(cropBox.y * scaleY);
      cropBox.w = Math.max(20, Math.round(cropBox.w * scaleX));
      cropBox.h = Math.max(20, Math.round(cropBox.h * scaleY));
      clampBox();
    }
    render();
  });

  // Clamp Crop Box to Canvas Bounds
  function clampBox() {
    cropBox.w = Math.max(20, Math.min(cropBox.w, canvas.width));
    cropBox.h = Math.max(20, Math.min(cropBox.h, canvas.height));
    cropBox.x = Math.max(0, Math.min(cropBox.x, canvas.width - cropBox.w));
    cropBox.y = Math.max(0, Math.min(cropBox.y, canvas.height - cropBox.h));
  }

  // Calculate Real Dimensions in Source Image Pixels
  function getSourceCropDims() {
    if (!canvas.width || !transformedCanvas.width) {
      return { origW: 0, origH: 0, cropX: 0, cropY: 0, cropW: 0, cropH: 0 };
    }
    const scaleX = transformedCanvas.width / canvas.width;
    const scaleY = transformedCanvas.height / canvas.height;

    const cropX = Math.round(cropBox.x * scaleX);
    const cropY = Math.round(cropBox.y * scaleY);
    const cropW = Math.round(cropBox.w * scaleX);
    const cropH = Math.round(cropBox.h * scaleY);

    return {
      origW: transformedCanvas.width,
      origH: transformedCanvas.height,
      cropX,
      cropY,
      cropW: Math.min(cropW, transformedCanvas.width - cropX),
      cropH: Math.min(cropH, transformedCanvas.height - cropY),
    };
  }

  // Update UI Stats
  function updateStats() {
    const { origW, origH, cropW, cropH } = getSourceCropDims();
    const origText = `${origW} × ${origH} px`;
    const cropText = `${cropW} × ${cropH} px`;

    origDimsEl.textContent = origText;
    croppedDimsStripEl.textContent = cropText;
    dimCardOrig.textContent = origText;
    dimCardCropped.textContent = cropText;
    dimCardRatio.textContent = activeRatioName;
    ratioBadge.textContent = activeRatioName;
  }

  // Get Handle Coordinates
  function getHandles() {
    const { x, y, w, h } = cropBox;
    return {
      nw: { x: x, y: y },
      ne: { x: x + w, y: y },
      se: { x: x + w, y: y + h },
      sw: { x: x, y: y + h },
      n: { x: x + w / 2, y: y },
      s: { x: x + w / 2, y: y + h },
      w: { x: x, y: y + h / 2 },
      e: { x: x + w, y: y + h / 2 },
    };
  }

  // Render Canvas
  function render() {
    if (!rawImage || !canvas.width || !canvas.height) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // 1. Draw transformed image scaled to fit canvas
    ctx.drawImage(transformedCanvas, 0, 0, canvas.width, canvas.height);

    // 2. Dark Overlay Outside Crop Area (evenodd cutout)
    ctx.fillStyle = 'rgba(0, 0, 0, 0.65)';
    ctx.beginPath();
    ctx.rect(0, 0, canvas.width, canvas.height);
    ctx.rect(cropBox.x, cropBox.y, cropBox.w, cropBox.h);
    ctx.fill('evenodd');

    // 3. Crop Box Border
    ctx.strokeStyle = '#4e85bf';
    ctx.lineWidth = 2;
    ctx.strokeRect(cropBox.x, cropBox.y, cropBox.w, cropBox.h);

    // 4. Rule-of-Thirds Grid Lines
    ctx.save();
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.45)';
    ctx.lineWidth = 1;
    ctx.setLineDash([4, 4]);

    const col1 = cropBox.x + cropBox.w / 3;
    const col2 = cropBox.x + (2 * cropBox.w) / 3;
    const row1 = cropBox.y + cropBox.h / 3;
    const row2 = cropBox.y + (2 * cropBox.h) / 3;

    ctx.beginPath();
    // Vertical grid
    ctx.moveTo(col1, cropBox.y);
    ctx.lineTo(col1, cropBox.y + cropBox.h);
    ctx.moveTo(col2, cropBox.y);
    ctx.lineTo(col2, cropBox.y + cropBox.h);
    // Horizontal grid
    ctx.moveTo(cropBox.x, row1);
    ctx.lineTo(cropBox.x + cropBox.w, row1);
    ctx.moveTo(cropBox.x, row2);
    ctx.lineTo(cropBox.x + cropBox.w, row2);
    ctx.stroke();
    ctx.restore();

    // 5. Dimension tag inside crop box
    const { cropW, cropH } = getSourceCropDims();
    const tagText = `${cropW} × ${cropH}`;
    ctx.save();
    ctx.font = '600 11px system-ui, -apple-system, sans-serif';
    const tagWidth = ctx.measureText(tagText).width + 12;
    const tagX = cropBox.x + 6;
    const tagY = cropBox.y + 6;

    if (cropBox.w > tagWidth + 10 && cropBox.h > 35) {
      ctx.fillStyle = 'rgba(15, 23, 42, 0.75)';
      ctx.fillRect(tagX, tagY, tagWidth, 20);
      ctx.fillStyle = '#ffffff';
      ctx.textBaseline = 'middle';
      ctx.fillText(tagText, tagX + 6, tagY + 10);
    }
    ctx.restore();

    // 6. Draw Handles
    const handles = getHandles();
    ctx.fillStyle = '#ffffff';
    ctx.strokeStyle = '#4e85bf';
    ctx.lineWidth = 2;

    // Corner Handles (Squares)
    ['nw', 'ne', 'se', 'sw'].forEach((key) => {
      const h = handles[key];
      ctx.fillRect(h.x - HANDLE_SIZE / 2, h.y - HANDLE_SIZE / 2, HANDLE_SIZE, HANDLE_SIZE);
      ctx.strokeRect(h.x - HANDLE_SIZE / 2, h.y - HANDLE_SIZE / 2, HANDLE_SIZE, HANDLE_SIZE);
    });

    // Edge Handles (Pill Bars)
    ['n', 's'].forEach((key) => {
      const h = handles[key];
      ctx.fillRect(h.x - 10, h.y - 3, 20, 6);
      ctx.strokeRect(h.x - 10, h.y - 3, 20, 6);
    });
    ['w', 'e'].forEach((key) => {
      const h = handles[key];
      ctx.fillRect(h.x - 3, h.y - 10, 6, 20);
      ctx.strokeRect(h.x - 3, h.y - 10, 6, 20);
    });

    updateStats();
  }

  // Pointer position helper
  function getCanvasPos(e) {
    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX - rect.left) * (canvas.width / rect.width);
    const y = (e.clientY - rect.top) * (canvas.height / rect.height);
    return { x, y };
  }

  // Hit Test
  function getHitAction(pos) {
    const handles = getHandles();

    // Check corners first
    const corners = ['nw', 'ne', 'se', 'sw'];
    for (const key of corners) {
      const h = handles[key];
      if (Math.abs(pos.x - h.x) <= HIT_THRESHOLD && Math.abs(pos.y - h.y) <= HIT_THRESHOLD) {
        return key;
      }
    }

    // Check edges
    const edges = ['n', 's', 'e', 'w'];
    for (const key of edges) {
      const h = handles[key];
      if (Math.abs(pos.x - h.x) <= HIT_THRESHOLD && Math.abs(pos.y - h.y) <= HIT_THRESHOLD) {
        return key;
      }
    }

    // Inside box
    if (
      pos.x >= cropBox.x &&
      pos.x <= cropBox.x + cropBox.w &&
      pos.y >= cropBox.y &&
      pos.y <= cropBox.y + cropBox.h
    ) {
      return 'move';
    }

    return null;
  }

  // Cursor selector
  function getCursorForAction(action) {
    switch (action) {
      case 'nw':
      case 'se':
        return 'nwse-resize';
      case 'ne':
      case 'sw':
        return 'nesw-resize';
      case 'n':
      case 's':
        return 'ns-resize';
      case 'e':
      case 'w':
        return 'ew-resize';
      case 'move':
        return 'move';
      default:
        return 'crosshair';
    }
  }

  // Pointer Down
  canvas.addEventListener('pointerdown', (e) => {
    if (!rawImage) return;
    const pos = getCanvasPos(e);
    const hit = getHitAction(pos);

    dragAction = hit || 'move';
    dragStart = { x: pos.x, y: pos.y };
    initialBox = { ...cropBox };

    // If clicked outside entirely, center crop box on clicked point
    if (!hit) {
      cropBox.x = Math.max(0, Math.min(pos.x - cropBox.w / 2, canvas.width - cropBox.w));
      cropBox.y = Math.max(0, Math.min(pos.y - cropBox.h / 2, canvas.height - cropBox.h));
      initialBox = { ...cropBox };
      dragAction = 'move';
      render();
    }

    canvas.setPointerCapture(e.pointerId);
  });

  // Pointer Move
  canvas.addEventListener('pointermove', (e) => {
    if (!rawImage) return;
    const pos = getCanvasPos(e);

    if (!dragAction) {
      const hit = getHitAction(pos);
      canvas.style.cursor = getCursorForAction(hit);
      return;
    }

    const dx = pos.x - dragStart.x;
    const dy = pos.y - dragStart.y;

    if (dragAction === 'move') {
      cropBox.x = Math.max(0, Math.min(initialBox.x + dx, canvas.width - initialBox.w));
      cropBox.y = Math.max(0, Math.min(initialBox.y + dy, canvas.height - initialBox.h));
      render();
      return;
    }

    // Resizing
    let newX = initialBox.x;
    let newY = initialBox.y;
    let newW = initialBox.w;
    let newH = initialBox.h;

    const ratio = activeRatio ? activeRatio.w / activeRatio.h : null;

    if (dragAction === 'se') {
      newW = Math.max(20, initialBox.w + dx);
      newH = ratio ? newW / ratio : Math.max(20, initialBox.h + dy);
      if (newX + newW > canvas.width) {
        newW = canvas.width - newX;
        if (ratio) newH = newW / ratio;
      }
      if (newY + newH > canvas.height) {
        newH = canvas.height - newY;
        if (ratio) newW = newH * ratio;
      }
    } else if (dragAction === 'sw') {
      newW = Math.max(20, initialBox.w - dx);
      newH = ratio ? newW / ratio : Math.max(20, initialBox.h + dy);
      if (ratio && newY + newH > canvas.height) {
        newH = canvas.height - newY;
        newW = newH * ratio;
      }
      newX = initialBox.x + initialBox.w - newW;
      if (newX < 0) {
        newX = 0;
        newW = initialBox.x + initialBox.w;
        if (ratio) newH = newW / ratio;
      }
    } else if (dragAction === 'ne') {
      newW = Math.max(20, initialBox.w + dx);
      newH = ratio ? newW / ratio : Math.max(20, initialBox.h - dy);
      if (newX + newW > canvas.width) {
        newW = canvas.width - newX;
        if (ratio) newH = newW / ratio;
      }
      newY = initialBox.y + initialBox.h - newH;
      if (newY < 0) {
        newY = 0;
        newH = initialBox.y + initialBox.h;
        if (ratio) newW = newH * ratio;
      }
    } else if (dragAction === 'nw') {
      newW = Math.max(20, initialBox.w - dx);
      newH = ratio ? newW / ratio : Math.max(20, initialBox.h - dy);
      newX = initialBox.x + initialBox.w - newW;
      newY = initialBox.y + initialBox.h - newH;
      if (newX < 0) {
        newX = 0;
        newW = initialBox.x + initialBox.w;
        if (ratio) newH = newW / ratio;
        newY = initialBox.y + initialBox.h - newH;
      }
      if (newY < 0) {
        newY = 0;
        newH = initialBox.y + initialBox.h;
        if (ratio) {
          newW = newH * ratio;
          newX = initialBox.x + initialBox.w - newW;
        }
      }
    } else if (dragAction === 'e') {
      newW = Math.max(20, initialBox.w + dx);
      if (ratio) {
        newH = newW / ratio;
        newY = initialBox.y + (initialBox.h - newH) / 2;
      }
    } else if (dragAction === 'w') {
      newW = Math.max(20, initialBox.w - dx);
      newX = initialBox.x + initialBox.w - newW;
      if (ratio) {
        newH = newW / ratio;
        newY = initialBox.y + (initialBox.h - newH) / 2;
      }
    } else if (dragAction === 's') {
      newH = Math.max(20, initialBox.h + dy);
      if (ratio) {
        newW = newH * ratio;
        newX = initialBox.x + (initialBox.w - newW) / 2;
      }
    } else if (dragAction === 'n') {
      newH = Math.max(20, initialBox.h - dy);
      newY = initialBox.y + initialBox.h - newH;
      if (ratio) {
        newW = newH * ratio;
        newX = initialBox.x + (initialBox.w - newW) / 2;
      }
    }

    // Apply values & clamp
    cropBox.x = Math.round(newX);
    cropBox.y = Math.round(newY);
    cropBox.w = Math.round(newW);
    cropBox.h = Math.round(newH);
    clampBox();
    render();
  });

  // Pointer Up
  function endDrag(e) {
    if (dragAction) {
      dragAction = null;
      try {
        canvas.releasePointerCapture(e.pointerId);
      } catch (_) {}
    }
  }
  canvas.addEventListener('pointerup', endDrag);
  canvas.addEventListener('pointercancel', endDrag);

  // Aspect Ratio Preset Buttons
  aspectButtons.forEach((btn) => {
    btn.addEventListener('click', () => {
      aspectButtons.forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');

      const ratioStr = btn.getAttribute('data-ratio');
      if (ratioStr === 'free') {
        activeRatio = null;
        activeRatioName = 'Freeform';
      } else {
        const [w, h] = ratioStr.split(':').map(Number);
        activeRatio = { w, h };
        activeRatioName = ratioStr;
        applyRatioToBox(w / h);
      }
      render();
    });
  });

  // Transformations
  rotateCwBtn.addEventListener('click', () => {
    rotation = (rotation + 90) % 360;
    updateTransformedCanvas();
    updateDisplayCanvasSize();
    resetCropBox(true);
  });

  rotateCcwBtn.addEventListener('click', () => {
    rotation = (rotation - 90 + 360) % 360;
    updateTransformedCanvas();
    updateDisplayCanvasSize();
    resetCropBox(true);
  });

  flipHBtn.addEventListener('click', () => {
    flipH = !flipH;
    updateTransformedCanvas();
    render();
  });

  flipVBtn.addEventListener('click', () => {
    flipV = !flipV;
    updateTransformedCanvas();
    render();
  });

  // Reset Crop Button
  resetCropBtn.addEventListener('click', () => {
    resetCropBox(true);
    showToast('Crop boundary reset.');
  });

  // Change Image Button
  changeImageBtn.addEventListener('click', () => {
    fileInput.click();
  });

  // Generate Cropped Offscreen Canvas
  function getCroppedCanvas() {
    const { cropX, cropY, cropW, cropH } = getSourceCropDims();
    if (cropW <= 0 || cropH <= 0) return null;

    const outCanvas = document.createElement('canvas');
    outCanvas.width = cropW;
    outCanvas.height = cropH;
    const outCtx = outCanvas.getContext('2d');

    outCtx.drawImage(transformedCanvas, cropX, cropY, cropW, cropH, 0, 0, cropW, cropH);
    return outCanvas;
  }

  // Download Cropped Image
  downloadBtn.addEventListener('click', () => {
    const cropped = getCroppedCanvas();
    if (!cropped) {
      alert('Unable to crop. Please check image boundaries.');
      return;
    }

    const format = exportFormat.value;
    const quality = parseFloat(exportQuality.value) / 100;
    let ext = 'jpg';
    if (format === 'image/png') ext = 'png';
    else if (format === 'image/webp') ext = 'webp';

    const baseName = sourceFileName.replace(/\.[^/.]+$/, '');
    const downloadName = `${baseName}_cropped.${ext}`;

    cropped.toBlob(
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
      quality
    );
  });

  // Copy to Clipboard
  clipboardBtn.addEventListener('click', async () => {
    const cropped = getCroppedCanvas();
    if (!cropped) return;

    cropped.toBlob(async (blob) => {
      if (!blob) return;
      try {
        if (navigator.clipboard && navigator.clipboard.write) {
          const item = new ClipboardItem({ 'image/png': blob });
          await navigator.clipboard.write([item]);
          showToast('Image copied to clipboard!');
        } else {
          showToast('Clipboard API not supported on this browser.', false);
        }
      } catch (err) {
        console.error('Clipboard copy failed:', err);
        showToast('Clipboard copy failed.', false);
      }
    }, 'image/png');
  });

  // File Upload Handlers
  browseBtn.addEventListener('click', () => fileInput.click());
  sampleBtn.addEventListener('click', loadSampleImage);

  fileInput.addEventListener('change', (e) => {
    if (e.target.files && e.target.files[0]) {
      loadFile(e.target.files[0]);
    }
  });

  // Drag & Drop
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
      loadFile(e.dataTransfer.files[0]);
    }
  });

  // Drop zone click triggers browse
  dropZone.addEventListener('click', (e) => {
    if (e.target === dropZone || e.target.closest('h2') || e.target.closest('p') || e.target.closest('svg')) {
      fileInput.click();
    }
  });
});