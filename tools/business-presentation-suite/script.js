// Business Presentation Suite - Interactive Slideshow Deck Builder

const DEFAULT_SLIDES = [
  {
    id: "slide-1",
    type: "summary",
    title: "Executive Briefing & Strategic Overview",
    subtitle: "Global Enterprise Transformation • Fiscal Year 2026-2027",
    notes: "Welcome board members and stakeholders. Frame this briefing around high-velocity expansion and disciplined capital allocation.",
    data: {
      narrative: "OmniCorp continues to define operational excellence by combining next-generation autonomous software with mission-critical cloud infrastructure.",
      presenter: "Presented by OmniCorp Executive Leadership Team",
      pillars: [
        { title: "Market Dominance", desc: "Leading AI-augmented cloud operations across Fortune 500 enterprise accounts." },
        { title: "Capital Efficiency", desc: "Profitable unit economics paired with 45% compound ARR expansion." },
        { title: "Global Reach", desc: "Operating in 28 countries with continuous 99.999% uptime SLA adherence." }
      ]
    }
  },
  {
    id: "slide-2",
    type: "mission",
    title: "Our Mission, Vision & Strategic Values",
    subtitle: "Guiding Principles Driving Long-Term Shareholder Value",
    notes: "Highlight our continuous alignment between foundational values and retention metrics. Remind the board of our 2030 north star.",
    data: {
      mission: "To empower global enterprises through resilient, autonomous intelligence systems that accelerate human ingenuity.",
      vision: "Establish the definitive standard for enterprise workflow orchestration by 2030.",
      values: [
        { title: "Relentless Rigor", desc: "Unyielding commitment to operational precision, data security, and platform stability." },
        { title: "Customer Obsession", desc: "Designing mission-critical solutions that eliminate existential operational bottlenecks." },
        { title: "Velocity with Purpose", desc: "Shipping high-impact capabilities rapidly without ever compromising compliance." }
      ]
    }
  },
  {
    id: "slide-3",
    type: "market",
    title: "Total Addressable Market & Industry Tailwinds",
    subtitle: "Rapidly Expanding Enterprise Automation Sector",
    notes: "Emphasize our low current market penetration and immense expansion runway across North America, EMEA, and APAC.",
    data: {
      tam: "$48.5B",
      tamLabel: "Global Addressable Spend by 2028",
      sam: "$18.2B",
      samLabel: "Core Enterprise Cloud Sector",
      som: "$4.2B",
      somLabel: "Immediate High-Intent Pipeline",
      drivers: "Structural multi-cloud migration, real-time intelligence mandates, and heightened regulatory compliance requirements driving 38% CAGR enterprise adoption."
    }
  },
  {
    id: "slide-4",
    type: "kpi",
    title: "Executive KPI Performance Scorecard",
    subtitle: "Consistent Trajectory Across Key Operational Benchmarks",
    notes: "Focus on Net Revenue Retention of 128%, proving our ability to expand within existing enterprise logos without proportional acquisition cost.",
    data: {
      metrics: [
        { label: "Annual Recurring Revenue", val: "$28.4M", sub: "+45% YoY Growth" },
        { label: "Net Revenue Retention", val: "128%", sub: "Top Decile Benchmark" },
        { label: "CAC Payback Period", val: "7.2 Mo", sub: "22% Faster Than Target" },
        { label: "Enterprise CSAT", val: "96.4%", sub: "4.9 / 5.0 Rating" }
      ]
    }
  },
  {
    id: "slide-5",
    type: "roadmap",
    title: "Strategic Product & Growth Roadmap",
    subtitle: "Execution Milestones Across Fiscal Quarters",
    notes: "Walk through milestones and reiterate on-time delivery across all core engineering tracks and compliance audits.",
    data: {
      milestones: [
        { quarter: "Q1", title: "AI Engine GA", status: "Completed", desc: "Autonomous orchestration engine deployed to tier-1 enterprise accounts." },
        { quarter: "Q2", title: "Global Expansion", status: "In Progress", desc: "Dedicated cloud zones established in Frankfurt and Singapore." },
        { quarter: "Q3", title: "FedRAMP & SOC2", status: "Scheduled", desc: "Finalizing rigorous defense & federal security compliance credentials." },
        { quarter: "Q4", title: "Partner Ecosystem", status: "Scheduled", desc: "Public developer SDK & certified integrations marketplace rollout." }
      ]
    }
  },
  {
    id: "slide-6",
    type: "financial",
    title: "Financial Health & Capital Allocation",
    subtitle: "Strong Margins, Sustained Growth & Cash Flow Positivity",
    notes: "Close with high confidence in our liquidity position and sustainable self-funding reinvestment into organic product innovation.",
    data: {
      metrics: [
        { label: "Gross Margin", val: "78.4%", sub: "+3.2% vs Prior Year" },
        { label: "EBITDA Margin", val: "24.1%", sub: "Profitable Run-Rate" },
        { label: "Free Cash Flow", val: "$6.8M", sub: "Self-Sustaining Operations" },
        { label: "Cash Runway", val: "38 Mo", sub: "Zero Debt Obligations" }
      ],
      commentary: "Disciplined operational expense management has enabled sustained margin expansion alongside accelerated market share acquisition."
    }
  }
];

