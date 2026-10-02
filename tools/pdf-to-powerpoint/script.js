// PDF to PowerPoint Converter - Interactive Presentation Studio

if (window.pdfjsLib) {
  window.pdfjsLib.GlobalWorkerOptions.workerSrc = '../../assets/lib/pdf.worker.min.js';
}

class PdfToPowerPointApp {
  constructor() {
    this.uploadZone = document.getElementById('upload-zone');
    this.fileInput = document.getElementById('file-input');
    this.btnBrowse = document.getElementById('btn-browse');
    this.btnSample = document.getElementById('btn-sample');

    this.progressPanel = document.getElementById('progress-panel');
    this.progressTitle = document.getElementById('progress-title');
    this.progressStatus = document.getElementById('progress-status');
    this.progressBar = document.getElementById('progress-bar');
    this.progressPercent = document.getElementById('progress-percent');

    this.workspaceArea = document.getElementById('workspace-area');
    this.deckTitleInput = document.getElementById('deck-title');
    this.slideCountBadge = document.getElementById('slide-count-badge');
    this.slidesList = document.getElementById('slides-list');
    this.btnAddSlide = document.getElementById('btn-add-slide');

    this.tabVisualView = document.getElementById('tab-visual-view');
    this.tabContentView = document.getElementById('tab-content-view');
    this.visualContainer = document.getElementById('visual-container');
    this.contentContainer = document.getElementById('content-container');
    this.activeSlideImg = document.getElementById('active-slide-img');
    this.activeTitleInput = document.getElementById('active-title-input');
    this.activeBulletsEditor = document.getElementById('active-bullets-editor');
    this.activeSlideNotes = document.getElementById('active-slide-notes');

    this.btnFullscreenPresent = document.getElementById('btn-fullscreen-present');
    this.btnExportHtml = document.getElementById('btn-export-html');
    this.btnExportZip = document.getElementById('btn-export-zip');
    this.btnReset = document.getElementById('btn-reset');

    // Presentation Modal elements
    this.presentationModal = document.getElementById('presentation-modal');
    this.presentSlideImg = document.getElementById('present-slide-img');
    this.presentCounter = document.getElementById('present-counter');
    this.presentPrev = document.getElementById('present-prev');
    this.presentNext = document.getElementById('present-next');
    this.presentClose = document.getElementById('present-close');

    this.slides = []; // Array of { id, pageNum, title, bullets: string[], notes: string, thumbnailUrl, fullImageUrl }
    this.activeSlideIndex = 0;
    this.presentIndex = 0;
    this.activeViewMode = 'visual'; // 'visual' or 'content'
    this.isProcessing = false;

    this.bindEvents();
  }

