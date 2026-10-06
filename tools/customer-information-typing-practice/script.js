// Customer Information Typing Practice - ERP & Data Entry Simulator

const FIRST_NAMES = ["Eleanor", "Marcus", "Sophia", "Liam", "Amara", "Lucas", "Maya", "Julian", "Aria", "Nathan", "Clara", "Ethan", "Zoe", "Oliver", "Elena", "Gabriel"];
const LAST_NAMES = ["Vance", "Chen", "Sterling", "Kovacs", "Moreno", "Thornton", "Nakamura", "Dubois", "Mercer", "Alvarez", "Sinclair", "Holloway", "Lindqvist", "Patel", "Gomez", "Kim"];
const COMPANIES = [
  "Apex Horizon Logistics", "Quantum BioLabs Inc", "Vanguard Global Systems", "Nexus Cloud Solutions",
  "Pinnacle Financial Advisory", "Aegis Maritime Corp", "Crestview Capital Partners", "Stratus Dynamics LLC",
  "Meridian Robotics Ltd", "OmniTech Global Services", "Beacon Media Network", "Solaris Renewable Energy",
  "Helix Biometrics Group", "Titan Industrial Supply", "Zenith Architecture Studio", "Astra Digital Holdings"
];
const STREETS = [
  "742 Evergreen Terrace", "1048 Lexington Avenue", "452 Market Street", "890 Grand Boulevard",
  "312 West End Avenue", "567 Pinehurst Road", "1204 Cambridge Court", "980 Industrial Parkway",
  "230 Silicon Valley Way", "615 Oakridge Drive", "410 Harbour View Way", "789 Skyline Parkway",
  "150 Michigan Boulevard", "824 Beacon Street", "305 Crescent Heights", "512 Sunset Plaza"
];
const CITIES = [
  { city: "Portland", zip: "97201" },
  { city: "Austin", zip: "78701" },
  { city: "Seattle", zip: "98101" },
  { city: "Denver", zip: "80202" },
  { city: "Boston", zip: "02108" },
  { city: "Atlanta", zip: "30303" },
  { city: "Chicago", zip: "60601" },
  { city: "San Francisco", zip: "94102" },
  { city: "Minneapolis", zip: "55401" },
  { city: "San Diego", zip: "92101" }
];

const FIELD_KEYS = ["fullName", "company", "email", "phone", "address", "postalCode", "accountId"];

// Audio feedback synthesizer
class ErpSoundSynth {
  constructor() {
    this.ctx = null;
    this.enabled = true;
  }

