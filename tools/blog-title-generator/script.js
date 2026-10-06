// Blog Title Generator - Client-Side Interactive Engine

const POWER_WORDS_DICT = [
  'ULTIMATE', 'PROVEN', 'SECRET', 'SECRETS', 'STEP-BY-STEP', 'FATAL', 'ESSENTIAL', 
  'HACK', 'HACKS', 'CRITICAL', 'EASY', 'FAST', 'COMPLETE', 'POWERFUL', 'DEADLY', 
  'REVEALED', 'EXPOSED', 'GUARANTEED', 'SHOCKING', 'EFFORTLESS', 'INSANE', 'MASTER', 
  'PROFITABLE', 'EXPLOSIVE', 'UNVEILED', 'SURPRISING', 'MISTAKES', 'MISTAKE', 'WARNING',
  'MASSIVE', 'SIMPLE', 'MAGIC', 'FREE', 'FAIL-PROOF', 'INSTANT', 'EPIC', 'DISCOVER',
  'UNSTOPPABLE', 'IRRESISTIBLE', 'HIDDEN', 'FOOLPROOF', 'TRANSFORM', 'TRUTH'
];

const RANDOM_INSPIRATIONS = [
  { topic: "Email Marketing Automation", audience: "Small Business Owners", niche: "marketing", tone: "high-ctr" },
  { topic: "Remote Team Management", audience: "Startup Founders", niche: "business", tone: "authoritative" },
  { topic: "Next.js 15 Web Performance", audience: "Frontend Developers", niche: "tech", tone: "practical" },
  { topic: "High-Yield Dividend Investing", audience: "Beginner Investors", niche: "finance", tone: "high-ctr" },
  { topic: "Intermittent Fasting for Fat Loss", audience: "Busy Professionals", niche: "health", tone: "urgent" },
  { topic: "E-Commerce Conversion Rate Optimization", audience: "Shopify Store Owners", niche: "ecommerce", tone: "practical" },
  { topic: "Deep Work & Daily Productivity", audience: "Knowledge Workers", niche: "productivity", tone: "curiosity" }
];

