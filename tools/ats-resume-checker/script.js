// ATS Resume Checker & NLP Auditor Logic

const SAMPLE_RESUME_TEXT = `VICTORIA STERLING
San Francisco, CA | v.sterling@apexcloud.io | +1 (555) 349-8201 | linkedin.com/in/victoriasterling

EXECUTIVE SUMMARY
Transformational technology leader with 12+ years of track record in distributed systems, hyper-scale cloud infrastructure, and engineering management. Spearheaded cloud transformations saving $2.1M annually, scaled teams from 10 to 90+ engineers, and maintained 99.99% system availability.

PROFESSIONAL EXPERIENCE

Apex Cloud Systems — Vice President of Engineering
2021 – Present | San Francisco, CA
• Direct 5 global engineering divisions totaling 92 software engineers, architects, and DevOps leads.
• Spearheaded enterprise infrastructure migration to Kubernetes and Docker, decreasing cloud compute overhead by 34% ($2.1M ARR).
• Accelerated feature release cadence from monthly to continuous delivery with 99.995% SLA reliability using modern CI/CD pipelines.
• Mentored 12 senior engineering managers and instituted transparent career growth frameworks that cut employee attrition to 4%.

OmniStream Data Corp — Director of Platform Engineering
2017 – 2021 | Seattle, WA
• Architected real-time streaming ingestion pipeline handling 14B+ daily events using Golang, Kafka, and AWS.
• Scaled platform team from 8 to 38 engineers across distributed US and European hubs.
• Achieved SOC 2 Type II and ISO 27001 regulatory security compliance across production data planes.
• Reduced database query bottlenecks by 65% through Redis caching and PostgreSQL query optimization.

Vanguard Networks — Principal Software Architect
2013 – 2017 | Austin, TX
• Designed core multi-tenant security architecture adopted by 65 enterprise Fortune 500 customers.
• Reduced p99 API latency from 240ms to 28ms through distributed database clustering and microservices refactoring.

EDUCATION
Stanford University — M.S. in Computer Science (Distributed Systems), 2013
University of Washington — B.S. in Computer Engineering, Magna Cum Laude, 2011

CORE SKILLS
Distributed Systems, Kubernetes, Docker, Golang, Python, AWS, Microservices, CI/CD, Kafka, Redis, PostgreSQL, System Design, Team Leadership, SOC 2, REST APIs, Agile`;

const SAMPLE_JOB_TEXT = `Staff / Lead Backend Infrastructure Engineer
Apex Global Platforms — San Francisco, CA (Hybrid)

About the Role:
We are seeking a Staff Backend Infrastructure Engineer to architect our next-generation cloud foundation. In this high-impact role, you will lead the evolution of our distributed systems, optimize microservices architecture, and ensure high availability across global AWS infrastructure.

Key Responsibilities:
• Lead technical design and implementation of highly scalable distributed systems and resilient microservices.
• Drive cloud infrastructure orchestration using Kubernetes, Docker, Terraform, and AWS.
• Architect low-latency event streaming platforms utilizing Kafka, Golang, and Python.
• Establish automated CI/CD pipelines and DevOps best practices for multi-region deployments.
• Champion observability, monitoring (Prometheus, Datadog), and site reliability engineering (SRE) to maintain 99.99% uptime.
• Partner with product management and security teams to enforce SOC 2, HIPAA, and compliance standards.
• Mentor senior engineers, lead architectural design reviews, and establish engineering guidelines.

Required Qualifications & Skills:
• 8+ years of professional backend software engineering experience in distributed systems.
• Deep proficiency in Golang, Python, or Java.
• Strong hands-on expertise with AWS, Kubernetes, Docker, and Infrastructure as Code (Terraform).
• Extensive experience with Kafka, Redis, and relational databases (PostgreSQL, MySQL).
• Proven background with CI/CD automation, microservices design patterns, and RESTful APIs.
• Strong track record in observability tools (Prometheus, Grafana, Datadog).
• Excellent communication skills, cross-functional collaboration, and technical mentorship capability.
• Bachelor’s or Master’s degree in Computer Science or equivalent experience.`;

