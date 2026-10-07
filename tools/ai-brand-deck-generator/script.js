// AI Brand Deck Generator Engine
// Zero server dependencies. 100% interactive client-side execution.

let brandSlides = [];
let activeSlideIndex = 0;
let isPresenting = false;

// Presets Dictionary
const BRAND_PRESETS = {
  'luxe-obsidian': {
    name: 'Obsidian Luxe',
    prompt: 'Obsidian Luxe: Minimalist luxury haute couture and high-performance computing hardware',
    archetype: 'Ruler / Elite',
    palette: [
      { name: 'Obsidian Noir', hex: '#090a0f', rgb: 'rgb(9, 10, 15)', role: 'Primary Background' },
      { name: 'Platinum Silver', hex: '#e2e8f0', rgb: 'rgb(226, 232, 240)', role: 'Primary Typography' },
      { name: 'Electric Violet', hex: '#8b5cf6', rgb: 'rgb(139, 92, 246)', role: 'Digital Accent' },
      { name: 'Slate Smoke', hex: '#475569', rgb: 'rgb(71, 85, 105)', role: 'Subtle Borders' },
      { name: 'Champagne Pearl', hex: '#fef3c7', rgb: 'rgb(254, 243, 199)', role: 'Highlight Sheen' }
    ]
  },
  'quantum-cyber': {
    name: 'Quantum Cyber',
    prompt: 'Quantum Cyber: Next-generation quantum cloud orchestration and developer tooling',
    archetype: 'Creator / Visionary',
    palette: [
      { name: 'Deep Space', hex: '#050814', rgb: 'rgb(5, 8, 20)', role: 'Base Canvas' },
      { name: 'Cyber Cyan', hex: '#06b6d4', rgb: 'rgb(6, 182, 212)', role: 'Primary Electric' },
      { name: 'Terminal Green', hex: '#10b981', rgb: 'rgb(16, 185, 129)', role: 'Success Signal' },
      { name: 'Neon Indigo', hex: '#6366f1', rgb: 'rgb(99, 102, 241)', role: 'Interactive Links' },
      { name: 'Pure Frost', hex: '#f8fafc', rgb: 'rgb(248, 250, 252)', role: 'Headline Type' }
    ]
  },
  'aura-wellness': {
    name: 'Aura Wellness',
    prompt: 'Aura Wellness: Clean longevity diagnostics, regenerative nutrition, and cellular health',
    archetype: 'Caregiver / Nurturer',
    palette: [
      { name: 'Forest Moss', hex: '#06281e', rgb: 'rgb(6, 40, 30)', role: 'Deep Botanical' },
      { name: 'Sage Leaf', hex: '#10b981', rgb: 'rgb(16, 185, 129)', role: 'Vital Accent' },
      { name: 'Sand Dune', hex: '#e5e7eb', rgb: 'rgb(229, 231, 235)', role: 'Neutral Warmth' },
      { name: 'Sunset Coral', hex: '#f97316', rgb: 'rgb(249, 115, 22)', role: 'Vibrant Pulse' },
      { name: 'Clean Cream', hex: '#fefce8', rgb: 'rgb(254, 252, 232)', role: 'Gentle Background' }
    ]
  },
  'apex-fintech': {
    name: 'Apex Capital',
    prompt: 'Apex Capital: Sovereign wealth orchestration, algorithmic liquidity, and private equity',
    archetype: 'The Sage / Intellect',
    palette: [
      { name: 'Navy Citadel', hex: '#07112c', rgb: 'rgb(7, 17, 44)', role: 'Institutional Dark' },
      { name: 'Sovereign Gold', hex: '#f59e0b', rgb: 'rgb(245, 158, 11)', role: 'Prestige Gold' },
      { name: 'Glacier Blue', hex: '#38bdf8', rgb: 'rgb(56, 189, 248)', role: 'Precision Metric' },
      { name: 'Slate Anchor', hex: '#64748b', rgb: 'rgb(100, 116, 139)', role: 'Secondary Copy' },
      { name: 'Pure White', hex: '#ffffff', rgb: 'rgb(255, 255, 255)', role: 'Contrast Spec' }
    ]
  },
  'solaris-clean': {
    name: 'Solaris Green',
    prompt: 'Solaris Green: Clean grid infrastructure, solid-state battery storage, and solar capture',
    archetype: 'Creator / Visionary',
    palette: [
      { name: 'Carbon Black', hex: '#090d10', rgb: 'rgb(9, 13, 16)', role: 'Base Element' },
      { name: 'Solar Amber', hex: '#f59e0b', rgb: 'rgb(245, 158, 11)', role: 'Energy Harvest' },
      { name: 'Hydrogen Emerald', hex: '#10b981', rgb: 'rgb(16, 185, 129)', role: 'Ecological Purity' },
      { name: 'Atmosphere Blue', hex: '#0ea5e9', rgb: 'rgb(14, 165, 233)', role: 'Sky Horizon' },
      { name: 'Clean Solar White', hex: '#f8fafc', rgb: 'rgb(248, 250, 252)', role: 'Clarity Focus' }
    ]
  }
};

