// Typing Practice - Client-side Logic

const TEXT_PASSAGES = {
  easy: [
    "The sun was bright and the sky was clear as the birds began to sing in the morning. A gentle breeze blew through the green trees by the quiet river. Children walked happily to the small park near their school to play games with their friends. Every day brings a new chance to learn something good and make people smile.",
    "Reading books is a wonderful way to travel to new places without ever leaving home. You can learn about wild animals, distant stars, and ancient castles simply by turning the pages. It is always fun to find a quiet corner with a warm drink and a story that takes your mind on a great adventure.",
    "A small dog ran across the garden chasing a yellow ball that bounced over the grass. His owner laughed and threw the ball again into the soft autumn leaves. The garden was full of colorful flowers and the air smelled fresh after a light rain. It was a peaceful afternoon for everyone outside.",
    "Learning to type fast takes practice and patience every single day. Keep your hands relaxed and place your fingers on the home row keys. Look straight at the screen instead of looking down at your fingers. Soon your speed and accuracy will grow naturally as you build muscle memory."
  ],
  medium: [
    "Throughout history, communication technology has steadily transformed how humans exchange knowledge. From the early printing press to high-speed fiber optic cables, each breakthrough reduced geographical barriers. Today, billions of people can instantly collaborate across oceans, sharing discoveries, art, and ideas with a single keystroke.",
    "The world's oceans cover more than seventy percent of our planet's surface, yet vast areas remain completely unexplored. Deep underwater trenches plunge miles beneath the waves, harboring strange organisms adapted to immense pressure and total darkness. Marine scientists discover new species every year around hydrothermal vents.",
    "Architecture reflects the culture, engineering prowess, and values of the era in which it was built. Ancient stone amphitheaters, towering Gothic cathedrals, and sleek modern glass skyscrapers all tell unique stories of human ingenuity. Designing structures that balance aesthetic beauty with environmental sustainability is the defining challenge of our century.",
    "Consistent daily habits often produce far more dramatic results than sudden bursts of intense effort. When you commit just twenty minutes each day to practicing a new skill—such as playing the piano, learning a foreign language, or touch typing—the compound benefits over several months will astonish you."
  ],
  hard: [
    "In 1969, the Apollo 11 lunar module 'Eagle' successfully touched down on the Moon's Mare Tranquillitatis at precisely 20:17:40 UTC. Astronaut Neil Armstrong famously proclaimed: 'That's one small step for [a] man, one giant leap for mankind.' The guidance computer operated with merely 2,048 words of RAM!",
    "Phenomenological inquiry requires one to 'bracket' (epoché) preconceived metaphysical assumptions; thus, consciousness is examined strictly as intentional experience. René Descartes famously posed the radical skepticism: 'Cogito, ergo sum' (I think, therefore I am)—a cornerstone of 17th-century rationalist epistemology.",
    "Quantum entanglement—famously dubbed 'spooky action at a distance' by Albert Einstein—exhibits non-local correlations that defy classical Newtonian mechanics. Bell's theorem mathematically demonstrated that no physical theory of local hidden variables can reproduce all of the statistical predictions of quantum mechanics.",
    "The international financial index recorded an aggregate fluctuation of +4.85% (closing at 34,921.60 pts); meanwhile, crude oil futures slid -2.3% ($78.40/barrel). Economists attribute this divergence to quantitative tightening, shifting bond yields (10-yr: 4.12%), and cross-border currency hedges."
  ],
  tech: [
    "async function fetchUserData(userId) {\n  try {\n    const response = await fetch(`/api/v1/users/${userId}`);\n    if (!response.ok) throw new Error(`HTTP error: ${response.status}`);\n    const data = await response.json();\n    return { success: true, payload: data };\n  } catch (err) {\n    console.error('Fetch failed:', err);\n    return { success: false, error: err.message };\n  }\n}",
    "const filterActiveUsers = (users, minScore = 75) => {\n  return users\n    .filter(u => u.isActive && u.score >= minScore)\n    .map(u => ({ id: u.id, name: u.name, rank: u.score > 90 ? 'A+' : 'B' }))\n    .sort((a, b) => b.score - a.score);\n};",
    "SELECT u.id, u.username, COUNT(o.id) AS total_orders, SUM(o.total_amount) AS revenue\nFROM users u\nLEFT JOIN orders o ON u.id = o.user_id\nWHERE o.created_at >= '2025-01-01' AND o.status = 'COMPLETED'\nGROUP BY u.id, u.username\nHAVING COUNT(o.id) > 5\nORDER BY revenue DESC\nLIMIT 20;",
    "const debounce = (callback, delay = 250) => {\n  let timeoutId;\n  return (...args) => {\n    clearTimeout(timeoutId);\n    timeoutId = setTimeout(() => callback(...args), delay);\n  };\n};"
  ]
};

