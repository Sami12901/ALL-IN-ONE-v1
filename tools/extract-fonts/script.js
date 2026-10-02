// Extract Fonts Logic - Client-Side PDF Font Inspector

// Configure PDF.js worker
if (window.pdfjsLib) {
  window.pdfjsLib.GlobalWorkerOptions.workerSrc = '../../assets/lib/pdf.worker.min.js';
}

const STANDARD_14_FONTS = new Set([
  'Times-Roman', 'Times-Bold', 'Times-Italic', 'Times-BoldItalic',
  'Helvetica', 'Helvetica-Bold', 'Helvetica-Oblique', 'Helvetica-BoldOblique',
  'Courier', 'Courier-Bold', 'Courier-Oblique', 'Courier-BoldOblique',
  'Symbol', 'ZapfDingbats'
]);

class FontExtractorApp {
  constructor() {
    this.uploadZone = document.getElementById('upload-zone');
    this.fileInput = document.getElementById('file-input');
    this.btnBrowse = document.getElementById('btn-browse');
    this.loadingState = document.getElementById('loading-state');
    this.loadingText = document.getElementById('loading-text');
    this.workspaceContent = document.getElementById('workspace-content');

    this.docName = document.getElementById('doc-name');
    this.docMeta = document.getElementById('doc-meta');
    this.btnChangeFile = document.getElementById('btn-change-file');

    this.kpiTotalFonts = document.getElementById('kpi-total-fonts');
    this.kpiEmbeddedRatio = document.getElementById('kpi-embedded-ratio');
    this.kpiEmbeddedSub = document.getElementById('kpi-embedded-sub');
    this.kpiUniqueFamilies = document.getElementById('kpi-unique-families');
    this.kpiFamiliesSub = document.getElementById('kpi-families-sub');
    this.kpiSystemFonts = document.getElementById('kpi-system-fonts');

    this.fontSearch = document.getElementById('font-search');
    this.fontFilterType = document.getElementById('font-filter-type');
    this.fontTableBody = document.getElementById('font-table-body');
    this.noFontsMatch = document.getElementById('no-fonts-match');

    this.btnExportJson = document.getElementById('btn-export-json');
    this.btnExportTxt = document.getElementById('btn-export-txt');

    this.currentFile = null;
    this.extractedFonts = [];
    this.totalPages = 0;

    this.initEventListeners();
  }

  initEventListeners() {
    // Browse button & file input
    this.btnBrowse.addEventListener('click', () => this.fileInput.click());
    this.fileInput.addEventListener('change', (e) => {
      if (e.target.files && e.target.files[0]) {
        this.processFile(e.target.files[0]);
      }
    });

    // Drag and Drop
    ['dragenter', 'dragover'].forEach(name => {
      this.uploadZone.addEventListener(name, (e) => {
        e.preventDefault();
        e.stopPropagation();
        this.uploadZone.classList.add('dragover');
      });
    });

    ['dragleave', 'drop'].forEach(name => {
      this.uploadZone.addEventListener(name, (e) => {
        e.preventDefault();
        e.stopPropagation();
        this.uploadZone.classList.remove('dragover');
      });
    });

    this.uploadZone.addEventListener('drop', (e) => {
      const files = e.dataTransfer.files;
      if (files && files.length > 0) {
        this.processFile(files[0]);
      }
    });

    // Change File
    this.btnChangeFile.addEventListener('click', () => {
      this.currentFile = null;
      this.extractedFonts = [];
      this.fileInput.value = '';
      this.workspaceContent.style.display = 'none';
      this.uploadZone.style.display = 'block';
    });

    // Search and Filter
    this.fontSearch.addEventListener('input', () => this.renderFilteredTable());
    this.fontFilterType.addEventListener('change', () => this.renderFilteredTable());

    // Export Buttons
    this.btnExportJson.addEventListener('click', () => this.exportJson());
    this.btnExportTxt.addEventListener('click', () => this.exportTxt());
  }

