/**
 * Dashboard Slides - Executive KPI Slide Presentation Builder
 * Fully client-side interactive slide generator
 */

// Initial Default KPI Cards
const DEFAULT_KPIS = [
  {
    id: 'kpi-1',
    title: 'Annual Recurring Revenue',
    value: '$48.2M',
    change: '+34.2% YoY',
    trend: 'up', // 'up' | 'down' | 'neutral'
    sparkline: 'exponential', // 'exponential' | 'steady' | 'fluctuating' | 'recovery'
    subtext: 'Target: $45.0M (Exceeded by 7.1%)'
  },
  {
    id: 'kpi-2',
    title: 'Net Retention Rate',
    value: '128.5%',
    change: '+4.8% MoM',
    trend: 'up',
    sparkline: 'steady',
    subtext: 'Top Quartile SaaS Benchmark: 115%'
  },
  {
    id: 'kpi-3',
    title: 'Customer Acquisition Cost',
    value: '$1,240',
    change: '-18.5% YoY',
    trend: 'down', // downward CAC is positive in business context
    sparkline: 'recovery',
    subtext: 'Payback Period reduced to 5.2 Months'
  },
  {
    id: 'kpi-4',
    title: 'Gross Margin Ratio',
    value: '83.6%',
    change: '+2.1% QoQ',
    trend: 'up',
    sparkline: 'steady',
    subtext: 'Efficiency driven by infrastructure tuning'
  }
];

// Sparkline Path Generators (Coordinates mapped within 300x40 viewBox)
const SPARKLINE_PATHS = {
  exponential: 'M 0 35 Q 80 34, 150 25 T 240 12 L 300 4',
  steady: 'M 0 32 L 60 28 L 120 22 L 180 18 L 240 12 L 300 6',
  fluctuating: 'M 0 25 L 50 12 L 100 30 L 150 15 L 200 32 L 250 8 L 300 14',
  recovery: 'M 0 15 L 70 32 L 140 36 L 210 20 L 260 10 L 300 5'
};

// Application State
let state = {
  layout: '2x2', // '2x2' | '1plus2' | '3col' | '4col'
  theme: 'theme-dark-glass',
  title: 'Executive Performance & KPI Overview',
  subtitle: 'Q4 FY2026 Board of Directors Briefing • Key operational milestones achieved.',
  tag: 'EXECUTIVE METRICS',
  cards: JSON.parse(JSON.stringify(DEFAULT_KPIS))
};

