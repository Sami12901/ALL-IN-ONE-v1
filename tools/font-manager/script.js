/**
 * Font Manager - Presentation Typography & Pairing Studio
 * Fully client-side interactive typography workbench
 */

// 44 Curated Google Fonts optimized for presentations & decks
const GOOGLE_FONTS_CATALOG = [
  // Sans-Serif
  { name: 'Inter', category: 'sans-serif', weights: [300, 400, 500, 600, 700], fallback: 'sans-serif' },
  { name: 'Plus Jakarta Sans', category: 'sans-serif', weights: [400, 500, 600, 700, 800], fallback: 'sans-serif' },
  { name: 'Space Grotesk', category: 'sans-serif', weights: [400, 500, 600, 700], fallback: 'sans-serif' },
  { name: 'Montserrat', category: 'sans-serif', weights: [400, 500, 600, 700, 800], fallback: 'sans-serif' },
  { name: 'Poppins', category: 'sans-serif', weights: [300, 400, 500, 600, 700], fallback: 'sans-serif' },
  { name: 'DM Sans', category: 'sans-serif', weights: [400, 500, 700], fallback: 'sans-serif' },
  { name: 'Outfit', category: 'sans-serif', weights: [400, 500, 600, 700, 800], fallback: 'sans-serif' },
  { name: 'Roboto', category: 'sans-serif', weights: [300, 400, 500, 700], fallback: 'sans-serif' },
  { name: 'Raleway', category: 'sans-serif', weights: [400, 600, 700, 800], fallback: 'sans-serif' },
  { name: 'Manrope', category: 'sans-serif', weights: [400, 500, 600, 700], fallback: 'sans-serif' },
  { name: 'Work Sans', category: 'sans-serif', weights: [400, 500, 600, 700], fallback: 'sans-serif' },
  { name: 'Nunito', category: 'sans-serif', weights: [400, 600, 700], fallback: 'sans-serif' },
  { name: 'Rubik', category: 'sans-serif', weights: [400, 500, 600, 700], fallback: 'sans-serif' },
  { name: 'Lato', category: 'sans-serif', weights: [400, 700], fallback: 'sans-serif' },
  { name: 'Open Sans', category: 'sans-serif', weights: [400, 600, 700], fallback: 'sans-serif' },
  { name: 'Cabin', category: 'sans-serif', weights: [400, 600, 700], fallback: 'sans-serif' },

  // Serif
  { name: 'Playfair Display', category: 'serif', weights: [400, 600, 700, 800], fallback: 'serif' },
  { name: 'Instrument Serif', category: 'serif', weights: [400], fallback: 'serif' },
  { name: 'Lora', category: 'serif', weights: [400, 500, 600, 700], fallback: 'serif' },
  { name: 'Merriweather', category: 'serif', weights: [300, 400, 700], fallback: 'serif' },
  { name: 'Cinzel', category: 'serif', weights: [400, 600, 700], fallback: 'serif' },
  { name: 'Cormorant Garamond', category: 'serif', weights: [400, 600, 700], fallback: 'serif' },
  { name: 'Bodoni Moda', category: 'serif', weights: [400, 600, 700, 800], fallback: 'serif' },
  { name: 'EB Garamond', category: 'serif', weights: [400, 600, 700], fallback: 'serif' },
  { name: 'Libre Baskerville', category: 'serif', weights: [400, 700], fallback: 'serif' },
  { name: 'Prata', category: 'serif', weights: [400], fallback: 'serif' },
  { name: 'Spectral', category: 'serif', weights: [400, 600, 700], fallback: 'serif' },
  { name: 'Source Serif 4', category: 'serif', weights: [400, 600, 700], fallback: 'serif' },
  { name: 'Newsreader', category: 'serif', weights: [400, 600, 700], fallback: 'serif' },
  { name: 'Bitter', category: 'serif', weights: [400, 600, 700], fallback: 'serif' },

  // Display / Modern Headline
  { name: 'Syne', category: 'display', weights: [600, 700, 800], fallback: 'sans-serif' },
  { name: 'Oswald', category: 'display', weights: [500, 600, 700], fallback: 'sans-serif' },
  { name: 'Bebas Neue', category: 'display', weights: [400], fallback: 'sans-serif' },
  { name: 'Abril Fatface', category: 'display', weights: [400], fallback: 'serif' },
  { name: 'Anton', category: 'display', weights: [400], fallback: 'sans-serif' },
  { name: 'Righteous', category: 'display', weights: [400], fallback: 'sans-serif' },
  { name: 'Cinzel Decorative', category: 'display', weights: [700], fallback: 'serif' },
  { name: 'Archivo Black', category: 'display', weights: [400], fallback: 'sans-serif' },
  { name: 'Syncopate', category: 'display', weights: [700], fallback: 'sans-serif' },

  // Monospace
  { name: 'Space Mono', category: 'monospace', weights: [400, 700], fallback: 'monospace' },
  { name: 'JetBrains Mono', category: 'monospace', weights: [400, 500, 700], fallback: 'monospace' },
  { name: 'Fira Code', category: 'monospace', weights: [400, 600], fallback: 'monospace' },
  { name: 'Source Code Pro', category: 'monospace', weights: [400, 600, 700], fallback: 'monospace' },
  { name: 'IBM Plex Mono', category: 'monospace', weights: [400, 600], fallback: 'monospace' }
];

