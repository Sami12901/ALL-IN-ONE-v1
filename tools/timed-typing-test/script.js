/**
 * Timed Typing Test & Official Certificate Generator
 * Fully client-side vanilla ES Module.
 */

const PASSAGES_POOL = [
  "In the pursuit of digital fluency, the modern keyboard represents the fundamental interface bridging human cognition and machine execution. Typing is not merely the mechanical depression of plastic keys, but an expressive art form where thought translates directly into digital ink without friction or hesitation.",
  "When an engineer or writer achieves touch typing mastery, cognitive load shifts entirely away from finger placement toward conceptual architecture and linguistic precision. The fingers dance across the rows guided by deeply conditioned muscle memory, instinctively predicting bigrams, trigrams, and frequent word sequences with effortless velocity.",
  "Historical developments in human-computer interaction have continually reinforced the importance of the standard QWERTY layout. Originally patented by Christopher Latham Sholes in 1874 to prevent mechanical jams on mechanical typewriters, this enduring configuration has withstood decades of alternative ergonomic layouts including Dvorak and Colemak.",
  "Scientific assessments of workplace productivity establish that elevating typing speed from thirty words per minute to sixty words per minute halves the physical duration needed to compose documentation, correspondence, and source code. More critically, high keyboard throughput preserves psychological flow states, shielding creative momentum from the disruptive friction of slow manual input.",
  "Professional software engineering demands extreme precision in manipulating arbitrary syntax, punctuation symbols, brackets, and alphanumeric tokens. A single misplaced parenthesis or omitted semicolon halts the compilation process of millions of lines of code, illustrating that speed must always be tempered by unwavering accuracy.",
  "The psychology of performance under time constraints reveals that maintaining relaxed breathing and low muscle tension in the shoulders and wrists allows neurological impulses to travel smoothly to the fingertips. When typists rush recklessly, panic induces muscular contraction, triggering rapid cascade errors and erratic rhythm.",
  "By training consistently across diverse textual domains—spanning legal briefs, philosophical literature, business correspondence, and technical architectures—practitioners build comprehensive motor flexibility capable of navigating unexpected vocabularies with unwavering grace."
];

class TimedTypingTestApp {
  constructor() {
    this.selectedDuration = 60; // default 60s
    this.remainingTime = 60;
    this.timerInterval = null;
    this.isTestActive = false;
    this.isTestFinished = false;

    this.fullText = '';
    this.currentIndex = 0;
    this.totalKeystrokes = 0;
    this.correctKeystrokes = 0;
    this.errorsCount = 0;
    this.typedChars = [];

    this.dom = {
      timerStatCard: document.getElementById('timer-stat-card'),
      valTimeRemaining: document.getElementById('val-time-remaining'),
      valNetWpm: document.getElementById('val-net-wpm'),
      valAccuracy: document.getElementById('val-accuracy'),
      valWords: document.getElementById('val-words'),
      valErrors: document.getElementById('val-errors'),

      durationSelector: document.getElementById('duration-selector'),
      btnRestartTest: document.getElementById('btn-restart-test'),

      passageContainer: document.getElementById('passage-container'),
      passageText: document.getElementById('passage-text'),
      typingInput: document.getElementById('typing-input'),
      clickPrompt: document.getElementById('click-prompt'),

      certificateContainer: document.getElementById('certificate-container'),
      inputRecipientName: document.getElementById('input-recipient-name'),
      certRecipientName: document.getElementById('cert-recipient-name'),
      certWpm: document.getElementById('cert-wpm'),
      certAcc: document.getElementById('cert-acc'),
      certDuration: document.getElementById('cert-duration'),
      certPercentile: document.getElementById('cert-percentile'),
      certId: document.getElementById('cert-id'),
      certDate: document.getElementById('cert-date'),
      btnPrintCert: document.getElementById('btn-print-cert'),
      btnRetake: document.getElementById('btn-retake')
    };

    this.bindEvents();
    this.setupTest();
  }

