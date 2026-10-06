// CSS Box Shadow Generator - Interactive Multi-Layer Studio
document.addEventListener('DOMContentLoaded', () => {
  // Elements
  const sliderX = document.getElementById('slider-x');
  const sliderY = document.getElementById('slider-y');
  const sliderBlur = document.getElementById('slider-blur');
  const sliderSpread = document.getElementById('slider-spread');
  const sliderOpacity = document.getElementById('slider-opacity');
  const shadowColor = document.getElementById('shadow-color');
  const shadowHexText = document.getElementById('shadow-hex-text');
  const checkInset = document.getElementById('check-inset');

  const valX = document.getElementById('val-x');
  const valY = document.getElementById('val-y');
  const valBlur = document.getElementById('val-blur');
  const valSpread = document.getElementById('val-spread');
  const valOpacity = document.getElementById('val-opacity');

  const boxBgColor = document.getElementById('box-bg-color');
  const boxBgHex = document.getElementById('box-bg-hex');
  const stageBgColor = document.getElementById('stage-bg-color');
  const stageBgHex = document.getElementById('stage-bg-hex');
  const sliderRadius = document.getElementById('slider-radius');
  const valRadius = document.getElementById('val-radius');

  const previewStage = document.getElementById('preview-stage');
  const previewTarget = document.getElementById('preview-target');
  const layerCountLabel = document.getElementById('layer-count-label');
  const cssCodeDisplay = document.getElementById('css-code-display');
  const copyCssBtn = document.getElementById('copy-css-btn');
  const checkVendor = document.getElementById('check-vendor');
  const addLayerBtn = document.getElementById('add-layer-btn');
  const layersTabs = document.getElementById('layers-tabs');
  const resetBtn = document.getElementById('reset-btn');
  const presetList = document.getElementById('preset-list');

  // Presets definition
  const PRESETS = {
    'soft-glow': {
      layers: [
        { x: 0, y: 12, blur: 28, spread: -4, color: '#4e85bf', opacity: 35, inset: false },
        { x: 0, y: 4, blur: 10, spread: -2, color: '#4e85bf', opacity: 20, inset: false }
      ],
      boxBg: '#1e2430',
      stageBg: '#0d1117',
      radius: 16
    },
    'floating': {
      layers: [
        { x: 0, y: 25, blur: 50, spread: -12, color: '#000000', opacity: 50, inset: false },
        { x: 0, y: 12, blur: 24, spread: -8, color: '#000000', opacity: 40, inset: false },
        { x: 0, y: 4, blur: 6, spread: -1, color: '#000000', opacity: 25, inset: false }
      ],
      boxBg: '#21262d',
      stageBg: '#0d1117',
      radius: 20
    },
    'neumorphic': {
      layers: [
        { x: -8, y: -8, blur: 20, spread: 0, color: '#ffffff', opacity: 8, inset: false },
        { x: 8, y: 8, blur: 20, spread: 0, color: '#000000', opacity: 60, inset: false }
      ],
      boxBg: '#181c24',
      stageBg: '#12151b',
      radius: 24
    },
    'dark-luxury': {
      layers: [
        { x: 0, y: 20, blur: 40, spread: -5, color: '#000000', opacity: 75, inset: false },
        { x: 0, y: 0, blur: 1, spread: 1, color: '#d4af37', opacity: 30, inset: false },
        { x: 0, y: 0, blur: 30, spread: 5, color: '#d4af37', opacity: 12, inset: false }
      ],
      boxBg: '#121418',
      stageBg: '#090a0d',
      radius: 18
    },
    'minimal-card': {
      layers: [
        { x: 0, y: 4, blur: 16, spread: 0, color: '#000000', opacity: 25, inset: false }
      ],
      boxBg: '#22272e',
      stageBg: '#0f141c',
      radius: 12
    },
    'neon-cyber': {
      layers: [
        { x: 0, y: 0, blur: 12, spread: 2, color: '#00f0ff', opacity: 80, inset: false },
        { x: 0, y: 0, blur: 35, spread: 8, color: '#7000ff', opacity: 60, inset: false },
        { x: 0, y: 0, blur: 60, spread: 15, color: '#ff007f', opacity: 35, inset: false }
      ],
      boxBg: '#0a0d14',
      stageBg: '#040609',
      radius: 16
    },
    'deep-inset': {
      layers: [
        { x: 4, y: 4, blur: 12, spread: 2, color: '#000000', opacity: 65, inset: true },
        { x: -4, y: -4, blur: 12, spread: 0, color: '#ffffff', opacity: 6, inset: true }
      ],
      boxBg: '#1c2128',
      stageBg: '#10141a',
      radius: 16
    }
  };

  // State
  let layers = JSON.parse(JSON.stringify(PRESETS['soft-glow'].layers));
  let activeLayerIndex = 0;

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

  // Render layer tab pills
  function renderLayerTabs() {
    layersTabs.innerHTML = '';
    layers.forEach((layer, idx) => {
      const tab = document.createElement('div');
      tab.className = `layer-tab ${idx === activeLayerIndex ? 'active' : ''}`;
      tab.dataset.index = idx;
      
      const titleSpan = document.createElement('span');
      titleSpan.textContent = `Layer ${idx + 1}${layer.inset ? ' (Inset)' : ''}`;
      tab.appendChild(titleSpan);

      if (layers.length > 1) {
        const delBtn = document.createElement('button');
        delBtn.className = 'layer-del-btn';
        delBtn.innerHTML = '&times;';
        delBtn.title = 'Remove layer';
        delBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          removeLayer(idx);
        });
        tab.appendChild(delBtn);
      }

      tab.addEventListener('click', () => {
        activeLayerIndex = idx;
        renderLayerTabs();
        syncControlsWithActiveLayer();
      });

      layersTabs.appendChild(tab);
    });

    layerCountLabel.textContent = `${layers.length} Layer${layers.length > 1 ? 's' : ''} Active`;
  }

  // Sync inputs with active layer state
  function syncControlsWithActiveLayer() {
    const cur = layers[activeLayerIndex];
    if (!cur) return;

    sliderX.value = cur.x;
    valX.textContent = `${cur.x}px`;

    sliderY.value = cur.y;
    valY.textContent = `${cur.y}px`;

    sliderBlur.value = cur.blur;
    valBlur.textContent = `${cur.blur}px`;

    sliderSpread.value = cur.spread;
    valSpread.textContent = `${cur.spread}px`;

    sliderOpacity.value = cur.opacity;
    valOpacity.textContent = `${cur.opacity}%`;

    shadowColor.value = cur.color;
    shadowHexText.value = cur.color;

    checkInset.checked = !!cur.inset;

    updatePreviewAndCode();
  }

  // Remove layer
  function removeLayer(idx) {
    if (layers.length <= 1) return;
    layers.splice(idx, 1);
    if (activeLayerIndex >= layers.length) {
      activeLayerIndex = layers.length - 1;
    }
    renderLayerTabs();
    syncControlsWithActiveLayer();
  }

  // Add new layer
  addLayerBtn.addEventListener('click', () => {
    layers.push({
      x: 0,
      y: 8,
      blur: 20,
      spread: 0,
      color: '#000000',
      opacity: 30,
      inset: false
    });
    activeLayerIndex = layers.length - 1;
    renderLayerTabs();
    syncControlsWithActiveLayer();
  });

  // Calculate Box Shadow CSS rule
  function buildBoxShadowString() {
    return layers.map(l => {
      const rgba = hexToRgba(l.color, l.opacity);
      const insetStr = l.inset ? 'inset ' : '';
      return `${insetStr}${l.x}px ${l.y}px ${l.blur}px ${l.spread}px ${rgba}`;
    }).join(',\n    ');
  }

  // Update target element and code text
  function updatePreviewAndCode() {
    const shadowSingleLine = layers.map(l => {
      const rgba = hexToRgba(l.color, l.opacity);
      const insetStr = l.inset ? 'inset ' : '';
      return `${insetStr}${l.x}px ${l.y}px ${l.blur}px ${l.spread}px ${rgba}`;
    }).join(', ');

    previewTarget.style.boxShadow = shadowSingleLine;
    previewTarget.style.borderRadius = `${sliderRadius.value}px`;
    previewTarget.style.backgroundColor = boxBgColor.value;
    previewStage.style.backgroundColor = stageBgColor.value;

    valRadius.textContent = `${sliderRadius.value}px`;
    boxBgHex.textContent = boxBgColor.value;
    stageBgHex.textContent = stageBgColor.value;

    const formattedShadow = buildBoxShadowString();
    let code = '';
    if (checkVendor.checked) {
      code += `-webkit-box-shadow: ${formattedShadow};\n`;
    }
    code += `box-shadow: ${formattedShadow};`;
    cssCodeDisplay.textContent = code;
  }

  // Input Event Listeners for active layer
  sliderX.addEventListener('input', () => {
    layers[activeLayerIndex].x = parseInt(sliderX.value, 10);
    valX.textContent = `${sliderX.value}px`;
    updatePreviewAndCode();
  });

  sliderY.addEventListener('input', () => {
    layers[activeLayerIndex].y = parseInt(sliderY.value, 10);
    valY.textContent = `${sliderY.value}px`;
    updatePreviewAndCode();
  });

  sliderBlur.addEventListener('input', () => {
    layers[activeLayerIndex].blur = parseInt(sliderBlur.value, 10);
    valBlur.textContent = `${sliderBlur.value}px`;
    updatePreviewAndCode();
  });

  sliderSpread.addEventListener('input', () => {
    layers[activeLayerIndex].spread = parseInt(sliderSpread.value, 10);
    valSpread.textContent = `${sliderSpread.value}px`;
    updatePreviewAndCode();
  });

  sliderOpacity.addEventListener('input', () => {
    layers[activeLayerIndex].opacity = parseInt(sliderOpacity.value, 10);
    valOpacity.textContent = `${sliderOpacity.value}%`;
    updatePreviewAndCode();
  });

  shadowColor.addEventListener('input', () => {
    layers[activeLayerIndex].color = shadowColor.value;
    shadowHexText.value = shadowColor.value;
    updatePreviewAndCode();
  });

  shadowHexText.addEventListener('input', () => {
    const val = shadowHexText.value.trim();
    if (/^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/.test(val)) {
      layers[activeLayerIndex].color = val;
      shadowColor.value = val;
      updatePreviewAndCode();
    }
  });

  checkInset.addEventListener('change', () => {
    layers[activeLayerIndex].inset = checkInset.checked;
    renderLayerTabs();
    updatePreviewAndCode();
  });

  // Target customization events
  boxBgColor.addEventListener('input', updatePreviewAndCode);
  stageBgColor.addEventListener('input', updatePreviewAndCode);
  sliderRadius.addEventListener('input', updatePreviewAndCode);
  checkVendor.addEventListener('change', updatePreviewAndCode);

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
      // Fallback
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

  // Presets selector
  presetList.addEventListener('click', (e) => {
    const chip = e.target.closest('.preset-chip');
    if (!chip) return;
    const key = chip.dataset.preset;
    if (!PRESETS[key]) return;

    presetList.querySelectorAll('.preset-chip').forEach(c => c.classList.remove('active'));
    chip.classList.add('active');

    const config = PRESETS[key];
    layers = JSON.parse(JSON.stringify(config.layers));
    activeLayerIndex = 0;

    if (config.boxBg) boxBgColor.value = config.boxBg;
    if (config.stageBg) stageBgColor.value = config.stageBg;
    if (config.radius !== undefined) sliderRadius.value = config.radius;

    renderLayerTabs();
    syncControlsWithActiveLayer();
  });

  // Reset Button
  resetBtn.addEventListener('click', () => {
    const firstPreset = presetList.querySelector('[data-preset="soft-glow"]');
    if (firstPreset) firstPreset.click();
  });

  // Initialize
  renderLayerTabs();
  syncControlsWithActiveLayer();
});