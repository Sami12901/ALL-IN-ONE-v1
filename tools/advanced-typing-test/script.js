// Advanced Typing Test - Elite Benchmark Logic

const PASSAGES = {
  tech: [
    "Asymptotic computational complexity analyzes the limiting behavior of algorithmic execution. In self-balancing red-black binary search trees, amortized worst-case lookup, insertion, and deletion exhibit logarithmic O(log n) temporal bounds. When managing concurrency in distributed transactional architectures, idempotent consensus protocols like Raft and Paxos mitigate network partitioning and Byzantine failures.",
    "Cryptographic zero-knowledge proofs enable one party to verify the veracity of a mathematical statement without divulging extraneous telemetry. Asymmetric key cryptography leverages elliptic-curve discrete logarithms to safeguard ephemeral session handshakes against quantum algorithmic decryption, while secure hash functions ensure message authentication and immutability.",
    "Modern operating systems orchestrate virtual memory pagination through translation lookaside buffers and multi-level page tables. Premature thread synchronization introduces non-deterministic deadlocks and memory corruption. Kernel-level asynchronous I/O primitives bypass user-space context switching to accelerate high-throughput network packet ingestion.",
    "In biomedical engineering and computational genomics, high-throughput deoxyribonucleic acid sequencing correlates single-nucleotide polymorphisms with phenotypic manifestations of atherosclerotic cardiovascular disease. Quantitative pharmacokinetics models the dynamic absorption, distribution, metabolism, and excretion of therapeutic monoclonal antibodies."
  ],
  punct: [
    "\"Wait—did you verify the checksum?\" asked Dr. Vance; 'The SHA-256 digest [0x7f..9a] does not match!' Despite the warning (issued at 04:15:32 UTC), the automated deployment pipeline executed: build=failed; rollback=true; exit_code=-1.",
    "Consider the philosophical premise: if A = {x | x > 0} and B = {y | y <= 0}, then A ∩ B = ∅; consequently, proposition (P ∧ ¬P) yields a classical contradiction! As Shakespeare wrote: 'To be, or not to be—that is the question: whether 'tis nobler in the mind...'",
    "The configuration payload—nested within /etc/systemd/system/app.service—reads as follows: ExecStart=/usr/bin/node --max-old-space-size=4096 (env: PRODUCTION); Restart=always; LimitNOFILE=65536; TimeoutStopSec=30s; [Install] WantedBy=multi-user.target.",
    "\"Is that so?\" inquired the inspector. \"Every variable—from the suspect's alibi (verified between 8:00–9:30 p.m.) to the missing £50,000 banknote—points toward an inside conspiracy!\" Yet, no forensic evidence remained: zero fingerprints, no traces, nothing."
  ],
  caps: [
    "NASA, CERN, and UNESCO convened an international summit on Artificial Intelligence (AI) and Quantum Computing (QC). Senior Engineers from Google, Apple, Microsoft, and OpenAI reviewed GraphQL endpoints, JSON Web Tokens (JWT), and OAuth2.0 implementations.",
    "In TypeScript and React development, developers routinely type: interface UserProfileState { userId: string; isActive: boolean; fetchUserDataById: (id: string) => Promise<User>; } alongside Redux toolkit actions like SET_AUTHENTICATION_STATUS and DISPATCH_GLOBAL_NOTIFICATION.",
    "The United States Supreme Court (SCOTUS) and the Federal Communications Commission (FCC) issued joint regulatory guidelines regarding WebAssembly (WASM), IPv6 migration, DNSSEC authentication, and GDPR compliance standards across all North American enterprise networks.",
    "Title Case Conventions Require That Every Significant Noun, Pronoun, Verb, Adjective, And Adverb Is Capitalized, While Short Prepositions, Articles, And Conjunctions Remain Lowercase, Except When Positioned At The Beginning Or End Of The Headline."
  ]
};

