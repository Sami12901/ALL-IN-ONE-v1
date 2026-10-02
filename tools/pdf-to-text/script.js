// PDF to Text Extractor Logic - Layout Preserving & Live Search

// Configure PDF.js worker
if (window.pdfjsLib) {
  window.pdfjsLib.GlobalWorkerOptions.workerSrc = '../../assets/lib/pdf.worker.min.js';
}

class PdfToTextApp {
  constructor() {
    this.uploadZone = document.getElementById('upload-zone');
    this.fileInput = document.getElementById('file-input');
    this.btnBrowse = document.getElementById('btn-browse');
    this.progressBox = document.getElementById('progress-box');
    this.progressStatus = document.getElementById('progress-status');
    this.progressPercent = document.getElementById('progress-percent');
    this.progressBarFill = document.getElementById('progress-bar-fill');
    this.workspaceContent = document.getElementById('workspace-content');

    this.docName = document.getElementById('doc-name');
    this.docMeta = document.getElementById('doc-meta');
    this.btnChangeFile = document.getElementById('btn-change-file');

    this.kpiTotalWords = document.getElementById('kpi-total-words');
    this.kpiTotalChars = document.getElementById('kpi-total-chars');
    this.kpiReadingTime = document.getElementById('kpi-reading-time');
    this.kpiTotalPages = document.getElementById('kpi-total-pages');

    this.inputSearchText = document.getElementById('input-search-text');
    this.searchMatchesIndicator = document.getElementById('search-matches-indicator');
    this.btnSearchPrev = document.getElementById('btn-search-prev');
    this.btnSearchNext = document.getElementById('btn-search-next');

    this.btnCopyClipboard = document.getElementById('btn-copy-clipboard');
    this.copyBtnText = document.getElementById('copy-btn-text');
    this.btnDownloadTxt = document.getElementById('btn-download-txt');
    this.btnDownloadMd = document.getElementById('btn-download-md');

    this.textContentPane = document.getElementById('text-content-pane');

    // State
    this.currentFile = null;
    this.pdfJsDoc = null;
    this.totalPages = 0;
    this.pagesData = []; // { pageNumber, text }
    this.rawFullText = '';
    this.matches = [];
    this.currentMatchIdx = -1;

    this.initEventListeners();
  }

