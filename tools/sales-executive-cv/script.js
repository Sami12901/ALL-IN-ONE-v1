// B2B Enterprise & High-Ticket Sales Executive CV Builder
// Client-side Reactive Architecture

const STORAGE_KEY = 'aio_sales_cv_data_v1';

const SAMPLE_SALES_CV = {
  personal: {
    fullName: 'Sterling Thorne',
    title: 'Senior Enterprise Account Executive • President’s Club',
    email: 's.thorne@example.com',
    phone: '+1 (312) 678-4902',
    location: 'Chicago, IL (North America & EMEA Territory)',
    linkedin: 'linkedin.com/in/sterling-thorne-sales',
    vertical: 'Enterprise Cloud Security & Infrastructure • Global 2000'
  },
  metrics: {
    quota: '145% Annual Target',
    revenue: '$18.4M Closed ARR',
    deal: '$1.2M ACV Flagship Win',
    cycle: '72-Day Cycle • 34% Win Rate'
  },
  summary: 'President’s Club Enterprise Account Executive with 8+ years selling 7-figure cybersecurity and cloud software to Global 2000 enterprises. Consistently surpassed quota at 145% average attainment across 5 consecutive fiscal years, generating $18.4M in total ARR. Master practitioner of MEDDPIC and Command of the Message with proven ability to align Fortune 500 C-suite champions and navigate complex legal/procurement cycles.',
  experience: [
    {
      id: 'exp-1',
      role: 'Senior Enterprise Account Executive',
      company: 'Sentinel Cloud Security',
      location: 'Chicago, IL',
      dates: '2021 – Present',
      badge: '148% Quota • President’s Club 2022, 2023',
      bullets: 'Delivered 148% of annual $2.4M ARR quota, generating $3.55M in net-new ARR across 14 enterprise financial services logos.\nOriginated and closed the largest software transaction in corporate history: a 3-year $3.6M TCV ($1.2M ACV) agreement with a Tier-1 Investment Bank.\nManaged end-to-end sales lifecycles using MEDDPIC qualification, orchestrating proofs-of-concept (PoC) alongside Sales Engineering and Infosec review boards.\nMaintained 100% pipeline accuracy in Salesforce Lightning, maintaining a 4.5x weighted pipeline coverage ratio.'
    },
    {
      id: 'exp-2',
      role: 'Enterprise Account Executive',
      company: 'DataScale Systems',
      location: 'New York, NY',
      dates: '2018 – 2021',
      badge: '142% Quota • Top Performer 2019, 2020',
      bullets: 'Exceeded $1.8M annual quota by closing 22 net-new mid-market and enterprise logos across Healthcare and FinTech verticals.\nReduced average enterprise deal gestation period from 110 days down to 72 days by introducing executive champion mutual action plans (MAPs).\nRecognized in President’s Club for top gross margin delivery and zero customer churn across Year 1 renewals.'
    },
    {
      id: 'exp-3',
      role: 'Senior Commercial Account Executive',
      company: 'SaaSFlow Technologies',
      location: 'Austin, TX',
      dates: '2016 – 2018',
      badge: '135% Quota Attainment',
      bullets: 'Generated $1.4M in closed ACV through consultative outbound prospecting and inbound demo conversion.\nRanked #1 outbound producer out of 28 commercial account executives nationwide.'
    }
  ],
  deals: [
    {
      id: 'deal-1',
      title: 'Tier-1 Global Investment Bank',
      value: '$1.2M ACV / $3.6M TCV',
      solution: 'Enterprise Zero-Trust Cloud Infrastructure',
      highlights: 'Displaced 7-year legacy incumbent across 42,000 employee seats; secured unanimous CISO, CIO, and CTO procurement signoff.'
    },
    {
      id: 'deal-2',
      title: 'Fortune 100 Healthcare Network',
      value: '$840K ACV',
      solution: 'Automated HIPAA Compliance & Threat Detection',
      highlights: 'Navigated 9-month procurement process, resolving 65 SOC2 security requirements and obtaining board-level authorization.'
    },
    {
      id: 'deal-3',
      title: 'FinTech Unicorn Platform',
      value: '$620K ACV',
      solution: 'Real-Time Fraud Prevention API Suite',
      highlights: 'Executed rapid 45-day sales cycle via mutual close plan with VP of Engineering.'
    }
  ],
  skills: {
    crms: 'Salesforce Sales Cloud (Lightning), HubSpot Enterprise, Gong.io Revenue Intelligence, Outreach.io, Salesloft, LinkedIn Sales Navigator, ZoomInfo Enterprise, Clari',
    methodologies: 'MEDDPIC Qualification, Command of the Message (Force Mgmt), The Challenger Sale, Consultative Solution Selling, Mutual Action Plans (MAPs), Sandler Sales System',
    competencies: 'Enterprise Pipeline Management, C-Level C-Suite Relationship Mapping, MSA & RFP Contract Negotiation, Deal Slippage Mitigation, Territory Account Planning'
  },
  certifications: [
    {
      id: 'cert-1',
      name: 'President’s Club Winner (2019, 2020, 2022, 2023)',
      issuer: 'Sentinel Security & DataScale',
      year: '4x Honoree'
    },
    {
      id: 'cert-2',
      name: 'Certified MEDDPIC Master & Deal Architect',
      issuer: 'MEDDICC Academy',
      year: '2021'
    },
    {
      id: 'cert-3',
      name: 'Command of the Message Sales Certification',
      issuer: 'Force Management',
      year: '2019'
    },
    {
      id: 'cert-4',
      name: 'Salesforce Certified Sales Cloud Consultant',
      issuer: 'Salesforce',
      year: '2020'
    }
  ],
  education: [
    {
      id: 'edu-1',
      degree: 'B.S. in Business Administration & Finance',
      institution: 'University of Illinois Urbana-Champaign',
      year: '2016',
      honors: 'Magna Cum Laude • Intercollegiate Sales Champion'
    }
  ],
  theme: 'theme-navy'
};

