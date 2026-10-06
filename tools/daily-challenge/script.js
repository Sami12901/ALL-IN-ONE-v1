// Daily Challenge - Calendar-driven Daily Typing Drill Engine

// Deterministic Pseudo-Random Number Generator (Mulberry32)
function createPRNG(seed) {
  let s = seed >>> 0;
  return function() {
    s = (s + 0x6D2B79F5) | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function stringToSeed(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (Math.imul(31, hash) + str.charCodeAt(i)) | 0;
  }
  return hash;
}

// Curated sentence banks for deterministic daily synthesis
const SENTENCE_BANKS = {
  easy: [
    "The morning light touches the quiet hills as a gentle wind blows across the open green fields.",
    "Every small step taken with care brings you closer to your goals and builds lasting strength.",
    "Focus on one single word at a time, keeping your hands relaxed and your mind calm and steady.",
    "Good habits are formed through quiet practice and patience each morning before the world awakens.",
    "A journey of a thousand miles begins with a single step forward into the unknown horizon.",
    "The quiet river flows softly toward the sea without hurrying or losing its natural path."
  ],
  medium: [
    "Discipline is not the restriction of freedom; it is the deliberate cultivation of genuine mastery. When you sit before the keyboard, let your thoughts flow directly through your fingertips without hesitation.",
    "The art of living well lies in knowing what to accept and what to change. In moments of challenge, look within yourself for the patience and clarity that steady work always brings.",
    "True excellence is rarely the product of sudden inspiration. More often, it is the quiet accumulation of focused effort repeated day after day with deliberate mindfulness and unwavering dedication.",
    "A skilled programmer understands that elegance and simplicity outshine clever complexity. Write code that is clear, concise, and respectful of the human mind that must maintain it tomorrow."
  ],
  hard: [
    "To comprehend the profound architecture of distributed computational systems, one must first recognize the fundamental trade-offs between linear consistency, high availability, and network partition resilience. Modern distributed databases synthesize decentralized consensus protocols, vectorized consensus logs, and multi-version concurrency controls to withstand adversarial network failures across global clusters.",
    "Philosophy begins not with speculative hypotheses, but with the radical astonishment that existence persists at all. The ancient Stoics understood that inner tranquillity emerges exclusively when a discerning intellect distinguishes between sovereign internal intentions and immutable external contingencies.",
    "The evolution of modern typography reflects the delicate intersection of aesthetic balance and optical ergonomics. From Renaissance Venetian serifs to twentieth-century geometric sans-serifs, master craftsmen calibrated kerning, ascender proportions, and baseline rhythm to sustain effortless legibility."
  ]
};

const BADGES = [
  { id: 'first_step', icon: '🌱', title: 'First Step', desc: 'Complete your first daily challenge.' },
  { id: 'streak_3', icon: '🔥', title: '3-Day Fire', desc: 'Maintain a 3-day consecutive streak.' },
  { id: 'streak_7', icon: '⚡', title: 'Week Warrior', desc: 'Maintain a 7-day consecutive streak.' },
  { id: 'streak_14', icon: '👑', title: 'Fortnight Master', desc: 'Maintain a 14-day consecutive streak.' },
  { id: 'perfect_acc', icon: '🎯', title: 'Sharpshooter', desc: 'Achieve 100% accuracy on a challenge.' },
  { id: 'speed_demon', icon: '🚀', title: 'Speed Demon', desc: 'Achieve 80+ Net WPM on a challenge.' }
];

// Sound Synthesizer
class DailySoundSynth {
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
  click() {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;
    try {
      const t = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(580 + (Math.random() * 80 - 40), t);
      osc.frequency.exponentialRampToValueAtTime(140, t + 0.035);
      gain.gain.setValueAtTime(0.04, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.035);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(t);
      osc.stop(t + 0.035);
    } catch {}
  }
  error() {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;
    try {
      const t = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(130, t);
      osc.frequency.exponentialRampToValueAtTime(65, t + 0.12);
      gain.gain.setValueAtTime(0.08, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.12);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(t);
      osc.stop(t + 0.12);
    } catch {}
  }
  fanfare() {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;
    try {
      const t = this.ctx.currentTime;
      [523.25, 659.25, 783.99, 1046.50].forEach((freq, i) => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, t + i * 0.08);
        gain.gain.setValueAtTime(0.05, t + i * 0.08);
        gain.gain.exponentialRampToValueAtTime(0.001, t + i * 0.08 + 0.25);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(t + i * 0.08);
        osc.stop(t + i * 0.08 + 0.25);
      });
    } catch {}
  }
}

