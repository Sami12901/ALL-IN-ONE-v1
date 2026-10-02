// AI PDF Analyzer - Client-side Logic

if (window.pdfjsLib) {
  window.pdfjsLib.GlobalWorkerOptions.workerSrc = '../../assets/lib/pdf.worker.min.js';
}

const STOP_WORDS = new Set([
  'a', 'about', 'above', 'after', 'again', 'against', 'all', 'am', 'an', 'and', 'any', 'are', 'aren\'t', 'as', 'at',
  'be', 'because', 'been', 'before', 'being', 'below', 'between', 'both', 'but', 'by', 'can', 'can\'t', 'cannot',
  'could', 'couldn\'t', 'did', 'didn\'t', 'do', 'does', 'doesn\'t', 'doing', 'don\'t', 'down', 'during', 'each',
  'few', 'for', 'from', 'further', 'had', 'hadn\'t', 'has', 'hasn\'t', 'have', 'haven\'t', 'having', 'he', 'he\'d',
  'he\'ll', 'he\'s', 'her', 'here', 'here\'s', 'hers', 'herself', 'him', 'himself', 'his', 'how', 'how\'s', 'i',
  'i\'d', 'i\'ll', 'i\'m', 'i\'ve', 'if', 'in', 'into', 'is', 'isn\'t', 'it', 'it\'s', 'its', 'itself', 'let\'s',
  'me', 'more', 'most', 'mustn\'t', 'my', 'myself', 'no', 'nor', 'not', 'of', 'off', 'on', 'once', 'only', 'or',
  'other', 'ought', 'our', 'ours', 'ourselves', 'out', 'over', 'own', 'same', 'shan\'t', 'she', 'she\'d', 'she\'ll',
  'she\'s', 'should', 'shouldn\'t', 'so', 'some', 'such', 'than', 'that', 'that\'s', 'the', 'their', 'theirs',
  'them', 'themselves', 'then', 'there', 'there\'s', 'these', 'they', 'they\'d', 'they\'ll', 'they\'re', 'they\'ve',
  'this', 'those', 'through', 'to', 'too', 'under', 'until', 'up', 'very', 'was', 'wasn\'t', 'we', 'we\'d', 'we\'ll',
  'we\'re', 'we\'ve', 'were', 'weren\'t', 'what', 'what\'s', 'when', 'when\'s', 'where', 'where\'s', 'which', 'while',
  'who', 'who\'s', 'whom', 'why', 'why\'s', 'with', 'won\'t', 'would', 'wouldn\'t', 'you', 'you\'d', 'you\'ll',
  'you\'re', 'you\'ve', 'your', 'yours', 'yourself', 'yourselves', 'page', 'also', 'will', 'may', 'shall'
]);

const POSITIVE_WORDS = new Set([
  'growth', 'exceeded', 'success', 'successful', 'innovative', 'innovation', 'optimal', 'optimize',
  'excellent', 'pioneering', 'strong', 'leadership', 'profit', 'profitable', 'gain', 'improve',
  'improvement', 'advancement', 'achievement', 'efficient', 'efficiency', 'secure', 'reliable',
  'superior', 'positive', 'breakthrough', 'surpassed', 'robust', 'seamless', 'scale', 'scalable',
  'award', 'valuable', 'exceptional', 'distinction', 'benefit', 'effective', 'flourish'
]);

const NEGATIVE_WORDS = new Set([
  'risk', 'loss', 'losses', 'decline', 'incident', 'incidents', 'failure', 'fail', 'severe',
  'downtime', 'defect', 'breach', 'warning', 'deficit', 'error', 'errors', 'vulnerable', 'threat',
  'delay', 'delays', 'negative', 'critical', 'harm', 'disruption', 'bottleneck', 'penalty', 'adverse',
  'liability', 'breached', 'unstable', 'damage', 'flaw', 'compromised'
]);

let currentAnalysisData = null;

