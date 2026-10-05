/**
 * SEO Slug Optimizer & Analyzer
 * Client-Side Heuristic Engine
 */

const STOP_WORDS = new Set([
  'a', 'about', 'above', 'after', 'again', 'against', 'all', 'am', 'an', 'and', 'any', 'are', 'aren\'t',
  'as', 'at', 'be', 'because', 'been', 'before', 'being', 'below', 'between', 'both', 'but', 'by',
  'can', 'cannot', 'could', 'couldn\'t', 'did', 'didn\'t', 'do', 'does', 'doesn\'t', 'doing', 'don\'t',
  'down', 'during', 'each', 'few', 'for', 'from', 'further', 'had', 'hadn\'t', 'has', 'hasn\'t',
  'have', 'haven\'t', 'having', 'he', 'he\'d', 'he\'ll', 'he\'s', 'her', 'here', 'here\'s', 'hers',
  'herself', 'him', 'himself', 'his', 'how', 'how\'s', 'i', 'i\'d', 'i\'ll', 'i\'m', 'i\'ve', 'if',
  'in', 'into', 'is', 'isn\'t', 'it', 'it\'s', 'its', 'itself', 'let\'s', 'me', 'more', 'most',
  'mustn\'t', 'my', 'myself', 'no', 'nor', 'not', 'of', 'off', 'on', 'once', 'only', 'or', 'other',
  'ought', 'our', 'ours', 'ourselves', 'out', 'over', 'own', 'same', 'shan\'t', 'she', 'she\'d',
  'she\'ll', 'she\'s', 'should', 'shouldn\'t', 'so', 'some', 'such', 'than', 'that', 'that\'s',
  'the', 'their', 'theirs', 'them', 'themselves', 'then', 'there', 'there\'s', 'these', 'they',
  'they\'d', 'they\'ll', 'they\'re', 'they\'ve', 'this', 'those', 'through', 'to', 'too', 'under',
  'until', 'up', 'very', 'was', 'wasn\'t', 'we', 'we\'d', 'we\'ll', 'we\'re', 'we\'ve', 'were',
  'weren\'t', 'what', 'what\'s', 'when', 'when\'s', 'where', 'where\'s', 'which', 'while', 'who',
  'who\'s', 'whom', 'why', 'why\'s', 'with', 'won\'t', 'would', 'wouldn\'t', 'you', 'you\'d',
  'you\'ll', 'you\'re', 'you\'ve', 'your', 'yours', 'yourself', 'yourselves'
]);

class SlugOptimizer {
  constructor() {
    this.initElements();
    this.bindEvents();
    this.audit();
  }

  initElements() {
    this.input = document.getElementById('slug-input');
    this.btnClear = document.getElementById('btn-clear');
    this.detectedSlugLabel = document.getElementById('detected-slug-label');

    // Samples
    this.sampleDatedBlog = document.getElementById('sample-dated-blog');
    this.sampleEcommerce = document.getElementById('sample-ecommerce');
    this.sampleMessy = document.getElementById('sample-messy');

    // Score elements
    this.scoreNumber = document.getElementById('score-number-display');
    this.scoreMeterFill = document.getElementById('score-meter-fill');
    this.scoreVerdictTitle = document.getElementById('score-verdict-title');
    this.scoreVerdictDesc = document.getElementById('score-verdict-desc');
    this.auditChecklistContainer = document.getElementById('audit-checklist-container');

    // Candidate elements
    this.slugCandidateUltra = document.getElementById('slug-candidate-ultra');
    this.slugCandidateTargeted = document.getElementById('slug-candidate-targeted');
    this.slugCandidateCanonical = document.getElementById('slug-candidate-canonical');
    this.metaCandidateUltra = document.getElementById('meta-candidate-ultra');
    this.metaCandidateTargeted = document.getElementById('meta-candidate-targeted');
    this.metaCandidateCanonical = document.getElementById('meta-candidate-canonical');

    // Candidate buttons
    this.btnCopyUltra = document.getElementById('btn-copy-ultra');
    this.btnCopyTargeted = document.getElementById('btn-copy-targeted');
    this.btnCopyCanonical = document.getElementById('btn-copy-canonical');
    this.btnApplyUltra = document.getElementById('btn-apply-ultra');
    this.btnApplyTargeted = document.getElementById('btn-apply-targeted');
    this.btnApplyCanonical = document.getElementById('btn-apply-canonical');
  }

