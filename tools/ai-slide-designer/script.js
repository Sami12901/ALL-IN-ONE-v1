// AI Slide Designer - Client-side Design & Layout Morpher Engine
// Zero server dependencies. 100% interactive client-side execution.

let designSlides = [];
let activeIndex = 0;
let currentTheme = 'theme-obsidian';
let currentFont = 'font-sans';
let isPresenting = false;

// Topic Presets
const DESIGN_PRESETS = {
  'product-architecture': {
    title: 'Scalable AI Microservices Architecture',
    prompt: 'Autonomous distributed inference engine with sub-5ms event routing and zero-trust security',
    layout: 'cards-3',
    slides: [
      {
        kicker: 'SYSTEM TOPOLOGY',
        title: 'Scalable AI Microservices Architecture',
        subtitle: 'Sub-5ms event streaming across distributed GPU inference nodes.',
        layout: 'cards-3',
        items: [
          { title: 'Edge Ingestion Gateway', desc: 'gRPC endpoints handling 250k+ req/sec with TLS 1.3 mutual auth.' },
          { title: 'Dynamic Tensor Router', desc: 'Predictive queue balancing minimizing GPU memory thrashing by 70%.' },
          { title: 'Telemetry & Audit Mesh', desc: 'Real-time eBPF packet capture with zero CPU overhead.' }
        ]
      },
      {
        kicker: 'INFRASTRUCTURE PERFORMANCE',
        title: 'Benchmark Throughput & Efficiency',
        subtitle: 'Uncompromising performance under high concurrency peak loads.',
        layout: 'metrics',
        items: [
          { title: '<4.2ms', desc: 'P99 Latency: Real-time inference turnaround' },
          { title: '99.99%', desc: 'High Availability: Multi-region failover uptime' },
          { title: '4.8x', desc: 'Efficiency Multiplier: Compute density per rack' }
        ]
      },
      {
        kicker: 'SECURITY & GOVERNANCE',
        title: 'Defense-In-Depth Architecture',
        subtitle: 'Enterprise compliance engineered directly into every packet.',
        layout: 'quad-4',
        items: [
          { title: 'Zero-Trust mTLS', desc: 'Hardware-backed TPM keys per worker pod.' },
          { title: 'Air-Gap Isolation', desc: 'Optional sovereign on-prem deployment model.' },
          { title: 'Automated Red Teaming', desc: 'Continuous fuzz testing and prompt injection filters.' },
          { title: 'SOC 2 & FedRAMP', desc: 'Continuous audit logging and verifiable provenance.' }
        ]
      },
      {
        kicker: 'PARADIGM SHIFT',
        title: 'Legacy Monoliths vs Autonomous Mesh',
        subtitle: 'A generational transformation in infrastructure engineering.',
        layout: 'comparison',
        items: [
          { title: 'Legacy Monoliths', desc: 'Fragile batch processing, runaway cloud GPU costs, manual ops alerts, and slow deployment cycles.' },
          { title: 'Autonomous AI Mesh', desc: 'Instant autoscaling, fine-tuned micro-weights, automated self-healing, and sub-second updates.' }
        ]
      },
      {
        kicker: 'EXECUTION HORIZON',
        title: 'Platform Rollout Milestones',
        subtitle: 'Phased rollout plan across infrastructure layers.',
        layout: 'timeline',
        items: [
          { title: 'Phase 1: Foundation', desc: 'Kernel eBPF drivers and distributed memory caching layer deployed.' },
          { title: 'Phase 2: Scale', desc: 'Federated multi-cluster coordination and auto-rebalancing activated.' },
          { title: 'Phase 3: Autonomy', desc: 'Self-tuning model distillation and global edge distribution.' }
        ]
      },
      {
        kicker: 'CORE PHILOSOPHY',
        title: 'Engineering With First Principles',
        subtitle: 'Architecture is not just about compute—it is about velocity, resilience, and elegance.',
        layout: 'quote',
        items: [
          { title: 'True system resilience occurs when failure modes are treated as continuous learning signals.', desc: '— Chief Systems Architect' }
        ]
      }
    ]
  },
  'executive-strategy': {
    title: '2027 Strategic Enterprise Horizon',
    prompt: 'Multi-year strategic vision focusing on market dominance, margin expansion, and international expansion',
    layout: 'split-2',
    slides: [
      {
        kicker: 'STRATEGIC VISION',
        title: '2027 Enterprise Expansion Strategy',
        subtitle: 'Accelerating market leadership across high-velocity growth verticals.',
        layout: 'split-2',
        items: [
          { title: 'The Core Imperative', desc: 'Capturing dominant market share by expanding platform capabilities from single-point tooling into comprehensive enterprise workflow infrastructure.' },
          { title: 'Execution Vectors', desc: '1. Triple Tier-1 enterprise account penetration\n2. Expand international footprint into EMEA & APAC\n3. Protect gross margins above 85% via proprietary tech' }
        ]
      },
      {
        kicker: 'KEY TARGETS',
        title: 'Growth & Profitability Scorecard',
        subtitle: 'Balancing hyper-growth with disciplined capital allocation.',
        layout: 'metrics',
        items: [
          { title: '$100M', desc: 'ARR Target by Q4 2027' },
          { title: '86%', desc: 'Non-GAAP Gross Margin' },
          { title: '135%', desc: 'Net Revenue Retention' }
        ]
      },
      {
        kicker: 'THREE PILLARS',
        title: 'Strategic Execution Pillars',
        subtitle: 'Focusing resources on high-impact scalable advantages.',
        layout: 'cards-3',
        items: [
          { title: 'Platform Dominance', desc: 'Deepen ecosystem integrations with Salesforce, Snowflake, and AWS.' },
          { title: 'Enterprise Security', desc: 'Position zero-trust data residency as our primary enterprise moat.' },
          { title: 'Customer Lifetime Value', desc: 'Develop AI add-ons driving 40%+ expansion revenue per account.' }
        ]
      },
      {
        kicker: 'EVOLUTION',
        title: 'Market Positioning Transformation',
        subtitle: 'From tactical vendor to indispensable strategic platform.',
        layout: 'comparison',
        items: [
          { title: 'Yesterday: Tactical Point Tool', desc: 'Single-department adoption, discretionary software budget, vulnerable to annual renewal cuts.' },
          { title: 'Tomorrow: Core Operating System', desc: 'Organization-wide mission critical backbone, multi-year executive commits, high switching cost.' }
        ]
      },
      {
        kicker: 'HORIZON TIMELINE',
        title: '3-Year Strategic Milestones',
        subtitle: 'Clear phase gates guiding company-wide alignment.',
        layout: 'timeline',
        items: [
          { title: 'Year 1: Foundation', desc: 'Solidify core enterprise platform and launch European sovereign cloud.' },
          { title: 'Year 2: Velocity', desc: 'Scale outbound enterprise sales motions and establish partner channels.' },
          { title: 'Year 3: Market Leader', desc: 'Achieve Rule-of-40 profitability; prepare for public market liquidity.' }
        ]
      },
      {
        kicker: 'EXECUTIVE THESIS',
        title: 'Our Long-Term Conviction',
        subtitle: 'Focusing relentlessly on mission execution.',
        layout: 'quote',
        items: [
          { title: 'The winners of this decade will not be those who build the most features, but those who build the highest trust.', desc: '— CEO & Executive Board' }
        ]
      }
    ]
  },
  'qbr-metrics': {
    title: 'Quarterly Business Review (QBR)',
    prompt: 'Quarterly financial performance, customer retention, net new logos, and operating metrics',
    layout: 'metrics',
    slides: [
      {
        kicker: 'EXECUTIVE OVERVIEW',
        title: 'Q3 Business Performance Review',
        subtitle: 'Strong quarterly execution across all operational and revenue benchmarks.',
        layout: 'hero',
        items: [
          { title: 'Quarter Highlights', desc: 'Outperformed topline revenue guidance by 14% with record net new logo additions.' },
          { title: 'Operating Discipline', desc: 'Maintained positive free cash flow while accelerating product delivery velocity.' }
        ]
      },
      {
        kicker: 'KEY METRICS',
        title: 'Financial & Growth Scorecard',
        subtitle: 'Exceeding targets across ARR, NDR, and customer acquisition.',
        layout: 'metrics',
        items: [
          { title: '$24.2M', desc: 'Current Ending ARR (+44% YoY)' },
          { title: '138%', desc: 'Net Revenue Retention (NDR)' },
          { title: '9.4 mo', desc: 'CAC Payback Period' }
        ]
      },
      {
        kicker: 'PIPELINE ANALYSIS',
        title: 'Sales & Go-To-Market Momentum',
        subtitle: 'Healthy deal velocity across mid-market and enterprise cohorts.',
        layout: 'cards-3',
        items: [
          { title: 'Enterprise Expansion', desc: 'Added 18 Fortune 1000 accounts with average contract size of $120k.' },
          { title: 'Win-Rate Improvement', desc: 'Competitive win-rate increased from 52% to 68% against primary legacy rivals.' },
          { title: 'Inbound Influx', desc: 'Organic inbound trials surged 75% following product release 4.0.' }
        ]
      },
      {
        kicker: 'CHALLENGES & SOLUTIONS',
        title: 'Operational Bottlenecks Addressed',
        subtitle: 'Proactive mitigation of scaling challenges.',
        layout: 'quad-4',
        items: [
          { title: 'Onboarding Latency', desc: 'Reduced time-to-first-value from 14 days down to 48 hours.' },
          { title: 'Support Ticket Volume', desc: 'Integrated AI deflection resolving 42% of tier-1 requests.' },
          { title: 'Sales Cycle Duration', desc: 'Shortened average procurement review by 18 days.' },
          { title: 'Capacity Planning', desc: 'Expanded infrastructure capacity to support 4x peak traffic.' }
        ]
      },
      {
        kicker: 'RETROSPECTIVE',
        title: 'Q2 vs Q3 Performance Comparison',
        subtitle: 'Quantifiable operational acceleration across quarters.',
        layout: 'comparison',
        items: [
          { title: 'Q2 Baseline', desc: 'Initial multi-tenant migration with minor throughput throttles and 112% NDR.' },
          { title: 'Q3 Acceleration', desc: 'Fully optimized distributed cache, zero downtime, and record 138% NDR.' }
        ]
      },
      {
        kicker: 'LOOKING FORWARD',
        title: 'Q4 Strategic Focus & Guidance',
        subtitle: 'Closing the fiscal year with unprecedented momentum.',
        layout: 'timeline',
        items: [
          { title: 'October', desc: 'Complete annual enterprise security audits and roll out v4.5.' },
          { title: 'November', desc: 'Host Annual Customer Summit; launch AI workflow marketplace.' },
          { title: 'December', desc: 'Finalize FY28 operating budget and lock in $30M ARR milestone.' }
        ]
      }
    ]
  },
  'customer-success': {
    title: 'Enterprise Case Study: Global Financial Leader',
    prompt: 'How a Fortune 50 investment bank automated regulatory compliance workflows using our platform',
    layout: 'split-2',
    slides: [
      {
        kicker: 'CLIENT SHOWCASE',
        title: 'Accelerating Enterprise Compliance at Scale',
        subtitle: 'How a Global Tier-1 Investment Bank achieved 12x faster auditing with zero errors.',
        layout: 'split-2',
        items: [
          { title: 'The Client Profile', desc: 'A multinational investment banking firm with $1.2T in assets under management across 42 jurisdictions, managing over 100,000 regulatory compliance filings annually.' },
          { title: 'The Core Challenge', desc: 'Manual review teams were inundated with thousands of cross-border statutory disclosures, resulting in high overtime costs and severe reporting latency.' }
        ]
      },
      {
        kicker: 'QUANTIFIED IMPACT',
        title: 'Verified Client Results',
        subtitle: 'Audited performance gains in the first 90 days of deployment.',
        layout: 'metrics',
        items: [
          { title: '92%', desc: 'Reduction in manual review hours' },
          { title: '$4.2M', desc: 'Annualized compliance savings' },
          { title: '100%', desc: 'Regulatory audit accuracy score' }
        ]
      },
      {
        kicker: 'THREE-PHASE IMPLEMENTATION',
        title: 'Architecture & Rollout Approach',
        subtitle: 'From pilot sandbox to production enterprise deployment in 6 weeks.',
        layout: 'cards-3',
        items: [
          { title: 'Week 1-2: Ingestion', desc: 'Integrated sovereign on-prem connectors to legacy mainframe repositories.' },
          { title: 'Week 3-4: Tuning', desc: 'Fine-tuned domain compliance models on 10 years of precedent legal filings.' },
          { title: 'Week 5-6: Cutover', desc: 'Automated 100% of standard filings with human-in-the-loop review for edge cases.' }
        ]
      },
      {
        kicker: 'TRANSFORMATION',
        title: 'Operational Transformation',
        subtitle: 'Before and after adoption of our autonomous engine.',
        layout: 'comparison',
        items: [
          { title: 'Legacy Workflow', desc: '72-hour turnaround per audit packet, high staff burnout, error risk, and millions in penalty reserves.' },
          { title: 'Automated Future', desc: 'Under 4 minutes per audit packet, comprehensive automated audit trail, zero penalty exposure.' }
        ]
      },
      {
        kicker: 'CLIENT TESTIMONIAL',
        title: 'Executive Endorsement',
        subtitle: 'Words from the Chief Risk Officer.',
        layout: 'quote',
        items: [
          { title: 'This platform fundamentally transformed our risk posture. What previously took a team of 40 analysts three weeks now executes with flawless accuracy before our morning coffee.', desc: '— Chief Compliance & Risk Officer, Tier-1 Bank' }
        ]
      },
      {
        kicker: 'NEXT HORIZONS',
        title: 'Global Expansion Roadmap',
        subtitle: 'Extending platform adoption across all global divisions.',
        layout: 'timeline',
        items: [
          { title: 'North America', desc: 'Fully operational across commercial and investment banking divisions.' },
          { title: 'EMEA Rollout', desc: 'Currently expanding to London, Frankfurt, and Zurich offices.' },
          { title: 'APAC Expansion', desc: 'Scheduled for Singapore, Tokyo, and Sydney operations in Q2.' }
        ]
      }
    ]
  },
  'pricing-tiers': {
    title: 'Modern SaaS Pricing Architecture',
    prompt: 'Tiered pricing strategy with transparent value metrics, starter, pro, and enterprise tiers',
    layout: 'cards-3',
    slides: [
      {
        kicker: 'COMMERCIAL MODEL',
        title: 'Transparent, Value-Aligned Pricing',
        subtitle: 'Designed to scale smoothly from early-stage teams to global Fortune 500 enterprises.',
        layout: 'hero',
        items: [
          { title: 'Predictable Pricing', desc: 'No surprise seat overages. Pay for the compute and workflows your business actually consumes.' },
          { title: 'Enterprise Scalability', desc: 'Volume discounting and custom deployment topologies available.' }
        ]
      },
      {
        kicker: 'TIER MATRIX',
        title: 'Choose the Right Plan For Your Scale',
        subtitle: 'Feature-rich tiers crafted for modern engineering and operations teams.',
        layout: 'cards-3',
        items: [
          { title: 'Starter: $499/mo', desc: 'Up to 5 seats, 50k workflow runs/mo, community support, standard API access.' },
          { title: 'Professional: $1,999/mo', desc: 'Up to 25 seats, 500k workflow runs/mo, 99.9% SLA, dedicated Slack channel, advanced analytics.' },
          { title: 'Enterprise: Custom', desc: 'Unlimited seats, dedicated compute pods, custom SLA, SOC 2 Type II audit reports, 24/7 phone support.' }
        ]
      },
      {
        kicker: 'VALUE REALIZATION',
        title: 'Quantified Return on Investment',
        subtitle: 'Our customers save on average 4.8x their annual subscription fees.',
        layout: 'metrics',
        items: [
          { title: '4.8x', desc: 'Average Year-1 ROI multiple' },
          { title: '18 hrs', desc: 'Saved per employee weekly' },
          { title: '<3 mo', desc: 'Average payback timeframe' }
        ]
      },
      {
        kicker: 'CAPABILITIES BREAKDOWN',
        title: 'Included Across All Premium Tiers',
        subtitle: 'Enterprise-grade guarantees from day one.',
        layout: 'quad-4',
        items: [
          { title: 'Zero Data Training', desc: 'Your proprietary data is never used to train global public models.' },
          { title: 'Role-Based Access', desc: 'Granular SSO, Okta, and SAML 2.0 integration out of the box.' },
          { title: '99.95% Uptime SLA', desc: 'Multi-region failover architecture backing your uptime.' },
          { title: 'Custom Fine-Tuning', desc: 'Deploy fine-tuned adapters tailored to your domain schema.' }
        ]
      },
      {
        kicker: 'CONTRACT VALUE',
        title: 'Monthly Flexibility vs Annual Savings',
        subtitle: 'Lock in substantial savings with multi-year partnerships.',
        layout: 'comparison',
        items: [
          { title: 'Month-to-Month', desc: 'Full flexibility, cancel anytime, standard list pricing, billed monthly.' },
          { title: 'Annual Commit (Recommended)', desc: '25% discount, dedicated success manager, priority onboarding, and custom feature roadmap requests.' }
        ]
      },
      {
        kicker: 'GET STARTED',
        title: 'Seamless Onboarding In 3 Steps',
        subtitle: 'Begin achieving value within hours of kickoff.',
        layout: 'timeline',
        items: [
          { title: 'Step 1: Connect', desc: 'Connect your cloud credentials or run our 1-click Docker container.' },
          { title: 'Step 2: Configure', desc: 'Import your team schemas and define automated rule boundaries.' },
          { title: 'Step 3: Accelerate', desc: 'Activate autonomous agent pipelines and observe instantaneous efficiency gains.' }
        ]
      }
    ]
  }
};

