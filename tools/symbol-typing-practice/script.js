/**
 * Symbol Typing Practice - Complete Client-Side Logic
 */

class AudioFX {
  constructor() {
    this.ctx = null;
    this.enabled = true;
  }

  init() {
    if (!this.ctx) {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      if (AudioContextClass) {
        this.ctx = new AudioContextClass();
      }
    }
  }

  playClick() {
    if (!this.enabled || !this.ctx) return;
    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(520, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(160, this.ctx.currentTime + 0.035);
      gain.gain.setValueAtTime(0.08, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.035);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();
      osc.stop(this.ctx.currentTime + 0.035);
    } catch {
      // Audio context may be waiting for gesture
    }
  }

  playError() {
    if (!this.enabled || !this.ctx) return;
    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(180, this.ctx.currentTime);
      gain.gain.setValueAtTime(0.12, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.12);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();
      osc.stop(this.ctx.currentTime + 0.12);
    } catch {
      // Ignore
    }
  }
}

// Shift Key & Shortcut Mapping
const KEY_COMBOS = {
  '{': 'Shift + [',
  '}': 'Shift + ]',
  '(': 'Shift + 9',
  ')': 'Shift + 0',
  '[': '[ Key',
  ']': '] Key',
  '<': 'Shift + ,',
  '>': 'Shift + .',
  ';': '; Key',
  ':': 'Shift + ;',
  '=': '= Key',
  '+': 'Shift + =',
  '-': '- Key',
  '_': 'Shift + -',
  '*': 'Shift + 8',
  '/': '/ Key',
  '\\': '\\ Key',
  '|': 'Shift + \\',
  '%': 'Shift + 5',
  '^': 'Shift + 6',
  '&': 'Shift + 7',
  '!': 'Shift + 1',
  '~': 'Shift + `',
  '`': '` Key',
  '?': 'Shift + /',
  '"': 'Shift + \'',
  '\'': '\' Key',
  '$': 'Shift + 4',
  '#': 'Shift + 3',
  '@': 'Shift + 2'
};

const SHIFT_GUIDE_ITEMS = [
  { sym: '{', combo: 'Shift + [' },
  { sym: '}', combo: 'Shift + ]' },
  { sym: '(', combo: 'Shift + 9' },
  { sym: ')', combo: 'Shift + 0' },
  { sym: '[', combo: '[ key' },
  { sym: ']', combo: '] key' },
  { sym: '<', combo: 'Shift + ,' },
  { sym: '>', combo: 'Shift + .' },
  { sym: ';', combo: '; key' },
  { sym: ':', combo: 'Shift + ;' },
  { sym: '=', combo: '= key' },
  { sym: '+', combo: 'Shift + =' },
  { sym: '!', combo: 'Shift + 1' },
  { sym: '?', combo: 'Shift + /' },
  { sym: '&', combo: 'Shift + 7' },
  { sym: '|', combo: 'Shift + \\' },
  { sym: '"', combo: 'Shift + \'' },
  { sym: '`', combo: '` key' },
  { sym: '~', combo: 'Shift + `' },
  { sym: '$', combo: 'Shift + 4' },
  { sym: '#', combo: 'Shift + 3' }
];

