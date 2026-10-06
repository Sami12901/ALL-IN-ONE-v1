/**
 * Accuracy Calculator & Keystroke Diagnostics Benchmark
 * Fully client-side vanilla ES Module.
 */

const PASSAGES = {
  prose: [
    "Accuracy in keyboard navigation depends on deliberate finger placement and neuro-motor habituation. Rushing keystrokes invariably degrades muscular precision, resulting in costly backspace corrections and fragmented workflow cadence. Prioritizing rhythm over raw velocity consistently produces superior professional typing speed.",
    "The quiet hum of the library created an atmosphere of deep concentration. Scholars and students alike tapped rhythmically upon mechanical keyboards, translating complex thoughts into digital prose with meticulous precision and unwavering focus.",
    "Mastery of any discipline demands patience, deliberate feedback loops, and an honest assessment of recurring micro-errors. By diagnosing each misplaced keystroke, one can systematically retrain cognitive reflexes."
  ],
  punctuation: [
    "In 2024, approximately 48.7% of engineers reported a 15-20% boost in throughput after adopting structured formatting; however, 32.1% noted syntax errors (e.g., mismatched brackets, missing semicolons, or improper quotes: 'single' vs. \"double\").",
    "Key financial ratios—such as P/E: 24.5x, EV/EBITDA: 14.2x, & net margin: 18.9%—demonstrate sustainable enterprise growth! Always verify quarterly balance sheets (Q1-Q4) before executing transactions: $125,000 to $450,000.",
    "System diagnostics report: CPU #1 @ 98.4%, RAM #2 @ 72.3% (swap memory: 4.1GB/16.0GB); network throughput: 845.2 MB/s [latency: 12ms, packet loss: 0.02%]."
  ],
  code: [
    "const calculateMetrics = (keystrokes = [], durationMs = 0) => {\n  const errors = keystrokes.filter(k => !k.isCorrect).length;\n  const accuracy = (keystrokes.length - errors) / (keystrokes.length || 1) * 100;\n  return { accuracy: Number(accuracy.toFixed(2)), errors };\n};",
    "function debounce(fn, delay = 250) {\n  let timeoutId = null;\n  return (...args) => {\n    if (timeoutId) clearTimeout(timeoutId);\n    timeoutId = setTimeout(() => fn.apply(this, args), delay);\n  };\n}",
    "export async function fetchUserData(userId) {\n  const response = await fetch(`/api/v1/users/${userId}`);\n  if (!response.ok) throw new Error(`HTTP ${response.status}: Failed to retrieve user.`);\n  return await response.json();\n}"
  ]
};

const FINGER_MAP = {
  'q': 'Left Pinky', 'a': 'Left Pinky', 'z': 'Left Pinky', '1': 'Left Pinky',
  'w': 'Left Ring', 's': 'Left Ring', 'x': 'Left Ring', '2': 'Left Ring',
  'e': 'Left Middle', 'd': 'Left Middle', 'c': 'Left Middle', '3': 'Left Middle',
  'r': 'Left Index', 'f': 'Left Index', 'v': 'Left Index', 't': 'Left Index', 'g': 'Left Index', 'b': 'Left Index', '4': 'Left Index', '5': 'Left Index',
  'y': 'Right Index', 'h': 'Right Index', 'n': 'Right Index', 'u': 'Right Index', 'j': 'Right Index', 'm': 'Right Index', '6': 'Right Index', '7': 'Right Index',
  'i': 'Right Middle', 'k': 'Right Middle', ',': 'Right Middle', '8': 'Right Middle',
  'o': 'Right Ring', 'l': 'Right Ring', '.': 'Right Ring', '9': 'Right Ring',
  'p': 'Right Pinky', ';': 'Right Pinky', '/': 'Right Pinky', '0': 'Right Pinky', '-': 'Right Pinky', '=': 'Right Pinky'
};

