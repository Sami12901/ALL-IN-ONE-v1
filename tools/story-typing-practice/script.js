// Story Typing Practice - Classic Literature Drills & Stamina Analysis

const STORIES = {
  alice: {
    title: "Alice's Adventures in Wonderland",
    author: "Lewis Carroll",
    chapters: [
      {
        id: "rabbit-hole",
        title: "Chapter 1: Down the Rabbit-Hole",
        text: "Alice was beginning to get very tired of sitting by her sister on the bank, and of having nothing to do: once or twice she had peeped into the book her sister was reading, but it had no pictures or conversations in it, 'and what is the use of a book,' thought Alice 'without pictures or conversations?' So she was considering in her own mind (as well as she could, for the hot day made her feel very sleepy and stupid), whether the pleasure of making a daisy-chain would be worth the trouble of getting up and picking the daisies, when suddenly a White Rabbit with pink eyes ran close by her."
      },
      {
        id: "pool-tears",
        title: "Chapter 2: The Pool of Tears",
        text: "'Curiouser and curiouser!' cried Alice (she was so much surprised, that for the moment she quite forgot how to speak good English); 'now I'm opening out like the largest telescope that ever was! Good-bye, feet!' (for when she looked down at her feet, they seemed to be almost out of sight, they were getting so far off). 'Oh, my poor little feet, I wonder who will put on your shoes and stockings for you now, dears? I'm sure I shan't be able! I shall be a great deal too far off to trouble myself about you: you must manage the best way you can.'"
      },
      {
        id: "tea-party",
        title: "Chapter 7: A Mad Tea-Party",
        text: "There was a table set out under a tree in front of the house, and the March Hare and the Hatter were having tea at it: a Dormouse was sitting between them, fast asleep, and the other two were using it as a cushion, resting their elbows on it, and talking over its head. 'Very uncomfortable for the Dormouse,' thought Alice; 'only, as it's asleep, I suppose it doesn't mind.' The table was a large one, but the three were all crowded together at one corner of it: 'No room! No room!' they cried out when they saw Alice coming."
      }
    ]
  },
  holmes: {
    title: "The Adventures of Sherlock Holmes",
    author: "Arthur Conan Doyle",
    chapters: [
      {
        id: "bohemia",
        title: "A Scandal in Bohemia",
        text: "To Sherlock Holmes she is always the woman. I have seldom heard him mention her under any other name. In his eyes she eclipses and predominates the whole of her sex. It was not that he felt any emotion akin to love for Irene Adler. All emotions, and that one particularly, were abhorrent to his cold, precise but admirably balanced mind. He was, I take it, the most perfect reasoning and observing machine that the world has seen, but as a lover he would have placed himself in a false position."
      },
      {
        id: "red-headed",
        title: "The Red-Headed League",
        text: "I had called upon my friend, Mr. Sherlock Holmes, one day in the autumn of last year and found him in deep conversation with a very stout, florid-faced, elderly gentleman with fiery red hair. With an apology for my intrusion, I was about to withdraw when Holmes pulled me abruptly into the room and closed the door behind me. 'You could not have come at a better time, my dear Watson,' he said cordially. 'I was afraid that you were engaged.' 'So I am. Very much so.' 'Then I can wait in the next room.' 'Not at all. This gentleman, Mr. Wilson, has been my partner and helper in many of my most grotesque cases.'"
      },
      {
        id: "final-problem",
        title: "The Final Problem",
        text: "It is with a heavy heart that I take up my pen to write these the last words in which I shall ever record the singular gifts by which my friend Mr. Sherlock Holmes was distinguished. In an incoherent and, as I deeply feel, an entirely inadequate fashion, I have endeavored to give some account of my strange experiences in his company from the chance which first brought us together in the period of the 'Study in Scarlet,' up to the time of his interference in the matter of the Naval Treaty."
      }
    ]
  },
  frankenstein: {
    title: "Frankenstein",
    author: "Mary Shelley",
    chapters: [
      {
        id: "arctic-letters",
        title: "Letter 1: Arctic Voyage",
        text: "You will rejoice to hear that no disaster has accompanied the commencement of an enterprise which you have regarded with such evil forebodings. I arrived here yesterday, and my first task is to assure my dear sister of my welfare and increasing confidence in the success of my undertaking. I am already far north of London, and as I walk through the streets of Petersburgh, I feel a cold northern breeze play upon my cheeks, which braces my nerves and fills me with delight."
      },
      {
        id: "creation-spark",
        title: "Chapter 4: The Spark of Life",
        text: "It was on a dreary night of November that I beheld the accomplishment of my toils. With an anxiety that almost amounted to agony, I collected the instruments of life around me, that I might infuse a spark of being into the lifeless thing that lay at my feet. It was already one in the morning; the rain pattered dismally against the panes, and my candle was nearly burnt out, when, by the glimmer of the half-extinguished light, I saw the dull yellow eye of the creature open; it breathed hard, and a convulsive motion agitated its limbs."
      },
      {
        id: "creatures-plea",
        title: "Chapter 10: The Creature's Lament",
        text: "'I expected this reception,' said the daemon. 'All men hate the wretched; how, then, must I be hated, who am miserable beyond all living things! Yet you, my creator, detest and spurn me, thy creature, to whom thou art bound by ties only dissoluble by the annihilation of one of us. You purpose to kill me. How dare you sport thus with life? Do your duty towards me, and I will do mine towards you and the rest of mankind.'"
      }
    ]
  },
  timemachine: {
    title: "The Time Machine",
    author: "H.G. Wells",
    chapters: [
      {
        id: "fourth-dimension",
        title: "Chapter 1: The Fourth Dimension",
        text: "The Time Traveller (for so it will be convenient to speak of him) was expounding a recondite matter to us. His grey eyes shone and twinkled, and his usually pale face was flushed and animated. The fire burnt brightly, and the soft radiance of the incandescent lights in the lilies of silver caught the bubbles that flashed and passed in our glasses. Our chairs, being his patents, embraced and caressed us rather than submitted to be sat upon; and there was that luxurious after-dinner atmosphere when thought runs gracefully free of the trammels of precision."
      },
      {
        id: "year-802701",
        title: "Chapter 3: The Golden Age of 802,701",
        text: "In another moment I was in a storm of hailing stone and tumbling through the air. The rebound knocked me off the saddle. For a moment I seemed to be in a blinding foam of mud and water, and then I found myself sitting on soft grass in an open space under a heavy grey sky. I looked up at the colossal figure, thirty or forty feet high, carved in white marble: the statue of a winged sphinx. The sun had broken through the cloud-wrack, and the golden evening light illuminated a valley clothed in strange and lovely flowers."
      },
      {
        id: "underworld",
        title: "Chapter 5: The Underworld Morlocks",
        text: "I felt a gentle touch on my hand. I started, looking round, and saw a strange white, ape-like creature blinking into the light. It was small, with large grayish-red eyes and flaxen hair on its head and down its back. As it met my gaze, it ran with its head down, swiftly crossing the sunlit space into the shadow of a pillared porch. I followed it immediately, but it had vanished down a deep circular well in the masonry floor, from which came a steady, rhythmic thudding like the beating of a subterranean engine."
      }
    ]
  }
};

