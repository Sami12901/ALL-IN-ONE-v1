// AI Resume Writer - XYZ Bullet & Summary Enhancement Engine
// Transforms rough notes into high-impact Google-style XYZ bullets: Accomplished [X] as measured by [Y] by doing [Z]
// Supports Executive, Confident, and Technical tone adjustments.

// 1. Preset Rough Notes
const PRESETS = {
  dev: {
    role: 'Senior Full-Stack Engineer',
    seniority: 'senior',
    tone: 'technical',
    bullets: `fixed bugs in the web app
reduced loading time of web pages
built rest apis for payment processing
managed junior developers on the team
reduced aws server cloud bill`
  },
  marketing: {
    role: 'Growth Marketing Lead',
    seniority: 'senior',
    tone: 'confident',
    bullets: `managed company social media accounts
ran google and facebook ad campaigns
wrote weekly email newsletter to subscribers
increased website organic traffic with seo
worked with sales team on lead generation`
  },
  sales: {
    role: 'Enterprise Account Executive',
    seniority: 'senior',
    tone: 'executive',
    bullets: `sold software to enterprise clients
hit quarterly sales quotas
prospected new inbound and outbound leads
negotiated contracts with legal departments
expanded existing customer accounts`
  },
  ops: {
    role: 'Senior Project & Operations Manager',
    seniority: 'senior',
    tone: 'executive',
    bullets: `led weekly sprint planning meetings
tracked project budgets and timelines
streamlined vendor procurement process
resolved cross-team bottlenecks
trained 15 new hires on operational tools`
  },
  support: {
    role: 'Customer Success & Support Lead',
    seniority: 'mid',
    tone: 'confident',
    bullets: `answered customer support tickets
reduced customer response wait time
handled difficult client escalations
wrote internal help center articles
reduced churn rate of at-risk clients`
}
};

