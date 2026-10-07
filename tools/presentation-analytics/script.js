// Presentation Analytics & Rehearsal Studio - Core Engine

const SAMPLE_DECKS = {
  pitch: `## Slide 1: CognitiveFlow AI - Autonomous Enterprise Reasoning
Seed Financing Round • 2026. Introducing deterministic neural workflows for Fortune 500 enterprises.

---

## Slide 2: The Critical Problem
Enterprise teams lose $3.1T annually in fragmented, manual coordination. Over 40% of knowledge worker hours are lost syncing disparate systems across CRM, ERP, and customer data silos.

---

## Slide 3: The Solution - Self-Healing Workflows
Our deterministic reasoning engine connects APIs, documents, and communication streams in real time with sub-50ms execution and zero hallucinations.

---

## Slide 4: Market Opportunity (TAM / SAM / SOM)
The total addressable market is $130B by 2028 across enterprise process automation. Immediate beachhead is FinTech and HealthTech with a $3.4B initial SOM.

---

## Slide 5: Product Architecture & Security
Three-tier sovereign architecture: Intelligent streaming ingestion, cryptographic policy guardrails, and atomic execution with instant rollback capabilities.

---

## Slide 6: Business Model & Unit Economics
Predictable B2B SaaS subscription plus automated execution credits. High 84% gross margins, $45k average contract value, and 142% net dollar retention.

---

## Slide 7: Traction & Growth Velocity
Accelerating adoption: $3.8M in Annual Recurring Revenue, 68 enterprise clients, and 0% logo churn over the trailing six quarters.

---

## Slide 8: Defensible Moats
Proprietary semantic memory graph, high switching costs embedded into mission-critical pipelines, and pre-certified SOC 2 Type II compliance.

---

## Slide 9: Founding Team
Dr. Julian Vance (Ex-Google Brain, Stanford PhD) and Elena Rostova (Ex-Stripe VP Infrastructure). Combined 25 years scaling mission-critical distributed systems.

---

## Slide 10: The Ask & Capital Allocation
Raising $5.0M Series Seed to scale enterprise go-to-market engineering, expand US sales coverage, and accelerate SOC 2 Type II certifications.`,

  qbr: `## Slide 1: Q3 Business Performance Review
Executive Leadership Briefing • Delivering sustained growth, margin expansion, and product velocity.

---

## Slide 2: Executive Summary & Financial Highlights
Gross revenue reached $14.2M, beating target by 8.4%. Operating margins expanded 210 bps driven by automation efficiency.

---

## Slide 3: Customer Retention & NDR Trends
Net Dollar Retention held strong at 128%. Enterprise customer churn dropped to a historical low of 0.8% quarterly.

---

## Slide 4: Product Development Milestones
Successfully delivered API v3.0, custom telemetry connectors, and multi-tenant VPC deployments ahead of schedule.

---

## Slide 5: Operational Bottlenecks
Customer onboarding cycle time remains high at 24 days. Re-allocating two dedicated solutions architects to streamline provisioning.

---

## Slide 6: Competitive Landscape
New market entrants are competing on pricing, but our compliance moat and enterprise audit logging protect key renewal contracts.

---

## Slide 7: Q4 Strategic Objectives & OKRs
Targeting $18.5M ARR run rate, completing SOC 2 Type II re-audit, and hiring 6 senior enterprise account executives.

---

## Slide 8: Resource Allocation & Close
Capital reserves remain healthy with 28 months of runway. Focused on sustainable profitability and capital efficiency.`,

  keynote: `## Slide 1: The Frontier of Autonomous Systems
Opening Keynote Address • Exploring the transition from conversational AI to deterministic agentic action.

---

## Slide 2: The Shift: From Answering to Doing
For the past two years, AI has talked to us. The next decade will be defined by systems that execute verifiable work on our behalf.

---

## Slide 3: The Hallucination Barrier
In enterprise finance and healthcare, a 95% accuracy rate is indistinguishable from a total failure. We require zero-tolerance deterministic systems.

---

## Slide 4: Sovereign Intelligence Architecture
Decentralized models operating securely on private infrastructure, preserving data sovereignty without external telemetry leaks.

---

## Slide 5: The Human-in-the-Loop Flywheel
Autonomous agents handle repetitive complexity, while humans retain high-judgment supervisory control and policy authority.

---

## Slide 6: Tomorrow Starts Today
We stand at the inflection point of computing history. Let us build reliable, verifiable, and empowering intelligent infrastructure.`
};

