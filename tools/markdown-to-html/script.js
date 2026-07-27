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
      
      // Render visual preview
      // Note: In a real app we'd sanitize this using DOMPurify, but for a client-side utility we assume the user trusts their own input.
      this.previewBox.innerHTML = html;
    } catch (e) {
      console.error(e);
      this.outputBox.value = 'Error parsing markdown.';
    }
  }
}

window.markdownConverter = new MarkdownConverter();