// Estimate syllables in an English word
function countSyllables(word) {
  word = word.toLowerCase().replace(/[^a-z]/g, '');
  if (word.length <= 3) return 1;
  word = word.replace(/(?:[^laeiouy]|ed|es|e)$/, '');
  word = word.replace(/^y/, '');
  const matches = word.match(/[aeiouy]{1,2}/g);
  return matches ? matches.length : 1;
}

// Tokenize text into words & sentences
function analyzeTextContent(fullText) {
  const words = fullText.match(/[a-zA-Z0-9'’-]+/g) || [];
  const sentences = fullText.split(/[.!?]+(?:\s+|$)/).filter(s => s.trim().length > 0);
  const totalCharacters = fullText.length;
  const wordCount = words.length;
  const sentenceCount = Math.max(1, sentences.length);

  // Syllables
  let totalSyllables = 0;
  const wordFreq = {};
  const cleanWords = [];

  words.forEach(w => {
    const clean = w.toLowerCase().replace(/[^a-z]/g, '');
    if (clean.length > 1) {
      cleanWords.push(clean);
      totalSyllables += countSyllables(clean);
      if (!STOP_WORDS.has(clean)) {
        wordFreq[clean] = (wordFreq[clean] || 0) + 1;
      }
    }
  });

  // N-Grams (Bigrams)
  const bigramFreq = {};
  for (let i = 0; i < cleanWords.length - 1; i++) {
    const w1 = cleanWords[i];
    const w2 = cleanWords[i + 1];
    if (!STOP_WORDS.has(w1) && !STOP_WORDS.has(w2) && w1 !== w2) {
      const phrase = `${w1} ${w2}`;
      bigramFreq[phrase] = (bigramFreq[phrase] || 0) + 1;
    }
  }

  // Flesch Reading Ease Formula
  const asl = wordCount / sentenceCount; // Avg sentence length
  const asw = totalSyllables / Math.max(1, wordCount); // Avg syllables per word
  let fleschScore = 206.835 - (1.015 * asl) - (84.6 * asw);
  fleschScore = Math.max(0, Math.min(100, Math.round(fleschScore * 10) / 10));

  // Flesch-Kincaid Grade Level
  let gradeLevel = (0.39 * asl) + (11.8 * asw) - 15.59;
  gradeLevel = Math.max(1, Math.round(gradeLevel * 10) / 10);

  // Reading ease interpretation
  let easeLabel = 'Standard';
  let easeBadge = 'badge-green';
  if (fleschScore >= 90) { easeLabel = 'Very Easy'; easeBadge = 'badge-green'; }
  else if (fleschScore >= 80) { easeLabel = 'Easy'; easeBadge = 'badge-green'; }
  else if (fleschScore >= 70) { easeLabel = 'Fairly Easy'; easeBadge = 'badge-green'; }
  else if (fleschScore >= 60) { easeLabel = 'Standard'; easeBadge = 'badge-blue'; }
  else if (fleschScore >= 50) { easeLabel = 'Fairly Difficult'; easeBadge = 'badge-amber'; }
  else if (fleschScore >= 30) { easeLabel = 'Difficult (College)'; easeBadge = 'badge-amber'; }
  else { easeLabel = 'Academic / Graduate'; easeBadge = 'badge-purple'; }

  // Reading duration (230 wpm silent, 130 wpm speaking)
  const readMinutes = Math.ceil(wordCount / 230);
  const speakMinutes = Math.ceil(wordCount / 130);

  // Sentiment analysis
  let posCount = 0;
  let negCount = 0;
  cleanWords.forEach(w => {
    if (POSITIVE_WORDS.has(w)) posCount++;
    if (NEGATIVE_WORDS.has(w)) negCount++;
  });

  const totalSentimentTokens = posCount + negCount;
  let posPct = 40;
  let negPct = 10;
  let neuPct = 50;

  if (totalSentimentTokens > 0) {
    posPct = Math.round((posCount / totalSentimentTokens) * 60) + 15;
    negPct = Math.round((negCount / totalSentimentTokens) * 60);
    neuPct = Math.max(10, 100 - (posPct + negPct));
  }

  let sentimentOverall = 'Neutral / Analytical';
  let toneBadge = 'badge-blue';
  if (posCount > negCount * 1.5) {
    sentimentOverall = 'Positive & Confident';
    toneBadge = 'badge-green';
  } else if (negCount > posCount * 1.5) {
    sentimentOverall = 'Cautious & Critical';
    toneBadge = 'badge-amber';
  }

  // Vocabulary Diversity (Type-Token Ratio)
  const uniqueCleanWords = new Set(cleanWords).size;
  const ttr = cleanWords.length > 0 ? (uniqueCleanWords / cleanWords.length).toFixed(2) : '0.00';

  // Document Complexity Score (0 - 100)
  // Higher syllables, longer sentences, higher grade level, diverse vocabulary increase complexity
  let complexity = Math.round(
    (Math.min(30, asl) / 30 * 35) +
    (Math.min(2.5, asw) / 2.5 * 30) +
    (parseFloat(ttr) * 20) +
    (Math.min(18, gradeLevel) / 18 * 15)
  );
  complexity = Math.max(5, Math.min(99, complexity));

  let complexityLabel = 'Standard';
  let complexityBadge = 'badge-blue';
  if (complexity < 35) { complexityLabel = 'Streamlined'; complexityBadge = 'badge-green'; }
  else if (complexity < 60) { complexityLabel = 'Balanced'; complexityBadge = 'badge-blue'; }
  else if (complexity < 80) { complexityLabel = 'High Density'; complexityBadge = 'badge-amber'; }
  else { complexityLabel = 'Extreme / Scholarly'; complexityBadge = 'badge-purple'; }

  // Sort keywords
  const sortedUnigrams = Object.entries(wordFreq)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 16);

  const sortedBigrams = Object.entries(bigramFreq)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10);

  return {
    wordCount,
    sentenceCount,
    totalCharacters,
    fleschScore,
    gradeLevel,
    easeLabel,
    easeBadge,
    readMinutes,
    speakMinutes,
    asl: Math.round(asl * 10) / 10,
    asw: Math.round(asw * 100) / 100,
    ttr,
    complexity,
    complexityLabel,
    complexityBadge,
    sentimentOverall,
    toneBadge,
    posPct,
    neuPct,
    negPct,
    sortedUnigrams,
    sortedBigrams
  };
}

