// Ready-Made Slide Templates - Presentation Studio Engine

const TEMPLATE_DEFINITIONS = [
  {
    id: 'title',
    name: 'Title & Hero',
    category: 'pitch',
    description: 'Impactful opener with project title, subtitle, presenter, and date.',
    defaultData: {
      type: 'title',
      kicker: 'Strategic Presentation',
      title: 'Aura Intelligence Platform',
      subtitle: 'Next-Generation Autonomous Reasoning for Enterprise Decision Systems',
      presenter: 'Elena Vance, Founder & CEO',
      date: 'Q4 2026 Strategy Review',
      accentColor: '#6366f1'
    }
  },
  {
    id: 'problem',
    name: 'Problem & Pain Points',
    category: 'pitch',
    description: 'Highlights 3 critical market pains with concrete impact statements.',
    defaultData: {
      type: 'problem',
      kicker: 'The Challenge',
      title: 'Enterprise Fragmentation at Scale',
      subtitle: 'Knowledge workers spend 38% of their weekly capacity manually syncing disconnected tools.',
      points: [
        'Siloed Data Lakes: 82% of mission-critical corporate context remains trapped in disparate SaaS tools.',
        'Fragile Automation: Legacy brittle RPA bots require frequent developer intervention and costly maintenance.',
        'Delayed Decision Velocity: Executive approvals lag by an average of 4.2 days due to missing real-time context.'
      ],
      accentColor: '#f43f5e'
    }
  },
  {
    id: 'solution',
    name: 'Solution & Value Prop',
    category: 'pitch',
    description: '3 clear solution pillars demonstrating how your product solves the core problem.',
    defaultData: {
      type: 'solution',
      kicker: 'The Innovation',
      title: 'Deterministic Cognitive Mesh',
      subtitle: 'An autonomous enterprise nervous system connecting data, logic, and automated action.',
      pillars: [
        { title: 'Zero-Hallucination Engine', desc: 'Policy-governed neural execution with 99.98% deterministic audit trails.' },
        { title: 'Unified Data Mesh', desc: 'Live bi-directional telemetry across 250+ enterprise systems in under 50ms.' },
        { title: 'Self-Healing Workflows', desc: 'Continuous runtime adaptation preventing breaking workflow changes.' }
      ],
      accentColor: '#10b981'
    }
  },
  {
    id: 'market',
    name: 'Market Opportunity (TAM/SAM/SOM)',
    category: 'pitch',
    description: 'Market size breakdown featuring TAM, SAM, SOM, and CAGR metrics.',
    defaultData: {
      type: 'market',
      kicker: 'Market Size',
      title: '$148B Global Market Opportunity',
      subtitle: 'Capturing explosive secular tailwinds across enterprise automation and applied intelligence.',
      tamVal: '$148B',
      tamDesc: 'Global Enterprise AI & Automation TAM by 2029',
      samVal: '$34B',
      samDesc: 'Tier-1 Enterprise Knowledge Infrastructure & Operations',
      somVal: '$4.2B',
      somDesc: 'Immediate Beachhead: FinTech, HealthTech & Supply Chains',
      cagr: '36.8% Market CAGR',
      accentColor: '#38bdf8'
    }
  },
  {
    id: 'product',
    name: 'Product Showcase & Features',
    category: 'business',
    description: '3-card feature matrix highlighting core capabilities and technical highlights.',
    defaultData: {
      type: 'product',
      kicker: 'Product Overview',
      title: 'Engineered for High-Stakes Operations',
      subtitle: 'Built from the ground up for bank-grade security, extreme throughput, and seamless UX.',
      features: [
        { title: 'Intelligent Ingestion', desc: 'Parses complex multi-modal PDFs, SQL streams, and REST webhooks instantly.' },
        { title: 'Granular Governance', desc: 'SOC 2 Type II, HIPAA, and GDPR compliant role-based cryptographic guardrails.' },
        { title: 'Edge Micro-Agents', desc: 'Sub-15ms localized model execution with offline resilience.' }
      ],
      accentColor: '#a855f7'
    }
  },
  {
    id: 'traction',
    name: 'Traction & Key Growth Metrics',
    category: 'pitch',
    description: 'High-impact stat callouts showing ARR, active clients, and growth velocity.',
    defaultData: {
      type: 'traction',
      kicker: 'Proven Velocity',
      title: 'Accelerating Enterprise Adoption',
      subtitle: 'Consistent month-over-month growth powered by strong net dollar retention and organic referral.',
      m1Val: '$4.8M',
      m1Label: 'Annual Recurring Revenue (ARR)',
      m2Val: '142%',
      m2Label: 'Net Dollar Retention (NDR)',
      m3Val: '78',
      m3Label: 'Enterprise Clients',
      note: '9.4x ARR expansion over the past 14 months with zero logo churn among Fortune 500 accounts.',
      accentColor: '#10b981'
    }
  },
  {
    id: 'financials',
    name: 'Financial Projections & Economics',
    category: 'business',
    description: 'Unit economics overview with ACV, Gross Margin, and LTV/CAC ratios.',
    defaultData: {
      type: 'financials',
      kicker: 'Unit Economics',
      title: 'High-Margin Predictable B2B SaaS',
      subtitle: 'Attractive customer lifetime value combined with rapid payback periods.',
      m1Val: '$62,000',
      m1Label: 'Average Contract Value (ACV)',
      m2Val: '84%',
      m2Label: 'Gross Margin Profile',
      m3Val: '6.4x',
      m3Label: 'LTV : CAC Ratio',
      note: 'Payback period under 5.5 months with expansion-driven tier pricing tiers.',
      accentColor: '#f59e0b'
    }
  },
  {
    id: 'team',
    name: 'Executive Leadership Team',
    category: 'pitch',
    description: 'Leadership cards highlighting founders, prior achievements, and pedigree.',
    defaultData: {
      type: 'team',
      kicker: 'Leadership',
      title: 'World-Class Domain Experts',
      subtitle: 'A repeat founding team combining deep AI research with enterprise SaaS scale.',
      members: [
        { name: 'Dr. Julian Vance', role: 'CEO & Co-Founder', bio: 'Ex-Google Brain Principal Researcher, PhD Stanford CS.' },
        { name: 'Elena Rostova', role: 'CTO & Co-Founder', bio: 'Ex-VP of Infrastructure at Stripe, Scaled systems to 100M+ ops/day.' },
        { name: 'Marcus Sterling', role: 'Head of Commercial', bio: 'Ex-Director of Enterprise Sales at Datadog, Led $40M ARR book.' }
      ],
      accentColor: '#06b6d4'
    }
  },
  {
    id: 'competitive',
    name: 'Competitive Matrix & Moat',
    category: 'pitch',
    description: 'Defensibility pillars and competitive moat analysis.',
    defaultData: {
      type: 'competitive',
      kicker: 'Defensibility',
      title: 'Sustainable Competitive Advantages',
      subtitle: 'Why our technological and structural moats widen with every deployed customer.',
      points: [
        'Proprietary Context Memory: Patent-pending graph architecture that improves with each workflow execution.',
        'High Switching Costs: Deep integration into mission-critical transactional pipelines.',
        'Pre-Certified Compliance: Pre-built enterprise audit packs reduce customer procurement cycles by 70%.'
      ],
      accentColor: '#e11d48'
    }
  },
  {
    id: 'testimonial',
    name: 'Customer Testimonial & Social Proof',
    category: 'business',
    description: 'Featured client quote with verified attribution and measured outcome.',
    defaultData: {
      type: 'testimonial',
      kicker: 'Customer Voice',
      title: 'Trusted by Industry Leaders',
      quote: '“Implementing this platform reduced our claims reconciliation time from 72 hours down to 14 minutes. It has fundamentally transformed how our operations team executes.”',
      author: 'Sophia Chen',
      role: 'Chief Information Officer, Apex Global Reinsurance',
      stat: '94% Reduction in Processing Latency',
      accentColor: '#8b5cf6'
    }
  },
  {
    id: 'roadmap',
    name: 'Roadmap & Milestones',
    category: 'business',
    description: '4-phase milestone timeline outlining product deliverables and execution plan.',
    defaultData: {
      type: 'roadmap',
      kicker: 'Execution Plan',
      title: 'Strategic Horizon & Key Milestones',
      subtitle: 'Delivering compounding value through rapid quarterly product releases.',
      milestones: [
        { phase: 'Q1 2026', title: 'Core Orchestrator v2.0', desc: 'Sub-20ms distributed query engine launch.' },
        { phase: 'Q2 2026', title: 'Enterprise Guardrails', desc: 'Automated SOC 2 & HIPAA audit logging.' },
        { phase: 'Q3 2026', title: 'Self-Healing Workflows', desc: 'Predictive schema reconciliation rollout.' },
        { phase: 'Q4 2026', title: 'Autonomous Micro-Agents', desc: 'Localized on-premise edge deployments.' }
      ],
      accentColor: '#3b82f6'
    }
  },
  {
    id: 'travel',
    name: 'Travel Itinerary Day-by-Day',
    category: 'travel',
    description: 'Curated 3-day travel itinerary with highlights and luxury experiences.',
    defaultData: {
      type: 'travel',
      kicker: 'Exclusive Journey',
      title: 'Kyoto Zen & Cultural Immersion',
      subtitle: 'A private 3-day exploration of historic shrines, artisanal matcha ceremonies, and serene bamboo groves.',
      days: [
        { day: 'Day 1', title: 'Arrival & Gion Lantern Walk', desc: 'Private transfer to luxury Ryokan, evening guided walk through historic Gion.' },
        { day: 'Day 2', title: 'Private Arashiyama & Bamboo Forest', desc: 'Early morning access to Tenryu-ji temple gardens, private tea master ceremony.' },
        { day: 'Day 3', title: 'Kinkaku-ji & Kaiseki Banquet', desc: 'Golden Pavilion private viewing, concluding with Michelin 3-star Kaiseki dinner.' }
      ],
      accentColor: '#10b981'
    }
  },
  {
    id: 'brand',
    name: 'Brand Identity & Color Guidelines',
    category: 'brand',
    description: 'Brand color palette codes, typography hierarchy, and visual rules.',
    defaultData: {
      type: 'brand',
      kicker: 'Design System',
      title: 'Aura Visual Brand Architecture',
      subtitle: 'Consistent, confident, and sophisticated aesthetics engineered for global recognition.',
      c1: '#090D16', c1Name: 'Obsidian Night',
      c2: '#6366F1', c2Name: 'Electric Indigo',
      c3: '#38BDF8', c3Name: 'Cyan Glow',
      c4: '#F8FAFC', c4Name: 'Pure Pearl',
      fontDisplay: 'Syne / Space Grotesk',
      fontBody: 'Inter / Plus Jakarta Sans',
      accentColor: '#6366f1'
    }
  },
  {
    id: 'exec_summary',
    name: 'Executive Summary',
    category: 'business',
    description: 'High-level synthesis for C-suite and board members.',
    defaultData: {
      type: 'exec_summary',
      kicker: 'Board Briefing',
      title: 'Executive Briefing & Strategic Thesis',
      subtitle: 'Summary of market dynamics, operational achievements, and forward trajectory.',
      thesis: 'By automating cross-functional telemetry, our platform unlocks $12M in annual efficiency for each enterprise deployment while preserving total data sovereignty.',
      points: [
        'Revenue grew 320% year-over-year while gross margins expanded to 84%.',
        'Customer acquisition payback decreased from 9 months to 5.2 months.',
        'Series A capital will accelerate enterprise sales capacity and European expansion.'
      ],
      accentColor: '#ec4899'
    }
  },
  {
    id: 'architecture',
    name: 'System Architecture & Data Flow',
    category: 'tech',
    description: 'Technical flow showcasing Ingestion, Processing, and Execution layers.',
    defaultData: {
      type: 'architecture',
      kicker: 'Technical Architecture',
      title: 'End-to-End Orchestration Topology',
      subtitle: 'Sub-30ms event loop with deterministic policy checks and zero data persistence at rest.',
      layers: [
        { num: '01', title: 'Telemetry Ingest', desc: 'Streaming CDC, Kafka pipelines, and authenticated REST webhooks.' },
        { num: '02', title: 'Deterministic Guardrails', desc: 'Cryptographic compliance verification and role-based policy enforcement.' },
        { num: '03', title: 'Atomic Execution', desc: 'Target system mutations with immediate rollback and immutable audit logs.' }
      ],
      accentColor: '#0ea5e9'
    }
  },
  {
    id: 'pricing',
    name: 'Tiered Pricing Plans',
    category: 'business',
    description: 'Starter, Professional, and Enterprise tier pricing grid.',
    defaultData: {
      type: 'pricing',
      kicker: 'Commercial Structure',
      title: 'Transparent Scalable Pricing Models',
      subtitle: 'Aligning software investment directly with realized business automation volume.',
      tiers: [
        { name: 'Starter', price: '$2,500/mo', desc: 'Up to 50k monthly workflow executions, standard connectors, email SLA.' },
        { name: 'Professional', price: '$8,500/mo', desc: 'Up to 500k executions, custom connectors, 99.9% uptime SLA, dedicated CSM.' },
        { name: 'Enterprise', price: 'Custom ACV', desc: 'Unlimited scale, VPC & on-prem deployment, custom ML fine-tuning, 24/7 hotline.' }
      ],
      accentColor: '#f59e0b'
    }
  },
  {
    id: 'case_study',
    name: 'Customer Case Study',
    category: 'business',
    description: 'Structured customer story: Challenge, Solution, and Quantified Outcomes.',
    defaultData: {
      type: 'case_study',
      kicker: 'Case Study',
      title: 'Global FinTech Scales to 20M Daily Transactions',
      client: 'Vanguard Payments Corp',
      challenge: 'Manual compliance reviews delayed merchant onboarding by 5 days, increasing customer churn.',
      solution: 'Deployed automated compliance reasoning engine to evaluate risk signals in real-time.',
      outcome: '92% reduction in review backlog, zero compliance infractions, $3.2M saved in operational overhead.',
      accentColor: '#10b981'
    }
  },
  {
    id: 'quote',
    name: 'High-Impact Quote Slide',
    category: 'business',
    description: 'Memorable full-screen quote to emphasize a foundational truth or vision.',
    defaultData: {
      type: 'quote',
      kicker: 'Core Philosophy',
      title: 'Guiding Principle',
      quote: '“The ultimate competitive moat in the intelligence era is not data collection, but the velocity and accuracy of decision execution.”',
      author: 'Aura Principles Manifesto',
      accentColor: '#8b5cf6'
    }
  },
  {
    id: 'comparison',
    name: 'Before vs After Comparison',
    category: 'marketing',
    description: 'Direct contrast between legacy manual status quo and modern automated future.',
    defaultData: {
      type: 'comparison',
      kicker: 'Transformation',
      title: 'Legacy Chaos vs. Modern Harmony',
      subtitle: 'Comparing conventional manual processes against automated deterministic workflows.',
      beforeTitle: 'Legacy Approach (Status Quo)',
      beforePoints: [
        'Days lost to manual spreadsheets and copy-pasting',
        'Brittle scripts that break without warning',
        'Inconsistent compliance audits and security exposures'
      ],
      afterTitle: 'With Aura Platform',
      afterPoints: [
        'Real-time automated execution in under 50ms',
        'Self-healing pipelines with guaranteed uptime',
        'Continuous cryptographic audit log and SOC 2 guardrails'
      ],
      accentColor: '#6366f1'
    }
  },
  {
    id: 'funnel',
    name: 'Marketing Acquisition Funnel',
    category: 'marketing',
    description: 'Top, Middle, and Bottom funnel metrics and conversion rates.',
    defaultData: {
      type: 'funnel',
      kicker: 'Growth Engine',
      title: 'High-Conversion Inbound Flywheel',
      subtitle: 'Systematic conversion optimization from initial awareness to enterprise expansion.',
      topVal: '1.2M Impressions', topLabel: 'Top of Funnel: Thought leadership & SEO',
      midVal: '34,000 Signups', midLabel: 'Mid Funnel: Product-led trial & sandbox',
      botVal: '68 Enterprise Deals', botLabel: 'Bottom Funnel: Sales-assisted expansion',
      accentColor: '#ec4899'
    }
  },
  {
    id: 'contact',
    name: 'Thank You & Q&A Contact',
    category: 'pitch',
    description: 'Clean concluding slide with contact info, social handles, and call to action.',
    defaultData: {
      type: 'contact',
      kicker: 'Let’s Build Together',
      title: 'Thank You & Discussion',
      subtitle: 'We invite strategic questions, deep dives, and pilot partnership discussions.',
      email: 'partnerships@example.com',
      website: 'https://auraintelligence.io',
      location: 'San Francisco, CA & London, UK',
      accentColor: '#6366f1'
    }
  }
];

