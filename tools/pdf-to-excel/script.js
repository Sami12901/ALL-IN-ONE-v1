// PDF to Excel Converter - Client-Side Spatial Table Recognizer

if (window.pdfjsLib) {
  window.pdfjsLib.GlobalWorkerOptions.workerSrc = '../../assets/lib/pdf.worker.min.js';
}

class PdfToExcelApp {
  constructor() {
    this.uploadZone = document.getElementById('upload-zone');
    this.fileInput = document.getElementById('file-input');
    this.btnBrowse = document.getElementById('btn-browse');
    this.btnSample = document.getElementById('btn-sample');

    this.progressPanel = document.getElementById('progress-panel');
    this.progressTitle = document.getElementById('progress-title');
    this.progressStatus = document.getElementById('progress-status');
    this.progressBar = document.getElementById('progress-bar');
    this.progressPercent = document.getElementById('progress-percent');

    this.workspaceArea = document.getElementById('workspace-area');
    this.docFilename = document.getElementById('doc-filename');
    this.metaRows = document.getElementById('meta-rows');
    this.metaCols = document.getElementById('meta-cols');
    this.metaPages = document.getElementById('meta-pages');

    this.pageTabs = document.getElementById('page-tabs');
    this.tableSearch = document.getElementById('table-search');
    this.btnAddRow = document.getElementById('btn-add-row');
    this.btnAddCol = document.getElementById('btn-add-col');
    this.spreadsheetThead = document.getElementById('spreadsheet-thead');
    this.spreadsheetTbody = document.getElementById('spreadsheet-tbody');

    this.statTotalRows = document.getElementById('stat-total-rows');
    this.statTotalCols = document.getElementById('stat-total-cols');
    this.statNumericCols = document.getElementById('stat-numeric-cols');
    this.statFilledCells = document.getElementById('stat-filled-cells');

    this.btnCopyCsv = document.getElementById('btn-copy-csv');
    this.btnExportCsv = document.getElementById('btn-export-csv');
    this.btnExportExcel = document.getElementById('btn-export-excel');
    this.btnReset = document.getElementById('btn-reset');

    this.currentFileName = 'Extracted-Spreadsheet';
    this.pagesData = []; // Array of { pageNum: number, rows: string[][], colTypes: string[] }
    this.activePageIndex = 0; // 0 for Page 1, or -1 for "All Pages"
    this.isProcessing = false;

    this.bindEvents();
  }

  bindEvents() {
    this.btnBrowse.addEventListener('click', (e) => {
      e.stopPropagation();
      this.fileInput.click();
    });

    this.uploadZone.addEventListener('click', () => {
      this.fileInput.click();
    });

    this.fileInput.addEventListener('change', (e) => {
      if (e.target.files && e.target.files[0]) {
        this.processFile(e.target.files[0]);
      }
    });

    // Drag and drop
    this.uploadZone.addEventListener('dragover', (e) => {
      e.preventDefault();
      this.uploadZone.classList.add('dragover');
    });

    this.uploadZone.addEventListener('dragleave', () => {
      this.uploadZone.classList.remove('dragover');
    });

    this.uploadZone.addEventListener('drop', (e) => {
      e.preventDefault();
      this.uploadZone.classList.remove('dragover');
      if (e.dataTransfer.files && e.dataTransfer.files[0]) {
        const file = e.dataTransfer.files[0];
        if (file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf')) {
          this.processFile(file);
        } else {
          alert('Please select a valid PDF document (.pdf).');
        }
      }
    });

    this.btnSample.addEventListener('click', (e) => {
      e.stopPropagation();
      this.loadSampleData();
    });

    this.btnReset.addEventListener('click', () => {
      this.resetWorkspace();
    });

    this.btnAddRow.addEventListener('click', () => {
      this.addNewRow();
    });

    this.btnAddCol.addEventListener('click', () => {
      this.addNewColumn();
    });

    this.tableSearch.addEventListener('input', (e) => {
      this.filterRows(e.target.value.toLowerCase());
    });

    this.btnCopyCsv.addEventListener('click', () => {
      this.copyCsvToClipboard();
    });

    this.btnExportCsv.addEventListener('click', () => {
      this.exportCsv();
    });

    this.btnExportExcel.addEventListener('click', () => {
      this.exportExcel();
    });
  }

