document.addEventListener('DOMContentLoaded', () => {
  const dropZone = document.getElementById('drop-zone');
  const fileInput = document.getElementById('file-input');
  const imagesGrid = document.getElementById('images-grid');
  const optionsPanel = document.getElementById('options-panel');
  const actionsPanel = document.getElementById('actions-panel');
  const clearBtn = document.getElementById('clear-btn');
  const saveBtn = document.getElementById('save-btn');
  
  const loadingContainer = document.getElementById('loading-container');
  const loadingFill = document.getElementById('loading-fill');
  const loadingPercent = document.getElementById('loading-percent');
  const loadingText = document.getElementById('loading-text');

  let imageFiles = [];

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
    handleFiles(files);
  });

  fileInput.addEventListener('change', function() {
    handleFiles(this.files);
    // Reset input so the same files can be selected again if needed
    this.value = '';
  });

  function handleFiles(files) {
    const validImageTypes = ['image/jpeg', 'image/png', 'image/webp'];
    let added = false;
    
    Array.from(files).forEach(file => {
      if (validImageTypes.includes(file.type)) {
        imageFiles.push(file);
        added = true;
      }
    });

    if (added) {
      updateUI();
    } else {
      alert("Please upload valid image files (JPG, PNG, WEBP).");
    }
  }

  function updateUI() {
    imagesGrid.innerHTML = '';
    
    if (imageFiles.length > 0) {
      optionsPanel.style.display = 'block';
      actionsPanel.style.display = 'flex';
      dropZone.style.padding = '1.5rem';
      
      imageFiles.forEach((file, index) => {
        const reader = new FileReader();
        reader.onload = (e) => {
          const card = document.createElement('div');
          card.className = 'image-card';
          card.innerHTML = `
            <img src="${e.target.result}" alt="Uploaded image ${index + 1}">
            <button class="remove-btn" data-index="${index}" title="Remove image">×</button>
          `;
          imagesGrid.appendChild(card);
        };
        reader.readAsDataURL(file);
      });
    } else {
      optionsPanel.style.display = 'none';
      actionsPanel.style.display = 'none';
      dropZone.style.padding = '3rem 1.5rem';
    }
  }

  // Use event delegation for remove buttons
  imagesGrid.addEventListener('click', (e) => {
    if (e.target.classList.contains('remove-btn')) {
      const index = parseInt(e.target.getAttribute('data-index'));
      imageFiles.splice(index, 1);
      updateUI();
    }
  });

  clearBtn.addEventListener('click', () => {
    imageFiles = [];
    updateUI();
  });

  saveBtn.addEventListener('click', async () => {
    if (imageFiles.length === 0) return;

    const orientation = document.getElementById('page-orientation').value;
    const margin = parseInt(document.getElementById('page-margin').value);

    saveBtn.disabled = true;
    clearBtn.disabled = true;
    loadingContainer.style.display = 'flex';
    optionsPanel.style.opacity = '0.5';
    imagesGrid.style.opacity = '0.5';

    try {
      // Create a new PDFDocument
      const { PDFDocument } = PDFLib;
      const pdfDoc = await PDFDocument.create();

      for (let i = 0; i < imageFiles.length; i++) {
        updateProgress(Math.round(((i) / imageFiles.length) * 100), `Processing image ${i + 1} of ${imageFiles.length}...`);
        
        const file = imageFiles[i];
        const arrayBuffer = await file.arrayBuffer();
        
        let pdfImage;
        if (file.type === 'image/jpeg') {
          pdfImage = await pdfDoc.embedJpg(arrayBuffer);
        } else if (file.type === 'image/png') {
          pdfImage = await pdfDoc.embedPng(arrayBuffer);
        } else if (file.type === 'image/webp') {
          // pdf-lib doesn't natively support webp well sometimes, but let's try.
          // In actual implementations we might need to convert it to png/jpg first via canvas,
          // but for now let's hope it works or we use canvas fallback.
          pdfImage = await embedWebPWithCanvasFallback(pdfDoc, file);
        }

        const imgDims = pdfImage.scale(1);
        
        let pageWidth = imgDims.width + margin * 2;
        let pageHeight = imgDims.height + margin * 2;
        
        if (orientation === 'portrait') {
          // Fixed A4 portrait (595.28 x 841.89)
          pageWidth = 595.28;
          pageHeight = 841.89;
        } else if (orientation === 'landscape') {
          // Fixed A4 landscape
          pageWidth = 841.89;
          pageHeight = 595.28;
        }

        const page = pdfDoc.addPage([pageWidth, pageHeight]);
        
        // Calculate dimensions to fit image in page if A4 is selected
        let finalWidth = imgDims.width;
        let finalHeight = imgDims.height;
        
        if (orientation !== 'auto') {
          const availWidth = pageWidth - margin * 2;
          const availHeight = pageHeight - margin * 2;
          
          const scale = Math.min(availWidth / imgDims.width, availHeight / imgDims.height);
          
          if (scale < 1 || orientation !== 'auto') {
            finalWidth = imgDims.width * scale;
            finalHeight = imgDims.height * scale;
          }
        }
        
        // Center image
        const x = (pageWidth - finalWidth) / 2;
        const y = (pageHeight - finalHeight) / 2;

        page.drawImage(pdfImage, {
          x: x,
          y: y,
          width: finalWidth,
          height: finalHeight,
        });
      }

      updateProgress(90, 'Finalizing PDF...');
      
      const pdfBytes = await pdfDoc.save();
      
      updateProgress(100, 'Done!');
      
      // Trigger download
      const blob = new Blob([pdfBytes], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'converted_images.pdf';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('An error occurred while generating the PDF.');
    } finally {
      saveBtn.disabled = false;
      clearBtn.disabled = false;
      loadingContainer.style.display = 'none';
      optionsPanel.style.opacity = '1';
      imagesGrid.style.opacity = '1';
      updateProgress(0, 'Generating PDF...');
    }
  });

  function updateProgress(percent, text) {
    loadingFill.style.width = percent + '%';
    loadingPercent.textContent = percent + '%';
    loadingText.textContent = text;
  }
  
  // Helper for webp via canvas
  async function embedWebPWithCanvasFallback(pdfDoc, file) {
    return new Promise((resolve, reject) => {
      const url = URL.createObjectURL(file);
      const img = new Image();
      img.onload = async () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0);
        // Convert to PNG data URL
        const pngDataUrl = canvas.toDataURL('image/png');
        URL.revokeObjectURL(url);
        
        // Convert data URL to Uint8Array
        const base64Data = pngDataUrl.split(',')[1];
        const binaryString = window.atob(base64Data);
        const len = binaryString.length;
        const bytes = new Uint8Array(len);
        for (let i = 0; i < len; i++) {
          bytes[i] = binaryString.charCodeAt(i);
        }
        
        try {
          const pdfImg = await pdfDoc.embedPng(bytes);
          resolve(pdfImg);
        } catch (e) {
          reject(e);
        }
      };
      img.onerror = reject;
      img.src = url;
    });
  }
});