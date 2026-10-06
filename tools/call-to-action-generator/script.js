// Call to Action (CTA) Generator - Client-Side Interactive Engine

const CTA_PRESETS = {
  saas: {
    headline: "Ready to 10x Your Team's Productivity?",
    desc: "Join 45,000+ modern teams automating their workflows with our unified workspace.",
    buttonText: "Start Your 14-Day Free Trial",
    subtext: "✓ No credit card required • Cancel anytime",
    color: "blue",
    icon: "rocket",
    radius: "9999px",
    size: "regular",
    shadow: "intense"
  },
  ecommerce: {
    headline: "Limited Edition Release — 40% Off Ends Midnight",
    desc: "Engineered with precision materials. Experience unmatched performance today.",
    buttonText: "Claim 40% Discount Today",
    subtext: "⚡ Only 14 items left in stock • Instant checkout",
    color: "sunset",
    icon: "cart",
    radius: "9999px",
    size: "regular",
    shadow: "intense"
  },
  "lead-magnet": {
    headline: "The 2026 High-Growth Playbook for Founders",
    desc: "Download the 45-page blueprint covering customer acquisition, pricing, and scaling.",
    buttonText: "Download Free Playbook (PDF)",
    subtext: "📥 Delivered instantly to your inbox • 100% Free",
    color: "emerald",
    icon: "download",
    radius: "12px",
    size: "large",
    shadow: "intense"
  },
  newsletter: {
    headline: "Get the 5-Minute Weekly Marketing Advantage",
    desc: "Deep teardowns, contrarian strategies, and proven frameworks every Tuesday morning.",
    buttonText: "Join 65,000+ Smart Marketers",
    subtext: "🔒 Zero spam guarantee • Unsubscribe with 1 click",
    color: "purple",
    icon: "sparkle",
    radius: "9999px",
    size: "regular",
    shadow: "subtle"
  },
  webinar: {
    headline: "Live Workshop: Master Modern Growth Strategies",
    desc: "Interactive live teardown with executive leaders plus recorded replay access.",
    buttonText: "Reserve Your Free Seat Now",
    subtext: "⚡ Free registration closes in 4 hours • 100% Live Q&A",
    color: "crimson",
    icon: "arrow",
    radius: "8px",
    size: "large",
    shadow: "intense"
  }
};

const COLOR_PALETTES = {
  blue: {
    gradient: "linear-gradient(135deg, #2563eb, #38bdf8)",
    glow: "0 8px 24px rgba(37, 99, 235, 0.45)",
    hoverGlow: "0 12px 30px rgba(37, 99, 235, 0.65)"
  },
  emerald: {
    gradient: "linear-gradient(135deg, #059669, #34d399)",
    glow: "0 8px 24px rgba(5, 150, 105, 0.45)",
    hoverGlow: "0 12px 30px rgba(5, 150, 105, 0.65)"
  },
  purple: {
    gradient: "linear-gradient(135deg, #7c3aed, #c084fc)",
    glow: "0 8px 24px rgba(124, 58, 237, 0.45)",
    hoverGlow: "0 12px 30px rgba(124, 58, 237, 0.65)"
  },
  sunset: {
    gradient: "linear-gradient(135deg, #ea580c, #f59e0b)",
    glow: "0 8px 24px rgba(234, 88, 12, 0.45)",
    hoverGlow: "0 12px 30px rgba(234, 88, 12, 0.65)"
  },
  crimson: {
    gradient: "linear-gradient(135deg, #dc2626, #f43f5e)",
    glow: "0 8px 24px rgba(220, 38, 38, 0.45)",
    hoverGlow: "0 12px 30px rgba(220, 38, 38, 0.65)"
  },
  dark: {
    gradient: "linear-gradient(135deg, #18181b, #27272a)",
    glow: "0 8px 24px rgba(0, 0, 0, 0.6)",
    hoverGlow: "0 12px 30px rgba(0, 0, 0, 0.85)"
  }
};

const ICONS = {
  arrow: `<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>`,
  cart: `<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="9" cy="21" r="1"></circle><circle cx="20" cy="21" r="1"></circle><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path></svg>`,
  rocket: `<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z"></path><path d="M12 15l-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z"></path></svg>`,
  download: `<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>`,
  sparkle: `<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>`,
  lock: `<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>`,
  none: ``
};

const SIZES = {
  compact: { padding: "0.6rem 1.35rem", fontSize: "0.875rem" },
  regular: { padding: "0.85rem 1.85rem", fontSize: "1rem" },
  large: { padding: "1.15rem 2.4rem", fontSize: "1.15rem" }
};

