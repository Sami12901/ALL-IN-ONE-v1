// AI Report Writer - Corporate Executive Memorandum Generator
// Generates complete, multi-paragraph corporate memorandums with performance highlights, risk factors, roadmap horizons, and print-to-PDF export.

// 1. Corporate Memorandum Presets
const MEMO_SCENARIOS = {
  'q4-enterprise': {
    subject: 'Fiscal Q4 Enterprise Commercial Performance & Strategic Margin Optimization',
    from: 'Chief Analytics Officer & Strategy Advisory Group',
    classification: 'Strictly Confidential // Board Deliberation Only',
    summaryP1: 'During the fourth fiscal quarter of 2026, enterprise operations delivered robust top-line commercial acceleration, generating $28.45M in gross volume against a baseline plan of $25.00M (+13.8% favorable variance). This expansion was principally supported by aggressive upmarket adoption in core commercial services and exceptional client retention across flagship global accounts.',
    summaryP2: 'While top-line velocity exceeded modeled forecasts, overall operating margins encountered localized compression of 140 basis points, settling at 62.4%. This movement reflects purposeful investments in customer onboarding infrastructure and logistics expedited fulfillment during seasonal surges. Underlying unit economics remain fundamentally sound, providing the strategic headroom necessary to pursue disciplined inorganic initiatives entering the upcoming fiscal year.',
    highlights: 'Commercial outperformance was concentrated across three primary growth pillars: enterprise software solutions, digital direct-to-consumer engagements, and high-margin recurring advisory contracts. Flagship accounts exhibited an expansion rate of +24.2% YoY, validating our account-based lifecycle retention playbooks.',
    kpis: [
      { metric: 'Gross Commercial Volume', actual: '$28,450,000', plan: '$25,000,000', variance: '+13.8%', status: 'Optimal' },
      { metric: 'Blended Gross Margin', actual: '62.4%', plan: '63.8%', variance: '-1.4%', status: 'Monitor' },
      { metric: 'Enterprise Contract AOV', actual: '$14,250', plan: '$12,000', variance: '+18.8%', status: 'Optimal' },
      { metric: 'Net Logo Retention Rate', actual: '96.2%', plan: '94.0%', variance: '+2.2%', status: 'Optimal' },
      { metric: 'Operating Cash Flow', actual: '$8,120,000', plan: '$7,200,000', variance: '+12.8%', status: 'Optimal' }
    ],
    drivers: 'Average transaction values reached $14,250 across key enterprise segments, representing an 18.5% basket increase compared to prior trailing periods. Digital channel self-service acquisitions expanded by 34%, yielding a blended Customer Acquisition Cost (CAC) payback period of 4.8 months.',
    riskIntro: 'A rigorous audit of operating variance reveals two specific areas requiring executive governance: localized gross margin slippage within secondary fulfillment channels and heightened contract discounting granted during end-of-quarter renewals.',
    riskCallout: 'Special contractual discounts averaged 14.8% in mid-tier enterprise deals (against a ceiling policy of 8.0%), eroding approximately $680,000 in gross margin contribution. Strict approval thresholds have been instituted for the upcoming quarter.',
    riskSecondary: 'Furthermore, inventory turnover velocity in regional fulfillment nodes decelerated slightly to 4.8x. Continued monitoring of supply chain delivery windows is advised to prevent working capital tie-ups.',
    roadmapIntro: 'To reinforce top-line momentum while safeguarding operating margins, leadership recommends immediate execution of the following phased initiatives across 30, 60, and 90-day accountability windows:',
    roadmap: [
      {
        horizon: '30 Days • Tactical',
        title: 'Discount Lock & Governance',
        body: 'Enforce strict CFO sign-off on any deal concession exceeding 7.5%. Re-align commercial sales incentive structures with net margin yield rather than unadjusted volume.'
      },
      {
        horizon: '60 Days • Operational',
        title: 'Supplier Renegotiations',
        body: 'Leverage increased aggregate procurement volume to negotiate a 250 bps reduction in raw material and hosting costs across top-tier vendors.'
      },
      {
        horizon: '90 Days • Strategic',
        title: 'Regional Market Expansion',
        body: 'Scale high-performing APAC and European boutique channels with targeted marketing investment, capturing under-indexed premium market share.'
      }
    ]
  },
  'annual-expansion': {
    subject: 'Annual Product Portfolio Diversification & Global Market Expansion',
    from: 'Head of Global Commercial Strategy & Market Development',
    classification: 'Confidential // Strategic Planning Committee',
    summaryP1: 'Throughout the 2026 fiscal campaign, our expanded product portfolio achieved market penetration milestones ahead of forecast schedule. Cumulative gross portfolio revenue reached $48.20M, up 27.4% year-over-year, bolstered by cross-selling across premium luxury and business client cohorts.',
    summaryP2: 'The capital expenditure deployed toward European flagship retail salons and localized digital storefronts generated immediate accretive returns, yielding a portfolio payback cycle of under 11 months. Margin discipline remained exemplary across high-jewelry and bespoke apparel lines.',
    highlights: 'Product categories launched within the past 18 months contributed $16.5M in incremental sales, exceeding baseline projections by 41%. Customer acquisition velocity accelerated markedly in metropolitan gateway markets including London, Milan, and Dubai.',
    kpis: [
      { metric: 'Annual Portfolio Revenue', actual: '$48,200,000', plan: '$42,000,000', variance: '+14.8%', status: 'Optimal' },
      { metric: 'New Category Sales Share', actual: '34.2%', plan: '25.0%', variance: '+9.2%', status: 'Optimal' },
      { metric: 'Repeat Purchase Frequency', actual: '2.8x / yr', plan: '2.4x / yr', variance: '+16.7%', status: 'Optimal' },
      { metric: 'Gross Portfolio Margin', actual: '68.5%', plan: '66.0%', variance: '+2.5%', status: 'Optimal' },
      { metric: 'Store Footprint ROI', actual: '22.4%', plan: '18.0%', variance: '+4.4%', status: 'Optimal' }
    ],
    drivers: 'Direct boutique sales and private client appointments accounted for 58% of gross receipts, driven by personalized clienteling. Cross-sell initiatives yielded a 32% increase in multi-category basket attachments.',
    riskIntro: 'Despite notable commercial momentum, geopolitical supply chain friction and currency fluctuation in secondary currencies present mild operational headwinds that require forward hedging.',
    riskCallout: 'Import tariff variances and cross-border freight surcharges introduced a 180 bps variance in landed inventory expenses across Latin American distributions. Near-shore assembly mitigation is currently underway.',
    riskSecondary: 'Certain seasonal skus experienced minor delivery latency during peak Q3 windows, necessitating dynamic buffer stock allocation across regional warehouses.',
    roadmapIntro: 'To maintain competitive leadership and optimize working capital during continued market rollouts, we propose the following sequential deployment:',
    roadmap: [
      {
        horizon: '30 Days • Immediate',
        title: 'Buffer Inventory Rebalancing',
        body: 'Transfer safety stock into Central European hubs to ensure 98% in-stock availability across core flagship lifestyle silhouettes.'
      },
      {
        horizon: '60 Days • Expansion',
        title: 'Boutique Experience Rollout',
        body: 'Inaugurate private collector VIP salons across Munich and Tokyo, prioritizing high-tier client appointments.'
      },
      {
        horizon: '90 Days • Governance',
        title: 'Omnichannel Stock Unification',
        body: 'Deploy unified inventory pooling software to allow store fulfillment of online orders, slashing shipping transit times by 40%.'
      }
    ]
  },
  'risk-audit': {
    subject: 'Operational Risk Assessment, Cost Inflation & Supply Chain Audit',
    from: 'Director of Operational Risk & Internal Governance',
    classification: 'Strictly Confidential // Audit Committee & Risk Council',
    summaryP1: 'A comprehensive operational and supply chain risk evaluation completed for the trailing three quarters reveals structural vulnerabilities in single-source procurement networks and logistics cost inflation.',
    summaryP2: 'While headline sales remained resilient at $34.10M, gross margins deteriorated by 310 bps, driven by air-freight premiums, emergency expedited shipping, and component supplier surcharge increases.',
    highlights: 'Core customer demand remained resilient across all channels. However, failure to secure fixed-term logistics contracts exposed the business to spot-rate market volatility throughout the peak summer replenishment cycle.',
    kpis: [
      { metric: 'Logistics Operating Cost', actual: '$4,150,000', plan: '$2,800,000', variance: '+48.2%', status: 'Critical' },
      { metric: 'Gross Operating Margin', actual: '54.2%', plan: '59.0%', variance: '-4.8%', status: 'Critical' },
      { metric: 'On-Time Delivery SLA', actual: '88.4%', plan: '97.0%', variance: '-8.6%', status: 'Monitor' },
      { metric: 'Single-Source Risk Index', actual: '42.0%', plan: '20.0%', variance: '+22.0%', status: 'Critical' },
      { metric: 'Working Capital Cycle', actual: '78 Days', plan: '60 Days', variance: '+18 Days', status: 'Monitor' }
    ],
    drivers: 'Air-freight premiums accounted for $1.1M in unplanned costs due to supplier component manufacturing delays. Port congestion added 9 days to standard maritime transit schedules.',
    riskIntro: 'Critical risk exposure is primarily concentrated in tier-1 vendor reliance and lack of contractual index-hedging for freight and warehousing surcharges.',
    riskCallout: '42% of essential component inventory originates from two co-located manufacturing centers in East Asia, creating acute operational vulnerability in the event of local geopolitical or climate disruptions.',
    riskSecondary: 'Working capital trapped in buffer stock expanded by $3.4M, depressing return on invested capital across trailing quarters.',
    roadmapIntro: 'The Risk Governance Council mandates immediate execution of the following remediation milestones:',
    roadmap: [
      {
        horizon: '30 Days • Immediate',
        title: 'Air-Freight Embargo',
        body: 'Institute strict moratorium on air-freight bookings without explicit sign-off from the Chief Operating Officer; mandate ocean booking adherence.'
      },
      {
        horizon: '60 Days • Remediation',
        title: 'Dual-Sourcing Qualification',
        body: 'Finalize vendor audit and pre-qualification for European and North American alternative component manufacturing suppliers.'
      },
      {
        horizon: '90 Days • Systemic',
        title: 'Logistics Long-Term Contracting',
        body: 'Tender multi-year carrier agreements locking in fixed volumetric rates for 75% of scheduled ocean freight movements.'
      }
    ]
  },
  'saas-retention': {
    subject: 'Enterprise SaaS ARR Growth, Customer Churn & Expansion Economics',
    from: 'VP of Customer Success & Revenue Operations',
    classification: 'Confidential // Executive Operating Committee',
    summaryP1: 'Annual Recurring Revenue (ARR) reached $21.40M at the close of Q3 2026 (+31.2% YoY growth), fueled by robust contract expansions in Fortune 500 accounts and increased multi-product adoption.',
    summaryP2: 'Net Revenue Retention (NRR) reached a historic milestone of 121.4%, underscoring the compounding strength of our enterprise land-and-expand sales model. Gross logo retention remained stable at 95.8%.',
    highlights: 'Customer expansion contributed 48% of total net ARR additions over the period. The release of automated AI analytics features unlocked significant seat upgrades across 64 enterprise enterprise accounts.',
    kpis: [
      { metric: 'Annual Recurring Revenue (ARR)', actual: '$21,400,000', plan: '$19,500,000', variance: '+9.7%', status: 'Optimal' },
      { metric: 'Net Revenue Retention (NRR)', actual: '121.4%', plan: '115.0%', variance: '+6.4%', status: 'Optimal' },
      { metric: 'Gross Logo Churn Rate', actual: '4.2%', plan: '5.0%', variance: '-0.8%', status: 'Optimal' },
      { metric: 'Customer Acquisition Cost (CAC)', actual: '$18,400', plan: '$21,000', variance: '-12.4%', status: 'Optimal' },
      { metric: 'LTV to CAC Multiple', actual: '5.2x', plan: '4.0x', variance: '+1.2x', status: 'Optimal' }
    ],
    drivers: 'Sales cycle velocity contracted from 92 days to 68 days for enterprise accounts. Customer satisfaction scores (CSAT) averaged 96%, with support escalation resolution times improving by 35%.',
    riskIntro: 'While overall metrics are exceptional, retention in lower-tier self-serve segments remains sub-optimal and requires product-led intervention.',
    riskCallout: 'Starter tier monthly churn hovered at 3.8%, eroding the potential pool of accounts eligible for mid-market upselling. Self-serve onboarding friction is identified as the primary catalyst.',
    riskSecondary: 'Customer success coverage ratios expanded to 1:28 enterprise accounts, nearing the operational capacity ceiling.',
    roadmapIntro: 'To support acceleration toward $30M ARR while insulating account retention, we recommend the following roadmap:',
    roadmap: [
      {
        horizon: '30 Days • Immediate',
        title: 'Automated Product Onboarding',
        body: 'Deploy contextual in-app onboarding walkthroughs to reduce starter tier time-to-value from 14 days down to 48 hours.'
      },
      {
        horizon: '60 Days • Scaling',
        title: 'Dedicated CSM Hiring',
        body: 'Onboard 4 strategic Customer Success Managers to return enterprise coverage ratio to an optimal 1:18 accounts.'
      },
      {
        horizon: '90 Days • Expansion',
        title: 'Enterprise Custom SLA Launch',
        body: 'Introduce premium 24/7 dedicated engineering support tier for Tier-1 clients, unlocking an estimated $1.2M in annual service revenue.'
      }
    ]
  }
};