  init() {
    if (!this.ctx && typeof AudioContext !== 'undefined') {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      this.ctx = new AudioCtx();
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  click() {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;
    try {
      const t = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(540, t);
      osc.frequency.exponentialRampToValueAtTime(150, t + 0.03);
      gain.gain.setValueAtTime(0.04, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.03);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(t);
      osc.stop(t + 0.03);
    } catch {}
  }

  error() {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;
    try {
      const t = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(120, t);
      osc.frequency.exponentialRampToValueAtTime(60, t + 0.15);
      gain.gain.setValueAtTime(0.09, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.15);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(t);
      osc.stop(t + 0.15);
    } catch {}
  }

  successField() {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;
    try {
      const t = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(440, t);
      osc.frequency.exponentialRampToValueAtTime(880, t + 0.08);
      gain.gain.setValueAtTime(0.05, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.08);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(t);
      osc.stop(t + 0.08);
    } catch {}
  }
}

// Main ERP Data Entry Trainer
class CustomerTypingPractice {
  constructor() {
    this.sound = new ErpSoundSynth();
    this.batchSize = 5;
    this.strictMode = true;
    this.records = [];
    this.currentRecordIndex = 0;
    this.currentFieldIndex = 0;

    // Telemetry & metrics
    this.isRunning = false;
    this.timer = null;
    this.elapsedSeconds = 0;
    this.completedFields = 0;
    this.totalTypedChars = 0;
    this.correctChars = 0;
    this.errorCount = 0;

    this.dom = {
      batchSelector: document.getElementById('batchSelector'),
      strictModeCheck: document.getElementById('strictModeCheck'),
      soundToggleBtn: document.getElementById('soundToggleBtn'),
      resetBatchBtn: document.getElementById('resetBatchBtn'),

      fpmVal: document.getElementById('fpmVal'),
      accuracyVal: document.getElementById('accuracyVal'),
      errorsSub: document.getElementById('errorsSub'),
      recordProgressVal: document.getElementById('recordProgressVal'),
      stopwatchVal: document.getElementById('stopwatchVal'),
      completedFieldsVal: document.getElementById('completedFieldsVal'),
      batchProgressFill: document.getElementById('batchProgressFill'),

      // Dossier card items
      dossierAccountId: document.getElementById('dossierAccountId'),
      dossierFullName: document.getElementById('dossierFullName'),
      dossierCompany: document.getElementById('dossierCompany'),
      dossierEmail: document.getElementById('dossierEmail'),
      dossierPhone: document.getElementById('dossierPhone'),
      dossierAddress: document.getElementById('dossierAddress'),
      dossierPostalCode: document.getElementById('dossierPostalCode'),
      dossierAccountIdField: document.getElementById('dossierAccountIdField'),

      // Form inputs
      erpEntryForm: document.getElementById('erpEntryForm'),
      inputs: {
        fullName: document.getElementById('input_fullName'),
        company: document.getElementById('input_company'),
        email: document.getElementById('input_email'),
        phone: document.getElementById('input_phone'),
        address: document.getElementById('input_address'),
        postalCode: document.getElementById('input_postalCode'),
        accountId: document.getElementById('input_accountId')
      },

      // Leaderboard
      leaderboardTbody: document.getElementById('leaderboardTbody'),
      clearLeaderboardBtn: document.getElementById('clearLeaderboardBtn'),

      // Modal
      completionModal: document.getElementById('completionModal'),
      modalFinalFpm: document.getElementById('modalFinalFpm'),
      modalFinalTime: document.getElementById('modalFinalTime'),
      modalFinalAcc: document.getElementById('modalFinalAcc'),
      modalFinalMistakes: document.getElementById('modalFinalMistakes'),
      modalFinalRank: document.getElementById('modalFinalRank'),
      operatorNameInput: document.getElementById('operatorNameInput'),
      saveScoreBtn: document.getElementById('saveScoreBtn'),
      modalCloseBtn: document.getElementById('modalCloseBtn'),
      modalRestartBtn: document.getElementById('modalRestartBtn')
    };

    this.initEvents();
    this.renderLeaderboard();
    this.startNewBatch();
  }

  generateCustomerRecord() {
    const fn = FIRST_NAMES[Math.floor(Math.random() * FIRST_NAMES.length)];
    const ln = LAST_NAMES[Math.floor(Math.random() * LAST_NAMES.length)];
    const fullName = `${fn} ${ln}`;
    const company = COMPANIES[Math.floor(Math.random() * COMPANIES.length)];
    
    // Domain from company
    const cleanComp = company.toLowerCase().replace(/[^a-z0-9]/g, '').slice(0, 10);
    const email = `${fn[0].toLowerCase()}.${ln.toLowerCase()}@${cleanComp}.com`;

    const area = 200 + Math.floor(Math.random() * 700);
    const mid = 100 + Math.floor(Math.random() * 899);
    const last = 1000 + Math.floor(Math.random() * 8999);
    const phone = `(${area}) ${mid}-${last}`;

    const address = STREETS[Math.floor(Math.random() * STREETS.length)];
    const loc = CITIES[Math.floor(Math.random() * CITIES.length)];
    const postalCode = `${loc.zip} ${loc.city}`;

    const accNum = 10000 + Math.floor(Math.random() * 89999);
    const accountId = `AC-${accNum}`;

    return { fullName, company, email, phone, address, postalCode, accountId };
  }

  initEvents() {
    // Batch selector
    this.dom.batchSelector.addEventListener('click', (e) => {
      const btn = e.target.closest('.tst-pill-btn');
      if (!btn) return;
      this.dom.batchSelector.querySelectorAll('.tst-pill-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      this.batchSize = parseInt(btn.dataset.batch, 10);
      this.startNewBatch();
    });

    // Strict Mode toggle
    this.dom.strictModeCheck.addEventListener('change', (e) => {
      this.strictMode = e.target.checked;
    });

    // Sound toggle
    this.dom.soundToggleBtn.addEventListener('click', () => {
      this.sound.enabled = !this.sound.enabled;
      this.dom.soundToggleBtn.textContent = `Sound: ${this.sound.enabled ? 'ON' : 'MUTED'}`;
    });

    // Reset button
    this.dom.resetBatchBtn.addEventListener('click', () => this.startNewBatch());

    // Global Esc
    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        if (this.dom.completionModal.classList.contains('active')) {
          this.dom.completionModal.classList.remove('active');
        } else {
          this.startNewBatch();
        }
      }
    });

    // Inputs setup
    FIELD_KEYS.forEach((key, idx) => {
      const input = this.dom.inputs[key];
      input.addEventListener('focus', () => {
        this.currentFieldIndex = idx;
        this.updateDossierActiveHighlight();
      });

      input.addEventListener('keydown', (e) => this.handleFieldKeyDown(e, key, idx));
      input.addEventListener('input', (e) => this.handleFieldInput(e, key, idx));
    });

    // Modal buttons
    this.dom.modalCloseBtn.addEventListener('click', () => {
      this.dom.completionModal.classList.remove('active');
    });
    this.dom.modalRestartBtn.addEventListener('click', () => {
      this.dom.completionModal.classList.remove('active');
      this.startNewBatch();
    });
    this.dom.saveScoreBtn.addEventListener('click', () => this.saveCurrentScore());

    this.dom.clearLeaderboardBtn.addEventListener('click', () => {
      if (confirm('Are you sure you want to clear all high scores?')) {
        localStorage.removeItem('aio_erp_leaderboard');
        this.renderLeaderboard();
      }
    });
  }

