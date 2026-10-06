// SVG Path Builder - Interactive Vanilla JS
document.addEventListener('DOMContentLoaded', () => {
  // --- State ---
  let segments = [];
  let selectedSegmentIndex = -1;
  let activeMode = 'M'; // 'M', 'L', 'C', 'Q', 'A', 'Z'
  let snapGrid = 10;
  let historyStack = [];
  let historyPointer = -1;
  let currentOutputTab = 'svg'; // 'svg' | 'd'

  // Dragging state
  let isDragging = false;
  let dragTarget = null; // { type: 'anchor'|'cp1'|'cp2'|'cp', index: number }

  // Styling state
  let styleState = {
    fill: '#4e85bf',
    fillNone: false,
    fillOpacity: 20,
    stroke: '#4e85bf',
    strokeNone: false,
    strokeWidth: 3,
    strokeLinecap: 'round',
    strokeLinejoin: 'round'
  };

  // --- DOM Elements ---
  const svgCanvas = document.getElementById('svg-canvas');
  const canvasContainer = document.getElementById('canvas-container');
  const renderedPath = document.getElementById('rendered-path');
  const guideLinesLayer = document.getElementById('guide-lines-layer');
  const handlesLayer = document.getElementById('handles-layer');
  const coordsDisplay = document.getElementById('coords-display');
  const segmentCountBadge = document.getElementById('segment-count-badge');

  const snapSelect = document.getElementById('snap-select');
  const presetShapeSelect = document.getElementById('preset-shape-select');
  const btnUndo = document.getElementById('btn-undo');
  const btnClearCanvas = document.getElementById('btn-clear-canvas');

  const modeButtons = document.querySelectorAll('.mode-btn[data-mode]');

  // Style inputs
  const fillColorPicker = document.getElementById('fill-color-picker');
  const fillSwatchDisp = document.getElementById('fill-swatch-disp');
  const fillNoneToggle = document.getElementById('fill-none-toggle');
  const fillOpacitySlider = document.getElementById('fill-opacity-slider');
  const fillOpacityVal = document.getElementById('fill-opacity-val');

  const strokeColorPicker = document.getElementById('stroke-color-picker');
  const strokeSwatchDisp = document.getElementById('stroke-swatch-disp');
  const strokeNoneToggle = document.getElementById('stroke-none-toggle');
  const strokeWidthSlider = document.getElementById('stroke-width-slider');
  const strokeWidthVal = document.getElementById('stroke-width-val');
  const strokeLinecapSelect = document.getElementById('stroke-linecap-select');
  const strokeLinejoinSelect = document.getElementById('stroke-linejoin-select');

  // Segments Inspector
  const segmentsListContainer = document.getElementById('segments-list-container');
  const btnDeleteSegment = document.getElementById('btn-delete-segment');

  // Code Export
  const tabSvgCode = document.getElementById('tab-svg-code');
  const tabPathD = document.getElementById('tab-path-d');
  const codeOutputBox = document.getElementById('code-output-box');
  const btnCopySvg = document.getElementById('btn-copy-svg');
  const btnCopyD = document.getElementById('btn-copy-d');
  const btnDownloadSvg = document.getElementById('btn-download-svg');
  const importPathInput = document.getElementById('import-path-input');
  const btnImportPath = document.getElementById('btn-import-path');

  // Toast
  const toast = document.getElementById('toast');
  const toastMessage = document.getElementById('toast-message');

  // --- Toast Helper ---
  let toastTimer = null;
  function showToast(msg) {
    if (toastTimer) clearTimeout(toastTimer);
    toastMessage.textContent = msg;
    toast.classList.add('show');
    toastTimer = setTimeout(() => {
      toast.classList.remove('show');
    }, 2200);
  }

  // --- History Management ---
  function pushHistory() {
    if (historyPointer < historyStack.length - 1) {
      historyStack = historyStack.slice(0, historyPointer + 1);
    }
    historyStack.push(JSON.parse(JSON.stringify(segments)));
    if (historyStack.length > 30) historyStack.shift();
    historyPointer = historyStack.length - 1;
  }

  function undo() {
    if (historyPointer > 0) {
      historyPointer--;
      segments = JSON.parse(JSON.stringify(historyStack[historyPointer]));
      if (selectedSegmentIndex >= segments.length) {
        selectedSegmentIndex = segments.length - 1;
      }
      renderAll();
      showToast('Undo action');
    }
  }

  // --- Coordinate Transformation ---
  function getCanvasCoords(e) {
    const rect = svgCanvas.getBoundingClientRect();
    const scaleX = 800 / rect.width;
    const scaleY = 600 / rect.height;

    let clientX = e.clientX;
    let clientY = e.clientY;
    if (e.touches && e.touches.length > 0) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    }

    let x = (clientX - rect.left) * scaleX;
    let y = (clientY - rect.top) * scaleY;

    if (snapGrid > 0) {
      x = Math.round(x / snapGrid) * snapGrid;
      y = Math.round(y / snapGrid) * snapGrid;
    }

    x = Math.max(0, Math.min(800, Math.round(x)));
    y = Math.max(0, Math.min(600, Math.round(y)));
    return { x, y };
  }

  // Helper: Find previous endpoint in segments list
  function getPreviousEndpoint(upToIndex = segments.length) {
    for (let i = upToIndex - 1; i >= 0; i--) {
      const seg = segments[i];
      if (seg.x !== undefined && seg.y !== undefined) {
        return { x: seg.x, y: seg.y };
      }
    }
    return { x: 400, y: 300 };
  }

  // --- SVG Path String Builder ---
  function buildPathDString(segs = segments) {
    if (!segs || segs.length === 0) return '';
    return segs.map(seg => {
      switch (seg.type) {
        case 'M':
          return `M ${seg.x} ${seg.y}`;
        case 'L':
          return `L ${seg.x} ${seg.y}`;
        case 'C':
          return `C ${seg.cp1x} ${seg.cp1y}, ${seg.cp2x} ${seg.cp2y}, ${seg.x} ${seg.y}`;
        case 'Q':
          return `Q ${seg.cpx} ${seg.cpy}, ${seg.x} ${seg.y}`;
        case 'A':
          return `A ${seg.rx || 50} ${seg.ry || 50} ${seg.xAxisRotation || 0} ${seg.largeArcFlag || 0} ${seg.sweepFlag || 1} ${seg.x} ${seg.y}`;
        case 'Z':
          return 'Z';
        default:
          return '';
      }
    }).filter(Boolean).join(' ');
  }

  // --- SVG Element Creation Helpers ---
  const SVG_NS = 'http://www.w3.org/2000/svg';

  function createSvgElement(tag, attrs = {}) {
    const el = document.createElementNS(SVG_NS, tag);
    for (const [key, val] of Object.entries(attrs)) {
      el.setAttribute(key, val);
    }
    return el;
  }

  // --- Rendering Functions ---
  function renderPath() {
    const dStr = buildPathDString();
    renderedPath.setAttribute('d', dStr);

    // Apply Fill
    if (styleState.fillNone) {
      renderedPath.setAttribute('fill', 'none');
    } else {
      const opacity = styleState.fillOpacity / 100;
      renderedPath.setAttribute('fill', styleState.fill);
      renderedPath.setAttribute('fill-opacity', opacity.toString());
    }

    // Apply Stroke
    if (styleState.strokeNone) {
      renderedPath.setAttribute('stroke', 'none');
    } else {
      renderedPath.setAttribute('stroke', styleState.stroke);
      renderedPath.setAttribute('stroke-width', styleState.strokeWidth.toString());
      renderedPath.setAttribute('stroke-linecap', styleState.strokeLinecap);
      renderedPath.setAttribute('stroke-linejoin', styleState.strokeLinejoin);
    }

    segmentCountBadge.textContent = `${segments.length} Segment${segments.length === 1 ? '' : 's'}`;
  }

  function renderHandlesAndGuides() {
    guideLinesLayer.innerHTML = '';
    handlesLayer.innerHTML = '';

    segments.forEach((seg, idx) => {
      const isSelected = (idx === selectedSegmentIndex);
      const prevPt = getPreviousEndpoint(idx);

      // 1. Guides & Controls for Cubic Bézier
      if (seg.type === 'C') {
        // Line from prevPt to CP1
        const g1 = createSvgElement('line', {
          x1: prevPt.x,
          y1: prevPt.y,
          x2: seg.cp1x,
          y2: seg.cp1y,
          class: 'guide-line'
        });
        guideLinesLayer.appendChild(g1);

        // Line from end Pt to CP2
        const g2 = createSvgElement('line', {
          x1: seg.x,
          y1: seg.y,
          x2: seg.cp2x,
          y2: seg.cp2y,
          class: 'guide-line-c2'
        });
        guideLinesLayer.appendChild(g2);

        // Handle for CP1
        const hCp1 = createSvgElement('circle', {
          cx: seg.cp1x,
          cy: seg.cp1y,
          r: isSelected ? '6' : '5',
          class: `handle-control ${isSelected ? 'active' : ''}`,
          'data-type': 'cp1',
          'data-index': idx
        });
        handlesLayer.appendChild(hCp1);

        // Handle for CP2
        const hCp2 = createSvgElement('circle', {
          cx: seg.cp2x,
          cy: seg.cp2y,
          r: isSelected ? '6' : '5',
          class: `handle-control-2 ${isSelected ? 'active' : ''}`,
          'data-type': 'cp2',
          'data-index': idx
        });
        handlesLayer.appendChild(hCp2);
      }

      // 2. Guides & Controls for Quad Bézier
      if (seg.type === 'Q') {
        const g1 = createSvgElement('line', {
          x1: prevPt.x,
          y1: prevPt.y,
          x2: seg.cpx,
          y2: seg.cpy,
          class: 'guide-line'
        });
        const g2 = createSvgElement('line', {
          x1: seg.x,
          y1: seg.y,
          x2: seg.cpx,
          y2: seg.cpy,
          class: 'guide-line'
        });
        guideLinesLayer.appendChild(g1);
        guideLinesLayer.appendChild(g2);

        const hCp = createSvgElement('circle', {
          cx: seg.cpx,
          cy: seg.cpy,
          r: isSelected ? '6' : '5',
          class: `handle-control ${isSelected ? 'active' : ''}`,
          'data-type': 'cp',
          'data-index': idx
        });
        handlesLayer.appendChild(hCp);
      }

      // 3. Anchor Handle (Endpoint)
      if (seg.x !== undefined && seg.y !== undefined) {
        const hAnchor = createSvgElement('circle', {
          cx: seg.x,
          cy: seg.y,
          r: isSelected ? '7.5' : '6',
          class: `handle-anchor ${isSelected ? 'active' : ''}`,
          'data-type': 'anchor',
          'data-index': idx
        });
        handlesLayer.appendChild(hAnchor);
      }
    });
  }

  function renderInspectorList() {
    segmentsListContainer.innerHTML = '';
    if (segments.length === 0) {
      segmentsListContainer.innerHTML = `
        <div style="padding: 1.25rem; text-align: center; color: var(--text-secondary); font-size: 0.8rem;">
          No segments yet. Click on canvas to begin path.
        </div>
      `;
      return;
    }

    segments.forEach((seg, idx) => {
      const item = document.createElement('div');
      item.className = `point-item ${idx === selectedSegmentIndex ? 'active' : ''}`;

      let coordText = '';
      if (seg.type === 'M' || seg.type === 'L') {
        coordText = `(${seg.x}, ${seg.y})`;
      } else if (seg.type === 'C') {
        coordText = `&rarr; (${seg.x}, ${seg.y})`;
      } else if (seg.type === 'Q') {
        coordText = `&rarr; (${seg.x}, ${seg.y})`;
      } else if (seg.type === 'A') {
        coordText = `r:(${seg.rx},${seg.ry}) &rarr; (${seg.x}, ${seg.y})`;
      } else if (seg.type === 'Z') {
        coordText = `Close path to start`;
      }

      item.innerHTML = `
        <div style="display: flex; align-items: center;">
          <span class="point-cmd-badge">${seg.type}</span>
          <span style="font-weight: 500;">#${idx + 1}</span>
        </div>
        <span style="color: var(--text-secondary); font-size: 0.75rem;">${coordText}</span>
      `;

      item.addEventListener('click', () => {
        selectedSegmentIndex = idx;
        renderAll();
      });

      segmentsListContainer.appendChild(item);
    });
  }

  function renderCodeExport() {
    const dStr = buildPathDString();
    let fillAttr = styleState.fillNone ? 'none' : styleState.fill;
    let fillOpacityAttr = (styleState.fillNone || styleState.fillOpacity === 100)
      ? ''
      : `\n    fill-opacity="${(styleState.fillOpacity / 100).toFixed(2)}"`;
    let strokeAttr = styleState.strokeNone ? 'none' : styleState.stroke;
    let strokeWidthAttr = styleState.strokeNone ? '' : `\n    stroke-width="${styleState.strokeWidth}"`;
    let strokeLinecapAttr = styleState.strokeNone ? '' : `\n    stroke-linecap="${styleState.strokeLinecap}"`;
    let strokeLinejoinAttr = styleState.strokeNone ? '' : `\n    stroke-linejoin="${styleState.strokeLinejoin}"`;

    if (currentOutputTab === 'svg') {
      const code = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 600" width="100%" height="100%">
  <path
    d="${dStr || 'M 0 0'}"
    fill="${fillAttr}"${fillOpacityAttr}
    stroke="${strokeAttr}"${strokeWidthAttr}${strokeLinecapAttr}${strokeLinejoinAttr}
  />
</svg>`;
      codeOutputBox.textContent = code;
    } else {
      codeOutputBox.textContent = dStr || 'M 0 0';
    }
  }

  function renderAll() {
    renderPath();
    renderHandlesAndGuides();
    renderInspectorList();
    renderCodeExport();
  }

  // --- Segment Creation Logic ---
  function addSegment(x, y) {
    const prev = getPreviousEndpoint();

    if (segments.length === 0 || activeMode === 'M') {
      segments.push({ type: 'M', x, y });
    } else if (activeMode === 'L') {
      segments.push({ type: 'L', x, y });
    } else if (activeMode === 'C') {
      // Intelligent default control point placements
      const dx = x - prev.x;
      const dy = y - prev.y;
      const cp1x = Math.round(prev.x + dx * 0.3);
      const cp1y = Math.round(prev.y - 40);
      const cp2x = Math.round(prev.x + dx * 0.7);
      const cp2y = Math.round(y - 40);
      segments.push({
        type: 'C',
        cp1x,
        cp1y,
        cp2x,
        cp2y,
        x,
        y
      });
    } else if (activeMode === 'Q') {
      // Single control point placement
      const cpx = Math.round((prev.x + x) / 2);
      const cpy = Math.round(Math.min(prev.y, y) - 50);
      segments.push({
        type: 'Q',
        cpx,
        cpy,
        x,
        y
      });
    } else if (activeMode === 'A') {
      const dist = Math.hypot(x - prev.x, y - prev.y);
      const radius = Math.max(20, Math.round(dist * 0.6));
      segments.push({
        type: 'A',
        rx: radius,
        ry: radius,
        xAxisRotation: 0,
        largeArcFlag: 0,
        sweepFlag: 1,
        x,
        y
      });
    } else if (activeMode === 'Z') {
      segments.push({ type: 'Z' });
    }

    selectedSegmentIndex = segments.length - 1;
    pushHistory();
    renderAll();
  }

  // --- Canvas Pointer / Dragging Handlers ---
  canvasContainer.addEventListener('mousemove', e => {
    const coords = getCanvasCoords(e);
    coordsDisplay.textContent = `X: ${coords.x}, Y: ${coords.y}`;

    if (isDragging && dragTarget) {
      const seg = segments[dragTarget.index];
      if (!seg) return;

      if (dragTarget.type === 'anchor') {
        const dx = coords.x - seg.x;
        const dy = coords.y - seg.y;
        seg.x = coords.x;
        seg.y = coords.y;

        // If dragging anchor of Bézier, also move CP2 proportionally for smooth feeling
        if (seg.type === 'C' && seg.cp2x !== undefined) {
          seg.cp2x += dx;
          seg.cp2y += dy;
        }
      } else if (dragTarget.type === 'cp1') {
        seg.cp1x = coords.x;
        seg.cp1y = coords.y;
      } else if (dragTarget.type === 'cp2') {
        seg.cp2x = coords.x;
        seg.cp2y = coords.y;
      } else if (dragTarget.type === 'cp') {
        seg.cpx = coords.x;
        seg.cpy = coords.y;
      }

      renderAll();
    }
  });

  canvasContainer.addEventListener('mousedown', e => {
    // Check if target is an interactive handle
    const handle = e.target.closest('[data-type]');
    if (handle) {
      isDragging = true;
      const type = handle.getAttribute('data-type');
      const index = parseInt(handle.getAttribute('data-index'), 10);
      dragTarget = { type, index };
      selectedSegmentIndex = index;
      handle.classList.add('handle-dragging');
      renderAll();
      return;
    }

    // Otherwise user clicked on empty canvas area
    if (activeMode === 'Z') {
      if (segments.length > 0 && segments[segments.length - 1].type !== 'Z') {
        segments.push({ type: 'Z' });
        selectedSegmentIndex = segments.length - 1;
        pushHistory();
        renderAll();
      }
      return;
    }

    const coords = getCanvasCoords(e);
    addSegment(coords.x, coords.y);
  });

  window.addEventListener('mouseup', () => {
    if (isDragging) {
      isDragging = false;
      dragTarget = null;
      pushHistory();
      renderAll();
    }
  });

  // Touch support for tablets/mobile
  canvasContainer.addEventListener('touchstart', e => {
    const handle = e.target.closest('[data-type]');
    if (handle) {
      e.preventDefault();
      isDragging = true;
      const type = handle.getAttribute('data-type');
      const index = parseInt(handle.getAttribute('data-index'), 10);
      dragTarget = { type, index };
      selectedSegmentIndex = index;
      renderAll();
    }
  }, { passive: false });

  canvasContainer.addEventListener('touchmove', e => {
    if (isDragging && dragTarget) {
      e.preventDefault();
      const coords = getCanvasCoords(e);
      coordsDisplay.textContent = `X: ${coords.x}, Y: ${coords.y}`;

      const seg = segments[dragTarget.index];
      if (!seg) return;

      if (dragTarget.type === 'anchor') {
        const dx = coords.x - seg.x;
        const dy = coords.y - seg.y;
        seg.x = coords.x;
        seg.y = coords.y;
        if (seg.type === 'C' && seg.cp2x !== undefined) {
          seg.cp2x += dx;
          seg.cp2y += dy;
        }
      } else if (dragTarget.type === 'cp1') {
        seg.cp1x = coords.x;
        seg.cp1y = coords.y;
      } else if (dragTarget.type === 'cp2') {
        seg.cp2x = coords.x;
        seg.cp2y = coords.y;
      } else if (dragTarget.type === 'cp') {
        seg.cpx = coords.x;
        seg.cpy = coords.y;
      }
      renderAll();
    }
  }, { passive: false });

  window.addEventListener('touchend', () => {
    if (isDragging) {
      isDragging = false;
      dragTarget = null;
      pushHistory();
      renderAll();
    }
  });

  // --- Mode Buttons ---
  modeButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      modeButtons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      activeMode = btn.getAttribute('data-mode');

      if (activeMode === 'Z') {
        if (segments.length > 0 && segments[segments.length - 1].type !== 'Z') {
          segments.push({ type: 'Z' });
          selectedSegmentIndex = segments.length - 1;
          pushHistory();
          renderAll();
          showToast('Closed path (Z)');
        }
      } else {
        showToast(`Selected mode: ${btn.textContent.trim()}`);
      }
    });
  });

  // Keyboard shortcuts for mode selection
  window.addEventListener('keydown', e => {
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || e.target.tagName === 'SELECT') {
      return;
    }
    const key = e.key.toUpperCase();
    if (['M', 'L', 'C', 'Q', 'A', 'Z'].includes(key)) {
      const targetBtn = document.querySelector(`.mode-btn[data-mode="${key}"]`);
      if (targetBtn) targetBtn.click();
    } else if ((e.ctrlKey || e.metaKey) && key === 'Z') {
      e.preventDefault();
      undo();
    } else if (key === 'DELETE' || key === 'BACKSPACE') {
      if (selectedSegmentIndex >= 0 && selectedSegmentIndex < segments.length) {
        segments.splice(selectedSegmentIndex, 1);
        selectedSegmentIndex = Math.max(0, selectedSegmentIndex - 1);
        pushHistory();
        renderAll();
      }
    }
  });

  // Snap selector
  snapSelect.addEventListener('change', e => {
    snapGrid = parseInt(e.target.value, 10);
    showToast(`Snap set to ${snapGrid > 0 ? snapGrid + 'px' : 'None'}`);
  });

  // Undo button
  btnUndo.addEventListener('click', undo);

  // Clear canvas
  btnClearCanvas.addEventListener('click', () => {
    if (segments.length === 0) return;
    segments = [];
    selectedSegmentIndex = -1;
    pushHistory();
    renderAll();
    showToast('Canvas cleared');
  });

  // Delete segment
  btnDeleteSegment.addEventListener('click', () => {
    if (selectedSegmentIndex >= 0 && selectedSegmentIndex < segments.length) {
      segments.splice(selectedSegmentIndex, 1);
      selectedSegmentIndex = Math.min(selectedSegmentIndex, segments.length - 1);
      pushHistory();
      renderAll();
      showToast('Segment deleted');
    }
  });

  // --- Styling Listeners ---
  fillColorPicker.addEventListener('input', e => {
    styleState.fill = e.target.value;
    fillSwatchDisp.style.background = e.target.value;
    renderAll();
  });

  fillNoneToggle.addEventListener('change', e => {
    styleState.fillNone = e.target.checked;
    renderAll();
  });

  fillOpacitySlider.addEventListener('input', e => {
    styleState.fillOpacity = parseInt(e.target.value, 10);
    fillOpacityVal.textContent = `${styleState.fillOpacity}%`;
    renderAll();
  });

  strokeColorPicker.addEventListener('input', e => {
    styleState.stroke = e.target.value;
    strokeSwatchDisp.style.background = e.target.value;
    renderAll();
  });

  strokeNoneToggle.addEventListener('change', e => {
    styleState.strokeNone = e.target.checked;
    renderAll();
  });

  strokeWidthSlider.addEventListener('input', e => {
    styleState.strokeWidth = parseInt(e.target.value, 10);
    strokeWidthVal.textContent = `${styleState.strokeWidth}px`;
    renderAll();
  });

  strokeLinecapSelect.addEventListener('change', e => {
    styleState.strokeLinecap = e.target.value;
    renderAll();
  });

  strokeLinejoinSelect.addEventListener('change', e => {
    styleState.strokeLinejoin = e.target.value;
    renderAll();
  });

  // --- Code Export Tabs & Buttons ---
  tabSvgCode.addEventListener('click', () => {
    tabSvgCode.classList.add('active');
    tabPathD.classList.remove('active');
    currentOutputTab = 'svg';
    renderCodeExport();
  });

  tabPathD.addEventListener('click', () => {
    tabPathD.classList.add('active');
    tabSvgCode.classList.remove('active');
    currentOutputTab = 'd';
    renderCodeExport();
  });

  btnCopySvg.addEventListener('click', async () => {
    const dStr = buildPathDString();
    let fillAttr = styleState.fillNone ? 'none' : styleState.fill;
    let fillOpacityAttr = (styleState.fillNone || styleState.fillOpacity === 100)
      ? ''
      : ` fill-opacity="${(styleState.fillOpacity / 100).toFixed(2)}"`;
    let strokeAttr = styleState.strokeNone ? 'none' : styleState.stroke;
    let strokeWidthAttr = styleState.strokeNone ? '' : ` stroke-width="${styleState.strokeWidth}"`;
    let strokeLinecapAttr = styleState.strokeNone ? '' : ` stroke-linecap="${styleState.strokeLinecap}"`;
    let strokeLinejoinAttr = styleState.strokeNone ? '' : ` stroke-linejoin="${styleState.strokeLinejoin}"`;

    const fullSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 600" width="100%" height="100%">
  <path d="${dStr || 'M 0 0'}" fill="${fillAttr}"${fillOpacityAttr} stroke="${strokeAttr}"${strokeWidthAttr}${strokeLinecapAttr}${strokeLinejoinAttr} />
</svg>`;

    try {
      await navigator.clipboard.writeText(fullSvg);
      showToast('SVG code copied to clipboard!');
    } catch {
      showToast('SVG code copied!');
    }
  });

  btnCopyD.addEventListener('click', async () => {
    const dStr = buildPathDString();
    try {
      await navigator.clipboard.writeText(dStr);
      showToast('Path "d" string copied!');
    } catch {
      showToast('Path "d" copied!');
    }
  });

  btnDownloadSvg.addEventListener('click', () => {
    const dStr = buildPathDString();
    let fillAttr = styleState.fillNone ? 'none' : styleState.fill;
    let fillOpacityAttr = (styleState.fillNone || styleState.fillOpacity === 100)
      ? ''
      : ` fill-opacity="${(styleState.fillOpacity / 100).toFixed(2)}"`;
    let strokeAttr = styleState.strokeNone ? 'none' : styleState.stroke;
    let strokeWidthAttr = styleState.strokeNone ? '' : ` stroke-width="${styleState.strokeWidth}"`;
    let strokeLinecapAttr = styleState.strokeNone ? '' : ` stroke-linecap="${styleState.strokeLinecap}"`;
    let strokeLinejoinAttr = styleState.strokeNone ? '' : ` stroke-linejoin="${styleState.strokeLinejoin}"`;

    const fullSvg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 600" width="800" height="600">
  <path d="${dStr || 'M 0 0'}" fill="${fillAttr}"${fillOpacityAttr} stroke="${strokeAttr}"${strokeWidthAttr}${strokeLinecapAttr}${strokeLinejoinAttr} />
</svg>`;

    const blob = new Blob([fullSvg], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'vector-path.svg';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showToast('Downloaded vector-path.svg');
  });

  // --- SVG Path Parser (Import Feature) ---
  function parseSvgPath(pathString) {
    if (!pathString || typeof pathString !== 'string') return [];
    const commands = [];
    // Match SVG command letters and numbers
    const commandRegex = /([a-df-z])([^a-df-z]*)/gi;
    let match;
    let currX = 0;
    let currY = 0;

    while ((match = commandRegex.exec(pathString)) !== null) {
      const type = match[1];
      const isRelative = (type === type.toLowerCase());
      const upperType = type.toUpperCase();
      const params = match[2].trim().split(/[\s,]+/).filter(Boolean).map(Number);

      if (upperType === 'M') {
        for (let i = 0; i < params.length; i += 2) {
          const x = isRelative ? currX + params[i] : params[i];
          const y = isRelative ? currY + params[i + 1] : params[i + 1];
          commands.push({ type: (i === 0 ? 'M' : 'L'), x: Math.round(x), y: Math.round(y) });
          currX = x;
          currY = y;
        }
      } else if (upperType === 'L') {
        for (let i = 0; i < params.length; i += 2) {
          const x = isRelative ? currX + params[i] : params[i];
          const y = isRelative ? currY + params[i + 1] : params[i + 1];
          commands.push({ type: 'L', x: Math.round(x), y: Math.round(y) });
          currX = x;
          currY = y;
        }
      } else if (upperType === 'H') {
        for (let i = 0; i < params.length; i++) {
          const x = isRelative ? currX + params[i] : params[i];
          commands.push({ type: 'L', x: Math.round(x), y: Math.round(currY) });
          currX = x;
        }
      } else if (upperType === 'V') {
        for (let i = 0; i < params.length; i++) {
          const y = isRelative ? currY + params[i] : params[i];
          commands.push({ type: 'L', x: Math.round(currX), y: Math.round(y) });
          currY = y;
        }
      } else if (upperType === 'C') {
        for (let i = 0; i < params.length; i += 6) {
          const cp1x = isRelative ? currX + params[i] : params[i];
          const cp1y = isRelative ? currY + params[i + 1] : params[i + 1];
          const cp2x = isRelative ? currX + params[i + 2] : params[i + 2];
          const cp2y = isRelative ? currY + params[i + 3] : params[i + 3];
          const x = isRelative ? currX + params[i + 4] : params[i + 4];
          const y = isRelative ? currY + params[i + 5] : params[i + 5];
          commands.push({
            type: 'C',
            cp1x: Math.round(cp1x),
            cp1y: Math.round(cp1y),
            cp2x: Math.round(cp2x),
            cp2y: Math.round(cp2y),
            x: Math.round(x),
            y: Math.round(y)
          });
          currX = x;
          currY = y;
        }
      } else if (upperType === 'Q') {
        for (let i = 0; i < params.length; i += 4) {
          const cpx = isRelative ? currX + params[i] : params[i];
          const cpy = isRelative ? currY + params[i + 1] : params[i + 1];
          const x = isRelative ? currX + params[i + 2] : params[i + 2];
          const y = isRelative ? currY + params[i + 3] : params[i + 3];
          commands.push({
            type: 'Q',
            cpx: Math.round(cpx),
            cpy: Math.round(cpy),
            x: Math.round(x),
            y: Math.round(y)
          });
          currX = x;
          currY = y;
        }
      } else if (upperType === 'A') {
        for (let i = 0; i < params.length; i += 7) {
          const rx = params[i];
          const ry = params[i + 1];
          const xAxisRotation = params[i + 2];
          const largeArcFlag = params[i + 3];
          const sweepFlag = params[i + 4];
          const x = isRelative ? currX + params[i + 5] : params[i + 5];
          const y = isRelative ? currY + params[i + 6] : params[i + 6];
          commands.push({
            type: 'A',
            rx: Math.round(rx),
            ry: Math.round(ry),
            xAxisRotation,
            largeArcFlag,
            sweepFlag,
            x: Math.round(x),
            y: Math.round(y)
          });
          currX = x;
          currY = y;
        }
      } else if (upperType === 'Z') {
        commands.push({ type: 'Z' });
      }
    }
    return commands;
  }

  btnImportPath.addEventListener('click', () => {
    const rawInput = importPathInput.value.trim();
    if (!rawInput) {
      showToast('Please paste a valid path string.');
      return;
    }
    const parsed = parseSvgPath(rawInput);
    if (parsed.length > 0) {
      segments = parsed;
      selectedSegmentIndex = segments.length - 1;
      pushHistory();
      renderAll();
      showToast(`Imported ${parsed.length} path segments!`);
    } else {
      showToast('Could not parse path commands.');
    }
  });

  // --- Presets Library ---
  const PRESET_SHAPES = {
    wave: [
      { type: 'M', x: 80, y: 300 },
      { type: 'C', cp1x: 200, cp1y: 120, cp2x: 320, cp2y: 480, x: 440, y: 300 },
      { type: 'C', cp1x: 540, cp1y: 150, cp2x: 640, cp2y: 450, x: 720, y: 300 }
    ],
    heart: [
      { type: 'M', x: 400, y: 220 },
      { type: 'C', cp1x: 400, cp1y: 130, cp2x: 240, cp2y: 130, x: 240, y: 250 },
      { type: 'C', cp1x: 240, cp1y: 370, cp2x: 400, cp2y: 450, x: 400, y: 510 },
      { type: 'C', cp1x: 400, cp1y: 450, cp2x: 560, cp2y: 370, x: 560, y: 250 },
      { type: 'C', cp1x: 560, cp1y: 130, cp2x: 400, cp2y: 130, x: 400, y: 220 },
      { type: 'Z' }
    ],
    star: [
      { type: 'M', x: 400, y: 110 },
      { type: 'L', x: 445, y: 240 },
      { type: 'L', x: 580, y: 245 },
      { type: 'L', x: 475, y: 330 },
      { type: 'L', x: 515, y: 460 },
      { type: 'L', x: 400, y: 380 },
      { type: 'L', x: 285, y: 460 },
      { type: 'L', x: 325, y: 330 },
      { type: 'L', x: 220, y: 245 },
      { type: 'L', x: 355, y: 240 },
      { type: 'Z' }
    ],
    shield: [
      { type: 'M', x: 260, y: 160 },
      { type: 'L', x: 540, y: 160 },
      { type: 'Q', cpx: 540, cpy: 340, x: 400, y: 490 },
      { type: 'Q', cpx: 260, cpy: 340, x: 260, y: 160 },
      { type: 'Z' }
    ],
    infinity: [
      { type: 'M', x: 400, y: 300 },
      { type: 'C', cp1x: 320, cp1y: 200, cp2x: 220, cp2y: 200, x: 220, y: 300 },
      { type: 'C', cp1x: 220, cp1y: 400, cp2x: 320, cp2y: 400, x: 400, y: 300 },
      { type: 'C', cp1x: 480, cp1y: 200, cp2x: 580, cp2y: 200, x: 580, y: 300 },
      { type: 'C', cp1x: 580, cp1y: 400, cp2x: 480, cp2y: 400, x: 400, y: 300 },
      { type: 'Z' }
    ],
    capsule: [
      { type: 'M', x: 260, y: 240 },
      { type: 'L', x: 540, y: 240 },
      { type: 'A', rx: 60, ry: 60, xAxisRotation: 0, largeArcFlag: 0, sweepFlag: 1, x: 540, y: 360 },
      { type: 'L', x: 260, y: 360 },
      { type: 'A', rx: 60, ry: 60, xAxisRotation: 0, largeArcFlag: 0, sweepFlag: 1, x: 260, y: 240 },
      { type: 'Z' }
    ]
  };

  presetShapeSelect.addEventListener('change', e => {
    const shapeKey = e.target.value;
    if (PRESET_SHAPES[shapeKey]) {
      segments = JSON.parse(JSON.stringify(PRESET_SHAPES[shapeKey]));
      selectedSegmentIndex = segments.length - 1;
      pushHistory();
      renderAll();
      showToast(`Loaded ${e.target.options[e.target.selectedIndex].text}`);
    }
    presetShapeSelect.value = '';
  });

  // --- Initial Default Shape (Smooth Wave) ---
  segments = JSON.parse(JSON.stringify(PRESET_SHAPES.wave));
  selectedSegmentIndex = 1;
  pushHistory();
  renderAll();
});