// 2. Clause Library for Quick Injection
const INJECTABLE_CLAUSES = {
  inflation: {
    sectionId: 'section-3',
    text: 'Macroeconomic Inflationary Hedging: In response to persistent input price volatility, proactive cost-indexing clauses were integrated into 82% of multi-year enterprise renewals, neutralizing inflationary margin dilution.'
  },
  apac: {
    sectionId: 'section-2',
    text: 'Asia-Pacific Regional Outperformance: APAC operating entities recorded 38% organic booking expansion, propelled by strong uptake among high-tier enterprise clients in Tokyo and Singapore.'
  },
  supply: {
    sectionId: 'section-3',
    text: 'Supply Chain Dual-Sourcing Resilience: Qualification of secondary tier-1 supplier nodes was finalized ahead of schedule, reducing component delivery variance by 65% across regional distribution centers.'
  },
  capital: {
    sectionId: 'section-4',
    text: 'Capital Re-Allocation Directive: Recommends re-allocating 15% of underperforming regional retail budget directly into high-ROAS digital acquisition funnels to maximize return on invested capital.'
  }
};

// 3. State Store
const state = {
  scenarioKey: 'q4-enterprise',
  tone: 'boardroom',
  audience: 'Executive Committee & Board of Directors'
};

// 4. Update Word Count & Reading Time Telemetry
function updateTelemetry() {
  const paper = document.getElementById('memo-paper');
  if (!paper) return;

  const text = paper.innerText || '';
  const words = text.trim().split(/\s+/).filter(w => w.length > 0).length;
  const minutes = Math.max(1, Math.round(words / 225));

  const wordEl = document.getElementById('stat-word-count');
  const timeEl = document.getElementById('stat-reading-time');

  if (wordEl) wordEl.textContent = `${words.toLocaleString()} words`;
  if (timeEl) timeEl.textContent = `${minutes} min read`;
}

