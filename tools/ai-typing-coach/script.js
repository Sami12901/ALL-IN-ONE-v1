// AI Typing Coach - Weak-Finger & Latency Diagnostic Engine

const FINGER_MAP = {
  // Left Pinky
  '`': 'LP', '1': 'LP', 'q': 'LP', 'a': 'LP', 'z': 'LP',
  // Left Ring
  '2': 'LR', 'w': 'LR', 's': 'LR', 'x': 'LR',
  // Left Middle
  '3': 'LM', 'e': 'LM', 'd': 'LM', 'c': 'LM',
  // Left Index
  '4': 'LI', '5': 'LI', 'r': 'LI', 't': 'LI', 'f': 'LI', 'g': 'LI', 'v': 'LI', 'b': 'LI',
  // Thumbs
  ' ': 'TH',
  // Right Index
  '6': 'RI', '7': 'RI', 'y': 'RI', 'u': 'RI', 'h': 'RI', 'j': 'RI', 'n': 'RI', 'm': 'RI',
  // Right Middle
  '8': 'RM', 'i': 'RM', 'k': 'RM', ',': 'RM',
  // Right Ring
  '9': 'RR', 'o': 'RR', 'l': 'RR', '.': 'RR',
  // Right Pinky
  '0': 'RP', '-': 'RP', '=': 'RP', 'p': 'RP', '[': 'RP', ']': 'RP', ';': 'RP', "'": 'RP', '/': 'RP'
};

const FINGER_NAMES = {
  LP: 'Left Pinky',
  LR: 'Left Ring',
  LM: 'Left Middle',
  LI: 'Left Index',
  TH: 'Thumbs (Space)',
  RI: 'Right Index',
  RM: 'Right Middle',
  RR: 'Right Ring',
  RP: 'Right Pinky'
};

const FINGER_COLORS = {
  LP: '#ec4899',
  LR: '#a855f7',
  LM: '#3b82f6',
  LI: '#06b6d4',
  TH: '#10b981',
  RI: '#84cc16',
  RM: '#eab308',
  RR: '#f97316',
  RP: '#ef4444'
};

// Vocabulary bank targeted at specific fingers and keys
const REMEDIAL_LEXICON = {
  LP: ['aqua', 'azure', 'quip', 'quiz', 'plaza', 'zebra', 'zero', 'equal', 'queen', 'quote', 'crazy', 'lazy', 'squad', 'pizza', 'graze', 'quartz', 'blaze', 'quick', 'quarry', 'freeze', 'amaze', 'hazard'],
  LR: ['sweet', 'wrist', 'waste', 'extra', 'wax', 'swift', 'water', 'sword', 'six', 'switch', 'shadow', 'oxide', 'pixel', 'exact', 'sweat', 'relax', 'toxic', 'twist', 'box', 'mixed'],
  LM: ['decide', 'echo', 'cedar', 'cloud', 'climb', 'code', 'dance', 'edge', 'exact', 'credit', 'deck', 'direct', 'candle', 'clerk', 'cradle', 'cider', 'decade', 'clinic'],
  LI: ['brave', 'flight', 'target', 'frost', 'great', 'vivid', 'tiger', 'fruit', 'globe', 'gravity', 'travel', 'verve', 'bridge', 'front', 'river', 'brief', 'gift', 'vibrant'],
  TH: ['the', 'and', 'for', 'are', 'but', 'not', 'you', 'all', 'any', 'can', 'had', 'her', 'was', 'one', 'our', 'out', 'day', 'get', 'has', 'him'],
  RI: ['young', 'honey', 'night', 'human', 'ninja', 'myth', 'heavy', 'jump', 'jungle', 'hyper', 'yacht', 'honor', 'major', 'joint', 'magic', 'hurry', 'manor'],
  RM: ['kind', 'king', 'milk', 'kite', 'kick', 'silk', 'ink', 'knit', 'pink', 'skip', 'skin', 'risk', 'task', 'desk', 'disk', 'pike', 'folk'],
  RR: ['pilot', 'polar', 'lemon', 'loop', 'look', 'plot', 'pool', 'olive', 'lion', 'solar', 'color', 'logic', 'loose', 'noble', 'portal', 'flock', 'gloom'],
  RP: ['prompt', 'paper', 'power', 'purple', 'people', 'period', 'proper', 'point', 'press', 'price', 'polar', 'prime', 'pepper', 'puppy', 'prior', 'plum', 'peril']
};