  startNewBatch() {
    clearInterval(this.timer);
    this.timer = null;
    this.isRunning = false;
    this.elapsedSeconds = 0;
    this.completedFields = 0;
    this.totalTypedChars = 0;
    this.correctChars = 0;
    this.errorCount = 0;
    this.currentRecordIndex = 0;
    this.currentFieldIndex = 0;

    // Generate batch records
    this.records = [];
    for (let i = 0; i < this.batchSize; i++) {
      this.records.push(this.generateCustomerRecord());
    }

    this.updateStatsUI();
    this.renderCurrentRecord();
    this.focusCurrentField();
  }

  renderCurrentRecord() {
    const rec = this.records[this.currentRecordIndex];
    if (!rec) return;

    this.dom.dossierAccountId.textContent = rec.accountId;
    this.dom.dossierFullName.textContent = rec.fullName;
    this.dom.dossierCompany.textContent = rec.company;
    this.dom.dossierEmail.textContent = rec.email;
    this.dom.dossierPhone.textContent = rec.phone;
    this.dom.dossierAddress.textContent = rec.address;
    this.dom.dossierPostalCode.textContent = rec.postalCode;
    this.dom.dossierAccountIdField.textContent = rec.accountId;

    // Reset inputs
    FIELD_KEYS.forEach(key => {
      const inp = this.dom.inputs[key];
      inp.value = '';
      inp.className = 'erp-input';
      
      const dossierItem = document.getElementById(`cardField_${key}`);
      if (dossierItem) {
        dossierItem.className = 'dossier-item';
        const ind = dossierItem.querySelector('.indicator');
        if (ind) ind.textContent = '';
      }
    });

    this.currentFieldIndex = 0;
    this.updateDossierActiveHighlight();
    this.dom.recordProgressVal.textContent = `${this.currentRecordIndex + 1} / ${this.batchSize}`;
  }

