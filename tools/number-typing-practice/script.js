/**
 * Number Typing Practice - Complete Client-Side Logic
 */

// Sound Synthesizer via Web Audio API
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
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(440, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(120, this.ctx.currentTime + 0.04);
      gain.gain.setValueAtTime(0.08, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.04);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();
      osc.stop(this.ctx.currentTime + 0.04);
    } catch {
      // Audio context might be restricted before user gesture
    }
  }

  playError() {
    if (!this.enabled || !this.ctx) return;
    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(160, this.ctx.currentTime);
      gain.gain.setValueAtTime(0.12, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.12);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();
      osc.stop(this.ctx.currentTime + 0.12);
    } catch {
      // Ignore audio error
    }
  }
}

// Drill Generator
const DrillGenerators = {
  sequential: () => {
    const sets = [
      '01234 56789 98765 43210 123 456 789 012',
      '11 22 33 44 55 66 77 88 99 00 12 34 56 78 90',
      '13579 24680 97531 86420 1029 3847 5612',
      '00 10 20 30 40 50 60 70 80 90 100 200 500',
      '1234 2345 3456 4567 5678 6789 7890 9876 8765 7654'
    ];
    return sets.sort(() => 0.5 - Math.random()).join(' ');
  },

  pins: () => {
    const pins = [];
    for (let i = 0; i < 30; i++) {
      const pin = Math.floor(1000 + Math.random() * 9000).toString();
      pins.push(pin);
    }
    return pins.join(' ');
  },

  phone: () => {
    const phones = [];
    const areaCodes = ['800', '888', '212', '415', '312', '206', '510', '917', '650', '305'];
    for (let i = 0; i < 20; i++) {
      const area = areaCodes[Math.floor(Math.random() * areaCodes.length)];
      const mid = Math.floor(200 + Math.random() * 799);
      const last = Math.floor(1000 + Math.random() * 8999);
      if (i % 3 === 0) {
        phones.push(`(${area}) ${mid}-${last}`);
      } else if (i % 3 === 1) {
        phones.push(`+1-${area}-${mid}-${last}`);
      } else {
        phones.push(`${area}-${mid}-${last}`);
      }
    }
    return phones.join(' ');
  },

  currency: () => {
    const amounts = [];
    for (let i = 0; i < 25; i++) {
      const dollars = Math.floor(1 + Math.random() * 4999);
      const cents = Math.floor(Math.random() * 99).toString().padStart(2, '0');
      const formatted = dollars >= 1000 ? `$${dollars.toLocaleString('en-US')}.${cents}` : `$${dollars}.${cents}`;
      amounts.push(formatted);
    }
    return amounts.join(' ');
  },

  alphanumeric: () => {
    const tokens = [];
    const prefixes = ['ID', 'SKU', 'Order', 'Code', 'Key', 'Ref', 'User', 'Room', 'PIN', 'Gate'];
    for (let i = 0; i < 25; i++) {
      const p = prefixes[Math.floor(Math.random() * prefixes.length)];
      const n = Math.floor(100 + Math.random() * 8999);
      const suffix = String.fromCharCode(65 + Math.floor(Math.random() * 26));
      if (i % 3 === 0) {
        tokens.push(`${p}#${n}`);
      } else if (i % 3 === 1) {
        tokens.push(`${p}-${n}${suffix}`);
      } else {
        tokens.push(`${p}${n}`);
      }
    }
    return tokens.join(' ');
  }
};

class NumberTypingApp {
  constructor() {
    this.sound = new AudioFX();
    this.mode = 'sequential';
    this.lengthSetting = '30'; // '30', '60', '120', 'items25'
    this.viewMode = 'both'; // 'both', 'numpad', 'toprow'

    this.promptText = '';
    this.currentIndex = 0;
    this.userKeystrokes = 0;
    this.correctKeystrokes = 0;
    this.mistakesCount = 0;
    this.problemKeysMap = {};

    this.timer = null;
    this.startTime = null;
    this.elapsedSeconds = 0;
    this.timeLimitSeconds = 30;
    this.isItemTarget = false;
    this.targetItemCount = 25;
    this.isActive = false;
    this.isCompleted = false;

    this.dom = {};
  }

