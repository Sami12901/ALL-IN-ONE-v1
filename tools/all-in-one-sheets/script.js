// ALL IN ONE Sheets - Interactive Spreadsheet Engine
// Vanilla JavaScript implementation matching Excel conventions

(() => {
  'use strict';

  // --- Grid Configuration & State ---
  let numRows = 60;
  let numCols = 16; // A to P

  // Cell state map: key "colIndex,rowIndex" (0-based) -> CellData
  // CellData: { raw: string, format: string, bold: boolean, italic: boolean, align: string }
  const cells = new Map();

  // Selection state
  let activeCell = { col: 0, row: 0 };
  let selectionStart = { col: 0, row: 0 };
  let selectionEnd = { col: 0, row: 0 };
  let isSelecting = false;
  let isEditing = false;
  let inlineEditor = null;

  // History stack for Undo/Redo
  const undoStack = [];
  const redoStack = [];
  const MAX_HISTORY = 50;

  // Helper: Col index to letters (0 -> A, 15 -> P, 26 -> AA)
  function colIndexToName(index) {
    let name = '';
    let num = index;
    while (num >= 0) {
      name = String.fromCharCode((num % 26) + 65) + name;
      num = Math.floor(num / 26) - 1;
    }
    return name;
  }

  // Helper: Col letter to index ("A" -> 0, "P" -> 15)
  function colNameToIndex(name) {
    const upper = name.toUpperCase();
    let num = 0;
    for (let i = 0; i < upper.length; i++) {
      num = num * 26 + (upper.charCodeAt(i) - 64);
    }
    return num - 1;
  }

  function getCellKey(col, row) {
    return `${col},${row}`;
  }

  function getCellCoordName(col, row) {
    return `${colIndexToName(col)}${row + 1}`;
  }

  function parseCellCoord(coordStr) {
    const match = coordStr.trim().toUpperCase().match(/^([A-Z]+)([0-9]+)$/);
    if (!match) return null;
    const col = colNameToIndex(match[1]);
    const row = parseInt(match[2], 10) - 1;
    return { col, row };
  }

  function getCellData(col, row) {
    const key = getCellKey(col, row);
    return cells.get(key) || {
      raw: '',
      format: 'general',
      bold: false,
      italic: false,
      align: 'left'
    };
  }

  function setCellData(col, row, data, recordHistory = true) {
    const key = getCellKey(col, row);
    const prev = getCellData(col, row);
    
    if (recordHistory) {
      undoStack.push({
        type: 'cell',
        col,
        row,
        prev: { ...prev },
        next: { ...data }
      });
      if (undoStack.length > MAX_HISTORY) undoStack.shift();
      redoStack.length = 0;
    }

    // If data is empty and default, delete key to save memory
    if (!data.raw && data.format === 'general' && !data.bold && !data.italic && data.align === 'left') {
      cells.delete(key);
    } else {
      cells.set(key, { ...prev, ...data });
    }
  }

  // --- Formula Parser & Evaluator ---
  // Evaluates cell values recursively with cycle detection
  function evaluateCell(col, row, visiting = new Set()) {
    const key = getCellKey(col, row);
    if (visiting.has(key)) {
      return '#REF!'; // Circular reference
    }

    const data = getCellData(col, row);
    const raw = (data.raw || '').trim();

    if (!raw.startsWith('=')) {
      return raw;
    }

    visiting.add(key);
    let result;
    try {
      result = evaluateFormula(raw.slice(1), visiting);
    } catch {
      result = '#ERROR!';
    }
    visiting.delete(key);
    return result;
  }

  function evaluateFormula(expr, visiting) {
    let cleanExpr = expr.trim();
    if (!cleanExpr) return '';

    // Handle common Excel functions: SUM, AVERAGE, AVG, MIN, MAX, COUNT
    const funcMatch = cleanExpr.match(/^([A-Z]+)\((.*)\)$/i);
    if (funcMatch) {
      const funcName = funcMatch[1].toUpperCase();
      const argsStr = funcMatch[2];
      const values = resolveFunctionArgs(argsStr, visiting);

      switch (funcName) {
        case 'SUM': {
          let sum = 0;
          for (const v of values) {
            const num = parseFloat(v);
            if (!isNaN(num)) sum += num;
          }
          return sum;
        }
        case 'AVERAGE':
        case 'AVG': {
          let sum = 0;
          let count = 0;
          for (const v of values) {
            const num = parseFloat(v);
            if (!isNaN(num)) {
              sum += num;
              count++;
            }
          }
          return count > 0 ? (sum / count) : '#DIV/0!';
        }
        case 'MIN': {
          const nums = values.map(v => parseFloat(v)).filter(v => !isNaN(v));
          return nums.length ? Math.min(...nums) : 0;
        }
        case 'MAX': {
          const nums = values.map(v => parseFloat(v)).filter(v => !isNaN(v));
          return nums.length ? Math.max(...nums) : 0;
        }
        case 'COUNT': {
          let count = 0;
          for (const v of values) {
            if (v !== '' && v !== null && v !== undefined && !isNaN(parseFloat(v))) {
              count++;
            }
          }
          return count;
        }
      }
    }

    // Basic arithmetic evaluation with cell coordinates replacement
    // Replace cell references (e.g. A1, B12, AA5) with their evaluated values
    const parsedExpr = cleanExpr.replace(/([A-Z]+[0-9]+)/gi, (match) => {
      const coord = parseCellCoord(match);
      if (!coord) return '0';
      const val = evaluateCell(coord.col, coord.row, visiting);
      const num = parseFloat(val);
      if (isNaN(num)) {
        return `0`;
      }
      return `${num}`;
    });

    // Safely evaluate simple arithmetic using operator precedence parser
    return parseArithmetic(parsedExpr);
  }

  // Resolves arguments inside function calls: supports ranges "A1:A5" and commas "A1, B2:B5, 10"
  function resolveFunctionArgs(argsStr, visiting) {
    const rawTokens = splitArgs(argsStr);
    const results = [];

    for (const token of rawTokens) {
      const trimmed = token.trim();
      if (!trimmed) continue;

      // Range check e.g. A1:B5
      const rangeMatch = trimmed.match(/^([A-Z]+[0-9]+):([A-Z]+[0-9]+)$/i);
      if (rangeMatch) {
        const start = parseCellCoord(rangeMatch[1]);
        const end = parseCellCoord(rangeMatch[2]);
        if (start && end) {
          const minCol = Math.min(start.col, end.col);
          const maxCol = Math.max(start.col, end.col);
          const minRow = Math.min(start.row, end.row);
          const maxRow = Math.max(start.row, end.row);

          for (let c = minCol; c <= maxCol; c++) {
            for (let r = minRow; r <= maxRow; r++) {
              results.push(evaluateCell(c, r, visiting));
            }
          }
          continue;
        }
      }

      // Single cell coordinate
      const coord = parseCellCoord(trimmed);
      if (coord) {
        results.push(evaluateCell(coord.col, coord.row, visiting));
        continue;
      }

      // Literal number or evaluated expression
      try {
        const val = evaluateFormula(trimmed, visiting);
        results.push(val);
      } catch {
        results.push(trimmed);
      }
    }

    return results;
  }

  function splitArgs(str) {
    const parts = [];
    let current = '';
    let depth = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str[i];
      if (char === '(') depth++;
      else if (char === ')') depth--;
      
      if (char === ',' && depth === 0) {
        parts.push(current);
        current = '';
      } else {
        current += char;
      }
    }
    if (current.trim()) parts.push(current);
    return parts;
  }

  // Safe arithmetic parser supporting +, -, *, /, and parentheses
  function parseArithmetic(expression) {
    // Sanitize expression: allow only numbers, decimal points, +, -, *, /, %, (, ) and spaces
    const sanitized = expression.replace(/[^0-9.\+\-\*\/\%\(\)\s]/g, '');
    if (!sanitized.trim()) return 0;

    let index = 0;
    function peek() {
      while (sanitized[index] === ' ') index++;
      return sanitized[index];
    }
    function get() {
      while (sanitized[index] === ' ') index++;
      return sanitized[index++];
    }

    function parsePrimary() {
      let char = peek();
      if (char === '+') { get(); return parsePrimary(); }
      if (char === '-') { get(); return -parsePrimary(); }
      if (char === '(') {
        get();
        const val = parseAddSub();
        if (peek() === ')') get();
        return val;
      }

      let numStr = '';
      while (peek() !== undefined && ((peek() >= '0' && peek() <= '9') || peek() === '.')) {
        numStr += get();
      }
      return parseFloat(numStr) || 0;
    }

    function parseMulDiv() {
      let val = parsePrimary();
      while (peek() === '*' || peek() === '/' || peek() === '%') {
        const op = get();
        const next = parsePrimary();
        if (op === '*') val *= next;
        else if (op === '/') {
          if (next === 0) return '#DIV/0!';
          val /= next;
        } else if (op === '%') val %= next;
      }
      return val;
    }

    function parseAddSub() {
      let val = parseMulDiv();
      while (peek() === '+' || peek() === '-') {
        const op = get();
        const next = parseMulDiv();
        if (typeof val === 'string') return val;
        if (typeof next === 'string') return next;
        if (op === '+') val += next;
        else if (op === '-') val -= next;
      }
      return val;
    }

    const res = parseAddSub();
    if (typeof res === 'number') {
      return Number.isInteger(res) ? res : Math.round(res * 10000) / 10000;
    }
    return res;
  }

  // --- Formatting Helpers ---
  function formatCellValue(value, format) {
    if (value === '' || value === null || value === undefined) return '';
    if (typeof value === 'string' && (value.startsWith('#') || isNaN(Number(value)))) {
      return value;
    }

    const num = parseFloat(value);
    if (isNaN(num)) return value;

    switch (format) {
      case 'currency':
        return '$' + num.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
      case 'percent':
        return (num * 100).toFixed(1) + '%';
      case 'decimal2':
        return num.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
      case 'decimal0':
        return Math.round(num).toLocaleString('en-US');
      case 'general':
      default:
        return num.toLocaleString('en-US', { maximumFractionDigits: 4 });
    }
  }

  // --- DOM Elements ---
  const table = document.getElementById('sheet-table');
  const thead = document.getElementById('sheet-thead');
  const tbody = document.getElementById('sheet-tbody');
  const viewport = document.getElementById('sheet-viewport');
  const nameBox = document.getElementById('cell-name-box');
  const formulaInput = document.getElementById('cell-formula-input');
  const statusCell = document.getElementById('status-cell');
  const statusMode = document.getElementById('status-mode');
  const statCount = document.getElementById('stat-count');
  const statSum = document.getElementById('stat-sum');
  const statAvg = document.getElementById('stat-avg');
  const statMin = document.getElementById('stat-min');
  const statMax = document.getElementById('stat-max');
  const dropOverlay = document.getElementById('drop-overlay');

  // Toolbar buttons
  const btnBold = document.getElementById('btn-bold');
  const btnItalic = document.getElementById('btn-italic');
  const btnAlignLeft = document.getElementById('btn-align-left');
  const btnAlignCenter = document.getElementById('btn-align-center');
  const btnAlignRight = document.getElementById('btn-align-right');
  const btnFmtCurrency = document.getElementById('btn-fmt-currency');
  const btnFmtPercent = document.getElementById('btn-fmt-percent');
  const btnFmtDec2 = document.getElementById('btn-fmt-dec2');
  const btnFmtDec0 = document.getElementById('btn-fmt-dec0');
  const btnFmtPlain = document.getElementById('btn-fmt-plain');
  const btnAddRow = document.getElementById('btn-add-row');
  const btnDelRow = document.getElementById('btn-del-row');
  const btnAddCol = document.getElementById('btn-add-col');
  const btnDelCol = document.getElementById('btn-del-col');
  const btnUndo = document.getElementById('btn-undo');
  const btnRedo = document.getElementById('btn-redo');
  const btnExportCsv = document.getElementById('btn-export-csv');
  const btnExportJson = document.getElementById('btn-export-json');
  const btnClearSheet = document.getElementById('btn-clear-sheet');
  const templateSelect = document.getElementById('sheet-template');
  const fileInput = document.getElementById('sheet-file-input');

  // --- Grid Construction ---
  function renderHeaders() {
    let html = '<tr><th class="sheet-corner-header" id="corner-header"></th>';
    for (let c = 0; c < numCols; c++) {
      const colName = colIndexToName(c);
      html += `<th class="sheet-col-header" data-col="${c}" id="col-header-${c}">${colName}</th>`;
    }
    html += '</tr>';
    thead.innerHTML = html;
  }

  function renderGrid() {
    renderHeaders();
    const rowsHtml = [];
    for (let r = 0; r < numRows; r++) {
      let rowHtml = `<tr><th class="sheet-row-header" data-row="${r}" id="row-header-${r}">${r + 1}</th>`;
      for (let c = 0; c < numCols; c++) {
        rowHtml += `<td class="sheet-cell" data-col="${c}" data-row="${r}" id="cell-${c}-${r}"></td>`;
      }
      rowHtml += '</tr>';
      rowsHtml.push(rowHtml);
    }
    tbody.innerHTML = rowsHtml.join('');

    refreshAllCells();
    updateSelectionUI();
  }

  // --- Cell Rendering ---
  function refreshCell(col, row) {
    const td = document.getElementById(`cell-${col}-${row}`);
    if (!td) return;

    const data = getCellData(col, row);
    const evaluated = evaluateCell(col, row);
    const displayVal = formatCellValue(evaluated, data.format);

    td.textContent = displayVal;
    td.className = 'sheet-cell';
    if (data.bold) td.classList.add('bold');
    if (data.italic) td.classList.add('italic');
    if (data.align) td.classList.add(`align-${data.align}`);
    if (typeof evaluated === 'string' && evaluated.startsWith('#')) {
      td.classList.add('formula-error');
    }
  }

  function refreshAllCells() {
    for (let r = 0; r < numRows; r++) {
      for (let c = 0; c < numCols; c++) {
        refreshCell(c, r);
      }
    }
    updateQuickStats();
  }

  // --- Selection Management ---
  function selectCell(col, row, extend = false) {
    if (col < 0) col = 0;
    if (col >= numCols) col = numCols - 1;
    if (row < 0) row = 0;
    if (row >= numRows) row = numRows - 1;

    activeCell = { col, row };
    if (!extend) {
      selectionStart = { col, row };
      selectionEnd = { col, row };
    } else {
      selectionEnd = { col, row };
    }

    updateSelectionUI();
    syncToolbarAndFormulaBar();
  }

  function updateSelectionUI() {
    // Remove previous selection highlights
    document.querySelectorAll('.sheet-cell.selected, .sheet-cell.in-range').forEach(el => {
      el.classList.remove('selected', 'in-range');
    });
    document.querySelectorAll('.sheet-col-header.highlight, .sheet-row-header.highlight').forEach(el => {
      el.classList.remove('highlight');
    });

    const minCol = Math.min(selectionStart.col, selectionEnd.col);
    const maxCol = Math.max(selectionStart.col, selectionEnd.col);
    const minRow = Math.min(selectionStart.row, selectionEnd.row);
    const maxRow = Math.max(selectionStart.row, selectionEnd.row);

    for (let c = minCol; c <= maxCol; c++) {
      const colHeader = document.getElementById(`col-header-${c}`);
      if (colHeader) colHeader.classList.add('highlight');
    }
    for (let r = minRow; r <= maxRow; r++) {
      const rowHeader = document.getElementById(`row-header-${r}`);
      if (rowHeader) rowHeader.classList.add('highlight');
    }

    for (let r = minRow; r <= maxRow; r++) {
      for (let c = minCol; c <= maxCol; c++) {
        const td = document.getElementById(`cell-${c}-${r}`);
        if (!td) continue;
        if (c === activeCell.col && r === activeCell.row) {
          td.classList.add('selected');
        } else {
          td.classList.add('in-range');
        }
      }
    }

    // Scroll active cell into view if needed
    const activeTd = document.getElementById(`cell-${activeCell.col}-${activeCell.row}`);
    if (activeTd) {
      activeTd.scrollIntoView({ block: 'nearest', inline: 'nearest' });
    }

    updateQuickStats();
  }

  function syncToolbarAndFormulaBar() {
    const data = getCellData(activeCell.col, activeCell.row);
    const coordName = getCellCoordName(activeCell.col, activeCell.row);

    nameBox.value = coordName;
    statusCell.textContent = coordName;
    formulaInput.value = data.raw;

    // Sync button toggles
    btnBold.classList.toggle('active', !!data.bold);
    btnItalic.classList.toggle('active', !!data.italic);
    btnAlignLeft.classList.toggle('active', data.align === 'left');
    btnAlignCenter.classList.toggle('active', data.align === 'center');
    btnAlignRight.classList.toggle('active', data.align === 'right');
  }

  function updateQuickStats() {
    const minCol = Math.min(selectionStart.col, selectionEnd.col);
    const maxCol = Math.max(selectionStart.col, selectionEnd.col);
    const minRow = Math.min(selectionStart.row, selectionEnd.row);
    const maxRow = Math.max(selectionStart.row, selectionEnd.row);

    let count = 0;
    let numericCount = 0;
    let sum = 0;
    let min = Infinity;
    let max = -Infinity;

    for (let r = minRow; r <= maxRow; r++) {
      for (let c = minCol; c <= maxCol; c++) {
        const val = evaluateCell(c, r);
        if (val !== '' && val !== null && val !== undefined) {
          count++;
          const num = parseFloat(val);
          if (!isNaN(num)) {
            numericCount++;
            sum += num;
            if (num < min) min = num;
            if (num > max) max = num;
          }
        }
      }
    }

    statCount.textContent = count;
    if (numericCount > 0) {
      statSum.textContent = Math.round(sum * 100) / 100;
      statAvg.textContent = Math.round((sum / numericCount) * 100) / 100;
      statMin.textContent = min;
      statMax.textContent = max;
    } else {
      statSum.textContent = '-';
      statAvg.textContent = '-';
      statMin.textContent = '-';
      statMax.textContent = '-';
    }
  }

  // --- Inline Editing ---
  function startEditing(initialChar = null) {
    if (isEditing) return;
    isEditing = true;
    statusMode.textContent = 'EDIT';

    const td = document.getElementById(`cell-${activeCell.col}-${activeCell.row}`);
    if (!td) return;

    const data = getCellData(activeCell.col, activeCell.row);
    const editor = document.createElement('input');
    editor.type = 'text';
    editor.className = 'cell-inline-editor';
    editor.value = initialChar !== null ? initialChar : data.raw;

    td.innerHTML = '';
    td.appendChild(editor);
    editor.focus();

    if (initialChar === null) {
      editor.select();
    }

    inlineEditor = editor;

    editor.addEventListener('input', () => {
      formulaInput.value = editor.value;
    });

    editor.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        commitEditing(editor.value);
        selectCell(activeCell.col, activeCell.row + 1);
        e.preventDefault();
      } else if (e.key === 'Tab') {
        commitEditing(editor.value);
        selectCell(e.shiftKey ? activeCell.col - 1 : activeCell.col + 1, activeCell.row);
        e.preventDefault();
      } else if (e.key === 'Escape') {
        cancelEditing();
        e.preventDefault();
      }
    });

    editor.addEventListener('blur', () => {
      if (isEditing) {
        commitEditing(editor.value);
      }
    });
  }

  function commitEditing(newRaw) {
    if (!isEditing) return;
    isEditing = false;
    statusMode.textContent = 'READY';

    const cur = getCellData(activeCell.col, activeCell.row);
    if (cur.raw !== newRaw) {
      setCellData(activeCell.col, activeCell.row, { ...cur, raw: newRaw });
    }

    inlineEditor = null;
    refreshAllCells();
    syncToolbarAndFormulaBar();
  }

  function cancelEditing() {
    if (!isEditing) return;
    isEditing = false;
    statusMode.textContent = 'READY';
    inlineEditor = null;
    refreshCell(activeCell.col, activeCell.row);
    syncToolbarAndFormulaBar();
  }

  // --- Formatting Application to Selection Range ---
  function applyFormattingToSelection(updateFn) {
    const minCol = Math.min(selectionStart.col, selectionEnd.col);
    const maxCol = Math.max(selectionStart.col, selectionEnd.col);
    const minRow = Math.min(selectionStart.row, selectionEnd.row);
    const maxRow = Math.max(selectionStart.row, selectionEnd.row);

    for (let r = minRow; r <= maxRow; r++) {
      for (let c = minCol; c <= maxCol; c++) {
        const cur = getCellData(c, r);
        const updated = updateFn(cur);
        setCellData(c, r, updated);
        refreshCell(c, r);
      }
    }
    syncToolbarAndFormulaBar();
  }

  // --- Undo / Redo Execution ---
  function undo() {
    if (!undoStack.length) return;
    const action = undoStack.pop();
    redoStack.push(action);

    if (action.type === 'cell') {
      cells.set(getCellKey(action.col, action.row), action.prev);
      refreshCell(action.col, action.row);
      selectCell(action.col, action.row);
    }
    refreshAllCells();
  }

  function redo() {
    if (!redoStack.length) return;
    const action = redoStack.pop();
    undoStack.push(action);

    if (action.type === 'cell') {
      cells.set(getCellKey(action.col, action.row), action.next);
      refreshCell(action.col, action.row);
      selectCell(action.col, action.row);
    }
    refreshAllCells();
  }

  // --- Preloaded Templates ---
  const TEMPLATES = {
    sales: () => {
      cells.clear();
      // Headers
      const headers = ['Invoice #', 'Date', 'Client', 'Product', 'Quantity', 'Unit Price', 'Subtotal', 'Tax (10%)', 'Total'];
      headers.forEach((h, col) => {
        setCellData(col, 0, { raw: h, format: 'general', bold: true, italic: false, align: 'center' }, false);
      });

      // Sample rows
      const dataRows = [
        ['INV-1001', '2026-09-01', 'Acme Corp', 'Cloud Server v2', '5', '120.00', '=E2*F2', '=G2*0.1', '=G2+H2'],
        ['INV-1002', '2026-09-03', 'Globex Media', 'UI Design System', '2', '850.00', '=E3*F3', '=G3*0.1', '=G3+H3'],
        ['INV-1003', '2026-09-05', 'Soylent Inc', 'API Subscription', '12', '45.00', '=E4*F4', '=G4*0.1', '=G4+H4'],
        ['INV-1004', '2026-09-08', 'Initech LLC', 'Security Audit', '1', '2400.00', '=E5*F5', '=G5*0.1', '=G5+H5'],
        ['INV-1005', '2026-09-12', 'Umbrella Tech', 'Database Migration', '3', '650.00', '=E6*F6', '=G6*0.1', '=G6+H6'],
        ['INV-1006', '2026-09-15', 'Hooli Labs', 'Consulting Retainer', '20', '95.00', '=E7*F7', '=G7*0.1', '=G7+H7'],
      ];

      dataRows.forEach((rowVals, rIdx) => {
        const row = rIdx + 1;
        rowVals.forEach((val, col) => {
          let fmt = 'general';
          let align = 'left';
          if (col === 4) { fmt = 'decimal0'; align = 'right'; }
          else if (col >= 5) { fmt = 'currency'; align = 'right'; }
          setCellData(col, row, { raw: val, format: fmt, bold: false, italic: false, align }, false);
        });
      });

      // Totals Row
      const totalRow = dataRows.length + 1;
      setCellData(2, totalRow, { raw: 'Grand Total', format: 'general', bold: true, italic: false, align: 'right' }, false);
      setCellData(4, totalRow, { raw: `=SUM(E2:E${totalRow})`, format: 'decimal0', bold: true, italic: false, align: 'right' }, false);
      setCellData(6, totalRow, { raw: `=SUM(G2:G${totalRow})`, format: 'currency', bold: true, italic: false, align: 'right' }, false);
      setCellData(7, totalRow, { raw: `=SUM(H2:H${totalRow})`, format: 'currency', bold: true, italic: false, align: 'right' }, false);
      setCellData(8, totalRow, { raw: `=SUM(I2:I${totalRow})`, format: 'currency', bold: true, italic: false, align: 'right' }, false);
    },

    budget: () => {
      cells.clear();
      const headers = ['Category', 'Description', 'Budgeted ($)', 'Actual ($)', 'Variance ($)', 'Variance %'];
      headers.forEach((h, col) => {
        setCellData(col, 0, { raw: h, format: 'general', bold: true, italic: false, align: 'center' }, false);
      });

      const budgetRows = [
        ['Housing', 'Office Rent & Utilities', '3200', '3150', '=C2-D2', '=E2/C2'],
        ['Salaries', 'Engineering & Product', '14500', '14200', '=C3-D3', '=E3/C3'],
        ['Marketing', 'Digital Ads & Sponsorships', '2500', '2850', '=C4-D4', '=E4/C4'],
        ['Software', 'Cloud Infrastructure & SaaS', '1800', '1720', '=C5-D5', '=E5/C5'],
        ['Equipment', 'Workstations & Monitors', '1200', '950', '=C6-D6', '=E6/C6'],
        ['Travel', 'Client Site Visits', '900', '1100', '=C7-D7', '=E7/C7'],
      ];

      budgetRows.forEach((rowVals, rIdx) => {
        const row = rIdx + 1;
        rowVals.forEach((val, col) => {
          let fmt = 'general';
          let align = 'left';
          if (col === 2 || col === 3 || col === 4) { fmt = 'currency'; align = 'right'; }
          else if (col === 5) { fmt = 'percent'; align = 'right'; }
          setCellData(col, row, { raw: val, format: fmt, bold: false, italic: false, align }, false);
        });
      });

      const totalRow = budgetRows.length + 1;
      setCellData(1, totalRow, { raw: 'Total Operating Costs', format: 'general', bold: true, italic: false, align: 'right' }, false);
      setCellData(2, totalRow, { raw: `=SUM(C2:C${totalRow})`, format: 'currency', bold: true, italic: false, align: 'right' }, false);
      setCellData(3, totalRow, { raw: `=SUM(D2:D${totalRow})`, format: 'currency', bold: true, italic: false, align: 'right' }, false);
      setCellData(4, totalRow, { raw: `=SUM(E2:E${totalRow})`, format: 'currency', bold: true, italic: false, align: 'right' }, false);
    },

    inventory: () => {
      cells.clear();
      const headers = ['SKU', 'Item Name', 'Category', 'Stock Qty', 'Unit Cost', 'Inventory Value', 'Reorder Level', 'Status'];
      headers.forEach((h, col) => {
        setCellData(col, 0, { raw: h, format: 'general', bold: true, italic: false, align: 'center' }, false);
      });

      const items = [
        ['SKU-801', 'Ergonomic Keyboard', 'Hardware', '85', '45.00', '=D2*E2', '30', 'Optimal'],
        ['SKU-802', 'UltraWide Monitor 34"', 'Hardware', '18', '380.00', '=D3*E3', '20', 'Low Stock'],
        ['SKU-803', 'Thunderbolt 4 Cable', 'Accessories', '140', '12.50', '=D4*E4', '50', 'Optimal'],
        ['SKU-804', 'ANC Headset Pro', 'Audio', '42', '90.00', '=D5*E5', '25', 'Optimal'],
        ['SKU-805', 'USB-C Multi-Dock', 'Accessories', '9', '65.00', '=D6*E6', '20', 'Order Now'],
        ['SKU-806', 'High-Res Webcam 4K', 'Peripherals', '35', '75.00', '=D7*E7', '20', 'Optimal'],
      ];

      items.forEach((rowVals, rIdx) => {
        const row = rIdx + 1;
        rowVals.forEach((val, col) => {
          let fmt = 'general';
          let align = 'left';
          if (col === 3 || col === 6) { fmt = 'decimal0'; align = 'right'; }
          else if (col === 4 || col === 5) { fmt = 'currency'; align = 'right'; }
          setCellData(col, row, { raw: val, format: fmt, bold: false, italic: false, align }, false);
        });
      });

      const totalRow = items.length + 1;
      setCellData(2, totalRow, { raw: 'Inventory Totals:', format: 'general', bold: true, italic: false, align: 'right' }, false);
      setCellData(3, totalRow, { raw: `=SUM(D2:D${totalRow})`, format: 'decimal0', bold: true, italic: false, align: 'right' }, false);
      setCellData(4, totalRow, { raw: `=AVERAGE(E2:E${totalRow})`, format: 'currency', bold: true, italic: false, align: 'right' }, false);
      setCellData(5, totalRow, { raw: `=SUM(F2:F${totalRow})`, format: 'currency', bold: true, italic: false, align: 'right' }, false);
      setCellData(7, totalRow, { raw: `=COUNT(A2:A${totalRow}) Items`, format: 'general', bold: true, italic: false, align: 'center' }, false);
    },

    blank: () => {
      cells.clear();
    }
  };

  function loadTemplate(name) {
    if (TEMPLATES[name]) {
      TEMPLATES[name]();
      undoStack.length = 0;
      redoStack.length = 0;
      refreshAllCells();
      selectCell(0, 0);
    }
  }

  // --- CSV Import & Export ---
  function parseCSVText(csvText) {
    const rows = [];
    let currentRow = [];
    let currentField = '';
    let insideQuotes = false;

    for (let i = 0; i < csvText.length; i++) {
      const char = csvText[i];
      const nextChar = csvText[i + 1];

      if (char === '"') {
        if (insideQuotes && nextChar === '"') {
          currentField += '"';
          i++; // skip escaped quote
        } else {
          insideQuotes = !insideQuotes;
        }
      } else if (char === ',' && !insideQuotes) {
        currentRow.push(currentField);
        currentField = '';
      } else if ((char === '\r' || char === '\n') && !insideQuotes) {
        if (char === '\r' && nextChar === '\n') {
          i++;
        }
        currentRow.push(currentField);
        currentField = '';
        if (currentRow.some(field => field.trim() !== '')) {
          rows.push(currentRow);
        }
        currentRow = [];
      } else {
        currentField += char;
      }
    }
    if (currentField || currentRow.length > 0) {
      currentRow.push(currentField);
      if (currentRow.some(field => field.trim() !== '')) {
        rows.push(currentRow);
      }
    }
    return rows;
  }

  function importCSV(csvText) {
    const parsed = parseCSVText(csvText);
    if (!parsed.length) return;

    cells.clear();
    undoStack.length = 0;
    redoStack.length = 0;

    if (parsed.length > numRows) numRows = parsed.length + 10;
    const maxColsInCsv = Math.max(...parsed.map(r => r.length));
    if (maxColsInCsv > numCols) numCols = maxColsInCsv + 4;

    parsed.forEach((rowVals, r) => {
      rowVals.forEach((val, c) => {
        const trimmed = val.trim();
        const isHeader = r === 0;
        const isNum = !isNaN(Number(trimmed)) && trimmed !== '';
        setCellData(c, r, {
          raw: trimmed,
          format: 'general',
          bold: isHeader,
          italic: false,
          align: isNum ? 'right' : (isHeader ? 'center' : 'left')
        }, false);
      });
    });

    renderGrid();
    selectCell(0, 0);
  }

  function exportCSV() {
    let maxR = 0;
    let maxC = 0;
    for (const key of cells.keys()) {
      const [c, r] = key.split(',').map(Number);
      if (r > maxR) maxR = r;
      if (c > maxC) maxC = c;
    }

    const lines = [];
    for (let r = 0; r <= maxR; r++) {
      const rowVals = [];
      for (let c = 0; c <= maxC; c++) {
        let val = evaluateCell(c, r);
        if (val === null || val === undefined) val = '';
        val = String(val);
        if (val.includes(',') || val.includes('"') || val.includes('\n')) {
          val = '"' + val.replace(/"/g, '""') + '"';
        }
        rowVals.push(val);
      }
      lines.push(rowVals.join(','));
    }

    const csvBlob = new Blob([lines.join('\r\n')], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(csvBlob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `spreadsheet_export_${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  function exportJSON() {
    let maxR = 0;
    let maxC = 0;
    for (const key of cells.keys()) {
      const [c, r] = key.split(',').map(Number);
      if (r > maxR) maxR = r;
      if (c > maxC) maxC = c;
    }

    // Try extracting headers from row 0
    const headers = [];
    for (let c = 0; c <= maxC; c++) {
      const hVal = evaluateCell(c, 0);
      headers.push(hVal ? String(hVal).trim() : colIndexToName(c));
    }

    const records = [];
    for (let r = 1; r <= maxR; r++) {
      const rowObj = {};
      let hasData = false;
      for (let c = 0; c <= maxC; c++) {
        const evaluated = evaluateCell(c, r);
        const colKey = headers[c] || `col_${c}`;
        rowObj[colKey] = evaluated !== '' ? evaluated : null;
        if (evaluated !== '') hasData = true;
      }
      if (hasData) records.push(rowObj);
    }

    const jsonBlob = new Blob([JSON.stringify(records, null, 2)], { type: 'application/json;charset=utf-8;' });
    const url = URL.createObjectURL(jsonBlob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `spreadsheet_data_${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  // --- Event Listeners Setup ---
  function setupEventListeners() {
    // Cell Click and Drag Selection on Table
    table.addEventListener('mousedown', (e) => {
      const td = e.target.closest('.sheet-cell');
      if (!td) return;

      if (isEditing) {
        commitEditing(inlineEditor ? inlineEditor.value : '');
      }

      const col = parseInt(td.getAttribute('data-col'), 10);
      const row = parseInt(td.getAttribute('data-row'), 10);

      isSelecting = true;
      selectCell(col, row, e.shiftKey);
    });

    table.addEventListener('mouseover', (e) => {
      if (!isSelecting) return;
      const td = e.target.closest('.sheet-cell');
      if (!td) return;
      const col = parseInt(td.getAttribute('data-col'), 10);
      const row = parseInt(td.getAttribute('data-row'), 10);
      selectionEnd = { col, row };
      updateSelectionUI();
    });

    window.addEventListener('mouseup', () => {
      isSelecting = false;
    });

    // Double-click cell to start inline edit
    table.addEventListener('dblclick', (e) => {
      const td = e.target.closest('.sheet-cell');
      if (!td) return;
      startEditing();
    });

    // Keyboard Navigation
    window.addEventListener('keydown', (e) => {
      // Don't intercept if focused on formula bar or other external inputs
      if (document.activeElement === formulaInput || document.activeElement === templateSelect) {
        return;
      }

      if (isEditing) {
        return; // Handled by inline editor
      }

      // Check shortcuts with Ctrl/Cmd
      if (e.ctrlKey || e.metaKey) {
        if (e.key === 'z') {
          e.preventDefault();
          undo();
          return;
        } else if (e.key === 'y') {
          e.preventDefault();
          redo();
          return;
        } else if (e.key === 'b') {
          e.preventDefault();
          btnBold.click();
          return;
        } else if (e.key === 'i') {
          e.preventDefault();
          btnItalic.click();
          return;
        }
      }

      switch (e.key) {
        case 'ArrowUp':
          e.preventDefault();
          selectCell(activeCell.col, activeCell.row - 1, e.shiftKey);
          break;
        case 'ArrowDown':
          e.preventDefault();
          selectCell(activeCell.col, activeCell.row + 1, e.shiftKey);
          break;
        case 'ArrowLeft':
          e.preventDefault();
          selectCell(activeCell.col - 1, activeCell.row, e.shiftKey);
          break;
        case 'ArrowRight':
          e.preventDefault();
          selectCell(activeCell.col + 1, activeCell.row, e.shiftKey);
          break;
        case 'Tab':
          e.preventDefault();
          selectCell(e.shiftKey ? activeCell.col - 1 : activeCell.col + 1, activeCell.row);
          break;
        case 'Enter':
          e.preventDefault();
          selectCell(activeCell.col, e.shiftKey ? activeCell.row - 1 : activeCell.row + 1);
          break;
        case 'F2':
          e.preventDefault();
          startEditing();
          break;
        case 'Delete':
        case 'Backspace':
          e.preventDefault();
          applyFormattingToSelection(cur => ({ ...cur, raw: '' }));
          refreshAllCells();
          break;
        default:
          // Typing a regular character starts inline editing immediately
          if (e.key.length === 1 && !e.ctrlKey && !e.altKey && !e.metaKey) {
            e.preventDefault();
            startEditing(e.key);
          }
          break;
      }
    });

    // Formula Input Enter & Input
    formulaInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        const cur = getCellData(activeCell.col, activeCell.row);
        setCellData(activeCell.col, activeCell.row, { ...cur, raw: formulaInput.value });
        refreshAllCells();
        formulaInput.blur();
        selectCell(activeCell.col, activeCell.row + 1);
      } else if (e.key === 'Escape') {
        syncToolbarAndFormulaBar();
        formulaInput.blur();
      }
    });

    formulaInput.addEventListener('input', () => {
      statusMode.textContent = 'EDIT';
    });

    formulaInput.addEventListener('blur', () => {
      const cur = getCellData(activeCell.col, activeCell.row);
      if (cur.raw !== formulaInput.value) {
        setCellData(activeCell.col, activeCell.row, { ...cur, raw: formulaInput.value });
        refreshAllCells();
      }
      statusMode.textContent = 'READY';
    });

    // Toolbar formatting actions
    btnBold.addEventListener('click', () => {
      const current = getCellData(activeCell.col, activeCell.row);
      const nextBold = !current.bold;
      applyFormattingToSelection(c => ({ ...c, bold: nextBold }));
    });

    btnItalic.addEventListener('click', () => {
      const current = getCellData(activeCell.col, activeCell.row);
      const nextItalic = !current.italic;
      applyFormattingToSelection(c => ({ ...c, italic: nextItalic }));
    });

    btnAlignLeft.addEventListener('click', () => {
      applyFormattingToSelection(c => ({ ...c, align: 'left' }));
    });

    btnAlignCenter.addEventListener('click', () => {
      applyFormattingToSelection(c => ({ ...c, align: 'center' }));
    });

    btnAlignRight.addEventListener('click', () => {
      applyFormattingToSelection(c => ({ ...c, align: 'right' }));
    });

    btnFmtCurrency.addEventListener('click', () => {
      applyFormattingToSelection(c => ({ ...c, format: 'currency', align: 'right' }));
    });

    btnFmtPercent.addEventListener('click', () => {
      applyFormattingToSelection(c => ({ ...c, format: 'percent', align: 'right' }));
    });

    btnFmtDec2.addEventListener('click', () => {
      applyFormattingToSelection(c => ({ ...c, format: 'decimal2', align: 'right' }));
    });

    btnFmtDec0.addEventListener('click', () => {
      applyFormattingToSelection(c => ({ ...c, format: 'decimal0', align: 'right' }));
    });

    btnFmtPlain.addEventListener('click', () => {
      applyFormattingToSelection(c => ({ ...c, format: 'general' }));
    });

    // Grid Dimension adjustments
    btnAddRow.addEventListener('click', () => {
      numRows += 5;
      renderGrid();
    });

    btnDelRow.addEventListener('click', () => {
      if (numRows > 5) {
        numRows = Math.max(5, numRows - 5);
        renderGrid();
      }
    });

    btnAddCol.addEventListener('click', () => {
      numCols += 2;
      renderGrid();
    });

    btnDelCol.addEventListener('click', () => {
      if (numCols > 2) {
        numCols = Math.max(2, numCols - 2);
        renderGrid();
      }
    });

    // History
    btnUndo.addEventListener('click', undo);
    btnRedo.addEventListener('click', redo);

    // Export & Clear
    btnExportCsv.addEventListener('click', exportCSV);
    btnExportJson.addEventListener('click', exportJSON);
    btnClearSheet.addEventListener('click', () => {
      if (confirm('Are you sure you want to clear all data in this sheet?')) {
        cells.clear();
        undoStack.length = 0;
        redoStack.length = 0;
        refreshAllCells();
        syncToolbarAndFormulaBar();
      }
    });

    // Template selection
    templateSelect.addEventListener('change', (e) => {
      loadTemplate(e.target.value);
    });

    // CSV File Input
    fileInput.addEventListener('change', (e) => {
      const file = e.target.files && e.target.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (evt) => {
        importCSV(evt.target.result);
      };
      reader.readAsText(file);
      fileInput.value = '';
    });

    // Drag and Drop
    viewport.addEventListener('dragover', (e) => {
      e.preventDefault();
      dropOverlay.classList.add('active');
    });

    viewport.addEventListener('dragleave', (e) => {
      if (!viewport.contains(e.relatedTarget)) {
        dropOverlay.classList.remove('active');
      }
    });

    viewport.addEventListener('drop', (e) => {
      e.preventDefault();
      dropOverlay.classList.remove('active');
      const file = e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files[0];
      if (file && (file.name.endsWith('.csv') || file.type.includes('csv') || file.type.includes('text'))) {
        const reader = new FileReader();
        reader.onload = (evt) => {
          importCSV(evt.target.result);
        };
        reader.readAsText(file);
      }
    });
  }

  // --- Initializer ---
  document.addEventListener('DOMContentLoaded', () => {
    renderGrid();
    setupEventListeners();
    loadTemplate('sales'); // Default starting template
  });

})();