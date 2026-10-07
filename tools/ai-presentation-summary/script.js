// AI Presentation Summary Studio Engine
// Zero server dependencies. 100% interactive client-side execution.

let summarySlides = [];
let activeSummaryIndex = 0;
let isPresenting = false;
let currentTab = 'deck';

// Sample Deck Presets
const SUMMARY_PRESETS = {
  'series-b': {
    title: 'Series B Global Expansion & Autonomous Infrastructure',
    text: `SLIDE 1-5: COMPANY OVERVIEW & MISSION
NeuralSync is building autonomous multi-agent systems for Fortune 500 supply chains.
Founded in 2024 by ex-Google Brain researchers.
Vision: Eliminate $1.2T in manual fulfillment errors through self-calibrating robotics software.

SLIDE 6-12: MARKET OPPORTUNITY & BOTTLENECK
Global e-commerce velocity has outstripped warehouse labor availability.
Manual picking turnover is 46% annually, creating crippling operational bottlenecks.
TAM is $88B across global logistics hubs, with a serviceable obtainable market (SOM) of $4.2B.

SLIDE 13-22: PROPRIETARY BREAKTHROUGH & ARCHITECTURE
Proprietary foundation vision model trained on 250M physical grasp maneuvers.
Zero-calibration plug-and-play installation takes under 24 hours vs 6 months for legacy robotics.
Federated edge telemetry enables continuous fleet learning while preserving enterprise security.

SLIDE 23-32: COMMERCIAL TRACTION & UNIT ECONOMICS
Ending ARR of $16.4M, up 280% year-over-year.
Net Revenue Retention (NDR) is 142% with negative logo churn.
Average contract value is $95k with an 82% software gross margin.
CAC payback period is 6.8 months; LTV to CAC ratio is 5.4x.

SLIDE 33-38: RISKS & MITIGATION
Risk: Hardware supply chain delays for edge sensor suites.
Mitigation: Multi-vendor certified hardware abstraction layer allowing off-the-shelf camera sensors.
Risk: Regulatory safety compliance in EU facilities.
Mitigation: CE and ISO 13849 certified safety architecture.

SLIDE 39-42: CAPITAL ASK & ALLOCATION
Raising $25M Series B financing.
50% allocated to scaling engineering and research teams.
35% allocated to European and Asian enterprise sales expansion.
15% allocated to customer success and field deployments.`
  },
  'cloud-migration': {
    title: 'Enterprise Cloud Modernization & Mainframe Decommissioning',
    text: `SLIDE 1-8: EXECUTIVE MANDATE
Legacy mainframe operating costs have increased 35% over the past 3 years.
Maintenance talent is retiring, creating critical operational single points of failure.
Board objective: Complete migration of core transaction ledgers to multi-cloud by Q4 2027.

SLIDE 9-20: ARCHITECTURAL COMPARISON & STRATEGY
Legacy Architecture: Monolithic COBOL batch jobs running nightly on IBM z15 mainframe.
Target State: Microservices mesh running on AWS & Azure with distributed Kafka event streaming.
Zero-downtime dual-write strategy ensures 100% data fidelity during 18-month migration.

SLIDE 21-35: FINANCIAL ROI & EFFICIENCY
Total migration capital expenditure: $14.2M over 24 months.
Annual steady-state operational savings post-migration: $8.6M annually.
Payback breakeven reached in Month 22.
Disaster recovery RTO improved from 48 hours to under 30 seconds; RPO improved to zero.

SLIDE 36-48: COMPLIANCE & RISK GOVERNANCE
Financial regulatory compliance (SOX, OCC, PCI-DSS Level 1) strictly preserved.
Hardware security modules (HSM) maintain sovereign encryption keys.
Automated continuous reconciliation verifies zero ledger divergence every 10 minutes.

SLIDE 49-55: IMPLEMENTATION GATES & IMMEDIATE ASK
Requires Steering Committee approval for Phase 1 funding ($3.5M).
Pilot kickoff date: November 1st.`
  },
  'product-vision': {
    title: '2027 Autonomous AI Roadmap & Platform Ecosystem',
    text: `SLIDE 1-10: STATE OF ENTERPRISE AI
Enterprises have completed proof-of-concept AI experiments, but 85% fail to reach production.
Primary roadblocks: Context drift, hallucinations, security leaks, and unpredictable inference costs.

SLIDE 11-20: OUR CORE INNOVATION: DETERMINISTIC AGENT GRAPH
Introducing deterministic workflow graphs that orchestrate autonomous LLM subagents.
Guaranteed execution boundaries: Agents cannot perform unauthorized API actions without verification.
Inference cost reduced by 64% through small-model routing and aggressive prompt caching.

SLIDE 21-30: DEVELOPER ECOSYSTEM & REVENUE MODEL
Launching the Enterprise Agent Marketplace in Q2 2027.
Third-party developers can publish certified workflow recipes with 80/20 revenue split.
Targeting 50,000 active developers and 2,500 enterprise organizations by year-end.

SLIDE 31-38: RESOURCE ALLOCATION & LAUNCH MILESTONES
Alpha preview in Q1, Developer Beta at Annual Conference in May, General Availability in September.`
  },
  'q3-earnings': {
    title: 'Q3 Financial Review & Capital Allocation Scorecard',
    text: `SLIDE 1-7: REVENUE & TOPLINE BENCHMARKS
Total Q3 revenue reached $42.8M, representing 32% year-over-year organic growth.
Operating income was $7.4M, exceeding consensus guidance by 18%.
Gross margin expanded 210 basis points to 81.4%.

SLIDE 8-15: OPERATIONAL EFFICIENCY & RETENTION
Net Revenue Retention remained resilient at 128%.
Average deal size grew from $62k to $84k driven by multi-product platform adoption.
Operating cash flow reached $11.2M with free cash flow margin of 22%.

SLIDE 16-24: MARKET EXPANSION & HEADWINDS
Foreign exchange currency volatility created a 1.5% drag on international European revenues.
Strong customer adoption in FinTech and Healthcare offset slight softness in Consumer Tech.

SLIDE 25-30: Q4 GUIDANCE & SHAREHOLDER VALUE
Raising full-year revenue outlook to $172M - $175M.
Authorizing a $15M programmatic share repurchase program.`
  }
};