// Generate Full Brand Guidelines Deck
function generateBrandDeck(brandPrompt, archetype, count, customPalette = null) {
  const brandName = brandPrompt.split(':')[0].trim() || 'Brand Identity';
  const desc = brandPrompt.includes(':') ? brandPrompt.split(':')[1].trim() : brandPrompt;

  const palette = customPalette || BRAND_PRESETS['luxe-obsidian'].palette;

  const slides = [
    // Slide 1: Brand Essence
    {
      kicker: 'BRAND IDENTITY & ESSENCE',
      title: brandName,
      subtitle: desc || 'Architecting the Future of High-Performance Design Systems',
      footerLeft: 'Official Brand Guidelines',
      layout: 'hero',
      cards: [
        { title: `Archetype: ${archetype}`, desc: 'Defines how the brand navigates market discourse and inspires customer loyalty.' },
        { title: 'Brand Vision', desc: 'To pioneer uncompromising excellence and deliver category-defining clarity.' },
        { title: 'Governance Standard', desc: 'Unified visual and tonal guidelines for all external & internal touchpoints.' }
      ]
    },
    // Slide 2: Mission, Vision & Core Values
    {
      kicker: 'FOUNDATIONAL TENETS',
      title: 'Mission, Vision & Core Values',
      subtitle: 'The non-negotiable principles that steer our product and cultural direction.',
      footerLeft: 'Brand Foundation',
      layout: 'cards',
      cards: [
        { title: '1. Radical Precision', desc: 'We do not tolerate ambiguity. Every pixel, interface, and sentence is calibrated for absolute clarity.' },
        { title: '2. Audacious Innovation', desc: 'We lead generational transformations rather than competing on incremental feature checklists.' },
        { title: '3. Unyielding Trust', desc: 'Bank-grade security, ethical transparency, and long-term partnership commitment.' }
      ]
    },
    // Slide 3: Brand Personality & Tone
    {
      kicker: 'TONE OF VOICE',
      title: 'Brand Personality & Voice Matrix',
      subtitle: 'How we articulate our conviction across diverse audiences and mediums.',
      footerLeft: 'Voice & Tone',
      layout: 'cards',
      cards: [
        { title: 'Confident, Never Arrogant', desc: 'State accomplishments and architectural facts with understated authority.' },
        { title: 'Visionary, Yet Grounded', desc: 'Discuss bold futures, but anchor every promise in verifiable technical and business metrics.' },
        { title: 'Concise, Never Cryptic', desc: 'Eliminate corporate buzzwords and hollow filler. Respect the audience’s cognitive time.' }
      ]
    },
    // Slide 4: Color Palette & Swatches
    {
      kicker: 'COLOR SYSTEM',
      title: 'Harmonic Color Architecture',
      subtitle: 'A disciplined, high-contrast palette engineered for both physical and digital media.',
      footerLeft: 'Design Tokens',
      layout: 'palette',
      palette: palette
    },
    // Slide 5: Typography Hierarchy
    {
      kicker: 'TYPOGRAPHY SPECIFICATION',
      title: 'Typographic Hierarchy & Scale',
      subtitle: 'Geometric modern letterforms paired with ultra-legible neutral body copy.',
      footerLeft: 'Typography Standards',
      layout: 'cards',
      cards: [
        { title: 'Display Headings: Plus Jakarta / Outfit', desc: 'Font weight 800 (Extra Bold). Tracking -0.02em. Used for hero titles, section kickers, and key metrics.' },
        { title: 'Subheadings: Inter SemiBold', desc: 'Font weight 600. Tracking -0.01em. Used for secondary navigation, card headlines, and metadata.' },
        { title: 'Body Copy: Inter Regular', desc: 'Font weight 400. 1.6 Line height. High legibility across 14px to 18px scales in all viewports.' }
      ]
    },
    // Slide 6: Logo Construction & Clear Space
    {
      kicker: 'LOGOMARK & EMBLEM',
      title: 'Logo Construction & Clear Space',
      subtitle: 'Strict protection rules preserving icon integrity across all touchpoints.',
      footerLeft: 'Logo Protection',
      layout: 'cards',
      cards: [
        { title: 'Clear Space Margin (1X)', desc: 'Maintain padding equal to the logomark height around all borders to ensure visual breathing room.' },
        { title: 'Minimum Scale Rules', desc: 'Digital: Minimum 32px height for favicon/mobile. Print: Minimum 15mm width to preserve micro-details.' },
        { title: 'Absolute Don’ts', desc: 'Never distort aspect ratio, add heavy drop shadows, outline mark, or place on busy unauthorized photography.' }
      ]
    },
    // Slide 7: Imagery & Visual Aesthetic
    {
      kicker: 'ART DIRECTION',
      title: 'Visual Aesthetic & Photography',
      subtitle: 'Moody, cinematic art direction centered on physical depth and purposeful light.',
      footerLeft: 'Art Direction',
      layout: 'cards',
      cards: [
        { title: 'Lighting & Contrast', desc: 'Subtle directional lighting with deep natural shadows. Avoid flat artificial studio lighting.' },
        { title: 'Human Authenticity', desc: 'Subject matter should feature engineers, researchers, and builders engaged in focused creation.' },
        { title: 'Architectural Textures', desc: 'Brushed dark titanium, matte obsidian surfaces, glass refraction, and subtle ambient glows.' }
      ]
    },
    // Slide 8: Multi-Channel Touchpoints
    {
      kicker: 'BRAND APPLICATIONS',
      title: 'Multi-Channel Brand Touchpoints',
      subtitle: 'Cohesive physical and digital application across all customer journeys.',
      footerLeft: 'Omnichannel Governance',
      layout: 'cards',
      cards: [
        { title: 'Digital Web & Mobile UI', desc: 'Dark glassmorphic surfaces, subtle 1px border highlights, responsive 12-column layout grid.' },
        { title: 'Physical Packaging & Swag', desc: 'Tactile matte finishes, embossed foil accents, minimalist unboxing rituals.' },
        { title: 'Editorial & Keynote Decks', desc: 'Generous whitespace, large focal typography, bold data visualizations.' }
      ]
    }
  ];

  if (count >= 10) {
    slides.push({
      kicker: 'CO-BRANDING PROTOCOLS',
      title: 'Partnerships & Co-Branding Rules',
      subtitle: 'Maintaining brand parity and prominence in ecosystem collaborations.',
      footerLeft: 'Ecosystem Protocols',
      layout: 'cards',
      cards: [
        { title: 'Visual Parity Divider', desc: 'Separate logos using a 1px vertical slate divider (#475569) with 24px horizontal clearance.' },
        { title: 'Primary Brand Lockup', desc: 'Our emblem must retain 100% optical scale equality with partner emblems.' },
        { title: 'Legal Attribution Notice', desc: 'Explicit trademark attribution must appear in standard 10pt disclaimer footers.' }
      ]
    });

    slides.push({
      kicker: 'STEWARDSHIP & ASSETS',
      title: 'Brand Asset Library & Stewardship',
      subtitle: 'Continuous governance and verified vectors for global marketing teams.',
      footerLeft: 'Brand Governance',
      layout: 'cards',
      cards: [
        { title: 'Design Token Repository', desc: 'Figma Community Design System & GitHub CSS/Tailwind repository: brand.company.io' },
        { title: 'Vector Asset Packages', desc: 'Download approved SVG, EPS, and PNG asset suites via the internal brand portal.' },
        { title: 'Brand Steward Contact', desc: 'Direct inquiries to brand-governance@company.io for custom campaign review.' }
      ]
    });
  }

  return slides;
}

