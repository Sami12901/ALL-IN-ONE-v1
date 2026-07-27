// PDF Compress Logic

// Configure PDF.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.16.105/pdf.worker.min.js';

class PdfCompressor {
  constructor() {
    this.uploadZone = document.getElementById('upload-zone');
    this.btnBrowse = document.getElementById('btn-browse');
    this.fileInput = document.getElementById('file-input');
    
    this.workspace = document.getElementById('workspace');
    this.uiFilename = document.getElementById('ui-filename');
    this.uiSize = document.getElementById('ui-size');
    this.btnChange = document.getElementById('btn-change');
    
    this.slider = document.getElementById('quality-slider');
    this.qualityVal = document.getElementById('quality-val');
    this.btnExecute = document.getElementById('btn-execute');
    
    this.progressContainer = document.getElementById('progress-bar-container');
    this.progressBar = document.getElementById('progress-bar');
    this.statusText = document.getElementById('status-text');

    this.currentFile = null;
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
      this.uploadZone.style.display = 'block';
      this.workspace.style.display = 'none';
      this.progressContainer.style.display = 'none';
      this.statusText.textContent = '';
      this.progressBar.style.width = '0%';
    });

    this.slider.addEventListener('input', () => {
      this.qualityVal.textContent = this.slider.value + '%';
    });

    this.btnExecute.addEventListener('click', () => this.compress());
  }

  formatBytes(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024, sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  handleFile(file) {
    if (!file || file.type !== 'application/pdf') {
      alert('Please select a valid PDF file.');
      return;
    }
    this.currentFile = file;
    this.uploadZone.style.display = 'none';
    this.workspace.style.display = 'block';
    this.uiFilename.textContent = file.name;
    this.uiSize.textContent = this.formatBytes(file.size);
  }

  async compress() {
    if (!this.currentFile) return;
    
    this.btnExecute.disabled = true;
    this.btnChange.disabled = true;
    this.progressContainer.style.display = 'block';
    
    const quality = parseInt(this.slider.value, 10) / 100;

    try {
      this.updateProgress(5, 'Reading PDF...');
      const arrayBuffer = await this.currentFile.arrayBuffer();
      
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      const totalPages = pdf.numPages;
      
      const newPdf = await window.PDFLib.PDFDocument.create();
      
      for (let i = 1; i <= totalPages; i++) {
        this.updateProgress(10 + ((i / totalPages) * 70), `Processing page ${i} of ${totalPages}...`);
        
        const page = await pdf.getPage(i);
        const viewport = page.getViewport({ scale: 1.5 }); // 1.5 scale is a good balance for reading vs size
        
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        canvas.width = viewport.width;
        canvas.height = viewport.height;
        
        await page.render({ canvasContext: ctx, viewport: viewport }).promise;
        
        const jpegDataUrl = canvas.toDataURL('image/jpeg', quality);
        
        const jpegImage = await newPdf.embedJpg(jpegDataUrl);
        const newPage = newPdf.addPage([viewport.width, viewport.height]);
        newPage.drawImage(jpegImage, {
          x: 0,
          y: 0,
          width: viewport.width,
          height: viewport.height
        });
      }
      
      this.updateProgress(90, 'Saving compressed PDF...');
      const pdfBytes = await newPdf.save();
      
      this.updateProgress(100, 'Done!');
      
      // Calculate savings
      const oldSize = this.currentFile.size;
      const newSize = pdfBytes.byteLength;
      const saved = Math.max(0, 100 - (newSize / oldSize * 100)).toFixed(1);
      
      this.statusText.textContent = `Completed! Saved ${saved}% (${this.formatBytes(newSize)})`;
      
      const blob = new Blob([pdfBytes], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `compressed-${this.currentFile.name}`;
      a.click();
      URL.revokeObjectURL(url);

    } catch (e) {
      console.error(e);
      alert('Error during compression: ' + e.message);
      this.statusText.textContent = 'Error occurred.';
    } finally {
      this.btnExecute.disabled = false;
      this.btnChange.disabled = false;
    }
  }

  updateProgress(percent, text) {
    this.progressBar.style.width = `${percent}%`;
    this.statusText.textContent = text;
  }
}

document.addEventListener('DOMContentLoaded', () => {
  setTimeout(() => window.pdfCompressor = new PdfCompressor(), 300);
});