  updateDossierActiveHighlight() {
    FIELD_KEYS.forEach((key, idx) => {
      const item = document.getElementById(`cardField_${key}`);
      if (!item) return;
      const ind = item.querySelector('.indicator');

      if (idx === this.currentFieldIndex) {
        item.classList.add('active');
        item.classList.remove('completed');
        if (ind) ind.textContent = '• Active';
      } else if (idx < this.currentFieldIndex) {
        item.classList.remove('active');
        item.classList.add('completed');
        if (ind) ind.textContent = '✓ Done';
      } else {
        item.classList.remove('active', 'completed');
        if (ind) ind.textContent = '';
      }
    });
  }

  focusCurrentField() {
    const key = FIELD_KEYS[this.currentFieldIndex];
    if (key && this.dom.inputs[key]) {
      this.dom.inputs[key].focus();
    }
  }

  startTimer() {
    if (this.isRunning) return;
    this.isRunning = true;
    this.timer = setInterval(() => {
      this.elapsedSeconds++;
      this.dom.stopwatchVal.textContent = this.formatTime(this.elapsedSeconds);
      this.updateStatsUI();
    }, 1000);
  }

  handleFieldInput(e, key) {
    if (!this.isRunning) this.startTimer();
    this.sound.click();

    const expected = this.records[this.currentRecordIndex][key];
    const val = e.target.value;
    this.totalTypedChars++;

    if (expected.startsWith(val)) {
      this.correctChars++;
      e.target.classList.remove('error');
      if (val === expected) {
        e.target.classList.add('valid');
      }
    } else {
      this.errorCount++;
      this.sound.error();
      if (this.strictMode) {
        e.target.classList.add('error');
      }
    }
    this.updateStatsUI();
  }

  handleFieldKeyDown(e, key, idx) {
    if (e.key === 'Tab' || e.key === 'Enter') {
      e.preventDefault();

      const expected = this.records[this.currentRecordIndex][key];
      const val = this.dom.inputs[key].value.trim();

      if (this.strictMode && val !== expected) {
        // Validation failed
        this.sound.error();
        this.errorCount++;
        this.dom.inputs[key].classList.add('error');
        this.updateStatsUI();
        return;
      }

      // Valid or forgiving pass
      this.sound.successField();
      this.dom.inputs[key].classList.remove('error');
      this.dom.inputs[key].classList.add('valid');
      this.completedFields++;

      // Advance
      if (idx < FIELD_KEYS.length - 1) {
        this.currentFieldIndex = idx + 1;
        this.updateDossierActiveHighlight();
        this.focusCurrentField();
      } else {
        // Record completed!
        this.currentRecordIndex++;
        if (this.currentRecordIndex < this.batchSize) {
          this.renderCurrentRecord();
          this.focusCurrentField();
        } else {
          this.finishBatch();
        }
      }
      this.updateStatsUI();
    }
  }

  updateStatsUI() {
    const totalFields = this.batchSize * FIELD_KEYS.length;
    const fpm = this.elapsedSeconds > 0 ? Math.round((this.completedFields / this.elapsedSeconds) * 60) : 0;
    const acc = this.totalTypedChars > 0 ? Math.max(0, Math.min(100, Math.round((this.correctChars / this.totalTypedChars) * 100))) : 100;

    this.dom.fpmVal.textContent = fpm;
    this.dom.accuracyVal.textContent = `${acc}%`;
    this.dom.errorsSub.textContent = `${this.errorCount} penalties`;
    this.dom.completedFieldsVal.textContent = `${this.completedFields} / ${totalFields}`;

    const percent = Math.min(100, Math.round((this.completedFields / totalFields) * 100));
    this.dom.batchProgressFill.style.width = `${percent}%`;
  }

