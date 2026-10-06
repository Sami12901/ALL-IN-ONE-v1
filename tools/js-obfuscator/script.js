// JavaScript Code Obfuscator & Protector - Complete Client-Side Implementation

document.addEventListener('DOMContentLoaded', () => {
  // DOM Elements
  const sourceCodeInput = document.getElementById('source-code');
  const obfuscatedCodeOutput = document.getElementById('obfuscated-code');
  const obfuscateBtn = document.getElementById('obfuscate-btn');
  const formatSourceBtn = document.getElementById('format-source-btn');
  const sampleCodeBtn = document.getElementById('sample-code-btn');
  const clearAllBtn = document.getElementById('clear-all-btn');
  const copyOutputBtn = document.getElementById('copy-output-btn');
  const downloadOutputBtn = document.getElementById('download-output-btn');
  const runTestBtn = document.getElementById('run-test-btn');
  const clearConsoleBtn = document.getElementById('clear-console-btn');

  // Stats
  const inputStats = document.getElementById('input-stats');
  const outputStats = document.getElementById('output-stats');

  // Checkbox Options
  const optMangle = document.getElementById('opt-mangle');
  const optHexStrings = document.getElementById('opt-hex-strings');
  const optStringSplit = document.getElementById('opt-string-split');
  const optDeadCode = document.getElementById('opt-dead-code');
  const optBase64Wrapper = document.getElementById('opt-base64-wrapper');
  const optMinify = document.getElementById('opt-minify');

  // Presets
  const presetLight = document.getElementById('preset-light');
  const presetMedium = document.getElementById('preset-medium');
  const presetHard = document.getElementById('preset-hard');

  // Terminal elements
  const terminalContent = document.getElementById('terminal-content');
  const sandboxStatus = document.getElementById('sandbox-status');
  const sandboxContainer = document.getElementById('sandbox-container');

  // Toast
  const appToast = document.getElementById('app-toast');
  let toastTimer = null;

  function showToast(message) {
    if (toastTimer) clearTimeout(toastTimer);
    appToast.textContent = message;
    appToast.classList.add('show');
    toastTimer = setTimeout(() => {
      appToast.classList.remove('show');
    }, 2200);
  }

  // Reserved JavaScript keywords and standard browser APIs that MUST NEVER be mangled
  const RESERVED_WORDS = new Set([
    'abstract', 'arguments', 'await', 'boolean', 'break', 'byte', 'case', 'catch',
    'char', 'class', 'const', 'continue', 'debugger', 'default', 'delete', 'do',
    'double', 'else', 'enum', 'eval', 'export', 'extends', 'false', 'final',
    'finally', 'float', 'for', 'function', 'goto', 'if', 'implements', 'import',
    'in', 'instanceof', 'int', 'interface', 'let', 'long', 'native', 'new',
    'null', 'package', 'private', 'protected', 'public', 'return', 'short',
    'static', 'super', 'switch', 'synchronized', 'this', 'throw', 'throws',
    'transient', 'true', 'try', 'typeof', 'var', 'void', 'volatile', 'while',
    'with', 'yield', 'console', 'window', 'document', 'alert', 'setTimeout',
    'setInterval', 'clearTimeout', 'clearInterval', 'Object', 'Function', 'Boolean',
    'Symbol', 'Error', 'Number', 'BigInt', 'Math', 'Date', 'String', 'RegExp',
    'Array', 'Map', 'Set', 'JSON', 'Promise', 'Reflect', 'Proxy', 'Int8Array',
    'Uint8Array', 'Uint8ClampedArray', 'Int16Array', 'Uint16Array', 'Int32Array',
    'Uint32Array', 'Float32Array', 'Float64Array', 'BigInt64Array', 'BigUint64Array',
    'ArrayBuffer', 'DataView', 'atob', 'btoa', 'encodeURIComponent', 'decodeURIComponent',
    'encodeURI', 'decodeURI', 'parseFloat', 'parseInt', 'isNaN', 'isFinite',
    'Infinity', 'NaN', 'undefined', 'crypto', 'parent', 'top', 'location',
    'history', 'navigator', 'screen', 'performance', 'addEventListener',
    'removeEventListener', 'dispatchEvent', 'fetch', 'localStorage', 'sessionStorage',
    'postMessage', 'log', 'warn', 'error', 'info', 'table', 'dir', 'name', 'length',
    'prototype', 'toString', 'valueOf', 'slice', 'splice', 'push', 'pop', 'shift',
    'unshift', 'map', 'filter', 'reduce', 'forEach', 'includes', 'indexOf', 'join',
    'split', 'replace', 'replaceAll', 'match', 'test', 'trim', 'toLowerCase', 'toUpperCase'
  ]);

  // Generate random hexadecimal identifier (e.g., _0x4b1e)
  function generateHexId(index) {
    const hex = (index + 0x1a2b).toString(16);
    return `_0x${hex}`;
  }

  // Convert plain ASCII character to \xHH or \uHHHH
  function encodeHexChar(char) {
    const code = char.charCodeAt(0);
    if (code < 128) {
      return '\\x' + code.toString(16).padStart(2, '0');
    }
    return '\\u' + code.toString(16).padStart(4, '0');
  }

  // Strip single-line and multi-line comments safely
  function stripComments(code) {
    // Preserve strings while stripping comments
    let inString = false;
    let stringChar = '';
    let result = '';
    let i = 0;

    while (i < code.length) {
      const c = code[i];
      const next = code[i + 1];

      if (!inString) {
        if (c === '"' || c === "'" || c === '`') {
          inString = true;
          stringChar = c;
          result += c;
          i++;
          continue;
        }
        // Single line comment
        if (c === '/' && next === '/') {
          i += 2;
          while (i < code.length && code[i] !== '\n') {
            i++;
          }
          continue;
        }
        // Multi-line comment
        if (c === '/' && next === '*') {
          i += 2;
          while (i < code.length - 1 && !(code[i] === '*' && code[i + 1] === '/')) {
            i++;
          }
          i += 2;
          continue;
        }
        result += c;
        i++;
      } else {
        result += c;
        if (c === '\\') {
          // Skip escaped char
          if (i + 1 < code.length) {
            result += code[i + 1];
            i += 2;
            continue;
          }
        } else if (c === stringChar) {
          inString = false;
        }
        i++;
      }
    }
    return result;
  }

  // Core Obfuscation Engine
  function obfuscateJavaScript(code, options) {
    if (!code.trim()) return '';

    let transformed = code;

    // 1. Strip comments if minify is active
    if (options.minify) {
      transformed = stripComments(transformed);
    }

    // 2. Identifier Mangling
    if (options.mangle) {
      // Find candidate declared variables & function names
      const declaredVars = new Set();
      
      // Match var / let / const declarations: var a = 1, b = 2;
      const declRegex = /\b(?:var|let|const)\s+([a-zA-Z_$][a-zA-Z0-9_$]*(?:\s*,\s*[a-zA-Z_$][a-zA-Z0-9_$]*)*)/g;
      let match;
      while ((match = declRegex.exec(transformed)) !== null) {
        const parts = match[1].split(',');
        parts.forEach(p => {
          const name = p.trim().split(/\s*=/)[0].trim();
          if (name && !RESERVED_WORDS.has(name) && !name.startsWith('_0x')) {
            declaredVars.add(name);
          }
        });
      }

      // Match function declarations: function foo(a, b)
      const funcRegex = /\bfunction\s+([a-zA-Z_$][a-zA-Z0-9_$]*)\s*\(([^)]*)\)/g;
      while ((match = funcRegex.exec(transformed)) !== null) {
        const fnName = match[1].trim();
        if (fnName && !RESERVED_WORDS.has(fnName) && !fnName.startsWith('_0x')) {
          declaredVars.add(fnName);
        }
        if (match[2]) {
          match[2].split(',').forEach(param => {
            const p = param.trim().split(/\s*=/)[0].trim();
            if (p && !RESERVED_WORDS.has(p) && !p.startsWith('_0x')) {
              declaredVars.add(p);
            }
          });
        }
      }

      // Match arrow function parameters: (x, y) =>
      const arrowRegex = /\(([^)]+)\)\s*=>/g;
      while ((match = arrowRegex.exec(transformed)) !== null) {
        match[1].split(',').forEach(param => {
          const p = param.trim().split(/\s*=/)[0].trim();
          if (p && !RESERVED_WORDS.has(p) && !p.startsWith('_0x')) {
            declaredVars.add(p);
          }
        });
      }

      // Map each declared variable to an obfuscated identifier
      const idMap = new Map();
      let varIndex = 1;
      declaredVars.forEach(name => {
        idMap.set(name, generateHexId(varIndex++));
      });

      // Replace variables in code safely without modifying property access (.foo)
      idMap.forEach((hexId, originalName) => {
        // Regex: word boundary not preceded by a dot
        const varReplaceRegex = new RegExp(`(?<!\\.)\\b${originalName}\\b`, 'g');
        transformed = transformed.replace(varReplaceRegex, hexId);
      });
    }

    // 3. String Splitting & Array Extraction or Hex String Encoding
    if (options.hexStrings || options.stringSplit) {
      // Collect string literals
      const stringLiterals = [];
      const stringPlaceholderPrefix = '___STR_LITERAL_';

      // Parse string literals outside of regex/escapes
      let inQuote = false;
      let quoteChar = '';
      let currentStr = '';
      let reconstructed = '';
      let i = 0;

      while (i < transformed.length) {
        const c = transformed[i];

        if (!inQuote) {
          if (c === '"' || c === "'") {
            inQuote = true;
            quoteChar = c;
            currentStr = '';
            i++;
            continue;
          }
          reconstructed += c;
          i++;
        } else {
          if (c === '\\') {
            if (i + 1 < transformed.length) {
              currentStr += c + transformed[i + 1];
              i += 2;
              continue;
            }
          }
          if (c === quoteChar) {
            inQuote = false;
            const index = stringLiterals.length;
            stringLiterals.push(currentStr);
            reconstructed += `${stringPlaceholderPrefix}${index}___`;
            i++;
            continue;
          }
          currentStr += c;
          i++;
        }
      }

      if (options.stringSplit && stringLiterals.length > 0) {
        // Create an obfuscated string array table
        const tableId = '_0xstr_' + Math.floor(Math.random() * 0xffff).toString(16);
        const getterId = '_0xget_' + Math.floor(Math.random() * 0xffff).toString(16);

        const encodedTableItems = stringLiterals.map(str => {
          let hexed = '';
          for (let s = 0; s < str.length; s++) {
            hexed += encodeHexChar(str[s]);
          }
          return `'${hexed}'`;
        });

        // Replace placeholders with getter calls
        for (let idx = 0; idx < stringLiterals.length; idx++) {
          const ph = `${stringPlaceholderPrefix}${idx}___`;
          reconstructed = reconstructed.split(ph).join(`${getterId}(${idx})`);
        }

        const tableDecl = `var ${tableId}=[${encodedTableItems.join(',')}];var ${getterId}=function(n){return ${tableId}[n];};\n`;
        transformed = tableDecl + reconstructed;
      } else {
        // Just hex encode strings in place
        for (let idx = 0; idx < stringLiterals.length; idx++) {
          const ph = `${stringPlaceholderPrefix}${idx}___`;
          const raw = stringLiterals[idx];
          let hexed = '';
          for (let s = 0; s < raw.length; s++) {
            hexed += encodeHexChar(raw[s]);
          }
          reconstructed = reconstructed.split(ph).join(`'${hexed}'`);
        }
        transformed = reconstructed;
      }
    }

    // 4. Dead Code Injection
    if (options.deadCode) {
      const deadFuncId = '_0xdc_' + Math.floor(Math.random() * 0xffff).toString(16);
      const deadSnippet = `\n(function(){var ${deadFuncId}=function(){return !!(Math.sin(0)===0);};if(!${deadFuncId}()){var _0xdeadVal=Math.cos(0)+1;return _0xdeadVal;}})();\n`;
      transformed = deadSnippet + transformed;
    }

    // 5. Minify whitespace if enabled
    if (options.minify) {
      // Normalize whitespace while preserving line endings / semicolons
      transformed = transformed
        .split('\n')
        .map(line => line.trim())
        .filter(line => line.length > 0)
        .join('\n');
    }

    // 6. Base64 Eval Wrapper
    if (options.base64Wrapper) {
      // Encode string to base64 with utf8 support
      const utf8Bytes = new TextEncoder().encode(transformed);
      let binaryStr = '';
      for (let b = 0; b < utf8Bytes.length; b++) {
        binaryStr += String.fromCharCode(utf8Bytes[b]);
      }
      const b64 = btoa(binaryStr);

      const wrapperVar = '_0xb64_' + Math.floor(Math.random() * 0xffff).toString(16);
      transformed = `eval((function(${wrapperVar}){var b=atob(${wrapperVar}),u=new Uint8Array(b.length);for(var i=0;i<b.length;i++)u[i]=b.charCodeAt(i);return new TextDecoder().decode(u);})("${b64}"));`;
    }

    return transformed;
  }

  // Update line and byte counters
  function updateStats() {
    const src = sourceCodeInput.value;
    const srcBytes = new TextEncoder().encode(src).length;
    const srcLines = src ? src.split('\n').length : 0;
    inputStats.textContent = `${srcBytes} bytes | ${srcLines} lines`;

    const out = obfuscatedCodeOutput.value;
    const outBytes = new TextEncoder().encode(out).length;
    if (srcBytes > 0 && outBytes > 0) {
      const ratio = Math.round(((outBytes - srcBytes) / srcBytes) * 100);
      const sign = ratio >= 0 ? '+' : '';
      outputStats.textContent = `${outBytes} bytes | ${sign}${ratio}%`;
    } else {
      outputStats.textContent = `${outBytes} bytes | 0% change`;
    }
  }

  // Obfuscate Action
  function runObfuscation() {
    const raw = sourceCodeInput.value;
    if (!raw.trim()) {
      obfuscatedCodeOutput.value = '';
      updateStats();
      showToast('Please enter JavaScript code first');
      return;
    }

    const options = {
      mangle: optMangle.checked,
      hexStrings: optHexStrings.checked,
      stringSplit: optStringSplit.checked,
      deadCode: optDeadCode.checked,
      base64Wrapper: optBase64Wrapper.checked,
      minify: optMinify.checked
    };

    try {
      const result = obfuscateJavaScript(raw, options);
      obfuscatedCodeOutput.value = result;
      updateStats();
      showToast('Code obfuscated successfully!');
    } catch (err) {
      console.error('Obfuscation failed:', err);
      showToast('Obfuscation error: ' + err.message);
    }
  }

  // Sandbox Runner
  function runSandboxTest() {
    const code = obfuscatedCodeOutput.value || sourceCodeInput.value;
    if (!code.trim()) {
      showToast('No code to execute. Obfuscate code first!');
      return;
    }

    // Reset terminal
    terminalContent.innerHTML = '';
    sandboxStatus.textContent = 'Status: Executing...';
    sandboxStatus.style.color = 'var(--warning)';

    addLogEntry('info', '[Initializing isolated sandboxed worker...]');

    // Create fresh iframe
    sandboxContainer.innerHTML = '';
    const iframe = document.createElement('iframe');
    iframe.setAttribute('sandbox', 'allow-scripts');
    iframe.style.display = 'none';
    sandboxContainer.appendChild(iframe);

    // Escape code for embedding inside script
    const safeCode = code.replace(/<\/script>/gi, '<\\/script>');

    const harness = `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body>
<script>
  (function() {
    const sendLog = (level, args) => {
      try {
        const text = args.map(arg => {
          if (arg === null) return 'null';
          if (arg === undefined) return 'undefined';
          if (typeof arg === 'object') {
            try { return JSON.stringify(arg, null, 2); } catch(e) { return String(arg); }
          }
          return String(arg);
        }).join(' ');
        window.parent.postMessage({ type: 'sandbox_msg', level: level, text: text }, '*');
      } catch(e) {}
    };

    console.log = (...args) => sendLog('log', args);
    console.info = (...args) => sendLog('info', args);
    console.warn = (...args) => sendLog('warn', args);
    console.error = (...args) => sendLog('error', args);

    window.onerror = function(msg, url, line, col, err) {
      sendLog('error', ['Runtime Error (line ' + line + '): ' + msg]);
      return true;
    };

    try {
      ${safeCode}
    } catch(err) {
      sendLog('error', [err && err.stack ? err.stack : String(err)]);
    }

    sendLog('done', ['Execution finished cleanly.']);
  })();
<\/script>
</body>
</html>`;

    iframe.srcdoc = harness;
  }

  // Handle messages posted from sandbox iframe
  window.addEventListener('message', (event) => {
    if (!event.data || event.data.type !== 'sandbox_msg') return;
    const { level, text } = event.data;
    addLogEntry(level, text);

    if (level === 'done') {
      sandboxStatus.textContent = 'Status: Completed';
      sandboxStatus.style.color = '#3fb950';
    } else if (level === 'error') {
      sandboxStatus.textContent = 'Status: Error';
      sandboxStatus.style.color = '#f85149';
    }
  });

  function addLogEntry(level, text) {
    const div = document.createElement('div');
    div.className = `log-entry log-${level}`;
    const time = new Date().toLocaleTimeString();
    div.textContent = `[${time}] ${text}`;
    terminalContent.appendChild(div);
    terminalContent.scrollTop = terminalContent.scrollHeight;
  }

  // Presets
  presetLight.addEventListener('click', () => {
    [presetLight, presetMedium, presetHard].forEach(b => b.classList.remove('active'));
    presetLight.classList.add('active');
    optMangle.checked = true;
    optHexStrings.checked = true;
    optStringSplit.checked = false;
    optDeadCode.checked = false;
    optBase64Wrapper.checked = false;
    optMinify.checked = true;
    showToast('Applied Lightweight preset');
  });

  presetMedium.addEventListener('click', () => {
    [presetLight, presetMedium, presetHard].forEach(b => b.classList.remove('active'));
    presetMedium.classList.add('active');
    optMangle.checked = true;
    optHexStrings.checked = true;
    optStringSplit.checked = true;
    optDeadCode.checked = false;
    optBase64Wrapper.checked = false;
    optMinify.checked = true;
    showToast('Applied Balanced preset');
  });

  presetHard.addEventListener('click', () => {
    [presetLight, presetMedium, presetHard].forEach(b => b.classList.remove('active'));
    presetHard.classList.add('active');
    optMangle.checked = true;
    optHexStrings.checked = true;
    optStringSplit.checked = true;
    optDeadCode.checked = true;
    optBase64Wrapper.checked = true;
    optMinify.checked = true;
    showToast('Applied Heavy Stealth preset');
  });

  // Buttons
  obfuscateBtn.addEventListener('click', runObfuscation);

  formatSourceBtn.addEventListener('click', () => {
    const code = sourceCodeInput.value;
    if (!code.trim()) return;
    // Basic beautify indentation
    let indent = 0;
    const lines = code.split('\n');
    const formatted = lines.map(line => {
      let trimmed = line.trim();
      if (trimmed.endsWith('}') || trimmed.startsWith('}')) {
        indent = Math.max(0, indent - 1);
      }
      const indented = '  '.repeat(indent) + trimmed;
      if (trimmed.endsWith('{')) {
        indent++;
      }
      return indented;
    }).join('\n');
    sourceCodeInput.value = formatted;
    updateStats();
    showToast('Indented source code');
  });

  sampleCodeBtn.addEventListener('click', () => {
    sourceCodeInput.value = `// Secure Vault Access Simulator
function authenticateClient(username, accessKey) {
  const secretToken = "AUTH_SECURE_TOKEN_9824";
  console.log("Authenticating user: " + username);

  if (accessKey === secretToken) {
    console.log("Access Granted! Welcome, " + username);
    return true;
  } else {
    console.warn("Access Denied: Invalid credentials.");
    return false;
  }
}

// Execute authentication test
const user = "Administrator";
const key = "AUTH_SECURE_TOKEN_9824";
authenticateClient(user, key);`;
    updateStats();
    showToast('Sample code loaded');
  });

  clearAllBtn.addEventListener('click', () => {
    sourceCodeInput.value = '';
    obfuscatedCodeOutput.value = '';
    updateStats();
    showToast('Cleared code inputs');
  });

  copyOutputBtn.addEventListener('click', async () => {
    const code = obfuscatedCodeOutput.value;
    if (!code) {
      showToast('No obfuscated code to copy');
      return;
    }
    try {
      await navigator.clipboard.writeText(code);
      showToast('Obfuscated code copied to clipboard!');
    } catch {
      showToast('Failed to copy');
    }
  });

  downloadOutputBtn.addEventListener('click', () => {
    const code = obfuscatedCodeOutput.value;
    if (!code) {
      showToast('No obfuscated code to download');
      return;
    }
    const blob = new Blob([code], { type: 'text/javascript;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'obfuscated.bundle.js';
    a.click();
    URL.revokeObjectURL(url);
    showToast('Downloaded obfuscated.bundle.js');
  });

  runTestBtn.addEventListener('click', runSandboxTest);

  clearConsoleBtn.addEventListener('click', () => {
    terminalContent.innerHTML = '<div class="log-entry log-info">[Console cleared]</div>';
    sandboxStatus.textContent = 'Status: Idle';
    sandboxStatus.style.color = '#8b949e';
  });

  sourceCodeInput.addEventListener('input', updateStats);

  // Initialize
  updateStats();
});