// Preset Decks
const PRESET_DECKS = {
  pitch: [
    'title', 'problem', 'solution', 'market', 'product', 'traction', 'financials', 'team', 'competitive', 'contact'
  ],
  travel: [
    'title', 'travel', 'product', 'case_study', 'testimonial', 'pricing', 'contact'
  ],
  brand: [
    'title', 'exec_summary', 'brand', 'quote', 'comparison', 'contact'
  ],
  product: [
    'title', 'problem', 'solution', 'product', 'architecture', 'roadmap', 'pricing', 'contact'
  ],
  blank: [
    'title'
  ]
};

// Application State
let activeDeck = [];
let activeSlideIndex = 0;
let isPresenting = false;
let presentTimerInterval = null;
let presentSeconds = 0;

// Initialize Deck from Preset
function loadPreset(presetKey) {
  const ids = PRESET_DECKS[presetKey] || PRESET_DECKS.pitch;
  activeDeck = ids.map((id, index) => {
    const tmpl = TEMPLATE_DEFINITIONS.find(t => t.id === id);
    const data = tmpl ? JSON.parse(JSON.stringify(tmpl.defaultData)) : { type: 'title', title: `Slide ${index + 1}` };
    data.uid = 'slide_' + Math.random().toString(36).substr(2, 9);
    return data;
  });
  activeSlideIndex = 0;
  updateUI();
}

