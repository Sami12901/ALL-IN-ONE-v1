/**
 * Bangla Typing Practice & Multi-Layout Tutor
 * Fully client-side vanilla ES Module.
 */

// Passages Catalog
const BANGLA_PASSAGES = {
  proverbs: [
    "দশে মিলি করি কাজ, হারি জিতি নাহি লাজ।",
    "যেখানে বাঘের ভয়, সেখানে সন্ধ্যা হয়।",
    "অতি লোভে তাঁতি নষ্ট, অল্পে তুষ্ট বুদ্ধিমান।",
    "একতাই বল, বিভেদেই পতন। সৎ সঙ্গে স্বর্গ বাস, অসৎ সঙ্গে সর্বনাশ।",
    "পরিশ্রম সৌভাগ্যের প্রসূতি, অলসতা জীবনের সবচেয়ে বড় শত্রু।"
  ],
  sentences: [
    "আমাদের প্রিয় মাতৃভূমি বাংলাদেশ। আমরা বাংলাকে প্রাণভরে ভালোবাসি।",
    "সকাল বেলা পাখিরা কিচিরমিচির সুরে গান গায় এবং সোনালী সূর্য উদিত হয়।",
    "বাংলা আমাদের মাতৃভাষা এবং রক্ত দিয়ে কেনা অহংকারের প্রতীক।",
    "সবাই মিলেমিশে কাজ করলে যে কোনো কঠিন কাজও সহজ হয়ে যায়।"
  ],
  literature: [
    "আমাদের ছোট নদী চলে আঁকে বাঁকে, বৈশাখ মাসে তার হাঁটু জল থাকে। পার হয়ে যায় গরু পার হয় গাড়ি, দুই ধার উঁচু তার ঢালু তার পাড়ি।",
    "মোদের গরব মোদের আশা, আ-মরি বাংলা ভাষা! তোমার কোলে তোমার বোলে কতই শান্তি ভালোবাসা।",
    "সকালে উঠিয়া আমি মনে মনে বলি, সারাদিন আমি যেন ভাল হয়ে চলি। আদেশ করেন যাহা মোর গুরুজনে, আমি যেন সেই কাজ করি ভাল মনে।"
  ]
};

// Bengali Digits Converter
const BN_DIGITS = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
function toBnNum(num) {
  return String(num).replace(/[0-9]/g, d => BN_DIGITS[parseInt(d, 10)]);
}

// Avro-like Phonetic Transliteration Dictionary & Converter
const PHONETIC_DICT = {
  'ami': 'আমি', 'amader': 'আমাদের', 'amra': 'আমরা', 'amar': 'আমার',
  'tumi': 'তুমি', 'tomar': 'তোমার', 'tomader': 'তোমাদের', 'apni': 'আপনি',
  'bangla': 'বাংলা', 'desh': 'দেশ', 'bangladesh': 'বাংলাদেশ',
  'kemon': 'কেমন', 'acho': 'আছো', 'achen': 'আছেন', 'dhonnobad': 'ধন্যবাদ',
  'shonar': 'সোনার', 'manush': 'মানুষ', 'bhalo': 'ভালো', 'bhasha': 'ভাষা',
  'shob': 'সব', 'shobar': 'সবার', 'shokal': 'সকাল', 'bela': 'বেলা',
  'pakhira': 'পাখিরা', 'gan': 'গান', 'gay': 'গায়', 'kaj': 'কাজ',
  'kori': 'করি', 'kore': 'করে', 'hobe': 'হবে', 'shei': 'সেই',
  'ektai': 'একতাই', 'bol': 'বল', 'kothay': 'কোথায়', 'choto': 'ছোট',
  'nodi': 'নদী', 'chole': 'চলে', 'boshe': 'বসে', 'pori': 'পড়ি',
  'bhor': 'ভোর', 'shurjo': 'সূর্য', 'alo': 'আলো', 'preme': 'প্রেমে',
  'porishrom': 'পরিশ্রম', 'shobcheye': 'সবচেয়ে', 'bhalobashi': 'ভালোবাসি',
  'halka': 'হালকা', 'pani': 'পানি', 'bidesh': 'বিদেশ', 'shadhin': 'স্বাধীন'
};