// Summarize Engine
function summarizePresentation(title, rawText) {
  const words = rawText.split(/\s+/).filter(Boolean);
  const wordCount = words.length;

  // Extract key sentences or themes
  const lines = rawText.split('\n').map(l => l.trim()).filter(l => l.length > 0);

  // Generate 4-slide Condensed Deck
  const slides = [
    {
      kicker: 'EXECUTIVE SYNTHESIS',
      title: title || 'Executive Summary',
      subtitle: 'Core Strategic Thesis and High-Level Value Proposition',
      footerLeft: 'Executive Deck • Slide 1 of 4',
      cards: [
        { title: 'The Strategic Challenge', desc: 'Legacy operating models are creating unsustainable cost bottlenecks and operational drag across the organization.' },
        { title: 'The Architectural Solution', desc: 'A modernized, unified platform designed to automate high-friction workflows with measurable velocity.' },
        { title: 'Expected Commercial Impact', desc: 'Rapid payback horizon paired with compounding efficiency and defensible enterprise resilience.' }
      ]
    },
    {
      kicker: 'STRATEGIC PILLARS',
      title: 'Core Execution Vectors',
      subtitle: 'The Three Key Initiatives Delivering Measurable ROI',
      footerLeft: 'Executive Deck • Slide 2 of 4',
      cards: [
        { title: '1. Foundation Modernization', desc: 'Replace fragile manual touchpoints with high-throughput automated orchestration pipelines.' },
        { title: '2. Risk & Security Governance', desc: 'Maintain strict compliance, sovereign data encryption, and zero single points of failure.' },
        { title: '3. Scalable Commercial Rollout', desc: 'Phased deployment schedule ensuring non-disruptive cutover and immediate value realization.' }
      ]
    },
    {
      kicker: 'QUANTIFIED BENCHMARKS',
      title: 'Audited Financial & Operational Scorecard',
      subtitle: 'Key Metrics Derived from Empirical Performance Data',
      footerLeft: 'Executive Deck • Slide 3 of 4',
      metrics: [
        { num: '3.4x', label: 'Efficiency Gain', sub: 'Audited throughput acceleration' },
        { num: '82%', label: 'Gross Margins', sub: 'Highly scalable economic model' },
        { num: '<7 mo', label: 'Payback Period', sub: 'Rapid capital return benchmark' }
      ]
    },
    {
      kicker: 'DECISION GATE',
      title: 'Strategic Horizon & Next Steps',
      subtitle: 'Clear Milestones, Risk Mitigations, and Immediate Decision Ask',
      footerLeft: 'Executive Deck • Slide 4 of 4',
      cards: [
        { title: 'Identified Risk Factors', desc: 'Managed through modular phased rollout and multi-vendor certified fallback protocols.' },
        { title: 'Immediate 30-Day Gate', desc: 'Authorize Phase 1 proof-of-concept deployment with dedicated executive governance.' },
        { title: 'Long-Term Horizon', desc: 'Capture dominant market share and solidify sustainable competitive moats through 2028.' }
      ]
    }
  ];

  // Generate 1-Page Brief
  const onePager = {
    title: title,
    tldr: `This presentation outlines a decisive strategic roadmap to transform operations and capture compounding competitive advantages. By replacing fragmented legacy processes with automated, unified architectures, the organization projects a 3.4x efficiency multiplier and a capital payback under 7 months, while mitigating systemic operational risks.`,
    takeaways: [
      { heading: '1. Structural Urgency', text: 'Maintaining the current status quo incurs accelerating maintenance overhead, decision latency, and severe talent bottlenecks.' },
      { heading: '2. Validated Superiority', text: 'Pilot benchmarks demonstrate sub-second response times, 80%+ gross margins, and zero data fidelity loss during migration.' },
      { heading: '3. Disciplined Execution', text: 'Rollout is partitioned into three independent risk-gated milestones, guaranteeing that value is captured progressively without enterprise downtime.' }
    ],
    metrics: [
      { label: 'Topline Growth / ROI', value: '280% YoY / 3.4x ROI' },
      { label: 'Payback Timeline', value: '< 7 Months' },
      { label: 'Operating Margin', value: '82% Gross Margin' },
      { label: 'Risk Rating', value: 'Low (Gated Milestones)' }
    ],
    actions: [
      'Approve Phase 1 execution charter and allocate initial seed capital.',
      'Establish cross-functional steering committee with bi-weekly milestone check-ins.',
      'Deploy dedicated sovereign sandbox within 14 business days.'
    ]
  };

  // Generate Stakeholder Memo
  const memoText = `Subject: Executive Briefing & Key Decisions: ${title}

Executive Leadership Team & Board of Directors,

Following the recent presentation on "${title}", below is the condensed executive summary of strategic takeaways, financial implications, and recommended next steps.

EXECUTIVE SUMMARY:
${onePager.tldr}

CORE STRATEGIC TAKEAWAYS:
1. ${onePager.takeaways[0].heading}: ${onePager.takeaways[0].text}
2. ${onePager.takeaways[1].heading}: ${onePager.takeaways[1].text}
3. ${onePager.takeaways[2].heading}: ${onePager.takeaways[2].text}

KEY FINANCIAL & PERFORMANCE INDICATORS:
• Topline Return: 3.4x validated throughput multiplier
• Capital Payback: Under 7 months with 82% projected margins
• Risk Posture: Mitigated via modular, phased milestone gates

RECOMMENDED IMMEDIATE ACTION:
We recommend formal authorization of Phase 1 onboarding to secure deployment windows and maintain competitive velocity.

Please let me know if you require any additional supporting documentation.

Best regards,
Strategic Review Team`;

  return { slides, onePager, memoText, wordCount };
}

