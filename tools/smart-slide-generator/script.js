// Smart Slide Generator - Logic Engine

let deck = [];
let currentSlideIndex = 0;
let currentTheme = 'theme-indigo';
let isPresenting = false;

// Smart Content Generator Engine
function generateSmartDeck(topic, audience, count) {
  const cleanTopic = topic.trim() || 'Autonomous Enterprise Platform';
  const newSlides = [];

  // Theme Accent colors
  const accentColors = {
    'theme-obsidian': '#f59e0b',
    'theme-cyberpunk': '#38bdf8',
    'theme-emerald': '#10b981',
    'theme-crimson': '#f43f5e',
    'theme-indigo': '#6366f1'
  };
  const accent = accentColors[currentTheme] || '#6366f1';

  // 1. Title Slide
  newSlides.push({
    id: 's-1',
    type: 'hero',
    kicker: 'Strategic Presentation',
    title: cleanTopic,
    subtitle: `Accelerating Enterprise Transformation for ${getAudienceLabel(audience)}`,
    footerLeft: 'Confidential • Strategy Review',
    footerRight: '2026 Edition',
    bullets: [
      `Delivering measurable competitive advantages across modern operational workflows.`,
      `Designed specifically for ${getAudienceLabel(audience).toLowerCase()}.`
    ],
    accent
  });

  // 2. The Landscape / Problem
  newSlides.push({
    id: 's-2',
    type: 'list',
    kicker: 'Current Landscape',
    title: `The Friction in ${cleanTopic}`,
    subtitle: 'Legacy systems and manual handoffs create compounding inefficiencies at enterprise scale.',
    footerLeft: 'Landscape Analysis',
    footerRight: '02 / ' + count,
    bullets: [
      'Fragmented Infrastructure: Siloed toolsets prevent cohesive cross-functional alignment.',
      'Operational Latency: Critical decisions are delayed by manual data consolidation cycles.',
      'Escalating Overhead: High maintenance costs on brittle legacy integrations drain team bandwidth.'
    ],
    accent
  });

  // 3. Solution Pillars
  newSlides.push({
    id: 's-3',
    type: 'cards',
    kicker: 'The Solution',
    title: 'Three Pillars of Modern Execution',
    subtitle: `A unified framework engineered to unlock exponential scale in ${cleanTopic}.`,
    footerLeft: 'Strategic Solution',
    footerRight: '03 / ' + count,
    cards: [
      { title: 'Intelligent Orchestration', desc: 'Automating high-frequency decision paths with deterministic precision.' },
      { title: 'Zero-Latency Telemetry', desc: 'Unified real-time visibility across all operational endpoints and data streams.' },
      { title: 'Self-Healing Workflows', desc: 'Resilient fault-tolerant execution that adapts autonomously to changing conditions.' }
    ],
    accent
  });

  // 4. Quantified Metrics / Traction
  newSlides.push({
    id: 's-4',
    type: 'metrics',
    kicker: 'Quantified Impact',
    title: 'Compounding Performance Gains',
    subtitle: 'Proven outcomes measured across live production deployments.',
    footerLeft: 'Performance Metrics',
    footerRight: '04 / ' + count,
    metrics: [
      { val: '8.4x', label: 'Velocity Multiplier', sub: 'Faster cycle time from intent to execution' },
      { val: '64%', label: 'Overhead Reduction', sub: 'Elimination of redundant manual reconciliations' },
      { val: '99.98%', label: 'Audit Accuracy', sub: 'Cryptographically verified policy compliance' }
    ],
    accent
  });

  if (count >= 6) {
    // 5. Product Architecture
    newSlides.push({
      id: 's-5',
      type: 'cards',
      kicker: 'Core Architecture',
      title: 'End-to-End System Topology',
      subtitle: 'Modern micro-services architecture built for high availability and bank-grade security.',
      footerLeft: 'Architecture Overview',
      footerRight: '05 / ' + count,
      cards: [
        { title: '01. Ingestion Layer', desc: 'Multi-modal stream parsing supporting streaming CDC, REST APIs, and event queues.' },
        { title: '02. Policy Guardrails', desc: 'Deterministic validation engine enforcing strict SOC 2, HIPAA, and custom rules.' },
        { title: '03. Atomic Mutations', desc: 'Sub-50ms target execution with instant bi-directional rollback capabilities.' }
      ],
      accent
    });

    // 6. Execution Roadmap
    newSlides.push({
      id: 's-6',
      type: 'cards',
      kicker: 'Execution Roadmap',
      title: 'Milestone Phasing & Timeline',
      subtitle: 'A disciplined quarterly delivery plan ensuring rapid time-to-value.',
      footerLeft: 'Rollout Phasing',
      footerRight: '06 / ' + count,
      cards: [
        { title: 'Phase 1: Pilot & Benchmark', desc: 'Initial baseline telemetry integration and high-priority workflow mapping.' },
        { title: 'Phase 2: Full Deployment', desc: 'Enterprise-wide orchestration rollout with automated policy enforcement.' },
        { title: 'Phase 3: Autonomous Scale', desc: 'Self-optimizing model fine-tuning and global multi-region expansion.' }
      ],
      accent
    });
  }

  if (count >= 8) {
    // 7. Competitive Moat
    newSlides.push({
      id: 's-7',
      type: 'list',
      kicker: 'Competitive Moat',
      title: 'Defensible Strategic Advantages',
      subtitle: `Why this approach creates enduring structural moats in the ${cleanTopic} market.`,
      footerLeft: 'Strategic Moat',
      footerRight: '07 / ' + count,
      bullets: [
        'Proprietary Context Engine: Data network effects that compound accuracy with every completed workflow.',
        'Deep Structural Integration: High switching costs through mission-critical operational embedding.',
        'Pre-Certified Governance: Turnkey enterprise compliance packs accelerating sales velocity by 60%.'
      ],
      accent
    });

    // 8. Business Model / Economics
    newSlides.push({
      id: 's-8',
      type: 'metrics',
      kicker: 'Commercial Engine',
      title: 'Attractive Unit Economics',
      subtitle: 'High-margin recurring revenue model with rapid payback and strong net expansion.',
      footerLeft: 'Unit Economics',
      footerRight: '08 / ' + count,
      metrics: [
        { val: '$52,000', label: 'Average ACV', sub: 'Annual enterprise subscription tier' },
        { val: '144%', label: 'Net Retention', sub: 'Compound expansion from organic team adoption' },
        { val: '86%', label: 'Gross Margin', sub: 'Predictable high-margin software leverage' }
      ],
      accent
    });
  }

  if (count >= 10) {
    // 9. Case Study / Proof Point
    newSlides.push({
      id: 's-9',
      type: 'cards',
      kicker: 'Case Study',
      title: 'Enterprise Deployment at Scale',
      subtitle: 'Global leader achieves $4.2M in annual operational savings in first 90 days.',
      footerLeft: 'Proof Point',
      footerRight: '09 / ' + count,
      cards: [
        { title: 'The Challenge', desc: 'Overwhelmed operations team facing 4-day backlog in data validation.' },
        { title: 'The Intervention', desc: 'Deployed autonomous execution mesh across all 18 core ERP systems.' },
        { title: 'The Impact', desc: 'Backlog dropped to zero within 14 days with 100% policy adherence.' }
      ],
      accent
    });

    // 10. Conclusion & Next Steps
    newSlides.push({
      id: 's-10',
      type: 'hero',
      kicker: 'Moving Forward',
      title: 'Next Steps & Discussion',
      subtitle: `We invite strategic questions, deep dives, and pilot partnership discussions for ${cleanTopic}.`,
      footerLeft: 'Closing Session',
      footerRight: '10 / ' + count,
      bullets: [
        'Schedule a 30-day sandbox pilot on live enterprise pipelines.',
        'Access technical architecture whitepapers and benchmark telemetry data.',
        'Direct inquiry: team@example.com'
      ],
      accent
    });
  }

  return newSlides;
}

