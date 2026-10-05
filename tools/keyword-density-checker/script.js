// Keyword Density Checker - SEO Content & N-Gram Analysis Engine
document.addEventListener('DOMContentLoaded', () => {
  // DOM Elements
  const contentInput = document.getElementById('content-input');
  const btnSample = document.getElementById('btn-sample');
  const btnPaste = document.getElementById('btn-paste');
  const btnClear = document.getElementById('btn-clear');
  const minLenInput = document.getElementById('min-len');
  const toggleStopwords = document.getElementById('toggle-stopwords');
  const toggleCase = document.getElementById('toggle-case');
  const searchFilter = document.getElementById('search-filter');
  const tableBody = document.getElementById('table-body');
  const rowStats = document.getElementById('row-stats');

  // KPI elements
  const kpiWords = document.getElementById('kpi-words');
  const kpiChars = document.getElementById('kpi-chars');
  const kpiReadingTime = document.getElementById('kpi-reading-time');
  const kpiUniqueWords = document.getElementById('kpi-unique-words');
  const kpiSentences = document.getElementById('kpi-sentences');

  // Tab buttons and count badges
  const tabBtns = document.querySelectorAll('.tab-btn');
  const countTab1 = document.getElementById('count-tab-1');
  const countTab2 = document.getElementById('count-tab-2');
  const countTab3 = document.getElementById('count-tab-3');

  // Export & Action elements
  const btnCopyTable = document.getElementById('btn-copy-table');
  const btnExportCsv = document.getElementById('btn-export-csv');

  // Highlight elements
  const highlightSection = document.getElementById('highlight-section');
  const highlightTitle = document.getElementById('highlight-title');
  const highlightContent = document.getElementById('highlight-content');
  const btnCloseHighlight = document.getElementById('btn-close-highlight');
  const toast = document.getElementById('toast');

  // Active state
  let currentTab = 1; // 1, 2, or 3
  let activeKeyword = null;
  let cachedData = { 1: [], 2: [], 3: [] };
  let totalWordCount = 0;

  // Common English Stopwords set
  const STOP_WORDS = new Set([
    'a', 'about', 'above', 'after', 'again', 'against', 'all', 'am', 'an', 'and', 'any', 'are', 'aren\'t', 'as', 'at',
    'be', 'because', 'been', 'before', 'being', 'below', 'between', 'both', 'but', 'by',
    'can', 'can\'t', 'cannot', 'could', 'couldn\'t',
    'did', 'didn\'t', 'do', 'does', 'doesn\'t', 'doing', 'don\'t', 'down', 'during',
    'each', 'few', 'for', 'from', 'further',
    'had', 'hadn\'t', 'has', 'hasn\'t', 'have', 'haven\'t', 'having', 'he', 'he\'d', 'he\'ll', 'he\'s', 'her', 'here', 'here\'s', 'hers', 'herself', 'him', 'himself', 'his', 'how', 'how\'s',
    'i', 'i\'d', 'i\'ll', 'i\'m', 'i\'ve', 'if', 'in', 'into', 'is', 'isn\'t', 'it', 'it\'s', 'its', 'itself',
    'let\'s', 'me', 'more', 'most', 'mustn\'t', 'my', 'myself',
    'no', 'nor', 'not', 'of', 'off', 'on', 'once', 'only', 'or', 'other', 'ought', 'our', 'ours', 'ourselves', 'out', 'over', 'own',
    'same', 'shan\'t', 'she', 'she\'d', 'she\'ll', 'she\'s', 'should', 'shouldn\'t', 'so', 'some', 'such',
    'than', 'that', 'that\'s', 'the', 'their', 'theirs', 'them', 'themselves', 'then', 'there', 'there\'s', 'these', 'they', 'they\'d', 'they\'ll', 'they\'re', 'they\'ve', 'this', 'those', 'through', 'to', 'too',
    'under', 'until', 'up', 'very',
    'was', 'wasn\'t', 'we', 'we\'d', 'we\'ll', 'we\'re', 'we\'ve', 'were', 'weren\'t', 'what', 'what\'s', 'when', 'when\'s', 'where', 'where\'s', 'which', 'while', 'who', 'who\'s', 'whom', 'why', 'why\'s', 'with', 'won\'t', 'would', 'wouldn\'t',
    'you', 'you\'d', 'you\'ll', 'you\'re', 'you\'ve', 'your', 'yours', 'yourself', 'yourselves'
  ]);

  const SAMPLE_ARTICLE = `Search engine optimization (SEO) is a fundamental pillar of modern digital marketing strategy. To build high-ranking web pages, content creators must master keyword research, search intent, and organic content density. When optimizing for search engines, strategic keyword placement inside page titles, headings, and introductory paragraphs signals topical relevance.

However, modern search algorithms utilize advanced natural language processing to evaluate semantic search depth. Search engine crawlers look beyond raw keyword repetition; they analyze contextual keywords and user engagement metrics. Excessive keyword repetition, commonly known as keyword stuffing, triggers algorithmic penalties and undermines user trust. A balanced keyword density between 1% and 2.5% keeps content natural, readable, and search engine friendly.

High-quality content marketing emphasizes user intent before search rankings. When writing comprehensive articles, focus on high-intent long-tail keywords, structured heading hierarchies, and informative paragraphs. Search engine optimization works best when technical SEO best practices, keyword density optimization, and compelling storytelling align seamlessly. Monitor your keyword frequency, eliminate unnecessary filler words, and refine your organic search strategy for sustainable growth.`;

  // Show Toast Feedback
  function showToast(message) {
    if (!toast) return;
    toast.textContent = message;
    toast.classList.add('show');
    setTimeout(() => {
      toast.classList.remove('show');
    }, 2500);
  }

  // Tokenize words from raw text
  function tokenizeText(rawText, caseSensitive) {
    if (!rawText.trim()) return [];
    // Match sequences of word characters and hyphens/apostrophes within words
    const matches = rawText.match(/[\p{L}\p{N}]+(?:[''-][\p{L}\p{N}]+)*/gu);
    if (!matches) return [];
    return caseSensitive ? matches : matches.map(w => w.toLowerCase());
  }

  // Count sentences
  function countSentences(text) {
    const trimmed = text.trim();
    if (!trimmed) return 0;
    const sentences = trimmed.split(/[.!?]+/).filter(s => s.trim().length > 0);
    return sentences.length;
  }

  // Determine Health Classification & Badge
  function getHealthInfo(densityPct) {
    if (densityPct < 1.0) {
      return {
        label: 'Low',
        cssClass: 'badge-low',
        barColor: '#89aacc'
      };
    } else if (densityPct <= 2.5) {
      return {
        label: 'Optimal',
        cssClass: 'badge-optimal',
        barColor: '#10b981'
      };
    } else if (densityPct <= 3.5) {
      return {
        label: 'High',
        cssClass: 'badge-high',
        barColor: '#f59e0b'
      };
    } else {
      return {
        label: 'Stuffing',
        cssClass: 'badge-stuffing',
        barColor: '#ef4444'
      };
    }
  }

  // Extract N-Grams
  function generateNGrams(tokens, n, filterStopwords, minLength) {
    const frequencyMap = new Map();
    const len = tokens.length;

    for (let i = 0; i <= len - n; i++) {
      const slice = tokens.slice(i, i + n);

      if (n === 1) {
        const word = slice[0];
        if (word.length < minLength) continue;
        if (filterStopwords && STOP_WORDS.has(word.toLowerCase())) continue;
        frequencyMap.set(word, (frequencyMap.get(word) || 0) + 1);
      } else {
        // Multi-word phrases
        // Skip phrases where all words are stopwords or words too short
        const hasValidWord = slice.some(w => w.length >= minLength && (!filterStopwords || !STOP_WORDS.has(w.toLowerCase())));
        if (!hasValidWord) continue;

        // In SEO, phrases that start or end with a stopword are often noise when filtering is on
        if (filterStopwords) {
          const firstWord = slice[0].toLowerCase();
          const lastWord = slice[slice.length - 1].toLowerCase();
          if (STOP_WORDS.has(firstWord) || STOP_WORDS.has(lastWord)) continue;
        }

        const phrase = slice.join(' ');
        frequencyMap.set(phrase, (frequencyMap.get(phrase) || 0) + 1);
      }
    }

    // Convert map to sorted array
    const results = [];
    frequencyMap.forEach((count, phrase) => {
      // Standard SEO density: (count * n / totalWords) * 100
      const density = totalWordCount > 0 ? (count * n / totalWordCount) * 100 : 0;
      results.push({
        phrase,
        count,
        density,
        health: getHealthInfo(density)
      });
    });

    results.sort((a, b) => b.count - a.count || b.density - a.density || a.phrase.localeCompare(b.phrase));
    return results;
  }

  // Main Analysis Controller
  function analyzeText() {
    const text = contentInput.value;
    const minLength = parseInt(minLenInput.value, 10) || 1;
    const filterStopwords = toggleStopwords.checked;
    const caseSensitive = toggleCase.checked;

    // Tokens
    const rawTokens = tokenizeText(text, caseSensitive);
    totalWordCount = rawTokens.length;

    // KPIs
    const charCount = text.length;
    const sentenceCount = countSentences(text);
    const readingMins = totalWordCount > 0 ? Math.ceil(totalWordCount / 200) : 0;
    const uniqueWordSet = new Set(rawTokens.map(t => t.toLowerCase()));

    kpiWords.textContent = totalWordCount.toLocaleString();
    kpiChars.textContent = charCount.toLocaleString();
    kpiReadingTime.textContent = readingMins === 0 ? '0 min' : (readingMins === 1 ? '1 min' : `${readingMins} mins`);
    kpiUniqueWords.textContent = uniqueWordSet.size.toLocaleString();
    kpiSentences.textContent = sentenceCount.toLocaleString();

    if (totalWordCount === 0) {
      cachedData = { 1: [], 2: [], 3: [] };
      countTab1.textContent = '0';
      countTab2.textContent = '0';
      countTab3.textContent = '0';
      renderTable();
      closeHighlight();
      return;
    }

    // Generate N-Grams
    cachedData[1] = generateNGrams(rawTokens, 1, filterStopwords, minLength);
    cachedData[2] = generateNGrams(rawTokens, 2, filterStopwords, minLength);
    cachedData[3] = generateNGrams(rawTokens, 3, filterStopwords, minLength);

    countTab1.textContent = cachedData[1].length.toLocaleString();
    countTab2.textContent = cachedData[2].length.toLocaleString();
    countTab3.textContent = cachedData[3].length.toLocaleString();

    renderTable();

    // Refresh highlight if an active keyword is present
    if (activeKeyword) {
      highlightKeywordInText(activeKeyword);
    }
  }

  // Render Table for active tab and search query
  function renderTable() {
    const query = (searchFilter.value || '').trim().toLowerCase();
    const data = cachedData[currentTab] || [];
    const filtered = query 
      ? data.filter(item => item.phrase.toLowerCase().includes(query))
      : data;

    rowStats.textContent = `${filtered.length} terms (${data.length} total)`;

    if (filtered.length === 0) {
      if (totalWordCount === 0) {
        tableBody.innerHTML = `
          <tr>
            <td colspan="4" style="text-align: center; padding: 2.5rem; color: var(--text-tertiary);">
              No text entered. Paste content or click "Sample Article" to begin analysis.
            </td>
          </tr>`;
      } else {
        tableBody.innerHTML = `
          <tr>
            <td colspan="4" style="text-align: center; padding: 2rem; color: var(--text-tertiary);">
              No matching keywords found for "${escapeHtml(query)}".
            </td>
          </tr>`;
      }
      return;
    }

    let rowsHtml = '';
    filtered.slice(0, 100).forEach(item => {
      const isSelected = activeKeyword === item.phrase;
      const barWidth = Math.min(100, Math.max(3, (item.density / 5) * 100));

      rowsHtml += `
        <tr class="${isSelected ? 'selected' : ''}" data-phrase="${escapeHtml(item.phrase)}">
          <td>
            <span class="kw-text">${escapeHtml(item.phrase)}</span>
          </td>
          <td style="text-align: center; font-weight: 700; color: var(--text-primary);">
            ${item.count}
          </td>
          <td>
            <span style="font-weight: 600;">${item.density.toFixed(2)}%</span>
            <div class="density-bar-wrap" title="${item.density.toFixed(2)}%">
              <div class="density-bar-fill" style="width: ${barWidth}%; background-color: ${item.health.barColor};"></div>
            </div>
          </td>
          <td style="text-align: right;">
            <span class="density-badge ${item.health.cssClass}">
              ${item.health.label}
            </span>
          </td>
        </tr>`;
    });

    tableBody.innerHTML = rowsHtml;

    // Attach row click listeners
    const rows = tableBody.querySelectorAll('tr[data-phrase]');
    rows.forEach(row => {
      row.addEventListener('click', () => {
        const phrase = row.getAttribute('data-phrase');
        selectKeyword(phrase);
      });
    });
  }

  // Keyword Selection and Interactive Text Highlight
  function selectKeyword(phrase) {
    if (activeKeyword === phrase) {
      closeHighlight();
      return;
    }
    activeKeyword = phrase;
    highlightKeywordInText(phrase);
    renderTable();
  }

  function highlightKeywordInText(phrase) {
    const rawText = contentInput.value;
    if (!rawText.trim() || !phrase) {
      closeHighlight();
      return;
    }

    const caseSensitive = toggleCase.checked;
    const escapedPhrase = phrase.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    // Whole phrase / word boundaries
    const regex = new RegExp(`\\b${escapedPhrase}\\b`, caseSensitive ? 'g' : 'gi');

    let matchCount = 0;
    const highlightedHtml = escapeHtml(rawText).replace(
      new RegExp(`\\b${escapedPhrase.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, caseSensitive ? 'g' : 'gi'),
      (match) => {
        matchCount++;
        return `<mark class="kw-highlight">${match}</mark>`;
      }
    );

    highlightTitle.innerHTML = `Highlighting: <strong style="color: #ffffff;">"${escapeHtml(phrase)}"</strong> (${matchCount} occurrences)`;
    highlightContent.innerHTML = highlightedHtml;
    highlightSection.style.display = 'block';
  }

  function closeHighlight() {
    activeKeyword = null;
    highlightSection.style.display = 'none';
    highlightContent.innerHTML = '';
    const selectedRows = tableBody.querySelectorAll('tr.selected');
    selectedRows.forEach(r => r.classList.remove('selected'));
  }

  // HTML Entity Escaping
  function escapeHtml(str) {
    if (!str) return '';
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  // Tab Switching
  tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      tabBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentTab = parseInt(btn.getAttribute('data-tab'), 10) || 1;
      searchFilter.value = '';
      renderTable();
    });
  });

  // Event Listeners for Input & Controls
  contentInput.addEventListener('input', () => {
    analyzeText();
  });

  minLenInput.addEventListener('input', () => {
    analyzeText();
  });

  toggleStopwords.addEventListener('change', () => {
    analyzeText();
  });

  toggleCase.addEventListener('change', () => {
    analyzeText();
  });

  searchFilter.addEventListener('input', () => {
    renderTable();
  });

  // Action Buttons
  btnSample.addEventListener('click', () => {
    contentInput.value = SAMPLE_ARTICLE;
    analyzeText();
    showToast('Sample SEO article loaded');
  });

  btnPaste.addEventListener('click', async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text) {
        contentInput.value = text;
        analyzeText();
        showToast('Text pasted from clipboard');
      } else {
        showToast('Clipboard is empty');
      }
    } catch {
      showToast('Clipboard permission denied. Please paste manually (Ctrl+V).');
    }
  });

  btnClear.addEventListener('click', () => {
    contentInput.value = '';
    analyzeText();
    showToast('Content cleared');
  });

  btnCloseHighlight.addEventListener('click', () => {
    closeHighlight();
  });

  // Copy Table
  btnCopyTable.addEventListener('click', async () => {
    const data = cachedData[currentTab] || [];
    if (data.length === 0) {
      showToast('No keyword data to copy');
      return;
    }

    let tsv = `Keyword / Phrase\tOccurrences\tDensity %\tHealth\n`;
    data.forEach(item => {
      tsv += `${item.phrase}\t${item.count}\t${item.density.toFixed(2)}%\t${item.health.label}\n`;
    });

    try {
      await navigator.clipboard.writeText(tsv);
      showToast(`Copied ${data.length} keywords to clipboard!`);
    } catch {
      showToast('Failed to copy. Please allow clipboard access.');
    }
  });

  // Export CSV
  btnExportCsv.addEventListener('click', () => {
    const data = cachedData[currentTab] || [];
    if (data.length === 0) {
      showToast('No keyword data to export');
      return;
    }

    const nGramLabel = currentTab === 1 ? '1-Word-Keywords' : (currentTab === 2 ? '2-Word-Phrases' : '3-Word-Phrases');
    let csv = `Keyword or Phrase,Occurrences,Density Percentage,Health Status\r\n`;

    data.forEach(item => {
      const safePhrase = `"${item.phrase.replace(/"/g, '""')}"`;
      csv += `${safePhrase},${item.count},${item.density.toFixed(2)}%,${item.health.label}\r\n`;
    });

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const downloadAnchor = document.createElement('a');
    downloadAnchor.href = url;
    downloadAnchor.download = `keyword-density-${nGramLabel}-${Date.now()}.csv`;
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    document.body.removeChild(downloadAnchor);
    URL.revokeObjectURL(url);

    showToast(`Exported ${data.length} keywords as CSV!`);
  });

  // Initial calculation (starts empty)
  analyzeText();
});