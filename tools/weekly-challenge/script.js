// Weekly Challenge - Long-Form Endurance Typing Marathon Engine

const MARATHON_PASSAGES = {
  literature: [
    "Call me Ishmael. Some years ago, never mind how long precisely, having little or no money in my purse, and nothing particular to interest me on shore, I thought I would sail about a little and see the watery part of the world. It is a way I have of driving off the spleen and regulating the circulation. Whenever I find myself growing grim about the mouth; whenever it is a damp, drizzly November in my soul; whenever I find myself involuntarily pausing before coffin warehouses, and bringing up the rear of every funeral I meet; and especially whenever my hypos get such an upper hand of me, that it requires a strong moral principle to prevent me from deliberately stepping into the street, and methodically knocking people's hats off, then, I account it high time to get to sea as soon as I can. This is my substitute for pistol and ball. With a philosophical flourish Cato throws himself upon his sword; I quietly take to the ship. There is nothing surprising in this. If they but knew it, almost all men in their degree, some time or other, cherish very nearly the same feelings towards the ocean with me.",
    "There now is your insular city of the Manhattoes, belted round by wharves as Indian isles by coral reefs, commerce surrounds it with her surf. Right and left, the streets take you waterward. Its extreme downtown is the battery, where that noble mole is washed by waves, and cooled by breezes, which a few hours previous were out of sight of land. Look at the crowds of water gazers there. Circumambulate the city of a dreamy Sabbath afternoon. Go from Corlears Hook to Coenties Slip, and from thence, by Whitehall northward. What do you see? Posted like silent sentinels all around the town, stand thousands upon thousands of mortal men fixed in ocean reveries. Some leaning against the spiles; some seated upon the pier heads; some looking over the bulwarks of ships from China; some high aloft in the rigging, as if striving to get a still better seaward peep. But these are all landsmen; of week days pent up in lath and plaster, tied to counters, nailed to benches, clinched to desks. How then is this? Are the green fields gone? What do they here?",
    "But look! Here come more crowds, pacing straight for the water, and seemingly bound for a dive. Strange! Nothing will content them but the extremest limit of the land; loitering under the shady lee of yonder warehouses will not suffice. No. They must get just as nigh the water as they possibly can without falling in. And there they stand, miles of them, leagues. Inlanders all, they come from lanes and alleys, streets and avenues, north, east, south, and west. Yet here they all unite. Tell me, does the magnetic virtue of the needles of the compasses of all those ships attract them thither? Once more. Say you are in the country; in some high land of lakes. Take almost any path you please, and ten to one it carries you down in a dale, and leaves you there by a pool in the stream. There is magic in it. Let the most absentminded of men be plunged in his deepest reveries, stand that man on his legs, set his feet a-going, and he will infallibly lead you to water, if water there be in all that region.",
    "Should you ever be athirst in the great American desert, try this experiment, if your caravan happen to be supplied with a metaphysical professor. Yes, as every one knows, meditation and water are wedded for ever. But here is an artist. He desires to paint you the dreamiest, shadiest, quietest, most enchanting bit of romantic landscape in all the valley of the Saco. What is the chief element he employs? There stand his trees, each with a hollow trunk, as if a hermit and a crucifix were within; and here sleeps his meadow, and there sleep his cattle; and up from yonder cottage goes a sleepy smoke. Deep into distant woodlands winds a mazy way, reaching to overlapping spurs of mountains bathed in their hillside blue. But though the picture lies thus tranced, and though this pine-tree shakes down its sighs like leaves upon this shepherd's head, yet all were vain, unless the shepherd's eye were fixed upon the magic stream before him. Go visit the Prairies in June, when for scores on scores of miles you wade knee-deep among Tiger-lilies, what is the one charm wanting? Water, there is not a drop of water there! Were Niagara but a cataract of sand, would you travel your thousand miles to see it? Why did the poor poet of Tennessee, upon suddenly receiving two handfuls of silver, deliberate whether to buy him a coat, which he sadly needed, or invest his money in a pedestrian trip to Rockaway Beach? Why is almost every robust healthy boy with a robust healthy soul in him, at some time or other crazy to go to sea?",
    "Why upon your first voyage as a passenger, did you yourself feel such a mystical vibration, when first told that you and your ship were now out of sight of land? Why did the old Persians hold the sea holy? Why did the Greeks give it a separate deity, and make him the brother of Jove? Surely all this is not without meaning. And still deeper the meaning of that story of Narcissus, who because he could not grasp the tormenting, mild image he saw in the fountain, plunged into it and was drowned. But that same image, we ourselves see in all rivers and oceans. It is the image of the ungraspable phantom of life; and this is the key to it all."
  ].join(" "),

  historical: [
    "Four score and seven years ago our fathers brought forth on this continent, a new nation, conceived in Liberty, and dedicated to the proposition that all men are created equal. Now we are engaged in a great civil war, testing whether that nation, or any nation so conceived and so dedicated, can long endure. We are met on a great battle-field of that war. We have come to dedicate a portion of that field, as a final resting place for those who here gave their lives that that nation might live. It is altogether fitting and proper that we should do this. But, in a larger sense, we can not dedicate, we can not consecrate, we can not hallow, this ground. The brave men, living and dead, who struggled here, have consecrated it, far above our poor power to add or detract. The world will little note, nor long remember what we say here, but it can never forget what they did here.",
    "It is for us the living, rather, to be dedicated here to the unfinished work which they who fought here have thus far so nobly advanced. It is rather for us to be here dedicated to the great task remaining before us, that from these honored dead we take increased devotion to that cause for which they gave the last full measure of devotion, that we here highly resolve that these dead shall not have died in vain, that this nation, under God, shall have a new birth of freedom, and that government of the people, by the people, for the people, shall not perish from the earth.",
    "We shall go on to the end, we shall fight in France, we shall fight on the seas and oceans, we shall fight with growing confidence and growing strength in the air, we shall defend our Island, whatever the cost may be, we shall fight on the beaches, we shall fight on the landing grounds, we shall fight in the fields and in the streets, we shall fight in the hills; we shall never surrender, and even if, which I do not for a moment believe, this Island or a large part of it were subjugated and starving, then our Empire beyond the seas, armed and guarded by the British Fleet, would carry on the struggle, until, in God's good time, the New World, with all its power and might, steps forth to the rescue and the liberation of the old.",
    "Let us therefore brace ourselves to our duties, and so bear ourselves that, if the British Empire and its Commonwealth last for a thousand years, men will still say, This was their finest hour. The gratitude of every home in our Island, in our Empire, and indeed throughout the world, except in the abodes of the guilty, goes out to the British airmen who, undaunted by odds, unwearied in their constant challenge and mortal danger, are turning the tide of the world war by their prowess and by their devotion. Never in the field of human conflict was so much owed by so many to so few.",
    "I have a dream that one day this nation will rise up and live out the true meaning of its creed: We hold these truths to be self-evident, that all men are created equal. I have a dream that one day on the red hills of Georgia, the sons of former slaves and the sons of former slave owners will be able to sit down together at the table of brotherhood. I have a dream that my four little children will one day live in a nation where they will not be judged by the color of their skin but by the content of their character. Let freedom ring from every hill and molehill of Mississippi. From every mountainside, let freedom ring."
  ].join(" "),

  software: [
    "Software architecture is the art of drawing lines that separate details from intent. In the construction of robust computational systems, software engineers must maintain a fierce discipline against premature complexity. The Clean Architecture paradigm posits that software systems should be independent of frameworks, testable without UI or database dependencies, independent of external agents, and resilient in the face of inevitable technological deprecation. The inner circles of the architecture represent high-level policy and business entities; the outer circles represent low-level operational mechanisms such as database engines, web servers, and user interfaces. The overarching dependency rule dictates that source code dependencies must only point inwards, toward higher-level policies.",
    "When low-level details dictate high-level enterprise policies, the resulting system suffers from rigidity, fragility, and immobility. A rigid system resists modification because every change propagates through an opaque web of intertwined dependencies. A fragile system breaks in unexpected locations whenever an unrelated component is touched. An immobile architecture prevents the reuse of valuable business algorithms because they cannot be disentangled from the concrete operational runtime. To forestall these systemic failures, we employ the Solid design principles: Single Responsibility, Open-Closed, Liskov Substitution, Interface Segregation, and Dependency Inversion.",
    "The Unix philosophy imparts timeless wisdom to distributed systems engineers: Write programs that do one thing and do it well. Write programs to work together. Write programs to handle text streams, because that is a universal interface. Clean code reads like well-crafted prose. Variables possess descriptive nomenclature that communicates authorial intent without necessitating exhaustive secondary documentation. Functions remain small, focused upon accomplishing a singular algorithmic transformation with zero hidden side effects. When side effects are strictly confined to isolated boundaries, systems attain deterministic reproducibility under unit testing suites.",
    "Refactoring is not a sporadic chore reserved for periods of operational crisis; it is a continuous rhythm interwoven into the very act of writing code. Just as a surgeon maintains a sterile operating environment throughout an intensive procedure, a professional software engineer continually cleans up technical debt as they navigate the codebase. The Boy Scout Rule states: Always leave the campground cleaner than you found it. By steadily removing dead code, clarifying abstractions, and enforcing cohesive modular boundaries, teams sustain predictable delivery velocity over multi-year software lifecycles.",
    "Ultimately, the goal of software architecture is to minimize the human resources required to build and maintain the required system. Beautiful code is not merely an aesthetic triumph; it is an economic imperative that protects organizational agility against the relentless entropy of modern technical environments."
  ].join(" ")
};

