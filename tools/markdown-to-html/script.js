// Markdown to HTML Logic

class MarkdownConverter {
  constructor() {
    this.inputBox = document.getElementById('input-text');
    this.outputBox = document.getElementById('output-text');
    this.previewBox = document.getElementById('preview-box');
    
    this.btnClear = document.getElementById('btn-clear');
    this.btnCopy = document.getElementById('btn-copy');

    // Configure marked to be secure against XSS
    if (typeof marked !== 'undefined') {
      marked.setOptions({
        breaks: true,
        gfm: true,
        headerIds: false
      });
    }

    this.bindEvents();
    
    // Initial sample text
    if (!this.inputBox.value) {
      this.inputBox.value = `# Hello World\n\nWelcome to the **Markdown to HTML Converter**!\n\n- Write markdown on the left.\n- Get clean HTML code on the right.\n- See the live preview below.\n\n> "Simplicity is the ultimate sophistication."`;
      this.process();
    }
  }

  bindEvents() {
    this.inputBox.addEventListener('input', () => this.process());

    this.btnClear.addEventListener('click', () => {
      this.inputBox.value = '';
      this.process();
    });

    this.btnCopy.addEventListener('click', () => {
      if (!this.outputBox.value) return;
      navigator.clipboard.writeText(this.outputBox.value);
      const originalText = this.btnCopy.textContent;
      this.btnCopy.textContent = 'Copied!';
      setTimeout(() => this.btnCopy.textContent = originalText, 1500);
    });
  }

  sanitizePreview(dirtyHtml) {
    try {
      const parser = new DOMParser();
      const doc = parser.parseFromString(dirtyHtml, 'text/html');
      const dangerousTags = ['script', 'iframe', 'object', 'embed', 'link', 'style', 'base', 'frame', 'applet', 'meta'];
      dangerousTags.forEach(tag => doc.querySelectorAll(tag).forEach(el => el.remove()));
      doc.querySelectorAll('*').forEach(el => {
        for (let i = el.attributes.length - 1; i >= 0; i--) {
          const attr = el.attributes[i];
          const name = attr.name.toLowerCase();
          const val = attr.value.trim().toLowerCase();
          if (name.startsWith('on') || val.startsWith('javascript:')) {
            el.removeAttribute(attr.name);
          }
        }
      });
      return doc.body.innerHTML;
    } catch {
      return dirtyHtml.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
    }
  }

  process() {
    const text = this.inputBox.value;
    if (!text) {
      this.outputBox.value = '';
      this.previewBox.innerHTML = '<div style="color: var(--muted); text-align: center; margin-top: 2rem;">Preview will appear here...</div>';
      return;
    }

    if (typeof marked === 'undefined') {
      this.outputBox.value = 'Error: marked.js library not loaded.';
      return;
    }

    try {
      // Parse markdown to HTML
      const html = marked.parse(text);
      
      // Output raw HTML code
      this.outputBox.value = html;
      
      // Render secure visual preview with DOM XSS filtering
      this.previewBox.innerHTML = this.sanitizePreview(html);
    } catch (e) {
      console.error(e);
      this.outputBox.value = 'Error parsing markdown.';
    }
  }
}

window.markdownConverter = new MarkdownConverter();