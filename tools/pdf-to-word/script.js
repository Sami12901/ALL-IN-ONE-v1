// PDF to Word Converter - Comprehensive Client-Side Engine

if (window.pdfjsLib) {
  window.pdfjsLib.GlobalWorkerOptions.workerSrc = '../../assets/lib/pdf.worker.min.js';
}

class PdfToWordApp {
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
    this.metaPages = document.getElementById('meta-pages');
    this.metaWords = document.getElementById('meta-words');
    this.metaChars = document.getElementById('meta-chars');
    this.documentEditor = document.getElementById('document-editor');
    this.statusCounts = document.getElementById('status-counts');

    this.btnCopyText = document.getElementById('btn-copy-text');
    this.btnExportDocx = document.getElementById('btn-export-docx');
    this.btnExportDoc = document.getElementById('btn-export-doc');
    this.btnReset = document.getElementById('btn-reset');

    this.currentFileName = 'Converted-Document';
    this.pageCount = 0;
    this.isProcessing = false;

    this.bindEvents();
    this.bindRibbonControls();
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
          alert('Please select a valid PDF file (.pdf).');
        }
      }
    });

    this.btnSample.addEventListener('click', (e) => {
      e.stopPropagation();
      this.loadSampleDocument();
    });

    this.btnReset.addEventListener('click', () => {
      this.resetWorkspace();
    });

    this.btnCopyText.addEventListener('click', () => {
      this.copyDocumentText();
    });

    this.btnExportDocx.addEventListener('click', () => {
      this.exportWordDocument('docx');
    });

    this.btnExportDoc.addEventListener('click', () => {
      this.exportWordDocument('doc');
    });

    // Live word count updater on editor input
    this.documentEditor.addEventListener('input', () => {
      this.updateStatistics();
    });
  }

  bindRibbonControls() {
    const exec = (cmd, val = null) => {
      document.execCommand(cmd, false, val);
      this.documentEditor.focus();
      this.updateStatistics();
    };

    document.getElementById('format-block')?.addEventListener('change', (e) => {
      exec('formatBlock', `<${e.target.value}>`);
    });

    document.getElementById('font-family')?.addEventListener('change', (e) => {
      exec('fontName', e.target.value);
    });

    document.getElementById('font-size')?.addEventListener('change', (e) => {
      exec('fontSize', e.target.value);
    });

    document.getElementById('cmd-bold')?.addEventListener('click', () => exec('bold'));
    document.getElementById('cmd-italic')?.addEventListener('click', () => exec('italic'));
    document.getElementById('cmd-underline')?.addEventListener('click', () => exec('underline'));
    document.getElementById('cmd-strike')?.addEventListener('click', () => exec('strikeThrough'));

    document.getElementById('cmd-align-left')?.addEventListener('click', () => exec('justifyLeft'));
    document.getElementById('cmd-align-center')?.addEventListener('click', () => exec('justifyCenter'));
    document.getElementById('cmd-align-right')?.addEventListener('click', () => exec('justifyRight'));

    document.getElementById('cmd-ul')?.addEventListener('click', () => exec('insertUnorderedList'));
    document.getElementById('cmd-ol')?.addEventListener('click', () => exec('insertOrderedList'));
    document.getElementById('cmd-clear')?.addEventListener('click', () => exec('removeFormat'));
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
    this.documentEditor.innerHTML = '';
    this.progressPanel.style.display = 'none';
    this.workspaceArea.style.display = 'none';
    this.uploadZone.style.display = 'flex';
    this.pageCount = 0;
  }

  async processFile(file) {
    if (this.isProcessing) return;
    this.isProcessing = true;
    this.currentFileName = file.name.replace(/\.[^/.]+$/, '');
    this.docFilename.textContent = file.name;

    this.showProgress();
    this.updateProgress(5, 'Opening PDF Document...', 'Loading binary stream');

    try {
      if (!window.pdfjsLib) {
        throw new Error('PDF.js library is not loaded properly.');
      }

      const arrayBuffer = await file.arrayBuffer();
      const loadingTask = window.pdfjsLib.getDocument({ data: arrayBuffer });
      const pdf = await loadingTask.promise;

      this.pageCount = pdf.numPages;
      this.updateProgress(20, 'Reading Pages...', `Total pages detected: ${this.pageCount}`);

      let fullDocumentHtml = '';

      for (let pageNum = 1; pageNum <= this.pageCount; pageNum++) {
        const pagePercent = 20 + (pageNum / this.pageCount) * 70;
        this.updateProgress(pagePercent, `Processing Page ${pageNum} of ${this.pageCount}`, 'Extracting text blocks and layout geometry...');

        const page = await pdf.getPage(pageNum);
        const textContent = await page.getTextContent({ normalizeWhitespace: true });
        const viewport = page.getViewport({ scale: 1.0 });

        const pageHtml = this.parsePageTextContent(textContent.items, viewport, pageNum);

        if (pageNum > 1) {
          fullDocumentHtml += `<hr class="doc-page-divider" data-page-label="Page ${pageNum} of ${this.pageCount}">`;
        }
        fullDocumentHtml += `<div class="doc-page-content" data-page="${pageNum}">${pageHtml}</div>`;
      }

      this.updateProgress(95, 'Finalizing Word Document Layout...', 'Structuring styles and typography');
      
      this.documentEditor.innerHTML = fullDocumentHtml || '<p>No readable text found in document.</p>';
      this.updateStatistics();

      setTimeout(() => {
        this.showWorkspace();
        this.isProcessing = false;
      }, 300);

    } catch (err) {
      console.error(err);
      alert('Error parsing PDF: ' + err.message);
      this.resetWorkspace();
      this.isProcessing = false;
    }
  }

  parsePageTextContent(items, viewport, pageNum) {
    if (!items || items.length === 0) {
      return '<p style="color:#94a3b8; font-style:italic;">[Blank Page]</p>';
    }

    // Filter valid text items
    const validItems = items.filter(it => it.str && it.str.trim().length > 0).map(it => {
      const transform = it.transform;
      // In PDF coordinate system, origin is bottom-left
      const x = transform[4];
      const y = transform[5];
      const width = it.width || 0;
      const height = it.height || 10;
      // Estimate font size
      const fontSize = Math.hypot(transform[0], transform[1]) || height;

      return {
        str: it.str,
        x: x,
        y: y,
        width: width,
        height: height,
        fontSize: fontSize,
        fontName: it.fontName || ''
      };
    });

    if (validItems.length === 0) {
      return '<p style="color:#94a3b8; font-style:italic;">[Blank Page]</p>';
    }

    // Determine baseline body font size (median of font sizes)
    const sortedSizes = validItems.map(i => i.fontSize).sort((a, b) => a - b);
    const medianFontSize = sortedSizes[Math.floor(sortedSizes.length / 2)] || 11;

    // Cluster items into horizontal lines (y-coordinates tolerance)
    const lines = [];
    const lineTolerance = 4.0;

    // Sort items by y descending (top of page first), then x ascending
    const sortedItems = [...validItems].sort((a, b) => {
      if (Math.abs(a.y - b.y) <= lineTolerance) {
        return a.x - b.x;
      }
      return b.y - a.y;
    });

    let currentLine = [];
    let currentY = null;

    sortedItems.forEach(item => {
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

    // Detect structural elements: Headings, Tables, Lists, Paragraphs
    let outputHtml = '';
    let i = 0;

    while (i < lines.length) {
      const line = lines[i];

      // Check for Table: Consecutive lines having multiple columns with aligned or spaced items
      if (this.isTableCandidate(lines, i)) {
        const { tableHtml, nextIndex } = this.extractTable(lines, i);
        outputHtml += tableHtml;
        i = nextIndex;
        continue;
      }

      // Merge text items in single line
      const lineText = line.map(it => it.str).join(' ').trim();
      const avgFontSize = line.reduce((acc, it) => acc + it.fontSize, 0) / line.length;

      // Check for Headings
      if (avgFontSize >= medianFontSize * 1.55 && lineText.length < 120) {
        outputHtml += `<h1>${this.escapeHtml(lineText)}</h1>`;
        i++;
        continue;
      } else if (avgFontSize >= medianFontSize * 1.25 && lineText.length < 160) {
        outputHtml += `<h2>${this.escapeHtml(lineText)}</h2>`;
        i++;
        continue;
      }

      // Check for Lists (bullets or numbered)
      const bulletMatch = lineText.match(/^([•\-\*\u2022\u25E6]|\d+[\.\)])\s+(.*)/);
      if (bulletMatch) {
        const isNumbered = /^\d+[\.\)]/.test(bulletMatch[1]);
        const listTag = isNumbered ? 'ol' : 'ul';
        let listItemsHtml = `<li>${this.escapeHtml(bulletMatch[2])}</li>`;
        i++;

        // Gather following list items
        while (i < lines.length) {
          const nextLineText = lines[i].map(it => it.str).join(' ').trim();
          const nextBulletMatch = nextLineText.match(/^([•\-\*\u2022\u25E6]|\d+[\.\)])\s+(.*)/);
          if (nextBulletMatch) {
            listItemsHtml += `<li>${this.escapeHtml(nextBulletMatch[2])}</li>`;
            i++;
          } else {
            break;
          }
        }
        outputHtml += `<${listTag}>${listItemsHtml}</${listTag}>`;
        continue;
      }

      // Standard Paragraph
      let paragraphLines = [lineText];
      i++;

      // Check if subsequent lines should be grouped into same paragraph
      while (i < lines.length) {
        const nextLine = lines[i];
        const nextText = nextLine.map(it => it.str).join(' ').trim();
        const nextAvgFontSize = nextLine.reduce((acc, it) => acc + it.fontSize, 0) / nextLine.length;

        // Break paragraph if next line is heading, list, or table
        if (nextAvgFontSize >= medianFontSize * 1.25 ||
            /^([•\-\*\u2022\u25E6]|\d+[\.\)])\s+/.test(nextText) ||
            this.isTableCandidate(lines, i)) {
          break;
        }

        paragraphLines.push(nextText);
        i++;

        // Stop paragraph if current line ends with a period, question mark, or colon and has empty space
        if (/[.?!:]$/.test(nextText) && paragraphLines.length >= 4) {
          break;
        }
      }

      outputHtml += `<p>${this.escapeHtml(paragraphLines.join(' '))}</p>`;
    }

    return outputHtml;
  }

  isTableCandidate(lines, index) {
    if (index >= lines.length) return false;
    const line = lines[index];
    // A line with at least 3 distinct spatial items, or 2 items with a large horizontal gap (> 60)
    if (line.length >= 3) return true;
    if (line.length === 2) {
      const gap = line[1].x - (line[0].x + line[0].width);
      if (gap > 50) return true;
    }
    return false;
  }

  extractTable(lines, startIndex) {
    let i = startIndex;
    const tableRows = [];

    while (i < lines.length && this.isTableCandidate(lines, i)) {
      const rowLine = lines[i];
      // Build columns by clustering items that are close or splitting on gaps
      const cells = [];
      let currentCellText = [];
      let lastXEnd = null;

      rowLine.forEach(it => {
        if (lastXEnd === null || (it.x - lastXEnd) < 25) {
          currentCellText.push(it.str);
        } else {
          cells.push(currentCellText.join(' ').trim());
          currentCellText = [it.str];
        }
        lastXEnd = it.x + it.width;
      });

      if (currentCellText.length > 0) {
        cells.push(currentCellText.join(' ').trim());
      }

      tableRows.push(cells);
      i++;

      // Max 40 rows per single table block to prevent runaway
      if (tableRows.length > 40) break;
    }

    if (tableRows.length === 0) {
      return { tableHtml: '', nextIndex: startIndex + 1 };
    }

    // Determine max columns
    const maxCols = Math.max(...tableRows.map(r => r.length));
    let tableHtml = '<table border="1">';

    tableRows.forEach((row, rowIdx) => {
      tableHtml += '<tr>';
      for (let colIdx = 0; colIdx < maxCols; colIdx++) {
        const val = this.escapeHtml(row[colIdx] || '');
        const tag = (rowIdx === 0) ? 'th' : 'td';
        tableHtml += `<${tag}>${val}</${tag}>`;
      }
      tableHtml += '</tr>';
    });

    tableHtml += '</table>';
    return { tableHtml, nextIndex: i };
  }

  escapeHtml(str) {
    if (!str) return '';
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  updateStatistics() {
    const text = this.documentEditor.innerText || '';
    const words = text.trim() ? text.trim().split(/\s+/).length : 0;
    const chars = text.length;
    const paragraphs = this.documentEditor.querySelectorAll('p, h1, h2, h3, li, tr').length;

    this.metaWords.textContent = `${words.toLocaleString()} Words`;
    this.metaChars.textContent = `${chars.toLocaleString()} Chars`;
    this.metaPages.textContent = `${this.pageCount || 1} Page${this.pageCount === 1 ? '' : 's'}`;

    this.statusCounts.textContent = `Pages: ${this.pageCount || 1} | Words: ${words.toLocaleString()} | Characters: ${chars.toLocaleString()} | Elements: ${paragraphs}`;
  }

  copyDocumentText() {
    const text = this.documentEditor.innerText;
    navigator.clipboard.writeText(text).then(() => {
      const origHtml = this.btnCopyText.innerHTML;
      this.btnCopyText.innerHTML = `
        <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" stroke-width="2" fill="none"><polyline points="20 6 9 17 4 12"></polyline></svg>
        Copied!
      `;
      setTimeout(() => {
        this.btnCopyText.innerHTML = origHtml;
      }, 2000);
    }).catch(err => {
      alert('Could not copy to clipboard: ' + err.message);
    });
  }

  exportWordDocument(format = 'docx') {
    const title = this.currentFileName || 'Converted-Document';
    const editorContent = this.documentEditor.innerHTML;

    // Clean up internal editor attributes and prepare Word-ready HTML
    const cleanedContent = editorContent
      .replace(/<hr class="doc-page-divider"[^>]*>/gi, '<br clear="all" style="page-break-before:always; mso-special-character:line-break;">');

    // Build Microsoft Word HTML/XML envelope
    const wordDocumentXml = `<!DOCTYPE html>
<html xmlns:o='urn:schemas-microsoft-com:office:office'
      xmlns:w='urn:schemas-microsoft-com:office:word'
      xmlns='http://www.w3.org/TR/REC-html40'>
<head>
  <meta charset='utf-8'>
  <title>${this.escapeHtml(title)}</title>
  <!--[if gte mso 9]>
  <xml>
    <w:WordDocument>
      <w:View>Print</w:View>
      <w:Zoom>100</w:Zoom>
      <w:DoNotOptimizeForBrowser/>
    </w:WordDocument>
  </xml>
  <![endif]-->
  <style>
    @page Section1 {
      size: 8.5in 11.0in;
      margin: 1.0in 1.0in 1.0in 1.0in;
      mso-header-margin: 0.5in;
      mso-footer-margin: 0.5in;
      mso-paper-source: 0;
    }
    div.Section1 {
      page: Section1;
    }
    body {
      font-family: 'Calibri', 'Arial', sans-serif;
      font-size: 11pt;
      line-height: 1.5;
      color: #1a1a1a;
      background: #ffffff;
    }
    h1 {
      font-size: 20pt;
      font-weight: bold;
      color: #1e3a8a;
      margin: 16pt 0 6pt 0;
      border-bottom: 1.5pt solid #cbd5e1;
      padding-bottom: 4pt;
    }
    h2 {
      font-size: 15pt;
      font-weight: bold;
      color: #1e40af;
      margin: 12pt 0 4pt 0;
    }
    h3 {
      font-size: 12pt;
      font-weight: bold;
      color: #334155;
      margin: 8pt 0 2pt 0;
    }
    p {
      margin: 0 0 8pt 0;
      text-align: justify;
      line-height: 1.5;
    }
    table {
      border-collapse: collapse;
      width: 100%;
      margin: 10pt 0;
      font-size: 10pt;
    }
    table, th, td {
      border: 1px solid #94a3b8;
    }
    th, td {
      padding: 6pt 8pt;
      text-align: left;
    }
    th {
      background-color: #f1f5f9;
      font-weight: bold;
      color: #0f172a;
    }
    ul, ol {
      margin: 0 0 8pt 20pt;
    }
    li {
      margin-bottom: 3pt;
    }
    blockquote {
      border-left: 3pt solid #3b82f6;
      padding-left: 8pt;
      margin: 8pt 0;
      color: #475569;
      font-style: italic;
    }
  </style>
</head>
<body>
  <div class="Section1">
    ${cleanedContent}
  </div>
</body>
</html>`;

    // Choose MIME type according to format
    const mimeType = (format === 'docx')
      ? 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
      : 'application/msword';

    const blob = new Blob(['\ufeff', wordDocumentXml], { type: `${mimeType};charset=utf-8` });
    const url = URL.createObjectURL(blob);

    const downloadLink = document.createElement('a');
    downloadLink.href = url;
    downloadLink.download = `${title}.${format}`;
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);

    setTimeout(() => URL.revokeObjectURL(url), 4000);
  }

  loadSampleDocument() {
    this.currentFileName = 'Executive-Summary-Report';
    this.docFilename.textContent = 'Executive-Summary-Report.pdf';
    this.pageCount = 2;

    const sampleHtml = `
      <div class="doc-page-content" data-page="1">
        <h1>Global Technology Strategy Report</h1>
        <p>This report provides an executive overview of organizational achievements, technical architecture evolution, and digital roadmap milestones achieved during the past fiscal year.</p>
        
        <h2>Key Accomplishments</h2>
        <ul>
          <li>Migrated mission-critical legacy applications to modern micro-frontend infrastructure.</li>
          <li>Achieved 99.99% system availability across global distributed server clusters.</li>
          <li>Decreased document processing latency by 68% using client-side WebAssembly and JavaScript engines.</li>
          <li>Expanded real-time collaborative workspace capabilities across 14 enterprise divisions.</li>
        </ul>

        <h2>Strategic Performance Indicators</h2>
        <table border="1">
          <thead>
            <tr>
              <th>Strategic Initiative</th>
              <th>Target Horizon</th>
              <th>Completion Rate</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Cloud Modernization Phase II</td>
              <td>Q2 FY2026</td>
              <td>94%</td>
              <td>On Schedule</td>
            </tr>
            <tr>
              <td>AI Integration Pipeline</td>
              <td>Q3 FY2026</td>
              <td>82%</td>
              <td>In Progress</td>
            </tr>
            <tr>
              <td>Automated Quality Assurance</td>
              <td>Q4 FY2026</td>
              <td>100%</td>
              <td>Completed</td>
            </tr>
          </tbody>
        </table>
      </div>

      <hr class="doc-page-divider" data-page-label="Page 2 of 2">

      <div class="doc-page-content" data-page="2">
        <h2>Next-Generation Architectural Principles</h2>
        <p>Our ongoing initiatives prioritize high resilience, client-side data privacy, and minimal runtime footprints. By prioritizing modern web standards such as ES modules, Web Components, and offline-first client processing, users retain full control over sensitive data assets.</p>
        
        <blockquote>
          "Empowering end users with secure, browser-native computation eliminates server dependencies, enhances data privacy, and delivers lightning-fast turnaround times."
        </blockquote>

        <h2>Roadmap Prioritization</h2>
        <ol>
          <li>Phase 1: Rollout of advanced PDF, Word, and Excel productivity utilities.</li>
          <li>Phase 2: Universal format interoperability across mobile and desktop browsers.</li>
          <li>Phase 3: Integration of offline machine intelligence models for smart document analysis.</li>
        </ol>
      </div>
    `;

    this.showWorkspace();
    this.documentEditor.innerHTML = sampleHtml;
    this.updateStatistics();
  }
}

// Initialize on DOM ready
document.addEventListener('DOMContentLoaded', () => {
  window.pdfToWordApp = new PdfToWordApp();
});