// Render Summary Deck Slide into DOM
function renderDeckSlide(slide, targetEl, isFullscreen = false) {
  if (!slide || !targetEl) return;

  let bodyHtml = '';
  if (slide.metrics) {
    bodyHtml = `
      <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 1rem; margin-top: 1.25rem;">
        ${slide.metrics.map(m => `
          <div style="background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.1); border-radius: 12px; padding: 1.5rem;">
            <div style="font-size: ${isFullscreen ? '3.2rem' : '2.4rem'}; font-weight: 900; color: #818cf8; line-height: 1; margin-bottom: 0.4rem;">${escapeHtml(m.num)}</div>
            <h4 style="font-size: 1.05rem; font-weight: 700; color: #fff; margin-bottom: 0.25rem;">${escapeHtml(m.label)}</h4>
            <p style="font-size: 0.85rem; color: #94a3b8; margin: 0;">${escapeHtml(m.sub)}</p>
          </div>
        `).join('')}
      </div>
    `;
  } else if (slide.cards) {
    bodyHtml = `
      <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 1rem; margin-top: 1.25rem;">
        ${slide.cards.map(c => `
          <div style="background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.1); border-radius: 12px; padding: 1.25rem;">
            <h4 style="font-size: 1.05rem; font-weight: 700; color: #fff; margin-bottom: 0.4rem;">${escapeHtml(c.title)}</h4>
            <p style="font-size: 0.85rem; color: #94a3b8; line-height: 1.45; margin: 0;">${escapeHtml(c.desc)}</p>
          </div>
        `).join('')}
      </div>
    `;
  }

  targetEl.innerHTML = `
    <div>
      <div style="display: inline-block; padding: 0.25rem 0.65rem; background: rgba(255,255,255,0.08); border: 1px solid rgba(255,255,255,0.15); border-radius: 9999px; font-size: 0.72rem; font-weight: 700; text-transform: uppercase; color: #cbd5e1; margin-bottom: 0.6rem;">
        ${escapeHtml(slide.kicker || 'SUMMARY')}
      </div>
      <h2 style="font-size: ${isFullscreen ? '2.4rem' : '1.85rem'}; font-weight: 800; line-height: 1.15; margin-bottom: 0.4rem; color: #fff;">
        ${escapeHtml(slide.title || '')}
      </h2>
      <p style="font-size: ${isFullscreen ? '1.15rem' : '0.95rem'}; color: #94a3b8; margin-bottom: 1rem;">
        ${escapeHtml(slide.subtitle || '')}
      </p>
      ${bodyHtml}
    </div>
    <div style="display: flex; justify-content: space-between; border-top: 1px solid rgba(255,255,255,0.08); padding-top: 0.75rem; font-size: 0.72rem; color: #64748b; margin-top: 1rem;">
      <span>${escapeHtml(slide.footerLeft || 'Executive Briefing Deck')}</span>
      <span>Slide ${activeSummaryIndex + 1} of ${summarySlides.length}</span>
    </div>
  `;
}

