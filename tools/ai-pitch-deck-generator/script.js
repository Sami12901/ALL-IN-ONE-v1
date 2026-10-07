// AI Pitch Deck Generator - Client-side Studio Engine
// Zero server dependencies. 100% interactive client-side execution.

let deckSlides = [];
let activeSlideIndex = 0;
let activeTheme = 'theme-obsidian';
let isPresenting = false;

// Pitch Presets
const PRESETS = {
  'ai-copilot': {
    name: 'NeuralFlow AI',
    tagline: 'Autonomous Multi-Agent Software Engineering for Enterprise Codebases',
    stage: 'Series A',
    prompt: 'NeuralFlow: Autonomous multi-agent software engineering studio for Fortune 500 engineering orgs',
    market: { tam: '$48B', sam: '$12B', som: '$1.8B' },
    ask: '$12M Series A to scale autonomous enterprise sales & frontier code LLM inference'
  },
  'fintech-api': {
    name: 'ApexPay Global',
    tagline: 'Sub-Second Cross-Border B2B Settlement Infrastructure',
    stage: 'Seed',
    prompt: 'ApexPay: Real-time FX clearing and cross-border payment Rails with 90% fee reduction',
    market: { tam: '$156B', sam: '$28B', som: '$3.5B' },
    ask: '$4.5M Seed Round to secure regulatory money-transmitter licenses in LATAM & APAC'
  },
  'healthtech': {
    name: 'BioSense AI',
    tagline: 'Early Multi-Cancer Diagnostic Screening Through Liquid Biopsy AI',
    stage: 'Series A',
    prompt: 'BioSense: Non-invasive circulating tumor DNA methylation profiling with 99.4% clinical sensitivity',
    market: { tam: '$72B', sam: '$19B', som: '$2.4B' },
    ask: '$15M Series A for multi-center FDA clinical trials and laboratory automation'
  },
  'cleantech': {
    name: 'VoltMesh Clean',
    tagline: 'Next-Generation Decentralized Solid-State Hydrogen Fuel Cells',
    stage: 'Seed',
    prompt: 'VoltMesh: Zero-emission ultra-dense microgrid energy storage for data centers and heavy freight',
    market: { tam: '$110B', sam: '$32B', som: '$4.1B' },
    ask: '$6M Seed to construct 50MW pilot manufacturing facility'
  },
  'devsecops': {
    name: 'ShieldKernel AI',
    tagline: 'Autonomous Cloud eBPF Threat Neutralization & Zero-Day Isolation',
    stage: 'Seed',
    prompt: 'ShieldKernel: Real-time Linux kernel security agents blocking novel exploits in <4ms',
    market: { tam: '$38B', sam: '$14B', som: '$2.2B' },
    ask: '$5M Seed led by top cybersecurity venture funds to expand kernel research team'
  }
};