let cvData = loadData();

function loadData() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (e) {
    console.warn('Unable to load sales CV data from localStorage', e);
  }
  return JSON.parse(JSON.stringify(SAMPLE_SALES_CV));
}

function saveData() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(cvData));
  } catch (e) {
    console.warn('Unable to save sales CV data', e);
  }
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

document.addEventListener('DOMContentLoaded', () => {
  initTabs();
  initFormInputs();
  renderDynamicLists();
  initPresets();
  initToolbarActions();
  renderPreview();
});

// Tab navigation
function initTabs() {
  const tabs = document.querySelectorAll('.editor-tabs-nav .tab-btn');
  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      tabs.forEach(t => t.classList.remove('active'));
      document.querySelectorAll('.tab-pane').forEach(p => p.classList.remove('active'));

      tab.classList.add('active');
      const targetPane = document.getElementById(tab.getAttribute('data-tab'));
      if (targetPane) targetPane.classList.add('active');
    });
  });
}

// Populate and attach two-way bindings to standard inputs
function initFormInputs() {
  const map = {
    'inp-fullname': ['personal', 'fullName'],
    'inp-title': ['personal', 'title'],
    'inp-email': ['personal', 'email'],
    'inp-phone': ['personal', 'phone'],
    'inp-location': ['personal', 'location'],
    'inp-linkedin': ['personal', 'linkedin'],
    'inp-vertical': ['personal', 'vertical'],

    'inp-metric-quota': ['metrics', 'quota'],
    'inp-metric-revenue': ['metrics', 'revenue'],
    'inp-metric-deal': ['metrics', 'deal'],
    'inp-metric-cycle': ['metrics', 'cycle'],

    'inp-summary': ['summary'],

    'inp-crms': ['skills', 'crms'],
    'inp-methodologies': ['skills', 'methodologies'],
    'inp-competencies': ['skills', 'competencies']
  };

  Object.entries(map).forEach(([id, path]) => {
    const el = document.getElementById(id);
    if (!el) return;

    let val = cvData;
    for (const p of path) {
      val = val ? val[p] : '';
    }
    el.value = val || '';

    el.addEventListener('input', (e) => {
      let cur = cvData;
      for (let i = 0; i < path.length - 1; i++) {
        if (!cur[path[i]]) cur[path[i]] = {};
        cur = cur[path[i]];
      }
      cur[path[path.length - 1]] = e.target.value;
      saveData();
      renderPreview();
    });
  });

  // Theme selector
  const selTheme = document.getElementById('sel-theme');
  if (selTheme) {
    selTheme.value = cvData.theme || 'theme-navy';
    selTheme.addEventListener('change', (e) => {
      cvData.theme = e.target.value;
      saveData();
      renderPreview();
    });
  }
}

