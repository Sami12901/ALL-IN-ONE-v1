// AI Job Matching & ATS Resume Optimizer - Complete Client-Side Implementation

document.addEventListener('DOMContentLoaded', () => {
  // Toast notifications
  const appToast = document.getElementById('app-toast');
  const toastMessage = document.getElementById('toast-message');
  let toastTimer = null;

  function showToast(msg) {
    if (toastTimer) clearTimeout(toastTimer);
    toastMessage.textContent = msg;
    appToast.classList.add('show');
    toastTimer = setTimeout(() => {
      appToast.classList.remove('show');
    }, 2500);
  }

  // DOM Elements
  const inpResumeText = document.getElementById('inp-resume-text');
  const inpJdText = document.getElementById('inp-jd-text');
  const resumeWordCount = document.getElementById('resume-word-count');
  const jdWordCount = document.getElementById('jd-word-count');
  const btnRunMatch = document.getElementById('btn-run-match');
  const btnClearInputs = document.getElementById('btn-clear-inputs');
  const presetChips = document.querySelectorAll('.preset-chip[data-preset]');

  // ATS Output Elements
  const atsGaugeCircle = document.getElementById('ats-gauge-circle');
  const atsScoreNum = document.getElementById('ats-score-num');
  const atsVerdictTitle = document.getElementById('ats-verdict-title');
  const atsVerdictSubtitle = document.getElementById('ats-verdict-subtitle');

  const barFillTech = document.getElementById('bar-fill-tech');
  const barValTech = document.getElementById('bar-val-tech');
  const barFillScope = document.getElementById('bar-fill-scope');
  const barValScope = document.getElementById('bar-val-scope');
  const barFillVerbs = document.getElementById('bar-fill-verbs');
  const barValVerbs = document.getElementById('bar-val-verbs');
  const barFillSoft = document.getElementById('bar-fill-soft');
  const barValSoft = document.getElementById('bar-val-soft');

  const keywordCloud = document.getElementById('keyword-cloud-container');
  const missingCountEl = document.getElementById('missing-count');
  const matchedCountEl = document.getElementById('matched-count');
  const filterBtns = document.querySelectorAll('.skills-filter-btn');

  // Pitches Elements
  const pitchElevator = document.getElementById('pitch-elevator');
  const pitchLinkedin = document.getElementById('pitch-linkedin');
  const pitchCover = document.getElementById('pitch-cover');
  const pitchBullets = document.getElementById('pitch-bullets');

  // Preloaded Presets Database
  const PRESETS = {
    swe: {
      jd: `Title: Senior Full-Stack Software Engineer
Company: CloudNexus Technologies
Location: San Francisco, CA / Remote

About the Role:
We are seeking an experienced Senior Full-Stack Engineer to architect, build, and scale our core SaaS platform. You will collaborate closely with product management and designers to deliver high-performance user interfaces and distributed backend microservices.

Key Requirements:
- 5+ years of experience in modern software engineering with TypeScript and Node.js.
- Deep expertise in React.js, Next.js, and client-side state management.
- Proven experience designing and operating distributed microservices with Docker and Kubernetes.
- Solid experience with relational databases (PostgreSQL) and caching layers (Redis).
- Familiarity with cloud platforms (AWS: ECS, S3, RDS, Lambda) and Infrastructure as Code.
- Strong grounding in CI/CD automation pipelines, automated unit/integration testing (Jest, Cypress).
- Experience with GraphQL APIs, RESTful design patterns, and asynchronous messaging (Kafka or RabbitMQ).
- Strong track record of system architecture, cross-functional collaboration, and technical mentoring.`,
      resume: `Alex Morgan
alex.morgan@example.com • linkedin.com/in/alexmorgan-tech • github.com/alexmorgan

PROFESSIONAL SUMMARY:
Lead Full-Stack Software Engineer with 6+ years of experience architecting resilient web applications and microservices. Expert in TypeScript, React.js, Node.js, and PostgreSQL. Passionate about scalable system architecture and CI/CD automation.

EXPERIENCE:
Staff Software Engineer — Apex Digital Solutions (2022 – Present)
- Architected high-throughput microservices using TypeScript, Node.js, and Docker, reducing API response times by 42%.
- Designed and built responsive frontend dashboards in React.js and Next.js, serving 450,000+ monthly active users.
- Migrated legacy data store to PostgreSQL with Redis caching layer, scaling read operations to 8,500 queries/sec.
- Automated CI/CD deployment pipelines using GitHub Actions, decreasing release cycle duration from 4 days to 45 minutes.
- Mentored 4 junior engineers on clean code practices, testing standards, and design patterns.

Full-Stack Engineer — CloudSphere Labs (2019 – 2022)
- Engineered scalable RESTful web APIs and GraphQL endpoints for customer-facing analytics dashboards.
- Deployed containerized applications to AWS utilizing S3, RDS, and CloudFront.
- Implemented comprehensive unit and end-to-end test suites using Jest and Cypress, achieving 88% code coverage.
- Collaborated across agile sprints with product managers and UI/UX designers.`
    },
    ai: {
      jd: `Title: Senior AI / Machine Learning Engineer
Company: NeuralWave Systems
Location: New York, NY / Hybrid

About the Role:
NeuralWave is looking for an AI/ML Engineer to develop generative AI workflows, large language model (LLM) agents, and production retrieval-augmented generation (RAG) pipelines.

Responsibilities & Qualifications:
- 4+ years building production ML and AI solutions with Python, PyTorch, and HuggingFace.
- Hands-on experience developing RAG architectures using Vector Databases (Pinecone, Weaviate, Qdrant).
- Experience with LangChain, LlamaIndex, OpenAI APIs, and Claude tool-use agents.
- Strong knowledge of transformer architectures, fine-tuning techniques (LoRA, QLoRA), and model evaluation metrics.
- Familiarity deploying containerized ML models with FastAPI, Docker, and Kubernetes.
- Experience with MLOps pipelines (MLflow, Weights & Biases) and automated evaluation benchmarks.
- Bachelor's or Master's degree in Computer Science, Data Science, or related quantitative field.`,
      resume: `Jordan Hayes
jordan.hayes@example.com • github.com/jordan-ai

SUMMARY:
Machine Learning Engineer with 4 years of expertise in Python, PyTorch, generative AI, and NLP. Proven track record deploying production LLM pipelines and vector search systems.

EXPERIENCE:
Machine Learning Engineer — Synapse AI (2022 – Present)
- Engineered enterprise RAG pipelines using Python, LangChain, and Pinecone vector database, improving document retrieval precision by 35%.
- Fine-tuned open-source LLMs using PyTorch and HuggingFace with LoRA adapters for domain-specific contract parsing.
- Built containerized model microservices with FastAPI and Docker deployed to cloud Kubernetes clusters.
- Established MLOps evaluation suites using MLflow, reducing hallucination rates across production queries by 28%.

Data Science Associate — Quantify Analytics (2020 – 2022)
- Built statistical NLP pipelines and predictive classifiers using scikit-learn and pandas.
- Collaborated with engineering to integrate models into RESTful APIs.`
    },
    pm: {
      jd: `Title: Lead Product Manager — Core Platform
Company: Horizon FinTech
Location: San Francisco, CA / Remote

Requirements:
- 5+ years of product management experience leading B2B SaaS or fintech platforms.
- Proven mastery in product strategy, quarterly roadmapping, customer discovery, and OKR definition.
- Deep experience leading cross-functional teams in agile scrum environments with engineering and design.
- Data-driven mindset: comfortable executing A/B testing, cohort analysis, and product analytics (Mixpanel, Amplitude).
- Exceptional executive stakeholder communication, backlog prioritization, and go-to-market execution.`,
      resume: `Taylor Brooks
taylor.brooks@example.com • linkedin.com/in/taylorbrookspm

SUMMARY:
Product Management leader with 6 years experience driving product strategy and roadmap execution for high-growth SaaS applications.

EXPERIENCE:
Senior Product Manager — FinEdge (2021 – Present)
- Spearheaded core checkout platform product roadmap, driving a 24% increase in conversion through systematic A/B testing.
- Defined quarterly OKRs and aligned engineering, design, and marketing teams in 2-week agile scrum sprints.
- Conducted 60+ customer discovery interviews, translating feedback into prioritized backlog epics.
- Partnered with analytics teams using Amplitude to identify onboarding friction and boost 30-day retention by 18%.`
    },
    devops: {
      jd: `Title: Senior Cloud DevOps & SRE Engineer
Company: Apex Cloud Infrastructure

Requirements:
- 5+ years experience in cloud infrastructure engineering and Site Reliability Engineering.
- Deep expertise with Infrastructure as Code (Terraform) and AWS services (EKS, VPC, IAM, RDS).
- Mastery of Kubernetes cluster administration, Helm charts, and container orchestration.
- Proven experience building CI/CD automation pipelines (GitLab CI, GitHub Actions, ArgoCD).
- Production observability with Prometheus, Grafana, Datadog, and distributed tracing.
- Strong scripting skills in Python, Bash, or Go; 24/7 on-call incident response leadership.`,
      resume: `Devin Vance
devin.vance@example.org • github.com/devinvance

SUMMARY:
DevOps & SRE Engineer with 5+ years optimizing cloud reliability and automation on AWS.

EXPERIENCE:
Senior Cloud Engineer — StackFlow (2021 – Present)
- Architected multi-region AWS cloud infrastructure using Terraform and Terragrunt with zero manual drift.
- Managed 12 production Kubernetes (EKS) clusters utilizing Helm and ArgoCD for GitOps deployments.
- Implemented observability dashboards and alerting in Prometheus and Grafana, lowering MTTR by 45%.
- Automated CI/CD deployment pipelines in GitHub Actions, supporting 150+ developer commits daily.`
    }
  };

  // Common Technical and Soft Skills Taxonomy
  const SKILLS_TAXONOMY = [
    // Languages & Runtimes
    'TypeScript', 'JavaScript', 'Python', 'Node.js', 'Go', 'Golang', 'Java', 'Rust', 'C++', 'SQL', 'Bash', 'HTML5', 'CSS3',
    // Frontend
    'React', 'React.js', 'Next.js', 'Vue.js', 'Angular', 'Redux', 'Tailwind CSS', 'GraphQL', 'Responsive Design', 'WebSockets',
    // Backend & Cloud
    'PostgreSQL', 'MySQL', 'MongoDB', 'Redis', 'Docker', 'Kubernetes', 'AWS', 'GCP', 'Azure', 'Microservices', 'RESTful',
    'REST API', 'Kafka', 'RabbitMQ', 'Elasticsearch', 'Terraform', 'Helm', 'CI/CD', 'GitHub Actions', 'ArgoCD',
    // AI / ML
    'PyTorch', 'TensorFlow', 'HuggingFace', 'LangChain', 'LlamaIndex', 'RAG', 'Vector Databases', 'Pinecone', 'Weaviate',
    'LLMs', 'Transformers', 'Fine-Tuning', 'LoRA', 'FastAPI', 'MLOps', 'MLflow', 'Scikit-Learn', 'Pandas',
    // Observability & Testing
    'Jest', 'Cypress', 'Playwright', 'Prometheus', 'Grafana', 'Datadog', 'Unit Testing', 'Integration Testing',
    // Product & Management
    'Product Strategy', 'Roadmapping', 'Agile', 'Scrum', 'A/B Testing', 'OKRs', 'User Research', 'Amplitude', 'Mixpanel',
    'Cross-functional Collaboration', 'Stakeholder Management', 'System Architecture', 'Mentorship', 'Leadership'
  ];

  // Action Verbs for ATS Scoring
  const ACTION_VERBS = [
    'architected', 'spearheaded', 'engineered', 'developed', 'optimized', 'scaled', 'implemented', 'orchestrated',
    'designed', 'migrated', 'automated', 'streamlined', 'reduced', 'increased', 'boosted', 'delivered', 'mentored'
  ];

  // Update Word Counts
  function updateWordCounts() {
    const rWords = inpResumeText.value.trim() ? inpResumeText.value.trim().split(/\s+/).length : 0;
    const jWords = inpJdText.value.trim() ? inpJdText.value.trim().split(/\s+/).length : 0;
    resumeWordCount.textContent = `${rWords.toLocaleString()} words`;
    jdWordCount.textContent = `${jWords.toLocaleString()} words`;
  }

  inpResumeText.addEventListener('input', updateWordCounts);
  inpJdText.addEventListener('input', updateWordCounts);

  // Load Presets
  presetChips.forEach(chip => {
    chip.addEventListener('click', () => {
      const key = chip.getAttribute('data-preset');
      if (PRESETS[key]) {
        inpJdText.value = PRESETS[key].jd;
        inpResumeText.value = PRESETS[key].resume;
        updateWordCounts();
        runAnalysis();
        showToast(`Loaded ${chip.textContent} preset!`);
      }
    });
  });

  btnClearInputs.addEventListener('click', () => {
    inpJdText.value = '';
    inpResumeText.value = '';
    updateWordCounts();
    showToast('Inputs cleared');
  });

  // Main Match & ATS Algorithm
  let activeFilter = 'all';
  let currentAnalysisResults = {
    matchedKeywords: [],
    missingKeywords: [],
    atsScore: 0,
    techScore: 0,
    scopeScore: 0,
    verbScore: 0,
    softScore: 0,
    roleTitle: ''
  };

  function runAnalysis() {
    const resume = inpResumeText.value.trim();
    const jd = inpJdText.value.trim();

    if (!resume || !jd) {
      showToast('Please provide both resume and job description text');
      return;
    }

    const resumeLower = resume.toLowerCase();
    const jdLower = jd.toLowerCase();

    // 1. Detect target skills from JD
    const detectedJdSkills = [];
    SKILLS_TAXONOMY.forEach(skill => {
      const regex = new RegExp(`\\b${escapeRegExp(skill.toLowerCase())}\\b`, 'i');
      if (regex.test(jdLower)) {
        detectedJdSkills.push(skill);
      }
    });

    // Fallback if JD has custom words not in taxonomy
    if (detectedJdSkills.length < 5) {
      // Extract capital words or tech-like tokens
      const words = jd.match(/\b[A-Z][a-zA-Z0-9.+]{2,}\b/g) || [];
      words.forEach(w => {
        if (!detectedJdSkills.includes(w) && w.length > 2 && !['The', 'Our', 'You', 'Will', 'With', 'And', 'For', 'Role', 'Company'].includes(w)) {
          detectedJdSkills.push(w);
        }
      });
    }

    // 2. Classify matched vs missing
    const matched = [];
    const missing = [];

    detectedJdSkills.forEach(skill => {
      const regex = new RegExp(`\\b${escapeRegExp(skill.toLowerCase())}\\b`, 'i');
      if (regex.test(resumeLower)) {
        // Count occurrences
        const matches = resumeLower.match(new RegExp(escapeRegExp(skill.toLowerCase()), 'gi')) || [];
        matched.push({ name: skill, count: matches.length });
      } else {
        missing.push({ name: skill, count: 0 });
      }
    });

    // 3. Compute Sub-scores
    const totalSkillsCount = detectedJdSkills.length || 1;
    const skillRatio = matched.length / totalSkillsCount;
    const techScore = Math.min(Math.round(skillRatio * 95) + 5, 98);

    // Seniority & Scope Alignment
    const seniorKeywords = ['senior', 'staff', 'lead', 'principal', 'architect', 'head', 'director', 'manager'];
    let jdSeniorityHits = 0;
    let resumeSeniorityHits = 0;
    seniorKeywords.forEach(kw => {
      if (jdLower.includes(kw)) jdSeniorityHits++;
      if (resumeLower.includes(kw)) resumeSeniorityHits++;
    });
    const scopeScore = jdSeniorityHits > 0 
      ? Math.min(Math.round((resumeSeniorityHits / jdSeniorityHits) * 90) + 10, 95)
      : 85;

    // Action Verbs Density
    let verbHits = 0;
    ACTION_VERBS.forEach(v => {
      if (resumeLower.includes(v)) verbHits++;
    });
    const verbScore = Math.min(Math.round((verbHits / 10) * 85) + 15, 96);

    // Soft Skills / Collaboration
    const softWords = ['collaborat', 'mentor', 'cross-functional', 'leadership', 'stakeholder', 'partner', 'communication'];
    let softHits = 0;
    softWords.forEach(s => {
      if (resumeLower.includes(s)) softHits++;
    });
    const softScore = Math.min(Math.round((softHits / 5) * 80) + 20, 95);

    // Overall Weighted ATS Score
    const overallAts = Math.round(
      (techScore * 0.45) +
      (scopeScore * 0.25) +
      (verbScore * 0.15) +
      (softScore * 0.15)
    );

    // Store in state
    currentAnalysisResults = {
      matchedKeywords: matched,
      missingKeywords: missing,
      atsScore: overallAts,
      techScore: techScore,
      scopeScore: scopeScore,
      verbScore: verbScore,
      softScore: softScore
    };

    // Update UI elements
    atsScoreNum.textContent = `${overallAts}%`;
    atsGaugeCircle.style.setProperty('--ats-score-deg', `${overallAts}%`);

    barValTech.textContent = `${techScore}%`;
    barFillTech.style.width = `${techScore}%`;
    barValScope.textContent = `${scopeScore}%`;
    barFillScope.style.width = `${scopeScore}%`;
    barValVerbs.textContent = `${verbScore}%`;
    barFillVerbs.style.width = `${verbScore}%`;
    barValSoft.textContent = `${softScore}%`;
    barFillSoft.style.width = `${softScore}%`;

    // Verdict text
    if (overallAts >= 85) {
      atsVerdictTitle.textContent = 'Top 5% Tier 1 ATS Match';
      atsVerdictSubtitle.textContent = 'Exceptional keyword alignment and technical competency coverage. Your resume will pass automated recruiting filters into hiring manager screening.';
    } else if (overallAts >= 70) {
      atsVerdictTitle.textContent = 'Strong Candidate Match';
      atsVerdictSubtitle.textContent = 'Solid baseline match meeting core requirements. Incorporating the top missing skills below will boost your ranking to top-tier priority.';
    } else if (overallAts >= 50) {
      atsVerdictTitle.textContent = 'Moderate Match — Skill Gaps Detected';
      atsVerdictSubtitle.textContent = 'Several critical required competencies are missing from your resume text. Update your bullet points with the keywords flagged in red.';
    } else {
      atsVerdictTitle.textContent = 'Low Match — Significant Revision Advised';
      atsVerdictSubtitle.textContent = 'Your current resume text shares low vocabulary density with this position description. Consider tailoring your experience summary.';
    }

    // Counts
    missingCountEl.textContent = missing.length;
    matchedCountEl.textContent = matched.length;

    renderKeywordBadges();
    generateTailoredPitches(matched, missing);

    showToast('ATS Job Match Analysis complete!');
  }

  function escapeRegExp(string) {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }

  function renderKeywordBadges() {
    keywordCloud.innerHTML = '';
    const { matchedKeywords, missingKeywords } = currentAnalysisResults;

    let itemsToRender = [];
    if (activeFilter === 'all') {
      itemsToRender = [
        ...matchedKeywords.map(k => ({ ...k, isMatched: true })),
        ...missingKeywords.map(k => ({ ...k, isMatched: false }))
      ];
    } else if (activeFilter === 'matched') {
      itemsToRender = matchedKeywords.map(k => ({ ...k, isMatched: true }));
    } else {
      itemsToRender = missingKeywords.map(k => ({ ...k, isMatched: false }));
    }

    if (itemsToRender.length === 0) {
      keywordCloud.innerHTML = '<span style="font-size: 0.85rem; color: var(--text-tertiary);">No keywords in this category.</span>';
      return;
    }

    itemsToRender.forEach(item => {
      const badge = document.createElement('div');
      badge.className = `keyword-badge ${item.isMatched ? 'matched' : 'missing'}`;
      if (item.isMatched) {
        badge.innerHTML = `
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><polyline points="20 6 9 17 4 12"></polyline></svg>
          <span>${escapeHtml(item.name)}</span>
          <span class="count-tag">${item.count}x</span>
        `;
      } else {
        badge.title = 'Click to copy insertion suggestion snippet';
        badge.innerHTML = `
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
          <span>${escapeHtml(item.name)}</span>
          <span class="count-tag">+ Add</span>
        `;
        badge.addEventListener('click', () => {
          const snippet = `• Leveraged ${item.name} to streamline core system reliability and improve end-user performance metrics.`;
          navigator.clipboard.writeText(snippet).then(() => {
            showToast(`Copied bullet snippet for "${item.name}"!`);
          });
        });
      }
      keywordCloud.appendChild(badge);
    });
  }

  function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  // Filter Buttons
  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      activeFilter = btn.getAttribute('data-filter');
      renderKeywordBadges();
    });
  });

  // Pitch Generator Synthesis
  function generateTailoredPitches(matched, missing) {
    const matchedList = matched.slice(0, 4).map(m => m.name).join(', ') || 'modern software engineering';
    const topMissing = missing.slice(0, 2).map(m => m.name).join(' and ') || 'specialized domain tooling';

    // 1. Elevator Pitch
    pitchElevator.textContent = 
`"Hi, I'm a specialist with a deep background delivering high-scale solutions using ${matchedList}. In my recent roles, I have focused on driving measurable performance gains and engineering velocity—such as scaling throughput and eliminating downtime. I saw your opening and noticed you emphasize ${matchedList}. My experience aligns directly with that roadmap, and I'd love to discuss how I can bring immediate execution value to your team."`;

    // 2. LinkedIn Cold Outreach Message
    pitchLinkedin.textContent = 
`Hi [Hiring Manager Name],

I noticed you're leading the search for the role at [Company Name]. Having recently spearheaded high-impact initiatives leveraging ${matchedList}, I was drawn to your team's mission and engineering challenges.

In my last role, I drove similar technical execution—delivering 40%+ performance gains and architecting resilient workflows. I would love to connect and share a quick 2-minute perspective on how my background in ${matchedList} could accelerate your team's upcoming milestones.

Best regards,
[Your Name]
[Your Phone/Email]`;

    // 3. Cover Letter Opening Hook
    pitchCover.textContent = 
`Dear Hiring Team,

When scaling modern infrastructure, the difference between an adequate implementation and an exceptional one lies in deliberate system craftsmanship and cross-functional ownership. Having engineered production solutions anchored in ${matchedList}, I was energized to discover the opportunity at [Company Name]. Your focus on scalable excellence mirrors my own track record of delivering resilient, metrics-backed systems that directly move business KPIs.`;

    // 4. XYZ Resume Bullets
    pitchBullets.textContent = 
`• Spearheaded end-to-end implementation of ${matched.length > 0 ? matched[0].name : 'core services'} and ${matched.length > 1 ? matched[1].name : 'data pipelines'}, improving system execution velocity by 38% across cross-functional sprints.

• Architected resilient microservice workflows utilizing ${matched.length > 2 ? matched[2].name : 'cloud infrastructure'}, reducing operational incident latency from 45 minutes to under 5 minutes.

• Championed organizational adoption of automated testing and ${matched.length > 3 ? matched[3].name : 'scalable architecture'}, scaling overall reliability to 99.95% uptime across 500k+ active users.`;
  }

  // Copy Pitch Buttons
  document.querySelectorAll('.btn-copy-pitch').forEach(btn => {
    btn.addEventListener('click', () => {
      const targetId = btn.getAttribute('data-target');
      const textElem = document.getElementById(targetId);
      if (textElem) {
        navigator.clipboard.writeText(textElem.innerText).then(() => {
          showToast('Pitch asset copied to clipboard!');
        });
      }
    });
  });

  btnRunMatch.addEventListener('click', runAnalysis);

  // Initialize with Senior Full-Stack Engineer sample
  if (PRESETS.swe) {
    inpJdText.value = PRESETS.swe.jd;
    inpResumeText.value = PRESETS.swe.resume;
    updateWordCounts();
    runAnalysis();
  }

});