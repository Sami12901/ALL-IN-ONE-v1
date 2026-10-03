// QR Code Reader Client-side Logic
document.addEventListener('DOMContentLoaded', () => {
  // Mode Tabs
  const tabFileMode = document.getElementById('tab-file-mode');
  const tabCameraMode = document.getElementById('tab-camera-mode');
  const fileScannerView = document.getElementById('file-scanner-view');
  const cameraScannerView = document.getElementById('camera-scanner-view');

  // File Upload Elements
  const fileDropzone = document.getElementById('file-dropzone');
  const fileInput = document.getElementById('file-input');
  const browseFileBtn = document.getElementById('browse-file-btn');

  // Camera Elements
  const cameraVideo = document.getElementById('camera-video');
  const toggleCameraBtn = document.getElementById('toggle-camera-btn');
  const switchCameraBtn = document.getElementById('switch-camera-btn');
  const cameraStatus = document.getElementById('camera-status');

  // Results & Errors
  const scannerError = document.getElementById('scanner-error');
  const resultEmptyState = document.getElementById('result-empty-state');
  const resultCard = document.getElementById('result-card');
  const resultTypeBadge = document.getElementById('result-type-badge');
  const resultTimestamp = document.getElementById('result-timestamp');
  const resultThumb = document.getElementById('result-thumb');
  const resultContent = document.getElementById('result-content');
  const copyResultBtn = document.getElementById('copy-result-btn');
  const openLinkBtn = document.getElementById('open-link-btn');
  const clearResultBtn = document.getElementById('clear-result-btn');

  // Canvas
  const qrScanCanvas = document.getElementById('qr-scan-canvas');
  const ctx = qrScanCanvas.getContext('2d', { willReadFrequently: true });

  // Camera State
  let cameraStream = null;
  let isScanningCamera = false;
  let currentFacingMode = 'environment';
  let animationFrameId = null;

  // Sound feedback
  function playSuccessBeep() {
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;
      const audioCtx = new AudioCtx();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(880, audioCtx.currentTime); // 880 Hz (A5)
      gain.gain.setValueAtTime(0.12, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.18);

      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.18);
    } catch (e) {
      // Audio autoplay policy or unavailable
    }
  }

  // Determine QR Code Data Type
  function detectContentType(text) {
    const trimmed = text.trim();
    if (/^https?:\/\//i.test(trimmed)) return 'URL';
    if (/^mailto:/i.test(trimmed) || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) return 'Email';
    if (/^(tel|telprompt):/i.test(trimmed) || /^\+?[0-9\s\-()]{7,}$/.test(trimmed)) return 'Phone';
    if (/^WIFI:/i.test(trimmed)) return 'Wi-Fi Config';
    if (/^(sms|smsto):/i.test(trimmed)) return 'SMS';
    if (/^geo:/i.test(trimmed)) return 'Geo Location';
    if (/^BEGIN:VCARD/i.test(trimmed)) return 'vCard Contact';
    return 'Text';
  }

  // Display Decoded Result
  function displayResult(decodedText, imageSourceUrl = null) {
    hideError();
    playSuccessBeep();

    resultEmptyState.style.display = 'none';
    resultCard.style.display = 'flex';

    const type = detectContentType(decodedText);
    resultTypeBadge.textContent = type;
    resultTimestamp.textContent = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    resultContent.textContent = decodedText;

    if (imageSourceUrl) {
      resultThumb.src = imageSourceUrl;
      resultThumb.style.display = 'block';
    } else {
      resultThumb.style.display = 'none';
    }

    // Configure Open Link Button
    if (type === 'URL') {
      openLinkBtn.href = decodedText.trim();
      openLinkBtn.style.display = 'inline-flex';
    } else if (type === 'Email') {
      const email = decodedText.replace(/^mailto:/i, '').trim();
      openLinkBtn.href = `mailto:${email}`;
      openLinkBtn.style.display = 'inline-flex';
    } else {
      openLinkBtn.style.display = 'none';
    }
  }

  function showError(msg) {
    scannerError.textContent = msg;
    scannerError.style.display = 'block';
  }

  function hideError() {
    scannerError.style.display = 'none';
  }

  function clearResult() {
    hideError();
    resultCard.style.display = 'none';
    resultEmptyState.style.display = 'flex';
    resultThumb.src = '';
    resultContent.textContent = '';
    fileInput.value = '';
  }

  // Core Decoder (uses BarcodeDetector if available, plus jsQR as universal engine)
  async function decodeImageElement(imageElement) {
    const width = imageElement.naturalWidth || imageElement.videoWidth || imageElement.width;
    const height = imageElement.naturalHeight || imageElement.videoHeight || imageElement.height;

    if (!width || !height) return null;

    // 1. Hardware accelerated native BarcodeDetector API (if available)
    if ('BarcodeDetector' in window) {
      try {
        const detector = new window.BarcodeDetector({ formats: ['qr_code'] });
        const barcodes = await detector.detect(imageElement);
        if (barcodes && barcodes.length > 0 && barcodes[0].rawValue) {
          return barcodes[0].rawValue;
        }
      } catch (err) {
        // Fallback to jsQR canvas inspection
      }
    }

    // 2. Canvas pixel inspection via jsQR
    // Downscale if image is huge to maintain optimal performance and memory
    const maxDim = 1200;
    let targetW = width;
    let targetH = height;
    if (targetW > maxDim || targetH > maxDim) {
      const scale = Math.min(maxDim / targetW, maxDim / targetH);
      targetW = Math.round(targetW * scale);
      targetH = Math.round(targetH * scale);
    }

    qrScanCanvas.width = targetW;
    qrScanCanvas.height = targetH;
    ctx.drawImage(imageElement, 0, 0, targetW, targetH);

    const imgData = ctx.getImageData(0, 0, targetW, targetH);

    if (typeof window.jsQR === 'function') {
      // First attempt standard
      let qrCode = window.jsQR(imgData.data, imgData.width, imgData.height, {
        inversionAttempts: 'dontInvert'
      });

      // Second attempt with inversion if needed (light on dark QR codes)
      if (!qrCode) {
        qrCode = window.jsQR(imgData.data, imgData.width, imgData.height, {
          inversionAttempts: 'onlyInvert'
        });
      }

      if (qrCode && qrCode.data) {
        return qrCode.data;
      }
    }

    return null;
  }

  // Process File Object
  function processImageFile(file) {
    if (!file || !file.type.startsWith('image/')) {
      showError('Please select a valid image file (PNG, JPG, WebP, etc.).');
      return;
    }

    hideError();
    const reader = new FileReader();

    reader.onload = (e) => {
      const imgDataUrl = e.target.result;
      const img = new Image();

      img.onload = async () => {
        try {
          const result = await decodeImageElement(img);
          if (result) {
            displayResult(result, imgDataUrl);
          } else {
            showError('No QR code detected in this image. Please ensure the QR code is clear, well-lit, and unblurred.');
          }
        } catch (err) {
          console.error('Decode error:', err);
          showError('Failed to decode the image. Please try another file.');
        }
      };

      img.onerror = () => {
        showError('Could not load the image file.');
      };

      img.src = imgDataUrl;
    };

    reader.onerror = () => {
      showError('Failed reading the file.');
    };

    reader.readAsDataURL(file);
  }

  // Drag & Drop Listeners
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
    if (e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processImageFile(e.dataTransfer.files[0]);
    }
  });

  browseFileBtn.addEventListener('click', () => {
    fileInput.click();
  });

  fileInput.addEventListener('change', () => {
    if (fileInput.files && fileInput.files.length > 0) {
      processImageFile(fileInput.files[0]);
    }
  });

  // Clipboard Paste Support (Ctrl+V)
  window.addEventListener('paste', (e) => {
    if (!e.clipboardData || !e.clipboardData.items) return;
    const items = e.clipboardData.items;
    for (let i = 0; i < items.length; i++) {
      if (items[i].type.startsWith('image/')) {
        const file = items[i].getAsFile();
        if (file) {
          // Switch to file mode if in camera mode
          switchMode('file');
          processImageFile(file);
          break;
        }
      }
    }
  });

  // Camera Live Scanner
  async function startCamera() {
    stopCamera();
    hideError();
    cameraStatus.textContent = 'Requesting camera permissions...';

    const constraints = {
      video: {
        facingMode: currentFacingMode,
        width: { ideal: 1280 },
        height: { ideal: 720 }
      },
      audio: false
    };

    try {
      cameraStream = await navigator.mediaDevices.getUserMedia(constraints);
      cameraVideo.srcObject = cameraStream;
      await cameraVideo.play();

      isScanningCamera = true;
      toggleCameraBtn.textContent = 'Stop Camera';
      toggleCameraBtn.classList.remove('btn-primary');
      toggleCameraBtn.classList.add('btn-secondary');
      switchCameraBtn.style.display = 'inline-flex';
      cameraStatus.textContent = 'Scanning live video stream...';

      scanCameraFrame();
    } catch (err) {
      console.warn('Camera error:', err);
      cameraStatus.textContent = 'Camera access was denied or is not supported by your browser.';
      showError('Could not access camera. Please allow camera permissions or upload an image file.');
      stopCamera();
    }
  }

  function stopCamera() {
    if (animationFrameId) {
      cancelAnimationFrame(animationFrameId);
      animationFrameId = null;
    }
    isScanningCamera = false;
    if (cameraStream) {
      cameraStream.getTracks().forEach(track => track.stop());
      cameraStream = null;
    }
    cameraVideo.srcObject = null;
    toggleCameraBtn.textContent = 'Start Camera';
    toggleCameraBtn.classList.remove('btn-secondary');
    toggleCameraBtn.classList.add('btn-primary');
    switchCameraBtn.style.display = 'none';
    cameraStatus.textContent = 'Camera is currently stopped.';
  }

  async function scanCameraFrame() {
    if (!isScanningCamera) return;

    if (cameraVideo.readyState === cameraVideo.HAVE_ENOUGH_DATA) {
      try {
        const result = await decodeImageElement(cameraVideo);
        if (result) {
          displayResult(result);
          cameraStatus.textContent = 'QR Code detected!';
          // Pause camera upon detection to preserve power and let user view result
          stopCamera();
          return;
        }
      } catch (e) {
        // Continue scanning next frame
      }
    }

    animationFrameId = requestAnimationFrame(scanCameraFrame);
  }

  toggleCameraBtn.addEventListener('click', () => {
    if (isScanningCamera) {
      stopCamera();
    } else {
      startCamera();
    }
  });

  switchCameraBtn.addEventListener('click', () => {
    currentFacingMode = currentFacingMode === 'environment' ? 'user' : 'environment';
    startCamera();
  });

  // Mode switching tabs
  function switchMode(mode) {
    if (mode === 'file') {
      tabFileMode.classList.add('active');
      tabCameraMode.classList.remove('active');
      fileScannerView.style.display = 'block';
      cameraScannerView.style.display = 'none';
      stopCamera();
    } else {
      tabCameraMode.classList.add('active');
      tabFileMode.classList.remove('active');
      cameraScannerView.style.display = 'flex';
      fileScannerView.style.display = 'none';
      startCamera();
    }
  }

  tabFileMode.addEventListener('click', () => switchMode('file'));
  tabCameraMode.addEventListener('click', () => switchMode('camera'));

  // Action Buttons
  copyResultBtn.addEventListener('click', async () => {
    const text = resultContent.textContent.trim();
    if (!text) return;
    try {
      await navigator.clipboard.writeText(text);
      const orig = copyResultBtn.innerHTML;
      copyResultBtn.textContent = 'Copied to Clipboard!';
      copyResultBtn.classList.add('copied');
      setTimeout(() => {
        copyResultBtn.innerHTML = orig;
        copyResultBtn.classList.remove('copied');
      }, 2000);
    } catch (e) {
      console.error(e);
    }
  });

  clearResultBtn.addEventListener('click', clearResult);
});