// Curated Pairing Presets
const CURATED_PAIRINGS = [
  { name: 'Editorial Luxury', heading: 'Playfair Display', body: 'Plus Jakarta Sans', headingWeight: '700', bodyWeight: '400', theme: 'slide-theme-gold' },
  { name: 'Clean Tech', heading: 'Space Grotesk', body: 'Inter', headingWeight: '700', bodyWeight: '400', theme: 'slide-theme-dark-glass' },
  { name: 'Modern Bold', heading: 'Syne', body: 'DM Sans', headingWeight: '800', bodyWeight: '400', theme: 'slide-theme-amethyst' },
  { name: 'Classic Serif', heading: 'Cinzel', body: 'Lora', headingWeight: '700', bodyWeight: '400', theme: 'slide-theme-gold' },
  { name: 'Executive Minimal', heading: 'Outfit', body: 'Roboto', headingWeight: '700', bodyWeight: '400', theme: 'slide-theme-dark-glass' },
  { name: 'Creative Studio', heading: 'Instrument Serif', body: 'Montserrat', headingWeight: '400', bodyWeight: '400', theme: 'slide-theme-light' },
  { name: 'High-Impact Pitch', heading: 'Oswald', body: 'Open Sans', headingWeight: '700', bodyWeight: '400', theme: 'slide-theme-dark-glass' },
  { name: 'Architectural Tech', heading: 'Space Mono', body: 'Inter', headingWeight: '700', bodyWeight: '400', theme: 'slide-theme-emerald' },
  { name: 'Modern Swiss', heading: 'Poppins', body: 'Work Sans', headingWeight: '700', bodyWeight: '400', theme: 'slide-theme-light' },
  { name: 'Avant-Garde Vogue', heading: 'Bodoni Moda', body: 'Montserrat', headingWeight: '700', bodyWeight: '400', theme: 'slide-theme-gold' },
  { name: 'Warm Narrative', heading: 'Libre Baskerville', body: 'Nunito', headingWeight: '700', bodyWeight: '400', theme: 'slide-theme-light' },
  { name: 'Futuristic Cyber', heading: 'Syncopate', body: 'JetBrains Mono', headingWeight: '700', bodyWeight: '400', theme: 'slide-theme-dark-glass' }
];

// Cache of loaded font stylesheets
const loadedFonts = new Set();

function loadGoogleFont(fontName) {
  if (!fontName || loadedFonts.has(fontName)) return;
  const fontObj = GOOGLE_FONTS_CATALOG.find(f => f.name === fontName);
  const weightsParam = fontObj && fontObj.weights ? ':wght@' + fontObj.weights.join(';') : '';
  const formattedName = fontName.replace(/ /g, '+');
  const link = document.createElement('link');
  link.rel = 'stylesheet';
  link.href = `https://fonts.googleapis.com/css2?family=${formattedName}${weightsParam}&display=swap`;
  document.head.appendChild(link);
  loadedFonts.add(fontName);
}

// Ensure initial top fonts load
['Playfair Display', 'Plus Jakarta Sans', 'Inter', 'Space Grotesk', 'Syne', 'DM Sans', 'Cinzel', 'Lora'].forEach(loadGoogleFont);

// State
let state = {
  headingFont: 'Playfair Display',
  headingSize: 42,
  headingWeight: '700',
  bodyFont: 'Plus Jakarta Sans',
  bodySize: 16,
  bodyWeight: '400',
  lineHeight: 1.4,
  letterSpacing: -0.5,
  alignment: 'left',
  theme: 'slide-theme-dark-glass',
  activeCategory: 'all',
  searchQuery: ''
};