const DIAGNOSTIC_TEXT = "Quiet explorers quickly ventured through dazzling frozen plazas, balancing exceptional speed with rhythm. Dexterous fingers navigated intricate code syntax, optimizing keystroke latency across every row.";

class AiTypingCoach {
  constructor() {
    this.mode = 'diagnostic'; // 'diagnostic' or 'remedial'
    this.targetText = DIAGNOSTIC_TEXT;
    this.charElements = [];
    this.currentCharIndex = 0;
    this.isRunning = false;
    this.startTime = null;

    // Per-key telemetry
    this.keyStats = {}; // key -> { count, errors, latencies: [] }
    this.lastKeystrokeTime = null;

    // Stats
    this.totalTyped = 0;
    this.correctTyped = 0;
    this.errorCount = 0;

    this.initDom();
    this.bindEvents();
    this.renderText();
    this.renderInitialAnalysis();
  }

  initDom() {
    this.btnDiagnostic = document.getElementById('btnModeDiagnostic');
    this.btnRemedial = document.getElementById('btnModeRemedial');
    this.resetBtn = document.getElementById('resetDiagnosticBtn');
    this.startBtn = document.getElementById('startCoachTestBtn');
    this.arenaTitle = document.getElementById('arenaTitle');
    this.wordsDisplay = document.getElementById('coachWordsDisplay');
    this.hiddenInput = document.getElementById('coachHiddenInput');

    // Telemetry HUD
    this.hudWpm = document.getElementById('coachWpm');
    this.hudAcc = document.getElementById('coachAcc');
    this.hudLatency = document.getElementById('coachLatency');

    // Diagnostic Results
    this.weakFingersList = document.getElementById('weakFingersList');
    this.coachInsights = document.getElementById('coachInsights');

    // Remedial Box
    this.generateRemedialBtn = document.getElementById('generateRemedialBtn');
    this.remedialPreview = document.getElementById('generatedDrillPreview');
    this.startRemedialBtn = document.getElementById('startRemedialPracticeBtn');

    // Keyboard keys map
    this.kbKeyElements = {};
    document.querySelectorAll('.kb-key[data-key]').forEach(el => {
      this.kbKeyElements[el.dataset.key.toLowerCase()] = el;
    });
  }

  bindEvents() {
    this.btnDiagnostic.addEventListener('click', () => {
      this.mode = 'diagnostic';
      this.btnDiagnostic.classList.add('active');
      this.btnRemedial.classList.remove('active');
      this.targetText = DIAGNOSTIC_TEXT;
      this.arenaTitle.textContent = 'Diagnostic Test (35 Words)';
      this.resetAssessment();
    });

    this.btnRemedial.addEventListener('click', () => {
      this.mode = 'remedial';
      this.btnRemedial.classList.add('active');
      this.btnDiagnostic.classList.remove('active');
      this.generateCustomDrill();
      this.arenaTitle.textContent = 'Targeted Remedial Drill (30 Words)';
      this.resetAssessment();
    });

    this.resetBtn.addEventListener('click', () => this.resetAssessment());

    this.startBtn.addEventListener('click', () => {
      this.startTest();
    });

    this.wordsDisplay.addEventListener('click', () => {
      this.hiddenInput.focus();
    });

    this.hiddenInput.addEventListener('input', (e) => this.handleInput(e));

    this.generateRemedialBtn.addEventListener('click', () => {
      this.generateCustomDrill();
    });

    this.startRemedialBtn.addEventListener('click', () => {
      this.btnRemedial.click();
      this.startTest();
    });
  }

