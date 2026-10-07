// Client-Side ATS Resume Auditor Logic
// 100% In-Browser Privacy Preserving Engine

const STOP_WORDS = new Set([
  'a', 'about', 'above', 'after', 'again', 'against', 'all', 'am', 'an', 'and', 'any', 'are', 'aren',
  'as', 'at', 'be', 'because', 'been', 'before', 'being', 'below', 'between', 'both', 'but', 'by',
  'can', 'could', 'did', 'do', 'does', 'doing', 'down', 'during', 'each', 'few', 'for', 'from',
  'further', 'had', 'has', 'have', 'having', 'he', 'her', 'here', 'hers', 'herself', 'him', 'himself',
  'his', 'how', 'i', 'if', 'in', 'into', 'is', 'it', 'its', 'itself', 'just', 'me', 'more', 'most',
  'my', 'myself', 'no', 'nor', 'not', 'now', 'of', 'off', 'on', 'once', 'only', 'or', 'other', 'our',
  'ours', 'ourselves', 'out', 'over', 'own', 'same', 'she', 'should', 'so', 'some', 'such', 'than',
  'that', 'the', 'their', 'theirs', 'them', 'themselves', 'then', 'there', 'these', 'they', 'this',
  'those', 'through', 'to', 'too', 'under', 'until', 'up', 'very', 'was', 'we', 'were', 'what', 'when',
  'where', 'which', 'while', 'who', 'whom', 'why', 'will', 'with', 'would', 'you', 'your', 'yours',
  'yourself', 'yourselves', 'etc', 'eg', 'ie', 'role', 'job', 'work', 'working', 'responsibilities'
]);

const POWER_ACTION_VERBS = [
  'spearheaded', 'orchestrated', 'architected', 'engineered', 'streamlined', 'optimized',
  'scaled', 'accelerated', 'transformed', 'pioneered', 'implemented', 'championed',
  'negotiated', 'delivered', 'designed', 'built', 'directed', 'founded', 'managed',
  'navigated', 'commanded', 'maximized', 'minimized', 'automated', 'standardized',
  'consolidated', 'restructured', 'audited', 'deployed', 'launched', 'overhauled',
  'boosted', 'generated', 'surpassed', 'authored', 'established', 'formulated',
  'mobilized', 'integrated', 'resolved', 'trained', 'mentored', 'facilitated',
  'executed', 'curated', 'cultivated', 'expanded', 'secured', 'decreased', 'increased'
];

const WEAK_PASSIVE_PHRASES = [
  'responsible for', 'assisted with', 'worked on', 'helped with', 'duties included',
  'participated in', 'tasked with', 'handled', 'involved in', 'assisted in',
  'helped to', 'supported with', 'served as', 'attempted to'
];