// Web Audio Synth
class WeeklySoundSynth {
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
      osc.frequency.setValueAtTime(540 + (Math.random() * 60 - 30), t);
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
      osc.frequency.setValueAtTime(120, t);
      osc.frequency.exponentialRampToValueAtTime(60, t + 0.12);
      gain.gain.setValueAtTime(0.08, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.12);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(t);
      osc.stop(t + 0.12);
    } catch {}
  }
  checkpointChime() {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;
    try {
      const t = this.ctx.currentTime;
      [523.25, 659.25, 783.99].forEach((freq, idx) => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, t + idx * 0.07);
        gain.gain.setValueAtTime(0.06, t + idx * 0.07);
        gain.gain.exponentialRampToValueAtTime(0.001, t + idx * 0.07 + 0.2);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(t + idx * 0.07);
        osc.stop(t + idx * 0.07 + 0.2);
      });
    } catch {}
  }
}

class WeeklyChallengeMarathon {
  constructor() {
    this.sound = new WeeklySoundSynth();
    this.passageKey = 'literature';
    this.words = [];
    this.targetWordCount = 1000;
    this.currentWordIndex = 0;
    this.currentCharIndex = 0;

    // Timer & performance metrics
    this.isRunning = false;
    this.isFinished = false;
    this.timer = null;
    this.elapsedSeconds = 0;
    this.totalTypedChars = 0;
    this.correctChars = 0;
    this.errorCount = 0;

    // Checkpoint tracking (every 200 words)
    this.checkpoints = []; // { segment, range, wpm, accuracy, drift, errors, duration }
    this.lastCheckpointTime = 0;
    this.lastCheckpointWord = 0;
    this.lastCheckpointErrors = 0;
    this.lastCheckpointChars = 0;
    this.baselineWpm = 0;
    this.currentStamina = 100;

    this.dom = {
      passageSelect: document.getElementById('passageSelect'),
      soundToggleBtn: document.getElementById('soundToggleBtn'),
      resetBtn: document.getElementById('resetBtn'),

      checkpointWordCount: document.getElementById('checkpointWordCount'),
      checkpointFill: document.getElementById('checkpointFill'),
      checkpointToast: document.getElementById('checkpointToast'),
      toastTitle: document.getElementById('toastTitle'),
      toastDetails: document.getElementById('toastDetails'),
      toastDismissBtn: document.getElementById('toastDismissBtn'),

      netWpmVal: document.getElementById('netWpmVal'),
      staminaVal: document.getElementById('staminaVal'),
      paceDriftVal: document.getElementById('paceDriftVal'),
      timerVal: document.getElementById('timerVal'),
      accuracyVal: document.getElementById('accuracyVal'),
      errorsSub: document.getElementById('errorsSub'),

      displayPanel: document.getElementById('displayPanel'),
      focusHint: document.getElementById('focusHint'),
      wordsContainer: document.getElementById('wordsContainer'),
      hiddenInput: document.getElementById('hiddenInput'),
      telemetryTbody: document.getElementById('telemetryTbody'),

      // Modal
      completionModal: document.getElementById('completionModal'),
      modalFinalStamina: document.getElementById('modalFinalStamina'),
      modalStaminaRank: document.getElementById('modalStaminaRank'),
      modalFinalWpm: document.getElementById('modalFinalWpm'),
      modalFinalTime: document.getElementById('modalFinalTime'),
      modalPaceDecay: document.getElementById('modalPaceDecay'),
      modalCloseBtn: document.getElementById('modalCloseBtn'),
      modalRestartBtn: document.getElementById('modalRestartBtn')
    };

    this.initEvents();
    this.loadPassage();
  }