  formatBytes(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  sanitizeName(pdfName) {
    if (!pdfName) return 'Unknown';
    let str = typeof pdfName === 'string' ? pdfName : pdfName.toString();
    if (str.startsWith('/')) str = str.substring(1);
    // Replace standard PDF hex escapes like #20 -> space
    return str.replace(/#([0-9A-Fa-f]{2})/g, (_, hex) => String.fromCharCode(parseInt(hex, 16)));
  }

  cleanFamilyName(fontName) {
    let name = fontName.replace(/^[A-Z]{6}\+/, ''); // strip subset prefix
    // Common PostScript suffix cleanups
    name = name.replace(/,.*$/, '');
    const parts = name.split('-');
    return parts[0].trim();
  }

  async processFile(file) {
    if (!file || (file.type && file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf'))) {
      alert('Please select a valid PDF document.');
      return;
    }

    this.currentFile = file;
    this.uploadZone.style.display = 'none';
    this.loadingState.style.display = 'flex';
    this.loadingText.textContent = `Analyzing "${file.name}"...`;

    try {
      const arrayBuffer = await file.arrayBuffer();
      
      // 1. Load via PDF-lib for deep dictionary inspection
      let pdfDoc = null;
      try {
        if (window.PDFLib) {
          pdfDoc = await window.PDFLib.PDFDocument.load(arrayBuffer, { ignoreEncryption: true });
        }
      } catch (err) {
        console.warn('PDF-lib load warning:', err);
      }

      // 2. Load via PDF.js for page count and rendering metadata
      let pdfJsDoc = null;
      try {
        if (window.pdfjsLib) {
          pdfJsDoc = await window.pdfjsLib.getDocument({ data: arrayBuffer.slice(0) }).promise;
          this.totalPages = pdfJsDoc.numPages;
        }
      } catch (err) {
        console.warn('PDF.js load warning:', err);
      }

      if (pdfDoc && !this.totalPages) {
        this.totalPages = pdfDoc.getPageCount();
      }

      // Extract fonts
      this.extractedFonts = await this.extractAllFonts(pdfDoc, pdfJsDoc, arrayBuffer);

      // Render UI
      this.renderWorkspace();
    } catch (err) {
      console.error('Font extraction failed:', err);
      alert('Failed to analyze PDF fonts: ' + (err.message || 'Unknown error.'));
      this.btnChangeFile.click();
    } finally {
      this.loadingState.style.display = 'none';
    }
  }

  async extractAllFonts(pdfDoc, pdfJsDoc, arrayBuffer) {
    const fontsMap = new Map();

    // Strategy A: Deep PDF-lib Object Inspection
    if (pdfDoc && pdfDoc.context) {
      const context = pdfDoc.context;
      const indirectObjects = context.enumerateIndirectObjects();

      for (const [, obj] of indirectObjects) {
        if (!obj || !(obj instanceof window.PDFLib.PDFDict)) continue;

        const typeName = obj.get(window.PDFLib.PDFName.of('Type'));
        if (!typeName || typeName.toString() !== '/Font') continue;

        const baseFontObj = obj.get(window.PDFLib.PDFName.of('BaseFont'));
        const subtypeObj = obj.get(window.PDFLib.PDFName.of('Subtype'));
        const encodingObj = obj.get(window.PDFLib.PDFName.of('Encoding'));

        const rawFontName = baseFontObj ? this.sanitizeName(baseFontObj) : 'UnnamedFont';
        const subtype = subtypeObj ? this.sanitizeName(subtypeObj) : 'Unknown';
        
        let encoding = 'Standard';
        if (encodingObj) {
          if (encodingObj instanceof window.PDFLib.PDFName) {
            encoding = this.sanitizeName(encodingObj);
          } else if (encodingObj instanceof window.PDFLib.PDFDict) {
            encoding = 'Custom / Differences';
          } else {
            encoding = this.sanitizeName(encodingObj.toString());
          }
        }

        // Subset check: ABCDEF+FontName
        const isSubset = /^[A-Z]{6}\+/.test(rawFontName);
        const subsetPrefix = isSubset ? rawFontName.slice(0, 6) : null;
        const cleanName = rawFontName.replace(/^[A-Z]{6}\+/, '');
        const family = this.cleanFamilyName(cleanName);

        // Check FontDescriptor for embedded font streams
        let isEmbedded = false;
        let fontStreamData = null;
        let fontFormat = subtype;

        const inspectDescriptor = (descRef) => {
          if (!descRef) return;
          const desc = context.lookup(descRef);
          if (desc && desc instanceof window.PDFLib.PDFDict) {
            const fontFile = desc.get(window.PDFLib.PDFName.of('FontFile'));
            const fontFile2 = desc.get(window.PDFLib.PDFName.of('FontFile2'));
            const fontFile3 = desc.get(window.PDFLib.PDFName.of('FontFile3'));

            if (fontFile2) {
              isEmbedded = true;
              fontFormat = 'TrueType';
              try {
                const stream = context.lookup(fontFile2);
                if (stream && stream.getContents) fontStreamData = stream.getContents();
              } catch (_) {}
            } else if (fontFile3) {
              isEmbedded = true;
              const sub = desc.get(window.PDFLib.PDFName.of('Subtype')) || desc.get(window.PDFLib.PDFName.of('Subtype2'));
              fontFormat = sub ? this.sanitizeName(sub) : 'OpenType/CFF';
              try {
                const stream = context.lookup(fontFile3);
                if (stream && stream.getContents) fontStreamData = stream.getContents();
              } catch (_) {}
            } else if (fontFile) {
              isEmbedded = true;
              fontFormat = 'Type1';
              try {
                const stream = context.lookup(fontFile);
                if (stream && stream.getContents) fontStreamData = stream.getContents();
              } catch (_) {}
            }
          }
        };

        const descriptorRef = obj.get(window.PDFLib.PDFName.of('FontDescriptor'));
        if (descriptorRef) {
          inspectDescriptor(descriptorRef);
        }

        // For Type0 composite fonts, check DescendantFonts
        const descendants = obj.get(window.PDFLib.PDFName.of('DescendantFonts'));
        if (descendants) {
          const descList = context.lookup(descendants);
          if (descList && descList instanceof window.PDFLib.PDFArray) {
            for (let i = 0; i < descList.size(); i++) {
              const cidFontRef = descList.get(i);
              const cidFont = context.lookup(cidFontRef);
              if (cidFont && cidFont instanceof window.PDFLib.PDFDict) {
                const cidDescRef = cidFont.get(window.PDFLib.PDFName.of('FontDescriptor'));
                if (cidDescRef) inspectDescriptor(cidDescRef);
              }
            }
          }
        }

        // Check if standard 14
        const isStandard14 = STANDARD_14_FONTS.has(cleanName) || STANDARD_14_FONTS.has(rawFontName);

        let glyphsStatus = 'Referenced System';
        if (isEmbedded) {
          glyphsStatus = isSubset ? `Subsetted (${subsetPrefix})` : 'Fully Embedded';
        } else if (isStandard14) {
          glyphsStatus = 'Standard 14';
        }

        const fontEntry = {
          name: rawFontName,
          cleanName: cleanName,
          family: family,
          subtype: subtype,
          format: fontFormat,
          encoding: encoding,
          isEmbedded: isEmbedded,
          isSubset: isSubset,
          subsetPrefix: subsetPrefix,
          isStandard14: isStandard14,
          glyphsStatus: glyphsStatus,
          streamData: fontStreamData
        };

        const key = rawFontName + '___' + subtype;
        if (!fontsMap.has(key) || (!fontsMap.get(key).isEmbedded && isEmbedded)) {
          fontsMap.set(key, fontEntry);
        }
      }
    }

    // Strategy B: Supplemental PDF.js Font Extraction from page operators
    if (pdfJsDoc && pdfJsDoc.numPages > 0) {
      try {
        const pagesToScan = Math.min(pdfJsDoc.numPages, 30);
        for (let p = 1; p <= pagesToScan; p++) {
          const page = await pdfJsDoc.getPage(p);
          const opList = await page.getOperatorList();
          // opList.argsArray contains font definitions in some PDF.js versions
          if (page.commonObjs) {
            // PDF.js maintains font cache in commonObjs
            const objs = page.commonObjs._objs || {};
            for (const fontId in objs) {
              const f = objs[fontId];
              if (f && f.data && f.data.name) {
                const name = this.sanitizeName(f.data.name);
                const isSubset = /^[A-Z]{6}\+/.test(name);
                const cleanName = name.replace(/^[A-Z]{6}\+/, '');
                const key = name + '___' + (f.data.type || 'TrueType');
                if (!fontsMap.has(key)) {
                  fontsMap.set(key, {
                    name: name,
                    cleanName: cleanName,
                    family: this.cleanFamilyName(cleanName),
                    subtype: f.data.type || 'TrueType',
                    format: f.data.type || 'TrueType',
                    encoding: f.data.encoding || 'Built-in',
                    isEmbedded: !f.data.fallback,
                    isSubset: isSubset,
                    subsetPrefix: isSubset ? name.slice(0, 6) : null,
                    isStandard14: STANDARD_14_FONTS.has(cleanName),
                    glyphsStatus: !f.data.fallback ? (isSubset ? 'Subsetted' : 'Embedded') : 'System Standard',
                    streamData: null
                  });
                }
              }
            }
          }
        }
      } catch (err) {
        console.warn('PDF.js operator scan notice:', err);
      }
    }

    const result = Array.from(fontsMap.values());
    result.sort((a, b) => a.cleanName.localeCompare(b.cleanName));
    return result;
  }

  renderWorkspace() {
    this.workspaceContent.style.display = 'flex';
    this.docName.textContent = this.currentFile.name;
    this.docMeta.textContent = `${this.formatBytes(this.currentFile.size)} \u2022 ${this.totalPages} ${this.totalPages === 1 ? 'page' : 'pages'}`;

    const total = this.extractedFonts.length;
    const embeddedCount = this.extractedFonts.filter(f => f.isEmbedded).length;
    const embeddedPercent = total > 0 ? Math.round((embeddedCount / total) * 100) : 0;

    const uniqueFamilies = new Set(this.extractedFonts.map(f => f.family)).size;
    const systemCount = this.extractedFonts.filter(f => !f.isEmbedded).length;

    this.kpiTotalFonts.textContent = total;
    this.kpiEmbeddedRatio.textContent = `${embeddedPercent}%`;
    this.kpiEmbeddedSub.textContent = `${embeddedCount} of ${total} fonts embedded`;
    this.kpiUniqueFamilies.textContent = uniqueFamilies;
    this.kpiFamiliesSub.textContent = `${uniqueFamilies} distinct families`;
    this.kpiSystemFonts.textContent = systemCount;

    this.renderFilteredTable();
  }

  renderFilteredTable() {
    const query = this.fontSearch.value.trim().toLowerCase();
    const filter = this.fontFilterType.value;

    const filtered = this.extractedFonts.filter(font => {
      // Filter type
      if (filter === 'embedded' && !font.isEmbedded) return false;
      if (filter === 'system' && font.isEmbedded) return false;
      if (filter === 'subset' && !font.isSubset) return false;

      // Search query
      if (query) {
        const matchesName = font.name.toLowerCase().includes(query);
        const matchesClean = font.cleanName.toLowerCase().includes(query);
        const matchesSubtype = font.subtype.toLowerCase().includes(query);
        const matchesEncoding = font.encoding.toLowerCase().includes(query);
        const matchesStatus = font.glyphsStatus.toLowerCase().includes(query);
        if (!matchesName && !matchesClean && !matchesSubtype && !matchesEncoding && !matchesStatus) {
          return false;
        }
      }
      return true;
    });

    this.fontTableBody.innerHTML = '';

    if (filtered.length === 0) {
      this.noFontsMatch.style.display = 'block';
      return;
    }

    this.noFontsMatch.style.display = 'none';

    filtered.forEach((font, index) => {
      const tr = document.createElement('tr');

      // Font Name
      const tdName = document.createElement('td');
      tdName.innerHTML = `
        <div style="display: flex; flex-direction: column; gap: 0.2rem;">
          <div style="font-weight: 600; color: var(--text-primary); font-size: 0.95rem;">
            ${this.escapeHtml(font.cleanName)}
            ${font.isSubset ? `<span class="badge-sub">Subset: ${this.escapeHtml(font.subsetPrefix)}</span>` : ''}
          </div>
          <div style="font-family: monospace; font-size: 0.75rem; color: var(--text-secondary);">
            PS: ${this.escapeHtml(font.name)}
          </div>
        </div>
      `;

      // Subtype
      const tdSubtype = document.createElement('td');
      tdSubtype.innerHTML = `<span style="font-family: monospace; font-size: 0.825rem;">${this.escapeHtml(font.subtype)}</span>`;

      // Encoding
      const tdEncoding = document.createElement('td');
      tdEncoding.innerHTML = `<span style="font-family: monospace; font-size: 0.825rem; color: var(--text-secondary);">${this.escapeHtml(font.encoding)}</span>`;

      // Status
      const tdStatus = document.createElement('td');
      if (font.isEmbedded) {
        tdStatus.innerHTML = `<span class="badge badge-success"><svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="3"><polyline points="20 6 9 17 4 12"></polyline></svg> Embedded</span>`;
      } else if (font.isStandard14) {
        tdStatus.innerHTML = `<span class="badge badge-warning">Standard 14</span>`;
      } else {
        tdStatus.innerHTML = `<span class="badge badge-secondary">System Font</span>`;
      }

      // Glyphs
      const tdGlyphs = document.createElement('td');
      tdGlyphs.innerHTML = `<span style="font-size: 0.825rem; color: var(--text-secondary);">${this.escapeHtml(font.glyphsStatus)}</span>`;

      // Action
      const tdAction = document.createElement('td');
      tdAction.style.textAlign = 'right';

      if (font.streamData && font.streamData.length > 0) {
        const btnDownload = document.createElement('button');
        btnDownload.className = 'btn btn-secondary';
        btnDownload.style.padding = '0.35rem 0.75rem';
        btnDownload.style.fontSize = '0.75rem';
        btnDownload.innerHTML = `<svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg> Download`;
        btnDownload.title = `Download embedded ${font.cleanName} binary (${this.formatBytes(font.streamData.length)})`;
        btnDownload.addEventListener('click', () => this.downloadFontFile(font));
        tdAction.appendChild(btnDownload);
      } else {
        tdAction.innerHTML = `<span style="font-size: 0.75rem; color: var(--text-tertiary); font-style: italic;">Not extractable</span>`;
      }

      tr.appendChild(tdName);
      tr.appendChild(tdSubtype);
      tr.appendChild(tdEncoding);
      tr.appendChild(tdStatus);
      tr.appendChild(tdGlyphs);
      tr.appendChild(tdAction);

      this.fontTableBody.appendChild(tr);
    });
  }

  downloadFontFile(font) {
    if (!font.streamData) return;
    const ext = font.format.toLowerCase().includes('open') ? 'otf' : 'ttf';
    const blob = new Blob([font.streamData], { type: 'application/octet-stream' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${font.cleanName.replace(/\s+/g, '_')}.${ext}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  exportJson() {
    const report = {
      generator: 'ALL IN ONE PDF Font Inspector',
      timestamp: new Date().toISOString(),
      document: {
        filename: this.currentFile ? this.currentFile.name : 'document.pdf',
        fileSizeBytes: this.currentFile ? this.currentFile.size : 0,
        pageCount: this.totalPages
      },
      summary: {
        totalFonts: this.extractedFonts.length,
        embeddedCount: this.extractedFonts.filter(f => f.isEmbedded).length,
        systemCount: this.extractedFonts.filter(f => !f.isEmbedded).length,
        uniqueFamilies: Array.from(new Set(this.extractedFonts.map(f => f.family)))
      },
      fonts: this.extractedFonts.map(f => ({
        fontName: f.name,
        cleanName: f.cleanName,
        family: f.family,
        subtype: f.subtype,
        encoding: f.encoding,
        isEmbedded: f.isEmbedded,
        isSubset: f.isSubset,
        subsetPrefix: f.subsetPrefix,
        glyphsStatus: f.glyphsStatus,
        hasExtractableData: !!(f.streamData && f.streamData.length > 0)
      }))
    };

    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(report, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    const baseName = this.currentFile ? this.currentFile.name.replace(/\.[^/.]+$/, '') : 'document';
    downloadAnchor.setAttribute('download', `${baseName}-fonts.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  }

  exportTxt() {
    const baseName = this.currentFile ? this.currentFile.name.replace(/\.[^/.]+$/, '') : 'document';
    let txt = '==========================================================\n';
    txt += '            ALL IN ONE PDF FONT INSPECTION REPORT          \n';
    txt += '==========================================================\n\n';
    txt += `Document: ${this.currentFile ? this.currentFile.name : 'Unknown'}\n`;
    txt += `File Size: ${this.currentFile ? this.formatBytes(this.currentFile.size) : '0'}\n`;
    txt += `Total Pages: ${this.totalPages}\n`;
    txt += `Generated: ${new Date().toLocaleString()}\n`;
    txt += `Total Fonts: ${this.extractedFonts.length}\n`;
    const emb = this.extractedFonts.filter(f => f.isEmbedded).length;
    txt += `Embedded Fonts: ${emb} (${this.extractedFonts.length > 0 ? Math.round((emb / this.extractedFonts.length) * 100) : 0}%)\n\n`;
    txt += '----------------------------------------------------------\n';
    txt += 'FONT DETAILS\n';
    txt += '----------------------------------------------------------\n';

    this.extractedFonts.forEach((f, i) => {
      txt += `[${i + 1}] ${f.cleanName}\n`;
      txt += `    PostScript Name : ${f.name}\n`;
      txt += `    Family          : ${f.family}\n`;
      txt += `    Subtype         : ${f.subtype}\n`;
      txt += `    Encoding        : ${f.encoding}\n`;
      txt += `    Embedded        : ${f.isEmbedded ? 'YES' : 'NO'}\n`;
      txt += `    Glyphs Status   : ${f.glyphsStatus}\n`;
      txt += `    Extractable     : ${f.streamData ? 'YES (' + this.formatBytes(f.streamData.length) + ')' : 'NO'}\n\n`;
    });

    const blob = new Blob([txt], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${baseName}-fonts.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  escapeHtml(str) {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }
}

// Instantiate on DOM load
document.addEventListener('DOMContentLoaded', () => {
  new FontExtractorApp();
});