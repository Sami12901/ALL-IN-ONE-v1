// Social Media Brand Kit & Feed Curator - Core Client-Side Logic
// Provides luxury color harmonic token management, typography pairing,
// live 3x3 Instagram feed curation, platform safe-zone specs, and token export.

const COLOR_PRESETS = {
  'obsidian-gold': {
    name: 'Obsidian & Gold',
    primary: '#0d0d0f',
    secondary: '#1c1a17',
    accent: '#d4af37',
    neutral: '#e8e4dc'
  },
  'emerald-cream': {
    name: 'Emerald & Cream',
    primary: '#06231c',
    secondary: '#0d382c',
    accent: '#c9a96e',
    neutral: '#f5f2eb'
  },
  'bordeaux-rosegold': {
    name: 'Bordeaux & Rose Gold',
    primary: '#240a13',
    secondary: '#3d1422',
    accent: '#e0a899',
    neutral: '#f8f1ee'
  }
};

const SECTOR_METADATA = {
  horlogerie: {
    category: 'Haute Horlogerie',
    tagline: 'Timeless horology forged in Geneva.',
    handleSuffix: '.horlogerie',
    initials: 'VC',
    defaultWebsite: 'geneva-salons.vauquelin.ch'
  },
  fashion: {
    category: 'Haute Couture',
    tagline: 'Sculpting silhouettes of eternal refinement.',
    handleSuffix: '.couture',
    initials: 'VC',
    defaultWebsite: 'parissalons.vauquelin.fr'
  },
  jewelry: {
    category: 'Fine & High Jewelry',
    tagline: 'Rare gemstones awakened by master lapidaries.',
    handleSuffix: '.jewelry',
    initials: 'VJ',
    defaultWebsite: 'placevendome.vauquelin.com'
  },
  fragrance: {
    category: 'Niche Fragrance',
    tagline: 'Alchemical extractions of rare Grasse botanicals.',
    handleSuffix: '.parfums',
    initials: 'VP',
    defaultWebsite: 'atelierparfums.vauquelin.com'
  },
  hospitality: {
    category: 'Private Residence & Hospitality',
    tagline: 'Discreet sanctuaries for global connoisseurs.',
    handleSuffix: '.retreats',
    initials: 'VR',
    defaultWebsite: 'sanctuary.vauquelin.ch'
  }
};

// Initial 9 Feed Posts Configuration
const DEFAULT_POSTS = [
  {
    archetype: 'editorial',
    headline: 'The Vendôme Salons',
    sub: 'Private View • October 2026',
    art: 'salon'
  },
  {
    archetype: 'product',
    headline: 'Tourbillon N° 12',
    sub: 'Platinum 950 • Calibre 1888',
    art: 'watch'
  },
  {
    archetype: 'quote',
    headline: '“Perfection is not an accident. It is the patience of centuries.”',
    sub: 'Maison Manifesto',
    art: null
  },
  {
    archetype: 'story',
    headline: 'The Grand Complication',
    sub: 'Chapter IV: The Chiming Heart',
    art: 'movement'
  },
  {
    archetype: 'product',
    headline: 'Guilloché Émail',
    sub: 'Hand-Turned Rose Gold 1/25',
    art: 'gem'
  },
  {
    archetype: 'editorial',
    headline: 'Midnight in St. Moritz',
    sub: 'Alpine Winter Collection',
    art: 'chalet'
  },
  {
    archetype: 'quote',
    headline: '“True luxury whispers where extravagance shouts.”',
    sub: 'Master Watchmaker Notes',
    art: null
  },
  {
    archetype: 'product',
    headline: 'Minute Repeater Sovereign',
    sub: 'Cathedral Gongs • Bespoke 1/1',
    art: 'watch'
  },
  {
    archetype: 'story',
    headline: 'Atelier Archives',
    sub: 'Preserving Heritage Since 1842',
    art: 'archives'
  }
];