// Sample datasets for 1-click testing
const SAMPLES = {
  tech: {
    cv: `Alex Rivera
alex.rivera@cloudscale.io | (415) 555-0199 | San Francisco, CA | linkedin.com/in/alexrivera-tech

PROFESSIONAL SUMMARY
Senior Full-Stack Engineer and Distributed Systems Architect with 7+ years building enterprise SaaS platforms. Expert in TypeScript, React, Node.js, Kubernetes, and AWS infrastructure. Track record of scaling microservices to 10M+ daily active requests with 99.99% uptime.

EXPERIENCE
Lead Systems Engineer | ScaleStream Media | 2021 – Present
• Architected event-driven microservices processing 12,000 requests/second using Go, Kafka, and Kubernetes.
• Reduced p99 API latency from 420ms to 65ms (-84%) through Redis caching and query indexing.
• Automated CI/CD deployments via GitHub Actions and Terraform, shrinking release cycle from 3 days to 18 minutes.
• Spearheaded migration of legacy monolith to AWS ECS, trimming annual cloud infrastructure costs by $140,000.
• Mentored 8 junior and mid-level engineers in distributed systems design and code quality standards.

Full-Stack Software Engineer | Nexa Commerce | 2018 – 2021
• Engineered high-converting checkout service using React, GraphQL, and Node.js for 2.4M monthly customers.
• Scaled database throughput by 65% through PostgreSQL partitioning and connection pooling.
• Implemented OAuth2 and SSO security protocols across 14 enterprise client integrations.

TECHNICAL SKILLS
Languages: TypeScript, JavaScript, Go, Python, SQL, HTML5/CSS3
Frameworks & Libraries: React, Node.js, Next.js, Express, GraphQL, TailwindCSS
Cloud & DevOps: AWS (ECS, S3, RDS, Lambda), Docker, Kubernetes, Terraform, GitHub Actions, CI/CD
Databases: PostgreSQL, Redis, MongoDB, Kafka

EDUCATION
Bachelor of Science in Computer Science | UC Berkeley | 2018`,
    jd: `Senior Full-Stack Software Engineer (Cloud & Microservices)

We are looking for a Senior Full-Stack Engineer to lead the architecture of our next-generation cloud platform. You will design, build, and deploy highly available microservices in a fast-paced environment.

Requirements & Qualifications:
• 5+ years building production web applications with React, TypeScript, and Node.js.
• Strong experience with AWS cloud services, Docker containers, Kubernetes, and Terraform infrastructure as code.
• Demonstrated mastery in database optimization, specifically PostgreSQL and Redis caching.
• Experience designing event-driven architectures with Apache Kafka or RabbitMQ.
• Deep understanding of CI/CD automation pipelines and automated testing (Jest, Cypress).
• Proven track record improving latency, scalability, and system reliability (99.99% SLA).
• Excellent communication, cross-functional collaboration, and technical mentoring skills.`
  },
  sales: {
    cv: `Marcus Vance
marcus.vance@enterprisesales.io | +1 (312) 555-0144 | Chicago, IL | linkedin.com/in/marcus-vance-sales

EXECUTIVE SUMMARY
President's Club Enterprise Account Executive with 8+ years executing high-ticket B2B software sales across Fortune 500 corporations. Proven track record generating $18.4M in closed ARR with an average 145% annual quota attainment. Master practitioner of MEDDPIC and Command of the Message.

PROFESSIONAL EXPERIENCE
Senior Enterprise Account Executive | Sentinel Cloud Security | 2021 – Present
• Surpassed 2023 annual quota at 148% ($3.55M against $2.4M target), earning President's Club top honors.
• Originated and negotiated $1.2M ACV flagship master services agreement with a Tier-1 Global Investment Bank.
• Generated $5.2M in qualified self-sourced pipeline through consultative C-suite executive champion mapping.
• Shortened enterprise sales cycle from 110 days to 72 days utilizing MEDDPIC discovery and mutual action plans.

Enterprise Account Executive | DataScale Systems | 2018 – 2021
• Closed 24 net-new enterprise accounts representing $4.8M in cumulative contract value.
• Outperformed team quota at 138% average attainment over 12 consecutive quarters.
• Responsible for managing commercial contract negotiations and legal redlines.

COMPETENCIES & TOOLS
CRM & Sales Tech: Salesforce Lightning, HubSpot, Gong.io, Outreach.io, ZoomInfo, LinkedIn Sales Navigator
Methodologies: MEDDPIC Qualification, Command of the Message, The Challenger Sale, Consultative Selling
Commercial Skills: Pipeline Generation, Quota Overachievement, Contract Negotiation, Executive C-Suite Alignment

EDUCATION
B.S. in Business Administration | University of Illinois Urbana-Champaign`
  },
  pm: {
    cv: `Sarah Jenkins
sarah.jenkins@productlead.com | (206) 555-0177 | Seattle, WA | linkedin.com/in/sarah-jenkins-pm

SUMMARY
Data-informed Principal Product Manager with 8+ years leading cross-functional engineering, UX, and growth teams for consumer tech applications. Drove 45% increase in annual active users and launched 6 marquee mobile products from zero to one.

EXPERIENCE
Principal Product Manager | StreamWave Media | 2021 – Present
• Spearheaded mobile recommendation engine redesign, boosting 30-day user retention by 22% for 4.8M users.
• Launched subscription monetization tiers resulting in $8.5M in annualized incremental ARR within 9 months.
• Orchestrated sprint roadmaps across 3 agile squads (24 engineers, 4 designers) with 94% on-time milestone delivery.
• Optimized onboarding funnel, decreasing drop-off by 31% through rigorous A/B experimentation.

Senior Product Manager | Omnichannel Retail Labs | 2017 – 2021
• Directed mobile checkout overhaul, lifting checkout conversion from 2.1% to 3.4% (+62% relative improvement).
• Collaborated with data science to build automated customer segmentation models for 12M customer profiles.
• Managed stakeholder communications and executive quarterly business reviews.

SKILLS
Product Strategy: Roadmapping, OKRs, Product Discovery, Customer Interviews, User Journey Mapping
Analytics & Experimentation: Amplitude, Mixpanel, Google Analytics 4, A/B Testing, SQL, Snowflake
Methodologies: Agile Scrum, Kanban, Jira, Confluence, Figma, Design Thinking

EDUCATION
B.A. in Human-Computer Interaction | University of Washington`
  }
};

