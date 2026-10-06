// E-commerce Presentation Maker Logic

document.addEventListener('DOMContentLoaded', () => {
  // Elements
  const thumbList = document.getElementById('slide-thumb-list');
  const btnAddSlide = document.getElementById('btn-add-slide');
  const btnMoveUp = document.getElementById('btn-move-up');
  const btnMoveDown = document.getElementById('btn-move-down');
  const btnDeleteSlide = document.getElementById('btn-delete-slide');
  const btnLoadPreset = document.getElementById('btn-load-preset');
  const btnExportJson = document.getElementById('btn-export-json');

  const currentSlideBadge = document.getElementById('current-slide-badge');
  const currentSlideTypeLabel = document.getElementById('current-slide-type-label');
  const btnLaunchPresenter = document.getElementById('btn-launch-presenter');
  const btnPrintDeck = document.getElementById('btn-print-deck');
  const slideStage = document.getElementById('slide-stage');
  const inspectorFields = document.getElementById('slide-inspector-fields');

  // Presenter elements
  const presenterContainer = document.getElementById('presenter-fullscreen-container');
  const presenterStage = document.getElementById('presenter-stage');
  const speakerNotesBox = document.getElementById('speaker-notes-box');
  const speakerNotesContent = document.getElementById('speaker-notes-content');
  const hudPrev = document.getElementById('hud-prev');
  const hudNext = document.getElementById('hud-next');
  const hudCounter = document.getElementById('hud-counter');
  const hudNotesToggle = document.getElementById('hud-notes-toggle');
  const hudExit = document.getElementById('hud-exit');
  const printDeckContainer = document.getElementById('print-deck-container');
  const toast = document.getElementById('toast');

  function showToast(msg) {
    if (!toast) return;
    toast.textContent = msg;
    toast.classList.add('show');
    setTimeout(() => { toast.classList.remove('show'); }, 2000);
  }

  // Pre-configured slide templates
  const defaultSlides = [
    {
      id: 'slide-1',
      type: 'mission',
      title: 'Aura Luxe Wellness',
      kicker: 'Brand Mission & Vision',
      subtitle: 'Redefining direct-to-consumer organic luxury skincare through sustainable biotechnology.',
      quote: '"Empowering modern individuals with clinically proven botanical science and carbon-neutral formulations."',
      highlights: ['100% Carbon-Neutral Supply Chain', 'Certified Bio-Fermented Actives', 'Zero Virgin Plastics Packaging'],
      notes: 'Introduce the core problem: consumers want luxury efficacy without environmental compromise. State our founding thesis.'
    },
    {
      id: 'slide-2',
      type: 'product',
      title: 'The Cellular Renewal Elixir',
      kicker: 'Hero Product Showcase',
      subtitle: 'Award-winning peptide and squalane complex driving 58% of new subscriber acquisitions.',
      productBadge: '⭐️ Best of Clean Beauty 2026',
      points: [
        'Proprietary Dual-Phase Squalane & Ceramide 3 System',
        '84% Repeat 60-Day Re-Order Rate in Beta Cohort',
        '$112 Average Unit Selling Price with 76% Gross Margin'
      ],
      notes: 'Highlight hero product economics. High gross margin covers customer acquisition cost on first transaction.'
    },
    {
      id: 'slide-3',
      type: 'metrics',
      title: 'Hyper-Growth E-Commerce Metrics',
      kicker: 'KPI & Unit Economics',
      subtitle: 'Industry-leading traction across retention, basket size, and paid acquisition efficiency.',
      metrics: [
        { label: 'Gross Merchandise Value (GMV)', val: '$4.8M', desc: '+185% YoY growth trajectory' },
        { label: 'Average Order Value (AOV)', val: '$134.50', desc: '+28% higher than industry benchmark' },
        { label: 'Conversion Rate (eCR)', val: '3.82%', desc: 'Top decile for premium luxury D2C' },
        { label: 'LTV to CAC Ratio', val: '4.6x', desc: '$312 12-mo LTV vs $68 blended CAC' }
      ],
      notes: 'Walk investors through CAC payback period: under 45 days due to subscription opt-ins.'
    },
    {
      id: 'slide-4',
      type: 'demographics',
      title: 'High-Affluence Core Audience',
      kicker: 'Target Demographics & Reach',
      subtitle: 'Strong concentration in urban hubs with significant disposable income and recurring loyalty.',
      segments: [
        { group: 'Demographic: Age 26 - 42', stat: '68% of Total Base', detail: 'High disposable income professionals and design leaders' },
        { group: 'Subscription Adoption', stat: '41% Active Auto-Ship', detail: 'Consistent monthly recurring revenue with low churn' },
        { group: 'Geographic Reach', stat: 'North America & EU', detail: 'Fastest expansion in New York, London, Tokyo, and Zurich' }
      ],
      notes: 'Explain our omnichannel digital customer journey: TikTok/IG discovery to email retention flows.'
    },
    {
      id: 'slide-5',
      type: 'growth',
      title: 'Omnichannel Scale Roadmap',
      kicker: 'Growth & Expansion Strategy',
      subtitle: 'Unlocking scale through synergistic direct, retail partnership, and cross-border channels.',
      channels: [
        { name: '1. D2C Flagship Store', desc: 'Personalized quiz funnel, AI skin diagnostics, VIP tiered loyalty.' },
        { name: '2. Luxury Retail Partnerships', desc: 'Selective boutique presence in Nordstrom, Selfridges, and Sephora.' },
        { name: '3. Global Cross-Border D2C', desc: 'Localized fulfillment hubs in Frankfurt and Singapore for 2-day delivery.' },
        { name: '4. Corporate Hospitality', desc: 'Amenity partnerships with 5-star boutique wellness resort chains.' }
      ],
      notes: 'Retail is not just sales; it acts as physical discovery marketing that lowers our digital CAC.'
    },
    {
      id: 'slide-6',
      type: 'financials',
      title: '3-Year Financial Forecast',
      kicker: 'Projections & Capital Ask',
      subtitle: 'Path to $25M GMV with sustained positive EBITDA by Q4 2027.',
      projections: [
        { year: 'Year 1 (Actual)', rev: '$4.8M GMV', margin: '74% Gross Margin', ebitda: 'Break-even' },
        { year: 'Year 2 (Projected)', rev: '$12.5M GMV', margin: '77% Gross Margin', ebitda: '+14% EBITDA' },
        { year: 'Year 3 (Projected)', rev: '$26.0M GMV', margin: '79% Gross Margin', ebitda: '+22% EBITDA' }
      ],
      notes: 'Seeking $3M Series A funding to expand inventory pipeline, hire VP of Retail, and launch international hubs.'
    }
  ];

  let slides = JSON.parse(JSON.stringify(defaultSlides));
  let activeIndex = 0;

  function renderSlideHtml(slide) {
    let bodyContent = '';

    if (slide.type === 'mission') {
      bodyContent = `
        <div style="background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.1); border-radius: var(--radius-md); padding: 1.5rem; margin-bottom: 1rem;">
          <blockquote style="font-size: clamp(1rem, 1.8vw, 1.35rem); font-style: italic; color: #e2e8f0; line-height: 1.5; margin: 0;">
            ${slide.quote || ''}
          </blockquote>
        </div>
        <div style="display: flex; gap: 1rem; flex-wrap: wrap;">
          ${(slide.highlights || []).map(h => `
            <div style="display: flex; align-items: center; gap: 0.5rem; background: rgba(59, 130, 246, 0.15); border: 1px solid rgba(59, 130, 246, 0.3); border-radius: var(--radius-full); padding: 0.4rem 1rem; font-size: clamp(0.75rem, 1vw, 0.9rem); font-weight: 600; color: #93c5fd;">
              <span>✓</span> ${h}
            </div>
          `).join('')}
        </div>
      `;
    } else if (slide.type === 'product') {
      bodyContent = `
        <div style="display: grid; grid-template-columns: 1fr; gap: 1rem;">
          ${slide.productBadge ? `
            <div>
              <span style="background: linear-gradient(135deg, #f59e0b, #d97706); color: #000; font-weight: 800; font-size: 0.85rem; padding: 0.35rem 0.85rem; border-radius: var(--radius-full); text-transform: uppercase; letter-spacing: 0.05em;">
                ${slide.productBadge}
              </span>
            </div>
          ` : ''}
          <div style="display: flex; flex-direction: column; gap: 0.75rem;">
            ${(slide.points || []).map(p => `
              <div style="background: rgba(255, 255, 255, 0.04); border-left: 3px solid var(--accent); padding: 0.85rem 1.25rem; border-radius: 0 var(--radius-md) var(--radius-md) 0; font-size: clamp(0.85rem, 1.3vw, 1.05rem); color: #f1f5f9;">
                ${p}
              </div>
            `).join('')}
          </div>
        </div>
      `;
    } else if (slide.type === 'metrics') {
      bodyContent = `
        <div class="metric-grid-4">
          ${(slide.metrics || []).map(m => `
            <div style="background: rgba(255, 255, 255, 0.04); border: 1px solid rgba(255, 255, 255, 0.1); border-radius: var(--radius-md); padding: 1.15rem; display: flex; flex-direction: column; gap: 0.35rem;">
              <span style="font-size: clamp(0.7rem, 0.9vw, 0.8rem); color: #94a3b8; font-weight: 600; text-transform: uppercase;">${m.label}</span>
              <span style="font-size: clamp(1.6rem, 3.2vw, 2.5rem); font-weight: 800; color: var(--accent); line-height: 1.1;">${m.val}</span>
              <span style="font-size: clamp(0.75rem, 1vw, 0.85rem); color: #cbd5e1;">${m.desc}</span>
            </div>
          `).join('')}
        </div>
      `;
    } else if (slide.type === 'demographics') {
      bodyContent = `
        <div style="display: flex; flex-direction: column; gap: 0.85rem;">
          ${(slide.segments || []).map(s => `
            <div style="background: rgba(255, 255, 255, 0.04); border: 1px solid rgba(255, 255, 255, 0.1); border-radius: var(--radius-md); padding: 1rem 1.25rem; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 0.5rem;">
              <div>
                <strong style="color: #ffffff; font-size: 1rem; display: block;">${s.group}</strong>
                <span style="color: #94a3b8; font-size: 0.85rem;">${s.detail}</span>
              </div>
              <span style="font-size: 1.35rem; font-weight: 800; color: #10b981; font-family: monospace;">${s.stat}</span>
            </div>
          `).join('')}
        </div>
      `;
    } else if (slide.type === 'growth') {
      bodyContent = `
        <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 1rem;">
          ${(slide.channels || []).map(c => `
            <div style="background: rgba(255, 255, 255, 0.04); border: 1px solid rgba(255, 255, 255, 0.1); border-radius: var(--radius-md); padding: 1rem;">
              <h4 style="margin: 0 0 0.35rem 0; color: var(--accent); font-size: 0.95rem;">${c.name}</h4>
              <p style="margin: 0; color: #94a3b8; font-size: 0.85rem; line-height: 1.4;">${c.desc}</p>
            </div>
          `).join('')}
        </div>
      `;
    } else if (slide.type === 'financials') {
      bodyContent = `
        <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 1rem;">
          ${(slide.projections || []).map(p => `
            <div style="background: rgba(255, 255, 255, 0.04); border: 1px solid rgba(255, 255, 255, 0.1); border-radius: var(--radius-md); padding: 1.25rem; text-align: center; display: flex; flex-direction: column; gap: 0.5rem;">
              <span style="font-weight: 700; color: #94a3b8; font-size: 0.85rem; text-transform: uppercase;">${p.year}</span>
              <span style="font-size: 1.6rem; font-weight: 800; color: var(--accent);">${p.rev}</span>
              <span style="font-size: 0.85rem; color: #38bdf8;">${p.margin}</span>
              <span style="font-size: 0.85rem; color: #10b981; font-weight: 600;">${p.ebitda}</span>
            </div>
          `).join('')}
        </div>
      `;
    }

    return `
      <div class="slide-brand-watermark">
        <span class="slide-brand-watermark-dot"></span>
        <span>Aura Luxe E-Commerce</span>
      </div>
      <div class="slide-stage-header">
        <span class="slide-kicker">${slide.kicker || ''}</span>
        <h2 class="slide-stage-title">${slide.title || ''}</h2>
        <p class="slide-stage-subtitle">${slide.subtitle || ''}</p>
      </div>
      <div class="slide-stage-body">
        ${bodyContent}
      </div>
    `;
  }

  function renderThumbnails() {
    thumbList.innerHTML = '';
    slides.forEach((s, idx) => {
      const card = document.createElement('div');
      card.className = `slide-thumb-card ${idx === activeIndex ? 'active' : ''}`;
      card.innerHTML = `
        <div class="slide-thumb-number">${idx + 1}</div>
        <div class="slide-thumb-info">
          <div class="slide-thumb-title">${s.title}</div>
          <div class="slide-thumb-type">${s.type}</div>
        </div>
      `;
      card.addEventListener('click', () => {
        activeIndex = idx;
        renderActiveSlide();
      });
      thumbList.appendChild(card);
    });

    currentSlideBadge.textContent = `Slide ${activeIndex + 1} of ${slides.length}`;
    const curr = slides[activeIndex];
    currentSlideTypeLabel.textContent = curr ? curr.type : '';
  }

  function renderActiveSlide() {
    const slide = slides[activeIndex];
    if (!slide) return;

    slideStage.innerHTML = renderSlideHtml(slide);
    renderThumbnails();
    renderInspector();
  }

  function renderInspector() {
    const slide = slides[activeIndex];
    if (!slide) return;

    inspectorFields.innerHTML = `
      <div class="form-group" style="display: flex; flex-direction: column; gap: 0.25rem;">
        <label style="font-size: 0.75rem; text-transform: uppercase; font-weight: 700; color: var(--text-tertiary);">Kicker / Category</label>
        <input type="text" id="inp-kicker" class="form-control" value="${slide.kicker || ''}" style="padding: 0.5rem; background: var(--bg-tertiary); border: 1px solid var(--border); border-radius: var(--radius-sm); color: var(--text-primary);">
      </div>
      <div class="form-group" style="display: flex; flex-direction: column; gap: 0.25rem;">
        <label style="font-size: 0.75rem; text-transform: uppercase; font-weight: 700; color: var(--text-tertiary);">Slide Headline</label>
        <input type="text" id="inp-title" class="form-control" value="${slide.title || ''}" style="padding: 0.5rem; background: var(--bg-tertiary); border: 1px solid var(--border); border-radius: var(--radius-sm); color: var(--text-primary);">
      </div>
      <div class="form-group" style="display: flex; flex-direction: column; gap: 0.25rem;">
        <label style="font-size: 0.75rem; text-transform: uppercase; font-weight: 700; color: var(--text-tertiary);">Slide Subtitle</label>
        <textarea id="inp-subtitle" rows="2" class="form-control" style="padding: 0.5rem; background: var(--bg-tertiary); border: 1px solid var(--border); border-radius: var(--radius-sm); color: var(--text-primary); resize: vertical;">${slide.subtitle || ''}</textarea>
      </div>
      <div class="form-group" style="display: flex; flex-direction: column; gap: 0.25rem;">
        <label style="font-size: 0.75rem; text-transform: uppercase; font-weight: 700; color: var(--text-tertiary);">Speaker Notes</label>
        <textarea id="inp-notes" rows="2" class="form-control" style="padding: 0.5rem; background: var(--bg-tertiary); border: 1px solid var(--border); border-radius: var(--radius-sm); color: var(--text-primary); resize: vertical;">${slide.notes || ''}</textarea>
      </div>
    `;

    document.getElementById('inp-kicker').addEventListener('input', (e) => {
      slide.kicker = e.target.value;
      slideStage.innerHTML = renderSlideHtml(slide);
    });
    document.getElementById('inp-title').addEventListener('input', (e) => {
      slide.title = e.target.value;
      slideStage.innerHTML = renderSlideHtml(slide);
      renderThumbnails();
    });
    document.getElementById('inp-subtitle').addEventListener('input', (e) => {
      slide.subtitle = e.target.value;
      slideStage.innerHTML = renderSlideHtml(slide);
    });
    document.getElementById('inp-notes').addEventListener('input', (e) => {
      slide.notes = e.target.value;
    });
  }

  // Slide Management
  btnAddSlide.addEventListener('click', () => {
    const newSlide = {
      id: `slide-${Date.now()}`,
      type: 'metrics',
      title: 'New Performance Metric',
      kicker: 'Key Takeaways',
      subtitle: 'Summary of critical accomplishments and upcoming growth targets.',
      metrics: [
        { label: 'Growth Target', val: '100%', desc: 'Projected metric' },
        { label: 'Efficiency', val: '95%', desc: 'Operational rating' }
      ],
      notes: 'Notes for newly created slide.'
    };
    slides.push(newSlide);
    activeIndex = slides.length - 1;
    renderActiveSlide();
    showToast('New slide added!');
  });

  btnMoveUp.addEventListener('click', () => {
    if (activeIndex > 0) {
      const temp = slides[activeIndex];
      slides[activeIndex] = slides[activeIndex - 1];
      slides[activeIndex - 1] = temp;
      activeIndex--;
      renderActiveSlide();
    }
  });

  btnMoveDown.addEventListener('click', () => {
    if (activeIndex < slides.length - 1) {
      const temp = slides[activeIndex];
      slides[activeIndex] = slides[activeIndex + 1];
      slides[activeIndex + 1] = temp;
      activeIndex++;
      renderActiveSlide();
    }
  });

  btnDeleteSlide.addEventListener('click', () => {
    if (slides.length <= 1) {
      showToast('Deck must have at least one slide!');
      return;
    }
    slides.splice(activeIndex, 1);
    if (activeIndex >= slides.length) activeIndex = slides.length - 1;
    renderActiveSlide();
    showToast('Slide deleted');
  });

  btnLoadPreset.addEventListener('click', () => {
    slides = JSON.parse(JSON.stringify(defaultSlides));
    activeIndex = 0;
    renderActiveSlide();
    showToast('Reset to default 6-slide deck');
  });

  btnExportJson.addEventListener('click', () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(slides, null, 2));
    const dlAnchor = document.createElement('a');
    dlAnchor.setAttribute('href', dataStr);
    dlAnchor.setAttribute('download', 'ecommerce-deck.json');
    dlAnchor.click();
    showToast('Exported deck JSON!');
  });

  // Presenter Mode
  function openPresenter() {
    presenterContainer.classList.add('active');
    updatePresenterSlide();
    document.addEventListener('keydown', handlePresenterKeydown);
  }

  function closePresenter() {
    presenterContainer.classList.remove('active');
    document.removeEventListener('keydown', handlePresenterKeydown);
  }

  function updatePresenterSlide() {
    const slide = slides[activeIndex];
    if (!slide) return;
    presenterStage.innerHTML = renderSlideHtml(slide);
    hudCounter.textContent = `${activeIndex + 1} / ${slides.length}`;
    speakerNotesContent.textContent = slide.notes || 'No notes for this slide.';
  }

  function nextSlide() {
    if (activeIndex < slides.length - 1) {
      activeIndex++;
      updatePresenterSlide();
      renderActiveSlide();
    }
  }

  function prevSlide() {
    if (activeIndex > 0) {
      activeIndex--;
      updatePresenterSlide();
      renderActiveSlide();
    }
  }

  function handlePresenterKeydown(e) {
    if (e.key === 'ArrowRight' || e.key === ' ' || e.key === 'PageDown') {
      e.preventDefault();
      nextSlide();
    } else if (e.key === 'ArrowLeft' || e.key === 'PageUp') {
      e.preventDefault();
      prevSlide();
    } else if (e.key === 'Escape') {
      closePresenter();
    }
  }

  btnLaunchPresenter.addEventListener('click', openPresenter);
  hudPrev.addEventListener('click', prevSlide);
  hudNext.addEventListener('click', nextSlide);
  hudExit.addEventListener('click', closePresenter);

  hudNotesToggle.addEventListener('click', () => {
    speakerNotesBox.classList.toggle('active');
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'F5') {
      e.preventDefault();
      openPresenter();
    }
  });

  // Print Deck
  btnPrintDeck.addEventListener('click', () => {
    printDeckContainer.innerHTML = '';
    slides.forEach(s => {
      const page = document.createElement('div');
      page.className = 'print-slide-page';
      page.innerHTML = renderSlideHtml(s);
      printDeckContainer.appendChild(page);
    });
    window.print();
  });

  // Initial load
  renderActiveSlide();
});