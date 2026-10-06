// Travel Agency Presentation Maker - Tour Proposal Slide Builder

const DEFAULT_TRAVEL_SLIDES = [
  {
    id: "travel-1",
    type: "overview",
    title: "Amalfi Coast & Capri Luxury Odyssey",
    subtitle: "7 Days / 6 Nights Exclusive Mediterranean Voyage",
    notes: "Welcome the clients to their bespoke itinerary proposal. Emphasize private yacht charter, handpicked cliffside suites, and complete private flexibility.",
    data: {
      destination: "Amalfi Coast & Isle of Capri, Italy",
      duration: "7 Days / 6 Nights",
      style: "Ultra-Luxury Private Tour",
      summary: "Immerse yourself in the sun-drenched romance of the Mediterranean. Cruise around Capri on a private Riva yacht, savor Michelin-starred cliffside dining, and awaken to breathtaking panoramas over the azure Tyrrhenian Sea.",
      dates: "Spring / Summer 2027 • Flexible Private Departure"
    }
  },
  {
    id: "travel-2",
    type: "highlights",
    title: "Enchanting Destination Highlights",
    subtitle: "Unmatched Panoramas Across Positano, Capri & Ravello",
    notes: "Walk clients through each iconic highlight. Emphasize our private skip-the-line access, private boat captains, and after-hours garden access.",
    data: {
      highlights: [
        { title: "Cliffside Positano", tag: "Coastline", desc: "Pastel villas cascading into the sea, fragrant lemon groves, and private sunset catamaran aperitivos." },
        { title: "Capri & Faraglioni Rocks", tag: "Private Yacht", desc: "Full-day chartered navigation through hidden sea grottos and emerald swimming coves." },
        { title: "Historic Ravello & Gardens", tag: "Culture & Wine", desc: "Villa Cimbrone's Infinity Terrace floating 1,200 feet above the sparkling Mediterranean." }
      ]
    }
  },
  {
    id: "travel-3",
    type: "itinerary",
    title: "Bespoke Day-by-Day Journey",
    subtitle: "Effortless Harmony of Curated Exploration & Private Leisure",
    notes: "Remind clients that all transfer timing, breakfast hours, and dining reservations are fully customizable according to their personal rhythm.",
    data: {
      days: [
        { day: "Day 1", title: "Naples to Positano", desc: "VIP airport meet & greet, chauffeured transfer, welcome champagne gala." },
        { day: "Day 2", title: "Positano & Culinary Class", desc: "Private organic cliffside farm pasta masterclass overlooking the coastal cliffs." },
        { day: "Day 3", title: "Private Riva Yacht to Capri", desc: "Full-day chartered cruise, swimming in secluded coves, Michelin lunch." },
        { day: "Day 4", title: "Ravello & Garden Concert", desc: "Exclusive tour of Villa Rufolo gardens and private cliffside chamber recital." },
        { day: "Day 5", title: "Pompeii VIP Archeologist Tour", desc: "After-hours private access to ancient ruins led by master archeologist." },
        { day: "Day 6-7", title: "Sunset Farewell & Departure", desc: "Private leisure morning, celebratory farewell dinner, chauffeured airport departure." }
      ]
    }
  },
  {
    id: "travel-4",
    type: "accommodations",
    title: "Handpicked 5-Star Accommodations",
    subtitle: "Leading Hotels of the World & Iconic Boutique Retreats",
    notes: "Both properties include guaranteed room upgrades upon availability and complimentary daily champagne breakfast.",
    data: {
      hotels: [
        {
          name: "Le Sirenuse, Positano",
          rating: "★★★★★ Luxury Boutique",
          room: "Deluxe Sea View Terrace Room",
          features: "Heated champagne pool, Aveda spa, candlelit La Sponda Michelin dining, cliffside views."
        },
        {
          name: "Capri Palace Jumeirah, Anacapri",
          rating: "★★★★★ Leading Hotels",
          room: "Capricorno Private Pool Suite",
          features: "Medical spa & beauty farm, private beach club access, 2-Michelin-star L'Olivo restaurant."
        }
      ]
    }
  },
  {
    id: "travel-5",
    type: "inclusions",
    title: "Curated Inclusions & Transparency",
    subtitle: "White-Glove VIP Service & Clear Terms",
    notes: "Point out that personal gratuities and transatlantic flights can be seamlessly arranged upon request.",
    data: {
      inclusions: [
        "6 Nights 5-Star Deluxe Terrace Accommodations",
        "Private Chauffeur Mercedes-Benz Transfers Throughout",
        "Full-Day Private Riva Yacht Charter with Captain & Open Bar",
        "Daily Gourmet Breakfast & 4 Curated Multi-Course Dinners",
        "VIP Skip-The-Line Access & Private Certified Historian Guides",
        "Dedicated 24/7 Agency Concierge Assistance"
      ],
      exclusions: [
        "International Transatlantic Flights",
        "Travel & Comprehensive Medical Insurance",
        "Discretionary Gratuities for Private Yacht Crew"
      ]
    }
  },
  {
    id: "travel-6",
    type: "pricing",
    title: "Investment Tiers & Reservation Details",
    subtitle: "Securing Your Mediterranean Dream Escape",
    notes: "Confirm that deposits are 100% refundable up to 45 days prior to arrival for maximum peace of mind.",
    data: {
      tiers: [
        { tier: "Classic Private", price: "$5,450", unit: "per guest", desc: "Double occupancy, Deluxe Terrace Suite, all chauffeured land transfers." },
        { tier: "Signature VIP", price: "$7,800", unit: "per guest", badge: "Most Popular", desc: "Sea View Penthouse, Private Riva Yacht Charter, all multi-course dinners." },
        { tier: "Ultra-Bespoke Villa", price: "$12,500", unit: "per guest", desc: "Exclusive 4-bedroom cliffside villa estate, helicopter transfers, private yacht 2 days." }
      ],
      terms: "25% deposit upon itinerary confirmation • Balance due 30 days prior • Fully flexible cancellation.",
      contact: "Odyssey Luxury Travel • bookings@odysseytravel.com • +1 (800) 555-VOYAGE"
    }
  }
];

