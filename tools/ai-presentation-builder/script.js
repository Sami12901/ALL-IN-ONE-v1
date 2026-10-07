// AI Presentation Builder Studio Engine

const LAYOUT_DEFINITIONS = [
  { id: 'title', name: 'Title / Hero Slide', cat: 'Core', desc: 'Impactful opener with presenter, date, and subtitle.' },
  { id: 'problem', name: 'Problem & Pain Points', cat: 'Pitch', desc: 'Three critical pain points with impact indicators.' },
  { id: 'solution', name: 'Solution & Core Value', cat: 'Pitch', desc: 'Three pillars of your product or solution.' },
  { id: 'market', name: 'Market Size (TAM/SAM/SOM)', cat: 'Pitch', desc: 'TAM, SAM, and SOM data breakdown.' },
  { id: 'features', name: '3-Column Feature Cards', cat: 'Product', desc: 'Three glassmorphic feature highlight cards.' },
  { id: 'traction', name: 'Traction & Key Metrics', cat: 'Pitch', desc: 'Three large metric callouts with subtitles.' },
  { id: 'financials', name: 'Financials & Unit Economics', cat: 'Business', desc: 'ACV, Gross Margins, and LTV/CAC ratios.' },
  { id: 'team', name: 'Leadership & Team', cat: 'Pitch', desc: 'Executive profiles with pedigree and titles.' },
  { id: 'competitive', name: 'Competitive Matrix & Moat', cat: 'Strategy', desc: 'Sustainable moats and strategic advantages.' },
  { id: 'roadmap', name: 'Strategic Roadmap', cat: 'Strategy', desc: 'Phased milestone timeline across 4 quarters.' },
  { id: 'architecture', name: 'System Architecture', cat: 'Tech', desc: 'Three-tier technical topology and data flow.' },
  { id: 'testimonial', name: 'Customer Testimonial', cat: 'Social Proof', desc: 'Featured client quote with verified attribution.' },
  { id: 'pricing', name: 'Tiered Pricing Plans', cat: 'Business', desc: 'Starter, Professional, and Enterprise packages.' },
  { id: 'case_study', name: 'Client Case Study', cat: 'Social Proof', desc: 'Challenge, Solution, and Quantified Outcome.' },
  { id: 'quote', name: 'High-Impact Quote', cat: 'Design', desc: 'Full-bleed memorable quote or vision thesis.' },
  { id: 'comparison', name: 'Before vs After Comparison', cat: 'Marketing', desc: 'Legacy status quo vs modern automated future.' },
  { id: 'funnel', name: 'Marketing Funnel', cat: 'Marketing', desc: 'Top, Middle, and Bottom funnel metrics.' },
  { id: 'brand', name: 'Brand Identity & Palette', cat: 'Design', desc: 'Color swatches and typography standards.' },
  { id: 'travel', name: 'Travel Itinerary Day-by-Day', cat: 'Travel', desc: 'Curated 3-day travel itinerary with highlights.' },
  { id: 'exec_summary', name: 'Executive Summary', cat: 'Business', desc: 'High-level synthesis and core strategic thesis.' },
  { id: 'contact', name: 'Q&A & Contact Information', cat: 'Closing', desc: 'Closing discussion with email, website, and CTA.' }
];

let slides = [];
let activeIndex = 0;
let isPresenting = false;

