// Word to PDF Converter - Client-Side Publishing Studio

class WordToPdfStudio {
  constructor() {
    this.wordEditor = document.getElementById('word-editor');
    this.btnUploadFile = document.getElementById('btn-upload-file');
    this.docFileInput = document.getElementById('doc-file-input');
    this.templateSelect = document.getElementById('template-select');
    this.btnClearDoc = document.getElementById('btn-clear-doc');
    this.btnCompilePdf = document.getElementById('btn-compile-pdf');

    this.pageSizeSelect = document.getElementById('page-size-select');
    this.pageOrientSelect = document.getElementById('page-orient-select');
    this.pageMarginSelect = document.getElementById('page-margin-select');
    this.chkPageNumbers = document.getElementById('chk-page-numbers');

    this.wordStats = document.getElementById('word-stats');
    this.dropOverlay = document.getElementById('drop-overlay');

    this.currentDocumentName = 'Document';
    this.isCompiling = false;

    this.bindEvents();
    this.bindToolbar();
    this.loadTemplate('report');
  }

  bindEvents() {
    this.btnUploadFile.addEventListener('click', () => {
      this.docFileInput.click();
    });

    this.docFileInput.addEventListener('change', (e) => {
      if (e.target.files && e.target.files[0]) {
        this.loadFile(e.target.files[0]);
      }
    });

    this.templateSelect.addEventListener('change', (e) => {
      this.loadTemplate(e.target.value);
    });

    this.btnClearDoc.addEventListener('click', () => {
      if (confirm('Are you sure you want to clear the current document?')) {
        this.wordEditor.innerHTML = '<p><br></p>';
        this.updateStats();
      }
    });

    // Page layout adjustments
    this.pageSizeSelect.addEventListener('change', () => this.applyLayoutOptions());
    this.pageOrientSelect.addEventListener('change', () => this.applyLayoutOptions());
    this.pageMarginSelect.addEventListener('change', () => this.applyLayoutOptions());

    // Word Editor input
    this.wordEditor.addEventListener('input', () => {
      this.updateStats();
    });

    // PDF compilation
    this.btnCompilePdf.addEventListener('click', () => {
      this.compilePdf();
    });

    // Drag and drop anywhere on window / drop area
    window.addEventListener('dragover', (e) => {
      e.preventDefault();
      this.dropOverlay.classList.add('active');
    });

    this.dropOverlay.addEventListener('dragleave', (e) => {
      if (e.relatedTarget === null) {
        this.dropOverlay.classList.remove('active');
      }
    });

    this.dropOverlay.addEventListener('drop', (e) => {
      e.preventDefault();
      this.dropOverlay.classList.remove('active');
      if (e.dataTransfer.files && e.dataTransfer.files[0]) {
        this.loadFile(e.dataTransfer.files[0]);
      }
    });
  }

  bindToolbar() {
    const exec = (cmd, val = null) => {
      document.execCommand(cmd, false, val);
      this.wordEditor.focus();
      this.updateStats();
    };

    document.getElementById('tool-format-block')?.addEventListener('change', (e) => {
      exec('formatBlock', `<${e.target.value}>`);
    });

    document.getElementById('tool-font-family')?.addEventListener('change', (e) => {
      exec('fontName', e.target.value);
    });

    document.getElementById('tool-font-size')?.addEventListener('change', (e) => {
      exec('fontSize', e.target.value);
    });

    document.getElementById('tool-bold')?.addEventListener('click', () => exec('bold'));
    document.getElementById('tool-italic')?.addEventListener('click', () => exec('italic'));
    document.getElementById('tool-underline')?.addEventListener('click', () => exec('underline'));
    document.getElementById('tool-strike')?.addEventListener('click', () => exec('strikeThrough'));

    document.getElementById('tool-color')?.addEventListener('input', (e) => exec('foreColor', e.target.value));
    document.getElementById('tool-hilite')?.addEventListener('input', (e) => exec('hiliteColor', e.target.value));

    document.getElementById('tool-align-left')?.addEventListener('click', () => exec('justifyLeft'));
    document.getElementById('tool-align-center')?.addEventListener('click', () => exec('justifyCenter'));
    document.getElementById('tool-align-right')?.addEventListener('click', () => exec('justifyRight'));
    document.getElementById('tool-align-justify')?.addEventListener('click', () => exec('justifyFull'));

    document.getElementById('tool-ul')?.addEventListener('click', () => exec('insertUnorderedList'));
    document.getElementById('tool-ol')?.addEventListener('click', () => exec('insertOrderedList'));

    document.getElementById('tool-insert-table')?.addEventListener('click', () => {
      this.insertTable(3, 3);
    });

    document.getElementById('tool-insert-hr')?.addEventListener('click', () => {
      exec('insertHorizontalRule');
    });

    document.getElementById('tool-page-break')?.addEventListener('click', () => {
      const pageBreakHtml = '<div class="html2pdf__page-break"></div><p><br></p>';
      exec('insertHTML', pageBreakHtml);
    });

    document.getElementById('tool-clear')?.addEventListener('click', () => exec('removeFormat'));
  }