// Generate Full Pitch Deck
function generatePitchDeck(promptText, stage, count) {
  const brandName = promptText.split(':')[0].trim() || 'VentureX';
  const desc = promptText.includes(':') ? promptText.split(':')[1].trim() : promptText;

  const slides = [];

  // Slide 1: Hero / Vision
  slides.push({
    kicker: `${stage} Financing Deck`,
    title: brandName,
    subtitle: desc || 'Transforming Industry Standards with AI-Driven Performance',
    footerLeft: 'Strictly Confidential',
    layout: 'hero',
    bullets: [
      `Stage: ${stage} Round`,
      `Presenter: Founders & Executive Team`,
      'Confidential Investment Memo'
    ]
  });

  // Slide 2: Problem
  slides.push({
    kicker: 'The Market Inefficiency',
    title: 'Critical Industry Bottlenecks & Legacy Friction',
    subtitle: 'Existing legacy architectures cannot scale with modern velocity and enterprise demands.',
    footerLeft: 'Problem Analysis',
    layout: 'cards',
    cards: [
      { title: 'Astronomical Cost Overhead', desc: 'Organizations burn 40%+ of budgets on manual coordination and legacy software debt.' },
      { title: 'Severe Velocity Chokepoints', desc: 'Critical operations take weeks instead of seconds due to disconnected workflows.' },
      { title: 'Zero Unified Intelligence', desc: 'Siloed data prevents predictive automated decision-making at scale.' }
    ]
  });

  // Slide 3: Solution
  slides.push({
    kicker: 'The Proprietary Breakthrough',
    title: `Introducing ${brandName}`,
    subtitle: 'An intelligent, unified system engineered from the ground up for speed, autonomy, and security.',
    footerLeft: 'Value Proposition',
    layout: 'cards',
    cards: [
      { title: '10x Faster Execution', desc: 'Autonomous execution pipelines eliminate human delay and repetitive manual input.' },
      { title: 'Bank-Grade Resilience', desc: 'Zero-trust architecture ensuring SOC2, ISO27001, and HIPAA compliance from day one.' },
      { title: 'Instant Time-to-Value', desc: 'Plug-and-play integrations with modern cloud stacks in under 15 minutes.' }
    ]
  });

  // Slide 4: Market Opportunity
  slides.push({
    kicker: 'Total Addressable Market',
    title: 'Massive Global Market Opportunity',
    subtitle: 'Driven by structural generational shifts toward autonomous enterprise software.',
    footerLeft: 'Market Sizing',
    layout: 'metrics',
    metrics: [
      { num: '$68B', label: 'Global TAM', sub: 'Total worldwide market spend' },
      { num: '$18B', label: 'Serviceable SAM', sub: 'Immediate target enterprise segment' },
      { num: '$2.5B', label: 'Initial SOM', sub: 'Year 1-3 obtainable wedge' }
    ]
  });

  // Slide 5: Product & Tech Advantage
  slides.push({
    kicker: 'Proprietary Technology',
    title: 'Defensible Architecture & Core Moat',
    subtitle: 'Built on proprietary foundational models, distributed micro-services, and edge telemetry.',
    footerLeft: 'Technology Stack',
    layout: 'cards',
    cards: [
      { title: 'Custom Model Weights', desc: 'Fine-tuned domain models with 4x lower latency and 70% cheaper inference cost.' },
      { title: 'Defensive Data Flywheel', desc: 'Every user workflow compounds model accuracy, creating insurmountable barriers to entry.' },
      { title: 'Zero Cold-Start Lag', desc: 'Pre-indexed enterprise knowledge graphs ready on day 1.' }
    ]
  });

  // Slide 6: Traction & Velocity
  slides.push({
    kicker: 'Commercial Traction',
    title: 'Exponential Growth & Validation',
    subtitle: 'Demonstrating product-market fit with top-tier enterprise pilot conversions.',
    footerLeft: 'Traction Metrics',
    layout: 'metrics',
    metrics: [
      { num: '320%', label: 'YoY Growth', sub: 'Annual recurring revenue velocity' },
      { num: '142%', label: 'Net Retention (NDR)', sub: 'Best-in-class enterprise expansion' },
      { num: '48+', label: 'Enterprise Pilots', sub: 'Average contract value of $65k' }
    ]
  });

  // Slide 7: Business Model & Unit Economics
  slides.push({
    kicker: 'Unit Economics',
    title: 'High-Margin, Compounding Revenue',
    subtitle: 'Scalable subscription SaaS paired with usage-based expansion tiers.',
    footerLeft: 'Business Model',
    layout: 'cards',
    cards: [
      { title: 'Tiered Enterprise SaaS', desc: '$30k - $120k annual platform licenses tailored by compute volume and seat count.' },
      { title: '84% Gross Margins', desc: 'Highly optimized distributed inference keeps cloud compute COGS exceptionally lean.' },
      { title: '5.2x LTV to CAC', desc: 'Organic word-of-mouth and developer advocacy yield rapid 7-month CAC payback.' }
    ]
  });

  // Slide 8: Competitive Landscape
  slides.push({
    kicker: 'Competitive Moat',
    title: 'Why We Win Against Incumbents',
    subtitle: 'Legacy software is bloated, fragile, and unsuited for autonomous enterprise workloads.',
    footerLeft: 'Competitive Matrix',
    layout: 'cards',
    cards: [
      { title: 'Incumbent Suites', desc: 'Slow, fractured acquisitions with disjointed UX and high consulting fees.' },
      { title: 'Point Solutions', desc: 'Fragmented single-feature startups lacking deep enterprise governance.' },
      { title: `${brandName} Advantage`, desc: 'End-to-end unified engine with autonomous execution and native data residency.' }
    ]
  });

  if (count >= 10) {
    // Slide 9: Team
    slides.push({
      kicker: 'Leadership & Pedigree',
      title: 'World-Class Domain Experts',
      subtitle: 'Previous engineering leaders, AI researchers, and repeat exited founders.',
      footerLeft: 'Core Team',
      layout: 'cards',
      cards: [
        { title: 'Alex Vance, CEO', desc: 'Ex-Google Brain Tech Lead; 2x Founder with $120M prior acquisition.' },
        { title: 'Dr. Elena Rostova, CTO', desc: 'PhD Stanford AI Lab; 18 peer-reviewed publications; ex-OpenAI Research.' },
        { title: 'Marcus Chen, VP Sales', desc: 'Scaled enterprise ARR from $2M to $65M at Snowflake & Datadog.' }
      ]
    });

    // Slide 10: The Ask
    slides.push({
      kicker: 'Capital Allocation',
      title: `The Ask: ${stage} Financing`,
      subtitle: 'Fueling engineering acceleration, enterprise go-to-market, and international expansion.',
      footerLeft: 'Investment Terms',
      layout: 'metrics',
      metrics: [
        { num: stage === 'Seed' ? '$4.5M' : '$12.0M', label: 'Target Raise', sub: 'Target 18-24 months runway' },
        { num: '55%', label: 'R&D & Engineering', sub: 'Model training & core platform' },
        { num: '30%', label: 'Enterprise GTM', sub: 'Strategic sales & customer success' }
      ]
    });
  }

  if (count >= 12) {
    // Slide 11: 24-Month Roadmap
    slides.push({
      kicker: 'Strategic Milestones',
      title: '24-Month Execution Roadmap',
      subtitle: 'Key technological breakthroughs and commercial targets over the next 8 quarters.',
      footerLeft: 'Product Roadmap',
      layout: 'cards',
      cards: [
        { title: 'Q1-Q2 2027', desc: 'Launch multi-modal agent hub; reach $5M ARR with 40 enterprise customers.' },
        { title: 'Q3-Q4 2027', desc: 'Expand to EMEA & APAC regions; achieve SOC 2 Type II and FedRAMP readiness.' },
        { title: '2028 Horizon', desc: 'Launch self-learning developer marketplace; target Series B at $20M+ ARR.' }
      ]
    });

    // Slide 12: Closing / Contact
    slides.push({
      kicker: 'Join Our Journey',
      title: 'Building The Future of Enterprise Autonomy',
      subtitle: `Partner with ${brandName} to lead this once-in-a-generation architectural shift.`,
      footerLeft: 'Q&A and Next Steps',
      layout: 'hero',
      bullets: [
        'Founder Direct Email: founders@startup.io',
        'Website & Product Demo: https://startup.io',
        'Headquarters: San Francisco, CA & Remote'
      ]
    });
  }

  return slides;
}