// Render Thumbnails
function renderThumbnails() {
  const container = document.getElementById('brand-thumbs-container');
  if (!container) return;

  container.innerHTML = '';
  brandSlides.forEach((slide, idx) => {
    const card = document.createElement('div');
    card.className = `brand-thumb-card ${idx === activeSlideIndex ? 'active' : ''}`;
    card.onclick = () => selectSlide(idx);

    card.innerHTML = `
      <span style="font-weight: 800; font-size: 0.75rem; color: var(--accent);">#${idx + 1}</span>
      <div style="flex: 1; overflow: hidden;">
        <div style="font-size: 0.7rem; color: var(--text-secondary); text-transform: uppercase;">${escapeHtml(slide.kicker || 'SECTION')}</div>
        <div style="font-size: 0.82rem; font-weight: 600; color: #fff; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${escapeHtml(slide.title || 'Untitled')}</div>
      </div>
    `;
    container.appendChild(card);
  });

  const counter = document.getElementById('counter-active-slide');
  if (counter) counter.textContent = `${activeSlideIndex + 1} / ${brandSlides.length}`;

  const badgeTotal = document.getElementById('badge-total-slides');
  if (badgeTotal) badgeTotal.textContent = `${brandSlides.length} Slides`;
}

// Render Slide Content to DOM
function renderBrandSlide(slide, targetEl, isFullscreen = false) {
  if (!slide || !targetEl) return;

  let bodyHtml = '';

  if (slide.layout === 'palette' && slide.palette) {
    bodyHtml = `
      <div class="swatches-grid">
        ${slide.palette.map(swatch => `
          <div class="swatch-item">
            <div class="swatch-color-box" style="background: ${swatch.hex};"></div>
            <div class="swatch-label-box">
              <strong style="color: #fff; display: block; font-size: 0.8rem; margin-bottom: 0.2rem;">${escapeHtml(swatch.name)}</strong>
              <div style="color: #94a3b8; font-family: monospace; font-size: 0.75rem;">${escapeHtml(swatch.hex)}</div>
              <div style="color: #64748b; font-size: 0.7rem; margin-top: 0.2rem;">${escapeHtml(swatch.role)}</div>
            </div>
          </div>
        `).join('')}
      </div>
    `;
  } else if (slide.cards) {
    bodyHtml = `
      <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 1rem; margin-top: 1.25rem;">
        ${slide.cards.map(c => `
          <div style="background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.1); border-radius: 12px; padding: 1.25rem; display: flex; flex-direction: column; justify-content: space-between;">
            <h4 style="font-size: 1.05rem; font-weight: 700; color: #fff; margin-bottom: 0.4rem;">${escapeHtml(c.title)}</h4>
            <p style="font-size: 0.85rem; color: #94a3b8; line-height: 1.45; margin: 0;">${escapeHtml(c.desc)}</p>
          </div>
        `).join('')}
      </div>
    `;
  }

  targetEl.innerHTML = `
    <div>
      <div style="display: inline-block; padding: 0.25rem 0.65rem; background: rgba(255,255,255,0.08); border: 1px solid rgba(255,255,255,0.15); border-radius: 9999px; font-size: 0.72rem; font-weight: 700; text-transform: uppercase; color: #cbd5e1; margin-bottom: 0.6rem;">
        ${escapeHtml(slide.kicker || 'GUIDELINES')}
      </div>
      <h2 style="font-size: ${isFullscreen ? '2.4rem' : '1.9rem'}; font-weight: 800; line-height: 1.15; margin-bottom: 0.4rem; color: #fff;">
        ${escapeHtml(slide.title || '')}
      </h2>
      <p style="font-size: ${isFullscreen ? '1.15rem' : '0.95rem'}; color: #94a3b8; margin-bottom: 1rem;">
        ${escapeHtml(slide.subtitle || '')}
      </p>
      ${bodyHtml}
    </div>
    <div style="display: flex; justify-content: space-between; border-top: 1px solid rgba(255,255,255,0.08); padding-top: 0.75rem; font-size: 0.72rem; color: #64748b; margin-top: 1rem;">
      <span>${escapeHtml(slide.footerLeft || 'Brand Guidelines Deck')}</span>
      <span>Slide ${activeSlideIndex + 1} of ${brandSlides.length}</span>
    </div>
  `;
}

