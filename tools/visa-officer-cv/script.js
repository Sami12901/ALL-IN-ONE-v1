// Visa Processing Officer & Immigration Consultant CV Builder
// Client-side Reactive Architecture

const STORAGE_KEY = 'aio_visa_cv_data_v1';

const SAMPLE_VISA_CV = {
  personal: {
    fullName: 'Elena Rostova, RCIC',
    title: 'Senior Visa Processing Officer & Immigration Consultant',
    email: 'elena.rostova@example.com',
    phone: '+44 20 7946 0912',
    location: 'London, UK (Open to Hybrid / Relocation)',
    regno: 'RCIC #R532109 • OISC Ref: F20190014',
    linkedin: 'linkedin.com/in/elena-rostova-visa',
    website: 'rostovaimmigration.co.uk'
  },
  metrics: {
    cases: '7,400+ Files',
    approval: '98.7% Clean Grant',
    appeals: '195+ Overturns',
    jurisdictions: 'UK • Schengen • US • Canada'
  },
  summary: 'High-caliber Visa Documentation Specialist and Immigration Case Manager with 8+ years guiding high-net-worth clients, corporate relocations, and academic cohorts through Schengen, UKVI, US, and Canadian consular systems. Processed over 7,400 visa dossiers with a 98.7% clean grant rate. Renowned for zero-error forensic document authentication, anti-fraud compliance, VFS/TLS biometrics scheduling, and drafting persuasive Statements of Purpose that overturned 195+ prior refusals.',
  experience: [
    {
      id: 'exp-1',
      role: 'Lead Visa Processing Officer',
      company: 'Apex Global Mobility & Consular Services',
      location: 'London, UK',
      dates: '2021 – Present',
      bullets: 'Direct a high-volume team managing 1,800+ annual visa dossiers across Schengen (France, Germany, Italy), UK Points-Based System, and US B1/B2/F-1 categories.\nConduct rigorous anti-fraud document verification, bank statement forensics, and tax return audits to ensure 100% compliance with diplomatic missions.\nSpearheaded administrative review appeals, successfully reversing 84 consular refusals through evidence bundles and structured legal representations.'
    },
    {
      id: 'exp-2',
      role: 'Senior Immigration Documentation Case Manager',
      company: 'Diplomatic Visa Solutions Ltd',
      location: 'Manchester, UK',
      dates: '2017 – 2021',
      bullets: 'Managed corporate intra-company transfers (ICT), skilled worker applications, and family reunion visas across UKVI and EU member state portals.\nStreamlined biometric appointment procurement via VFS Global, TLScontact, and BLS, reducing applicant wait times by 40%.\nMaintained flawless data protection hygiene in compliance with GDPR and consular confidentiality protocols.'
    },
    {
      id: 'exp-3',
      role: 'Visa Processing Specialist',
      company: 'Global Gateway Visa Agency',
      location: 'Birmingham, UK',
      dates: '2015 – 2017',
      bullets: 'Prepared 2,200+ visitor and student visa dossiers for Canada (IRCC GCKey) and Australia (ImmiAccount) with a 98.4% first-time approval rate.\nProvided structured mock consular interview coaching for first-time applicants, achieving zero refusal on consular interview grounds.'
    }
  ],
  skills: {
    portals: 'CEAC US Portal (DS-160/260), VFS Global Enterprise, TLScontact Portal, IRCC GCKey, UKVI Access Portal, BLS International, ImmiAccount Australia, Saudi Muqeem & Enjaz',
    jurisdictions: 'Schengen Type C & D (France, Germany, Spain, Italy), UK Skilled Worker & Visitor, US B1/B2 & F-1/H-1B, Canada Express Entry & Study Permits, Gulf GCC eVisas, Australia Subclass 500/600',
    legal: 'Document Verification & Forensic Audit, Refusal Review & Administrative Appeal, Financial Sponsor Affidavit Analysis, Statement of Purpose (SOP) Drafting, Consular Liaison & Interview Prep'
  },
  certifications: [
    {
      id: 'cert-1',
      name: 'Regulated Canadian Immigration Consultant (RCIC)',
      issuer: 'College of Immigration and Citizenship Consultants (CICC)',
      year: '2019'
    },
    {
      id: 'cert-2',
      name: 'OISC Level 2 Immigration & Asylum Accreditation',
      issuer: 'Office of the Immigration Services Commissioner',
      year: '2017'
    },
    {
      id: 'cert-3',
      name: 'Consular Document Verification & Anti-Fraud Diploma',
      issuer: 'International Migration Institute',
      year: '2018'
    },
    {
      id: 'cert-4',
      name: 'Certified Schengen Visa Protocols Specialist',
      issuer: 'European Consular Training Academy',
      year: '2016'
    }
  ],
  education: [
    {
      id: 'edu-1',
      degree: 'Bachelor of Laws (LL.B.) in International Law',
      institution: 'University of London',
      year: '2015',
      honors: 'First Class Honours • Consular Law Society Lead'
    }
  ],
  languages: 'English (Fluent / Legal Drafting), French (Professional Working), Russian (Native), Arabic (Conversational)',
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
    console.warn('Unable to load visa CV data from localStorage', e);
  }
  return JSON.parse(JSON.stringify(SAMPLE_VISA_CV));
}