// 5. Populate Memorandum
function renderMemorandum(scenarioKey, tone = 'boardroom', audience = 'Executive Committee & Board of Directors') {
  state.scenarioKey = scenarioKey;
  state.tone = tone;
  state.audience = audience;

  const data = MEMO_SCENARIOS[scenarioKey] || MEMO_SCENARIOS['q4-enterprise'];

  // Meta Elements
  const toVal = document.getElementById('memo-to-value');
  const fromVal = document.getElementById('memo-from-value');
  const dateVal = document.getElementById('memo-date-value');
  const subjectVal = document.getElementById('memo-subject-value');
  const classBadge = document.getElementById('memo-classification-badge');

  if (toVal) toVal.textContent = audience;
  if (fromVal) fromVal.textContent = data.from;
  if (dateVal) dateVal.textContent = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  if (subjectVal) subjectVal.textContent = data.subject;
  if (classBadge) classBadge.textContent = data.classification;

  // Section 1
  const pSum1 = document.getElementById('p-exec-summary-1');
  const pSum2 = document.getElementById('p-exec-summary-2');
  if (pSum1) pSum1.textContent = data.summaryP1;
  if (pSum2) pSum2.textContent = data.summaryP2;

  // Section 2
  const pHigh = document.getElementById('p-perf-highlights');
  const pDrivers = document.getElementById('p-perf-drivers');
  const kpiTbody = document.getElementById('memo-kpi-tbody');

  if (pHigh) pHigh.textContent = data.highlights;
  if (pDrivers) pDrivers.textContent = data.drivers;

  if (kpiTbody && data.kpis) {
    kpiTbody.innerHTML = data.kpis.map(k => `
      <tr>
        <td><strong>${k.metric}</strong></td>
        <td style="font-family:monospace; font-weight:700;">${k.actual}</td>
        <td style="color:var(--text-secondary); font-family:monospace;">${k.plan}</td>
        <td style="font-weight:600; color:${k.variance.startsWith('+') ? 'var(--success)' : 'var(--danger)'};">${k.variance}</td>
        <td>
          <span class="anomaly-badge ${k.status === 'Optimal' ? 'status-healthy' : (k.status === 'Monitor' ? 'status-warning' : 'status-attention')}" style="font-size:0.7rem;">
            ${k.status}
          </span>
        </td>
      </tr>
    `).join('');
  }

  // Section 3
  const pRiskNarrative = document.getElementById('p-risk-narrative');
  const riskCalloutBody = document.getElementById('risk-callout-body');
  const pRiskSecondary = document.getElementById('p-risk-secondary');

  if (pRiskNarrative) pRiskNarrative.textContent = data.riskIntro;
  if (riskCalloutBody) riskCalloutBody.textContent = data.riskCallout;
  if (pRiskSecondary) pRiskSecondary.textContent = data.riskSecondary;

  // Section 4
  const pRoadmapIntro = document.getElementById('p-roadmap-intro');
  if (pRoadmapIntro) pRoadmapIntro.textContent = data.roadmapIntro;

  if (data.roadmap) {
    data.roadmap.forEach((rm, idx) => {
      const titleEl = document.getElementById(`rm-title-${idx + 1}`);
      const bodyEl = document.getElementById(`rm-body-${idx + 1}`);
      if (titleEl) titleEl.textContent = rm.title;
      if (bodyEl) bodyEl.textContent = rm.body;
    });
  }

  updateTelemetry();
}

