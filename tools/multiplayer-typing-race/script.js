// Multiplayer Typing Race - Virtual Rooms & Split-Screen Duel Engine

const SAMPLE_TEXTS = [
  "Speed is not merely a matter of swift fingers, but of rhythm, focus, and quiet calm under intense pressure. As contenders surge down the digital speedway, precision turns raw velocity into undisputed victory. Breathe smoothly, lock onto the upcoming words, and let muscle memory guide every keystroke.",
  "In the arena of competitive typing, microsecond decisions determine who claims the winner podium. The fastest typists in the world do not rush blindly; they anticipate character sequences ahead of time, maintaining fluid cadence across complex punctuation and tricky letter combinations.",
  "Distributed networks connect drivers across distant time zones into synchronized digital circuits. Packets travel across undersea fiber cables within milliseconds, rendering real-time telemetry, position updates, and split-second finishes on the global stage.",
  "Cybernetic velocity pulses through the circuit as neon cityscapes rush past in a blur of indigo and amber light. Every transition from one phrase to the next demands flawless execution. Hold the racing line, accelerate through the straights, and leave hesitation behind."
];

const MOCK_CONTENDERS_POOL = [
  { name: 'TokyoDrift_99', flag: '🇯🇵', avatar: '🏎️', baseWpm: 72, ping: 28 },
  { name: 'NeonKnight', flag: '🇩🇪', avatar: '⚡', baseWpm: 84, ping: 34 },
  { name: 'QuantumKeys', flag: '🇺🇸', avatar: '🚀', baseWpm: 65, ping: 42 },
  { name: 'PixelPilot', flag: '🇬🇧', avatar: '🛸', baseWpm: 58, ping: 22 },
  { name: 'VelocityQueen', flag: '🇨🇦', avatar: '🏁', baseWpm: 92, ping: 38 },
  { name: 'CyberSamurai', flag: '🇰🇷', avatar: '⚔️', baseWpm: 78, ping: 45 },
  { name: 'ApexStriker', flag: '🇫🇷', avatar: '🦅', baseWpm: 62, ping: 31 }
];

class MultiplayerRaceManager {
  constructor() {
    this.currentMode = 'room'; // 'room' or 'duel'
    this.roomCode = this.generateRoomCode();
    this.wordLength = 50;

    // Room State
    this.roomStatus = 'lobby'; // 'lobby', 'countdown', 'racing', 'finished'
    this.racers = [];
    this.targetText = '';
    this.charElements = [];
    this.playerCharIndex = 0;
    this.playerTypedTotal = 0;
    this.playerCorrectTotal = 0;
    this.playerErrors = 0;
    this.raceStartTime = null;
    this.raceTimer = null;
    this.driftTimer = null;

    // Duel State
    this.duelStatus = 'idle';
    this.duelText = '';
    this.p1 = { idx: 0, total: 0, correct: 0, finished: false, finishTime: null };
    this.p2 = { idx: 0, total: 0, correct: 0, finished: false, finishTime: null };
    this.duelStartTime = null;
    this.duelTimer = null;

    this.initDom();
    this.initRacers();
    this.bindEvents();
    this.renderLobby();
  }

  generateRoomCode() {
    const num = Math.floor(100 + Math.random() * 900);
    return `#SPEED-${num}`;
  }