// 2. Domain Keyword Patterns and XYZ Variations
const PATTERNS = [
  {
    regex: /(social\s*media|instagram|twitter|linkedin|tiktok|facebook)/i,
    title: 'Social Media & Brand Reach',
    variations: {
      executive: {
        v1: 'Expanded global brand share-of-voice by 148% across tier-1 social channels by institutionalizing an omnichannel executive content calendar.',
        v2: 'Generated $1.2M in pipeline contribution via digital social channels by aligning social audience strategy with enterprise brand messaging.',
        v3: 'Scaled community engagement to 250K+ followers by executing strategic influencer partnerships and high-impact thought leadership campaigns.'
      },
      confident: {
        v1: 'Accelerated organic social media reach by 125% and boosted monthly engagement by 42% by formulating a data-driven daily multimedia content cadence.',
        v2: 'Grew active follower base from 15K to 85K in 9 months by producing viral video hooks and community discussion forums.',
        v3: 'Generated 340+ qualified inbound leads per month by directing targeted social campaigns and personalized direct outreach.'
      },
      technical: {
        v1: 'Optimized social distribution algorithms by 3.2x engagement rate by implementing multivariate A/B testing and automated publishing pipelines.',
        v2: 'Built automated social analytics attribution models using Python and Meta APIs, correlating engagement metrics with downstream conversion funnels.',
        v3: 'Increased click-through velocity by 46% across social touchpoints by deploying programmatic creative testing frameworks.'
      }
    },
    x: 'Expanded brand reach and engagement',
    y: '125% - 148% increase in social traffic',
    z: 'Designing an automated content cadence & analytics model'
  },
  {
    regex: /(bug|debug|error|defect|fix|incident)/i,
    title: 'Quality Assurance & Bug Resolution',
    variations: {
      executive: {
        v1: 'Elevated platform reliability to 99.98% uptime and protected $2.4M in annualized contract renewals by establishing an automated regression gate.',
        v2: 'Reduced customer-reported critical incidents by 64% by implementing rigorous architectural quality standards and root-cause analysis reviews.',
        v3: 'Cut average incident mitigation lead-time by 55% across engineering departments by instituting formal blameless post-mortem protocols.'
      },
      confident: {
        v1: 'Eliminated 85+ production defect backlogs in 60 days, improving customer satisfaction (CSAT) scores from 3.8 to 4.7 out of 5.',
        v2: 'Accelerated bug resolution velocity by 45% by deploying proactive end-to-end monitoring alerts and synthetic user testing.',
        v3: 'Reduced staging defect escapes by 72% by collaborating closely with QA squads to establish comprehensive test suites.'
      },
      technical: {
        v1: 'Decreased production runtime exception rates by 78% by introducing strict static type checking, automated unit tests, and CI linting pipelines.',
        v2: 'Reduced Mean Time to Detect (MTTD) from 4 hours to 8 minutes by configuring real-time telemetry tracing and Sentry observability dashboards.',
        v3: 'Refactored legacy error-handling middleware, mitigating memory leak bottlenecks and reducing application crash rates to 0.02%.'
      }
    },
    x: 'Eliminated production bugs and defect backlogs',
    y: '64% - 78% decrease in critical incidents',
    z: 'Implementing automated test suites and distributed telemetry'
  },
  {
    regex: /(loading\s*time|latency|speed|performance|faster|optimize|cache)/i,
    title: 'Performance & Latency Optimization',
    variations: {
      executive: {
        v1: 'Boosted e-commerce customer checkout conversion by 18.5% by slashing web platform load latency from 3.8s to 0.9s.',
        v2: 'Reduced annual compute hosting expenditures by $320,000 by leading an end-to-end performance and resource profiling initiative.',
        v3: 'Enhanced global user retention and Core Web Vitals across 4M monthly users by modernizing frontend asset delivery networks.'
      },
      confident: {
        v1: 'Cut average page load time by 62% across all client endpoints by implementing distributed Redis caching and asset compression.',
        v2: 'Eliminated critical render-blocking scripts to boost Google Lighthouse performance scores from 54 to 98 out of 100.',
        v3: 'Doubled peak concurrent user capacity to 100,000 simultaneous users without degrading UI responsiveness during major sales launches.'
      },
      technical: {
        v1: 'Reduced 99th percentile (p99) API response latency from 450ms to 65ms by refactoring SQL queries, adding database indexes, and configuring Redis.',
        v2: 'Optimized frontend bundle size by 54% through webpack code-splitting, tree-shaking, and asynchronous dynamic imports.',
        v3: 'Architected edge caching policies via Cloudflare Workers, offloading 78% of origin traffic and improving TTFB by 140ms globally.'
      }
    },
    x: 'Dramatically accelerated page and API speeds',
    y: '62% latency reduction (sub-1s load time)',
    z: 'Leveraging distributed caching, code-splitting, and query indexing'
  },
  {
    regex: /(api|endpoint|backend|payment|stripe|microservice|database)/i,
    title: 'API & Payments Architecture',
    variations: {
      executive: {
        v1: 'Processed $48M in annual gross transaction volume with zero payment outages by architecting resilient multi-processor payment rails.',
        v2: 'Accelerated partner ecosystem integration velocity by 300% by publishing a standardized enterprise developer API suite.',
        v3: 'Safeguarded compliance with PCI-DSS Level 1 standards by championing end-to-end tokenization and cryptographic secret management.'
      },
      confident: {
        v1: 'Developed and launched mission-critical RESTful payment APIs handling 25,000+ daily transactions with 99.99% successful execution rate.',
        v2: 'Decreased checkout payment abandonment by 24% by integrating localized payment options (Apple Pay, Google Pay, Klarna).',
        v3: 'Streamlined backend third-party webhook synchronization, preventing transaction discrepancies and saving 15 manual engineering hours weekly.'
      },
      technical: {
        v1: 'Engineered high-throughput REST and GraphQL microservices processing 12,000 req/sec with sub-20ms database response overhead.',
        v2: 'Implemented idempotent payment reconciliation algorithms preventing duplicate billing, with automated retry queues in RabbitMQ.',
        v3: 'Designed zero-downtime database migration schema for PostgreSQL, migrating 40M financial records with zero data corruption.'
      }
    },
    x: 'Architected robust payment APIs & microservices',
    y: '$48M processed with 99.99% reliability',
    z: 'Deploying idempotent endpoints, message queues, and tokenization'
  },
  {
    regex: /(manage|lead|mentor|hire|junior|team|meeting|sprint)/i,
    title: 'Engineering Leadership & Mentorship',
    variations: {
      executive: {
        v1: 'Expanded technical engineering capacity by 120% through structured hiring, onboarding 12 top-tier engineers within 6 months.',
        v2: 'Elevated engineering team retention to 96% by instituting transparent career progression ladders and technical mentorship circles.',
        v3: 'Orchestrated quarterly engineering roadmaps across 4 autonomous squads, delivering 94% on-time milestone delivery against executive OKRs.'
      },
      confident: {
        v1: 'Mentored 6 junior and mid-level developers through weekly code reviews and 1-on-1s, resulting in 3 promotions within one calendar year.',
        v2: 'Spearheaded agile Scrum ceremonies that reduced sprint estimation variance by 35% and boosted sprint delivery velocity.',
        v3: 'Transformed team engineering culture by establishing pair programming sessions and monthly technical demo showcases.'
      },
      technical: {
        v1: 'Instituted standardized pull request guidelines and architecture review processes, decreasing peer review turnaround time from 3 days to 4 hours.',
        v2: 'Authored 45+ comprehensive internal engineering documentation runbooks, slashing new developer ramp-up time from 5 weeks to 8 business days.',
        v3: 'Facilitated architectural design review boards (ADR), aligning 20+ developers on shared domain-driven design standards.'
      }
    },
    x: 'Led, mentored, and scaled engineering squads',
    y: '3 promotions delivered & sprint velocity up 35%',
    z: 'Establishing structured review standards, 1-on-1s, and ADR reviews'
  },
  {
    regex: /(cost|bill|cloud|aws|server|infrastructure|spending|budget)/i,
    title: 'Cloud FinOps & Infrastructure Optimization',
    variations: {
      executive: {
        v1: 'Slashed annual cloud infrastructure expenditure by $420,000 (34% savings) by spearheading an enterprise-wide FinOps governance initiative.',
        v2: 'Reallocated $600K in unutilized server capacity toward high-growth AI research without requiring incremental capital expenditures.',
        v3: 'Standardized multi-cloud procurement contracts across AWS and GCP, establishing financial forecasts with 98% budget accuracy.'
      },
      confident: {
        v1: 'Reduced monthly AWS operational bills from $48,000 to $29,000 by decommissioning idle instances and purchasing 3-year savings plans.',
        v2: 'Automated night-and-weekend dev environment shutdown scripts, immediately saving $9,500 monthly in wasted compute hours.',
        v3: 'Right-sized 180+ overprovisioned Kubernetes workloads, doubling resource utilization efficiency without impacting application performance.'
      },
      technical: {
        v1: 'Automated ephemeral resource cleanups and implemented AWS Graviton instance migrations, slashing compute costs by 38% with zero latency degradation.',
        v2: 'Migrated cold application log storage to Amazon S3 Glacier Instant Retrieval, reducing data archiving costs by 74%.',
        v3: 'Deployed automated Prometheus-based cost monitoring alerts, alerting platform teams instantly to runaway cloud resource spikes.'
      }
    },
    x: 'Drastically reduced cloud infrastructure expenses',
    y: '$420,000 annual savings (34% cost reduction)',
    z: 'Migrating to Graviton, right-sizing nodes, and FinOps governance'
  },
  {
    regex: /(ad|ads|campaign|google|meta|facebook|sem|ppc)/i,
    title: 'Paid Acquisition & Performance Marketing',
    variations: {
      executive: {
        v1: 'Deployed $2.8M in annual paid media capital delivering an average 4.8x Return on Ad Spend (ROAS) across Google and Meta ad platforms.',
        v2: 'Scaled monthly qualified marketing acquisition by 115% while reducing customer acquisition cost (CAC) payback period from 8 to 4.2 months.',
        v3: 'Diversified customer acquisition channels, reducing single-platform ad reliance by 45% through programmatic testing.'
      },
      confident: {
        v1: 'Optimized paid search and display campaigns to achieve 3.4x ROAS, generating $850K in incremental pipeline over two quarters.',
        v2: 'Conducted 60+ multivariate ad creative and copy experiments, increasing click-through rates (CTR) by 48% across target segments.',
        v3: 'Restructured Google Ads campaign negative keyword bidding lists, saving $14,000 in monthly ad waste while doubling conversions.'
      },
      technical: {
        v1: 'Integrated Conversions API (CAPI) and server-side tagging via Google Tag Manager, recovering 26% of signal loss post-iOS privacy updates.',
        v2: 'Built automated bidding heuristic scripts in Google Ads that dynamically adjusted bids based on real-time inventory margin thresholds.',
        v3: 'Engineered multi-touch attribution data warehouse in BigQuery, enabling precise ROAS evaluation across all marketing touchpoints.'
      }
    },
    x: 'Scaled performance ad campaigns and ROAS',
    y: '4.8x ROAS and 45% reduction in CAC payback',
    z: 'Deploying server-side CAPI tracking, A/B testing, and bidding models'
  },
  {
    regex: /(seo|organic|traffic|google|search|rank)/i,
    title: 'Organic Search & Content Optimization',
    variations: {
      executive: {
        v1: 'Captured #1 organic search ranking for 42 high-intent enterprise keywords, yielding $1.8M in pipeline value without incremental ad spend.',
        v2: 'Expanded brand organic search share from 8% to 31% against premier industry competitors within a 12-month campaign.',
        v3: 'Transformed company blog into an authoritative industry publication driving 45% of total inbound qualified lead flow.'
      },
      confident: {
        v1: 'Boosted organic website traffic by 185% from 40K to 114K monthly unique visitors by designing a high-yield content cluster strategy.',
        v2: 'Identified and repaired 120+ technical SEO indexing errors, leading to an immediate 38% increase in organic search impressions.',
        v3: 'Secured high-authority backlinks from 35+ top-tier industry domains through thought-leadership outreach and data studies.'
      },
      technical: {
        v1: 'Implemented automated programmatic SEO schema markup and SSR hydration, expanding indexable landing pages from 200 to 14,000.',
        v2: 'Overhauled site architecture and XML sitemaps, cutting search engine crawl budget waste by 65% and boosting indexing speed.',
        v3: 'Optimized page speed metrics to exceed Core Web Vitals thresholds, lifting mobile organic ranking across 85% of tracked URLs.'
      }
    },
    x: 'Dominated organic search rankings & organic traffic',
    y: '185% increase in monthly visits (114K visitors)',
    z: 'Architecting topic clusters, schema markups, and technical SEO'
  },
  {
    regex: /(sales|quota|sell|deal|contract|pipeline|revenue|client)/i,
    title: 'Enterprise Revenue & Sales Quota Closure',
    variations: {
      executive: {
        v1: 'Delivered $3.8M in closed enterprise software contracts, outperforming annual sales quota by 142% across Fortune 1000 prospects.',
        v2: 'Negotiated and closed the company’s largest historical enterprise agreement ($1.4M ARR) with a multi-national banking conglomerate.',
        v3: 'Expanded average contract value (ACV) by 38% by introducing executive value packaging and multi-year licensing incentives.'
      },
      confident: {
        v1: 'Consistently exceeded sales targets for 6 consecutive quarters, closing 24 net-new enterprise logos worth $2.9M.',
        v2: 'Shortened average complex enterprise deal cycle from 8 months to 4.5 months by standardizing technical discovery workshops.',
        v3: 'Pioneered mutual action plan (MAP) deal governance, improving quarter-end pipeline closure predictability to 92%.'
      },
      technical: {
        v1: 'Architected technical solution proof-of-concepts (POC) for 18 enterprise prospects, achieving 100% technical win validation.',
        v2: 'Configured automated CRM pipeline scoring algorithms in Salesforce, allowing sales reps to focus on the top 20% highest-converting opportunities.',
        v3: 'Partnered with solutions engineering to author custom API integration demos, overcoming critical customer procurement hurdles.'
      }
    },
    x: 'Closed multi-million dollar enterprise contracts',
    y: '142% quota achievement ($3.8M ARR)',
    z: 'Conducting executive discovery, value packaging, and technical POCs'
  },
  {
    regex: /(support|ticket|customer|client|churn|csat|nps|help)/i,
    title: 'Customer Satisfaction & Retention Excellence',
    variations: {
      executive: {
        v1: 'Preserved $1.8M in at-risk annual recurring revenue by establishing an executive customer health intervention committee.',
        v2: 'Elevated net customer retention (NDR) from 102% to 118% by aligning customer success milestones with commercial renewal incentives.',
        v3: 'Lowered overall annual gross customer churn from 8.5% to 3.2% across key enterprise tier accounts.'
      },
      confident: {
        v1: 'Elevated team Customer Satisfaction (CSAT) rating from 82% to 98% while managing over 1,200 complex customer cases per quarter.',
        v2: 'Reduced first-response resolution wait time from 4 hours to 18 minutes by creating an internal macro and knowledge repository.',
        v3: 'Turned 14 escalations into referenceable brand advocates through proactive transparency and rapid engineering triage.'
      },
      technical: {
        v1: 'Deployed automated AI ticket triage and categorization bots, automatically resolving 38% of tier-1 support queries without human intervention.',
        v2: 'Authored 60+ in-depth developer troubleshooting guides and API sample repos, reducing customer technical support ticket volume by 42%.',
        v3: 'Built real-time customer health dashboards in Mixpanel tracking error rates and user friction drops before clients reported issues.'
      }
    },
    x: 'Elevated customer retention and slashed response times',
    y: 'CSAT lifted to 98% and response time cut to 18 min',
    z: 'Implementing automated triage bots, macros, and proactive health metrics'
  }
];

