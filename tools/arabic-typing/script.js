/**
 * Arabic Typing Trainer (مدرب الطباعة العربية)
 * Complete RTL typing engine, interactive on-screen keyboard visualizer,
 * Harakat accents, alphabet drills, common Arabic phrases, Web Audio, and gamification.
 */

// Arabic Digits Converter
const AR_DIGITS = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩'];
function toArNum(num) {
  return String(num).replace(/[0-9]/g, d => AR_DIGITS[parseInt(d, 10)]);
}

// Arabic Keyboard Layout Definition (Arabic 101)
const KEYBOARD_LAYOUT = [
  // Row 1
  [
    { key: '`', ar: 'ذ', shiftAr: 'ّ' },
    { key: '1', ar: '١', shiftAr: '!' },
    { key: '2', ar: '٢', shiftAr: '@' },
    { key: '3', ar: '٣', shiftAr: '#' },
    { key: '4', ar: '٤', shiftAr: '$' },
    { key: '5', ar: '٥', shiftAr: '%' },
    { key: '6', ar: '٦', shiftAr: '^' },
    { key: '7', ar: '٧', shiftAr: '&' },
    { key: '8', ar: '٨', shiftAr: '*' },
    { key: '9', ar: '٩', shiftAr: ')' },
    { key: '0', ar: '٠', shiftAr: '(' },
    { key: '-', ar: '-', shiftAr: '_' },
    { key: '=', ar: '=', shiftAr: '+' }
  ],
  // Row 2
  [
    { key: 'q', ar: 'ض', shiftAr: 'َ' },
    { key: 'w', ar: 'ص', shiftAr: 'ً' },
    { key: 'e', ar: 'ث', shiftAr: 'ُ' },
    { key: 'r', ar: 'ق', shiftAr: 'ٌ' },
    { key: 't', ar: 'ف', shiftAr: 'لإ' },
    { key: 'y', ar: 'غ', shiftAr: 'إ' },
    { key: 'u', ar: 'ع', shiftAr: '‘' },
    { key: 'i', ar: 'ه', shiftAr: '÷' },
    { key: 'o', ar: 'خ', shiftAr: '×' },
    { key: 'p', ar: 'ح', shiftAr: '؛' },
    { key: '[', ar: 'ج', shiftAr: '<' },
    { key: ']', ar: 'د', shiftAr: '>' }
  ],
  // Row 3
  [
    { key: 'a', ar: 'ش', shiftAr: 'ِ' },
    { key: 's', ar: 'س', shiftAr: 'ٍ' },
    { key: 'd', ar: 'ي', shiftAr: ']' },
    { key: 'f', ar: 'ب', shiftAr: '[' },
    { key: 'g', ar: 'ل', shiftAr: 'لأ' },
    { key: 'h', ar: 'ا', shiftAr: 'أ' },
    { key: 'j', ar: 'ت', shiftAr: 'ـ' },
    { key: 'k', ar: 'ن', shiftAr: '،' },
    { key: 'l', ar: 'م', shiftAr: '/' },
    { key: ';', ar: 'ك', shiftAr: ':' },
    { key: "'", ar: 'ط', shiftAr: '"' }
  ],
  // Row 4
  [
    { key: 'z', ar: 'ئ', shiftAr: '~' },
    { key: 'x', ar: 'ء', shiftAr: 'ْ' },
    { key: 'c', ar: 'ؤ', shiftAr: '}' },
    { key: 'v', ar: 'ر', shiftAr: '{' },
    { key: 'b', ar: 'لا', shiftAr: 'لآ' },
    { key: 'n', ar: 'ى', shiftAr: 'آ' },
    { key: 'm', ar: 'ة', shiftAr: '’' },
    { key: ',', ar: 'و', shiftAr: ',' },
    { key: '.', ar: 'ز', shiftAr: '.' },
    { key: '/', ar: 'ظ', shiftAr: '؟' }
  ]
];

