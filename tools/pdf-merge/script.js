// PDF Merge Logic

class PdfMerger {
  constructor() {
    this.uploadZone = document.getElementById('upload-zone');
    this.btnBrowse = document.getElementById('btn-browse');
    this.fileInput = document.getElementById('file-input');
    
    this.fileListContainer = document.getElementById('file-list-container');
    this.fileList = document.getElementById('file-list');
    this.fileCount = document.getElementById('file-count');
    this.btnMerge = document.getElementById('btn-merge');

    this.files = []; // Array of { id, file }
    this.draggedItemIndex = null;

    this.bindEvents();
  }

  bindEvents() {
    // Upload Zone Events
    this.btnBrowse.addEventListener('click', () => this.fileInput.click());
    this.fileInput.addEventListener('change', (e) => this.handleFiles(e.target.files));

    this.uploadZone.addEventListener('dragover', (e) => {
      e.preventDefault();
      this.uploadZone.classList.add('dragover');
    });
    this.uploadZone.addEventListener('dragleave', () => {
      this.uploadZone.classList.remove('dragover');
    });
    this.uploadZone.addEventListener('drop', (e) => {
      e.preventDefault();
      this.uploadZone.classList.remove('dragover');
      this.handleFiles(e.dataTransfer.files);
    });

    // Merge Button
    this.btnMerge.addEventListener('click', () => this.merge());
  }

  handleFiles(newFiles) {
    if (!newFiles || newFiles.length === 0) return;
    
    Array.from(newFiles).forEach(file => {
      if (file.type === 'application/pdf' || file.type.startsWith('image/')) {
        this.files.push({
          id: 'file_' + Math.random().toString(36).substr(2, 9),
          file: file
        });
      }
    });

    this.fileInput.value = ''; // reset
    this.renderFileList();
  }

  removeFile(id) {
    this.files = this.files.filter(f => f.id !== id);
    this.renderFileList();
  }

  formatBytes(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  renderFileList() {
    if (this.files.length === 0) {
      this.fileListContainer.style.display = 'none';
      return;
    }
    
    this.fileListContainer.style.display = 'block';
    this.fileCount.textContent = `${this.files.length} files`;
    this.fileList.innerHTML = '';

    this.files.forEach((fObj, index) => {
      const el = document.createElement('div');
      el.className = 'file-item';
      el.draggable = true;
      el.dataset.index = index;

      const isPdf = fObj.file.type === 'application/pdf';
      const iconHtml = isPdf 
        ? `<svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" stroke-width="2" fill="none"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>`
        : `<svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" stroke-width="2" fill="none" style="color: #3b82f6;"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><circle cx="8.5" cy="8.5" r="1.5"></circle><polyline points="21 15 16 10 5 21"></polyline></svg>`;

      el.innerHTML = `
        <div class="drag-handle">
          <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" stroke-width="2" fill="none"><line x1="8" y1="6" x2="21" y2="6"></line><line x1="8" y1="12" x2="21" y2="12"></line><line x1="8" y1="18" x2="21" y2="18"></line><line x1="3" y1="6" x2="3.01" y2="6"></line><line x1="3" y1="12" x2="3.01" y2="12"></line><line x1="3" y1="18" x2="3.01" y2="18"></line></svg>
        </div>
        <div class="file-icon">${iconHtml}</div>
        <div class="file-details">
          <div class="file-name" title="${fObj.file.name}">${fObj.file.name}</div>
          <div class="file-size">${this.formatBytes(fObj.file.size)}</div>
        </div>
        <button class="remove-btn" onclick="window.pdfMerger.removeFile('${fObj.id}')">
          <svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" stroke-width="2" fill="none"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
        </button>
      `;

      // Drag and Drop Logic
      el.addEventListener('dragstart', (e) => {
        this.draggedItemIndex = index;
        setTimeout(() => el.classList.add('dragging'), 0);
      });

      el.addEventListener('dragend', () => {
        el.classList.remove('dragging');
        this.draggedItemIndex = null;
      });

      el.addEventListener('dragover', (e) => {
        e.preventDefault();
        const draggingEl = document.querySelector('.dragging');
        if (!draggingEl) return;
        
        const currentY = e.clientY;
        const box = el.getBoundingClientRect();
        const boxCenterY = box.top + box.height / 2;
        
        if (currentY < boxCenterY) {
          this.fileList.insertBefore(draggingEl, el);
        } else {
          this.fileList.insertBefore(draggingEl, el.nextSibling);
        }
      });

      // Update actual array upon drop
      el.addEventListener('drop', (e) => {
        const children = Array.from(this.fileList.children);
        
        // Build new array based on DOM order
        const newArray = [];
        children.forEach(child => {
          const oldIndex = parseInt(child.dataset.index);
          newArray.push(this.files[oldIndex]);
        });
        
        this.files = newArray;
        this.renderFileList(); // re-render to update dataset index properly
      });

      this.fileList.appendChild(el);
    });
  }

  async merge() {
    if (this.files.length === 0 || !window.PDFLib) return;

    this.btnMerge.disabled = true;
    this.btnMerge.innerHTML = 'Merging...';

    try {
      const { PDFDocument } = window.PDFLib;
      const mergedPdf = await PDFDocument.create();

      for (const fObj of this.files) {
        const fileData = await fObj.file.arrayBuffer();

        if (fObj.file.type === 'application/pdf') {
          const pdf = await PDFDocument.load(fileData);
          const copiedPages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
          copiedPages.forEach(page => mergedPdf.addPage(page));
        } 
        else if (fObj.file.type.startsWith('image/')) {
          let image;
          if (fObj.file.type === 'image/png') {
            image = await mergedPdf.embedPng(fileData);
          } else {
            image = await mergedPdf.embedJpg(fileData);
          }
          
          const dims = image.scale(1);
          const page = mergedPdf.addPage([dims.width, dims.height]);
          page.drawImage(image, {
            x: 0,
            y: 0,
            width: dims.width,
            height: dims.height
          });
        }
      }

      const mergedPdfBytes = await mergedPdf.save();
      const blob = new Blob([mergedPdfBytes], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      
      const a = document.createElement('a');
      a.href = url;
      a.download = 'Merged-Document.pdf';
      a.click();
      
      URL.revokeObjectURL(url);

    } catch (err) {
      console.error(err);
      alert('Error merging files: ' + err.message);
    } finally {
      this.btnMerge.disabled = false;
      this.btnMerge.innerHTML = `
        <svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" stroke-width="2" fill="none"><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"></path><rect x="8" y="2" width="8" height="4" rx="1" ry="1"></rect><circle cx="12" cy="14" r="3"></circle><line x1="12" y1="11" x2="12" y2="17"></line><line x1="9" y1="14" x2="15" y2="14"></line></svg>
        Merge & Download
      `;
    }
  }
}

// Wait for lib
document.addEventListener('DOMContentLoaded', () => {
  setTimeout(() => {
    window.pdfMerger = new PdfMerger();
  }, 300);
});