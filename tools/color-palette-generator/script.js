// Color Palette Generator - Interactive Vanilla JS
document.addEventListener('DOMContentLoaded', () => {
  // DOM References
  const swatchesContainer = document.getElementById('palette-swatches-grid');
  const harmonyModeSelect = document.getElementById('harmony-mode');
  const baseColorInput = document.getElementById('base-color-input');
  const baseHexText = document.getElementById('base-hex-text');
  const swatchCountSelect = document.getElementById('swatch-count-select');
  const generateBtn = document.getElementById('generate-palette-btn');
  const copyCssBtn = document.getElementById('copy-css-btn');
  const exportJsonBtn = document.getElementById('export-json-btn');
  const exportPngBtn = document.getElementById('export-png-btn');
  const shareLinkBtn = document.getElementById('share-link-btn');
  const codeOutputArea = document.getElementById('code-output-area');
  const copyCodePanelBtn = document.getElementById('copy-code-panel-btn');
  const tabCssBtn = document.getElementById('tab-css-btn');
  const tabTailwindBtn = document.getElementById('tab-tailwind-btn');
  const presetInspirationsList = document.getElementById('preset-inspirations-list');
  const paletteHistoryList = document.getElementById('palette-history-list');
  const toast = document.getElementById('toast');
  const toastText = document.getElementById('toast-text');
  const exportCanvas = document.getElementById('export-canvas');

  // State
  let count = parseInt(swatchCountSelect.value, 10) || 5;
  let swatches = [];
  let codeTab = 'css'; // 'css' | 'tailwind'
  const history = [];

  // Curated Presets
  const curatedPresets = [
    { name: 'Midnight Aurora', colors: ['#0f172a', '#1e293b', '#06b6d4', '#10b981', '#f1f5f9'] },
    { name: 'Sunset Glow', colors: ['#3b185f', '#a12568', '#fec260', '#ff5858', '#faedcd'] },
    { name: 'Oceanic Breeze', colors: ['#03045e', '#0077b6', '#00b4d8', '#90e0ef', '#caf0f8'] },
    { name: 'Forest Moss', colors: ['#1c2826', '#283618', '#606c38', '#dda15e', '#bc6c25'] },
    { name: 'Cyber Neon', colors: ['#0d0221', '#0f084b', '#26408b', '#a6cfd5', '#ff007f'] },
    { name: 'Warm Terracotta', colors: ['#2b1e1a', '#9c413a', '#c86b51', '#e8a588', '#f7ebe1'] }
  ];

  // Helper: Show Toast
  let toastTimer = null;
  function showToast(msg) {
    if (toastTimer) clearTimeout(toastTimer);
    toastText.textContent = msg;
    toast.classList.add('show');
    toastTimer = setTimeout(() => {
      toast.classList.remove('show');
    }, 2400);
  }

  // --- Color Math Utilities ---
  function hexToRgb(hex) {
    let clean = hex.replace(/^#/, '');
    if (clean.length === 3) {
      clean = clean.split('').map(c => c + c).join('');
    }
    const num = parseInt(clean, 16);
    return {
      r: (num >> 16) & 255,
      g: (num >> 8) & 255,
      b: num & 255
    };
  }

  function rgbToHex(r, g, b) {
    const toHex = c => Math.max(0, Math.min(255, Math.round(c))).toString(16).padStart(2, '0');
    return `#${toHex(r)}${toHex(g)}${toHex(b)}`.toUpperCase();
  }

  function rgbToHsl(r, g, b) {
    r /= 255;
    g /= 255;
    b /= 255;
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let h = 0;
    let s = 0;
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

  function getLuminance(r, g, b) {
    const a = [r, g, b].map(v => {
      v /= 255;
      return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
    });
    return a[0] * 0.2126 + a[1] * 0.7152 + a[2] * 0.0722;
  }

  function getReadableTextColor(hex) {
    const { r, g, b } = hexToRgb(hex);
    const lum = getLuminance(r, g, b);
    return lum > 0.38 ? '#0f172a' : '#ffffff';
  }

  function getColorName(h, s, l) {
    if (l < 10) return 'Very Dark';
    if (l > 92) return 'Pale White';
    if (s < 12) return 'Neutral Grey';
    if (h < 15 || h >= 345) return 'Crimson / Red';
    if (h < 40) return 'Amber / Orange';
    if (h < 70) return 'Golden / Yellow';
    if (h < 155) return 'Botanical Green';
    if (h < 195) return 'Aqua / Cyan';
    if (h < 260) return 'Royal Blue';
    if (h < 305) return 'Violet / Purple';
    return 'Magenta / Pink';
  }

  // --- Palette Generation Core ---
  function generatePalette() {
    const harmony = harmonyModeSelect.value;
    let baseHex = baseColorInput.value;
    if (!/^#[0-9A-Fa-f]{6}$/.test(baseHex)) baseHex = '#3B82F6';

    const baseRgb = hexToRgb(baseHex);
    const baseHsl = rgbToHsl(baseRgb.r, baseRgb.g, baseRgb.b);

    const generatedColors = [];

    // Calculate harmonious HSL sets based on count
    switch (harmony) {
      case 'monochromatic': {
        const step = 65 / (count + 1);
        for (let i = 0; i < count; i++) {
          const l = Math.min(92, Math.max(12, Math.round(18 + (i * step) + (Math.random() * 8 - 4))));
          const s = Math.max(20, Math.min(95, baseHsl.s + (i % 2 === 0 ? 5 : -5)));
          const rgb = hslToRgb(baseHsl.h, s, l);
          generatedColors.push(rgbToHex(rgb.r, rgb.g, rgb.b));
        }
        break;
      }

      case 'analogous': {
        const angleSpread = 32;
        const half = Math.floor(count / 2);
        for (let i = 0; i < count; i++) {
          const offset = (i - half) * angleSpread;
          const h = (baseHsl.h + offset + 360) % 360;
          const s = Math.min(95, Math.max(35, baseHsl.s + (i % 2 ? 6 : -6)));
          const l = Math.min(85, Math.max(22, 45 + (i * 8)));
          const rgb = hslToRgb(h, s, l);
          generatedColors.push(rgbToHex(rgb.r, rgb.g, rgb.b));
        }
        break;
      }

      case 'complementary': {
        const compH = (baseHsl.h + 180) % 360;
        const hues = [baseHsl.h, baseHsl.h, compH, compH, (baseHsl.h + 30) % 360, (compH + 30) % 360];
        const lights = [25, 52, 48, 75, 60, 35];
        for (let i = 0; i < count; i++) {
          const h = hues[i % hues.length];
          const l = lights[i % lights.length];
          const s = Math.min(92, Math.max(40, baseHsl.s + (Math.random() * 12 - 6)));
          const rgb = hslToRgb(h, s, l);
          generatedColors.push(rgbToHex(rgb.r, rgb.g, rgb.b));
        }
        break;
      }

      case 'triadic': {
        const triHues = [baseHsl.h, (baseHsl.h + 120) % 360, (baseHsl.h + 240) % 360];
        for (let i = 0; i < count; i++) {
          const h = triHues[i % triHues.length];
          const l = 35 + ((i * 14) % 45);
          const s = Math.min(95, Math.max(45, baseHsl.s));
          const rgb = hslToRgb(h, s, l);
          generatedColors.push(rgbToHex(rgb.r, rgb.g, rgb.b));
        }
        break;
      }

      case 'tetradic': {
        const tetraHues = [baseHsl.h, (baseHsl.h + 90) % 360, (baseHsl.h + 180) % 360, (baseHsl.h + 270) % 360];
        for (let i = 0; i < count; i++) {
          const h = tetraHues[i % tetraHues.length];
          const l = 30 + ((i * 12) % 48);
          const s = Math.min(90, Math.max(45, baseHsl.s));
          const rgb = hslToRgb(h, s, l);
          generatedColors.push(rgbToHex(rgb.r, rgb.g, rgb.b));
        }
        break;
      }

      case 'split-complementary': {
        const splitHues = [baseHsl.h, (baseHsl.h + 150) % 360, (baseHsl.h + 210) % 360];
        for (let i = 0; i < count; i++) {
          const h = splitHues[i % splitHues.length];
          const l = 28 + ((i * 15) % 52);
          const s = Math.min(92, Math.max(40, baseHsl.s));
          const rgb = hslToRgb(h, s, l);
          generatedColors.push(rgbToHex(rgb.r, rgb.g, rgb.b));
        }
        break;
      }

      case 'random':
      default: {
        const seedH = Math.floor(Math.random() * 360);
        const goldenRatio = 0.618033988749895;
        for (let i = 0; i < count; i++) {
          const h = Math.round((seedH + (i * goldenRatio * 360)) % 360);
          const s = Math.floor(55 + Math.random() * 35);
          const l = Math.floor(25 + Math.random() * 50);
          const rgb = hslToRgb(h, s, l);
          generatedColors.push(rgbToHex(rgb.r, rgb.g, rgb.b));
        }
        break;
      }
    }

    // Merge with current swatches respecting locked state
    const newSwatches = [];
    for (let i = 0; i < count; i++) {
      if (swatches[i] && swatches[i].locked) {
        newSwatches.push(swatches[i]);
      } else {
        const hex = generatedColors[i] || '#888888';
        newSwatches.push({
          id: 'swatch-' + Date.now() + '-' + i,
          hex: hex,
          locked: false
        });
      }
    }

    swatches = newSwatches;
    renderSwatches();
    updateCodeOutputs();
    recordHistory();
  }

  // Record history
  function recordHistory() {
    const currentHexes = swatches.map(s => s.hex);
    if (history.length > 0) {
      const last = history[0];
      if (last.join(',') === currentHexes.join(',')) return;
    }
    history.unshift(currentHexes);
    if (history.length > 8) history.pop();
    renderHistory();
  }

  function renderHistory() {
    if (history.length === 0) {
      paletteHistoryList.innerHTML = `<span style="font-size: 0.85rem; color: var(--text-secondary);">No previous palettes generated yet.</span>`;
      return;
    }

    paletteHistoryList.innerHTML = '';
    history.forEach((pal, idx) => {
      const chip = document.createElement('div');
      chip.className = 'preset-chip';
      chip.title = `Restore Palette #${idx + 1}`;
      
      const bar = document.createElement('div');
      bar.className = 'preset-mini-bar';
      pal.forEach(c => {
        const span = document.createElement('span');
        span.style.backgroundColor = c;
        bar.appendChild(span);
      });

      const label = document.createElement('span');
      label.textContent = `#${idx + 1}`;

      chip.appendChild(bar);
      chip.appendChild(label);

      chip.addEventListener('click', () => {
        applyColorList(pal);
        showToast(`Restored Palette #${idx + 1}`);
      });

      paletteHistoryList.appendChild(chip);
    });
  }

  function applyColorList(colors) {
    count = colors.length;
    swatchCountSelect.value = String(count);
    swatches = colors.map((hex, idx) => ({
      id: 'swatch-' + Date.now() + '-' + idx,
      hex: hex,
      locked: false
    }));
    baseColorInput.value = colors[0];
    baseHexText.value = colors[0];
    renderSwatches();
    updateCodeOutputs();
  }

  // --- Render Swatches ---
  function renderSwatches() {
    swatchesContainer.innerHTML = '';

    swatches.forEach((swatch, index) => {
      const { r, g, b } = hexToRgb(swatch.hex);
      const { h, s, l } = rgbToHsl(r, g, b);
      const textColor = getReadableTextColor(swatch.hex);
      const name = getColorName(h, s, l);

      const swatchEl = document.createElement('div');
      swatchEl.className = 'color-swatch';
      swatchEl.style.backgroundColor = swatch.hex;
      swatchEl.style.color = textColor;

      swatchEl.innerHTML = `
        <div class="swatch-header">
          <button class="swatch-btn ${swatch.locked ? 'is-locked' : ''}" data-action="toggle-lock" data-index="${index}" title="${swatch.locked ? 'Unlock Color' : 'Lock Color'}">
            ${swatch.locked 
              ? `<svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor"><path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z"/></svg>`
              : `<svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor"><path d="M12 17c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm6-9h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6h1.9c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm0 12H6V10h12v10z"/></svg>`
            }
          </button>
          
          <label class="swatch-btn swatch-picker-label" title="Edit Color Picker">
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="4"/></svg>
            <input type="color" class="swatch-native-picker" data-index="${index}" value="${swatch.hex}">
          </label>
        </div>

        <div class="swatch-body">
          <div class="swatch-hex" data-action="copy-hex" data-index="${index}" title="Click to copy HEX">
            <span>${swatch.hex}</span>
            <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
          </div>
          <div class="swatch-rgb">rgb(${r}, ${g}, ${b})</div>
          <div class="swatch-hsl">hsl(${h}, ${s}%, ${l}%)</div>
          <div class="swatch-tag">${name}</div>
        </div>

        <div class="swatch-footer hide-mobile">
          <span style="font-size: 0.725rem; opacity: 0.75; font-weight: 500;">Swatch ${index + 1}</span>
        </div>
      `;

      swatchesContainer.appendChild(swatchEl);
    });

    attachSwatchListeners();
  }

  // --- Swatch Event Listeners ---
  function attachSwatchListeners() {
    // Lock toggles
    swatchesContainer.querySelectorAll('[data-action="toggle-lock"]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const idx = parseInt(btn.getAttribute('data-index'), 10);
        swatches[idx].locked = !swatches[idx].locked;
        renderSwatches();
        showToast(swatches[idx].locked ? `Swatch ${idx + 1} locked` : `Swatch ${idx + 1} unlocked`);
      });
    });

    // Copy Hex clicks
    swatchesContainer.querySelectorAll('[data-action="copy-hex"]').forEach(el => {
      el.addEventListener('click', () => {
        const idx = parseInt(el.getAttribute('data-index'), 10);
        const hex = swatches[idx].hex;
        navigator.clipboard.writeText(hex).then(() => {
          showToast(`Copied ${hex} to clipboard!`);
        });
      });
    });

    // Color pickers inside swatches
    swatchesContainer.querySelectorAll('.swatch-native-picker').forEach(picker => {
      picker.addEventListener('input', (e) => {
        const idx = parseInt(picker.getAttribute('data-index'), 10);
        swatches[idx].hex = e.target.value.toUpperCase();
        renderSwatches();
        updateCodeOutputs();
      });
    });
  }

  // --- Code Output Generation ---
  function updateCodeOutputs() {
    if (codeTab === 'css') {
      const vars = swatches.map((s, idx) => `  --color-${idx + 1}: ${s.hex};`).join('\n');
      codeOutputArea.textContent = `:root {\n${vars}\n}`;
    } else {
      const tailwindObj = swatches.map((s, idx) => `    'palette-${idx + 1}': '${s.hex}',`).join('\n');
      codeOutputArea.textContent = `// tailwind.config.js\nmodule.exports = {\n  theme: {\n    extend: {\n      colors: {\n${tailwindObj}\n      }\n    }\n  }\n};`;
    }
  }

  // Tab switching
  tabCssBtn.addEventListener('click', () => {
    codeTab = 'css';
    tabCssBtn.className = 'btn btn-primary';
    tabTailwindBtn.className = 'btn btn-secondary';
    updateCodeOutputs();
  });

  tabTailwindBtn.addEventListener('click', () => {
    codeTab = 'tailwind';
    tabTailwindBtn.className = 'btn btn-primary';
    tabCssBtn.className = 'btn btn-secondary';
    updateCodeOutputs();
  });

  // Copy code output
  copyCodePanelBtn.addEventListener('click', () => {
    navigator.clipboard.writeText(codeOutputArea.textContent).then(() => {
      copyCodePanelBtn.textContent = 'Copied!';
      copyCodePanelBtn.classList.add('copied');
      setTimeout(() => {
        copyCodePanelBtn.textContent = 'Copy';
        copyCodePanelBtn.classList.remove('copied');
      }, 1500);
      showToast('Export code copied to clipboard!');
    });
  });

  // Action Buttons
  copyCssBtn.addEventListener('click', () => {
    const vars = swatches.map((s, idx) => `  --color-${idx + 1}: ${s.hex};`).join('\n');
    const cssText = `:root {\n${vars}\n}`;
    navigator.clipboard.writeText(cssText).then(() => {
      showToast('CSS Variables copied to clipboard!');
    });
  });

  exportJsonBtn.addEventListener('click', () => {
    const payload = {
      palette: swatches.map((s, idx) => {
        const rgb = hexToRgb(s.hex);
        const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);
        return {
          id: idx + 1,
          hex: s.hex,
          rgb: `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`,
          hsl: `hsl(${hsl.h}, ${hsl.s}%, ${hsl.l}%)`,
          name: getColorName(hsl.h, hsl.s, hsl.l)
        };
      }),
      harmonyMode: harmonyModeSelect.value,
      exportedAt: new Date().toISOString()
    };

    const dataBlob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `palette-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('Palette JSON downloaded!');
  });

  exportPngBtn.addEventListener('click', () => {
    const width = 1200;
    const height = 630;
    exportCanvas.width = width;
    exportCanvas.height = height;
    const ctx = exportCanvas.getContext('2d');

    // Background
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(0, 0, width, height);

    // Title & Branding
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 36px Inter, sans-serif';
    ctx.fillText('ALL IN ONE Color Palette', 60, 75);

    ctx.fillStyle = '#94a3b8';
    ctx.font = '20px Inter, sans-serif';
    const modeLabel = harmonyModeSelect.options[harmonyModeSelect.selectedIndex].text;
    ctx.fillText(`Harmony: ${modeLabel} • Generated on ${new Date().toLocaleDateString()}`, 60, 115);

    // Draw Swatches
    const swatchW = (width - 120) / swatches.length;
    const swatchH = 380;
    const swatchY = 160;

    swatches.forEach((s, idx) => {
      const x = 60 + idx * swatchW;
      
      // Swatch Rectangle
      ctx.fillStyle = s.hex;
      ctx.fillRect(x, swatchY, swatchW, swatchH);

      // Contrast aware text
      const textColor = getReadableTextColor(s.hex);
      ctx.fillStyle = textColor;
      ctx.font = 'bold 24px monospace';
      ctx.textAlign = 'center';
      ctx.fillText(s.hex, x + swatchW / 2, swatchY + swatchH - 45);

      const { r, g, b } = hexToRgb(s.hex);
      const { h, sat, l } = rgbToHsl(r, g, b);
      ctx.font = '16px Inter, sans-serif';
      ctx.fillText(getColorName(h, sat, l), x + swatchW / 2, swatchY + swatchH - 18);
    });

    // Watermark
    ctx.fillStyle = '#64748b';
    ctx.font = '16px Inter, sans-serif';
    ctx.textAlign = 'right';
    ctx.fillText('sami12901.github.io/ALL-IN-ONE-v1', width - 60, height - 35);

    // Download
    const dataUrl = exportCanvas.toDataURL('image/png');
    const a = document.createElement('a');
    a.href = dataUrl;
    a.download = `palette-${Date.now()}.png`;
    a.click();
    showToast('Palette PNG image downloaded!');
  });

  shareLinkBtn.addEventListener('click', () => {
    const hexCodes = swatches.map(s => s.hex.replace('#', '')).join('-');
    const url = new URL(window.location.href);
    url.searchParams.set('palette', hexCodes);
    url.searchParams.set('mode', harmonyModeSelect.value);
    navigator.clipboard.writeText(url.toString()).then(() => {
      window.history.replaceState({}, '', url.toString());
      showToast('Shareable link copied to clipboard!');
    });
  });

  // Base Color Input sync
  baseColorInput.addEventListener('input', (e) => {
    const val = e.target.value.toUpperCase();
    baseHexText.value = val;
    generatePalette();
  });

  baseHexText.addEventListener('change', (e) => {
    let val = e.target.value.trim();
    if (!val.startsWith('#')) val = '#' + val;
    if (/^#[0-9A-Fa-f]{6}$/.test(val)) {
      baseColorInput.value = val;
      baseHexText.value = val.toUpperCase();
      generatePalette();
    } else {
      baseHexText.value = baseColorInput.value.toUpperCase();
    }
  });

  // Swatch count change
  swatchCountSelect.addEventListener('change', (e) => {
    count = parseInt(e.target.value, 10);
    generatePalette();
  });

  // Harmony mode change
  harmonyModeSelect.addEventListener('change', () => {
    generatePalette();
  });

  // Generate Button Click
  generateBtn.addEventListener('click', () => {
    generatePalette();
  });

  // Spacebar shortcut
  window.addEventListener('keydown', (e) => {
    if (e.code === 'Space') {
      const activeTag = document.activeElement ? document.activeElement.tagName.toLowerCase() : '';
      if (activeTag === 'input' || activeTag === 'textarea' || activeTag === 'select' || activeTag === 'button') {
        return; // Don't block normal space key typing
      }
      e.preventDefault();
      generatePalette();
    }
  });

  // Render Curated Inspirations
  function renderPresets() {
    presetInspirationsList.innerHTML = '';
    curatedPresets.forEach(preset => {
      const chip = document.createElement('div');
      chip.className = 'preset-chip';
      chip.title = `Apply ${preset.name}`;

      const bar = document.createElement('div');
      bar.className = 'preset-mini-bar';
      preset.colors.forEach(c => {
        const span = document.createElement('span');
        span.style.backgroundColor = c;
        bar.appendChild(span);
      });

      const label = document.createElement('span');
      label.textContent = preset.name;

      chip.appendChild(bar);
      chip.appendChild(label);

      chip.addEventListener('click', () => {
        applyColorList(preset.colors);
        showToast(`Loaded ${preset.name} preset!`);
      });

      presetInspirationsList.appendChild(chip);
    });
  }

  // Check URL parameters on mount
  function initFromUrl() {
    const params = new URLSearchParams(window.location.search);
    const palParam = params.get('palette');
    const modeParam = params.get('mode');

    if (modeParam && harmonyModeSelect.querySelector(`option[value="${modeParam}"]`)) {
      harmonyModeSelect.value = modeParam;
    }

    if (palParam) {
      const hexList = palParam.split('-').map(h => '#' + h);
      const valid = hexList.every(h => /^#[0-9A-Fa-f]{6}$/.test(h));
      if (valid && hexList.length >= 3 && hexList.length <= 8) {
        applyColorList(hexList);
        return true;
      }
    }
    return false;
  }

  // Initial Boot
  renderPresets();
  if (!initFromUrl()) {
    generatePalette();
  }
});