// Common Stop Words to filter out
const STOP_WORDS = new Set([
  'a', 'about', 'above', 'after', 'again', 'against', 'all', 'am', 'an', 'and', 'any', 'are', 'aren\'t',
  'as', 'at', 'be', 'because', 'been', 'before', 'being', 'below', 'between', 'both', 'but', 'by',
  'can', 'cannot', 'could', 'did', 'do', 'does', 'doing', 'don\'t', 'down', 'during', 'each', 'few',
  'for', 'from', 'further', 'had', 'has', 'have', 'having', 'he', 'her', 'here', 'hers', 'herself',
  'him', 'himself', 'his', 'how', 'i', 'if', 'in', 'into', 'is', 'isn\'t', 'it', 'its', 'itself',
  'let\'s', 'me', 'more', 'most', 'my', 'myself', 'no', 'nor', 'not', 'of', 'off', 'on', 'once',
  'only', 'or', 'other', 'ought', 'our', 'ours', 'ourselves', 'out', 'over', 'own', 'same', 'she',
  'should', 'so', 'some', 'such', 'than', 'that', 'the', 'their', 'theirs', 'them', 'themselves',
  'then', 'there', 'these', 'they', 'this', 'those', 'through', 'to', 'too', 'under', 'until', 'up',
  'very', 'was', 'wasn\'t', 'we', 'were', 'weren\'t', 'what', 'when', 'where', 'which', 'while',
  'who', 'whom', 'why', 'with', 'won\'t', 'would', 'you', 'your', 'yours', 'yourself', 'yourselves',
  'role', 'team', 'work', 'working', 'responsibilities', 'qualifications', 'requirements', 'years',
  'experience', 'strong', 'ability', 'degree', 'candidate', 'seeking', 'including', 'opportunity'
]);

// Strong Action Verbs for ATS evaluation
const ACTION_VERBS = [
  'accelerated', 'achieved', 'administered', 'advised', 'analyzed', 'architected', 'assembled',
  'audited', 'automated', 'budgeted', 'built', 'championed', 'coached', 'collaborated', 'composed',
  'conceived', 'conducted', 'constructed', 'coordinated', 'crafted', 'created', 'customized',
  'decreased', 'delivered', 'designed', 'developed', 'devised', 'directed', 'distributed',
  'doubled', 'drafted', 'drove', 'engineered', 'enhanced', 'established', 'evaluated', 'exceeded',
  'executed', 'expanded', 'expedited', 'facilitated', 'focused', 'formulated', 'fostered',
  'founded', 'generated', 'guided', 'headed', 'identified', 'implemented', 'improved', 'increased',
  'influenced', 'initiated', 'innovated', 'inspected', 'instituted', 'instructed', 'integrated',
  'introduced', 'invented', 'investigated', 'launched', 'lead', 'led', 'leveraged', 'maintained',
  'managed', 'maximized', 'mentored', 'minimized', 'mobilized', 'modernized', 'negotiated',
  'operated', 'optimized', 'orchestrated', 'organized', 'originated', 'outperformed', 'overhauled',
  'oversaw', 'partnered', 'performed', 'pioneered', 'planned', 'produced', 'promoted', 'proposed',
  'published', 're-architected', 'realigned', 'rebuilt', 'recruited', 'redesigned', 'reduced',
  'refactored', 'reformed', 'remodeled', 'reorganized', 'restructured', 'revamped', 'revitalized',
  'saved', 'scaled', 'scheduled', 'secured', 'simplified', 'solved', 'spearheaded', 'standardized',
  'stimulated', 'streamlined', 'strengthened', 'structured', 'surpassed', 'systematized',
  'trained', 'transformed', 'upgraded', 'validated', 'yielded'
];