class AccuracyApp {
  constructor() {
    this.currentMode = 'prose';
    this.targetText = '';
    this.currentIndex = 0;

    // Metrics counters
    this.totalKeystrokes = 0;
    this.correctKeystrokes = 0;
    this.errorKeystrokes = 0;
    this.backspaceCount = 0;

    // Error logging
    this.missedCharsMap = {}; // 'c': 3
    this.confusionPairs = {}; // 'c->v': { expected: 'c', typed: 'v', count: 2 }
    this.typedHistory = [];

    this.dom = {
      valAccuracy: document.getElementById('val-accuracy'),
      valTotalKeys: document.getElementById('val-total-keys'),
      valCorrectKeys: document.getElementById('val-correct-keys'),
      valErrorKeys: document.getElementById('val-error-keys'),
      valBackspaces: document.getElementById('val-backspaces'),
      valErrorRate: document.getElementById('val-error-rate'),

      modeSelector: document.getElementById('mode-selector'),
      btnReset: document.getElementById('btn-reset'),
      btnCopyReport: document.getElementById('btn-copy-report'),

      passageContainer: document.getElementById('passage-container'),
      passageText: document.getElementById('passage-text'),
      typingInput: document.getElementById('typing-input'),
      clickPrompt: document.getElementById('click-prompt'),

      heatmapGrid: document.getElementById('heatmap-grid'),
      pairsList: document.getElementById('pairs-list'),
      recommendationsList: document.getElementById('recommendations-list')
    };

    this.initHeatmapGrid();
    this.bindEvents();
    this.loadPassage();
  }

  initHeatmapGrid() {
    const letters = 'abcdefghijklmnopqrstuvwxyz'.split('');
    this.dom.heatmapGrid.innerHTML = '';
    letters.forEach(letter => {
      const tile = document.createElement('div');
      tile.className = 'heat-tile';
      tile.id = `heat-${letter}`;
      tile.innerHTML = `
        <span>${letter.toUpperCase()}</span>
        <span class="heat-count">0</span>
      `;
      this.dom.heatmapGrid.appendChild(tile);
    });
  }

  bindEvents() {
    this.dom.passageContainer.addEventListener('click', () => {
      this.dom.typingInput.focus();
      this.dom.clickPrompt.classList.add('hidden');
      this.dom.passageContainer.classList.add('is-focused');
    });

    this.dom.typingInput.addEventListener('keydown', (e) => this.handleKeyDown(e));

    this.dom.modeSelector.addEventListener('click', (e) => {
      const btn = e.target.closest('.pill-btn');
      if (!btn) return;
      this.dom.modeSelector.querySelectorAll('.pill-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      this.currentMode = btn.dataset.mode;
      this.loadPassage();
    });

    this.dom.btnReset.addEventListener('click', () => this.resetBenchmark());
    this.dom.btnCopyReport.addEventListener('click', () => this.copyReport());

    document.addEventListener('keydown', (e) => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
      if (!e.ctrlKey && !e.altKey && !e.metaKey && e.key.length === 1) {
        this.dom.typingInput.focus();
        this.dom.clickPrompt.classList.add('hidden');
        this.dom.passageContainer.classList.add('is-focused');
      }
    });
  }

  loadPassage() {
    this.resetBenchmark();
    const pool = PASSAGES[this.currentMode] || PASSAGES.prose;
    const randomIndex = Math.floor(Math.random() * pool.length);
    this.targetText = pool[randomIndex];
    this.renderPassage();
  }

  renderPassage() {
    this.dom.passageText.innerHTML = '';
    const fragment = document.createDocumentFragment();

    for (let i = 0; i < this.targetText.length; i++) {
      const span = document.createElement('span');
      span.className = 'char char-pending';
      span.textContent = this.targetText[i];
      if (i === 0) span.classList.add('char-current');
      fragment.appendChild(span);
    }

    this.dom.passageText.appendChild(fragment);
    this.typedHistory = new Array(this.targetText.length).fill(null);
    this.currentIndex = 0;
    this.dom.clickPrompt.classList.remove('hidden');
  }

  handleKeyDown(e) {
    if (e.key === ' ' || e.code === 'Space') {
      e.preventDefault();
    }

    if (e.key === 'Shift' || e.key === 'Control' || e.key === 'Alt' || e.key === 'CapsLock' || e.key === 'Tab') {
      return;
    }

    this.dom.clickPrompt.classList.add('hidden');

    // Handle Backspace
    if (e.key === 'Backspace') {
      e.preventDefault();
      this.backspaceCount++;
      this.totalKeystrokes++;

      if (this.currentIndex > 0) {
        this.currentIndex--;
        this.typedHistory[this.currentIndex] = null;
        this.updateCharDisplay(this.currentIndex);
      }

      this.updateMetrics();
      this.updateRecommendations();
      return;
    }

    if (e.key.length !== 1) return;

    this.totalKeystrokes++;
    const expected = this.targetText[this.currentIndex];
    const typed = e.key;
    const isCorrect = typed === expected;

    if (isCorrect) {
      this.correctKeystrokes++;
    } else {
      this.errorKeystrokes++;
      // Log missed letter
      const lowerExpected = expected.toLowerCase();
      this.missedCharsMap[lowerExpected] = (this.missedCharsMap[lowerExpected] || 0) + 1;

      // Log confusion pair
      const pairKey = `${expected}->${typed}`;
      if (!this.confusionPairs[pairKey]) {
        this.confusionPairs[pairKey] = {
          expected: expected,
          typed: typed,
          count: 0
        };
      }
      this.confusionPairs[pairKey].count++;

      this.updateHeatmap();
      this.updateConfusionPairsUI();
    }

    this.typedHistory[this.currentIndex] = { typed, expected, isCorrect };
    this.currentIndex++;
    this.updateCharDisplay(this.currentIndex - 1);

    this.updateMetrics();
    this.updateRecommendations();

    if (this.currentIndex >= this.targetText.length) {
      this.finishBenchmark();
    }
  }