// Render Slide Content in 16:9 Canvas
function renderSlideContent(slide, targetEl) {
  if (!slide || !targetEl) return;
  const accent = slide.accentColor || '#6366f1';
  let bodyHtml = '';

  switch (slide.type) {
    case 'title':
      bodyHtml = `
        <div style="text-align: center; max-width: 800px; margin: auto;">
          <div style="display: flex; justify-content: center; gap: 1.5rem; margin-top: 1.5rem; font-size: 0.95rem; color: #94a3b8;">
            <div><strong>Presenter:</strong> ${escapeHtml(slide.presenter || '')}</div>
            <div>&bull;</div>
            <div><strong>Date:</strong> ${escapeHtml(slide.date || '')}</div>
          </div>
        </div>
      `;
      break;

    case 'problem':
      bodyHtml = `
        <div class="slide-bullet-list">
          ${(slide.points || []).map((pt, i) => `
            <div class="slide-bullet-item" style="border-left-color: ${accent};">
              <div class="slide-bullet-icon" style="color: ${accent};">0${i + 1}</div>
              <div>${escapeHtml(pt)}</div>
            </div>
          `).join('')}
        </div>
      `;
      break;

    case 'solution':
      bodyHtml = `
        <div class="grid-3-cards">
          ${(slide.pillars || []).map((pill) => `
            <div class="slide-glass-card" style="border-top: 3px solid ${accent};">
              <h4 style="font-size: 0.95rem; font-weight: 700; color: #fff; margin: 0 0 0.35rem 0;">${escapeHtml(pill.title || '')}</h4>
              <p style="font-size: 0.8rem; color: #94a3b8; line-height: 1.4; margin: 0;">${escapeHtml(pill.desc || '')}</p>
            </div>
          `).join('')}
        </div>
      `;
      break;

    case 'market':
      bodyHtml = `
        <div style="display: flex; flex-direction: column; gap: 1rem; width: 100%;">
          <div class="grid-3-cards">
            <div class="slide-glass-card">
              <div class="card-metric-val" style="color: ${accent};">${escapeHtml(slide.tamVal || '')}</div>
              <div class="card-metric-label">TAM (Total Addressable)</div>
              <div class="card-metric-sub">${escapeHtml(slide.tamDesc || '')}</div>
            </div>
            <div class="slide-glass-card">
              <div class="card-metric-val" style="color: #38bdf8;">${escapeHtml(slide.samVal || '')}</div>
              <div class="card-metric-label">SAM (Serviceable)</div>
              <div class="card-metric-sub">${escapeHtml(slide.samDesc || '')}</div>
            </div>
            <div class="slide-glass-card">
              <div class="card-metric-val" style="color: #10b981;">${escapeHtml(slide.somVal || '')}</div>
              <div class="card-metric-label">SOM (Immediate Target)</div>
              <div class="card-metric-sub">${escapeHtml(slide.somDesc || '')}</div>
            </div>
          </div>
          <div style="font-size: 0.825rem; font-weight: 600; color: ${accent}; text-align: right;">${escapeHtml(slide.cagr || '')}</div>
        </div>
      `;
      break;

    case 'product':
      bodyHtml = `
        <div class="grid-3-cards">
          ${(slide.features || []).map((feat, i) => `
            <div class="slide-glass-card" style="border-bottom: 2px solid ${accent};">
              <span style="font-size: 0.72rem; color: ${accent}; font-weight: 700;">FEATURE 0${i + 1}</span>
              <h4 style="font-size: 0.95rem; font-weight: 700; color: #fff; margin: 0 0 0.25rem 0;">${escapeHtml(feat.title || '')}</h4>
              <p style="font-size: 0.8rem; color: #94a3b8; line-height: 1.4; margin: 0;">${escapeHtml(feat.desc || '')}</p>
            </div>
          `).join('')}
        </div>
      `;
      break;

    case 'traction':
      bodyHtml = `
        <div style="display: flex; flex-direction: column; gap: 1rem; width: 100%;">
          <div class="grid-3-cards">
            <div class="slide-glass-card">
              <div class="card-metric-val" style="color: #10b981;">${escapeHtml(slide.m1Val || '')}</div>
              <div class="card-metric-label">${escapeHtml(slide.m1Label || '')}</div>
            </div>
            <div class="slide-glass-card">
              <div class="card-metric-val" style="color: #38bdf8;">${escapeHtml(slide.m2Val || '')}</div>
              <div class="card-metric-label">${escapeHtml(slide.m2Label || '')}</div>
            </div>
            <div class="slide-glass-card">
              <div class="card-metric-val" style="color: #a855f7;">${escapeHtml(slide.m3Val || '')}</div>
              <div class="card-metric-label">${escapeHtml(slide.m3Label || '')}</div>
            </div>
          </div>
          ${slide.note ? `<div style="font-size: 0.8rem; color: #94a3b8; font-style: italic; background: rgba(255,255,255,0.03); padding: 0.5rem 0.75rem; border-radius: 4px;">${escapeHtml(slide.note)}</div>` : ''}
        </div>
      `;
      break;

    case 'financials':
      bodyHtml = `
        <div style="display: flex; flex-direction: column; gap: 1rem; width: 100%;">
          <div class="grid-3-cards">
            <div class="slide-glass-card">
              <div class="card-metric-val" style="color: #f59e0b;">${escapeHtml(slide.m1Val || '')}</div>
              <div class="card-metric-label">${escapeHtml(slide.m1Label || '')}</div>
            </div>
            <div class="slide-glass-card">
              <div class="card-metric-val" style="color: #10b981;">${escapeHtml(slide.m2Val || '')}</div>
              <div class="card-metric-label">${escapeHtml(slide.m2Label || '')}</div>
            </div>
            <div class="slide-glass-card">
              <div class="card-metric-val" style="color: #38bdf8;">${escapeHtml(slide.m3Val || '')}</div>
              <div class="card-metric-label">${escapeHtml(slide.m3Label || '')}</div>
            </div>
          </div>
          ${slide.note ? `<div style="font-size: 0.8rem; color: #cbd5e1; background: rgba(245, 158, 11, 0.1); border-left: 3px solid #f59e0b; padding: 0.5rem 0.75rem;">${escapeHtml(slide.note)}</div>` : ''}
        </div>
      `;
      break;

    case 'team':
      bodyHtml = `
        <div class="grid-3-cards">
          ${(slide.members || []).map((m) => `
            <div class="slide-glass-card">
              <div style="width: 42px; height: 42px; border-radius: 50%; background: ${accent}; display: flex; align-items: center; justify-content: center; font-weight: 800; color: #fff; font-size: 1rem; margin-bottom: 0.35rem;">
                ${escapeHtml((m.name || 'U').charAt(0))}
              </div>
              <h4 style="font-size: 0.95rem; font-weight: 700; color: #fff; margin: 0;">${escapeHtml(m.name || '')}</h4>
              <span style="font-size: 0.75rem; color: ${accent}; font-weight: 600;">${escapeHtml(m.role || '')}</span>
              <p style="font-size: 0.75rem; color: #94a3b8; line-height: 1.35; margin: 0.25rem 0 0 0;">${escapeHtml(m.bio || '')}</p>
            </div>
          `).join('')}
        </div>
      `;
      break;

    case 'competitive':
      bodyHtml = `
        <div class="slide-bullet-list">
          ${(slide.points || []).map((pt) => `
            <div class="slide-bullet-item" style="border-left-color: ${accent};">
              <div class="slide-bullet-icon" style="color: ${accent};">✔</div>
              <div>${escapeHtml(pt)}</div>
            </div>
          `).join('')}
        </div>
      `;
      break;

    case 'testimonial':
      bodyHtml = `
        <div style="background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.08); border-radius: 8px; padding: 1.5rem; width: 100%; box-sizing: border-box;">
          <p style="font-size: 1.1rem; font-style: italic; color: #f1f5f9; line-height: 1.5; margin: 0 0 1rem 0;">${escapeHtml(slide.quote || '')}</p>
          <div style="display: flex; justify-content: space-between; align-items: center; border-top: 1px solid rgba(255,255,255,0.08); padding-top: 0.75rem;">
            <div>
              <div style="font-weight: 700; color: #fff; font-size: 0.9rem;">${escapeHtml(slide.author || '')}</div>
              <div style="font-size: 0.75rem; color: #94a3b8;">${escapeHtml(slide.role || '')}</div>
            </div>
            ${slide.stat ? `<span style="font-size: 0.8rem; font-weight: 700; color: #10b981; background: rgba(16,185,129,0.15); padding: 0.3rem 0.6rem; border-radius: 4px;">${escapeHtml(slide.stat)}</span>` : ''}
          </div>
        </div>
      `;
      break;

    case 'roadmap':
      bodyHtml = `
        <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 0.75rem; width: 100%;">
          ${(slide.milestones || []).map((m) => `
            <div class="slide-glass-card" style="border-top: 3px solid ${accent};">
              <span style="font-size: 0.72rem; color: ${accent}; font-weight: 700;">${escapeHtml(m.phase || '')}</span>
              <h4 style="font-size: 0.85rem; font-weight: 700; color: #fff; margin: 0.25rem 0;">${escapeHtml(m.title || '')}</h4>
              <p style="font-size: 0.72rem; color: #94a3b8; line-height: 1.35; margin: 0;">${escapeHtml(m.desc || '')}</p>
            </div>
          `).join('')}
        </div>
      `;
      break;

    case 'travel':
      bodyHtml = `
        <div class="grid-3-cards">
          ${(slide.days || []).map((d) => `
            <div class="slide-glass-card" style="border-left: 3px solid ${accent};">
              <span style="font-size: 0.72rem; color: ${accent}; font-weight: 800; text-transform: uppercase;">${escapeHtml(d.day || '')}</span>
              <h4 style="font-size: 0.9rem; font-weight: 700; color: #fff; margin: 0.2rem 0;">${escapeHtml(d.title || '')}</h4>
              <p style="font-size: 0.78rem; color: #94a3b8; line-height: 1.4; margin: 0;">${escapeHtml(d.desc || '')}</p>
            </div>
          `).join('')}
        </div>
      `;
      break;

    case 'brand':
      bodyHtml = `
        <div style="display: flex; flex-direction: column; gap: 1rem; width: 100%;">
          <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 0.75rem;">
            <div style="background: ${slide.c1 || '#090d16'}; border: 1px solid rgba(255,255,255,0.15); border-radius: 6px; padding: 0.75rem;">
              <div style="height: 28px;"></div>
              <div style="font-size: 0.75rem; font-weight: 700; color: #fff;">${escapeHtml(slide.c1Name || '')}</div>
              <div style="font-size: 0.7rem; color: #94a3b8; font-family: monospace;">${escapeHtml(slide.c1 || '')}</div>
            </div>
            <div style="background: ${slide.c2 || '#6366f1'}; border: 1px solid rgba(255,255,255,0.15); border-radius: 6px; padding: 0.75rem;">
              <div style="height: 28px;"></div>
              <div style="font-size: 0.75rem; font-weight: 700; color: #fff;">${escapeHtml(slide.c2Name || '')}</div>
              <div style="font-size: 0.7rem; color: rgba(255,255,255,0.8); font-family: monospace;">${escapeHtml(slide.c2 || '')}</div>
            </div>
            <div style="background: ${slide.c3 || '#38bdf8'}; border: 1px solid rgba(255,255,255,0.15); border-radius: 6px; padding: 0.75rem;">
              <div style="height: 28px;"></div>
              <div style="font-size: 0.75rem; font-weight: 700; color: #000;">${escapeHtml(slide.c3Name || '')}</div>
              <div style="font-size: 0.7rem; color: rgba(0,0,0,0.8); font-family: monospace;">${escapeHtml(slide.c3 || '')}</div>
            </div>
            <div style="background: ${slide.c4 || '#f8fafc'}; border: 1px solid rgba(255,255,255,0.15); border-radius: 6px; padding: 0.75rem;">
              <div style="height: 28px;"></div>
              <div style="font-size: 0.75rem; font-weight: 700; color: #000;">${escapeHtml(slide.c4Name || '')}</div>
              <div style="font-size: 0.7rem; color: rgba(0,0,0,0.8); font-family: monospace;">${escapeHtml(slide.c4 || '')}</div>
            </div>
          </div>
          <div style="display: flex; gap: 2rem; font-size: 0.825rem; color: #cbd5e1; background: rgba(255,255,255,0.04); padding: 0.65rem 1rem; border-radius: 6px;">
            <div><strong>Display Typography:</strong> ${escapeHtml(slide.fontDisplay || '')}</div>
            <div><strong>Body Typography:</strong> ${escapeHtml(slide.fontBody || '')}</div>
          </div>
        </div>
      `;
      break;

    case 'exec_summary':
      bodyHtml = `
        <div style="display: flex; flex-direction: column; gap: 0.85rem; width: 100%;">
          <div style="background: rgba(99,102,241,0.1); border-left: 3px solid ${accent}; padding: 0.75rem 1rem; border-radius: 4px; font-size: 0.95rem; color: #f1f5f9; line-height: 1.45;">
            <strong>Core Thesis:</strong> ${escapeHtml(slide.thesis || '')}
          </div>
          <div class="slide-bullet-list">
            ${(slide.points || []).map(p => `
              <div class="slide-bullet-item" style="border-left-color: ${accent};">
                <span class="slide-bullet-icon" style="color: ${accent};">&bull;</span>
                <div>${escapeHtml(p)}</div>
              </div>
            `).join('')}
          </div>
        </div>
      `;
      break;

    case 'architecture':
      bodyHtml = `
        <div class="grid-3-cards">
          ${(slide.layers || []).map(l => `
            <div class="slide-glass-card" style="border-top: 3px solid ${accent};">
              <span style="font-size: 1.1rem; font-weight: 800; color: ${accent};">${escapeHtml(l.num || '')}</span>
              <h4 style="font-size: 0.95rem; font-weight: 700; color: #fff; margin: 0.2rem 0;">${escapeHtml(l.title || '')}</h4>
              <p style="font-size: 0.78rem; color: #94a3b8; line-height: 1.4; margin: 0;">${escapeHtml(l.desc || '')}</p>
            </div>
          `).join('')}
        </div>
      `;
      break;

    case 'pricing':
      bodyHtml = `
        <div class="grid-3-cards">
          ${(slide.tiers || []).map((t, idx) => `
            <div class="slide-glass-card" style="${idx === 1 ? 'border: 2px solid ' + accent + '; background: rgba(99,102,241,0.08);' : ''}">
              <div style="display: flex; justify-content: space-between; align-items: center;">
                <h4 style="font-size: 0.9rem; font-weight: 700; color: #fff; margin: 0;">${escapeHtml(t.name || '')}</h4>
                ${idx === 1 ? `<span style="font-size: 0.65rem; padding: 0.1rem 0.4rem; background: ${accent}; color: #fff; border-radius: 4px; font-weight: 700;">POPULAR</span>` : ''}
              </div>
              <div style="font-size: 1.4rem; font-weight: 800; color: ${accent}; margin: 0.35rem 0;">${escapeHtml(t.price || '')}</div>
              <p style="font-size: 0.75rem; color: #94a3b8; line-height: 1.35; margin: 0;">${escapeHtml(t.desc || '')}</p>
            </div>
          `).join('')}
        </div>
      `;
      break;

    case 'case_study':
      bodyHtml = `
        <div style="display: flex; flex-direction: column; gap: 0.75rem; width: 100%;">
          <div style="font-size: 0.85rem; font-weight: 700; color: ${accent};">Partner Client: ${escapeHtml(slide.client || '')}</div>
          <div class="grid-3-cards">
            <div class="slide-glass-card">
              <span style="font-size: 0.72rem; color: #f43f5e; font-weight: 700;">THE CHALLENGE</span>
              <p style="font-size: 0.78rem; color: #cbd5e1; line-height: 1.4; margin: 0.25rem 0 0 0;">${escapeHtml(slide.challenge || '')}</p>
            </div>
            <div class="slide-glass-card">
              <span style="font-size: 0.72rem; color: #38bdf8; font-weight: 700;">OUR SOLUTION</span>
              <p style="font-size: 0.78rem; color: #cbd5e1; line-height: 1.4; margin: 0.25rem 0 0 0;">${escapeHtml(slide.solution || '')}</p>
            </div>
            <div class="slide-glass-card">
              <span style="font-size: 0.72rem; color: #10b981; font-weight: 700;">MEASURED OUTCOME</span>
              <p style="font-size: 0.78rem; color: #cbd5e1; line-height: 1.4; margin: 0.25rem 0 0 0;">${escapeHtml(slide.outcome || '')}</p>
            </div>
          </div>
        </div>
      `;
      break;

    case 'quote':
      bodyHtml = `
        <div style="text-align: center; max-width: 750px; margin: auto;">
          <p style="font-size: 1.35rem; font-weight: 600; font-style: italic; color: #ffffff; line-height: 1.5; margin: 0 0 1rem 0;">${escapeHtml(slide.quote || '')}</p>
          <div style="font-size: 0.85rem; font-weight: 700; color: ${accent};">${escapeHtml(slide.author || '')}</div>
        </div>
      `;
      break;

    case 'comparison':
      bodyHtml = `
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; width: 100%;">
          <div class="slide-glass-card" style="border-top: 3px solid #f43f5e;">
            <h4 style="font-size: 0.9rem; font-weight: 700; color: #f43f5e; margin: 0 0 0.5rem 0;">${escapeHtml(slide.beforeTitle || '')}</h4>
            <div style="display: flex; flex-direction: column; gap: 0.4rem;">
              ${(slide.beforePoints || []).map(p => `<div style="font-size: 0.78rem; color: #94a3b8;">&times; ${escapeHtml(p)}</div>`).join('')}
            </div>
          </div>
          <div class="slide-glass-card" style="border-top: 3px solid #10b981;">
            <h4 style="font-size: 0.9rem; font-weight: 700; color: #10b981; margin: 0 0 0.5rem 0;">${escapeHtml(slide.afterTitle || '')}</h4>
            <div style="display: flex; flex-direction: column; gap: 0.4rem;">
              ${(slide.afterPoints || []).map(p => `<div style="font-size: 0.78rem; color: #cbd5e1;">&check; ${escapeHtml(p)}</div>`).join('')}
            </div>
          </div>
        </div>
      `;
      break;

    case 'funnel':
      bodyHtml = `
        <div style="display: flex; flex-direction: column; gap: 0.65rem; width: 100%; max-width: 700px; margin: auto;">
          <div style="background: rgba(236,72,153,0.15); border-left: 4px solid #ec4899; padding: 0.65rem 1rem; border-radius: 4px; display: flex; justify-content: space-between; align-items: center;">
            <span style="font-size: 0.8rem; color: #fff;">${escapeHtml(slide.topLabel || '')}</span>
            <span style="font-size: 1.1rem; font-weight: 800; color: #ec4899;">${escapeHtml(slide.topVal || '')}</span>
          </div>
          <div style="background: rgba(168,85,247,0.15); border-left: 4px solid #a855f7; padding: 0.65rem 1rem; border-radius: 4px; display: flex; justify-content: space-between; align-items: center; margin: 0 2rem;">
            <span style="font-size: 0.8rem; color: #fff;">${escapeHtml(slide.midLabel || '')}</span>
            <span style="font-size: 1.1rem; font-weight: 800; color: #a855f7;">${escapeHtml(slide.midVal || '')}</span>
          </div>
          <div style="background: rgba(56,189,248,0.15); border-left: 4px solid #38bdf8; padding: 0.65rem 1rem; border-radius: 4px; display: flex; justify-content: space-between; align-items: center; margin: 0 4rem;">
            <span style="font-size: 0.8rem; color: #fff;">${escapeHtml(slide.botLabel || '')}</span>
            <span style="font-size: 1.1rem; font-weight: 800; color: #38bdf8;">${escapeHtml(slide.botVal || '')}</span>
          </div>
        </div>
      `;
      break;

    case 'contact':
      bodyHtml = `
        <div style="display: flex; justify-content: center; width: 100%;">
          <div style="background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.08); border-radius: 8px; padding: 1.5rem 2rem; display: flex; flex-direction: column; gap: 0.65rem; min-width: 380px;">
            <div style="font-size: 0.85rem; color: #cbd5e1;"><strong>Email:</strong> <span style="color: ${accent};">${escapeHtml(slide.email || '')}</span></div>
            <div style="font-size: 0.85rem; color: #cbd5e1;"><strong>Website:</strong> <span style="color: ${accent};">${escapeHtml(slide.website || '')}</span></div>
            <div style="font-size: 0.85rem; color: #cbd5e1;"><strong>Headquarters:</strong> ${escapeHtml(slide.location || '')}</div>
          </div>
        </div>
      `;
      break;

    default:
      bodyHtml = `<div style="color: #94a3b8; font-size: 0.9rem;">${escapeHtml(JSON.stringify(slide))}</div>`;
  }

  targetEl.innerHTML = `
    <div class="slide-header-box">
      ${slide.kicker ? `<div class="slide-kicker" style="color: ${accent};">${escapeHtml(slide.kicker)}</div>` : ''}
      <div class="slide-title-text">${escapeHtml(slide.title || 'Untitled Slide')}</div>
      ${slide.subtitle ? `<div class="slide-subtitle-text">${escapeHtml(slide.subtitle)}</div>` : ''}
    </div>
    <div class="slide-body-box">
      ${bodyHtml}
    </div>
    <div class="slide-footer-box">
      <span>Slide ${activeSlideIndex + 1} of ${activeDeck.length}</span>
      <span style="color: ${accent}; font-weight: 600;">Presentation Studio</span>
    </div>
  `;
}