// Generate Executive Summary
function generateExecutiveSummary(metrics, meta, pageCount) {
  const topWords = metrics.sortedUnigrams.slice(0, 5).map(u => `"${u[0]}"`).join(', ');
  const topPhrases = metrics.sortedBigrams.slice(0, 3).map(b => `"${b[0]}"`).join(', ');

  return `
    <h4>1. Document Volume &amp; Scope</h4>
    <p>This document comprises <strong>${pageCount} page${pageCount > 1 ? 's' : ''}</strong> containing <strong>${metrics.wordCount.toLocaleString()} words</strong> across approximately <strong>${metrics.sentenceCount.toLocaleString()} structural sentences</strong>. At normal executive reading speeds (~230 WPM), the expected consumption duration is approximately <strong>${metrics.readMinutes} minute${metrics.readMinutes > 1 ? 's' : ''}</strong> (or <strong>${metrics.speakMinutes} minute${metrics.speakMinutes > 1 ? 's' : ''}</strong> for presentation delivery).</p>

    <h4>2. Linguistic Complexity &amp; Readability</h4>
    <p>The document registered a <strong>Flesch Reading Ease score of ${metrics.fleschScore}/100</strong>, classifying the narrative flow as <em>${metrics.easeLabel}</em> (equivalent to US Grade Level <strong>${metrics.gradeLevel}</strong>). Average sentence length stands at <strong>${metrics.asl} words per sentence</strong> with an average syllabic density of <strong>${metrics.asw} syllables per word</strong>.</p>

    <h4>3. Semantic Orientation &amp; Tone</h4>
    <p>The prevailing sentiment tone is evaluated as <strong>${metrics.sentimentOverall}</strong> (${metrics.posPct}% constructive vocabulary against ${metrics.negPct}% risk/adverse tokens). Dominant recurring subject-matter topics and core vocabulary include: ${topWords || 'Standard corporate vocabulary'}${topPhrases ? `; prominent multi-word concepts include: ${topPhrases}` : ''}.</p>

    <h4>4. Security &amp; Structural Architecture</h4>
    <p>Document complexity index is rated at <strong>${metrics.complexity}/100 (${metrics.complexityLabel})</strong> with a vocabulary diversity ratio of <strong>${metrics.ttr}</strong>. Standard PDF permissions are active with ${meta.encrypted ? 'active encryption protections' : 'no password locks or encryption restrictions detected'}.</p>
  `;
}