document.addEventListener('DOMContentLoaded', () => {
  // Elements
  const headlineInput = document.getElementById('headline-input');
  const buttonTextInput = document.getElementById('button-text-input');
  const subtextInput = document.getElementById('subtext-input');
  const iconSelect = document.getElementById('icon-select');
  const radiusSelect = document.getElementById('radius-select');
  const sizeSelect = document.getElementById('size-select');
  const shadowSelect = document.getElementById('shadow-select');
  const categorySelector = document.getElementById('category-selector');
  const colorSwatches = document.getElementById('color-swatches');
  const tryClickBtn = document.getElementById('try-click-btn');
  const copyCodeBtn = document.getElementById('copy-code-btn');
  const appToast = document.getElementById('app-toast');

  // Preview elements
  const canvasHookTitle = document.getElementById('canvas-hook-title');
  const canvasHookDesc = document.getElementById('canvas-hook-desc');
  const canvasCtaBtn = document.getElementById('canvas-cta-btn');
  const canvasBtnText = document.getElementById('canvas-btn-text');
  const canvasBtnIcon = document.getElementById('canvas-btn-icon');
  const canvasSubtextLabel = document.getElementById('canvas-subtext-label');
  const canvasSubtext = document.getElementById('canvas-subtext');

  // Code Tab elements
  const codeTabButtons = document.querySelectorAll('.cta-code-tab-btn');
  const ctaCodeDisplay = document.getElementById('cta-code-display');

  // State
  let activeColorKey = 'blue';
  let activeCodeTab = 'css-html';

  // Toast Helper
  let toastTimer = null;
  function showToast(message) {
    if (toastTimer) clearTimeout(toastTimer);
    appToast.textContent = message;
    appToast.classList.add('show');
    toastTimer = setTimeout(() => {
      appToast.classList.remove('show');
    }, 2400);
  }

  // Update Live Preview and Code
  function updatePreview() {
    const headline = headlineInput.value.trim() || 'Supercharge Your Results Today';
    const btnText = buttonTextInput.value.trim() || 'Get Started Now';
    const subtext = subtextInput.value.trim();
    const iconKey = iconSelect.value;
    const radius = radiusSelect.value;
    const sizeKey = sizeSelect.value;
    const shadowType = shadowSelect.value;
    const palette = COLOR_PALETTES[activeColorKey] || COLOR_PALETTES.blue;
    const sizeConfig = SIZES[sizeKey] || SIZES.regular;

    // Update Banner Texts
    canvasHookTitle.textContent = headline;
    canvasBtnText.textContent = btnText;

    if (subtext) {
      canvasSubtext.style.display = 'flex';
      canvasSubtextLabel.textContent = subtext;
    } else {
      canvasSubtext.style.display = 'none';
    }

    // Update Icon
    if (ICONS[iconKey]) {
      canvasBtnIcon.innerHTML = ICONS[iconKey];
      canvasBtnIcon.style.display = 'inline-flex';
    } else {
      canvasBtnIcon.innerHTML = '';
      canvasBtnIcon.style.display = 'none';
    }

    // Apply Styles to Live Button
    canvasCtaBtn.style.background = palette.gradient;
    canvasCtaBtn.style.padding = sizeConfig.padding;
    canvasCtaBtn.style.fontSize = sizeConfig.fontSize;
    canvasCtaBtn.style.borderRadius = radius;

    if (shadowType === 'intense') {
      canvasCtaBtn.style.boxShadow = palette.glow;
    } else if (shadowType === 'subtle') {
      canvasCtaBtn.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.25)';
    } else {
      canvasCtaBtn.style.boxShadow = 'none';
    }

    generateCodeOutputs();
  }

  // Generate CSS + HTML Snippets
  function generateCodeOutputs() {
    const btnText = buttonTextInput.value.trim() || 'Get Started Now';
    const subtext = subtextInput.value.trim();
    const iconKey = iconSelect.value;
    const radius = radiusSelect.value;
    const sizeKey = sizeSelect.value;
    const shadowType = shadowSelect.value;
    const palette = COLOR_PALETTES[activeColorKey] || COLOR_PALETTES.blue;
    const sizeConfig = SIZES[sizeKey] || SIZES.regular;

    const shadowCss = shadowType === 'intense'
      ? `box-shadow: ${palette.glow};`
      : shadowType === 'subtle'
      ? `box-shadow: 0 4px 12px rgba(0, 0, 0, 0.25);`
      : `box-shadow: none;`;

    const hoverShadowCss = shadowType === 'intense'
      ? `box-shadow: ${palette.hoverGlow};`
      : shadowType === 'subtle'
      ? `box-shadow: 0 6px 16px rgba(0, 0, 0, 0.35);`
      : `box-shadow: none;`;

    if (activeCodeTab === 'css-html') {
      let code = `<!-- High-Converting CTA Button -->\n`;
      code += `<style>\n`;
      code += `  .btn-cta-custom {\n`;
      code += `    display: inline-flex;\n`;
      code += `    align-items: center;\n`;
      code += `    justify-content: center;\n`;
      code += `    gap: 0.65rem;\n`;
      code += `    background: ${palette.gradient};\n`;
      code += `    color: #ffffff;\n`;
      code += `    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;\n`;
      code += `    font-size: ${sizeConfig.fontSize};\n`;
      code += `    font-weight: 700;\n`;
      code += `    text-decoration: none;\n`;
      code += `    padding: ${sizeConfig.padding};\n`;
      code += `    border-radius: ${radius};\n`;
      code += `    ${shadowCss}\n`;
      code += `    transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);\n`;
      code += `    cursor: pointer;\n`;
      code += `    border: none;\n`;
      code += `  }\n`;
      code += `  .btn-cta-custom:hover {\n`;
      code += `    transform: translateY(-2px);\n`;
      code += `    ${hoverShadowCss}\n`;
      code += `  }\n`;
      code += `  .btn-cta-custom:active {\n`;
      code += `    transform: translateY(1px);\n`;
      code += `  }\n`;
      if (subtext) {
        code += `  .cta-subtext {\n`;
        code += `    font-size: 0.75rem;\n`;
        code += `    color: #94a3b8;\n`;
        code += `    margin-top: 0.5rem;\n`;
        code += `    text-align: center;\n`;
        code += `  }\n`;
      }
      code += `</style>\n\n`;

      code += `<div style="display: inline-flex; flex-direction: column; align-items: center;">\n`;
      code += `  <a href="#" class="btn-cta-custom">\n`;
      code += `    <span>${btnText}</span>\n`;
      if (iconKey !== 'none') {
        code += `    <span>&rarr;</span>\n`;
      }
      code += `  </a>\n`;
      if (subtext) {
        code += `  <span class="cta-subtext">${subtext}</span>\n`;
      }
      code += `</div>`;

      ctaCodeDisplay.textContent = code;
    } else {
      // Inline HTML
      let inlineStyle = `display: inline-flex; align-items: center; justify-content: center; gap: 0.65rem; background: ${palette.gradient}; color: #ffffff; font-family: sans-serif; font-size: ${sizeConfig.fontSize}; font-weight: 700; text-decoration: none; padding: ${sizeConfig.padding}; border-radius: ${radius}; ${shadowCss} transition: transform 0.2s;`;

      let code = `<div style="display: inline-flex; flex-direction: column; align-items: center; gap: 0.5rem;">\n`;
      code += `  <a href="#" style="${inlineStyle}">\n`;
      code += `    <span>${btnText}</span>\n`;
      if (iconKey !== 'none') {
        code += `    <span>&rarr;</span>\n`;
      }
      code += `  </a>\n`;
      if (subtext) {
        code += `  <span style="font-size: 0.75rem; color: #94a3b8; font-family: sans-serif;">${subtext}</span>\n`;
      }
      code += `</div>`;

      ctaCodeDisplay.textContent = code;
    }
  }

  // Category Presets Selection
  categorySelector.querySelectorAll('.cta-cat-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      categorySelector.querySelectorAll('.cta-cat-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const catKey = btn.dataset.cat;
      const preset = CTA_PRESETS[catKey];
      if (preset) {
        headlineInput.value = preset.headline;
        buttonTextInput.value = preset.buttonText;
        subtextInput.value = preset.subtext;
        iconSelect.value = preset.icon;
        radiusSelect.value = preset.radius;
        sizeSelect.value = preset.size;
        shadowSelect.value = preset.shadow;

        // Set active color swatch
        activeColorKey = preset.color;
        colorSwatches.querySelectorAll('.color-swatch').forEach(sw => {
          sw.classList.toggle('active', sw.dataset.color === activeColorKey);
        });

        canvasHookDesc.textContent = preset.desc;
        updatePreview();
        showToast(`Loaded ${btn.textContent.trim()} preset!`);
      }
    });
  });

  // Color Swatch Selection
  colorSwatches.querySelectorAll('.color-swatch').forEach(sw => {
    sw.addEventListener('click', () => {
      colorSwatches.querySelectorAll('.color-swatch').forEach(s => s.classList.remove('active'));
      sw.classList.add('active');
      activeColorKey = sw.dataset.color;
      updatePreview();
    });
  });

  // Input Change Listeners
  [headlineInput, buttonTextInput, subtextInput].forEach(el => {
    el.addEventListener('input', updatePreview);
  });

  [iconSelect, radiusSelect, sizeSelect, shadowSelect].forEach(el => {
    el.addEventListener('change', updatePreview);
  });

  // Test Click Animation
  tryClickBtn.addEventListener('click', () => {
    canvasCtaBtn.style.transform = 'scale(0.95)';
    setTimeout(() => {
      canvasCtaBtn.style.transform = 'translateY(-3px)';
      showToast('Button click simulated! Ready for production deployment.');
    }, 150);
    setTimeout(() => {
      canvasCtaBtn.style.transform = '';
    }, 450);
  });

  // Canvas CTA Button Click
  canvasCtaBtn.addEventListener('click', () => {
    tryClickBtn.click();
  });

  // Code Tab Switching
  codeTabButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      codeTabButtons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      activeCodeTab = btn.dataset.tab;
      generateCodeOutputs();
    });
  });

  // Copy Code
  copyCodeBtn.addEventListener('click', () => {
    const code = ctaCodeDisplay.textContent;
    if (!code) return;
    navigator.clipboard.writeText(code).then(() => {
      showToast('Copied ready-to-paste CTA code!');
    });
  });

  // Initial Run
  updatePreview();
});