  bindEvents() {
    this.btnBrowse.addEventListener('click', (e) => {
      e.stopPropagation();
      this.fileInput.click();
    });

    this.uploadZone.addEventListener('click', () => {
      this.fileInput.click();
    });

    this.fileInput.addEventListener('change', (e) => {
      if (e.target.files && e.target.files[0]) {
        this.processFile(e.target.files[0]);
      }
    });

    // Drag and drop
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
      if (e.dataTransfer.files && e.dataTransfer.files[0]) {
        const file = e.dataTransfer.files[0];
        if (file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf')) {
          this.processFile(file);
        } else {
          alert('Please select a valid PDF file (.pdf).');
        }
      }
    });

    this.btnSample.addEventListener('click', (e) => {
      e.stopPropagation();
      this.loadSampleDeck();
    });

    this.btnReset.addEventListener('click', () => {
      this.resetWorkspace();
    });

    this.btnAddSlide.addEventListener('click', () => {
      this.addBlankSlide();
    });

    // Stage view toggle
    this.tabVisualView.addEventListener('click', () => {
      this.setViewMode('visual');
    });

    this.tabContentView.addEventListener('click', () => {
      this.setViewMode('content');
    });

    // Active slide inputs sync
    this.activeTitleInput.addEventListener('input', (e) => {
      if (this.slides[this.activeSlideIndex]) {
        this.slides[this.activeSlideIndex].title = e.target.value;
        this.updateSlideCardTitle(this.activeSlideIndex, e.target.value);
      }
    });

    this.activeBulletsEditor.addEventListener('input', () => {
      if (this.slides[this.activeSlideIndex]) {
        const lis = Array.from(this.activeBulletsEditor.querySelectorAll('li')).map(li => li.innerText.trim());
        this.slides[this.activeSlideIndex].bullets = lis.length > 0 ? lis : [this.activeBulletsEditor.innerText.trim()];
      }
    });

    this.activeSlideNotes.addEventListener('input', (e) => {
      if (this.slides[this.activeSlideIndex]) {
        this.slides[this.activeSlideIndex].notes = e.target.value;
      }
    });

    // Fullscreen presentation
    this.btnFullscreenPresent.addEventListener('click', () => {
      this.startPresentation();
    });

    this.presentClose.addEventListener('click', () => {
      this.stopPresentation();
    });

    this.presentPrev.addEventListener('click', () => {
      this.navigatePresentation(-1);
    });

    this.presentNext.addEventListener('click', () => {
      this.navigatePresentation(1);
    });

    document.addEventListener('keydown', (e) => {
      if (this.presentationModal.classList.contains('active')) {
        if (e.key === 'ArrowRight' || e.key === ' ' || e.key === 'PageDown') {
          e.preventDefault();
          this.navigatePresentation(1);
        } else if (e.key === 'ArrowLeft' || e.key === 'PageUp') {
          e.preventDefault();
          this.navigatePresentation(-1);
        } else if (e.key === 'Escape') {
          e.preventDefault();
          this.stopPresentation();
        }
      }
    });

    // Exports
    this.btnExportHtml.addEventListener('click', () => {
      this.exportHtmlDeck();
    });

    this.btnExportZip.addEventListener('click', () => {
      this.exportZipArchive();
    });
  }

  updateProgress(percent, title, status) {
    if (this.progressTitle && title) this.progressTitle.textContent = title;
    if (this.progressStatus && status) this.progressStatus.textContent = status;
    if (this.progressBar) this.progressBar.style.width = `${percent}%`;
    if (this.progressPercent) this.progressPercent.textContent = `${Math.round(percent)}%`;
  }

  showProgress() {
    this.uploadZone.style.display = 'none';
    this.workspaceArea.style.display = 'none';
    this.progressPanel.style.display = 'block';
  }

  showWorkspace() {
    this.progressPanel.style.display = 'none';
    this.uploadZone.style.display = 'none';
    this.workspaceArea.style.display = 'flex';
  }

  resetWorkspace() {
    this.fileInput.value = '';
    this.slides = [];
    this.activeSlideIndex = 0;
    this.progressPanel.style.display = 'none';
    this.workspaceArea.style.display = 'none';
    this.uploadZone.style.display = 'flex';
  }

  setViewMode(mode) {
    this.activeViewMode = mode;
    if (mode === 'visual') {
      this.tabVisualView.classList.add('active');
      this.tabContentView.classList.remove('active');
      this.visualContainer.style.display = 'flex';
      this.contentContainer.style.display = 'none';
    } else {
      this.tabVisualView.classList.remove('active');
      this.tabContentView.classList.add('active');
      this.visualContainer.style.display = 'none';
      this.contentContainer.style.display = 'flex';
    }
  }

  async processFile(file) {
    if (this.isProcessing) return;
    this.isProcessing = true;
    const cleanName = file.name.replace(/\.[^/.]+$/, '');
    this.deckTitleInput.value = cleanName;

    this.showProgress();
    this.updateProgress(10, 'Opening PDF Presentation...', 'Parsing document structure');

    try {
      if (!window.pdfjsLib) {
        throw new Error('PDF.js library is not available.');
      }

      const arrayBuffer = await file.arrayBuffer();
      const loadingTask = window.pdfjsLib.getDocument({ data: arrayBuffer });
      const pdf = await loadingTask.promise;

      const totalPages = pdf.numPages;
      this.slides = [];

      for (let pageNum = 1; pageNum <= totalPages; pageNum++) {
        const pageProgress = 15 + (pageNum / totalPages) * 75;
        this.updateProgress(pageProgress, `Rendering Slide ${pageNum} of ${totalPages}`, 'Generating high-definition slide canvas & extracting text...');

        const page = await pdf.getPage(pageNum);

        // Render full image (scale 1.5)
        const fullViewport = page.getViewport({ scale: 1.5 });
        const fullCanvas = document.createElement('canvas');
        fullCanvas.width = fullViewport.width;
        fullCanvas.height = fullViewport.height;
        const fullCtx = fullCanvas.getContext('2d');
        await page.render({ canvasContext: fullCtx, viewport: fullViewport }).promise;
        const fullDataUrl = fullCanvas.toDataURL('image/png');

        // Render thumbnail (scale 0.4)
        const thumbViewport = page.getViewport({ scale: 0.4 });
        const thumbCanvas = document.createElement('canvas');
        thumbCanvas.width = thumbViewport.width;
        thumbCanvas.height = thumbViewport.height;
        const thumbCtx = thumbCanvas.getContext('2d');
        await page.render({ canvasContext: thumbCtx, viewport: thumbViewport }).promise;
        const thumbDataUrl = thumbCanvas.toDataURL('image/jpeg', 0.85);

        // Extract text content for slide title & bullets
        const textContent = await page.getTextContent({ normalizeWhitespace: true });
        const { title, bullets } = this.extractSlideContent(textContent.items, pageNum);

        this.slides.push({
          id: 'slide_' + Math.random().toString(36).substr(2, 9),
          pageNum: pageNum,
          title: title,
          bullets: bullets,
          notes: `Speaker notes for slide ${pageNum}: Key takeaways and presentation cues.`,
          thumbnailUrl: thumbDataUrl,
          fullImageUrl: fullDataUrl
        });
      }

      this.updateProgress(100, 'Finalizing Slide Deck...', 'Preparing presentation workspace');

      setTimeout(() => {
        this.activeSlideIndex = 0;
        this.renderSlidesList();
        this.loadActiveSlide(0);
        this.showWorkspace();
        this.isProcessing = false;
      }, 300);

    } catch (err) {
      console.error(err);
      alert('Error parsing PDF slides: ' + err.message);
      this.resetWorkspace();
      this.isProcessing = false;
    }
  }

  extractSlideContent(items, pageNum) {
    if (!items || items.length === 0) {
      return {
        title: `Slide ${pageNum}`,
        bullets: ['Overview of slide contents and discussion points.']
      };
    }

    const validItems = items
      .filter(it => it.str && it.str.trim().length > 0)
      .map(it => {
        const t = it.transform;
        return {
          str: it.str.trim(),
          x: t[4],
          y: t[5],
          fontSize: Math.hypot(t[0], t[1]) || it.height || 12
        };
      });

    if (validItems.length === 0) {
      return {
        title: `Slide ${pageNum}`,
        bullets: ['Overview of slide contents.']
      };
    }

    // Cluster into lines by y descending
    const lineTolerance = 4.0;
    const sortedByY = [...validItems].sort((a, b) => b.y - a.y);
    const lines = [];
    let curLine = [];
    let curY = null;

    sortedByY.forEach(it => {
      if (curY === null || Math.abs(it.y - curY) <= lineTolerance) {
        curLine.push(it);
        curY = it.y;
      } else {
        if (curLine.length > 0) lines.push(curLine.sort((a, b) => a.x - b.x));
        curLine = [it];
        curY = it.y;
      }
    });
    if (curLine.length > 0) lines.push(curLine.sort((a, b) => a.x - b.x));

    if (lines.length === 0) {
      return { title: `Slide ${pageNum}`, bullets: [] };
    }

    // Detect slide title: largest font size on top
    let maxFontSize = 0;
    let titleIndex = 0;

    lines.forEach((line, idx) => {
      const avgSize = line.reduce((a, b) => a + b.fontSize, 0) / line.length;
      if (avgSize > maxFontSize && idx < 3) {
        maxFontSize = avgSize;
        titleIndex = idx;
      }
    });

    const title = lines[titleIndex].map(it => it.str).join(' ');

    // Remaining lines become bullets
    const bullets = [];
    lines.forEach((line, idx) => {
      if (idx === titleIndex) return;
      const text = line.map(it => it.str).join(' ').trim();
      const clean = text.replace(/^[•\-\*\d+\.]\s*/, '').trim();
      if (clean.length > 0) {
        bullets.push(clean);
      }
    });

    return {
      title: title || `Slide ${pageNum}`,
      bullets: bullets.length > 0 ? bullets : ['Key presentation topics and strategic points.']
    };
  }

  renderSlidesList() {
    this.slidesList.innerHTML = '';
    this.slideCountBadge.textContent = `${this.slides.length} Slide${this.slides.length === 1 ? '' : 's'}`;

    this.slides.forEach((slide, idx) => {
      const card = document.createElement('div');
      card.className = `slide-card ${idx === this.activeSlideIndex ? 'active' : ''}`;
      card.dataset.index = idx;

      card.innerHTML = `
        <div class="slide-card-header">
          <span>#${idx + 1}</span>
          <span style="max-width: 140px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;" class="card-title-text">${this.escapeHtml(slide.title)}</span>
        </div>
        <img src="${slide.thumbnailUrl}" class="slide-thumb-img" alt="Slide ${idx + 1}">
        <div class="slide-card-actions">
          <button type="button" class="mini-icon-btn btn-move-up" title="Move Up" ${idx === 0 ? 'disabled' : ''}>
            <svg viewBox="0 0 24 24" width="12" height="12" stroke="currentColor" stroke-width="2" fill="none"><polyline points="18 15 12 9 6 15"></polyline></svg>
          </button>
          <button type="button" class="mini-icon-btn btn-move-down" title="Move Down" ${idx === this.slides.length - 1 ? 'disabled' : ''}>
            <svg viewBox="0 0 24 24" width="12" height="12" stroke="currentColor" stroke-width="2" fill="none"><polyline points="6 9 12 15 18 9"></polyline></svg>
          </button>
          <button type="button" class="mini-icon-btn btn-duplicate" title="Duplicate Slide">
            <svg viewBox="0 0 24 24" width="12" height="12" stroke="currentColor" stroke-width="2" fill="none"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
          </button>
          <button type="button" class="mini-icon-btn danger btn-delete" title="Delete Slide">
            <svg viewBox="0 0 24 24" width="12" height="12" stroke="currentColor" stroke-width="2" fill="none"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
          </button>
        </div>
      `;

      card.addEventListener('click', (e) => {
        if (!e.target.closest('button')) {
          this.loadActiveSlide(idx);
        }
      });

      card.querySelector('.btn-move-up')?.addEventListener('click', (e) => {
        e.stopPropagation();
        this.moveSlide(idx, -1);
      });

      card.querySelector('.btn-move-down')?.addEventListener('click', (e) => {
        e.stopPropagation();
        this.moveSlide(idx, 1);
      });

      card.querySelector('.btn-duplicate')?.addEventListener('click', (e) => {
        e.stopPropagation();
        this.duplicateSlide(idx);
      });

      card.querySelector('.btn-delete')?.addEventListener('click', (e) => {
        e.stopPropagation();
        this.deleteSlide(idx);
      });

      this.slidesList.appendChild(card);
    });
  }

  updateSlideCardTitle(index, newTitle) {
    const card = this.slidesList.children[index];
    if (card) {
      const titleSpan = card.querySelector('.card-title-text');
      if (titleSpan) titleSpan.textContent = newTitle;
    }
  }

  loadActiveSlide(index) {
    if (!this.slides[index]) return;
    this.activeSlideIndex = index;

    // Highlight card
    Array.from(this.slidesList.children).forEach((c, idx) => {
      if (idx === index) c.classList.add('active');
      else c.classList.remove('active');
    });

    const slide = this.slides[index];

    // Load visual image
    this.activeSlideImg.src = slide.fullImageUrl;

    // Load content view
    this.activeTitleInput.value = slide.title;
    
    let bulletsHtml = '<ul>';
    slide.bullets.forEach(b => {
      bulletsHtml += `<li>${this.escapeHtml(b)}</li>`;
    });
    bulletsHtml += '</ul>';
    this.activeBulletsEditor.innerHTML = bulletsHtml;

    // Load notes
    this.activeSlideNotes.value = slide.notes || '';
  }

  moveSlide(index, offset) {
    const newIndex = index + offset;
    if (newIndex < 0 || newIndex >= this.slides.length) return;

    const item = this.slides.splice(index, 1)[0];
    this.slides.splice(newIndex, 0, item);

    this.activeSlideIndex = newIndex;
    this.renderSlidesList();
    this.loadActiveSlide(newIndex);
  }

  duplicateSlide(index) {
    const orig = this.slides[index];
    const clone = {
      ...orig,
      id: 'slide_' + Math.random().toString(36).substr(2, 9),
      title: `${orig.title} (Copy)`,
      notes: orig.notes
    };
    this.slides.splice(index + 1, 0, clone);
    this.activeSlideIndex = index + 1;
    this.renderSlidesList();
    this.loadActiveSlide(index + 1);
  }

  deleteSlide(index) {
    if (this.slides.length <= 1) {
      alert('Cannot delete the only slide in the deck.');
      return;
    }
    this.slides.splice(index, 1);
    this.activeSlideIndex = Math.min(this.activeSlideIndex, this.slides.length - 1);
    this.renderSlidesList();
    this.loadActiveSlide(this.activeSlideIndex);
  }

  addBlankSlide() {
    // Generate a clean 16:9 canvas
    const canvas = document.createElement('canvas');
    canvas.width = 960;
    canvas.height = 540;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(0, 0, 960, 540);
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 36px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('New Slide', 480, 250);
    ctx.font = '20px Inter, sans-serif';
    ctx.fillStyle = '#94a3b8';
    ctx.fillText('Click "Extracted Content" tab to edit slide details', 480, 300);

    const fullUrl = canvas.toDataURL('image/png');
    const thumbUrl = canvas.toDataURL('image/jpeg', 0.8);

    const newSlide = {
      id: 'slide_' + Math.random().toString(36).substr(2, 9),
      pageNum: this.slides.length + 1,
      title: 'New Slide',
      bullets: ['Discussion point 1', 'Discussion point 2', 'Next steps'],
      notes: '',
      thumbnailUrl: thumbUrl,
      fullImageUrl: fullUrl
    };

    this.slides.push(newSlide);
    this.activeSlideIndex = this.slides.length - 1;
    this.renderSlidesList();
    this.loadActiveSlide(this.activeSlideIndex);
  }

  startPresentation() {
    if (this.slides.length === 0) return;
    this.presentIndex = this.activeSlideIndex;
    this.updatePresentationSlide();
    this.presentationModal.classList.add('active');
  }

  stopPresentation() {
    this.presentationModal.classList.remove('active');
  }

  navigatePresentation(direction) {
    const nextIdx = this.presentIndex + direction;
    if (nextIdx >= 0 && nextIdx < this.slides.length) {
      this.presentIndex = nextIdx;
      this.updatePresentationSlide();
    }
  }

  updatePresentationSlide() {
    const slide = this.slides[this.presentIndex];
    if (slide) {
      this.presentSlideImg.src = slide.fullImageUrl;
      this.presentCounter.textContent = `Slide ${this.presentIndex + 1} of ${this.slides.length}`;
    }
  }

  exportHtmlDeck() {
    const deckTitle = this.deckTitleInput.value || 'Presentation-Deck';

    const slidesJson = JSON.stringify(this.slides.map(s => ({
      title: s.title,
      bullets: s.bullets,
      notes: s.notes,
      image: s.fullImageUrl
    })));

    const htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${this.escapeHtml(deckTitle)} - Presentation</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      background: #0f172a;
      color: #f8fafc;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      height: 100vh;
      overflow: hidden;
      display: flex;
      flex-direction: column;
    }
    header {
      padding: 0.75rem 1.5rem;
      background: #1e293b;
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-bottom: 1px solid #334155;
    }
    h1 { font-size: 1.1rem; font-weight: 600; color: #f97316; }
    .stage {
      flex: 1;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 1.5rem;
      position: relative;
    }
    .slide-img {
      max-width: 90vw;
      max-height: 80vh;
      object-fit: contain;
      box-shadow: 0 10px 40px rgba(0,0,0,0.6);
      border-radius: 8px;
    }
    .controls {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 1.5rem;
      padding: 1rem;
      background: #1e293b;
      border-top: 1px solid #334155;
    }
    button {
      background: #f97316;
      border: none;
      color: white;
      padding: 0.5rem 1.25rem;
      border-radius: 9999px;
      font-weight: 600;
      cursor: pointer;
      font-size: 0.9rem;
    }
    button:disabled { opacity: 0.4; cursor: not-allowed; }
    .notes-drawer {
      position: fixed;
      bottom: 70px;
      left: 50%;
      transform: translateX(-50%);
      background: rgba(15, 23, 42, 0.95);
      border: 1px solid #475569;
      border-radius: 8px;
      padding: 1rem;
      max-width: 600px;
      width: 90%;
      font-size: 0.9rem;
      color: #cbd5e1;
      display: none;
      box-shadow: 0 10px 30px rgba(0,0,0,0.5);
    }
  </style>
</head>
<body>
  <header>
    <h1>${this.escapeHtml(deckTitle)}</h1>
    <div id="slide-num">Slide 1 of 1</div>
  </header>
  <div class="stage">
    <img src="" alt="Slide" class="slide-img" id="current-slide">
    <div class="notes-drawer" id="notes-drawer"></div>
  </div>
  <div class="controls">
    <button id="btn-prev" onclick="changeSlide(-1)">&larr; Previous</button>
    <button onclick="toggleNotes()">Toggle Notes</button>
    <button id="btn-next" onclick="changeSlide(1)">Next &rarr;</button>
  </div>

  <script>
    const slides = ${slidesJson};
    let currentIdx = 0;

    function render() {
      const s = slides[currentIdx];
      document.getElementById('current-slide').src = s.image;
      document.getElementById('slide-num').textContent = 'Slide ' + (currentIdx + 1) + ' of ' + slides.length;
      document.getElementById('btn-prev').disabled = currentIdx === 0;
      document.getElementById('btn-next').disabled = currentIdx === slides.length - 1;
      document.getElementById('notes-drawer').textContent = s.notes || 'No notes for this slide.';
    }

    function changeSlide(dir) {
      const next = currentIdx + dir;
      if (next >= 0 && next < slides.length) {
        currentIdx = next;
        render();
      }
    }

    function toggleNotes() {
      const d = document.getElementById('notes-drawer');
      d.style.display = (d.style.display === 'block') ? 'none' : 'block';
    }

    document.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowRight' || e.key === ' ') changeSlide(1);
      if (e.key === 'ArrowLeft') changeSlide(-1);
    });

    render();
  </script>
