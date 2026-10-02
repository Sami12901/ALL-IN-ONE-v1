// Excel & CSV to PDF Studio - Client-side Logic

const SAMPLE_DATASETS = {
  financial: `Quarter,Revenue ($M),COGS ($M),Gross Profit ($M),OpEx ($M),Operating Income,Net Margin (%),YoY Growth
Q1 2025,124.5,48.2,76.3,31.4,44.9,36.1%,+18.4%
Q2 2025,138.2,52.1,86.1,33.0,53.1,38.4%,+19.2%
Q3 2025,145.8,55.4,90.4,34.8,55.6,38.1%,+16.7%
Q4 2025,172.6,63.0,109.6,39.2,70.4,40.8%,+22.5%
Q1 2026,152.0,57.5,94.5,36.1,58.4,38.4%,+22.1%
Q2 2026,168.4,61.8,106.6,38.5,68.1,40.4%,+21.8%
Q3 2026,180.2,65.0,115.2,40.0,75.2,41.7%,+23.6%
Q4 2026 (Est),210.5,74.2,136.3,44.5,91.8,43.6%,+21.9%
Total / Avg,1112.2,417.2,695.0,257.5,437.5,39.7%,+20.8%`,

  inventory: `SKU,Product Name,Category,Warehouse,In Stock,Reorder Level,Unit Cost ($),Retail Price ($),Status
PRD-1001,Omni Pro Wireless Hub,Networking,North America - East,1420,300,45.00,89.99,In Stock
PRD-1002,Titan Ultra Titanium Keyboard,Peripherals,Europe - Central,520,150,78.50,159.00,Optimal
PRD-1003,AeroFlow 27 4K IPS Monitor,Displays,Asia - Pacific,180,200,165.00,329.99,Reorder Warning
PRD-1004,Quantum ANC Studio Headphones,Audio,North America - West,890,250,55.00,129.50,In Stock
PRD-1005,Nova Thunderbolt 5 Dock,Accessories,North America - East,310,100,92.00,199.99,Optimal
PRD-1006,Vanguard Stealth Mouse,Peripherals,Europe - West,1250,400,24.00,59.99,In Stock
PRD-1007,Apex Precision Stylus Pro,Accessories,Asia - Pacific,95,150,32.00,79.00,Low Stock
PRD-1008,Horizon Dual-Lens Webcam 4K,Cameras,North America - West,440,120,48.00,119.00,In Stock`,

  payroll: `Emp ID,Employee Name,Department,Title,Location,Base Salary ($),Bonus ($),Status
EMP-8801,Elena Rostova,Executive,Chief Technology Officer,Geneva,225000,45000,Active
EMP-8802,Marcus Vance,Engineering,Lead Systems Architect,San Francisco,195000,28000,Active
EMP-8803,Sophia Chen,Product,Director of Design,Tokyo,168000,22000,Active
EMP-8804,Julian Sterling,Finance,Senior Portfolio Auditor,London,142000,18500,Active
EMP-8805,Amira Mansour,Operations,Global Supply Chain Lead,Dubai,155000,20000,Active
EMP-8806,Lucas Moreau,Engineering,Senior Cloud Engineer,Paris,135000,15000,Active
EMP-8807,Olivia Bennett,Marketing,VP Brand Strategy,New York,175000,25000,Active
EMP-8808,David Kim,Compliance,Legal Counsel,Singapore,160000,19000,Active`
};

let parsedRows = [];
let parsedHeaders = [];

// Parse CSV/TSV handling quotes and custom delimiters
function parseDelimitedData(text) {
  if (!text || !text.trim()) return { headers: [], rows: [] };

  // Detect delimiter: comma, tab, semicolon, pipe
  const firstLine = text.trim().split(/\r?\n/)[0];
  let delimiter = ',';
  if ((firstLine.match(/\t/g) || []).length > (firstLine.match(/,/g) || []).length) {
    delimiter = '\t';
  } else if ((firstLine.match(/;/g) || []).length > (firstLine.match(/,/g) || []).length) {
    delimiter = ';';
  } else if ((firstLine.match(/\|/g) || []).length > (firstLine.match(/,/g) || []).length) {
    delimiter = '|';
  }

  const rows = [];
  let currentRow = [];
  let currentVal = '';
  let inQuotes = false;
  let i = 0;

  while (i < text.length) {
    const char = text[i];
    const nextChar = text[i + 1];

    if (char === '"') {
      if (inQuotes && nextChar === '"') {
        currentVal += '"';
        i += 2;
        continue;
      } else {
        inQuotes = !inQuotes;
        i++;
        continue;
      }
    }

    if (!inQuotes) {
      if (char === delimiter) {
        currentRow.push(currentVal.trim());
        currentVal = '';
        i++;
        continue;
      }
      if (char === '\n' || char === '\r') {
        if (char === '\r' && nextChar === '\n') {
          i++;
        }
        currentRow.push(currentVal.trim());
        if (currentRow.some(col => col.length > 0)) {
          rows.push(currentRow);
        }
        currentRow = [];
        currentVal = '';
        i++;
        continue;
      }
    }

    currentVal += char;
    i++;
  }

  if (currentVal.length > 0 || currentRow.length > 0) {
    currentRow.push(currentVal.trim());
    if (currentRow.some(col => col.length > 0)) {
      rows.push(currentRow);
    }
  }

  if (rows.length === 0) return { headers: [], rows: [] };

  const headers = rows[0];
  const dataRows = rows.slice(1);
  return { headers, rows: dataRows };
}

