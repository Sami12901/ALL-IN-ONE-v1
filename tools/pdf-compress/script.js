document.addEventListener('DOMContentLoaded', () => {
  const dropZone = document.getElementById('drop-zone');
  const fileInput = document.getElementById('file-input');
  const fileInfo = document.getElementById('file-info');
  const fileNameDisplay = document.getElementById('file-name');
  const fileSizeDisplay = document.getElementById('file-size');
  const clearBtn = document.getElementById('clear-btn');
  
  const optionsPanel = document.getElementById('options-panel');
  const actionsPanel = document.getElementById('actions-panel');
  const compressBtn = document.getElementById('compress-btn');
  
  const loadingContainer = document.getElementById('loading-container');
  const loadingFill = document.getElementById('loading-fill');
  const loadingText = document.getElementById('loading-text');
  const loadingPercent = document.getElementById('loading-percent');

  const resultPanel = document.getElementById('result-panel');
  const newSizeDisplay = document.getElementById('new-size-display');
  const savingsDisplay = document.getElementById('savings-display');
  const downloadBtn = document.getElementById('download-btn');

  let currentFile = null;
  let fileArrayBuffer = null;
  let compressedBytes = null;

  // --- UI Interactions ---

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
    compressedBytes = null;
    fileInput.value = '';
    
    dropZone.style.display = 'block';
    fileInfo.style.display = 'none';
    optionsPanel.style.display = 'none';
    actionsPanel.style.display = 'none';
    loadingContainer.style.display = 'none';
    resultPanel.style.display = 'none';
  }

  // --- Compress Logic ---

  compressBtn.addEventListener('click', async () => {
    if (!fileArrayBuffer) return;

    compressBtn.disabled = true;
    optionsPanel.style.display = 'none';
    actionsPanel.style.display = 'none';
    loadingContainer.style.display = 'flex';
    
    updateLoading(20, 'Analyzing PDF Structure...');

    try {
      const level = document.querySelector('input[name="compression"]:checked').value;
      
      updateLoading(40, 'Rebuilding PDF Streams...');
      
      // Basic compression through pdf-lib serialization and metadata stripping
      const pdfDoc = await PDFLib.PDFDocument.load(fileArrayBuffer, { ignoreEncryption: true });
      
      updateLoading(60, 'Optimizing Objects...');
      
      if (level === 'high' || level === 'medium') {
        // Strip metadata to save space
        pdfDoc.setTitle('');
        pdfDoc.setAuthor('');
        pdfDoc.setSubject('');
        pdfDoc.setKeywords([]);
        pdfDoc.setProducer('');
        pdfDoc.setCreator('');
      }

      updateLoading(80, 'Saving Optimized PDF...');
      
      // useObjectStreams: true is key for pdf-lib to compress output
      compressedBytes = await pdfDoc.save({ useObjectStreams: true });
      
      updateLoading(100, 'Done!');

      setTimeout(() => {
        showResults(currentFile.size, compressedBytes.length);
      }, 500);

    } catch (err) {
      console.error(err);
      alert('An error occurred while compressing the PDF.');
      clearFile();
    }
  });

  function showResults(oldSize, newSize) {
    loadingContainer.style.display = 'none';
    resultPanel.style.display = 'block';

    newSizeDisplay.textContent = formatBytes(newSize);
    
    if (newSize < oldSize) {
      const savings = (((oldSize - newSize) / oldSize) * 100).toFixed(1);
      savingsDisplay.textContent = `${savings}% saved`;
      savingsDisplay.style.color = 'var(--success)';
    } else {
      savingsDisplay.textContent = 'Already optimized';
      savingsDisplay.style.color = 'var(--text-secondary)';
    }
  }

  downloadBtn.addEventListener('click', () => {
    if (!compressedBytes) return;
    downloadFile(compressedBytes, `compressed_${currentFile.name}`, 'application/pdf');
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
