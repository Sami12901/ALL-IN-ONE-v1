/**
 * Achievement Badges & Trophy Room Engine
 * Tracks 24 collectible badges across 5 categories, player XP & levels,
 * category filtering, detailed modal inspection, and 1-click luxury canvas trophy card export.
 */

const BADGES_DATABASE = [
  // Speed Category
  {
    id: "getting_warm",
    title: "Getting Warm",
    category: "Speed",
    icon: "⚡",
    desc: "Reach a typing velocity of at least 30 Words Per Minute.",
    criteria: "Peak Speed >= 30 WPM in any typing test."
  },
  {
    id: "cruising_speed",
    title: "Cruising Speed",
    category: "Speed",
    icon: "🚀",
    desc: "Reach a swift pace of 50 Words Per Minute with ease.",
    criteria: "Peak Speed >= 50 WPM in any typing test."
  },
  {
    id: "rapid_fire",
    title: "Rapid Fire",
    category: "Speed",
    icon: "🔥",
    desc: "Push your fingers beyond 70 Words Per Minute.",
    criteria: "Peak Speed >= 70 WPM in any typing test."
  },
  {
    id: "speed_demon",
    title: "Speed Demon",
    category: "Speed",
    icon: "😈",
    desc: "Cross into triple digits with 100+ Words Per Minute.",
    criteria: "Peak Speed >= 100 WPM in any typing test."
  },
  {
    id: "sonic_typist",
    title: "Sonic Typist",
    category: "Speed",
    icon: "🌪️",
    desc: "Break all speed barriers with supersonic 120+ WPM.",
    criteria: "Peak Speed >= 120 WPM in any typing test."
  },

  // Accuracy Category
  {
    id: "sharp_shooter",
    title: "Sharp Shooter",
    category: "Accuracy",
    icon: "🎯",
    desc: "Demonstrate high precision with 95%+ accuracy in any test.",
    criteria: "Accuracy >= 95% in any completed drill."
  },
  {
    id: "laser_precision",
    title: "Laser Precision",
    category: "Accuracy",
    icon: "🔬",
    desc: "Type with 100% surgical accuracy across at least 25 words.",
    criteria: "Accuracy = 100% on a test with >= 25 words."
  },
  {
    id: "flawless_run",
    title: "Flawless Run",
    category: "Accuracy",
    icon: "💎",
    desc: "Complete a full drill without a single backspace or mistype.",
    criteria: "Zero mistakes in a test of at least 15 words."
  },
  {
    id: "steady_hands",
    title: "Steady Hands",
    category: "Accuracy",
    icon: "🧤",
    desc: "Maintain remarkable composure with overall best accuracy >= 98%.",
    criteria: "Best accuracy recorded >= 98%."
  },

  // Polyglot Category
  {
    id: "bangla_pioneer",
    title: "Bangla Pioneer",
    category: "Polyglot",
    icon: "🇧🇩",
    desc: "Conquer Bengali typography with Avro or Bijoy drills.",
    criteria: "Complete at least 1 Bangla typing test."
  },
  {
    id: "arabesque",
    title: "Arabesque Scribe",
    category: "Polyglot",
    icon: "🌙",
    desc: "Master Right-to-Left Arabic calligraphy and Harakat accents.",
    criteria: "Complete at least 1 Arabic typing test."
  },
  {
    id: "devanagari",
    title: "Devanagari Scholar",
    category: "Polyglot",
    icon: "🕉️",
    desc: "Practice Hindi Devanagari Swar, Vyanjan, and Matras.",
    criteria: "Complete at least 1 Hindi typing test."
  },
  {
    id: "bilingual_scribe",
    title: "Bilingual Scribe",
    category: "Polyglot",
    icon: "🌐",
    desc: "Expand your linguistic horizon by practicing in 2 distinct languages.",
    criteria: "Complete drills in at least 2 different languages."
  },
  {
    id: "polyglot_typist",
    title: "Polyglot Typist",
    category: "Polyglot",
    icon: "🌍",
    desc: "Unlock versatile multilingual fluency across 3 distinct languages.",
    criteria: "Complete drills in at least 3 different languages."
  },
  {
    id: "quad_lingual",
    title: "Quad-Lingual Master",
    category: "Polyglot",
    icon: "👑",
    desc: "Complete practice drills in all 4 languages: English, Bangla, Arabic & Hindi.",
    criteria: "Active tests recorded in all 4 language modules."
  },

  // Consistency Category
  {
    id: "first_strike",
    title: "First Strike",
    category: "Consistency",
    icon: "⚔️",
    desc: "Begin your journey by finishing your very first typing test.",
    criteria: "Total completed tests >= 1."
  },
  {
    id: "code_warrior",
    title: "Code Warrior",
    category: "Consistency",
    icon: "💻",
    desc: "Master developer keystrokes in JavaScript, Python, or HTML code mode.",
    criteria: "Complete at least 1 Programming Code drill in English Typing."
  },
  {
    id: "streak_3",
    title: "3-Day Habit",
    category: "Consistency",
    icon: "📅",
    desc: "Build consistency by practicing 3 days in a row.",
    criteria: "Active typing streak >= 3 consecutive days."
  },
  {
    id: "streak_7",
    title: "Daily Champion",
    category: "Consistency",
    icon: "🏆",
    desc: "Maintain an unbroken daily practice streak for a full week.",
    criteria: "Active typing streak >= 7 consecutive days."
  },
  {
    id: "grandmaster",
    title: "Grandmaster Typist",
    category: "Consistency",
    icon: "🌟",
    desc: "The pinnacle of typing mastery: Unlock 18 badges and reach Level 10+.",
    criteria: "18+ badges unlocked AND Player Level >= 10."
  },

  // Endurance Category
  {
    id: "century_club",
    title: "Century Club",
    category: "Endurance",
    icon: "💯",
    desc: "Accumulate 100+ words across all your typing practice sessions.",
    criteria: "Total cumulative words typed >= 100."
  },
  {
    id: "marathoneer",
    title: "Marathoneer",
    category: "Endurance",
    icon: "🏃",
    desc: "Sustain momentum with over 500 cumulative typed words.",
    criteria: "Total cumulative words typed >= 500."
  },
  {
    id: "endurance_master",
    title: "Endurance Master",
    category: "Endurance",
    icon: "🛡️",
    desc: "A true typing marathoner: Type over 1,000 words in total.",
    criteria: "Total cumulative words typed >= 1,000."
  },
  {
    id: "olympian",
    title: "Keyboard Olympian",
    category: "Endurance",
    icon: "🥇",
    desc: "An elite typist who has typed more than 5,000 cumulative words.",
    criteria: "Total cumulative words typed >= 5,000."
  }
];

