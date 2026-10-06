/**
 * Bangla Typing Tutor & Multi-Layout Trainer
 * Features: Vowels, Consonants, Conjuncts, Poetry/Literature, Avro/Bijoy Cheatsheets,
 * Real-time WPM, Accuracy, Web Audio Synthesizer, and Gamification.
 */

// Bengali Digits Converter
const BN_DIGITS = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
function toBnNum(num) {
  return String(num).replace(/[0-9]/g, d => BN_DIGITS[parseInt(d, 10)]);
}

// Bengali Drills Database
const BANGLA_DRILLS = {
  vowels: [
    { title: "স্বরবর্ণ মালা", text: "অ আ ই ঈ উ ঊ ঋ এ ঐ ও ঔ" },
    { title: "কারচিহ্ন মালা", text: "া ি ী ু ূ ৃ ে ৈ ো ৌ" },
    { title: "স্বরবর্ণ শব্দমালা", text: "আম জাম ইট ঈগল উট ঊর্মি ঋষি এক ঐরাবত ওজন ঔষধ" },
    { title: "কারযুক্ত শব্দ", text: "বাবা মা কাকা মামা দিদি নানি ভাই বোন বাড়ি গাড়ি ফুল নদী" }
  ],
  consonants: [
    { title: "ব্যঞ্জনবর্ণ মালা (১)", text: "ক খ গ ঘ ঙ চ ছ জ ঝ ঞ ট ঠ ড ঢ ণ" },
    { title: "ব্যঞ্জনবর্ণ মালা (২)", text: "ত থ দ ধ ন প ফ ব ভ ম য র ল শ ষ" },
    { title: "ব্যঞ্জনবর্ণ মালা (৩)", text: "স হ ড় ঢ় য় ৎ ং ঃ ঁ" },
    { title: "সহজ শব্দমালা", text: "কলম খাতা গান ঘর চাঁদ জল ঝরনা টাকা ঢোল তবলা ধান পতাকা বন" }
  ],
  conjuncts: [
    { title: "সাধারণ যুক্তবর্ণ", text: "ক্ষ জ্ঞ ঞ্চ ঞ্জ ঙ্ক ঙ্গ ত্ত ত্র দ্ধ দ্ব ন্ত ন্দ" },
    { title: "উন্নত যুক্তবর্ণ", text: "ম্প ম্ব ল্ক ল্প ষ্ট ষ্ঠ স্ন স্প স্ক ক্ত গ্ধ" },
    { title: "যুক্তবর্ণ শব্দমালা", text: "শিক্ষা বিজ্ঞান কঙ্কণ আনন্দ শান্তি রক্ত মুগ্ধ বন্ধন স্পষ্ট স্নাতক" },
    { title: "যুক্তাক্ষর বাক্য", text: "জ্ঞানী ব্যক্তি সর্বদা সত্য বাক্য প্রকাশ করেন ও আত্মবিশ্বাস বজায় রাখেন।" }
  ],
  literature: [
    {
      title: "রবীন্দ্রনাথ ঠাকুর - চিত্ত যেথা ভয়শূন্য",
      text: "চিত্ত যেথা ভয়শূন্য, উচ্চ যেথা শির, জ্ঞান যেথা মুক্ত, যেথা গৃহের প্রাচীর আপন প্রাঙ্গণতলে দিবসশর্বরী বসুধারে রাখে নাই খণ্ড ক্ষুদ্র করি।"
    },
    {
      title: "রবীন্দ্রনাথ ঠাকুর - প্রাণ",
      text: "মরিতে চাহি না আমি সুন্দর ভুবনে, মানবের মাঝে আমি বাঁচিবারে চাই। এই সূর্যকরে এই পুষ্পিত কাননে জীবন্ত হৃদয়-মাঝে যদি স্থান পাই!"
    },
    {
      title: "কাজী নজরুল ইসলাম - বিদ্রোহী",
      text: "বল বীর— বল উন্নত মম শির! শির নেহারি আমারি নতশির ওই শিখর হিমাদ্রির! বল বীর— বল মহাবিশ্বের মহাকাশ ফাড়ি চন্দ্র সূর্য গ্রহ তারা ছাড়ি ভূলোক দ্যুলোক গোলক ভেদিয়া।"
    },
    {
      title: "অতুলপ্রসাদ সেন - মোদের গরব",
      text: "মোদের গরব মোদের আশা, আ-মরি বাংলা ভাষা! তোমার কোলে তোমার বোলে কতই শান্তি ভালোবাসা। কি যাদু বাংলা গানে, গান গেয়ে দাঁড় মাঝি টানে!"
    },
    {
      title: "জীবনানন্দ দাশ - বনলতা সেন",
      text: "হাজার বছর ধরে আমি পথ হাঁটিতেছি পৃথিবীর পথে, সিংহল সমুদ্র থেকে নিশীথের অন্ধকারে মালয় সাগরে অনেক ঘুরেছি আমি; বিম্বিসার অশোকের ধূসর জগতে সেখানে ছিলাম আমি।"
    }
  ]
};

