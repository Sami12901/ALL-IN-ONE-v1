// Profile Circle Cropper & Avatar Maker - Complete Client-Side Implementation

document.addEventListener('DOMContentLoaded', () => {
  // DOM Elements - Viewport & Canvas
  const viewportCanvas = document.getElementById('viewport-canvas');
  const viewportWrapper = document.getElementById('crop-viewport-wrapper');
  const ctx = viewportCanvas.getContext('2d');

  // DOM Elements - Inputs & Uploads
  const imageFileInput = document.getElementById('image-file-input');
  const dropZone = document.getElementById('drop-zone');
  const browseBtn = document.getElementById('browse-btn');
  const btnLoadSample = document.getElementById('btn-load-sample');

  // DOM Elements - Controls
  const zoomSlider = document.getElementById('zoom-slider');
  const zoomValue = document.getElementById('zoom-value');
  const btnRotateLeft = document.getElementById('btn-rotate-left');
  const btnRotateRight = document.getElementById('btn-rotate-right');
  const btnFlipH = document.getElementById('btn-flip-h');
  const btnCenterImg = document.getElementById('btn-center-img');
  const btnResetAll = document.getElementById('btn-reset-all');

  // DOM Elements - Borders & Styling
  const borderTabBtns = document.querySelectorAll('.border-tab-btn');
  const solidBorderControls = document.getElementById('solid-border-controls');
  const gradientBorderControls = document.getElementById('gradient-border-controls');
  const borderWidthContainer = document.getElementById('border-width-container');
  const borderColorPicker = document.getElementById('border-color-picker');
  const borderColorText = document.getElementById('border-color-text');
  const borderWidthSlider = document.getElementById('border-width-slider');
  const borderWidthValue = document.getElementById('border-width-value');
  const gradientPills = document.querySelectorAll('.gradient-pill');

  // DOM Elements - Export & Previews
  const exportSizeSelect = document.getElementById('export-size-select');
  const btnDownloadPng = document.getElementById('btn-download-png');
  const previewAvatarLg = document.getElementById('preview-avatar-lg');
  const previewAvatarMd = document.getElementById('preview-avatar-md');
  const previewAvatarSm = document.getElementById('preview-avatar-sm');

  // Toast
  const appToast = document.getElementById('app-toast');
  let toastTimer = null;

  function showToast(message) {
    if (toastTimer) clearTimeout(toastTimer);
    appToast.textContent = message;
    appToast.classList.add('show');
    toastTimer = setTimeout(() => {
      appToast.classList.remove('show');
    }, 2200);
  }

  // Cropper State
  let currentImage = null; // HTMLImageElement
  let scale = 1.0;
  let panX = 0;
  let panY = 0;
  let rotation = 0; // 0, 90, 180, 270
  let flipH = 1; // 1 or -1
  let borderType = 'none'; // 'none' | 'solid' | 'gradient'
  let borderColor = '#4e85bf';
  let borderWidth = 6;
  let activeGradient = 'gold';

  const GRADIENTS = {
    gold: ['#f6d365', '#fda085'],
    cyberpunk: ['#f093fb', '#f5576c'],
    royalblue: ['#4facfe', '#00f2fe'],
    emerald: ['#43e97b', '#38f9d7'],
    sunset: ['#fa709a', '#fee140'],
    purple: ['#667eea', '#764ba2']
  };

  // Drag interaction state
  let isDragging = false;
  let startPointerX = 0;
  let startPointerY = 0;
  let startPanX = 0;
  let startPanY = 0;

  // Canvas internal dimensions
  const V_SIZE = 800; // Resolution of viewport canvas
  viewportCanvas.width = V_SIZE;
  viewportCanvas.height = V_SIZE;

  // Viewport center and crop radius
  const CENTER_X = V_SIZE / 2;
  const CENTER_Y = V_SIZE / 2;
  const CROP_RADIUS = V_SIZE * 0.42; // Circle covers 84% of viewport

  // Calculate base scale to fit image inside crop circle
  function getBaseFitScale(img, rot) {
    if (!img) return 1.0;
    const isSideways = (rot % 180 !== 0);
    const imgW = isSideways ? img.naturalHeight : img.naturalWidth;
    const imgH = isSideways ? img.naturalWidth : img.naturalHeight;
    const targetDiameter = CROP_RADIUS * 2;
    // Cover the crop circle completely
    return Math.max(targetDiameter / imgW, targetDiameter / imgH);
  }

  // Draw viewport canvas
  function renderViewport() {
    ctx.clearRect(0, 0, V_SIZE, V_SIZE);

    // 1. Draw viewport dark backdrop
    ctx.fillStyle = '#0c1017';
    ctx.fillRect(0, 0, V_SIZE, V_SIZE);

    // Subtle background grid
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.03)';
    ctx.lineWidth = 1;
    for (let x = 0; x < V_SIZE; x += 40) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, V_SIZE);
      ctx.stroke();
    }
    for (let y = 0; y < V_SIZE; y += 40) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(V_SIZE, y);
      ctx.stroke();
    }

    if (!currentImage) {
      // Empty state placeholder
      ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
      ctx.font = '24px Inter, sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('Please upload or select an image', CENTER_X, CENTER_Y);
      return;
    }

    // 2. Draw Transformed Image
    ctx.save();
    ctx.translate(CENTER_X + panX, CENTER_Y + panY);
    ctx.rotate((rotation * Math.PI) / 180);
    ctx.scale(flipH * scale, scale);

    const iw = currentImage.naturalWidth;
    const ih = currentImage.naturalHeight;
    ctx.drawImage(currentImage, -iw / 2, -ih / 2, iw, ih);
    ctx.restore();

    // 3. Draw Darkened Vignette Outside Crop Circle
    ctx.save();
    ctx.beginPath();
    // Clockwise outer rectangle
    ctx.rect(0, 0, V_SIZE, V_SIZE);
    // Counter-clockwise inner circle to create a cutout
    ctx.arc(CENTER_X, CENTER_Y, CROP_RADIUS, 0, Math.PI * 2, true);
    ctx.fillStyle = 'rgba(5, 7, 12, 0.72)';
    ctx.fill();
    ctx.restore();

    // 4. Draw Crop Border Ring
    ctx.save();
    ctx.beginPath();
    ctx.arc(CENTER_X, CENTER_Y, CROP_RADIUS, 0, Math.PI * 2);

    if (borderType === 'none') {
      // Thin guideline ring
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.35)';
      ctx.lineWidth = 2;
      ctx.setLineDash([8, 6]);
      ctx.stroke();
    } else if (borderType === 'solid') {
      ctx.strokeStyle = borderColor;
      ctx.lineWidth = borderWidth * 2;
      ctx.stroke();
    } else if (borderType === 'gradient') {
      const gradColors = GRADIENTS[activeGradient] || GRADIENTS.gold;
      const grad = ctx.createLinearGradient(
        CENTER_X - CROP_RADIUS,
        CENTER_Y - CROP_RADIUS,
        CENTER_X + CROP_RADIUS,
        CENTER_Y + CROP_RADIUS
      );
      grad.addColorStop(0, gradColors[0]);
      grad.addColorStop(1, gradColors[1]);
      ctx.strokeStyle = grad;
      ctx.lineWidth = borderWidth * 2;
      ctx.stroke();
    }
    ctx.restore();

    // 5. Update sidebar mini avatar previews
    updateMiniPreviews();
  }

  // Update Mini Previews in Sidebar
  function updateMiniPreviews() {
    if (!currentImage) return;

    // Render offscreen cropped image
    const thumbCanvas = document.createElement('canvas');
    const thumbSize = 256;
    thumbCanvas.width = thumbSize;
    thumbCanvas.height = thumbSize;
    const tCtx = thumbCanvas.getContext('2d');

    renderCroppedToCanvas(tCtx, thumbSize);

    const dataUrl = thumbCanvas.toDataURL('image/png');
    [previewAvatarLg, previewAvatarMd, previewAvatarSm].forEach(el => {
      el.style.backgroundImage = `url(${dataUrl})`;
    });
  }

  // Render pure cropped circular image onto a target 2D context
  function renderCroppedToCanvas(targetCtx, size) {
    const center = size / 2;
    const ratio = size / (CROP_RADIUS * 2);
    const radius = size / 2;

    targetCtx.clearRect(0, 0, size, size);

    // Clip to circle
    targetCtx.save();
    targetCtx.beginPath();
    targetCtx.arc(center, center, radius, 0, Math.PI * 2);
    targetCtx.clip();

    // Map viewport pan & scale onto target canvas
    targetCtx.translate(center + panX * ratio, center + panY * ratio);
    targetCtx.rotate((rotation * Math.PI) / 180);
    targetCtx.scale(flipH * scale * ratio, scale * ratio);

    const iw = currentImage.naturalWidth;
    const ih = currentImage.naturalHeight;
    targetCtx.drawImage(currentImage, -iw / 2, -ih / 2, iw, ih);
    targetCtx.restore();

    // Render Border
    if (borderType !== 'none') {
      const scaledBorderWidth = borderWidth * ratio;
      targetCtx.save();
      targetCtx.beginPath();
      targetCtx.arc(center, center, radius - scaledBorderWidth / 2, 0, Math.PI * 2);

      if (borderType === 'solid') {
        targetCtx.strokeStyle = borderColor;
      } else if (borderType === 'gradient') {
        const gradColors = GRADIENTS[activeGradient] || GRADIENTS.gold;
        const grad = targetCtx.createLinearGradient(0, 0, size, size);
        grad.addColorStop(0, gradColors[0]);
        grad.addColorStop(1, gradColors[1]);
        targetCtx.strokeStyle = grad;
      }
      targetCtx.lineWidth = scaledBorderWidth;
      targetCtx.stroke();
      targetCtx.restore();
    }
  }

  // Set loaded image
  function setImage(img) {
    currentImage = img;
    rotation = 0;
    flipH = 1;
    panX = 0;
    panY = 0;
    scale = getBaseFitScale(img, 0);
    zoomSlider.value = 1.0;
    zoomValue.textContent = '1.0x';
    renderViewport();
  }

  // Load image from File
  function handleFile(file) {
    if (!file || !file.type.startsWith('image/')) {
      showToast('Please upload a valid image file');
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        setImage(img);
        showToast('Photo loaded successfully');
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  }

  // Generate Sample Portrait
  function loadSamplePortrait() {
    const sampleCanvas = document.createElement('canvas');
    sampleCanvas.width = 800;
    sampleCanvas.height = 800;
    const sCtx = sampleCanvas.getContext('2d');

    // Background gradient
    const bgGrad = sCtx.createRadialGradient(400, 350, 50, 400, 400, 500);
    bgGrad.addColorStop(0, '#3a506b');
    bgGrad.addColorStop(0.5, '#1c2541');
    bgGrad.addColorStop(1, '#0b132b');
    sCtx.fillStyle = bgGrad;
    sCtx.fillRect(0, 0, 800, 800);

    // Decorative geometric rings
    sCtx.strokeStyle = 'rgba(78, 133, 191, 0.2)';
    sCtx.lineWidth = 4;
    sCtx.beginPath();
    sCtx.arc(400, 400, 280, 0, Math.PI * 2);
    sCtx.stroke();

    // Stylized Avatar Monogram / Face
    sCtx.fillStyle = '#89aacc';
    sCtx.beginPath();
    sCtx.arc(400, 320, 110, 0, Math.PI * 2); // Head
    sCtx.fill();

    // Body
    sCtx.beginPath();
    sCtx.arc(400, 620, 220, Math.PI, 0, true);
    sCtx.fill();

    // Subtle lighting highlight
    sCtx.fillStyle = 'rgba(255, 255, 255, 0.15)';
    sCtx.beginPath();
    sCtx.arc(380, 300, 40, 0, Math.PI * 2);
    sCtx.fill();

    const img = new Image();
    img.onload = () => {
      setImage(img);
      showToast('Sample avatar loaded');
    };
    img.src = sampleCanvas.toDataURL('image/png');
  }

  // Drag & Drop handlers
  browseBtn.addEventListener('click', () => imageFileInput.click());
  dropZone.addEventListener('click', (e) => {
    if (e.target !== btnLoadSample && !e.target.closest('#btn-load-sample')) {
      imageFileInput.click();
    }
  });

  imageFileInput.addEventListener('change', (e) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  });

  ['dragenter', 'dragover'].forEach(name => {
    dropZone.addEventListener(name, (e) => {
      e.preventDefault();
      e.stopPropagation();
      dropZone.classList.add('dragover');
    });
  });

  ['dragleave', 'drop'].forEach(name => {
    dropZone.addEventListener(name, (e) => {
      e.preventDefault();
      e.stopPropagation();
      dropZone.classList.remove('dragover');
    });
  });

  dropZone.addEventListener('drop', (e) => {
    if (e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  });

  btnLoadSample.addEventListener('click', (e) => {
    e.stopPropagation();
    loadSamplePortrait();
  });

  // Pointer / Mouse Pan Events on Viewport
  function getPointerPos(e) {
    const rect = viewportWrapper.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    return {
      x: (clientX - rect.left) * (V_SIZE / rect.width),
      y: (clientY - rect.top) * (V_SIZE / rect.height)
    };
  }

  function onPointerDown(e) {
    if (!currentImage) return;
    isDragging = true;
    const pos = getPointerPos(e);
    startPointerX = pos.x;
    startPointerY = pos.y;
    startPanX = panX;
    startPanY = panY;
  }

  function onPointerMove(e) {
    if (!isDragging || !currentImage) return;
    const pos = getPointerPos(e);
    panX = startPanX + (pos.x - startPointerX);
    panY = startPanY + (pos.y - startPointerY);
    renderViewport();
  }

  function onPointerUp() {
    isDragging = false;
  }

  viewportWrapper.addEventListener('mousedown', onPointerDown);
  window.addEventListener('mousemove', onPointerMove);
  window.addEventListener('mouseup', onPointerUp);

  viewportWrapper.addEventListener('touchstart', onPointerDown, { passive: true });
  window.addEventListener('touchmove', onPointerMove, { passive: true });
  window.addEventListener('touchend', onPointerUp);

  // Wheel Zoom
  viewportWrapper.addEventListener('wheel', (e) => {
    if (!currentImage) return;
    e.preventDefault();
    const delta = e.deltaY < 0 ? 0.1 : -0.1;
    let newZoom = parseFloat(zoomSlider.value) + delta;
    newZoom = Math.max(1.0, Math.min(5.0, newZoom));
    zoomSlider.value = newZoom.toFixed(2);
    onZoomChange();
  }, { passive: false });

  // Zoom slider change
  function onZoomChange() {
    if (!currentImage) return;
    const zoomMultiplier = parseFloat(zoomSlider.value);
    zoomValue.textContent = `${zoomMultiplier.toFixed(1)}x`;
    const baseFit = getBaseFitScale(currentImage, rotation);
    scale = baseFit * zoomMultiplier;
    renderViewport();
  }
  zoomSlider.addEventListener('input', onZoomChange);

  // Rotate Left
  btnRotateLeft.addEventListener('click', () => {
    if (!currentImage) return;
    rotation = (rotation - 90 + 360) % 360;
    onZoomChange();
  });

  // Rotate Right
  btnRotateRight.addEventListener('click', () => {
    if (!currentImage) return;
    rotation = (rotation + 90) % 360;
    onZoomChange();
  });

  // Flip Horizontal
  btnFlipH.addEventListener('click', () => {
    if (!currentImage) return;
    flipH = -flipH;
    renderViewport();
  });

  // Center & Fit
  btnCenterImg.addEventListener('click', () => {
    if (!currentImage) return;
    panX = 0;
    panY = 0;
    zoomSlider.value = 1.0;
    onZoomChange();
    showToast('Image centered');
  });

  // Reset All
  btnResetAll.addEventListener('click', () => {
    if (!currentImage) return;
    rotation = 0;
    flipH = 1;
    panX = 0;
    panY = 0;
    zoomSlider.value = 1.0;
    onZoomChange();
    showToast('Transforms reset');
  });

  // Border Tab Buttons
  borderTabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      borderTabBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      borderType = btn.getAttribute('data-border');

      if (borderType === 'none') {
        solidBorderControls.style.display = 'none';
        gradientBorderControls.style.display = 'none';
        borderWidthContainer.style.display = 'none';
      } else if (borderType === 'solid') {
        solidBorderControls.style.display = 'flex';
        gradientBorderControls.style.display = 'none';
        borderWidthContainer.style.display = 'flex';
      } else if (borderType === 'gradient') {
        solidBorderControls.style.display = 'none';
        gradientBorderControls.style.display = 'flex';
        borderWidthContainer.style.display = 'flex';
      }
      renderViewport();
    });
  });

  // Solid Color Pickers
  borderColorPicker.addEventListener('input', (e) => {
    borderColor = e.target.value;
    borderColorText.value = borderColor;
    renderViewport();
  });

  borderColorText.addEventListener('input', (e) => {
    const val = e.target.value;
    if (/^#[0-9a-fA-F]{6}$/.test(val)) {
      borderColor = val;
      borderColorPicker.value = val;
      renderViewport();
    }
  });

  // Gradient selection
  gradientPills.forEach(pill => {
    pill.addEventListener('click', () => {
      gradientPills.forEach(p => p.classList.remove('active'));
      pill.classList.add('active');
      activeGradient = pill.getAttribute('data-gradient');
      renderViewport();
    });
  });

  // Border width slider
  borderWidthSlider.addEventListener('input', (e) => {
    borderWidth = parseInt(e.target.value, 10);
    borderWidthValue.textContent = `${borderWidth}px`;
    renderViewport();
  });

  // Download Circular PNG
  btnDownloadPng.addEventListener('click', () => {
    if (!currentImage) {
      showToast('Please load an image first');
      return;
    }

    const exportSize = parseInt(exportSizeSelect.value, 10);
    const exportCanvas = document.createElement('canvas');
    exportCanvas.width = exportSize;
    exportCanvas.height = exportSize;
    const eCtx = exportCanvas.getContext('2d');

    renderCroppedToCanvas(eCtx, exportSize);

    exportCanvas.toBlob((blob) => {
      if (!blob) return;
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `avatar-${exportSize}x${exportSize}.png`;
      a.click();
      URL.revokeObjectURL(url);
      showToast(`Exported ${exportSize}x${exportSize} circular PNG!`);
    }, 'image/png');
  });

  // Initialize with sample portrait
  loadSamplePortrait();
});