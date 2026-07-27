// Extract Images Logic

pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.16.105/pdf.worker.min.js';

class ExtractImages {
  constructor() {
    this.uploadZone = document.getElementById('upload-zone');
    this.btnBrowse = document.getElementById('btn-browse');
    this.fileInput = document.getElementById('file-input');
    
    this.workspace = document.getElementById('workspace');
    this.uiFilename = document.getElementById('ui-filename');
    this.btnChange = document.getElementById('btn-change');
    
    this.btnExecute = document.getElementById('btn-execute');
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
      this.statusText.textContent = '';
    });

    this.btnExecute.addEventListener('click', () => this.execute());
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
    this.statusText.textContent = '';
  }

  async execute() {
    if (!this.currentFile) return;

    this.btnExecute.disabled = true;
    
    try {
      this.statusText.textContent = 'Parsing document...';
      const arrayBuffer = await this.currentFile.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      const totalPages = pdf.numPages;
      
      const zip = new JSZip();
      
      for (let i = 1; i <= totalPages; i++) {
        this.statusText.textContent = `Extracting high-res snapshot of page ${i} of ${totalPages}...`;
        
        const page = await pdf.getPage(i);
        // Use a high scale for "extraction" quality
        const viewport = page.getViewport({ scale: 2.5 });
        
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        canvas.width = viewport.width;
        canvas.height = viewport.height;
        
        await page.render({ canvasContext: ctx, viewport: viewport }).promise;
        
        // Remove 'data:image/jpeg;base64,' prefix for JSZip
        const dataUrl = canvas.toDataURL('image/jpeg', 0.9);
        const base64Data = dataUrl.split(',')[1];
        
        zip.file(`extracted-page-${i}.jpg`, base64Data, { base64: true });
      }
      
      this.statusText.textContent = 'Zipping files...';
      const zipBlob = await zip.generateAsync({ type: 'blob' });
      
      this.statusText.textContent = 'Done!';
      
      const a = document.createElement('a');
      a.href = URL.createObjectURL(zipBlob);
      a.download = `extracted-images.zip`;
      a.click();
      URL.revokeObjectURL(a.href);

    } catch (e) {
      console.error(e);
      alert('Error extracting images: ' + e.message);
      this.statusText.textContent = 'Error occurred.';
    } finally {
      this.btnExecute.disabled = false;
      this.btnExecute.textContent = 'Scan & Extract Images';
    }
  }
}

document.addEventListener('DOMContentLoaded', () => {
  setTimeout(() => window.extractImages = new ExtractImages(), 300);
});