// Drills Catalog
const ARABIC_DRILLS = {
  alphabet: [
    { title: "الحروف من الألف إلى الشين", text: "أ ب ت ث ج ح خ د ذ ر ز س ش" },
    { title: "الحروف من الصاد إلى الياء", text: "ص ض ط ظ ع غ ف ق ك ل م ن هـ و ي" },
    { title: "الأبجدية العربية الكاملة", text: "ا ب ت ث ج ح خ د ذ ر ز س ش ص ض ط ظ ع غ ف ق ك ل م ن هـ و ي" },
    { title: "كلمات تدريبية قصيرة", text: "باب دار بيت قلم شمس قمر ولد بنت علم كتاب نهر بحر شجر" }
  ],
  harakat: [
    { title: "الفتحة والضمة والكسرة", text: "كَتَبَ قَرَأَ رَسَمَ عَمِلَ نَجَحَ زَرَعَ حَصَدَ صَبَرَ شَكَرَ" },
    { title: "السكون والتنوين", text: "عِلْمٌ نَافِعٌ وَخُلُقٌ كَرِيمٌ وَقَلْبٌ طَيِّبٌ وَرِزْقٌ حَلَالٌ" },
    { title: "الشدة والحركات المركبة", text: "المُعَلِّمُ يُرَبِّي الأَجْيَالَ بِالصَّبْرِ وَالعَطَاءِ المُسْتَمِرِّ" }
  ],
  phrases: [
    { title: "البسملة والتحية الشريفة", text: "بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ - السَّلَامُ عَلَيْكُمْ وَرَحْمَةُ اللَّهِ وَبَرَكَاتُهُ" },
    { title: "العلم والعمل", text: "العِلْمُ نُورٌ وَالجَهْلُ ظَلَامٌ، وَمَنْ جَدَّ وَجَدَ وَمَنْ زَرَعَ حَصَدَ، وَالوَقْتُ كَالسَّيْفِ إِنْ لَمْ تَقْطَعْهُ قَطَعَكَ." },
    { title: "الصبر والحكمة", text: "الصَّبْرُ مِفْتَاحُ الفَرَجِ، وَخَيْرُ الكَلَامِ مَا قَلَّ وَدَلَّ، وَلَا تُؤَجِّلْ عَمَلَ اليَوْمِ إِلَى الغَدِ." },
    { title: "مكارم الأخلاق", text: "عَامِلِ النَّاسَ بِمَا تُحِبُّ أَنْ يُعَامِلُوكَ بِهِ، وَكُنْ كَالنَّخِيلِ عَنِ الأَحْقَادِ مُرْتَفِعًا يُرْمَى بِصَخْرٍ فَيُلْقِي أَطْيَبَ الثَّمَرِ." }
  ]
};

/* ================= Audio Synthesizer ================= */
class SoundEngine {
  constructor() {
    this.ctx = null;
    this.enabled = localStorage.getItem('typing_sound_enabled') !== 'false';
  }

  init() {
    if (!this.ctx && typeof AudioContext !== 'undefined') {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) this.ctx = new AudioCtx();
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
  }

  playKey() {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;
    try {
      const t = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(580 + Math.random() * 200, t);
      osc.frequency.exponentialRampToValueAtTime(75, t + 0.04);

      gain.gain.setValueAtTime(0.08, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.04);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(t);
      osc.stop(t + 0.04);
    } catch (_) {}
  }

  playError() {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;
    try {
      const t = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(125, t);
      osc.frequency.linearRampToValueAtTime(90, t + 0.08);

      gain.gain.setValueAtTime(0.12, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.08);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(t);
      osc.stop(t + 0.08);
    } catch (_) {}
  }

  playComplete() {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;
    try {
      const notes = [523.25, 659.25, 783.99, 1046.5];
      notes.forEach((freq, idx) => {
        const t = this.ctx.currentTime + idx * 0.08;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, t);
        gain.gain.setValueAtTime(0.1, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.25);

        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(t);
        osc.stop(t + 0.25);
      });
    } catch (_) {}
  }

  toggle() {
    this.enabled = !this.enabled;
    localStorage.setItem('typing_sound_enabled', this.enabled ? 'true' : 'false');
    return this.enabled;
  }
}

