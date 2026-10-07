// Resume Keyword Generator - ATS Job Description Extractor
// Client-side Taxonomy & NLP Engine

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
  'yourself', 'yourselves', 'role', 'job', 'work', 'working', 'responsibilities', 'opportunity', 'company',
  'ideal', 'candidate', 'looking', 'join', 'team', 'position', 'experience', 'years', 'requirements',
  'qualifications', 'plus', 'including', 'must', 'have', 'ability', 'preferred', 'strong', 'demonstrated'
]);

// Taxonomy Dictionaries
const TAXONOMY = {
  tools: [
    // Languages & Web
    'JavaScript', 'TypeScript', 'Python', 'Java', 'C++', 'C#', 'Golang', 'Go', 'Ruby', 'PHP',
    'Swift', 'Kotlin', 'Rust', 'R', 'SQL', 'NoSQL', 'HTML5', 'CSS3', 'Bash', 'Shell',
    // Frontend
    'React', 'React.js', 'Vue', 'Vue.js', 'Angular', 'Next.js', 'Svelte', 'Redux', 'Tailwind CSS',
    'Bootstrap', 'Webflow', 'WordPress',
    // Backend
    'Node.js', 'Express', 'NestJS', 'Django', 'Flask', 'FastAPI', 'Spring Boot', 'Ruby on Rails',
    'ASP.NET', 'GraphQL', 'REST API', 'gRPC', 'Microservices',
    // Cloud, Infra & DevOps
    'AWS', 'Amazon Web Services', 'Azure', 'GCP', 'Google Cloud', 'Docker', 'Kubernetes', 'K8s',
    'Terraform', 'Ansible', 'Helm', 'Jenkins', 'GitLab CI', 'GitHub Actions', 'CircleCI',
    'Prometheus', 'Grafana', 'Datadog', 'Linux',
    // Data & Messaging
    'PostgreSQL', 'MySQL', 'MongoDB', 'Redis', 'Elasticsearch', 'Apache Kafka', 'Kafka', 'RabbitMQ',
    'Apache Spark', 'Snowflake', 'BigQuery', 'PyTorch', 'TensorFlow', 'Pandas', 'OpenAI',
    // Business, Sales & Marketing
    'Salesforce', 'HubSpot', 'Outreach', 'Salesloft', 'Gong.io', 'ZoomInfo', 'Shopify Plus', 'Shopify',
    'WooCommerce', 'Magento', 'Amazon Seller Central', 'Amazon FBA', 'Klaviyo', 'Google Analytics 4', 'GA4',
    'Triple Whale', 'Jira', 'Confluence', 'Figma', 'Asana', 'Linear', 'Tableau', 'Power BI', 'Stripe'
  ],

  hard: [
    'System Architecture', 'Distributed Systems', 'Event-Driven Architecture', 'Continuous Integration',
    'Continuous Deployment', 'CI/CD', 'Automated Testing', 'Unit Testing', 'End-to-End Testing',
    'Test-Driven Development', 'TDD', 'API Design', 'Database Optimization', 'Query Optimization',
    'High Availability', 'Disaster Recovery', 'Load Balancing', 'Cloud Infrastructure', 'Infrastructure as Code',
    'Security Compliance', 'SOC 2', 'GDPR', 'Data Modeling', 'Data Pipelines', 'ETL Pipelines',
    'Machine Learning', 'Deep Learning', 'Predictive Modeling', 'Prompt Engineering', 'Model Fine-Tuning',
    'Conversion Rate Optimization', 'CRO', 'A/B Testing', 'Paid Acquisition', 'Performance Marketing',
    'Search Engine Optimization', 'SEO', 'Customer Acquisition Cost', 'CAC', 'Lifetime Value', 'LTV',
    'Return on Ad Spend', 'ROAS', 'Marketing Efficiency Ratio', 'MER', 'Supply Chain Management',
    '3PL Fulfillment', 'Inventory Forecasting', 'B2B Sales', 'Enterprise Sales', 'Quota Attainment',
    'Pipeline Management', 'Sales Forecasting', 'Contract Negotiation', 'MEDDPIC', 'MEDDIC',
    'Consultative Selling', 'Solution Selling', 'Account Management', 'Product Discovery', 'Roadmap Planning',
    'OKRs', 'Sprint Planning', 'User Journey Mapping', 'Wireframing', 'Competitor Analysis'
  ],

  soft: [
    'Cross-Functional Collaboration', 'Team Leadership', 'Mentorship', 'Strategic Thinking',
    'Problem Solving', 'Stakeholder Management', 'Executive Communication', 'Consultative Communication',
    'Agile Mindset', 'Change Management', 'Time Management', 'Commercial Negotiation',
    'Conflict Resolution', 'Analytical Thinking', 'Critical Thinking', 'Emotional Intelligence',
    'Accountability & Ownership', 'Prioritization', 'Bias for Action', 'Customer-Centric Mindset',
    'Adaptability', 'Proactive Initiative', 'Interpersonal Skills', 'Presentation Skills'
  ],

  certifications: [
    'AWS Certified Solutions Architect', 'AWS Certified', 'Azure Certified', 'Google Cloud Certified',
    'CISSP', 'CISA', 'CISM', 'CompTIA Security+', 'PMP', 'Project Management Professional',
    'Certified ScrumMaster', 'CSM', 'Professional Scrum Master', 'PSM', 'PRINCE2', 'ITIL',
    'Six Sigma', 'Lean Six Sigma', 'CFA', 'CPA', 'MBA', 'Master of Business Administration',
    'Bachelor of Science', 'B.S.', 'Master of Science', 'M.S.', 'Ph.D.', 'Salesforce Certified',
    'HubSpot Certified', 'Google Ads Certified', 'Shopify Certified', 'Certified Kubernetes Administrator', 'CKA'
  ]
};

