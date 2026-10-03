// JS Minifier - Core Client-Side Logic
document.addEventListener('DOMContentLoaded', () => {
  // DOM Elements
  const jsInput = document.getElementById('js-input');
  const jsOutput = document.getElementById('js-output');
  const btnMinify = document.getElementById('btn-minify');
  const btnSample = document.getElementById('btn-sample');
  const btnClear = document.getElementById('btn-clear');
  const btnCopy = document.getElementById('btn-copy');
  const btnDownload = document.getElementById('btn-download');
  const btnUpload = document.getElementById('btn-upload');
  const fileInput = document.getElementById('file-input');
  const copyToast = document.getElementById('copy-toast');

  // Option Checkboxes
  const optStripSingle = document.getElementById('opt-strip-single');
  const optStripMulti = document.getElementById('opt-strip-multi');
  const optCollapseWhitespace = document.getElementById('opt-collapse-whitespace');
  const optRemoveEmptyLines = document.getElementById('opt-remove-empty-lines');

  // KPI Metrics
  const statOriginal = document.getElementById('stat-original');
  const statMinified = document.getElementById('stat-minified');
  const statSaved = document.getElementById('stat-saved');
  const statSavedPercent = document.getElementById('stat-saved-percent');
  const statRatio = document.getElementById('stat-ratio');
  const inputStats = document.getElementById('input-stats');
  const outputStats = document.getElementById('output-stats');

  const SAMPLE_JS = `/**
 * Core Application Controller
 * Handles user authentication, token renewal, and layout telemetry.
 * @module AuthController
 */

// Global application configuration settings
const APP_CONFIG = {
  version: "2.4.0",
  apiUrl: "https://api.example.com/v1",
  timeout: 5000,
  debugMode: false
};

/* Multi-line telemetry calculation
   and payload preparation */
class AuthSessionManager {
  constructor(authToken, userProfile) {
    // Single-line note: User profile assignment
    this.token = authToken;
    this.user = userProfile;
    this.createdAt = Date.now();
  }

  // Validates user input matching RFC-5322 regex pattern
  isValidEmail(emailAddress) {
    const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$/i;
    return emailPattern.test(emailAddress);
  }

  // Generates greeting with ES6 template literal interpolation
  generateWelcomeBadge() {
    const username = this.user.name || "Anonymous Member";
    const statusText = \`Welcome back, \${username}! Current Session: #\${Math.floor(Math.random() * 9000 + 1000)}\`;
    
    // Output message to console in debug mode
    if (APP_CONFIG.debugMode) {
      console.log(\`[DEBUG] \${statusText}\`);
    }

    return statusText;
  }
}

// Instantiate demo manager
const activeUser = { id: 4091, name: "Alexandra Reed", role: "Administrator" };
const sessionInstance = new AuthSessionManager("jwt_token_demo_987", activeUser);

console.log(sessionInstance.generateWelcomeBadge());`;

  // Format size helpers
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

  /**
   * Safe JavaScript Lexical Tokenizer
   * Distinctly preserves strings, template literals, comments, regex literals, and identifiers.
   */
  function tokenizeJS(code) {
    const tokens = [];
    let i = 0;
    const len = code.length;

    while (i < len) {
      const char = code[i];
      const next = code[i + 1];

      // 1. Single-line comment: // ...
      if (char === '/' && next === '/') {
        const start = i;
        i += 2;
        while (i < len && code[i] !== '\n' && code[i] !== '\r') {
          i++;
        }
        tokens.push({ type: 'comment-single', value: code.slice(start, i) });
        continue;
      }

      // 2. Multi-line comment: /* ... */
      if (char === '/' && next === '*') {
        const start = i;
        i += 2;
        while (i < len && !(code[i] === '*' && code[i + 1] === '/')) {
          i++;
        }
        if (i < len) i += 2;
        tokens.push({ type: 'comment-multi', value: code.slice(start, i) });
        continue;
      }

      // 3. Quoted string literals: '...' and "..."
      if (char === "'" || char === '"') {
        const quote = char;
        const start = i;
        i++;
        while (i < len) {
          if (code[i] === '\\') {
            i += 2;
          } else if (code[i] === quote) {
            i++;
            break;
          } else if (code[i] === '\n') {
            break;
          } else {
            i++;
          }
        }
        tokens.push({ type: 'string', value: code.slice(start, i) });
        continue;
      }

      // 4. Template literals: `...`
      if (char === '`') {
        const start = i;
        i++;
        while (i < len) {
          if (code[i] === '\\') {
            i += 2;
          } else if (code[i] === '`') {
            i++;
            break;
          } else {
            i++;
          }
        }
        tokens.push({ type: 'template-literal', value: code.slice(start, i) });
        continue;
      }

      // 5. Regular Expression Literal vs Division Operator
      if (char === '/') {
        let isRegex = false;
        let prevToken = null;
        for (let p = tokens.length - 1; p >= 0; p--) {
          if (tokens[p].type !== 'whitespace' && !tokens[p].type.startsWith('comment')) {
            prevToken = tokens[p];
            break;
          }
        }

        if (!prevToken) {
          isRegex = true;
        } else {
          const pv = prevToken.value.trim();
          const regexTriggers = [
            '(', '[', '{', ';', ',', '=', ':', '?', '!', '+', '-', '*', '%', '&', '|',
            '^', '~', '<', '>', '&&', '||', '===', '!==', '==', '!=', '<=', '>=', '=>',
            'return', 'case', 'throw', 'delete', 'void', 'typeof', 'instanceof',
            'new', 'in', 'of', 'yield', 'await', 'else', 'do', 'default'
          ];
          if (regexTriggers.includes(pv)) {
            isRegex = true;
          }
        }

        if (isRegex) {
          const start = i;
          i++;
          let inCharClass = false;
          while (i < len) {
            if (code[i] === '\\') {
              i += 2;
            } else if (code[i] === '[') {
              inCharClass = true;
              i++;
            } else if (code[i] === ']' && inCharClass) {
              inCharClass = false;
              i++;
            } else if (code[i] === '/' && !inCharClass) {
              i++;
              // Consume flags (g, i, m, s, u, y, d)
              while (i < len && /[a-z]/i.test(code[i])) {
                i++;
              }
              break;
            } else if (code[i] === '\n') {
              break;
            } else {
              i++;
            }
          }
          tokens.push({ type: 'regex', value: code.slice(start, i) });
          continue;
        }
      }

      // 6. Whitespace
      if (/\s/.test(char)) {
        const start = i;
        let hasNewline = false;
        while (i < len && /\s/.test(code[i])) {
          if (code[i] === '\n' || code[i] === '\r') hasNewline = true;
          i++;
        }
        tokens.push({
          type: 'whitespace',
          value: code.slice(start, i),
          hasNewline
        });
        continue;
      }

      // 7. Words (Identifiers, keywords, numeric literals)
      if (/[a-zA-Z0-9_$]/.test(char)) {
        const start = i;
        while (i < len && /[a-zA-Z0-9_$]/.test(code[i])) {
          i++;
        }
        tokens.push({ type: 'word', value: code.slice(start, i) });
        continue;
      }

      // 8. Operators and Punctuation
      const start = i;
      if (
        (char === '=' || char === '!' || char === '<' || char === '>') &&
        next === '='
      ) {
        i += (code[i + 2] === '=' ? 3 : 2);
      } else if (
        (char === '+' || char === '-' || char === '&' || char === '|') &&
        next === char
      ) {
        i += 2;
      } else if (char === '=' && next === '>') {
        i += 2;
      } else {
        i++;
      }
      tokens.push({ type: 'punct', value: code.slice(start, i) });
    }

    return tokens;
  }

  /**
   * JavaScript Minification Engine
   */
  function minifyJS(code, options) {
    if (!code) return '';

    const tokens = tokenizeJS(code);
    const filtered = [];

    // Filter comments
    for (let i = 0; i < tokens.length; i++) {
      const t = tokens[i];

      if (t.type === 'comment-single') {
        if (options.stripSingle) {
          // Preserve a line break token so ASI is respected
          filtered.push({ type: 'whitespace', value: '\n', hasNewline: true });
          continue;
        }
      }

      if (t.type === 'comment-multi') {
        if (options.stripMulti) {
          // If multi-line comment spanned newlines, preserve line break for ASI
          if (t.value.includes('\n')) {
            filtered.push({ type: 'whitespace', value: '\n', hasNewline: true });
          }
          continue;
        }
      }

      filtered.push(t);
    }

    // Assemble optimized tokens
    let result = '';
    let lastNonWs = null;
    let pendingLineBreak = false;

    for (let i = 0; i < filtered.length; i++) {
      const t = filtered[i];

      if (t.type === 'whitespace') {
        if (t.hasNewline) {
          pendingLineBreak = true;
        }
        continue;
      }

      // Non-whitespace token
      if (lastNonWs) {
        const prevVal = lastNonWs.value;
        const currVal = t.value;
        const prevType = lastNonWs.type;
        const currType = t.type;

        if (pendingLineBreak) {
          if (!options.collapseWhitespace) {
            result += '\n';
          } else {
            // Check if omitting newline causes ASI syntax breakdown
            const noAsi = [';', '{', '(', '[', ',', ':', '?', '&&', '||', '=>', '+', '-', '*', '/', '='];
            if (noAsi.includes(prevVal) || currVal === '}' || currVal === ')' || currVal === ']' || currVal === ';') {
              // Safe to omit newline entirely
            } else {
              // Insert semicolon to maintain safety on single-line compression
              result += ';';
            }
          }
        } else {
          // No newline
          // When collapsing whitespace, check if a space is required between adjacent identifiers
          const isWord = (type) => type === 'word';
          if (isWord(prevType) && isWord(currType)) {
            result += ' ';
          } else if (
            (prevVal === '+' && (currVal === '+' || currVal.startsWith('+'))) ||
            (prevVal === '-' && (currVal === '-' || currVal.startsWith('-')))
          ) {
            result += ' ';
          }
        }
      }

      result += t.value;
      lastNonWs = t;
      pendingLineBreak = false;
    }

    // Option: Remove empty lines
    if (options.removeEmptyLines) {
      result = result.replace(/^\s*[\r\n]/gm, '');
    }

    // Option: Collapse whitespace
    if (options.collapseWhitespace) {
      result = result.replace(/[ \t]+/g, ' ');
      result = result.replace(/;\s*;/g, ';'); // Clean duplicate semicolons
      result = result.trim();
    }

    return result;
  }

  // Optimization processing controller
  function processOptimization() {
    const rawJS = jsInput.value;
    updateTextStats(rawJS, inputStats);

    if (!rawJS.trim()) {
      jsOutput.value = '';
      statOriginal.textContent = '0 B';
      statMinified.textContent = '0 B';
      statSaved.textContent = '0 B';
      statSavedPercent.textContent = '0.0% reduction';
      statRatio.textContent = '0.0%';
      updateTextStats('', outputStats);
      return;
    }

    const options = {
      stripSingle: optStripSingle.checked,
      stripMulti: optStripMulti.checked,
      collapseWhitespace: optCollapseWhitespace.checked,
      removeEmptyLines: optRemoveEmptyLines.checked
    };

    const minified = minifyJS(rawJS, options);
    jsOutput.value = minified;
    updateTextStats(minified, outputStats);

    const originalBytes = getByteSize(rawJS);
    const minifiedBytes = getByteSize(minified);
    const savedBytes = Math.max(0, originalBytes - minifiedBytes);
    const ratioPercent = originalBytes > 0 ? ((savedBytes / originalBytes) * 100).toFixed(1) : '0.0';

    statOriginal.textContent = formatBytes(originalBytes);
    statMinified.textContent = formatBytes(minifiedBytes);
    statSaved.textContent = formatBytes(savedBytes);
    statSavedPercent.textContent = `${ratioPercent}% reduction`;
    statRatio.textContent = `${ratioPercent}%`;
  }

  // Event Handlers
  jsInput.addEventListener('input', processOptimization);
  btnMinify.addEventListener('click', processOptimization);

  [optStripSingle, optStripMulti, optCollapseWhitespace, optRemoveEmptyLines].forEach(checkbox => {
    checkbox.addEventListener('change', processOptimization);
  });

  // Load Sample
  btnSample.addEventListener('click', () => {
    jsInput.value = SAMPLE_JS;
    processOptimization();
  });

  // Clear
  btnClear.addEventListener('click', () => {
    jsInput.value = '';
    jsOutput.value = '';
    processOptimization();
    jsInput.focus();
  });

  // Copy
  btnCopy.addEventListener('click', () => {
    const content = jsOutput.value;
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
      console.error('Clipboard copy failed:', err);
    });
  });

  // Download
  btnDownload.addEventListener('click', () => {
    const content = jsOutput.value;
    if (!content) return;

    const blob = new Blob([content], { type: 'application/javascript;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'bundle.min.js';
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
      jsInput.value = event.target.result;
      processOptimization();
    };
    reader.readAsText(file);
    fileInput.value = '';
  });

  // Tab key indent
  jsInput.addEventListener('keydown', (e) => {
    if (e.key === 'Tab') {
      e.preventDefault();
      const start = jsInput.selectionStart;
      const end = jsInput.selectionEnd;
      jsInput.value = jsInput.value.substring(0, start) + '  ' + jsInput.value.substring(end);
      jsInput.selectionStart = jsInput.selectionEnd = start + 2;
      processOptimization();
    }
  });

  // Initial calculation
  processOptimization();
});