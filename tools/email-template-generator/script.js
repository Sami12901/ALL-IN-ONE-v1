// Responsive HTML Email Template Generator
// Client-side visual email builder with live iframe preview & clean HTML export

document.addEventListener('DOMContentLoaded', () => {
  // Elements
  const previewIframe = document.getElementById('preview-iframe');
  const iframeWrapper = document.getElementById('iframe-wrapper');
  const btnViewDesktop = document.getElementById('btn-view-desktop');
  const btnViewMobile = document.getElementById('btn-view-mobile');
  const btnCopyHtml = document.getElementById('btn-copy-html');
  const btnDownloadHtml = document.getElementById('btn-download-html');

  // Accordions
  const accordions = document.querySelectorAll('.accordion-section');

  // Color inputs & hex text sync
  const colorSyncPairs = [
    { picker: 'cfg-accent', hex: 'cfg-accent-hex' },
    { picker: 'cfg-outer-bg', hex: 'cfg-outer-bg-hex' },
    { picker: 'cfg-inner-bg', hex: 'cfg-inner-bg-hex' },
    { picker: 'cfg-text-color', hex: 'cfg-text-color-hex' }
  ];

  // Config Elements
  const cfgFont = document.getElementById('cfg-font');

  // Header module
  const chkModHeader = document.getElementById('chk-mod-header');
  const cfgBrandName = document.getElementById('cfg-brand-name');
  const cfgLogoUrl = document.getElementById('cfg-logo-url');
  const cfgHeaderAlign = document.getElementById('cfg-header-align');

  // Hero module
  const chkModHero = document.getElementById('chk-mod-hero');
  const cfgHeroUrl = document.getElementById('cfg-hero-url');
  const cfgHeroAlt = document.getElementById('cfg-hero-alt');

  // Content module
  const chkModContent = document.getElementById('chk-mod-content');
  const cfgHeadingText = document.getElementById('cfg-heading-text');
  const cfgBodyText = document.getElementById('cfg-body-text');
  const cfgContentAlign = document.getElementById('cfg-content-align');

  // CTA module
  const chkModCta = document.getElementById('chk-mod-cta');
  const cfgCtaText = document.getElementById('cfg-cta-text');
  const cfgCtaUrl = document.getElementById('cfg-cta-url');
  const cfgCtaAlign = document.getElementById('cfg-cta-align');

  // Product highlight module
  const chkModProduct = document.getElementById('chk-mod-product');
  const cfgProductTitle = document.getElementById('cfg-product-title');
  const cfgProductBadge = document.getElementById('cfg-product-badge');
  const cfgProductDesc = document.getElementById('cfg-product-desc');
  const cfgProductBtnText = document.getElementById('cfg-product-btn-text');

  // Footer module
  const chkModFooter = document.getElementById('chk-mod-footer');
  const cfgFooterCompany = document.getElementById('cfg-footer-company');
  const cfgShowSocial = document.getElementById('cfg-show-social');
  const cfgUnsubUrl = document.getElementById('cfg-unsub-url');

  // Template presets
  const templateButtons = document.querySelectorAll('.preset-chip[data-template]');

  const PRESETS = {
    welcome: {
      accent: '#4e85bf',
      outerBg: '#f4f5f7',
      innerBg: '#ffffff',
      textColor: '#2d3748',
      brandName: 'ALL IN ONE',
      logoUrl: '',
      headerAlign: 'center',
      enableHero: true,
      heroUrl: 'https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=1200&auto=format&fit=crop&q=80',
      heroAlt: 'Welcome Banner',
      enableContent: true,
      heading: 'Welcome to your new creative command center!',
      body: 'We are thrilled to welcome you on board. You now have full access to our curated collection of online utilities and productivity engines. Discover high-performance tools engineered to streamline your everyday workflows.',
      contentAlign: 'left',
      enableCta: true,
      ctaText: 'Explore Your Dashboard \u2192',
      ctaUrl: 'https://example.com/dashboard',
      ctaAlign: 'center',
      enableProduct: true,
      productTitle: 'Pro Workspace Edition',
      productBadge: 'SPECIAL OFFER - 50% OFF',
      productDesc: 'Unlock infinite automation runs, premium exports, and priority support for your entire organization.',
      productBtn: 'Claim 50% Off',
      enableFooter: true,
      footerCompany: 'ALL IN ONE Technologies Inc. \u2022 123 Innovation Way, Suite 400, San Francisco, CA',
      showSocial: true,
      unsubUrl: 'https://example.com/unsubscribe'
    },
    launch: {
      accent: '#10b981',
      outerBg: '#090a0f',
      innerBg: '#131620',
      textColor: '#e2e8f0',
      brandName: 'NEXUS OS',
      logoUrl: '',
      headerAlign: 'left',
      enableHero: true,
      heroUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1200&auto=format&fit=crop&q=80',
      heroAlt: 'Product Launch Keynote',
      enableContent: true,
      heading: 'Nexus 3.0 has officially arrived.',
      body: 'Today we are introducing our biggest breakthrough yet. With an all-new neural compute layer, lightning-fast sync speeds, and deep developer integrations, Nexus 3.0 gives your team unfair productivity leverage.',
      contentAlign: 'left',
      enableCta: true,
      ctaText: 'Experience Nexus 3.0 Now \u2192',
      ctaUrl: 'https://example.com/nexus',
      ctaAlign: 'left',
      enableProduct: true,
      productTitle: 'Enterprise Early Access',
      productBadge: 'NEW RELEASE',
      productDesc: 'Dedicated clusters, 99.99% uptime SLA, and custom enterprise security policies.',
      productBtn: 'Schedule Demo',
      enableFooter: true,
      footerCompany: 'Nexus Technologies \u2022 500 Market Street, San Francisco, CA',
      showSocial: true,
      unsubUrl: 'https://example.com/unsubscribe'
    },
    digest: {
      accent: '#6366f1',
      outerBg: '#f8fafc',
      innerBg: '#ffffff',
      textColor: '#1e293b',
      brandName: 'THE WEEKLY BYTE',
      logoUrl: '',
      headerAlign: 'center',
      enableHero: false,
      heroUrl: '',
      heroAlt: '',
      enableContent: true,
      heading: 'Issue #48: The Future of Distributed Systems',
      body: 'Happy Sunday! In this week’s digest, we break down zero-overhead event streaming, explore recent breakthroughs in edge computing, and analyze why serverless databases are transforming system architecture.',
      contentAlign: 'left',
      enableCta: true,
      ctaText: 'Read Full Issue Online \u2192',
      ctaUrl: 'https://example.com/digest/48',
      ctaAlign: 'center',
      enableProduct: true,
      productTitle: 'Featured Community Project',
      productBadge: 'OPEN SOURCE SPOTLIGHT',
      productDesc: 'Check out TurboStream, an open-source low-latency reactive pipeline built entirely in WebAssembly.',
      productBtn: 'View GitHub Repo',
      enableFooter: true,
      footerCompany: 'The Weekly Byte \u2022 Austin, TX',
      showSocial: true,
      unsubUrl: 'https://example.com/unsubscribe'
    },
    promo: {
      accent: '#ef4444',
      outerBg: '#1e1e24',
      innerBg: '#2b2c34',
      textColor: '#fffffe',
      brandName: 'LUXE APPAREL',
      logoUrl: '',
      headerAlign: 'center',
      enableHero: true,
      heroUrl: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1200&auto=format&fit=crop&q=80',
      heroAlt: 'Flash Sale Hero',
      enableContent: true,
      heading: 'FLASH SALE: 40% OFF EVERYTHING',
      body: 'Our biggest seasonal shopping event starts right now. Use promo code FLASH40 at checkout to unlock 40% savings across our entire catalog. Limited inventory available.',
      contentAlign: 'center',
      enableCta: true,
      ctaText: 'Shop the Sale Now \u2192',
      ctaUrl: 'https://example.com/sale',
      ctaAlign: 'center',
      enableProduct: true,
      productTitle: 'The Alpine Shell Jacket',
      productBadge: 'BESTSELLER \u2022 $119 (WAS $199)',
      productDesc: 'Waterproof, breathable three-layer membrane built for all-weather alpine expeditions.',
      productBtn: 'Buy Now',
      enableFooter: true,
      footerCompany: 'Luxe Apparel Inc. \u2022 742 Evergreen Terrace, Portland, OR',
      showSocial: true,
      unsubUrl: 'https://example.com/unsubscribe'
    }
  };

  // Color inputs synchronization
  colorSyncPairs.forEach(pair => {
    const picker = document.getElementById(pair.picker);
    const hex = document.getElementById(pair.hex);
    if (picker && hex) {
      picker.addEventListener('input', () => {
        hex.value = picker.value;
        renderTemplate();
      });
      hex.addEventListener('input', () => {
        if (/^#[0-9A-Fa-f]{6}$/.test(hex.value)) {
          picker.value = hex.value;
          renderTemplate();
        }
      });
    }
  });

  // Accordion toggle logic
  accordions.forEach(acc => {
    const header = acc.querySelector('.accordion-header');
    header.addEventListener('click', () => {
      acc.classList.toggle('collapsed');
      const chevron = acc.querySelector('.chevron');
      if (chevron) {
        chevron.innerHTML = acc.classList.contains('collapsed') ? '&#9656;' : '&#9662;';
      }
    });
  });

  // Mode switcher Desktop / Mobile
  btnViewDesktop.addEventListener('click', () => {
    btnViewDesktop.classList.add('active');
    btnViewMobile.classList.remove('active');
    iframeWrapper.className = 'email-iframe-container mode-desktop';
  });

  btnViewMobile.addEventListener('click', () => {
    btnViewMobile.classList.add('active');
    btnViewDesktop.classList.remove('active');
    iframeWrapper.className = 'email-iframe-container mode-mobile';
  });

  /**
   * Generate bulletproof cross-client HTML email markup
   */
  function generateHtmlEmail() {
    const accent = document.getElementById('cfg-accent-hex').value;
    const outerBg = document.getElementById('cfg-outer-bg-hex').value;
    const innerBg = document.getElementById('cfg-inner-bg-hex').value;
    const textColor = document.getElementById('cfg-text-color-hex').value;
    const font = cfgFont.value;

    const brandName = cfgBrandName.value.trim() || 'BRAND';
    const logoUrl = cfgLogoUrl.value.trim();
    const headerAlign = cfgHeaderAlign.value;

    const showHeader = chkModHeader.checked;
    const showHero = chkModHero.checked && cfgHeroUrl.value.trim();
    const heroUrl = cfgHeroUrl.value.trim();
    const heroAlt = cfgHeroAlt.value.trim() || 'Hero Banner';

    const showContent = chkModContent.checked;
    const heading = cfgHeadingText.value.trim();
    const bodyText = cfgBodyText.value.trim().replace(/\n/g, '<br><br>');
    const contentAlign = cfgContentAlign.value;

    const showCta = chkModCta.checked;
    const ctaText = cfgCtaText.value.trim();
    const ctaUrl = cfgCtaUrl.value.trim() || '#';
    const ctaAlign = cfgCtaAlign.value;

    const showProduct = chkModProduct.checked;
    const productTitle = cfgProductTitle.value.trim();
    const productBadge = cfgProductBadge.value.trim();
    const productDesc = cfgProductDesc.value.trim();
    const productBtn = cfgProductBtnText.value.trim();

    const showFooter = chkModFooter.checked;
    const footerCompany = cfgFooterCompany.value.trim();
    const showSocial = cfgShowSocial.checked;
    const unsubUrl = cfgUnsubUrl.value.trim() || '#';

    // Header component markup
    let headerHtml = '';
    if (showHeader) {
      const logoContent = logoUrl
        ? `<img src="${logoUrl}" alt="${escapeHtml(brandName)}" style="max-height: 40px; display: inline-block; border: 0;" />`
        : `<span style="font-size: 20px; font-weight: 800; letter-spacing: 0.08em; text-transform: uppercase; color: ${textColor}; font-family: ${font};">${escapeHtml(brandName)}</span>`;

      headerHtml = `
      <!-- Header Row -->
      <tr>
        <td align="${headerAlign}" style="padding: 32px 36px 20px 36px; background-color: ${innerBg};">
          ${logoContent}
        </td>
      </tr>
      `;
    }

    // Hero banner markup
    let heroHtml = '';
    if (showHero) {
      heroHtml = `
      <!-- Hero Banner -->
      <tr>
        <td align="center" style="padding: 0; background-color: ${innerBg};">
          <img src="${heroUrl}" alt="${escapeHtml(heroAlt)}" width="600" style="width: 100%; max-width: 600px; height: auto; display: block; border: 0;" />
        </td>
      </tr>
      `;
    }

    // Heading and body content markup
    let contentHtml = '';
    if (showContent) {
      contentHtml = `
      <!-- Main Content -->
      <tr>
        <td align="${contentAlign}" style="padding: 32px 36px 20px 36px; background-color: ${innerBg}; font-family: ${font};">
          ${heading ? `<h1 style="margin: 0 0 16px 0; font-size: 26px; line-height: 1.3; font-weight: 700; color: ${textColor}; letter-spacing: -0.01em;">${escapeHtml(heading)}</h1>` : ''}
          <div style="font-size: 16px; line-height: 1.65; color: ${textColor}; opacity: 0.9;">
            ${bodyText}
          </div>
        </td>
      </tr>
      `;
    }

    // CTA button markup (bulletproof table button)
    let ctaHtml = '';
    if (showCta && ctaText) {
      ctaHtml = `
      <!-- Call To Action Button -->
      <tr>
        <td align="${ctaAlign}" style="padding: 10px 36px 28px 36px; background-color: ${innerBg}; font-family: ${font};">
          <table role="presentation" cellspacing="0" cellpadding="0" border="0" style="margin: 0 auto; display: inline-table;">
            <tr>
              <td align="center" style="border-radius: 8px; background-color: ${accent};">
                <a href="${ctaUrl}" target="_blank" style="font-size: 16px; font-weight: 700; font-family: ${font}; text-decoration: none; color: #ffffff; padding: 14px 32px; border-radius: 8px; display: inline-block; border: 1px solid ${accent};">
                  ${escapeHtml(ctaText)}
                </a>
              </td>
            </tr>
          </table>
        </td>
      </tr>
      `;
    }

    // Product highlight box markup
    let productHtml = '';
    if (showProduct) {
      productHtml = `
      <!-- Product Highlight Box -->
      <tr>
        <td style="padding: 10px 36px 28px 36px; background-color: ${innerBg}; font-family: ${font};">
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color: ${outerBg}; border-radius: 12px; border: 1px solid rgba(0,0,0,0.08);">
            <tr>
              <td style="padding: 24px;">
                ${productBadge ? `<span style="display: inline-block; font-size: 11px; font-weight: 800; letter-spacing: 0.08em; text-transform: uppercase; color: ${accent}; margin-bottom: 8px;">${escapeHtml(productBadge)}</span>` : ''}
                <h3 style="margin: 0 0 8px 0; font-size: 18px; font-weight: 700; color: ${textColor};">${escapeHtml(productTitle)}</h3>
                <p style="margin: 0 0 16px 0; font-size: 14px; line-height: 1.5; color: ${textColor}; opacity: 0.85;">${escapeHtml(productDesc)}</p>
                <a href="${ctaUrl}" target="_blank" style="display: inline-block; font-size: 14px; font-weight: 700; color: ${accent}; text-decoration: none;">
                  ${escapeHtml(productBtn)} &rarr;
                </a>
              </td>
            </tr>
          </table>
        </td>
      </tr>
      `;
    }

    // Footer & compliance markup
    let footerHtml = '';
    if (showFooter) {
      let socialMarkup = '';
      if (showSocial) {
        socialMarkup = `
        <table role="presentation" cellspacing="0" cellpadding="0" border="0" style="margin: 0 auto 16px auto;">
          <tr>
            <td style="padding: 0 8px;"><a href="#" style="font-size: 12px; font-weight: 600; color: ${accent}; text-decoration: none;">Twitter/X</a></td>
            <td style="padding: 0 8px; color: #a0aec0;">&bull;</td>
            <td style="padding: 0 8px;"><a href="#" style="font-size: 12px; font-weight: 600; color: ${accent}; text-decoration: none;">LinkedIn</a></td>
            <td style="padding: 0 8px; color: #a0aec0;">&bull;</td>
            <td style="padding: 0 8px;"><a href="#" style="font-size: 12px; font-weight: 600; color: ${accent}; text-decoration: none;">GitHub</a></td>
          </tr>
        </table>
        `;
      }

      footerHtml = `
      <!-- Compliance Footer -->
      <tr>
        <td align="center" style="padding: 32px 36px 40px 36px; background-color: ${outerBg}; font-family: ${font}; font-size: 12px; line-height: 1.6; color: #718096;">
          ${socialMarkup}
          <div style="margin-bottom: 8px;">${escapeHtml(footerCompany)}</div>
          <div>
            You are receiving this email because you registered on our platform. 
            <br>
            <a href="${unsubUrl}" style="color: ${accent}; text-decoration: underline;">Unsubscribe</a> &bull; 
            <a href="#" style="color: ${accent}; text-decoration: underline;">Manage Preferences</a>
          </div>
        </td>
      </tr>
      `;
    }

    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <title>${escapeHtml(heading || brandName)}</title>
  <style type="text/css">
    body, table, td, a { -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; }
    table, td { mso-table-lspace: 0pt; mso-table-rspace: 0pt; }
    img { -ms-interpolation-mode: bicubic; border: 0; outline: none; text-decoration: none; }
    body { margin: 0; padding: 0; width: 100% !important; min-width: 100%; background-color: ${outerBg}; }
    @media only screen and (max-width: 600px) {
      .email-container { width: 100% !important; }
      .mobile-padding { padding-left: 20px !important; padding-right: 20px !important; }
    }
  </style>
</head>
<body style="margin: 0; padding: 0; background-color: ${outerBg};">
  <center style="width: 100%; background-color: ${outerBg};">
    <!-- Main Email Container -->
    <table role="presentation" class="email-container" width="600" cellspacing="0" cellpadding="0" border="0" align="center" style="width: 600px; max-width: 600px; margin: 0 auto; background-color: ${innerBg};">
      ${headerHtml}
      ${heroHtml}
      ${contentHtml}
      ${ctaHtml}
      ${productHtml}
      ${footerHtml}
    </table>
  </center>
</body>
</html>`;
  }

  function escapeHtml(str) {
    return (str || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
  }

  /**
   * Render generated HTML inside iframe
   */
  function renderTemplate() {
    const html = generateHtmlEmail();
    previewIframe.srcdoc = html;
  }

  /**
   * Apply template preset
   */
  function applyPreset(data) {
    document.getElementById('cfg-accent').value = data.accent;
    document.getElementById('cfg-accent-hex').value = data.accent;
    document.getElementById('cfg-outer-bg').value = data.outerBg;
    document.getElementById('cfg-outer-bg-hex').value = data.outerBg;
    document.getElementById('cfg-inner-bg').value = data.innerBg;
    document.getElementById('cfg-inner-bg-hex').value = data.innerBg;
    document.getElementById('cfg-text-color').value = data.textColor;
    document.getElementById('cfg-text-color-hex').value = data.textColor;

    cfgBrandName.value = data.brandName;
    cfgLogoUrl.value = data.logoUrl;
    cfgHeaderAlign.value = data.headerAlign;

    chkModHero.checked = data.enableHero;
    cfgHeroUrl.value = data.heroUrl;
    cfgHeroAlt.value = data.heroAlt;

    chkModContent.checked = data.enableContent;
    cfgHeadingText.value = data.heading;
    cfgBodyText.value = data.body;
    cfgContentAlign.value = data.contentAlign;

    chkModCta.checked = data.enableCta;
    cfgCtaText.value = data.ctaText;
    cfgCtaUrl.value = data.ctaUrl;
    cfgCtaAlign.value = data.ctaAlign;

    chkModProduct.checked = data.enableProduct;
    cfgProductTitle.value = data.productTitle;
    cfgProductBadge.value = data.productBadge;
    cfgProductDesc.value = data.productDesc;
    cfgProductBtnText.value = data.productBtn;

    chkModFooter.checked = data.enableFooter;
    cfgFooterCompany.value = data.footerCompany;
    cfgShowSocial.checked = data.showSocial;
    cfgUnsubUrl.value = data.unsubUrl;

    renderTemplate();
  }

  // Bind change and input listeners across all controls
  const allControls = [
    cfgFont, chkModHeader, cfgBrandName, cfgLogoUrl, cfgHeaderAlign,
    chkModHero, cfgHeroUrl, cfgHeroAlt,
    chkModContent, cfgHeadingText, cfgBodyText, cfgContentAlign,
    chkModCta, cfgCtaText, cfgCtaUrl, cfgCtaAlign,
    chkModProduct, cfgProductTitle, cfgProductBadge, cfgProductDesc, cfgProductBtnText,
    chkModFooter, cfgFooterCompany, cfgShowSocial, cfgUnsubUrl
  ];

  allControls.forEach(ctrl => {
    if (ctrl) {
      ctrl.addEventListener('input', renderTemplate);
      ctrl.addEventListener('change', renderTemplate);
    }
  });

  // Preset button handlers
  templateButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const key = btn.dataset.template;
      if (PRESETS[key]) {
        applyPreset(PRESETS[key]);
      }
    });
  });

  // Copy HTML
  btnCopyHtml.addEventListener('click', async () => {
    const html = generateHtmlEmail();
    try {
      await navigator.clipboard.writeText(html);
      const orig = btnCopyHtml.innerHTML;
      btnCopyHtml.innerHTML = `<span style="color: var(--success);">&#10003; Copied!</span>`;
      setTimeout(() => { btnCopyHtml.innerHTML = orig; }, 2000);
    } catch {
      alert('Unable to access clipboard. Please copy manually.');
    }
  });

  // Download HTML
  btnDownloadHtml.addEventListener('click', () => {
    const html = generateHtmlEmail();
    const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `email-template-${Date.now()}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  });

  // Initial render
  renderTemplate();
});