const MODE_DESCRIPTIONS = {
  tech: "<strong>Technical Vocabulary:</strong> Tests agility across complex algorithmic concepts, cryptographic primitives, asynchronous patterns, and bioscience jargon.",
  punct: "<strong>Advanced Punctuation:</strong> Rigorous stress test utilizing semicolons, nested quotes, dashes, brackets, and mathematical operators.",
  caps: "<strong>Capitalization Stress Test:</strong> Demanding Shift-key coordination across acronyms, CamelCase, Title Case, and uppercase abbreviations."
};

const PERCENTILE_TIERS = [
  { minWpm: 100, minAcc: 97, tier: "Top 1% Grandmaster", badgeClass: "att-rank-top1", desc: "Top 1% of global typists. Exceptional benchmark mastery." },
  { minWpm: 85, minAcc: 95, tier: "Top 5% Elite Typist", badgeClass: "att-rank-top5", desc: "Top 5% speed. Superior touch typing dexterity and rhythm." },
  { minWpm: 75, minAcc: 93, tier: "Top 10% Master Typist", badgeClass: "att-rank-top20", desc: "Top 10% speed. Professional grade commercial typing competence." },
  { minWpm: 60, minAcc: 90, tier: "Top 20% Advanced Typist", badgeClass: "att-rank-top20", desc: "Top 20% speed. Well above average keyboard fluency." },
  { minWpm: 45, minAcc: 85, tier: "Top 50% Proficient", badgeClass: "att-rank-proficient", desc: "Top 50% percentile. Solid baseline speed with room to optimize." },
  { minWpm: 0, minAcc: 0, tier: "Developing Typist", badgeClass: "att-rank-developing", desc: "Baseline typing proficiency. Regular daily drills will build stamina." }
];