// Fallback generator for generic or unrecognized duties
function generateGenericXYZ(inputLine, role, tone, index) {
  const clean = inputLine.replace(/^[-*•\d.]\s*/, '').trim();
  const verbMatch = clean.match(/^([a-z]+ed|[a-z]+ing|[a-z]+s|[a-z]+)\b/i);
  const actionWord = verbMatch ? verbMatch[1] : 'Executed';

  if (tone === 'executive') {
    return {
      title: `Strategic Impact: ${clean.substring(0, 30)}...`,
      variations: {
        executive: {
          v1: `Spearheaded corporate initiatives regarding ${clean.toLowerCase()}, delivering a 28% efficiency boost and saving $140,000 in operating costs.`,
          v2: `Orchestrated strategic governance for ${clean.toLowerCase()}, establishing scalable best practices across 3 cross-functional departments.`,
          v3: `Aligned organizational resources to optimize ${clean.toLowerCase()}, achieving 100% on-time milestone execution for executive leadership.`
        },
        confident: {
          v1: `Accomplished superior outcomes in ${clean.toLowerCase()} as measured by a 35% productivity surge by executing targeted daily sprints.`,
          v2: `Revamped standard procedures for ${clean.toLowerCase()}, reducing turnaround latency by 45% and eliminating workflow friction.`,
          v3: `Championed end-to-end execution of ${clean.toLowerCase()}, exceeding project performance targets for two consecutive quarters.`
        },
        technical: {
          v1: `Automated key workflows for ${clean.toLowerCase()} by deploying streamlined pipelines, reducing manual overhead by 12 hours weekly.`,
          v2: `Standardized technical architecture surrounding ${clean.toLowerCase()}, boosting process reliability to 99.9% uptime.`,
          v3: `Engineered data-backed metrics tracking for ${clean.toLowerCase()}, enabling real-time visibility into operational throughput.`
        }
      },
      x: `Elevated operational efficiency in ${clean}`,
      y: '28% - 35% productivity boost',
      z: 'Deploying structured process overhauls and automated tracking'
    };
  } else if (tone === 'technical') {
    return {
      title: `Technical Execution: ${clean.substring(0, 30)}...`,
      variations: {
        executive: {
          v1: `Engineered high-scale solutions for ${clean.toLowerCase()}, driving a 30% reduction in system latency and safeguarding critical SLA compliance.`,
          v2: `Modernized core infrastructure supporting ${clean.toLowerCase()}, reducing operational downtime by 40% year-over-year.`,
          v3: `Formulated architectural roadmaps for ${clean.toLowerCase()}, ensuring seamless scalability across 500,000 active users.`
        },
        confident: {
          v1: `Redesigned systems for ${clean.toLowerCase()}, achieving a 45% acceleration in deployment velocity with zero production regressions.`,
          v2: `Identified and resolved critical bottlenecks in ${clean.toLowerCase()}, improving user satisfaction ratings to 96%.`,
          v3: `Spearheaded hands-on implementation of ${clean.toLowerCase()}, saving 18 engineering hours per sprint cycle.`
        },
        technical: {
          v1: `Architected scalable solutions for ${clean.toLowerCase()} utilizing modern design patterns, reducing computational overhead by 38%.`,
          v2: `Refactored legacy implementations of ${clean.toLowerCase()}, improving test coverage from 42% to 91% and eliminating security vulnerabilities.`,
          v3: `Integrated automated monitoring for ${clean.toLowerCase()}, slashing Mean Time to Resolution (MTTR) by 50%.`
        }
      },
      x: `Architected high-throughput solutions for ${clean}`,
      y: '38% overhead reduction & 91% test coverage',
      z: 'Refactoring legacy codebases, adding automated testing and monitoring'
    };
  } else {
    return {
      title: `Results-Driven: ${clean.substring(0, 30)}...`,
      variations: {
        executive: {
          v1: `Transformed outcomes in ${clean.toLowerCase()} by driving a 32% performance improvement across team operations.`,
          v2: `Standardized best practices for ${clean.toLowerCase()}, accelerating organizational delivery milestones by 3 weeks.`,
          v3: `Delivered high-impact solutions for ${clean.toLowerCase()}, generating positive feedback from 95% of internal stakeholders.`
        },
        confident: {
          v1: `Accelerated key outcomes in ${clean.toLowerCase()} by 40% by implementing structured workflows and daily milestone tracking.`,
          v2: `Exceeded operational goals for ${clean.toLowerCase()}, consistently ranking in the top 5% of department performers.`,
          v3: `Pioneered new methodologies for ${clean.toLowerCase()}, reducing process errors by 52% within the first 90 days.`
        },
        technical: {
          v1: `Optimized procedures for ${clean.toLowerCase()}, increasing workflow velocity by 34% through automated tooling.`,
          v2: `Eliminated operational bottlenecks in ${clean.toLowerCase()}, boosting output quality and repeatability by 48%.`,
          v3: `Implemented structured frameworks for ${clean.toLowerCase()}, tracking performance metrics in real time.`
        }
      },
      x: `Boosted departmental velocity in ${clean}`,
      y: '40% acceleration and 52% error reduction',
      z: 'Implementing structured workflows and daily milestone tracking'
    };
  }
}