// Dynamic Lists (Experience, Deals, Certs, Edu)
function renderDynamicLists() {
  renderExperienceList();
  renderDealsList();
  renderCertList();
  renderEduList();
}

function renderExperienceList() {
  const container = document.getElementById('exp-container');
  if (!container) return;
  container.innerHTML = '';

  cvData.experience.forEach((item, index) => {
    const card = document.createElement('div');
    card.className = 'dynamic-item-card';
    card.innerHTML = `
      <div class="item-header">
        <span class="item-title">Role #${index + 1}: ${escapeHtml(item.role || 'New Role')}</span>
        <button type="button" class="btn-remove" data-remove-exp="${item.id}">Remove</button>
      </div>
      <div class="form-row two-cols">
        <div class="form-group">
          <label>Job Title</label>
          <input type="text" class="form-input" data-exp-field="role" value="${escapeHtml(item.role || '')}" placeholder="e.g. Enterprise Account Executive">
        </div>
        <div class="form-group">
          <label>Company / Organization</label>
          <input type="text" class="form-input" data-exp-field="company" value="${escapeHtml(item.company || '')}" placeholder="e.g. Sentinel Security">
        </div>
      </div>
      <div class="form-row two-cols">
        <div class="form-group">
          <label>Location / Territory</label>
          <input type="text" class="form-input" data-exp-field="location" value="${escapeHtml(item.location || '')}" placeholder="e.g. Chicago, IL">
        </div>
        <div class="form-group">
          <label>Employment Period</label>
          <input type="text" class="form-input" data-exp-field="dates" value="${escapeHtml(item.dates || '')}" placeholder="e.g. 2021 – Present">
        </div>
      </div>
      <div class="form-group">
        <label>Quota Achievement Badge / Highlight</label>
        <input type="text" class="form-input" data-exp-field="badge" value="${escapeHtml(item.badge || '')}" placeholder="e.g. 148% of Quota • President's Club Winner">
      </div>
      <div class="form-group">
        <label>Key Accomplishments &amp; Closed ARR Bullets (One per line)</label>
        <textarea class="form-textarea" data-exp-field="bullets" rows="4" placeholder="Highlight ARR closed, quota % surpassed, flagship enterprise logos, and sales velocity...">${escapeHtml(item.bullets || '')}</textarea>
      </div>
    `;

    card.querySelectorAll('[data-exp-field]').forEach(input => {
      input.addEventListener('input', (e) => {
        const field = e.target.getAttribute('data-exp-field');
        item[field] = e.target.value;
        if (field === 'role') {
          const titleSpan = card.querySelector('.item-title');
          if (titleSpan) titleSpan.textContent = `Role #${index + 1}: ${e.target.value || 'New Role'}`;
        }
        saveData();
        renderPreview();
      });
    });

    card.querySelector('[data-remove-exp]').addEventListener('click', () => {
      cvData.experience = cvData.experience.filter(x => x.id !== item.id);
      saveData();
      renderExperienceList();
      renderPreview();
    });

    container.appendChild(card);
  });
}