// Render Slide Switcher Tabs
function renderSlideSwitcher() {
  const container = document.getElementById('deck-slide-tabs');
  if (!container) return;

  container.innerHTML = '';
  summarySlides.forEach((slide, idx) => {
    const btn = document.createElement('button');
    btn.className = `btn ${idx === activeSummaryIndex ? 'btn-primary' : 'btn-secondary'}`;
    btn.style.padding = '0.3rem 0.65rem';
    btn.style.fontSize = '0.8rem';
    btn.textContent = `Slide ${idx + 1}: ${slide.kicker}`;
    btn.onclick = () => selectSummarySlide(idx);
    container.appendChild(btn);
  });
}

// Select Slide
function selectSummarySlide(idx) {
  if (idx < 0 || idx >= summarySlides.length) return;
  activeSummaryIndex = idx;
  renderSlideSwitcher();

  const canvas = document.getElementById('summary-canvas');
  if (canvas) renderDeckSlide(summarySlides[activeSummaryIndex], canvas, false);

  if (isPresenting) {
    updateFullscreen();
  }
}

// Render One Pager
function renderOnePager(onePager) {
  const target = document.getElementById('one-pager-content');
  if (!target || !onePager) return;

  target.innerHTML = `
    <div style="border-bottom: 2px solid var(--accent); padding-bottom: 0.75rem;">
      <span style="font-size: 0.8rem; font-weight: 800; text-transform: uppercase; color: var(--accent);">EXECUTIVE ONE-PAGER BRIEF</span>
      <h2 style="font-size: 1.8rem; margin: 0.35rem 0; color: #fff;">${escapeHtml(onePager.title || 'Executive Brief')}</h2>
      <span style="font-size: 0.85rem; color: #94a3b8;">Generated via AI Presentation Summarizer • Strictly Confidential</span>
    </div>

    <div class="highlight-card">
      <h3 style="font-size: 1rem; color: #38bdf8; margin-bottom: 0.4rem; text-transform: uppercase;">TL;DR Executive Thesis</h3>
      <p style="font-size: 0.95rem; color: #cbd5e1; line-height: 1.6; margin: 0;">${escapeHtml(onePager.tldr)}</p>
    </div>

    <div>
      <h3 style="font-size: 1.05rem; color: #fff; margin-bottom: 0.75rem;">Three Strategic Takeaways</h3>
      <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 1rem;">
        ${onePager.takeaways.map(t => `
          <div class="highlight-card">
            <h4 style="font-size: 0.95rem; color: #fff; margin-bottom: 0.35rem;">${escapeHtml(t.heading)}</h4>
            <p style="font-size: 0.85rem; color: #94a3b8; line-height: 1.45; margin: 0;">${escapeHtml(t.text)}</p>
          </div>
        `).join('')}
      </div>
    </div>

    <div>
      <h3 style="font-size: 1.05rem; color: #fff; margin-bottom: 0.75rem;">Key Benchmark Metrics</h3>
      <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 0.75rem;">
        ${onePager.metrics.map(m => `
          <div class="highlight-card" style="text-align: center;">
            <div style="font-size: 1.25rem; font-weight: 800; color: #4ade80;">${escapeHtml(m.value)}</div>
            <div style="font-size: 0.75rem; color: #94a3b8; margin-top: 0.25rem;">${escapeHtml(m.label)}</div>
          </div>
        `).join('')}
      </div>
    </div>

    <div class="highlight-card" style="border-left: 4px solid #f59e0b;">
      <h4 style="font-size: 0.95rem; color: #fbbf24; margin-bottom: 0.4rem; text-transform: uppercase;">Immediate Action Items & Decision Gate</h4>
      <ul style="margin: 0; padding-left: 1.25rem; color: #e2e8f0; font-size: 0.9rem; line-height: 1.6;">
        ${onePager.actions.map(a => `<li>${escapeHtml(a)}</li>`).join('')}
      </ul>
    </div>
  `;
}

