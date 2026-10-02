// HTML Output Viewer Logic

document.addEventListener('DOMContentLoaded', () => {
  // DOM Elements
  const editorHtml = document.getElementById('editor-html');
  const editorCss = document.getElementById('editor-css');
  const editorJs = document.getElementById('editor-js');
  const previewFrame = document.getElementById('preview-frame');
  const previewStatus = document.getElementById('preview-status');
  const editorStats = document.getElementById('editor-stats');

  const runBtn = document.getElementById('run-btn');
  const clearBtn = document.getElementById('clear-btn');
  const downloadBtn = document.getElementById('download-btn');
  const autoRunCheckbox = document.getElementById('auto-run');
  const templateSelect = document.getElementById('template-select');
  const popoutBtn = document.getElementById('popout-btn');

  const tabButtons = document.querySelectorAll('.tab-btn');
  const editorPanes = document.querySelectorAll('.editor-pane');
  const deviceButtons = document.querySelectorAll('.device-btn[data-width]');

  const consoleLogs = document.getElementById('console-logs');
  const errorBadge = document.getElementById('error-badge');
  const clearConsoleBtn = document.getElementById('clear-console-btn');

  let activeTab = 'html';
  let autoRunTimer = null;
  let errorCount = 0;
  let logCount = 0;

  // Starter Templates
  const TEMPLATES = {
    counter: {
      html: `<div class="counter-card">
  <h2>Interactive Counter</h2>
  <p class="subtitle">Vanilla JavaScript State Management</p>
  <div class="count-display" id="count">0</div>
  <div class="button-group">
    <button class="btn btn-dec" id="decrement">- Decrement</button>
    <button class="btn btn-reset" id="reset">Reset</button>
    <button class="btn btn-inc" id="increment">+ Increment</button>
  </div>
</div>`,
      css: `body {
  margin: 0;
  padding: 0;
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  background: #0f172a;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
  color: #f8fafc;
}

.counter-card {
  background: rgba(30, 41, 59, 0.7);
  backdrop-filter: blur(16px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  padding: 2.5rem;
  border-radius: 16px;
  text-align: center;
  box-shadow: 0 12px 32px rgba(0, 0, 0, 0.5);
  max-width: 360px;
  width: 90%;
}

h2 {
  margin: 0 0 0.5rem 0;
  font-size: 1.5rem;
}

.subtitle {
  color: #94a3b8;
  font-size: 0.85rem;
  margin: 0 0 1.5rem 0;
}

.count-display {
  font-size: 4.5rem;
  font-weight: 800;
  color: #38bdf8;
  margin: 1rem 0;
  transition: transform 0.15s ease, color 0.2s ease;
}

.button-group {
  display: flex;
  gap: 0.5rem;
  justify-content: center;
}

.btn {
  padding: 0.65rem 1rem;
  border-radius: 8px;
  border: none;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-inc {
  background: #38bdf8;
  color: #0f172a;
}

.btn-dec {
  background: #f43f5e;
  color: #ffffff;
}

.btn-reset {
  background: #334155;
  color: #f8fafc;
}

.btn:hover {
  transform: translateY(-2px);
  filter: brightness(1.1);
}`,
      js: `// State
let count = 0;

const display = document.getElementById('count');
const incBtn = document.getElementById('increment');
const decBtn = document.getElementById('decrement');
const resetBtn = document.getElementById('reset');

function updateDisplay(delta) {
  if (delta === 0) {
    count = 0;
  } else {
    count += delta;
  }
  display.textContent = count;
  display.style.transform = 'scale(1.2)';
  setTimeout(() => {
    display.style.transform = 'scale(1)';
  }, 120);

  console.log('Counter updated:', count);
}

incBtn.addEventListener('click', () => updateDisplay(1));
decBtn.addEventListener('click', () => updateDisplay(-1));
resetBtn.addEventListener('click', () => updateDisplay(0));

console.log('Counter initialized successfully.');`
    },

    card: {
      html: `<div class="card">
  <div class="card-icon">&#10024;</div>
  <h3 class="card-title">Glassmorphism UI</h3>
  <p class="card-text">A modern aesthetic with semi-transparent frosted surfaces, subtle borders, and smooth shadows.</p>
  <a href="#" class="card-action">Learn More &rarr;</a>
</div>`,
      css: `body {
  margin: 0;
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  background: radial-gradient(circle at top left, #3b82f6, #0f172a 70%);
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
}

.card {
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 20px;
  padding: 2.5rem;
  max-width: 320px;
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  box-shadow: 0 15px 35px rgba(0, 0, 0, 0.3);
  color: #ffffff;
  transition: transform 0.3s ease, border-color 0.3s ease;
}

.card:hover {
  transform: translateY(-6px);
  border-color: rgba(255, 255, 255, 0.4);
}

.card-icon {
  font-size: 2rem;
  margin-bottom: 1rem;
}

.card-title {
  margin: 0 0 0.75rem 0;
  font-size: 1.4rem;
}

.card-text {
  color: rgba(255, 255, 255, 0.8);
  font-size: 0.95rem;
  line-height: 1.6;
  margin: 0 0 1.5rem 0;
}

.card-action {
  color: #38bdf8;
  text-decoration: none;
  font-weight: 700;
  font-size: 0.9rem;
}

.card-action:hover {
  text-decoration: underline;
}`,
      js: `document.querySelector('.card').addEventListener('click', (e) => {
  console.log('Glassmorphism card clicked at coordinates:', e.clientX, e.clientY);
});`
    },

    canvas: {
      html: `<canvas id="artCanvas"></canvas>`,
      css: `body {
  margin: 0;
  overflow: hidden;
  background: #050505;
}
canvas {
  display: block;
}`,
      js: `const canvas = document.getElementById('artCanvas');
const ctx = canvas.getContext('2d');

let width = canvas.width = window.innerWidth;
let height = canvas.height = window.innerHeight;

window.addEventListener('resize', () => {
  width = canvas.width = window.innerWidth;
  height = canvas.height = window.innerHeight;
});

const particles = [];
const PARTICLE_COUNT = 50;

for (let i = 0; i < PARTICLE_COUNT; i++) {
  particles.push({
    x: Math.random() * width,
    y: Math.random() * height,
    vx: (Math.random() - 0.5) * 1.5,
    vy: (Math.random() - 0.5) * 1.5,
    radius: Math.random() * 3 + 1,
    color: \`hsl(\${Math.random() * 360}, 80%, 65%)\`
  });
}

function animate() {
  ctx.fillStyle = 'rgba(5, 5, 5, 0.15)';
  ctx.fillRect(0, 0, width, height);

  particles.forEach(p => {
    p.x += p.vx;
    p.y += p.vy;

    if (p.x < 0 || p.x > width) p.vx *= -1;
    if (p.y < 0 || p.y > height) p.vy *= -1;

    ctx.beginPath();
    ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
    ctx.fillStyle = p.color;
    ctx.fill();
  });

  requestAnimationFrame(animate);
}

animate();
console.log('Particle simulation running on canvas.');`
    },

    blank: {
      html: '',
      css: '',
      js: ''
    }
  };

  /**
   * Update active editor stats (lines & chars)
   */
  function updateStats() {
    let activeEditor = editorHtml;
    if (activeTab === 'css') activeEditor = editorCss;
    if (activeTab === 'js') activeEditor = editorJs;

    const val = activeEditor.value;
    const lines = val ? val.split('\n').length : 0;
    const chars = val.length;

    editorStats.textContent = `Tab: ${activeTab.toUpperCase()} | Lines: ${lines} | Chars: ${chars}`;
  }

  /**
   * Switch active code editor tab
   */
  function switchTab(tabName) {
    activeTab = tabName;

    tabButtons.forEach(btn => {
      btn.classList.toggle('active', btn.getAttribute('data-tab') === tabName);
    });

    editorPanes.forEach(pane => {
      pane.classList.toggle('active', pane.id === `pane-${tabName}`);
    });

    updateStats();
  }

  /**
   * Clear console logs display
   */
  function clearConsole() {
    consoleLogs.innerHTML = `
      <div style="color: var(--text-tertiary); font-style: italic; padding: 0.4rem;">
        Console is clear. Runtime errors and console logs will appear here.
      </div>
    `;
    errorCount = 0;
    logCount = 0;
    errorBadge.style.display = 'none';
  }

  /**
   * Append a log entry to the console panel
   */
  function addConsoleLog(type, message, time) {
    if (logCount === 0 && errorCount === 0) {
      consoleLogs.innerHTML = '';
    }

    if (type === 'error') {
      errorCount++;
      errorBadge.textContent = `${errorCount} Error${errorCount === 1 ? '' : 's'}`;
      errorBadge.style.display = 'inline-block';
    } else {
      logCount++;
    }

    const logItem = document.createElement('div');
    logItem.className = `log-item ${type}`;

    let icon = '&bull;';
    if (type === 'error') icon = '&#10060;';
    else if (type === 'warn') icon = '&#9888;&#65039;';
    else if (type === 'log') icon = '&#128172;';

    const timestamp = time || new Date().toLocaleTimeString();

    logItem.innerHTML = `
      <span class="log-time">[${timestamp}]</span>
      <span>${icon}</span>
      <span style="flex: 1;">${escapeHTML(message)}</span>
    `;

    consoleLogs.appendChild(logItem);
    consoleLogs.scrollTop = consoleLogs.scrollHeight;
  }

  /**
   * Escape HTML for console output
   */
  function escapeHTML(str) {
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  /**
   * Construct full combined document source for preview iframe
   */
  function buildPreviewHTML(html, css, js) {
    // Communication bridge injected into iframe
    const bridgeScript = `
<script>
  (function() {
    function sendLog(type, message, line) {
      try {
        window.parent.postMessage({
          source: 'html-viewer-sandbox',
          type: type,
          message: String(message),
          line: line || null,
          time: new Date().toLocaleTimeString()
        }, '*');
      } catch(e) {}
    }

    window.onerror = function(msg, url, line, col, error) {
      const lineInfo = line ? (' (line ' + line + ')') : '';
      sendLog('error', msg + lineInfo, line);
      return false;
    };

    window.addEventListener('unhandledrejection', function(event) {
      const reason = event.reason ? (event.reason.message || event.reason) : 'Promise Rejected';
      sendLog('error', 'Unhandled Promise Rejection: ' + reason);
    });

    const origLog = console.log;
    console.log = function(...args) {
      origLog.apply(console, args);
      sendLog('log', args.map(a => {
        try {
          return typeof a === 'object' ? JSON.stringify(a) : String(a);
        } catch(e) {
          return String(a);
        }
      }).join(' '));
    };

    const origWarn = console.warn;
    console.warn = function(...args) {
      origWarn.apply(console, args);
      sendLog('warn', args.map(a => typeof a === 'object' ? JSON.stringify(a) : String(a)).join(' '));
    };

    const origError = console.error;
    console.error = function(...args) {
      origError.apply(console, args);
      sendLog('error', args.map(a => typeof a === 'object' ? JSON.stringify(a) : String(a)).join(' '));
    };
  })();
<\/script>
`;

    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
${css}
  </style>
</head>
<body>
${html}
${bridgeScript}
  <script>
    try {
${js}
    } catch(err) {
      console.error(err.name + ': ' + err.message);
    }
  <\/script>
</body>
</html>`;
  }

  /**
   * Run and render current code in sandbox iframe
   */
  function runCode() {
    previewStatus.textContent = 'Rendering...';
    previewStatus.style.background = 'rgba(245, 158, 11, 0.2)';
    previewStatus.style.color = '#f59e0b';

    clearConsole();

    const html = editorHtml.value;
    const css = editorCss.value;
    const js = editorJs.value;

    const fullSource = buildPreviewHTML(html, css, js);

    // Set srcdoc on iframe
    previewFrame.srcdoc = fullSource;

    setTimeout(() => {
      previewStatus.textContent = 'Live';
      previewStatus.style.background = 'rgba(16, 185, 129, 0.2)';
      previewStatus.style.color = '#10b981';
    }, 200);
  }

  /**
   * Handle changes with auto-run debouncing
   */
  function onCodeChange() {
    updateStats();

    if (autoRunCheckbox.checked) {
      if (autoRunTimer) clearTimeout(autoRunTimer);
      autoRunTimer = setTimeout(() => {
        runCode();
      }, 500);
    }
  }

  /**
   * Load template into editors
   */
  function loadTemplate(key) {
    const tmpl = TEMPLATES[key];
    if (!tmpl) return;

    editorHtml.value = tmpl.html;
    editorCss.value = tmpl.css;
    editorJs.value = tmpl.js;

    updateStats();
    runCode();
  }

  /**
   * Download combined HTML file
   */
  function downloadHTML() {
    const html = editorHtml.value;
    const css = editorCss.value;
    const js = editorJs.value;

    const standaloneHTML = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Exported Project - ALL IN ONE</title>
  <style>
${css}
  </style>
</head>
<body>
${html}

  <script>
${js}
  <\/script>
</body>
</html>`;

    const blob = new Blob([standaloneHTML], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'sandbox-project.html';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  /**
   * Enable Tab key indentation for textareas
   */
  function enableTabIndent(textarea) {
    textarea.addEventListener('keydown', (e) => {
      if (e.key === 'Tab') {
        e.preventDefault();
        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;

        // Insert 2 spaces
        textarea.value = textarea.value.substring(0, start) + '  ' + textarea.value.substring(end);
        textarea.selectionStart = textarea.selectionEnd = start + 2;

        onCodeChange();
      }
    });
  }

  // Set up tab indent and input listeners for all three textareas
  [editorHtml, editorCss, editorJs].forEach(editor => {
    enableTabIndent(editor);
    editor.addEventListener('input', onCodeChange);
  });

  // Tab switching buttons
  tabButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const tab = btn.getAttribute('data-tab');
      switchTab(tab);
    });
  });

  // Device viewport switching
  deviceButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      deviceButtons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const width = btn.getAttribute('data-width');
      previewFrame.style.width = width;
    });
  });

  // Popout preview into new window
  popoutBtn.addEventListener('click', () => {
    const fullSource = buildPreviewHTML(editorHtml.value, editorCss.value, editorJs.value);
    const popoutWindow = window.open('', '_blank');
    if (popoutWindow) {
      popoutWindow.document.open();
      popoutWindow.document.write(fullSource);
      popoutWindow.document.close();
    } else {
      alert('Pop-up blocked by browser. Please allow pop-ups for this site.');
    }
  });

  // Action Buttons
  runBtn.addEventListener('click', runCode);

  clearBtn.addEventListener('click', () => {
    if (confirm('Are you sure you want to clear all code editors?')) {
      editorHtml.value = '';
      editorCss.value = '';
      editorJs.value = '';
      templateSelect.value = 'blank';
      clearConsole();
      updateStats();
      runCode();
    }
  });

  downloadBtn.addEventListener('click', downloadHTML);

  clearConsoleBtn.addEventListener('click', clearConsole);

  templateSelect.addEventListener('change', (e) => {
    loadTemplate(e.target.value);
  });

  // Listen for messages from iframe sandbox
  window.addEventListener('message', (event) => {
    const data = event.data;
    if (!data || data.source !== 'html-viewer-sandbox') return;

    addConsoleLog(data.type, data.message, data.time);
  });

  // Initial setup: load default counter template
  loadTemplate('counter');
});