let currentAuditReport = null;

document.addEventListener('DOMContentLoaded', () => {
  initAuditTabs();
  initSampleButtons();
  initActions();
  initInputListeners();
});

// Audit Tabs inside the results panel
function initAuditTabs() {
  const tabs = document.querySelectorAll('.audit-tab-btn');
  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      tabs.forEach(t => t.classList.remove('active'));
      document.querySelectorAll('.audit-tab-pane').forEach(p => p.classList.remove('active'));

      tab.classList.add('active');
      const targetPane = document.getElementById(tab.getAttribute('data-audit-tab'));
      if (targetPane) targetPane.classList.add('active');
    });
  });
}

// Sample buttons
function initSampleButtons() {
  document.getElementById('btn-load-sample-tech')?.addEventListener('click', () => {
    loadSample('tech');
  });
  document.getElementById('btn-load-sample-sales')?.addEventListener('click', () => {
    loadSample('sales');
  });
  document.getElementById('btn-load-sample-pm')?.addEventListener('click', () => {
    loadSample('pm');
  });

  document.getElementById('btn-clear-all')?.addEventListener('click', () => {
    document.getElementById('inp-cv-text').value = '';
    document.getElementById('inp-jd-text').value = '';
    updateWordCount();
    resetResultsView();
  });
}

function loadSample(key) {
  const sample = SAMPLES[key];
  if (!sample) return;
  const cvInput = document.getElementById('inp-cv-text');
  const jdInput = document.getElementById('inp-jd-text');
  if (cvInput) cvInput.value = sample.cv || '';
  if (jdInput) jdInput.value = sample.jd || '';
  updateWordCount();
  runAudit();
}

function initInputListeners() {
  const cvInput = document.getElementById('inp-cv-text');
  cvInput?.addEventListener('input', updateWordCount);
}

function updateWordCount() {
  const text = document.getElementById('inp-cv-text')?.value || '';
  const words = text.trim() ? text.trim().split(/\s+/).length : 0;
  const badge = document.getElementById('cv-stats-badge');
  if (badge) {
    badge.textContent = `${words} Words`;
  }
}

function initActions() {
  document.getElementById('btn-run-audit')?.addEventListener('click', runAudit);

  document.getElementById('btn-copy-missing-kw')?.addEventListener('click', () => {
    if (!currentAuditReport || !currentAuditReport.missingKeywords.length) {
      alert('No missing keywords found.');
      return;
    }
    const kwText = currentAuditReport.missingKeywords.map(k => k.word).join(', ');
    navigator.clipboard.writeText(kwText).then(() => {
      const btn = document.getElementById('btn-copy-missing-kw');
      const orig = btn.textContent;
      btn.textContent = 'Copied!';
      setTimeout(() => { btn.textContent = orig; }, 1800);
    }).catch(err => {
      alert('Unable to copy to clipboard: ' + err);
    });
  });

  document.getElementById('btn-export-report')?.addEventListener('click', exportReport);
  document.getElementById('btn-print-report')?.addEventListener('click', () => {
    window.print();
  });
}