document.addEventListener('DOMContentLoaded', () => {
  // DOM Elements
  const modeButtons = document.querySelectorAll('#mode-group .att-pill-btn');
  const durationButtons = document.querySelectorAll('#duration-group .att-pill-btn');
  const strictToggle = document.getElementById('strict-toggle');
  const soundToggle = document.getElementById('sound-toggle');
  const soundIcon = document.getElementById('sound-icon');
  const modeDesc = document.getElementById('mode-desc');

  const statTime = document.getElementById('stat-time');
  const statNetWpm = document.getElementById('stat-net-wpm');
  const statRawWpm = document.getElementById('stat-raw-wpm');
  const statErrorRate = document.getElementById('stat-error-rate');
  const statConsistency = document.getElementById('stat-consistency');
  const progressBar = document.getElementById('progress-bar');
  const charCounter = document.getElementById('char-counter');
  const penaltyCounter = document.getElementById('penalty-counter');

  const displayPanel = document.getElementById('display-panel');
  const textDisplay = document.getElementById('text-display');
  const hiddenInput = document.getElementById('hidden-input');
  const focusHint = document.getElementById('focus-hint');
  const btnRestart = document.getElementById('btn-restart');

  // Modal Elements
  const scorecardModal = document.getElementById('scorecard-modal');
  const modalRankBadge = document.getElementById('modal-rank-badge');
  const modalNetWpm = document.getElementById('modal-net-wpm');
  const modalRawWpm = document.getElementById('modal-raw-wpm');
  const modalAccuracy = document.getElementById('modal-accuracy');
  const modalErrorRate = document.getElementById('modal-error-rate');
  const modalConsistency = document.getElementById('modal-consistency');
  const modalPenalties = document.getElementById('modal-penalties');
  const modalModeLabel = document.getElementById('modal-mode-label');
  const modalCharsBreakdown = document.getElementById('modal-chars-breakdown');
  const modalTimeTaken = document.getElementById('modal-time-taken');
  const modalPercentileText = document.getElementById('modal-percentile-text');
  const modalBtnCopy = document.getElementById('modal-btn-copy');
  const modalBtnRetry = document.getElementById('modal-btn-retry');

  // State Variables
  let currentMode = 'tech';
  let targetDuration = 30; // 30, 60, 120, or 'passage'
  let isStrictMode = false;
  let isSoundEnabled = true;

  let currentText = '';
  let currentIndex = 0;
  let charStatus = []; // 'pending', 'correct', 'incorrect'
  let charSpans = [];

  let isStarted = false;
  let isFinished = false;
  let startTime = null;
  let timerInterval = null;
  let secondsRemaining = 30;
  let totalTimeElapsed = 0;

  let totalCharsTyped = 0;
  let totalErrors = 0;
  let backspacePenalties = 0;

  // Consistency tracker: rolling samples of interval WPM every 1.5s
  let wpmSnapshots = [];
  let lastSnapshotChars = 0;
  let lastSnapshotTime = 0;

  // Web Audio Context for mechanical click
  let audioCtx = null;

  function initAudio() {
    if (!audioCtx) {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      if (AudioContextClass) {
        audioCtx = new AudioContextClass();
      }
    }
  }

  function playClickSound(isError = false) {
    if (!isSoundEnabled) return;
    try {
      initAudio();
      if (!audioCtx) return;
      if (audioCtx.state === 'suspended') {
        audioCtx.resume();
      }

      const now = audioCtx.currentTime;
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();

      if (isError) {
        // Harsh low error chirp
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(160, now);
        osc.frequency.exponentialRampToValueAtTime(80, now + 0.08);
        gain.gain.setValueAtTime(0.2, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.start(now);
        osc.stop(now + 0.08);
      } else {
        // Mechanical crisp keyboard click
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(650 + Math.random() * 80, now);
        osc.frequency.exponentialRampToValueAtTime(180, now + 0.035);
        gain.gain.setValueAtTime(0.12, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.035);
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.start(now);
        osc.stop(now + 0.035);
      }
    } catch (_) {
      // Audio autoplay policy safety fallback
    }
  }

  function getRandomPassage(mode) {
    const list = PASSAGES[mode] || PASSAGES.tech;
    return list[Math.floor(Math.random() * list.length)];
  }

  function resetTest() {
    clearInterval(timerInterval);
    timerInterval = null;

    isStarted = false;
    isFinished = false;
    startTime = null;
    currentIndex = 0;
    totalCharsTyped = 0;
    totalErrors = 0;
    backspacePenalties = 0;
    wpmSnapshots = [];
    lastSnapshotChars = 0;
    lastSnapshotTime = 0;

    if (targetDuration === 'passage') {
      secondsRemaining = 0;
      statTime.textContent = 'Passage';
    } else {
      secondsRemaining = targetDuration;
      statTime.textContent = secondsRemaining;
    }

    statNetWpm.textContent = '0';
    statRawWpm.textContent = '0';
    statErrorRate.textContent = '0.0%';
    statConsistency.textContent = '100%';
    progressBar.style.width = '0%';
    charCounter.textContent = '0';
    penaltyCounter.textContent = '0';

    hiddenInput.value = '';
    currentText = getRandomPassage(currentMode);
    charStatus = new Array(currentText.length).fill('pending');

    renderText();
    focusHint.style.display = 'flex';
    displayPanel.classList.remove('focused');
    scorecardModal.classList.remove('show');
  }

  function renderText() {
    textDisplay.innerHTML = '';
    charSpans = [];

    const fragment = document.createDocumentFragment();
    for (let i = 0; i < currentText.length; i++) {
      const span = document.createElement('span');
      span.className = 'att-char';
      span.textContent = currentText[i];
      if (i === 0) {
        span.classList.add('att-char-current');
      }
      charSpans.push(span);
      fragment.appendChild(span);
    }
    textDisplay.appendChild(fragment);
  }

  function updateCharVisuals() {
    for (let i = 0; i < currentText.length; i++) {
      const span = charSpans[i];
      if (!span) continue;

      span.className = 'att-char';
      if (i < currentIndex) {
        if (charStatus[i] === 'correct') {
          span.classList.add('att-char-correct');
        } else if (charStatus[i] === 'incorrect') {
          span.classList.add('att-char-incorrect');
        }
      } else if (i === currentIndex) {
        span.classList.add('att-char-current');
      }
    }

    // Auto-scroll so current char stays in view
    if (charSpans[currentIndex]) {
      const currentSpan = charSpans[currentIndex];
      const panelTop = textDisplay.scrollTop;
      const panelHeight = textDisplay.clientHeight;
      const spanTop = currentSpan.offsetTop;

      if (spanTop > panelTop + panelHeight - 80) {
        textDisplay.scrollTop = spanTop - 60;
      } else if (spanTop < panelTop) {
        textDisplay.scrollTop = spanTop - 40;
      }
    }

    // Update progress bar
    const progressPercent = Math.min(100, Math.round((currentIndex / currentText.length) * 100));
    progressBar.style.width = `${progressPercent}%`;
    charCounter.textContent = totalCharsTyped;
    penaltyCounter.textContent = backspacePenalties;
  }

  function calculateConsistency() {
    if (wpmSnapshots.length < 3) return 100;
    const sum = wpmSnapshots.reduce((acc, v) => acc + v, 0);
    const mean = sum / wpmSnapshots.length;
    if (mean <= 0) return 100;

    const variance = wpmSnapshots.reduce((acc, v) => acc + Math.pow(v - mean, 2), 0) / wpmSnapshots.length;
    const stdDev = Math.sqrt(variance);
    const cv = (stdDev / mean) * 100; // coefficient of variation

    const consistency = Math.max(10, Math.min(100, Math.round(100 - cv * 1.2)));
    return consistency;
  }

  function computeLiveStats() {
    if (!startTime) return;
    const now = performance.now();
    const elapsedMinutes = (now - startTime) / 60000;
    if (elapsedMinutes <= 0.01) return;

    // Raw WPM: (totalCharsTyped / 5) / elapsedMinutes
    const rawWpm = Math.max(0, Math.round((totalCharsTyped / 5) / elapsedMinutes));

    // Correct characters currently in text
    let correctCount = 0;
    let incorrectCount = 0;
    for (let i = 0; i < currentIndex; i++) {
      if (charStatus[i] === 'correct') correctCount++;
      else incorrectCount++;
    }

    // Net WPM calculation with strict penalty mode impact
    let netWpmVal = (correctCount / 5) / elapsedMinutes;
    if (isStrictMode && backspacePenalties > 0) {
      // Backspace penalty deducts 0.5 WPM equivalent per backspace penalty
      netWpmVal -= (backspacePenalties * 0.4);
    }
    const netWpm = Math.max(0, Math.round(netWpmVal));

    // Error rate
    const errorRate = totalCharsTyped > 0 ? ((totalErrors / totalCharsTyped) * 100) : 0;
    const consistency = calculateConsistency();

    statRawWpm.textContent = rawWpm;
    statNetWpm.textContent = netWpm;
    statErrorRate.textContent = `${errorRate.toFixed(1)}%`;
    statConsistency.textContent = `${consistency}%`;

    // Take WPM snapshot every 1.5 seconds for consistency metric
    const elapsedSeconds = (now - startTime) / 1000;
    if (elapsedSeconds - lastSnapshotTime >= 1.5) {
      const intervalChars = totalCharsTyped - lastSnapshotChars;
      const intervalMinutes = (elapsedSeconds - lastSnapshotTime) / 60;
      const instantWpm = Math.round((intervalChars / 5) / intervalMinutes);
      wpmSnapshots.push(instantWpm);
      lastSnapshotTime = elapsedSeconds;
      lastSnapshotChars = totalCharsTyped;
    }
  }

  function startTestIfNeeded() {
    if (isStarted || isFinished) return;
    isStarted = true;
    startTime = performance.now();
    lastSnapshotTime = 0;
    lastSnapshotChars = 0;

    initAudio();

    timerInterval = setInterval(() => {
      const elapsedSeconds = (performance.now() - startTime) / 1000;
      totalTimeElapsed = elapsedSeconds;

      if (targetDuration === 'passage') {
        statTime.textContent = `${Math.floor(elapsedSeconds)}s`;
      } else {
        const remaining = Math.max(0, Math.ceil(targetDuration - elapsedSeconds));
        secondsRemaining = remaining;
        statTime.textContent = remaining;

        if (remaining <= 0) {
          finishTest();
          return;
        }
      }

      computeLiveStats();
    }, 250);
  }

  function finishTest() {
    if (isFinished) return;
    isFinished = true;
    clearInterval(timerInterval);
    timerInterval = null;

    const totalSeconds = (performance.now() - startTime) / 1000;
    const totalMinutes = Math.max(0.05, totalSeconds / 60);

    let correctCount = 0;
    let incorrectCount = 0;
    for (let i = 0; i < currentIndex; i++) {
      if (charStatus[i] === 'correct') correctCount++;
      else incorrectCount++;
    }

    const rawWpm = Math.max(0, Math.round((totalCharsTyped / 5) / totalMinutes));
    let netWpmVal = (correctCount / 5) / totalMinutes;
    if (isStrictMode && backspacePenalties > 0) {
      netWpmVal -= (backspacePenalties * 0.4);
    }
    const netWpm = Math.max(0, Math.round(netWpmVal));

    const accuracy = totalCharsTyped > 0 ? Math.max(0, ((totalCharsTyped - totalErrors) / totalCharsTyped) * 100) : 100;
    const errorRate = totalCharsTyped > 0 ? ((totalErrors / totalCharsTyped) * 100) : 0;
    const consistency = calculateConsistency();

    // Determine percentile tier
    let assignedTier = PERCENTILE_TIERS[PERCENTILE_TIERS.length - 1];
    for (const t of PERCENTILE_TIERS) {
      if (netWpm >= t.minWpm && accuracy >= t.minAcc) {
        assignedTier = t;
        break;
      }
    }

    // Populate Scorecard
    modalRankBadge.className = `att-rank-badge ${assignedTier.badgeClass}`;
    modalRankBadge.textContent = assignedTier.tier;

    modalNetWpm.textContent = netWpm;
    modalRawWpm.textContent = rawWpm;
    modalAccuracy.textContent = `${accuracy.toFixed(1)}%`;
    modalErrorRate.textContent = `${errorRate.toFixed(1)}%`;
    modalConsistency.textContent = `${consistency}%`;
    modalPenalties.textContent = backspacePenalties;

    const modeLabels = {
      tech: "Technical Vocabulary",
      punct: "Advanced Punctuation",
      caps: "Capitalization Stress Test"
    };
    modalModeLabel.textContent = `${modeLabels[currentMode]} ${isStrictMode ? '(Strict Penalty Mode)' : '(Standard Mode)'}`;
    modalCharsBreakdown.textContent = `${correctCount} correct / ${totalErrors} errors / ${totalCharsTyped} total`;
    modalTimeTaken.textContent = `${totalSeconds.toFixed(1)}s`;
    modalPercentileText.textContent = assignedTier.desc;

    scorecardModal.classList.add('show');
  }

  function handleKeyInput(e) {
    if (isFinished) return;

    // Ignore modifier keys alone
    if (['Shift', 'Control', 'Alt', 'Meta', 'CapsLock', 'Tab'].includes(e.key)) {
      return;
    }

    // Restart shortcut
    if (e.key === 'Escape') {
      e.preventDefault();
      resetTest();
      return;
    }

    startTestIfNeeded();

    if (e.key === 'Backspace') {
      e.preventDefault();
      if (currentIndex > 0) {
        if (isStrictMode) {
          backspacePenalties++;
          totalErrors++;
          playClickSound(true);
        }
        currentIndex--;
        charStatus[currentIndex] = 'pending';
        updateCharVisuals();
        computeLiveStats();
      }
      return;
    }

    if (e.key.length === 1) {
      e.preventDefault();
      if (currentIndex >= currentText.length) {
        finishTest();
        return;
      }

      const expectedChar = currentText[currentIndex];
      const typedChar = e.key;
      totalCharsTyped++;

      if (typedChar === expectedChar) {
        charStatus[currentIndex] = 'correct';
        playClickSound(false);
      } else {
        charStatus[currentIndex] = 'incorrect';
        totalErrors++;
        playClickSound(true);
      }

      currentIndex++;
      updateCharVisuals();
      computeLiveStats();

      // Check if finished passage
      if (currentIndex >= currentText.length) {
        finishTest();
      }
    }
  }

  // Event Listeners for Focus & Input
  displayPanel.addEventListener('click', () => {
    hiddenInput.focus();
    displayPanel.classList.add('focused');
    focusHint.style.display = 'none';
    initAudio();
  });

  hiddenInput.addEventListener('focus', () => {
    displayPanel.classList.add('focused');
    focusHint.style.display = 'none';
  });

  hiddenInput.addEventListener('blur', () => {
    if (!isStarted || isFinished) {
      displayPanel.classList.remove('focused');
      focusHint.style.display = 'flex';
    }
  });

  window.addEventListener('keydown', (e) => {
    // If modal is open, let Escape close modal
    if (scorecardModal.classList.contains('show')) {
      if (e.key === 'Escape') {
        scorecardModal.classList.remove('show');
      }
      return;
    }

    // Auto-focus input on typing
    if (document.activeElement !== hiddenInput && e.key.length === 1 && !e.ctrlKey && !e.metaKey && !e.altKey) {
      hiddenInput.focus();
      displayPanel.classList.add('focused');
      focusHint.style.display = 'none';
    }
  });

  hiddenInput.addEventListener('keydown', handleKeyInput);

  // Restart Button
  btnRestart.addEventListener('click', resetTest);
  modalBtnRetry.addEventListener('click', () => {
    scorecardModal.classList.remove('show');
    resetTest();
    setTimeout(() => {
      hiddenInput.focus();
      displayPanel.classList.add('focused');
      focusHint.style.display = 'none';
    }, 150);
  });

  // Mode Selection
  modeButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      modeButtons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentMode = btn.dataset.mode;
      modeDesc.innerHTML = MODE_DESCRIPTIONS[currentMode];
      resetTest();
    });
  });

  // Duration Selection
  durationButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      durationButtons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const val = btn.dataset.duration;
      targetDuration = val === 'passage' ? 'passage' : parseInt(val, 10);
      resetTest();
    });
  });

  // Strict Mode Toggle
  strictToggle.addEventListener('change', () => {
    isStrictMode = strictToggle.checked;
    resetTest();
  });

  // Sound Toggle
  soundToggle.addEventListener('click', () => {
    isSoundEnabled = !isSoundEnabled;
    soundIcon.textContent = isSoundEnabled ? '🔊 Sound' : '🔇 Muted';
    initAudio();
  });

  // Copy Scorecard feature
  modalBtnCopy.addEventListener('click', async () => {
    const netWpm = modalNetWpm.textContent;
    const rawWpm = modalRawWpm.textContent;
    const acc = modalAccuracy.textContent;
    const errRate = modalErrorRate.textContent;
    const consistency = modalConsistency.textContent;
    const rank = modalRankBadge.textContent.trim();
    const mode = modalModeLabel.textContent;

    const scorecardText = `═══════════════════════════════════════════
🏆 ADVANCED TYPING TEST BENCHMARK
Rank: ${rank}
Net Speed: ${netWpm} WPM | Raw: ${rawWpm} WPM
Accuracy: ${acc} | Error Rate: ${errRate}
Consistency: ${consistency} | Penalties: ${modalPenalties.textContent}
Mode: ${mode}
Tested at ALL IN ONE: https://sami12901.github.io/ALL-IN-ONE-v1/tools/advanced-typing-test/
═══════════════════════════════════════════`;

    try {
      await navigator.clipboard.writeText(scorecardText);
      const originalText = modalBtnCopy.textContent;
      modalBtnCopy.textContent = '✅ Copied!';
      setTimeout(() => {
        modalBtnCopy.textContent = originalText;
      }, 2000);
    } catch (_) {
      alert('Copied to clipboard:\n\n' + scorecardText);
    }
  });

  // Close modal when clicking on backdrop outside card
  scorecardModal.addEventListener('click', (e) => {
    if (e.target === scorecardModal) {
      scorecardModal.classList.remove('show');
    }
  });

  // Initial setup
  resetTest();
});