/**
 * SEO Title Generator - Interactive Client-Side Logic
 * Generates 25+ click-through-rate optimized SEO titles with real-time analysis
 */

document.addEventListener('DOMContentLoaded', () => {
  // --- DOM Elements ---
  const inputKeyword = document.getElementById('input-keyword');
  const inputTopic = document.getElementById('input-topic');
  const inputModifier = document.getElementById('input-modifier');
  const selectFormulaIntent = document.getElementById('select-formula-intent');
  const btnGenerateTitles = document.getElementById('btn-generate-titles');
  const presetButtons = document.querySelectorAll('.preset-btn');

  // Sandbox elements
  const sandboxTitleInput = document.getElementById('sandbox-title-input');
  const sandboxBadge = document.getElementById('sandbox-badge');
  const sandboxPxVal = document.getElementById('sandbox-px-val');
  const sandboxScoreVal = document.getElementById('sandbox-score-val');
  const sandboxPowerWords = document.getElementById('sandbox-power-words');
  const sandboxSerpLink = document.getElementById('sandbox-serp-link');
  const btnCopySandboxTitle = document.getElementById('btn-copy-sandbox-title');

  // Results & tabs
  const formulaTabButtons = document.querySelectorAll('.formula-tab-btn');
  const titleCardsList = document.getElementById('title-cards-list');
  const inputSearchTitles = document.getElementById('input-search-titles');
  const btnCopyAllTitles = document.getElementById('btn-copy-all-titles');
  const btnExportCsv = document.getElementById('btn-export-csv');
  const btnExportTxt = document.getElementById('btn-export-txt');

  // Badges count
  const countAll = document.getElementById('count-all');
  const countHowto = document.getElementById('count-howto');
  const countListicle = document.getElementById('count-listicle');
  const countComparison = document.getElementById('count-comparison');
  const countQuestions = document.getElementById('count-questions');
  const countUltimate = document.getElementById('count-ultimate');
  const countYear2026 = document.getElementById('count-year2026');
  const countClickmagnet = document.getElementById('count-clickmagnet');
  const countFavorites = document.getElementById('count-favorites');

  const toast = document.getElementById('toast');
  const toastMessage = document.getElementById('toast-message');

  // --- State Variables ---
  let activeCategory = 'all';
  let generatedTitles = [];
  let favorites = new Set();

  // Load saved favorites from localStorage
  try {
    const saved = localStorage.getItem('seo_title_favorites');
    if (saved) {
      JSON.parse(saved).forEach(f => favorites.add(f));
    }
  } catch (err) {
    console.warn('Could not read saved favorites:', err);
  }

  function saveFavorites() {
    try {
      localStorage.setItem('seo_title_favorites', JSON.stringify([...favorites]));
    } catch (err) {
      console.warn('Could not persist favorites:', err);
    }
    updateFavoritesCount();
  }

  function updateFavoritesCount() {
    if (countFavorites) {
      countFavorites.textContent = favorites.size;
    }
  }

  // --- Dictionary of Power / Emotional Words ---
  const POWER_WORDS_DICT = [
    'ultimate', 'proven', 'essential', 'fast', 'complete', 'secret', 'best',
    'simple', 'guaranteed', 'shocking', 'effortless', 'master', 'step-by-step',
    'hacks', 'free', 'incredible', 'powerful', 'breakthrough', 'insane', 'genius',
    'easy', 'quick', 'critical', 'expert', 'definitive', 'actionable', 'unlocked',
    'handbook', 'strategies', 'massive', 'unbiased', 'blueprint', 'checklist',
    'tested', 'dominate', 'crush', 'hidden', 'secrets', 'formula', 'revealed'
  ];

  // Canvas for measuring pixel width
  let measurementCanvas = null;
  let measurementCtx = null;
  try {
    measurementCanvas = document.createElement('canvas');
    measurementCtx = measurementCanvas.getContext('2d');
  } catch {
    measurementCanvas = null;
    measurementCtx = null;
  }

  function calculatePixelWidth(text) {
    if (!text) return 0;
    if (measurementCtx) {
      measurementCtx.font = '20px Arial, sans-serif';
      return Math.round(measurementCtx.measureText(text).width);
    }
    return Math.round(text.length * 9.8);
  }

  // Detect power words in text
  function detectPowerWords(text) {
    if (!text) return [];
    const normalized = text.toLowerCase().replace(/[^a-z0-9\s-]/g, ' ');
    const tokens = normalized.split(/\s+/).filter(Boolean);
    const found = new Set();

    POWER_WORDS_DICT.forEach(pw => {
      if (pw.includes('-')) {
        if (normalized.includes(pw)) found.add(pw);
      } else {
        if (tokens.includes(pw)) found.add(pw);
      }
    });

    return Array.from(found);
  }

  // Calculate emotional appeal score (0 - 100)
  function calculateEmotionalScore(text, powerWords) {
    if (!text) return 0;
    let score = 30; // base score

    // Power words bonus
    score += Math.min(35, powerWords.length * 12);

    // Number presence bonus (headlines with numbers perform 36% better)
    if (/\d+/.test(text)) score += 15;

    // Brackets or parentheses bonus (e.g. [2026 Guide], (Step-by-Step))
    if (/[\(\)\[\]\{\}]/.test(text)) score += 10;

    // Colon or separator bonus
    if (/[:|—-]/.test(text)) score += 5;

    // Optimal length range bonus (50 - 60 chars)
    const len = text.length;
    if (len >= 48 && len <= 62) {
      score += 10;
    } else if (len >= 40 && len <= 68) {
      score += 5;
    } else if (len > 70) {
      score -= 10;
    }

    return Math.min(98, Math.max(25, score));
  }

  // --- Title Formula Generators ---
  const FORMULA_TEMPLATES = [
    // How-To & Guides
    {
      cat: 'howto',
      catName: 'How-To',
      make: (kw, topic, mod) => `How to ${kw}: 7 Simple Steps to Fast Results`
    },
    {
      cat: 'howto',
      catName: 'How-To',
      make: (kw, topic, mod) => `How to Master ${kw} ${mod ? mod : 'in 2026'} (Beginner's Guide)`
    },
    {
      cat: 'howto',
      catName: 'How-To',
      make: (kw, topic, mod) => `How to Use ${kw} to Explode Your ${topic || 'Results'}`
    },
    {
      cat: 'howto',
      catName: 'How-To',
      make: (kw, topic, mod) => `How to Do ${kw} the Right Way (Step-by-Step Blueprint)`
    },
    {
      cat: 'howto',
      catName: 'How-To',
      make: (kw, topic, mod) => `How I Mastered ${kw} Without Breaking the Bank`
    },

    // Listicles & Numbers
    {
      cat: 'listicle',
      catName: 'Listicle',
      make: (kw, topic, mod) => `7 Proven ${kw} Strategies That Actually Work`
    },
    {
      cat: 'listicle',
      catName: 'Listicle',
      make: (kw, topic, mod) => `Top 10 Best ${kw} Solutions for ${topic || 'Teams'} in 2026`
    },
    {
      cat: 'listicle',
      catName: 'Listicle',
      make: (kw, topic, mod) => `5 Essential ${kw} Mistakes You Must Avoid in 2026`
    },
    {
      cat: 'listicle',
      catName: 'Listicle',
      make: (kw, topic, mod) => `9 Shocking ${kw} Statistics Every Pro Needs to Know`
    },
    {
      cat: 'listicle',
      catName: 'Listicle',
      make: (kw, topic, mod) => `11 Quick ${kw} Hacks for Instant Organic Traffic`
    },

    // Comparison X vs Y
    {
      cat: 'comparison',
      catName: 'Comparison',
      make: (kw, topic, mod) => `${kw} vs Competitors: Which is Better in 2026?`
    },
    {
      cat: 'comparison',
      catName: 'Comparison',
      make: (kw, topic, mod) => `The Ultimate ${kw} Comparison: Tested & Ranked`
    },
    {
      cat: 'comparison',
      catName: 'Comparison',
      make: (kw, topic, mod) => `Best ${kw} Alternatives for ${topic || 'Modern Businesses'}`
    },
    {
      cat: 'comparison',
      catName: 'Comparison',
      make: (kw, topic, mod) => `${kw}: Is It Really Worth the Hype? Honest Review`
    },

    // Questions & Curiosity
    {
      cat: 'questions',
      catName: 'Question',
      make: (kw, topic, mod) => `What is ${kw}? The Complete Beginner's Explanation`
    },
    {
      cat: 'questions',
      catName: 'Question',
      make: (kw, topic, mod) => `Is ${kw} Still Effective in 2026? Here's What the Data Says`
    },
    {
      cat: 'questions',
      catName: 'Question',
      make: (kw, topic, mod) => `Why Does ${kw} Matter for ${topic || 'Growth'}? The Truth`
    },
    {
      cat: 'questions',
      catName: 'Question',
      make: (kw, topic, mod) => `Can ${kw} Really Double Your Performance? We Tested It`
    },

    // Ultimate Guides
    {
      cat: 'ultimate',
      catName: 'Ultimate Guide',
      make: (kw, topic, mod) => `The Ultimate Guide to ${kw} (2026 Edition)`
    },
    {
      cat: 'ultimate',
      catName: 'Ultimate Guide',
      make: (kw, topic, mod) => `${kw}: The Definitive Handbook for ${topic || 'Leaders'}`
    },
    {
      cat: 'ultimate',
      catName: 'Ultimate Guide',
      make: (kw, topic, mod) => `Complete ${kw} Masterclass: From Basics to Advanced`
    },
    {
      cat: 'ultimate',
      catName: 'Ultimate Guide',
      make: (kw, topic, mod) => `Everything You Need to Know About ${kw} in One Place`
    },

    // Year 2026 Trends
    {
      cat: 'year2026',
      catName: '2026 Trends',
      make: (kw, topic, mod) => `${kw} in 2026: Trends, Predictions & What's Next`
    },
    {
      cat: 'year2026',
      catName: '2026 Trends',
      make: (kw, topic, mod) => `Why ${kw} is Revolutionizing ${topic || 'the Industry'} in 2026`
    },
    {
      cat: 'year2026',
      catName: '2026 Trends',
      make: (kw, topic, mod) => `The Future of ${kw}: Essential Guide for 2026 and Beyond`
    },
    {
      cat: 'year2026',
      catName: '2026 Trends',
      make: (kw, topic, mod) => `Modern ${kw} Frameworks Every ${topic || 'Expert'} Needs for 2026`
    },

    // Click Magnets & Power Words
    {
      cat: 'clickmagnet',
      catName: 'Click Magnet',
      make: (kw, topic, mod) => `${kw} Secrets Revealed: The Effortless Blueprint`
    },
    {
      cat: 'clickmagnet',
      catName: 'Click Magnet',
      make: (kw, topic, mod) => `The Guaranteed ${kw} System That Delivers Fast ROI`
    },
    {
      cat: 'clickmagnet',
      catName: 'Click Magnet',
      make: (kw, topic, mod) => `Stop Wasting Time on ${kw}: Do This Instead`
    },
    {
      cat: 'clickmagnet',
      catName: 'Click Magnet',
      make: (kw, topic, mod) => `The Untapped ${kw} Strategy 99% of People Ignore`
    },
    {
      cat: 'clickmagnet',
      catName: 'Click Magnet',
      make: (kw, topic, mod) => `Incredible ${kw} Hacks to Outrank Every Competitor`
    }
  ];

  // Title capitalizer helper
  function capitalizeWords(str) {
    if (!str) return '';
    return str.replace(/\b\w+/g, word => {
      const lower = word.toLowerCase();
      const minor = ['a', 'an', 'the', 'in', 'on', 'at', 'to', 'for', 'of', 'and', 'or', 'but', 'vs'];
      if (minor.includes(lower)) return lower;
      return word.charAt(0).toUpperCase() + word.slice(1);
    });
  }

  // Toast feedback helper
  let toastTimer = null;
  function showToast(msg) {
    if (toastMessage) toastMessage.textContent = msg;
    if (toast) {
      toast.classList.add('show');
      if (toastTimer) clearTimeout(toastTimer);
      toastTimer = setTimeout(() => {
        toast.classList.remove('show');
      }, 2500);
    }
  }

  // Clipboard copy helper
  async function copyToClipboard(text, successMsg) {
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(text);
      } else {
        const ta = document.createElement('textarea');
        ta.value = text;
        ta.style.position = 'fixed';
        ta.style.opacity = '0';
        document.body.appendChild(ta);
        ta.focus();
        ta.select();
        document.execCommand('copy');
        document.body.removeChild(ta);
      }
      showToast(successMsg);
    } catch (err) {
      console.error('Clipboard error:', err);
      showToast('Copied to clipboard!');
    }
  }

  // Generate All Titles
  function generateTitles() {
    const rawKw = (inputKeyword.value || '').trim() || 'SEO Strategy';
    const rawTopic = (inputTopic.value || '').trim() || 'Marketing';
    const rawMod = (inputModifier.value || '').trim();

    const formattedKw = capitalizeWords(rawKw);
    const formattedTopic = capitalizeWords(rawTopic);
    const formattedMod = rawMod;

    generatedTitles = FORMULA_TEMPLATES.map(template => {
      const text = template.make(formattedKw, formattedTopic, formattedMod);
      const chars = text.length;
      const px = calculatePixelWidth(text);
      const powerWords = detectPowerWords(text);
      const score = calculateEmotionalScore(text, powerWords);

      return {
        id: text,
        title: text,
        cat: template.cat,
        catName: template.catName,
        chars,
        px,
        powerWords,
        score
      };
    });

    updateTabCounts();
    renderTitleCards();
  }

  function updateTabCounts() {
    const counts = {
      all: generatedTitles.length,
      howto: 0,
      listicle: 0,
      comparison: 0,
      questions: 0,
      ultimate: 0,
      year2026: 0,
      clickmagnet: 0
    };

    generatedTitles.forEach(t => {
      if (counts[t.cat] !== undefined) {
        counts[t.cat]++;
      }
    });

    if (countAll) countAll.textContent = counts.all;
    if (countHowto) countHowto.textContent = counts.howto;
    if (countListicle) countListicle.textContent = counts.listicle;
    if (countComparison) countComparison.textContent = counts.comparison;
    if (countQuestions) countQuestions.textContent = counts.questions;
    if (countUltimate) countUltimate.textContent = counts.ultimate;
    if (countYear2026) countYear2026.textContent = counts.year2026;
    if (countClickmagnet) countClickmagnet.textContent = counts.clickmagnet;
    updateFavoritesCount();
  }

  // Render Title Cards
  function renderTitleCards() {
    if (!titleCardsList) return;

    const searchTerm = (inputSearchTitles.value || '').toLowerCase().trim();

    // Filter by category and search query
    let filtered = generatedTitles.filter(item => {
      if (activeCategory === 'favorites') {
        if (!favorites.has(item.title)) return false;
      } else if (activeCategory !== 'all') {
        if (item.cat !== activeCategory) return false;
      }

      if (searchTerm && !item.title.toLowerCase().includes(searchTerm)) {
        return false;
      }

      return true;
    });

    if (filtered.length === 0) {
      titleCardsList.innerHTML = `
        <div style="text-align: center; padding: 3rem 1rem; color: var(--text-secondary);">
          <div style="font-size: 2rem; margin-bottom: 0.5rem;">🔍</div>
          <div style="font-weight: 600; font-size: 1.05rem;">No matching titles found</div>
          <p style="font-size: 0.85rem; margin-top: 0.25rem;">Try adjusting your filter or search query, or generate new titles.</p>
        </div>
      `;
      return;
    }

    titleCardsList.innerHTML = filtered.map(item => {
      const isFav = favorites.has(item.title);

      // Character & pixel state styling
      let statusClass = 'optimal';
      let statusText = 'Optimal Length';
      if (item.px > 600 || item.chars > 60) {
        statusClass = 'danger';
        statusText = 'May Truncate (>600px)';
      } else if (item.px > 540 || item.chars > 55) {
        statusClass = 'warning';
        statusText = 'Near Limit';
      }

      const powerBadgesHtml = item.powerWords.map(pw => `
        <span class="power-word-chip">${pw.charAt(0).toUpperCase() + pw.slice(1)}</span>
      `).join('');

      return `
        <div class="title-card ${isFav ? 'favorite-active' : ''}" data-title="${encodeURIComponent(item.title)}">
          <div class="title-card-header">
            <div class="title-heading-text" title="Click to inspect in sandbox">${item.title}</div>
            <div class="title-card-actions">
              <button class="icon-action-btn fav ${isFav ? 'active' : ''}" data-action="fav" title="${isFav ? 'Remove Favorite' : 'Save as Favorite'}">
                <svg viewBox="0 0 24 24" width="15" height="15" fill="${isFav ? 'currentColor' : 'none'}" stroke="currentColor" stroke-width="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>
              </button>
              <button class="icon-action-btn" data-action="copy" title="Copy Title">
                <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
              </button>
              <button class="icon-action-btn" data-action="inspect" title="Load into Inspector Sandbox">
                <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
              </button>
            </div>
          </div>

          <div class="diagnostics-row">
            <span class="diag-chip">${item.catName}</span>
            <span class="diag-chip ${statusClass}">
              ${item.chars} chars · ${item.px} px
            </span>
            <span class="diag-chip">
              <div class="score-meter-wrap">
                <div class="score-progress-mini">
                  <div class="score-progress-fill" style="width: ${item.score}%;"></div>
                </div>
                <span>${item.score}% Appeal</span>
              </div>
            </span>
            ${powerBadgesHtml}
          </div>
        </div>
      `;
    }).join('');

    // Attach card event listeners
    attachCardListeners();
  }

  function attachCardListeners() {
    titleCardsList.querySelectorAll('.title-card').forEach(card => {
      const rawTitle = decodeURIComponent(card.getAttribute('data-title'));

      // Click on text loads sandbox
      const textEl = card.querySelector('.title-heading-text');
      if (textEl) {
        textEl.addEventListener('click', () => {
          loadIntoSandbox(rawTitle);
        });
      }

      // Actions
      const favBtn = card.querySelector('[data-action="fav"]');
      if (favBtn) {
        favBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          if (favorites.has(rawTitle)) {
            favorites.delete(rawTitle);
            showToast('Removed from favorites');
          } else {
            favorites.add(rawTitle);
            showToast('Added to favorites!');
          }
          saveFavorites();
          renderTitleCards();
        });
      }

      const copyBtn = card.querySelector('[data-action="copy"]');
      if (copyBtn) {
        copyBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          copyToClipboard(rawTitle, 'Title copied to clipboard!');
        });
      }

      const inspectBtn = card.querySelector('[data-action="inspect"]');
      if (inspectBtn) {
        inspectBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          loadIntoSandbox(rawTitle);
        });
      }
    });
  }

  // Load title into the Sandbox Inspector
  function loadIntoSandbox(title) {
    if (!sandboxTitleInput) return;
    sandboxTitleInput.value = title;
    updateSandboxMetrics();
    showToast('Loaded into Title Inspector');
  }

  // Update Sandbox Inspector Metrics
  function updateSandboxMetrics() {
    const text = (sandboxTitleInput.value || '').trim();
    const chars = text.length;
    const px = calculatePixelWidth(text);
    const powerWords = detectPowerWords(text);
    const score = calculateEmotionalScore(text, powerWords);

    if (sandboxBadge) {
      let badgeClass = 'optimal';
      if (px > 600 || chars > 60) badgeClass = 'danger';
      else if (px > 540 || chars > 55) badgeClass = 'warning';

      sandboxBadge.className = `diag-chip ${badgeClass}`;
      sandboxBadge.textContent = `${chars} chars (${px}px)`;
    }

    if (sandboxPxVal) {
      sandboxPxVal.textContent = `${px} px / 600 px`;
    }

    if (sandboxScoreVal) {
      let ratingDesc = 'High Appeal';
      if (score < 50) ratingDesc = 'Low Appeal';
      else if (score < 75) ratingDesc = 'Good Appeal';

      sandboxScoreVal.textContent = `${score}% ${ratingDesc}`;
      sandboxScoreVal.style.color = score >= 75 ? 'var(--success)' : (score >= 50 ? 'var(--warning)' : 'var(--error)');
    }

    if (sandboxPowerWords) {
      if (powerWords.length > 0) {
        sandboxPowerWords.innerHTML = powerWords.map(pw => `
          <span class="power-word-chip">${pw.charAt(0).toUpperCase() + pw.slice(1)}</span>
        `).join('');
      } else {
        sandboxPowerWords.innerHTML = '<span style="font-size: 0.75rem; color: var(--text-tertiary);">No power words detected</span>';
      }
    }

    if (sandboxSerpLink) {
      sandboxSerpLink.textContent = text || 'Untitled Page';
    }
  }

  // --- Global Action Handlers ---

  // Generate Button
  if (btnGenerateTitles) {
    btnGenerateTitles.addEventListener('click', () => {
      generateTitles();
      showToast('Generated 28 click-optimized titles!');
    });
  }

  // Presets
  presetButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      inputKeyword.value = btn.getAttribute('data-kw') || '';
      inputTopic.value = btn.getAttribute('data-topic') || '';
      inputModifier.value = btn.getAttribute('data-mod') || '';
      generateTitles();
      showToast(`Applied preset "${btn.textContent.trim()}"`);
    });
  });

  // Intent selector dropdown
  if (selectFormulaIntent) {
    selectFormulaIntent.addEventListener('change', () => {
      activeCategory = selectFormulaIntent.value;
      formulaTabButtons.forEach(tab => {
        if (tab.getAttribute('data-cat') === activeCategory) {
          tab.classList.add('active');
        } else {
          tab.classList.remove('active');
        }
      });
      renderTitleCards();
    });
  }

  // Category Tab navigation
  formulaTabButtons.forEach(tab => {
    tab.addEventListener('click', () => {
      formulaTabButtons.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      activeCategory = tab.getAttribute('data-cat') || 'all';
      if (selectFormulaIntent) {
        selectFormulaIntent.value = activeCategory === 'favorites' ? 'all' : activeCategory;
      }
      renderTitleCards();
    });
  });

  // Search filter
  if (inputSearchTitles) {
    inputSearchTitles.addEventListener('input', renderTitleCards);
  }

  // Copy All Titles
  if (btnCopyAllTitles) {
    btnCopyAllTitles.addEventListener('click', () => {
      if (generatedTitles.length === 0) {
        showToast('No titles to copy');
        return;
      }
      const allText = generatedTitles.map(t => t.title).join('\n');
      copyToClipboard(allText, `Copied all ${generatedTitles.length} titles to clipboard!`);
    });
  }

  // Export CSV
  if (btnExportCsv) {
    btnExportCsv.addEventListener('click', () => {
      if (generatedTitles.length === 0) {
        showToast('No titles to export');
        return;
      }
      const headers = 'Title,Category,Characters,Pixels,Emotional_Score,Power_Words\n';
      const rows = generatedTitles.map(t => {
        const safeTitle = `"${t.title.replace(/"/g, '""')}"`;
        const safePws = `"${t.powerWords.join('; ')}"`;
        return `${safeTitle},${t.catName},${t.chars},${t.px},${t.score}%,${safePws}`;
      }).join('\n');

      const blob = new Blob([headers + rows], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `seo-titles-${Date.now()}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      showToast('Downloaded titles as CSV');
    });
  }

  // Export TXT
  if (btnExportTxt) {
    btnExportTxt.addEventListener('click', () => {
      if (generatedTitles.length === 0) {
        showToast('No titles to export');
        return;
      }
      const content = generatedTitles.map((t, idx) => `${idx + 1}. ${t.title} [${t.chars} ch / ${t.px} px]`).join('\n');
      const blob = new Blob([content], { type: 'text/plain;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `seo-titles-${Date.now()}.txt`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      showToast('Downloaded titles as TXT');
    });
  }

  // Sandbox inputs
  if (sandboxTitleInput) {
    sandboxTitleInput.addEventListener('input', updateSandboxMetrics);
  }

  if (btnCopySandboxTitle) {
    btnCopySandboxTitle.addEventListener('click', () => {
      const text = (sandboxTitleInput.value || '').trim();
      if (!text) {
        showToast('Inspector is empty');
        return;
      }
      copyToClipboard(text, 'Inspected title copied to clipboard!');
    });
  }

  // Initial generation
  generateTitles();
  updateSandboxMetrics();
});