  updateProgress(percent, title, status) {
    if (this.progressTitle && title) this.progressTitle.textContent = title;
    if (this.progressStatus && status) this.progressStatus.textContent = status;
    if (this.progressBar) this.progressBar.style.width = `${percent}%`;
    if (this.progressPercent) this.progressPercent.textContent = `${Math.round(percent)}%`;
  }

  showProgress() {
    this.uploadZone.style.display = 'none';
    this.workspaceArea.style.display = 'none';
    this.progressPanel.style.display = 'block';
  }

  showWorkspace() {
    this.progressPanel.style.display = 'none';
    this.uploadZone.style.display = 'none';
    this.workspaceArea.style.display = 'flex';
  }

  resetWorkspace() {
    this.fileInput.value = '';
    this.tableSearch.value = '';
    this.pagesData = [];
    this.activePageIndex = 0;
    this.progressPanel.style.display = 'none';
    this.workspaceArea.style.display = 'none';
    this.uploadZone.style.display = 'flex';
  }

  async processFile(file) {
    if (this.isProcessing) return;
    this.isProcessing = true;
    this.currentFileName = file.name.replace(/\.[^/.]+$/, '');
    this.docFilename.textContent = file.name;

    this.showProgress();
    this.updateProgress(10, 'Opening PDF...', 'Reading document stream');

    try {
      if (!window.pdfjsLib) {
        throw new Error('PDF.js library is not available.');
      }

      const arrayBuffer = await file.arrayBuffer();
      const loadingTask = window.pdfjsLib.getDocument({ data: arrayBuffer });
      const pdf = await loadingTask.promise;

      const totalPages = pdf.numPages;
      this.pagesData = [];

      for (let pageNum = 1; pageNum <= totalPages; pageNum++) {
        const pageProgress = 15 + (pageNum / totalPages) * 75;
        this.updateProgress(pageProgress, `Analyzing Page ${pageNum} of ${totalPages}`, 'Calculating spatial text matrices and column alignments...');

        const page = await pdf.getPage(pageNum);
        const textContent = await page.getTextContent({ normalizeWhitespace: true });
        
        const extractedTable = this.extractTableFromSpatialCoordinates(textContent.items);

        if (extractedTable.rows.length > 0) {
          const colTypes = this.detectColumnTypes(extractedTable.rows);
          this.pagesData.push({
            pageNum,
            rows: extractedTable.rows,
            colTypes: colTypes
          });
        }
      }

      // If no tables detected, create fallback single row
      if (this.pagesData.length === 0) {
        this.pagesData.push({
          pageNum: 1,
          rows: [['Column 1', 'Column 2'], ['No structured table detected', 'Try another PDF']],
          colTypes: ['text', 'text']
        });
      }

      this.updateProgress(100, 'Rendering Spreadsheet Grid...', 'Building interactive workspace');

      setTimeout(() => {
        this.activePageIndex = 0;
        this.renderPageTabs();
        this.renderCurrentTable();
        this.showWorkspace();
        this.isProcessing = false;
      }, 300);

    } catch (err) {
      console.error(err);
      alert('Error parsing PDF table: ' + err.message);
      this.resetWorkspace();
      this.isProcessing = false;
    }
  }

