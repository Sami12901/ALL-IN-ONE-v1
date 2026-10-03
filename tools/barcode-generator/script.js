// Barcode Generator Client-side Logic
document.addEventListener('DOMContentLoaded', () => {
  // DOM Elements
  const formatSelect = document.getElementById('barcode-format');
  const valueInput = document.getElementById('barcode-value');
  const formatHint = document.getElementById('format-hint');
  const presetBtns = document.querySelectorAll('.preset-btn');

  const barWidthSlider = document.getElementById('bar-width');
  const barWidthVal = document.getElementById('bar-width-val');
  const barHeightSlider = document.getElementById('bar-height');
  const barHeightVal = document.getElementById('bar-height-val');

  const displayTextToggle = document.getElementById('display-text-toggle');
  const textOptionsWrap = document.getElementById('text-options-wrap');
  const fontSizeSlider = document.getElementById('font-size');
  const fontSizeVal = document.getElementById('font-size-val');
  const textMarginSlider = document.getElementById('text-margin');
  const textMarginVal = document.getElementById('text-margin-val');

  const lineColorInput = document.getElementById('line-color');
  const lineColorHex = document.getElementById('line-color-hex');
  const bgColorInput = document.getElementById('bg-color');
  const bgColorHex = document.getElementById('bg-color-hex');

  const statusBadge = document.getElementById('status-badge');
  const errorBanner = document.getElementById('barcode-error-banner');
  const barcodeSvg = document.getElementById('barcode-svg');
  const previewStage = document.getElementById('preview-stage');

  const downloadSvgBtn = document.getElementById('download-svg-btn');
  const downloadPngBtn = document.getElementById('download-png-btn');
  const copyValueBtn = document.getElementById('copy-value-btn');
  const exportCanvas = document.getElementById('export-canvas');

  // Format documentation & default samples
  const formatMeta = {
    CODE128: {
      hint: 'Supports all 128 ASCII characters (alphanumeric & punctuation).',
      sample: 'INV-8942-AX'
    },
    EAN13: {
      hint: 'Requires 12 or 13 numeric digits (standard global retail EAN/JAN).',
      sample: '4006381333931'
    },
    UPC: {
      hint: 'Requires 11 or 12 numeric digits (UPC-A standard North America retail).',
      sample: '012345678905'
    },
    CODE39: {
      hint: 'Supports uppercase A-Z, 0-9, and symbols (- . $ / + % space).',
      sample: 'PROD-39'
    },
    ITF: {
      hint: 'Interleaved 2 of 5. Requires an even number of numeric digits.',
      sample: '1234567890'
    },
    ITF14: {
      hint: 'Requires 13 or 14 numeric digits (shipping carton barcode).',
      sample: '12345678901234'
    },
    EAN8: {
      hint: 'Requires 7 or 8 numeric digits (compact retail packaging).',
      sample: '90311017'
    },
    MSI: {
      hint: 'Supports numeric digits 0-9 (warehouse storage & inventory).',
      sample: '123456'
    },
    pharmacode: {
      hint: 'Pharmaceutical binary barcode. Requires a positive integer (3 to 131070).',
      sample: '12345'
    }
  };

  let isValidBarcode = false;

  // Validate format specific constraints
  function validateValue(format, value) {
    if (!value || value.trim() === '') {
      return { valid: false, message: 'Barcode value cannot be empty.' };
    }
    const val = value.trim();

    switch (format) {
      case 'EAN13':
        if (!/^\d{12,13}$/.test(val)) {
          return { valid: false, message: 'EAN-13 requires exactly 12 or 13 numeric digits.' };
        }
        break;
      case 'UPC':
        if (!/^\d{11,12}$/.test(val)) {
          return { valid: false, message: 'UPC-A requires exactly 11 or 12 numeric digits.' };
        }
        break;
      case 'EAN8':
        if (!/^\d{7,8}$/.test(val)) {
          return { valid: false, message: 'EAN-8 requires exactly 7 or 8 numeric digits.' };
        }
        break;
      case 'ITF':
        if (!/^\d+$/.test(val)) {
          return { valid: false, message: 'ITF requires numeric digits only.' };
        }
        if (val.length % 2 !== 0) {
          return { valid: false, message: 'ITF requires an EVEN number of digits (currently ' + val.length + ').' };
        }
        break;
      case 'ITF14':
        if (!/^\d{13,14}$/.test(val)) {
          return { valid: false, message: 'ITF-14 requires 13 or 14 numeric digits.' };
        }
        break;
      case 'CODE39':
        if (!/^[0-9A-Z\-.$/+% ]+$/i.test(val)) {
          return { valid: false, message: 'CODE 39 only allows 0-9, A-Z, and (- . $ / + % space).' };
        }
        break;
      case 'MSI':
        if (!/^\d+$/.test(val)) {
          return { valid: false, message: 'MSI requires numeric digits (0-9).' };
        }
        break;
      case 'pharmacode': {
        const num = parseInt(val, 10);
        if (isNaN(num) || num < 3 || num > 131070 || String(num) !== val) {
          return { valid: false, message: 'Pharmacode must be an integer between 3 and 131070.' };
        }
        break;
      }
      case 'CODE128':
      default:
        // Standard ASCII
        break;
    }

    return { valid: true };
  }

  // Render Barcode
  function renderBarcode() {
    const format = formatSelect.value;
    const rawVal = valueInput.value.trim();
    const width = parseInt(barWidthSlider.value, 10);
    const height = parseInt(barHeightSlider.value, 10);
    const displayValue = displayTextToggle.checked;
    const fontSize = parseInt(fontSizeSlider.value, 10);
    const textMargin = parseInt(textMarginSlider.value, 10);
    const lineColor = lineColorInput.value;
    const background = bgColorInput.value;

    // Check pre-validation
    const validation = validateValue(format, rawVal);
    if (!validation.valid) {
      showError(validation.message);
      return;
    }

    if (typeof window.JsBarcode !== 'function') {
      showError('JsBarcode library is loading or unavailable.');
      return;
    }

    try {
      // Clear previous SVG content
      while (barcodeSvg.firstChild) {
        barcodeSvg.removeChild(barcodeSvg.firstChild);
      }

      window.JsBarcode(barcodeSvg, rawVal, {
        format: format,
        width: width,
        height: height,
        displayValue: displayValue,
        fontSize: fontSize,
        textMargin: textMargin,
        lineColor: lineColor,
        background: background,
        margin: 10,
        valid: (valid) => {
          if (!valid) {
            throw new Error('JsBarcode validation error for format ' + format);
          }
        }
      });

      // Successful render
      hideError();
      isValidBarcode = true;
      downloadSvgBtn.disabled = false;
      downloadPngBtn.disabled = false;

      // Update background of stage for contrast visibility
      previewStage.style.backgroundColor = background;

    } catch (err) {
      console.warn('JsBarcode render error:', err);
      showError(`Render failed for ${format}: ${err.message || 'Invalid characters or checksum.'}`);
    }
  }

  function showError(msg) {
    isValidBarcode = false;
    errorBanner.textContent = msg;
    errorBanner.style.display = 'block';

    statusBadge.textContent = 'Invalid Format';
    statusBadge.style.background = 'rgba(239, 68, 68, 0.15)';
    statusBadge.style.color = 'var(--error)';
    statusBadge.style.borderColor = 'rgba(239, 68, 68, 0.3)';

    downloadSvgBtn.disabled = true;
    downloadPngBtn.disabled = true;
  }

  function hideError() {
    errorBanner.style.display = 'none';

    statusBadge.textContent = 'Valid Barcode';
    statusBadge.style.background = 'rgba(16, 185, 129, 0.15)';
    statusBadge.style.color = 'var(--success)';
    statusBadge.style.borderColor = 'rgba(16, 185, 129, 0.3)';
  }

  // Format selection change
  formatSelect.addEventListener('change', () => {
    const fmt = formatSelect.value;
    const meta = formatMeta[fmt];
    if (meta) {
      formatHint.textContent = meta.hint;
      // If current value is invalid for new format, auto-populate sample
      const test = validateValue(fmt, valueInput.value);
      if (!test.valid) {
        valueInput.value = meta.sample;
      }
    }
    renderBarcode();
  });

  // Value input
  valueInput.addEventListener('input', renderBarcode);

  // Preset buttons
  presetBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const fmt = btn.dataset.fmt;
      const val = btn.dataset.val;
      formatSelect.value = fmt;
      valueInput.value = val;
      const meta = formatMeta[fmt];
      if (meta) formatHint.textContent = meta.hint;
      renderBarcode();
    });
  });

  // Sliders and controls
  barWidthSlider.addEventListener('input', () => {
    barWidthVal.textContent = `${barWidthSlider.value}px`;
    renderBarcode();
  });

  barHeightSlider.addEventListener('input', () => {
    barHeightVal.textContent = `${barHeightSlider.value}px`;
    renderBarcode();
  });

  displayTextToggle.addEventListener('change', () => {
    textOptionsWrap.style.display = displayTextToggle.checked ? 'grid' : 'none';
    renderBarcode();
  });

  fontSizeSlider.addEventListener('input', () => {
    fontSizeVal.textContent = `${fontSizeSlider.value}px`;
    renderBarcode();
  });

  textMarginSlider.addEventListener('input', () => {
    textMarginVal.textContent = `${textMarginSlider.value}px`;
    renderBarcode();
  });

  lineColorInput.addEventListener('input', () => {
    lineColorHex.textContent = lineColorInput.value;
    renderBarcode();
  });

  bgColorInput.addEventListener('input', () => {
    bgColorHex.textContent = bgColorInput.value;
    renderBarcode();
  });

  // Download SVG
  downloadSvgBtn.addEventListener('click', () => {
    if (!isValidBarcode) return;
    const serializer = new XMLSerializer();
    const svgString = serializer.serializeToString(barcodeSvg);
    const blob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    const safeName = (valueInput.value.trim() || 'barcode').replace(/[^a-z0-9_-]/gi, '_');
    a.href = url;
    a.download = `barcode-${formatSelect.value.toLowerCase()}-${safeName}.svg`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  });

  // Download PNG (via Canvas)
  downloadPngBtn.addEventListener('click', () => {
    if (!isValidBarcode) return;

    const svgString = new XMLSerializer().serializeToString(barcodeSvg);
    const svgBlob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
    const URLObject = window.URL || window.webkitURL || window;
    const blobURL = URLObject.createObjectURL(svgBlob);

    const img = new Image();
    img.onload = () => {
      // High-res retina scale factor
      const scale = 2;
      const width = img.width || barcodeSvg.clientWidth || 300;
      const height = img.height || barcodeSvg.clientHeight || 150;

      exportCanvas.width = width * scale;
      exportCanvas.height = height * scale;

      const ctx = exportCanvas.getContext('2d');
      ctx.imageSmoothingEnabled = false;
      ctx.fillStyle = bgColorInput.value || '#ffffff';
      ctx.fillRect(0, 0, exportCanvas.width, exportCanvas.height);
      ctx.scale(scale, scale);
      ctx.drawImage(img, 0, 0);

      exportCanvas.toBlob((blob) => {
        if (!blob) return;
        const pngUrl = URLObject.createObjectURL(blob);
        const a = document.createElement('a');
        const safeName = (valueInput.value.trim() || 'barcode').replace(/[^a-z0-9_-]/gi, '_');
        a.href = pngUrl;
        a.download = `barcode-${formatSelect.value.toLowerCase()}-${safeName}.png`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URLObject.revokeObjectURL(pngUrl);
      }, 'image/png');

      URLObject.revokeObjectURL(blobURL);
    };

    img.onerror = () => {
      alert('Could not render PNG from SVG.');
      URLObject.revokeObjectURL(blobURL);
    };

    img.src = blobURL;
  });

  // Copy value
  copyValueBtn.addEventListener('click', async () => {
    const val = valueInput.value.trim();
    if (!val) return;
    try {
      await navigator.clipboard.writeText(val);
      const orig = copyValueBtn.textContent;
      copyValueBtn.textContent = 'Copied to Clipboard!';
      copyValueBtn.classList.add('copied');
      setTimeout(() => {
        copyValueBtn.textContent = orig;
        copyValueBtn.classList.remove('copied');
      }, 2000);
    } catch (e) {
      console.error(e);
    }
  });

  // Initial render
  renderBarcode();
});