// Demo Job Descriptions
const DEMO_POSTINGS = {
  eng: {
    title: 'Senior Full-Stack Cloud Engineer',
    text: `About the Role:
We are seeking an experienced Senior Full-Stack Engineer to scale our next-generation cloud infrastructure. You will architect high-performance distributed systems, build responsive frontend user interfaces, and collaborate with product and data teams.

Requirements & Technical Proficiencies:
• 5+ years building scalable web applications with TypeScript, React, Next.js, and Node.js.
• Deep experience architecting cloud infrastructure on AWS (ECS, Lambda, S3) using Docker, Kubernetes, and Terraform.
• Proven track record designing event-driven architectures with Apache Kafka, Redis caching, and PostgreSQL databases.
• Strong foundation in CI/CD pipeline automation (GitHub Actions), Unit Testing, and Test-Driven Development (TDD).
• Demonstrated commitment to high availability, system architecture resilience, and latency reduction.
• Bachelor of Science (B.S.) in Computer Science or equivalent practical experience; AWS Certified Solutions Architect preferred.
• Excellent cross-functional collaboration, mentoring junior engineers, and problem solving skills.`
  },
  pm: {
    title: 'Lead Product Manager - Enterprise SaaS',
    text: `Job Description:
As Lead Product Manager, you will define the multi-year product roadmap, drive user engagement, and guide sprint planning across design and engineering squads.

What You Will Do:
• Spearhead product discovery, customer interviews, and user journey mapping to uncover core enterprise pain points.
• Define measurable OKRs, KPI metric goals, and prioritized product requirement documents (PRDs).
• Champion data-informed experimentation through A/B Testing, Amplitude, and Mixpanel analytics.
• Partner closely with engineering, UX/UI design (Figma), and customer success teams via Agile Scrum frameworks.
• Manage stakeholder expectations and deliver crisp executive presentations to VP and C-suite leadership.
• PMP or Certified ScrumMaster (CSM) credential is a plus.`
  },
  mkt: {
    title: 'Senior Growth & Performance Marketing Manager',
    text: `About the Opportunity:
We are hiring a Senior Growth Marketing Manager to oversee multi-million dollar annual acquisition budgets and scale paid digital revenue.

Core Responsibilities & Requirements:
• Hands-on ownership of paid media channels across Meta Ads, Google Ads, and TikTok.
• Deep mastery of Return on Ad Spend (ROAS), Marketing Efficiency Ratio (MER), CAC containment, and customer LTV modeling.
• Lead Conversion Rate Optimization (CRO) experimentation across landing pages, conducting continuous A/B testing.
• Experience leveraging Google Analytics 4 (GA4), Triple Whale, and Tableau for multi-touch attribution.
• Strong analytical thinking, campaign storytelling, and cross-functional collaboration with creative directors.
• Google Ads Certified and Meta Certified digital media credentials preferred.`
  },
  ecomm: {
    title: 'Director of E-Commerce & Marketplace Operations',
    text: `The Role:
We are looking for an omnichannel E-Commerce Director to accelerate annual GMV growth across our direct-to-consumer store and third-party marketplace channels.

Key Qualifications:
• 6+ years managing high-volume Shopify Plus and Amazon Seller Central (Amazon FBA) storefronts.
• Proven success scaling gross merchandise value (GMV), lifting store conversion rates, and optimizing AOV bundles.
• Direct experience overseeing 3PL fulfillment logistics, freight agreements, and inventory forecasting.
• Mastery of e-commerce SaaS stack including Klaviyo lifecycle flows, Recharge Subscriptions, and Gorgias.
• Exceptional leadership, vendor negotiation, and commercial budget ownership.`
  },
  sales: {
    title: 'Enterprise Account Executive - Strategic Accounts',
    text: `About the Position:
Drive 7-figure enterprise software transactions across Global 2000 prospects in financial services and healthcare.

What We Look For:
• Consistent track record of Quota Attainment (120%+ target attainment) and President's Club recognition.
• Master practitioner of MEDDPIC deal qualification and Consultative Solution Selling methodologies.
• Fluency managing multi-stage deal pipelines within Salesforce Lightning and Gong.io revenue intelligence.
• Proven ability to align Fortune 500 C-suite champions, negotiate complex MSAs, and accelerate deal velocity.
• Outstanding commercial negotiation, executive presence, and strategic account planning.`
  },
  devops: {
    title: 'Senior Cloud & DevOps Architect',
    text: `Overview:
We are hiring a Cloud & DevOps Architect to build our automated, multi-region cloud platform.

Qualifications & Experience:
• Expert knowledge of AWS and Kubernetes (EKS) container orchestration in production environments.
• Extensive experience with Infrastructure as Code using Terraform, Helm, and Ansible.
• Expertise implementing CI/CD pipelines in GitLab CI and GitHub Actions with zero-downtime blue/green rollouts.
• Observability mastery with Prometheus, Grafana, and Datadog monitoring.
• Experience enforcing SOC 2 and GDPR cloud security controls.
• Certified Kubernetes Administrator (CKA) or AWS Certified Solutions Architect highly preferred.`
  }
};

