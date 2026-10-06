// CSS Glassmorphism Studio Logic
document.addEventListener('DOMContentLoaded', () => {
  // Elements
  const sliderBlur = document.getElementById('slider-blur');
  const sliderOpacity = document.getElementById('slider-opacity');
  const glassColor = document.getElementById('glass-color');
  const glassHexText = document.getElementById('glass-hex-text');
  const sliderSaturate = document.getElementById('slider-saturate');
  const sliderBorderWidth = document.getElementById('slider-border-width');
  const sliderBorderOpacity = document.getElementById('slider-border-opacity');
  const borderColor = document.getElementById('border-color');
  const borderHexText = document.getElementById('border-hex-text');
  const checkHighlight = document.getElementById('check-highlight');
  const sliderHighlight = document.getElementById('slider-highlight');
  const highlightControls = document.getElementById('highlight-controls');
  const sliderRadius = document.getElementById('slider-radius');
  const sliderShadowDepth = document.getElementById('slider-shadow-depth');

  const valBlur = document.getElementById('val-blur');
  const valOpacity = document.getElementById('val-opacity');
  const valSaturate = document.getElementById('val-saturate');
  const valBorderWidth = document.getElementById('val-border-width');
  const valBorderOpacity = document.getElementById('val-border-opacity');
  const valHighlight = document.getElementById('val-highlight');
  const valRadius = document.getElementById('val-radius');
  const valShadowDepth = document.getElementById('val-shadow-depth');

  const glassStage = document.getElementById('glass-stage');
  const mesh1 = document.getElementById('mesh-1');
  const mesh2 = document.getElementById('mesh-2');
  const mesh3 = document.getElementById('mesh-3');
  const glassCard = document.getElementById('glass-card');
  const glassSheen = document.getElementById('glass-sheen');
  const cssCodeDisplay = document.getElementById('css-code-display');
  const checkVendor = document.getElementById('check-vendor');
  const copyCssBtn = document.getElementById('copy-css-btn');
  const resetBtn = document.getElementById('reset-btn');
  const presetList = document.getElementById('preset-list');
  const wallpaperSwitcher = document.getElementById('wallpaper-switcher');

  // Helper: Hex to RGBA
  function hexToRgba(hex, alphaPercent) {
    let cleanHex = hex.replace('#', '');
    if (cleanHex.length === 3) {
      cleanHex = cleanHex.split('').map(c => c + c).join('');
    }
    const r = parseInt(cleanHex.substring(0, 2), 16) || 0;
    const g = parseInt(cleanHex.substring(2, 4), 16) || 0;
    const b = parseInt(cleanHex.substring(4, 6), 16) || 0;
    const a = (alphaPercent / 100).toFixed(2);
    return `rgba(${r}, ${g}, ${b}, ${a})`;
  }

  // Presets
  const PRESETS = {
    'frosted-ice': {
      blur: 16,
      opacity: 20,
      glassColor: '#ffffff',
      saturate: 180,
      borderWidth: 1,
      borderOpacity: 30,
      borderColor: '#ffffff',
      highlight: true,
      highlightStrength: 25,
      radius: 20,
      shadowDepth: 32
    },
    'dark-obsidian': {
      blur: 20,
      opacity: 45,
      glassColor: '#0f141c',
      saturate: 140,
      borderWidth: 1,
      borderOpacity: 20,
      borderColor: '#ffffff',
      highlight: true,
      highlightStrength: 15,
      radius: 24,
      shadowDepth: 40
    },
    'pure-crystal': {
      blur: 10,
      opacity: 10,
      glassColor: '#ffffff',
      saturate: 210,
      borderWidth: 1,
      borderOpacity: 55,
      borderColor: '#ffffff',
      highlight: true,
      highlightStrength: 45,
      radius: 18,
      shadowDepth: 20
    },
    'neon-prism': {
      blur: 22,
      opacity: 28,
      glassColor: '#581c87',
      saturate: 240,
      borderWidth: 2,
      borderOpacity: 45,
      borderColor: '#c084fc',
      highlight: true,
      highlightStrength: 35,
      radius: 22,
      shadowDepth: 35
    },
    'ultra-blur': {
      blur: 35,
      opacity: 30,
      glassColor: '#ffffff',
      saturate: 160,
      borderWidth: 1,
      borderOpacity: 25,
      borderColor: '#ffffff',
      highlight: true,
      highlightStrength: 20,
      radius: 28,
      shadowDepth: 45
    }
  };

  // Wallpapers
  const WALLPAPERS = {
    aurora: {
      bg: '#080a10',
      shape1: 'radial-gradient(circle, #f43f5e 0%, rgba(244, 63, 94, 0.2) 70%)',
      shape2: 'radial-gradient(circle, #3b82f6 0%, rgba(59, 130, 246, 0.2) 70%)',
      shape3: 'radial-gradient(circle, #a855f7 0%, rgba(168, 85, 247, 0.2) 70%)'
    },
    cosmic: {
      bg: '#04050a',
      shape1: 'radial-gradient(circle, #7928ca 0%, rgba(121, 40, 202, 0.15) 70%)',
      shape2: 'radial-gradient(circle, #0070f3 0%, rgba(0, 112, 243, 0.15) 70%)',
      shape3: 'radial-gradient(circle, #ff0080 0%, rgba(255, 0, 128, 0.2) 70%)'
    },
    geometric: {
      bg: '#0a192f',
      shape1: 'radial-gradient(circle, #00f2fe 0%, rgba(0, 242, 254, 0.2) 70%)',
      shape2: 'radial-gradient(circle, #4facfe 0%, rgba(79, 172, 254, 0.2) 70%)',
      shape3: 'radial-gradient(circle, #43e97b 0%, rgba(67, 233, 123, 0.2) 70%)'
    },
    sunset: {
      bg: '#140c1d',
      shape1: 'radial-gradient(circle, #ff5e36 0%, rgba(255, 94, 54, 0.2) 70%)',
      shape2: 'radial-gradient(circle, #f093fb 0%, rgba(240, 147, 251, 0.2) 70%)',
      shape3: 'radial-gradient(circle, #f5576c 0%, rgba(245, 87, 108, 0.2) 70%)'
    }
  };

  // Update card styling and generated code
  function updateGlassEffect() {
    const blur = parseInt(sliderBlur.value, 10);
    const opacity = parseInt(sliderOpacity.value, 10);
    const gColor = glassColor.value;
    const saturate = parseInt(sliderSaturate.value, 10);
    const bWidth = parseInt(sliderBorderWidth.value, 10);
    const bOpacity = parseInt(sliderBorderOpacity.value, 10);
    const bColor = borderColor.value;
    const hasHighlight = checkHighlight.checked;
    const highlight = parseInt(sliderHighlight.value, 10);
    const radius = parseInt(sliderRadius.value, 10);
    const shadow = parseInt(sliderShadowDepth.value, 10);

    // Update labels
    valBlur.textContent = `${blur}px`;
    valOpacity.textContent = `${opacity}%`;
    valSaturate.textContent = `${saturate}%`;
    valBorderWidth.textContent = `${bWidth}px`;
    valBorderOpacity.textContent = `${bOpacity}%`;
    valHighlight.textContent = `${highlight}%`;
    valRadius.textContent = `${radius}px`;
    valShadowDepth.textContent = `${shadow}px`;

    highlightControls.style.display = hasHighlight ? 'grid' : 'none';

    // Style values
    const bgRgba = hexToRgba(gColor, opacity);
    const borderRgba = hexToRgba(bColor, bOpacity);
    const filterVal = `blur(${blur}px) saturate(${saturate}%)`;
    const shadowVal = `0 8px ${shadow}px 0 rgba(0, 0, 0, 0.37)`;

    // Apply to target
    glassCard.style.background = bgRgba;
    glassCard.style.backdropFilter = filterVal;
    glassCard.style.webkitBackdropFilter = filterVal;
    glassCard.style.border = bWidth > 0 ? `${bWidth}px solid ${borderRgba}` : 'none';
    glassCard.style.borderRadius = `${radius}px`;
    glassCard.style.boxShadow = shadowVal;

    // Specular highlight layer
    if (hasHighlight && highlight > 0) {
      const sheenAlpha = (highlight / 100 * 0.45).toFixed(3);
      glassSheen.style.background = `linear-gradient(135deg, rgba(255, 255, 255, ${sheenAlpha}) 0%, rgba(255, 255, 255, 0) 65%)`;
      glassSheen.style.display = 'block';
    } else {
      glassSheen.style.display = 'none';
    }

    // Build CSS Code output
    let codeLines = [];
    codeLines.push(`/* Glassmorphism CSS */`);
    codeLines.push(`background: ${bgRgba};`);
    if (checkVendor.checked) {
      codeLines.push(`-webkit-backdrop-filter: ${filterVal};`);
    }
    codeLines.push(`backdrop-filter: ${filterVal};`);
    if (bWidth > 0) {
      codeLines.push(`border: ${bWidth}px solid ${borderRgba};`);
    } else {
      codeLines.push(`border: none;`);
    }
    codeLines.push(`border-radius: ${radius}px;`);
    codeLines.push(`box-shadow: ${shadowVal};`);
    if (hasHighlight && highlight > 0) {
      const sheenAlpha = (highlight / 100 * 0.45).toFixed(3);
      codeLines.push(``);
      codeLines.push(`/* Optional Specular Sheen (Apply to ::before or child layer) */`);
      codeLines.push(`background-image: linear-gradient(135deg, rgba(255, 255, 255, ${sheenAlpha}) 0%, rgba(255, 255, 255, 0) 65%);`);
    }

    cssCodeDisplay.textContent = codeLines.join('\n');
  }

  // Event Listeners for inputs
  sliderBlur.addEventListener('input', updateGlassEffect);
  sliderOpacity.addEventListener('input', updateGlassEffect);
  sliderSaturate.addEventListener('input', updateGlassEffect);
  sliderBorderWidth.addEventListener('input', updateGlassEffect);
  sliderBorderOpacity.addEventListener('input', updateGlassEffect);
  checkHighlight.addEventListener('change', updateGlassEffect);
  sliderHighlight.addEventListener('input', updateGlassEffect);
  sliderRadius.addEventListener('input', updateGlassEffect);
  sliderShadowDepth.addEventListener('input', updateGlassEffect);
  checkVendor.addEventListener('change', updateGlassEffect);

  glassColor.addEventListener('input', () => {
    glassHexText.value = glassColor.value;
    updateGlassEffect();
  });
  glassHexText.addEventListener('input', () => {
    const val = glassHexText.value.trim();
    if (/^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/.test(val)) {
      glassColor.value = val;
      updateGlassEffect();
    }
  });

  borderColor.addEventListener('input', () => {
    borderHexText.value = borderColor.value;
    updateGlassEffect();
  });
  borderHexText.addEventListener('input', () => {
    const val = borderHexText.value.trim();
    if (/^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/.test(val)) {
      borderColor.value = val;
      updateGlassEffect();
    }
  });

  // Wallpaper Switcher
  wallpaperSwitcher.addEventListener('click', (e) => {
    const btn = e.target.closest('.wallpaper-btn');
    if (!btn) return;
    wallpaperSwitcher.querySelectorAll('.wallpaper-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');

    const wallKey = btn.dataset.wall;
    const wall = WALLPAPERS[wallKey];
    if (wall) {
      glassStage.style.backgroundColor = wall.bg;
      mesh1.style.background = wall.shape1;
      mesh2.style.background = wall.shape2;
      mesh3.style.background = wall.shape3;
    }
  });

  // Presets Selector
  presetList.addEventListener('click', (e) => {
    const chip = e.target.closest('.preset-chip');
    if (!chip) return;
    const key = chip.dataset.preset;
    if (!PRESETS[key]) return;

    presetList.querySelectorAll('.preset-chip').forEach(c => c.classList.remove('active'));
    chip.classList.add('active');

    const p = PRESETS[key];
    sliderBlur.value = p.blur;
    sliderOpacity.value = p.opacity;
    glassColor.value = p.glassColor;
    glassHexText.value = p.glassColor;
    sliderSaturate.value = p.saturate;
    sliderBorderWidth.value = p.borderWidth;
    sliderBorderOpacity.value = p.borderOpacity;
    borderColor.value = p.borderColor;
    borderHexText.value = p.borderColor;
    checkHighlight.checked = p.highlight;
    sliderHighlight.value = p.highlightStrength;
    sliderRadius.value = p.radius;
    sliderShadowDepth.value = p.shadowDepth;

    updateGlassEffect();
  });

  // Copy CSS Action
  copyCssBtn.addEventListener('click', async () => {
    const textToCopy = cssCodeDisplay.textContent;
    try {
      await navigator.clipboard.writeText(textToCopy);
      const originalText = copyCssBtn.textContent;
      copyCssBtn.textContent = 'Copied!';
      copyCssBtn.classList.add('btn-success');
      setTimeout(() => {
        copyCssBtn.textContent = originalText;
        copyCssBtn.classList.remove('btn-success');
      }, 1800);
    } catch {
      const ta = document.createElement('textarea');
      ta.value = textToCopy;
      ta.style.position = 'fixed';
      ta.style.opacity = '0';
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
      copyCssBtn.textContent = 'Copied!';
      setTimeout(() => {
        copyCssBtn.textContent = 'Copy CSS';
      }, 1800);
    }
  });

  // Reset Button
  resetBtn.addEventListener('click', () => {
    const firstPreset = presetList.querySelector('[data-preset="frosted-ice"]');
    if (firstPreset) firstPreset.click();
  });

  // Initial draw
  updateGlassEffect();
});