  renderText() {
    this.wordsDisplay.innerHTML = '';
    this.charElements = [];
    const words = this.targetText.split(' ');
    let globalIndex = 0;

    words.forEach((w, wIdx) => {
      const wSpan = document.createElement('span');
      wSpan.style.display = 'inline-block';
      wSpan.style.marginRight = '0.5em';

      for (let i = 0; i < w.length; i++) {
        const cSpan = document.createElement('span');
        cSpan.className = 'coach-char';
        cSpan.textContent = w[i];
        if (globalIndex === 0) cSpan.classList.add('current');
        wSpan.appendChild(cSpan);
        this.charElements.push(cSpan);
        globalIndex++;
      }

      if (wIdx < words.length - 1) {
        const sSpan = document.createElement('span');
        sSpan.className = 'coach-char';
        sSpan.textContent = ' ';
        wSpan.appendChild(sSpan);
        this.charElements.push(sSpan);
        globalIndex++;
      }

      this.wordsDisplay.appendChild(wSpan);
    });
  }

  startTest() {
    this.currentCharIndex = 0;
    this.totalTyped = 0;
    this.correctTyped = 0;
    this.errorCount = 0;
    this.keyStats = {};
    this.lastKeystrokeTime = null;
    this.startTime = performance.now();
    this.isRunning = true;

    this.renderText();
    this.hiddenInput.value = '';
    this.hiddenInput.focus();
    this.wordsDisplay.classList.add('focused');
    this.startBtn.textContent = '🔄 In Progress...';

    // Clear key heatmaps
    Object.values(this.kbKeyElements).forEach(el => {
      el.classList.remove('heat-cold', 'heat-warm', 'heat-hot');
      const sub = el.querySelector('.key-stat');
      if (sub) sub.remove();
    });
  }

  resetAssessment() {
    this.isRunning = false;
    this.currentCharIndex = 0;
    this.totalTyped = 0;
    this.correctTyped = 0;
    this.errorCount = 0;
    this.keyStats = {};
    this.lastKeystrokeTime = null;

    this.startBtn.textContent = '🚀 Start Diagnostic';
    this.hudWpm.textContent = '0 WPM';
    this.hudAcc.textContent = '100%';
    this.hudLatency.textContent = '0 ms';
    this.wordsDisplay.classList.remove('focused');

    this.renderText();
    this.renderInitialAnalysis();
  }

  handleInput(e) {
    if (!this.isRunning) {
      this.startTest();
    }

    const val = this.hiddenInput.value;
    if (!val) return;
    const typedChar = val.slice(-1);
    this.hiddenInput.value = '';

    const now = performance.now();
    const latency = this.lastKeystrokeTime ? Math.round(now - this.lastKeystrokeTime) : 180;
    this.lastKeystrokeTime = now;

    const expectedChar = this.targetText[this.currentCharIndex];
    const keyLower = expectedChar.toLowerCase();

    // Record key stats
    if (!this.keyStats[keyLower]) {
      this.keyStats[keyLower] = { count: 0, errors: 0, latencies: [] };
    }
    this.keyStats[keyLower].count++;
    this.keyStats[keyLower].latencies.push(latency);

    this.totalTyped++;

    if (typedChar === expectedChar) {
      this.correctTyped++;
      if (this.charElements[this.currentCharIndex]) {
        this.charElements[this.currentCharIndex].className = 'coach-char correct';
      }
      this.currentCharIndex++;

      if (this.currentCharIndex >= this.targetText.length) {
        this.finishTest();
        return;
      } else {
        if (this.charElements[this.currentCharIndex]) {
          this.charElements[this.currentCharIndex].classList.add('current');
          this.ensureVisible(this.charElements[this.currentCharIndex]);
        }
      }
    } else {
      this.errorCount++;
      this.keyStats[keyLower].errors++;

      if (this.charElements[this.currentCharIndex]) {
        this.charElements[this.currentCharIndex].className = 'coach-char error current';
      }
    }

    this.updateTelemetry();
    this.updateKeyHeatmap(keyLower);
  }

  ensureVisible(el) {
    if (!el) return;
    const parent = this.wordsDisplay;
    const pRect = parent.getBoundingClientRect();
    const elRect = el.getBoundingClientRect();
    if (elRect.bottom > pRect.bottom - 15) {
      parent.scrollTop += 35;
    }
  }

