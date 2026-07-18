document.addEventListener('DOMContentLoaded', () => {
  const dropZone = document.getElementById('drop-zone');
  const fileInput = document.getElementById('file-input');
  const fileInfo = document.getElementById('file-info');
  const fileNameDisplay = document.getElementById('file-name');
  const fileSizeDisplay = document.getElementById('file-size');
  const optionsPanel = document.getElementById('options-panel');
  const actionsPanel = document.getElementById('actions-panel');
  const clearBtn = document.getElementById('clear-btn');
  const saveBtn = document.getElementById('save-btn');
  
  const loadingContainer = document.getElementById('loading-container');
  const loadingFill = document.getElementById('loading-fill');
  const loadingPercent = document.getElementById('loading-percent');
  const loadingText = document.getElementById('loading-text');

  const compLevelSelect = document.getElementById('compression-level');
  const customOptions = document.getElementById('custom-options');
  const customQuality = document.getElementById('custom-quality');
  const customScale = document.getElementById('custom-scale');
  const qualityVal = document.getElementById('quality-val');
  const scaleVal = document.getElementById('scale-val');

  compLevelSelect.addEventListener('change', () => {
    if (compLevelSelect.value === 'custom') {
      customOptions.style.display = 'flex';
    } else {
      customOptions.style.display = 'none';
    }
  });

  customQuality.addEventListener('input', () => {
    qualityVal.textContent = customQuality.value;
  });

  customScale.addEventListener('input', () => {
    scaleVal.textContent = customScale.value;
  });

  let currentFile = null;

  // Handle drag and drop events
  ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
    dropZone.addEventListener(eventName, preventDefaults, false);
  });

  function preventDefaults(e) {
    e.preventDefault();
    e.stopPropagation();
  }

  ['dragenter', 'dragover'].forEach(eventName => {
    dropZone.addEventListener(eventName, () => {
      dropZone.classList.add('drag-over');
    }, false);
  });

  ['dragleave', 'drop'].forEach(eventName => {
    dropZone.addEventListener(eventName, () => {
      dropZone.classList.remove('drag-over');
    }, false);
  });

  dropZone.addEventListener('drop', (e) => {
    const dt = e.dataTransfer;
    const files = dt.files;
    handleFile(files[0]);
  });

  fileInput.addEventListener('change', function() {
    if (this.files.length > 0) {
      handleFile(this.files[0]);
    }
  });

  function handleFile(file) {
    if (file && file.type === 'application/pdf') {
      currentFile = file;
      updateUI();
    } else {
      alert("Please upload a valid PDF file.");
    }
  }

  function updateUI() {
    if (currentFile) {
      dropZone.style.display = 'none';
      fileInfo.style.display = 'flex';
      optionsPanel.style.display = 'block';
      actionsPanel.style.display = 'flex';
      
      fileNameDisplay.textContent = currentFile.name;
      fileSizeDisplay.textContent = (currentFile.size / (1024 * 1024)).toFixed(2) + ' MB';
    } else {
      dropZone.style.display = 'block';
      fileInfo.style.display = 'none';
      optionsPanel.style.display = 'none';
      actionsPanel.style.display = 'none';
      fileInput.value = '';
    }
  }

  clearBtn.addEventListener('click', () => {
    currentFile = null;
    updateUI();
  });

  saveBtn.addEventListener('click', async () => {
    if (!currentFile) return;

    const compLevel = document.getElementById('compression-level').value;
    
    // Configure quality and scale based on compression level
    let quality = 0.7;
    let scale = 1.5;
    
    if (compLevel === 'high') {
      quality = 0.5;
      scale = 1.0;
    } else if (compLevel === 'medium') {
      quality = 0.7;
      scale = 1.5;
    } else if (compLevel === 'low') {
      quality = 0.9;
      scale = 2.0;
    } else if (compLevel === 'custom') {
      quality = parseInt(customQuality.value) / 100;
      scale = parseFloat(customScale.value);
    }

    saveBtn.disabled = true;
    clearBtn.disabled = true;
    loadingContainer.style.display = 'flex';
    optionsPanel.style.opacity = '0.5';

    try {
      const arrayBuffer = await currentFile.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      const numPages = pdf.numPages;

      const { PDFDocument } = PDFLib;
      const newPdfDoc = await PDFDocument.create();

      for (let i = 1; i <= numPages; i++) {
        updateProgress(Math.round(((i - 1) / numPages) * 100), `Compressing page ${i} of ${numPages}...`);
        
        const page = await pdf.getPage(i);
        const viewport = page.getViewport({ scale: scale });
        
        // Render page to canvas
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        canvas.width = viewport.width;
        canvas.height = viewport.height;
        
        await page.render({
          canvasContext: context,
          viewport: viewport
        }).promise;
        
        // Convert canvas to optimized JPEG
        const imgDataUrl = canvas.toDataURL('image/jpeg', quality);
        const base64Data = imgDataUrl.split(',')[1];
        const binaryString = window.atob(base64Data);
        const len = binaryString.length;
        const bytes = new Uint8Array(len);
        for (let j = 0; j < len; j++) {
          bytes[j] = binaryString.charCodeAt(j);
        }
        
        // Embed the JPEG into the new PDF
        const pdfImage = await newPdfDoc.embedJpg(bytes);
        
        // Add a page matching the image dimensions
        const pdfPage = newPdfDoc.addPage([pdfImage.width, pdfImage.height]);
        pdfPage.drawImage(pdfImage, {
          x: 0,
          y: 0,
          width: pdfImage.width,
          height: pdfImage.height
        });
      }

      updateProgress(95, 'Finalizing PDF...');
      
      const pdfBytes = await newPdfDoc.save();
      
      updateProgress(100, 'Done!');
      
      // Compute savings
      const originalSize = currentFile.size;
      const newSize = pdfBytes.length;
      let savings = 0;
      if (newSize < originalSize) {
        savings = Math.round((1 - (newSize / originalSize)) * 100);
      }
      
      if (newSize > originalSize) {
        alert("The original PDF was already highly compressed. The output file size increased because pages were converted to images.");
      } else {
        alert(`Successfully compressed! Saved ~${savings}% of original file size.`);
      }

      // Trigger download
      let newFilename = currentFile.name.replace(/\.pdf$/i, '') + '-compressed.pdf';
      const blob = new Blob([pdfBytes], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = newFilename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
    } catch (error) {
      console.error('Error compressing PDF:', error);
      alert('An error occurred while compressing the PDF.');
    } finally {
      saveBtn.disabled = false;
      clearBtn.disabled = false;
      loadingContainer.style.display = 'none';
      optionsPanel.style.opacity = '1';
      updateProgress(0, 'Compressing PDF...');
    }
  });

  function updateProgress(percent, text) {
    loadingFill.style.width = percent + '%';
    loadingPercent.textContent = percent + '%';
    loadingText.textContent = text;
  }
});