// SVG Artwork Generators for Luxury Product & Editorial Tiles
function getVectorArt(artType, accentColor, neutralColor) {
  switch (artType) {
    case 'watch':
      return `
        <svg viewBox="0 0 100 100" width="68" height="68" fill="none" stroke="${accentColor}" stroke-width="1.8">
          <circle cx="50" cy="50" r="42" stroke="${accentColor}" stroke-width="2" opacity="0.9" />
          <circle cx="50" cy="50" r="36" stroke="${accentColor}" stroke-width="0.8" stroke-dasharray="2,3" />
          <circle cx="50" cy="50" r="28" stroke="${accentColor}" stroke-width="1" />
          <!-- Dial markers -->
          <line x1="50" y1="14" x2="50" y2="20" stroke="${accentColor}" stroke-width="2" />
          <line x1="50" y1="80" x2="50" y2="86" stroke="${accentColor}" stroke-width="2" />
          <line x1="14" y1="50" x2="20" y2="50" stroke="${accentColor}" stroke-width="2" />
          <line x1="80" y1="50" x2="86" y2="50" stroke="${accentColor}" stroke-width="2" />
          <!-- Tourbillon cage at bottom -->
          <circle cx="50" cy="62" r="11" stroke="${accentColor}" stroke-width="1.2" />
          <path d="M46 62 Q50 56 54 62 Q50 68 46 62 Z" fill="${accentColor}" opacity="0.4" />
          <!-- Hands -->
          <line x1="50" y1="50" x2="66" y2="38" stroke="${neutralColor}" stroke-width="2" stroke-linecap="round" />
          <line x1="50" y1="50" x2="38" y2="30" stroke="${neutralColor}" stroke-width="2.5" stroke-linecap="round" />
          <circle cx="50" cy="50" r="3" fill="${accentColor}" />
        </svg>
      `;
    case 'gem':
      return `
        <svg viewBox="0 0 100 100" width="64" height="64" fill="none" stroke="${accentColor}" stroke-width="1.8">
          <polygon points="30,22 70,22 88,44 50,84 12,44" stroke="${accentColor}" fill="rgba(212,175,55,0.06)" />
          <line x1="12" y1="44" x2="88" y2="44" stroke="${accentColor}" stroke-width="1.2" />
          <line x1="30" y1="22" x2="50" y2="84" stroke="${accentColor}" stroke-width="1" />
          <line x1="70" y1="22" x2="50" y2="84" stroke="${accentColor}" stroke-width="1" />
          <line x1="30" y1="22" x2="50" y2="44" stroke="${accentColor}" stroke-width="1" />
          <line x1="70" y1="22" x2="50" y2="44" stroke="${accentColor}" stroke-width="1" />
          <circle cx="50" cy="35" r="2" fill="${neutralColor}" />
        </svg>
      `;
    case 'movement':
    case 'archives':
      return `
        <svg viewBox="0 0 100 100" width="64" height="64" fill="none" stroke="${accentColor}" stroke-width="1.6">
          <circle cx="50" cy="50" r="36" stroke="${accentColor}" stroke-width="1.5" />
          <circle cx="50" cy="50" r="16" stroke="${accentColor}" stroke-dasharray="3,3" />
          <path d="M50 14 L50 24 M50 76 L50 86 M14 50 L24 50 M76 50 L86 50" stroke="${accentColor}" stroke-width="2" />
          <polygon points="50,34 54,46 66,50 54,54 50,66 46,54 34,50 46,46" fill="${accentColor}" opacity="0.3" stroke="${accentColor}" />
        </svg>
      `;
    case 'salon':
    case 'chalet':
    default:
      return `
        <svg viewBox="0 0 100 100" width="64" height="64" fill="none" stroke="${accentColor}" stroke-width="1.5">
          <rect x="20" y="24" width="60" height="52" rx="2" stroke="${accentColor}" opacity="0.8" />
          <path d="M20 62 L42 44 L60 60 L70 52 L80 62" stroke="${accentColor}" stroke-width="1.5" fill="rgba(212,175,55,0.08)" />
          <circle cx="40" cy="38" r="6" stroke="${accentColor}" fill="rgba(212,175,55,0.2)" />
        </svg>
      `;
  }
}

