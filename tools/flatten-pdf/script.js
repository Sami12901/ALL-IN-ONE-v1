// Flatten PDF Logic - 100% Client-side
/* global PDFLib */

class PdfFlattener {
  constructor() {
    this.uploadZone = document.getElementById('upload-zone');
    this.btnBrowse = document.getElementById('btn-browse');
    this.fileInput = document.getElementById('file-input');

    this.workspace = document.getElementById('workspace');
    this.uiFilename = document.getElementById('ui-filename');
    this.uiMeta = document.getElementById('ui-meta');
    this.btnChangeFile = document.getElementById('btn-change-file');

    this.uiStatusBadge = document.getElementById('ui-status-badge');
    this.countTotal = document.getElementById('count-total');
    this.countText = document.getElementById('count-text');
    this.countCheckbox = document.getElementById('count-checkbox');
    this.countRadio = document.getElementById('count-radio');
    this.countDropdown = document.getElementById('count-dropdown');
    this.countSignatures = document.getElementById('count-signatures');
    this.countAnnots = document.getElementById('count-annots');

    this.btnFlatten = document.getElementById('btn-flatten');
    this.btnFlattenText = document.getElementById('btn-flatten-text');

    this.successCard = document.getElementById('success-card');
    this.resOrigSize = document.getElementById('res-orig-size');
    this.resNewSize = document.getElementById('res-new-size');
    this.btnDownload = document.getElementById('btn-download');
    this.btnReset = document.getElementById('btn-reset');

    this.currentFile = null;
    this.fileBuffer = null;
    this.flattenedBlobUrl = null;
    this.downloadFileName = '';

    this.bindEvents();
  }