document.addEventListener('DOMContentLoaded', () => {
  // DOM Elements
  const slideStage = document.getElementById('slide-stage-element');
  const slideGrid = document.getElementById('slide-grid-content');
  const slideTitle = document.getElementById('slide-title-heading');
  const slideSubtitle = document.getElementById('slide-subtitle-heading');
  const slideTagText = document.getElementById('slide-tag-text');
  const kpiConfigList = document.getElementById('kpi-config-list');

  const inpTitle = document.getElementById('inp-dash-title');
  const inpSubtitle = document.getElementById('inp-dash-subtitle');
  const inpTag = document.getElementById('inp-dash-tag');
  const selectTheme = document.getElementById('select-dash-theme');

  const btnAddCard = document.getElementById('btn-add-kpi-card');
  const btnReset = document.getElementById('btn-reset-kpis');
  const btnFullscreen = document.getElementById('btn-fullscreen-mode');
  const btnExportHtml = document.getElementById('btn-export-html');
  const btnExportSvg = document.getElementById('btn-export-svg');
  const btnExportPng = document.getElementById('btn-export-png');

  // Render Left Configuration Accordion/Cards
  function renderConfigList() {
    kpiConfigList.innerHTML = '';
    state.cards.forEach((card, index) => {
      const cardEl = document.createElement('div');
      cardEl.className = 'kpi-config-card';

      cardEl.innerHTML = `
        <div class="kpi-card-head">
          <span class="kpi-card-num-badge">Metric #${index + 1}</span>
          <button class="btn-delete-card" data-index="${index}" style="background: none; border: none; color: var(--error); cursor: pointer; font-size: 0.8rem; font-weight: 600;">Delete</button>
        </div>
        <div style="display: grid; grid-template-columns: 1.5fr 1fr; gap: 0.5rem;">
          <input type="text" class="form-input inp-card-title" data-index="${index}" value="${escapeHtml(card.title)}" placeholder="Metric Title" style="font-size: 0.825rem;">
          <input type="text" class="form-input inp-card-val" data-index="${index}" value="${escapeHtml(card.value)}" placeholder="Value (e.g. $4.2M)" style="font-size: 0.825rem; font-weight: 700;">
        </div>
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 0.5rem;">
          <input type="text" class="form-input inp-card-change" data-index="${index}" value="${escapeHtml(card.change)}" placeholder="+18% MoM" style="font-size: 0.8rem;">
          <select class="form-select sel-card-trend" data-index="${index}" style="font-size: 0.8rem;">
            <option value="up" ${card.trend === 'up' ? 'selected' : ''}>Positive (Green ↑)</option>
            <option value="down" ${card.trend === 'down' ? 'selected' : ''}>Negative (Red ↓)</option>
            <option value="neutral" ${card.trend === 'neutral' ? 'selected' : ''}>Neutral (Slate →)</option>
          </select>
        </div>
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 0.5rem;">
          <select class="form-select sel-card-spark" data-index="${index}" style="font-size: 0.8rem;">
            <option value="exponential" ${card.sparkline === 'exponential' ? 'selected' : ''}>Surge Trend</option>
            <option value="steady" ${card.sparkline === 'steady' ? 'selected' : ''}>Steady Rise</option>
            <option value="fluctuating" ${card.sparkline === 'fluctuating' ? 'selected' : ''}>Fluctuating</option>
            <option value="recovery" ${card.sparkline === 'recovery' ? 'selected' : ''}>V-Recovery</option>
          </select>
          <input type="text" class="form-input inp-card-subtext" data-index="${index}" value="${escapeHtml(card.subtext)}" placeholder="Subtext / Target" style="font-size: 0.8rem;">
        </div>
      `;

      kpiConfigList.appendChild(cardEl);
    });

    // Attach listeners
    kpiConfigList.querySelectorAll('.inp-card-title').forEach(inp => {
      inp.addEventListener('input', (e) => {
        state.cards[e.target.dataset.index].title = e.target.value;
        renderSlideCards();
      });
    });
    kpiConfigList.querySelectorAll('.inp-card-val').forEach(inp => {
      inp.addEventListener('input', (e) => {
        state.cards[e.target.dataset.index].value = e.target.value;
        renderSlideCards();
      });
    });
    kpiConfigList.querySelectorAll('.inp-card-change').forEach(inp => {
      inp.addEventListener('input', (e) => {
        state.cards[e.target.dataset.index].change = e.target.value;
        renderSlideCards();
      });
    });
    kpiConfigList.querySelectorAll('.sel-card-trend').forEach(sel => {
      sel.addEventListener('change', (e) => {
        state.cards[e.target.dataset.index].trend = e.target.value;
        renderSlideCards();
      });
    });
    kpiConfigList.querySelectorAll('.sel-card-spark').forEach(sel => {
      sel.addEventListener('change', (e) => {
        state.cards[e.target.dataset.index].sparkline = e.target.value;
        renderSlideCards();
      });
    });
    kpiConfigList.querySelectorAll('.inp-card-subtext').forEach(inp => {
      inp.addEventListener('input', (e) => {
        state.cards[e.target.dataset.index].subtext = e.target.value;
        renderSlideCards();
      });
    });
    kpiConfigList.querySelectorAll('.btn-delete-card').forEach(btn => {
      btn.addEventListener('click', (e) => {
        if (state.cards.length <= 1) {
          showToast('Keep at least one KPI card.');
          return;
        }
        state.cards.splice(e.target.dataset.index, 1);
        renderConfigList();
        renderSlideCards();
      });
    });
  }

  // Render Sparkline SVG element
  function createSparklineSvg(sparkType, trend) {
    const strokeColor = trend === 'up' ? '#10b981' : (trend === 'down' ? '#ef4444' : '#94a3b8');
    const pathD = SPARKLINE_PATHS[sparkType] || SPARKLINE_PATHS.steady;
    const gradId = `spark-grad-${Math.random().toString(36).substring(2, 9)}`;

    return `
      <svg class="sparkline-svg" viewBox="0 0 300 40" preserveAspectRatio="none">
        <defs>
          <linearGradient id="${gradId}" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stop-color="${strokeColor}" stop-opacity="0.35"/>
            <stop offset="100%" stop-color="${strokeColor}" stop-opacity="0.0"/>
          </linearGradient>
        </defs>
        <!-- Area fill -->
        <path d="${pathD} L 300 40 L 0 40 Z" fill="url(#${gradId})"/>
        <!-- Line stroke -->
        <path d="${pathD}" fill="none" stroke="${strokeColor}" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
        <!-- End dot -->
        <circle cx="300" cy="${getEndCoord(sparkType)}" r="4" fill="${strokeColor}"/>
      </svg>
    `;
  }

  function getEndCoord(type) {
    if (type === 'exponential') return 4;
    if (type === 'steady') return 6;
    if (type === 'recovery') return 5;
    return 14;
  }

  // Render Slide Cards on Canvas
  function renderSlideCards() {
    // Layout class
    slideGrid.className = `slide-grid-container grid-mode-${state.layout}`;
    slideGrid.innerHTML = '';

    state.cards.forEach(card => {
      const itemEl = document.createElement('div');
      itemEl.className = 'slide-card-item';

      let trendClass = 'trend-pos';
      let trendIcon = '↑';
      if (card.trend === 'down') {
        trendClass = 'trend-neg';
        trendIcon = '↓';
      } else if (card.trend === 'neutral') {
        trendClass = 'trend-neutral';
        trendIcon = '→';
      }

      itemEl.innerHTML = `
        <div>
          <div class="slide-card-title">${escapeHtml(card.title)}</div>
          <div class="slide-card-main-val">${escapeHtml(card.value)}</div>
        </div>

        <div>
          <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 0.25rem;">
            <div class="slide-trend-badge ${trendClass}">
              <span>${trendIcon}</span>
              <span>${escapeHtml(card.change)}</span>
            </div>
            <div class="slide-card-subtext">${escapeHtml(card.subtext)}</div>
          </div>

          ${createSparklineSvg(card.sparkline, card.trend)}
        </div>
      `;

      slideGrid.appendChild(itemEl);
    });
  }

  // Apply Theme & Headers
  function applyPresentationMeta() {
    slideTitle.textContent = state.title;
    slideSubtitle.textContent = state.subtitle;
    slideTagText.textContent = state.tag;
    slideStage.className = `slide-viewport-inner ${state.theme}`;
  }

  function escapeHtml(str) {
    return String(str || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  // Toast
  function showToast(msg) {
    let t = document.getElementById('dash-toast');
    if (!t) {
      t = document.createElement('div');
      t.id = 'dash-toast';
      t.style.cssText = `
        position: fixed;
        bottom: 24px;
        right: 24px;
        background: #090d16;
        color: #f8fafc;
        border: 1px solid var(--accent);
        border-radius: var(--radius-md);
        padding: 0.75rem 1.25rem;
        font-size: 0.85rem;
        font-weight: 600;
        box-shadow: 0 10px 30px rgba(0,0,0,0.5);
        z-index: 99999;
        transition: opacity 0.3s ease, transform 0.3s ease;
        opacity: 0;
        transform: translateY(10px);
        pointer-events: none;
      `;
      document.body.appendChild(t);
    }
    t.textContent = msg;
    t.style.opacity = '1';
    t.style.transform = 'translateY(0)';
    setTimeout(() => {
      t.style.opacity = '0';
      t.style.transform = 'translateY(10px)';
    }, 2500);
  }

  // FULLSCREEN PRESENTATION MODE
  function togglePresentationMode() {
    const existing = document.getElementById('fullscreen-presentation-modal');
    if (existing) {
      existing.remove();
      return;
    }

    const overlay = document.createElement('div');
    overlay.id = 'fullscreen-presentation-modal';
    overlay.className = 'fullscreen-overlay';

    const exitBtn = document.createElement('button');
    exitBtn.className = 'fullscreen-exit-btn';
    exitBtn.textContent = '✕ Exit Presentation (Esc)';
    exitBtn.addEventListener('click', () => overlay.remove());

    const wrapper = document.createElement('div');
    wrapper.className = 'slide-viewport-outer';
    wrapper.style.boxShadow = '0 30px 80px rgba(0,0,0,0.8)';
    
    // Clone live stage
    const clone = slideStage.cloneNode(true);
    wrapper.appendChild(clone);

    overlay.appendChild(exitBtn);
    overlay.appendChild(wrapper);
    document.body.appendChild(overlay);

    // Keyboard support
    const keyHandler = (e) => {
      if (e.key === 'Escape') {
        overlay.remove();
        document.removeEventListener('keydown', keyHandler);
      }
    };
    document.addEventListener('keydown', keyHandler);
  }

  // EXPORT AS STANDALONE RESPONSIVE HTML SLIDE
  function exportHtmlSlide() {
    const htmlMarkup = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeHtml(state.title)}</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=Inter:wght@400;600;700;800&display=swap" rel="stylesheet">
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      background: #000;
      color: #fff;
      font-family: 'Inter', sans-serif;
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
      padding: 1.5rem;
    }
    .slide-wrapper {
      position: relative;
      width: 100%;
      max-width: 1400px;
      padding-top: 56.25%; /* 16:9 ratio */
      border-radius: 16px;
      overflow: hidden;
      box-shadow: 0 25px 60px rgba(0,0,0,0.6);
    }
    .slide-content {
      position: absolute;
      inset: 0;
      padding: 5% 6%;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
    }
    ${document.querySelector('style').textContent}
  </style>
</head>
<body>
  <div class="slide-wrapper">
    <div class="slide-content ${state.theme}">
      ${slideStage.innerHTML}
    </div>
  </div>
</body>
</html>`;

    const blob = new Blob([htmlMarkup], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `kpi-dashboard-slide.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showToast('Exported Standalone HTML Slide!');
  }

  // EXPORT AS FULL 1920x1080 SVG SLIDE
  function exportSvgSlide() {
    const W = 1920;
    const H = 1080;
    const isDark = state.theme !== 'theme-clean-light';
    const bg = isDark ? '#090d16' : '#ffffff';
    const textCol = isDark ? '#f8fafc' : '#0f172a';
    const cardBg = isDark ? 'rgba(255, 255, 255, 0.04)' : '#f8fafc';
    const cardStroke = isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)';

    let svg = `<svg viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <filter id="shadow" x="-10%" y="-10%" width="120%" height="120%">
          <feDropShadow dx="0" dy="12" stdDeviation="16" flood-color="rgba(0,0,0,0.3)"/>
        </filter>
      </defs>
      <rect width="${W}" height="${H}" fill="${bg}"/>
      <g transform="translate(100, 100)">
        <rect width="180" height="34" rx="17" fill="${cardBg}" stroke="${cardStroke}"/>
        <text x="24" y="22" font-family="Inter, sans-serif" font-size="13" font-weight="700" fill="${textCol}" letter-spacing="1">${escapeHtml(state.tag)}</text>
        <text x="0" y="85" font-family="'Instrument Serif', serif" font-size="52" font-weight="700" fill="${textCol}">${escapeHtml(state.title)}</text>
        <text x="0" y="125" font-family="Inter, sans-serif" font-size="20" fill="${textCol}" opacity="0.75">${escapeHtml(state.subtitle)}</text>
      </g>
    `;

    // Coordinates for grid
    const startY = 270;
    const startX = 100;
    const gridW = 1720;
    const gridH = 680;

    if (state.layout === '2x2' || state.cards.length <= 4) {
      const cardW = (gridW - 40) / 2;
      const cardH = (gridH - 40) / 2;
      state.cards.slice(0, 4).forEach((c, idx) => {
        const col = idx % 2;
        const row = Math.floor(idx / 2);
        const cx = startX + col * (cardW + 40);
        const cy = startY + row * (cardH + 40);
        const strokeColor = c.trend === 'up' ? '#10b981' : (c.trend === 'down' ? '#ef4444' : '#94a3b8');

        svg += `
          <g transform="translate(${cx}, ${cy})">
            <rect width="${cardW}" height="${cardH}" rx="18" fill="${cardBg}" stroke="${cardStroke}" stroke-width="1.5"/>
            <text x="40" y="60" font-family="Inter, sans-serif" font-size="16" font-weight="700" fill="${textCol}" opacity="0.7" letter-spacing="1">${escapeHtml(c.title).toUpperCase()}</text>
            <text x="40" y="130" font-family="'Instrument Serif', serif" font-size="64" font-weight="700" fill="${textCol}">${escapeHtml(c.value)}</text>
            <text x="40" y="180" font-family="Inter, sans-serif" font-size="18" font-weight="700" fill="${strokeColor}">${escapeHtml(c.change)}</text>
            <text x="180" y="180" font-family="Inter, sans-serif" font-size="16" fill="${textCol}" opacity="0.65">${escapeHtml(c.subtext)}</text>
          </g>
        `;
      });
    }

    svg += `
      <line x1="100" y1="990" x2="${W - 100}" y2="990" stroke="${cardStroke}" stroke-width="1.5"/>
      <text x="100" y="1025" font-family="Inter, sans-serif" font-size="16" fill="${textCol}" opacity="0.6">EXECUTIVE KPI DASHBOARD SLIDE</text>
      <text x="${W - 100}" y="1025" text-anchor="end" font-family="Inter, sans-serif" font-size="16" fill="${textCol}" opacity="0.6">CONFIDENTIAL</text>
    </svg>`;

    const blob = new Blob([svg], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `executive-dashboard-slide.svg`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showToast('Downloaded SVG Slide!');
  }

  // EXPORT AS HIGH RESOLUTION PNG SLIDE
  function exportPngSlide() {
    showToast('Rendering high-resolution 1080p slide PNG...');
    // We rasterize the SVG export to canvas
    const W = 1920;
    const H = 1080;
    const isDark = state.theme !== 'theme-clean-light';
    const bg = isDark ? '#090d16' : '#ffffff';
    const textCol = isDark ? '#f8fafc' : '#0f172a';
    const cardBg = isDark ? 'rgba(255, 255, 255, 0.04)' : '#f8fafc';
    const cardStroke = isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)';

    let svg = `<svg viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" xmlns="http://www.w3.org/2000/svg">
      <rect width="${W}" height="${H}" fill="${bg}"/>
      <g transform="translate(100, 100)">
        <rect width="180" height="34" rx="17" fill="${cardBg}" stroke="${cardStroke}"/>
        <text x="24" y="22" font-family="sans-serif" font-size="13" font-weight="700" fill="${textCol}" letter-spacing="1">${escapeHtml(state.tag)}</text>
        <text x="0" y="85" font-family="serif" font-size="52" font-weight="700" fill="${textCol}">${escapeHtml(state.title)}</text>
        <text x="0" y="125" font-family="sans-serif" font-size="20" fill="${textCol}" opacity="0.75">${escapeHtml(state.subtitle)}</text>
      </g>
    `;

    const startY = 270;
    const startX = 100;
    const gridW = 1720;
    const gridH = 680;
    const cardW = (gridW - 40) / 2;
    const cardH = (gridH - 40) / 2;

    state.cards.slice(0, 4).forEach((c, idx) => {
      const col = idx % 2;
      const row = Math.floor(idx / 2);
      const cx = startX + col * (cardW + 40);
      const cy = startY + row * (cardH + 40);
      const strokeColor = c.trend === 'up' ? '#10b981' : (c.trend === 'down' ? '#ef4444' : '#94a3b8');

      svg += `
        <g transform="translate(${cx}, ${cy})">
          <rect width="${cardW}" height="${cardH}" rx="18" fill="${cardBg}" stroke="${cardStroke}" stroke-width="1.5"/>
          <text x="40" y="60" font-family="sans-serif" font-size="16" font-weight="700" fill="${textCol}" opacity="0.7">${escapeHtml(c.title).toUpperCase()}</text>
          <text x="40" y="130" font-family="serif" font-size="64" font-weight="700" fill="${textCol}">${escapeHtml(c.value)}</text>
          <text x="40" y="180" font-family="sans-serif" font-size="18" font-weight="700" fill="${strokeColor}">${escapeHtml(c.change)}</text>
          <text x="180" y="180" font-family="sans-serif" font-size="16" fill="${textCol}" opacity="0.65">${escapeHtml(c.subtext)}</text>
        </g>
      `;
    });

    svg += `
      <line x1="100" y1="990" x2="${W - 100}" y2="990" stroke="${cardStroke}" stroke-width="1.5"/>
      <text x="100" y="1025" font-family="sans-serif" font-size="16" fill="${textCol}" opacity="0.6">EXECUTIVE KPI DASHBOARD SLIDE</text>
    </svg>`;

    const blob = new Blob([svg], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = W;
      canvas.height = H;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0, W, H);
      URL.revokeObjectURL(url);

      canvas.toBlob((pngBlob) => {
        if (!pngBlob) return;
        const pngUrl = URL.createObjectURL(pngBlob);
        const a = document.createElement('a');
        a.href = pngUrl;
        a.download = `kpi-dashboard-slide.png`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(pngUrl);
        showToast('Presentation slide PNG exported (1920x1080)!');
      }, 'image/png');
    };
    img.src = url;
  }

  // Event Listeners
  inpTitle.addEventListener('input', (e) => {
    state.title = e.target.value;
    applyPresentationMeta();
  });
  inpSubtitle.addEventListener('input', (e) => {
    state.subtitle = e.target.value;
    applyPresentationMeta();
  });
  inpTag.addEventListener('input', (e) => {
    state.tag = e.target.value;
    applyPresentationMeta();
  });
  selectTheme.addEventListener('change', (e) => {
    state.theme = e.target.value;
    applyPresentationMeta();
  });

  // Layout Buttons
  document.querySelectorAll('.layout-picker-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.layout-picker-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      state.layout = btn.dataset.layout;
      renderSlideCards();
    });
  });

  // Add KPI Card
  btnAddCard.addEventListener('click', () => {
    state.cards.push({
      id: `kpi-${Date.now()}`,
      title: `Metric #${state.cards.length + 1}`,
      value: '99.9%',
      change: '+5.4% MoM',
      trend: 'up',
      sparkline: 'steady',
      subtext: 'Target on track'
    });
    renderConfigList();
    renderSlideCards();
  });

  // Reset Default
  btnReset.addEventListener('click', () => {
    state.cards = JSON.parse(JSON.stringify(DEFAULT_KPIS));
    renderConfigList();
    renderSlideCards();
    showToast('Reset to default executive KPIs.');
  });

  // Presentation & Exports
  btnFullscreen.addEventListener('click', togglePresentationMode);
  btnExportHtml.addEventListener('click', exportHtmlSlide);
  btnExportSvg.addEventListener('click', exportSvgSlide);
  btnExportPng.addEventListener('click', exportPngSlide);

  // Initial Load
  applyPresentationMeta();
  renderConfigList();
  renderSlideCards();
});