  // Core spatial table extraction algorithm
  extractTableFromSpatialCoordinates(items) {
    if (!items || items.length === 0) {
      return { rows: [] };
    }

    // Filter valid text items
    const validItems = items
      .filter(it => it.str && it.str.trim().length > 0)
      .map(it => {
        const t = it.transform;
        return {
          str: it.str.trim(),
          x: t[4],
          y: t[5],
          width: it.width || 0,
          height: it.height || 10
        };
      });

    if (validItems.length === 0) {
      return { rows: [] };
    }

    // 1. Group items into lines by y-coordinate (descending order)
    const lineTolerance = 4.0;
    const sortedByY = [...validItems].sort((a, b) => {
      if (Math.abs(a.y - b.y) <= lineTolerance) {
        return a.x - b.x;
      }
      return b.y - a.y; // top of page has higher y in PDF
    });

    const lines = [];
    let currentLine = [];
    let currentY = null;

    sortedByY.forEach(item => {
      if (currentY === null || Math.abs(item.y - currentY) <= lineTolerance) {
        currentLine.push(item);
        currentY = item.y;
      } else {
        if (currentLine.length > 0) {
          lines.push(currentLine.sort((a, b) => a.x - b.x));
        }
        currentLine = [item];
        currentY = item.y;
      }
    });
    if (currentLine.length > 0) {
      lines.push(currentLine.sort((a, b) => a.x - b.x));
    }

    if (lines.length === 0) return { rows: [] };

    // 2. Cluster X coordinates across all lines to establish column intervals
    // Collect all starting X positions
    const allX = [];
    lines.forEach(line => {
      line.forEach(item => allX.push(item.x));
    });

    allX.sort((a, b) => a - b);

    // Cluster x coordinates that are within 22 points of each other
    const columnAnchors = [];
    const clusterDist = 24.0;

    allX.forEach(x => {
      let matchedCluster = columnAnchors.find(c => Math.abs(c.mean - x) < clusterDist);
      if (matchedCluster) {
        matchedCluster.points.push(x);
        matchedCluster.mean = matchedCluster.points.reduce((a, b) => a + b, 0) / matchedCluster.points.length;
      } else {
        columnAnchors.push({ mean: x, points: [x] });
      }
    });

    // Sort column anchors left to right
    columnAnchors.sort((a, b) => a.mean - b.mean);

    // If only 1 column detected across all lines, fallback to spacing within lines
    if (columnAnchors.length <= 1) {
      // Split lines with spaces/tabs
      const fallbackRows = lines.map(line => {
        return line.map(it => it.str);
      });
      return { rows: fallbackRows };
    }

    // 3. Map items of each line into column buckets
    const tableRows = [];

    lines.forEach(line => {
      const rowCells = new Array(columnAnchors.length).fill('');

      line.forEach(item => {
        // Find closest column anchor
        let closestColIdx = 0;
        let minDiff = Infinity;

        columnAnchors.forEach((col, idx) => {
          const diff = Math.abs(item.x - col.mean);
          if (diff < minDiff) {
            minDiff = diff;
            closestColIdx = idx;
          }
        });

        if (rowCells[closestColIdx]) {
          rowCells[closestColIdx] += ' ' + item.str;
        } else {
          rowCells[closestColIdx] = item.str;
        }
      });

      // Avoid pushing rows that are completely empty
      if (rowCells.some(c => c.trim().length > 0)) {
        tableRows.push(rowCells);
      }
    });

    // 4. Prune completely empty columns
    if (tableRows.length > 0) {
      const numCols = columnAnchors.length;
      const keepCols = [];

      for (let c = 0; c < numCols; c++) {
        const hasContent = tableRows.some(row => row[c] && row[c].trim().length > 0);
        if (hasContent) {
          keepCols.push(c);
        }
      }

      if (keepCols.length > 0 && keepCols.length < numCols) {
        return {
          rows: tableRows.map(row => keepCols.map(c => row[c] || ''))
        };
      }
    }

    return { rows: tableRows };
  }

  detectColumnTypes(rows) {
    if (!rows || rows.length <= 1) {
      const cols = rows[0] ? rows[0].length : 1;
      return new Array(cols).fill('text');
    }

    const numCols = rows[0].length;
    const types = [];

    for (let c = 0; c < numCols; c++) {
      let numCount = 0;
      let dateCount = 0;
      let totalNonEmpty = 0;

      // Check rows (skip header row 0)
      for (let r = 1; r < rows.length; r++) {
        const cell = (rows[r][c] || '').trim();
        if (!cell) continue;

        totalNonEmpty++;

        // Number / Currency / Percent check
        const cleanNum = cell.replace(/[$€£¥,%\s]/g, '');
        if (!isNaN(cleanNum) && cleanNum.length > 0) {
          numCount++;
          continue;
        }

        // Date check (YYYY-MM-DD, DD/MM/YYYY, or Month Name)
        if (/^\d{4}[-/.]\d{1,2}[-/.]\d{1,2}$|^\d{1,2}[-/.]\d{1,2}[-/.]\d{2,4}$|^(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]* \d{1,2}/i.test(cell)) {
          dateCount++;
          continue;
        }
      }

      if (totalNonEmpty > 0 && (numCount / totalNonEmpty) >= 0.6) {
        types.push('number');
      } else if (totalNonEmpty > 0 && (dateCount / totalNonEmpty) >= 0.5) {
        types.push('date');
      } else {
        types.push('text');
      }
    }

    return types;
  }