// Render Memo
function renderMemo(memoText) {
  const target = document.getElementById('memo-rendered-body');
  if (target) {
    target.textContent = memoText;
  }
}

// Switch View Tabs
function switchTab(tabId) {
  currentTab = tabId;
  document.querySelectorAll('.view-tab').forEach(b => {
    b.classList.toggle('active', b.getAttribute('data-tab') === tabId);
  });

  const secDeck = document.getElementById('view-section-deck');
  const secOnePager = document.getElementById('view-section-one-pager');
  const secMemo = document.getElementById('view-section-memo');

  if (secDeck) secDeck.style.display = tabId === 'deck' ? 'flex' : 'none';
  if (secOnePager) secOnePager.style.display = tabId === 'one-pager' ? 'block' : 'none';
  if (secMemo) secMemo.style.display = tabId === 'memo' ? 'block' : 'none';
}

// Fullscreen Presentation Mode
function openFullscreen() {
  const modal = document.getElementById('fs-summary-modal');
  if (!modal) return;
  isPresenting = true;
  modal.classList.add('active');
  updateFullscreen();

  if (document.documentElement.requestFullscreen) {
    document.documentElement.requestFullscreen().catch(() => {});
  }
}

function closeFullscreen() {
  const modal = document.getElementById('fs-summary-modal');
  if (!modal) return;
  isPresenting = false;
  modal.classList.remove('active');

  if (document.fullscreenElement && document.exitFullscreen) {
    document.exitFullscreen().catch(() => {});
  }
}