// Render Inspector Inputs
function renderInspector() {
  const container = document.getElementById('inspector-fields-container');
  const slide = activeDeck[activeSlideIndex];
  if (!slide || !container) return;

  document.getElementById('inspector-slide-pill').textContent = `Editing Slide ${activeSlideIndex + 1} (${slide.type.toUpperCase()})`;
  document.getElementById('inspector-slide-heading').textContent = slide.title || 'Slide Details';

  let fieldsHtml = `
    <div class="inspector-fields-grid">
      <div class="form-group">
        <label>Slide Title</label>
        <input type="text" class="form-input" id="inp-title" value="${escapeHtml(slide.title || '')}">
      </div>
      <div class="form-group">
        <label>Section Kicker</label>
        <input type="text" class="form-input" id="inp-kicker" value="${escapeHtml(slide.kicker || '')}">
      </div>
    </div>
    <div class="form-group" style="margin-top: 0.65rem;">
      <label>Subtitle / Description</label>
      <input type="text" class="form-input" id="inp-subtitle" value="${escapeHtml(slide.subtitle || '')}">
    </div>
    <div class="form-group" style="margin-top: 0.65rem;">
      <label>Accent Color</label>
      <input type="color" class="form-input" id="inp-accent" value="${slide.accentColor || '#6366f1'}" style="height: 40px; padding: 4px; width: 100px; cursor: pointer;">
    </div>
  `;

  // Dynamic custom fields based on slide type
  if (slide.type === 'title') {
    fieldsHtml += `
      <div class="inspector-fields-grid" style="margin-top: 0.65rem;">
        <div class="form-group">
          <label>Presenter Name & Title</label>
          <input type="text" class="form-input" id="inp-presenter" value="${escapeHtml(slide.presenter || '')}">
        </div>
        <div class="form-group">
          <label>Date / Version</label>
          <input type="text" class="form-input" id="inp-date" value="${escapeHtml(slide.date || '')}">
        </div>
      </div>
    `;
  } else if (slide.type === 'problem' || slide.type === 'competitive' || slide.type === 'exec_summary') {
    const pts = (slide.points || []).join('\n');
    fieldsHtml += `
      <div class="form-group" style="margin-top: 0.65rem;">
        <label>Bullet Points (One per line)</label>
        <textarea class="form-textarea" id="inp-points" style="min-height: 100px;">${escapeHtml(pts)}</textarea>
      </div>
    `;
  } else if (slide.type === 'market') {
    fieldsHtml += `
      <div class="inspector-fields-grid" style="margin-top: 0.65rem;">
        <div class="form-group">
          <label>TAM Metric ($148B)</label>
          <input type="text" class="form-input" id="inp-tam" value="${escapeHtml(slide.tamVal || '')}">
        </div>
        <div class="form-group">
          <label>SAM Metric ($34B)</label>
          <input type="text" class="form-input" id="inp-sam" value="${escapeHtml(slide.samVal || '')}">
        </div>
        <div class="form-group">
          <label>SOM Metric ($4.2B)</label>
          <input type="text" class="form-input" id="inp-som" value="${escapeHtml(slide.somVal || '')}">
        </div>
        <div class="form-group">
          <label>CAGR Growth Tag</label>
          <input type="text" class="form-input" id="inp-cagr" value="${escapeHtml(slide.cagr || '')}">
        </div>
      </div>
    `;
  } else if (slide.type === 'traction' || slide.type === 'financials') {
    fieldsHtml += `
      <div class="inspector-fields-grid" style="margin-top: 0.65rem;">
        <div class="form-group">
          <label>Metric 1 Value</label>
          <input type="text" class="form-input" id="inp-m1val" value="${escapeHtml(slide.m1Val || '')}">
        </div>
        <div class="form-group">
          <label>Metric 1 Label</label>
          <input type="text" class="form-input" id="inp-m1lbl" value="${escapeHtml(slide.m1Label || '')}">
        </div>
        <div class="form-group">
          <label>Metric 2 Value</label>
          <input type="text" class="form-input" id="inp-m2val" value="${escapeHtml(slide.m2Val || '')}">
        </div>
        <div class="form-group">
          <label>Metric 2 Label</label>
          <input type="text" class="form-input" id="inp-m2lbl" value="${escapeHtml(slide.m2Label || '')}">
        </div>
      </div>
    `;
  } else if (slide.type === 'quote') {
    fieldsHtml += `
      <div class="form-group" style="margin-top: 0.65rem;">
        <label>Quote Content</label>
        <textarea class="form-textarea" id="inp-quote" style="min-height: 80px;">${escapeHtml(slide.quote || '')}</textarea>
      </div>
      <div class="form-group" style="margin-top: 0.65rem;">
        <label>Author / Source</label>
        <input type="text" class="form-input" id="inp-author" value="${escapeHtml(slide.author || '')}">
      </div>
    `;
  } else if (slide.type === 'contact') {
    fieldsHtml += `
      <div class="inspector-fields-grid" style="margin-top: 0.65rem;">
        <div class="form-group">
          <label>Email Address</label>
          <input type="text" class="form-input" id="inp-email" value="${escapeHtml(slide.email || '')}">
        </div>
        <div class="form-group">
          <label>Website URL</label>
          <input type="text" class="form-input" id="inp-website" value="${escapeHtml(slide.website || '')}">
        </div>
      </div>
    `;
  }

  container.innerHTML = fieldsHtml;

  // Bind live inputs
  const bindInput = (id, prop) => {
    const el = document.getElementById(id);
    if (el) {
      el.addEventListener('input', (e) => {
        slide[prop] = e.target.value;
        renderSlideContent(slide, document.getElementById('slide-canvas-content'));
        updateSlideListItem(activeSlideIndex);
      });
    }
  };

  bindInput('inp-title', 'title');
  bindInput('inp-kicker', 'kicker');
  bindInput('inp-subtitle', 'subtitle');
  bindInput('inp-accent', 'accentColor');
  bindInput('inp-presenter', 'presenter');
  bindInput('inp-date', 'date');
  bindInput('inp-tam', 'tamVal');
  bindInput('inp-sam', 'samVal');
  bindInput('inp-som', 'somVal');
  bindInput('inp-cagr', 'cagr');
  bindInput('inp-m1val', 'm1Val');
  bindInput('inp-m1lbl', 'm1Label');
  bindInput('inp-m2val', 'm2Val');
  bindInput('inp-m2lbl', 'm2Label');
  bindInput('inp-quote', 'quote');
  bindInput('inp-author', 'author');
  bindInput('inp-email', 'email');
  bindInput('inp-website', 'website');

  const ptsEl = document.getElementById('inp-points');
  if (ptsEl) {
    ptsEl.addEventListener('input', (e) => {
      slide.points = e.target.value.split('\n').filter(p => p.trim());
      renderSlideContent(slide, document.getElementById('slide-canvas-content'));
    });
  }
}

