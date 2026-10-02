// PDF to JPG / Image Converter Logic

// Configure PDF.js worker
if (window.pdfjsLib) {
  window.pdfjsLib.GlobalWorkerOptions.workerSrc = '../../assets/lib/pdf.worker.min.js';
}

class PdfToJpgApp {
  constructor() {
    this.uploadZone = document.getElementById('upload-zone');
    this.fileInput = document.getElementById('file-input');
    this.btnBrowse = document.getElementById('btn-browse');
    this.loadingState = document.getElementById('loading-state');
    this.loadingText = document.getElementById('loading-text');
    this.workspaceContent = document.getElementById('workspace-content');

    this.docName = document.getElementById('doc-name');
    this.docMeta = document.getElementById('doc-meta');
    this.btnChangeFile = document.getElementById('btn-change-file');

    this.selectFormat = document.getElementById('select-format');
    this.selectDpi = document.getElementById('select-dpi');
    this.radioRangeAll = document.getElementById('radio-range-all');
    this.radioRangeCustom = document.getElementById('radio-range-custom');
    this.rangeAllCount = document.getElementById('range-all-count');
    this.inputRangeCustom = document.getElementById('input-range-custom');
    this.btnStartConvert = document.getElementById('btn-start-convert');

    this.progressBox = document.getElementById('progress-box');
    this.progressStatus = document.getElementById('progress-status');
    this.progressPercent = document.getElementById('progress-percent');
    this.progressBarFill = document.getElementById('progress-bar-fill');

    this.galleryToolbar = document.getElementById('gallery-toolbar');
    this.galleryCount = document.getElementById('gallery-count');
    this.btnDownloadZip = document.getElementById('btn-download-zip');
    this.galleryGrid = document.getElementById('gallery-grid');

    // Lightbox elements
    this.lightboxModal = document.getElementById('lightbox-modal');
    this.lightboxImg = document.getElementById('lightbox-img');
    this.lightboxClose = document.getElementById('lightbox-close');

    // Internal state
    this.currentFile = null;
    this.pdfJsDoc = null;
    this.totalPages = 0;
    this.renderedImages = []; // { pageNumber, blob, url, width, height, format }
    this.isRendering = false;

    this.initEventListeners();
  }

