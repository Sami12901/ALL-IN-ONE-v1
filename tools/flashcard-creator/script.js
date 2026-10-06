// Digital Flashcard Maker & Study Studio Logic
// Features 3D card flipping, deck storage, shuffle, mastery tracking, and sample presets.

document.addEventListener('DOMContentLoaded', () => {
  const STORAGE_KEY = 'all_in_one_flashcard_decks_v1';

  // Sample Presets
  const DEFAULT_DECKS = {
    'Math Formulas': [
      { id: 'm1', front: 'Quadratic Formula', back: 'x = (-b ± √(b² - 4ac)) / (2a)', mastered: false },
      { id: 'm2', front: 'Pythagorean Theorem', back: 'a² + b² = c²', mastered: false },
      { id: 'm3', front: 'Area of a Circle', back: 'A = πr²', mastered: false },
      { id: 'm4', front: 'Circumference of a Circle', back: 'C = 2πr', mastered: false },
      { id: 'm5', front: 'Slope Formula (Coordinate Geometry)', back: 'm = (y₂ - y₁) / (x₂ - x₁)', mastered: false },
      { id: 'm6', front: 'Derivative of sin(x)', back: 'd/dx [sin(x)] = cos(x)', mastered: false },
      { id: 'm7', front: 'Derivative of eˣ', back: 'd/dx [eˣ] = eˣ', mastered: false },
      { id: 'm8', front: 'Euler\'s Identity', back: 'e^(iπ) + 1 = 0', mastered: false },
      { id: 'm9', front: 'Volume of a Sphere', back: 'V = (4/3)πr³', mastered: false },
      { id: 'm10', front: 'Logarithm Product Rule', back: 'log_b(x · y) = log_b(x) + log_b(y)', mastered: false }
    ],
    'Periodic Elements': [
      { id: 'p1', front: 'Hydrogen', back: 'Symbol: H | Atomic Number: 1', mastered: false },
      { id: 'p2', front: 'Helium', back: 'Symbol: He | Atomic Number: 2', mastered: false },
      { id: 'p3', front: 'Carbon', back: 'Symbol: C | Atomic Number: 6', mastered: false },
      { id: 'p4', front: 'Nitrogen', back: 'Symbol: N | Atomic Number: 7', mastered: false },
      { id: 'p5', front: 'Oxygen', back: 'Symbol: O | Atomic Number: 8', mastered: false },
      { id: 'p6', front: 'Sodium', back: 'Symbol: Na | Atomic Number: 11', mastered: false },
      { id: 'p7', front: 'Iron', back: 'Symbol: Fe | Atomic Number: 26', mastered: false },
      { id: 'p8', front: 'Copper', back: 'Symbol: Cu | Atomic Number: 29', mastered: false },
      { id: 'p9', front: 'Gold', back: 'Symbol: Au | Atomic Number: 79', mastered: false },
      { id: 'p10', front: 'Uranium', back: 'Symbol: U | Atomic Number: 92', mastered: false }
    ],
    'World Capitals': [
      { id: 'c1', front: 'Capital of France', back: 'Paris', mastered: false },
      { id: 'c2', front: 'Capital of Japan', back: 'Tokyo', mastered: false },
      { id: 'c3', front: 'Capital of Australia', back: 'Canberra', mastered: false },
      { id: 'c4', front: 'Capital of Canada', back: 'Ottawa', mastered: false },
      { id: 'c5', front: 'Capital of Brazil', back: 'Brasília', mastered: false },
      { id: 'c6', front: 'Capital of Egypt', back: 'Cairo', mastered: false },
      { id: 'c7', front: 'Capital of Germany', back: 'Berlin', mastered: false },
      { id: 'c8', front: 'Capital of South Korea', back: 'Seoul', mastered: false },
      { id: 'c9', front: 'Capital of Italy', back: 'Rome', mastered: false },
      { id: 'c10', front: 'Capital of Argentina', back: 'Buenos Aires', mastered: false }
    ]
  };

  // State
  let decks = loadDecksFromStorage();
  let activeDeckName = Object.keys(decks)[0] || 'Math Formulas';
  let currentCardIndex = 0;
  let isCardFlipped = false;

  // DOM Elements
  const deckSelect = document.getElementById('deck-select');
  const newDeckBtn = document.getElementById('new-deck-btn');
  const deleteDeckBtn = document.getElementById('delete-deck-btn');
  const tabStudyMode = document.getElementById('tab-study-mode');
  const tabEditMode = document.getElementById('tab-edit-mode');
  const viewStudy = document.getElementById('view-study');
  const viewEdit = document.getElementById('view-edit');

  const flashcard = document.getElementById('flashcard');
  const flashcardScene = document.getElementById('flashcard-scene');
  const cardFrontText = document.getElementById('card-front-text');
  const cardBackText = document.getElementById('card-back-text');
  const currentCardIdxEl = document.getElementById('current-card-idx');
  const totalCardCountEl = document.getElementById('total-card-count');
  const progressBarFill = document.getElementById('study-progress-bar');
  const masteredCountEl = document.getElementById('mastered-count');
  const reviewCountEl = document.getElementById('review-count');

  const prevCardBtn = document.getElementById('prev-card-btn');
  const flipCardBtn = document.getElementById('flip-card-btn');
  const nextCardBtn = document.getElementById('next-card-btn');
  const shuffleBtn = document.getElementById('shuffle-btn');
  const markKnownBtn = document.getElementById('mark-known-btn');
  const markReviewBtn = document.getElementById('mark-review-btn');

  const newFrontInput = document.getElementById('new-front-input');
  const newBackInput = document.getElementById('new-back-input');
  const addCardBtn = document.getElementById('add-card-btn');
  const cardsTableBody = document.getElementById('cards-table-body');
  const manageDeckCount = document.getElementById('manage-deck-count');
  const resetPresetBtn = document.getElementById('reset-deck-preset-btn');

  const exportBtn = document.getElementById('export-btn');
  const importBtn = document.getElementById('import-btn');
  const importFile = document.getElementById('import-file');

  // Storage Helpers
  function loadDecksFromStorage() {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Object.keys(parsed).length > 0) return parsed;
      }
    } catch (e) {
      console.warn('Could not read from localStorage, using presets:', e);
    }
    return JSON.parse(JSON.stringify(DEFAULT_DECKS));
  }

  function saveDecksToStorage() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(decks));
    } catch (e) {
      console.warn('Could not save to localStorage:', e);
    }
  }

  // Populate Deck Select dropdown
  function renderDeckSelect() {
    deckSelect.innerHTML = '';
    const deckNames = Object.keys(decks);
    if (!deckNames.includes(activeDeckName)) {
      activeDeckName = deckNames[0] || 'Default Deck';
    }

    deckNames.forEach(name => {
      const opt = document.createElement('option');
      opt.value = name;
      opt.textContent = `${name} (${decks[name].length} cards)`;
      if (name === activeDeckName) opt.selected = true;
      deckSelect.appendChild(opt);
    });
  }

  // Get active cards
  function getActiveCards() {
    if (!decks[activeDeckName]) {
      decks[activeDeckName] = [];
    }
    return decks[activeDeckName];
  }

  // Render current card in Study view
  function renderStudyCard() {
    const cards = getActiveCards();
    isCardFlipped = false;
    flashcard.classList.remove('flipped');

    if (cards.length === 0) {
      cardFrontText.textContent = 'This deck is currently empty.';
      cardBackText.textContent = 'Switch to "Manage Cards" mode to add questions!';
      currentCardIdxEl.textContent = '0';
      totalCardCountEl.textContent = '0';
      progressBarFill.style.width = '0%';
      masteredCountEl.textContent = '0';
      reviewCountEl.textContent = '0';
      return;
    }

    if (currentCardIndex >= cards.length) {
      currentCardIndex = 0;
    } else if (currentCardIndex < 0) {
      currentCardIndex = cards.length - 1;
    }

    const currentCard = cards[currentCardIndex];
    cardFrontText.textContent = currentCard.front;
    cardBackText.textContent = currentCard.back;

    currentCardIdxEl.textContent = String(currentCardIndex + 1);
    totalCardCountEl.textContent = String(cards.length);

    const progressPct = ((currentCardIndex + 1) / cards.length) * 100;
    progressBarFill.style.width = `${progressPct}%`;

    const mastered = cards.filter(c => c.mastered).length;
    masteredCountEl.textContent = String(mastered);
    reviewCountEl.textContent = String(cards.length - mastered);
  }

  // Flip card
  function flipCard() {
    isCardFlipped = !isCardFlipped;
    flashcard.classList.toggle('flipped', isCardFlipped);
  }

  // Render Manage Cards view
  function renderManageCards() {
    const cards = getActiveCards();
    manageDeckCount.textContent = String(cards.length);
    cardsTableBody.innerHTML = '';

    if (cards.length === 0) {
      const tr = document.createElement('tr');
      tr.innerHTML = `<td colspan="4" style="text-align: center; color: var(--text-tertiary); padding: 2rem;">No cards yet. Use the form above to add your first flashcard.</td>`;
      cardsTableBody.appendChild(tr);
      return;
    }

    cards.forEach((card, idx) => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td style="color: var(--text-tertiary); font-weight: 600;">#${idx + 1}</td>
        <td style="font-weight: 600; color: var(--text-primary);">${escapeHtml(card.front)}</td>
        <td style="color: var(--text-secondary);">${escapeHtml(card.back)}</td>
        <td style="text-align: center;">
          <button class="btn btn-secondary delete-card-btn" data-index="${idx}" style="padding: 0.25rem 0.6rem; font-size: 0.75rem; color: #f87171;" title="Delete card">
            ✕
          </button>
        </td>
      `;
      cardsTableBody.appendChild(tr);
    });

    // Delete card listeners
    cardsTableBody.querySelectorAll('.delete-card-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const idx = parseInt(btn.getAttribute('data-index'), 10);
        cards.splice(idx, 1);
        if (currentCardIndex >= cards.length && currentCardIndex > 0) {
          currentCardIndex--;
        }
        saveDecksToStorage();
        renderDeckSelect();
        renderManageCards();
        renderStudyCard();
      });
    });
  }

  function escapeHtml(str) {
    if (!str) return '';
    return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  // Study Controls
  flashcardScene.addEventListener('click', flipCard);
  flipCardBtn.addEventListener('click', flipCard);

  prevCardBtn.addEventListener('click', () => {
    const cards = getActiveCards();
    if (cards.length <= 1) return;
    currentCardIndex = (currentCardIndex - 1 + cards.length) % cards.length;
    renderStudyCard();
  });

  nextCardBtn.addEventListener('click', () => {
    const cards = getActiveCards();
    if (cards.length <= 1) return;
    currentCardIndex = (currentCardIndex + 1) % cards.length;
    renderStudyCard();
  });

  // Shuffle Deck (Fisher-Yates)
  shuffleBtn.addEventListener('click', () => {
    const cards = getActiveCards();
    if (cards.length <= 1) return;
    for (let i = cards.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [cards[i], cards[j]] = [cards[j], cards[i]];
    }
    currentCardIndex = 0;
    saveDecksToStorage();
    renderStudyCard();
  });

  // Mastery Buttons
  markKnownBtn.addEventListener('click', () => {
    const cards = getActiveCards();
    if (cards.length === 0) return;
    cards[currentCardIndex].mastered = true;
    saveDecksToStorage();
    // Advance to next card
    if (cards.length > 1) {
      currentCardIndex = (currentCardIndex + 1) % cards.length;
    }
    renderStudyCard();
  });

  markReviewBtn.addEventListener('click', () => {
    const cards = getActiveCards();
    if (cards.length === 0) return;
    cards[currentCardIndex].mastered = false;
    saveDecksToStorage();
    // Advance to next card
    if (cards.length > 1) {
      currentCardIndex = (currentCardIndex + 1) % cards.length;
    }
    renderStudyCard();
  });

  // Keyboard navigation
  window.addEventListener('keydown', (e) => {
    // Only in study view and when not focusing an input or textarea
    if (viewStudy.style.display === 'none') return;
    if (['INPUT', 'TEXTAREA'].includes(document.activeElement.tagName)) return;

    if (e.key === ' ' || e.code === 'Space') {
      e.preventDefault();
      flipCard();
    } else if (e.key === 'ArrowRight') {
      e.preventDefault();
      const cards = getActiveCards();
      if (cards.length > 1) {
        currentCardIndex = (currentCardIndex + 1) % cards.length;
        renderStudyCard();
      }
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault();
      const cards = getActiveCards();
      if (cards.length > 1) {
        currentCardIndex = (currentCardIndex - 1 + cards.length) % cards.length;
        renderStudyCard();
      }
    }
  });

  // Switch Decks
  deckSelect.addEventListener('change', () => {
    activeDeckName = deckSelect.value;
    currentCardIndex = 0;
    renderStudyCard();
    renderManageCards();
  });

  // New Deck
  newDeckBtn.addEventListener('click', () => {
    const name = prompt('Enter a title for the new flashcard deck:');
    if (name && name.trim()) {
      const cleanName = name.trim();
      if (decks[cleanName]) {
        alert('A deck with that name already exists!');
        return;
      }
      decks[cleanName] = [];
      activeDeckName = cleanName;
      currentCardIndex = 0;
      saveDecksToStorage();
      renderDeckSelect();
      renderStudyCard();
      renderManageCards();
      // Switch to edit mode to add cards immediately
      tabEditMode.click();
    }
  });

  // Delete Deck
  deleteDeckBtn.addEventListener('click', () => {
    const deckNames = Object.keys(decks);
    if (deckNames.length <= 1) {
      alert('You must have at least one deck. Cannot delete the only deck.');
      return;
    }
    if (confirm(`Are you sure you want to delete the deck "${activeDeckName}"?`)) {
      delete decks[activeDeckName];
      activeDeckName = Object.keys(decks)[0];
      currentCardIndex = 0;
      saveDecksToStorage();
      renderDeckSelect();
      renderStudyCard();
      renderManageCards();
    }
  });

  // Add Card
  addCardBtn.addEventListener('click', () => {
    const front = newFrontInput.value.trim();
    const back = newBackInput.value.trim();

    if (!front || !back) {
      alert('Please fill out both the Front (Question) and Back (Answer).');
      return;
    }

    const cards = getActiveCards();
    cards.push({
      id: 'c_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4),
      front,
      back,
      mastered: false
    });

    newFrontInput.value = '';
    newBackInput.value = '';
    saveDecksToStorage();
    renderDeckSelect();
    renderManageCards();
    renderStudyCard();
  });

  // Reset to default preset
  resetPresetBtn.addEventListener('click', () => {
    if (DEFAULT_DECKS[activeDeckName]) {
      if (confirm(`Reset "${activeDeckName}" to its original default preset cards?`)) {
        decks[activeDeckName] = JSON.parse(JSON.stringify(DEFAULT_DECKS[activeDeckName]));
        currentCardIndex = 0;
        saveDecksToStorage();
        renderDeckSelect();
        renderManageCards();
        renderStudyCard();
      }
    } else {
      alert(`"${activeDeckName}" is a custom deck and does not have a default preset.`);
    }
  });

  // Mode Tabs Switching
  tabStudyMode.addEventListener('click', () => {
    tabStudyMode.classList.add('active');
    tabEditMode.classList.remove('active');
    viewStudy.style.display = 'flex';
    viewEdit.style.display = 'none';
    renderStudyCard();
  });

  tabEditMode.addEventListener('click', () => {
    tabEditMode.classList.add('active');
    tabStudyMode.classList.remove('active');
    viewStudy.style.display = 'none';
    viewEdit.style.display = 'flex';
    renderManageCards();
  });

  // Export Deck
  exportBtn.addEventListener('click', () => {
    const data = JSON.stringify({ [activeDeckName]: getActiveCards() }, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${activeDeckName.toLowerCase().replace(/[^a-z0-9]/g, '_')}_flashcards.json`;
    a.click();
    URL.revokeObjectURL(url);
  });

  // Import Deck
  importBtn.addEventListener('click', () => {
    importFile.click();
  });

  importFile.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const imported = JSON.parse(event.target.result);
        if (typeof imported === 'object' && imported !== null) {
          Object.keys(imported).forEach(dName => {
            if (Array.isArray(imported[dName])) {
              decks[dName] = imported[dName].map(c => ({
                id: c.id || ('c_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4)),
                front: c.front || '',
                back: c.back || '',
                mastered: Boolean(c.mastered)
              }));
              activeDeckName = dName;
            }
          });
          currentCardIndex = 0;
          saveDecksToStorage();
          renderDeckSelect();
          renderStudyCard();
          renderManageCards();
          alert('Flashcard deck imported successfully!');
        }
      } catch (err) {
        alert('Invalid JSON file format.');
      }
      importFile.value = '';
    };
    reader.readAsText(file);
  });

  // Initial Initialization
  renderDeckSelect();
  renderStudyCard();
  renderManageCards();
});