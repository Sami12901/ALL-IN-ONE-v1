// CSS Sprite Sheet Generator Logic
document.addEventListener('DOMContentLoaded', () => {
  // Elements
  const dropZone = document.getElementById('drop-zone');
  const browseBtn = document.getElementById('browse-btn');
  const fileInput = document.getElementById('file-input');
  const btnLoadSamples = document.getElementById('btn-load-samples');

  const layoutModeSelect = document.getElementById('layout-mode');
  const spritePaddingSelect = document.getElementById('sprite-padding');
  const classPrefixInput = document.getElementById('class-prefix');
  const sheetUrlInput = document.getElementById('sheet-url');

  const spriteCount = document.getElementById('sprite-count');
  const btnClearAll = document.getElementById('btn-clear-all');
  const spriteList = document.getElementById('sprite-list');

  const canvasContainer = document.getElementById('canvas-container');
  const spriteCanvas = document.getElementById('sprite-canvas');
  const sheetDimensions = document.getElementById('sheet-dimensions');
  const activeSpriteCoords = document.getElementById('active-sprite-coords');
  const zoomBtns = document.querySelectorAll('.zoom-btn');

  const btnDownloadPng = document.getElementById('btn-download-png');
  const btnDownloadCss = document.getElementById('btn-download-css');
  const btnDownloadJson = document.getElementById('btn-download-json');
  const btnCopyCss = document.getElementById('btn-copy-css');
  const cssOutput = document.getElementById('css-output');

  const toast = document.getElementById('toast');
  const toastText = document.getElementById('toast-text');

  // State
  let sprites = []; // Array of { id, name, className, img, width, height, x, y }
  let currentZoom = 1;
  let hoveredSpriteId = null;
  let activeSpriteId = null;
  let toastTimer = null;

  // Show Toast
  function showToast(message) {
    if (toastTimer) clearTimeout(toastTimer);
    toastText.textContent = message;
    toast.classList.add('show');
    toastTimer = setTimeout(() => {
      toast.classList.remove('show');
    }, 2400);
  }

  // Copy helper
  async function copyToClipboard(text, label = 'Copied to clipboard!') {
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(text);
      } else {
        const ta = document.createElement('textarea');
        ta.value = text;
        ta.style.position = 'fixed';
        ta.style.opacity = '0';
        document.body.appendChild(ta);
        ta.select();
        document.execCommand('copy');
        document.body.removeChild(ta);
      }
      showToast(label);
    } catch (e) {
      console.error('Copy failed:', e);
      showToast('Failed to copy: ' + e.message);
    }
  }

  // Format clean CSS class name from file name
  function sanitizeClassName(name) {
    return name
      .replace(/\.[^/.]+$/, '') // remove extension
      .toLowerCase()
      .replace(/[^a-z0-9_-]/g, '-')
      .replace(/^-+|-+$/g, '') || 'sprite';
  }

  // --- 2D Bin Packing Algorithms ---
  function packSprites(items, mode, padding) {
    if (items.length === 0) {
      return { width: 0, height: 0 };
    }

    if (mode === 'horizontal') {
      let currentX = padding;
      let maxHeight = 0;

      items.forEach(item => {
        item.x = currentX;
        item.y = padding;
        currentX += item.width + padding;
        if (item.height > maxHeight) maxHeight = item.height;
      });

      return {
        width: currentX,
        height: maxHeight + padding * 2
      };
    }

    if (mode === 'vertical') {
      let currentY = padding;
      let maxWidth = 0;

      items.forEach(item => {
        item.x = padding;
        item.y = currentY;
        currentY += item.height + padding;
        if (item.width > maxWidth) maxWidth = item.width;
      });

      return {
        width: maxWidth + padding * 2,
        height: currentY
      };
    }

    // --- Compact 2D Shelf Bin Packing ---
    // Sort items by height descending to optimize packing efficiency
    const sorted = [...items].sort((a, b) => b.height - a.height || b.width - a.width);

    // Calculate initial target width based on square aspect ratio heuristic
    const totalArea = sorted.reduce((sum, item) => sum + (item.width + padding) * (item.height + padding), 0);
    const maxItemWidth = sorted.reduce((max, item) => Math.max(max, item.width), 0);
    let targetWidth = Math.max(maxItemWidth + padding * 2, Math.round(Math.sqrt(totalArea) * 1.15));
    // Align to nearest multiple of 16 or 32
    targetWidth = Math.max(128, Math.ceil(targetWidth / 16) * 16);

    function runShelfPack(wLimit) {
      let shelfX = padding;
      let shelfY = padding;
      let shelfHeight = 0;
      let sheetW = 0;
      let sheetH = 0;

      sorted.forEach(item => {
        if (shelfX + item.width + padding > wLimit && shelfX > padding) {
          // Advance to next shelf row
          shelfY += shelfHeight + padding;
          shelfX = padding;
          shelfHeight = 0;
        }

        item.x = shelfX;
        item.y = shelfY;
        shelfX += item.width + padding;
        if (item.height > shelfHeight) shelfHeight = item.height;

        sheetW = Math.max(sheetW, shelfX);
        sheetH = Math.max(sheetH, shelfY + shelfHeight + padding);
      });

      return { width: sheetW, height: sheetH };
    }

    // Try a few target widths to find most square/compact bounding box
    let bestLayout = runShelfPack(targetWidth);
    let bestScore = Math.abs(bestLayout.width - bestLayout.height) + (bestLayout.width * bestLayout.height * 0.05);

    const candidates = [targetWidth * 0.8, targetWidth * 1.2, targetWidth * 1.5];
    candidates.forEach(cand => {
      const w = Math.max(maxItemWidth + padding * 2, Math.round(cand));
      const res = runShelfPack(w);
      const score = Math.abs(res.width - res.height) + (res.width * res.height * 0.05);
      if (score < bestScore) {
        bestScore = score;
        bestLayout = res;
      }
    });

    // Re-run shelf pack with winning width to write x, y onto items
    return runShelfPack(bestLayout.width);
  }

  // --- Render Sprite Sheet on Canvas ---
  function renderSpriteSheet() {
    if (sprites.length === 0) {
      spriteCanvas.width = 0;
      spriteCanvas.height = 0;
      sheetDimensions.textContent = '0 \u00D7 0 px';
      cssOutput.value = '';
      activeSpriteCoords.textContent = 'Upload or load sample sprites to generate';
      return;
    }

    const mode = layoutModeSelect.value;
    const padding = parseInt(spritePaddingSelect.value, 10) || 0;

    // Pack sprites
    const sheetBounds = packSprites(sprites, mode, padding);

    spriteCanvas.width = sheetBounds.width;
    spriteCanvas.height = sheetBounds.height;
    sheetDimensions.textContent = `${sheetBounds.width} \u00D7 ${sheetBounds.height} px`;

    const ctx = spriteCanvas.getContext('2d');
    ctx.clearRect(0, 0, sheetBounds.width, sheetBounds.height);

    // Draw each sprite
    sprites.forEach(sprite => {
      ctx.drawImage(sprite.img, sprite.x, sprite.y, sprite.width, sprite.height);

      // If active or hovered, draw selection border
      if (sprite.id === activeSpriteId || sprite.id === hoveredSpriteId) {
        ctx.strokeStyle = '#4e85bf';
        ctx.lineWidth = 2;
        ctx.strokeRect(sprite.x - 1, sprite.y - 1, sprite.width + 2, sprite.height + 2);
      }
    });

    generateCSS();
  }

  // --- Generate CSS & Manifest ---
  function generateCSS() {
    const prefix = classPrefixInput.value.trim();
    const sheetUrl = sheetUrlInput.value.trim() || 'spritesheet.png';

    let css = `/* =========================================================\n`;
    css += `   Synthesized CSS Sprite Sheet Styles\n`;
    css += `   Total Sprites: ${sprites.length}\n`;
    css += `   Dimensions: ${spriteCanvas.width}px x ${spriteCanvas.height}px\n`;
    css += `   ========================================================= */\n\n`;

    // Common Base Class
    css += `/* Base Sprite Class */\n`;
    css += `.sprite {\n`;
    css += `  display: inline-block;\n`;
    css += `  background-image: url('${sheetUrl}');\n`;
    css += `  background-repeat: no-repeat;\n`;
    css += `  vertical-align: middle;\n`;
    css += `}\n\n`;

    // Individual Sprite Classes
    css += `/* Individual Sprite Coordinate Classes */\n`;
    sprites.forEach(s => {
      const posX = s.x === 0 ? '0' : `-${s.x}px`;
      const posY = s.y === 0 ? '0' : `-${s.y}px`;
      css += `.${prefix}${s.className} {\n`;
      css += `  width: ${s.width}px;\n`;
      css += `  height: ${s.height}px;\n`;
      css += `  background-position: ${posX} ${posY};\n`;
      css += `}\n\n`;
    });

    cssOutput.value = css;
  }

  // --- Render Sprite Management List ---
  function renderSpriteList() {
    spriteCount.textContent = sprites.length;

    if (sprites.length === 0) {
      spriteList.innerHTML = '<div style="text-align: center; color: var(--text-tertiary); font-size: 0.8rem; padding: 1.5rem 0;">No sprites uploaded yet</div>';
      return;
    }

    spriteList.innerHTML = '';

    sprites.forEach(sprite => {
      const card = document.createElement('div');
      card.className = `sprite-item-card ${sprite.id === activeSpriteId ? 'active-sprite' : ''}`;
      card.dataset.id = sprite.id;

      card.innerHTML = `
        <img src="${sprite.img.src}" class="sprite-thumb" alt="${sprite.name}">
        <div class="sprite-item-details">
          <input type="text" class="form-input sprite-name-input" value="${sprite.className}" style="padding: 0.2rem 0.4rem; font-size: 0.775rem; font-family: monospace; border: 1px solid var(--border); border-radius: var(--radius-sm); width: 100%;" title="Edit CSS class name">
          <div class="sprite-item-meta">${sprite.width} &times; ${sprite.height}px &bull; pos: (${sprite.x}, ${sprite.y})</div>
        </div>
        <button type="button" class="sprite-remove-btn" title="Remove sprite">
          <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
        </button>
      `;

      // Name input edit
      const input = card.querySelector('.sprite-name-input');
      input.addEventListener('change', () => {
        sprite.className = sanitizeClassName(input.value);
        generateCSS();
      });

      // Remove sprite
      card.querySelector('.sprite-remove-btn').addEventListener('click', (e) => {
        e.stopPropagation();
        sprites = sprites.filter(s => s.id !== sprite.id);
        renderSpriteList();
        renderSpriteSheet();
        showToast('Sprite removed');
      });

      // Hover / Click highlight
      card.addEventListener('mouseenter', () => {
        hoveredSpriteId = sprite.id;
        renderSpriteSheet();
      });

      card.addEventListener('mouseleave', () => {
        hoveredSpriteId = null;
        renderSpriteSheet();
      });

      card.addEventListener('click', () => {
        activeSpriteId = sprite.id;
        document.querySelectorAll('.sprite-item-card').forEach(c => c.classList.remove('active-sprite'));
        card.classList.add('active-sprite');
        activeSpriteCoords.textContent = `${sprite.name} \u2022 Pos: (${sprite.x}px, ${sprite.y}px) \u2022 Size: ${sprite.width}\u00D7${sprite.height}px`;
        renderSpriteSheet();
      });

      spriteList.appendChild(card);
    });
  }

  // --- Add Sprite Image Helper ---
  function addSpriteFromImage(img, filename) {
    const id = 'sprite_' + Math.random().toString(36).substring(2, 9);
    const className = sanitizeClassName(filename);

    sprites.push({
      id,
      name: filename,
      className,
      img,
      width: img.naturalWidth || img.width,
      height: img.naturalHeight || img.height,
      x: 0,
      y: 0
    });
  }

  // --- Handle Upload Files ---
  function handleFiles(fileList) {
    if (!fileList || fileList.length === 0) return;

    let loadedCount = 0;
    const totalFiles = fileList.length;

    Array.from(fileList).forEach(file => {
      if (!file.type.startsWith('image/')) {
        loadedCount++;
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          addSpriteFromImage(img, file.name);
          loadedCount++;
          if (loadedCount >= totalFiles) {
            renderSpriteSheet();
            renderSpriteList();
            showToast(`Loaded ${sprites.length} sprites!`);
          }
        };
        img.src = e.target.result;
      };
      reader.readAsDataURL(file);
    });
  }

  // --- Sample UI Icon Set (10 SVGs) ---
  function loadSampleIcons() {
    const iconsData = [
      { name: 'home', svg: '<svg viewBox="0 0 24 24" width="32" height="32" fill="none" stroke="#4e85bf" stroke-width="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>' },
      { name: 'user', svg: '<svg viewBox="0 0 24 24" width="32" height="32" fill="none" stroke="#10b981" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>' },
      { name: 'settings', svg: '<svg viewBox="0 0 24 24" width="32" height="32" fill="none" stroke="#f59e0b" stroke-width="2"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg>' },
      { name: 'search', svg: '<svg viewBox="0 0 24 24" width="32" height="32" fill="none" stroke="#ec4899" stroke-width="2"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>' },
      { name: 'bell', svg: '<svg viewBox="0 0 24 24" width="32" height="32" fill="none" stroke="#8b5cf6" stroke-width="2"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path><path d="M13.73 21a2 2 0 0 1-3.46 0"></path></svg>' },
      { name: 'heart', svg: '<svg viewBox="0 0 24 24" width="32" height="32" fill="none" stroke="#ef4444" stroke-width="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg>' },
      { name: 'star', svg: '<svg viewBox="0 0 24 24" width="32" height="32" fill="none" stroke="#eab308" stroke-width="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>' },
      { name: 'cart', svg: '<svg viewBox="0 0 24 24" width="32" height="32" fill="none" stroke="#06b6d4" stroke-width="2"><circle cx="9" cy="21" r="1"></circle><circle cx="20" cy="21" r="1"></circle><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path></svg>' },
      { name: 'camera', svg: '<svg viewBox="0 0 24 24" width="32" height="32" fill="none" stroke="#14b8a6" stroke-width="2"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"></path><circle cx="12" cy="13" r="4"></circle></svg>' },
      { name: 'check', svg: '<svg viewBox="0 0 24 24" width="32" height="32" fill="none" stroke="#22c55e" stroke-width="2"><polyline points="20 6 9 17 4 12"></polyline></svg>' }
    ];

    sprites = [];
    let loaded = 0;

    iconsData.forEach(item => {
      const blob = new Blob([item.svg], { type: 'image/svg+xml;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const img = new Image();
      img.onload = () => {
        addSpriteFromImage(img, `${item.name}.svg`);
        loaded++;
        if (loaded >= iconsData.length) {
          renderSpriteSheet();
          renderSpriteList();
          showToast('Sample icons loaded and synthesized!');
        }
      };
      img.src = url;
    });
  }

  // --- Interactive Canvas Mouse Events ---
  spriteCanvas.addEventListener('mousemove', (e) => {
    if (sprites.length === 0) return;

    const rect = spriteCanvas.getBoundingClientRect();
    const scaleX = spriteCanvas.width / rect.width;
    const scaleY = spriteCanvas.height / rect.height;

    const mouseX = (e.clientX - rect.left) * scaleX;
    const mouseY = (e.clientY - rect.top) * scaleY;

    // Check hit test
    const hit = sprites.find(s => 
      mouseX >= s.x && mouseX <= s.x + s.width &&
      mouseY >= s.y && mouseY <= s.y + s.height
    );

    if (hit) {
      if (hoveredSpriteId !== hit.id) {
        hoveredSpriteId = hit.id;
        activeSpriteCoords.textContent = `${hit.name} \u2022 Pos: (${hit.x}px, ${hit.y}px) \u2022 Size: ${hit.width}\u00D7${hit.height}px`;
        renderSpriteSheet();
      }
    } else {
      if (hoveredSpriteId !== null) {
        hoveredSpriteId = null;
        renderSpriteSheet();
      }
    }
  });

  spriteCanvas.addEventListener('mouseleave', () => {
    if (hoveredSpriteId !== null) {
      hoveredSpriteId = null;
      renderSpriteSheet();
    }
  });

  spriteCanvas.addEventListener('click', (e) => {
    if (sprites.length === 0) return;

    const rect = spriteCanvas.getBoundingClientRect();
    const scaleX = spriteCanvas.width / rect.width;
    const scaleY = spriteCanvas.height / rect.height;

    const mouseX = (e.clientX - rect.left) * scaleX;
    const mouseY = (e.clientY - rect.top) * scaleY;

    const hit = sprites.find(s => 
      mouseX >= s.x && mouseX <= s.x + s.width &&
      mouseY >= s.y && mouseY <= s.y + s.height
    );

    if (hit) {
      activeSpriteId = hit.id;
      renderSpriteList();
      renderSpriteSheet();
      const card = document.querySelector(`.sprite-item-card[data-id="${hit.id}"]`);
      if (card) {
        card.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
      activeSpriteCoords.textContent = `Selected: ${hit.name} \u2022 Pos: (${hit.x}px, ${hit.y}px)`;
    }
  });

  // --- Zoom Controls ---
  zoomBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      zoomBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentZoom = parseFloat(btn.dataset.zoom) || 1;
      spriteCanvas.style.transform = `scale(${currentZoom})`;
    });
  });

  // --- Export Actions ---

  // 1. Download PNG
  btnDownloadPng.addEventListener('click', () => {
    if (sprites.length === 0) return;
    spriteCanvas.toBlob(blob => {
      const link = document.createElement('a');
      link.download = 'spritesheet.png';
      link.href = URL.createObjectURL(blob);
      link.click();
      showToast('Downloaded Sprite Sheet PNG!');
    }, 'image/png');
  });

  // 2. Download CSS Stylesheet
  btnDownloadCss.addEventListener('click', () => {
    if (sprites.length === 0) return;
    const blob = new Blob([cssOutput.value], { type: 'text/css;charset=utf-8' });
    const link = document.createElement('a');
    link.download = 'spritesheet.css';
    link.href = URL.createObjectURL(blob);
    link.click();
    showToast('Downloaded CSS Stylesheet!');
  });

  // 3. Download JSON Manifest
  btnDownloadJson.addEventListener('click', () => {
    if (sprites.length === 0) return;
    const prefix = classPrefixInput.value.trim();
    const manifest = {
      sheetWidth: spriteCanvas.width,
      sheetHeight: spriteCanvas.height,
      sprites: sprites.map(s => ({
        name: s.name,
        className: `${prefix}${s.className}`,
        x: s.x,
        y: s.y,
        width: s.width,
        height: s.height
      }))
    };
    const blob = new Blob([JSON.stringify(manifest, null, 2)], { type: 'application/json' });
    const link = document.createElement('a');
    link.download = 'spritesheet.json';
    link.href = URL.createObjectURL(blob);
    link.click();
    showToast('Downloaded JSON Manifest!');
  });

  // 4. Copy CSS
  btnCopyCss.addEventListener('click', () => {
    if (!cssOutput.value) return;
    copyToClipboard(cssOutput.value, 'CSS Stylesheet copied to clipboard!');
  });

  // --- Event Listeners ---
  browseBtn.addEventListener('click', () => fileInput.click());
  fileInput.addEventListener('change', (e) => {
    handleFiles(e.target.files);
  });

  btnLoadSamples.addEventListener('click', loadSampleIcons);

  btnClearAll.addEventListener('click', () => {
    sprites = [];
    activeSpriteId = null;
    hoveredSpriteId = null;
    renderSpriteList();
    renderSpriteSheet();
    showToast('All sprites cleared');
  });

  // Drag & drop
  dropZone.addEventListener('dragover', (e) => {
    e.preventDefault();
    dropZone.classList.add('dragover');
  });

  dropZone.addEventListener('dragleave', () => {
    dropZone.classList.remove('dragover');
  });

  dropZone.addEventListener('drop', (e) => {
    e.preventDefault();
    dropZone.classList.remove('dragover');
    if (e.dataTransfer.files) {
      handleFiles(e.dataTransfer.files);
    }
  });

  // Layout Controls Change
  layoutModeSelect.addEventListener('change', () => {
    renderSpriteSheet();
    renderSpriteList();
  });

  spritePaddingSelect.addEventListener('change', () => {
    renderSpriteSheet();
    renderSpriteList();
  });

  classPrefixInput.addEventListener('input', generateCSS);
  sheetUrlInput.addEventListener('input', generateCSS);

  // Load sample icons by default to show rich interface immediately!
  loadSampleIcons();
});