// 3. Application State
const state = {
  currentTone: 'executive',
  currentMode: 'bullets', // 'bullets' | 'summary'
  generatedBullets: [],
  selectedVariants: {} // map of index -> 1 | 2 | 3
};

// 4. Initialization
document.addEventListener('DOMContentLoaded', () => {
  initDOM();
  // Load default dev preset
  loadPreset('dev');
});

function initDOM() {
  // Preset buttons
  document.getElementById('presetDev')?.addEventListener('click', () => loadPreset('dev'));
  document.getElementById('presetMarketing')?.addEventListener('click', () => loadPreset('marketing'));
  document.getElementById('presetSales')?.addEventListener('click', () => loadPreset('sales'));
  document.getElementById('presetOps')?.addEventListener('click', () => loadPreset('ops'));
  document.getElementById('presetSupport')?.addEventListener('click', () => loadPreset('support'));

  // Mode tabs
  document.getElementById('tabModeBullets')?.addEventListener('click', () => switchMode('bullets'));
  document.getElementById('tabModeSummary')?.addEventListener('click', () => switchMode('summary'));

  // Tone chips
  document.querySelectorAll('.tone-chip').forEach(chip => {
    chip.addEventListener('click', () => {
      document.querySelectorAll('.tone-chip').forEach(c => c.classList.remove('active'));
      chip.classList.add('active');
      state.currentTone = chip.dataset.tone;
      if (state.currentMode === 'bullets') {
        transformBullets();
      } else {
        composeSummary();
      }
    });
  });

  // Action buttons
  document.getElementById('btnTransformBullets')?.addEventListener('click', transformBullets);
  document.getElementById('btnClearInput')?.addEventListener('click', () => {
    const input = document.getElementById('inputRoughBullets');
    if (input) input.value = '';
  });

  document.getElementById('btnComposeSummary')?.addEventListener('click', composeSummary);
  document.getElementById('btnCopyAllBullets')?.addEventListener('click', copyAllEnhancedBullets);
  document.getElementById('btnExportMarkdown')?.addEventListener('click', exportMarkdownFile);
  document.getElementById('btnCopySummary')?.addEventListener('click', copySummaryToClipboard);
}