</body>
</html>`;

    const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${deckTitle}-presentation.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(url), 4000);
  }

  async exportZipArchive() {
    if (!window.JSZip) {
      alert('JSZip library is missing. Exporting standalone HTML presentation instead.');
      this.exportHtmlDeck();
      return;
    }

    const deckTitle = this.deckTitleInput.value || 'Presentation-Deck';
    const zip = new window.JSZip();

    // Folder for slide images
    const imgFolder = zip.folder('slides');
    let notesText = `SPEAKER NOTES & TRANSCRIPT\nDeck Title: ${deckTitle}\nTotal Slides: ${this.slides.length}\n${'='.repeat(50)}\n\n`;

    this.slides.forEach((slide, idx) => {
      const num = idx + 1;
      // Convert data URL to binary for zip
      const base64Data = slide.fullImageUrl.replace(/^data:image\/png;base64,/, '');
      imgFolder.file(`slide_${num}.png`, base64Data, { base64: true });

      notesText += `[SLIDE ${num}: ${slide.title}]\n`;
      if (slide.bullets && slide.bullets.length > 0) {
        notesText += `Key Points:\n${slide.bullets.map(b => '  - ' + b).join('\n')}\n`;
      }
      notesText += `Speaker Notes:\n  ${slide.notes || '(None)'}\n\n${'-'.repeat(40)}\n\n`;
    });

    // Notes file
    zip.file('speaker_notes.txt', notesText);

    // Presentation JSON descriptor
    const presentationJson = JSON.stringify({
      title: deckTitle,
      totalSlides: this.slides.length,
      createdAt: new Date().toISOString(),
      slides: this.slides.map((s, i) => ({
        index: i + 1,
        title: s.title,
        bullets: s.bullets,
        notes: s.notes,
        imageFile: `slides/slide_${i + 1}.png`
      }))
    }, null, 2);

    zip.file('presentation.json', presentationJson);

    // OpenDocument / Presentation XML stub
    const presentationXml = `<?xml version="1.0" encoding="UTF-8"?>
