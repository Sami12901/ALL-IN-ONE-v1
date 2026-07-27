// Binary Converter Logic

class BinaryConverter {
  constructor() {
    this.inputBox = document.getElementById('input-text');
    this.outputBox = document.getElementById('output-text');
    this.inputLabel = document.getElementById('input-label');
    this.outputLabel = document.getElementById('output-label');
    this.inputCount = document.getElementById('input-count');
    this.outputCount = document.getElementById('output-count');
    this.swapBtn = document.getElementById('swap-btn');
    this.copyBtn = document.getElementById('btn-copy');
    this.pasteBtn = document.getElementById('btn-paste');

    this.mode = 'textToBinary'; // or 'binaryToText'

    this.bindEvents();
  }

  bindEvents() {
    this.inputBox.addEventListener('input', () => this.process());
    
    this.swapBtn.addEventListener('click', () => {
      this.mode = this.mode === 'textToBinary' ? 'binaryToText' : 'textToBinary';
      this.updateLabels();
      this.inputBox.value = this.outputBox.value;
      this.process();
    });

    this.copyBtn.addEventListener('click', () => {
      navigator.clipboard.writeText(this.outputBox.value);
      const originalText = this.copyBtn.textContent;
      this.copyBtn.textContent = 'Copied!';
      setTimeout(() => this.copyBtn.textContent = originalText, 1500);
    });

    this.pasteBtn.addEventListener('click', async () => {
      try {
        const text = await navigator.clipboard.readText();
        this.inputBox.value = text;
        this.process();
      } catch (err) {
        console.error('Failed to read clipboard contents: ', err);
      }
    });
  }

  updateLabels() {
    if (this.mode === 'textToBinary') {
      this.inputLabel.textContent = 'Text Input';
      this.outputLabel.textContent = 'Binary Output';
      this.outputBox.setAttribute('readonly', 'true');
    } else {
      this.inputLabel.textContent = 'Binary Input';
      this.outputLabel.textContent = 'Text Output';
    }
  }

  process() {
    const input = this.inputBox.value;
    
    if (!input) {
      this.outputBox.value = '';
      this.updateCounts(0, 0);
      return;
    }

    if (this.mode === 'textToBinary') {
      let binaryResult = [];
      for (let i = 0; i < input.length; i++) {
        let bin = input.charCodeAt(i).toString(2);
        binaryResult.push(bin.padStart(8, '0'));
      }
      this.outputBox.value = binaryResult.join(' ');
      this.updateCounts(input.length, binaryResult.length);
    } else {
      // Binary to Text
      // Support space-separated or contiguous
      let cleanInput = input.replace(/[^01]/g, '');
      let textResult = '';
      let chunks = cleanInput.match(/.{1,8}/g) || [];
      
      chunks.forEach(chunk => {
        textResult += String.fromCharCode(parseInt(chunk, 2));
      });
      
      this.outputBox.value = textResult;
      this.updateCounts(chunks.length, textResult.length);
    }
  }

  updateCounts(inCount, outCount) {
    if (this.mode === 'textToBinary') {
      this.inputCount.textContent = `${inCount} chars`;
      this.outputCount.textContent = `${outCount} bytes`;
    } else {
      this.inputCount.textContent = `${inCount} bytes`;
      this.outputCount.textContent = `${outCount} chars`;
    }
  }
}

window.binaryConverter = new BinaryConverter();