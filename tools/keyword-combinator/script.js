// Keyword Combinator & PPC Matrix Generator Logic
// ALL IN ONE Platform - High-Performance Combinatorial Engine

document.addEventListener('DOMContentLoaded', () => {
  // DOM Elements - Column Inputs & Badges
  const colInputs = [
    document.getElementById('col1-input'),
    document.getElementById('col2-input'),
    document.getElementById('col3-input'),
    document.getElementById('col4-input')
  ];

  const colBadges = [
    document.getElementById('count-col1'),
    document.getElementById('count-col2'),
    document.getElementById('count-col3'),
    document.getElementById('count-col4')
  ];

  const clearColBtns = [
    document.getElementById('clear-col1'),
    document.getElementById('clear-col2'),
    document.getElementById('clear-col3'),
    document.getElementById('clear-col4')
  ];

  // Permutation Checkboxes
  const comboCheckboxes = {
    '12': document.getElementById('combo-12'),
    '123': document.getElementById('combo-123'),
    '1234': document.getElementById('combo-1234'),
    '23': document.getElementById('combo-23'),
    '24': document.getElementById('combo-24'),
    '124': document.getElementById('combo-124'),
    '234': document.getElementById('combo-234')
  };

  // Delimiter Radios
  const delimiterPills = document.querySelectorAll('.radio-pill');
  let selectedDelimiter = ' ';

  // Match Types Checkboxes
  const matchBroad = document.getElementById('match-broad');
  const matchPhrase = document.getElementById('match-phrase');
  const matchExact = document.getElementById('match-exact');
  const matchModified = document.getElementById('match-modified');

  // Sanitation Toggles
  const toggleLowercase = document.getElementById('toggle-lowercase');
  const toggleDedupe = document.getElementById('toggle-dedupe');
  const toggleTrim = document.getElementById('toggle-trim');
  const toggleCleanSymbols = document.getElementById('toggle-clean-symbols');

  // Metrics
  const metricTotal = document.getElementById('metric-total');
  const metricUnique = document.getElementById('metric-unique');
  const metricMatchTypes = document.getElementById('metric-match-types');
  const metricTime = document.getElementById('metric-time');

  // Output & Filter
  const filterSearchInput = document.getElementById('filter-search-input');
  const resultsOutput = document.getElementById('results-output');

  // Action Buttons
  const copyResultsBtn = document.getElementById('copy-results-btn');
  const exportCsvBtn = document.getElementById('export-csv-btn');
  const exportTxtBtn = document.getElementById('export-txt-btn');
  const sortAzBtn = document.getElementById('sort-az-btn');
  const sortZaBtn = document.getElementById('sort-za-btn');
  const shuffleBtn = document.getElementById('shuffle-btn');

  // Preset Buttons
  const presetSaas = document.getElementById('preset-saas');
  const presetMedical = document.getElementById('preset-medical');
  const presetEcommerce = document.getElementById('preset-ecommerce');
  const presetAgency = document.getElementById('preset-agency');
  const presetClearAll = document.getElementById('preset-clear-all');

  // Toast
  const toast = document.getElementById('app-toast');
  const toastMessage = document.getElementById('toast-message');
  let toastTimer = null;

  function showToast(msg) {
    if (toastTimer) clearTimeout(toastTimer);
    toastMessage.textContent = msg;
    toast.classList.add('show');
    toastTimer = setTimeout(() => {
      toast.classList.remove('show');
    }, 2500);
  }

  // Pre-configured Campaigns
  const campaignPresets = {
    saas: {
      col1: ['buy', 'best', 'top', 'affordable', 'cheap'],
      col2: ['crm software', 'project management tool', 'invoice generator', 'team collaboration app'],
      col3: ['online', 'for small business', 'for startups', 'for remote teams'],
      col4: ['pricing', 'free trial', 'reviews', 'demo']
    },
    medical: {
      col1: ['emergency', 'best', 'affordable', 'top rated', 'local'],
      col2: ['dentist', 'dental implants', 'teeth whitening', 'orthodontist', 'family dentistry'],
      col3: ['near me', 'in dallas', 'downtown', 'walk in', 'open on saturday'],
      col4: ['cost', 'appointment', 'reviews', 'consultation', 'insurance']
    },
    ecommerce: {
      col1: ['buy', 'discount', 'cheap', 'best', 'order'],
      col2: ['running shoes', 'trail sneakers', 'marathon shoes', 'athletic trainers'],
      col3: ['for men', 'for women', 'wide width', 'waterproof', 'lightweight'],
      col4: ['on sale', 'free shipping', 'reviews', 'clearance', 'coupons']
    },
    agency: {
      col1: ['hire', 'top', 'best', 'award winning', 'professional'],
      col2: ['seo agency', 'web design company', 'ppc management', 'digital marketing firm'],
      col3: ['in new york', 'for b2b', 'for enterprise', 'for ecommerce'],
      col4: ['services', 'packages', 'quote', 'case studies', 'pricing']
    }
  };

  // State
  let generatedData = []; // Array of { keyword, matchType, wordCount, charCount }
  let displayedKeywords = []; // Array of formatted strings

  // Parse Lines from Column Textarea
  function getLines(colIndex) {
    const raw = colInputs[colIndex].value;
    const lines = raw.split(/\r?\n/);
    const result = [];

    const isLowercase = toggleLowercase.checked;
    const isTrim = toggleTrim.checked;
    const isCleanSymbols = toggleCleanSymbols.checked;

    for (let i = 0; i < lines.length; i++) {
      let line = lines[i];
      if (isTrim) line = line.trim();
      if (isCleanSymbols) line = line.replace(/[^\w\s-]/g, '');
      if (isLowercase) line = line.toLowerCase();
      if (line.length > 0) {
        result.push(line);
      }
    }

    return result;
  }

  // Update Column Item Count Badges
  function updateColumnCounts() {
    for (let i = 0; i < 4; i++) {
      const lines = getLines(i);
      colBadges[i].textContent = `${lines.length}`;
    }
  }

  // Helper: Format Keyword by Match Type
  function applyMatchType(phrase, type) {
    if (type === 'Broad') {
      return phrase;
    }
    if (type === 'Phrase') {
      return `"${phrase}"`;
    }
    if (type === 'Exact') {
      return `[${phrase}]`;
    }
    if (type === 'Modified Broad') {
      // Split by spaces, prepend + to each word
      const words = phrase.split(/\s+/).filter(Boolean);
      return words.map(w => w.startsWith('+') ? w : `+${w}`).join(' ');
    }
    return phrase;
  }

  // Combinatorial Permutation Engine
  function computeCombinations() {
    const startTime = performance.now();

    updateColumnCounts();

    const list1 = getLines(0);
    const list2 = getLines(1);
    const list3 = getLines(2);
    const list4 = getLines(3);

    const activeRules = [];
    if (comboCheckboxes['12'].checked && list1.length > 0 && list2.length > 0) activeRules.push([list1, list2]);
    if (comboCheckboxes['123'].checked && list1.length > 0 && list2.length > 0 && list3.length > 0) activeRules.push([list1, list2, list3]);
    if (comboCheckboxes['1234'].checked && list1.length > 0 && list2.length > 0 && list3.length > 0 && list4.length > 0) activeRules.push([list1, list2, list3, list4]);
    if (comboCheckboxes['23'].checked && list2.length > 0 && list3.length > 0) activeRules.push([list2, list3]);
    if (comboCheckboxes['24'].checked && list2.length > 0 && list4.length > 0) activeRules.push([list2, list4]);
    if (comboCheckboxes['124'].checked && list1.length > 0 && list2.length > 0 && list4.length > 0) activeRules.push([list1, list2, list4]);
    if (comboCheckboxes['234'].checked && list2.length > 0 && list3.length > 0 && list4.length > 0) activeRules.push([list2, list3, list4]);

    const activeMatchTypes = [];
    if (matchBroad.checked) activeMatchTypes.push('Broad');
    if (matchPhrase.checked) activeMatchTypes.push('Phrase');
    if (matchExact.checked) activeMatchTypes.push('Exact');
    if (matchModified.checked) activeMatchTypes.push('Modified Broad');

    metricMatchTypes.textContent = `${activeMatchTypes.length}`;

    const delimiter = selectedDelimiter;
    const shouldDedupe = toggleDedupe.checked;
    const rawPhrases = [];
    const seenPhrases = new Set();
    const MAX_LIMIT = 80000;

    // Execute Cartesians for active rules
    for (let r = 0; r < activeRules.length; r++) {
      const lists = activeRules[r];
      generateCartesian(lists, 0, [], (comboParts) => {
        if (rawPhrases.length >= MAX_LIMIT) return;
        const joined = comboParts.join(delimiter);
        if (shouldDedupe) {
          if (!seenPhrases.has(joined)) {
            seenPhrases.add(joined);
            rawPhrases.push(joined);
          }
        } else {
          rawPhrases.push(joined);
        }
      });
      if (rawPhrases.length >= MAX_LIMIT) break;
    }

    // Now apply match types
    const finalData = [];
    const seenMatches = new Set();

    for (let i = 0; i < rawPhrases.length; i++) {
      const basePhrase = rawPhrases[i];
      const wordCount = basePhrase.split(/\s+/).filter(Boolean).length;

      for (let m = 0; m < activeMatchTypes.length; m++) {
        const matchType = activeMatchTypes[m];
        const formatted = applyMatchType(basePhrase, matchType);

        if (shouldDedupe) {
          if (!seenMatches.has(formatted)) {
            seenMatches.add(formatted);
            finalData.push({
              keyword: formatted,
              matchType: matchType,
              wordCount: wordCount,
              charCount: formatted.length
            });
          }
        } else {
          finalData.push({
            keyword: formatted,
            matchType: matchType,
            wordCount: wordCount,
            charCount: formatted.length
          });
        }
      }
    }

    generatedData = finalData;
    const elapsed = (performance.now() - startTime).toFixed(1);

    metricTotal.textContent = generatedData.length.toLocaleString();
    metricUnique.textContent = shouldDedupe ? generatedData.length.toLocaleString() : (new Set(generatedData.map(d => d.keyword)).size).toLocaleString();
    metricTime.textContent = `${elapsed} ms`;

    renderOutput();
  }

  // Recursive Cartesian Product Generator
  function generateCartesian(lists, index, current, callback) {
    if (index === lists.length) {
      callback(current);
      return;
    }

    const currentList = lists[index];
    for (let i = 0; i < currentList.length; i++) {
      current.push(currentList[i]);
      generateCartesian(lists, index + 1, current, callback);
      current.pop();
    }
  }

  // Render keywords into output textarea
  function renderOutput() {
    const filterQuery = filterSearchInput.value.trim().toLowerCase();

    let filtered = generatedData;
    if (filterQuery) {
      filtered = generatedData.filter(d => d.keyword.toLowerCase().includes(filterQuery));
    }

    displayedKeywords = filtered.map(d => d.keyword);
    resultsOutput.value = displayedKeywords.join('\n');
  }

  // Load a Campaign Preset
  function loadPreset(campaignKey) {
    const data = campaignPresets[campaignKey];
    if (!data) return;

    colInputs[0].value = data.col1.join('\n');
    colInputs[1].value = data.col2.join('\n');
    colInputs[2].value = data.col3.join('\n');
    colInputs[3].value = data.col4.join('\n');

    computeCombinations();
    showToast(`Loaded ${campaignKey.toUpperCase()} preset campaign!`);
  }

  // Clear All Columns
  function clearAllColumns() {
    colInputs.forEach(input => {
      input.value = '';
    });
    computeCombinations();
    showToast('Cleared all keyword columns.');
  }

  // Event Listeners - Column Inputs
  colInputs.forEach(input => {
    input.addEventListener('input', () => {
      computeCombinations();
    });
  });

  // Clear Single Column Buttons
  clearColBtns.forEach((btn, idx) => {
    btn.addEventListener('click', () => {
      colInputs[idx].value = '';
      computeCombinations();
    });
  });

  // Checkbox Chips Interactions
  const chipLabels = document.querySelectorAll('.chip-checkbox-label');
  chipLabels.forEach(label => {
    const checkbox = label.querySelector('input[type="checkbox"]');
    if (!checkbox) return;

    label.addEventListener('click', (e) => {
      if (e.target !== checkbox) {
        checkbox.checked = !checkbox.checked;
      }
      if (checkbox.checked) {
        label.classList.add('checked');
      } else {
        label.classList.remove('checked');
      }
      computeCombinations();
    });
  });

  // Delimiter Radios
  delimiterPills.forEach(pill => {
    pill.addEventListener('click', () => {
      delimiterPills.forEach(p => p.classList.remove('active'));
      pill.classList.add('active');

      const radio = pill.querySelector('input[type="radio"]');
      if (radio) radio.checked = true;

      selectedDelimiter = pill.dataset.delimiter;
      computeCombinations();
    });
  });

  // Real-time Search Filter
  filterSearchInput.addEventListener('input', renderOutput);

  // Sorting and Shuffling
  sortAzBtn.addEventListener('click', () => {
    generatedData.sort((a, b) => a.keyword.localeCompare(b.keyword));
    renderOutput();
    showToast('Sorted A → Z');
  });

  sortZaBtn.addEventListener('click', () => {
    generatedData.sort((a, b) => b.keyword.localeCompare(a.keyword));
    renderOutput();
    showToast('Sorted Z → A');
  });

  shuffleBtn.addEventListener('click', () => {
    // Fisher-Yates Shuffle
    for (let i = generatedData.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      const temp = generatedData[i];
      generatedData[i] = generatedData[j];
      generatedData[j] = temp;
    }
    renderOutput();
    showToast('Randomized keyword order');
  });

  // Copy Results to Clipboard
  copyResultsBtn.addEventListener('click', () => {
    const text = resultsOutput.value;
    if (!text.trim()) {
      showToast('No keywords to copy.');
      return;
    }

    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text)
        .then(() => showToast(`Copied ${displayedKeywords.length.toLocaleString()} keywords!`))
        .catch(() => fallbackCopy(text));
    } else {
      fallbackCopy(text);
    }
  });

  function fallbackCopy(text) {
    resultsOutput.select();
    try {
      document.execCommand('copy');
      showToast(`Copied ${displayedKeywords.length.toLocaleString()} keywords!`);
    } catch {
      showToast('Failed to copy. Please use Ctrl+C.');
    }
  }

  // Export CSV
  exportCsvBtn.addEventListener('click', () => {
    if (generatedData.length === 0) {
      showToast('No keyword data to export.');
      return;
    }

    const filterQuery = filterSearchInput.value.trim().toLowerCase();
    let exportItems = generatedData;
    if (filterQuery) {
      exportItems = generatedData.filter(d => d.keyword.toLowerCase().includes(filterQuery));
    }

    let csvContent = 'Keyword,Match Type,Word Count,Character Count\r\n';
    exportItems.forEach(item => {
      // Escape CSV field
      const escapedKw = `"${item.keyword.replace(/"/g, '""')}"`;
      csvContent += `${escapedKw},${item.matchType},${item.wordCount},${item.charCount}\r\n`;
    });

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `ppc-keywords-${Date.now()}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    showToast(`Exported ${exportItems.length.toLocaleString()} keywords to CSV!`);
  });

  // Export Plain Text .TXT
  exportTxtBtn.addEventListener('click', () => {
    const text = resultsOutput.value;
    if (!text.trim()) {
      showToast('No keywords to export.');
      return;
    }

    const blob = new Blob([text], { type: 'text/plain;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `keywords-${Date.now()}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    showToast(`Exported ${displayedKeywords.length.toLocaleString()} keywords to .TXT!`);
  });

  // Presets Handlers
  presetSaas.addEventListener('click', () => loadPreset('saas'));
  presetMedical.addEventListener('click', () => loadPreset('medical'));
  presetEcommerce.addEventListener('click', () => loadPreset('ecommerce'));
  presetAgency.addEventListener('click', () => loadPreset('agency'));
  presetClearAll.addEventListener('click', clearAllColumns);

  // Initial Run
  computeCombinations();
});