// Theme Generator - Client-Side Interactive Logic
document.addEventListener('DOMContentLoaded', () => {
  // --- Token Key Definitions ---
  const TOKEN_KEYS = [
    'dominant-brand',
    'accent-glow',
    'dark-surface',
    'card-background',
    'primary-text',
    'muted-text',
    'border-color',
    'success-alert'
  ];

  // --- Preset Themes ---
  const PRESETS = {
    'dark-luxury-gold': {
      name: 'Dark Luxury Gold',
      tokens: {
        'dominant-brand': '#D4AF37',
        'accent-glow': '#F3E5AB',
        'dark-surface': '#0F0F11',
        'card-background': '#1A1A1F',
        'primary-text': '#FBFBFB',
        'muted-text': '#A0A0A8',
        'border-color': '#2F2F38',
        'success-alert': '#38EF7D'
      }
    },
    'midnight-cyber': {
      name: 'Midnight Cyber',
      tokens: {
        'dominant-brand': '#00F0FF',
        'accent-glow': '#FF007F',
        'dark-surface': '#080811',
        'card-background': '#121324',
        'primary-text': '#E0F7FA',
        'muted-text': '#7E8A9F',
        'border-color': '#222847',
        'success-alert': '#00FFA3'
      }
    },
    'emerald-executive': {
      name: 'Emerald Executive',
      tokens: {
        'dominant-brand': '#10B981',
        'accent-glow': '#34D399',
        'dark-surface': '#06140F',
        'card-background': '#0F241C',
        'primary-text': '#ECFDF5',
        'muted-text': '#7A9A8D',
        'border-color': '#1B3B2F',
        'success-alert': '#F59E0B'
      }
    },
    'royal-amethyst': {
      name: 'Royal Amethyst',
      tokens: {
        'dominant-brand': '#8B5CF6',
        'accent-glow': '#C084FC',
        'dark-surface': '#0D0A1A',
        'card-background': '#191430',
        'primary-text': '#F5F3FF',
        'muted-text': '#9690B3',
        'border-color': '#2F2752',
        'success-alert': '#10B981'
      }
    },
    'sunset-coral': {
      name: 'Sunset Coral',
      tokens: {
        'dominant-brand': '#FF5E62',
        'accent-glow': '#FF9966',
        'dark-surface': '#160C10',
        'card-background': '#25151C',
        'primary-text': '#FFF1F2',
        'muted-text': '#A8888E',
        'border-color': '#42232E',
        'success-alert': '#48BB78'
      }
    },
    'nordic-frost': {
      name: 'Nordic Frost',
      tokens: {
        'dominant-brand': '#38BDF8',
        'accent-glow': '#7DD3FC',
        'dark-surface': '#0B1320',
        'card-background': '#142238',
        'primary-text': '#F0F9FF',
        'muted-text': '#829AB1',
        'border-color': '#233852',
        'success-alert': '#14B8A6'
      }
    }
  };

  // --- Current State ---
  let activeThemeName = 'Dark Luxury Gold';
  let currentTokens = { ...PRESETS['dark-luxury-gold'].tokens };
  let currentExportTab = 'css';

  // --- DOM References ---
  const liveThemeStage = document.getElementById('live-theme-stage');
  const codeOutputDisplay = document.getElementById('code-output-display');
  const copyBtnLabel = document.getElementById('copy-btn-label');
  const btnCopyCode = document.getElementById('btn-copy-code');
  const btnDownloadJson = document.getElementById('btn-download-json');
  const toast = document.getElementById('toast');
  const toastMessage = document.getElementById('toast-message');

  const baseBrandColorPicker = document.getElementById('base-brand-color-picker');
  const baseBrandHex = document.getElementById('base-brand-hex');
  const baseBrandSwatch = document.getElementById('base-brand-swatch');
  const harmonyModelSelect = document.getElementById('harmony-model-select');
  const btnSynthesizeTokens = document.getElementById('btn-synthesize-tokens');
  const randomizeThemeBtn = document.getElementById('randomize-theme-btn');

  const contrastTextSurface = document.getElementById('contrast-text-surface');
  const contrastTextCard = document.getElementById('contrast-text-card');
  const contrastBrandSurface = document.getElementById('contrast-brand-surface');

  // --- Color Science Utilities ---
  function normalizeHex(hex) {
    if (!hex) return '#000000';
    let clean = hex.trim().replace(/^#/, '');
    if (clean.length === 3) {
      clean = clean.split('').map(c => c + c).join('');
    }
    if (/^[0-9A-Fa-f]{6}$/.test(clean)) {
      return '#' + clean.toUpperCase();
    }
    return null;
  }

  function hexToRgb(hex) {
    const valid = normalizeHex(hex);
    if (!valid) return { r: 0, g: 0, b: 0 };
    const num = parseInt(valid.slice(1), 16);
    return {
      r: (num >> 16) & 255,
      g: (num >> 8) & 255,
      b: num & 255
    };
  }

  function rgbToHex(r, g, b) {
    const clamp = val => Math.max(0, Math.min(255, Math.round(val)));
    const toHex = val => clamp(val).toString(16).padStart(2, '0').toUpperCase();
    return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
  }

  function rgbToHsl(r, g, b) {
    const rNorm = r / 255;
    const gNorm = g / 255;
    const bNorm = b / 255;
    const max = Math.max(rNorm, gNorm, bNorm);
    const min = Math.min(rNorm, gNorm, bNorm);
    let h = 0;
    let s = 0;
    const l = (max + min) / 2;

    if (max !== min) {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      switch (max) {
        case rNorm: h = (gNorm - bNorm) / d + (gNorm < bNorm ? 6 : 0); break;
        case gNorm: h = (bNorm - rNorm) / d + 2; break;
        case bNorm: h = (rNorm - gNorm) / d + 4; break;
      }
      h /= 6;
    }
    return { h: Math.round(h * 360), s: Math.round(s * 100), l: Math.round(l * 100) };
  }

  function hslToRgb(h, s, l) {
    h = ((h % 360) + 360) % 360 / 360;
    s = Math.max(0, Math.min(100, s)) / 100;
    l = Math.max(0, Math.min(100, l)) / 100;

    if (s === 0) {
      const val = Math.round(l * 255);
      return { r: val, g: val, b: val };
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

  function hslToHex(h, s, l) {
    const { r, g, b } = hslToRgb(h, s, l);
    return rgbToHex(r, g, b);
  }

  function getLuminance(hex) {
    const { r, g, b } = hexToRgb(hex);
    const transform = c => {
      const v = c / 255;
      return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
    };
    return 0.2126 * transform(r) + 0.7152 * transform(g) + 0.0722 * transform(b);
  }

  function getContrastRatio(hex1, hex2) {
    const lum1 = getLuminance(hex1);
    const lum2 = getLuminance(hex2);
    const brightest = Math.max(lum1, lum2);
    const darkest = Math.min(lum1, lum2);
    return (brightest + 0.05) / (darkest + 0.05);
  }

  // --- Toast Helper ---
  let toastTimeout = null;
  function showToast(message) {
    if (toastTimeout) clearTimeout(toastTimeout);
    toastMessage.textContent = message;
    toast.classList.add('show');
    toastTimeout = setTimeout(() => {
      toast.classList.remove('show');
    }, 2400);
  }

  // --- Harmonizer Synthesis Algorithm ---
  function synthesizeTokens(seedHex, model = 'luxury-contrast') {
    const rgb = hexToRgb(seedHex);
    const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);

    const dominantBrand = normalizeHex(seedHex) || '#D4AF37';
    let accentHue = hsl.h;
    let surfaceHue = hsl.h;

    switch (model) {
      case 'complementary':
        accentHue = (hsl.h + 180) % 360;
        break;
      case 'analogous':
        accentHue = (hsl.h + 30) % 360;
        break;
      case 'triadic':
        accentHue = (hsl.h + 120) % 360;
        break;
      case 'monochrome':
        accentHue = hsl.h;
        break;
      case 'luxury-contrast':
      default:
        accentHue = (hsl.h + 45) % 360;
        break;
    }

    // High luminescence accent glow
    const accentGlow = hslToHex(accentHue, Math.min(95, hsl.s + 15), Math.max(78, Math.min(90, hsl.l + 25)));

    // Dark Surface & Card Background with subtle hue tinting
    const darkSurface = hslToHex(surfaceHue, Math.min(30, Math.max(8, Math.round(hsl.s * 0.25))), 4);
    const cardBackground = hslToHex(surfaceHue, Math.min(35, Math.max(12, Math.round(hsl.s * 0.35))), 8);

    // Primary Text (clean luminous off-white with micro-tint)
    const primaryText = hslToHex(surfaceHue, Math.min(15, Math.round(hsl.s * 0.1)), 98);

    // Muted Text (sophisticated medium-gray with tint)
    const mutedText = hslToHex(surfaceHue, Math.min(22, Math.round(hsl.s * 0.2)), 64);

    // Border Color (discrete structure)
    const borderColor = hslToHex(surfaceHue, Math.min(30, Math.round(hsl.s * 0.3)), 16);

    // Harmonic Success or Alert
    const successHue = (hsl.h >= 90 && hsl.h <= 160) ? (hsl.h + 180) % 360 : 150;
    const successAlert = hslToHex(successHue, 82, 54);

    return {
      'dominant-brand': dominantBrand,
      'accent-glow': accentGlow,
      'dark-surface': darkSurface,
      'card-background': cardBackground,
      'primary-text': primaryText,
      'muted-text': mutedText,
      'border-color': borderColor,
      'success-alert': successAlert
    };
  }

  // --- UI Update & Sync ---
  function updateContrastBadges() {
    const textSurfaceRatio = getContrastRatio(currentTokens['primary-text'], currentTokens['dark-surface']);
    const textCardRatio = getContrastRatio(currentTokens['primary-text'], currentTokens['card-background']);
    const brandSurfaceRatio = getContrastRatio(currentTokens['dominant-brand'], currentTokens['dark-surface']);

    const formatBadge = (el, label, ratio) => {
      const rounded = ratio.toFixed(1);
      const isAAA = ratio >= 7;
      const isAA = ratio >= 4.5;
      const pass = ratio >= 3;
      el.className = `contrast-chip ${pass ? 'pass' : ''}`;
      const grade = isAAA ? 'AAA' : isAA ? 'AA' : 'Fail';
      el.innerHTML = `
        <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="3">
          ${pass ? '<polyline points="20 6 9 17 4 12"/>' : '<line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>'}
        </svg>
        ${label}: <strong>${rounded}:1 (${grade})</strong>
      `;
    };

    formatBadge(contrastTextSurface, 'Text / Surface', textSurfaceRatio);
    formatBadge(contrastTextCard, 'Text / Card', textCardRatio);
    formatBadge(contrastBrandSurface, 'Brand / Surface', brandSurfaceRatio);
  }

  function updateCodeExport() {
    let output = '';

    if (currentExportTab === 'css') {
      output = `/* Generated Theme: ${activeThemeName} */
:root {
  --color-dominant-brand: ${currentTokens['dominant-brand']};
  --color-accent-glow: ${currentTokens['accent-glow']};
  --color-dark-surface: ${currentTokens['dark-surface']};
  --color-card-background: ${currentTokens['card-background']};
  --color-primary-text: ${currentTokens['primary-text']};
  --color-muted-text: ${currentTokens['muted-text']};
  --color-border: ${currentTokens['border-color']};
  --color-success-alert: ${currentTokens['success-alert']};
}`;
      copyBtnLabel.textContent = 'Copy CSS Variables (:root)';
    } else if (currentExportTab === 'tailwind') {
      output = `// tailwind.config.js - Theme: ${activeThemeName}
module.exports = {
  theme: {
    extend: {
      colors: {
        'dominant-brand': '${currentTokens['dominant-brand']}',
        'accent-glow': '${currentTokens['accent-glow']}',
        'dark-surface': '${currentTokens['dark-surface']}',
        'card-background': '${currentTokens['card-background']}',
        'primary-text': '${currentTokens['primary-text']}',
        'muted-text': '${currentTokens['muted-text']}',
        'border-color': '${currentTokens['border-color']}',
        'success-alert': '${currentTokens['success-alert']}'
      }
    }
  }
};`;
      copyBtnLabel.textContent = 'Copy Tailwind Config';
    } else {
      const exportJson = {
        themeName: activeThemeName,
        tokens: {
          dominantBrand: currentTokens['dominant-brand'],
          accentGlow: currentTokens['accent-glow'],
          darkSurface: currentTokens['dark-surface'],
          cardBackground: currentTokens['card-background'],
          primaryText: currentTokens['primary-text'],
          mutedText: currentTokens['muted-text'],
          borderColor: currentTokens['border-color'],
          successAlert: currentTokens['success-alert']
        }
      };
      output = JSON.stringify(exportJson, null, 2);
      copyBtnLabel.textContent = 'Export Theme JSON';
    }

    codeOutputDisplay.textContent = output;
  }

  function applyTokensToStage() {
    if (!liveThemeStage) return;

    liveThemeStage.style.setProperty('--theme-dominant-brand', currentTokens['dominant-brand']);
    liveThemeStage.style.setProperty('--theme-accent-glow', currentTokens['accent-glow']);
    liveThemeStage.style.setProperty('--theme-dark-surface', currentTokens['dark-surface']);
    liveThemeStage.style.setProperty('--theme-card-bg', currentTokens['card-background']);
    liveThemeStage.style.setProperty('--theme-text-primary', currentTokens['primary-text']);
    liveThemeStage.style.setProperty('--theme-muted-text', currentTokens['muted-text']);
    liveThemeStage.style.setProperty('--theme-border', currentTokens['border-color']);
    liveThemeStage.style.setProperty('--theme-success-alert', currentTokens['success-alert']);
  }

  function syncInputs() {
    TOKEN_KEYS.forEach(key => {
      const colorInput = document.getElementById(`token-input-${key}`);
      const hexInput = document.getElementById(`token-hex-${key}`);
      const swatch = document.getElementById(`token-swatch-${key}`);
      const val = currentTokens[key];

      if (colorInput && hexInput && swatch) {
        colorInput.value = val;
        hexInput.value = val.toUpperCase();
        swatch.style.background = val;
      }
    });

    applyTokensToStage();
    updateContrastBadges();
    updateCodeExport();
  }

  // --- Event Bindings ---
  // 1. Preset Buttons
  document.querySelectorAll('.preset-chip[data-preset]').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.preset-chip[data-preset]').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const presetId = btn.getAttribute('data-preset');
      if (PRESETS[presetId]) {
        activeThemeName = PRESETS[presetId].name;
        currentTokens = { ...PRESETS[presetId].tokens };
        
        baseBrandColorPicker.value = currentTokens['dominant-brand'];
        baseBrandHex.value = currentTokens['dominant-brand'].toUpperCase();
        baseBrandSwatch.style.background = currentTokens['dominant-brand'];

        syncInputs();
        showToast(`Applied preset: ${activeThemeName}`);
      }
    });
  });

  // 2. Token Inputs (Color Picker & Hex Text Field)
  TOKEN_KEYS.forEach(key => {
    const colorInput = document.getElementById(`token-input-${key}`);
    const hexInput = document.getElementById(`token-hex-${key}`);
    const swatch = document.getElementById(`token-swatch-${key}`);

    if (colorInput && hexInput && swatch) {
      colorInput.addEventListener('input', e => {
        const val = e.target.value.toUpperCase();
        currentTokens[key] = val;
        hexInput.value = val;
        swatch.style.background = val;
        applyTokensToStage();
        updateContrastBadges();
        updateCodeExport();
      });

      hexInput.addEventListener('input', e => {
        const val = normalizeHex(e.target.value);
        if (val) {
          currentTokens[key] = val;
          colorInput.value = val;
          swatch.style.background = val;
          applyTokensToStage();
          updateContrastBadges();
          updateCodeExport();
        }
      });

      hexInput.addEventListener('blur', e => {
        const val = normalizeHex(e.target.value);
        if (val) {
          e.target.value = val;
        } else {
          e.target.value = currentTokens[key];
        }
      });
    }
  });

  // 3. Harmonizer Engine Seed Sync
  baseBrandColorPicker.addEventListener('input', e => {
    const val = e.target.value.toUpperCase();
    baseBrandHex.value = val;
    baseBrandSwatch.style.background = val;
  });

  baseBrandHex.addEventListener('input', e => {
    const val = normalizeHex(e.target.value);
    if (val) {
      baseBrandColorPicker.value = val;
      baseBrandSwatch.style.background = val;
    }
  });

  baseBrandHex.addEventListener('blur', e => {
    const val = normalizeHex(e.target.value);
    if (val) {
      e.target.value = val;
    } else {
      e.target.value = baseBrandColorPicker.value.toUpperCase();
    }
  });

  btnSynthesizeTokens.addEventListener('click', () => {
    const seed = normalizeHex(baseBrandHex.value) || baseBrandColorPicker.value;
    const model = harmonyModelSelect.value;
    activeThemeName = `Custom ${model.replace('-', ' ').toUpperCase()} Theme`;

    currentTokens = synthesizeTokens(seed, model);
    syncInputs();

    document.querySelectorAll('.preset-chip[data-preset]').forEach(b => b.classList.remove('active'));
    showToast(`Synthesized 8 tokens (${model})`);
  });

  // 4. Randomizer
  randomizeThemeBtn.addEventListener('click', () => {
    const randomHex = '#' + Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0').toUpperCase();
    const models = ['luxury-contrast', 'complementary', 'analogous', 'triadic', 'monochrome'];
    const randomModel = models[Math.floor(Math.random() * models.length)];

    baseBrandColorPicker.value = randomHex;
    baseBrandHex.value = randomHex;
    baseBrandSwatch.style.background = randomHex;
    harmonyModelSelect.value = randomModel;

    activeThemeName = `Generated ${randomHex}`;
    currentTokens = synthesizeTokens(randomHex, randomModel);
    syncInputs();

    document.querySelectorAll('.preset-chip[data-preset]').forEach(b => b.classList.remove('active'));
    showToast(`Randomized harmonic theme!`);
  });

  // 5. Export Tabs
  document.querySelectorAll('.export-tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.export-tab-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentExportTab = btn.getAttribute('data-export-tab');
      updateCodeExport();
    });
  });

  // 6. Copy Code Button
  btnCopyCode.addEventListener('click', async () => {
    const code = codeOutputDisplay.textContent;
    try {
      await navigator.clipboard.writeText(code);
      showToast(`${copyBtnLabel.textContent} copied!`);
    } catch {
      // Fallback
      const textarea = document.createElement('textarea');
      textarea.value = code;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      showToast(`${copyBtnLabel.textContent} copied!`);
    }
  });

  // 7. Download JSON Button
  btnDownloadJson.addEventListener('click', () => {
    const exportJson = {
      themeName: activeThemeName,
      createdWith: 'ALL-IN-ONE Theme Generator',
      tokens: {
        dominantBrand: currentTokens['dominant-brand'],
        accentGlow: currentTokens['accent-glow'],
        darkSurface: currentTokens['dark-surface'],
        cardBackground: currentTokens['card-background'],
        primaryText: currentTokens['primary-text'],
        mutedText: currentTokens['muted-text'],
        borderColor: currentTokens['border-color'],
        successAlert: currentTokens['success-alert']
      }
    };
    const jsonStr = JSON.stringify(exportJson, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${activeThemeName.toLowerCase().replace(/\s+/g, '-')}-theme.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showToast('Downloaded theme JSON file!');
  });

  // Initial Sync
  syncInputs();
});