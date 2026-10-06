// YouTube Title Generator Logic

const POWER_WORDS = [
  'SHOCKING', 'SECRET', 'PROVEN', 'INSANE', 'ULTIMATE', 'DEADLY', 'MISTAKE', 'WARNING', 
  'UNBELIEVABLE', 'REVEALED', 'EXPOSED', 'HACK', 'DESTROYED', 'CRITICAL', 'WORST', 'GENIUS', 
  'HIDDEN', 'NEVER', 'FOREVER', 'TRUTH', 'MASSIVE', 'EASY', 'FAST', 'FREE', 'FORMULA', 
  'STEP-BY-STEP', 'INSTANTLY', 'POWERFUL', 'CRAZY', 'FORBIDDEN', 'CRASH', 'EXPLODED', 
  'SURPRISING', 'RANKED', 'VIRAL', 'UNREAL', 'PERFECT', 'BRUTAL', 'LIFE-CHANGING', 'TRANSFORM', 
  'STOP', 'AVOID', 'MASTER', 'ESSENTIAL', 'URGENT', 'UNSTOPPABLE', 'ELITE', 'MAGIC'
];

const RANDOM_INSPIRATIONS = [
  { topic: "Build a Full-Stack Web App", niche: "tech", number: 5, time: "48 Hours" },
  { topic: "Minecraft Hardcore Survival", niche: "gaming", number: 100, time: "100 Days" },
  { topic: "Quit My 9 to 5 Job", niche: "business", number: 3, time: "6 Months" },
  { topic: "Solo Travel Across Japan", niche: "vlogs", number: 10, time: "14 Days" },
  { topic: "Quantum Computing Explained", niche: "education", number: 7, time: "15 Minutes" },
  { topic: "Lose 15 Lbs & Build Muscle", niche: "fitness", number: 5, time: "30 Days" },
  { topic: "Master ChatGPT & AI Agents", niche: "productivity", number: 10, time: "1 Week" }
];