let deck = JSON.parse(JSON.stringify(DEFAULT_SLIDES));
let activeSlideIndex = 0;

// Presenter timer
let presenterSeconds = 0;
let presenterTimerInterval = null;

document.addEventListener('DOMContentLoaded', () => {
  // Global buttons
  const btnPresentMode = document.getElementById('btn-present-mode');
  const btnQuickPresent = document.getElementById('btn-quick-present');
  const btnPrintDeck = document.getElementById('btn-print-deck');
  const btnExportJson = document.getElementById('btn-export-json');
  const btnExportHtml = document.getElementById('btn-export-html');

  // Navigation
  const btnPrevSlide = document.getElementById('btn-prev-slide');
  const btnNextSlide = document.getElementById('btn-next-slide');
  const btnMoveUp = document.getElementById('btn-move-up');
  const btnMoveDown = document.getElementById('btn-move-down');
  const btnAddSlide = document.getElementById('btn-add-slide');
  const btnDeleteSlide = document.getElementById('btn-delete-slide');

  // Editor inputs
  const editTitle = document.getElementById('edit-slide-title');
  const editSubtitle = document.getElementById('edit-slide-subtitle');
  const editNotes = document.getElementById('edit-speaker-notes');

  // HUD Elements
  const hudPrev = document.getElementById('hud-prev');
  const hudNext = document.getElementById('hud-next');
  const hudExit = document.getElementById('hud-exit');
  const hudNotesToggle = document.getElementById('hud-notes-toggle');

  // Wire event listeners
  if (btnPrevSlide) btnPrevSlide.addEventListener('click', prevSlide);
  if (btnNextSlide) btnNextSlide.addEventListener('click', nextSlide);

  if (btnMoveUp) btnMoveUp.addEventListener('click', moveSlideUp);
  if (btnMoveDown) btnMoveDown.addEventListener('click', moveSlideDown);
  if (btnAddSlide) btnAddSlide.addEventListener('click', addNewSlide);
  if (btnDeleteSlide) btnDeleteSlide.addEventListener('click', deleteCurrentSlide);

  // Presenter mode triggers
  if (btnPresentMode) btnPresentMode.addEventListener('click', openPresenterMode);
  if (btnQuickPresent) btnQuickPresent.addEventListener('click', openPresenterMode);
  if (hudExit) hudExit.addEventListener('click', closePresenterMode);
  if (hudPrev) hudPrev.addEventListener('click', prevSlide);
  if (hudNext) hudNext.addEventListener('click', nextSlide);
  if (hudNotesToggle) hudNotesToggle.addEventListener('click', toggleHudNotes);

  // Export & Print
  if (btnPrintDeck) btnPrintDeck.addEventListener('click', printEntireDeck);
  if (btnExportJson) btnExportJson.addEventListener('click', exportDeckAsJson);
  if (btnExportHtml) btnExportHtml.addEventListener('click', exportStandaloneHtmlDeck);

  // Real-time slide editor sync
  if (editTitle) {
    editTitle.addEventListener('input', () => {
      deck[activeSlideIndex].title = editTitle.value;
      renderCurrentSlide();
      renderThumbnails();
    });
  }

  if (editSubtitle) {
    editSubtitle.addEventListener('input', () => {
      deck[activeSlideIndex].subtitle = editSubtitle.value;
      renderCurrentSlide();
    });
  }

  if (editNotes) {
    editNotes.addEventListener('input', () => {
      deck[activeSlideIndex].notes = editNotes.value;
      updateHudNotes();
    });
  }

  // Keyboard navigation & F5 shortcut
  window.addEventListener('keydown', handleGlobalKeydown);

  // Touch Swipe for Mobile & Tablet presentation
  setupTouchSwipe();

  // Initial render
  renderThumbnails();
  renderCurrentSlide();
  populateEditorFields();
});