// Create Default Slide by Layout Type
function createSlideObject(layoutId, customTitle = null) {
  const uid = 's_' + Math.random().toString(36).substr(2, 9);
  const layout = LAYOUT_DEFINITIONS.find(l => l.id === layoutId) || LAYOUT_DEFINITIONS[0];

  switch (layoutId) {
    case 'title':
      return {
        uid, layoutId,
        kicker: 'Strategic Presentation',
        title: customTitle || 'Cognitive Robotics Series A',
        subtitle: 'Autonomous Manipulation Systems for Next-Generation Logistics',
        footerLeft: 'Confidential Presentation',
        bullets: ['Presenter: Dr. Marcus Vance, CEO', 'Date: Q4 2026 Financing Round']
      };
    case 'problem':
      return {
        uid, layoutId,
        kicker: 'Market Inefficiency',
        title: customTitle || 'Global Supply Chains Face $1.4T Labor Shortage',
        subtitle: 'Severe fulfillment bottlenecks threaten modern industrial throughput.',
        footerLeft: 'Problem Statement',
        bullets: [
          'High Turnover: Warehouse manual sorting suffers 46% annual turnover rates.',
          'Error Rates: Manual item handling introduces 3.8% fulfillment errors and costly returns.',
          'Rigid Automation: Legacy conveyor belts require millions in fixed custom re-tooling.'
        ]
      };
    case 'solution':
      return {
        uid, layoutId,
        kicker: 'The Breakthrough',
        title: customTitle || 'Adaptive Neural Vision & Robotic Arms',
        subtitle: 'Self-calibrating physical intelligence that deploys in under 24 hours.',
        footerLeft: 'Core Solution',
        cards: [
          { title: 'Sub-Millimeter Perception', desc: 'Stereo RGB-D vision recognizing 200k+ packaging shapes with zero calibration.' },
          { title: 'Dynamic Grasp Synthesis', desc: 'Microsecond force feedback preventing fragile goods crushing.' },
          { title: 'Fleet Mesh Telemetry', desc: 'Continuous federated learning across all operational robotic pods.' }
        ]
      };
    case 'market':
      return {
        uid, layoutId,
        kicker: 'Total Addressable Market',
        title: customTitle || '$88B Logistics Robotics Opportunity',
        subtitle: 'Secular demand driven by e-commerce velocity and labor demographics.',
        footerLeft: 'Market Size',
        metrics: [
          { val: '$88B', label: 'Global TAM (2029)', sub: 'Industrial fulfillment robotics' },
          { val: '$18B', label: 'Serviceable SAM', sub: 'High-speed parcel sorting hubs' },
          { val: '$2.8B', label: 'Target SOM', sub: 'Immediate Tier-1 3PL operators' }
        ]
      };
    case 'features':
      return {
        uid, layoutId,
        kicker: 'Product Capabilities',
        title: customTitle || 'Built for High-Throughput Fulfillment',
        subtitle: 'Precision hardware coupled with real-time neural edge computing.',
        footerLeft: 'Feature Matrix',
        cards: [
          { title: '99.98% Sort Accuracy', desc: 'Eliminates mis-picks across erratic irregularly shaped parcels.' },
          { title: 'Zero-Downtime Swaps', desc: 'Modular quick-release end effectors replaced in under 60 seconds.' },
          { title: 'Bank-Grade Telemetry', desc: 'SOC 2 Type II compliant local compute with air-gapped options.' }
        ]
      };
    case 'traction':
      return {
        uid, layoutId,
        kicker: 'Proven Velocity',
        title: customTitle || 'Commercial Adoption & ARR Velocity',
        subtitle: 'Exponential commercial rollouts with leading global freight carriers.',
        footerLeft: 'Traction Metrics',
        metrics: [
          { val: '$6.4M', label: 'Current ARR', sub: '11.2x year-over-year expansion' },
          { val: '42', label: 'Robotic Pods Live', sub: 'Deployed across 8 regional hubs' },
          { val: '154%', label: 'Net Dollar Retention', sub: 'Zero customer churn to date' }
        ]
      };
    case 'roadmap':
      return {
        uid, layoutId,
        kicker: 'Strategic Horizon',
        title: customTitle || 'Execution Milestones & Scale Plan',
        subtitle: 'Delivering compounding software capabilities and geographic coverage.',
        footerLeft: 'Roadmap Phasing',
        cards: [
          { title: 'Q1 2026: Pod v2.4 Launch', desc: '40% reduction in BOM manufacturing cost.' },
          { title: 'Q2 2026: European Entry', desc: 'Deployment with 3 German logistics leaders.' },
          { title: 'Q3 2026: Heavy Payload Arm', desc: 'Handling up to 45kg crates autonomously.' }
        ]
      };
    default:
      return {
        uid, layoutId,
        kicker: 'Strategic Presentation',
        title: customTitle || layout.name,
        subtitle: layout.desc,
        footerLeft: 'Presentation Studio',
        bullets: [
          'First strategic observation and key operational deliverable.',
          'Quantified metric and verified benchmark performance.',
          'Long-term strategic roadmap and high-level takeaway.'
        ]
      };
  }
}