const ExerciseGenerators = {
  'common-symbols': () => {
    const patterns = [
      '{ ( [ < > ] ) } { a: 1, b: 2 }; (x + y) * (z - w) / 2;',
      '[ { id: 101, valid: true } ]; if (val >= 0 && val <= 100) { fn(); }',
      'const fn = (a, b) => { return [a * 2, b + 3]; };',
      'arr.map((item, idx) => ({ ...item, index: idx }));',
      'for (let i = 0; i < len; i++) { sum += arr[i] * factor; }'
    ];
    return patterns.sort(() => 0.5 - Math.random()).join(' ');
  },

  'markdown': () => {
    const samples = [
      '# Heading 1 ## Heading 2 ### Subsection',
      '**Bold text** and *italic style* with `inline_code()` syntax.',
      '> Blockquote note: [Documentation Link](https://api.dev)',
      '- [x] Task completed - [ ] Pending review * Bullet item',
      '| Header | Value | ~Strikethrough~ and _emphasis_ symbols |'
    ];
    return samples.sort(() => 0.5 - Math.random()).join(' ');
  },

  'json': () => {
    const samples = [
      '{"status": 200, "success": true, "data": {"id": 4092, "code": "AUTH_OK"}}',
      '{"users": [{"name": "dev", "roles": ["admin", "editor"]}, {"name": "guest"}]}',
      '{"config": {"port": 8080, "host": "127.0.0.1", "ssl": false, "retries": 3}}',
      '{"items": [10, 20, 30], "meta": {"total": 3, "timestamp": 1720000000}}'
    ];
    return samples.sort(() => 0.5 - Math.random()).join(' ');
  },

  'operators': () => {
    const samples = [
      'a === b && c !== d || (x >= 10 && y <= 20);',
      'count += 1; total -= discount; score *= multiplier; ratio /= 100;',
      'const result = (isValid && count > 0) ? compute(x) : defaultValue;',
      'fn?.() ?? fallbackValue; if (!(flag1 || flag2)) { run(); }',
      'a & b | c ^ d ~ e << 2 >> 1; typeof value !== "undefined";'
    ];
    return samples.sort(() => 0.5 - Math.random()).join(' ');
  },

  'web-code': () => {
    const samples = [
      '<div class="card" id="main"><span data-id="101">Content</span></div>',
      '<input type="text" name="email" required placeholder="name@example.com" />',
      '.container > .header:first-child { display: flex; align-items: center; }',
      '@media (min-width: 768px) { .grid { grid-template-columns: 1fr 1fr; } }',
      '<button onclick="handleClick(event)" disabled="false">&rarr; Submit</button>'
    ];
    return samples.sort(() => 0.5 - Math.random()).join(' ');
  }
};

class SymbolTypingApp {
  constructor() {
    this.sound = new AudioFX();
    this.mode = 'common-symbols';
    this.lengthSetting = '30';

    this.promptText = '';
    this.currentIndex = 0;
    this.userKeystrokes = 0;
    this.correctKeystrokes = 0;
    this.mistakesCount = 0;

    // Diagnostics stats: symbol -> { attempted: number, errors: number }
    this.symbolStats = {};

    this.timer = null;
    this.startTime = null;
    this.elapsedSeconds = 0;
    this.timeLimitSeconds = 30;
    this.isCountTarget = false;
    this.targetCount = 40;
    this.isActive = false;
    this.isCompleted = false;

    this.dom = {};
  }

  init() {
    this.cacheDOMElements();
    this.renderShiftGuide();
    this.bindEvents();
    this.resetDrill();
  }

  cacheDOMElements() {
    this.dom.typingStage = document.getElementById('typingStage');
    this.dom.promptDisplay = document.getElementById('promptDisplay');
    this.dom.hiddenInput = document.getElementById('hiddenInput');
    this.dom.focusNotice = document.getElementById('focusNotice');
    this.dom.focusNoticeText = document.getElementById('focusNoticeText');

    this.dom.statWpm = document.getElementById('statWpm');
    this.dom.statCpm = document.getElementById('statCpm');
    this.dom.statAccuracy = document.getElementById('statAccuracy');
    this.dom.statErrors = document.getElementById('statErrors');
    this.dom.statTimer = document.getElementById('statTimer');
    this.dom.timerLabel = document.getElementById('timerLabel');
    this.dom.statProgressSub = document.getElementById('statProgressSub');

    this.dom.hintSymbolChar = document.getElementById('hintSymbolChar');
    this.dom.hintKeyCombo = document.getElementById('hintKeyCombo');
    this.dom.targetContextHint = document.getElementById('targetContextHint');

    this.dom.weakSpotsContainer = document.getElementById('weakSpotsContainer');
    this.dom.shiftGuideGrid = document.getElementById('shiftGuideGrid');
    this.dom.soundToggleBtn = document.getElementById('soundToggleBtn');
    this.dom.restartBtn = document.getElementById('restartBtn');

    // Modal
    this.dom.resultsModal = document.getElementById('resultsModal');
    this.dom.resultsBadge = document.getElementById('resultsBadge');
    this.dom.finalWpm = document.getElementById('finalWpm');
    this.dom.finalCpm = document.getElementById('finalCpm');
    this.dom.finalAccuracy = document.getElementById('finalAccuracy');
    this.dom.modalDiagnostics = document.getElementById('modalDiagnostics');
    this.dom.modalRetryBtn = document.getElementById('modalRetryBtn');
    this.dom.modalNextBtn = document.getElementById('modalNextBtn');
  }

