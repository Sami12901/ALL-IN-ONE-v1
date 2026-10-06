/**
 * Typing Heatmap - Complete Client-Side Logic
 */

// Finger and Row Definitions
const FINGER_MAP = {
  // Left Pinky
  '`': 'Left Pinky', '~': 'Left Pinky', '1': 'Left Pinky', '!': 'Left Pinky',
  'Q': 'Left Pinky', 'A': 'Left Pinky', 'Z': 'Left Pinky',
  'Tab': 'Left Pinky', 'CapsLock': 'Left Pinky', 'ShiftLeft': 'Left Pinky',

  // Left Ring
  '2': 'Left Ring', '@': 'Left Ring', 'W': 'Left Ring', 'S': 'Left Ring', 'X': 'Left Ring',

  // Left Middle
  '3': 'Left Middle', '#': 'Left Middle', 'E': 'Left Middle', 'D': 'Left Middle', 'C': 'Left Middle',

  // Left Index
  '4': 'Left Index', '$': 'Left Index', '5': 'Left Index', '%': 'Left Index',
  'R': 'Left Index', 'T': 'Left Index', 'F': 'Left Index', 'G': 'Left Index',
  'V': 'Left Index', 'B': 'Left Index',

  // Thumbs
  'Space': 'Thumbs', 'Alt': 'Thumbs',

  // Right Index
  '6': 'Right Index', '^': 'Right Index', '7': 'Right Index', '&': 'Right Index',
  'Y': 'Right Index', 'U': 'Right Index', 'H': 'Right Index', 'J': 'Right Index',
  'N': 'Right Index', 'M': 'Right Index',

  // Right Middle
  '8': 'Right Middle', '*': 'Right Middle', 'I': 'Right Middle', 'K': 'Right Middle',
  ',': 'Right Middle', '<': 'Right Middle',

  // Right Ring
  '9': 'Right Ring', '(': 'Right Ring', 'O': 'Right Ring', 'L': 'Right Ring',
  '.': 'Right Ring', '>': 'Right Ring',

  // Right Pinky
  '0': 'Right Pinky', ')': 'Right Pinky', '-': 'Right Pinky', '_': 'Right Pinky',
  '=': 'Right Pinky', '+': 'Right Pinky', 'Backspace': 'Right Pinky',
  'P': 'Right Pinky', '[': 'Right Pinky', '{': 'Right Pinky', ']': 'Right Pinky', '}': 'Right Pinky',
  '\\': 'Right Pinky', '|': 'Right Pinky', ';': 'Right Pinky', ':': 'Right Pinky',
  '\'': 'Right Pinky', '"': 'Right Pinky', 'Enter': 'Right Pinky',
  '/': 'Right Pinky', '?': 'Right Pinky', 'ShiftRight': 'Right Pinky'
};

const SAMPLE_TEXTS = [
  "The quick brown fox jumps over the lazy dog while practicing accurate keystrokes across all rows of the keyboard.",
  "Functional programming emphasizes pure functions, immutable state pipelines, and declarative expressiveness.",
  "Ensure both hands maintain a relaxed posture centered over the home row to minimize repetitive pinky strain.",
  "Web applications run asynchronously across global clusters delivering millisecond response times to connected clients."
];