function transliteratePhonetic(englishWord) {
  if (!englishWord) return '';
  const lower = englishWord.toLowerCase();
  if (PHONETIC_DICT[lower]) return PHONETIC_DICT[lower];

  // Algorithmic fall-back rule engine
  let result = '';
  let i = 0;
  const len = englishWord.length;

  while (i < len) {
    // 3-char match
    const sub3 = englishWord.substr(i, 3).toLowerCase();
    if (sub3 === 'kkh') { result += 'ক্ষ'; i += 3; continue; }
    if (sub3 === 'jyo') { result += 'য্য'; i += 3; continue; }
    if (sub3 === 'rri') { result += 'ঋ'; i += 3; continue; }

    // 2-char match
    const sub2 = englishWord.substr(i, 2).toLowerCase();
    if (sub2 === 'sh') { result += 'শ'; i += 2; continue; }
    if (sub2 === 'kh') { result += 'খ'; i += 2; continue; }
    if (sub2 === 'gh') { result += 'ঘ'; i += 2; continue; }
    if (sub2 === 'ch') { result += 'চ'; i += 2; continue; }
    if (sub2 === 'jh') { result += 'ঝ'; i += 2; continue; }
    if (sub2 === 'th') { result += 'থ'; i += 2; continue; }
    if (sub2 === 'dh') { result += 'ধ'; i += 2; continue; }
    if (sub2 === 'ph' || sub2 === 'bh') { result += sub2 === 'ph' ? 'ফ' : 'ভ'; i += 2; continue; }
    if (sub2 === 'ng') { result += 'ং'; i += 2; continue; }
    if (sub2 === 'aa') { result += (i === 0 ? 'আ' : 'া'); i += 2; continue; }
    if (sub2 === 'ee') { result += (i === 0 ? 'ঈ' : 'ী'); i += 2; continue; }
    if (sub2 === 'oo') { result += (i === 0 ? 'ঊ' : 'ূ'); i += 2; continue; }
    if (sub2 === 'oi') { result += (i === 0 ? 'ঐ' : 'ৈ'); i += 2; continue; }
    if (sub2 === 'ou') { result += (i === 0 ? 'ঔ' : 'ৌ'); i += 2; continue; }

    // 1-char match
    const c = englishWord[i];
    const isFirst = (i === 0);

    switch (c.toLowerCase()) {
      case 'a': result += isFirst ? 'অ' : 'া'; break;
      case 'i': result += isFirst ? 'ই' : 'ি'; break;
      case 'u': result += isFirst ? 'উ' : 'ু'; break;
      case 'e': result += isFirst ? 'এ' : 'ে'; break;
      case 'o': result += isFirst ? 'ও' : 'ো'; break;
      case 'k': result += 'ক'; break;
      case 'g': result += 'গ'; break;
      case 'j': result += 'জ'; break;
      case 't': result += 'ত'; break;
      case 'd': result += 'দ'; break;
      case 'n': result += 'ন'; break;
      case 'p': result += 'প'; break;
      case 'f': result += 'ফ'; break;
      case 'b': result += 'ব'; break;
      case 'v': result += 'ভ'; break;
      case 'm': result += 'ম'; break;
      case 'r': result += 'র'; break;
      case 'l': result += 'ল'; break;
      case 's': result += 'স'; break;
      case 'h': result += 'হ'; break;
      case 'y': result += 'য়'; break;
      case 'z': result += 'য'; break;
      default: result += c; break;
    }
    i++;
  }

  return result;
}