  initEvents() {
    this.dom.passageSelect.addEventListener('change', (e) => {
      this.passageKey = e.target.value;
      this.loadPassage();
    });

    this.dom.soundToggleBtn.addEventListener('click', () => {
      this.sound.enabled = !this.sound.enabled;
      this.dom.soundToggleBtn.textContent = `Sound: ${this.sound.enabled ? 'ON' : 'MUTED'}`;
    });

    this.dom.resetBtn.addEventListener('click', () => this.loadPassage());

    this.dom.toastDismissBtn.addEventListener('click', () => {
      this.dom.checkpointToast.style.display = 'none';
    });

    // Focus
    this.dom.displayPanel.addEventListener('click', () => this.focusInput());
    this.dom.focusHint.addEventListener('click', () => this.focusInput());

    // Keyboard
    window.addEventListener('keydown', (e) => {
      if (this.dom.completionModal.classList.contains('active')) {
        if (e.key === 'Escape') this.dom.completionModal.classList.remove('active');
        return;
      }
      if (e.key === 'Escape') {
        this.loadPassage();
        return;
      }

      if (document.activeElement !== this.dom.hiddenInput && !e.ctrlKey && !e.metaKey && !e.altKey) {
        if (e.key.length === 1 || e.key === 'Backspace' || e.key === ' ') {
          this.focusInput();
        }
      }
    });

    this.dom.hiddenInput.addEventListener('keydown', (e) => this.handleKeyDown(e));

    // Modal
    this.dom.modalCloseBtn.addEventListener('click', () => {
      this.dom.completionModal.classList.remove('active');
    });
    this.dom.modalRestartBtn.addEventListener('click', () => {
      this.dom.completionModal.classList.remove('active');
      this.loadPassage();
    });
  }

