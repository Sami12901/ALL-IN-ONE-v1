/**
 * URL Slug Generator - Client-Side Logic
 * Supports Single Mode and Batch Mode with fast regex & unicode transliteration
 */

// Comprehensive English SEO Stop Words list
const STOP_WORDS = new Set([
  'a', 'about', 'above', 'after', 'again', 'against', 'all', 'am', 'an', 'and', 'any', 'are', 'aren\'t',
  'as', 'at', 'be', 'because', 'been', 'before', 'being', 'below', 'between', 'both', 'but', 'by',
  'can', 'cannot', 'could', 'couldn\'t', 'did', 'didn\'t', 'do', 'does', 'doesn\'t', 'doing', 'don\'t',
  'down', 'during', 'each', 'few', 'for', 'from', 'further', 'had', 'hadn\'t', 'has', 'hasn\'t',
  'have', 'haven\'t', 'having', 'he', 'he\'d', 'he\'ll', 'he\'s', 'her', 'here', 'here\'s', 'hers',
  'herself', 'him', 'himself', 'his', 'how', 'how\'s', 'i', 'i\'d', 'i\'ll', 'i\'m', 'i\'ve', 'if',
  'in', 'into', 'is', 'isn\'t', 'it', 'it\'s', 'its', 'itself', 'let\'s', 'me', 'more', 'most',
  'mustn\'t', 'my', 'myself', 'no', 'nor', 'not', 'of', 'off', 'on', 'once', 'only', 'or', 'other',
  'ought', 'our', 'ours', 'ourselves', 'out', 'over', 'own', 'same', 'shan\'t', 'she', 'she\'d',
  'she\'ll', 'she\'s', 'should', 'shouldn\'t', 'so', 'some', 'such', 'than', 'that', 'that\'s',
  'the', 'their', 'theirs', 'them', 'themselves', 'then', 'there', 'there\'s', 'these', 'they',
  'they\'d', 'they\'ll', 'they\'re', 'they\'ve', 'this', 'those', 'through', 'to', 'too', 'under',
  'until', 'up', 'very', 'was', 'wasn\'t', 'we', 'we\'d', 'we\'ll', 'we\'re', 'we\'ve', 'were',
  'weren\'t', 'what', 'what\'s', 'when', 'when\'s', 'where', 'where\'s', 'which', 'while', 'who',
  'who\'s', 'whom', 'why', 'why\'s', 'with', 'won\'t', 'would', 'wouldn\'t', 'you', 'you\'d',
  'you\'ll', 'you\'re', 'you\'ve', 'your', 'yours', 'yourself', 'yourselves'
]);

// Extended transliteration map for ligatures and special alphabetic symbols
const SPECIAL_CHAR_MAP = {
  'ä': 'ae', 'ö': 'oe', 'ü': 'ue', 'Ä': 'ae', 'Ö': 'oe', 'Ü': 'ue',
  'ß': 'ss', 'æ': 'ae', 'Æ': 'ae', 'œ': 'oe', 'Œ': 'oe',
  'ø': 'o', 'Ø': 'o', 'å': 'a', 'Å': 'a',
  'ñ': 'n', 'Ñ': 'n', 'ç': 'c', 'Ç': 'c',
  'ð': 'd', 'Ð': 'd', 'þ': 'th', 'Þ': 'th',
  'ł': 'l', 'Ł': 'l', 'đ': 'd', 'Đ': 'd',
  '&': ' and ', '@': ' at ', '%': ' percent ', '+': ' plus '
};

class UrlSlugGenerator {
  constructor() {
    this.currentMode = 'single'; // 'single' | 'batch'
    this.initElements();
    this.bindEvents();
    this.render();
  }

  initElements() {
    // Mode tabs
    this.tabSingle = document.getElementById('tab-single');
    this.tabBatch = document.getElementById('tab-batch');
    this.viewSingleInput = document.getElementById('view-single-input');
    this.viewBatchInput = document.getElementById('view-batch-input');
    this.outputSingleContainer = document.getElementById('output-single-container');
    this.outputBatchContainer = document.getElementById('output-batch-container');

    // Inputs
    this.singleInput = document.getElementById('single-input');
    this.batchInput = document.getElementById('batch-input');
    this.singleInputStats = document.getElementById('single-input-stats');
    this.batchInputStats = document.getElementById('batch-input-stats');
    this.btnLoadSample = document.getElementById('btn-load-sample');
    this.btnClearSingle = document.getElementById('btn-clear-single');
    this.btnClearBatch = document.getElementById('btn-clear-batch');

    // Options
    this.optSeparator = document.getElementById('opt-separator');
    this.optCasing = document.getElementById('opt-casing');
    this.optPrefix = document.getElementById('opt-prefix');
    this.optStopWords = document.getElementById('opt-stop-words');
    this.optTransliterate = document.getElementById('opt-transliterate');
    this.optRemoveNumbers = document.getElementById('opt-remove-numbers');
    this.optTrailingSlash = document.getElementById('opt-trailing-slash');

    // Single Output Elements
    this.urlPrefixDisplay = document.getElementById('url-prefix-display');
    this.previewSlugText = document.getElementById('preview-slug-text');
    this.primarySlugOutput = document.getElementById('primary-slug-output');
    this.valChars = document.getElementById('val-chars');
    this.valWords = document.getElementById('val-words');
    this.valStatus = document.getElementById('val-status');
    this.badgeStatus = document.getElementById('badge-status');
    this.btnCopySingle = document.getElementById('btn-copy-single');
    this.btnCopyFullUrl = document.getElementById('btn-copy-full-url');

    // Batch Output Elements
    this.batchOutputText = document.getElementById('batch-output-text');
    this.batchOutputStats = document.getElementById('batch-output-stats');
    this.btnCopyBatch = document.getElementById('btn-copy-batch');
    this.btnExportTxt = document.getElementById('btn-export-txt');
  }