// Generate default deck from prompt
function generateCustomDeck(promptText, layout) {
  const words = promptText.split(' ');
  const topicTitle = words.slice(0, 5).join(' ');

  return [
    {
      kicker: 'EXECUTIVE OVERVIEW',
      title: topicTitle || 'Strategic Presentation',
      subtitle: promptText,
      layout: 'hero',
      items: [
        { title: 'Core Objective', desc: 'Drive high-impact organizational alignment around strategic initiatives.' },
        { title: 'Key Outcome', desc: 'Accelerate decision-making velocity and measurable operational execution.' }
      ]
    },
    {
      kicker: 'STRATEGIC PILLARS',
      title: 'Three Pillars of Execution',
      subtitle: 'Structured framework for achieving organizational excellence.',
      layout: layout || 'cards-3',
      items: [
        { title: 'Pillar 1: Modernization', desc: 'Eliminate legacy bottlenecks and automate repetitive workflows.' },
        { title: 'Pillar 2: Performance', desc: 'Achieve sub-second latency and uncompromised scalability.' },
        { title: 'Pillar 3: Resilience', desc: 'Implement zero-trust security architecture across all touchpoints.' }
      ]
    },
    {
      kicker: 'QUANTIFIED IMPACT',
      title: 'Target Benchmark Metrics',
      subtitle: 'Audited performance improvements expected upon rollout.',
      layout: 'metrics',
      items: [
        { title: '3.5x', desc: 'Operational throughput multiplier' },
        { title: '85%', desc: 'Reduction in manual processing friction' },
        { title: '99.9%', desc: 'Guaranteed platform reliability SLA' }
      ]
    },
    {
      kicker: 'PARADIGM SHIFT',
      title: 'Before vs After Implementation',
      subtitle: 'Clear contrast between status quo and optimized future state.',
      layout: 'comparison',
      items: [
        { title: 'Current Status Quo', desc: 'Fragmented manual coordination, high error rates, slow feedback loops, and escalating maintenance overhead.' },
        { title: 'Optimized Future State', desc: 'Seamless unified automation, predictive telemetry, instant execution, and declining operating unit costs.' }
      ]
    },
    {
      kicker: 'EXECUTION PLAN',
      title: 'Phased Implementation Roadmap',
      subtitle: 'Systematic milestone schedule ensuring zero-downtime cutover.',
      layout: 'timeline',
      items: [
        { title: 'Phase 1: Ingestion', desc: 'Audit current systems and establish secure API bridge connectors.' },
        { title: 'Phase 2: Pilot', desc: 'Deploy sandbox environment with top-tier internal stakeholders.' },
        { title: 'Phase 3: Scale', desc: 'Organization-wide rollout accompanied by ongoing telemetry analytics.' }
      ]
    },
    {
      kicker: 'CLOSING THESIS',
      title: 'Visionary Horizon',
      subtitle: 'Commitment to continuous innovation and industry leadership.',
      layout: 'quote',
      items: [
        { title: 'True competitive advantage stems from the courage to replace working systems with transformative ones.', desc: '— Strategic Leadership Team' }
      ]
    }
  ];
}