// Render Left Sidebar Slides List
function renderSlidesList() {
  const container = document.getElementById('deck-slides-list');
  if (!container) return;
  container.innerHTML = '';

  activeDeck.forEach((slide, index) => {
    const item = document.createElement('div');
    item.className = `slide-list-item ${index === activeSlideIndex ? 'active' : ''}`;
    item.innerHTML = `
      <div class="slide-item-left">
        <span class="slide-num-pill">${index + 1}</span>
        <div>
          <div class="slide-item-title">${escapeHtml(slide.title || 'Slide ' + (index + 1))}</div>
          <span class="slide-item-type">${slide.type.toUpperCase()}</span>
        </div>
      </div>
      <div class="slide-item-actions">
        <button class="icon-action-btn btn-up" title="Move Up" ${index === 0 ? 'disabled style="opacity:0.3;"' : ''}>▲</button>
        <button class="icon-action-btn btn-down" title="Move Down" ${index === activeDeck.length - 1 ? 'disabled style="opacity:0.3;"' : ''}>▼</button>
      </div>
    `;

    item.addEventListener('click', (e) => {
      if (e.target.closest('.btn-up') || e.target.closest('.btn-down')) return;
      activeSlideIndex = index;
      updateUI();
    });

    const btnUp = item.querySelector('.btn-up');
    if (btnUp && index > 0) {
      btnUp.addEventListener('click', (e) => {
        e.stopPropagation();
        const tmp = activeDeck[index];
        activeDeck[index] = activeDeck[index - 1];
        activeDeck[index - 1] = tmp;
        activeSlideIndex = index - 1;
        updateUI();
      });
    }

    const btnDown = item.querySelector('.btn-down');
    if (btnDown && index < activeDeck.length - 1) {
      btnDown.addEventListener('click', (e) => {
        e.stopPropagation();
        const tmp = activeDeck[index];
        activeDeck[index] = activeDeck[index + 1];
        activeDeck[index + 1] = tmp;
        activeSlideIndex = index + 1;
        updateUI();
      });
    }

    container.appendChild(item);
  });

  const countBadge = document.getElementById('deck-slide-count-badge');
  if (countBadge) countBadge.textContent = `${activeDeck.length} Slides`;
  const tabDeckCount = document.getElementById('tab-deck-count');
  if (tabDeckCount) tabDeckCount.textContent = activeDeck.length;
}

