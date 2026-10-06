/**
 * WPM Calculator - Professional Real-Time Typing Speed Analyzer
 * Fully client-side vanilla ES Module.
 */

// Sample Passages Catalog
const PASSAGES = {
  tech: {
    short: [
      "Modern web architecture relies on event-driven microservices, asynchronous execution loops, and robust distributed caching.",
      "Cloud native computing leverages containerization, immutable infrastructure, and automated declarative APIs to achieve scalable resilience.",
      "Functional programming treats computation as mathematical evaluation, minimizing side effects and ensuring thread safety."
    ],
    medium: [
      "Distributed systems coordinate autonomous computing nodes through consensus algorithms like Raft and Paxos. As latency shifts across worldwide networks, fault tolerance, data partitioning, and eventual consistency dictate the reliable behavior of modern scalable applications.",
      "Artificial intelligence models leverage multi-head self-attention mechanisms to map contextual semantics across multi-modal high dimensional spaces. Efficient transformer inference relies on quantization, tensor parallelism, and specialized silicon accelerators.",
      "High performance graphics pipelines harness compute shaders and unified memory architectures. Low-level graphics APIs minimize CPU overhead by providing developers with explicit memory management and asynchronous queue submission."
    ],
    long: [
      "Modern operating systems orchestrate complex virtual memory hierarchies, hardware interrupts, and preemptive multitasking schedulers to ensure deterministic throughput under volatile workloads. Low-level systems programming requires strict adherence to memory safety principles, preventing buffer overflows, race conditions, and dangling pointers. As heterogeneous computing architectures integrate specialized neural processing units alongside traditional symmetric cores, compiler optimizations must continually evolve to effectively vectorize parallel instructions across diverse register topologies."
    ]
  },
  literature: {
    short: [
      "It was a bright cold day in April, and the clocks were striking thirteen as the wind whirled dust along the cobblestones.",
      "All happy families are alike; each unhappy family is unhappy in its own particular and sorrowful way.",
      "The woods are lovely, dark and deep, but I have promises to keep, and miles to go before I sleep."
    ],
    medium: [
      "In the late summer of that year we lived in a house in a village that looked across the river and the plain to the mountains. In the bed of the river there were pebbles and boulders, dry and white in the sun, and the water was clear and swiftly moving and blue in the channels.",
      "He stood at the helm of the vessel, watching the silent swell of the nocturnal ocean. A thousand stars shimmered across the obsidian mirror of the deep waters, whispering ancient forgotten tales of explorers who had charted these tides before history was ever set into ink.",
      "There is a grandeur in this view of life, with its several powers having been originally breathed into a few forms or into one; and that whilst this planet has gone cycling on according to the fixed law of gravity, from so simple a beginning endless forms most beautiful have been evolved."
    ],
    long: [
      "The timeless hills rolled gently toward the horizon, draped in misty morning amber that welcomed the dawn with quiet reverence. A solitary traveler strolled down the cobblestone road, listening intently to the distant chatter of waking sparrows and the whispering rhythm of autumn leaves brushing against stone walls. Here, beneath the sheltering boughs of ancient oaks, one discovered the quiet majesty of unhurried contemplation, where seconds expanded into peaceful eternities and the loud urgency of the modern world dissolved into gentle calm."
    ]
  },
  business: {
    short: [
      "Customer lifetime value, product market fit, and unit economics form the bedrock of sustainable enterprise ventures.",
      "Agile leadership prioritizes rapid empirical validation, cross-functional autonomy, and data-informed strategic pivots.",
      "Capital allocation efficiency determines long-term shareholder equity and sustainable organizational resilience."
    ],
    medium: [
      "Strategic market differentiation requires organizations to cultivate unique value propositions rather than competing solely on operational cost. Disruptive market innovators identify underserved customer segments, deploy lean experiments, and iterate based on high-frequency customer feedback loops.",
      "Effective organizational communication eliminates information silos across engineering, marketing, and executive leadership. When teams operate with radical transparency and clearly aligned key performance indicators, strategic velocity naturally accelerates across all verticals.",
      "Risk mitigation in macroeconomic volatility demands continuous balance sheet stress testing and diversified cash flows. Enterprises that maintain defensive liquidity reserves can opportunistically acquire strategic assets during market contractions."
    ],
    long: [
      "In an increasingly saturated global marketplace, authentic customer trust represents the ultimate defensible competitive moat. Organizations must transcend purely transactional interactions by committing to uncompromising product reliability, transparent governance, and exceptional post-sales support. Executive teams that cultivate cultures of continuous psychological safety empower frontline employees to surface emerging vulnerabilities before they escalate into systemic operational crises."
    ]
  }
};