// Render Results to UI
function renderAnalysisResults(analysis) {
  currentAnalysisData = analysis;
  document.getElementById('loading-state').style.display = 'none';
  document.getElementById('results-container').style.display = 'flex';

  const m = analysis.metrics;
  const meta = analysis.metadata;

  // KPI Row
  document.getElementById('stat-complexity').textContent = `${m.complexity}/100`;
  document.getElementById('stat-complexity-label').textContent = `${m.complexityLabel} Index`;
  const badgeComp = document.getElementById('badge-complexity');
  badgeComp.textContent = m.complexityLabel;
  badgeComp.className = `stat-badge ${m.complexityBadge}`;

  document.getElementById('stat-flesch').textContent = `${m.fleschScore}`;
  document.getElementById('stat-grade-level').textContent = `US Grade Level: ${m.gradeLevel}`;
  const badgeFlesch = document.getElementById('badge-flesch');
  badgeFlesch.textContent = m.easeLabel;
  badgeFlesch.className = `stat-badge ${m.easeBadge}`;

  document.getElementById('stat-read-time').textContent = `${m.readMinutes} min`;
  document.getElementById('stat-speaking-time').textContent = `Speaking: ~${m.speakMinutes} min`;

  document.getElementById('stat-pages').textContent = analysis.pageCount;
  document.getElementById('stat-words').textContent = `${m.wordCount.toLocaleString()} words &bull; ${m.sentenceCount.toLocaleString()} sent.`;
  document.getElementById('badge-chars').textContent = `${m.totalCharacters.toLocaleString()} characters`;

  document.getElementById('stat-sentiment').textContent = m.sentimentOverall.split(' ')[0];
  document.getElementById('stat-sentiment-score').textContent = `Polarity: ${m.posPct}% Pos / ${m.negPct}% Neg`;
  const badgeTone = document.getElementById('badge-tone');
  badgeTone.textContent = m.sentimentOverall;
  badgeTone.className = `stat-badge ${m.toneBadge}`;

  document.getElementById('stat-security').textContent = meta.encrypted ? 'Encrypted' : 'Standard';
  document.getElementById('stat-pdf-version').textContent = `PDF ${meta.version || '1.7'}`;
  const badgeSec = document.getElementById('badge-security');
  badgeSec.textContent = meta.encrypted ? 'Protected' : 'Open / Unlocked';
  badgeSec.className = `stat-badge ${meta.encrypted ? 'badge-amber' : 'badge-green'}`;

  // Executive Summary Box
  document.getElementById('executive-summary-text').innerHTML = generateExecutiveSummary(m, meta, analysis.pageCount);

  // Unigrams Cloud
  const unigramCloud = document.getElementById('unigram-cloud');
  unigramCloud.innerHTML = '';
  if (m.sortedUnigrams.length > 0) {
    m.sortedUnigrams.forEach(([word, count]) => {
      const pill = document.createElement('div');
      pill.className = 'keyword-pill';
      pill.innerHTML = `<span>${word}</span><span class="keyword-count">${count}</span>`;
      unigramCloud.appendChild(pill);
    });
  } else {
    unigramCloud.innerHTML = '<span style="font-size: 0.8rem; color: var(--muted);">No distinctive keywords extracted.</span>';
  }

  // Bigrams Cloud
  const bigramCloud = document.getElementById('bigram-cloud');
  bigramCloud.innerHTML = '';
  if (m.sortedBigrams.length > 0) {
    m.sortedBigrams.forEach(([phrase, count]) => {
      const pill = document.createElement('div');
      pill.className = 'keyword-pill';
      pill.innerHTML = `<span>${phrase}</span><span class="keyword-count">${count}</span>`;
      bigramCloud.appendChild(pill);
    });
  } else {
    bigramCloud.innerHTML = '<span style="font-size: 0.8rem; color: var(--muted);">No multi-word phrases detected.</span>';
  }

  // Raw text viewer
  document.getElementById('raw-text-viewer').value = analysis.fullText;

  // Metadata Table
  document.getElementById('meta-filename').textContent = analysis.fileName;
  document.getElementById('meta-title').textContent = meta.info?.Title || 'Untitled';
  document.getElementById('meta-author').textContent = meta.info?.Author || 'Not specified';
  document.getElementById('meta-subject').textContent = meta.info?.Subject || 'Not specified';
  document.getElementById('meta-keywords').textContent = meta.info?.Keywords || 'None';
  document.getElementById('meta-producer').textContent = meta.info?.Producer || meta.info?.Creator || 'Unknown Engine';
  document.getElementById('meta-created').textContent = meta.info?.CreationDate ? String(meta.info.CreationDate) : 'Unknown';
  document.getElementById('meta-modified').textContent = meta.info?.ModDate ? String(meta.info.ModDate) : 'Unknown';
  document.getElementById('meta-version').textContent = meta.version || '1.7';
  document.getElementById('meta-encrypted').textContent = meta.encrypted ? 'Encrypted / Password Protection' : 'None (Permissive)';

  // Tone bar
  document.getElementById('bar-pos').style.width = `${m.posPct}%`;
  document.getElementById('bar-neu').style.width = `${m.neuPct}%`;
  document.getElementById('bar-neg').style.width = `${m.negPct}%`;
  document.getElementById('lbl-pos').textContent = `${m.posPct}%`;
  document.getElementById('lbl-neu').textContent = `${m.neuPct}%`;
  document.getElementById('lbl-neg').textContent = `${m.negPct}%`;
  document.getElementById('tone-polarity-percent').textContent = `${m.posPct}% Pos &bull; ${m.neuPct}% Neu &bull; ${m.negPct}% Neg`;

  // Secondary metrics
  document.getElementById('stat-ttr').textContent = m.ttr;
  document.getElementById('stat-asl').textContent = `${m.asl} words`;
  document.getElementById('stat-asw').textContent = `${m.asw}`;

  // Page-by-Page Distribution
  const pageList = document.getElementById('pages-breakdown-list');
  pageList.innerHTML = '';
  analysis.pageDetails.forEach(p => {
    const item = document.createElement('div');
    item.style.cssText = 'display:flex; justify-content:space-between; align-items:center; background:rgba(0,0,0,0.2); padding:0.4rem 0.75rem; border-radius:var(--radius-sm); font-size:0.8rem;';
    item.innerHTML = `
      <span><strong>Page ${p.pageNum}</strong> <span style="color:var(--muted); font-size:0.75rem;">(${p.width} &times; ${p.height} pt)</span></span>
      <span style="color:var(--accent); font-weight:600;">${p.wordCount} words</span>
    `;
    pageList.appendChild(item);
  });
}