function resetResultsView() {
  document.getElementById('view-empty-state').style.display = 'flex';
  document.getElementById('view-results').style.display = 'none';
  document.getElementById('btn-export-report').disabled = true;
  document.getElementById('btn-print-report').disabled = true;
  currentAuditReport = null;
}

// Main Audit Engine
function runAudit() {
  const cvText = document.getElementById('inp-cv-text')?.value.trim() || '';
  const jdText = document.getElementById('inp-jd-text')?.value.trim() || '';

  if (!cvText) {
    alert('Please paste your CV text before auditing.');
    return;
  }

  // 1. Keyword extraction & Match
  const jdProvided = jdText.length > 30;
  const kwAnalysis = analyzeKeywords(cvText, jdText, jdProvided);

  // 2. Action Verbs Analysis
  const verbsAnalysis = analyzeActionVerbs(cvText);

  // 3. Quantified Metrics Analysis
  const metricsAnalysis = analyzeQuantifiedMetrics(cvText);

  // 4. Formatting, Structure & Readability
  const formatAnalysis = analyzeFormatting(cvText);

  // 5. Composite ATS Match Score Calculation
  let overallScore = 0;
  if (jdProvided) {
    // 40% Keyword Match, 20% Action Verbs, 20% Quantified Metrics, 20% Formatting
    overallScore = Math.round(
      (kwAnalysis.score * 0.40) +
      (verbsAnalysis.score * 0.20) +
      (metricsAnalysis.score * 0.20) +
      (formatAnalysis.score * 0.20)
    );
  } else {
    // 35% Action Verbs, 35% Quantified Metrics, 30% Formatting
    overallScore = Math.round(
      (verbsAnalysis.score * 0.35) +
      (metricsAnalysis.score * 0.35) +
      (formatAnalysis.score * 0.30)
    );
  }

  overallScore = Math.min(100, Math.max(10, overallScore));

  // 6. Actionable Roadmap Generation
  const roadmap = generateRoadmap(overallScore, kwAnalysis, verbsAnalysis, metricsAnalysis, formatAnalysis, jdProvided);

  currentAuditReport = {
    overallScore,
    jdProvided,
    kwAnalysis,
    verbsAnalysis,
    metricsAnalysis,
    formatAnalysis,
    roadmap,
    missingKeywords: kwAnalysis.missing,
    matchedKeywords: kwAnalysis.matched
  };

  renderAuditResults(currentAuditReport);
}

