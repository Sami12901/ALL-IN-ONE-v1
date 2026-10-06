/**
 * Hindi Typing Trainer (हिंदी टाइपिंग ट्यूटर)
 * Devanagari touch-typing engine with Inscript visual keyboard layout,
 * Swar, Vyanjan, Matras, and Hindi literature passages, Web Audio, and gamification.
 */

// Devanagari Digits Converter
const HI_DIGITS = ['०', '१', '२', '३', '४', '५', '६', '७', '८', '९'];
function toHiNum(num) {
  return String(num).replace(/[0-9]/g, d => HI_DIGITS[parseInt(d, 10)]);
}

// Inscript Layout Definition
const HINDI_INSCRIPT_LAYOUT = [
  // Row 1
  [
    { latin: '`', hi: '़', shiftHi: '्' },
    { latin: '1', hi: '१', shiftHi: 'ऍ' },
    { latin: '2', hi: '२', shiftHi: 'ॅ' },
    { latin: '3', hi: '३', shiftHi: '्र' },
    { latin: '4', hi: '४', shiftHi: 'र्' },
    { latin: '5', hi: '५', shiftHi: 'ज्ञ' },
    { latin: '6', hi: '६', shiftHi: 'त्र' },
    { latin: '7', hi: '७', shiftHi: 'क्ष' },
    { latin: '8', hi: '८', shiftHi: 'श्र' },
    { latin: '9', hi: '९', shiftHi: '(' },
    { latin: '0', hi: '०', shiftHi: ')' },
    { latin: '-', hi: '-', shiftHi: 'ः' },
    { latin: '=', hi: 'ऋ', shiftHi: 'ऋ' }
  ],
  // Row 2
  [
    { latin: 'q', hi: 'ौ', shiftHi: 'औ' },
    { latin: 'w', hi: 'ै', shiftHi: 'ऐ' },
    { latin: 'e', hi: 'ा', shiftHi: 'आ' },
    { latin: 'r', hi: 'ी', shiftHi: 'ई' },
    { latin: 't', hi: 'ू', shiftHi: 'ऊ' },
    { latin: 'y', hi: 'भ', shiftHi: 'भ' },
    { latin: 'u', hi: 'ङ', shiftHi: 'ङ' },
    { latin: 'i', hi: 'घ', shiftHi: 'घ' },
    { latin: 'o', hi: 'ध', shiftHi: 'ध' },
    { latin: 'p', hi: 'झ', shiftHi: 'झ' },
    { latin: '[', hi: 'ढ', shiftHi: 'ढ' },
    { latin: ']', hi: 'ञ', shiftHi: 'ञ' }
  ],
  // Row 3
  [
    { latin: 'a', hi: 'ो', shiftHi: 'ओ' },
    { latin: 's', hi: 'े', shiftHi: 'ए' },
    { latin: 'd', hi: '्', shiftHi: 'अ' },
    { latin: 'f', hi: 'ि', shiftHi: 'इ' },
    { latin: 'g', hi: 'ु', shiftHi: 'उ' },
    { latin: 'h', hi: 'प', shiftHi: 'फ' },
    { latin: 'j', hi: 'र', shiftHi: 'ऱ' },
    { latin: 'k', hi: 'क', shiftHi: 'ख' },
    { latin: 'l', hi: 'त', shiftHi: 'थ' },
    { latin: ';', hi: 'च', shiftHi: 'छ' },
    { latin: "'", hi: 'ट', shiftHi: 'ठ' }
  ],
  // Row 4
  [
    { latin: 'z', hi: 'ौ', shiftHi: 'ॉ' },
    { latin: 'x', hi: 'ं', shiftHi: 'ँ' },
    { latin: 'c', hi: 'म', shiftHi: 'ण' },
    { latin: 'v', hi: 'न', shiftHi: 'ऩ' },
    { latin: 'b', hi: 'व', shiftHi: 'ऴ' },
    { latin: 'n', hi: 'ल', shiftHi: 'ळ' },
    { latin: 'm', hi: 'स', shiftHi: 'श' },
    { latin: ',', hi: ',', shiftHi: 'ष' },
    { latin: '.', hi: '.', shiftHi: '।' },
    { latin: '/', hi: 'य', shiftHi: 'य़' }
  ]
];