// Render Thumbnails
function renderThumbnails() {
  const container = document.getElementById('deck-thumbs-list');
  if (!container) return;

  container.innerHTML = '';
  deckSlides.forEach((slide, idx) => {
    const item = document.createElement('div');
    item.className = `deck-thumb-item ${idx === activeSlideIndex ? 'active' : ''}`;
    item.onclick = () => selectSlide(idx);

    item.innerHTML = `
      <span class="thumb-num">#${idx + 1}</span>
      <div class="thumb-info">
        <div class="thumb-kicker">${escapeHtml(slide.kicker || 'SLIDE')}</div>
        <div class="thumb-title">${escapeHtml(slide.title || 'Untitled Slide')}</div>
      </div>
    `;
    container.appendChild(item);
  });

  const counter = document.getElementById('counter-active-slide');
  if (counter) {
    counter.textContent = `${activeSlideIndex + 1} / ${deckSlides.length}`;
  }

  const badgeCount = document.getElementById('badge-slide-count');
  if (badgeCount) {
    badgeCount.textContent = `${deckSlides.length} Slides`;
  }
}

// Render Slide to an Element
function renderSlideContent(slide, targetEl, isFullscreen = false) {
  if (!slide || !targetEl) return;

  let bodyHtml = '';

  if (slide.layout === 'metrics' && slide.metrics) {
    bodyHtml = `
      <div class="slide-body-grid">
        ${slide.metrics.map(m => `
          <div class="slide-card">
            <div>
              <div class="slide-metric-num">${escapeHtml(m.num || '')}</div>
              <h4>${escapeHtml(m.label || '')}</h4>
            </div>
            <p>${escapeHtml(m.sub || '')}</p>
          </div>
        `).join('')}
      </div>
    `;
  } else if (slide.layout === 'cards' && slide.cards) {
    bodyHtml = `
      <div class="slide-body-grid">
        ${slide.cards.map(c => `
          <div class="slide-card">
            <h4>${escapeHtml(c.title || '')}</h4>
            <p>${escapeHtml(c.desc || '')}</p>
          </div>
        `).join('')}
      </div>
    `;
  } else if (slide.bullets && slide.bullets.length > 0) {
    bodyHtml = `
      <div style="background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.08); border-radius: var(--radius-md); padding: 1.5rem; margin-top: 1.25rem;">
        <ul style="margin: 0; padding-left: 1.25rem; display: flex; flex-direction: column; gap: 0.75rem; color: #cbd5e1; font-size: ${isFullscreen ? '1.15rem' : '0.95rem'};">
          ${slide.bullets.map(b => `<li>${escapeHtml(b)}</li>`).join('')}
        </ul>
      </div>
    `;
  }

  targetEl.innerHTML = `
    <div>
      <div class="slide-badge">${escapeHtml(slide.kicker || 'OVERVIEW')}</div>
      <h2 class="slide-main-title">${escapeHtml(slide.title || 'Slide Title')}</h2>
      <p class="slide-lead-sub">${escapeHtml(slide.subtitle || '')}</p>
      ${bodyHtml}
    </div>
    <div class="slide-footer-bar">
      <span>${escapeHtml(slide.footerLeft || 'Venture Presentation')}</span>
      <span>Slide ${activeSlideIndex + 1} of ${deckSlides.length}</span>
    </div>
  `;
}

