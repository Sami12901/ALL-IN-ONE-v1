// PDF Editor Pro Logic

class PdfEditor {
  constructor() {
    // UI Elements
    this.uploadBtn = document.getElementById('upload-btn');
    this.fileInput = document.getElementById('file-input');
    
    this.docContainer = document.getElementById('doc-container');
    this.emptyState = document.getElementById('empty-state');
    
    this.pdfCanvas = document.getElementById('pdf-canvas');
    this.overlayCanvas = document.getElementById('overlay-canvas');
    this.textLayer = document.getElementById('text-layer');
    
    this.ctx = this.pdfCanvas.getContext('2d');
    this.oCtx = this.overlayCanvas.getContext('2d');

    // Controls
    this.btnPrev = document.getElementById('btn-prev');
    this.btnNext = document.getElementById('btn-next');
    this.pageInfo = document.getElementById('page-info');
    
    this.toolButtons = document.querySelectorAll('.toolbar-btn[data-tool]');
    this.btnClearDraw = document.getElementById('btn-clear-draw');
    this.btnExport = document.getElementById('btn-export');

    // State
    this.currentTool = 'view';
    this.pdfDoc = null;
    this.pageNum = 1;
    this.pageRendering = false;
    this.pageNumPending = null;
    this.scale = 1.5;
    this.originalPdfBytes = null;
    this.fileName = 'document.pdf';

    // Edits State (Stored per page)
    // Structure: { pageNumber: { drawings: DataURL, texts: [ { text, x, y, size } ] } }
    this.edits = {}; 

    // Drawing State
    this.isDrawing = false;
    this.lastX = 0;
    this.lastY = 0;

    this.initPdfJs();
    this.bindEvents();
  }

  initPdfJs() {
    if (window.pdfjsLib) {
      // Set worker to CDN
      pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.16.105/pdf.worker.min.js';
    } else {
      console.error('PDF.js library not loaded');
    }
  }

  bindEvents() {
    // File Upload
    this.uploadBtn.addEventListener('click', () => this.fileInput.click());
    this.fileInput.addEventListener('change', (e) => this.handleFile(e));

    // Pagination
    this.btnPrev.addEventListener('click', () => this.changePage(-1));
    this.btnNext.addEventListener('click', () => this.changePage(1));

    // Tools
    this.toolButtons.forEach(btn => {
      btn.addEventListener('click', (e) => {
        this.toolButtons.forEach(b => b.classList.remove('active'));
        e.currentTarget.classList.add('active');
        this.currentTool = e.currentTarget.dataset.tool;
        this.updateCursor();
      });
    });

    this.btnClearDraw.addEventListener('click', () => {
      this.oCtx.clearRect(0, 0, this.overlayCanvas.width, this.overlayCanvas.height);
      this.textLayer.innerHTML = '';
      this.savePageState();
    });

    // Drawing Events on Overlay Canvas
    this.overlayCanvas.addEventListener('mousedown', (e) => this.startDraw(e));
    this.overlayCanvas.addEventListener('mousemove', (e) => this.draw(e));
    this.overlayCanvas.addEventListener('mouseup', () => this.stopDraw());
    this.overlayCanvas.addEventListener('mouseout', () => this.stopDraw());

    // Text Overlay
    this.overlayCanvas.addEventListener('click', (e) => {
      if (this.currentTool === 'text') {
        this.addTextInput(e.offsetX, e.offsetY);
      }
    });

    // Export
    this.btnExport.addEventListener('click', () => this.exportPdf());
  }

  updateCursor() {
    if (this.currentTool === 'view') {
      this.overlayCanvas.style.cursor = 'grab';
      this.overlayCanvas.style.pointerEvents = 'auto';
    } else if (this.currentTool === 'draw') {
      this.overlayCanvas.style.cursor = 'crosshair';
      this.overlayCanvas.style.pointerEvents = 'auto';
    } else if (this.currentTool === 'text') {
      this.overlayCanvas.style.cursor = 'text';
      this.overlayCanvas.style.pointerEvents = 'auto';
    }
  }

