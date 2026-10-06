/**
 * English Typing Master - Comprehensive Curriculum Engine
 * Supports Top 500 Words, Pangrams, Punctuation & Numbers, and Code Modes.
 * Real-time WPM, Accuracy, Web Audio sound effects, and LocalStorage sync.
 */

// Top 500 High-Frequency English Words
const TOP_500_WORDS = [
  "the", "of", "to", "and", "a", "in", "is", "it", "you", "that", "he", "was", "for", "on", "are", "as", "with", "his", "they", "i",
  "at", "be", "this", "have", "from", "or", "one", "had", "by", "word", "but", "not", "what", "all", "were", "we", "when", "your", "can", "said",
  "there", "use", "an", "each", "which", "she", "do", "how", "their", "if", "will", "up", "other", "about", "out", "many", "then", "them", "these", "so",
  "some", "her", "would", "make", "like", "him", "into", "time", "has", "look", "two", "more", "write", "go", "see", "number", "no", "way", "could", "people",
  "my", "than", "first", "water", "been", "call", "who", "oil", "its", "now", "find", "long", "down", "day", "did", "get", "come", "made", "may", "part",
  "over", "new", "sound", "take", "only", "little", "work", "know", "place", "year", "live", "me", "back", "give", "most", "very", "after", "thing", "our", "just",
  "name", "good", "sentence", "man", "think", "say", "great", "where", "help", "through", "much", "before", "line", "right", "too", "mean", "old", "any", "same", "tell",
  "boy", "follow", "came", "want", "show", "also", "around", "farm", "three", "small", "set", "put", "end", "does", "another", "well", "large", "must", "big", "even",
  "such", "because", "turn", "here", "why", "ask", "went", "men", "read", "need", "land", "different", "home", "us", "move", "try", "kind", "hand", "picture", "again",
  "change", "off", "play", "spell", "air", "away", "animal", "house", "point", "page", "letter", "mother", "answer", "found", "study", "still", "learn", "should", "america", "world",
  "high", "every", "near", "add", "food", "between", "own", "below", "country", "plant", "last", "school", "father", "keep", "tree", "never", "start", "city", "earth", "eye",
  "light", "thought", "head", "under", "story", "saw", "left", "don't", "few", "while", "along", "might", "close", "something", "seem", "next", "hard", "open", "example", "begin",
  "life", "always", "those", "both", "paper", "together", "got", "group", "often", "run", "important", "until", "children", "side", "feet", "car", "mile", "night", "walk", "white",
  "sea", "began", "grow", "took", "river", "four", "carry", "state", "once", "book", "hear", "stop", "without", "second", "late", "miss", "idea", "enough", "eat", "face",
  "watch", "far", "indian", "really", "almost", "let", "above", "girl", "sometimes", "mountain", "cut", "young", "talk", "soon", "list", "song", "being", "leave", "family", "it's",
  "body", "music", "color", "stand", "sun", "questions", "fish", "area", "mark", "dog", "horse", "birds", "problem", "complete", "room", "knew", "since", "ever", "piece", "told",
  "usually", "didn't", "friends", "easy", "heard", "order", "red", "door", "sure", "become", "top", "ship", "across", "today", "during", "short", "better", "best", "however", "low",
  "hours", "black", "products", "happened", "whole", "measure", "remember", "early", "waves", "reached", "listen", "wind", "rock", "space", "covered", "fast", "several", "hold", "himself", "toward",
  "five", "step", "morning", "passed", "vowel", "true", "hundred", "against", "pattern", "numeral", "table", "north", "slowly", "money", "map", "farm", "pulled", "draw", "voice", "seen",
  "cold", "cried", "plan", "notice", "south", "sing", "war", "ground", "fall", "king", "town", "unit", "figure", "certain", "field", "travel", "wood", "fire", "upon", "done",
  "english", "road", "half", "ten", "fly", "gave", "box", "finally", "wait", "correct", "oh", "quickly", "person", "became", "shown", "minutes", "strong", "verb", "stars", "front",
  "feel", "fact", "inches", "street", "decided", "contain", "course", "surface", "produce", "building", "ocean", "class", "note", "nothing", "rest", "carefully", "scientists", "inside", "wheels", "stay",
  "green", "known", "island", "week", "less", "machine", "base", "ago", "stood", "plane", "system", "behind", "ran", "round", "boat", "possible", "force", "brought", "understand", "warm",
  "common", "bring", "explain", "dry", "though", "language", "shape", "deep", "thousands", "yes", "clear", "equation", "yet", "government", "filled", "heat", "full", "hot", "check", "object",
  "am", "rule", "among", "noun", "power", "cannot", "able", "six", "size", "dark", "ball", "material", "special", "heavy", "fine", "pair", "circle", "include", "built"
];