// Helper: Tokenize text into normalized significant words and bigrams
function extractKeywordsFromText(text) {
  const clean = text.toLowerCase().replace(/[^a-z0-9+#.\s]/g, ' ');
  const words = clean.split(/\s+/).filter(w => w.length > 1 && !STOP_WORDS.has(w));
  
  const freq = {};
  words.forEach(w => {
    freq[w] = (freq[w] || 0) + 1;
  });

  // Extract significant bigrams (e.g., 'machine learning', 'ci cd', 'distributed systems')
  for (let i = 0; i < words.length - 1; i++) {
    const bigram = `${words[i]} ${words[i+1]}`;
    if (!STOP_WORDS.has(words[i]) && !STOP_WORDS.has(words[i+1])) {
      freq[bigram] = (freq[bigram] || 0) + 1;
    }
  }

  return freq;
}

function analyzeKeywords(cvText, jdText, jdProvided) {
  if (!jdProvided) {
    return {
      score: 80,
      matched: [],
      missing: [],
      matchRate: 'N/A'
    };
  }

  const jdFreq = extractKeywordsFromText(jdText);
  const cvFreq = extractKeywordsFromText(cvText);

  // Sort JD keywords by highest frequency
  const sortedJdTerms = Object.entries(jdFreq)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 30); // Top 30 terms

  const matched = [];
  const missing = [];

  sortedJdTerms.forEach(([term, count]) => {
    // Check if term exists in CV
    const inCv = (cvFreq[term] || 0) > 0 || cvText.toLowerCase().includes(term);
    if (inCv) {
      matched.push({ word: term, count: cvFreq[term] || count });
    } else {
      missing.push({ word: term, count });
    }
  });

  const total = sortedJdTerms.length;
  const matchRatio = total > 0 ? (matched.length / total) : 0;
  const score = Math.round(matchRatio * 100);

  return {
    score,
    matched,
    missing,
    matchRate: `${Math.round(matchRatio * 100)}%`
  };
}

function analyzeActionVerbs(cvText) {
  const lower = cvText.toLowerCase();
  const lines = cvText.split('\n').map(l => l.trim()).filter(l => l.length > 5);

  const foundPowerVerbs = new Set();
  POWER_ACTION_VERBS.forEach(verb => {
    const regex = new RegExp(`\\b${verb}\\b`, 'i');
    if (regex.test(lower)) {
      foundPowerVerbs.add(verb);
    }
  });

  const foundWeakPhrases = [];
  WEAK_PASSIVE_PHRASES.forEach(phrase => {
    if (lower.includes(phrase)) {
      foundWeakPhrases.push(phrase);
    }
  });

  // Calculate score based on diversity of strong verbs and lack of weak phrases
  let score = Math.min(100, foundPowerVerbs.size * 12);
  score -= (foundWeakPhrases.length * 10);
  score = Math.max(20, Math.min(100, score));

  return {
    score,
    powerVerbs: Array.from(foundPowerVerbs),
    weakPhrases: foundWeakPhrases
  };
}

function analyzeQuantifiedMetrics(cvText) {
  // Regex looking for numbers, %, $, multipliers, scale words
  const metricRegex = /(?:\$\s*\d+[\d,.]*|\b\d+[\d,.]*%\b|\b\d+x\b|\b\d+[\d,.]*\s*(?:k|m|b|million|billion|thousand|users|clients|customers|revenue|dollars|sales|percent)\b|\b\d+[\d,.]*\+\b|\b\d{2,}\b)/gi;

  const lines = cvText.split('\n')
    .map(l => l.trim())
    .filter(l => l.startsWith('•') || l.startsWith('-') || l.startsWith('*') || (l.length > 25 && !l.endsWith(':')));

  let metricBulletsCount = 0;
  lines.forEach(line => {
    if (metricRegex.test(line)) {
      metricBulletsCount++;
    }
  });

  const totalBullets = Math.max(1, lines.length);
  const metricRatio = Math.min(1, metricBulletsCount / totalBullets);
  const score = Math.round(metricRatio * 100);

  return {
    score,
    metricBulletsCount,
    totalBullets,
    percentWithMetrics: `${Math.round(metricRatio * 100)}%`
  };
}

function analyzeFormatting(cvText) {
  const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/;
  const phoneRegex = /(?:\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/;
  const linkedinRegex = /(?:linkedin\.com\/[^\s]+|https?:\/\/[^\s]+|www\.[^\s]+)/i;

  const hasEmail = emailRegex.test(cvText);
  const hasPhone = phoneRegex.test(cvText);
  const hasLinkedIn = linkedinRegex.test(cvText);

  // Check section headers
  const hasExperience = /\b(?:experience|work history|employment|career history|professional experience)\b/i.test(cvText);
  const hasEducation = /\b(?:education|academic|degrees|university|college)\b/i.test(cvText);
  const hasSkills = /\b(?:skills|competencies|technologies|technical skills|proficiencies)\b/i.test(cvText);
  const hasSummary = /\b(?:summary|profile|about me|objective|executive profile)\b/i.test(cvText);

  // Word count check
  const words = cvText.trim().split(/\s+/).length;
  let wordCountHealth = 'Optimal';
  if (words < 200) wordCountHealth = 'Critically Short';
  else if (words < 350) wordCountHealth = 'Short';
  else if (words > 1200) wordCountHealth = 'Too Long (>2 Pages)';

  let score = 50;
  if (hasEmail) score += 10;
  if (hasPhone) score += 10;
  if (hasLinkedIn) score += 5;
  if (hasExperience) score += 10;
  if (hasEducation) score += 5;
  if (hasSkills) score += 5;
  if (words >= 350 && words <= 1100) score += 5;

  score = Math.min(100, score);

  return {
    score,
    hasEmail,
    hasPhone,
    hasLinkedIn,
    hasExperience,
    hasEducation,
    hasSkills,
    hasSummary,
    words,
    wordCountHealth
  };
}

function generateRoadmap(overallScore, kw, verbs, metrics, format, jdProvided) {
  const items = [];

  // Critical Priority Items
  if (!format.hasEmail || !format.hasPhone) {
    items.push({
      priority: 'critical',
      badge: 'Critical Fix',
      text: 'Missing direct contact details. Ensure your email address and accessible telephone number are clearly placed in the header for automated ATS candidate parsers.'
    });
  }

  if (jdProvided && kw.missing.length > 5) {
    const topMissing = kw.missing.slice(0, 4).map(m => `"${m.word}"`).join(', ');
    items.push({
      priority: 'critical',
      badge: 'Keyword Gap',
      text: `Your resume is missing high-weight job posting keywords: ${topMissing}. Weave these exact phrases into your summary and experience bullet points to bypass ATS filter thresholds.`
    });
  }

  if (metrics.score < 30) {
    items.push({
      priority: 'critical',
      badge: 'Low Metrics',
      text: `Only ${metrics.percentWithMetrics} of your bullet points contain quantified results. Elite recruiters and modern ATS models prioritize accomplishments with numbers (e.g. "$1.4M ARR", "reduced latency by 45%", "led 8 engineers").`
    });
  }

  // Warning Priority Items
  if (verbs.weakPhrases.length > 0) {
    const weakList = verbs.weakPhrases.map(w => `"${w}"`).join(', ');
    items.push({
      priority: 'warning',
      badge: 'Weak Verbs',
      text: `Detected passive phrasing (${weakList}). Replace phrases like "responsible for" with assertive power action verbs such as "Spearheaded", "Architected", "Accelerated", or "Orchestrated".`
    });
  }

  if (verbs.powerVerbs.length < 5) {
    items.push({
      priority: 'warning',
      badge: 'Verb Diversity',
      text: 'Low action verb variety detected. Start each bullet point under your experience section with an impactful past-tense action verb to project ownership and leadership.'
    });
  }

  if (!format.hasSkills) {
    items.push({
      priority: 'warning',
      badge: 'Missing Section',
      text: 'No standalone "Skills" or "Technologies" section identified. Standardize your headings to "TECHNICAL SKILLS" or "CORE COMPETENCIES" so ATS parsers can classify your stack.'
    });
  }

  if (format.wordCountHealth !== 'Optimal') {
    items.push({
      priority: 'warning',
      badge: 'Word Count',
      text: `Resume length is ${format.words} words (${format.wordCountHealth}). Recommended optimal length for standard 1-2 page resumes is between 450 and 850 words.`
    });
  }

  // Success / Optimization Items
  if (format.hasLinkedIn) {
    items.push({
      priority: 'success',
      badge: 'Profile Link',
      text: 'Verified presence of professional profile link (LinkedIn / portfolio) in contact information.'
    });
  }

  if (metrics.score >= 60) {
    items.push({
      priority: 'success',
      badge: 'High Impact',
      text: `Strong quantified metric density (${metrics.percentWithMetrics} of bullets quantified). This significantly boosts your hiring manager callback rate.`
    });
  }

  if (jdProvided && kw.score >= 70) {
    items.push({
      priority: 'success',
      badge: 'High ATS Match',
      text: `Excellent alignment with target job requirements (${kw.matchRate} keyword coverage). Your resume is well-primed to pass automated screening filters.`
    });
  }

  return items;
}

// Render Results to DOM
function renderAuditResults(report) {
  document.getElementById('view-empty-state').style.display = 'none';
  const viewResults = document.getElementById('view-results');
  viewResults.style.display = 'flex';

  document.getElementById('btn-export-report').disabled = false;
  document.getElementById('btn-print-report').disabled = false;

  // 1. Overall Score Dial
  const valOverall = document.getElementById('val-overall-score');
  valOverall.textContent = report.overallScore;

  const dial = document.getElementById('score-circle-elem');
  const deg = Math.round((report.overallScore / 100) * 360);
  dial.style.setProperty('--score-deg', `${deg}deg`);

  let color = '#ef4444';
  let verdict = 'Needs Significant Work';
  if (report.overallScore >= 85) {
    color = '#10b981';
    verdict = 'Top 5% Candidate (ATS Ready)';
  } else if (report.overallScore >= 70) {
    color = '#3b82f6';
    verdict = 'Competitive Profile';
  } else if (report.overallScore >= 50) {
    color = '#f59e0b';
    verdict = 'Average Candidate';
  }

  dial.style.borderColor = color;
  const verdictEl = document.getElementById('val-score-verdict');
  verdictEl.textContent = verdict;
  verdictEl.style.color = color;

  // 2. Meters
  document.getElementById('val-sub-keywords').textContent = report.jdProvided ? `${report.kwAnalysis.score}%` : 'N/A';
  document.getElementById('fill-sub-keywords').style.width = `${report.kwAnalysis.score}%`;

  document.getElementById('val-sub-verbs').textContent = `${report.verbsAnalysis.score}%`;
  document.getElementById('fill-sub-verbs').style.width = `${report.verbsAnalysis.score}%`;

  document.getElementById('val-sub-metrics').textContent = `${report.metricsAnalysis.score}%`;
  document.getElementById('fill-sub-metrics').style.width = `${report.metricsAnalysis.score}%`;

  document.getElementById('val-sub-readability').textContent = `${report.formatAnalysis.score}%`;
  document.getElementById('fill-sub-readability').style.width = `${report.formatAnalysis.score}%`;

  // 3. Tab 1: Roadmap
  const roadmapContainer = document.getElementById('roadmap-container');
  roadmapContainer.innerHTML = '';
  report.roadmap.forEach(item => {
    const el = document.createElement('div');
    el.className = `roadmap-item ${item.priority}`;
    el.innerHTML = `
      <span class="roadmap-badge">${escapeHtml(item.badge)}</span>
      <span class="roadmap-text">${escapeHtml(item.text)}</span>
    `;
    roadmapContainer.appendChild(el);
  });

  // 4. Tab 2: Keyword Gaps
  const missingContainer = document.getElementById('missing-keywords-list');
  missingContainer.innerHTML = '';
  if (!report.jdProvided) {
    missingContainer.innerHTML = '<span style="color: var(--text-secondary); font-size: 0.8rem;">Paste a Target Job Description on the left to extract missing keywords.</span>';
  } else if (report.missingKeywords.length === 0) {
    missingContainer.innerHTML = '<span style="color: #10b981; font-size: 0.8rem; font-weight: 600;">Zero missing keywords! You matched all top JD terms.</span>';
  } else {
    report.missingKeywords.forEach(k => {
      const chip = document.createElement('span');
      chip.className = 'kw-chip missing';
      chip.innerHTML = `${escapeHtml(k.word)} <span class="kw-chip-count">${k.count}x in JD</span>`;
      missingContainer.appendChild(chip);
    });
  }

  const matchedContainer = document.getElementById('matched-keywords-list');
  matchedContainer.innerHTML = '';
  if (!report.jdProvided) {
    matchedContainer.innerHTML = '<span style="color: var(--text-secondary); font-size: 0.8rem;">Paste a Target Job Description to view matched requirements.</span>';
  } else if (report.matchedKeywords.length === 0) {
    matchedContainer.innerHTML = '<span style="color: var(--text-secondary); font-size: 0.8rem;">No high-frequency JD terms matched yet.</span>';
  } else {
    report.matchedKeywords.forEach(k => {
      const chip = document.createElement('span');
      chip.className = 'kw-chip matched';
      chip.innerHTML = `${escapeHtml(k.word)} <span class="kw-chip-count">Found</span>`;
      matchedContainer.appendChild(chip);
    });
  }

  // 5. Tab 3: Action Verbs
  const powerContainer = document.getElementById('power-verbs-list');
  powerContainer.innerHTML = '';
  if (report.verbsAnalysis.powerVerbs.length === 0) {
    powerContainer.innerHTML = '<span style="color: var(--text-secondary); font-size: 0.8rem;">No recognized high-power action verbs detected.</span>';
  } else {
    report.verbsAnalysis.powerVerbs.forEach(verb => {
      const chip = document.createElement('span');
      chip.className = 'kw-chip matched';
      chip.textContent = verb;
      powerContainer.appendChild(chip);
    });
  }

  const weakContainer = document.getElementById('weak-verbs-list');
  weakContainer.innerHTML = '';
  if (report.verbsAnalysis.weakPhrases.length === 0) {
    weakContainer.innerHTML = '<span style="color: #10b981; font-size: 0.8rem; font-weight: 600;">Clean writing! Zero weak/passive phrases found.</span>';
  } else {
    report.verbsAnalysis.weakPhrases.forEach(phrase => {
      const chip = document.createElement('span');
      chip.className = 'kw-chip missing';
      chip.textContent = `"${phrase}"`;
      weakContainer.appendChild(chip);
    });
  }

  // 6. Tab 4: Formatting Checklist
  const fmtContainer = document.getElementById('format-checklist-container');
  fmtContainer.innerHTML = '';
  const fmtChecks = [
    { label: 'Email Address Identified', status: report.formatAnalysis.hasEmail },
    { label: 'Telephone Number Identified', status: report.formatAnalysis.hasPhone },
    { label: 'LinkedIn / Portfolio Web Link', status: report.formatAnalysis.hasLinkedIn },
    { label: 'Standard Experience / Work History Header', status: report.formatAnalysis.hasExperience },
    { label: 'Standard Education Section Header', status: report.formatAnalysis.hasEducation },
    { label: 'Standard Skills / Technologies Section Header', status: report.formatAnalysis.hasSkills },
    { label: `Word Count Health (${report.formatAnalysis.words} words - ${report.formatAnalysis.wordCountHealth})`, status: report.formatAnalysis.words >= 350 && report.formatAnalysis.words <= 1200 }
  ];

  fmtChecks.forEach(check => {
    const el = document.createElement('div');
    el.className = `roadmap-item ${check.status ? 'success' : 'warning'}`;
    el.innerHTML = `
      <span class="roadmap-badge">${check.status ? 'PASS' : 'WARN'}</span>
      <span class="roadmap-text">${escapeHtml(check.label)}</span>
    `;
    fmtContainer.appendChild(el);
  });
}

function exportReport() {
  if (!currentAuditReport) return;

  const lines = [
    '========================================',
    '        ATS RESUME AUDIT REPORT         ',
    '========================================',
    `Overall ATS Match Score: ${currentAuditReport.overallScore} / 100`,
    `Keyword Match: ${currentAuditReport.jdProvided ? currentAuditReport.kwAnalysis.matchRate : 'N/A (No JD provided)'}`,
    `Action Verbs Density: ${currentAuditReport.verbsAnalysis.score}%`,
    `Quantified Metrics: ${currentAuditReport.metricsAnalysis.percentWithMetrics}`,
    `Format & Readability: ${currentAuditReport.formatAnalysis.score}% (${currentAuditReport.formatAnalysis.words} words)`,
    '',
    '----------------------------------------',
    '       ACTIONABLE RECOMMENDATIONS       ',
    '----------------------------------------'
  ];

  currentAuditReport.roadmap.forEach((r, idx) => {
    lines.push(`[${r.badge.toUpperCase()}] ${r.text}`);
  });

  if (currentAuditReport.missingKeywords.length > 0) {
    lines.push('');
    lines.push('----------------------------------------');
    lines.push('     MISSING HIGH-FREQUENCY KEYWORDS    ');
    lines.push('----------------------------------------');
    lines.push(currentAuditReport.missingKeywords.map(k => `${k.word} (${k.count}x in JD)`).join(', '));
  }

  const blob = new Blob([lines.join('\n')], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `ats-audit-report-${Date.now()}.txt`;
  a.click();
  URL.revokeObjectURL(url);
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