// Select Slide
function selectSlide(idx) {
  if (idx < 0 || idx >= brandSlides.length) return;
  activeSlideIndex = idx;
  renderThumbnails();

  const stage = document.getElementById('brand-slide-stage');
  if (stage) renderBrandSlide(brandSlides[activeSlideIndex], stage, false);

  const cur = brandSlides[activeSlideIndex];
  if (cur) {
    const inTitle = document.getElementById('inp-edit-title');
    const inKicker = document.getElementById('inp-edit-kicker');
    const inSub = document.getElementById('inp-edit-sub');
    const inContent = document.getElementById('inp-edit-content');

    if (inTitle) inTitle.value = cur.title || '';
    if (inKicker) inKicker.value = cur.kicker || '';
    if (inSub) inSub.value = cur.subtitle || '';

    if (inContent) {
      if (cur.cards) {
        inContent.value = cur.cards.map(c => `${c.title}: ${c.desc}`).join('\n');
      } else if (cur.palette) {
        inContent.value = cur.palette.map(p => `${p.name} | ${p.hex}: ${p.role}`).join('\n');
      } else {
        inContent.value = '';
      }
    }
  }

  if (isPresenting) {
    updateFullscreen();
  }
}

// Sync Editor into Slide
function syncEditorToSlide() {
  const cur = brandSlides[activeSlideIndex];
  if (!cur) return;

  const inTitle = document.getElementById('inp-edit-title');
  const inKicker = document.getElementById('inp-edit-kicker');
  const inSub = document.getElementById('inp-edit-sub');
  const inContent = document.getElementById('inp-edit-content');

  if (inTitle) cur.title = inTitle.value;
  if (inKicker) cur.kicker = inKicker.value;
  if (inSub) cur.subtitle = inSub.value;

  if (inContent) {
    const lines = inContent.value.split('\n').map(l => l.trim()).filter(Boolean);
    if (cur.layout === 'palette') {
      cur.palette = lines.map(line => {
        const parts = line.split(/[:|]/);
        if (parts.length >= 2) {
          return { name: parts[0].trim(), hex: parts[1].trim(), role: parts[2] ? parts[2].trim() : 'Accent' };
        }
        return { name: line, hex: '#8b5cf6', role: 'Accent' };
      });
    } else {
      cur.cards = lines.map(line => {
        if (line.includes(':')) {
          const parts = line.split(':');
          return { title: parts[0].trim(), desc: parts.slice(1).join(':').trim() };
        }
        return { title: line, desc: '' };
      });
    }
  }

  renderThumbnails();
  const stage = document.getElementById('brand-slide-stage');
  if (stage) renderBrandSlide(cur, stage, false);
}