// DOM References
document.addEventListener('DOMContentLoaded', () => {
  const selectHeadingFont = document.getElementById('select-heading-font');
  const selectBodyFont = document.getElementById('select-body-font');
  const rangeHeadingSize = document.getElementById('range-heading-size');
  const valHeadingSize = document.getElementById('val-heading-size');
  const selectHeadingWeight = document.getElementById('select-heading-weight');
  const rangeBodySize = document.getElementById('range-body-size');
  const valBodySize = document.getElementById('val-body-size');
  const selectBodyWeight = document.getElementById('select-body-weight');
  const rangeLineHeight = document.getElementById('range-line-height');
  const valLineHeight = document.getElementById('val-line-height');
  const rangeLetterSpacing = document.getElementById('range-letter-spacing');
  const valLetterSpacing = document.getElementById('val-letter-spacing');
  const selectSlideTheme = document.getElementById('select-slide-theme');
  const slideStage = document.getElementById('slide-stage');
  const slideHeading = document.getElementById('slide-heading');
  const slideBody = document.getElementById('slide-body');
  const slidePoints = document.getElementById('slide-points');
  const badgeHeading = document.getElementById('badge-heading-name');
  const badgeBody = document.getElementById('badge-body-name');

  const pairingPresetsContainer = document.getElementById('pairing-presets-list');
  const catalogGrid = document.getElementById('catalog-font-grid');
  const catalogSearch = document.getElementById('catalog-search');
  const catalogSampleText = document.getElementById('catalog-sample-text');
  const categoryFilterChips = document.getElementById('category-filter-chips');

  const btnShuffle = document.getElementById('btn-shuffle-pairing');
  const btnResetText = document.getElementById('btn-reset-text');
  const btnCopyCss = document.getElementById('btn-copy-css');
  const btnViewEmbed = document.getElementById('btn-view-embed-code');
  const embedModal = document.getElementById('embed-code-modal');
  const btnCloseModal = document.getElementById('btn-close-modal');

  const btnAlignLeft = document.getElementById('btn-align-left');
  const btnAlignCenter = document.getElementById('btn-align-center');
  const btnAlignRight = document.getElementById('btn-align-right');

  // Populate Select dropdowns with all 44 Google Fonts
  function populateFontSelects() {
    const sortedFonts = [...GOOGLE_FONTS_CATALOG].sort((a, b) => a.name.localeCompare(b.name));
    
    selectHeadingFont.innerHTML = '';
    selectBodyFont.innerHTML = '';

    sortedFonts.forEach(font => {
      const optHeading = document.createElement('option');
      optHeading.value = font.name;
      optHeading.textContent = `${font.name} (${font.category})`;
      if (font.name === state.headingFont) optHeading.selected = true;
      selectHeadingFont.appendChild(optHeading);

      const optBody = document.createElement('option');
      optBody.value = font.name;
      optBody.textContent = `${font.name} (${font.category})`;
      if (font.name === state.bodyFont) optBody.selected = true;
      selectBodyFont.appendChild(optBody);
    });
  }

  // Render Curated Pairing Chips
  function renderPairingChips() {
    pairingPresetsContainer.innerHTML = '';
    CURATED_PAIRINGS.forEach((pairing, idx) => {
      const chip = document.createElement('button');
      chip.className = `preset-chip ${idx === 0 ? 'active' : ''}`;
      chip.textContent = pairing.name;
      chip.addEventListener('click', () => {
        applyPairing(pairing);
        document.querySelectorAll('#pairing-presets-list .preset-chip').forEach(c => c.classList.remove('active'));
        chip.classList.add('active');
      });
      pairingPresetsContainer.appendChild(chip);
    });
  }

  // Apply a specific pairing
  function applyPairing(pairing) {
    state.headingFont = pairing.heading;
    state.bodyFont = pairing.body;
    state.headingWeight = pairing.headingWeight || '700';
    state.bodyWeight = pairing.bodyWeight || '400';
    if (pairing.theme) {
      state.theme = pairing.theme;
      selectSlideTheme.value = pairing.theme;
    }

    selectHeadingFont.value = state.headingFont;
    selectBodyFont.value = state.bodyFont;
    selectHeadingWeight.value = state.headingWeight;
    selectBodyWeight.value = state.bodyWeight;

    loadGoogleFont(state.headingFont);
    loadGoogleFont(state.bodyFont);
    applyStateToStage();
  }

  // Apply all current state parameters to the slide stage mockup
  function applyStateToStage() {
    loadGoogleFont(state.headingFont);
    loadGoogleFont(state.bodyFont);

    // Apply font to heading
    slideHeading.style.fontFamily = `"${state.headingFont}", sans-serif`;
    slideHeading.style.fontSize = `${state.headingSize}px`;
    slideHeading.style.fontWeight = state.headingWeight;
    slideHeading.style.letterSpacing = `${state.letterSpacing}px`;

    // Apply font to body
    slideBody.style.fontFamily = `"${state.bodyFont}", sans-serif`;
    slideBody.style.fontSize = `${state.bodySize}px`;
    slideBody.style.fontWeight = state.bodyWeight;
    slideBody.style.lineHeight = state.lineHeight;

    // Apply font to points grid & cards
    slidePoints.style.fontFamily = `"${state.bodyFont}", sans-serif`;

    // Theme
    slideStage.className = `slide-stage-content ${state.theme}`;

    // Alignment
    slideStage.style.textAlign = state.alignment;
    if (state.alignment === 'center') {
      slideBody.style.margin = '0 auto';
      slidePoints.style.justifyContent = 'center';
    } else if (state.alignment === 'right') {
      slideBody.style.marginLeft = 'auto';
      slideBody.style.marginRight = '0';
    } else {
      slideBody.style.margin = '0';
    }

    // Badges update
    badgeHeading.textContent = state.headingFont;
    badgeBody.textContent = state.bodyFont;

    // Update modal code previews if opened
    updateModalCode();
  }

  // Update alignment buttons state
  function updateAlignButtons(active) {
    [btnAlignLeft, btnAlignCenter, btnAlignRight].forEach(b => b.classList.remove('btn-primary'));
    [btnAlignLeft, btnAlignCenter, btnAlignRight].forEach(b => b.classList.add('btn-secondary'));
    if (active === 'left') {
      btnAlignLeft.classList.add('btn-primary');
      btnAlignLeft.classList.remove('btn-secondary');
    } else if (active === 'center') {
      btnAlignCenter.classList.add('btn-primary');
      btnAlignCenter.classList.remove('btn-secondary');
    } else if (active === 'right') {
      btnAlignRight.classList.add('btn-primary');
      btnAlignRight.classList.remove('btn-secondary');
    }
  }

  // Render Google Fonts Catalog
  function renderCatalog() {
    const query = state.searchQuery.toLowerCase().trim();
    const cat = state.activeCategory;
    const sample = catalogSampleText.value.trim() || 'Executive Leadership & Strategic Growth';

    const filtered = GOOGLE_FONTS_CATALOG.filter(font => {
      const matchCat = cat === 'all' || font.category === cat;
      const matchQuery = font.name.toLowerCase().includes(query) || font.category.toLowerCase().includes(query);
      return matchCat && matchQuery;
    });

    catalogGrid.innerHTML = '';
    if (filtered.length === 0) {
      catalogGrid.innerHTML = `<div style="grid-column: 1 / -1; text-align: center; padding: 2rem; color: var(--text-secondary);">No fonts match "${state.searchQuery}". Try a different keyword.</div>`;
      return;
    }

    filtered.forEach(font => {
      loadGoogleFont(font.name);

      const card = document.createElement('div');
      card.className = 'catalog-card';

      card.innerHTML = `
        <div>
          <div class="catalog-header">
            <span class="catalog-font-name">${font.name}</span>
            <span class="catalog-font-cat">${font.category}</span>
          </div>
          <div class="catalog-preview-text" style="font-family: '${font.name}', ${font.fallback}; font-weight: 500; margin-top: 0.75rem;">
            ${escapeHtml(sample)}
          </div>
        </div>
        <div class="catalog-actions">
          <button class="catalog-btn apply-heading-btn" data-font="${font.name}">Set as Title</button>
          <button class="catalog-btn apply-body-btn" data-font="${font.name}">Set as Body</button>
        </div>
      `;

      card.querySelector('.apply-heading-btn').addEventListener('click', () => {
        state.headingFont = font.name;
        selectHeadingFont.value = font.name;
        applyStateToStage();
        showToast(`Set ${font.name} as Headline Font`);
      });

      card.querySelector('.apply-body-btn').addEventListener('click', () => {
        state.bodyFont = font.name;
        selectBodyFont.value = font.name;
        applyStateToStage();
        showToast(`Set ${font.name} as Body Font`);
      });

      catalogGrid.appendChild(card);
    });
  }

  // Utility to escape HTML
  function escapeHtml(str) {
    return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  // Toast notification helper
  function showToast(message) {
    let toast = document.getElementById('font-studio-toast');
    if (!toast) {
      toast = document.createElement('div');
      toast.id = 'font-studio-toast';
      toast.style.cssText = `
        position: fixed;
        bottom: 24px;
        right: 24px;
        background: #0f172a;
        color: #f8fafc;
        border: 1px solid var(--accent);
        border-radius: var(--radius-md);
        padding: 0.75rem 1.25rem;
        font-size: 0.85rem;
        font-weight: 600;
        box-shadow: 0 10px 25px rgba(0,0,0,0.4);
        z-index: 9999;
        transition: opacity 0.3s ease, transform 0.3s ease;
        opacity: 0;
        transform: translateY(10px);
        pointer-events: none;
      `;
      document.body.appendChild(toast);
    }
    toast.textContent = message;
    toast.style.opacity = '1';
    toast.style.transform = 'translateY(0)';
    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(10px)';
    }, 2400);
  }

  // Copy helper
  function copyTextToClipboard(text, successMsg) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(() => showToast(successMsg)).catch(() => fallbackCopy(text, successMsg));
    } else {
      fallbackCopy(text, successMsg);
    }
  }

  function fallbackCopy(text, successMsg) {
    const ta = document.createElement('textarea');
    ta.value = text;
    ta.style.position = 'fixed';
    ta.style.opacity = '0';
    document.body.appendChild(ta);
    ta.select();
    try {
      document.execCommand('copy');
      showToast(successMsg);
    } catch {
      showToast('Copy failed, please copy manually.');
    }
    document.body.removeChild(ta);
  }

  // Generate Embed Codes
  function getEmbedCodes() {
    const hName = state.headingFont.replace(/ /g, '+');
    const bName = state.bodyFont.replace(/ /g, '+');
    const same = state.headingFont === state.bodyFont;

    const query = same
      ? `family=${hName}:wght@300;400;500;600;700;800`
      : `family=${hName}:wght@400;600;700;800&family=${bName}:wght@300;400;500;600;700`;

    const linkCode = `<!-- Google Fonts Embed Code -->
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?${query}&display=swap" rel="stylesheet">`;

    const importCode = `/* Google Fonts @import */
@import url('https://fonts.googleapis.com/css2?${query}&display=swap');`;

    const cssRules = `/* Presentation Slide Typography Styles */
.slide-title {
  font-family: '${state.headingFont}', sans-serif;
  font-size: ${state.headingSize}px;
  font-weight: ${state.headingWeight};
  letter-spacing: ${state.letterSpacing}px;
  text-align: ${state.alignment};
}

.slide-body, .slide-content {
  font-family: '${state.bodyFont}', sans-serif;
  font-size: ${state.bodySize}px;
  font-weight: ${state.bodyWeight};
  line-height: ${state.lineHeight};
  text-align: ${state.alignment};
}`;

    return { linkCode, importCode, cssRules };
  }

  function updateModalCode() {
    const { linkCode, importCode, cssRules } = getEmbedCodes();
    const modalHtml = document.getElementById('modal-html-code');
    const modalImport = document.getElementById('modal-import-code');
    const modalRules = document.getElementById('modal-rules-code');
    if (modalHtml) modalHtml.textContent = linkCode;
    if (modalImport) modalImport.textContent = importCode;
    if (modalRules) modalRules.textContent = cssRules;
  }

  // Event Listeners for Controls
  selectHeadingFont.addEventListener('change', (e) => {
    state.headingFont = e.target.value;
    applyStateToStage();
  });

  selectBodyFont.addEventListener('change', (e) => {
    state.bodyFont = e.target.value;
    applyStateToStage();
  });

  rangeHeadingSize.addEventListener('input', (e) => {
    state.headingSize = parseInt(e.target.value, 10);
    valHeadingSize.textContent = state.headingSize;
    applyStateToStage();
  });

  selectHeadingWeight.addEventListener('change', (e) => {
    state.headingWeight = e.target.value;
    applyStateToStage();
  });

  rangeBodySize.addEventListener('input', (e) => {
    state.bodySize = parseInt(e.target.value, 10);
    valBodySize.textContent = state.bodySize;
    applyStateToStage();
  });

  selectBodyWeight.addEventListener('change', (e) => {
    state.bodyWeight = e.target.value;
    applyStateToStage();
  });

  rangeLineHeight.addEventListener('input', (e) => {
    state.lineHeight = parseFloat(e.target.value);
    valLineHeight.textContent = state.lineHeight.toFixed(2);
    applyStateToStage();
  });

  rangeLetterSpacing.addEventListener('input', (e) => {
    state.letterSpacing = parseFloat(e.target.value);
    valLetterSpacing.textContent = state.letterSpacing;
    applyStateToStage();
  });

  selectSlideTheme.addEventListener('change', (e) => {
    state.theme = e.target.value;
    applyStateToStage();
  });

  // Alignment buttons
  btnAlignLeft.addEventListener('click', () => {
    state.alignment = 'left';
    updateAlignButtons('left');
    applyStateToStage();
  });
  btnAlignCenter.addEventListener('click', () => {
    state.alignment = 'center';
    updateAlignButtons('center');
    applyStateToStage();
  });
  btnAlignRight.addEventListener('click', () => {
    state.alignment = 'right';
    updateAlignButtons('right');
    applyStateToStage();
  });

  // Shuffle Pairing
  btnShuffle.addEventListener('click', () => {
    const randomPairing = CURATED_PAIRINGS[Math.floor(Math.random() * CURATED_PAIRINGS.length)];
    applyPairing(randomPairing);
    showToast(`Applied ${randomPairing.name} pairing!`);
  });

  // Reset Copy
  btnResetText.addEventListener('click', () => {
    document.getElementById('slide-category').textContent = 'Q4 STRATEGY BRIEFING';
    slideHeading.textContent = 'Architecting The Future of High-Growth Digital Scale';
    slideBody.textContent = 'Leveraging high-performance infrastructure and deliberate typography to captivate enterprise stakeholders, reinforce brand authority, and accelerate strategic alignment.';
    document.getElementById('slide-author').textContent = 'CONFIDENTIAL // PRESENTED BY SAIFUL ISLAM';
    document.getElementById('slide-page').textContent = 'SLIDE 04 OF 28';
    showToast('Slide copy reset to default briefing.');
  });

  // Copy CSS quick button
  btnCopyCss.addEventListener('click', () => {
    const { cssRules } = getEmbedCodes();
    copyTextToClipboard(cssRules, 'CSS Typography rules copied to clipboard!');
  });

  // Modal open / close
  btnViewEmbed.addEventListener('click', () => {
    updateModalCode();
    embedModal.style.display = 'flex';
  });

  btnCloseModal.addEventListener('click', () => {
    embedModal.style.display = 'none';
  });

  embedModal.addEventListener('click', (e) => {
    if (e.target === embedModal) embedModal.style.display = 'none';
  });

  // Modal copy buttons
  document.getElementById('btn-copy-modal-html').addEventListener('click', () => {
    copyTextToClipboard(getEmbedCodes().linkCode, 'HTML <link> tags copied!');
  });
  document.getElementById('btn-copy-modal-import').addEventListener('click', () => {
    copyTextToClipboard(getEmbedCodes().importCode, 'CSS @import code copied!');
  });
  document.getElementById('btn-copy-modal-rules').addEventListener('click', () => {
    copyTextToClipboard(getEmbedCodes().cssRules, 'CSS typography rules copied!');
  });

  // Banner quick copy buttons
  document.getElementById('btn-copy-import-quick').addEventListener('click', () => {
    copyTextToClipboard(getEmbedCodes().importCode, 'CSS @import copied!');
  });
  document.getElementById('btn-copy-html-quick').addEventListener('click', () => {
    copyTextToClipboard(getEmbedCodes().linkCode, 'HTML <link> copied!');
  });

  // Catalog search & filter
  catalogSearch.addEventListener('input', (e) => {
    state.searchQuery = e.target.value;
    renderCatalog();
  });

  catalogSampleText.addEventListener('input', () => {
    renderCatalog();
  });

  categoryFilterChips.addEventListener('click', (e) => {
    if (e.target.classList.contains('preset-chip')) {
      categoryFilterChips.querySelectorAll('.preset-chip').forEach(c => c.classList.remove('active'));
      e.target.classList.add('active');
      state.activeCategory = e.target.dataset.cat;
      renderCatalog();
    }
  });

  // Initial Initialization
  populateFontSelects();
  renderPairingChips();
  applyStateToStage();
  updateAlignButtons('left');
  renderCatalog();
});