// Caesar Cipher Logic

class CaesarCipher {
  constructor() {
    this.inputBox = document.getElementById('input-text');
    this.outputBox = document.getElementById('output-text');
    this.shiftKey = document.getElementById('shift-key');
    this.actionType = document.getElementById('action-type');
    this.btnClear = document.getElementById('btn-clear');
    this.btnCopy = document.getElementById('btn-copy');

    this.bindEvents();
  }

  bindEvents() {
    this.inputBox.addEventListener('input', () => this.process());
    this.shiftKey.addEventListener('input', () => this.process());
    this.actionType.addEventListener('change', () => this.process());

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

    let shift = parseInt(this.shiftKey.value) || 0;
    
    // Reverse shift if decoding
    if (this.actionType.value === 'decode') {
      shift = -shift;
    }

    // Normalize shift to 0-25
    shift = ((shift % 26) + 26) % 26;

    let result = '';
    for (let i = 0; i < text.length; i++) {
      let char = text[i];
      if (char.match(/[a-z]/i)) {
        const code = text.charCodeAt(i);
        // Uppercase letters
        if (code >= 65 && code <= 90) {
          char = String.fromCharCode(((code - 65 + shift) % 26) + 65);
        }
        // Lowercase letters
        else if (code >= 97 && code <= 122) {
          char = String.fromCharCode(((code - 97 + shift) % 26) + 97);
        }
      }
      result += char;
    }

    this.outputBox.value = result;
  }
}

window.caesarCipher = new CaesarCipher();