function saveData() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(cvData));
  } catch (e) {
    console.warn('Unable to save visa CV data', e);
  }
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
    'inp-regno': ['personal', 'regno'],
    'inp-linkedin': ['personal', 'linkedin'],
    'inp-website': ['personal', 'website'],
    'inp-metric-cases': ['metrics', 'cases'],
    'inp-metric-approval': ['metrics', 'approval'],
    'inp-metric-appeals': ['metrics', 'appeals'],
    'inp-metric-jurisdictions': ['metrics', 'jurisdictions'],
    'inp-summary': ['summary'],
    'inp-portals': ['skills', 'portals'],
    'inp-jurisdictions-list': ['skills', 'jurisdictions'],
    'inp-legal-skills': ['skills', 'legal'],
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
    selTheme.value = cvData.theme || 'theme-navy';
    selTheme.addEventListener('change', (e) => {
      cvData.theme = e.target.value;
      saveData();
      renderPreview();
    });
  }
}

// Render dynamic lists (Experience, Certs, Edu)
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
        <span class="item-title">Position #${index + 1}: ${item.role || 'New Role'}</span>
        <button type="button" class="btn-remove" data-remove-exp="${item.id}">Remove</button>
      </div>
      <div class="form-row two-cols">
        <div class="form-group">
          <label>Job Title / Role</label>
          <input type="text" class="form-input" data-exp-field="role" value="${escapeHtml(item.role || '')}" placeholder="e.g. Senior Visa Processing Officer">
        </div>
        <div class="form-group">
          <label>Agency / Organization / Embassy</label>
          <input type="text" class="form-input" data-exp-field="company" value="${escapeHtml(item.company || '')}" placeholder="e.g. Apex Global Mobility">
        </div>
      </div>
      <div class="form-row two-cols">
        <div class="form-group">
          <label>Location</label>
          <input type="text" class="form-input" data-exp-field="location" value="${escapeHtml(item.location || '')}" placeholder="e.g. London, UK">
        </div>
        <div class="form-group">
          <label>Period / Dates</label>
          <input type="text" class="form-input" data-exp-field="dates" value="${escapeHtml(item.dates || '')}" placeholder="e.g. 2021 – Present">
        </div>
      </div>
      <div class="form-group">
        <label>Caseload Achievements &amp; Compliance (One per line)</label>
        <textarea class="form-textarea" style="min-height: 80px;" data-exp-field="bullets" placeholder="• Highlight dossier count, approval rates, appeals won, compliance records...">${escapeHtml(item.bullets || '')}</textarea>
      </div>
    `;

    card.querySelectorAll('[data-exp-field]').forEach(input => {
      input.addEventListener('input', (e) => {
        const field = e.target.getAttribute('data-exp-field');
        item[field] = e.target.value;
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
          <label>Certification / Accreditation Name</label>
          <input type="text" class="form-input" data-cert-field="name" value="${escapeHtml(item.name || '')}" placeholder="e.g. RCIC / OISC Level 2">
        </div>
        <div class="form-group">
          <label>Issuing Authority / Body</label>
          <input type="text" class="form-input" data-cert-field="issuer" value="${escapeHtml(item.issuer || '')}" placeholder="e.g. CICC / Home Office">
        </div>
      </div>
      <div class="form-group">
        <label>Year / Status</label>
        <input type="text" class="form-input" data-cert-field="year" value="${escapeHtml(item.year || '')}" placeholder="e.g. 2019 / In Good Standing">
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
          <input type="text" class="form-input" data-edu-field="degree" value="${escapeHtml(item.degree || '')}" placeholder="e.g. LL.B. International Law">
        </div>
        <div class="form-group">
          <label>Institution / University</label>
          <input type="text" class="form-input" data-edu-field="institution" value="${escapeHtml(item.institution || '')}" placeholder="e.g. University of London">
        </div>
      </div>
      <div class="form-row two-cols">
        <div class="form-group">
          <label>Year</label>
          <input type="text" class="form-input" data-edu-field="year" value="${escapeHtml(item.year || '')}" placeholder="e.g. 2015">
        </div>
        <div class="form-group">
          <label>Honors / Specialization</label>
          <input type="text" class="form-input" data-edu-field="honors" value="${escapeHtml(item.honors || '')}" placeholder="e.g. First Class Honours">
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

// Preset helpers
function initPresets() {
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

  document.querySelectorAll('[data-add-portal]').forEach(btn => {
    btn.addEventListener('click', () => {
      const portal = btn.getAttribute('data-add-portal');
      const el = document.getElementById('inp-portals');
      if (el) {
        const items = el.value.split(',').map(s => s.trim()).filter(Boolean);
        if (!items.includes(portal)) {
          items.push(portal);
          el.value = items.join(', ');
          cvData.skills.portals = el.value;
          saveData();
          renderPreview();
        }
      }
    });
  });

  document.querySelectorAll('[data-add-jurisdiction]').forEach(btn => {
    btn.addEventListener('click', () => {
      const jur = btn.getAttribute('data-add-jurisdiction');
      const el = document.getElementById('inp-jurisdictions-list');
      if (el) {
        const items = el.value.split(',').map(s => s.trim()).filter(Boolean);
        if (!items.includes(jur)) {
          items.push(jur);
          el.value = items.join(', ');
          cvData.skills.jurisdictions = el.value;
          saveData();
          renderPreview();
        }
      }
    });
  });

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

function initToolbarActions() {
  document.getElementById('btn-sample-data')?.addEventListener('click', () => {
    cvData = JSON.parse(JSON.stringify(SAMPLE_VISA_CV));
    saveData();
    syncAllInputsFromData();
    renderDynamicLists();
    renderPreview();
  });

  document.getElementById('btn-reset')?.addEventListener('click', () => {
    if (confirm('Are you sure you want to clear this CV?')) {
      cvData = {
        personal: { fullName: '', title: '', email: '', phone: '', location: '', regno: '', linkedin: '', website: '' },
        metrics: { cases: '', approval: '', appeals: '', jurisdictions: '' },
        summary: '',
        experience: [],
        skills: { portals: '', jurisdictions: '', legal: '' },
        certifications: [],
        education: [],
        languages: '',
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
    dlAnchor.setAttribute('download', `${(cvData.personal.fullName || 'visa-officer').toLowerCase().replace(/\s+/g, '-')}-cv.json`);
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
          alert('Invalid Visa Officer CV JSON structure.');
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
    'inp-regno': cvData.personal?.regno || '',
    'inp-linkedin': cvData.personal?.linkedin || '',
    'inp-website': cvData.personal?.website || '',
    'inp-metric-cases': cvData.metrics?.cases || '',
    'inp-metric-approval': cvData.metrics?.approval || '',
    'inp-metric-appeals': cvData.metrics?.appeals || '',
    'inp-metric-jurisdictions': cvData.metrics?.jurisdictions || '',
    'inp-summary': cvData.summary || '',
    'inp-portals': cvData.skills?.portals || '',
    'inp-jurisdictions-list': cvData.skills?.jurisdictions || '',
    'inp-legal-skills': cvData.skills?.legal || '',
    'inp-languages': cvData.languages || ''
  };

  Object.entries(map).forEach(([id, val]) => {
    const el = document.getElementById(id);
    if (el) el.value = val;
  });

  const selTheme = document.getElementById('sel-theme');
  if (selTheme) selTheme.value = cvData.theme || 'theme-navy';
}

function renderPreview() {
  const sheet = document.getElementById('resume-sheet');
  if (!sheet) return;

  sheet.className = `resume-sheet ${cvData.theme || 'theme-navy'}`;

  const { personal, metrics, summary, experience, skills, certifications, education, languages } = cvData;

  const portalBadges = (skills?.portals || '').split(',').map(s => s.trim()).filter(Boolean);
  const jurBadges = (skills?.jurisdictions || '').split(',').map(s => s.trim()).filter(Boolean);
  const legalBadges = (skills?.legal || '').split(',').map(s => s.trim()).filter(Boolean);

  sheet.innerHTML = `
    <!-- Header -->
    <header class="r-header">
      <div>
        <h1 class="r-name">${escapeHtml(personal?.fullName || 'Full Name')}</h1>
        <div class="r-role">${escapeHtml(personal?.title || 'Visa Processing Officer')}</div>
        ${personal?.regno ? `<div style="font-size: 0.8rem; font-weight: 600; color: #64748b; margin-top: 0.2rem;">${escapeHtml(personal.regno)}</div>` : ''}
      </div>
      <div class="r-contact-grid">
        ${personal?.email ? `<div class="r-contact-item"><span>✉</span> ${escapeHtml(personal.email)}</div>` : ''}
        ${personal?.phone ? `<div class="r-contact-item"><span>☎</span> ${escapeHtml(personal.phone)}</div>` : ''}
        ${personal?.location ? `<div class="r-contact-item"><span>📍</span> ${escapeHtml(personal.location)}</div>` : ''}
        ${personal?.linkedin ? `<div class="r-contact-item"><span>🔗</span> ${escapeHtml(personal.linkedin)}</div>` : ''}
        ${personal?.website ? `<div class="r-contact-item"><span>🌐</span> ${escapeHtml(personal.website)}</div>` : ''}
      </div>
    </header>

    <!-- Executive Caseload Metric Callout Cards -->
    ${(metrics?.cases || metrics?.approval || metrics?.appeals || metrics?.jurisdictions) ? `
      <div class="r-metrics-bar">
        <div class="r-metric-box">
          <div class="r-metric-value">${escapeHtml(metrics.cases || '—')}</div>
          <div class="r-metric-label">Applications Handled</div>
        </div>
        <div class="r-metric-box">
          <div class="r-metric-value">${escapeHtml(metrics.approval || '—')}</div>
          <div class="r-metric-label">Clean Grant Rate</div>
        </div>
        <div class="r-metric-box">
          <div class="r-metric-value">${escapeHtml(metrics.appeals || '—')}</div>
          <div class="r-metric-label">Appeals Overturned</div>
        </div>
        <div class="r-metric-box">
          <div class="r-metric-value" style="font-size: 0.95rem; font-weight: 700; padding-top: 0.25rem;">${escapeHtml(metrics.jurisdictions || '—')}</div>
          <div class="r-metric-label">Jurisdictions</div>
        </div>
      </div>
    ` : ''}

    <!-- Executive Summary -->
    ${summary ? `
      <section class="r-section">
        <h2 class="r-section-title">Consular Profile &amp; Immigration Overview</h2>
        <p class="r-summary-text">${escapeHtml(summary)}</p>
      </section>
    ` : ''}

    <!-- Experience -->
    ${experience && experience.length > 0 ? `
      <section class="r-section">
        <h2 class="r-section-title">Immigration &amp; Consular Experience</h2>
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

    <!-- Jurisdictions & Portals -->
    ${(portalBadges.length > 0 || jurBadges.length > 0 || legalBadges.length > 0) ? `
      <section class="r-section">
        <h2 class="r-section-title">Embassy Portals &amp; Jurisdictional Mastery</h2>
        ${jurBadges.length > 0 ? `
          <div style="margin-bottom: 0.4rem;">
            <span style="font-size: 0.75rem; font-weight: 700; color: #475569; display: block; margin-bottom: 0.2rem;">VISA JURISDICTIONS &amp; CATEGORIES:</span>
            <div class="r-badge-list">
              ${jurBadges.map(j => `<span class="r-badge">${escapeHtml(j)}</span>`).join('')}
            </div>
          </div>
        ` : ''}
        ${portalBadges.length > 0 ? `
          <div style="margin-bottom: 0.4rem;">
            <span style="font-size: 0.75rem; font-weight: 700; color: #475569; display: block; margin-bottom: 0.2rem;">EMBASSY PORTALS &amp; BIOMETRIC SYSTEMS:</span>
            <div class="r-badge-list">
              ${portalBadges.map(p => `<span class="r-badge">${escapeHtml(p)}</span>`).join('')}
            </div>
          </div>
        ` : ''}
        ${legalBadges.length > 0 ? `
          <div>
            <span style="font-size: 0.75rem; font-weight: 700; color: #475569; display: block; margin-bottom: 0.2rem;">COMPLIANCE &amp; LEGAL ADVISORY:</span>
            <div class="r-badge-list">
              ${legalBadges.map(l => `<span class="r-badge">${escapeHtml(l)}</span>`).join('')}
            </div>
          </div>
        ` : ''}
      </section>
    ` : ''}

    <!-- Two-column: Certifications & Education -->
    <div class="r-columns-split">
      <section class="r-section">
        <h2 class="r-section-title">Regulatory Accreditations</h2>
        ${certifications && certifications.length > 0 ? `
          <div style="display: flex; flex-direction: column; gap: 0.4rem;">
            ${certifications.map(c => `
              <div style="font-size: 0.8rem;">
                <div style="font-weight: 700; color: #0f172a;">${escapeHtml(c.name || '')}</div>
                <div style="color: #64748b; font-size: 0.75rem;">${escapeHtml(c.issuer || '')} ${c.year ? `(${escapeHtml(c.year)})` : ''}</div>
              </div>
            `).join('')}
          </div>
        ` : '<div style="font-size: 0.75rem; color: #94a3b8;">None added</div>'}
      </section>

      <section class="r-section">
        <h2 class="r-section-title">Education &amp; Languages</h2>
        ${education && education.length > 0 ? `
          <div style="display: flex; flex-direction: column; gap: 0.4rem; margin-bottom: 0.5rem;">
            ${education.map(e => `
              <div style="font-size: 0.8rem;">
                <div style="font-weight: 700; color: #0f172a;">${escapeHtml(e.degree || '')}</div>
                <div style="color: #64748b; font-size: 0.75rem;">${escapeHtml(e.institution || '')} ${e.year ? `• ${escapeHtml(e.year)}` : ''}</div>
                ${e.honors ? `<div style="color: #475569; font-size: 0.72rem;">${escapeHtml(e.honors)}</div>` : ''}
              </div>
            `).join('')}
          </div>
        ` : ''}
        ${languages ? `
          <div style="font-size: 0.78rem; border-top: 1px dashed #cbd5e1; padding-top: 0.4rem; margin-top: 0.2rem;">
            <strong style="color: #334155;">Consular Languages:</strong> <span style="color: #475569;">${escapeHtml(languages)}</span>
          </div>
        ` : ''}
      </section>
    </div>
  `;
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