  focusInput() {
    this.dom.hiddenInput.focus();
    this.dom.displayPanel.classList.add('focused');
    this.dom.focusHint.classList.add('hidden');
  }

  loadPassage() {
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
    this.checkpoints = [];
    this.lastCheckpointTime = 0;
    this.lastCheckpointWord = 0;
    this.lastCheckpointErrors = 0;
    this.lastCheckpointChars = 0;
    this.baselineWpm = 0;
    this.currentStamina = 100;

    // Prepare passage (trim / repeat to precisely 1000 words)
    const raw = MARATHON_PASSAGES[this.passageKey] || MARATHON_PASSAGES.literature;
    let list = raw.split(/\s+/);
    while (list.length < 1000) {
      list = list.concat(list);
    }
    this.words = list.slice(0, 1000);

    this.renderWords();
    this.updateStatsUI();
    this.renderTelemetryTable();

    // Reset checkpoint nodes
    [200, 400, 600, 800, 1000].forEach(num => {
      const el = document.getElementById(`node_${num}`);
      if (el) el.className = 'wc-cp-node';
    });
    const node0 = document.getElementById('node_0');
    if (node0) node0.className = 'wc-cp-node active';

    this.dom.checkpointFill.style.width = '0%';
    this.dom.checkpointWordCount.textContent = '0 / 1000 Words';
    this.dom.checkpointToast.style.display = 'none';

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
      wordSpan.className = 'wc-word';
      wordSpan.dataset.wordIndex = wIdx;

      for (let cIdx = 0; cIdx < wordText.length; cIdx++) {
        const charSpan = document.createElement('span');
        charSpan.className = 'wc-char';
        charSpan.textContent = wordText[cIdx];
        if (wIdx === 0 && cIdx === 0) charSpan.classList.add('current');
        wordSpan.appendChild(charSpan);
      }
      container.appendChild(wordSpan);
    });
  }

  startMarathon() {
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
      this.startMarathon();
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
            charEl.className = 'wc-char current';
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

      const chars = wordEl.querySelectorAll('.wc-char:not(.extra)');
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

      // Check Checkpoint Milestone (at 200, 400, 600, 800, 1000)
      if (this.currentWordIndex % 200 === 0 && this.currentWordIndex > 0) {
        this.recordCheckpoint(this.currentWordIndex);
      }

      if (this.currentWordIndex >= this.words.length) {
        this.finishMarathon();
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

    // REGULAR CHARACTER
    if (e.key.length === 1) {
      e.preventDefault();
      this.totalTypedChars++;

      const expectedChar = currentWordText[this.currentCharIndex];
      const charEl = wordEl.children[this.currentCharIndex];

      if (this.currentCharIndex < currentWordText.length && charEl) {
        charEl.classList.remove('current');
        if (e.key === expectedChar) {
          charEl.className = 'wc-char correct';
          this.correctChars++;
          this.sound.click();
        } else {
          charEl.className = 'wc-char incorrect';
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
        extraSpan.className = 'wc-char extra';
        extraSpan.textContent = e.key;
        wordEl.appendChild(extraSpan);
        this.currentCharIndex++;
      }

      this.updateStatsUI();
    }
  }

  adjustScroll(activeWordEl) {
    const offsetTop = activeWordEl.offsetTop;
    if (offsetTop > 80) {
      this.dom.wordsContainer.style.transform = `translateY(-${offsetTop - 40}px)`;
    } else {
      this.dom.wordsContainer.style.transform = 'translateY(0)';
    }
  }

  recordCheckpoint(wordIndex) {
    const segmentNumber = wordIndex / 200;
    const durationSec = Math.max(this.elapsedSeconds - this.lastCheckpointTime, 1);
    const segmentChars = this.totalTypedChars - this.lastCheckpointChars;
    const segmentErrors = this.errorCount - this.lastCheckpointErrors;

    const segmentWpm = Math.round((200 / durationSec) * 60);
    const segmentAcc = segmentChars > 0 ? Math.round(((segmentChars - segmentErrors) / segmentChars) * 100) : 100;

    if (segmentNumber === 1) {
      this.baselineWpm = segmentWpm;
    }

    let drift = 0;
    if (this.baselineWpm > 0) {
      drift = Math.round(((segmentWpm - this.baselineWpm) / this.baselineWpm) * 100);
    }

    // Stamina penalty calculation
    const staminaDrop = Math.max(0, -drift) * 0.7 + (segmentErrors * 0.5);
    this.currentStamina = Math.max(10, Math.min(100, Math.round(100 - staminaDrop)));

    this.checkpoints.push({
      segment: segmentNumber,
      range: `${wordIndex - 200} - ${wordIndex}w`,
      wpm: segmentWpm,
      accuracy: segmentAcc,
      drift,
      errors: segmentErrors,
      duration: durationSec
    });

    // Update state markers
    this.lastCheckpointTime = this.elapsedSeconds;
    this.lastCheckpointWord = wordIndex;
    this.lastCheckpointErrors = this.errorCount;
    this.lastCheckpointChars = this.totalTypedChars;

    // UI Updates
    const nodeEl = document.getElementById(`node_${wordIndex}`);
    if (nodeEl) {
      nodeEl.classList.add('completed');
    }

    this.sound.checkpointChime();
    this.showCheckpointToast(segmentNumber, segmentWpm, drift);
    this.renderTelemetryTable();
  }

  showCheckpointToast(segNum, wpm, drift) {
    this.dom.toastTitle.textContent = `Checkpoint ${segNum} Passed (${segNum * 200} Words)!`;
    const driftText = drift >= 0 ? `+${drift}% pace acceleration` : `${drift}% pace drift (fatigue)`;
    this.dom.toastDetails.textContent = `Segment Speed: ${wpm} WPM | Pace Drift: ${driftText} | Stamina: ${this.currentStamina}/100`;
    this.dom.checkpointToast.style.display = 'flex';
  }

  renderTelemetryTable() {
    const tbody = this.dom.telemetryTbody;
    tbody.innerHTML = '';

    if (this.checkpoints.length === 0) {
      tbody.innerHTML = `<tr><td colspan="6" style="text-align: center; color: var(--text-tertiary); padding: 1rem;">No segments completed yet. Begin typing to log checkpoint data.</td></tr>`;
      return;
    }

    this.checkpoints.forEach(cp => {
      const tr = document.createElement('tr');
      const driftColor = cp.drift >= 0 ? 'var(--success)' : 'var(--error)';
      const driftSign = cp.drift > 0 ? '+' : '';
      tr.innerHTML = `
        <td style="font-weight: 700; color: var(--accent);">Segment #${cp.segment}</td>
        <td>${cp.range}</td>
        <td style="font-weight: 600; font-family: monospace;">${cp.wpm} WPM</td>
        <td style="color: var(--success); font-family: monospace;">${cp.accuracy}%</td>
        <td style="color: ${driftColor}; font-weight: 700; font-family: monospace;">${driftSign}${cp.drift}%</td>
        <td><span style="font-size: 0.75rem; background: rgba(16, 185, 129, 0.1); color: var(--success); padding: 0.15rem 0.5rem; border-radius: 4px;">Logged</span></td>
      `;
      tbody.appendChild(tr);
    });
  }

  calculateOverallNetWpm() {
    const mins = Math.max(this.elapsedSeconds / 60, 0.05);
    const gross = (this.totalTypedChars / 5) / mins;
    const pen = this.errorCount / mins;
    return Math.max(0, Math.round(gross - pen));
  }

  calculateOverallAccuracy() {
    if (this.totalTypedChars === 0) return 100;
    return Math.max(0, Math.min(100, Math.round((this.correctChars / this.totalTypedChars) * 100)));
  }

  updateStatsUI() {
    const net = this.calculateOverallNetWpm();
    const acc = this.calculateOverallAccuracy();

    this.dom.netWpmVal.textContent = net;
    this.dom.accuracyVal.textContent = `${acc}%`;
    this.dom.errorsSub.textContent = `${this.errorCount} errors`;
    this.dom.staminaVal.textContent = `${this.currentStamina}%`;

    // Drift calculation
    if (this.baselineWpm > 0) {
      const drift = Math.round(((net - this.baselineWpm) / this.baselineWpm) * 100);
      const sign = drift > 0 ? '+' : '';
      this.dom.paceDriftVal.textContent = `${sign}${drift}%`;
      this.dom.paceDriftVal.style.color = drift >= 0 ? 'var(--success)' : 'var(--error)';
    }

    // Word progress
    this.dom.checkpointWordCount.textContent = `${this.currentWordIndex} / 1000 Words`;
    const percent = Math.min(100, (this.currentWordIndex / 1000) * 100);
    this.dom.checkpointFill.style.width = `${percent}%`;
  }

  finishMarathon() {
    this.isFinished = true;
    this.isRunning = false;
    clearInterval(this.timer);

    const overallWpm = this.calculateOverallNetWpm();

    let decay = '0%';
    if (this.checkpoints.length >= 2) {
      const first = this.checkpoints[0].wpm;
      const last = this.checkpoints[this.checkpoints.length - 1].wpm;
      const diff = Math.round(((last - first) / first) * 100);
      decay = `${diff > 0 ? '+' : ''}${diff}%`;
    }

    let staminaRank = 'Marathon Master';
    if (this.currentStamina >= 90) staminaRank = 'Iron Will Typist';
    else if (this.currentStamina >= 75) staminaRank = 'Endurance Specialist';
    else if (this.currentStamina < 60) staminaRank = 'Fatigue Susceptible';

    this.dom.modalFinalStamina.textContent = `${this.currentStamina} / 100`;
    this.dom.modalStaminaRank.textContent = staminaRank;
    this.dom.modalFinalWpm.textContent = overallWpm;
    this.dom.modalFinalTime.textContent = this.formatTime(this.elapsedSeconds);
    this.dom.modalPaceDecay.textContent = decay;

    this.dom.completionModal.classList.add('active');
  }

  formatTime(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }
}

document.addEventListener('DOMContentLoaded', () => {
  new WeeklyChallengeMarathon();
});