function handleGlobalKeydown(e) {
  const isPresenter = document.getElementById('presenter-fullscreen-container')?.classList.contains('active');

  if (e.key === 'F5') {
    e.preventDefault();
    if (isPresenter) {
      closePresenterMode();
    } else {
      openPresenterMode();
    }
  } else if (e.key === 'Escape' && isPresenter) {
    closePresenterMode();
  } else if (e.key === 'ArrowRight' || e.key === 'PageDown' || (isPresenter && e.key === ' ')) {
    if (isPresenter || !['INPUT', 'TEXTAREA'].includes(document.activeElement.tagName)) {
      e.preventDefault();
      nextSlide();
    }
  } else if (e.key === 'ArrowLeft' || e.key === 'PageUp' || (isPresenter && e.key === 'Backspace')) {
    if (isPresenter || !['INPUT', 'TEXTAREA'].includes(document.activeElement.tagName)) {
      e.preventDefault();
      prevSlide();
    }
  }
}

function setupTouchSwipe() {
  let touchStartX = 0;
  let touchStartY = 0;

  window.addEventListener('touchstart', (e) => {
    touchStartX = e.changedTouches[0].screenX;
    touchStartY = e.changedTouches[0].screenY;
  }, { passive: true });

  window.addEventListener('touchend', (e) => {
    const touchEndX = e.changedTouches[0].screenX;
    const touchEndY = e.changedTouches[0].screenY;
    const diffX = touchEndX - touchStartX;
    const diffY = touchEndY - touchStartY;

    if (Math.abs(diffX) > 60 && Math.abs(diffY) < 100) {
      if (diffX < 0) {
        nextSlide();
      } else {
        prevSlide();
      }
    }
  }, { passive: true });
}

function nextSlide() {
  if (activeSlideIndex < deck.length - 1) {
    activeSlideIndex++;
    updateSlideView();
  }
}

function prevSlide() {
  if (activeSlideIndex > 0) {
    activeSlideIndex--;
    updateSlideView();
  }
}

function updateSlideView() {
  renderThumbnails();
  renderCurrentSlide();
  populateEditorFields();
  updatePresenterHud();
}

function renderThumbnails() {
  const list = document.getElementById('thumbnail-list');
  const countBadge = document.getElementById('slide-count-badge');
  if (countBadge) countBadge.textContent = deck.length;
  if (!list) return;

  list.innerHTML = deck.map((slide, idx) => `
    <div class="slide-thumb-card ${idx === activeSlideIndex ? 'active' : ''}" onclick="window.selectSlide(${idx})">
      <div class="slide-thumb-number">${idx + 1}</div>
      <div class="slide-thumb-info">
        <div class="slide-thumb-title">${escapeHtml(slide.title)}</div>
        <div class="slide-thumb-type">${escapeHtml(slide.type)}</div>
      </div>
    </div>
  `).join('');
}

window.selectSlide = function(index) {
  if (index >= 0 && index < deck.length) {
    activeSlideIndex = index;
    updateSlideView();
  }
};

function moveSlideUp() {
  if (activeSlideIndex > 0) {
    const temp = deck[activeSlideIndex];
    deck[activeSlideIndex] = deck[activeSlideIndex - 1];
    deck[activeSlideIndex - 1] = temp;
    activeSlideIndex--;
    updateSlideView();
    showToast('Moved slide up.');
  }
}

function moveSlideDown() {
  if (activeSlideIndex < deck.length - 1) {
    const temp = deck[activeSlideIndex];
    deck[activeSlideIndex] = deck[activeSlideIndex + 1];
    deck[activeSlideIndex + 1] = temp;
    activeSlideIndex++;
    updateSlideView();
    showToast('Moved slide down.');
  }
}