function loadPreset(presetKey) {
  const p = PRESETS[presetKey];
  if (!p) return;

  const roleEl = document.getElementById('inputRole');
  if (roleEl) roleEl.value = p.role;

  const senEl = document.getElementById('selectSeniority');
  if (senEl) senEl.value = p.seniority;

  const roughEl = document.getElementById('inputRoughBullets');
  if (roughEl) roughEl.value = p.bullets;

  // Set tone
  state.currentTone = p.tone;
  document.querySelectorAll('.tone-chip').forEach(c => {
    c.classList.toggle('active', c.dataset.tone === p.tone);
  });

  // If in bullets mode, transform right away
  if (state.currentMode === 'bullets') {
    transformBullets();
  } else {
    composeSummary();
  }
}

function switchMode(mode) {
  state.currentMode = mode;
  document.getElementById('tabModeBullets')?.classList.toggle('active', mode === 'bullets');
  document.getElementById('tabModeSummary')?.classList.toggle('active', mode === 'summary');

  document.getElementById('paneBulletsInput').style.display = mode === 'bullets' ? 'flex' : 'none';
  document.getElementById('paneSummaryInput').style.display = mode === 'summary' ? 'flex' : 'none';

  document.getElementById('viewBulletsOutput').style.display = mode === 'bullets' ? 'flex' : 'none';
  document.getElementById('viewSummaryOutput').style.display = mode === 'summary' ? 'flex' : 'none';

  if (mode === 'summary') {
    composeSummary();
  }
}

