// Character Frequency Analyzer Logic

class CharFrequencyAnalyzer {
  constructor() {
    this.inputBox = document.getElementById('input-text');
    this.resultsBox = document.getElementById('results-box');
    this.charCount = document.getElementById('char-count');
    this.btnClear = document.getElementById('btn-clear');
    
    this.optIgnoreSpaces = document.getElementById('opt-ignore-spaces');
    this.optCaseInsensitive = document.getElementById('opt-case-insensitive');

    this.bindEvents();
  }

  bindEvents() {
    this.inputBox.addEventListener('input', () => this.process());
    this.optIgnoreSpaces.addEventListener('change', () => this.process());
    this.optCaseInsensitive.addEventListener('change', () => this.process());

    this.btnClear.addEventListener('click', () => {
      this.inputBox.value = '';
      this.process();
    });
  }

  process() {
    let text = this.inputBox.value;
    
    if (!text) {
      this.resultsBox.innerHTML = '<div style="padding: 1rem; text-align: center; color: var(--muted); font-size: 0.85rem;">Results will appear here</div>';
      this.charCount.textContent = '0 total characters';
      return;
    }

    if (this.optIgnoreSpaces.checked) {
      text = text.replace(/\s+/g, '');
    }

    if (this.optCaseInsensitive.checked) {
      text = text.toLowerCase();
    }

    this.charCount.textContent = `${text.length} total characters`;

    const freqMap = {};
    for (let i = 0; i < text.length; i++) {
      const char = text[i];
      freqMap[char] = (freqMap[char] || 0) + 1;
    }

    // Sort descending by frequency, then alphabetically
    const sorted = Object.entries(freqMap).sort((a, b) => {
      if (b[1] === a[1]) return a[0].localeCompare(b[0]);
      return b[1] - a[1];
    });

    let html = '';
    sorted.forEach(([char, count]) => {
      let displayChar = char;
      if (char === ' ') displayChar = 'Space';
      else if (char === '\n') displayChar = 'Newline';
      else if (char === '\t') displayChar = 'Tab';

      html += `
        <div class="freq-item">
          <span class="freq-char">${this.escapeHtml(displayChar)}</span>
          <span class="freq-count">${count}</span>
        </div>
      `;
    });

    this.resultsBox.innerHTML = html;
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

window.charAnalyzer = new CharFrequencyAnalyzer();