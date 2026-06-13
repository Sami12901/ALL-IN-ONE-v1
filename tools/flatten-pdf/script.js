document.addEventListener('DOMContentLoaded', () => {
  const dropZone = document.getElementById('drop-zone');
  const fileInput = document.getElementById('file-input');
  const fileInfo = document.getElementById('file-info');
  const fileNameDisplay = document.getElementById('file-name');
  const fileSizeDisplay = document.getElementById('file-size');
  const clearBtn = document.getElementById('clear-btn');
  const actionsPanel = document.getElementById('actions-panel');
  const saveBtn = document.getElementById('save-btn');
  const infoBox = document.getElementById('info-box');
  
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
      infoBox.style.display = 'block';
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
    infoBox.style.display = 'none';
    actionsPanel.style.display = 'none';
    loadingContainer.style.display = 'none';
  }

  // --- Save Logic ---

  saveBtn.addEventListener('click', async () => {
    if (!fileArrayBuffer) return;

    saveBtn.disabled = true;
    loadingContainer.style.display = 'flex';
    updateLoading(20, 'Loading PDF Document...');

    try {
      const pdfDoc = await PDFLib.PDFDocument.load(fileArrayBuffer);
      
      updateLoading(50, 'Flattening forms and annotations...');
      const form = pdfDoc.getForm();
      
      // Flatten the form
      form.flatten();
      
      updateLoading(80, 'Saving PDF...');
      const pdfBytes = await pdfDoc.save();
      
      updateLoading(100, 'Done!');
      downloadFile(pdfBytes, `flattened_${currentFile.name}`, 'application/pdf');

    } catch (err) {
      console.error(err);
      alert('An error occurred while flattening the PDF. Ensure the PDF is not password protected.');
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
