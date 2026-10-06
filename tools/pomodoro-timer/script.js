// Pomodoro Focus Timer - Interactive Vanilla JS
document.addEventListener('DOMContentLoaded', () => {
  // DOM References
  const tabPomodoro = document.getElementById('tab-pomodoro');
  const tabShortBreak = document.getElementById('tab-short-break');
  const tabLongBreak = document.getElementById('tab-long-break');
  const timerBadgeLabel = document.getElementById('timer-badge-label');
  const timerDisplay = document.getElementById('timer-display');
  const timerProgressRing = document.getElementById('timer-progress-ring');
  const timerActiveTaskName = document.getElementById('timer-active-task-name');

  const toggleTimerBtn = document.getElementById('toggle-timer-btn');
  const startBtnLabel = document.getElementById('start-btn-label');
  const playIcon = document.getElementById('play-icon');
  const pauseIcon = document.getElementById('pause-icon');
  const resetBtn = document.getElementById('reset-btn');
  const skipBtn = document.getElementById('skip-btn');

  const soundToggleBtn = document.getElementById('sound-toggle-btn');
  const soundOnIcon = document.getElementById('sound-on-icon');
  const soundOffIcon = document.getElementById('sound-off-icon');

  const cycleLabel = document.getElementById('cycle-label');
  const cycleDotsContainer = document.getElementById('cycle-dots-container');

  const statSessionsToday = document.getElementById('stat-sessions-today');
  const statMinutesToday = document.getElementById('stat-minutes-today');
  const statTasksDone = document.getElementById('stat-tasks-done');

  const addTaskForm = document.getElementById('add-task-form');
  const newTaskInput = document.getElementById('new-task-input');
  const taskListContainer = document.getElementById('task-list-container');

  const durPomodoroInput = document.getElementById('dur-pomodoro');
  const durShortInput = document.getElementById('dur-short');
  const durLongInput = document.getElementById('dur-long');
  const saveDurationsBtn = document.getElementById('save-durations-btn');
  const testSoundBtn = document.getElementById('test-sound-btn');

  const toast = document.getElementById('toast');
  const toastText = document.getElementById('toast-text');

  // Constants
  const CIRCLE_RADIUS = 130;
  const CIRCLE_CIRCUMFERENCE = 2 * Math.PI * CIRCLE_RADIUS; // ~816.814

  // Audio Context (Synthesizer Chime)
  let audioCtx = null;
  let isSoundEnabled = true;

  function initAudioContext() {
    if (!audioCtx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) {
        audioCtx = new AudioCtx();
      }
    }
    if (audioCtx && audioCtx.state === 'suspended') {
      audioCtx.resume();
    }
  }

  function playPleasantChime() {
    if (!isSoundEnabled) return;
    try {
      initAudioContext();
      if (!audioCtx) return;

      const now = audioCtx.currentTime;
      // Melodic arpeggio: C5 (523.25), E5 (659.25), G5 (783.99), C6 (1046.50)
      const notes = [523.25, 659.25, 783.99, 1046.50];

      notes.forEach((freq, idx) => {
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + idx * 0.12);

        // Gentle envelope
        gain.gain.setValueAtTime(0.001, now + idx * 0.12);
        gain.gain.exponentialRampToValueAtTime(0.25, now + idx * 0.12 + 0.04);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + idx * 0.12 + 0.9);

        osc.connect(gain);
        gain.connect(audioCtx.destination);

        osc.start(now + idx * 0.12);
        osc.stop(now + idx * 0.12 + 1.0);
      });
    } catch (e) {
      console.warn('Audio playback error:', e);
    }
  }

  // Toast Helper
  let toastTimer = null;
  function showToast(msg) {
    if (toastTimer) clearTimeout(toastTimer);
    toastText.textContent = msg;
    toast.classList.add('show');
    toastTimer = setTimeout(() => {
      toast.classList.remove('show');
    }, 2800);
  }

  // State
  let durations = {
    pomodoro: 25,
    shortBreak: 5,
    longBreak: 15
  };

  let currentMode = 'pomodoro'; // 'pomodoro' | 'shortBreak' | 'longBreak'
  let isRunning = false;
  let remainingSeconds = durations.pomodoro * 60;
  let totalSessionSeconds = durations.pomodoro * 60;
  let currentCycle = 1; // 1 to 4
  const TOTAL_CYCLES = 4;
  let timerInterval = null;
  let targetEndTime = null;

  // Local Storage Stats
  const todayDateKey = new Date().toISOString().slice(0, 10);
  let userStats = {
    date: todayDateKey,
    sessionsCompleted: 0,
    minutesFocused: 0,
    tasksFinished: 0
  };

  let tasks = [];
  let activeTaskId = null;

  // Load from LocalStorage
  function loadFromStorage() {
    try {
      const savedDurations = localStorage.getItem('pomodoro_durations');
      if (savedDurations) {
        durations = JSON.parse(savedDurations);
        durPomodoroInput.value = durations.pomodoro;
        durShortInput.value = durations.shortBreak;
        durLongInput.value = durations.longBreak;
      }

      const savedStats = localStorage.getItem('pomodoro_stats');
      if (savedStats) {
        const parsed = JSON.parse(savedStats);
        if (parsed.date === todayDateKey) {
          userStats = parsed;
        }
      }

      const savedTasks = localStorage.getItem('pomodoro_tasks');
      if (savedTasks) {
        tasks = JSON.parse(savedTasks);
      }
    } catch (e) {
      console.warn('Error reading from storage:', e);
    }
  }

  function saveToStorage() {
    try {
      localStorage.setItem('pomodoro_durations', JSON.stringify(durations));
      localStorage.setItem('pomodoro_stats', JSON.stringify(userStats));
      localStorage.setItem('pomodoro_tasks', JSON.stringify(tasks));
    } catch (e) {
      console.warn('Error saving storage:', e);
    }
  }

  // Timer Calculations & UI Updates
  function getModeDurationSeconds(mode) {
    return (durations[mode] || 25) * 60;
  }

  function updateModeLabels() {
    tabPomodoro.textContent = `Focus (${durations.pomodoro}m)`;
    tabShortBreak.textContent = `Short Break (${durations.shortBreak}m)`;
    tabLongBreak.textContent = `Long Break (${durations.longBreak}m)`;

    if (currentMode === 'pomodoro') {
      timerBadgeLabel.textContent = 'Focus Session';
      timerProgressRing.style.stroke = 'var(--accent)';
    } else if (currentMode === 'shortBreak') {
      timerBadgeLabel.textContent = 'Short Rest';
      timerProgressRing.style.stroke = 'var(--success)';
    } else {
      timerBadgeLabel.textContent = 'Long Restoration';
      timerProgressRing.style.stroke = '#8b5cf6';
    }
  }

  function formatTime(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  }

  function updateDisplay() {
    timerDisplay.textContent = formatTime(remainingSeconds);

    // Update SVG Circle Progress Ring
    const progressFraction = totalSessionSeconds > 0 ? (remainingSeconds / totalSessionSeconds) : 0;
    const offset = CIRCLE_CIRCUMFERENCE * (1 - progressFraction);
    timerProgressRing.style.strokeDashoffset = offset;

    // Browser Tab Title
    const modeName = currentMode === 'pomodoro' ? 'Focus' : 'Break';
    document.title = isRunning 
      ? `(${formatTime(remainingSeconds)}) ${modeName} - Pomodoro Timer`
      : 'Pomodoro Focus Timer - Free Online Tool - ALL IN ONE';

    // Active Task hint
    const activeTask = tasks.find(t => t.id === activeTaskId);
    if (activeTask) {
      timerActiveTaskName.textContent = `Task: ${activeTask.title}`;
    } else {
      timerActiveTaskName.textContent = 'No active task selected';
    }

    renderCycleDots();
    renderStats();
  }

  function renderCycleDots() {
    cycleLabel.textContent = `Session: ${currentCycle} of ${TOTAL_CYCLES}`;
    cycleDotsContainer.innerHTML = '';
    for (let i = 1; i <= TOTAL_CYCLES; i++) {
      const dot = document.createElement('div');
      dot.className = 'cycle-dot';
      if (i < currentCycle) {
        dot.classList.add('completed');
      } else if (i === currentCycle) {
        dot.classList.add('current');
      }
      cycleDotsContainer.appendChild(dot);
    }
  }

  function renderStats() {
    statSessionsToday.textContent = userStats.sessionsCompleted;
    statMinutesToday.textContent = `${userStats.minutesFocused}m`;
    statTasksDone.textContent = userStats.tasksFinished;
  }

  // Timer Tick Action
  function tick() {
    if (!isRunning) return;

    const now = Date.now();
    const diff = Math.max(0, Math.round((targetEndTime - now) / 1000));
    remainingSeconds = diff;

    updateDisplay();

    if (remainingSeconds <= 0) {
      completeSession();
    }
  }

  function startTimer() {
    initAudioContext();
    isRunning = true;
    targetEndTime = Date.now() + (remainingSeconds * 1000);

    toggleTimerBtn.classList.add('running');
    startBtnLabel.textContent = 'Pause';
    playIcon.style.display = 'none';
    pauseIcon.style.display = 'block';

    timerInterval = setInterval(tick, 250);
  }

  function pauseTimer() {
    isRunning = false;
    clearInterval(timerInterval);
    timerInterval = null;

    toggleTimerBtn.classList.remove('running');
    startBtnLabel.textContent = 'Resume';
    playIcon.style.display = 'block';
    pauseIcon.style.display = 'none';

    document.title = 'Pomodoro Focus Timer - Free Online Tool - ALL IN ONE';
  }

  function resetCurrentSession() {
    pauseTimer();
    startBtnLabel.textContent = 'Start Focus';
    totalSessionSeconds = getModeDurationSeconds(currentMode);
    remainingSeconds = totalSessionSeconds;
    updateDisplay();
  }

  function switchMode(newMode, autoStart = false) {
    pauseTimer();
    currentMode = newMode;

    tabPomodoro.classList.toggle('active', newMode === 'pomodoro');
    tabShortBreak.classList.toggle('active', newMode === 'shortBreak');
    tabLongBreak.classList.toggle('active', newMode === 'longBreak');

    totalSessionSeconds = getModeDurationSeconds(newMode);
    remainingSeconds = totalSessionSeconds;

    updateModeLabels();
    updateDisplay();

    if (autoStart) {
      startTimer();
    } else {
      startBtnLabel.textContent = newMode === 'pomodoro' ? 'Start Focus' : 'Start Break';
    }
  }

  function completeSession() {
    pauseTimer();
    playPleasantChime();

    if (currentMode === 'pomodoro') {
      userStats.sessionsCompleted++;
      userStats.minutesFocused += durations.pomodoro;

      if (activeTaskId) {
        const task = tasks.find(t => t.id === activeTaskId);
        if (task) task.pomodoros = (task.pomodoros || 0) + 1;
      }

      saveToStorage();

      if (currentCycle < TOTAL_CYCLES) {
        currentCycle++;
        showToast('Focus session complete! Time for a short break.');
        switchMode('shortBreak');
      } else {
        currentCycle = 1;
        showToast('4 focus sessions finished! Enjoy an extended restoration break.');
        switchMode('longBreak');
      }
    } else {
      showToast('Break finished! Ready to dive back in.');
      switchMode('pomodoro');
    }
  }

  // Skip Session
  function skipSession() {
    pauseTimer();
    if (confirm('Skip to the next session?')) {
      if (currentMode === 'pomodoro') {
        if (currentCycle < TOTAL_CYCLES) {
          currentCycle++;
          switchMode('shortBreak');
        } else {
          currentCycle = 1;
          switchMode('longBreak');
        }
      } else {
        switchMode('pomodoro');
      }
    }
  }

  // --- Task Manager ---
  function renderTasks() {
    taskListContainer.innerHTML = '';
    if (tasks.length === 0) {
      taskListContainer.innerHTML = `<span style="font-size: 0.825rem; color: var(--text-tertiary); text-align: center; padding: 1rem 0;">No focus tasks added yet. Add your primary objective above.</span>`;
      return;
    }

    tasks.forEach(task => {
      const row = document.createElement('div');
      row.className = `task-item-row ${task.id === activeTaskId ? 'is-active' : ''} ${task.completed ? 'is-completed' : ''}`;

      row.innerHTML = `
        <div style="display: flex; align-items: center; gap: 0.5rem; flex: 1; min-width: 0;">
          <input type="checkbox" class="task-checkbox" ${task.completed ? 'checked' : ''} title="Mark done">
          <span class="task-title-text" style="font-size: 0.85rem; font-weight: 600; cursor: pointer; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${task.title}</span>
        </div>
        <div style="display: flex; align-items: center; gap: 0.5rem; flex-shrink: 0;">
          <span class="badge" style="font-size: 0.7rem; padding: 0.15rem 0.45rem;">${task.pomodoros || 0} 🍅</span>
          <button class="task-delete-btn" style="background: none; border: none; color: var(--text-tertiary); cursor: pointer; padding: 0.2rem;" title="Remove task">
            <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
          </button>
        </div>
      `;

      // Select active task
      row.querySelector('.task-title-text').addEventListener('click', () => {
        activeTaskId = task.id;
        renderTasks();
        updateDisplay();
        showToast(`Focus set to: ${task.title}`);
      });

      // Checkbox completion
      row.querySelector('.task-checkbox').addEventListener('change', (e) => {
        task.completed = e.target.checked;
        if (task.completed) {
          userStats.tasksFinished++;
        } else {
          userStats.tasksFinished = Math.max(0, userStats.tasksFinished - 1);
        }
        saveToStorage();
        renderTasks();
        updateDisplay();
      });

      // Delete task
      row.querySelector('.task-delete-btn').addEventListener('click', () => {
        if (task.id === activeTaskId) activeTaskId = null;
        tasks = tasks.filter(t => t.id !== task.id);
        saveToStorage();
        renderTasks();
        updateDisplay();
      });

      taskListContainer.appendChild(row);
    });
  }

  addTaskForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const title = newTaskInput.value.trim();
    if (!title) return;

    const newTask = {
      id: 'task-' + Date.now(),
      title: title,
      pomodoros: 0,
      completed: false
    };

    tasks.push(newTask);
    if (!activeTaskId) activeTaskId = newTask.id;

    newTaskInput.value = '';
    saveToStorage();
    renderTasks();
    updateDisplay();
    showToast('Task added to focus list!');
  });

  // --- Button & Tab Listeners ---
  tabPomodoro.addEventListener('click', () => switchMode('pomodoro'));
  tabShortBreak.addEventListener('click', () => switchMode('shortBreak'));
  tabLongBreak.addEventListener('click', () => switchMode('longBreak'));

  toggleTimerBtn.addEventListener('click', () => {
    if (isRunning) {
      pauseTimer();
    } else {
      startTimer();
    }
  });

  resetBtn.addEventListener('click', () => {
    resetCurrentSession();
    showToast('Session timer reset');
  });

  skipBtn.addEventListener('click', () => {
    skipSession();
  });

  soundToggleBtn.addEventListener('click', () => {
    isSoundEnabled = !isSoundEnabled;
    soundOnIcon.style.display = isSoundEnabled ? 'block' : 'none';
    soundOffIcon.style.display = isSoundEnabled ? 'none' : 'block';
    showToast(isSoundEnabled ? 'Sound chime enabled' : 'Sound chime muted');
  });

  testSoundBtn.addEventListener('click', () => {
    playPleasantChime();
    showToast('Playing chime preview');
  });

  saveDurationsBtn.addEventListener('click', () => {
    const pomM = parseInt(durPomodoroInput.value, 10);
    const shortM = parseInt(durShortInput.value, 10);
    const longM = parseInt(durLongInput.value, 10);

    if (pomM > 0 && shortM > 0 && longM > 0) {
      durations.pomodoro = pomM;
      durations.shortBreak = shortM;
      durations.longBreak = longM;
      saveToStorage();
      updateModeLabels();
      resetCurrentSession();
      showToast('Updated timer durations saved!');
    }
  });

  // Initialize
  loadFromStorage();
  updateModeLabels();
  totalSessionSeconds = getModeDurationSeconds('pomodoro');
  remainingSeconds = totalSessionSeconds;
  renderTasks();
  updateDisplay();
});