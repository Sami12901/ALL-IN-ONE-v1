// Open Graph & Social Card Studio Logic
// ALL IN ONE Platform - Client-Side Interactive Engine

document.addEventListener('DOMContentLoaded', () => {
  // DOM Elements - Inputs
  const ogTitleInput = document.getElementById('og-title');
  const ogTitleCount = document.getElementById('og-title-count');
  const ogTitleBar = document.getElementById('og-title-bar');

  const ogDescInput = document.getElementById('og-desc');
  const ogDescCount = document.getElementById('og-desc-count');
  const ogDescBar = document.getElementById('og-desc-bar');

  const ogUrlInput = document.getElementById('og-url');
  const ogSiteNameInput = document.getElementById('og-site-name');
  const ogTypeSelect = document.getElementById('og-type');
  const ogLocaleSelect = document.getElementById('og-locale');

  const articleContainer = document.getElementById('article-fields-container');
  const articleAuthorInput = document.getElementById('article-author');
  const articlePublishedInput = document.getElementById('article-published');

  const ogImageInput = document.getElementById('og-image');
  const uploadLocalImgBtn = document.getElementById('upload-local-img-btn');
  const localImgInput = document.getElementById('local-img-input');

  const validatorThumb = document.getElementById('validator-thumb');
  const imgDimBadge = document.getElementById('img-dim-badge');
  const imgRatioBadge = document.getElementById('img-ratio-badge');
  const imgFeedbackText = document.getElementById('img-feedback-text');

  const twitterCardSelect = document.getElementById('twitter-card-type');
  const twitterSiteInput = document.getElementById('twitter-site');
  const twitterCreatorInput = document.getElementById('twitter-creator');

  // DOM Elements - Mockups
  const previewTabs = document.querySelectorAll('.preview-tab-btn');
  const mockupFacebook = document.getElementById('mockup-facebook');
  const mockupTwitter = document.getElementById('mockup-twitter');
  const mockupLinkedin = document.getElementById('mockup-linkedin');
  const mockupDiscord = document.getElementById('mockup-discord');
  const mockupSlack = document.getElementById('mockup-slack');

  // Facebook Mockup Elements
  const fbAvatarLetter = document.getElementById('fb-avatar-letter');
  const fbUserName = document.getElementById('fb-user-name');
  const fbCardImg = document.getElementById('fb-card-img');
  const fbCardDomain = document.getElementById('fb-card-domain');
  const fbCardTitle = document.getElementById('fb-card-title');
  const fbCardDesc = document.getElementById('fb-card-desc');

  // Twitter Mockup Elements
  const xAvatarLetter = document.getElementById('x-avatar-letter');
  const xDisplayName = document.getElementById('x-display-name');
  const xHandle = document.getElementById('x-handle');
  const xLargeContainer = document.getElementById('x-large-container');
  const xSummaryContainer = document.getElementById('x-summary-container');
  const xCardImgLarge = document.getElementById('x-card-img-large');
  const xDomainBadge = document.getElementById('x-domain-badge');
  const xCardDomain = document.getElementById('x-card-domain');
  const xCardTitle = document.getElementById('x-card-title');
  const xCardDesc = document.getElementById('x-card-desc');
  const xCardImgSmall = document.getElementById('x-card-img-small');
  const xSummaryDomain = document.getElementById('x-summary-domain');
  const xSummaryTitle = document.getElementById('x-summary-title');
  const xSummaryDesc = document.getElementById('x-summary-desc');

  // LinkedIn Mockup Elements
  const liAvatarLetter = document.getElementById('li-avatar-letter');
  const liCompanyName = document.getElementById('li-company-name');
  const liCardImg = document.getElementById('li-card-img');
  const liCardTitle = document.getElementById('li-card-title');
  const liCardDomain = document.getElementById('li-card-domain');

  // Discord Mockup Elements
  const discordSiteName = document.getElementById('discord-site-name');
  const discordCardTitle = document.getElementById('discord-card-title');
  const discordCardDesc = document.getElementById('discord-card-desc');
  const discordCardImg = document.getElementById('discord-card-img');

  // Slack Mockup Elements
  const slackSiteName = document.getElementById('slack-site-name');
  const slackCardTitle = document.getElementById('slack-card-title');
  const slackCardDesc = document.getElementById('slack-card-desc');
  const slackCardImg = document.getElementById('slack-card-img');

  // Code Output Elements
  const codeOutput = document.getElementById('code-output');
  const copyAllTagsBtn = document.getElementById('copy-all-tags-btn');
  const downloadTagsBtn = document.getElementById('download-tags-btn');
  const metaTagCount = document.getElementById('meta-tag-count');

  const codeTabs = {
    full: document.getElementById('code-tab-full'),
    og: document.getElementById('code-tab-og'),
    twitter: document.getElementById('code-tab-twitter'),
    jsonld: document.getElementById('code-tab-jsonld')
  };

  // Health Checks
  const checkTitle = document.getElementById('check-title');
  const checkDesc = document.getElementById('check-desc');
  const checkImage = document.getElementById('check-image');
  const checkUrl = document.getElementById('check-url');
  const checkTwitterCard = document.getElementById('check-twitter-card');
  const checkTwitterSite = document.getElementById('check-twitter-site');

  // Presets Buttons
  const presetSaas = document.getElementById('preset-saas');
  const presetArticle = document.getElementById('preset-article');
  const presetProduct = document.getElementById('preset-product');
  const presetPortfolio = document.getElementById('preset-portfolio');
  const presetReset = document.getElementById('preset-reset');

  // Toast
  const toast = document.getElementById('app-toast');
  const toastMessage = document.getElementById('toast-message');

  // Application State
  let activeCodeTab = 'full';
  let activePlatform = 'facebook';
  let detectedImgWidth = 1200;
  let detectedImgHeight = 630;
  let toastTimer = null;

  // Helper: Toast Message
  function showToast(msg) {
    if (toastTimer) clearTimeout(toastTimer);
    toastMessage.textContent = msg;
    toast.classList.add('show');
    toastTimer = setTimeout(() => {
      toast.classList.remove('show');
    }, 2500);
  }

  // Helper: Safe Domain Extractor
  function extractHostname(urlStr) {
    if (!urlStr || !urlStr.trim()) return 'example.com';
    try {
      const u = new URL(urlStr.startsWith('http') ? urlStr : `https://${urlStr}`);
      return u.hostname;
    } catch {
      return urlStr.replace(/^https?:\/\//, '').split('/')[0] || 'example.com';
    }
  }

  // Helper: Escape HTML
  function escapeHTML(str) {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  // Image Dimension & Aspect Ratio Validator
  function validateImage(srcUrl) {
    if (!srcUrl || !srcUrl.trim()) {
      validatorThumb.src = '';
      imgDimBadge.textContent = 'No Image';
      imgDimBadge.className = 'validator-badge badge-warning';
      imgRatioBadge.textContent = '—';
      imgFeedbackText.textContent = 'Specify an og:image URL or upload a graphic file.';
      detectedImgWidth = 1200;
      detectedImgHeight = 630;
      updateCodeOutput();
      return;
    }

    validatorThumb.src = srcUrl;
    const testImg = new Image();
    testImg.crossOrigin = 'anonymous';

    testImg.onload = () => {
      detectedImgWidth = testImg.naturalWidth;
      detectedImgHeight = testImg.naturalHeight;
      const ratio = (detectedImgWidth / detectedImgHeight).toFixed(2);

      imgDimBadge.textContent = `${detectedImgWidth} × ${detectedImgHeight} px`;
      imgRatioBadge.textContent = `${ratio}:1 Ratio`;

      const isIdealRatio = ratio >= 1.85 && ratio <= 1.95;
      const isHighRes = detectedImgWidth >= 1200 && detectedImgHeight >= 630;
      const isMinRes = detectedImgWidth >= 600 && detectedImgHeight >= 315;

      if (isHighRes && isIdealRatio) {
        imgDimBadge.className = 'validator-badge badge-optimal';
        imgFeedbackText.textContent = 'Optimal 1.91:1 ratio. High-resolution fidelity across Facebook, X, and LinkedIn feeds.';
      } else if (isMinRes && isIdealRatio) {
        imgDimBadge.className = 'validator-badge badge-acceptable';
        imgFeedbackText.textContent = 'Aspect ratio is ideal. Upgrade resolution to 1200 × 630 px for optimal Retina clarity.';
      } else if (Math.abs(ratio - 1.0) < 0.1) {
        imgDimBadge.className = 'validator-badge badge-acceptable';
        imgFeedbackText.textContent = 'Square 1:1 image. Best suited for Twitter "summary" cards; may crop on large banners.';
      } else {
        imgDimBadge.className = 'validator-badge badge-warning';
        imgFeedbackText.textContent = `Custom aspect ratio (${ratio}:1). Social media cards may automatically crop top or sides.`;
      }

      updateMockupImages(srcUrl);
      updateCodeOutput();
      updateHealthChecks();
    };

    testImg.onerror = () => {
      imgDimBadge.textContent = 'Unreachable Image';
      imgDimBadge.className = 'validator-badge badge-warning';
      imgRatioBadge.textContent = 'Error';
      imgFeedbackText.textContent = 'Could not load image resource. Ensure the URL is public or use HTTPS.';
      updateMockupImages(srcUrl);
      updateHealthChecks();
    };

    testImg.src = srcUrl;
  }

  // Update all platform image elements
  function updateMockupImages(src) {
    const fallback = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630" fill="%23242526"><rect width="1200" height="630"/><text x="50%" y="50%" font-family="sans-serif" font-size="48" fill="%2389aacc" dominant-baseline="middle" text-anchor="middle">1200 x 630 Social Preview</text></svg>';
    const finalSrc = src && src.trim() ? src : fallback;

    fbCardImg.src = finalSrc;
    xCardImgLarge.src = finalSrc;
    xCardImgSmall.src = finalSrc;
    liCardImg.src = finalSrc;
    discordCardImg.src = finalSrc;
    slackCardImg.src = finalSrc;
  }

  // Update Length Meters & Character Counters
  function updateCounters() {
    const titleVal = ogTitleInput.value.trim();
    const titleLen = titleVal.length;
    ogTitleCount.textContent = `${titleLen} / 60 chars`;
    const titlePct = Math.min(100, Math.round((titleLen / 60) * 100));
    ogTitleBar.style.width = `${titlePct}%`;

    if (titleLen >= 40 && titleLen <= 60) {
      ogTitleCount.className = 'char-counter optimal';
      ogTitleBar.style.backgroundColor = 'var(--success)';
    } else if (titleLen > 60) {
      ogTitleCount.className = 'char-counter warning';
      ogTitleBar.style.backgroundColor = 'var(--warning)';
    } else {
      ogTitleCount.className = 'char-counter';
      ogTitleBar.style.backgroundColor = 'var(--accent)';
    }

    const descVal = ogDescInput.value.trim();
    const descLen = descVal.length;
    ogDescCount.textContent = `${descLen} / 160 chars`;
    const descPct = Math.min(100, Math.round((descLen / 160) * 100));
    ogDescBar.style.width = `${descPct}%`;

    if (descLen >= 100 && descLen <= 160) {
      ogDescCount.className = 'char-counter optimal';
      ogDescBar.style.backgroundColor = 'var(--success)';
    } else if (descLen > 160) {
      ogDescCount.className = 'char-counter warning';
      ogDescBar.style.backgroundColor = 'var(--warning)';
    } else {
      ogDescCount.className = 'char-counter';
      ogDescBar.style.backgroundColor = 'var(--accent)';
    }
  }

  // Synchronize Live Mockups
  function updateMockups() {
    const title = ogTitleInput.value.trim() || 'Untitled Page';
    const desc = ogDescInput.value.trim() || 'No description provided for social snippet.';
    const url = ogUrlInput.value.trim();
    const siteName = ogSiteNameInput.value.trim() || 'Website';
    const twitterSite = twitterSiteInput.value.trim() || '@yourbrand';
    const domain = extractHostname(url);
    const domainUpper = domain.toUpperCase();
    const initial = (siteName.charAt(0) || 'A').toUpperCase();

    // 1. Facebook Mockup
    fbAvatarLetter.textContent = initial;
    fbUserName.textContent = siteName;
    fbCardDomain.textContent = domainUpper;
    fbCardTitle.textContent = title;
    fbCardDesc.textContent = desc;

    // 2. Twitter / X Mockup
    xAvatarLetter.textContent = initial;
    xDisplayName.textContent = siteName;
    xHandle.textContent = twitterSite.startsWith('@') ? twitterSite : `@${twitterSite}`;

    const isLargeCard = twitterCardSelect.value === 'summary_large_image';
    if (isLargeCard) {
      xLargeContainer.style.display = 'block';
      xSummaryContainer.style.display = 'none';
      xDomainBadge.textContent = domain;
      xCardDomain.textContent = domain;
      xCardTitle.textContent = title;
      xCardDesc.textContent = desc;
    } else {
      xLargeContainer.style.display = 'none';
      xSummaryContainer.style.display = 'flex';
      xSummaryDomain.textContent = domain;
      xSummaryTitle.textContent = title;
      xSummaryDesc.textContent = desc;
    }

    // 3. LinkedIn Mockup
    liAvatarLetter.textContent = initial;
    liCompanyName.textContent = siteName;
    liCardDomain.textContent = domain;
    liCardTitle.textContent = title;

    // 4. Discord Mockup
    discordSiteName.textContent = siteName;
    discordCardTitle.textContent = title;
    discordCardDesc.textContent = desc;

    // 5. Slack Mockup
    slackSiteName.textContent = siteName;
    slackCardTitle.textContent = title;
    slackCardDesc.textContent = desc;
  }

  // Health Check Status
  function updateHealthChecks() {
    const hasTitle = Boolean(ogTitleInput.value.trim());
    const hasDesc = Boolean(ogDescInput.value.trim());
    const hasImage = Boolean(ogImageInput.value.trim());
    const hasUrl = Boolean(ogUrlInput.value.trim());
    const hasCard = Boolean(twitterCardSelect.value);
    const hasTwitterSite = Boolean(twitterSiteInput.value.trim());

    setCheck(checkTitle, hasTitle);
    setCheck(checkDesc, hasDesc);
    setCheck(checkImage, hasImage);
    setCheck(checkUrl, hasUrl);
    setCheck(checkTwitterCard, hasCard);
    setCheck(checkTwitterSite, hasTwitterSite);
  }

  function setCheck(elem, isValid) {
    if (!elem) return;
    if (isValid) {
      elem.textContent = '●';
      elem.className = 'check-icon-valid';
    } else {
      elem.textContent = '○';
      elem.className = 'check-icon-missing';
    }
  }

  // Syntax Highlighter Engine for HTML Output
  function highlightHTML(code) {
    const escaped = escapeHTML(code);
    return escaped.replace(/(&lt;!--.*?--&gt;)|(&lt;\/?)([a-zA-Z0-9\-:]+)(.*?)(&gt;)/gs, (match, comment, open, tagName, attrs, close) => {
      if (comment) {
        return `<span class="hl-comment">${comment}</span>`;
      }
      const highlightedAttrs = attrs.replace(/([a-zA-Z0-9\-:]+)(=)(&quot;.*?&quot;|&#39;.*?&#39;|[^\s&]+)?/g, (aMatch, attrName, eq, attrVal) => {
        let valSpan = '';
        if (attrVal) {
          valSpan = `<span class="hl-val">${attrVal}</span>`;
        }
        return `<span class="hl-attr">${attrName}</span>${eq}${valSpan}`;
      });
      return `<span class="hl-tag-bracket">${open}</span><span class="hl-tag">${tagName}</span>${highlightedAttrs}<span class="hl-tag-bracket">${close}</span>`;
    });
  }

  // Syntax Highlighter for JSON
  function highlightJSON(jsonStr) {
    const escaped = escapeHTML(jsonStr);
    return escaped
      .replace(/("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g, (match) => {
        let cls = 'hl-val';
        if (/^"/.test(match)) {
          if (/:$/.test(match)) {
            cls = 'hl-attr';
          } else {
            cls = 'hl-val';
          }
        } else if (/true|false/.test(match)) {
          cls = 'hl-tag';
        } else if (/null/.test(match)) {
          cls = 'hl-comment';
        }
        return `<span class="${cls}">${match}</span>`;
      });
  }

  // Generate Code Output Based on Active Tab
  function getRawCode() {
    const title = ogTitleInput.value.trim();
    const desc = ogDescInput.value.trim();
    const url = ogUrlInput.value.trim();
    const siteName = ogSiteNameInput.value.trim();
    const type = ogTypeSelect.value;
    const locale = ogLocaleSelect.value;
    const image = ogImageInput.value.trim();
    const cardType = twitterCardSelect.value;
    const twitterSite = twitterSiteInput.value.trim();
    const twitterCreator = twitterCreatorInput.value.trim();
    const author = articleAuthorInput.value.trim();
    const published = articlePublishedInput.value.trim();

    if (activeCodeTab === 'og') {
      let ogCode = `<!-- Open Graph / Facebook -->\n`;
      ogCode += `<meta property="og:type" content="${title ? type : 'website'}">\n`;
      if (url) ogCode += `<meta property="og:url" content="${url}">\n`;
      if (title) ogCode += `<meta property="og:title" content="${title}">\n`;
      if (desc) ogCode += `<meta property="og:description" content="${desc}">\n`;
      if (image) {
        ogCode += `<meta property="og:image" content="${image}">\n`;
        ogCode += `<meta property="og:image:width" content="${detectedImgWidth}">\n`;
        ogCode += `<meta property="og:image:height" content="${detectedImgHeight}">\n`;
      }
      if (siteName) ogCode += `<meta property="og:site_name" content="${siteName}">\n`;
      if (locale) ogCode += `<meta property="og:locale" content="${locale}">\n`;
      if (type === 'article') {
        if (author) ogCode += `<meta property="article:author" content="${author}">\n`;
        if (published) ogCode += `<meta property="article:published_time" content="${published}">\n`;
      }
      return ogCode.trim();
    }

    if (activeCodeTab === 'twitter') {
      let twCode = `<!-- Twitter / X -->\n`;
      twCode += `<meta name="twitter:card" content="${cardType}">\n`;
      if (url) twCode += `<meta name="twitter:url" content="${url}">\n`;
      if (title) twCode += `<meta name="twitter:title" content="${title}">\n`;
      if (desc) twCode += `<meta name="twitter:description" content="${desc}">\n`;
      if (image) twCode += `<meta name="twitter:image" content="${image}">\n`;
      if (twitterSite) twCode += `<meta name="twitter:site" content="${twitterSite}">\n`;
      if (twitterCreator) twCode += `<meta name="twitter:creator" content="${twitterCreator}">\n`;
      return twCode.trim();
    }

    if (activeCodeTab === 'jsonld') {
      const schemaType = type === 'article' ? 'Article' : type === 'product' ? 'Product' : 'WebPage';
      const json = {
        "@context": "https://schema.org",
        "@type": schemaType,
        "name": title || siteName,
        "url": url,
        "description": desc,
        ...(image ? { "image": image } : {}),
        ...(siteName ? { "publisher": { "@type": "Organization", "name": siteName } } : {})
      };
      if (type === 'article' && author) {
        json.author = { "@type": "Person", "name": author };
      }
      if (type === 'article' && published) {
        json.datePublished = published;
      }
      return `<script type="application/ld+json">\n${JSON.stringify(json, null, 2)}\n</script>`;
    }

    // Default: Full HTML Head Block
    let full = `<!-- Primary Meta Tags -->\n`;
    if (title) full += `<title>${title}</title>\n<meta name="title" content="${title}">\n`;
    if (desc) full += `<meta name="description" content="${desc}">\n`;
    if (url) full += `<link rel="canonical" href="${url}">\n`;

    full += `\n<!-- Open Graph / Facebook -->\n`;
    full += `<meta property="og:type" content="${type}">\n`;
    if (url) full += `<meta property="og:url" content="${url}">\n`;
    if (title) full += `<meta property="og:title" content="${title}">\n`;
    if (desc) full += `<meta property="og:description" content="${desc}">\n`;
    if (image) {
      full += `<meta property="og:image" content="${image}">\n`;
      full += `<meta property="og:image:width" content="${detectedImgWidth}">\n`;
      full += `<meta property="og:image:height" content="${detectedImgHeight}">\n`;
    }
    if (siteName) full += `<meta property="og:site_name" content="${siteName}">\n`;
    if (locale) full += `<meta property="og:locale" content="${locale}">\n`;
    if (type === 'article') {
      if (author) full += `<meta property="article:author" content="${author}">\n`;
      if (published) full += `<meta property="article:published_time" content="${published}">\n`;
    }

    full += `\n<!-- Twitter / X -->\n`;
    full += `<meta name="twitter:card" content="${cardType}">\n`;
    if (url) full += `<meta name="twitter:url" content="${url}">\n`;
    if (title) full += `<meta name="twitter:title" content="${title}">\n`;
    if (desc) full += `<meta name="twitter:description" content="${desc}">\n`;
    if (image) full += `<meta name="twitter:image" content="${image}">\n`;
    if (twitterSite) full += `<meta name="twitter:site" content="${twitterSite}">\n`;
    if (twitterCreator) full += `<meta name="twitter:creator" content="${twitterCreator}">\n`;

    return full.trim();
  }

  function updateCodeOutput() {
    const raw = getRawCode();
    if (activeCodeTab === 'jsonld') {
      codeOutput.innerHTML = highlightHTML(raw);
    } else {
      codeOutput.innerHTML = highlightHTML(raw);
    }

    // Count meta tags
    const tagMatches = raw.match(/<meta|<link|<title/g);
    const count = tagMatches ? tagMatches.length : 0;
    metaTagCount.textContent = `${count} tag${count === 1 ? '' : 's'}`;
  }

  // Refresh everything
  function updateAll() {
    updateCounters();
    updateMockups();
    updateHealthChecks();
    updateCodeOutput();
  }

  // Presets Data & Handlers
  const presets = {
    saas: {
      title: 'DevFlow - Autonomous AI Engineering Platform',
      desc: 'Supercharge software development with autonomous agentic workflows, instant web environments, and real-time observability.',
      url: 'https://devflow.ai/studio',
      siteName: 'DevFlow Inc.',
      type: 'website',
      locale: 'en_US',
      image: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1200&h=630&fit=crop&q=80',
      twitterCard: 'summary_large_image',
      twitterSite: '@devflow_ai',
      twitterCreator: '@lead_architect',
      author: '',
      published: ''
    },
    article: {
      title: 'Architecting Resilient Distributed Systems in 2026',
      desc: 'A comprehensive deep dive into event-driven microservices, zero-trust service meshes, and predictable latency under peak load.',
      url: 'https://techchronicle.io/articles/distributed-systems-2026',
      siteName: 'The Tech Chronicle',
      type: 'article',
      locale: 'en_US',
      image: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=1200&h=630&fit=crop&q=80',
      twitterCard: 'summary_large_image',
      twitterSite: '@techchronicle',
      twitterCreator: '@elenavance',
      author: 'Dr. Elena Vance',
      published: '2026-10-01'
    },
    product: {
      title: 'Apex Pro Wireless Mechanical Keyboard - Moonlight Edition',
      desc: 'Ultra-low latency 2.4GHz wireless mechanical keyboard with hot-swappable switches, CNC aluminum chassis, and RGB per-key backlighting.',
      url: 'https://gearvault.store/products/apex-pro-wireless',
      siteName: 'GearVault',
      type: 'product',
      locale: 'en_US',
      image: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=1200&h=630&fit=crop&q=80',
      twitterCard: 'summary_large_image',
      twitterSite: '@gearvault',
      twitterCreator: '@gearvault_gear',
      author: '',
      published: ''
    },
    portfolio: {
      title: 'Alex Rivera | Creative Technologist & Full-Stack Architect',
      desc: 'Selected works in generative web interfaces, real-time collaboration engines, and spatial computing.',
      url: 'https://alexrivera.design',
      siteName: 'Alex Rivera Portfolio',
      type: 'profile',
      locale: 'en_US',
      image: 'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?w=1200&h=630&fit=crop&q=80',
      twitterCard: 'summary',
      twitterSite: '@alexrivera_dev',
      twitterCreator: '@alexrivera_dev',
      author: '',
      published: ''
    },
    reset: {
      title: '',
      desc: '',
      url: '',
      siteName: '',
      type: 'website',
      locale: 'en_US',
      image: '',
      twitterCard: 'summary_large_image',
      twitterSite: '',
      twitterCreator: '',
      author: '',
      published: ''
    }
  };

  function applyPreset(p) {
    ogTitleInput.value = p.title;
    ogDescInput.value = p.desc;
    ogUrlInput.value = p.url;
    ogSiteNameInput.value = p.siteName;
    ogTypeSelect.value = p.type;
    ogLocaleSelect.value = p.locale;
    ogImageInput.value = p.image;
    twitterCardSelect.value = p.twitterCard;
    twitterSiteInput.value = p.twitterSite;
    twitterCreatorInput.value = p.twitterCreator;
    articleAuthorInput.value = p.author;
    articlePublishedInput.value = p.published;

    articleContainer.style.display = p.type === 'article' ? 'block' : 'none';
    validateImage(p.image);
    updateAll();
    showToast('Loaded preset template!');
  }

  // Event Listeners - Inputs
  const formInputs = [
    ogTitleInput,
    ogDescInput,
    ogUrlInput,
    ogSiteNameInput,
    ogLocaleSelect,
    articleAuthorInput,
    articlePublishedInput,
    twitterSiteInput,
    twitterCreatorInput
  ];

  formInputs.forEach(inp => {
    inp.addEventListener('input', updateAll);
  });

  ogTypeSelect.addEventListener('change', () => {
    articleContainer.style.display = ogTypeSelect.value === 'article' ? 'block' : 'none';
    updateAll();
  });

  twitterCardSelect.addEventListener('change', updateAll);

  ogImageInput.addEventListener('input', () => {
    validateImage(ogImageInput.value.trim());
  });

  // Local File Upload
  uploadLocalImgBtn.addEventListener('click', () => {
    localImgInput.click();
  });

  localImgInput.addEventListener('change', (e) => {
    const file = e.target.files && e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const dataUrl = event.target.result;
        ogImageInput.value = dataUrl;
        validateImage(dataUrl);
        showToast(`Loaded ${file.name}`);
      };
      reader.readAsDataURL(file);
    }
  });

  // Preview Platform Tabs
  previewTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      previewTabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');

      activePlatform = tab.dataset.platform;
      mockupFacebook.style.display = activePlatform === 'facebook' ? 'block' : 'none';
      mockupTwitter.style.display = activePlatform === 'twitter' ? 'block' : 'none';
      mockupLinkedin.style.display = activePlatform === 'linkedin' ? 'block' : 'none';
      mockupDiscord.style.display = activePlatform === 'discord' ? 'block' : 'none';
      mockupSlack.style.display = activePlatform === 'slack' ? 'block' : 'none';
    });
  });

  // Code Output Tabs
  Object.keys(codeTabs).forEach(tabKey => {
    const btn = codeTabs[tabKey];
    btn.addEventListener('click', () => {
      Object.values(codeTabs).forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      activeCodeTab = tabKey;
      updateCodeOutput();
    });
  });

  // Copy Buttons
  copyAllTagsBtn.addEventListener('click', () => {
    const raw = getRawCode();
    if (!raw) return;

    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(raw)
        .then(() => {
          showToast('Meta tags copied to clipboard!');
        })
        .catch(() => {
          fallbackCopy(raw);
        });
    } else {
      fallbackCopy(raw);
    }
  });

  function fallbackCopy(text) {
    const ta = document.createElement('textarea');
    ta.value = text;
    ta.style.position = 'fixed';
    ta.style.left = '-9999px';
    document.body.appendChild(ta);
    ta.select();
    try {
      document.execCommand('copy');
      showToast('Meta tags copied to clipboard!');
    } catch {
      showToast('Press Ctrl+C to copy');
    }
    document.body.removeChild(ta);
  }

  // Download snippet
  downloadTagsBtn.addEventListener('click', () => {
    const raw = getRawCode();
    const blob = new Blob([raw], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'meta-tags.html';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showToast('Downloaded meta-tags.html!');
  });

  // Preset Buttons
  presetSaas.addEventListener('click', () => applyPreset(presets.saas));
  presetArticle.addEventListener('click', () => applyPreset(presets.article));
  presetProduct.addEventListener('click', () => applyPreset(presets.product));
  presetPortfolio.addEventListener('click', () => applyPreset(presets.portfolio));
  presetReset.addEventListener('click', () => applyPreset(presets.reset));

  // Initialize
  validateImage(ogImageInput.value.trim());
  updateAll();
});