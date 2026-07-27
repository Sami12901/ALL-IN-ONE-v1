// Image Resizer & Compressor — Full Client-Side Logic
document.addEventListener('DOMContentLoaded', () => {
  // DOM References
  const dropZone = document.getElementById('drop-zone');
  const fileInput = document.getElementById('file-input');
  const originalInfo = document.getElementById('original-info');
  const originalName = document.getElementById('original-name');
  const originalDims = document.getElementById('original-dims');
  const originalSize = document.getElementById('original-size');
  const controlsPanel = document.getElementById('controls-panel');
  const clearBtn = document.getElementById('clear-btn');
  const processBtn = document.getElementById('process-btn');

  const resizeWidth = document.getElementById('resize-width');
  const resizeHeight = document.getElementById('resize-height');
  const lockAspectBtn = document.getElementById('lock-aspect');
  const lockIcon = document.getElementById('lock-icon');
  const outputFormat = document.getElementById('output-format');
  const qualitySlider = document.getElementById('quality-slider');
  const qualityValue = document.getElementById('quality-value');
  const qualityGroup = document.getElementById('quality-group');

  const previewArea = document.getElementById('preview-area');
  const previewPlaceholder = document.getElementById('preview-placeholder');
  const previewImg = document.getElementById('preview-img');

  const resultInfo = document.getElementById('result-info');
  const resultDims = document.getElementById('result-dims');
  const resultSize = document.getElementById('result-size');
  const resultSavings = document.getElementById('result-savings');

  // State
  let currentFile = null;
  let originalImage = null; // HTMLImageElement with original loaded pixels
  let originalWidth = 0;
  let originalHeight = 0;
  let aspectRatio = 1;
  let aspectLocked = true;
  let isUpdatingDims = false; // guard against recursive dimension updates

  // ─── Drag & Drop ───────────────────────────────────────────
  ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(ev => {
    dropZone.addEventListener(ev, e => { e.preventDefault(); e.stopPropagation(); }, false);
  });

  ['dragenter', 'dragover'].forEach(ev => {
    dropZone.addEventListener(ev, () => dropZone.classList.add('drag-over'), false);
  });

  ['dragleave', 'drop'].forEach(ev => {
    dropZone.addEventListener(ev, () => dropZone.classList.remove('drag-over'), false);
  });

  dropZone.addEventListener('drop', e => {
    const files = e.dataTransfer.files;
    if (files.length > 0) handleFile(files[0]);
  });

  fileInput.addEventListener('change', function () {
    if (this.files.length > 0) handleFile(this.files[0]);
  });

  // ─── File Handling ─────────────────────────────────────────
  function handleFile(file) {
    if (!file.type.startsWith('image/')) {
      alert('Please upload a valid image file.');
      return;
    }

    currentFile = file;
    const url = URL.createObjectURL(file);

    const img = new Image();
    img.onload = () => {
      originalImage = img;
      originalWidth = img.naturalWidth;
      originalHeight = img.naturalHeight;
      aspectRatio = originalWidth / originalHeight;

      // Populate UI
      originalName.textContent = file.name;
      originalDims.textContent = `${originalWidth} × ${originalHeight}`;
      originalSize.textContent = formatBytes(file.size);

      resizeWidth.value = originalWidth;
      resizeHeight.value = originalHeight;

      // Show UI
      dropZone.style.display = 'none';
      originalInfo.style.display = 'flex';
      controlsPanel.style.display = 'block';
      resultInfo.style.display = 'none';

      // Reset active states
      resetPresets();
      resetScaleBtns(100);

      // Show preview
      showPreview(url);
    };
    img.onerror = () => {
      alert('Could not read the image. Please try a different file.');
      URL.revokeObjectURL(url);
    };
    img.src = url;
  }

  function showPreview(src) {
    previewPlaceholder.style.display = 'none';
    previewImg.style.display = 'block';
    previewImg.src = src;
  }

  // ─── Clear ─────────────────────────────────────────────────
  clearBtn.addEventListener('click', () => {
    currentFile = null;
    originalImage = null;
    fileInput.value = '';

    dropZone.style.display = 'block';
    originalInfo.style.display = 'none';
    controlsPanel.style.display = 'none';
    resultInfo.style.display = 'none';

    previewPlaceholder.style.display = 'flex';
    previewImg.style.display = 'none';
    previewImg.src = '';

    resizeWidth.value = '';
    resizeHeight.value = '';
  });

  // ─── Aspect Ratio Lock ─────────────────────────────────────
  lockAspectBtn.addEventListener('click', () => {
    aspectLocked = !aspectLocked;
    lockAspectBtn.classList.toggle('locked', aspectLocked);

    // Swap lock icon: locked vs unlocked
    if (aspectLocked) {
      lockIcon.innerHTML = '<rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path>';
    } else {
      lockIcon.innerHTML = '<rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 9.9-1"></path>';
    }
  });

  // Start locked
  lockAspectBtn.classList.add('locked');

  // ─── Dimension Inputs ──────────────────────────────────────
  resizeWidth.addEventListener('input', () => {
    if (isUpdatingDims) return;
    isUpdatingDims = true;
    resetPresets();
    resetScaleBtns(null);

    if (aspectLocked && originalImage) {
      const w = parseInt(resizeWidth.value) || 0;
      resizeHeight.value = Math.round(w / aspectRatio) || '';
    }
    isUpdatingDims = false;
  });

  resizeHeight.addEventListener('input', () => {
    if (isUpdatingDims) return;
    isUpdatingDims = true;
    resetPresets();
    resetScaleBtns(null);

    if (aspectLocked && originalImage) {
      const h = parseInt(resizeHeight.value) || 0;
      resizeWidth.value = Math.round(h * aspectRatio) || '';
    }
    isUpdatingDims = false;
  });

  // ─── Preset Buttons ────────────────────────────────────────
  document.querySelectorAll('.irc-preset-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const w = parseInt(btn.dataset.w);
      const h = parseInt(btn.dataset.h);

      resizeWidth.value = w;
      resizeHeight.value = h;

      resetPresets();
      btn.classList.add('active');
      resetScaleBtns(null);
    });
  });

  function resetPresets() {
    document.querySelectorAll('.irc-preset-btn').forEach(b => b.classList.remove('active'));
  }

  // ─── Scale Buttons ─────────────────────────────────────────
  document.querySelectorAll('.irc-scale-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      if (!originalImage) return;

      const scale = parseInt(btn.dataset.scale) / 100;
      resizeWidth.value = Math.round(originalWidth * scale);
      resizeHeight.value = Math.round(originalHeight * scale);

      resetScaleBtns(parseInt(btn.dataset.scale));
      resetPresets();
    });
  });

  function resetScaleBtns(activeValue) {
    document.querySelectorAll('.irc-scale-btn').forEach(b => {
      b.classList.toggle('active', activeValue !== null && parseInt(b.dataset.scale) === activeValue);
    });
  }

  // ─── Quality Slider ────────────────────────────────────────
  qualitySlider.addEventListener('input', () => {
    qualityValue.textContent = qualitySlider.value;
  });

  // PNG doesn't support quality parameter
  outputFormat.addEventListener('change', () => {
    const fmt = outputFormat.value;
    if (fmt === 'png') {
      qualityGroup.style.opacity = '0.4';
      qualityGroup.style.pointerEvents = 'none';
    } else {
      qualityGroup.style.opacity = '1';
      qualityGroup.style.pointerEvents = 'auto';
    }
  });

  // ─── Process & Download ────────────────────────────────────
  processBtn.addEventListener('click', () => {
    if (!originalImage) return;

    const targetW = parseInt(resizeWidth.value) || originalWidth;
    const targetH = parseInt(resizeHeight.value) || originalHeight;
    const format = outputFormat.value; // jpeg, png, webp
    const quality = parseInt(qualitySlider.value) / 100;

    // Validate
    if (targetW < 1 || targetH < 1 || targetW > 10000 || targetH > 10000) {
      alert('Dimensions must be between 1 and 10,000 pixels.');
      return;
    }

    processBtn.disabled = true;
    processBtn.innerHTML = `
      <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="animation: spin 1s linear infinite;">
        <line x1="12" y1="2" x2="12" y2="6"></line><line x1="12" y1="18" x2="12" y2="22"></line>
        <line x1="4.93" y1="4.93" x2="7.76" y2="7.76"></line><line x1="16.24" y1="16.24" x2="19.07" y2="19.07"></line>
        <line x1="2" y1="12" x2="6" y2="12"></line><line x1="18" y1="12" x2="22" y2="12"></line>
        <line x1="4.93" y1="19.07" x2="7.76" y2="16.24"></line><line x1="16.24" y1="7.76" x2="19.07" y2="4.93"></line>
      </svg>
      Processing...
    `;

    // Use requestAnimationFrame to allow UI to update before heavy processing
    requestAnimationFrame(() => {
      setTimeout(() => {
        try {
          // Create canvas for resizing
          const canvas = document.createElement('canvas');
          canvas.width = targetW;
          canvas.height = targetH;
          const ctx = canvas.getContext('2d');

          // Enable high-quality interpolation
          ctx.imageSmoothingEnabled = true;
          ctx.imageSmoothingQuality = 'high';

          // Draw resized image
          ctx.drawImage(originalImage, 0, 0, targetW, targetH);

          // Determine MIME type and extension
          let mimeType, ext;
          if (format === 'jpeg') {
            mimeType = 'image/jpeg';
            ext = 'jpg';
          } else if (format === 'png') {
            mimeType = 'image/png';
            ext = 'png';
          } else {
            mimeType = 'image/webp';
            ext = 'webp';
          }

          // Convert to blob
          canvas.toBlob(blob => {
            if (!blob) {
              alert('Failed to process image. Your browser may not support this format.');
              resetProcessBtn();
              return;
            }

            // Update preview
            const previewUrl = URL.createObjectURL(blob);
            showPreview(previewUrl);

            // Update result info
            resultDims.textContent = `${targetW} × ${targetH}`;
            resultSize.textContent = formatBytes(blob.size);
            resultInfo.style.display = 'flex';

            // Calculate savings
            if (currentFile && blob.size < currentFile.size) {
              const savings = Math.round((1 - blob.size / currentFile.size) * 100);
              resultSavings.textContent = `-${savings}%`;
              resultSavings.style.display = 'inline-block';
            } else {
              resultSavings.style.display = 'none';
            }

            // Trigger download
            const baseName = currentFile.name.replace(/\.[^.]+$/, '');
            const filename = `${baseName}_${targetW}x${targetH}.${ext}`;
            const a = document.createElement('a');
            a.href = previewUrl;
            a.download = filename;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);

            // Don't revoke previewUrl since it's showing in preview
            resetProcessBtn();
          }, mimeType, format === 'png' ? undefined : quality);

        } catch (err) {
          console.error('Image processing error:', err);
          alert('An error occurred while processing the image.');
          resetProcessBtn();
        }
      }, 50);
    });
  });

  function resetProcessBtn() {
    processBtn.disabled = false;
    processBtn.innerHTML = `
      <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
        <polyline points="7 10 12 15 17 10"></polyline>
        <line x1="12" y1="15" x2="12" y2="3"></line>
      </svg>
      Resize & Download
    `;
  }

  // ─── Helpers ───────────────────────────────────────────────
  function formatBytes(bytes) {
    if (bytes === 0) return '0 B';
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
  }
});

// Spin animation for the loading state (added via inline style in the JS above)
const styleEl = document.createElement('style');
styleEl.textContent = `
  @keyframes spin {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }
`;
document.head.appendChild(styleEl);