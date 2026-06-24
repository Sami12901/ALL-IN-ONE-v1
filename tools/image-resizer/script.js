document.addEventListener('DOMContentLoaded', () => {
  // --- UI Elements ---
  const dropZone = document.getElementById('drop-zone');
  const fileInput = document.getElementById('file-input');
  
  const controlsSection = document.getElementById('controls-section');
  const origDims = document.getElementById('orig-dims');
  const origWeight = document.getElementById('orig-weight');
  
  const inputWidth = document.getElementById('input-width');
  const inputHeight = document.getElementById('input-height');
  const lockRatio = document.getElementById('lock-ratio');
  const presetBtns = document.querySelectorAll('.irc-preset-btn');
  
  const selectFormat = document.getElementById('select-format');
  const qualityGroup = document.getElementById('quality-group');
  const inputQuality = document.getElementById('input-quality');
  const valQuality = document.getElementById('val-quality');
  
  const btnProcess = document.getElementById('btn-process');
  const btnReset = document.getElementById('btn-reset');
  
  const previewContainer = document.getElementById('preview-container');
  const previewPlaceholder = document.getElementById('preview-placeholder');
  const previewImg = document.getElementById('preview-img');
  const canvas = document.getElementById('image-canvas');
  const ctx = canvas.getContext('2d');
  
  const resultSection = document.getElementById('result-section');
  const resDims = document.getElementById('res-dims');
  const resWeight = document.getElementById('res-weight');
  const resSavings = document.getElementById('res-savings');
  const btnDownload = document.getElementById('btn-download');

  // --- State ---
  let originalImage = null;
  let originalFile = null;
  let aspectRatio = 1;
  let currentOutputDataUrl = null;

  // --- Initialize ---
  init();

  function init() {
    setupDropZone();
    
    inputQuality.addEventListener('input', () => {
      valQuality.textContent = inputQuality.value + '%';
    });

    selectFormat.addEventListener('change', () => {
      // PNG is lossless, so hide quality slider
      if (selectFormat.value === 'png') {
        qualityGroup.style.display = 'none';
      } else {
        qualityGroup.style.display = 'block';
      }
    });

    // Aspect Ratio Lock Logic
    inputWidth.addEventListener('input', () => {
      if (lockRatio.checked && originalImage) {
        inputHeight.value = Math.round(parseInt(inputWidth.value) / aspectRatio) || '';
      }
      clearPresets();
    });

    inputHeight.addEventListener('input', () => {
      if (lockRatio.checked && originalImage) {
        inputWidth.value = Math.round(parseInt(inputHeight.value) * aspectRatio) || '';
      }
      clearPresets();
    });

    // Presets
    presetBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        clearPresets();
        btn.classList.add('active');
        
        if (btn.dataset.scale && originalImage) {
          const scale = parseFloat(btn.dataset.scale);
          inputWidth.value = Math.round(originalImage.width * scale);
          inputHeight.value = Math.round(originalImage.height * scale);
        } else if (btn.dataset.w && btn.dataset.h) {
          inputWidth.value = btn.dataset.w;
          inputHeight.value = btn.dataset.h;
        }
      });
    });

    btnProcess.addEventListener('click', processImage);
    btnReset.addEventListener('click', resetTool);
    
    btnDownload.addEventListener('click', downloadImage);
  }

  // --- File Upload ---
  function setupDropZone() {
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
      if (e.dataTransfer.files[0]) handleFile(e.dataTransfer.files[0]);
    });

    fileInput.addEventListener('change', () => {
      if (fileInput.files[0]) handleFile(fileInput.files[0]);
    });
  }

  function handleFile(file) {
    if (file.type && !file.type.startsWith('image/')) {
      alert('Please upload a valid image file.');
      return;
    }

    originalFile = file;
    const reader = new FileReader();
    
    reader.onload = e => {
      const img = new Image();
      img.onload = () => {
        originalImage = img;
        aspectRatio = img.width / img.height;
        
        // Update UI
        dropZone.style.display = 'none';
        controlsSection.style.display = 'block';
        
        origDims.textContent = `${img.width} × ${img.height} px`;
        origWeight.textContent = formatBytes(file.size);
        
        inputWidth.value = img.width;
        inputHeight.value = img.height;
        
        // Show initial preview
        previewPlaceholder.style.display = 'none';
        previewImg.src = img.src;
        previewImg.style.display = 'block';
        
        // Suggest WebP
        selectFormat.value = 'webp';
        inputQuality.value = 80;
        valQuality.textContent = '80%';
        qualityGroup.style.display = 'block';
        
        resultSection.style.display = 'none';
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  }

  // --- Processing ---
  function processImage() {
    if (!originalImage) return;

    const w = parseInt(inputWidth.value);
    const h = parseInt(inputHeight.value);
    if (!w || !h || w < 1 || h < 1) {
      alert('Please enter valid dimensions.');
      return;
    }

    // Set canvas to target dimensions
    canvas.width = w;
    canvas.height = h;

    // Draw image onto canvas
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
    
    // If saving as JPG, fill background with white first (in case original had transparency)
    const format = selectFormat.value;
    if (format === 'jpeg') {
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, w, h);
    }
    
    ctx.drawImage(originalImage, 0, 0, w, h);

    // Export based on settings
    const mimeType = `image/${format}`;
    const quality = format === 'png' ? undefined : parseInt(inputQuality.value) / 100;
    
    currentOutputDataUrl = canvas.toDataURL(mimeType, quality);
    
    // Calculate new size
    // DataURL format: data:image/jpeg;base64,...
    const base64str = currentOutputDataUrl.split(',')[1];
    const decodedLength = atob(base64str).length;
    
    // Update Preview
    previewImg.src = currentOutputDataUrl;
    
    // Show Results
    resultSection.style.display = 'block';
    resDims.textContent = `${w} × ${h} px`;
    resWeight.textContent = formatBytes(decodedLength);
    
    // Savings calculation
    const diff = originalFile.size - decodedLength;
    if (diff > 0) {
      const pct = Math.round((diff / originalFile.size) * 100);
      resSavings.textContent = `Saved ${pct}% (${formatBytes(diff)})`;
      resSavings.style.background = 'var(--success)';
    } else if (diff < 0) {
      const pct = Math.round((Math.abs(diff) / originalFile.size) * 100);
      resSavings.textContent = `${pct}% Larger (${formatBytes(Math.abs(diff))})`;
      resSavings.style.background = 'var(--error)';
    } else {
      resSavings.textContent = `Same Size`;
      resSavings.style.background = 'var(--text-tertiary)';
    }
  }

  // --- Download ---
  function downloadImage() {
    if (!currentOutputDataUrl) return;
    
    const format = selectFormat.value;
    const ext = format === 'jpeg' ? 'jpg' : format;
    
    const originalName = originalFile.name.split('.')[0];
    const filename = `${originalName}-compressed.${ext}`;
    
    const link = document.createElement('a');
    link.download = filename;
    link.href = currentOutputDataUrl;
    link.click();
  }

  // --- Utils ---
  function resetTool() {
    originalImage = null;
    originalFile = null;
    currentOutputDataUrl = null;
    
    dropZone.style.display = 'flex';
    controlsSection.style.display = 'none';
    resultSection.style.display = 'none';
    
    previewImg.style.display = 'none';
    previewImg.src = '';
    previewPlaceholder.style.display = 'flex';
    
    fileInput.value = '';
    clearPresets();
  }

  function clearPresets() {
    presetBtns.forEach(b => b.classList.remove('active'));
  }

  function formatBytes(bytes) {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  }
});