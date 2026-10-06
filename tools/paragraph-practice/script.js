/**
 * Paragraph Practice - Complete Client-Side Logic
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
      osc.frequency.setValueAtTime(450, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(130, this.ctx.currentTime + 0.035);
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
      osc.frequency.setValueAtTime(160, this.ctx.currentTime);
      gain.gain.setValueAtTime(0.12, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.1);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();
      osc.stop(this.ctx.currentTime + 0.1);
    } catch {
      // Ignore
    }
  }
}

const PARAGRAPHS = {
  literature: [
    {
      id: 'pride-prejudice',
      title: 'Pride and Prejudice',
      author: 'Jane Austen',
      difficulty: 'Classic',
      text: 'It is a truth universally acknowledged, that a single man in possession of a good fortune, must be in want of a wife. However little known the feelings or views of such a man may be on his first entering a neighbourhood, this truth is so well fixed in the minds of the surrounding families, that he is considered the rightful property of some one or other of their daughters.'
    },
    {
      id: 'sherlock-holmes',
      title: 'A Scandal in Bohemia',
      author: 'Arthur Conan Doyle',
      difficulty: 'Classic',
      text: 'To Sherlock Holmes she is always THE woman. I have seldom heard him mention her under any other name. In his eyes she eclipses and predominates the whole of her sex. It was not that he felt any emotion akin to love for Irene Adler. All emotions, and that one particularly, were abhorrent to his cold, precise but admirably balanced mind.'
    },
    {
      id: 'great-gatsby',
      title: 'The Great Gatsby',
      author: 'F. Scott Fitzgerald',
      difficulty: 'Masterwork',
      text: "Gatsby believed in the green light, the orgastic future that year by year recedes before us. It eluded us then, but that's no matter—to-morrow we will run faster, stretch out our arms farther. And one fine morning— So we beat on, boats against the current, borne back ceaselessly into the past."
    },
    {
      id: 'moby-dick',
      title: 'Moby-Dick',
      author: 'Herman Melville',
      difficulty: 'Classic',
      text: 'Call me Ishmael. Some years ago—never mind how long precisely—having little or no money in my purse, and nothing particular to interest me on shore, I thought I would sail about a little and see the watery part of the world. It is a way I have of driving off the spleen and regulating the circulation.'
    }
  ],

  tech: [
    {
      id: 'microfrontends-edge',
      title: 'Modern Web Architecture',
      author: 'Engineering Review',
      difficulty: 'Technical',
      text: 'Modern web systems decompose monolithic user interfaces into isolated microfrontends deployed to regional edge nodes. By executing rendering pipelines closer to end clients, applications reduce latency, isolate deployment failures, and enable concurrent multidisciplinary engineering sprints across distributed serverless runtimes.'
    },
    {
      id: 'ai-nlp-frontier',
      title: 'Artificial Intelligence Frontier',
      author: 'Research Journal',
      difficulty: 'Advanced',
      text: 'Recent breakthroughs in transformer neural architectures demonstrate profound zero-shot synthesis across natural language tasks. By parameterizing deep contextual semantics across vast corpora, probabilistic language models generalize reasoning primitives, synthesize code logic, and interface seamlessly with human intent.'
    },
    {
      id: 'quantum-shift',
      title: 'Quantum Computing Paradigm',
      author: 'Physics & Computing',
      difficulty: 'Advanced',
      text: 'Quantum computing fundamentally departs from classical boolean computation by exploiting coherent quantum superposition and entanglement. Rather than processing binary bits through deterministic logic gates, quantum processors manipulate multi-qubit wavefunctions, solving intractable combinatorial optimization problems with exponential speedup.'
    }
  ],

  motivational: [
    {
      id: 'deep-work',
      title: 'The Art of Deliberate Practice',
      author: 'Focus & Productivity',
      difficulty: 'Inspirational',
      text: 'Real mastery requires deliberate, undistracted immersion in activities that press right against the outer periphery of your present competence. When you shield your consciousness from superficial interruptions, your neural circuits consolidate focus, transforming raw repetition into fluid, instinctive mastery.'
    },
    {
      id: 'resilience-effort',
      title: 'Resilience and Continuous Effort',
      author: 'Mindset & Grit',
      difficulty: 'Inspirational',
      text: 'Strength is forged not during smooth sailing, but amidst relentless friction. Progress is rarely linear; it accumulates in the quiet minutes when nobody is watching. Each steady keystroke, each deliberate correction of an error, compounds into unwavering confidence and immovable mental discipline.'
    },
    {
      id: 'flow-state',
      title: 'Cultivating the Flow State',
      author: 'Performance Psychology',
      difficulty: 'Inspirational',
      text: 'The optimal state of human engagement occurs when challenge meets capability in perfect equilibrium. In the zone of effortless concentration, self-consciousness dissolves and temporal awareness bends. What begins as mechanical practice transcends into an immersive dance of pure rhythm and focused clarity.'
    }
  ]
};

class ParagraphPracticeApp {
  constructor() {
    this.sound = new AudioFX();
    this.genre = 'literature';
    this.currentPassage = null;

    this.promptText = '';
    this.currentIndex = 0;
    this.userKeystrokes = 0;
    this.correctKeystrokes = 0;
    this.mistakesCount = 0;

    this.timer = null;
    this.chartTimer = null;
    this.startTime = null;
    this.elapsedSeconds = 0;
    this.isActive = false;
    this.isCompleted = false;

    // Stamina tracking
    this.staminaHistory = []; // Array of { time, wpm }
    this.staminaScore = 100;

    this.dom = {};
  }

  init() {
    this.cacheDOMElements();
    this.bindEvents();
    this.populatePassageSelect();
    this.loadPassage(PARAGRAPHS.literature[0]);
    this.setupCanvas();
  }

  cacheDOMElements() {
    this.dom.passageSelect = document.getElementById('passageSelect');
    this.dom.passageTitleDisplay = document.getElementById('passageTitleDisplay');
    this.dom.passageAuthorDisplay = document.getElementById('passageAuthorDisplay');
    this.dom.difficultyBadge = document.getElementById('difficultyBadge');
    this.dom.metaWordsCount = document.getElementById('metaWordsCount');

    this.dom.progressBarFill = document.getElementById('progressBarFill');
    this.dom.progressPercent = document.getElementById('progressPercent');

    this.dom.statNetWpm = document.getElementById('statNetWpm');
    this.dom.statAccuracy = document.getElementById('statAccuracy');
    this.dom.statStamina = document.getElementById('statStamina');
    this.dom.statErrors = document.getElementById('statErrors');
    this.dom.statTimer = document.getElementById('statTimer');
    this.dom.statWordsLeft = document.getElementById('statWordsLeft');

    this.dom.typingStage = document.getElementById('typingStage');
    this.dom.promptDisplay = document.getElementById('promptDisplay');
    this.dom.hiddenInput = document.getElementById('hiddenInput');
    this.dom.focusNotice = document.getElementById('focusNotice');
    this.dom.focusNoticeText = document.getElementById('focusNoticeText');

    this.dom.staminaCanvas = document.getElementById('staminaCanvas');
    this.dom.soundToggleBtn = document.getElementById('soundToggleBtn');
    this.dom.restartBtn = document.getElementById('restartBtn');

    // Modal
    this.dom.resultsModal = document.getElementById('resultsModal');
    this.dom.resultsBadge = document.getElementById('resultsBadge');
    this.dom.finalNetWpm = document.getElementById('finalNetWpm');
    this.dom.finalAccuracy = document.getElementById('finalAccuracy');
    this.dom.finalStamina = document.getElementById('finalStamina');
    this.dom.finalTime = document.getElementById('finalTime');
    this.dom.modalStaminaNarrative = document.getElementById('modalStaminaNarrative');
    this.dom.modalRetryBtn = document.getElementById('modalRetryBtn');
    this.dom.modalNextBtn = document.getElementById('modalNextBtn');
  }

  populatePassageSelect() {
    const list = PARAGRAPHS[this.genre] || PARAGRAPHS.literature;
    this.dom.passageSelect.innerHTML = '';
    list.forEach((p, idx) => {
      const opt = document.createElement('option');
      opt.value = p.id;
      opt.textContent = `${p.title} (${p.author})`;
      this.dom.passageSelect.appendChild(opt);
    });
  }

  bindEvents() {
    // Genre tabs
    document.querySelectorAll('[data-genre]').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('[data-genre]').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        this.genre = btn.dataset.genre;
        this.populatePassageSelect();
        const list = PARAGRAPHS[this.genre];
        this.loadPassage(list[0]);
      });
    });

    // Select change
    this.dom.passageSelect.addEventListener('change', (e) => {
      const list = PARAGRAPHS[this.genre];
      const match = list.find(p => p.id === e.target.value);
      if (match) this.loadPassage(match);
    });

    // Sound toggle
    this.dom.soundToggleBtn.addEventListener('click', () => {
      this.sound.enabled = !this.sound.enabled;
      this.dom.soundToggleBtn.textContent = this.sound.enabled ? '🔊 Sound: ON' : '🔇 Sound: OFF';
    });

    // Restart button
    this.dom.restartBtn.addEventListener('click', () => {
      this.resetDrill();
    });

    // Focus handling
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

    // Modal Actions
    this.dom.modalRetryBtn.addEventListener('click', () => {
      this.dom.resultsModal.classList.remove('is-active');
      this.resetDrill();
    });

    this.dom.modalNextBtn.addEventListener('click', () => {
      this.dom.resultsModal.classList.remove('is-active');
      this.advanceToNextPassage();
    });

    window.addEventListener('resize', () => {
      this.setupCanvas();
      this.drawStaminaChart();
    });
  }

  loadPassage(passage) {
    this.currentPassage = passage;
    this.promptText = passage.text;

    this.dom.passageTitleDisplay.textContent = passage.title;
    this.dom.passageAuthorDisplay.textContent = `by ${passage.author}`;
    this.dom.difficultyBadge.textContent = passage.difficulty;

    const words = passage.text.split(' ').length;
    this.dom.metaWordsCount.textContent = `${words} words`;

    this.dom.passageSelect.value = passage.id;
    this.resetDrill();
  }

  advanceToNextPassage() {
    const list = PARAGRAPHS[this.genre];
    const currIdx = list.findIndex(p => p.id === this.currentPassage.id);
    const nextIdx = (currIdx + 1) % list.length;
    this.loadPassage(list[nextIdx]);
  }

  resetDrill() {
    clearInterval(this.timer);
    clearInterval(this.chartTimer);
    this.timer = null;
    this.chartTimer = null;
    this.startTime = null;
    this.elapsedSeconds = 0;
    this.currentIndex = 0;
    this.userKeystrokes = 0;
    this.correctKeystrokes = 0;
    this.mistakesCount = 0;
    this.isActive = false;
    this.isCompleted = false;

    this.staminaHistory = [];
    this.staminaScore = 100;

    this.renderPrompt();
    this.updateStats();
    this.updateProgress();
    this.drawStaminaChart();

    this.dom.statTimer.textContent = '0s';
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

    // Sample WPM every 2 seconds for stamina chart
    this.chartTimer = setInterval(() => {
      const elapsedMinutes = Math.max(1 / 60, this.elapsedSeconds / 60);
      const netWpm = Math.max(0, Math.round(((this.correctKeystrokes / 5) - (this.mistakesCount / 5)) / elapsedMinutes));
      this.staminaHistory.push({ time: this.elapsedSeconds, wpm: netWpm });
      this.calculateStamina();
      this.drawStaminaChart();
    }, 2000);
  }

  handleKeystroke(e) {
    if (this.currentIndex >= this.promptText.length) {
      this.finishPassage();
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
        this.updateProgress();
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

    const span = this.dom.promptDisplay.children[this.currentIndex];
    span.classList.remove('current');

    if (isCorrect) {
      span.classList.add('correct');
      this.correctKeystrokes++;
      this.sound.playClick();
    } else {
      span.classList.add('incorrect');
      this.mistakesCount++;
      this.sound.playError();
    }

    this.currentIndex++;

    if (span.offsetTop > this.dom.typingStage.clientHeight / 2) {
      span.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }

    if (this.currentIndex < this.promptText.length) {
      const nextSpan = this.dom.promptDisplay.children[this.currentIndex];
      nextSpan.classList.add('current');
    } else {
      this.finishPassage();
      return;
    }

    this.updateProgress();
    this.updateStats();
  }

  updateProgress() {
    const total = this.promptText.length;
    const percent = total > 0 ? Math.round((this.currentIndex / total) * 100) : 0;
    this.dom.progressBarFill.style.width = `${percent}%`;
    this.dom.progressPercent.textContent = `${percent}%`;

    const remainingText = this.promptText.slice(this.currentIndex);
    const wordsLeft = remainingText.trim().length > 0 ? remainingText.trim().split(/\s+/).length : 0;
    this.dom.statWordsLeft.textContent = `${wordsLeft} words left`;
  }

  updateStats() {
    const elapsedMinutes = Math.max(1 / 60, (this.elapsedSeconds || 1) / 60);
    const netWpm = Math.max(0, Math.round(((this.correctKeystrokes / 5) - (this.mistakesCount / 5)) / elapsedMinutes));
    const accuracy = this.userKeystrokes > 0
      ? Math.round((this.correctKeystrokes / this.userKeystrokes) * 100)
      : 100;

    this.dom.statNetWpm.textContent = isNaN(netWpm) ? '0' : `${netWpm}`;
    this.dom.statAccuracy.textContent = `${accuracy}%`;
    this.dom.statErrors.textContent = `${this.mistakesCount}`;
    this.dom.statStamina.textContent = `${this.staminaScore}%`;
  }

  calculateStamina() {
    if (this.staminaHistory.length < 4) {
      this.staminaScore = 100;
      return;
    }

    // Compare average of first half vs second half
    const half = Math.floor(this.staminaHistory.length / 2);
    const firstHalf = this.staminaHistory.slice(0, half);
    const secondHalf = this.staminaHistory.slice(half);

    const avg1 = firstHalf.reduce((sum, item) => sum + item.wpm, 0) / firstHalf.length;
    const avg2 = secondHalf.reduce((sum, item) => sum + item.wpm, 0) / secondHalf.length;

    if (avg1 <= 5) {
      this.staminaScore = 100;
      return;
    }

    // Ratio of pace maintained (or even accelerated)
    const ratio = avg2 / avg1;
    // Normalize: 1.0 -> 100%, 0.8 -> 80%
    const score = Math.min(100, Math.max(50, Math.round(ratio * 100)));
    this.staminaScore = score;
    this.dom.statStamina.textContent = `${this.staminaScore}%`;
  }

  setupCanvas() {
    const canvas = this.dom.staminaCanvas;
    const rect = canvas.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    const ctx = canvas.getContext('2d');
    ctx.scale(dpr, dpr);
  }

  drawStaminaChart() {
    const canvas = this.dom.staminaCanvas;
    const ctx = canvas.getContext('2d');
    const width = canvas.getBoundingClientRect().width;
    const height = canvas.getBoundingClientRect().height;

    ctx.clearRect(0, 0, width, height);

    // Subtle background grid
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
    ctx.lineWidth = 1;

    for (let y = 20; y < height; y += 30) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }

    if (this.staminaHistory.length < 2) {
      // Empty state guidance text
      ctx.fillStyle = 'rgba(150, 160, 180, 0.4)';
      ctx.font = '12px Inter, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('Live speed consistency chart will render as you type...', width / 2, height / 2 + 4);
      return;
    }

    const data = this.staminaHistory;
    const maxWpm = Math.max(60, ...data.map(d => d.wpm));
    const padX = 20;
    const padY = 15;
    const usableW = width - padX * 2;
    const usableH = height - padY * 2;

    const points = data.map((d, i) => {
      const x = padX + (i / (data.length - 1)) * usableW;
      const y = height - padY - (d.wpm / maxWpm) * usableH;
      return { x, y, wpm: d.wpm };
    });

    // Draw area gradient
    const grad = ctx.createLinearGradient(0, 0, 0, height);
    grad.addColorStop(0, 'rgba(78, 133, 191, 0.35)');
    grad.addColorStop(1, 'rgba(78, 133, 191, 0.0)');

    ctx.beginPath();
    ctx.moveTo(points[0].x, height - padY);
    points.forEach(p => ctx.lineTo(p.x, p.y));
    ctx.lineTo(points[points.length - 1].x, height - padY);
    ctx.closePath();
    ctx.fillStyle = grad;
    ctx.fill();

    // Draw sparkline stroke
    ctx.beginPath();
    ctx.strokeStyle = '#4e85bf';
    ctx.lineWidth = 2.5;
    points.forEach((p, idx) => {
      if (idx === 0) ctx.moveTo(p.x, p.y);
      else ctx.lineTo(p.x, p.y);
    });
    ctx.stroke();

    // Draw dot on current last point
    const lastP = points[points.length - 1];
    ctx.beginPath();
    ctx.arc(lastP.x, lastP.y, 4, 0, Math.PI * 2);
    ctx.fillStyle = '#ffffff';
    ctx.fill();
    ctx.strokeStyle = '#4e85bf';
    ctx.lineWidth = 2;
    ctx.stroke();
  }

  finishPassage() {
    if (this.isCompleted) return;
    this.isCompleted = true;
    clearInterval(this.timer);
    clearInterval(this.chartTimer);

    const durationSec = Math.max(1, this.elapsedSeconds);
    const elapsedMinutes = durationSec / 60;
    const netWpm = Math.max(0, Math.round(((this.correctKeystrokes / 5) - (this.mistakesCount / 5)) / elapsedMinutes));
    const accuracy = this.userKeystrokes > 0
      ? Math.round((this.correctKeystrokes / this.userKeystrokes) * 100)
      : 100;

    this.calculateStamina();

    let badge = '★ Bronze Stamina';
    let narrative = 'Good run! As you practice longer texts, focus on pacing yourself smoothly from start to finish.';

    if (netWpm >= 75 && accuracy >= 96 && this.staminaScore >= 90) {
      badge = '💎 Diamond Endurance';
      narrative = 'Sensational mastery! You maintained high-velocity typing with extraordinary endurance and flawless stamina.';
    } else if (netWpm >= 55 && accuracy >= 93 && this.staminaScore >= 85) {
      badge = '🥇 Platinum Consistency';
      narrative = 'Impressive rhythmic pacing. Your typing speed stayed stable across the entire prose passage without signs of fatigue.';
    } else if (netWpm >= 40 && accuracy >= 90) {
      badge = '🥈 Gold Stamina';
      narrative = 'Solid long-form typing session. Minimal speed drop detected across the concluding sentences.';
    }

    this.dom.resultsBadge.textContent = badge;
    this.dom.finalNetWpm.textContent = `${netWpm}`;
    this.dom.finalAccuracy.textContent = `${accuracy}%`;
    this.dom.finalStamina.textContent = `${this.staminaScore}%`;
    this.dom.finalTime.textContent = `${durationSec}s`;
    this.dom.modalStaminaNarrative.textContent = narrative;

    this.dom.resultsModal.classList.add('is-active');
  }
}

document.addEventListener('DOMContentLoaded', () => {
  const app = new ParagraphPracticeApp();
  app.init();
});