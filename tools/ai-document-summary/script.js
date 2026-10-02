// AI Document Summary - Pure Client-Side Heuristic NLP Engine

document.addEventListener('DOMContentLoaded', () => {
  // Elements
  const dropZone = document.getElementById('drop-zone');
  const pdfInput = document.getElementById('pdf-input');
  const loadSampleBtn = document.getElementById('load-sample-btn');
  const uploadPanel = document.getElementById('upload-panel');
  const processingState = document.getElementById('processing-state');
  const statusTitle = document.getElementById('status-title');
  const statusDesc = document.getElementById('status-desc');
  const progressBar = document.getElementById('progress-bar');
  const resultsWorkspace = document.getElementById('results-workspace');
  
  // Results Elements
  const docFilename = document.getElementById('doc-filename');
  const reductionBadge = document.getElementById('reduction-badge');
  const statPages = document.getElementById('stat-pages');
  const statWords = document.getElementById('stat-words');
  const statTime = document.getElementById('stat-time');
  const statTone = document.getElementById('stat-tone');
  const summaryParagraph = document.getElementById('summary-paragraph');
  const findingsContainer = document.getElementById('findings-container');
  const metricsTableBody = document.getElementById('metrics-table-body');
  const sectionsContainer = document.getElementById('sections-container');
  
  // Action Buttons
  const copySummaryBtn = document.getElementById('copy-summary-btn');
  const exportTxtBtn = document.getElementById('export-txt-btn');
  const exportPdfBtn = document.getElementById('export-pdf-btn');
  const resetDocBtn = document.getElementById('reset-doc-btn');

  // State
  let currentSummaryData = null;

  // Initialize PDF.js worker
  if (window.pdfjsLib && !window.pdfjsLib.GlobalWorkerOptions.workerSrc) {
    window.pdfjsLib.GlobalWorkerOptions.workerSrc = '../../assets/lib/pdf.worker.min.js';
  }

  // Drag and Drop Events
  ['dragenter', 'dragover'].forEach(eventName => {
    dropZone.addEventListener(eventName, (e) => {
      e.preventDefault();
      e.stopPropagation();
      dropZone.classList.add('dropzone-active');
    }, false);
  });

  ['dragleave', 'drop'].forEach(eventName => {
    dropZone.addEventListener(eventName, (e) => {
      e.preventDefault();
      e.stopPropagation();
      dropZone.classList.remove('dropzone-active');
    }, false);
  });

  dropZone.addEventListener('drop', (e) => {
    const dt = e.dataTransfer;
    const files = dt.files;
    if (files.length > 0) {
      handlePdfFile(files[0]);
    }
  });

  pdfInput.addEventListener('change', (e) => {
    if (e.target.files.length > 0) {
      handlePdfFile(e.target.files[0]);
    }
  });

  loadSampleBtn.addEventListener('click', () => {
    loadSampleReport();
  });

  resetDocBtn.addEventListener('click', () => {
    resultsWorkspace.classList.add('hidden');
    dropZone.classList.remove('hidden');
    processingState.classList.add('hidden');
    pdfInput.value = '';
    currentSummaryData = null;
  });

  copySummaryBtn.addEventListener('click', () => {
    if (!currentSummaryData) return;
    const textToCopy = `EXECUTIVE SUMMARY:\n${currentSummaryData.executiveSummary}\n\nKEY FINDINGS:\n${currentSummaryData.findings.map(f => '• ' + f).join('\n')}`;
    navigator.clipboard.writeText(textToCopy).then(() => {
      const orig = copySummaryBtn.innerHTML;
      copySummaryBtn.innerHTML = `<span>Copied!</span>`;
      setTimeout(() => copySummaryBtn.innerHTML = orig, 2000);
    });
  });

  exportTxtBtn.addEventListener('click', () => {
    if (!currentSummaryData) return;
    const txtContent = generateBriefText(currentSummaryData);
    downloadFile(txtContent, `${currentSummaryData.filename.replace(/\.[^/.]+$/, "")}-Executive-Brief.txt`, 'text/plain');
  });

  exportPdfBtn.addEventListener('click', () => {
    if (!currentSummaryData) return;
    const element = document.getElementById('export-dossier');
    const opt = {
      margin: [10, 10, 10, 10],
      filename: `${currentSummaryData.filename.replace(/\.[^/.]+$/, "")}-Executive-Brief.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };
    if (window.html2pdf) {
      window.html2pdf().set(opt).from(element).save();
    } else {
      window.print();
    }
  });

  // Handle PDF file reading
  function handlePdfFile(file) {
    if (!file || file.type !== 'application/pdf') {
      alert('Please upload a valid PDF document (.pdf).');
      return;
    }

    dropZone.classList.add('hidden');
    processingState.classList.remove('hidden');
    updateProgress(15, 'Reading document stream...');

    const reader = new FileReader();
    reader.onload = async function() {
      try {
        const typedArray = new Uint8Array(this.result);
        updateProgress(35, 'Parsing PDF pages via PDF.js...');
        
        const pdf = await window.pdfjsLib.getDocument({ data: typedArray }).promise;
        const numPages = pdf.numPages;
        const pageTexts = [];
        let fullText = '';

        for (let i = 1; i <= numPages; i++) {
          updateProgress(35 + Math.round((i / numPages) * 35), `Extracting text from page ${i} of ${numPages}...`);
          const page = await pdf.getPage(i);
          const textContent = await page.getTextContent();
          const pageString = textContent.items.map(item => item.str).join(' ');
          pageTexts.push({ pageNum: i, text: pageString.trim() });
          fullText += ' ' + pageString;
        }

        updateProgress(85, 'Synthesizing NLP condensation and metrics...');
        setTimeout(() => {
          processAndDisplaySummary(file.name, numPages, pageTexts, fullText.trim());
        }, 300);

      } catch (err) {
        console.error('PDF extraction error:', err);
        alert('Could not parse PDF. The file may be password protected or scanned image without text layer.');
        dropZone.classList.remove('hidden');
        processingState.classList.add('hidden');
      }
    };
    reader.readAsArrayBuffer(file);
  }

  function updateProgress(percent, statusMsg) {
    progressBar.style.width = percent + '%';
    if (statusMsg) statusDesc.textContent = statusMsg;
  }

  // Pre-baked Sample Document Loader
  function loadSampleReport() {
    dropZone.classList.add('hidden');
    processingState.classList.remove('hidden');
    updateProgress(20, 'Loading Enterprise AI & Cloud Infrastructure Report...');

    setTimeout(() => {
      updateProgress(60, 'Processing multi-page document tokens...');
      setTimeout(() => {
        const sampleText = getSampleReportText();
        const samplePages = [
          { pageNum: 1, text: sampleText.section1 },
          { pageNum: 2, text: sampleText.section2 },
          { pageNum: 3, text: sampleText.section3 }
        ];
        const combined = `${sampleText.section1} ${sampleText.section2} ${sampleText.section3}`;
        processAndDisplaySummary('Enterprise_AI_Q3_Strategic_Report.pdf', 3, samplePages, combined);
      }, 500);
    }, 400);
  }

  // Core NLP Condensation & Extraction Algorithm
  function processAndDisplaySummary(filename, numPages, pageTexts, fullText) {
    const words = fullText.split(/\s+/).filter(w => w.length > 0);
    const wordCount = words.length;
    const estMinutes = Math.max(1, Math.ceil(wordCount / 200));

    // Sentence extraction
    const rawSentences = splitIntoSentences(fullText);
    const scoredSentences = scoreSentences(rawSentences, fullText);

    // 1. Executive Summary Paragraph: Top 2-3 most representative sentences
    const topSummarySentences = scoredSentences.slice(0, 3).sort((a, b) => a.index - b.index);
    let execSummary = topSummarySentences.map(s => s.text.trim()).join(' ');
    if (!execSummary || execSummary.length < 50) {
      execSummary = rawSentences.slice(0, 2).join(' ') || 'The document contains overview information and technical specifications.';
    }

    // 2. Key Findings: Top 5 distinct salient sentences with trigger highlights
    const keyFindings = extractKeyFindings(scoredSentences, rawSentences);

    // 3. Important Numbers & Dates Table
    const extractedMetrics = extractNumbersAndDates(fullText);

    // 4. Section-by-Section Breakdown
    const sections = analyzeSections(pageTexts, rawSentences);

    // 5. Tone Analysis
    const tone = detectDocumentTone(fullText);

    // 6. Condensation Ratio
    const summaryWords = execSummary.split(/\s+/).length + keyFindings.join(' ').split(/\s+/).length;
    const reductionRate = Math.max(45, Math.min(92, Math.round((1 - (summaryWords / Math.max(wordCount, summaryWords + 1))) * 100)));

    currentSummaryData = {
      filename,
      numPages,
      wordCount,
      estMinutes,
      tone,
      reductionRate,
      executiveSummary: execSummary,
      findings: keyFindings,
      metrics: extractedMetrics,
      sections
    };

    // Render UI
    renderResults(currentSummaryData);

    processingState.classList.add('hidden');
    resultsWorkspace.classList.remove('hidden');
  }

  function renderResults(data) {
    docFilename.textContent = data.filename;
    reductionBadge.textContent = `${data.reductionRate}% Condensed`;
    statPages.textContent = data.numPages;
    statWords.textContent = data.wordCount.toLocaleString();
    statTime.textContent = `${data.estMinutes} min`;
    statTone.textContent = data.tone;

    summaryParagraph.textContent = data.executiveSummary;

    // Render findings
    findingsContainer.innerHTML = '';
    data.findings.forEach((finding, idx) => {
      const li = document.createElement('li');
      li.className = 'finding-item';
      li.innerHTML = `
        <span class="finding-bullet">${idx + 1}</span>
        <div>${highlightKeyTerms(finding)}</div>
      `;
      findingsContainer.appendChild(li);
    });

    // Render Metrics Table
    metricsTableBody.innerHTML = '';
    if (data.metrics.length === 0) {
      metricsTableBody.innerHTML = `<tr><td colspan="3" style="text-align:center; color: var(--text-secondary); padding: 1.5rem;">No explicit numeric metrics or dates detected.</td></tr>`;
    } else {
      data.metrics.forEach(m => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
          <td><strong style="color: var(--accent); font-family: monospace; font-size: 0.95rem;">${escapeHtml(m.value)}</strong></td>
          <td><span class="pill-badge">${escapeHtml(m.category)}</span></td>
          <td style="color: var(--text-secondary);">${escapeHtml(m.context)}</td>
        `;
        metricsTableBody.appendChild(tr);
      });
    }

    // Render Sections Breakdown
    sectionsContainer.innerHTML = '';
    data.sections.forEach(sec => {
      const div = document.createElement('div');
      div.className = 'breakdown-card';
      div.innerHTML = `
        <div class="breakdown-header">
          <strong style="color: var(--text-primary); font-size: 0.95rem;">${escapeHtml(sec.title)}</strong>
          <span class="pill-badge" style="font-size: 0.7rem;">${sec.wordCount} words</span>
        </div>
        <p style="color: var(--text-secondary); font-size: 0.875rem; margin: 0; line-height: 1.6;">${escapeHtml(sec.summary)}</p>
      `;
      sectionsContainer.appendChild(div);
    });
  }

  // Sentence Tokenization
  function splitIntoSentences(text) {
    const normalized = text
      .replace(/(\r\n|\n|\r)/gm, " ")
      .replace(/\s+/g, " ")
      .replace(/([A-Z]\.)\s+/g, "$1_PROTECT_"); // protect initials
    
    const rawMatches = normalized.match(/[^.!?]+[.!?]+/g) || [text];
    return rawMatches
      .map(s => s.replace(/_PROTECT_/g, " ").trim())
      .filter(s => s.length > 25);
  }

  // Frequency-based sentence scoring
  function scoreSentences(sentences, fullText) {
    const stopWords = new Set([
      'the','be','to','of','and','a','in','that','have','i','it','for','not','on','with','he','as','you',
      'do','at','this','but','his','by','from','they','we','say','her','she','or','an','will','my','one',
      'all','would','there','their','what','so','up','out','if','about','who','get','which','go','me',
      'when','make','can','like','time','no','just','him','know','take','people','into','year','your',
      'good','some','could','them','see','other','than','then','now','look','only','come','its','over',
      'think','also','back','after','use','two','how','our','work','first','well','way','even','new','want',
      'because','any','these','give','day','most','us','is','are','was','were','has','had','been'
    ]);

    const wordFreq = {};
    const words = fullText.toLowerCase().replace(/[^a-z0-9\s]/g, '').split(/\s+/);
    words.forEach(w => {
      if (w.length > 3 && !stopWords.has(w)) {
        wordFreq[w] = (wordFreq[w] || 0) + 1;
      }
    });

    const triggerKeywords = [
      'conclude', 'concluded', 'demonstrates', 'revealed', 'increase', 'increased', 'decrease',
      'growth', 'revenue', 'result', 'results', 'critical', 'significant', 'recommended',
      'objective', 'forecast', 'impact', 'performance', 'strategic', 'priority', 'achieved',
      'investment', 'margin', 'expand', 'challenge', 'solution', 'findings', 'summary'
    ];

    return sentences.map((sent, index) => {
      const lower = sent.toLowerCase();
      let score = 0;
      const sentWords = lower.replace(/[^a-z0-9\s]/g, '').split(/\s+/);

      sentWords.forEach(w => {
        if (wordFreq[w]) {
          score += wordFreq[w];
        }
      });

      // Bonus for trigger keywords
      triggerKeywords.forEach(kw => {
        if (lower.includes(kw)) score += 15;
      });

      // Position bias (earlier sentences in introductory sections tend to be summaries)
      if (index === 0) score += 20;
      if (index < 5) score += 10;

      // Penalize excessively long or short sentences
      if (sentWords.length < 8 || sentWords.length > 55) {
        score *= 0.6;
      }

      return {
        text: sent,
        index,
        score
      };
    }).sort((a, b) => b.score - a.score);
  }

  // Key Findings Extractor
  function extractKeyFindings(scoredSentences, rawSentences) {
    const candidates = [];
    const usedTexts = new Set();

    // Prefer high scored sentences that have strong verbs
    for (const item of scoredSentences) {
      const t = item.text.trim();
      if (!usedTexts.has(t) && t.length > 40 && t.length < 240) {
        candidates.push(t);
        usedTexts.add(t);
        if (candidates.length >= 5) break;
      }
    }

    if (candidates.length < 3) {
      rawSentences.slice(0, 4).forEach(s => {
        if (!usedTexts.has(s.trim())) candidates.push(s.trim());
      });
    }

    return candidates;
  }

  // Extraction of Numbers, Percentages, Currency, and Dates
  function extractNumbersAndDates(fullText) {
    const results = [];
    const seen = new Set();

    // Regex for numbers, currencies, percentages, dates
    const patterns = [
      { regex: /\$\s?([0-9]{1,3}(?:,[0-9]{3})*(?:\.[0-9]+)?\s?(?:billion|million|trillion|B|M|K)?)/gi, cat: 'Financial / Currency' },
      { regex: /([0-9]+(?:\.[0-9]+)?%)/g, cat: 'Percentage / Growth' },
      { regex: /\b(Q[1-4]\s?(?:202[0-9]|203[0-9])|(?:January|February|March|April|May|June|July|August|September|October|November|December)\s+\d{1,2},?\s+202[0-9]|\d{1,2}\/\d{1,2}\/202[0-9]|202[0-9]-203[0-9])\b/gi, cat: 'Key Date / Period' },
      { regex: /\b([0-9]{1,3}(?:,[0-9]{3})+)\s+(?:users|units|customers|subscribers|servers|requests|transactions)\b/gi, cat: 'Operational Scale' }
    ];

    patterns.forEach(p => {
      let match;
      while ((match = p.regex.exec(fullText)) !== null) {
        const val = match[0].trim();
        if (seen.has(val.toLowerCase()) || val.length > 30) continue;
        seen.add(val.toLowerCase());

        // Extract context window around match
        const start = Math.max(0, match.index - 50);
        const end = Math.min(fullText.length, match.index + match[0].length + 60);
        let snippet = fullText.substring(start, end).replace(/\s+/g, ' ').trim();
        if (start > 0) snippet = '...' + snippet;
        if (end < fullText.length) snippet += '...';

        results.push({
          value: val,
          category: p.cat,
          context: snippet
        });

        if (results.length >= 8) break;
      }
    });

    return results;
  }

  // Section Breakdown Analysis
  function analyzeSections(pageTexts, rawSentences) {
    if (pageTexts.length > 1) {
      return pageTexts.map((p, idx) => {
        const pSentences = splitIntoSentences(p.text);
        const pScore = scoreSentences(pSentences, p.text);
        const summary = pScore.length > 0 ? pScore[0].text : (pSentences[0] || 'No dense text content detected on this page.');
        const words = p.text.split(/\s+/).filter(w => w.length > 0).length;
        
        return {
          title: `Section / Page ${p.pageNum}`,
          summary: summary.trim(),
          wordCount: words
        };
      });
    }

    // Single page document: break by paragraph chunks
    const paragraphs = rawSentences;
    const chunkSize = Math.max(3, Math.ceil(paragraphs.length / 3));
    const chunks = [];
    for (let i = 0; i < paragraphs.length; i += chunkSize) {
      const slice = paragraphs.slice(i, i + chunkSize);
      const text = slice.join(' ');
      chunks.push({
        title: `Topic Segment ${Math.floor(i / chunkSize) + 1}`,
        summary: slice[0] || 'Core discussion area.',
        wordCount: text.split(/\s+/).length
      });
    }
    return chunks;
  }

  // Document Tone Classification
  function detectDocumentTone(text) {
    const lower = text.toLowerCase();
    const financialMatches = (lower.match(/revenue|ebitda|margin|fiscal|q[1-4]|cash|profit|investment|quarter/g) || []).length;
    const legalMatches = (lower.match(/hereby|pursuant|clause|liability|governed|agreement|terms|jurisdiction/g) || []).length;
    const technicalMatches = (lower.match(/architecture|algorithm|latency|infrastructure|pipeline|cloud|api|cluster/g) || []).length;
    const academicMatches = (lower.match(/hypothesis|methodology|participants|experiment|literature|findings|citation/g) || []).length;

    const scores = [
      { tone: 'Financial & Strategic', count: financialMatches },
      { tone: 'Legal & Compliance', count: legalMatches },
      { tone: 'Technical & Engineering', count: technicalMatches },
      { tone: 'Academic & Research', count: academicMatches }
    ];

    scores.sort((a, b) => b.count - a.count);
    return scores[0].count > 3 ? scores[0].tone : 'Analytical & Professional';
  }

  // Helper text highlights
  function highlightKeyTerms(text) {
    const escaped = escapeHtml(text);
    return escaped.replace(/\b(increased|growth|revenue|critical|decreased|achieved|projected|significant|key|vital|improved)\b/gi, (match) => {
      return `<strong style="color: var(--accent);">${match}</strong>`;
    });
  }

  function escapeHtml(str) {
    if (!str) return '';
    return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;");
  }

  function generateBriefText(data) {
    return `=====================================================
EXECUTIVE DOCUMENT BRIEF
Source: ${data.filename}
Total Pages: ${data.numPages} | Word Count: ${data.wordCount} | Est. Reading Time: ${data.estMinutes} min
Document Tone: ${data.tone} | Condensation Ratio: ${data.reductionRate}%
=====================================================

1. EXECUTIVE SUMMARY:
${data.executiveSummary}

2. KEY FINDINGS & STRATEGIC HIGHLIGHTS:
${data.findings.map((f, i) => `[${i + 1}] ${f}`).join('\n')}

3. IMPORTANT METRICS & CRITICAL DATES:
${data.metrics.map(m => `• ${m.value} (${m.category}): ${m.context}`).join('\n')}

4. STRUCTURAL BREAKDOWN:
${data.sections.map(s => `[${s.title}] (${s.wordCount} words)\n${s.summary}\n`).join('\n')}

Generated via ALL IN ONE AI Document Intelligence Studio.
`;
  }

  function downloadFile(content, fileName, contentType) {
    const a = document.createElement("a");
    const file = new Blob([content], { type: contentType });
    a.href = URL.createObjectURL(file);
    a.download = fileName;
    a.click();
    URL.revokeObjectURL(a.href);
  }

  // Realistic sample document text
  function getSampleReportText() {
    return {
      section1: "Global Enterprise Cloud & AI Infrastructure Quarterly Performance Report. In Q3 2026, enterprise cloud adoption reached an unprecedented milestone, expanding by 34.2% year-over-year to total $78.4 billion in global infrastructure expenditure. The primary catalyst for this accelerated transition has been the widespread deployment of localized generative AI inference pipelines across Fortune 500 organizations. Organizations that adopted hybrid multi-cluster GPU virtualization achieved a 42% reduction in compute overhead while accelerating model response times by 3.8x. Operational efficiency metrics demonstrate that automated workload orchestration decreased unscheduled system downtime to under 0.004%, setting a new benchmark for mission-critical digital services.",
      section2: "Regional Market Adoption and Financial Capital Allocation. Capital expenditure across North America grew to $41.2 billion, followed by European enterprise spending at $22.5 billion, and Asia-Pacific reaching $14.7 billion by September 30, 2026. Key findings indicate that enterprise leaders prioritized data sovereignty and regulatory compliance, reallocating 28% of overall IT budgets toward zero-trust data protection architectures. Significant cost optimizations were recorded in distributed serverless pipelines, yielding an average annual cost savings of $1,250,000 per enterprise tier. However, supply constraints on next-generation accelerators remain a persistent operational bottleneck, extending lead times to 16 weeks across tier-1 cloud providers.",
      section3: "Strategic Outlook and 2027 Projections. Looking forward to fiscal year 2027, total artificial intelligence infrastructure investments are forecasted to surpass $120 billion globally. The executive committee recommends immediate investments in low-latency edge inference hubs and private container fabrics to mitigate potential network saturation risks. Furthermore, strict adherence to upcoming European AI Act governance standards will become mandatory by December 15, 2026. In conclusion, early technology adopters who institutionalize automated cost monitoring and decentralized compliance frameworks will maintain a definitive competitive moat over the subsequent 36 months."
    };
  }
});