// Pre-packaged diagnostic scenarios
const PRESET_SCENARIOS = {
  'preset-programmer': {
    name: 'Programmer Brackets & Syntax Fatigue',
    advice: 'High error frequency observed around curly braces, square brackets, and minus symbols. Keep the right wrist neutral and pivot from the elbow rather than straining the right pinky.',
    keys: {
      '[': { hits: 45, errors: 12, avgLat: 310 },
      ']': { hits: 42, errors: 10, avgLat: 295 },
      '{': { hits: 38, errors: 11, avgLat: 320 },
      '}': { hits: 36, errors: 9, avgLat: 300 },
      '-': { hits: 50, errors: 14, avgLat: 340 },
      ';': { hits: 60, errors: 8, avgLat: 240 },
      '=': { hits: 55, errors: 9, avgLat: 270 },
      'P': { hits: 80, errors: 6, avgLat: 210 },
      'E': { hits: 140, errors: 2, avgLat: 110 },
      'T': { hits: 120, errors: 1, avgLat: 125 },
      'A': { hits: 110, errors: 3, avgLat: 130 },
      'S': { hits: 95, errors: 2, avgLat: 140 },
      'Space': { hits: 210, errors: 1, avgLat: 115 }
    }
  },

  'preset-pinky': {
    name: 'Pinky Finger Fatigue',
    advice: 'Significant error clusters detected on the outer peripheral keys (Q, P, Z, /, Shift). Consider lowering keyboard height and utilizing the opposite Shift key for capitalizations.',
    keys: {
      'Q': { hits: 35, errors: 8, avgLat: 320 },
      'P': { hits: 75, errors: 16, avgLat: 335 },
      'Z': { hits: 28, errors: 9, avgLat: 340 },
      '/': { hits: 30, errors: 7, avgLat: 310 },
      'ShiftLeft': { hits: 45, errors: 11, avgLat: 290 },
      'ShiftRight': { hits: 40, errors: 10, avgLat: 300 },
      'A': { hits: 110, errors: 12, avgLat: 220 },
      ';': { hits: 40, errors: 9, avgLat: 280 },
      'E': { hits: 150, errors: 2, avgLat: 120 },
      'I': { hits: 110, errors: 3, avgLat: 130 },
      'Space': { hits: 220, errors: 2, avgLat: 105 }
    }
  },

  'preset-pro': {
    name: 'High-Speed Pro (Balanced)',
    advice: 'Superb ergonomic stroke balance across all rows. Very fast inter-key latency and virtually zero peripheral mistakes. Maintain current hand position.',
    keys: {
      'E': { hits: 210, errors: 1, avgLat: 95 },
      'T': { hits: 185, errors: 0, avgLat: 102 },
      'A': { hits: 170, errors: 1, avgLat: 98 },
      'O': { hits: 165, errors: 0, avgLat: 105 },
      'I': { hits: 155, errors: 1, avgLat: 110 },
      'N': { hits: 150, errors: 0, avgLat: 108 },
      'S': { hits: 140, errors: 1, avgLat: 112 },
      'H': { hits: 135, errors: 0, avgLat: 115 },
      'R': { hits: 130, errors: 0, avgLat: 110 },
      'Space': { hits: 320, errors: 0, avgLat: 90 },
      'P': { hits: 80, errors: 1, avgLat: 140 },
      'C': { hits: 90, errors: 0, avgLat: 125 }
    }
  },

  'preset-lefthand': {
    name: 'Left Hand Fatigue',
    advice: 'Disproportionate error cluster detected across the left hand rows (W, E, R, S, D, F). Verify your left wrist is not resting with heavy pressure against desk edge.',
    keys: {
      'W': { hits: 60, errors: 12, avgLat: 260 },
      'E': { hits: 140, errors: 18, avgLat: 230 },
      'R': { hits: 95, errors: 14, avgLat: 250 },
      'S': { hits: 110, errors: 15, avgLat: 240 },
      'D': { hits: 90, errors: 11, avgLat: 245 },
      'F': { hits: 85, errors: 10, avgLat: 250 },
      'A': { hits: 120, errors: 16, avgLat: 270 },
      'J': { hits: 110, errors: 2, avgLat: 130 },
      'K': { hits: 95, errors: 1, avgLat: 125 },
      'Space': { hits: 240, errors: 2, avgLat: 115 }
    }
  }
};

class HeatmapApp {
  constructor() {
    this.metric = 'error'; // 'error', 'speed', 'frequency'
    this.selectedKey = 'A';

    // Key log store: keyId -> { hits, errors, totalLatency, countLat }
    this.keyData = {};

    // Live typing session state
    this.liveText = '';
    this.liveIndex = 0;
    this.lastStrokeTime = null;
    this.liveKeystrokes = 0;
    this.liveErrors = 0;
    this.liveStartTime = null;

    this.dom = {};
  }

  init() {
    this.cacheDOMElements();
    this.initializeKeyData();
    this.bindEvents();
    this.setupLivePractice();
    this.updateHeatmap();
    this.inspectKey('A');
  }

