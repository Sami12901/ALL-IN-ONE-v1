// ROT13 Encoder Logic

class Rot13Encoder {
  constructor() {
    this.inputBox = document.getElementById('input-text');
    this.outputBox = document.getElementById('output-text');
    this.btnClear = document.getElementById('btn-clear');
    this.btnCopy = document.getElementById('btn-copy');

    this.bindEvents();
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
      return;
    }

    // ROT13 is exactly 13 shift
    const shift = 13;
    let result = '';
    
    for (let i = 0; i < text.length; i++) {
      let char = text[i];
      if (char.match(/[a-z]/i)) {
        const code = text.charCodeAt(i);
        // Uppercase
        if (code >= 65 && code <= 90) {
          char = String.fromCharCode(((code - 65 + shift) % 26) + 65);
        }
        // Lowercase
        else if (code >= 97 && code <= 122) {
          char = String.fromCharCode(((code - 97 + shift) % 26) + 97);
        }
      }
      result += char;
    }

    this.outputBox.value = result;
  }
}

window.rot13Encoder = new Rot13Encoder();