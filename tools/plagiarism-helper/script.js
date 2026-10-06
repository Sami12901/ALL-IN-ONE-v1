/**
 * Academic Plagiarism Helper & Text Similarity Auditor
 * Pure client-side NLP n-gram analysis, Jaccard similarity, and visual phrase highlighter
 */

document.addEventListener('DOMContentLoaded', () => {
  // English Stopwords
  const STOPWORDS = new Set([
    'a', 'about', 'above', 'after', 'again', 'against', 'all', 'am', 'an', 'and', 'any', 'are', 'aren\'t',
    'as', 'at', 'be', 'because', 'been', 'before', 'being', 'below', 'between', 'both', 'but', 'by',
    'can', 'can\'t', 'cannot', 'could', 'couldn\'t', 'did', 'didn\'t', 'do', 'does', 'doesn\'t', 'doing',
    'don\'t', 'down', 'during', 'each', 'few', 'for', 'from', 'further', 'had', 'hadn\'t', 'has', 'hasn\'t',
    'have', 'haven\'t', 'having', 'he', 'he\'d', 'he\'ll', 'he\'s', 'her', 'here', 'here\'s', 'hers',
    'herself', 'him', 'himself', 'his', 'how', 'how\'s', 'i', 'i\'d', 'i\'ll', 'i\'m', 'i\'ve', 'if',
    'in', 'into', 'is', 'isn\'t', 'it', 'it\'s', 'its', 'itself', 'let\'s', 'me', 'more', 'most', 'mustn\'t',
    'my', 'myself', 'no', 'nor', 'not', 'of', 'off', 'on', 'once', 'only', 'or', 'other', 'ought', 'our',
    'ours', 'ourselves', 'out', 'over', 'own', 'same', 'shan\'t', 'she', 'she\'d', 'she\'ll', 'she\'s',
    'should', 'shouldn\'t', 'so', 'some', 'such', 'than', 'that', 'that\'s', 'the', 'their', 'theirs',
    'them', 'themselves', 'then', 'there', 'there\'s', 'these', 'they', 'they\'d', 'they\'ll', 'they\'re',
    'they\'ve', 'this', 'those', 'through', 'to', 'too', 'under', 'until', 'up', 'very', 'was', 'wasn\'t',
    'we', 'we\'d', 'we\'ll', 'we\'re', 'we\'ve', 'were', 'weren\'t', 'what', 'what\'s', 'when', 'when\'s',
    'where', 'where\'s', 'which', 'while', 'who', 'who\'s', 'whom', 'why', 'why\'s', 'with', 'won\'t',
    'would', 'wouldn\'t', 'you', 'you\'d', 'you\'ll', 'you\'re', 'you\'ve', 'your', 'yours', 'yourself', 'yourselves'
  ]);

  // DOM Elements - Inputs
  const refTextarea = document.getElementById('ref-textarea');
  const refHighlightDiv = document.getElementById('ref-highlight-div');
  const draftTextarea = document.getElementById('draft-textarea');
  const draftHighlightDiv = document.getElementById('draft-highlight-div');

  const btnRefEdit = document.getElementById('btn-ref-edit');
  const btnRefView = document.getElementById('btn-ref-view');
  const btnDraftEdit = document.getElementById('btn-draft-edit');
  const btnDraftView = document.getElementById('btn-draft-view');

  const refStats = document.getElementById('ref-count-stats');
  const draftStats = document.getElementById('draft-count-stats');
  const btnClearRef = document.getElementById('btn-clear-ref');
  const btnClearDraft = document.getElementById('btn-clear-draft');

  const chkIgnoreCase = document.getElementById('chk-ignore-case');
  const chkIgnorePunct = document.getElementById('chk-ignore-punct');
  const chkFilterStopwords = document.getElementById('chk-filter-stopwords');
  const selNgram = document.getElementById('sel-ngram');

  const btnCompareNow = document.getElementById('btn-compare-now');

  // Hero displays
  const dispOrigScore = document.getElementById('disp-orig-score');
  const origBarFill = document.getElementById('orig-bar-fill');
  const dispSimIndex = document.getElementById('disp-sim-index');
  const dispSimSub = document.getElementById('disp-sim-sub');
  const dispMatchedCount = document.getElementById('disp-matched-count');
  const dispWordsMatched = document.getElementById('disp-words-matched');
  const integrityBadgeSlot = document.getElementById('integrity-badge-slot');
  const dispStatusSub = document.getElementById('disp-status-sub');

  // Recommendations & phrases
  const adviceHeadline = document.getElementById('advice-headline');
  const adviceBody = document.getElementById('advice-body');
  const citationHintBox = document.getElementById('citation-hint-box');
  const matchedPhrasesList = document.getElementById('matched-phrases-list');

  // Presets
  const presetHighSim = document.getElementById('preset-high-sim');
  const presetParaphrased = document.getElementById('preset-paraphrased');
  const presetOriginal = document.getElementById('preset-original');

  // --- HTML Sanitizer ---
  function escapeHtml(text) {
    return text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  // --- Tokenizer with Character Offsets ---
  function tokenizeText(text, ignoreCase, ignorePunct, filterStopwords) {
    const tokens = [];
    // Match words and whitespace
    const regex = /\b[\w'-]+\b/g;
    let match;

    while ((match = regex.exec(text)) !== null) {
      const rawWord = match[0];
      const start = match.index;
      const end = start + rawWord.length;

      let norm = rawWord;
      if (ignoreCase) norm = norm.toLowerCase();
      if (ignorePunct) norm = norm.replace(/[^\w]/g, '');

      if (!norm) continue;

      if (filterStopwords && STOPWORDS.has(norm.toLowerCase())) {
        continue;
      }

      tokens.push({
        raw: rawWord,
        norm: norm,
        start: start,
        end: end
      });
    }

    return tokens;
  }

  // --- n-gram Extractor ---
  function extractNgrams(tokens, n) {
    const ngrams = [];
    if (tokens.length < n) return ngrams;

    for (let i = 0; i <= tokens.length - n; i++) {
      const slice = tokens.slice(i, i + n);
      const key = slice.map(t => t.norm).join(' ');
      ngrams.push({
        key: key,
        startTokenIdx: i,
        endTokenIdx: i + n - 1,
        startChar: slice[0].start,
        endChar: slice[slice.length - 1].end
      });
    }

    return ngrams;
  }

  // --- Levenshtein Distance Metric (Normalized) ---
  function computeLevenshteinSimilarity(s1, s2) {
    if (s1 === s2) return 1.0;
    if (!s1.length || !s2.length) return 0.0;

    // Sample first 1500 chars to maintain instant response speed
    const str1 = s1.slice(0, 1500).toLowerCase().replace(/\s+/g, ' ');
    const str2 = s2.slice(0, 1500).toLowerCase().replace(/\s+/g, ' ');
    const m = str1.length;
    const n = str2.length;

    let prev = new Array(n + 1);
    let curr = new Array(n + 1);

    for (let j = 0; j <= n; j++) prev[j] = j;

    for (let i = 1; i <= m; i++) {
      curr[0] = i;
      const c1 = str1[i - 1];
      for (let j = 1; j <= n; j++) {
        const cost = c1 === str2[j - 1] ? 0 : 1;
        curr[j] = Math.min(
          curr[j - 1] + 1,      // insertion
          prev[j] + 1,          // deletion
          prev[j - 1] + cost    // substitution
        );
      }
      [prev, curr] = [curr, prev];
    }

    const dist = prev[n];
    const maxLen = Math.max(m, n);
    return Math.max(0, 1 - (dist / maxLen));
  }

  // --- Main Auditor & Similarity Engine ---
  function runAudit() {
    const refText = refTextarea.value;
    const draftText = draftTextarea.value;

    updateStatsDisplay(refText, refStats);
    updateStatsDisplay(draftText, draftStats);

    if (!refText.trim() || !draftText.trim()) {
      dispOrigScore.textContent = '100%';
      origBarFill.style.width = '100%';
      origBarFill.style.backgroundColor = 'var(--success)';
      dispSimIndex.textContent = '0%';
      dispMatchedCount.textContent = '0';
      dispWordsMatched.textContent = '0 words duplicated';
      updateIntegrityBadge(100);

      refHighlightDiv.innerHTML = escapeHtml(refText);
      draftHighlightDiv.innerHTML = escapeHtml(draftText);
      matchedPhrasesList.innerHTML = '<div style="color:var(--text-tertiary); font-size:0.85rem;">Enter both reference text and draft text to run audit.</div>';
      return;
    }

    const ignoreCase = chkIgnoreCase.checked;
    const ignorePunct = chkIgnorePunct.checked;
    const filterStop = chkFilterStopwords.checked;
    const n = parseInt(selNgram.value, 10) || 3;

    const refTokens = tokenizeText(refText, ignoreCase, ignorePunct, filterStop);
    const draftTokens = tokenizeText(draftText, ignoreCase, ignorePunct, filterStop);

    const refNgrams = extractNgrams(refTokens, n);
    const draftNgrams = extractNgrams(draftTokens, n);

    // Build lookup set of reference n-grams
    const refNgramMap = new Map();
    refNgrams.forEach(ng => {
      if (!refNgramMap.has(ng.key)) {
        refNgramMap.set(ng.key, []);
      }
      refNgramMap.get(ng.key).push(ng);
    });

    // Find matches in draft
    const matchingDraftRanges = [];
    const matchingRefRanges = [];
    const matchedPhraseKeys = new Set();
    const matchedPhrasesDetails = [];

    draftNgrams.forEach(dng => {
      if (refNgramMap.has(dng.key)) {
        matchingDraftRanges.push({ start: dng.startChar, end: dng.endChar });
        const refMatches = refNgramMap.get(dng.key);
        refMatches.forEach(rng => {
          matchingRefRanges.push({ start: rng.startChar, end: rng.endChar });
        });

        if (!matchedPhraseKeys.has(dng.key)) {
          matchedPhraseKeys.add(dng.key);
          const rawSlice = draftText.slice(dng.startChar, dng.endChar);
          matchedPhrasesDetails.push({
            phrase: rawSlice,
            wordCount: n,
            occurrences: refMatches.length
          });
        }
      }
    });

    // Merge overlapping highlight intervals
    const mergedDraftIntervals = mergeIntervals(matchingDraftRanges);
    const mergedRefIntervals = mergeIntervals(matchingRefRanges);

    // Compute metrics
    const draftTotalNgrams = draftNgrams.length || 1;
    const matchedDraftNgramCount = matchingDraftRanges.length;

    // Containment ratio: proportion of draft n-grams that exist in reference
    const containment = Math.min(1, matchedDraftNgramCount / draftTotalNgrams);

    // Jaccard similarity
    const unionSize = new Set([...refNgrams.map(g => g.key), ...draftNgrams.map(g => g.key)]).size || 1;
    const jaccard = matchedPhraseKeys.size / unionSize;

    // String Levenshtein
    const levSim = computeLevenshteinSimilarity(refText, draftText);

    // Weighted composite similarity
    let compositeSimilarity = (containment * 0.65) + (jaccard * 0.25) + (levSim * 0.10);
    compositeSimilarity = Math.min(1, Math.max(0, compositeSimilarity));

    const simPercent = Math.round(compositeSimilarity * 100);
    const origPercent = 100 - simPercent;

    // Calculate words matched in draft
    let matchedCharsCount = 0;
    mergedDraftIntervals.forEach(iv => {
      matchedCharsCount += (iv.end - iv.start);
    });
    const approxWordsMatched = Math.round((matchedCharsCount / (draftText.length || 1)) * draftTokens.length);

    // Update UI Stats
    dispOrigScore.textContent = `${origPercent}%`;
    dispSimIndex.textContent = `${simPercent}%`;
    dispSimSub.textContent = `Containment: ${(containment * 100).toFixed(1)}% | Jaccard: ${(jaccard * 100).toFixed(1)}%`;
    dispMatchedCount.textContent = matchedPhraseKeys.size.toString();
    dispWordsMatched.textContent = `${approxWordsMatched} word${approxWordsMatched === 1 ? '' : 's'} matched (${Math.round((matchedCharsCount / (draftText.length || 1)) * 100)}%)`;

    // Originality Gauge Bar Color
    origBarFill.style.width = `${origPercent}%`;
    if (origPercent >= 80) {
      origBarFill.style.backgroundColor = 'var(--success)';
    } else if (origPercent >= 55) {
      origBarFill.style.backgroundColor = '#f59e0b';
    } else {
      origBarFill.style.backgroundColor = 'var(--error)';
    }

    updateIntegrityBadge(origPercent);

    // Render Highlights
    draftHighlightDiv.innerHTML = buildHighlightedHtml(draftText, mergedDraftIntervals, 'match-exact');
    refHighlightDiv.innerHTML = buildHighlightedHtml(refText, mergedRefIntervals, 'match-near');

    // Render Matched Phrases List
    renderMatchedPhrases(matchedPhrasesDetails);

    // Update Academic Advice
    updateAdvice(origPercent, matchedPhraseKeys.size);
  }

  function mergeIntervals(intervals) {
    if (intervals.length === 0) return [];
    intervals.sort((a, b) => a.start - b.start);
    const merged = [intervals[0]];

    for (let i = 1; i < intervals.length; i++) {
      const prev = merged[merged.length - 1];
      const curr = intervals[i];
      if (curr.start <= prev.end) {
        prev.end = Math.max(prev.end, curr.end);
      } else {
        merged.push({ start: curr.start, end: curr.end });
      }
    }
    return merged;
  }

  function buildHighlightedHtml(originalText, intervals, markClass) {
    if (intervals.length === 0) return escapeHtml(originalText);

    let html = '';
    let lastIndex = 0;

    intervals.forEach(iv => {
      // Unmatched leading slice
      if (iv.start > lastIndex) {
        html += escapeHtml(originalText.slice(lastIndex, iv.start));
      }
      // Matched slice
      const matchSlice = originalText.slice(iv.start, iv.end);
      html += `<mark class="${markClass}" title="Matched passage in comparison source">${escapeHtml(matchSlice)}</mark>`;
      lastIndex = iv.end;
    });

    if (lastIndex < originalText.length) {
      html += escapeHtml(originalText.slice(lastIndex));
    }

    return html;
  }

  function updateIntegrityBadge(originality) {
    integrityBadgeSlot.innerHTML = '';
    let badgeClass = 'honor-magna';
    let label = 'Original & Safe';
    let sub = 'Minimal or no overlap detected.';

    if (originality >= 85) {
      badgeClass = 'honor-magna';
      label = 'Original & Safe';
      sub = 'Minimal or no textual overlap with reference.';
    } else if (originality >= 60) {
      badgeClass = 'honor-cum';
      label = 'Moderate Overlap';
      sub = 'Paraphrased phrases and citations recommended.';
    } else {
      badgeClass = 'honor-warning';
      label = 'High Similarity Warning';
      sub = 'Significant verbatim matching detected.';
    }

    const badge = document.createElement('span');
    badge.className = `honor-badge ${badgeClass}`;
    badge.textContent = label;
    integrityBadgeSlot.appendChild(badge);
    dispStatusSub.textContent = sub;
  }

  function renderMatchedPhrases(phrases) {
    matchedPhrasesList.innerHTML = '';
    if (phrases.length === 0) {
      matchedPhrasesList.innerHTML = '<div style="color:var(--text-tertiary); font-size:0.85rem; padding: 0.5rem 0;">No overlapping sequences detected.</div>';
      return;
    }

    phrases.slice(0, 20).forEach((item, idx) => {
      const div = document.createElement('div');
      div.className = 'matched-phrase-item';
      div.innerHTML = `
        <div style="font-weight: 600; color: var(--text-primary); margin-bottom: 2px;">
          "${escapeHtml(item.phrase)}"
        </div>
        <div style="font-size: 0.75rem; color: var(--text-tertiary); display: flex; justify-content: space-between;">
          <span>${item.wordCount}-word matching sequence</span>
          <span>${item.occurrences} occurrence${item.occurrences > 1 ? 's' : ''} in source</span>
        </div>
      `;
      matchedPhrasesList.appendChild(div);
    });

    if (phrases.length > 20) {
      const more = document.createElement('div');
      more.style.cssText = 'font-size:0.8rem; color:var(--text-tertiary); text-align:center; padding: 0.25rem;';
      more.textContent = `+ ${phrases.length - 20} more matching sequences`;
      matchedPhrasesList.appendChild(more);
    }
  }

  function updateAdvice(origScore, matchCount) {
    if (origScore >= 85) {
      adviceHeadline.textContent = 'Academic Originality: Clear';
      adviceHeadline.style.color = 'var(--success)';
      adviceBody.textContent = 'Your draft shows strong individual phrasing and original expression. Any common academic keywords present represent standard disciplinary nomenclature.';
      citationHintBox.innerHTML = '<strong>Best Practice:</strong> Even with original language, ensure underlying facts, data points, and core ideas are credited to their primary sources.';
    } else if (origScore >= 60) {
      adviceHeadline.textContent = 'Academic Originality: Attention Advised';
      adviceHeadline.style.color = '#f59e0b';
      adviceBody.innerHTML = `Identified <strong>${matchCount} overlapping segments</strong>. Several sentences follow the reference text closely. To maintain full academic integrity, either rephrase using your own sentence structure and synonyms, or attribute with direct quotation.`;
      citationHintBox.innerHTML = '<strong>Paraphrasing Strategy:</strong> Combine sentences, alter the grammatical voice (active vs. passive), and synthesize the reference with your own critical commentary.';
    } else {
      adviceHeadline.textContent = 'Academic Originality: Plagiarism Alert';
      adviceHeadline.style.color = 'var(--error)';
      adviceBody.innerHTML = `Substantial portion of the student draft is identical or nearly identical to the source text. Most academic institutions consider uncredited multi-word verbatim passages a violation of academic integrity.`;
      citationHintBox.innerHTML = '<strong>Action Required:</strong> Enclose identical passages in quotation marks <code>"..."</code> with specific page or paragraph citations, e.g. <code>(Russell & Norvig, 2021, p. 45)</code>, or conduct a complete rewrite in your own words.';
    }
  }

  function updateStatsDisplay(text, el) {
    const words = text.trim() ? text.trim().split(/\s+/).length : 0;
    const chars = text.length;
    el.textContent = `${words} words | ${chars} characters`;
  }

  // --- View Toggle Handlers (Edit vs Highlight) ---
  btnRefEdit.addEventListener('click', () => {
    btnRefEdit.classList.add('active');
    btnRefView.classList.remove('active');
    refTextarea.style.display = 'block';
    refHighlightDiv.style.display = 'none';
  });

  btnRefView.addEventListener('click', () => {
    btnRefView.classList.add('active');
    btnRefEdit.classList.remove('active');
    refTextarea.style.display = 'none';
    refHighlightDiv.style.display = 'block';
    runAudit();
  });

  btnDraftEdit.addEventListener('click', () => {
    btnDraftEdit.classList.add('active');
    btnDraftView.classList.remove('active');
    draftTextarea.style.display = 'block';
    draftHighlightDiv.style.display = 'none';
  });

  btnDraftView.addEventListener('click', () => {
    btnDraftView.classList.add('active');
    btnDraftEdit.classList.remove('active');
    draftTextarea.style.display = 'none';
    draftHighlightDiv.style.display = 'block';
    runAudit();
  });

  // --- Clear Buttons ---
  btnClearRef.addEventListener('click', () => {
    refTextarea.value = '';
    runAudit();
  });

  btnClearDraft.addEventListener('click', () => {
    draftTextarea.value = '';
    runAudit();
  });

  // --- Presets ---
  presetHighSim.addEventListener('click', () => {
    refTextarea.value = `Artificial intelligence is the simulation of human intelligence processes by machines, especially computer systems. Specific applications of AI include expert systems, natural language processing, speech recognition and machine vision. As the hype around AI has accelerated, vendors have been scrambling to promote how their products and services use it.`;
    draftTextarea.value = `Artificial intelligence is the simulation of human intelligence processes by machines, especially computer systems. Modern applications of AI include expert systems, natural language processing, and machine vision. As the hype around AI has accelerated, companies are trying to promote how their products use it.`;

    btnRefView.click();
    btnDraftView.click();
    runAudit();
  });

  presetParaphrased.addEventListener('click', () => {
    refTextarea.value = `Deep learning models achieve state-of-the-art results across diverse domains, including computer vision and natural language processing. However, training these architectures requires vast datasets and immense computational horsepower.`;
    draftTextarea.value = `Modern neural network approaches have set new performance benchmarks in visual recognition and language tasks. Nonetheless, these deep architectures depend heavily on massive data collections and substantial compute resources.`;

    btnRefView.click();
    btnDraftView.click();
    runAudit();
  });

  presetOriginal.addEventListener('click', () => {
    refTextarea.value = `Photosynthesis is a chemical process that occurs in plants, algae, and some types of bacteria, when they are exposed to sunlight. During photosynthesis, water and carbon dioxide combine to form carbohydrates and oxygen.`;
    draftTextarea.value = `The Renaissance was a fervent period of European cultural, artistic, political and economic rebirth following the Middle Ages. Generally described as taking place from the 14th century to the 17th century, it promoted classical rediscovery.`;

    btnRefView.click();
    btnDraftView.click();
    runAudit();
  });

  // Textarea input event listeners
  let debounceTimeout;
  function handleInputDebounced() {
    clearTimeout(debounceTimeout);
    debounceTimeout = setTimeout(runAudit, 350);
  }

  refTextarea.addEventListener('input', handleInputDebounced);
  draftTextarea.addEventListener('input', handleInputDebounced);

  [chkIgnoreCase, chkIgnorePunct, chkFilterStopwords, selNgram].forEach(ctrl => {
    ctrl.addEventListener('change', runAudit);
  });

  btnCompareNow.addEventListener('click', () => {
    btnRefView.click();
    btnDraftView.click();
    runAudit();
  });

  // Initial demo load
  presetHighSim.click();
});