// 6. Inject Clause
function injectClause(key) {
  const clause = INJECTABLE_CLAUSES[key];
  if (!clause) return;

  const targetSection = document.getElementById(clause.sectionId);
  if (!targetSection) return;

  const newP = document.createElement('p');
  newP.className = 'memo-paragraph';
  newP.contentEditable = 'true';
  newP.spellcheck = false;
  newP.style.background = 'rgba(78, 133, 191, 0.12)';
  newP.style.borderLeft = '3px solid var(--accent)';
  newP.style.padding = '0.5rem 0.75rem';
  newP.textContent = clause.text;

  targetSection.appendChild(newP);
  newP.scrollIntoView({ behavior: 'smooth', block: 'center' });
  newP.focus();
  updateTelemetry();
}

// 7. Copy Memo Text as Markdown
function copyMemoAsMarkdown() {
  const subject = document.getElementById('memo-subject-value')?.innerText || 'Memorandum';
  const to = document.getElementById('memo-to-value')?.innerText || '';
  const from = document.getElementById('memo-from-value')?.innerText || '';
  const date = document.getElementById('memo-date-value')?.innerText || '';

  const s1_p1 = document.getElementById('p-exec-summary-1')?.innerText || '';
  const s1_p2 = document.getElementById('p-exec-summary-2')?.innerText || '';

  const s2_high = document.getElementById('p-perf-highlights')?.innerText || '';
  const s2_driv = document.getElementById('p-perf-drivers')?.innerText || '';

  const s3_intro = document.getElementById('p-risk-narrative')?.innerText || '';
  const s3_call = document.getElementById('risk-callout-body')?.innerText || '';
  const s3_sec = document.getElementById('p-risk-secondary')?.innerText || '';

  const rm1_t = document.getElementById('rm-title-1')?.innerText || '';
  const rm1_b = document.getElementById('rm-body-1')?.innerText || '';
  const rm2_t = document.getElementById('rm-title-2')?.innerText || '';
  const rm2_b = document.getElementById('rm-body-2')?.innerText || '';
  const rm3_t = document.getElementById('rm-title-3')?.innerText || '';
  const rm3_b = document.getElementById('rm-body-3')?.innerText || '';

  let md = `# CORPORATE MEMORANDUM\n\n`;
  md += `**TO:** ${to}\n`;
  md += `**FROM:** ${from}\n`;
  md += `**DATE:** ${date}\n`;
  md += `**SUBJECT:** ${subject}\n`;
  md += `**CLASSIFICATION:** Strictly Confidential // Board Deliberation Only\n\n`;
  md += `---\n\n`;
  md += `## 1. Executive Summary & Context\n\n${s1_p1}\n\n${s1_p2}\n\n`;
  md += `## 2. Key Performance Highlights & Growth Pillars\n\n${s2_high}\n\n${s2_driv}\n\n`;
  md += `## 3. Critical Variance Analysis & Strategic Risk Factors\n\n${s3_intro}\n\n`;
  md += `> **OPERATIONAL RISK CALLOUT:**\n> ${s3_call}\n\n${s3_sec}\n\n`;
  md += `## 4. Strategic Action Playbook & Implementation Horizons\n\n`;
  md += `### 30 Days • Tactical: ${rm1_t}\n${rm1_b}\n\n`;
  md += `### 60 Days • Operational: ${rm2_t}\n${rm2_b}\n\n`;
  md += `### 90 Days • Strategic: ${rm3_t}\n${rm3_b}\n\n`;
  md += `---\n*Generated by AI Report Writer • ALL IN ONE Suite*\n`;

  navigator.clipboard.writeText(md).then(() => {
    const btn = document.getElementById('btn-copy-memo');
    if (btn) {
      const original = btn.innerHTML;
      btn.innerHTML = `<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"></polyline></svg> Copied!`;
      btn.style.background = 'var(--success)';
      setTimeout(() => {
        btn.innerHTML = original;
        btn.style.background = '';
      }, 2000);
    }
  }).catch(() => {
    alert('Memorandum copied to clipboard!');
  });
}

