// PDF Merge Logic using pdf-lib

document.addEventListener('DOMContentLoaded', () => {
  const dropZone = document.getElementById('drop-zone');
  const fileInput = document.getElementById('file-input');
  const fileListEl = document.getElementById('file-list');
  const actionsPanel = document.getElementById('actions-panel');
  const mergeBtn = document.getElementById('merge-btn');
  const clearBtn = document.getElementById('clear-btn');
  const fileCountBadge = document.getElementById('file-count-badge');
  const progressContainer = document.getElementById('progress-container');
  const progressFill = document.getElementById('progress-fill');
  const progressText = document.getElementById('progress-text');
  const progressPercent = document.getElementById('progress-percent');

  let selectedFiles = [];

  // --- Drag & Drop Handlers ---
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
    const files = e.dataTransfer.files;
    handleFiles(files);
  }, false);

  fileInput.addEventListener('change', (e) => {
    handleFiles(e.target.files);
    fileInput.value = ''; // Reset
  });

  // --- File Management ---
  function handleFiles(files) {
    const newFiles = Array.from(files).filter(file => file.type === 'application/pdf');
    if (newFiles.length === 0) {
      alert('Please upload valid PDF files.');
      return;
    }
    
    selectedFiles = [...selectedFiles, ...newFiles];
    renderFileList();
  }

  function removeFile(index) {
    selectedFiles.splice(index, 1);
    renderFileList();
  }

  function moveFile(index, direction) {
    if (direction === -1 && index > 0) {
      // Move up
      [selectedFiles[index - 1], selectedFiles[index]] = [selectedFiles[index], selectedFiles[index - 1]];
    } else if (direction === 1 && index < selectedFiles.length - 1) {
      // Move down
      [selectedFiles[index + 1], selectedFiles[index]] = [selectedFiles[index], selectedFiles[index + 1]];
    }
    renderFileList();
  }

  function formatBytes(bytes, decimals = 2) {
    if (!+bytes) return '0 Bytes';
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
  }

  function renderFileList() {
    fileListEl.innerHTML = '';
    
    if (selectedFiles.length === 0) {
      actionsPanel.style.display = 'none';
      return;
    }

    selectedFiles.forEach((file, index) => {
      const item = document.createElement('div');
      item.className = 'file-item';
      
      item.innerHTML = `
        <div class="file-info">
          <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="var(--danger)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="min-width: 24px;">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
            <polyline points="14 2 14 8 20 8"></polyline>
          </svg>
          <div style="display: flex; flex-direction: column; overflow: hidden;">
            <span class="file-name" title="${file.name}">${file.name}</span>
            <span class="file-size">${formatBytes(file.size)}</span>
          </div>
        </div>
        <div style="display: flex; gap: 0.5rem; align-items: center;">
          <button class="btn-remove" style="color: var(--text-secondary);" onclick="moveUp(${index})" ${index === 0 ? 'disabled style="opacity: 0.3;"' : ''} title="Move Up">
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="18 15 12 9 6 15"></polyline></svg>
          </button>
          <button class="btn-remove" style="color: var(--text-secondary);" onclick="moveDown(${index})" ${index === selectedFiles.length - 1 ? 'disabled style="opacity: 0.3;"' : ''} title="Move Down">
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>
          </button>
          <div style="width: 1px; height: 16px; background: var(--border); margin: 0 0.25rem;"></div>
          <button class="btn-remove" onclick="removeItem(${index})" title="Remove">
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
          </button>
        </div>
      `;
      fileListEl.appendChild(item);
    });

    fileCountBadge.textContent = selectedFiles.length;
    actionsPanel.style.display = 'flex';
  }

  // Global exposes for inline onclicks
  window.removeItem = removeFile;
  window.moveUp = (idx) => moveFile(idx, -1);
  window.moveDown = (idx) => moveFile(idx, 1);

  clearBtn.addEventListener('click', () => {
    selectedFiles = [];
    renderFileList();
  });

  // --- PDF Merging Logic ---
  mergeBtn.addEventListener('click', async () => {
    if (selectedFiles.length < 2) {
      alert('Please select at least 2 PDF files to merge.');
      return;
    }

    if (!window.PDFLib) {
      alert('PDF library is not loaded. Please ensure you are connected to the internet or the library is cached.');
      return;
    }

    try {
      mergeBtn.disabled = true;
      clearBtn.disabled = true;
      progressContainer.style.display = 'flex';
      
      const { PDFDocument } = PDFLib;
      const mergedPdf = await PDFDocument.create();
      
      const totalFiles = selectedFiles.length;
      
      for (let i = 0; i < totalFiles; i++) {
        const file = selectedFiles[i];
        
        // Update progress UI
        const pct = Math.round((i / totalFiles) * 100);
        progressFill.style.width = `${pct}%`;
        progressPercent.textContent = `${pct}%`;
        progressText.textContent = `Reading ${file.name}...`;

        // Read file as ArrayBuffer
        const arrayBuffer = await file.arrayBuffer();
        const pdfDoc = await PDFDocument.load(arrayBuffer);
        
        // Copy pages
        progressText.textContent = `Merging pages from ${file.name}...`;
        const copiedPages = await mergedPdf.copyPages(pdfDoc, pdfDoc.getPageIndices());
        copiedPages.forEach((page) => {
          mergedPdf.addPage(page);
        });
      }

      // Finalizing
      progressFill.style.width = `95%`;
      progressPercent.textContent = `95%`;
      progressText.textContent = 'Generating final PDF...';
      
      const mergedPdfBytes = await mergedPdf.save();
      
      // Save file
      const blob = new Blob([mergedPdfBytes], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `ALL_IN_ONE_Merged_${new Date().getTime()}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      // Complete
      progressFill.style.width = `100%`;
      progressPercent.textContent = `100%`;
      progressText.textContent = 'Done!';
      
      setTimeout(() => {
        progressContainer.style.display = 'none';
        progressFill.style.width = `0%`;
      }, 3000);

    } catch (error) {
      console.error('Error merging PDFs:', error);
      alert('An error occurred while merging the PDFs. Make sure they are not encrypted/password protected.');
      progressContainer.style.display = 'none';
    } finally {
      mergeBtn.disabled = false;
      clearBtn.disabled = false;
    }
  });

});
