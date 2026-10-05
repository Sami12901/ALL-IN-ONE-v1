/**
 * SERP Preview Tool - Interactive Client-Side Logic
 * Accurate Google Search Engine Results Page simulator with pixel & character analysis
 */

document.addEventListener('DOMContentLoaded', () => {
  // --- DOM Elements ---
  const inputTitle = document.getElementById('input-title');
  const inputDesc = document.getElementById('input-desc');
  const inputUrl = document.getElementById('input-url');
  const inputBreadcrumb = document.getElementById('input-breadcrumb');
  const inputFocusKw = document.getElementById('input-focus-kw');
  const selectFavicon = document.getElementById('select-favicon');
  const inputCustomFavicon = document.getElementById('input-custom-favicon');

  // Rich snippet toggles & inputs
  const toggleDate = document.getElementById('toggle-date');
  const inputPubDate = document.getElementById('input-pub-date');
  const dateConfigWrap = document.getElementById('date-config-wrap');

  const toggleRating = document.getElementById('toggle-rating');
  const inputRatingVal = document.getElementById('input-rating-val');
  const inputRatingCount = document.getElementById('input-rating-count');
  const ratingConfigWrap = document.getElementById('rating-config-wrap');

  const toggleSitelinks = document.getElementById('toggle-sitelinks');
  const serpSitelinksContainer = document.getElementById('serp-sitelinks-container');

  // Preview elements
  const serpStage = document.getElementById('serp-stage');
  const serpFaviconBox = document.getElementById('serp-favicon-box');
  const serpSiteName = document.getElementById('serp-site-name');
  const serpBreadcrumbDisplay = document.getElementById('serp-breadcrumb-display');
  const serpTitleDisplay = document.getElementById('serp-title-display');
  const serpRatingRow = document.getElementById('serp-rating-row');
  const serpRatingText = document.getElementById('serp-rating-text');
  const serpDatePrefix = document.getElementById('serp-date-prefix');
  const serpDescText = document.getElementById('serp-desc-text');

  // Metrics elements
  const titleCharMetrics = document.getElementById('title-char-metrics');
  const titlePxMetrics = document.getElementById('title-px-metrics');
  const titleMeterBar = document.getElementById('title-meter-bar');
  const titleLimitBadge = document.getElementById('title-limit-badge');

  const descCharMetrics = document.getElementById('desc-char-metrics');
  const descPxMetrics = document.getElementById('desc-px-metrics');
  const descMeterBar = document.getElementById('desc-meter-bar');
  const descLimitBadge = document.getElementById('desc-limit-badge');

  const truncationAlertBox = document.getElementById('truncation-alert-box');
  const truncationAlertMsg = document.getElementById('truncation-alert-msg');

  // Control buttons
  const btnDeviceDesktop = document.getElementById('btn-device-desktop');
  const btnDeviceMobile = document.getElementById('btn-device-mobile');
  const btnSerpTheme = document.getElementById('btn-serp-theme');
  const serpThemeIcon = document.getElementById('serp-theme-icon');
  const serpThemeText = document.getElementById('serp-theme-text');

  const btnCopyTitle = document.getElementById('btn-copy-title');
  const btnCopyDesc = document.getElementById('btn-copy-desc');
  const btnToggleMetaExport = document.getElementById('btn-toggle-meta-export');
  const metaExportPanel = document.getElementById('meta-export-panel');
  const metaExportCode = document.getElementById('meta-export-code');
  const btnCopyAllMeta = document.getElementById('btn-copy-all-meta');
  const btnResetDefaults = document.getElementById('btn-reset-defaults');
  const presetPills = document.querySelectorAll('.preset-pill');

  const toast = document.getElementById('toast');
  const toastMessage = document.getElementById('toast-message');

  // --- State Variables ---
  let currentDevice = 'desktop'; // 'desktop' or 'mobile'
  let isSerpDark = false;

  // Limits
  const LIMITS = {
    desktop: {
      titleMaxPx: 600,
      titleMaxChars: 60,
      descMaxPx: 960,
      descMaxChars: 160,
      titleFont: '20px Arial, sans-serif',
      descFont: '14px Arial, sans-serif'
    },
    mobile: {
      titleMaxPx: 580,
      titleMaxChars: 55,
      descMaxPx: 680,
      descMaxChars: 120,
      titleFont: '17px Arial, sans-serif',
      descFont: '13.5px Arial, sans-serif'
    }
  };

  // Presets
  const PRESETS = {
    saas: {
      title: 'Acme Cloud - Next-Generation AI Automation & Workflow Suite',
      desc: 'Supercharge your operational velocity with Acme Cloud. Automate complex workflows, unify cross-team data, and deploy AI assistants in minutes. Start free trial today.',
      url: 'https://acmecloud.io/solutions/workflow-automation',
      breadcrumb: 'Solutions › AI Automation',
      keywords: 'cloud, automation, workflows, AI',
      favicon: 'rocket',
      ratingVal: '4.9',
      ratingCount: '2,450 reviews'
    },
    ecommerce: {
      title: 'Ultralight Pro Running Shoes 2026 | Free Shipping & Returns',
      desc: 'Engineered for marathon endurance and daily agility. Discover the new 2026 Ultralight Pro with nitrogen-infused foam cushioning and breathable recycled mesh.',
      url: 'https://striderunning.com/products/ultralight-pro-2026',
      breadcrumb: 'Footwear › Men › Road Running',
      keywords: 'running shoes, ultralight, 2026',
      favicon: 'cart',
      ratingVal: '4.8',
      ratingCount: '890 reviews'
    },
    blog: {
      title: '15 Proven Technical SEO Audit Strategies for High Organic Rankings',
      desc: 'A comprehensive step-by-step technical SEO guide. Learn how to optimize crawl budget, fix indexation leaks, leverage structured data, and master Core Web Vitals.',
      url: 'https://seojournal.dev/guides/technical-seo-audit-2026',
      breadcrumb: 'Guides › Technical SEO',
      keywords: 'technical SEO, audit, crawl budget, Core Web Vitals',
      favicon: 'tech',
      ratingVal: '5.0',
      ratingCount: '340 ratings'
    },
    agency: {
      title: 'Apex Growth - Premier B2B Digital Marketing & SEO Consultancy',
      desc: 'Award-winning digital performance agency helping enterprise SaaS and eCommerce brands scale pipeline with predictable organic acquisition and bespoke CRO programs.',
      url: 'https://apexgrowth.agency/services/seo-strategy',
      breadcrumb: 'Services › Organic Growth',
      keywords: 'digital marketing, SEO consultancy, B2B, organic growth',
      favicon: 'star',
      ratingVal: '4.9',
      ratingCount: '165 client reviews'
    }
  };

  // Canvas for precise text pixel measurement
  let measurementCanvas = null;
  let measurementCtx = null;
  try {
    measurementCanvas = document.createElement('canvas');
    measurementCtx = measurementCanvas.getContext('2d');
  } catch {
    measurementCanvas = null;
    measurementCtx = null;
  }

  function measureTextPixelWidth(text, font) {
    if (!text) return 0;
    if (measurementCtx) {
      measurementCtx.font = font;
      return Math.round(measurementCtx.measureText(text).width);
    }
    // Reliable heuristic fallback if canvas is not initialized
    const isTitle = font.includes('20px') || font.includes('17px');
    const avgCharPx = isTitle ? 9.8 : 6.4;
    return Math.round(text.length * avgCharPx);
  }

  // Calculate realistic truncation point with ellipsis
  function truncateToFit(text, maxPixels, font, maxChars) {
    if (!text) return { text: '', isTruncated: false };

    const totalWidth = measureTextPixelWidth(text, font);
    if (totalWidth <= maxPixels && text.length <= maxChars) {
      return { text, isTruncated: false };
    }

    // Binary search for exact truncation point
    let low = 0;
    let high = Math.min(text.length, maxChars);
    let bestCut = 0;
    const ellipsis = ' ...';
    const ellipsisWidth = measureTextPixelWidth(ellipsis, font);
    const availableWidth = maxPixels - ellipsisWidth;

    while (low <= high) {
      const mid = Math.floor((low + high) / 2);
      const sub = text.slice(0, mid);
      const w = measureTextPixelWidth(sub, font);

      if (w <= availableWidth) {
        bestCut = mid;
        low = mid + 1;
      } else {
        high = mid - 1;
      }
    }

    if (bestCut >= text.length) {
      return { text, isTruncated: false };
    }

    return {
      text: text.slice(0, bestCut).trimEnd() + ' ...',
      isTruncated: true
    };
  }

  // Safe HTML string escaping
  function escapeHtml(str) {
    if (!str) return '';
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  // Google-style bold keyword highlighter
  function highlightKeywords(escapedText, keywordQuery) {
    if (!keywordQuery || !keywordQuery.trim()) {
      return escapedText;
    }

    // Split query by commas or spaces into unique tokens
    const tokens = keywordQuery
      .split(/[\s,]+/)
      .map(k => k.trim())
      .filter(k => k.length > 1);

    if (tokens.length === 0) return escapedText;

    // Build regex that matches any of the tokens case-insensitively
    const regexPattern = tokens.map(t => t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|');
    const regex = new RegExp(`\\b(${regexPattern})\\b`, 'gi');

    return escapedText.replace(regex, '<b>$1</b>');
  }

  // Extract site name and domain safely from URL
  function parseUrlDetails(rawUrl) {
    let clean = (rawUrl || '').trim();
    if (!clean) {
      return { host: 'example.com', displayUrl: 'https://example.com' };
    }

    if (!clean.startsWith('http://') && !clean.startsWith('https://')) {
      clean = 'https://' + clean;
    }

    try {
      const parsed = new URL(clean);
      return {
        host: parsed.hostname || 'example.com',
        displayUrl: clean
      };
    } catch {
      return {
        host: 'example.com',
        displayUrl: clean
      };
    }
  }

  // Format date helper
  function formatSnippetDate(dateStr) {
    if (!dateStr) return '';
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return '';
      const opts = { month: 'short', day: 'numeric', year: 'numeric' };
      return d.toLocaleDateString('en-US', opts) + ' — ';
    } catch {
      return '';
    }
  }

  // Toast message utility
  let toastTimer = null;
  function showToast(msg) {
    if (toastMessage) toastMessage.textContent = msg;
    if (toast) {
      toast.classList.add('show');
      if (toastTimer) clearTimeout(toastTimer);
      toastTimer = setTimeout(() => {
        toast.classList.remove('show');
      }, 2500);
    }
  }

  // Clipboard copy helper
  async function copyToClipboard(text, successMsg) {
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(text);
      } else {
        const ta = document.createElement('textarea');
        ta.value = text;
        ta.style.position = 'fixed';
        ta.style.opacity = '0';
        document.body.appendChild(ta);
        ta.focus();
        ta.select();
        document.execCommand('copy');
        document.body.removeChild(ta);
      }
      showToast(successMsg);
    } catch (err) {
      console.error('Clipboard copy error:', err);
      showToast('Copied to clipboard!');
    }
  }

  // --- Main Render / Calculation Loop ---
  function updateSerpSimulation() {
    const limits = LIMITS[currentDevice];
    const rawTitle = (inputTitle.value || '').trim();
    const rawDesc = (inputDesc.value || '').trim();
    const rawUrl = (inputUrl.value || '').trim();
    const rawBreadcrumb = (inputBreadcrumb.value || '').trim();
    const focusQuery = (inputFocusKw.value || '').trim();

    // 1. Measure and update Page Title metrics
    const titleChars = rawTitle.length;
    const titlePx = measureTextPixelWidth(rawTitle, limits.titleFont);
    const titlePct = Math.min(100, Math.round((titlePx / limits.titleMaxPx) * 100));

    if (titleCharMetrics) {
      titleCharMetrics.textContent = `Length: ${titleChars} / ${limits.titleMaxChars} chars`;
    }
    if (titlePxMetrics) {
      titlePxMetrics.textContent = `Pixels: ${titlePx} / ${limits.titleMaxPx} px`;
    }
    if (titleMeterBar) {
      titleMeterBar.style.width = `${titlePct}%`;
      titleMeterBar.classList.remove('warning', 'danger');
      if (titlePx > limits.titleMaxPx || titleChars > limits.titleMaxChars) {
        titleMeterBar.classList.add('danger');
      } else if (titlePx > limits.titleMaxPx * 0.88 || titleChars > limits.titleMaxChars * 0.88) {
        titleMeterBar.classList.add('warning');
      }
    }

    const isTitleTruncated = titlePx > limits.titleMaxPx || titleChars > limits.titleMaxChars;
    if (titleLimitBadge) {
      titleLimitBadge.className = 'status-badge ' + (isTitleTruncated ? 'danger' : (titlePx > limits.titleMaxPx * 0.88 ? 'warn' : 'safe'));
      titleLimitBadge.textContent = isTitleTruncated ? 'Truncated' : (titlePx > limits.titleMaxPx * 0.88 ? 'Near Limit' : 'Optimal');
    }

    // 2. Measure and update Meta Description metrics
    const descChars = rawDesc.length;
    const descPx = measureTextPixelWidth(rawDesc, limits.descFont);
    const descPct = Math.min(100, Math.round((descPx / limits.descMaxPx) * 100));

    if (descCharMetrics) {
      descCharMetrics.textContent = `Length: ${descChars} / ${limits.descMaxChars} chars`;
    }
    if (descPxMetrics) {
      descPxMetrics.textContent = `Pixels: ${descPx} / ${limits.descMaxPx} px`;
    }
    if (descMeterBar) {
      descMeterBar.style.width = `${descPct}%`;
      descMeterBar.classList.remove('warning', 'danger');
      if (descPx > limits.descMaxPx || descChars > limits.descMaxChars) {
        descMeterBar.classList.add('danger');
      } else if (descPx > limits.descMaxPx * 0.88 || descChars > limits.descMaxChars * 0.88) {
        descMeterBar.classList.add('warning');
      }
    }

    const isDescTruncated = descPx > limits.descMaxPx || descChars > limits.descMaxChars;
    if (descLimitBadge) {
      descLimitBadge.className = 'status-badge ' + (isDescTruncated ? 'danger' : (descPx > limits.descMaxPx * 0.88 ? 'warn' : 'safe'));
      descLimitBadge.textContent = isDescTruncated ? 'Truncated' : (descPx > limits.descMaxPx * 0.88 ? 'Near Limit' : 'Optimal');
    }

    // 3. Update Truncation Alert
    if (truncationAlertBox && truncationAlertMsg) {
      if (isTitleTruncated && isDescTruncated) {
        truncationAlertBox.classList.remove('hidden');
        truncationAlertMsg.textContent = `Both Title (${titlePx}px > ${limits.titleMaxPx}px) and Description (${descChars}ch > ${limits.descMaxChars}ch) exceed Google's ${currentDevice} boundaries.`;
      } else if (isTitleTruncated) {
        truncationAlertBox.classList.remove('hidden');
        truncationAlertMsg.textContent = `Page Title exceeds Google's ${currentDevice} display limit (${titlePx}px / ${limits.titleMaxPx}px max) and will end with an ellipsis (...).`;
      } else if (isDescTruncated) {
        truncationAlertBox.classList.remove('hidden');
        truncationAlertMsg.textContent = `Meta Description exceeds Google's ${currentDevice} display limit (${descChars} chars / ${limits.descMaxChars} max) and will be cut off.`;
      } else {
        truncationAlertBox.classList.add('hidden');
      }
    }

    // 4. Render Google Header (Favicon, Domain, Breadcrumb)
    const { host, displayUrl } = parseUrlDetails(rawUrl);
    if (serpSiteName) {
      serpSiteName.textContent = host;
    }
    if (serpBreadcrumbDisplay) {
      if (rawBreadcrumb) {
        serpBreadcrumbDisplay.textContent = `${displayUrl.replace(/\/$/, '')} › ${rawBreadcrumb.replace(/>/g, '›')}`;
      } else {
        serpBreadcrumbDisplay.textContent = displayUrl;
      }
    }

    // Update Favicon Preview
    renderFavicon();

    // 5. Render Google Title with Truncation & Keyword Highlighting
    const truncatedTitleObj = truncateToFit(rawTitle || 'Untitled Document', limits.titleMaxPx, limits.titleFont, limits.titleMaxChars);
    let titleHtml = escapeHtml(truncatedTitleObj.text);
    titleHtml = highlightKeywords(titleHtml, focusQuery);
    if (serpTitleDisplay) {
      serpTitleDisplay.innerHTML = titleHtml;
    }

    // 6. Rich Snippet: Ratings
    if (toggleRating && serpRatingRow && serpRatingText) {
      if (toggleRating.checked) {
        serpRatingRow.classList.remove('hidden');
        if (ratingConfigWrap) ratingConfigWrap.classList.remove('hidden');
        const val = inputRatingVal.value || '4.9';
        const count = inputRatingCount.value || '1,280 reviews';
        serpRatingText.textContent = `Rating: ${val} · ${count}`;
      } else {
        serpRatingRow.classList.add('hidden');
        if (ratingConfigWrap) ratingConfigWrap.classList.add('hidden');
      }
    }

    // 7. Rich Snippet: Publication Date & Description Text
    if (toggleDate && serpDatePrefix) {
      if (toggleDate.checked && inputPubDate.value) {
        serpDatePrefix.style.display = 'inline';
        serpDatePrefix.textContent = formatSnippetDate(inputPubDate.value);
        if (dateConfigWrap) dateConfigWrap.classList.remove('hidden');
      } else {
        serpDatePrefix.style.display = 'none';
        serpDatePrefix.textContent = '';
        if (dateConfigWrap) {
          if (!toggleDate.checked) dateConfigWrap.classList.add('hidden');
          else dateConfigWrap.classList.remove('hidden');
        }
      }
    }

    // Render Snippet Body with Truncation & Keyword Highlighting
    const truncatedDescObj = truncateToFit(rawDesc || 'No meta description provided for this page.', limits.descMaxPx, limits.descFont, limits.descMaxChars);
    let descHtml = escapeHtml(truncatedDescObj.text);
    descHtml = highlightKeywords(descHtml, focusQuery);
    if (serpDescText) {
      serpDescText.innerHTML = descHtml;
    }

    // 8. Sitelinks Expansion (Desktop only)
    if (toggleSitelinks && serpSitelinksContainer) {
      if (toggleSitelinks.checked && currentDevice === 'desktop') {
        serpSitelinksContainer.classList.remove('hidden');
      } else {
        serpSitelinksContainer.classList.add('hidden');
      }
    }

    // 9. Update HTML Meta Export if visible
    if (metaExportPanel && !metaExportPanel.classList.contains('hidden')) {
      generateMetaTagsCode();
    }
  }

  // Favicon renderer
  function renderFavicon() {
    if (!serpFaviconBox) return;
    const selected = selectFavicon.value;

    if (selected === 'custom' && inputCustomFavicon.value) {
      serpFaviconBox.innerHTML = `<img src="${escapeHtml(inputCustomFavicon.value)}" class="google-favicon-img" alt="favicon" onerror="this.src=''; this.parentElement.innerText='🌐';">`;
      return;
    }

    const iconMap = {
      globe: '🌐',
      tech: '⚡',
      rocket: '🚀',
      cart: '🛍️',
      star: '⭐',
      shield: '🛡️'
    };
    serpFaviconBox.innerHTML = `<span>${iconMap[selected] || '🌐'}</span>`;
  }

  // Generate full production-ready HTML Meta and JSON-LD schema
  function generateMetaTagsCode() {
    const rawTitle = (inputTitle.value || '').trim();
    const rawDesc = (inputDesc.value || '').trim();
    const rawUrl = (inputUrl.value || 'https://example.com/').trim();
    const rawBreadcrumb = (inputBreadcrumb.value || '').trim();
    const isRatingOn = toggleRating && toggleRating.checked;
    const ratingVal = inputRatingVal.value || '4.9';
    const ratingCountRaw = (inputRatingCount.value || '100').replace(/[^0-9]/g, '') || '100';

    let jsonLd = '';
    if (isRatingOn) {
      jsonLd = `
<!-- Aggregate Rating & Breadcrumb Schema (JSON-LD) -->
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "WebPage",
  "name": "${escapeHtml(rawTitle)}",
  "url": "${escapeHtml(rawUrl)}",
  "description": "${escapeHtml(rawDesc)}",
  "aggregateRating": {
    "@type": "AggregateRating",
    "ratingValue": "${ratingVal}",
    "bestRating": "5",
    "worstRating": "1",
    "ratingCount": "${ratingCountRaw}"
  }
}
<\/script>`;
    }

    const tags = `<!-- Primary Meta Tags -->
<title>${escapeHtml(rawTitle)}</title>
<meta name="title" content="${escapeHtml(rawTitle)}">
<meta name="description" content="${escapeHtml(rawDesc)}">
<meta name="robots" content="index, follow">
<link rel="canonical" href="${escapeHtml(rawUrl)}">

<!-- Open Graph / Facebook -->
<meta property="og:type" content="website">
<meta property="og:url" content="${escapeHtml(rawUrl)}">
<meta property="og:title" content="${escapeHtml(rawTitle)}">
<meta property="og:description" content="${escapeHtml(rawDesc)}">
<meta property="og:site_name" content="${escapeHtml(parseUrlDetails(rawUrl).host)}">

<!-- Twitter -->
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:url" content="${escapeHtml(rawUrl)}">
<meta name="twitter:title" content="${escapeHtml(rawTitle)}">
<meta name="twitter:description" content="${escapeHtml(rawDesc)}">${jsonLd}`;

    if (metaExportCode) {
      metaExportCode.textContent = tags;
    }
    return tags;
  }

  // --- Event Listeners ---

  // Live input handlers
  const liveInputs = [
    inputTitle, inputDesc, inputUrl, inputBreadcrumb, inputFocusKw,
    inputRatingVal, inputRatingCount, inputPubDate, inputCustomFavicon
  ];
  liveInputs.forEach(input => {
    if (input) {
      input.addEventListener('input', updateSerpSimulation);
    }
  });

  // Toggles
  [toggleDate, toggleRating, toggleSitelinks].forEach(toggle => {
    if (toggle) {
      toggle.addEventListener('change', updateSerpSimulation);
    }
  });

  // Favicon selector
  if (selectFavicon) {
    selectFavicon.addEventListener('change', () => {
      if (selectFavicon.value === 'custom') {
        inputCustomFavicon.classList.remove('hidden');
      } else {
        inputCustomFavicon.classList.add('hidden');
      }
      updateSerpSimulation();
    });
  }

  // Device Toggle
  if (btnDeviceDesktop && btnDeviceMobile) {
    btnDeviceDesktop.addEventListener('click', () => {
      currentDevice = 'desktop';
      btnDeviceDesktop.classList.add('active');
      btnDeviceMobile.classList.remove('active');
      serpStage.classList.remove('mode-mobile');
      serpStage.classList.add('mode-desktop');
      updateSerpSimulation();
    });

    btnDeviceMobile.addEventListener('click', () => {
      currentDevice = 'mobile';
      btnDeviceMobile.classList.add('active');
      btnDeviceDesktop.classList.remove('active');
      serpStage.classList.remove('mode-desktop');
      serpStage.classList.add('mode-mobile');
      updateSerpSimulation();
    });
  }

  // SERP Dark / Light Toggle
  if (btnSerpTheme) {
    btnSerpTheme.addEventListener('click', () => {
      isSerpDark = !isSerpDark;
      if (isSerpDark) {
        serpStage.classList.add('dark-serp');
        serpThemeIcon.textContent = '☀️';
        serpThemeText.textContent = 'Light Mode';
      } else {
        serpStage.classList.remove('dark-serp');
        serpThemeIcon.textContent = '🌙';
        serpThemeText.textContent = 'Dark Mode';
      }
    });
  }

  // Copy Buttons
  if (btnCopyTitle) {
    btnCopyTitle.addEventListener('click', () => {
      const title = (inputTitle.value || '').trim();
      if (!title) {
        showToast('Please enter a title first');
        return;
      }
      copyToClipboard(title, 'Page Title copied to clipboard!');
    });
  }

  if (btnCopyDesc) {
    btnCopyDesc.addEventListener('click', () => {
      const desc = (inputDesc.value || '').trim();
      if (!desc) {
        showToast('Please enter a description first');
        return;
      }
      copyToClipboard(desc, 'Meta Description copied to clipboard!');
    });
  }

  // Meta Export Panel Toggle
  if (btnToggleMetaExport && metaExportPanel) {
    btnToggleMetaExport.addEventListener('click', () => {
      const isHidden = metaExportPanel.classList.contains('hidden');
      if (isHidden) {
        metaExportPanel.classList.remove('hidden');
        generateMetaTagsCode();
        btnToggleMetaExport.innerHTML = `
          <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2"><polyline points="18 15 12 9 6 15"></polyline></svg>
          Hide HTML Meta Tags
        `;
      } else {
        metaExportPanel.classList.add('hidden');
        btnToggleMetaExport.innerHTML = `
          <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2"><polyline points="16 18 22 12 16 6"></polyline><polyline points="8 6 2 12 8 18"></polyline></svg>
          Export HTML Meta Tags
        `;
      }
    });
  }

  if (btnCopyAllMeta) {
    btnCopyAllMeta.addEventListener('click', () => {
      const code = generateMetaTagsCode();
      copyToClipboard(code, 'HTML & Schema Tags copied to clipboard!');
    });
  }

  // Preset buttons
  presetPills.forEach(pill => {
    pill.addEventListener('click', () => {
      const presetKey = pill.getAttribute('data-preset');
      const data = PRESETS[presetKey];
      if (!data) return;

      inputTitle.value = data.title;
      inputDesc.value = data.desc;
      inputUrl.value = data.url;
      inputBreadcrumb.value = data.breadcrumb;
      inputFocusKw.value = data.keywords;
      selectFavicon.value = data.favicon;
      inputCustomFavicon.classList.add('hidden');
      inputRatingVal.value = data.ratingVal;
      inputRatingCount.value = data.ratingCount;

      updateSerpSimulation();
      showToast(`Loaded "${pill.textContent.trim()}" preset`);
    });
  });

  // Reset defaults
  if (btnResetDefaults) {
    btnResetDefaults.addEventListener('click', () => {
      const defaultData = PRESETS.saas;
      inputTitle.value = defaultData.title;
      inputDesc.value = defaultData.desc;
      inputUrl.value = defaultData.url;
      inputBreadcrumb.value = defaultData.breadcrumb;
      inputFocusKw.value = defaultData.keywords;
      selectFavicon.value = defaultData.favicon;
      inputCustomFavicon.classList.add('hidden');
      inputRatingVal.value = defaultData.ratingVal;
      inputRatingCount.value = defaultData.ratingCount;
      toggleDate.checked = true;
      toggleRating.checked = true;
      toggleSitelinks.checked = false;

      updateSerpSimulation();
      showToast('Reset to default values');
    });
  }

  // Set default initial date to today
  if (inputPubDate) {
    const today = new Date().toISOString().split('T')[0];
    inputPubDate.value = today;
  }

  // Load SaaS preset on initial mount
  const initial = PRESETS.saas;
  inputTitle.value = initial.title;
  inputDesc.value = initial.desc;
  inputUrl.value = initial.url;
  inputBreadcrumb.value = initial.breadcrumb;
  inputFocusKw.value = initial.keywords;
  selectFavicon.value = initial.favicon;

  // Initial calculation
  updateSerpSimulation();
});