function getAudienceLabel(key) {
  switch (key) {
    case 'investors': return 'Venture Capital & Institutional Investors';
    case 'csuite': return 'C-Suite & Board Members';
    case 'engineering': return 'Engineering & Technical Architects';
    case 'clients': return 'Enterprise Enterprise Partners';
    default: return 'Key Stakeholders';
  }
}

// Render Slide Content in 16:9 Canvas
function renderSlideContent(slide, container) {
  if (!slide || !container) return;
  const accent = slide.accent || '#6366f1';
  let bodyHtml = '';

  if (slide.type === 'hero') {
    bodyHtml = `
      <div style="display: flex; flex-direction: column; gap: 1rem; max-width: 750px;">
        <div style="display: flex; flex-direction: column; gap: 0.6rem;">
          ${(slide.bullets || []).map(b => `
            <div style="display: flex; align-items: flex-start; gap: 0.65rem; background: rgba(255,255,255,0.03); padding: 0.65rem 0.85rem; border-radius: 6px; border-left: 3px solid ${accent}; font-size: 0.88rem; color: #cbd5e1;">
              <span style="color: ${accent}; font-weight: 800;">&bull;</span>
              <div>${escapeHtml(b)}</div>
            </div>
          `).join('')}
        </div>
      </div>
    `;
  } else if (slide.type === 'list') {
    bodyHtml = `
      <div style="display: flex; flex-direction: column; gap: 0.65rem; width: 100%;">
        ${(slide.bullets || []).map((b, i) => `
          <div style="display: flex; align-items: flex-start; gap: 0.75rem; background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.06); padding: 0.75rem 1rem; border-radius: 6px; border-left: 3px solid ${accent};">
            <span style="font-size: 0.85rem; font-weight: 800; color: ${accent}; margin-top: 2px;">0${i + 1}</span>
            <div style="font-size: 0.88rem; color: #e2e8f0; line-height: 1.45;">${escapeHtml(b)}</div>
          </div>
        `).join('')}
      </div>
    `;
  } else if (slide.type === 'cards') {
    bodyHtml = `
      <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 1rem; width: 100%;">
        ${(slide.cards || []).map((c, i) => `
          <div style="background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.08); border-top: 3px solid ${accent}; border-radius: 8px; padding: 1.15rem; display: flex; flex-direction: column; gap: 0.4rem;">
            <span style="font-size: 0.72rem; color: ${accent}; font-weight: 700; text-transform: uppercase;">PILLAR 0${i + 1}</span>
            <h4 style="font-size: 0.95rem; font-weight: 700; color: #fff; margin: 0;">${escapeHtml(c.title || '')}</h4>
            <p style="font-size: 0.78rem; color: #94a3b8; line-height: 1.4; margin: 0;">${escapeHtml(c.desc || '')}</p>
          </div>
        `).join('')}
      </div>
    `;
  } else if (slide.type === 'metrics') {
    bodyHtml = `
      <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 1rem; width: 100%;">
        ${(slide.metrics || []).map(m => `
          <div style="background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.08); border-radius: 8px; padding: 1.25rem; display: flex; flex-direction: column; gap: 0.35rem;">
            <div style="font-size: 2rem; font-weight: 800; color: ${accent}; font-family: var(--font-display, inherit);">${escapeHtml(m.val || '')}</div>
            <div style="font-size: 0.8rem; font-weight: 700; color: #fff; text-transform: uppercase; letter-spacing: 0.5px;">${escapeHtml(m.label || '')}</div>
            <div style="font-size: 0.75rem; color: #94a3b8; line-height: 1.35;">${escapeHtml(m.sub || '')}</div>
          </div>
        `).join('')}
      </div>
    `;
  }

  container.className = `slide-canvas-content ${currentTheme}`;
  container.innerHTML = `
    <div style="margin-bottom: 1rem;">
      ${slide.kicker ? `<div style="font-size: 0.75rem; font-weight: 700; text-transform: uppercase; letter-spacing: 1.5px; color: ${accent}; margin-bottom: 0.35rem;">${escapeHtml(slide.kicker)}</div>` : ''}
      <h2 style="font-family: var(--font-display, inherit); font-size: 1.85rem; font-weight: 800; line-height: 1.2; color: #fff; margin: 0 0 0.4rem 0;">${escapeHtml(slide.title || '')}</h2>
      ${slide.subtitle ? `<p style="font-size: 0.95rem; color: #94a3b8; line-height: 1.4; margin: 0; max-width: 800px;">${escapeHtml(slide.subtitle)}</p>` : ''}
    </div>
    <div style="flex: 1; display: flex; align-items: center; margin: 0.75rem 0;">
      ${bodyHtml}
    </div>
    <div style="display: flex; justify-content: space-between; align-items: center; border-top: 1px solid rgba(255,255,255,0.08); padding-top: 0.75rem; font-size: 0.75rem; color: #64748b;">
      <span>${escapeHtml(slide.footerLeft || 'Smart Slide Deck')}</span>
      <span style="font-weight: 600; color: ${accent};">${currentSlideIndex + 1} / ${deck.length}</span>
    </div>
  `;
}