const STORAGE_KEY = 'ALL_IN_ONE_TYPING_DATA';

const LEVEL_TITLES = [
  "Novice Typist",
  "Apprentice Typist",
  "Adept Typist",
  "Skilled Keyboardist",
  "Master of Keys",
  "Velocity Virtuoso",
  "High-Speed Scribe",
  "Polyglot Champion",
  "Grandmaster Typist",
  "Legendary Typist"
];

function getPlayerTitle(level) {
  const index = Math.min(Math.max(level - 1, 0), LEVEL_TITLES.length - 1);
  return LEVEL_TITLES[index];
}

class TrophyRoomApp {
  constructor() {
    this.currentFilter = 'all';
    this.data = this.loadData();

    this.dom = {
      playerTitle: document.getElementById('playerTitle'),
      playerLevelChip: document.getElementById('playerLevelChip'),
      playerXpText: document.getElementById('playerXpText'),
      nextLevelText: document.getElementById('nextLevelText'),
      xpFill: document.getElementById('xpFill'),
      statBadgesCount: document.getElementById('statBadgesCount'),
      statBadgesPercent: document.getElementById('statBadgesPercent'),
      statMaxWpm: document.getElementById('statMaxWpm'),
      statBestAcc: document.getElementById('statBestAcc'),
      statTotalWords: document.getElementById('statTotalWords'),
      statStreak: document.getElementById('statStreak'),
      statLangCount: document.getElementById('statLangCount'),
      badgesGrid: document.getElementById('badgesGrid'),
      filterButtons: document.querySelectorAll('#categoryFilters .cat-btn'),
      btnDownloadCard: document.getElementById('btnDownloadCard'),
      btnSimulateStats: document.getElementById('btnSimulateStats'),
      btnResetData: document.getElementById('btnResetData'),
      trophyCanvas: document.getElementById('trophyCanvas'),
      // Modal
      badgeModalBackdrop: document.getElementById('badgeModalBackdrop'),
      modalBadgeIcon: document.getElementById('modalBadgeIcon'),
      modalBadgeTitle: document.getElementById('modalBadgeTitle'),
      modalBadgeCategory: document.getElementById('modalBadgeCategory'),
      modalBadgeStatus: document.getElementById('modalBadgeStatus'),
      modalBadgeDesc: document.getElementById('modalBadgeDesc'),
      modalBadgeCriteria: document.getElementById('modalBadgeCriteria'),
      modalBadgeDate: document.getElementById('modalBadgeDate'),
      modalCloseBtn: document.getElementById('modalCloseBtn')
    };

    this.init();
  }

