// Typing Race - 2D Track Racer vs AI Engine

const RACE_TEXTS = {
  racing: [
    "Engines roar as the cyber neon lights flicker across the asphalt speedway. Drivers grip their steering wheels with unyielding focus as the countdown lights drop. Nitro boost supercharges the turbine as the lead vehicle cuts sharply through the first apex turn. Precision and swift reflexes separate legendary champions from trailing dust.",
    "The green flag drops and lightning speed electrifies the circuit. Aerodynamic downforce pins the chassis to the ground while high octane fuel powers the turbocharged cylinder blocks. Every microsecond matters when shifting through hairpin turns and overtaking rival speedsters down the straightaway.",
    "Accelerate beyond the sound barrier where velocity meets pure adrenaline. The rev counter hits redline as spark plugs ignite and twin exhausts erupt in cyan flame. Keep both hands locked onto the wheel, maintain absolute throttle discipline, and conquer the checkered flag."
  ],
  literature: [
    "It was the best of times, it was the worst of times, it was the age of wisdom, it was the age of foolishness, it was the epoch of belief, it was the epoch of incredulity, it was the season of light, it was the season of darkness, it was the spring of hope, it was the winter of despair.",
    "Call me Ishmael. Some years ago, never mind how long precisely, having little or no money in my purse, and nothing particular to interest me on shore, I thought I would sail about a little and see the watery part of the world. It is a way I have of driving off the spleen and regulating the circulation.",
    "The mystery of life isn't a problem to solve, but a reality to experience. A process cannot be understood by stopping it. We must move with the flow of the process, we must join it, and we must flow with the current of life itself."
  ],
  tech: [
    "Simplicity is prerequisite for reliability. Programs must be written for people to read, and only incidentally for machines to execute. The clean developer knows that writing clean architecture is about crafting code that is easy to understand, testable, and resilient against unexpected production failures.",
    "Abstraction eliminates the irrelevant and amplifies the essential. In modular system engineering, microservices encapsulate state and communicate through well defined contracts. When distributed dependencies remain decoupled, latency spikes are minimized and throughput scales gracefully.",
    "Algorithms dictate the rhythm of modern computational networks. From binary search trees to distributed consensus protocols, optimal data structures reduce complexity and enable real time interactions across millions of concurrent users globally."
  ],
  quotes: [
    "Success is not final, failure is not fatal: it is the courage to continue that counts. The future belongs to those who believe in the beauty of their dreams. In the middle of every difficulty lies hidden opportunity.",
    "Do not go where the path may lead, go instead where there is no path and leave a trail. Believe you can and you are halfway there. The only limit to our realization of tomorrow will be our doubts of today.",
    "Energy and persistence conquer all obstacles. Strive not to be a success, but rather to be of value. Great things are done by a series of small things brought together through unwavering dedication."
  ]
};

// Web Audio Synthesizer
class SoundManager {
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

  playKey(isError = false) {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;
    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      if (isError) {
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(160, now);
        osc.frequency.exponentialRampToValueAtTime(70, now + 0.1);
        gain.gain.setValueAtTime(0.1, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.1);
      } else {
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(500 + Math.random() * 80, now);
        osc.frequency.exponentialRampToValueAtTime(140, now + 0.04);
        gain.gain.setValueAtTime(0.05, now);
        gain.gain.exponentialRampToValueAtTime(0.005, now + 0.04);
      }

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + (isError ? 0.1 : 0.04));
    } catch (_) {}
  }

  playBeep(isHigh = false) {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;
    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(isHigh ? 880 : 440, now);
      gain.gain.setValueAtTime(0.12, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + (isHigh ? 0.4 : 0.2));
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + (isHigh ? 0.4 : 0.2));
    } catch (_) {}
  }

  playNitro() {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;
    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(220, now);
      osc.frequency.exponentialRampToValueAtTime(750, now + 0.35);
      gain.gain.setValueAtTime(0.1, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.35);
    } catch (_) {}
  }

  playVictory() {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;
    try {
      const notes = [523.25, 659.25, 783.99, 1046.50];
      const now = this.ctx.currentTime;
      notes.forEach((freq, i) => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, now + i * 0.12);
        gain.gain.setValueAtTime(0.1, now + i * 0.12);
        gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.12 + 0.3);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(now + i * 0.12);
        osc.stop(now + i * 0.12 + 0.3);
      });
    } catch (_) {}
  }
}

