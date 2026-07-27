// Word Frequency Analyzer Logic

class WordFrequencyAnalyzer {
  constructor() {
    this.inputBox = document.getElementById('input-text');
    this.resultsBox = document.getElementById('results-box');
    this.wordCount = document.getElementById('word-count');
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
    if (!text.trim()) {
      this.resultsBox.innerHTML = '<div style="padding: 1rem; text-align: center; color: var(--muted); font-size: 0.85rem;">Results will appear here</div>';
      this.wordCount.textContent = '0 total words';
      return;
    }

    // Convert to lowercase, remove punctuation except apostrophes in words
    const words = text.toLowerCase()
      .replace(/[^a-z0-9']/g, ' ')
      .replace(/(^'|'$)/g, ' ')
      .split(/\s+/)
      .filter(w => w.length > 0);

    this.wordCount.textContent = `${words.length} total words`;

    const freqMap = {};
    words.forEach(w => {
      freqMap[w] = (freqMap[w] || 0) + 1;
    });

    // Sort descending by frequency, then alphabetically
    const sorted = Object.entries(freqMap).sort((a, b) => {
      if (b[1] === a[1]) return a[0].localeCompare(b[0]);
      return b[1] - a[1];
    });

    let html = '';
    sorted.forEach(([word, count]) => {
      html += `
        <div class="freq-item">
          <span class="freq-word">${this.escapeHtml(word)}</span>
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

window.wordAnalyzer = new WordFrequencyAnalyzer();