const sounds = new SoundEngine();

/* ================= Gamification Sync ================= */
function recordTypingSession({ language = 'arabic', wpm, accuracy, wordsCount, charsCount, mistakes }) {
  const STORAGE_KEY = 'ALL_IN_ONE_TYPING_DATA';
  let data;
  try {
    data = JSON.parse(localStorage.getItem(STORAGE_KEY)) || {};
  } catch (e) {
    data = {};
  }

  data.totalTests = (data.totalTests || 0) + 1;
  data.totalWords = (data.totalWords || 0) + Math.max(1, wordsCount);
  data.totalCharacters = (data.totalCharacters || 0) + charsCount;
  data.maxWpm = Math.max(data.maxWpm || 0, wpm);
  data.bestAccuracy = Math.max(data.bestAccuracy || 0, accuracy);

  if (!data.languagesUsed) data.languagesUsed = {};
  if (!data.languagesUsed[language]) {
    data.languagesUsed[language] = { tests: 0, words: 0, bestWpm: 0, bestAcc: 0 };
  }
  const langObj = data.languagesUsed[language];
  langObj.tests += 1;
  langObj.words += wordsCount;
  langObj.bestWpm = Math.max(langObj.bestWpm, wpm);
  langObj.bestAcc = Math.max(langObj.bestAcc, accuracy);

  if (mistakes === 0 && wordsCount >= 10) {
    data.perfectDrillsCompleted = (data.perfectDrillsCompleted || 0) + 1;
  }

  // Streak
  const today = new Date().toISOString().slice(0, 10);
  if (!data.lastActiveDate) {
    data.streak = 1;
    data.lastActiveDate = today;
  } else if (data.lastActiveDate !== today) {
    const lastDate = new Date(data.lastActiveDate);
    const currentDate = new Date(today);
    const diffDays = Math.round((currentDate - lastDate) / (1000 * 60 * 60 * 24));
    if (diffDays === 1) {
      data.streak = (data.streak || 1) + 1;
    } else if (diffDays > 1) {
      data.streak = 1;
    }
    data.lastActiveDate = today;
  }

  const gainedXP = Math.round(wpm * 2 + wordsCount + (accuracy >= 98 ? 40 : 15));
  data.xp = (data.xp || 0) + gainedXP;
  data.level = Math.floor(Math.sqrt(data.xp / 100)) + 1;

  if (!data.unlockedBadges) data.unlockedBadges = {};
  const unlockedNow = [];

  const checkBadge = (id, condition) => {
    if (!data.unlockedBadges[id] && condition) {
      data.unlockedBadges[id] = new Date().toISOString();
      unlockedNow.push(id);
    }
  };

  const langsCount = Object.keys(data.languagesUsed).filter(k => data.languagesUsed[k].tests > 0).length;

  checkBadge('first_strike', data.totalTests >= 1);
  checkBadge('getting_warm', data.maxWpm >= 30);
  checkBadge('cruising_speed', data.maxWpm >= 50);
  checkBadge('rapid_fire', data.maxWpm >= 70);
  checkBadge('speed_demon', data.maxWpm >= 100);
  checkBadge('sonic_typist', data.maxWpm >= 120);
  checkBadge('sharp_shooter', data.bestAccuracy >= 95);
  checkBadge('laser_precision', accuracy >= 100 && wordsCount >= 25);
  checkBadge('flawless_run', mistakes === 0 && wordsCount >= 15);
  checkBadge('arabesque', (data.languagesUsed['arabic']?.tests || 0) >= 1);
  checkBadge('bilingual_scribe', langsCount >= 2);
  checkBadge('polyglot_typist', langsCount >= 3);
  checkBadge('quad_lingual', langsCount >= 4);
  checkBadge('streak_3', (data.streak || 1) >= 3);
  checkBadge('streak_7', (data.streak || 1) >= 7);
  checkBadge('century_club', (data.totalWords || 0) >= 100);
  checkBadge('marathoneer', (data.totalWords || 0) >= 500);
  checkBadge('endurance_master', (data.totalWords || 0) >= 1000);

  const unlockedCount = Object.keys(data.unlockedBadges).length;
  checkBadge('grandmaster', unlockedCount >= 18 && (data.level || 1) >= 10);

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (e) {
    console.warn('LocalStorage save failed:', e);
  }

  return { gainedXP, unlockedNow };
}

