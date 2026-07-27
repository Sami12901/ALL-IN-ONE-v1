// Edit Metadata Logic

class EditMetadata {
  constructor() {
    this.uploadZone = document.getElementById('upload-zone');
    this.btnBrowse = document.getElementById('btn-browse');
    this.fileInput = document.getElementById('file-input');
    
    this.workspace = document.getElementById('workspace');
    this.uiFilename = document.getElementById('ui-filename');
    this.btnChange = document.getElementById('btn-change');
    
    this.inTitle = document.getElementById('meta-title');
    this.inAuthor = document.getElementById('meta-author');
    this.inSubject = document.getElementById('meta-subject');
    this.inKeywords = document.getElementById('meta-keywords');
    this.inCreator = document.getElementById('meta-creator');
    this.inProducer = document.getElementById('meta-producer');
    
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
      
      this.inTitle.value = '';
      this.inAuthor.value = '';
      this.inSubject.value = '';
      this.inKeywords.value = '';
      this.inCreator.value = '';
      this.inProducer.value = '';
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
      
      this.inTitle.value = this.currentPdfDoc.getTitle() || '';
      this.inAuthor.value = this.currentPdfDoc.getAuthor() || '';
      this.inSubject.value = this.currentPdfDoc.getSubject() || '';
      this.inKeywords.value = this.currentPdfDoc.getKeywords() || '';
      this.inCreator.value = this.currentPdfDoc.getCreator() || '';
      this.inProducer.value = this.currentPdfDoc.getProducer() || '';
      
    } catch (e) {
      alert('Error parsing PDF metadata: ' + e.message);
      this.btnChange.click();
    }
  }

  async execute() {
    if (!this.currentPdfDoc) return;

    this.btnExecute.disabled = true;
    this.btnExecute.textContent = 'Saving...';

    try {
      this.currentPdfDoc.setTitle(this.inTitle.value);
      this.currentPdfDoc.setAuthor(this.inAuthor.value);
      this.currentPdfDoc.setSubject(this.inSubject.value);
      this.currentPdfDoc.setKeywords(this.inKeywords.value.split(',').map(k => k.trim()));
      this.currentPdfDoc.setCreator(this.inCreator.value);
      this.currentPdfDoc.setProducer(this.inProducer.value);

      const pdfBytes = await this.currentPdfDoc.save();
      const blob = new Blob([pdfBytes], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      
      const a = document.createElement('a');
      a.href = url;
      a.download = `meta-${this.currentFile.name}`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (e) {
      console.error(e);
      alert('Error saving PDF: ' + e.message);
    } finally {
      this.btnExecute.disabled = false;
      this.btnExecute.textContent = 'Save Metadata & Download';
    }
  }
}

document.addEventListener('DOMContentLoaded', () => {
  setTimeout(() => window.editMetadata = new EditMetadata(), 300);
});