  insertTable(rows, cols) {
    let tableHtml = '<table border="1"><thead><tr>';
    for (let c = 1; c <= cols; c++) {
      tableHtml += `<th>Header ${c}</th>`;
    }
    tableHtml += '</tr></thead><tbody>';

    for (let r = 1; r <= rows; r++) {
      tableHtml += '<tr>';
      for (let c = 1; c <= cols; c++) {
        tableHtml += `<td>Data ${r},${c}</td>`;
      }
      tableHtml += '</tr>';
    }
    tableHtml += '</tbody></table><p><br></p>';

    document.execCommand('insertHTML', false, tableHtml);
    this.updateStats();
  }

  applyLayoutOptions() {
    const orient = this.pageOrientSelect.value;
    const margin = this.pageMarginSelect.value;

    // Apply orientation
    if (orient === 'landscape') {
      this.wordEditor.classList.add('landscape');
    } else {
      this.wordEditor.classList.remove('landscape');
    }

    // Apply margins
    this.wordEditor.classList.remove('margin-narrow', 'margin-wide');
    if (margin === 'narrow') {
      this.wordEditor.classList.add('margin-narrow');
    } else if (margin === 'wide') {
      this.wordEditor.classList.add('margin-wide');
    }
  }

  async loadFile(file) {
    const ext = file.name.split('.').pop().toLowerCase();
    this.currentDocumentName = file.name.replace(/\.[^/.]+$/, '');

    try {
      if (ext === 'docx') {
        if (!window.JSZip) {
          throw new Error('JSZip is required to parse .docx files.');
        }
        const arrayBuffer = await file.arrayBuffer();
        const zip = await window.JSZip.loadAsync(arrayBuffer);
        const docXmlFile = zip.file('word/document.xml');

        if (!docXmlFile) {
          throw new Error('Invalid .docx file structure: word/document.xml not found.');
        }

        const docXmlText = await docXmlFile.async('text');
        const parsedHtml = this.parseDocxXml(docXmlText);
        this.wordEditor.innerHTML = parsedHtml;
      } else if (ext === 'txt') {
        const text = await file.text();
        const paragraphs = text.split(/\r?\n\r?\n/)
          .map(p => `<p>${this.escapeHtml(p.trim()).replace(/\n/g, '<br>')}</p>`)
          .join('');
        this.wordEditor.innerHTML = paragraphs || '<p><br></p>';
      } else if (ext === 'html' || ext === 'htm') {
        const html = await file.text();
        this.wordEditor.innerHTML = html;
      } else {
        alert('Unsupported file format. Please upload a .docx, .txt, or .html file.');
        return;
      }

      this.updateStats();
    } catch (err) {
      console.error(err);
      alert('Error reading document: ' + err.message);
    }
  }

  parseDocxXml(xmlText) {
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(xmlText, 'application/xml');
    const body = xmlDoc.getElementsByTagName('w:body')[0];
    if (!body) return '<p>Empty Word document</p>';

    let html = '';

    Array.from(body.children).forEach(node => {
      const nodeName = node.nodeName;

      if (nodeName === 'w:p') {
        // Paragraph
        let pText = '';
        let isHeading = false;
        let headingLevel = 1;

        // Check paragraph style
        const pStyle = node.getElementsByTagName('w:pStyle')[0];
        if (pStyle) {
          const val = pStyle.getAttribute('w:val') || '';
          if (/Heading1/i.test(val)) { isHeading = true; headingLevel = 1; }
          else if (/Heading2/i.test(val)) { isHeading = true; headingLevel = 2; }
          else if (/Heading3/i.test(val)) { isHeading = true; headingLevel = 3; }
        }

        // Check runs inside paragraph
        Array.from(node.getElementsByTagName('w:r')).forEach(r => {
          let text = '';
          const tTags = r.getElementsByTagName('w:t');
          for (let i = 0; i < tTags.length; i++) {
            text += tTags[i].textContent;
          }

          if (!text) return;

          let formattedText = this.escapeHtml(text);
          if (r.getElementsByTagName('w:b').length > 0) formattedText = `<b>${formattedText}</b>`;
          if (r.getElementsByTagName('w:i').length > 0) formattedText = `<i>${formattedText}</i>`;
          if (r.getElementsByTagName('w:u').length > 0) formattedText = `<u>${formattedText}</u>`;

          pText += formattedText;
        });

        if (pText.trim().length > 0) {
          if (isHeading) {
            html += `<h${headingLevel}>${pText}</h${headingLevel}>`;
          } else {
            html += `<p>${pText}</p>`;
          }
        }
      } else if (nodeName === 'w:tbl') {
        // Table
        html += '<table border="1">';
        Array.from(node.getElementsByTagName('w:tr')).forEach((tr, rIdx) => {
          html += '<tr>';
          Array.from(tr.getElementsByTagName('w:tc')).forEach(tc => {
            let cellText = '';
            Array.from(tc.getElementsByTagName('w:t')).forEach(t => {
              cellText += t.textContent + ' ';
            });
            const tag = (rIdx === 0) ? 'th' : 'td';
            html += `<${tag}>${this.escapeHtml(cellText.trim())}</${tag}>`;
          });
          html += '</tr>';
        });
        html += '</table>';
      }
    });

    return html || '<p>No content could be extracted from Word document.</p>';
  }

