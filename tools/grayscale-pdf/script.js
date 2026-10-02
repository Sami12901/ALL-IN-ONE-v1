// Grayscale PDF Converter Logic - Monochrome Luminance Filter & Re-encoder

// Configure PDF.js worker
if (window.pdfjsLib) {
  window.pdfjsLib.GlobalWorkerOptions.workerSrc = '../../assets/lib/pdf.worker.min.js';
}

class GrayscalePdfApp {
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

    this.kpiColorInk = document.getElementById('kpi-color-ink');
    this.kpiInkSavings = document.getElementById('kpi-ink-savings');
    this.kpiLuminance = document.getElementById('kpi-luminance');
    this.kpiTotalPages = document.getElementById('kpi-total-pages');

    // Comparison slider elements
    this.compareBox = document.getElementById('compare-box');
    this.compareOverlay = document.getElementById('compare-overlay');
    this.sliderLine = document.getElementById('slider-line');
    this.sliderHandle = document.getElementById('slider-handle');
    this.canvasOriginal = document.getElementById('canvas-original');
    this.canvasGrayscale = document.getElementById('canvas-grayscale');

    // Page navigation
    this.btnPrevPage = document.getElementById('btn-prev-page');
    this.btnNextPage = document.getElementById('btn-next-page');
    this.previewPageIndicator = document.getElementById('preview-page-indicator');

    // Options
    this.selectGrayscaleMode = document.getElementById('select-grayscale-mode');
    this.selectResolution = document.getElementById('select-resolution');

    // Progress & Download
    this.progressBox = document.getElementById('progress-box');
    this.progressStatus = document.getElementById('progress-status');
    this.progressPercent = document.getElementById('progress-percent');
    this.progressBarFill = document.getElementById('progress-bar-fill');
    this.btnDownloadPdf = document.getElementById('btn-download-pdf');

    // State
    this.currentFile = null;
    this.pdfJsDoc = null;
    this.totalPages = 0;
    this.currentPage = 1;
    this.isDraggingSlider = false;
    this.isExporting = false;