  initEventListeners() {
    this.btnBrowse.addEventListener('click', () => this.fileInput.click());
    this.fileInput.addEventListener('change', (e) => {
      if (e.target.files && e.target.files[0]) {
        this.processFile(e.target.files[0]);
      }
    });

    ['dragenter', 'dragover'].forEach(name => {
      this.uploadZone.addEventListener(name, (e) => {
        e.preventDefault();
        e.stopPropagation();
        this.uploadZone.classList.add('dragover');
      });
    });

    ['dragleave', 'drop'].forEach(name => {
      this.uploadZone.addEventListener(name, (e) => {
        e.preventDefault();
        e.stopPropagation();
        this.uploadZone.classList.remove('dragover');
      });
    });

    this.uploadZone.addEventListener('drop', (e) => {
      const files = e.dataTransfer.files;
      if (files && files.length > 0) {
        this.processFile(files[0]);
      }
    });

    this.btnChangeFile.addEventListener('click', () => {
      this.cleanupRenderedImages();
      this.currentFile = null;
      this.pdfJsDoc = null;
      this.fileInput.value = '';
      this.workspaceContent.style.display = 'none';
      this.galleryToolbar.style.display = 'none';
      this.galleryGrid.innerHTML = '';
      this.uploadZone.style.display = 'block';
    });

    // Page range toggle
    this.radioRangeAll.addEventListener('change', () => {
      this.inputRangeCustom.style.display = 'none';
    });
    this.radioRangeCustom.addEventListener('change', () => {
      this.inputRangeCustom.style.display = 'block';
      this.inputRangeCustom.focus();
    });

    // Convert button
    this.btnStartConvert.addEventListener('click', () => this.startConversion());

    // Download ZIP
    this.btnDownloadZip.addEventListener('click', () => this.downloadAllAsZip());

    // Lightbox modal close
    this.lightboxClose.addEventListener('click', () => this.closeLightbox());
    this.lightboxModal.addEventListener('click', (e) => {
      if (e.target === this.lightboxModal) this.closeLightbox();
    });
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.lightboxModal.style.display === 'flex') {
        this.closeLightbox();
      }
    });
  }

  formatBytes(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  cleanupRenderedImages() {
    this.renderedImages.forEach(img => {
      if (img.url) URL.revokeObjectURL(img.url);
    });
    this.renderedImages = [];
  }

  async processFile(file) {
    if (!file || (file.type && file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf'))) {
      alert('Please select a valid PDF document.');
      return;
    }

    this.currentFile = file;
    this.uploadZone.style.display = 'none';
    this.loadingState.style.display = 'flex';
    this.loadingText.textContent = `Reading "${file.name}"...`;

    try {
      const arrayBuffer = await file.arrayBuffer();
      this.pdfJsDoc = await window.pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      this.totalPages = this.pdfJsDoc.numPages;

      this.docName.textContent = file.name;
      this.docMeta.textContent = `${this.formatBytes(file.size)} \u2022 ${this.totalPages} ${this.totalPages === 1 ? 'page' : 'pages'}`;
      this.rangeAllCount.textContent = this.totalPages;
      this.inputRangeCustom.placeholder = `e.g. 1-${Math.min(3, this.totalPages)}, ${this.totalPages}`;

      this.workspaceContent.style.display = 'flex';
      // Automatically run conversion on load
      await this.startConversion();
    } catch (err) {
      console.error('Error opening PDF document:', err);
      alert('Could not read PDF: ' + (err.message || 'Unknown error.'));
      this.btnChangeFile.click();
    } finally {
      this.loadingState.style.display = 'none';
    }
  }

  parsePageRange(rangeStr, maxPages) {
    if (!rangeStr || !rangeStr.trim()) return [];
    const pages = new Set();
    const parts = rangeStr.split(',');

    for (let part of parts) {
      part = part.trim();
      if (!part) continue;

      if (part.includes('-')) {
        const [startStr, endStr] = part.split('-');
        const start = parseInt(startStr, 10);
        const end = parseInt(endStr, 10);

        if (!isNaN(start) && !isNaN(end)) {
          const min = Math.max(1, Math.min(start, end));
          const max = Math.min(maxPages, Math.max(start, end));
          for (let p = min; p <= max; p++) {
            pages.add(p);
          }
        }
      } else {
        const p = parseInt(part, 10);
        if (!isNaN(p) && p >= 1 && p <= maxPages) {
          pages.add(p);
        }
      }
    }

    return Array.from(pages).sort((a, b) => a - b);
  }

  async startConversion() {
    if (!this.pdfJsDoc || this.isRendering) return;

    // Determine target pages
    let pagesToRender = [];
    if (this.radioRangeAll.checked) {
      for (let i = 1; i <= this.totalPages; i++) pagesToRender.push(i);
    } else {
      pagesToRender = this.parsePageRange(this.inputRangeCustom.value, this.totalPages);
      if (pagesToRender.length === 0) {
        alert(`Please specify a valid page range between 1 and ${this.totalPages} (e.g. 1-3, 5).`);
        return;
      }
    }

    this.isRendering = true;
    this.btnStartConvert.disabled = true;
    this.progressBox.style.display = 'flex';
    this.galleryToolbar.style.display = 'none';
    this.cleanupRenderedImages();
    this.galleryGrid.innerHTML = '';

    const format = this.selectFormat.value; // 'jpeg' or 'png'
    const mimeType = format === 'png' ? 'image/png' : 'image/jpeg';
    const ext = format === 'png' ? 'png' : 'jpg';
    const scale = parseFloat(this.selectDpi.value) || 2.08;

    const offCanvas = document.createElement('canvas');
    const offCtx = offCanvas.getContext('2d');

    const totalToRender = pagesToRender.length;

    try {
      for (let i = 0; i < totalToRender; i++) {
        const pageNum = pagesToRender[i];
        const pct = Math.round((i / totalToRender) * 100);
        this.progressBarFill.style.width = `${pct}%`;
        this.progressPercent.textContent = `${pct}%`;
        this.progressStatus.textContent = `Rendering page ${pageNum} (${i + 1} of ${totalToRender})...`;

        await new Promise(r => setTimeout(r, 10));

        const page = await this.pdfJsDoc.getPage(pageNum);
        const viewport = page.getViewport({ scale });

        offCanvas.width = viewport.width;
        offCanvas.height = viewport.height;

        // Fill white background for JPEGs to prevent black alpha transparent background
        if (format === 'jpeg') {
          offCtx.fillStyle = '#ffffff';
          offCtx.fillRect(0, 0, offCanvas.width, offCanvas.height);
        }

        await page.render({ canvasContext: offCtx, viewport }).promise;

        const blob = await new Promise(resolve => {
          offCanvas.toBlob(resolve, mimeType, 0.92);
        });

        const url = URL.createObjectURL(blob);
        const imgItem = {
          pageNumber: pageNum,
          blob: blob,
          url: url,
          width: Math.round(viewport.width),
          height: Math.round(viewport.height),
          format: ext,
          sizeBytes: blob.size
        };

        this.renderedImages.push(imgItem);
        this.renderGalleryCard(imgItem);
      }

      this.progressBarFill.style.width = '100%';
      this.progressPercent.textContent = '100%';
      this.progressStatus.textContent = `Completed! ${totalToRender} images rendered.`;

      this.galleryCount.textContent = this.renderedImages.length;
      this.galleryToolbar.style.display = 'flex';
    } catch (err) {
      console.error('Conversion failed:', err);
      alert('Error during conversion: ' + (err.message || 'Unknown error.'));
      this.progressStatus.textContent = 'Conversion stopped due to an error.';
    } finally {
      this.isRendering = false;
      this.btnStartConvert.disabled = false;
    }
  }

  renderGalleryCard(imgItem) {
    const card = document.createElement('div');
    card.className = 'gallery-card';

    // Thumbnail container
    const thumbWrapper = document.createElement('div');
    thumbWrapper.className = 'card-thumb-wrapper';
    thumbWrapper.title = `Click to zoom Page ${imgItem.pageNumber}`;

    const badge = document.createElement('span');
    badge.className = 'card-badge-page';
    badge.textContent = `Page ${imgItem.pageNumber}`;

    const img = document.createElement('img');
    img.src = imgItem.url;
    img.alt = `Page ${imgItem.pageNumber}`;
    img.loading = 'lazy';

    thumbWrapper.appendChild(img);
    thumbWrapper.appendChild(badge);

    thumbWrapper.addEventListener('click', () => {
      this.openLightbox(imgItem.url);
    });

    // Meta bar
    const metaBar = document.createElement('div');
    metaBar.className = 'card-meta-bar';

    const dimRow = document.createElement('div');
    dimRow.className = 'card-dimensions';
    dimRow.innerHTML = `
      <span>${imgItem.width} \u00d7 ${imgItem.height} px</span>
      <span>${this.formatBytes(imgItem.sizeBytes)}</span>
    `;

    const btnDownload = document.createElement('button');
    btnDownload.className = 'btn btn-secondary';
    btnDownload.style.width = '100%';
    btnDownload.style.padding = '0.5rem 0.85rem';
    btnDownload.style.fontSize = '0.85rem';
    btnDownload.innerHTML = `
      <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
        <polyline points="7 10 12 15 17 10"></polyline>
        <line x1="12" y1="15" x2="12" y2="3"></line>
      </svg>
      Download ${imgItem.format.toUpperCase()}
    `;

    btnDownload.addEventListener('click', (e) => {
      e.stopPropagation();
      this.downloadSingleImage(imgItem);
    });

    metaBar.appendChild(dimRow);
    metaBar.appendChild(btnDownload);

    card.appendChild(thumbWrapper);
    card.appendChild(metaBar);

    this.galleryGrid.appendChild(card);
  }

  downloadSingleImage(imgItem) {
    const baseName = this.currentFile.name.replace(/\.[^/.]+$/, '');
    const paddedNum = String(imgItem.pageNumber).padStart(3, '0');
    const filename = `${baseName}-page-${paddedNum}.${imgItem.format}`;

    const a = document.createElement('a');
    a.href = imgItem.url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  }

  async downloadAllAsZip() {
    if (!this.renderedImages.length) return;
    if (!window.JSZip) {
      alert('JSZip library is not loaded. Please reload the page.');
      return;
    }

    const baseName = this.currentFile.name.replace(/\.[^/.]+$/, '');
    this.btnDownloadZip.disabled = true;
    const originalText = this.btnDownloadZip.innerHTML;
    this.btnDownloadZip.innerHTML = `<span class="spinner" style="width:16px;height:16px;border-width:2px;display:inline-block;margin-right:6px;"></span> Packaging ZIP...`;

    try {
      const zip = new window.JSZip();

      for (const item of this.renderedImages) {
        const paddedNum = String(item.pageNumber).padStart(3, '0');
        const filename = `${baseName}-page-${paddedNum}.${item.format}`;
        zip.file(filename, item.blob);
      }

      const zipBlob = await zip.generateAsync({ type: 'blob' }, (metadata) => {
        if (metadata.percent) {
          this.btnDownloadZip.innerHTML = `<span class="spinner" style="width:16px;height:16px;border-width:2px;display:inline-block;margin-right:6px;"></span> Zipping ${Math.round(metadata.percent)}%...`;
        }
      });

      const downloadUrl = URL.createObjectURL(zipBlob);
      const a = document.createElement('a');
      a.href = downloadUrl;
      a.download = `${baseName}-images.zip`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(downloadUrl);
    } catch (err) {
      console.error('Failed to generate ZIP:', err);
      alert('Failed to create ZIP archive: ' + (err.message || 'Unknown error.'));
    } finally {
      this.btnDownloadZip.disabled = false;
      this.btnDownloadZip.innerHTML = originalText;
    }
  }

  openLightbox(url) {
    this.lightboxImg.src = url;
    this.lightboxModal.style.display = 'flex';
  }

  closeLightbox() {
    this.lightboxModal.style.display = 'none';
    this.lightboxImg.src = '';
  }
}

// Instantiate on DOM ready
document.addEventListener('DOMContentLoaded', () => {
  new PdfToJpgApp();
});