document.addEventListener('DOMContentLoaded', () => {
  // Elements
  const topicInput = document.getElementById('topic-input');
  const audienceInput = document.getElementById('audience-input');
  const nicheSelect = document.getElementById('niche-select');
  const toneSelect = document.getElementById('tone-select');
  const yearSelect = document.getElementById('year-select');
  const generateBtn = document.getElementById('generate-btn');
  const randomBtn = document.getElementById('random-btn');
  const filterSearch = document.getElementById('filter-search');
  const formulaChips = document.getElementById('formula-chips');
  const copyAllBtn = document.getElementById('copy-all-btn');
  const exportTxtBtn = document.getElementById('export-txt-btn');
  const countBadge = document.getElementById('count-badge');
  const favCountBadge = document.getElementById('fav-count-badge');
  const headlinesContainer = document.getElementById('headlines-container');
  const favoritesContainer = document.getElementById('favorites-container');
  const clearFavoritesBtn = document.getElementById('clear-favorites-btn');
  const appToast = document.getElementById('app-toast');

  // Stats Elements
  const statTotalCount = document.getElementById('stat-total-count');
  const statAvgCtr = document.getElementById('stat-avg-ctr');
  const statPowerWords = document.getElementById('stat-power-words');
  const statOptimalLen = document.getElementById('stat-optimal-len');

  // Tab elements
  const tabButtons = document.querySelectorAll('.tab-btn');
  const tabViews = document.querySelectorAll('.tab-view');

  let currentHeadlines = [];
  let activeFormula = 'all';
  let savedFavorites = JSON.parse(localStorage.getItem('blog_saved_titles') || '[]');

  // Toast Helper
  let toastTimer = null;
  function showToast(message) {
    if (toastTimer) clearTimeout(toastTimer);
    appToast.textContent = message;
    appToast.classList.add('show');
    toastTimer = setTimeout(() => {
      appToast.classList.remove('show');
    }, 2400);
  }

  // Capitalize Helper
  function cleanTopic(str) {
    if (!str) return 'Your Topic';
    return str.trim().replace(/\s+/g, ' ');
  }

  function cleanAudience(str) {
    if (!str || !str.trim()) return 'Readers';
    return str.trim();
  }

  // Calculate CTR and Metadata
  function analyzeHeadline(title, formulaKey, formulaLabel) {
    const chars = title.length;
    const words = title.trim().split(/\s+/).length;

    // Detect power words
    const upperTitle = title.toUpperCase();
    const detectedPowerWords = [];
    POWER_WORDS_DICT.forEach(pw => {
      const regex = new RegExp(`\\b${pw}\\b`, 'i');
      if (regex.test(upperTitle) && !detectedPowerWords.includes(pw)) {
        detectedPowerWords.push(pw);
      }
    });

    // Length rating: 50-65 optimal, 40-75 acceptable
    let lengthStatus = 'warning';
    let lengthPercentage = Math.min(100, Math.round((chars / 70) * 100));
    if (chars >= 48 && chars <= 68) {
      lengthStatus = 'optimal';
    } else if (chars > 78 || chars < 35) {
      lengthStatus = 'danger';
    }

    // CTR scoring
    let score = 64;
    if (lengthStatus === 'optimal') score += 12;
    else if (lengthStatus === 'warning') score += 5;
    else score -= 6;

    if (/\d+/.test(title)) score += 8; // Contains numbers
    if (/\[.*?\]|\(.*?\)/.test(title)) score += 7; // Brackets/Parentheses
    if (/:|—|-/.test(title)) score += 4; // Sub-headline punctuation
    if (detectedPowerWords.length > 0) {
      score += Math.min(16, detectedPowerWords.length * 6);
    }

    // Tone modifiers
    if (/how to/i.test(title) || /why/i.test(title)) score += 3;

    // Clamp score
    score = Math.min(98, Math.max(55, score));

    return {
      id: 'h-' + Math.random().toString(36).substring(2, 9),
      title,
      formulaKey,
      formulaLabel,
      chars,
      words,
      lengthStatus,
      lengthPercentage,
      ctrScore: score,
      powerWords: detectedPowerWords
    };
  }

  // Headline Generation Algorithms
  function generateAllHeadlines() {
    const topic = cleanTopic(topicInput.value);
    const audience = cleanAudience(audienceInput.value);
    const year = yearSelect.value ? ` (${yearSelect.value})` : '';
    const yrStr = yearSelect.value || '2026';
    const listCountA = 7;
    const listCountB = 11;
    const listCountC = 17;

    const rawList = [];

    // Formula 1: How-To Guides
    rawList.push({
      formulaKey: 'how-to',
      formulaLabel: 'How-To Guide',
      title: `How to Master ${topic} in 30 Days: A Proven Step-by-Step Guide for ${audience}`
    });
    rawList.push({
      formulaKey: 'how-to',
      formulaLabel: 'How-To Guide',
      title: `How Any ${audience} Can Easily Succeed at ${topic} Without Costly Mistakes`
    });
    rawList.push({
      formulaKey: 'how-to',
      formulaLabel: 'How-To Guide',
      title: `How to 10x Your ${topic} Results: The Complete ${yrStr} Blueprint`
    });
    rawList.push({
      formulaKey: 'how-to',
      formulaLabel: 'How-To Guide',
      title: `How Smart ${audience} Use ${topic} to Outperform Everyone Else [Tutorial]`
    });

    // Formula 2: Numbered Listicles
    rawList.push({
      formulaKey: 'listicle',
      formulaLabel: 'Numbered Listicle',
      title: `${listCountA} Proven ${topic} Strategies Every ${audience} Should Know in ${yrStr}`
    });
    rawList.push({
      formulaKey: 'listicle',
      formulaLabel: 'Numbered Listicle',
      title: `${listCountB} Fatal ${topic} Mistakes ${audience} Keep Making (And Quick Fixes)`
    });
    rawList.push({
      formulaKey: 'listicle',
      formulaLabel: 'Numbered Listicle',
      title: `${listCountC} Essential ${topic} Hacks That Will Save You Hours Every Week`
    });
    rawList.push({
      formulaKey: 'listicle',
      formulaLabel: 'Numbered Listicle',
      title: `${listCountA} Unspoken Rules of ${topic} for Modern ${audience}`
    });

    // Formula 3: Ultimate Manuals
    rawList.push({
      formulaKey: 'ultimate',
      formulaLabel: 'Ultimate Manual',
      title: `The Ultimate Guide to ${topic}: Everything ${audience} Needs to Know${year}`
    });
    rawList.push({
      formulaKey: 'ultimate',
      formulaLabel: 'Ultimate Manual',
      title: `The Complete ${yrStr} Playbook for ${topic} [Free Downloadable Checklist]`
    });
    rawList.push({
      formulaKey: 'ultimate',
      formulaLabel: 'Ultimate Manual',
      title: `${topic} Masterclass: The Definitive Handbook for Ambitious ${audience}`
    });
    rawList.push({
      formulaKey: 'ultimate',
      formulaLabel: 'Ultimate Manual',
      title: `The No-BS Bible to ${topic}: From Total Beginner to Confident Pro`
    });

    // Formula 4: Curiosity & Mystery
    rawList.push({
      formulaKey: 'curiosity',
      formulaLabel: 'Curiosity & Mystery',
      title: `Why Most ${audience} Fail at ${topic} (And the Secret Fix Behind Top 1%)`
    });
    rawList.push({
      formulaKey: 'curiosity',
      formulaLabel: 'Curiosity & Mystery',
      title: `The Counter-Intuitive Truth About ${topic} Nobody Wants to Tell You`
    });
    rawList.push({
      formulaKey: 'curiosity',
      formulaLabel: 'Curiosity & Mystery',
      title: `Is ${topic} Still Worth It in ${yrStr}? What the Industry Is Hiding`
    });
    rawList.push({
      formulaKey: 'curiosity',
      formulaLabel: 'Curiosity & Mystery',
      title: `What Happened When 100 ${audience} Stopped Ignoring This ${topic} Rule`
    });

    // Formula 5: Problem-Solver
    rawList.push({
      formulaKey: 'problem-solver',
      formulaLabel: 'Problem-Solver',
      title: `Struggling With ${topic}? 5 Instant Fixes Tailored for ${audience}`
    });
    rawList.push({
      formulaKey: 'problem-solver',
      formulaLabel: 'Problem-Solver',
      title: `Stop Wasting Time on ${topic}: How to Get Real Results in 7 Days`
    });
    rawList.push({
      formulaKey: 'problem-solver',
      formulaLabel: 'Problem-Solver',
      title: `The Lazy Person's Guide to Solving Difficult ${topic} Headaches`
    });
    rawList.push({
      formulaKey: 'problem-solver',
      formulaLabel: 'Problem-Solver',
      title: `Tired of Slow ${topic} Growth? Here Is the Fast-Track Strategy`
    });

    // Formula 6: Data & Case Study
    rawList.push({
      formulaKey: 'case-study',
      formulaLabel: 'Data & Case Study',
      title: `Case Study: How We Scaled ${topic} by 340% in 90 Days [Real Data]`
    });
    rawList.push({
      formulaKey: 'case-study',
      formulaLabel: 'Data & Case Study',
      title: `We Analyzed 500+ ${topic} Examples: Here Are the 3 Crucial Takeaways`
    });
    rawList.push({
      formulaKey: 'case-study',
      formulaLabel: 'Data & Case Study',
      title: `How One ${audience} Turned Zero ${topic} Experience Into Massive Success`
    });
    rawList.push({
      formulaKey: 'case-study',
      formulaLabel: 'Data & Case Study',
      title: `The Data-Backed Formula Behind High-Performing ${topic} in ${yrStr}`
    });

    currentHeadlines = rawList.map(item => analyzeHeadline(item.title, item.formulaKey, item.formulaLabel));
    updateStats();
    renderHeadlines();
  }

  // Update Summary Statistics
  function updateStats() {
    statTotalCount.textContent = currentHeadlines.length;
    countBadge.textContent = currentHeadlines.length;
    favCountBadge.textContent = savedFavorites.length;

    if (currentHeadlines.length === 0) {
      statAvgCtr.textContent = '--';
      statPowerWords.textContent = '--';
      statOptimalLen.textContent = '--';
      return;
    }

    const avg = Math.round(currentHeadlines.reduce((acc, h) => acc + h.ctrScore, 0) / currentHeadlines.length);
    statAvgCtr.textContent = `${avg}%`;

    const totalPowerWords = currentHeadlines.reduce((acc, h) => acc + h.powerWords.length, 0);
    statPowerWords.textContent = totalPowerWords;

    const optimalCount = currentHeadlines.filter(h => h.lengthStatus === 'optimal').length;
    const optimalPct = Math.round((optimalCount / currentHeadlines.length) * 100);
    statOptimalLen.textContent = `${optimalPct}%`;
  }

  // Check if headline is in favorites
  function isSaved(title) {
    return savedFavorites.some(f => f.title === title);
  }

  // Toggle favorite
  function toggleFavorite(headline) {
    const idx = savedFavorites.findIndex(f => f.title === headline.title);
    if (idx > -1) {
      savedFavorites.splice(idx, 1);
      showToast('Removed from saved titles');
    } else {
      savedFavorites.unshift(headline);
      showToast('Saved to your favorites!');
    }
    localStorage.setItem('blog_saved_titles', JSON.stringify(savedFavorites));
    updateStats();
    renderHeadlines();
    renderFavorites();
  }

  // Render Headlines List
  function renderHeadlines() {
    const searchTerm = filterSearch.value.trim().toLowerCase();
    
    let filtered = currentHeadlines.filter(item => {
      const matchFormula = activeFormula === 'all' || item.formulaKey === activeFormula;
      const matchSearch = !searchTerm || item.title.toLowerCase().includes(searchTerm) || item.formulaLabel.toLowerCase().includes(searchTerm);
      return matchFormula && matchSearch;
    });

    if (filtered.length === 0) {
      headlinesContainer.innerHTML = `
        <div style="text-align: center; padding: 2.5rem 1rem; color: var(--text-secondary); background: var(--bg-tertiary); border: 1px dashed var(--border); border-radius: var(--radius-md);">
          <svg viewBox="0 0 24 24" width="36" height="36" fill="none" stroke="currentColor" stroke-width="1.5" style="margin-bottom: 0.5rem; opacity: 0.7;"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
          <div style="font-weight: 600; font-size: 0.95rem; color: var(--text-primary);">No headlines match your filter</div>
          <div style="font-size: 0.8rem; margin-top: 0.25rem;">Try resetting your search query or selecting "All Formulas".</div>
        </div>
      `;
      return;
    }

    headlinesContainer.innerHTML = filtered.map(item => {
      const starred = isSaved(item.title);
      const ctrClass = item.ctrScore >= 80 ? 'high' : 'med';
      
      // Power word tags
      const pwTags = item.powerWords.map(pw => `<span class="power-word-tag">${pw}</span>`).join(' ');

      return `
        <div class="headline-card" data-title="${encodeURIComponent(item.title)}">
          <div style="display: flex; justify-content: space-between; align-items: flex-start; gap: 0.75rem;">
            <div class="headline-title">${escapeHtml(item.title)}</div>
            <button class="mini-btn ${starred ? 'starred' : ''} fav-btn" data-title="${encodeURIComponent(item.title)}" title="${starred ? 'Starred' : 'Save headline'}">
              <svg viewBox="0 0 24 24" width="14" height="14" fill="${starred ? 'currentColor' : 'none'}" stroke="currentColor" stroke-width="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>
            </button>
          </div>

          ${pwTags ? `<div style="display: flex; flex-wrap: wrap; gap: 0.35rem; align-items: center;"><span style="font-size: 0.72rem; color: var(--text-secondary);">Power words:</span> ${pwTags}</div>` : ''}

          <!-- Length Meter bar -->
          <div class="length-meter-wrap" title="Headline character progress">
            <div class="length-meter-fill ${item.lengthStatus}" style="width: ${item.lengthPercentage}%;"></div>
          </div>

          <!-- Meta Bar -->
          <div class="card-meta-bar">
            <div class="meta-badges">
              <span class="badge-formula">${item.formulaLabel}</span>
              <span class="badge-ctr ${ctrClass}">CTR Score: ${item.ctrScore}%</span>
              <span class="badge-chars ${item.lengthStatus}">
                ${item.chars} chars (${item.words} words) • ${item.lengthStatus === 'optimal' ? 'Optimal Length' : item.lengthStatus === 'warning' ? 'Acceptable' : 'Adjust Length'}
              </span>
            </div>

            <div class="card-actions">
              <button class="mini-btn copy-single-btn" data-copy="${encodeURIComponent(item.title)}">
                <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
                Copy
              </button>
            </div>
          </div>
        </div>
      `;
    }).join('');

    attachCardEventListeners();
  }

  // Render Saved Favorites
  function renderFavorites() {
    if (savedFavorites.length === 0) {
      favoritesContainer.innerHTML = `
        <div style="text-align: center; padding: 3rem 1rem; color: var(--text-secondary); background: var(--bg-tertiary); border: 1px dashed var(--border); border-radius: var(--radius-md);">
          <svg viewBox="0 0 24 24" width="40" height="40" fill="none" stroke="currentColor" stroke-width="1.5" style="margin-bottom: 0.5rem; color: #fbbf24;"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>
          <div style="font-weight: 600; font-size: 1rem; color: var(--text-primary);">No Saved Headlines Yet</div>
          <div style="font-size: 0.85rem; margin-top: 0.25rem;">Click the star icon on any headline to save it here for later.</div>
        </div>
      `;
      return;
    }

    favoritesContainer.innerHTML = savedFavorites.map(item => `
      <div class="headline-card">
        <div style="display: flex; justify-content: space-between; align-items: flex-start; gap: 0.75rem;">
          <div class="headline-title">${escapeHtml(item.title)}</div>
          <button class="mini-btn starred fav-remove-btn" data-title="${encodeURIComponent(item.title)}" title="Remove from favorites">
            <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor" stroke="currentColor" stroke-width="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>
          </button>
        </div>

        <div class="card-meta-bar">
          <div class="meta-badges">
            <span class="badge-formula">${item.formulaLabel || 'Headline'}</span>
            <span class="badge-ctr high">CTR Score: ${item.ctrScore || 85}%</span>
            <span class="badge-chars optimal">${item.chars || item.title.length} chars</span>
          </div>
          <div class="card-actions">
            <button class="mini-btn copy-single-btn" data-copy="${encodeURIComponent(item.title)}">
              <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
              Copy
            </button>
          </div>
        </div>
      </div>
    `).join('');

    // Attach favorites listeners
    favoritesContainer.querySelectorAll('.fav-remove-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const title = decodeURIComponent(btn.dataset.title);
        const item = savedFavorites.find(f => f.title === title);
        if (item) toggleFavorite(item);
      });
    });

    favoritesContainer.querySelectorAll('.copy-single-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const text = decodeURIComponent(btn.dataset.copy);
        navigator.clipboard.writeText(text).then(() => {
          showToast('Copied headline to clipboard!');
        });
      });
    });
  }

  // Attach card event listeners
  function attachCardEventListeners() {
    headlinesContainer.querySelectorAll('.fav-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const title = decodeURIComponent(btn.dataset.title);
        const item = currentHeadlines.find(h => h.title === title);
        if (item) toggleFavorite(item);
      });
    });

    headlinesContainer.querySelectorAll('.copy-single-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const text = decodeURIComponent(btn.dataset.copy);
        navigator.clipboard.writeText(text).then(() => {
          showToast('Copied headline to clipboard!');
        });
      });
    });
  }

  // HTML escaping helper
  function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  // Tab switching
  tabButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const targetId = btn.dataset.tab;
      tabButtons.forEach(b => b.classList.remove('active'));
      tabViews.forEach(v => v.style.display = 'none');
      
      btn.classList.add('active');
      const targetView = document.getElementById(targetId);
      if (targetView) targetView.style.display = 'block';

      if (targetId === 'tab-favorites') {
        renderFavorites();
      }
    });
  });

  // Formula Chip Filters
  formulaChips.querySelectorAll('.formula-chip').forEach(chip => {
    chip.addEventListener('click', () => {
      formulaChips.querySelectorAll('.formula-chip').forEach(c => c.classList.remove('active'));
      chip.classList.add('active');
      activeFormula = chip.dataset.formula;
      renderHeadlines();
    });
  });

  // Search input filter
  filterSearch.addEventListener('input', () => {
    renderHeadlines();
  });

  // Copy All Visible Headlines
  copyAllBtn.addEventListener('click', () => {
    const searchTerm = filterSearch.value.trim().toLowerCase();
    const visible = currentHeadlines.filter(item => {
      const matchFormula = activeFormula === 'all' || item.formulaKey === activeFormula;
      const matchSearch = !searchTerm || item.title.toLowerCase().includes(searchTerm);
      return matchFormula && matchSearch;
    });

    if (visible.length === 0) {
      showToast('No headlines to copy');
      return;
    }

    const textToCopy = visible.map(h => h.title).join('\n\n');
    navigator.clipboard.writeText(textToCopy).then(() => {
      showToast(`Copied ${visible.length} headlines to clipboard!`);
    });
  });

  // Export as TXT file
  exportTxtBtn.addEventListener('click', () => {
    if (currentHeadlines.length === 0) {
      showToast('Please generate headlines first');
      return;
    }

    const topic = topicInput.value.trim() || 'Blog-Headlines';
    let fileContent = `=== BLOG HEADLINES REPORT: ${topic.toUpperCase()} ===\n`;
    fileContent += `Generated on: ${new Date().toLocaleDateString()}\n`;
    fileContent += `Target Audience: ${audienceInput.value.trim() || 'General'}\n\n`;

    currentHeadlines.forEach((h, idx) => {
      fileContent += `${idx + 1}. [${h.formulaLabel}] ${h.title}\n`;
      fileContent += `   CTR Score: ${h.ctrScore}% | Length: ${h.chars} chars | Status: ${h.lengthStatus.toUpperCase()}\n\n`;
    });

    const blob = new Blob([fileContent], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `blog-headlines-${topic.toLowerCase().replace(/[^a-z0-9]/g, '-')}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showToast('Downloaded headlines text file!');
  });

  // Clear all saved favorites
  clearFavoritesBtn.addEventListener('click', () => {
    if (savedFavorites.length === 0) return;
    if (confirm('Are you sure you want to clear all saved headlines?')) {
      savedFavorites = [];
      localStorage.removeItem('blog_saved_titles');
      updateStats();
      renderFavorites();
      renderHeadlines();
      showToast('Cleared all saved headlines');
    }
  });

  // Generate Button
  generateBtn.addEventListener('click', () => {
    if (!topicInput.value.trim()) {
      showToast('Please enter a target topic');
      topicInput.focus();
      return;
    }
    generateAllHeadlines();
    showToast('Generated 24 high-CTR headlines across 6 formulas!');
  });

  // Enter key trigger on topic
  topicInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      generateBtn.click();
    }
  });

  // Random Inspiration Button
  randomBtn.addEventListener('click', () => {
    const randomItem = RANDOM_INSPIRATIONS[Math.floor(Math.random() * RANDOM_INSPIRATIONS.length)];
    topicInput.value = randomItem.topic;
    audienceInput.value = randomItem.audience;
    nicheSelect.value = randomItem.niche;
    toneSelect.value = randomItem.tone;
    generateAllHeadlines();
    showToast(`Loaded inspiration: "${randomItem.topic}"`);
  });

  // Initial Run
  generateAllHeadlines();
});