  updateStats() {
    const text = this.wordEditor.innerText || '';
    const words = text.trim() ? text.trim().split(/\s+/).length : 0;
    const chars = text.length;
    // Estimated pages based on average 300 words per page
    const estimatedPages = Math.max(Math.ceil(words / 300), 1);

    this.wordStats.textContent = `Words: ${words.toLocaleString()} | Characters: ${chars.toLocaleString()} | Estimated Pages: ${estimatedPages}`;
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

  loadTemplate(type) {
    switch (type) {
      case 'report':
        this.currentDocumentName = 'Executive-Report';
        this.wordEditor.innerHTML = `
          <h1>Quarterly Strategic Performance Report</h1>
          <p>This report highlights the operational achievements, computational throughput improvements, and architectural milestones achieved during the current quarterly cycle.</p>
          
          <h2>Key Deliverables &amp; Outcomes</h2>
          <ul>
            <li>Engineered fully client-side document processing suite with zero server dependencies.</li>
            <li>Improved runtime performance by 74% leveraging asynchronous worker threads.</li>
            <li>Maintained rigorous privacy standards with 100% offline data confinement.</li>
          </ul>

          <h2>Operational Performance Matrix</h2>
          <table border="1">
            <thead>
              <tr>
                <th>Strategic Metric</th>
                <th>Target Baseline</th>
                <th>Actual Result</th>
                <th>Variance</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Processing Latency</td>
                <td>&lt; 500 ms</td>
                <td>142 ms</td>
                <td style="color:#059669; font-weight:bold;">-71.6%</td>
              </tr>
              <tr>
                <td>PDF Quality Fidelity</td>
                <td>98.5%</td>
                <td>99.9%</td>
                <td style="color:#059669; font-weight:bold;">+1.4%</td>
              </tr>
              <tr>
                <td>Memory Consumption</td>
                <td>&lt; 64 MB</td>
                <td>28 MB</td>
                <td style="color:#059669; font-weight:bold;">-56.2%</td>
              </tr>
            </tbody>
          </table>

          <h2>Forward Outlook</h2>
          <p>By transitioning document workloads to client-side WebAssembly and modern JavaScript modules, organizations dramatically scale their processing bandwidth while reducing server operating overhead.</p>
        `;
        break;

      case 'letter':
        this.currentDocumentName = 'Business-Letter';
        this.wordEditor.innerHTML = `
          <p style="text-align: right; color: #64748b;">October 2, 2026</p>
          <p><strong>Executive Leadership Committee</strong><br>Global Operations Division<br>Suite 400, Innovation Tower</p>
          
          <h2>Subject: Strategic Authorization for Platform Modernization</h2>
          
          <p>Dear Committee Members,</p>
          <p>We are pleased to present the final roadmap proposal for our web productivity suite modernization. The new tools demonstrate unprecedented client-side capability, including rich document compilation, PDF transformation, and seamless interoperability.</p>
          
          <p>Our empirical benchmark testing confirms that client-side rendering satisfies all regulatory privacy standards while eliminating recurring cloud document processing expenses.</p>
          
          <p>We look forward to reviewing the final execution schedule during the forthcoming executive steering session.</p>
          
          <p>Sincerely,</p>
          <p><strong>Director of Enterprise Engineering</strong><br>ALL IN ONE Systems Architecture</p>
        `;
        break;

      case 'invoice':
        this.currentDocumentName = 'Invoice-Summary';
        this.wordEditor.innerHTML = `
          <h1>INVOICE SUMMARY</h1>
          <p style="color: #64748b;">Invoice Reference: <strong>INV-2026-8841</strong> | Date: <strong>2026-10-02</strong></p>
          <hr>
          <p><strong>Billed To:</strong> Acme Global Enterprises, Inc.<br><strong>Attention:</strong> Procurement &amp; Vendor Management</p>
          
          <table border="1">
            <thead>
              <tr>
                <th>Item Description</th>
                <th>Quantity</th>
                <th>Unit Rate (USD)</th>
                <th>Total (USD)</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Enterprise Client-Side Tool Suite License</td>
                <td>1</td>
                <td>$3,500.00</td>
                <td>$3,500.00</td>
              </tr>
              <tr>
                <td>Custom System Integration &amp; Optimization</td>
                <td>20 hrs</td>
                <td>$125.00</td>
                <td>$2,500.00</td>
              </tr>
              <tr>
                <td>Standard Architecture Support (1 Year)</td>
                <td>1</td>
                <td>$1,200.00</td>
                <td>$1,200.00</td>
              </tr>
              <tr>
                <td colspan="3" style="text-align: right; font-weight: bold;">Grand Total:</td>
                <td style="font-weight: bold; color: #1e3a8a;">$7,200.00</td>
              </tr>
            </tbody>
          </table>
          <p style="font-size: 9pt; color: #64748b; margin-top: 1.5rem;">Payment Terms: Net 30 days. Remittance instructions available on corporate portal.</p>
        `;
        break;

      case 'blank':
        this.currentDocumentName = 'Document';
        this.wordEditor.innerHTML = `
          <h1>Untitled Document</h1>
          <p>Start typing your document or use the toolbar above to add headings, tables, and lists...</p>
        `;
        break;
    }

    this.applyLayoutOptions();
    this.updateStats();
  }

  async compilePdf() {
    if (this.isCompiling) return;
    this.isCompiling = true;

    const originalBtnHtml = this.btnCompilePdf.innerHTML;
    this.btnCompilePdf.disabled = true;
    this.btnCompilePdf.innerHTML = `
      <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" stroke-width="2" fill="none" style="animation: spin 1s linear infinite;"><path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67"></path></svg>
      Compiling PDF...
    `;

    try {
      if (!window.html2pdf) {
        throw new Error('html2pdf library is not loaded.');
      }

      const pageSize = this.pageSizeSelect.value;
      const orientation = this.pageOrientSelect.value;
      const marginSetting = this.pageMarginSelect.value;
      const addPageNums = this.chkPageNumbers.checked;

      let marginValues = [18, 18, 18, 18]; // normal 18mm
      if (marginSetting === 'narrow') marginValues = [10, 10, 10, 10];
      if (marginSetting === 'wide') marginValues = [28, 28, 28, 28];

      // Clone editor content so we don't disrupt current editing view
      const clone = this.wordEditor.cloneNode(true);
      clone.style.width = orientation === 'landscape' ? '1050px' : '800px';
      clone.style.boxShadow = 'none';
      clone.style.margin = '0';
      clone.style.padding = '0';
      clone.style.background = '#ffffff';

      const opt = {
        margin: marginValues,
        filename: `${this.currentDocumentName}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2.0, useCORS: true, letterRendering: true },
        jsPDF: { unit: 'mm', format: pageSize, orientation: orientation }
      };

      // Generate PDF ArrayBuffer
      const pdfArrayBuffer = await window.html2pdf().from(clone).set(opt).outputPdf('arraybuffer');

      // Post-process with pdf-lib if page numbers or metadata are requested
      if (window.PDFLib && addPageNums) {
        const { PDFDocument, rgb, StandardFonts } = window.PDFLib;
        const pdfDoc = await PDFDocument.load(pdfArrayBuffer);
        const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
        const pages = pdfDoc.getPages();
        const total = pages.length;

        pages.forEach((page, idx) => {
          const { width, height } = page.getSize();
          const pageNumStr = `Page ${idx + 1} of ${total}`;
          const textWidth = font.widthOfTextAtSize(pageNumStr, 9);

          page.drawText(pageNumStr, {
            x: (width - textWidth) / 2,
            y: 12,
            size: 9,
            font: font,
            color: rgb(0.4, 0.4, 0.4)
          });
        });

        pdfDoc.setTitle(this.currentDocumentName);
        pdfDoc.setCreator('ALL IN ONE Word to PDF Studio');

        const finalPdfBytes = await pdfDoc.save();
        const blob = new Blob([finalPdfBytes], { type: 'application/pdf' });
        this.downloadBlob(blob, `${this.currentDocumentName}.pdf`);
      } else {
        const blob = new Blob([pdfArrayBuffer], { type: 'application/pdf' });
        this.downloadBlob(blob, `${this.currentDocumentName}.pdf`);
      }

    } catch (err) {
      console.error(err);
      alert('Error compiling PDF: ' + err.message);
    } finally {
      this.btnCompilePdf.disabled = false;
      this.btnCompilePdf.innerHTML = originalBtnHtml;
      this.isCompiling = false;
    }
  }

  downloadBlob(blob, filename) {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(url), 4000);
  }
}

// Initialize on DOM ready
document.addEventListener('DOMContentLoaded', () => {
  window.wordToPdfStudio = new WordToPdfStudio();
});