// Fullscreen Presenter Mode
function openFullscreen() {
  const modal = document.getElementById('fs-brand-modal');
  if (!modal) return;
  isPresenting = true;
  modal.classList.add('active');
  updateFullscreen();

  if (document.documentElement.requestFullscreen) {
    document.documentElement.requestFullscreen().catch(() => {});
  }
}

function closeFullscreen() {
  const modal = document.getElementById('fs-brand-modal');
  if (!modal) return;
  isPresenting = false;
  modal.classList.remove('active');

  if (document.fullscreenElement && document.exitFullscreen) {
    document.exitFullscreen().catch(() => {});
  }
}

function updateFullscreen() {
  const target = document.getElementById('fs-slide-content');
  const counter = document.getElementById('fs-slide-num');
  if (!target) return;

  renderBrandSlide(brandSlides[activeSlideIndex], target, true);
  if (counter) counter.textContent = `${activeSlideIndex + 1} / ${brandSlides.length}`;
}

// Slide Management
function addSlide() {
  const newSlide = {
    kicker: 'BRAND STANDARD',
    title: 'Custom Brand Principle',
    subtitle: 'Guideline rules governing visual and verbal expression.',
    layout: 'cards',
    cards: [
      { title: 'Standard Alpha', desc: 'Core execution requirement for this touchpoint.' },
      { title: 'Standard Beta', desc: 'Secondary behavioral guideline.' },
      { title: 'Standard Gamma', desc: 'Measurable visual consistency rule.' }
    ]
  };
  brandSlides.splice(activeSlideIndex + 1, 0, newSlide);
  selectSlide(activeSlideIndex + 1);
}

