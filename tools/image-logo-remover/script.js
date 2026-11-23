/**
 * Image Logo Remover - Client-side interactive studio
 * Fully offline, zero network requests, powered by MediaRemovalEngine.
 */

document.addEventListener('DOMContentLoaded', () => {
  const engine = window.MediaRemovalEngine;
  if (!engine) {
    console.error('MediaRemovalEngine shared library not loaded.');
    return;
  }

  // DOM Elements
  const dropZone = document.getElementById('drop-zone');
  const fileInput = document.getElementById('file-input');
  const browseBtn = document.getElementById('browse-btn');
  const sampleBtn = document.getElementById('sample-btn');

  const infoStrip = document.getElementById('info-strip');
  const fileNameEl = document.getElementById('file-name');
  const origDimsEl = document.getElementById('orig-dims');
  const detectionBadge = document.getElementById('detection-badge');
  const changeImageBtn = document.getElementById('change-image-btn');
  const resetImageBtn = document.getElementById('reset-image-btn');

  const studioGrid = document.getElementById('studio-grid');
  const canvasContainer = document.getElementById('canvas-container');
  const sourceCanvas = document.getElementById('source-canvas');
  const sourceCtx = sourceCanvas.getContext('2d');
  const processOverlay = document.getElementById('process-overlay');
  const processStatus = document.getElementById('process-status');
  const statusIndicator = document.getElementById('status-indicator');

  const compareBtn = document.getElementById('compare-btn');
  const clearSelectionBtn = document.getElementById('clear-selection-btn');

  const modeBoxBtn = document.getElementById('mode-box-btn');
  const modeBrushBtn = document.getElementById('mode-brush-btn');
  const brushControls = document.getElementById('brush-controls');
  const brushSizeSlider = document.getElementById('brush-size-slider');
  const brushSizeVal = document.getElementById('brush-size-val');
  const brushEraserBtn = document.getElementById('brush-eraser-btn');
  const brushUndoBtn = document.getElementById('brush-undo-btn');

  const autoDetectBtn = document.getElementById('auto-detect-btn');
  const autoRemoveBtn = document.getElementById('auto-remove-btn');

  const algorithmSelect = document.getElementById('algorithm-select');
  const radiusSlider = document.getElementById('radius-slider');
  const radiusVal = document.getElementById('radius-val');

  const applyInpaintBtn = document.getElementById('apply-inpaint-btn');
  const downloadBtn = document.getElementById('download-btn');

  // Application State
  let selectionController = null;
  let originalImageData = null;
  let currentImageData = null;
  let isComparing = false;
  let currentFileName = 'sample-logo.png';

  // 1. File Handling & Sample Loading
  browseBtn.addEventListener('click', () => {
    fileInput.value = '';
    fileInput.click();
  });
  dropZone.addEventListener('click', (e) => {
    if (e.target !== browseBtn && e.target !== sampleBtn) {
      fileInput.value = '';
      fileInput.click();
    }
  });

  dropZone.addEventListener('dragover', (e) => {
    e.preventDefault();
    dropZone.classList.add('dragover');
  });

  dropZone.addEventListener('dragleave', () => {
    dropZone.classList.remove('dragover');
  });

  dropZone.addEventListener('drop', (e) => {
    e.preventDefault();
    dropZone.classList.remove('dragover');
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      loadFile(e.dataTransfer.files[0]);
    }
  });

  fileInput.addEventListener('change', (e) => {
    if (e.target.files && e.target.files[0]) {
      loadFile(e.target.files[0]);
    }
  });

  sampleBtn.addEventListener('click', () => {
    loadSamplePhoto();
  });

  changeImageBtn.addEventListener('click', () => {
    fileInput.value = '';
    fileInput.click();
  });

  resetImageBtn.addEventListener('click', () => {
    if (!originalImageData) return;
    currentImageData = engine.cloneImageData(originalImageData);
    sourceCtx.putImageData(currentImageData, 0, 0);
    if (selectionController) selectionController.clear();
    downloadBtn.disabled = true;
    statusIndicator.textContent = 'Reset to original image';
  });

  function loadFile(file) {
    if (!file.type.startsWith('image/')) {
      alert('Please select a valid image file (PNG, JPG, WebP).');
      return;
    }
    currentFileName = file.name;
    const reader = new FileReader();
    reader.onload = (evt) => {
      const img = new Image();
      img.onload = () => {
        initializeWithImage(img, currentFileName);
      };
      img.src = evt.target.result;
    };
    reader.readAsDataURL(file);
  }

  function loadSamplePhoto() {
    currentFileName = 'sample-logo-photo.png';
    const sample = engine.generateSampleImage('logo', { width: 640, height: 360 });
    if (sample.canvas) {
      initializeWithImage(sample.canvas, currentFileName);
    } else {
      sourceCanvas.width = sample.imageData.width;
      sourceCanvas.height = sample.imageData.height;
      sourceCtx.putImageData(sample.imageData, 0, 0);
      setupWorkspace(sample.imageData.width, sample.imageData.height, currentFileName);
    }
  }

  function initializeWithImage(imgSource, fileName) {
    const W = imgSource.width || imgSource.naturalWidth;
    const H = imgSource.height || imgSource.naturalHeight;

    sourceCanvas.width = W;
    sourceCanvas.height = H;
    sourceCtx.drawImage(imgSource, 0, 0);

    setupWorkspace(W, H, fileName);
  }

  function setupWorkspace(width, height, fileName) {
    originalImageData = sourceCtx.getImageData(0, 0, width, height);
    currentImageData = engine.cloneImageData(originalImageData);

    fileNameEl.textContent = fileName;
    origDimsEl.textContent = `${width} × ${height} px`;
    dropZone.style.display = 'none';
    infoStrip.style.display = 'flex';
    studioGrid.style.display = 'grid';
    downloadBtn.disabled = true;
    detectionBadge.style.display = 'none';
    statusIndicator.textContent = 'Image loaded. Select logo or click Auto-Detect.';

    if (selectionController) {
      selectionController.destroy();
    }

    selectionController = engine.createSelectionController(canvasContainer, {
      mode: 'box',
      brushSize: parseInt(brushSizeSlider.value, 10),
      initialBox: { x: 0.7, y: 0.08, w: 0.24, h: 0.24 }
    });

    setMode('box');
  }

  // 2. Selection Mode Toggles
  function setMode(mode) {
    if (!selectionController) return;
    selectionController.setMode(mode);
    if (mode === 'box') {
      modeBoxBtn.classList.add('active');
      modeBrushBtn.classList.remove('active');
      brushControls.style.display = 'none';
    } else {
      modeBoxBtn.classList.remove('active');
      modeBrushBtn.classList.add('active');
      brushControls.style.display = 'block';
    }
  }

  modeBoxBtn.addEventListener('click', () => setMode('box'));
  modeBrushBtn.addEventListener('click', () => setMode('brush'));

  brushSizeSlider.addEventListener('input', (e) => {
    const val = parseInt(e.target.value, 10);
    brushSizeVal.textContent = `${val}px`;
    if (selectionController) selectionController.setBrushSize(val);
  });

  radiusSlider.addEventListener('input', (e) => {
    radiusVal.textContent = `${e.target.value}px`;
  });

  let eraserActive = false;
  brushEraserBtn.addEventListener('click', () => {
    if (!selectionController) return;
    eraserActive = !eraserActive;
    selectionController.setEraser(eraserActive);
    brushEraserBtn.classList.toggle('active', eraserActive);
    brushEraserBtn.style.background = eraserActive ? 'var(--accent)' : '';
    brushEraserBtn.style.color = eraserActive ? '#fff' : '';
  });

  brushUndoBtn.addEventListener('click', () => {
    if (selectionController) selectionController.undo();
  });

  clearSelectionBtn.addEventListener('click', () => {
    if (selectionController) selectionController.clear();
    detectionBadge.style.display = 'none';
    statusIndicator.textContent = 'Selection cleared';
  });

  // 3. Auto-Detection
  autoDetectBtn.addEventListener('click', () => {
    performAutoDetection(false);
  });

  autoRemoveBtn.addEventListener('click', () => {
    performAutoDetection(true);
  });

  function performAutoDetection(andRemove = false) {
    if (!currentImageData || !selectionController) return;
    statusIndicator.textContent = 'Scanning image for logos and emblems...';

    // Run client-side heuristic logo detection
    const regions = engine.autoDetectLogos(currentImageData, {
      sensitivity: 0.65,
      minArea: 50
    });

    if (!regions || regions.length === 0) {
      statusIndicator.textContent = 'No logo regions detected. Use manual selection.';
      return;
    }

    detectionBadge.style.display = 'inline-flex';
    detectionBadge.textContent = `${regions.length} Logo Region${regions.length > 1 ? 's' : ''} Detected`;

    const W = sourceCanvas.width;
    const H = sourceCanvas.height;
    const mask = engine.createMaskFromRegions(regions, W, H, 6);

    if (regions.length === 1 && modeBoxBtn.classList.contains('active')) {
      const r = regions[0];
      selectionController.setBoundingBox({
        x: r.x / W,
        y: r.y / H,
        w: r.w / W,
        h: r.h / H
      });
    } else {
      setMode('brush');
      if (typeof selectionController.setMask === 'function') {
        selectionController.setMask(mask, W, H);
      }
    }

    statusIndicator.textContent = `${regions.length} logo region(s) selected`;

    if (andRemove) {
      executeInpaint();
    }
  }

  // 4. Inpainting Execution
  applyInpaintBtn.addEventListener('click', () => {
    executeInpaint();
  });

  function executeInpaint() {
    if (!currentImageData || !selectionController) return;

    const W = sourceCanvas.width;
    const H = sourceCanvas.height;
    const mask = selectionController.getBinaryMask(W, H);

    let markedCount = 0;
    for (let i = 0; i < mask.length; i++) {
      if (mask[i] === 255) markedCount++;
    }

    if (markedCount === 0) {
      alert('Please select the logo region to remove or click "Scan for Logos".');
      return;
    }

    processOverlay.style.display = 'flex';
    processStatus.textContent = 'Synthesizing background texture...';
    statusIndicator.textContent = 'Processing logo removal...';

    setTimeout(() => {
      try {
        const algo = algorithmSelect.value;
        const rad = parseInt(radiusSlider.value, 10) || 4;
        let result;

        if (algo === 'delogo') {
          let box;
          const isBrush = (selectionController.getMode && selectionController.getMode() === 'brush') ||
                          modeBrushBtn.classList.contains('active');
          if (isBrush) {
            let minX = W, minY = H, maxX = -1, maxY = -1;
            for (let y = 0; y < H; y++) {
              const rowOffset = y * W;
              for (let x = 0; x < W; x++) {
                if (mask[rowOffset + x] === 255) {
                  if (x < minX) minX = x;
                  if (x > maxX) maxX = x;
                  if (y < minY) minY = y;
                  if (y > maxY) maxY = y;
                }
              }
            }
            if (maxX >= minX && maxY >= minY) {
              box = {
                x: minX,
                y: minY,
                w: maxX - minX + 1,
                h: maxY - minY + 1
              };
            } else {
              box = selectionController.getBoundingBox(W, H);
            }
          } else {
            box = selectionController.getBoundingBox(W, H);
          }
          result = engine.delogoBilinear(currentImageData, box, rad);
        } else if (algo === 'exemplar') {
          result = engine.inpaintExemplar(currentImageData, mask, rad, 40);
        } else if (algo === 'ns') {
          result = engine.inpaintNavierStokes(currentImageData, mask, 20, 0.1);
        } else {
          result = engine.inpaintTelea(currentImageData, mask, rad);
        }

        currentImageData = result;
        sourceCtx.putImageData(currentImageData, 0, 0);
        selectionController.clear();
        downloadBtn.disabled = false;
        detectionBadge.style.display = 'none';
        statusIndicator.textContent = 'Logo removed successfully!';
      } catch (err) {
        console.error('Inpaint error:', err);
        statusIndicator.textContent = `Error: ${err.message}`;
      } finally {
        processOverlay.style.display = 'none';
      }
    }, 20);
  }

  // 5. Compare Before / After Preview
  compareBtn.addEventListener('mousedown', showBefore);
  compareBtn.addEventListener('mouseup', showAfter);
  compareBtn.addEventListener('touchstart', (e) => { e.preventDefault(); showBefore(); });
  compareBtn.addEventListener('touchend', (e) => { e.preventDefault(); showAfter(); });

  compareBtn.addEventListener('click', () => {
    isComparing = !isComparing;
    if (isComparing) showBefore();
    else showAfter();
  });

  function showBefore() {
    if (!originalImageData) return;
    sourceCtx.putImageData(originalImageData, 0, 0);
    statusIndicator.textContent = 'Showing original before removal';
  }

  function showAfter() {
    if (!currentImageData) return;
    sourceCtx.putImageData(currentImageData, 0, 0);
    statusIndicator.textContent = 'Showing inpainted result';
  }

  // 6. Download Clean Result
  downloadBtn.addEventListener('click', () => {
    if (!sourceCanvas) return;
    sourceCanvas.toBlob((blob) => {
      if (!blob) return;
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      const baseName = currentFileName.replace(/\.[^/.]+$/, '');
      a.download = `${baseName}-cleaned.png`;
      a.href = url;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      setTimeout(() => URL.revokeObjectURL(url), 2000);
      statusIndicator.textContent = 'Photo downloaded successfully!';
    }, 'image/png');
  });
});