// Particle Confetti Generator
class ConfettiCannon {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.particles = [];
    this.animId = null;
    this.resize();
    window.addEventListener('resize', () => this.resize());
  }

  resize() {
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
  }

  fire() {
    this.particles = [];
    const colors = ['#38bdf8', '#eab308', '#ef4444', '#10b981', '#a855f7', '#f43f5e', '#fff'];
    for (let i = 0; i < 150; i++) {
      this.particles.push({
        x: this.canvas.width / 2 + (Math.random() * 200 - 100),
        y: this.canvas.height / 2 + 50,
        vx: (Math.random() - 0.5) * 18,
        vy: -Math.random() * 16 - 5,
        size: Math.random() * 8 + 4,
        color: colors[Math.floor(Math.random() * colors.length)],
        rotation: Math.random() * 360,
        vRot: (Math.random() - 0.5) * 10,
        life: 1
      });
    }

    if (this.animId) cancelAnimationFrame(this.animId);
    this.animate();
  }

  animate() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    let alive = false;
    for (const p of this.particles) {
      p.x += p.vx;
      p.y += p.vy;
      p.vy += 0.4; // gravity
      p.vx *= 0.98;
      p.rotation += p.vRot;
      p.life -= 0.007;

      if (p.life > 0) {
        alive = true;
        this.ctx.save();
        this.ctx.translate(p.x, p.y);
        this.ctx.rotate((p.rotation * Math.PI) / 180);
        this.ctx.fillStyle = p.color;
        this.ctx.globalAlpha = Math.max(0, p.life);
        this.ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 1.5);
        this.ctx.restore();
      }
    }

    if (alive) {
      this.animId = requestAnimationFrame(() => this.animate());
    } else {
      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }
  }
}

// Typing Race Game
class TypingRaceGame {
  constructor() {
    this.sound = new SoundManager();
    this.confetti = new ConfettiCannon(document.getElementById('confettiCanvas'));

    // Config
    this.wordLengthTarget = 25;
    this.category = 'racing';

    // State
    this.status = 'idle'; // idle, counting, racing, finished
    this.targetText = '';
    this.words = [];
    this.charElements = [];
    this.currentCharIndex = 0;
    this.totalTypedChars = 0;
    this.correctChars = 0;
    this.errorCount = 0;
    this.currentStreak = 0;
    this.maxStreak = 0;
    this.nitroActive = false;
    this.nitroThreshold = 15;

    // Timers & Stats
    this.startTime = null;
    this.finishTime = null;
    this.raceTimerInterval = null;

    // AI Bots
    this.bots = [
      { id: 'bot1', name: 'Nova', targetWpm: 35, progress: 0, finished: false, finishTime: null, currentWpm: 35 },
      { id: 'bot2', name: 'Vector', targetWpm: 60, progress: 0, finished: false, finishTime: null, currentWpm: 60 },
      { id: 'bot3', name: 'Phantom', targetWpm: 95, progress: 0, finished: false, finishTime: null, currentWpm: 95 }
    ];

    // DOM Elements
    this.initDom();
    this.bindEvents();
    this.prepareNewRace();
  }