  bindEvents() {
    this.input.addEventListener('input', () => this.audit());

    this.btnClear.addEventListener('click', () => {
      this.input.value = '';
      this.audit();
      this.input.focus();
    });

    this.sampleDatedBlog.addEventListener('click', () => {
      this.input.value = 'https://myblog.com/2023/10/the-10-ultimate-ways-to-learn-javascript-for-beginners-in-2023-id94832';
      this.audit();
    });

    this.sampleEcommerce.addEventListener('click', () => {
      this.input.value = 'https://shop.example.com/products/men_luxury_leather_boots_vintage_2022_sale--black_id7721.html';
      this.audit();
    });

    this.sampleMessy.addEventListener('click', () => {
      this.input.value = 'How-To-Build-An-Amazing-Full-Stack-Web-Application-For-Complete-Beginners-Step-By-Step';
      this.audit();
    });

    // Copy actions
    this.btnCopyUltra.addEventListener('click', () => this.copyText(this.slugCandidateUltra.textContent, this.btnCopyUltra));
    this.btnCopyTargeted.addEventListener('click', () => this.copyText(this.slugCandidateTargeted.textContent, this.btnCopyTargeted));
    this.btnCopyCanonical.addEventListener('click', () => this.copyText(this.slugCandidateCanonical.textContent, this.btnCopyCanonical));

    // Apply actions
    this.btnApplyUltra.addEventListener('click', () => {
      this.input.value = this.slugCandidateUltra.textContent;
      this.audit();
    });
    this.btnApplyTargeted.addEventListener('click', () => {
      this.input.value = this.slugCandidateTargeted.textContent;
      this.audit();
    });
    this.btnApplyCanonical.addEventListener('click', () => {
      this.input.value = this.slugCandidateCanonical.textContent;
      this.audit();
    });
  }

