// E-Commerce Store & Marketplace Manager CV Builder
// Client-side Reactive Architecture

const STORAGE_KEY = 'aio_ecomm_cv_data_v1';

const SAMPLE_ECOMMERCE_CV = {
  personal: {
    fullName: 'Marcus Vance',
    title: 'Senior E-Commerce & D2C Growth Director',
    email: 'marcus.vance@growthcommerce.io',
    phone: '+1 (415) 890-2341',
    location: 'Austin, TX (Open to Remote / Hybrid)',
    portfolio: 'marcusvancecommerce.com',
    linkedin: 'linkedin.com/in/marcus-ecomm-growth',
    brandfocus: 'Consumer Tech • D2C Apparel • Health & Wellness'
  },
  metrics: {
    gmv: '$14.5M GMV',
    roas: '4.2x Blended ROAS',
    cvr: '+38% CVR Lift',
    orders: '320K Orders • 4,500 SKUs'
  },
  summary: 'Data-driven E-Commerce Director with 7+ years scaling omnichannel brand revenues from $2M to $15M+ across Shopify Plus, Amazon FBA, and TikTok Shop. Adept at full-funnel paid acquisition, conversion rate optimization (CRO), 3PL supply chain negotiations, and retention marketing yielding a 35% repurchase rate. Proven track record executing seamless platform migrations, reducing customer acquisition cost (CAC), and leading high-velocity marketplace expansions.',
  experience: [
    {
      id: 'exp-1',
      role: 'Head of E-Commerce & Digital Growth',
      company: 'Lumina Lifestyle Brands',
      location: 'Austin, TX',
      dates: '2021 – Present',
      bullets: 'Scaled annual GMV by 140% to $14.5M across flagship Shopify Plus store and Amazon US/EU storefronts within 24 months.\nManaged $4.8M annual digital acquisition budget across Meta Ads, Google Performance Max, and TikTok, maintaining an average blended MER of 4.2x.\nDirected CRO experimentation pipeline across PDP and checkout funnels, lifting baseline conversion rate from 1.95% to 2.82% (+44.6% relative gain).\nSpearheaded migration from legacy Magento to Shopify Plus, reducing annual cloud infrastructure costs by $75,000 and improving mobile page load speed by 2.3 seconds.'
    },
    {
      id: 'exp-2',
      role: 'Senior E-Commerce Marketplace Manager',
      company: 'Apex Consumer Goods Co.',
      location: 'San Francisco, CA',
      dates: '2018 – 2021',
      bullets: 'Managed Amazon Seller Central portfolio of 1,200+ active SKUs, maintaining 86% Buy Box ownership and growing Amazon channel revenue to $6.2M.\nReduced blended Amazon ACoS from 27% to 17.5% through algorithmic bid automation and Helium 10 keyword harvest strategies.\nNegotiated volume freight contracts across 3PL warehouse partners, reducing fulfillment delivery SLAs from 3.8 days to 1.8 days and trimming shipping expenses by $210K.'
    },
    {
      id: 'exp-3',
      role: 'D2C E-Commerce Specialist',
      company: 'Nova Apparel Group',
      location: 'Denver, CO',
      dates: '2016 – 2018',
      bullets: 'Constructed automated Klaviyo email & SMS retention flows generating 32% of total store revenue at zero incremental ad spend.\nImplemented Recharge recurring subscription billing engine, accelerating monthly recurring revenue (MRR) by 85%.'
    }
  ],
  skills: {
    platforms: 'Shopify Plus, Amazon Seller Central (FBA/FBM), WooCommerce, TikTok Shop, Walmart Marketplace, BigCommerce, Adobe Commerce',
    growth: 'Conversion Rate Optimization (CRO), Blended ROAS / MER Modeling, Paid Acquisition (Meta & PMax), A/B Testing, AOV Expansion & Bundling, 3PL Fulfillment Management, LTV/CAC Optimization',
    apps: 'Klaviyo, Google Analytics 4 (GA4), Triple Whale, Recharge Subscriptions, Gorgias Helpdesk, Helium 10, ShipBob 3PL, Hotjar'
  },
  certifications: [
    {
      id: 'cert-1',
      name: 'Shopify Plus Certified Partner & Merchant Specialist',
      issuer: 'Shopify Academy',
      year: '2021 / Active'
    },
    {
      id: 'cert-2',
      name: 'Amazon Ads Sponsored Ads Advanced Certification',
      issuer: 'Amazon Advertising',
      year: '2022'
    },
    {
      id: 'cert-3',
      name: 'Google Ads Search & Measurement Certified',
      issuer: 'Google Skillshop',
      year: '2023'
    },
    {
      id: 'cert-4',
      name: 'Klaviyo Product & Email Marketing Master',
      issuer: 'Klaviyo Academy',
      year: '2020'
    }
  ],
  education: [
    {
      id: 'edu-1',
      degree: 'B.S. in Marketing & Data Analytics',
      institution: 'University of Texas at Austin',
      year: '2016',
      honors: 'Summa Cum Laude • McCombs E-Commerce Guild Lead'
    }
  ],
  languages: 'English (Native), Spanish (Professional Working)',
  theme: 'theme-emerald'
};

