// Meta Tag Generator Logic

class MetaTagGenerator {
  constructor() {
    this.inTitle = document.getElementById('meta-title');
    this.inDesc = document.getElementById('meta-desc');
    this.inKeywords = document.getElementById('meta-keywords');
    this.inAuthor = document.getElementById('meta-author');
    this.inUrl = document.getElementById('meta-url');
    this.inImage = document.getElementById('meta-image');
    
    this.countTitle = document.getElementById('count-title');
    this.countDesc = document.getElementById('count-desc');
    
    this.outputBox = document.getElementById('output-code');
    this.btnCopy = document.getElementById('btn-copy');

    this.bindEvents();
    this.generate(); // Initial render
  }

  bindEvents() {
    const inputs = [this.inTitle, this.inDesc, this.inKeywords, this.inAuthor, this.inUrl, this.inImage];
    inputs.forEach(el => el.addEventListener('input', () => this.generate()));

    this.btnCopy.addEventListener('click', () => {
      if (!this.outputBox.textContent) return;
      navigator.clipboard.writeText(this.outputBox.textContent);
      const originalText = this.btnCopy.textContent;
      this.btnCopy.textContent = 'Copied to Clipboard!';
      setTimeout(() => this.btnCopy.textContent = originalText, 1500);
    });
  }

  generate() {
    const title = this.inTitle.value.trim();
    const desc = this.inDesc.value.trim();
    const keywords = this.inKeywords.value.trim();
    const author = this.inAuthor.value.trim();
    const url = this.inUrl.value.trim();
    const image = this.inImage.value.trim();

    this.updateCounters(title.length, desc.length);

    let html = `<!-- Primary Meta Tags -->\n`;
    html += `<title>${this.escapeHtml(title || 'Page Title')}</title>\n`;
    html += `<meta name="title" content="${this.escapeHtml(title)}">\n`;
    html += `<meta name="description" content="${this.escapeHtml(desc)}">\n`;
    
    if (keywords) {
      html += `<meta name="keywords" content="${this.escapeHtml(keywords)}">\n`;
    }
    if (author) {
      html += `<meta name="author" content="${this.escapeHtml(author)}">\n`;
    }

    html += `\n<!-- Open Graph / Facebook -->\n`;
    html += `<meta property="og:type" content="website">\n`;
    if (url) html += `<meta property="og:url" content="${this.escapeHtml(url)}">\n`;
    html += `<meta property="og:title" content="${this.escapeHtml(title)}">\n`;
    html += `<meta property="og:description" content="${this.escapeHtml(desc)}">\n`;
    if (image) html += `<meta property="og:image" content="${this.escapeHtml(image)}">\n`;

    html += `\n<!-- Twitter -->\n`;
    html += `<meta property="twitter:card" content="summary_large_image">\n`;
    if (url) html += `<meta property="twitter:url" content="${this.escapeHtml(url)}">\n`;
    html += `<meta property="twitter:title" content="${this.escapeHtml(title)}">\n`;
    html += `<meta property="twitter:description" content="${this.escapeHtml(desc)}">\n`;
    if (image) html += `<meta property="twitter:image" content="${this.escapeHtml(image)}">\n`;

    this.outputBox.textContent = html;
  }

  updateCounters(tLen, dLen) {
    this.countTitle.textContent = `${tLen} / 60`;
    this.countTitle.className = 'char-counter ' + (tLen > 60 ? 'danger' : tLen > 50 ? 'warning' : '');

    this.countDesc.textContent = `${dLen} / 160`;
    this.countDesc.className = 'char-counter ' + (dLen > 160 ? 'danger' : dLen > 140 ? 'warning' : '');
  }

  escapeHtml(unsafe) {
    return unsafe
         .replace(/&/g, "&amp;")
         .replace(/</g, "&lt;")
         .replace(/>/g, "&gt;")
         .replace(/"/g, "&quot;")
         .replace(/'/g, "&#039;");
  }
}

window.metaTagGenerator = new MetaTagGenerator();