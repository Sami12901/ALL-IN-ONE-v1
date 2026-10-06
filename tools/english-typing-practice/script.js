/**
 * English Touch-Typing Practice Tutor
 * Fully client-side vanilla ES Module.
 */

// Comprehensive Lesson Catalog
const LESSONS_DATA = {
  home: {
    title: "Home Row Mastery",
    drills: [
      { id: 1, label: "Anchor Keys", text: "fff jjj ddd kkk sss lll aaa ;;; fjdksla; fjdksla;" },
      { id: 2, label: "Simple Words", text: "all ask glad fall dad sad alas flask salad" },
      { id: 3, label: "Word Pairs", text: "fall all salad ask dad glad flask hall salsa" },
      { id: 4, label: "Sentence Flow", text: "a sad lad had a salad as all lads fall as dad asked" }
    ]
  },
  top: {
    title: "Top Row Reach",
    drills: [
      { id: 1, label: "QWERTY Reach", text: "qqq www eee rrr ttt yyy uuu iii ooo ppp" },
      { id: 2, label: "Top Row Words", text: "type write quiet power tree root peer wire quite pour" },
      { id: 3, label: "Combined Flow", text: "we write clear reports to your older sister every week" },
      { id: 4, label: "Fluency Drill", text: "quiet people write great poems while pretty birds sleep in tall trees" }
    ]
  },
  bottom: {
    title: "Bottom Row Curl",
    drills: [
      { id: 1, label: "ZXCV BNM Curl", text: "zzz xxx ccc vvv bbb nnn mmm zxcv bnm zxcv bnm" },
      { id: 2, label: "Bottom Words", text: "can van cab mix ban man box zinc calm back verb name" },
      { id: 3, label: "Complex Reaches", text: "brave men climb vast rocky mountains with calm resolve" },
      { id: 4, label: "Full Pan-Row", text: "pack my red box with five dozen modern brass zinc lockets" }
    ]
  },
  numbers: {
    title: "Numbers & Symbols",
    drills: [
      { id: 1, label: "Number Row", text: "12345 67890 19283 74650 98765 43210" },
      { id: 2, label: "Phone & Currency", text: "call 1-800-555-0199 today; price is $49.99 plus 8% tax" },
      { id: 3, label: "Symbol Drills", text: "user@domain.com #tag [status: 200] {value: 99.5%}" },
      { id: 4, label: "Code Syntax", text: "if (count >= 10 && total != 0) { return array[i] * 2.5; }" }
    ]
  },
  common200: {
    title: "Top 200 High-Frequency English Words",
    drills: [
      { id: 1, label: "Tier 1 Words", text: "the of and a to in is you that it he was for on are as with his they I at be this have from" },
      { id: 2, label: "Tier 2 Words", text: "or one had by word but not what all were we when your can said there use an each which she do how their if" },
      { id: 3, label: "Tier 3 Words", text: "will up other about out many then them these so some her would make like him into time has look two more write" },
      { id: 4, label: "Tier 4 Words", text: "go see number no way could people my than first water been call who oil its now find long down day did get come made" }
    ]
  }
};

