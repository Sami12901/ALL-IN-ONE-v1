// Sentence Counter Logic

document.addEventListener('DOMContentLoaded', () => {
  const textInput = document.getElementById('text-input');
  const clearBtn = document.getElementById('clear-btn');
  const sampleBtn = document.getElementById('sample-btn');
  const copySummaryBtn = document.getElementById('copy-summary-btn');
  const sentenceSearch = document.getElementById('sentence-search');

  // Stats elements
  const statSentences = document.getElementById('stat-sentences');
  const statSentencesSub = document.getElementById('stat-sentences-sub');
  const statWords = document.getElementById('stat-words');
  const statCharsSub = document.getElementById('stat-chars-sub');
  const statAvgLength = document.getElementById('stat-avg-length');
  const statSyllables = document.getElementById('stat-syllables');
  const statAvgSyllables = document.getElementById('stat-avg-syllables');
  const statReadingEase = document.getElementById('stat-reading-ease');
  const statReadingLevel = document.getElementById('stat-reading-level');

  const charDetails = document.getElementById('char-details');
  const readDuration = document.getElementById('read-duration');

  const shortestStats = document.getElementById('shortest-stats');
  const shortestText = document.getElementById('shortest-text');
  const longestStats = document.getElementById('longest-stats');
  const longestText = document.getElementById('longest-text');

  const breakdownBody = document.getElementById('breakdown-body');
  const sentenceTableCount = document.getElementById('sentence-table-count');

  const SAMPLE_TEXT = `The quick brown fox jumps over the lazy dog. It was a bright cold day in April, and the clocks were striking thirteen! Do you enjoy analyzing texts, or do you prefer writing poetry? Dr. Watson and Mr. Holmes investigated the mysterious case with extraordinary diligence. Although it seemed perplexing at first, every single clue eventually fell into place, revealing an unexpected truth that astonished everyone present. Simple sentences provide clarity. Complex, multifaceted sentences with intricate subordinate clauses challenge the reader to contemplate deeper nuance. Are we ready to write better content today?`;

  let currentAnalysis = {
    sentences: [],
    totalWords: 0,
    totalChars: 0,
    totalCharsNoSpaces: 0,
    totalSyllables: 0,
    paragraphs: 0,
    fleschScore: 0,
    fleschLevel: ''
  };

  /**
   * Count syllables in a single word using heuristic approach
   */
  function countSyllables(word) {
    if (!word) return 0;
    const cleanWord = word.toLowerCase().replace(/[^a-z]/g, '');
    if (cleanWord.length === 0) return 0;
    if (cleanWord.length <= 3) return 1;

    // Discard trailing 'e', 'es', 'ed' if not preceded by certain vowels
    let processed = cleanWord.replace(/(?:[^laeiouy]|ed|es|e)$/, '');
    processed = processed.replace(/^y/, '');
    const matches = processed.match(/[aeiouy]{1,2}/g);
    return matches ? Math.max(1, matches.length) : 1;
  }

  /**
   * Extract words from text
   */
  function extractWords(text) {
    if (!text || !text.trim()) return [];
    const matches = text.match(/\b[A-Za-z0-9'-]+\b/g);
    return matches ? matches.filter(w => /[A-Za-z0-9]/.test(w)) : [];
  }

  /**
   * Split text into sentences safely while preserving abbreviations and decimals
   */
  function splitSentences(text) {
    if (!text || !text.trim()) return [];

    let processed = text;
    // Protect decimal numbers (e.g. 3.14 -> 3§14)
    processed = processed.replace(/(\d+)\.(\d+)/g, '$1\u00A7$2');

    // Protect common abbreviations
    const abbrevs = [
      'mr', 'mrs', 'ms', 'dr', 'prof', 'sr', 'jr', 'vs', 'etc',
      'eg', 'ie', 'no', 'vol', 'dept', 'approx', 'est', 'inc', 'corp', 'co'
    ];
    abbrevs.forEach(abbr => {
      const re = new RegExp(`\\b(${abbr})\\.`, 'gi');
      processed = processed.replace(re, '$1\u00A7');
    });

    // Handle abbreviations like U.S. or e.g. with multiple dots
    processed = processed.replace(/([A-Za-z])\.([A-Za-z])\./g, '$1\u00A7$2\u00A7');

    // Split on sentence-ending punctuation followed by whitespace or line breaks
    // Also handles multiple punctuations like "...", "?!", "!!!"
    const rawSegments = processed.split(/(?<=[.!?]+)(?:\s+|\n+|$)/);

    const result = [];
    rawSegments.forEach(seg => {
      // Restore protected period
      const restored = seg.replace(/\u00A7/g, '.').trim();
      if (restored.length > 0) {
        result.push(restored);
      }
    });

    return result;
  }

  /**
   * Determine Flesch Reading Ease score and level description
   */
  function calculateFlesch(wordsCount, sentencesCount, syllablesCount) {
    if (wordsCount === 0 || sentencesCount === 0) {
      return { score: 0, level: 'No text provided', color: 'var(--text-tertiary)' };
    }

    // Flesch Reading Ease Formula
    const score = 206.835 - 1.015 * (wordsCount / sentencesCount) - 84.6 * (syllablesCount / wordsCount);
    const roundedScore = Math.max(0, Math.min(100, Math.round(score * 10) / 10));

    let level = '';
    let color = '';

    if (roundedScore >= 90) {
      level = 'Very Easy (5th Grade)';
      color = '#10b981';
    } else if (roundedScore >= 80) {
      level = 'Easy (6th Grade)';
      color = '#10b981';
    } else if (roundedScore >= 70) {
      level = 'Fairly Easy (7th Grade)';
      color = '#3b82f6';
    } else if (roundedScore >= 60) {
      level = 'Standard / Plain English (8th-9th Grade)';
      color = '#4e85bf';
    } else if (roundedScore >= 50) {
      level = 'Fairly Difficult (10th-12th Grade)';
      color = '#f59e0b';
    } else if (roundedScore >= 30) {
      level = 'Difficult (College)';
      color = '#f97316';
    } else {
      level = 'Very Difficult (College Graduate)';
      color = '#ef4444';
    }

    return { score: roundedScore, level, color };
  }

  /**
   * Determine sentence pacing label based on word count
   */
  function getPacingBadge(wordCount) {
    if (wordCount <= 10) {
      return '<span class="badge badge-short">Short / Crisp</span>';
    } else if (wordCount <= 20) {
      return '<span class="badge badge-medium">Standard</span>';
    } else if (wordCount <= 30) {
      return '<span class="badge badge-long">Long</span>';
    } else {
      return '<span class="badge badge-very-long">Very Long / Complex</span>';
    }
  }

  /**
   * Escape HTML to prevent injection
   */
  function escapeHTML(str) {
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  /**
   * Perform comprehensive analysis
   */
  function analyzeText() {
    const rawText = textInput.value;
    const trimmed = rawText.trim();

    if (!trimmed) {
      // Reset UI to empty state
      statSentences.textContent = '0';
      statSentencesSub.textContent = '0 paragraphs';
      statWords.textContent = '0';
      statCharsSub.textContent = '0 characters';
      statAvgLength.textContent = '0.0';
      statSyllables.textContent = '0';
      statAvgSyllables.textContent = '0.0 / word';
      statReadingEase.textContent = '0';
      statReadingEase.style.color = 'var(--accent)';
      statReadingLevel.textContent = 'No text provided';

      charDetails.textContent = 'Characters: 0 | Without spaces: 0 | Paragraphs: 0';
      readDuration.textContent = 'Reading time: ~0m 0s';

      shortestStats.textContent = '0 words';
      shortestText.textContent = 'No sentence detected yet.';
      longestStats.textContent = '0 words';
      longestText.textContent = 'No sentence detected yet.';

      sentenceTableCount.textContent = '0 entries';
      breakdownBody.innerHTML = `
        <tr>
          <td colspan="6" style="text-align: center; padding: 2.5rem; color: var(--text-tertiary);">
            Type or paste text above to see sentence metrics.
          </td>
        </tr>`;

      currentAnalysis = {
        sentences: [],
        totalWords: 0,
        totalChars: 0,
        totalCharsNoSpaces: 0,
        totalSyllables: 0,
        paragraphs: 0,
        fleschScore: 0,
        fleschLevel: ''
      };
      return;
    }

    // Split text into paragraphs
    const paragraphs = rawText.split(/\n+/).filter(p => p.trim().length > 0);
    const paragraphCount = paragraphs.length;

    // Split sentences
    const rawSentences = splitSentences(rawText);

    let totalWordsCount = 0;
    let totalSyllablesCount = 0;
    const sentenceDataList = [];

    rawSentences.forEach((sentence, index) => {
      const words = extractWords(sentence);
      const wordCount = words.length;
      const charCount = sentence.length;
      let syllablesInSentence = 0;
      words.forEach(w => {
        syllablesInSentence += countSyllables(w);
      });

      totalWordsCount += wordCount;
      totalSyllablesCount += syllablesInSentence;

      sentenceDataList.push({
        index: index + 1,
        text: sentence,
        words: wordCount,
        chars: charCount,
        syllables: syllablesInSentence
      });
    });

    const sentenceCount = sentenceDataList.length;
    const totalChars = rawText.length;
    const totalCharsNoSpaces = rawText.replace(/\s/g, '').length;

    // Average sentence length
    const avgSentenceLength = sentenceCount > 0
      ? (totalWordsCount / sentenceCount).toFixed(1)
      : '0.0';

    // Average syllables per word
    const avgSyllablesPerWord = totalWordsCount > 0
      ? (totalSyllablesCount / totalWordsCount).toFixed(2)
      : '0.0';

    // Flesch Reading Ease
    const flesch = calculateFlesch(totalWordsCount, sentenceCount, totalSyllablesCount);

    // Shortest & Longest Sentences
    let shortest = null;
    let longest = null;

    if (sentenceDataList.length > 0) {
      // Find sentence with min words (>0 if possible)
      shortest = sentenceDataList.reduce((min, curr) => {
        if (!min) return curr;
        if (curr.words < min.words) return curr;
        if (curr.words === min.words && curr.chars < min.chars) return curr;
        return min;
      }, sentenceDataList[0]);

      longest = sentenceDataList.reduce((max, curr) => {
        if (!max) return curr;
        if (curr.words > max.words) return curr;
        if (curr.words === max.words && curr.chars > max.chars) return curr;
        return max;
      }, sentenceDataList[0]);
    }

    // Update Summary Stats DOM
    statSentences.textContent = sentenceCount.toLocaleString();
    statSentencesSub.textContent = `${paragraphCount} paragraph${paragraphCount === 1 ? '' : 's'}`;
    statWords.textContent = totalWordsCount.toLocaleString();
    statCharsSub.textContent = `${totalChars.toLocaleString()} characters`;
    statAvgLength.textContent = avgSentenceLength;
    statSyllables.textContent = totalSyllablesCount.toLocaleString();
    statAvgSyllables.textContent = `${avgSyllablesPerWord} / word`;
    statReadingEase.textContent = flesch.score.toString();
    statReadingEase.style.color = flesch.color;
    statReadingLevel.textContent = flesch.level;

    charDetails.textContent = `Characters: ${totalChars.toLocaleString()} | Without spaces: ${totalCharsNoSpaces.toLocaleString()} | Paragraphs: ${paragraphCount}`;

    // Reading time (average 225 words/min)
    const readingSeconds = Math.round((totalWordsCount / 225) * 60);
    const readMinutes = Math.floor(readingSeconds / 60);
    const readSecs = readingSeconds % 60;
    readDuration.textContent = `Reading time: ~${readMinutes}m ${readSecs}s`;

    // Shortest / Longest Update
    if (shortest) {
      shortestStats.textContent = `${shortest.words} word${shortest.words === 1 ? '' : 's'} (${shortest.chars} chars)`;
      shortestText.textContent = shortest.text;
    }
    if (longest) {
      longestStats.textContent = `${longest.words} word${longest.words === 1 ? '' : 's'} (${longest.chars} chars)`;
      longestText.textContent = longest.text;
    }

    currentAnalysis = {
      sentences: sentenceDataList,
      totalWords: totalWordsCount,
      totalChars,
      totalCharsNoSpaces,
      totalSyllables: totalSyllablesCount,
      paragraphs: paragraphCount,
      fleschScore: flesch.score,
      fleschLevel: flesch.level
    };

    renderTable();
  }

  /**
   * Render or filter the sentence breakdown table
   */
  function renderTable() {
    const filter = (sentenceSearch.value || '').trim().toLowerCase();
    const list = currentAnalysis.sentences || [];

    const filtered = filter
      ? list.filter(item => item.text.toLowerCase().includes(filter))
      : list;

    sentenceTableCount.textContent = `${filtered.length} of ${list.length} entries`;

    if (filtered.length === 0) {
      breakdownBody.innerHTML = `
        <tr>
          <td colspan="6" style="text-align: center; padding: 2rem; color: var(--text-tertiary);">
            ${list.length === 0 ? 'Type or paste text above to see sentence metrics.' : 'No sentences match your filter.'}
          </td>
        </tr>`;
      return;
    }

    const rows = filtered.map(item => {
      const pacing = getPacingBadge(item.words);
      const safeText = escapeHTML(item.text);

      return `
        <tr>
          <td style="text-align: center; font-weight: 600; color: var(--text-tertiary);">${item.index}</td>
          <td style="line-height: 1.5; color: var(--text-primary); word-break: break-word;">${safeText}</td>
          <td style="text-align: right; font-weight: 600;">${item.words}</td>
          <td style="text-align: right;">${item.chars}</td>
          <td style="text-align: right;">${item.syllables}</td>
          <td style="text-align: center;">${pacing}</td>
        </tr>
      `;
    }).join('');

    breakdownBody.innerHTML = rows;
  }

  // Event Listeners
  textInput.addEventListener('input', analyzeText);

  sentenceSearch.addEventListener('input', renderTable);

  clearBtn.addEventListener('click', () => {
    textInput.value = '';
    sentenceSearch.value = '';
    analyzeText();
    textInput.focus();
  });

  sampleBtn.addEventListener('click', () => {
    textInput.value = SAMPLE_TEXT;
    sentenceSearch.value = '';
    analyzeText();
  });

  copySummaryBtn.addEventListener('click', () => {
    if (!currentAnalysis.sentences || currentAnalysis.sentences.length === 0) {
      alert('Please enter some text before copying summary metrics.');
      return;
    }

    const summary = [
      '=== Sentence Counter Analysis ===',
      `Total Sentences: ${currentAnalysis.sentences.length}`,
      `Total Words: ${currentAnalysis.totalWords}`,
      `Total Characters: ${currentAnalysis.totalChars}`,
      `Total Syllables: ${currentAnalysis.totalSyllables}`,
      `Paragraphs: ${currentAnalysis.paragraphs}`,
      `Avg Sentence Length: ${(currentAnalysis.totalWords / currentAnalysis.sentences.length).toFixed(1)} words/sentence`,
      `Flesch Reading Ease: ${currentAnalysis.fleschScore} (${currentAnalysis.fleschLevel})`,
      `Generated by ALL IN ONE Sentence Counter`
    ].join('\n');

    navigator.clipboard.writeText(summary).then(() => {
      const originalText = copySummaryBtn.innerHTML;
      copySummaryBtn.innerHTML = `
        <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="color: #10b981;"><polyline points="20 6 9 17 4 12"></polyline></svg>
        Copied!
      `;
      setTimeout(() => {
        copySummaryBtn.innerHTML = originalText;
      }, 2000);
    }).catch(() => {
      alert('Failed to copy to clipboard.');
    });
  });

  // Run initial analysis with sample text or empty
  analyzeText();
});