// PDF Split Logic

class PdfSplitter {
  constructor() {
    this.uploadZone = document.getElementById('upload-zone');
    this.btnBrowse = document.getElementById('btn-browse');
    this.fileInput = document.getElementById('file-input');
    
    this.workspace = document.getElementById('workspace');
    this.uiFilename = document.getElementById('ui-filename');
    this.uiPages = document.getElementById('ui-pages');
    this.btnChange = document.getElementById('btn-change');
    
    this.radioRange = document.getElementById('radio-range');
    this.radioAll = document.getElementById('radio-all');
    this.rangeContainer = document.getElementById('range-container');
    this.rangeInput = document.getElementById('range-input');
    
    this.btnExecute = document.getElementById('btn-execute');

    this.currentFile = null;
    this.currentPdfDoc = null;
    this.totalPages = 0;

    this.bindEvents();
  }

  bindEvents() {
    // Upload Zone
    this.btnBrowse.addEventListener('click', () => this.fileInput.click());
    this.fileInput.addEventListener('change', (e) => this.handleFile(e.target.files[0]));

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
      if (e.dataTransfer.files.length > 0) {
        this.handleFile(e.dataTransfer.files[0]);
      }
    });

    // UI Changes
    this.btnChange.addEventListener('click', () => {
      this.currentFile = null;
      this.currentPdfDoc = null;
      this.uploadZone.style.display = 'block';
      this.workspace.style.display = 'none';
    });

    this.radioRange.addEventListener('change', () => this.toggleUI());
    this.radioAll.addEventListener('change', () => this.toggleUI());

    this.btnExecute.addEventListener('click', () => this.execute());
  }

  toggleUI() {
    if (this.radioRange.checked) {
      this.rangeContainer.classList.add('active');
    } else {
      this.rangeContainer.classList.remove('active');
    }
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
      alert('Error reading PDF: ' + e.message);
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
    
    // Convert to 0-indexed and filter valid ranges
    return Array.from(pages)
      .filter(p => p >= 1 && p <= maxPages)
      .map(p => p - 1)
      .sort((a, b) => a - b);
  }

  async execute() {
    if (!this.currentPdfDoc) return;
    
    this.btnExecute.disabled = true;
    const originalBtnText = this.btnExecute.innerHTML;
    this.btnExecute.innerHTML = 'Processing...';

    try {
      if (this.radioRange.checked) {
        // Extract Range
        const rawRange = this.rangeInput.value;
        const pageIndices = this.parseRange(rawRange, this.totalPages);
        
        if (pageIndices.length === 0) {
          alert('Please enter a valid page range.');
          return;
        }

        const newPdf = await window.PDFLib.PDFDocument.create();
        const copiedPages = await newPdf.copyPages(this.currentPdfDoc, pageIndices);
        copiedPages.forEach(page => newPdf.addPage(page));

        const pdfBytes = await newPdf.save();
        this.download(pdfBytes, `split-${this.currentFile.name}`, 'application/pdf');

      } else {
        // Split Every Page -> ZIP
        if (!window.JSZip) {
          alert('JSZip library not loaded.');
          return;
        }

        const zip = new window.JSZip();
        
        for (let i = 0; i < this.totalPages; i++) {
          const newPdf = await window.PDFLib.PDFDocument.create();
          const [copiedPage] = await newPdf.copyPages(this.currentPdfDoc, [i]);
          newPdf.addPage(copiedPage);
          const pdfBytes = await newPdf.save();
          
          // e.g. document_page_1.pdf
          const baseName = this.currentFile.name.replace(/\.[^/.]+$/, "");
          zip.file(`${baseName}_page_${i + 1}.pdf`, pdfBytes);
        }

        this.btnExecute.innerHTML = 'Zipping...';
        const zipBlob = await zip.generateAsync({ type: 'blob' });
        this.downloadBlob(zipBlob, `split-${this.currentFile.name}.zip`);
      }
    } catch (e) {
      console.error(e);
      alert('Error during split: ' + e.message);
    } finally {
      this.btnExecute.disabled = false;
      this.btnExecute.innerHTML = originalBtnText;
    }
  }

  download(uint8Array, filename, type) {
    const blob = new Blob([uint8Array], { type });
    this.downloadBlob(blob, filename);
  }

  downloadBlob(blob, filename) {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  }
}

document.addEventListener('DOMContentLoaded', () => {
  setTimeout(() => {
    window.pdfSplitter = new PdfSplitter();
  }, 300);
});