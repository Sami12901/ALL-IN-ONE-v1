/**
 * Custom Text Typing Practice - Complete Client-Side Logic
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
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(480, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(140, this.ctx.currentTime + 0.035);
      gain.gain.setValueAtTime(0.08, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.035);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();
      osc.stop(this.ctx.currentTime + 0.035);
    } catch {
      // Ignore audio error
    }
  }

  playError() {
    if (!this.enabled || !this.ctx) return;
    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(150, this.ctx.currentTime);
      gain.gain.setValueAtTime(0.12, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.1);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();
      osc.stop(this.ctx.currentTime + 0.1);
    } catch {
      // Ignore audio error
    }
  }
}

const PRESETS = {
  javascript: `function calculateMetrics(keystrokes, durationSeconds) {
  const minutes = Math.max(0.1, durationSeconds / 60);
  const words = keystrokes.length / 5;
  const grossWpm = Math.round(words / minutes);
  return { grossWpm, wordsProcessed: words };
}`,

  python: `def fibonacci_sequence(count: int) -> list[int]:
    sequence = [0, 1]
    while len(sequence) < count:
        sequence.append(sequence[-1] + sequence[-2])
    return sequence[:count]`,

  tech: `Distributed web architecture relies on event-driven pipelines, stateless microservices, and edge cache layers. By decoupling computational workloads from persistent storage, modern applications achieve millisecond latency, resilient redundancy, and seamless horizontal elasticity across global data clusters.`,

  quotes: `We suffer more often in imagination than in reality. True mastery is not the absence of difficulty, but the deliberate cultivation of relentless focus and calm precision in every stroke of life.`
};

class CustomTypingApp {
  constructor() {
    this.sound = new AudioFX();

    this.rawText = '';
    this.cleanedText = '';
    this.currentIndex = 0;
    this.userKeystrokes = 0;
    this.correctKeystrokes = 0;
    this.mistakesCount = 0;

    this.timer = null;
    this.startTime = null;
    this.elapsedSeconds = 0;
    this.isActive = false;
    this.isCompleted = false;

    // Settings
    this.strictCase = true;
    this.strictCorrection = true;

    this.dom = {};
  }

  init() {
    this.cacheDOMElements();
    this.bindEvents();

    // Load default preset into textarea
    this.dom.customTextInput.value = PRESETS.javascript;
    this.updateTextStats();
  }

  cacheDOMElements() {
    this.dom.setupPanel = document.getElementById('setupPanel');
    this.dom.practiceScreen = document.getElementById('practiceScreen');

    this.dom.customTextInput = document.getElementById('customTextInput');
    this.dom.charCount = document.getElementById('charCount');
    this.dom.wordCount = document.getElementById('wordCount');
    this.dom.estTime = document.getElementById('estTime');
    this.dom.clearTextBtn = document.getElementById('clearTextBtn');

    this.dom.optStrictCase = document.getElementById('optStrictCase');
    this.dom.optStrictCorrection = document.getElementById('optStrictCorrection');
    this.dom.optSound = document.getElementById('optSound');
    this.dom.startPracticeBtn = document.getElementById('startPracticeBtn');

    this.dom.editPassageBtn = document.getElementById('editPassageBtn');
    this.dom.restartPracticeBtn = document.getElementById('restartPracticeBtn');
    this.dom.progressBarFill = document.getElementById('progressBarFill');
    this.dom.progressPercent = document.getElementById('progressPercent');

    this.dom.statNetWpm = document.getElementById('statNetWpm');
    this.dom.statGrossWpm = document.getElementById('statGrossWpm');
    this.dom.statAccuracy = document.getElementById('statAccuracy');
    this.dom.statScore = document.getElementById('statScore');
    this.dom.statTimer = document.getElementById('statTimer');
    this.dom.statCharsLeft = document.getElementById('statCharsLeft');

    this.dom.typingStage = document.getElementById('typingStage');
    this.dom.promptDisplay = document.getElementById('promptDisplay');
    this.dom.hiddenInput = document.getElementById('hiddenInput');
    this.dom.focusNotice = document.getElementById('focusNotice');
    this.dom.focusNoticeText = document.getElementById('focusNoticeText');

    // Modal
    this.dom.resultsModal = document.getElementById('resultsModal');
    this.dom.resultsBadge = document.getElementById('resultsBadge');
    this.dom.finalNetWpm = document.getElementById('finalNetWpm');
    this.dom.finalAccuracy = document.getElementById('finalAccuracy');
    this.dom.finalScore = document.getElementById('finalScore');
    this.dom.finalTime = document.getElementById('finalTime');
    this.dom.finalKeystrokes = document.getElementById('finalKeystrokes');
    this.dom.finalErrors = document.getElementById('finalErrors');
    this.dom.finalGrossWpm = document.getElementById('finalGrossWpm');

    this.dom.modalRetryBtn = document.getElementById('modalRetryBtn');
    this.dom.modalCopyBtn = document.getElementById('modalCopyBtn');
    this.dom.modalNewTextBtn = document.getElementById('modalNewTextBtn');
  }

  bindEvents() {
    // Textarea input monitoring
    this.dom.customTextInput.addEventListener('input', () => {
      this.updateTextStats();
    });

    // Clear Text
    this.dom.clearTextBtn.addEventListener('click', () => {
      this.dom.customTextInput.value = '';
      this.updateTextStats();
      this.dom.customTextInput.focus();
    });

    // Presets
    document.querySelectorAll('[data-preset]').forEach(btn => {
      btn.addEventListener('click', () => {
        const key = btn.dataset.preset;
        if (PRESETS[key]) {
          this.dom.customTextInput.value = PRESETS[key];
          this.updateTextStats();
        }
      });
    });

    // Option Toggles
    this.dom.optStrictCase.addEventListener('change', (e) => {
      this.strictCase = e.target.checked;
    });
    this.dom.optStrictCorrection.addEventListener('change', (e) => {
      this.strictCorrection = e.target.checked;
    });
    this.dom.optSound.addEventListener('change', (e) => {
      this.sound.enabled = e.target.checked;
    });

    // Start Practice
    this.dom.startPracticeBtn.addEventListener('click', () => {
      this.sound.init();
      this.startCustomSession();
    });

    // Edit Passage
    this.dom.editPassageBtn.addEventListener('click', () => {
      this.switchToSetupMode();
    });

    // Restart Test
    this.dom.restartPracticeBtn.addEventListener('click', () => {
      this.resetPractice();
    });

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

    // Keydown Capture
    window.addEventListener('keydown', (e) => {
      if (!this.dom.practiceScreen.classList.contains('is-active')) return;
      if (this.isCompleted) return;
      if (this.dom.resultsModal.classList.contains('is-active')) return;

      if (e.key === 'F5' || e.key === 'F12' || (e.ctrlKey && e.key.toLowerCase() === 'r')) return;

      this.sound.init();

      if (e.key === 'Tab') {
        e.preventDefault();
        return;
      }

      if (e.key === 'Escape') {
        this.resetPractice();
        return;
      }

      if (document.activeElement !== this.dom.hiddenInput) {
        this.dom.hiddenInput.focus();
      }

      this.handleKeystroke(e);
    });

    // Modal Actions
    this.dom.modalRetryBtn.addEventListener('click', () => {
      this.dom.resultsModal.classList.remove('is-active');
      this.resetPractice();
    });

    this.dom.modalNewTextBtn.addEventListener('click', () => {
      this.dom.resultsModal.classList.remove('is-active');
      this.switchToSetupMode();
    });

    this.dom.modalCopyBtn.addEventListener('click', () => {
      this.copyResultsSummary();
    });
  }

  updateTextStats() {
    const text = this.dom.customTextInput.value.trim();
    const chars = text.length;
    const words = text.length > 0 ? text.split(/\s+/).length : 0;
    // Assuming standard 45 WPM speed
    const totalSeconds = Math.round((words / 45) * 60);
    const m = Math.floor(totalSeconds / 60);
    const s = totalSeconds % 60;

    this.dom.charCount.textContent = `${chars}`;
    this.dom.wordCount.textContent = `${words}`;
    this.dom.estTime.textContent = `${m}m ${s}s`;
  }

  startCustomSession() {
    const input = this.dom.customTextInput.value;
    if (!input || !input.trim()) {
      alert('Please enter or paste some text to begin typing practice.');
      this.dom.customTextInput.focus();
      return;
    }

    // Normalize whitespace (turn multiple newlines/tabs into standard readable format)
    this.rawText = input;
    // Standardize line endings and tabs to double spaces
    this.cleanedText = input.replace(/\r\n/g, '\n').replace(/\t/g, '  ').trim();

    this.dom.setupPanel.style.display = 'none';
    this.dom.practiceScreen.classList.add('is-active');

    this.resetPractice();
  }

  switchToSetupMode() {
    clearInterval(this.timer);
    this.isActive = false;
    this.dom.practiceScreen.classList.remove('is-active');
    this.dom.setupPanel.style.display = 'flex';
    this.dom.customTextInput.focus();
  }

  resetPractice() {
    clearInterval(this.timer);
    this.timer = null;
    this.startTime = null;
    this.elapsedSeconds = 0;
    this.currentIndex = 0;
    this.userKeystrokes = 0;
    this.correctKeystrokes = 0;
    this.mistakesCount = 0;
    this.isActive = false;
    this.isCompleted = false;

    this.strictCase = this.dom.optStrictCase.checked;
    this.strictCorrection = this.dom.optStrictCorrection.checked;

    this.renderPrompt();
    this.updateStats();
    this.updateProgress();

    this.dom.statTimer.textContent = '0s';
    this.dom.hiddenInput.value = '';
    setTimeout(() => {
      this.dom.hiddenInput.focus();
    }, 50);
  }

  renderPrompt() {
    this.dom.promptDisplay.innerHTML = '';
    const fragment = document.createDocumentFragment();

    for (let i = 0; i < this.cleanedText.length; i++) {
      const char = this.cleanedText[i];
      const span = document.createElement('span');
      span.className = 'prompt-char';
      if (i === 0) span.classList.add('current');

      if (char === '\n') {
        span.innerHTML = '↵<br/>';
      } else if (char === ' ') {
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
      this.dom.statTimer.textContent = `${this.elapsedSeconds}s`;
      this.updateStats();
    }, 250);
  }

  handleKeystroke(e) {
    if (this.currentIndex >= this.cleanedText.length) {
      this.finishPractice();
      return;
    }

    const expectedChar = this.cleanedText[this.currentIndex];

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
        this.updateProgress();
      }
      return;
    }

    // Map Enter to \n
    let typedChar = e.key;
    if (typedChar === 'Enter') {
      typedChar = '\n';
    }

    // Ignore non-typing keys like Shift, Alt, Meta
    if (e.key.length > 1 && typedChar !== '\n') return;

    e.preventDefault();

    if (!this.isActive) {
      this.startTimer();
    }

    this.userKeystrokes++;

    let isMatch = false;
    if (this.strictCase) {
      isMatch = typedChar === expectedChar;
    } else {
      isMatch = typedChar.toLowerCase() === expectedChar.toLowerCase();
    }

    const span = this.dom.promptDisplay.children[this.currentIndex];

    if (isMatch) {
      span.classList.remove('current', 'incorrect');
      span.classList.add('correct');
      this.correctKeystrokes++;
      this.sound.playClick();
      this.currentIndex++;
    } else {
      this.mistakesCount++;
      this.sound.playError();

      if (this.strictCorrection) {
        // In strict mode: do not advance until corrected
        span.classList.add('incorrect');
        this.updateStats();
        return;
      } else {
        // Free typing mode: mark error and advance
        span.classList.remove('current');
        span.classList.add('incorrect');
        this.currentIndex++;
      }
    }

    // Scroll container to keep active caret visible
    if (span.offsetTop > this.dom.typingStage.clientHeight / 2) {
      span.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }

    if (this.currentIndex < this.cleanedText.length) {
      const nextSpan = this.dom.promptDisplay.children[this.currentIndex];
      nextSpan.classList.add('current');
    } else {
      this.finishPractice();
      return;
    }

    this.updateProgress();
    this.updateStats();
  }

  updateProgress() {
    const total = this.cleanedText.length;
    const percent = total > 0 ? Math.round((this.currentIndex / total) * 100) : 0;
    this.dom.progressBarFill.style.width = `${percent}%`;
    this.dom.progressPercent.textContent = `${percent}%`;

    const remaining = Math.max(0, total - this.currentIndex);
    this.dom.statCharsLeft.textContent = `${remaining} chars left`;
  }

  updateStats() {
    const elapsedMinutes = Math.max(1 / 60, (this.elapsedSeconds || 1) / 60);
    const grossWpm = Math.round((this.userKeystrokes / 5) / elapsedMinutes);
    const netWpm = Math.max(0, Math.round(((this.correctKeystrokes / 5) - (this.mistakesCount / 5)) / elapsedMinutes));
    const accuracy = this.userKeystrokes > 0
      ? Math.round((this.correctKeystrokes / this.userKeystrokes) * 100)
      : 100;

    // Performance score: WPM * (Acc/100)^2 * 10
    const accFactor = Math.pow(accuracy / 100, 2);
    const score = Math.round(netWpm * accFactor * 10);

    this.dom.statNetWpm.textContent = isNaN(netWpm) ? '0' : `${netWpm}`;
    this.dom.statGrossWpm.textContent = isNaN(grossWpm) ? '0' : `${grossWpm}`;
    this.dom.statAccuracy.textContent = `${accuracy}%`;
    this.dom.statScore.textContent = isNaN(score) ? '0' : `${score}`;
  }

  finishPractice() {
    if (this.isCompleted) return;
    this.isCompleted = true;
    clearInterval(this.timer);

    const durationSec = Math.max(1, this.elapsedSeconds);
    const elapsedMinutes = durationSec / 60;
    const grossWpm = Math.round((this.userKeystrokes / 5) / elapsedMinutes);
    const netWpm = Math.max(0, Math.round(((this.correctKeystrokes / 5) - (this.mistakesCount / 5)) / elapsedMinutes));
    const accuracy = this.userKeystrokes > 0
      ? Math.round((this.correctKeystrokes / this.userKeystrokes) * 100)
      : 100;
    const score = Math.round(netWpm * Math.pow(accuracy / 100, 2) * 10);

    let badge = '★ Novice Typist';
    if (score >= 700) {
      badge = '👑 Grandmaster Typist';
    } else if (score >= 500) {
      badge = '⚡ Master Typist';
    } else if (score >= 350) {
      badge = '🎯 Professional Typist';
    } else if (score >= 200) {
      badge = '★ Proficient Typist';
    }

    this.dom.resultsBadge.textContent = badge;
    this.dom.finalNetWpm.textContent = `${netWpm}`;
    this.dom.finalAccuracy.textContent = `${accuracy}%`;
    this.dom.finalScore.textContent = `${score}`;
    this.dom.finalTime.textContent = `${durationSec}s`;
    this.dom.finalKeystrokes.textContent = `${this.userKeystrokes}`;
    this.dom.finalErrors.textContent = `${this.mistakesCount}`;
    this.dom.finalGrossWpm.textContent = `${grossWpm} WPM`;

    this.dom.resultsModal.classList.add('is-active');
  }

  copyResultsSummary() {
    const netWpm = this.dom.finalNetWpm.textContent;
    const acc = this.dom.finalAccuracy.textContent;
    const score = this.dom.finalScore.textContent;
    const time = this.dom.finalTime.textContent;
    const badge = this.dom.resultsBadge.textContent;

    const summary = `⌨️ Custom Text Typing Test Results:
Rank: ${badge}
Net Speed: ${netWpm} WPM
Accuracy: ${acc}
Performance Score: ${score} pts
Duration: ${time}
Tested on ALL IN ONE Typing Mastery`;

    if (navigator.clipboard) {
      navigator.clipboard.writeText(summary).then(() => {
        this.dom.modalCopyBtn.textContent = '✓ Copied to Clipboard!';
        setTimeout(() => {
          this.dom.modalCopyBtn.textContent = '📋 Copy Score Summary';
        }, 2000);
      });
    }
  }
}

document.addEventListener('DOMContentLoaded', () => {
  const app = new CustomTypingApp();
  app.init();
});