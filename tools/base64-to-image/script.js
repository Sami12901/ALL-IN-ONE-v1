// Base64 to Image Converter - Complete Client-Side Logic
document.addEventListener('DOMContentLoaded', () => {
  // Demo presets
  const DEMO_PRESETS = {
    icon: 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAxMDAgMTAwIiB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCI+CiAgPGRlZnM+CiAgICA8bGluZWFyR3JhZGllbnQgaWQ9ImciIHgxPSIwJSIgeTE9IjAlIiB4Mj0iMTAwJSIgeTI9IjEwMCUiPgogICAgICA8c3RvcCBvZmZzZXQ9IjAlIiBzdG9wLWNvbG9yPSIjNGU4NWJmIi8+CiAgICAgIDxzdG9wIG9mZnNldD0iMTAwJSIgc3RvcC1jb2xvcj0iIzg5YWFjYyIvPgogICAgPC9saW5lYXJHcmFkaWVudD4KICA8L2RlZnM+CiAgPHJlY3Qgd2lkdGg9IjEwMCIgaGVpZ2h0PSIxMDAiIHJ4PSIyMiIgZmlsbD0idXJsKCNnKSIvPgogIDxwYXRoIGQ9Ik01MCAyMCBMNTkgMzggTDc5IDQxIEw2NSA1NSBMNjggNzUgTDUwIDY1IEwzMiA3NSBMMzUgNTUgTDIxIDQxIEw0MSAzOCBaIiBmaWxsPSIjZmZmZmZmIiBvcGFjaXR5PSIwLjk1Ii8+Cjwvc3ZnPg==',
    gradient: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAAbUlEQVRYR+3WMQqAMBCE4clj2HmsrLy0l8tYeQyPoqUQkCBiY5DNPwvvF0hmdgN1gAMqQ7k663g66wAGtIKv6oW933q4k/9yQIADDrg3wFh0P/gZqJq3H+ABeOABrA7vG+fPAB7wAJyB4wB5ACc9SgO0/eZSAAAAAElFTkSuQmCC',
    avatar: 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAxMjggMTI4IiB3aWR0aD0iMTI4IiBoZWlnaHQ9IjEyOCI+CiAgPGRlZnM+CiAgICA8bGluZWFyR3JhZGllbnQgaWQ9ImJnIiB4MT0iMCUiIHkxPSIwJSIgeDI9IjEwMCUiIHkyPSIxMDAlIj4KICAgICAgPHN0b3Agb2Zmc2V0PSIwJSIgc3RvcC1jb2xvcj0iIzEwYjk4MSIvPgogICAgICA8c3RvcCBvZmZzZXQ9IjEwMCUiIHN0b3AtY29sb3I9IiMzYjgyZjYiLz4KICAgIDwvbGluZWFyR3JhZGllbnQ+CiAgPC9kZWZzPgogIDxjaXJjbGUgY3g9IjY0IiBjeT0iNjQiIHI9IjY0IiBmaWxsPSJ1cmwoI2JnKSIvPgogIDxjaXJjbGUgY3g9IjY0IiBjeT0iNDgiIHI9IjIyIiBmaWxsPSIjZmZmZmZmIi8+CiAgPHBhdGggZD0iTTI2IDEwOCBDMjYgODQgNDUgODAgNjQgODAgQzgzIDgwIDEwMiA4NCAxMDIgMTA4IFoiIGZpbGw9IiNmZmZmZmYiLz4KPC9zdmc+'
  };

  // Elements
  const base64Input = document.getElementById('base64-input');
  const pasteInputBtn = document.getElementById('paste-input-btn');
  const clearInputBtn = document.getElementById('clear-input-btn');
  const mimeIndicator = document.getElementById('mime-indicator');
  const mimeDetectedText = document.getElementById('mime-detected-text');
  const inputCharCount = document.getElementById('input-char-count');
  const inputError = document.getElementById('input-error');

  // Preview elements
  const previewEmptyState = document.getElementById('preview-empty-state');
  const previewActiveState = document.getElementById('preview-active-state');
  const renderedImage = document.getElementById('rendered-image');
  const metaMime = document.getElementById('meta-mime');
  const metaDims = document.getElementById('meta-dims');
  const metaBinarySize = document.getElementById('meta-binary-size');

  // Export controls
  const exportFormat = document.getElementById('export-format');
  const filenameInput = document.getElementById('filename-input');
  const downloadBtn = document.getElementById('download-btn');
  const copyImageBtn = document.getElementById('copy-image-btn');
  const openTabBtn = document.getElementById('open-tab-btn');
  const exportCanvas = document.getElementById('export-canvas');

  // Presets
  const presetIcon = document.getElementById('preset-icon');
  const presetGradient = document.getElementById('preset-gradient');
  const presetAvatar = document.getElementById('preset-avatar');

  // Toast
  const appToast = document.getElementById('app-toast');
  const toastMessage = document.getElementById('toast-message');
  let toastTimer = null;

  // Active state
  let activeDataUri = '';
  let activeDetectedMime = '';
  let activeDimensions = { width: 0, height: 0 };
  let activeBinaryBytes = 0;
  let activeImageObj = null;

  function showToast(msg) {
    if (toastTimer) clearTimeout(toastTimer);
    toastMessage.textContent = msg;
    appToast.classList.add('show');
    toastTimer = setTimeout(() => {
      appToast.classList.remove('show');
    }, 2500);
  }

  function formatBytes(bytes) {
    if (bytes <= 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  function showError(msg) {
    inputError.textContent = msg;
    inputError.style.display = 'block';
    previewActiveState.style.display = 'none';
    previewEmptyState.style.display = 'flex';
  }

  function hideError() {
    inputError.style.display = 'none';
  }

  function detectMimeFromBase64Header(rawStr) {
    // 1. Data URI scheme match
    const dataUriMatch = rawStr.match(/^data:([a-zA-Z0-9\-\+\.\/]+);base64,/i);
    if (dataUriMatch) {
      return dataUriMatch[1].toLowerCase();
    }

    // 2. Magic byte sniffing from Base64 start
    const clean = rawStr.replace(/[^A-Za-z0-9+/=]/g, '');
    if (clean.startsWith('iVBORw0KGgo')) return 'image/png';
    if (clean.startsWith('/9j/')) return 'image/jpeg';
    if (clean.startsWith('R0lGOD')) return 'image/gif';
    if (clean.startsWith('UklGR')) return 'image/webp';
    if (clean.startsWith('Qk')) return 'image/bmp';
    if (clean.startsWith('PHN2Zw') || clean.startsWith('PD94b')) return 'image/svg+xml';

    return 'image/png'; // Default fallback
  }

  function parseBase64(inputString) {
    if (!inputString || !inputString.trim()) {
      return null;
    }

    let trimmed = inputString.trim();

    // Strip surrounding quotes if present
    if ((trimmed.startsWith('"') && trimmed.endsWith('"')) || (trimmed.startsWith("'") && trimmed.endsWith("'"))) {
      trimmed = trimmed.slice(1, -1).trim();
    }

    let mime = '';
    let base64Payload = '';
    let fullDataUri = '';

    const dataUriPrefixMatch = trimmed.match(/^data:([a-zA-Z0-9\-\+\.\/]+);base64,(.*)$/is);

    if (dataUriPrefixMatch) {
      mime = dataUriPrefixMatch[1].toLowerCase();
      base64Payload = dataUriPrefixMatch[2].replace(/\s+/g, '');
      fullDataUri = `data:${mime};base64,${base64Payload}`;
    } else {
      // Raw Base64 string
      mime = detectMimeFromBase64Header(trimmed);
      base64Payload = trimmed.replace(/\s+/g, '');
      fullDataUri = `data:${mime};base64,${base64Payload}`;
    }

    // Sanitize URL-safe base64
    base64Payload = base64Payload.replace(/-/g, '+').replace(/_/g, '/');

    // Calculate binary size
    let padding = 0;
    if (base64Payload.endsWith('==')) padding = 2;
    else if (base64Payload.endsWith('=')) padding = 1;

    const binarySize = Math.max(0, Math.floor((base64Payload.length * 3) / 4) - padding);

    return {
      mime,
      base64Payload,
      fullDataUri,
      binarySize
    };
  }

  function updateFilenameExtension(targetFormat) {
    const currentName = filenameInput.value.trim() || 'decoded-image';
    const dotIdx = currentName.lastIndexOf('.');
    const base = dotIdx > 0 ? currentName.slice(0, dotIdx) : currentName;

    let ext = 'png';
    if (targetFormat === 'original') {
      if (activeDetectedMime.includes('jpeg') || activeDetectedMime.includes('jpg')) ext = 'jpg';
      else if (activeDetectedMime.includes('webp')) ext = 'webp';
      else if (activeDetectedMime.includes('svg')) ext = 'svg';
      else if (activeDetectedMime.includes('gif')) ext = 'gif';
      else if (activeDetectedMime.includes('bmp')) ext = 'bmp';
      else ext = 'png';
    } else if (targetFormat === 'jpeg') {
      ext = 'jpg';
    } else {
      ext = targetFormat;
    }

    filenameInput.value = `${base}.${ext}`;
  }

  function decodeAndRender() {
    hideError();
    const rawVal = base64Input.value;
    inputCharCount.textContent = `${rawVal.length.toLocaleString()} characters`;

    if (!rawVal.trim()) {
      mimeIndicator.classList.remove('detected');
      mimeDetectedText.textContent = 'None';
      previewActiveState.style.display = 'none';
      previewEmptyState.style.display = 'flex';
      activeDataUri = '';
      return;
    }

    const parsed = parseBase64(rawVal);
    if (!parsed || !parsed.base64Payload) {
      showError('Please enter a valid Base64 string.');
      return;
    }

    // Validate Base64 characters
    if (!/^[A-Za-z0-9+/=]+$/.test(parsed.base64Payload)) {
      showError('Input contains invalid Base64 characters.');
      return;
    }

    activeDetectedMime = parsed.mime;
    activeBinaryBytes = parsed.binarySize;
    activeDataUri = parsed.fullDataUri;

    mimeIndicator.classList.add('detected');
    mimeDetectedText.textContent = parsed.mime;

    // Test image loading
    const img = new Image();
    img.onload = () => {
      activeImageObj = img;
      activeDimensions = { width: img.naturalWidth, height: img.naturalHeight };

      renderedImage.src = activeDataUri;
      metaMime.textContent = parsed.mime;
      metaDims.textContent = `${img.naturalWidth} × ${img.naturalHeight} px`;
      metaBinarySize.textContent = formatBytes(activeBinaryBytes);

      updateFilenameExtension(exportFormat.value);

      openTabBtn.href = activeDataUri;

      previewEmptyState.style.display = 'none';
      previewActiveState.style.display = 'flex';
      hideError();
    };

    img.onerror = () => {
      showError('Failed to decode image. The Base64 string may be incomplete or corrupted.');
    };

    img.src = activeDataUri;
  }

  // Preset Handlers
  function loadPreset(key) {
    if (DEMO_PRESETS[key]) {
      base64Input.value = DEMO_PRESETS[key];
      decodeAndRender();
      showToast(`Loaded "${key}" demo!`);
    }
  }

  presetIcon.addEventListener('click', () => loadPreset('icon'));
  presetGradient.addEventListener('click', () => loadPreset('gradient'));
  presetAvatar.addEventListener('click', () => loadPreset('avatar'));

  // Input change & debounce
  let inputTimer = null;
  base64Input.addEventListener('input', () => {
    if (inputTimer) clearTimeout(inputTimer);
    inputTimer = setTimeout(decodeAndRender, 200);
  });

  // Paste action button
  pasteInputBtn.addEventListener('click', async () => {
    try {
      if (navigator.clipboard && navigator.clipboard.readText) {
        const text = await navigator.clipboard.readText();
        if (text) {
          base64Input.value = text;
          decodeAndRender();
          showToast('Pasted Base64 from clipboard!');
        }
      } else {
        base64Input.focus();
        showToast('Please press Ctrl+V to paste into the textarea.');
      }
    } catch (err) {
      console.warn(err);
      base64Input.focus();
      showToast('Clipboard access denied. Please press Ctrl+V.');
    }
  });

  // Clear action button
  clearInputBtn.addEventListener('click', () => {
    base64Input.value = '';
    decodeAndRender();
    showToast('Input cleared.');
  });

  // Format select change
  exportFormat.addEventListener('change', () => {
    updateFilenameExtension(exportFormat.value);
  });

  // Download Handler
  downloadBtn.addEventListener('click', async () => {
    if (!activeDataUri || !activeImageObj) return;

    const chosenFormat = exportFormat.value;
    const filename = filenameInput.value.trim() || 'decoded-image.png';

    // Helper to trigger file download
    function triggerDownload(blob) {
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      showToast(`Downloaded ${filename}!`);
    }

    try {
      if (chosenFormat === 'original') {
        const res = await fetch(activeDataUri);
        const blob = await res.blob();
        triggerDownload(blob);
      } else {
        // Convert via canvas
        const width = activeImageObj.naturalWidth || 300;
        const height = activeImageObj.naturalHeight || 300;
        exportCanvas.width = width;
        exportCanvas.height = height;

        const ctx = exportCanvas.getContext('2d');
        ctx.clearRect(0, 0, width, height);

        // If JPEG, fill white background to prevent black transparent areas
        if (chosenFormat === 'jpeg') {
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(0, 0, width, height);
        }

        ctx.drawImage(activeImageObj, 0, 0, width, height);

        const targetMime = chosenFormat === 'jpeg' ? 'image/jpeg' : (chosenFormat === 'webp' ? 'image/webp' : 'image/png');
        exportCanvas.toBlob((blob) => {
          if (blob) {
            triggerDownload(blob);
          } else {
            showToast('Conversion failed.');
          }
        }, targetMime, 0.95);
      }
    } catch (err) {
      console.error(err);
      showToast('Error during download generation.');
    }
  });

  // Copy Image to Clipboard
  copyImageBtn.addEventListener('click', async () => {
    if (!activeImageObj) return;

    if (!navigator.clipboard || !window.ClipboardItem) {
      showToast('Direct image clipboard copying is not supported in this browser.');
      return;
    }

    try {
      const width = activeImageObj.naturalWidth || 300;
      const height = activeImageObj.naturalHeight || 300;
      exportCanvas.width = width;
      exportCanvas.height = height;

      const ctx = exportCanvas.getContext('2d');
      ctx.clearRect(0, 0, width, height);
      ctx.drawImage(activeImageObj, 0, 0, width, height);

      exportCanvas.toBlob(async (blob) => {
        if (!blob) {
          showToast('Could not convert image for clipboard.');
          return;
        }
        try {
          const item = new ClipboardItem({ 'image/png': blob });
          await navigator.clipboard.write([item]);
          showToast('Image copied to clipboard!');
        } catch (e) {
          console.error(e);
          showToast('Clipboard write failed.');
        }
      }, 'image/png');
    } catch (err) {
      console.error(err);
      showToast('Error copying image.');
    }
  });
});