// Audio Synthesizer via Web Audio API (Zero external assets needed)
class SoundFX {
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

  playKey() {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const now = this.ctx.currentTime;

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(320 + Math.random() * 80, now);
    osc.frequency.exponentialRampToValueAtTime(100, now + 0.04);

    gain.gain.setValueAtTime(0.08, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + 0.04);
  }

  playSpace() {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const now = this.ctx.currentTime;

    osc.type = 'sine';
    osc.frequency.setValueAtTime(180, now);
    osc.frequency.exponentialRampToValueAtTime(60, now + 0.06);

    gain.gain.setValueAtTime(0.12, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.06);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + 0.06);
  }

  playError() {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const now = this.ctx.currentTime;

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(140, now);
    osc.frequency.exponentialRampToValueAtTime(80, now + 0.1);

    gain.gain.setValueAtTime(0.15, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.1);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + 0.1);
  }

  playSuccess() {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;

    const notes = [440, 554.37, 659.25, 880];
    notes.forEach((freq, idx) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const startTime = this.ctx.currentTime + idx * 0.09;

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, startTime);

      gain.gain.setValueAtTime(0.12, startTime);
      gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.28);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(startTime);
      osc.stop(startTime + 0.28);
    });
  }
}

// State Management
class WPMCalculatorApp {
  constructor() {
    this.sound = new SoundFX();
    this.currentTopic = 'tech';
    this.currentLength = 'medium';
    this.customText = '';

    this.targetText = '';
    this.typedChars = [];
    this.currentIndex = 0;
    this.errorsCount = 0;
    this.totalKeystrokes = 0;

    this.startTime = null;
    this.timerInterval = null;
    this.isTestRunning = false;
    this.isTestFinished = false;

    // Cache DOM
    this.dom = {
      valNetWpm: document.getElementById('val-net-wpm'),
      valGrossWpm: document.getElementById('val-gross-wpm'),
      valAccuracy: document.getElementById('val-accuracy'),
      valCpm: document.getElementById('val-cpm'),
      valTime: document.getElementById('val-time'),
      valErrors: document.getElementById('val-errors'),

      passageContainer: document.getElementById('passage-container'),
      passageText: document.getElementById('passage-text'),
      typingInput: document.getElementById('typing-input'),
      clickPrompt: document.getElementById('click-prompt'),

      resultsCard: document.getElementById('results-card'),
      finalNetWpm: document.getElementById('final-net-wpm'),
      rankBadge: document.getElementById('rank-badge'),
      rankName: document.getElementById('rank-name'),
      rankDescription: document.getElementById('rank-description'),

      resGrossWpm: document.getElementById('res-gross-wpm'),
      resAccuracy: document.getElementById('res-accuracy'),
      resCpm: document.getElementById('res-cpm'),
      resTime: document.getElementById('res-time'),
      resErrors: document.getElementById('res-errors'),
      resChars: document.getElementById('res-chars'),

      btnTryAgain: document.getElementById('btn-try-again'),
      btnNewPassage: document.getElementById('btn-new-passage'),
      btnCopyResult: document.getElementById('btn-copy-result'),
      btnRestartTop: document.getElementById('btn-restart-top'),
      btnSoundToggle: document.getElementById('btn-sound-toggle'),

      topicSelector: document.getElementById('topic-selector'),
      lengthSelector: document.getElementById('length-selector'),

      customModal: document.getElementById('custom-modal'),
      customTextInput: document.getElementById('custom-text-input'),
      btnApplyCustom: document.getElementById('btn-apply-custom'),
      btnCancelCustom: document.getElementById('btn-cancel-custom'),
      btnCloseModal: document.getElementById('btn-close-modal')
    };

    this.bindEvents();
    this.loadPassage();
  }