// Render Slide Content into DOM Container
function renderSlideInto(slide, container, isFullscreen = false) {
  if (!slide || !container) return;

  const layout = slide.layout || 'cards-3';
  let bodyContent = '';

  if (layout === 'cards-3') {
    bodyContent = `
      <div class="layout-cards-3">
        ${(slide.items || []).map(item => `
          <div class="glass-card">
            <h4 style="font-size: 1.05rem; font-weight: 700; color: #fff; margin-bottom: 0.4rem;">${escapeHtml(item.title || '')}</h4>
            <p style="font-size: 0.85rem; color: #94a3b8; line-height: 1.45; margin: 0;">${escapeHtml(item.desc || '')}</p>
          </div>
        `).join('')}
      </div>
    `;
  } else if (layout === 'split-2') {
    bodyContent = `
      <div class="layout-split-2">
        ${(slide.items || []).map(item => `
          <div class="glass-card" style="padding: 1.5rem;">
            <h3 style="font-size: 1.2rem; font-weight: 700; color: #fff; margin-bottom: 0.75rem;">${escapeHtml(item.title || '')}</h3>
            <p style="font-size: 0.95rem; color: #cbd5e1; line-height: 1.6; white-space: pre-line;">${escapeHtml(item.desc || '')}</p>
          </div>
        `).join('')}
      </div>
    `;
  } else if (layout === 'quad-4') {
    bodyContent = `
      <div class="layout-quad-4">
        ${(slide.items || []).map(item => `
          <div class="glass-card" style="padding: 1rem 1.25rem;">
            <h4 style="font-size: 1rem; font-weight: 700; color: #fff; margin-bottom: 0.35rem;">${escapeHtml(item.title || '')}</h4>
            <p style="font-size: 0.82rem; color: #94a3b8; line-height: 1.4; margin: 0;">${escapeHtml(item.desc || '')}</p>
          </div>
        `).join('')}
      </div>
    `;
  } else if (layout === 'metrics') {
    bodyContent = `
      <div class="layout-metrics-row">
        ${(slide.items || []).map(item => `
          <div class="glass-card" style="padding: 1.5rem; text-align: left;">
            <div style="font-size: clamp(2rem, 3.5vw, 3rem); font-weight: 900; color: #818cf8; line-height: 1; margin-bottom: 0.5rem;">${escapeHtml(item.title || '')}</div>
            <p style="font-size: 0.9rem; color: #cbd5e1; line-height: 1.4; margin: 0;">${escapeHtml(item.desc || '')}</p>
          </div>
        `).join('')}
      </div>
    `;
  } else if (layout === 'comparison') {
    bodyContent = `
      <div class="layout-comparison">
        ${(slide.items || []).slice(0, 2).map((item, idx) => `
          <div class="glass-card" style="padding: 1.5rem; border-color: ${idx === 1 ? 'rgba(99, 102, 241, 0.4)' : 'rgba(239, 68, 68, 0.25)'};">
            <span style="font-size: 0.72rem; font-weight: 800; text-transform: uppercase; color: ${idx === 1 ? '#4ade80' : '#f87171'}; margin-bottom: 0.5rem; display: block;">${idx === 0 ? 'Status Quo' : 'Transformed State'}</span>
            <h4 style="font-size: 1.2rem; font-weight: 700; color: #fff; margin-bottom: 0.75rem;">${escapeHtml(item.title || '')}</h4>
            <p style="font-size: 0.9rem; color: #cbd5e1; line-height: 1.5; margin: 0;">${escapeHtml(item.desc || '')}</p>
          </div>
        `).join('')}
      </div>
    `;
  } else if (layout === 'timeline') {
    bodyContent = `
      <div class="layout-timeline">
        ${(slide.items || []).map((item, idx) => `
          <div class="glass-card" style="padding: 1.25rem;">
            <div style="display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.5rem;">
              <span style="background: var(--accent); color: #fff; width: 22px; height: 22px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 0.75rem; font-weight: 800;">${idx + 1}</span>
              <h4 style="font-size: 1rem; font-weight: 700; color: #fff; margin: 0;">${escapeHtml(item.title || '')}</h4>
            </div>
            <p style="font-size: 0.85rem; color: #94a3b8; line-height: 1.45; margin: 0;">${escapeHtml(item.desc || '')}</p>
          </div>
        `).join('')}
      </div>
    `;
  } else if (layout === 'quote') {
    const qItem = slide.items?.[0] || { title: 'Strategic vision statement.', desc: '— Author' };
    bodyContent = `
      <div style="margin-top: 2rem; background: rgba(255,255,255,0.03); border-left: 4px solid var(--accent); padding: 2rem; border-radius: 0 var(--radius-md) var(--radius-md) 0;">
        <p style="font-size: clamp(1.2rem, 2vw, 1.6rem); font-style: italic; color: #f1f5f9; line-height: 1.5; margin-bottom: 1rem;">"${escapeHtml(qItem.title || '')}"</p>
        <span style="font-size: 0.95rem; font-weight: 600; color: var(--accent);">${escapeHtml(qItem.desc || '')}</span>
      </div>
    `;
  } else { // Hero
    bodyContent = `
      <div style="margin-top: 1.5rem; display: flex; flex-direction: column; gap: 1rem;">
        ${(slide.items || []).map(item => `
          <div class="glass-card" style="padding: 1.25rem;">
            <h4 style="font-size: 1.1rem; font-weight: 700; color: #fff; margin-bottom: 0.35rem;">${escapeHtml(item.title || '')}</h4>
            <p style="font-size: 0.9rem; color: #cbd5e1; margin: 0;">${escapeHtml(item.desc || '')}</p>
          </div>
        `).join('')}
      </div>
    `;
  }

  container.innerHTML = `
    <div>
      <div class="badge-kicker">${escapeHtml(slide.kicker || 'DESIGN')}</div>
      <h2 class="main-heading">${escapeHtml(slide.title || 'Slide Title')}</h2>
      <p class="sub-heading">${escapeHtml(slide.subtitle || '')}</p>
      ${bodyContent}
    </div>
    <div class="slide-footer">
      <span>AI Slide Designer Studio</span>
      <span>Slide ${activeIndex + 1} of ${designSlides.length} (${slide.layout || 'cards-3'})</span>
    </div>
  `;
}