// State
let parsedSlides = [];
let currentWpm = 135;
let isRehearsing = false;
let rehearsalSlideIndex = 0;
let rehearsalTimer = null;
let rehearsalSeconds = 0;
let rehearsalSplits = [];

// Syllable counting helper
function countSyllables(word) {
  word = word.toLowerCase().replace(/[^a-z]/g, '');
  if (word.length <= 3) return 1;
  word = word.replace(/(?:[^laeiouy]|ed|es|e)$/, '');
  word = word.replace(/^y/, '');
  const matches = word.match(/[aeiouy]{1,2}/g);
  return matches ? matches.length : 1;
}

// Text analysis helpers
function analyzeTextMetrics(text) {
  const clean = text.replace(/#|\*|-|>|`/g, ' ').trim();
  const words = clean.match(/\b\w+\b/g) || [];
  const sentences = clean.split(/[.!?]+/).filter(s => s.trim().length > 0);
  
  const wordCount = words.length;
  const sentenceCount = Math.max(1, sentences.length);
  
  let totalSyllables = 0;
  words.forEach(w => {
    totalSyllables += countSyllables(w);
  });

  const asl = wordCount / sentenceCount; // Average sentence length
  const asw = wordCount > 0 ? totalSyllables / wordCount : 1; // Syllables per word

  // Flesch Reading Ease
  let fre = 206.835 - (1.015 * asl) - (84.6 * asw);
  fre = Math.max(0, Math.min(100, Math.round(fre)));

  // Flesch-Kincaid Grade Level
  let fkgl = (0.39 * asl) + (11.8 * asw) - 15.59;
  fkgl = Math.max(1, Math.min(18, Math.round(fkgl * 10) / 10));

  return { wordCount, sentenceCount, fre, fkgl };
}

// Parse Deck Text into Slide Objects
function parseDeck(text) {
  let chunks = [];
  if (text.includes('---')) {
    chunks = text.split(/\n\s*---\s*\n/);
  } else if (text.includes('## ')) {
    chunks = text.split(/(?=##\s+)/);
  } else {
    chunks = text.split(/\n{3,}/);
  }

  chunks = chunks.map(c => c.trim()).filter(c => c.length > 0);

  return chunks.map((chunk, index) => {
    const lines = chunk.split('\n').map(l => l.trim()).filter(l => l.length > 0);
    let title = `Slide ${index + 1}`;
    if (lines.length > 0 && lines[0].startsWith('#')) {
      title = lines[0].replace(/^#+\s*/, '');
    } else if (lines.length > 0) {
      title = lines[0].slice(0, 45);
    }

    const metrics = analyzeTextMetrics(chunk);
    const allocatedSec = Math.round((metrics.wordCount / currentWpm) * 60);

    return {
      index: index + 1,
      title,
      rawText: chunk,
      wordCount: metrics.wordCount,
      sentenceCount: metrics.sentenceCount,
      fre: metrics.fre,
      fkgl: metrics.fkgl,
      allocatedSec: Math.max(15, allocatedSec)
    };
  });
}

// Format seconds into MM:SS
function formatDuration(totalSec) {
  const mins = Math.floor(totalSec / 60);
  const secs = totalSec % 60;
  return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}

// Main Analytics Computation
function runAnalytics() {
  const inputEl = document.getElementById('deck-text-input');
  if (!inputEl) return;
  const rawText = inputEl.value.trim();

  if (!rawText) {
    parsedSlides = [];
    renderUI();
    return;
  }

  parsedSlides = parseDeck(rawText);
  renderUI();
}

// Render Attention Curve SVG
function renderAttentionChart() {
  const svg = document.getElementById('attention-chart');
  if (!svg || parsedSlides.length === 0) return;

  const count = parsedSlides.length;
  const width = 500;
  const height = 160;
  const padX = 30;
  const padY = 25;
  const chartWidth = width - (padX * 2);
  const chartHeight = height - (padY * 2);

  // Calculate engagement score per slide (0 - 100)
  const scores = parsedSlides.map((s, idx) => {
    let base = 85;
    // Intro bump
    if (idx === 0) base = 96;
    else if (idx === 1) base = 90;
    // Word density penalty
    if (s.wordCount > 60) base -= 25;
    else if (s.wordCount > 40) base -= 12;
    else if (s.wordCount < 20) base += 5;
    // Mid presentation fatigue
    const progress = idx / count;
    if (progress > 0.4 && progress < 0.75) base -= 10;
    // Conclusion / Ask rally
    if (idx === count - 1) base += 14;
    return Math.max(35, Math.min(98, base));
  });

  const points = scores.map((score, idx) => {
    const x = padX + (idx / Math.max(1, count - 1)) * chartWidth;
    const y = padY + (1 - (score / 100)) * chartHeight;
    return { x, y, score, idx: idx + 1 };
  });

  // Construct SVG Path
  let pathD = `M ${points[0].x} ${points[0].y}`;
  for (let i = 1; i < points.length; i++) {
    const prev = points[i - 1];
    const curr = points[i];
    const cp1x = prev.x + (curr.x - prev.x) / 2;
    const cp1y = prev.y;
    const cp2x = prev.x + (curr.x - prev.x) / 2;
    const cp2y = curr.y;
    pathD += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${curr.x} ${curr.y}`;
  }

  const fillD = `${pathD} L ${points[points.length - 1].x} ${height - padY} L ${points[0].x} ${height - padY} Z`;

  svg.innerHTML = `
    <defs>
      <linearGradient id="chartGrad" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stop-color="#6366f1" stop-opacity="0.45" />
        <stop offset="100%" stop-color="#6366f1" stop-opacity="0.0" />
      </linearGradient>
    </defs>
    <!-- Grid guidelines -->
    <line x1="${padX}" y1="${padY}" x2="${width - padX}" y2="${padY}" stroke="rgba(255,255,255,0.08)" stroke-dasharray="3,3" />
    <line x1="${padX}" y1="${height / 2}" x2="${width - padX}" y2="${height / 2}" stroke="rgba(255,255,255,0.08)" stroke-dasharray="3,3" />
    <line x1="${padX}" y1="${height - padY}" x2="${width - padX}" y2="${height - padY}" stroke="rgba(255,255,255,0.15)" />
    
    <!-- Area Fill -->
    <path d="${fillD}" fill="url(#chartGrad)" />
    
    <!-- Curve Line -->
    <path d="${pathD}" fill="none" stroke="#6366f1" stroke-width="3" stroke-linecap="round" />
    
    <!-- Data Points -->
    ${points.map(p => `
      <circle cx="${p.x}" cy="${p.y}" r="4" fill="#38bdf8" stroke="#090d16" stroke-width="2" />
      <text x="${p.x}" y="${height - 8}" fill="#94a3b8" font-size="9" text-anchor="middle" font-family="sans-serif">S${p.idx}</text>
    `).join('')}
  `;
}

// Render Recommendations Box
function renderRecommendations() {
  const container = document.getElementById('recommendations-list');
  if (!container) return;
  container.innerHTML = '';

  const recs = [];
  const denseSlides = parsedSlides.filter(s => s.wordCount > 60);
  const sparseSlides = parsedSlides.filter(s => s.wordCount < 12);
  const totalWords = parsedSlides.reduce((acc, s) => acc + s.wordCount, 0);
  const avgWords = parsedSlides.length > 0 ? Math.round(totalWords / parsedSlides.length) : 0;

  if (denseSlides.length > 0) {
    const list = denseSlides.map(s => `Slide ${s.index}`).join(', ');
    recs.push({
      type: 'warning',
      icon: '⚠️',
      text: `<strong>Cognitive Overload Warning:</strong> ${list} have over 60 words. Split bullets into cards or move secondary text to speaker notes.`
    });
  } else {
    recs.push({
      type: 'success',
      icon: '✅',
      text: `<strong>Brevity Check Passed:</strong> All slides maintain healthy, digestible word counts.`
    });
  }

  if (avgWords > 45) {
    recs.push({
      type: 'info',
      icon: '💡',
      text: `<strong>Deck Density:</strong> Averaging ${avgWords} words/slide. Recommended sweet spot for investor and keynote decks is 25-35 words/slide.`
    });
  }

  if (currentWpm > 150) {
    recs.push({
      type: 'caution',
      icon: '⚡',
      text: `<strong>Fast Pace (${currentWpm} WPM):</strong> Fast tempo is suitable for demo days, but ensure 3-second pauses after key traction stats.`
    });
  } else {
    recs.push({
      type: 'success',
      icon: '🎯',
      text: `<strong>Optimal Cadence (${currentWpm} WPM):</strong> Conversational pace allows strong retention and deliberate emphasis.`
    });
  }

  recs.forEach(rec => {
    const item = document.createElement('div');
    item.className = 'rec-item';
    item.innerHTML = `<span class="rec-icon">${rec.icon}</span><div>${rec.text}</div>`;
    container.appendChild(item);
  });
}

// Render UI Components
function renderUI() {
  const totalWords = parsedSlides.reduce((acc, s) => acc + s.wordCount, 0);
  const totalSec = parsedSlides.reduce((acc, s) => acc + s.allocatedSec, 0);
  const avgGrade = parsedSlides.length > 0 ? (parsedSlides.reduce((acc, s) => acc + s.fkgl, 0) / parsedSlides.length).toFixed(1) : '8.0';
  const avgEase = parsedSlides.length > 0 ? Math.round(parsedSlides.reduce((acc, s) => acc + s.fre, 0) / parsedSlides.length) : 65;

  // KPI updates
  document.getElementById('kpi-talk-time').textContent = formatDuration(totalSec);
  document.getElementById('kpi-talk-sub').textContent = `Based on ${currentWpm} WPM pace`;
  document.getElementById('kpi-word-count').textContent = totalWords;
  document.getElementById('kpi-slides-sub').textContent = `${parsedSlides.length} slides analyzed`;
  document.getElementById('kpi-grade-level').textContent = `Grade ${avgGrade}`;
  document.getElementById('kpi-ease-sub').textContent = `Flesch Reading Ease: ${avgEase}/100`;

  // Engagement Score
  let engagement = 88;
  if (totalWords > 500) engagement -= 6;
  if (parsedSlides.some(s => s.wordCount > 60)) engagement -= 8;
  document.getElementById('kpi-engagement-score').textContent = `${Math.max(60, engagement)}%`;

  // Render Table Breakdown
  const tbody = document.getElementById('slide-breakdown-tbody');
  if (tbody) {
    tbody.innerHTML = '';
    parsedSlides.forEach(slide => {
      let loadBadge = '<span class="badge-load-optimal">Optimal</span>';
      if (slide.wordCount > 60) {
        loadBadge = '<span class="badge-load-danger">Overloaded</span>';
      } else if (slide.wordCount > 35) {
        loadBadge = '<span class="badge-load-warning">Moderate</span>';
      }

      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td style="font-weight: 700; color: var(--accent);">Slide ${slide.index}</td>
        <td style="font-weight: 600; max-width: 220px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${escapeHtml(slide.title)}</td>
        <td>${slide.wordCount}</td>
        <td style="font-family: monospace;">${formatDuration(slide.allocatedSec)}</td>
        <td>${loadBadge}</td>
      `;
      tbody.appendChild(tr);
    });
  }

  renderAttentionChart();
  renderRecommendations();
}

// Rehearsal Mode Handlers
function startRehearsal() {
  if (parsedSlides.length === 0) {
    alert('Please load or paste slide text first.');
    return;
  }
  isRehearsing = true;
  rehearsalSlideIndex = 0;
  rehearsalSeconds = 0;
  rehearsalSplits = [];

  document.getElementById('btn-rehearsal-start').disabled = true;
  document.getElementById('btn-rehearsal-next').disabled = false;
  document.getElementById('btn-rehearsal-reset').disabled = false;

  updateRehearsalSlideView();

  clearInterval(rehearsalTimer);
  rehearsalTimer = setInterval(() => {
    rehearsalSeconds++;
    document.getElementById('stopwatch-timer').textContent = formatDuration(rehearsalSeconds);
    updatePaceIndicator();
  }, 1000);
}

function updateRehearsalSlideView() {
  const current = parsedSlides[rehearsalSlideIndex];
  if (!current) return;

  document.getElementById('rehearsal-slide-badge').textContent = `Slide ${current.index} of ${parsedSlides.length} (Target: ${formatDuration(current.allocatedSec)})`;
  document.getElementById('rehearsal-slide-preview').innerHTML = `
    <div style="font-weight: 700; color: #fff; margin-bottom: 0.25rem;">${escapeHtml(current.title)}</div>
    <div style="font-size: 0.8rem; color: #94a3b8; line-height: 1.4;">${escapeHtml(current.rawText.replace(/^#+.*?\n/, ''))}</div>
  `;
}

function updatePaceIndicator() {
  const current = parsedSlides[rehearsalSlideIndex];
  if (!current) return;

  const indicator = document.getElementById('stopwatch-pace-indicator');
  const target = current.allocatedSec;

  if (rehearsalSeconds > target + 8) {
    indicator.className = 'pace-pill slow';
    indicator.textContent = `Overtime (+${rehearsalSeconds - target}s)`;
  } else if (rehearsalSeconds < target - 10) {
    indicator.className = 'pace-pill fast';
    indicator.textContent = 'Speaking Briskly';
  } else {
    indicator.className = 'pace-pill on-pace';
    indicator.textContent = 'Cadence On Target';
  }
}

function nextRehearsalSlide() {
  if (!isRehearsing) return;
  const current = parsedSlides[rehearsalSlideIndex];
  rehearsalSplits.push({
    slideIndex: current.index,
    targetSec: current.allocatedSec,
    actualSec: rehearsalSeconds
  });

  if (rehearsalSlideIndex < parsedSlides.length - 1) {
    rehearsalSlideIndex++;
    rehearsalSeconds = 0;
    document.getElementById('stopwatch-timer').textContent = '00:00';
    updateRehearsalSlideView();
    updatePaceIndicator();
  } else {
    finishRehearsal();
  }
}

function finishRehearsal() {
  clearInterval(rehearsalTimer);
  isRehearsing = false;
  document.getElementById('btn-rehearsal-start').disabled = false;
  document.getElementById('btn-rehearsal-next').disabled = true;

  const totalActual = rehearsalSplits.reduce((acc, s) => acc + s.actualSec, 0);
  const totalTarget = rehearsalSplits.reduce((acc, s) => acc + s.targetSec, 0);
  const variance = totalActual - totalTarget;

  const indicator = document.getElementById('stopwatch-pace-indicator');
  indicator.className = 'pace-pill on-pace';
  indicator.textContent = `Completed (${formatDuration(totalActual)})`;

  alert(`Rehearsal Complete!\nTotal Time: ${formatDuration(totalActual)}\nTarget Time: ${formatDuration(totalTarget)}\nVariance: ${variance >= 0 ? '+' : ''}${variance} seconds`);
}

function resetRehearsal() {
  clearInterval(rehearsalTimer);
  isRehearsing = false;
  rehearsalSlideIndex = 0;
  rehearsalSeconds = 0;
  document.getElementById('stopwatch-timer').textContent = '00:00';
  document.getElementById('btn-rehearsal-start').disabled = false;
  document.getElementById('btn-rehearsal-next').disabled = true;
  document.getElementById('btn-rehearsal-reset').disabled = true;
  document.getElementById('rehearsal-slide-badge').textContent = 'Slide 1 of ' + parsedSlides.length;
  document.getElementById('stopwatch-pace-indicator').className = 'pace-pill on-pace';
  document.getElementById('stopwatch-pace-indicator').textContent = 'Ready to Rehearse';
  document.getElementById('rehearsal-slide-preview').innerHTML = '<em>Slide content will appear here during rehearsal...</em>';
}

// Export Analytics Report
function exportReport() {
  const totalWords = parsedSlides.reduce((acc, s) => acc + s.wordCount, 0);
  const totalSec = parsedSlides.reduce((acc, s) => acc + s.allocatedSec, 0);
  
  let md = `# Presentation Analytics & Rehearsal Report\n\n`;
  md += `**Generated:** ${new Date().toLocaleString()}\n`;
  md += `**Total Slides:** ${parsedSlides.length}\n`;
  md += `**Total Words:** ${totalWords}\n`;
  md += `**Pace Setting:** ${currentWpm} WPM\n`;
  md += `**Estimated Duration:** ${formatDuration(totalSec)}\n\n`;
  md += `## Slide-by-Slide Breakdown\n\n`;
  md += `| Slide | Title | Words | Est. Duration | Readability Grade |\n`;
  md += `|---|---|---|---|---|\n`;
  
  parsedSlides.forEach(s => {
    md += `| ${s.index} | ${s.title.replace(/\|/g, '')} | ${s.wordCount} | ${formatDuration(s.allocatedSec)} | Grade ${s.fkgl} |\n`;
  });

  const blob = new Blob([md], { type: 'text/markdown' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = `presentation_analytics_report_${Date.now()}.md`;
  a.click();
}

function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

// Event Bindings
document.addEventListener('DOMContentLoaded', () => {
  // Load initial sample
  document.getElementById('deck-text-input').value = SAMPLE_DECKS.pitch;
  runAnalytics();

  // Load sample deck button
  document.getElementById('btn-load-sample').addEventListener('click', () => {
    const val = document.getElementById('select-sample-deck').value;
    document.getElementById('deck-text-input').value = SAMPLE_DECKS[val] || SAMPLE_DECKS.pitch;
    runAnalytics();
  });

  // Re-analyze button
  document.getElementById('btn-analyze-deck').addEventListener('click', runAnalytics);

  // Speaking Pace selector
  document.getElementById('select-speaking-pace').addEventListener('change', (e) => {
    const customGroup = document.getElementById('group-custom-wpm');
    if (e.target.value === 'custom') {
      customGroup.style.display = 'block';
      currentWpm = parseInt(document.getElementById('inp-custom-wpm').value, 10) || 135;
    } else {
      customGroup.style.display = 'none';
      currentWpm = parseInt(e.target.value, 10) || 135;
    }
    runAnalytics();
  });

  document.getElementById('inp-custom-wpm').addEventListener('input', (e) => {
    currentWpm = parseInt(e.target.value, 10) || 135;
    runAnalytics();
  });

  // Rehearsal buttons
  document.getElementById('btn-rehearsal-start').addEventListener('click', startRehearsal);
  document.getElementById('btn-rehearsal-next').addEventListener('click', nextRehearsalSlide);
  document.getElementById('btn-rehearsal-reset').addEventListener('click', resetRehearsal);

  // Spacebar to advance rehearsal slide
  window.addEventListener('keydown', (e) => {
    if (isRehearsing && e.code === 'Space' && e.target.tagName !== 'TEXTAREA' && e.target.tagName !== 'INPUT') {
      e.preventDefault();
      nextRehearsalSlide();
    }
  });

  // Export report
  document.getElementById('btn-export-report').addEventListener('click', exportReport);
});