let currentExtractedData = null;

document.addEventListener('DOMContentLoaded', () => {
  initDemoButtons();
  initActions();
  initFilterInput();
});

function initDemoButtons() {
  document.getElementById('btn-load-eng')?.addEventListener('click', () => loadDemo('eng'));
  document.getElementById('btn-load-pm')?.addEventListener('click', () => loadDemo('pm'));
  document.getElementById('btn-load-mkt')?.addEventListener('click', () => loadDemo('mkt'));
  document.getElementById('btn-load-ecomm')?.addEventListener('click', () => loadDemo('ecomm'));
  document.getElementById('btn-load-sales')?.addEventListener('click', () => loadDemo('sales'));
  document.getElementById('btn-load-devops')?.addEventListener('click', () => loadDemo('devops'));

  document.getElementById('btn-clear-text')?.addEventListener('click', () => {
    document.getElementById('inp-job-title').value = '';
    document.getElementById('inp-jd-content').value = '';
    updateJdStats();
    resetView();
  });

  document.getElementById('inp-jd-content')?.addEventListener('input', updateJdStats);
}

function loadDemo(key) {
  const demo = DEMO_POSTINGS[key];
  if (!demo) return;
  document.getElementById('inp-job-title').value = demo.title || '';
  document.getElementById('inp-jd-content').value = demo.text || '';
  updateJdStats();
  extractKeywords();
}

function updateJdStats() {
  const text = document.getElementById('inp-jd-content')?.value || '';
  const words = text.trim() ? text.trim().split(/\s+/).length : 0;
  const badge = document.getElementById('jd-stats-badge');
  if (badge) {
    badge.textContent = `${words} Words`;
  }
}

function initActions() {
  document.getElementById('btn-extract-keywords')?.addEventListener('click', extractKeywords);

  // Category copy buttons
  document.getElementById('btn-copy-cat-tools')?.addEventListener('click', () => copyCategory('tools'));
  document.getElementById('btn-copy-cat-hard')?.addEventListener('click', () => copyCategory('hard'));
  document.getElementById('btn-copy-cat-soft')?.addEventListener('click', () => copyCategory('soft'));
  document.getElementById('btn-copy-cat-cert')?.addEventListener('click', () => copyCategory('certifications'));
  document.getElementById('btn-copy-cat-general')?.addEventListener('click', () => copyCategory('general'));

  // Top action buttons
  document.getElementById('btn-copy-all')?.addEventListener('click', copyAllKeywords);
  document.getElementById('btn-export-csv')?.addEventListener('click', exportCsv);
}