document.addEventListener('DOMContentLoaded', () => {
  // Brand Profile Inputs
  const inpMaisonName = document.getElementById('inp-maison-name');
  const inpMaisonTagline = document.getElementById('inp-maison-tagline');
  const selectLuxurySector = document.getElementById('select-luxury-sector');

  // Color Pickers & Hex Inputs
  const pickPrimary = document.getElementById('pick-primary');
  const hexPrimary = document.getElementById('hex-primary');

  const pickSecondary = document.getElementById('pick-secondary');
  const hexSecondary = document.getElementById('hex-secondary');

  const pickAccent = document.getElementById('pick-accent');
  const hexAccent = document.getElementById('hex-accent');

  const pickNeutral = document.getElementById('pick-neutral');
  const hexNeutral = document.getElementById('hex-neutral');

  // Palette Presets
  const paletteChips = document.querySelectorAll('.palette-chip');

  // Typography Inputs
  const selectFontSerif = document.getElementById('select-font-serif');
  const selectFontSans = document.getElementById('select-font-sans');
  const rangeTracking = document.getElementById('range-tracking');
  const dispTrackingVal = document.getElementById('disp-tracking-val');

  // Export Buttons
  const btnExportCss = document.getElementById('btn-export-css');
  const btnExportTokens = document.getElementById('btn-export-tokens');
  const btnPrintBrandguide = document.getElementById('btn-print-brandguide');

  // Simulator Elements
  const simAvatar = document.getElementById('sim-avatar');
  const simMaisonTitle = document.getElementById('sim-maison-title');
  const simSectorLabel = document.getElementById('sim-sector-label');
  const simTaglineText = document.getElementById('sim-tagline-text');
  const simWebsiteLink = document.getElementById('sim-website-link');
  const igGrid = document.getElementById('ig-grid');
  const btnShuffleFeed = document.getElementById('btn-shuffle-feed');

  // Tile Editor Elements
  const tileEditorPanel = document.getElementById('tile-editor-panel');
  const editorTileIndexBadge = document.getElementById('editor-tile-index-badge');
  const editorArchetype = document.getElementById('editor-archetype');
  const editorHeadline = document.getElementById('editor-headline');
  const editorSub = document.getElementById('editor-sub');

  // Tabs
  const studioTabBtns = document.querySelectorAll('.studio-tab-btn');
  const tabContentFeed = document.getElementById('tab-content-feed');
  const tabContentCheatsheet = document.getElementById('tab-content-cheatsheet');
  const tabContentTokens = document.getElementById('tab-content-tokens');

  // Token specimens
  const typoSpecimenH1 = document.getElementById('typo-specimen-h1');
  const typoSpecimenH2 = document.getElementById('typo-specimen-h2');
  const typoSpecimenBody = document.getElementById('typo-specimen-body');
  const codeCssTokens = document.getElementById('code-css-tokens');

  // Copy Spec Buttons
  const copySpecBtns = document.querySelectorAll('.btn-copy-spec');

  // State
  let posts = JSON.parse(JSON.stringify(DEFAULT_POSTS));
  let selectedTileIndex = 0;
  let activePaletteKey = 'obsidian-gold';

  // Apply Theme Colors to CSS Variables
  function applyTokens() {
    const primary = pickPrimary.value;
    const secondary = pickSecondary.value;
    const accent = pickAccent.value;
    const neutral = pickNeutral.value;

    const serifFont = selectFontSerif.value;
    const sansFont = selectFontSans.value;
    const tracking = `${rangeTracking.value}em`;

    document.documentElement.style.setProperty('--maison-primary', primary);
    document.documentElement.style.setProperty('--maison-secondary', secondary);
    document.documentElement.style.setProperty('--maison-accent', accent);
    document.documentElement.style.setProperty('--maison-neutral', neutral);
    document.documentElement.style.setProperty('--maison-headline-font', serifFont);
    document.documentElement.style.setProperty('--maison-body-font', sansFont);
    document.documentElement.style.setProperty('--maison-tracking', tracking);

    dispTrackingVal.textContent = tracking;

    // Update Profile Header
    const maisonName = inpMaisonName.value.trim() || 'Maison';
    const initials = maisonName.split(' ').map(w => w[0]).filter(Boolean).slice(0, 2).join('').toUpperCase() || 'M';
    simAvatar.textContent = initials;
    simMaisonTitle.innerHTML = `<span>${maisonName}</span><span class="ig-verified-badge">✓</span>`;

    const sectorKey = selectLuxurySector.value;
    const meta = SECTOR_METADATA[sectorKey] || SECTOR_METADATA.horlogerie;
    simSectorLabel.textContent = meta.category;
    simTaglineText.textContent = inpMaisonTagline.value.trim() || meta.tagline;

    const handle = maisonName.toLowerCase().replace(/[^a-z0-9]/g, '');
    simWebsiteLink.textContent = `${handle}${meta.handleSuffix || '.com'}`;

    // Update Typography Specimen
    typoSpecimenH1.textContent = maisonName.toUpperCase();
    typoSpecimenH1.style.fontFamily = serifFont;
    typoSpecimenH1.style.letterSpacing = tracking;
    typoSpecimenH2.style.fontFamily = serifFont;
    typoSpecimenBody.style.fontFamily = sansFont;

    // Update CSS Code Box
    const cssContent = `:root {
  /* Maison Color Tokens */
  --maison-primary: ${primary};
  --maison-secondary: ${secondary};
  --maison-accent: ${accent};
  --maison-neutral: ${neutral};

  /* Maison Typography Tokens */
  --maison-font-serif: ${serifFont};
  --maison-font-sans: ${sansFont};
  --maison-letter-spacing: ${tracking};

  /* Editorial Layout */
  --maison-border: rgba(255, 255, 255, 0.08);
  --maison-accent-glow: rgba(${hexToRgb(accent)}, 0.18);
}`;
    codeCssTokens.textContent = cssContent;

    // Re-render feed tiles with new colors
    renderGrid();
  }

  function hexToRgb(hex) {
    let clean = hex.replace('#', '');
    if (clean.length === 3) {
      clean = clean.split('').map(c => c + c).join('');
    }
    const num = parseInt(clean, 16);
    return `${(num >> 16) & 255}, ${(num >> 8) & 255}, ${num & 255}`;
  }

  // Render 3x3 Instagram Grid
  function renderGrid() {
    igGrid.innerHTML = '';
    const accent = pickAccent.value;
    const neutral = pickNeutral.value;

    posts.forEach((post, index) => {
      const tile = document.createElement('div');
      tile.className = `ig-grid-tile ${index === selectedTileIndex ? 'selected' : ''}`;
      tile.dataset.index = index;

      let innerContent = '';

      if (post.archetype === 'quote') {
        innerContent = `
          <div class="tile-archetype-wrap tile-quote">
            <span class="quote-mark">“</span>
            <div class="quote-body">${post.headline}</div>
            <span class="quote-author">${post.sub}</span>
          </div>
        `;
      } else if (post.archetype === 'product') {
        const artSvg = getVectorArt(post.art || 'watch', accent, neutral);
        innerContent = `
          <div class="tile-archetype-wrap tile-product">
            <div class="product-vector-art">${artSvg}</div>
            <div class="tile-pill-tag">${post.sub}</div>
          </div>
        `;
      } else if (post.archetype === 'story') {
        const artSvg = getVectorArt(post.art || 'movement', accent, neutral);
        innerContent = `
          <div class="tile-archetype-wrap tile-product" style="background: radial-gradient(circle, var(--maison-secondary) 10%, #000 100%);">
            <div class="carousel-top-badge">
              <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor"><path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V5h14v14z"/><path d="M7 7h10v10H7z" opacity="0.3"/></svg>
            </div>
            <div class="product-vector-art">${artSvg}</div>
            <div style="font-family: var(--maison-headline-font); font-size: 0.75rem; color: #fff; text-align: center; margin-top: 4px;">${post.headline}</div>
            <div class="tile-pill-tag" style="border-color: var(--maison-accent);">${post.sub}</div>
          </div>
        `;
      } else {
        // Editorial
        const artSvg = getVectorArt(post.art || 'salon', accent, neutral);
        innerContent = `
          <div class="tile-archetype-wrap tile-product" style="background: linear-gradient(180deg, var(--maison-secondary) 0%, #000 100%);">
            <div class="product-vector-art" style="opacity: 0.55;">${artSvg}</div>
            <div class="editorial-overlay">
              <div class="editorial-caption">${post.headline}</div>
              <div class="editorial-sub">${post.sub}</div>
            </div>
          </div>
        `;
      }

      tile.innerHTML = innerContent;

      tile.addEventListener('click', () => {
        selectTile(index);
      });

      igGrid.appendChild(tile);
    });
  }

  // Select Tile for Editing
  function selectTile(index) {
    selectedTileIndex = index;
    const post = posts[index];
    if (!post) return;

    editorTileIndexBadge.textContent = `Tile #${index + 1}`;
    editorArchetype.value = post.archetype;
    editorHeadline.value = post.headline;
    editorSub.value = post.sub;

    document.querySelectorAll('.ig-grid-tile').forEach((t, i) => {
      t.classList.toggle('selected', i === index);
    });
  }

  // Update current selected tile from editor
  function updateSelectedTile() {
    const post = posts[selectedTileIndex];
    if (!post) return;

    post.archetype = editorArchetype.value;
    post.headline = editorHeadline.value;
    post.sub = editorSub.value;

    renderGrid();
  }

  editorArchetype.addEventListener('change', updateSelectedTile);
  editorHeadline.addEventListener('input', updateSelectedTile);
  editorSub.addEventListener('input', updateSelectedTile);

  // Sync Color Pickers and Hex Inputs
  function setupColorPair(picker, textInput) {
    picker.addEventListener('input', () => {
      textInput.value = picker.value;
      paletteChips.forEach(chip => chip.classList.remove('active'));
      applyTokens();
    });

    textInput.addEventListener('input', () => {
      const val = textInput.value.trim();
      if (/^#([0-9A-F]{3}){1,2}$/i.test(val)) {
        picker.value = val;
        paletteChips.forEach(chip => chip.classList.remove('active'));
        applyTokens();
      }
    });
  }

  setupColorPair(pickPrimary, hexPrimary);
  setupColorPair(pickSecondary, hexSecondary);
  setupColorPair(pickAccent, hexAccent);
  setupColorPair(pickNeutral, hexNeutral);

  // Preset Palette Switcher
  paletteChips.forEach(chip => {
    chip.addEventListener('click', () => {
      const key = chip.dataset.preset;
      const palette = COLOR_PRESETS[key];
      if (!palette) return;

      activePaletteKey = key;
      pickPrimary.value = palette.primary;
      hexPrimary.value = palette.primary;

      pickSecondary.value = palette.secondary;
      hexSecondary.value = palette.secondary;

      pickAccent.value = palette.accent;
      hexAccent.value = palette.accent;

      pickNeutral.value = palette.neutral;
      hexNeutral.value = palette.neutral;

      paletteChips.forEach(c => c.classList.toggle('active', c === chip));
      applyTokens();
    });
  });

  // Profile Inputs change listeners
  inpMaisonName.addEventListener('input', applyTokens);
  inpMaisonTagline.addEventListener('input', applyTokens);
  selectLuxurySector.addEventListener('change', applyTokens);
  selectFontSerif.addEventListener('change', applyTokens);
  selectFontSans.addEventListener('change', applyTokens);
  rangeTracking.addEventListener('input', applyTokens);

  // Tab Switcher
  studioTabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const targetTab = btn.dataset.tab;

      studioTabBtns.forEach(b => b.classList.toggle('active', b === btn));

      tabContentFeed.style.display = targetTab === 'feed' ? 'block' : 'none';
      tabContentCheatsheet.style.display = targetTab === 'cheatsheet' ? 'block' : 'none';
      tabContentTokens.style.display = targetTab === 'tokens' ? 'block' : 'none';
    });
  });

  // Rebalance / Shuffle Feed Layout
  btnShuffleFeed.addEventListener('click', () => {
    // Elegant cyclical rotation of archetypes for aesthetic balance
    const archetypesCycle = ['editorial', 'product', 'quote', 'story', 'product', 'editorial', 'quote', 'product', 'story'];
    posts.forEach((p, i) => {
      p.archetype = archetypesCycle[i];
    });
    renderGrid();
    selectTile(selectedTileIndex);
  });

  // Export CSS Variables Handler
  btnExportCss.addEventListener('click', () => {
    const css = codeCssTokens.textContent;
    navigator.clipboard.writeText(css).then(() => {
      const orig = btnExportCss.innerHTML;
      btnExportCss.innerHTML = `
        <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" style="margin-right: 6px;"><polyline points="20 6 9 17 4 12"></polyline></svg>
        CSS Variables Copied!
      `;
      setTimeout(() => {
        btnExportCss.innerHTML = orig;
      }, 2000);
    });
  });

  // Export JSON Theme Tokens Handler
  btnExportTokens.addEventListener('click', () => {
    const maisonName = inpMaisonName.value.trim() || 'Maison';
    const sectorKey = selectLuxurySector.value;
    const meta = SECTOR_METADATA[sectorKey] || SECTOR_METADATA.horlogerie;

    const tokenData = {
      maison: {
        name: maisonName,
        tagline: inpMaisonTagline.value.trim() || meta.tagline,
        sector: meta.category
      },
      colors: {
        primary: { hex: pickPrimary.value, rgb: hexToRgb(pickPrimary.value) },
        secondary: { hex: pickSecondary.value, rgb: hexToRgb(pickSecondary.value) },
        accent: { hex: pickAccent.value, rgb: hexToRgb(pickAccent.value) },
        neutral: { hex: pickNeutral.value, rgb: hexToRgb(pickNeutral.value) }
      },
      typography: {
        headlineSerif: selectFontSerif.value,
        bodySans: selectFontSans.value,
        letterTracking: `${rangeTracking.value}em`
      },
      socialFeed: {
        curatedGrid: posts
      },
      platformSafeZones: {
        square_1_1: { width: 1080, height: 1080, safeArea: "800x800", usage: "Feed Post & Carousels" },
        portrait_4_5: { width: 1080, height: 1350, safeArea: "1080x1080 (Grid Crop)", usage: "Luxury Feed Standard" },
        vertical_9_16: { width: 1080, height: 1920, safeArea: "1000x1330", usage: "Reels & Stories" },
        landscape_16_9: { width: 1920, height: 1080, safeArea: "1200x675", usage: "YouTube & Brand Film" }
      }
    };

    const blob = new Blob([JSON.stringify(tokenData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    const safeFile = maisonName.toLowerCase().replace(/[^a-z0-9]/g, '-');
    a.download = `${safeFile}-brand-tokens.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  });

  // Print Brand Guide (PDF)
  btnPrintBrandguide.addEventListener('click', () => {
    window.print();
  });

  // Copy Platform Dimensions Buttons
  copySpecBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const dims = btn.dataset.dims;
      navigator.clipboard.writeText(dims).then(() => {
        const orig = btn.textContent;
        btn.textContent = `✓ Copied ${dims}`;
        setTimeout(() => {
          btn.textContent = orig;
        }, 1800);
      });
    });
  });

  // Initialize
  applyTokens();
  selectTile(0);
});