function renderDealsList() {
  const container = document.getElementById('deals-container');
  if (!container) return;
  container.innerHTML = '';

  if (!cvData.deals) cvData.deals = [];

  cvData.deals.forEach((item, index) => {
    const card = document.createElement('div');
    card.className = 'dynamic-item-card';
    card.innerHTML = `
      <div class="item-header">
        <span class="item-title">Deal #${index + 1}: ${escapeHtml(item.title || 'New Deal')}</span>
        <button type="button" class="btn-remove" data-remove-deal="${item.id}">Remove</button>
      </div>
      <div class="form-row two-cols">
        <div class="form-group">
          <label>Client Logo / Account Type</label>
          <input type="text" class="form-input" data-deal-field="title" value="${escapeHtml(item.title || '')}" placeholder="e.g. Tier-1 Global Investment Bank">
        </div>
        <div class="form-group">
          <label>Contract Value (ACV / TCV)</label>
          <input type="text" class="form-input" data-deal-field="value" value="${escapeHtml(item.value || '')}" placeholder="e.g. $1.2M ACV / $3.6M TCV">
        </div>
      </div>
      <div class="form-group">
        <label>Solution / Products Sold</label>
        <input type="text" class="form-input" data-deal-field="solution" value="${escapeHtml(item.solution || '')}" placeholder="e.g. Enterprise Zero-Trust Cloud Infrastructure">
      </div>
      <div class="form-group">
        <label>Competitive Win Details &amp; Stakeholders</label>
        <input type="text" class="form-input" data-deal-field="highlights" value="${escapeHtml(item.highlights || '')}" placeholder="e.g. Displaced legacy competitor across 42,000 seats; unanimous CISO signoff.">
      </div>
    `;

    card.querySelectorAll('[data-deal-field]').forEach(input => {
      input.addEventListener('input', (e) => {
        const field = e.target.getAttribute('data-deal-field');
        item[field] = e.target.value;
        if (field === 'title') {
          const titleSpan = card.querySelector('.item-title');
          if (titleSpan) titleSpan.textContent = `Deal #${index + 1}: ${e.target.value || 'New Deal'}`;
        }
        saveData();
        renderPreview();
      });
    });

    card.querySelector('[data-remove-deal]').addEventListener('click', () => {
      cvData.deals = cvData.deals.filter(x => x.id !== item.id);
      saveData();
      renderDealsList();
      renderPreview();
    });

    container.appendChild(card);
  });
}

function renderCertList() {
  const container = document.getElementById('cert-container');
  if (!container) return;
  container.innerHTML = '';

  cvData.certifications.forEach((item, index) => {
    const card = document.createElement('div');
    card.className = 'dynamic-item-card';
    card.innerHTML = `
      <div class="item-header">
        <span class="item-title">Award / Cert #${index + 1}</span>
        <button type="button" class="btn-remove" data-remove-cert="${item.id}">Remove</button>
      </div>
      <div class="form-row two-cols">
        <div class="form-group">
          <label>Award or Certification Name</label>
          <input type="text" class="form-input" data-cert-field="name" value="${escapeHtml(item.name || '')}" placeholder="e.g. President's Club Winner">
        </div>
        <div class="form-group">
          <label>Issuing Body / Company</label>
          <input type="text" class="form-input" data-cert-field="issuer" value="${escapeHtml(item.issuer || '')}" placeholder="e.g. Sentinel Security">
        </div>
      </div>
      <div class="form-group">
        <label>Year / Status</label>
        <input type="text" class="form-input" data-cert-field="year" value="${escapeHtml(item.year || '')}" placeholder="e.g. 2023 / Active">
      </div>
    `;

    card.querySelectorAll('[data-cert-field]').forEach(input => {
      input.addEventListener('input', (e) => {
        const field = e.target.getAttribute('data-cert-field');
        item[field] = e.target.value;
        saveData();
        renderPreview();
      });
    });

    card.querySelector('[data-remove-cert]').addEventListener('click', () => {
      cvData.certifications = cvData.certifications.filter(x => x.id !== item.id);
      saveData();
      renderCertList();
      renderPreview();
    });

    container.appendChild(card);
  });
}