// Render Thumbnails
function renderThumbnails() {
  const container = document.getElementById('designer-thumbs-container');
  if (!container) return;

  container.innerHTML = '';
  designSlides.forEach((slide, idx) => {
    const thumb = document.createElement('div');
    thumb.className = `slide-thumb ${idx === activeIndex ? 'active' : ''}`;
    thumb.onclick = () => selectSlide(idx);

    thumb.innerHTML = `
      <span style="font-weight: 800; font-size: 0.75rem; color: var(--accent);">#${idx + 1}</span>
      <div style="flex: 1; overflow: hidden;">
        <div style="font-size: 0.7rem; color: var(--text-secondary); text-transform: uppercase;">${escapeHtml(slide.layout || 'cards-3')}</div>
        <div style="font-size: 0.82rem; font-weight: 600; color: #fff; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${escapeHtml(slide.title || 'Untitled')}</div>
      </div>
    `;
    container.appendChild(thumb);
  });

  const counter = document.getElementById('counter-active-slide');
  if (counter) counter.textContent = `${activeIndex + 1} / ${designSlides.length}`;

  const badge = document.getElementById('badge-slide-count');
  if (badge) badge.textContent = `${designSlides.length} Slides`;
}

// Select Slide
function selectSlide(idx) {
  if (idx < 0 || idx >= designSlides.length) return;
  activeIndex = idx;
  renderThumbnails();

  const viewport = document.getElementById('canvas-slide-viewport');
  if (viewport) {
    viewport.className = `slide-viewport ${currentTheme} ${currentFont}`;
    renderSlideInto(designSlides[activeIndex], viewport, false);
  }

  const cur = designSlides[activeIndex];
  if (cur) {
    const inTitle = document.getElementById('inp-edit-title');
    const inKicker = document.getElementById('inp-edit-kicker');
    const inSub = document.getElementById('inp-edit-sub');
    const inContent = document.getElementById('inp-edit-content');
    const selLayout = document.getElementById('select-slide-layout');

    if (inTitle) inTitle.value = cur.title || '';
    if (inKicker) inKicker.value = cur.kicker || '';
    if (inSub) inSub.value = cur.subtitle || '';
    if (selLayout) selLayout.value = cur.layout || 'cards-3';

    if (inContent) {
      inContent.value = (cur.items || []).map(i => `${i.title}: ${i.desc}`).join('\n');
    }
  }

  if (isPresenting) {
    updateFullscreen();
  }
}