  cacheDOMElements() {
    this.dom.presetSelect = document.getElementById('presetScenarioSelect');
    this.dom.clearDataBtn = document.getElementById('clearDataBtn');
    this.dom.heatmapStatusTag = document.getElementById('heatmapStatusTag');
    this.dom.legendMinLabel = document.getElementById('legendMinLabel');
    this.dom.legendMaxLabel = document.getElementById('legendMaxLabel');

    // Live typing session
    this.dom.liveTypingCard = document.getElementById('liveTypingCard');
    this.dom.hiddenInput = document.getElementById('hiddenInput');
    this.dom.promptStream = document.getElementById('promptStream');
    this.dom.liveWpm = document.getElementById('liveWpm');
    this.dom.liveAcc = document.getElementById('liveAcc');
    this.dom.liveKeys = document.getElementById('liveKeys');

    // Inspector
    this.dom.inspKeyBadge = document.getElementById('inspKeyBadge');
    this.dom.inspKeyName = document.getElementById('inspKeyName');
    this.dom.inspFingerName = document.getElementById('inspFingerName');
    this.dom.inspTotalHits = document.getElementById('inspTotalHits');
    this.dom.inspErrors = document.getElementById('inspErrors');
    this.dom.inspAccuracy = document.getElementById('inspAccuracy');
    this.dom.inspLatency = document.getElementById('inspLatency');

    // Biometrics
    this.dom.barLPinky = document.getElementById('barLPinky');
    this.dom.valLPinky = document.getElementById('valLPinky');
    this.dom.barLRing = document.getElementById('barLRing');
    this.dom.valLRing = document.getElementById('valLRing');
    this.dom.barLMiddle = document.getElementById('barLMiddle');
    this.dom.valLMiddle = document.getElementById('valLMiddle');
    this.dom.barLIndex = document.getElementById('barLIndex');
    this.dom.valLIndex = document.getElementById('valLIndex');

    this.dom.barRIndex = document.getElementById('barRIndex');
    this.dom.valRIndex = document.getElementById('valRIndex');
    this.dom.barRMiddle = document.getElementById('barRMiddle');
    this.dom.valRMiddle = document.getElementById('valRMiddle');
    this.dom.barRRing = document.getElementById('barRRing');
    this.dom.valRRing = document.getElementById('valRRing');
    this.dom.barRPinky = document.getElementById('barRPinky');
    this.dom.valRPinky = document.getElementById('valRPinky');

    this.dom.barRow1 = document.getElementById('barRow1');
    this.dom.valRow1 = document.getElementById('valRow1');
    this.dom.barRow2 = document.getElementById('barRow2');
    this.dom.valRow2 = document.getElementById('valRow2');
    this.dom.barRow3 = document.getElementById('barRow3');
    this.dom.valRow3 = document.getElementById('valRow3');
    this.dom.barRow4 = document.getElementById('barRow4');
    this.dom.valRow4 = document.getElementById('valRow4');
    this.dom.barRow5 = document.getElementById('barRow5');
    this.dom.valRow5 = document.getElementById('valRow5');

    this.dom.adviceText = document.getElementById('adviceText');
  }

  initializeKeyData() {
    this.keyData = {};
    document.querySelectorAll('.kb-key').forEach(keyEl => {
      const keyId = keyEl.dataset.key;
      this.keyData[keyId] = {
        hits: 0,
        errors: 0,
        totalLatency: 0,
        countLat: 0
      };
    });
  }