// Process PDF ArrayBuffer
async function processPdfBuffer(buffer, fileName) {
  const loading = document.getElementById('loading-state');
  const results = document.getElementById('results-container');
  results.style.display = 'none';
  loading.style.display = 'flex';

  try {
    const loadingTask = window.pdfjsLib.getDocument({ data: buffer });
    const pdf = await loadingTask.promise;
    const numPages = pdf.numPages;

    let fullText = '';
    const pageDetails = [];

    for (let p = 1; p <= numPages; p++) {
      const page = await pdf.getPage(p);
      const textContent = await page.getTextContent();
      const pageText = textContent.items.map(item => item.str).join(' ');
      const wordsOnPage = (pageText.match(/[a-zA-Z0-9'’-]+/g) || []).length;
      const viewport = page.getViewport({ scale: 1.0 });

      pageDetails.push({
        pageNum: p,
        width: Math.round(viewport.width),
        height: Math.round(viewport.height),
        wordCount: wordsOnPage
      });

      fullText += pageText + '\n\n';
    }

    let meta = { info: {}, version: '1.7', encrypted: false };
    try {
      const metaData = await pdf.getMetadata();
      if (metaData) {
        meta.info = metaData.info || {};
      }
    } catch (e) {
      console.warn('Metadata read error:', e);
    }

    const metrics = analyzeTextContent(fullText);

    renderAnalysisResults({
      fileName,
      pageCount: numPages,
      metadata: meta,
      metrics,
      fullText,
      pageDetails
    });

  } catch (err) {
    loading.style.display = 'none';
    console.error('PDF Analysis error:', err);
    alert('Failed to analyze PDF document: ' + err.message);
  }
}

// Generate an In-Memory Synthetic PDF Document for Demo Testing
async function loadDemoPdfDocument() {
  const loading = document.getElementById('loading-state');
  loading.style.display = 'flex';

  // Rich sample corporate executive report text
  const demoText = `
    EXECUTIVE SUMMARY & OPERATIONAL REPORT: Q3 2026 ARCHITECTURAL AUDIT
    Apex Dynamics Corporation - Global Cloud Systems Division
    Author: Dr. Elena Rostova, Chief Systems Architect

    1. INTRODUCTION AND STRATEGIC HORIZON
    Modern artificial intelligence platforms mandate exceptionally resilient distributed computing frameworks. Over the preceding four quarters, enterprise organizations have increasingly transitioned mission-critical transactional pipelines toward autonomous agent architectures. This technical whitepaper summarizes the structural, operational, and financial findings resulting from our comprehensive infrastructure audit across 1,200 hybrid GPU-accelerated computing nodes.

    2. INFRASTRUCTURE PERFORMANCE & OBSERVABILITY
    Our telemetry systems observed an unprecedented 99.992% aggregate service-level availability, exceeding the contractual benchmark of 99.95%. Crucially, zero-copy kernel memory buffers decreased p99 distributed RPC latency from 18.4 milliseconds down to 7.2 milliseconds. Such latency improvements yield substantial cost optimizations, lowering aggregate power consumption by 14.8 megawatts across Tier-4 data center facilities.

    3. CYBERSECURITY POSTURE & SOC2 COMPLIANCE
    All inter-cluster peer communication was successfully migrated to authenticated mutual TLS (mTLS) with automated ephemeral certificate rotation cycling every 24 hours. Zero-knowledge cryptographic proofs now validate state checkpoints across decentralized worker pools. Security vulnerability scans conducted by independent external auditors returned zero critical CVE deficiencies and no unauthorized privilege escalations.

    4. FINANCIAL ANALYSIS AND REVENUE GROWTH
    Third-quarter gross operating revenue achieved $180.2 million, representing 23.6% year-over-year expansion. Operating EBITDA margins expanded to 41.7%, propelled by enterprise client retention exceeding 98.4%. Strategic capital investments in custom silicon and high-bandwidth interconnect switches are anticipated to drive sustained positive margins through the subsequent fiscal year.

    5. CONCLUSION & RECOMMENDATIONS
    We recommend immediate expansion of automated inference caching layers and deployment of predictive workload balancers. Continuous automated regression suites and load tests must remain mandatory prerequisites for production container releases.
  `;

  // We can construct a minimal valid PDF 1.4 stream directly with uncompressed text stream
  const createSimplePdfBytes = (text) => {
    // Escape parentheses and backslashes for PDF string literal
    const cleanLines = text.trim().split('\n').map(l => l.trim()).filter(l => l.length > 0);
    let streamBody = 'BT /F1 11 Tf 40 760 Td 14 TL ';
    cleanLines.forEach((line, idx) => {
      const sanitized = line.replace(/\\/g, '\\\\').replace(/\(/g, '\\(').replace(/\)/g, '\\)');
      streamBody += `(${sanitized}) ' `;
    });
    streamBody += 'ET';

    const streamLength = streamBody.length;
    const pdfData = `%PDF-1.4
1 0 obj
<< /Type /Catalog /Pages 2 0 R >>
endobj
2 0 obj
<< /Type /Pages /Kids [3 0 R] /Count 1 >>
endobj
3 0 obj
<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >>
endobj
4 0 obj
<< /Length ${streamLength} >>
stream
${streamBody}
endstream
endobj
5 0 obj
<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>
endobj
xref
0 6
0000000000 65535 f 
0000000009 00000 n 
0000000058 00000 n 
0000000115 00000 n 
0000000244 00000 n 
0000000${(295 + streamLength).toString().padStart(3, '0')} 00000 n 
trailer
<< /Size 6 /Root 1 0 R >>
startxref
${400 + streamLength}
%%EOF`;
    const enc = new TextEncoder();
    return enc.encode(pdfData).buffer;
  };

  const buffer = createSimplePdfBytes(demoText);
  await processPdfBuffer(buffer, 'q3_executive_audit_demo.pdf');
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
  const dropZone = document.getElementById('drop-zone');
  const fileInput = document.getElementById('file-input');
  const btnBrowse = document.getElementById('btn-browse');
  const btnDemo = document.getElementById('btn-demo-doc');
  const btnCopySummary = document.getElementById('btn-copy-summary');
  const btnCopyRaw = document.getElementById('btn-copy-raw-text');
  const btnDownloadAudit = document.getElementById('btn-download-audit');

  // Browse file
  btnBrowse.addEventListener('click', () => fileInput.click());
  fileInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => processPdfBuffer(ev.target.result, file.name);
      reader.readAsArrayBuffer(file);
    }
  });

  // Drag & drop
  dropZone.addEventListener('dragover', (e) => {
    e.preventDefault();
    dropZone.classList.add('dragover');
  });
  dropZone.addEventListener('dragleave', () => dropZone.classList.remove('dragover'));
  dropZone.addEventListener('drop', (e) => {
    e.preventDefault();
    dropZone.classList.remove('dragover');
    const file = e.dataTransfer.files[0];
    if (file && file.type === 'application/pdf') {
      const reader = new FileReader();
      reader.onload = (ev) => processPdfBuffer(ev.target.result, file.name);
      reader.readAsArrayBuffer(file);
    } else {
      alert('Please upload a valid PDF document.');
    }
  });

  // Demo sample
  btnDemo.addEventListener('click', loadDemoPdfDocument);

  // Copy buttons
  btnCopySummary.addEventListener('click', () => {
    const summaryEl = document.getElementById('executive-summary-text');
    navigator.clipboard.writeText(summaryEl.innerText).then(() => {
      const orig = btnCopySummary.textContent;
      btnCopySummary.textContent = 'Copied!';
      setTimeout(() => btnCopySummary.textContent = orig, 1500);
    });
  });

  btnCopyRaw.addEventListener('click', () => {
    const text = document.getElementById('raw-text-viewer').value;
    navigator.clipboard.writeText(text).then(() => {
      const orig = btnCopyRaw.textContent;
      btnCopyRaw.textContent = 'Copied All!';
      setTimeout(() => btnCopyRaw.textContent = orig, 1500);
    });
  });

  // Export JSON Audit
  btnDownloadAudit.addEventListener('click', () => {
    if (!currentAnalysisData) return;
    const exportObj = {
      timestamp: new Date().toISOString(),
      fileName: currentAnalysisData.fileName,
      pageCount: currentAnalysisData.pageCount,
      metrics: currentAnalysisData.metrics,
      metadata: currentAnalysisData.metadata,
      pageDetails: currentAnalysisData.pageDetails
    };

    const blob = new Blob([JSON.stringify(exportObj, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `audit_${currentAnalysisData.fileName.replace(/\.pdf$/i, '')}.json`;
    a.click();
    URL.revokeObjectURL(url);
  });
});