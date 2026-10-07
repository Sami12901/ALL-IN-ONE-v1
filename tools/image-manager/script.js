// Image Manager - Presentation Slide Image Curator & Cropper Studio
// Fully client-side interactive logic

document.addEventListener('DOMContentLoaded', () => {
  // DOM Elements
  const canvas = document.getElementById('studio-canvas');
  const ctx = canvas.getContext('2d');
  const viewportBox = document.getElementById('viewport-box');

  const fileDropzone = document.getElementById('file-dropzone');
  const imageFileInput = document.getElementById('image-file-input');
  const browseBtn = document.getElementById('browse-btn');

  // Sample buttons
  const samplePitchBtn = document.getElementById('sample-pitch');
  const sampleTechBtn = document.getElementById('sample-tech');
  const sampleMinimalBtn = document.getElementById('sample-minimal');

  // Aspect ratio presets
  const ratioChips = document.querySelectorAll('.preset-chip');

  // Sliders
  const adjScrim = document.getElementById('adj-scrim');
  const valScrim = document.getElementById('val-scrim');
  const adjBrightness = document.getElementById('adj-brightness');
  const valBrightness = document.getElementById('val-brightness');
  const adjContrast = document.getElementById('adj-contrast');
  const valContrast = document.getElementById('val-contrast');
  const adjBlur = document.getElementById('adj-blur');
  const valBlur = document.getElementById('val-blur');
  const adjGrayscale = document.getElementById('adj-grayscale');
  const valGrayscale = document.getElementById('val-grayscale');
  const resetAdjustmentsBtn = document.getElementById('reset-adjustments-btn');

  // Typography overlay
  const toggleSlideText = document.getElementById('toggle-slide-text');
  const slideHeadline = document.getElementById('slide-headline');
  const slideSubtext = document.getElementById('slide-subtext');
  const slideTextOverlay = document.getElementById('slide-text-overlay');
  const previewHeadline = document.getElementById('preview-headline');
  const previewSubtext = document.getElementById('preview-subtext');

  // Toolbar & Badges
  const badgeRatio = document.getElementById('badge-ratio');
  const badgeDims = document.getElementById('badge-dims');
  const badgeZoom = document.getElementById('badge-zoom');
  const fileMetaInfo = document.getElementById('file-meta-info');
  const zoomInBtn = document.getElementById('zoom-in-btn');
  const zoomOutBtn = document.getElementById('zoom-out-btn');
  const fitBtn = document.getElementById('fit-btn');
  const toggleGridBtn = document.getElementById('toggle-grid-btn');

  // Export controls
  const exportFormat = document.getElementById('export-format');
  const exportResolution = document.getElementById('export-resolution');
  const burnTextExport = document.getElementById('burn-text-export');
  const downloadBtn = document.getElementById('download-btn');
  const copyBtn = document.getElementById('copy-btn');

  // Toast
  const appToast = document.getElementById('app-toast');
  const toastText = document.getElementById('toast-text');
  let toastTimer = null;

  // State
  let currentImage = null;
  let imageName = 'presentation-slide';
  let showGrid = false;

  // Viewport / Cropping transforms
  let currentRatio = 16 / 9; // width / height
  let ratioName = '16:9';
  let scale = 1.0;
  let panX = 0;
  let panY = 0;
  let isDragging = false;
  let startX = 0;
  let startY = 0;

  function showToast(msg) {
    if (toastTimer) clearTimeout(toastTimer);
    toastText.textContent = msg;
    appToast.classList.add('show');
    toastTimer = setTimeout(() => {
      appToast.classList.remove('show');
    }, 2800);
  }

  // Generate procedural high-res presentation sample backgrounds
  function createSampleImage(type) {
    const offscreen = document.createElement('canvas');
    offscreen.width = 1920;
    offscreen.height = 1080;
    const octx = offscreen.getContext('2d');

    if (type === 'pitch') {
      // Deep executive navy blue gradient with modern geometric light glow
      const grad = octx.createLinearGradient(0, 0, 1920, 1080);
      grad.addColorStop(0, '#0a192f');
      grad.addColorStop(0.5, '#0f3460');
      grad.addColorStop(1, '#16213e');
      octx.fillStyle = grad;
      octx.fillRect(0, 0, 1920, 1080);

      // Light accent orbs
      const glow1 = octx.createRadialGradient(1400, 300, 50, 1400, 300, 600);
      glow1.addColorStop(0, 'rgba(78, 133, 191, 0.45)');
      glow1.addColorStop(1, 'rgba(78, 133, 191, 0)');
      octx.fillStyle = glow1;
      octx.fillRect(0, 0, 1920, 1080);

      const glow2 = octx.createRadialGradient(400, 800, 50, 400, 800, 500);
      glow2.addColorStop(0, 'rgba(137, 170, 204, 0.3)');
      glow2.addColorStop(1, 'rgba(0, 0, 0, 0)');
      octx.fillStyle = glow2;
      octx.fillRect(0, 0, 1920, 1080);

      // Elegant architectural lines
      octx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
      octx.lineWidth = 2;
      for (let i = 0; i < 1920; i += 120) {
        octx.beginPath();
        octx.moveTo(i, 0);
        octx.lineTo(i + 300, 1080);
        octx.stroke();
      }
      imageName = 'executive-pitch-slide';
    } else if (type === 'tech') {
      // Tech Darkwave: Dark obsidian with violet and cyan cyber neon accents
      const grad = octx.createRadialGradient(960, 540, 100, 960, 540, 1100);
      grad.addColorStop(0, '#110b29');
      grad.addColorStop(1, '#05030a');
      octx.fillStyle = grad;
      octx.fillRect(0, 0, 1920, 1080);

      // Grid mesh
      octx.strokeStyle = 'rgba(124, 58, 237, 0.15)';
      octx.lineWidth = 1.5;
      for (let x = 0; x <= 1920; x += 60) {
        octx.beginPath();
        octx.moveTo(x, 0);
        octx.lineTo(x, 1080);
        octx.stroke();
      }
      for (let y = 0; y <= 1080; y += 60) {
        octx.beginPath();
        octx.moveTo(0, y);
        octx.lineTo(1920, y);
        octx.stroke();
      }

      // Neon highlight ribbons
      octx.strokeStyle = 'rgba(6, 182, 212, 0.4)';
      octx.lineWidth = 4;
      octx.beginPath();
      octx.moveTo(100, 900);
      octx.bezierCurveTo(600, 400, 1200, 800, 1820, 200);
      octx.stroke();
      imageName = 'tech-darkwave-slide';
    } else {
      // Studio Gradient: Luxury silk duotone
      const grad = octx.createLinearGradient(0, 0, 1920, 1080);
      grad.addColorStop(0, '#1e293b');
      grad.addColorStop(0.4, '#334155');
      grad.addColorStop(0.8, '#0f172a');
      grad.addColorStop(1, '#020617');
      octx.fillStyle = grad;
      octx.fillRect(0, 0, 1920, 1080);

      // Warm amber & indigo glow
      const warm = octx.createRadialGradient(1600, 200, 20, 1600, 200, 700);
      warm.addColorStop(0, 'rgba(245, 158, 11, 0.25)');
      warm.addColorStop(1, 'rgba(0, 0, 0, 0)');
      octx.fillStyle = warm;
      octx.fillRect(0, 0, 1920, 1080);
      imageName = 'studio-gradient-slide';
    }

    const img = new Image();
    img.onload = () => {
      setImage(img);
    };
    img.src = offscreen.toDataURL('image/png');
  }

  function setImage(img) {
    currentImage = img;
    resetCropFit();
    render();
    fileMetaInfo.textContent = `${img.naturalWidth} \u00D7 ${img.naturalHeight} px (${imageName})`;
    showToast('Slide image loaded successfully');
  }

  function resetCropFit() {
    if (!currentImage) return;

    // Determine target canvas internal dimensions based on aspect ratio
    const baseW = 1280;
    let baseH = 720;

    if (currentRatio === 'free') {
      baseH = Math.round(baseW / (currentImage.naturalWidth / currentImage.naturalHeight));
    } else {
      baseH = Math.round(baseW / currentRatio);
    }

    canvas.width = baseW;
    canvas.height = baseH;

    // Fit cover calculation
    const imgAspect = currentImage.naturalWidth / currentImage.naturalHeight;
    const canvasAspect = canvas.width / canvas.height;

    if (imgAspect > canvasAspect) {
      // Image is wider than canvas
      scale = canvas.height / currentImage.naturalHeight;
    } else {
      // Image is taller than canvas
      scale = canvas.width / currentImage.naturalWidth;
    }

    panX = (canvas.width - currentImage.naturalWidth * scale) / 2;
    panY = (canvas.height - currentImage.naturalHeight * scale) / 2;

    updateBadges();
  }

  function updateBadges() {
    badgeRatio.textContent = `Aspect: ${ratioName}`;
    badgeDims.textContent = `${canvas.width} \u00D7 ${canvas.height} px`;
    badgeZoom.textContent = `Zoom: ${Math.round(scale * 100)}%`;
  }

  function render() {
    if (!canvas || !ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (!currentImage) {
      // Blank placeholder
      ctx.fillStyle = '#0a0a0c';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = '#6b7280';
      ctx.font = '20px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('No image loaded. Upload or select a preset.', canvas.width / 2, canvas.height / 2);
      return;
    }

    ctx.save();

    // Visual Filter Adjustments
    const b = adjBrightness.value;
    const c = adjContrast.value;
    const blur = adjBlur.value;
    const gray = adjGrayscale.value;

    ctx.filter = `brightness(${b}%) contrast(${c}%) blur(${blur}px) grayscale(${gray}%)`;

    // Draw image with pan and scale
    ctx.drawImage(
      currentImage,
      panX,
      panY,
      currentImage.naturalWidth * scale,
      currentImage.naturalHeight * scale
    );

    ctx.restore();

    // Dark Readability Scrim / Overlay
    const scrimAlpha = adjScrim.value / 100;
    if (scrimAlpha > 0) {
      ctx.save();
      // Premium bottom-heavy gradient scrim for presentation readability
      const scrimGrad = ctx.createLinearGradient(0, 0, 0, canvas.height);
      scrimGrad.addColorStop(0, `rgba(0, 0, 0, ${scrimAlpha * 0.45})`);
      scrimGrad.addColorStop(0.5, `rgba(0, 0, 0, ${scrimAlpha * 0.75})`);
      scrimGrad.addColorStop(1, `rgba(0, 0, 0, ${Math.min(0.96, scrimAlpha * 1.25)})`);
      ctx.fillStyle = scrimGrad;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.restore();
    }

    // Rule of Thirds Grid Guide
    if (showGrid) {
      ctx.save();
      ctx.strokeStyle = 'rgba(78, 133, 191, 0.4)';
      ctx.lineWidth = 1;
      ctx.setLineDash([6, 6]);

      // Vertical 1/3 and 2/3
      const oneThirdW = canvas.width / 3;
      const twoThirdW = (canvas.width / 3) * 2;
      ctx.beginPath();
      ctx.moveTo(oneThirdW, 0);
      ctx.lineTo(oneThirdW, canvas.height);
      ctx.moveTo(twoThirdW, 0);
      ctx.lineTo(twoThirdW, canvas.height);

      // Horizontal 1/3 and 2/3
      const oneThirdH = canvas.height / 3;
      const twoThirdH = (canvas.height / 3) * 2;
      ctx.moveTo(0, oneThirdH);
      ctx.lineTo(canvas.width, oneThirdH);
      ctx.moveTo(0, twoThirdH);
      ctx.lineTo(canvas.width, twoThirdH);
      ctx.stroke();

      ctx.restore();
    }
  }

  // Pan & Drag Handlers
  canvas.addEventListener('mousedown', (e) => {
    if (!currentImage) return;
    isDragging = true;
    startX = e.clientX - panX;
    startY = e.clientY - panY;
  });

  window.addEventListener('mousemove', (e) => {
    if (!isDragging || !currentImage) return;
    panX = e.clientX - startX;
    panY = e.clientY - startY;
    render();
  });

  window.addEventListener('mouseup', () => {
    isDragging = false;
  });

  // Touch handlers for mobile
  canvas.addEventListener('touchstart', (e) => {
    if (!currentImage || e.touches.length !== 1) return;
    isDragging = true;
    startX = e.touches[0].clientX - panX;
    startY = e.touches[0].clientY - panY;
  }, { passive: true });

  window.addEventListener('touchmove', (e) => {
    if (!isDragging || !currentImage || e.touches.length !== 1) return;
    panX = e.touches[0].clientX - startX;
    panY = e.touches[0].clientY - startY;
    render();
  }, { passive: true });

  window.addEventListener('touchend', () => {
    isDragging = false;
  });

  // Zoom with scroll wheel
  canvas.addEventListener('wheel', (e) => {
    if (!currentImage) return;
    e.preventDefault();

    const rect = canvas.getBoundingClientRect();
    const mouseX = (e.clientX - rect.left) * (canvas.width / rect.width);
    const mouseY = (e.clientY - rect.top) * (canvas.height / rect.height);

    const zoomFactor = e.deltaY < 0 ? 1.08 : 0.92;
    const newScale = Math.max(0.1, Math.min(10, scale * zoomFactor));

    // Zoom centered around mouse pointer
    panX = mouseX - (mouseX - panX) * (newScale / scale);
    panY = mouseY - (mouseY - panY) * (newScale / scale);
    scale = newScale;

    updateBadges();
    render();
  }, { passive: false });

  // Zoom buttons
  zoomInBtn.addEventListener('click', () => {
    if (!currentImage) return;
    scale *= 1.15;
    updateBadges();
    render();
  });

  zoomOutBtn.addEventListener('click', () => {
    if (!currentImage) return;
    scale = Math.max(0.1, scale / 1.15);
    updateBadges();
    render();
  });

  fitBtn.addEventListener('click', () => {
    resetCropFit();
    render();
    showToast('Reset to cover fit');
  });

  toggleGridBtn.addEventListener('click', () => {
    showGrid = !showGrid;
    toggleGridBtn.classList.toggle('active', showGrid);
    render();
  });

  // Aspect Ratio Preset Chips
  ratioChips.forEach((chip) => {
    chip.addEventListener('click', () => {
      ratioChips.forEach((c) => c.classList.remove('active'));
      chip.classList.add('active');

      const val = chip.getAttribute('data-ratio');
      if (val === 'free') {
        currentRatio = 'free';
        ratioName = 'Freeform';
      } else {
        const parts = val.split('/');
        currentRatio = parseFloat(parts[0]) / parseFloat(parts[1]);
        ratioName = val.replace('/', ':');
      }

      resetCropFit();
      render();
      showToast(`Preset: ${ratioName}`);
    });
  });

  // Slider Events
  adjScrim.addEventListener('input', () => {
    valScrim.textContent = `${adjScrim.value}%`;
    render();
  });
  adjBrightness.addEventListener('input', () => {
    valBrightness.textContent = `${adjBrightness.value}%`;
    render();
  });
  adjContrast.addEventListener('input', () => {
    valContrast.textContent = `${adjContrast.value}%`;
    render();
  });
  adjBlur.addEventListener('input', () => {
    valBlur.textContent = `${adjBlur.value}px`;
    render();
  });
  adjGrayscale.addEventListener('input', () => {
    valGrayscale.textContent = `${adjGrayscale.value}%`;
    render();
  });

  resetAdjustmentsBtn.addEventListener('click', () => {
    adjScrim.value = 35;
    valScrim.textContent = '35%';
    adjBrightness.value = 100;
    valBrightness.textContent = '100%';
    adjContrast.value = 100;
    valContrast.textContent = '100%';
    adjBlur.value = 0;
    valBlur.textContent = '0px';
    adjGrayscale.value = 0;
    valGrayscale.textContent = '0%';
    render();
    showToast('Adjustments reset');
  });

  // Typography preview
  toggleSlideText.addEventListener('change', () => {
    slideTextOverlay.style.opacity = toggleSlideText.checked ? '1' : '0';
  });

  slideHeadline.addEventListener('input', () => {
    previewHeadline.textContent = slideHeadline.value || 'Presentation Headline';
  });
  slideSubtext.addEventListener('input', () => {
    previewSubtext.textContent = slideSubtext.value || 'Presentation Subtitle';
  });

  // File Upload Handlers
  browseBtn.addEventListener('click', () => imageFileInput.click());
  fileDropzone.addEventListener('click', (e) => {
    if (e.target !== browseBtn) imageFileInput.click();
  });

  fileDropzone.addEventListener('dragover', (e) => {
    e.preventDefault();
    fileDropzone.classList.add('dragover');
  });
  fileDropzone.addEventListener('dragleave', () => {
    fileDropzone.classList.remove('dragover');
  });
  fileDropzone.addEventListener('drop', (e) => {
    e.preventDefault();
    fileDropzone.classList.remove('dragover');
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  });

  imageFileInput.addEventListener('change', (e) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  });

  function handleFile(file) {
    if (!file.type.startsWith('image/')) {
      showToast('Please select a valid image file');
      return;
    }
    imageName = file.name.replace(/\.[^/.]+$/, '');
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        setImage(img);
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  }

  // Sample Preset Listeners
  samplePitchBtn.addEventListener('click', () => createSampleImage('pitch'));
  sampleTechBtn.addEventListener('click', () => createSampleImage('tech'));
  sampleMinimalBtn.addEventListener('click', () => createSampleImage('minimal'));

  // Export Logic
  function generateExportCanvas() {
    const res = exportResolution.value;
    let targetW = canvas.width;
    let targetH = canvas.height;

    if (res !== 'native') {
      const reqW = parseInt(res, 10);
      const aspect = canvas.width / canvas.height;
      targetW = reqW;
      targetH = Math.round(reqW / aspect);
    }

    const expCanvas = document.createElement('canvas');
    expCanvas.width = targetW;
    expCanvas.height = targetH;
    const ectx = expCanvas.getContext('2d');

    // Scale from studio canvas to target export canvas
    const scaleFactor = targetW / canvas.width;

    // Draw image with adjustments
    ectx.save();
    const b = adjBrightness.value;
    const c = adjContrast.value;
    const blur = Math.round(adjBlur.value * scaleFactor);
    const gray = adjGrayscale.value;

    ectx.filter = `brightness(${b}%) contrast(${c}%) blur(${blur}px) grayscale(${gray}%)`;

    ectx.drawImage(
      currentImage,
      panX * scaleFactor,
      panY * scaleFactor,
      currentImage.naturalWidth * scale * scaleFactor,
      currentImage.naturalHeight * scale * scaleFactor
    );
    ectx.restore();

    // Dark Scrim
    const scrimAlpha = adjScrim.value / 100;
    if (scrimAlpha > 0) {
      ectx.save();
      const scrimGrad = ectx.createLinearGradient(0, 0, 0, targetH);
      scrimGrad.addColorStop(0, `rgba(0, 0, 0, ${scrimAlpha * 0.45})`);
      scrimGrad.addColorStop(0.5, `rgba(0, 0, 0, ${scrimAlpha * 0.75})`);
      scrimGrad.addColorStop(1, `rgba(0, 0, 0, ${Math.min(0.96, scrimAlpha * 1.25)})`);
      ectx.fillStyle = scrimGrad;
      ectx.fillRect(0, 0, targetW, targetH);
      ectx.restore();
    }

    // Burn text if user enabled
    if (burnTextExport.checked) {
      ectx.save();
      const pad = Math.round(targetW * 0.05);
      const bottom = targetH - pad;

      ectx.fillStyle = '#ffffff';
      ectx.shadowColor = 'rgba(0, 0, 0, 0.8)';
      ectx.shadowBlur = 12;

      // Subtext
      const subFontSize = Math.round(targetW * 0.022);
      ectx.font = `500 ${subFontSize}px Inter, sans-serif`;
      ectx.fillText(slideSubtext.value || '', pad, bottom);

      // Headline
      const headFontSize = Math.round(targetW * 0.045);
      ectx.font = `700 ${headFontSize}px Inter, sans-serif`;
      ectx.fillText(slideHeadline.value || '', pad, bottom - subFontSize - 16);

      ectx.restore();
    }

    return expCanvas;
  }

  downloadBtn.addEventListener('click', () => {
    if (!currentImage) {
      showToast('No image loaded to download');
      return;
    }

    const expCanvas = generateExportCanvas();
    const mime = exportFormat.value;
    const ext = mime === 'image/webp' ? 'webp' : mime === 'image/png' ? 'png' : 'jpg';

    expCanvas.toBlob((blob) => {
      if (!blob) return;
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${imageName}-${ratioName.replace(':', 'x')}.${ext}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      showToast(`Exported ${expCanvas.width} \u00D7 ${expCanvas.height} ${ext.toUpperCase()}`);
    }, mime, 0.92);
  });

  copyBtn.addEventListener('click', async () => {
    if (!currentImage) {
      showToast('No image loaded to copy');
      return;
    }

    const expCanvas = generateExportCanvas();
    try {
      expCanvas.toBlob(async (blob) => {
        if (!blob) return;
        if (navigator.clipboard && window.ClipboardItem) {
          await navigator.clipboard.write([
            new window.ClipboardItem({ 'image/png': blob })
          ]);
          showToast('Image copied to clipboard!');
        } else {
          showToast('Clipboard image write not supported in this browser');
        }
      }, 'image/png');
    } catch {
      showToast('Failed to copy to clipboard');
    }
  });

  // Initialize with Executive Pitch sample
  createSampleImage('pitch');
});