  initDom() {
    this.wordsBoard = document.getElementById('wordsBoard');
    this.wordsWrapper = document.getElementById('wordsWrapper');
    this.hiddenInput = document.getElementById('hiddenTypingInput');
    this.countdownOverlay = document.getElementById('countdownOverlay');
    this.countdownNumber = document.getElementById('countdownNumber');
    this.startRaceBtn = document.getElementById('startRaceBtn');
    this.soundToggleBtn = document.getElementById('soundToggleBtn');
    this.categorySelect = document.getElementById('raceCategorySelect');

    // HUD Elements
    this.hudRank = document.getElementById('hudRank');
    this.hudLeadDiff = document.getElementById('hudLeadDiff');
    this.hudWpm = document.getElementById('hudWpm');
    this.hudRawWpm = document.getElementById('hudRawWpm');
    this.hudAccuracy = document.getElementById('hudAccuracy');
    this.hudErrors = document.getElementById('hudErrors');
    this.hudStreak = document.getElementById('hudStreak');
    this.nitroMeterFill = document.getElementById('nitroMeterFill');
    this.hudTimer = document.getElementById('hudTimer');
    this.hudProgress = document.getElementById('hudProgress');

    // Car and Lanes
    this.carPlayer = document.getElementById('car-player');
    this.lanePlayer = document.getElementById('lane-player');
    this.cars = {
      player: this.carPlayer,
      bot1: document.getElementById('car-bot1'),
      bot2: document.getElementById('car-bot2'),
      bot3: document.getElementById('car-bot3')
    };

    // Modal
    this.podiumModal = document.getElementById('podiumModal');
    this.modalRematchBtn = document.getElementById('modalRematchBtn');
    this.modalCloseBtn = document.getElementById('modalCloseBtn');
  }