// Pangrams Collection
const PANGRAMS = [
  "The quick brown fox jumps over the lazy dog near the bank of the quiet river.",
  "Pack my box with five dozen liquor jugs before the big gala event tonight.",
  "Sphinx of black quartz, judge my vow and grant me the eternal wisdom of typing.",
  "How vexingly quick daft zebras jump over the low wooden garden fence!",
  "The five boxing wizards jump quickly around the glowing enchanted crystal.",
  "Bright vixens jump; dozy fowl quack as the golden morning rays break through.",
  "Crazy Frederick bought many very exquisite opal jewels for sixty silver coins.",
  "We promptly judged antique ivory buckles for the next grand prize auction.",
  "Jaded zombies acted quaintly but kept driving their modern yellow taxicabs."
];

// Punctuation & Numbers Drills
const PUNCTUATION_DRILLS = [
  "In 2026, over 85.4% of developers reported using typing speeds above 70 WPM; that is +12% vs 2020!",
  "Equation: (x + y)^2 = x^2 + 2xy + y^2; whereas E = mc^2 revolutionized modern physics in 1905.",
  "Order #84920: 3 laptops @ $1,299.99 each; Subtotal = $3,899.97 (Tax: 8.25% = $321.75; Total = $4,221.72).",
  "Coordinates: Lat 37.7749 deg N, Long -122.4194 deg W; Altitude ~ 16.5m [Zone: 10S; Datum: WGS84].",
  "Is 'speed' > 'accuracy'? No! 99.5% accuracy @ 80 WPM > 85.0% accuracy @ 110 WPM (due to backspace cost!).",
  "Code keys: { [ ( < $ # @ ! & * + = ~ ` % ^ | \\ : ; \" ' ? / > ) ] } - Master every single symbol!"
];

// Code Snippets
const CODE_SNIPPETS = {
  javascript: [
    "function binarySearch(arr, target) {\n  let left = 0, right = arr.length - 1;\n  while (left <= right) {\n    const mid = Math.floor((left + right) / 2);\n    if (arr[mid] === target) return mid;\n    if (arr[mid] < target) left = mid + 1;\n    else right = mid - 1;\n  }\n  return -1;\n}",
    "const debounce = (fn, delay = 300) => {\n  let timer = null;\n  return (...args) => {\n    clearTimeout(timer);\n    timer = setTimeout(() => fn.apply(this, args), delay);\n  };\n};",
    "async function fetchUserData(userId) {\n  try {\n    const res = await fetch(`/api/users/${userId}`);\n    if (!res.ok) throw new Error(`HTTP error: ${res.status}`);\n    return await res.json();\n  } catch (err) {\n    console.error('Fetch failed:', err);\n  }\n}"
  ],
  python: [
    "def quick_sort(items):\n    if len(items) <= 1:\n        return items\n    pivot = items[len(items) // 2]\n    left = [x for x in items if x < pivot]\n    middle = [x for x in items if x == pivot]\n    right = [x for x in items if x > pivot]\n    return quick_sort(left) + middle + quick_sort(right)",
    "import math\n\ndef calculate_hypotenuse(a: float, b: float) -> float:\n    \"\"\"Computes Euclidean length between two perpendicular sides.\"\"\"\n    return math.sqrt(a ** 2 + b ** 2)"
  ],
  html: [
    "<section class=\"hero-container\" id=\"main-hero\">\n  <h1 class=\"title\">Touch Typing Master</h1>\n  <p class=\"lead\">Elevate your keyboard velocity and precision today.</p>\n  <button type=\"button\" class=\"btn btn-primary\">Start Practicing</button>\n</section>",
    "<div class=\"card glass-panel\" data-state=\"active\">\n  <header class=\"card-header\">\n    <span class=\"badge badge-success\">Verified 100%</span>\n  </header>\n  <main class=\"card-body\">\n    <p>Practice daily for 15 minutes to reach 90+ WPM.</p>\n  </main>\n</div>"
  ]
};

