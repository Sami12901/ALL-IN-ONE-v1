// Convert to Slides - Markdown & Outline to Slide Deck Converter
// Complete client-side interactive logic

document.addEventListener('DOMContentLoaded', () => {
  // DOM Elements
  const markdownInput = document.getElementById('markdown-input');
  const samplePitchBtn = document.getElementById('sample-pitch-btn');
  const sampleTechBtn = document.getElementById('sample-tech-btn');
  const clearInputBtn = document.getElementById('clear-input-btn');

  const themeChips = document.querySelectorAll('.editor-card .preset-chip');
  const liveSlideViewport = document.getElementById('live-slide-viewport');

  // Slide display elements
  const liveSlideCategory = document.getElementById('live-slide-category');
  const liveSlideNum = document.getElementById('live-slide-num');
  const liveSlideTitle = document.getElementById('live-slide-title');
  const liveSlideSubtitle = document.getElementById('live-slide-subtitle');
  const liveSlideBullets = document.getElementById('live-slide-bullets');
  const slideCounterBadge = document.getElementById('slide-counter-badge');

  // Controls & Filmstrip
  const prevSlideBtn = document.getElementById('prev-slide-btn');
  const nextSlideBtn = document.getElementById('next-slide-btn');
  const addSlideBtn = document.getElementById('add-slide-btn');
  const deleteCurrentSlideBtn = document.getElementById('delete-current-slide-btn');
  const thumbnailsContainer = document.getElementById('thumbnails-container');

  // Export & Presentation
  const exportHtmlDeckBtn = document.getElementById('export-html-deck-btn');
  const copyDeckJsonBtn = document.getElementById('copy-deck-json-btn');
  const launchPresentBtn = document.getElementById('launch-present-btn');

  // Fullscreen HUD
  const fsPresentationOverlay = document.getElementById('fs-presentation-overlay');
  const fsSlideSlot = document.getElementById('fs-slide-slot');
  const fsCounter = document.getElementById('fs-counter');
  const fsPrevBtn = document.getElementById('fs-prev-btn');
  const fsNextBtn = document.getElementById('fs-next-btn');
  const fsExitBtn = document.getElementById('fs-exit-btn');

  // Toast
  const appToast = document.getElementById('app-toast');
  const toastText = document.getElementById('toast-text');
  let toastTimer = null;

  // State
  let slides = [];
  let currentSlideIndex = 0;
  let activeTheme = 'theme-cyber';

  function showToast(msg) {
    if (toastTimer) clearTimeout(toastTimer);
    toastText.textContent = msg;
    appToast.classList.add('show');
    toastTimer = setTimeout(() => {
      appToast.classList.remove('show');
    }, 2500);
  }

  // --- Sample Templates ---
  const SAMPLE_PITCH = `# Executive Summary
Leading the Next Evolution of AI Productivity
- $45B Total Addressable Market (TAM) growing at 32% CAGR
- Proprietary multi-modal inference pipeline with 10x cost reduction
- 140+ Enterprise pilot customers onboarded in Q3

---

# The Problem & Market Inefficiency
Current enterprise tooling is fragmented and slow
- High operational overhead across siloed legacy workflows
- Data gravity and privacy compliance roadblocks
- Engineers spend 40% of sprint time on repetitive maintenance

---

# Our Solution: The All-In-One Engine
A unified autonomous workspace built for scale
- Zero-configuration deployment with client-side edge compute
- Instant end-to-end presentation and document transformation
- Bank-grade security with local browser-first isolation

---

# Traction & Growth Milestones
Accelerating velocity across high-value contracts
- 380% Year-over-Year ARR trajectory
- 98.4% Customer net retention rate
- Series A expansion planned for global market rollout`;

  const SAMPLE_TECH = `# Cloud Architecture Overview
Distributed Edge Microservices & High-Availability Pipeline
- Multi-region Kubernetes deployment with automated failover
- Sub-5ms p99 latency across distributed globally cached routes
- Zero-trust security policy with mTLS end-to-end encryption

---

# Data Ingestion & Streaming
Handling 500,000 parallel WebSocket events per second
- Apache Kafka event streaming layer with partitioned consumer groups
- Real-time schema validation and deduplication filters
- Instant snapshot persistence to cold object storage

---

# Client-Side Edge Rendering
Unlocking desktop-grade performance directly in modern browsers
- WebAssembly computing modules compiled from Rust
- OffscreenCanvas multithreaded rendering pipelines
- Offline-first cache manifests with indexedDB state sync`;

  // --- Parser Logic ---
  function parseMarkdown(mdText) {
    if (!mdText.trim()) return [];

    // Split on '---' or headings
    const rawChunks = mdText.split(/\n\s*---\s*\n/);
    const parsed = [];

    rawChunks.forEach((chunk) => {
      const lines = chunk.trim().split('\n');
      if (lines.length === 0 || !lines[0].trim()) return;

      let title = 'Untitled Slide';
      let subtitle = '';
      const bullets = [];
      let tag = 'PRESENTATION';

      for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;

        if (line.startsWith('# ')) {
          title = line.replace(/^#\s+/, '').trim();
          // Extract tag if in brackets, e.g. [OVERVIEW] Title
          const tagMatch = title.match(/^\[(.*?)\]\s*(.*)/);
          if (tagMatch) {
            tag = tagMatch[1].toUpperCase();
            title = tagMatch[2];
          }
        } else if (line.startsWith('## ')) {
          subtitle = line.replace(/^##\s+/, '').trim();
        } else if (/^[-*]\s+/.test(line) || /^\d+\.\s+/.test(line)) {
          bullets.push(line.replace(/^[-*]\s+|\d+\.\s+/, '').trim());
        } else if (!subtitle && bullets.length === 0) {
          subtitle = line;
        } else {
          bullets.push(line);
        }
      }

      parsed.push({
        title,
        subtitle,
        bullets,
        tag
      });
    });

    return parsed;
  }

  function serializeSlidesToMarkdown(slidesList) {
    return slidesList.map((s) => {
      let out = `# ${s.title}\n`;
      if (s.subtitle) out += `${s.subtitle}\n`;
      if (s.bullets && s.bullets.length > 0) {
        s.bullets.forEach((b) => {
          out += `- ${b}\n`;
        });
      }
      return out;
    }).join('\n---\n\n');
  }

  // --- Render Slide Viewport ---
  function renderActiveSlide() {
    if (slides.length === 0) {
      liveSlideTitle.textContent = 'No Slides';
      liveSlideSubtitle.textContent = 'Add a slide or paste markdown outline to start.';
      liveSlideBullets.innerHTML = '';
      slideCounterBadge.textContent = '0 / 0';
      liveSlideNum.textContent = '00 / 00';
      return;
    }

    if (currentSlideIndex >= slides.length) currentSlideIndex = slides.length - 1;
    if (currentSlideIndex < 0) currentSlideIndex = 0;

    const slide = slides[currentSlideIndex];
    liveSlideTitle.textContent = slide.title || 'Slide Title';
    liveSlideSubtitle.textContent = slide.subtitle || '';
    liveSlideCategory.textContent = slide.tag || `SLIDE ${currentSlideIndex + 1}`;

    const numStr = `${String(currentSlideIndex + 1).padStart(2, '0')} / ${String(slides.length).padStart(2, '0')}`;
    liveSlideNum.textContent = numStr;
    slideCounterBadge.textContent = `Slide ${currentSlideIndex + 1} / ${slides.length}`;

    // Bullets
    liveSlideBullets.innerHTML = '';
    if (slide.bullets && slide.bullets.length > 0) {
      slide.bullets.forEach((b) => {
        const li = document.createElement('li');
        li.className = 'slide-bullet-line';
        li.innerHTML = `
          <span class="slide-bullet-dot">&#10148;</span>
          <span>${escapeHtml(b)}</span>
        `;
        liveSlideBullets.appendChild(li);
      });
    }

    renderThumbnails();
  }

  function escapeHtml(str) {
    return str.replace(/[&<>'"]/g, 
      tag => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[tag] || tag)
    );
  }

  // --- Filmstrip Sorter ---
  function renderThumbnails() {
    thumbnailsContainer.innerHTML = '';
    slides.forEach((s, idx) => {
      const card = document.createElement('div');
      card.className = `slide-thumb-card ${idx === currentSlideIndex ? 'active' : ''}`;
      card.innerHTML = `
        <div style="display:flex; justify-content:space-between; align-items:center;">
          <span class="thumb-num">#${idx + 1}</span>
          <span style="font-size:0.6rem; opacity:0.6;">16:9</span>
        </div>
        <div class="thumb-title">${escapeHtml(s.title || 'Untitled')}</div>
        <div style="display:flex; gap:2px;">
          ${idx > 0 ? `<button type="button" class="thumb-move-btn" data-move="-1" style="background:none; border:none; color:var(--text-tertiary); cursor:pointer; font-size:10px;">&larr;</button>` : ''}
          ${idx < slides.length - 1 ? `<button type="button" class="thumb-move-btn" data-move="1" style="background:none; border:none; color:var(--text-tertiary); cursor:pointer; font-size:10px;">&rarr;</button>` : ''}
        </div>
      `;

      card.addEventListener('click', (e) => {
        const moveBtn = e.target.closest('.thumb-move-btn');
        if (moveBtn) {
          e.stopPropagation();
          const dir = parseInt(moveBtn.getAttribute('data-move'), 10);
          moveSlide(idx, dir);
          return;
        }
        currentSlideIndex = idx;
        renderActiveSlide();
      });

      thumbnailsContainer.appendChild(card);
    });
  }

  function moveSlide(index, direction) {
    const targetIdx = index + direction;
    if (targetIdx < 0 || targetIdx >= slides.length) return;
    const temp = slides[index];
    slides[index] = slides[targetIdx];
    slides[targetIdx] = temp;
    currentSlideIndex = targetIdx;
    markdownInput.value = serializeSlidesToMarkdown(slides);
    renderActiveSlide();
    showToast(`Slide moved to position ${targetIdx + 1}`);
  }

  // --- Navigation Buttons ---
  prevSlideBtn.addEventListener('click', () => {
    if (currentSlideIndex > 0) {
      currentSlideIndex--;
      renderActiveSlide();
    }
  });

  nextSlideBtn.addEventListener('click', () => {
    if (currentSlideIndex < slides.length - 1) {
      currentSlideIndex++;
      renderActiveSlide();
    }
  });

  addSlideBtn.addEventListener('click', () => {
    slides.push({
      title: `New Slide ${slides.length + 1}`,
      subtitle: 'Add supporting strategic takeaway',
      bullets: ['High impact bullet point one', 'Key strategic initiative two'],
      tag: 'STRATEGY'
    });
    currentSlideIndex = slides.length - 1;
    markdownInput.value = serializeSlidesToMarkdown(slides);
    renderActiveSlide();
    showToast('New slide added');
  });

  deleteCurrentSlideBtn.addEventListener('click', () => {
    if (slides.length <= 1) {
      showToast('Cannot delete only remaining slide');
      return;
    }
    slides.splice(currentSlideIndex, 1);
    if (currentSlideIndex >= slides.length) currentSlideIndex = slides.length - 1;
    markdownInput.value = serializeSlidesToMarkdown(slides);
    renderActiveSlide();
    showToast('Slide deleted');
  });

  // --- Keyboard Shortcuts ---
  window.addEventListener('keydown', (e) => {
    // If not typing in input
    if (document.activeElement === markdownInput) return;

    if (e.key === 'ArrowRight' || e.key === ' ' || e.key === 'PageDown') {
      if (currentSlideIndex < slides.length - 1) {
        currentSlideIndex++;
        renderActiveSlide();
        if (fsPresentationOverlay.classList.contains('active')) updateFsSlide();
      }
    } else if (e.key === 'ArrowLeft' || e.key === 'PageUp') {
      if (currentSlideIndex > 0) {
        currentSlideIndex--;
        renderActiveSlide();
        if (fsPresentationOverlay.classList.contains('active')) updateFsSlide();
      }
    } else if (e.key === 'Escape' && fsPresentationOverlay.classList.contains('active')) {
      closeFsPresentation();
    }
  });

  // --- Markdown Input Listener ---
  let parseDebounce = null;
  markdownInput.addEventListener('input', () => {
    clearTimeout(parseDebounce);
    parseDebounce = setTimeout(() => {
      slides = parseMarkdown(markdownInput.value);
      renderActiveSlide();
    }, 200);
  });

  // --- Template Buttons ---
  samplePitchBtn.addEventListener('click', () => {
    markdownInput.value = SAMPLE_PITCH;
    slides = parseMarkdown(SAMPLE_PITCH);
    currentSlideIndex = 0;
    renderActiveSlide();
    showToast('Loaded Executive Pitch Deck');
  });

  sampleTechBtn.addEventListener('click', () => {
    markdownInput.value = SAMPLE_TECH;
    slides = parseMarkdown(SAMPLE_TECH);
    currentSlideIndex = 0;
    renderActiveSlide();
    showToast('Loaded Technical Architecture Deck');
  });

  clearInputBtn.addEventListener('click', () => {
    markdownInput.value = '';
    slides = [];
    currentSlideIndex = 0;
    renderActiveSlide();
    showToast('Cleared outline');
  });

  // --- Theme Switcher ---
  themeChips.forEach((chip) => {
    chip.addEventListener('click', () => {
      themeChips.forEach((c) => c.classList.remove('active'));
      chip.classList.add('active');
      activeTheme = chip.getAttribute('data-theme');
      liveSlideViewport.className = `slide-canvas-wrapper ${activeTheme}`;
      showToast(`Applied ${chip.textContent} theme`);
    });
  });

  // --- Fullscreen Presentation Mode ---
  launchPresentBtn.addEventListener('click', () => {
    if (slides.length === 0) {
      showToast('No slides to present');
      return;
    }
    fsPresentationOverlay.classList.add('active');
    updateFsSlide();
  });

  function updateFsSlide() {
    fsSlideSlot.innerHTML = '';
    const clone = liveSlideViewport.cloneNode(true);
    fsSlideSlot.appendChild(clone);
    fsCounter.textContent = `${currentSlideIndex + 1} / ${slides.length}`;
  }

  fsPrevBtn.addEventListener('click', () => {
    if (currentSlideIndex > 0) {
      currentSlideIndex--;
      renderActiveSlide();
      updateFsSlide();
    }
  });

  fsNextBtn.addEventListener('click', () => {
    if (currentSlideIndex < slides.length - 1) {
      currentSlideIndex++;
      renderActiveSlide();
      updateFsSlide();
    }
  });

  fsExitBtn.addEventListener('click', closeFsPresentation);

  function closeFsPresentation() {
    fsPresentationOverlay.classList.remove('active');
    fsSlideSlot.innerHTML = '';
  }

  // --- Export Deck Actions ---
  copyDeckJsonBtn.addEventListener('click', () => {
    const jsonStr = JSON.stringify(slides, null, 2);
    navigator.clipboard.writeText(jsonStr).then(() => {
      showToast('Deck JSON copied to clipboard');
    }).catch(() => {
      showToast('Clipboard access denied');
    });
  });

  exportHtmlDeckBtn.addEventListener('click', () => {
    if (slides.length === 0) {
      showToast('No slides to export');
      return;
    }

    const htmlDeck = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>${escapeHtml(slides[0]?.title || 'Presentation Deck')}</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { background: #05070d; color: #fff; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 100vh; overflow: hidden; }
    .slide-deck-stage { width: 100vw; height: 56.25vw; max-height: 100vh; max-width: 177.78vh; position: relative; display: flex; align-items: center; justify-content: center; }
    .slide { display: none; width: 100%; height: 100%; padding: 5vw; flex-direction: column; justify-content: space-between; background: radial-gradient(circle at 80% 20%, #151b33 0%, #070912 100%); }
    .slide.active { display: flex; }
    .tag { align-self: flex-start; padding: 0.3vw 0.8vw; border-radius: 999px; background: rgba(78, 133, 191, 0.2); border: 1px solid rgba(78, 133, 191, 0.4); color: #89aacc; font-size: 1vw; font-weight: 700; text-transform: uppercase; }
    h1 { font-size: 3.4vw; font-weight: 800; line-height: 1.15; margin: 1vw 0 0.5vw 0; }
    p { font-size: 1.5vw; opacity: 0.8; margin-bottom: 1.5vw; }
    ul { list-style: none; display: flex; flex-direction: column; gap: 0.8vw; }
    li { font-size: 1.3vw; display: flex; gap: 0.8vw; align-items: center; }
    .dot { color: #4e85bf; font-weight: bold; }
    .hud { position: fixed; bottom: 20px; display: flex; gap: 12px; background: rgba(20,20,30,0.85); backdrop-filter: blur(8px); padding: 8px 20px; border-radius: 999px; border: 1px solid rgba(255,255,255,0.15); align-items: center; }
    button { background: none; border: none; color: #fff; font-size: 16px; cursor: pointer; padding: 4px 8px; }
    #counter { font-family: monospace; font-weight: bold; font-size: 14px; }
  </style>
</head>
<body>
  <div class="slide-deck-stage">
    ${slides.map((s, idx) => `
    <div class="slide ${idx === 0 ? 'active' : ''}" id="slide-${idx}">
      <div style="display:flex; justify-content:space-between; align-items:center;">
        <span class="tag">${escapeHtml(s.tag || 'SLIDE')}</span>
        <span style="font-family:monospace; opacity:0.6; font-size:1vw;">${String(idx + 1).padStart(2, '0')} / ${String(slides.length).padStart(2, '0')}</span>
      </div>
      <div style="margin: auto 0;">
        <h1>${escapeHtml(s.title)}</h1>
        ${s.subtitle ? `<p>${escapeHtml(s.subtitle)}</p>` : ''}
        <ul>
          ${s.bullets.map(b => `<li><span class="dot">&#10148;</span> <span>${escapeHtml(b)}</span></li>`).join('')}
        </ul>
      </div>
      <div style="display:flex; justify-content:space-between; opacity:0.5; font-size:0.9vw; border-top:1px solid rgba(255,255,255,0.1); padding-top:0.8vw;">
        <span>ALL-IN-ONE PRESENTATION</span>
        <span>${escapeHtml(s.title)}</span>
      </div>
    </div>`).join('')}
  </div>

  <div class="hud">
    <button id="prevBtn">&larr;</button>
    <span id="counter">1 / ${slides.length}</span>
    <button id="nextBtn">&rarr;</button>
  </div>

  <script>
    let cur = 0;
    const total = ${slides.length};
    const slidesEl = document.querySelectorAll('.slide');
    const counterEl = document.getElementById('counter');
    function show(i) {
      if (i < 0 || i >= total) return;
      slidesEl[cur].classList.remove('active');
      cur = i;
      slidesEl[cur].classList.add('active');
      counterEl.textContent = (cur + 1) + ' / ' + total;
    }
    document.getElementById('prevBtn').onclick = () => show(cur - 1);
    document.getElementById('nextBtn').onclick = () => show(cur + 1);
    window.onkeydown = (e) => {
      if (e.key === 'ArrowRight' || e.key === ' ') show(cur + 1);
      if (e.key === 'ArrowLeft') show(cur - 1);
    };
  <\/script>
</body>
</html>`;

    const blob = new Blob([htmlDeck], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'presentation-deck.html';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showToast('Downloaded standalone HTML slide deck');
  });

  // Initialize with Executive Pitch sample
  markdownInput.value = SAMPLE_PITCH;
  slides = parseMarkdown(SAMPLE_PITCH);
  renderActiveSlide();
});