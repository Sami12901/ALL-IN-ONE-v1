// Remove Metadata Logic

class RemoveMetadata {
  constructor() {
    this.uploadZone = document.getElementById('upload-zone');
    this.btnBrowse = document.getElementById('btn-browse');
    this.fileInput = document.getElementById('file-input');
    
    this.workspace = document.getElementById('workspace');
    this.uiFilename = document.getElementById('ui-filename');
    this.btnChange = document.getElementById('btn-change');
    
    this.btnExecute = document.getElementById('btn-execute');

    this.currentFile = null;
    this.currentPdfDoc = null;

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
      this.currentPdfDoc = null;
      this.uploadZone.style.display = 'block';
      this.workspace.style.display = 'none';
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
    
    try {
      const arrayBuffer = await file.arrayBuffer();
      this.currentPdfDoc = await window.PDFLib.PDFDocument.load(arrayBuffer);
    } catch (e) {
      alert('Error parsing PDF: ' + e.message);
      this.btnChange.click();
    }
  }

  async execute() {
    if (!this.currentPdfDoc) return;

    this.btnExecute.disabled = true;
    this.btnExecute.textContent = 'Scrubbing...';

    try {
      this.currentPdfDoc.setTitle('');
      this.currentPdfDoc.setAuthor('');
      this.currentPdfDoc.setSubject('');
      this.currentPdfDoc.setKeywords([]);
      this.currentPdfDoc.setCreator('');
      this.currentPdfDoc.setProducer('');
      this.currentPdfDoc.setCreationDate(new Date(0));
      this.currentPdfDoc.setModificationDate(new Date(0));

      const pdfBytes = await this.currentPdfDoc.save();
      const blob = new Blob([pdfBytes], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      
      const a = document.createElement('a');
      a.href = url;
      a.download = `scrubbed-${this.currentFile.name}`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (e) {
      console.error(e);
      alert('Error scrubbing PDF: ' + e.message);
    } finally {
      this.btnExecute.disabled = false;
      this.btnExecute.textContent = 'Remove Metadata & Download';
    }
  }
}

document.addEventListener('DOMContentLoaded', () => {
  setTimeout(() => window.removeMetadata = new RemoveMetadata(), 300);
});