// Render Left Navigation List
function renderDeckNav() {
  const container = document.getElementById('deck-nav-list');
  if (!container) return;
  container.innerHTML = '';

  deck.forEach((slide, idx) => {
    const item = document.createElement('div');
    item.className = `deck-nav-item ${idx === currentSlideIndex ? 'active' : ''}`;
    item.innerHTML = `
      <div style="display: flex; align-items: center; gap: 0.6rem; overflow: hidden;">
        <span style="font-size: 0.72rem; font-weight: 700; padding: 0.15rem 0.45rem; border-radius: 4px; background: rgba(255,255,255,0.08); color: var(--text-secondary);">${idx + 1}</span>
        <div style="white-space: nowrap; overflow: hidden; text-overflow: ellipsis; font-size: 0.85rem; font-weight: 600; color: #fff;">${escapeHtml(slide.title)}</div>
      </div>
      <div style="display: flex; gap: 0.2rem; flex-shrink: 0;">
        <button class="icon-action-btn btn-up" title="Move Up" ${idx === 0 ? 'disabled style="opacity:0.3;"' : ''}>▲</button>
        <button class="icon-action-btn btn-down" title="Move Down" ${idx === deck.length - 1 ? 'disabled style="opacity:0.3;"' : ''}>▼</button>
      </div>
    `;

    item.addEventListener('click', (e) => {
      if (e.target.closest('.btn-up') || e.target.closest('.btn-down')) return;
      currentSlideIndex = idx;
      updateUI();
    });

    const btnUp = item.querySelector('.btn-up');
    if (btnUp && idx > 0) {
      btnUp.addEventListener('click', (e) => {
        e.stopPropagation();
        const tmp = deck[idx];
        deck[idx] = deck[idx - 1];
        deck[idx - 1] = tmp;
        currentSlideIndex = idx - 1;
        updateUI();
      });
    }

    const btnDown = item.querySelector('.btn-down');
    if (btnDown && idx < deck.length - 1) {
      btnDown.addEventListener('click', (e) => {
        e.stopPropagation();
        const tmp = deck[idx];
        deck[idx] = deck[idx + 1];
        deck[idx + 1] = tmp;
        currentSlideIndex = idx + 1;
        updateUI();
      });
    }

    container.appendChild(item);
  });

  document.getElementById('badge-slide-count').textContent = `${deck.length} Slides`;
}

