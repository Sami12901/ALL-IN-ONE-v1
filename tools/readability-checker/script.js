// Readability Checker & Scoring Suite
// Client-side implementation of standard readability formulas & text analysis

document.addEventListener('DOMContentLoaded', () => {
  // DOM Elements
  const textInput = document.getElementById('text-input');
  const highlightView = document.getElementById('highlight-view');
  const tabBtnEdit = document.getElementById('tab-btn-edit');
  const tabBtnHighlight = document.getElementById('tab-btn-highlight');
  const hlLegend = document.getElementById('hl-legend');
  const chkHlComplex = document.getElementById('chk-hl-complex');
  const chkHlSentences = document.getElementById('chk-hl-sentences');
  
  // Quick Stat Pills
  const pillWords = document.getElementById('pill-words');
  const pillSentences = document.getElementById('pill-sentences');
  const pillChars = document.getElementById('pill-chars');
  const pillAsl = document.getElementById('pill-asl');

  // Hero Scores
  const scoreFre = document.getElementById('score-fre');
  const scoreFreGrade = document.getElementById('score-fre-grade');
  const scoreFreBadge = document.getElementById('score-fre-badge');
  const progressFreFill = document.getElementById('progress-fre-fill');
  const freGuidance = document.getElementById('fre-guidance');

  // Secondary Metric Cards
  const metricFkgl = document.getElementById('metric-fkgl');
  const metricFog = document.getElementById('metric-fog');
  const metricCl = document.getElementById('metric-cl');
  const metricAri = document.getElementById('metric-ari');

  // Reading Times & Audience
  const timeReading = document.getElementById('time-reading');
  const timeSpeaking = document.getElementById('time-speaking');
  const targetAudiencePill = document.getElementById('target-audience-pill');
  const recommendationText = document.getElementById('recommendation-text');

  // Detailed Table
  const statWords = document.getElementById('stat-words');
  const statSentences = document.getElementById('stat-sentences');
  const statSyllables = document.getElementById('stat-syllables');
  const statComplexWords = document.getElementById('stat-complex-words');
  const statAvgSentenceLen = document.getElementById('stat-avg-sentence-len');
  const statAvgSyllablesWord = document.getElementById('stat-avg-syllables-word');
  const statCharsNoSpace = document.getElementById('stat-chars-no-space');
  const statCharsSpaces = document.getElementById('stat-chars-spaces');

  // Action Buttons
  const btnPaste = document.getElementById('btn-paste');
  const btnCopy = document.getElementById('btn-copy');
  const btnExportTxt = document.getElementById('btn-export-txt');
  const btnClear = document.getElementById('btn-clear');
  const presetButtons = document.querySelectorAll('.preset-chip-btn[data-preset]');

  // Presets Dictionary
  const PRESETS = {
    marketing: `Welcome to SwiftFlow! Build high-converting sales funnels in minutes without touching a single line of code.

Our visual drag-and-drop designer gives you total creative control. Choose from dozens of modern, mobile-friendly templates. Connect your email provider, set up automated drip sequences, and track every visitor in real time.

Try it completely free today. No credit card required. Upgrade anytime as your audience grows!`,
    technical: `Modern microservice architectures rely on distributed asynchronous messaging protocols to achieve horizontal scalability and fault isolation. 

When service endpoints produce high volumes of event streams, backpressure mechanisms must throttle consumer ingestion rates to avoid out-of-memory container terminations. By deploying distributed partition queues like Apache Kafka, systems maintain high durability guarantees across multi-zone container clusters while minimizing latency overhead.`,
    story: `The little red fox hopped over the old fallen log. The bright morning sun warmed the green moss on the forest floor.

"Good morning, Blue Jay!" called the fox. The blue bird sang a sweet, happy song from high up in the oak tree. Together, they skipped along the winding brook to find wild sweet berries before noon.`,
    academic: `The pharmacological efficacy of selective serotonin reuptake inhibitors in modulating neuropsychiatric symptom complexes remains contingent upon multi-allelic genetic polymorphisms within the promoter sequence of the SLC6A4 transporter gene. Longitudinal neuroimaging paradigms indicate that structural neuroplasticity within the anterior cingulate cortex correlates directly with chronic administration regimens.`
  };

  /**
   * Accurate syllable counter based on linguistic heuristics
   */
  function countSyllablesInWord(rawWord) {
    let word = rawWord.toLowerCase().replace(/[^a-z]/g, '');
    if (!word) return 0;
    if (word.length <= 3) return 1;

    // Remove common silent endings
    word = word.replace(/(?:[^laeiouy]|ed|es|e)$/, '');
    word = word.replace(/^y/, '');

    const vowelMatches = word.match(/[aeiouy]{1,2}/g);
    return vowelMatches ? Math.max(1, vowelMatches.length) : 1;
  }

  /**
   * Split raw text into sentences while respecting abbreviations
   */
  function tokenizeSentences(text) {
    if (!text || !text.trim()) return [];
    // Protect common abbreviations before splitting
    let sanitized = text
      .replace(/\b(Mr|Mrs|Ms|Dr|Prof|Sr|Jr|vs|etc|e\.g|i\.e|Jan|Feb|Mar|Apr|Aug|Sept|Oct|Nov|Dec)\./gi, '$1{{DOT}}')
      .replace(/(\d+)\.(\d+)/g, '$1{{DECIMAL}}$2');

    // Split on sentence-ending punctuation followed by whitespace or end of string
    const rawMatches = sanitized.split(/(?<=[.?!])\s+/);
    
    return rawMatches
      .map(s => s.replace(/\{\{DOT\}\}/g, '.').replace(/\{\{DECIMAL\}\}/g, '.').trim())
      .filter(s => s.length > 0 && /\w+/.test(s));
  }

  /**
   * Split text into words (alphanumeric tokens)
   */
  function tokenizeWords(text) {
    if (!text || !text.trim()) return [];
    const tokens = text.match(/\b[A-Za-z0-9'-]+\b/g);
    return tokens ? tokens.filter(t => /[A-Za-z]/.test(t)) : [];
  }

  /**
   * Format duration in seconds to human readable "Xm Ys" or "Xs"
   */
  function formatDuration(seconds) {
    if (seconds < 60) return `${Math.round(seconds)}s`;
    const m = Math.floor(seconds / 60);
    const s = Math.round(seconds % 60);
    return `${m}m ${s}s`;
  }

  /**
   * Format Flesch Reading Ease score details
   */
  function getFreDetails(score) {
    if (score >= 90) {
      return {
        rating: 'Very Easy',
        grade: '5th Grade level',
        audience: 'Audience: Universal (Ages 10+)',
        badgeClass: 'badge-excellent',
        desc: 'Extremely easy to read. Conversational, clear English that anyone can grasp effortlessly.'
      };
    } else if (score >= 80) {
      return {
        rating: 'Easy',
        grade: '6th Grade level',
        audience: 'Audience: Conversational',
        badgeClass: 'badge-excellent',
        desc: 'Easy to read. Plain English, excellent for casual newsletters and onboarding guides.'
      };
    } else if (score >= 70) {
      return {
        rating: 'Fairly Easy',
        grade: '7th Grade level',
        audience: 'Audience: General Consumer',
        badgeClass: 'badge-good',
        desc: 'Fairly easy to read. Ideal benchmark for marketing campaigns and public web content.'
      };
    } else if (score >= 60) {
      return {
        rating: 'Standard',
        grade: '8th - 9th Grade level',
        audience: 'Audience: Standard Web Readers',
        badgeClass: 'badge-good',
        desc: 'Standard readability. Clear for an average 13–15 year old student or general blog reader.'
      };
    } else if (score >= 50) {
      return {
        rating: 'Fairly Difficult',
        grade: '10th - 12th Grade level',
        audience: 'Audience: High School / Professional',
        badgeClass: 'badge-moderate',
        desc: 'Fairly difficult. Well suited for business whitepapers and specialized documentation.'
      };
    } else if (score >= 30) {
      return {
        rating: 'Difficult',
        grade: 'College Undergraduate',
        audience: 'Audience: Technical / Academic',
        badgeClass: 'badge-difficult',
        desc: 'Difficult to read. Academic journals and complex technical documentation.'
      };
    } else {
      return {
        rating: 'Very Confusing',
        grade: 'Graduate / Scholarly',
        audience: 'Audience: Highly Specialized',
        badgeClass: 'badge-difficult',
        desc: 'Extremely complex prose with multi-clause sentences and dense polysyllabic vocabulary.'
      };
    }
  }

  /**
   * Main Readability calculation engine
   */
  function analyzeText() {
    const rawText = textInput.value;
    const words = tokenizeWords(rawText);
    const sentences = tokenizeSentences(rawText);

    const totalWords = words.length;
    const totalSentences = Math.max(1, sentences.length);
    const charsWithSpaces = rawText.length;
    const charsNoSpaces = rawText.replace(/\s/g, '').length;

    if (totalWords === 0) {
      // Reset UI to defaults
      pillWords.textContent = '0';
      pillSentences.textContent = '0';
      pillChars.textContent = '0';
      pillAsl.textContent = '0';

      scoreFre.textContent = '0.0';
      scoreFreGrade.textContent = 'Awaiting text input...';
      scoreFreBadge.textContent = 'Ready';
      scoreFreBadge.className = 'score-rating-badge badge-good';
      progressFreFill.style.width = '0%';
      freGuidance.textContent = 'Paste or type your content to assess clarity, educational grade level, and reader accessibility.';

      metricFkgl.textContent = '-';
      metricFog.textContent = '-';
      metricCl.textContent = '-';
      metricAri.textContent = '-';

      timeReading.textContent = '0s';
      timeSpeaking.textContent = '0s';
      targetAudiencePill.textContent = 'Audience: General';
      recommendationText.textContent = 'Target 60–70 Flesch Reading Ease for general consumer marketing emails and web articles.';

      statWords.textContent = '0';
      statSentences.textContent = '0';
      statSyllables.textContent = '0';
      statComplexWords.textContent = '0 (0.0%)';
      statAvgSentenceLen.textContent = '0.0 words';
      statAvgSyllablesWord.textContent = '0.0';
      statCharsNoSpace.textContent = '0';
      statCharsSpaces.textContent = '0';

      highlightView.innerHTML = '<span style="color: var(--text-tertiary); font-style: italic;">Enter text in the editor to see highlighted complexity analysis.</span>';
      return;
    }

    // Syllable metrics
    let totalSyllables = 0;
    let complexWordCount = 0;

    words.forEach(word => {
      const syl = countSyllablesInWord(word);
      totalSyllables += syl;
      if (syl >= 3) {
        complexWordCount++;
      }
    });

    const avgSentenceLength = totalWords / totalSentences;
    const avgSyllablesPerWord = totalSyllables / totalWords;
    const complexWordPct = (complexWordCount / totalWords) * 100;

    // 1. Flesch Reading Ease (Clamped 0 - 100 for gauge visualization)
    const rawFre = 206.835 - (1.015 * avgSentenceLength) - (84.6 * avgSyllablesPerWord);
    const freDisplay = Math.max(0, Math.min(100, rawFre)).toFixed(1);

    // 2. Flesch-Kincaid Grade Level
    const fkgl = (0.39 * avgSentenceLength) + (11.8 * avgSyllablesPerWord) - 15.59;
    const fkglDisplay = Math.max(1, fkgl).toFixed(1);

    // 3. Gunning Fog Index
    const fog = 0.4 * (avgSentenceLength + complexWordPct);
    const fogDisplay = Math.max(1, fog).toFixed(1);

    // 4. Coleman-Liau Index
    const L = (charsNoSpaces / totalWords) * 100; // Average number of letters per 100 words
    const S = (totalSentences / totalWords) * 100; // Average number of sentences per 100 words
    const cl = (0.0588 * L) - (0.296 * S) - 15.8;
    const clDisplay = Math.max(1, cl).toFixed(1);

    // 5. Automated Readability Index (ARI)
    const ari = (4.71 * (charsNoSpaces / totalWords)) + (0.5 * avgSentenceLength) - 21.43;
    const ariDisplay = Math.max(1, ari).toFixed(1);

    // Reading & Speaking times
    const readSeconds = (totalWords / 200) * 60;
    const speakSeconds = (totalWords / 130) * 60;

    // Update Quick Stat Pills
    pillWords.textContent = totalWords.toLocaleString();
    pillSentences.textContent = totalSentences.toLocaleString();
    pillChars.textContent = charsWithSpaces.toLocaleString();
    pillAsl.textContent = avgSentenceLength.toFixed(1);

    // Update Hero Score Banner
    scoreFre.textContent = freDisplay;
    const freDetails = getFreDetails(parseFloat(freDisplay));
    scoreFreGrade.textContent = `${freDetails.rating} (${freDetails.grade})`;
    scoreFreBadge.textContent = freDetails.rating;
    scoreFreBadge.className = `score-rating-badge ${freDetails.badgeClass}`;
    progressFreFill.style.width = `${Math.max(0, Math.min(100, parseFloat(freDisplay)))}%`;
    freGuidance.textContent = freDetails.desc;

    // Update Secondary Metrics
    metricFkgl.textContent = `Grade ${fkglDisplay}`;
    metricFog.textContent = `${fogDisplay} yrs`;
    metricCl.textContent = `Grade ${clDisplay}`;
    metricAri.textContent = `Grade ${ariDisplay}`;

    // Reading Time & Recommendation
    timeReading.textContent = formatDuration(readSeconds);
    timeSpeaking.textContent = formatDuration(speakSeconds);
    targetAudiencePill.textContent = freDetails.audience;

    if (rawFre >= 60 && rawFre <= 75) {
      recommendationText.textContent = 'Excellent readability balance! Ideal for commercial websites, marketing landing pages, and email campaigns.';
    } else if (rawFre > 75) {
      recommendationText.textContent = 'Very conversational and easy to read. Perfect for broad consumer audiences, kids, or quick transactional emails.';
    } else {
      recommendationText.textContent = 'Text is relatively dense. Consider shortening sentences over 20 words or replacing complex polysyllabic vocabulary.';
    }

    // Detailed Table
    statWords.textContent = totalWords.toLocaleString();
    statSentences.textContent = totalSentences.toLocaleString();
    statSyllables.textContent = totalSyllables.toLocaleString();
    statComplexWords.textContent = `${complexWordCount.toLocaleString()} (${complexWordPct.toFixed(1)}%)`;
    statAvgSentenceLen.textContent = `${avgSentenceLength.toFixed(1)} words`;
    statAvgSyllablesWord.textContent = avgSyllablesPerWord.toFixed(2);
    statCharsNoSpace.textContent = charsNoSpaces.toLocaleString();
    statCharsSpaces.textContent = charsWithSpaces.toLocaleString();

    // Render Highlights
    renderHighlightView(rawText, sentences);
  }

  /**
   * Highlight generator for complex words and long sentences
   */
  function renderHighlightView(rawText, sentences) {
    const highlightComplex = chkHlComplex ? chkHlComplex.checked : true;
    const highlightSentences = chkHlSentences ? chkHlSentences.checked : true;

    if (!rawText.trim()) {
      highlightView.innerHTML = '<span style="color: var(--text-tertiary); font-style: italic;">Enter text in the editor to see highlighted complexity analysis.</span>';
      return;
    }

    // Break text by sentences to process
    let htmlOutput = '';

    sentences.forEach((sentence) => {
      const sentenceWords = tokenizeWords(sentence);
      const isLong = sentenceWords.length > 22;

      let sentenceHtml = sentence;

      if (highlightComplex) {
        // Find and wrap complex words
        sentenceHtml = sentenceHtml.replace(/\b([A-Za-z0-9'-]+)\b/g, (match) => {
          if (/[A-Za-z]/.test(match) && countSyllablesInWord(match) >= 3) {
            return `<span class="hl-complex" title="${countSyllablesInWord(match)} syllables">${match}</span>`;
          }
          return match;
        });
      }

      if (isLong && highlightSentences) {
        htmlOutput += `<span class="hl-long-sentence" title="Long sentence (${sentenceWords.length} words)">${sentenceHtml}</span> `;
      } else {
        htmlOutput += `${sentenceHtml} `;
      }
    });

    highlightView.innerHTML = htmlOutput.trim();
  }

  // Real-time analysis on input
  textInput.addEventListener('input', analyzeText);

  // Toggle Checkboxes for highlighting
  if (chkHlComplex) chkHlComplex.addEventListener('change', analyzeText);
  if (chkHlSentences) chkHlSentences.addEventListener('change', analyzeText);

  // Switch Between Editor and Highlight Tabs
  tabBtnEdit.addEventListener('click', () => {
    tabBtnEdit.classList.add('active');
    tabBtnHighlight.classList.remove('active');
    textInput.style.display = 'block';
    highlightView.style.display = 'none';
    hlLegend.style.display = 'none';
  });

  tabBtnHighlight.addEventListener('click', () => {
    tabBtnHighlight.classList.add('active');
    tabBtnEdit.classList.remove('active');
    textInput.style.display = 'none';
    highlightView.style.display = 'block';
    hlLegend.style.display = 'flex';
    analyzeText();
  });

  // Presets Click Handler
  presetButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const presetKey = btn.dataset.preset;
      if (PRESETS[presetKey]) {
        textInput.value = PRESETS[presetKey];
        analyzeText();
      }
    });
  });

  // Action Buttons
  btnClear.addEventListener('click', () => {
    textInput.value = '';
    analyzeText();
    textInput.focus();
  });

  btnCopy.addEventListener('click', async () => {
    if (!textInput.value.trim()) return;
    try {
      await navigator.clipboard.writeText(textInput.value);
      const originalText = btnCopy.innerHTML;
      btnCopy.innerHTML = `<span style="color: var(--success);">&#10003; Copied!</span>`;
      setTimeout(() => { btnCopy.innerHTML = originalText; }, 2000);
    } catch {
      // Fallback
      textInput.select();
      document.execCommand('copy');
    }
  });

  btnPaste.addEventListener('click', async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text) {
        textInput.value = text;
        analyzeText();
      }
    } catch {
      textInput.focus();
    }
  });

  btnExportTxt.addEventListener('click', () => {
    const rawText = textInput.value;
    if (!rawText.trim()) {
      alert('Please enter or draft some text before exporting a report.');
      return;
    }

    const reportContent = `=====================================================
READABILITY & TEXT ANALYSIS REPORT
Generated by ALL-IN-ONE Readability Checker
Date: ${new Date().toLocaleString()}
=====================================================

1. EXECUTIVE SUMMARY
-----------------------------------------------------
Flesch Reading Ease:           ${scoreFre.textContent} / 100 (${scoreFreGrade.textContent})
Flesch-Kincaid Grade Level:    ${metricFkgl.textContent}
Gunning Fog Index:             ${metricFog.textContent}
Coleman-Liau Index:            ${metricCl.textContent}
Automated Readability (ARI):   ${metricAri.textContent}
Audience Suitability:          ${targetAudiencePill.textContent}

2. AUDIT & DELIVERY METRICS
-----------------------------------------------------
Silent Reading Time (200 WPM): ${timeReading.textContent}
Speaking Time (130 WPM):       ${timeSpeaking.textContent}
Total Words:                   ${statWords.textContent}
Total Sentences:               ${statSentences.textContent}
Total Syllables:               ${statSyllables.textContent}
Complex Words (3+ Syllables):  ${statComplexWords.textContent}
Average Sentence Length:       ${statAvgSentenceLen.textContent}
Average Syllables Per Word:    ${statAvgSyllablesWord.textContent}
Characters (no spaces):        ${statCharsNoSpace.textContent}
Characters (with spaces):      ${statCharsSpaces.textContent}

3. ANALYZED COPY
-----------------------------------------------------
${rawText}
=====================================================
`;

    const blob = new Blob([reportContent], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `readability-report-${Date.now()}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  });

  // Pre-load default marketing copy to make tool live immediately on first visit
  textInput.value = PRESETS.marketing;
  analyzeText();
});