// AI Topic Generator
function generateAIDeck(promptText, slideCount) {
  const p = promptText.toLowerCase();
  const deckTitle = promptText.slice(0, 50);

  const newDeck = [];
  newDeck.push(createSlideObject('title', deckTitle));
  newDeck.push(createSlideObject('problem', 'The Core Market Challenge'));
  newDeck.push(createSlideObject('solution', 'Our Strategic Solution & Pillars'));
  newDeck.push(createSlideObject('market', 'Market Size & Growth Opportunity'));

  if (slideCount >= 6) {
    newDeck.push(createSlideObject('features', 'Product Architecture & Capabilities'));
    newDeck.push(createSlideObject('traction', 'Commercial Velocity & Key Metrics'));
  }

  if (slideCount >= 8) {
    newDeck.push(createSlideObject('roadmap', 'Execution Roadmap & Milestones'));
    newDeck.push(createSlideObject('financials', 'Unit Economics & Business Model'));
  }

  if (slideCount >= 10) {
    newDeck.push(createSlideObject('team', 'Executive Leadership & Pedigree'));
    newDeck.push(createSlideObject('contact', 'Discussion & Strategic Partnerships'));
  }

  return newDeck;
}

// Render Slide Content
function renderSlide(slide, targetEl) {
  if (!slide || !targetEl) return;
  const accent = '#6366f1';
  let bodyContent = '';

  if (slide.cards) {
    bodyContent = `
      <div style="display: grid; grid-template-columns: repeat(${slide.cards.length > 3 ? 4 : 3}, 1fr); gap: 1rem; width: 100%;">
        ${slide.cards.map((c, i) => `
          <div style="background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.08); border-top: 3px solid ${accent}; border-radius: 8px; padding: 1.15rem; display: flex; flex-direction: column; gap: 0.35rem;">
            <span style="font-size: 0.7rem; color: ${accent}; font-weight: 700; text-transform: uppercase;">0${i + 1}</span>
            <h4 style="font-size: 0.95rem; font-weight: 700; color: #fff; margin: 0;">${escapeHtml(c.title || '')}</h4>
            <p style="font-size: 0.78rem; color: #94a3b8; line-height: 1.4; margin: 0;">${escapeHtml(c.desc || '')}</p>
          </div>
        `).join('')}
      </div>
    `;
  } else if (slide.metrics) {
    bodyContent = `
      <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 1rem; width: 100%;">
        ${slide.metrics.map(m => `
          <div style="background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.08); border-radius: 8px; padding: 1.25rem; display: flex; flex-direction: column; gap: 0.35rem;">
            <div style="font-size: 2rem; font-weight: 800; color: #38bdf8; font-family: var(--font-display, inherit);">${escapeHtml(m.val || '')}</div>
            <div style="font-size: 0.8rem; font-weight: 700; color: #fff; text-transform: uppercase; letter-spacing: 0.5px;">${escapeHtml(m.label || '')}</div>
            <div style="font-size: 0.75rem; color: #94a3b8; line-height: 1.35;">${escapeHtml(m.sub || '')}</div>
          </div>
        `).join('')}
      </div>
    `;
  } else {
    bodyContent = `
      <div style="display: flex; flex-direction: column; gap: 0.65rem; width: 100%;">
        ${(slide.bullets || []).map((b, i) => `
          <div style="display: flex; align-items: flex-start; gap: 0.75rem; background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.06); padding: 0.75rem 1rem; border-radius: 6px; border-left: 3px solid ${accent};">
            <span style="font-size: 0.85rem; font-weight: 800; color: ${accent}; margin-top: 2px;">&bull;</span>
            <div style="font-size: 0.88rem; color: #e2e8f0; line-height: 1.45;">${escapeHtml(b)}</div>
          </div>
        `).join('')}
      </div>
    `;
  }

  targetEl.innerHTML = `
    <div style="margin-bottom: 1rem;">
      ${slide.kicker ? `<div style="font-size: 0.75rem; font-weight: 700; text-transform: uppercase; letter-spacing: 1.5px; color: ${accent}; margin-bottom: 0.35rem;">${escapeHtml(slide.kicker)}</div>` : ''}
      <h2 style="font-family: var(--font-display, inherit); font-size: 1.85rem; font-weight: 800; line-height: 1.2; color: #fff; margin: 0 0 0.4rem 0;">${escapeHtml(slide.title || '')}</h2>
      ${slide.subtitle ? `<p style="font-size: 0.95rem; color: #94a3b8; line-height: 1.4; margin: 0; max-width: 800px;">${escapeHtml(slide.subtitle)}</p>` : ''}
    </div>
    <div style="flex: 1; display: flex; align-items: center; margin: 0.75rem 0;">
      ${bodyContent}
    </div>
    <div style="display: flex; justify-content: space-between; align-items: center; border-top: 1px solid rgba(255,255,255,0.08); padding-top: 0.75rem; font-size: 0.75rem; color: #64748b;">
      <span>${escapeHtml(slide.footerLeft || 'AI Presentation Builder')}</span>
      <span style="font-weight: 600; color: ${accent};">${activeIndex + 1} / ${slides.length}</span>
    </div>
  `;
}