  renderPageTabs() {
    this.pageTabs.innerHTML = '';

    if (this.pagesData.length > 1) {
      // "All Pages" tab
      const allTab = document.createElement('button');
      allTab.type = 'button';
      allTab.className = `page-tab ${this.activePageIndex === -1 ? 'active' : ''}`;
      allTab.textContent = `All Pages (${this.pagesData.length})`;
      allTab.addEventListener('click', () => {
        this.activePageIndex = -1;
        this.renderPageTabs();
        this.renderCurrentTable();
      });
      this.pageTabs.appendChild(allTab);
    }

    this.pagesData.forEach((page, idx) => {
      const tab = document.createElement('button');
      tab.type = 'button';
      tab.className = `page-tab ${this.activePageIndex === idx ? 'active' : ''}`;
      tab.textContent = `Page ${page.pageNum} (${page.rows.length} rows)`;
      tab.addEventListener('click', () => {
        this.activePageIndex = idx;
        this.renderPageTabs();
        this.renderCurrentTable();
      });
      this.pageTabs.appendChild(tab);
    });
  }

  getCurrentRows() {
    if (this.pagesData.length === 0) return [];
    if (this.activePageIndex === -1) {
      // Combine all pages
      const combined = [];
      this.pagesData.forEach((p, idx) => {
        p.rows.forEach((r, rIdx) => {
          if (idx > 0 && rIdx === 0) return; // skip redundant headers
          combined.push([...r]);
        });
      });
      return combined;
    }
    return this.pagesData[this.activePageIndex].rows;
  }

  setCurrentRows(newRows) {
    if (this.pagesData.length === 0) return;
    if (this.activePageIndex === -1) {
      // Set to first page as master
      this.pagesData[0].rows = newRows;
    } else {
      this.pagesData[this.activePageIndex].rows = newRows;
      this.pagesData[this.activePageIndex].colTypes = this.detectColumnTypes(newRows);
    }
  }