  renderShiftGuide() {
    this.dom.shiftGuideGrid.innerHTML = '';
    const fragment = document.createDocumentFragment();

    SHIFT_GUIDE_ITEMS.forEach(item => {
      const div = document.createElement('div');
      div.className = 'shift-guide-item';
      div.setAttribute('data-guide-sym', item.sym);
      div.innerHTML = `
        <div class="guide-sym">${item.sym === '<' ? '&lt;' : (item.sym === '>' ? '&gt;' : item.sym)}</div>
        <div class="guide-combo">${item.combo}</div>
      `;
      fragment.appendChild(div);
    });

    this.dom.shiftGuideGrid.appendChild(fragment);
  }

  bindEvents() {
    // Stage Focus Handling
    this.dom.typingStage.addEventListener('click', () => {
      this.sound.init();
      this.dom.hiddenInput.focus();
    });

    this.dom.hiddenInput.addEventListener('focus', () => {
      this.dom.typingStage.classList.add('is-focused');
      this.dom.focusNotice.classList.remove('blurred');
      this.dom.focusNoticeText.textContent = 'Typing active';
    });

    this.dom.hiddenInput.addEventListener('blur', () => {
      this.dom.typingStage.classList.remove('is-focused');
      this.dom.focusNotice.classList.add('blurred');
      this.dom.focusNoticeText.textContent = 'Click to focus & resume';
    });

    // Window Keydown
    window.addEventListener('keydown', (e) => {
      if (this.isCompleted) return;
      if (this.dom.resultsModal.classList.contains('is-active')) return;

      if (e.key === 'F5' || e.key === 'F12' || (e.ctrlKey && e.key.toLowerCase() === 'r')) return;

      this.sound.init();

      if (e.key === 'Tab') {
        e.preventDefault();
        return;
      }

      if (e.key === 'Escape') {
        this.resetDrill();
        return;
      }

      if (document.activeElement !== this.dom.hiddenInput) {
        this.dom.hiddenInput.focus();
      }

      this.handleKeystroke(e);
    });

    // Mode Buttons
    document.querySelectorAll('[data-mode]').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('[data-mode]').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        this.mode = btn.dataset.mode;
        this.resetDrill();
      });
    });

    // Length Buttons
    document.querySelectorAll('[data-length]').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('[data-length]').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        this.lengthSetting = btn.dataset.length;
        this.resetDrill();
      });
    });

    // Sound Toggle
    this.dom.soundToggleBtn.addEventListener('click', () => {
      this.sound.enabled = !this.sound.enabled;
      this.dom.soundToggleBtn.textContent = this.sound.enabled ? '🔊 Sound: ON' : '🔇 Sound: OFF';
    });

    // Restart Button
    this.dom.restartBtn.addEventListener('click', () => {
      this.resetDrill();
    });

    // Modal Buttons
    this.dom.modalRetryBtn.addEventListener('click', () => {
      this.dom.resultsModal.classList.remove('is-active');
      this.resetDrill();
    });

    this.dom.modalNextBtn.addEventListener('click', () => {
      this.dom.resultsModal.classList.remove('is-active');
      const modes = ['common-symbols', 'markdown', 'json', 'operators', 'web-code'];
      const nextIdx = (modes.indexOf(this.mode) + 1) % modes.length;
      this.mode = modes[nextIdx];
      document.querySelectorAll('[data-mode]').forEach(b => {
        b.classList.toggle('active', b.dataset.mode === this.mode);
      });
      this.resetDrill();
    });
  }

  resetDrill() {
    clearInterval(this.timer);
    this.timer = null;
    this.startTime = null;
    this.elapsedSeconds = 0;
    this.currentIndex = 0;
    this.userKeystrokes = 0;
    this.correctKeystrokes = 0;
    this.mistakesCount = 0;
    this.symbolStats = {};
    this.isActive = false;
    this.isCompleted = false;

    if (this.lengthSetting.startsWith('count')) {
      this.isCountTarget = true;
      this.targetCount = parseInt(this.lengthSetting.replace('count', ''), 10) || 40;
      this.dom.timerLabel.textContent = 'Symbols Left';
      this.dom.statTimer.textContent = `${this.targetCount}`;
      this.dom.statProgressSub.textContent = 'Elapsed: 0s';
    } else {
      this.isCountTarget = false;
      this.timeLimitSeconds = parseInt(this.lengthSetting, 10) || 30;
      this.dom.timerLabel.textContent = 'Time Left';
      this.dom.statTimer.textContent = `${this.timeLimitSeconds}s`;
      this.dom.statProgressSub.textContent = 'Elapsed: 0s';
    }

    const gen = ExerciseGenerators[this.mode] || ExerciseGenerators['common-symbols'];
    this.promptText = gen();

    if (this.isCountTarget && this.promptText.length > this.targetCount) {
      this.promptText = this.promptText.slice(0, this.targetCount);
    }

    this.renderPrompt();
    this.updateStats();
    this.updateHintBar();
    this.updateWeakSpotsView();

    this.dom.hiddenInput.value = '';
    setTimeout(() => {
      this.dom.hiddenInput.focus();
    }, 50);
  }

  renderPrompt() {
    this.dom.promptDisplay.innerHTML = '';
    const fragment = document.createDocumentFragment();

    for (let i = 0; i < this.promptText.length; i++) {
      const char = this.promptText[i];
      const span = document.createElement('span');
      span.className = 'prompt-char';
      if (i === 0) span.classList.add('current');

      if (char === ' ') {
        span.classList.add('is-space');
        span.innerHTML = '&nbsp;';
      } else {
        span.textContent = char;
      }
      fragment.appendChild(span);
    }

    this.dom.promptDisplay.appendChild(fragment);
  }

  startTimer() {
    if (this.isActive) return;
    this.isActive = true;
    this.startTime = Date.now();

    this.timer = setInterval(() => {
      this.elapsedSeconds = Math.floor((Date.now() - this.startTime) / 1000);

      if (this.isCountTarget) {
        this.dom.statProgressSub.textContent = `Elapsed: ${this.elapsedSeconds}s`;
      } else {
        const timeLeft = Math.max(0, this.timeLimitSeconds - this.elapsedSeconds);
        this.dom.statTimer.textContent = `${timeLeft}s`;
        this.dom.statProgressSub.textContent = `Elapsed: ${this.elapsedSeconds}s`;

        if (timeLeft <= 0) {
          this.finishDrill();
          return;
        }
      }

      this.updateStats();
    }, 250);
  }

  handleKeystroke(e) {
    if (this.currentIndex >= this.promptText.length) {
      this.finishDrill();
      return;
    }

    const expectedChar = this.promptText[this.currentIndex];

    // Handle Backspace
    if (e.key === 'Backspace') {
      e.preventDefault();
      if (this.currentIndex > 0) {
        const prevSpan = this.dom.promptDisplay.children[this.currentIndex];
        if (prevSpan) prevSpan.classList.remove('current');

        this.currentIndex--;
        const currSpan = this.dom.promptDisplay.children[this.currentIndex];
        if (currSpan) {
          currSpan.classList.remove('correct', 'incorrect');
          currSpan.classList.add('current');
        }
        this.updateHintBar();
      }
      return;
    }

    if (e.key.length > 1) return;

    e.preventDefault();

    if (!this.isActive) {
      this.startTimer();
    }

    this.userKeystrokes++;
    const typedChar = e.key;
    const isCorrect = typedChar === expectedChar;

    if (!this.symbolStats[expectedChar]) {
      this.symbolStats[expectedChar] = { attempted: 0, errors: 0 };
    }
    this.symbolStats[expectedChar].attempted++;

    const span = this.dom.promptDisplay.children[this.currentIndex];
    span.classList.remove('current');

    if (isCorrect) {
      span.classList.add('correct');
      this.correctKeystrokes++;
      this.sound.playClick();
    } else {
      span.classList.add('incorrect');
      this.mistakesCount++;
      this.symbolStats[expectedChar].errors++;
      this.sound.playError();
    }

    this.currentIndex++;

    if (span.offsetTop > this.dom.typingStage.clientHeight / 2) {
      span.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }

    if (this.currentIndex < this.promptText.length) {
      const nextSpan = this.dom.promptDisplay.children[this.currentIndex];
      nextSpan.classList.add('current');
      this.updateHintBar();
    } else {
      this.finishDrill();
      return;
    }

    if (this.isCountTarget) {
      const charsLeft = Math.max(0, this.targetCount - this.currentIndex);
      this.dom.statTimer.textContent = `${charsLeft}`;
    }

    this.updateStats();
    this.updateWeakSpotsView();
  }

  updateHintBar() {
    if (this.currentIndex >= this.promptText.length) return;
    const targetChar = this.promptText[this.currentIndex];

    this.dom.hintSymbolChar.textContent = targetChar === ' ' ? 'Space' : targetChar;
    const combo = KEY_COMBOS[targetChar] || (targetChar === ' ' ? 'Spacebar' : `Key '${targetChar}'`);
    this.dom.hintKeyCombo.textContent = combo;

    // Highlight in guide grid
    document.querySelectorAll('.shift-guide-item').forEach(el => {
      const sym = el.getAttribute('data-guide-sym');
      el.classList.toggle('highlight', sym === targetChar);
    });

    // Provide friendly context hint
    if (combo.includes('Shift')) {
      this.dom.targetContextHint.textContent = 'Hold Shift with opposite pinky for maximum speed';
    } else {
      this.dom.targetContextHint.textContent = 'Keep hands relaxed on home row';
    }
  }

  updateStats() {
    const elapsedMinutes = Math.max(1 / 60, (this.elapsedSeconds || 1) / 60);
    const netWpm = Math.max(0, Math.round(((this.correctKeystrokes / 5) - (this.mistakesCount / 5)) / elapsedMinutes));
    const cpm = Math.round(this.correctKeystrokes / elapsedMinutes);
    const accuracy = this.userKeystrokes > 0
      ? Math.round((this.correctKeystrokes / this.userKeystrokes) * 100)
      : 100;

    this.dom.statWpm.textContent = isNaN(netWpm) ? '0' : `${netWpm}`;
    this.dom.statCpm.textContent = isNaN(cpm) ? '0' : `${cpm}`;
    this.dom.statAccuracy.textContent = `${accuracy}%`;
    this.dom.statErrors.textContent = `${this.mistakesCount}`;
  }

  updateWeakSpotsView() {
    const errorEntries = Object.entries(this.symbolStats)
      .filter(([_, stats]) => stats.errors > 0)
      .sort((a, b) => b[1].errors - a[1].errors)
      .slice(0, 5);

    if (errorEntries.length === 0) {
      if (this.userKeystrokes > 0) {
        this.dom.weakSpotsContainer.innerHTML = `
          <div style="color: var(--success); font-weight: 600; font-size: 0.875rem; padding: 0.75rem 0;">
            ✓ 100% Symbol Accuracy so far! No weak keys detected.
          </div>
        `;
      } else {
        this.dom.weakSpotsContainer.innerHTML = `
          <div style="color: var(--text-tertiary); font-size: 0.85rem; font-style: italic; padding: 1rem 0;">
            No symbol errors recorded yet. Start typing to analyze your accuracy!
          </div>
        `;
      }
      return;
    }

    const maxErrors = Math.max(...errorEntries.map(([_, s]) => s.errors));
    this.dom.weakSpotsContainer.innerHTML = errorEntries.map(([sym, stats]) => {
      const displaySym = sym === ' ' ? 'Space' : (sym === '<' ? '&lt;' : (sym === '>' ? '&gt;' : sym));
      const percentage = Math.round((stats.errors / stats.attempted) * 100);
      const barWidth = Math.round((stats.errors / maxErrors) * 100);
      const combo = KEY_COMBOS[sym] || `Key ${sym}`;

      return `
        <div class="weak-spot-item">
          <span class="weak-symbol-badge">${displaySym}</span>
          <div style="font-size: 0.75rem; color: var(--text-tertiary); min-width: 75px;">${combo}</div>
          <div class="weak-spot-bar-wrap">
            <div class="weak-spot-bar-fill" style="width: ${barWidth}%;"></div>
          </div>
          <div class="weak-spot-stats">${stats.errors} error${stats.errors > 1 ? 's' : ''} (${percentage}%)</div>
        </div>
      `;
    }).join('');
  }

  finishDrill() {
    if (this.isCompleted) return;
    this.isCompleted = true;
    clearInterval(this.timer);

    const durationSec = Math.max(1, this.elapsedSeconds);
    const elapsedMinutes = durationSec / 60;
    const netWpm = Math.max(0, Math.round(((this.correctKeystrokes / 5) - (this.mistakesCount / 5)) / elapsedMinutes));
    const netCpm = Math.round(this.correctKeystrokes / elapsedMinutes);
    const accuracy = this.userKeystrokes > 0
      ? Math.round((this.correctKeystrokes / this.userKeystrokes) * 100)
      : 100;

    let badge = '★ Syntax Apprentice';
    if (netWpm >= 55 && accuracy >= 95) {
      badge = '💎 Elite Code Ninja';
    } else if (netWpm >= 40 && accuracy >= 92) {
      badge = '⚡ Syntax Architect';
    } else if (netWpm >= 25 && accuracy >= 88) {
      badge = '🎯 Clean Coder';
    }

    this.dom.resultsBadge.textContent = badge;
    this.dom.finalWpm.textContent = `${netWpm}`;
    this.dom.finalCpm.textContent = `${netCpm}`;
    this.dom.finalAccuracy.textContent = `${accuracy}%`;

    // Diagnostic recommendations
    const errorEntries = Object.entries(this.symbolStats)
      .filter(([_, stats]) => stats.errors > 0)
      .sort((a, b) => b[1].errors - a[1].errors);

    if (errorEntries.length === 0) {
      this.dom.modalDiagnostics.innerHTML = `
        <span style="color: var(--success); font-weight: 700;">Flawless execution!</span>
        You executed every coding symbol without a single mispress. Your shift synchronization and pinky finger reach are exceptional.
      `;
    } else {
      const topWeak = errorEntries.slice(0, 3).map(([s, stats]) => `'${s}' (${KEY_COMBOS[s] || s})`).join(', ');
      this.dom.modalDiagnostics.innerHTML = `
        Identified weak spots: <strong>${topWeak}</strong>.<br/>
        <strong>Tip:</strong> Practice holding the opposite Shift key slightly earlier before striking the symbol key to prevent un-shifted character slips.
      `;
    }

    this.dom.resultsModal.classList.add('is-active');
  }
}

document.addEventListener('DOMContentLoaded', () => {
  const app = new SymbolTypingApp();
  app.init();
});