// Render Left Strip
function renderThumbnails() {
  const container = document.getElementById('slide-thumbs-container');
  if (!container) return;
  container.innerHTML = '';

  slides.forEach((slide, idx) => {
    const card = document.createElement('div');
    card.className = `slide-thumb-card ${idx === activeIndex ? 'active' : ''}`;
    card.innerHTML = `
      <div style="display: flex; align-items: center; gap: 0.5rem; overflow: hidden;">
        <span style="font-size: 0.72rem; font-weight: 700; padding: 0.15rem 0.45rem; border-radius: 4px; background: rgba(255,255,255,0.08); color: var(--text-secondary);">${idx + 1}</span>
        <div style="white-space: nowrap; overflow: hidden; text-overflow: ellipsis; font-size: 0.85rem; font-weight: 600; color: #fff;">${escapeHtml(slide.title || 'Slide ' + (idx + 1))}</div>
      </div>
      <div style="display: flex; gap: 0.2rem; flex-shrink: 0;">
        <button class="icon-action-btn btn-up" title="Move Up" ${idx === 0 ? 'disabled style="opacity:0.3;"' : ''}>▲</button>
        <button class="icon-action-btn btn-down" title="Move Down" ${idx === slides.length - 1 ? 'disabled style="opacity:0.3;"' : ''}>▼</button>
      </div>
    `;

    card.addEventListener('click', (e) => {
      if (e.target.closest('.btn-up') || e.target.closest('.btn-down')) return;
      activeIndex = idx;
      updateUI();
    });

    const btnUp = card.querySelector('.btn-up');
    if (btnUp && idx > 0) {
      btnUp.addEventListener('click', (e) => {
        e.stopPropagation();
        const tmp = slides[idx];
        slides[idx] = slides[idx - 1];
        slides[idx - 1] = tmp;
        activeIndex = idx - 1;
        updateUI();
      });
    }

    const btnDown = card.querySelector('.btn-down');
    if (btnDown && idx < slides.length - 1) {
      btnDown.addEventListener('click', (e) => {
        e.stopPropagation();
        const tmp = slides[idx];
        slides[idx] = slides[idx + 1];
        slides[idx + 1] = tmp;
        activeIndex = idx + 1;
        updateUI();
      });
    }

    container.appendChild(card);
  });

  document.getElementById('badge-total-slides').textContent = `${slides.length} Slides`;
  document.getElementById('slide-index-counter').textContent = `${activeIndex + 1} / ${slides.length}`;
}

