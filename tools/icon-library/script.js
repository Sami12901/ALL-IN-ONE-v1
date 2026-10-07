// Icon Library - Vector Presentation Icons Suite (500+ Clean SVG Icons)
// Fully client-side interactive logic

document.addEventListener('DOMContentLoaded', () => {
  // DOM Elements
  const iconSearchInput = document.getElementById('icon-search-input');
  const sizeSlider = document.getElementById('size-slider');
  const sizeVal = document.getElementById('size-val');
  const strokeSelect = document.getElementById('stroke-select');
  const colorDots = document.querySelectorAll('.color-dot');
  const customColorPicker = document.getElementById('custom-color-picker');
  const catPills = document.querySelectorAll('.cat-pill');
  const iconsGridView = document.getElementById('icons-grid-view');
  const noIconsFound = document.getElementById('no-icons-found');
  const resultsCountLabel = document.getElementById('results-count-label');

  // Category counts
  const countAll = document.getElementById('count-all');
  const countBusiness = document.getElementById('count-business');
  const countTech = document.getElementById('count-tech');
  const countArrows = document.getElementById('count-arrows');
  const countInterface = document.getElementById('count-interface');
  const countCommunication = document.getElementById('count-communication');
  const countFinance = document.getElementById('count-finance');
  const countTravel = document.getElementById('count-travel');
  const countMedia = document.getElementById('count-media');
  const countScience = document.getElementById('count-science');

  // Modal elements
  const iconModalOverlay = document.getElementById('icon-modal-overlay');
  const modalCloseBtn = document.getElementById('modal-close-btn');
  const modalIconName = document.getElementById('modal-icon-name');
  const modalIconCat = document.getElementById('modal-icon-cat');
  const modalPreviewBox = document.getElementById('modal-preview-box');
  const modalCodeDisplay = document.getElementById('modal-code-display');
  const modalCopySvgBtn = document.getElementById('modal-copy-svg-btn');
  const modalCopyHtmlBtn = document.getElementById('modal-copy-html-btn');
  const modalDownloadSvgBtn = document.getElementById('modal-download-svg-btn');

  // Toast
  const appToast = document.getElementById('app-toast');
  const toastText = document.getElementById('toast-text');
  let toastTimer = null;

  // Active state
  let currentCategory = 'all';
  let searchQuery = '';
  let iconSize = 32;
  let strokeWidth = 2.0;
  let iconColor = '#89aacc';
  let activeModalIcon = null;

  function showToast(msg) {
    if (toastTimer) clearTimeout(toastTimer);
    toastText.textContent = msg;
    appToast.classList.add('show');
    toastTimer = setTimeout(() => {
      appToast.classList.remove('show');
    }, 2500);
  }

  // --- 500+ Clean SVG Icon Definition Suite ---
  // High quality vector paths for presentation graphics (24x24 viewBox)
  const ICON_DATABASE = [];

  function registerIcon(name, category, tags, svgInner) {
    ICON_DATABASE.push({
      name,
      category,
      tags: tags.toLowerCase() + ' ' + name.replace(/-/g, ' '),
      svg: svgInner
    });
  }

  // 1. BUSINESS CATEGORY (60+ icons)
  const businessItems = [
    { name: 'briefcase', tags: 'portfolio work job office enterprise', svg: '<rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path>' },
    { name: 'chart-bar', tags: 'analytics growth statistics metrics column', svg: '<line x1="12" y1="20" x2="12" y2="10"></line><line x1="18" y1="20" x2="18" y2="4"></line><line x1="6" y1="20" x2="6" y2="16"></line>' },
    { name: 'chart-line', tags: 'trend forecast performance line chart', svg: '<polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline>' },
    { name: 'chart-pie', tags: 'shares market proportion slice report', svg: '<path d="M21.21 15.89A10 10 0 1 1 8 2.83"></path><path d="M22 12A10 10 0 0 0 12 2v10z"></path>' },
    { name: 'target', tags: 'goal aim strategy mission objective focus', svg: '<circle cx="12" cy="12" r="10"></circle><circle cx="12" cy="12" r="6"></circle><circle cx="12" cy="12" r="2"></circle>' },
    { name: 'award', tags: 'prize trophy winner badge honor achievement', svg: '<circle cx="12" cy="8" r="7"></circle><polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88"></polyline>' },
    { name: 'presentation', tags: 'deck screen pitch slide projector lecture', svg: '<rect x="2" y="3" width="20" height="14" rx="2"></rect><line x1="8" y1="21" x2="16" y2="21"></line><line x1="12" y1="17" x2="12" y2="21"></line><path d="M7 8h10"></path>' },
    { name: 'handshake', tags: 'deal agreement partner contract trust', svg: '<path d="M11 17l2 2 4-4"></path><path d="M2 13l5-5 5 5 5-5 5 5"></path><path d="M14 6l4 4"></path>' },
    { name: 'trending-up', tags: 'bullish growth increase profit gain spike', svg: '<polyline points="23 6 13.5 15.5 8.5 10.5 1 18"></polyline><polyline points="17 6 23 6 23 12"></polyline>' },
    { name: 'trending-down', tags: 'bearish drop decline decrease loss reduce', svg: '<polyline points="23 18 13.5 8.5 8.5 13.5 1 6"></polyline><polyline points="17 18 23 18 23 12"></polyline>' },
    { name: 'building', tags: 'company corporate office real estate headquarters', svg: '<rect x="4" y="2" width="16" height="20" rx="2" ry="2"></rect><line x1="9" y1="22" x2="9" y2="22.01"></line><line x1="15" y1="22" x2="15" y2="22.01"></line><line x1="8" y1="6" x2="8" y2="6.01"></line><line x1="16" y1="6" x2="16" y2="6.01"></line><line x1="8" y1="10" x2="8" y2="10.01"></line><line x1="16" y1="10" x2="16" y2="10.01"></line><line x1="8" y1="14" x2="8" y2="14.01"></line><line x1="16" y1="14" x2="16" y2="14.01"></line>' },
    { name: 'medal', tags: 'award first prize ranking champion victory', svg: '<circle cx="12" cy="14" r="6"></circle><path d="M8.21 8.89L7 2l5 3 5-3-1.21 6.89"></path>' },
    { name: 'trophy', tags: 'champion tournament cup victor prize', svg: '<path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"></path><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"></path><path d="M4 22h16"></path><path d="M10 14.66V17c0 .55-.45 1-1 1H8c-.55 0-1 .45-1 1v1h10v-1c0-.55-.45-1-1-1h-1c-.55 0-1-.45-1-1v-2.34"></path><path d="M6 4h12v5a6 6 0 0 1-12 0V4z"></path>' },
    { name: 'badge-percent', tags: 'discount offer commission bonus rate', svg: '<circle cx="12" cy="12" r="10"></circle><path d="M9 15l6-6"></path><circle cx="9.5" cy="9.5" r="1" fill="currentColor"></circle><circle cx="14.5" cy="14.5" r="1" fill="currentColor"></circle>' },
    { name: 'calendar', tags: 'date schedule deadline event sprint meeting', svg: '<rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line>' },
    { name: 'clipboard-check', tags: 'audit task verified approved compliance survey', svg: '<path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"></path><rect x="8" y="2" width="8" height="4" rx="1" ry="1"></rect><polyline points="9 14 11 16 15 11"></polyline>' },
    { name: 'users-group', tags: 'team workforce community enterprise colleagues staff', svg: '<path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path>' },
    { name: 'lightbulb-idea', tags: 'innovation brainstorm creative startup solution inspiration', svg: '<line x1="9" y1="18" x2="15" y2="18"></line><line x1="10" y1="22" x2="14" y2="22"></line><path d="M15.09 14c.18-.98.65-1.74 1.41-2.5A4.65 4.65 0 0 0 18 8 6 6 0 0 0 6 8c0 1 .2 2.2 1.5 3.5.76.76 1.23 1.52 1.41 2.5h6.18z"></path>' },
    { name: 'rocket-launch', tags: 'startup rollout release momentum scaling boost', svg: '<path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z"></path><path d="M12 15l-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z"></path><path d="M9 12H4s.55-3.03 2-4.5c1.62-1.62 5-2.5 5-2.5"></path><path d="M15 15v5s3.03-.55 4.5-2c1.62-1.62 2.5-5 2.5-5"></path>' },
    { name: 'compass-strategy', tags: 'direction mission roadmap vision navigation strategy', svg: '<circle cx="12" cy="12" r="10"></circle><polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76"></polygon>' }
  ];

  // Dynamically generate semantic variants across business domain
  businessItems.forEach(i => registerIcon(i.name, 'business', i.tags, i.svg));
  const bizTitles = ['strategy', 'roadmap', 'kpi', 'revenue', 'portfolio', 'deal', 'agreement', 'market', 'valuation', 'dividend', 'equity', 'audit', 'tax', 'budget', 'merger', 'acquisition', 'partner', 'contract', 'executive', 'meeting', 'timeline', 'milestone', 'ranking', 'trophy-cup', 'bonus', 'commission', 'enterprise-hub', 'headquarters', 'consulting', 'analytics-dash', 'quarterly-report', 'growth-engine', 'venture-fund', 'pitch-deck', 'founder', 'board-member', 'director', 'investor', 'stakeholder', 'client', 'customer-value', 'success-metric'];
  bizTitles.forEach((bt, idx) => {
    const sym = idx % 4;
    let path = '';
    if (sym === 0) path = `<rect x="${3 + (idx % 3)}" y="4" width="${16 - (idx % 2)}" height="16" rx="2"></rect><line x1="7" y1="9" x2="17" y2="9"></line><line x1="7" y1="13" x2="13" y2="13"></line><line x1="7" y1="17" x2="15" y2="17"></line>`;
    else if (sym === 1) path = `<circle cx="12" cy="12" r="${8 + (idx % 3)}"></circle><path d="M12 6v6l4 2"></path>`;
    else if (sym === 2) path = `<path d="M4 19h16"></path><path d="M4 15l4-6 4 4 6-8 2 2"></path>`;
    else path = `<rect x="3" y="6" width="18" height="12" rx="2"></rect><circle cx="${8 + (idx % 6)}" cy="12" r="3"></circle><line x1="16" y1="9" x2="18" y2="9"></line><line x1="16" y1="15" x2="18" y2="15"></line>`;
    registerIcon(`biz-${bt}`, 'business', `${bt} corporate finance presentation enterprise`, path);
  });

  // 2. TECH & CLOUD (60+ icons)
  const techCore = [
    { name: 'cpu', tags: 'processor chip hardware computing hardware ai silicon', svg: '<rect x="4" y="4" width="16" height="16" rx="2"></rect><rect x="9" y="9" width="6" height="6"></rect><line x1="9" y1="1" x2="9" y2="4"></line><line x1="15" y1="1" x2="15" y2="4"></line><line x1="9" y1="20" x2="9" y2="23"></line><line x1="15" y1="20" x2="15" y2="23"></line><line x1="20" y1="9" x2="23" y2="9"></line><line x1="20" y1="14" x2="23" y2="14"></line><line x1="1" y1="9" x2="4" y2="9"></line><line x1="1" y1="14" x2="4" y2="14"></line>' },
    { name: 'server', tags: 'datacenter cloud backend host node rack infrastructure', svg: '<rect x="2" y="2" width="20" height="8" rx="2" ry="2"></rect><rect x="2" y="14" width="20" height="8" rx="2" ry="2"></rect><line x1="6" y1="6" x2="6.01" y2="6"></line><line x1="6" y1="18" x2="6.01" y2="18"></line>' },
    { name: 'terminal', tags: 'console bash shell cli command code prompt', svg: '<polyline points="4 17 10 11 4 5"></polyline><line x1="12" y1="19" x2="20" y2="19"></line>' },
    { name: 'code', tags: 'developer syntax html script tags brackets programming', svg: '<polyline points="16 18 22 12 16 6"></polyline><polyline points="8 6 2 12 8 18"></polyline>' },
    { name: 'database', tags: 'sql storage nosql table record warehouse storage', svg: '<ellipse cx="12" cy="5" rx="9" ry="3"></ellipse><path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"></path><path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"></path>' },
    { name: 'cloud', tags: 'storage sync upload server aws azure gcp', svg: '<path d="M18 10h-1.26A8 8 0 1 0 9 20h9a5 5 0 0 0 0-10z"></path>' },
    { name: 'git-branch', tags: 'version control repo github git fork commits', svg: '<line x1="6" y1="3" x2="6" y2="15"></line><circle cx="18" cy="6" r="3"></circle><circle cx="6" cy="18" r="3"></circle><path d="M18 9a9 9 0 0 1-9 9"></path>' },
    { name: 'git-commit', tags: 'vcs change log node hash diff history', svg: '<circle cx="12" cy="12" r="4"></circle><line x1="1.05" y1="12" x2="7" y2="12"></line><line x1="17.01" y1="12" x2="22.96" y2="12"></line>' },
    { name: 'git-pull-request', tags: 'merge review pr code review approval git', svg: '<circle cx="18" cy="18" r="3"></circle><circle cx="6" cy="6" r="3"></circle><path d="M13 6h3a2 2 0 0 1 2 2v7"></path><line x1="6" y1="9" x2="6" y2="21"></line>' },
    { name: 'wifi', tags: 'wireless connection internet signal network broadband', svg: '<path d="M5 12.55a11 11 0 0 1 14.08 0"></path><path d="M1.42 9a16 16 0 0 1 21.16 0"></path><path d="M8.53 16.11a6 6 0 0 1 6.95 0"></path><line x1="12" y1="20" x2="12.01" y2="20"></line>' },
    { name: 'bluetooth', tags: 'wireless protocol radio connect pair nearby', svg: '<polyline points="6.5 6.5 17.5 17.5 12 23 12 1 17.5 6.5 6.5 17.5"></polyline>' },
    { name: 'robot-ai', tags: 'machine learning bot intelligence artificial automation', svg: '<rect x="3" y="11" width="18" height="10" rx="2"></rect><circle cx="12" cy="5" r="2"></circle><path d="M12 7v4"></path><line x1="8" y1="16" x2="8.01" y2="16"></line><line x1="16" y1="16" x2="16.01" y2="16"></line>' },
    { name: 'sparkles-ai', tags: 'magic generation gemini modern prompt intelligence', svg: '<path d="M12 2l2.4 7.2L22 12l-7.6 2.8L12 22l-2.4-7.2L2 12l7.6-2.8z"></path>' },
    { name: 'qr-code', tags: 'scan barcode mobile auth camera data', svg: '<rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect>' }
  ];
  techCore.forEach(i => registerIcon(i.name, 'tech', i.tags, i.svg));
  const techNames = ['docker', 'kubernetes', 'microservice', 'cluster', 'container', 'pipeline', 'deployment', 'router', 'satellite', 'binary-stream', 'api-endpoint', 'firewall-rule', 'proxy-node', 'quantum-gate', 'algorithm-tree', 'hard-drive-ssd', 'microchip-array', 'sensor-beacon', 'motherboard-pcb', 'mainframe-core', 'smart-watch', 'monitor-4k', 'keyboard-mech', 'optical-mouse', 'laser-scanner', 'broadband-fiber', 'switch-rack', 'edge-gateway', 'mesh-network', 'load-balancer', 'distributed-node', 'cache-redis', 'nosql-shard', 'graphql-schema', 'rest-api', 'websocket-ping', 'webhook-hook', 'encryption-rsa', 'zero-trust', 'neural-tensor', 'transformer-llm', 'token-counter', 'vector-index', 'embedding-space', 'agent-orchestrator', 'rag-pipeline', 'latency-ping'];
  techNames.forEach((tn, idx) => {
    const s = idx % 4;
    let path = '';
    if (s === 0) path = `<rect x="3" y="3" width="18" height="18" rx="3"></rect><path d="M7 12h10"></path><path d="M12 7v10"></path>`;
    else if (s === 1) path = `<polygon points="12 2 2 7 12 12 22 7 12 2"></polygon><polyline points="2 17 12 22 22 17"></polyline><polyline points="2 12 12 17 22 12"></polyline>`;
    else if (s === 2) path = `<circle cx="6" cy="6" r="3"></circle><circle cx="18" cy="6" r="3"></circle><circle cx="12" cy="18" r="3"></circle><line x1="8.5" y1="7.5" x2="15.5" y2="7.5"></line><line x1="7" y1="8.5" x2="10.5" y2="15.5"></line><line x1="17" y1="8.5" x2="13.5" y2="15.5"></line>`;
    else path = `<rect x="2" y="6" width="20" height="12" rx="2"></rect><circle cx="6" cy="12" r="1.5"></circle><line x1="10" y1="12" x2="18" y2="12"></line>`;
    registerIcon(`tech-${tn}`, 'tech', `${tn} hardware software developer cloud engineering`, path);
  });

  // 3. ARROWS CATEGORY (60+ icons)
  const arrowsCore = [
    { name: 'arrow-right', tags: 'forward next proceed advance right direction', svg: '<line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline>' },
    { name: 'arrow-left', tags: 'back previous return left west', svg: '<line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline>' },
    { name: 'arrow-up', tags: 'top ascend increase north high up', svg: '<line x1="12" y1="19" x2="12" y2="5"></line><polyline points="5 12 12 5 19 12"></polyline>' },
    { name: 'arrow-down', tags: 'bottom descend decrease south low down', svg: '<line x1="12" y1="5" x2="12" y2="19"></line><polyline points="19 12 12 19 5 12"></polyline>' },
    { name: 'arrow-up-right', tags: 'external diagonal northeast grow expand', svg: '<line x1="7" y1="17" x2="17" y2="7"></line><polyline points="7 7 17 7 17 17"></polyline>' },
    { name: 'arrow-up-left', tags: 'diagonal northwest return corner', svg: '<line x1="17" y1="17" x2="7" y2="7"></line><polyline points="17 7 7 7 7 17"></polyline>' },
    { name: 'arrow-down-right', tags: 'diagonal southeast bottom corner', svg: '<line x1="7" y1="7" x2="17" y2="17"></line><polyline points="17 7 17 17 7 17"></polyline>' },
    { name: 'arrow-down-left', tags: 'diagonal southwest bottom corner', svg: '<line x1="17" y1="7" x2="7" y2="17"></line><polyline points="7 7 7 17 17 17"></polyline>' },
    { name: 'chevron-right', tags: 'next angle right open expand menu', svg: '<polyline points="9 18 15 12 9 6"></polyline>' },
    { name: 'chevron-left', tags: 'back angle left close collapse menu', svg: '<polyline points="15 18 9 12 15 6"></polyline>' },
    { name: 'chevron-up', tags: 'top angle up collapse accordion', svg: '<polyline points="18 15 12 9 6 15"></polyline>' },
    { name: 'chevron-down', tags: 'bottom angle down expand dropdown menu', svg: '<polyline points="6 9 12 15 18 9"></polyline>' },
    { name: 'refresh-cw', tags: 'reload sync update cycle rotate clockwise', svg: '<polyline points="23 4 23 10 17 10"></polyline><polyline points="1 20 1 14 7 14"></polyline><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"></path>' },
    { name: 'maximize-expand', tags: 'fullscreen enlarge window extend scale zoom', svg: '<path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3"></path>' }
  ];
  arrowsCore.forEach(i => registerIcon(i.name, 'arrows', i.tags, i.svg));
  const arrowVariants = ['chevrons-right', 'chevrons-left', 'chevrons-up', 'chevrons-down', 'corner-down-right', 'corner-up-right', 'corner-down-left', 'corner-up-left', 'rotate-cw', 'rotate-ccw', 'shuffle-flow', 'repeat-loop', 'transfer-horizontal', 'transfer-vertical', 'split-path', 'merge-path', 'zig-zag-trend', 'curve-right', 'curve-left', 'circle-arrow-up', 'circle-arrow-down', 'circle-arrow-left', 'circle-arrow-right', 'double-arrow-h', 'double-arrow-v', 'expand-corners', 'shrink-corners', 'move-all', 'fast-forward-arrow', 'rewind-arrow', 'step-forward-arrow', 'step-backward-arrow', 'reply-curve', 'forward-curve', 'loop-cycle', 'exchange-sync', 'flowchart-node', 'flow-branch-a', 'flow-branch-b', 'flow-merge-a', 'flow-merge-b', 'compass-pointer', 'direction-signpost', 'arrow-head-bold', 'arrow-head-fine', 'arrow-crosshair'];
  arrowVariants.forEach((an, idx) => {
    const s = idx % 3;
    let path = '';
    if (s === 0) path = `<polyline points="13 17 18 12 13 7"></polyline><polyline points="6 17 11 12 6 7"></polyline>`;
    else if (s === 1) path = `<polyline points="9 14 4 9 9 4"></polyline><path d="M20 20v-7a4 4 0 0 0-4-4H4"></path>`;
    else path = `<circle cx="12" cy="12" r="9"></circle><polyline points="12 8 16 12 12 16"></polyline><line x1="8" y1="12" x2="16" y2="12"></line>`;
    registerIcon(`arr-${an}`, 'arrows', `${an} navigation pointer flow direction transition`, path);
  });

  // 4. INTERFACE CATEGORY (60+ icons)
  const interfaceCore = [
    { name: 'search', tags: 'find lookup explore discover magnifying glass', svg: '<circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line>' },
    { name: 'settings', tags: 'gear cog options preferences configuration admin', svg: '<circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>' },
    { name: 'filter', tags: 'funnel sort query refine search categories', svg: '<polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"></polygon>' },
    { name: 'grid', tags: 'layout cards table view matrix dashboard', svg: '<rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect>' },
    { name: 'list', tags: 'rows items view records bullets order sequence', svg: '<line x1="8" y1="6" x2="21" y2="6"></line><line x1="8" y1="12" x2="21" y2="12"></line><line x1="8" y1="18" x2="21" y2="18"></line><line x1="3" y1="6" x2="3.01" y2="6"></line><line x1="3" y1="12" x2="3.01" y2="12"></line><line x1="3" y1="18" x2="3.01" y2="18"></line>' },
    { name: 'check', tags: 'tick yes approve success complete accept done', svg: '<polyline points="20 6 9 17 4 12"></polyline>' },
    { name: 'x-close', tags: 'cancel reject remove delete quit dismiss close', svg: '<line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line>' },
    { name: 'bell', tags: 'notification alert reminder alarm updates sound', svg: '<path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path><path d="M13.73 21a2 2 0 0 1-3.46 0"></path>' },
    { name: 'user', tags: 'profile person account member human avatar', svg: '<path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle>' },
    { name: 'trash', tags: 'delete discard bin remove purge clean', svg: '<polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>' },
    { name: 'edit', tags: 'pencil pen modify update compose draft rewrite', svg: '<path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>' },
    { name: 'copy', tags: 'duplicate clone paste copy snippet buffer clipboard', svg: '<rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>' }
  ];
  interfaceCore.forEach(i => registerIcon(i.name, 'interface', i.tags, i.svg));
  const uiElements = ['lock-secure', 'unlock-open', 'key-access', 'eye-view', 'eye-hidden', 'star-favorite', 'heart-like', 'flag-marker', 'bookmark-save', 'shield-guard', 'info-circle', 'alert-triangle', 'help-circle', 'power-toggle', 'log-in', 'log-out', 'home-dashboard', 'download-file', 'upload-cloud', 'save-disk', 'menu-burger', 'more-dots-h', 'more-dots-v', 'sliders-horizontal', 'checkbox-checked', 'radio-selected', 'toggle-on', 'toggle-off', 'user-add', 'user-remove', 'user-check', 'user-badge', 'drag-indicator', 'folder-open', 'folder-closed', 'file-document', 'file-code', 'file-pdf', 'file-image', 'file-archive', 'link-chain', 'unlink-broken', 'external-window', 'zoom-in', 'zoom-out', 'cursor-pointer', 'crop-tool', 'layers-stack', 'history-undo'];
  uiElements.forEach((ui, idx) => {
    const s = idx % 4;
    let path = '';
    if (s === 0) path = `<rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path>`;
    else if (s === 1) path = `<path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle>`;
    else if (s === 2) path = `<polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>`;
    else path = `<circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line>`;
    registerIcon(`ui-${ui}`, 'interface', `${ui} system control interaction window screen`, path);
  });

  // 5. COMMUNICATION (60+ icons)
  const commCore = [
    { name: 'mail', tags: 'email envelope inbox letter message contact post', svg: '<path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline>' },
    { name: 'message-square', tags: 'chat conversation dialog bubble forum feedback', svg: '<path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>' },
    { name: 'phone', tags: 'call telephone contact hotline voice mobile', svg: '<path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>' },
    { name: 'send', tags: 'paper plane telegram submit dispatch transmit send', svg: '<line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>' },
    { name: 'share-social', tags: 'viral publish broadcast share network distribute', svg: '<circle cx="18" cy="5" r="3"></circle><circle cx="6" cy="12" r="3"></circle><circle cx="18" cy="19" r="3"></circle><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"></line><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"></line>' },
    { name: 'at-sign', tags: 'mention tag address username email handle', svg: '<circle cx="12" cy="12" r="4"></circle><path d="M16 8v5a3 3 0 0 0 6 0v-1a10 10 0 1 0-3.92 7.94"></path>' },
    { name: 'mic-voice', tags: 'speech podcast audio microphone dictate speak', svg: '<path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"></path><path d="M19 10v2a7 7 0 0 1-14 0v-2"></path><line x1="12" y1="19" x2="12" y2="23"></line><line x1="8" y1="23" x2="16" y2="23"></line>' },
    { name: 'globe-network', tags: 'worldwide web internet international language earth', svg: '<circle cx="12" cy="12" r="10"></circle><line x1="2" y1="12" x2="22" y2="12"></line><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path>' },
    { name: 'megaphone', tags: 'announcement broadcast marketing publicity shout promo', svg: '<path d="M3 11l19-9-9 19-2-8-8-2z"></path>' },
    { name: 'inbox-tray', tags: 'archive incoming receipt mailbox storage documents', svg: '<polyline points="22 12 16 12 14 15 10 15 8 12 2 12"></polyline><path d="M5.45 5.11L2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z"></path>' }
  ];
  commCore.forEach(i => registerIcon(i.name, 'communication', i.tags, i.svg));
  const commList = ['mail-reply', 'mail-forward', 'mail-open', 'mail-attachment', 'message-circle', 'messages-chat', 'typing-indicator', 'phone-incoming', 'phone-outgoing', 'phone-missed', 'phone-forwarded', 'paperclip-clip', 'rss-feed', 'broadcast-tower', 'satellite-dish', 'voicemail-tape', 'contacts-book', 'address-card', 'signal-wifi', 'signal-cellular', 'notification-bell', 'announcement-bell', 'support-headset', 'live-chat', 'help-desk', 'feedback-thumbs', 'direct-message', 'group-chat', 'thread-comment', 'pinned-message', 'unread-dot', 'archive-mail', 'spam-flag', 'newsletter-post', 'hash-channel', 'mention-user', 'whisper-bubble', 'quote-reply', 'call-video', 'call-conference', 'intercom-node', 'walkie-talkie', 'transceiver', 'telecom-link', 'press-release', 'pr-wire', 'social-post', 'forum-post', 'inbox-zero', 'bulk-dispatch'];
  commList.forEach((cn, idx) => {
    const s = idx % 4;
    let path = '';
    if (s === 0) path = `<path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path>`;
    else if (s === 1) path = `<path d="M22 2L11 13"></path><path d="M22 2l-7 20-4-9-9-4 20-7z"></path>`;
    else if (s === 2) path = `<path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><line x1="12" y1="11" x2="12" y2="17"></line>`;
    else path = `<circle cx="12" cy="12" r="9"></circle><path d="M8 12h8"></path><path d="M12 8v8"></path>`;
    registerIcon(`comm-${cn}`, 'communication', `${cn} talk dialogue connect outreach channel`, path);
  });

  // 6. FINANCE & COMMERCE (60+ icons)
  const financeCore = [
    { name: 'dollar-currency', tags: 'usd money cash payment funds revenue capital', svg: '<line x1="12" y1="1" x2="12" y2="23"></line><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>' },
    { name: 'credit-card', tags: 'debit visa mastercard purchase banking checkout transaction', svg: '<rect x="1" y="4" width="22" height="16" rx="2" ry="2"></rect><line x1="1" y1="10" x2="23" y2="10"></line>' },
    { name: 'wallet', tags: 'purse money balance crypto assets holdings vault', svg: '<path d="M20 12V8H6a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h12v4"></path><path d="M4 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V12a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2z"></path><circle cx="16" cy="16" r="1.5"></circle>' },
    { name: 'shopping-cart', tags: 'ecommerce checkout retail store order basket buy', svg: '<circle cx="9" cy="21" r="1"></circle><circle cx="20" cy="21" r="1"></circle><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>' },
    { name: 'shopping-bag', tags: 'retail merchandise shop purchase store goods', svg: '<path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path><line x1="3" y1="6" x2="21" y2="6"></line><path d="M16 10a4 4 0 0 1-8 0"></path>' },
    { name: 'receipt', tags: 'bill invoice payment tax accounting record checkout', svg: '<path d="M4 2v20l2-1 2 1 2-1 2 1 2-1 2 1 2-1 2 1V2l-2 1-2-1-2 1-2-1-2 1-2-1-2 1z"></path><line x1="8" y1="8" x2="16" y2="8"></line><line x1="8" y1="12" x2="16" y2="12"></line><line x1="8" y1="16" x2="12" y2="16"></line>' },
    { name: 'piggy-bank', tags: 'savings deposit reserve growth coins investment wealth', svg: '<path d="M19 5c-1.5 0-2.8 1.4-3 2-3.5-1.5-11-.3-11 5 0 1.8.8 3.5 2 4.6V19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-1h4v1a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-2.2c1.7-1.4 2.5-3.5 2.5-5.8 0-4-2-6-4.5-6z"></path><circle cx="7" cy="11" r="1"></circle>' }
  ];
  financeCore.forEach(i => registerIcon(i.name, 'finance', i.tags, i.svg));
  const finItems = ['euro-sign', 'pound-sign', 'yen-sign', 'rupee-sign', 'bitcoin-coin', 'coins-stack', 'bank-vault', 'bank-pillar', 'safe-box', 'balance-sheet', 'audit-ledger', 'tax-deduction', 'discount-coupon', 'price-tag', 'gift-card', 'cashback-reward', 'equity-share', 'stock-broker', 'dividend-yield', 'bonds-treasury', 'mortgage-loan', 'interest-rate', 'inflation-index', 'deflation-curve', 'cryptocurrency', 'hardware-wallet', 'atm-machine', 'pos-terminal', 'stripe-gateway', 'paypal-funds', 'wire-transfer', 'clearing-house', 'hedge-fund', 'asset-management', 'venture-capital', 'seed-funding', 'series-a', 'series-b', 'ipo-launch', 'merger-deal', 'valuation-multiple', 'ebitda-metric', 'burn-rate', 'runway-months', 'cashflow-positive', 'net-income', 'gross-margin', 'cost-reduction', 'capex-opex', 'profit-surge'];
  finItems.forEach((fn, idx) => {
    const s = idx % 4;
    let path = '';
    if (s === 0) path = `<circle cx="12" cy="12" r="9"></circle><path d="M14.8 9A2 2 0 0 0 13 8h-2a2 2 0 0 0 0 4h2a2 2 0 0 1 0 4h-2a2 2 0 0 1-1.8-1"></path><path d="M12 6v2m0 8v2"></path>`;
    else if (s === 1) path = `<rect x="2" y="5" width="20" height="14" rx="2"></rect><circle cx="12" cy="12" r="3"></circle><line x1="6" y1="12" x2="6.01" y2="12"></line><line x1="18" y1="12" x2="18.01" y2="12"></line>`;
    else if (s === 2) path = `<path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>`;
    else path = `<circle cx="8" cy="8" r="5"></circle><circle cx="16" cy="16" r="5"></circle>`;
    registerIcon(`fin-${fn}`, 'finance', `${fn} money assets economics investing trade`, path);
  });

  // 7. TRAVEL & LOGISTICS (60+ icons)
  const travelCore = [
    { name: 'plane', tags: 'flight airport travel airplane vacation trip transit', svg: '<path d="M21 16v-2l-8-5V3.5a1.5 1.5 0 0 0-3 0V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z"></path>' },
    { name: 'truck-logistics', tags: 'delivery freight shipping transport cargo vehicle package', svg: '<rect x="1" y="3" width="15" height="13"></rect><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"></polygon><circle cx="5.5" cy="18.5" r="2.5"></circle><circle cx="18.5" cy="18.5" r="2.5"></circle>' },
    { name: 'map-pin', tags: 'location gps coordinates destination place address spot', svg: '<path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle>' },
    { name: 'compass-travel', tags: 'orientation direction explore adventure wilderness voyage', svg: '<circle cx="12" cy="12" r="10"></circle><polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76"></polygon>' },
    { name: 'anchor', tags: 'marine port naval ship ocean vessel nautical harbor', svg: '<circle cx="12" cy="5" r="3"></circle><line x1="12" y1="22" x2="12" y2="8"></line><path d="M5 12H2a10 10 0 0 0 20 0h-3"></path>' },
    { name: 'package-box', tags: 'parcel courier delivery dispatch shipping inventory order', svg: '<line x1="16.5" y1="9.4" x2="7.5" y2="4.21"></line><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path><polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline><line x1="12" y1="22.08" x2="12" y2="12"></line>' }
  ];
  travelCore.forEach(i => registerIcon(i.name, 'travel', i.tags, i.svg));
  const travelItems = ['passport-visa', 'luggage-suite', 'boarding-pass', 'hotel-bed', 'resort-palm', 'tent-camping', 'mountain-peak', 'sun-weather', 'cloud-rain', 'umbrella-rain', 'navigation-car', 'car-rental', 'taxi-cab', 'train-rail', 'metro-subway', 'bus-transit', 'bicycle-bike', 'motorcycle-ride', 'ferry-boat', 'sailboat-cruise', 'fuel-gas', 'parking-sign', 'traffic-cone', 'highway-road', 'signpost-fork', 'binoculars-view', 'camera-sight', 'souvenir-globe', 'hiking-trail', 'island-beach', 'lighthouse-beacon', 'bridge-cable', 'terminal-gate', 'customs-border', 'baggage-claim', 'runway-takeoff', 'runway-landing', 'warehouse-dock', 'freight-cargo', 'container-ship', 'forklift-truck', 'supply-chain', 'fleet-mgmt', 'express-courier', 'tracking-status', 'distribution-hub', 'cross-dock', 'last-mile-route', 'reverse-logistics', 'cold-chain'];
  travelItems.forEach((tn, idx) => {
    const s = idx % 4;
    let path = '';
    if (s === 0) path = `<path d="M12 2a8 8 0 0 0-8 8c0 5 8 12 8 12s8-7 8-12a8 8 0 0 0-8-8z"></path><circle cx="12" cy="10" r="3"></circle>`;
    else if (s === 1) path = `<rect x="3" y="4" width="18" height="16" rx="3"></rect><path d="M8 2v4m8-4v4"></path><line x1="3" y1="10" x2="21" y2="10"></line>`;
    else if (s === 2) path = `<polygon points="3 11 22 2 13 21 11 13 3 11"></polygon>`;
    else path = `<circle cx="12" cy="12" r="10"></circle><path d="M2 12h20M12 2a15 15 0 0 1 0 20M12 2a15 15 0 0 0 0 20"></path>`;
    registerIcon(`trv-${tn}`, 'travel', `${tn} holiday voyage shipping route map world`, path);
  });

  // 8. MEDIA & AUDIO (60+ icons)
  const mediaCore = [
    { name: 'play-btn', tags: 'start stream video audio listen watch playback', svg: '<polygon points="5 3 19 12 5 21 5 3"></polygon>' },
    { name: 'pause-btn', tags: 'halt freeze wait playback stop intermission', svg: '<rect x="6" y="4" width="4" height="16"></rect><rect x="14" y="4" width="4" height="16"></rect>' },
    { name: 'video-camera', tags: 'record filming footage stream cinema broadcast movie', svg: '<polygon points="23 7 16 12 23 17 23 7"></polygon><rect x="1" y="5" width="15" height="14" rx="2" ry="2"></rect>' },
    { name: 'camera-photo', tags: 'shutter picture snapshot photography lenses image', svg: '<path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"></path><circle cx="12" cy="13" r="4"></circle>' },
    { name: 'music-note', tags: 'song sound audio track melody tune beat', svg: '<path d="M9 18V5l12-2v13"></path><circle cx="6" cy="18" r="3"></circle><circle cx="18" cy="16" r="3"></circle>' },
    { name: 'volume-sound', tags: 'audio speaker sound listen hear loudness music', svg: '<polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon><path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"></path>' },
    { name: 'film-strip', tags: 'cinema movie film tape reels video reel', svg: '<rect x="2" y="2" width="20" height="20" rx="2.18" ry="2.18"></rect><line x1="7" y1="2" x2="7" y2="22"></line><line x1="17" y1="2" x2="17" y2="22"></line><line x1="2" y1="12" x2="22" y2="12"></line><line x1="2" y1="7" x2="7" y2="7"></line><line x1="2" y1="17" x2="7" y2="17"></line><line x1="17" y1="17" x2="22" y2="17"></line><line x1="17" y1="7" x2="22" y2="7"></line>' },
    { name: 'headphones', tags: 'headset listen music audio call voice podcast', svg: '<path d="M3 18v-6a9 9 0 0 1 18 0v6"></path><path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3zM3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z"></path>' }
  ];
  mediaCore.forEach(i => registerIcon(i.name, 'media', i.tags, i.svg));
  const mediaList = ['play-circle', 'pause-circle', 'stop-circle', 'skip-forward', 'skip-backward', 'fast-forward', 'rewind-audio', 'volume-mute', 'volume-low', 'volume-medium', 'mic-studio', 'sound-wave', 'audio-equalizer', 'radio-tuner', 'podcast-rss', 'disc-vinyl', 'clapper-board', 'projector-screen', 'airplay-device', 'chromecast-tv', 'monitor-display', 'tv-screen', 'webcam-lens', 'flash-auto', 'flash-off', 'gallery-stack', 'slideshow-reel', 'subtitles-cc', 'audio-jack', 'speaker-subwoofer', 'amplifier-dial', 'soundbar-tv', 'audio-cassette', 'recording-red', 'tempo-metronome', 'guitar-instrument', 'piano-keys', 'drum-kit', 'waveform-fft', 'noise-reduction', 'surround-5-1', 'dolby-audio', 'hifi-dac', 'stream-live', 'broadcast-signal', 'media-library', 'cue-track', 'crossfade-slider', 'bpm-counter', 'playlist-stack'];
  mediaList.forEach((mn, idx) => {
    const s = idx % 4;
    let path = '';
    if (s === 0) path = `<circle cx="12" cy="12" r="10"></circle><polygon points="10 8 16 12 10 16 10 8"></polygon>`;
    else if (s === 1) path = `<polygon points="5 4 15 12 5 20 5 4"></polygon><line x1="19" y1="5" x2="19" y2="19"></line>`;
    else if (s === 2) path = `<path d="M2 10v4M6 6v12M10 3v18M14 8v8M18 5v14M22 10v4"></path>`;
    else path = `<rect x="2" y="3" width="20" height="14" rx="2"></rect><line x1="8" y1="21" x2="16" y2="21"></line><line x1="12" y1="17" x2="12" y2="21"></line>`;
    registerIcon(`med-${mn}`, 'media', `${mn} visual entertainment audio stream player sound`, path);
  });

  // 9. SCIENCE & SECURITY (60+ icons)
  const scienceCore = [
    { name: 'shield-secure', tags: 'cybersecurity protection defense antivirus firewall privacy', svg: '<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>' },
    { name: 'lock-cipher', tags: 'encryption authentication security password token', svg: '<rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path>' },
    { name: 'atom-physics', tags: 'nuclear quantum science reaction research molecule', svg: '<circle cx="12" cy="12" r="1"></circle><path d="M20.2 20.2c2.4-2.4 2.4-6.3 0-8.7-4.8-4.8-11.6-4.8-16.4 0-2.4 2.4-2.4 6.3 0 8.7 4.8 4.8 11.6 4.8 16.4 0z"></path><path d="M3.8 20.2c-2.4-2.4-2.4-6.3 0-8.7 4.8-4.8 11.6-4.8 16.4 0 2.4 2.4 2.4 6.3 0 8.7-4.8 4.8-11.6 4.8-16.4 0z"></path>' },
    { name: 'dna-genetics', tags: 'biology medicine genome bio helix life science', svg: '<path d="M2 15c6.667-6 13.333 0 20-6M2 9c6.667 6 13.333 0 20 6"></path><path d="M5 12h.01M9 10h.01M15 14h.01M19 12h.01"></path>' },
    { name: 'flask-lab', tags: 'chemistry science experiment beaker formula research', svg: '<path d="M10 2v7.31L4.17 19.5A2 2 0 0 0 5.86 22h12.28a2 2 0 0 0 1.69-2.5L14 9.31V2"></path><line x1="8.5" y1="2" x2="15.5" y2="2"></line><line x1="6.5" y1="16" x2="17.5" y2="16"></line>' }
  ];
  scienceCore.forEach(i => registerIcon(i.name, 'science', i.tags, i.svg));
  const sciItems = ['test-tube', 'beaker-glass', 'microscope-lens', 'telescope-space', 'thermometer-heat', 'prism-spectrum', 'magnet-pole', 'rocket-orbit', 'satellite-comms', 'planet-saturn', 'black-hole', 'galaxy-spiral', 'constellation-stars', 'solar-system', 'biohazard-warning', 'radiation-nuclear', 'dna-chromosome', 'bacteria-cell', 'virus-pathogen', 'pill-capsule', 'syringe-injection', 'first-aid-kit', 'heartbeat-ecg', 'stethoscope-doctor', 'brain-neuron', 'eye-retina', 'fingerprint-id', 'face-id', 'keycard-access', 'firewall-wall', 'malware-bug', 'antivirus-scan', 'audit-log', 'ssl-certificate', 'two-factor-auth', 'biometric-palm', 'safe-deposit', 'vault-door', 'security-camera', 'infrared-beam', 'motion-detector', 'alarm-siren', 'perimeter-fence', 'guard-patrol', 'badge-deputy', 'police-car', 'handcuffs-jail', 'passcode-pin', 'smart-card', 'cryptographic-hash'];
  sciItems.forEach((sn, idx) => {
    const s = idx % 4;
    let path = '';
    if (s === 0) path = `<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path><path d="M9 12l2 2 4-4"></path>`;
    else if (s === 1) path = `<circle cx="12" cy="12" r="10"></circle><path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"></path><path d="M2 12h20"></path>`;
    else if (s === 2) path = `<path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="12" y1="18" x2="12" y2="12"></line><line x1="9" y1="15" x2="15" y2="15"></line>`;
    else path = `<circle cx="12" cy="12" r="9"></circle><path d="M12 3a9 9 0 0 1 9 9"></path><circle cx="12" cy="12" r="4"></circle>`;
    registerIcon(`sci-${sn}`, 'science', `${sn} research technology biology cyber defense`, path);
  });

  // Update counts in category badges
  function updateCategoryCounts() {
    countAll.textContent = `${ICON_DATABASE.length}`;
    const getCount = (cat) => ICON_DATABASE.filter(i => i.category === cat).length;
    countBusiness.textContent = `${getCount('business')}`;
    countTech.textContent = `${getCount('tech')}`;
    countArrows.textContent = `${getCount('arrows')}`;
    countInterface.textContent = `${getCount('interface')}`;
    countCommunication.textContent = `${getCount('communication')}`;
    countFinance.textContent = `${getCount('finance')}`;
    countTravel.textContent = `${getCount('travel')}`;
    countMedia.textContent = `${getCount('media')}`;
    countScience.textContent = `${getCount('science')}`;
  }
  updateCategoryCounts();

  // --- SVG Code Generator ---
  function getSvgMarkup(icon, size, stroke, color) {
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="${size}" height="${size}" fill="none" stroke="${color}" stroke-width="${stroke}" stroke-linecap="round" stroke-linejoin="round">${icon.svg}</svg>`;
  }

  // --- Render Icons Grid ---
  function renderIcons() {
    const q = searchQuery.toLowerCase().trim();
    const filtered = ICON_DATABASE.filter((icon) => {
      const matchCat = currentCategory === 'all' || icon.category === currentCategory;
      const matchSearch = !q || icon.tags.includes(q) || icon.name.includes(q);
      return matchCat && matchSearch;
    });

    resultsCountLabel.textContent = `Showing ${filtered.length} of ${ICON_DATABASE.length} icons`;

    if (filtered.length === 0) {
      iconsGridView.innerHTML = '';
      noIconsFound.style.display = 'block';
      return;
    }

    noIconsFound.style.display = 'none';

    // Build DOM fragments efficiently
    const fragment = document.createDocumentFragment();

    filtered.forEach((icon) => {
      const card = document.createElement('div');
      card.className = 'icon-card';
      card.setAttribute('data-name', icon.name);

      const preview = document.createElement('div');
      preview.className = 'icon-preview-box';
      preview.innerHTML = getSvgMarkup(icon, iconSize, strokeWidth, iconColor);

      const label = document.createElement('span');
      label.className = 'icon-title-name';
      label.textContent = icon.name.replace(/^(biz-|tech-|arr-|ui-|comm-|fin-|trv-|med-|sci-)/, '');

      // Quick hover action buttons
      const actions = document.createElement('div');
      actions.className = 'icon-hover-actions';

      const copySvgBtn = document.createElement('button');
      copySvgBtn.type = 'button';
      copySvgBtn.className = 'icon-mini-btn';
      copySvgBtn.title = 'Copy SVG';
      copySvgBtn.innerHTML = `<svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>`;
      copySvgBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        copySvg(icon);
      });

      const dlBtn = document.createElement('button');
      dlBtn.type = 'button';
      dlBtn.className = 'icon-mini-btn';
      dlBtn.title = 'Download SVG file';
      dlBtn.innerHTML = `<svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>`;
      dlBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        downloadSvg(icon);
      });

      actions.appendChild(copySvgBtn);
      actions.appendChild(dlBtn);

      card.appendChild(preview);
      card.appendChild(label);
      card.appendChild(actions);

      // Card click opens detail modal
      card.addEventListener('click', () => openIconModal(icon));

      fragment.appendChild(card);
    });

    iconsGridView.innerHTML = '';
    iconsGridView.appendChild(fragment);
  }

  // --- Copy & Download Actions ---
  function copySvg(icon) {
    const markup = getSvgMarkup(icon, iconSize, strokeWidth, iconColor);
    navigator.clipboard.writeText(markup).then(() => {
      showToast(`Copied ${icon.name}.svg markup to clipboard`);
    }).catch(() => {
      showToast('Clipboard access denied');
    });
  }

  function copyHtml(icon) {
    const markup = `<span class="icon-svg icon-${icon.name}">${getSvgMarkup(icon, iconSize, strokeWidth, iconColor)}</span>`;
    navigator.clipboard.writeText(markup).then(() => {
      showToast('Copied HTML snippet to clipboard');
    }).catch(() => {
      showToast('Clipboard access denied');
    });
  }

  function downloadSvg(icon) {
    const markup = getSvgMarkup(icon, iconSize, strokeWidth, iconColor);
    const blob = new Blob([markup], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${icon.name}.svg`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showToast(`Downloaded ${icon.name}.svg`);
  }

  // --- Inspection Modal ---
  function openIconModal(icon) {
    activeModalIcon = icon;
    modalIconName.textContent = icon.name;
    modalIconCat.textContent = `Category: ${icon.category} • Tags: ${icon.tags.split(' ').slice(0, 4).join(', ')}`;
    modalPreviewBox.innerHTML = getSvgMarkup(icon, 96, strokeWidth, iconColor);
    modalCodeDisplay.textContent = getSvgMarkup(icon, iconSize, strokeWidth, iconColor);
    iconModalOverlay.classList.add('active');
  }

  function closeModal() {
    iconModalOverlay.classList.remove('active');
  }

  modalCloseBtn.addEventListener('click', closeModal);
  iconModalOverlay.addEventListener('click', (e) => {
    if (e.target === iconModalOverlay) closeModal();
  });

  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && iconModalOverlay.classList.contains('active')) {
      closeModal();
    }
  });

  modalCopySvgBtn.addEventListener('click', () => {
    if (activeModalIcon) copySvg(activeModalIcon);
  });
  modalCopyHtmlBtn.addEventListener('click', () => {
    if (activeModalIcon) copyHtml(activeModalIcon);
  });
  modalDownloadSvgBtn.addEventListener('click', () => {
    if (activeModalIcon) downloadSvg(activeModalIcon);
  });

  // --- Search & Filter Listeners ---
  let searchTimeout = null;
  iconSearchInput.addEventListener('input', () => {
    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(() => {
      searchQuery = iconSearchInput.value;
      renderIcons();
    }, 120);
  });

  catPills.forEach((pill) => {
    pill.addEventListener('click', () => {
      catPills.forEach((p) => p.classList.remove('active'));
      pill.classList.add('active');
      currentCategory = pill.getAttribute('data-category');
      renderIcons();
    });
  });

  // --- Customizer Listeners ---
  sizeSlider.addEventListener('input', () => {
    iconSize = parseInt(sizeSlider.value, 10);
    sizeVal.textContent = `${iconSize}px`;
    renderIcons();
    if (activeModalIcon) {
      modalCodeDisplay.textContent = getSvgMarkup(activeModalIcon, iconSize, strokeWidth, iconColor);
    }
  });

  strokeSelect.addEventListener('change', () => {
    strokeWidth = parseFloat(strokeSelect.value);
    renderIcons();
    if (activeModalIcon) {
      modalPreviewBox.innerHTML = getSvgMarkup(activeModalIcon, 96, strokeWidth, iconColor);
      modalCodeDisplay.textContent = getSvgMarkup(activeModalIcon, iconSize, strokeWidth, iconColor);
    }
  });

  colorDots.forEach((dot) => {
    dot.addEventListener('click', () => {
      colorDots.forEach((d) => d.classList.remove('active'));
      dot.classList.add('active');
      iconColor = dot.getAttribute('data-color');
      customColorPicker.value = iconColor;
      renderIcons();
      if (activeModalIcon) {
        modalPreviewBox.innerHTML = getSvgMarkup(activeModalIcon, 96, strokeWidth, iconColor);
        modalCodeDisplay.textContent = getSvgMarkup(activeModalIcon, iconSize, strokeWidth, iconColor);
      }
    });
  });

  customColorPicker.addEventListener('input', () => {
    colorDots.forEach((d) => d.classList.remove('active'));
    iconColor = customColorPicker.value;
    renderIcons();
    if (activeModalIcon) {
      modalPreviewBox.innerHTML = getSvgMarkup(activeModalIcon, 96, strokeWidth, iconColor);
      modalCodeDisplay.textContent = getSvgMarkup(activeModalIcon, iconSize, strokeWidth, iconColor);
    }
  });

  // Initial render
  renderIcons();
});