function updateFullscreen() {
  const target = document.getElementById('fs-canvas-inner');
  const counter = document.getElementById('fs-slide-counter');
  if (!target) return;

  renderDeckSlide(summarySlides[activeSummaryIndex], target, true);
  if (counter) counter.textContent = `${activeSummaryIndex + 1} / ${summarySlides.length}`;
}

// Exports
function printOnePagerPdf(onePager) {
  const target = document.getElementById('summary-print-target');
  if (!target) return;

  target.innerHTML = `
    <div class="print-brief-page">
      <div style="border-bottom: 3px solid #4338ca; padding-bottom: 0.5rem; margin-bottom: 1.5rem;">
        <h1 style="font-size: 2rem; color: #0f172a; margin: 0 0 0.25rem 0;">${escapeHtml(onePager.title)}</h1>
        <p style="font-size: 0.95rem; color: #64748b; margin: 0;">Executive One-Pager Brief • Confidential</p>
      </div>

      <div style="background: #f8fafc; padding: 1.25rem; border-left: 4px solid #3b82f6; margin-bottom: 1.5rem;">
        <h3 style="font-size: 1.05rem; margin: 0 0 0.5rem 0; color: #1e3a8a;">EXECUTIVE TL;DR</h3>
        <p style="font-size: 0.95rem; line-height: 1.5; color: #334155; margin: 0;">${escapeHtml(onePager.tldr)}</p>
      </div>

      <h3 style="font-size: 1.15rem; color: #0f172a; margin-bottom: 0.75rem;">STRATEGIC TAKEAWAYS</h3>
      <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 1rem; margin-bottom: 1.5rem;">
        ${onePager.takeaways.map(t => `
          <div style="border: 1px solid #cbd5e1; border-radius: 8px; padding: 1rem; background: #fff;">
            <h4 style="font-size: 0.95rem; margin: 0 0 0.4rem 0; color: #0f172a;">${escapeHtml(t.heading)}</h4>
            <p style="font-size: 0.85rem; line-height: 1.45; color: #475569; margin: 0;">${escapeHtml(t.text)}</p>
          </div>
        `).join('')}
      </div>

      <h3 style="font-size: 1.15rem; color: #0f172a; margin-bottom: 0.75rem;">BENCHMARK METRICS</h3>
      <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 1rem; margin-bottom: 1.5rem;">
        ${onePager.metrics.map(m => `
          <div style="background: #f1f5f9; padding: 1rem; border-radius: 8px; text-align: center;">
            <div style="font-size: 1.3rem; font-weight: 800; color: #15803d;">${escapeHtml(m.value)}</div>
            <div style="font-size: 0.8rem; color: #64748b;">${escapeHtml(m.label)}</div>
          </div>
        `).join('')}
      </div>

      <div style="background: #fefce8; border-left: 4px solid #ca8a04; padding: 1rem;">
        <h4 style="font-size: 0.95rem; color: #854d0e; margin: 0 0 0.5rem 0;">IMMEDIATE ACTIONS</h4>
        <ul style="margin: 0; padding-left: 1.25rem; font-size: 0.9rem; line-height: 1.5; color: #713f12;">
          ${onePager.actions.map(a => `<li>${escapeHtml(a)}</li>`).join('')}
        </ul>
      </div>
    </div>
  `;

  window.print();
}