document.addEventListener('DOMContentLoaded', () => {
  // DOM Elements
  const storySelect = document.getElementById('story-select');
  const chapterSelect = document.getElementById('chapter-select');
  const btnImmersion = document.getElementById('btn-immersion');
  const btnFontToggle = document.getElementById('btn-font-toggle');
  const fontToggleLabel = document.getElementById('font-toggle-label');
  const soundToggle = document.getElementById('sound-toggle');
  const soundIcon = document.getElementById('sound-icon');

  const statWpm = document.getElementById('stat-wpm');
  const statAccuracy = document.getElementById('stat-accuracy');
  const statWordsCount = document.getElementById('stat-words-count');
  const statStamina = document.getElementById('stat-stamina');
  const statElapsed = document.getElementById('stat-elapsed');
  const progressBar = document.getElementById('progress-bar');

  const badgeStaminaRating = document.getElementById('badge-stamina-rating');
  const staminaDetail = document.getElementById('stamina-detail');
  const btnRestart = document.getElementById('btn-restart');

  const displayPanel = document.getElementById('display-panel');
  const textDisplay = document.getElementById('text-display');
  const hiddenInput = document.getElementById('hidden-input');
  const focusHint = document.getElementById('focus-hint');

  // Modal Elements
  const completionModal = document.getElementById('completion-modal');
  const modalChapterTitle = document.getElementById('modal-chapter-title');
  const modalWpm = document.getElementById('modal-wpm');
  const modalAccuracy = document.getElementById('modal-accuracy');
  const modalStamina = document.getElementById('modal-stamina');
  const modalStaminaProfile = document.getElementById('modal-stamina-profile');
  const modalWordCount = document.getElementById('modal-word-count');
  const modalTimeTaken = document.getElementById('modal-time-taken');
  const modalBtnRetry = document.getElementById('modal-btn-retry');
  const modalBtnNext = document.getElementById('modal-btn-next');

  // State
  let currentStoryKey = localStorage.getItem('stp_story') || 'alice';
  let currentChapterIndex = parseInt(localStorage.getItem('stp_chapter') || '0', 10);
  let isFontSerif = true;
  let isImmersionMode = false;
  let isSoundEnabled = true;

  let currentText = '';
  let wordsArray = [];
  let totalWords = 0;
  let currentIndex = 0;
  let charStatus = [];
  let charSpans = [];

  let isStarted = false;
  let isFinished = false;
  let startTime = null;
  let timerInterval = null;

  let totalCharsTyped = 0;
  let totalErrors = 0;

  // Stamina Tracking:
  // We record timestamp and typed character count every 4 seconds
  let staminaSamples = [];
  let initialPaceWpm = 0;
  let currentPaceWpm = 0;

  // Web Audio Context
  let audioCtx = null;

  function initAudio() {
    if (!audioCtx) {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      if (AudioContextClass) {
        audioCtx = new AudioContextClass();
      }
    }
  }

  function playKeySound(isError = false) {
    if (!isSoundEnabled) return;
    try {
      initAudio();
      if (!audioCtx) return;
      if (audioCtx.state === 'suspended') audioCtx.resume();

      const now = audioCtx.currentTime;
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();

      if (isError) {
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(150, now);
        osc.frequency.exponentialRampToValueAtTime(75, now + 0.08);
        gain.gain.setValueAtTime(0.2, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.start(now);
        osc.stop(now + 0.08);
      } else {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(480 + Math.random() * 40, now);
        osc.frequency.exponentialRampToValueAtTime(160, now + 0.04);
        gain.gain.setValueAtTime(0.1, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.start(now);
        osc.stop(now + 0.04);
      }
    } catch (_) {}
  }

  function populateChapterDropdown() {
    const story = STORIES[currentStoryKey] || STORIES.alice;
    chapterSelect.innerHTML = '';
    story.chapters.forEach((chap, idx) => {
      const opt = document.createElement('option');
      opt.value = idx;
      opt.textContent = chap.title;
      chapterSelect.appendChild(opt);
    });

    if (currentChapterIndex >= story.chapters.length) {
      currentChapterIndex = 0;
    }
    chapterSelect.value = currentChapterIndex;
  }

  function loadActiveChapter() {
    clearInterval(timerInterval);
    timerInterval = null;

    isStarted = false;
    isFinished = false;
    startTime = null;
    currentIndex = 0;
    totalCharsTyped = 0;
    totalErrors = 0;
    staminaSamples = [];
    initialPaceWpm = 0;
    currentPaceWpm = 0;

    const story = STORIES[currentStoryKey] || STORIES.alice;
    const chapter = story.chapters[currentChapterIndex] || story.chapters[0];
    currentText = chapter.text;

    wordsArray = currentText.trim().split(/\s+/);
    totalWords = wordsArray.length;

    charStatus = new Array(currentText.length).fill('pending');

    renderText();

    statWpm.textContent = '0';
    statAccuracy.textContent = '100%';
    statWordsCount.textContent = `0 / ${totalWords}`;
    statStamina.textContent = '100%';
    statElapsed.textContent = '0:00';
    progressBar.style.width = '0%';

    badgeStaminaRating.className = 'stp-stamina-badge';
    badgeStaminaRating.textContent = '⚡ High Stamina (100%)';
    staminaDetail.textContent = 'Begin typing to initiate narrative stamina tracking.';

    hiddenInput.value = '';
    focusHint.style.display = 'flex';
    displayPanel.classList.remove('focused');
    completionModal.classList.remove('show');

    // Save preference
    localStorage.setItem('stp_story', currentStoryKey);
    localStorage.setItem('stp_chapter', currentChapterIndex.toString());
  }

  function renderText() {
    textDisplay.innerHTML = '';
    charSpans = [];

    const fragment = document.createDocumentFragment();
    for (let i = 0; i < currentText.length; i++) {
      const span = document.createElement('span');
      span.className = 'stp-char';
      span.textContent = currentText[i];
      if (i === 0) span.classList.add('stp-char-current');
      charSpans.push(span);
      fragment.appendChild(span);
    }
    textDisplay.appendChild(fragment);
  }

  function updateCharVisuals() {
    for (let i = 0; i < currentText.length; i++) {
      const span = charSpans[i];
      if (!span) continue;

      span.className = 'stp-char';
      if (i < currentIndex) {
        if (charStatus[i] === 'correct') {
          span.classList.add('stp-char-correct');
        } else if (charStatus[i] === 'incorrect') {
          span.classList.add('stp-char-incorrect');
        }
      } else if (i === currentIndex) {
        span.classList.add('stp-char-current');
      }
    }

    // Auto-scroll
    if (charSpans[currentIndex]) {
      const currentSpan = charSpans[currentIndex];
      const panelTop = textDisplay.scrollTop;
      const panelHeight = textDisplay.clientHeight;
      const spanTop = currentSpan.offsetTop;

      if (spanTop > panelTop + panelHeight - 90) {
        textDisplay.scrollTop = spanTop - 60;
      } else if (spanTop < panelTop) {
        textDisplay.scrollTop = spanTop - 40;
      }
    }

    const progress = Math.min(100, Math.round((currentIndex / currentText.length) * 100));
    progressBar.style.width = `${progress}%`;

    // Calculate completed words
    const typedTextSub = currentText.slice(0, currentIndex);
    const completedWords = typedTextSub.trim().length === 0 ? 0 : typedTextSub.trim().split(/\s+/).length;
    statWordsCount.textContent = `${completedWords} / ${totalWords}`;
  }

  function computeLiveStats() {
    if (!startTime) return;
    const now = performance.now();
    const elapsedSeconds = (now - startTime) / 1000;
    const elapsedMinutes = elapsedSeconds / 60;

    const mins = Math.floor(elapsedSeconds / 60);
    const secs = Math.floor(elapsedSeconds % 60);
    statElapsed.textContent = `${mins}:${secs.toString().padStart(2, '0')}`;

    if (elapsedMinutes <= 0.01) return;

    // Overall WPM
    let correctCount = 0;
    for (let i = 0; i < currentIndex; i++) {
      if (charStatus[i] === 'correct') correctCount++;
    }

    const overallWpm = Math.max(0, Math.round((correctCount / 5) / elapsedMinutes));
    const accuracy = totalCharsTyped > 0 
      ? Math.max(0, ((totalCharsTyped - totalErrors) / totalCharsTyped) * 100) 
      : 100;

    statWpm.textContent = overallWpm;
    statAccuracy.textContent = `${accuracy.toFixed(1)}%`;

    // Stamina calculation
    // Record sample every 4 seconds
    const lastSample = staminaSamples[staminaSamples.length - 1];
    if (!lastSample || (elapsedSeconds - lastSample.time >= 4)) {
      staminaSamples.push({
        time: elapsedSeconds,
        chars: correctCount
      });
    }

    if (staminaSamples.length >= 3) {
      // First 25% of elapsed time pace vs latest pace
      const firstSample = staminaSamples[Math.min(2, staminaSamples.length - 1)];
      initialPaceWpm = Math.max(10, Math.round((firstSample.chars / 5) / (firstSample.time / 60)));

      const recentSample = staminaSamples[staminaSamples.length - 1];
      const prevSample = staminaSamples[Math.max(0, staminaSamples.length - 3)];
      const recentMins = (recentSample.time - prevSample.time) / 60;
      const recentChars = recentSample.chars - prevSample.chars;
      currentPaceWpm = recentMins > 0 ? Math.round((recentChars / 5) / recentMins) : overallWpm;

      // Ratio
      const staminaRatio = initialPaceWpm > 0 ? (currentPaceWpm / initialPaceWpm) : 1;
      const staminaScore = Math.max(25, Math.min(100, Math.round(staminaRatio * 100)));

      statStamina.textContent = `${staminaScore}%`;

      if (staminaScore >= 90) {
        badgeStaminaRating.textContent = `⚡ High Stamina (${staminaScore}%)`;
        badgeStaminaRating.style.color = '#10b981';
        badgeStaminaRating.style.borderColor = 'rgba(16, 185, 129, 0.3)';
        staminaDetail.textContent = `Endurance holding steady. Initial: ${initialPaceWpm} WPM vs Current: ${currentPaceWpm} WPM.`;
      } else if (staminaScore >= 75) {
        badgeStaminaRating.textContent = `⏳ Moderate Fatigue (${staminaScore}%)`;
        badgeStaminaRating.style.color = '#f59e0b';
        badgeStaminaRating.style.borderColor = 'rgba(245, 158, 11, 0.3)';
        staminaDetail.textContent = `Slight deceleration detected. Initial: ${initialPaceWpm} WPM vs Current: ${currentPaceWpm} WPM.`;
      } else {
        badgeStaminaRating.textContent = `⚠️ Heavy Fatigue (${staminaScore}%)`;
        badgeStaminaRating.style.color = '#ef4444';
        badgeStaminaRating.style.borderColor = 'rgba(239, 68, 68, 0.3)';
        staminaDetail.textContent = `Fatigue drop: ${100 - staminaScore}%. Relax fingers to maintain steady cadence.`;
      }
    }
  }

  function startIfNeeded() {
    if (isStarted || isFinished) return;
    isStarted = true;
    startTime = performance.now();
    initAudio();

    timerInterval = setInterval(() => {
      computeLiveStats();
    }, 250);
  }

  function finishChapter() {
    if (isFinished) return;
    isFinished = true;
    clearInterval(timerInterval);
    timerInterval = null;

    const totalSeconds = (performance.now() - startTime) / 1000;
    const totalMinutes = Math.max(0.04, totalSeconds / 60);

    let correctCount = 0;
    for (let i = 0; i < currentIndex; i++) {
      if (charStatus[i] === 'correct') correctCount++;
    }

    const finalWpm = Math.max(0, Math.round((correctCount / 5) / totalMinutes));
    const accuracy = totalCharsTyped > 0 
      ? Math.max(0, ((totalCharsTyped - totalErrors) / totalCharsTyped) * 100) 
      : 100;

    const story = STORIES[currentStoryKey];
    const chapter = story.chapters[currentChapterIndex];

    modalChapterTitle.textContent = `${story.title}: ${chapter.title}`;
    modalWpm.textContent = finalWpm;
    modalAccuracy.textContent = `${accuracy.toFixed(1)}%`;

    const staminaScore = parseInt(statStamina.textContent, 10) || 95;
    modalStamina.textContent = `${staminaScore}%`;
    modalStaminaProfile.textContent = staminaScore >= 90 
      ? "Consistent Velocity (High Endurance)" 
      : `Pace drop: ${100 - staminaScore}% (Gradual fatigue)`;

    modalWordCount.textContent = `${totalWords} words (${currentText.length} characters)`;

    const mins = Math.floor(totalSeconds / 60);
    const secs = Math.floor(totalSeconds % 60);
    modalTimeTaken.textContent = `${mins}m ${secs}s`;

    completionModal.classList.add('show');
  }

  function handleKey(e) {
    if (isFinished) return;

    if (['Shift', 'Control', 'Alt', 'Meta', 'CapsLock', 'Tab'].includes(e.key)) {
      return;
    }

    if (e.key === 'Escape') {
      e.preventDefault();
      loadActiveChapter();
      return;
    }

    startIfNeeded();

    if (e.key === 'Backspace') {
      e.preventDefault();
      if (currentIndex > 0) {
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
        finishChapter();
        return;
      }

      const expected = currentText[currentIndex];
      const typed = e.key;
      totalCharsTyped++;

      if (typed === expected) {
        charStatus[currentIndex] = 'correct';
        playKeySound(false);
      } else {
        charStatus[currentIndex] = 'incorrect';
        totalErrors++;
        playKeySound(true);
      }

      currentIndex++;
      updateCharVisuals();
      computeLiveStats();

      if (currentIndex >= currentText.length) {
        finishChapter();
      }
    }
  }

  // Display Panel Focus
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
    if (completionModal.classList.contains('show')) {
      if (e.key === 'Escape') {
        completionModal.classList.remove('show');
      }
      return;
    }

    if (document.activeElement !== hiddenInput && e.key.length === 1 && !e.ctrlKey && !e.metaKey && !e.altKey) {
      hiddenInput.focus();
      displayPanel.classList.add('focused');
      focusHint.style.display = 'none';
    }
  });

  hiddenInput.addEventListener('keydown', handleKey);

  // Story selection
  storySelect.value = currentStoryKey;
  storySelect.addEventListener('change', () => {
    currentStoryKey = storySelect.value;
    currentChapterIndex = 0;
    populateChapterDropdown();
    loadActiveChapter();
  });

  // Chapter selection
  chapterSelect.addEventListener('change', () => {
    currentChapterIndex = parseInt(chapterSelect.value, 10);
    loadActiveChapter();
  });

  // Immersion Mode Toggle
  btnImmersion.addEventListener('click', () => {
    isImmersionMode = !isImmersionMode;
    document.body.classList.toggle('stp-immersion-active', isImmersionMode);
    btnImmersion.classList.toggle('active', isImmersionMode);
    document.getElementById('immersion-icon').textContent = isImmersionMode ? '🕯️ Exit Immersion' : '🕯️ Immersion';
  });

  // Font Toggle (Serif vs Mono)
  btnFontToggle.addEventListener('click', () => {
    isFontSerif = !isFontSerif;
    if (isFontSerif) {
      textDisplay.classList.remove('stp-font-mono');
      textDisplay.classList.add('stp-font-serif');
      fontToggleLabel.textContent = '📖 Serif';
    } else {
      textDisplay.classList.remove('stp-font-serif');
      textDisplay.classList.add('stp-font-mono');
      fontToggleLabel.textContent = '⌨️ Monospace';
    }
  });

  // Sound Toggle
  soundToggle.addEventListener('click', () => {
    isSoundEnabled = !isSoundEnabled;
    soundIcon.textContent = isSoundEnabled ? '🔊 Sound' : '🔇 Muted';
    initAudio();
  });

  // Restart Button
  btnRestart.addEventListener('click', loadActiveChapter);

  // Modal Actions
  modalBtnRetry.addEventListener('click', () => {
    completionModal.classList.remove('show');
    loadActiveChapter();
    setTimeout(() => hiddenInput.focus(), 100);
  });

  modalBtnNext.addEventListener('click', () => {
    completionModal.classList.remove('show');
    const story = STORIES[currentStoryKey];
    if (currentChapterIndex < story.chapters.length - 1) {
      currentChapterIndex++;
    } else {
      // Move to next story
      const storyKeys = Object.keys(STORIES);
      const nextStoryIdx = (storyKeys.indexOf(currentStoryKey) + 1) % storyKeys.length;
      currentStoryKey = storyKeys[nextStoryIdx];
      storySelect.value = currentStoryKey;
      currentChapterIndex = 0;
    }
    populateChapterDropdown();
    loadActiveChapter();
    setTimeout(() => hiddenInput.focus(), 100);
  });

  completionModal.addEventListener('click', (e) => {
    if (e.target === completionModal) {
      completionModal.classList.remove('show');
    }
  });

  // Init
  populateChapterDropdown();
  loadActiveChapter();
});