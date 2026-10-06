// Content Headline Analyzer & SEO Auditor Engine
document.addEventListener('DOMContentLoaded', () => {
  // --- DOM Elements ---
  const headlineInput = document.getElementById('headline-input');
  const btnClearHeadline = document.getElementById('btn-clear-headline');
  const charCounterText = document.getElementById('char-counter-text');
  const presetChips = document.querySelectorAll('.preset-chip');

  // Gauge & Master Score
  const gaugeCircleElem = document.getElementById('gauge-circle-elem');
  const headlineScoreVal = document.getElementById('headline-score-val');
  const scoreQualityLabel = document.getElementById('score-quality-label');
  const scoreQualityDesc = document.getElementById('score-quality-desc');

  // Key Metric Deck
  const valWordCount = document.getElementById('val-word-count');
  const badgeWordCount = document.getElementById('badge-word-count');
  const valCharCount = document.getElementById('val-char-count');
  const badgeCharCount = document.getElementById('badge-char-count');
  const valReadingGrade = document.getElementById('val-reading-grade');
  const badgeReadingGrade = document.getElementById('badge-reading-grade');
  const valHeadlineType = document.getElementById('val-headline-type');
  const valSentimentLabel = document.getElementById('val-sentiment-label');
  const valSentimentScore = document.getElementById('val-sentiment-score');
  const valSeoStatus = document.getElementById('val-seo-status');
  const badgeSeoStatus = document.getElementById('badge-seo-status');

  // Lexical Elements
  const powerWordsCount = document.getElementById('power-words-count');
  const powerWordsList = document.getElementById('power-words-list');
  const emotionalWordsCount = document.getElementById('emotional-words-count');
  const emotionalWordsList = document.getElementById('emotional-words-list');
  const statCommonPct = document.getElementById('stat-common-pct');
  const statUncommonPct = document.getElementById('stat-uncommon-pct');
  const statImpactPct = document.getElementById('stat-impact-pct');

  // Preview & Suggestions
  const serpPreviewTitle = document.getElementById('serp-preview-title');
  const socialPreviewHeadline = document.getElementById('social-preview-headline');
  const suggestionsContainer = document.getElementById('suggestions-container');

  // --- Lexicons & Dictionaries ---
  const POWER_WORDS = new Set([
    'proven', 'secrets', 'secret', 'slash', 'slashing', 'drastic', 'drastically', 'exclusive',
    'ultimate', 'master', 'guaranteed', 'foolproof', 'hack', 'hacks', 'instant', 'instantly',
    'magic', 'revolutionary', 'breakthrough', 'massive', 'epic', 'insane', 'effortless',
    'effortlessly', 'hidden', 'elite', 'premier', 'unstoppable', 'genius', 'powerhouse',
    'astonishing', 'authentic', 'supreme', 'unbeatable', 'unlimited', 'extraordinary',
    'explosive', 'miracle', 'superior', 'vital', 'essential', 'crucial', 'definitive',
    'dominate', 'mastery', 'skyrocket', 'supercharge', 'turbocharge', 'unleash', 'untold',
    'unstoppable', 'wealth', 'million', 'billion', 'lucrative', 'profitable', 'jackpot',
    'free', 'discount', 'bargain', 'cheap', 'lowest', 'save', 'savings', 'cash', 'bonus'
  ]);

  const EMOTIONAL_WORDS = new Set([
    'fear', 'danger', 'dangerous', 'delight', 'heartbreaking', 'inspiring', 'love', 'shocking',
    'urgent', 'urgently', 'breathtaking', 'worry', 'worried', 'joy', 'miraculous', 'devastating',
    'stunning', 'terrifying', 'passionate', 'regret', 'forbidden', 'thrilled', 'scandalous',
    'tragic', 'priceless', 'courageous', 'panic', 'deadly', 'toxic', 'bliss', 'ecstatic',
    'furious', 'grief', 'embarrassing', 'mistake', 'mistakes', 'costly', 'ruin', 'nightmare',
    'disaster', 'fail', 'failure', 'warning', 'trap', 'traps', 'threat', 'beware', 'shame'
  ]);

  const POSITIVE_WORDS = new Set([
    'proven', 'best', 'great', 'love', 'amazing', 'master', 'top', 'win', 'winning', 'success',
    'successful', 'perfect', 'brilliant', 'delight', 'incredible', 'effortless', 'profit',
    'profitable', 'discount', 'cheap', 'save', 'saving', 'rich', 'wealth', 'inspire', 'inspiring',
    'breathtaking', 'stunning', 'joy', 'bliss', 'miracle', 'smart', 'supercharge', 'skyrocket'
  ]);

  const NEGATIVE_WORDS = new Set([
    'mistake', 'mistakes', 'avoid', 'disaster', 'fail', 'failure', 'costly', 'danger', 'dangerous',
    'shock', 'shocking', 'ruin', 'nightmare', 'bad', 'terrible', 'loss', 'panic', 'trap', 'threat',
    'risk', 'toxic', 'deadly', 'tragic', 'regret', 'warning', 'beware', 'furious', 'grief'
  ]);

  const COMMON_STOP_WORDS = new Set([
    'a', 'an', 'and', 'are', 'as', 'at', 'be', 'by', 'for', 'from', 'has', 'he', 'in', 'is', 'it',
    'its', 'of', 'on', 'that', 'the', 'to', 'was', 'were', 'will', 'with', 'you', 'your', 'this',
    'these', 'those', 'or', 'if', 'but', 'not', 'have', 'had', 'we', 'our', 'my', 'me', 'up', 'out'
  ]);

  // Syllable Counter Approximation
  function countSyllables(word) {
    const cleaned = word.toLowerCase().replace(/[^a-z]/g, '');
    if (!cleaned) return 0;
    if (cleaned.length <= 3) return 1;
    const syl = cleaned.replace(/(?:[^laeiouy]|ed|es|e)$/, '')
                       .replace(/^y/, '')
                       .match(/[aeiouy]{1,2}/g);
    return syl ? Math.max(1, syl.length) : 1;
  }

  // Reading Grade Level (Flesch-Kincaid & Coleman-Liau hybrid)
  function calculateReadingGrade(words, charCount) {
    if (words.length === 0) return 6;
    let totalSyllables = 0;
    words.forEach(w => totalSyllables += countSyllables(w));

    const sentences = 1; // Headline is single unit
    const wordsPerSent = words.length / sentences;
    const sylPerWord = totalSyllables / words.length;

    // Flesch-Kincaid Grade Level: 0.39 * (words/sentences) + 11.8 * (syllables/words) - 15.59
    let grade = 0.39 * wordsPerSent + 11.8 * sylPerWord - 15.59;
    grade = Math.round(Math.max(1, Math.min(16, grade)));
    return grade;
  }

  // Detect Headline Type
  function detectHeadlineType(rawText) {
    const text = rawText.trim();
    if (!text) return 'Standard';

    // Listicle: Contains digits or number words
    if (/\b(\d+|ten|seven|five|three|nine|top\s*\d+)\b/i.test(text)) {
      return 'Listicle';
    }

    // How-To
    if (/^how to\b|\bhow you can\b/i.test(text)) {
      return 'How-To';
    }

    // Question
    if (text.endsWith('?') || /^(why|what|when|where|which|who|whom|whose|are|is|can|do|does|did|will|should|could|would)\b/i.test(text)) {
      return 'Question';
    }

    // Guide / Framework
    if (/\b(guide|ultimate guide|handbook|blueprint|tutorial|checklist|step-by-step|cheatsheet)\b/i.test(text)) {
      return 'Guide';
    }

    return 'Standard';
  }

  // --- Main Analyzer Function ---
  function analyzeHeadline() {
    const raw = (headlineInput.value || '').trim();
    const cleanTokens = raw.toLowerCase().replace(/[^\w\s-]/g, '').split(/\s+/).filter(Boolean);
    const wordCount = cleanTokens.length;
    const charCount = raw.length;

    // Counter Badge
    if (charCounterText) {
      charCounterText.textContent = `${charCount} chars | ${wordCount} words`;
    }

    if (wordCount === 0) {
      renderEmptyState();
      return;
    }

    // Detect words
    const detectedPower = [];
    const detectedEmotional = [];
    let positiveCount = 0;
    let negativeCount = 0;
    let commonCount = 0;

    cleanTokens.forEach(word => {
      if (POWER_WORDS.has(word)) detectedPower.push(word);
      if (EMOTIONAL_WORDS.has(word)) detectedEmotional.push(word);
      if (POSITIVE_WORDS.has(word)) positiveCount++;
      if (NEGATIVE_WORDS.has(word)) negativeCount++;
      if (COMMON_STOP_WORDS.has(word)) commonCount++;
    });

    // Unique detected
    const uniquePower = [...new Set(detectedPower)];
    const uniqueEmotional = [...new Set(detectedEmotional)];

    // Sentiment Calculation (-1.0 to +1.0)
    let sentimentScore = 0;
    let sentimentLabel = 'Neutral';
    if (positiveCount > negativeCount) {
      sentimentScore = Math.min(1.0, 0.35 + (positiveCount - negativeCount) * 0.25);
      sentimentLabel = 'Positive';
    } else if (negativeCount > positiveCount) {
      sentimentScore = Math.max(-1.0, -0.35 - (negativeCount - positiveCount) * 0.25);
      sentimentLabel = 'Negative (Fear/Urgency)';
    }

    // Headline Type
    const headlineType = detectHeadlineType(raw);

    // Reading Grade
    const gradeLevel = calculateReadingGrade(cleanTokens, charCount);

    // Common / Uncommon / Impact words ratio
    const impactWordsCount = uniquePower.length + uniqueEmotional.length;
    const uncommonCount = Math.max(0, wordCount - commonCount - impactWordsCount);
    const commonPct = Math.round((commonCount / wordCount) * 100);
    const uncommonPct = Math.round((uncommonCount / wordCount) * 100);
    const impactPct = Math.round((impactWordsCount / wordCount) * 100);

    // --- Scoring Algorithm (0 - 100) ---
    let score = 0;

    // 1. Length Score (up to 25 points)
    // Optimal words: 6 - 9 (25 pts), 5 or 10-11 (18 pts), 3-4 or 12-14 (10 pts), else 5 pts
    if (wordCount >= 6 && wordCount <= 9) score += 15;
    else if (wordCount === 5 || wordCount === 10 || wordCount === 11) score += 10;
    else score += 5;

    // Optimal chars: 50 - 65 (10 pts), 40 - 49 or 66 - 70 (7 pts), else 3 pts
    if (charCount >= 50 && charCount <= 65) score += 10;
    else if ((charCount >= 40 && charCount < 50) || (charCount > 65 && charCount <= 72)) score += 7;
    else score += 3;

    // 2. Power Words (up to 20 points)
    if (uniquePower.length >= 2) score += 20;
    else if (uniquePower.length === 1) score += 14;
    else score += 0;

    // 3. Emotional Words (up to 20 points)
    if (uniqueEmotional.length >= 2) score += 20;
    else if (uniqueEmotional.length === 1) score += 14;
    else score += 0;

    // 4. Reading Grade Accessibility (up to 15 points)
    // Grade 6 - 9 is perfect for viral engagement
    if (gradeLevel >= 6 && gradeLevel <= 9) score += 15;
    else if (gradeLevel >= 4 && gradeLevel <= 11) score += 10;
    else score += 5;

    // 5. Headline Type Bonus (up to 10 points)
    if (headlineType === 'Listicle') score += 10;
    else if (headlineType === 'How-To') score += 9;
    else if (headlineType === 'Question') score += 8;
    else if (headlineType === 'Guide') score += 8;
    else score += 4;

    // 6. Sentiment Balance (up to 10 points)
    if (sentimentLabel !== 'Neutral') score += 10;
    else score += 3;

    score = Math.min(100, Math.max(15, score));

    // --- Update Gauge & Master Score ---
    if (headlineScoreVal) headlineScoreVal.textContent = score;

    let color = 'var(--accent)';
    let qualityTitle = 'Good Headline';
    let qualityDesc = 'Strong baseline with good engagement potential.';

    if (score >= 85) {
      color = '#10b981';
      qualityTitle = 'Exceptional Headline';
      qualityDesc = 'High viral potential, magnetic power triggers, and ideal readability.';
    } else if (score >= 70) {
      color = '#4e85bf';
      qualityTitle = 'Strong & Compelling';
      qualityDesc = 'Solid structure that satisfies search engine algorithms and audience curiosity.';
    } else if (score >= 50) {
      color = '#f59e0b';
      qualityTitle = 'Average Headline';
      qualityDesc = 'Understandable, but needs more emotional hook or power words to stand out.';
    } else {
      color = '#ef4444';
      qualityTitle = 'Weak / Flat Headline';
      qualityDesc = 'Lacks urgency, power vocabulary, or optimal length. Needs significant polish.';
    }

    if (gaugeCircleElem) {
      const degrees = (score / 100) * 360;
      gaugeCircleElem.style.background = `conic-gradient(${color} ${degrees}deg, var(--bg-secondary) ${degrees}deg)`;
      gaugeCircleElem.style.boxShadow = `0 4px 16px ${color}33`;
    }

    if (scoreQualityLabel) scoreQualityLabel.textContent = qualityTitle;
    if (scoreQualityDesc) scoreQualityDesc.textContent = qualityDesc;

    // --- Key Metric Deck Displays ---
    if (valWordCount) valWordCount.textContent = wordCount;
    if (badgeWordCount) {
      if (wordCount >= 6 && wordCount <= 9) {
        badgeWordCount.textContent = 'Optimal (6-9)';
        badgeWordCount.style.color = 'var(--success)';
      } else if (wordCount < 6) {
        badgeWordCount.textContent = 'Too Short (<6)';
        badgeWordCount.style.color = 'var(--warning)';
      } else {
        badgeWordCount.textContent = 'Too Wordy (>9)';
        badgeWordCount.style.color = 'var(--warning)';
      }
    }

    if (valCharCount) valCharCount.textContent = charCount;
    if (badgeCharCount) {
      if (charCount >= 50 && charCount <= 65) {
        badgeCharCount.textContent = 'Perfect (50-65)';
        badgeCharCount.style.color = 'var(--success)';
      } else if (charCount < 50) {
        badgeCharCount.textContent = 'Short (<50)';
        badgeCharCount.style.color = 'var(--text-tertiary)';
      } else {
        badgeCharCount.textContent = 'Long (>65)';
        badgeCharCount.style.color = 'var(--warning)';
      }
    }

    if (valReadingGrade) valReadingGrade.textContent = `Grade ${gradeLevel}`;
    if (badgeReadingGrade) {
      badgeReadingGrade.textContent = gradeLevel <= 9 ? 'Highly Accessible' : 'Advanced Lexicon';
      badgeReadingGrade.style.color = gradeLevel <= 9 ? 'var(--success)' : 'var(--text-secondary)';
    }

    if (valHeadlineType) valHeadlineType.textContent = headlineType;

    if (valSentimentLabel) valSentimentLabel.textContent = sentimentLabel.split(' ')[0];
    if (valSentimentScore) {
      valSentimentScore.textContent = `${sentimentScore >= 0 ? '+' : ''}${sentimentScore.toFixed(2)}`;
      valSentimentScore.style.color = sentimentScore !== 0 ? 'var(--success)' : 'var(--text-tertiary)';
    }

    if (valSeoStatus) {
      valSeoStatus.textContent = charCount <= 60 ? 'Fits SERP' : 'Truncated';
    }
    if (badgeSeoStatus) {
      badgeSeoStatus.textContent = charCount <= 60 ? 'Full visibility' : 'Google may clip ...';
      badgeSeoStatus.style.color = charCount <= 60 ? 'var(--success)' : 'var(--warning)';
    }

    // --- Lexical Chips Render ---
    renderWordChips(powerWordsList, uniquePower, 'power', 'No power words detected');
    if (powerWordsCount) powerWordsCount.textContent = uniquePower.length;

    renderWordChips(emotionalWordsList, uniqueEmotional, 'emotional', 'No emotional triggers detected');
    if (emotionalWordsCount) emotionalWordsCount.textContent = uniqueEmotional.length;

    if (statCommonPct) statCommonPct.textContent = `${commonPct}%`;
    if (statUncommonPct) statUncommonPct.textContent = `${uncommonPct}%`;
    if (statImpactPct) statImpactPct.textContent = `${impactPct}%`;

    // --- Previews ---
    if (serpPreviewTitle) {
      serpPreviewTitle.textContent = charCount > 60 ? raw.substring(0, 57) + '...' : raw;
    }
    if (socialPreviewHeadline) {
      socialPreviewHeadline.textContent = raw;
    }

    // --- Suggestions Engine ---
    renderSuggestions({
      wordCount,
      charCount,
      gradeLevel,
      uniquePower,
      uniqueEmotional,
      headlineType,
      sentimentLabel
    });
  }

  // --- Helper to Render Word Chips ---
  function renderWordChips(container, words, typeClass, emptyMsg) {
    if (!container) return;
    if (words.length === 0) {
      container.innerHTML = `<span style="font-size: 0.8rem; color: var(--text-tertiary);">${emptyMsg}</span>`;
      return;
    }
    container.innerHTML = words.map(w => `
      <span class="word-chip ${typeClass}">
        ${w}
      </span>
    `).join('');
  }

  // --- Actionable Suggestions Builder ---
  function renderSuggestions(data) {
    if (!suggestionsContainer) return;
    const list = [];

    // Length checks
    if (data.charCount >= 50 && data.charCount <= 65) {
      list.push({ passed: true, text: 'Character count is within the sweet spot (50 - 65 chars) for SEO snippet display.' });
    } else if (data.charCount > 65) {
      list.push({ passed: false, text: `Your headline is ${data.charCount} chars long. Google SERP typically truncates after 60 characters with ellipses.` });
    } else {
      list.push({ passed: false, text: `Headline is on the shorter side (${data.charCount} chars). Expanding to 50+ characters often improves context and click rates.` });
    }

    // Word count checks
    if (data.wordCount >= 6 && data.wordCount <= 9) {
      list.push({ passed: true, text: 'Word count (6 - 9 words) is optimal for human scanability and social engagement.' });
    } else if (data.wordCount < 6) {
      list.push({ passed: false, text: 'Consider adding 2-3 descriptive words to clearly articulate the value proposition.' });
    }

    // Power words
    if (data.uniquePower.length >= 1) {
      list.push({ passed: true, text: `Great inclusion of power vocabulary: "${data.uniquePower.join(', ')}".` });
    } else {
      list.push({ passed: false, text: 'Incorporate at least 1 power word (e.g. "Proven", "Exclusive", "Secret", "Effortless", "Massive") to boost click-throughs.' });
    }

    // Emotional triggers
    if (data.uniqueEmotional.length >= 1) {
      list.push({ passed: true, text: `Evokes emotional curiosity through triggers: "${data.uniqueEmotional.join(', ')}".` });
    } else {
      list.push({ passed: false, text: 'Introduce emotional words (e.g. "Shocking", "Fear", "Heartwarming", "Urgent", "Mistake") to provoke a visceral reaction.' });
    }

    // Headline Type / Number check
    if (data.headlineType === 'Listicle') {
      list.push({ passed: true, text: 'Listicle format detected! Headlines with numbers receive up to 36% higher social engagement.' });
    } else {
      list.push({ passed: false, text: 'Try testing a listicle variant with a specific number (e.g. "7 Ways...", "10 Tips...") for higher CTR.' });
    }

    // Readability
    if (data.gradeLevel <= 9) {
      list.push({ passed: true, text: `Reading grade level (Grade ${data.gradeLevel}) is accessible to 85%+ of web readers.` });
    }

    // Render HTML
    suggestionsContainer.innerHTML = list.map(item => `
      <div class="suggestion-item ${item.passed ? 'passed' : 'action'}">
        ${item.passed ? `
          <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="20 6 9 17 4 12"/>
          </svg>
        ` : `
          <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
          </svg>
        `}
        <span>${item.text}</span>
      </div>
    `).join('');
  }

  // Empty state renderer
  function renderEmptyState() {
    if (headlineScoreVal) headlineScoreVal.textContent = '0';
    if (gaugeCircleElem) {
      gaugeCircleElem.style.background = 'conic-gradient(var(--bg-secondary) 0deg, var(--bg-secondary) 360deg)';
    }
    if (scoreQualityLabel) scoreQualityLabel.textContent = 'Enter a Headline';
    if (scoreQualityDesc) scoreQualityDesc.textContent = 'Type or paste a title above to begin the audit.';
    if (powerWordsList) powerWordsList.innerHTML = '<span style="font-size: 0.8rem; color: var(--text-tertiary);">None detected</span>';
    if (emotionalWordsList) emotionalWordsList.innerHTML = '<span style="font-size: 0.8rem; color: var(--text-tertiary);">None detected</span>';
    if (suggestionsContainer) suggestionsContainer.innerHTML = '<div style="font-size: 0.825rem; color: var(--text-tertiary); padding: 0.5rem 0;">Awaiting headline text...</div>';
  }

  // Preset chips
  presetChips.forEach(chip => {
    chip.addEventListener('click', () => {
      if (chip.dataset.headline) {
        headlineInput.value = chip.dataset.headline;
        analyzeHeadline();
      }
    });
  });

  // Clear text button
  if (btnClearHeadline) {
    btnClearHeadline.addEventListener('click', () => {
      headlineInput.value = '';
      headlineInput.focus();
      analyzeHeadline();
    });
  }

  // Live input handler
  if (headlineInput) {
    headlineInput.addEventListener('input', analyzeHeadline);
    headlineInput.addEventListener('change', analyzeHeadline);
  }

  // Initial analysis
  analyzeHeadline();
});