// Bijoy & Jatiya Keyboard Maps
const BIJOY_KEYS = [
  // Row 1
  [
    { key: '`', normal: '`', shift: '~' },
    { key: '1', normal: '১', shift: '!' },
    { key: '2', normal: '২', shift: '@' },
    { key: '3', normal: '৩', shift: '#' },
    { key: '4', normal: '৪', shift: '$' },
    { key: '5', normal: '৫', shift: '%' },
    { key: '6', normal: '৬', shift: '^' },
    { key: '7', normal: '৭', shift: '&' },
    { key: '8', normal: '৮', shift: '*' },
    { key: '9', normal: '৯', shift: '(' },
    { key: '0', normal: '০', shift: ')' },
    { key: '-', normal: '-', shift: '_' },
    { key: '=', normal: '=', shift: '+' }
  ],
  // Row 2
  [
    { key: 'Q', normal: 'ঙ', shift: 'ং' },
    { key: 'W', normal: 'য', shift: 'য়' },
    { key: 'E', normal: 'ড', shift: 'ঢ' },
    { key: 'R', normal: 'প', shift: 'ফ' },
    { key: 'T', normal: 'ট', shift: 'ঠ' },
    { key: 'Y', normal: 'চ', shift: 'ছ' },
    { key: 'U', normal: 'জ', shift: 'ঝ' },
    { key: 'I', normal: 'হ', shift: 'ঞ' },
    { key: 'O', normal: 'গ', shift: 'ঘ' },
    { key: 'P', normal: 'ড়', shift: 'ঢ়' }
  ],
  // Row 3
  [
    { key: 'A', normal: 'ৃ', shift: 'র্' },
    { key: 'S', normal: 'ু', shift: 'ূ' },
    { key: 'D', normal: 'ি', shift: 'ী' },
    { key: 'F', normal: 'া', shift: 'অ' },
    { key: 'G', normal: '্', shift: '।' },
    { key: 'H', normal: 'ব', shift: 'ভ' },
    { key: 'J', normal: 'ক', shift: 'খ' },
    { key: 'K', normal: 'ত', shift: 'থ' },
    { key: 'L', normal: 'দ', shift: 'ধ' },
    { key: ';', normal: ';', shift: ':' }
  ],
  // Row 4
  [
    { key: 'Z', normal: '্র', shift: '্য' },
    { key: 'X', normal: 'ৌ', shift: 'ৈ' },
    { key: 'C', normal: 'ে', shift: 'ৈ' },
    { key: 'V', normal: 'র', shift: 'ল' },
    { key: 'B', normal: 'ন', shift: 'ণ' },
    { key: 'N', normal: 'স', shift: 'ষ' },
    { key: 'M', normal: 'ম', shift: 'শ' }
  ]
];

