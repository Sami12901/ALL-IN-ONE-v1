// String Length Calculator Logic

class StringCalculator {
  constructor() {
    this.inputBox = document.getElementById('input-text');
    this.valChars = document.getElementById('val-chars');
    this.valWords = document.getElementById('val-words');
    this.valLines = document.getElementById('val-lines');
    this.valBytes = document.getElementById('val-bytes');
    this.btnClear = document.getElementById('btn-clear');

    this.bindEvents();
  }

  bindEvents() {
    this.inputBox.addEventListener('input', () => this.process());

    this.btnClear.addEventListener('click', () => {
      this.inputBox.value = '';
      this.process();
    });
  }

  process() {
    const text = this.inputBox.value;
    
    if (!text) {
      this.valChars.textContent = '0';
      this.valWords.textContent = '0';
      this.valLines.textContent = '0';
      this.valBytes.textContent = '0';
      return;
    }

    // Characters
    const chars = text.length;
    
    // Words
    const words = text.trim() === '' ? 0 : text.trim().split(/\s+/).length;
    
    // Lines
    const lines = text.split('\n').length;
    
    // Bytes (UTF-8 encoding size)
    const bytes = new Blob([text]).size;

    this.valChars.textContent = this.formatNumber(chars);
    this.valWords.textContent = this.formatNumber(words);
    this.valLines.textContent = this.formatNumber(lines);
    this.valBytes.textContent = this.formatNumber(bytes);
  }

  formatNumber(num) {
    return num.toLocaleString();
  }
}

window.stringCalculator = new StringCalculator();