document.addEventListener('DOMContentLoaded', () => {
  const dropZone = document.getElementById('drop-zone');
  const fileInput = document.getElementById('file-input');
  const fileInfo = document.getElementById('file-info');
  const fileNameDisplay = document.getElementById('file-name');
  const fileSizeDisplay = document.getElementById('file-size');
  const clearBtn = document.getElementById('clear-btn');
  const optionsPanel = document.getElementById('options-panel');
  const actionsPanel = document.getElementById('actions-panel');
  const saveBtn = document.getElementById('save-btn');
  
  const imgFormatSelect = document.getElementById('img-format');
  const imgQualitySelect = document.getElementById('img-quality');

  const loadingContainer = document.getElementById('loading-container');
  const loadingFill = document.getElementById('loading-fill');
  const loadingText = document.getElementById('loading-text');
  const loadingPercent = document.getElementById('loading-percent');

  let currentFile = null;
  let fileArrayBuffer = null;

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
      optionsPanel.style.display = 'block';
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
    optionsPanel.style.display = 'none';
    actionsPanel.style.display = 'none';
    loadingContainer.style.display = 'none';
  }

  // --- Save Logic ---

  saveBtn.addEventListener('click', async () => {
    if (!fileArrayBuffer) return;

    saveBtn.disabled = true;
    loadingContainer.style.display = 'flex';
    updateLoading(5, 'Parsing PDF Document...');

    try {
      const format = imgFormatSelect.value; // 'image/jpeg', 'image/png', 'image/webp'
      const ext = format.split('/')[1].replace('jpeg', 'jpg');
      const quality = parseFloat(imgQualitySelect.value);

      const loadingTask = pdfjsLib.getDocument({ data: fileArrayBuffer });
      const pdf = await loadingTask.promise;
      const totalPages = pdf.numPages;

      const zip = new JSZip();

      for (let i = 1; i <= totalPages; i++) {
        updateLoading(10 + Math.floor((i / totalPages) * 75), `Converting page ${i} of ${totalPages}...`);
        
        const page = await pdf.getPage(i);
        const viewport = page.getViewport({ scale: 2.0 }); // High scale for better quality
        
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        canvas.width = viewport.width;
        canvas.height = viewport.height;

        // Render PDF page into canvas context
        await page.render({ canvasContext: ctx, viewport: viewport }).promise;

        // Convert canvas to blob
        const blob = await new Promise(resolve => {
          canvas.toBlob(resolve, format, quality);
        });

        // Add to zip
        let outName = `page_${i}.${ext}`;
        zip.file(outName, blob);
      }

      updateLoading(90, 'Generating ZIP file...');
      const zipBlob = await zip.generateAsync({ type: 'blob' });
      
      updateLoading(100, 'Done!');
      const baseName = currentFile.name.replace('.pdf', '');
      downloadFile(zipBlob, `images_${baseName}.zip`, 'application/zip');

    } catch (err) {
      console.error(err);
      alert('An error occurred during conversion. Ensure the PDF is valid.');
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