function addNewSlide() {
  const newId = `slide-${Date.now()}`;
  const newSlide = {
    id: newId,
    type: "custom",
    title: "New Strategic Slide",
    subtitle: "Custom Key Executive Deliverables",
    notes: "Talking points for this slide.",
    data: {
      content: "Enter your strategic bullets or metrics here."
    }
  };
  deck.push(newSlide);
  activeSlideIndex = deck.length - 1;
  updateSlideView();
  showToast('Added new slide to deck.');
}

function deleteCurrentSlide() {
  if (deck.length <= 1) {
    showToast('Cannot delete the only slide in the deck.');
    return;
  }
  const removed = deck.splice(activeSlideIndex, 1)[0];
  if (activeSlideIndex >= deck.length) {
    activeSlideIndex = deck.length - 1;
  }
  updateSlideView();
  showToast(`Deleted "${removed.title}".`);
}

function generateSlideHtml(slide, isPresenter = false) {
  let contentHtml = '';

  switch (slide.type) {
    case 'summary':
      contentHtml = `
        <div style="font-size: clamp(0.9rem, 1.4vw, 1.15rem); line-height: 1.6; color: rgba(255,255,255,0.85); margin-bottom: 1.25rem;">
          ${escapeHtml(slide.data.narrative || '')}
        </div>
        <div class="slide-grid-3">
          ${(slide.data.pillars || []).map(p => `
            <div class="slide-metric-card">
              <div style="font-size: clamp(0.85rem, 1.2vw, 1.05rem); font-weight: 700; color: var(--accent); margin-bottom: 0.35rem;">${escapeHtml(p.title)}</div>
              <div style="font-size: clamp(0.75rem, 1vw, 0.9rem); color: rgba(255,255,255,0.7); line-height: 1.5;">${escapeHtml(p.desc)}</div>
            </div>
          `).join('')}
        </div>
        <div style="font-size: 0.8rem; color: rgba(255,255,255,0.5); margin-top: 1.25rem; font-style: italic;">
          ${escapeHtml(slide.data.presenter || '')}
        </div>
      `;
      break;

    case 'mission':
      contentHtml = `
        <div style="background: rgba(255,255,255,0.03); border-left: 3px solid var(--accent); padding: 1rem 1.25rem; border-radius: 4px; margin-bottom: 1.25rem;">
          <div style="font-size: 0.75rem; text-transform: uppercase; color: var(--accent); font-weight: 700; letter-spacing: 0.05em; margin-bottom: 0.25rem;">Our Mission</div>
          <div style="font-size: clamp(0.95rem, 1.5vw, 1.2rem); font-weight: 600; color: #ffffff;">"${escapeHtml(slide.data.mission || '')}"</div>
        </div>
        <div class="slide-grid-3">
          ${(slide.data.values || []).map(v => `
            <div class="slide-metric-card">
              <div style="font-size: clamp(0.85rem, 1.2vw, 1.05rem); font-weight: 700; color: #ffffff; margin-bottom: 0.35rem;">${escapeHtml(v.title)}</div>
              <div style="font-size: clamp(0.75rem, 1vw, 0.9rem); color: rgba(255,255,255,0.7); line-height: 1.5;">${escapeHtml(v.desc)}</div>
            </div>
          `).join('')}
        </div>
      `;
      break;

    case 'market':
      contentHtml = `
        <div class="slide-grid-3" style="margin-bottom: 1.25rem;">
          <div class="slide-metric-card">
            <div class="slide-metric-label">Total Addressable Market</div>
            <div class="slide-metric-value">${escapeHtml(slide.data.tam || '$48B')}</div>
            <div class="slide-metric-sub">${escapeHtml(slide.data.tamLabel || '')}</div>
          </div>
          <div class="slide-metric-card">
            <div class="slide-metric-label">Serviceable Available</div>
            <div class="slide-metric-value" style="color: #60a5fa;">${escapeHtml(slide.data.sam || '$18B')}</div>
            <div class="slide-metric-sub" style="color: #60a5fa;">${escapeHtml(slide.data.samLabel || '')}</div>
          </div>
          <div class="slide-metric-card">
            <div class="slide-metric-label">Serviceable Obtainable</div>
            <div class="slide-metric-value" style="color: var(--success);">${escapeHtml(slide.data.som || '$4.2B')}</div>
            <div class="slide-metric-sub">${escapeHtml(slide.data.somLabel || '')}</div>
          </div>
        </div>
        <div style="background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.08); padding: 1rem; border-radius: var(--radius-md); font-size: clamp(0.8rem, 1.1vw, 0.95rem); color: rgba(255,255,255,0.8); line-height: 1.6;">
          <strong>Strategic Tailwinds:</strong> ${escapeHtml(slide.data.drivers || '')}
        </div>
      `;
      break;

    case 'kpi':
      contentHtml = `
        <div class="slide-grid-4">
          ${(slide.data.metrics || []).map(m => `
            <div class="slide-metric-card">
              <div class="slide-metric-label">${escapeHtml(m.label)}</div>
              <div class="slide-metric-value">${escapeHtml(m.val)}</div>
              <div class="slide-metric-sub">${escapeHtml(m.sub)}</div>
            </div>
          `).join('')}
        </div>
      `;
      break;

    case 'roadmap':
      contentHtml = `
        <div class="roadmap-track">
          ${(slide.data.milestones || []).map(m => `
            <div class="roadmap-node">
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.35rem;">
                <span style="font-weight: 800; font-size: 0.85rem; color: var(--accent);">${escapeHtml(m.quarter)}</span>
                <span style="font-size: 0.65rem; font-weight: 600; padding: 0.15rem 0.4rem; border-radius: 99px; background: rgba(255,255,255,0.1); color: #ffffff;">${escapeHtml(m.status)}</span>
              </div>
              <div style="font-weight: 700; font-size: clamp(0.8rem, 1.1vw, 0.95rem); color: #ffffff; margin-bottom: 0.25rem;">${escapeHtml(m.title)}</div>
              <div style="font-size: clamp(0.7rem, 0.95vw, 0.8rem); color: rgba(255,255,255,0.65); line-height: 1.4;">${escapeHtml(m.desc)}</div>
            </div>
          `).join('')}
        </div>
      `;
      break;

    case 'financial':
      contentHtml = `
        <div class="slide-grid-4" style="margin-bottom: 1.25rem;">
          ${(slide.data.metrics || []).map(m => `
            <div class="slide-metric-card">
              <div class="slide-metric-label">${escapeHtml(m.label)}</div>
              <div class="slide-metric-value">${escapeHtml(m.val)}</div>
              <div class="slide-metric-sub">${escapeHtml(m.sub)}</div>
            </div>
          `).join('')}
        </div>
        <div style="background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.08); padding: 0.85rem 1rem; border-radius: var(--radius-md); font-size: clamp(0.8rem, 1.1vw, 0.95rem); color: rgba(255,255,255,0.75);">
          ${escapeHtml(slide.data.commentary || '')}
        </div>
      `;
      break;

    default:
      contentHtml = `
        <div style="font-size: clamp(0.95rem, 1.5vw, 1.2rem); color: rgba(255,255,255,0.85); line-height: 1.7; background: rgba(255,255,255,0.03); padding: 1.5rem; border-radius: var(--radius-md); border: 1px solid rgba(255,255,255,0.08);">
          ${escapeHtml(slide.data.content || 'Custom presentation content.')}
        </div>
      `;
  }

  return `
    <div class="slide-header-area">
      <h2>${escapeHtml(slide.title)}</h2>
      <p>${escapeHtml(slide.subtitle)}</p>
    </div>
    <div class="slide-content-area">
      ${contentHtml}
    </div>
    <div class="slide-watermark">
      OmniCorp Executive Suite • Confidential
    </div>
  `;
}