// Avro Key Mapper for on-the-fly transliteration if direct key pressed
const AVRO_MAP = {
  'k': 'ক', 'kh': 'খ', 'g': 'গ', 'gh': 'ঘ', 'Ng': 'ঙ',
  'c': 'চ', 'ch': 'ছ', 'j': 'জ', 'jh': 'ঝ', 'NG': 'ঞ',
  'T': 'ট', 'Th': 'ঠ', 'D': 'ড', 'Dh': 'ঢ', 'N': 'ণ',
  't': 'ত', 'th': 'থ', 'd': 'দ', 'dh': 'ধ', 'n': 'ন',
  'p': 'প', 'f': 'ফ', 'ph': 'ফ', 'b': 'ব', 'bh': 'ভ', 'v': 'ভ', 'm': 'ম',
  'z': 'য', 'r': 'র', 'l': 'ল', 'sh': 'শ', 'S': 'শ', 'Sh': 'ষ', 's': 'স', 'h': 'হ',
  'R': 'ড়', 'Rh': 'ঢ়', 'y': 'য়',
  'o': 'অ', 'a': 'আ', 'i': 'ই', 'I': 'ঈ', 'u': 'উ', 'U': 'ঊ',
  'e': 'এ', 'OI': 'ঐ', 'O': 'ও', 'OU': 'ঔ'
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
      osc.frequency.setValueAtTime(550 + Math.random() * 200, t);
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
      osc.frequency.setValueAtTime(130, t);
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
      const notes = [440, 554.37, 659.25, 880]; // A4, C#5, E5, A5
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

/* ================= LocalStorage Gamification Sync ================= */
function recordTypingSession({ language = 'bangla', wpm, accuracy, wordsCount, charsCount, mistakes }) {
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

  // XP & Level
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
  checkBadge('bangla_pioneer', (data.languagesUsed['bangla']?.tests || 0) >= 1);
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

/* ================= Bangla Typing Engine ================= */
class BanglaTypingEngine {
  constructor() {
    this.currentMode = 'vowels';
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
      drillButtons: document.querySelectorAll('.drill-btn'),
      subDrillGroup: document.getElementById('subDrillGroup'),
      timeButtons: document.querySelectorAll('.toolbar-row .pill-tag[data-time]'),
      statWpm: document.getElementById('statWpm'),
      statAccuracy: document.getElementById('statAccuracy'),
      statCpm: document.getElementById('statCpm'),
      statTimer: document.getElementById('statTimer'),
      statErrors: document.getElementById('statErrors'),
      typingBox: document.getElementById('typingBox'),
      banglaDisplay: document.getElementById('banglaDisplay'),
      hiddenInput: document.getElementById('hiddenInput'),
      focusHint: document.getElementById('focusHint'),
      meterFill: document.getElementById('meterFill'),
      btnRestart: document.getElementById('btnRestart'),
      btnNextDrill: document.getElementById('btnNextDrill'),
      btnSound: document.getElementById('btnSound'),
      soundIcon: document.getElementById('soundIcon'),
      soundLabel: document.getElementById('soundLabel'),
      tabAvro: document.getElementById('tabAvro'),
      tabBijoy: document.getElementById('tabBijoy'),
      avroView: document.getElementById('avroView'),
      bijoyView: document.getElementById('bijoyView'),
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
    this.renderSubDrills();
    this.loadPassage();
    this.bindEvents();
  }

  updateSoundBtn() {
    if (this.dom.btnSound) {
      this.dom.soundIcon.textContent = sounds.enabled ? '🔊' : '🔇';
      this.dom.soundLabel.textContent = `সাউন্ড: ${sounds.enabled ? 'চালু' : 'বন্ধ'}`;
    }
  }

  bindEvents() {
    // Mode Buttons
    this.dom.drillButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        this.dom.drillButtons.forEach(b => b.classList.remove('active'));
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

    // Layout Cheatsheet tabs
    this.dom.tabAvro.addEventListener('click', () => {
      this.dom.tabAvro.classList.add('active');
      this.dom.tabBijoy.classList.remove('active');
      this.dom.avroView.style.display = 'block';
      this.dom.bijoyView.style.display = 'none';
    });

    this.dom.tabBijoy.addEventListener('click', () => {
      this.dom.tabBijoy.classList.add('active');
      this.dom.tabAvro.classList.remove('active');
      this.dom.bijoyView.style.display = 'block';
      this.dom.avroView.style.display = 'none';
    });

    // Restart & Next
    this.dom.btnRestart.addEventListener('click', () => this.resetTest());
    this.dom.btnNextDrill.addEventListener('click', () => this.nextDrill());

    // Focus arena
    const focusBox = () => {
      if (this.isCompleted) return;
      this.dom.focusHint.classList.add('hidden');
      this.dom.hiddenInput.focus();
    };

    this.dom.typingBox.addEventListener('click', focusBox);
    this.dom.focusHint.addEventListener('click', focusBox);

    window.addEventListener('keydown', (e) => {
      if (e.key === 'Tab') {
        e.preventDefault();
        this.resetTest();
        return;
      }
      if (e.key === 'Escape' && this.dom.modalBackdrop.classList.contains('active')) {
        this.closeModal();
      }
      if (!this.dom.focusHint.classList.contains('hidden') && e.key.length === 1) {
        focusBox();
      }
    });

    // Input handlers
    this.dom.hiddenInput.addEventListener('input', (e) => this.handleInput(e));
    this.dom.hiddenInput.addEventListener('keydown', (e) => {
      if (e.key === 'Backspace' && this.typedChars.length > 0 && !this.isCompleted) {
        this.typedChars.pop();
        sounds.playKey();
        this.renderPassage();
        this.updateStats();
      }
    });

    // Modal buttons
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
    const drills = BANGLA_DRILLS[this.currentMode] || [];
    this.dom.subDrillGroup.innerHTML = '<span class="pill-title">অনুশীলন:</span>';

    drills.forEach((d, idx) => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = `pill-tag ${idx === this.drillIndex ? 'active' : ''}`;
      btn.textContent = d.title;
      btn.addEventListener('click', () => {
        this.dom.subDrillGroup.querySelectorAll('.pill-tag').forEach(p => p.classList.remove('active'));
        btn.classList.add('active');
        this.drillIndex = idx;
        this.loadPassage();
        this.resetTest();
      });
      this.dom.subDrillGroup.appendChild(btn);
    });
  }

  nextDrill() {
    const drills = BANGLA_DRILLS[this.currentMode] || [];
    this.drillIndex = (this.drillIndex + 1) % drills.length;
    this.renderSubDrills();
    this.loadPassage();
    this.resetTest();
  }

  loadPassage() {
    const drills = BANGLA_DRILLS[this.currentMode] || [];
    const item = drills[this.drillIndex] || drills[0];
    this.passageText = item ? item.text : "আমাদের ছোট নদী চলে আঁকে বাঁকে";
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
    this.dom.focusHint.classList.remove('hidden');

    this.renderPassage();
    this.updateStats();

    if (this.timeLimit > 0) {
      this.dom.statTimer.textContent = `${toBnNum(this.timeLimit)} সে.`;
    } else {
      this.dom.statTimer.textContent = '০ সে.';
    }
  }

  handleInput(e) {
    if (this.isCompleted) return;
    const val = this.dom.hiddenInput.value;
    if (!val) return;

    const char = val.slice(-1);
    this.dom.hiddenInput.value = '';

    if (!this.hasStarted) {
      this.startTimer();
    }

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

    if (this.typedChars.length >= this.passageText.length) {
      this.finishTest();
    }
  }

  startTimer() {
    this.hasStarted = true;
    this.startTime = Date.now();

    if (this.timeLimit > 0) {
      this.timeRemaining = this.timeLimit;
      this.timerInterval = setInterval(() => {
        this.timeRemaining -= 1;
        this.dom.statTimer.textContent = `${toBnNum(this.timeRemaining)} সে.`;
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
        this.dom.statTimer.textContent = `${toBnNum(sec)} সে.`;
        this.updateStats();
      }, 1000);
    }
  }

  updateStats() {
    const elapsedMinutes = this.startTime ? Math.max((Date.now() - this.startTime) / 60000, 0.01) : 0.01;
    const correctCount = this.typedChars.filter(c => c.correct).length;
    const totalTyped = this.typedChars.length;

    // Bangla WPM: 1 word ~ 4-5 chars
    const netWpm = Math.max(0, Math.round((correctCount / 4.5) / elapsedMinutes));
    const accuracy = totalTyped === 0 ? 100 : Math.round((correctCount / totalTyped) * 100);
    const cpm = Math.round(correctCount / elapsedMinutes);

    this.dom.statWpm.textContent = this.hasStarted ? toBnNum(netWpm) : '০';
    this.dom.statAccuracy.textContent = `${toBnNum(accuracy)}%`;
    this.dom.statCpm.textContent = this.hasStarted ? toBnNum(cpm) : '০';
    this.dom.statErrors.textContent = toBnNum(this.mistakesCount);

    const progressPercent = Math.min(100, Math.round((totalTyped / this.passageText.length) * 100));
    this.dom.meterFill.style.width = `${progressPercent}%`;
  }

  renderPassage() {
    const container = this.dom.banglaDisplay;
    container.innerHTML = '';

    const currentIndex = this.typedChars.length;

    for (let i = 0; i < this.passageText.length; i++) {
      const span = document.createElement('span');
      span.className = 'bangla-char';
      span.textContent = this.passageText[i];

      if (i < currentIndex) {
        span.classList.add(this.typedChars[i].correct ? 'correct' : 'incorrect');
      } else if (i === currentIndex) {
        span.classList.add('current');
      }

      container.appendChild(span);
    }

    const currentSpan = container.querySelector('.bangla-char.current');
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
      language: 'bangla',
      wpm: netWpm,
      accuracy,
      wordsCount: wordsTyped,
      charsCount: totalTyped,
      mistakes: this.mistakesCount
    });

    this.dom.modalWpm.textContent = toBnNum(netWpm);
    this.dom.modalAcc.textContent = `${toBnNum(accuracy)}%`;
    this.dom.modalWords.textContent = toBnNum(wordsTyped);
    this.dom.modalMistakes.textContent = toBnNum(this.mistakesCount);

    this.dom.modalBadgesBox.innerHTML = '';
    if (result.unlockedNow && result.unlockedNow.length > 0) {
      const banner = document.createElement('div');
      banner.style.cssText = "background: linear-gradient(135deg, rgba(16, 185, 129, 0.15), rgba(78, 133, 191, 0.15)); border: 1px solid var(--success); border-radius: var(--radius-md); padding: 0.75rem 1rem; display: flex; align-items: center; gap: 0.75rem; text-align: left;";
      banner.innerHTML = `
        <span style="font-size: 1.5rem;">🏆</span>
        <div>
          <strong style="color: var(--text-primary); font-size: 0.9rem;">নতুন ব্যাজ অর্জিত হয়েছে! (${toBnNum(result.unlockedNow.length)}টি)</strong>
          <div style="font-size: 0.78rem; color: var(--text-secondary);">ট্রফি রুমে গিয়ে আপনার নতুন অর্জন দেখুন।</div>
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
  new BanglaTypingEngine();
});