function isNumericValue(val) {
  if (!val) return false;
  const clean = val.replace(/[\$,%]/g, '').trim();
  return clean !== '' && !isNaN(Number(clean));
}

// Render Preview
function renderPreview() {
  const container = document.getElementById('printable-sheet');
  const theme = document.getElementById('table-theme-select').value;
  const fontSize = document.getElementById('font-size-select').value;
  const paddingMode = document.getElementById('cell-padding-select').value;
  const autoFit = document.getElementById('check-auto-fit').checked;
  const rightAlignNum = document.getElementById('check-highlight-numbers').checked;
  const showRowNums = document.getElementById('check-show-row-numbers').checked;
  const orientation = document.getElementById('page-orientation').value;
  const paperSize = document.getElementById('paper-size').value;
  const title = document.getElementById('doc-title-input').value.trim() || 'Data Report';
  const subtitle = document.getElementById('doc-subtitle-input').value.trim();
  const rowsPerPage = parseInt(document.getElementById('rows-per-page').value, 10) || 0;
  const repeatHeaders = document.getElementById('check-repeat-headers').checked;
  const showFooter = document.getElementById('check-show-footer').checked;

  // Set paper class
  container.className = `sheet-paper ${theme}`;
  if (orientation === 'landscape') {
    container.classList.add(paperSize === 'letter' ? 'letter-landscape' : 'landscape');
  } else if (paperSize === 'letter') {
    container.classList.add('letter-portrait');
  }

  // Padding styles
  let padVal = '8px 10px';
  if (paddingMode === 'compact') padVal = '4px 6px';
  if (paddingMode === 'relaxed') padVal = '12px 14px';

  // Stats
  document.getElementById('data-stats').textContent = `${parsedHeaders.length} columns, ${parsedRows.length} rows`;

  if (parsedHeaders.length === 0 && parsedRows.length === 0) {
    container.innerHTML = `
      <div style="text-align: center; padding: 4rem 1rem; color: #6b7280;">
        <svg viewBox="0 0 24 24" width="48" height="48" stroke="currentColor" stroke-width="1.5" fill="none" style="margin-bottom: 1rem;"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
        <h3 style="color: #111827; margin-bottom: 0.5rem;">No Data Loaded</h3>
        <p>Upload a CSV file, choose a sample dataset, or paste tabular text.</p>
      </div>`;
    return;
  }

  const currentDate = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });

  const generateTableHtml = (rowsSubset, startIndex) => {
    let html = `<table class="sheet-table" style="font-size: ${fontSize}; width: ${autoFit ? '100%' : 'max-content'}; table-layout: ${autoFit ? 'auto' : 'fixed'};">`;
    html += '<thead><tr>';
    if (showRowNums) {
      html += `<th style="padding: ${padVal}; width: 35px; text-align: center;">#</th>`;
    }
    parsedHeaders.forEach(header => {
      html += `<th style="padding: ${padVal};">${header || '&nbsp;'}</th>`;
    });
    html += '</tr></thead><tbody>';

    rowsSubset.forEach((row, rIdx) => {
      html += '<tr>';
      if (showRowNums) {
        html += `<td style="padding: ${padVal}; text-align: center; color: #6b7280; font-size: 0.85em;">${startIndex + rIdx + 1}</td>`;
      }
      row.forEach((cell, cIdx) => {
        const isNum = rightAlignNum && isNumericValue(cell);
        const alignStyle = isNum ? 'text-align: right; font-variant-numeric: tabular-nums;' : '';
        html += `<td style="padding: ${padVal}; ${alignStyle}">${cell !== undefined ? cell : ''}</td>`;
      });
      // Fill missing columns if row is shorter
      if (row.length < parsedHeaders.length) {
        for (let k = row.length; k < parsedHeaders.length; k++) {
          html += `<td style="padding: ${padVal};">&nbsp;</td>`;
        }
      }
      html += '</tr>';
    });

    html += '</tbody></table>';
    return html;
  };

  const headerHtml = `
    <header class="doc-header">
      <div>
        <h1 class="doc-title">${escapeHtml(title)}</h1>
        ${subtitle ? `<div class="doc-subtitle">${escapeHtml(subtitle)}</div>` : ''}
      </div>
      <div class="doc-meta">
        <div><strong>Date:</strong> ${currentDate}</div>
        <div><strong>Records:</strong> ${parsedRows.length} items</div>
      </div>
    </header>
  `;

  const footerHtml = showFooter ? `
    <footer class="doc-footer">
      <span>Generated by ALL IN ONE Studio &bull; Confidential</span>
      <span>${currentDate}</span>
    </footer>
  ` : '';

  if (rowsPerPage > 0 && parsedRows.length > rowsPerPage) {
    // Paginated split
    let pagesHtml = '';
    const totalPages = Math.ceil(parsedRows.length / rowsPerPage);

    for (let p = 0; p < totalPages; p++) {
      const start = p * rowsPerPage;
      const end = start + rowsPerPage;
      const chunk = parsedRows.slice(start, end);

      pagesHtml += `
        <div class="page-container ${p > 0 ? 'html2pdf__page-break' : ''}" style="${p > 0 ? 'margin-top: 30px; padding-top: 20px; border-top: 1px dashed #cbd5e1;' : ''}">
          ${(p === 0 || repeatHeaders) ? headerHtml : ''}
          ${generateTableHtml(chunk, start)}
          ${footerHtml ? `<div class="doc-footer"><span>Page ${p + 1} of ${totalPages}</span><span>Confidential</span></div>` : ''}
        </div>
      `;
    }
    container.innerHTML = pagesHtml;
  } else {
    // Single continuous page
    container.innerHTML = `
      ${headerHtml}
      ${generateTableHtml(parsedRows, 0)}
      ${footerHtml}
    `;
  }
}

