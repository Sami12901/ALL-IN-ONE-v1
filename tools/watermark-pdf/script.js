document.addEventListener('DOMContentLoaded', () => {
  const dropZone = document.getElementById('drop-zone');
  const fileInput = document.getElementById('file-input');
  const fileInfo = document.getElementById('file-info');
  const fileNameDisplay = document.getElementById('file-name');
  const fileSizeDisplay = document.getElementById('file-size');
  const clearBtn = document.getElementById('clear-btn');
  const optionsGrid = document.getElementById('options-grid');
  const actionsPanel = document.getElementById('actions-panel');
  const saveBtn = document.getElementById('save-btn');
  
  const loadingContainer = document.getElementById('loading-container');
  const loadingFill = document.getElementById('loading-fill');
  const loadingText = document.getElementById('loading-text');
  const loadingPercent = document.getElementById('loading-percent');

  // Config elements
  const typeRadios = document.querySelectorAll('input[name="wm-type"]');
  const textConfig = document.getElementById('text-config');
  const imageConfig = document.getElementById('image-config');
  
  const textInput = document.getElementById('wm-text');
  const sizeInput = document.getElementById('wm-size');
  const colorInput = document.getElementById('wm-color');
  
  const imageInput = document.getElementById('image-input');
  const imagePreview = document.getElementById('image-preview');
  const imageScaleInput = document.getElementById('wm-img-scale');

  const posBtns = document.querySelectorAll('.pos-btn');
  const posHidden = document.getElementById('wm-position');
  
  const opacityInput = document.getElementById('wm-opacity');
  const opacityVal = document.getElementById('opacity-val');
  const rotationInput = document.getElementById('wm-rotation');

  let currentFile = null;
  let fileArrayBuffer = null;
  let imageFileBuffer = null;
  let imageMimeType = null;

  // --- UI Interactions ---

  // Drag & Drop for file upload
  ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
    dropZone.addEventListener(eventName, preventDefaults, false);
  });

  function preventDefaults(e) {
    e.preventDefault();
    e.stopPropagation();
  }

  ['dragenter', 'dragover'].forEach(eventName => {
    dropZone.addEventListener(eventName, () => dropZone.classList.add('drag-over'), false);
  });

  ['dragleave', 'drop'].forEach(eventName => {
    dropZone.addEventListener(eventName, () => dropZone.classList.remove('drag-over'), false);
  });

  dropZone.addEventListener('drop', (e) => {
    const dt = e.dataTransfer;
    handleFiles(dt.files);
  });

  fileInput.addEventListener('change', function() {
    handleFiles(this.files);
  });

  async function handleFiles(files) {
    if (files.length === 0) return;
    const file = files[0];
    if (file.type !== 'application/pdf') {
      alert('Please upload a valid PDF file.');
      return;
    }

    currentFile = file;
    fileNameDisplay.textContent = file.name;
    fileSizeDisplay.textContent = formatBytes(file.size);
    
    dropZone.style.display = 'none';
    fileInfo.style.display = 'flex';
    
    try {
      fileArrayBuffer = await file.arrayBuffer();
      optionsGrid.style.display = 'grid';
      actionsPanel.style.display = 'flex';
    } catch (err) {
      console.error(err);
      alert('Error loading PDF file.');
      clearFile();
    }
  }

  clearBtn.addEventListener('click', clearFile);

  function clearFile() {
    currentFile = null;
    fileArrayBuffer = null;
    fileInput.value = '';
    
    dropZone.style.display = 'block';
    fileInfo.style.display = 'none';
    optionsGrid.style.display = 'none';
    actionsPanel.style.display = 'none';
    loadingContainer.style.display = 'none';
  }

  // Type Toggle
  typeRadios.forEach(radio => {
    radio.addEventListener('change', (e) => {
      if (e.target.value === 'text') {
        textConfig.style.display = 'flex';
        imageConfig.style.display = 'none';
      } else {
        textConfig.style.display = 'none';
        imageConfig.style.display = 'flex';
      }
    });
  });

  // Image Upload
  imageInput.addEventListener('change', function() {
    if (this.files.length === 0) return;
    const file = this.files[0];
    if (!file.type.startsWith('image/')) {
      alert('Please upload a valid image file (PNG/JPG).');
      return;
    }

    imageMimeType = file.type;
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = document.createElement('img');
      img.src = e.target.result;
      imagePreview.innerHTML = '';
      imagePreview.appendChild(img);
    };
    reader.readAsDataURL(file);

    file.arrayBuffer().then(buf => {
      imageFileBuffer = buf;
    });
  });

  // Opacity Slider
  opacityInput.addEventListener('input', (e) => {
    opacityVal.textContent = `${e.target.value}%`;
  });

  // Position Buttons
  posBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      posBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      posHidden.value = btn.dataset.pos;
    });
  });

  // --- Save Logic ---

  saveBtn.addEventListener('click', async () => {
    if (!fileArrayBuffer) return;

    const type = document.querySelector('input[name="wm-type"]:checked').value;
    if (type === 'image' && !imageFileBuffer) {
      alert('Please upload an image for the watermark.');
      return;
    }

    saveBtn.disabled = true;
    loadingContainer.style.display = 'flex';
    updateLoading(10, 'Loading PDF...');

    try {
      const pdfDoc = await PDFLib.PDFDocument.load(fileArrayBuffer);
      const pages = pdfDoc.getPages();
      const totalPages = pages.length;

      const opacity = parseInt(opacityInput.value, 10) / 100;
      const rotationDeg = parseInt(rotationInput.value, 10) || 0;
      const position = posHidden.value;
      const rotationAngle = PDFLib.degrees(rotationDeg);

      let wmImage = null;
      let font = null;
      let textSettings = {};

      if (type === 'text') {
        font = await pdfDoc.embedFont(PDFLib.StandardFonts.HelveticaBold);
        const hex = colorInput.value.replace('#', '');
        const r = parseInt(hex.substring(0, 2), 16) / 255;
        const g = parseInt(hex.substring(2, 4), 16) / 255;
        const b = parseInt(hex.substring(4, 6), 16) / 255;
        
        textSettings = {
          text: textInput.value || 'WATERMARK',
          size: parseInt(sizeInput.value, 10) || 48,
          color: PDFLib.rgb(r, g, b),
          opacity: opacity,
          rotate: rotationAngle
        };
      } else {
        if (imageMimeType === 'image/png') {
          wmImage = await pdfDoc.embedPng(imageFileBuffer);
        } else {
          wmImage = await pdfDoc.embedJpg(imageFileBuffer);
        }
      }

      for (let i = 0; i < totalPages; i++) {
        updateLoading(10 + Math.floor((i / totalPages) * 70), `Processing page ${i + 1} of ${totalPages}...`);
        
        const page = pages[i];
        const { width, height } = page.getSize();
        
        let objWidth, objHeight;
        
        if (type === 'text') {
          objWidth = font.widthOfTextAtSize(textSettings.text, textSettings.size);
          objHeight = font.heightAtSize(textSettings.size);
        } else {
          const scale = (parseInt(imageScaleInput.value, 10) || 50) / 100;
          const dims = wmImage.scale(scale);
          objWidth = dims.width;
          objHeight = dims.height;
        }

        // Calculate coordinates based on position
        let x = 0, y = 0;

        // When rotated, bounding box changes. For simplicity, we center the origin of drawing.
        // We'll draw from the center of the object to easily apply rotation.
        let centerX = width / 2;
        let centerY = height / 2;

        if (position.includes('left')) centerX = objWidth / 2 + 20;
        if (position.includes('right')) centerX = width - (objWidth / 2) - 20;
        
        if (position.includes('top')) centerY = height - (objHeight / 2) - 20;
        if (position.includes('bottom')) centerY = (objHeight / 2) + 20;

        if (type === 'text') {
          page.drawText(textSettings.text, {
            x: centerX - (objWidth / 2),
            y: centerY - (objHeight / 2),
            size: textSettings.size,
            font: font,
            color: textSettings.color,
            opacity: textSettings.opacity,
            rotate: textSettings.rotate
          });
        } else {
          const scale = (parseInt(imageScaleInput.value, 10) || 50) / 100;
          const dims = wmImage.scale(scale);
          
          page.drawImage(wmImage, {
            x: centerX - (dims.width / 2),
            y: centerY - (dims.height / 2),
            width: dims.width,
            height: dims.height,
            opacity: opacity,
            rotate: rotationAngle
          });
        }
      }

      updateLoading(90, 'Saving PDF...');
      const pdfBytes = await pdfDoc.save();
      
      updateLoading(100, 'Done!');
      downloadFile(pdfBytes, `watermarked_${currentFile.name}`, 'application/pdf');

    } catch (err) {
      console.error(err);
      alert('An error occurred while applying the watermark.');
    }

    setTimeout(() => {
      loadingContainer.style.display = 'none';
      saveBtn.disabled = false;
    }, 1500);
  });

  // --- Utils ---

  function updateLoading(percent, text) {
    loadingPercent.textContent = `${percent}%`;
    loadingFill.style.width = `${percent}%`;
    loadingText.textContent = text;
  }

  function formatBytes(bytes, decimals = 2) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
  }

  function downloadFile(data, filename, type) {
    const blob = data instanceof Blob ? data : new Blob([data], { type });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

});