// 8. Event Listeners and Initialization
document.addEventListener('DOMContentLoaded', () => {
  const scenarioSelect = document.getElementById('scenario-select');
  const toneSelect = document.getElementById('tone-select');
  const audienceSelect = document.getElementById('target-audience-select');
  const btnRegenerate = document.getElementById('btn-generate-memo');
  const customBox = document.getElementById('custom-topic-box');

  if (scenarioSelect) {
    scenarioSelect.addEventListener('change', (e) => {
      const val = e.target.value;
      if (val === 'custom') {
        if (customBox) customBox.style.display = 'flex';
      } else {
        if (customBox) customBox.style.display = 'none';
        renderMemorandum(val, toneSelect ? toneSelect.value : 'boardroom', audienceSelect ? audienceSelect.value : 'Executive Committee');
      }
    });
  }

  if (btnRegenerate) {
    btnRegenerate.addEventListener('click', () => {
      const sVal = scenarioSelect ? scenarioSelect.value : 'q4-enterprise';
      if (sVal === 'custom') {
        const customSubject = document.getElementById('custom-subject-input')?.value.trim() || 'Executive Ad-Hoc Strategic Memorandum';
        const customMetrics = document.getElementById('custom-metrics-input')?.value.trim() || '';
        renderMemorandum('q4-enterprise', toneSelect?.value, audienceSelect?.value);
        const subjEl = document.getElementById('memo-subject-value');
        if (subjEl) subjEl.textContent = customSubject;
        if (customMetrics) {
          const pSum1 = document.getElementById('p-exec-summary-1');
          if (pSum1) pSum1.textContent = `Custom Synthesis Context: ${customMetrics}. Strategic metrics evaluated in accordance with executive governance protocols.`;
        }
      } else {
        renderMemorandum(sVal, toneSelect ? toneSelect.value : 'boardroom', audienceSelect ? audienceSelect.value : 'Executive Committee');
      }
    });
  }

  // Clause injection chips
  const clauseChips = document.querySelectorAll('.comment-chip');
  clauseChips.forEach(chip => {
    chip.addEventListener('click', () => {
      const clauseKey = chip.dataset.clause;
      if (clauseKey) {
        injectClause(clauseKey);
      }
    });
  });

  // Print button
  const btnPrint = document.getElementById('btn-print-memo');
  if (btnPrint) {
    btnPrint.addEventListener('click', () => {
      window.print();
    });
  }

  // Copy text button
  const btnCopy = document.getElementById('btn-copy-memo');
  if (btnCopy) {
    btnCopy.addEventListener('click', () => {
      copyMemoAsMarkdown();
    });
  }

  // Listen to input events on memo canvas for word count
  const memoPaper = document.getElementById('memo-paper');
  if (memoPaper) {
    memoPaper.addEventListener('input', () => {
      updateTelemetry();
    });
  }

  // Initial load
  renderMemorandum('q4-enterprise');
});