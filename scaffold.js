const fs = require('fs');
const path = require('path');
const https = require('https');

// Path configurations
const WORKSPACE = __dirname;
const TOOLS_DB_PATH = path.join(WORKSPACE, 'data', 'tools-db.json');
const TOOLS_DIR = path.join(WORKSPACE, 'tools');
const LIB_DIR = path.join(WORKSPACE, 'assets', 'lib');

// Ensure lib folder exists
if (!fs.existsSync(LIB_DIR)) {
  fs.mkdirSync(LIB_DIR, { recursive: true });
}

// 1. Download QRious.js for local offline support
const qriousUrl = 'https://cdnjs.cloudflare.com/ajax/libs/qrious/4.0.2/qrious.min.js';
const qriousPath = path.join(LIB_DIR, 'qrious.min.js');

console.log('Fetching qrious.min.js for offline QR Code generation...');
https.get(qriousUrl, (res) => {
  const fileStream = fs.createWriteStream(qriousPath);
  res.pipe(fileStream);
  fileStream.on('finish', () => {
    fileStream.close();
    console.log('Successfully downloaded qrious.min.js locally.');
    runScaffolding();
  });
}).on('error', (err) => {
  console.error('Error downloading qrious.js, writing fallback mock stub:', err.message);
  fs.writeFileSync(qriousPath, '/* qrious fallback stub */');
  runScaffolding();
});

// 2. Main Scaffolding Logic
function runScaffolding() {
  if (!fs.existsSync(TOOLS_DB_PATH)) {
    console.error('tools-db.json not found! Scaffold aborted.');
    return;
  }

  const tools = JSON.parse(fs.readFileSync(TOOLS_DB_PATH, 'utf-8'));
  console.log(`Starting scaffolding for ${tools.length} tools...`);

  tools.forEach(tool => {
    const toolDir = path.join(TOOLS_DIR, tool.id);
    if (!fs.existsSync(toolDir)) {
      fs.mkdirSync(toolDir, { recursive: true });
    }

    // Determine custom layouts or generic stubs
    const htmlContent = getToolHtml(tool);
    const jsContent = getToolJs(tool);

    fs.writeFileSync(path.join(toolDir, 'index.html'), htmlContent, 'utf-8');
    fs.writeFileSync(path.join(toolDir, 'script.js'), jsContent, 'utf-8');
  });

  console.log('Scaffolding complete. All 150 tools initialized.');
}

