// Global Leaderboard - Competitive Hall of Fame & Badge Generator

const DEFAULT_SCORES = {
  sprint: [
    { name: "SeanWona", country: "US", flag: "🇺🇸", wpm: 148, accuracy: 99.2, date: "2026-10-04", timeframe: "all" },
    { name: "Chak", country: "JP", flag: "🇯🇵", wpm: 142, accuracy: 98.7, date: "2026-10-02", timeframe: "all" },
    { name: "Kavka", country: "DE", flag: "🇩🇪", wpm: 136, accuracy: 99.5, date: "2026-09-28", timeframe: "month" },
    { name: "ShaiHulud", country: "GB", flag: "🇬🇧", wpm: 129, accuracy: 97.9, date: "2026-10-05", timeframe: "week" },
    { name: "Minato", country: "KR", flag: "🇰🇷", wpm: 124, accuracy: 98.4, date: "2026-10-06", timeframe: "week" },
    { name: "ApexNordic", country: "CA", flag: "🇨🇦", wpm: 119, accuracy: 99.0, date: "2026-10-01", timeframe: "month" },
    { name: "Zephyr", country: "FR", flag: "🇫🇷", wpm: 115, accuracy: 97.4, date: "2026-09-15", timeframe: "all" },
    { name: "SolarPulse", country: "BR", flag: "🇧🇷", wpm: 108, accuracy: 96.8, date: "2026-10-07", timeframe: "today" },
    { name: "KangarooKeys", country: "AU", flag: "🇦🇺", wpm: 104, accuracy: 98.1, date: "2026-10-06", timeframe: "week" },
    { name: "NovaDash", country: "US", flag: "🇺🇸", wpm: 99, accuracy: 97.5, date: "2026-09-20", timeframe: "all" }
  ],
  standard: [
    { name: "MythicTypist", country: "US", flag: "🇺🇸", wpm: 135, accuracy: 99.4, date: "2026-09-25", timeframe: "all" },
    { name: "GhostWriter", country: "KR", flag: "🇰🇷", wpm: 128, accuracy: 99.1, date: "2026-10-03", timeframe: "week" },
    { name: "ByteStorm", country: "DE", flag: "🇩🇪", wpm: 122, accuracy: 98.5, date: "2026-10-01", timeframe: "month" },
    { name: "SakuraBlaze", country: "JP", flag: "🇯🇵", wpm: 118, accuracy: 98.9, date: "2026-09-10", timeframe: "all" },
    { name: "EiffelRacer", country: "FR", flag: "🇫🇷", wpm: 111, accuracy: 97.8, date: "2026-10-05", timeframe: "week" },
    { name: "MapleSpeed", country: "CA", flag: "🇨🇦", wpm: 106, accuracy: 98.2, date: "2026-09-18", timeframe: "all" },
    { name: "VortexKeys", country: "GB", flag: "🇬🇧", wpm: 102, accuracy: 96.9, date: "2026-10-07", timeframe: "today" },
    { name: "RioRhythm", country: "BR", flag: "🇧🇷", wpm: 96, accuracy: 97.1, date: "2026-10-04", timeframe: "week" }
  ],
  quotes: [
    { name: "EchoChamber", country: "GB", flag: "🇬🇧", wpm: 125, accuracy: 99.8, date: "2026-09-30", timeframe: "all" },
    { name: "ZenMaster", country: "JP", flag: "🇯🇵", wpm: 120, accuracy: 99.6, date: "2026-10-02", timeframe: "week" },
    { name: "Hyperion", country: "US", flag: "🇺🇸", wpm: 116, accuracy: 99.2, date: "2026-10-01", timeframe: "month" },
    { name: "Kronos", country: "DE", flag: "🇩🇪", wpm: 110, accuracy: 98.8, date: "2026-09-12", timeframe: "all" },
    { name: "SeoulSprint", country: "KR", flag: "🇰🇷", wpm: 103, accuracy: 99.0, date: "2026-10-06", timeframe: "week" }
  ],
  code: [
    { name: "KernelPanic", country: "DE", flag: "🇩🇪", wpm: 112, accuracy: 99.1, date: "2026-10-04", timeframe: "week" },
    { name: "RustaceanX", country: "US", flag: "🇺🇸", wpm: 108, accuracy: 98.5, date: "2026-09-22", timeframe: "all" },
    { name: "NullPointer", country: "JP", flag: "🇯🇵", wpm: 101, accuracy: 98.9, date: "2026-10-03", timeframe: "week" },
    { name: "AsyncAwait", country: "GB", flag: "🇬🇧", wpm: 95, accuracy: 97.8, date: "2026-10-05", timeframe: "week" },
    { name: "LambdaForce", country: "CA", flag: "🇨🇦", wpm: 91, accuracy: 98.2, date: "2026-09-15", timeframe: "all" }
  ]
};