// Curated Key Technology & Industry Terms Catalog
const DOMAIN_TERMS = [
  'distributed systems', 'microservices', 'kubernetes', 'docker', 'golang', 'python', 'java',
  'javascript', 'typescript', 'aws', 'azure', 'gcp', 'cloud infrastructure', 'ci/cd', 'terraform',
  'kafka', 'redis', 'postgresql', 'mysql', 'mongodb', 'graphql', 'rest apis', 'system design',
  'observability', 'prometheus', 'datadog', 'grafana', 'devops', 'soc 2', 'hipaa', 'agile',
  'scrum', 'machine learning', 'deep learning', 'sql', 'nosql', 'linux', 'git', 'security',
  'architecture', 'low latency', 'high availability', 'scalability', 'mentorship', 'leadership'
];

document.addEventListener('DOMContentLoaded', () => {
  const inpResume = document.getElementById('inp-resume');
  const inpJob = document.getElementById('inp-job');
  const resumeCounter = document.getElementById('resume-counter');
  const jobCounter = document.getElementById('job-counter');

  const btnLoadSample = document.getElementById('btn-load-sample');
  const btnClear = document.getElementById('btn-clear');
  const btnRunAudit = document.getElementById('btn-run-audit');
  const btnExportReport = document.getElementById('btn-export-report');

  const resultsArea = document.getElementById('results-area');
  const scoreAtsNum = document.getElementById('score-ats-num');
  const scoreAtsPill = document.getElementById('score-ats-pill');
  const scoreKeywordsNum = document.getElementById('score-keywords-num');
  const keywordsRatioText = document.getElementById('keywords-ratio-text');
  const scoreSectionsNum = document.getElementById('score-sections-num');
  const sectionsDetailText = document.getElementById('sections-detail-text');
  const scoreReadabilityNum = document.getElementById('score-readability-num');
  const readabilityDetailText = document.getElementById('readability-detail-text');

  const chipsContainer = document.getElementById('keywords-chips-container');
  const cntAll = document.getElementById('cnt-all');
  const cntMatched = document.getElementById('cnt-matched');
  const cntMissing = document.getElementById('cnt-missing');
  const filterTabs = document.querySelectorAll('.filter-tab');

  const auditSectionsList = document.getElementById('audit-sections-list');
  const auditFormattingList = document.getElementById('audit-formatting-list');
  const optimizationTips = document.getElementById('optimization-tips');

  let currentAnalysis = null;
  let activeFilter = 'all';

  // Update live word & character counters
  function updateCounters() {
    const resText = inpResume.value.trim();
    const jobText = inpJob.value.trim();

    const resWords = resText ? resText.split(/\s+/).length : 0;
    const jobWords = jobText ? jobText.split(/\s+/).length : 0;

    resumeCounter.textContent = `${resWords} words | ${resText.length} chars`;
    jobCounter.textContent = `${jobWords} words | ${jobText.length} chars`;
  }

  inpResume.addEventListener('input', updateCounters);
  inpJob.addEventListener('input', updateCounters);

  // Load sample dataset
  btnLoadSample.addEventListener('click', () => {
    inpResume.value = SAMPLE_RESUME_TEXT;
    inpJob.value = SAMPLE_JOB_TEXT;
    updateCounters();
    runAudit();
  });

  // Clear inputs
  btnClear.addEventListener('click', () => {
    if (confirm('Clear both resume and job description fields?')) {
      inpResume.value = '';
      inpJob.value = '';
      updateCounters();
      resultsArea.style.display = 'none';
      currentAnalysis = null;
    }
  });

  // Filter tabs for keywords
  filterTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      filterTabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      activeFilter = tab.dataset.filter;
      renderKeywordChips();
    });
  });

  // Primary Run Audit Trigger
  btnRunAudit.addEventListener('click', () => {
    runAudit();
  });

  // Main NLP Audit Function
  function runAudit() {
    const resumeRaw = inpResume.value.trim();
    const jobRaw = inpJob.value.trim();

    if (!resumeRaw || !jobRaw) {
      alert('Please provide both your Resume text and the Target Job Description to run the audit.');
      return;
    }

    const resumeLower = resumeRaw.toLowerCase();
    const jobLower = jobRaw.toLowerCase();

    // 1. Keyword extraction & analysis
    const keywordsAnalysis = extractAndCompareKeywords(resumeLower, jobLower);

    // 2. Section headings audit
    const sectionsAudit = auditSectionHeadings(resumeRaw);

    // 3. Formatting, Word count & Action verbs audit
    const formattingAudit = auditFormatting(resumeRaw, resumeLower);

    // 4. Calculate Aggregate ATS Compatibility Score
    // Formula: 45% Keyword Match + 25% Section Headings + 20% Formatting & Length + 10% Action Verbs
    const keywordWeight = (keywordsAnalysis.matchRate / 100) * 45;
    const sectionWeight = (sectionsAudit.foundCount / sectionsAudit.totalCount) * 25;
    const formattingWeight = (formattingAudit.formattingScore / 100) * 20;
    const actionVerbWeight = (formattingAudit.actionVerbScore / 100) * 10;

    const overallScore = Math.min(100, Math.max(0, Math.round(keywordWeight + sectionWeight + formattingWeight + actionVerbWeight)));

    // 5. Generate Actionable Optimization Tips
    const tips = generateTips(overallScore, keywordsAnalysis, sectionsAudit, formattingAudit);

    currentAnalysis = {
      overallScore,
      keywordsAnalysis,
      sectionsAudit,
      formattingAudit,
      tips,
      timestamp: new Date().toISOString()
    };

    // Render results to DOM
    displayResults();
    resultsArea.style.display = 'flex';
    resultsArea.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  // NLP Keyword Matcher
  function extractAndCompareKeywords(resumeText, jobText) {
    const candidateTerms = new Map();

    // Scan for domain specific terms
    DOMAIN_TERMS.forEach(term => {
      const regex = new RegExp(`\\b${escapeRegExp(term)}\\b`, 'gi');
      const matches = jobText.match(regex);
      if (matches) {
        candidateTerms.set(term, matches.length);
      }
    });

    // Extract word frequencies from job text (unigrams)
    const tokens = jobText
      .replace(/[^\w\s-]/g, ' ')
      .split(/\s+/)
      .map(w => w.trim().toLowerCase())
      .filter(w => w.length > 2 && !STOP_WORDS.has(w) && !/^\d+$/.test(w));

    tokens.forEach(tok => {
      const curr = candidateTerms.get(tok) || 0;
      candidateTerms.set(tok, curr + 1);
    });

    // Sort by frequency and pick top 25 high-priority terms
    const sortedTerms = Array.from(candidateTerms.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 28);

    const matched = [];
    const missing = [];

    sortedTerms.forEach(([term, jobFreq]) => {
      // Check count in resume
      const resRegex = new RegExp(`\\b${escapeRegExp(term)}\\b`, 'gi');
      const resMatches = resumeText.match(resRegex);
      const resFreq = resMatches ? resMatches.length : 0;

      if (resFreq > 0) {
        matched.push({ term, jobFreq, resFreq });
      } else {
        missing.push({ term, jobFreq, resFreq: 0 });
      }
    });

    const totalKeyTerms = sortedTerms.length;
    const matchRate = totalKeyTerms > 0 ? Math.round((matched.length / totalKeyTerms) * 100) : 0;

    return {
      totalKeyTerms,
      matched,
      missing,
      matchRate
    };
  }

  // Section Headings Audit
  function auditSectionHeadings(resumeRaw) {
    const lines = resumeRaw.split('\n').map(l => l.trim().toLowerCase());
    
    const standardSections = [
      {
        id: 'contact',
        name: 'Contact Information',
        patterns: [/@/, /\+?\d{1,3}[\s-]?\(?\d{3}\)?[\s-]?\d{3}[\s-]?\d{4}/, /linkedin/],
        required: true,
        desc: 'Essential for recruiter correspondence and phone screening.'
      },
      {
        id: 'summary',
        name: 'Professional Summary / Profile',
        patterns: [/summary/, /profile/, /about/, /objective/, /overview/],
        required: true,
        desc: 'High-level executive positioning snippet at top.'
      },
      {
        id: 'experience',
        name: 'Work Experience / History',
        patterns: [/experience/, /employment/, /work history/, /career/],
        required: true,
        desc: 'Core timeline evaluated by ATS rankers for seniority.'
      },
      {
        id: 'education',
        name: 'Education & Credentials',
        patterns: [/education/, /degree/, /university/, /academic/, /bachelor/, /master/, /b\.s\./, /m\.s\./],
        required: true,
        desc: 'Degree verification and accredited qualifications.'
      },
      {
        id: 'skills',
        name: 'Skills & Competencies',
        patterns: [/skills/, /technologies/, /competencies/, /expertise/, /stack/],
        required: true,
        desc: 'Dedicated keyword indexing section for search queries.'
      }
    ];

    const results = standardSections.map(sec => {
      let found = false;
      for (const pat of sec.patterns) {
        if (pat instanceof RegExp) {
          if (pat.test(resumeRaw.toLowerCase())) {
            found = true;
            break;
          }
        }
      }
      return {
        ...sec,
        found
      };
    });

    const foundCount = results.filter(r => r.found).length;

    return {
      results,
      foundCount,
      totalCount: standardSections.length
    };
  }

  // Formatting & Readability Audit
  function auditFormatting(resumeRaw, resumeLower) {
    const words = resumeRaw.trim().split(/\s+/).filter(Boolean).length;
    
    // Ideal resume length: 450 - 1000 words
    let lengthScore = 100;
    let lengthMsg = 'Optimal length (1-2 pages standard).';
    if (words < 250) {
      lengthScore = 40;
      lengthMsg = 'Resume is too brief (< 250 words); ATS may deem it incomplete.';
    } else if (words < 450) {
      lengthScore = 75;
      lengthMsg = 'Slightly brief (< 450 words); recommend elaborating on achievements.';
    } else if (words > 1400) {
      lengthScore = 65;
      lengthMsg = 'Exceeds standard 2-page length (> 1,400 words); recommend condensing.';
    }

    // Bullet points check
    const bullets = (resumeRaw.match(/[•\-\*]\s+/g) || []).length;
    let bulletScore = 100;
    let bulletMsg = `Detected ${bullets} bullet points with clear achievement bullets.`;
    if (bullets < 5) {
      bulletScore = 50;
      bulletMsg = 'Very few bullet points detected. ATS prefers structured bulleted achievements.';
    }

    // Quantifiable metrics audit (% or $)
    const metricsMatches = (resumeRaw.match(/(\$\d+[\d,\.]*[kKmMbB]?|\d+[\d,\.]*\%|\b\d+x\b|\b\d+\+\b)/g) || []).length;
    let metricScore = Math.min(100, metricsMatches * 20);

    // Action verbs audit
    const detectedVerbs = new Set();
    ACTION_VERBS.forEach(verb => {
      const re = new RegExp(`\\b${escapeRegExp(verb)}\\b`, 'gi');
      if (re.test(resumeLower)) {
        detectedVerbs.add(verb);
      }
    });

    const actionVerbScore = Math.min(100, Math.round((detectedVerbs.size / 10) * 100));

    // Composite formatting score
    const formattingScore = Math.round((lengthScore * 0.4) + (bulletScore * 0.3) + (metricScore * 0.3));

    return {
      words,
      lengthScore,
      lengthMsg,
      bullets,
      bulletScore,
      bulletMsg,
      metricsCount: metricsMatches,
      detectedVerbs: Array.from(detectedVerbs),
      actionVerbScore,
      formattingScore
    };
  }

  // Generate Prioritized Tips
  function generateTips(score, keywords, sections, formatting) {
    const tips = [];

    if (keywords.missing.length > 0) {
      const topMissing = keywords.missing.slice(0, 5).map(m => `"${m.term}"`).join(', ');
      tips.push({
        type: 'critical',
        title: 'Include Critical Missing Job Keywords',
        desc: `Your target job description frequently emphasizes: ${topMissing}. Naturally incorporate these keywords into your summary, employment bullet points, or skills list to bypass automated threshold filters.`
      });
    }

    const missingSections = sections.results.filter(r => !r.found);
    if (missingSections.length > 0) {
      tips.push({
        type: 'critical',
        title: 'Add Missing Standard Section Headers',
        desc: `Your resume appears to be missing clear headings for: ${missingSections.map(s => s.name).join(', ')}. ATS parsers rely on conventional headers to categorize your experience accurately.`
      });
    }

    if (formatting.metricsCount < 3) {
      tips.push({
        type: 'improvement',
        title: 'Quantify Your Business Impact',
        desc: `We detected only ${formatting.metricsCount} numeric metrics. High-scoring ATS resumes quantify outcomes with dollar amounts ($), percentage growth (%), or scale metrics (e.g., "Increased throughput by 45%", "Managed $2M budget").`
      });
    }

    if (formatting.detectedVerbs.length < 6) {
      tips.push({
        type: 'improvement',
        title: 'Lead Bullets with High-Impact Power Verbs',
        desc: `Replace passive phrasing with active leadership verbs such as "Spearheaded", "Architected", "Engineered", "Orchestrated", and "Delivered".`
      });
    }

    if (formatting.words < 400 || formatting.words > 1200) {
      tips.push({
        type: 'formatting',
        title: 'Calibrate Total Resume Length',
        desc: formatting.lengthMsg
      });
    }

    if (tips.length === 0 || score >= 90) {
      tips.push({
        type: 'success',
        title: 'Outstanding ATS Readiness',
        desc: 'Your resume demonstrates high keyword alignment, clean section segmentation, strong action verbs, and quantifiable achievements. It is well-positioned for automated applicant tracking systems!'
      });
    }

    return tips;
  }

  // Render Analysis Results
  function displayResults() {
    const { overallScore, keywordsAnalysis, sectionsAudit, formattingAudit, tips } = currentAnalysis;

    // 1. Overall Score
    scoreAtsNum.textContent = overallScore;
    if (overallScore >= 80) {
      scoreAtsPill.className = 'score-status-pill status-pass';
      scoreAtsPill.textContent = '✓ ATS Ready - High Match';
    } else if (overallScore >= 60) {
      scoreAtsPill.className = 'score-status-pill status-warn';
      scoreAtsPill.textContent = '⚠ Moderate - Tuning Recommended';
    } else {
      scoreAtsPill.className = 'score-status-pill status-fail';
      scoreAtsPill.textContent = '✕ High Risk - Low Keyword Match';
    }

    // 2. Keyword Match
    scoreKeywordsNum.textContent = `${keywordsAnalysis.matchRate}%`;
    keywordsRatioText.textContent = `${keywordsAnalysis.matched.length} of ${keywordsAnalysis.totalKeyTerms} target terms matched`;

    // 3. Sections
    scoreSectionsNum.textContent = `${sectionsAudit.foundCount}/${sectionsAudit.totalCount}`;
    sectionsDetailText.textContent = `${sectionsAudit.foundCount === 5 ? 'All 5 standard sections detected' : 'Missing essential section headings'}`;

    // 4. Formatting
    scoreReadabilityNum.textContent = formattingAudit.formattingScore;
    readabilityDetailText.textContent = `${formattingAudit.words} words | ${formattingAudit.detectedVerbs.length} action verbs`;

    // Update Counts
    cntAll.textContent = keywordsAnalysis.totalKeyTerms;
    cntMatched.textContent = keywordsAnalysis.matched.length;
    cntMissing.textContent = keywordsAnalysis.missing.length;

    renderKeywordChips();
    renderSectionAudit();
    renderFormattingAudit();
    renderTips();
  }

  // Render Keywords Chips
  function renderKeywordChips() {
    if (!currentAnalysis) return;
    const { keywordsAnalysis } = currentAnalysis;
    chipsContainer.innerHTML = '';

    let itemsToShow = [];
    if (activeFilter === 'all') {
      itemsToShow = [
        ...keywordsAnalysis.matched.map(m => ({ ...m, type: 'match' })),
        ...keywordsAnalysis.missing.map(m => ({ ...m, type: 'missing' }))
      ];
    } else if (activeFilter === 'matched') {
      itemsToShow = keywordsAnalysis.matched.map(m => ({ ...m, type: 'match' }));
    } else {
      itemsToShow = keywordsAnalysis.missing.map(m => ({ ...m, type: 'missing' }));
    }

    if (itemsToShow.length === 0) {
      chipsContainer.innerHTML = '<span style="color: var(--text-tertiary); font-size: 0.85rem;">No keywords found for this filter.</span>';
      return;
    }

    itemsToShow.forEach(item => {
      const chip = document.createElement('span');
      if (item.type === 'match') {
        chip.className = 'chip-match';
        chip.innerHTML = `
          <span>✓</span>
          <strong>${escapeHtml(item.term)}</strong>
          <span style="opacity: 0.75; font-size: 0.75rem;">(${item.resFreq}x in resume)</span>
        `;
      } else {
        chip.className = 'chip-missing';
        chip.innerHTML = `
          <span>✕</span>
          <strong>${escapeHtml(item.term)}</strong>
          <span style="opacity: 0.75; font-size: 0.75rem;">(${item.jobFreq}x in JD)</span>
        `;
      }
      chipsContainer.appendChild(chip);
    });
  }

  // Render Section Headings Audit
  function renderSectionAudit() {
    const { sectionsAudit } = currentAnalysis;
    auditSectionsList.innerHTML = '';

    sectionsAudit.results.forEach(sec => {
      const li = document.createElement('li');
      li.className = 'audit-list-item';
      li.innerHTML = `
        <div class="audit-icon" style="color: ${sec.found ? 'var(--success)' : 'var(--error)'};">
          ${sec.found ? '✓' : '✕'}
        </div>
        <div style="flex: 1;">
          <div style="display: flex; justify-content: space-between; align-items: baseline;">
            <strong style="font-size: 0.9rem; color: var(--text-primary);">${escapeHtml(sec.name)}</strong>
            <span style="font-size: 0.75rem; font-weight: 600; color: ${sec.found ? 'var(--success)' : 'var(--error)'};">
              ${sec.found ? 'Detected' : 'Missing'}
            </span>
          </div>
          <p style="font-size: 0.8rem; color: var(--text-secondary); margin-top: 0.2rem;">${escapeHtml(sec.desc)}</p>
        </div>
      `;
      auditSectionsList.appendChild(li);
    });
  }

  // Render Formatting Audit
  function renderFormattingAudit() {
    const { formattingAudit } = currentAnalysis;
    auditFormattingList.innerHTML = '';

    const checks = [
      {
        title: 'Word Count & Resume Length',
        status: formattingAudit.lengthScore >= 75 ? 'Pass' : 'Warning',
        desc: `${formattingAudit.words} total words. ${formattingAudit.lengthMsg}`,
        pass: formattingAudit.lengthScore >= 75
      },
      {
        title: 'Bullet Points Structure',
        status: formattingAudit.bullets >= 5 ? 'Pass' : 'Warning',
        desc: formattingAudit.bulletMsg,
        pass: formattingAudit.bullets >= 5
      },
      {
        title: 'Quantified Impact & Metrics',
        status: formattingAudit.metricsCount >= 3 ? 'Pass' : 'Needs More Metrics',
        desc: `Identified ${formattingAudit.metricsCount} quantifiable metrics (%, $, scale stats).`,
        pass: formattingAudit.metricsCount >= 3
      },
      {
        title: 'Action Verbs Power Score',
        status: `${formattingAudit.detectedVerbs.length} Power Verbs Detected`,
        desc: `Action verbs found: ${formattingAudit.detectedVerbs.slice(0, 8).join(', ') || 'None'}.`,
        pass: formattingAudit.detectedVerbs.length >= 6
      }
    ];

    checks.forEach(c => {
      const li = document.createElement('li');
      li.className = 'audit-list-item';
      li.innerHTML = `
        <div class="audit-icon" style="color: ${c.pass ? 'var(--success)' : 'var(--warning)'};">
          ${c.pass ? '✓' : '⚠'}
        </div>
        <div style="flex: 1;">
          <div style="display: flex; justify-content: space-between; align-items: baseline;">
            <strong style="font-size: 0.9rem; color: var(--text-primary);">${escapeHtml(c.title)}</strong>
            <span style="font-size: 0.75rem; font-weight: 600; color: ${c.pass ? 'var(--success)' : 'var(--warning)'};">${escapeHtml(c.status)}</span>
          </div>
          <p style="font-size: 0.8rem; color: var(--text-secondary); margin-top: 0.2rem;">${escapeHtml(c.desc)}</p>
        </div>
      `;
      auditFormattingList.appendChild(li);
    });
  }

  // Render Tips
  function renderTips() {
    const { tips } = currentAnalysis;
    optimizationTips.innerHTML = '';

    tips.forEach(tip => {
      const box = document.createElement('div');
      box.className = 'tips-box';
      box.innerHTML = `
        <strong style="font-size: 0.9rem; color: var(--text-primary);">${escapeHtml(tip.title)}</strong>
        <p style="font-size: 0.85rem; color: var(--text-secondary); line-height: 1.5; margin: 0;">${escapeHtml(tip.desc)}</p>
      `;
      optimizationTips.appendChild(box);
    });
  }

  // Export Audit Report
  btnExportReport.addEventListener('click', () => {
    if (!currentAnalysis) {
      alert('Please run an ATS audit first before exporting.');
      return;
    }

    const { overallScore, keywordsAnalysis, sectionsAudit, formattingAudit, tips } = currentAnalysis;
    let md = `# ATS RESUME AUDIT REPORT\nDate: ${new Date().toLocaleDateString()}\n\n`;
    md += `## OVERALL ATS SCORE: ${overallScore} / 100\n`;
    md += `- Keyword Match Rate: ${keywordsAnalysis.matchRate}%\n`;
    md += `- Standard Sections Found: ${sectionsAudit.foundCount} of ${sectionsAudit.totalCount}\n`;
    md += `- Word Count: ${formattingAudit.words} words\n\n`;

    md += `## MATCHED KEYWORDS (${keywordsAnalysis.matched.length})\n`;
    md += keywordsAnalysis.matched.map(m => `- ${m.term} (Found: ${m.resFreq}x)`).join('\n') + '\n\n';

    md += `## MISSING CRITICAL KEYWORDS (${keywordsAnalysis.missing.length})\n`;
    md += keywordsAnalysis.missing.map(m => `- ${m.term} (In JD: ${m.jobFreq}x)`).join('\n') + '\n\n';

    md += `## ACTIONABLE OPTIMIZATION RECOMMENDATIONS\n`;
    tips.forEach((t, i) => {
      md += `${i + 1}. ${t.title}: ${t.desc}\n\n`;
    });

    const blob = new Blob([md], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ats_resume_audit_${Date.now()}.md`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  });

  function escapeRegExp(string) {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
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
});