  bindEvents() {
    this.dom.passageContainer.addEventListener('click', () => {
      if (this.isTestFinished) return;
      this.dom.typingInput.focus();
      this.dom.clickPrompt.classList.add('hidden');
      this.dom.passageContainer.classList.add('is-focused');
    });

    this.dom.typingInput.addEventListener('keydown', (e) => this.handleKeyDown(e));

    // Duration selector
    this.dom.durationSelector.addEventListener('click', (e) => {
      const btn = e.target.closest('.pill-btn');
      if (!btn) return;
      this.dom.durationSelector.querySelectorAll('.pill-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      this.selectedDuration = parseInt(btn.dataset.seconds, 10);
      this.setupTest();
    });

    this.dom.btnRestartTest.addEventListener('click', () => this.setupTest());
    this.dom.btnRetake.addEventListener('click', () => this.setupTest());

    // Live update recipient name on certificate
    this.dom.inputRecipientName.addEventListener('input', () => {
      const name = this.dom.inputRecipientName.value.trim() || 'Champion Typist';
      this.dom.certRecipientName.textContent = name;
    });

    // Print certificate
    this.dom.btnPrintCert.addEventListener('click', () => {
      window.print();
    });

    document.addEventListener('keydown', (e) => {
      if (this.isTestFinished) return;
      if (e.target.tagName === 'INPUT' && e.target.id === 'input-recipient-name') return;
      if (e.target.tagName === 'TEXTAREA') return;

      if (!e.ctrlKey && !e.altKey && !e.metaKey && e.key.length === 1) {
        this.dom.typingInput.focus();
        this.dom.clickPrompt.classList.add('hidden');
        this.dom.passageContainer.classList.add('is-focused');
      }
    });
  }

  setupTest() {
    clearInterval(this.timerInterval);
    this.isTestActive = false;
    this.isTestFinished = false;
    this.remainingTime = this.selectedDuration;

    this.currentIndex = 0;
    this.totalKeystrokes = 0;
    this.correctKeystrokes = 0;
    this.errorsCount = 0;
    this.typedChars = [];

    // Reset UI
    this.updateTimerDisplay();
    this.dom.timerStatCard.classList.remove('danger');
    this.dom.valNetWpm.textContent = '0';
    this.dom.valAccuracy.textContent = '100%';
    this.dom.valWords.textContent = '0';
    this.dom.valErrors.textContent = '0';

    this.dom.passageContainer.classList.remove('locked');
    this.dom.certificateContainer.classList.remove('show');

    // Shuffle & join paragraphs for abundant text stream
    const shuffled = [...PASSAGES_POOL].sort(() => 0.5 - Math.random());
    this.fullText = shuffled.join(' ');
    this.renderPassage();

    this.dom.typingInput.value = '';
    this.dom.typingInput.focus();
  }

  renderPassage() {
    this.dom.passageText.innerHTML = '';
    const fragment = document.createDocumentFragment();

    for (let i = 0; i < this.fullText.length; i++) {
      const span = document.createElement('span');
      span.className = 'char char-pending';
      span.textContent = this.fullText[i];
      if (i === 0) span.classList.add('char-current');
      fragment.appendChild(span);
    }

    this.dom.passageText.appendChild(fragment);
    this.typedChars = new Array(this.fullText.length).fill(null);
    this.dom.clickPrompt.classList.remove('hidden');
  }

  handleKeyDown(e) {
    if (this.isTestFinished) return;

    if (e.key === ' ' || e.code === 'Space') {
      e.preventDefault();
    }

    if (e.key === 'Shift' || e.key === 'Control' || e.key === 'Alt' || e.key === 'CapsLock' || e.key === 'Tab') {
      return;
    }

    if (!this.isTestActive && !this.isTestFinished) {
      this.startTimer();
    }

    // Handle Backspace
    if (e.key === 'Backspace') {
      e.preventDefault();
      if (this.currentIndex > 0) {
        this.currentIndex--;
        this.typedChars[this.currentIndex] = null;
        this.updateCharDisplay(this.currentIndex);
        this.updateLiveStats();
      }
      return;
    }

    if (e.key.length !== 1) return;

    this.totalKeystrokes++;
    const expected = this.fullText[this.currentIndex];
    const typed = e.key;
    const isCorrect = typed === expected;

    if (isCorrect) {
      this.correctKeystrokes++;
    } else {
      this.errorsCount++;
    }

    this.typedChars[this.currentIndex] = { typed, expected, isCorrect };
    this.currentIndex++;
    this.updateCharDisplay(this.currentIndex - 1);
    this.updateLiveStats();
  }

  updateCharDisplay(idx) {
    const spans = this.dom.passageText.children;
    if (spans[idx]) {
      const item = this.typedChars[idx];
      spans[idx].className = 'char';
      if (item === null) {
        spans[idx].classList.add('char-pending');
      } else if (item.isCorrect) {
        spans[idx].classList.add('char-correct');
      } else {
        spans[idx].classList.add('char-error');
      }
    }

    for (let i = 0; i < spans.length; i++) {
      spans[i].classList.remove('char-current');
      if (i === this.currentIndex) {
        spans[i].classList.add('char-current');
        spans[i].scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
  }

  startTimer() {
    this.isTestActive = true;
    this.dom.clickPrompt.classList.add('hidden');

    this.timerInterval = setInterval(() => {
      this.remainingTime--;
      this.updateTimerDisplay();

      if (this.remainingTime <= 10) {
        this.dom.timerStatCard.classList.add('danger');
      }

      this.updateLiveStats();

      if (this.remainingTime <= 0) {
        this.finishTest();
      }
    }, 1000);
  }

  updateTimerDisplay() {
    const mins = Math.floor(this.remainingTime / 60);
    const secs = this.remainingTime % 60;
    this.dom.valTimeRemaining.textContent = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  }

  updateLiveStats() {
    const elapsedSeconds = Math.max(1, this.selectedDuration - this.remainingTime);
    const elapsedMinutes = elapsedSeconds / 60;

    let correctCount = 0;
    for (let i = 0; i < this.currentIndex; i++) {
      if (this.typedChars[i]?.isCorrect) correctCount++;
    }

    const netWpm = Math.max(0, Math.round((correctCount / 5) / elapsedMinutes));
    const accuracy = this.currentIndex > 0
      ? ((correctCount / this.currentIndex) * 100).toFixed(1)
      : '100.0';

    // Count completed space-delimited words
    const wordsTyped = Math.floor(correctCount / 5);

    this.dom.valNetWpm.textContent = netWpm;
    this.dom.valAccuracy.textContent = `${accuracy}%`;
    this.dom.valWords.textContent = wordsTyped;
    this.dom.valErrors.textContent = this.errorsCount;
  }

  finishTest() {
    clearInterval(this.timerInterval);
    this.isTestActive = false;
    this.isTestFinished = true;

    this.dom.valTimeRemaining.textContent = '00:00';
    this.dom.timerStatCard.classList.remove('danger');
    this.dom.passageContainer.classList.add('locked');

    // Final computations
    const testMinutes = this.selectedDuration / 60;
    let correctCount = 0;
    for (let i = 0; i < this.currentIndex; i++) {
      if (this.typedChars[i]?.isCorrect) correctCount++;
    }

    const finalNetWpm = Math.max(0, Math.round((correctCount / 5) / testMinutes));
    const finalAccuracy = this.currentIndex > 0
      ? ((correctCount / this.currentIndex) * 100).toFixed(1)
      : '100.0';

    // Percentile & global rank calculation
    let percentile = 'Top 85% (Novice)';
    if (finalNetWpm >= 100) {
      percentile = 'Top 1% (Grandmaster)';
    } else if (finalNetWpm >= 80) {
      percentile = 'Top 5% (Master)';
    } else if (finalNetWpm >= 65) {
      percentile = 'Top 12% (Pro)';
    } else if (finalNetWpm >= 50) {
      percentile = 'Top 25% (Advanced)';
    } else if (finalNetWpm >= 38) {
      percentile = 'Top 45% (Above Average)';
    } else if (finalNetWpm >= 25) {
      percentile = 'Top 65% (Intermediate)';
    }

    const durationLabel = this.selectedDuration >= 60
      ? `${this.selectedDuration / 60} Min`
      : `${this.selectedDuration} Sec`;

    // Certificate details
    const certNumber = `CERT-WPM-${Math.floor(1000 + Math.random() * 9000)}-${new Date().getFullYear()}`;
    const formattedDate = new Date().toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    // Populate Certificate
    this.dom.certWpm.textContent = finalNetWpm;
    this.dom.certAcc.textContent = `${finalAccuracy}%`;
    this.dom.certDuration.textContent = durationLabel;
    this.dom.certPercentile.textContent = percentile;
    this.dom.certId.textContent = certNumber;
    this.dom.certDate.textContent = formattedDate;

    const currentName = this.dom.inputRecipientName.value.trim() || 'Champion Typist';
    this.dom.certRecipientName.textContent = currentName;

    // Show Certificate
    this.dom.certificateContainer.classList.add('show');
    this.dom.certificateContainer.scrollIntoView({ behavior: 'smooth' });
  }
}

document.addEventListener('DOMContentLoaded', () => {
  new TimedTypingTestApp();
});