  /**
   * Extracts clean slug from URL or raw text
   */
  extractSlug(rawInput) {
    if (!rawInput || !rawInput.trim()) return '';

    let text = rawInput.trim();

    // Check if full URL
    if (text.startsWith('http://') || text.startsWith('https://') || text.includes('://')) {
      try {
        const parsed = new URL(text);
        const pathSegments = parsed.pathname.split('/').filter(Boolean);
        if (pathSegments.length > 0) {
          text = pathSegments[pathSegments.length - 1];
        }
      } catch {
        // Fallback regex if malformed URL
        text = text.replace(/^https?:\/\/[^/]+/i, '');
        const parts = text.split('/').filter(Boolean);
        if (parts.length > 0) {
          text = parts[parts.length - 1];
        }
      }
    } else if (text.includes('/')) {
      // Relative path like /posts/my-slug/
      const parts = text.split('/').filter(Boolean);
      if (parts.length > 0) {
        text = parts[parts.length - 1];
      }
    }

    // Strip common file extensions (.html, .php, etc.)
    text = text.replace(/\.(html?|php|aspx?|jsp|shtml)$/i, '');

    // Strip query parameters and hashes
    text = text.replace(/[?#].*$/, '');

    return text.trim();
  }

  audit() {
    const rawVal = this.input.value.trim();
    const slug = this.extractSlug(rawVal);

    if (!slug) {
      this.renderEmptyState();
      return;
    }

    this.detectedSlugLabel.innerHTML = `Parsed Slug: <code>${this.escapeHtml(slug)}</code>`;

    // Perform diagnostics
    const checks = [];
    let score = 100;

    // 1. Length analysis
    const charLen = slug.length;
    let lenStatus = 'passed';
    let lenDesc = `Optimal character length (${charLen} characters). Under the 50-character search engine cutoff.`;
    if (charLen > 70) {
      lenStatus = 'issue';
      score -= 20;
      lenDesc = `Slug is too long (${charLen} characters). Google snippets typically truncate slugs over 50-60 characters.`;
    } else if (charLen > 50) {
      lenStatus = 'warning';
      score -= 10;
      lenDesc = `Slightly long (${charLen} characters). Ideal SEO slugs stay strictly under 50 characters.`;
    } else if (charLen < 5) {
      lenStatus = 'warning';
      score -= 10;
      lenDesc = `Slug is very short (${charLen} characters). Ensure sufficient descriptive keywords for search intent.`;
    }

    checks.push({
      title: 'Character Length & Concision',
      status: lenStatus,
      badge: `${charLen} chars`,
      desc: lenDesc
    });

    // 2. Word Count
    // Tokenize words by hyphen, underscore, or space
    const rawWords = slug.split(/[-_\s.]+/).filter(Boolean);
    const wordCount = rawWords.length;
    let wordStatus = 'passed';
    let wordDesc = `Ideal word count (${wordCount} words). Fits the recommended 3-5 word range for maximum topical clarity.`;

    if (wordCount > 7) {
      wordStatus = 'issue';
      score -= 15;
      wordDesc = `Excessive word count (${wordCount} words). Long slugs dilute keyword prominence and hurt click-through rates.`;
    } else if (wordCount === 6 || wordCount === 7) {
      wordStatus = 'warning';
      score -= 8;
      wordDesc = `Word count is on the higher side (${wordCount} words). Consider condensing to 3-5 core topical keywords.`;
    } else if (wordCount < 2) {
      wordStatus = 'warning';
      score -= 10;
      wordDesc = `Only ${wordCount} word detected. Two to four keywords generally perform better for search relevance.`;
    }

    checks.push({
      title: 'Word Count & Depth',
      status: wordStatus,
      badge: `${wordCount} words`,
      desc: wordDesc
    });

    // 3. Stop Words Detection
    const detectedStopWords = [];
    rawWords.forEach(w => {
      const lower = w.toLowerCase();
      if (STOP_WORDS.has(lower)) {
        detectedStopWords.push(lower);
      }
    });

    let stopStatus = 'passed';
    let stopDesc = 'Zero stop words detected. Permalink maintains high keyword density.';
    if (detectedStopWords.length > 0) {
      const penalty = Math.min(20, detectedStopWords.length * 6);
      score -= penalty;
      stopStatus = detectedStopWords.length >= 3 ? 'issue' : 'warning';
      stopDesc = `Detected ${detectedStopWords.length} filler stop word(s) that dilute keyword concentration.`;
    }

    checks.push({
      title: 'Stop Words Filter',
      status: stopStatus,
      badge: detectedStopWords.length === 0 ? 'Clean' : `${detectedStopWords.length} found`,
      desc: stopDesc,
      tags: detectedStopWords
    });

    // 4. Stale Dates & Numeric IDs
    const years = slug.match(/\b(19\d\d|20\d\d)\b/g) || [];
    const datePatterns = slug.match(/\d{4}[-_]\d{1,2}[-_]\d{1,2}/g) || [];
    const idPatterns = slug.match(/\b(id\d+|\d{5,}|p\d{4,})\b/gi) || [];
    const allStaleFlags = [...new Set([...years, ...datePatterns, ...idPatterns])];

    let staleStatus = 'passed';
    let staleDesc = 'No obsolete year stamps or database IDs found. Slug is evergreen.';
    if (allStaleFlags.length > 0) {
      score -= 18;
      staleStatus = 'issue';
      staleDesc = `Detected timestamp/year/ID markers: "${allStaleFlags.join(', ')}". Hardcoded years or ID tags harm evergreen rankings when updating content.`;
    }

    checks.push({
      title: 'Evergreen Freshness & Stale Dates',
      status: staleStatus,
      badge: allStaleFlags.length === 0 ? 'Evergreen' : `${allStaleFlags.length} flags`,
      desc: staleDesc,
      tags: allStaleFlags
    });

    // 5. Delimiter Hygiene & Casing
    const delimiterIssues = [];
    if (slug.includes('_')) {
      delimiterIssues.push('Contains underscores (_) instead of hyphens (-)');
      score -= 8;
    }
    if (/--+/.test(slug) || /__+/.test(slug)) {
      delimiterIssues.push('Contains duplicate consecutive delimiters (-- or __)');
      score -= 8;
    }
    if (/[A-Z]/.test(slug)) {
      delimiterIssues.push('Contains uppercase letters (causes duplicate page indexing risks)');
      score -= 8;
    }
    if (/^[-_.]|[-_.]$/.test(slug)) {
      delimiterIssues.push('Contains leading or trailing separator characters');
      score -= 5;
    }
    if (/[%+=?&#!$*@()^~]/.test(slug)) {
      delimiterIssues.push('Contains unsafe punctuation or encoded symbols');
      score -= 10;
    }

    let delimStatus = 'passed';
    let delimDesc = 'Standard single hyphens and clean alphanumeric formatting.';
    if (delimiterIssues.length > 0) {
      delimStatus = delimiterIssues.length >= 2 ? 'issue' : 'warning';
      delimDesc = delimiterIssues.join('. ') + '.';
    }

    checks.push({
      title: 'Delimiter & Case Hygiene',
      status: delimStatus,
      badge: delimiterIssues.length === 0 ? 'Compliant' : `${delimiterIssues.length} issues`,
      desc: delimDesc
    });

    // Clamp score
    const finalScore = Math.max(10, Math.min(100, Math.round(score)));

    // Render results
    this.renderScore(finalScore);
    this.renderChecklist(checks);
    this.generateOptimizedCandidates(rawWords, allStaleFlags);
  }

  renderScore(score) {
    this.scoreNumber.textContent = score;

    // Circumference = 2 * PI * r = 2 * 3.14159 * 45 = ~283
    const circumference = 283;
    const offset = circumference - (circumference * score / 100);
    this.scoreMeterFill.style.strokeDashoffset = offset;

    let strokeColor = '#10b981'; // Green
    let title = 'Excellent SEO Health';
    let desc = 'This slug adheres cleanly to search engine permalink best practices.';

    if (score < 50) {
      strokeColor = '#ef4444'; // Red
      title = 'Needs Urgent Optimization';
      desc = 'Contains bloat, stop words, or structural flaws that hurt indexation and CTR.';
    } else if (score < 80) {
      strokeColor = '#f59e0b'; // Amber
      title = 'Moderate SEO Quality';
      desc = 'Readable, but contains opportunities to improve brevity and keyword focus.';
    }

    this.scoreMeterFill.style.stroke = strokeColor;
    this.scoreVerdictTitle.textContent = title;
    this.scoreVerdictTitle.style.color = strokeColor;
    this.scoreVerdictDesc.textContent = desc;
  }

  renderChecklist(checks) {
    this.auditChecklistContainer.innerHTML = checks.map(c => {
      let iconSvg = '';
      if (c.status === 'passed') {
        iconSvg = `<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"></polyline></svg>`;
      } else if (c.status === 'warning') {
        iconSvg = `<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="9" x2="12" y2="13"></line><circle cx="12" cy="17" r="1"></circle></svg>`;
      } else {
        iconSvg = `<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>`;
      }

      const tagsHtml = (c.tags && c.tags.length > 0) 
        ? `<div class="tag-cloud">${c.tags.map(t => `<span class="tag-pill">${this.escapeHtml(t)}</span>`).join('')}</div>`
        : '';

      return `
        <div class="audit-item ${c.status}">
          <div class="audit-icon">${iconSvg}</div>
          <div class="audit-item-body">
            <div class="audit-item-title">
              <span>${this.escapeHtml(c.title)}</span>
              <span class="audit-item-badge">${this.escapeHtml(c.badge)}</span>
            </div>
            <div class="audit-item-desc">${this.escapeHtml(c.desc)}</div>
            ${tagsHtml}
          </div>
        </div>
      `;
    }).join('');
  }

  /**
   * Generates 3 optimized versions:
   * 1. Ultra-Clean (Short 2-3 words)
   * 2. Keyword-Targeted (Balanced 3-5 words)
   * 3. Strict Canonical (Zero stop-words, lowercase)
   */
  generateOptimizedCandidates(rawWords, staleFlags) {
    const staleSet = new Set(staleFlags.map(s => s.toLowerCase()));

    // Clean, lowercased, non-stop, non-stale tokens
    const filteredTokens = [];
    rawWords.forEach(w => {
      // remove non-alphanumeric
      const clean = w.replace(/[^A-Za-z0-9]/g, '').toLowerCase();
      if (!clean) return;

      // Filter stop words
      if (STOP_WORDS.has(clean)) return;

      // Filter stale years / IDs
      if (staleSet.has(clean) || /^(19\d\d|20\d\d)$/.test(clean) || /^id\d+$/i.test(clean)) return;

      filteredTokens.push(clean);
    });

    // Fallback if all tokens got filtered
    const baseTokens = filteredTokens.length > 0 ? filteredTokens : rawWords.map(w => w.toLowerCase().replace(/[^a-z0-9]/g, ''));

    // 1. Ultra-Clean: top 2-3 tokens
    const ultraTokens = baseTokens.slice(0, Math.min(3, Math.max(2, baseTokens.length)));
    const ultraSlug = ultraTokens.join('-');

    // 2. Keyword-Targeted: balanced 3-5 tokens
    const targetedTokens = baseTokens.slice(0, Math.min(5, Math.max(3, baseTokens.length)));
    const targetedSlug = targetedTokens.join('-');

    // 3. Strict Canonical: all non-stop-word tokens (up to 6)
    const canonicalTokens = baseTokens.slice(0, Math.min(6, baseTokens.length));
    const canonicalSlug = canonicalTokens.join('-');

    // Render candidate 1
    this.slugCandidateUltra.textContent = ultraSlug || 'ultra-clean-slug';
    this.metaCandidateUltra.textContent = `${ultraSlug.length} chars · ${ultraTokens.length} words`;

    // Render candidate 2
    this.slugCandidateTargeted.textContent = targetedSlug || 'keyword-targeted-slug';
    this.metaCandidateTargeted.textContent = `${targetedSlug.length} chars · ${targetedTokens.length} words`;

    // Render candidate 3
    this.slugCandidateCanonical.textContent = canonicalSlug || 'strict-canonical-slug';
    this.metaCandidateCanonical.textContent = `${canonicalSlug.length} chars · ${canonicalTokens.length} words`;
  }

  renderEmptyState() {
    this.detectedSlugLabel.innerHTML = 'Parsed Slug: <em>None detected</em>';
    this.scoreNumber.textContent = '0';
    this.scoreMeterFill.style.strokeDashoffset = '283';
    this.scoreVerdictTitle.textContent = 'Awaiting Input';
    this.scoreVerdictTitle.style.color = 'var(--text-secondary)';
    this.scoreVerdictDesc.textContent = 'Enter a URL or slug above to initiate diagnostic SEO analysis.';
    this.auditChecklistContainer.innerHTML = '<div style="color: var(--text-tertiary); font-size: 0.85rem; padding: 1rem; text-align: center;">No slug currently loaded.</div>';

    this.slugCandidateUltra.textContent = '';
    this.slugCandidateTargeted.textContent = '';
    this.slugCandidateCanonical.textContent = '';
    this.metaCandidateUltra.textContent = '0 chars · 0 words';
    this.metaCandidateTargeted.textContent = '0 chars · 0 words';
    this.metaCandidateCanonical.textContent = '0 chars · 0 words';
  }

  copyText(text, btnElement) {
    if (!text || !text.trim()) return;

    navigator.clipboard.writeText(text).then(() => {
      const originalHTML = btnElement.innerHTML;
      btnElement.innerHTML = `
        <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"></polyline></svg>
        Copied!
      `;
      btnElement.style.background = 'var(--success)';
      btnElement.style.borderColor = 'transparent';
      btnElement.style.color = '#ffffff';

      setTimeout(() => {
        btnElement.innerHTML = originalHTML;
        btnElement.style.background = '';
        btnElement.style.borderColor = '';
        btnElement.style.color = '';
      }, 1600);
    }).catch(err => {
      console.error('Failed to copy to clipboard:', err);
    });
  }

  escapeHtml(str) {
    if (!str) return '';
    return str.replace(/&/g, '&amp;')
              .replace(/</g, '&lt;')
              .replace(/>/g, '&gt;')
              .replace(/"/g, '&quot;')
              .replace(/'/g, '&#039;');
  }
}

// Instantiate upon script load
document.addEventListener('DOMContentLoaded', () => {
  window.slugOptimizer = new SlugOptimizer();
});