class DailyChallengeApp {
  constructor() {
    this.sound = new DailySoundSynth();
    this.difficulty = 'easy';
    this.utcDateStr = this.getUtcDateString(new Date());

    this.rawText = '';
    this.words = [];
    this.currentWordIndex = 0;
    this.currentCharIndex = 0;

    // Session stats
    this.isRunning = false;
    this.isFinished = false;
    this.timer = null;
    this.elapsedSeconds = 0;
    this.totalTypedChars = 0;
    this.correctChars = 0;
    this.errorCount = 0;

    // Calendar navigation state
    this.viewYear = new Date().getUTCFullYear();
    this.viewMonth = new Date().getUTCMonth(); // 0-indexed

    this.dom = {
      difficultySelector: document.getElementById('difficultySelector'),
      utcDateDisplay: document.getElementById('utcDateDisplay'),
      soundToggleBtn: document.getElementById('soundToggleBtn'),
      resetBtn: document.getElementById('resetBtn'),

      currentStreakVal: document.getElementById('currentStreakVal'),
      streakSub: document.getElementById('streakSub'),
      netWpmVal: document.getElementById('netWpmVal'),
      accuracyVal: document.getElementById('accuracyVal'),
      timerVal: document.getElementById('timerVal'),
      todayStatusVal: document.getElementById('todayStatusVal'),
      todayScoreSub: document.getElementById('todayScoreSub'),

      displayPanel: document.getElementById('displayPanel'),
      focusHint: document.getElementById('focusHint'),
      wordsContainer: document.getElementById('wordsContainer'),
      hiddenInput: document.getElementById('hiddenInput'),

      calMonthTitle: document.getElementById('calMonthTitle'),
      calendarGrid: document.getElementById('calendarGrid'),
      prevMonthBtn: document.getElementById('prevMonthBtn'),
      nextMonthBtn: document.getElementById('nextMonthBtn'),
      totalDaysCount: document.getElementById('totalDaysCount'),
      longestStreakVal: document.getElementById('longestStreakVal'),

      badgesUnlockedCount: document.getElementById('badgesUnlockedCount'),
      badgesContainer: document.getElementById('badgesContainer'),

      // Modal
      completionModal: document.getElementById('completionModal'),
      modalDateSub: document.getElementById('modalDateSub'),
      modalNetWpm: document.getElementById('modalNetWpm'),
      modalAccuracy: document.getElementById('modalAccuracy'),
      modalMistakes: document.getElementById('modalMistakes'),
      modalStreak: document.getElementById('modalStreak'),
      modalDuration: document.getElementById('modalDuration'),
      shareDailyBtn: document.getElementById('shareDailyBtn'),
      modalCloseBtn: document.getElementById('modalCloseBtn')
    };

    this.initEvents();
    this.updateTodayStatus();
    this.renderBadges();
    this.renderCalendar();
    this.loadChallenge();
  }