// Render Inspector Inputs
function renderInspector() {
  const slide = slides[activeIndex];
  if (!slide) return;

  document.getElementById('inspector-heading').textContent = `Slide ${activeIndex + 1} Inspector (${(slide.layoutId || 'standard').toUpperCase()})`;
  document.getElementById('inp-edit-title').value = slide.title || '';
  document.getElementById('inp-edit-kicker').value = slide.kicker || '';
  document.getElementById('inp-edit-subtitle').value = slide.subtitle || '';

  let bodyText = '';
  if (slide.bullets) {
    bodyText = slide.bullets.join('\n');
  } else if (slide.cards) {
    bodyText = slide.cards.map(c => `${c.title}: ${c.desc}`).join('\n');
  } else if (slide.metrics) {
    bodyText = slide.metrics.map(m => `${m.val} | ${m.label} | ${m.sub}`).join('\n');
  }
  document.getElementById('inp-edit-body').value = bodyText;
}

function updateUI() {
  if (activeIndex >= slides.length) activeIndex = Math.max(0, slides.length - 1);
  renderThumbnails();
  renderSlide(slides[activeIndex], document.getElementById('canvas-inner'));
  renderInspector();
}

// Populate Layout Modal
function initLayoutModal() {
  const grid = document.getElementById('layout-grid-select');
  if (!grid) return;
  grid.innerHTML = '';

  LAYOUT_DEFINITIONS.forEach(def => {
    const card = document.createElement('div');
    card.className = 'layout-choice-card';
    card.innerHTML = `
      <div style="display: flex; justify-content: space-between; align-items: center;">
        <span style="font-size: 0.85rem; font-weight: 700; color: #fff;">${escapeHtml(def.name)}</span>
        <span style="font-size: 0.65rem; padding: 0.1rem 0.35rem; background: rgba(255,255,255,0.08); border-radius: 4px; color: var(--accent);">${escapeHtml(def.cat)}</span>
      </div>
      <p style="font-size: 0.75rem; color: #94a3b8; line-height: 1.35; margin: 0;">${escapeHtml(def.desc)}</p>
    `;

    card.addEventListener('click', () => {
      const newSlide = createSlideObject(def.id);
      slides.push(newSlide);
      activeIndex = slides.length - 1;
      document.getElementById('layout-modal').classList.remove('active');
      updateUI();
    });

    grid.appendChild(card);
  });
}

// Fullscreen Presentation Mode
function startPresenting() {
  isPresenting = true;
  document.getElementById('present-modal').classList.add('active');
  renderPresentSlide();
  try {
    if (document.documentElement.requestFullscreen) {
      document.documentElement.requestFullscreen().catch(() => {});
    }
  } catch (e) {}
}

function stopPresenting() {
  isPresenting = false;
  document.getElementById('present-modal').classList.remove('active');
  try {
    if (document.fullscreenElement && document.exitFullscreen) {
      document.exitFullscreen().catch(() => {});
    }
  } catch (e) {}
}

function renderPresentSlide() {
  renderSlide(slides[activeIndex], document.getElementById('present-inner'));
  document.getElementById('hud-counter').textContent = `${activeIndex + 1} / ${slides.length}`;
}

function presNext() {
  if (activeIndex < slides.length - 1) {
    activeIndex++;
    renderPresentSlide();
    updateUI();
  }
}

function presPrev() {
  if (activeIndex > 0) {
    activeIndex--;
    renderPresentSlide();
    updateUI();
  }
}

