// PDF Organize Logic

pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.16.105/pdf.worker.min.js';

class PdfOrganizer {
  constructor() {
    this.uploadZone = document.getElementById('upload-zone');
    this.btnBrowse = document.getElementById('btn-browse');
    this.fileInput = document.getElementById('file-input');
    
    this.workspace = document.getElementById('workspace');
    this.uiFilename = document.getElementById('ui-filename');
    this.uiCount = document.getElementById('ui-count');
    this.btnChange = document.getElementById('btn-change');
    this.btnExecute = document.getElementById('btn-execute');
    this.pagesGrid = document.getElementById('pages-grid');
    this.loadingState = document.getElementById('loading-state');

    this.currentFile = null;
    this.pagesArray = []; // [{ id, origIndex, canvas }]
    this.draggedItemIndex = null;

    this.bindEvents();
  }

  bindEvents() {
    this.btnBrowse.addEventListener('click', () => this.fileInput.click());
    this.fileInput.addEventListener('change', (e) => this.handleFile(e.target.files[0]));

    this.uploadZone.addEventListener('dragover', (e) => { e.preventDefault(); this.uploadZone.classList.add('dragover'); });
    this.uploadZone.addEventListener('dragleave', () => this.uploadZone.classList.remove('dragover'));
    this.uploadZone.addEventListener('drop', (e) => {
      e.preventDefault();
      this.uploadZone.classList.remove('dragover');
      if (e.dataTransfer.files.length > 0) this.handleFile(e.dataTransfer.files[0]);
    });

    this.btnChange.addEventListener('click', () => {
      this.currentFile = null;
      this.pagesArray = [];
      this.uploadZone.style.display = 'block';
      this.workspace.style.display = 'none';
      this.pagesGrid.innerHTML = '';
    });

    this.btnExecute.addEventListener('click', () => this.execute());
  }

  async handleFile(file) {
    if (!file || file.type !== 'application/pdf') {
      alert('Please select a valid PDF file.');
      return;
    }
    this.currentFile = file;
    this.uploadZone.style.display = 'none';
    this.workspace.style.display = 'block';
    this.uiFilename.textContent = file.name;
    this.loadingState.style.display = 'block';
    this.pagesGrid.innerHTML = '';
    this.pagesArray = [];

    try {
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      const total = pdf.numPages;
      this.uiCount.textContent = `${total} Pages`;

      for (let i = 1; i <= total; i++) {
        const page = await pdf.getPage(i);
        const viewport = page.getViewport({ scale: 0.5 });
        
        const canvas = document.createElement('canvas');
        canvas.className = 'page-thumbnail';
        const ctx = canvas.getContext('2d');
        canvas.width = viewport.width;
        canvas.height = viewport.height;
        
        await page.render({ canvasContext: ctx, viewport: viewport }).promise;
        
        this.pagesArray.push({
          id: 'page_' + Math.random().toString(36).substr(2, 9),
          origIndex: i - 1, // 0-indexed for pdf-lib later
          canvas: canvas
        });
      }
      
      this.renderGrid();
    } catch (e) {
      alert('Error parsing PDF: ' + e.message);
      this.btnChange.click();
    } finally {
      this.loadingState.style.display = 'none';
    }
  }

  removePage(id) {
    this.pagesArray = this.pagesArray.filter(p => p.id !== id);
    this.renderGrid();
  }

  renderGrid() {
    this.pagesGrid.innerHTML = '';
    this.uiCount.textContent = `${this.pagesArray.length} Pages`;

    this.pagesArray.forEach((pObj, index) => {
      const el = document.createElement('div');
      el.className = 'page-card';
      el.draggable = true;
      el.dataset.index = index;

      const btnDelete = document.createElement('button');
      btnDelete.className = 'btn-delete-page';
      btnDelete.innerHTML = '&times;';
      btnDelete.onclick = () => this.removePage(pObj.id);

      const label = document.createElement('div');
      label.className = 'page-label';
      label.textContent = index + 1; // display 1-based index

      el.appendChild(btnDelete);
      el.appendChild(pObj.canvas);
      el.appendChild(label);

      // Drag Events
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
        
        const box = el.getBoundingClientRect();
        // Since it's a grid, we sort by whether cursor is past the halfway X point
        const boxCenterX = box.left + box.width / 2;
        if (e.clientX < boxCenterX) {
          this.pagesGrid.insertBefore(draggingEl, el);
        } else {
          this.pagesGrid.insertBefore(draggingEl, el.nextSibling);
        }
      });

      el.addEventListener('drop', () => {
        // Rebuild array based on new DOM order
        const children = Array.from(this.pagesGrid.children);
        const newArray = [];
        children.forEach(child => {
          const oldIdx = parseInt(child.dataset.index);
          newArray.push(this.pagesArray[oldIdx]);
        });
        this.pagesArray = newArray;
        this.renderGrid(); // re-render to update labels and indices
      });

      this.pagesGrid.appendChild(el);
    });
  }

  async execute() {
    if (!this.currentFile || this.pagesArray.length === 0) return;

    this.btnExecute.disabled = true;
    this.btnExecute.textContent = 'Saving...';

    try {
      const arrayBuffer = await this.currentFile.arrayBuffer();
      const origPdf = await window.PDFLib.PDFDocument.load(arrayBuffer);
      const newPdf = await window.PDFLib.PDFDocument.create();

      // Get the 0-indexed orig indices of the current array
      const indicesToCopy = this.pagesArray.map(p => p.origIndex);
      
      const copiedPages = await newPdf.copyPages(origPdf, indicesToCopy);
      copiedPages.forEach(page => newPdf.addPage(page));

      const pdfBytes = await newPdf.save();
      const blob = new Blob([pdfBytes], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      
      const a = document.createElement('a');
      a.href = url;
      a.download = `organized-${this.currentFile.name}`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (e) {
      console.error(e);
      alert('Error saving PDF: ' + e.message);
    } finally {
      this.btnExecute.disabled = false;
      this.btnExecute.textContent = 'Save PDF';
    }
  }
}

document.addEventListener('DOMContentLoaded', () => {
  setTimeout(() => window.pdfOrganizer = new PdfOrganizer(), 300);
});