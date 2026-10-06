// Habit Tracker Grid - Complete Client-Side Implementation

document.addEventListener('DOMContentLoaded', () => {
  // DOM Elements
  const habitsContainer = document.getElementById('habitsContainer');
  const emptyHabitsState = document.getElementById('emptyHabitsState');
  const todayProgressText = document.getElementById('todayProgressText');
  const todayProgressBar = document.getElementById('todayProgressBar');
  const totalHabitsCount = document.getElementById('totalHabitsCount');
  const bestStreakCount = document.getElementById('bestStreakCount');
  const overallRateText = document.getElementById('overallRateText');

  const categoryFilters = document.getElementById('categoryFilters');
  const view7DayBtn = document.getElementById('view7DayBtn');
  const view30DayBtn = document.getElementById('view30DayBtn');
  const addHabitBtn = document.getElementById('addHabitBtn');
  const addFirstHabitBtn = document.getElementById('addFirstHabitBtn');
  const loadDefaultsBtn = document.getElementById('loadDefaultsBtn');
  const exportHabitsBtn = document.getElementById('exportHabitsBtn');
  const resetHabitsBtn = document.getElementById('resetHabitsBtn');

  // Modal Elements
  const habitModal = document.getElementById('habitModal');
  const modalTitle = document.getElementById('modalTitle');
  const habitForm = document.getElementById('habitForm');
  const habitIdInput = document.getElementById('habitIdInput');
  const habitNameInput = document.getElementById('habitNameInput');
  const habitGoalInput = document.getElementById('habitGoalInput');
  const habitCategorySelect = document.getElementById('habitCategorySelect');
  const colorSwatches = document.getElementById('colorSwatches');
  const closeModalBtn = document.getElementById('closeModalBtn');
  const cancelModalBtn = document.getElementById('cancelModalBtn');

  // Confetti Canvas
  const confettiCanvas = document.getElementById('confettiCanvas');
  const confettiCtx = confettiCanvas.getContext('2d');

  // State
  const STORAGE_KEY = 'aio_habit_tracker_data_v1';
  let habits = [];
  let currentCategory = 'all';
  let currentView = '7day'; // '7day' or '30day'
  let selectedColor = '#4e85bf';

  // Helper: Format Date to YYYY-MM-DD
  function toDateKey(date) {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }

  const todayKey = toDateKey(new Date());

  // Starter Default Habits
  function getDefaultHabits() {
    const now = new Date();
    const d1 = new Date(now); d1.setDate(d1.getDate() - 1);
    const d2 = new Date(now); d2.setDate(d2.getDate() - 2);
    const d3 = new Date(now); d3.setDate(d3.getDate() - 3);

    return [
      {
        id: 'h1',
        name: 'Drink 2L Water Daily',
        goal: '8 glasses (2 Liters)',
        category: 'health',
        icon: '💧',
        color: '#06b6d4',
        createdAt: toDateKey(d3),
        history: {
          [toDateKey(d3)]: true,
          [toDateKey(d2)]: true,
          [toDateKey(d1)]: true,
          [todayKey]: true
        }
      },
      {
        id: 'h2',
        name: 'Morning Workout & Cardio',
        goal: '30 minutes training',
        category: 'fitness',
        icon: '🏃',
        color: '#10b981',
        createdAt: toDateKey(d3),
        history: {
          [toDateKey(d2)]: true,
          [toDateKey(d1)]: true,
          [todayKey]: false
        }
      },
      {
        id: 'h3',
        name: 'Daily Reading / Learning',
        goal: '20 pages or 1 chapter',
        category: 'study',
        icon: '📚',
        color: '#8b5cf6',
        createdAt: toDateKey(d3),
        history: {
          [toDateKey(d3)]: true,
          [toDateKey(d1)]: true,
          [todayKey]: true
        }
      }
    ];
  }

  // Load from Storage
  function loadHabits() {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      try {
        habits = JSON.parse(raw);
      } catch {
        habits = getDefaultHabits();
      }
    } else {
      habits = getDefaultHabits();
      saveHabits();
    }
  }

  function saveHabits() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(habits));
  }

  // Streak & Analytics Calculation
  function calculateStreaks(habit) {
    const today = new Date();
    let currentStreak = 0;
    let longestStreak = 0;
    let tempStreak = 0;

    // 1. Current Streak calculation
    let checkDate = new Date(today);
    let key = toDateKey(checkDate);

    // If today is checked, start streak counting today
    if (habit.history[key]) {
      currentStreak++;
      checkDate.setDate(checkDate.getDate() - 1);
      key = toDateKey(checkDate);
      while (habit.history[key]) {
        currentStreak++;
        checkDate.setDate(checkDate.getDate() - 1);
        key = toDateKey(checkDate);
      }
    } else {
      // If today not checked yet, check if yesterday was checked (streak still live)
      checkDate.setDate(checkDate.getDate() - 1);
      key = toDateKey(checkDate);
      while (habit.history[key]) {
        currentStreak++;
        checkDate.setDate(checkDate.getDate() - 1);
        key = toDateKey(checkDate);
      }
    }

    // 2. Longest Streak & Completion Rate over last 60 days
    const daysToScan = 60;
    let checkedCount = 0;
    tempStreak = 0;

    for (let i = daysToScan - 1; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const k = toDateKey(d);
      if (habit.history[k]) {
        checkedCount++;
        tempStreak++;
        if (tempStreak > longestStreak) {
          longestStreak = tempStreak;
        }
      } else {
        tempStreak = 0;
      }
    }

    if (currentStreak > longestStreak) {
      longestStreak = currentStreak;
    }

    // Completion Rate based on active days since created or max 30
    const createdDate = new Date(habit.createdAt || today);
    const diffDays = Math.max(1, Math.min(30, Math.floor((today - createdDate) / (1000 * 60 * 60 * 24)) + 1));
    const completionRate = Math.min(100, Math.round((checkedCount / diffDays) * 100));

    return { currentStreak, longestStreak, completionRate };
  }

  // Update Top Stats
  function updateGlobalStats() {
    totalHabitsCount.textContent = habits.length;

    let todayDone = 0;
    let maxStreakAll = 0;
    let totalRateSum = 0;

    habits.forEach(h => {
      if (h.history[todayKey]) todayDone++;
      const { currentStreak, longestStreak, completionRate } = calculateStreaks(h);
      if (currentStreak > maxStreakAll) maxStreakAll = currentStreak;
      totalRateSum += completionRate;
    });

    const percent = habits.length > 0 ? Math.round((todayDone / habits.length) * 100) : 0;
    todayProgressText.textContent = `${todayDone} of ${habits.length} Done`;
    todayProgressBar.style.width = `${percent}%`;

    bestStreakCount.textContent = `🔥 ${maxStreakAll} Days`;

    const avgRate = habits.length > 0 ? Math.round(totalRateSum / habits.length) : 0;
    overallRateText.textContent = `${avgRate}%`;

    // Trigger celebration if 100% achieved today
    if (habits.length > 0 && todayDone === habits.length) {
      triggerConfetti();
    }
  }

  // Confetti Particle Explosion
  let confettiParticles = [];
  let confettiAnimId = null;

  function resizeConfetti() {
    confettiCanvas.width = window.innerWidth;
    confettiCanvas.height = window.innerHeight;
  }
  window.addEventListener('resize', resizeConfetti);
  resizeConfetti();

  function triggerConfetti() {
    confettiParticles = [];
    const colors = ['#4e85bf', '#89aacc', '#10b981', '#f59e0b', '#ec4899', '#8b5cf6'];
    for (let i = 0; i < 75; i++) {
      confettiParticles.push({
        x: window.innerWidth * (0.3 + Math.random() * 0.4),
        y: window.innerHeight * 0.4,
        vx: (Math.random() - 0.5) * 14,
        vy: (Math.random() - 0.7) * 18,
        size: Math.random() * 8 + 4,
        color: colors[Math.floor(Math.random() * colors.length)],
        rotation: Math.random() * 360,
        spin: (Math.random() - 0.5) * 10,
        alpha: 1
      });
    }

    if (!confettiAnimId) {
      renderConfetti();
    }
  }

  function renderConfetti() {
    confettiCtx.clearRect(0, 0, confettiCanvas.width, confettiCanvas.height);
    let alive = false;

    for (let i = 0; i < confettiParticles.length; i++) {
      const p = confettiParticles[i];
      p.x += p.vx;
      p.y += p.vy;
      p.vy += 0.35; // gravity
      p.rotation += p.spin;
      p.alpha -= 0.01;

      if (p.alpha > 0) {
        alive = true;
        confettiCtx.save();
        confettiCtx.translate(p.x, p.y);
        confettiCtx.rotate((p.rotation * Math.PI) / 180);
        confettiCtx.fillStyle = p.color;
        confettiCtx.globalAlpha = p.alpha;
        confettiCtx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.6);
        confettiCtx.restore();
      }
    }

    if (alive) {
      confettiAnimId = requestAnimationFrame(renderConfetti);
    } else {
      confettiCtx.clearRect(0, 0, confettiCanvas.width, confettiCanvas.height);
      confettiAnimId = null;
    }
  }

  // Render Habits List
  function renderHabits() {
    const filtered = habits.filter(h => {
      if (currentCategory === 'all') return true;
      return h.category.toLowerCase() === currentCategory.toLowerCase();
    });

    if (habits.length === 0) {
      emptyHabitsState.style.display = 'block';
      habitsContainer.innerHTML = '';
      updateGlobalStats();
      return;
    }

    emptyHabitsState.style.display = 'none';
    habitsContainer.innerHTML = '';

    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    filtered.forEach(habit => {
      const { currentStreak, longestStreak, completionRate } = calculateStreaks(habit);
      const isTodayChecked = !!habit.history[todayKey];

      const card = document.createElement('div');
      card.className = 'habit-item-card';

      // Header row
      const headerRow = document.createElement('div');
      headerRow.className = 'habit-card-header';
      headerRow.innerHTML = `
        <div class="habit-brand-box">
          <div class="habit-avatar" style="border-color: ${habit.color}; color: ${habit.color};">
            ${habit.icon || '⚡'}
          </div>
          <div class="habit-info-col">
            <span class="habit-name-text">${habit.name}</span>
            <div class="habit-meta-text">
              <span>🎯 ${habit.goal}</span>
              <span>•</span>
              <span style="text-transform: capitalize;">${habit.category}</span>
            </div>
          </div>
        </div>

        <div style="display: flex; align-items: center; gap: 0.75rem; flex-wrap: wrap;">
          <div class="habit-metrics-row">
            <span class="metric-badge fire">🔥 ${currentStreak}d Streak</span>
            <span class="metric-badge trophy">🏆 ${longestStreak}d Best</span>
            <span class="metric-badge rate">📈 ${completionRate}%</span>
          </div>

          <div style="display: flex; gap: 0.4rem;">
            <button class="btn btn-secondary btn-icon edit-habit-btn" data-id="${habit.id}" title="Edit Habit">✎</button>
            <button class="btn btn-secondary btn-icon delete-habit-btn" data-id="${habit.id}" style="color: var(--error);" title="Delete Habit">✕</button>
          </div>
        </div>
      `;
      card.appendChild(headerRow);

      // Grid based on current view
      if (currentView === '7day') {
        // Last 7 days ending today
        const weekGrid = document.createElement('div');
        weekGrid.className = 'week-grid-container';

        for (let i = 6; i >= 0; i--) {
          const d = new Date();
          d.setDate(d.getDate() - i);
          const k = toDateKey(d);
          const isDayChecked = !!habit.history[k];
          const isToday = k === todayKey;

          const dayCell = document.createElement('div');
          dayCell.className = `day-cell ${isDayChecked ? 'checked' : ''} ${isToday ? 'today' : ''}`;
          dayCell.innerHTML = `
            <span class="day-label">${dayNames[d.getDay()]}</span>
            <span class="day-date-num">${d.getDate()}</span>
            <div class="day-check-circle" style="${isDayChecked ? `background: ${habit.color}; border-color: ${habit.color}; color: #fff;` : ''}">
              ✓
            </div>
          `;

          dayCell.addEventListener('click', () => {
            toggleHabitDate(habit.id, k);
          });

          weekGrid.appendChild(dayCell);
        }
        card.appendChild(weekGrid);

      } else {
        // 30-Day Matrix Grid
        const monthGrid = document.createElement('div');
        monthGrid.className = 'month-matrix-grid';

        for (let i = 29; i >= 0; i--) {
          const d = new Date();
          d.setDate(d.getDate() - i);
          const k = toDateKey(d);
          const isDayChecked = !!habit.history[k];
          const isToday = k === todayKey;

          const tile = document.createElement('div');
          tile.className = `matrix-tile ${isDayChecked ? 'checked' : ''} ${isToday ? 'today' : ''}`;
          tile.title = `${k}: ${isDayChecked ? 'Completed' : 'Missed'}`;
          tile.textContent = d.getDate();
          if (isDayChecked) {
            tile.style.background = habit.color;
            tile.style.borderColor = habit.color;
          }

          tile.addEventListener('click', () => {
            toggleHabitDate(habit.id, k);
          });

          monthGrid.appendChild(tile);
        }
        card.appendChild(monthGrid);
      }

      // Card Action Bar
      const footerBar = document.createElement('div');
      footerBar.style.cssText = 'display: flex; justify-content: space-between; align-items: center; padding-top: 0.5rem; border-top: 1px solid var(--border);';
      footerBar.innerHTML = `
        <span style="font-size: 0.8rem; color: var(--text-secondary);">
          ${isTodayChecked ? '✓ Completed for today!' : 'Pending for today'}
        </span>
        <button class="btn ${isTodayChecked ? 'btn-secondary' : 'btn-primary'} today-quick-btn" data-id="${habit.id}" style="padding: 0.35rem 0.85rem; font-size: 0.8rem;">
          ${isTodayChecked ? 'Undo Today' : '✓ Check Today'}
        </button>
      `;

      footerBar.querySelector('.today-quick-btn').addEventListener('click', () => {
        toggleHabitDate(habit.id, todayKey);
      });

      card.appendChild(footerBar);
      habitsContainer.appendChild(card);
    });

    // Bind Edit and Delete buttons
    document.querySelectorAll('.edit-habit-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const id = e.currentTarget.getAttribute('data-id');
        openEditModal(id);
      });
    });

    document.querySelectorAll('.delete-habit-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const id = e.currentTarget.getAttribute('data-id');
        deleteHabit(id);
      });
    });

    updateGlobalStats();
  }

  // Toggle habit on a specific date
  function toggleHabitDate(habitId, dateKey) {
    const habit = habits.find(h => h.id === habitId);
    if (!habit) return;

    habit.history[dateKey] = !habit.history[dateKey];
    saveHabits();
    renderHabits();

    if (dateKey === todayKey && habit.history[dateKey]) {
      triggerConfetti();
    }
  }

  // Delete Habit
  function deleteHabit(habitId) {
    const habit = habits.find(h => h.id === habitId);
    if (!habit) return;
    if (confirm(`Delete "${habit.name}" habit and all tracked history?`)) {
      habits = habits.filter(h => h.id !== habitId);
      saveHabits();
      renderHabits();
    }
  }

  // Open Modal for Add
  function openAddModal() {
    modalTitle.textContent = 'Add New Daily Habit';
    habitIdInput.value = '';
    habitNameInput.value = '';
    habitGoalInput.value = '1 time per day';
    habitCategorySelect.selectedIndex = 0;
    selectedColor = '#4e85bf';
    updateSwatchSelection();
    habitModal.classList.add('open');
    habitNameInput.focus();
  }

  // Open Modal for Edit
  function openEditModal(habitId) {
    const habit = habits.find(h => h.id === habitId);
    if (!habit) return;
    modalTitle.textContent = 'Edit Habit';
    habitIdInput.value = habit.id;
    habitNameInput.value = habit.name;
    habitGoalInput.value = habit.goal;
    selectedColor = habit.color || '#4e85bf';
    
    // Select category match
    for (let i = 0; i < habitCategorySelect.options.length; i++) {
      if (habitCategorySelect.options[i].value.startsWith(habit.category)) {
        habitCategorySelect.selectedIndex = i;
        break;
      }
    }

    updateSwatchSelection();
    habitModal.classList.add('open');
    habitNameInput.focus();
  }

  function closeModal() {
    habitModal.classList.remove('open');
  }

  closeModalBtn.addEventListener('click', closeModal);
  cancelModalBtn.addEventListener('click', closeModal);
  habitModal.addEventListener('click', (e) => {
    if (e.target === habitModal) closeModal();
  });

  // Swatch Buttons
  colorSwatches.addEventListener('click', (e) => {
    const btn = e.target.closest('.color-swatch-btn');
    if (!btn) return;
    selectedColor = btn.getAttribute('data-color');
    updateSwatchSelection();
  });

  function updateSwatchSelection() {
    document.querySelectorAll('.color-swatch-btn').forEach(btn => {
      btn.classList.toggle('selected', btn.getAttribute('data-color') === selectedColor);
    });
  }

  // Form Submit (Save Habit)
  habitForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const name = habitNameInput.value.trim();
    if (!name) return;

    const [category, icon] = habitCategorySelect.value.split('|');
    const goal = habitGoalInput.value.trim() || 'Daily';
    const habitId = habitIdInput.value;

    if (habitId) {
      // Edit existing
      const habit = habits.find(h => h.id === habitId);
      if (habit) {
        habit.name = name;
        habit.goal = goal;
        habit.category = category;
        habit.icon = icon;
        habit.color = selectedColor;
      }
    } else {
      // Create new
      const newHabit = {
        id: 'h_' + Date.now(),
        name,
        goal,
        category,
        icon,
        color: selectedColor,
        createdAt: todayKey,
        history: {
          [todayKey]: false
        }
      };
      habits.unshift(newHabit);
    }

    saveHabits();
    closeModal();
    renderHabits();
  });

  // Category Filters
  categoryFilters.addEventListener('click', (e) => {
    const pill = e.target.closest('.category-pill');
    if (!pill) return;
    document.querySelectorAll('.category-pill').forEach(p => p.classList.remove('active'));
    pill.classList.add('active');
    currentCategory = pill.getAttribute('data-category');
    renderHabits();
  });

  // View Switchers
  view7DayBtn.addEventListener('click', () => {
    view7DayBtn.classList.add('active');
    view30DayBtn.classList.remove('active');
    currentView = '7day';
    renderHabits();
  });

  view30DayBtn.addEventListener('click', () => {
    view30DayBtn.classList.add('active');
    view7DayBtn.classList.remove('active');
    currentView = '30day';
    renderHabits();
  });

  // Top Buttons
  addHabitBtn.addEventListener('click', openAddModal);
  addFirstHabitBtn.addEventListener('click', openAddModal);

  loadDefaultsBtn.addEventListener('click', () => {
    habits = getDefaultHabits();
    saveHabits();
    renderHabits();
  });

  exportHabitsBtn.addEventListener('click', () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(habits, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `habits_backup_${todayKey}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  });

  resetHabitsBtn.addEventListener('click', () => {
    if (confirm('Are you sure you want to reset all habit records? This cannot be undone.')) {
      habits = [];
      saveHabits();
      renderHabits();
    }
  });

  // Initial Load
  loadHabits();
  renderHabits();
});