  renderCurrentTable() {
    const rows = this.getCurrentRows();
    if (!rows || rows.length === 0) {
      this.spreadsheetThead.innerHTML = '';
      this.spreadsheetTbody.innerHTML = '<tr><td colspan="5" style="text-align:center; padding:2rem; color:var(--muted);">No rows to display.</td></tr>';
      return;
    }

    const colCount = Math.max(...rows.map(r => r.length), 1);
    const colTypes = this.detectColumnTypes(rows);

    // Build thead
    let theadHtml = '<tr><th class="row-index-cell">#</th>';
    for (let c = 0; c < colCount; c++) {
      const colLetter = this.getColumnLetter(c);
      const type = colTypes[c] || 'text';
      theadHtml += `
        <th>
          <div class="col-letter-header">${colLetter}</div>
          <div class="col-type-badge ${type}">${type}</div>
        </th>
      `;
    }
    theadHtml += '</tr>';
    this.spreadsheetThead.innerHTML = theadHtml;

    // Build tbody
    this.spreadsheetTbody.innerHTML = '';
    rows.forEach((row, rowIdx) => {
      const tr = document.createElement('tr');
      tr.dataset.rowIndex = rowIdx;

      // Row Index & Delete Action
      const indexTd = document.createElement('td');
      indexTd.className = 'row-index-cell';
      indexTd.innerHTML = `
        <span>${rowIdx + 1}</span>
        <button type="button" class="row-delete-btn" title="Delete Row" data-row-idx="${rowIdx}">
          <svg viewBox="0 0 24 24" width="12" height="12" stroke="currentColor" stroke-width="2" fill="none"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
        </button>
      `;
      tr.appendChild(indexTd);

      // Data Cells
      for (let c = 0; c < colCount; c++) {
        const td = document.createElement('td');
        td.contentEditable = 'true';
        td.spellcheck = false;
        td.textContent = row[c] !== undefined ? row[c] : '';
        td.dataset.col = c;
        td.dataset.row = rowIdx;

        td.addEventListener('blur', (e) => {
          this.handleCellEdit(rowIdx, c, e.target.textContent);
        });

        tr.appendChild(td);
      }

      this.spreadsheetTbody.appendChild(tr);
    });

    // Row delete click delegation
    this.spreadsheetTbody.querySelectorAll('.row-delete-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const rowIdx = parseInt(e.currentTarget.dataset.rowIdx, 10);
        this.deleteRow(rowIdx);
      });
    });

    this.updateStats();
  }

  handleCellEdit(rowIdx, colIdx, newValue) {
    const rows = this.getCurrentRows();
    if (rows[rowIdx]) {
      rows[rowIdx][colIdx] = newValue;
      this.updateStats();
    }
  }

  addNewRow() {
    const rows = this.getCurrentRows();
    const colCount = rows.length > 0 ? rows[0].length : 3;
    const newRow = new Array(colCount).fill('');
    rows.push(newRow);
    this.renderCurrentTable();
  }

  addNewColumn() {
    const rows = this.getCurrentRows();
    rows.forEach(r => r.push(''));
    this.renderCurrentTable();
  }

  deleteRow(rowIdx) {
    const rows = this.getCurrentRows();
    if (rows.length <= 1) {
      alert('Cannot delete the last remaining row.');
      return;
    }
    rows.splice(rowIdx, 1);
    this.renderCurrentTable();
  }

  filterRows(query) {
    const trs = this.spreadsheetTbody.querySelectorAll('tr');
    trs.forEach(tr => {
      if (!query) {
        tr.classList.remove('filtered-out');
        return;
      }
      const text = tr.innerText.toLowerCase();
      if (text.includes(query)) {
        tr.classList.remove('filtered-out');
      } else {
        tr.classList.add('filtered-out');
      }
    });
  }

  updateStats() {
    const rows = this.getCurrentRows();
    const totalRows = rows.length;
    const totalCols = rows.length > 0 ? rows[0].length : 0;

    let filledCount = 0;
    rows.forEach(r => {
      r.forEach(cell => {
        if (cell && cell.trim().length > 0) filledCount++;
      });
    });

    const colTypes = this.detectColumnTypes(rows);
    const numericCols = colTypes.filter(t => t === 'number').length;

    this.statTotalRows.textContent = totalRows.toLocaleString();
    this.statTotalCols.textContent = totalCols.toLocaleString();
    this.statNumericCols.textContent = numericCols.toLocaleString();
    this.statFilledCells.textContent = filledCount.toLocaleString();

    this.metaRows.textContent = `${totalRows} Rows`;
    this.metaCols.textContent = `${totalCols} Cols`;
    this.metaPages.textContent = `${this.pagesData.length} Page${this.pagesData.length === 1 ? '' : 's'}`;
  }

  getColumnLetter(index) {
    let letter = '';
    while (index >= 0) {
      letter = String.fromCharCode((index % 26) + 65) + letter;
      index = Math.floor(index / 26) - 1;
    }
    return letter;
  }

  copyCsvToClipboard() {
    const csvContent = this.generateCsvContent();
    navigator.clipboard.writeText(csvContent).then(() => {
      const origHtml = this.btnCopyCsv.innerHTML;
      this.btnCopyCsv.innerHTML = `
        <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" stroke-width="2" fill="none"><polyline points="20 6 9 17 4 12"></polyline></svg>
        Copied!
      `;
      setTimeout(() => {
        this.btnCopyCsv.innerHTML = origHtml;
      }, 2000);
    }).catch(err => {
      alert('Could not copy CSV: ' + err.message);
    });
  }

  generateCsvContent() {
    const rows = this.getCurrentRows();
    return rows.map(row => {
      return row.map(cell => {
        const val = cell !== undefined ? String(cell) : '';
        if (val.includes(',') || val.includes('"') || val.includes('\n')) {
          return `"${val.replace(/"/g, '""')}"`;
        }
        return val;
      }).join(',');
    }).join('\r\n');
  }

  exportCsv() {
    const csvContent = this.generateCsvContent();
    // Include UTF-8 BOM so Excel opens special characters seamlessly
    const blob = new Blob(['\uFEFF', csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = `${this.currentFileName}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);

    setTimeout(() => URL.revokeObjectURL(url), 4000);
  }

  exportExcel() {
    const rows = this.getCurrentRows();
    const colTypes = this.detectColumnTypes(rows);
    const sheetName = 'TableData';

    // Build Microsoft Excel XML Spreadsheet (native 2003 XML schema, supported by all Excel versions)
    let xmlRows = '';
    rows.forEach((row, rowIdx) => {
      xmlRows += '<Row>';
      row.forEach((cellVal, colIdx) => {
        const val = (cellVal !== undefined ? String(cellVal) : '').trim();
        const type = colTypes[colIdx];
        const isHeader = (rowIdx === 0);

        if (isHeader) {
          xmlRows += `<Cell ss:StyleID="HeaderStyle"><Data ss:Type="String">${this.escapeXml(val)}</Data></Cell>`;
        } else if (type === 'number') {
          const cleanNum = val.replace(/[$€£¥,%\s]/g, '');
          if (!isNaN(cleanNum) && cleanNum.length > 0) {
            xmlRows += `<Cell ss:StyleID="NumberStyle"><Data ss:Type="Number">${cleanNum}</Data></Cell>`;
          } else {
            xmlRows += `<Cell ss:StyleID="TextStyle"><Data ss:Type="String">${this.escapeXml(val)}</Data></Cell>`;
          }
        } else {
          xmlRows += `<Cell ss:StyleID="TextStyle"><Data ss:Type="String">${this.escapeXml(val)}</Data></Cell>`;
        }
      });
      xmlRows += '</Row>\n';
    });

    const excelXml = `<?xml version="1.0" encoding="UTF-8"?>
<?mso-application progid="Excel.Sheet"?>
<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet"
 xmlns:o="urn:schemas-microsoft-com:office:office"
 xmlns:x="urn:schemas-microsoft-com:office:excel"
 xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet"
 xmlns:html="http://www.w3.org/TR/REC-html40">
 <Styles>
  <Style ss:ID="Default" ss:Name="Normal">
   <Alignment ss:Vertical="Center"/>
   <Borders/>
   <Font ss:FontName="Calibri" ss:Size="11" ss:Color="#000000"/>
   <Interior/>
   <NumberFormat/>
   <Protection/>
  </Style>
  <Style ss:ID="HeaderStyle">
   <Alignment ss:Horizontal="Center" ss:Vertical="Center"/>
   <Borders>
    <Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="2" ss:Color="#059669"/>
   </Borders>
   <Font ss:FontName="Calibri" ss:Size="11" ss:Color="#FFFFFF" ss:Bold="1"/>
   <Interior ss:Color="#10B981" ss:Pattern="Solid"/>
  </Style>
  <Style ss:ID="NumberStyle">
   <Alignment ss:Horizontal="Right" ss:Vertical="Center"/>
   <Font ss:FontName="Calibri" ss:Size="11" ss:Color="#111827"/>
   <NumberFormat ss:Format="#,##0.00"/>
  </Style>
  <Style ss:ID="TextStyle">
   <Alignment ss:Horizontal="Left" ss:Vertical="Center"/>
   <Font ss:FontName="Calibri" ss:Size="11" ss:Color="#111827"/>
  </Style>
 </Styles>
 <Worksheet ss:Name="${sheetName}">
  <Table>
   ${xmlRows}
  </Table>
 </Worksheet>
</Workbook>`;

    const blob = new Blob([excelXml], { type: 'application/vnd.ms-excel;charset=utf-8' });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = `${this.currentFileName}.xlsx`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);

    setTimeout(() => URL.revokeObjectURL(url), 4000);
  }

  escapeXml(str) {
    if (!str) return '';
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&apos;');
  }

  loadSampleData() {
    this.currentFileName = 'Q3-Financial-Performance';
    this.docFilename.textContent = 'Q3-Financial-Performance.pdf';

    const sampleRows = [
      ['Region', 'Product Line', 'Quarter', 'Sales Volume', 'Revenue (USD)', 'Margin %', 'Audit Date'],
      ['North America', 'Cloud Infrastructure', 'Q3-2026', '1420', '852000', '34.5%', '2026-09-15'],
      ['North America', 'Enterprise Security', 'Q3-2026', '980', '588000', '41.2%', '2026-09-18'],
      ['Europe & UK', 'Cloud Infrastructure', 'Q3-2026', '1150', '690000', '32.8%', '2026-09-20'],
      ['Europe & UK', 'Data Analytics Suite', 'Q3-2026', '840', '504000', '45.0%', '2026-09-22'],
      ['Asia-Pacific', 'Cloud Infrastructure', 'Q3-2026', '1680', '1008000', '29.4%', '2026-09-25'],
      ['Asia-Pacific', 'AI Automation Kit', 'Q3-2026', '720', '432000', '52.1%', '2026-09-28'],
      ['Latin America', 'Enterprise Security', 'Q3-2026', '410', '246000', '38.6%', '2026-09-30']
    ];

    this.pagesData = [{
      pageNum: 1,
      rows: sampleRows,
      colTypes: ['text', 'text', 'text', 'number', 'number', 'number', 'date']
    }];

    this.activePageIndex = 0;
    this.renderPageTabs();
    this.renderCurrentTable();
    this.showWorkspace();
  }
}

// Initialize on DOM ready
document.addEventListener('DOMContentLoaded', () => {
  window.pdfToExcelApp = new PdfToExcelApp();
});