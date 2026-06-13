document.addEventListener('DOMContentLoaded', () => {
  const dropZone = document.getElementById('drop-zone');
  const fileInput = document.getElementById('file-input');
  const fileInfo = document.getElementById('file-info');
  const fileNameDisplay = document.getElementById('file-name');
  const fileSizeDisplay = document.getElementById('file-size');
  const clearBtn = document.getElementById('clear-btn');
  const splitOptions = document.getElementById('split-options');
  const actionsPanel = document.getElementById('actions-panel');
  const splitBtn = document.getElementById('split-btn');
  const progressContainer = document.getElementById('progress-container');
  const progressFill = document.getElementById('progress-fill');
  const progressText = document.getElementById('progress-text');
  const progressPercent = document.getElementById('progress-percent');
  
  const radioInputs = document.querySelectorAll('input[name="split-mode"]');
  const rangeWrapper = document.getElementById('range-wrapper');
  const maxPagesDisplay = document.getElementById('max-pages');
  const pageRangesInput = document.getElementById('page-ranges');

  let currentFile = null;
  let totalPages = 0;

  // --- UI Interactions ---

  // Drag & Drop
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
    
    // Read PDF to get page count
    try {
      const arrayBuffer = await file.arrayBuffer();
      const pdfDoc = await PDFLib.PDFDocument.load(arrayBuffer);
      totalPages = pdfDoc.getPageCount();
      
      fileSizeDisplay.innerHTML = `${formatBytes(file.size)} &bull; ${totalPages} pages`;
      maxPagesDisplay.textContent = totalPages;
      
      // Update UI
      dropZone.style.display = 'none';
      fileInfo.style.display = 'flex';
      splitOptions.style.display = 'flex';
      actionsPanel.style.display = 'flex';
      
    } catch (err) {
      console.error(err);
      alert('Error loading PDF file. It might be corrupted or protected.');
      clearFile();
    }
  }

  clearBtn.addEventListener('click', clearFile);

  function clearFile() {
    currentFile = null;
    totalPages = 0;
    fileInput.value = '';
    
    dropZone.style.display = 'block';
    fileInfo.style.display = 'none';
    splitOptions.style.display = 'none';
    actionsPanel.style.display = 'none';
    progressContainer.style.display = 'none';
    pageRangesInput.value = '';
  }

  // Radio button logic
  radioInputs.forEach(radio => {
    radio.addEventListener('change', (e) => {
      if (e.target.value === 'all') {
        rangeWrapper.style.display = 'none';
      } else {
        rangeWrapper.style.display = 'flex';
      }
    });
  });

  // --- Logic ---

  splitBtn.addEventListener('click', async () => {
    if (!currentFile) return;

    const splitMode = document.querySelector('input[name="split-mode"]:checked').value;
    const rangesStr = pageRangesInput.value.trim();

    if ((splitMode === 'range' || splitMode === 'extract') && !rangesStr) {
      alert('Please enter valid page ranges.');
      return;
    }

    let pageRanges = [];
    if (splitMode === 'all') {
      for (let i = 1; i <= totalPages; i++) {
        pageRanges.push([i, i]);
      }
    } else {
      try {
        pageRanges = parseRanges(rangesStr, totalPages);
      } catch (err) {
        alert(err.message);
        return;
      }
    }

    if (pageRanges.length === 0) {
      alert('No valid pages to extract.');
      return;
    }

    // Start UI progress
    splitBtn.disabled = true;
    clearBtn.disabled = true;
    progressContainer.style.display = 'flex';
    updateProgress(0, 'Loading PDF...');

    try {
      const arrayBuffer = await currentFile.arrayBuffer();
      const sourcePdf = await PDFLib.PDFDocument.load(arrayBuffer);

      if (splitMode === 'extract') {
        // Extract all specified pages into ONE single PDF
        updateProgress(20, 'Extracting pages...');
        
        const newPdf = await PDFLib.PDFDocument.create();
        
        let allPages = [];
        for (const [start, end] of pageRanges) {
          for (let p = start; p <= end; p++) {
            allPages.push(p - 1); // zero-indexed
          }
        }
        
        const copiedPages = await newPdf.copyPages(sourcePdf, allPages);
        copiedPages.forEach(page => newPdf.addPage(page));
        
        updateProgress(80, 'Saving PDF...');
        const pdfBytes = await newPdf.save();
        
        updateProgress(100, 'Done!');
        downloadFile(pdfBytes, `extracted_${currentFile.name}`, 'application/pdf');

      } else {
        // splitMode === 'all' or 'range'
        // Create a ZIP file of multiple PDFs
        updateProgress(20, 'Preparing Zip...');
        const zip = new JSZip();
        
        let completed = 0;
        const totalOps = pageRanges.length;

        for (let i = 0; i < pageRanges.length; i++) {
          const [start, end] = pageRanges[i];
          updateProgress(20 + Math.floor((completed / totalOps) * 60), `Processing part ${i + 1} of ${totalOps}...`);
          
          const newPdf = await PDFLib.PDFDocument.create();
          const indices = [];
          for (let p = start; p <= end; p++) {
            indices.push(p - 1);
          }
          
          const copiedPages = await newPdf.copyPages(sourcePdf, indices);
          copiedPages.forEach(page => newPdf.addPage(page));
          
          const pdfBytes = await newPdf.save();
          
          let outName = '';
          if (start === end) {
            outName = `page_${start}.pdf`;
          } else {
            outName = `pages_${start}-${end}.pdf`;
          }
          
          zip.file(outName, pdfBytes);
          completed++;
        }

        updateProgress(85, 'Generating Zip file...');
        const zipBlob = await zip.generateAsync({ type: 'blob' });
        
        updateProgress(100, 'Done!');
        downloadFile(zipBlob, `split_${currentFile.name.replace('.pdf', '')}.zip`, 'application/zip');
      }

    } catch (err) {
      console.error(err);
      alert('An error occurred during splitting.');
    }

    // Reset UI
    setTimeout(() => {
      splitBtn.disabled = false;
      clearBtn.disabled = false;
      progressContainer.style.display = 'none';
      updateProgress(0, '');
    }, 2000);
  });

  // --- Utils ---

  function parseRanges(str, max) {
    const parts = str.split(',').map(s => s.trim()).filter(s => s);
    const ranges = [];

    for (const part of parts) {
      if (part.includes('-')) {
        const [startStr, endStr] = part.split('-');
        const start = parseInt(startStr, 10);
        const end = parseInt(endStr, 10);

        if (isNaN(start) || isNaN(end) || start > end || start < 1 || end > max) {
          throw new Error(`Invalid range: ${part}. Pages must be between 1 and ${max}.`);
        }
        ranges.push([start, end]);
      } else {
        const page = parseInt(part, 10);
        if (isNaN(page) || page < 1 || page > max) {
          throw new Error(`Invalid page number: ${part}. Pages must be between 1 and ${max}.`);
        }
        ranges.push([page, page]);
      }
    }

    return ranges;
  }

  function updateProgress(percent, text) {
    progressPercent.textContent = `${percent}%`;
    progressFill.style.width = `${percent}%`;
    progressText.textContent = text;
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