const JATIYA_KEYS = [
  // Row 1
  [
    { key: '1', normal: '১', shift: '!' },
    { key: '2', normal: '২', shift: '@' },
    { key: '3', normal: '৩', shift: '#' },
    { key: '4', normal: '৪', shift: '৳' },
    { key: '5', normal: '৫', shift: '%' },
    { key: '6', normal: '৬', shift: '^' },
    { key: '7', normal: '৭', shift: 'ঋ' },
    { key: '8', normal: '৮', shift: '*' },
    { key: '9', normal: '৯', shift: '(' },
    { key: '0', normal: '০', shift: ')' }
  ],
  // Row 2
  [
    { key: 'Q', normal: 'ঙ', shift: 'ং' },
    { key: 'W', normal: 'য', shift: 'য়' },
    { key: 'E', normal: 'ড', shift: 'ঢ' },
    { key: 'R', normal: 'প', shift: 'ফ' },
    { key: 'T', normal: 'ট', shift: 'ঠ' },
    { key: 'Y', normal: 'চ', shift: 'ছ' },
    { key: 'U', normal: 'জ', shift: 'ঝ' },
    { key: 'I', normal: 'হ', shift: 'ঞ' },
    { key: 'O', normal: 'গ', shift: 'ঘ' },
    { key: 'P', normal: 'ড়', shift: 'ঢ়' }
  ],
  // Row 3
  [
    { key: 'A', normal: 'ৃ', shift: 'র্' },
    { key: 'S', normal: 'ু', shift: 'ূ' },
    { key: 'D', normal: 'ি', shift: 'ী' },
    { key: 'F', normal: 'া', shift: 'অ' },
    { key: 'G', normal: '্', shift: '।' },
    { key: 'H', normal: 'ব', shift: 'ভ' },
    { key: 'J', normal: 'ক', shift: 'খ' },
    { key: 'K', normal: 'ত', shift: 'থ' },
    { key: 'L', normal: 'দ', shift: 'ধ' }
  ],
  // Row 4
  [
    { key: 'Z', normal: '্র', shift: '্য' },
    { key: 'X', normal: 'ৌ', shift: 'ঐ' },
    { key: 'C', normal: 'ে', shift: 'ৈ' },
    { key: 'V', normal: 'র', shift: 'ল' },
    { key: 'B', normal: 'ন', shift: 'ণ' },
    { key: 'N', normal: 'স', shift: 'ষ' },
    { key: 'M', normal: 'ম', shift: 'শ' }
  ]
];

class BanglaTypingPracticeApp {
  constructor() {
    this.currentInputMode = 'phonetic'; // 'phonetic' | 'direct'
    this.currentTopic = 'proverbs';
    this.useBanglaNumerals = true;

    this.targetText = '';
    this.currentIndex = 0;
    this.phoneticBuffer = '';
    this.errorsCount = 0;
    this.correctCount = 0;
    this.totalTyped = 0;

    this.startTime = null;
    this.timerInterval = null;
    this.isFinished = false;

    this.dom = {
      valWpm: document.getElementById('val-wpm'),
      valAccuracy: document.getElementById('val-accuracy'),
      valCpm: document.getElementById('val-cpm'),
      valTime: document.getElementById('val-time'),
      valErrors: document.getElementById('val-errors'),

      inputModeSelector: document.getElementById('input-mode-selector'),
      topicSelector: document.getElementById('topic-selector'),
      btnToggleNumerals: document.getElementById('btn-toggle-numerals'),
      btnRestart: document.getElementById('btn-restart'),
      btnTryAgain: document.getElementById('btn-try-again'),

      phoneticBar: document.getElementById('phonetic-bar'),
      phoneticBuffer: document.getElementById('phonetic-buffer'),
      phoneticConverted: document.getElementById('phonetic-converted'),

      passageContainer: document.getElementById('passage-container'),
      passageDisplay: document.getElementById('passage-display'),
      typingInput: document.getElementById('typing-input'),

      resultsCard: document.getElementById('results-card'),
      resFinalWpm: document.getElementById('res-final-wpm'),
      resAcc: document.getElementById('res-acc'),
      resCpm: document.getElementById('res-cpm'),
      resTime: document.getElementById('res-time'),
      resErr: document.getElementById('res-err'),

      layoutViewSelector: document.getElementById('layout-view-selector'),
      phoneticTableView: document.getElementById('phonetic-table-view'),
      visualLayoutView: document.getElementById('visual-layout-view'),
      layoutNameIndicator: document.getElementById('layout-name-indicator'),
      kbVisualGrid: document.getElementById('kb-visual-grid')
    };

    this.bindEvents();
    this.loadPassage();
    this.renderKeyboardLayout('bijoy');
  }

