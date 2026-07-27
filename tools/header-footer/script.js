// Header & Footer Logic

class HeaderFooter {
  constructor() {
    this.uploadZone = document.getElementById('upload-zone');
    this.btnBrowse = document.getElementById('btn-browse');
    this.fileInput = document.getElementById('file-input');
    
    this.workspace = document.getElementById('workspace');
    this.uiFilename = document.getElementById('ui-filename');
    this.btnChange = document.getElementById('btn-change');
    
    this.inHeader = document.getElementById('hf-header');
    this.inFooter = document.getElementById('hf-footer');
    this.inAlign = document.getElementById('hf-align');
    this.inSize = document.getElementById('hf-size');
    
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

    const headerTxt = this.inHeader.value.trim();
    const footerTxt = this.inFooter.value.trim();
    
    if (!headerTxt && !footerTxt) {
      alert('Please enter text for either the header or the footer.');
      return;
    }

    this.btnExecute.disabled = true;
    this.btnExecute.textContent = 'Processing...';

    try {
      const arrayBuffer = await this.currentFile.arrayBuffer();
      const pdfDoc = await window.PDFLib.PDFDocument.load(arrayBuffer);
      
      const helveticaFont = await pdfDoc.embedFont(window.PDFLib.StandardFonts.Helvetica);
      
      const pages = pdfDoc.getPages();
      const align = this.inAlign.value;
      const fontSize = parseInt(this.inSize.value, 10) || 10;
      const margin = 30; // 30 points from edge

      pages.forEach((page) => {
        const { width, height } = page.getSize();
        
        // Draw Header
        if (headerTxt) {
          const w = helveticaFont.widthOfTextAtSize(headerTxt, fontSize);
          let x = margin;
          if (align === 'center') x = (width / 2) - (w / 2);
          else if (align === 'right') x = width - margin - w;
          
          page.drawText(headerTxt, {
            x: x,
            y: height - margin - fontSize,
            size: fontSize,
            font: helveticaFont,
            color: window.PDFLib.rgb(0.3, 0.3, 0.3), // Dark gray
          });
        }

        // Draw Footer
        if (footerTxt) {
          const w = helveticaFont.widthOfTextAtSize(footerTxt, fontSize);
          let x = margin;
          if (align === 'center') x = (width / 2) - (w / 2);
          else if (align === 'right') x = width - margin - w;
          
          page.drawText(footerTxt, {
            x: x,
            y: margin,
            size: fontSize,
            font: helveticaFont,
            color: window.PDFLib.rgb(0.3, 0.3, 0.3),
          });
        }
      });

      const pdfBytes = await pdfDoc.save();
      const blob = new Blob([pdfBytes], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      
      const a = document.createElement('a');
      a.href = url;
      a.download = `stamped-${this.currentFile.name}`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (e) {
      console.error(e);
      alert('Error saving PDF: ' + e.message);
    } finally {
      this.btnExecute.disabled = false;
      this.btnExecute.textContent = 'Apply Header/Footer';
    }
  }
}

document.addEventListener('DOMContentLoaded', () => {
  setTimeout(() => window.headerFooter = new HeaderFooter(), 300);
});