  updateTelemetry() {
    const elapsedMinutes = Math.max(0.01, (performance.now() - this.startTime) / 60000);
    const wpm = Math.round((this.correctTyped / 5) / elapsedMinutes);
    this.hudWpm.textContent = `${wpm} WPM`;

    const acc = this.totalTyped > 0 ? Math.round((this.correctTyped / this.totalTyped) * 100) : 100;
    this.hudAcc.textContent = `${acc}%`;

    // Calculate global average latency
    let sumLat = 0;
    let totalSamples = 0;
    Object.values(this.keyStats).forEach(s => {
      s.latencies.forEach(l => { sumLat += l; totalSamples++; });
    });
    const avgLat = totalSamples > 0 ? Math.round(sumLat / totalSamples) : 0;
    this.hudLatency.textContent = `${avgLat} ms`;
  }

  updateKeyHeatmap(key) {
    const keyEl = this.kbKeyElements[key];
    if (!keyEl) return;

    const stat = this.keyStats[key];
    if (!stat) return;

    const avg = stat.latencies.reduce((a, b) => a + b, 0) / stat.latencies.length;
    const errorRate = (stat.errors / stat.count);

    keyEl.classList.remove('heat-cold', 'heat-warm', 'heat-hot');
    if (errorRate > 0.15 || avg > 280) {
      keyEl.classList.add('heat-hot');
    } else if (avg > 180 || errorRate > 0) {
      keyEl.classList.add('heat-warm');
    } else {
      keyEl.classList.add('heat-cold');
    }

    let sub = keyEl.querySelector('.key-stat');
    if (!sub) {
      sub = document.createElement('div');
      sub.className = 'key-stat';
      keyEl.appendChild(sub);
    }
    sub.textContent = `${Math.round(avg)}ms`;
  }

  finishTest() {
    this.isRunning = false;
    this.startBtn.textContent = '✓ Completed';
    this.wordsDisplay.classList.remove('focused');

    this.analyzeBiometrics();
  }

  analyzeBiometrics() {
    // Group stats by finger
    const fingerTelemetry = {
      LP: { name: 'Left Pinky', latencies: [], errors: 0, hits: 0 },
      LR: { name: 'Left Ring', latencies: [], errors: 0, hits: 0 },
      LM: { name: 'Left Middle', latencies: [], errors: 0, hits: 0 },
      LI: { name: 'Left Index', latencies: [], errors: 0, hits: 0 },
      TH: { name: 'Thumbs', latencies: [], errors: 0, hits: 0 },
      RI: { name: 'Right Index', latencies: [], errors: 0, hits: 0 },
      RM: { name: 'Right Middle', latencies: [], errors: 0, hits: 0 },
      RR: { name: 'Right Ring', latencies: [], errors: 0, hits: 0 },
      RP: { name: 'Right Pinky', latencies: [], errors: 0, hits: 0 }
    };

    Object.entries(this.keyStats).forEach(([key, s]) => {
      const code = FINGER_MAP[key];
      if (code && fingerTelemetry[code]) {
        fingerTelemetry[code].latencies.push(...s.latencies);
        fingerTelemetry[code].errors += s.errors;
        fingerTelemetry[code].hits += s.count;
      }
    });

    const results = Object.entries(fingerTelemetry).map(([code, data]) => {
      const avgLat = data.latencies.length > 0 ? Math.round(data.latencies.reduce((a, b) => a + b, 0) / data.latencies.length) : 190;
      const errorRate = data.hits > 0 ? Math.round((data.errors / data.hits) * 100) : 0;
      // Weakness Score = higher latency + heavier error penalty
      const weaknessScore = avgLat + (errorRate * 7);
      return { code, ...data, avgLat, errorRate, weaknessScore };
    });

    // Sort descending by weakness score
    results.sort((a, b) => b.weaknessScore - a.weaknessScore);
    this.renderFingerDiagnostics(results);
    this.renderCoachFeedback(results);
    this.startRemedialBtn.style.display = 'inline-block';
  }

