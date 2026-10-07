// Export to PPTX & PDF - Presentation Export Suite
// Complete client-side interactive logic

document.addEventListener('DOMContentLoaded', () => {
  // DOM Elements
  const selectAspect = document.getElementById('select-aspect');
  const selectMargins = document.getElementById('select-margins');
  const togglePageNums = document.getElementById('toggle-pagenums');
  const toggleFooters = document.getElementById('toggle-footers');

  const metaOrg = document.getElementById('meta-org');
  const metaDate = document.getElementById('meta-date');

  // Slide Editor
  const editorSlidePicker = document.getElementById('editor-slide-picker');
  const editTitle = document.getElementById('edit-title');
  const editSubtitle = document.getElementById('edit-subtitle');
  const editBullets = document.getElementById('edit-bullets');
  const addNewSlideBtn = document.getElementById('add-new-slide-btn');
  const removeSlideBtn = document.getElementById('remove-slide-btn');

  // Action Buttons
  const printPdfBtn = document.getElementById('print-pdf-btn');
  const downloadHtmlPkgBtn = document.getElementById('download-html-pkg-btn');
  const downloadJsonSpecBtn = document.getElementById('download-json-spec-btn');

  // Preview elements
  const deckSlidesContainer = document.getElementById('deck-slides-container');
  const deckCountBadge = document.getElementById('deck-count-badge');

  // Toast
  const appToast = document.getElementById('app-toast');
  const toastText = document.getElementById('toast-text');
  let toastTimer = null;

  function showToast(msg) {
    if (toastTimer) clearTimeout(toastTimer);
    toastText.textContent = msg;
    appToast.classList.add('show');
    toastTimer = setTimeout(() => {
      appToast.classList.remove('show');
    }, 2800);
  }

  // Initial Presentation Deck Data
  let deckSlides = [
    {
      category: 'EXECUTIVE OVERVIEW',
      title: 'Global Platform Strategy & Growth Review',
      subtitle: 'Driving accelerated multi-region market expansion and autonomous developer productivity.',
      bullets: [
        '380% Compound Annual Growth Rate (CAGR) across key tier-1 accounts',
        'Sub-millisecond global execution speeds with client-side edge acceleration',
        'Comprehensive enterprise data privacy and offline compliance standards'
      ]
    },
    {
      category: 'MARKET OPPORTUNITY',
      title: 'Total Addressable Market & Competitive Edge',
      subtitle: 'Capitalizing on the $45B shift towards autonomous developer tooling and AI orchestration.',
      bullets: [
        'Over 140+ Fortune 500 engineering organizations testing our tool suite',
        'Eliminating $12M annual license bloat via unified browser-based workflows',
        '99.98% High-availability operational SLA guarantees'
      ]
    },
    {
      category: 'ARCHITECTURE',
      title: 'Distributed Client-Side Edge Infrastructure',
      subtitle: 'Zero-latency execution built entirely in modern WebAssembly and native Web APIs.',
      bullets: [
        'Completely private: zero server-side credential or document exfiltration',
        'High-density vector graphics rendering directly on HTML5 Canvas & WebGL',
        'Instant multi-format document compilation: PPTX, PDF, SVG, and HTML'
      ]
    },
    {
      category: 'EXECUTION ROADMAP',
      title: 'Strategic Milestones & Next-Phase Scale',
      subtitle: 'Quarterly deliverables designed for exponential global platform adoption.',
      bullets: [
        'Q1: Rollout of Suite A Presentation & Media interactive tools',
        'Q2: Automated multi-language translation and accessibility certification',
        'Q3: Enterprise workspace integrations and self-hosted team repositories'
      ]
    }
  ];

  let selectedSlideIndex = 0;

  // Render Slide Deck
  function renderDeck() {
    deckSlidesContainer.innerHTML = '';
    deckCountBadge.textContent = `Deck: ${deckSlides.length} Slides`;

    const aspectVal = selectAspect.value;
    let cssAspect = '16 / 9';
    if (aspectVal === '4-3') cssAspect = '4 / 3';
    else if (aspectVal === 'a4') cssAspect = '1.414 / 1';

    const marginVal = selectMargins.value;
    let padStyle = 'clamp(1.5rem, 3.5vw, 3rem)';
    if (marginVal === 'minimal') padStyle = 'clamp(2rem, 5vw, 4.5rem)';
    else if (marginVal === 'normal') padStyle = 'clamp(2.5rem, 6.5vw, 6rem)';

    deckSlides.forEach((slide, idx) => {
      const slideEl = document.createElement('article');
      slideEl.className = 'print-slide-item';
      slideEl.style.aspectRatio = cssAspect;
      slideEl.style.padding = padStyle;

      // Meta header
      const numStr = `${String(idx + 1).padStart(2, '0')} / ${String(deckSlides.length).padStart(2, '0')}`;
      slideEl.innerHTML = `
        <div class="slide-meta-row">
          <span class="slide-badge-pill">${escapeHtml(slide.category || 'SLIDE')}</span>
          ${togglePageNums.checked ? `<span class="slide-page-badge">${numStr}</span>` : ''}
        </div>

        <div class="slide-content-center">
          <h2 class="slide-head-title">${escapeHtml(slide.title)}</h2>
          ${slide.subtitle ? `<p class="slide-sub-line">${escapeHtml(slide.subtitle)}</p>` : ''}
          <ul class="slide-points-list">
            ${slide.bullets.map(b => `
              <li class="slide-point-item">
                <span class="slide-point-icon">&#10004;</span>
                <span>${escapeHtml(b)}</span>
              </li>
            `).join('')}
          </ul>
        </div>

        ${toggleFooters.checked ? `
        <div class="slide-foot-info">
          <span>${escapeHtml(metaOrg.value || 'ORGANIZATION')}</span>
          <span>${escapeHtml(metaDate.value || 'PRESENTATION')}</span>
        </div>` : ''}
      `;

      deckSlidesContainer.appendChild(slideEl);
    });

    updateEditorDropdown();
  }

  function escapeHtml(str) {
    return str.replace(/[&<>'"]/g, 
      tag => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[tag] || tag)
    );
  }

  // Slide Editor Synchronization
  function updateEditorDropdown() {
    editorSlidePicker.innerHTML = '';
    deckSlides.forEach((s, idx) => {
      const opt = document.createElement('option');
      opt.value = idx;
      opt.textContent = `Slide ${idx + 1}: ${s.title.slice(0, 24)}...`;
      if (idx === selectedSlideIndex) opt.selected = true;
      editorSlidePicker.appendChild(opt);
    });

    loadSlideIntoEditor(selectedSlideIndex);
  }

  function loadSlideIntoEditor(idx) {
    if (!deckSlides[idx]) return;
    const s = deckSlides[idx];
    editTitle.value = s.title || '';
    editSubtitle.value = s.subtitle || '';
    editBullets.value = (s.bullets || []).join('\n');
  }

  editorSlidePicker.addEventListener('change', () => {
    selectedSlideIndex = parseInt(editorSlidePicker.value, 10);
    loadSlideIntoEditor(selectedSlideIndex);
  });

  editTitle.addEventListener('input', () => {
    if (deckSlides[selectedSlideIndex]) {
      deckSlides[selectedSlideIndex].title = editTitle.value;
      renderDeck();
    }
  });

  editSubtitle.addEventListener('input', () => {
    if (deckSlides[selectedSlideIndex]) {
      deckSlides[selectedSlideIndex].subtitle = editSubtitle.value;
      renderDeck();
    }
  });

  editBullets.addEventListener('input', () => {
    if (deckSlides[selectedSlideIndex]) {
      deckSlides[selectedSlideIndex].bullets = editBullets.value.split('\n').filter(b => b.trim().length > 0);
      renderDeck();
    }
  });

  addNewSlideBtn.addEventListener('click', () => {
    deckSlides.push({
      category: 'STRATEGIC INITIATIVE',
      title: `New Strategic Slide ${deckSlides.length + 1}`,
      subtitle: 'Add clear contextual summary for slide audiences',
      bullets: ['Key takeaway point number one', 'Operational priority point number two']
    });
    selectedSlideIndex = deckSlides.length - 1;
    renderDeck();
    showToast('Added new slide to deck');
  });

  removeSlideBtn.addEventListener('click', () => {
    if (deckSlides.length <= 1) {
      showToast('Cannot delete the only slide in deck');
      return;
    }
    deckSlides.splice(selectedSlideIndex, 1);
    if (selectedSlideIndex >= deckSlides.length) selectedSlideIndex = deckSlides.length - 1;
    renderDeck();
    showToast('Slide removed from deck');
  });

  // Settings Listeners
  selectAspect.addEventListener('change', renderDeck);
  selectMargins.addEventListener('change', renderDeck);
  togglePageNums.addEventListener('change', renderDeck);
  toggleFooters.addEventListener('change', renderDeck);
  metaOrg.addEventListener('input', renderDeck);
  metaDate.addEventListener('input', renderDeck);

  // --- Export Actions ---
  // 1. Print / Save to PDF
  printPdfBtn.addEventListener('click', () => {
    showToast('Opening print dialog. Select "Save as PDF" and "Landscape"');
    setTimeout(() => {
      window.print();
    }, 250);
  });

  // 2. Download Standalone HTML Slide Deck
  downloadHtmlPkgBtn.addEventListener('click', () => {
    const aspectVal = selectAspect.value;
    let aspectCss = '16 / 9';
    if (aspectVal === '4-3') aspectCss = '4 / 3';
    else if (aspectVal === 'a4') aspectCss = '1.414 / 1';

    const fullHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>${escapeHtml(metaOrg.value || 'Presentation Deck')}</title>
  <style>
    @page { size: landscape; margin: 0; }
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { background: #070912; color: #fff; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 100vh; }
    .stage { width: 100vw; height: 56.25vw; max-height: 100vh; max-width: 177.78vh; position: relative; }
    .slide { display: none; width: 100%; height: 100%; aspect-ratio: ${aspectCss}; padding: 5vw; flex-direction: column; justify-content: space-between; background: radial-gradient(circle at 75% 25%, #151b33 0%, #070912 100%); }
    .slide.active { display: flex; }
    .badge { align-self: flex-start; padding: 0.3vw 0.8vw; border-radius: 999px; background: rgba(78, 133, 191, 0.2); border: 1px solid rgba(78, 133, 191, 0.4); color: #89aacc; font-size: 1vw; font-weight: 700; text-transform: uppercase; }
    h1 { font-size: 3.2vw; font-weight: 800; line-height: 1.2; margin: 1vw 0 0.5vw 0; }
    p { font-size: 1.4vw; opacity: 0.8; margin-bottom: 1.5vw; }
    ul { list-style: none; display: flex; flex-direction: column; gap: 0.8vw; }
    li { font-size: 1.25vw; display: flex; gap: 0.8vw; align-items: center; }
    .check { color: #4e85bf; font-weight: bold; }
    .footer { display: flex; justify-content: space-between; opacity: 0.5; font-size: 0.9vw; border-top: 1px solid rgba(255,255,255,0.1); padding-top: 0.8vw; }
    .nav { position: fixed; bottom: 20px; display: flex; gap: 15px; background: rgba(20,20,30,0.85); backdrop-filter: blur(8px); padding: 8px 24px; border-radius: 999px; border: 1px solid rgba(255,255,255,0.15); align-items: center; }
    button { background: none; border: none; color: #fff; font-size: 16px; cursor: pointer; }
    @media print {
      body { background: #000; }
      .nav { display: none; }
      .stage { width: 100vw; height: auto; max-width: none; max-height: none; }
      .slide { display: flex !important; page-break-after: always; break-after: page; width: 100vw; height: 100vh; }
    }
  </style>
</head>
<body>
  <div class="stage">
    ${deckSlides.map((s, idx) => `
    <div class="slide ${idx === 0 ? 'active' : ''}" id="slide-${idx}">
      <div style="display:flex; justify-content:space-between; align-items:center;">
        <span class="badge">${escapeHtml(s.category)}</span>
        <span style="font-family:monospace; opacity:0.6; font-size:1vw;">${String(idx + 1).padStart(2, '0')} / ${String(deckSlides.length).padStart(2, '0')}</span>
      </div>
      <div style="margin: auto 0;">
        <h1>${escapeHtml(s.title)}</h1>
        ${s.subtitle ? `<p>${escapeHtml(s.subtitle)}</p>` : ''}
        <ul>
          ${s.bullets.map(b => `<li><span class="check">&#10004;</span> <span>${escapeHtml(b)}</span></li>`).join('')}
        </ul>
      </div>
      <div class="footer">
        <span>${escapeHtml(metaOrg.value)}</span>
        <span>${escapeHtml(metaDate.value)}</span>
      </div>
    </div>`).join('')}
  </div>

  <div class="nav">
    <button id="pBtn">&larr;</button>
    <span id="cnt" style="font-family:monospace; font-weight:bold;">1 / ${deckSlides.length}</span>
    <button id="nBtn">&rarr;</button>
  </div>

  <script>
    let c = 0;
    const tot = ${deckSlides.length};
    const sls = document.querySelectorAll('.slide');
    const cnt = document.getElementById('cnt');
    function go(i) {
      if (i < 0 || i >= tot) return;
      sls[c].classList.remove('active');
      c = i;
      sls[c].classList.add('active');
      cnt.textContent = (c + 1) + ' / ' + tot;
    }
    document.getElementById('pBtn').onclick = () => go(c - 1);
    document.getElementById('nBtn').onclick = () => go(c + 1);
    window.onkeydown = (e) => {
      if (e.key === 'ArrowRight' || e.key === ' ') go(c + 1);
      if (e.key === 'ArrowLeft') go(c - 1);
    };
  <\/script>
</body>
</html>`;

    const blob = new Blob([fullHtml], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'presentation-deck-package.html';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showToast('Downloaded standalone presentation HTML package');
  });

  // 3. Download Deck JSON Specification
  downloadJsonSpecBtn.addEventListener('click', () => {
    const spec = {
      meta: {
        organization: metaOrg.value,
        date: metaDate.value,
        aspectRatio: selectAspect.value,
        margins: selectMargins.value,
        totalSlides: deckSlides.length
      },
      slides: deckSlides
    };

    const blob = new Blob([JSON.stringify(spec, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'presentation-deck-spec.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showToast('Downloaded presentation spec JSON');
  });

  // Initial render
  renderDeck();
});