const FINGER_DIRECTORY = {
  '`': { finger: 'Left Pinky', class: 'finger-l-pinky' },
  '1': { finger: 'Left Pinky', class: 'finger-l-pinky' },
  'q': { finger: 'Left Pinky', class: 'finger-l-pinky' },
  'a': { finger: 'Left Pinky', class: 'finger-l-pinky' },
  'z': { finger: 'Left Pinky', class: 'finger-l-pinky' },

  '2': { finger: 'Left Ring', class: 'finger-l-ring' },
  'w': { finger: 'Left Ring', class: 'finger-l-ring' },
  's': { finger: 'Left Ring', class: 'finger-l-ring' },
  'x': { finger: 'Left Ring', class: 'finger-l-ring' },

  '3': { finger: 'Left Middle', class: 'finger-l-middle' },
  'e': { finger: 'Left Middle', class: 'finger-l-middle' },
  'd': { finger: 'Left Middle', class: 'finger-l-middle' },
  'c': { finger: 'Left Middle', class: 'finger-l-middle' },

  '4': { finger: 'Left Index', class: 'finger-l-index' },
  '5': { finger: 'Left Index', class: 'finger-l-index' },
  'r': { finger: 'Left Index', class: 'finger-l-index' },
  't': { finger: 'Left Index', class: 'finger-l-index' },
  'f': { finger: 'Left Index', class: 'finger-l-index' },
  'g': { finger: 'Left Index', class: 'finger-l-index' },
  'v': { finger: 'Left Index', class: 'finger-l-index' },
  'b': { finger: 'Left Index', class: 'finger-l-index' },

  ' ': { finger: 'Thumbs (Spacebar)', class: 'finger-thumb' },

  '6': { finger: 'Right Index', class: 'finger-r-index' },
  '7': { finger: 'Right Index', class: 'finger-r-index' },
  'y': { finger: 'Right Index', class: 'finger-r-index' },
  'u': { finger: 'Right Index', class: 'finger-r-index' },
  'h': { finger: 'Right Index', class: 'finger-r-index' },
  'j': { finger: 'Right Index', class: 'finger-r-index' },
  'n': { finger: 'Right Index', class: 'finger-r-index' },
  'm': { finger: 'Right Index', class: 'finger-r-index' },

  '8': { finger: 'Right Middle', class: 'finger-r-middle' },
  'i': { finger: 'Right Middle', class: 'finger-r-middle' },
  'k': { finger: 'Right Middle', class: 'finger-r-middle' },
  ',': { finger: 'Right Middle', class: 'finger-r-middle' },

  '9': { finger: 'Right Ring', class: 'finger-r-ring' },
  'o': { finger: 'Right Ring', class: 'finger-r-ring' },
  'l': { finger: 'Right Ring', class: 'finger-r-ring' },
  '.': { finger: 'Right Ring', class: 'finger-r-ring' },

  '0': { finger: 'Right Pinky', class: 'finger-r-pinky' },
  '-': { finger: 'Right Pinky', class: 'finger-r-pinky' },
  '=': { finger: 'Right Pinky', class: 'finger-r-pinky' },
  'p': { finger: 'Right Pinky', class: 'finger-r-pinky' },
  '[': { finger: 'Right Pinky', class: 'finger-r-pinky' },
  ']': { finger: 'Right Pinky', class: 'finger-r-pinky' },
  '\\': { finger: 'Right Pinky', class: 'finger-r-pinky' },
  ';': { finger: 'Right Pinky', class: 'finger-r-pinky' },
  '\'': { finger: 'Right Pinky', class: 'finger-r-pinky' },
  '/': { finger: 'Right Pinky', class: 'finger-r-pinky' }
};

class TypewriterAudio {
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

  playClick() {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const now = this.ctx.currentTime;

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(450 + Math.random() * 50, now);
    osc.frequency.exponentialRampToValueAtTime(120, now + 0.035);

    gain.gain.setValueAtTime(0.09, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.035);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + 0.035);
  }

  playError() {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const now = this.ctx.currentTime;

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(150, now);
    osc.frequency.exponentialRampToValueAtTime(70, now + 0.08);

    gain.gain.setValueAtTime(0.12, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + 0.08);
  }

  playBell() {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const now = this.ctx.currentTime;

    osc.type = 'sine';
    osc.frequency.setValueAtTime(1200, now);
    osc.frequency.exponentialRampToValueAtTime(900, now + 0.35);

    gain.gain.setValueAtTime(0.15, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + 0.35);
  }
}

class EnglishTypingPracticeApp {
  constructor() {
    this.audio = new TypewriterAudio();
    this.currentLessonKey = 'home';
    this.currentDrillIndex = 0;

    this.drillText = '';
    this.currentIndex = 0;
    this.totalTyped = 0;
    this.correctTyped = 0;
    this.errorsCount = 0;

    this.startTime = null;
    this.timerInterval = null;
    this.isDrillFinished = false;

    this.dom = {
      lessonNav: document.getElementById('lesson-nav'),
      drillSteps: document.getElementById('drill-steps'),
      btnSoundToggle: document.getElementById('btn-sound-toggle'),
      btnRestartDrill: document.getElementById('btn-restart-drill'),

      valWpm: document.getElementById('val-wpm'),
      valAccuracy: document.getElementById('val-accuracy'),
      valProgress: document.getElementById('val-progress'),
      valErrors: document.getElementById('val-errors'),

      drillContainer: document.getElementById('drill-container'),
      drillStream: document.getElementById('drill-stream'),
      typingInput: document.getElementById('typing-input'),

      promptTargetKey: document.getElementById('prompt-target-key'),
      promptFingerName: document.getElementById('prompt-finger-name'),

      completionBanner: document.getElementById('completion-banner'),
      btnRedoDrill: document.getElementById('btn-redo-drill'),
      btnNextDrill: document.getElementById('btn-next-drill')
    };

    this.bindEvents();
    this.loadLesson(this.currentLessonKey);
  }