function renderEduList() {
  const container = document.getElementById('edu-container');
  if (!container) return;
  container.innerHTML = '';

  cvData.education.forEach((item, index) => {
    const card = document.createElement('div');
    card.className = 'dynamic-item-card';
    card.innerHTML = `
      <div class="item-header">
        <span class="item-title">Education #${index + 1}</span>
        <button type="button" class="btn-remove" data-remove-edu="${item.id}">Remove</button>
      </div>
      <div class="form-row two-cols">
        <div class="form-group">
          <label>Degree / Qualification</label>
          <input type="text" class="form-input" data-edu-field="degree" value="${escapeHtml(item.degree || '')}" placeholder="e.g. B.S. in Business &amp; Finance">
        </div>
        <div class="form-group">
          <label>Institution / University</label>
          <input type="text" class="form-input" data-edu-field="institution" value="${escapeHtml(item.institution || '')}" placeholder="e.g. UIUC">
        </div>
      </div>
      <div class="form-row two-cols">
        <div class="form-group">
          <label>Graduation Year</label>
          <input type="text" class="form-input" data-edu-field="year" value="${escapeHtml(item.year || '')}" placeholder="e.g. 2016">
        </div>
        <div class="form-group">
          <label>Honors / Highlights</label>
          <input type="text" class="form-input" data-edu-field="honors" value="${escapeHtml(item.honors || '')}" placeholder="e.g. Magna Cum Laude">
        </div>
      </div>
    `;

    card.querySelectorAll('[data-edu-field]').forEach(input => {
      input.addEventListener('input', (e) => {
        const field = e.target.getAttribute('data-edu-field');
        item[field] = e.target.value;
        saveData();
        renderPreview();
      });
    });

    card.querySelector('[data-remove-edu]').addEventListener('click', () => {
      cvData.education = cvData.education.filter(x => x.id !== item.id);
      saveData();
      renderEduList();
      renderPreview();
    });

    container.appendChild(card);
  });
}

// Presets initialization
function initPresets() {
  // Summary presets
  document.querySelectorAll('[data-insert-summary]').forEach(btn => {
    btn.addEventListener('click', () => {
      const text = btn.getAttribute('data-insert-summary');
      const el = document.getElementById('inp-summary');
      if (el) {
        el.value = text;
        cvData.summary = text;
        saveData();
        renderPreview();
      }
    });
  });

  // Bullet presets - append to first position
  document.querySelectorAll('[data-add-bullet]').forEach(btn => {
    btn.addEventListener('click', () => {
      const bullet = btn.getAttribute('data-add-bullet');
      if (!cvData.experience || cvData.experience.length === 0) {
        cvData.experience.push({
          id: 'exp-' + Date.now(),
          role: 'Enterprise Account Executive',
          company: 'B2B SaaS Corp',
          location: 'Chicago, IL',
          dates: '2022 – Present',
          badge: '145% Quota Attained',
          bullets: bullet
        });
      } else {
        const first = cvData.experience[0];
        first.bullets = (first.bullets ? first.bullets.trim() + '\n' : '') + bullet;
      }
      saveData();
      renderExperienceList();
      renderPreview();
    });
  });

  // CRM pills
  document.querySelectorAll('[data-add-crm]').forEach(btn => {
    btn.addEventListener('click', () => {
      const crm = btn.getAttribute('data-add-crm');
      const el = document.getElementById('inp-crms');
      if (el) {
        const items = el.value.split(',').map(s => s.trim()).filter(Boolean);
        if (!items.includes(crm)) {
          items.push(crm);
          el.value = items.join(', ');
          if (!cvData.skills) cvData.skills = {};
          cvData.skills.crms = el.value;
          saveData();
          renderPreview();
        }
      }
    });
  });

  // Methodologies pills
  document.querySelectorAll('[data-add-meth]').forEach(btn => {
    btn.addEventListener('click', () => {
      const meth = btn.getAttribute('data-add-meth');
      const el = document.getElementById('inp-methodologies');
      if (el) {
        const items = el.value.split(',').map(s => s.trim()).filter(Boolean);
        if (!items.includes(meth)) {
          items.push(meth);
          el.value = items.join(', ');
          if (!cvData.skills) cvData.skills = {};
          cvData.skills.methodologies = el.value;
          saveData();
          renderPreview();
        }
      }
    });
  });

  // Add Item buttons
  document.getElementById('btn-add-exp')?.addEventListener('click', () => {
    cvData.experience.push({
      id: 'exp-' + Date.now(),
      role: '',
      company: '',
      location: '',
      dates: '',
      badge: '',
      bullets: ''
    });
    saveData();
    renderExperienceList();
    renderPreview();
  });

  document.getElementById('btn-add-deal')?.addEventListener('click', () => {
    if (!cvData.deals) cvData.deals = [];
    cvData.deals.push({
      id: 'deal-' + Date.now(),
      title: '',
      value: '',
      solution: '',
      highlights: ''
    });
    saveData();
    renderDealsList();
    renderPreview();
  });

  document.getElementById('btn-add-cert')?.addEventListener('click', () => {
    cvData.certifications.push({
      id: 'cert-' + Date.now(),
      name: '',
      issuer: '',
      year: ''
    });
    saveData();
    renderCertList();
    renderPreview();
  });

  document.getElementById('btn-add-edu')?.addEventListener('click', () => {
    cvData.education.push({
      id: 'edu-' + Date.now(),
      degree: '',
      institution: '',
      year: '',
      honors: ''
    });
    saveData();
    renderEduList();
    renderPreview();
  });
}