function updateSlideListItem(index) {
  const container = document.getElementById('deck-slides-list');
  if (!container) return;
  const items = container.querySelectorAll('.slide-list-item');
  if (items[index]) {
    const titleEl = items[index].querySelector('.slide-item-title');
    if (titleEl) titleEl.textContent = activeDeck[index].title || `Slide ${index + 1}`;
  }
}

// Render Template Library Grid
function renderTemplateLibrary(categoryFilter = 'all') {
  const container = document.getElementById('template-cards-grid');
  if (!container) return;
  container.innerHTML = '';

  const filtered = TEMPLATE_DEFINITIONS.filter(t => categoryFilter === 'all' || t.category === categoryFilter);

  filtered.forEach(tmpl => {
    const card = document.createElement('div');
    card.className = 'template-card';
    card.innerHTML = `
      <div class="template-card-header">
        <span class="template-card-title">${escapeHtml(tmpl.name)}</span>
        <span class="template-card-cat">${escapeHtml(tmpl.category)}</span>
      </div>
      <div class="template-card-desc">${escapeHtml(tmpl.description)}</div>
      <button class="btn btn-secondary" style="padding: 0.25rem 0.5rem; font-size: 0.72rem; align-self: flex-start; margin-top: 0.25rem;">+ Insert Slide</button>
    `;
    card.addEventListener('click', () => {
      const newSlide = JSON.parse(JSON.stringify(tmpl.defaultData));
      newSlide.uid = 'slide_' + Math.random().toString(36).substr(2, 9);
      activeDeck.push(newSlide);
      activeSlideIndex = activeDeck.length - 1;
      updateUI();
      // Switch back to Deck tab
      switchTab('deck');
    });
    container.appendChild(card);
  });
}

