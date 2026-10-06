// Random Paragraph Typing Test - Procedural Engine & Real-time Diagnostics

// Procedural Banks categorized by Topic and Difficulty
const PROCEDURAL_BANKS = {
  science: {
    easy: [
      ["The sun gives light to all green plants on Earth.", "Plants use sunlight to make food and clean air.", "Water moves in a cycle from rain to rivers and oceans.", "Every creature plays a part in keeping our planet alive."],
      ["Stars shine far away in the dark night sky.", "The moon orbits around the Earth once each month.", "Telescopes help us see craters and distant planets.", "Looking up at night reminds us how big space really is."],
      ["Magnets have two poles called north and south.", "Opposite poles attract each other with a strong pull.", "Many electric motors use magnets to spin and create power.", "Physics helps us understand how things work in daily life."],
      ["Cells are the tiny building blocks of all living things.", "A microscope reveals their shapes and active parts.", "Genes carry instructions that shape how living things grow.", "Biology is the study of how life thrives across the globe."]
    ],
    medium: [
      ["Deep-sea hydrothermal vents harbor unique ecosystems that flourish without any direct sunlight.", "Microorganisms utilize chemosynthesis around superheated mineral fissures, establishing an astonishing food web miles beneath the surface.", "Biologists examine these extreme environments to investigate how early life might have originated on primordial Earth.", "Similar geochemical conditions may exist within the subsurface oceans of icy moons such as Europa."],
      ["Photosynthesis converts radiant solar energy into chemical bonds through light-dependent reactions in chloroplasts.", "During the Calvin cycle, carbon dioxide molecules are fixed into energy-rich glucose compounds.", "This biochemical transformation sustains terrestrial food chains and maintains atmospheric oxygen equilibrium.", "Understanding these molecular pathways guides current efforts in synthetic biology and renewable biofuels."],
      ["Plate tectonics explains the dynamic movement of the Earth's lithosphere atop the semi-fluid asthenosphere.", "Subduction zones generate explosive volcanic arcs and deep oceanic trenches along convergent boundaries.", "Meanwhile, mid-ocean ridges continuously create new oceanic crust through seafloor spreading.", "These geological forces have rearranged continents and shaped planetary topography over hundreds of millions of years."]
    ],
    hard: [
      ["The relativistic Doppler effect dictates that electromagnetic radiation emitted by rapidly receding celestial bodies experiences an observable redshift; conversely, approaching trajectories manifest a perceptible blueshift.", "In non-Euclidean Riemannian manifolds, geodesic curves represent the quintessential mathematical generalization of straight trajectories across curved spacetime.", "Astrophysicists synthesize observational spectroscopy with general relativity to decipher gravitational lensing around supermassive black holes.", "These empirical observations systematically corroborate Einsteinian cosmological field equations against alternative quantum gravity hypotheses."],
      ["Epigenetic modifications—specifically DNA methylation and post-translational histone acetylation—dynamically regulate chromatin compaction without altering the primary nucleotide sequence.", "Transcriptional repressors recruit histone deacetylases to promoter regions, thereby precipitating localized heterochromatin formation and gene silencing.", "Recent investigations reveal that environmental exposures and cellular senescence can induce persistent alterations in epigenetic landscapes.", "Consequently, elucidating these molecular mechanisms yields profound therapeutic implications for oncological pharmacology and regenerative medicine."]
    ]
  },
  history: {
    easy: [
      ["Ancient people built tall stone pyramids in the desert.", "Workers moved heavy stone blocks along the Nile river.", "Kings and queens were buried in royal tombs with gold.", "Historians still study these monuments to learn about the past."],
      ["The Silk Road was an old trade route across Asia.", "Merchants traveled in caravans carrying silk, spices, and tea.", "Cities grew along the path where people shared new ideas.", "Trade helped distant cultures connect and learn from one another."],
      ["Castles were built with high stone walls and deep moats.", "Brave knights trained daily and protected the local lands.", "Farmers grew crops in nearby fields to feed the towns.", "Old books tell stories of honor and daily life in those times."],
      ["Ships sailed across wide seas to find new trade routes.", "Sailors used the stars and simple compasses to find their way.", "Maps grew more accurate as travelers explored distant shores.", "These long journeys changed world history forever."]
    ],
    medium: [
      ["The Renaissance sparked an extraordinary cultural and intellectual revival across Western Europe.", "Scholars rediscovered classical Greek and Roman texts, while artists pioneered linear perspective and anatomical realism.", "Florentine patronage fostered monumental achievements in painting, sculpture, architecture, and civic philosophy.", "This flourishing humanistic movement challenged medieval dogmas and laid the groundwork for modern scientific inquiry."],
      ["The Industrial Revolution fundamentally restructured human society, urban economics, and labor relations during the nineteenth century.", "Steam-powered mechanization replaced traditional agrarian craftsmanship with centralized factory production.", "Extensive railway networks rapidly connected interior manufacturing hubs directly to international seaports.", "While industrialization accelerated economic expansion, it provoked profound debates regarding working conditions and social welfare."],
      ["The construction of the Library of Alexandria reflected the Hellenistic ambition to collect all universal knowledge under one roof.", "Scholars, astronomers, and mathematicians traveled across the Mediterranean to translate philosophical manuscripts.", "Parchment scrolls preserved seminal treaties on geometry, cartography, and ancient medicine.", "Its eventual destruction remains a poignant symbol of irreplaceable cultural and intellectual loss."]
    ],
    hard: [
      ["The Peace of Westphalia in 1648 dismantled medieval feudal hierarchies, inaugurating the foundational doctrine of sovereign statehood and territorial integrity.", "Diplomatic protocols established that sovereign states possess exclusive jurisdiction over domestic matters, deliberately divorcing regional governance from ecclesiastical hegemony.", "Subsequent international treaties perpetuated this Westphalian paradigm, codifying multilateral diplomacy, balance of power stratagems, and formal embassy missions.", "Historians identify this institutional pivot as the bedrock of modern geopolitics and international jurisprudence."],
      ["The Enlightenment philosopher Jean-Jacques Rousseau posited in 'The Social Contract' that legitimate political authority arises solely from the general will of the citizenry.", "Juxtaposing individual natural liberty with collective civil order, eighteenth-century political treatises challenged the divine right of kings.", "These radical egalitarian concepts inspired constitutional conventions across revolutionary republics, fostering democratic deliberations on citizenship, jurisprudence, and inalienable human rights."]
    ]
  },
  art: {
    easy: [
      ["Artists mix bright colors of paint on a wooden palette.", "A soft brush glides smoothly over the clean white canvas.", "Shapes and shadows bring simple drawings to life with depth.", "Painting allows people to show feelings without using words."],
      ["Music fills the room with warm notes and steady rhythm.", "A guitar has six strings that make sweet sounds when plucked.", "Musicians practice every day to play beautiful songs.", "Listening to harmony can lift your mood and spark joy."],
      ["Sculptors carve statues out of hard marble and soft clay.", "Careful hands shape stone into lifelike figures and animals.", "Museums display these fine works for visitors to enjoy.", "Good art can inspire creative ideas for generations."],
      ["A camera captures special moments in a single split second.", "Photographers watch how sunlight falls on quiet streets.", "Black and white photos show strong contrast and emotion.", "Pictures help us keep memories alive for years to come."]
    ],
    medium: [
      ["Impressionist painters revolutionized art by moving their easels outdoors to capture the fleeting effects of natural light.", "Rather than blending pigments smoothly, artists applied rapid, visible brushstrokes of pure color onto canvas.", "Scenes of bustling Parisian boulevards, quiet lily ponds, and rustic landscapes conveyed spontaneous immediacy.", "Critics initially rejected the unconventional technique, yet Impressionism profoundly influenced modern aesthetics."],
      ["Traditional ceramics combines ancient craftsmanship with delicate elemental chemistry involving earth, water, and fire.", "Potters center raw stoneware on spinning wheels, shaping symmetrical bowls, vases, and ornate vessels.", "Mineral glazes undergo dramatic molecular transformations within high-temperature kilns, yielding rich chromatic textures.", "Each handcrafted piece balances utilitarian purpose with timeless tactile beauty."],
      ["Baroque architecture employed dramatic light, dynamic curvature, and trompe l'oeil illusion to evoke emotional awe.", "Grand cathedrals integrated ornate gilded stuccowork with soaring frescoes depicting celestial heavens.", "Architects like Bernini orchestrated spatial continuity between sculpture, ambient lighting, and theatrical urban plazas.", "This dramatic aesthetic celebrated sensorial grandeur during the seventeenth century."]
    ],
    hard: [
      ["Chiaroscuro—the dramatic juxtaposition of luminous highlights and impenetrable shadows—attained its quintessential expression in the monumental canvases of Caravaggio.", "By eschewing idealized classicism in favor of unvarnished verisimilitude, Baroque painters illuminated visceral human emotions with theatrical tenebrism.", "The calculated illumination of focal subjects creates intense spatial depth, arresting the observer's gaze within a psychological tableau.", "This revolutionary optical technique reverberated across centuries, fundamentally redefining European figurative composition."],
      ["The Bauhaus modernist manifesto championed an uncompromising synthesis of fine art, craft, and industrial functionalism.", "Rejecting superfluous historical ornamentation, Walter Gropius and his contemporaries formulated the enduring maxim that 'form follows function.'", "Tubular steel furnishings, cantilevered architectural volumes, and minimalist typography embodied this utopian aesthetic ethos.", "Despite severe sociopolitical suppression, the Bauhaus legacy perpetually informs modern industrial design and urban architecture."]
    ]
  },
  tech: {
    easy: [
      ["Computers run code to solve hard math problems quickly.", "Software helps us write words, draw art, and play games.", "Data travels across the internet through fast glass cables.", "Learning to write code is a fun way to build new tools."],
      ["Smartphones let us talk to friends anywhere in the world.", "Clean screens show maps, photos, and messages in seconds.", "Batteries store electric energy to power devices all day long.", "Technology changes fast and brings new ideas to our lives."],
      ["Robots can help humans do dangerous or heavy tasks.", "Sensors detect objects nearby so machines can move safely.", "Engineers design clever parts and write logic to guide them.", "Automation makes factories faster and safer for everyone."],
      ["Websites live on computers called servers in big data rooms.", "A browser reads web files and shows text, video, and links.", "Clicking a button sends a quick request across the web.", "The world is now connected like never before in history."]
    ],
    medium: [
      ["Cloud computing architectures enable scalable application deployment across geographically distributed data centers.", "Containerization frameworks isolate microservices, ensuring reproducible execution environments and rapid deployment cycles.", "Automated load balancers dynamically distribute user traffic to optimize server latency and prevent system outages.", "This modular infrastructure allows modern web applications to support millions of concurrent connections seamlessly."],
      ["Machine learning algorithms identify subtle statistical patterns within massive empirical datasets to generate predictive models.", "Deep neural networks utilize backpropagation and gradient descent to continuously optimize internal weight matrices.", "From natural language comprehension to autonomous navigation, these computational models execute increasingly sophisticated cognitive tasks.", "Engineers prioritize algorithmic transparency and data integrity to ensure fair, robust decisions."],
      ["Relational databases utilize structured query languages and ACID transactions to ensure robust data consistency.", "Indexed B-trees optimize disk storage reads, enabling sub-millisecond query execution across billions of table rows.", "Database administrators configure replication topologies and automated backups to guarantee fault tolerance against hardware failure.", "Structured persistence remains the core foundation of modern enterprise software."]
    ],
    hard: [
      ["Asynchronous non-blocking event loops multiplex hundreds of thousands of concurrent I/O sockets via operating system primitives like epoll and kqueue.", "By delegating expensive compute-intensive tasks to dedicated thread worker pools, the primary execution thread avoids latency-inducing bottlenecks.", "Zero-copy buffer allocation and memory-mapped files substantially reduce kernel-to-user-space context switching overhead.", "Such high-performance architectural paradigms undergird modern distributed message brokers and ultra-low-latency financial trading platforms."],
      ["Zero-trust architectural frameworks enforce continuous mutual cryptographic authentication across microsegmentation boundaries.", "Rather than trusting perimeter security perimeters, ephemeral JSON Web Tokens and mutual TLS handshakes validate every programmatic API invocation.", "Automated telemetry feeds anomalous behavioral patterns directly into centralized security information and event management engines.", "This rigorous defensive posture neutralizes lateral network traversal during adversarial advanced persistent threat intrusions."]
    ]
  }
};