// Select Slide
function selectSlide(idx) {
  if (idx < 0 || idx >= deckSlides.length) return;
  activeSlideIndex = idx;
  renderThumbnails();

  const canvasSlide = document.getElementById('canvas-active-slide');
  if (canvasSlide) {
    canvasSlide.className = `canvas-slide ${activeTheme}`;
    renderSlideContent(deckSlides[activeSlideIndex], canvasSlide, false);
  }

  // Populate Inspector
  const cur = deckSlides[activeSlideIndex];
  if (cur) {
    const inTitle = document.getElementById('edit-slide-title');
    const inKicker = document.getElementById('edit-slide-kicker');
    const inSub = document.getElementById('edit-slide-sub');
    const inBullets = document.getElementById('edit-slide-bullets');

    if (inTitle) inTitle.value = cur.title || '';
    if (inKicker) inKicker.value = cur.kicker || '';
    if (inSub) inSub.value = cur.subtitle || '';

    if (inBullets) {
      if (cur.cards) {
        inBullets.value = cur.cards.map(c => `${c.title}: ${c.desc}`).join('\n');
      } else if (cur.metrics) {
        inBullets.value = cur.metrics.map(m => `${m.num} | ${m.label}: ${m.sub}`).join('\n');
      } else if (cur.bullets) {
        inBullets.value = cur.bullets.join('\n');
      } else {
        inBullets.value = '';
      }
    }
  }

  if (isPresenting) {
    updateFullscreenView();
  }
}