let travelDeck = JSON.parse(JSON.stringify(DEFAULT_TRAVEL_SLIDES));
let activeSlideIndex = 0;

// Presenter Timer
let presenterSeconds = 0;
let presenterTimerInterval = null;

document.addEventListener('DOMContentLoaded', () => {
  // Global buttons
  const btnPresentMode = document.getElementById('btn-present-mode');
  const btnQuickPresent = document.getElementById('btn-quick-present');
  const btnPrintBrochure = document.getElementById('btn-print-brochure');
  const btnExportJson = document.getElementById('btn-export-json');
  const btnExportHtml = document.getElementById('btn-export-html');

  // Navigation
  const btnPrevSlide = document.getElementById('btn-prev-slide');
  const btnNextSlide = document.getElementById('btn-next-slide');
  const btnMoveUp = document.getElementById('btn-move-up');
  const btnMoveDown = document.getElementById('btn-move-down');
  const btnAddSlide = document.getElementById('btn-add-slide');
  const btnDeleteSlide = document.getElementById('btn-delete-slide');

  // Editor Inputs
  const editTitle = document.getElementById('edit-slide-title');
  const editSubtitle = document.getElementById('edit-slide-subtitle');
  const editNotes = document.getElementById('edit-speaker-notes');

  // HUD Elements
  const hudPrev = document.getElementById('hud-prev');
  const hudNext = document.getElementById('hud-next');
  const hudExit = document.getElementById('hud-exit');
  const hudNotesToggle = document.getElementById('hud-notes-toggle');

  // Event bindings
  if (btnPrevSlide) btnPrevSlide.addEventListener('click', prevSlide);
  if (btnNextSlide) btnNextSlide.addEventListener('click', nextSlide);
  if (btnMoveUp) btnMoveUp.addEventListener('click', moveSlideUp);
  if (btnMoveDown) btnMoveDown.addEventListener('click', moveSlideDown);
  if (btnAddSlide) btnAddSlide.addEventListener('click', addNewSlide);
  if (btnDeleteSlide) btnDeleteSlide.addEventListener('click', deleteCurrentSlide);

  if (btnPresentMode) btnPresentMode.addEventListener('click', openPresenterMode);
  if (btnQuickPresent) btnQuickPresent.addEventListener('click', openPresenterMode);
  if (hudExit) hudExit.addEventListener('click', closePresenterMode);
  if (hudPrev) hudPrev.addEventListener('click', prevSlide);
  if (hudNext) hudNext.addEventListener('click', nextSlide);
  if (hudNotesToggle) hudNotesToggle.addEventListener('click', toggleHudNotes);

  if (btnPrintBrochure) btnPrintBrochure.addEventListener('click', printTourBrochure);
  if (btnExportJson) btnExportJson.addEventListener('click', exportDeckAsJson);
  if (btnExportHtml) btnExportHtml.addEventListener('click', exportStandaloneHtmlDeck);

  // Real-time canvas editing
  if (editTitle) {
    editTitle.addEventListener('input', () => {
      travelDeck[activeSlideIndex].title = editTitle.value;
      renderCurrentSlide();
      renderThumbnails();
    });
  }

  if (editSubtitle) {
    editSubtitle.addEventListener('input', () => {
      travelDeck[activeSlideIndex].subtitle = editSubtitle.value;
      renderCurrentSlide();
    });
  }

  if (editNotes) {
    editNotes.addEventListener('input', () => {
      travelDeck[activeSlideIndex].notes = editNotes.value;
      updateHudNotes();
    });
  }

  // Keyboard navigation & F5 shortcut
  window.addEventListener('keydown', handleGlobalKeydown);

  // Touch swipe support
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
    if (isPresenter) closePresenterMode();
    else openPresenterMode();
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
      if (diffX < 0) nextSlide();
      else prevSlide();
    }
  }, { passive: true });
}