  async handleFile(e) {
    const file = e.target.files[0];
    if (!file) return;

    this.fileName = file.name;
    this.originalPdfBytes = await file.arrayBuffer();

    const loadingTask = pdfjsLib.getDocument({ data: this.originalPdfBytes });
    
    try {
      this.pdfDoc = await loadingTask.promise;
      this.emptyState.style.display = 'none';
      this.docContainer.style.display = 'block';
      this.btnExport.disabled = false;
      this.btnPrev.disabled = false;
      this.btnNext.disabled = false;
      this.pageNum = 1;
      this.edits = {}; // reset edits
      this.renderPage(this.pageNum);
    } catch (err) {
      console.error(err);
      alert('Error loading PDF: ' + err.message);
    }
  }

  savePageState() {
    if (!this.pdfDoc) return;
    
    // Save Drawing as Image
    const drawingData = this.overlayCanvas.toDataURL('image/png');
    
    // Save Text Elements
    const texts = [];
    const textInputs = this.textLayer.querySelectorAll('textarea');
    textInputs.forEach(ta => {
      if (ta.value.trim() !== '') {
        texts.push({
          text: ta.value,
          x: parseFloat(ta.style.left),
          y: parseFloat(ta.style.top),
          width: ta.clientWidth,
          height: ta.clientHeight,
          fontSize: 16 // hardcoded for now
        });
      }
    });

    this.edits[this.pageNum] = {
      drawings: drawingData,
      texts: texts
    };
  }

  loadPageState() {
    // Clear current canvas
    this.oCtx.clearRect(0, 0, this.overlayCanvas.width, this.overlayCanvas.height);
    this.textLayer.innerHTML = '';

    const state = this.edits[this.pageNum];
    if (state) {
      // Load drawing
      if (state.drawings) {
        const img = new Image();
        img.onload = () => {
          this.oCtx.drawImage(img, 0, 0);
        };
        img.src = state.drawings;
      }

      // Load Text
      if (state.texts) {
        state.texts.forEach(t => {
          this.createTextArea(t.x, t.y, t.text, t.width, t.height);
        });
      }
    }
  }

  changePage(offset) {
    if (this.pageNum + offset < 1 || this.pageNum + offset > this.pdfDoc.numPages) return;
    this.savePageState(); // save current before navigating away
    this.pageNum += offset;
    this.queueRenderPage(this.pageNum);
  }

  queueRenderPage(num) {
    if (this.pageRendering) {
      this.pageNumPending = num;
    } else {
      this.renderPage(num);
    }
  }

  async renderPage(num) {
    this.pageRendering = true;
    
    try {
      const page = await this.pdfDoc.getPage(num);
      const viewport = page.getViewport({ scale: this.scale });

      // Match canvas size to PDF page
      this.pdfCanvas.height = viewport.height;
      this.pdfCanvas.width = viewport.width;
      
      this.overlayCanvas.height = viewport.height;
      this.overlayCanvas.width = viewport.width;

      const renderContext = {
        canvasContext: this.ctx,
        viewport: viewport
      };

      await page.render(renderContext).promise;
      this.pageRendering = false;

      // Update UI
      this.pageInfo.textContent = `${num} / ${this.pdfDoc.numPages}`;

      // Load edits for this new page
      this.loadPageState();

      if (this.pageNumPending !== null) {
        this.renderPage(this.pageNumPending);
        this.pageNumPending = null;
      }
    } catch(err) {
      console.error(err);
      this.pageRendering = false;
    }
  }

  // --- DRAWING LOGIC ---

  startDraw(e) {
    if (this.currentTool !== 'draw') return;
    this.isDrawing = true;
    this.lastX = e.offsetX;
    this.lastY = e.offsetY;
  }

  draw(e) {
    if (!this.isDrawing || this.currentTool !== 'draw') return;
    
    this.oCtx.beginPath();
    this.oCtx.moveTo(this.lastX, this.lastY);
    this.oCtx.lineTo(e.offsetX, e.offsetY);
    this.oCtx.strokeStyle = 'blue';
    this.oCtx.lineWidth = 2;
    this.oCtx.lineCap = 'round';
    this.oCtx.stroke();
    
    this.lastX = e.offsetX;
    this.lastY = e.offsetY;
  }