function escapeHtml(str) {
  if (!str) return '';
  return str.replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;');
}

// Download PDF via html2pdf.bundle.min.js
async function exportToPdf() {
  const exportBtn = document.getElementById('btn-download-pdf');
  const printableSheet = document.getElementById('printable-sheet');
  const orientation = document.getElementById('page-orientation').value;
  const paperSize = document.getElementById('paper-size').value;
  const title = document.getElementById('doc-title-input').value.trim() || 'table-export';
  const cleanFilename = title.toLowerCase().replace(/[^a-z0-9_-]/g, '_') + '.pdf';

  const origText = exportBtn.innerHTML;
  exportBtn.disabled = true;
  exportBtn.innerHTML = `
    <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" stroke-width="2" fill="none" style="animation: spin 1s linear infinite;"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>
    Generating PDF...
  `;

  // Temporary normalize scale for crisp rasterization
  const oldTransform = printableSheet.style.transform;
  printableSheet.style.transform = 'none';

  const opt = {
    margin: [10, 10, 10, 10],
    filename: cleanFilename,
    image: { type: 'jpeg', quality: 0.98 },
    html2canvas: { scale: 2, useCORS: true, logging: false },
    jsPDF: { unit: 'mm', format: paperSize, orientation: orientation },
    pagebreak: { mode: ['avoid-all', 'css', 'legacy'] }
  };

  try {
    if (window.html2pdf) {
      await window.html2pdf().set(opt).from(printableSheet).save();
    } else {
      alert('PDF generation library not found. Please refresh and try again.');
    }
  } catch (err) {
    console.error('PDF export failed:', err);
    alert('An error occurred during PDF generation: ' + err.message);
  } finally {
    printableSheet.style.transform = oldTransform;
    exportBtn.disabled = false;
    exportBtn.innerHTML = origText;
  }
}