  getUtcDateString(d) {
    const y = d.getUTCFullYear();
    const m = String(d.getUTCMonth() + 1).padStart(2, '0');
    const day = String(d.getUTCDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  }

  getHistory() {
    try {
      return JSON.parse(localStorage.getItem('aio_daily_challenge_history')) || {};
    } catch {
      return {};
    }
  }

  saveHistory(dateStr, data) {
    const hist = this.getHistory();
    hist[dateStr] = data;
    localStorage.setItem('aio_daily_challenge_history', JSON.stringify(hist));
  }

  calculateStreaks() {
    const hist = this.getHistory();
    const dates = Object.keys(hist).sort();

    if (dates.length === 0) {
      return { current: 0, longest: 0, total: 0 };
    }

    // Longest streak
    let longest = 1;
    let tempStreak = 1;
    for (let i = 1; i < dates.length; i++) {
      const prev = new Date(dates[i - 1] + 'T00:00:00Z');
      const curr = new Date(dates[i] + 'T00:00:00Z');
      const diffDays = Math.round((curr - prev) / (1000 * 60 * 60 * 24));
      if (diffDays === 1) {
        tempStreak++;
        if (tempStreak > longest) longest = tempStreak;
      } else if (diffDays > 1) {
        tempStreak = 1;
      }
    }

    // Current streak
    let current = 0;
    const today = new Date(this.utcDateStr + 'T00:00:00Z');
    let checkDate = new Date(today);

    // If today is completed, check starting today; else start from yesterday
    if (!hist[this.utcDateStr]) {
      checkDate.setUTCDate(checkDate.getUTCDate() - 1);
    }

    while (true) {
      const checkStr = this.getUtcDateString(checkDate);
      if (hist[checkStr]) {
        current++;
        checkDate.setUTCDate(checkDate.getUTCDate() - 1);
      } else {
        break;
      }
    }

    return { current, longest, total: dates.length };
  }

  generateDeterministicText(dateStr, difficulty) {
    const seed = stringToSeed(`${dateStr}_${difficulty}`);
    const rng = createPRNG(seed);
    const bank = SENTENCE_BANKS[difficulty] || SENTENCE_BANKS.easy;

    // Pick 1 to 2 sentences based on difficulty
    const count = difficulty === 'hard' ? 2 : difficulty === 'medium' ? 2 : 1;
    const selected = [];
    for (let i = 0; i < count; i++) {
      const idx = Math.floor(rng() * bank.length);
      selected.push(bank[idx]);
    }

    return selected.join(' ');
  }

  initEvents() {
    this.dom.utcDateDisplay.textContent = `UTC: ${this.utcDateStr}`;

    // Difficulty switch
    this.dom.difficultySelector.addEventListener('click', (e) => {
      const btn = e.target.closest('.tst-pill-btn');
      if (!btn) return;
      this.dom.difficultySelector.querySelectorAll('.tst-pill-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      this.difficulty = btn.dataset.difficulty;
      this.loadChallenge();
    });

    // Sound toggle
    this.dom.soundToggleBtn.addEventListener('click', () => {
      this.sound.enabled = !this.sound.enabled;
      this.dom.soundToggleBtn.textContent = `Sound: ${this.sound.enabled ? 'ON' : 'MUTED'}`;
    });

    // Reset button
    this.dom.resetBtn.addEventListener('click', () => this.loadChallenge());

    // Focus
    this.dom.displayPanel.addEventListener('click', () => this.focusInput());
    this.dom.focusHint.addEventListener('click', () => this.focusInput());

    // Keyboard events
    window.addEventListener('keydown', (e) => {
      if (this.dom.completionModal.classList.contains('active')) {
        if (e.key === 'Escape') this.dom.completionModal.classList.remove('active');
        return;
      }

      if (e.key === 'Escape') {
        this.loadChallenge();
        return;
      }

      if (document.activeElement !== this.dom.hiddenInput && !e.ctrlKey && !e.metaKey && !e.altKey) {
        if (e.key.length === 1 || e.key === 'Backspace' || e.key === ' ') {
          this.focusInput();
        }
      }
    });

    this.dom.hiddenInput.addEventListener('keydown', (e) => this.handleKeyDown(e));

    // Calendar navigation
    this.dom.prevMonthBtn.addEventListener('click', () => {
      this.viewMonth--;
      if (this.viewMonth < 0) {
        this.viewMonth = 11;
        this.viewYear--;
      }
      this.renderCalendar();
    });

    this.dom.nextMonthBtn.addEventListener('click', () => {
      this.viewMonth++;
      if (this.viewMonth > 11) {
        this.viewMonth = 0;
        this.viewYear++;
      }
      this.renderCalendar();
    });

    // Modal
    this.dom.modalCloseBtn.addEventListener('click', () => {
      this.dom.completionModal.classList.remove('active');
    });

    this.dom.shareDailyBtn.addEventListener('click', () => {
      const net = this.dom.modalNetWpm.textContent;
      const acc = this.dom.modalAccuracy.textContent;
      const streak = this.dom.modalStreak.textContent;
      const shareText = `📅 Daily Typing Challenge (${this.utcDateStr}):\n⚡ Speed: ${net} WPM\n🎯 Accuracy: ${acc}\n🔥 Streak: ${streak}\nPlay today's drill: https://sami12901.github.io/ALL-IN-ONE-v1/tools/daily-challenge/`;

      navigator.clipboard.writeText(shareText).then(() => {
        const orig = this.dom.shareDailyBtn.innerHTML;
        this.dom.shareDailyBtn.textContent = 'Copied to Clipboard!';
        setTimeout(() => { this.dom.shareDailyBtn.innerHTML = orig; }, 2000);
      });
    });
  }

  focusInput() {
    this.dom.hiddenInput.focus();
    this.dom.displayPanel.classList.add('focused');
    this.dom.focusHint.classList.add('hidden');
  }

  loadChallenge() {
    clearInterval(this.timer);
    this.timer = null;
    this.isRunning = false;
    this.isFinished = false;
    this.elapsedSeconds = 0;
    this.totalTypedChars = 0;
    this.correctChars = 0;
    this.errorCount = 0;
    this.currentWordIndex = 0;
    this.currentCharIndex = 0;

    this.rawText = this.generateDeterministicText(this.utcDateStr, this.difficulty);
    this.words = this.rawText.split(/\s+/);

    this.renderWords();
    this.updateStatsUI();

    this.dom.timerVal.textContent = '00:00';
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
      wordSpan.className = 'dc-word';
      wordSpan.dataset.wordIndex = wIdx;

      for (let cIdx = 0; cIdx < wordText.length; cIdx++) {
        const charSpan = document.createElement('span');
        charSpan.className = 'dc-char';
        charSpan.textContent = wordText[cIdx];
        if (wIdx === 0 && cIdx === 0) charSpan.classList.add('current');
        wordSpan.appendChild(charSpan);
      }
      container.appendChild(wordSpan);
    });
  }

