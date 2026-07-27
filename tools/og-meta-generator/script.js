// OG Meta Generator Logic

class OgMetaGenerator {
  constructor() {
    this.inTitle = document.getElementById('og-title');
    this.inDesc = document.getElementById('og-desc');
    this.inImage = document.getElementById('og-image');
    this.inUrl = document.getElementById('og-url');
    this.inType = document.getElementById('og-type');
    
    this.prevImg = document.getElementById('prev-img');
    this.prevDomain = document.getElementById('prev-domain');
    this.prevTitle = document.getElementById('prev-title');
    this.prevDesc = document.getElementById('prev-desc');

    this.outputBox = document.getElementById('output-code');
    this.btnCopy = document.getElementById('btn-copy');

    this.bindEvents();
    this.generate();
  }

  bindEvents() {
    const inputs = [this.inTitle, this.inDesc, this.inImage, this.inUrl, this.inType];
    inputs.forEach(el => el.addEventListener('input', () => this.generate()));

    this.btnCopy.addEventListener('click', () => {
      if (!this.outputBox.textContent) return;
      navigator.clipboard.writeText(this.outputBox.textContent);
      const originalText = this.btnCopy.textContent;
      this.btnCopy.textContent = 'Copied!';
      setTimeout(() => this.btnCopy.textContent = originalText, 1500);
    });
  }

  generate() {
    const title = this.inTitle.value.trim() || 'Catchy Article Title';
    const desc = this.inDesc.value.trim() || 'A brief summary of your awesome content...';
    const image = this.inImage.value.trim();
    const url = this.inUrl.value.trim() || 'https://example.com/article';
    const type = this.inType.value;

    // Update UI Preview
    this.prevTitle.textContent = title;
    this.prevDesc.textContent = desc;
    if (image) {
      this.prevImg.src = image;
    } else {
      // transparent 1x1 gif essentially triggers the onerror fallback to grey box
      this.prevImg.src = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';
    }
    
    try {
      this.prevDomain.textContent = new URL(url).hostname.toUpperCase();
    } catch(e) {
      this.prevDomain.textContent = 'EXAMPLE.COM';
    }

    // Generate Code
    let html = `<!-- Open Graph Meta Tags -->\n`;
    html += `<meta property="og:type" content="${type}">\n`;
    html += `<meta property="og:title" content="${this.escapeHtml(title)}">\n`;
    html += `<meta property="og:description" content="${this.escapeHtml(desc)}">\n`;
    html += `<meta property="og:url" content="${this.escapeHtml(url)}">\n`;
    if (image) {
      html += `<meta property="og:image" content="${this.escapeHtml(image)}">\n`;
    }

    html += `\n<!-- Twitter Meta Tags -->\n`;
    html += `<meta name="twitter:card" content="summary_large_image">\n`;
    html += `<meta name="twitter:title" content="${this.escapeHtml(title)}">\n`;
    html += `<meta name="twitter:description" content="${this.escapeHtml(desc)}">\n`;
    if (image) {
      html += `<meta name="twitter:image" content="${this.escapeHtml(image)}">\n`;
    }

    this.outputBox.textContent = html;
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

window.ogGenerator = new OgMetaGenerator();