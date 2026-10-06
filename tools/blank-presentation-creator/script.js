// Blank Presentation Creator Studio Logic

const DEFAULT_DECK = {
  title: '2026 Enterprise Growth Roadmap',
  theme: 'theme-obsidian',
  slides: [
    {
      id: 'slide-1',
      layout: 'title',
      title: '2026 Enterprise Growth Roadmap',
      subtitle: 'Scaling Global Cloud Infrastructure & Accelerating Market Capture',
      bullets: [],
      col1: '',
      col2: '',
      statNum: '',
      statLabel: ''
    },
    {
      id: 'slide-2',
      layout: 'bullets',
      title: 'Strategic Priorities',
      subtitle: 'Key initiatives driving operational leverage across engineering & product',
      bullets: [
        'Deploy autonomous agentic workflows across core development pipelines',
        'Migrate remaining legacy services to multi-region Kubernetes clusters',
        'Deliver 99.995% SLA availability with sub-25ms global p99 latency',
        'Expand enterprise security compliance to ISO 27001 & FedRAMP High'
      ],
      col1: '',
      col2: '',
      statNum: '',
      statLabel: ''
    },
    {
      id: 'slide-3',
      layout: 'columns',
      title: 'Dual Execution Framework',
      subtitle: 'Aligning deep technology innovation with aggressive Go-to-Market velocity',
      bullets: [],
      col1: 'Engineering & Architecture:\n• Continuous microservices deployment\n• Automated chaos engineering tests\n• Unified developer telemetry portal\n• Zero-downtime database sharding',
      col2: 'GTM & Enterprise Adoption:\n• Dedicated Fortune 500 account teams\n• Self-serve enterprise onboarding\n• 134% Net Retention Rate (NDR)\n• Global sales hubs across EMEA & APAC',
      statNum: '',
      statLabel: ''
    },
    {
      id: 'slide-4',
      layout: 'stat',
      title: 'Financial Momentum',
      subtitle: 'Accelerating top-line ARR with top-decile capital efficiency',
      bullets: [],
      col1: '',
      col2: '',
      statNum: '$140M+',
      statLabel: 'Annual Recurring Revenue achieved with 84% software gross margin'
    },
    {
      id: 'slide-5',
      layout: 'title',
      title: 'Looking Ahead',
      subtitle: 'Building the next era of high-scale enterprise intelligence. Thank you!',
      bullets: [],
      col1: '',
      col2: '',
      statNum: '',
      statLabel: ''
    }
  ]
};

const STORAGE_KEY = 'aio_presentation_creator_deck';

