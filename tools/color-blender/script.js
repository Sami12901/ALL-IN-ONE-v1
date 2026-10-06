// Color Blender - Multi-Step Gradient & Color Interpolation Mixer
// Supports LCH, Lab, HSL, RGB, and Linear RGB interpolation spaces.

document.addEventListener('DOMContentLoaded', () => {
  // --- DOM Elements ---
  const color1Picker = document.getElementById('color1-picker');
  const color1Hex = document.getElementById('color1-hex');
  const color1RgbHint = document.getElementById('color1-rgb-hint');
  const color1CmykHint = document.getElementById('color1-cmyk-hint');

  const color2Picker = document.getElementById('color2-picker');
  const color2Hex = document.getElementById('color2-hex');
  const color2RgbHint = document.getElementById('color2-rgb-hint');
  const color2CmykHint = document.getElementById('color2-cmyk-hint');

  const swapColorsBtn = document.getElementById('swap-colors-btn');
  const randomColorsBtn = document.getElementById('random-colors-btn');

  const blendStepsSlider = document.getElementById('blend-steps-slider');
  const blendStepsVal = document.getElementById('blend-steps-val');
  const swatchCountLabel = document.getElementById('swatch-count-label');
  const stepPills = document.querySelectorAll('.step-pill');

  const colorSpaceSelect = document.getElementById('color-space-select');
  const spaceDescBadge = document.getElementById('space-desc-badge');
  const spaceExplainerText = document.getElementById('space-explainer-text');

  const presetsContainer = document.getElementById('presets-container');
  const continuousGradientBar = document.getElementById('continuous-gradient-bar');
  const gradientCssHint = document.getElementById('gradient-css-hint');
  const steppedSwatchesRow = document.getElementById('stepped-swatches-row');
  const detailedCardsGrid = document.getElementById('detailed-cards-grid');

  const copyHexArrayBtn = document.getElementById('copy-hex-array-btn');
  const exportSwatchPngBtn = document.getElementById('export-swatch-png-btn');
  const exportSwatchCanvas = document.getElementById('export-swatch-canvas');

  const exportTabs = document.querySelectorAll('.tab-code-btn');
  const codeOutputBox = document.getElementById('code-output-box');
  const copyCodeBoxBtn = document.getElementById('copy-code-box-btn');

  const toast = document.getElementById('toast');
  const toastText = document.getElementById('toast-text');

  // --- State ---
  let color1 = '#3B82F6';
  let color2 = '#EC4899';
  let steps = 7;
  let colorSpace = 'lch'; // 'lch' | 'lab' | 'hsl' | 'rgb' | 'linear-rgb'
  let activeCodeTab = 'gradient-css'; // 'gradient-css' | 'css-vars' | 'tailwind' | 'json' | 'hex-list'
  let generatedSwatches = []; // Array of { hex, rgb, hsl }

  // --- Toast Notification ---
  let toastTimer = null;
  function showToast(msg) {
    if (toastTimer) clearTimeout(toastTimer);
    toastText.textContent = msg;
    toast.classList.add('show');
    toastTimer = setTimeout(() => {
      toast.classList.remove('show');
    }, 2400);
  }

  // --- Math & Color Conversion Library ---

  function clamp(v, min, max) {
    return Math.max(min, Math.min(max, v));
  }

  function hexToRgb(hex) {
    let clean = hex.replace(/^#/, '');
    if (clean.length === 3) {
      clean = clean.split('').map(c => c + c).join('');
    }
    const val = parseInt(clean, 16);
    if (isNaN(val) || clean.length !== 6) return { r: 0, g: 0, b: 0 };
    return {
      r: (val >> 16) & 255,
      g: (val >> 8) & 255,
      b: val & 255
    };
  }

  function rgbToHex(r, g, b) {
    const toH = c => clamp(Math.round(c), 0, 255).toString(16).padStart(2, '0');
    return `#${toH(r)}${toH(g)}${toH(b)}`.toUpperCase();
  }

  function rgbToHsl(r, g, b) {
    r /= 255; g /= 255; b /= 255;
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let h = 0, s = 0, l = (max + min) / 2;

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
    h = (((h % 360) + 360) % 360) / 360;
    s /= 100;
    l /= 100;

    if (s === 0) {
      const v = Math.round(l * 255);
      return { r: v, g: v, b: v };
    }

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
    return {
      r: Math.round(hue2rgb(p, q, h + 1 / 3) * 255),
      g: Math.round(hue2rgb(p, q, h) * 255),
      b: Math.round(hue2rgb(p, q, h - 1 / 3) * 255)
    };
  }

  function rgbToCmyk(r, g, b) {
    r /= 255; g /= 255; b /= 255;
    const k = 1 - Math.max(r, g, b);
    if (k === 1) return { c: 0, m: 0, y: 0, k: 100 };
    const c = Math.round(((1 - r - k) / (1 - k)) * 100);
    const m = Math.round(((1 - g - k) / (1 - k)) * 100);
    const y = Math.round(((1 - b - k) / (1 - k)) * 100);
    return { c, m, y, k: Math.round(k * 100) };
  }

  // --- Linear RGB & CIE XYZ (D65 standard) Conversions ---
  function srgbToLinear(c) {
    c /= 255;
    return c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  }

  function linearToSrgb(c) {
    c = clamp(c, 0, 1);
    return Math.round((c <= 0.0031308 ? 12.92 * c : 1.055 * Math.pow(c, 1 / 2.4) - 0.055) * 255);
  }

  function rgbToXyz(r, g, b) {
    const rLin = srgbToLinear(r);
    const gLin = srgbToLinear(g);
    const bLin = srgbToLinear(b);

    return {
      x: rLin * 0.4124564 + gLin * 0.3575761 + bLin * 0.1804375,
      y: rLin * 0.2126729 + gLin * 0.7151522 + bLin * 0.0721750,
      z: rLin * 0.0193339 + gLin * 0.1191920 + bLin * 0.9503041
    };
  }

  function xyzToRgb(x, y, z) {
    const rLin = x * 3.2404542 + y * -1.5371385 + z * -0.4985314;
    const gLin = x * -0.9692660 + y * 1.8760108 + z * 0.0415560;
    const bLin = x * 0.0556434 + y * -0.2040259 + z * 1.0572252;

    return {
      r: linearToSrgb(rLin),
      g: linearToSrgb(gLin),
      b: linearToSrgb(bLin)
    };
  }

  // --- CIE XYZ to CIE L*a*b* (D65 Illuminant) ---
  const D65_XN = 0.95047;
  const D65_YN = 1.00000;
  const D65_ZN = 1.08883;

  function xyzToLab(x, y, z) {
    const fx = fLab(x / D65_XN);
    const fy = fLab(y / D65_YN);
    const fz = fLab(z / D65_ZN);

    return {
      l: 116 * fy - 16,
      a: 500 * (fx - fy),
      b: 200 * (fy - fz)
    };
  }

  function fLab(t) {
    return t > 0.00885645 ? Math.cbrt(t) : 7.787037 * t + 16 / 116;
  }

  function labToXyz(l, a, b) {
    const fy = (l + 16) / 116;
    const fx = a / 500 + fy;
    const fz = fy - b / 200;

    return {
      x: D65_XN * finvLab(fx),
      y: D65_YN * finvLab(fy),
      z: D65_ZN * finvLab(fz)
    };
  }

  function finvLab(t) {
    const t3 = t * t * t;
    return t3 > 0.00885645 ? t3 : (t - 16 / 116) / 7.787037;
  }

  // --- CIE L*a*b* to CIE L*C*h ---
  function labToLch(l, a, b) {
    const c = Math.sqrt(a * a + b * b);
    let h = (Math.atan2(b, a) * 180) / Math.PI;
    if (h < 0) h += 360;
    return { l, c, h };
  }

  function lchToLab(l, c, h) {
    const rad = (h * Math.PI) / 180;
    return {
      l,
      a: c * Math.cos(rad),
      b: c * Math.sin(rad)
    };
  }

  // --- Shortest Arc Angular Interpolation ---
  function interpolateAngle(a1, a2, t) {
    const diff = ((((a2 - a1) % 360) + 540) % 360) - 180;
    return (a1 + diff * t + 360) % 360;
  }

  // --- Master Interpolation Functions ---
  function interpolateColor(hexA, hexB, t, space) {
    const rgbA = hexToRgb(hexA);
    const rgbB = hexToRgb(hexB);

    if (space === 'rgb') {
      return {
        r: clamp(Math.round(rgbA.r + (rgbB.r - rgbA.r) * t), 0, 255),
        g: clamp(Math.round(rgbA.g + (rgbB.g - rgbA.g) * t), 0, 255),
        b: clamp(Math.round(rgbA.b + (rgbB.b - rgbA.b) * t), 0, 255)
      };
    }

    if (space === 'linear-rgb') {
      const rLin = srgbToLinear(rgbA.r) + (srgbToLinear(rgbB.r) - srgbToLinear(rgbA.r)) * t;
      const gLin = srgbToLinear(rgbA.g) + (srgbToLinear(rgbB.g) - srgbToLinear(rgbA.g)) * t;
      const bLin = srgbToLinear(rgbA.b) + (srgbToLinear(rgbB.b) - srgbToLinear(rgbA.b)) * t;
      return {
        r: linearToSrgb(rLin),
        g: linearToSrgb(gLin),
        b: linearToSrgb(bLin)
      };
    }

    if (space === 'hsl') {
      const hslA = rgbToHsl(rgbA.r, rgbA.g, rgbA.b);
      const hslB = rgbToHsl(rgbB.r, rgbB.g, rgbB.b);
      const h = interpolateAngle(hslA.h, hslB.h, t);
      const s = hslA.s + (hslB.s - hslA.s) * t;
      const l = hslA.l + (hslB.l - hslA.l) * t;
      return hslToRgb(h, s, l);
    }

    if (space === 'lab') {
      const xyzA = rgbToXyz(rgbA.r, rgbA.g, rgbA.b);
      const labA = xyzToLab(xyzA.x, xyzA.y, xyzA.z);

      const xyzB = rgbToXyz(rgbB.r, rgbB.g, rgbB.b);
      const labB = xyzToLab(xyzB.x, xyzB.y, xyzB.z);

      const l = labA.l + (labB.l - labA.l) * t;
      const a = labA.a + (labB.a - labA.a) * t;
      const b = labA.b + (labB.b - labA.b) * t;

      const xyzMix = labToXyz(l, a, b);
      return xyzToRgb(xyzMix.x, xyzMix.y, xyzMix.z);
    }

    if (space === 'lch') {
      const xyzA = rgbToXyz(rgbA.r, rgbA.g, rgbA.b);
      const labA = xyzToLab(xyzA.x, xyzA.y, xyzA.z);
      const lchA = labToLch(labA.l, labA.a, labA.b);

      const xyzB = rgbToXyz(rgbB.r, rgbB.g, rgbB.b);
      const labB = xyzToLab(xyzB.x, xyzB.y, xyzB.z);
      const lchB = labToLch(labB.l, labB.a, labB.b);

      const l = lchA.l + (lchB.l - lchA.l) * t;
      const c = lchA.c + (lchB.c - lchA.c) * t;
      const h = interpolateAngle(lchA.h, lchB.h, t);

      const labMix = lchToLab(l, c, h);
      const xyzMix = labToXyz(labMix.l, labMix.a, labMix.b);
      return xyzToRgb(xyzMix.x, xyzMix.y, xyzMix.z);
    }

    return rgbA;
  }

  // --- Curated Preset Inspiration Schemes ---
  const PRESET_SCHEMES = [
    { name: 'Sunset Glow', c1: '#3B185F', c2: '#FEC260', space: 'lch' },
    { name: 'Cyberpunk Neon', c1: '#00F5D4', c2: '#7B2CBF', space: 'lch' },
    { name: 'Emerald to Gold', c1: '#059669', c2: '#FBBF24', space: 'lab' },
    { name: 'Berry Smoothie', c1: '#831843', c2: '#F472B6', space: 'lch' },
    { name: 'Ocean Depths', c1: '#03045E', c2: '#00B4D8', space: 'lab' },
    { name: 'Warm Terracotta', c1: '#7C2D12', c2: '#FDBA74', space: 'lch' },
    { name: 'Neon Aurora', c1: '#10B981', c2: '#6366F1', space: 'lch' },
    { name: 'Royal Indigo', c1: '#1E1B4B', c2: '#C084FC', space: 'lab' }
  ];

  function renderPresets() {
    presetsContainer.innerHTML = '';
    PRESET_SCHEMES.forEach(preset => {
      const btn = document.createElement('button');
      btn.className = 'preset-chip-btn';
      btn.type = 'button';
      btn.innerHTML = `
        <div class="preset-dual-swatch">
          <span style="background-color: ${preset.c1};"></span>
          <span style="background-color: ${preset.c2};"></span>
        </div>
        <span>${preset.name}</span>
      `;
      btn.addEventListener('click', () => {
        color1 = preset.c1;
        color2 = preset.c2;
        colorSpace = preset.space;
        color1Picker.value = color1;
        color1Hex.value = color1;
        color2Picker.value = color2;
        color2Hex.value = color2;
        colorSpaceSelect.value = colorSpace;
        updateUI();
        showToast(`Loaded preset "${preset.name}"`);
      });
      presetsContainer.appendChild(btn);
    });
  }

  // --- Core UI & Swatch Generation Pipeline ---
  function updateUI() {
    // 1. Update text & CMYK indicators for Input 1 & 2
    const rgb1 = hexToRgb(color1);
    color1RgbHint.textContent = `rgb(${rgb1.r}, ${rgb1.g}, ${rgb1.b})`;
    const cmyk1 = rgbToCmyk(rgb1.r, rgb1.g, rgb1.b);
    color1CmykHint.textContent = `C:${cmyk1.c} M:${cmyk1.m} Y:${cmyk1.y} K:${cmyk1.k}`;

    const rgb2 = hexToRgb(color2);
    color2RgbHint.textContent = `rgb(${rgb2.r}, ${rgb2.g}, ${rgb2.b})`;
    const cmyk2 = rgbToCmyk(rgb2.r, rgb2.g, rgb2.b);
    color2CmykHint.textContent = `C:${cmyk2.c} M:${cmyk2.m} Y:${cmyk2.y} K:${cmyk2.k}`;

    // 2. Generate Blend Swatches
    generatedSwatches = [];
    for (let i = 0; i < steps; i++) {
      const t = steps === 1 ? 0 : i / (steps - 1);
      const rgb = interpolateColor(color1, color2, t, colorSpace);
      const hex = rgbToHex(rgb.r, rgb.g, rgb.b);
      const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);
      generatedSwatches.push({ hex, rgb, hsl, t });
    }

    swatchCountLabel.textContent = steps;
    blendStepsVal.textContent = steps;

    // 3. Render Continuous Gradient Bar
    const hexList = generatedSwatches.map(s => s.hex);
    const gradCss = `linear-gradient(90deg, ${hexList.join(', ')})`;
    continuousGradientBar.style.background = gradCss;
    gradientCssHint.textContent = `linear-gradient(90deg, ${color1}, ..., ${color2})`;

    // 4. Render Stepped Swatches Ribbon
    steppedSwatchesRow.innerHTML = '';
    generatedSwatches.forEach((swatch, idx) => {
      const item = document.createElement('div');
      item.className = 'step-swatch-item';
      item.style.backgroundColor = swatch.hex;
      item.title = `Step ${idx + 1} / ${steps}\n${swatch.hex}\nrgb(${swatch.rgb.r}, ${swatch.rgb.g}, ${swatch.rgb.b})\nhsl(${swatch.hsl.h}, ${swatch.hsl.s}%, ${swatch.hsl.l}%)\nClick to copy`;

      const tag = document.createElement('span');
      tag.className = 'step-swatch-tag';
      tag.textContent = swatch.hex;
      item.appendChild(tag);

      item.addEventListener('click', () => {
        navigator.clipboard.writeText(swatch.hex).then(() => {
          showToast(`Copied ${swatch.hex}`);
        });
      });

      steppedSwatchesRow.appendChild(item);
    });

    // 5. Render Detailed Swatch Cards Grid
    detailedCardsGrid.innerHTML = '';
    generatedSwatches.forEach((swatch, idx) => {
      const card = document.createElement('div');
      card.className = 'swatch-card-detail';
      card.innerHTML = `
        <div class="swatch-card-block" style="background-color: ${swatch.hex};">
          <span class="swatch-card-index">#${idx + 1}</span>
        </div>
        <div class="swatch-card-info">
          <span class="swatch-card-hex">${swatch.hex}</span>
          <span class="swatch-card-sub">rgb(${swatch.rgb.r}, ${swatch.rgb.g}, ${swatch.rgb.b})</span>
          <span class="swatch-card-sub">hsl(${swatch.hsl.h}&deg;, ${swatch.hsl.s}%, ${swatch.hsl.l}%)</span>
        </div>
      `;
      card.addEventListener('click', () => {
        navigator.clipboard.writeText(swatch.hex).then(() => {
          showToast(`Copied ${swatch.hex}`);
        });
      });
      detailedCardsGrid.appendChild(card);
    });

    // 6. Update Space Explainer Badge & Text
    updateSpaceLabels();

    // 7. Update Code Output
    renderCodeOutput();
  }

  function updateSpaceLabels() {
    const spaceMap = {
      lch: {
        badge: 'CIE LCh (Perceptual Cylindrical)',
        desc: 'Interpolates through cylindrical LCh space. Maintains vivid saturation and prevents desaturated muddy middle steps.'
      },
      lab: {
        badge: 'CIE Lab (Perceptual Uniform)',
        desc: 'Smooth linear transitions across lightness and chromatic opponent channels. Natural, evenly spaced illumination.'
      },
      hsl: {
        badge: 'HSL (Hue Circle)',
        desc: 'Interpolates along standard hue circle arc. Creates bright rainbow intervals between distant hues.'
      },
      rgb: {
        badge: 'sRGB (Display Standard)',
        desc: 'Direct screen gamma blending. Often creates a darker, muted gray middle between complementary hues.'
      },
      'linear-rgb': {
        badge: 'Linear RGB (Physical Optics)',
        desc: 'Blends light in uncompressed radiometric photon space before applying display gamma compression.'
      }
    };
    const info = spaceMap[colorSpace] || spaceMap.lch;
    spaceDescBadge.textContent = info.badge;
    spaceExplainerText.textContent = info.desc;
  }

  // --- Code Output Generator ---
  function renderCodeOutput() {
    const hexList = generatedSwatches.map(s => s.hex);
    let code = '';

    if (activeCodeTab === 'gradient-css') {
      code = `/* CSS Linear Gradient */
background: ${hexList[0]};
background: linear-gradient(90deg, ${hexList.join(', ')});`;
    } else if (activeCodeTab === 'css-vars') {
      const vars = hexList.map((hex, i) => `  --blend-step-${i + 1}: ${hex};`).join('\n');
      code = `:root {\n${vars}\n}`;
    } else if (activeCodeTab === 'tailwind') {
      const tw = hexList.map((hex, i) => `        '${(i + 1) * 100}': '${hex}',`).join('\n');
      code = `// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      colors: {
        blend: {
${tw}
        }
      }
    }
  }
};`;
    } else if (activeCodeTab === 'json') {
      code = JSON.stringify(hexList, null, 2);
    } else if (activeCodeTab === 'hex-list') {
      code = hexList.join(', ');
    }

    codeOutputBox.textContent = code;
  }

  // Code Tab Clicks
  exportTabs.forEach(btn => {
    btn.addEventListener('click', () => {
      exportTabs.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      activeCodeTab = btn.getAttribute('data-tab');
      renderCodeOutput();
    });
  });

  copyCodeBoxBtn.addEventListener('click', () => {
    navigator.clipboard.writeText(codeOutputBox.textContent).then(() => {
      copyCodeBoxBtn.textContent = 'Copied!';
      copyCodeBoxBtn.classList.add('copied');
      setTimeout(() => {
        copyCodeBoxBtn.textContent = 'Copy';
        copyCodeBoxBtn.classList.remove('copied');
      }, 1800);
      showToast('Copied code to clipboard');
    });
  });

  copyHexArrayBtn.addEventListener('click', () => {
    const list = JSON.stringify(generatedSwatches.map(s => s.hex));
    navigator.clipboard.writeText(list).then(() => {
      showToast(`Copied ${steps} hex colors as JSON array`);
    });
  });

  // Export PNG Swatch Card
  exportSwatchPngBtn.addEventListener('click', () => {
    const canvas = exportSwatchCanvas;
    const ctx = canvas.getContext('2d');
    const width = 1000;
    const height = 480;

    canvas.width = width;
    canvas.height = height;

    // Dark canvas background
    ctx.fillStyle = '#0a0d14';
    ctx.fillRect(0, 0, width, height);

    // Title
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 26px Inter, sans-serif';
    ctx.fillText('Color Blender Palette Ramp', 40, 50);

    ctx.fillStyle = '#94a3b8';
    ctx.font = '14px Inter, sans-serif';
    ctx.fillText(`Steps: ${steps} • Space: ${colorSpace.toUpperCase()} • From ${color1} to ${color2}`, 40, 78);

    // Continuous Gradient Bar
    const grad = ctx.createLinearGradient(40, 105, 960, 105);
    generatedSwatches.forEach(s => {
      grad.addColorStop(s.t, s.hex);
    });
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.roundRect(40, 105, 920, 50, 8);
    ctx.fill();

    // Stepped Swatches Row
    const swatchW = 920 / steps;
    const startY = 180;
    const swatchH = 200;

    generatedSwatches.forEach((s, i) => {
      const x = 40 + i * swatchW;
      ctx.fillStyle = s.hex;
      ctx.fillRect(x, startY, swatchW, swatchH);

      // Label background
      ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
      ctx.fillRect(x + 2, startY + swatchH - 45, swatchW - 4, 40);

      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 11px monospace';
      ctx.textAlign = 'center';
      ctx.fillText(s.hex, x + swatchW / 2, startY + swatchH - 26);

      ctx.fillStyle = '#cbd5e1';
      ctx.font = '9px monospace';
      ctx.fillText(`rgb(${s.rgb.r},${s.rgb.g},${s.rgb.b})`, x + swatchW / 2, startY + swatchH - 12);
      ctx.textAlign = 'left';
    });

    // Footer
    ctx.fillStyle = '#475569';
    ctx.font = '12px Inter, sans-serif';
    ctx.fillText('Generated by ALL IN ONE Color Blender • https://sami12901.github.io/ALL-IN-ONE-v1/', 40, height - 25);

    const link = document.createElement('a');
    link.download = `color-blend-${color1.replace('#','')}-${color2.replace('#','')}-${steps}steps.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
    showToast('Exported palette as PNG');
  });

  // --- Input Event Listeners ---

  // Color 1
  color1Picker.addEventListener('input', (e) => {
    color1 = e.target.value.toUpperCase();
    color1Hex.value = color1;
    updateUI();
  });
  color1Hex.addEventListener('input', (e) => {
    let val = e.target.value.trim().toUpperCase();
    if (!val.startsWith('#')) val = '#' + val;
    if (/^#[0-9A-F]{6}$/i.test(val)) {
      color1 = val;
      color1Picker.value = val;
      updateUI();
    }
  });

  // Color 2
  color2Picker.addEventListener('input', (e) => {
    color2 = e.target.value.toUpperCase();
    color2Hex.value = color2;
    updateUI();
  });
  color2Hex.addEventListener('input', (e) => {
    let val = e.target.value.trim().toUpperCase();
    if (!val.startsWith('#')) val = '#' + val;
    if (/^#[0-9A-F]{6}$/i.test(val)) {
      color2 = val;
      color2Picker.value = val;
      updateUI();
    }
  });

  // Swap Colors
  swapColorsBtn.addEventListener('click', () => {
    const temp = color1;
    color1 = color2;
    color2 = temp;
    color1Picker.value = color1;
    color1Hex.value = color1;
    color2Picker.value = color2;
    color2Hex.value = color2;
    updateUI();
    showToast('Swapped Color 1 and Color 2');
  });

  // Random Colors
  randomColorsBtn.addEventListener('click', () => {
    const randHex = () => '#' + Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0').toUpperCase();
    color1 = randHex();
    color2 = randHex();
    color1Picker.value = color1;
    color1Hex.value = color1;
    color2Picker.value = color2;
    color2Hex.value = color2;
    updateUI();
    showToast('Generated random colors');
  });

  // Steps Slider & Quick Pills
  blendStepsSlider.addEventListener('input', (e) => {
    steps = parseInt(e.target.value, 10);
    stepPills.forEach(pill => {
      pill.classList.toggle('active', parseInt(pill.getAttribute('data-steps'), 10) === steps);
    });
    updateUI();
  });

  stepPills.forEach(pill => {
    pill.addEventListener('click', () => {
      steps = parseInt(pill.getAttribute('data-steps'), 10);
      blendStepsSlider.value = steps;
      stepPills.forEach(p => p.classList.remove('active'));
      pill.classList.add('active');
      updateUI();
    });
  });

  // Color Space Select
  colorSpaceSelect.addEventListener('change', (e) => {
    colorSpace = e.target.value;
    updateUI();
    showToast(`Switched to ${colorSpace.toUpperCase()} interpolation`);
  });

  // --- Initial Launch ---
  renderPresets();
  updateUI();
});