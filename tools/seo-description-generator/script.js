/**
 * SEO Description Generator - Interactive Client-Side Logic
 * Synthesizes high-converting meta descriptions with real-time length meters and SERP preview
 */

document.addEventListener('DOMContentLoaded', () => {
  // --- DOM Elements ---
  const inputTopic = document.getElementById('input-topic');
  const inputPrimaryKw = document.getElementById('input-primary-kw');
  const inputSecondaryKw = document.getElementById('input-secondary-kw');
  const inputUsp = document.getElementById('input-usp');
  const selectCta = document.getElementById('select-cta');
  const inputCustomCta = document.getElementById('input-custom-cta');
  const btnGenerateDesc = document.getElementById('btn-generate-desc');
  const presetButtons = document.querySelectorAll('.preset-btn');

  // Sandbox elements
  const sandboxTextarea = document.getElementById('sandbox-textarea');
  const sandboxCharBadge = document.getElementById('sandbox-char-badge');
  const sandboxGaugeLabel = document.getElementById('sandbox-gauge-label');
  const sandboxPxLabel = document.getElementById('sandbox-px-label');
  const sandboxGaugeFill = document.getElementById('sandbox-gauge-fill');
  const sandboxDesktopBadge = document.getElementById('sandbox-desktop-badge');
  const sandboxMobileBadge = document.getElementById('sandbox-mobile-badge');
  const sandboxSerpTitle = document.getElementById('sandbox-serp-title');
  const sandboxSerpSnippet = document.getElementById('sandbox-serp-snippet');
  const btnCopySandbox = document.getElementById('btn-copy-sandbox');
  const btnCopySandboxTag = document.getElementById('btn-copy-sandbox-tag');

  // Filter tabs & card container
  const styleTabButtons = document.querySelectorAll('.style-tab-btn');
  const descCardsList = document.getElementById('desc-cards-list');
  const inputSearchDesc = document.getElementById('input-search-desc');
  const btnCopyAllDesc = document.getElementById('btn-copy-all-desc');
  const btnExportDescTxt = document.getElementById('btn-export-desc-txt');

  // Count badges
  const countAll = document.getElementById('count-all');
  const countPas = document.getElementById('count-pas');
  const countInfo = document.getElementById('count-info');
  const countAction = document.getElementById('count-action');
  const countMinimal = document.getElementById('count-minimal');
  const countQuestion = document.getElementById('count-question');
  const countFavorites = document.getElementById('count-favorites');

  const toast = document.getElementById('toast');
  const toastMessage = document.getElementById('toast-message');

  // --- State Variables ---
  let activeStyle = 'all';
  let generatedDescriptions = [];
  let favorites = new Set();

  // Load favorites from localStorage
  try {
    const saved = localStorage.getItem('seo_description_favorites');
    if (saved) {
      JSON.parse(saved).forEach(f => favorites.add(f));
    }
  } catch (err) {
    console.warn('Could not read saved favorites:', err);
  }

  function saveFavorites() {
    try {
      localStorage.setItem('seo_description_favorites', JSON.stringify([...favorites]));
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

  // Presets Data
  const PRESETS = {
    saas: {
      topic: 'Best Workflow Automation Tools for SaaS in 2026',
      primaryKw: 'workflow automation software',
      secondaryKw: 'no-code integrations, AI workflows, enterprise scalability',
      usp: 'eliminate manual bottlenecks and boost team speed by 40%',
      cta: 'Explore the top tools today'
    },
    ecommerce: {
      topic: 'Premium Ergonomic Office Chairs & Workspace Gear',
      primaryKw: 'ergonomic office chairs',
      secondaryKw: 'lumbar support, breathable mesh, posture correction',
      usp: 'experience all-day pain-free comfort with 10-year warranty',
      cta: 'Shop the new collection'
    },
    agency: {
      topic: 'Data-Driven B2B Content Marketing & SEO Services',
      primaryKw: 'B2B content marketing agency',
      secondaryKw: 'organic pipeline, high-intent keywords, thought leadership',
      usp: 'scale qualified inbound leads by 3x within 6 months',
      cta: 'Start your free trial now'
    },
    blog: {
      topic: 'The Complete Technical SEO Audit Playbook 2026',
      primaryKw: 'technical SEO audit',
      secondaryKw: 'Core Web Vitals, indexation fixes, schema markup',
      usp: 'fix critical crawl errors and unlock top Google rankings',
      cta: 'Download the free guide'
    }
  };

  // Canvas for pixel measurement
  let measurementCanvas = null;
  let measurementCtx = null;
  try {
    measurementCanvas = document.createElement('canvas');
    measurementCtx = measurementCanvas.getContext('2d');
  } catch {
    measurementCanvas = null;
    measurementCtx = null;
  }

  function calculateSnippetPixels(text) {
    if (!text) return 0;
    if (measurementCtx) {
      measurementCtx.font = '14px Arial, sans-serif';
      return Math.round(measurementCtx.measureText(text).width);
    }
    return Math.round(text.length * 6.2);
  }

  // Toast message utility
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

  // Copy helper
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
      console.error('Clipboard copy error:', err);
      showToast('Copied to clipboard!');
    }
  }

  // Extract clean CTA
  function getActiveCta() {
    if (selectCta.value === 'custom') {
      return (inputCustomCta.value || '').trim() || 'Learn more today';
    }
    return selectCta.value;
  }

  // Pick first secondary keyword
  function getPrimarySecondary(secKw) {
    if (!secKw) return '';
    const parts = secKw.split(',').map(s => s.trim()).filter(Boolean);
    return parts[0] || '';
  }

  // Description Template Generators
  const DESCRIPTION_TEMPLATES = [
    // 1. Problem-Agitate-Solve (PAS)
    {
      style: 'pas',
      styleName: 'Problem-Agitate-Solve (PAS)',
      make: (topic, pKw, sKw, usp, cta) => {
        const firstSec = getPrimarySecondary(sKw);
        return `Tired of slow, complicated ${pKw}? Inefficient workflows waste valuable hours. Discover how to ${usp} with proven strategies. ${cta}!`;
      }
    },
    {
      style: 'pas',
      styleName: 'Problem-Agitate-Solve (PAS)',
      make: (topic, pKw, sKw, usp, cta) => {
        return `Struggling with ${topic.toLowerCase().replace(/^(the|a|an)\s+/i, '')}? Outdated methods drain team energy. Unlock modern ${pKw} engineered to ${usp}. ${cta}.`;
      }
    },
    {
      style: 'pas',
      styleName: 'Problem-Agitate-Solve (PAS)',
      make: (topic, pKw, sKw, usp, cta) => {
        const firstSec = getPrimarySecondary(sKw);
        return `Stop losing momentum on ${pKw}. Without modern tools, ${firstSec || 'growth'} suffers. Leverage our battle-tested system to ${usp}. ${cta} today!`;
      }
    },

    // 2. Informational / Value-First
    {
      style: 'info',
      styleName: 'Value-First Informational',
      make: (topic, pKw, sKw, usp, cta) => {
        const firstSec = getPrimarySecondary(sKw);
        return `Explore our in-depth guide to ${pKw}. Learn essential techniques for ${firstSec || 'success'} and discover how to ${usp}. ${cta}!`;
      }
    },
    {
      style: 'info',
      styleName: 'Value-First Informational',
      make: (topic, pKw, sKw, usp, cta) => {
        return `The complete overview of ${topic}. Compare leading ${pKw} solutions and achieve the ability to ${usp}. Get full insights now.`;
      }
    },
    {
      style: 'info',
      styleName: 'Value-First Informational',
      make: (topic, pKw, sKw, usp, cta) => {
        const firstSec = getPrimarySecondary(sKw);
        return `Everything you need to know about ${pKw}. Master ${firstSec || 'best practices'} with actionable steps designed to ${usp}. ${cta}!`;
      }
    },

    // 3. Action & Benefit Driven
    {
      style: 'action',
      styleName: 'Action & Benefit Driven',
      make: (topic, pKw, sKw, usp, cta) => {
        return `Upgrade your results with high-impact ${pKw}. Ready to ${usp}? See why industry leaders trust our approach. ${cta}!`;
      }
    },
    {
      style: 'action',
      styleName: 'Action & Benefit Driven',
      make: (topic, pKw, sKw, usp, cta) => {
        const firstSec = getPrimarySecondary(sKw);
        return `Accelerate your growth with next-gen ${pKw}. Built to ${usp} with seamless ${firstSec || 'features'}. ${cta} right now!`;
      }
    },
    {
      style: 'action',
      styleName: 'Action & Benefit Driven',
      make: (topic, pKw, sKw, usp, cta) => {
        return `Take full control of ${pKw} in 2026. Empower your team to ${usp} with zero guesswork. ${cta} for immediate access!`;
      }
    },

    // 4. Minimalist & Direct
    {
      style: 'minimal',
      styleName: 'Minimalist & Direct',
      make: (topic, pKw, sKw, usp, cta) => {
        const firstSec = getPrimarySecondary(sKw);
        return `${pKw}: ${usp}. Includes ${firstSec || 'expert setup'}. Fast, reliable, and verified. ${cta}.`;
      }
    },
    {
      style: 'minimal',
      styleName: 'Minimalist & Direct',
      make: (topic, pKw, sKw, usp, cta) => {
        return `Top-rated ${pKw} for 2026. Designed to ${usp}. Clear pricing and quick deployment. ${cta} today.`;
      }
    },
    {
      style: 'minimal',
      styleName: 'Minimalist & Direct',
      make: (topic, pKw, sKw, usp, cta) => {
        const firstSec = getPrimarySecondary(sKw);
        return `${topic}: The modern way to ${usp} with cutting-edge ${firstSec || pKw}. ${cta}.`;
      }
    },

    // 5. Question & Curiosity
    {
      style: 'question',
      styleName: 'Question & Curiosity',
      make: (topic, pKw, sKw, usp, cta) => {
        return `Want to ${usp}? Discover how the right ${pKw} transforms performance and eliminates friction. ${cta}!`;
      }
    },
    {
      style: 'question',
      styleName: 'Question & Curiosity',
      make: (topic, pKw, sKw, usp, cta) => {
        return `Looking for the best ${pKw} in 2026? Uncover proven ways to ${usp} with our comprehensive breakdown. ${cta}!`;
      }
    },
    {
      style: 'question',
      styleName: 'Question & Curiosity',
      make: (topic, pKw, sKw, usp, cta) => {
        const firstSec = getPrimarySecondary(sKw);
        return `Ready to revolutionize your ${firstSec || 'operations'}? See how modern ${pKw} lets you ${usp}. ${cta} to learn more!`;
      }
    }
  ];

  // Synthesize Descriptions
  function synthesizeDescriptions() {
    const rawTopic = (inputTopic.value || '').trim() || 'Workflow Automation Suite';
    const rawPKw = (inputPrimaryKw.value || '').trim() || 'workflow automation software';
    const rawSKw = (inputSecondaryKw.value || '').trim();
    const rawUsp = (inputUsp.value || '').trim() || 'save time and boost team speed';
    const cta = getActiveCta();

    generatedDescriptions = DESCRIPTION_TEMPLATES.map((tmpl, idx) => {
      let text = tmpl.make(rawTopic, rawPKw, rawSKw, rawUsp, cta);

      // Clean up multiple spaces
      text = text.replace(/\s+/g, ' ').trim();

      const chars = text.length;
      const px = calculateSnippetPixels(text);

      // Evaluate desktop & mobile safety
      const desktopSafe = chars <= 160 && px <= 960;
      const mobileSafe = chars <= 120 && px <= 680;
      const isOptimal = chars >= 135 && chars <= 160;

      return {
        id: `desc-${idx}-${Date.now()}`,
        style: tmpl.style,
        styleName: tmpl.styleName,
        text,
        chars,
        px,
        desktopSafe,
        mobileSafe,
        isOptimal,
        topic: rawTopic
      };
    });

    updateStyleCounts();
    renderDescriptionCards();
  }

  function updateStyleCounts() {
    const counts = {
      all: generatedDescriptions.length,
      pas: 0,
      info: 0,
      action: 0,
      minimal: 0,
      question: 0
    };

    generatedDescriptions.forEach(d => {
      if (counts[d.style] !== undefined) {
        counts[d.style]++;
      }
    });

    if (countAll) countAll.textContent = counts.all;
    if (countPas) countPas.textContent = counts.pas;
    if (countInfo) countInfo.textContent = counts.info;
    if (countAction) countAction.textContent = counts.action;
    if (countMinimal) countMinimal.textContent = counts.minimal;
    if (countQuestion) countQuestion.textContent = counts.question;
    updateFavoritesCount();
  }

  // Render Description Cards
  function renderDescriptionCards() {
    if (!descCardsList) return;

    const searchTerm = (inputSearchDesc.value || '').toLowerCase().trim();

    const filtered = generatedDescriptions.filter(item => {
      if (activeStyle === 'favorites') {
        if (!favorites.has(item.text)) return false;
      } else if (activeStyle !== 'all') {
        if (item.style !== activeStyle) return false;
      }

      if (searchTerm && !item.text.toLowerCase().includes(searchTerm)) {
        return false;
      }

      return true;
    });

    if (filtered.length === 0) {
      descCardsList.innerHTML = `
        <div style="text-align: center; padding: 3rem 1rem; color: var(--text-secondary);">
          <div style="font-size: 2rem; margin-bottom: 0.5rem;">🔍</div>
          <div style="font-weight: 600; font-size: 1.05rem;">No matching meta descriptions found</div>
          <p style="font-size: 0.85rem; margin-top: 0.25rem;">Adjust search terms or synthesize a fresh set above.</p>
        </div>
      `;
      return;
    }

    descCardsList.innerHTML = filtered.map(item => {
      const isFav = favorites.has(item.text);

      // Gauge progress (capped at 160 chars)
      const gaugePct = Math.min(100, Math.round((item.chars / 160) * 100));

      let gaugeFillClass = 'var(--success)';
      let lengthStatusText = 'Optimal Length (140-160)';
      if (item.chars > 160) {
        gaugeFillClass = 'var(--error)';
        lengthStatusText = 'Too Long (Truncates on Desktop)';
      } else if (item.chars < 130) {
        gaugeFillClass = 'var(--warning)';
        lengthStatusText = 'A bit short (< 130 chars)';
      }

      const desktopBadgeHtml = item.desktopSafe
        ? `<span class="safe-badge green">✓ Desktop Safe (${item.chars}/160)</span>`
        : `<span class="safe-badge red">⚠ Desktop Truncated (&gt;160)</span>`;

      const mobileBadgeHtml = item.mobileSafe
        ? `<span class="safe-badge green">✓ Mobile Safe (&le;120)</span>`
        : `<span class="safe-badge yellow">⚠ Mobile Truncated (&gt;120)</span>`;

      return `
        <div class="desc-card ${isFav ? 'favorite-active' : ''}" data-text="${encodeURIComponent(item.text)}">
          <div class="desc-card-top">
            <span class="framework-badge">${item.styleName}</span>
            <div class="safe-badges-row">
              ${desktopBadgeHtml}
              ${mobileBadgeHtml}
            </div>
          </div>

          <!-- Description Text Body -->
          <div class="desc-text-body" title="Click to edit in sandbox">
            ${item.text}
          </div>

          <!-- Real-Time Length Gauge -->
          <div>
            <div style="display: flex; justify-content: space-between; font-size: 0.75rem; color: var(--text-tertiary); margin-bottom: 2px;">
              <span>${item.chars} chars · ~${item.px} px</span>
              <span style="font-weight: 600; color: ${gaugeFillClass};">${lengthStatusText}</span>
            </div>
            <div class="length-gauge-bar-track">
              <div class="length-gauge-bar-fill" style="width: ${gaugePct}%; background-color: ${gaugeFillClass};"></div>
            </div>
          </div>

          <!-- Live SERP Preview Card for this item -->
          <div class="mini-serp-preview">
            <span class="mini-serp-url">https://example.com › solutions</span>
            <a href="javascript:void(0);" class="mini-serp-title">${item.topic}</a>
            <div class="mini-serp-body">${item.text}</div>
          </div>

          <!-- Card Action Buttons -->
          <div class="desc-card-actions">
            <span style="font-size: 0.75rem; color: var(--text-tertiary);">Click text to edit in sandbox</span>
            <div class="icon-btn-group">
              <button class="icon-action-btn fav ${isFav ? 'active' : ''}" data-action="fav" title="${isFav ? 'Remove Favorite' : 'Save as Favorite'}">
                <svg viewBox="0 0 24 24" width="15" height="15" fill="${isFav ? 'currentColor' : 'none'}" stroke="currentColor" stroke-width="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>
              </button>
              <button class="icon-action-btn" data-action="copy" title="Copy Description Text">
                <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
              </button>
              <button class="icon-action-btn" data-action="copy-tag" title="Copy as HTML Meta Tag">
                <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2"><polyline points="16 18 22 12 16 6"></polyline><polyline points="8 6 2 12 8 18"></polyline></svg>
              </button>
              <button class="icon-action-btn" data-action="edit" title="Load into Editor Sandbox">
                <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
              </button>
            </div>
          </div>
        </div>
      `;
    }).join('');

    attachCardListeners();
  }

  function attachCardListeners() {
    descCardsList.querySelectorAll('.desc-card').forEach(card => {
      const rawText = decodeURIComponent(card.getAttribute('data-text'));

      const textBody = card.querySelector('.desc-text-body');
      if (textBody) {
        textBody.addEventListener('click', () => {
          loadIntoSandbox(rawText);
        });
      }

      const favBtn = card.querySelector('[data-action="fav"]');
      if (favBtn) {
        favBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          if (favorites.has(rawText)) {
            favorites.delete(rawText);
            showToast('Removed from favorites');
          } else {
            favorites.add(rawText);
            showToast('Added to favorites!');
          }
          saveFavorites();
          renderDescriptionCards();
        });
      }

      const copyBtn = card.querySelector('[data-action="copy"]');
      if (copyBtn) {
        copyBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          copyToClipboard(rawText, 'Description copied to clipboard!');
        });
      }

      const copyTagBtn = card.querySelector('[data-action="copy-tag"]');
      if (copyTagBtn) {
        copyTagBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          const tag = `<meta name="description" content="${rawText.replace(/"/g, '&quot;')}">`;
          copyToClipboard(tag, 'Meta description HTML tag copied!');
        });
      }

      const editBtn = card.querySelector('[data-action="edit"]');
      if (editBtn) {
        editBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          loadIntoSandbox(rawText);
        });
      }
    });
  }

  // Load into Sandbox Editor
  function loadIntoSandbox(text) {
    if (!sandboxTextarea) return;
    sandboxTextarea.value = text;
    updateSandboxMetrics();
    showToast('Loaded into Description Sandbox');
  }

  // Update Sandbox Metrics
  function updateSandboxMetrics() {
    const text = (sandboxTextarea.value || '').trim();
    const chars = text.length;
    const px = calculateSnippetPixels(text);
    const topic = (inputTopic.value || '').trim() || 'Best Workflow Automation Tools';

    if (sandboxCharBadge) {
      sandboxCharBadge.textContent = `${chars} chars`;
      if (chars > 160) {
        sandboxCharBadge.className = 'safe-badge red';
      } else if (chars >= 135) {
        sandboxCharBadge.className = 'safe-badge green';
      } else {
        sandboxCharBadge.className = 'safe-badge yellow';
      }
    }

    if (sandboxGaugeLabel) {
      let statusLabel = 'Optimal';
      if (chars > 160) statusLabel = 'Too Long';
      else if (chars < 130) statusLabel = 'Short';
      sandboxGaugeLabel.textContent = `Length: ${chars} / 160 chars (${statusLabel})`;
    }

    if (sandboxPxLabel) {
      sandboxPxLabel.textContent = `~${px} px`;
    }

    if (sandboxGaugeFill) {
      const pct = Math.min(100, Math.round((chars / 160) * 100));
      sandboxGaugeFill.style.width = `${pct}%`;
      if (chars > 160) {
        sandboxGaugeFill.style.backgroundColor = 'var(--error)';
      } else if (chars >= 135) {
        sandboxGaugeFill.style.backgroundColor = 'var(--success)';
      } else {
        sandboxGaugeFill.style.backgroundColor = 'var(--warning)';
      }
    }

    if (sandboxDesktopBadge) {
      if (chars <= 160 && px <= 960) {
        sandboxDesktopBadge.className = 'safe-badge green';
        sandboxDesktopBadge.textContent = `✓ Desktop Safe (${chars}/160)`;
      } else {
        sandboxDesktopBadge.className = 'safe-badge red';
        sandboxDesktopBadge.textContent = `⚠ Desktop Truncated (>160)`;
      }
    }

    if (sandboxMobileBadge) {
      if (chars <= 120 && px <= 680) {
        sandboxMobileBadge.className = 'safe-badge green';
        sandboxMobileBadge.textContent = `✓ Mobile Safe (≤120)`;
      } else {
        sandboxMobileBadge.className = 'safe-badge yellow';
        sandboxMobileBadge.textContent = `⚠ Mobile Truncated (>120)`;
      }
    }

    if (sandboxSerpTitle) {
      sandboxSerpTitle.textContent = topic;
    }

    if (sandboxSerpSnippet) {
      sandboxSerpSnippet.textContent = text || 'No description entered.';
    }
  }

  // --- Global Event Handlers ---

  if (btnGenerateDesc) {
    btnGenerateDesc.addEventListener('click', () => {
      synthesizeDescriptions();
      showToast('Synthesized 15 high-converting meta descriptions!');
    });
  }

  // CTA selector
  if (selectCta) {
    selectCta.addEventListener('change', () => {
      if (selectCta.value === 'custom') {
        inputCustomCta.classList.remove('hidden');
      } else {
        inputCustomCta.classList.add('hidden');
      }
      synthesizeDescriptions();
    });
  }

  // Preset buttons
  presetButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const presetKey = btn.getAttribute('data-preset');
      const data = PRESETS[presetKey];
      if (!data) return;

      inputTopic.value = data.topic;
      inputPrimaryKw.value = data.primaryKw;
      inputSecondaryKw.value = data.secondaryKw;
      inputUsp.value = data.usp;
      selectCta.value = data.cta;
      inputCustomCta.classList.add('hidden');

      synthesizeDescriptions();
      if (generatedDescriptions.length > 0) {
        loadIntoSandbox(generatedDescriptions[0].text);
      }
      showToast(`Applied "${btn.textContent.trim()}" preset`);
    });
  });

  // Style Tabs
  styleTabButtons.forEach(tab => {
    tab.addEventListener('click', () => {
      styleTabButtons.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      activeStyle = tab.getAttribute('data-style') || 'all';
      renderDescriptionCards();
    });
  });

  // Search input
  if (inputSearchDesc) {
    inputSearchDesc.addEventListener('input', renderDescriptionCards);
  }

  // Sandbox inputs
  if (sandboxTextarea) {
    sandboxTextarea.addEventListener('input', updateSandboxMetrics);
  }

  if (btnCopySandbox) {
    btnCopySandbox.addEventListener('click', () => {
      const text = (sandboxTextarea.value || '').trim();
      if (!text) {
        showToast('Sandbox is empty');
        return;
      }
      copyToClipboard(text, 'Meta description copied to clipboard!');
    });
  }

  if (btnCopySandboxTag) {
    btnCopySandboxTag.addEventListener('click', () => {
      const text = (sandboxTextarea.value || '').trim();
      if (!text) {
        showToast('Sandbox is empty');
        return;
      }
      const tag = `<meta name="description" content="${text.replace(/"/g, '&quot;')}">`;
      copyToClipboard(tag, 'Meta description HTML tag copied!');
    });
  }

  // Copy All Descriptions
  if (btnCopyAllDesc) {
    btnCopyAllDesc.addEventListener('click', () => {
      if (generatedDescriptions.length === 0) {
        showToast('No descriptions to copy');
        return;
      }
      const allText = generatedDescriptions.map((d, i) => `${i + 1}. [${d.styleName}] (${d.chars} chars)\n${d.text}\n`).join('\n');
      copyToClipboard(allText, `Copied all ${generatedDescriptions.length} descriptions!`);
    });
  }

  // Export TXT
  if (btnExportDescTxt) {
    btnExportDescTxt.addEventListener('click', () => {
      if (generatedDescriptions.length === 0) {
        showToast('No descriptions to export');
        return;
      }
      const content = generatedDescriptions.map((d, i) => `${i + 1}. [${d.styleName}] (${d.chars} chars / ~${d.px} px)\n${d.text}\nHTML: <meta name="description" content="${d.text.replace(/"/g, '&quot;')}">\n`).join('\n');
      const blob = new Blob([content], { type: 'text/plain;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `meta-descriptions-${Date.now()}.txt`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      showToast('Downloaded descriptions as TXT');
    });
  }

  // Initial synthesis
  synthesizeDescriptions();
  if (generatedDescriptions.length > 0) {
    sandboxTextarea.value = generatedDescriptions[0].text;
    updateSandboxMetrics();
  }
});