// Render Form Editor
function renderEditor() {
  const slide = deck[currentSlideIndex];
  if (!slide) return;

  document.getElementById('editor-slide-title-pill').textContent = `Editing Slide ${currentSlideIndex + 1} of ${deck.length}`;
  document.getElementById('edit-title').value = slide.title || '';
  document.getElementById('edit-kicker').value = slide.kicker || '';
  document.getElementById('edit-subtitle').value = slide.subtitle || '';

  let bulletText = '';
  if (slide.bullets) {
    bulletText = slide.bullets.join('\n');
  } else if (slide.cards) {
    bulletText = slide.cards.map(c => `${c.title}: ${c.desc}`).join('\n');
  } else if (slide.metrics) {
    bulletText = slide.metrics.map(m => `${m.val} | ${m.label} | ${m.sub}`).join('\n');
  }
  document.getElementById('edit-bullets').value = bulletText;
}

function updateUI() {
  if (currentSlideIndex >= deck.length) currentSlideIndex = Math.max(0, deck.length - 1);
  renderDeckNav();
  renderSlideContent(deck[currentSlideIndex], document.getElementById('slide-canvas-content'));
  renderEditor();
}

// Fullscreen Presentation
function startPresenting() {
  isPresenting = true;
  const modal = document.getElementById('present-modal');
  modal.classList.add('active');
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
  const container = document.getElementById('present-canvas-content');
  renderSlideContent(deck[currentSlideIndex], container);
  document.getElementById('pres-counter').textContent = `${currentSlideIndex + 1} / ${deck.length}`;
}

function presNext() {
  if (currentSlideIndex < deck.length - 1) {
    currentSlideIndex++;
    renderPresentSlide();
    updateUI();
  }
}

function presPrev() {
  if (currentSlideIndex > 0) {
    currentSlideIndex--;
    renderPresentSlide();
    updateUI();
  }
}