  bindEvents() {
    // Mode toggling
    this.tabSingle.addEventListener('click', () => this.switchMode('single'));
    this.tabBatch.addEventListener('click', () => this.switchMode('batch'));

    // Text inputs
    this.singleInput.addEventListener('input', () => this.render());
    this.batchInput.addEventListener('input', () => this.render());

    // Options change
    const optionElements = [
      this.optSeparator,
      this.optCasing,
      this.optPrefix,
      this.optStopWords,
      this.optTransliterate,
      this.optRemoveNumbers,
      this.optTrailingSlash
    ];

    optionElements.forEach(el => {
      el.addEventListener('change', () => this.render());
      el.addEventListener('input', () => this.render());
    });

    // Sample & Clear actions
    this.btnLoadSample.addEventListener('click', () => this.loadSample());
    this.btnClearSingle.addEventListener('click', () => {
      this.singleInput.value = '';
      this.render();
      this.singleInput.focus();
    });
    this.btnClearBatch.addEventListener('click', () => {
      this.batchInput.value = '';
      this.render();
      this.batchInput.focus();
    });

    // Copy & Export actions
    this.btnCopySingle.addEventListener('click', () => this.copyText(this.primarySlugOutput.textContent, this.btnCopySingle, 'Copied!'));
    this.btnCopyFullUrl.addEventListener('click', () => {
      const fullUrl = (this.optPrefix.value.trim() || '') + (this.primarySlugOutput.textContent || '');
      this.copyText(fullUrl, this.btnCopyFullUrl, 'Copied URL!');
    });
    this.btnCopyBatch.addEventListener('click', () => this.copyText(this.batchOutputText.value, this.btnCopyBatch, 'Copied All!'));
    this.btnExportTxt.addEventListener('click', () => this.exportBatchTxt());
  }

  switchMode(mode) {
    this.currentMode = mode;
    if (mode === 'single') {
      this.tabSingle.classList.add('active');
      this.tabSingle.setAttribute('aria-selected', 'true');
      this.tabBatch.classList.remove('active');
      this.tabBatch.setAttribute('aria-selected', 'false');

      this.viewSingleInput.style.display = 'flex';
      this.viewBatchInput.style.display = 'none';
      this.outputSingleContainer.style.display = 'flex';
      this.outputBatchContainer.style.display = 'none';
    } else {
      this.tabBatch.classList.add('active');
      this.tabBatch.setAttribute('aria-selected', 'true');
      this.tabSingle.classList.remove('active');
      this.tabSingle.setAttribute('aria-selected', 'false');

      this.viewSingleInput.style.display = 'none';
      this.viewBatchInput.style.display = 'flex';
      this.outputSingleContainer.style.display = 'none';
      this.outputBatchContainer.style.display = 'flex';

      // Preload batch if empty
      if (!this.batchInput.value.trim()) {
        this.loadSampleBatch();
      }
    }
    this.render();
  }

  loadSample() {
    if (this.currentMode === 'single') {
      const samples = [
        '15 Best Modern Web Design Trends & Inspirations in 2026!',
        'How to Build High-Performance APIs with Node.js & Redis?',
        'Café au Lait: The Ultimate French Roast Guide for Connoisseurs',
        'Top 10 Zero-Calorie Sweeteners: What Does Science Say in 2026?'
      ];
      const random = samples[Math.floor(Math.random() * samples.length)];
      this.singleInput.value = random;
    } else {
      this.loadSampleBatch();
    }
    this.render();
  }

  loadSampleBatch() {
    this.batchInput.value = [
      '15 Best Modern Web Design Trends & Inspirations in 2026!',
      'Café au Lait: The Ultimate French Roast Guide for Connoisseurs',
      'Beginner Guide to Python Data Science & Machine Learning',
      'How to Fix Common React Hydration Mismatch Errors',
      'Top 10 Running Shoes for Marathon Athletes & Runners'
    ].join('\n');
  }