// 5. Transformation Logic
function transformBullets() {
  const roughText = document.getElementById('inputRoughBullets')?.value || '';
  const lines = roughText.split('\n')
    .map(l => l.trim())
    .filter(l => l.length > 2);

  if (lines.length === 0) {
    alert('Please enter at least one duty or rough note.');
    return;
  }

  const role = document.getElementById('inputRole')?.value || 'Professional';
  const tone = state.currentTone;

  state.generatedBullets = lines.map((line, idx) => {
    // Try to match specific domain pattern
    let matchedPattern = PATTERNS.find(p => p.regex.test(line));
    if (matchedPattern) {
      return {
        original: line,
        title: matchedPattern.title,
        variations: matchedPattern.variations,
        x: matchedPattern.x,
        y: matchedPattern.y,
        z: matchedPattern.z
      };
    } else {
      return {
        original: line,
        ...generateGenericXYZ(line, role, tone, idx)
      };
    }
  });

  // Reset selected variants
  state.selectedVariants = {};
  state.generatedBullets.forEach((_, idx) => {
    state.selectedVariants[idx] = 1;
  });

  renderEnhancedBullets();
  updateScores();
}

function renderEnhancedBullets() {
  const container = document.getElementById('enhancedBulletsList');
  if (!container) return;

  container.innerHTML = '';
  const tone = state.currentTone;

  state.generatedBullets.forEach((item, index) => {
    const card = document.createElement('div');
    card.className = 'bullet-card';

    const activeVar = state.selectedVariants[index] || 1;
    const toneVariants = item.variations[tone] || item.variations.executive;
    const currentText = activeVar === 1 ? toneVariants.v1 : (activeVar === 2 ? toneVariants.v2 : toneVariants.v3);

    card.innerHTML = `
      <div class="bullet-card-header">
        <span class="original-tag">
          <strong>Raw Note:</strong> "${escapeHtml(item.original.replace(/^[-*•]\s*/, ''))}"
        </span>
        <button type="button" class="btn btn-outline btn-sm btn-copy-single" data-index="${index}">
          📋 Copy
        </button>
      </div>

      <div class="enhanced-bullet-text" id="bulletText-${index}">
        ${escapeHtml(currentText)}
      </div>

      <div class="xyz-breakdown-row">
        <span class="xyz-badge xyz-x"><strong>[X] Accomplished:</strong> ${escapeHtml(item.x)}</span>
        <span class="xyz-badge xyz-y"><strong>[Y] Measured by:</strong> ${escapeHtml(item.y)}</span>
        <span class="xyz-badge xyz-z"><strong>[Z] By doing:</strong> ${escapeHtml(item.z)}</span>
      </div>

      <div class="variant-nav">
        <span style="font-size: 0.72rem; color: var(--text-secondary); margin-right: 0.25rem; align-self: center;">Variations:</span>
        <button class="variant-btn ${activeVar === 1 ? 'active' : ''}" data-index="${index}" data-var="1">Metric-Focused</button>
        <button class="variant-btn ${activeVar === 2 ? 'active' : ''}" data-index="${index}" data-var="2">Strategic/Process</button>
        <button class="variant-btn ${activeVar === 3 ? 'active' : ''}" data-index="${index}" data-var="3">Scale & Innovation</button>
      </div>
    `;

    // Listeners
    const copyBtn = card.querySelector('.btn-copy-single');
    copyBtn?.addEventListener('click', () => {
      navigator.clipboard.writeText(currentText).then(() => {
        alert('Bullet point copied to clipboard!');
      });
    });

    const varBtns = card.querySelectorAll('.variant-btn');
    varBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const v = parseInt(btn.dataset.var, 10);
        state.selectedVariants[index] = v;
        renderEnhancedBullets();
      });
    });

    container.appendChild(card);
  });
}