  initDom() {
    // Mode tabs
    this.tabRoom = document.getElementById('tabRoomMode');
    this.tabDuel = document.getElementById('tabDuelMode');
    this.roomSection = document.getElementById('roomModeSection');
    this.duelSection = document.getElementById('duelModeSection');

    // Lobby
    this.lobbyView = document.getElementById('lobbyView');
    this.roomCodeDisplay = document.getElementById('roomCodeDisplay');
    this.copyRoomCodeBtn = document.getElementById('copyRoomCodeBtn');
    this.createRoomBtn = document.getElementById('createRoomBtn');
    this.trackLengthSelect = document.getElementById('trackLengthSelect');
    this.addBotBtn = document.getElementById('addBotBtn');
    this.lobbyStartBtn = document.getElementById('lobbyStartBtn');
    this.racersGrid = document.getElementById('racersGrid');
    this.racerCountEl = document.getElementById('racerCount');

    // Arena
    this.roomRaceArena = document.getElementById('roomRaceArena');
    this.mpLanesWrapper = document.getElementById('mpLanesWrapper');
    this.mpWordsBox = document.getElementById('mpWordsBox');
    this.mpWordsWrapper = document.getElementById('mpWordsWrapper');
    this.mpHiddenInput = document.getElementById('mpHiddenInput');
    this.mpCountdownModal = document.getElementById('mpCountdownModal');
    this.mpCountdownNum = document.getElementById('mpCountdownNum');

    // Live Telemetry
    this.mpLiveRank = document.getElementById('mpLiveRank');
    this.mpLiveWpm = document.getElementById('mpLiveWpm');
    this.mpLiveAcc = document.getElementById('mpLiveAcc');
    this.mpLiveProg = document.getElementById('mpLiveProg');

    // Results
    this.roomResultsCard = document.getElementById('roomResultsCard');
    this.mpResultsTbody = document.getElementById('mpResultsTbody');
    this.mpRematchBtn = document.getElementById('mpRematchBtn');
    this.mpBackToLobbyBtn = document.getElementById('mpBackToLobbyBtn');

    // Duel Elements
    this.startDuelBtn = document.getElementById('startDuelBtn');
    this.p1WordsWrapper = document.getElementById('p1WordsWrapper');
    this.p2WordsWrapper = document.getElementById('p2WordsWrapper');
    this.p1Input = document.getElementById('p1Input');
    this.p2Input = document.getElementById('p2Input');
    this.p1Wpm = document.getElementById('p1Wpm');
    this.p1Acc = document.getElementById('p1Acc');
    this.p1Time = document.getElementById('p1Time');
    this.p2Wpm = document.getElementById('p2Wpm');
    this.p2Acc = document.getElementById('p2Acc');
    this.p2Time = document.getElementById('p2Time');
    this.p1Badge = document.getElementById('p1StatusBadge');
    this.p2Badge = document.getElementById('p2StatusBadge');
  }

  initRacers() {
    this.racers = [
      {
        id: 'player',
        name: 'YOU (Host)',
        flag: '🌍',
        avatar: '🏎️',
        isYou: true,
        isReady: true,
        baseWpm: 75,
        currentWpm: 0,
        progress: 0,
        finished: false,
        finishTime: null,
        ping: 18,
        color: '#38bdf8'
      }
    ];

    // Pick 3 initial simulated contenders
    const shuffled = [...MOCK_CONTENDERS_POOL].sort(() => 0.5 - Math.random());
    const colors = ['#10b981', '#f59e0b', '#ec4899', '#8b5cf6', '#ef4444'];
    for (let i = 0; i < 3; i++) {
      const c = shuffled[i];
      this.racers.push({
        id: `bot_${i}`,
        name: c.name,
        flag: c.flag,
        avatar: c.avatar,
        isYou: false,
        isReady: true,
        baseWpm: c.baseWpm,
        currentWpm: c.baseWpm,
        progress: 0,
        finished: false,
        finishTime: null,
        ping: c.ping,
        color: colors[i % colors.length]
      });
    }
  }

