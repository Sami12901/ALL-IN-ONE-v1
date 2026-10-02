/**
 * Maison Brand Asset Manager (DAM Vault)
 * Executive client-side luxury asset management engine.
 */

// Global state
const STORAGE_KEY = 'maison_dam_vault_v2';

const CATEGORIES = [
  'Master Logos',
  'Monograms',
  'Packaging Dies',
  'Campaign Imagery',
  'Typography',
  'Press Kits'
];

// Helper: Calculate greatest common divisor for aspect ratio
function getAspectRatio(width, height) {
  if (!width || !height) return '1:1';
  const gcd = (a, b) => (b === 0 ? a : gcd(b, a % b));
  const divisor = gcd(width, height);
  const wRatio = width / divisor;
  const hRatio = height / divisor;
  
  // Clean common ratios
  const ratio = (width / height).toFixed(2);
  if (Math.abs(ratio - 1.0) < 0.05) return '1:1 (Square)';
  if (Math.abs(ratio - 1.77) < 0.05 || Math.abs(ratio - 1.78) < 0.05) return '16:9 (Widescreen)';
  if (Math.abs(ratio - 1.33) < 0.05) return '4:3 (Classic)';
  if (Math.abs(ratio - 0.8) < 0.05) return '4:5 (Portrait)';
  if (Math.abs(ratio - 1.5) < 0.05) return '3:2 (Editorial)';
  if (Math.abs(ratio - 0.67) < 0.05) return '2:3 (Vertical)';
  return `${wRatio}:${hRatio}`;
}