// Sync Editor into Active Slide
function syncEditorToSlide() {
  const cur = designSlides[activeIndex];
  if (!cur) return;

  const inTitle = document.getElementById('inp-edit-title');
  const inKicker = document.getElementById('inp-edit-kicker');
  const inSub = document.getElementById('inp-edit-sub');
  const inContent = document.getElementById('inp-edit-content');

  if (inTitle) cur.title = inTitle.value;
  if (inKicker) cur.kicker = inKicker.value;
  if (inSub) cur.subtitle = inSub.value;

  if (inContent) {
    const lines = inContent.value.split('\n').map(l => l.trim()).filter(Boolean);
    cur.items = lines.map(line => {
      if (line.includes(':')) {
        const parts = line.split(':');
        return { title: parts[0].trim(), desc: parts.slice(1).join(':').trim() };
      }
      return { title: line, desc: '' };
    });
  }

  renderThumbnails();
  const viewport = document.getElementById('canvas-slide-viewport');
  if (viewport) {
    renderSlideInto(cur, viewport, false);
  }
}

// AI Polish / Beautify
function beautifyActiveSlide() {
  const cur = designSlides[activeIndex];
  if (!cur) return;

  // Enhance Title and Kicker
  if (!cur.kicker || cur.kicker.length < 3) cur.kicker = 'STRATEGIC IMPERATIVE';
  cur.title = cur.title.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');

  // Polish items
  if (cur.items && cur.items.length > 0) {
    cur.items.forEach(item => {
      if (!item.title.endsWith(':') && item.title.length > 0) {
        item.title = item.title.charAt(0).toUpperCase() + item.title.slice(1);
      }
      if (item.desc && !item.desc.endsWith('.')) {
        item.desc += '.';
      }
    });
  }

  selectSlide(activeIndex);
}