function duplicateSlide() {
  if (!brandSlides[activeSlideIndex]) return;
  const clone = JSON.parse(JSON.stringify(brandSlides[activeSlideIndex]));
  clone.title += ' (Copy)';
  brandSlides.splice(activeSlideIndex + 1, 0, clone);
  selectSlide(activeSlideIndex + 1);
}

function deleteSlide() {
  if (brandSlides.length <= 1) {
    alert('Brand deck must contain at least 1 slide.');
    return;
  }
  brandSlides.splice(activeSlideIndex, 1);
  if (activeSlideIndex >= brandSlides.length) {
    activeSlideIndex = brandSlides.length - 1;
  }
  selectSlide(activeSlideIndex);
}

function moveSlideUp() {
  if (activeSlideIndex <= 0) return;
  const temp = brandSlides[activeSlideIndex];
  brandSlides[activeSlideIndex] = brandSlides[activeSlideIndex - 1];
  brandSlides[activeSlideIndex - 1] = temp;
  selectSlide(activeSlideIndex - 1);
}

function moveSlideDown() {
  if (activeSlideIndex >= brandSlides.length - 1) return;
  const temp = brandSlides[activeSlideIndex];
  brandSlides[activeSlideIndex] = brandSlides[activeSlideIndex + 1];
  brandSlides[activeSlideIndex + 1] = temp;
  selectSlide(activeSlideIndex + 1);
}