  initEventListeners() {
    this.btnBrowse.addEventListener('click', () => this.fileInput.click());
    this.fileInput.addEventListener('change', (e) => {
      if (e.target.files && e.target.files[0]) {
        this.processFile(e.target.files[0]);
      }
    });

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

    this.btnChangeFile.addEventListener('click', () => {
      this.currentFile = null;
      this.pdfJsDoc = null;
      this.pagesData = [];
      this.rawFullText = '';
      this.matches = [];
      this.currentMatchIdx = -1;
      this.fileInput.value = '';
      this.inputSearchText.value = '';
      this.workspaceContent.style.display = 'none';
      this.uploadZone.style.display = 'block';
      this.textContentPane.innerHTML = '';
    });

    // Live search input
    this.inputSearchText.addEventListener('input', () => this.performSearch());
    this.btnSearchPrev.addEventListener('click', () => this.navigateMatch(-1));
    this.btnSearchNext.addEventListener('click', () => this.navigateMatch(1));
    this.inputSearchText.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        this.navigateMatch(e.shiftKey ? -1 : 1);
      }
    });

    // Copy to clipboard
    this.btnCopyClipboard.addEventListener('click', () => this.copyToClipboard());

    // Export downloads
    this.btnDownloadTxt.addEventListener('click', () => this.downloadTxt());
    this.btnDownloadMd.addEventListener('click', () => this.downloadMd());
  }

  formatBytes(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  async processFile(file) {
    if (!file || (file.type && file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf'))) {
      alert('Please select a valid PDF document.');
      return;
    }

    this.currentFile = file;
    this.uploadZone.style.display = 'none';
    this.progressBox.style.display = 'flex';
    this.progressBarFill.style.width = '0%';
    this.progressPercent.textContent = '0%';
    this.progressStatus.textContent = `Loading "${file.name}"...`;

    try {
      const arrayBuffer = await file.arrayBuffer();
      this.pdfJsDoc = await window.pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      this.totalPages = this.pdfJsDoc.numPages;

      this.docName.textContent = file.name;
      this.docMeta.textContent = `${this.formatBytes(file.size)} \u2022 ${this.totalPages} ${this.totalPages === 1 ? 'page' : 'pages'}`;
      this.kpiTotalPages.textContent = this.totalPages;

      // Extract text page by page
      this.pagesData = [];
      let combinedText = '';

      for (let p = 1; p <= this.totalPages; p++) {
        const pct = Math.round(((p - 1) / this.totalPages) * 100);
        this.progressBarFill.style.width = `${pct}%`;
        this.progressPercent.textContent = `${pct}%`;
        this.progressStatus.textContent = `Extracting text from page ${p} of ${this.totalPages}...`;

        await new Promise(r => setTimeout(r, 5));

        const page = await this.pdfJsDoc.getPage(p);
        const textContent = await page.getTextContent();
        const pageText = this.buildPageText(textContent);

        this.pagesData.push({
          pageNumber: p,
          text: pageText
        });

        if (combinedText.length > 0) {
          combinedText += '\n\n';
        }
        combinedText += `--- PAGE ${p} ---\n\n` + pageText;
      }

      this.progressBarFill.style.width = '100%';
      this.progressPercent.textContent = '100%';
      this.progressStatus.textContent = 'Text extraction complete!';

      this.rawFullText = combinedText;

      // Update statistics
      this.updateStatistics();

      // Show workspace and render text
      this.workspaceContent.style.display = 'flex';
      this.renderText();
    } catch (err) {
      console.error('Text extraction failed:', err);
      alert('Failed to extract text from PDF: ' + (err.message || 'Unknown error.'));
      this.btnChangeFile.click();
    } finally {
      this.progressBox.style.display = 'none';
    }
  }

  buildPageText(textContent) {
    if (!textContent || !textContent.items || textContent.items.length === 0) {
      return '[No selectable text found on this page]';
    }

    // Sort items vertically (top to bottom), then horizontally (left to right)
    const items = textContent.items.slice().sort((a, b) => {
      const yA = a.transform[5];
      const yB = b.transform[5];
      // Note: PDF y=0 is at bottom, so larger y is higher on the page
      if (Math.abs(yA - yB) > 4) {
        return yB - yA;
      }
      return a.transform[4] - b.transform[4];
    });

    let output = '';
    let lastY = null;
    let lastX = null;
    let lastWidth = 0;
    let lastHeight = 12;

    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      const str = item.str;
      if (!str) continue;

      const currX = item.transform[4];
      const currY = item.transform[5];
      const currHeight = Math.abs(item.transform[3]) || item.height || 12;

      if (lastY !== null) {
        const yDelta = Math.abs(lastY - currY);

        if (yDelta > currHeight * 1.5) {
          // Paragraph break
          output += '\n\n';
        } else if (yDelta > 4) {
          // Line break
          output += '\n';
        } else {
          // Same line - check if a space is needed
          const xGap = currX - (lastX + lastWidth);
          if (xGap > 2 && !output.endsWith(' ') && !str.startsWith(' ')) {
            output += ' ';
          }
        }
      }

      output += str;
      lastY = currY;
      lastX = currX;
      lastWidth = item.width || 0;
      lastHeight = currHeight;
    }

    return output.trim();
  }

  updateStatistics() {
    // Count words across all pages
    const allWords = this.pagesData
      .map(p => p.text)
      .join(' ')
      .trim()
      .split(/\s+/)
      .filter(w => w.length > 0 && w !== '[No' && w !== 'selectable');

    const totalWords = allWords.length;
    let totalChars = 0;
    this.pagesData.forEach(p => {
      totalChars += p.text.length;
    });

    const readingTimeMins = Math.max(1, Math.ceil(totalWords / 200));

    this.kpiTotalWords.textContent = totalWords.toLocaleString();
    this.kpiTotalChars.textContent = totalChars.toLocaleString();
    this.kpiReadingTime.textContent = `${readingTimeMins} min${readingTimeMins === 1 ? '' : 's'}`;
  }

  renderText() {
    const query = this.inputSearchText.value.trim();
    this.textContentPane.innerHTML = '';

    if (!query) {
      // Normal render without highlighting
      this.searchMatchesIndicator.textContent = '0 matches';
      this.btnSearchPrev.disabled = true;
      this.btnSearchNext.disabled = true;
      this.matches = [];
      this.currentMatchIdx = -1;

      this.pagesData.forEach((p, idx) => {
        if (idx > 0) {
          const sep = document.createElement('div');
          sep.className = 'page-separator';
          sep.textContent = `\u2014\u2014\u2014 PAGE ${p.pageNumber} \u2014\u2014\u2014`;
          this.textContentPane.appendChild(sep);
        } else {
          const firstSep = document.createElement('div');
          firstSep.className = 'page-separator';
          firstSep.style.marginTop = '0';
          firstSep.textContent = `\u2014\u2014\u2014 PAGE ${p.pageNumber} \u2014\u2014\u2014`;
          this.textContentPane.appendChild(firstSep);
        }

        const textNode = document.createTextNode(p.text + '\n');
        this.textContentPane.appendChild(textNode);
      });
      return;
    }

    // Search query active: escape HTML and insert <mark> tags
    const escapedQuery = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(escapedQuery, 'gi');

    let totalMatches = 0;

    this.pagesData.forEach((p, idx) => {
      const sep = document.createElement('div');
      sep.className = 'page-separator';
      if (idx === 0) sep.style.marginTop = '0';
      sep.textContent = `\u2014\u2014\u2014 PAGE ${p.pageNumber} \u2014\u2014\u2014`;
      this.textContentPane.appendChild(sep);

      const pageDiv = document.createElement('div');
      const safeText = this.escapeHtml(p.text);

      const highlightedHtml = safeText.replace(regex, (match) => {
        const markHtml = `<mark class="search-match" data-match-id="${totalMatches}">${match}</mark>`;
        totalMatches++;
        return markHtml;
      });

      pageDiv.innerHTML = highlightedHtml;
      this.textContentPane.appendChild(pageDiv);
    });

    this.matches = Array.from(this.textContentPane.querySelectorAll('mark.search-match'));

    if (totalMatches > 0) {
      this.currentMatchIdx = 0;
      this.searchMatchesIndicator.textContent = `1 of ${totalMatches} matches`;
      this.btnSearchPrev.disabled = false;
      this.btnSearchNext.disabled = false;
      this.highlightCurrentMatch();
    } else {
      this.currentMatchIdx = -1;
      this.searchMatchesIndicator.textContent = '0 matches';
      this.btnSearchPrev.disabled = true;
      this.btnSearchNext.disabled = true;
    }
  }

  performSearch() {
    this.renderText();
  }

  navigateMatch(direction) {
    if (!this.matches.length) return;
    this.currentMatchIdx += direction;

    if (this.currentMatchIdx >= this.matches.length) {
      this.currentMatchIdx = 0;
    } else if (this.currentMatchIdx < 0) {
      this.currentMatchIdx = this.matches.length - 1;
    }

    this.searchMatchesIndicator.textContent = `${this.currentMatchIdx + 1} of ${this.matches.length} matches`;
    this.highlightCurrentMatch();
  }

  highlightCurrentMatch() {
    this.matches.forEach((m, idx) => {
      if (idx === this.currentMatchIdx) {
        m.classList.add('current');
        m.scrollIntoView({ behavior: 'smooth', block: 'center' });
      } else {
        m.classList.remove('current');
      }
    });
  }

  async copyToClipboard() {
    if (!this.rawFullText) return;

    try {
      await navigator.clipboard.writeText(this.rawFullText);
      const originalText = this.copyBtnText.textContent;
      this.copyBtnText.textContent = 'Copied to Clipboard!';
      this.btnCopyClipboard.classList.add('btn-primary');
      this.btnCopyClipboard.classList.remove('btn-secondary');

      setTimeout(() => {
        this.copyBtnText.textContent = originalText;
        this.btnCopyClipboard.classList.remove('btn-primary');
        this.btnCopyClipboard.classList.add('btn-secondary');
      }, 2000);
    } catch (err) {
      console.warn('Clipboard write error:', err);
      // Fallback
      const textarea = document.createElement('textarea');
      textarea.value = this.rawFullText;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      alert('Text copied to clipboard!');
    }
  }

  downloadTxt() {
    if (!this.rawFullText) return;
    const baseName = this.currentFile ? this.currentFile.name.replace(/\.[^/.]+$/, '') : 'document';
    const blob = new Blob([this.rawFullText], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${baseName}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  downloadMd() {
    if (!this.pagesData.length) return;
    const baseName = this.currentFile ? this.currentFile.name.replace(/\.[^/.]+$/, '') : 'document';
    
    let md = `# ${baseName}\n\n`;
    md += `*Extracted with ALL IN ONE PDF to Text*\n`;
    md += `*Pages: ${this.totalPages} | Generated: ${new Date().toLocaleDateString()}*\n\n`;
    md += `---\n\n`;

    this.pagesData.forEach(p => {
      md += `## Page ${p.pageNumber}\n\n`;
      md += `${p.text}\n\n`;
      md += `---\n\n`;
    });

    const blob = new Blob([md], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${baseName}.md`;
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

// Instantiate on DOM ready
document.addEventListener('DOMContentLoaded', () => {
  new PdfToTextApp();
});