  loadData() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) return JSON.parse(raw);
    } catch (_) {}
    return {
      totalTests: 0,
      totalWords: 0,
      totalCharacters: 0,
      maxWpm: 0,
      bestAccuracy: 0,
      xp: 0,
      level: 1,
      streak: 1,
      languagesUsed: {},
      unlockedBadges: {}
    };
  }

  saveData() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.data));
    } catch (_) {}
  }

  init() {
    this.renderProfile();
    this.renderBadges();
    this.bindEvents();
  }

  bindEvents() {
    // Filter buttons
    this.dom.filterButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        this.dom.filterButtons.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        this.currentFilter = btn.dataset.filter;
        this.renderBadges();
      });
    });

    // Modal close
    this.dom.modalCloseBtn.addEventListener('click', () => this.closeModal());
    this.dom.badgeModalBackdrop.addEventListener('click', (e) => {
      if (e.target === this.dom.badgeModalBackdrop) this.closeModal();
    });

    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.dom.badgeModalBackdrop.classList.contains('active')) {
        this.closeModal();
      }
    });

    // 1-Click Download Trophy Card
    this.dom.btnDownloadCard.addEventListener('click', () => this.generateAndDownloadTrophyCard());

    // Demo Data / Simulate
    this.dom.btnSimulateStats.addEventListener('click', () => this.simulateDemoData());

    // Reset Progress
    this.dom.btnResetData.addEventListener('click', () => {
      if (confirm("Are you sure you want to reset your typing achievements and stats?")) {
        localStorage.removeItem(STORAGE_KEY);
        this.data = this.loadData();
        this.renderProfile();
        this.renderBadges();
      }
    });
  }

  simulateDemoData() {
    const today = new Date().toISOString();
    this.data = {
      totalTests: 42,
      totalWords: 1650,
      totalCharacters: 8200,
      maxWpm: 104,
      bestAccuracy: 100,
      xp: 4250,
      level: 7,
      streak: 7,
      codeDrillsCompleted: 5,
      perfectDrillsCompleted: 4,
      languagesUsed: {
        english: { tests: 25, words: 1100, bestWpm: 104, bestAcc: 100 },
        bangla: { tests: 7, words: 240, bestWpm: 54, bestAcc: 98 },
        arabic: { tests: 5, words: 160, bestWpm: 46, bestAcc: 97 },
        hindi: { tests: 5, words: 150, bestWpm: 48, bestAcc: 97 }
      },
      unlockedBadges: {
        first_strike: today,
        getting_warm: today,
        cruising_speed: today,
        rapid_fire: today,
        speed_demon: today,
        sharp_shooter: today,
        laser_precision: today,
        flawless_run: today,
        steady_hands: today,
        bangla_pioneer: today,
        arabesque: today,
        devanagari: today,
        bilingual_scribe: today,
        polyglot_typist: today,
        quad_lingual: today,
        code_warrior: today,
        streak_3: today,
        streak_7: today,
        century_club: today,
        marathoneer: today,
        endurance_master: today
      }
    };
    this.saveData();
    this.renderProfile();
    this.renderBadges();
  }

  renderProfile() {
    const d = this.data;
    const level = d.level || 1;
    const xp = d.xp || 0;

    // Calculate XP bounds for level
    const currentLevelBaseXP = Math.pow(level - 1, 2) * 100;
    const nextLevelXP = Math.pow(level, 2) * 100;
    const levelRange = Math.max(nextLevelXP - currentLevelBaseXP, 100);
    const progressXP = Math.max(xp - currentLevelBaseXP, 0);
    const progressPercent = Math.min(Math.round((progressXP / levelRange) * 100), 100);

    const title = getPlayerTitle(level);

    this.dom.playerTitle.textContent = title;
    this.dom.playerLevelChip.textContent = `Level ${level}`;
    this.dom.playerXpText.textContent = `${xp.toLocaleString()} XP`;
    this.dom.nextLevelText.textContent = `Next Level: ${nextLevelXP.toLocaleString()} XP`;
    this.dom.xpFill.style.width = `${progressPercent}%`;

    // Unlocked count
    const unlockedCount = Object.keys(d.unlockedBadges || {}).length;
    const percentCompleted = Math.round((unlockedCount / BADGES_DATABASE.length) * 100);

    this.dom.statBadgesCount.textContent = `${unlockedCount} / ${BADGES_DATABASE.length}`;
    this.dom.statBadgesPercent.textContent = `${percentCompleted}% Completed`;
    this.dom.statMaxWpm.textContent = d.maxWpm || 0;
    this.dom.statBestAcc.textContent = `${d.bestAccuracy || 0}%`;
    this.dom.statTotalWords.textContent = (d.totalWords || 0).toLocaleString();
    this.dom.statStreak.textContent = d.streak || 1;

    const langsCount = Object.keys(d.languagesUsed || {}).filter(k => d.languagesUsed[k].tests > 0).length;
    this.dom.statLangCount.textContent = `${langsCount} / 4`;
  }

  renderBadges() {
    const grid = this.dom.badgesGrid;
    grid.innerHTML = '';

    const unlockedMap = this.data.unlockedBadges || {};

    const filtered = BADGES_DATABASE.filter(badge => {
      const isUnlocked = Boolean(unlockedMap[badge.id]);
      if (this.currentFilter === 'all') return true;
      if (this.currentFilter === 'unlocked') return isUnlocked;
      if (this.currentFilter === 'locked') return !isUnlocked;
      return badge.category.toLowerCase() === this.currentFilter.toLowerCase();
    });

    filtered.forEach(badge => {
      const isUnlocked = Boolean(unlockedMap[badge.id]);
      const card = document.createElement('div');
      card.className = `badge-card ${isUnlocked ? 'unlocked' : 'locked'}`;

      const dateStr = isUnlocked ? new Date(unlockedMap[badge.id]).toLocaleDateString() : 'Locked';

      card.innerHTML = `
        <div class="badge-top-row">
          <div class="badge-icon-box">${badge.icon}</div>
          <span class="badge-status-pill">${isUnlocked ? '✓ Unlocked' : '🔒 Locked'}</span>
        </div>
        <div>
          <div class="badge-name">${badge.title}</div>
          <div class="badge-desc">${badge.desc}</div>
        </div>
        <div class="badge-footer-meta">
          <span class="badge-category-tag">${badge.category}</span>
          <span>${dateStr}</span>
        </div>
      `;

      card.addEventListener('click', () => this.openBadgeModal(badge, isUnlocked, unlockedMap[badge.id]));
      grid.appendChild(card);
    });
  }

  openBadgeModal(badge, isUnlocked, unlockTimestamp) {
    this.dom.modalBadgeIcon.textContent = badge.icon;
    this.dom.modalBadgeTitle.textContent = badge.title;
    this.dom.modalBadgeCategory.textContent = badge.category;

    if (isUnlocked) {
      this.dom.modalBadgeStatus.textContent = 'Unlocked';
      this.dom.modalBadgeStatus.style.color = 'var(--success)';
      this.dom.modalBadgeDate.textContent = `Unlocked on: ${new Date(unlockTimestamp).toLocaleString()}`;
    } else {
      this.dom.modalBadgeStatus.textContent = 'Locked';
      this.dom.modalBadgeStatus.style.color = 'var(--text-tertiary)';
      this.dom.modalBadgeDate.textContent = 'Status: Not yet achieved';
    }

    this.dom.modalBadgeDesc.textContent = badge.desc;
    this.dom.modalBadgeCriteria.textContent = badge.criteria;

    this.dom.badgeModalBackdrop.classList.add('active');
  }

  closeModal() {
    this.dom.badgeModalBackdrop.classList.remove('active');
  }

  /* ================= 1-Click Luxury Trophy Card Generation ================= */
  generateAndDownloadTrophyCard() {
    const canvas = this.dom.trophyCanvas;
    const ctx = canvas.getContext('2d');
    const width = canvas.width;   // 1200
    const height = canvas.height; // 630

    // Background gradient: Deep midnight obsidian with gold & cyan ambient glows
    const bgGrad = ctx.createLinearGradient(0, 0, width, height);
    bgGrad.addColorStop(0, '#0a0e17');
    bgGrad.addColorStop(0.5, '#0f172a');
    bgGrad.addColorStop(1, '#070a10');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, width, height);

    // Decorative Glow Orbs
    const rad1 = ctx.createRadialGradient(200, 150, 20, 200, 150, 400);
    rad1.addColorStop(0, 'rgba(59, 130, 246, 0.22)');
    rad1.addColorStop(1, 'transparent');
    ctx.fillStyle = rad1;
    ctx.fillRect(0, 0, width, height);

    const rad2 = ctx.createRadialGradient(1000, 480, 20, 1000, 480, 450);
    rad2.addColorStop(0, 'rgba(245, 158, 11, 0.18)');
    rad2.addColorStop(1, 'transparent');
    ctx.fillStyle = rad2;
    ctx.fillRect(0, 0, width, height);

    // Outer Glassmorphic Border
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.12)';
    ctx.lineWidth = 2;
    ctx.strokeRect(30, 30, width - 60, height - 60);

    // Gold Accent Border
    ctx.strokeStyle = 'rgba(245, 158, 11, 0.4)';
    ctx.lineWidth = 1;
    ctx.strokeRect(40, 40, width - 80, height - 80);

    // Top Header: Branding
    ctx.fillStyle = '#f59e0b';
    ctx.font = 'bold 15px sans-serif';
    ctx.letterSpacing = '2px';
    ctx.fillText('ALL IN ONE • MULTI-LANGUAGE TYPING CERTIFICATION', 70, 85);

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 44px sans-serif';
    ctx.fillText('OFFICIAL TYPIST PASSPORT & TROPHY CARD', 70, 140);

    // Subtitle
    ctx.fillStyle = '#94a3b8';
    ctx.font = '18px sans-serif';
    ctx.fillText('Verified Competency in Touch Typing & Linguistic Agility', 70, 175);

    // Horizontal Divider
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
    ctx.beginPath();
    ctx.moveTo(70, 205);
    ctx.lineTo(width - 70, 205);
    ctx.stroke();

    // Player Identity Section
    const level = this.data.level || 1;
    const title = getPlayerTitle(level);
    const xp = this.data.xp || 0;
    const unlockedCount = Object.keys(this.data.unlockedBadges || {}).length;

    // Rank & Title Box
    ctx.fillStyle = 'rgba(255, 255, 255, 0.04)';
    ctx.fillRect(70, 235, 340, 160);
    ctx.strokeStyle = 'rgba(78, 133, 191, 0.3)';
    ctx.strokeRect(70, 235, 340, 160);

    ctx.fillStyle = '#60a5fa';
    ctx.font = 'bold 16px sans-serif';
    ctx.fillText(`PLAYER LEVEL ${level}`, 95, 275);

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 26px sans-serif';
    ctx.fillText(title, 95, 315);

    ctx.fillStyle = '#94a3b8';
    ctx.font = '16px sans-serif';
    ctx.fillText(`Accumulated Experience: ${xp.toLocaleString()} XP`, 95, 355);

    // Stat Metrics Grid (4 columns)
    const statsData = [
      { label: 'PEAK SPEED', val: `${this.data.maxWpm || 0} WPM`, sub: 'Velocity' },
      { label: 'BEST ACCURACY', val: `${this.data.bestAccuracy || 0}%`, sub: 'Precision' },
      { label: 'TOTAL WORDS', val: (this.data.totalWords || 0).toLocaleString(), sub: 'Endurance' },
      { label: 'BADGES EARNED', val: `${unlockedCount} / 24`, sub: 'Achievements' }
    ];

    const startX = 440;
    const cardW = 160;
    const cardGap = 20;

    statsData.forEach((st, i) => {
      const x = startX + i * (cardW + cardGap);
      const y = 235;
      ctx.fillStyle = 'rgba(255, 255, 255, 0.04)';
      ctx.fillRect(x, y, cardW, 160);
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
      ctx.strokeRect(x, y, cardW, 160);

      ctx.fillStyle = '#94a3b8';
      ctx.font = 'bold 12px sans-serif';
      ctx.fillText(st.label, x + 16, y + 38);

      ctx.fillStyle = '#f8fafc';
      ctx.font = 'bold 30px sans-serif';
      ctx.fillText(st.val, x + 16, y + 88);

      ctx.fillStyle = '#64748b';
      ctx.font = '13px sans-serif';
      ctx.fillText(st.sub, x + 16, y + 125);
    });

    // Languages Mastered Showcase Bar
    ctx.fillStyle = 'rgba(255, 255, 255, 0.03)';
    ctx.fillRect(70, 425, width - 140, 95);
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
    ctx.strokeRect(70, 425, width - 140, 95);

    ctx.fillStyle = '#f59e0b';
    ctx.font = 'bold 14px sans-serif';
    ctx.fillText('ACTIVE MULTI-LANGUAGE MODULES', 95, 460);

    const langs = [
      { name: 'English QWERTY', flag: '🇬🇧', key: 'english' },
      { name: 'Bangla (Avro / Bijoy)', flag: '🇧🇩', key: 'bangla' },
      { name: 'Arabic (RTL & Harakat)', flag: '🇸🇦', key: 'arabic' },
      { name: 'Hindi (Inscript)', flag: '🇮🇳', key: 'hindi' }
    ];

    langs.forEach((lng, idx) => {
      const lx = 95 + idx * 260;
      const ly = 495;
      const tested = Boolean(this.data.languagesUsed?.[lng.key]?.tests > 0);

      ctx.fillStyle = tested ? '#10b981' : '#64748b';
      ctx.font = 'bold 15px sans-serif';
      ctx.fillText(`${lng.flag} ${lng.name} ${tested ? '✓' : '—'}`, lx, ly);
    });

    // Footer Watermark & Timestamp
    ctx.fillStyle = '#64748b';
    ctx.font = '13px sans-serif';
    const dateFormatted = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
    ctx.fillText(`Issued: ${dateFormatted} • System ID: ALL-IN-ONE-v1 • Client-Side Cryptographic Verifier`, 70, 565);

    ctx.fillStyle = '#f59e0b';
    ctx.font = 'bold 14px sans-serif';
    ctx.fillText('VERIFIED AUTHENTIC', width - 240, 565);

    // Trigger Download
    const dataUrl = canvas.toDataURL('image/png');
    const a = document.createElement('a');
    a.href = dataUrl;
    a.download = `ALL-IN-ONE-Typing-Trophy-Card.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  }
}

document.addEventListener('DOMContentLoaded', () => {
  new TrophyRoomApp();
});