document.addEventListener('DOMContentLoaded', () => {
  // Elements
  const topicInput = document.getElementById('topic-input');
  const nicheSelect = document.getElementById('niche-select');
  const toneSelect = document.getElementById('tone-select');
  const keyNumberInput = document.getElementById('key-number');
  const timeFrameInput = document.getElementById('time-frame');
  const generateBtn = document.getElementById('generate-btn');
  const randomBtn = document.getElementById('random-btn');
  const titlesContainer = document.getElementById('titles-container');
  const copyAllBtn = document.getElementById('copy-all-btn');
  const exportCsvBtn = document.getElementById('export-csv-btn');
  const titleCountBadge = document.getElementById('title-count-badge');
  const savedCountBadge = document.getElementById('saved-count-badge');
  const appToast = document.getElementById('app-toast');
  const analyzerInput = document.getElementById('analyzer-input');
  const favoritesContainer = document.getElementById('favorites-container');
  const clearFavoritesBtn = document.getElementById('clear-favorites-btn');

  let currentTitles = [];
  let currentFilter = 'all';
  let activeStyle = 'all';
  let savedTitles = JSON.parse(localStorage.getItem('yt_saved_titles') || '[]');

  // Toast Helper
  let toastTimer = null;
  function showToast(msg) {
    if (toastTimer) clearTimeout(toastTimer);
    appToast.textContent = msg;
    appToast.classList.add('show');
    toastTimer = setTimeout(() => {
      appToast.classList.remove('show');
    }, 2200);
  }

  // Update Saved Count Badge
  function updateSavedCount() {
    savedCountBadge.textContent = savedTitles.length;
    renderFavorites();
  }

  // Style chips
  document.querySelectorAll('#style-selector .style-chip').forEach(chip => {
    chip.addEventListener('click', () => {
      document.querySelectorAll('#style-selector .style-chip').forEach(c => c.classList.remove('active'));
      chip.classList.add('active');
      activeStyle = chip.dataset.style;
    });
  });

  // Tab navigation
  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
      document.querySelectorAll('.tab-content').forEach(c => c.style.display = 'none');
      btn.classList.add('active');
      const target = document.getElementById(btn.dataset.tab);
      if (target) target.style.display = 'block';

      if (btn.dataset.tab === 'tab-analyzer' && !analyzerInput.value && currentTitles.length > 0) {
        analyzerInput.value = currentTitles[0].title;
        analyzeCustomTitle(currentTitles[0].title);
      }
    });
  });

  // Filter pills
  document.querySelectorAll('#result-filters .filter-pill').forEach(pill => {
    pill.addEventListener('click', () => {
      document.querySelectorAll('#result-filters .filter-pill').forEach(p => p.classList.remove('active'));
      pill.classList.add('active');
      currentFilter = pill.dataset.filter;
      renderTitles();
    });
  });

  // Power Word Highlighter
  function highlightPowerWords(text) {
    let result = text;
    POWER_WORDS.forEach(word => {
      const regex = new RegExp(`\\b(${word})\\b`, 'gi');
      result = result.replace(regex, '<span class="power-word">$1</span>');
    });
    return result;
  }

  function getDetectedPowerWords(text) {
    const found = [];
    POWER_WORDS.forEach(word => {
      const regex = new RegExp(`\\b${word}\\b`, 'i');
      if (regex.test(text)) {
        found.push(word.toUpperCase());
      }
    });
    return found;
  }

  // CTR Score Calculator
  function calculateCTRScore(title) {
    let score = 70; // baseline
    const len = title.length;
    const powerWords = getDetectedPowerWords(title);
    
    // Optimal length: 45 - 65 chars
    if (len >= 45 && len <= 65) {
      score += 15;
    } else if (len >= 35 && len <= 70) {
      score += 8;
    } else if (len > 75) {
      score -= 8;
    }

    // Power words
    score += Math.min(powerWords.length * 5, 12);

    // Has numbers
    if (/\d+/.test(title)) {
      score += 6;
    }

    // Has brackets or parentheses
    if (/[\(\)\[\]]/.test(title)) {
      score += 4;
    }

    // Has emotional triggers or curiosity
    if (/\b(why|how|secret|truth|never|stop|tested|before|best)\b/i.test(title)) {
      score += 4;
    }

    return Math.min(Math.max(score, 65), 99);
  }

  // Title Generator Engine
  function generateTitles() {
    const rawTopic = topicInput.value.trim() || 'Video Marketing';
    const num = keyNumberInput.value.trim() || '7';
    const time = timeFrameInput.value.trim() || '30 Days';
    const niche = nicheSelect.value;
    const tone = toneSelect.value;

    // Capitalize topic words
    const topic = rawTopic.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');

    const templates = [];

    // How-To Templates
    templates.push(
      { style: 'how-to', t: `How I Mastered ${topic} in ${time} (Step-by-Step)` },
      { style: 'how-to', t: `How to Learn ${topic} Faster Than 99% of People` },
      { style: 'how-to', t: `How to Actually ${topic} in 2026 (Without the BS)` },
      { style: 'how-to', t: `How Anyone Can Do ${topic} from Scratch (Proven Formula)` },
      { style: 'how-to', t: `How I Scaled ${topic} to the Next Level (Full Blueprint)` }
    );

    // Listicle Templates
    templates.push(
      { style: 'listicle', t: `${num} ${topic} Secrets That Changed My Life Forever` },
      { style: 'listicle', t: `Top ${num} Deadly ${topic} Mistakes to STOP Making` },
      { style: 'listicle', t: `${num} Insane ${topic} Hacks You Need to Try in 2026` },
      { style: 'listicle', t: `${num} Things I Wish I Knew Before Starting ${topic}` },
      { style: 'listicle', t: `Ranked: The ${num} Best Ways to Master ${topic}` }
    );

    // Mystery & Curiosity Templates
    templates.push(
      { style: 'mystery', t: `The Shocking Truth About ${topic} Nobody Talks About` },
      { style: 'mystery', t: `Why 95% Fail at ${topic} (The Brutal Reality)` },
      { style: 'mystery', t: `The Hidden ${topic} Secret the Pros Don't Want You to Know` },
      { style: 'mystery', t: `I Tested ${topic} for ${time} and This Happened...` },
      { style: 'mystery', t: `What Really Happens When You Try ${topic}? (Revealed)` }
    );

    // High Stakes & Challenge Templates
    templates.push(
      { style: 'high-stakes', t: `I Spent 100 Hours on ${topic} So You Don't Have To` },
      { style: 'high-stakes', t: `Can You Master ${topic} in Only ${time}? (Ultimate Test)` },
      { style: 'high-stakes', t: `I Tried the Most Extreme ${topic} Method on Earth` },
      { style: 'high-stakes', t: `I Risked Everything on ${topic} - Was It Worth It?` },
      { style: 'high-stakes', t: `I Built the Ultimate ${topic} in ${time} (Insane Result)` }
    );

    // Question Templates
    templates.push(
      { style: 'question', t: `Is ${topic} Still Worth It in 2026? (Honest Review)` },
      { style: 'question', t: `Why Does Everyone Get ${topic} Completely Wrong?` },
      { style: 'question', t: `Are You Making This Critical ${topic} Mistake?` },
      { style: 'question', t: `Can ${topic} Actually Change Your Life in ${time}?` },
      { style: 'question', t: `What Happens If You Master ${topic} Today?` }
    );

    // Niche specific overlays
    if (niche === 'tech') {
      templates.push(
        { style: 'how-to', t: `Don't Learn ${topic} in 2026 Without Watching This!` },
        { style: 'mystery', t: `Why Senior Engineers Stop Using ${topic}` }
      );
    } else if (niche === 'gaming') {
      templates.push(
        { style: 'high-stakes', t: `I Survived ${num} Days of ${topic} on Hardcore Mode` },
        { style: 'mystery', t: `The Forbidden ${topic} Strategy That Broke the Game` }
      );
    } else if (niche === 'fitness') {
      templates.push(
        { style: 'how-to', t: `The Only ${topic} Routine You Will Ever Need (${time})` },
        { style: 'mystery', t: `Stop Doing ${topic} Like This (It's Ruining Your Gains)` }
      );
    } else if (niche === 'business') {
      templates.push(
        { style: 'listicle', t: `${num} Simple ${topic} Strategies That Make Real Money` },
        { style: 'high-stakes', t: `How I Turned ${topic} Into a Full-Time Income` }
      );
    }

    // Filter by activeStyle if specific style selected
    let filteredList = templates;
    if (activeStyle !== 'all') {
      filteredList = templates.filter(item => item.style === activeStyle);
      // If too few, append others
      if (filteredList.length < 10) {
        filteredList = filteredList.concat(templates.filter(item => item.style !== activeStyle).slice(0, 10 - filteredList.length));
      }
    }

    // Build title objects with metadata
    currentTitles = filteredList.map(item => {
      const ctr = calculateCTRScore(item.t);
      const powerWords = getDetectedPowerWords(item.t);
      return {
        id: 't_' + Math.random().toString(36).substr(2, 9),
        title: item.t,
        style: item.style,
        length: item.t.length,
        ctr: ctr,
        powerWords: powerWords
      };
    });

    // Sort by CTR descending initially
    currentTitles.sort((a, b) => b.ctr - a.ctr);

    renderTitles();
    showToast(`Generated ${currentTitles.length} optimized titles!`);
  }

  // Render titles in Generated Tab
  function renderTitles() {
    titlesContainer.innerHTML = '';

    // Filter titles
    let list = currentTitles;
    if (currentFilter === 'high-ctr') {
      list = currentTitles.filter(t => t.ctr >= 90);
    } else if (currentFilter === 'optimal-len') {
      list = currentTitles.filter(t => t.length <= 65);
    } else if (currentFilter === 'power') {
      list = currentTitles.filter(t => t.powerWords.length >= 2);
    }

    // Update filter counts
    document.getElementById('filter-all-count').textContent = currentTitles.length;
    document.getElementById('filter-high-count').textContent = currentTitles.filter(t => t.ctr >= 90).length;
    document.getElementById('filter-len-count').textContent = currentTitles.filter(t => t.length <= 65).length;
    document.getElementById('filter-power-count').textContent = currentTitles.filter(t => t.powerWords.length >= 2).length;
    titleCountBadge.textContent = currentTitles.length;

    if (list.length === 0) {
      titlesContainer.innerHTML = `
        <div style="text-align: center; padding: 3rem 1rem; color: var(--text-secondary);">
          <svg viewBox="0 0 24 24" width="48" height="48" fill="none" stroke="currentColor" stroke-width="1.5" style="margin-bottom: 0.5rem;"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
          <p>No titles matched this filter. Try selecting 'All' or click Generate!</p>
        </div>
      `;
      return;
    }

    list.forEach(item => {
      const isSaved = savedTitles.some(s => s.title === item.title);
      const isOptimalLen = item.length >= 40 && item.length <= 65;
      const isWarningLen = item.length > 70;

      const card = document.createElement('div');
      card.className = 'title-card';
      card.innerHTML = `
        <div class="title-card-main">${highlightPowerWords(item.title)}</div>
        <div class="title-meta-bar">
          <div class="meta-badges">
            <span class="badge-ctr ${item.ctr >= 88 ? 'high' : 'med'}">
              ⚡ ${item.ctr}% CTR Score
            </span>
            <span class="badge-len ${isOptimalLen ? 'optimal' : (isWarningLen ? 'warning' : '')}">
              ${item.length} chars ${isOptimalLen ? '• Optimal' : (isWarningLen ? '• May Cutoff' : '')}
            </span>
            <span class="badge-len">
              ${item.style.toUpperCase()}
            </span>
            ${item.powerWords.length > 0 ? `<span class="badge-len" style="color: #fbbf24;">✨ ${item.powerWords.length} Power ${item.powerWords.length === 1 ? 'Word' : 'Words'}</span>` : ''}
          </div>
          <div class="card-actions">
            <button class="mini-btn copy-title-btn" data-title="${encodeURIComponent(item.title)}">
              <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
              Copy
            </button>
            <button class="mini-btn star-title-btn ${isSaved ? 'starred' : ''}" data-title="${encodeURIComponent(item.title)}">
              <svg viewBox="0 0 24 24" width="13" height="13" fill="${isSaved ? 'currentColor' : 'none'}" stroke="currentColor" stroke-width="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>
              ${isSaved ? 'Saved' : 'Save'}
            </button>
            <button class="mini-btn test-title-btn" data-title="${encodeURIComponent(item.title)}" title="Test in Live Mockup">
              <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
              Test
            </button>
          </div>
        </div>
      `;

      // Copy Single Title
      card.querySelector('.copy-title-btn').addEventListener('click', (e) => {
        const text = decodeURIComponent(e.currentTarget.dataset.title);
        navigator.clipboard.writeText(text).then(() => {
          showToast(`Copied: "${text.substring(0, 30)}..."`);
        });
      });

      // Star / Save Title
      card.querySelector('.star-title-btn').addEventListener('click', (e) => {
        const text = decodeURIComponent(e.currentTarget.dataset.title);
        const idx = savedTitles.findIndex(s => s.title === text);
        if (idx > -1) {
          savedTitles.splice(idx, 1);
          showToast('Removed from favorites');
        } else {
          savedTitles.push({ title: text, date: new Date().toLocaleDateString() });
          showToast('Added to favorites!');
        }
        localStorage.setItem('yt_saved_titles', JSON.stringify(savedTitles));
        updateSavedCount();
        renderTitles();
      });

      // Test Title
      card.querySelector('.test-title-btn').addEventListener('click', (e) => {
        const text = decodeURIComponent(e.currentTarget.dataset.title);
        document.querySelector('.tab-btn[data-tab="tab-analyzer"]').click();
        analyzerInput.value = text;
        analyzeCustomTitle(text);
      });

      titlesContainer.appendChild(card);
    });
  }

  // Render Favorites
  function renderFavorites() {
    favoritesContainer.innerHTML = '';
    if (savedTitles.length === 0) {
      favoritesContainer.innerHTML = `
        <div style="text-align: center; padding: 2.5rem; color: var(--text-secondary);">
          <p>No saved titles yet. Click the "Save" button on any generated title to store it here.</p>
        </div>
      `;
      return;
    }

    savedTitles.forEach((item, index) => {
      const card = document.createElement('div');
      card.className = 'title-card';
      card.innerHTML = `
        <div class="title-card-main">${item.title}</div>
        <div class="title-meta-bar">
          <span style="font-size: 0.75rem; color: var(--text-secondary);">Saved on ${item.date || 'today'}</span>
          <div class="card-actions">
            <button class="mini-btn copy-fav-btn" data-idx="${index}">
              <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
              Copy
            </button>
            <button class="mini-btn remove-fav-btn" data-idx="${index}" style="color: #ef4444;">
              <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
              Remove
            </button>
          </div>
        </div>
      `;

      card.querySelector('.copy-fav-btn').addEventListener('click', () => {
        navigator.clipboard.writeText(item.title).then(() => {
          showToast(`Copied favorite title!`);
        });
      });

      card.querySelector('.remove-fav-btn').addEventListener('click', () => {
        savedTitles.splice(index, 1);
        localStorage.setItem('yt_saved_titles', JSON.stringify(savedTitles));
        updateSavedCount();
        renderTitles();
        showToast('Removed title');
      });

      favoritesContainer.appendChild(card);
    });
  }

  // Clear favorites
  clearFavoritesBtn.addEventListener('click', () => {
    if (savedTitles.length === 0) return;
    if (confirm('Clear all saved favorite titles?')) {
      savedTitles = [];
      localStorage.removeItem('yt_saved_titles');
      updateSavedCount();
      renderTitles();
      showToast('Cleared all saved titles');
    }
  });

  // Live Title Analyzer
  function analyzeCustomTitle(title) {
    const text = title.trim();
    const ctrVal = document.getElementById('metric-ctr-val');
    const ctrLabel = document.getElementById('metric-ctr-label');
    const lenVal = document.getElementById('metric-len-val');
    const lenLabel = document.getElementById('metric-len-label');
    const powerVal = document.getElementById('metric-power-val');
    const powerLabel = document.getElementById('metric-power-label');
    const mockupPreview = document.getElementById('mockup-title-preview');
    const recs = document.getElementById('analyzer-recommendations');

    if (!text) {
      ctrVal.textContent = '--';
      ctrLabel.textContent = 'Enter title to analyze';
      lenVal.textContent = '0 / 70';
      powerVal.textContent = '0';
      mockupPreview.textContent = 'Enter a title to see the realistic feed preview...';
      recs.innerHTML = '<p style="color: var(--text-secondary);">Start typing above to see detailed algorithmic feedback and CTR tips.</p>';
      return;
    }

    const ctr = calculateCTRScore(text);
    const len = text.length;
    const powerWords = getDetectedPowerWords(text);

    // Update metrics
    ctrVal.textContent = `${ctr}%`;
    ctrLabel.textContent = ctr >= 90 ? '🔥 Exceptional CTR Potential' : (ctr >= 80 ? '👍 Good Clickability' : '⚠️ Needs Optimization');
    ctrVal.style.color = ctr >= 90 ? '#34d399' : (ctr >= 80 ? '#fbbf24' : '#f87171');

    lenVal.textContent = `${len} / 70`;
    if (len >= 45 && len <= 65) {
      lenLabel.textContent = '✅ Optimal length for desktop & mobile';
      lenVal.style.color = '#34d399';
    } else if (len > 70) {
      lenLabel.textContent = '⚠️ Truncation risk on mobile devices';
      lenVal.style.color = '#f87171';
    } else {
      lenLabel.textContent = 'ℹ️ A bit short, consider adding detail';
      lenVal.style.color = '#38bdf8';
    }

    powerVal.textContent = powerWords.length;
    powerLabel.textContent = powerWords.length > 0 ? `Detected: ${powerWords.slice(0, 3).join(', ')}` : 'None detected';

    // Mockup update
    mockupPreview.textContent = text;

    // Detailed recommendations
    const advice = [];
    if (len > 70) {
      advice.push(`<li><strong>Shorten Title:</strong> YouTube cuts titles off after ~70 characters on mobile. Try removing unnecessary words to keep viewers from seeing "..."</li>`);
    } else if (len < 40) {
      advice.push(`<li><strong>Add Context:</strong> Titles under 40 characters often underperform. Try adding bracketed context like <em>(Step-by-Step)</em> or <em>[Full Guide]</em>.</li>`);
    } else {
      advice.push(`<li><strong>Length is Great:</strong> Perfectly sized for full visibility across YouTube desktop, mobile app, and suggested video feeds.</li>`);
    }

    if (powerWords.length === 0) {
      advice.push(`<li><strong>Add an Emotional Power Word:</strong> Try incorporating words like <em>Proven, Ultimate, Secret, Insane, Mistakes, or Step-by-Step</em> to hook viewer attention.</li>`);
    } else {
      advice.push(`<li><strong>Power Words Detected:</strong> Good job using ${powerWords.join(', ')} to generate curiosity.</li>`);
    }

    if (!/\d+/.test(text)) {
      advice.push(`<li><strong>Consider Numbers:</strong> Numbers (e.g. "7 Ways", "30 Days", "in 2026") set clear viewer expectations and increase click rates by up to 23%.</li>`);
    }

    if (!/[A-Z]/.test(text.charAt(0))) {
      advice.push(`<li><strong>Title Capitalization:</strong> Capitalize the first letter of each major word for a professional aesthetic.</li>`);
    }

    recs.innerHTML = `
      <div style="font-weight: 700; margin-bottom: 0.5rem; color: var(--text-primary);">Algorithm & CTR Insights:</div>
      <ul style="padding-left: 1.25rem; display: flex; flex-direction: column; gap: 0.4rem; color: var(--text-secondary);">
        ${advice.join('')}
      </ul>
    `;
  }

  // Analyzer Input Event
  analyzerInput.addEventListener('input', (e) => {
    analyzeCustomTitle(e.target.value);
  });

  // Copy All Titles
  copyAllBtn.addEventListener('click', () => {
    if (currentTitles.length === 0) {
      showToast('No titles to copy');
      return;
    }
    const allText = currentTitles.map((t, idx) => `${idx + 1}. ${t.title} [CTR: ${t.ctr}%]`).join('\n');
    navigator.clipboard.writeText(allText).then(() => {
      showToast(`Copied ${currentTitles.length} titles to clipboard!`);
    });
  });

  // Export CSV
  exportCsvBtn.addEventListener('click', () => {
    if (currentTitles.length === 0) {
      showToast('No titles to export');
      return;
    }
    let csvContent = 'data:text/csv;charset=utf-8,Title,CTR Score,Character Length,Style,Power Words\n';
    currentTitles.forEach(t => {
      const escaped = `"${t.title.replace(/"/g, '""')}"`;
      const powerStr = `"${t.powerWords.join('; ')}"`;
      csvContent += `${escaped},${t.ctr}%,${t.length},${t.style},${powerStr}\n`;
    });
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `youtube-titles-${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Exported CSV file!');
  });

  // Random Inspiration Button
  randomBtn.addEventListener('click', () => {
    const randomItem = RANDOM_INSPIRATIONS[Math.floor(Math.random() * RANDOM_INSPIRATIONS.length)];
    topicInput.value = randomItem.topic;
    nicheSelect.value = randomItem.niche;
    keyNumberInput.value = randomItem.number;
    timeFrameInput.value = randomItem.time;
    generateTitles();
  });

  // Generate Button Click
  generateBtn.addEventListener('click', () => {
    generateTitles();
  });

  // Initial Run
  updateSavedCount();
  generateTitles();
});