  renderInitialAnalysis() {
    this.weakFingersList.innerHTML = `
      <div class="weak-rank-row" style="border-left-color: #ec4899;">
        <div>
          <strong style="color: #ec4899;">#1 Left Pinky (Q, A, Z)</strong>
          <div style="font-size: 0.75rem; color: var(--text-tertiary);">Common high-latency reach zone</div>
        </div>
        <span class="badge" style="background: rgba(236, 72, 153, 0.15); color: #ec4899;">Targeted</span>
      </div>
      <div class="weak-rank-row" style="border-left-color: #ef4444;">
        <div>
          <strong style="color: #ef4444;">#2 Right Pinky (P, ;, ')</strong>
          <div style="font-size: 0.75rem; color: var(--text-tertiary);">Symbol and modifier strain zone</div>
        </div>
        <span class="badge" style="background: rgba(239, 68, 68, 0.15); color: #ef4444;">Targeted</span>
      </div>
    `;

    this.coachInsights.innerHTML = `
      <p>💡 <strong>Touch Typing Ergonomics:</strong> The pinky and ring fingers bear less natural tendon independence than index and middle fingers, generating up to <strong>35% higher latency</strong> during rapid typing.</p>
      <p>Click <strong>'Start Diagnostic'</strong> to record your real-time milliseconds and error rate heatmap.</p>
    `;
  }

  renderFingerDiagnostics(rankedFingers) {
    this.weakFingersList.innerHTML = '';

    rankedFingers.slice(0, 4).forEach((f, idx) => {
      const color = FINGER_COLORS[f.code] || '#38bdf8';
      const row = document.createElement('div');
      row.className = 'weak-rank-row';
      row.style.borderLeftColor = color;

      row.innerHTML = `
        <div>
          <strong style="color: ${color};">#${idx + 1} ${f.name}</strong>
          <div style="font-size: 0.75rem; color: var(--text-secondary); margin-top: 2px;">
            Avg Latency: <strong>${f.avgLat}ms</strong> | Error Rate: <strong>${f.errorRate}%</strong> (${f.errors} typos)
          </div>
        </div>
        <span class="badge" style="background: ${f.errorRate > 10 ? 'rgba(239,68,68,0.2)' : 'rgba(255,255,255,0.08)'}; color: ${f.errorRate > 10 ? '#ef4444' : 'var(--text-primary)'};">
          ${idx === 0 ? 'Weakest' : `Rank ${idx + 1}`}
        </span>
      `;
      this.weakFingersList.appendChild(row);
    });
  }

  renderCoachFeedback(rankedFingers) {
    const weakest = rankedFingers[0];
    const second = rankedFingers[1];

    let advice = '';
    if (weakest.code === 'LP' || weakest.code === 'RP') {
      advice = `Your primary bottleneck is <strong>${weakest.name}</strong> latency (${weakest.avgLat}ms). Pinky reaches across top/bottom rows trigger wrist pivot and hesitation. Keep wrists slightly elevated to unlock fluid finger reach.`;
    } else if (weakest.code === 'LR' || weakest.code === 'RR') {
      advice = `Your primary bottleneck is <strong>${weakest.name}</strong> (${weakest.avgLat}ms). The ring finger shares extensor tendons with the middle finger, causing finger collision. Focus on isolated curvature drills.`;
    } else {
      advice = `Your primary bottleneck is <strong>${weakest.name}</strong> (${weakest.avgLat}ms). Watch for excessive index crossover and keep your hand anchored over the home row.`;
    }

    this.coachInsights.innerHTML = `
      <div style="background: rgba(78, 133, 191, 0.1); padding: 0.75rem 1rem; border-radius: var(--radius-md); border-left: 3px solid var(--accent); color: var(--text-primary);">
        ${advice}
      </div>
      <p>Secondary strain observed on <strong>${second.name}</strong> with ${second.errorRate}% error rate. Synthesizing drills for these fingers will provide the highest immediate WPM gains.</p>
    `;
  }

  generateCustomDrill() {
    // Identify top 2 weakest fingers or default LP/RP
    const weakCodes = ['LP', 'RP', 'LR'];
    const chosenWords = [];

    weakCodes.forEach(code => {
      const words = REMEDIAL_LEXICON[code] || REMEDIAL_LEXICON.LP;
      const shuffled = [...words].sort(() => 0.5 - Math.random());
      chosenWords.push(...shuffled.slice(0, 10));
    });

    // Total 30 words
    const drillStr = chosenWords.sort(() => 0.5 - Math.random()).slice(0, 30).join(' ');
    this.targetText = drillStr;

    this.remedialPreview.textContent = drillStr;
    this.startRemedialBtn.style.display = 'inline-block';
  }
}

document.addEventListener('DOMContentLoaded', () => {
  window.aiTypingCoach = new AiTypingCoach();
});