  bindEvents() {
    // Focus passage container
    this.dom.passageContainer.addEventListener('click', () => {
      this.dom.typingInput.focus();
      this.dom.clickPrompt.classList.add('hidden');
      this.dom.passageContainer.classList.add('is-focused');
    });

    // Keydown handling for typing
    this.dom.typingInput.addEventListener('keydown', (e) => this.handleKeyDown(e));

    // Topic selector
    this.dom.topicSelector.addEventListener('click', (e) => {
      const btn = e.target.closest('.pill-btn');
      if (!btn) return;
      const topic = btn.dataset.topic;

      if (topic === 'custom') {
        this.dom.customModal.classList.add('show');
        this.dom.customTextInput.focus();
        return;
      }

      this.dom.topicSelector.querySelectorAll('.pill-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      this.currentTopic = topic;
      this.loadPassage();
    });

    // Length selector
    this.dom.lengthSelector.addEventListener('click', (e) => {
      const btn = e.target.closest('.pill-btn');
      if (!btn) return;
      this.dom.lengthSelector.querySelectorAll('.pill-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      this.currentLength = btn.dataset.length;
      if (this.currentTopic !== 'custom') {
        this.loadPassage();
      }
    });

    // Sound toggle
    this.dom.btnSoundToggle.addEventListener('click', () => {
      this.sound.enabled = !this.sound.enabled;
      this.dom.btnSoundToggle.classList.toggle('active', this.sound.enabled);
      const textSpan = this.dom.btnSoundToggle.querySelector('span');
      if (textSpan) {
        textSpan.textContent = `Sound: ${this.sound.enabled ? 'ON' : 'OFF'}`;
      }
    });

    // Reset / Restart buttons
    this.dom.btnRestartTop.addEventListener('click', () => this.resetTest());
    this.dom.btnTryAgain.addEventListener('click', () => this.resetTest());
    this.dom.btnNewPassage.addEventListener('click', () => this.loadPassage());

    // Copy Result
    this.dom.btnCopyResult.addEventListener('click', () => this.copySummary());

    // Custom Modal Events
    this.dom.btnCloseModal.addEventListener('click', () => this.dom.customModal.classList.remove('show'));
    this.dom.btnCancelCustom.addEventListener('click', () => this.dom.customModal.classList.remove('show'));
    this.dom.btnApplyCustom.addEventListener('click', () => {
      const text = this.dom.customTextInput.value.trim();
      if (text.length < 20) {
        alert('Please enter a passage of at least 20 characters.');
        return;
      }
      this.customText = text;
      this.currentTopic = 'custom';
      this.dom.topicSelector.querySelectorAll('.pill-btn').forEach(b => b.classList.remove('active'));
      const customPill = this.dom.topicSelector.querySelector('[data-topic="custom"]');
      if (customPill) customPill.classList.add('active');
      this.dom.customModal.classList.remove('show');
      this.loadPassage();
    });

    // Document-level keypress capture if user clicks anywhere on page
    document.addEventListener('keydown', (e) => {
      if (this.dom.customModal.classList.contains('show')) return;
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;

      if (!e.ctrlKey && !e.altKey && !e.metaKey && e.key.length === 1) {
        this.dom.typingInput.focus();
        this.dom.clickPrompt.classList.add('hidden');
        this.dom.passageContainer.classList.add('is-focused');
      }
    });
  }

  loadPassage() {
    this.resetTest();

    if (this.currentTopic === 'custom' && this.customText) {
      this.targetText = this.customText;
    } else {
      const topicBank = PASSAGES[this.currentTopic] || PASSAGES.tech;
      const lengthPool = topicBank[this.currentLength] || topicBank.medium;
      const randomIndex = Math.floor(Math.random() * lengthPool.length);
      this.targetText = lengthPool[randomIndex].trim();
    }

    this.renderPassage();
  }

  renderPassage() {
    this.dom.passageText.innerHTML = '';
    const fragment = document.createDocumentFragment();

    for (let i = 0; i < this.targetText.length; i++) {
      const span = document.createElement('span');
      span.className = 'char char-pending';
      span.textContent = this.targetText[i];
      span.dataset.index = i;
      if (i === 0) {
        span.classList.add('char-current');
      }
      fragment.appendChild(span);
    }

    this.dom.passageText.appendChild(fragment);
    this.typedChars = new Array(this.targetText.length).fill(null);
    this.currentIndex = 0;
    this.dom.clickPrompt.classList.remove('hidden');
  }

  handleKeyDown(e) {
    if (this.isTestFinished) return;

    // Prevent default scrolling on space
    if (e.key === ' ' || e.code === 'Space') {
      e.preventDefault();
    }

    // Ignore Meta keys
    if (e.key === 'Shift' || e.key === 'Control' || e.key === 'Alt' || e.key === 'CapsLock' || e.key === 'Tab') {
      return;
    }

    // Start timer on first active keypress
    if (!this.isTestRunning && !this.isTestFinished) {
      this.startTest();
    }

    // Handle Backspace
    if (e.key === 'Backspace') {
      e.preventDefault();
      if (this.currentIndex > 0) {
        this.currentIndex--;
        this.typedChars[this.currentIndex] = null;
        this.updateCharDisplay(this.currentIndex);
        this.sound.playKey();
        this.updateLiveMetrics();
      }
      return;
    }

    // Only accept single character keys
    if (e.key.length !== 1) return;

    this.totalKeystrokes++;
    const expectedChar = this.targetText[this.currentIndex];
    const typedChar = e.key;
    const isCorrect = typedChar === expectedChar;

    if (isCorrect) {
      if (typedChar === ' ') {
        this.sound.playSpace();
      } else {
        this.sound.playKey();
      }
    } else {
      this.errorsCount++;
      this.sound.playError();
    }

    this.typedChars[this.currentIndex] = {
      typed: typedChar,
      expected: expectedChar,
      isCorrect: isCorrect
    };

    this.currentIndex++;
    this.updateCharDisplay(this.currentIndex - 1);

    // Check if test reached end
    if (this.currentIndex >= this.targetText.length) {
      this.finishTest();
    } else {
      this.updateLiveMetrics();
    }
  }

  updateCharDisplay(modifiedIndex) {
    const charSpans = this.dom.passageText.children;

    // Update modified span
    if (charSpans[modifiedIndex]) {
      const item = this.typedChars[modifiedIndex];
      const span = charSpans[modifiedIndex];
      span.className = 'char';

      if (item === null) {
        span.classList.add('char-pending');
      } else if (item.isCorrect) {
        span.classList.add('char-correct');
      } else {
        span.classList.add('char-error');
      }
    }

    // Update current cursor indicator
    for (let i = 0; i < charSpans.length; i++) {
      charSpans[i].classList.remove('char-current');
      if (i === this.currentIndex && !this.isTestFinished) {
        charSpans[i].classList.add('char-current');
        // Scroll into view if long passage
        charSpans[i].scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
    }
  }

  startTest() {
    this.isTestRunning = true;
    this.startTime = Date.now();
    this.dom.clickPrompt.classList.add('hidden');

    this.timerInterval = setInterval(() => {
      this.updateLiveMetrics();
    }, 100);
  }

  updateLiveMetrics() {
    if (!this.startTime) return;

    const elapsedSeconds = Math.max(0.1, (Date.now() - this.startTime) / 1000);
    const elapsedMinutes = elapsedSeconds / 60;

    // Time formatting
    const mins = Math.floor(elapsedSeconds / 60);
    const secs = Math.floor(elapsedSeconds % 60);
    this.dom.valTime.textContent = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;

    // Characters counts
    let correctCount = 0;
    let incorrectCount = 0;
    for (let i = 0; i < this.currentIndex; i++) {
      if (this.typedChars[i]?.isCorrect) {
        correctCount++;
      } else if (this.typedChars[i]) {
        incorrectCount++;
      }
    }

    // Gross WPM: (Total characters typed / 5) / time in minutes
    const grossWpm = Math.round((this.currentIndex / 5) / elapsedMinutes);

    // Net WPM: (Correct characters / 5) / time in minutes
    const netWpm = Math.max(0, Math.round((correctCount / 5) / elapsedMinutes));

    // Accuracy: (Correct characters / Total typed characters) * 100
    const accuracy = this.currentIndex > 0
      ? ((correctCount / this.currentIndex) * 100).toFixed(1)
      : '100.0';

    // CPM: Characters Per Minute
    const cpm = Math.round(this.currentIndex / elapsedMinutes);

    // Update DOM
    this.dom.valNetWpm.textContent = netWpm;
    this.dom.valGrossWpm.textContent = grossWpm;
    this.dom.valAccuracy.textContent = `${accuracy}%`;
    this.dom.valCpm.textContent = cpm;
    this.dom.valErrors.textContent = this.errorsCount;
  }

  finishTest() {
    this.isTestRunning = false;
    this.isTestFinished = true;
    clearInterval(this.timerInterval);

    this.sound.playSuccess();

    const elapsedSeconds = Math.max(0.5, (Date.now() - this.startTime) / 1000);
    const elapsedMinutes = elapsedSeconds / 60;

    let correctCount = 0;
    for (let i = 0; i < this.currentIndex; i++) {
      if (this.typedChars[i]?.isCorrect) correctCount++;
    }

    const grossWpm = Math.round((this.currentIndex / 5) / elapsedMinutes);
    const netWpm = Math.max(0, Math.round((correctCount / 5) / elapsedMinutes));
    const accuracy = this.currentIndex > 0 ? ((correctCount / this.currentIndex) * 100).toFixed(1) : '100.0';
    const cpm = Math.round(this.currentIndex / elapsedMinutes);

    const mins = Math.floor(elapsedSeconds / 60);
    const secs = Math.floor(elapsedSeconds % 60);
    const formattedTime = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;

    // Rating determination
    let tier = {
      name: 'Beginner',
      className: 'rank-beginner',
      desc: 'Keep practicing! With consistent daily finger placement and touch typing, your speed will rapidly improve.'
    };

    if (netWpm >= 100) {
      tier = {
        name: 'Godspeed Typist',
        className: 'rank-godspeed',
        desc: 'Phenomenal! You are in the top 1% of typists worldwide with lightning-fast neurological reflexes.'
      };
    } else if (netWpm >= 80) {
      tier = {
        name: 'Master Typist',
        className: 'rank-master',
        desc: 'Mastery achieved! Flawless rhythm and high-velocity touch typing put you in elite territory.'
      };
    } else if (netWpm >= 55) {
      tier = {
        name: 'Pro Typist',
        className: 'rank-pro',
        desc: 'Impressive typing speed! Your muscle memory is well tuned, exceeding average workplace standards.'
      };
    } else if (netWpm >= 35) {
      tier = {
        name: 'Average Typist',
        className: 'rank-average',
        desc: 'Solid baseline. Focus on maintaining a steady rhythm and minimizing backspaces to reach pro tiers.'
      };
    }

    // Populate Results Modal
    this.dom.finalNetWpm.textContent = `${netWpm} WPM`;
    this.dom.rankBadge.className = `rank-badge ${tier.className}`;
    this.dom.rankName.textContent = tier.name;
    this.dom.rankDescription.textContent = tier.desc;

    this.dom.resGrossWpm.textContent = grossWpm;
    this.dom.resAccuracy.textContent = `${accuracy}%`;
    this.dom.resCpm.textContent = cpm;
    this.dom.resTime.textContent = formattedTime;
    this.dom.resErrors.textContent = this.errorsCount;
    this.dom.resChars.textContent = this.totalKeystrokes;

    this.dom.resultsCard.classList.add('show');
    this.dom.resultsCard.scrollIntoView({ behavior: 'smooth' });
  }

  resetTest() {
    clearInterval(this.timerInterval);
    this.isTestRunning = false;
    this.isTestFinished = false;
    this.startTime = null;
    this.currentIndex = 0;
    this.errorsCount = 0;
    this.totalKeystrokes = 0;
    this.typedChars = [];

    this.dom.valNetWpm.textContent = '0';
    this.dom.valGrossWpm.textContent = '0';
    this.dom.valAccuracy.textContent = '100%';
    this.dom.valCpm.textContent = '0';
    this.dom.valTime.textContent = '00:00';
    this.dom.valErrors.textContent = '0';

    this.dom.resultsCard.classList.remove('show');
    this.renderPassage();
    this.dom.typingInput.value = '';
    this.dom.typingInput.focus();
  }

  copySummary() {
    const summary = `⌨️ WPM Calculator Result:
Net Speed: ${this.dom.finalNetWpm.textContent}
Accuracy: ${this.dom.resAccuracy.textContent}
Gross Speed: ${this.dom.resGrossWpm.textContent} WPM
CPM: ${this.dom.resCpm.textContent}
Time: ${this.dom.resTime.textContent}
Rank: ${this.dom.rankName.textContent}
Tested on ALL IN ONE Typing Tools`;

    navigator.clipboard.writeText(summary).then(() => {
      const orig = this.dom.btnCopyResult.textContent;
      this.dom.btnCopyResult.textContent = 'Copied to Clipboard!';
      setTimeout(() => {
        this.dom.btnCopyResult.textContent = orig;
      }, 2000);
    });
  }
}

// Initialize on DOM ready
document.addEventListener('DOMContentLoaded', () => {
  new WPMCalculatorApp();
});