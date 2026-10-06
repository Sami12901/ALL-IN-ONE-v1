// Content Idea Generator - Client-Side Interactive Engine

const RANDOM_INSPIRATIONS = [
  { niche: "AI & Productivity", subtopic: "Autonomous AI Agents", platform: "LinkedIn" },
  { niche: "B2B SaaS Growth", subtopic: "Customer Retention & Churn", platform: "Blog" },
  { niche: "Personal Finance & Investing", subtopic: "Index Funds vs Dividend Growth", platform: "YouTube" },
  { niche: "Fitness & Strength Training", subtopic: "Hypertrophy for Busy Adults", platform: "TikTok" },
  { niche: "Creator Economy & Newsletters", subtopic: "Monetizing Under 5,000 Subscribers", platform: "Twitter" },
  { niche: "E-Commerce & DTC Brands", subtopic: "High-Converting Product Pages", platform: "LinkedIn" }
];

document.addEventListener('DOMContentLoaded', () => {
  // Elements
  const nicheInput = document.getElementById('niche-input');
  const subtopicInput = document.getElementById('subtopic-input');
  const platformSelector = document.getElementById('platform-selector');
  const generateBtn = document.getElementById('generate-btn');
  const randomBtn = document.getElementById('random-btn');
  const filterSearch = document.getElementById('filter-search');
  const pillarFilterBar = document.getElementById('pillar-filter-bar');
  const copyAllBtn = document.getElementById('copy-all-btn');
  const exportCsvBtn = document.getElementById('export-csv-btn');
  const countBadge = document.getElementById('count-badge');
  const favCountBadge = document.getElementById('fav-count-badge');
  const ideasContainer = document.getElementById('ideas-container');
  const favoritesContainer = document.getElementById('favorites-container');
  const clearFavoritesBtn = document.getElementById('clear-favorites-btn');
  const appToast = document.getElementById('app-toast');

  // Tab Switching
  const tabButtons = document.querySelectorAll('.tab-btn');
  const tabViews = document.querySelectorAll('.tab-view');

  // State
  let selectedPlatform = 'Blog';
  let activePillar = 'all';
  let currentIdeas = [];
  let savedFavorites = JSON.parse(localStorage.getItem('content_saved_ideas') || '[]');

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

  // Format hints tailored per platform
  function getFormatHint(platform, pillar) {
    const hints = {
      Blog: {
        educational: "Long-form 1,800-word SEO pillar guide with actionable steps",
        contrarian: "Thought-leadership editorial teardown with industry data",
        "case-study": "In-depth case study with screenshots, timeline & ROI metrics",
        listicle: "Curated resource guide with direct links & pro tips",
        "future-trends": "Strategic industry forecast for 2026-2027 with analyst quotes"
      },
      LinkedIn: {
        educational: "10-slide visual carousel PDF with framework breakdown",
        contrarian: "Punchy text hook + 4-line contrarian story + provocative ending question",
        "case-study": "Behind-the-scenes founder teardown: before/after with exact numbers",
        listicle: "Numbered cheat sheet formatting + prompt for readers to bookmark",
        "future-trends": "High-level macro synthesis + poll question to spark debate"
      },
      YouTube: {
        educational: "10-14 min deep-dive masterclass with chapter markers & diagrams",
        contrarian: "High-drama thumbnail hook + mythbusting breakdown with live proof",
        "case-study": "Full teardown documentary style: 'How They Did It'",
        listicle: "Fast-paced countdown: 'Top 7 Tools Ranked Best to Worst'",
        "future-trends": "Prediction video with market analysis & practical preparation steps"
      },
      Twitter: {
        educational: "8-tweet step-by-step thread with visual cards & bookmark reminder",
        contrarian: "Spicy one-liner hook tweet + 5 receipts backing up the take",
        "case-study": "Micro case study: 1 hook + 4 key lessons + 1 takeaway",
        listicle: "Mega-list thread with curated resources and direct handles",
        "future-trends": "Vision thread with bullet forecasts + invite followers to quote tweet"
      },
      TikTok: {
        educational: "45-second fast-paced tutorial with text overlays & demonstration",
        contrarian: "Green screen reaction video: 'Why everyone is lying to you about this'",
        "case-study": "Storytime format: 'How a beginner made this work in 30 days'",
        listicle: "Quick 3-item listicle: 'Stop scrolling, here are 3 tools you need'",
        "future-trends": "POV trend prediction breakdown with bold audio pairing"
      }
    };

    return (hints[platform] && hints[platform][pillar]) || "Interactive multi-part content series";
  }

  // Generate 20+ Ideas Across 5 Pillars
  function generateIdeas() {
    const niche = nicheInput.value.trim() || 'Digital Marketing';
    const subtopic = subtopicInput.value.trim() || niche;
    const platform = selectedPlatform;

    const list = [];

    // Pillar 1: Educational / Tutorial (5 ideas)
    list.push({
      pillar: 'educational',
      pillarLabel: 'Educational',
      title: `The Beginner's Zero-to-One Roadmap for Mastering ${subtopic}`,
      hint: getFormatHint(platform, 'educational')
    });
    list.push({
      pillar: 'educational',
      pillarLabel: 'Educational',
      title: `Step-by-Step System: How to Execute ${subtopic} in 60 Minutes a Day`,
      hint: getFormatHint(platform, 'educational')
    });
    list.push({
      pillar: 'educational',
      pillarLabel: 'Educational',
      title: `3 Core Frameworks Every ${niche} Practitioner Must Master in 2026`,
      hint: getFormatHint(platform, 'educational')
    });
    list.push({
      pillar: 'educational',
      pillarLabel: 'Educational',
      title: `How to Avoid the 5 Most Common Traps in ${subtopic} (With Fixes)`,
      hint: getFormatHint(platform, 'educational')
    });
    list.push({
      pillar: 'educational',
      pillarLabel: 'Educational',
      title: `The Complete Anatomy of a High-Performing ${subtopic} Workflow`,
      hint: getFormatHint(platform, 'educational')
    });

    // Pillar 2: Contrarian / Mythbusting (5 ideas)
    list.push({
      pillar: 'contrarian',
      pillarLabel: 'Contrarian',
      title: `Why Most Advice About ${subtopic} Is Completely Outdated and Wrong`,
      hint: getFormatHint(platform, 'contrarian')
    });
    list.push({
      pillar: 'contrarian',
      pillarLabel: 'Contrarian',
      title: `Stop Doing ${subtopic} Like It's 2022: The Hard Truth Nobody Talks About`,
      hint: getFormatHint(platform, 'contrarian')
    });
    list.push({
      pillar: 'contrarian',
      pillarLabel: 'Contrarian',
      title: `The 'Best Practice' in ${niche} That Actually Destroys Your Results`,
      hint: getFormatHint(platform, 'contrarian')
    });
    list.push({
      pillar: 'contrarian',
      pillarLabel: 'Contrarian',
      title: `Why Hard Work in ${subtopic} Doesn't Equal Success (And What Actually Does)`,
      hint: getFormatHint(platform, 'contrarian')
    });
    list.push({
      pillar: 'contrarian',
      pillarLabel: 'Contrarian',
      title: `I Tested the Most Popular ${subtopic} Strategy for 30 Days: It Failed`,
      hint: getFormatHint(platform, 'contrarian')
    });

    // Pillar 3: Case Study / Proof (5 ideas)
    list.push({
      pillar: 'case-study',
      pillarLabel: 'Case Study',
      title: `How We Scaled ${subtopic} from Zero to Top 1% in 90 Days [Real Numbers]`,
      hint: getFormatHint(platform, 'case-study')
    });
    list.push({
      pillar: 'case-study',
      pillarLabel: 'Case Study',
      title: `Teardown: Behind the Scenes of a 6-Figure ${niche} Campaign`,
      hint: getFormatHint(platform, 'case-study')
    });
    list.push({
      pillar: 'case-study',
      pillarLabel: 'Case Study',
      title: `From Complete Burnout to Sustainable ${subtopic} Systems: A Real Transformation`,
      hint: getFormatHint(platform, 'case-study')
    });
    list.push({
      pillar: 'case-study',
      pillarLabel: 'Case Study',
      title: `We Analyzed 100+ Successful ${subtopic} Examples: Here Is What They Shared`,
      hint: getFormatHint(platform, 'case-study')
    });
    list.push({
      pillar: 'case-study',
      pillarLabel: 'Case Study',
      title: `How One Solo Operator Outperformed an Entire Agency Using ${subtopic}`,
      hint: getFormatHint(platform, 'case-study')
    });

    // Pillar 4: Listicle / Resources (5 ideas)
    list.push({
      pillar: 'listicle',
      pillarLabel: 'Listicle',
      title: `7 Secret Tools and Resources That Made ${subtopic} 10x Easier This Year`,
      hint: getFormatHint(platform, 'listicle')
    });
    list.push({
      pillar: 'listicle',
      pillarLabel: 'Listicle',
      title: `9 High-Impact Prompts and Templates to Automate Your ${subtopic}`,
      hint: getFormatHint(platform, 'listicle')
    });
    list.push({
      pillar: 'listicle',
      pillarLabel: 'Listicle',
      title: `5 Must-Read Books That Will Teach You More About ${niche} Than a Degree`,
      hint: getFormatHint(platform, 'listicle')
    });
    list.push({
      pillar: 'listicle',
      pillarLabel: 'Listicle',
      title: `10 Bookmarks Every Modern ${niche} Specialist Needs Saved on Their Browser`,
      hint: getFormatHint(platform, 'listicle')
    });
    list.push({
      pillar: 'listicle',
      pillarLabel: 'Listicle',
      title: `The Ultimate 1-Page Cheat Sheet for ${subtopic} Success`,
      hint: getFormatHint(platform, 'listicle')
    });

    // Pillar 5: Future Trends (4 ideas)
    list.push({
      pillar: 'future-trends',
      pillarLabel: 'Future Trends',
      title: `The Massive Shift Coming to ${niche} in 2027 (And How to Prepare Now)`,
      hint: getFormatHint(platform, 'future-trends')
    });
    list.push({
      pillar: 'future-trends',
      pillarLabel: 'Future Trends',
      title: `Will AI Replace Traditional ${subtopic}? Our 3-Year Prediction`,
      hint: getFormatHint(platform, 'future-trends')
    });
    list.push({
      pillar: 'future-trends',
      pillarLabel: 'Future Trends',
      title: `3 Emerging Paradigms in ${niche} That Are Creating Unfair Advantages`,
      hint: getFormatHint(platform, 'future-trends')
    });
    list.push({
      pillar: 'future-trends',
      pillarLabel: 'Future Trends',
      title: `What the Future of ${subtopic} Looks Like for Creators and Companies`,
      hint: getFormatHint(platform, 'future-trends')
    });

    currentIdeas = list.map((item, idx) => ({
      id: `idea-${idx}-${Date.now()}`,
      title: item.title,
      pillar: item.pillar,
      pillarLabel: item.pillarLabel,
      platform,
      hint: item.hint
    }));

    updateCounts();
    renderIdeas();
  }

  // Update Count Badges
  function updateCounts() {
    countBadge.textContent = currentIdeas.length;
    favCountBadge.textContent = savedFavorites.length;
  }

  // Escape HTML Helper
  function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  // Check if idea is in favorites
  function isSaved(title) {
    return savedFavorites.some(f => f.title === title);
  }

  // Toggle favorite
  function toggleFavorite(idea) {
    const idx = savedFavorites.findIndex(f => f.title === idea.title);
    if (idx > -1) {
      savedFavorites.splice(idx, 1);
      showToast('Removed from saved ideas');
    } else {
      savedFavorites.unshift(idea);
      showToast('Saved to your bookmarks!');
    }
    localStorage.setItem('content_saved_ideas', JSON.stringify(savedFavorites));
    updateCounts();
    renderIdeas();
    renderFavorites();
  }

  // Render Ideas
  function renderIdeas() {
    const query = filterSearch.value.trim().toLowerCase();

    const filtered = currentIdeas.filter(item => {
      const matchPillar = activePillar === 'all' || item.pillar === activePillar;
      const matchQuery = !query || item.title.toLowerCase().includes(query) || item.hint.toLowerCase().includes(query);
      return matchPillar && matchQuery;
    });

    if (filtered.length === 0) {
      ideasContainer.innerHTML = `
        <div style="text-align: center; padding: 3rem 1rem; color: var(--text-secondary); background: var(--bg-tertiary); border: 1px dashed var(--border); border-radius: var(--radius-md);">
          <svg viewBox="0 0 24 24" width="36" height="36" fill="none" stroke="currentColor" stroke-width="1.5" style="margin-bottom: 0.5rem; opacity: 0.7;"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
          <div style="font-weight: 600; font-size: 0.95rem; color: var(--text-primary);">No ideas match your filter</div>
          <div style="font-size: 0.8rem; margin-top: 0.25rem;">Try resetting your search query or selecting "All Pillars".</div>
        </div>
      `;
      return;
    }

    ideasContainer.innerHTML = filtered.map(item => {
      const starred = isSaved(item.title);

      return `
        <div class="idea-card">
          <div class="idea-card-header">
            <div class="idea-title-text">${escapeHtml(item.title)}</div>
            <button class="mini-btn ${starred ? 'starred' : ''} fav-btn" data-title="${encodeURIComponent(item.title)}" title="${starred ? 'Saved' : 'Save Idea'}">
              <svg viewBox="0 0 24 24" width="14" height="14" fill="${starred ? 'currentColor' : 'none'}" stroke="currentColor" stroke-width="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>
            </button>
          </div>

          <div class="format-hint-tag">
            <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
            <span><strong>Execution Angle:</strong> ${escapeHtml(item.hint)}</span>
          </div>

          <div class="idea-meta-bar">
            <div style="display: flex; align-items: center; gap: 0.5rem;">
              <span class="pillar-badge ${item.pillar}">${item.pillarLabel}</span>
              <span style="color: var(--text-secondary); font-size: 0.75rem;">• ${item.platform}</span>
            </div>

            <button class="mini-btn copy-single-btn" data-copy="${encodeURIComponent(item.title)}">
              <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
              Copy Idea
            </button>
          </div>
        </div>
      `;
    }).join('');

    attachCardListeners();
  }

  // Render Saved Favorites
  function renderFavorites() {
    if (savedFavorites.length === 0) {
      favoritesContainer.innerHTML = `
        <div style="text-align: center; padding: 3rem 1rem; color: var(--text-secondary); background: var(--bg-tertiary); border: 1px dashed var(--border); border-radius: var(--radius-md);">
          <svg viewBox="0 0 24 24" width="36" height="36" fill="none" stroke="currentColor" stroke-width="1.5" style="margin-bottom: 0.5rem; color: #fbbf24;"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>
          <div style="font-weight: 600; font-size: 1rem; color: var(--text-primary);">No Saved Ideas Yet</div>
          <div style="font-size: 0.85rem; margin-top: 0.25rem;">Star any content idea to save it here for your content calendar.</div>
        </div>
      `;
      return;
    }

    favoritesContainer.innerHTML = savedFavorites.map(item => `
      <div class="idea-card">
        <div class="idea-card-header">
          <div class="idea-title-text">${escapeHtml(item.title)}</div>
          <button class="mini-btn starred fav-del-btn" data-title="${encodeURIComponent(item.title)}" title="Remove bookmark">
            <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor" stroke="currentColor" stroke-width="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>
          </button>
        </div>

        <div class="format-hint-tag">
          <span><strong>Execution Angle:</strong> ${escapeHtml(item.hint || 'Platform format')}</span>
        </div>

        <div class="idea-meta-bar">
          <div style="display: flex; align-items: center; gap: 0.5rem;">
            <span class="pillar-badge ${item.pillar || 'educational'}">${item.pillarLabel || 'Idea'}</span>
            <span style="color: var(--text-secondary); font-size: 0.75rem;">• ${item.platform || 'General'}</span>
          </div>

          <button class="mini-btn copy-single-btn" data-copy="${encodeURIComponent(item.title)}">
            <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
            Copy Idea
          </button>
        </div>
      </div>
    `).join('');

    // Attach favorites remove listeners
    favoritesContainer.querySelectorAll('.fav-del-btn').forEach(btn => {
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
          showToast('Copied idea to clipboard!');
        });
      });
    });
  }

  // Attach Card Action Listeners
  function attachCardListeners() {
    ideasContainer.querySelectorAll('.fav-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const title = decodeURIComponent(btn.dataset.title);
        const item = currentIdeas.find(i => i.title === title);
        if (item) toggleFavorite(item);
      });
    });

    ideasContainer.querySelectorAll('.copy-single-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const text = decodeURIComponent(btn.dataset.copy);
        navigator.clipboard.writeText(text).then(() => {
          showToast('Copied idea to clipboard!');
        });
      });
    });
  }

  // Platform Selector
  platformSelector.querySelectorAll('.platform-chip').forEach(chip => {
    chip.addEventListener('click', () => {
      platformSelector.querySelectorAll('.platform-chip').forEach(c => c.classList.remove('active'));
      chip.classList.add('active');
      selectedPlatform = chip.dataset.platform;
      generateIdeas();
      showToast(`Switched target platform to ${selectedPlatform}`);
    });
  });

  // Pillar Filters
  pillarFilterBar.querySelectorAll('.pillar-tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      pillarFilterBar.querySelectorAll('.pillar-tab-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      activePillar = btn.dataset.pillar;
      renderIdeas();
    });
  });

  // Search Input
  filterSearch.addEventListener('input', () => {
    renderIdeas();
  });

  // Copy All Ideas
  copyAllBtn.addEventListener('click', () => {
    const query = filterSearch.value.trim().toLowerCase();
    const visible = currentIdeas.filter(item => {
      const matchPillar = activePillar === 'all' || item.pillar === activePillar;
      const matchQuery = !query || item.title.toLowerCase().includes(query);
      return matchPillar && matchQuery;
    });

    if (visible.length === 0) {
      showToast('No ideas to copy');
      return;
    }

    const textToCopy = visible.map((item, idx) => `${idx + 1}. [${item.pillarLabel}] ${item.title}\n   Execution Tip: ${item.hint}`).join('\n\n');
    navigator.clipboard.writeText(textToCopy).then(() => {
      showToast(`Copied ${visible.length} ideas to clipboard!`);
    });
  });

  // Export CSV
  exportCsvBtn.addEventListener('click', () => {
    if (currentIdeas.length === 0) {
      showToast('Please generate ideas first');
      return;
    }

    let csv = `Title,Platform,Pillar,Execution Angle\n`;
    currentIdeas.forEach(item => {
      const safeTitle = `"${item.title.replace(/"/g, '""')}"`;
      const safePlatform = `"${item.platform.replace(/"/g, '""')}"`;
      const safePillar = `"${item.pillarLabel.replace(/"/g, '""')}"`;
      const safeHint = `"${item.hint.replace(/"/g, '""')}"`;
      csv += `${safeTitle},${safePlatform},${safePillar},${safeHint}\n`;
    });

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `content-ideas-${selectedPlatform.toLowerCase()}-${Date.now()}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showToast('Downloaded content ideas CSV!');
  });

  // Clear Saved Favorites
  clearFavoritesBtn.addEventListener('click', () => {
    if (savedFavorites.length === 0) return;
    if (confirm('Are you sure you want to clear all bookmarked ideas?')) {
      savedFavorites = [];
      localStorage.removeItem('content_saved_ideas');
      updateCounts();
      renderFavorites();
      renderIdeas();
      showToast('Cleared saved bookmarks');
    }
  });

  // Tab View Switcher
  tabButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const targetTab = btn.dataset.tab;
      tabButtons.forEach(b => b.classList.remove('active'));
      tabViews.forEach(v => v.style.display = 'none');

      btn.classList.add('active');
      const targetView = document.getElementById(targetTab);
      if (targetView) targetView.style.display = 'block';

      if (targetTab === 'tab-favorites') {
        renderFavorites();
      }
    });
  });

  // Generate Button Click
  generateBtn.addEventListener('click', () => {
    if (!nicheInput.value.trim()) {
      showToast('Please specify a niche or industry');
      nicheInput.focus();
      return;
    }
    generateIdeas();
    showToast(`Generated 24 viral ideas for ${selectedPlatform}!`);
  });

  // Enter key trigger on input
  [nicheInput, subtopicInput].forEach(inp => {
    inp.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') generateBtn.click();
    });
  });

  // Random Inspiration Click
  randomBtn.addEventListener('click', () => {
    const random = RANDOM_INSPIRATIONS[Math.floor(Math.random() * RANDOM_INSPIRATIONS.length)];
    nicheInput.value = random.niche;
    subtopicInput.value = random.subtopic;
    selectedPlatform = random.platform;

    platformSelector.querySelectorAll('.platform-chip').forEach(c => {
      c.classList.toggle('active', c.dataset.platform === selectedPlatform);
    });

    generateIdeas();
    showToast(`Loaded inspiration for ${random.niche}!`);
  });

  // Initial Run
  generateIdeas();
});