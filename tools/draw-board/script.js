// Sketchpad Draw Board Studio Logic
document.addEventListener('DOMContentLoaded', () => {
  const canvas = document.getElementById('draw-canvas');
  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  const container = document.getElementById('canvas-container');
  const brushCursor = document.getElementById('brush-cursor');

  // Tool buttons
  const toolPen = document.getElementById('tool-pen');
  const toolHighlighter = document.getElementById('tool-highlighter');
  const toolEraser = document.getElementById('tool-eraser');

  // Palette & controls
  const swatchList = document.getElementById('swatch-list');
  const customColorPicker = document.getElementById('custom-color-picker');
  const brushSizeSlider = document.getElementById('brush-size-slider');
  const brushSizeVal = document.getElementById('brush-size-val');
  const canvasBgSelect = document.getElementById('canvas-bg-select');

  // Action buttons
  const btnUndo = document.getElementById('btn-undo');
  const btnRedo = document.getElementById('btn-redo');
  const btnClear = document.getElementById('btn-clear');
  const btnDownload = document.getElementById('btn-download');
  const statusResolution = document.getElementById('status-resolution');

  // State
  let currentTool = 'pen'; // 'pen', 'highlighter', 'eraser'
  let currentColor = '#ffffff';
  let brushSize = 4;
  let isDrawing = false;
  let lastX = 0;
  let lastY = 0;
  let points = [];

  // Undo/Redo Stacks
  const MAX_HISTORY = 30;
  let undoStack = [];
  let redoStack = [];

  // Helpers: Color conversion
  function hexToRgba(hex, alpha) {
    let cleanHex = hex.replace('#', '');
    if (cleanHex.length === 3) {
      cleanHex = cleanHex.split('').map(c => c + c).join('');
    }
    const r = parseInt(cleanHex.substring(0, 2), 16) || 0;
    const g = parseInt(cleanHex.substring(2, 4), 16) || 0;
    const b = parseInt(cleanHex.substring(4, 6), 16) || 0;
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  }

  // Setup Canvas Resolution (Retina / High-DPI support)
  let dpr = window.devicePixelRatio || 1;
  let logicalWidth = 0;
  let logicalHeight = 0;

  function resizeCanvas() {
    const rect = container.getBoundingClientRect();
    logicalWidth = Math.floor(rect.width);
    logicalHeight = Math.floor(rect.height);

    if (logicalWidth === 0 || logicalHeight === 0) return;

    // Cache current drawing before resizing
    let tempCanvas = null;
    if (canvas.width > 0 && canvas.height > 0) {
      tempCanvas = document.createElement('canvas');
      tempCanvas.width = canvas.width;
      tempCanvas.height = canvas.height;
      const tempCtx = tempCanvas.getContext('2d');
      tempCtx.drawImage(canvas, 0, 0);
    }

    dpr = window.devicePixelRatio || 1;
    canvas.width = logicalWidth * dpr;
    canvas.height = logicalHeight * dpr;
    canvas.style.width = `${logicalWidth}px`;
    canvas.style.height = `${logicalHeight}px`;

    ctx.scale(dpr, dpr);

    if (tempCanvas) {
      ctx.drawImage(tempCanvas, 0, 0, logicalWidth, logicalHeight);
    }

    statusResolution.textContent = `${logicalWidth} &times; ${logicalHeight} px (${dpr}x Retina)`;
  }

  // Save current canvas state to history
  function saveSnapshot() {
    try {
      const snapshot = ctx.getImageData(0, 0, canvas.width, canvas.height);
      undoStack.push(snapshot);
      if (undoStack.length > MAX_HISTORY) {
        undoStack.shift();
      }
      redoStack = []; // clear redo on new action
      updateHistoryButtons();
    } catch {
      // In case of any cross-origin taint or memory issue
    }
  }

  function updateHistoryButtons() {
    btnUndo.disabled = undoStack.length <= 1;
    btnRedo.disabled = redoStack.length === 0;
  }

  function undo() {
    if (undoStack.length <= 1) return;
    const current = undoStack.pop();
    redoStack.push(current);
    const prev = undoStack[undoStack.length - 1];
    ctx.putImageData(prev, 0, 0);
    updateHistoryButtons();
  }

  function redo() {
    if (redoStack.length === 0) return;
    const next = redoStack.pop();
    undoStack.push(next);
    ctx.putImageData(next, 0, 0);
    updateHistoryButtons();
  }

  // Configure Tool Style
  function setupToolContext() {
    if (currentTool === 'pen') {
      ctx.globalCompositeOperation = 'source-over';
      ctx.strokeStyle = currentColor;
      ctx.lineWidth = brushSize;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
    } else if (currentTool === 'highlighter') {
      ctx.globalCompositeOperation = 'source-over';
      ctx.strokeStyle = hexToRgba(currentColor, 0.35);
      ctx.lineWidth = brushSize * 2.8;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
    } else if (currentTool === 'eraser') {
      ctx.globalCompositeOperation = 'destination-out';
      ctx.lineWidth = brushSize * 2.5;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
    }
  }

  // Pointer position relative to canvas logical size
  function getPointerPos(e) {
    const rect = canvas.getBoundingClientRect();
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    };
  }

  // Start Drawing
  function startDrawing(e) {
    if (e.button !== undefined && e.button !== 0) return; // Only left click
    isDrawing = true;
    const pos = getPointerPos(e);
    lastX = pos.x;
    lastY = pos.y;
    points = [pos];

    setupToolContext();

    ctx.beginPath();
    ctx.moveTo(lastX, lastY);
    // Draw a dot on simple click
    ctx.lineTo(lastX + 0.1, lastY + 0.1);
    ctx.stroke();
  }

  // Draw Stroke with smooth curve interpolation
  function draw(e) {
    if (!isDrawing) return;
    const pos = getPointerPos(e);
    points.push(pos);

    setupToolContext();

    if (points.length >= 3) {
      const p0 = points[points.length - 3];
      const p1 = points[points.length - 2];
      const p2 = points[points.length - 1];

      const mid1X = (p0.x + p1.x) / 2;
      const mid1Y = (p0.y + p1.y) / 2;
      const mid2X = (p1.x + p2.x) / 2;
      const mid2Y = (p1.y + p2.y) / 2;

      ctx.beginPath();
      ctx.moveTo(mid1X, mid1Y);
      ctx.quadraticCurveTo(p1.x, p1.y, mid2X, mid2Y);
      ctx.stroke();
    } else {
      ctx.beginPath();
      ctx.moveTo(lastX, lastY);
      ctx.lineTo(pos.x, pos.y);
      ctx.stroke();
    }

    lastX = pos.x;
    lastY = pos.y;
  }

  // Stop Drawing
  function stopDrawing() {
    if (!isDrawing) return;
    isDrawing = false;
    points = [];
    saveSnapshot();
  }

  // Canvas Event Listeners
  canvas.addEventListener('pointerdown', (e) => {
    canvas.setPointerCapture(e.pointerId);
    startDrawing(e);
  });
  canvas.addEventListener('pointermove', (e) => {
    draw(e);
    updateCursor(e);
  });
  canvas.addEventListener('pointerup', (e) => {
    try { canvas.releasePointerCapture(e.pointerId); } catch {}
    stopDrawing();
  });
  canvas.addEventListener('pointercancel', stopDrawing);
  canvas.addEventListener('pointerleave', () => {
    brushCursor.style.display = 'none';
    if (isDrawing) stopDrawing();
  });

  // Brush Cursor follower
  function updateCursor(e) {
    const rect = container.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    let diameter = brushSize;
    if (currentTool === 'highlighter') diameter = brushSize * 2.8;
    if (currentTool === 'eraser') diameter = brushSize * 2.5;

    brushCursor.style.width = `${Math.max(6, diameter)}px`;
    brushCursor.style.height = `${Math.max(6, diameter)}px`;
    brushCursor.style.left = `${x}px`;
    brushCursor.style.top = `${y}px`;
    brushCursor.style.display = 'block';

    if (currentTool === 'eraser') {
      brushCursor.style.borderColor = '#ef4444';
      brushCursor.style.backgroundColor = 'rgba(239, 68, 68, 0.15)';
    } else {
      brushCursor.style.borderColor = '#ffffff';
      brushCursor.style.backgroundColor = 'transparent';
    }
  }

  // Tool Switching
  function setTool(toolName) {
    currentTool = toolName;
    [toolPen, toolHighlighter, toolEraser].forEach(b => b.classList.remove('active'));
    if (toolName === 'pen') toolPen.classList.add('active');
    if (toolName === 'highlighter') toolHighlighter.classList.add('active');
    if (toolName === 'eraser') toolEraser.classList.add('active');
  }

  toolPen.addEventListener('click', () => setTool('pen'));
  toolHighlighter.addEventListener('click', () => setTool('highlighter'));
  toolEraser.addEventListener('click', () => setTool('eraser'));

  // Swatch color selection
  swatchList.addEventListener('click', (e) => {
    const dot = e.target.closest('.color-dot');
    if (!dot) return;
    swatchList.querySelectorAll('.color-dot').forEach(d => d.classList.remove('active'));
    dot.classList.add('active');
    currentColor = dot.dataset.color;
    customColorPicker.value = currentColor;
    if (currentTool === 'eraser') setTool('pen');
  });

  customColorPicker.addEventListener('input', () => {
    currentColor = customColorPicker.value;
    swatchList.querySelectorAll('.color-dot').forEach(d => d.classList.remove('active'));
    if (currentTool === 'eraser') setTool('pen');
  });

  // Brush size slider
  brushSizeSlider.addEventListener('input', () => {
    brushSize = parseInt(brushSizeSlider.value, 10);
    brushSizeVal.textContent = `${brushSize}px`;
  });

  // Background Theme Switcher
  canvasBgSelect.addEventListener('change', () => {
    const mode = canvasBgSelect.value;
    if (mode === 'dark') {
      container.style.backgroundColor = '#12151c';
      container.style.backgroundImage = 'none';
    } else if (mode === 'white') {
      container.style.backgroundColor = '#ffffff';
      container.style.backgroundImage = 'none';
      if (currentColor === '#ffffff') {
        const darkDot = swatchList.querySelector('[data-color="#1e293b"]');
        if (darkDot) darkDot.click();
      }
    } else if (mode === 'grid') {
      container.style.backgroundColor = '#0b1329';
      container.style.backgroundImage = 'radial-gradient(rgba(255, 255, 255, 0.2) 1px, transparent 1px)';
      container.style.backgroundSize = '24px 24px';
    } else if (mode === 'transparent') {
      container.style.backgroundColor = 'transparent';
      container.style.backgroundImage = 'linear-gradient(45deg, #1c1f26 25%, transparent 25%), linear-gradient(-45deg, #1c1f26 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #1c1f26 75%), linear-gradient(-45deg, transparent 75%, #1c1f26 75%)';
      container.style.backgroundSize = '20px 20px';
      container.style.backgroundPosition = '0 0, 0 10px, 10px -10px, -10px 0px';
    }
  });

  // History buttons
  btnUndo.addEventListener('click', undo);
  btnRedo.addEventListener('click', redo);

  // Clear canvas
  btnClear.addEventListener('click', () => {
    if (confirm('Are you sure you want to clear the canvas?')) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      saveSnapshot();
    }
  });

  // Download PNG Artwork
  btnDownload.addEventListener('click', () => {
    const mode = canvasBgSelect.value;
    const exportCanvas = document.createElement('canvas');
    exportCanvas.width = canvas.width;
    exportCanvas.height = canvas.height;
    const expCtx = exportCanvas.getContext('2d');

    // Fill background unless transparent
    if (mode === 'dark') {
      expCtx.fillStyle = '#12151c';
      expCtx.fillRect(0, 0, exportCanvas.width, exportCanvas.height);
    } else if (mode === 'white') {
      expCtx.fillStyle = '#ffffff';
      expCtx.fillRect(0, 0, exportCanvas.width, exportCanvas.height);
    } else if (mode === 'grid') {
      expCtx.fillStyle = '#0b1329';
      expCtx.fillRect(0, 0, exportCanvas.width, exportCanvas.height);
      // Grid dots
      expCtx.fillStyle = 'rgba(255, 255, 255, 0.2)';
      const step = 24 * dpr;
      for (let x = 0; x < exportCanvas.width; x += step) {
        for (let y = 0; y < exportCanvas.height; y += step) {
          expCtx.fillRect(x, y, 2 * dpr, 2 * dpr);
        }
      }
    }

    // Draw drawing layer
    expCtx.drawImage(canvas, 0, 0);

    // Trigger download
    const link = document.createElement('a');
    link.download = `sketchpad-drawing-${Date.now()}.png`;
    link.href = exportCanvas.toDataURL('image/png');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  });

  // Keyboard Shortcuts
  window.addEventListener('keydown', (e) => {
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'SELECT' || e.target.tagName === 'TEXTAREA') return;

    if ((e.ctrlKey || e.metaKey) && (e.key === 'z' || e.key === 'Z')) {
      e.preventDefault();
      if (e.shiftKey) {
        redo();
      } else {
        undo();
      }
    } else if ((e.ctrlKey || e.metaKey) && (e.key === 'y' || e.key === 'Y')) {
      e.preventDefault();
      redo();
    } else if (e.key === 'p' || e.key === 'P') {
      setTool('pen');
    } else if (e.key === 'h' || e.key === 'H') {
      setTool('highlighter');
    } else if (e.key === 'e' || e.key === 'E') {
      setTool('eraser');
    }
  });

  // Handle window resizing cleanly
  let resizeTimer;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      resizeCanvas();
    }, 200);
  });

  // Initialize
  resizeCanvas();
  // Save initial blank canvas state to undo stack
  saveSnapshot();
});