  bindEvents() {
    // Length selection buttons
    document.querySelectorAll('.race-pill-btn[data-length]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        if (this.status === 'racing' || this.status === 'counting') return;
        document.querySelectorAll('.race-pill-btn[data-length]').forEach(b => b.classList.remove('active'));
        e.currentTarget.classList.add('active');
        this.wordLengthTarget = parseInt(e.currentTarget.dataset.length, 10);
        this.prepareNewRace();
      });
    });

    this.categorySelect.addEventListener('change', (e) => {
      if (this.status === 'racing' || this.status === 'counting') return;
      this.category = e.target.value;
      this.prepareNewRace();
    });

    this.soundToggleBtn.addEventListener('click', () => {
      this.sound.enabled = !this.sound.enabled;
      this.soundToggleBtn.querySelector('span').textContent = `Sound: ${this.sound.enabled ? 'ON' : 'OFF'}`;
      this.soundToggleBtn.innerHTML = `${this.sound.enabled ? '🔊' : '🔇'} <span>Sound: ${this.sound.enabled ? 'ON' : 'OFF'}</span>`;
    });

    this.startRaceBtn.addEventListener('click', () => {
      if (this.status === 'racing' || this.status === 'counting') {
        this.resetRace();
      } else {
        this.startCountdown();
      }
    });

    this.wordsBoard.addEventListener('click', () => {
      this.hiddenInput.focus();
    });

    this.hiddenInput.addEventListener('input', (e) => this.handleTypingInput(e));
    this.hiddenInput.addEventListener('keydown', (e) => this.handleKeyDown(e));

    this.modalRematchBtn.addEventListener('click', () => {
      this.podiumModal.classList.remove('active');
      this.startCountdown();
    });

    this.modalCloseBtn.addEventListener('click', () => {
      this.podiumModal.classList.remove('active');
    });
  }

  prepareNewRace() {
    this.resetStats();
    this.buildTargetText();
    this.renderWords();
    this.updateTrackPositions(0, 0, 0, 0);
    this.updateRankings();
    this.updateHud();
  }

  resetStats() {
    if (this.raceTimerInterval) {
      clearInterval(this.raceTimerInterval);
      this.raceTimerInterval = null;
    }
    this.status = 'idle';
    this.startRaceBtn.textContent = '🏁 Start Race';
    this.currentCharIndex = 0;
    this.totalTypedChars = 0;
    this.correctChars = 0;
    this.errorCount = 0;
    this.currentStreak = 0;
    this.maxStreak = 0;
    this.nitroActive = false;
    this.startTime = null;
    this.finishTime = null;
    this.playerFinished = false;

    if (this.lanePlayer) this.lanePlayer.classList.remove('has-nitro');
    if (this.nitroMeterFill) {
      this.nitroMeterFill.classList.remove('full');
      this.nitroMeterFill.style.width = '0%';
    }

    this.bots.forEach(b => {
      b.progress = 0;
      b.finished = false;
      b.finishTime = null;
      b.currentWpm = b.targetWpm;
    });

    this.hiddenInput.value = '';
    this.hiddenInput.blur();
  }

  buildTargetText() {
    const list = RACE_TEXTS[this.category] || RACE_TEXTS.racing;
    const rawParagraph = list[Math.floor(Math.random() * list.length)];
    const wordsArray = rawParagraph.split(/\s+/);

    if (wordsArray.length > this.wordLengthTarget) {
      this.targetText = wordsArray.slice(0, this.wordLengthTarget).join(' ');
    } else {
      let repeated = wordsArray.slice();
      while (repeated.length < this.wordLengthTarget) {
        repeated = repeated.concat(wordsArray);
      }
      this.targetText = repeated.slice(0, this.wordLengthTarget).join(' ');
    }
    this.words = this.targetText.split(' ');
  }

  renderWords() {
    this.wordsWrapper.innerHTML = '';
    this.charElements = [];
    let globalCharIndex = 0;

    this.words.forEach((wordStr, wIndex) => {
      const wordSpan = document.createElement('span');
      wordSpan.className = 'word-token';

      for (let i = 0; i < wordStr.length; i++) {
        const charSpan = document.createElement('span');
        charSpan.className = 'char-token';
        charSpan.textContent = wordStr[i];
        charSpan.dataset.charIndex = globalCharIndex;
        if (globalCharIndex === 0) charSpan.classList.add('current');
        wordSpan.appendChild(charSpan);
        this.charElements.push(charSpan);
        globalCharIndex++;
      }

      // Add trailing space character if not last word
      if (wIndex < this.words.length - 1) {
        const spaceSpan = document.createElement('span');
        spaceSpan.className = 'char-token';
        spaceSpan.textContent = ' ';
        spaceSpan.dataset.charIndex = globalCharIndex;
        wordSpan.appendChild(spaceSpan);
        this.charElements.push(spaceSpan);
        globalCharIndex++;
      }

      this.wordsWrapper.appendChild(wordSpan);
    });
  }

  startCountdown() {
    this.prepareNewRace();
    this.status = 'counting';
    this.countdownOverlay.classList.add('active');

    let count = 3;
    this.countdownNumber.textContent = count;
    this.sound.playBeep(false);

    const countInterval = setInterval(() => {
      count--;
      if (count > 0) {
        this.countdownNumber.textContent = count;
        this.sound.playBeep(false);
      } else if (count === 0) {
        this.countdownNumber.textContent = 'GO!';
        this.sound.playBeep(true);
      } else {
        clearInterval(countInterval);
        this.countdownOverlay.classList.remove('active');
        this.startRace();
      }
    }, 850);
  }

  startRace() {
    this.status = 'racing';
    this.startRaceBtn.textContent = '🔄 Restart';
    this.startTime = performance.now();
    this.hiddenInput.value = '';
    this.hiddenInput.focus();

    this.raceTimerInterval = setInterval(() => {
      this.tick();
    }, 100);
  }

  resetRace() {
    this.prepareNewRace();
  }

  tick() {
    if (this.status !== 'racing') return;

    const elapsedSeconds = (performance.now() - this.startTime) / 1000;
    this.hudTimer.textContent = `${elapsedSeconds.toFixed(1)}s`;

    // Update AI Bots Progress
    const totalChars = this.targetText.length;
    let allFinished = this.playerFinished;

    this.bots.forEach(bot => {
      if (!bot.finished) {
        // Natural speed variation: jitter +/- 8 WPM
        const jitter = (Math.sin(elapsedSeconds * 2 + bot.targetWpm) * 6) + (Math.random() * 4 - 2);
        bot.currentWpm = Math.max(15, Math.round(bot.targetWpm + jitter));

        // Speed in chars per second: WPM * 5 / 60
        const charsPerSec = (bot.currentWpm * 5) / 60;
        const totalSimulatedChars = charsPerSec * elapsedSeconds;
        bot.progress = Math.min(100, (totalSimulatedChars / totalChars) * 100);

        if (bot.progress >= 100) {
          bot.finished = true;
          bot.finishTime = elapsedSeconds;
        } else {
          allFinished = false;
        }
      }
    });

    const playerProgress = (this.currentCharIndex / totalChars) * 100;
    this.updateTrackPositions(playerProgress, this.bots[0].progress, this.bots[1].progress, this.bots[2].progress);
    this.updateRankings();
    this.updateHud();

    if (this.playerFinished && allFinished) {
      this.endRace();
    }
  }

  handleKeyDown(e) {
    if (this.status !== 'racing') return;

    if (e.key === 'Backspace') {
      // Don't allow going back across words or previous correct characters
      // To ensure high-speed typing race momentum
      e.preventDefault();
    }
  }

  handleTypingInput(e) {
    if (this.status !== 'racing') return;

    const inputVal = this.hiddenInput.value;
    if (!inputVal) return;

    const typedChar = inputVal.slice(-1);
    this.hiddenInput.value = ''; // keep clean

    const targetChar = this.targetText[this.currentCharIndex];

    this.totalTypedChars++;

    if (typedChar === targetChar) {
      // Correct keystroke
      this.correctChars++;
      this.currentStreak++;
      if (this.currentStreak > this.maxStreak) this.maxStreak = this.currentStreak;

      this.sound.playKey(false);

      if (this.charElements[this.currentCharIndex]) {
        this.charElements[this.currentCharIndex].className = 'char-token correct';
      }

      this.currentCharIndex++;

      // Check Nitro
      if (this.currentStreak >= this.nitroThreshold && !this.nitroActive) {
        this.activateNitro();
      }

      // Check Finish
      if (this.currentCharIndex >= this.targetText.length) {
        this.onPlayerFinished();
      } else {
        if (this.charElements[this.currentCharIndex]) {
          this.charElements[this.currentCharIndex].classList.add('current');
          this.ensureCharVisible(this.charElements[this.currentCharIndex]);
        }
      }
    } else {
      // Error
      this.errorCount++;
      this.currentStreak = 0;
      this.deactivateNitro();
      this.sound.playKey(true);

      if (this.charElements[this.currentCharIndex]) {
        this.charElements[this.currentCharIndex].className = 'char-token incorrect current';
      }
    }

    this.updateNitroMeter();
    this.updateHud();
  }

  activateNitro() {
    this.nitroActive = true;
    this.lanePlayer.classList.add('has-nitro');
    this.nitroMeterFill.classList.add('full');
    this.sound.playNitro();
  }

  deactivateNitro() {
    this.nitroActive = false;
    this.lanePlayer.classList.remove('has-nitro');
    this.nitroMeterFill.classList.remove('full');
  }

  updateNitroMeter() {
    const pct = Math.min(100, (this.currentStreak / this.nitroThreshold) * 100);
    this.nitroMeterFill.style.width = `${pct}%`;
  }

  ensureCharVisible(el) {
    if (!el) return;
    const parentRect = this.wordsBoard.getBoundingClientRect();
    const elRect = el.getBoundingClientRect();
    if (elRect.bottom > parentRect.bottom - 20) {
      this.wordsBoard.scrollTop += 45;
    }
  }

  onPlayerFinished() {
    this.playerFinished = true;
    this.finishTime = (performance.now() - this.startTime) / 1000;
    this.updateTrackPositions(100, this.bots[0].progress, this.bots[1].progress, this.bots[2].progress);
    this.updateRankings();
    this.updateHud();

    // Check if bots finished or should finish shortly
    setTimeout(() => {
      this.endRace();
    }, 400);
  }

  updateTrackPositions(playerPct, bot1Pct, bot2Pct, bot3Pct) {
    const trackWidth = this.wordsBoard.parentElement.querySelector('.track-container').clientWidth - 110;
    const maxTranslate = Math.max(100, trackWidth);

    const translate = (pct) => `${(Math.min(100, pct) / 100) * maxTranslate}px`;

    this.cars.player.style.transform = `translateX(${translate(playerPct)})`;
    this.cars.bot1.style.transform = `translateX(${translate(bot1Pct)})`;
    this.cars.bot2.style.transform = `translateX(${translate(bot2Pct)})`;
    this.cars.bot3.style.transform = `translateX(${translate(bot3Pct)})`;

    document.getElementById('lane-wpm-player').textContent = `(${this.getCurrentPlayerWpm()} WPM)`;
    document.getElementById('lane-wpm-bot1').textContent = `(${this.bots[0].currentWpm} WPM)`;
    document.getElementById('lane-wpm-bot2').textContent = `(${this.bots[1].currentWpm} WPM)`;
    document.getElementById('lane-wpm-bot3').textContent = `(${this.bots[2].currentWpm} WPM)`;
  }

  getCurrentPlayerWpm() {
    if (!this.startTime) return 0;
    const elapsedMinutes = (Math.max(1, (performance.now() - this.startTime) / 1000)) / 60;
    const wordsTyped = (this.correctChars / 5);
    return Math.round(wordsTyped / elapsedMinutes);
  }

  updateRankings() {
    const totalChars = this.targetText.length;
    const playerProgress = (this.currentCharIndex / totalChars) * 100;

    const standings = [
      { id: 'player', name: 'YOU', progress: playerProgress, finished: this.playerFinished, time: this.finishTime },
      { id: 'bot1', name: 'Nova', progress: this.bots[0].progress, finished: this.bots[0].finished, time: this.bots[0].finishTime },
      { id: 'bot2', name: 'Vector', progress: this.bots[1].progress, finished: this.bots[1].finished, time: this.bots[1].finishTime },
      { id: 'bot3', name: 'Phantom', progress: this.bots[2].progress, finished: this.bots[2].finished, time: this.bots[2].finishTime }
    ];

    // Sort by progress descending, or finish time if finished
    standings.sort((a, b) => {
      if (a.finished && b.finished) return a.time - b.time;
      if (a.finished) return -1;
      if (b.finished) return 1;
      return b.progress - a.progress;
    });

    const rankSuffixes = ['1st', '2nd', '3rd', '4th'];

    standings.forEach((racer, index) => {
      const rankBadge = document.getElementById(`rank-badge-${racer.id}`);
      if (rankBadge) {
        rankBadge.textContent = rankSuffixes[index];
        if (index === 0) {
          rankBadge.style.background = '#eab308';
          rankBadge.style.color = '#000';
        } else {
          rankBadge.style.background = 'var(--bg-tertiary)';
          rankBadge.style.color = 'var(--text-primary)';
        }
      }

      if (racer.id === 'player') {
        this.hudRank.textContent = rankSuffixes[index];
        if (index === 0) {
          this.hudLeadDiff.textContent = 'Leading the pack! 🔥';
          this.hudRank.style.color = '#eab308';
        } else {
          const leader = standings[0];
          this.hudLeadDiff.textContent = `Trailing ${leader.name}`;
          this.hudRank.style.color = '#38bdf8';
        }
      }
    });

    return standings;
  }

  updateHud() {
    const wpm = this.getCurrentPlayerWpm();
    this.hudWpm.textContent = wpm;

    const rawMinutes = (Math.max(1, (performance.now() - (this.startTime || performance.now())) / 1000)) / 60;
    const rawWpm = Math.round((this.totalTypedChars / 5) / rawMinutes);
    this.hudRawWpm.textContent = `Raw: ${rawWpm} WPM`;

    const acc = this.totalTypedChars > 0 ? Math.round((this.correctChars / this.totalTypedChars) * 100) : 100;
    this.hudAccuracy.textContent = `${acc}%`;
    this.hudErrors.textContent = `${this.errorCount} error${this.errorCount === 1 ? '' : 's'}`;

    this.hudStreak.textContent = this.currentStreak;

    const totalChars = this.targetText.length;
    const progressPct = Math.round((this.currentCharIndex / totalChars) * 100);
    this.hudProgress.textContent = `${progressPct}% Track Done`;
  }

  endRace() {
    if (this.status === 'finished') return;
    this.status = 'finished';

    if (this.raceTimerInterval) {
      clearInterval(this.raceTimerInterval);
      this.raceTimerInterval = null;
    }

    const standings = this.updateRankings();
    const playerRank = standings.findIndex(r => r.id === 'player') + 1;

    this.sound.playVictory();
    if (playerRank === 1) {
      this.confetti.fire();
    }

    // Populate Podium
    const getWpmDisplay = (racerId) => {
      if (racerId === 'player') return `${this.getCurrentPlayerWpm()} WPM`;
      const bot = this.bots.find(b => b.id === racerId);
      return `${bot ? bot.targetWpm : 60} WPM`;
    };

    document.getElementById('podium1stName').textContent = standings[0].name;
    document.getElementById('podium1stWpm').textContent = getWpmDisplay(standings[0].id);

    document.getElementById('podium2ndName').textContent = standings[1].name;
    document.getElementById('podium2ndWpm').textContent = getWpmDisplay(standings[1].id);

    document.getElementById('podium3rdName').textContent = standings[2].name;
    document.getElementById('podium3rdWpm').textContent = getWpmDisplay(standings[2].id);

    // Populate Modal Summary
    const finalSeconds = this.finishTime || ((performance.now() - this.startTime) / 1000);
    document.getElementById('modalFinalTime').textContent = `${finalSeconds.toFixed(1)}s`;
    document.getElementById('modalFinalWpm').textContent = this.getCurrentPlayerWpm();
    const acc = this.totalTypedChars > 0 ? Math.round((this.correctChars / this.totalTypedChars) * 100) : 100;
    document.getElementById('modalFinalAcc').textContent = `${acc}%`;
    document.getElementById('modalMaxStreak').textContent = this.maxStreak;

    const header = document.getElementById('podiumHeaderTitle');
    const sub = document.getElementById('podiumSubtitle');
    if (playerRank === 1) {
      header.textContent = '🏆 1st Place Victory!';
      header.style.color = '#eab308';
      sub.textContent = 'Spectacular driving! You left all AI contenders in the dust.';
    } else if (playerRank === 2) {
      header.textContent = '🥈 2nd Place Podium Finish!';
      header.style.color = '#94a3b8';
      sub.textContent = 'So close! A slight edge on nitro streak will take 1st.';
    } else if (playerRank === 3) {
      header.textContent = '🥉 3rd Place Finish!';
      header.style.color = '#d97706';
      sub.textContent = 'On the podium! Keep up the rhythm to push into 1st.';
    } else {
      header.textContent = '4th Place - Keep Training!';
      header.style.color = 'var(--text-primary)';
      sub.textContent = 'Practice your accuracy to trigger nitro bursts and surge forward.';
    }

    this.podiumModal.classList.add('active');
  }
}

// Initialize on DOM ready
document.addEventListener('DOMContentLoaded', () => {
  window.typingRaceGame = new TypingRaceGame();
});