// Exports
function exportStandaloneHtml() {
  const brandTitle = brandSlides[0]?.title || 'Brand Guidelines Deck';
  const slidesJson = JSON.stringify(brandSlides);

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>${escapeHtml(brandTitle)} - Brand Guidelines</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { background: #060911; color: #f8fafc; font-family: -apple-system, sans-serif; display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 100vh; }
    .viewport { width: 95vw; max-width: 1300px; aspect-ratio: 16/9; background: radial-gradient(circle at 85% 15%, rgba(99,102,241,0.18), transparent 50%), radial-gradient(circle at 15% 85%, rgba(139,92,246,0.12), transparent 50%), #0c101c; border-radius: 16px; border: 1px solid rgba(255,255,255,0.12); padding: 3.5rem; display: flex; flex-direction: column; justify-content: space-between; }
    .badge { font-size: 0.75rem; text-transform: uppercase; color: #818cf8; font-weight: 700; margin-bottom: 0.5rem; }
    h1 { font-size: 2.3rem; margin-bottom: 0.4rem; }
    .sub { font-size: 1.1rem; color: #94a3b8; margin-bottom: 1.5rem; }
    .grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 1rem; margin-top: 1rem; }
    .card { background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.1); border-radius: 12px; padding: 1.25rem; }
    .card h3 { font-size: 1.05rem; margin-bottom: 0.4rem; color: #fff; }
    .card p { font-size: 0.85rem; color: #94a3b8; line-height: 1.45; }
    .swatches { display: grid; grid-template-columns: repeat(5, 1fr); gap: 0.75rem; margin-top: 1rem; }
    .swatch { border-radius: 8px; overflow: hidden; border: 1px solid rgba(255,255,255,0.15); background: rgba(255,255,255,0.04); }
    .swatch-color { height: 75px; width: 100%; }
    .swatch-info { padding: 0.5rem; font-size: 0.75rem; }
    .nav { position: fixed; bottom: 1.5rem; display: flex; gap: 1rem; align-items: center; background: rgba(15,23,42,0.9); padding: 0.5rem 1.25rem; border-radius: 9999px; border: 1px solid rgba(255,255,255,0.15); }
    button { background: transparent; border: none; color: #fff; font-weight: 700; cursor: pointer; padding: 0.3rem 0.6rem; }
  </style>
</head>
<body>
  <div class="viewport" id="root"></div>
  <div class="nav">
    <button id="p">&larr; Prev</button>
    <span id="c" style="color: #818cf8; font-weight: 700;"></span>
    <button id="n">Next &rarr;</button>
  </div>
  <script>
    const slides = ${slidesJson};
    let cur = 0;
    function render() {
      const s = slides[cur];
      let b = '';
      if (s.layout === 'palette' && s.palette) {
        b = '<div class="swatches">' + s.palette.map(p => '<div class="swatch"><div class="swatch-color" style="background:' + p.hex + '"></div><div class="swatch-info"><strong>' + p.name + '</strong><div>' + p.hex + '</div><small>' + p.role + '</small></div></div>').join('') + '</div>';
      } else if (s.cards) {
        b = '<div class="grid">' + s.cards.map(c => '<div class="card"><h3>' + c.title + '</h3><p>' + c.desc + '</p></div>').join('') + '</div>';
      }
      document.getElementById('root').innerHTML = '<div><div class="badge">' + s.kicker + '</div><h1>' + s.title + '</h1><p class="sub">' + s.subtitle + '</p>' + b + '</div><div style="display:flex;justify-content:space-between;border-top:1px solid rgba(255,255,255,0.1);padding-top:0.75rem;font-size:0.8rem;color:#64748b;"><span>Brand Guidelines</span><span>Slide ' + (cur+1) + ' of ' + slides.length + '</span></div>';
      document.getElementById('c').textContent = (cur+1) + ' / ' + slides.length;
    }
    document.getElementById('p').onclick = () => { if (cur > 0) { cur--; render(); } };
    document.getElementById('n').onclick = () => { if (cur < slides.length - 1) { cur++; render(); } };
    window.addEventListener('keydown', e => {
      if (e.key === 'ArrowRight' || e.key === ' ') { if (cur < slides.length - 1) { cur++; render(); } }
      if (e.key === 'ArrowLeft') { if (cur > 0) { cur--; render(); } }
    });
    render();
  </script>
</body>
</html>`;

  downloadBlob(html, `${brandTitle.toLowerCase().replace(/[^a-z0-9]/g, '_')}_brand_deck.html`, 'text/html');
}

function exportDeckJson() {
  const jsonStr = JSON.stringify(brandSlides, null, 2);
  downloadBlob(jsonStr, `brand_guidelines_deck.json`, 'application/json');
}

function importDeckJson(file) {
  const reader = new FileReader();
  reader.onload = e => {
    try {
      const data = JSON.parse(e.target.result);
      if (Array.isArray(data) && data.length > 0) {
        brandSlides = data;
        activeSlideIndex = 0;
        renderThumbnails();
        selectSlide(0);
      } else {
        alert('Invalid JSON: Must be an array of slide objects.');
      }
    } catch (err) {
      alert('Failed to parse JSON.');
    }
  };
  reader.readAsText(file);
}

function printBrandPdf() {
  const printTarget = document.getElementById('brand-print-target');
  if (!printTarget) return;

  printTarget.innerHTML = '';
  brandSlides.forEach((slide, idx) => {
    const page = document.createElement('div');
    page.className = 'print-brand-slide';
    renderBrandSlide(slide, page, false);
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
  const promptInput = document.getElementById('inp-brand-prompt');
  const archetypeSelect = document.getElementById('select-brand-archetype');
  const countSelect = document.getElementById('select-slide-count');

  // Load Initial Deck
  brandSlides = generateBrandDeck(
    promptInput ? promptInput.value : 'Lumina',
    archetypeSelect ? archetypeSelect.value : 'Creator / Visionary',
    countSelect ? parseInt(countSelect.value, 10) : 8
  );

  renderThumbnails();
  selectSlide(0);

  // Generate Button
  document.getElementById('btn-generate-brand-deck')?.addEventListener('click', () => {
    const p = promptInput ? promptInput.value.trim() : 'Brand Guidelines';
    const a = archetypeSelect ? archetypeSelect.value : 'Creator / Visionary';
    const c = countSelect ? parseInt(countSelect.value, 10) : 8;
    brandSlides = generateBrandDeck(p, a, c);
    activeSlideIndex = 0;
    renderThumbnails();
    selectSlide(0);
  });

  // Presets
  const presetPills = document.querySelectorAll('.brand-pill');
  presetPills.forEach(pill => {
    pill.addEventListener('click', () => {
      const key = pill.getAttribute('data-preset');
      const preset = BRAND_PRESETS[key];
      if (preset) {
        if (promptInput) promptInput.value = preset.prompt;
        if (archetypeSelect) archetypeSelect.value = preset.archetype;
        brandSlides = generateBrandDeck(preset.prompt, preset.archetype, 8, preset.palette);
        activeSlideIndex = 0;
        renderThumbnails();
        selectSlide(0);
      }
    });
  });

  // Editor Inputs
  ['inp-edit-title', 'inp-edit-kicker', 'inp-edit-sub', 'inp-edit-content'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.addEventListener('input', syncEditorToSlide);
  });

  // Reordering & Management
  document.getElementById('btn-add-slide')?.addEventListener('click', addSlide);
  document.getElementById('btn-slide-up')?.addEventListener('click', moveSlideUp);
  document.getElementById('btn-slide-down')?.addEventListener('click', moveSlideDown);
  document.getElementById('btn-slide-duplicate')?.addEventListener('click', duplicateSlide);
  document.getElementById('btn-slide-delete')?.addEventListener('click', deleteSlide);

  // Fullscreen Presenter
  document.getElementById('btn-present-fullscreen')?.addEventListener('click', openFullscreen);
  document.getElementById('fs-btn-exit')?.addEventListener('click', closeFullscreen);
  document.getElementById('fs-btn-next')?.addEventListener('click', () => {
    if (activeSlideIndex < brandSlides.length - 1) selectSlide(activeSlideIndex + 1);
  });
  document.getElementById('fs-btn-prev')?.addEventListener('click', () => {
    if (activeSlideIndex > 0) selectSlide(activeSlideIndex - 1);
  });

  // Keybindings
  window.addEventListener('keydown', e => {
    if (e.key === 'F5') {
      e.preventDefault();
      openFullscreen();
    } else if (e.key === 'Escape' && isPresenting) {
      closeFullscreen();
    } else if (e.key === 'ArrowRight' || e.key === ' ') {
      if (isPresenting && activeSlideIndex < brandSlides.length - 1) {
        e.preventDefault();
        selectSlide(activeSlideIndex + 1);
      }
    } else if (e.key === 'ArrowLeft') {
      if (isPresenting && activeSlideIndex > 0) {
        e.preventDefault();
        selectSlide(activeSlideIndex - 1);
      }
    }
  });

  // Exports
  document.getElementById('btn-export-html')?.addEventListener('click', exportStandaloneHtml);
  document.getElementById('btn-export-json')?.addEventListener('click', exportDeckJson);
  document.getElementById('btn-export-pdf')?.addEventListener('click', printBrandPdf);

  const importInput = document.getElementById('input-import-json');
  if (importInput) {
    importInput.addEventListener('change', e => {
      if (e.target.files && e.target.files[0]) {
        importDeckJson(e.target.files[0]);
      }
    });
  }
});