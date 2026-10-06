// Grammar & Style Auditor
// Heuristic client-side grammar, punctuation, and writing style auditor

document.addEventListener('DOMContentLoaded', () => {
  const editor = document.getElementById('grammar-editor');
  const issuesList = document.getElementById('issues-list');
  const qualityScore = document.getElementById('quality-score');
  const qualityDesc = document.getElementById('quality-desc');
  const totalIssuesBadge = document.getElementById('total-issues-badge');
  const cleanStatus = document.getElementById('clean-status');

  // Pill counts
  const editorWords = document.getElementById('editor-words');
  const editorChars = document.getElementById('editor-chars');
  const editorSentences = document.getElementById('editor-sentences');

  // Filter chips
  const cntAll = document.getElementById('cnt-all');
  const cntConfused = document.getElementById('cnt-confused');
  const cntRepeated = document.getElementById('cnt-repeated');
  const cntWordiness = document.getElementById('cnt-wordiness');
  const cntPassive = document.getElementById('cnt-passive');
  const cntAdverb = document.getElementById('cnt-adverb');
  const cntPunctuation = document.getElementById('cnt-punctuation');
  const filterChips = document.querySelectorAll('.filter-chip');

  // Action Buttons
  const btnPaste = document.getElementById('btn-paste');
  const btnCopy = document.getElementById('btn-copy');
  const btnFixAll = document.getElementById('btn-fix-all');
  const btnClear = document.getElementById('btn-clear');
  const sampleButtons = document.querySelectorAll('.preset-chip[data-sample]');

  let currentCategory = 'all';
  let detectedIssues = [];

  // Sample texts
  const SAMPLES = {
    marketing: `Welcome to our platform . In order to boost sales, your going to need the right tools! There product line has been created by our engineering team to solve everyday pains. We are really excited to announce that that each and every customer has the ability to utilize our new feature set. Please take into consideration that sneak peaks are available today, accept for legacy accounts . Weather or not you decide today, don't loose this opportunity!`,
    email: `Hi John,

I hope your having a wonderful week. At this point in time, a large number of marketers are struggling with email deliverability. Prior to our last release, thousands of campaigns were blocked by spam filters. 

Due to the fact that our new tool is extremely fast, you can make a decision faster. If you want to see how this can effect your conversion rates, let me know if your free tomorrow for a brief call.

Best,
Alex`,
    blog: `First and foremost , writing clear web copy is essential. All of a sudden, readers loose interest when sentences are packed with excessive adverbs that are completely unnecessary. In spite of the fact that complex words sound sophisticated, they actually slow down the reading experience. A majority of high-converting landing pages utilize concise language in order to communicate value immediately.`
  };

  // Wordiness dictionary
  const WORDINESS_PATTERNS = [
    { pattern: /\bin order to\b/gi, suggestion: 'to', note: 'Use "to" for concise prose.' },
    { pattern: /\bat this point in time\b/gi, suggestion: 'now', note: 'Replace with "now" or "currently".' },
    { pattern: /\bdue to the fact that\b/gi, suggestion: 'because', note: 'Replace with "because".' },
    { pattern: /\bin the event that\b/gi, suggestion: 'if', note: 'Replace with "if".' },
    { pattern: /\bfor the purpose of\b/gi, suggestion: 'to', note: 'Replace with "to" or "for".' },
    { pattern: /\ba large number of\b/gi, suggestion: 'many', note: 'Replace with "many".' },
    { pattern: /\butilize\b/gi, suggestion: 'use', note: 'Replace with "use".' },
    { pattern: /\butilizes\b/gi, suggestion: 'uses', note: 'Replace with "uses".' },
    { pattern: /\butilized\b/gi, suggestion: 'used', note: 'Replace with "used".' },
    { pattern: /\bmake a decision\b/gi, suggestion: 'decide', note: 'Replace with active verb "decide".' },
    { pattern: /\bmakes a decision\b/gi, suggestion: 'decides', note: 'Replace with "decides".' },
    { pattern: /\bmade a decision\b/gi, suggestion: 'decided', note: 'Replace with "decided".' },
    { pattern: /\bin spite of the fact that\b/gi, suggestion: 'although', note: 'Replace with "although".' },
    { pattern: /\bhas the ability to\b/gi, suggestion: 'can', note: 'Replace with concise verb "can".' },
    { pattern: /\bhave the ability to\b/gi, suggestion: 'can', note: 'Replace with "can".' },
    { pattern: /\bwith the exception of\b/gi, suggestion: 'except', note: 'Replace with "except".' },
    { pattern: /\bprior to\b/gi, suggestion: 'before', note: 'Replace with "before".' },
    { pattern: /\bsubsequent to\b/gi, suggestion: 'after', note: 'Replace with "after".' },
    { pattern: /\btake into consideration\b/gi, suggestion: 'consider', note: 'Replace with "consider".' },
    { pattern: /\btakes into consideration\b/gi, suggestion: 'considers', note: 'Replace with "considers".' },
    { pattern: /\bat the present time\b/gi, suggestion: 'currently', note: 'Replace with "currently".' },
    { pattern: /\bin the near future\b/gi, suggestion: 'soon', note: 'Replace with "soon".' },
    { pattern: /\beach and every\b/gi, suggestion: 'every', note: 'Redundant pairing. Use "every".' },
    { pattern: /\bfirst and foremost\b/gi, suggestion: 'first', note: 'Cliché. Use "first".' },
    { pattern: /\ball of a sudden\b/gi, suggestion: 'suddenly', note: 'Replace with "suddenly".' },
    { pattern: /\ba majority of\b/gi, suggestion: 'most', note: 'Replace with "most".' },
    { pattern: /\bclose proximity\b/gi, suggestion: 'proximity', note: 'Redundant modifier. Use "proximity" or "near".' },
    { pattern: /\bend result\b/gi, suggestion: 'result', note: 'Redundant. An outcome is always at the end.' }
  ];

  // Confused Words patterns
  const CONFUSED_PATTERNS = [
    {
      regex: /\b(your)\s+(welcome|right|going|doing|invited|late|ready|getting|planning|looking|free)\b/gi,
      correct: 'you\'re',
      desc: 'Use contraction "you\'re" (you are), not possessive "your".'
    },
    {
      regex: /\b(you\'re)\s+(account|profile|website|team|company|email|password|domain|card|cart)\b/gi,
      correct: 'your',
      desc: 'Use possessive "your", not contraction "you\'re".'
    },
    {
      regex: /\b(there)\s+(product|products|account|team|users|clients|customers|brand|growth|revenue|sales)\b/gi,
      correct: 'their',
      desc: 'Use possessive "their", not adverb/locational "there".'
    },
    {
      regex: /\b(their)\s+(is|are|was|were|will|has|have|can|could|should|would)\b/gi,
      correct: 'there',
      desc: 'Use existential "there" (e.g. "there is/are"), not possessive "their".'
    },
    {
      regex: /\b(it\'s)\s+(price|value|speed|color|feature|features|design|launch|release|quality|size)\b/gi,
      correct: 'its',
      desc: 'Use possessive "its" (without apostrophe) for ownership.'
    },
    {
      regex: /\b(its)\s+(a|an|the|very|not|been|going|ready|important|obvious|clear)\b/gi,
      correct: 'it\'s',
      desc: 'Use contraction "it\'s" (it is), not possessive "its".'
    },
    {
      regex: /\b(sneak)\s+(peak)\b/gi,
      correct: 'sneak peek',
      desc: 'A preview is a "sneak peek", while a "peak" is a mountain summit.'
    },
    {
      regex: /\b(don\'t|cannot|can\'t|will|to)\s+(loose)\b/gi,
      correct: 'lose',
      desc: 'Use "lose" (misplace or fail to win), not "loose" (unfastened/baggy).'
    },
    {
      regex: /\b(more|less|better|worse|greater|faster|slower|rather)\s+(then)\b/gi,
      correct: 'than',
      desc: 'Use comparison conjunction "than", not time adverb "then".'
    },
    {
      regex: /\b(can|will|to|may)\s+(effect)\b/gi,
      correct: 'affect',
      desc: 'Use verb "affect" (to influence), not noun "effect" (the result).'
    },
    {
      regex: /\b(accept)\s+(for)\b/gi,
      correct: 'except for',
      desc: 'Use preposition "except" (exclusion), not verb "accept".'
    },
    {
      regex: /\b(weather)\s+(or\s+not)\b/gi,
      correct: 'whether or not',
      desc: 'Use conjunction "whether", not meteorological noun "weather".'
    }
  ];

  // Adverbs list
  const ADVERB_LIST = new Set([
    'really', 'very', 'extremely', 'totally', 'completely', 'absolutely',
    'definitely', 'basically', 'literally', 'actually', 'highly', 'simply',
    'virtually', 'fairly', 'pretty', 'truly', 'somewhat'
  ]);

  /**
   * Scan text and find all issues
   */
  function auditText() {
    const text = editor.value;
    detectedIssues = [];

    // Basic counts
    const words = text.match(/\b[A-Za-z0-9'-]+\b/g) || [];
    const chars = text.length;
    const sentences = (text.match(/[^.!?]+[.!?]+/g) || (text.trim() ? [text] : [])).length;

    editorWords.textContent = words.length.toLocaleString();
    editorChars.textContent = chars.toLocaleString();
    editorSentences.textContent = sentences.toLocaleString();

    if (!text.trim()) {
      qualityScore.textContent = '100';
      qualityDesc.textContent = 'Flawless readability & structure';
      totalIssuesBadge.textContent = '0 Issues Found';
      totalIssuesBadge.style.color = 'var(--text-secondary)';
      cleanStatus.style.display = 'none';
      renderIssues();
      updatePills();
      return;
    }

    // 1. Check Repeated Words (e.g. "the the", "in in")
    const repeatedRegex = /\b([A-Za-z]+)\s+\1\b/gi;
    let match;
    while ((match = repeatedRegex.exec(text)) !== null) {
      detectedIssues.push({
        id: `rep_${match.index}`,
        type: 'repeated',
        category: 'repeated',
        badge: 'Repeated Word',
        badgeClass: 'badge-repeated',
        matchedText: match[0],
        suggestion: match[1],
        index: match.index,
        length: match[0].length,
        desc: `Duplicate word "${match[1]}" found consecutively.`,
        safeToAutoFix: true
      });
    }

    // 2. Check Confused Words
    CONFUSED_PATTERNS.forEach(conf => {
      let confMatch;
      const re = new RegExp(conf.regex.source, 'gi');
      while ((confMatch = re.exec(text)) !== null) {
        const fullMatch = confMatch[0];
        let replacement = fullMatch;
        if (conf.correct === 'sneak peek') {
          replacement = 'sneak peek';
        } else if (conf.correct === 'whether or not') {
          replacement = 'whether or not';
        } else if (conf.correct === 'except for') {
          replacement = 'except for';
        } else if (confMatch[1]) {
          // Replace specific target capture group
          replacement = fullMatch.replace(new RegExp(`\\b${confMatch[1]}\\b`, 'i'), conf.correct);
        }
        
        detectedIssues.push({
          id: `conf_${confMatch.index}`,
          type: 'confused',
          category: 'confused',
          badge: 'Confused Word',
          badgeClass: 'badge-confused',
          matchedText: fullMatch,
          suggestion: replacement,
          index: confMatch.index,
          length: fullMatch.length,
          desc: conf.desc,
          safeToAutoFix: true
        });
      }
    });

    // 3. Check Wordiness
    WORDINESS_PATTERNS.forEach(rule => {
      let wordyMatch;
      const re = new RegExp(rule.pattern.source, 'gi');
      while ((wordyMatch = re.exec(text)) !== null) {
        detectedIssues.push({
          id: `wordy_${wordyMatch.index}`,
          type: 'wordiness',
          category: 'wordiness',
          badge: 'Wordy Phrase',
          badgeClass: 'badge-wordiness',
          matchedText: wordyMatch[0],
          suggestion: rule.suggestion,
          index: wordyMatch.index,
          length: wordyMatch[0].length,
          desc: rule.note,
          safeToAutoFix: true
        });
      }
    });

    // 4. Check Passive Voice
    const passiveRegex = /\b(am|is|are|was|were|be|been|being)\s+(?:(\w+ly)\s+)?([A-Za-z]+(?:ed|en|written|taken|seen|done|made|given|chosen|held|built|found|sent|told|paid))\b/gi;
    while ((match = passiveRegex.exec(text)) !== null) {
      const verb = match[3];
      detectedIssues.push({
        id: `passive_${match.index}`,
        type: 'passive',
        category: 'passive',
        badge: 'Passive Voice',
        badgeClass: 'badge-passive',
        matchedText: match[0],
        suggestion: verb,
        index: match.index,
        length: match[0].length,
        desc: `Passive construct "${match[0]}". Active verbs create direct, persuasive copy.`,
        safeToAutoFix: false
      });
    }

    // 5. Check Excessive Adverbs
    const adverbRegex = /\b([A-Za-z]+ly)\b/gi;
    while ((match = adverbRegex.exec(text)) !== null) {
      const adv = match[1].toLowerCase();
      if (ADVERB_LIST.has(adv)) {
        detectedIssues.push({
          id: `adv_${match.index}`,
          type: 'adverb',
          category: 'adverb',
          badge: 'Weak Adverb',
          badgeClass: 'badge-adverb',
          matchedText: match[0],
          suggestion: '', // remove
          index: match.index,
          length: match[0].length,
          desc: `Intensifier "${match[0]}" often weakens marketing copy. Consider omitting it.`,
          safeToAutoFix: true
        });
      }
    }

    // 6. Check Punctuation & Formatting
    // Space before punctuation: e.g. "word ." or "hello ,"
    const spacePunctRegex = /\s+([,.;:!?])/g;
    while ((match = spacePunctRegex.exec(text)) !== null) {
      detectedIssues.push({
        id: `punct_${match.index}`,
        type: 'punctuation',
        category: 'punctuation',
        badge: 'Spaced Punctuation',
        badgeClass: 'badge-punctuation',
        matchedText: match[0],
        suggestion: match[1],
        index: match.index,
        length: match[0].length,
        desc: `Unnecessary space before punctuation mark "${match[1]}".`,
        safeToAutoFix: true
      });
    }

    // Double punctuation (excluding ellipses ...)
    const doublePunctRegex = /([!?]){2,}|([,;:]){2,}/g;
    while ((match = doublePunctRegex.exec(text)) !== null) {
      detectedIssues.push({
        id: `punct2_${match.index}`,
        type: 'punctuation',
        category: 'punctuation',
        badge: 'Multiple Punctuation',
        badgeClass: 'badge-punctuation',
        matchedText: match[0],
        suggestion: match[0][0],
        index: match.index,
        length: match[0].length,
        desc: `Consecutive punctuation "${match[0]}". Use a single mark.`,
        safeToAutoFix: true
      });
    }

    // Sort issues by index ascending
    detectedIssues.sort((a, b) => a.index - b.index);

    // Compute Quality Score
    const totalCount = detectedIssues.length;
    const wordPenalty = words.length > 0 ? (totalCount / words.length) * 120 : 0;
    const score = Math.max(20, Math.min(100, Math.round(100 - wordPenalty)));

    qualityScore.textContent = score;
    totalIssuesBadge.textContent = `${totalCount} Issue${totalCount === 1 ? '' : 's'} Found`;

    if (totalCount === 0) {
      qualityDesc.textContent = 'Excellent! Clean, professional, and concise draft.';
      cleanStatus.style.display = 'inline-block';
      totalIssuesBadge.style.color = 'var(--success)';
    } else if (score >= 85) {
      qualityDesc.textContent = 'Minor polish opportunities detected.';
      cleanStatus.style.display = 'none';
      totalIssuesBadge.style.color = 'var(--accent)';
    } else if (score >= 65) {
      qualityDesc.textContent = 'Several stylistic redundancies and confused phrases detected.';
      cleanStatus.style.display = 'none';
      totalIssuesBadge.style.color = '#fbbf24';
    } else {
      qualityDesc.textContent = 'Needs revision. Multiple clarity and grammar issues flagged.';
      cleanStatus.style.display = 'none';
      totalIssuesBadge.style.color = 'var(--error)';
    }

    updatePills();
    renderIssues();
  }

  /**
   * Update category count pill badges
   */
  function updatePills() {
    const counts = {
      all: detectedIssues.length,
      confused: 0,
      repeated: 0,
      wordiness: 0,
      passive: 0,
      adverb: 0,
      punctuation: 0
    };

    detectedIssues.forEach(issue => {
      if (counts[issue.category] !== undefined) {
        counts[issue.category]++;
      }
    });

    cntAll.textContent = counts.all;
    cntConfused.textContent = counts.confused;
    cntRepeated.textContent = counts.repeated;
    cntWordiness.textContent = counts.wordiness;
    cntPassive.textContent = counts.passive;
    cntAdverb.textContent = counts.adverb;
    cntPunctuation.textContent = counts.punctuation;
  }

  /**
   * Render issue cards in right column
   */
  function renderIssues() {
    const filtered = currentCategory === 'all'
      ? detectedIssues
      : detectedIssues.filter(i => i.category === currentCategory);

    if (filtered.length === 0) {
      issuesList.innerHTML = `
        <div class="empty-state-card">
          <svg viewBox="0 0 24 24" width="48" height="48" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="color: var(--success);">
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
            <polyline points="22 4 12 14.01 9 11.01"></polyline>
          </svg>
          <div style="font-weight: 700; color: var(--text-primary); font-size: 1.05rem;">No Issues Found</div>
          <div style="font-size: 0.85rem; max-width: 320px;">
            ${editor.value.trim() ? 'Your text passed this category filter flawlessly.' : 'Paste or type text in the editor to inspect grammar and style.'}
          </div>
        </div>
      `;
      return;
    }

    issuesList.innerHTML = '';

    filtered.forEach((issue) => {
      const card = document.createElement('div');
      card.className = 'issue-card';

      let actionButtonHtml = '';
      if (issue.type === 'passive') {
        actionButtonHtml = `<span style="font-size: 0.775rem; color: var(--text-tertiary); font-style: italic;">Rewrite with active subject</span>`;
      } else if (issue.type === 'adverb') {
        actionButtonHtml = `<button class="suggestion-btn" data-fix-id="${issue.id}" data-action="remove">&times; Remove "${issue.matchedText}"</button>`;
      } else {
        actionButtonHtml = `<button class="suggestion-btn" data-fix-id="${issue.id}">
          <span style="font-size: 0.9em;">&rarr;</span> Replace with <strong>"${issue.suggestion}"</strong>
        </button>`;
      }

      card.innerHTML = `
        <div class="issue-header">
          <span class="issue-type-badge ${issue.badgeClass}">${issue.badge}</span>
        </div>
        <div class="issue-context">
          <span class="issue-highlight-match">${escapeHtml(issue.matchedText)}</span>: ${escapeHtml(issue.desc)}
        </div>
        <div>
          ${actionButtonHtml}
        </div>
      `;

      issuesList.appendChild(card);
    });

    // Attach click-to-fix handlers
    issuesList.querySelectorAll('.suggestion-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const fixId = btn.dataset.fixId;
        applyFix(fixId);
      });
    });
  }

  /**
   * Apply one-click fix to text editor
   */
  function applyFix(fixId) {
    const issue = detectedIssues.find(i => i.id === fixId);
    if (!issue) return;

    const currentText = editor.value;
    // Check if matched text exists at index
    if (currentText.substring(issue.index, issue.index + issue.length).toLowerCase() === issue.matchedText.toLowerCase()) {
      const before = currentText.substring(0, issue.index);
      const after = currentText.substring(issue.index + issue.length);
      const replacement = issue.suggestion || '';
      
      // If removing adverb, cleanup adjacent double spaces
      let updated = before + replacement + after;
      if (issue.type === 'adverb') {
        updated = updated.replace(/[ ]{2,}/g, ' ');
      }

      editor.value = updated;
      auditText();
    } else {
      // Fallback: replace first occurrence
      editor.value = currentText.replace(issue.matchedText, issue.suggestion || '');
      auditText();
    }
  }

  /**
   * Auto-fix all safe issues in one operation
   */
  function fixAllSafe() {
    let text = editor.value;
    if (!text.trim()) return;

    // Apply safe fixes in reverse order of index to preserve indices
    const safeIssues = [...detectedIssues]
      .filter(i => i.safeToAutoFix)
      .sort((a, b) => b.index - a.index);

    if (safeIssues.length === 0) {
      alert('No automatic safe fixes available for current issues.');
      return;
    }

    safeIssues.forEach(issue => {
      const matchSub = text.substring(issue.index, issue.index + issue.length);
      if (matchSub.toLowerCase() === issue.matchedText.toLowerCase()) {
        const before = text.substring(0, issue.index);
        const after = text.substring(issue.index + issue.length);
        text = before + (issue.suggestion || '') + after;
      }
    });

    // Clean up residual double spaces
    text = text.replace(/[ ]{2,}/g, ' ');

    editor.value = text;
    auditText();
  }

  function escapeHtml(str) {
    return (str || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
  }

  // Filter chips click handling
  filterChips.forEach(chip => {
    chip.addEventListener('click', () => {
      filterChips.forEach(c => c.classList.remove('active'));
      chip.classList.add('active');
      currentCategory = chip.dataset.category;
      renderIssues();
    });
  });

  // Editor Input Listener
  editor.addEventListener('input', auditText);

  // Fix All Button
  btnFixAll.addEventListener('click', fixAllSafe);

  // Clear Button
  btnClear.addEventListener('click', () => {
    editor.value = '';
    auditText();
    editor.focus();
  });

  // Copy Clean Text
  btnCopy.addEventListener('click', async () => {
    if (!editor.value.trim()) return;
    try {
      await navigator.clipboard.writeText(editor.value);
      const orig = btnCopy.innerHTML;
      btnCopy.innerHTML = `<span style="color: #ffffff;">&#10003; Copied!</span>`;
      setTimeout(() => { btnCopy.innerHTML = orig; }, 2000);
    } catch {
      editor.select();
      document.execCommand('copy');
    }
  });

  // Paste Button
  btnPaste.addEventListener('click', async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text) {
        editor.value = text;
        auditText();
      }
    } catch {
      editor.focus();
    }
  });

  // Sample buttons
  sampleButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const sampleKey = btn.dataset.sample;
      if (SAMPLES[sampleKey]) {
        editor.value = SAMPLES[sampleKey];
        auditText();
      }
    });
  });

  // Initialize with marketing sample
  editor.value = SAMPLES.marketing;
  auditText();
});