function initFilterInput() {
  const filterInput = document.getElementById('inp-filter-kw');
  filterInput?.addEventListener('input', (e) => {
    const query = e.target.value.toLowerCase().trim();
    filterChips(query);
  });
}

function resetView() {
  document.getElementById('kw-empty-state').style.display = 'flex';
  document.getElementById('kw-results-view').style.display = 'none';
  document.getElementById('btn-copy-all').disabled = true;
  document.getElementById('btn-export-csv').disabled = true;
  currentExtractedData = null;
}

// Extraction Engine
function extractKeywords() {
  const jdText = document.getElementById('inp-jd-content')?.value.trim() || '';
  if (!jdText) {
    alert('Please paste a job description before extracting keywords.');
    return;
  }

  const lowerText = jdText.toLowerCase();

  // 1. Scan curated taxonomies
  const categorized = {
    tools: scanTaxonomyList(lowerText, TAXONOMY.tools),
    hard: scanTaxonomyList(lowerText, TAXONOMY.hard),
    soft: scanTaxonomyList(lowerText, TAXONOMY.soft),
    certifications: scanTaxonomyList(lowerText, TAXONOMY.certifications)
  };

  // Track all detected terms so we don't duplicate them in the general frequency list
  const detectedTerms = new Set();
  Object.values(categorized).forEach(arr => {
    arr.forEach(item => {
      detectedTerms.add(item.term.toLowerCase());
    });
  });

  // 2. Statistical frequency extraction for domain terms (NLP Unigrams & Bigrams)
  categorized.general = extractGeneralDomainTerms(jdText, detectedTerms);

  // Totals
  const totalCount =
    categorized.tools.length +
    categorized.hard.length +
    categorized.soft.length +
    categorized.certifications.length +
    categorized.general.length;

  currentExtractedData = {
    categorized,
    totalCount
  };

  renderExtractedResults(currentExtractedData);
}

function scanTaxonomyList(lowerText, list) {
  const results = [];
  list.forEach(canonicalTerm => {
    // Escape special regex characters in terms (like C++, .js, etc.)
    const escaped = canonicalTerm.toLowerCase().replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&');
    const regex = new RegExp(`(?:^|[^a-z0-9])(${escaped})(?:$|[^a-z0-9])`, 'gi');
    const matches = lowerText.match(regex);
    if (matches && matches.length > 0) {
      results.push({
        term: canonicalTerm,
        count: matches.length
      });
    }
  });

  // Sort by highest frequency
  return results.sort((a, b) => b.count - a.count);
}

function extractGeneralDomainTerms(rawText, existingTerms) {
  const clean = rawText.toLowerCase().replace(/[^a-z0-9\s]/g, ' ');
  const words = clean.split(/\s+/).filter(w => w.length > 3 && !STOP_WORDS.has(w));

  const freq = {};
  words.forEach(w => {
    freq[w] = (freq[w] || 0) + 1;
  });

  // Bigrams
  for (let i = 0; i < words.length - 1; i++) {
    const bg = `${words[i]} ${words[i+1]}`;
    if (!STOP_WORDS.has(words[i]) && !STOP_WORDS.has(words[i+1])) {
      freq[bg] = (freq[bg] || 0) + 1;
    }
  }

  const results = [];
  Object.entries(freq).forEach(([term, count]) => {
    // Include if mentioned at least 2 times, not in existing terms, and not purely numbers
    if (count >= 2 && !existingTerms.has(term) && isNaN(term)) {
      // Capitalize for presentation
      const titleCase = term.replace(/\b\w/g, c => c.toUpperCase());
      results.push({
        term: titleCase,
        count
      });
    }
  });

  return results.sort((a, b) => b.count - a.count).slice(0, 15);
}