document.addEventListener('DOMContentLoaded', () => {
  let deck = loadDeck();
  let currentSlideIdx = 0;
  let isPresenting = false;

  // UI Elements
  const deckTitleInput = document.getElementById('deck-title-input');
  const btnLoadSample = document.getElementById('btn-load-sample');
  const btnExportJson = document.getElementById('btn-export-json');
  const fileImportDeck = document.getElementById('file-import-deck');
  const btnStartPresent = document.getElementById('btn-start-present');
  const btnAddSlide = document.getElementById('btn-add-slide');
  const thumbsList = document.getElementById('thumbs-list');

  const selLayout = document.getElementById('sel-layout');
  const selTheme = document.getElementById('sel-theme');
  const slidePosLabel = document.getElementById('slide-position-label');
  const canvasViewport = document.getElementById('canvas-viewport');
  const slideCanvasContent = document.getElementById('slide-canvas-content');

  // Input groups
  const inpSlideTitle = document.getElementById('inp-slide-title');
  const inpSlideSubtitle = document.getElementById('inp-slide-subtitle');
  const groupSubtitle = document.getElementById('group-subtitle');
  const inpSlideBullets = document.getElementById('inp-slide-bullets');
  const groupBullets = document.getElementById('group-bullets');
  const inpCol1 = document.getElementById('inp-col1');
  const inpCol2 = document.getElementById('inp-col2');
  const groupColumns = document.getElementById('group-columns');
  const inpStatNum = document.getElementById('inp-stat-num');
  const inpStatLabel = document.getElementById('inp-stat-label');
  const groupStat = document.getElementById('group-stat');

  // Presenter Modal
  const presentModal = document.getElementById('present-modal');
  const presentSlideInner = document.getElementById('present-slide-inner');
  const hudPrev = document.getElementById('hud-prev');
  const hudNext = document.getElementById('hud-next');
  const hudCounter = document.getElementById('hud-counter');
  const hudExit = document.getElementById('hud-exit');

  function loadDeck() {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && Array.isArray(parsed.slides) && parsed.slides.length > 0) {
          return parsed;
        }
      }
    } catch (e) {
      console.warn('Could not read saved deck from localStorage:', e);
    }
    return JSON.parse(JSON.stringify(DEFAULT_DECK));
  }

  function saveDeck() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(deck));
    } catch (e) {
      console.error(e);
    }
  }

  function getCurrentSlide() {
    if (currentSlideIdx < 0) currentSlideIdx = 0;
    if (currentSlideIdx >= deck.slides.length) currentSlideIdx = deck.slides.length - 1;
    return deck.slides[currentSlideIdx];
  }

  // Render Thumbnails Drawer
  function renderThumbnails() {
    thumbsList.innerHTML = '';
    deck.slides.forEach((slide, idx) => {
      const item = document.createElement('div');
      item.className = `thumb-item ${idx === currentSlideIdx ? 'active' : ''}`;
      item.dataset.index = idx;

      item.innerHTML = `
        <div class="thumb-header">
          <span class="thumb-idx">#${idx + 1}</span>
          <div class="thumb-actions">
            <button type="button" class="thumb-btn-sm btn-dup" title="Duplicate slide">⧉</button>
            <button type="button" class="thumb-btn-sm btn-up" title="Move Up" ${idx === 0 ? 'disabled style="opacity:0.3;"' : ''}>↑</button>
            <button type="button" class="thumb-btn-sm btn-down" title="Move Down" ${idx === deck.slides.length - 1 ? 'disabled style="opacity:0.3;"' : ''}>↓</button>
            <button type="button" class="thumb-btn-sm btn-del" title="Delete slide" ${deck.slides.length <= 1 ? 'disabled style="opacity:0.3;"' : ''}>✕</button>
          </div>
        </div>
        <div class="thumb-preview-box">
          <strong style="white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 100%;">${escapeHtml(slide.title || 'Untitled')}</strong>
          <span style="font-size: 0.65rem; opacity: 0.7; margin-top: 0.2rem;">${slide.layout.toUpperCase()}</span>
        </div>
      `;

      // Select Slide
      item.addEventListener('click', (e) => {
        if (e.target.closest('button')) return;
        currentSlideIdx = idx;
        renderThumbnails();
        loadSlideIntoEditor();
      });

      // Actions
      item.querySelector('.btn-dup').addEventListener('click', () => {
        duplicateSlide(idx);
      });
      item.querySelector('.btn-up').addEventListener('click', () => {
        moveSlide(idx, idx - 1);
      });
      item.querySelector('.btn-down').addEventListener('click', () => {
        moveSlide(idx, idx + 1);
      });
      item.querySelector('.btn-del').addEventListener('click', () => {
        deleteSlide(idx);
      });

      thumbsList.appendChild(item);
    });

    slidePosLabel.textContent = `Slide ${currentSlideIdx + 1} of ${deck.slides.length}`;
  }

  // Load Active Slide into Canvas & Editor Fields
  function loadSlideIntoEditor() {
    const slide = getCurrentSlide();
    if (!slide) return;

    // Apply Theme
    canvasViewport.className = `canvas-viewport ${deck.theme || 'theme-obsidian'}`;
    selTheme.value = deck.theme || 'theme-obsidian';
    selLayout.value = slide.layout || 'title';

    // Populate Fields
    inpSlideTitle.value = slide.title || '';
    inpSlideSubtitle.value = slide.subtitle || '';
    inpSlideBullets.value = (slide.bullets || []).join('\n');
    inpCol1.value = slide.col1 || '';
    inpCol2.value = slide.col2 || '';
    inpStatNum.value = slide.statNum || '';
    inpStatLabel.value = slide.statLabel || '';

    // Field visibility based on layout
    groupSubtitle.style.display = 'flex';
    groupBullets.style.display = slide.layout === 'bullets' ? 'flex' : 'none';
    groupColumns.style.display = slide.layout === 'columns' ? 'grid' : 'none';
    groupStat.style.display = slide.layout === 'stat' ? 'grid' : 'none';

    renderSlideCanvas(slideCanvasContent, slide, currentSlideIdx, deck.slides.length, deck.title);
  }

  // Generic Slide Content Renderer (used by both Canvas and Fullscreen Presenter)
  function renderSlideCanvas(container, slide, index, total, deckTitle) {
    let contentHtml = '';

    if (slide.layout === 'title') {
      contentHtml = `
        <div style="text-align: center; max-width: 900px; margin: 0 auto;">
          <div class="slide-field-title">${escapeHtml(slide.title || 'Click to edit title')}</div>
          ${slide.subtitle ? `<div class="slide-field-subtitle">${escapeHtml(slide.subtitle)}</div>` : ''}
        </div>
      `;
    } else if (slide.layout === 'bullets') {
      const bullets = slide.bullets || [];
      contentHtml = `
        <div>
          <div class="slide-field-title">${escapeHtml(slide.title || 'Slide Title')}</div>
          ${slide.subtitle ? `<div class="slide-field-subtitle">${escapeHtml(slide.subtitle)}</div>` : ''}
          <ul class="slide-bullets-list">
            ${bullets.length > 0 ? bullets.map(b => `
              <li class="slide-bullet-item">
                <span class="bullet-marker">▸</span>
                <span>${escapeHtml(b)}</span>
              </li>
            `).join('') : '<li style="opacity: 0.5;">Add bullet points in the editor below...</li>'}
          </ul>
        </div>
      `;
    } else if (slide.layout === 'columns') {
      const c1Lines = (slide.col1 || '').split('\n').filter(Boolean);
      const c2Lines = (slide.col2 || '').split('\n').filter(Boolean);
      contentHtml = `
        <div>
          <div class="slide-field-title">${escapeHtml(slide.title || 'Two Column Comparison')}</div>
          ${slide.subtitle ? `<div class="slide-field-subtitle">${escapeHtml(slide.subtitle)}</div>` : ''}
          <div class="slide-two-cols">
            <div style="background: rgba(255,255,255,0.05); padding: 1.25rem; border-radius: var(--radius-md); border: 1px solid rgba(255,255,255,0.1);">
              ${c1Lines.map(l => `<div style="margin-bottom: 0.4rem;">${escapeHtml(l)}</div>`).join('') || '<span style="opacity:0.5;">Column 1 Content</span>'}
            </div>
            <div style="background: rgba(255,255,255,0.05); padding: 1.25rem; border-radius: var(--radius-md); border: 1px solid rgba(255,255,255,0.1);">
              ${c2Lines.map(l => `<div style="margin-bottom: 0.4rem;">${escapeHtml(l)}</div>`).join('') || '<span style="opacity:0.5;">Column 2 Content</span>'}
            </div>
          </div>
        </div>
      `;
    } else if (slide.layout === 'stat') {
      contentHtml = `
        <div class="slide-stat-display">
          <div class="slide-field-title" style="font-size: clamp(1.5rem, 3vw, 2.4rem); margin-bottom: 1rem;">${escapeHtml(slide.title || 'Key Metric')}</div>
          <div class="stat-hero-number">${escapeHtml(slide.statNum || '$0')}</div>
          <div class="stat-hero-label">${escapeHtml(slide.statLabel || 'Metric Description')}</div>
          ${slide.subtitle ? `<div style="font-size: 0.95rem; opacity: 0.7; margin-top: 1rem;">${escapeHtml(slide.subtitle)}</div>` : ''}
        </div>
      `;
    }

    container.innerHTML = `
      ${contentHtml}
      <div class="slide-footer-bar">
        <span>${escapeHtml(deckTitle || 'Presentation')}</span>
        <span>${index + 1} / ${total}</span>
      </div>
    `;
  }

  // Slide CRUD
  function addSlide() {
    const newSlide = {
      id: 'slide-' + Date.now(),
      layout: 'bullets',
      title: 'New Slide Title',
      subtitle: 'Add supporting context or takeaway',
      bullets: ['First strategic bullet point', 'Second key achievement or deliverable'],
      col1: '',
      col2: '',
      statNum: '',
      statLabel: ''
    };
    deck.slides.splice(currentSlideIdx + 1, 0, newSlide);
    currentSlideIdx++;
    renderThumbnails();
    loadSlideIntoEditor();
    saveDeck();
  }

  function duplicateSlide(idx) {
    const source = deck.slides[idx];
    const clone = JSON.parse(JSON.stringify(source));
    clone.id = 'slide-' + Date.now();
    clone.title = clone.title + ' (Copy)';
    deck.slides.splice(idx + 1, 0, clone);
    currentSlideIdx = idx + 1;
    renderThumbnails();
    loadSlideIntoEditor();
    saveDeck();
  }

  function deleteSlide(idx) {
    if (deck.slides.length <= 1) {
      alert('A presentation must have at least one slide.');
      return;
    }
    deck.slides.splice(idx, 1);
    if (currentSlideIdx >= deck.slides.length) {
      currentSlideIdx = deck.slides.length - 1;
    }
    renderThumbnails();
    loadSlideIntoEditor();
    saveDeck();
  }

  function moveSlide(from, to) {
    if (to < 0 || to >= deck.slides.length) return;
    const item = deck.slides.splice(from, 1)[0];
    deck.slides.splice(to, 0, item);
    currentSlideIdx = to;
    renderThumbnails();
    loadSlideIntoEditor();
    saveDeck();
  }

  // Form Field Input Listeners
  inpSlideTitle.addEventListener('input', () => {
    const s = getCurrentSlide();
    s.title = inpSlideTitle.value;
    renderSlideCanvas(slideCanvasContent, s, currentSlideIdx, deck.slides.length, deck.title);
    renderThumbnails();
    saveDeck();
  });

  inpSlideSubtitle.addEventListener('input', () => {
    const s = getCurrentSlide();
    s.subtitle = inpSlideSubtitle.value;
    renderSlideCanvas(slideCanvasContent, s, currentSlideIdx, deck.slides.length, deck.title);
    saveDeck();
  });

  inpSlideBullets.addEventListener('input', () => {
    const s = getCurrentSlide();
    s.bullets = inpSlideBullets.value.split('\n').filter(b => b.trim().length > 0);
    renderSlideCanvas(slideCanvasContent, s, currentSlideIdx, deck.slides.length, deck.title);
    saveDeck();
  });

  inpCol1.addEventListener('input', () => {
    const s = getCurrentSlide();
    s.col1 = inpCol1.value;
    renderSlideCanvas(slideCanvasContent, s, currentSlideIdx, deck.slides.length, deck.title);
    saveDeck();
  });

  inpCol2.addEventListener('input', () => {
    const s = getCurrentSlide();
    s.col2 = inpCol2.value;
    renderSlideCanvas(slideCanvasContent, s, currentSlideIdx, deck.slides.length, deck.title);
    saveDeck();
  });

  inpStatNum.addEventListener('input', () => {
    const s = getCurrentSlide();
    s.statNum = inpStatNum.value;
    renderSlideCanvas(slideCanvasContent, s, currentSlideIdx, deck.slides.length, deck.title);
    saveDeck();
  });

  inpStatLabel.addEventListener('input', () => {
    const s = getCurrentSlide();
    s.statLabel = inpStatLabel.value;
    renderSlideCanvas(slideCanvasContent, s, currentSlideIdx, deck.slides.length, deck.title);
    saveDeck();
  });

  selLayout.addEventListener('change', () => {
    const s = getCurrentSlide();
    s.layout = selLayout.value;
    loadSlideIntoEditor();
    renderThumbnails();
    saveDeck();
  });

  selTheme.addEventListener('change', () => {
    deck.theme = selTheme.value;
    canvasViewport.className = `canvas-viewport ${deck.theme}`;
    if (presentSlideInner) {
      presentSlideInner.className = `present-slide-inner ${deck.theme}`;
    }
    saveDeck();
  });

  deckTitleInput.addEventListener('input', () => {
    deck.title = deckTitleInput.value;
    const s = getCurrentSlide();
    renderSlideCanvas(slideCanvasContent, s, currentSlideIdx, deck.slides.length, deck.title);
    saveDeck();
  });

  btnAddSlide.addEventListener('click', addSlide);

  // Presenter Mode Logic
  function startPresenting() {
    isPresenting = true;
    presentModal.classList.add('active');
    presentSlideInner.className = `present-slide-inner ${deck.theme || 'theme-obsidian'}`;
    renderPresentSlide();
    presentModal.focus();

    // Try native fullscreen if permitted
    try {
      if (document.documentElement.requestFullscreen) {
        document.documentElement.requestFullscreen().catch(() => {});
      }
    } catch (e) {}
  }

  function stopPresenting() {
    isPresenting = false;
    presentModal.classList.remove('active');
    try {
      if (document.fullscreenElement && document.exitFullscreen) {
        document.exitFullscreen().catch(() => {});
      }
    } catch (e) {}
    loadSlideIntoEditor();
  }

  function renderPresentSlide() {
    const s = getCurrentSlide();
    renderSlideCanvas(presentSlideInner, s, currentSlideIdx, deck.slides.length, deck.title);
    hudCounter.textContent = `${currentSlideIdx + 1} / ${deck.slides.length}`;
  }

  function presentNext() {
    if (currentSlideIdx < deck.slides.length - 1) {
      currentSlideIdx++;
      renderPresentSlide();
      renderThumbnails();
    }
  }

  function presentPrev() {
    if (currentSlideIdx > 0) {
      currentSlideIdx--;
      renderPresentSlide();
      renderThumbnails();
    }
  }

  btnStartPresent.addEventListener('click', startPresenting);
  hudExit.addEventListener('click', stopPresenting);
  hudNext.addEventListener('click', presentNext);
  hudPrev.addEventListener('click', presentPrev);

  // Keyboard navigation for Presenter & Editor
  window.addEventListener('keydown', (e) => {
    if (e.key === 'F5') {
      e.preventDefault();
      startPresenting();
      return;
    }

    if (!isPresenting) return;

    if (e.key === 'Escape') {
      stopPresenting();
    } else if (e.key === 'ArrowRight' || e.key === ' ' || e.key === 'PageDown') {
      e.preventDefault();
      presentNext();
    } else if (e.key === 'ArrowLeft' || e.key === 'PageUp') {
      e.preventDefault();
      presentPrev();
    }
  });

  // Touch swipe support for presentation mode
  let touchStartX = 0;
  presentModal.addEventListener('touchstart', (e) => {
    touchStartX = e.changedTouches[0].clientX;
  }, { passive: true });

  presentModal.addEventListener('touchend', (e) => {
    const touchEndX = e.changedTouches[0].clientX;
    const diff = touchEndX - touchStartX;
    if (Math.abs(diff) > 50) {
      if (diff < 0) presentNext();
      else presentPrev();
    }
  }, { passive: true });

  // Load sample deck
  btnLoadSample.addEventListener('click', () => {
    if (confirm('Load sample 5-slide enterprise roadmap deck?')) {
      deck = JSON.parse(JSON.stringify(DEFAULT_DECK));
      deckTitleInput.value = deck.title;
      currentSlideIdx = 0;
      renderThumbnails();
      loadSlideIntoEditor();
      saveDeck();
    }
  });

  // Export JSON Deck
  btnExportJson.addEventListener('click', () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(deck, null, 2));
    const a = document.createElement('a');
    a.href = dataStr;
    a.download = `${(deck.title || 'presentation').toLowerCase().replace(/\s+/g, '_')}.json`;
    document.body.appendChild(a);
    a.click();
    a.remove();
  });

  // Import JSON Deck
  fileImportDeck.addEventListener('change', (e) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const parsed = JSON.parse(evt.target.result);
        if (parsed && Array.isArray(parsed.slides)) {
          deck = parsed;
          deckTitleInput.value = deck.title || 'Imported Presentation';
          currentSlideIdx = 0;
          renderThumbnails();
          loadSlideIntoEditor();
          saveDeck();
        } else {
          alert('Invalid presentation JSON structure.');
        }
      } catch (err) {
        alert('Could not parse presentation file.');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  });

  function escapeHtml(str) {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  // Initial Boot
  deckTitleInput.value = deck.title || 'Executive Strategy Deck';
  renderThumbnails();
  loadSlideIntoEditor();
});