// Download CSV
function exportCsv() {
  if (parsedHeaders.length === 0 && parsedRows.length === 0) return;
  const title = document.getElementById('doc-title-input').value.trim() || 'table-data';
  const filename = title.toLowerCase().replace(/[^a-z0-9_-]/g, '_') + '.csv';

  const escapeCsvCell = (val) => {
    if (val === null || val === undefined) return '';
    const str = String(val);
    if (str.includes(',') || str.includes('"') || str.includes('\n')) {
      return `"${str.replace(/"/g, '""')}"`;
    }
    return str;
  };

  const lines = [];
  lines.push(parsedHeaders.map(escapeCsvCell).join(','));
  parsedRows.forEach(row => {
    lines.push(row.map(escapeCsvCell).join(','));
  });

  const blob = new Blob([lines.join('\r\n')], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

// Initialize tool
document.addEventListener('DOMContentLoaded', () => {
  // Elements
  const dropZone = document.getElementById('drop-zone');
  const fileInput = document.getElementById('file-input');
  const btnBrowse = document.getElementById('btn-browse-file');
  const rawInput = document.getElementById('raw-data-input');
  const btnParseRaw = document.getElementById('btn-parse-raw');
  const zoomSlider = document.getElementById('zoom-slider');
  const zoomValue = document.getElementById('zoom-value');
  const printableSheet = document.getElementById('printable-sheet');
  const btnPdf = document.getElementById('btn-download-pdf');
  const btnCsv = document.getElementById('btn-export-csv');

  // Load default financial dataset
  const parsed = parseDelimitedData(SAMPLE_DATASETS.financial);
  parsedHeaders = parsed.headers;
  parsedRows = parsed.rows;
  renderPreview();

  // Zoom control
  const updateZoom = (val) => {
    zoomValue.textContent = `${val}%`;
    printableSheet.style.transform = `scale(${val / 100})`;
  };
  updateZoom(zoomSlider.value);
  zoomSlider.addEventListener('input', (e) => updateZoom(e.target.value));

  // Sample data buttons
  document.querySelectorAll('.btn-sample').forEach(btn => {
    btn.addEventListener('click', () => {
      const type = btn.getAttribute('data-sample');
      if (SAMPLE_DATASETS[type]) {
        const res = parseDelimitedData(SAMPLE_DATASETS[type]);
        parsedHeaders = res.headers;
        parsedRows = res.rows;
        if (type === 'financial') {
          document.getElementById('doc-title-input').value = 'Executive Quarterly Financial Report';
          document.getElementById('doc-subtitle-input').value = 'Global Business Intelligence Division';
        } else if (type === 'inventory') {
          document.getElementById('doc-title-input').value = 'Global Warehouse Inventory Audit';
          document.getElementById('doc-subtitle-input').value = 'Supply Chain & Fulfillment Logistics';
        } else if (type === 'payroll') {
          document.getElementById('doc-title-input').value = 'Executive Personnel Directory';
          document.getElementById('doc-subtitle-input').value = 'Human Resources & Talent Management';
        }
        renderPreview();
      }
    });
  });

  // Apply pasted data
  btnParseRaw.addEventListener('click', () => {
    const text = rawInput.value.trim();
    if (!text) {
      alert('Please enter or paste tabular data first.');
      return;
    }
    const res = parseDelimitedData(text);
    if (res.headers.length === 0) {
      alert('Could not detect headers or data columns in input.');
      return;
    }
    parsedHeaders = res.headers;
    parsedRows = res.rows;
    renderPreview();
  });

  // File browse
  btnBrowse.addEventListener('click', () => fileInput.click());
  fileInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) handleFile(file);
  });

  // Drag & drop
  dropZone.addEventListener('dragover', (e) => {
    e.preventDefault();
    dropZone.classList.add('dragover');
  });
  dropZone.addEventListener('dragleave', () => dropZone.classList.remove('dragover'));
  dropZone.addEventListener('drop', (e) => {
    e.preventDefault();
    dropZone.classList.remove('dragover');
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  });

  function handleFile(file) {
    const reader = new FileReader();
    reader.onload = (ev) => {
      const content = ev.target.result;
      const res = parseDelimitedData(content);
      if (res.headers.length > 0) {
        parsedHeaders = res.headers;
        parsedRows = res.rows;
        // Set document title from file name
        const cleanName = file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ');
        document.getElementById('doc-title-input').value = cleanName.charAt(0).toUpperCase() + cleanName.slice(1);
        renderPreview();
      } else {
        alert('File could not be parsed as valid tabular data.');
      }
    };
    reader.readAsText(file);
  }

  // Reactivity for controls
  const controlIds = [
    'table-theme-select',
    'font-size-select',
    'cell-padding-select',
    'check-auto-fit',
    'check-highlight-numbers',
    'check-show-row-numbers',
    'page-orientation',
    'paper-size',
    'doc-title-input',
    'doc-subtitle-input',
    'rows-per-page',
    'check-repeat-headers',
    'check-show-footer'
  ];

  controlIds.forEach(id => {
    const el = document.getElementById(id);
    if (el) {
      el.addEventListener('change', renderPreview);
      if (el.tagName === 'INPUT' && el.type === 'text') {
        el.addEventListener('input', renderPreview);
      }
    }
  });

  // Export actions
  btnPdf.addEventListener('click', exportToPdf);
  btnCsv.addEventListener('click', exportCsv);
});