function renderCurrentSlide() {
  const stage = document.getElementById('slide-stage');
  const curNum = document.getElementById('current-slide-num');
  const totalNum = document.getElementById('total-slides-num');
  if (curNum) curNum.textContent = activeSlideIndex + 1;
  if (totalNum) totalNum.textContent = deck.length;

  if (stage && deck[activeSlideIndex]) {
    stage.innerHTML = generateSlideHtml(deck[activeSlideIndex]);
  }
}

function populateEditorFields() {
  const slide = deck[activeSlideIndex];
  if (!slide) return;

  const editTitle = document.getElementById('edit-slide-title');
  const editSubtitle = document.getElementById('edit-slide-subtitle');
  const editNotes = document.getElementById('edit-speaker-notes');
  const customContainer = document.getElementById('slide-custom-editor-fields');

  if (editTitle) editTitle.value = slide.title;
  if (editSubtitle) editSubtitle.value = slide.subtitle;
  if (editNotes) editNotes.value = slide.notes || '';

  if (!customContainer) return;
  customContainer.innerHTML = '';

  // Specific editable fields per slide type
  if (slide.type === 'summary') {
    customContainer.innerHTML = `
      <div class="form-group">
        <label>Executive Narrative Summary</label>
        <textarea class="form-textarea" id="custom-narrative" style="min-height: 60px;">${escapeHtml(slide.data.narrative || '')}</textarea>
      </div>
    `;
    document.getElementById('custom-narrative')?.addEventListener('input', (e) => {
      slide.data.narrative = e.target.value;
      renderCurrentSlide();
    });
  } else if (slide.type === 'mission') {
    customContainer.innerHTML = `
      <div class="form-group">
        <label>Mission Statement</label>
        <input type="text" class="form-input" id="custom-mission" value="${escapeHtml(slide.data.mission || '')}">
      </div>
    `;
    document.getElementById('custom-mission')?.addEventListener('input', (e) => {
      slide.data.mission = e.target.value;
      renderCurrentSlide();
    });
  } else if (slide.type === 'market') {
    customContainer.innerHTML = `
      <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 0.5rem;">
        <div class="form-group">
          <label>TAM Metric</label>
          <input type="text" class="form-input" id="custom-tam" value="${escapeHtml(slide.data.tam || '')}">
        </div>
        <div class="form-group">
          <label>SAM Metric</label>
          <input type="text" class="form-input" id="custom-sam" value="${escapeHtml(slide.data.sam || '')}">
        </div>
        <div class="form-group">
          <label>SOM Metric</label>
          <input type="text" class="form-input" id="custom-som" value="${escapeHtml(slide.data.som || '')}">
        </div>
      </div>
    `;
    ['tam', 'sam', 'som'].forEach(k => {
      document.getElementById(`custom-${k}`)?.addEventListener('input', (e) => {
        slide.data[k] = e.target.value;
        renderCurrentSlide();
      });
    });
  } else if (slide.type === 'custom') {
    customContainer.innerHTML = `
      <div class="form-group">
        <label>Slide Content Text</label>
        <textarea class="form-textarea" id="custom-content" style="min-height: 80px;">${escapeHtml(slide.data.content || '')}</textarea>
      </div>
    `;
    document.getElementById('custom-content')?.addEventListener('input', (e) => {
      slide.data.content = e.target.value;
      renderCurrentSlide();
    });
  }
}