  bindEvents() {
    this.dom.passageContainer.addEventListener('click', () => {
      this.dom.typingInput.focus();
      this.dom.passageContainer.classList.add('is-focused');
    });

    this.dom.typingInput.addEventListener('keydown', (e) => this.handleKeyDown(e));

    // Input mode selector
    this.dom.inputModeSelector.addEventListener('click', (e) => {
      const btn = e.target.closest('.pill-btn');
      if (!btn) return;
      this.dom.inputModeSelector.querySelectorAll('.pill-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      this.currentInputMode = btn.dataset.mode;
      this.dom.phoneticBar.style.display = this.currentInputMode === 'phonetic' ? 'flex' : 'none';
      this.resetBenchmark();
    });

    // Topic selector
    this.dom.topicSelector.addEventListener('click', (e) => {
      const btn = e.target.closest('.pill-btn');
      if (!btn) return;
      this.dom.topicSelector.querySelectorAll('.pill-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      this.currentTopic = btn.dataset.topic;
      this.loadPassage();
    });

    // Numerals toggle
    this.dom.btnToggleNumerals.addEventListener('click', () => {
      this.useBanglaNumerals = !this.useBanglaNumerals;
      this.dom.btnToggleNumerals.textContent = `সংখ্যা: ${this.useBanglaNumerals ? 'বাংলা (১২৩)' : 'English (123)'}`;
      this.updateMetrics();
    });

    // Layout guide selector
    this.dom.layoutViewSelector.addEventListener('click', (e) => {
      const btn = e.target.closest('.pill-btn');
      if (!btn) return;
      this.dom.layoutViewSelector.querySelectorAll('.pill-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const layout = btn.dataset.layout;
      if (layout === 'phonetic') {
        this.dom.phoneticTableView.style.display = 'block';
        this.dom.visualLayoutView.style.display = 'none';
      } else {
        this.dom.phoneticTableView.style.display = 'none';
        this.dom.visualLayoutView.style.display = 'block';
        this.renderKeyboardLayout(layout);
      }
    });

    this.dom.btnRestart.addEventListener('click', () => this.loadPassage());
    this.dom.btnTryAgain.addEventListener('click', () => this.loadPassage());

    document.addEventListener('keydown', (e) => {
      if (this.isFinished) return;
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
      if (!e.ctrlKey && !e.altKey && !e.metaKey && e.key.length === 1) {
        this.dom.typingInput.focus();
        this.dom.passageContainer.classList.add('is-focused');
      }
    });
  }

  renderKeyboardLayout(layoutType) {
    this.dom.kbVisualGrid.innerHTML = '';
    const isBijoy = layoutType === 'bijoy';
    this.dom.layoutNameIndicator.textContent = isBijoy ? 'বিজয় লেআউট (Bijoy Layout)' : 'জাতীয় লেআউট (National Jatiya)';

    const rows = isBijoy ? BIJOY_KEYS : JATIYA_KEYS;
    rows.forEach(row => {
      const rowDiv = document.createElement('div');
      rowDiv.className = 'kb-row';
      row.forEach(k => {
        const tile = document.createElement('div');
        tile.className = 'kb-key-tile';
        tile.innerHTML = `
          <span class="shift-char">${k.shift}</span>
          <span class="normal-char">${k.normal}</span>
        `;
        rowDiv.appendChild(tile);
      });
      this.dom.kbVisualGrid.appendChild(rowDiv);
    });

    // Spacebar row
    const spaceRow = document.createElement('div');
    spaceRow.className = 'kb-row';
    const spaceTile = document.createElement('div');
    spaceTile.className = 'kb-key-tile key-spacebar';
    spaceTile.textContent = 'স্পেসবার (Spacebar)';
    spaceRow.appendChild(spaceTile);
    this.dom.kbVisualGrid.appendChild(spaceRow);
  }

  loadPassage() {
    this.resetBenchmark();
    const pool = BANGLA_PASSAGES[this.currentTopic] || BANGLA_PASSAGES.proverbs;
    const randomIndex = Math.floor(Math.random() * pool.length);
    this.targetText = pool[randomIndex].trim();
    this.renderPassage();
  }

  renderPassage() {
    this.dom.passageDisplay.innerHTML = '';
    const fragment = document.createDocumentFragment();

    // Split targetText into Unicode graphemes/characters
    const chars = Array.from(this.targetText);
    for (let i = 0; i < chars.length; i++) {
      const span = document.createElement('span');
      span.className = 'char char-pending';
      span.textContent = chars[i];
      if (i === 0) span.classList.add('char-current');
      fragment.appendChild(span);
    }

    this.dom.passageDisplay.appendChild(fragment);
  }

  handleKeyDown(e) {
    if (this.isFinished) return;

    if (e.key === ' ' || e.code === 'Space') {
      e.preventDefault();
    }

    if (e.key === 'Shift' || e.key === 'Control' || e.key === 'Alt' || e.key === 'CapsLock' || e.key === 'Tab') {
      return;
    }

    if (!this.startTime) {
      this.startTime = Date.now();
      this.timerInterval = setInterval(() => this.updateMetrics(), 200);
    }

    // PHONETIC ENGINE MODE
    if (this.currentInputMode === 'phonetic') {
      if (e.key === 'Backspace') {
        e.preventDefault();
        if (this.phoneticBuffer.length > 0) {
          this.phoneticBuffer = this.phoneticBuffer.slice(0, -1);
          this.updatePhoneticDisplay();
        } else if (this.currentIndex > 0) {
          this.currentIndex--;
          this.updateCharDisplay();
          this.updateMetrics();
        }
        return;
      }

      // Space commits phonetic buffer to text
      if (e.key === ' ' || e.code === 'Space') {
        if (this.phoneticBuffer.length > 0) {
          const converted = transliteratePhonetic(this.phoneticBuffer);
          this.commitPhoneticString(converted + ' ');
          this.phoneticBuffer = '';
          this.updatePhoneticDisplay();
        } else {
          this.commitDirectChar(' ');
        }
        return;
      }

      // Punctuation marks commit current buffer + punctuation
      if (['.', ',', '?', '!', ';', ':', '|', '।'].includes(e.key)) {
        if (this.phoneticBuffer.length > 0) {
          const converted = transliteratePhonetic(this.phoneticBuffer);
          this.commitPhoneticString(converted);
          this.phoneticBuffer = '';
          this.updatePhoneticDisplay();
        }
        const punct = e.key === '.' ? '।' : e.key;
        this.commitDirectChar(punct);
        return;
      }

      // Alphabet keys accumulate into phonetic buffer
      if (/^[a-zA-Z]$/.test(e.key)) {
        this.phoneticBuffer += e.key;
        this.updatePhoneticDisplay();
        return;
      }

      // If direct Bangla character pasted/typed
      this.commitDirectChar(e.key);
      return;
    }

    // DIRECT BANGLA MODE
    if (e.key === 'Backspace') {
      e.preventDefault();
      if (this.currentIndex > 0) {
        this.currentIndex--;
        this.updateCharDisplay();
        this.updateMetrics();
      }
      return;
    }

    const typedChar = e.key === ' ' ? ' ' : e.key;
    this.commitDirectChar(typedChar);
  }

  updatePhoneticDisplay() {
    this.dom.phoneticBuffer.textContent = this.phoneticBuffer || '(type...)';
    const converted = transliteratePhonetic(this.phoneticBuffer);
    this.dom.phoneticConverted.textContent = converted || '...';
  }

  commitPhoneticString(convertedString) {
    const chars = Array.from(convertedString);
    chars.forEach(ch => this.commitDirectChar(ch));
  }

  commitDirectChar(ch) {
    if (this.currentIndex >= this.targetText.length) return;

    this.totalTyped++;
    const targetChars = Array.from(this.targetText);
    const expected = targetChars[this.currentIndex];
    const isCorrect = ch === expected;

    if (isCorrect) {
      this.correctCount++;
    } else {
      this.errorsCount++;
    }

    const spans = this.dom.passageDisplay.children;
    if (spans[this.currentIndex]) {
      spans[this.currentIndex].className = isCorrect ? 'char char-correct' : 'char char-error';
    }

    this.currentIndex++;
    this.updateCharDisplay();
    this.updateMetrics();

    if (this.currentIndex >= targetChars.length) {
      this.finishTest();
    }
  }

  updateCharDisplay() {
    const spans = this.dom.passageDisplay.children;
    for (let i = 0; i < spans.length; i++) {
      spans[i].classList.remove('char-current');
      if (i === this.currentIndex && !this.isFinished) {
        spans[i].classList.add('char-current');
        spans[i].scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
    }
  }

  updateMetrics() {
    const elapsedSeconds = this.startTime ? Math.max(0.1, (Date.now() - this.startTime) / 1000) : 0;
    const elapsedMinutes = elapsedSeconds / 60;

    const wpm = elapsedMinutes > 0 ? Math.round((this.correctCount / 5) / elapsedMinutes) : 0;
    const cpm = elapsedMinutes > 0 ? Math.round(this.totalTyped / elapsedMinutes) : 0;
    const accuracy = this.totalTyped > 0 ? Math.round((this.correctCount / this.totalTyped) * 100) : 100;

    const mins = Math.floor(elapsedSeconds / 60);
    const secs = Math.floor(elapsedSeconds % 60);
    const timeFormatted = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;

    const numFormat = this.useBanglaNumerals ? toBnNum : (n) => String(n);

    this.dom.valWpm.textContent = numFormat(wpm);
    this.dom.valAccuracy.textContent = `${numFormat(accuracy)}%`;
    this.dom.valCpm.textContent = numFormat(cpm);
    this.dom.valTime.textContent = this.useBanglaNumerals ? toBnNum(timeFormatted) : timeFormatted;
    this.dom.valErrors.textContent = numFormat(this.errorsCount);
  }

  finishTest() {
    clearInterval(this.timerInterval);
    this.isFinished = true;

    const elapsedSeconds = Math.max(1, (Date.now() - this.startTime) / 1000);
    const elapsedMinutes = elapsedSeconds / 60;
    const finalWpm = Math.round((this.correctCount / 5) / elapsedMinutes);
    const finalAccuracy = this.totalTyped > 0 ? Math.round((this.correctCount / this.totalTyped) * 100) : 100;
    const finalCpm = Math.round(this.totalTyped / elapsedMinutes);

    const mins = Math.floor(elapsedSeconds / 60);
    const secs = Math.floor(elapsedSeconds % 60);
    const timeFormatted = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;

    const numFormat = this.useBanglaNumerals ? toBnNum : (n) => String(n);

    this.dom.resFinalWpm.textContent = `${numFormat(finalWpm)} WPM`;
    this.dom.resAcc.textContent = `${numFormat(finalAccuracy)}%`;
    this.dom.resCpm.textContent = numFormat(finalCpm);
    this.dom.resTime.textContent = this.useBanglaNumerals ? toBnNum(timeFormatted) : timeFormatted;
    this.dom.resErr.textContent = numFormat(this.errorsCount);

    this.dom.resultsCard.classList.add('show');
    this.dom.resultsCard.scrollIntoView({ behavior: 'smooth' });
  }

  resetBenchmark() {
    clearInterval(this.timerInterval);
    this.startTime = null;
    this.isFinished = false;
    this.currentIndex = 0;
    this.phoneticBuffer = '';
    this.errorsCount = 0;
    this.correctCount = 0;
    this.totalTyped = 0;

    this.dom.resultsCard.classList.remove('show');
    this.updatePhoneticDisplay();
    this.updateMetrics();
    this.renderPassage();

    this.dom.typingInput.value = '';
    this.dom.typingInput.focus();
  }
}

document.addEventListener('DOMContentLoaded', () => {
  new BanglaTypingPracticeApp();
});