  startDrill() {
    if (this.isRunning) return;
    this.isRunning = true;
    this.sound.init();

    this.timer = setInterval(() => {
      this.elapsedSeconds++;
      this.dom.timerVal.textContent = this.formatTime(this.elapsedSeconds);
      this.updateStatsUI();
    }, 1000);
  }

  handleKeyDown(e) {
    if (this.isFinished) return;
    if (e.key === 'Tab') { e.preventDefault(); return; }

    if (!this.isRunning && e.key.length === 1) {
      this.startDrill();
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
            charEl.className = 'dc-char current';
          }
        }
        const nextChar = wordEl.children[this.currentCharIndex + 1];
        if (nextChar) nextChar.classList.remove('current');
      }
      return;
    }

    // SPACE
    if (e.key === ' ') {
      e.preventDefault();
      if (this.currentCharIndex === 0) return;

      this.sound.click();
      this.totalTypedChars++;

      const chars = wordEl.querySelectorAll('.dc-char:not(.extra)');
      let allCorrect = true;
      chars.forEach(ch => {
        if (!ch.classList.contains('correct')) allCorrect = false;
      });

      if (allCorrect && this.currentCharIndex === currentWordText.length) {
        this.correctChars++;
      } else {
        this.errorCount++;
      }

      const prevActive = wordEl.children[this.currentCharIndex];
      if (prevActive) prevActive.classList.remove('current');

      this.currentWordIndex++;
      this.currentCharIndex = 0;

      if (this.currentWordIndex >= this.words.length) {
        this.finishChallenge();
        return;
      }

      const nextWordEl = this.dom.wordsContainer.children[this.currentWordIndex];
      if (nextWordEl && nextWordEl.children[0]) {
        nextWordEl.children[0].classList.add('current');
        this.adjustScroll(nextWordEl);
      }

      this.updateStatsUI();
      return;
    }

    // REGULAR KEY
    if (e.key.length === 1) {
      e.preventDefault();
      this.totalTypedChars++;

      const expectedChar = currentWordText[this.currentCharIndex];
      const charEl = wordEl.children[this.currentCharIndex];

      if (this.currentCharIndex < currentWordText.length && charEl) {
        charEl.classList.remove('current');
        if (e.key === expectedChar) {
          charEl.className = 'dc-char correct';
          this.correctChars++;
          this.sound.click();
        } else {
          charEl.className = 'dc-char incorrect';
          this.errorCount++;
          this.sound.error();
        }

        this.currentCharIndex++;
        const nextChar = wordEl.children[this.currentCharIndex];
        if (nextChar) nextChar.classList.add('current');
      } else {
        this.errorCount++;
        this.sound.error();
        const extraSpan = document.createElement('span');
        extraSpan.className = 'dc-char extra';
        extraSpan.textContent = e.key;
        wordEl.appendChild(extraSpan);
        this.currentCharIndex++;
      }

      this.updateStatsUI();
    }
  }

  adjustScroll(activeWordEl) {
    const offsetTop = activeWordEl.offsetTop;
    if (offsetTop > 70) {
      this.dom.wordsContainer.style.transform = `translateY(-${offsetTop - 40}px)`;
    } else {
      this.dom.wordsContainer.style.transform = 'translateY(0)';
    }
  }

  calculateNetWpm() {
    const mins = Math.max(this.elapsedSeconds / 60, 0.05);
    const gross = (this.totalTypedChars / 5) / mins;
    const penalty = this.errorCount / mins;
    return Math.max(0, Math.round(gross - penalty));
  }

  calculateAccuracy() {
    if (this.totalTypedChars === 0) return 100;
    return Math.max(0, Math.min(100, Math.round((this.correctChars / this.totalTypedChars) * 100)));
  }

  updateStatsUI() {
    const net = this.calculateNetWpm();
    const acc = this.calculateAccuracy();

    this.dom.netWpmVal.textContent = net;
    this.dom.accuracyVal.textContent = `${acc}%`;
  }

  finishChallenge() {
    this.isFinished = true;
    this.isRunning = false;
    clearInterval(this.timer);
    this.sound.fanfare();

    const net = this.calculateNetWpm();
    const acc = this.calculateAccuracy();

    // Record in history
    this.saveHistory(this.utcDateStr, {
      wpm: net,
      accuracy: acc,
      difficulty: this.difficulty,
      timestamp: Date.now()
    });

    const streaks = this.calculateStreaks();
    this.updateTodayStatus();
    this.renderCalendar();
    this.renderBadges();

    // Populate modal
    this.dom.modalDateSub.textContent = `Completed UTC Drill on ${this.utcDateStr} (${this.difficulty.toUpperCase()})`;
    this.dom.modalNetWpm.textContent = net;
    this.dom.modalAccuracy.textContent = `${acc}%`;
    this.dom.modalMistakes.textContent = `${this.errorCount} mistakes`;
    this.dom.modalStreak.textContent = `${streaks.current} Day${streaks.current === 1 ? '' : 's'} 🔥`;
    this.dom.modalDuration.textContent = this.formatTime(this.elapsedSeconds);

    this.dom.completionModal.classList.add('active');
  }

  updateTodayStatus() {
    const hist = this.getHistory();
    const todayRecord = hist[this.utcDateStr];
    const streaks = this.calculateStreaks();

    this.dom.currentStreakVal.textContent = `${streaks.current} 🔥`;
    this.dom.longestStreakVal.textContent = `${streaks.longest} days`;
    this.dom.totalDaysCount.textContent = streaks.total;

    if (todayRecord) {
      this.dom.todayStatusVal.textContent = 'Completed ✓';
      this.dom.todayStatusVal.style.color = 'var(--success)';
      this.dom.todayScoreSub.textContent = `${todayRecord.wpm} WPM (${todayRecord.accuracy}%)`;
    } else {
      this.dom.todayStatusVal.textContent = 'Pending';
      this.dom.todayStatusVal.style.color = 'var(--text-secondary)';
      this.dom.todayScoreSub.textContent = 'Not completed yet today';
    }
  }

  renderCalendar() {
    const container = this.dom.calendarGrid;
    container.innerHTML = '';

    const monthNames = [
      "January", "February", "March", "April", "May", "June",
      "July", "August", "September", "October", "November", "December"
    ];
    this.dom.calMonthTitle.textContent = `${monthNames[this.viewMonth]} ${this.viewYear}`;

    // Day headers
    const days = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];
    days.forEach(d => {
      const h = document.createElement('div');
      h.className = 'dc-cal-dayname';
      h.textContent = d;
      container.appendChild(h);
    });

    const firstDay = new Date(Date.UTC(this.viewYear, this.viewMonth, 1)).getUTCDay();
    const daysInMonth = new Date(Date.UTC(this.viewYear, this.viewMonth + 1, 0)).getUTCDate();
    const hist = this.getHistory();

    // Empty cells before start
    for (let i = 0; i < firstDay; i++) {
      const empty = document.createElement('div');
      empty.className = 'dc-cal-cell empty';
      container.appendChild(empty);
    }

    // Date cells
    for (let day = 1; day <= daysInMonth; day++) {
      const cell = document.createElement('div');
      cell.className = 'dc-cal-cell';
      cell.textContent = day;

      const dateStr = `${this.viewYear}-${String(this.viewMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;

      if (dateStr === this.utcDateStr) {
        cell.classList.add('today');
      }

      if (hist[dateStr]) {
        cell.classList.add('completed');
        cell.title = `${dateStr}: ${hist[dateStr].wpm} WPM (${hist[dateStr].accuracy}% Acc)`;
      }

      container.appendChild(cell);
    }
  }

  renderBadges() {
    const hist = this.getHistory();
    const streaks = this.calculateStreaks();
    const container = this.dom.badgesContainer;
    container.innerHTML = '';

    // Check conditions
    const hasRecord = Object.keys(hist).length > 0;
    const records = Object.values(hist);
    const hasPerfect = records.some(r => r.accuracy === 100);
    const hasSpeed = records.some(r => r.wpm >= 80);

    let unlockedCount = 0;

    BADGES.forEach(badge => {
      let unlocked = false;
      if (badge.id === 'first_step' && hasRecord) unlocked = true;
      if (badge.id === 'streak_3' && streaks.longest >= 3) unlocked = true;
      if (badge.id === 'streak_7' && streaks.longest >= 7) unlocked = true;
      if (badge.id === 'streak_14' && streaks.longest >= 14) unlocked = true;
      if (badge.id === 'perfect_acc' && hasPerfect) unlocked = true;
      if (badge.id === 'speed_demon' && hasSpeed) unlocked = true;

      if (unlocked) unlockedCount++;

      const item = document.createElement('div');
      item.className = `dc-badge-item ${unlocked ? 'unlocked' : ''}`;
      item.innerHTML = `
        <div class="dc-badge-icon">${badge.icon}</div>
        <div class="dc-badge-info">
          <div class="dc-badge-title">${badge.title}</div>
          <div class="dc-badge-desc">${badge.desc}</div>
        </div>
      `;
      container.appendChild(item);
    });

    this.dom.badgesUnlockedCount.textContent = `${unlockedCount} / ${BADGES.length} Unlocked`;
  }

  formatTime(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }
}

document.addEventListener('DOMContentLoaded', () => {
  new DailyChallengeApp();
});