document.addEventListener('DOMContentLoaded', () => {
  // DOM Elements
  const diffButtons = document.querySelectorAll('#difficulty-group .rptt-pill-btn');
  const topicButtons = document.querySelectorAll('#topic-group .rptt-pill-btn');
  const btnNextPara = document.getElementById('btn-next-para');
  const btnRestart = document.getElementById('btn-restart');
  const soundToggle = document.getElementById('sound-toggle');
  const soundIcon = document.getElementById('sound-icon');

  const statWpm = document.getElementById('stat-wpm');
  const statAccuracy = document.getElementById('stat-accuracy');
  const statStreak = document.getElementById('stat-streak');
  const statBestStreak = document.getElementById('stat-best-streak');
  const statCompleted = document.getElementById('stat-completed');
  const progressBar = document.getElementById('progress-bar');
  const charCounter = document.getElementById('char-counter');

  const badgeTopic = document.getElementById('badge-topic');
  const badgeDifficulty = document.getElementById('badge-difficulty');

  const displayPanel = document.getElementById('display-panel');
  const textDisplay = document.getElementById('text-display');
  const hiddenInput = document.getElementById('hidden-input');
  const focusHint = document.getElementById('focus-hint');

  // Modal Elements
  const completionModal = document.getElementById('completion-modal');
  const modalWpm = document.getElementById('modal-wpm');
  const modalAccuracy = document.getElementById('modal-accuracy');
  const modalStreak = document.getElementById('modal-streak');
  const modalTopicDiff = document.getElementById('modal-topic-diff');
  const modalTimeTaken = document.getElementById('modal-time-taken');
  const modalTotalChars = document.getElementById('modal-total-chars');
  const modalBtnRetry = document.getElementById('modal-btn-retry');
  const modalBtnNext = document.getElementById('modal-btn-next');

  // State
  let currentDifficulty = 'medium';
  let currentTopic = 'all';
  let activeTopicName = 'science'; // actual chosen topic for current paragraph
  let isSoundEnabled = true;

  let currentText = '';
  let currentIndex = 0;
  let charStatus = [];
  let charSpans = [];

  let isStarted = false;
  let isFinished = false;
  let startTime = null;
  let timerInterval = null;

  let totalCharsTyped = 0;
  let totalErrors = 0;
  let currentStreak = 0;
  let bestStreak = 0;
  let paragraphsCompleted = 0;

  // Web Audio for mechanical keyboard feedback
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
      if (audioCtx.state === 'suspended') {
        audioCtx.resume();
      }

      const now = audioCtx.currentTime;
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();

      if (isError) {
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(140, now);
        osc.frequency.exponentialRampToValueAtTime(70, now + 0.08);
        gain.gain.setValueAtTime(0.2, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.start(now);
        osc.stop(now + 0.08);
      } else {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(540 + (currentStreak % 20) * 15, now);
        osc.frequency.exponentialRampToValueAtTime(180, now + 0.03);
        gain.gain.setValueAtTime(0.12, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.03);
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.start(now);
        osc.stop(now + 0.03);
      }
    } catch (_) {}
  }

  // Procedural Generator Function
  function generateProceduralParagraph(topicMode, diffMode) {
    const topics = ['science', 'history', 'art', 'tech'];
    const selectedTopic = topicMode === 'all' 
      ? topics[Math.floor(Math.random() * topics.length)] 
      : topicMode;

    activeTopicName = selectedTopic;

    const topicBank = PROCEDURAL_BANKS[selectedTopic] || PROCEDURAL_BANKS.science;
    const sentenceSets = topicBank[diffMode] || topicBank.medium;

    // Pick a random set of sentences
    const randomSetIndex = Math.floor(Math.random() * sentenceSets.length);
    const sentences = sentenceSets[randomSetIndex];

    // Build paragraph
    return sentences.join(' ');
  }

  function updateTopicBadges() {
    const topicIcons = {
      science: '🔬 Science',
      history: '🏛️ History',
      art: '🎨 Art',
      tech: '⚡ Tech'
    };
    badgeTopic.textContent = topicIcons[activeTopicName] || '🔬 Science';
    badgeDifficulty.textContent = `${currentDifficulty.charAt(0).toUpperCase() + currentDifficulty.slice(1)} Difficulty`;
  }

  function loadNewParagraph() {
    clearInterval(timerInterval);
    timerInterval = null;

    isStarted = false;
    isFinished = false;
    startTime = null;
    currentIndex = 0;
    totalCharsTyped = 0;
    totalErrors = 0;
    currentStreak = 0;

    statWpm.textContent = '0';
    statAccuracy.textContent = '100%';
    statStreak.textContent = '0';
    progressBar.style.width = '0%';

    currentText = generateProceduralParagraph(currentTopic, currentDifficulty);
    charStatus = new Array(currentText.length).fill('pending');

    renderText();
    updateTopicBadges();

    charCounter.textContent = `0 / ${currentText.length}`;
    hiddenInput.value = '';
    focusHint.style.display = 'flex';
    displayPanel.classList.remove('focused');
    completionModal.classList.remove('show');
  }

  function renderText() {
    textDisplay.innerHTML = '';
    charSpans = [];

    const fragment = document.createDocumentFragment();
    for (let i = 0; i < currentText.length; i++) {
      const span = document.createElement('span');
      span.className = 'rptt-char';
      span.textContent = currentText[i];
      if (i === 0) {
        span.classList.add('rptt-char-current');
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

      span.className = 'rptt-char';
      if (i < currentIndex) {
        if (charStatus[i] === 'correct') {
          span.classList.add('rptt-char-correct');
        } else if (charStatus[i] === 'incorrect') {
          span.classList.add('rptt-char-incorrect');
        }
      } else if (i === currentIndex) {
        span.classList.add('rptt-char-current');
      }
    }

    // Auto-scroll
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

    const progress = Math.min(100, Math.round((currentIndex / currentText.length) * 100));
    progressBar.style.width = `${progress}%`;
    charCounter.textContent = `${currentIndex} / ${currentText.length}`;
  }

  function computeLiveStats() {
    if (!startTime) return;
    const now = performance.now();
    const elapsedMinutes = (now - startTime) / 60000;
    if (elapsedMinutes <= 0.008) return;

    // Real-time WPM: (correctChars / 5) / elapsedMinutes
    let correctCount = 0;
    for (let i = 0; i < currentIndex; i++) {
      if (charStatus[i] === 'correct') correctCount++;
    }

    const wpm = Math.max(0, Math.round((correctCount / 5) / elapsedMinutes));
    const accuracy = totalCharsTyped > 0 
      ? Math.max(0, ((totalCharsTyped - totalErrors) / totalCharsTyped) * 100) 
      : 100;

    statWpm.textContent = wpm;
    statAccuracy.textContent = `${accuracy.toFixed(1)}%`;
    statStreak.textContent = currentStreak;
    statBestStreak.textContent = bestStreak;
  }

  function startIfNeeded() {
    if (isStarted || isFinished) return;
    isStarted = true;
    startTime = performance.now();
    initAudio();

    timerInterval = setInterval(() => {
      computeLiveStats();
    }, 200);
  }

  function finishParagraph() {
    if (isFinished) return;
    isFinished = true;
    clearInterval(timerInterval);
    timerInterval = null;

    paragraphsCompleted++;
    statCompleted.textContent = paragraphsCompleted;

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

    modalWpm.textContent = finalWpm;
    modalAccuracy.textContent = `${accuracy.toFixed(1)}%`;
    modalStreak.textContent = bestStreak;
    modalTopicDiff.textContent = `${activeTopicName.toUpperCase()} • ${currentDifficulty.toUpperCase()}`;
    modalTimeTaken.textContent = `${totalSeconds.toFixed(1)}s`;
    modalTotalChars.textContent = `${totalCharsTyped} chars (${totalErrors} errors)`;

    completionModal.classList.add('show');
  }

  function handleKey(e) {
    if (isFinished) return;

    if (['Shift', 'Control', 'Alt', 'Meta', 'CapsLock', 'Tab'].includes(e.key)) {
      return;
    }

    if (e.key === 'Escape') {
      e.preventDefault();
      loadNewParagraph();
      return;
    }

    startIfNeeded();

    if (e.key === 'Backspace') {
      e.preventDefault();
      if (currentIndex > 0) {
        currentIndex--;
        charStatus[currentIndex] = 'pending';
        currentStreak = 0; // Backspace resets current streak
        updateCharVisuals();
        computeLiveStats();
      }
      return;
    }

    if (e.key.length === 1) {
      e.preventDefault();
      if (currentIndex >= currentText.length) {
        finishParagraph();
        return;
      }

      const expected = currentText[currentIndex];
      const typed = e.key;
      totalCharsTyped++;

      if (typed === expected) {
        charStatus[currentIndex] = 'correct';
        currentStreak++;
        if (currentStreak > bestStreak) {
          bestStreak = currentStreak;
        }
        playKeySound(false);
      } else {
        charStatus[currentIndex] = 'incorrect';
        totalErrors++;
        currentStreak = 0;
        playKeySound(true);
      }

      currentIndex++;
      updateCharVisuals();
      computeLiveStats();

      if (currentIndex >= currentText.length) {
        finishParagraph();
      }
    }
  }

  // Focus Handlers
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
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        completionModal.classList.remove('show');
        loadNewParagraph();
        setTimeout(() => hiddenInput.focus(), 100);
      } else if (e.key === 'Escape') {
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

  // Next Random Paragraph button
  btnNextPara.addEventListener('click', () => {
    loadNewParagraph();
    setTimeout(() => hiddenInput.focus(), 50);
  });

  btnRestart.addEventListener('click', () => {
    // Retry same paragraph or restart
    clearInterval(timerInterval);
    timerInterval = null;
    isStarted = false;
    isFinished = false;
    startTime = null;
    currentIndex = 0;
    totalCharsTyped = 0;
    totalErrors = 0;
    currentStreak = 0;
    charStatus = new Array(currentText.length).fill('pending');
    renderText();
    statWpm.textContent = '0';
    statAccuracy.textContent = '100%';
    statStreak.textContent = '0';
    progressBar.style.width = '0%';
    charCounter.textContent = `0 / ${currentText.length}`;
    hiddenInput.value = '';
    hiddenInput.focus();
    displayPanel.classList.add('focused');
    focusHint.style.display = 'none';
  });

  // Difficulty selection
  diffButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      diffButtons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentDifficulty = btn.dataset.diff;
      loadNewParagraph();
    });
  });

  // Topic selection
  topicButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      topicButtons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentTopic = btn.dataset.topic;
      loadNewParagraph();
    });
  });

  // Sound toggle
  soundToggle.addEventListener('click', () => {
    isSoundEnabled = !isSoundEnabled;
    soundIcon.textContent = isSoundEnabled ? '🔊 Sound' : '🔇 Muted';
    initAudio();
  });

  // Modal Buttons
  modalBtnNext.addEventListener('click', () => {
    completionModal.classList.remove('show');
    loadNewParagraph();
    setTimeout(() => hiddenInput.focus(), 100);
  });

  modalBtnRetry.addEventListener('click', () => {
    completionModal.classList.remove('show');
    btnRestart.click();
  });

  completionModal.addEventListener('click', (e) => {
    if (e.target === completionModal) {
      completionModal.classList.remove('show');
    }
  });

  // Initial generation
  loadNewParagraph();
});