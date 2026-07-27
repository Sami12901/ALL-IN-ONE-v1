// Metadata Viewer Logic

class MetadataViewer {
  constructor() {
    this.uploadZone = document.getElementById('upload-zone');
    this.btnBrowse = document.getElementById('btn-browse');
    this.fileInput = document.getElementById('file-input');
    
    this.workspace = document.getElementById('workspace');
    this.uiFilename = document.getElementById('ui-filename');
    this.btnChange = document.getElementById('btn-change');
    
    this.metaDisplay = document.getElementById('meta-display');

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
      this.uploadZone.style.display = 'block';
      this.workspace.style.display = 'none';
      this.metaDisplay.innerHTML = '';
    });
  }

  async handleFile(file) {
    if (!file || file.type !== 'application/pdf') {
      alert('Please select a valid PDF file.');
      return;
    }
    
    this.uploadZone.style.display = 'none';
    this.workspace.style.display = 'block';
    this.uiFilename.textContent = file.name;
    this.metaDisplay.innerHTML = '<div style="color: var(--accent);">Reading Metadata...</div>';
    
    try {
      const arrayBuffer = await file.arrayBuffer();
      const pdfDoc = await window.PDFLib.PDFDocument.load(arrayBuffer);
      
      const data = [
        { label: 'Title', value: pdfDoc.getTitle() },
        { label: 'Author', value: pdfDoc.getAuthor() },
        { label: 'Subject', value: pdfDoc.getSubject() },
        { label: 'Keywords', value: pdfDoc.getKeywords() },
        { label: 'Creator', value: pdfDoc.getCreator() },
        { label: 'Producer', value: pdfDoc.getProducer() },
        { label: 'Creation Date', value: pdfDoc.getCreationDate() ? pdfDoc.getCreationDate().toISOString() : null },
        { label: 'Modify Date', value: pdfDoc.getModificationDate() ? pdfDoc.getModificationDate().toISOString() : null },
        { label: 'Page Count', value: pdfDoc.getPageCount() }
      ];

      this.metaDisplay.innerHTML = '';
      data.forEach(item => {
        const val = item.value || '-';
        this.metaDisplay.innerHTML += `
          <div class="meta-row">
            <div class="meta-label">${item.label}</div>
            <div class="meta-value">${val}</div>
          </div>
        `;
      });
      
    } catch (e) {
      alert('Error parsing PDF metadata: ' + e.message);
      this.btnChange.click();
    }
  }
}

document.addEventListener('DOMContentLoaded', () => {
  setTimeout(() => window.metadataViewer = new MetadataViewer(), 300);
});