// TXT Analyzer - Unstructured Text & Log Analysis Engine
document.addEventListener('DOMContentLoaded', () => {
  // Elements
  const txtRawInput = document.getElementById('txt-raw-input');
  const txtDropZone = document.getElementById('txt-drop-zone');
  const txtFileInput = document.getElementById('txt-file-input');
  const btnAnalyzeTxt = document.getElementById('btn-analyze-txt');
  const btnClearTxt = document.getElementById('btn-clear-txt');
  const presetButtons = document.querySelectorAll('.preset-btn');

  // Results Section Elements
  const txtResultsSection = document.getElementById('txt-results-section');
  const kpiTxtLines = document.getElementById('kpi-txt-lines');
  const kpiNonEmptyLines = document.getElementById('kpi-non-empty-lines');
  const kpiTxtWords = document.getElementById('kpi-txt-words');
  const kpiTxtChars = document.getElementById('kpi-txt-chars');
  const kpiCharsNoSpace = document.getElementById('kpi-chars-no-space');
  const kpiReadingTime = document.getElementById('kpi-reading-time');
  const kpiEntitiesCount = document.getElementById('kpi-entities-count');

  // Tabs
  const tabBtns = document.querySelectorAll('.tab-btn');
  const tabContents = document.querySelectorAll('.tab-content');

  // Regex Extractor Elements
  const customRegexPattern = document.getElementById('custom-regex-pattern');
  const customRegexFlags = document.getElementById('custom-regex-flags');
  const btnExecCustomRegex = document.getElementById('btn-exec-custom-regex');
  const customRegexResult = document.getElementById('custom-regex-result');

  const listEmails = document.getElementById('list-emails');
  const badgeEmails = document.getElementById('badge-emails');
  const listIps = document.getElementById('list-ips');
  const badgeIps = document.getElementById('badge-ips');
  const listPhones = document.getElementById('list-phones');
  const badgePhones = document.getElementById('badge-phones');
  const listUrls = document.getElementById('list-urls');
  const badgeUrls = document.getElementById('badge-urls');
  const listDates = document.getElementById('list-dates');
  const badgeDates = document.getElementById('badge-dates');
  const listMoney = document.getElementById('list-money');
  const badgeMoney = document.getElementById('badge-money');
  const copyPatternBtns = document.querySelectorAll('.btn-copy-pattern');

  // Token Frequency Elements
  const chkFreqStopWords = document.getElementById('chk-freq-stop-words');
  const chkFreqCaseInsensitive = document.getElementById('chk-freq-case-insensitive');
  const numMinWordLen = document.getElementById('num-min-word-len');
  const selectNgramMode = document.getElementById('select-ngram-mode');
  const tbodyTokenFreq = document.getElementById('tbody-token-freq');
  const btnExportTokensCsv = document.getElementById('btn-export-tokens-csv');
  const btnCopyTokens = document.getElementById('btn-copy-tokens');

  // Line Metrics Elements
  const kpiAvgLineLen = document.getElementById('kpi-avg-line-len');
  const kpiMaxLineLen = document.getElementById('kpi-max-line-len');
  const kpiMaxLineNum = document.getElementById('kpi-max-line-num');
  const kpiMinLineLen = document.getElementById('kpi-min-line-len');
  const kpiSentencesCount = document.getElementById('kpi-sentences-count');
  const kpiParagraphsCount = document.getElementById('kpi-paragraphs-count');
  const lineSearch = document.getElementById('line-search');
  const chkHighlightLongLines = document.getElementById('chk-highlight-long-lines');
  const lineInspectorBox = document.getElementById('line-inspector-box');

  // Structured Tabular Elements
  const selectExtractionFormat = document.getElementById('select-extraction-format');
  const btnReextractTable = document.getElementById('btn-reextract-table');
  const structuredThead = document.getElementById('structured-thead');
  const structuredTbody = document.getElementById('structured-tbody');
  const structPaginationInfo = document.getElementById('struct-pagination-info');
  const btnStructPrev = document.getElementById('btn-struct-prev');
  const btnStructNext = document.getElementById('btn-struct-next');
  const structPageNum = document.getElementById('struct-page-num');
  const btnExportStructuredCsv = document.getElementById('btn-export-structured-csv');
  const btnExportStructuredJson = document.getElementById('btn-export-structured-json');

  // State
  let analysisState = {
    rawText: '',
    lines: [],
    extractedEntities: {
      emails: [],
      ips: [],
      phones: [],
      urls: [],
      dates: [],
      money: []
    },
    tokenStats: [],
    structuredData: {
      headers: [],
      rows: []
    },
    tablePagination: {
      page: 1,
      pageSize: 25
    }
  };

  // English Stop Words
  const STOP_WORDS = new Set([
    'a', 'about', 'above', 'after', 'again', 'against', 'all', 'am', 'an', 'and', 'any', 'are', 'aren\'t', 'as', 'at',
    'be', 'because', 'been', 'before', 'being', 'below', 'between', 'both', 'but', 'by',
    'can', 'can\'t', 'cannot', 'could', 'couldn\'t', 'did', 'didn\'t', 'do', 'does', 'doesn\'t', 'doing', 'don\'t', 'down', 'during',
    'each', 'few', 'for', 'from', 'further', 'had', 'hadn\'t', 'has', 'hasn\'t', 'have', 'haven\'t', 'having', 'he', 'he\'d', 'he\'ll', 'he\'s', 'her', 'here', 'here\'s', 'hers', 'herself', 'him', 'himself', 'his', 'how', 'how\'s',
    'i', 'i\'d', 'i\'ll', 'i\'m', 'i\'ve', 'if', 'in', 'into', 'is', 'isn\'t', 'it', 'it\'s', 'its', 'itself',
    'let\'s', 'me', 'more', 'most', 'mustn\'t', 'my', 'myself',
    'no', 'nor', 'not', 'of', 'off', 'on', 'once', 'only', 'or', 'other', 'ought', 'our', 'ours', 'ourselves', 'out', 'over', 'own',
    'same', 'shan\'t', 'she', 'she\'d', 'she\'ll', 'she\'s', 'should', 'shouldn\'t', 'so', 'some', 'such',
    'than', 'that', 'that\'s', 'the', 'their', 'theirs', 'them', 'themselves', 'then', 'there', 'there\'s', 'these', 'they', 'they\'d', 'they\'ll', 'they\'re', 'they\'ve', 'this', 'those', 'through', 'to', 'too',
    'under', 'until', 'up', 'very', 'was', 'wasn\'t', 'we', 'we\'d', 'we\'ll', 'we\'re', 'we\'ve', 'were', 'weren\'t', 'what', 'what\'s', 'when', 'when\'s', 'where', 'where\'s', 'which', 'while', 'who', 'who\'s', 'whom', 'why', 'why\'s', 'with', 'won\'t', 'would', 'wouldn\'t',
    'you', 'you\'d', 'you\'ll', 'you\'re', 'you\'ve', 'your', 'yours', 'yourself', 'yourselves'
  ]);

  // Sample Presets Data
  const TXT_PRESETS = {
    weblog: `192.168.1.104 - - [14/Mar/2024:08:15:22 +0000] "GET /api/v1/auth/session HTTP/1.1" 200 452 "https://cloud.acme.com/login" "Mozilla/5.0 (Windows NT 10.0; Win64; x64)"
10.0.4.15 - - [14/Mar/2024:08:15:24 +0000] "POST /api/v1/users/checkout HTTP/1.1" 200 1284 "https://cloud.acme.com/cart" "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)"
172.16.0.88 - - [14/Mar/2024:08:16:01 +0000] "GET /static/css/main.css HTTP/1.1" 304 0 "https://cloud.acme.com/dashboard" "Mozilla/5.0 (X11; Linux x86_64)"
192.168.1.104 - - [14/Mar/2024:08:16:45 +0000] "POST /api/v1/billing/pay HTTP/1.1" 500 892 "https://cloud.acme.com/billing" "Mozilla/5.0 (Windows NT 10.0; Win64; x64)"
203.0.113.42 - - [14/Mar/2024:08:17:10 +0000] "GET /products/catalog?page=2 HTTP/1.1" 200 15420 "https://google.com/search" "Mozilla/5.0 (iPhone; CPU iPhone OS 17_3 like Mac OS X)"
198.51.100.12 - - [14/Mar/2024:08:17:35 +0000] "GET /wp-admin/install.php HTTP/1.1" 404 162 "-" "curl/7.88.1"
10.0.4.15 - - [14/Mar/2024:08:18:02 +0000] "GET /api/v1/invoices/INV-9021 HTTP/1.1" 200 3410 "https://cloud.acme.com/orders" "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)"
192.168.1.104 - - [14/Mar/2024:08:18:40 +0000] "POST /api/v1/support/ticket HTTP/1.1" 201 640 "https://cloud.acme.com/support" "Mozilla/5.0 (Windows NT 10.0; Win64; x64)"
203.0.113.42 - - [14/Mar/2024:08:19:15 +0000] "GET /api/v1/products/item-882 HTTP/1.1" 200 2190 "https://cloud.acme.com/catalog" "Mozilla/5.0 (iPhone; CPU iPhone OS 17_3 like Mac OS X)"
172.16.0.88 - - [14/Mar/2024:08:20:00 +0000] "GET /api/v1/analytics/stream HTTP/1.1" 200 89120 "https://cloud.acme.com/dashboard" "Mozilla/5.0 (X11; Linux x86_64)"`,

    applog: `[2024-03-15 10:14:02.124] [INFO] Application server initialized on port 8080. Environment: production.
[2024-03-15 10:14:15.340] [INFO] Database connection pool established: 20 active connections to db.internal.net.
[2024-03-15 10:15:22.891] [WARN] Cache eviction rate high: 840 keys evicted in 60s from Redis cache at 10.0.2.14.
[2024-03-15 10:16:05.412] [ERROR] Payment gateway connection timeout connecting to https://api.stripe.com/v1/charges for customer sarah.connor@sky.net.
[2024-03-15 10:16:05.415] [ERROR] Transaction failed for Order #ORD-7721. Total: $249.99 USD. Retrying in 5000ms.
[2024-03-15 10:16:10.420] [INFO] Retry payment succeeded for Order #ORD-7721. Stripe Charge ID: ch_3N5b2k8.
[2024-03-15 10:18:44.901] [WARN] High memory usage alert: JVM Heap at 84% (6.7 GB of 8.0 GB allocated).
[2024-03-15 10:20:12.650] [INFO] User login authenticated for dev.lead@acme.com from IP 192.168.10.45.
[2024-03-15 10:22:33.118] [ERROR] Failed to send invoice notification email to finance@partnercorp.org. SMTP 550 Mailbox full.
[2024-03-15 10:25:00.000] [INFO] Routine cron backup completed: snapshot-20240315-1025.sql.gz (1.42 GB).`,

    support: `Chat Session #88392 - Date: 2024-03-18
Customer: Alex Mercer (alex.mercer@gmail.com, Phone: +1 (555) 438-9921)
Support Agent: Sophia Chen (schen@support.zendesk.com)

[14:02:10] Sophia: Hello Alex! Thank you for contacting Premium Support. How can I assist you today?
[14:03:05] Alex: Hi Sophia, I noticed an unexpected subscription charge of $189.50 on my credit card on 2024-03-17.
[14:03:42] Alex: My account invoice ID is INV-44910 and my subscription tier was supposed to be $49.00/month.
[14:04:15] Sophia: Let me look into that transaction immediately for you. Could you verify the billing zip code?
[14:04:30] Alex: Sure, it is 94107, San Francisco. You can also reach me at alex.personal@mercer.tech.
[14:06:22] Sophia: Thank you Alex. I see what happened. An extra 3 enterprise team seats were billed at $45.00 each on March 15, 2024.
[14:07:05] Alex: Oh, I see! I thought those were included in the trial. Can we please downgrade to the single tier?
[14:08:12] Sophia: Absolutely. I have processed an immediate refund of $135.00 back to your card ending in 4022. You can track this at https://billing.service.com/refunds/RF-1092.
[14:09:00] Alex: That is fantastic, thank you so much for the swift help Sophia!
[14:09:25] Sophia: You are very welcome! Have a wonderful day.`,

    ledger: `RecordID | TransactionDate | VendorName | ContactEmail | ReferenceCode | Amount | Status | PortalURL
TX-101 | 2024-01-12 | Amazon Web Services | billing@amazon.com | AWS-99201 | $3,450.00 | Paid | https://aws.amazon.com/invoice
TX-102 | 2024-01-15 | Slack Technologies | support@slack.com | SLK-1140 | $720.50 | Paid | https://slack.com/billing
TX-103 | 2024-01-20 | GitHub Enterprise | billing@github.com | GH-8831 | $1,250.00 | Paid | https://github.com/organizations
TX-104 | 2024-02-01 | Twilio Communications | finance@twilio.com | TWL-409 | $415.80 | Paid | https://twilio.com/console
TX-105 | 2024-02-05 | Google Workspace | payments@google.com | GGL-772 | $1,890.00 | Paid | https://admin.google.com
TX-106 | 2024-02-14 | Datadog Cloud | ar@datadoghq.com | DD-2091 | $2,840.00 | Pending | https://app.datadoghq.com/billing
TX-107 | 2024-02-28 | Zoom Video | billing@zoom.us | ZM-6019 | $350.00 | Paid | https://zoom.us/account
TX-108 | 2024-03-01 | Atlassian Jira | invoices@atlassian.com | ATL-339 | $1,600.00 | Paid | https://my.atlassian.com`
  };

  // Event Listeners for Presets
  presetButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const presetKey = btn.getAttribute('data-preset');
      if (TXT_PRESETS[presetKey]) {
        txtRawInput.value = TXT_PRESETS[presetKey];
        analyzeTextContent();
      }
    });
  });

  btnClearTxt.addEventListener('click', () => {
    txtRawInput.value = '';
    txtResultsSection.style.display = 'none';
    analysisState = { rawText: '', lines: [], extractedEntities: { emails: [], ips: [], phones: [], urls: [], dates: [], money: [] }, tokenStats: [], structuredData: { headers: [], rows: [] }, tablePagination: { page: 1, pageSize: 25 } };
  });

  btnAnalyzeTxt.addEventListener('click', () => analyzeTextContent());

  // Tabs
  tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      tabBtns.forEach(b => b.classList.remove('active'));
      tabContents.forEach(c => c.classList.remove('active'));
      btn.classList.add('active');
      const targetId = btn.getAttribute('data-tab');
      const targetEl = document.getElementById(targetId);
      if (targetEl) targetEl.classList.add('active');
    });
  });

  // Drag and drop
  txtDropZone.addEventListener('click', () => txtFileInput.click());
  txtDropZone.addEventListener('dragover', (e) => {
    e.preventDefault();
    txtDropZone.classList.add('dragover');
  });
  txtDropZone.addEventListener('dragleave', () => txtDropZone.classList.remove('dragover'));
  txtDropZone.addEventListener('drop', (e) => {
    e.preventDefault();
    txtDropZone.classList.remove('dragover');
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleTxtFile(e.dataTransfer.files[0]);
    }
  });

  txtFileInput.addEventListener('change', () => {
    if (txtFileInput.files && txtFileInput.files.length > 0) {
      handleTxtFile(txtFileInput.files[0]);
    }
  });

  function handleTxtFile(file) {
    const reader = new FileReader();
    reader.onload = (e) => {
      txtRawInput.value = e.target.result;
      analyzeTextContent();
    };
    reader.readAsText(file);
  }

  // Token Frequency Filter Controls
  chkFreqStopWords.addEventListener('change', () => computeTokenFrequencies());
  chkFreqCaseInsensitive.addEventListener('change', () => computeTokenFrequencies());
  numMinWordLen.addEventListener('input', () => computeTokenFrequencies());
  selectNgramMode.addEventListener('change', () => computeTokenFrequencies());

  btnExportTokensCsv.addEventListener('click', () => exportTokensCsv());
  btnCopyTokens.addEventListener('click', () => copyTokensText());

  // Line inspector filter
  lineSearch.addEventListener('input', () => renderLineInspector());
  chkHighlightLongLines.addEventListener('change', () => renderLineInspector());

  // Custom Regex Button
  btnExecCustomRegex.addEventListener('click', () => executeCustomRegex());

  // Structured Table Controls
  btnReextractTable.addEventListener('click', () => extractStructuredTable());
  selectExtractionFormat.addEventListener('change', () => extractStructuredTable());
  btnStructPrev.addEventListener('click', () => {
    if (analysisState.tablePagination.page > 1) {
      analysisState.tablePagination.page--;
      renderStructuredTable();
    }
  });
  btnStructNext.addEventListener('click', () => {
    const totalPages = Math.ceil(analysisState.structuredData.rows.length / analysisState.tablePagination.pageSize);
    if (analysisState.tablePagination.page < totalPages) {
      analysisState.tablePagination.page++;
      renderStructuredTable();
    }
  });
  btnExportStructuredCsv.addEventListener('click', () => exportStructuredCsv());
  btnExportStructuredJson.addEventListener('click', () => exportStructuredJson());

  // Copy Pattern Buttons
  copyPatternBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const target = btn.getAttribute('data-target');
      const list = analysisState.extractedEntities[target] || [];
      const text = list.map(item => item.value).join('\n');
      navigator.clipboard.writeText(text).then(() => {
        const orig = btn.textContent;
        btn.textContent = 'Copied!';
        setTimeout(() => btn.textContent = orig, 1800);
      });
    });
  });

  // Core Analysis Routine
  function analyzeTextContent() {
    const text = txtRawInput.value;
    if (!text.trim()) {
      alert('Please enter or upload text to analyze.');
      return;
    }

    analysisState.rawText = text;
    analysisState.lines = text.split(/\r?\n/);

    // Compute basic text metrics
    computeTextMetrics();

    // Run Regex Pattern Extraction
    extractPatterns();

    // Compute Token Frequencies
    computeTokenFrequencies();

    // Render Line Inspector
    renderLineInspector();

    // Extract Structured Tabular Representation
    extractStructuredTable();

    txtResultsSection.style.display = 'flex';
    txtResultsSection.scrollIntoView({ behavior: 'smooth' });
  }

  // 1. Text & Line Metrics Computation
  function computeTextMetrics() {
    const text = analysisState.rawText;
    const lines = analysisState.lines;

    const totalLines = lines.length;
    const nonEmptyLines = lines.filter(l => l.trim().length > 0).length;
    const totalChars = text.length;
    const charsNoSpace = text.replace(/\s/g, '').length;

    // Words
    const words = text.match(/\b[\w'-]+\b/g) || [];
    const wordCount = words.length;

    // Sentences
    const sentences = text.match(/[^.!?]+[.!?]+(\s|$)/g) || [];
    const sentenceCount = Math.max(sentences.length, 1);

    // Paragraphs
    const paragraphs = text.split(/\n\s*\n/).filter(p => p.trim().length > 0);
    const paragraphCount = Math.max(paragraphs.length, 1);

    // Line Lengths
    const lineLengths = lines.map(l => l.length);
    const totalLineLen = lineLengths.reduce((a, b) => a + b, 0);
    const avgLineLen = totalLines > 0 ? (totalLineLen / totalLines).toFixed(1) : 0;
    
    let maxLineLen = 0;
    let maxLineIdx = 0;
    let minLineLen = lineLengths.length > 0 ? lineLengths[0] : 0;

    lineLengths.forEach((len, idx) => {
      if (len > maxLineLen) {
        maxLineLen = len;
        maxLineIdx = idx + 1;
      }
      if (len < minLineLen) {
        minLineLen = len;
      }
    });

    // Reading & Speaking times
    const readMinutes = Math.ceil(wordCount / 200);
    const readingTimeStr = readMinutes <= 1 ? '< 1 min' : `~${readMinutes} min`;

    // Update KPIs
    kpiTxtLines.textContent = totalLines.toLocaleString();
    kpiNonEmptyLines.textContent = nonEmptyLines.toLocaleString();
    kpiTxtWords.textContent = wordCount.toLocaleString();
    kpiTxtChars.textContent = totalChars.toLocaleString();
    kpiCharsNoSpace.textContent = charsNoSpace.toLocaleString();
    kpiReadingTime.textContent = readingTimeStr;

    kpiAvgLineLen.textContent = `${avgLineLen} chars`;
    kpiMaxLineLen.textContent = `${maxLineLen} chars`;
    kpiMaxLineNum.textContent = maxLineIdx;
    kpiMinLineLen.textContent = `${minLineLen} chars`;
    kpiSentencesCount.textContent = sentenceCount.toLocaleString();
    kpiParagraphsCount.textContent = paragraphCount.toLocaleString();
  }

  // 2. Regex Pattern Extractor
  function extractPatterns() {
    const text = analysisState.rawText;

    // Robust Regex Patterns
    const patterns = {
      emails: /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/gi,
      ips: /\b(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\b/g,
      phones: /(?:\+?\d{1,3}[-.\s]?)?\(?\d{2,4}\)?[-.\s]?\d{3,4}[-.\s]?\d{3,9}/g,
      urls: /https?:\/\/[^\s/$.?#].[^\s"'>)]*|www\.[^\s/$.?#].[^\s"'>)]*/gi,
      dates: /\b\d{4}[-/.]\d{1,2}[-/.]\d{1,2}\b|\b\d{1,2}[-/.]\d{1,2}[-/.]\d{2,4}\b|\b(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]* \d{1,2},? \d{4}\b/gi,
      money: /(?:[$€£¥₹]\s?\d+(?:,\d{3})*(?:\.\d{1,2})?|\b\d+(?:,\d{3})*(?:\.\d{1,2})?\s?(?:USD|EUR|GBP|CAD|AUD)\b)/gi
    };

    let totalEntityCount = 0;

    Object.entries(patterns).forEach(([key, regex]) => {
      const rawMatches = text.match(regex) || [];
      
      // Filter phone numbers to ensure genuine digit count >= 7
      let filteredMatches = rawMatches;
      if (key === 'phones') {
        filteredMatches = rawMatches.filter(p => {
          const digits = p.replace(/\D/g, '');
          return digits.length >= 7 && digits.length <= 15 && !p.includes('/') && !/^\d{4}-\d{2}-\d{2}$/.test(p);
        });
      }

      // Group frequencies
      const counts = {};
      filteredMatches.forEach(m => {
        const val = m.trim();
        counts[val] = (counts[val] || 0) + 1;
      });

      const grouped = Object.entries(counts)
        .sort((a, b) => b[1] - a[1])
        .map(([value, count]) => ({ value, count }));

      analysisState.extractedEntities[key] = grouped;
      totalEntityCount += filteredMatches.length;
    });

    kpiEntitiesCount.textContent = totalEntityCount.toLocaleString();

    // Render Pattern Cards
    renderPatternCard(listEmails, badgeEmails, analysisState.extractedEntities.emails);
    renderPatternCard(listIps, badgeIps, analysisState.extractedEntities.ips);
    renderPatternCard(listPhones, badgePhones, analysisState.extractedEntities.phones);
    renderPatternCard(listUrls, badgeUrls, analysisState.extractedEntities.urls);
    renderPatternCard(listDates, badgeDates, analysisState.extractedEntities.dates);
    renderPatternCard(listMoney, badgeMoney, analysisState.extractedEntities.money);
  }

  function renderPatternCard(listEl, badgeEl, items) {
    badgeEl.textContent = `${items.length} Unique`;
    if (items.length === 0) {
      listEl.innerHTML = `<div style="text-align: center; color: var(--text-tertiary); padding: 1.5rem 0.5rem;">No matches found</div>`;
      return;
    }

    listEl.innerHTML = items.map(item => `
      <div class="pattern-item">
        <span style="overflow: hidden; text-overflow: ellipsis; white-space: nowrap;" title="${escapeHtml(item.value)}">${escapeHtml(item.value)}</span>
        <span class="pattern-item-count">&times;${item.count}</span>
      </div>
    `).join('');
  }

  // Custom Regex Tester & Extractor
  function executeCustomRegex() {
    const patternStr = customRegexPattern.value.trim();
    const flags = customRegexFlags.value.trim() || 'g';
    if (!patternStr) return;

    try {
      const regex = new RegExp(patternStr, flags);
      const matches = analysisState.rawText.match(regex) || [];
      
      customRegexResult.style.display = 'block';
      if (matches.length === 0) {
        customRegexResult.innerHTML = `<strong>Result:</strong> 0 matches found.`;
      } else {
        const uniqueSet = new Set(matches);
        const sample = Array.from(uniqueSet).slice(0, 8).map(escapeHtml).join(', ');
        customRegexResult.innerHTML = `
          <strong>Result:</strong> Found <strong>${matches.length}</strong> total matches (<strong>${uniqueSet.size}</strong> unique).<br>
          <span style="color: var(--accent); font-family: monospace; font-size: 0.78rem;">Sample matches: ${sample}${uniqueSet.size > 8 ? '...' : ''}</span>
        `;
      }
    } catch (e) {
      customRegexResult.style.display = 'block';
      customRegexResult.innerHTML = `<span style="color: #ef4444;">Invalid regular expression: ${escapeHtml(e.message)}</span>`;
    }
  }

  // 3. Token Frequency Dictionary Computation
  function computeTokenFrequencies() {
    const text = analysisState.rawText;
    const isCaseInsensitive = chkFreqCaseInsensitive.checked;
    const filterStop = chkFreqStopWords.checked;
    const minLen = parseInt(numMinWordLen.value, 10) || 1;
    const ngramMode = parseInt(selectNgramMode.value, 10) || 1;

    let processed = isCaseInsensitive ? text.toLowerCase() : text;
    // Extract words
    const rawTokens = processed.match(/\b[a-zA-Z0-9_-]+\b/g) || [];

    let tokensToProcess = [];

    if (ngramMode === 1) {
      tokensToProcess = rawTokens.filter(t => {
        if (t.length < minLen) return false;
        if (filterStop && STOP_WORDS.has(t.toLowerCase())) return false;
        if (/^\d+$/.test(t)) return false; // filter pure numbers from word dictionary
        return true;
      });
    } else if (ngramMode === 2) {
      // Bigrams
      for (let i = 0; i < rawTokens.length - 1; i++) {
        const w1 = rawTokens[i];
        const w2 = rawTokens[i + 1];
        if (w1.length >= minLen && w2.length >= minLen) {
          if (filterStop && (STOP_WORDS.has(w1.toLowerCase()) || STOP_WORDS.has(w2.toLowerCase()))) continue;
          if (/^\d+$/.test(w1) && /^\d+$/.test(w2)) continue;
          tokensToProcess.push(`${w1} ${w2}`);
        }
      }
    }

    const totalTokens = tokensToProcess.length;
    const freqMap = {};
    tokensToProcess.forEach(t => {
      freqMap[t] = (freqMap[t] || 0) + 1;
    });

    const sortedTokens = Object.entries(freqMap)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 50)
      .map(([token, count], idx) => ({
        rank: idx + 1,
        token,
        count,
        percentage: totalTokens > 0 ? ((count / totalTokens) * 100).toFixed(1) : 0
      }));

    analysisState.tokenStats = sortedTokens;

    // Render Table
    if (sortedTokens.length === 0) {
      tbodyTokenFreq.innerHTML = `<tr><td colspan="5" style="text-align: center; color: var(--text-tertiary); padding: 2rem;">No tokens matched the criteria.</td></tr>`;
      return;
    }

    const maxCount = sortedTokens[0].count;

    tbodyTokenFreq.innerHTML = sortedTokens.map(item => `
      <tr>
        <td style="font-weight: 600; color: var(--text-tertiary);">#${item.rank}</td>
        <td style="font-weight: 700; color: var(--text-primary); font-family: monospace;">${escapeHtml(item.token)}</td>
        <td style="font-weight: 600; color: var(--accent);">${item.count.toLocaleString()}</td>
        <td style="font-size: 0.8rem; color: var(--text-secondary);">${item.percentage}%</td>
        <td>
          <div style="height: 6px; background: var(--bg-tertiary); border-radius: 999px; overflow: hidden; width: 100%; max-width: 220px;">
            <div style="width: ${(item.count / maxCount) * 100}%; height: 100%; background: var(--accent);"></div>
          </div>
        </td>
      </tr>
    `).join('');
  }

  // 4. Line Inspector View
  function renderLineInspector() {
    const lines = analysisState.lines;
    const filter = lineSearch.value.toLowerCase().trim();
    const highlightLong = chkHighlightLongLines.checked;

    let html = '';
    let renderedCount = 0;

    for (let i = 0; i < lines.length && renderedCount < 500; i++) {
      const line = lines[i];
      if (filter && !line.toLowerCase().includes(filter)) continue;

      renderedCount++;
      const lineNum = i + 1;
      const len = line.length;
      const isLong = highlightLong && len > 80;
      const longClass = isLong ? 'line-long' : '';

      html += `
        <div class="line-row ${longClass}">
          <div class="line-num">${lineNum}</div>
          <div class="line-len">${len}c</div>
          <div class="line-content">${escapeHtml(line || ' ')}</div>
        </div>
      `;
    }

    if (renderedCount === 0) {
      lineInspectorBox.innerHTML = `<div style="text-align: center; color: var(--text-tertiary); padding: 2rem;">No lines matched search filter.</div>`;
    } else {
      lineInspectorBox.innerHTML = html;
    }
  }

  // 5. Structured Tabular Extraction Engine
  function extractStructuredTable() {
    const text = analysisState.rawText;
    const format = selectExtractionFormat.value;
    const lines = analysisState.lines.filter(l => l.trim().length > 0);

    let headers = [];
    let rows = [];

    // Auto-detection
    let detectedFormat = format;
    if (detectedFormat === 'auto') {
      const sample = lines.slice(0, 5).join('\n');
      if (/^\[?\d{4}-\d{2}-\d{2}[T\s]\d{2}:\d{2}:\d{2}/.test(lines[0]) && /\[(INFO|WARN|ERROR|DEBUG|TRACE)\]/i.test(sample)) {
        detectedFormat = 'log_app';
      } else if (/^\S+ \S+ \S+ \[.+\] "(GET|POST|PUT|DELETE|HEAD|OPTIONS)/.test(lines[0])) {
        detectedFormat = 'log_apache';
      } else if (lines[0].includes('|')) {
        detectedFormat = 'delimited_pipe';
      } else if (lines[0].includes('\t')) {
        detectedFormat = 'delimited_tab';
      } else if (lines[0].includes(',') && lines[0].split(',').length >= 3) {
        detectedFormat = 'delimited_csv';
      } else if (/^[a-zA-Z0-9_-]+[:=]\s*.+/.test(lines[0])) {
        detectedFormat = 'key_value';
      } else {
        detectedFormat = 'log_app';
      }
    }

    if (detectedFormat === 'log_apache') {
      headers = ['Client IP', 'Timestamp', 'HTTP Method', 'Requested URI', 'Status Code', 'Bytes Sent'];
      const regex = /^(\S+)\s+\S+\s+\S+\s+\[([^\]]+)\]\s+"([A-Z]+)\s+([^ "]+)?(?:[^\"]*)"\s+([0-9]{3})\s+([0-9]+|-)/;
      lines.forEach(l => {
        const match = l.match(regex);
        if (match) {
          rows.push([match[1], match[2], match[3], match[4] || '/', match[5], match[6]]);
        }
      });
    } else if (detectedFormat === 'log_app') {
      headers = ['Timestamp', 'Log Level', 'Message'];
      const regex = /^\[?(\d{4}-\d{2}-\d{2}[T\s]\d{2}:\d{2}:\d{2}(?:\.\d+)?)\]?\s+\[?([A-Z]+)\]?\s+(.*)$/;
      lines.forEach(l => {
        const match = l.match(regex);
        if (match) {
          rows.push([match[1], match[2], match[3]]);
        } else {
          // Fallback line
          rows.push(['-', 'INFO', l]);
        }
      });
    } else if (detectedFormat.startsWith('delimited') || detectedFormat === 'delimited') {
      let delim = ',';
      if (detectedFormat === 'delimited_pipe' || lines[0].includes('|')) delim = '|';
      else if (detectedFormat === 'delimited_tab' || lines[0].includes('\t')) delim = '\t';
      else if (lines[0].includes(';')) delim = ';';

      const firstLineCells = lines[0].split(delim).map(c => c.trim());
      headers = firstLineCells;
      lines.slice(1).forEach(l => {
        const cells = l.split(delim).map(c => c.trim());
        if (cells.length === headers.length) {
          rows.push(cells);
        } else if (cells.length > 1) {
          while (cells.length < headers.length) cells.push('');
          rows.push(cells.slice(0, headers.length));
        }
      });
    } else if (detectedFormat === 'key_value') {
      headers = ['Line #', 'Attribute Key', 'Assigned Value'];
      lines.forEach((l, idx) => {
        const m = l.match(/^([a-zA-Z0-9_\s.-]+)[:=]\s*(.*)$/);
        if (m) {
          rows.push([String(idx + 1), m[1].trim(), m[2].trim()]);
        }
      });
    }

    if (headers.length === 0 || rows.length === 0) {
      headers = ['Line #', 'Raw Text Content'];
      rows = lines.map((l, idx) => [String(idx + 1), l]);
    }

    analysisState.structuredData = { headers, rows };
    analysisState.tablePagination.page = 1;

    renderStructuredTable();
  }

  function renderStructuredTable() {
    const { headers, rows } = analysisState.structuredData;
    const { page, pageSize } = analysisState.tablePagination;

    const totalRows = rows.length;
    const totalPages = Math.max(1, Math.ceil(totalRows / pageSize));
    if (page > totalPages) analysisState.tablePagination.page = totalPages;

    const startIdx = (analysisState.tablePagination.page - 1) * pageSize;
    const endIdx = Math.min(startIdx + pageSize, totalRows);
    const pageRows = rows.slice(startIdx, endIdx);

    // Render Headers
    structuredThead.innerHTML = `<tr><th>#</th>` + headers.map(h => `<th>${escapeHtml(h)}</th>`).join('') + `</tr>`;

    // Render Rows
    if (pageRows.length === 0) {
      structuredTbody.innerHTML = `<tr><td colspan="${headers.length + 1}" style="text-align: center; color: var(--text-tertiary); padding: 2rem;">No structured rows extracted.</td></tr>`;
    } else {
      structuredTbody.innerHTML = pageRows.map((r, rIdx) => {
        let cells = `<td style="font-weight:600; color:var(--text-tertiary);">${startIdx + rIdx + 1}</td>`;
        cells += r.map(c => {
          let badge = '';
          if (c === 'ERROR' || c === 'CRITICAL' || c === '500') badge = 'style="color:#ef4444; font-weight:700;"';
          else if (c === 'WARN' || c === 'WARNING') badge = 'style="color:#f59e0b; font-weight:700;"';
          else if (c === 'INFO' || c === '200') badge = 'style="color:#10b981; font-weight:700;"';
          return `<td ${badge}>${escapeHtml(c)}</td>`;
        }).join('');
        return `<tr>${cells}</tr>`;
      }).join('');
    }

    // Pagination
    structPaginationInfo.textContent = totalRows > 0 ? `Showing ${startIdx + 1} to ${endIdx} of ${totalRows.toLocaleString()} extracted rows` : '0 rows';
    structPageNum.textContent = `${analysisState.tablePagination.page} / ${totalPages}`;
    btnStructPrev.disabled = analysisState.tablePagination.page <= 1;
    btnStructNext.disabled = analysisState.tablePagination.page >= totalPages;
  }

  // Exports
  function exportTokensCsv() {
    let csv = `Rank,Token,Occurrences,Percentage\n`;
    analysisState.tokenStats.forEach(t => {
      csv += `${t.rank},"${t.token.replace(/"/g, '""')}",${t.count},${t.percentage}%\n`;
    });
    downloadBlob(csv, 'token_frequency_dictionary.csv', 'text/csv;charset=utf-8;');
  }

  function copyTokensText() {
    let txt = `TOKEN FREQUENCY LIST\n`;
    analysisState.tokenStats.forEach(t => {
      txt += `#${t.rank}: ${t.token} (${t.count}x, ${t.percentage}%)\n`;
    });
    navigator.clipboard.writeText(txt).then(() => {
      const orig = btnCopyTokens.textContent;
      btnCopyTokens.textContent = 'Copied!';
      setTimeout(() => btnCopyTokens.textContent = orig, 1800);
    });
  }

  function exportStructuredCsv() {
    const { headers, rows } = analysisState.structuredData;
    let csv = headers.map(h => `"${h.replace(/"/g, '""')}"`).join(',') + '\n';
    rows.forEach(r => {
      csv += r.map(c => `"${String(c).replace(/"/g, '""')}"`).join(',') + '\n';
    });
    downloadBlob(csv, 'structured_extracted_data.csv', 'text/csv;charset=utf-8;');
  }

  function exportStructuredJson() {
    const { headers, rows } = analysisState.structuredData;
    const jsonArr = rows.map(row => {
      const obj = {};
      headers.forEach((h, i) => obj[h] = row[i]);
      return obj;
    });
    const str = JSON.stringify(jsonArr, null, 2);
    downloadBlob(str, 'structured_extracted_data.json', 'application/json;charset=utf-8;');
  }

  function downloadBlob(content, filename, type) {
    const blob = new Blob([content], { type });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  function escapeHtml(str) {
    if (str === null || str === undefined) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }
});