const SKILL_TIERS = [
  { minWpm: 0, title: "Typing Novice", icon: "🌱" },
  { minWpm: 25, title: "Casual Typist", icon: "🥉" },
  { minWpm: 45, title: "Intermediate Typist", icon: "🥈" },
  { minWpm: 60, title: "Skilled Touch Typist", icon: "🥇" },
  { minWpm: 80, title: "Speed Typist", icon: "⚡" },
  { minWpm: 100, title: "Master Typist", icon: "🏆" },
  { minWpm: 120, title: "Legendary Typist", icon: "🚀" }
];

document.addEventListener('DOMContentLoaded', () => {
  // DOM Elements
  const difficultyButtons = document.querySelectorAll('#difficulty-group .tp-pill-btn');
  const durationButtons = document.querySelectorAll('#duration-group .tp-pill-btn');
  const displayPanel = document.getElementById('display-panel');
  const textDisplay = document.getElementById('text-display');
  const hiddenInput = document.getElementById('hidden-input');
  const focusOverlay = document.getElementById('focus-overlay');
  const btnRestart = document.getElementById('btn-restart');
  const soundBtn = document.getElementById('sound-btn');
  const soundIconOn = document.getElementById('sound-icon-on');
  const soundIconOff = document.getElementById('sound-icon-off');
  const soundLabel = document.getElementById('sound-label');

  // Live Stats Elements
  const statTime = document.getElementById('stat-time');
  const statWpm = document.getElementById('stat-wpm');
  const statNetWpm = document.getElementById('stat-net-wpm');
  const statAccuracy = document.getElementById('stat-accuracy');
  const statErrors = document.getElementById('stat-errors');
  const progressBar = document.getElementById('test-progress-bar');
  const charCounter = document.getElementById('char-counter');

  // Modal Elements
  const resultsModal = document.getElementById('results-modal');
  const modalNetWpm = document.getElementById('modal-net-wpm');
  const modalWpm = document.getElementById('modal-wpm');
  const modalAcc = document.getElementById('modal-acc');
  const modalChars = document.getElementById('modal-chars');
  const modalErrors = document.getElementById('modal-errors');
  const modalTime = document.getElementById('modal-time');
  const badgeTitle = document.getElementById('badge-title');
  const modalBadge = document.getElementById('modal-badge');
  const modalBtnRetry = document.getElementById('modal-btn-retry');
  const modalBtnCert = document.getElementById('modal-btn-cert');
  const modalBtnCopy = document.getElementById('modal-btn-copy');

  // State Variables
  let currentDifficulty = 'easy';
  let targetDuration = 30; // seconds or 'passage'
  let targetText = '';
  let currentIndex = 0;
  let charStatuses = []; // 'pending', 'correct', 'incorrect'
  let totalTyped = 0;
  let errorCount = 0;
  let startTime = null;
  let timerId = null;
  let isRunning = false;
  let isFinished = false;
  let soundEnabled = true;

  // Web Audio Context for typewriter click
  let audioCtx = null;

  function initAudio() {
    if (!audioCtx) {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      if (AudioContextClass) {
        audioCtx = new AudioContextClass();
      }
    }
    if (audioCtx && audioCtx.state === 'suspended') {
      audioCtx.resume();
    }
  }

  function playKeySound(isError = false) {
    if (!soundEnabled) return;
    try {
      initAudio();
      if (!audioCtx) return;
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.connect(gain);
      gain.connect(audioCtx.destination);

      const now = audioCtx.currentTime;
      if (isError) {
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(140, now);
        osc.frequency.exponentialRampToValueAtTime(70, now + 0.08);
        gain.gain.setValueAtTime(0.08, now);
        gain.gain.linearRampToValueAtTime(0.001, now + 0.08);
        osc.start(now);
        osc.stop(now + 0.08);
      } else {
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(500 + Math.random() * 150, now);
        gain.gain.setValueAtTime(0.04, now);
        gain.gain.linearRampToValueAtTime(0.001, now + 0.035);
        osc.start(now);
        osc.stop(now + 0.035);
      }
    } catch (_) {
      // Audio playback silently falls back
    }
  }

  function playFinishSound() {
    if (!soundEnabled) return;
    try {
      initAudio();
      if (!audioCtx) return;
      const now = audioCtx.currentTime;
      const notes = [440, 554.37, 659.25, 880];
      notes.forEach((freq, idx) => {
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        const startTime = now + idx * 0.09;
        osc.frequency.setValueAtTime(freq, startTime);
        gain.gain.setValueAtTime(0.08, startTime);
        gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.25);
        osc.start(startTime);
        osc.stop(startTime + 0.26);
      });
    } catch (_) {}
  }

  // Pick random passage
  function getRandomPassage(diff) {
    const list = TEXT_PASSAGES[diff] || TEXT_PASSAGES.easy;
    const idx = Math.floor(Math.random() * list.length);
    return list[idx];
  }

  // Render text characters
  function renderText() {
    textDisplay.innerHTML = '';
    const fragment = document.createDocumentFragment();

    for (let i = 0; i < targetText.length; i++) {
      const span = document.createElement('span');
      span.className = 'tp-char';
      span.id = `tp-char-${i}`;

      const char = targetText[i];
      if (char === '\n') {
        span.innerHTML = '&para;<br>';
      } else if (char === ' ') {
        span.textContent = ' ';
      } else {
        span.textContent = char;
      }

      fragment.appendChild(span);
    }

    textDisplay.appendChild(fragment);
    updateCharClasses();
  }

  function updateCharClasses() {
    for (let i = 0; i < targetText.length; i++) {
      const span = document.getElementById(`tp-char-${i}`);
      if (!span) continue;

      let cls = 'tp-char';
      if (i < currentIndex) {
        cls += charStatuses[i] === 'correct' ? ' tp-correct' : ' tp-incorrect';
      } else if (i === currentIndex) {
        cls += ' tp-current';
      }
      span.className = cls;
    }

    // Scroll active character into view smoothly
    const currentSpan = document.getElementById(`tp-char-${currentIndex}`);
    if (currentSpan) {
      const parentRect = textDisplay.getBoundingClientRect();
      const charRect = currentSpan.getBoundingClientRect();
      const offsetTop = charRect.top - parentRect.top;

      if (offsetTop < 20 || offsetTop > parentRect.height - 50) {
        currentSpan.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }

    charCounter.textContent = `${currentIndex} / ${targetText.length} characters`;
    const progress = targetText.length > 0 ? (currentIndex / targetText.length) * 100 : 0;
    progressBar.style.width = `${progress.toFixed(1)}%`;
  }

  // Calculate Real-Time Metrics
  function calculateMetrics() {
    let elapsed = 0;
    if (startTime) {
      elapsed = (Date.now() - startTime) / 1000;
    }
    const elapsedMinutes = Math.max(elapsed / 60, 0.008);

    let correctChars = 0;
    for (let i = 0; i < currentIndex; i++) {
      if (charStatuses[i] === 'correct') {
        correctChars++;
      }
    }

    // Gross WPM = (Total Typed Characters / 5) / TimeInMinutes
    const grossWpm = Math.round((totalTyped / 5) / elapsedMinutes);

    // Net WPM = (Correct Characters / 5) / TimeInMinutes
    const netWpm = Math.max(0, Math.round((correctChars / 5) / elapsedMinutes));

    // Accuracy %
    const accuracy = totalTyped > 0 ? Math.round((correctChars / totalTyped) * 100) : 100;

    return {
      elapsed,
      grossWpm,
      netWpm,
      accuracy,
      correctChars,
      totalTyped,
      errors: errorCount
    };
  }

  function updateStatsDisplay() {
    const metrics = calculateMetrics();

    statWpm.textContent = metrics.grossWpm;
    statNetWpm.textContent = metrics.netWpm;
    statAccuracy.textContent = `${metrics.accuracy}%`;
    statErrors.textContent = errorCount;

    if (targetDuration === 'passage') {
      statTime.textContent = `${Math.floor(metrics.elapsed)}s`;
    } else {
      const remaining = Math.max(0, Math.ceil(targetDuration - metrics.elapsed));
      statTime.textContent = `${remaining}s`;

      if (isRunning && remaining <= 0) {
        finishTest();
      }
    }
  }

  // Start the test
  function startTest() {
    if (isRunning) return;
    isRunning = true;
    startTime = Date.now();
    timerId = setInterval(updateStatsDisplay, 100);
  }

  // Finish test
  function finishTest() {
    if (isFinished) return;
    isFinished = true;
    isRunning = false;
    clearInterval(timerId);

    const metrics = calculateMetrics();
    playFinishSound();

    // Determine Skill Tier
    let matchedTier = SKILL_TIERS[0];
    for (let i = SKILL_TIERS.length - 1; i >= 0; i--) {
      if (metrics.netWpm >= SKILL_TIERS[i].minWpm) {
        matchedTier = SKILL_TIERS[i];
        break;
      }
    }

    badgeTitle.textContent = `${matchedTier.icon} ${matchedTier.title}`;
    modalNetWpm.textContent = metrics.netWpm;
    modalWpm.textContent = metrics.grossWpm;
    modalAcc.textContent = `${metrics.accuracy}%`;
    modalChars.textContent = metrics.totalTyped;
    modalErrors.textContent = metrics.errors;
    modalTime.textContent = `${Math.round(metrics.elapsed)}s`;

    // Construct Certificate URL with pre-filled parameters
    const today = new Date().toISOString().split('T')[0];
    const certUrl = `../typing-certificate-generator/?wpm=${metrics.netWpm}&acc=${metrics.accuracy}&date=${today}&title=${encodeURIComponent(matchedTier.title + ' Certification')}`;
    modalBtnCert.href = certUrl;

    resultsModal.classList.add('show');
  }

  // Reset / Initialize Test
  function resetTest() {
    clearInterval(timerId);
    isRunning = false;
    isFinished = false;
    startTime = null;
    currentIndex = 0;
    totalTyped = 0;
    errorCount = 0;

    targetText = getRandomPassage(currentDifficulty);
    charStatuses = new Array(targetText.length).fill('pending');

    renderText();

    statWpm.textContent = '0';
    statNetWpm.textContent = '0';
    statAccuracy.textContent = '100%';
    statErrors.textContent = '0';
    progressBar.style.width = '0%';
    statTime.textContent = targetDuration === 'passage' ? '0s' : `${targetDuration}s`;

    resultsModal.classList.remove('show');
    hiddenInput.value = '';
    focusInput();
  }

  function focusInput() {
    displayPanel.classList.remove('unfocused');
    displayPanel.classList.add('focused');
    hiddenInput.focus();
  }

  function unfocusInput() {
    displayPanel.classList.remove('focused');
    displayPanel.classList.add('unfocused');
  }

  // Key Event Handling
  function handleKeyPress(e) {
    if (isFinished) return;

    // Esc to restart
    if (e.key === 'Escape') {
      e.preventDefault();
      resetTest();
      return;
    }

    // Ignore modifier keys alone
    if (['Shift', 'Control', 'Alt', 'Meta', 'CapsLock', 'Tab'].includes(e.key)) {
      return;
    }

    // Handle Backspace
    if (e.key === 'Backspace') {
      e.preventDefault();
      if (currentIndex > 0) {
        currentIndex--;
        charStatuses[currentIndex] = 'pending';
        updateCharClasses();
        updateStatsDisplay();
      }
      return;
    }

    // Handle normal character input
    if (e.key.length === 1 || e.key === 'Enter') {
      const typedChar = e.key === 'Enter' ? '\n' : e.key;

      if (!isRunning) {
        startTest();
      }

      if (currentIndex < targetText.length) {
        const expectedChar = targetText[currentIndex];
        totalTyped++;

        if (typedChar === expectedChar) {
          charStatuses[currentIndex] = 'correct';
          playKeySound(false);
        } else {
          charStatuses[currentIndex] = 'incorrect';
          errorCount++;
          playKeySound(true);
        }

        currentIndex++;
        updateCharClasses();
        updateStatsDisplay();

        // Check if finished passage
        if (currentIndex >= targetText.length) {
          finishTest();
        }
      }
    }
  }

  // Event Listeners
  displayPanel.addEventListener('click', () => {
    initAudio();
    focusInput();
  });

  focusOverlay.addEventListener('click', () => {
    initAudio();
    focusInput();
  });

  window.addEventListener('keydown', (e) => {
    // If modal is open, Esc closes or retries
    if (resultsModal.classList.contains('show')) {
      if (e.key === 'Escape' || e.key === 'Enter') {
        resetTest();
      }
      return;
    }

    if (document.activeElement === hiddenInput || displayPanel.contains(document.activeElement)) {
      handleKeyPress(e);
    } else if (e.key.length === 1 && !e.ctrlKey && !e.metaKey && !e.altKey) {
      focusInput();
      handleKeyPress(e);
    }
  });

  hiddenInput.addEventListener('blur', () => {
    if (!resultsModal.classList.contains('show')) {
      unfocusInput();
    }
  });

  // Difficulty selection
  difficultyButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      difficultyButtons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentDifficulty = btn.dataset.difficulty;
      resetTest();
    });
  });

  // Duration selection
  durationButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      durationButtons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const val = btn.dataset.time;
      targetDuration = val === 'passage' ? 'passage' : parseInt(val, 10);
      resetTest();
    });
  });

  // Sound toggle
  soundBtn.addEventListener('click', () => {
    soundEnabled = !soundEnabled;
    if (soundEnabled) {
      soundIconOn.style.display = 'block';
      soundIconOff.style.display = 'none';
      soundLabel.textContent = 'Sound On';
      initAudio();
    } else {
      soundIconOn.style.display = 'none';
      soundIconOff.style.display = 'block';
      soundLabel.textContent = 'Sound Off';
    }
  });

  btnRestart.addEventListener('click', resetTest);
  modalBtnRetry.addEventListener('click', resetTest);

  // Copy score button
  modalBtnCopy.addEventListener('click', () => {
    const metrics = calculateMetrics();
    const copyText = `ALL IN ONE Typing Test: ${metrics.netWpm} Net WPM | ${metrics.grossWpm} Gross WPM | ${metrics.accuracy}% Accuracy | ${badgeTitle.textContent.trim()}`;
    navigator.clipboard.writeText(copyText).then(() => {
      const origText = modalBtnCopy.innerHTML;
      modalBtnCopy.innerHTML = '<span>&check; Copied!</span>';
      setTimeout(() => {
        modalBtnCopy.innerHTML = origText;
      }, 1800);
    });
  });

  // Initial setup
  resetTest();
});