  init() {
    this.cacheDOMElements();
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

    this.dom.toprowView = document.getElementById('toprowView');
    this.dom.numpadView = document.getElementById('numpadView');
    this.dom.soundToggleBtn = document.getElementById('soundToggleBtn');
    this.dom.restartBtn = document.getElementById('restartBtn');

    // Modal
    this.dom.resultsModal = document.getElementById('resultsModal');
    this.dom.resultsBadge = document.getElementById('resultsBadge');
    this.dom.finalWpm = document.getElementById('finalWpm');
    this.dom.finalCpm = document.getElementById('finalCpm');
    this.dom.finalAccuracy = document.getElementById('finalAccuracy');
    this.dom.finalTotalKeys = document.getElementById('finalTotalKeys');
    this.dom.finalMistakes = document.getElementById('finalMistakes');
    this.dom.finalTime = document.getElementById('finalTime');
    this.dom.mistakesList = document.getElementById('mistakesList');
    this.dom.modalRetryBtn = document.getElementById('modalRetryBtn');
    this.dom.modalNextBtn = document.getElementById('modalNextBtn');
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

    // Key input listener
    window.addEventListener('keydown', (e) => {
      if (this.isCompleted) return;
      if (this.dom.resultsModal.classList.contains('is-active')) return;

      // Allow refreshing or devtools
      if (e.key === 'F5' || e.key === 'F12' || (e.ctrlKey && e.key.toLowerCase() === 'r')) return;

      // Ensure sound is initialized on first user gesture
      this.sound.init();

      if (e.key === 'Tab') {
        e.preventDefault();
        return;
      }

      if (e.key === 'Escape') {
        this.resetDrill();
        return;
      }

      // If user presses key while not focused, focus hidden input
      if (document.activeElement !== this.dom.hiddenInput) {
        this.dom.hiddenInput.focus();
      }

      this.handleKeystroke(e);
    });

    // Mode Buttons
    document.querySelectorAll('[data-mode]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        document.querySelectorAll('[data-mode]').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        this.mode = btn.dataset.mode;
        this.resetDrill();
      });
    });

    // Length Buttons
    document.querySelectorAll('[data-length]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        document.querySelectorAll('[data-length]').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        this.lengthSetting = btn.dataset.length;
        this.resetDrill();
      });
    });

    // Keyboard View Buttons
    document.querySelectorAll('[data-view]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        document.querySelectorAll('[data-view]').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        this.updateViewMode(btn.dataset.view);
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
      const modes = ['sequential', 'pins', 'phone', 'currency', 'alphanumeric'];
      const nextIdx = (modes.indexOf(this.mode) + 1) % modes.length;
      this.mode = modes[nextIdx];
      document.querySelectorAll('[data-mode]').forEach(b => {
        b.classList.toggle('active', b.dataset.mode === this.mode);
      });
      this.resetDrill();
    });
  }

  updateViewMode(view) {
    this.viewMode = view;
    if (view === 'both') {
      this.dom.toprowView.style.display = 'flex';
      this.dom.numpadView.style.display = 'flex';
    } else if (view === 'numpad') {
      this.dom.toprowView.style.display = 'none';
      this.dom.numpadView.style.display = 'flex';
    } else if (view === 'toprow') {
      this.dom.toprowView.style.display = 'flex';
      this.dom.numpadView.style.display = 'none';
    }
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
    this.problemKeysMap = {};
    this.isActive = false;
    this.isCompleted = false;

    // Determine timing mode
    if (this.lengthSetting.startsWith('items')) {
      this.isItemTarget = true;
      this.targetItemCount = parseInt(this.lengthSetting.replace('items', ''), 10) || 25;
      this.dom.timerLabel.textContent = 'Items Left';
      this.dom.statTimer.textContent = `${this.targetItemCount}`;
      this.dom.statProgressSub.textContent = 'Elapsed: 0s';
    } else {
      this.isItemTarget = false;
      this.timeLimitSeconds = parseInt(this.lengthSetting, 10) || 30;
      this.dom.timerLabel.textContent = 'Time Left';
      this.dom.statTimer.textContent = `${this.timeLimitSeconds}s`;
      this.dom.statProgressSub.textContent = 'Elapsed: 0s';
    }

    // Generate prompt text
    const gen = DrillGenerators[this.mode] || DrillGenerators.sequential;
    this.promptText = gen();

    if (this.isItemTarget) {
      // Trim to target count of words/tokens
      const tokens = this.promptText.split(' ').slice(0, this.targetItemCount);
      this.promptText = tokens.join(' ');
    }

    this.renderPrompt();
    this.updateStats();
    this.updateTargetKeyHighlight();

    // Re-focus input
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

      if (this.isItemTarget) {
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
        this.flashVirtualKey('Backspace', false);
        const prevSpan = this.dom.promptDisplay.children[this.currentIndex];
        if (prevSpan) prevSpan.classList.remove('current');

        this.currentIndex--;
        const currSpan = this.dom.promptDisplay.children[this.currentIndex];
        if (currSpan) {
          currSpan.classList.remove('correct', 'incorrect');
          currSpan.classList.add('current');
        }
        this.updateTargetKeyHighlight();
      }
      return;
    }

    // Ignore non-character keys (e.g. Shift, Control, Alt, CapsLock)
    if (e.key.length > 1) return;

    e.preventDefault();

    if (!this.isActive) {
      this.startTimer();
    }

    this.userKeystrokes++;
    const typedChar = e.key;
    const isCorrect = typedChar === expectedChar;

    const span = this.dom.promptDisplay.children[this.currentIndex];
    span.classList.remove('current');

    if (isCorrect) {
      span.classList.add('correct');
      this.correctKeystrokes++;
      this.sound.playClick();
      this.flashVirtualKey(typedChar, true);
    } else {
      span.classList.add('incorrect');
      this.mistakesCount++;
      this.problemKeysMap[expectedChar] = (this.problemKeysMap[expectedChar] || 0) + 1;
      this.sound.playError();
      this.flashVirtualKey(typedChar, false);
    }

    this.currentIndex++;

    // Scroll display if needed
    if (span.offsetTop > this.dom.typingStage.clientHeight / 2) {
      span.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }

    if (this.currentIndex < this.promptText.length) {
      const nextSpan = this.dom.promptDisplay.children[this.currentIndex];
      nextSpan.classList.add('current');
      this.updateTargetKeyHighlight();
    } else {
      this.finishDrill();
      return;
    }

    // Update item target count if applicable
    if (this.isItemTarget) {
      const typedText = this.promptText.slice(0, this.currentIndex);
      const completedItems = typedText.split(' ').length - 1;
      const itemsLeft = Math.max(0, this.targetItemCount - completedItems);
      this.dom.statTimer.textContent = `${itemsLeft}`;
    }

    this.updateStats();
  }

  updateStats() {
    const elapsedMinutes = Math.max(1 / 60, (this.elapsedSeconds || 1) / 60);
    const grossWpm = Math.round((this.userKeystrokes / 5) / elapsedMinutes);
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

  updateTargetKeyHighlight() {
    // Remove previous target-key classes
    document.querySelectorAll('.vkey.target-key').forEach(k => k.classList.remove('target-key'));

    if (this.currentIndex >= this.promptText.length) return;
    const targetChar = this.promptText[this.currentIndex];

    // Find corresponding virtual key
    document.querySelectorAll('.vkey').forEach(el => {
      const keyVal = el.getAttribute('data-key');
      const shiftVal = el.getAttribute('data-shift');
      if (keyVal === targetChar || shiftVal === targetChar) {
        el.classList.add('target-key');
      }
    });
  }

  flashVirtualKey(char, isCorrect) {
    const keyElements = [];
    document.querySelectorAll('.vkey').forEach(el => {
      const keyVal = el.getAttribute('data-key');
      const shiftVal = el.getAttribute('data-shift');
      if (keyVal === char || shiftVal === char || (char === ' ' && keyVal === 'Space')) {
        keyElements.push(el);
      }
    });

    const cls = isCorrect ? 'pressed-correct' : 'pressed-incorrect';
    keyElements.forEach(el => {
      el.classList.add(cls);
      setTimeout(() => {
        el.classList.remove(cls);
      }, 140);
    });
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

    // Badging
    let badge = '★ Numeric Novice';
    if (netWpm >= 70 && accuracy >= 95) {
      badge = '💎 Data Entry Maestro';
    } else if (netWpm >= 50 && accuracy >= 92) {
      badge = '⚡ Numeric Speedster';
    } else if (netWpm >= 35 && accuracy >= 88) {
      badge = '🎯 Financial Specialist';
    } else if (accuracy >= 98) {
      badge = '🔍 Precision Master';
    }

    this.dom.resultsBadge.textContent = badge;
    this.dom.finalWpm.textContent = `${netWpm}`;
    this.dom.finalCpm.textContent = `${netCpm}`;
    this.dom.finalAccuracy.textContent = `${accuracy}%`;
    this.dom.finalTotalKeys.textContent = `${this.userKeystrokes}`;
    this.dom.finalMistakes.textContent = `${this.mistakesCount}`;
    this.dom.finalTime.textContent = `${durationSec}s`;

    // Problematic keys
    const problemKeys = Object.entries(this.problemKeysMap)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);

    if (problemKeys.length === 0) {
      this.dom.mistakesList.innerHTML = '<span style="color: var(--success); font-weight: 600;">Flawless! Zero typing mistakes.</span>';
    } else {
      this.dom.mistakesList.innerHTML = problemKeys
        .map(([k, cnt]) => `<span class="mistake-tag">Key '${k === ' ' ? 'Space' : k}': ${cnt} miss${cnt > 1 ? 'es' : ''}</span>`)
        .join(' ');
    }

    this.dom.resultsModal.classList.add('is-active');
  }
}

// Instantiate on DOMContentLoaded
document.addEventListener('DOMContentLoaded', () => {
  const app = new NumberTypingApp();
  app.init();
});