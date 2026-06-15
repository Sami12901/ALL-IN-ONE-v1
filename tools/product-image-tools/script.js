// Product Image Tools — Full Client-Side Implementation
// Tabs: Background Remover, Resizer, Watermark, Thumbnail Generator

document.addEventListener('DOMContentLoaded', () => {

  // ═══════════════════════════════════════════════
  // TAB SYSTEM
  // ═══════════════════════════════════════════════
  const tabs = document.querySelectorAll('.pit-tab');
  const tabContents = document.querySelectorAll('.pit-tab-content');

  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      tabs.forEach(t => { t.classList.remove('active'); t.setAttribute('aria-selected', 'false'); });
      tabContents.forEach(c => c.classList.remove('active'));
      tab.classList.add('active');
      tab.setAttribute('aria-selected', 'true');
      const target = document.getElementById('tab-' + tab.dataset.tab);
      if (target) target.classList.add('active');
    });
  });

  // ═══════════════════════════════════════════════
  // SHARED UTILITIES
  // ═══════════════════════════════════════════════

  function setupDropZone(dropZoneId, fileInputId, callback) {
    const dropZone = document.getElementById(dropZoneId);
    const fileInput = document.getElementById(fileInputId);
    if (!dropZone || !fileInput) return;

    dropZone.addEventListener('click', () => fileInput.click());

    dropZone.addEventListener('dragover', e => {
      e.preventDefault();
      dropZone.classList.add('dragover');
    });

    dropZone.addEventListener('dragleave', () => {
      dropZone.classList.remove('dragover');
    });

    dropZone.addEventListener('drop', e => {
      e.preventDefault();
      dropZone.classList.remove('dragover');
      const file = e.dataTransfer.files[0];
      if (file && file.type.startsWith('image/')) {
        callback(file);
      }
    });

    fileInput.addEventListener('change', () => {
      if (fileInput.files[0]) callback(fileInput.files[0]);
    });
  }

  function loadImage(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const img = new Image();
        img.onload = () => resolve(img);
        img.onerror = reject;
        img.src = reader.result;
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  function downloadCanvas(canvas, filename, format = 'image/png', quality = 0.92) {
    const link = document.createElement('a');
    link.download = filename;
    link.href = canvas.toDataURL(format, quality);
    link.click();
  }

  function formatBytes(bytes) {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / 1048576).toFixed(2) + ' MB';
  }

  function showLoading(container) {
    const placeholder = container.querySelector('.pit-placeholder');
    if (placeholder) placeholder.style.display = 'none';
    const existing = container.querySelector('.pit-loading');
    if (existing) existing.remove();
    const loader = document.createElement('div');
    loader.className = 'pit-loading';
    loader.innerHTML = '<div class="pit-spinner"></div><p style="color:var(--text-tertiary);font-size:0.9rem;">Processing...</p>';
    container.appendChild(loader);
    return loader;
  }

  function hideLoading(container) {
    const loader = container.querySelector('.pit-loading');
    if (loader) loader.remove();
  }


  // ═══════════════════════════════════════════════
  // 1. BACKGROUND REMOVER
  // ═══════════════════════════════════════════════
  (() => {
    const canvas = document.getElementById('bgr-canvas');
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    const preview = document.getElementById('bgr-preview');
    const processBtn = document.getElementById('bgr-process-btn');
    const resetBtn = document.getElementById('bgr-reset-btn');
    const downloadBtn = document.getElementById('bgr-download-btn');
    const downloadJpgBtn = document.getElementById('bgr-download-jpg-btn');
    const downloadBar = document.getElementById('bgr-download-bar');
    const toleranceSlider = document.getElementById('bgr-tolerance');
    const toleranceVal = document.getElementById('bgr-tolerance-val');
    const colorPicker = document.getElementById('bgr-color');
    const eyedropperBtn = document.getElementById('bgr-eyedropper-btn');
    const replaceColorPicker = document.getElementById('bgr-replace-color');
    const replaceRadios = document.querySelectorAll('input[name="bgr-replace"]');

    let originalImage = null;
    let pickingColor = false;

    // Tolerance slider
    toleranceSlider.addEventListener('input', () => {
      toleranceVal.textContent = toleranceSlider.value;
    });

    // Replace option toggle
    replaceRadios.forEach(r => r.addEventListener('change', () => {
      replaceColorPicker.style.display = r.value === 'custom' && r.checked ? 'block' : 'none';
    }));

    // File upload
    setupDropZone('bgr-drop-zone', 'bgr-file-input', async (file) => {
      originalImage = await loadImage(file);
      canvas.width = originalImage.width;
      canvas.height = originalImage.height;
      ctx.drawImage(originalImage, 0, 0);
      canvas.style.display = 'block';
      const placeholder = preview.querySelector('.pit-placeholder');
      if (placeholder) placeholder.style.display = 'none';
      downloadBar.style.display = 'none';
      processBtn.disabled = false;
      resetBtn.disabled = false;
    });

    // Eyedropper — pick color from canvas
    eyedropperBtn.addEventListener('click', () => {
      if (!originalImage) return;
      // Try native EyeDropper API first
      if (window.EyeDropper) {
        const dropper = new EyeDropper();
        dropper.open().then(result => {
          colorPicker.value = result.sRGBHex;
        }).catch(() => {});
        return;
      }
      // Fallback: click on canvas
      pickingColor = true;
      canvas.style.cursor = 'crosshair';
      eyedropperBtn.textContent = 'Click on image...';
    });

    canvas.addEventListener('click', (e) => {
      if (!pickingColor) return;
      const rect = canvas.getBoundingClientRect();
      const scaleX = canvas.width / rect.width;
      const scaleY = canvas.height / rect.height;
      const x = Math.floor((e.clientX - rect.left) * scaleX);
      const y = Math.floor((e.clientY - rect.top) * scaleY);
      const pixel = ctx.getImageData(x, y, 1, 1).data;
      const hex = '#' + [pixel[0], pixel[1], pixel[2]].map(c => c.toString(16).padStart(2, '0')).join('');
      colorPicker.value = hex;
      pickingColor = false;
      canvas.style.cursor = 'default';
      eyedropperBtn.textContent = 'Pick from Image';
    });

    // Process background removal
    processBtn.addEventListener('click', () => {
      if (!originalImage) return;
      const loader = showLoading(preview);
      canvas.style.display = 'none';

      // Use setTimeout to let loading UI render
      setTimeout(() => {
        // Re-draw original
        canvas.width = originalImage.width;
        canvas.height = originalImage.height;
        ctx.drawImage(originalImage, 0, 0);

        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;
        const tolerance = parseInt(toleranceSlider.value);

        // Parse target color
        const targetHex = colorPicker.value;
        const tR = parseInt(targetHex.substr(1, 2), 16);
        const tG = parseInt(targetHex.substr(3, 2), 16);
        const tB = parseInt(targetHex.substr(5, 2), 16);

        // Parse replacement
        const replaceMode = document.querySelector('input[name="bgr-replace"]:checked').value;
        let rR = 0, rG = 0, rB = 0, rA = 0;
        if (replaceMode === 'white') { rR = 255; rG = 255; rB = 255; rA = 255; }
        else if (replaceMode === 'custom') {
          const cHex = replaceColorPicker.value;
          rR = parseInt(cHex.substr(1, 2), 16);
          rG = parseInt(cHex.substr(3, 2), 16);
          rB = parseInt(cHex.substr(5, 2), 16);
          rA = 255;
        }

        // Flood-fill style BG removal using color distance
        const tolSquared = tolerance * tolerance * 3; // scaled for RGB
        for (let i = 0; i < data.length; i += 4) {
          const dR = data[i] - tR;
          const dG = data[i + 1] - tG;
          const dB = data[i + 2] - tB;
          const distSq = dR * dR + dG * dG + dB * dB;

          if (distSq <= tolSquared) {
            data[i] = rR;
            data[i + 1] = rG;
            data[i + 2] = rB;
            data[i + 3] = rA;
          }
        }

        ctx.putImageData(imageData, 0, 0);
        hideLoading(preview);
        canvas.style.display = 'block';
        downloadBar.style.display = 'flex';
      }, 50);
    });

    // Reset
    resetBtn.addEventListener('click', () => {
      if (!originalImage) return;
      canvas.width = originalImage.width;
      canvas.height = originalImage.height;
      ctx.drawImage(originalImage, 0, 0);
      downloadBar.style.display = 'none';
    });

    // Downloads
    downloadBtn.addEventListener('click', () => downloadCanvas(canvas, 'product-bg-removed.png'));
    downloadJpgBtn.addEventListener('click', () => {
      // For JPG, draw onto a white background canvas first
      const jpgCanvas = document.createElement('canvas');
      jpgCanvas.width = canvas.width;
      jpgCanvas.height = canvas.height;
      const jpgCtx = jpgCanvas.getContext('2d');
      jpgCtx.fillStyle = '#ffffff';
      jpgCtx.fillRect(0, 0, jpgCanvas.width, jpgCanvas.height);
      jpgCtx.drawImage(canvas, 0, 0);
      downloadCanvas(jpgCanvas, 'product-bg-removed.jpg', 'image/jpeg', 0.92);
    });
  })();


  // ═══════════════════════════════════════════════
  // 2. IMAGE RESIZER
  // ═══════════════════════════════════════════════
  (() => {
    const canvas = document.getElementById('rsz-canvas');
    const ctx = canvas.getContext('2d');
    const preview = document.getElementById('rsz-preview');
    const processBtn = document.getElementById('rsz-process-btn');
    const resetBtn = document.getElementById('rsz-reset-btn');
    const downloadBtn = document.getElementById('rsz-download-btn');
    const downloadBar = document.getElementById('rsz-download-bar');
    const widthInput = document.getElementById('rsz-width');
    const heightInput = document.getElementById('rsz-height');
    const lockRatio = document.getElementById('rsz-lock-ratio');
    const formatSelect = document.getElementById('rsz-format');
    const qualitySlider = document.getElementById('rsz-quality');
    const qualityVal = document.getElementById('rsz-quality-val');
    const origInfo = document.getElementById('rsz-original-info');
    const origDims = document.getElementById('rsz-orig-dims');
    const origSize = document.getElementById('rsz-orig-size');
    const resultInfo = document.getElementById('rsz-result-info');
    const resultDims = document.getElementById('rsz-result-dims');
    const resultSize = document.getElementById('rsz-result-size');
    const presetBtns = document.querySelectorAll('.pit-preset-btn');

    let originalImage = null;
    let aspectRatio = 1;
    let originalFile = null;

    qualitySlider.addEventListener('input', () => {
      qualityVal.textContent = qualitySlider.value + '%';
    });

    // Presets
    presetBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        presetBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        widthInput.value = btn.dataset.w;
        heightInput.value = btn.dataset.h;
      });
    });

    // Lock aspect ratio
    widthInput.addEventListener('input', () => {
      if (lockRatio.checked && originalImage) {
        heightInput.value = Math.round(parseInt(widthInput.value) / aspectRatio) || '';
      }
      presetBtns.forEach(b => b.classList.remove('active'));
    });

    heightInput.addEventListener('input', () => {
      if (lockRatio.checked && originalImage) {
        widthInput.value = Math.round(parseInt(heightInput.value) * aspectRatio) || '';
      }
      presetBtns.forEach(b => b.classList.remove('active'));
    });

    // File upload
    setupDropZone('rsz-drop-zone', 'rsz-file-input', async (file) => {
      originalFile = file;
      originalImage = await loadImage(file);
      aspectRatio = originalImage.width / originalImage.height;

      // Show original on canvas
      canvas.width = originalImage.width;
      canvas.height = originalImage.height;
      ctx.drawImage(originalImage, 0, 0);
      canvas.style.display = 'block';
      const placeholder = preview.querySelector('.pit-placeholder');
      if (placeholder) placeholder.style.display = 'none';

      // Fill dimension inputs
      widthInput.value = originalImage.width;
      heightInput.value = originalImage.height;

      // Show info
      origInfo.style.display = 'flex';
      origDims.textContent = `${originalImage.width} × ${originalImage.height}`;
      origSize.textContent = formatBytes(file.size);

      downloadBar.style.display = 'none';
      resultInfo.style.display = 'none';
      processBtn.disabled = false;
      resetBtn.disabled = false;
    });

    // Process resize
    processBtn.addEventListener('click', () => {
      if (!originalImage) return;
      const w = parseInt(widthInput.value);
      const h = parseInt(heightInput.value);
      if (!w || !h || w < 1 || h < 1) return;

      const loader = showLoading(preview);
      canvas.style.display = 'none';

      setTimeout(() => {
        canvas.width = w;
        canvas.height = h;
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        ctx.drawImage(originalImage, 0, 0, w, h);

        hideLoading(preview);
        canvas.style.display = 'block';

        // Show result info
        const format = formatSelect.value;
        const quality = parseInt(qualitySlider.value) / 100;
        const mimeType = format === 'jpeg' ? 'image/jpeg' : format === 'webp' ? 'image/webp' : 'image/png';
        const dataUrl = canvas.toDataURL(mimeType, quality);
        const resultBytes = Math.round((dataUrl.length - `data:${mimeType};base64,`.length) * 3 / 4);

        resultInfo.style.display = 'flex';
        resultDims.textContent = `${w} × ${h}`;
        resultSize.textContent = `≈ ${formatBytes(resultBytes)}`;

        downloadBar.style.display = 'flex';
      }, 50);
    });

    // Reset
    resetBtn.addEventListener('click', () => {
      if (!originalImage) return;
      canvas.width = originalImage.width;
      canvas.height = originalImage.height;
      ctx.drawImage(originalImage, 0, 0);
      widthInput.value = originalImage.width;
      heightInput.value = originalImage.height;
      downloadBar.style.display = 'none';
      resultInfo.style.display = 'none';
      presetBtns.forEach(b => b.classList.remove('active'));
    });

    // Download
    downloadBtn.addEventListener('click', () => {
      const format = formatSelect.value;
      const quality = parseInt(qualitySlider.value) / 100;
      const mimeType = format === 'jpeg' ? 'image/jpeg' : format === 'webp' ? 'image/webp' : 'image/png';
      const ext = format === 'jpeg' ? 'jpg' : format;

      if (format === 'jpeg') {
        // Draw on white background for JPG
        const tmpCanvas = document.createElement('canvas');
        tmpCanvas.width = canvas.width;
        tmpCanvas.height = canvas.height;
        const tmpCtx = tmpCanvas.getContext('2d');
        tmpCtx.fillStyle = '#ffffff';
        tmpCtx.fillRect(0, 0, tmpCanvas.width, tmpCanvas.height);
        tmpCtx.drawImage(canvas, 0, 0);
        downloadCanvas(tmpCanvas, `product-resized.${ext}`, mimeType, quality);
      } else {
        downloadCanvas(canvas, `product-resized.${ext}`, mimeType, quality);
      }
    });
  })();


  // ═══════════════════════════════════════════════
  // 3. WATERMARK STAMPER
  // ═══════════════════════════════════════════════
  (() => {
    const canvas = document.getElementById('wm-canvas');
    const ctx = canvas.getContext('2d');
    const preview = document.getElementById('wm-preview');
    const processBtn = document.getElementById('wm-process-btn');
    const resetBtn = document.getElementById('wm-reset-btn');
    const downloadBtn = document.getElementById('wm-download-btn');
    const downloadJpgBtn = document.getElementById('wm-download-jpg-btn');
    const downloadBar = document.getElementById('wm-download-bar');
    const textInput = document.getElementById('wm-text');
    const fontSizeSlider = document.getElementById('wm-font-size');
    const fontSizeVal = document.getElementById('wm-font-size-val');
    const opacitySlider = document.getElementById('wm-opacity');
    const opacityVal = document.getElementById('wm-opacity-val');
    const colorPicker = document.getElementById('wm-color');
    const rotationSlider = document.getElementById('wm-rotation');
    const rotationVal = document.getElementById('wm-rotation-val');
    const tiledCheckbox = document.getElementById('wm-tiled');
    const posBtns = document.querySelectorAll('.pit-pos-btn');

    let originalImage = null;
    let watermarkPosition = 'center';

    // Slider updates
    fontSizeSlider.addEventListener('input', () => { fontSizeVal.textContent = fontSizeSlider.value + 'px'; });
    opacitySlider.addEventListener('input', () => { opacityVal.textContent = opacitySlider.value + '%'; });
    rotationSlider.addEventListener('input', () => { rotationVal.textContent = rotationSlider.value + '°'; });

    // Position buttons
    posBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        posBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        watermarkPosition = btn.dataset.pos;
      });
    });

    // File upload
    setupDropZone('wm-drop-zone', 'wm-file-input', async (file) => {
      originalImage = await loadImage(file);
      canvas.width = originalImage.width;
      canvas.height = originalImage.height;
      ctx.drawImage(originalImage, 0, 0);
      canvas.style.display = 'block';
      const placeholder = preview.querySelector('.pit-placeholder');
      if (placeholder) placeholder.style.display = 'none';
      downloadBar.style.display = 'none';
      processBtn.disabled = false;
      resetBtn.disabled = false;
    });

    // Apply watermark
    processBtn.addEventListener('click', () => {
      if (!originalImage) return;
      const text = textInput.value.trim();
      if (!text) return;

      const loader = showLoading(preview);
      canvas.style.display = 'none';

      setTimeout(() => {
        // Re-draw original
        canvas.width = originalImage.width;
        canvas.height = originalImage.height;
        ctx.drawImage(originalImage, 0, 0);

        const fontSize = parseInt(fontSizeSlider.value);
        const opacity = parseInt(opacitySlider.value) / 100;
        const rotation = parseInt(rotationSlider.value) * Math.PI / 180;
        const color = colorPicker.value;
        const isTiled = tiledCheckbox.checked;

        ctx.save();
        ctx.globalAlpha = opacity;
        ctx.fillStyle = color;
        ctx.font = `bold ${fontSize}px Arial, sans-serif`;
        ctx.textBaseline = 'middle';
        ctx.textAlign = 'center';

        if (isTiled) {
          // Tile watermark across entire image
          const metrics = ctx.measureText(text);
          const textW = metrics.width + 60;
          const textH = fontSize + 40;

          for (let y = -canvas.height; y < canvas.height * 2; y += textH) {
            for (let x = -canvas.width; x < canvas.width * 2; x += textW) {
              ctx.save();
              ctx.translate(x, y);
              ctx.rotate(rotation);
              ctx.fillText(text, 0, 0);
              ctx.restore();
            }
          }
        } else {
          // Single watermark at position
          let x, y;
          const pad = fontSize;

          switch (watermarkPosition) {
            case 'top-left': x = pad; y = pad; ctx.textAlign = 'left'; break;
            case 'top-center': x = canvas.width / 2; y = pad; break;
            case 'top-right': x = canvas.width - pad; y = pad; ctx.textAlign = 'right'; break;
            case 'center-left': x = pad; y = canvas.height / 2; ctx.textAlign = 'left'; break;
            case 'center': x = canvas.width / 2; y = canvas.height / 2; break;
            case 'center-right': x = canvas.width - pad; y = canvas.height / 2; ctx.textAlign = 'right'; break;
            case 'bottom-left': x = pad; y = canvas.height - pad; ctx.textAlign = 'left'; break;
            case 'bottom-center': x = canvas.width / 2; y = canvas.height - pad; break;
            case 'bottom-right': x = canvas.width - pad; y = canvas.height - pad; ctx.textAlign = 'right'; break;
            default: x = canvas.width / 2; y = canvas.height / 2;
          }

          ctx.translate(x, y);
          ctx.rotate(rotation);
          ctx.fillText(text, 0, 0);
        }

        ctx.restore();
        hideLoading(preview);
        canvas.style.display = 'block';
        downloadBar.style.display = 'flex';
      }, 50);
    });

    // Reset
    resetBtn.addEventListener('click', () => {
      if (!originalImage) return;
      canvas.width = originalImage.width;
      canvas.height = originalImage.height;
      ctx.drawImage(originalImage, 0, 0);
      downloadBar.style.display = 'none';
    });

    // Downloads
    downloadBtn.addEventListener('click', () => downloadCanvas(canvas, 'product-watermarked.png'));
    downloadJpgBtn.addEventListener('click', () => {
      const jpgCanvas = document.createElement('canvas');
      jpgCanvas.width = canvas.width;
      jpgCanvas.height = canvas.height;
      const jpgCtx = jpgCanvas.getContext('2d');
      jpgCtx.fillStyle = '#ffffff';
      jpgCtx.fillRect(0, 0, jpgCanvas.width, jpgCanvas.height);
      jpgCtx.drawImage(canvas, 0, 0);
      downloadCanvas(jpgCanvas, 'product-watermarked.jpg', 'image/jpeg', 0.92);
    });
  })();


  // ═══════════════════════════════════════════════
  // 4. THUMBNAIL GENERATOR
  // ═══════════════════════════════════════════════
  (() => {
    const generateBtn = document.getElementById('thumb-generate-btn');
    const downloadAllBtn = document.getElementById('thumb-download-all-btn');
    const resultsContainer = document.getElementById('thumb-results');
    const bgColorPicker = document.getElementById('thumb-bg-color');
    const transparentCheckbox = document.getElementById('thumb-transparent');
    const sizeChecks = document.querySelectorAll('.thumb-size-check');

    let originalImage = null;
    let generatedThumbnails = [];

    // File upload
    setupDropZone('thumb-drop-zone', 'thumb-file-input', async (file) => {
      originalImage = await loadImage(file);
      generateBtn.disabled = false;
      resultsContainer.style.display = 'none';
      resultsContainer.innerHTML = '';
      downloadAllBtn.disabled = true;
      generatedThumbnails = [];
    });

    // Generate thumbnails
    generateBtn.addEventListener('click', () => {
      if (!originalImage) return;

      const selectedSizes = [];
      sizeChecks.forEach(check => {
        if (check.checked) {
          selectedSizes.push({ w: parseInt(check.dataset.w), h: parseInt(check.dataset.h) });
        }
      });

      if (selectedSizes.length === 0) return;

      resultsContainer.innerHTML = '';
      resultsContainer.style.display = 'grid';
      generatedThumbnails = [];

      const bgColor = bgColorPicker.value;
      const isTransparent = transparentCheckbox.checked;

      selectedSizes.forEach(size => {
        const thumbCanvas = document.createElement('canvas');
        thumbCanvas.width = size.w;
        thumbCanvas.height = size.h;
        const thumbCtx = thumbCanvas.getContext('2d');

        // Fill background
        if (!isTransparent) {
          thumbCtx.fillStyle = bgColor;
          thumbCtx.fillRect(0, 0, size.w, size.h);
        }

        // Fit image into target dimensions maintaining aspect ratio
        const imgAspect = originalImage.width / originalImage.height;
        const targetAspect = size.w / size.h;
        let drawW, drawH, drawX, drawY;

        if (imgAspect > targetAspect) {
          // Image is wider — fit to width
          drawW = size.w;
          drawH = size.w / imgAspect;
          drawX = 0;
          drawY = (size.h - drawH) / 2;
        } else {
          // Image is taller — fit to height
          drawH = size.h;
          drawW = size.h * imgAspect;
          drawX = (size.w - drawW) / 2;
          drawY = 0;
        }

        thumbCtx.imageSmoothingEnabled = true;
        thumbCtx.imageSmoothingQuality = 'high';
        thumbCtx.drawImage(originalImage, drawX, drawY, drawW, drawH);

        // Create card
        const card = document.createElement('div');
        card.className = 'pit-thumb-card';

        const previewDiv = document.createElement('div');
        previewDiv.className = 'pit-thumb-card-preview';

        // Display canvas (scaled down for display)
        const displayCanvas = document.createElement('canvas');
        const displaySize = 180;
        const displayScale = Math.min(displaySize / size.w, displaySize / size.h, 1);
        displayCanvas.width = Math.round(size.w * displayScale);
        displayCanvas.height = Math.round(size.h * displayScale);
        const displayCtx = displayCanvas.getContext('2d');
        displayCtx.drawImage(thumbCanvas, 0, 0, displayCanvas.width, displayCanvas.height);
        previewDiv.appendChild(displayCanvas);

        const infoDiv = document.createElement('div');
        infoDiv.className = 'pit-thumb-card-info';
        infoDiv.innerHTML = `
          <span>${size.w}×${size.h}</span>
          <button class="btn btn-secondary pit-thumb-dl-btn">Download</button>
        `;

        card.appendChild(previewDiv);
        card.appendChild(infoDiv);
        resultsContainer.appendChild(card);

        // Store for download
        const entry = { canvas: thumbCanvas, w: size.w, h: size.h };
        generatedThumbnails.push(entry);

        // Individual download
        const dlBtn = infoDiv.querySelector('.pit-thumb-dl-btn');
        dlBtn.addEventListener('click', () => {
          const ext = isTransparent ? 'png' : 'png';
          downloadCanvas(thumbCanvas, `product-${size.w}x${size.h}.${ext}`);
        });
      });

      downloadAllBtn.disabled = false;
    });

    // Download all — since we can't use zip without a library, we download sequentially
    downloadAllBtn.addEventListener('click', () => {
      generatedThumbnails.forEach((t, i) => {
        setTimeout(() => {
          downloadCanvas(t.canvas, `product-${t.w}x${t.h}.png`);
        }, i * 300);
      });
    });
  })();

});