// Export Standalone HTML
function exportHTML() {
  const title = (deck[0] && deck[0].title) || 'Smart Presentation';
  const slidesJson = JSON.stringify(deck, null, 2);

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
      let bullets = '';
      if (s.bullets) bullets = s.bullets.map(b => '<div style="margin: 0.5rem 0;">&bull; ' + b + '</div>').join('');
      else if (s.cards) bullets = s.cards.map(card => '<div style="margin: 0.5rem 0;"><strong>' + card.title + ':</strong> ' + card.desc + '</div>').join('');
      c.innerHTML = '<div class="kicker">' + (s.kicker||'') + '</div>' +
                    '<div class="title">' + (s.title||'') + '</div>' +
                    '<div class="subtitle">' + (s.subtitle||'') + '</div>' +
                    '<div style="flex:1; display:flex; flex-direction:column; justify-content:center; font-size:1.05rem; line-height:1.6; color:#e2e8f0;">' + bullets + '</div>' +
                    '<div style="display:flex; justify-content:space-between; border-top:1px solid rgba(255,255,255,0.08); padding-top:0.75rem; font-size:0.8rem; color:#64748b;"><span>Slide ' + (idx+1) + ' of ' + deck.length + '</span><span>Smart Slide Deck</span></div>';
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
  deck.forEach(slide => {
    const page = document.createElement('div');
    page.className = 'print-slide-page';
    renderSlideContent(slide, page);
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

// Event Listeners
document.addEventListener('DOMContentLoaded', () => {
  // Initial Deck Generation
  deck = generateSmartDeck('Autonomous Enterprise Reasoning Engine', 'csuite', 8);
  updateUI();

  // Generate Deck Button
  document.getElementById('btn-generate-deck').addEventListener('click', () => {
    const topic = document.getElementById('inp-topic-prompt').value;
    const audience = document.getElementById('select-audience').value;
    const count = parseInt(document.getElementById('select-slide-count').value, 10);
    deck = generateSmartDeck(topic, audience, count);
    currentSlideIndex = 0;
    updateUI();
  });

  // Suggestion Chips
  document.querySelectorAll('.suggestion-chip').forEach(chip => {
    chip.addEventListener('click', () => {
      document.getElementById('inp-topic-prompt').value = chip.dataset.prompt;
      document.getElementById('btn-generate-deck').click();
    });
  });

  // Theme selector
  document.getElementById('select-theme').addEventListener('change', (e) => {
    currentTheme = e.target.value;
    updateUI();
  });

  // Editor Inputs live sync
  const bindEdit = (id, prop) => {
    document.getElementById(id).addEventListener('input', (e) => {
      const slide = deck[currentSlideIndex];
      if (slide) {
        slide[prop] = e.target.value;
        renderSlideContent(slide, document.getElementById('slide-canvas-content'));
        const navTitle = document.querySelectorAll('.deck-nav-item')[currentSlideIndex]?.querySelector('div > div');
        if (navTitle && prop === 'title') navTitle.textContent = e.target.value;
      }
    });
  };

  bindEdit('edit-title', 'title');
  bindEdit('edit-kicker', 'kicker');
  bindEdit('edit-subtitle', 'subtitle');

  document.getElementById('edit-bullets').addEventListener('input', (e) => {
    const slide = deck[currentSlideIndex];
    if (!slide) return;
    const lines = e.target.value.split('\n').filter(l => l.trim().length > 0);
    slide.bullets = lines;
    renderSlideContent(slide, document.getElementById('slide-canvas-content'));
  });

  // Add Slide
  document.getElementById('btn-add-slide').addEventListener('click', () => {
    const newSlide = {
      id: 's-' + (deck.length + 1),
      type: 'list',
      kicker: 'Key Topic',
      title: 'New Strategic Slide',
      subtitle: 'Key strategic objectives and bullet points.',
      bullets: ['First strategic observation', 'Quantified performance metric', 'Actionable recommendation']
    };
    deck.push(newSlide);
    currentSlideIndex = deck.length - 1;
    updateUI();
  });

  // Duplicate Slide
  document.getElementById('btn-dup-slide').addEventListener('click', () => {
    const current = deck[currentSlideIndex];
    if (!current) return;
    const cloned = JSON.parse(JSON.stringify(current));
    cloned.title += ' (Copy)';
    deck.splice(currentSlideIndex + 1, 0, cloned);
    currentSlideIndex++;
    updateUI();
  });

  // Delete Slide
  document.getElementById('btn-del-slide').addEventListener('click', () => {
    if (deck.length <= 1) {
      alert('Presentation must have at least one slide.');
      return;
    }
    deck.splice(currentSlideIndex, 1);
    if (currentSlideIndex >= deck.length) currentSlideIndex = deck.length - 1;
    updateUI();
  });

  // Fullscreen Presenter
  document.getElementById('btn-present-fullscreen').addEventListener('click', startPresenting);
  document.getElementById('pres-btn-exit').addEventListener('click', stopPresenting);
  document.getElementById('pres-btn-next').addEventListener('click', presNext);
  document.getElementById('pres-btn-prev').addEventListener('click', presPrev);

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
    const blob = new Blob([JSON.stringify(deck, null, 2)], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `smart_deck_${Date.now()}.json`;
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
          deck = parsed;
          currentSlideIndex = 0;
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