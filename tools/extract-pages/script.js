// Extract Pages Logic

class ExtractPages {
  constructor() {
    this.uploadZone = document.getElementById('upload-zone');
    this.btnBrowse = document.getElementById('btn-browse');
    this.fileInput = document.getElementById('file-input');
    
    this.workspace = document.getElementById('workspace');
    this.uiFilename = document.getElementById('ui-filename');
    this.uiPages = document.getElementById('ui-pages');
    this.btnChange = document.getElementById('btn-change');
    
    this.inExtract = document.getElementById('extract-input');
    this.btnExecute = document.getElementById('btn-execute');

    this.currentFile = null;
    this.currentPdfDoc = null;
    this.totalPages = 0;

    this.bindEvents();
  }

  bindEvents() {
    this.btnBrowse.addEventListener('click', () => this.fileInput.click());
    this.fileInput.addEventListener('change', (e) => this.handleFile(e.target.files[0]));

    this.uploadZone.addEventListener('dragover', (e) => { e.preventDefault(); this.uploadZone.classList.add('dragover'); });
    this.uploadZone.addEventListener('dragleave', () => this.uploadZone.classList.remove('dragover'); });
    this.uploadZone.addEventListener('drop', (e) => {
      e.preventDefault();
      this.uploadZone.classList.remove('dragover');
      if (e.dataTransfer.files.length > 0) this.handleFile(e.dataTransfer.files[0]);
    });

    this.btnChange.addEventListener('click', () => {
      this.currentFile = null;
      this.currentPdfDoc = null;
      this.uploadZone.style.display = 'block';
      this.workspace.style.display = 'none';
      this.inExtract.value = '';
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
    this.uiPages.textContent = 'Loading...';

    try {
      const arrayBuffer = await file.arrayBuffer();
      this.currentPdfDoc = await window.PDFLib.PDFDocument.load(arrayBuffer);
      this.totalPages = this.currentPdfDoc.getPageCount();
      this.uiPages.textContent = `${this.totalPages} Pages`;
    } catch (e) {
      alert('Error parsing PDF: ' + e.message);
      this.btnChange.click();
    }
  }

  parseRange(rangeStr, maxPages) {
    const pages = new Set();
    const parts = rangeStr.split(',');
    for (let part of parts) {
      part = part.trim();
      if (!part) continue;
      if (part.includes('-')) {
        const bounds = part.split('-');
        if (bounds.length === 2) {
          const start = parseInt(bounds[0], 10);
          const end = parseInt(bounds[1], 10);
          if (!isNaN(start) && !isNaN(end) && start <= end) {
            for (let i = start; i <= end; i++) pages.add(i);
          }
        }
      } else {
        const p = parseInt(part, 10);
        if (!isNaN(p)) pages.add(p);
      }
    }
    // Convert to 0-indexed array
    return Array.from(pages)
      .filter(p => p >= 1 && p <= maxPages)
      .map(p => p - 1)
      .sort((a, b) => a - b);
  }

  async execute() {
    const extStr = this.inExtract.value;
    const toExtract = this.parseRange(extStr, this.totalPages);
    
    if (toExtract.length === 0) {
      alert('Please specify at least one valid page to extract.');
      return;
    }

    this.btnExecute.disabled = true;
    this.btnExecute.textContent = 'Processing...';

    try {
      const newPdf = await window.PDFLib.PDFDocument.create();
      
      const copiedPages = await newPdf.copyPages(this.currentPdfDoc, toExtract);
      copiedPages.forEach(page => newPdf.addPage(page));

      const pdfBytes = await newPdf.save();
      const blob = new Blob([pdfBytes], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      
      const a = document.createElement('a');
      a.href = url;
      a.download = `extracted-${this.currentFile.name}`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (e) {
      console.error(e);
      alert('Error saving PDF: ' + e.message);
    } finally {
      this.btnExecute.disabled = false;
      this.btnExecute.textContent = 'Extract Pages & Download';
    }
  }
}

document.addEventListener('DOMContentLoaded', () => {
  setTimeout(() => window.extractPages = new ExtractPages(), 300);
});