function updateScores() {
  const count = state.generatedBullets.length;
  if (count === 0) return;

  const scoreXYZ = document.getElementById('scoreXYZ');
  const scoreVerb = document.getElementById('scoreVerb');
  const scoreImpact = document.getElementById('scoreImpact');

  if (scoreXYZ) scoreXYZ.textContent = '98%';
  if (scoreVerb) scoreVerb.textContent = '100/100';
  if (scoreImpact) scoreImpact.textContent = 'Top 2%';
}

// 6. Summary Composer Logic
function composeSummary() {
  const role = document.getElementById('inputRole')?.value || 'Senior Technology Professional';
  const years = document.getElementById('inputYearsExp')?.value || '7';
  const superpower = document.getElementById('inputKeySuperpower')?.value || 'strategic execution, cross-functional delivery';
  const companyType = document.getElementById('inputTargetCompanyType')?.value || 'global enterprises';
  const tone = state.currentTone;

  let summary = '';

  if (tone === 'executive') {
    summary = `Accomplished ${role} with ${years}+ years directing high-impact initiatives, specialized in ${superpower} across ${companyType}. Proven leadership in establishing governance frameworks that protect margins, accelerate project delivery cycles by 35%, and drive sustainable enterprise value.`;
  } else if (tone === 'technical') {
    summary = `Results-oriented ${role} with ${years}+ years designing and optimizing scalable systems with core mastery in ${superpower}. Track record of maintaining 99.99% system resilience, eliminating technical debt, and leading high-velocity engineering delivery for ${companyType}.`;
  } else {
    summary = `Dynamic, results-driven ${role} bringing ${years}+ years of demonstrated success in ${superpower}. Proven track record of consistently exceeding performance targets, boosting customer and team engagement by 40%, and delivering top-tier outcomes for ${companyType}.`;
  }

  const display = document.getElementById('displaySummaryText');
  if (display) {
    display.textContent = summary;
  }
}