// Toolbar actions
function initToolbarActions() {
  document.getElementById('btn-sample-data')?.addEventListener('click', () => {
    cvData = JSON.parse(JSON.stringify(SAMPLE_SALES_CV));
    saveData();
    syncAllInputsFromData();
    renderDynamicLists();
    renderPreview();
  });

  document.getElementById('btn-reset')?.addEventListener('click', () => {
    if (confirm('Are you sure you want to clear this Sales CV?')) {
      cvData = {
        personal: { fullName: '', title: '', email: '', phone: '', location: '', linkedin: '', vertical: '' },
        metrics: { quota: '', revenue: '', deal: '', cycle: '' },
        summary: '',
        experience: [],
        deals: [],
        skills: { crms: '', methodologies: '', competencies: '' },
        certifications: [],
        education: [],
        theme: cvData.theme || 'theme-navy'
      };
      saveData();
      syncAllInputsFromData();
      renderDynamicLists();
      renderPreview();
    }
  });

  document.getElementById('btn-export-json')?.addEventListener('click', () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(cvData, null, 2));
    const dlAnchor = document.createElement('a');
    dlAnchor.setAttribute('href', dataStr);
    dlAnchor.setAttribute('download', `${(cvData.personal?.fullName || 'sales-executive').toLowerCase().replace(/\s+/g, '-')}-cv.json`);
    dlAnchor.click();
  });

  document.getElementById('inp-import-json')?.addEventListener('change', (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const imported = JSON.parse(event.target.result);
        if (imported.personal && imported.skills) {
          cvData = imported;
          saveData();
          syncAllInputsFromData();
          renderDynamicLists();
          renderPreview();
        } else {
          alert('Invalid Sales Executive CV JSON format.');
        }
      } catch (err) {
        alert('Error parsing JSON file: ' + err.message);
      }
    };
    reader.readAsText(file);
  });

  document.getElementById('btn-print-pdf')?.addEventListener('click', () => {
    window.print();
  });
}

function syncAllInputsFromData() {
  const map = {
    'inp-fullname': cvData.personal?.fullName || '',
    'inp-title': cvData.personal?.title || '',
    'inp-email': cvData.personal?.email || '',
    'inp-phone': cvData.personal?.phone || '',
    'inp-location': cvData.personal?.location || '',
    'inp-linkedin': cvData.personal?.linkedin || '',
    'inp-vertical': cvData.personal?.vertical || '',

    'inp-metric-quota': cvData.metrics?.quota || '',
    'inp-metric-revenue': cvData.metrics?.revenue || '',
    'inp-metric-deal': cvData.metrics?.deal || '',
    'inp-metric-cycle': cvData.metrics?.cycle || '',

    'inp-summary': cvData.summary || '',

    'inp-crms': cvData.skills?.crms || '',
    'inp-methodologies': cvData.skills?.methodologies || '',
    'inp-competencies': cvData.skills?.competencies || ''
  };

  Object.entries(map).forEach(([id, val]) => {
    const el = document.getElementById(id);
    if (el) el.value = val;
  });

  const selTheme = document.getElementById('sel-theme');
  if (selTheme) selTheme.value = cvData.theme || 'theme-navy';
}