const COUNTRY_FLAGS = {
  US: "🇺🇸",
  JP: "🇯🇵",
  DE: "🇩🇪",
  GB: "🇬🇧",
  KR: "🇰🇷",
  CA: "🇨🇦",
  FR: "🇫🇷",
  BR: "🇧🇷",
  AU: "🇦🇺"
};

class GlobalLeaderboard {
  constructor() {
    this.category = 'sprint';
    this.countryFilter = 'ALL';
    this.timeframeFilter = 'all';
    this.searchQuery = '';
    this.scores = this.loadScores();

    // Quick Test State
    this.quickTestTimer = null;
    this.quickTestTimeLeft = 15;
    this.quickTestText = "The swift digital fox leaped gracefully over the glowing neon hurdles of speed and precision.";
    this.quickTestRunning = false;
    this.quickTestStart = null;
    this.quickTestCorrect = 0;
    this.quickTestTotal = 0;

    this.initDom();
    this.bindEvents();
    this.render();
  }

  loadScores() {
    const saved = localStorage.getItem('aio_typing_leaderboard');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (_) {}
    }
    return JSON.parse(JSON.stringify(DEFAULT_SCORES));
  }

  saveScores() {
    localStorage.setItem('aio_typing_leaderboard', JSON.stringify(this.scores));
  }

  initDom() {
    this.pills = document.querySelectorAll('.glb-pill');
    this.countrySelect = document.getElementById('countryFilter');
    this.timeframeSelect = document.getElementById('timeframeFilter');
    this.searchInput = document.getElementById('searchInput');
    this.podiumContainer = document.getElementById('podiumHighlights');
    this.tbody = document.getElementById('leaderboardTbody');

    // Modals
    this.submitModal = document.getElementById('submitScoreModal');
    this.openSubmitModalBtn = document.getElementById('openSubmitModalBtn');
    this.closeSubmitModalBtn = document.getElementById('closeSubmitModalBtn');
    this.submitForm = document.getElementById('submitScoreForm');

    this.badgeModal = document.getElementById('badgeModal');
    this.openBadgeModalBtn = document.getElementById('openBadgeModalBtn');
    this.closeBadgeModalBtn = document.getElementById('closeBadgeModalBtn');
    this.downloadBadgeBtn = document.getElementById('downloadBadgeBtn');
    this.badgeCanvas = document.getElementById('badgeCanvas');

    // Percentile Calc
    this.calcWpmInput = document.getElementById('calcWpmInput');
    this.calcBtn = document.getElementById('calculatePercentileBtn');
    this.calcPercentileText = document.getElementById('calcPercentileText');
    this.calcTierBadge = document.getElementById('calcTierBadge');
    this.calcFeedback = document.getElementById('calcFeedback');

    // Quick test
    this.quickTestBox = document.getElementById('quickTestBox');
    this.quickTestInput = document.getElementById('quickTestInput');
    this.startQuickTestBtn = document.getElementById('startQuickTestBtn');
    this.quickTimerEl = document.getElementById('quickTestTimer');
    this.quickWpmEl = document.getElementById('quickTestWpm');
    this.quickAccEl = document.getElementById('quickTestAcc');
  }

  bindEvents() {
    this.pills.forEach(pill => {
      pill.addEventListener('click', (e) => {
        this.pills.forEach(p => p.classList.remove('active'));
        e.currentTarget.classList.add('active');
        this.category = e.currentTarget.dataset.cat;
        this.render();
      });
    });

    this.countrySelect.addEventListener('change', (e) => {
      this.countryFilter = e.target.value;
      this.render();
    });

    this.timeframeSelect.addEventListener('change', (e) => {
      this.timeframeFilter = e.target.value;
      this.render();
    });

    this.searchInput.addEventListener('input', (e) => {
      this.searchQuery = e.target.value.toLowerCase().trim();
      this.render();
    });

    // Submit Modal
    this.openSubmitModalBtn.addEventListener('click', () => {
      this.submitModal.classList.add('active');
    });
    this.closeSubmitModalBtn.addEventListener('click', () => {
      this.submitModal.classList.remove('active');
    });
    this.submitForm.addEventListener('submit', (e) => this.handleSubmit(e));

    // Badge Modal
    this.openBadgeModalBtn.addEventListener('click', () => {
      this.generateBadge();
      this.badgeModal.classList.add('active');
    });
    this.closeBadgeModalBtn.addEventListener('click', () => {
      this.badgeModal.classList.remove('active');
    });
    this.downloadBadgeBtn.addEventListener('click', () => this.downloadBadge());

    // Percentile Calc
    this.calcBtn.addEventListener('click', () => {
      const wpm = parseInt(this.calcWpmInput.value, 10) || 40;
      this.updatePercentileDisplay(wpm);
    });

    // Quick Test
    this.startQuickTestBtn.addEventListener('click', () => this.startQuickTest());
    this.quickTestInput.addEventListener('input', (e) => this.handleQuickTestInput(e));
  }

  getTier(wpm) {
    if (wpm >= 120) return { label: 'Grandmaster', color: '#c084fc', bg: 'rgba(147, 51, 234, 0.2)' };
    if (wpm >= 100) return { label: 'Master', color: '#f43f5e', bg: 'rgba(244, 63, 94, 0.2)' };
    if (wpm >= 85) return { label: 'Diamond', color: '#38bdf8', bg: 'rgba(56, 189, 248, 0.2)' };
    if (wpm >= 70) return { label: 'Platinum', color: '#2dd4bf', bg: 'rgba(45, 212, 191, 0.2)' };
    if (wpm >= 50) return { label: 'Gold', color: '#eab308', bg: 'rgba(234, 179, 8, 0.2)' };
    return { label: 'Silver', color: '#94a3b8', bg: 'rgba(148, 163, 184, 0.2)' };
  }

  getPercentile(wpm) {
    // Normal distribution approximation: Mean = 42 WPM, SD = 16 WPM
    const mean = 42;
    const sd = 16;
    const z = (wpm - mean) / sd;

    // Cumulative normal distribution approximation
    const t = 1 / (1 + 0.2316419 * Math.abs(z));
    const d = 0.3989423 * Math.exp(-z * z / 2);
    let p = d * t * (0.3193815 + t * (-0.3565638 + t * (1.781478 + t * (-1.821256 + t * 1.330274))));
    if (z > 0) p = 1 - p;

    // Top X %
    const topPct = Math.max(0.1, (1 - p) * 100);
    return topPct;
  }

  updatePercentileDisplay(wpm) {
    const topPct = this.getPercentile(wpm);
    const tier = this.getTier(wpm);

    this.calcTierBadge.textContent = tier.label;
    this.calcTierBadge.style.color = tier.color;
    this.calcTierBadge.style.background = tier.bg;

    this.calcPercentileText.textContent = `Top ${topPct.toFixed(1)}% Worldwide`;
    const fasterThan = (100 - topPct).toFixed(1);
    this.calcFeedback.textContent = `You are faster than ${fasterThan}% of typists globally. Placement tier: ${tier.label}!`;
  }

  getFilteredScores() {
    let list = this.scores[this.category] || [];

    if (this.countryFilter !== 'ALL') {
      list = list.filter(s => s.country === this.countryFilter);
    }

    if (this.timeframeFilter !== 'all') {
      list = list.filter(s => s.timeframe === this.timeframeFilter || s.timeframe === 'all');
    }

    if (this.searchQuery) {
      list = list.filter(s => s.name.toLowerCase().includes(this.searchQuery));
    }

    return [...list].sort((a, b) => b.wpm - a.wpm);
  }

  render() {
    const list = this.getFilteredScores();

    // Render Podium (top 3)
    this.podiumContainer.innerHTML = '';
    const top3 = list.slice(0, 3);
    const crowns = ['🥇', '🥈', '🥉'];
    const rankClasses = ['rank-1', 'rank-2', 'rank-3'];

    for (let i = 0; i < 3; i++) {
      const entry = top3[i];
      const box = document.createElement('div');
      box.className = `podium-box ${rankClasses[i]}`;

      if (entry) {
        const tier = this.getTier(entry.wpm);
        box.innerHTML = `
          <div class="top-crown">${crowns[i]}</div>
          <div class="top-name">${entry.name} ${entry.flag}</div>
          <div class="top-wpm">${entry.wpm} <span style="font-size: 1rem; color: var(--text-tertiary); font-weight: 600;">WPM</span></div>
          <div style="font-size: 0.8rem; color: var(--text-secondary); margin-bottom: 0.5rem;">Accuracy: ${entry.accuracy}%</div>
          <span class="badge" style="background: ${tier.bg}; color: ${tier.color}; font-size: 0.75rem;">${tier.label}</span>
        `;
      } else {
        box.innerHTML = `
          <div class="top-crown">${crowns[i]}</div>
          <div class="top-name" style="color: var(--text-tertiary);">Open Slot</div>
          <div class="top-wpm" style="color: var(--text-tertiary);">-</div>
          <div style="font-size: 0.8rem; color: var(--text-tertiary);">Be the first to claim!</div>
        `;
      }
      this.podiumContainer.appendChild(box);
    }

    // Render Table
    this.tbody.innerHTML = '';
    if (list.length === 0) {
      const emptyRow = document.createElement('tr');
      emptyRow.innerHTML = `<td colspan="7" style="text-align: center; padding: 2rem; color: var(--text-tertiary);">No typists match the selected filters.</td>`;
      this.tbody.appendChild(emptyRow);
      return;
    }

    list.forEach((entry, idx) => {
      const tier = this.getTier(entry.wpm);
      const row = document.createElement('tr');
      if (entry.isUser) row.classList.add('is-user');

      row.innerHTML = `
        <td style="font-weight: 800; font-family: monospace;">#${idx + 1}</td>
        <td style="font-weight: 700;">${entry.name} ${entry.isUser ? '⭐ (You)' : ''}</td>
        <td>${entry.flag} ${entry.country}</td>
        <td style="font-weight: 800; font-size: 1.05rem; color: var(--accent);">${entry.wpm}</td>
        <td>${entry.accuracy}%</td>
        <td><span class="badge" style="background: ${tier.bg}; color: ${tier.color}; font-size: 0.7rem;">${tier.label}</span></td>
        <td style="color: var(--text-tertiary); font-size: 0.8rem;">${entry.date}</td>
      `;
      this.tbody.appendChild(row);
    });
  }

  handleSubmit(e) {
    e.preventDefault();
    const name = document.getElementById('submitName').value.trim();
    const country = document.getElementById('submitCountry').value;
    const category = document.getElementById('submitCategory').value;
    const wpm = parseInt(document.getElementById('submitWpm').value, 10);
    const accuracy = parseFloat(document.getElementById('submitAccuracy').value);

    if (!name || isNaN(wpm) || isNaN(accuracy)) return;

    const newScore = {
      name,
      country,
      flag: COUNTRY_FLAGS[country] || "🌍",
      wpm,
      accuracy,
      date: new Date().toISOString().split('T')[0],
      timeframe: 'today',
      isUser: true
    };

    if (!this.scores[category]) this.scores[category] = [];
    this.scores[category].push(newScore);
    this.saveScores();

    this.submitModal.classList.remove('active');
    this.category = category;
    this.pills.forEach(p => {
      if (p.dataset.cat === category) p.classList.add('active');
      else p.classList.remove('active');
    });

    this.render();
    alert(`High score of ${wpm} WPM submitted to the ${category} leaderboard!`);
  }

  generateBadge() {
    const canvas = this.badgeCanvas;
    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;

    const list = this.getFilteredScores();
    const topEntry = list.find(s => s.isUser) || list[0] || { name: "GuestTypist", wpm: 95, accuracy: 98.4, country: "US" };
    const tier = this.getTier(topEntry.wpm);
    const topPct = this.getPercentile(topEntry.wpm);

    // Dark luxury glass background
    const bgGrad = ctx.createLinearGradient(0, 0, width, height);
    bgGrad.addColorStop(0, '#0a0d14');
    bgGrad.addColorStop(1, '#111827');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, width, height);

    // Outer glow border
    ctx.strokeStyle = tier.color;
    ctx.lineWidth = 4;
    ctx.strokeRect(10, 10, width - 20, height - 20);

    ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
    ctx.lineWidth = 1;
    ctx.strokeRect(18, 18, width - 36, height - 36);

    // Title & Brand
    ctx.fillStyle = '#64748b';
    ctx.font = '600 16px Inter, sans-serif';
    ctx.fillText('ALL IN ONE • GLOBAL TYPING LEADERBOARD', 40, 55);

    // Typist Name
    ctx.fillStyle = '#ffffff';
    ctx.font = '800 36px Inter, sans-serif';
    ctx.fillText(topEntry.name, 40, 105);

    // Tier badge box
    ctx.fillStyle = tier.color;
    ctx.fillRect(40, 125, 140, 32);
    ctx.fillStyle = '#000000';
    ctx.font = '700 14px Inter, sans-serif';
    ctx.fillText(tier.label.toUpperCase(), 52, 147);

    // Stats Grid
    ctx.fillStyle = '#94a3b8';
    ctx.font = '600 14px Inter, sans-serif';
    ctx.fillText('CERTIFIED SPEED', 40, 210);
    ctx.fillStyle = '#38bdf8';
    ctx.font = '900 64px Inter, sans-serif';
    ctx.fillText(`${topEntry.wpm}`, 40, 275);
    ctx.font = '600 24px Inter, sans-serif';
    ctx.fillText('WPM', 170, 265);

    ctx.fillStyle = '#94a3b8';
    ctx.font = '600 14px Inter, sans-serif';
    ctx.fillText('ACCURACY', 300, 210);
    ctx.fillStyle = '#10b981';
    ctx.font = '900 64px Inter, sans-serif';
    ctx.fillText(`${topEntry.accuracy}%`, 300, 275);

    // Percentile Footer
    ctx.fillStyle = 'rgba(255, 255, 255, 0.05)';
    ctx.fillRect(40, 320, width - 80, 75);
    ctx.fillStyle = '#f8fafc';
    ctx.font = '700 22px Inter, sans-serif';
    ctx.fillText(`Top ${topPct.toFixed(1)}% Worldwide Contender`, 60, 360);
    ctx.fillStyle = '#64748b';
    ctx.font = '500 14px Inter, sans-serif';
    ctx.fillText(`Verified via ALL-IN-ONE Engine • Issued: ${new Date().toLocaleDateString()}`, 60, 382);

    // Decorative Watermark Emblem
    ctx.save();
    ctx.translate(width - 120, 120);
    ctx.strokeStyle = tier.color;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(0, 0, 50, 0, Math.PI * 2);
    ctx.stroke();
    ctx.fillStyle = tier.color;
    ctx.font = '700 12px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('VERIFIED', 0, -5);
    ctx.fillText('TYPIST', 0, 15);
    ctx.restore();
  }

  downloadBadge() {
    const link = document.createElement('a');
    link.download = 'Typing-Leaderboard-Badge.png';
    link.href = this.badgeCanvas.toDataURL('image/png');
    link.click();
  }

  // --- QUICK 15S BENCHMARK ENGINE ---
  startQuickTest() {
    if (this.quickTestRunning) return;
    this.quickTestRunning = true;
    this.quickTestTimeLeft = 15;
    this.quickTestCorrect = 0;
    this.quickTestTotal = 0;
    this.quickTestInput.disabled = false;
    this.quickTestInput.value = '';
    this.quickTestInput.focus();
    this.startQuickTestBtn.textContent = '⏱️ Running...';
    this.quickTimerEl.textContent = '15s';
    this.quickTestStart = performance.now();

    this.renderQuickTestWords();

    this.quickTestTimer = setInterval(() => {
      this.quickTestTimeLeft--;
      this.quickTimerEl.textContent = `${this.quickTestTimeLeft}s`;

      const elapsedMin = (performance.now() - this.quickTestStart) / 60000;
      const wpm = Math.round((this.quickTestCorrect / 5) / elapsedMin);
      this.quickWpmEl.textContent = `${wpm} WPM`;

      if (this.quickTestTimeLeft <= 0) {
        this.finishQuickTest();
      }
    }, 1000);
  }

  renderQuickTestWords() {
    this.quickTestBox.textContent = this.quickTestText;
  }

  handleQuickTestInput(e) {
    if (!this.quickTestRunning) return;
    const val = this.quickTestInput.value;
    this.quickTestTotal = val.length;

    let correct = 0;
    for (let i = 0; i < val.length; i++) {
      if (val[i] === this.quickTestText[i]) correct++;
    }
    this.quickTestCorrect = correct;

    const acc = this.quickTestTotal > 0 ? Math.round((correct / this.quickTestTotal) * 100) : 100;
    this.quickAccEl.textContent = `${acc}%`;

    if (val === this.quickTestText) {
      this.finishQuickTest();
    }
  }

  finishQuickTest() {
    this.quickTestRunning = false;
    clearInterval(this.quickTestTimer);
    this.quickTestInput.disabled = true;
    this.startQuickTestBtn.textContent = '⏱️ Start Warmup';

    const elapsedMin = Math.max(0.01, (performance.now() - this.quickTestStart) / 60000);
    const finalWpm = Math.round((this.quickTestCorrect / 5) / elapsedMin);
    const finalAcc = this.quickTestTotal > 0 ? Math.round((this.quickTestCorrect / this.quickTestTotal) * 100) : 100;

    this.updatePercentileDisplay(finalWpm);
    this.calcWpmInput.value = finalWpm;

    if (confirm(`Sprint Complete!\nResult: ${finalWpm} WPM with ${finalAcc}% Accuracy.\n\nWould you like to submit this score to the global leaderboard?`)) {
      document.getElementById('submitWpm').value = finalWpm;
      document.getElementById('submitAccuracy').value = finalAcc;
      document.getElementById('submitCategory').value = 'sprint';
      this.submitModal.classList.add('active');
    }
  }
}

document.addEventListener('DOMContentLoaded', () => {
  window.globalLeaderboard = new GlobalLeaderboard();
});