  stopDraw() {
    if (this.isDrawing) {
      this.isDrawing = false;
      this.savePageState();
    }
  }

  // --- TEXT LOGIC ---

  addTextInput(x, y) {
    this.createTextArea(x, y, '');
    this.savePageState();
  }

  createTextArea(x, y, value, w = null, h = null) {
    const ta = document.createElement('textarea');
    ta.className = 'floating-text-input';
    ta.style.left = x + 'px';
    ta.style.top = y + 'px';
    ta.value = value;
    if (w) ta.style.width = w + 'px';
    if (h) ta.style.height = h + 'px';
    
    ta.style.pointerEvents = 'auto';
    
    // Auto resize height based on content
    ta.addEventListener('input', function() {
      this.style.height = 'auto';
      this.style.height = (this.scrollHeight) + 'px';
    });

    ta.addEventListener('blur', () => this.savePageState());

    this.textLayer.appendChild(ta);
    if (!value) ta.focus(); // focus if new
  }

  // --- EXPORT LOGIC ---

  async exportPdf() {
    if (!this.originalPdfBytes || !window.PDFLib) return;
    
    this.btnExport.textContent = 'Processing...';
    this.btnExport.disabled = true;

    this.savePageState(); // Ensure current page is saved

    try {
      const { PDFDocument, rgb } = window.PDFLib;
      
      // Load original PDF
      const pdfDoc = await PDFDocument.load(this.originalPdfBytes);
      const pages = pdfDoc.getPages();

      // For every page that has edits
      for (let i = 0; i < pages.length; i++) {
        const pageNum = i + 1;
        const page = pages[i];
        const state = this.edits[pageNum];

        if (state) {
          // 1. Embed Drawing Overlay
          if (state.drawings) {
            const pngImageBytes = await fetch(state.drawings).then((res) => res.arrayBuffer());
            const pngImage = await pdfDoc.embedPng(pngImageBytes);
            
            // Draw image full size over the page. 
            // Note: pdf-lib uses coordinate system from bottom-left!
            page.drawImage(pngImage, {
              x: 0,
              y: 0,
              width: page.getWidth(),
              height: page.getHeight(),
            });
          }

          // 2. Embed Text
          // We need to map our top-left DOM coordinates to pdf-lib's bottom-left coordinates
          if (state.texts && state.texts.length > 0) {
            // Get standard font
            const helveticaFont = await pdfDoc.embedFont(window.PDFLib.StandardFonts.Helvetica);
            
            const pdfHeight = page.getHeight();
            // We need the scale ratio to map HTML Canvas pixels to PDF points
            // `this.scale` was used to render the canvas, so Canvas Width = PDF Width * scale
            // Thus, PDF Point = HTML Pixel / scale
            
            for (const t of state.texts) {
              const pdfX = t.x / this.scale;
              // Y is inverted (from bottom)
              const pdfY = pdfHeight - (t.y / this.scale) - (t.fontSize / this.scale); 
              
              page.drawText(t.text, {
                x: pdfX,
                y: pdfY,
                size: 16 / this.scale,
                font: helveticaFont,
                color: rgb(0, 0, 0),
                lineHeight: 18 / this.scale
              });
            }
          }
        }
      }

      // Serialize and download
      const pdfBytes = await pdfDoc.save();
      const blob = new Blob([pdfBytes], { type: "application/pdf" });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = this.fileName.replace('.pdf', '-edited.pdf');
      link.click();
      
    } catch (err) {
      console.error(err);
      alert('Error exporting PDF: ' + err.message);
    } finally {
      this.btnExport.innerHTML = '<svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" stroke-width="2" fill="none"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path><polyline points="17 21 17 13 7 13 7 21"></polyline><polyline points="7 3 7 8 15 8"></polyline></svg> Export PDF';
      this.btnExport.disabled = false;
    }
  }
}

// Wait for libs to load then init
document.addEventListener('DOMContentLoaded', () => {
  // Add a small delay to ensure CDNs are parsed
  setTimeout(() => {
    window.pdfEditor = new PdfEditor();
  }, 500);
});