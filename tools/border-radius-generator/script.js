// 8-Point CSS Border Radius Generator Studio
document.addEventListener('DOMContentLoaded', () => {
  // Slider Elements
  const sliderTlH = document.getElementById('slider-tl-h');
  const sliderTrH = document.getElementById('slider-tr-h');
  const sliderBrH = document.getElementById('slider-br-h');
  const sliderBlH = document.getElementById('slider-bl-h');

  const sliderTlV = document.getElementById('slider-tl-v');
  const sliderTrV = document.getElementById('slider-tr-v');
  const sliderBrV = document.getElementById('slider-br-v');
  const sliderBlV = document.getElementById('slider-bl-v');

  // Label Elements
  const valTlH = document.getElementById('val-tl-h');
  const valTrH = document.getElementById('val-tr-h');
  const valBrH = document.getElementById('val-br-h');
  const valBlH = document.getElementById('val-bl-h');

  const valTlV = document.getElementById('val-tl-v');
  const valTrV = document.getElementById('val-tr-v');
  const valBrV = document.getElementById('val-br-v');
  const valBlV = document.getElementById('val-bl-v');

  // Interactive Stage Elements
  const shapeBox = document.getElementById('shape-box');
  const morphTarget = document.getElementById('morph-target');
  const pinTop = document.getElementById('pin-top');
  const pinRight = document.getElementById('pin-right');
  const pinBottom = document.getElementById('pin-bottom');
  const pinLeft = document.getElementById('pin-left');

  const cssCodeDisplay = document.getElementById('css-code-display');
  const copyCssBtn = document.getElementById('copy-css-btn');
  const randomizeBtn = document.getElementById('randomize-btn');
  const resetBtn = document.getElementById('reset-btn');
  const presetList = document.getElementById('preset-list');
  const gradientPalette = document.getElementById('gradient-palette');
  const morphAnimToggle = document.getElementById('morph-anim-toggle');

  // State
  let values = {
    tlH: 30, trH: 70, brH: 70, blH: 30,
    tlV: 30, trV: 30, brV: 70, blV: 70
  };

  const PRESETS = {
    'blob': { tlH: 30, trH: 70, brH: 70, blH: 30, tlV: 30, trV: 30, brV: 70, blV: 70 },
    'badge': { tlH: 60, trH: 40, brH: 30, blH: 70, tlV: 60, trV: 30, brV: 70, blV: 40 },
    'pill': { tlH: 50, trH: 50, brH: 50, blH: 50, tlV: 50, trV: 50, brV: 50, blV: 50 },
    'teardrop': { tlH: 0, trH: 50, brH: 50, blH: 50, tlV: 0, trV: 50, brV: 50, blV: 50 },
    'egg': { tlH: 50, trH: 50, brH: 50, blH: 50, tlV: 60, trV: 60, brV: 40, blV: 40 },
    'leaf': { tlH: 0, trH: 100, brH: 0, blH: 100, tlV: 0, trV: 100, brV: 0, blV: 100 },
    'lemon': { tlH: 10, trH: 90, brH: 10, blH: 90, tlV: 90, trV: 10, brV: 90, blV: 10 },
    'wave': { tlH: 63, trH: 37, brH: 54, blH: 46, tlV: 28, trV: 44, brV: 56, blV: 72 }
  };

  // Sync inputs with state values
  function syncInputs() {
    sliderTlH.value = values.tlH; valTlH.textContent = `${values.tlH}%`;
    sliderTrH.value = values.trH; valTrH.textContent = `${values.trH}%`;
    sliderBrH.value = values.brH; valBrH.textContent = `${values.brH}%`;
    sliderBlH.value = values.blH; valBlH.textContent = `${values.blH}%`;

    sliderTlV.value = values.tlV; valTlV.textContent = `${values.tlV}%`;
    sliderTrV.value = values.trV; valTrV.textContent = `${values.trV}%`;
    sliderBrV.value = values.brV; valBrV.textContent = `${values.brV}%`;
    sliderBlV.value = values.blV; valBlV.textContent = `${values.blV}%`;
  }

  // Update target style, code display, and pins
  function updateShape() {
    const radiusCss = `${values.tlH}% ${values.trH}% ${values.brH}% ${values.blH}% / ${values.tlV}% ${values.trV}% ${values.brV}% ${values.blV}%`;
    morphTarget.style.borderRadius = radiusCss;

    // Position handle pins
    pinTop.style.left = `${values.tlH}%`;
    pinTop.style.top = '0%';

    pinRight.style.left = '100%';
    pinRight.style.top = `${values.trV}%`;

    pinBottom.style.left = `${values.brH}%`;
    pinBottom.style.top = '100%';

    pinLeft.style.left = '0%';
    pinLeft.style.top = `${values.blV}%`;

    // Code output
    cssCodeDisplay.textContent = `/* 8-Point Border Radius */\nborder-radius: ${radiusCss};`;
  }

  // Slider event listeners
  const sliders = [
    { el: sliderTlH, prop: 'tlH', label: valTlH },
    { el: sliderTrH, prop: 'trH', label: valTrH },
    { el: sliderBrH, prop: 'brH', label: valBrH },
    { el: sliderBlH, prop: 'blH', label: valBlH },
    { el: sliderTlV, prop: 'tlV', label: valTlV },
    { el: sliderTrV, prop: 'trV', label: valTrV },
    { el: sliderBrV, prop: 'brV', label: valBrV },
    { el: sliderBlV, prop: 'blV', label: valBlV }
  ];

  sliders.forEach(s => {
    s.el.addEventListener('input', () => {
      values[s.prop] = parseInt(s.el.value, 10);
      s.label.textContent = `${values[s.prop]}%`;
      updateShape();
    });
  });

  // Draggable handle pins logic
  function setupDraggablePin(pinEl, onDrag) {
    let isDragging = false;

    function handleMove(e) {
      if (!isDragging) return;
      const rect = shapeBox.getBoundingClientRect();
      const clientX = e.clientX || (e.touches && e.touches[0].clientX);
      const clientY = e.clientY || (e.touches && e.touches[0].clientY);
      
      const xPercent = Math.max(0, Math.min(100, Math.round(((clientX - rect.left) / rect.width) * 100)));
      const yPercent = Math.max(0, Math.min(100, Math.round(((clientY - rect.top) / rect.height) * 100)));

      onDrag(xPercent, yPercent);
      syncInputs();
      updateShape();
    }

    function handleEnd() {
      if (isDragging) {
        isDragging = false;
        window.removeEventListener('pointermove', handleMove);
        window.removeEventListener('pointerup', handleEnd);
      }
    }

    pinEl.addEventListener('pointerdown', (e) => {
      e.preventDefault();
      isDragging = true;
      window.addEventListener('pointermove', handleMove);
      window.addEventListener('pointerup', handleEnd);
    });
  }

  // Top Pin (horizontal top edge): controls top-left horizontal and top-right horizontal
  setupDraggablePin(pinTop, (x) => {
    values.tlH = x;
    values.trH = 100 - x;
  });

  // Right Pin (vertical right edge): controls top-right vertical and bottom-right vertical
  setupDraggablePin(pinRight, (x, y) => {
    values.trV = y;
    values.brV = 100 - y;
  });

  // Bottom Pin (horizontal bottom edge): controls bottom-right horizontal and bottom-left horizontal
  setupDraggablePin(pinBottom, (x) => {
    values.brH = x;
    values.blH = 100 - x;
  });

  // Left Pin (vertical left edge): controls bottom-left vertical and top-left vertical
  setupDraggablePin(pinLeft, (x, y) => {
    values.blV = y;
    values.tlV = 100 - y;
  });

  // Preset Selection
  presetList.addEventListener('click', (e) => {
    const chip = e.target.closest('.preset-chip');
    if (!chip) return;
    const key = chip.dataset.preset;
    if (!PRESETS[key]) return;

    presetList.querySelectorAll('.preset-chip').forEach(c => c.classList.remove('active'));
    chip.classList.add('active');

    values = { ...PRESETS[key] };
    syncInputs();
    updateShape();
  });

  // Randomize Button
  randomizeBtn.addEventListener('click', () => {
    const rand = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
    values = {
      tlH: rand(20, 80), trH: rand(20, 80), brH: rand(20, 80), blH: rand(20, 80),
      tlV: rand(20, 80), trV: rand(20, 80), brV: rand(20, 80), blV: rand(20, 80)
    };
    syncInputs();
    updateShape();
  });

  // Reset Button
  resetBtn.addEventListener('click', () => {
    const defaultPreset = presetList.querySelector('[data-preset="blob"]');
    if (defaultPreset) defaultPreset.click();
  });

  // Gradient Swatch Selection
  gradientPalette.addEventListener('click', (e) => {
    const pill = e.target.closest('.gradient-pill');
    if (!pill) return;
    gradientPalette.querySelectorAll('.gradient-pill').forEach(p => p.classList.remove('active'));
    pill.classList.add('active');
    morphTarget.style.background = pill.dataset.gradient;
  });

  // Living Fluid Morph Animation
  let animTimer = null;
  morphAnimToggle.addEventListener('click', () => {
    if (animTimer) {
      clearInterval(animTimer);
      animTimer = null;
      morphAnimToggle.textContent = 'Start Animation';
      morphAnimToggle.classList.remove('btn-primary');
      morphAnimToggle.classList.add('btn-secondary');
    } else {
      morphAnimToggle.textContent = 'Stop Animation';
      morphAnimToggle.classList.remove('btn-secondary');
      morphAnimToggle.classList.add('btn-primary');
      const presetKeys = Object.keys(PRESETS);
      let presetIndex = 0;
      animTimer = setInterval(() => {
        presetIndex = (presetIndex + 1) % presetKeys.length;
        const nextKey = presetKeys[presetIndex];
        values = { ...PRESETS[nextKey] };
        syncInputs();
        updateShape();
      }, 1600);
    }
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

  // Initial Sync
  syncInputs();
  updateShape();
});