// Hindi Drills Database
const HINDI_DRILLS = {
  swar: [
    { title: "मूल स्वर वर्णमाला", text: "अ आ इ ई उ ऊ ऋ ए ऐ ओ औ अं अः" },
    { title: "स्वर युक्त शब्द", text: "आज आप इधर ईश्वर ऊपर एक ऐसा और औरत अनाज इनाम ऊर्जा" },
    { title: "स्वर वाक्य अभ्यास", text: "ईश्वर की कृपा से आज हम सब एक साथ मिलकर अध्ययन कर रहे हैं।" }
  ],
  vyanjan: [
    { title: "क से ट वर्ग", text: "क ख ग घ ङ च छ ज झ ञ ट ठ ड ढ ण" },
    { title: "त से प वर्ग", text: "त थ द ध न प फ ब भ म" },
    { title: "अंतस्थ व ऊष्म व्यंजन", text: "य र ल व श ष स ह क्ष त्र ज्ञ श्र" },
    { title: "सरल शब्दमाला", text: "कमल खत गगन घर जल तरबूज फल बस मटर रथ शहर हवन नयन" }
  ],
  matras: [
    { title: "मात्राओं की पहचान", text: "ा ि ी ु ू ृ े ै ो ौ ं ः ँ" },
    { title: "मात्रा युक्त शब्द", text: "किताब पानी गुलाब सेब पैसा कोयल औरत दीपक सूरज सैनिक" },
    { title: "संयुक्त व हलंत शब्द", text: "सत्य कर्म विद्या न्याय धर्म प्रकाश ज्ञान राष्ट्र संकल्प" }
  ],
  literature: [
    {
      title: "कबीर के दोहे",
      text: "बुरा जो देखन मैं चला, बुरा न मिलिया कोय। जो दिल खोजा आपना, मुझसे बुरा न कोय॥"
    },
    {
      title: "हरिवंशराय बच्चन - अग्निपथ",
      text: "लहरों से डर कर नौका पार नहीं होती, हिम्मत करने वालों की कभी हार नहीं होती। नन्हीं चींटी जब दाना लेकर चलती है, चढ़ती दीवारों पर सौ बार फिसलती है।"
    },
    {
      title: "मुंशी प्रेमचंद - विचार",
      text: "साधना और कर्म ही मनुष्य की वास्तविक पहचान हैं। सच्ची लगन और निष्ठा से किया गया कार्य कभी व्यर्थ नहीं जाता, वही जीवन का सच्चा आनंद है।"
    },
    {
      title: "रामधारी सिंह दिनकर - रश्मिरथी",
      text: "सच है, विपत्ति जब आती है, कायर को ही दहलाती है, शूरमा नहीं विचलित होते, क्षण एक नहीं धीरज खोते, विघ्नों को गले लगाते हैं, कांटों में राह बनाते हैं।"
    }
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
      osc.frequency.setValueAtTime(560 + Math.random() * 220, t);
      osc.frequency.exponentialRampToValueAtTime(70, t + 0.04);

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
      osc.frequency.setValueAtTime(135, t);
      osc.frequency.linearRampToValueAtTime(95, t + 0.08);

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
function recordTypingSession({ language = 'hindi', wpm, accuracy, wordsCount, charsCount, mistakes }) {
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
  checkBadge('devanagari', (data.languagesUsed['hindi']?.tests || 0) >= 1);
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

/* ================= Hindi Typing Engine ================= */
class HindiTypingEngine {
  constructor() {
    this.currentMode = 'swar';
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
      modeButtons: document.querySelectorAll('.mode-card-btn'),
      subDrillWrap: document.getElementById('subDrillWrap'),
      timeButtons: document.querySelectorAll('.toolbar-box .filter-btn[data-time]'),
      statWpm: document.getElementById('statWpm'),
      statAccuracy: document.getElementById('statAccuracy'),
      statCpm: document.getElementById('statCpm'),
      statTimer: document.getElementById('statTimer'),
      statErrors: document.getElementById('statErrors'),
      arenaBox: document.getElementById('arenaBox'),
      hindiTextDisplay: document.getElementById('hindiTextDisplay'),
      hiddenInput: document.getElementById('hiddenInput'),
      arenaPrompt: document.getElementById('arenaPrompt'),
      gaugeFill: document.getElementById('gaugeFill'),
      btnRestart: document.getElementById('btnRestart'),
      btnNextDrill: document.getElementById('btnNextDrill'),
      btnSound: document.getElementById('btnSound'),
      soundIcon: document.getElementById('soundIcon'),
      soundLabel: document.getElementById('soundLabel'),
      // Keyboard rows
      hiKbRows: [
        document.getElementById('hiKbRow1'),
        document.getElementById('hiKbRow2'),
        document.getElementById('hiKbRow3'),
        document.getElementById('hiKbRow4'),
        document.getElementById('hiKbRow5')
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
    this.buildKeyboard();
    this.renderSubDrills();
    this.loadPassage();
    this.bindEvents();
    this.highlightTargetKey();
  }

  updateSoundBtn() {
    if (this.dom.btnSound) {
      this.dom.soundIcon.textContent = sounds.enabled ? '🔊' : '🔇';
      this.dom.soundLabel.textContent = `ध्वनि: ${sounds.enabled ? 'चालू' : 'बंद'}`;
    }
  }

  buildKeyboard() {
    HINDI_INSCRIPT_LAYOUT.forEach((row, rowIndex) => {
      const container = this.dom.hiKbRows[rowIndex];
      if (!container) return;
      container.innerHTML = '';

      row.forEach(item => {
        const keyEl = document.createElement('div');
        keyEl.className = 'hi-kb-key';
        keyEl.dataset.latin = item.latin;
        keyEl.dataset.hi = item.hi;
        if (item.shiftHi) keyEl.dataset.shiftHi = item.shiftHi;

        keyEl.innerHTML = `
          <span class="latin-sub">${item.latin.toUpperCase()}</span>
          <span>${item.hi}</span>
        `;

        keyEl.addEventListener('mousedown', (e) => {
          e.preventDefault();
          this.insertCharacter(item.hi);
          this.flashKey(keyEl);
        });

        container.appendChild(keyEl);
      });
    });

    // Spacebar
    const row5 = this.dom.hiKbRows[4];
    if (row5) {
      row5.innerHTML = '';
      const spaceKey = document.createElement('div');
      spaceKey.className = 'hi-kb-key space';
      spaceKey.dataset.latin = ' ';
      spaceKey.dataset.hi = ' ';
      spaceKey.innerHTML = `<span>Space (स्पेस)</span>`;
      spaceKey.addEventListener('mousedown', (e) => {
        e.preventDefault();
        this.insertCharacter(' ');
        this.flashKey(spaceKey);
      });
      row5.appendChild(spaceKey);
    }
  }

  flashKey(keyEl) {
    if (!keyEl) return;
    keyEl.classList.add('active-press');
    setTimeout(() => keyEl.classList.remove('active-press'), 120);
  }

  highlightTargetKey() {
    document.querySelectorAll('.hi-kb-key.target-hint').forEach(k => k.classList.remove('target-hint'));

    const nextChar = this.passageText[this.typedChars.length];
    if (!nextChar) return;

    const allKeys = document.querySelectorAll('.hi-kb-key');
    for (const keyEl of allKeys) {
      if (keyEl.dataset.hi === nextChar || keyEl.dataset.shiftHi === nextChar) {
        keyEl.classList.add('target-hint');
        break;
      }
    }
  }

  bindEvents() {
    // Mode Buttons
    this.dom.modeButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        this.dom.modeButtons.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        this.currentMode = btn.dataset.mode;
        this.drillIndex = 0;
        this.renderSubDrills();
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
      this.dom.arenaPrompt.classList.add('hidden');
      this.dom.hiddenInput.focus();
    };

    this.dom.arenaBox.addEventListener('click', focusArena);
    this.dom.arenaPrompt.addEventListener('click', focusArena);

    window.addEventListener('keydown', (e) => {
      if (e.key === 'Tab') {
        e.preventDefault();
        this.resetTest();
        return;
      }
      if (e.key === 'Escape' && this.dom.modalBackdrop.classList.contains('active')) {
        this.closeModal();
      }
      if (!this.dom.arenaPrompt.classList.contains('hidden') && e.key.length === 1) {
        focusArena();
      }

      const pressedKey = e.key.toLowerCase();
      const matchedKey = document.querySelector(`.hi-kb-key[data-latin="${pressedKey}"]`) ||
                         document.querySelector(`.hi-kb-key[data-hi="${e.key}"]`);
      if (matchedKey) this.flashKey(matchedKey);
    });

    // Input handlers
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

  renderSubDrills() {
    const list = HINDI_DRILLS[this.currentMode] || [];
    this.dom.subDrillWrap.innerHTML = '<span class="pill-heading">अभ्यास वर्ग:</span>';

    list.forEach((item, idx) => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = `filter-btn ${idx === this.drillIndex ? 'active' : ''}`;
      btn.textContent = item.title;
      btn.addEventListener('click', () => {
        this.dom.subDrillWrap.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        this.drillIndex = idx;
        this.loadPassage();
        this.resetTest();
      });
      this.dom.subDrillWrap.appendChild(btn);
    });
  }

  nextDrill() {
    const list = HINDI_DRILLS[this.currentMode] || [];
    this.drillIndex = (this.drillIndex + 1) % list.length;
    this.renderSubDrills();
    this.loadPassage();
    this.resetTest();
  }

  loadPassage() {
    const list = HINDI_DRILLS[this.currentMode] || [];
    const item = list[this.drillIndex] || list[0];
    this.passageText = item ? item.text : "अ आ इ ई उ ऊ";
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
    this.dom.arenaPrompt.classList.remove('hidden');

    this.renderPassage();
    this.updateStats();
    this.highlightTargetKey();

    if (this.timeLimit > 0) {
      this.dom.statTimer.textContent = `${toHiNum(this.timeLimit)} से.`;
    } else {
      this.dom.statTimer.textContent = '० से.';
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
        this.dom.statTimer.textContent = `${toHiNum(this.timeRemaining)} से.`;
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
        this.dom.statTimer.textContent = `${toHiNum(sec)} से.`;
        this.updateStats();
      }, 1000);
    }
  }

  updateStats() {
    const elapsedMinutes = this.startTime ? Math.max((Date.now() - this.startTime) / 60000, 0.01) : 0.01;
    const correctCount = this.typedChars.filter(c => c.correct).length;
    const totalTyped = this.typedChars.length;

    // Hindi WPM: 1 word ~ 4.5 chars
    const netWpm = Math.max(0, Math.round((correctCount / 4.5) / elapsedMinutes));
    const accuracy = totalTyped === 0 ? 100 : Math.round((correctCount / totalTyped) * 100);
    const cpm = Math.round(correctCount / elapsedMinutes);

    this.dom.statWpm.textContent = this.hasStarted ? toHiNum(netWpm) : '०';
    this.dom.statAccuracy.textContent = `${toHiNum(accuracy)}%`;
    this.dom.statCpm.textContent = this.hasStarted ? toHiNum(cpm) : '०';
    this.dom.statErrors.textContent = toHiNum(this.mistakesCount);

    const progressPercent = Math.min(100, Math.round((totalTyped / this.passageText.length) * 100));
    this.dom.gaugeFill.style.width = `${progressPercent}%`;
  }

  renderPassage() {
    const container = this.dom.hindiTextDisplay;
    container.innerHTML = '';

    const currentIndex = this.typedChars.length;

    for (let i = 0; i < this.passageText.length; i++) {
      const span = document.createElement('span');
      span.className = 'hi-char';
      span.textContent = this.passageText[i];

      if (i < currentIndex) {
        span.classList.add(this.typedChars[i].correct ? 'correct' : 'incorrect');
      } else if (i === currentIndex) {
        span.classList.add('current');
      }

      container.appendChild(span);
    }

    const currentSpan = container.querySelector('.hi-char.current');
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
      language: 'hindi',
      wpm: netWpm,
      accuracy,
      wordsCount: wordsTyped,
      charsCount: totalTyped,
      mistakes: this.mistakesCount
    });

    this.dom.modalWpm.textContent = toHiNum(netWpm);
    this.dom.modalAcc.textContent = `${toHiNum(accuracy)}%`;
    this.dom.modalWords.textContent = toHiNum(wordsTyped);
    this.dom.modalMistakes.textContent = toHiNum(this.mistakesCount);

    this.dom.modalBadgesBox.innerHTML = '';
    if (result.unlockedNow && result.unlockedNow.length > 0) {
      const banner = document.createElement('div');
      banner.style.cssText = "background: linear-gradient(135deg, rgba(16, 185, 129, 0.15), rgba(78, 133, 191, 0.15)); border: 1px solid var(--success); border-radius: var(--radius-md); padding: 0.75rem 1rem; display: flex; align-items: center; gap: 0.75rem; text-align: left;";
      banner.innerHTML = `
        <span style="font-size: 1.5rem;">🏆</span>
        <div>
          <strong style="color: var(--text-primary); font-size: 0.9rem;">नया बैज प्राप्त हुआ! (${toHiNum(result.unlockedNow.length)})</strong>
          <div style="font-size: 0.78rem; color: var(--text-secondary);">अपनी उपलब्धि देखने के लिए ट्रॉफी रूम में जाएँ।</div>
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
  new HindiTypingEngine();
});