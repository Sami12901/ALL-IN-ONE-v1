// Duplicate Lines Remover Logic

class DuplicateRemover {
  constructor() {
    this.inputBox = document.getElementById('input-text');
    this.outputBox = document.getElementById('output-text');
    this.inputCount = document.getElementById('input-count');
    this.outputCount = document.getElementById('output-count');
    
    this.optCase = document.getElementById('opt-case');
    this.optTrim = document.getElementById('opt-trim');
    this.optEmpty = document.getElementById('opt-empty');
    
    this.btnClear = document.getElementById('btn-clear');
    this.btnCopy = document.getElementById('btn-copy');

    this.bindEvents();
  }

  bindEvents() {
    this.inputBox.addEventListener('input', () => this.process());
    this.optCase.addEventListener('change', () => this.process());
    this.optTrim.addEventListener('change', () => this.process());
    this.optEmpty.addEventListener('change', () => this.process());
    
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
      this.inputCount.textContent = '0 lines';
      this.outputCount.textContent = '0 duplicates removed';
      return;
    }

    let lines = text.split('\n');
    const originalCount = lines.length;
    
    const caseSensitive = this.optCase.checked;
    const trimWhitespace = this.optTrim.checked;
    const removeEmpty = this.optEmpty.checked;

    const seen = new Set();
    const result = [];

    for (let i = 0; i < lines.length; i++) {
      let originalLine = lines[i];
      let processedLine = originalLine;

      if (trimWhitespace) {
        processedLine = processedLine.trim();
        originalLine = originalLine.trim(); // Affects output if trim is checked
      }

      if (removeEmpty && processedLine === '') {
        continue;
      }

      const hash = caseSensitive ? processedLine : processedLine.toLowerCase();
      
      if (!seen.has(hash)) {
        seen.add(hash);
        result.push(originalLine);
      }
    }

    this.outputBox.value = result.join('\n');
    
    const dupesRemoved = originalCount - result.length;
    
    this.inputCount.textContent = `${originalCount} lines`;
    this.outputCount.textContent = `${dupesRemoved} removed`;
  }
}

window.duplicateRemover = new DuplicateRemover();