  bindEvents() {
    this.dom.drillContainer.addEventListener('click', () => {
      this.dom.typingInput.focus();
      this.dom.drillContainer.classList.add('is-focused');
    });

    this.dom.typingInput.addEventListener('keydown', (e) => this.handleKeyDown(e));
    this.dom.typingInput.addEventListener('keyup', (e) => this.handleKeyUp(e));

    // Lesson selection
    this.dom.lessonNav.addEventListener('click', (e) => {
      const btn = e.target.closest('.lesson-btn');
      if (!btn) return;
      this.dom.lessonNav.querySelectorAll('.lesson-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      this.loadLesson(btn.dataset.lesson);
    });

    // Sub-drill chips
    this.dom.drillSteps.addEventListener('click', (e) => {
      const chip = e.target.closest('.step-chip');
      if (!chip) return;
      this.currentDrillIndex = parseInt(chip.dataset.index, 10);
      this.loadDrill();
    });

    // Sound toggle
    this.dom.btnSoundToggle.addEventListener('click', () => {
      this.audio.enabled = !this.audio.enabled;
      this.dom.btnSoundToggle.textContent = `🔊 Sound: ${this.audio.enabled ? 'ON' : 'OFF'}`;
    });

    this.dom.btnRestartDrill.addEventListener('click', () => this.loadDrill());
    this.dom.btnRedoDrill.addEventListener('click', () => this.loadDrill());
    this.dom.btnNextDrill.addEventListener('click', () => this.nextDrill());

    document.addEventListener('keydown', (e) => {
      if (this.isDrillFinished) return;
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
      if (!e.ctrlKey && !e.altKey && !e.metaKey && e.key.length === 1) {
        this.dom.typingInput.focus();
        this.dom.drillContainer.classList.add('is-focused');
      }
    });
  }

  loadLesson(lessonKey) {
    this.currentLessonKey = lessonKey;
    this.currentDrillIndex = 0;

    // Render Sub-drill chips
    const lesson = LESSONS_DATA[lessonKey];
    this.dom.drillSteps.innerHTML = '';
    lesson.drills.forEach((d, idx) => {
      const chip = document.createElement('button');
      chip.type = 'button';
      chip.className = `step-chip ${idx === 0 ? 'active' : ''}`;
      chip.dataset.index = idx;
      chip.textContent = `Step ${d.id}: ${d.label}`;
      this.dom.drillSteps.appendChild(chip);
    });

    this.loadDrill();
  }

  loadDrill() {
    clearInterval(this.timerInterval);
    this.startTime = null;
    this.isDrillFinished = false;
    this.currentIndex = 0;
    this.totalTyped = 0;
    this.correctTyped = 0;
    this.errorsCount = 0;

    // Update active chip
    const chips = this.dom.drillSteps.querySelectorAll('.step-chip');
    chips.forEach((c, idx) => {
      c.classList.toggle('active', idx === this.currentDrillIndex);
    });

    const lesson = LESSONS_DATA[this.currentLessonKey];
    this.drillText = lesson.drills[this.currentDrillIndex].text;

    this.dom.completionBanner.classList.remove('show');
    this.renderDrillText();
    this.updateTargetPrompt();
    this.updateMetrics();

    this.dom.typingInput.value = '';
    this.dom.typingInput.focus();
  }

  renderDrillText() {
    this.dom.drillStream.innerHTML = '';
    const fragment = document.createDocumentFragment();

    for (let i = 0; i < this.drillText.length; i++) {
      const span = document.createElement('span');
      span.className = 'char char-pending';
      span.textContent = this.drillText[i];
      if (i === 0) span.classList.add('char-current');
      fragment.appendChild(span);
    }

    this.dom.drillStream.appendChild(fragment);
  }

  handleKeyDown(e) {
    if (this.isDrillFinished) return;

    if (e.key === ' ' || e.code === 'Space') {
      e.preventDefault();
    }

    // Visual Key Depress Animation
    const pressedKey = e.key.toLowerCase();
    this.highlightKeyPressed(pressedKey, true);

    if (e.key === 'Shift' || e.key === 'Control' || e.key === 'Alt' || e.key === 'CapsLock' || e.key === 'Tab') {
      return;
    }

    if (!this.startTime) {
      this.startTime = Date.now();
      this.timerInterval = setInterval(() => this.updateMetrics(), 200);
    }

    // Handle Backspace
    if (e.key === 'Backspace') {
      e.preventDefault();
      if (this.currentIndex > 0) {
        this.currentIndex--;
        this.updateCharDisplay();
        this.updateTargetPrompt();
        this.updateMetrics();
      }
      return;
    }

    if (e.key.length !== 1) return;

    this.totalTyped++;
    const expected = this.drillText[this.currentIndex];
    const typed = e.key;
    const isCorrect = typed === expected;

    if (isCorrect) {
      this.correctTyped++;
      this.audio.playClick();
    } else {
      this.errorsCount++;
      this.audio.playError();
    }

    const spans = this.dom.drillStream.children;
    if (spans[this.currentIndex]) {
      spans[this.currentIndex].className = isCorrect ? 'char char-correct' : 'char char-error';
    }

    this.currentIndex++;
    this.updateCharDisplay();

    if (this.currentIndex >= this.drillText.length) {
      this.finishDrill();
    } else {
      this.updateTargetPrompt();
      this.updateMetrics();
    }
  }

  handleKeyUp(e) {
    const pressedKey = e.key.toLowerCase();
    this.highlightKeyPressed(pressedKey, false);
  }

  highlightKeyPressed(key, isPressed) {
    let selector = `[data-key="${key}"]`;
    if (key === ' ') selector = '[data-key=" "]';

    const keyElement = document.querySelector(`.keyboard-wrapper ${selector}`);
    if (keyElement) {
      keyElement.classList.toggle('key-pressed', isPressed);
    }
  }

  updateCharDisplay() {
    const spans = this.dom.drillStream.children;
    for (let i = 0; i < spans.length; i++) {
      spans[i].classList.remove('char-current');
      if (i === this.currentIndex && !this.isDrillFinished) {
        spans[i].classList.add('char-current');
        spans[i].scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
    }
  }

  updateTargetPrompt() {
    // Clear all target-active highlights
    document.querySelectorAll('.kb-key.target-active').forEach(k => k.classList.remove('target-active'));

    if (this.currentIndex >= this.drillText.length) return;

    const targetChar = this.drillText[this.currentIndex];
    const lowerTarget = targetChar.toLowerCase();

    // Find key element on visual keyboard
    let selector = `[data-key="${lowerTarget}"]`;
    if (targetChar === ' ') selector = '[data-key=" "]';

    const keyElement = document.querySelector(`.keyboard-wrapper ${selector}`);
    if (keyElement) {
      keyElement.classList.add('target-active');
    }

    // Lookup finger recommendation
    const fingerInfo = FINGER_DIRECTORY[lowerTarget] || { finger: 'Any Finger', class: '' };

    this.dom.promptTargetKey.textContent = targetChar === ' ' ? 'SPACE' : targetChar;
    this.dom.promptFingerName.textContent = fingerInfo.finger;
  }

  updateMetrics() {
    const elapsedMinutes = this.startTime ? Math.max(0.01, (Date.now() - this.startTime) / 60000) : 0;
    const wpm = elapsedMinutes > 0 ? Math.round((this.correctTyped / 5) / elapsedMinutes) : 0;
    const accuracy = this.totalTyped > 0 ? Math.round((this.correctTyped / this.totalTyped) * 100) : 100;
    const progress = Math.round((this.currentIndex / (this.drillText.length || 1)) * 100);

    this.dom.valWpm.textContent = `${wpm} WPM`;
    this.dom.valAccuracy.textContent = `${accuracy}%`;
    this.dom.valProgress.textContent = `${progress}%`;
    this.dom.valErrors.textContent = this.errorsCount;
  }

  finishDrill() {
    clearInterval(this.timerInterval);
    this.isDrillFinished = true;
    this.audio.playBell();

    this.updateMetrics();
    document.querySelectorAll('.kb-key.target-active').forEach(k => k.classList.remove('target-active'));

    // Mark current step chip as completed
    const chips = this.dom.drillSteps.querySelectorAll('.step-chip');
    if (chips[this.currentDrillIndex]) {
      chips[this.currentDrillIndex].classList.add('completed');
    }

    this.dom.completionBanner.classList.add('show');
    this.dom.completionBanner.scrollIntoView({ behavior: 'smooth' });
  }

  nextDrill() {
    const lesson = LESSONS_DATA[this.currentLessonKey];
    if (this.currentDrillIndex < lesson.drills.length - 1) {
      this.currentDrillIndex++;
    } else {
      // Loop or go to next lesson
      const lessonKeys = Object.keys(LESSONS_DATA);
      const currIdx = lessonKeys.indexOf(this.currentLessonKey);
      if (currIdx < lessonKeys.length - 1) {
        const nextKey = lessonKeys[currIdx + 1];
        const nextBtn = this.dom.lessonNav.querySelector(`[data-lesson="${nextKey}"]`);
        if (nextBtn) nextBtn.click();
        return;
      } else {
        this.currentDrillIndex = 0;
      }
    }
    this.loadDrill();
  }
}

document.addEventListener('DOMContentLoaded', () => {
  new EnglishTypingPracticeApp();
});