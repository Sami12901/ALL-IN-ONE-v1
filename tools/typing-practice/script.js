document.addEventListener('DOMContentLoaded', () => {
  const words = {
    easy: ["cat", "dog", "run", "jump", "tree", "bird", "fish", "ball", "sun", "moon", "star", "book", "pen", "desk", "chair", "home", "door", "window", "car", "bus", "train", "ship", "boat", "plane", "sky", "cloud", "rain", "snow", "wind", "storm", "fire", "water", "earth", "rock", "sand"],
    medium: ["journey", "discover", "explore", "wonder", "nature", "forest", "mountain", "river", "ocean", "desert", "animal", "creature", "human", "person", "people", "friend", "family", "child", "adult", "parent", "mother", "father", "sister", "brother", "daughter", "son", "teacher", "student", "school", "college", "university", "work", "job", "career", "business"],
    hard: ["Pneumonoultramicroscopicsilicovolcanoconiosis", "Floccinaucinihilipilification", "Antidisestablishmentarianism", "Supercalifragilisticexpialidocious", "Incomprehensibilities", "Uncopyrightable", "Subdermatoglyphic", "Sesquipedalianism", "Otorhinolaryngological", "Hippopotomonstrosesquippedaliophobia", "789! @#$ %^& *()", "123? 456; 789:", "Quick-brown-fox", "Jumps_over_the_lazy_dog", "1984, Orwell", "A.I. & Machine Learning", "C++ / Java / Python", "HTML5 & CSS3", "React.js vs Vue.js", "http://www.example.com", "user@email.co.uk", "$1,000,000.00", "50% OFF!!!"]
  };

  const elements = {
    container: document.getElementById('typing-container'),
    input: document.getElementById('hidden-input'),
    display: document.getElementById('text-display'),
    prompt: document.getElementById('keyboard-prompt'),
    
    wpm: document.getElementById('stat-wpm'),
    cpm: document.getElementById('stat-cpm'),
    acc: document.getElementById('stat-acc'),
    time: document.getElementById('stat-time'),
    
    diffSelect: document.getElementById('difficulty'),
    resetBtn: document.getElementById('reset-btn'),
    
    modal: document.getElementById('results-modal'),
    finalWpm: document.getElementById('final-wpm'),
    finalAcc: document.getElementById('final-acc'),
    tryAgainBtn: document.getElementById('try-again-btn')
  };

  let timer = 60;
  let timeLeft = timer;
  let timerInterval = null;
  let isTyping = false;
  let currentText = "";
  
  let totalKeypresses = 0;
  let correctKeypresses = 0;
  let currentIndex = 0;

  function generateText(difficulty) {
    const wordPool = words[difficulty] || words.medium;
    let textArray = [];
    // Generate ~30 random words
    for(let i=0; i<40; i++) {
      textArray.push(wordPool[Math.floor(Math.random() * wordPool.length)]);
    }
    return textArray.join(" ");
  }

  function renderText() {
    elements.display.innerHTML = '';
    currentText.split('').forEach((char, index) => {
      const span = document.createElement('span');
      span.innerText = char;
      span.classList.add('char');
      if (index === 0) span.classList.add('active');
      elements.display.appendChild(span);
    });
  }

  function initTest() {
    clearInterval(timerInterval);
    isTyping = false;
    timeLeft = 60;
    totalKeypresses = 0;
    correctKeypresses = 0;
    currentIndex = 0;
    
    elements.wpm.innerText = '0';
    elements.cpm.innerText = '0';
    elements.acc.innerHTML = '100<span style="font-size:1rem">%</span>';
    elements.time.innerText = timeLeft;
    
    elements.input.value = '';
    elements.modal.style.display = 'none';
    elements.container.style.display = 'block';
    
    currentText = generateText(elements.diffSelect.value);
    renderText();
    
    elements.input.focus();
  }

  function startTimer() {
    isTyping = true;
    timerInterval = setInterval(() => {
      timeLeft--;
      elements.time.innerText = timeLeft;
      
      updateStats();

      if (timeLeft <= 0) {
        endTest();
      }
    }, 1000);
  }

  function updateStats() {
    const timeElapsed = 60 - timeLeft;
    
    // CPM = total correct characters / time in minutes
    let cpm = 0;
    let wpm = 0;
    
    if (timeElapsed > 0) {
      cpm = Math.round((correctKeypresses / timeElapsed) * 60);
      wpm = Math.round(cpm / 5); // standard formula is CPM / 5
    }
    
    let acc = 100;
    if (totalKeypresses > 0) {
      acc = Math.round((correctKeypresses / totalKeypresses) * 100);
    }
    
    elements.cpm.innerText = cpm;
    elements.wpm.innerText = wpm;
    elements.acc.innerHTML = `${acc}<span style="font-size:1rem">%</span>`;
  }

  function endTest() {
    clearInterval(timerInterval);
    elements.input.blur();
    
    elements.container.style.display = 'none';
    elements.modal.style.display = 'block';
    
    elements.finalWpm.innerText = elements.wpm.innerText;
    elements.finalAcc.innerText = elements.acc.innerText;
  }

  elements.input.addEventListener('input', (e) => {
    if (!isTyping && timeLeft > 0) {
      startTimer();
    }
    
    const typedVal = elements.input.value;
    const charSpans = elements.display.querySelectorAll('.char');
    
    // Check if user hit backspace (length decreased)
    if (typedVal.length < currentIndex) {
      // User deleted characters
      for(let i = typedVal.length; i < currentIndex; i++) {
        if(charSpans[i]) {
          charSpans[i].classList.remove('correct', 'incorrect');
        }
      }
      currentIndex = typedVal.length;
    } else {
      // User typed characters
      totalKeypresses++;
      const lastTypedChar = typedVal[typedVal.length - 1];
      const targetChar = currentText[currentIndex];
      
      if (lastTypedChar === targetChar) {
        charSpans[currentIndex].classList.add('correct');
        correctKeypresses++;
      } else {
        charSpans[currentIndex].classList.add('incorrect');
      }
      currentIndex++;
    }

    // Update active cursor
    charSpans.forEach(span => span.classList.remove('active'));
    if (charSpans[currentIndex]) {
      charSpans[currentIndex].classList.add('active');
    }

    // If reached the end of current text, generate more
    if (currentIndex >= currentText.length) {
      currentText = generateText(elements.diffSelect.value);
      elements.input.value = '';
      currentIndex = 0;
      renderText();
    }
  });

  // Handle Focus
  elements.container.addEventListener('click', () => {
    elements.input.focus();
  });

  elements.input.addEventListener('focus', () => {
    elements.container.classList.add('focused');
  });

  elements.input.addEventListener('blur', () => {
    if(!isTyping) {
      elements.container.classList.remove('focused');
    }
  });

  // Controls
  elements.resetBtn.addEventListener('click', initTest);
  elements.diffSelect.addEventListener('change', initTest);
  elements.tryAgainBtn.addEventListener('click', initTest);

  // Init on load
  initTest();
});