// Update Active Slide from Inspector
function syncInspectorToSlide() {
  const cur = deckSlides[activeSlideIndex];
  if (!cur) return;

  const inTitle = document.getElementById('edit-slide-title');
  const inKicker = document.getElementById('edit-slide-kicker');
  const inSub = document.getElementById('edit-slide-sub');
  const inBullets = document.getElementById('edit-slide-bullets');

  if (inTitle) cur.title = inTitle.value;
  if (inKicker) cur.kicker = inKicker.value;
  if (inSub) cur.subtitle = inSub.value;

  if (inBullets) {
    const lines = inBullets.value.split('\n').map(l => l.trim()).filter(Boolean);
    if (cur.layout === 'cards') {
      cur.cards = lines.map(line => {
        if (line.includes(':')) {
          const parts = line.split(':');
          return { title: parts[0].trim(), desc: parts.slice(1).join(':').trim() };
        }
        return { title: line, desc: '' };
      });
    } else if (cur.layout === 'metrics') {
      cur.metrics = lines.map(line => {
        const parts = line.split(/[:|]/);
        if (parts.length >= 2) {
          return { num: parts[0].trim(), label: parts[1].trim(), sub: parts[2] ? parts[2].trim() : '' };
        }
        return { num: '100%', label: line, sub: '' };
      });
    } else {
      cur.bullets = lines;
    }
  }

  renderThumbnails();
  const canvasSlide = document.getElementById('canvas-active-slide');
  if (canvasSlide) {
    renderSlideContent(cur, canvasSlide, false);
  }
}

// Fullscreen Presentation Mode
function openFullscreen() {
  const modal = document.getElementById('fs-presenter-modal');
  if (!modal) return;
  isPresenting = true;
  modal.classList.add('active');
  updateFullscreenView();

  if (document.documentElement.requestFullscreen) {
    document.documentElement.requestFullscreen().catch(() => {});
  }
}

function closeFullscreen() {
  const modal = document.getElementById('fs-presenter-modal');
  if (!modal) return;
  isPresenting = false;
  modal.classList.remove('active');

  if (document.fullscreenElement && document.exitFullscreen) {
    document.exitFullscreen().catch(() => {});
  }
}

function updateFullscreenView() {
  const fsSlide = document.getElementById('fs-slide-content');
  const hudCount = document.getElementById('fs-hud-count');
  if (!fsSlide) return;

  fsSlide.className = `canvas-slide ${activeTheme}`;
  renderSlideContent(deckSlides[activeSlideIndex], fsSlide, true);

  if (hudCount) {
    hudCount.textContent = `${activeSlideIndex + 1} / ${deckSlides.length}`;
  }
}

function nextSlide() {
  if (activeSlideIndex < deckSlides.length - 1) {
    selectSlide(activeSlideIndex + 1);
  }
}

function prevSlide() {
  if (activeSlideIndex > 0) {
    selectSlide(activeSlideIndex - 1);
  }
}

// Slide Management
function addSlide() {
  const newSlide = {
    kicker: 'Key Dimension',
    title: 'Strategic Highlight',
    subtitle: 'Describe the core differentiator or executive takeaway.',
    footerLeft: 'Strategic Pillar',
    layout: 'cards',
    cards: [
      { title: 'Feature Alpha', desc: 'Detailed explanation of competitive value.' },
      { title: 'Feature Beta', desc: 'Quantified performance advantage.' },
      { title: 'Feature Gamma', desc: 'Scalable operational impact.' }
    ]
  };
  deckSlides.splice(activeSlideIndex + 1, 0, newSlide);
  selectSlide(activeSlideIndex + 1);
}

function duplicateSlide() {
  if (!deckSlides[activeSlideIndex]) return;
  const clone = JSON.parse(JSON.stringify(deckSlides[activeSlideIndex]));
  clone.title += ' (Copy)';
  deckSlides.splice(activeSlideIndex + 1, 0, clone);
  selectSlide(activeSlideIndex + 1);
}

