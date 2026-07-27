// List Visualizer Logic

class ListVisualizer {
  constructor() {
    this.inputBox = document.getElementById('input-text');
    this.previewBox = document.getElementById('preview-box');
    this.lineCount = document.getElementById('line-count');
    this.listType = document.getElementById('list-type');
    this.listStyle = document.getElementById('list-style');
    
    this.btnClear = document.getElementById('btn-clear');
    this.btnCopy = document.getElementById('btn-copy');

    this.currentHtml = '';

    this.bindEvents();
    
    // Initial sample
    if (!this.inputBox.value) {
      this.inputBox.value = "Apple\nBanana\nOrange\nMango";
      this.process();
    }
  }

  bindEvents() {
    this.inputBox.addEventListener('input', () => this.process());
    this.listType.addEventListener('change', () => this.process());
    this.listStyle.addEventListener('change', () => this.process());

    this.btnClear.addEventListener('click', () => {
      this.inputBox.value = '';
      this.process();
    });

    this.btnCopy.addEventListener('click', () => {
      if (!this.currentHtml) return;
      navigator.clipboard.writeText(this.currentHtml);
      const originalText = this.btnCopy.textContent;
      this.btnCopy.textContent = 'Copied!';
      setTimeout(() => this.btnCopy.textContent = originalText, 1500);
    });
  }

  process() {
    const text = this.inputBox.value;
    const lines = text.split('\n').filter(line => line.trim() !== '');
    
    this.lineCount.textContent = `${lines.length} items`;

    if (lines.length === 0) {
      this.previewBox.innerHTML = '<div style="color:var(--muted);text-align:center;margin-top:2rem;">Add items to see the list...</div>';
      this.previewBox.className = 'preview-box';
      this.currentHtml = '';
      return;
    }

    const type = this.listType.value;
    const styleClass = this.listStyle.value === 'standard' ? '' : `style-${this.listStyle.value}`;
    
    this.previewBox.className = `preview-box ${styleClass}`;

    let html = `<${type}>\n`;
    lines.forEach(line => {
      html += `  <li>${this.escapeHtml(line.trim())}</li>\n`;
    });
    html += `</${type}>`;

    this.currentHtml = html;
    this.previewBox.innerHTML = html;
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

window.listVisualizer = new ListVisualizer();