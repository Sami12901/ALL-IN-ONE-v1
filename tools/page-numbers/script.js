// Page Numbers Logic

class PageNumbers {
  constructor() {
    this.uploadZone = document.getElementById('upload-zone');
    this.btnBrowse = document.getElementById('btn-browse');
    this.fileInput = document.getElementById('file-input');
    
    this.workspace = document.getElementById('workspace');
    this.uiFilename = document.getElementById('ui-filename');
    this.btnChange = document.getElementById('btn-change');
    
    this.inPos = document.getElementById('pn-position');
    this.inFormat = document.getElementById('pn-format');
    this.inStart = document.getElementById('pn-start');
    this.inSize = document.getElementById('pn-size');
    
    this.btnExecute = document.getElementById('btn-execute');

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
  }

  async execute() {
    if (!this.currentFile) return;

    this.btnExecute.disabled = true;
    this.btnExecute.textContent = 'Processing...';

    try {
      const arrayBuffer = await this.currentFile.arrayBuffer();
      const pdfDoc = await window.PDFLib.PDFDocument.load(arrayBuffer);
      
      const helveticaFont = await pdfDoc.embedFont(window.PDFLib.StandardFonts.Helvetica);
      
      const pages = pdfDoc.getPages();
      const totalPages = pages.length;
      
      const pos = this.inPos.value;
      const format = this.inFormat.value;
      const startNum = parseInt(this.inStart.value, 10) || 1;
      const fontSize = parseInt(this.inSize.value, 10) || 12;

      pages.forEach((page, i) => {
        const currentNum = startNum + i;
        const textStr = format.replace('{n}', currentNum).replace('{total}', totalPages);
        
        const { width, height } = page.getSize();
        const textWidth = helveticaFont.widthOfTextAtSize(textStr, fontSize);
        
        let x = 0;
        let y = 0;
        const margin = 30; // 30 points from edge

        // Calculate Y
        if (pos.startsWith('top')) {
          y = height - margin - fontSize;
        } else {
          y = margin;
        }

        // Calculate X
        if (pos.endsWith('left')) {
          x = margin;
        } else if (pos.endsWith('right')) {
          x = width - margin - textWidth;
        } else {
          // center
          x = (width / 2) - (textWidth / 2);
        }

        page.drawText(textStr, {
          x: x,
          y: y,
          size: fontSize,
          font: helveticaFont,
          color: window.PDFLib.rgb(0, 0, 0),
        });
      });

      const pdfBytes = await pdfDoc.save();
      const blob = new Blob([pdfBytes], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      
      const a = document.createElement('a');
      a.href = url;
      a.download = `numbered-${this.currentFile.name}`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (e) {
      console.error(e);
      alert('Error saving PDF: ' + e.message);
    } finally {
      this.btnExecute.disabled = false;
      this.btnExecute.textContent = 'Add Page Numbers & Download';
    }
  }
}

document.addEventListener('DOMContentLoaded', () => {
  setTimeout(() => window.pageNumbers = new PageNumbers(), 300);
});