    this.initEventListeners();
    this.initSliderEvents();
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
      this.currentFile = null;
      this.pdfJsDoc = null;
      this.fileInput.value = '';
      this.workspaceContent.style.display = 'none';
      this.uploadZone.style.display = 'block';
    });

    // Page navigation
    this.btnPrevPage.addEventListener('click', () => {
      if (this.currentPage > 1) {
        this.currentPage--;
        this.renderPreviewPage(this.currentPage);
      }
    });

    this.btnNextPage.addEventListener('click', () => {
      if (this.currentPage < this.totalPages) {
        this.currentPage++;
        this.renderPreviewPage(this.currentPage);
      }
    });

    // Grayscale profile change
    this.selectGrayscaleMode.addEventListener('change', () => {
      this.renderPreviewPage(this.currentPage);
    });

    // Export button
    this.btnDownloadPdf.addEventListener('click', () => this.exportGrayscalePdf());
  }

  initSliderEvents() {
    const updatePosition = (clientX) => {
      const rect = this.compareBox.getBoundingClientRect();
      let x = clientX - rect.left;
      x = Math.max(0, Math.min(x, rect.width));
      const pct = (x / rect.width) * 100;

      this.compareOverlay.style.width = `${pct}%`;
      this.sliderLine.style.left = `${pct}%`;
      this.syncCanvasWidths(rect.width);
    };

    const onPointerMove = (e) => {
      if (!this.isDraggingSlider) return;
      updatePosition(e.clientX || (e.touches && e.touches[0].clientX));
    };

    const stopDragging = () => {
      this.isDraggingSlider = false;
      window.removeEventListener('mousemove', onPointerMove);
      window.removeEventListener('mouseup', stopDragging);
      window.removeEventListener('touchmove', onPointerMove);
      window.removeEventListener('touchend', stopDragging);
    };

    const startDragging = (e) => {
      this.isDraggingSlider = true;
      updatePosition(e.clientX || (e.touches && e.touches[0].clientX));
      window.addEventListener('mousemove', onPointerMove);
      window.addEventListener('mouseup', stopDragging);
      window.addEventListener('touchmove', onPointerMove, { passive: false });
      window.addEventListener('touchend', stopDragging);
    };

    this.sliderHandle.addEventListener('mousedown', startDragging);
    this.sliderHandle.addEventListener('touchstart', startDragging, { passive: false });

    this.compareBox.addEventListener('click', (e) => {
      if (e.target !== this.sliderHandle) {
        updatePosition(e.clientX);
      }
    });

    // Window resize handler to maintain alignment
    window.addEventListener('resize', () => {
      if (this.compareBox) {
        const rect = this.compareBox.getBoundingClientRect();
        this.syncCanvasWidths(rect.width);
      }
    });
  }

  syncCanvasWidths(containerWidth) {
    if (this.canvasGrayscale && containerWidth > 0) {
      // Ensure the overlay canvas has the exact same display width as the parent container
      this.canvasGrayscale.style.width = `${containerWidth}px`;
    }
  }

  formatBytes(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  async processFile(file) {
    if (!file || (file.type && file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf'))) {
      alert('Please select a valid PDF document.');
      return;
    }

    this.currentFile = file;
    this.uploadZone.style.display = 'none';
    this.loadingState.style.display = 'flex';
    this.loadingText.textContent = `Loading "${file.name}"...`;

    try {
      const arrayBuffer = await file.arrayBuffer();
      this.pdfJsDoc = await window.pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      this.totalPages = this.pdfJsDoc.numPages;
      this.currentPage = 1;

      this.docName.textContent = file.name;
      this.docMeta.textContent = `${this.formatBytes(file.size)} \u2022 ${this.totalPages} ${this.totalPages === 1 ? 'page' : 'pages'}`;
      this.kpiTotalPages.textContent = this.totalPages;

      this.workspaceContent.style.display = 'flex';
      await this.renderPreviewPage(this.currentPage);
    } catch (err) {
      console.error('Failed to load PDF for grayscale conversion:', err);
      alert('Error loading PDF: ' + (err.message || 'Unknown error.'));
      this.btnChangeFile.click();
    } finally {
      this.loadingState.style.display = 'none';
    }
  }

  async renderPreviewPage(pageNumber) {
    if (!this.pdfJsDoc) return;

    this.previewPageIndicator.textContent = `Page ${pageNumber} of ${this.totalPages}`;
    this.btnPrevPage.disabled = pageNumber <= 1;
    this.btnNextPage.disabled = pageNumber >= this.totalPages;

    try {
      const page = await this.pdfJsDoc.getPage(pageNumber);
      const viewport = page.getViewport({ scale: 1.5 });

      // 1. Render original color page
      this.canvasOriginal.width = viewport.width;
      this.canvasOriginal.height = viewport.height;
      const ctxOrig = this.canvasOriginal.getContext('2d');
      await page.render({ canvasContext: ctxOrig, viewport }).promise;

      // 2. Prepare grayscale canvas
      this.canvasGrayscale.width = viewport.width;
      this.canvasGrayscale.height = viewport.height;
      const ctxGray = this.canvasGrayscale.getContext('2d');

      // Copy pixel data from original
      const imgData = ctxOrig.getImageData(0, 0, viewport.width, viewport.height);
      const data = imgData.data;
      const mode = this.selectGrayscaleMode.value;

      let totalLum = 0;
      let chromaSum = 0;
      const totalPixels = data.length / 4;

      for (let i = 0; i < data.length; i += 4) {
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];

        // Monochrome luminance filter: 0.299*R + 0.587*G + 0.114*B
        let gray = 0.299 * r + 0.587 * g + 0.114 * b;

        // Apply profile adjustments
        if (mode === 'high-contrast') {
          // Increase contrast with S-curve
          gray = ((gray - 128) * 1.35) + 128;
          gray = Math.max(0, Math.min(255, gray));
        } else if (mode === 'draft') {
          // Shift light grays to pure white to minimize toner
          if (gray > 210) gray = 255;
          else gray = gray * 1.1;
          gray = Math.max(0, Math.min(255, gray));
        }

        const intGray = Math.round(gray);
        data[i] = intGray;
        data[i + 1] = intGray;
        data[i + 2] = intGray;

        totalLum += intGray;
        const chroma = Math.max(r, g, b) - Math.min(r, g, b);
        chromaSum += chroma;
      }

      ctxGray.putImageData(imgData, 0, 0);

      // Metrics calculation
      const avgLumPercent = Math.round((totalLum / (totalPixels * 255)) * 100);
      const avgChroma = chromaSum / totalPixels;
      // If average chroma is high, color print was using lots of toner; monochrome saves significant costs
      const estimatedSavings = Math.min(48, Math.max(25, Math.round(25 + (avgChroma / 255) * 60)));

      this.kpiLuminance.textContent = `${avgLumPercent}%`;
      this.kpiInkSavings.textContent = `~${estimatedSavings}%`;

      // Sync display width
      const rect = this.compareBox.getBoundingClientRect();
      this.syncCanvasWidths(rect.width);
    } catch (err) {
      console.error('Error rendering preview page:', err);
    }
  }

  async exportGrayscalePdf() {
    if (!this.pdfJsDoc || this.isExporting) return;

    this.isExporting = true;
    this.btnDownloadPdf.disabled = true;
    this.progressBox.style.display = 'flex';
    this.progressBarFill.style.width = '0%';
    this.progressPercent.textContent = '0%';
    this.progressStatus.textContent = 'Initializing monochrome PDF encoder...';

    try {
      const newPdf = await window.PDFLib.PDFDocument.create();
      const scale = parseFloat(this.selectResolution.value) || 2.0;
      const mode = this.selectGrayscaleMode.value;

      const offCanvas = document.createElement('canvas');
      const offCtx = offCanvas.getContext('2d');

      for (let p = 1; p <= this.totalPages; p++) {
        const pct = Math.round(((p - 1) / this.totalPages) * 100);
        this.progressBarFill.style.width = `${pct}%`;
        this.progressPercent.textContent = `${pct}%`;
        this.progressStatus.textContent = `Converting page ${p} of ${this.totalPages}...`;

        // Yield to browser event loop
        await new Promise(r => setTimeout(r, 10));

        const page = await this.pdfJsDoc.getPage(p);
        const viewport = page.getViewport({ scale });

        offCanvas.width = viewport.width;
        offCanvas.height = viewport.height;

        await page.render({ canvasContext: offCtx, viewport }).promise;

        // Apply Monochrome luminance filter
        const imgData = offCtx.getImageData(0, 0, offCanvas.width, offCanvas.height);
        const data = imgData.data;

        for (let i = 0; i < data.length; i += 4) {
          const r = data[i];
          const g = data[i + 1];
          const b = data[i + 2];

          let gray = 0.299 * r + 0.587 * g + 0.114 * b;

          if (mode === 'high-contrast') {
            gray = ((gray - 128) * 1.35) + 128;
            gray = Math.max(0, Math.min(255, gray));
          } else if (mode === 'draft') {
            if (gray > 210) gray = 255;
            else gray = gray * 1.1;
            gray = Math.max(0, Math.min(255, gray));
          }

          const intGray = Math.round(gray);
          data[i] = intGray;
          data[i + 1] = intGray;
          data[i + 2] = intGray;
        }

        offCtx.putImageData(imgData, 0, 0);

        // Convert canvas to JPEG blob
        const blob = await new Promise(resolve => {
          offCanvas.toBlob(resolve, 'image/jpeg', 0.92);
        });
        const jpgBytes = await blob.arrayBuffer();

        // Embed in PDFLib document
        const embeddedImage = await newPdf.embedJpg(jpgBytes);
        // Original dimensions in points (viewport without scale)
        const unscaledViewport = page.getViewport({ scale: 1.0 });
        const newPage = newPdf.addPage([unscaledViewport.width, unscaledViewport.height]);
        newPage.drawImage(embeddedImage, {
          x: 0,
          y: 0,
          width: unscaledViewport.width,
          height: unscaledViewport.height
        });
      }

      this.progressBarFill.style.width = '100%';
      this.progressPercent.textContent = '100%';
      this.progressStatus.textContent = 'Finalizing PDF document...';

      const pdfBytes = await newPdf.save();
      const finalBlob = new Blob([pdfBytes], { type: 'application/pdf' });
      const downloadUrl = URL.createObjectURL(finalBlob);

      const baseName = this.currentFile.name.replace(/\.[^/.]+$/, '');
      const a = document.createElement('a');
      a.href = downloadUrl;
      a.download = `${baseName}-grayscale.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(downloadUrl);

      this.progressStatus.textContent = 'Conversion complete! Download started.';
    } catch (err) {
      console.error('Grayscale PDF export failed:', err);
      alert('Export failed: ' + (err.message || 'Unknown error'));
      this.progressStatus.textContent = 'Error during conversion.';
    } finally {
      this.isExporting = false;
      this.btnDownloadPdf.disabled = false;
    }
  }
}

// Instantiate on DOM ready
document.addEventListener('DOMContentLoaded', () => {
  new GrayscalePdfApp();
});