  bindEvents() {
    // Mode tabs
    this.tabRoom.addEventListener('click', () => this.switchMode('room'));
    this.tabDuel.addEventListener('click', () => this.switchMode('duel'));

    // Lobby buttons
    this.createRoomBtn.addEventListener('click', () => {
      this.roomCode = this.generateRoomCode();
      this.roomCodeDisplay.textContent = `ROOM: ${this.roomCode}`;
      this.initRacers();
      this.renderLobby();
    });

    this.copyRoomCodeBtn.addEventListener('click', () => {
      navigator.clipboard.writeText(this.roomCode).then(() => {
        const orig = this.copyRoomCodeBtn.textContent;
        this.copyRoomCodeBtn.textContent = '✓ Copied!';
        setTimeout(() => { this.copyRoomCodeBtn.textContent = orig; }, 1500);
      }).catch(() => {});
    });

    this.addBotBtn.addEventListener('click', () => {
      if (this.racers.length >= 6) {
        alert('Room is full (Maximum 6 racers allowed).');
        return;
      }
      const existingNames = new Set(this.racers.map(r => r.name));
      const pool = MOCK_CONTENDERS_POOL.filter(p => !existingNames.has(p.name));
      if (pool.length > 0) {
        const candidate = pool[Math.floor(Math.random() * pool.length)];
        const colors = ['#10b981', '#f59e0b', '#ec4899', '#8b5cf6', '#ef4444', '#14b8a6'];
        this.racers.push({
          id: `bot_${Date.now()}`,
          name: candidate.name,
          flag: candidate.flag,
          avatar: candidate.avatar,
          isYou: false,
          isReady: true,
          baseWpm: candidate.baseWpm,
          currentWpm: candidate.baseWpm,
          progress: 0,
          finished: false,
          finishTime: null,
          ping: candidate.ping,
          color: colors[this.racers.length % colors.length]
        });
        this.renderLobby();
      }
    });

    this.trackLengthSelect.addEventListener('change', (e) => {
      this.wordLength = parseInt(e.target.value, 10);
    });

    this.lobbyStartBtn.addEventListener('click', () => {
      this.startRoomRace();
    });

    // Chat reactions
    document.querySelectorAll('#reactionButtons button').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const reaction = e.currentTarget.dataset.reaction;
        this.triggerReaction(reaction);
      });
    });

    // Typing box focus & input
    this.mpWordsBox.addEventListener('click', () => {
      if (this.roomStatus === 'racing') this.mpHiddenInput.focus();
    });
    this.mpHiddenInput.addEventListener('input', (e) => this.handleRoomTyping(e));

    // Post-race buttons
    this.mpRematchBtn.addEventListener('click', () => {
      this.roomResultsCard.style.display = 'none';
      this.startRoomRace();
    });
    this.mpBackToLobbyBtn.addEventListener('click', () => {
      this.roomResultsCard.style.display = 'none';
      this.roomRaceArena.style.display = 'none';
      this.lobbyView.style.display = 'block';
      this.roomStatus = 'lobby';
      this.renderLobby();
    });

    // Duel Buttons & Inputs
    this.startDuelBtn.addEventListener('click', () => this.startDuel());
    this.p1Input.addEventListener('input', (e) => this.handleDuelInput('p1', e));
    this.p2Input.addEventListener('input', (e) => this.handleDuelInput('p2', e));
  }

  switchMode(mode) {
    this.currentMode = mode;
    if (mode === 'room') {
      this.tabRoom.classList.add('active');
      this.tabDuel.classList.remove('active');
      this.roomSection.style.display = 'block';
      this.duelSection.style.display = 'none';
    } else {
      this.tabRoom.classList.remove('active');
      this.tabDuel.classList.add('active');
      this.roomSection.style.display = 'none';
      this.duelSection.style.display = 'block';
      this.setupDuelText();
    }
  }

  triggerReaction(reaction) {
    // Show temporary floating reaction on player's card
    const playerCard = document.querySelector('.racer-card.is-you');
    if (playerCard) {
      const bubble = document.createElement('div');
      bubble.style.position = 'absolute';
      bubble.style.top = '-15px';
      bubble.style.right = '10px';
      bubble.style.fontSize = '1.5rem';
      bubble.style.animation = 'floatUp 0.8s ease-out forwards';
      bubble.textContent = reaction;
      playerCard.appendChild(bubble);
      setTimeout(() => bubble.remove(), 800);
    }
  }

  renderLobby() {
    this.roomCodeDisplay.textContent = `ROOM: ${this.roomCode}`;
    this.racerCountEl.textContent = this.racers.length;
    this.racersGrid.innerHTML = '';

    this.racers.forEach(r => {
      const card = document.createElement('div');
      card.className = `racer-card ${r.isYou ? 'is-you' : ''} ${r.isReady ? 'is-ready' : ''}`;
      card.innerHTML = `
        <div class="racer-avatar">${r.avatar}</div>
        <div class="racer-meta">
          <div class="racer-name">${r.name} ${r.flag}</div>
          <div class="racer-subtext">
            <span class="ping-dot"></span> ${r.ping}ms
            <span>• Base: ${r.baseWpm} WPM</span>
          </div>
        </div>
        <span class="badge" style="background: rgba(16, 185, 129, 0.15); color: var(--success); font-size: 0.65rem;">READY</span>
      `;
      this.racersGrid.appendChild(card);
    });
  }

  // --- VIRTUAL ROOM RACE EXECUTION ---
  startRoomRace() {
    this.lobbyView.style.display = 'none';
    this.roomResultsCard.style.display = 'none';
    this.roomRaceArena.style.display = 'flex';
    this.roomStatus = 'countdown';

    // Reset racers
    this.racers.forEach(r => {
      r.progress = 0;
      r.currentWpm = r.isYou ? 0 : r.baseWpm;
      r.finished = false;
      r.finishTime = null;
    });

    this.playerCharIndex = 0;
    this.playerTypedTotal = 0;
    this.playerCorrectTotal = 0;
    this.playerErrors = 0;

    this.prepareText();
    this.renderTrackLanes();
    this.renderRoomWords();

    // Start 3-2-1 Countdown
    this.mpCountdownModal.classList.add('active');
    let count = 3;
    this.mpCountdownNum.textContent = count;

    const countInt = setInterval(() => {
      count--;
      if (count > 0) {
        this.mpCountdownNum.textContent = count;
      } else if (count === 0) {
        this.mpCountdownNum.textContent = 'GO!';
      } else {
        clearInterval(countInt);
        this.mpCountdownModal.classList.remove('active');
        this.beginRoomRacing();
      }
    }, 800);
  }

  prepareText() {
    const raw = SAMPLE_TEXTS[Math.floor(Math.random() * SAMPLE_TEXTS.length)];
    const words = raw.split(/\s+/);
    if (words.length > this.wordLength) {
      this.targetText = words.slice(0, this.wordLength).join(' ');
    } else {
      let repeated = words.slice();
      while (repeated.length < this.wordLength) {
        repeated = repeated.concat(words);
      }
      this.targetText = repeated.slice(0, this.wordLength).join(' ');
    }
  }

  renderTrackLanes() {
    this.mpLanesWrapper.innerHTML = '';
    this.racers.forEach(r => {
      const lane = document.createElement('div');
      lane.className = `mp-track-lane ${r.isYou ? 'is-you' : ''}`;
      lane.id = `lane_${r.id}`;

      lane.innerHTML = `
        <div class="mp-lane-info">
          <span>${r.avatar} ${r.name}</span>
          <span id="lane_wpm_${r.id}" style="color: var(--text-tertiary); font-size: 0.65rem;">(${r.currentWpm} WPM)</span>
          <span id="lane_rank_${r.id}" class="badge" style="background: var(--bg-tertiary); font-size: 0.6rem;">-</span>
        </div>
        <div class="mp-car-node" id="car_${r.id}">
          <svg viewBox="0 0 50 25" fill="none" style="width: 100%; height: 100%;">
            <path d="M4 17 L12 8 L38 8 L46 17 L48 20 L2 20 Z" fill="${r.color}" />
            <circle cx="12" cy="20" r="4" fill="#111" stroke="#fff" stroke-width="1.5" />
            <circle cx="38" cy="20" r="4" fill="#111" stroke="#fff" stroke-width="1.5" />
          </svg>
        </div>
      `;
      this.mpLanesWrapper.appendChild(lane);
    });
  }

  renderRoomWords() {
    this.mpWordsWrapper.innerHTML = '';
    this.charElements = [];
    const words = this.targetText.split(' ');
    let globalIdx = 0;

    words.forEach((w, wIdx) => {
      const wordSpan = document.createElement('span');
      wordSpan.style.display = 'inline-block';
      wordSpan.style.marginRight = '0.55em';

      for (let i = 0; i < w.length; i++) {
        const cSpan = document.createElement('span');
        cSpan.className = 'mp-char';
        cSpan.textContent = w[i];
        if (globalIdx === 0) cSpan.classList.add('active');
        wordSpan.appendChild(cSpan);
        this.charElements.push(cSpan);
        globalIdx++;
      }

      if (wIdx < words.length - 1) {
        const sSpan = document.createElement('span');
        sSpan.className = 'mp-char';
        sSpan.textContent = ' ';
        wordSpan.appendChild(sSpan);
        this.charElements.push(sSpan);
        globalIdx++;
      }

      this.mpWordsWrapper.appendChild(wordSpan);
    });
  }

  beginRoomRacing() {
    this.roomStatus = 'racing';
    this.raceStartTime = performance.now();
    this.mpHiddenInput.value = '';
    this.mpHiddenInput.focus();

    // Main tick timer
    this.raceTimer = setInterval(() => this.roomTick(), 100);
  }

  roomTick() {
    if (this.roomStatus !== 'racing') return;
    const elapsedSec = (performance.now() - this.raceStartTime) / 1000;
    const totalChars = this.targetText.length;

    let allFinished = true;

    // Simulate WPM Drift for each bot
    this.racers.forEach(r => {
      if (r.isYou) {
        const wordsTyped = this.playerCorrectTotal / 5;
        const minutes = Math.max(0.01, elapsedSec / 60);
        r.currentWpm = Math.round(wordsTyped / minutes);
        r.progress = Math.min(100, (this.playerCharIndex / totalChars) * 100);
        if (r.progress >= 100 && !r.finished) {
          r.finished = true;
          r.finishTime = elapsedSec;
        }
        if (!r.finished) allFinished = false;
      } else {
        if (!r.finished) {
          // Dynamic WPM drift: micro variations (+/- 14 WPM) with harmonic oscillation
          const drift = Math.sin(elapsedSec * 1.5 + r.baseWpm) * 9 + (Math.random() * 6 - 3);
          r.currentWpm = Math.max(20, Math.round(r.baseWpm + drift));

          const charsPerSec = (r.currentWpm * 5) / 60;
          const simChars = charsPerSec * elapsedSec;
          r.progress = Math.min(100, (simChars / totalChars) * 100);

          if (r.progress >= 100) {
            r.finished = true;
            r.finishTime = elapsedSec;
          } else {
            allFinished = false;
          }
        }
      }
    });

    this.updateRoomTrackLanes();
    this.updateRoomTelemetry();

    if (allFinished) {
      this.finishRoomRace();
    }
  }

  updateRoomTrackLanes() {
    const trackWidth = this.mpTrack.clientWidth - 90;
    const maxTranslate = Math.max(80, trackWidth);

    // Compute live ranks
    const sorted = [...this.racers].sort((a, b) => {
      if (a.finished && b.finished) return a.finishTime - b.finishTime;
      if (a.finished) return -1;
      if (b.finished) return 1;
      return b.progress - a.progress;
    });

    this.racers.forEach(r => {
      const car = document.getElementById(`car_${r.id}`);
      if (car) {
        const transX = (r.progress / 100) * maxTranslate;
        car.style.transform = `translateX(${transX}px)`;
      }

      const wpmEl = document.getElementById(`lane_wpm_${r.id}`);
      if (wpmEl) wpmEl.textContent = `(${r.currentWpm} WPM)`;

      const rankIndex = sorted.findIndex(s => s.id === r.id);
      const rankEl = document.getElementById(`lane_rank_${r.id}`);
      const suffixes = ['1st', '2nd', '3rd', '4th', '5th', '6th'];
      if (rankEl) {
        rankEl.textContent = suffixes[rankIndex] || `${rankIndex + 1}th`;
        if (rankIndex === 0) {
          rankEl.style.background = '#eab308';
          rankEl.style.color = '#000';
        } else {
          rankEl.style.background = 'var(--bg-tertiary)';
          rankEl.style.color = 'var(--text-secondary)';
        }
      }

      if (r.isYou) {
        this.mpLiveRank.textContent = suffixes[rankIndex] || `${rankIndex + 1}th`;
        this.mpLiveRank.style.color = rankIndex === 0 ? '#eab308' : '#38bdf8';
      }
    });
  }

  updateRoomTelemetry() {
    const elapsedSec = (performance.now() - this.raceStartTime) / 1000;
    const minutes = Math.max(0.01, elapsedSec / 60);
    const wpm = Math.round((this.playerCorrectTotal / 5) / minutes);
    this.mpLiveWpm.textContent = wpm;

    const acc = this.playerTypedTotal > 0 ? Math.round((this.playerCorrectTotal / this.playerTypedTotal) * 100) : 100;
    this.mpLiveAcc.textContent = `${acc}%`;

    const prog = Math.round((this.playerCharIndex / this.targetText.length) * 100);
    this.mpLiveProg.textContent = `${prog}%`;
  }

  handleRoomTyping(e) {
    if (this.roomStatus !== 'racing') return;
    const val = this.mpHiddenInput.value;
    if (!val) return;

    const char = val.slice(-1);
    this.mpHiddenInput.value = '';
    this.playerTypedTotal++;

    const expected = this.targetText[this.playerCharIndex];

    if (char === expected) {
      this.playerCorrectTotal++;
      if (this.charElements[this.playerCharIndex]) {
        this.charElements[this.playerCharIndex].className = 'mp-char correct';
      }
      this.playerCharIndex++;

      if (this.playerCharIndex >= this.targetText.length) {
        const playerRacer = this.racers.find(r => r.isYou);
        playerRacer.finished = true;
        playerRacer.finishTime = (performance.now() - this.raceStartTime) / 1000;
        playerRacer.progress = 100;
      } else {
        if (this.charElements[this.playerCharIndex]) {
          this.charElements[this.playerCharIndex].classList.add('active');
          this.ensureVisible(this.charElements[this.playerCharIndex]);
        }
      }
    } else {
      this.playerErrors++;
      if (this.charElements[this.playerCharIndex]) {
        this.charElements[this.playerCharIndex].className = 'mp-char incorrect active';
      }
    }
  }

  ensureVisible(el) {
    if (!el) return;
    const parentRect = this.mpWordsBox.getBoundingClientRect();
    const elRect = el.getBoundingClientRect();
    if (elRect.bottom > parentRect.bottom - 20) {
      this.mpWordsBox.scrollTop += 45;
    }
  }

  finishRoomRace() {
    this.roomStatus = 'finished';
    if (this.raceTimer) clearInterval(this.raceTimer);

    // Populate Results Table
    const sorted = [...this.racers].sort((a, b) => (a.finishTime || 999) - (b.finishTime || 999));
    this.mpResultsTbody.innerHTML = '';

    const medals = ['🥇 1st', '🥈 2nd', '🥉 3rd', '4th', '5th', '6th'];

    sorted.forEach((r, idx) => {
      const row = document.createElement('tr');
      row.style.borderBottom = '1px solid var(--border)';
      if (r.isYou) {
        row.style.background = 'rgba(78, 133, 191, 0.1)';
        row.style.fontWeight = '700';
      }

      const accStr = r.isYou ? `${Math.round((this.playerCorrectTotal / Math.max(1, this.playerTypedTotal)) * 100)}%` : '97%';
      const timeStr = r.finishTime ? `${r.finishTime.toFixed(2)}s` : 'DNF';

      row.innerHTML = `
        <td style="padding: 0.75rem 1rem;">${medals[idx] || `${idx + 1}th`}</td>
        <td style="padding: 0.75rem 1rem;">${r.avatar} ${r.name} ${r.flag}</td>
        <td style="padding: 0.75rem 1rem;">${timeStr}</td>
        <td style="padding: 0.75rem 1rem;">${r.currentWpm} WPM</td>
        <td style="padding: 0.75rem 1rem;">${accStr}</td>
        <td style="padding: 0.75rem 1rem;">
          <span class="badge" style="background: ${idx === 0 ? 'rgba(234, 179, 8, 0.2)' : 'rgba(255,255,255,0.06)'}; color: ${idx === 0 ? '#eab308' : 'var(--text-secondary)'};">
            ${idx === 0 ? 'WINNER 🏆' : 'Finished'}
          </span>
        </td>
      `;
      this.mpResultsTbody.appendChild(row);
    });

    this.roomResultsCard.style.display = 'block';
  }

  // --- LOCAL SPLIT DUEL EXECUTION ---
  setupDuelText() {
    this.duelText = "Two rivals line up at the starting line ready for an intense typing showdown. Speed and focus will crown the ultimate champion!";
    this.p1WordsWrapper.textContent = this.duelText;
    this.p2WordsWrapper.textContent = this.duelText;
  }

  startDuel() {
    this.setupDuelText();
    this.duelStatus = 'active';
    this.p1 = { idx: 0, total: 0, correct: 0, finished: false, finishTime: null };
    this.p2 = { idx: 0, total: 0, correct: 0, finished: false, finishTime: null };
    this.p1Input.value = '';
    this.p2Input.value = '';
    this.p1Badge.textContent = 'Racing...';
    this.p2Badge.textContent = 'Racing...';
    this.p1Badge.style.color = '#38bdf8';
    this.p2Badge.style.color = '#f43f5e';

    this.duelStartTime = performance.now();
    this.p1Input.focus();

    if (this.duelTimer) clearInterval(this.duelTimer);
    this.duelTimer = setInterval(() => this.duelTick(), 100);
  }

  duelTick() {
    if (this.duelStatus !== 'active') return;
    const elapsed = (performance.now() - this.duelStartTime) / 1000;
    const minutes = Math.max(0.01, elapsed / 60);

    if (!this.p1.finished) {
      this.p1Time.textContent = `${elapsed.toFixed(1)}s`;
      const p1W = Math.round((this.p1.correct / 5) / minutes);
      this.p1Wpm.textContent = `${p1W} WPM`;
      const p1A = this.p1.total > 0 ? Math.round((this.p1.correct / this.p1.total) * 100) : 100;
      this.p1Acc.textContent = `${p1A}%`;
    }

    if (!this.p2.finished) {
      this.p2Time.textContent = `${elapsed.toFixed(1)}s`;
      const p2W = Math.round((this.p2.correct / 5) / minutes);
      this.p2Wpm.textContent = `${p2W} WPM`;
      const p2A = this.p2.total > 0 ? Math.round((this.p2.correct / this.p2.total) * 100) : 100;
      this.p2Acc.textContent = `${p2A}%`;
    }

    if (this.p1.finished && this.p2.finished) {
      this.finishDuel();
    }
  }

  handleDuelInput(playerKey, e) {
    if (this.duelStatus !== 'active') return;
    const player = playerKey === 'p1' ? this.p1 : this.p2;
    const inputEl = playerKey === 'p1' ? this.p1Input : this.p2Input;
    const val = inputEl.value;

    player.total = val.length;
    let correct = 0;
    for (let i = 0; i < val.length; i++) {
      if (val[i] === this.duelText[i]) correct++;
    }
    player.correct = correct;
    player.idx = val.length;

    if (val === this.duelText && !player.finished) {
      player.finished = true;
      player.finishTime = (performance.now() - this.duelStartTime) / 1000;
      const badge = playerKey === 'p1' ? this.p1Badge : this.p2Badge;
      badge.textContent = `Finished (${player.finishTime.toFixed(1)}s)`;
      badge.style.background = 'rgba(16, 185, 129, 0.2)';
      badge.style.color = '#10b981';

      if (this.p1.finished && this.p2.finished) {
        this.finishDuel();
      }
    }
  }

  finishDuel() {
    this.duelStatus = 'finished';
    if (this.duelTimer) clearInterval(this.duelTimer);

    let winner = 'Tie!';
    if (this.p1.finishTime < this.p2.finishTime) {
      winner = '🏆 Player 1 (Blue) Wins!';
    } else if (this.p2.finishTime < this.p1.finishTime) {
      winner = '🏆 Player 2 (Red) Wins!';
    }

    alert(`Duel Complete!\n${winner}\nPlayer 1: ${this.p1.finishTime ? this.p1.finishTime.toFixed(2) + 's' : 'DNF'}\nPlayer 2: ${this.p2.finishTime ? this.p2.finishTime.toFixed(2) + 's' : 'DNF'}`);
  }
}

document.addEventListener('DOMContentLoaded', () => {
  window.multiplayerRaceManager = new MultiplayerRaceManager();
});