/* ================= Arabic Typing Engine ================= */
class ArabicTypingEngine {
  constructor() {
    this.currentMode = 'alphabet';
    this.drillIndex = 0;
    this.timeLimit = 30;
    this.timerInterval = null;
    this.timeRemaining = 30;
    this.hasStarted = false;
    this.isCompleted = false;

    this.passageText = "";
    this.typedChars = [];
    this.mistakesCount = 0;
    this.startTime = null;

    this.dom = {
      levelButtons: document.querySelectorAll('.level-card-btn'),
      subLevelList: document.getElementById('subLevelList'),
      timeButtons: document.querySelectorAll('.toolbar-bar .tag-btn[data-time]'),
      statWpm: document.getElementById('statWpm'),
      statAccuracy: document.getElementById('statAccuracy'),
      statCpm: document.getElementById('statCpm'),
      statTimer: document.getElementById('statTimer'),
      statErrors: document.getElementById('statErrors'),
      arenaRtl: document.getElementById('arenaRtl'),
      arabicTextFlow: document.getElementById('arabicTextFlow'),
      hiddenInput: document.getElementById('hiddenInput'),
      clickPrompt: document.getElementById('clickPrompt'),
      progressTrackBar: document.getElementById('progressTrackBar'),
      btnRestart: document.getElementById('btnRestart'),
      btnNextDrill: document.getElementById('btnNextDrill'),
      btnSound: document.getElementById('btnSound'),
      soundIcon: document.getElementById('soundIcon'),
      soundLabel: document.getElementById('soundLabel'),
      // Keyboard rows
      kbRows: [
        document.getElementById('kbRow1'),
        document.getElementById('kbRow2'),
        document.getElementById('kbRow3'),
        document.getElementById('kbRow4'),
        document.getElementById('kbRow5')
      ],
      // Modal
      modalBackdrop: document.getElementById('modalBackdrop'),
      modalWpm: document.getElementById('modalWpm'),
      modalAcc: document.getElementById('modalAcc'),
      modalWords: document.getElementById('modalWords'),
      modalMistakes: document.getElementById('modalMistakes'),
      modalBadgesBox: document.getElementById('modalBadgesBox'),
      modalRetry: document.getElementById('modalRetry'),
      modalNext: document.getElementById('modalNext')
    };

    this.init();
  }

  init() {
    this.updateSoundBtn();
    this.buildOnScreenKeyboard();
    this.renderSubLevels();
    this.loadPassage();
    this.bindEvents();
    this.highlightTargetKey();
  }

  updateSoundBtn() {
    if (this.dom.btnSound) {
      this.dom.soundIcon.textContent = sounds.enabled ? '🔊' : '🔇';
      this.dom.soundLabel.textContent = `الصوت: ${sounds.enabled ? 'مفعّل' : 'معطّل'}`;
    }
  }