function nextSlide() {
  if (activeSlideIndex < travelDeck.length - 1) {
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
  if (countBadge) countBadge.textContent = travelDeck.length;
  if (!list) return;

  list.innerHTML = travelDeck.map((slide, idx) => `
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
  if (index >= 0 && index < travelDeck.length) {
    activeSlideIndex = index;
    updateSlideView();
  }
};

function moveSlideUp() {
  if (activeSlideIndex > 0) {
    const temp = travelDeck[activeSlideIndex];
    travelDeck[activeSlideIndex] = travelDeck[activeSlideIndex - 1];
    travelDeck[activeSlideIndex - 1] = temp;
    activeSlideIndex--;
    updateSlideView();
    showToast('Moved slide up.');
  }
}

function moveSlideDown() {
  if (activeSlideIndex < travelDeck.length - 1) {
    const temp = travelDeck[activeSlideIndex];
    travelDeck[activeSlideIndex] = travelDeck[activeSlideIndex + 1];
    travelDeck[activeSlideIndex + 1] = temp;
    activeSlideIndex++;
    updateSlideView();
    showToast('Moved slide down.');
  }
}

function addNewSlide() {
  const newId = `travel-${Date.now()}`;
  const newSlide = {
    id: newId,
    type: "custom",
    title: "Exclusive Tour Feature",
    subtitle: "Custom Itinerary Inclusions",
    notes: "Talking points for this custom feature.",
    data: {
      content: "Describe custom luxury experiences, flight details, or VIP arrangements."
    }
  };
  travelDeck.push(newSlide);
  activeSlideIndex = travelDeck.length - 1;
  updateSlideView();
  showToast('Added new proposal slide.');
}

function deleteCurrentSlide() {
  if (travelDeck.length <= 1) {
    showToast('Cannot delete the only slide in the proposal.');
    return;
  }
  const removed = travelDeck.splice(activeSlideIndex, 1)[0];
  if (activeSlideIndex >= travelDeck.length) {
    activeSlideIndex = travelDeck.length - 1;
  }
  updateSlideView();
  showToast(`Deleted "${removed.title}".`);
}

function generateSlideHtml(slide) {
  let contentHtml = '';

  switch (slide.type) {
    case 'overview':
      contentHtml = `
        <div style="display: flex; gap: 0.5rem; flex-wrap: wrap; margin-bottom: 1rem;">
          <span class="travel-pill">
            <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
            ${escapeHtml(slide.data.duration || '7 Days / 6 Nights')}
          </span>
          <span class="travel-pill">
            <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
            ${escapeHtml(slide.data.destination || 'Mediterranean')}
          </span>
          <span class="travel-pill" style="border-color: #06b6d4; color: #06b6d4; background: rgba(6, 182, 212, 0.15);">
            ${escapeHtml(slide.data.style || 'VIP Luxury')}
          </span>
        </div>
        <div style="font-size: clamp(0.95rem, 1.5vw, 1.15rem); line-height: 1.7; color: rgba(255,255,255,0.9); margin-bottom: 1.25rem;">
          ${escapeHtml(slide.data.summary || '')}
        </div>
        <div style="font-size: 0.85rem; color: #10b981; font-weight: 600;">
          ${escapeHtml(slide.data.dates || '')}
        </div>
      `;
      break;

    case 'highlights':
      contentHtml = `
        <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 1rem;">
          ${(slide.data.highlights || []).map(h => `
            <div class="travel-card">
              <span style="font-size: 0.7rem; text-transform: uppercase; color: #10b981; font-weight: 700; letter-spacing: 0.05em; display: block; margin-bottom: 0.35rem;">
                ${escapeHtml(h.tag)}
              </span>
              <div style="font-size: clamp(0.85rem, 1.2vw, 1.05rem); font-weight: 700; color: #ffffff; margin-bottom: 0.35rem;">
                ${escapeHtml(h.title)}
              </div>
              <div style="font-size: clamp(0.75rem, 1vw, 0.85rem); color: rgba(255,255,255,0.7); line-height: 1.5;">
                ${escapeHtml(h.desc)}
              </div>
            </div>
          `).join('')}
        </div>
      `;
      break;

    case 'itinerary':
      contentHtml = `
        <div class="itinerary-scroll">
          ${(slide.data.days || []).map(d => `
            <div class="itinerary-item">
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.25rem;">
                <span style="font-weight: 800; font-size: 0.8rem; color: #10b981;">${escapeHtml(d.day)}</span>
              </div>
              <div style="font-weight: 700; font-size: clamp(0.75rem, 1.1vw, 0.9rem); color: #ffffff; margin-bottom: 0.25rem;">
                ${escapeHtml(d.title)}
              </div>
              <div style="font-size: clamp(0.65rem, 0.9vw, 0.75rem); color: rgba(255,255,255,0.7); line-height: 1.4;">
                ${escapeHtml(d.desc)}
              </div>
            </div>
          `).join('')}
        </div>
      `;
      break;

    case 'accommodations':
      contentHtml = `
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1.25rem;">
          ${(slide.data.hotels || []).map(h => `
            <div class="travel-card" style="border-left: 3px solid #10b981;">
              <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 0.35rem;">
                <div style="font-weight: 700; font-size: clamp(0.95rem, 1.3vw, 1.15rem); color: #ffffff;">${escapeHtml(h.name)}</div>
                <span style="font-size: 0.75rem; color: #f59e0b; font-weight: 600;">${escapeHtml(h.rating)}</span>
              </div>
              <div style="font-size: 0.85rem; color: #10b981; font-weight: 600; margin-bottom: 0.5rem;">${escapeHtml(h.room)}</div>
              <div style="font-size: clamp(0.75rem, 1vw, 0.85rem); color: rgba(255,255,255,0.7); line-height: 1.5;">${escapeHtml(h.features)}</div>
            </div>
          `).join('')}
        </div>
      `;
      break;

    case 'inclusions':
      contentHtml = `
        <div style="display: grid; grid-template-columns: 1.2fr 1fr; gap: 1.5rem;">
          <div class="travel-card">
            <div style="font-size: 0.85rem; text-transform: uppercase; color: #10b981; font-weight: 700; margin-bottom: 0.75rem; display: flex; align-items: center; gap: 0.4rem;">
              <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"></polyline></svg>
              What is Included in Your Tour:
            </div>
            <div style="display: flex; flex-direction: column; gap: 0.45rem; font-size: clamp(0.75rem, 1vw, 0.85rem); color: rgba(255,255,255,0.85);">
              ${(slide.data.inclusions || []).map(inc => `
                <div style="display: flex; align-items: flex-start; gap: 0.4rem;">
                  <span style="color: #10b981; font-weight: bold;">✓</span>
                  <span>${escapeHtml(inc)}</span>
                </div>
              `).join('')}
            </div>
          </div>

          <div class="travel-card">
            <div style="font-size: 0.85rem; text-transform: uppercase; color: rgba(255,255,255,0.5); font-weight: 700; margin-bottom: 0.75rem;">
              What is Not Included:
            </div>
            <div style="display: flex; flex-direction: column; gap: 0.45rem; font-size: clamp(0.75rem, 1vw, 0.85rem); color: rgba(255,255,255,0.6);">
              ${(slide.data.exclusions || []).map(exc => `
                <div style="display: flex; align-items: flex-start; gap: 0.4rem;">
                  <span style="opacity: 0.5;">–</span>
                  <span>${escapeHtml(exc)}</span>
                </div>
              `).join('')}
            </div>
          </div>
        </div>
      `;
      break;

    case 'pricing':
      contentHtml = `
        <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 1rem; margin-bottom: 1rem;">
          ${(slide.data.tiers || []).map(t => `
            <div class="travel-card" style="${t.badge ? 'border-color: #10b981; box-shadow: 0 0 15px rgba(16, 185, 129, 0.2);' : ''}">
              ${t.badge ? `<span style="font-size: 0.65rem; background: #10b981; color: #000; padding: 0.15rem 0.45rem; border-radius: 99px; font-weight: 800; text-transform: uppercase; display: inline-block; margin-bottom: 0.25rem;">${escapeHtml(t.badge)}</span>` : ''}
              <div style="font-size: 0.85rem; font-weight: 700; color: #ffffff;">${escapeHtml(t.tier)}</div>
              <div style="font-size: clamp(1.2rem, 2.5vw, 1.8rem); font-weight: 800; color: #10b981; margin: 0.2rem 0;">${escapeHtml(t.price)}</div>
              <div style="font-size: 0.75rem; color: rgba(255,255,255,0.6); margin-bottom: 0.35rem;">${escapeHtml(t.unit)}</div>
              <div style="font-size: clamp(0.7rem, 0.95vw, 0.8rem); color: rgba(255,255,255,0.7); line-height: 1.4;">${escapeHtml(t.desc)}</div>
            </div>
          `).join('')}
        </div>
        <div style="display: flex; justify-content: space-between; align-items: center; background: rgba(255,255,255,0.03); padding: 0.75rem 1rem; border-radius: var(--radius-md); font-size: 0.8rem; color: rgba(255,255,255,0.7); flex-wrap: wrap; gap: 0.5rem;">
          <div>${escapeHtml(slide.data.terms || '')}</div>
          <div style="color: #10b981; font-weight: 600;">${escapeHtml(slide.data.contact || '')}</div>
        </div>
      `;
      break;

    default:
      contentHtml = `
        <div style="font-size: clamp(0.95rem, 1.5vw, 1.2rem); color: rgba(255,255,255,0.85); line-height: 1.7; background: rgba(255,255,255,0.03); padding: 1.5rem; border-radius: var(--radius-md); border: 1px solid rgba(255,255,255,0.08);">
          ${escapeHtml(slide.data.content || 'Custom proposal content.')}
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
      Odyssey Luxury Travel • Bespoke Proposal
    </div>
  `;
}

function renderCurrentSlide() {
  const stage = document.getElementById('slide-stage');
  const curNum = document.getElementById('current-slide-num');
  const totalNum = document.getElementById('total-slides-num');
  if (curNum) curNum.textContent = activeSlideIndex + 1;
  if (totalNum) totalNum.textContent = travelDeck.length;

  if (stage && travelDeck[activeSlideIndex]) {
    stage.innerHTML = generateSlideHtml(travelDeck[activeSlideIndex]);
  }
}

function populateEditorFields() {
  const slide = travelDeck[activeSlideIndex];
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

  if (slide.type === 'overview') {
    customContainer.innerHTML = `
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 0.5rem;">
        <div class="form-group">
          <label>Destination Location</label>
          <input type="text" class="form-input" id="custom-dest" value="${escapeHtml(slide.data.destination || '')}">
        </div>
        <div class="form-group">
          <label>Trip Duration</label>
          <input type="text" class="form-input" id="custom-dur" value="${escapeHtml(slide.data.duration || '')}">
        </div>
      </div>
      <div class="form-group">
        <label>Overview Narrative</label>
        <textarea class="form-textarea" id="custom-summary" style="min-height: 60px;">${escapeHtml(slide.data.summary || '')}</textarea>
      </div>
    `;
    document.getElementById('custom-dest')?.addEventListener('input', (e) => {
      slide.data.destination = e.target.value;
      renderCurrentSlide();
    });
    document.getElementById('custom-dur')?.addEventListener('input', (e) => {
      slide.data.duration = e.target.value;
      renderCurrentSlide();
    });
    document.getElementById('custom-summary')?.addEventListener('input', (e) => {
      slide.data.summary = e.target.value;
      renderCurrentSlide();
    });
  } else if (slide.type === 'custom') {
    customContainer.innerHTML = `
      <div class="form-group">
        <label>Proposal Content</label>
        <textarea class="form-textarea" id="custom-content" style="min-height: 75px;">${escapeHtml(slide.data.content || '')}</textarea>
      </div>
    `;
    document.getElementById('custom-content')?.addEventListener('input', (e) => {
      slide.data.content = e.target.value;
      renderCurrentSlide();
    });
  }
}

// Presenter Fullscreen Mode
function openPresenterMode() {
  const container = document.getElementById('presenter-fullscreen-container');
  if (!container) return;

  container.classList.add('active');
  try {
    if (document.documentElement.requestFullscreen && !document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
    }
  } catch (err) {}

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

  if (indicator) indicator.textContent = `${activeSlideIndex + 1} / ${travelDeck.length}`;
  if (stage && travelDeck[activeSlideIndex]) {
    stage.innerHTML = generateSlideHtml(travelDeck[activeSlideIndex]);
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
  if (notesContent && travelDeck[activeSlideIndex]) {
    notesContent.textContent = travelDeck[activeSlideIndex].notes || 'No advisor notes recorded.';
  }
}

// Print Tour Brochure
function printTourBrochure() {
  const printContainer = document.getElementById('print-brochure-container');
  if (!printContainer) return;

  printContainer.innerHTML = `
    <div style="border-bottom: 3px solid #059669; padding-bottom: 1.5rem; margin-bottom: 2rem; display: flex; justify-content: space-between; align-items: flex-end;">
      <div>
        <h1 style="font-size: 2.2rem; color: #065f46; margin: 0;">Odyssey Luxury Travel</h1>
        <p style="font-size: 1.1rem; color: #4b5563; margin: 0.35rem 0 0;">Exclusive Tour Proposal & Client Dossier</p>
      </div>
      <div style="text-align: right; font-size: 0.85rem; color: #6b7280;">
        <div>Confidential Travel Proposal</div>
        <div>Date: ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</div>
      </div>
    </div>

    ${travelDeck.map((slide, i) => `
      <div class="brochure-section">
        <h2>${i + 1}. ${escapeHtml(slide.title)}</h2>
        <p style="font-size: 0.95rem; color: #6b7280; margin-top: -0.25rem;">${escapeHtml(slide.subtitle)}</p>
        <div>
          ${generateSlideHtml(slide)}
        </div>
      </div>
    `).join('')}

    <div style="text-align: center; font-size: 0.85rem; color: #6b7280; padding-top: 1.5rem;">
      Thank you for choosing Odyssey Luxury Travel • Contact: bookings@odysseytravel.com • +1 (800) 555-VOYAGE
    </div>
  `;

  window.print();
}

// Export Deck JSON
function exportDeckAsJson() {
  const jsonStr = JSON.stringify(travelDeck, null, 2);
  const blob = new Blob([jsonStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `travel-tour-proposal.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
  showToast('Exported tour proposal JSON.');
}

// Export Standalone HTML Presentation
function exportStandaloneHtmlDeck() {
  const serializedDeck = JSON.stringify(travelDeck);

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Travel Tour Proposal Presentation</title>
  <style>
    body { margin: 0; background: #060b09; color: #ffffff; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; display: flex; align-items: center; justify-content: center; height: 100vh; overflow: hidden; }
    .stage { width: 90vw; max-width: 1280px; aspect-ratio: 16/9; background: radial-gradient(circle at 10% 20%, #172a24 0%, #0a110e 100%); border: 1px solid rgba(16,185,129,0.3); border-radius: 16px; padding: 3rem; box-sizing: border-box; display: flex; flex-direction: column; justify-content: space-between; box-shadow: 0 20px 50px rgba(0,0,0,0.6); position: relative; }
    .header h2 { font-size: 2.2rem; margin: 0; color: #10b981; }
    .header p { color: rgba(255,255,255,0.7); margin-top: 0.5rem; font-size: 1.1rem; }
    .hud { position: fixed; bottom: 20px; display: flex; gap: 15px; background: rgba(6,15,11,0.9); padding: 8px 20px; border-radius: 99px; border: 1px solid rgba(16,185,129,0.3); }
    button { background: none; border: none; color: #10b981; cursor: pointer; font-size: 1rem; font-weight: bold; }
  </style>
</head>
<body>
  <div class="stage" id="stage"></div>
  <div class="hud">
    <button onclick="prev()">&larr; Prev</button>
    <span id="counter" style="color:#fff;">1 / ${travelDeck.length}</span>
    <button onclick="next()">Next &rarr;</button>
  </div>
  <script>
    const deck = ${serializedDeck};
    let cur = 0;
    function render() {
      const s = deck[cur];
      document.getElementById('counter').innerText = (cur + 1) + ' / ' + deck.length;
      document.getElementById('stage').innerHTML = '<div class="header"><h2>' + s.title + '</h2><p>' + s.subtitle + '</p></div><div><p style="font-size: 1.2rem; line-height: 1.6;">' + (s.data.summary || s.data.content || 'Tour Experience') + '</p></div><div style="font-size:0.8rem; opacity:0.5;">Odyssey Luxury Travel</div>';
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
  a.download = 'tour-proposal-standalone.html';
  a.href = url;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
  showToast('Downloaded standalone HTML tour presentation.');
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