function deleteSlide() {
  if (deckSlides.length <= 1) {
    alert('A pitch deck must contain at least 1 slide.');
    return;
  }
  deckSlides.splice(activeSlideIndex, 1);
  if (activeSlideIndex >= deckSlides.length) {
    activeSlideIndex = deckSlides.length - 1;
  }
  selectSlide(activeSlideIndex);
}

function moveSlideUp() {
  if (activeSlideIndex <= 0) return;
  const temp = deckSlides[activeSlideIndex];
  deckSlides[activeSlideIndex] = deckSlides[activeSlideIndex - 1];
  deckSlides[activeSlideIndex - 1] = temp;
  selectSlide(activeSlideIndex - 1);
}

function moveSlideDown() {
  if (activeSlideIndex >= deckSlides.length - 1) return;
  const temp = deckSlides[activeSlideIndex];
  deckSlides[activeSlideIndex] = deckSlides[activeSlideIndex + 1];
  deckSlides[activeSlideIndex + 1] = temp;
  selectSlide(activeSlideIndex + 1);
}

// Exports
function exportStandaloneHtml() {
  const deckTitle = deckSlides[0]?.title || 'Startup Pitch Deck';
  const slidesJson = JSON.stringify(deckSlides);

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeHtml(deckTitle)} - Interactive Pitch Deck</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      background: #060911;
      color: #f8fafc;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
      overflow: hidden;
    }
    .deck-frame {
      width: 95vw;
      max-width: 1300px;
      aspect-ratio: 16 / 9;
      background: #090d16;
      border-radius: 16px;
      border: 1px solid rgba(255, 255, 255, 0.1);
      box-shadow: 0 20px 50px rgba(0, 0, 0, 0.8);
      position: relative;
      overflow: hidden;
      display: flex;
    }
    .slide-body {
      width: 100%;
      height: 100%;
      padding: 3.5rem;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      background: radial-gradient(circle at 85% 15%, rgba(99, 102, 241, 0.18), transparent 50%),
                  radial-gradient(circle at 15% 85%, rgba(139, 92, 246, 0.12), transparent 50%),
                  #0b0f19;
    }
    .badge {
      display: inline-block;
      padding: 0.3rem 0.8rem;
      background: rgba(255,255,255,0.08);
      border: 1px solid rgba(255,255,255,0.15);
      border-radius: 9999px;
      font-size: 0.8rem;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      color: #94a3b8;
      margin-bottom: 0.75rem;
    }
    h1 { font-size: 2.5rem; font-weight: 800; line-height: 1.15; margin-bottom: 0.5rem; }
    p.sub { font-size: 1.15rem; color: #94a3b8; margin-bottom: 1.5rem; }
    .grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 1rem; margin-top: 1rem; }
    .card { background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.1); border-radius: 12px; padding: 1.25rem; }
    .card h3 { font-size: 1.1rem; margin-bottom: 0.5rem; color: #fff; }
    .card p { font-size: 0.85rem; color: #94a3b8; line-height: 1.45; }
    .metric-val { font-size: 2.5rem; font-weight: 900; color: #818cf8; line-height: 1; margin-bottom: 0.4rem; }
    .footer { display: flex; justify-content: space-between; border-top: 1px solid rgba(255,255,255,0.08); padding-top: 1rem; font-size: 0.8rem; color: #64748b; }
    .nav-bar {
      position: fixed;
      bottom: 1.5rem;
      display: flex;
      align-items: center;
      gap: 1rem;
      background: rgba(15, 23, 42, 0.9);
      padding: 0.6rem 1.25rem;
      border-radius: 9999px;
      border: 1px solid rgba(255,255,255,0.15);
    }
    button {
      background: transparent;
      border: none;
      color: #fff;
      font-weight: 700;
      cursor: pointer;
      padding: 0.3rem 0.75rem;
    }
  </style>
</head>
<body>
  <div class="deck-frame">
    <div class="slide-body" id="slide-root"></div>
  </div>
  <div class="nav-bar">
    <button id="p-btn">&larr; Prev</button>
    <span id="p-cnt" style="color: #818cf8; font-weight: 700;">1 / ${deckSlides.length}</span>
    <button id="n-btn">Next &rarr;</button>
  </div>
  <script>
    const slides = ${slidesJson};
    let cur = 0;
    function render() {
      const s = slides[cur];
      let b = '';
      if (s.layout === 'metrics' && s.metrics) {
        b = '<div class="grid">' + s.metrics.map(m => '<div class="card"><div class="metric-val">' + m.num + '</div><h3>' + m.label + '</h3><p>' + m.sub + '</p></div>').join('') + '</div>';
      } else if (s.layout === 'cards' && s.cards) {
        b = '<div class="grid">' + s.cards.map(c => '<div class="card"><h3>' + c.title + '</h3><p>' + c.desc + '</p></div>').join('') + '</div>';
      } else if (s.bullets) {
        b = '<div class="card"><ul style="padding-left:1.5rem;line-height:2;">' + s.bullets.map(x => '<li>' + x + '</li>').join('') + '</ul></div>';
      }
      document.getElementById('slide-root').innerHTML = '<div><div class="badge">' + (s.kicker || '') + '</div><h1>' + (s.title || '') + '</h1><p class="sub">' + (s.subtitle || '') + '</p>' + b + '</div><div class="footer"><span>' + (s.footerLeft || 'Pitch Deck') + '</span><span>' + (cur+1) + ' of ' + slides.length + '</span></div>';
      document.getElementById('p-cnt').textContent = (cur + 1) + ' / ' + slides.length;
    }
    document.getElementById('p-btn').onclick = () => { if (cur > 0) { cur--; render(); } };
    document.getElementById('n-btn').onclick = () => { if (cur < slides.length - 1) { cur++; render(); } };
    window.addEventListener('keydown', e => {
      if (e.key === 'ArrowRight' || e.key === ' ') { if (cur < slides.length - 1) { cur++; render(); } }
      if (e.key === 'ArrowLeft') { if (cur > 0) { cur--; render(); } }
    });
    render();
  </script>
</body>
</html>`;

  downloadBlob(html, `${deckTitle.toLowerCase().replace(/[^a-z0-9]/g, '_')}_pitch_deck.html`, 'text/html');
}

function exportDeckJson() {
  const jsonStr = JSON.stringify(deckSlides, null, 2);
  const deckTitle = deckSlides[0]?.title || 'pitch_deck';
  downloadBlob(jsonStr, `${deckTitle.toLowerCase().replace(/[^a-z0-9]/g, '_')}.json`, 'application/json');
}

function importDeckJson(file) {
  const reader = new FileReader();
  reader.onload = e => {
    try {
      const data = JSON.parse(e.target.result);
      if (Array.isArray(data) && data.length > 0) {
        deckSlides = data;
        activeSlideIndex = 0;
        renderThumbnails();
        selectSlide(0);
      } else {
        alert('Invalid JSON: Must be an array of slide objects.');
      }
    } catch (err) {
      alert('Failed to parse JSON file.');
    }
  };
  reader.readAsText(file);
}

function printDeckPdf() {
  const printTarget = document.getElementById('pitch-print-target');
  if (!printTarget) return;

  printTarget.innerHTML = '';
  deckSlides.forEach((slide, idx) => {
    const page = document.createElement('div');
    page.className = `print-slide ${activeTheme}`;
    renderSlideContent(slide, page, false);
    printTarget.appendChild(page);
  });

  window.print();
}

function downloadBlob(content, filename, type) {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

// Initialization & Event Binding
document.addEventListener('DOMContentLoaded', () => {
  const promptInput = document.getElementById('inp-pitch-prompt');
  const stageSelect = document.getElementById('select-stage');
  const countSelect = document.getElementById('select-count');
  const themeSelect = document.getElementById('select-deck-theme');

  // Load Initial Deck
  deckSlides = generatePitchDeck(
    promptInput ? promptInput.value : 'NeuralFlow',
    stageSelect ? stageSelect.value : 'Seed',
    countSelect ? parseInt(countSelect.value, 10) : 10
  );

  renderThumbnails();
  selectSlide(0);

  // Generate Button
  const btnGen = document.getElementById('btn-generate-deck');
  if (btnGen) {
    btnGen.addEventListener('click', () => {
      const p = promptInput ? promptInput.value.trim() : 'Startup Pitch';
      const s = stageSelect ? stageSelect.value : 'Seed';
      const c = countSelect ? parseInt(countSelect.value, 10) : 10;
      deckSlides = generatePitchDeck(p, s, c);
      activeSlideIndex = 0;
      renderThumbnails();
      selectSlide(0);
    });
  }

  // Presets
  const presetPills = document.querySelectorAll('.preset-pill');
  presetPills.forEach(pill => {
    pill.addEventListener('click', () => {
      const key = pill.getAttribute('data-preset');
      const preset = PRESETS[key];
      if (preset) {
        if (promptInput) promptInput.value = preset.prompt;
        if (stageSelect) stageSelect.value = preset.stage;
        deckSlides = generatePitchDeck(preset.prompt, preset.stage, 10);
        activeSlideIndex = 0;
        renderThumbnails();
        selectSlide(0);
      }
    });
  });

  // Theme Change
  if (themeSelect) {
    themeSelect.addEventListener('change', () => {
      activeTheme = themeSelect.value;
      const canvasSlide = document.getElementById('canvas-active-slide');
      if (canvasSlide) {
        canvasSlide.className = `canvas-slide ${activeTheme}`;
      }
      if (isPresenting) {
        updateFullscreenView();
      }
    });
  }

  // Inspector Inputs live sync
  ['edit-slide-title', 'edit-slide-kicker', 'edit-slide-sub', 'edit-slide-bullets'].forEach(id => {
    const el = document.getElementById(id);
    if (el) {
      el.addEventListener('input', syncInspectorToSlide);
    }
  });

  // Reordering & Management
  document.getElementById('btn-add-slide')?.addEventListener('click', addSlide);
  document.getElementById('btn-slide-up')?.addEventListener('click', moveSlideUp);
  document.getElementById('btn-slide-down')?.addEventListener('click', moveSlideDown);
  document.getElementById('btn-slide-duplicate')?.addEventListener('click', duplicateSlide);
  document.getElementById('btn-slide-delete')?.addEventListener('click', deleteSlide);

  // Fullscreen Presentation Controls
  document.getElementById('btn-present-mode')?.addEventListener('click', openFullscreen);
  document.getElementById('fs-btn-exit')?.addEventListener('click', closeFullscreen);
  document.getElementById('fs-btn-next')?.addEventListener('click', nextSlide);
  document.getElementById('fs-btn-prev')?.addEventListener('click', prevSlide);

  // Keyboard navigation
  window.addEventListener('keydown', e => {
    if (e.key === 'F5') {
      e.preventDefault();
      openFullscreen();
    } else if (e.key === 'Escape' && isPresenting) {
      closeFullscreen();
    } else if (e.key === 'ArrowRight' || e.key === ' ') {
      if (isPresenting) {
        e.preventDefault();
        nextSlide();
      }
    } else if (e.key === 'ArrowLeft') {
      if (isPresenting) {
        e.preventDefault();
        prevSlide();
      }
    }
  });

  // Exports
  document.getElementById('btn-export-html')?.addEventListener('click', exportStandaloneHtml);
  document.getElementById('btn-export-json')?.addEventListener('click', exportDeckJson);
  document.getElementById('btn-export-pdf')?.addEventListener('click', printDeckPdf);

  const importInput = document.getElementById('input-import-json');
  if (importInput) {
    importInput.addEventListener('change', e => {
      if (e.target.files && e.target.files[0]) {
        importDeckJson(e.target.files[0]);
      }
    });
  }
});