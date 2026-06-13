document.addEventListener('DOMContentLoaded', () => {
  const dropZone = document.getElementById('drop-zone');
  const fileInput = document.getElementById('file-input');
  const fileInfo = document.getElementById('file-info');
  const fileNameDisplay = document.getElementById('file-name');
  const fileSizeDisplay = document.getElementById('file-size');
  const clearBtn = document.getElementById('clear-btn');
  
  const loadingContainer = document.getElementById('loading-container');
  const loadingFill = document.getElementById('loading-fill');
  const loadingText = document.getElementById('loading-text');
  const loadingPercent = document.getElementById('loading-percent');

  const outputPanel = document.getElementById('output-panel');
  const outputTextarea = document.getElementById('output-text');
  const copyBtn = document.getElementById('copy-btn');
  const copyStatus = document.getElementById('copy-status');
  const downloadBtn = document.getElementById('download-btn');

  let currentFile = null;

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
    
    extractText(file);
  }

  clearBtn.addEventListener('click', clearFile);

  function clearFile() {
    currentFile = null;
    fileInput.value = '';
    outputTextarea.value = '';
    
    dropZone.style.display = 'block';
    fileInfo.style.display = 'none';
    outputPanel.style.display = 'none';
    loadingContainer.style.display = 'none';
  }

  // --- Extraction Logic ---

  async function extractText(file) {
    loadingContainer.style.display = 'flex';
    outputPanel.style.display = 'none';
    outputTextarea.value = '';
    updateLoading(5, 'Parsing PDF Document...');

    try {
      const fileArrayBuffer = await file.arrayBuffer();
      const loadingTask = pdfjsLib.getDocument({ data: fileArrayBuffer });
      const pdf = await loadingTask.promise;
      const totalPages = pdf.numPages;

      let extractedText = '';

      for (let i = 1; i <= totalPages; i++) {
        updateLoading(10 + Math.floor((i / totalPages) * 85), `Extracting page ${i} of ${totalPages}...`);
        
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        
        const strings = textContent.items.map(item => item.str);
        // A very basic text reconstruction
        extractedText += `--- Page ${i} ---\n\n`;
        
        let lastY = -1;
        textContent.items.forEach(item => {
          if (lastY !== item.transform[5] && lastY !== -1) {
            extractedText += '\n';
          }
          extractedText += item.str;
          lastY = item.transform[5];
        });

        extractedText += '\n\n';
      }

      outputTextarea.value = extractedText.trim();

      updateLoading(100, 'Extraction complete!');
      setTimeout(() => {
        loadingContainer.style.display = 'none';
        outputPanel.style.display = 'flex';
      }, 500);

    } catch (err) {
      console.error(err);
      alert('An error occurred during text extraction. Ensure the PDF is valid and not scanned (images only).');
      clearFile();
    }
  }

  // --- Copy & Download ---

  copyBtn.addEventListener('click', () => {
    if (!outputTextarea.value) return;
    
    navigator.clipboard.writeText(outputTextarea.value).then(() => {
      copyStatus.style.opacity = '1';
      setTimeout(() => copyStatus.style.opacity = '0', 2000);
    }).catch(err => {
      console.error('Copy failed', err);
      // Fallback
      outputTextarea.select();
      document.execCommand('copy');
      copyStatus.style.opacity = '1';
      setTimeout(() => copyStatus.style.opacity = '0', 2000);
    });
  });

  downloadBtn.addEventListener('click', () => {
    if (!outputTextarea.value) return;
    
    const baseName = currentFile.name.replace('.pdf', '');
    downloadFile(outputTextarea.value, `${baseName}.txt`, 'text/plain');
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