function switchTab(tab) {
  const tabBtnDeck = document.getElementById('tab-btn-deck');
  const tabBtnLib = document.getElementById('tab-btn-library');
  const panelDeck = document.getElementById('tab-panel-deck');
  const panelLib = document.getElementById('tab-panel-library');

  if (tab === 'deck') {
    tabBtnDeck.classList.add('active');
    tabBtnLib.classList.remove('active');
    panelDeck.style.display = 'block';
    panelLib.style.display = 'none';
  } else {
    tabBtnLib.classList.add('active');
    tabBtnDeck.classList.remove('active');
    panelLib.style.display = 'block';
    panelDeck.style.display = 'none';
  }
}

function updateUI() {
  if (activeSlideIndex >= activeDeck.length) {
    activeSlideIndex = Math.max(0, activeDeck.length - 1);
  }
  renderSlidesList();
  renderSlideContent(activeDeck[activeSlideIndex], document.getElementById('slide-canvas-content'));
  renderInspector();
}

// Fullscreen Presentation Mode
function startPresentation() {
  isPresenting = true;
  const modal = document.getElementById('present-modal');
  modal.classList.add('active');
  renderPresentSlide();
  startTimer();

  try {
    if (document.documentElement.requestFullscreen) {
      document.documentElement.requestFullscreen().catch(() => {});
    }
  } catch (e) {}
}

function stopPresentation() {
  isPresenting = false;
  const modal = document.getElementById('present-modal');
  modal.classList.remove('active');
  clearInterval(presentTimerInterval);
  try {
    if (document.fullscreenElement && document.exitFullscreen) {
      document.exitFullscreen().catch(() => {});
    }
  } catch (e) {}
}

function renderPresentSlide() {
  const content = document.getElementById('present-canvas-content');
  renderSlideContent(activeDeck[activeSlideIndex], content);
  document.getElementById('present-hud-counter').textContent = `${activeSlideIndex + 1} / ${activeDeck.length}`;
}

function nextPresentSlide() {
  if (activeSlideIndex < activeDeck.length - 1) {
    activeSlideIndex++;
    renderPresentSlide();
    updateUI();
  }
}

function prevPresentSlide() {
  if (activeSlideIndex > 0) {
    activeSlideIndex--;
    renderPresentSlide();
    updateUI();
  }
}

function startTimer() {
  presentSeconds = 0;
  clearInterval(presentTimerInterval);
  const timerEl = document.getElementById('present-hud-timer');
  presentTimerInterval = setInterval(() => {
    presentSeconds++;
    const mins = String(Math.floor(presentSeconds / 60)).padStart(2, '0');
    const secs = String(presentSeconds % 60).padStart(2, '0');
    if (timerEl) timerEl.textContent = `${mins}:${secs}`;
  }, 1000);
}