// Sub-drill definitions per mode
const SUB_DRILLS = {
  topwords: [
    { id: "top100", label: "Core 100 Words" },
    { id: "top250", label: "Top 250 Words" },
    { id: "top500", label: "All 500 Words" }
  ],
  pangrams: [
    { id: "p1", label: "Classic Fox" },
    { id: "p2", label: "Sphinx & Crystals" },
    { id: "p3", label: "All Pangrams Mix" }
  ],
  punctuation: [
    { id: "symbols_code", label: "Tech & Math" },
    { id: "financial", label: "Numbers & Finance" },
    { id: "symbols_all", label: "Keyboard Brackets & Symbols" }
  ],
  code: [
    { id: "js", label: "JavaScript" },
    { id: "python", label: "Python" },
    { id: "html", label: "HTML / CSS" }
  ]
};

/* ================= Audio Synthesizer (Web Audio API) ================= */
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

      // Mechanical switch click simulation
      const freq = 600 + Math.random() * 250;
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, t);
      osc.frequency.exponentialRampToValueAtTime(80, t + 0.04);

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
      osc.frequency.setValueAtTime(140, t);
      osc.frequency.linearRampToValueAtTime(100, t + 0.09);

      gain.gain.setValueAtTime(0.12, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.09);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(t);
      osc.stop(t + 0.09);
    } catch (_) {}
  }

  playComplete() {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;

    try {
      const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6
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
function recordTypingSession({ language = 'english', wpm, accuracy, wordsCount, charsCount, mistakes, isCode = false }) {
  const STORAGE_KEY = 'ALL_IN_ONE_TYPING_DATA';
  let data;
  try {
    data = JSON.parse(localStorage.getItem(STORAGE_KEY)) || {};
  } catch (e) {
    data = {};
  }

  // Ensure default structure
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

  if (isCode) {
    data.codeDrillsCompleted = (data.codeDrillsCompleted || 0) + 1;
  }
  if (mistakes === 0 && wordsCount >= 10) {
    data.perfectDrillsCompleted = (data.perfectDrillsCompleted || 0) + 1;
  }

  // Calculate Streak
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

  // XP & Level calculations
  const gainedXP = Math.round(wpm * 2 + wordsCount + (accuracy >= 98 ? 40 : 15));
  data.xp = (data.xp || 0) + gainedXP;
  data.level = Math.floor(Math.sqrt(data.xp / 100)) + 1;

  // Achievement unlock evaluator
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
  checkBadge('code_warrior', (data.codeDrillsCompleted || 0) >= 1);
  checkBadge('bangla_pioneer', (data.languagesUsed['bangla']?.tests || 0) >= 1);
  checkBadge('arabesque', (data.languagesUsed['arabic']?.tests || 0) >= 1);
  checkBadge('devanagari', (data.languagesUsed['hindi']?.tests || 0) >= 1);
  checkBadge('bilingual_scribe', langsCount >= 2);
  checkBadge('polyglot_typist', langsCount >= 3);
  checkBadge('quad_lingual', langsCount >= 4);
  checkBadge('streak_3', (data.streak || 1) >= 3);
  checkBadge('streak_7', (data.streak || 1) >= 7);
  checkBadge('century_club', (data.totalWords || 0) >= 100);
  checkBadge('marathoneer', (data.totalWords || 0) >= 500);
  checkBadge('endurance_master', (data.totalWords || 0) >= 1000);
  checkBadge('olympian', (data.totalWords || 0) >= 5000);

  const unlockedCount = Object.keys(data.unlockedBadges).length;
  checkBadge('grandmaster', unlockedCount >= 18 && (data.level || 1) >= 10);

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (e) {
    console.warn('LocalStorage save failed:', e);
  }

  return { gainedXP, unlockedNow, totalUnlocked: Object.keys(data.unlockedBadges).length };
}

/* ================= English Typing UI & Engine ================= */
class EnglishTypingEngine {
  constructor() {
    this.currentMode = 'topwords';
    this.currentSubDrill = 'top100';
    this.timeLimit = 30; // seconds, 0 = unlimited/passage mode
    this.timerInterval = null;
    this.timeRemaining = 30;
    this.hasStarted = false;
    this.isCompleted = false;

    this.passageText = "";
    this.typedChars = [];
    this.mistakesCount = 0;
    this.totalKeystrokes = 0;
    this.startTime = null;

    this.dom = {
      modeButtons: document.querySelectorAll('.mode-btn'),
      subDrillPills: document.getElementById('subDrillPills'),
      timeButtons: document.querySelectorAll('.time-pills .pill-btn'),
      statWpm: document.getElementById('statWpm'),
      statAccuracy: document.getElementById('statAccuracy'),
      statCpm: document.getElementById('statCpm'),
      statTimer: document.getElementById('statTimer'),
      statTimerSub: document.getElementById('statTimerSub'),
      statErrors: document.getElementById('statErrors'),
      typingArena: document.getElementById('typingArena'),
      passageContainer: document.getElementById('passageContainer'),
      hiddenInput: document.getElementById('hiddenInput'),
      focusOverlay: document.getElementById('focusOverlay'),
      progressBar: document.getElementById('progressBar'),
      btnRestart: document.getElementById('btnRestart'),
      btnNextPassage: document.getElementById('btnNextPassage'),
      btnToggleSound: document.getElementById('btnToggleSound'),
      soundIcon: document.getElementById('soundIcon'),
      soundLabel: document.getElementById('soundLabel'),
      // Modal
      modalBackdrop: document.getElementById('modalBackdrop'),
      modalNetWpm: document.getElementById('modalNetWpm'),
      modalAccuracy: document.getElementById('modalAccuracy'),
      modalTotalWords: document.getElementById('modalTotalWords'),
      modalMistakes: document.getElementById('modalMistakes'),
      modalHeading: document.getElementById('modalHeading'),
      modalSubheading: document.getElementById('modalSubheading'),
      modalBadgesContainer: document.getElementById('modalBadgesContainer'),
      modalBtnRetry: document.getElementById('modalBtnRetry'),
      modalBtnNext: document.getElementById('modalBtnNext')
    };

    this.init();
  }

  init() {
    this.updateSoundButton();
    this.renderSubDrills();
    this.loadPassage();
    this.bindEvents();
  }

  updateSoundButton() {
    if (this.dom.btnToggleSound) {
      this.dom.soundIcon.textContent = sounds.enabled ? '🔊' : '🔇';
      this.dom.soundLabel.textContent = `Sound: ${sounds.enabled ? 'ON' : 'OFF'}`;
    }
  }

  bindEvents() {
    // Mode Buttons
    this.dom.modeButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        this.dom.modeButtons.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        this.currentMode = btn.dataset.mode;
        this.currentSubDrill = SUB_DRILLS[this.currentMode][0].id;
        this.renderSubDrills();
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
    this.dom.btnToggleSound.addEventListener('click', () => {
      sounds.toggle();
      this.updateSoundButton();
    });

    // Restart & Next
    this.dom.btnRestart.addEventListener('click', () => this.resetTest());
    this.dom.btnNextPassage.addEventListener('click', () => {
      this.loadPassage();
      this.resetTest(false);
    });

    // Arena Focus
    const focusInput = () => {
      if (this.isCompleted) return;
      this.dom.focusOverlay.classList.add('hidden');
      this.dom.hiddenInput.focus();
    };

    this.dom.typingArena.addEventListener('click', focusInput);
    this.dom.focusOverlay.addEventListener('click', focusInput);

    window.addEventListener('keydown', (e) => {
      if (e.key === 'Tab') {
        e.preventDefault();
        this.resetTest();
        return;
      }
      if (e.key === 'Escape') {
        if (this.dom.modalBackdrop.classList.contains('active')) {
          this.closeModal();
        }
      }
      if (!this.dom.focusOverlay.classList.contains('hidden') && e.key.length === 1) {
        focusInput();
      }
    });

    // Typing Input Event
    this.dom.hiddenInput.addEventListener('input', (e) => this.handleInput(e));
    this.dom.hiddenInput.addEventListener('keydown', (e) => {
      if (e.key === 'Backspace') {
        // Backspace handling
        if (this.typedChars.length > 0 && !this.isCompleted) {
          this.typedChars.pop();
          sounds.playKey();
          this.renderPassage();
          this.updateStats();
        }
      }
    });

    // Modal buttons
    this.dom.modalBtnRetry.addEventListener('click', () => {
      this.closeModal();
      this.resetTest();
    });
    this.dom.modalBtnNext.addEventListener('click', () => {
      this.closeModal();
      this.loadPassage();
      this.resetTest(false);
    });
  }

  renderSubDrills() {
    const list = SUB_DRILLS[this.currentMode] || [];
    this.dom.subDrillPills.innerHTML = '<span class="pill-label">Category:</span>';
    list.forEach(drill => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = `pill-btn ${drill.id === this.currentSubDrill ? 'active' : ''}`;
      btn.textContent = drill.label;
      btn.addEventListener('click', () => {
        this.dom.subDrillPills.querySelectorAll('.pill-btn').forEach(p => p.classList.remove('active'));
        btn.classList.add('active');
        this.currentSubDrill = drill.id;
        this.resetTest();
      });
      this.dom.subDrillPills.appendChild(btn);
    });
  }

  generatePassageText() {
    if (this.currentMode === 'topwords') {
      let pool = TOP_500_WORDS;
      if (this.currentSubDrill === 'top100') pool = TOP_500_WORDS.slice(0, 100);
      else if (this.currentSubDrill === 'top250') pool = TOP_500_WORDS.slice(0, 250);

      // Pick 40 random words
      const words = [];
      for (let i = 0; i < 35; i++) {
        const rand = pool[Math.floor(Math.random() * pool.length)];
        words.push(rand);
      }
      return words.join(' ');
    } else if (this.currentMode === 'pangrams') {
      if (this.currentSubDrill === 'p1') {
        return PANGRAMS[0] + " " + PANGRAMS[1];
      } else if (this.currentSubDrill === 'p2') {
        return PANGRAMS[2] + " " + PANGRAMS[4];
      } else {
        const shuffled = [...PANGRAMS].sort(() => 0.5 - Math.random());
        return shuffled.slice(0, 2).join(' ');
      }
    } else if (this.currentMode === 'punctuation') {
      if (this.currentSubDrill === 'symbols_code') {
        return PUNCTUATION_DRILLS[0] + " " + PUNCTUATION_DRILLS[1];
      } else if (this.currentSubDrill === 'financial') {
        return PUNCTUATION_DRILLS[2] + " " + PUNCTUATION_DRILLS[3];
      } else {
        return PUNCTUATION_DRILLS[4] + " " + PUNCTUATION_DRILLS[5];
      }
    } else if (this.currentMode === 'code') {
      const codeType = this.currentSubDrill; // 'js', 'python', 'html'
      const list = CODE_SNIPPETS[codeType] || CODE_SNIPPETS.javascript;
      return list[Math.floor(Math.random() * list.length)];
    }

    return "The quick brown fox jumps over the lazy dog.";
  }

  loadPassage() {
    this.passageText = this.generatePassageText();
  }

  resetTest(keepCurrentPassage = true) {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
      this.timerInterval = null;
    }

    if (!keepCurrentPassage) {
      this.loadPassage();
    }

    this.hasStarted = false;
    this.isCompleted = false;
    this.typedChars = [];
    this.mistakesCount = 0;
    this.totalKeystrokes = 0;
    this.startTime = null;
    this.timeRemaining = this.timeLimit;

    this.dom.hiddenInput.value = '';
    this.dom.focusOverlay.classList.remove('hidden');

    this.renderPassage();
    this.updateStats();

    if (this.timeLimit > 0) {
      this.dom.statTimer.textContent = `${this.timeLimit}s`;
      this.dom.statTimerSub.textContent = 'countdown';
    } else {
      this.dom.statTimer.textContent = '0s';
      this.dom.statTimerSub.textContent = 'elapsed';
    }
  }

  handleInput(e) {
    if (this.isCompleted) return;
    const value = this.dom.hiddenInput.value;
    if (!value) return;

    // Read the newest entered char
    const char = value.slice(-1);
    this.dom.hiddenInput.value = '';

    if (!this.hasStarted) {
      this.startTimer();
    }

    const targetChar = this.passageText[this.typedChars.length];
    if (!targetChar) return;

    this.totalKeystrokes += 1;

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

    // Check passage completion
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
        this.dom.statTimer.textContent = `${this.timeRemaining}s`;
        this.updateStats();

        if (this.timeRemaining <= 0) {
          clearInterval(this.timerInterval);
          this.timerInterval = null;
          this.finishTest();
        }
      }, 1000);
    } else {
      // Elapsed timer
      let elapsedSec = 0;
      this.timerInterval = setInterval(() => {
        elapsedSec += 1;
        this.dom.statTimer.textContent = `${elapsedSec}s`;
        this.updateStats();
      }, 1000);
    }
  }

  updateStats() {
    const elapsedMinutes = this.startTime ? Math.max((Date.now() - this.startTime) / 60000, 0.01) : 0.01;
    const correctCount = this.typedChars.filter(c => c.correct).length;
    const totalTyped = this.typedChars.length;

    // Gross WPM & Net WPM
    // Standard formula: 1 word = 5 characters
    const grossWpm = Math.round((totalTyped / 5) / elapsedMinutes);
    const unroundedNetWpm = ((correctCount / 5) / elapsedMinutes);
    const netWpm = Math.max(0, Math.round(unroundedNetWpm));

    // Accuracy
    const accuracy = totalTyped === 0 ? 100 : Math.round((correctCount / totalTyped) * 100);

    // CPM (Characters per minute)
    const cpm = Math.round(correctCount / elapsedMinutes);

    this.dom.statWpm.textContent = this.hasStarted ? netWpm : 0;
    this.dom.statAccuracy.textContent = `${accuracy}%`;
    this.dom.statCpm.textContent = this.hasStarted ? cpm : 0;
    this.dom.statErrors.textContent = this.mistakesCount;

    // Progress bar
    const progressPercent = Math.min(100, Math.round((totalTyped / this.passageText.length) * 100));
    this.dom.progressBar.style.width = `${progressPercent}%`;
  }

  renderPassage() {
    const container = this.dom.passageContainer;
    container.innerHTML = '';

    const currentIndex = this.typedChars.length;

    for (let i = 0; i < this.passageText.length; i++) {
      const span = document.createElement('span');
      span.className = 'char';
      span.textContent = this.passageText[i];

      if (i < currentIndex) {
        const item = this.typedChars[i];
        if (item.correct) {
          span.classList.add('correct');
        } else {
          span.classList.add('incorrect');
        }
      } else if (i === currentIndex) {
        span.classList.add('current');
      }

      container.appendChild(span);
    }

    // Auto scroll to active char
    const activeSpan = container.querySelector('.char.current');
    if (activeSpan) {
      const parentRect = container.getBoundingClientRect();
      const spanRect = activeSpan.getBoundingClientRect();
      if (spanRect.bottom > parentRect.bottom || spanRect.top < parentRect.top) {
        activeSpan.scrollIntoView({ behavior: 'smooth', block: 'center' });
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
    const netWpm = Math.max(0, Math.round((correctCount / 5) / elapsedMinutes));
    const accuracy = totalTyped === 0 ? 100 : Math.round((correctCount / totalTyped) * 100);
    const wordsTyped = Math.round(correctCount / 5);

    // Save to LocalStorage and evaluate achievements
    const result = recordTypingSession({
      language: 'english',
      wpm: netWpm,
      accuracy,
      wordsCount: wordsTyped,
      charsCount: totalTyped,
      mistakes: this.mistakesCount,
      isCode: this.currentMode === 'code'
    });

    // Populate Modal
    this.dom.modalNetWpm.textContent = netWpm;
    this.dom.modalAccuracy.textContent = `${accuracy}%`;
    this.dom.modalTotalWords.textContent = wordsTyped;
    this.dom.modalMistakes.textContent = this.mistakesCount;

    if (netWpm >= 80) {
      this.dom.modalHeading.textContent = "Spectacular Velocity!";
      this.dom.modalSubheading.textContent = `You typed with grandmaster speed at ${netWpm} WPM.`;
    } else if (netWpm >= 50) {
      this.dom.modalHeading.textContent = "Great Performance!";
      this.dom.modalSubheading.textContent = `Solid pace at ${netWpm} WPM with ${accuracy}% accuracy.`;
    } else {
      this.dom.modalHeading.textContent = "Drill Completed!";
      this.dom.modalSubheading.textContent = `Consistent practice will rapidly increase your speed.`;
    }

    // Badges announcement
    this.dom.modalBadgesContainer.innerHTML = '';
    if (result.unlockedNow && result.unlockedNow.length > 0) {
      const banner = document.createElement('div');
      banner.className = 'badge-unlocked-banner';
      banner.innerHTML = `
        <span style="font-size: 1.5rem;">🏆</span>
        <div>
          <strong>${result.unlockedNow.length} New Achievement Unlocked!</strong>
          <div style="font-size: 0.78rem; opacity: 0.85;">Check the trophy room to claim your new badge.</div>
        </div>
      `;
      this.dom.modalBadgesContainer.appendChild(banner);
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

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  new EnglishTypingEngine();
});