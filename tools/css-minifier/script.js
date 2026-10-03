// CSS Minifier - Core Client-Side Logic
document.addEventListener('DOMContentLoaded', () => {
  // DOM Elements
  const cssInput = document.getElementById('css-input');
  const cssOutput = document.getElementById('css-output');
  const btnMinify = document.getElementById('btn-minify');
  const btnSample = document.getElementById('btn-sample');
  const btnClear = document.getElementById('btn-clear');
  const btnCopy = document.getElementById('btn-copy');
  const btnDownload = document.getElementById('btn-download');
  const btnUpload = document.getElementById('btn-upload');
  const fileInput = document.getElementById('file-input');
  const copyToast = document.getElementById('copy-toast');

  // Option Checkboxes
  const optRemoveComments = document.getElementById('opt-remove-comments');
  const optStripWhitespace = document.getElementById('opt-strip-whitespace');
  const optRemoveTrailingSemicolons = document.getElementById('opt-remove-trailing-semicolons');
  const optShortenHex = document.getElementById('opt-shorten-hex');
  const optStripZeroUnits = document.getElementById('opt-strip-zero-units');

  // KPI Metrics
  const statOriginal = document.getElementById('stat-original');
  const statMinified = document.getElementById('stat-minified');
  const statSaved = document.getElementById('stat-saved');
  const statSavedPercent = document.getElementById('stat-saved-percent');
  const statRatio = document.getElementById('stat-ratio');
  const inputStats = document.getElementById('input-stats');
  const outputStats = document.getElementById('output-stats');

  const SAMPLE_CSS = `/* ==========================================================================
   Design System - Primary Component Specifications & Layout
   Author: Modern Architecture Team
   ========================================================================== */

:root {
  --primary-color: #ffffff;
  --secondary-color: #000000;
  --accent-base: #aabbcc;
  --panel-radius: 12px;
  --global-gutter: 0px;
}

/* Glassmorphic Container Panel */
.card-panel {
  display: flex;
  flex-direction: column;
  margin: 0px 24px 0rem 24px;
  padding: 16px 0px 16px 0px;
  background-color: #ffffff;
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: var(--panel-radius);
  box-shadow: 0px 8px 32px 0px rgba(0, 0, 0, 0.37);
  content: "Header Banner";
}

/* Interactive Navigation Actions */
.navigation-bar > ul.nav-list > li.nav-item {
  display: inline-block;
  margin-right: 12px;
  padding: 0px 0em;
}

.navigation-bar > ul.nav-list > li.nav-item > a {
  color: #112233;
  text-decoration: none;
  font-size: 14px;
  transition: all 0.25s ease-in-out;
}

.navigation-bar > ul.nav-list > li.nav-item > a:hover {
  color: #4488cc;
  border-bottom: 2px solid #4488cc;
}

/* Responsive Breakpoints & Viewport Constraints */
@media screen and (max-width: 768px) {
  .card-panel {
    width: calc(100% - 0px);
    margin: 0px;
    padding: 12px;
  }

  .navigation-bar > ul.nav-list > li.nav-item {
    display: block;
    width: 100%;
    margin-bottom: 8px;
  }
}`;

  // Formatter helpers
  function formatBytes(bytes) {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    if (i === 0) return bytes + ' B';
    return (bytes / Math.pow(k, i)).toFixed(2) + ' ' + sizes[i];
  }

  function getByteSize(str) {
    return new TextEncoder().encode(str).length;
  }

  function updateTextStats(str, targetEl) {
    if (!targetEl) return;
    if (!str) {
      targetEl.textContent = '0 lines • 0 chars';
      return;
    }
    const lines = str.split(/\r\n|\r|\n/).length;
    const chars = str.length;
    targetEl.textContent = `${lines.toLocaleString()} lines • ${chars.toLocaleString()} chars`;
  }

  // CSS Minification Engine
  function minifyCSS(css, options) {
    if (!css) return '';

    // Step 1: Preserve strings, URLs, and calc expressions
    const preservedTokens = [];
    function preserve(matched) {
      const placeholder = `___CSS_TOKEN_${preservedTokens.length}___`;
      preservedTokens.push(matched);
      return placeholder;
    }

    let processed = css;

    // Preserve url(...)
    processed = processed.replace(/url\([^)]*\)/gi, preserve);

    // Preserve quoted strings "..." and '...'
    processed = processed.replace(/(["'])(?:(?=(\\?))\2[\s\S])*?\1/g, preserve);

    // Preserve calc(...) expressions to protect operator spacing requirements
    processed = processed.replace(/calc\([^)]*\)/gi, preserve);

    // Step 2: Remove comments
    if (options.removeComments) {
      processed = processed.replace(/\/\*[\s\S]*?\*\//g, '');
    }

    // Step 3: Strip zero units (0px, 0em, 0rem, 0%, 0pt, 0vh, 0vw, etc. -> 0)
    if (options.stripZeroUnits) {
      processed = processed.replace(
        /(^|[\s:,\(])0(?:px|em|rem|%|pt|vh|vw|vmin|vmax|cm|mm|in|pc|ex|ch)(?=[\s;,\)\!\}]|$)/gi,
        (match, prefix) => prefix + '0'
      );
    }

    // Step 4: Shorten hex colors (#ffffff -> #fff, #112233 -> #123)
    if (options.shortenHex) {
      processed = processed.replace(
        /#([0-9a-fA-F])\1([0-9a-fA-F])\2([0-9a-fA-F])\3\b/g,
        (match, r, g, b) => '#' + r + g + b
      );
    }

    // Step 5: Strip whitespace
    if (options.stripWhitespace) {
      // Normalize line breaks and multiple whitespace to single space
      processed = processed.replace(/\s+/g, ' ');

      // Remove spaces around syntax delimiters: { } : ; , > ~ +
      // Be careful: don't collapse spaces required between selectors (descendant selector)
      processed = processed.replace(/\s*([{};,])\s*/g, '$1');

      // Colons: remove space after colon in declarations, but keep space after media feature keywords if needed
      processed = processed.replace(/:\s+/g, ':');
      processed = processed.replace(/\s+:/g, ':');

      // Combinators: > + ~
      processed = processed.replace(/\s*([>~+])\s*/g, '$1');

      // Parentheses: ( )
      processed = processed.replace(/\(\s+/g, '(');
      processed = processed.replace(/\s+\)/g, ')');

      // Edge whitespace
      processed = processed.trim();
    }

    // Step 6: Remove trailing semicolons before closing brace (;})
    if (options.removeTrailingSemicolons) {
      processed = processed.replace(/;+\s*}/g, '}');
    }

    // Step 7: Restore preserved tokens
    preservedTokens.forEach((token, idx) => {
      const placeholder = `___CSS_TOKEN_${idx}___`;
      processed = processed.replace(placeholder, token);
    });

    return processed;
  }

  // Processing controller
  function processOptimization() {
    const rawCSS = cssInput.value;
    updateTextStats(rawCSS, inputStats);

    if (!rawCSS.trim()) {
      cssOutput.value = '';
      statOriginal.textContent = '0 B';
      statMinified.textContent = '0 B';
      statSaved.textContent = '0 B';
      statSavedPercent.textContent = '0.0% reduction';
      statRatio.textContent = '0.0%';
      updateTextStats('', outputStats);
      return;
    }

    const options = {
      removeComments: optRemoveComments.checked,
      stripWhitespace: optStripWhitespace.checked,
      removeTrailingSemicolons: optRemoveTrailingSemicolons.checked,
      shortenHex: optShortenHex.checked,
      stripZeroUnits: optStripZeroUnits.checked
    };

    const minified = minifyCSS(rawCSS, options);
    cssOutput.value = minified;
    updateTextStats(minified, outputStats);

    const originalBytes = getByteSize(rawCSS);
    const minifiedBytes = getByteSize(minified);
    const savedBytes = Math.max(0, originalBytes - minifiedBytes);
    const ratioPercent = originalBytes > 0 ? ((savedBytes / originalBytes) * 100).toFixed(1) : '0.0';

    statOriginal.textContent = formatBytes(originalBytes);
    statMinified.textContent = formatBytes(minifiedBytes);
    statSaved.textContent = formatBytes(savedBytes);
    statSavedPercent.textContent = `${ratioPercent}% reduction`;
    statRatio.textContent = `${ratioPercent}%`;
  }

  // Events
  cssInput.addEventListener('input', processOptimization);
  btnMinify.addEventListener('click', processOptimization);

  [
    optRemoveComments,
    optStripWhitespace,
    optRemoveTrailingSemicolons,
    optShortenHex,
    optStripZeroUnits
  ].forEach(checkbox => {
    checkbox.addEventListener('change', processOptimization);
  });

  // Load Sample
  btnSample.addEventListener('click', () => {
    cssInput.value = SAMPLE_CSS;
    processOptimization();
  });

  // Clear
  btnClear.addEventListener('click', () => {
    cssInput.value = '';
    cssOutput.value = '';
    processOptimization();
    cssInput.focus();
  });

  // Copy
  btnCopy.addEventListener('click', () => {
    const content = cssOutput.value;
    if (!content) return;

    navigator.clipboard.writeText(content).then(() => {
      const originalText = btnCopy.innerHTML;
      btnCopy.classList.add('btn-success');
      copyToast.classList.add('visible');

      setTimeout(() => {
        btnCopy.innerHTML = originalText;
        btnCopy.classList.remove('btn-success');
        copyToast.classList.remove('visible');
      }, 2000);
    }).catch(err => {
      console.error('Copy to clipboard failed:', err);
    });
  });

  // Download
  btnDownload.addEventListener('click', () => {
    const content = cssOutput.value;
    if (!content) return;

    const blob = new Blob([content], { type: 'text/css;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'style.min.css';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  });

  // File Upload
  btnUpload.addEventListener('click', () => {
    fileInput.click();
  });

  fileInput.addEventListener('change', (e) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      cssInput.value = event.target.result;
      processOptimization();
    };
    reader.readAsText(file);
    fileInput.value = '';
  });

  // Tab key indent support
  cssInput.addEventListener('keydown', (e) => {
    if (e.key === 'Tab') {
      e.preventDefault();
      const start = cssInput.selectionStart;
      const end = cssInput.selectionEnd;
      cssInput.value = cssInput.value.substring(0, start) + '  ' + cssInput.value.substring(end);
      cssInput.selectionStart = cssInput.selectionEnd = start + 2;
      processOptimization();
    }
  });

  // Initial run
  processOptimization();
});