// 3. Template HTML Generator
function getToolHtml(tool) {
  const prefix = '../../';
  const categoryName = tool.category.charAt(0).toUpperCase() + tool.category.slice(1);
  
  // Custom Head Scripts imports (e.g. for qrious library)
  let extraHeadScripts = '';
  if (tool.id === 'qr-code-generator') {
    extraHeadScripts = `<script src="${prefix}assets/lib/qrious.min.js"></script>`;
  }

  // Visual layout content depending on tool type
  let workspaceMarkup = '';
  
  if (tool.id === 'password-generator') {
    workspaceMarkup = `
      <div class="tool-workarea split-view">
        <div class="tool-panel glass-panel">
          <h2 class="panel-title">Configuration</h2>
          <div class="form-group">
            <label for="length">Password Length: <span id="length-val" class="range-value">16</span></label>
            <div class="range-group">
              <input type="range" id="length" min="8" max="64" value="16" class="range-slider">
            </div>
          </div>
          <div class="checkbox-group">
            <label class="checkbox-label"><input type="checkbox" id="upper" checked> Include Uppercase (A-Z)</label>
            <label class="checkbox-label"><input type="checkbox" id="lower" checked> Include Lowercase (a-z)</label>
            <label class="checkbox-label"><input type="checkbox" id="numbers" checked> Include Numbers (0-9)</label>
            <label class="checkbox-label"><input type="checkbox" id="symbols" checked> Include Symbols (!@#$%...)</label>
          </div>
          <button id="generate" class="btn btn-primary" style="margin-top: 0.5rem;">Generate Password</button>
        </div>
        <div class="tool-panel glass-panel">
          <h2 class="panel-title">Generated Result</h2>
          <div class="form-group" style="position: relative;">
            <div id="password-output" class="output-box" style="font-size: 1.25rem; font-weight: 600; padding-right: 4.5rem; letter-spacing: 0.05em; min-height: 80px; display: flex; align-items: center; word-break: break-all;"></div>
            <button id="copy-btn" class="copy-btn">Copy</button>
          </div>
          <div class="form-group">
            <label>Strength Level</label>
            <div style="height: 8px; width: 100%; background: var(--bg-tertiary); border-radius: var(--radius-full); overflow: hidden;">
              <div id="strength-bar" style="height: 100%; width: 0%; transition: var(--transition);"></div>
            </div>
            <span id="strength-text" style="font-size: 0.85rem; font-weight: 600; color: var(--text-secondary);">Select characters</span>
          </div>
        </div>
      </div>
    `;
  } 
  else if (tool.id === 'qr-code-generator') {
    workspaceMarkup = `
      <div class="tool-workarea split-view">
        <div class="tool-panel glass-panel">
          <h2 class="panel-title">Code Settings</h2>
          <div class="form-group">
            <label for="qr-input">Enter Text or URL</label>
            <textarea id="qr-input" class="form-textarea" placeholder="Type text or paste URL to encode..." style="min-height: 120px;"></textarea>
          </div>
          <div class="form-group">
            <label for="qr-size">QR Code Size</label>
            <select id="qr-size" class="form-select">
              <option value="150">150 x 150 px</option>
              <option value="200" selected>200 x 200 px</option>
              <option value="250">250 x 250 px</option>
              <option value="300">300 x 300 px</option>
            </select>
          </div>
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
            <div class="form-group">
              <label for="qr-fg">Foreground Color</label>
              <input type="color" id="qr-fg" class="form-input" value="#000000" style="padding: 0.25rem; height: 40px; cursor: pointer;">
            </div>
            <div class="form-group">
              <label for="qr-bg">Background Color</label>
              <input type="color" id="qr-bg" class="form-input" value="#ffffff" style="padding: 0.25rem; height: 40px; cursor: pointer;">
            </div>
          </div>
        </div>
        <div class="tool-panel glass-panel" style="align-items: center; justify-content: center; gap: 1.5rem;">
          <h2 class="panel-title" style="align-self: flex-start; width: 100%;">QR Preview</h2>
          <div style="background: white; padding: 1.5rem; border-radius: var(--radius-md); box-shadow: var(--shadow-md); display: flex; align-items: center; justify-content: center; min-height: 230px; min-width: 230px;">
            <canvas id="qr-canvas"></canvas>
          </div>
          <div class="action-bar" style="justify-content: center; width: 100%;">
            <button id="download-png" class="btn btn-primary">Download PNG</button>
          </div>
        </div>
      </div>
    `;
  }
  else if (tool.id === 'text-case-converter') {
    workspaceMarkup = `
      <div class="tool-workarea">
        <div class="tool-panel glass-panel">
          <h2 class="panel-title">Text Workbench</h2>
          <div class="form-group">
            <label for="case-input">Input Text</label>
            <textarea id="case-input" class="form-textarea" placeholder="Type or paste your text here to convert its case..."></textarea>
          </div>
          <div class="action-bar">
            <button class="btn btn-secondary case-btn" data-case="upper">UPPERCASE</button>
            <button class="btn btn-secondary case-btn" data-case="lower">lowercase</button>
            <button class="btn btn-secondary case-btn" data-case="title">Title Case</button>
            <button class="btn btn-secondary case-btn" data-case="sentence">Sentence case</button>
            <button class="btn btn-secondary case-btn" data-case="camel">camelCase</button>
            <button class="btn btn-secondary case-btn" data-case="snake">snake_case</button>
            <button class="btn btn-primary" id="copy-btn" style="margin-left: auto;">Copy Output</button>
            <button class="btn btn-secondary" id="clear-btn">Clear</button>
          </div>
        </div>
      </div>
    `;
  }
  else if (tool.id === 'word-counter') {
    workspaceMarkup = `
      <div class="tool-workarea">
        <div class="tool-panel glass-panel">
          <h2 class="panel-title">Write or Paste Text</h2>
          <div class="form-group">
            <textarea id="word-input" class="form-textarea" placeholder="Start typing to count words, sentences, reading speed..." style="min-height: 250px;"></textarea>
          </div>
          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(130px, 1fr)); gap: 1rem; margin-top: 0.5rem;">
            <div style="background: var(--bg-tertiary); padding: 1rem; border-radius: var(--radius-md); text-align: center; border: 1px solid var(--border);">
              <div id="word-count" style="font-size: 1.75rem; font-weight: 800; color: var(--accent);">0</div>
              <span style="font-size: 0.8rem; color: var(--text-tertiary); font-weight: 600; text-transform: uppercase;">Words</span>
            </div>
            <div style="background: var(--bg-tertiary); padding: 1rem; border-radius: var(--radius-md); text-align: center; border: 1px solid var(--border);">
              <div id="char-count" style="font-size: 1.75rem; font-weight: 800; color: var(--accent);">0</div>
              <span style="font-size: 0.8rem; color: var(--text-tertiary); font-weight: 600; text-transform: uppercase;">Characters</span>
            </div>
            <div style="background: var(--bg-tertiary); padding: 1rem; border-radius: var(--radius-md); text-align: center; border: 1px solid var(--border);">
              <div id="sentence-count" style="font-size: 1.75rem; font-weight: 800; color: var(--accent);">0</div>
              <span style="font-size: 0.8rem; color: var(--text-tertiary); font-weight: 600; text-transform: uppercase;">Sentences</span>
            </div>
            <div style="background: var(--bg-tertiary); padding: 1rem; border-radius: var(--radius-md); text-align: center; border: 1px solid var(--border);">
              <div id="read-time" style="font-size: 1.75rem; font-weight: 800; color: var(--accent);">0m 0s</div>
              <span style="font-size: 0.8rem; color: var(--text-tertiary); font-weight: 600; text-transform: uppercase;">Reading Time</span>
            </div>
          </div>
          <div style="display: flex; gap: 1rem; justify-content: flex-end; margin-top: 0.5rem;">
            <button id="clear-btn" class="btn btn-secondary">Clear</button>
          </div>
        </div>
      </div>
    `;
  }
  else if (tool.id === 'character-counter') {
    workspaceMarkup = `
      <div class="tool-workarea split-view">
        <div class="tool-panel glass-panel">
          <h2 class="panel-title">Text Input</h2>
          <div class="form-group">
            <textarea id="char-input" class="form-textarea" placeholder="Start typing to monitor character limits, glyph counts, and sizes..." style="min-height: 250px;"></textarea>
          </div>
          <div class="checkbox-group">
            <label class="checkbox-label"><input type="checkbox" id="count-spaces" checked> Count Spaces</label>
            <label class="checkbox-label"><input type="checkbox" id="count-punct" checked> Count Punctuation</label>
          </div>
        </div>
        <div class="tool-panel glass-panel">
          <h2 class="panel-title">Character Metrics</h2>
          <div style="display: flex; flex-direction: column; gap: 1.25rem;">
            <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid var(--border); padding-bottom: 0.5rem;">
              <span style="font-weight: 600; color: var(--text-secondary);">Total Glyphs (Visuals)</span>
              <span id="stat-glyphs" style="font-family: monospace; font-size: 1.5rem; font-weight: 800; color: var(--accent);">0</span>
            </div>
            <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid var(--border); padding-bottom: 0.5rem;">
              <span style="font-weight: 600; color: var(--text-secondary);">Space Characters</span>
              <span id="stat-spaces" style="font-family: monospace; font-size: 1.25rem; font-weight: 700; color: var(--text-secondary);">0</span>
            </div>
            <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid var(--border); padding-bottom: 0.5rem;">
              <span style="font-weight: 600; color: var(--text-secondary);">Punctuation Characters</span>
              <span id="stat-puncts" style="font-family: monospace; font-size: 1.25rem; font-weight: 700; color: var(--text-secondary);">0</span>
            </div>
            <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid var(--border); padding-bottom: 0.5rem;">
              <span style="font-weight: 600; color: var(--text-secondary);">Total Byte Size (UTF-8)</span>
              <span id="stat-bytes" style="font-family: monospace; font-size: 1.25rem; font-weight: 700; color: var(--text-secondary);">0 B</span>
            </div>
          </div>
          <button id="clear-btn" class="btn btn-secondary" style="margin-top: auto; align-self: flex-end;">Clear Input</button>
        </div>
      </div>
    `;
  }
  else if (tool.id === 'json-formatter') {
    workspaceMarkup = `
      <div class="tool-workarea split-view">
        <div class="tool-panel glass-panel">
          <h2 class="panel-title">Raw Input JSON</h2>
          <div class="form-group">
            <textarea id="json-input" class="form-textarea" placeholder="Paste unformatted or raw JSON string here..." style="min-height: 300px; font-family: monospace;"></textarea>
          </div>
          <div class="action-bar">
            <button id="format-btn" class="btn btn-primary">Format &amp; Validate</button>
            <button id="minify-btn" class="btn btn-secondary">Minify JSON</button>
            <button id="clear-btn" class="btn btn-secondary">Clear</button>
          </div>
        </div>
        <div class="tool-panel glass-panel" style="position: relative;">
          <h2 class="panel-title">Output Results</h2>
          <div id="json-error" class="alert-error" style="display: none;"></div>
          <div id="json-success" class="alert-success" style="display: none;">JSON is Valid!</div>
          <div style="position: relative; flex: 1; min-height: 300px; display: flex; flex-direction: column;">
            <pre style="margin: 0; flex: 1; border-radius: var(--radius-md); background: var(--bg-tertiary); border: 1px solid var(--border); padding: 1rem; overflow: auto; max-height: 400px; font-family: monospace; font-size: 0.875rem;"><code id="json-output" style="white-space: pre-wrap; word-break: break-all;"></code></pre>
            <button id="copy-btn" class="copy-btn" style="top: 0.5rem; right: 0.5rem;">Copy</button>
          </div>
        </div>
      </div>
    `;
  }
  else if (tool.id === 'base64-encoder') {
    workspaceMarkup = `
      <div class="tool-workarea split-view">
        <div class="tool-panel glass-panel">
          <h2 class="panel-title">Text Input / File Drop</h2>
          <div class="form-group">
            <label for="text-input">Plain Text Input</label>
            <textarea id="text-input" class="form-textarea" placeholder="Type text here to convert into Base64 string..."></textarea>
          </div>
          <div style="text-align: center; color: var(--text-tertiary); font-weight: 700; font-size: 0.85rem;">- OR -</div>
          <div id="drop-area" class="file-drag-area">
            <svg viewBox="0 0 24 24" style="fill: currentColor;"><path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/></svg>
            <p style="font-weight: 600;">Drag & Drop File Here</p>
            <p style="font-size: 0.8rem; color: var(--text-tertiary); margin-top: 0.25rem;">Supports images, text, and minor assets</p>
            <input type="file" id="file-input" style="display: none;">
          </div>
        </div>
        <div class="tool-panel glass-panel" style="position: relative;">
          <h2 class="panel-title">Encoded Base64 Output</h2>
          <div style="position: relative; flex: 1; display: flex; flex-direction: column;">
            <textarea id="base64-output" class="form-textarea" style="flex: 1; min-height: 280px; padding-right: 4.5rem; word-break: break-all;" readonly placeholder="Base64 encoded string outputs here..."></textarea>
            <button id="copy-btn" class="copy-btn" style="top: 0.75rem; right: 0.75rem;">Copy</button>
          </div>
          <div class="action-bar">
            <button id="download-txt" class="btn btn-secondary">Download as Text File</button>
          </div>
        </div>
      </div>
    `;
  }
  else if (tool.id === 'base64-decoder') {
    workspaceMarkup = `
      <div class="tool-workarea split-view">
        <div class="tool-panel glass-panel">
          <h2 class="panel-title">Encoded Base64 Input</h2>
          <div class="form-group">
            <textarea id="base64-input" class="form-textarea" placeholder="Paste Base64 encoded string here to decode..."></textarea>
          </div>
          <div class="action-bar">
            <button id="decode-btn" class="btn btn-primary">Decode Base64</button>
            <button id="clear-btn" class="btn btn-secondary">Clear</button>
          </div>
        </div>
        <div class="tool-panel glass-panel" style="position: relative;">
          <h2 class="panel-title">Decoded Output</h2>
          <div id="decode-error" class="alert-error" style="display: none; margin-bottom: 0.5rem;"></div>
          <div style="position: relative; flex: 1; display: flex; flex-direction: column;">
            <textarea id="decoded-output" class="form-textarea" style="flex: 1; min-height: 280px; padding-right: 4.5rem;" readonly placeholder="Decoded results..."></textarea>
            <button id="copy-btn" class="copy-btn" style="top: 0.75rem; right: 0.75rem;">Copy</button>
          </div>
          <div class="action-bar" style="display: none;" id="download-area">
            <button id="download-file" class="btn btn-secondary">Download Decoded File</button>
          </div>
        </div>
      </div>
    `;
  }
  else if (tool.id === 'color-picker') {
    workspaceMarkup = `
      <div class="tool-workarea split-view">
        <div class="tool-panel glass-panel" style="align-items: center;">
          <h2 class="panel-title" style="align-self: flex-start; width: 100%;">Color Selection</h2>
          
          <!-- Hue spectrum canvas -->
          <div style="position: relative; width: 100%; max-width: 320px; display: flex; flex-direction: column; gap: 1rem; align-items: center; margin-top: 1rem;">
            <canvas id="color-block" width="300" height="150" style="border-radius: var(--radius-md); cursor: crosshair; width: 300px; height: 150px;"></canvas>
            <canvas id="color-strip" width="300" height="20" style="border-radius: var(--radius-full); cursor: pointer; width: 300px; height: 20px;"></canvas>
          </div>
          
          <button id="eye-dropper-btn" class="btn btn-primary" style="margin-top: 1.5rem; display: none; width: 100%; max-width: 300px;">
            Open Screen Eyedropper
          </button>
        </div>
        <div class="tool-panel glass-panel">
          <h2 class="panel-title">Color Properties</h2>
          
          <!-- Visual swatch -->
          <div style="display: flex; gap: 1rem; align-items: center; border-bottom: 1px solid var(--border); padding-bottom: 1rem;">
            <div id="color-swatch" style="width: 70px; height: 70px; border-radius: var(--radius-md); border: 2px solid white; box-shadow: var(--shadow-md); background: #4f46e5;"></div>
            <div style="display: flex; flex-direction: column;">
              <span id="selected-hex-title" style="font-family: var(--font-display); font-weight: 700; font-size: 1.25rem;">#4f46e5</span>
              <span style="font-size: 0.8rem; color: var(--text-tertiary); font-weight: 600;">Selected Color</span>
            </div>
          </div>
          
          <div style="display: flex; flex-direction: column; gap: 1rem; margin-top: 0.5rem;">
            <div style="display: grid; grid-template-columns: 80px 1fr 60px; gap: 0.75rem; align-items: center;">
              <span style="font-weight: 600; font-size: 0.85rem;">HEX</span>
              <input type="text" id="prop-hex" class="form-input" style="font-family: monospace; padding: 0.4rem 0.75rem;" readonly value="#4f46e5">
              <button class="btn btn-secondary copy-field-btn" data-target="prop-hex" style="padding: 0.4rem; font-size: 0.75rem;">Copy</button>
            </div>
            <div style="display: grid; grid-template-columns: 80px 1fr 60px; gap: 0.75rem; align-items: center;">
              <span style="font-weight: 600; font-size: 0.85rem;">RGB</span>
              <input type="text" id="prop-rgb" class="form-input" style="font-family: monospace; padding: 0.4rem 0.75rem;" readonly value="rgb(79, 70, 229)">
              <button class="btn btn-secondary copy-field-btn" data-target="prop-rgb" style="padding: 0.4rem; font-size: 0.75rem;">Copy</button>
            </div>
            <div style="display: grid; grid-template-columns: 80px 1fr 60px; gap: 0.75rem; align-items: center;">
              <span style="font-weight: 600; font-size: 0.85rem;">HSL</span>
              <input type="text" id="prop-hsl" class="form-input" style="font-family: monospace; padding: 0.4rem 0.75rem;" readonly value="hsl(243, 75%, 59%)">
              <button class="btn btn-secondary copy-field-btn" data-target="prop-hsl" style="padding: 0.4rem; font-size: 0.75rem;">Copy</button>
            </div>
          </div>

          <div style="margin-top: 1rem;">
            <span style="font-size: 0.875rem; font-weight: 600; color: var(--text-secondary); display: block; margin-bottom: 0.5rem;">Recent Swatches</span>
            <div id="recent-palette" style="display: flex; gap: 0.5rem; flex-wrap: wrap;"></div>
          </div>
        </div>
      </div>
    `;
  }
  else if (tool.id === 'bmi-calculator') {
    workspaceMarkup = `
      <div class="tool-workarea split-view">
        <div class="tool-panel glass-panel">
          <h2 class="panel-title">Body Details</h2>
          
          <div style="display: flex; gap: 0.5rem; margin-bottom: 0.5rem;">
            <button id="unit-metric" class="btn btn-primary" style="flex: 1; padding: 0.5rem;">Metric (cm/kg)</button>
            <button id="unit-imperial" class="btn btn-secondary" style="flex: 1; padding: 0.5rem;">Imperial (in/lbs)</button>
          </div>

          <!-- Weight group -->
          <div class="form-group" style="margin-top: 1rem;">
            <label id="weight-label" for="weight">Weight: <span id="weight-val" class="range-value">70 kg</span></label>
            <div class="range-group">
              <input type="range" id="weight" min="30" max="150" value="70" class="range-slider">
            </div>
          </div>

          <!-- Height group -->
          <div class="form-group" style="margin-top: 1rem;">
            <label id="height-label" for="height">Height: <span id="height-val" class="range-value">170 cm</span></label>
            <div class="range-group">
              <input type="range" id="height" min="100" max="220" value="170" class="range-slider">
            </div>
          </div>
        </div>
        
        <div class="tool-panel glass-panel" style="align-items: center; justify-content: center; gap: 1.5rem;">
          <h2 class="panel-title" style="align-self: flex-start; width: 100%;">BMI Result</h2>
          
          <div style="text-align: center;">
            <div id="bmi-score" style="font-size: 3.5rem; font-weight: 800; color: var(--accent); line-height: 1;">24.2</div>
            <span style="font-size: 0.8rem; color: var(--text-tertiary); font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em;">Your BMI Score</span>
          </div>

          <div id="bmi-badge" class="badge" style="padding: 0.5rem 1rem; font-size: 0.85rem; background: var(--success); color: white; border-color: transparent;">Normal Weight</div>

          <p id="bmi-desc" style="font-size: 0.95rem; text-align: center; color: var(--text-secondary); max-width: 300px;">
            A BMI of 24.2 indicates a healthy weight range. Maintaining this weight reduces cardiovascular risks.
          </p>
        </div>
      </div>
    `;
  }
  else {
    // Scaffold Under Construction for the remaining 140 tools
    workspaceMarkup = `
      <div class="tool-panel glass-panel" style="padding: 3rem; text-align: center; display: flex; flex-direction: column; align-items: center; gap: 1.5rem; max-width: 700px; margin: 2rem auto;">
        <div style="margin-bottom: 1rem;"><svg viewBox="0 0 24 24" width="64" height="64" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="color: var(--accent);"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg></div>
        <h2 style="font-family: var(--font-display); font-size: 1.75rem; font-weight: 800;">Utility Scheduled for Rollout</h2>
        <p style="color: var(--text-secondary); line-height: 1.6; max-width: 500px;">
          The <strong>${tool.name}</strong> is scheduled in our upcoming static utility rollout phase. The core client-side Javascript logic is currently under integration.
        </p>
        <div style="background: var(--bg-tertiary); padding: 1.25rem; border-radius: var(--radius-md); border: 1px solid var(--border); width: 100%; max-width: 480px; margin-top: 1rem; text-align: left;">
          <span style="font-weight: 700; font-size: 0.875rem; display: block; border-bottom: 1px solid var(--border); padding-bottom: 0.5rem; margin-bottom: 0.75rem; color: var(--text-primary);">Tool Details:</span>
          <div style="display: flex; flex-direction: column; gap: 0.5rem; font-size: 0.825rem; color: var(--text-secondary);">
            <div><strong>Description:</strong> ${tool.description}</div>
            <div><strong>Inputs:</strong> ${tool.tags.join(', ')}</div>
            <div><strong>Category:</strong> ${tool.category}</div>
          </div>
        </div>
        <a href="${prefix}index.html" class="btn btn-primary" style="margin-top: 1rem;">&larr; Return to Dashboard</a>
      </div>
    `;
  }

  return `<!DOCTYPE html>
<html lang="en" data-theme="dark">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${tool.name} - Free Online Tool - ALL IN ONE</title>
  <meta name="description" content="${tool.description}">
  <meta name="keywords" content="${tool.tags.join(', ')}, free, online, tool, utility">
  <meta name="robots" content="index, follow">
  <link rel="canonical" href="https://sami12901.github.io/ALL-IN-ONE-v1/tools/${tool.id}/">
  <link rel="stylesheet" href="${prefix}css/main.css">
  <link rel="stylesheet" href="${prefix}css/tools-shared.css">
  ${extraHeadScripts}
  <script type="module" src="${prefix}js/components.js"></script>
  <script type="module" src="./script.js" defer></script>
</head>
<body>
  <!-- Header Web Component -->
  <app-header></app-header>
  
  <!-- Breadcrumbs -->
  <app-breadcrumbs></app-breadcrumbs>

  <!-- Main Work Container -->
  <main class="tool-layout">
    <div class="container tool-container">
      <div class="tool-header">
        <h1>${tool.name}</h1>
        <p class="tool-description">${tool.description}</p>
      </div>

      <!-- Tool Workspace -->
      ${workspaceMarkup}
    </div>
  </main>

  <!-- Footer Web Component -->
  <app-footer></app-footer>

  <!-- Structured schema for search engine rich snippets -->
  <script type="application/ld+json">
  {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    "name": "${tool.name}",
    "url": "https://sami12901.github.io/ALL-IN-ONE-v1/tools/${tool.id}/",
    "description": "${tool.description}",
    "applicationCategory": "UtilityPage",
    "operatingSystem": "All",
    "browserRequirements": "Requires JavaScript. Requires HTML5."
  }
  </script>
</body>
</html>`;
}