  /**
   * Core slug generation algorithm
   */
  generateSlug(rawText) {
    if (!rawText || !rawText.trim()) return '';

    let text = rawText;

    // 1. Transliterate diacritics & special symbols if enabled
    if (this.optTransliterate.checked) {
      // Replace known multi-character expansions
      for (const [char, replacement] of Object.entries(SPECIAL_CHAR_MAP)) {
        text = text.replaceAll(char, replacement);
      }
      // NFD Unicode normalization: separate letters from combining diacritical marks
      text = text.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    }

    // 2. Remove numbers if toggle is active
    if (this.optRemoveNumbers.checked) {
      text = text.replace(/\d+/g, ' ');
    }

    // 3. Tokenize words by non-alphanumeric boundaries
    // Remove apostrophes inside words (e.g., aren't -> arent or don't -> dont)
    text = text.replace(/['’]/g, '');

    // Extract word tokens
    const rawTokens = text.match(/[A-Za-z0-9]+/g) || [];

    // 4. Filter stop words if toggle is active
    const removeStop = this.optStopWords.checked;
    const filteredTokens = rawTokens.filter(word => {
      if (!removeStop) return true;
      return !STOP_WORDS.has(word.toLowerCase());
    });

    // Fallback if all words were removed as stop words
    const tokens = filteredTokens.length > 0 ? filteredTokens : rawTokens;

    // 5. Apply casing
    const casing = this.optCasing.value;
    const casedTokens = tokens.map(token => {
      if (casing === 'lowercase') {
        return token.toLowerCase();
      } else if (casing === 'UPPERCASE') {
        return token.toUpperCase();
      } else if (casing === 'TitleCase') {
        return token.charAt(0).toUpperCase() + token.slice(1).toLowerCase();
      }
      return token.toLowerCase();
    });

    // 6. Join tokens with chosen separator
    const separator = this.optSeparator.value || '-';
    let slug = casedTokens.join(separator);

    // 7. Apply Trailing Slash if enabled and slug exists
    if (this.optTrailingSlash.checked && slug.length > 0) {
      slug += '/';
    }

    return slug;
  }

  render() {
    const prefix = (this.optPrefix.value || '').trim();
    this.urlPrefixDisplay.textContent = prefix;

    if (this.currentMode === 'single') {
      const rawText = this.singleInput.value;
      const charCount = rawText.length;
      const wordCount = rawText.trim() ? rawText.trim().split(/\s+/).length : 0;
      this.singleInputStats.textContent = `${charCount} characters · ${wordCount} words`;

      const slug = this.generateSlug(rawText);
      this.primarySlugOutput.textContent = slug;
      this.previewSlugText.textContent = slug || 'your-slug';

      // Stats for the resulting slug
      const slugChars = slug.replace(/\/$/, '').length;
      const slugWords = slug.split(/[-_.]/).filter(Boolean).length;

      this.valChars.textContent = `${slugChars} chars`;
      this.valWords.textContent = `${slugWords} words`;

      // Status indicator
      this.badgeStatus.classList.remove('status-good', 'status-warn', 'status-danger');
      if (slugChars === 0) {
        this.valStatus.textContent = 'Empty';
      } else if (slugChars <= 50) {
        this.valStatus.textContent = 'Optimal (< 50 chars)';
        this.badgeStatus.classList.add('status-good');
      } else if (slugChars <= 75) {
        this.valStatus.textContent = 'Acceptable (50-75 chars)';
        this.badgeStatus.classList.add('status-warn');
      } else {
        this.valStatus.textContent = 'Long (> 75 chars)';
        this.badgeStatus.classList.add('status-danger');
      }

    } else {
      // Batch mode
      const rawLines = this.batchInput.value.split('\n');
      const nonEmptyLines = rawLines.filter(l => l.trim().length > 0);
      this.batchInputStats.textContent = `${nonEmptyLines.length} titles / items detected`;

      const generatedSlugs = rawLines.map(line => {
        if (!line.trim()) return '';
        return this.generateSlug(line);
      });

      this.batchOutputText.value = generatedSlugs.join('\n');
      const validGenerated = generatedSlugs.filter(s => s.trim().length > 0);
      this.batchOutputStats.textContent = `${validGenerated.length} slugs generated`;
    }
  }

  copyText(text, btnElement, successMsg = 'Copied!') {
    if (!text || !text.trim()) return;

    navigator.clipboard.writeText(text).then(() => {
      const originalHTML = btnElement.innerHTML;
      btnElement.innerHTML = `
        <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
        ${successMsg}
      `;
      btnElement.style.background = 'var(--success)';
      btnElement.style.borderColor = 'transparent';
      btnElement.style.color = '#ffffff';

      setTimeout(() => {
        btnElement.innerHTML = originalHTML;
        btnElement.style.background = '';
        btnElement.style.borderColor = '';
        btnElement.style.color = '';
      }, 1600);
    }).catch(err => {
      console.error('Failed to copy to clipboard:', err);
    });
  }

  exportBatchTxt() {
    const content = this.batchOutputText.value;
    if (!content.trim()) return;

    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `slugs-export-${Date.now()}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }
}

// Instantiate upon script load
document.addEventListener('DOMContentLoaded', () => {
  window.urlSlugGenerator = new UrlSlugGenerator();
});