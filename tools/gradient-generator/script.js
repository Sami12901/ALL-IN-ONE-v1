// CSS Gradient Generator - Interactive Vanilla JS
document.addEventListener('DOMContentLoaded', () => {
  // DOM References
  const stage = document.getElementById('gradient-stage');
  const previewOverlay = document.getElementById('preview-overlay-card');
  const toggleOverlayBtn = document.getElementById('toggle-overlay-btn');
  const randomizeBtn = document.getElementById('randomize-gradient-btn');

  const colorTrackWrapper = document.getElementById('color-track-wrapper');
  const colorTrackFill = document.getElementById('color-track-fill');
  const stopsListContainer = document.getElementById('stops-list-container');
  const addStopBtn = document.getElementById('add-stop-btn');
  const reverseStopsBtn = document.getElementById('reverse-stops-btn');

  const btnTypeLinear = document.getElementById('btn-type-linear');
  const btnTypeRadial = document.getElementById('btn-type-radial');
  const btnTypeConic = document.getElementById('btn-type-conic');

  const linearControls = document.getElementById('linear-controls-group');
  const radialControls = document.getElementById('radial-controls-group');
  const conicControls = document.getElementById('conic-controls-group');

  const angleSlider = document.getElementById('angle-slider');
  const angleValueDisplay = document.getElementById('angle-value-display');
  const radialShapeSelect = document.getElementById('radial-shape-select');
  const radialPositionSelect = document.getElementById('radial-position-select');
  const conicAngleSlider = document.getElementById('conic-angle-slider');
  const conicAngleDisplay = document.getElementById('conic-angle-display');

  const vendorPrefixesToggle = document.getElementById('vendor-prefixes-toggle');
  const cssCodeDisplay = document.getElementById('css-code-display');
  const copyCssBtn = document.getElementById('copy-css-btn');
  const downloadPngBtn = document.getElementById('download-png-btn');
  const shareGradientBtn = document.getElementById('share-gradient-btn');
  const presetGradientsContainer = document.getElementById('preset-gradients-container');

  const exportCanvas = document.getElementById('export-gradient-canvas');
  const toast = document.getElementById('toast');
  const toastText = document.getElementById('toast-text');

  // State
  let gradientType = 'linear'; // 'linear' | 'radial' | 'conic'
  let angle = 90;
  let radialShape = 'circle';
  let radialPosition = 'center';
  let conicAngle = 0;
  let nextStopId = 3;

  let stops = [
    { id: 1, color: '#3B82F6', position: 0 },
    { id: 2, color: '#9333EA', position: 100 }
  ];

  // Presets
  const presets = [
    { name: 'Cyberpunk Neon', type: 'linear', angle: 135, stops: [{ color: '#f43f5e', position: 0 }, { color: '#8b5cf6', position: 50 }, { color: '#06b6d4', position: 100 }] },
    { name: 'Sunset Boulevard', type: 'linear', angle: 90, stops: [{ color: '#ff416c', position: 0 }, { color: '#ff4b2b', position: 100 }] },
    { name: 'Oceanic Blue', type: 'linear', angle: 180, stops: [{ color: '#2b5876', position: 0 }, { color: '#4e4376', position: 100 }] },
    { name: 'Aurora Glow', type: 'linear', angle: 45, stops: [{ color: '#00c6ff', position: 0 }, { color: '#0072ff', position: 100 }] },
    { name: 'Emerald Velvet', type: 'linear', angle: 120, stops: [{ color: '#0ba360', position: 0 }, { color: '#3cba92', position: 100 }] },
    { name: 'Cosmic Radial', type: 'radial', shape: 'circle', position: 'center', stops: [{ color: '#4338ca', position: 0 }, { color: '#0f172a', position: 100 }] },
    { name: 'Warm Peach', type: 'linear', angle: 90, stops: [{ color: '#ff9a9e', position: 0 }, { color: '#fecfef', position: 99 }, { color: '#a1c4fd', position: 100 }] },
    { name: 'Midnight Sun', type: 'radial', shape: 'ellipse', position: 'top', stops: [{ color: '#f59e0b', position: 0 }, { color: '#7c2d12', position: 60 }, { color: '#0f172a', position: 100 }] }
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

  // --- Core CSS String Construction ---
  function getStopsCssString() {
    const sorted = [...stops].sort((a, b) => a.position - b.position);
    return sorted.map(s => `${s.color} ${s.position}%`).join(', ');
  }

  function getGradientExpression() {
    const stopsStr = getStopsCssString();
    if (gradientType === 'linear') {
      return `linear-gradient(${angle}deg, ${stopsStr})`;
    } else if (gradientType === 'radial') {
      return `radial-gradient(${radialShape} at ${radialPosition}, ${stopsStr})`;
    } else {
      return `conic-gradient(from ${conicAngle}deg at center, ${stopsStr})`;
    }
  }

  function updateUi() {
    const expr = getGradientExpression();

    // Stage background
    stage.style.background = expr;

    // Visual Track (always linear left-to-right)
    const sortedStops = [...stops].sort((a, b) => a.position - b.position);
    const trackExpr = `linear-gradient(90deg, ${sortedStops.map(s => `${s.color} ${s.position}%`).join(', ')})`;
    colorTrackFill.style.background = trackExpr;

    // Generated Code Box
    let fullCss = '';
    const fallbackColor = sortedStops[0] ? sortedStops[0].color : '#3b82f6';

    if (vendorPrefixesToggle.checked) {
      if (gradientType === 'linear') {
        fullCss = [
          `/* Vendor Prefixes */`,
          `background: ${fallbackColor};`,
          `-webkit-linear-gradient(${angle}deg, ${getStopsCssString()});`,
          `-moz-linear-gradient(${angle}deg, ${getStopsCssString()});`,
          `-o-linear-gradient(${angle}deg, ${getStopsCssString()});`,
          `background: ${expr};`
        ].join('\n');
      } else if (gradientType === 'radial') {
        fullCss = [
          `/* Vendor Prefixes */`,
          `background: ${fallbackColor};`,
          `-webkit-radial-gradient(${radialPosition}, ${radialShape}, ${getStopsCssString()});`,
          `-moz-radial-gradient(${radialPosition}, ${radialShape}, ${getStopsCssString()});`,
          `background: ${expr};`
        ].join('\n');
      } else {
        fullCss = `background: ${expr};`;
      }
    } else {
      fullCss = `background: ${expr};`;
    }

    cssCodeDisplay.textContent = fullCss;

    renderStopMarkers();
    renderStopRows();
  }

  // --- Render Color Stop Markers on Track ---
  function renderStopMarkers() {
    // Remove existing markers
    colorTrackWrapper.querySelectorAll('.stop-marker').forEach(m => m.remove());

    stops.forEach((stop) => {
      const marker = document.createElement('div');
      marker.className = 'stop-marker';
      marker.style.left = `${stop.position}%`;
      marker.title = `${stop.color} (${stop.position}%)`;

      const handle = document.createElement('div');
      handle.className = 'stop-marker-handle';
      handle.style.backgroundColor = stop.color;

      marker.appendChild(handle);

      // Drag stop marker along track
      marker.addEventListener('mousedown', (e) => {
        e.stopPropagation();
        e.preventDefault();

        const onMouseMove = (moveEvent) => {
          const rect = colorTrackWrapper.getBoundingClientRect();
          let newPercent = Math.round(((moveEvent.clientX - rect.left) / rect.width) * 100);
          newPercent = Math.max(0, Math.min(100, newPercent));
          stop.position = newPercent;
          updateUi();
        };

        const onMouseUp = () => {
          window.removeEventListener('mousemove', onMouseMove);
          window.removeEventListener('mouseup', onMouseUp);
        };

        window.addEventListener('mousemove', onMouseMove);
        window.addEventListener('mouseup', onMouseUp);
      });

      colorTrackWrapper.appendChild(marker);
    });
  }

  // --- Render Stops Rows in List ---
  function renderStopRows() {
    stopsListContainer.innerHTML = '';
    const sorted = [...stops].sort((a, b) => a.position - b.position);

    sorted.forEach((stop, index) => {
      const row = document.createElement('div');
      row.className = 'stop-row-item';

      row.innerHTML = `
        <input type="color" class="stop-color-input" value="${stop.color}" title="Choose color">
        <input type="text" class="form-input stop-hex-text" value="${stop.color.toUpperCase()}" style="width: 86px; font-family: monospace; font-size: 0.85rem; padding: 0.35rem 0.5rem;" maxlength="7">
        <input type="range" class="range-slider stop-range-slider" min="0" max="100" value="${stop.position}" style="flex: 1;">
        <span style="font-family: monospace; font-size: 0.85rem; min-width: 38px; text-align: right;">${stop.position}%</span>
        <button class="btn btn-secondary stop-delete-btn" style="padding: 0.35rem 0.55rem; color: var(--error);" title="Delete stop" ${stops.length <= 2 ? 'disabled' : ''}>
          <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
        </button>
      `;

      // Color picker
      const colorInput = row.querySelector('.stop-color-input');
      const hexText = row.querySelector('.stop-hex-text');
      const slider = row.querySelector('.stop-range-slider');
      const deleteBtn = row.querySelector('.stop-delete-btn');

      colorInput.addEventListener('input', (e) => {
        stop.color = e.target.value.toUpperCase();
        hexText.value = stop.color;
        updateUi();
      });

      hexText.addEventListener('change', (e) => {
        let val = e.target.value.trim();
        if (!val.startsWith('#')) val = '#' + val;
        if (/^#[0-9A-Fa-f]{6}$/.test(val)) {
          stop.color = val.toUpperCase();
          colorInput.value = val;
          updateUi();
        } else {
          hexText.value = stop.color;
        }
      });

      slider.addEventListener('input', (e) => {
        stop.position = parseInt(e.target.value, 10);
        updateUi();
      });

      deleteBtn.addEventListener('click', () => {
        if (stops.length > 2) {
          stops = stops.filter(s => s.id !== stop.id);
          updateUi();
          showToast('Color stop removed');
        }
      });

      stopsListContainer.appendChild(row);
    });
  }

  // Click on Track Bar to Add Stop
  colorTrackWrapper.addEventListener('click', (e) => {
    if (e.target.closest('.stop-marker')) return;
    const rect = colorTrackWrapper.getBoundingClientRect();
    let clickPercent = Math.round(((e.clientX - rect.left) / rect.width) * 100);
    clickPercent = Math.max(0, Math.min(100, clickPercent));

    // Choose color from nearby stop or random
    const randomHex = '#' + Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0').toUpperCase();
    stops.push({
      id: nextStopId++,
      color: randomHex,
      position: clickPercent
    });
    updateUi();
    showToast(`Added color stop at ${clickPercent}%`);
  });

  // Add Stop Button
  addStopBtn.addEventListener('click', () => {
    const randomHex = '#' + Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0').toUpperCase();
    const sorted = [...stops].sort((a, b) => a.position - b.position);
    let newPos = 50;
    if (sorted.length >= 2) {
      newPos = Math.round((sorted[sorted.length - 2].position + sorted[sorted.length - 1].position) / 2);
    }
    stops.push({
      id: nextStopId++,
      color: randomHex,
      position: newPos
    });
    updateUi();
    showToast('New stop added');
  });

  // Reverse Stops
  reverseStopsBtn.addEventListener('click', () => {
    stops.forEach(s => {
      s.position = 100 - s.position;
    });
    updateUi();
    showToast('Reversed gradient stops!');
  });

  // Randomize Gradient
  randomizeBtn.addEventListener('click', () => {
    const randomColors = [
      '#' + Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0').toUpperCase(),
      '#' + Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0').toUpperCase()
    ];
    if (Math.random() > 0.5) {
      randomColors.push('#' + Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0').toUpperCase());
    }

    stops = randomColors.map((col, idx) => ({
      id: nextStopId++,
      color: col,
      position: Math.round((idx / (randomColors.length - 1)) * 100)
    }));

    angle = Math.floor(Math.random() * 36) * 10;
    angleSlider.value = angle;
    angleValueDisplay.textContent = `${angle}°`;

    updateUi();
    showToast('Generated random gradient!');
  });

  // Toggle Overlay Text
  toggleOverlayBtn.addEventListener('click', () => {
    if (previewOverlay.style.display === 'none') {
      previewOverlay.style.display = 'block';
    } else {
      previewOverlay.style.display = 'none';
    }
  });

  // Gradient Type Controls
  function setType(type) {
    gradientType = type;
    btnTypeLinear.classList.toggle('active', type === 'linear');
    btnTypeRadial.classList.toggle('active', type === 'radial');
    btnTypeConic.classList.toggle('active', type === 'conic');

    linearControls.style.display = type === 'linear' ? 'flex' : 'none';
    radialControls.style.display = type === 'radial' ? 'flex' : 'none';
    conicControls.style.display = type === 'conic' ? 'flex' : 'none';

    updateUi();
  }

  btnTypeLinear.addEventListener('click', () => setType('linear'));
  btnTypeRadial.addEventListener('click', () => setType('radial'));
  btnTypeConic.addEventListener('click', () => setType('conic'));

  // Linear Angle Slider & Presets
  angleSlider.addEventListener('input', (e) => {
    angle = parseInt(e.target.value, 10);
    angleValueDisplay.textContent = `${angle}°`;
    updateUi();
  });

  document.querySelectorAll('.angle-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      angle = parseInt(btn.getAttribute('data-angle'), 10);
      angleSlider.value = angle;
      angleValueDisplay.textContent = `${angle}°`;
      updateUi();
    });
  });

  // Radial Options
  radialShapeSelect.addEventListener('change', (e) => {
    radialShape = e.target.value;
    updateUi();
  });

  radialPositionSelect.addEventListener('change', (e) => {
    radialPosition = e.target.value;
    updateUi();
  });

  // Conic Options
  conicAngleSlider.addEventListener('input', (e) => {
    conicAngle = parseInt(e.target.value, 10);
    conicAngleDisplay.textContent = `${conicAngle}°`;
    updateUi();
  });

  // Vendor Prefixes Toggle
  vendorPrefixesToggle.addEventListener('change', () => {
    updateUi();
  });

  // Copy CSS Code
  copyCssBtn.addEventListener('click', () => {
    navigator.clipboard.writeText(cssCodeDisplay.textContent).then(() => {
      copyCssBtn.textContent = 'Copied!';
      copyCssBtn.classList.add('copied');
      setTimeout(() => {
        copyCssBtn.textContent = 'Copy';
        copyCssBtn.classList.remove('copied');
      }, 1500);
      showToast('CSS rules copied to clipboard!');
    });
  });

  // Download PNG High-Res Background
  downloadPngBtn.addEventListener('click', () => {
    const width = 1920;
    const height = 1080;
    exportCanvas.width = width;
    exportCanvas.height = height;
    const ctx = exportCanvas.getContext('2d');
    const sorted = [...stops].sort((a, b) => a.position - b.position);

    let grad;
    if (gradientType === 'linear') {
      const angleRad = ((angle - 90) * Math.PI) / 180;
      const length = Math.abs(width * Math.cos(angleRad)) + Math.abs(height * Math.sin(angleRad));
      const cx = width / 2;
      const cy = height / 2;
      const x0 = cx - (Math.cos(angleRad) * length) / 2;
      const y0 = cy - (Math.sin(angleRad) * length) / 2;
      const x1 = cx + (Math.cos(angleRad) * length) / 2;
      const y1 = cy + (Math.sin(angleRad) * length) / 2;

      grad = ctx.createLinearGradient(x0, y0, x1, y1);
    } else if (gradientType === 'radial') {
      const cx = width / 2;
      const cy = height / 2;
      const radius = Math.max(width, height) / 1.5;
      grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, radius);
    } else {
      // Conic approximation on canvas (fallback to linear)
      grad = ctx.createLinearGradient(0, 0, width, height);
    }

    sorted.forEach(s => {
      grad.addColorStop(s.position / 100, s.color);
    });

    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, width, height);

    const dataUrl = exportCanvas.toDataURL('image/png');
    const a = document.createElement('a');
    a.href = dataUrl;
    a.download = `gradient-${Date.now()}.png`;
    a.click();
    showToast('High-res 1080p PNG downloaded!');
  });

  // Share Gradient Link
  shareGradientBtn.addEventListener('click', () => {
    const url = new URL(window.location.href);
    url.searchParams.set('type', gradientType);
    url.searchParams.set('angle', angle);
    const stopTokens = stops.map(s => `${s.color.replace('#', '')}@${s.position}`).join('-');
    url.searchParams.set('stops', stopTokens);
    navigator.clipboard.writeText(url.toString()).then(() => {
      window.history.replaceState({}, '', url.toString());
      showToast('Shareable link copied to clipboard!');
    });
  });

  // Render Preset Library
  function renderPresets() {
    presetGradientsContainer.innerHTML = '';
    presets.forEach(p => {
      const card = document.createElement('div');
      card.className = 'preset-gradient-card';

      let bgStyle = '';
      if (p.type === 'linear') {
        bgStyle = `linear-gradient(${p.angle}deg, ${p.stops.map(s => `${s.color} ${s.position}%`).join(', ')})`;
      } else {
        bgStyle = `radial-gradient(circle at center, ${p.stops.map(s => `${s.color} ${s.position}%`).join(', ')})`;
      }

      card.style.background = bgStyle;
      card.innerHTML = `<span>${p.name}</span>`;

      card.addEventListener('click', () => {
        gradientType = p.type;
        setType(p.type);
        if (p.angle !== undefined) {
          angle = p.angle;
          angleSlider.value = angle;
          angleValueDisplay.textContent = `${angle}°`;
        }
        stops = p.stops.map((s, idx) => ({
          id: nextStopId++,
          color: s.color.toUpperCase(),
          position: s.position
        }));
        updateUi();
        showToast(`Loaded ${p.name} preset!`);
      });

      presetGradientsContainer.appendChild(card);
    });
  }

  // Init from URL params
  function initFromUrl() {
    const params = new URLSearchParams(window.location.search);
    const typeParam = params.get('type');
    const angleParam = params.get('angle');
    const stopsParam = params.get('stops');

    if (typeParam && ['linear', 'radial', 'conic'].includes(typeParam)) {
      setType(typeParam);
    }
    if (angleParam && !isNaN(parseInt(angleParam, 10))) {
      angle = parseInt(angleParam, 10);
      angleSlider.value = angle;
      angleValueDisplay.textContent = `${angle}°`;
    }
    if (stopsParam) {
      const parts = stopsParam.split('-');
      const loaded = [];
      parts.forEach((part, idx) => {
        const [hex, pos] = part.split('@');
        if (/^[0-9A-Fa-f]{6}$/.test(hex) && !isNaN(parseInt(pos, 10))) {
          loaded.push({
            id: nextStopId++,
            color: '#' + hex.toUpperCase(),
            position: parseInt(pos, 10)
          });
        }
      });
      if (loaded.length >= 2) {
        stops = loaded;
      }
    }
  }

  // Boot
  renderPresets();
  initFromUrl();
  updateUi();
});