  bindEvents() {
    this.btnBrowse.addEventListener('click', () => this.fileInput.click());
    this.fileInput.addEventListener('change', (e) => {
      if (e.target.files && e.target.files[0]) {
        this.handleFile(e.target.files[0]);
      }
    });

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
      if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
        this.handleFile(e.dataTransfer.files[0]);
      }
    });

    this.btnChangeFile.addEventListener('click', () => this.reset());
    this.btnReset.addEventListener('click', () => this.reset());

    this.btnFlatten.addEventListener('click', () => this.executeFlatten());
    this.btnDownload.addEventListener('click', () => this.downloadFlattenedPdf());
  }

  formatBytes(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  async handleFile(file) {
    if (!file || file.type !== 'application/pdf') {
      alert('Please select a valid PDF file.');
      return;
    }

    this.currentFile = file;
    this.uiFilename.textContent = file.name;
    this.uiMeta.textContent = 'Inspecting document structure...';

    this.uploadZone.style.display = 'none';
    this.workspace.style.display = 'flex';
    this.successCard.style.display = 'none';
    this.btnFlatten.parentElement.style.display = 'flex';

    try {
      this.fileBuffer = await file.arrayBuffer();
      const pdfDoc = await PDFLib.PDFDocument.load(this.fileBuffer, { ignoreEncryption: true });
      const pages = pdfDoc.getPages();
      const pageCount = pages.length;

      this.uiMeta.textContent = `${pageCount} Page${pageCount !== 1 ? 's' : ''} • ${this.formatBytes(file.size)}`;

      // Inspect AcroForm
      let fields = [];
      try {
        const form = pdfDoc.getForm();
        fields = form.getFields();
      } catch (err) {
        console.log('No AcroForm structure found or empty form.');
      }

      let textCount = 0;
      let checkCount = 0;
      let radioCount = 0;
      let dropdownCount = 0;
      let sigCount = 0;

      for (const f of fields) {
        if (f instanceof PDFLib.PDFTextField) textCount++;
        else if (f instanceof PDFLib.PDFCheckBox) checkCount++;
        else if (f instanceof PDFLib.PDFRadioGroup) radioCount++;
        else if (f instanceof PDFLib.PDFDropdown || f instanceof PDFLib.PDFOptionList) dropdownCount++;
        else if (f instanceof PDFLib.PDFSignature) sigCount++;
        else textCount++; // other generic field types
      }

      // Inspect Page Annotations
      let annotCount = 0;
      for (const p of pages) {
        try {
          const annots = p.node.Annots();
          if (annots) {
            annotCount += annots.size();
          }
        } catch (e) {}
      }

      this.countTotal.textContent = fields.length;
      this.countText.textContent = textCount;
      this.countCheckbox.textContent = checkCount;
      this.countRadio.textContent = radioCount;
      this.countDropdown.textContent = dropdownCount;
      this.countSignatures.textContent = sigCount;
      this.countAnnots.textContent = annotCount;

      if (fields.length > 0 || annotCount > 0) {
        this.uiStatusBadge.textContent = `${fields.length + annotCount} Interactive Elements Detected`;
        this.uiStatusBadge.style.background = 'rgba(245, 158, 11, 0.15)';
        this.uiStatusBadge.style.color = '#fbbf24';
      } else {
        this.uiStatusBadge.textContent = 'Document is Already Static';
        this.uiStatusBadge.style.background = 'rgba(16, 185, 129, 0.15)';
        this.uiStatusBadge.style.color = '#34d399';
      }

    } catch (e) {
      console.error(e);
      alert('Error parsing PDF: ' + e.message);
      this.reset();
    }
  }

  async executeFlatten() {
    if (!this.fileBuffer) return;

    this.btnFlatten.disabled = true;
    this.btnFlattenText.textContent = 'Flattening & Baking Vector Elements...';

    try {
      const pdfDoc = await PDFLib.PDFDocument.load(this.fileBuffer, { ignoreEncryption: true });

      // Flatten AcroForm fields
      try {
        const form = pdfDoc.getForm();
        form.flatten();
      } catch (formErr) {
        console.warn('Form flatten notice:', formErr);
      }

      // Convert or remove remaining interactive widget annotations across pages
      const pages = pdfDoc.getPages();
      for (const page of pages) {
        try {
          const annots = page.node.Annots();
          if (annots) {
            // Keep non-widget visual annotations or clear interactive widgets
            const keep = [];
            for (let i = 0; i < annots.size(); i++) {
              const annot = annots.lookup(i, PDFLib.PDFDict);
              const subtype = annot ? annot.get(PDFLib.PDFName.of('Subtype')) : null;
              // If Subtype is Widget, it has been flattened or should be removed
              if (subtype && subtype.toString() === '/Widget') {
                continue;
              }
              keep.push(annots.get(i));
            }
            if (keep.length !== annots.size()) {
              const newArray = pdfDoc.context.obj(keep);
              page.node.set(PDFLib.PDFName.of('Annots'), newArray);
            }
          }
        } catch (e) {}
      }

      const flattenedBytes = await pdfDoc.save({ useObjectStreams: false });
      
      const origSize = this.currentFile.size;
      const newSize = flattenedBytes.byteLength;

      this.resOrigSize.textContent = this.formatBytes(origSize);
      this.resNewSize.textContent = this.formatBytes(newSize);

      if (this.flattenedBlobUrl) {
        URL.revokeObjectURL(this.flattenedBlobUrl);
      }
      const blob = new Blob([flattenedBytes], { type: 'application/pdf' });
      this.flattenedBlobUrl = URL.createObjectURL(blob);

      const baseName = this.currentFile.name.replace(/\.pdf$/i, '');
      this.downloadFileName = `${baseName}_flattened.pdf`;

      // Show Success State
      this.btnFlatten.parentElement.style.display = 'none';
      this.successCard.style.display = 'flex';

    } catch (e) {
      console.error(e);
      alert('Error flattening PDF: ' + e.message);
    } finally {
      this.btnFlatten.disabled = false;
      this.btnFlattenText.textContent = 'Flatten PDF Now';
    }
  }

  downloadFlattenedPdf() {
    if (!this.flattenedBlobUrl) return;
    const a = document.createElement('a');
    a.href = this.flattenedBlobUrl;
    a.download = this.downloadFileName || 'flattened_document.pdf';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  }

  reset() {
    if (this.flattenedBlobUrl) {
      URL.revokeObjectURL(this.flattenedBlobUrl);
      this.flattenedBlobUrl = null;
    }
    this.currentFile = null;
    this.fileBuffer = null;
    this.fileInput.value = '';
    this.workspace.style.display = 'none';
    this.uploadZone.style.display = 'block';
  }
}

document.addEventListener('DOMContentLoaded', () => {
  window.pdfFlattener = new PdfFlattener();
});