// Export Standalone HTML
function exportStandaloneHTML() {
  const title = (activeDeck[0] && activeDeck[0].title) || 'Presentation';
  const slidesJson = JSON.stringify(activeDeck, null, 2);

  const htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>${escapeHtml(title)} - Presentation</title>
  <style>
    body { margin: 0; background: #06080e; color: #f8fafc; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 100vh; overflow: hidden; }
    #canvas { width: 92vw; max-width: 1280px; aspect-ratio: 16/9; background: #0c101c; border-radius: 16px; border: 1px solid rgba(255,255,255,0.1); box-shadow: 0 20px 60px rgba(0,0,0,0.8); padding: 3rem; box-sizing: border-box; display: flex; flex-direction: column; justify-content: space-between; }
    .hud { position: fixed; bottom: 1.5rem; display: flex; gap: 0.75rem; align-items: center; background: rgba(15,23,42,0.85); backdrop-filter: blur(8px); padding: 0.5rem 1rem; border-radius: 9999px; border: 1px solid rgba(255,255,255,0.15); }
    button { background: transparent; border: none; color: #cbd5e1; cursor: pointer; padding: 0.4rem 0.8rem; font-weight: 600; font-size: 0.9rem; border-radius: 9999px; }
    button:hover { background: rgba(255,255,255,0.15); color: #fff; }
    .kicker { font-size: 0.8rem; text-transform: uppercase; letter-spacing: 1.5px; font-weight: 700; margin-bottom: 0.4rem; color: #6366f1; }
    .title { font-size: 2.2rem; font-weight: 800; line-height: 1.2; margin-bottom: 0.5rem; }
    .subtitle { font-size: 1.05rem; color: #94a3b8; line-height: 1.4; }
    .cards { display: grid; grid-template-columns: repeat(3, 1fr); gap: 1rem; width: 100%; margin: 1.5rem 0; }
    .card { background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.08); border-radius: 8px; padding: 1.25rem; }
    .footer { display: flex; justify-content: space-between; border-top: 1px solid rgba(255,255,255,0.08); padding-top: 0.75rem; font-size: 0.8rem; color: #64748b; }
  </style>
</head>
<body>
  <div id="canvas"></div>
  <div class="hud">
    <button onclick="prev()">&larr; Prev</button>
    <span id="counter" style="color: #6366f1; font-weight: 700;">1 / 1</span>
    <button onclick="next()">Next &rarr;</button>
  </div>
  <script>
    const deck = ${slidesJson};
    let idx = 0;
    function render() {
      const s = deck[idx];
      const c = document.getElementById('canvas');
      c.innerHTML = '<div class="kicker">' + (s.kicker||'') + '</div>' +
                    '<div class="title">' + (s.title||'') + '</div>' +
                    '<div class="subtitle">' + (s.subtitle||'') + '</div>' +
                    '<div style="flex:1; display:flex; align-items:center;"><div style="font-size:1.1rem; line-height:1.6; color:#e2e8f0;">' + (s.quote || (s.points ? s.points.join('<br>&bull; ') : '')) + '</div></div>' +
                    '<div class="footer"><span>Slide ' + (idx+1) + ' of ' + deck.length + '</span><span>Standalone Presentation</span></div>';
      document.getElementById('counter').innerText = (idx+1) + ' / ' + deck.length;
    }
    function next() { if(idx < deck.length - 1) { idx++; render(); } }
    function prev() { if(idx > 0) { idx--; render(); } }
    window.onkeydown = (e) => { if(e.key === 'ArrowRight' || e.key === ' ') next(); if(e.key === 'ArrowLeft') prev(); };
    render();
  </script>
</body>
</html>`;

  const blob = new Blob([htmlContent], { type: 'text/html' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = `${title.toLowerCase().replace(/[^a-z0-9]/g, '_')}_presentation.html`;
  a.click();
}

// Print to PDF
function triggerPrint() {
  const container = document.getElementById('print-slides-container');
  container.innerHTML = '';
  activeDeck.forEach((slide) => {
    const page = document.createElement('div');
    page.className = 'print-slide-page';
    renderSlideContent(slide, page);
    container.appendChild(page);
  });
  window.print();
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

// DOM Event Listeners Initialization
document.addEventListener('DOMContentLoaded', () => {
  // Initial Boot
  loadPreset('pitch');
  renderTemplateLibrary('all');

  // Tab switching
  document.getElementById('tab-btn-deck').addEventListener('click', () => switchTab('deck'));
  document.getElementById('tab-btn-library').addEventListener('click', () => switchTab('library'));

  // Template category filter chips
  const filterChips = document.querySelectorAll('.filter-chip');
  filterChips.forEach(chip => {
    chip.addEventListener('click', () => {
      filterChips.forEach(c => c.classList.remove('active'));
      chip.classList.add('active');
      renderTemplateLibrary(chip.dataset.filter);
    });
  });

  // Toolbar Actions
  document.getElementById('btn-load-preset').addEventListener('click', () => {
    const val = document.getElementById('select-preset-deck').value;
    loadPreset(val);
  });

  document.getElementById('btn-add-quick-slide').addEventListener('click', () => {
    switchTab('library');
  });

  document.getElementById('btn-duplicate-slide').addEventListener('click', () => {
    const current = activeDeck[activeSlideIndex];
    if (!current) return;
    const cloned = JSON.parse(JSON.stringify(current));
    cloned.uid = 'slide_' + Math.random().toString(36).substr(2, 9);
    cloned.title = (cloned.title || 'Slide') + ' (Copy)';
    activeDeck.splice(activeSlideIndex + 1, 0, cloned);
    activeSlideIndex++;
    updateUI();
  });

  document.getElementById('btn-delete-slide').addEventListener('click', () => {
    if (activeDeck.length <= 1) {
      alert('Your deck must have at least one slide.');
      return;
    }
    activeDeck.splice(activeSlideIndex, 1);
    if (activeSlideIndex >= activeDeck.length) activeSlideIndex = activeDeck.length - 1;
    updateUI();
  });

  // Presentation Mode
  document.getElementById('btn-fullscreen-present').addEventListener('click', startPresentation);
  document.getElementById('present-btn-exit').addEventListener('click', stopPresentation);
  document.getElementById('present-btn-next').addEventListener('click', nextPresentSlide);
  document.getElementById('present-btn-prev').addEventListener('click', prevPresentSlide);

  // Keyboard navigation
  window.addEventListener('keydown', (e) => {
    if (e.key === 'F5') {
      e.preventDefault();
      startPresentation();
      return;
    }
    if (!isPresenting) return;
    if (e.key === 'Escape') stopPresentation();
    else if (e.key === 'ArrowRight' || e.key === ' ' || e.key === 'PageDown') {
      e.preventDefault();
      nextPresentSlide();
    } else if (e.key === 'ArrowLeft' || e.key === 'PageUp') {
      e.preventDefault();
      prevPresentSlide();
    }
  });

  // Export HTML
  document.getElementById('btn-export-html').addEventListener('click', exportStandaloneHTML);

  // Print PDF
  document.getElementById('btn-export-pdf').addEventListener('click', triggerPrint);

  // Export JSON
  document.getElementById('btn-export-json').addEventListener('click', () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(activeDeck, null, 2));
    const a = document.createElement('a');
    a.href = dataStr;
    a.download = `slide_deck_${Date.now()}.json`;
    a.click();
  });

  // Import JSON
  document.getElementById('file-import-deck').addEventListener('change', (e) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const parsed = JSON.parse(evt.target.result);
        if (Array.isArray(parsed) && parsed.length > 0) {
          activeDeck = parsed;
          activeSlideIndex = 0;
          updateUI();
        } else {
          alert('Invalid slide deck JSON format.');
        }
      } catch (err) {
        alert('Could not parse JSON file.');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  });
});