// Export HTML
function exportHTML() {
  const title = (slides[0] && slides[0].title) || 'Presentation';
  const slidesJson = JSON.stringify(slides, null, 2);

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>${escapeHtml(title)} - Presentation</title>
  <style>
    body { margin: 0; background: #06080e; color: #f8fafc; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 100vh; overflow: hidden; }
    #canvas { width: 92vw; max-width: 1280px; aspect-ratio: 16/9; background: #0c101c; border-radius: 16px; border: 1px solid rgba(255,255,255,0.1); box-shadow: 0 20px 60px rgba(0,0,0,0.8); padding: 3rem; box-sizing: border-box; display: flex; flex-direction: column; justify-content: space-between; }
    .hud { position: fixed; bottom: 1.5rem; display: flex; gap: 0.75rem; align-items: center; background: rgba(15,23,42,0.85); backdrop-filter: blur(8px); padding: 0.5rem 1rem; border-radius: 9999px; border: 1px solid rgba(255,255,255,0.15); }
    button { background: transparent; border: none; color: #cbd5e1; cursor: pointer; padding: 0.4rem 0.8rem; font-weight: 600; font-size: 0.9rem; border-radius: 9999px; }
    button:hover { background: rgba(255,255,255,0.15); color: #fff; }
    .kicker { font-size: 0.8rem; text-transform: uppercase; letter-spacing: 1.5px; font-weight: 700; margin-bottom: 0.4rem; color: #6366f1; }
    .title { font-size: 2.2rem; font-weight: 800; line-height: 1.2; margin-bottom: 0.5rem; }
    .subtitle { font-size: 1.05rem; color: #94a3b8; line-height: 1.4; }
  </style>
</head>
<body>
  <div id="canvas"></div>
  <div class="hud">
    <button onclick="prev()">&larr; Prev</button>
    <span id="counter" style="color: #6366f1; font-weight: 700;">1 / 1</span>
    <button onclick="next()">Next &rarr;</button>
  </div>
  <script>
    const deck = ${slidesJson};
    let idx = 0;
    function render() {
      const s = deck[idx];
      const c = document.getElementById('canvas');
      let body = '';
      if (s.bullets) body = s.bullets.map(b => '<div style="margin: 0.5rem 0;">&bull; ' + b + '</div>').join('');
      else if (s.cards) body = s.cards.map(card => '<div style="margin: 0.5rem 0;"><strong>' + card.title + ':</strong> ' + card.desc + '</div>').join('');
      c.innerHTML = '<div class="kicker">' + (s.kicker||'') + '</div>' +
                    '<div class="title">' + (s.title||'') + '</div>' +
                    '<div class="subtitle">' + (s.subtitle||'') + '</div>' +
                    '<div style="flex:1; display:flex; flex-direction:column; justify-content:center; font-size:1.05rem; line-height:1.6; color:#e2e8f0;">' + body + '</div>' +
                    '<div style="display:flex; justify-content:space-between; border-top:1px solid rgba(255,255,255,0.08); padding-top:0.75rem; font-size:0.8rem; color:#64748b;"><span>Slide ' + (idx+1) + ' of ' + deck.length + '</span><span>Presentation Studio</span></div>';
      document.getElementById('counter').innerText = (idx+1) + ' / ' + deck.length;
    }
    function next() { if(idx < deck.length - 1) { idx++; render(); } }
    function prev() { if(idx > 0) { idx--; render(); } }
    window.onkeydown = (e) => { if(e.key === 'ArrowRight' || e.key === ' ') next(); if(e.key === 'ArrowLeft') prev(); };
    render();
  </script>
</body>
</html>`;

  const blob = new Blob([html], { type: 'text/html' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = `${title.toLowerCase().replace(/[^a-z0-9]/g, '_')}_presentation.html`;
  a.click();
}

// Print PDF
function triggerPrint() {
  const container = document.getElementById('print-container');
  container.innerHTML = '';
  slides.forEach(slide => {
    const page = document.createElement('div');
    page.className = 'print-slide-page';
    renderSlide(slide, page);
    container.appendChild(page);
  });
  window.print();
}

function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

// DOM Setup
document.addEventListener('DOMContentLoaded', () => {
  // Initial Deck
  slides = generateAIDeck('Cognitive Robotics Series A Pitch', 8);
  initLayoutModal();
  updateUI();

  // Prompt Generator
  document.getElementById('btn-ai-generate').addEventListener('click', () => {
    const prompt = document.getElementById('inp-builder-prompt').value;
    const count = parseInt(document.getElementById('select-builder-count').value, 10);
    slides = generateAIDeck(prompt, count);
    activeIndex = 0;
    updateUI();
  });

  // Modal open/close
  document.getElementById('btn-open-layouts').addEventListener('click', () => {
    document.getElementById('layout-modal').classList.add('active');
  });
  document.getElementById('btn-close-layouts').addEventListener('click', () => {
    document.getElementById('layout-modal').classList.remove('active');
  });

  // Form Binding
  const bindField = (id, prop) => {
    document.getElementById(id).addEventListener('input', (e) => {
      const slide = slides[activeIndex];
      if (slide) {
        slide[prop] = e.target.value;
        renderSlide(slide, document.getElementById('canvas-inner'));
        if (prop === 'title') {
          const thumbTitle = document.querySelectorAll('.slide-thumb-card')[activeIndex]?.querySelector('div > div');
          if (thumbTitle) thumbTitle.textContent = e.target.value;
        }
      }
    });
  };

  bindField('inp-edit-title', 'title');
  bindField('inp-edit-kicker', 'kicker');
  bindField('inp-edit-subtitle', 'subtitle');

  document.getElementById('inp-edit-body').addEventListener('input', (e) => {
    const slide = slides[activeIndex];
    if (!slide) return;
    slide.bullets = e.target.value.split('\n').filter(l => l.trim().length > 0);
    renderSlide(slide, document.getElementById('canvas-inner'));
  });

  // Duplicate / Delete
  document.getElementById('btn-duplicate-slide').addEventListener('click', () => {
    const cur = slides[activeIndex];
    if (!cur) return;
    const cloned = JSON.parse(JSON.stringify(cur));
    cloned.title += ' (Copy)';
    slides.splice(activeIndex + 1, 0, cloned);
    activeIndex++;
    updateUI();
  });

  document.getElementById('btn-delete-slide').addEventListener('click', () => {
    if (slides.length <= 1) {
      alert('Deck must contain at least 1 slide.');
      return;
    }
    slides.splice(activeIndex, 1);
    if (activeIndex >= slides.length) activeIndex = slides.length - 1;
    updateUI();
  });

  // Presentation Mode
  document.getElementById('btn-present').addEventListener('click', startPresenting);
  document.getElementById('hud-exit').addEventListener('click', stopPresenting);
  document.getElementById('hud-next').addEventListener('click', presNext);
  document.getElementById('hud-prev').addEventListener('click', presPrev);

  window.addEventListener('keydown', (e) => {
    if (e.key === 'F5') {
      e.preventDefault();
      startPresenting();
      return;
    }
    if (!isPresenting) return;
    if (e.key === 'Escape') stopPresenting();
    else if (e.key === 'ArrowRight' || e.key === ' ' || e.key === 'PageDown') {
      e.preventDefault();
      presNext();
    } else if (e.key === 'ArrowLeft' || e.key === 'PageUp') {
      e.preventDefault();
      presPrev();
    }
  });

  // Exports
  document.getElementById('btn-export-html').addEventListener('click', exportHTML);
  document.getElementById('btn-export-pdf').addEventListener('click', triggerPrint);

  document.getElementById('btn-export-json').addEventListener('click', () => {
    const blob = new Blob([JSON.stringify(slides, null, 2)], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `presentation_deck_${Date.now()}.json`;
    a.click();
  });

  document.getElementById('file-import-json').addEventListener('change', (e) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const parsed = JSON.parse(evt.target.result);
        if (Array.isArray(parsed) && parsed.length > 0) {
          slides = parsed;
          activeIndex = 0;
          updateUI();
        }
      } catch (err) {
        alert('Invalid JSON file format.');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  });
});