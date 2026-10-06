// Typing Speed Test - Professional Diagnostics & Certification Engine

const PASSAGES = {
  literature: [
    "Call me Ishmael. Some years ago, never mind how long precisely, having little or no money in my purse, and nothing particular to interest me on shore, I thought I would sail about a little and see the watery part of the world. It is a way I have of driving off the spleen and regulating the circulation. Whenever I find myself growing grim about the mouth; whenever it is a damp, drizzly November in my soul; whenever I find myself involuntarily pausing before coffin warehouses, and bringing up the rear of every funeral I meet; then, I account it high time to get to sea as soon as I can.",
    "It is a truth universally acknowledged, that a single man in possession of a good fortune, must be in want of a wife. However little known the feelings or views of such a man may be on his first entering a neighbourhood, this truth is so well fixed in the minds of the surrounding families, that he is considered the rightful property of some one or other of their daughters. My dear Mr. Bennet, said his lady to him one day, have you heard that Netherfield Park is let at last?",
    "It was the best of times, it was the worst of times, it was the age of wisdom, it was the age of foolishness, it was the epoch of belief, it was the epoch of incredulity, it was the season of light, it was the season of darkness, it was the spring of hope, it was the winter of despair. We had everything before us, we had nothing before us, we were all going direct to Heaven, we were all going direct the other way in short, the period was so far like the present period."
  ],
  tech: [
    "Simplicity is prerequisite for reliability. Programs must be written for people to read, and only incidentally for machines to execute. Software engineering is what happens to programming when you add time and other programmers. The clean coder knows that writing clean code is not about following a set of strict dogmatic rules; it is about building software that is easy to understand, adaptable to change, and robust under unforeseen production failures.",
    "Abstraction is the elimination of the irrelevant and the amplification of the essential. In modular system architecture, each component encapsulates its own internal state and exposes a clear, declarative interface to the outside environment. When coupling is minimized and cohesion is maximized, distributed systems achieve high maintainability, resilience against cascading failures, and graceful operational degradation under peak load.",
    "Any fool can write code that a computer can understand. Good programmers write code that humans can understand. The essence of functional programming is writing pure functions without side effects. Immutable data structures ensure thread safety across concurrent execution pipelines, preventing unpredictable race conditions and making complex state transitions predictable, testable, and deterministic."
  ],
  philosophy: [
    "We are what we repeatedly do. Excellence, then, is not an act, but a habit. The unexamined life is not worth living. Waste no more time arguing what a good man should be. Be one. When you arise in the morning think of what a privilege it is to be alive, to think, to enjoy, to love. The happiness of your life depends upon the quality of your thoughts; therefore, guard accordingly, and take care that you entertain no notions unsuitable to virtue and reasonable nature.",
    "The soul becomes dyed with the color of its thoughts. You have power over your mind, not outside events. Realize this, and you will find immense strength. Very little is needed to make a happy life; it is all within yourself, in your way of thinking. He who fears death will never do anything worthy of a man who is alive. Accept the things to which fate binds you, and love the people with whom fate brings you together, but do so with all your heart.",
    "The only true wisdom is in knowing you know nothing. It does not matter how slowly you go as long as you do not stop. Difficulties strengthen the mind, as labor does the body. If you are distressed by anything external, the pain is not due to the thing itself, but to your estimate of it; and this you have the power to revoke at any moment. True happiness is to enjoy the present, without anxious dependence upon the future."
  ],
  business: [
    "Exceptional client communication and quantitative decision-making form the cornerstone of scalable enterprise operations. Project managers orchestrate cross-functional stakeholders through transparent milestones, measurable key performance indicators, and iterative development cadences. By systematically mitigating operational risks and fostering an internal culture of continuous feedback, teams accelerate time to market while sustaining uncompromising standards of service reliability.",
    "Strategic innovation demands a disciplined balance between exploratory product research and focused operational execution. Modern enterprises navigate shifting market dynamics by leveraging real-time business intelligence, dynamic forecasting models, and resilient supply chains. Sustainable competitive advantage arises not merely from rapid growth, but from customer retention, operational efficiency, and a relentless commitment to customer satisfaction across every touchpoint."
  ],
  quotes: [
    "Success is not final, failure is not fatal: it is the courage to continue that counts. The future belongs to those who believe in the beauty of their dreams. Spread love everywhere you go. Let no one ever come to you without leaving happier. In the middle of every difficulty lies hidden opportunity. Do not go where the path may lead, go instead where there is no path and leave a trail. Believe you can and you are halfway there."
  ]
};