// Live CV preview renderer
function renderPreview() {
  const sheet = document.getElementById('resume-sheet');
  if (!sheet) return;

  sheet.className = `resume-sheet ${cvData.theme || 'theme-navy'}`;

  const { personal, metrics, summary, experience, deals, skills, certifications, education } = cvData;

  const crmBadges = (skills?.crms || '').split(',').map(s => s.trim()).filter(Boolean);
  const methBadges = (skills?.methodologies || '').split(',').map(s => s.trim()).filter(Boolean);
  const compBadges = (skills?.competencies || '').split(',').map(s => s.trim()).filter(Boolean);

  sheet.innerHTML = `
    <!-- Header -->
    <header class="r-header">
      <div>
        <h1 class="r-name">${escapeHtml(personal?.fullName || 'Full Name')}</h1>
        <div class="r-role">${escapeHtml(personal?.title || 'Sales Executive')}</div>
        ${personal?.vertical ? `<div style="font-size: 0.8rem; color: #64748b; margin-top: 0.2rem; font-weight: 500;">${escapeHtml(personal.vertical)}</div>` : ''}
      </div>
      <div class="r-contact-grid">
        ${personal?.email ? `<div class="r-contact-item"><span>✉</span> ${escapeHtml(personal.email)}</div>` : ''}
        ${personal?.phone ? `<div class="r-contact-item"><span>☎</span> ${escapeHtml(personal.phone)}</div>` : ''}
        ${personal?.location ? `<div class="r-contact-item"><span>📍</span> ${escapeHtml(personal.location)}</div>` : ''}
        ${personal?.linkedin ? `<div class="r-contact-item"><span>🔗</span> ${escapeHtml(personal.linkedin)}</div>` : ''}
      </div>
    </header>

    <!-- Quota Attainment Ribbon -->
    ${(metrics?.quota || metrics?.revenue || metrics?.deal || metrics?.cycle) ? `
      <div class="r-metrics-bar">
        <div class="r-metric-box">
          <span class="r-metric-value">${escapeHtml(metrics.quota || '—')}</span>
          <span class="r-metric-label">Quota Attainment</span>
        </div>
        <div class="r-metric-box">
          <span class="r-metric-value">${escapeHtml(metrics.revenue || '—')}</span>
          <span class="r-metric-label">Closed ARR / TCV</span>
        </div>
        <div class="r-metric-box">
          <span class="r-metric-value">${escapeHtml(metrics.deal || '—')}</span>
          <span class="r-metric-label">Largest Enterprise Deal</span>
        </div>
        <div class="r-metric-box">
          <span class="r-metric-value">${escapeHtml(metrics.cycle || '—')}</span>
          <span class="r-metric-label">Velocity &amp; Win Rate</span>
        </div>
      </div>
    ` : ''}

    <!-- Executive Summary -->
    ${summary ? `
      <section class="r-section">
        <h2 class="r-section-title">Executive Sales Profile</h2>
        <p class="r-summary-text">${escapeHtml(summary)}</p>
      </section>
    ` : ''}

    <!-- Professional Sales Experience -->
    ${experience && experience.length > 0 ? `
      <section class="r-section">
        <h2 class="r-section-title">Enterprise Sales Experience &amp; Quota History</h2>
        ${experience.map(exp => `
          <div class="r-experience-item">
            <div class="r-exp-header">
              <div>
                <span class="r-exp-role">${escapeHtml(exp.role || '')}</span>
                ${exp.company ? `<span class="r-exp-company"> • ${escapeHtml(exp.company)}</span>` : ''}
                ${exp.badge ? `<span class="r-exp-quota-badge">${escapeHtml(exp.badge)}</span>` : ''}
              </div>
              <span class="r-exp-dates">${escapeHtml(exp.dates || '')}</span>
            </div>
            ${exp.bullets ? `
              <ul class="r-bullets">
                ${exp.bullets.split('\n').filter(b => b.trim()).map(b => `<li>${escapeHtml(b.replace(/^[•\-*]\s*/, ''))}</li>`).join('')}
              </ul>
            ` : ''}
          </div>
        `).join('')}
      </section>
    ` : ''}

    <!-- Major Flagship Deals & Marquee Wins -->
    ${deals && deals.length > 0 ? `
      <section class="r-section">
        <h2 class="r-section-title">Flagship Enterprise Deals &amp; Marquee Transactions</h2>
        <div class="r-deals-grid">
          ${deals.map(deal => `
            <div class="r-deal-card">
              <div class="r-deal-card-header">
                <span>${escapeHtml(deal.title || 'Enterprise Account')}</span>
                <span class="r-deal-value">${escapeHtml(deal.value || '')}</span>
              </div>
              ${deal.solution ? `<div style="font-size: 0.76rem; font-weight: 600; color: #334155;">${escapeHtml(deal.solution)}</div>` : ''}
              ${deal.highlights ? `<div class="r-deal-desc">${escapeHtml(deal.highlights)}</div>` : ''}
            </div>
          `).join('')}
        </div>
      </section>
    ` : ''}

    <!-- CRM & Methodologies -->
    ${(crmBadges.length > 0 || methBadges.length > 0 || compBadges.length > 0) ? `
      <section class="r-section">
        <h2 class="r-section-title">Sales Stack, Methodologies &amp; Strategic Skills</h2>
        ${crmBadges.length > 0 ? `
          <div style="margin-bottom: 0.35rem;">
            <span style="font-size: 0.725rem; font-weight: 700; color: #475569; display: block; margin-bottom: 0.15rem;">CRM &amp; SALES ENGAGEMENT TECH:</span>
            <div class="r-badge-list">
              ${crmBadges.map(g => `<span class="r-badge">${escapeHtml(g)}</span>`).join('')}
            </div>
          </div>
        ` : ''}
        ${methBadges.length > 0 ? `
          <div style="margin-bottom: 0.35rem;">
            <span style="font-size: 0.725rem; font-weight: 700; color: #475569; display: block; margin-bottom: 0.15rem;">SALES METHODOLOGIES &amp; FRAMEWORKS:</span>
            <div class="r-badge-list">
              ${methBadges.map(s => `<span class="r-badge">${escapeHtml(s)}</span>`).join('')}
            </div>
          </div>
        ` : ''}
        ${compBadges.length > 0 ? `
          <div>
            <span style="font-size: 0.725rem; font-weight: 700; color: #475569; display: block; margin-bottom: 0.15rem;">STRATEGIC COMMERCIAL COMPETENCIES:</span>
            <div class="r-badge-list">
              ${compBadges.map(o => `<span class="r-badge">${escapeHtml(o)}</span>`).join('')}
            </div>
          </div>
        ` : ''}
      </section>
    ` : ''}

    <!-- Split Grid: Certifications / Awards & Education -->
    <div class="r-columns-split">
      <!-- Awards & Certifications -->
      ${certifications && certifications.length > 0 ? `
        <section class="r-section">
          <h2 class="r-section-title">Honors &amp; Sales Certifications</h2>
          <div style="display: flex; flex-direction: column; gap: 0.4rem;">
            ${certifications.map(c => `
              <div style="font-size: 0.825rem;">
                <div style="font-weight: 700; color: #0f172a;">${escapeHtml(c.name || '')}</div>
                <div style="color: #64748b; font-size: 0.775rem;">
                  ${escapeHtml(c.issuer || '')} ${c.year ? `• ${escapeHtml(c.year)}` : ''}
                </div>
              </div>
            `).join('')}
          </div>
        </section>
      ` : '<div></div>'}

      <!-- Education -->
      ${education && education.length > 0 ? `
        <section class="r-section">
          <h2 class="r-section-title">Education</h2>
          <div style="display: flex; flex-direction: column; gap: 0.4rem;">
            ${education.map(edu => `
              <div style="font-size: 0.825rem;">
                <div style="font-weight: 700; color: #0f172a;">${escapeHtml(edu.degree || '')}</div>
                <div style="color: #475569;">${escapeHtml(edu.institution || '')} ${edu.year ? `• ${escapeHtml(edu.year)}` : ''}</div>
                ${edu.honors ? `<div style="color: #64748b; font-size: 0.75rem;">${escapeHtml(edu.honors)}</div>` : ''}
              </div>
            `).join('')}
          </div>
        </section>
      ` : '<div></div>'}
    </div>
  `;
}