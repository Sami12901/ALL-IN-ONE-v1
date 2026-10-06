// Color Wheel Explorer - Interactive Chromatic Wheel & Harmony Generator
// Canvas 360-degree color wheel with real-time draggable markers and harmony calculations.

document.addEventListener('DOMContentLoaded', () => {
  // --- DOM Elements ---
  const canvas = document.getElementById('wheel-canvas');
  const canvasContainer = document.getElementById('wheel-canvas-container');
  const wheelCenterPreview = document.getElementById('wheel-center-preview');

  const baseColorPicker = document.getElementById('base-color-picker');
  const baseHexInput = document.getElementById('base-hex-input');
  const randomWheelBtn = document.getElementById('random-wheel-btn');

  const harmonyModesGrid = document.getElementById('harmony-modes-grid');
  const harmonyExplainerBox = document.getElementById('harmony-explainer-box');

  const hueSlider = document.getElementById('hue-slider');
  const hueVal = document.getElementById('hue-val');
  const satSlider = document.getElementById('sat-slider');
  const satVal = document.getElementById('sat-val');
  const lightSlider = document.getElementById('light-slider');
  const lightVal = document.getElementById('light-val');
  const spreadSlider = document.getElementById('spread-slider');
  const spreadVal = document.getElementById('spread-val');
  const spreadSliderContainer = document.getElementById('spread-slider-container');

  const harmonyPaletteStrip = document.getElementById('harmony-palette-strip');
  const swatchesDetailedGrid = document.getElementById('swatches-detailed-grid');
  const copyPaletteBtn = document.getElementById('copy-palette-btn');
  const exportWheelPngBtn = document.getElementById('export-wheel-png-btn');
  const exportPngCanvas = document.getElementById('export-png-canvas');

  const exportTabs = document.querySelectorAll('.tab-export-btn');
  const exportCodeBox = document.getElementById('export-code-box');
  const copyCodeBtn = document.getElementById('copy-code-btn');

  const toast = document.getElementById('toast');
  const toastText = document.getElementById('toast-text');

  // --- State ---
  let baseHue = 217;       // 0 to 360
  let baseSat = 91;        // 5 to 100
  let baseLight = 60;      // 10 to 90
  let spreadAngle = 30;    // 15 to 60 (for analogous / split-comp)
  let harmonyMode = 'triadic'; // 'complementary' | 'triadic' | 'analogous' | 'split-complementary' | 'tetradic' | 'monochromatic'
  let activeExportTab = 'css-vars';
  let isDragging = false;
  let activeSwatches = []; // Array of { role, hex, rgb, hsl, cmyk, hue, sat, light }

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

  // --- Color Math Helpers ---
  function clamp(v, min, max) {
    return Math.max(min, Math.min(max, v));
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

  function rgbToHex(r, g, b) {
    const toH = c => clamp(Math.round(c), 0, 255).toString(16).padStart(2, '0');
    return `#${toH(r)}${toH(g)}${toH(b)}`.toUpperCase();
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

  function rgbToCmyk(r, g, b) {
    r /= 255; g /= 255; b /= 255;
    const k = 1 - Math.max(r, g, b);
    if (k === 1) return { c: 0, m: 0, y: 0, k: 100 };
    const c = Math.round(((1 - r - k) / (1 - k)) * 100);
    const m = Math.round(((1 - g - k) / (1 - k)) * 100);
    const y = Math.round(((1 - b - k) / (1 - k)) * 100);
    return { c, m, y, k: Math.round(k * 100) };
  }

  // --- Offscreen Cache for the Wheel Background Disk ---
  const offscreenWheel = document.createElement('canvas');
  let offscreenDrawn = false;
  const WHEEL_RES = 680; // High DPI internal size

  function renderOffscreenWheel() {
    offscreenWheel.width = WHEEL_RES;
    offscreenWheel.height = WHEEL_RES;
    const ctx = offscreenWheel.getContext('2d');
    const cx = WHEEL_RES / 2;
    const cy = WHEEL_RES / 2;
    const radius = WHEEL_RES / 2 - 16;

    ctx.clearRect(0, 0, WHEEL_RES, WHEEL_RES);

    // 1. Draw 360-degree hue sectors
    const step = 0.5; // Fine resolution
    for (let angle = 0; angle < 360; angle += step) {
      const startRad = ((angle - 0.2) * Math.PI) / 180;
      const endRad = ((angle + step + 0.2) * Math.PI) / 180;

      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.arc(cx, cy, radius, startRad, endRad);
      ctx.closePath();
      ctx.fillStyle = `hsl(${angle}, 100%, 50%)`;
      ctx.fill();
    }

    // 2. Radial gradient for saturation falloff (White center to transparent edge)
    const satGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, radius);
    satGrad.addColorStop(0, '#ffffff');
    satGrad.addColorStop(0.15, 'rgba(255, 255, 255, 0.95)');
    satGrad.addColorStop(1, 'rgba(255, 255, 255, 0)');
    ctx.fillStyle = satGrad;
    ctx.beginPath();
    ctx.arc(cx, cy, radius, 0, Math.PI * 2);
    ctx.fill();

    // 3. Crisp boundary ring
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.arc(cx, cy, radius, 0, Math.PI * 2);
    ctx.stroke();

    offscreenDrawn = true;
  }

  // --- Harmony Calculations ---
  function computeHarmonySwatches() {
    const modH = h => ((Math.round(h) % 360) + 360) % 360;
    const makeSwatch = (role, h, s, l) => {
      const hue = modH(h);
      const sat = clamp(Math.round(s), 0, 100);
      const light = clamp(Math.round(l), 0, 100);
      const rgb = hslToRgb(hue, sat, light);
      const hex = rgbToHex(rgb.r, rgb.g, rgb.b);
      const hsl = { h: hue, s: sat, l: light };
      const cmyk = rgbToCmyk(rgb.r, rgb.g, rgb.b);
      return { role, hex, rgb, hsl, cmyk, hue, sat, light };
    };

    const list = [];
    const H = baseHue;
    const S = baseSat;
    const L = baseLight;

    if (harmonyMode === 'complementary') {
      list.push(makeSwatch('Base Color', H, S, L));
      list.push(makeSwatch('Base Tint', H, S * 0.7, clamp(L + 16, 15, 88)));
      list.push(makeSwatch('Complement Tint', H + 180, S * 0.7, clamp(L + 16, 15, 88)));
      list.push(makeSwatch('Complement', H + 180, S, L));
    } else if (harmonyMode === 'triadic') {
      list.push(makeSwatch('Primary (Base)', H, S, L));
      list.push(makeSwatch('Secondary', H + 120, S, L));
      list.push(makeSwatch('Tertiary', H + 240, S, L));
      list.push(makeSwatch('Primary Tint', H, S * 0.65, clamp(L + 18, 15, 90)));
      list.push(makeSwatch('Secondary Shade', H + 120, S, clamp(L - 18, 15, 85)));
    } else if (harmonyMode === 'analogous') {
      list.push(makeSwatch('Analogous -2', H - 2 * spreadAngle, S, L));
      list.push(makeSwatch('Analogous -1', H - spreadAngle, S, L));
      list.push(makeSwatch('Base Color', H, S, L));
      list.push(makeSwatch('Analogous +1', H + spreadAngle, S, L));
      list.push(makeSwatch('Analogous +2', H + 2 * spreadAngle, S, L));
    } else if (harmonyMode === 'split-complementary') {
      list.push(makeSwatch('Base Color', H, S, L));
      list.push(makeSwatch('Split Comp 1', H + 180 - spreadAngle, S, L));
      list.push(makeSwatch('Split Comp 2', H + 180 + spreadAngle, S, L));
      list.push(makeSwatch('Base Accent', H, S * 0.7, clamp(L + 18, 15, 90)));
      list.push(makeSwatch('Split Accent', H + 180 - spreadAngle, S, clamp(L - 18, 15, 85)));
    } else if (harmonyMode === 'tetradic') {
      list.push(makeSwatch('Base (Vertex 1)', H, S, L));
      list.push(makeSwatch('Vertex 2 (90°)', H + 90, S, L));
      list.push(makeSwatch('Complement (180°)', H + 180, S, L));
      list.push(makeSwatch('Vertex 4 (270°)', H + 270, S, L));
    } else if (harmonyMode === 'monochromatic') {
      list.push(makeSwatch('Deep Shade', H, S, clamp(L - 32, 10, 80)));
      list.push(makeSwatch('Shade', H, S, clamp(L - 16, 12, 85)));
      list.push(makeSwatch('Base Color', H, S, L));
      list.push(makeSwatch('Tint', H, clamp(S - 15, 10, 100), clamp(L + 16, 15, 90)));
      list.push(makeSwatch('High Tint', H, clamp(S - 30, 5, 100), clamp(L + 30, 18, 95)));
    }

    activeSwatches = list;
    return list;
  }

  // --- Explainer Text for Harmony Modes ---
  const EXPLAINERS = {
    complementary: 'Complementary pairs sit 180° opposite on the wheel, producing maximum visual contrast, energy, and vibrancy. Great for CTA buttons and badges.',
    triadic: 'Triadic harmonies balance three vibrant hues spaced evenly at 120° angles across the color wheel, creating dynamic yet visually balanced palettes.',
    analogous: 'Analogous colors sit side-by-side on the wheel (spread by adjustable angles), offering serene, cohesive, and tranquil transitions favored in brand design.',
    'split-complementary': 'Split-complementary pairs the base hue with two colors adjacent to its complement, delivering high contrast with softer visual tension.',
    tetradic: 'Tetradic harmonies use four colors forming a square (90° intervals), providing rich visual variety that works best when one color dominates.',
    monochromatic: 'Monochromatic schemes use a single hue with varied saturation and lightness steps for a refined, minimalist, elegant atmosphere.'
  };

  // --- Draw Canvas Wheel & Markers ---
  function drawWheelCanvas() {
    if (!offscreenDrawn) renderOffscreenWheel();

    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    const cssSize = rect.width || 340;

    canvas.width = cssSize * dpr;
    canvas.height = cssSize * dpr;

    const ctx = canvas.getContext('2d');
    ctx.resetTransform();
    ctx.scale(dpr, dpr);

    const cx = cssSize / 2;
    const cy = cssSize / 2;
    const maxRadius = cssSize / 2 - 8;

    ctx.clearRect(0, 0, cssSize, cssSize);

    // 1. Draw cached color wheel
    ctx.drawImage(offscreenWheel, 0, 0, WHEEL_RES, WHEEL_RES, cx - maxRadius, cy - maxRadius, maxRadius * 2, maxRadius * 2);

    // 2. Lightness Dimming / Brightening Overlay
    // If baseLight != 50%, blend black or white overlay slightly
    if (baseLight < 50) {
      const alpha = ((50 - baseLight) / 50) * 0.65;
      ctx.fillStyle = `rgba(0, 0, 0, ${alpha})`;
      ctx.beginPath();
      ctx.arc(cx, cy, maxRadius, 0, Math.PI * 2);
      ctx.fill();
    } else if (baseLight > 50) {
      const alpha = ((baseLight - 50) / 50) * 0.45;
      ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`;
      ctx.beginPath();
      ctx.arc(cx, cy, maxRadius, 0, Math.PI * 2);
      ctx.fill();
    }

    // 3. Compute active swatches
    computeHarmonySwatches();

    // Map (Hue, Sat) to Canvas Coordinate (X, Y)
    const getMarkerCoord = (hue, sat) => {
      const rad = (hue * Math.PI) / 180;
      const r = (sat / 100) * (maxRadius - 32) + 20;
      return {
        x: cx + r * Math.cos(rad),
        y: cy + r * Math.sin(rad)
      };
    };

    // 4. Draw Harmony Lines / Polygons
    const markerCoords = activeSwatches.map(s => getMarkerCoord(s.hue, s.sat));

    if (harmonyMode === 'complementary') {
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.75)';
      ctx.lineWidth = 2.5;
      ctx.setLineDash([5, 5]);
      ctx.beginPath();
      ctx.moveTo(markerCoords[0].x, markerCoords[0].y);
      ctx.lineTo(markerCoords[markerCoords.length - 1].x, markerCoords[markerCoords.length - 1].y);
      ctx.stroke();
      ctx.setLineDash([]);
    } else if (harmonyMode === 'triadic') {
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.85)';
      ctx.fillStyle = 'rgba(255, 255, 255, 0.08)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(markerCoords[0].x, markerCoords[0].y);
      ctx.lineTo(markerCoords[1].x, markerCoords[1].y);
      ctx.lineTo(markerCoords[2].x, markerCoords[2].y);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
    } else if (harmonyMode === 'tetradic') {
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.85)';
      ctx.fillStyle = 'rgba(255, 255, 255, 0.08)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(markerCoords[0].x, markerCoords[0].y);
      ctx.lineTo(markerCoords[1].x, markerCoords[1].y);
      ctx.lineTo(markerCoords[2].x, markerCoords[2].y);
      ctx.lineTo(markerCoords[3].x, markerCoords[3].y);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
    } else if (harmonyMode === 'split-complementary') {
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.85)';
      ctx.fillStyle = 'rgba(255, 255, 255, 0.08)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(markerCoords[0].x, markerCoords[0].y);
      ctx.lineTo(markerCoords[1].x, markerCoords[1].y);
      ctx.lineTo(markerCoords[2].x, markerCoords[2].y);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
    } else if (harmonyMode === 'analogous') {
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.8)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(markerCoords[0].x, markerCoords[0].y);
      for (let i = 1; i < markerCoords.length; i++) {
        ctx.lineTo(markerCoords[i].x, markerCoords[i].y);
      }
      ctx.stroke();
    } else if (harmonyMode === 'monochromatic') {
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.8)';
      ctx.lineWidth = 2.5;
      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.lineTo(markerCoords[2].x, markerCoords[2].y);
      ctx.stroke();
      ctx.setLineDash([]);
    }

    // 5. Draw Harmony Markers
    activeSwatches.forEach((swatch, idx) => {
      const pos = markerCoords[idx];
      const isBase = idx === 0 || (harmonyMode === 'analogous' && idx === 2) || (harmonyMode === 'monochromatic' && idx === 2);
      const radius = isBase ? 11 : 8;

      // Glow / Shadow
      ctx.save();
      ctx.shadowColor = 'rgba(0, 0, 0, 0.6)';
      ctx.shadowBlur = 8;
      ctx.shadowOffsetX = 0;
      ctx.shadowOffsetY = 2;

      // Outer ring
      ctx.fillStyle = isBase ? '#ffffff' : 'rgba(255, 255, 255, 0.9)';
      ctx.beginPath();
      ctx.arc(pos.x, pos.y, radius, 0, Math.PI * 2);
      ctx.fill();

      // Inner color pip
      ctx.fillStyle = swatch.hex;
      ctx.beginPath();
      ctx.arc(pos.x, pos.y, radius - (isBase ? 3 : 2.5), 0, Math.PI * 2);
      ctx.fill();

      ctx.restore();
    });

    // 6. Update Center Bubble Preview
    const baseColor = activeSwatches[0].hex;
    wheelCenterPreview.style.backgroundColor = baseColor;
    baseColorPicker.value = baseColor;
    baseHexInput.value = baseColor;
  }

  // --- Render Palette Strip & Detailed Cards ---
  function renderPaletteUI() {
    // 1. Swatch Strip
    harmonyPaletteStrip.innerHTML = '';
    activeSwatches.forEach((s) => {
      const item = document.createElement('div');
      item.className = 'harmony-swatch-item';
      item.style.backgroundColor = s.hex;
      item.title = `${s.role}\n${s.hex}\nrgb(${s.rgb.r}, ${s.rgb.g}, ${s.rgb.b})\nhsl(${s.hsl.h}°, ${s.hsl.s}%, ${s.hsl.l}%)\nClick to copy`;

      item.innerHTML = `
        <span class="harmony-swatch-role">${s.role}</span>
        <span class="harmony-swatch-hex">${s.hex}</span>
      `;

      item.addEventListener('click', () => {
        navigator.clipboard.writeText(s.hex).then(() => {
          showToast(`Copied ${s.hex} (${s.role})`);
        });
      });

      harmonyPaletteStrip.appendChild(item);
    });

    // 2. Detailed Cards Grid
    swatchesDetailedGrid.innerHTML = '';
    activeSwatches.forEach((s) => {
      const card = document.createElement('div');
      card.className = 'harmony-card-detail';
      card.innerHTML = `
        <div class="harmony-card-color-top" style="background-color: ${s.hex};">
          <span class="harmony-card-badge">${s.role}</span>
        </div>
        <div class="harmony-card-body">
          <span class="harmony-card-hex-title">${s.hex}</span>
          <span class="harmony-card-meta">rgb(${s.rgb.r}, ${s.rgb.g}, ${s.rgb.b})</span>
          <span class="harmony-card-meta">hsl(${s.hsl.h}&deg;, ${s.hsl.s}%, ${s.hsl.l}%)</span>
          <span class="harmony-card-meta">CMYK: ${s.cmyk.c}, ${s.cmyk.m}, ${s.cmyk.y}, ${s.cmyk.k}</span>
        </div>
      `;
      card.addEventListener('click', () => {
        navigator.clipboard.writeText(s.hex).then(() => {
          showToast(`Copied ${s.hex}`);
        });
      });
      swatchesDetailedGrid.appendChild(card);
    });

    // 3. Render Code Export
    renderCodeOutput();
  }

  // --- Render Code Output ---
  function renderCodeOutput() {
    const hexList = activeSwatches.map(s => s.hex);
    let code = '';

    if (activeExportTab === 'css-vars') {
      const vars = activeSwatches.map((s, i) => {
        const key = s.role.toLowerCase().replace(/[^a-z0-9]/g, '-');
        return `  --color-${key}: ${s.hex}; /* rgb(${s.rgb.r}, ${s.rgb.g}, ${s.rgb.b}) */`;
      }).join('\n');
      code = `:root {\n${vars}\n}`;
    } else if (activeExportTab === 'tailwind') {
      const tw = activeSwatches.map((s, i) => {
        const key = s.role.toLowerCase().replace(/[^a-z0-9]/g, '_');
        return `        '${key}': '${s.hex}',`;
      }).join('\n');
      code = `// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      colors: {
        harmony: {
${tw}
        }
      }
    }
  }
};`;
    } else if (activeExportTab === 'scss') {
      code = activeSwatches.map(s => {
        const key = s.role.toLowerCase().replace(/[^a-z0-9]/g, '-');
        return `$color-${key}: ${s.hex};`;
      }).join('\n');
    } else if (activeExportTab === 'json') {
      code = JSON.stringify(activeSwatches.map(s => ({
        role: s.role,
        hex: s.hex,
        rgb: s.rgb,
        hsl: s.hsl
      })), null, 2);
    } else if (activeExportTab === 'hex-list') {
      code = hexList.join(', ');
    }

    exportCodeBox.textContent = code;
  }

  // --- Synchronize All Controls ---
  function updateAll() {
    hueSlider.value = baseHue;
    hueVal.textContent = `${baseHue}°`;
    satSlider.value = baseSat;
    satVal.textContent = `${baseSat}%`;
    lightSlider.value = baseLight;
    lightVal.textContent = `${baseLight}%`;
    spreadSlider.value = spreadAngle;
    spreadVal.textContent = `${spreadAngle}°`;

    drawWheelCanvas();
    renderPaletteUI();
  }

  // --- Dragging Pointer on Canvas ---
  function handleCanvasPointer(e) {
    const rect = canvas.getBoundingClientRect();
    const clientX = e.clientX || (e.touches && e.touches[0] ? e.touches[0].clientX : 0);
    const clientY = e.clientY || (e.touches && e.touches[0] ? e.touches[0].clientY : 0);

    const x = clientX - rect.left;
    const y = clientY - rect.top;
    const cx = rect.width / 2;
    const cy = rect.height / 2;

    const dx = x - cx;
    const dy = y - cy;

    // Angle calculation
    let angle = (Math.atan2(dy, dx) * 180) / Math.PI;
    if (angle < 0) angle += 360;
    baseHue = Math.round(angle);

    // Saturation by radius
    const maxR = rect.width / 2 - 8;
    const dist = Math.sqrt(dx * dx + dy * dy);
    baseSat = clamp(Math.round((dist / maxR) * 100), 5, 100);

    updateAll();
  }

  canvasContainer.addEventListener('pointerdown', (e) => {
    isDragging = true;
    canvasContainer.setPointerCapture(e.pointerId);
    handleCanvasPointer(e);
  });

  canvasContainer.addEventListener('pointermove', (e) => {
    if (isDragging) {
      handleCanvasPointer(e);
    }
  });

  const stopDrag = (e) => {
    if (isDragging) {
      isDragging = false;
      try { canvasContainer.releasePointerCapture(e.pointerId); } catch (_) {}
    }
  };
  canvasContainer.addEventListener('pointerup', stopDrag);
  canvasContainer.addEventListener('pointercancel', stopDrag);

  // --- Harmony Mode Selection ---
  harmonyModesGrid.querySelectorAll('.harmony-mode-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      harmonyModesGrid.querySelectorAll('.harmony-mode-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      harmonyMode = btn.getAttribute('data-mode');

      harmonyExplainerBox.textContent = EXPLAINERS[harmonyMode] || '';

      // Toggle spread slider visibility for applicable modes
      if (harmonyMode === 'analogous' || harmonyMode === 'split-complementary') {
        spreadSliderContainer.style.display = 'flex';
      } else {
        spreadSliderContainer.style.display = 'none';
      }

      updateAll();
      showToast(`Selected ${btn.querySelector('span').textContent} Harmony`);
    });
  });

  // --- Sliders Listeners ---
  hueSlider.addEventListener('input', (e) => {
    baseHue = parseInt(e.target.value, 10);
    updateAll();
  });

  satSlider.addEventListener('input', (e) => {
    baseSat = parseInt(e.target.value, 10);
    updateAll();
  });

  lightSlider.addEventListener('input', (e) => {
    baseLight = parseInt(e.target.value, 10);
    updateAll();
  });

  spreadSlider.addEventListener('input', (e) => {
    spreadAngle = parseInt(e.target.value, 10);
    updateAll();
  });

  // Base Native Picker
  baseColorPicker.addEventListener('input', (e) => {
    const hex = e.target.value;
    const { r, g, b } = hexToRgb(hex);
    const hsl = rgbToHsl(r, g, b);
    baseHue = hsl.h;
    baseSat = hsl.s;
    baseLight = hsl.l;
    updateAll();
  });

  // Base Hex Text Input
  baseHexInput.addEventListener('input', (e) => {
    let val = e.target.value.trim().toUpperCase();
    if (!val.startsWith('#')) val = '#' + val;
    if (/^#[0-9A-F]{6}$/i.test(val)) {
      const { r, g, b } = hexToRgb(val);
      const hsl = rgbToHsl(r, g, b);
      baseHue = hsl.h;
      baseSat = hsl.s;
      baseLight = hsl.l;
      updateAll();
    }
  });

  // Randomize Base Wheel
  randomWheelBtn.addEventListener('click', () => {
    baseHue = Math.floor(Math.random() * 360);
    baseSat = Math.floor(Math.random() * 35) + 65; // 65-100%
    baseLight = Math.floor(Math.random() * 30) + 45; // 45-75%
    updateAll();
    showToast('Randomized base hue and saturation');
  });

  // --- Export Actions ---
  copyPaletteBtn.addEventListener('click', () => {
    const arr = JSON.stringify(activeSwatches.map(s => s.hex));
    navigator.clipboard.writeText(arr).then(() => {
      showToast(`Copied ${activeSwatches.length} colors as array`);
    });
  });

  exportTabs.forEach(btn => {
    btn.addEventListener('click', () => {
      exportTabs.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      activeExportTab = btn.getAttribute('data-tab');
      renderCodeOutput();
    });
  });

  copyCodeBtn.addEventListener('click', () => {
    navigator.clipboard.writeText(exportCodeBox.textContent).then(() => {
      copyCodeBtn.textContent = 'Copied!';
      copyCodeBtn.classList.add('copied');
      setTimeout(() => {
        copyCodeBtn.textContent = 'Copy';
        copyCodeBtn.classList.remove('copied');
      }, 1800);
      showToast('Copied code to clipboard');
    });
  });

  // Export PNG Sheet
  exportWheelPngBtn.addEventListener('click', () => {
    const expCanvas = exportPngCanvas;
    const ctx = expCanvas.getContext('2d');
    const width = 1000;
    const height = 560;

    expCanvas.width = width;
    expCanvas.height = height;

    // Dark canvas background
    ctx.fillStyle = '#0a0d14';
    ctx.fillRect(0, 0, width, height);

    // Title
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 26px Inter, sans-serif';
    ctx.fillText('Color Wheel Harmony Palette', 40, 50);

    ctx.fillStyle = '#94a3b8';
    ctx.font = '14px Inter, sans-serif';
    ctx.fillText(`Rule: ${harmonyMode.toUpperCase()} • Base: hsl(${baseHue}°, ${baseSat}%, ${baseLight}%)`, 40, 78);

    // Draw Wheel on left
    ctx.drawImage(canvas, 40, 110, 360, 360);

    // Swatches on right
    const startX = 440;
    const startY = 110;
    const swatchW = 520;
    const swatchH = Math.min(65, Math.floor(360 / activeSwatches.length));

    activeSwatches.forEach((s, i) => {
      const y = startY + i * (swatchH + 8);

      // Color Box
      ctx.fillStyle = s.hex;
      ctx.beginPath();
      ctx.roundRect(startX, y, 70, swatchH, 6);
      ctx.fill();

      // Info text
      ctx.fillStyle = '#f8fafc';
      ctx.font = 'bold 15px Inter, sans-serif';
      ctx.fillText(s.role, startX + 90, y + 24);

      ctx.fillStyle = '#cbd5e1';
      ctx.font = 'bold 13px monospace';
      ctx.fillText(s.hex, startX + 90, y + 44);

      ctx.fillStyle = '#94a3b8';
      ctx.font = '12px monospace';
      ctx.fillText(`rgb(${s.rgb.r},${s.rgb.g},${s.rgb.b}) • hsl(${s.hsl.h}°,${s.hsl.s}%,${s.hsl.l}%)`, startX + 220, y + 44);
    });

    // Footer
    ctx.fillStyle = '#475569';
    ctx.font = '12px Inter, sans-serif';
    ctx.fillText('Generated by ALL IN ONE Color Wheel Explorer • https://sami12901.github.io/ALL-IN-ONE-v1/', 40, height - 25);

    const link = document.createElement('a');
    link.download = `color-harmony-${harmonyMode}-${Date.now()}.png`;
    link.href = expCanvas.toDataURL('image/png');
    link.click();
    showToast('Exported wheel & harmony palette as PNG');
  });

  // Window resize handler to redraw canvas crisply
  window.addEventListener('resize', () => {
    drawWheelCanvas();
  });

  // --- Initial Launch ---
  renderOffscreenWheel();
  updateAll();
});