// Render Results
function renderExtractedResults(data) {
  document.getElementById('kw-empty-state').style.display = 'none';
  const view = document.getElementById('kw-results-view');
  view.style.display = 'flex';

  document.getElementById('btn-copy-all').disabled = false;
  document.getElementById('btn-export-csv').disabled = false;

  // Ribbon Stats
  document.getElementById('val-total-count').textContent = data.totalCount;
  document.getElementById('val-tools-count').textContent = data.categorized.tools.length;
  document.getElementById('val-hard-count').textContent = data.categorized.hard.length;
  document.getElementById('val-soft-count').textContent = data.categorized.soft.length;
  document.getElementById('val-cert-count').textContent = data.categorized.certifications.length;

  // Badges
  document.getElementById('badge-tools-count').textContent = `${data.categorized.tools.length} terms`;
  document.getElementById('badge-hard-count').textContent = `${data.categorized.hard.length} terms`;
  document.getElementById('badge-soft-count').textContent = `${data.categorized.soft.length} terms`;
  document.getElementById('badge-cert-count').textContent = `${data.categorized.certifications.length} terms`;
  document.getElementById('badge-general-count').textContent = `${data.categorized.general.length} terms`;

  // Render Category Chips
  renderChips('container-tools-chips', data.categorized.tools);
  renderChips('container-hard-chips', data.categorized.hard);
  renderChips('container-soft-chips', data.categorized.soft);
  renderChips('container-cert-chips', data.categorized.certifications);
  renderChips('container-general-chips', data.categorized.general);
}

function renderChips(containerId, list) {
  const container = document.getElementById(containerId);
  if (!container) return;
  container.innerHTML = '';

  if (list.length === 0) {
    container.innerHTML = '<span style="color: var(--text-secondary); font-size: 0.8rem; font-style: italic;">No matching keywords detected in this category.</span>';
    return;
  }

  list.forEach(item => {
    const chip = document.createElement('span');
    chip.className = 'kw-chip';
    chip.setAttribute('data-kw', item.term);
    chip.title = 'Click to copy';
    chip.innerHTML = `
      <span>${escapeHtml(item.term)}</span>
      <span class="kw-chip-freq">${item.count}x</span>
    `;

    chip.addEventListener('click', () => {
      copyToClipboard(item.term, `Copied "${item.term}"`);
      chip.classList.add('copied');
      setTimeout(() => chip.classList.remove('copied'), 1000);
    });

    container.appendChild(chip);
  });
}

function filterChips(query) {
  const chips = document.querySelectorAll('.kw-chip');
  chips.forEach(chip => {
    const term = chip.getAttribute('data-kw') || '';
    if (!query || term.toLowerCase().includes(query)) {
      chip.style.display = 'inline-flex';
    } else {
      chip.style.display = 'none';
    }
  });
}

function formatTerms(list) {
  const format = document.getElementById('sel-copy-format')?.value || 'comma';
  if (format === 'bullet') {
    return list.map(t => `• ${t}`).join('\n');
  } else if (format === 'lines') {
    return list.join('\n');
  }
  return list.join(', ');
}

function copyCategory(categoryKey) {
  if (!currentExtractedData || !currentExtractedData.categorized[categoryKey]) return;
  const list = currentExtractedData.categorized[categoryKey].map(i => i.term);
  if (list.length === 0) {
    showToast('No terms in this category.');
    return;
  }
  const formatted = formatTerms(list);
  copyToClipboard(formatted, `Copied ${list.length} terms to clipboard!`);
}

function copyAllKeywords() {
  if (!currentExtractedData) return;
  const allTerms = [];
  Object.values(currentExtractedData.categorized).forEach(arr => {
    arr.forEach(i => allTerms.push(i.term));
  });

  if (allTerms.length === 0) {
    showToast('No keywords available to copy.');
    return;
  }

  const formatted = formatTerms(allTerms);
  copyToClipboard(formatted, `Copied all ${allTerms.length} keywords!`);
}

function exportCsv() {
  if (!currentExtractedData) return;

  const rows = [['Keyword', 'Category', 'Frequency']];
  Object.entries(currentExtractedData.categorized).forEach(([cat, list]) => {
    list.forEach(item => {
      rows.push([`"${item.term.replace(/"/g, '""')}"`, cat, item.count]);
    });
  });

  const csvContent = 'data:text/csv;charset=utf-8,' + rows.map(e => e.join(',')).join('\n');
  const dlAnchor = document.createElement('a');
  dlAnchor.setAttribute('href', encodeURI(csvContent));
  dlAnchor.setAttribute('download', `ats-keywords-${Date.now()}.csv`);
  dlAnchor.click();
}

function copyToClipboard(text, successMsg) {
  navigator.clipboard.writeText(text).then(() => {
    showToast(successMsg || 'Copied to clipboard!');
  }).catch(() => {
    showToast('Copied!');
  });
}

function showToast(message) {
  const toast = document.getElementById('toast-elem');
  if (!toast) return;
  toast.textContent = message;
  toast.classList.add('show');
  setTimeout(() => {
    toast.classList.remove('show');
  }, 2200);
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