  updateCharDisplay(idx) {
    const spans = this.dom.passageText.children;
    if (spans[idx]) {
      const entry = this.typedHistory[idx];
      spans[idx].className = 'char';
      if (entry === null) {
        spans[idx].classList.add('char-pending');
      } else if (entry.isCorrect) {
        spans[idx].classList.add('char-correct');
      } else {
        spans[idx].classList.add('char-error');
      }
    }

    for (let i = 0; i < spans.length; i++) {
      spans[i].classList.remove('char-current');
      if (i === this.currentIndex) {
        spans[i].classList.add('char-current');
        spans[i].scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
    }
  }

  updateMetrics() {
    const accuracy = this.totalKeystrokes > 0
      ? ((this.correctKeystrokes / this.totalKeystrokes) * 100).toFixed(1)
      : '100.0';

    const errorRate = this.totalKeystrokes > 0
      ? ((this.errorKeystrokes / this.totalKeystrokes) * 100).toFixed(1)
      : '0.0';

    this.dom.valAccuracy.textContent = `${accuracy}%`;
    this.dom.valTotalKeys.textContent = this.totalKeystrokes;
    this.dom.valCorrectKeys.textContent = this.correctKeystrokes;
    this.dom.valErrorKeys.textContent = this.errorKeystrokes;
    this.dom.valBackspaces.textContent = this.backspaceCount;
    this.dom.valErrorRate.textContent = `${errorRate}%`;
  }

  updateHeatmap() {
    for (const [letter, count] of Object.entries(this.missedCharsMap)) {
      const tile = document.getElementById(`heat-${letter}`);
      if (tile) {
        const countSpan = tile.querySelector('.heat-count');
        if (countSpan) countSpan.textContent = count;

        tile.classList.remove('heat-low', 'heat-medium', 'heat-high');
        if (count >= 5) {
          tile.classList.add('heat-high');
        } else if (count >= 3) {
          tile.classList.add('heat-medium');
        } else if (count >= 1) {
          tile.classList.add('heat-low');
        }
      }
    }
  }

  updateConfusionPairsUI() {
    const pairsArray = Object.values(this.confusionPairs).sort((a, b) => b.count - a.count);

    if (pairsArray.length === 0) {
      this.dom.pairsList.innerHTML = `
        <div style="font-size: 0.825rem; color: var(--text-tertiary); text-align: center; padding: 1rem;">
          No confused pairs recorded yet. Start typing to analyze patterns!
        </div>
      `;
      return;
    }

    this.dom.pairsList.innerHTML = '';
    pairsArray.slice(0, 5).forEach(pair => {
      const row = document.createElement('div');
      row.className = 'pair-row';
      const expDisp = pair.expected === ' ' ? 'SPACE' : pair.expected;
      const typDisp = pair.typed === ' ' ? 'SPACE' : pair.typed;

      row.innerHTML = `
        <div class="pair-detail">
          <span>Expected</span>
          <span class="key-badge expected">${expDisp}</span>
          <span>&rarr; Typed</span>
          <span class="key-badge typed">${typDisp}</span>
        </div>
        <div class="pair-badge">${pair.count} &times; missed</div>
      `;
      this.dom.pairsList.appendChild(row);
    });
  }

  updateRecommendations() {
    const recs = [];

    // Accuracy threshold check
    const accuracy = this.totalKeystrokes > 0 ? (this.correctKeystrokes / this.totalKeystrokes) * 100 : 100;
    if (accuracy < 95 && this.totalKeystrokes > 20) {
      recs.push({
        icon: '⚠️',
        text: `<strong>Speed vs Precision Imbalance:</strong> Current accuracy is ${accuracy.toFixed(1)}%. Practicing below 95% ingrains inaccurate neural pathways. Ease off typing velocity by 10-15% until keystrokes are confident.`
      });
    }

    // Backspace usage check
    if (this.backspaceCount > 0 && this.totalKeystrokes > 30) {
      const backspaceRatio = (this.backspaceCount / this.totalKeystrokes) * 100;
      if (backspaceRatio > 12) {
        recs.push({
          icon: '🔄',
          text: `<strong>High Backspace Ratio (${backspaceRatio.toFixed(1)}%):</strong> You are correcting mistakes retroactively. Keep your gaze positioned 1-2 words ahead of your fingers to anticipate complex letter sequences.`
        });
      }
    }

    // Top missed keys check
    const missedKeys = Object.entries(this.missedCharsMap).sort((a, b) => b[1] - a[1]);
    if (missedKeys.length > 0) {
      const [topLetter, topCount] = missedKeys[0];
      const finger = FINGER_MAP[topLetter] || 'Finger';
      recs.push({
        icon: '🖐️',
        text: `<strong>Target Key Focus ('${topLetter.toUpperCase()}'):</strong> Missed ${topCount} times. This key is governed by your <em>${finger}</em>. Perform isolated 3-minute drills alternating home row rest and ${topLetter.toUpperCase()} reaches.`
      });
    }

    // Confusion pair analysis
    const pairs = Object.values(this.confusionPairs).sort((a, b) => b.count - a.count);
    if (pairs.length > 0) {
      const topPair = pairs[0];
      recs.push({
        icon: '🧠',
        text: `<strong>Confusion Pattern:</strong> Mistyping '${topPair.expected}' as '${topPair.typed}' indicates adjacent finger interference or spatial overreach. Anchor adjacent fingers to the home row to stabilize leverage.`
      });
    }

    // Default recommendation if high performance
    if (recs.length === 0) {
      recs.push({
        icon: '✨',
        text: '<strong>Exceptional Rhythm:</strong> Keystroke precision is in peak form. Focus on maintaining steady breathing and relaxation in wrists and forearms to prevent fatigue during extended sessions.'
      });
    }

    this.dom.recommendationsList.innerHTML = recs.map(r => `
      <div class="rec-item">
        <div class="rec-icon">${r.icon}</div>
        <div>${r.text}</div>
      </div>
    `).join('');
  }

  finishBenchmark() {
    this.updateRecommendations();
  }

  resetBenchmark() {
    this.currentIndex = 0;
    this.totalKeystrokes = 0;
    this.correctKeystrokes = 0;
    this.errorKeystrokes = 0;
    this.backspaceCount = 0;
    this.missedCharsMap = {};
    this.confusionPairs = {};
    this.typedHistory = [];

    this.initHeatmapGrid();
    this.updateConfusionPairsUI();
    this.updateMetrics();
    this.updateRecommendations();
    this.renderPassage();
    this.dom.typingInput.value = '';
    this.dom.typingInput.focus();
  }

  copyReport() {
    const accuracy = this.totalKeystrokes > 0
      ? ((this.correctKeystrokes / this.totalKeystrokes) * 100).toFixed(2)
      : '100.00';

    const missedKeys = Object.entries(this.missedCharsMap)
      .sort((a, b) => b[1] - a[1])
      .map(([k, c]) => `${k.toUpperCase()} (${c}x)`)
      .join(', ') || 'None';

    const confused = Object.values(this.confusionPairs)
      .sort((a, b) => b.count - a.count)
      .slice(0, 3)
      .map(p => `'${p.expected}' -> '${p.typed}' (${p.count}x)`)
      .join(', ') || 'None';

    const report = `📊 Typing Precision Diagnostics Report:
Accuracy: ${accuracy}%
Total Keystrokes: ${this.totalKeystrokes}
Correct Keystrokes: ${this.correctKeystrokes}
Error Keystrokes: ${this.errorKeystrokes}
Backspace Count: ${this.backspaceCount}
Most Missed Letters: ${missedKeys}
Top Confusion Pairs: ${confused}
Mode: ${this.currentMode}
Generated with ALL IN ONE Accuracy Calculator`;

    navigator.clipboard.writeText(report).then(() => {
      const orig = this.dom.btnCopyReport.textContent;
      this.dom.btnCopyReport.textContent = 'Report Copied!';
      setTimeout(() => {
        this.dom.btnCopyReport.textContent = orig;
      }, 2000);
    });
  }
}

document.addEventListener('DOMContentLoaded', () => {
  new AccuracyApp();
});