// Presenter Mode Logic
function openPresenterMode() {
  const container = document.getElementById('presenter-fullscreen-container');
  if (!container) return;

  container.classList.add('active');
  try {
    if (document.documentElement.requestFullscreen && !document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
    }
  } catch (err) {}

  // Start elapsed timer
  presenterSeconds = 0;
  clearInterval(presenterTimerInterval);
  presenterTimerInterval = setInterval(() => {
    presenterSeconds++;
    const mins = String(Math.floor(presenterSeconds / 60)).padStart(2, '0');
    const secs = String(presenterSeconds % 60).padStart(2, '0');
    const timerEl = document.getElementById('hud-timer');
    if (timerEl) timerEl.textContent = `${mins}:${secs}`;
  }, 1000);

  updatePresenterHud();
}

function closePresenterMode() {
  const container = document.getElementById('presenter-fullscreen-container');
  if (container) container.classList.remove('active');
  clearInterval(presenterTimerInterval);

  try {
    if (document.exitFullscreen && document.fullscreenElement) {
      document.exitFullscreen().catch(() => {});
    }
  } catch (err) {}
}

function updatePresenterHud() {
  const stage = document.getElementById('presenter-slide-stage');
  const indicator = document.getElementById('hud-slide-indicator');

  if (indicator) indicator.textContent = `${activeSlideIndex + 1} / ${deck.length}`;
  if (stage && deck[activeSlideIndex]) {
    stage.innerHTML = generateSlideHtml(deck[activeSlideIndex], true);
  }

  updateHudNotes();
}

function toggleHudNotes() {
  const box = document.getElementById('hud-notes-box');
  if (!box) return;
  box.style.display = box.style.display === 'block' ? 'none' : 'block';
  updateHudNotes();
}

