// CSS Grid Generator Interactive Logic
document.addEventListener('DOMContentLoaded', () => {
  // DOM Elements
  const colsSlider = document.getElementById('cols-slider');
  const colsVal = document.getElementById('cols-val');
  const rowsSlider = document.getElementById('rows-slider');
  const rowsVal = document.getElementById('rows-val');
  const colGapInput = document.getElementById('col-gap-input');
  const colGapUnit = document.getElementById('col-gap-unit');
  const rowGapInput = document.getElementById('row-gap-input');
  const rowGapUnit = document.getElementById('row-gap-unit');

  const areaNameInput = document.getElementById('area-name-input');
  const areaColorPicker = document.getElementById('area-color');
  const assignAreaBtn = document.getElementById('assign-area-btn');
  const clearSelectionBtn = document.getElementById('clear-selection-btn');
  const selectionStatus = document.getElementById('selection-status');
  const areasList = document.getElementById('areas-list');
  const areasCount = document.getElementById('areas-count');
  const clearAllAreasBtn = document.getElementById('clear-all-areas-btn');

  const tabEditor = document.getElementById('tab-editor');
  const tabPreview = document.getElementById('tab-preview');
  const gridVisualBoard = document.getElementById('grid-visual-board');
  const gridLivePreview = document.getElementById('grid-live-preview');

  const cssOutput = document.getElementById('css-output');
  const htmlOutput = document.getElementById('html-output');
  const copyCssBtn = document.getElementById('copy-css-btn');
  const copyHtmlBtn = document.getElementById('copy-html-btn');

  const presetChips = document.querySelectorAll('.preset-chip');

  // Palette of nice accent colors for areas
  const colorPalette = [
    '#4e85bf', '#10b981', '#f59e0b', '#ec4899', 
    '#8b5cf6', '#06b6d4', '#e11d48', '#3b82f6',
    '#14b8a6', '#f97316', '#6366f1', '#84cc16'
  ];
  let colorIndex = 0;

  // Grid State
  let state = {
    cols: 4,
    rows: 4,
    colGap: 12,
    colGapUnit: 'px',
    rowGap: 12,
    rowGapUnit: 'px',
    // 2D Array [row][col] storing area name or '.'
    cellMatrix: [],
    // Map of areaName -> { color: '#...', minR, maxR, minC, maxC }
    areas: new Map(),
    // Current selection coordinates: { r1, c1, r2, c2 } (inclusive 0-based)
    selection: null,
    isMouseDown: false,
    dragStart: null,
    activeTab: 'editor' // 'editor' | 'preview'
  };

  // Helper: sanitize CSS identifier
  function sanitizeAreaName(name) {
    let clean = name.trim().toLowerCase().replace(/[^a-z0-9_-]/g, '-');
    if (/^[0-9]/.test(clean)) clean = 'area-' + clean;
    return clean || 'area';
  }

  // Initialize Matrix
  function initMatrix(rows, cols) {
    const matrix = [];
    for (let r = 0; r < rows; r++) {
      const row = [];
      for (let c = 0; c < cols; c++) {
        row.push('.');
      }
      matrix.push(row);
    }
    return matrix;
  }

  // Set default initial layout: Header, Sidebar, Main, Footer
  function setInitialLayout() {
    state.cols = 4;
    state.rows = 4;
    colsSlider.value = '4';
    colsVal.textContent = '4';
    rowsSlider.value = '4';
    rowsVal.textContent = '4';

    state.cellMatrix = initMatrix(4, 4);
    state.areas.clear();

    // header
    addAreaDirect('header', '#4e85bf', 0, 0, 0, 3);
    // sidebar
    addAreaDirect('sidebar', '#10b981', 1, 2, 0, 0);
    // main
    addAreaDirect('main', '#8b5cf6', 1, 2, 1, 3);
    // footer
    addAreaDirect('footer', '#f59e0b', 3, 3, 0, 3);

    colorIndex = 4;
  }

  function addAreaDirect(name, color, minR, maxR, minC, maxC) {
    // Fill matrix
    for (let r = minR; r <= maxR; r++) {
      for (let c = minC; c <= maxC; c++) {
        state.cellMatrix[r][c] = name;
      }
    }
    state.areas.set(name, {
      name,
      color,
      minR,
      maxR,
      minC,
      maxC
    });
  }

  // Render Grid Editor Board
  function renderEditorBoard() {
    gridVisualBoard.innerHTML = '';
    gridVisualBoard.style.gridTemplateColumns = `repeat(${state.cols}, 1fr)`;
    gridVisualBoard.style.gridTemplateRows = `repeat(${state.rows}, 1fr)`;
    gridVisualBoard.style.columnGap = `${state.colGap}${state.colGapUnit}`;
    gridVisualBoard.style.rowGap = `${state.rowGap}${state.rowGapUnit}`;

    for (let r = 0; r < state.rows; r++) {
      for (let c = 0; c < state.cols; c++) {
        const cell = document.createElement('div');
        cell.className = 'grid-cell';
        cell.dataset.row = r;
        cell.dataset.col = c;

        // Check if selected
        if (state.selection && isCellSelected(r, c)) {
          cell.classList.add('selected');
        }

        // Check if assigned area
        const areaName = state.cellMatrix[r] ? state.cellMatrix[r][c] : '.';
        if (areaName && areaName !== '.' && state.areas.has(areaName)) {
          const area = state.areas.get(areaName);
          cell.classList.add('has-area');
          cell.style.backgroundColor = hexToRgba(area.color, 0.22);
          cell.style.borderColor = area.color;
          cell.style.color = area.color;

          const label = document.createElement('span');
          label.className = 'grid-cell-label';
          label.textContent = area.name;
          cell.appendChild(label);
        } else {
          cell.textContent = `${r + 1},${c + 1}`;
        }

        // Event Listeners for dragging/selection
        cell.addEventListener('mousedown', (e) => onCellMouseDown(e, r, c));
        cell.addEventListener('mouseenter', () => onCellMouseEnter(r, c));

        gridVisualBoard.appendChild(cell);
      }
    }
  }

  // Render Live Preview Stage
  function renderLivePreview() {
    gridLivePreview.innerHTML = '';
    gridLivePreview.style.gridTemplateColumns = `repeat(${state.cols}, 1fr)`;
    gridLivePreview.style.gridTemplateRows = `repeat(${state.rows}, 1fr)`;
    gridLivePreview.style.columnGap = `${state.colGap}${state.colGapUnit}`;
    gridLivePreview.style.rowGap = `${state.rowGap}${state.rowGapUnit}`;

    // Compute template areas string for CSS
    const areasTemplate = getTemplateAreasString();
    gridLivePreview.style.gridTemplateAreas = areasTemplate;

    // Render defined area blocks
    state.areas.forEach((area) => {
      const block = document.createElement('div');
      block.className = 'preview-area-block';
      block.style.gridArea = area.name;
      block.style.backgroundColor = hexToRgba(area.color, 0.25);
      block.style.borderColor = area.color;
      block.style.color = 'var(--text-primary)';

      const title = document.createElement('span');
      title.textContent = area.name;
      block.appendChild(title);

      const sub = document.createElement('span');
      sub.className = 'preview-area-desc';
      sub.textContent = `${area.maxR - area.minR + 1}×${area.maxC - area.minC + 1} (${area.name})`;
      block.appendChild(sub);

      gridLivePreview.appendChild(block);
    });
  }

  // Update Defined Areas Sidebar List
  function renderAreasList() {
    areasList.innerHTML = '';
    areasCount.textContent = `${state.areas.size} ${state.areas.size === 1 ? 'area' : 'areas'}`;

    if (state.areas.size === 0) {
      areasList.innerHTML = `
        <div style="font-size: 0.8rem; color: var(--text-tertiary); text-align: center; padding: 1rem;">
          No grid areas defined yet
        </div>
      `;
      return;
    }

    state.areas.forEach((area, name) => {
      const item = document.createElement('div');
      item.className = 'area-item';

      const info = document.createElement('div');
      info.className = 'area-item-info';

      const swatch = document.createElement('div');
      swatch.className = 'area-swatch';
      swatch.style.backgroundColor = area.color;
      info.appendChild(swatch);

      const text = document.createElement('span');
      text.style.fontWeight = '600';
      text.textContent = name;
      info.appendChild(text);

      const spanMeta = document.createElement('span');
      spanMeta.style.fontSize = '0.725rem';
      spanMeta.style.color = 'var(--text-tertiary)';
      spanMeta.textContent = `[${area.minR + 1}:${area.maxR + 1}, ${area.minC + 1}:${area.maxC + 1}]`;
      info.appendChild(spanMeta);

      item.appendChild(info);

      const delBtn = document.createElement('button');
      delBtn.className = 'area-del-btn';
      delBtn.innerHTML = '&times;';
      delBtn.title = 'Remove Area';
      delBtn.addEventListener('click', () => {
        deleteArea(name);
      });
      item.appendChild(delBtn);

      areasList.appendChild(item);
    });
  }

  // Compute CSS grid-template-areas value
  function getTemplateAreasString() {
    const rowsArr = [];
    for (let r = 0; r < state.rows; r++) {
      const rowTokens = [];
      for (let c = 0; c < state.cols; c++) {
        const val = (state.cellMatrix[r] && state.cellMatrix[r][c]) || '.';
        rowTokens.push(val);
      }
      rowsArr.push(`"${rowTokens.join(' ')}"`);
    }
    return rowsArr.join('\n    ');
  }

  // Generate CSS Output
  function updateCodeOutputs() {
    const colTracks = `repeat(${state.cols}, 1fr)`;
    const rowTracks = `repeat(${state.rows}, 1fr)`;
    const areasStr = getTemplateAreasString();
    const colGapStr = `${state.colGap}${state.colGapUnit}`;
    const rowGapStr = `${state.rowGap}${state.rowGapUnit}`;

    let css = `.grid-container {\n`;
    css += `  display: grid;\n`;
    css += `  grid-template-columns: ${colTracks};\n`;
    css += `  grid-template-rows: ${rowTracks};\n`;
    if (colGapStr === rowGapStr) {
      css += `  gap: ${colGapStr};\n`;
    } else {
      css += `  column-gap: ${colGapStr};\n`;
      css += `  row-gap: ${rowGapStr};\n`;
    }
    css += `  grid-template-areas:\n    ${areasStr};\n`;
    css += `}\n\n`;

    // Item rules
    state.areas.forEach((area, name) => {
      css += `.${name} {\n  grid-area: ${name};\n}\n`;
    });

    cssOutput.textContent = css;

    // Generate HTML Markup
    let html = `<div class="grid-container">\n`;
    if (state.areas.size > 0) {
      state.areas.forEach((area, name) => {
        html += `  <div class="${name}">${name}</div>\n`;
      });
    } else {
      const totalCells = state.rows * state.cols;
      for (let i = 1; i <= Math.min(totalCells, 6); i++) {
        html += `  <div class="item-${i}">Item ${i}</div>\n`;
      }
    }
    html += `</div>`;

    htmlOutput.textContent = html;
  }

  // Hex to RGBA helper
  function hexToRgba(hex, alpha) {
    let c = hex.replace('#', '');
    if (c.length === 3) {
      c = c.split('').map(x => x + x).join('');
    }
    const num = parseInt(c, 16);
    const r = (num >> 16) & 255;
    const g = (num >> 8) & 255;
    const b = num & 255;
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  }

  // Selection Check
  function isCellSelected(r, c) {
    if (!state.selection) return false;
    const minR = Math.min(state.selection.r1, state.selection.r2);
    const maxR = Math.max(state.selection.r1, state.selection.r2);
    const minC = Math.min(state.selection.c1, state.selection.c2);
    const maxC = Math.max(state.selection.c1, state.selection.c2);
    return r >= minR && r <= maxR && c >= minC && c <= maxC;
  }

  // Mouse Handlers for Interactive Selection
  function onCellMouseDown(e, r, c) {
    state.isMouseDown = true;
    state.dragStart = { r, c };
    state.selection = { r1: r, c1: c, r2: r, c2: c };
    updateSelectionStatus();
    renderEditorBoard();
  }

  function onCellMouseEnter(r, c) {
    if (!state.isMouseDown || !state.dragStart) return;
    state.selection = {
      r1: state.dragStart.r,
      c1: state.dragStart.c,
      r2: r,
      c2: c
    };
    updateSelectionStatus();
    renderEditorBoard();
  }

  window.addEventListener('mouseup', () => {
    if (state.isMouseDown) {
      state.isMouseDown = false;
      state.dragStart = null;
    }
  });

  function updateSelectionStatus() {
    if (!state.selection) {
      selectionStatus.textContent = 'No cells selected';
      return;
    }
    const minR = Math.min(state.selection.r1, state.selection.r2);
    const maxR = Math.max(state.selection.r1, state.selection.r2);
    const minC = Math.min(state.selection.c1, state.selection.c2);
    const maxC = Math.max(state.selection.c1, state.selection.c2);
    const count = (maxR - minR + 1) * (maxC - minC + 1);
    selectionStatus.textContent = `Selected: Rows ${minR + 1}-${maxR + 1}, Cols ${minC + 1}-${maxC + 1} (${count} cells)`;
  }

  // Assign Area
  function assignCurrentSelection() {
    if (!state.selection) {
      alert('Please click or drag across the grid to select cells first.');
      return;
    }

    const rawName = areaNameInput.value.trim();
    if (!rawName) {
      alert('Please enter an area name (e.g. "header", "sidebar").');
      areaNameInput.focus();
      return;
    }

    const cleanName = sanitizeAreaName(rawName);
    const color = areaColorPicker.value || colorPalette[colorIndex % colorPalette.length];

    const minR = Math.min(state.selection.r1, state.selection.r2);
    const maxR = Math.max(state.selection.r1, state.selection.r2);
    const minC = Math.min(state.selection.c1, state.selection.c2);
    const maxC = Math.max(state.selection.c1, state.selection.c2);

    // Overwrite any overlapping area cells
    for (let r = minR; r <= maxR; r++) {
      for (let c = minC; c <= maxC; c++) {
        const oldArea = state.cellMatrix[r][c];
        if (oldArea && oldArea !== '.' && oldArea !== cleanName) {
          // If previous area was broken by this overwrite, recompute or remove
          verifyAreaIntegrity(oldArea);
        }
        state.cellMatrix[r][c] = cleanName;
      }
    }

    state.areas.set(cleanName, {
      name: cleanName,
      color,
      minR,
      maxR,
      minC,
      maxC
    });

    // Pick next color
    colorIndex++;
    areaColorPicker.value = colorPalette[colorIndex % colorPalette.length];
    areaNameInput.value = '';
    state.selection = null;

    updateAll();
  }

  // Verify that an area is still a valid rectangular block
  function verifyAreaIntegrity(areaName) {
    if (!state.areas.has(areaName)) return;
    let minR = Infinity, maxR = -Infinity, minC = Infinity, maxC = -Infinity;
    let count = 0;

    for (let r = 0; r < state.rows; r++) {
      for (let c = 0; c < state.cols; c++) {
        if (state.cellMatrix[r][c] === areaName) {
          minR = Math.min(minR, r);
          maxR = Math.max(maxR, r);
          minC = Math.min(minC, c);
          maxC = Math.max(maxC, c);
          count++;
        }
      }
    }

    if (count === 0) {
      state.areas.delete(areaName);
      return;
    }

    const expectedCount = (maxR - minR + 1) * (maxC - minC + 1);
    if (count === expectedCount) {
      // Still a solid rectangle
      const curr = state.areas.get(areaName);
      curr.minR = minR;
      curr.maxR = maxR;
      curr.minC = minC;
      curr.maxC = maxC;
    } else {
      // Broken non-rectangular shape: remove
      deleteArea(areaName);
    }
  }

  // Delete Area
  function deleteArea(areaName) {
    state.areas.delete(areaName);
    for (let r = 0; r < state.rows; r++) {
      for (let c = 0; c < state.cols; c++) {
        if (state.cellMatrix[r] && state.cellMatrix[r][c] === areaName) {
          state.cellMatrix[r][c] = '.';
        }
      }
    }
    updateAll();
  }

  // Clear All Areas
  function clearAllAreas() {
    state.areas.clear();
    for (let r = 0; r < state.rows; r++) {
      for (let c = 0; c < state.cols; c++) {
        if (state.cellMatrix[r]) state.cellMatrix[r][c] = '.';
      }
    }
    state.selection = null;
    updateAll();
  }

  // Full Refresh
  function updateAll() {
    updateSelectionStatus();
    renderEditorBoard();
    renderLivePreview();
    renderAreasList();
    updateCodeOutputs();
  }

  // Handle Dimensions Change
  function updateDimensions() {
    const newCols = parseInt(colsSlider.value, 10);
    const newRows = parseInt(rowsSlider.value, 10);

    colsVal.textContent = newCols;
    rowsVal.textContent = newRows;

    const oldCols = state.cols;
    const oldRows = state.rows;

    state.cols = newCols;
    state.rows = newRows;

    // Resize matrix preserving existing cells
    const newMatrix = [];
    for (let r = 0; r < newRows; r++) {
      const row = [];
      for (let c = 0; c < newCols; c++) {
        if (r < oldRows && c < oldCols && state.cellMatrix[r]) {
          row.push(state.cellMatrix[r][c]);
        } else {
          row.push('.');
        }
      }
      newMatrix.push(row);
    }
    state.cellMatrix = newMatrix;

    // Revalidate all areas
    const areaKeys = Array.from(state.areas.keys());
    areaKeys.forEach(name => verifyAreaIntegrity(name));

    // Clear selection if out of bounds
    state.selection = null;

    updateAll();
  }

  // Handle Gap Changes
  function updateGaps() {
    state.colGap = parseInt(colGapInput.value, 10) || 0;
    state.colGapUnit = colGapUnit.value;
    state.rowGap = parseInt(rowGapInput.value, 10) || 0;
    state.rowGapUnit = rowGapUnit.value;

    updateAll();
  }

  // Copy helper
  async function copyText(btn, text) {
    try {
      await navigator.clipboard.writeText(text);
      const origText = btn.textContent;
      btn.textContent = 'Copied!';
      btn.classList.add('copied');
      setTimeout(() => {
        btn.textContent = origText;
        btn.classList.remove('copied');
      }, 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  }

  // Event Listeners
  colsSlider.addEventListener('input', updateDimensions);
  rowsSlider.addEventListener('input', updateDimensions);
  colGapInput.addEventListener('input', updateGaps);
  colGapUnit.addEventListener('change', updateGaps);
  rowGapInput.addEventListener('input', updateGaps);
  rowGapUnit.addEventListener('change', updateGaps);

  assignAreaBtn.addEventListener('click', assignCurrentSelection);
  clearSelectionBtn.addEventListener('click', () => {
    state.selection = null;
    updateAll();
  });
  clearAllAreasBtn.addEventListener('click', clearAllAreas);

  presetChips.forEach(chip => {
    chip.addEventListener('click', () => {
      areaNameInput.value = chip.dataset.preset;
    });
  });

  tabEditor.addEventListener('click', () => {
    tabEditor.classList.add('active');
    tabPreview.classList.remove('active');
    gridVisualBoard.style.display = 'grid';
    gridLivePreview.style.display = 'none';
    state.activeTab = 'editor';
  });

  tabPreview.addEventListener('click', () => {
    tabPreview.classList.add('active');
    tabEditor.classList.remove('active');
    gridVisualBoard.style.display = 'none';
    gridLivePreview.style.display = 'grid';
    state.activeTab = 'preview';
    renderLivePreview();
  });

  copyCssBtn.addEventListener('click', () => {
    copyText(copyCssBtn, cssOutput.textContent);
  });

  copyHtmlBtn.addEventListener('click', () => {
    copyText(copyHtmlBtn, htmlOutput.textContent);
  });

  // Initial load
  setInitialLayout();
  areaColorPicker.value = colorPalette[colorIndex % colorPalette.length];
  updateAll();
});