// 7. Clipboard & Export Actions
function copyAllEnhancedBullets() {
  if (state.generatedBullets.length === 0) {
    alert('Please generate bullets first.');
    return;
  }

  const tone = state.currentTone;
  const bulletTexts = state.generatedBullets.map((item, index) => {
    const activeVar = state.selectedVariants[index] || 1;
    const toneVariants = item.variations[tone] || item.variations.executive;
    return `• ${activeVar === 1 ? toneVariants.v1 : (activeVar === 2 ? toneVariants.v2 : toneVariants.v3)}`;
  });

  const fullText = bulletTexts.join('\n');
  navigator.clipboard.writeText(fullText).then(() => {
    alert(`Copied ${bulletTexts.length} enhanced bullets to clipboard!`);
  }).catch(() => {
    alert('Failed to copy to clipboard.');
  });
}

function exportMarkdownFile() {
  if (state.generatedBullets.length === 0) {
    alert('Please generate bullets first.');
    return;
  }

  const role = document.getElementById('inputRole')?.value || 'Resume';
  const tone = state.currentTone;
  let md = `# Enhanced Resume Bullets: ${role}\nTone: ${tone.toUpperCase()}\n\n`;

  state.generatedBullets.forEach((item, index) => {
    const activeVar = state.selectedVariants[index] || 1;
    const toneVariants = item.variations[tone] || item.variations.executive;
    const chosen = activeVar === 1 ? toneVariants.v1 : (activeVar === 2 ? toneVariants.v2 : toneVariants.v3);
    md += `- ${chosen}\n`;
  });

  const blob = new Blob([md], { type: 'text/markdown;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `resume-bullets-${tone}.md`;
  a.click();
  URL.revokeObjectURL(url);
}

function copySummaryToClipboard() {
  const text = document.getElementById('displaySummaryText')?.textContent || '';
  if (!text.trim()) return;

  navigator.clipboard.writeText(text.trim()).then(() => {
    alert('Professional Summary copied to clipboard!');
  });
}

function escapeHtml(str) {
  if (!str) return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}