  buildOnScreenKeyboard() {
    KEYBOARD_LAYOUT.forEach((row, rowIndex) => {
      const rowContainer = this.dom.kbRows[rowIndex];
      if (!rowContainer) return;
      rowContainer.innerHTML = '';

      row.forEach(item => {
        const keyDiv = document.createElement('div');
        keyDiv.className = 'kb-key';
        keyDiv.dataset.latin = item.key;
        keyDiv.dataset.ar = item.ar;
        if (item.shiftAr) keyDiv.dataset.shiftAr = item.shiftAr;

        keyDiv.innerHTML = `
          <span class="kb-sub">${item.key.toUpperCase()}</span>
          <span>${item.ar}</span>
        `;

        keyDiv.addEventListener('mousedown', (e) => {
          e.preventDefault();
          this.insertCharacter(item.ar);
          this.flashKey(keyDiv);
        });

        rowContainer.appendChild(keyDiv);
      });
    });

    // Spacebar row
    const row5 = this.dom.kbRows[4];
    if (row5) {
      row5.innerHTML = '';
      const spaceKey = document.createElement('div');
      spaceKey.className = 'kb-key space';
      spaceKey.dataset.latin = ' ';
      spaceKey.dataset.ar = ' ';
      spaceKey.innerHTML = `<span>مسافة (Space)</span>`;
      spaceKey.addEventListener('mousedown', (e) => {
        e.preventDefault();
        this.insertCharacter(' ');
        this.flashKey(spaceKey);
      });
      row5.appendChild(spaceKey);
    }
  }

  flashKey(keyDiv) {
    if (!keyDiv) return;
    keyDiv.classList.add('active-press');
    setTimeout(() => keyDiv.classList.remove('active-press'), 120);
  }

  highlightTargetKey() {
    // Clear existing target hints
    document.querySelectorAll('.kb-key.target-hint').forEach(k => k.classList.remove('target-hint'));

    const nextChar = this.passageText[this.typedChars.length];
    if (!nextChar) return;

    // Find key with dataset.ar === nextChar or dataset.shiftAr === nextChar
    const allKeys = document.querySelectorAll('.kb-key');
    for (const keyEl of allKeys) {
      if (keyEl.dataset.ar === nextChar || keyEl.dataset.shiftAr === nextChar) {
        keyEl.classList.add('target-hint');
        break;
      }
    }
  }