<presentation-deck title="${this.escapeHtml(deckTitle)}" slides="${this.slides.length}">
${this.slides.map((s, i) => `  <slide id="${i + 1}" title="${this.escapeHtml(s.title)}">
    <bullets>
${s.bullets.map(b => `      <bullet>${this.escapeHtml(b)}</bullet>`).join('\n')}
    </bullets>
    <notes>${this.escapeHtml(s.notes)}</notes>
  </slide>`).join('\n')}
</presentation-deck>`;

    zip.file('presentation.xml', presentationXml);

    // Generate zip blob
    try {
      const content = await zip.generateAsync({ type: 'blob' });
      const url = URL.createObjectURL(content);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${deckTitle}-package.zip`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      setTimeout(() => URL.revokeObjectURL(url), 4000);
    } catch (err) {
      alert('Error creating zip package: ' + err.message);
    }
  }

  escapeHtml(str) {
    if (!str) return '';
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  loadSampleDeck() {
    this.deckTitleInput.value = 'AI-Transformation-Roadmap';
    this.slides = [];

    const sampleSlideConfigs = [
      {
        title: 'Executive AI Strategy 2026',
        subtitle: 'Driving Enterprise Value through Intelligent Systems',
        bullets: ['Modernize core enterprise workflows', 'Achieve client-side computational efficiency', 'Embed real-time predictive analytics'],
        color: '#1e3a8a'
      },
      {
        title: 'Key Operational Pillars',
        subtitle: 'Scalability, Security, & Observability',
        bullets: ['Zero-trust security perimeters for all data streams', 'Decentralized processing with web workers', 'Sub-millisecond latency SLA targets'],
        color: '#065f46'
      },
      {
        title: 'Implementation Roadmap',
        subtitle: 'Phased Multi-Quarter Execution',
        bullets: ['Q1: Platform refactoring & componentization', 'Q2: Pilot rollout across key operational hubs', 'Q3: Global general availability & scaling'],
        color: '#7c2d12'
      }
    ];

    sampleSlideConfigs.forEach((cfg, idx) => {
      const canvas = document.createElement('canvas');
      canvas.width = 960;
      canvas.height = 540;
      const ctx = canvas.getContext('2d');

      // Gradient background
      const grad = ctx.createLinearGradient(0, 0, 960, 540);
      grad.addColorStop(0, cfg.color);
      grad.addColorStop(1, '#0f172a');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, 960, 540);

      // Title & Subtitle
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 38px Inter, sans-serif';
      ctx.fillText(cfg.title, 60, 100);

      ctx.fillStyle = '#94a3b8';
      ctx.font = '20px Inter, sans-serif';
      ctx.fillText(cfg.subtitle, 60, 145);

      // Accent divider line
      ctx.fillStyle = '#f97316';
      ctx.fillRect(60, 175, 120, 4);

      // Bullets
      ctx.fillStyle = '#f8fafc';
      ctx.font = '22px Inter, sans-serif';
      cfg.bullets.forEach((b, bIdx) => {
        ctx.fillStyle = '#f97316';
        ctx.beginPath();
        ctx.arc(75, 240 + bIdx * 65, 6, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#f8fafc';
        ctx.fillText(b, 105, 248 + bIdx * 65);
      });

      const fullUrl = canvas.toDataURL('image/png');
      const thumbUrl = canvas.toDataURL('image/jpeg', 0.85);

      this.slides.push({
        id: 'slide_' + Math.random().toString(36).substr(2, 9),
        pageNum: idx + 1,
        title: cfg.title,
        bullets: cfg.bullets,
        notes: `Speaker note for ${cfg.title}: Emphasize high organizational impact and ROI.`,
        thumbnailUrl: thumbUrl,
        fullImageUrl: fullUrl
      });
    });

    this.activeSlideIndex = 0;
    this.renderSlidesList();
    this.loadActiveSlide(0);
    this.showWorkspace();
  }
}

// Initialize on DOM ready
document.addEventListener('DOMContentLoaded', () => {
  window.pdfToPowerPointApp = new PdfToPowerPointApp();
});