// Sitemap Generator Logic

class SitemapGenerator {
  constructor() {
    this.inUrls = document.getElementById('in-urls');
    this.inFreq = document.getElementById('in-freq');
    this.inPriority = document.getElementById('in-priority');
    
    this.outputBox = document.getElementById('output-code');
    this.btnCopy = document.getElementById('btn-copy');

    this.bindEvents();
    this.generate();
  }

  bindEvents() {
    const inputs = [this.inUrls, this.inFreq, this.inPriority];
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
    const urls = this.inUrls.value.split('\n').map(u => u.trim()).filter(u => u !== '');
    const freq = this.inFreq.value;
    const priority = this.inPriority.value;
    
    // YYYY-MM-DD format
    const today = new Date().toISOString().split('T')[0];

    let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
    xml += `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;

    urls.forEach(url => {
      xml += `  <url>\n`;
      xml += `    <loc>${this.escapeHtml(url)}</loc>\n`;
      xml += `    <lastmod>${today}</lastmod>\n`;
      xml += `    <changefreq>${freq}</changefreq>\n`;
      xml += `    <priority>${priority}</priority>\n`;
      xml += `  </url>\n`;
    });

    xml += `</urlset>`;

    this.outputBox.textContent = xml;
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

window.sitemapGenerator = new SitemapGenerator();