  bindEvents() {
    // Mode Buttons
    this.dom.levelButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        this.dom.levelButtons.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        this.currentMode = btn.dataset.mode;
        this.drillIndex = 0;
        this.renderSubLevels();
        this.loadPassage();
        this.resetTest();
      });
    });

    // Time Buttons
    this.dom.timeButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        this.dom.timeButtons.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        this.timeLimit = parseInt(btn.dataset.time, 10);
        this.resetTest();
      });
    });

    // Sound toggle
    this.dom.btnSound.addEventListener('click', () => {
      sounds.toggle();
      this.updateSoundBtn();
    });

    // Restart & Next
    this.dom.btnRestart.addEventListener('click', () => this.resetTest());
    this.dom.btnNextDrill.addEventListener('click', () => this.nextDrill());

    // Focus arena
    const focusArena = () => {
      if (this.isCompleted) return;
      this.dom.clickPrompt.classList.add('hidden');
      this.dom.hiddenInput.focus();
    };

    this.dom.arenaRtl.addEventListener('click', focusArena);
    this.dom.clickPrompt.addEventListener('click', focusArena);

    window.addEventListener('keydown', (e) => {
      if (e.key === 'Tab') {
        e.preventDefault();
        this.resetTest();
        return;
      }
      if (e.key === 'Escape' && this.dom.modalBackdrop.classList.contains('active')) {
        this.closeModal();
      }
      if (!this.dom.clickPrompt.classList.contains('hidden') && e.key.length === 1) {
        focusArena();
      }

      // Check physical key on on-screen keyboard
      const pressedKey = e.key.toLowerCase();
      const matchedKey = document.querySelector(`.kb-key[data-latin="${pressedKey}"]`) ||
                         document.querySelector(`.kb-key[data-ar="${e.key}"]`);
      if (matchedKey) this.flashKey(matchedKey);
    });

    // Input handling
    this.dom.hiddenInput.addEventListener('input', (e) => this.handleInput(e));
    this.dom.hiddenInput.addEventListener('keydown', (e) => {
      if (e.key === 'Backspace' && this.typedChars.length > 0 && !this.isCompleted) {
        this.typedChars.pop();
        sounds.playKey();
        this.renderPassage();
        this.updateStats();
        this.highlightTargetKey();
      }
    });

    // Modal
    this.dom.modalRetry.addEventListener('click', () => {
      this.closeModal();
      this.resetTest();
    });
    this.dom.modalNext.addEventListener('click', () => {
      this.closeModal();
      this.nextDrill();
    });
  }

  renderSubLevels() {
    const list = ARABIC_DRILLS[this.currentMode] || [];
    this.dom.subLevelList.innerHTML = '<span class="tags-label">المجموعة:</span>';

    list.forEach((item, idx) => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = `tag-btn ${idx === this.drillIndex ? 'active' : ''}`;
      btn.textContent = item.title;
      btn.addEventListener('click', () => {
        this.dom.subLevelList.querySelectorAll('.tag-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        this.drillIndex = idx;
        this.loadPassage();
        this.resetTest();
      });
      this.dom.subLevelList.appendChild(btn);
    });
  }

  nextDrill() {
    const list = ARABIC_DRILLS[this.currentMode] || [];
    this.drillIndex = (this.drillIndex + 1) % list.length;
    this.renderSubLevels();
    this.loadPassage();
    this.resetTest();
  }

  loadPassage() {
    const list = ARABIC_DRILLS[this.currentMode] || [];
    const item = list[this.drillIndex] || list[0];
    this.passageText = item ? item.text : "بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ";
  }

  resetTest() {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
      this.timerInterval = null;
    }

    this.hasStarted = false;
    this.isCompleted = false;
    this.typedChars = [];
    this.mistakesCount = 0;
    this.startTime = null;
    this.timeRemaining = this.timeLimit;

    this.dom.hiddenInput.value = '';
    this.dom.clickPrompt.classList.remove('hidden');

    this.renderPassage();
    this.updateStats();
    this.highlightTargetKey();

    if (this.timeLimit > 0) {
      this.dom.statTimer.textContent = `${toArNum(this.timeLimit)} ث`;
    } else {
      this.dom.statTimer.textContent = '٠ ث';
    }
  }

  insertCharacter(char) {
    if (this.isCompleted) return;
    if (!this.hasStarted) this.startTimer();

    const targetChar = this.passageText[this.typedChars.length];
    if (!targetChar) return;

    if (char === targetChar) {
      this.typedChars.push({ char, correct: true });
      sounds.playKey();
    } else {
      this.typedChars.push({ char, correct: false });
      this.mistakesCount += 1;
      sounds.playError();
    }

    this.renderPassage();
    this.updateStats();
    this.highlightTargetKey();

    if (this.typedChars.length >= this.passageText.length) {
      this.finishTest();
    }
  }

  handleInput(e) {
    if (this.isCompleted) return;
    const val = this.dom.hiddenInput.value;
    if (!val) return;

    const char = val.slice(-1);
    this.dom.hiddenInput.value = '';

    this.insertCharacter(char);
  }

  startTimer() {
    this.hasStarted = true;
    this.startTime = Date.now();

    if (this.timeLimit > 0) {
      this.timeRemaining = this.timeLimit;
      this.timerInterval = setInterval(() => {
        this.timeRemaining -= 1;
        this.dom.statTimer.textContent = `${toArNum(this.timeRemaining)} ث`;
        this.updateStats();

        if (this.timeRemaining <= 0) {
          clearInterval(this.timerInterval);
          this.timerInterval = null;
          this.finishTest();
        }
      }, 1000);
    } else {
      let sec = 0;
      this.timerInterval = setInterval(() => {
        sec += 1;
        this.dom.statTimer.textContent = `${toArNum(sec)} ث`;
        this.updateStats();
      }, 1000);
    }
  }

  updateStats() {
    const elapsedMinutes = this.startTime ? Math.max((Date.now() - this.startTime) / 60000, 0.01) : 0.01;
    const correctCount = this.typedChars.filter(c => c.correct).length;
    const totalTyped = this.typedChars.length;

    // Arabic WPM: 1 word ~ 4.5 chars
    const netWpm = Math.max(0, Math.round((correctCount / 4.5) / elapsedMinutes));
    const accuracy = totalTyped === 0 ? 100 : Math.round((correctCount / totalTyped) * 100);
    const cpm = Math.round(correctCount / elapsedMinutes);

    this.dom.statWpm.textContent = this.hasStarted ? toArNum(netWpm) : '٠';
    this.dom.statAccuracy.textContent = `${toArNum(accuracy)}٪`;
    this.dom.statCpm.textContent = this.hasStarted ? toArNum(cpm) : '٠';
    this.dom.statErrors.textContent = toArNum(this.mistakesCount);

    const progressPercent = Math.min(100, Math.round((totalTyped / this.passageText.length) * 100));
    this.dom.progressTrackBar.style.width = `${progressPercent}%`;
  }

  renderPassage() {
    const container = this.dom.arabicTextFlow;
    container.innerHTML = '';

    const currentIndex = this.typedChars.length;

    for (let i = 0; i < this.passageText.length; i++) {
      const span = document.createElement('span');
      span.className = 'ar-char';
      span.textContent = this.passageText[i];

      if (i < currentIndex) {
        span.classList.add(this.typedChars[i].correct ? 'correct' : 'incorrect');
      } else if (i === currentIndex) {
        span.classList.add('current');
      }

      container.appendChild(span);
    }

    const currentSpan = container.querySelector('.ar-char.current');
    if (currentSpan) {
      const parentRect = container.getBoundingClientRect();
      const spanRect = currentSpan.getBoundingClientRect();
      if (spanRect.bottom > parentRect.bottom || spanRect.top < parentRect.top) {
        currentSpan.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
  }

  finishTest() {
    if (this.isCompleted) return;
    this.isCompleted = true;

    if (this.timerInterval) {
      clearInterval(this.timerInterval);
      this.timerInterval = null;
    }

    sounds.playComplete();

    const elapsedMinutes = this.startTime ? Math.max((Date.now() - this.startTime) / 60000, 0.05) : 0.05;
    const correctCount = this.typedChars.filter(c => c.correct).length;
    const totalTyped = this.typedChars.length;
    const netWpm = Math.max(0, Math.round((correctCount / 4.5) / elapsedMinutes));
    const accuracy = totalTyped === 0 ? 100 : Math.round((correctCount / totalTyped) * 100);
    const wordsTyped = Math.round(correctCount / 4.5);

    const result = recordTypingSession({
      language: 'arabic',
      wpm: netWpm,
      accuracy,
      wordsCount: wordsTyped,
      charsCount: totalTyped,
      mistakes: this.mistakesCount
    });

    this.dom.modalWpm.textContent = toArNum(netWpm);
    this.dom.modalAcc.textContent = `${toArNum(accuracy)}٪`;
    this.dom.modalWords.textContent = toArNum(wordsTyped);
    this.dom.modalMistakes.textContent = toArNum(this.mistakesCount);

    this.dom.modalBadgesBox.innerHTML = '';
    if (result.unlockedNow && result.unlockedNow.length > 0) {
      const banner = document.createElement('div');
      banner.style.cssText = "background: linear-gradient(135deg, rgba(16, 185, 129, 0.15), rgba(78, 133, 191, 0.15)); border: 1px solid var(--success); border-radius: var(--radius-md); padding: 0.75rem 1rem; display: flex; align-items: center; gap: 0.75rem; text-align: right; direction: rtl;";
      banner.innerHTML = `
        <span style="font-size: 1.5rem;">🏆</span>
        <div>
          <strong style="color: var(--text-primary); font-size: 0.9rem;">تم فتح وسام جديد! (${toArNum(result.unlockedNow.length)})</strong>
          <div style="font-size: 0.78rem; color: var(--text-secondary);">توجه إلى غرفة الجوائز لتفقد إنجازك الجديد.</div>
        </div>
      `;
      this.dom.modalBadgesBox.appendChild(banner);
    }

    this.openModal();
  }

  openModal() {
    this.dom.modalBackdrop.classList.add('active');
  }

  closeModal() {
    this.dom.modalBackdrop.classList.remove('active');
  }
}

document.addEventListener('DOMContentLoaded', () => {
  new ArabicTypingEngine();
});