function formatBytes(bytes) {
  if (!bytes || bytes === 0) return '0 KB';
  const k = 1024;
  const dm = 1;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

// Default Pre-loaded Luxury Emblems (High-fidelity SVGs)
const DEFAULT_ASSETS = [
  {
    id: 'asset_gold_rosette',
    title: "L'Étoile d'Or - Maison Rosette",
    category: 'Master Logos',
    fileName: 'etoile-dor-rosette-master.svg',
    format: 'SVG / Vector',
    mimeType: 'image/svg+xml',
    width: 1200,
    height: 1200,
    aspectRatio: '1:1 (Square)',
    fileSize: 18450,
    colorProfile: 'Gold Foil',
    usage: 'Primary House Seal, debossed leather linings, Haute Horlogerie crowns & presentation dials.',
    tags: ['rosette', 'gold', 'seal', 'vector', 'emblem'],
    createdAt: new Date().toISOString(),
    svgCode: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 1200" width="1200" height="1200">
  <defs>
    <radialGradient id="goldCore" cx="50%" cy="50%" r="50%" fx="40%" fy="40%">
      <stop offset="0%" stop-color="#fff4cc"/>
      <stop offset="25%" stop-color="#f5d77f"/>
      <stop offset="50%" stop-color="#d4af37"/>
      <stop offset="75%" stop-color="#aa771c"/>
      <stop offset="100%" stop-color="#5a3d0b"/>
    </radialGradient>
    <linearGradient id="goldLinear" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#f5e7a9"/>
      <stop offset="50%" stop-color="#d4af37"/>
      <stop offset="100%" stop-color="#8c6218"/>
    </linearGradient>
    <filter id="goldGlow" x="-20%" y="-20%" width="140%" height="140%">
      <feGaussianBlur stdDeviation="8" result="blur"/>
      <feComposite in="SourceGraphic" in2="blur" operator="over"/>
    </filter>
  </defs>
  <rect width="1200" height="1200" fill="#08090d"/>
  <g transform="translate(600,600)">
    <circle r="530" fill="none" stroke="url(#goldLinear)" stroke-width="2" opacity="0.4"/>
    <circle r="510" fill="none" stroke="url(#goldLinear)" stroke-width="1.5" stroke-dasharray="6,6" opacity="0.6"/>
    <circle r="480" fill="none" stroke="url(#goldLinear)" stroke-width="8"/>
    <circle r="460" fill="none" stroke="url(#goldLinear)" stroke-width="1.5" opacity="0.8"/>
    <!-- 24 Guilloche Petals -->
    <g id="petals">
      ${Array.from({ length: 24 }).map((_, i) => `
        <path d="M 0,-460 C 90,-350 90,-200 0,-150 C -90,-200 -90,-350 0,-460 Z"
              fill="none" stroke="url(#goldLinear)" stroke-width="2.5" opacity="0.75"
              transform="rotate(${i * 15})"/>
      `).join('')}
    </g>
    <!-- 12 Star Facets -->
    <g id="starFacets">
      ${Array.from({ length: 12 }).map((_, i) => `
        <polygon points="0,-450 35,-260 0,-210 -35,-260"
                 fill="url(#goldCore)" opacity="0.9"
                 transform="rotate(${i * 30})"/>
      `).join('')}
    </g>
    <!-- Concentric Rings & Central Medallion -->
    <circle r="210" fill="#0c0e14" stroke="url(#goldLinear)" stroke-width="4"/>
    <circle r="190" fill="none" stroke="url(#goldLinear)" stroke-width="1.5" stroke-dasharray="4,4" opacity="0.8"/>
    <circle r="140" fill="none" stroke="url(#goldLinear)" stroke-width="3"/>
    <!-- Central 8-Point Diamond Star -->
    <polygon points="0,-140 30,-30 140,0 30,30 0,140 -30,30 -140,0 -30,-30" fill="url(#goldCore)" filter="url(#goldGlow)"/>
    <circle r="16" fill="#ffffff" opacity="0.9"/>
  </g>
</svg>`
  },
  {
    id: 'asset_serif_crest',
    title: 'Maison Royale Heritage Crest',
    category: 'Master Logos',
    fileName: 'maison-royale-heraldic-crest.svg',
    format: 'SVG / Vector',
    mimeType: 'image/svg+xml',
    width: 1200,
    height: 1500,
    aspectRatio: '4:5 (Portrait)',
    fileSize: 22100,
    colorProfile: 'Display P3',
    usage: 'Boutique facade plaques, flagship stationery, certificate of authenticity, high jewelry cases.',
    tags: ['crest', 'heritage', 'heraldry', 'crown', 'shield'],
    createdAt: new Date(Date.now() - 86400000).toISOString(),
    svgCode: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 1500" width="1200" height="1500">
  <defs>
    <linearGradient id="crestGold" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#fff0b8"/>
      <stop offset="40%" stop-color="#d4af37"/>
      <stop offset="80%" stop-color="#996515"/>
      <stop offset="100%" stop-color="#60400b"/>
    </linearGradient>
    <linearGradient id="shieldFill" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#141824"/>
      <stop offset="100%" stop-color="#080a0f"/>
    </linearGradient>
  </defs>
  <rect width="1200" height="1500" fill="#07080b"/>
  <g transform="translate(600, 750)">
    <!-- Heraldic Crown at Top -->
    <g transform="translate(0, -520)">
      <path d="M -180,60 L -150,-50 L -60,10 L 0,-80 L 60,10 L 150,-50 L 180,60 Z" fill="url(#crestGold)" stroke="#d4af37" stroke-width="3"/>
      <circle cx="-150" cy="-58" r="10" fill="#fff5d0"/>
      <circle cx="0" cy="-90" r="14" fill="#ffffff"/>
      <circle cx="150" cy="-58" r="10" fill="#fff5d0"/>
      <rect x="-190" y="60" width="380" height="30" rx="6" fill="url(#crestGold)"/>
      <circle cx="-120" cy="75" r="6" fill="#141824"/>
      <circle cx="0" cy="75" r="7" fill="#141824"/>
      <circle cx="120" cy="75" r="6" fill="#141824"/>
    </g>
    <!-- Laurel Wreath Around Shield -->
    <g stroke="url(#crestGold)" stroke-width="2.5" fill="none" opacity="0.85">
      <!-- Left Laurel -->
      <path d="M -160,280 C -380,260 -420,-150 -260,-320 C -220,-360 -180,-380 -140,-400"/>
      ${Array.from({ length: 9 }).map((_, i) => `
        <ellipse cx="${-280 + i * 15}" cy="${-300 + i * 65}" rx="30" ry="14" transform="rotate(${-40 + i * 10} ${-280 + i * 15} ${-300 + i * 65})" fill="url(#crestGold)" opacity="0.85"/>
      `).join('')}
      <!-- Right Laurel -->
      <path d="M 160,280 C 380,260 420,-150 260,-320 C 220,-360 180,-380 140,-400"/>
      ${Array.from({ length: 9 }).map((_, i) => `
        <ellipse cx="${280 - i * 15}" cy="${-300 + i * 65}" rx="30" ry="14" transform="rotate(${40 - i * 10} ${280 - i * 15} ${-300 + i * 65})" fill="url(#crestGold)" opacity="0.85"/>
      `).join('')}
    </g>
    <!-- Center Heraldic Shield -->
    <path d="M -240,-350 L 240,-350 C 240,-100 220,180 0,380 C -220,180 -240,-100 -240,-350 Z"
          fill="url(#shieldFill)" stroke="url(#crestGold)" stroke-width="8"/>
    <path d="M -210,-320 L 210,-320 C 210,-90 190,150 0,330 C -190,150 -210,-90 -210,-320 Z"
          fill="none" stroke="url(#crestGold)" stroke-width="2" stroke-dasharray="6,6" opacity="0.6"/>
    <!-- Quartering Lines -->
    <line x1="0" y1="-320" x2="0" y2="330" stroke="url(#crestGold)" stroke-width="2.5" opacity="0.7"/>
    <line x1="-220" y1="-70" x2="220" y2="-70" stroke="url(#crestGold)" stroke-width="2.5" opacity="0.7"/>
    <!-- Quarter Symbols -->
    <!-- Q1: Fleur-de-lis -->
    <path d="M -110,-230 C -90,-210 -80,-170 -110,-130 C -140,-170 -130,-210 -110,-230 Z M -110,-130 L -110,-100 M -140,-160 C -170,-150 -160,-120 -125,-140" stroke="url(#crestGold)" stroke-width="3" fill="none"/>
    <!-- Q2: Rampant Lion Motif -->
    <path d="M 80,-220 C 100,-230 130,-210 120,-180 C 135,-175 140,-155 125,-145 C 135,-130 115,-110 85,-125" stroke="url(#crestGold)" stroke-width="3" fill="none"/>
    <!-- Q3: Star of Excellence -->
    <polygon points="-110,60 -95,100 -55,105 -85,130 -75,170 -110,145 -145,170 -135,130 -165,105 -125,100" fill="url(#crestGold)" opacity="0.85"/>
    <!-- Q4: Interlocking Ring -->
    <circle cx="105" cy="115" r="42" fill="none" stroke="url(#crestGold)" stroke-width="4"/>
    <circle cx="105" cy="115" r="26" fill="none" stroke="url(#crestGold)" stroke-width="2" opacity="0.6"/>
    <!-- Ribbon Banner Below -->
    <g transform="translate(0, 420)">
      <path d="M -340,60 Q 0,-30 340,60 L 320,120 Q 0,30 -320,120 Z" fill="#12151e" stroke="url(#crestGold)" stroke-width="3"/>
      <path d="M -340,60 L -380,100 L -320,120 Z" fill="#0d0f16" stroke="url(#crestGold)" stroke-width="2"/>
      <path d="M 340,60 L 380,100 L 320,120 Z" fill="#0d0f16" stroke="url(#crestGold)" stroke-width="2"/>
      <text x="0" y="80" text-anchor="middle" fill="#f5e7a9" font-family="'Instrument Serif', serif" font-size="34" letter-spacing="8" font-weight="bold">FONDEE EN MDCCCXCVIII</text>
    </g>
  </g>
</svg>`
  },
  {
    id: 'asset_minimal_monogram',
    title: 'Atelier V & M Interlocking Cipher',
    category: 'Monograms',
    fileName: 'atelier-vm-interlocking-monogram.svg',
    format: 'SVG / Vector',
    mimeType: 'image/svg+xml',
    width: 1000,
    height: 1000,
    aspectRatio: '1:1 (Square)',
    fileSize: 12800,
    colorProfile: 'Gold Foil',
    usage: 'Monogram canvas jacquard, luggage lock engraving, silk scarf foulard repetitives, buckle stamp.',
    tags: ['monogram', 'cipher', 'interlocking', 'gold', 'minimalist'],
    createdAt: new Date(Date.now() - 172800000).toISOString(),
    svgCode: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1000 1000" width="1000" height="1000">
  <defs>
    <linearGradient id="monoGold" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#fff2be"/>
      <stop offset="45%" stop-color="#d4af37"/>
      <stop offset="90%" stop-color="#8f6314"/>
    </linearGradient>
  </defs>
  <rect width="1000" height="1000" fill="#090a0f"/>
  <g transform="translate(500, 500)">
    <!-- Fine Hairline Octagonal Framing -->
    <polygon points="0,-440 311,-311 440,0 311,311 0,440 -311,311 -440,0 -311,-311"
             fill="none" stroke="url(#monoGold)" stroke-width="2" opacity="0.4"/>
    <polygon points="0,-420 297,-297 420,0 297,297 0,420 -297,297 -420,0 -297,-297"
             fill="none" stroke="url(#monoGold)" stroke-width="1" stroke-dasharray="8,8" opacity="0.6"/>
    <!-- Interlocking V and M Cipher -->
    <!-- Letter M in Rich Stroke -->
    <path d="M -260,250 L -260,-220 L -210,-220 L -60,110 L 90,-220 L 140,-220 L 140,250 L 95,250 L 95,-130 L -35,160 L -85,160 L -215,-130 L -215,250 Z"
          fill="url(#monoGold)" filter="drop-shadow(0 10 20 rgba(0,0,0,0.5))"/>
    <!-- Letter V in Overlaid Interlocking Placement -->
    <path d="M -140,-250 L -20,180 L 30,180 L 150,-250 L 95,-250 L 5,-40 L -85,-250 Z"
          fill="#fdf0c2" opacity="0.95" stroke="#090a0f" stroke-width="6"/>
    <!-- Elegant Diamond Accent Points -->
    <polygon points="0,-290 14,-276 0,-262 -14,-276" fill="url(#monoGold)"/>
    <polygon points="0,290 14,276 0,262 -14,276" fill="url(#monoGold)"/>
    <polygon points="-290,0 -276,14 -262,0 -276,-14" fill="url(#monoGold)"/>
    <polygon points="290,0 276,14 262,0 276,-14" fill="url(#monoGold)"/>
    <!-- Subtle House Typographic Inscription -->
    <text x="0" y="360" text-anchor="middle" fill="#8f6314" font-family="'Instrument Serif', serif" font-size="22" letter-spacing="6">ATELIER HAUTE HORLOGERIE</text>
  </g>
</svg>`
  },
  {
    id: 'asset_packaging_die',
    title: 'Coffret Écrin Haute Joaillerie Die',
    category: 'Packaging Dies',
    fileName: 'coffret-ecrin-packaging-die-spec.svg',
    format: 'SVG / Vector',
    mimeType: 'image/svg+xml',
    width: 1400,
    height: 1000,
    aspectRatio: '7:5 (Landscape)',
    fileSize: 15600,
    colorProfile: 'CMYK',
    usage: 'Rigid box structural die, deboss depth 1.2mm, gold foil hot-stamping zone, ribbon pull cutouts.',
    tags: ['packaging', 'die', 'coffret', 'box', 'foil', 'cutline'],
    createdAt: new Date(Date.now() - 259200000).toISOString(),
    svgCode: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1400 1000" width="1400" height="1000">
  <rect width="1400" height="1000" fill="#0d1117"/>
  <g transform="translate(100, 100)">
    <!-- Legend & Specs -->
    <text x="30" y="40" fill="#d4af37" font-family="sans-serif" font-size="18" font-weight="bold">MAISON DIE SPECIFICATION: COFFRET ÉCRIN NO. 4</text>
    <text x="30" y="70" fill="#8b949e" font-family="monospace" font-size="12">SCALE 1:1 • DIE REF: DIE-LUX-2026-B • 2200 GSM RIGID BOARD</text>
    <g transform="translate(30, 95)" font-family="monospace" font-size="11">
      <line x1="0" y1="0" x2="30" y2="0" stroke="#f85149" stroke-width="2"/>
      <text x="40" y="4" fill="#c9d1d9">Cutline (Trim)</text>
      <line x1="180" y1="0" x2="210" y2="0" stroke="#58a6ff" stroke-width="2" stroke-dasharray="4,4"/>
      <text x="220" y="4" fill="#c9d1d9">Crease / Fold</text>
      <rect x="360" y="-8" width="16" height="16" fill="rgba(212,175,55,0.2)" stroke="#d4af37" stroke-width="1.5"/>
      <text x="385" y="4" fill="#c9d1d9">Hot Foil Gold Stamping (Pantone 871C)</text>
    </g>
    <!-- Box Die Schematic -->
    <g transform="translate(150, 180)">
      <!-- Main Base Cut -->
      <rect x="150" y="150" width="600" height="350" fill="#161b22" stroke="#58a6ff" stroke-width="2" stroke-dasharray="6,4"/>
      <!-- Flaps (Fold) -->
      <polygon points="150,150 200,50 700,50 750,150" fill="none" stroke="#f85149" stroke-width="2"/>
      <polygon points="150,500 200,600 700,600 750,500" fill="none" stroke="#f85149" stroke-width="2"/>
      <polygon points="150,150 50,200 50,450 150,500" fill="none" stroke="#f85149" stroke-width="2"/>
      <polygon points="750,150 850,200 850,450 750,500" fill="none" stroke="#f85149" stroke-width="2"/>
      <!-- Glue Tabs -->
      <polygon points="50,200 10,230 10,420 50,450" fill="none" stroke="#f85149" stroke-width="1.5" stroke-dasharray="2,2"/>
      <polygon points="850,200 890,230 890,420 850,450" fill="none" stroke="#f85149" stroke-width="1.5" stroke-dasharray="2,2"/>
      <!-- Center Foil Stamping Area -->
      <rect x="375" y="275" width="150" height="100" rx="4" fill="rgba(212,175,55,0.25)" stroke="#d4af37" stroke-width="2"/>
      <text x="450" y="330" text-anchor="middle" fill="#d4af37" font-family="'Instrument Serif', serif" font-size="20" font-weight="bold">MAISON FOIL</text>
      <text x="450" y="350" text-anchor="middle" fill="#f5e7a9" font-family="monospace" font-size="10">HOT STAMP ZONE</text>
      <!-- Dimension Callouts -->
      <line x1="150" y1="130" x2="750" y2="130" stroke="#8b949e" stroke-width="1"/>
      <text x="450" y="125" text-anchor="middle" fill="#8b949e" font-family="monospace" font-size="12">180 mm</text>
      <line x1="130" y1="150" x2="130" y2="500" stroke="#8b949e" stroke-width="1"/>
      <text x="120" y="330" text-anchor="end" fill="#8b949e" font-family="monospace" font-size="12">120 mm</text>
    </g>
  </g>
</svg>`
  },
  {
    id: 'asset_campaign_imagery',
    title: 'Maison Lumière Solstice Campaign',
    category: 'Campaign Imagery',
    fileName: 'solstice-haute-joaillerie-campaign.svg',
    format: 'SVG / Vector Visual',
    mimeType: 'image/svg+xml',
    width: 1600,
    height: 1000,
    aspectRatio: '16:10 (Widescreen)',
    fileSize: 24300,
    colorProfile: 'Display P3',
    usage: 'Global billboard hero, flagship window display, digital flagship boutique hero banner.',
    tags: ['campaign', 'solstice', 'imagery', 'editorial', 'gold'],
    createdAt: new Date(Date.now() - 345600000).toISOString(),
    svgCode: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1600 1000" width="1600" height="1000">
  <defs>
    <radialGradient id="skyGrad" cx="50%" cy="30%" r="70%">
      <stop offset="0%" stop-color="#1e182e"/>
      <stop offset="60%" stop-color="#0e0a17"/>
      <stop offset="100%" stop-color="#050308"/>
    </radialGradient>
    <linearGradient id="horizonGlow" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#996515" stop-opacity="0"/>
      <stop offset="50%" stop-color="#ffd56b" stop-opacity="0.8"/>
      <stop offset="100%" stop-color="#996515" stop-opacity="0"/>
    </linearGradient>
  </defs>
  <rect width="1600" height="1000" fill="url(#skyGrad)"/>
  <!-- Elegant Gold Framing -->
  <rect x="50" y="50" width="1500" height="900" fill="none" stroke="#d4af37" stroke-width="2" opacity="0.6"/>
  <rect x="65" y="65" width="1470" height="870" fill="none" stroke="#d4af37" stroke-width="1" stroke-dasharray="10,6" opacity="0.3"/>
  <!-- Horizon Radiance Line -->
  <line x1="50" y1="580" x2="1550" y2="580" stroke="url(#horizonGlow)" stroke-width="3"/>
  <!-- Celestial Sun Halo -->
  <circle cx="800" cy="580" r="180" fill="none" stroke="#d4af37" stroke-width="1" opacity="0.4"/>
  <circle cx="800" cy="580" r="120" fill="none" stroke="#f5e7a9" stroke-width="1.5" opacity="0.6"/>
  <!-- Abstract Haute Joaillerie Diamond Pendant Silhouette -->
  <g transform="translate(800, 420)">
    <polygon points="0,-160 120,-60 160,80 0,220 -160,80 -120,-60" fill="none" stroke="#d4af37" stroke-width="3"/>
    <polygon points="0,-160 0,220" stroke="#f5e7a9" stroke-width="2" opacity="0.8"/>
    <polygon points="-120,-60 120,-60" stroke="#f5e7a9" stroke-width="2" opacity="0.8"/>
    <polygon points="-160,80 160,80" stroke="#f5e7a9" stroke-width="2" opacity="0.8"/>
    <circle cx="0" cy="220" r="14" fill="#ffffff" filter="drop-shadow(0 0 15px #ffd56b)"/>
  </g>
  <!-- Campaign Headline -->
  <text x="800" y="740" text-anchor="middle" fill="#ffffff" font-family="'Instrument Serif', serif" font-size="54" letter-spacing="12">SOLSTICE D'OR</text>
  <text x="800" y="790" text-anchor="middle" fill="#d4af37" font-family="'Inter', sans-serif" font-size="14" font-weight="600" letter-spacing="8">HAUTE JOAILLERIE COLLECTION 2026</text>
</svg>`
  }
];

class BrandAssetManager {
  constructor() {
    this.assets = [];
    this.selectedAssetId = null;
    this.currentCategory = 'all';
    this.searchQuery = '';
    this.sortBy = 'newest';
    this.viewMode = 'grid'; // 'grid' or 'list'
    this.modalFileCandidate = null;

    this.init();
  }

  init() {
    this.loadAssets();
    this.cacheDom();
    this.bindEvents();
    this.render();
    this.setupDropzone();
  }

  // Load from localStorage or seed defaults
  loadAssets() {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        this.assets = JSON.parse(stored);
      } else {
        this.seedDefaults();
      }
    } catch (e) {
      console.warn('Failed reading from localStorage, using defaults.', e);
      this.seedDefaults();
    }
  }

  seedDefaults() {
    this.assets = DEFAULT_ASSETS.map(asset => {
      const dataUrl = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(asset.svgCode)}`;
      return {
        ...asset,
        dataUrl: dataUrl
      };
    });
    this.saveAssets();
  }

  saveAssets() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.assets));
    } catch (e) {
      console.error('Storage quota exceeded or error writing to localStorage', e);
      this.showToast('Storage quota warning: consider exporting your vault archive as ZIP.', true);
    }
  }

  cacheDom() {
    this.statTotalCount = document.getElementById('stat-total-count');
    this.statVaultSize = document.getElementById('stat-vault-size');
    this.statCategoriesActive = document.getElementById('stat-categories-active');
    this.statVectorCount = document.getElementById('stat-vector-count');

    this.categoryPills = document.querySelectorAll('#category-pills-bar .cat-pill');
    this.searchInput = document.getElementById('dam-search-input');
    this.sortSelect = document.getElementById('sort-select');
    
    this.btnViewGrid = document.getElementById('view-mode-grid');
    this.btnViewList = document.getElementById('view-mode-list');
    this.gridContainer = document.getElementById('assets-grid-container');
    this.listContainer = document.getElementById('assets-list-container');
    this.emptyState = document.getElementById('empty-state');
    this.workspaceLayout = document.getElementById('workspace-layout');

    // Inspector
    this.inspectorPanel = document.getElementById('inspector-panel');
    this.inspectorCloseBtn = document.getElementById('inspector-close-btn');
    this.inspPreviewBox = document.getElementById('inspector-preview-box');
    this.inspImg = document.getElementById('insp-img');
    this.inspTitle = document.getElementById('insp-title');
    this.inspCategory = document.getElementById('insp-category');
    this.inspDimensions = document.getElementById('insp-dimensions');
    this.inspRatio = document.getElementById('insp-ratio');
    this.inspFormat = document.getElementById('insp-format');
    this.inspSize = document.getElementById('insp-size');
    this.inspColorBadge = document.getElementById('insp-color-badge');
    this.inspUsage = document.getElementById('insp-usage');
    this.inspId = document.getElementById('insp-id');
    this.btnInspCopy = document.getElementById('btn-insp-copy');
    this.btnInspDownload = document.getElementById('btn-insp-download');
    this.btnInspDelete = document.getElementById('btn-insp-delete');

    // Upload & Modals
    this.damDropzone = document.getElementById('dam-dropzone');
    this.damFileInput = document.getElementById('dam-file-input');
    this.btnOpenUpload = document.getElementById('btn-open-upload');
    this.btnExportZip = document.getElementById('btn-export-zip');
    this.btnResetDefaults = document.getElementById('btn-reset-defaults');

    this.uploadModal = document.getElementById('upload-modal');
    this.modalCloseBtn = document.getElementById('modal-close-btn');
    this.modalCancelBtn = document.getElementById('modal-cancel-btn');
    this.modalSaveBtn = document.getElementById('modal-save-btn');
    this.modalFileInput = document.getElementById('modal-file-input');
    this.modalPreviewZone = document.getElementById('modal-preview-zone');
    this.modalPreviewImg = document.getElementById('modal-preview-img');
    this.modalTitleInput = document.getElementById('modal-title-input');
    this.modalCategorySelect = document.getElementById('modal-category-select');
    this.modalColorSelect = document.getElementById('modal-color-select');
    this.modalUsageInput = document.getElementById('modal-usage-input');
    this.modalTagsInput = document.getElementById('modal-tags-input');

    // Toast
    this.damToast = document.getElementById('dam-toast');
    this.toastMessage = document.getElementById('toast-message');
  }

  bindEvents() {
    // Category pills filter
    this.categoryPills.forEach(pill => {
      pill.addEventListener('click', () => {
        this.categoryPills.forEach(p => p.classList.remove('active'));
        pill.classList.add('active');
        this.currentCategory = pill.dataset.category;
        this.render();
      });
    });

    // Search filter
    this.searchInput.addEventListener('input', (e) => {
      this.searchQuery = e.target.value.toLowerCase().trim();
      this.render();
    });

    // Sort
    this.sortSelect.addEventListener('change', (e) => {
      this.sortBy = e.target.value;
      this.render();
    });

    // View toggles
    this.btnViewGrid.addEventListener('click', () => {
      this.viewMode = 'grid';
      this.btnViewGrid.classList.add('active');
      this.btnViewList.classList.remove('active');
      this.gridContainer.style.display = 'grid';
      this.listContainer.style.display = 'none';
    });

    this.btnViewList.addEventListener('click', () => {
      this.viewMode = 'list';
      this.btnViewList.classList.add('active');
      this.btnViewGrid.classList.remove('active');
      this.gridContainer.style.display = 'none';
      this.listContainer.style.display = 'flex';
    });

    // Inspector buttons
    this.inspectorCloseBtn.addEventListener('click', () => this.closeInspector());
    this.btnInspCopy.addEventListener('click', () => this.copySelectedDataUrl());
    this.btnInspDownload.addEventListener('click', () => this.downloadSelectedAsset());
    this.btnInspDelete.addEventListener('click', () => this.deleteSelectedAsset());

    // Top buttons
    this.btnOpenUpload.addEventListener('click', () => this.openUploadModal());
    this.modalCloseBtn.addEventListener('click', () => this.closeUploadModal());
    this.modalCancelBtn.addEventListener('click', () => this.closeUploadModal());
    this.modalSaveBtn.addEventListener('click', () => this.saveModalAsset());

    this.btnExportZip.addEventListener('click', () => this.exportVaultZip());
    this.btnResetDefaults.addEventListener('click', () => {
      if (confirm('Restore default Maison emblems and sample assets? Existing changes will be reset.')) {
        this.seedDefaults();
        this.selectedAssetId = null;
        this.closeInspector();
        this.render();
        this.showToast('Restored default Maison emblems.');
      }
    });

    // Modal file selection
    this.modalFileInput.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (file) this.processCandidateFile(file);
    });

    // Global background switcher for inspector
    window.setInspectorBg = (type) => {
      this.inspPreviewBox.className = 'inspector-preview-box';
      if (type === 'velvet') this.inspPreviewBox.classList.add('velvet');
      else if (type === 'checker') this.inspPreviewBox.classList.add('checker');
      else if (type === 'white') this.inspPreviewBox.style.background = '#ffffff';
      else this.inspPreviewBox.style.background = '';
    };
  }

  setupDropzone() {
    const dropzone = this.damDropzone;
    const fileInput = this.damFileInput;

    dropzone.addEventListener('click', () => fileInput.click());

    ['dragenter', 'dragover'].forEach(eventName => {
      dropzone.addEventListener(eventName, (e) => {
        e.preventDefault();
        e.stopPropagation();
        dropzone.classList.add('dragover');
      });
    });

    ['dragleave', 'drop'].forEach(eventName => {
      dropzone.addEventListener(eventName, (e) => {
        e.preventDefault();
        e.stopPropagation();
        dropzone.classList.remove('dragover');
      });
    });

    dropzone.addEventListener('drop', (e) => {
      const files = e.dataTransfer.files;
      if (files && files.length > 0) {
        this.handleDroppedFiles(files);
      }
    });

    fileInput.addEventListener('change', (e) => {
      const files = e.target.files;
      if (files && files.length > 0) {
        this.handleDroppedFiles(files);
      }
    });
  }

  // Handle drag-dropped multiple files
  async handleDroppedFiles(files) {
    if (files.length === 1) {
      // Open modal with this file pre-populated for rich metadata input
      this.openUploadModal();
      this.processCandidateFile(files[0]);
    } else {
      // Batch register
      let count = 0;
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        if (!file.type.startsWith('image/') && !file.name.endsWith('.svg')) continue;
        await this.addFileDirectly(file);
        count++;
      }
      this.saveAssets();
      this.render();
      this.showToast(`Successfully deposited ${count} assets into Maison Vault.`);
    }
  }

  // Directly read file metadata and add to assets
  addFileDirectly(file) {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const dataUrl = e.target.result;
        const img = new Image();
        img.onload = () => {
          const isSvg = file.name.endsWith('.svg') || file.type.includes('svg');
          const format = isSvg ? 'SVG / Vector' : file.type.split('/')[1]?.toUpperCase() || 'Raster';
          const title = file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ');

          // Detect category from filename keywords
          let category = 'Master Logos';
          const lowerName = file.name.toLowerCase();
          if (lowerName.includes('mono') || lowerName.includes('cipher')) category = 'Monograms';
          else if (lowerName.includes('die') || lowerName.includes('pack') || lowerName.includes('box')) category = 'Packaging Dies';
          else if (lowerName.includes('campaign') || lowerName.includes('shoot') || lowerName.includes('photo')) category = 'Campaign Imagery';
          else if (lowerName.includes('font') || lowerName.includes('type')) category = 'Typography';
          else if (lowerName.includes('press') || lowerName.includes('kit') || lowerName.includes('media')) category = 'Press Kits';

          const newAsset = {
            id: 'asset_' + Date.now() + '_' + Math.random().toString(36).substr(2, 6),
            title: title.charAt(0).toUpperCase() + title.slice(1),
            category: category,
            fileName: file.name,
            format: format,
            mimeType: file.type || 'image/png',
            width: img.naturalWidth || 800,
            height: img.naturalHeight || 800,
            aspectRatio: getAspectRatio(img.naturalWidth, img.naturalHeight),
            fileSize: file.size,
            colorProfile: isSvg ? 'Gold Foil' : 'sRGB',
            usage: 'Maison Digital & Brand Asset',
            tags: ['upload', category.toLowerCase().replace(' ', '-')],
            createdAt: new Date().toISOString(),
            dataUrl: dataUrl
          };

          this.assets.unshift(newAsset);
          resolve();
        };
        img.src = dataUrl;
      };
      reader.readAsDataURL(file);
    });
  }

  // Modal file pre-processing
  processCandidateFile(file) {
    this.modalFileCandidate = null;
    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target.result;
      const img = new Image();
      img.onload = () => {
        const isSvg = file.name.endsWith('.svg') || file.type.includes('svg');
        const format = isSvg ? 'SVG / Vector' : file.type.split('/')[1]?.toUpperCase() || 'Raster';
        const cleanName = file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ');

        this.modalFileCandidate = {
          file,
          dataUrl,
          width: img.naturalWidth || 800,
          height: img.naturalHeight || 800,
          format,
          mimeType: file.type || 'image/png'
        };

        this.modalPreviewImg.src = dataUrl;
        this.modalPreviewZone.style.display = 'flex';
        if (!this.modalTitleInput.value) {
          this.modalTitleInput.value = cleanName.charAt(0).toUpperCase() + cleanName.slice(1);
        }
      };
      img.src = dataUrl;
    };
    reader.readAsDataURL(file);
  }

  openUploadModal() {
    this.modalFileInput.value = '';
    this.modalTitleInput.value = '';
    this.modalPreviewZone.style.display = 'none';
    this.modalPreviewImg.src = '';
    this.modalFileCandidate = null;
    this.uploadModal.classList.add('open');
  }

  closeUploadModal() {
    this.uploadModal.classList.remove('open');
  }

  saveModalAsset() {
    if (!this.modalFileCandidate) {
      alert('Please select an asset file to upload.');
      return;
    }
    const title = this.modalTitleInput.value.trim() || 'Untitled Maison Asset';
    const category = this.modalCategorySelect.value;
    const colorProfile = this.modalColorSelect.value;
    const usage = this.modalUsageInput.value.trim() || 'Standard Maison Identity';
    const rawTags = this.modalTagsInput.value.split(',').map(t => t.trim()).filter(Boolean);

    const asset = {
      id: 'asset_' + Date.now() + '_' + Math.random().toString(36).substr(2, 6),
      title: title,
      category: category,
      fileName: this.modalFileCandidate.file.name,
      format: this.modalFileCandidate.format,
      mimeType: this.modalFileCandidate.mimeType,
      width: this.modalFileCandidate.width,
      height: this.modalFileCandidate.height,
      aspectRatio: getAspectRatio(this.modalFileCandidate.width, this.modalFileCandidate.height),
      fileSize: this.modalFileCandidate.file.size,
      colorProfile: colorProfile,
      usage: usage,
      tags: rawTags.length > 0 ? rawTags : ['maison', category.toLowerCase()],
      createdAt: new Date().toISOString(),
      dataUrl: this.modalFileCandidate.dataUrl
    };

    this.assets.unshift(asset);
    this.saveAssets();
    this.closeUploadModal();
    this.selectAsset(asset.id);
    this.render();
    this.showToast(`Asset "${title}" deposited into vault.`);
  }

  // Filter & Sort
  getFilteredAssets() {
    let list = [...this.assets];

    // Category filter
    if (this.currentCategory !== 'all') {
      list = list.filter(a => a.category === this.currentCategory);
    }

    // Search query
    if (this.searchQuery) {
      list = list.filter(a => {
        const inTitle = a.title.toLowerCase().includes(this.searchQuery);
        const inCategory = a.category.toLowerCase().includes(this.searchQuery);
        const inUsage = (a.usage || '').toLowerCase().includes(this.searchQuery);
        const inFormat = (a.format || '').toLowerCase().includes(this.searchQuery);
        const inTags = (a.tags || []).some(t => t.toLowerCase().includes(this.searchQuery));
        return inTitle || inCategory || inUsage || inFormat || inTags;
      });
    }

    // Sort
    if (this.sortBy === 'newest') {
      list.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    } else if (this.sortBy === 'oldest') {
      list.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
    } else if (this.sortBy === 'name') {
      list.sort((a, b) => a.title.localeCompare(b.title));
    } else if (this.sortBy === 'size') {
      list.sort((a, b) => (b.fileSize || 0) - (a.fileSize || 0));
    }

    return list;
  }

  // Update Statistics & Counts
  updateStats() {
    this.statTotalCount.textContent = this.assets.length;
    
    const totalBytes = this.assets.reduce((sum, a) => sum + (a.fileSize || 0), 0);
    this.statVaultSize.textContent = formatBytes(totalBytes);

    const activeCategories = new Set(this.assets.map(a => a.category)).size;
    this.statCategoriesActive.textContent = `${activeCategories}/6`;

    const vectorCount = this.assets.filter(a => (a.format || '').includes('SVG') || (a.fileName || '').endsWith('.svg')).length;
    this.statVectorCount.textContent = vectorCount;

    // Update Category Pills count
    const countAll = document.getElementById('count-all');
    if (countAll) countAll.textContent = this.assets.length;

    const catMapping = {
      'Master Logos': 'count-logos',
      'Monograms': 'count-monograms',
      'Packaging Dies': 'count-dies',
      'Campaign Imagery': 'count-campaign',
      'Typography': 'count-typography',
      'Press Kits': 'count-press'
    };

    Object.entries(catMapping).forEach(([catName, elemId]) => {
      const el = document.getElementById(elemId);
      if (el) {
        const count = this.assets.filter(a => a.category === catName).length;
        el.textContent = count;
      }
    });
  }

  // Main Render Loop
  render() {
    this.updateStats();
    const filtered = this.getFilteredAssets();

    if (filtered.length === 0) {
      this.gridContainer.innerHTML = '';
      this.listContainer.innerHTML = '';
      this.emptyState.style.display = 'block';
      return;
    }

    this.emptyState.style.display = 'none';

    // Render Grid Cards
    this.gridContainer.innerHTML = filtered.map(asset => {
      const isSelected = asset.id === this.selectedAssetId;
      return `
        <div class="asset-card ${isSelected ? 'selected' : ''}" data-id="${asset.id}">
          <div class="asset-thumbnail-container">
            <div class="asset-thumb-pattern"></div>
            <span class="asset-card-category-badge">${asset.category}</span>
            <span class="asset-card-format-badge">${(asset.format || 'IMG').split(' ')[0]}</span>
            <img class="asset-img-preview" src="${asset.dataUrl}" alt="${asset.title}" loading="lazy">
          </div>
          <div class="asset-info">
            <div class="asset-title" title="${asset.title}">${asset.title}</div>
            <div class="asset-meta-row">
              <span>${asset.width} × ${asset.height} px</span>
              <span>${formatBytes(asset.fileSize)}</span>
            </div>
            <div class="asset-card-actions">
              <button class="btn-card-action btn-card-inspect" data-id="${asset.id}">
                <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
                Inspect
              </button>
              <button class="btn-card-action btn-card-copy" data-id="${asset.id}" title="Copy Data URL">
                <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
                Copy
              </button>
              <button class="btn-card-action btn-card-download" data-id="${asset.id}" title="Download File">
                <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
              </button>
            </div>
          </div>
        </div>
      `;
    }).join('');

    // Render List Items
    this.listContainer.innerHTML = filtered.map(asset => {
      return `
        <div class="asset-list-item" data-id="${asset.id}">
          <div style="display: flex; align-items: center; gap: 1rem; flex: 1; min-width: 0;">
            <div class="asset-list-thumb">
              <img src="${asset.dataUrl}" alt="${asset.title}">
            </div>
            <div style="min-width: 0;">
              <div style="font-weight: 700; color: var(--text-primary); white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${asset.title}</div>
              <div style="font-size: 0.75rem; color: var(--text-secondary); display: flex; gap: 0.75rem;">
                <span style="color: var(--gold-light); font-weight: 600;">${asset.category}</span>
                <span>${asset.width} × ${asset.height} px</span>
                <span>${formatBytes(asset.fileSize)}</span>
              </div>
            </div>
          </div>
          <div style="display: flex; align-items: center; gap: 0.5rem;">
            <span class="badge" style="font-size: 0.7rem;">${(asset.format || 'IMG').split(' ')[0]}</span>
            <button class="btn-card-action btn-card-inspect" data-id="${asset.id}">Inspect</button>
            <button class="btn-card-action btn-card-download" data-id="${asset.id}">Download</button>
          </div>
        </div>
      `;
    }).join('');

    // Bind item click listeners
    const attachListeners = (container) => {
      container.querySelectorAll('[data-id]').forEach(elem => {
        elem.addEventListener('click', (e) => {
          const id = elem.dataset.id;
          if (e.target.closest('.btn-card-copy')) {
            e.stopPropagation();
            this.copyAssetDataUrl(id);
          } else if (e.target.closest('.btn-card-download')) {
            e.stopPropagation();
            this.downloadAssetById(id);
          } else {
            this.selectAsset(id);
          }
        });
      });
    };

    attachListeners(this.gridContainer);
    attachListeners(this.listContainer);

    // If an asset was previously selected, ensure inspector is updated
    if (this.selectedAssetId) {
      const exists = this.assets.find(a => a.id === this.selectedAssetId);
      if (exists) {
        this.renderInspector(exists);
      } else {
        this.closeInspector();
      }
    }
  }

  // Select asset & show inspector
  selectAsset(id) {
    const asset = this.assets.find(a => a.id === id);
    if (!asset) return;

    this.selectedAssetId = id;
    this.renderInspector(asset);

    // Update selected class in DOM
    document.querySelectorAll('.asset-card').forEach(c => {
      c.classList.toggle('selected', c.dataset.id === id);
    });

    this.inspectorPanel.style.display = 'flex';
    this.workspaceLayout.classList.add('inspector-open');

    // Scroll into view on mobile
    if (window.innerWidth < 1100) {
      this.inspectorPanel.scrollIntoView({ behavior: 'smooth' });
    }
  }

  closeInspector() {
    this.selectedAssetId = null;
    this.inspectorPanel.style.display = 'none';
    this.workspaceLayout.classList.remove('inspector-open');
    document.querySelectorAll('.asset-card').forEach(c => c.classList.remove('selected'));
  }

  renderInspector(asset) {
    this.inspImg.src = asset.dataUrl;
    this.inspTitle.textContent = asset.title;
    this.inspCategory.textContent = asset.category;
    this.inspDimensions.textContent = `${asset.width} × ${asset.height} px`;
    this.inspRatio.textContent = asset.aspectRatio || getAspectRatio(asset.width, asset.height);
    this.inspFormat.textContent = asset.format || 'Raster';
    this.inspSize.textContent = formatBytes(asset.fileSize);
    this.inspUsage.textContent = asset.usage || 'General Maison Identity';
    this.inspId.textContent = asset.id;

    // Color profile badge
    const colorProfile = asset.colorProfile || 'Gold Foil';
    this.inspColorBadge.textContent = colorProfile;
    this.inspColorBadge.className = 'color-profile-badge';
    if (colorProfile.includes('Gold')) this.inspColorBadge.classList.add('color-gold-foil');
    else if (colorProfile.includes('P3')) this.inspColorBadge.classList.add('color-display-p3');
    else if (colorProfile.includes('sRGB')) this.inspColorBadge.classList.add('color-srgb');
    else if (colorProfile.includes('CMYK')) this.inspColorBadge.classList.add('color-cmyk');
    else this.inspColorBadge.classList.add('color-gold-foil');
  }

  // Copy Data URL
  copyAssetDataUrl(id) {
    const asset = this.assets.find(a => a.id === id);
    if (!asset) return;
    navigator.clipboard.writeText(asset.dataUrl).then(() => {
      this.showToast(`Data URL for "${asset.title}" copied to clipboard.`);
    }).catch(err => {
      console.error(err);
      this.showToast('Failed to copy Data URL.', true);
    });
  }

  copySelectedDataUrl() {
    if (this.selectedAssetId) {
      this.copyAssetDataUrl(this.selectedAssetId);
    }
  }

  // Download individual asset
  downloadAssetById(id) {
    const asset = this.assets.find(a => a.id === id);
    if (!asset) return;

    let filename = asset.fileName || `${asset.title.toLowerCase().replace(/\s+/g, '-')}.png`;
    if (!filename.includes('.')) {
      filename += asset.format && asset.format.includes('SVG') ? '.svg' : '.png';
    }

    const a = document.createElement('a');
    a.href = asset.dataUrl;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);

    this.showToast(`Downloaded "${filename}".`);
  }

  downloadSelectedAsset() {
    if (this.selectedAssetId) {
      this.downloadAssetById(this.selectedAssetId);
    }
  }

  // Delete asset
  deleteSelectedAsset() {
    if (!this.selectedAssetId) return;
    const asset = this.assets.find(a => a.id === this.selectedAssetId);
    if (!asset) return;

    if (confirm(`Remove asset "${asset.title}" from the Maison Vault?`)) {
      this.assets = this.assets.filter(a => a.id !== this.selectedAssetId);
      this.saveAssets();
      this.closeInspector();
      this.render();
      this.showToast(`Removed "${asset.title}" from vault.`);
    }
  }

  // Structured ZIP Archive Export using JSZip
  async exportVaultZip() {
    if (!window.JSZip) {
      alert('JSZip library is not loaded. Please ensure ../../assets/lib/jszip.min.js is accessible.');
      return;
    }

    this.showToast('Compiling structured Maison brand archive ZIP...');
    const zip = new window.JSZip();

    // Create Category Folders
    const folderLogos = zip.folder('Master_Logos');
    const folderMonograms = zip.folder('Monograms');
    const folderPackaging = zip.folder('Packaging_Dies');
    const folderCampaign = zip.folder('Campaign_Imagery');
    const folderTypography = zip.folder('Typography');
    const folderPress = zip.folder('Press_Kits');

    const folderMap = {
      'Master Logos': folderLogos,
      'Monograms': folderMonograms,
      'Packaging Dies': folderPackaging,
      'Campaign Imagery': folderCampaign,
      'Typography': folderTypography,
      'Press Kits': folderPress
    };

    // Add each asset to its corresponding folder
    this.assets.forEach(asset => {
      const folder = folderMap[asset.category] || folderLogos;
      let filename = asset.fileName || `${asset.title.toLowerCase().replace(/\s+/g, '_')}`;
      if (!filename.includes('.')) {
        filename += (asset.format && asset.format.includes('SVG')) ? '.svg' : '.png';
      }

      // Check if dataUrl is Base64 or plain SVG text
      const dataUrl = asset.dataUrl || '';
      if (dataUrl.startsWith('data:image/svg+xml;charset=utf-8,')) {
        const svgContent = decodeURIComponent(dataUrl.replace('data:image/svg+xml;charset=utf-8,', ''));
        folder.file(filename, svgContent);
      } else if (dataUrl.includes(';base64,')) {
        const base64Data = dataUrl.split(';base64,')[1];
        folder.file(filename, base64Data, { base64: true });
      } else if (dataUrl.startsWith('data:image/svg+xml,')) {
        const svgContent = decodeURIComponent(dataUrl.replace('data:image/svg+xml,', ''));
        folder.file(filename, svgContent);
      } else {
        folder.file(filename, dataUrl);
      }
    });

    // Add Brand_Vault_Manifest.json
    const manifest = {
      maison: "Maison Haute Joaillerie & Horlogerie",
      exportedAt: new Date().toISOString(),
      generator: "Maison Brand Asset Manager (DAM Vault)",
      totalAssets: this.assets.length,
      categories: CATEGORIES.reduce((acc, cat) => {
        acc[cat] = this.assets.filter(a => a.category === cat).length;
        return acc;
      }, {}),
      assets: this.assets.map(a => ({
        id: a.id,
        title: a.title,
        category: a.category,
        fileName: a.fileName,
        dimensions: `${a.width}x${a.height}`,
        aspectRatio: a.aspectRatio,
        format: a.format,
        colorProfile: a.colorProfile,
        usage: a.usage,
        tags: a.tags
      }))
    };
    zip.file('Brand_Vault_Manifest.json', JSON.stringify(manifest, null, 2));

    // Add Brand_Guidelines_ReadMe.txt
    const readme = `========================================================================
MAISON BRAND IDENTITY VAULT & DIGITAL ASSET REPOSITORY
========================================================================
Exported: ${new Date().toUTCString()}
Total Registered Brand Assets: ${this.assets.length}

DIRECTORIES INCLUDED:
------------------------------------------------------------------------
1. Master_Logos/     : Primary vector marks, heraldic crests, and house seals.
2. Monograms/        : Interlocking ciphers, jacquard patterns, hardware stamps.
3. Packaging_Dies/   : Rigid box dielines, foil stamping dies, ribbon specs.
4. Campaign_Imagery/ : High-res editorial hero photography and lookbook keys.
5. Typography/       : House type specimens, bespoke wordmark treatments.
6. Press_Kits/       : Media assets, approved editorial brand packs.

USAGE AND REPRODUCTION PROTOCOL:
- Never distort, rotate, or alter vector emblem proportions.
- Gold Foil elements must follow Pantone 871C metallic spot specification.
- Debossed dies must adhere to specified minimum clearance depths (1.2mm).
- For further brand compliance queries, consult the Maison Creative Direction.

CONFIDENTIAL & PROPRIETARY © ${new Date().getFullYear()} ALL IN ONE MAISON.
`;
    zip.file('Brand_Guidelines_ReadMe.txt', readme);

    try {
      const content = await zip.generateAsync({ type: 'blob' });
      const a = document.createElement('a');
      const dateStr = new Date().toISOString().slice(0, 10);
      a.href = URL.createObjectURL(content);
      a.download = `Maison_Brand_Vault_Archive_${dateStr}.zip`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      setTimeout(() => URL.revokeObjectURL(a.href), 1000);
      this.showToast('Brand Vault ZIP Archive generated and downloaded!');
    } catch (err) {
      console.error('Failed generating zip archive', err);
      this.showToast('Error generating ZIP archive.', true);
    }
  }

  // Toast feedback
  showToast(message, isError = false) {
    if (!this.damToast) return;
    this.toastMessage.textContent = message;
    if (isError) {
      this.damToast.style.borderColor = 'var(--error)';
    } else {
      this.damToast.style.borderColor = 'var(--gold-primary)';
    }
    this.damToast.classList.add('show');
    clearTimeout(this.toastTimeout);
    this.toastTimeout = setTimeout(() => {
      this.damToast.classList.remove('show');
    }, 3500);
  }
}

// Initialize on DOM Ready
document.addEventListener('DOMContentLoaded', () => {
  window.brandAssetManager = new BrandAssetManager();
});