// Fullscreen Presentation Mode
function openFullscreen() {
  const modal = document.getElementById('fs-present-modal');
  if (!modal) return;
  isPresenting = true;
  modal.classList.add('active');
  updateFullscreen();

  if (document.documentElement.requestFullscreen) {
    document.documentElement.requestFullscreen().catch(() => {});
  }
}

function closeFullscreen() {
  const modal = document.getElementById('fs-present-modal');
  if (!modal) return;
  isPresenting = false;
  modal.classList.remove('active');

  if (document.fullscreenElement && document.exitFullscreen) {
    document.exitFullscreen().catch(() => {});
  }
}

function updateFullscreen() {
  const fsViewport = document.getElementById('fs-slide-viewport');
  const fsNum = document.getElementById('fs-slide-num');
  if (!fsViewport) return;

  fsViewport.className = `slide-viewport ${currentTheme} ${currentFont}`;
  renderSlideInto(designSlides[activeIndex], fsViewport, true);

  if (fsNum) {
    fsNum.textContent = `${activeIndex + 1} / ${designSlides.length}`;
  }
}

function nextSlide() {
  if (activeIndex < designSlides.length - 1) {
    selectSlide(activeIndex + 1);
  }
}

function prevSlide() {
  if (activeIndex > 0) {
    selectSlide(activeIndex - 1);
  }
}

// Slide Management
function addSlide() {
  const newSlide = {
    kicker: 'NEW INSIGHT',
    title: 'Custom Designed Slide',
    subtitle: 'Enter your concept description and strategic takeaways.',
    layout: 'cards-3',
    items: [
      { title: 'Core Dimension 1', desc: 'Description of key architectural advantage.' },
      { title: 'Core Dimension 2', desc: 'Performance and efficiency metrics.' },
      { title: 'Core Dimension 3', desc: 'Long-term scalability and business impact.' }
    ]
  };
  designSlides.splice(activeIndex + 1, 0, newSlide);
  selectSlide(activeIndex + 1);
}