// Web Audio API Synthesizer for Mechanical Keyboard Clicks
class KeyboardSoundSynthesizer {
  constructor() {
    this.ctx = null;
    this.enabled = true;
  }

  init() {
    if (!this.ctx && typeof AudioContext !== 'undefined') {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      this.ctx = new AudioCtx();
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  playKeyClick(isSpace = false, isError = false) {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;

    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      if (isError) {
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(140, now);
        osc.frequency.exponentialRampToValueAtTime(70, now + 0.12);
        gain.gain.setValueAtTime(0.08, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(now);
        osc.stop(now + 0.12);
        return;
      }

      // Mechanical switch click simulation
      const baseFreq = isSpace ? 320 : 600 + (Math.random() * 120 - 60);
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(baseFreq, now);
      osc.frequency.exponentialRampToValueAtTime(120, now + 0.04);

      gain.gain.setValueAtTime(0.06, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.04);
    } catch {
      // Audio fallback silent fail
    }
  }
}

// Typing Speed Test Engine
class TypingSpeedTest {
  constructor() {
    this.soundSynth = new KeyboardSoundSynthesizer();
    this.duration = 60; // seconds
    this.category = 'literature';
    this.timer = null;
    this.chartTimer = null;
    this.timeLeft = this.duration;
    this.isRunning = false;
    this.isFinished = false;

    this.rawText = '';
    this.words = [];
    this.currentWordIndex = 0;
    this.currentCharIndex = 0;
    
    // Stats tracking
    this.totalTypedChars = 0;
    this.correctChars = 0;
    this.errorCount = 0;
    this.elapsedSeconds = 0;
    this.wpmHistory = []; // { time, wpm }
    this.peakWpm = 0;

    // Elements
    this.dom = {
      durationSelector: document.getElementById('durationSelector'),
      categorySelect: document.getElementById('categorySelect'),
      soundToggleBtn: document.getElementById('soundToggleBtn'),
      soundIcon: document.getElementById('soundIcon'),
      soundLabel: document.getElementById('soundLabel'),
      restartBtn: document.getElementById('restartBtn'),
      netWpmVal: document.getElementById('netWpmVal'),
      grossWpmVal: document.getElementById('grossWpmVal'),
      accuracyVal: document.getElementById('accuracyVal'),
      timerVal: document.getElementById('timerVal'),
      timerSub: document.getElementById('timerSub'),
      errorCountVal: document.getElementById('errorCountVal'),
      charBreakdown: document.getElementById('charBreakdown'),
      displayPanel: document.getElementById('displayPanel'),
      focusHint: document.getElementById('focusHint'),
      wordsContainer: document.getElementById('wordsContainer'),
      hiddenInput: document.getElementById('hiddenInput'),
      wpmChartSvg: document.getElementById('wpmChartSvg'),
      chartLine: document.getElementById('chartLine'),
      chartArea: document.getElementById('chartArea'),
      chartPeakSpeed: document.getElementById('chartPeakSpeed'),
      
      // Modal elements
      resultsModal: document.getElementById('resultsModal'),
      closeModalBtn: document.getElementById('closeModalBtn'),
      finalNetWpm: document.getElementById('finalNetWpm'),
      finalGrossWpm: document.getElementById('finalGrossWpm'),
      finalAccuracy: document.getElementById('finalAccuracy'),
      finalMistakes: document.getElementById('finalMistakes'),
      finalRating: document.getElementById('finalRating'),
      finalPercentile: document.getElementById('finalPercentile'),
      finalDurationLabel: document.getElementById('finalDurationLabel'),
      studentNameInput: document.getElementById('studentNameInput'),
      updateCertNameBtn: document.getElementById('updateCertNameBtn'),
      certRecipientDisplay: document.getElementById('certRecipientDisplay'),
      certNetWpm: document.getElementById('certNetWpm'),
      certGrossWpm: document.getElementById('certGrossWpm'),
      certAccuracy: document.getElementById('certAccuracy'),
      certDuration: document.getElementById('certDuration'),
      certDateDisplay: document.getElementById('certDateDisplay'),
      certIdDisplay: document.getElementById('certIdDisplay'),
      printCertBtn: document.getElementById('printCertBtn'),
      copyResultsBtn: document.getElementById('copyResultsBtn'),
      modalRestartBtn: document.getElementById('modalRestartBtn')
    };

    this.initEvents();
    this.resetTest();
  }

  initEvents() {
    // Duration selection
    this.dom.durationSelector.addEventListener('click', (e) => {
      const btn = e.target.closest('.tst-pill-btn');
      if (!btn) return;
      this.dom.durationSelector.querySelectorAll('.tst-pill-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      this.duration = parseInt(btn.dataset.duration, 10);
      this.resetTest();
    });

    // Category selection
    this.dom.categorySelect.addEventListener('change', (e) => {
      this.category = e.target.value;
      this.resetTest();
    });

    // Sound toggle
    this.dom.soundToggleBtn.addEventListener('click', () => {
      this.soundSynth.enabled = !this.soundSynth.enabled;
      this.dom.soundLabel.textContent = this.soundSynth.enabled ? 'Sound ON' : 'Muted';
      this.dom.soundToggleBtn.style.opacity = this.soundSynth.enabled ? '1' : '0.6';
    });

    // Restart button
    this.dom.restartBtn.addEventListener('click', () => this.resetTest());

    // Focus handling
    this.dom.displayPanel.addEventListener('click', () => this.focusInput());
    this.dom.focusHint.addEventListener('click', () => this.focusInput());

    // Keystroke handling
    window.addEventListener('keydown', (e) => {
      if (this.dom.resultsModal.classList.contains('active')) {
        if (e.key === 'Escape') this.closeModal();
        return;
      }

      if (e.key === 'Escape') {
        this.resetTest();
        return;
      }

      if (document.activeElement !== this.dom.hiddenInput && !e.ctrlKey && !e.metaKey && !e.altKey) {
        if (e.key.length === 1 || e.key === 'Backspace' || e.key === ' ') {
          this.focusInput();
        }
      }
    });

    this.dom.hiddenInput.addEventListener('keydown', (e) => this.handleKeyDown(e));

    // Modal events
    this.dom.closeModalBtn.addEventListener('click', () => this.closeModal());
    this.dom.modalRestartBtn.addEventListener('click', () => {
      this.closeModal();
      this.resetTest();
    });

    this.dom.updateCertNameBtn.addEventListener('click', () => {
      const name = this.dom.studentNameInput.value.trim() || 'Professional Typist';
      this.dom.certRecipientDisplay.textContent = name;
    });

    this.dom.studentNameInput.addEventListener('input', () => {
      const name = this.dom.studentNameInput.value.trim() || 'Professional Typist';
      this.dom.certRecipientDisplay.textContent = name;
    });

    this.dom.printCertBtn.addEventListener('click', () => {
      window.print();
    });

    this.dom.copyResultsBtn.addEventListener('click', () => this.copyResultsToClipboard());
  }

  focusInput() {
    this.dom.hiddenInput.focus();
    this.dom.displayPanel.classList.add('focused');
    this.dom.focusHint.classList.add('hidden');
  }

  resetTest() {
    clearInterval(this.timer);
    clearInterval(this.chartTimer);
    this.timer = null;
    this.chartTimer = null;
    
    this.isRunning = false;
    this.isFinished = false;
    this.timeLeft = this.duration;
    this.elapsedSeconds = 0;
    this.totalTypedChars = 0;
    this.correctChars = 0;
    this.errorCount = 0;
    this.currentWordIndex = 0;
    this.currentCharIndex = 0;
    this.wpmHistory = [{ time: 0, wpm: 0 }];
    this.peakWpm = 0;

    // Pick passage
    const pool = PASSAGES[this.category] || PASSAGES.literature;
    this.rawText = pool[Math.floor(Math.random() * pool.length)];
    this.words = this.rawText.split(/\s+/);

    this.renderWords();
    this.updateStatsUI();
    this.drawChart();

    this.dom.timerVal.textContent = this.formatTime(this.timeLeft);
    this.dom.focusHint.classList.remove('hidden');
    this.dom.displayPanel.classList.remove('focused');
    this.dom.hiddenInput.value = '';
    this.dom.wordsContainer.style.transform = 'translateY(0)';
  }

  renderWords() {
    const container = this.dom.wordsContainer;
    container.innerHTML = '';

    this.words.forEach((wordText, wIdx) => {
      const wordSpan = document.createElement('span');
      wordSpan.className = 'tst-word';
      wordSpan.dataset.wordIndex = wIdx;

      for (let cIdx = 0; cIdx < wordText.length; cIdx++) {
        const charSpan = document.createElement('span');
        charSpan.className = 'tst-char';
        charSpan.dataset.charIndex = cIdx;
        charSpan.textContent = wordText[cIdx];
        if (wIdx === 0 && cIdx === 0) {
          charSpan.classList.add('current');
        }
        wordSpan.appendChild(charSpan);
      }
      container.appendChild(wordSpan);
    });
  }

  startTest() {
    if (this.isRunning) return;
    this.isRunning = true;
    this.soundSynth.init();

    this.timer = setInterval(() => {
      this.timeLeft--;
      this.elapsedSeconds++;
      this.dom.timerVal.textContent = this.formatTime(this.timeLeft);
      this.updateStatsUI();

      if (this.timeLeft <= 0) {
        this.finishTest();
      }
    }, 1000);

    // Chart sampler every 2 seconds
    this.chartTimer = setInterval(() => {
      const currentNet = this.calculateNetWpm();
      this.wpmHistory.push({ time: this.elapsedSeconds, wpm: currentNet });
      if (currentNet > this.peakWpm) {
        this.peakWpm = currentNet;
        this.dom.chartPeakSpeed.textContent = `Peak: ${this.peakWpm} WPM`;
      }
      this.drawChart();
    }, 2000);
  }

  handleKeyDown(e) {
    if (this.isFinished) return;

    // Prevent tab or arrow navigation from breaking input
    if (e.key === 'Tab') {
      e.preventDefault();
      return;
    }

    if (!this.isRunning && e.key.length === 1) {
      this.startTest();
    }

    const currentWordText = this.words[this.currentWordIndex];
    const wordEl = this.dom.wordsContainer.children[this.currentWordIndex];
    if (!wordEl) return;

    // BACKSPACE
    if (e.key === 'Backspace') {
      e.preventDefault();
      if (this.currentCharIndex > 0) {
        this.currentCharIndex--;
        const charEl = wordEl.children[this.currentCharIndex];
        if (charEl) {
          if (charEl.classList.contains('extra')) {
            charEl.remove();
          } else {
            charEl.className = 'tst-char current';
          }
        }
        // clear current marker from next
        const nextCharEl = wordEl.children[this.currentCharIndex + 1];
        if (nextCharEl) nextCharEl.classList.remove('current');
      }
      return;
    }

    // SPACE - Advance to next word
    if (e.key === ' ') {
      e.preventDefault();
      if (this.currentCharIndex === 0) return; // avoid multiple consecutive spaces

      this.soundSynth.playKeyClick(true, false);
      this.totalTypedChars++;

      // Check if word was typed completely and correctly
      const chars = wordEl.querySelectorAll('.tst-char:not(.extra)');
      let allCorrect = true;
      chars.forEach(ch => {
        if (!ch.classList.contains('correct')) allCorrect = false;
      });

      if (allCorrect && this.currentCharIndex === currentWordText.length) {
        this.correctChars++; // for space
      } else {
        this.errorCount++;
      }

      // Advance to next word
      const prevActiveChar = wordEl.children[this.currentCharIndex];
      if (prevActiveChar) prevActiveChar.classList.remove('current');

      this.currentWordIndex++;
      this.currentCharIndex = 0;

      if (this.currentWordIndex >= this.words.length) {
        this.finishTest();
        return;
      }

      // Mark next word's first char current
      const nextWordEl = this.dom.wordsContainer.children[this.currentWordIndex];
      if (nextWordEl && nextWordEl.children[0]) {
        nextWordEl.children[0].classList.add('current');
        this.adjustScroll(nextWordEl);
      }

      this.updateStatsUI();
      return;
    }

    // REGULAR CHARACTER
    if (e.key.length === 1) {
      e.preventDefault();
      this.totalTypedChars++;

      const expectedChar = currentWordText[this.currentCharIndex];
      const charEl = wordEl.children[this.currentCharIndex];

      if (this.currentCharIndex < currentWordText.length && charEl) {
        charEl.classList.remove('current');
        if (e.key === expectedChar) {
          charEl.className = 'tst-char correct';
          this.correctChars++;
          this.soundSynth.playKeyClick(false, false);
        } else {
          charEl.className = 'tst-char incorrect';
          this.errorCount++;
          this.soundSynth.playKeyClick(false, true);
        }

        this.currentCharIndex++;
        const nextChar = wordEl.children[this.currentCharIndex];
        if (nextChar) {
          nextChar.classList.add('current');
        }
      } else {
        // Extra characters typed past word length
        this.errorCount++;
        this.soundSynth.playKeyClick(false, true);
        const extraSpan = document.createElement('span');
        extraSpan.className = 'tst-char extra';
        extraSpan.textContent = e.key;
        wordEl.appendChild(extraSpan);
        this.currentCharIndex++;
      }

      this.updateStatsUI();
    }
  }

  adjustScroll(activeWordEl) {
    const container = this.dom.displayPanel;
    const offsetTop = activeWordEl.offsetTop;
    if (offsetTop > 70) {
      this.dom.wordsContainer.style.transform = `translateY(-${offsetTop - 40}px)`;
    } else {
      this.dom.wordsContainer.style.transform = 'translateY(0)';
    }
  }

  calculateGrossWpm() {
    const minutes = Math.max(this.elapsedSeconds / 60, 0.05);
    return Math.round((this.totalTypedChars / 5) / minutes);
  }

  calculateNetWpm() {
    const minutes = Math.max(this.elapsedSeconds / 60, 0.05);
    const gross = (this.totalTypedChars / 5) / minutes;
    const penalty = this.errorCount / minutes;
    return Math.max(0, Math.round(gross - penalty));
  }

  calculateAccuracy() {
    if (this.totalTypedChars === 0) return 100;
    return Math.max(0, Math.min(100, Math.round((this.correctChars / this.totalTypedChars) * 100)));
  }

  updateStatsUI() {
    const net = this.calculateNetWpm();
    const gross = this.calculateGrossWpm();
    const accuracy = this.calculateAccuracy();

    this.dom.netWpmVal.textContent = net;
    this.dom.grossWpmVal.textContent = gross;
    this.dom.accuracyVal.textContent = `${accuracy}%`;
    this.dom.errorCountVal.textContent = this.errorCount;
    this.dom.charBreakdown.textContent = `${this.totalTypedChars} typed`;
  }

  drawChart() {
    if (this.wpmHistory.length === 0) return;
    const width = 800;
    const height = 120;
    const padding = 10;

    const maxWpm = Math.max(60, ...this.wpmHistory.map(p => p.wpm));
    const maxTime = Math.max(this.duration, this.elapsedSeconds);

    const points = this.wpmHistory.map(p => {
      const x = (p.time / maxTime) * width;
      const y = height - padding - (p.wpm / maxWpm) * (height - 2 * padding);
      return { x, y };
    });

    if (points.length === 1) {
      points.push({ x: 1, y: points[0].y });
    }

    let linePath = `M ${points[0].x.toFixed(1)} ${points[0].y.toFixed(1)}`;
    points.slice(1).forEach(pt => {
      linePath += ` L ${pt.x.toFixed(1)} ${pt.y.toFixed(1)}`;
    });

    const lastPt = points[points.length - 1];
    const areaPath = `${linePath} L ${lastPt.x.toFixed(1)} ${height} L 0 ${height} Z`;

    this.dom.chartLine.setAttribute('d', linePath);
    this.dom.chartArea.setAttribute('d', areaPath);
  }

  finishTest() {
    this.isFinished = true;
    this.isRunning = false;
    clearInterval(this.timer);
    clearInterval(this.chartTimer);

    // Final calculations
    const net = this.calculateNetWpm();
    const gross = this.calculateGrossWpm();
    const acc = this.calculateAccuracy();

    // Skill tiers
    let rating = 'Novice Typist';
    let percentile = 'Top 80%';
    if (net >= 100) {
      rating = 'Grandmaster Typist';
      percentile = 'Top 1%';
    } else if (net >= 80) {
      rating = 'Master Typist';
      percentile = 'Top 5%';
    } else if (net >= 60) {
      rating = 'Professional Typist';
      percentile = 'Top 15%';
    } else if (net >= 40) {
      rating = 'Intermediate Typist';
      percentile = 'Top 45%';
    }

    // Modal display
    this.dom.finalNetWpm.textContent = net;
    this.dom.finalGrossWpm.textContent = gross;
    this.dom.finalAccuracy.textContent = `${acc}%`;
    this.dom.finalMistakes.textContent = `${this.errorCount} mistakes`;
    this.dom.finalRating.textContent = rating;
    this.dom.finalPercentile.textContent = percentile;
    this.dom.finalDurationLabel.textContent = `${this.duration}s Assessment`;

    // Populate Certificate
    this.dom.certNetWpm.textContent = net;
    this.dom.certGrossWpm.textContent = gross;
    this.dom.certAccuracy.textContent = `${acc}%`;
    this.dom.certDuration.textContent = `${this.duration / 60} Min`;

    const now = new Date();
    this.dom.certDateDisplay.textContent = now.toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    const randHex = Math.floor(Math.random() * 0xFFFFFF).toString(16).toUpperCase().padStart(6, '0');
    this.dom.certIdDisplay.textContent = `AIO-TYP-${randHex}`;

    this.dom.resultsModal.classList.add('active');
  }

  closeModal() {
    this.dom.resultsModal.classList.remove('active');
  }

  copyResultsToClipboard() {
    const net = this.dom.finalNetWpm.textContent;
    const gross = this.dom.finalGrossWpm.textContent;
    const acc = this.dom.finalAccuracy.textContent;
    const text = `🏆 ALL IN ONE Typing Speed Test Results:\n• Net Speed: ${net} WPM\n• Gross Speed: ${gross} WPM\n• Accuracy: ${acc}\n• Duration: ${this.duration} seconds\nVerified at: https://sami12901.github.io/ALL-IN-ONE-v1/tools/typing-speed-test/`;

    navigator.clipboard.writeText(text).then(() => {
      const origText = this.dom.copyResultsBtn.innerHTML;
      this.dom.copyResultsBtn.textContent = 'Copied to Clipboard!';
      setTimeout(() => {
        this.dom.copyResultsBtn.innerHTML = origText;
      }, 2000);
    });
  }

  formatTime(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }
}

document.addEventListener('DOMContentLoaded', () => {
  new TypingSpeedTest();
});