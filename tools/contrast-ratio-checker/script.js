// WCAG 2.1 Contrast Ratio Checker - Interactive Vanilla JS
document.addEventListener('DOMContentLoaded', () => {
  // DOM References
  const fgPicker = document.getElementById('fg-color-picker');
  const fgHexInput = document.getElementById('fg-hex-input');
  const fgRgbText = document.getElementById('fg-rgb-text');
  const fgHslText = document.getElementById('fg-hsl-text');
  const fgLightenBtn = document.getElementById('fg-lighten-btn');
  const fgDarkenBtn = document.getElementById('fg-darken-btn');

  const bgPicker = document.getElementById('bg-color-picker');
  const bgHexInput = document.getElementById('bg-hex-input');
  const bgRgbText = document.getElementById('bg-rgb-text');
  const bgHslText = document.getElementById('bg-hsl-text');
  const bgLightenBtn = document.getElementById('bg-lighten-btn');
  const bgDarkenBtn = document.getElementById('bg-darken-btn');

  const swapBtn = document.getElementById('swap-colors-btn');
  const presetPillList = document.getElementById('preset-pill-list');

  const ratioDisplay = document.getElementById('ratio-display');
  const ratioStatusBadge = document.getElementById('ratio-status-badge');
  const ratioRatingLabel = document.getElementById('ratio-rating-label');

  const badgeAaNormal = document.getElementById('badge-aa-normal');
  const badgeAaLarge = document.getElementById('badge-aa-large');
  const badgeAaaNormal = document.getElementById('badge-aaa-normal');
  const badgeUiComponents = document.getElementById('badge-ui-components');

  const samplePreviewStage = document.getElementById('sample-preview-stage');
  const suggestionDesc = document.getElementById('suggestion-desc');
  const suggestionActions = document.getElementById('suggestion-actions');

  const copyReportBtn = document.getElementById('copy-report-btn');
  const copyCssBtn = document.getElementById('copy-css-btn');
  const shareLinkBtn = document.getElementById('share-link-btn');

  const toast = document.getElementById('toast');
  const toastText = document.getElementById('toast-text');

  // Presets definition
  const presets = [
    { name: 'Dark Mode', fg: '#F8FAFC', bg: '#0F172A' },
    { name: 'Clean White', fg: '#0F172A', bg: '#FFFFFF' },
    { name: 'Brand Cobalt', fg: '#FFFFFF', bg: '#2563EB' },
    { name: 'Emerald Forest', fg: '#FFFFFF', bg: '#065F46' },
    { name: 'Amber Alert', fg: '#78350F', bg: '#FEF3C7' },
    { name: 'Failing Sample', fg: '#94A3B8', bg: '#E2E8F0' }
  ];

  // Helper: Toast
  let toastTimer = null;
  function showToast(msg) {
    if (toastTimer) clearTimeout(toastTimer);
    toastText.textContent = msg;
    toast.classList.add('show');
    toastTimer = setTimeout(() => {
      toast.classList.remove('show');
    }, 2400);
  }

  // --- Color Conversion & Math ---
  function parseHex(hex) {
    let clean = hex.replace(/^#/, '').trim();
    if (clean.length === 3) {
      clean = clean.split('').map(c => c + c).join('');
    }
    if (!/^[0-9A-Fa-f]{6}$/.test(clean)) return null;
    const num = parseInt(clean, 16);
    return {
      r: (num >> 16) & 255,
      g: (num >> 8) & 255,
      b: num & 255,
      hex: '#' + clean.toUpperCase()
    };
  }

  function rgbToHex(r, g, b) {
    const toHex = c => Math.max(0, Math.min(255, Math.round(c))).toString(16).padStart(2, '0');
    return `#${toHex(r)}${toHex(g)}${toHex(b)}`.toUpperCase();
  }

  function rgbToHsl(r, g, b) {
    r /= 255; g /= 255; b /= 255;
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let h = 0, s = 0;
    const l = (max + min) / 2;

    if (max !== min) {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      switch (max) {
        case r: h = (g - b) / d + (g < b ? 6 : 0); break;
        case g: h = (b - r) / d + 2; break;
        case b: h = (r - g) / d + 4; break;
      }
      h /= 6;
    }
    return {
      h: Math.round(h * 360),
      s: Math.round(s * 100),
      l: Math.round(l * 100)
    };
  }

  function hslToRgb(h, s, l) {
    h = (h % 360 + 360) % 360 / 360;
    s /= 100;
    l /= 100;
    let r, g, b;
    if (s === 0) {
      r = g = b = l;
    } else {
      const hue2rgb = (p, q, t) => {
        if (t < 0) t += 1;
        if (t > 1) t -= 1;
        if (t < 1 / 6) return p + (q - p) * 6 * t;
        if (t < 1 / 2) return q;
        if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
        return p;
      };
      const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
      const p = 2 * l - q;
      r = hue2rgb(p, q, h + 1 / 3);
      g = hue2rgb(p, q, h);
      b = hue2rgb(p, q, h - 1 / 3);
    }
    return {
      r: Math.round(r * 255),
      g: Math.round(g * 255),
      b: Math.round(b * 255)
    };
  }

  // WCAG 2.1 Relative Luminance
  function getLuminance(r, g, b) {
    const sRGB = [r, g, b].map(v => {
      const c = v / 255;
      return c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
    });
    return 0.2126 * sRGB[0] + 0.7152 * sRGB[1] + 0.0722 * sRGB[2];
  }

  function calculateContrastRatio(rgb1, rgb2) {
    const lum1 = getLuminance(rgb1.r, rgb1.g, rgb1.b);
    const lum2 = getLuminance(rgb2.r, rgb2.g, rgb2.b);
    const brightest = Math.max(lum1, lum2);
    const darkest = Math.min(lum1, lum2);
    return (brightest + 0.05) / (darkest + 0.05);
  }

  // Adjust Lightness by Delta (-100 to 100)
  function adjustLightness(hex, deltaPercent) {
    const rgb = parseHex(hex);
    if (!rgb) return hex;
    const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);
    hsl.l = Math.max(0, Math.min(100, hsl.l + deltaPercent));
    const newRgb = hslToRgb(hsl.h, hsl.s, hsl.l);
    return rgbToHex(newRgb.r, newRgb.g, newRgb.b);
  }

  // --- Auto-Suggestion Algorithm ---
  function findPassingColor(targetRatio, baseFgRgb, baseBgRgb) {
    const fgHsl = rgbToHsl(baseFgRgb.r, baseFgRgb.g, baseFgRgb.b);
    const bgLum = getLuminance(baseBgRgb.r, baseBgRgb.g, baseBgRgb.b);

    // If background is dark (lum < 0.18), we want a lighter foreground
    // If background is light (lum >= 0.18), we want a darker foreground
    const preferLight = bgLum < 0.18;
    const step = preferLight ? 1 : -1;
    let bestHex = null;

    for (let l = fgHsl.l; preferLight ? l <= 100 : l >= 0; l += step) {
      const testRgb = hslToRgb(fgHsl.h, fgHsl.s, l);
      const ratio = calculateContrastRatio(testRgb, baseBgRgb);
      if (ratio >= targetRatio) {
        bestHex = rgbToHex(testRgb.r, testRgb.g, testRgb.b);
        break;
      }
    }

    // Fallback if hue/sat saturation prevented reaching target
    if (!bestHex) {
      bestHex = preferLight ? '#FFFFFF' : '#000000';
    }
    return bestHex;
  }

  // --- Update & Audit Logic ---
  function updateAudit() {
    const fgParsed = parseHex(fgHexInput.value);
    const bgParsed = parseHex(bgHexInput.value);

    if (!fgParsed || !bgParsed) return;

    // Synchronize inputs
    fgPicker.value = fgParsed.hex;
    bgPicker.value = bgParsed.hex;

    const fgHsl = rgbToHsl(fgParsed.r, fgParsed.g, fgParsed.b);
    const bgHsl = rgbToHsl(bgParsed.r, bgParsed.g, bgParsed.b);

    fgRgbText.textContent = `RGB: ${fgParsed.r}, ${fgParsed.g}, ${fgParsed.b}`;
    fgHslText.textContent = `HSL: ${fgHsl.h}°, ${fgHsl.s}%, ${fgHsl.l}%`;

    bgRgbText.textContent = `RGB: ${bgParsed.r}, ${bgParsed.g}, ${bgParsed.b}`;
    bgHslText.textContent = `HSL: ${bgHsl.h}°, ${bgHsl.s}%, ${bgHsl.l}%`;

    // Contrast Ratio
    const ratio = calculateContrastRatio(fgParsed, bgParsed);
    const ratioFormatted = ratio.toFixed(2);
    ratioDisplay.textContent = `${ratioFormatted} : 1`;

    // Update Interactive Stage
    samplePreviewStage.style.backgroundColor = bgParsed.hex;
    samplePreviewStage.style.color = fgParsed.hex;

    // Checks
    const passAaNormal = ratio >= 4.5;
    const passAaLarge = ratio >= 3.0;
    const passAaaNormal = ratio >= 7.0;
    const passUi = ratio >= 3.0;

    // Helper to style badge
    function setBadge(el, pass, minVal) {
      if (pass) {
        el.className = 'wcag-badge badge-pass';
        el.textContent = `Pass (${minVal}:1)`;
      } else {
        el.className = 'wcag-badge badge-fail';
        el.textContent = `Fail (< ${minVal}:1)`;
      }
    }

    setBadge(badgeAaNormal, passAaNormal, '4.5');
    setBadge(badgeAaLarge, passAaLarge, '3.0');
    setBadge(badgeAaaNormal, passAaaNormal, '7.0');
    setBadge(badgeUiComponents, passUi, '3.0');

    // Overall Rating Badge
    if (passAaaNormal) {
      ratioStatusBadge.className = 'ratio-status-pill badge-pass';
      ratioRatingLabel.textContent = 'Enhanced Pass (AAA)';
    } else if (passAaNormal) {
      ratioStatusBadge.className = 'ratio-status-pill badge-pass';
      ratioRatingLabel.textContent = 'Acceptable Pass (AA)';
    } else if (passAaLarge) {
      ratioStatusBadge.className = 'ratio-status-pill';
      ratioStatusBadge.style.background = 'rgba(245, 158, 11, 0.15)';
      ratioStatusBadge.style.color = '#f59e0b';
      ratioStatusBadge.style.border = '1px solid rgba(245, 158, 11, 0.35)';
      ratioRatingLabel.textContent = 'Large Text Only (3.0+)';
    } else {
      ratioStatusBadge.className = 'ratio-status-pill badge-fail';
      ratioRatingLabel.textContent = 'Inaccessible (Fail)';
    }

    // Auto-Suggestions
    updateSuggestions(ratio, fgParsed, bgParsed);
  }

  function updateSuggestions(currentRatio, fgParsed, bgParsed) {
    suggestionActions.innerHTML = '';

    if (currentRatio >= 7.0) {
      suggestionDesc.innerHTML = `<strong>Great job!</strong> Your current contrast ratio (${currentRatio.toFixed(2)}:1) satisfies all WCAG 2.1 AA and AAA standards.`;
      return;
    }

    const suggestions = [];

    if (currentRatio < 4.5) {
      const aaColor = findPassingColor(4.5, fgParsed, bgParsed);
      suggestions.push({
        target: 'AA Normal (4.5:1)',
        color: aaColor,
        isAa: true
      });
    }

    if (currentRatio < 7.0) {
      const aaaColor = findPassingColor(7.0, fgParsed, bgParsed);
      suggestions.push({
        target: 'AAA Normal (7.0:1)',
        color: aaaColor,
        isAa: false
      });
    }

    suggestionDesc.textContent = `Current contrast does not meet enhanced guidelines. Apply one of the nearest tone-adjusted colors below:`;

    suggestions.forEach(item => {
      const btn = document.createElement('button');
      btn.className = 'btn btn-secondary';
      btn.style.fontSize = '0.8rem';
      btn.style.padding = '0.4rem 0.85rem';
      btn.style.display = 'inline-flex';
      btn.style.alignItems = 'center';
      btn.style.gap = '0.5rem';

      btn.innerHTML = `
        <span style="width: 14px; height: 14px; border-radius: 3px; background: ${item.color}; border: 1px solid var(--border);"></span>
        <span>Apply ${item.color} for ${item.target}</span>
      `;

      btn.addEventListener('click', () => {
        fgHexInput.value = item.color;
        fgPicker.value = item.color;
        updateAudit();
        showToast(`Applied ${item.color} to foreground!`);
      });

      suggestionActions.appendChild(btn);
    });
  }

  // --- Input Listeners ---
  fgPicker.addEventListener('input', (e) => {
    fgHexInput.value = e.target.value.toUpperCase();
    updateAudit();
  });

  fgHexInput.addEventListener('input', (e) => {
    let val = e.target.value.trim();
    if (!val.startsWith('#')) val = '#' + val;
    if (/^#[0-9A-Fa-f]{6}$/.test(val)) {
      updateAudit();
    }
  });

  bgPicker.addEventListener('input', (e) => {
    bgHexInput.value = e.target.value.toUpperCase();
    updateAudit();
  });

  bgHexInput.addEventListener('input', (e) => {
    let val = e.target.value.trim();
    if (!val.startsWith('#')) val = '#' + val;
    if (/^#[0-9A-Fa-f]{6}$/.test(val)) {
      updateAudit();
    }
  });

  // Lighten / Darken Stepper Buttons
  fgLightenBtn.addEventListener('click', () => {
    fgHexInput.value = adjustLightness(fgHexInput.value, 6);
    updateAudit();
  });
  fgDarkenBtn.addEventListener('click', () => {
    fgHexInput.value = adjustLightness(fgHexInput.value, -6);
    updateAudit();
  });

  bgLightenBtn.addEventListener('click', () => {
    bgHexInput.value = adjustLightness(bgHexInput.value, 6);
    updateAudit();
  });
  bgDarkenBtn.addEventListener('click', () => {
    bgHexInput.value = adjustLightness(bgHexInput.value, -6);
    updateAudit();
  });

  // Swap Colors
  swapBtn.addEventListener('click', () => {
    const temp = fgHexInput.value;
    fgHexInput.value = bgHexInput.value;
    bgHexInput.value = temp;
    updateAudit();
    showToast('Swapped text and background colors!');
  });

  // Render Presets
  function renderPresets() {
    presetPillList.innerHTML = '';
    presets.forEach(p => {
      const pill = document.createElement('div');
      pill.className = 'preset-pill';
      pill.innerHTML = `
        <span class="preset-dot" style="background: ${p.bg}; box-shadow: inset 0 0 0 3px ${p.fg};"></span>
        <span>${p.name}</span>
      `;
      pill.addEventListener('click', () => {
        fgHexInput.value = p.fg;
        bgHexInput.value = p.bg;
        updateAudit();
        showToast(`Loaded ${p.name} preset!`);
      });
      presetPillList.appendChild(pill);
    });
  }

  // Action Buttons
  copyReportBtn.addEventListener('click', () => {
    const fg = fgHexInput.value.toUpperCase();
    const bg = bgHexInput.value.toUpperCase();
    const ratio = ratioDisplay.textContent;
    const rating = ratioRatingLabel.textContent;

    const report = [
      `WCAG 2.1 Contrast Audit Report`,
      `Foreground: ${fg}`,
      `Background: ${bg}`,
      `Contrast Ratio: ${ratio}`,
      `Overall Rating: ${rating}`,
      `AA Normal Text (4.5:1): ${badgeAaNormal.textContent}`,
      `AA Large Text (3.0:1): ${badgeAaLarge.textContent}`,
      `AAA Normal Text (7.0:1): ${badgeAaaNormal.textContent}`,
      `UI Components (3.0:1): ${badgeUiComponents.textContent}`,
      `Audit generated at: ${new Date().toLocaleString()}`
    ].join('\n');

    navigator.clipboard.writeText(report).then(() => {
      showToast('Contrast audit report copied!');
    });
  });

  copyCssBtn.addEventListener('click', () => {
    const fg = fgHexInput.value.toUpperCase();
    const bg = bgHexInput.value.toUpperCase();
    const cssRules = [
      `/* Accessible Color Scheme */`,
      `color: ${fg};`,
      `background-color: ${bg};`,
      `border-color: ${fg};`
    ].join('\n');

    navigator.clipboard.writeText(cssRules).then(() => {
      showToast('CSS rules copied to clipboard!');
    });
  });

  shareLinkBtn.addEventListener('click', () => {
    const url = new URL(window.location.href);
    url.searchParams.set('fg', fgHexInput.value.replace('#', ''));
    url.searchParams.set('bg', bgHexInput.value.replace('#', ''));
    navigator.clipboard.writeText(url.toString()).then(() => {
      window.history.replaceState({}, '', url.toString());
      showToast('Shareable link copied to clipboard!');
    });
  });

  // Init from URL params
  function initFromUrl() {
    const params = new URLSearchParams(window.location.search);
    const fgParam = params.get('fg');
    const bgParam = params.get('bg');
    if (fgParam && /^[0-9A-Fa-f]{6}$/.test(fgParam)) {
      fgHexInput.value = '#' + fgParam.toUpperCase();
    }
    if (bgParam && /^[0-9A-Fa-f]{6}$/.test(bgParam)) {
      bgHexInput.value = '#' + bgParam.toUpperCase();
    }
  }

  // Boot
  renderPresets();
  initFromUrl();
  updateAudit();
});