// JPG to PDF Logic

class JpgToPdf {
  constructor() {
    this.uploadZone = document.getElementById('upload-zone');
    this.btnBrowse = document.getElementById('btn-browse');
    this.fileInput = document.getElementById('file-input');
    
    this.workspace = document.getElementById('workspace');
    this.fileListEl = document.getElementById('file-list');
    this.btnChange = document.getElementById('btn-change');
    this.btnExecute = document.getElementById('btn-execute');

    this.files = [];

    this.bindEvents();
  }

  bindEvents() {
    this.btnBrowse.addEventListener('click', () => this.fileInput.click());
    this.fileInput.addEventListener('change', (e) => this.handleFiles(e.target.files));

    this.uploadZone.addEventListener('dragover', (e) => { e.preventDefault(); this.uploadZone.classList.add('dragover'); });
    this.uploadZone.addEventListener('dragleave', () => this.uploadZone.classList.remove('dragover'));
    this.uploadZone.addEventListener('drop', (e) => {
      e.preventDefault();
      this.uploadZone.classList.remove('dragover');
      if (e.dataTransfer.files.length > 0) this.handleFiles(e.dataTransfer.files);
    });

    this.btnChange.addEventListener('click', () => {
      this.files = [];
      this.uploadZone.style.display = 'block';
      this.workspace.style.display = 'none';
      this.fileListEl.innerHTML = '';
      this.fileInput.value = '';
    });

    this.btnExecute.addEventListener('click', () => this.execute());
  }

  handleFiles(fileList) {
    const newFiles = Array.from(fileList).filter(f => f.type === 'image/jpeg' || f.type === 'image/jpg');
    if (newFiles.length === 0) {
      alert('Please select valid JPG images.');
      return;
    }
    
    this.files = [...this.files, ...newFiles];
    
    this.uploadZone.style.display = 'none';
    this.workspace.style.display = 'block';
    
    this.renderList();
  }
  
  removeFile(index) {
    this.files.splice(index, 1);
    if (this.files.length === 0) {
      this.btnChange.click();
    } else {
      this.renderList();
    }
  }

  renderList() {
    this.fileListEl.innerHTML = '';
    this.files.forEach((f, i) => {
      const el = document.createElement('div');
      el.className = 'file-item';
      
      const name = document.createElement('span');
      name.textContent = f.name;
      name.style.fontWeight = '600';
      name.style.overflow = 'hidden';
      name.style.textOverflow = 'ellipsis';
      name.style.whiteSpace = 'nowrap';
      
      const btn = document.createElement('button');
      btn.className = 'btn btn-secondary';
      btn.innerHTML = '&times;';
      btn.style.padding = '0.2rem 0.6rem';
      btn.onclick = () => this.removeFile(i);
      
      el.appendChild(name);
      el.appendChild(btn);
      this.fileListEl.appendChild(el);
    });
  }

  async execute() {
    if (this.files.length === 0) return;

    this.btnExecute.disabled = true;
    this.btnExecute.textContent = 'Converting...';

    try {
      const pdfDoc = await window.PDFLib.PDFDocument.create();
      
      for (let file of this.files) {
        const arrayBuffer = await file.arrayBuffer();
        const image = await pdfDoc.embedJpg(arrayBuffer);
        const { width, height } = image.scale(1);
        
        const page = pdfDoc.addPage([width, height]);
        page.drawImage(image, {
          x: 0,
          y: 0,
          width: width,
          height: height,
        });
      }

      const pdfBytes = await pdfDoc.save();
      const blob = new Blob([pdfBytes], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      
      const a = document.createElement('a');
      a.href = url;
      a.download = `images-to-pdf.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (e) {
      console.error(e);
      alert('Error saving PDF: ' + e.message);
    } finally {
      this.btnExecute.disabled = false;
      this.btnExecute.textContent = 'Convert to PDF & Download';
    }
  }
}

document.addEventListener('DOMContentLoaded', () => {
  setTimeout(() => window.jpgToPdf = new JpgToPdf(), 300);
});