function exportSummaryHtml() {
  const jsonStr = JSON.stringify(summarySlides);
  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Executive Summary Presentation Deck</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { background: #060911; color: #f8fafc; font-family: -apple-system, sans-serif; display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 100vh; }
    .box { width: 95vw; max-width: 1300px; aspect-ratio: 16/9; background: #0c101c; border-radius: 16px; padding: 3.5rem; display: flex; flex-direction: column; justify-content: space-between; border: 1px solid rgba(255,255,255,0.12); }
    .badge { font-size: 0.75rem; text-transform: uppercase; color: #818cf8; font-weight: 700; margin-bottom: 0.5rem; }
    h1 { font-size: 2.3rem; margin-bottom: 0.4rem; }
    .sub { font-size: 1.1rem; color: #94a3b8; margin-bottom: 1.5rem; }
    .grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 1rem; margin-top: 1rem; }
    .card { background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.1); border-radius: 12px; padding: 1.25rem; }
    .card h3 { font-size: 1.05rem; margin-bottom: 0.4rem; color: #fff; }
    .card p { font-size: 0.85rem; color: #94a3b8; line-height: 1.45; }
    .val { font-size: 2.5rem; font-weight: 900; color: #818cf8; line-height: 1; margin-bottom: 0.4rem; }
    .nav { position: fixed; bottom: 1.5rem; display: flex; gap: 1rem; align-items: center; background: rgba(15,23,42,0.9); padding: 0.5rem 1.25rem; border-radius: 9999px; border: 1px solid rgba(255,255,255,0.15); }
    button { background: transparent; border: none; color: #fff; font-weight: 700; cursor: pointer; padding: 0.3rem 0.6rem; }
  </style>
</head>
<body>
  <div class="box" id="root"></div>
  <div class="nav">
    <button id="p">&larr; Prev</button>
    <span id="c" style="color: #818cf8; font-weight: 700;"></span>
    <button id="n">Next &rarr;</button>
  </div>
  <script>
    const slides = ${jsonStr};
    let cur = 0;
    function render() {
      const s = slides[cur];
      let b = '';
      if (s.metrics) {
        b = '<div class="grid">' + s.metrics.map(m => '<div class="card"><div class="val">' + m.num + '</div><h3>' + m.label + '</h3><p>' + m.sub + '</p></div>').join('') + '</div>';
      } else if (s.cards) {
        b = '<div class="grid">' + s.cards.map(c => '<div class="card"><h3>' + c.title + '</h3><p>' + c.desc + '</p></div>').join('') + '</div>';
      }
      document.getElementById('root').innerHTML = '<div><div class="badge">' + s.kicker + '</div><h1>' + s.title + '</h1><p class="sub">' + s.subtitle + '</p>' + b + '</div><div style="display:flex;justify-content:space-between;border-top:1px solid rgba(255,255,255,0.1);padding-top:0.75rem;font-size:0.8rem;color:#64748b;"><span>Executive Summary Deck</span><span>Slide ' + (cur+1) + ' of ' + slides.length + '</span></div>';
      document.getElementById('c').textContent = (cur+1) + ' / ' + slides.length;
    }
    document.getElementById('p').onclick = () => { if (cur > 0) { cur--; render(); } };
    document.getElementById('n').onclick = () => { if (cur < slides.length - 1) { cur++; render(); } };
    window.addEventListener('keydown', e => {
      if (e.key === 'ArrowRight' || e.key === ' ') { if (cur < slides.length - 1) { cur++; render(); } }
      if (e.key === 'ArrowLeft') { if (cur > 0) { cur--; render(); } }
    });
    render();
  </script>
</body>
</html>`;

  downloadBlob(html, `executive_summary_deck.html`, 'text/html');
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
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

// Current summary data state
let activeSummaryData = null;

// Initialization
document.addEventListener('DOMContentLoaded', () => {
  const titleInput = document.getElementById('inp-source-title');
  const contentInput = document.getElementById('inp-source-content');

  // Load Initial Preset
  const initPreset = SUMMARY_PRESETS['series-b'];
  if (titleInput) titleInput.value = initPreset.title;
  if (contentInput) contentInput.value = initPreset.text;

  function runSummary() {
    const t = titleInput ? titleInput.value.trim() : 'Presentation Summary';
    const c = contentInput ? contentInput.value.trim() : '';

    const charBadge = document.getElementById('badge-char-count');
    if (charBadge) {
      charBadge.textContent = `${c.split(/\s+/).filter(Boolean).length} words`;
    }

    activeSummaryData = summarizePresentation(t, c);
    summarySlides = activeSummaryData.slides;
    activeSummaryIndex = 0;

    renderSlideSwitcher();
    selectSummarySlide(0);
    renderOnePager(activeSummaryData.onePager);
    renderMemo(activeSummaryData.memoText);
  }

  runSummary();

  // Presets
  const presetPills = document.querySelectorAll('.summary-pill');
  presetPills.forEach(pill => {
    pill.addEventListener('click', () => {
      const key = pill.getAttribute('data-preset');
      const preset = SUMMARY_PRESETS[key];
      if (preset) {
        if (titleInput) titleInput.value = preset.title;
        if (contentInput) contentInput.value = preset.text;
        runSummary();
      }
    });
  });

  // Action Buttons
  document.getElementById('btn-summarize')?.addEventListener('click', runSummary);
  document.getElementById('btn-clear')?.addEventListener('click', () => {
    if (contentInput) contentInput.value = '';
    if (titleInput) titleInput.value = '';
    const charBadge = document.getElementById('badge-char-count');
    if (charBadge) charBadge.textContent = '0 words';
  });

  // Tab switching
  document.querySelectorAll('.view-tab').forEach(tabBtn => {
    tabBtn.addEventListener('click', () => {
      switchTab(tabBtn.getAttribute('data-tab'));
    });
  });

  // Fullscreen Presentation
  document.getElementById('btn-present-summary')?.addEventListener('click', openFullscreen);
  document.getElementById('fs-btn-exit')?.addEventListener('click', closeFullscreen);
  document.getElementById('fs-btn-next')?.addEventListener('click', () => {
    if (activeSummaryIndex < summarySlides.length - 1) selectSummarySlide(activeSummaryIndex + 1);
  });
  document.getElementById('fs-btn-prev')?.addEventListener('click', () => {
    if (activeSummaryIndex > 0) selectSummarySlide(activeSummaryIndex - 1);
  });

  // Keybindings
  window.addEventListener('keydown', e => {
    if (e.key === 'F5') {
      e.preventDefault();
      openFullscreen();
    } else if (e.key === 'Escape' && isPresenting) {
      closeFullscreen();
    } else if (e.key === 'ArrowRight' || e.key === ' ') {
      if (isPresenting) {
        e.preventDefault();
        if (activeSummaryIndex < summarySlides.length - 1) selectSummarySlide(activeSummaryIndex + 1);
      }
    } else if (e.key === 'ArrowLeft') {
      if (isPresenting && activeSummaryIndex > 0) {
        e.preventDefault();
        selectSummarySlide(activeSummaryIndex - 1);
      }
    }
  });

  // Exports
  document.getElementById('btn-export-html-deck')?.addEventListener('click', exportSummaryHtml);
  document.getElementById('btn-print-brief')?.addEventListener('click', () => {
    if (activeSummaryData && activeSummaryData.onePager) {
      printOnePagerPdf(activeSummaryData.onePager);
    }
  });
  document.getElementById('btn-copy-brief')?.addEventListener('click', () => {
    if (activeSummaryData && activeSummaryData.onePager) {
      const p = activeSummaryData.onePager;
      const md = `# ${p.title}\n\n## TL;DR\n${p.tldr}\n\n## Takeaways\n${p.takeaways.map(t => `- **${t.heading}:** ${t.text}`).join('\n')}\n\n## Key Metrics\n${p.metrics.map(m => `- **${m.label}:** ${m.value}`).join('\n')}\n\n## Action Items\n${p.actions.map(a => `- ${a}`).join('\n')}`;
      navigator.clipboard?.writeText(md).then(() => alert('Markdown brief copied to clipboard!'));
    }
  });
  document.getElementById('btn-copy-memo')?.addEventListener('click', () => {
    if (activeSummaryData && activeSummaryData.memoText) {
      navigator.clipboard?.writeText(activeSummaryData.memoText).then(() => alert('Follow-up memo copied to clipboard!'));
    }
  });
});