function updateHudNotes() {
  const notesContent = document.getElementById('hud-notes-content');
  if (notesContent && deck[activeSlideIndex]) {
    notesContent.textContent = deck[activeSlideIndex].notes || 'No notes for this slide.';
  }
}

// Print All Slides
function printEntireDeck() {
  const printContainer = document.getElementById('print-all-slides-container');
  if (!printContainer) return;

  printContainer.innerHTML = deck.map(slide => `
    <div class="print-slide-page">
      ${generateSlideHtml(slide)}
    </div>
  `).join('');

  window.print();
}

// Export Deck JSON
function exportDeckAsJson() {
  const jsonStr = JSON.stringify(deck, null, 2);
  const blob = new Blob([jsonStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `corporate-presentation-deck.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
  showToast('Exported presentation deck JSON.');
}

// Export Standalone HTML Presentation
function exportStandaloneHtmlDeck() {
  const serializedDeck = JSON.stringify(deck);

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Executive Presentation Deck</title>
  <style>
    body { margin: 0; background: #090c12; color: #ffffff; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; display: flex; align-items: center; justify-content: center; height: 100vh; overflow: hidden; }
    .stage { width: 90vw; max-width: 1280px; aspect-ratio: 16/9; background: radial-gradient(circle at 20% 20%, #1e2638 0%, #0c0f17 100%); border: 1px solid rgba(255,255,255,0.15); border-radius: 16px; padding: 3rem; box-sizing: border-box; display: flex; flex-direction: column; justify-content: space-between; box-shadow: 0 20px 50px rgba(0,0,0,0.6); position: relative; }
    .header h2 { font-size: 2.2rem; margin: 0; }
    .header p { color: rgba(255,255,255,0.6); margin-top: 0.5rem; font-size: 1.1rem; }
    .grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1rem; margin-top: 1.5rem; }
    .card { background: rgba(255,255,255,0.05); padding: 1.25rem; border-radius: 8px; border: 1px solid rgba(255,255,255,0.1); }
    .hud { position: fixed; bottom: 20px; display: flex; gap: 15px; background: rgba(15,23,42,0.9); padding: 8px 20px; border-radius: 99px; border: 1px solid rgba(255,255,255,0.2); }
    button { background: none; border: none; color: #fff; cursor: pointer; font-size: 1rem; font-weight: bold; }
  </style>
</head>
<body>
  <div class="stage" id="stage"></div>
  <div class="hud">
    <button onclick="prev()">&larr; Prev</button>
    <span id="counter">1 / ${deck.length}</span>
    <button onclick="next()">Next &rarr;</button>
  </div>
  <script>
    const deck = ${serializedDeck};
    let cur = 0;
    function render() {
      const s = deck[cur];
      document.getElementById('counter').innerText = (cur + 1) + ' / ' + deck.length;
      document.getElementById('stage').innerHTML = '<div class="header"><h2>' + s.title + '</h2><p>' + s.subtitle + '</p></div><div><p style="font-size: 1.2rem; line-height: 1.6;">' + (s.data.narrative || s.data.mission || s.data.drivers || s.data.content || '') + '</p></div><div style="font-size:0.8rem; opacity:0.5;">Confidential Presentation</div>';
    }
    function next() { if (cur < deck.length - 1) { cur++; render(); } }
    function prev() { if (cur > 0) { cur--; render(); } }
    window.addEventListener('keydown', e => { if (e.key === 'ArrowRight' || e.key === ' ') next(); if (e.key === 'ArrowLeft') prev(); });
    render();
  </script>
</body>
</html>`;

  const blob = new Blob([html], { type: 'text/html' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.download = 'presentation-deck-standalone.html';
  a.href = url;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
  showToast('Downloaded standalone HTML presentation.');
}

function escapeHtml(str) {
  if (typeof str !== 'string') return '';
  return str.replace(/&/g, '&amp;').replace(/'/g, '&#39;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function showToast(message) {
  const toast = document.getElementById('toast');
  if (!toast) return;
  toast.textContent = message;
  toast.style.display = 'flex';
  toast.style.transform = 'translateY(0)';
  
  clearTimeout(toast._timeout);
  toast._timeout = setTimeout(() => {
    toast.style.transform = 'translateY(10px)';
    toast.style.display = 'none';
  }, 2800);
}