  bindEvents() {
    // Metric Buttons
    document.querySelectorAll('[data-metric]').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('[data-metric]').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        this.metric = btn.dataset.metric;
        this.updateLegendLabels();
        this.updateHeatmap();
      });
    });

    // Preset Scenario Selector
    this.dom.presetSelect.addEventListener('change', (e) => {
      const val = e.target.value;
      if (val === 'live') {
        this.initializeKeyData();
        this.dom.liveTypingCard.style.display = 'flex';
        this.setupLivePractice();
        this.updateHeatmap();
      } else if (PRESET_SCENARIOS[val]) {
        this.loadScenario(PRESET_SCENARIOS[val]);
      }
    });

    // Reset Data
    this.dom.clearDataBtn.addEventListener('click', () => {
      this.initializeKeyData();
      this.dom.presetSelect.value = 'live';
      this.dom.liveTypingCard.style.display = 'flex';
      this.setupLivePractice();
      this.updateHeatmap();
      this.inspectKey(this.selectedKey);
    });

    // Key clicking & hovering on keyboard board
    document.querySelectorAll('.kb-key').forEach(el => {
      el.addEventListener('click', () => {
        const keyId = el.dataset.key;
        this.inspectKey(keyId);
      });
      el.addEventListener('mouseenter', () => {
        const keyId = el.dataset.key;
        this.inspectKey(keyId);
      });
    });

    // Live typing focus handling
    this.dom.liveTypingCard.addEventListener('click', () => {
      this.dom.hiddenInput.focus();
    });

    // Window Keydown for live session
    window.addEventListener('keydown', (e) => {
      if (this.dom.presetSelect.value !== 'live') return;

      if (e.key === 'F5' || e.key === 'F12' || (e.ctrlKey && e.key.toLowerCase() === 'r')) return;

      if (e.key === 'Tab') {
        e.preventDefault();
        return;
      }

      if (document.activeElement !== this.dom.hiddenInput) {
        this.dom.hiddenInput.focus();
      }

      this.handleLiveKeystroke(e);
    });
  }

  updateLegendLabels() {
    if (this.metric === 'error') {
      this.dom.heatmapStatusTag.textContent = 'Error Heatmap Active';
      this.dom.legendMinLabel.textContent = '🟢 Flawless (0 Typos)';
      this.dom.legendMaxLabel.textContent = '🔴 Hotspot (High Errors)';
    } else if (this.metric === 'speed') {
      this.dom.heatmapStatusTag.textContent = 'Speed / Latency Active';
      this.dom.legendMinLabel.textContent = '🟢 Fast (<130ms)';
      this.dom.legendMaxLabel.textContent = '🔴 Slow Latency (>300ms)';
    } else if (this.metric === 'frequency') {
      this.dom.heatmapStatusTag.textContent = 'Keystroke Volume Active';
      this.dom.legendMinLabel.textContent = '🔵 Low Usage';
      this.dom.legendMaxLabel.textContent = '🔥 Heavy Load Hotspot';
    }
  }

  loadScenario(scenario) {
    this.initializeKeyData();
    this.dom.liveTypingCard.style.display = 'none';

    // Populate scenario keys
    Object.entries(scenario.keys).forEach(([key, stats]) => {
      const match = this.resolveKeyElement(key);
      const keyId = match ? match.dataset.key : key;

      this.keyData[keyId] = {
        hits: stats.hits || 0,
        errors: stats.errors || 0,
        totalLatency: (stats.avgLat || 150) * (stats.hits || 1),
        countLat: stats.hits || 1
      };
    });

    this.dom.adviceText.textContent = scenario.advice;
    this.updateHeatmap();
    this.inspectKey(this.selectedKey);
  }

  setupLivePractice() {
    this.liveText = SAMPLE_TEXTS[Math.floor(Math.random() * SAMPLE_TEXTS.length)];
    this.liveIndex = 0;
    this.liveKeystrokes = 0;
    this.liveErrors = 0;
    this.liveStartTime = null;
    this.lastStrokeTime = null;

    this.renderPromptStream();
    this.updateLiveStats();
  }

  renderPromptStream() {
    this.dom.promptStream.innerHTML = '';
    const frag = document.createDocumentFragment();

    for (let i = 0; i < this.liveText.length; i++) {
      const char = this.liveText[i];
      const span = document.createElement('span');
      span.className = 'stream-char';
      if (i === 0) span.classList.add('current');

      if (char === ' ') {
        span.innerHTML = '&nbsp;';
      } else {
        span.textContent = char;
      }
      frag.appendChild(span);
    }

    this.dom.promptStream.appendChild(frag);
  }

  handleLiveKeystroke(e) {
    if (this.liveIndex >= this.liveText.length) {
      this.setupLivePractice();
      return;
    }

    const expectedChar = this.liveText[this.liveIndex];

    if (e.key === 'Backspace') {
      e.preventDefault();
      if (this.liveIndex > 0) {
        const prev = this.dom.promptStream.children[this.liveIndex];
        if (prev) prev.classList.remove('current');

        this.liveIndex--;
        const curr = this.dom.promptStream.children[this.liveIndex];
        if (curr) {
          curr.classList.remove('correct', 'incorrect');
          curr.classList.add('current');
        }
      }
      return;
    }

    if (e.key.length > 1 && e.key !== 'Enter') return;

    e.preventDefault();

    const now = Date.now();
    if (!this.liveStartTime) this.liveStartTime = now;
    const latency = this.lastStrokeTime ? Math.min(600, now - this.lastStrokeTime) : 120;
    this.lastStrokeTime = now;

    this.liveKeystrokes++;
    const typedChar = e.key;
    const isCorrect = typedChar === expectedChar;

    const keyEl = this.resolveKeyElement(typedChar);
    const keyId = keyEl ? keyEl.dataset.key : typedChar.toUpperCase();

    if (!this.keyData[keyId]) {
      this.keyData[keyId] = { hits: 0, errors: 0, totalLatency: 0, countLat: 0 };
    }

    this.keyData[keyId].hits++;
    this.keyData[keyId].totalLatency += latency;
    this.keyData[keyId].countLat++;

    const span = this.dom.promptStream.children[this.liveIndex];
    span.classList.remove('current');

    if (isCorrect) {
      span.classList.add('correct');
    } else {
      span.classList.add('incorrect');
      this.liveErrors++;
      this.keyData[keyId].errors++;
    }

    // Flash key briefly
    if (keyEl) {
      keyEl.classList.add('is-selected');
      setTimeout(() => keyEl.classList.remove('is-selected'), 120);
    }

    this.liveIndex++;

    if (this.liveIndex < this.liveText.length) {
      const nextSpan = this.dom.promptStream.children[this.liveIndex];
      nextSpan.classList.add('current');
    } else {
      setTimeout(() => this.setupLivePractice(), 800);
    }

    this.updateLiveStats();
    this.updateHeatmap();
    this.inspectKey(keyId);
  }

  updateLiveStats() {
    const elapsedMinutes = Math.max(0.05, (Date.now() - (this.liveStartTime || Date.now())) / 60000);
    const correctKeys = Math.max(0, this.liveKeystrokes - this.liveErrors);
    const wpm = Math.max(0, Math.round(((correctKeys / 5) - (this.liveErrors / 5)) / elapsedMinutes));
    const acc = this.liveKeystrokes > 0
      ? Math.round((correctKeys / this.liveKeystrokes) * 100)
      : 100;

    this.dom.liveWpm.textContent = `${wpm} WPM`;
    this.dom.liveAcc.textContent = `${acc}%`;
    this.dom.liveKeys.textContent = `${this.liveKeystrokes}`;
  }

  resolveKeyElement(char) {
    if (char === ' ') return document.querySelector('.kb-key[data-key="Space"]');
    const upper = char.toUpperCase();

    let found = document.querySelector(`.kb-key[data-key="${upper}"]`);
    if (found) return found;

    found = document.querySelector(`.kb-key[data-key="${char}"]`);
    if (found) return found;

    found = document.querySelector(`.kb-key[data-shift="${char}"]`);
    if (found) return found;

    return null;
  }

  updateHeatmap() {
    let maxHits = 1;
    Object.values(this.keyData).forEach(d => {
      if (d.hits > maxHits) maxHits = d.hits;
    });

    document.querySelectorAll('.kb-key').forEach(keyEl => {
      const keyId = keyEl.dataset.key;
      const data = this.keyData[keyId] || { hits: 0, errors: 0, totalLatency: 0, countLat: 0 };

      if (data.hits === 0) {
        keyEl.style.backgroundColor = 'var(--bg-secondary)';
        keyEl.style.color = 'var(--text-primary)';
        keyEl.style.borderColor = 'var(--border)';
        return;
      }

      if (this.metric === 'error') {
        const errorRate = data.hits > 0 ? (data.errors / data.hits) : 0;
        if (data.errors === 0) {
          keyEl.style.backgroundColor = 'rgba(16, 185, 129, 0.45)';
          keyEl.style.color = '#ffffff';
          keyEl.style.borderColor = '#10b981';
        } else if (errorRate < 0.1) {
          keyEl.style.backgroundColor = 'rgba(56, 189, 248, 0.45)';
          keyEl.style.color = '#ffffff';
          keyEl.style.borderColor = '#38bdf8';
        } else if (errorRate < 0.22) {
          keyEl.style.backgroundColor = 'rgba(245, 158, 11, 0.55)';
          keyEl.style.color = '#ffffff';
          keyEl.style.borderColor = '#f59e0b';
        } else {
          keyEl.style.backgroundColor = 'rgba(239, 68, 68, 0.65)';
          keyEl.style.color = '#ffffff';
          keyEl.style.borderColor = '#ef4444';
        }
      } else if (this.metric === 'speed') {
        const avgLat = data.countLat > 0 ? (data.totalLatency / data.countLat) : 200;
        if (avgLat < 140) {
          keyEl.style.backgroundColor = 'rgba(16, 185, 129, 0.5)';
          keyEl.style.borderColor = '#10b981';
        } else if (avgLat < 220) {
          keyEl.style.backgroundColor = 'rgba(56, 189, 248, 0.5)';
          keyEl.style.borderColor = '#38bdf8';
        } else if (avgLat < 300) {
          keyEl.style.backgroundColor = 'rgba(245, 158, 11, 0.55)';
          keyEl.style.borderColor = '#f59e0b';
        } else {
          keyEl.style.backgroundColor = 'rgba(239, 68, 68, 0.65)';
          keyEl.style.borderColor = '#ef4444';
        }
        keyEl.style.color = '#ffffff';
      } else if (this.metric === 'frequency') {
        const intensity = Math.min(1, data.hits / maxHits);
        if (intensity < 0.25) {
          keyEl.style.backgroundColor = 'rgba(78, 133, 191, 0.3)';
          keyEl.style.borderColor = 'var(--border)';
        } else if (intensity < 0.55) {
          keyEl.style.backgroundColor = 'rgba(56, 189, 248, 0.55)';
          keyEl.style.borderColor = '#38bdf8';
        } else if (intensity < 0.8) {
          keyEl.style.backgroundColor = 'rgba(245, 158, 11, 0.6)';
          keyEl.style.borderColor = '#f59e0b';
        } else {
          keyEl.style.backgroundColor = 'rgba(239, 68, 68, 0.7)';
          keyEl.style.borderColor = '#ef4444';
        }
        keyEl.style.color = '#ffffff';
      }
    });

    this.updateBiometrics();
  }

  inspectKey(keyId) {
    this.selectedKey = keyId;

    document.querySelectorAll('.kb-key').forEach(el => {
      el.classList.toggle('is-selected', el.dataset.key === keyId);
    });

    const data = this.keyData[keyId] || { hits: 0, errors: 0, totalLatency: 0, countLat: 0 };
    const finger = FINGER_MAP[keyId] || 'Unassigned';
    const acc = data.hits > 0 ? Math.round(((data.hits - data.errors) / data.hits) * 100) : 100;
    const avgLat = data.countLat > 0 ? Math.round(data.totalLatency / data.countLat) : 0;

    this.dom.inspKeyBadge.textContent = keyId === 'Space' ? '␣' : (keyId.length > 2 ? keyId[0] : keyId);
    this.dom.inspKeyName.textContent = `Key '${keyId}'`;
    this.dom.inspFingerName.textContent = finger;
    this.dom.inspTotalHits.textContent = `${data.hits}`;
    this.dom.inspErrors.textContent = `${data.errors}`;
    this.dom.inspAccuracy.textContent = `${acc}%`;
    this.dom.inspLatency.textContent = avgLat > 0 ? `${avgLat} ms` : 'N/A';
  }

  updateBiometrics() {
    const fingerStats = {
      'Left Pinky': { hits: 0, errors: 0 },
      'Left Ring': { hits: 0, errors: 0 },
      'Left Middle': { hits: 0, errors: 0 },
      'Left Index': { hits: 0, errors: 0 },
      'Right Index': { hits: 0, errors: 0 },
      'Right Middle': { hits: 0, errors: 0 },
      'Right Ring': { hits: 0, errors: 0 },
      'Right Pinky': { hits: 0, errors: 0 }
    };

    const rowStats = {
      'row1': { hits: 0, errors: 0 },
      'row2': { hits: 0, errors: 0 },
      'row3': { hits: 0, errors: 0 },
      'row4': { hits: 0, errors: 0 },
      'row5': { hits: 0, errors: 0 }
    };

    Object.entries(this.keyData).forEach(([key, d]) => {
      const finger = FINGER_MAP[key];
      if (finger && fingerStats[finger]) {
        fingerStats[finger].hits += d.hits;
        fingerStats[finger].errors += d.errors;
      }

      const keyEl = document.querySelector(`.kb-key[data-key="${key}"]`);
      if (keyEl && keyEl.parentElement && keyEl.parentElement.dataset.row) {
        const row = keyEl.parentElement.dataset.row;
        if (rowStats[row]) {
          rowStats[row].hits += d.hits;
          rowStats[row].errors += d.errors;
        }
      }
    });

    const getAcc = (obj) => {
      if (!obj || obj.hits === 0) return 100;
      return Math.max(0, Math.round(((obj.hits - obj.errors) / obj.hits) * 100));
    };

    // Update fingers
    const lp = getAcc(fingerStats['Left Pinky']);
    const lr = getAcc(fingerStats['Left Ring']);
    const lm = getAcc(fingerStats['Left Middle']);
    const li = getAcc(fingerStats['Left Index']);
    const ri = getAcc(fingerStats['Right Index']);
    const rm = getAcc(fingerStats['Right Middle']);
    const rr = getAcc(fingerStats['Right Ring']);
    const rp = getAcc(fingerStats['Right Pinky']);

    this.dom.barLPinky.style.width = `${lp}%`; this.dom.valLPinky.textContent = `${lp}%`;
    this.dom.barLRing.style.width = `${lr}%`; this.dom.valLRing.textContent = `${lr}%`;
    this.dom.barLMiddle.style.width = `${lm}%`; this.dom.valLMiddle.textContent = `${lm}%`;
    this.dom.barLIndex.style.width = `${li}%`; this.dom.valLIndex.textContent = `${li}%`;
    this.dom.barRIndex.style.width = `${ri}%`; this.dom.valRIndex.textContent = `${ri}%`;
    this.dom.barRMiddle.style.width = `${rm}%`; this.dom.valRMiddle.textContent = `${rm}%`;
    this.dom.barRRing.style.width = `${rr}%`; this.dom.valRRing.textContent = `${rr}%`;
    this.dom.barRPinky.style.width = `${rp}%`; this.dom.valRPinky.textContent = `${rp}%`;

    // Update rows
    const r1 = getAcc(rowStats['row1']);
    const r2 = getAcc(rowStats['row2']);
    const r3 = getAcc(rowStats['row3']);
    const r4 = getAcc(rowStats['row4']);
    const r5 = getAcc(rowStats['row5']);

    this.dom.barRow1.style.width = `${r1}%`; this.dom.valRow1.textContent = `${r1}%`;
    this.dom.barRow2.style.width = `${r2}%`; this.dom.valRow2.textContent = `${r2}%`;
    this.dom.barRow3.style.width = `${r3}%`; this.dom.valRow3.textContent = `${r3}%`;
    this.dom.barRow4.style.width = `${r4}%`; this.dom.valRow4.textContent = `${r4}%`;
    this.dom.barRow5.style.width = `${r5}%`; this.dom.valRow5.textContent = `${r5}%`;
  }
}

document.addEventListener('DOMContentLoaded', () => {
  const app = new HeatmapApp();
  app.init();
});