function duplicateSlide() {
  if (!designSlides[activeIndex]) return;
  const clone = JSON.parse(JSON.stringify(designSlides[activeIndex]));
  clone.title += ' (Copy)';
  designSlides.splice(activeIndex + 1, 0, clone);
  selectSlide(activeIndex + 1);
}

function deleteSlide() {
  if (designSlides.length <= 1) {
    alert('Slide deck must contain at least 1 slide.');
    return;
  }
  designSlides.splice(activeIndex, 1);
  if (activeIndex >= designSlides.length) {
    activeIndex = designSlides.length - 1;
  }
  selectSlide(activeIndex);
}

function moveSlideUp() {
  if (activeIndex <= 0) return;
  const temp = designSlides[activeIndex];
  designSlides[activeIndex] = designSlides[activeIndex - 1];
  designSlides[activeIndex - 1] = temp;
  selectSlide(activeIndex - 1);
}

function moveSlideDown() {
  if (activeIndex >= designSlides.length - 1) return;
  const temp = designSlides[activeIndex];
  designSlides[activeIndex] = designSlides[activeIndex + 1];
  designSlides[activeIndex + 1] = temp;
  selectSlide(activeIndex + 1);
}

// Exports
function exportStandaloneHtml() {
  const deckTitle = designSlides[0]?.title || 'Slide Deck Presentation';
  const slidesJson = JSON.stringify(designSlides);

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeHtml(deckTitle)} - Interactive Slide Presentation</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      background: #060911;
      color: #f8fafc;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
      overflow: hidden;
    }
    .viewport {
      width: 95vw;
      max-width: 1300px;
      aspect-ratio: 16 / 9;
      background: radial-gradient(circle at 85% 15%, rgba(99, 102, 241, 0.18), transparent 50%),
                  radial-gradient(circle at 15% 85%, rgba(168, 85, 247, 0.12), transparent 50%),
                  #0c101c;
      border-radius: 16px;
      border: 1px solid rgba(255, 255, 255, 0.12);
      box-shadow: 0 20px 50px rgba(0, 0, 0, 0.8);
      position: relative;
      overflow: hidden;
      display: flex;
      padding: 3.5rem;
      flex-direction: column;
      justify-content: space-between;
    }
    .badge {
      display: inline-block;
      padding: 0.25rem 0.65rem;
      background: rgba(255,255,255,0.08);
      border: 1px solid rgba(255,255,255,0.15);
      border-radius: 9999px;
      font-size: 0.75rem;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      color: #94a3b8;
      margin-bottom: 0.6rem;
    }
    h1 { font-size: 2.3rem; font-weight: 800; line-height: 1.15; margin-bottom: 0.4rem; color: #fff; }
    p.sub { font-size: 1.05rem; color: #94a3b8; margin-bottom: 1.25rem; line-height: 1.5; }
    .grid3 { display: grid; grid-template-columns: repeat(3, 1fr); gap: 1rem; margin-top: 1rem; }
    .grid2 { display: grid; grid-template-columns: 1fr 1fr; gap: 1.5rem; margin-top: 1rem; }
    .card { background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.1); border-radius: 12px; padding: 1.25rem; }
    .card h3 { font-size: 1.05rem; margin-bottom: 0.4rem; color: #fff; font-weight: 700; }
    .card p { font-size: 0.85rem; color: #94a3b8; line-height: 1.45; }
    .val { font-size: 2.5rem; font-weight: 900; color: #818cf8; line-height: 1; margin-bottom: 0.4rem; }
    .footer { display: flex; justify-content: space-between; border-top: 1px solid rgba(255,255,255,0.08); padding-top: 0.75rem; font-size: 0.75rem; color: #64748b; }
    .nav {
      position: fixed;
      bottom: 1.5rem;
      display: flex;
      align-items: center;
      gap: 1rem;
      background: rgba(15, 23, 42, 0.9);
      padding: 0.5rem 1.25rem;
      border-radius: 9999px;
      border: 1px solid rgba(255,255,255,0.15);
    }
    button { background: transparent; border: none; color: #fff; font-weight: 700; cursor: pointer; padding: 0.3rem 0.6rem; }
  </style>
</head>
<body>
  <div class="viewport" id="root"></div>
  <div class="nav">
    <button id="p">&larr; Prev</button>
    <span id="c" style="color: #818cf8; font-weight: 700;"></span>
    <button id="n">Next &rarr;</button>
  </div>
  <script>
    const slides = ${slidesJson};
    let cur = 0;
    function render() {
      const s = slides[cur];
      let b = '';
      if (s.layout === 'metrics') {
        b = '<div class="grid3">' + (s.items||[]).map(i => '<div class="card"><div class="val">' + i.title + '</div><p>' + i.desc + '</p></div>').join('') + '</div>';
      } else if (s.layout === 'split-2' || s.layout === 'comparison') {
        b = '<div class="grid2">' + (s.items||[]).map(i => '<div class="card"><h3>' + i.title + '</h3><p>' + i.desc + '</p></div>').join('') + '</div>';
      } else {
        b = '<div class="grid3">' + (s.items||[]).map(i => '<div class="card"><h3>' + i.title + '</h3><p>' + i.desc + '</p></div>').join('') + '</div>';
      }
      document.getElementById('root').innerHTML = '<div><div class="badge">' + (s.kicker||'') + '</div><h1>' + (s.title||'') + '</h1><p class="sub">' + (s.subtitle||'') + '</p>' + b + '</div><div class="footer"><span>AI Slide Presentation</span><span>Slide ' + (cur+1) + ' of ' + slides.length + '</span></div>';
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

  downloadBlob(html, `${deckTitle.toLowerCase().replace(/[^a-z0-9]/g, '_')}_presentation.html`, 'text/html');
}

function exportDeckJson() {
  const jsonStr = JSON.stringify(designSlides, null, 2);
  const deckTitle = designSlides[0]?.title || 'slide_deck';
  downloadBlob(jsonStr, `${deckTitle.toLowerCase().replace(/[^a-z0-9]/g, '_')}.json`, 'application/json');
}

function importDeckJson(file) {
  const reader = new FileReader();
  reader.onload = e => {
    try {
      const data = JSON.parse(e.target.result);
      if (Array.isArray(data) && data.length > 0) {
        designSlides = data;
        activeIndex = 0;
        renderThumbnails();
        selectSlide(0);
      } else {
        alert('Invalid JSON: Expected array of slide objects.');
      }
    } catch (err) {
      alert('Failed to parse JSON.');
    }
  };
  reader.readAsText(file);
}

function printDeckPdf() {
  const printTarget = document.getElementById('designer-print-target');
  if (!printTarget) return;

  printTarget.innerHTML = '';
  designSlides.forEach((slide, idx) => {
    const page = document.createElement('div');
    page.className = `print-slide-box ${currentTheme} ${currentFont}`;
    renderSlideInto(slide, page, false);
    printTarget.appendChild(page);
  });

  window.print();
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

// Initialization & Event Binding
document.addEventListener('DOMContentLoaded', () => {
  const promptInput = document.getElementById('inp-designer-prompt');
  const layoutSelect = document.getElementById('select-slide-layout');
  const themeSelect = document.getElementById('select-slide-theme');
  const fontSelect = document.getElementById('select-typography');

  // Load Initial Deck from product-architecture preset
  const initPreset = DESIGN_PRESETS['product-architecture'];
  designSlides = JSON.parse(JSON.stringify(initPreset.slides));

  renderThumbnails();
  selectSlide(0);

  // Generate Button
  document.getElementById('btn-design-generate')?.addEventListener('click', () => {
    const p = promptInput ? promptInput.value.trim() : 'System Architecture';
    const l = layoutSelect ? layoutSelect.value : 'cards-3';
    designSlides = generateCustomDeck(p, l);
    activeIndex = 0;
    renderThumbnails();
    selectSlide(0);
  });

  // Presets
  const presetPills = document.querySelectorAll('.design-pill');
  presetPills.forEach(pill => {
    pill.addEventListener('click', () => {
      const key = pill.getAttribute('data-preset');
      const preset = DESIGN_PRESETS[key];
      if (preset) {
        if (promptInput) promptInput.value = preset.prompt;
        designSlides = JSON.parse(JSON.stringify(preset.slides));
        activeIndex = 0;
        renderThumbnails();
        selectSlide(0);
      }
    });
  });

  // Layout Morpher
  if (layoutSelect) {
    layoutSelect.addEventListener('change', () => {
      const cur = designSlides[activeIndex];
      if (cur) {
        cur.layout = layoutSelect.value;
        renderThumbnails();
        const viewport = document.getElementById('canvas-slide-viewport');
        if (viewport) {
          renderSlideInto(cur, viewport, false);
        }
      }
    });
  }

  // Theme Selector
  if (themeSelect) {
    themeSelect.addEventListener('change', () => {
      currentTheme = themeSelect.value;
      const viewport = document.getElementById('canvas-slide-viewport');
      if (viewport) {
        viewport.className = `slide-viewport ${currentTheme} ${currentFont}`;
      }
      if (isPresenting) updateFullscreen();
    });
  }

  // Typography Selector
  if (fontSelect) {
    fontSelect.addEventListener('change', () => {
      currentFont = fontSelect.value;
      const viewport = document.getElementById('canvas-slide-viewport');
      if (viewport) {
        viewport.className = `slide-viewport ${currentTheme} ${currentFont}`;
      }
      if (isPresenting) updateFullscreen();
    });
  }

  // Inspector Inputs
  ['inp-edit-title', 'inp-edit-kicker', 'inp-edit-sub', 'inp-edit-content'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.addEventListener('input', syncEditorToSlide);
  });

  // Beautify
  document.getElementById('btn-beautify')?.addEventListener('click', beautifyActiveSlide);

  // Reordering & Management
  document.getElementById('btn-add-slide')?.addEventListener('click', addSlide);
  document.getElementById('btn-slide-up')?.addEventListener('click', moveSlideUp);
  document.getElementById('btn-slide-down')?.addEventListener('click', moveSlideDown);
  document.getElementById('btn-slide-duplicate')?.addEventListener('click', duplicateSlide);
  document.getElementById('btn-slide-delete')?.addEventListener('click', deleteSlide);

  // Fullscreen Presentation
  document.getElementById('btn-present-fullscreen')?.addEventListener('click', openFullscreen);
  document.getElementById('fs-nav-exit')?.addEventListener('click', closeFullscreen);
  document.getElementById('fs-nav-next')?.addEventListener('click', nextSlide);
  document.getElementById('fs-nav-prev')?.addEventListener('click', prevSlide);

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
        nextSlide();
      }
    } else if (e.key === 'ArrowLeft') {
      if (isPresenting) {
        e.preventDefault();
        prevSlide();
      }
    }
  });

  // Exports
  document.getElementById('btn-export-html')?.addEventListener('click', exportStandaloneHtml);
  document.getElementById('btn-export-json')?.addEventListener('click', exportDeckJson);
  document.getElementById('btn-export-pdf')?.addEventListener('click', printDeckPdf);

  const importInput = document.getElementById('input-import-json');
  if (importInput) {
    importInput.addEventListener('change', e => {
      if (e.target.files && e.target.files[0]) {
        importDeckJson(e.target.files[0]);
      }
    });
  }
});