// 4. Template JS Generator
function getToolJs(tool) {
  if (tool.id === 'password-generator') {
    return `// Password Generator Logic
document.addEventListener('DOMContentLoaded', () => {
  const lengthSlider = document.getElementById('length');
  const lengthVal = document.getElementById('length-val');
  const upperCb = document.getElementById('upper');
  const lowerCb = document.getElementById('lower');
  const numbersCb = document.getElementById('numbers');
  const symbolsCb = document.getElementById('symbols');
  const generateBtn = document.getElementById('generate');
  const outputBox = document.getElementById('password-output');
  const copyBtn = document.getElementById('copy-btn');
  const strengthBar = document.getElementById('strength-bar');
  const strengthText = document.getElementById('strength-text');

  const UPPER_CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const LOWER_CHARS = 'abcdefghijklmnopqrstuvwxyz';
  const NUMBER_CHARS = '0123456789';
  const SYMBOL_CHARS = '!@#$%^&*()_+-=[]{}|;:,.<>?';

  lengthSlider.addEventListener('input', () => {
    lengthVal.textContent = lengthSlider.value;
    generatePassword();
  });

  function generatePassword() {
    const length = parseInt(lengthSlider.value);
    let charPool = '';
    let typesCount = 0;
    
    if (upperCb.checked) { charPool += UPPER_CHARS; typesCount++; }
    if (lowerCb.checked) { charPool += LOWER_CHARS; typesCount++; }
    if (numbersCb.checked) { charPool += NUMBER_CHARS; typesCount++; }
    if (symbolsCb.checked) { charPool += SYMBOL_CHARS; typesCount++; }

    if (!charPool) {
      outputBox.textContent = 'Please select at least one character type.';
      outputBox.style.color = 'var(--text-tertiary)';
      updateStrength(0, 0);
      return;
    }

    let password = '';
    const randomValues = new Uint32Array(length);
    crypto.getRandomValues(randomValues);

    for (let i = 0; i < length; i++) {
      password += charPool[randomValues[i] % charPool.length];
    }

    outputBox.textContent = password;
    outputBox.style.color = 'var(--text-primary)';
    
    const poolSize = charPool.length;
    const entropy = length * Math.log2(poolSize);
    updateStrength(entropy, typesCount);
  }

  function updateStrength(entropy, typesCount) {
    let pct = 0;
    let color = 'var(--error)';
    let label = 'Very Weak';

    if (entropy > 0) {
      pct = Math.min(100, (entropy / 120) * 100);
      if (entropy < 40 || typesCount < 2) {
        color = 'var(--error)';
        label = 'Weak';
      } else if (entropy < 65 || typesCount < 3) {
        color = 'var(--warning)';
        label = 'Medium';
      } else {
        color = 'var(--success)';
        label = 'Strong';
      }
    }

    strengthBar.style.width = \`\${pct}%\`;
    strengthBar.style.backgroundColor = color;
    strengthText.textContent = entropy > 0 ? \`\${label} (\${Math.round(entropy)} bits entropy)\` : 'Select options';
  }

  generateBtn.addEventListener('click', generatePassword);

  copyBtn.addEventListener('click', () => {
    const pwd = outputBox.textContent;
    if (!pwd || pwd.startsWith('Please')) return;
    navigator.clipboard.writeText(pwd).then(() => {
      copyBtn.textContent = 'Copied!';
      copyBtn.classList.add('copied');
      setTimeout(() => {
        copyBtn.textContent = 'Copy';
        copyBtn.classList.remove('copied');
      }, 2000);
    });
  });

  // Event listeners for checkboxes to auto-regenerate
  [upperCb, lowerCb, numbersCb, symbolsCb].forEach(cb => {
    cb.addEventListener('change', generatePassword);
  });

  generatePassword();
});`;
  }
  else if (tool.id === 'qr-code-generator') {
    return `// QR Code Generator Logic
document.addEventListener('DOMContentLoaded', () => {
  const qrInput = document.getElementById('qr-input');
  const qrSize = document.getElementById('qr-size');
  const qrFg = document.getElementById('qr-fg');
  const qrBg = document.getElementById('qr-bg');
  const canvas = document.getElementById('qr-canvas');
  const downloadPng = document.getElementById('download-png');

  let qr = null;

  function generateQR() {
    const value = qrInput.value.trim() || 'https://sami12901.github.io/ALL-IN-ONE-v1/';
    const size = parseInt(qrSize.value);
    const foreground = qrFg.value;
    const background = qrBg.value;

    if (window.QRious) {
      qr = new QRious({
        element: canvas,
        value: value,
        size: size,
        foreground: foreground,
        background: background,
        level: 'H'
      });
    }
  }

  qrInput.addEventListener('input', generateQR);
  qrSize.addEventListener('change', generateQR);
  qrFg.addEventListener('change', generateQR);
  qrBg.addEventListener('change', generateQR);

  downloadPng.addEventListener('click', () => {
    const link = document.createElement('a');
    link.download = 'qrcode.png';
    link.href = canvas.toDataURL('image/png');
    link.click();
  });

  // Initial generation on load
  setTimeout(generateQR, 200);
});`;
  }
  else if (tool.id === 'text-case-converter') {
    return `// Case Converter Logic
document.addEventListener('DOMContentLoaded', () => {
  const caseInput = document.getElementById('case-input');
  const copyBtn = document.getElementById('copy-btn');
  const clearBtn = document.getElementById('clear-btn');

  // Small prepositions and articles ignored in Title Case
  const stopWords = ['a', 'an', 'the', 'and', 'but', 'or', 'for', 'nor', 'on', 'at', 'to', 'by', 'of', 'in', 'with'];

  document.querySelectorAll('.case-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const type = btn.getAttribute('data-case');
      const text = caseInput.value;
      if (!text) return;

      let result = '';

      switch (type) {
        case 'upper':
          result = text.toUpperCase();
          break;
        case 'lower':
          result = text.toLowerCase();
          break;
        case 'title':
          result = text.toLowerCase().split(' ').map((word, idx) => {
            if (idx > 0 && stopWords.includes(word)) return word;
            return word.charAt(0).toUpperCase() + word.slice(1);
          }).join(' ');
          break;
        case 'sentence':
          result = text.toLowerCase().replace(/(^|[.!?]\\s+)([a-z])/g, (match, separator, char) => {
            return separator + char.toUpperCase();
          });
          break;
        case 'camel':
          result = text.toLowerCase()
            .replace(/[^a-zA-Z0-9]+(.)/g, (m, chr) => chr.toUpperCase())
            .replace(/[^a-zA-Z0-9]/g, '');
          result = result.charAt(0).toLowerCase() + result.slice(1);
          break;
        case 'snake':
          result = text.toLowerCase()
            .trim()
            .replace(/\\s+/g, '_')
            .replace(/[^a-zA-Z0-9_]/g, '');
          break;
      }

      caseInput.value = result;
    });
  });

  copyBtn.addEventListener('click', () => {
    if (!caseInput.value) return;
    navigator.clipboard.writeText(caseInput.value).then(() => {
      copyBtn.textContent = 'Copied!';
      copyBtn.classList.add('copied');
      setTimeout(() => {
        copyBtn.textContent = 'Copy Output';
        copyBtn.classList.remove('copied');
      }, 2000);
    });
  });

  clearBtn.addEventListener('click', () => {
    caseInput.value = '';
    caseInput.focus();
  });
});`;
  }
  else if (tool.id === 'word-counter') {
    return `// Word Counter Logic
document.addEventListener('DOMContentLoaded', () => {
  const wordInput = document.getElementById('word-input');
  const wordCount = document.getElementById('word-count');
  const charCount = document.getElementById('char-count');
  const sentenceCount = document.getElementById('sentence-count');
  const readTime = document.getElementById('read-time');
  const clearBtn = document.getElementById('clear-btn');

  wordInput.addEventListener('input', () => {
    const text = wordInput.value;
    
    // Characters
    charCount.textContent = text.length;

    // Words
    const words = text.trim().split(/\\s+/).filter(w => w.length > 0);
    wordCount.textContent = words.length;

    // Sentences
    const sentences = text.split(/[.!?]+(\\s+|$)/).filter(s => s && s.trim().length > 0);
    sentenceCount.textContent = sentences.length;

    // Reading time (average 200 words per minute)
    const totalSeconds = Math.round((words.length / 200) * 60);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    readTime.textContent = \`\${minutes}m \${seconds}s\`;
  });

  clearBtn.addEventListener('click', () => {
    wordInput.value = '';
    wordInput.dispatchEvent(new Event('input'));
    wordInput.focus();
  });
});`;
  }
  else if (tool.id === 'character-counter') {
    return `// Character Counter Logic
document.addEventListener('DOMContentLoaded', () => {
  const charInput = document.getElementById('char-input');
  const countSpaces = document.getElementById('count-spaces');
  const countPunct = document.getElementById('count-punct');
  const statGlyphs = document.getElementById('stat-glyphs');
  const statSpaces = document.getElementById('stat-spaces');
  const statPuncts = document.getElementById('stat-puncts');
  const statBytes = document.getElementById('stat-bytes');
  const clearBtn = document.getElementById('clear-btn');

  function calculateMetrics() {
    const text = charInput.value;
    
    // 1. Spaces count
    const spaces = (text.match(/\\s/g) || []).length;
    statSpaces.textContent = spaces;

    // 2. Punctuation count
    const puncts = (text.match(/[.,\\/#!$%\\^&\\*;:{}=\\-_\`~()?"']/g) || []).length;
    statPuncts.textContent = puncts;

    // 3. UTF-8 Byte Size
    const bytes = new Blob([text]).size;
    statBytes.textContent = formatBytes(bytes);

    // 4. Glyphs (Visuals) counting emojis correctly
    let glyphArray = Array.from(text);
    
    if (!countSpaces.checked) {
      glyphArray = glyphArray.filter(c => !/\\s/.test(c));
    }
    if (!countPunct.checked) {
      glyphArray = glyphArray.filter(c => !/[.,\\/#!$%\\^&\\*;:{}=\\-_\`~()?"']/.test(c));
    }

    statGlyphs.textContent = glyphArray.length;
  }

  function formatBytes(bytes) {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  charInput.addEventListener('input', calculateMetrics);
  countSpaces.addEventListener('change', calculateMetrics);
  countPunct.addEventListener('change', calculateMetrics);
  
  clearBtn.addEventListener('click', () => {
    charInput.value = '';
    calculateMetrics();
    charInput.focus();
  });
});`;
  }
  else if (tool.id === 'json-formatter') {
    return `// JSON Formatter Logic
document.addEventListener('DOMContentLoaded', () => {
  const jsonInput = document.getElementById('json-input');
  const formatBtn = document.getElementById('format-btn');
  const minifyBtn = document.getElementById('minify-btn');
  const clearBtn = document.getElementById('clear-btn');
  const copyBtn = document.getElementById('copy-btn');
  const jsonOutput = document.getElementById('json-output');
  const jsonError = document.getElementById('json-error');
  const jsonSuccess = document.getElementById('json-success');

  function showMsg(type, msg = '') {
    jsonError.style.display = 'none';
    jsonSuccess.style.display = 'none';
    if (type === 'error') {
      jsonError.textContent = msg;
      jsonError.style.display = 'block';
    } else if (type === 'success') {
      jsonSuccess.style.display = 'block';
    }
  }

  function highlightJson(json) {
    // Escape standard tags
    json = json.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    return json.replace(/("(\\u[a-zA-Z0-9]{4}|\\\\[^u]|[^\\\\"])*"(\\s*:)?|\\b(true|false|null)\\b|-?\\d+(?:\\.\\d*)?(?:[eE][+\\-]?\\d+)?)/g, function (match) {
      let cls = 'number';
      if (/^"/.test(match)) {
        if (/:$/.test(match)) {
          cls = 'key';
          return \`<span style="color: var(--accent); font-weight: 600;">\${match}</span>\`;
        } else {
          cls = 'string';
          return \`<span style="color: var(--success);">\${match}</span>\`;
        }
      } else if (/true|false/.test(match)) {
        cls = 'boolean';
        return \`<span style="color: var(--warning); font-weight: 600;">\${match}</span>\`;
      } else if (/null/.test(match)) {
        cls = 'null';
        return \`<span style="color: var(--text-tertiary);">\${match}</span>\`;
      }
      return \`<span style="color: #0ea5e9;">\${match}</span>\`;
    });
  }

  formatBtn.addEventListener('click', () => {
    const raw = jsonInput.value.trim();
    if (!raw) return;

    try {
      const obj = JSON.parse(raw);
      const formatted = JSON.stringify(obj, null, 2);
      jsonOutput.innerHTML = highlightJson(formatted);
      showMsg('success');
    } catch (e) {
      jsonOutput.textContent = '';
      showMsg('error', \`Syntax Error: \${e.message}\`);
    }
  });

  minifyBtn.addEventListener('click', () => {
    const raw = jsonInput.value.trim();
    if (!raw) return;

    try {
      const obj = JSON.parse(raw);
      const minified = JSON.stringify(obj);
      jsonOutput.textContent = minified;
      showMsg('success');
    } catch (e) {
      jsonOutput.textContent = '';
      showMsg('error', \`Syntax Error: \${e.message}\`);
    }
  });

  copyBtn.addEventListener('click', () => {
    const code = jsonOutput.textContent;
    if (!code) return;
    navigator.clipboard.writeText(code).then(() => {
      copyBtn.textContent = 'Copied!';
      copyBtn.classList.add('copied');
      setTimeout(() => {
        copyBtn.textContent = 'Copy';
        copyBtn.classList.remove('copied');
      }, 2000);
    });
  });

  clearBtn.addEventListener('click', () => {
    jsonInput.value = '';
    jsonOutput.textContent = '';
    showMsg('clear');
    jsonInput.focus();
  });
});`;
  }
  else if (tool.id === 'base64-encoder') {
    return `// Base64 Encoder Logic
document.addEventListener('DOMContentLoaded', () => {
  const textInput = document.getElementById('text-input');
  const fileInput = document.getElementById('file-input');
  const dropArea = document.getElementById('drop-area');
  const base64Output = document.getElementById('base64-output');
  const copyBtn = document.getElementById('copy-btn');
  const downloadTxt = document.getElementById('download-txt');

  function encodeText() {
    const text = textInput.value;
    if (!text) {
      base64Output.value = '';
      return;
    }
    try {
      // UTF-8 safe encoding
      const utf8Bytes = new TextEncoder().encode(text);
      let binary = '';
      utf8Bytes.forEach(b => binary += String.fromCharCode(b));
      base64Output.value = btoa(binary);
    } catch (e) {
      base64Output.value = 'Error encoding text to Base64.';
    }
  }

  textInput.addEventListener('input', encodeText);

  // File Drag & Drop Handlers
  dropArea.addEventListener('click', () => fileInput.click());
  
  dropArea.addEventListener('dragover', (e) => {
    e.preventDefault();
    dropArea.classList.add('dragover');
  });

  dropArea.addEventListener('dragleave', () => {
    dropArea.classList.remove('dragover');
  });

  dropArea.addEventListener('drop', (e) => {
    e.preventDefault();
    dropArea.classList.remove('dragover');
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      processFile(files[0]);
    }
  });

  fileInput.addEventListener('change', () => {
    if (fileInput.files.length > 0) {
      processFile(fileInput.files[0]);
    }
  });

  function processFile(file) {
    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUri = e.target.result;
      // Extract pure base64 metadata payload
      const pureBase64 = dataUri.split(',')[1];
      base64Output.value = pureBase64;
      textInput.value = ''; // clear text input
    };
    reader.readAsDataURL(file);
  }

  copyBtn.addEventListener('click', () => {
    if (!base64Output.value) return;
    navigator.clipboard.writeText(base64Output.value).then(() => {
      copyBtn.textContent = 'Copied!';
      copyBtn.classList.add('copied');
      setTimeout(() => {
        copyBtn.textContent = 'Copy';
        copyBtn.classList.remove('copied');
      }, 2000);
    });
  });

  downloadTxt.addEventListener('click', () => {
    const code = base64Output.value;
    if (!code) return;
    const blob = new Blob([code], { type: 'text/plain' });
    const link = document.createElement('a');
    link.download = 'base64_encoded.txt';
    link.href = URL.createObjectURL(blob);
    link.click();
  });
});`;
  }
  else if (tool.id === 'base64-decoder') {
    return `// Base64 Decoder Logic
document.addEventListener('DOMContentLoaded', () => {
  const base64Input = document.getElementById('base64-input');
  const decodedOutput = document.getElementById('decoded-output');
  const copyBtn = document.getElementById('copy-btn');
  const decodeBtn = document.getElementById('decode-btn');
  const clearBtn = document.getElementById('clear-btn');
  const decodeError = document.getElementById('decode-error');
  const downloadArea = document.getElementById('download-area');
  const downloadFileBtn = document.getElementById('download-file');

  let activeBlob = null;
  let detectedFileName = 'decoded_file.bin';

  decodeBtn.addEventListener('click', () => {
    const base64Str = base64Input.value.replace(/\\s/g, '');
    decodeError.style.display = 'none';
    downloadArea.style.display = 'none';
    decodedOutput.value = '';
    activeBlob = null;

    if (!base64Str) return;

    try {
      const binaryString = atob(base64Str);
      
      // Attempt UTF-8 decode
      const len = binaryString.length;
      const bytes = new Uint8Array(len);
      for (let i = 0; i < len; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }
      
      try {
        const text = new TextDecoder('utf-8', { fatal: true }).decode(bytes);
        decodedOutput.value = text;
      } catch (err) {
        // Fallback if not standard text: Display as raw binary representation and offer download file
        decodedOutput.value = \`[Binary File Detected - Size: \${len} bytes]\\nCannot represent as plain text. Use 'Download Decoded File' below to retrieve.\`;
        
        // Detect typical mime files from byte markers
        let mimeType = 'application/octet-stream';
        if (bytes[0] === 0x89 && bytes[1] === 0x50 && bytes[2] === 0x4E && bytes[3] === 0x47) {
          mimeType = 'image/png';
          detectedFileName = 'decoded_image.png';
        } else if (bytes[0] === 0xFF && bytes[1] === 0xD8) {
          mimeType = 'image/jpeg';
          detectedFileName = 'decoded_image.jpg';
        } else if (bytes[0] === 0x25 && bytes[1] === 0x50 && bytes[2] === 0x44 && bytes[3] === 0x46) {
          mimeType = 'application/pdf';
          detectedFileName = 'decoded_document.pdf';
        } else if (bytes[0] === 0x50 && bytes[1] === 0x4B) {
          mimeType = 'application/zip';
          detectedFileName = 'decoded_archive.zip';
        }

        activeBlob = new Blob([bytes], { type: mimeType });
        downloadArea.style.display = 'flex';
      }
    } catch (e) {
      decodeError.textContent = 'Invalid Base64 format. Parse failed.';
      decodeError.style.display = 'block';
    }
  });

  downloadFileBtn.addEventListener('click', () => {
    if (!activeBlob) return;
    const link = document.createElement('a');
    link.download = detectedFileName;
    link.href = URL.createObjectURL(activeBlob);
    link.click();
  });

  copyBtn.addEventListener('click', () => {
    if (!decodedOutput.value) return;
    navigator.clipboard.writeText(decodedOutput.value).then(() => {
      copyBtn.textContent = 'Copied!';
      copyBtn.classList.add('copied');
      setTimeout(() => {
        copyBtn.textContent = 'Copy';
        copyBtn.classList.remove('copied');
      }, 2000);
    });
  });

  clearBtn.addEventListener('click', () => {
    base64Input.value = '';
    decodedOutput.value = '';
    decodeError.style.display = 'none';
    downloadArea.style.display = 'none';
    activeBlob = null;
    base64Input.focus();
  });
});`;
  }
  else if (tool.id === 'color-picker') {
    return `// Color Picker Logic
document.addEventListener('DOMContentLoaded', () => {
  const colorBlock = document.getElementById('color-block');
  const ctxBlock = colorBlock.getContext('2d');
  const colorStrip = document.getElementById('color-strip');
  const ctxStrip = colorStrip.getContext('2d');
  
  const eyeDropperBtn = document.getElementById('eye-dropper-btn');
  const swatch = document.getElementById('color-swatch');
  const selectedHexTitle = document.getElementById('selected-hex-title');
  const propHex = document.getElementById('prop-hex');
  const propRgb = document.getElementById('prop-rgb');
  const propHsl = document.getElementById('prop-hsl');
  const recentPalette = document.getElementById('recent-palette');

  let activeColor = 'rgba(79, 70, 229, 1)';
  let activeHue = 'rgba(79, 70, 229, 1)';
  let blockX = 150;
  let blockY = 75;

  // EyeDropper API check
  if (window.EyeDropper) {
    eyeDropperBtn.style.display = 'block';
    eyeDropperBtn.addEventListener('click', () => {
      const eyeDropper = new EyeDropper();
      eyeDropper.open().then(result => {
        updateColorDisplay(result.sRGBHex);
        addRecentColor(result.sRGBHex);
      }).catch(err => console.log('Eyedropper closed or failed', err));
    });
  }

  // Draw Saturation/Value Canvas block
  function drawBlock() {
    ctxBlock.fillStyle = activeHue;
    ctxBlock.fillRect(0, 0, 300, 150);

    const whiteGrad = ctxBlock.createLinearGradient(0, 0, 300, 0);
    whiteGrad.addColorStop(0, 'rgba(255,255,255,1)');
    whiteGrad.addColorStop(1, 'rgba(255,255,255,0)');
    ctxBlock.fillStyle = whiteGrad;
    ctxBlock.fillRect(0, 0, 300, 150);

    const blackGrad = ctxBlock.createLinearGradient(0, 0, 0, 150);
    blackGrad.addColorStop(0, 'rgba(0,0,0,0)');
    blackGrad.addColorStop(1, 'rgba(0,0,0,1)');
    ctxBlock.fillStyle = blackGrad;
    ctxBlock.fillRect(0, 0, 300, 150);

    // Draw selection marker
    ctxBlock.beginPath();
    ctxBlock.arc(blockX, blockY, 5, 0, 2 * Math.PI);
    ctxBlock.strokeStyle = 'white';
    ctxBlock.lineWidth = 2;
    ctxBlock.stroke();
    ctxBlock.beginPath();
    ctxBlock.arc(blockX, blockY, 4, 0, 2 * Math.PI);
    ctxBlock.strokeStyle = 'black';
    ctxBlock.lineWidth = 1;
    ctxBlock.stroke();
  }

  // Draw Hue Strip Canvas
  function drawStrip() {
    ctxStrip.rect(0, 0, 300, 20);
    const grid = ctxStrip.createLinearGradient(0, 0, 300, 0);
    grid.addColorStop(0, 'rgba(255, 0, 0, 1)');
    grid.addColorStop(0.17, 'rgba(255, 255, 0, 1)');
    grid.addColorStop(0.34, 'rgba(0, 255, 255, 1)');
    grid.addColorStop(0.51, 'rgba(0, 0, 255, 1)');
    grid.addColorStop(0.68, 'rgba(255, 0, 255, 1)');
    grid.addColorStop(0.85, 'rgba(255, 0, 255, 1)');
    grid.addColorStop(1, 'rgba(255, 0, 0, 1)');
    ctxStrip.fillStyle = grid;
    ctxStrip.fill();
  }

  // Pick color from block
  function pickBlockColor(e) {
    const rect = colorBlock.getBoundingClientRect();
    blockX = Math.max(0, Math.min(299, (e.clientX - rect.left)));
    blockY = Math.max(0, Math.min(149, (e.clientY - rect.top)));
    
    const imgData = ctxBlock.getImageData(blockX, blockY, 1, 1).data;
    const hex = rgbToHex(imgData[0], imgData[1], imgData[2]);
    
    updateColorDisplay(hex);
    drawBlock();
  }

  // Pick hue from strip
  function pickStripColor(e) {
    const rect = colorStrip.getBoundingClientRect();
    const x = Math.max(0, Math.min(299, (e.clientX - rect.left)));
    const imgData = ctxStrip.getImageData(x, 10, 1, 1).data;
    activeHue = \`rgba(\${imgData[0]}, \${imgData[1]}, \${imgData[2]}, 1)\`;
    
    drawBlock();
    
    // Pick color at current block position under new hue
    const blockImgData = ctxBlock.getImageData(blockX, blockY, 1, 1).data;
    const hex = rgbToHex(blockImgData[0], blockImgData[1], blockImgData[2]);
    updateColorDisplay(hex);
  }

  // Convert functions
  function rgbToHex(r, g, b) {
    return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
  }

  function hexToRgb(hex) {
    const result = /^#?([a-f\\d]{2})([a-f\\d]{2})([a-f\\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : null;
  }

  function rgbToHsl(r, g, b) {
    r /= 255; g /= 255; b /= 255;
    const max = Math.max(r, g, b), min = Math.min(r, g, b);
    let h, s, l = (max + min) / 2;

    if (max === min) {
      h = s = 0; // achromatic
    } else {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      switch (max) {
        case r: h = (g - b) / d + (g < b ? 6 : 0); break;
        case g: h = (b - r) / d + 2; break;
        case b: h = (r - g) / d + 4; break;
      }
      h /= 6;
    }
    return {
      h: Math.round(h * 360),
      s: Math.round(s * 100),
      l: Math.round(l * 100)
    };
  }

  function updateColorDisplay(hex) {
    swatch.style.backgroundColor = hex;
    selectedHexTitle.textContent = hex;
    propHex.value = hex;

    const rgb = hexToRgb(hex);
    if (rgb) {
      propRgb.value = \`rgb(\${rgb.r}, \${rgb.g}, \${rgb.b})\`;
      
      const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);
      propHsl.value = \`hsl(\${hsl.h}, \${hsl.s}%, \${hsl.l}%)\`;
    }
  }

  // Canvas events
  let isBlockDrag = false;
  colorBlock.addEventListener('mousedown', (e) => { isBlockDrag = true; pickBlockColor(e); });
  window.addEventListener('mouseup', () => { isBlockDrag = false; });
  colorBlock.addEventListener('mousemove', (e) => { if (isBlockDrag) pickBlockColor(e); });

  colorStrip.addEventListener('mousedown', pickStripColor);

  // Copy buttons
  document.querySelectorAll('.copy-field-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const targetId = btn.getAttribute('data-target');
      const input = document.getElementById(targetId);
      navigator.clipboard.writeText(input.value).then(() => {
        btn.textContent = 'Copied!';
        setTimeout(() => btn.textContent = 'Copy', 2000);
      });
    });
  });

  // Recent Palette
  const recents = ['#4f46e5', '#10b981', '#ef4444', '#f59e0b', '#7c3aed', '#ec4899'];
  function renderRecents() {
    recentPalette.innerHTML = recents.map(c => \`
      <div class="recent-swatch" style="width: 28px; height: 28px; border-radius: var(--radius-sm); border: 1px solid var(--border); background: \\\${c}; cursor: pointer;"></div>
    \`).join('');
    
    recentPalette.querySelectorAll('.recent-swatch').forEach((s, idx) => {
      s.addEventListener('click', () => {
        updateColorDisplay(recents[idx]);
      });
    });
  }

  function addRecentColor(hex) {
    if (recents.includes(hex)) return;
    recents.unshift(hex);
    if (recents.length > 12) recents.pop();
    renderRecents();
  }

  drawStrip();
  drawBlock();
  renderRecents();
  updateColorDisplay('#4f46e5');
});`;
  }
  else if (tool.id === 'bmi-calculator') {
    return `// BMI Calculator Logic
document.addEventListener('DOMContentLoaded', () => {
  const weightSlider = document.getElementById('weight');
  const weightVal = document.getElementById('weight-val');
  const heightSlider = document.getElementById('height');
  const heightVal = document.getElementById('height-val');
  const weightLabel = document.getElementById('weight-label');
  const heightLabel = document.getElementById('height-label');

  const unitMetric = document.getElementById('unit-metric');
  const unitImperial = document.getElementById('unit-imperial');

  const bmiScore = document.getElementById('bmi-score');
  const bmiBadge = document.getElementById('bmi-badge');
  const bmiDesc = document.getElementById('bmi-desc');

  let activeUnit = 'metric';

  function updateUnitLayout() {
    if (activeUnit === 'metric') {
      unitMetric.className = 'btn btn-primary';
      unitImperial.className = 'btn btn-secondary';

      weightSlider.min = 30;
      weightSlider.max = 150;
      weightSlider.value = 70;

      heightSlider.min = 100;
      heightSlider.max = 220;
      heightSlider.value = 170;
    } else {
      unitMetric.className = 'btn btn-secondary';
      unitImperial.className = 'btn btn-primary';

      weightSlider.min = 60;
      weightSlider.max = 330;
      weightSlider.value = 150; // lbs

      heightSlider.min = 36;
      heightSlider.max = 84;
      heightSlider.value = 68; // inches
    }
    calculateBMI();
  }

  function calculateBMI() {
    const weight = parseFloat(weightSlider.value);
    const height = parseFloat(heightSlider.value);
    
    let bmi = 0;

    if (activeUnit === 'metric') {
      weightVal.textContent = \`\${weight} kg\`;
      heightVal.textContent = \`\${height} cm\`;
      bmi = weight / Math.pow(height / 100, 2);
    } else {
      weightVal.textContent = \`\${weight} lbs\`;
      
      const feet = Math.floor(height / 12);
      const inches = Math.round(height % 12);
      heightVal.textContent = \`\${feet}ft \${inches}in\`;
      
      bmi = (weight * 703) / Math.pow(height, 2);
    }

    const score = bmi.toFixed(1);
    bmiScore.textContent = score;

    let category = 'Normal Weight';
    let color = 'var(--success)';
    let desc = '';

    if (bmi < 18.5) {
      category = 'Underweight';
      color = 'var(--warning)';
      desc = 'A BMI below 18.5 indicates you are underweight. Consider consulting a nutritionist to explore healthy calorie adjustments.';
    } else if (bmi < 25) {
      category = 'Normal Weight';
      color = 'var(--success)';
      desc = 'A BMI between 18.5 and 24.9 is within the optimal healthy weight zone. Keep up the balanced diet and active lifestyle!';
    } else if (bmi < 30) {
      category = 'Overweight';
      color = 'var(--warning)';
      desc = 'A BMI between 25 and 29.9 indicates an overweight range. Modest adjustments in physical activities can help balance your scale.';
    } else {
      category = 'Obese';
      color = 'var(--error)';
      desc = 'A BMI of 30 or higher indicates obesity. Consider seeking medical guidance to establish positive health goals.';
    }

    bmiBadge.textContent = category;
    bmiBadge.style.backgroundColor = color;
    bmiDesc.textContent = desc;
  }

  weightSlider.addEventListener('input', calculateBMI);
  heightSlider.addEventListener('input', calculateBMI);

  unitMetric.addEventListener('click', () => { activeUnit = 'metric'; updateUnitLayout(); });
  unitImperial.addEventListener('click', () => { activeUnit = 'imperial'; updateUnitLayout(); });

  updateUnitLayout();
});`;
  }
  else {
    // Scaffold generic coming soon javascript
    return `// ${tool.name} Logic
document.addEventListener('DOMContentLoaded', () => {
  console.log('${tool.name} initialized in stub sandbox.');
});`;
  }
}