  finishBatch() {
    clearInterval(this.timer);
    this.isRunning = false;

    const fpm = Math.round((this.completedFields / Math.max(this.elapsedSeconds, 1)) * 60);
    const acc = this.totalTypedChars > 0 ? Math.round((this.correctChars / this.totalTypedChars) * 100) : 100;

    let rank = 'Junior Clerk';
    if (fpm >= 60 && acc >= 95) rank = 'ERP Architect';
    else if (fpm >= 45 && acc >= 90) rank = 'Senior Specialist';
    else if (fpm >= 30) rank = 'Data Entry Specialist';

    this.dom.modalFinalFpm.textContent = fpm;
    this.dom.modalFinalTime.textContent = this.formatTime(this.elapsedSeconds);
    this.dom.modalFinalAcc.textContent = `${acc}%`;
    this.dom.modalFinalMistakes.textContent = `${this.errorCount} penalties`;
    this.dom.modalFinalRank.textContent = rank;

    this.dom.completionModal.classList.add('active');
  }

  saveCurrentScore() {
    const operator = this.dom.operatorNameInput.value.trim() || 'OP-1';
    const fpm = parseInt(this.dom.modalFinalFpm.textContent, 10);
    const acc = this.dom.modalFinalAcc.textContent;
    const time = this.dom.modalFinalTime.textContent;
    const date = new Date().toLocaleDateString(undefined, { month: 'short', day: 'numeric' });

    const newRecord = {
      operator,
      batchSize: `${this.batchSize} Rec`,
      fpm,
      accuracy: acc,
      time,
      date
    };

    let board = [];
    try {
      board = JSON.parse(localStorage.getItem('aio_erp_leaderboard')) || [];
    } catch {}

    board.push(newRecord);
    board.sort((a, b) => b.fpm - a.fpm);
    board = board.slice(0, 10);

    localStorage.setItem('aio_erp_leaderboard', JSON.stringify(board));
    this.renderLeaderboard();

    this.dom.saveScoreBtn.textContent = 'Saved!';
    setTimeout(() => {
      this.dom.saveScoreBtn.textContent = 'Save Record';
      this.dom.completionModal.classList.remove('active');
    }, 800);
  }

  renderLeaderboard() {
    let board = [];
    try {
      board = JSON.parse(localStorage.getItem('aio_erp_leaderboard')) || [];
    } catch {}

    const tbody = this.dom.leaderboardTbody;
    tbody.innerHTML = '';

    if (board.length === 0) {
      tbody.innerHTML = `<tr><td colspan="7" style="text-align: center; color: var(--text-tertiary); padding: 1.5rem;">No local records yet. Complete a batch to record your high score!</td></tr>`;
      return;
    }

    board.forEach((item, index) => {
      const tr = document.createElement('tr');
      const medal = index === 0 ? '🥇 ' : index === 1 ? '🥈 ' : index === 2 ? '🥉 ' : '';
      tr.innerHTML = `
        <td style="font-weight: 700; color: var(--accent);">${medal}#${index + 1}</td>
        <td style="font-weight: 600;">${item.operator}</td>
        <td>${item.batchSize}</td>
        <td style="font-weight: 700; color: var(--accent); font-family: monospace;">${item.fpm} FPM</td>
        <td style="color: var(--success); font-family: monospace;">${item.accuracy}</td>
        <td style="font-family: monospace;">${item.time}</td>
        <td style="color: var(--text-tertiary); font-size: 0.8rem;">${item.date}</td>
      `;
      tbody.appendChild(tr);
    });
  }

  formatTime(totalSec) {
    const mins = Math.floor(totalSec / 60);
    const secs = totalSec % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }
}

document.addEventListener('DOMContentLoaded', () => {
  new CustomerTypingPractice();
});