let cvData = loadData();

function loadData() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (e) {
    console.warn('Unable to load e-commerce CV data from localStorage', e);
  }
  return JSON.parse(JSON.stringify(SAMPLE_ECOMMERCE_CV));
}

function saveData() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(cvData));
  } catch (e) {
    console.warn('Unable to save e-commerce CV data', e);
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
    'inp-portfolio': ['personal', 'portfolio'],
    'inp-linkedin': ['personal', 'linkedin'],
    'inp-brandfocus': ['personal', 'brandfocus'],

    'inp-metric-gmv': ['metrics', 'gmv'],
    'inp-metric-roas': ['metrics', 'roas'],
    'inp-metric-cvr': ['metrics', 'cvr'],
    'inp-metric-orders': ['metrics', 'orders'],

    'inp-summary': ['summary'],

    'inp-platforms': ['skills', 'platforms'],
    'inp-growth-skills': ['skills', 'growth'],
    'inp-apps-stack': ['skills', 'apps'],

    'inp-languages': ['languages']
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
    selTheme.value = cvData.theme || 'theme-emerald';
    selTheme.addEventListener('change', (e) => {
      cvData.theme = e.target.value;
      saveData();
      renderPreview();
    });
  }
}

// Dynamic Lists (Experience, Certs, Edu)
function renderDynamicLists() {
  renderExperienceList();
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
        <span class="item-title">Position #${index + 1}: ${escapeHtml(item.role || 'New Role')}</span>
        <button type="button" class="btn-remove" data-remove-exp="${item.id}">Remove</button>
      </div>
      <div class="form-row two-cols">
        <div class="form-group">
          <label>Job Title</label>
          <input type="text" class="form-input" data-exp-field="role" value="${escapeHtml(item.role || '')}" placeholder="e.g. Head of E-Commerce">
        </div>
        <div class="form-group">
          <label>Company / Brand Name</label>
          <input type="text" class="form-input" data-exp-field="company" value="${escapeHtml(item.company || '')}" placeholder="e.g. Lumina Lifestyle">
        </div>
      </div>
      <div class="form-row two-cols">
        <div class="form-group">
          <label>Location / Remote</label>
          <input type="text" class="form-input" data-exp-field="location" value="${escapeHtml(item.location || '')}" placeholder="e.g. Austin, TX">
        </div>
        <div class="form-group">
          <label>Employment Period</label>
          <input type="text" class="form-input" data-exp-field="dates" value="${escapeHtml(item.dates || '')}" placeholder="e.g. 2021 – Present">
        </div>
      </div>
      <div class="form-group">
        <label>Growth Wins &amp; Metric-Driven Bullets (One per line)</label>
        <textarea class="form-textarea" data-exp-field="bullets" rows="4" placeholder="Highlight GMV scaled, ROAS lifted, CVR gains, and 3PL optimizations...">${escapeHtml(item.bullets || '')}</textarea>
      </div>
    `;

    card.querySelectorAll('[data-exp-field]').forEach(input => {
      input.addEventListener('input', (e) => {
        const field = e.target.getAttribute('data-exp-field');
        item[field] = e.target.value;
        if (field === 'role') {
          const titleSpan = card.querySelector('.item-title');
          if (titleSpan) titleSpan.textContent = `Position #${index + 1}: ${e.target.value || 'New Role'}`;
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

function renderCertList() {
  const container = document.getElementById('cert-container');
  if (!container) return;
  container.innerHTML = '';

  cvData.certifications.forEach((item, index) => {
    const card = document.createElement('div');
    card.className = 'dynamic-item-card';
    card.innerHTML = `
      <div class="item-header">
        <span class="item-title">Certification #${index + 1}</span>
        <button type="button" class="btn-remove" data-remove-cert="${item.id}">Remove</button>
      </div>
      <div class="form-row two-cols">
        <div class="form-group">
          <label>Certification Name</label>
          <input type="text" class="form-input" data-cert-field="name" value="${escapeHtml(item.name || '')}" placeholder="e.g. Shopify Plus Certified Partner">
        </div>
        <div class="form-group">
          <label>Issuing Organization</label>
          <input type="text" class="form-input" data-cert-field="issuer" value="${escapeHtml(item.issuer || '')}" placeholder="e.g. Shopify Academy">
        </div>
      </div>
      <div class="form-group">
        <label>Year Acquired / Status</label>
        <input type="text" class="form-input" data-cert-field="year" value="${escapeHtml(item.year || '')}" placeholder="e.g. 2021 / Active">
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
          <input type="text" class="form-input" data-edu-field="degree" value="${escapeHtml(item.degree || '')}" placeholder="e.g. B.S. in Marketing &amp; Analytics">
        </div>
        <div class="form-group">
          <label>Institution / University</label>
          <input type="text" class="form-input" data-edu-field="institution" value="${escapeHtml(item.institution || '')}" placeholder="e.g. UT Austin">
        </div>
      </div>
      <div class="form-row two-cols">
        <div class="form-group">
          <label>Graduation Year</label>
          <input type="text" class="form-input" data-edu-field="year" value="${escapeHtml(item.year || '')}" placeholder="e.g. 2016">
        </div>
        <div class="form-group">
          <label>Honors / Highlights</label>
          <input type="text" class="form-input" data-edu-field="honors" value="${escapeHtml(item.honors || '')}" placeholder="e.g. Summa Cum Laude">
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

  // Bullet preset pills - appends to first position or creates one
  document.querySelectorAll('[data-add-bullet]').forEach(btn => {
    btn.addEventListener('click', () => {
      const bullet = btn.getAttribute('data-add-bullet');
      if (!cvData.experience || cvData.experience.length === 0) {
        cvData.experience.push({
          id: 'exp-' + Date.now(),
          role: 'E-Commerce Manager',
          company: 'D2C Brand',
          location: 'Remote',
          dates: '2022 – Present',
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

  // Platform pills
  document.querySelectorAll('[data-add-plat]').forEach(btn => {
    btn.addEventListener('click', () => {
      const plat = btn.getAttribute('data-add-plat');
      const el = document.getElementById('inp-platforms');
      if (el) {
        const items = el.value.split(',').map(s => s.trim()).filter(Boolean);
        if (!items.includes(plat)) {
          items.push(plat);
          el.value = items.join(', ');
          if (!cvData.skills) cvData.skills = {};
          cvData.skills.platforms = el.value;
          saveData();
          renderPreview();
        }
      }
    });
  });

  // Growth skills pills
  document.querySelectorAll('[data-add-growth]').forEach(btn => {
    btn.addEventListener('click', () => {
      const skill = btn.getAttribute('data-add-growth');
      const el = document.getElementById('inp-growth-skills');
      if (el) {
        const items = el.value.split(',').map(s => s.trim()).filter(Boolean);
        if (!items.includes(skill)) {
          items.push(skill);
          el.value = items.join(', ');
          if (!cvData.skills) cvData.skills = {};
          cvData.skills.growth = el.value;
          saveData();
          renderPreview();
        }
      }
    });
  });

  // App SaaS pills
  document.querySelectorAll('[data-add-app]').forEach(btn => {
    btn.addEventListener('click', () => {
      const app = btn.getAttribute('data-add-app');
      const el = document.getElementById('inp-apps-stack');
      if (el) {
        const items = el.value.split(',').map(s => s.trim()).filter(Boolean);
        if (!items.includes(app)) {
          items.push(app);
          el.value = items.join(', ');
          if (!cvData.skills) cvData.skills = {};
          cvData.skills.apps = el.value;
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
      bullets: ''
    });
    saveData();
    renderExperienceList();
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

// Toolbar action buttons (Sample, Reset, JSON Export/Import, Print)
function initToolbarActions() {
  document.getElementById('btn-sample-data')?.addEventListener('click', () => {
    cvData = JSON.parse(JSON.stringify(SAMPLE_ECOMMERCE_CV));
    saveData();
    syncAllInputsFromData();
    renderDynamicLists();
    renderPreview();
  });

  document.getElementById('btn-reset')?.addEventListener('click', () => {
    if (confirm('Are you sure you want to clear this E-Commerce CV?')) {
      cvData = {
        personal: { fullName: '', title: '', email: '', phone: '', location: '', portfolio: '', linkedin: '', brandfocus: '' },
        metrics: { gmv: '', roas: '', cvr: '', orders: '' },
        summary: '',
        experience: [],
        skills: { platforms: '', growth: '', apps: '' },
        certifications: [],
        education: [],
        languages: '',
        theme: cvData.theme || 'theme-emerald'
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
    dlAnchor.setAttribute('download', `${(cvData.personal?.fullName || 'ecommerce-manager').toLowerCase().replace(/\s+/g, '-')}-cv.json`);
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
          alert('Invalid E-Commerce CV JSON format.');
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
    'inp-portfolio': cvData.personal?.portfolio || '',
    'inp-linkedin': cvData.personal?.linkedin || '',
    'inp-brandfocus': cvData.personal?.brandfocus || '',

    'inp-metric-gmv': cvData.metrics?.gmv || '',
    'inp-metric-roas': cvData.metrics?.roas || '',
    'inp-metric-cvr': cvData.metrics?.cvr || '',
    'inp-metric-orders': cvData.metrics?.orders || '',

    'inp-summary': cvData.summary || '',

    'inp-platforms': cvData.skills?.platforms || '',
    'inp-growth-skills': cvData.skills?.growth || '',
    'inp-apps-stack': cvData.skills?.apps || '',

    'inp-languages': cvData.languages || ''
  };

  Object.entries(map).forEach(([id, val]) => {
    const el = document.getElementById(id);
    if (el) el.value = val;
  });

  const selTheme = document.getElementById('sel-theme');
  if (selTheme) selTheme.value = cvData.theme || 'theme-emerald';
}

// Live CV preview renderer
function renderPreview() {
  const sheet = document.getElementById('resume-sheet');
  if (!sheet) return;

  sheet.className = `resume-sheet ${cvData.theme || 'theme-emerald'}`;

  const { personal, metrics, summary, experience, skills, certifications, education, languages } = cvData;

  const platBadges = (skills?.platforms || '').split(',').map(s => s.trim()).filter(Boolean);
  const growthBadges = (skills?.growth || '').split(',').map(s => s.trim()).filter(Boolean);
  const appBadges = (skills?.apps || '').split(',').map(s => s.trim()).filter(Boolean);

  sheet.innerHTML = `
    <!-- Header -->
    <header class="r-header">
      <div>
        <h1 class="r-name">${escapeHtml(personal?.fullName || 'Full Name')}</h1>
        <div class="r-role">${escapeHtml(personal?.title || 'E-Commerce Manager')}</div>
        ${personal?.brandfocus ? `<div style="font-size: 0.8rem; color: #64748b; margin-top: 0.2rem; font-weight: 500;">${escapeHtml(personal.brandfocus)}</div>` : ''}
      </div>
      <div class="r-contact-grid">
        ${personal?.email ? `<div class="r-contact-item"><span>✉</span> ${escapeHtml(personal.email)}</div>` : ''}
        ${personal?.phone ? `<div class="r-contact-item"><span>☎</span> ${escapeHtml(personal.phone)}</div>` : ''}
        ${personal?.location ? `<div class="r-contact-item"><span>📍</span> ${escapeHtml(personal.location)}</div>` : ''}
        ${personal?.portfolio ? `<div class="r-contact-item"><span>🌐</span> ${escapeHtml(personal.portfolio)}</div>` : ''}
        ${personal?.linkedin ? `<div class="r-contact-item"><span>🔗</span> ${escapeHtml(personal.linkedin)}</div>` : ''}
      </div>
    </header>

    <!-- Key E-Commerce Metrics Ribbon -->
    ${(metrics?.gmv || metrics?.roas || metrics?.cvr || metrics?.orders) ? `
      <div class="r-metrics-bar">
        <div class="r-metric-box">
          <span class="r-metric-value">${escapeHtml(metrics.gmv || '—')}</span>
          <span class="r-metric-label">Annual GMV Managed</span>
        </div>
        <div class="r-metric-box">
          <span class="r-metric-value">${escapeHtml(metrics.roas || '—')}</span>
          <span class="r-metric-label">Blended ROAS / MER</span>
        </div>
        <div class="r-metric-box">
          <span class="r-metric-value">${escapeHtml(metrics.cvr || '—')}</span>
          <span class="r-metric-label">Conversion Rate Lift</span>
        </div>
        <div class="r-metric-box">
          <span class="r-metric-value">${escapeHtml(metrics.orders || '—')}</span>
          <span class="r-metric-label">Catalog &amp; Volumes</span>
        </div>
      </div>
    ` : ''}

    <!-- Executive Summary -->
    ${summary ? `
      <section class="r-section">
        <h2 class="r-section-title">Executive E-Commerce Profile</h2>
        <p class="r-summary-text">${escapeHtml(summary)}</p>
      </section>
    ` : ''}

    <!-- Professional Experience -->
    ${experience && experience.length > 0 ? `
      <section class="r-section">
        <h2 class="r-section-title">E-Commerce &amp; Marketplace Experience</h2>
        ${experience.map(exp => `
          <div class="r-experience-item">
            <div class="r-exp-header">
              <div>
                <span class="r-exp-role">${escapeHtml(exp.role || '')}</span>
                ${exp.company ? `<span class="r-exp-company"> • ${escapeHtml(exp.company)}</span>` : ''}
                ${exp.location ? `<span style="color: #64748b; font-size: 0.8rem;"> (${escapeHtml(exp.location)})</span>` : ''}
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

    <!-- Platforms & Technical Skills -->
    ${(platBadges.length > 0 || growthBadges.length > 0 || appBadges.length > 0) ? `
      <section class="r-section">
        <h2 class="r-section-title">Platforms &amp; Digital Commerce Stack</h2>
        ${platBadges.length > 0 ? `
          <div style="margin-bottom: 0.35rem;">
            <span style="font-size: 0.725rem; font-weight: 700; color: #475569; display: block; margin-bottom: 0.15rem;">PLATFORMS &amp; MARKETPLACES:</span>
            <div class="r-badge-list">
              ${platBadges.map(g => `<span class="r-badge">${escapeHtml(g)}</span>`).join('')}
            </div>
          </div>
        ` : ''}
        ${growthBadges.length > 0 ? `
          <div style="margin-bottom: 0.35rem;">
            <span style="font-size: 0.725rem; font-weight: 700; color: #475569; display: block; margin-bottom: 0.15rem;">GROWTH, CRO &amp; SUPPLY CHAIN:</span>
            <div class="r-badge-list">
              ${growthBadges.map(s => `<span class="r-badge">${escapeHtml(s)}</span>`).join('')}
            </div>
          </div>
        ` : ''}
        ${appBadges.length > 0 ? `
          <div>
            <span style="font-size: 0.725rem; font-weight: 700; color: #475569; display: block; margin-bottom: 0.15rem;">ECOMMERCE SAAS &amp; ANALYTICS:</span>
            <div class="r-badge-list">
              ${appBadges.map(o => `<span class="r-badge">${escapeHtml(o)}</span>`).join('')}
            </div>
          </div>
        ` : ''}
      </section>
    ` : ''}

    <!-- Split Grid: Certifications & Education -->
    <div class="r-columns-split">
      <!-- Certifications -->
      ${certifications && certifications.length > 0 ? `
        <section class="r-section">
          <h2 class="r-section-title">Certifications &amp; Credentials</h2>
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

      <!-- Education & Languages -->
      <section class="r-section">
        ${education && education.length > 0 ? `
          <h2 class="r-section-title">Education</h2>
          <div style="display: flex; flex-direction: column; gap: 0.4rem; margin-bottom: 0.5rem;">
            ${education.map(edu => `
              <div style="font-size: 0.825rem;">
                <div style="font-weight: 700; color: #0f172a;">${escapeHtml(edu.degree || '')}</div>
                <div style="color: #475569;">${escapeHtml(edu.institution || '')} ${edu.year ? `• ${escapeHtml(edu.year)}` : ''}</div>
                ${edu.honors ? `<div style="color: #64748b; font-size: 0.75rem;">${escapeHtml(edu.honors)}</div>` : ''}
              </div>
            `).join('')}
          </div>
        ` : ''}

        ${languages ? `
          <h2 class="r-section-title" style="margin-top: 0.5rem;">Languages</h2>
          <div style="font-size: 0.825rem; color: #334155;">${escapeHtml(languages)}</div>
        ` : ''}
      </section>
    </div>
  `;
}