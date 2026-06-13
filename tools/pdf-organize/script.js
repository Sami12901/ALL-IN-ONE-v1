document.addEventListener('DOMContentLoaded', () => {
  const dropZone = document.getElementById('drop-zone');
  const fileInput = document.getElementById('file-input');
  const fileInfo = document.getElementById('file-info');
  const fileNameDisplay = document.getElementById('file-name');
  const fileSizeDisplay = document.getElementById('file-size');
  const clearBtn = document.getElementById('clear-btn');
  const pagesGrid = document.getElementById('pages-grid');
  const actionsPanel = document.getElementById('actions-panel');
  const saveBtn = document.getElementById('save-btn');
  const activePagesCount = document.getElementById('active-pages-count');
  
  const loadingContainer = document.getElementById('loading-container');
  const loadingFill = document.getElementById('loading-fill');
  const loadingText = document.getElementById('loading-text');
  const loadingPercent = document.getElementById('loading-percent');

  let currentFile = null;
  let fileArrayBuffer = null;
  let pagesData = []; // { id, originalIndex, rotation, deleted, thumbnailDataUrl }
  let nextId = 0;

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
    loadingContainer.style.display = 'flex';
    
    try {
      fileArrayBuffer = await file.arrayBuffer();
      await loadPdfPages(fileArrayBuffer);
    } catch (err) {
      console.error(err);
      alert('Error loading PDF file. It might be corrupted or protected.');
      clearFile();
    }
  }

  clearBtn.addEventListener('click', clearFile);

  function clearFile() {
    currentFile = null;
    fileArrayBuffer = null;
    pagesData = [];
    fileInput.value = '';
    
    dropZone.style.display = 'block';
    fileInfo.style.display = 'none';
    pagesGrid.style.display = 'none';
    actionsPanel.style.display = 'none';
    loadingContainer.style.display = 'none';
    pagesGrid.innerHTML = '';
  }

  async function loadPdfPages(buffer) {
    pagesData = [];
    pagesGrid.innerHTML = '';
    nextId = 0;

    const loadingTask = pdfjsLib.getDocument({ data: buffer });
    const pdf = await loadingTask.promise;
    const totalPages = pdf.numPages;

    for (let i = 1; i <= totalPages; i++) {
      updateLoading(Math.floor((i / totalPages) * 100), `Rendering page ${i} of ${totalPages}...`);
      
      const page = await pdf.getPage(i);
      const viewport = page.getViewport({ scale: 0.5 }); // lower scale for thumbnail
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      canvas.width = viewport.width;
      canvas.height = viewport.height;

      await page.render({ canvasContext: ctx, viewport: viewport }).promise;
      const dataUrl = canvas.toDataURL('image/jpeg', 0.8);

      pagesData.push({
        id: nextId++,
        originalIndex: i - 1, // 0-based for pdf-lib
        rotation: 0,
        deleted: false,
        thumbnailDataUrl: dataUrl
      });
    }

    loadingContainer.style.display = 'none';
    pagesGrid.style.display = 'grid';
    actionsPanel.style.display = 'flex';
    renderGrid();
  }

  function renderGrid() {
    pagesGrid.innerHTML = '';
    let visibleIndex = 1;
    let activeCount = 0;

    pagesData.forEach((pageData, index) => {
      const card = document.createElement('div');
      card.className = `page-card ${pageData.deleted ? 'deleted' : ''}`;
      card.draggable = true;
      card.dataset.index = index;

      const thumbContainer = document.createElement('div');
      thumbContainer.className = 'page-thumbnail-container';
      
      const img = document.createElement('img');
      img.src = pageData.thumbnailDataUrl;
      img.style.transform = `rotate(${pageData.rotation}deg)`;
      img.style.maxWidth = '100%';
      img.style.maxHeight = '100%';
      img.style.objectFit = 'contain';
      thumbContainer.appendChild(img);

      if (!pageData.deleted) {
        const badge = document.createElement('div');
        badge.className = 'page-number';
        badge.textContent = visibleIndex++;
        card.appendChild(badge);
        activeCount++;
      }

      const controls = document.createElement('div');
      controls.className = 'page-controls';

      // Rotate Left
      const btnRotL = document.createElement('button');
      btnRotL.className = 'btn-icon';
      btnRotL.innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/></svg>';
      btnRotL.onclick = () => {
        pageData.rotation = (pageData.rotation - 90) % 360;
        renderGrid();
      };

      // Rotate Right
      const btnRotR = document.createElement('button');
      btnRotR.className = 'btn-icon';
      btnRotR.innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 12a9 9 0 1 1-9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"/><path d="M21 3v5h-5"/></svg>';
      btnRotR.onclick = () => {
        pageData.rotation = (pageData.rotation + 90) % 360;
        renderGrid();
      };

      // Duplicate
      const btnDup = document.createElement('button');
      btnDup.className = 'btn-icon';
      btnDup.innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>';
      btnDup.onclick = () => {
        const dup = { ...pageData, id: nextId++ };
        pagesData.splice(index + 1, 0, dup);
        renderGrid();
      };

      // Delete/Restore
      const btnDel = document.createElement('button');
      btnDel.className = `btn-icon ${pageData.deleted ? '' : 'delete'}`;
      btnDel.innerHTML = pageData.deleted 
        ? '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 14 4 9 9 4"/><path d="M20 20v-7a4 4 0 0 0-4-4H4"/></svg>' // Restore
        : '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>'; // Delete
      
      btnDel.onclick = () => {
        pageData.deleted = !pageData.deleted;
        renderGrid();
      };

      controls.appendChild(btnRotL);
      controls.appendChild(btnRotR);
      controls.appendChild(btnDup);
      controls.appendChild(btnDel);

      card.appendChild(thumbContainer);
      card.appendChild(controls);

      // Drag events
      card.addEventListener('dragstart', handleDragStart);
      card.addEventListener('dragover', handleDragOver);
      card.addEventListener('drop', handleDrop);
      card.addEventListener('dragenter', (e) => e.preventDefault());

      pagesGrid.appendChild(card);
    });

    activePagesCount.textContent = activeCount;
    saveBtn.disabled = activeCount === 0;
  }

  let draggedIndex = null;

  function handleDragStart(e) {
    draggedIndex = parseInt(e.currentTarget.dataset.index, 10);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', draggedIndex);
    // slight opacity on drag
    setTimeout(() => e.currentTarget.style.opacity = '0.5', 0);
  }

  function handleDragOver(e) {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  }

  function handleDrop(e) {
    e.preventDefault();
    e.stopPropagation();
    
    const targetCard = e.currentTarget.closest('.page-card');
    if (!targetCard) return;

    const targetIndex = parseInt(targetCard.dataset.index, 10);
    
    if (draggedIndex !== null && draggedIndex !== targetIndex) {
      // Reorder array
      const item = pagesData.splice(draggedIndex, 1)[0];
      pagesData.splice(targetIndex, 0, item);
      renderGrid();
    }
    draggedIndex = null;
  }

  // --- Save Logic ---

  saveBtn.addEventListener('click', async () => {
    if (!fileArrayBuffer) return;

    saveBtn.disabled = true;
    loadingContainer.style.display = 'flex';
    updateLoading(10, 'Preparing PDF...');

    try {
      const sourcePdf = await PDFLib.PDFDocument.load(fileArrayBuffer);
      const newPdf = await PDFLib.PDFDocument.create();

      const activePages = pagesData.filter(p => !p.deleted);
      
      for (let i = 0; i < activePages.length; i++) {
        updateLoading(10 + Math.floor((i / activePages.length) * 70), `Processing page ${i + 1} of ${activePages.length}...`);
        
        const pageData = activePages[i];
        
        // Copy the page
        const [copiedPage] = await newPdf.copyPages(sourcePdf, [pageData.originalIndex]);
        
        // Apply rotation
        if (pageData.rotation !== 0) {
          const currentRotation = copiedPage.getRotation().angle;
          copiedPage.setRotation(PDFLib.degrees(currentRotation + pageData.rotation));
        }
        
        newPdf.addPage(copiedPage);
      }

      updateLoading(90, 'Saving PDF...');
      const pdfBytes = await newPdf.save();
      
      updateLoading(100, 'Done!');
      downloadFile(pdfBytes, `organized_${currentFile.name}`, 'application/pdf');

    } catch (err) {
      console.error(err);
      alert('An error occurred while saving the PDF.');
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
