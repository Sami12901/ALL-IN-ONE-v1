// Airline Ticketing & Reservation Agent CV Builder
// Client-side Reactive Architecture

const STORAGE_KEY = 'aio_ticketing_cv_data_v1';

const SAMPLE_TICKETING_CV = {
  personal: {
    fullName: 'Tariq Al-Mansoor, IATA CTT',
    title: 'Senior Airline Ticketing Officer & Multi-GDS Specialist',
    email: 'tariq.ticketing@aviationpro.com',
    phone: '+971 50 123 4567',
    location: 'Dubai, UAE (Open to International Transfer)',
    iataCode: 'IATA #07-2 9841 3 • Sabre PCC: 4F2A • Amadeus: DXB1A0982',
    linkedin: 'linkedin.com/in/tariq-gds-ticketing',
    website: 'tariqaviation.com'
  },
  metrics: {
    pnrs: '19,500+ PNRs',
    adm: '0 ADM (100% Clean)',
    bsp: '$5.8M Annual Sales',
    fares: '480+ RTW & Mileage Fares'
  },
  summary: 'Senior Airline Ticketing Officer and GDS Cryptic Specialist with 8+ years executing high-speed PNR reservations, complex multi-carrier fare construction, and automated BSP reconciliation. Dual-certified in Sabre Red 360 and Amadeus Selling Platform with over 19,500 error-free PNRs issued and a zero-ADM compliance record across 4 consecutive years. Expert in IATA Resolution 850m debit memo prevention, voluntary/involuntary ticket reissues, and EMD auxiliary issuance.',
  experience: [
    {
      id: 'exp-1',
      role: 'Lead Ticketing & GDS Specialist',
      company: 'Emirates Holidays & Global Consolidators',
      location: 'Dubai, UAE',
      dates: '2021 – Present',
      bullets: 'Constructed multi-segment international PNRs and round-the-world (RTW) mileage tariffs across 45+ scheduled partner carriers in Sabre Red 360.\nReconciled weekly BSP billing statements exceeding $5.8M annual gross volume with 100% accounting accuracy and zero agency debit memos (ADMs).\nProcessed rapid involuntary flight disruptions, revalidations, and schedule-change re-routings for over 250 passengers during regional airspace adjustments.\nSupervised junior ticketing desk on cryptic command syntax, automated pricing masks (WPNCB, FXX), and ticket exchange masks (WFR, TQR).'
    },
    {
      id: 'exp-2',
      role: 'Senior Airline Reservation & Fares Agent',
      company: 'Dnata Travel Services',
      location: 'Abu Dhabi, UAE',
      dates: '2018 – 2021',
      bullets: 'Managed corporate travel desk for high-volume multinational accounts, ticketing an average of 65 international PNRs per 8-hour shift.\nSpecialized in complex ticket re-issuances, calculating fare differences, penalty tax breakdowns (XT codes), and issuing EMD-S for excess baggage and seat upgrades.\nDrafted formal ADM dispute memos via BSPlink, successfully overturning 12 invalid carrier debit memos saving $42,000 in agency penalties.'
    },
    {
      id: 'exp-3',
      role: 'Ticketing & Tariff Officer',
      company: 'Gulf Express Aviation Services',
      location: 'Sharjah, UAE',
      dates: '2016 – 2018',
      bullets: 'Executed PNR bookings, ticket revalidations, and cancellations across Amadeus Selling Platform Connect and Travelport Galileo.\nMaintained ticketing queue hygiene (Queues 1, 7, 23, and 50), preventing ticket time limit (TTL) expirations and unauthorized segment cancellations.'
    }
  ],
  skills: {
    gds: 'Sabre Red 360 (Cryptic & Graphic), Amadeus Selling Platform Connect, Travelport Galileo GDS, IATA BSPlink Portal, Navitaire New Skies, SITA Gabriel',
    technical: 'Ticket Re-issuance & Exchange, EMD-A & EMD-S Issuance, Voluntary & Involuntary Refunds, Complex Mileage & RTW Construction, Queue Monitoring, Group PNR Allotment & Splitting',
    operational: 'IATA Resolution 850m ADM Guidelines, BSP Settlement, Carrier Interline Agreements, Baggage Ancillaries, Minimum Connecting Time (MCT) Rules, NUC & ROE Calculation'
  },
  certifications: [
    {
      id: 'cert-1',
      name: 'Amadeus Certified Ticketing & Cryptic Fares Professional',
      issuer: 'Amadeus IT Group',
      year: '2018 / Active'
    },
    {
      id: 'cert-2',
      name: 'Sabre Red 360 Master Fare Specialist',
      issuer: 'Sabre Global Training Academy',
      year: '2019 / Active'
    },
    {
      id: 'cert-3',
      name: 'IATA BSP Settlement & ADM Compliance Certification',
      issuer: 'International Air Transport Association (IATA)',
      year: '2020'
    },
    {
      id: 'cert-4',
      name: 'Travelport Galileo Global Distribution Certification',
      issuer: 'Travelport',
      year: '2017'
    }
  ],
  education: [
    {
      id: 'edu-1',
      degree: 'Bachelor of Science in Aviation Management & Tourism',
      institution: 'Emirates Aviation University',
      year: '2016',
      honors: 'Dean’s Honor List • Aviation Commercial Society Lead'
    }
  ],
  languages: 'English (Fluent / IATA Aviation Standard), Arabic (Native), Urdu (Conversational)',
  theme: 'theme-aero'
};

let cvData = loadData();

function loadData() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (e) {
    console.warn('Unable to load ticketing CV data from localStorage', e);
  }
  return JSON.parse(JSON.stringify(SAMPLE_TICKETING_CV));
}

function saveData() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(cvData));
  } catch (e) {
    console.warn('Unable to save ticketing CV data', e);
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
    'inp-iatacode': ['personal', 'iataCode'],
    'inp-linkedin': ['personal', 'linkedin'],
    'inp-website': ['personal', 'website'],

    'inp-metric-pnrs': ['metrics', 'pnrs'],
    'inp-metric-adm': ['metrics', 'adm'],
    'inp-metric-bsp': ['metrics', 'bsp'],
    'inp-metric-fares': ['metrics', 'fares'],

    'inp-summary': ['summary'],

    'inp-gds-systems': ['skills', 'gds'],
    'inp-technical-skills': ['skills', 'technical'],
    'inp-operational-skills': ['skills', 'operational'],

    'inp-languages': ['languages']
  };

  Object.entries(map).forEach(([id, path]) => {
    const el = document.getElementById(id);
    if (!el) return;

    // Set initial value
    let val = cvData;
    for (const p of path) {
      val = val ? val[p] : '';
    }
    el.value = val || '';

    // Bind change/input
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
    selTheme.value = cvData.theme || 'theme-aero';
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
        <span class="item-title">Position #${index + 1}: ${escapeHtml(item.role || 'New Position')}</span>
        <button type="button" class="btn-remove" data-remove-exp="${item.id}">Remove</button>
      </div>
      <div class="form-row two-cols">
        <div class="form-group">
          <label>Job Title</label>
          <input type="text" class="form-input" data-exp-field="role" value="${escapeHtml(item.role || '')}" placeholder="e.g. Lead Ticketing Specialist">
        </div>
        <div class="form-group">
          <label>Airline / Consolidator / Agency</label>
          <input type="text" class="form-input" data-exp-field="company" value="${escapeHtml(item.company || '')}" placeholder="e.g. Emirates Holidays">
        </div>
      </div>
      <div class="form-row two-cols">
        <div class="form-group">
          <label>Location / Station</label>
          <input type="text" class="form-input" data-exp-field="location" value="${escapeHtml(item.location || '')}" placeholder="e.g. Dubai, UAE">
        </div>
        <div class="form-group">
          <label>Dates of Employment</label>
          <input type="text" class="form-input" data-exp-field="dates" value="${escapeHtml(item.dates || '')}" placeholder="e.g. 2021 – Present">
        </div>
      </div>
      <div class="form-group">
        <label>Key Ticketing Responsibilities &amp; Achievements (One per line)</label>
        <textarea class="form-textarea" data-exp-field="bullets" rows="4" placeholder="Highlight PNR throughput, re-issues, ADM avoidance, and system command expertise...">${escapeHtml(item.bullets || '')}</textarea>
      </div>
    `;

    card.querySelectorAll('[data-exp-field]').forEach(input => {
      input.addEventListener('input', (e) => {
        const field = e.target.getAttribute('data-exp-field');
        item[field] = e.target.value;
        if (field === 'role') {
          const titleSpan = card.querySelector('.item-title');
          if (titleSpan) titleSpan.textContent = `Position #${index + 1}: ${e.target.value || 'New Position'}`;
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
          <input type="text" class="form-input" data-cert-field="name" value="${escapeHtml(item.name || '')}" placeholder="e.g. Sabre Red 360 Master Fare Specialist">
        </div>
        <div class="form-group">
          <label>Issuing Organization / Academy</label>
          <input type="text" class="form-input" data-cert-field="issuer" value="${escapeHtml(item.issuer || '')}" placeholder="e.g. Sabre Global Training">
        </div>
      </div>
      <div class="form-group">
        <label>Year Acquired / Status</label>
        <input type="text" class="form-input" data-cert-field="year" value="${escapeHtml(item.year || '')}" placeholder="e.g. 2019 / Active">
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
          <input type="text" class="form-input" data-edu-field="degree" value="${escapeHtml(item.degree || '')}" placeholder="e.g. B.S. in Aviation Management">
        </div>
        <div class="form-group">
          <label>Institution / University</label>
          <input type="text" class="form-input" data-edu-field="institution" value="${escapeHtml(item.institution || '')}" placeholder="e.g. Emirates Aviation University">
        </div>
      </div>
      <div class="form-row two-cols">
        <div class="form-group">
          <label>Graduation Year</label>
          <input type="text" class="form-input" data-edu-field="year" value="${escapeHtml(item.year || '')}" placeholder="e.g. 2016">
        </div>
        <div class="form-group">
          <label>Honors / Activities</label>
          <input type="text" class="form-input" data-edu-field="honors" value="${escapeHtml(item.honors || '')}" placeholder="e.g. Dean's Honor List">
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

// Preset button helpers
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

  // GDS presets
  document.querySelectorAll('[data-add-gds]').forEach(btn => {
    btn.addEventListener('click', () => {
      const gds = btn.getAttribute('data-add-gds');
      const el = document.getElementById('inp-gds-systems');
      if (el) {
        const items = el.value.split(',').map(s => s.trim()).filter(Boolean);
        if (!items.includes(gds)) {
          items.push(gds);
          el.value = items.join(', ');
          if (!cvData.skills) cvData.skills = {};
          cvData.skills.gds = el.value;
          saveData();
          renderPreview();
        }
      }
    });
  });

  // Ticketing competencies presets
  document.querySelectorAll('[data-add-ticketing]').forEach(btn => {
    btn.addEventListener('click', () => {
      const skill = btn.getAttribute('data-add-ticketing');
      const el = document.getElementById('inp-technical-skills');
      if (el) {
        const items = el.value.split(',').map(s => s.trim()).filter(Boolean);
        if (!items.includes(skill)) {
          items.push(skill);
          el.value = items.join(', ');
          if (!cvData.skills) cvData.skills = {};
          cvData.skills.technical = el.value;
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
    cvData = JSON.parse(JSON.stringify(SAMPLE_TICKETING_CV));
    saveData();
    syncAllInputsFromData();
    renderDynamicLists();
    renderPreview();
  });

  document.getElementById('btn-reset')?.addEventListener('click', () => {
    if (confirm('Are you sure you want to clear this CV form?')) {
      cvData = {
        personal: { fullName: '', title: '', email: '', phone: '', location: '', iataCode: '', linkedin: '', website: '' },
        metrics: { pnrs: '', adm: '', bsp: '', fares: '' },
        summary: '',
        experience: [],
        skills: { gds: '', technical: '', operational: '' },
        certifications: [],
        education: [],
        languages: '',
        theme: cvData.theme || 'theme-aero'
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
    dlAnchor.setAttribute('download', `${(cvData.personal?.fullName || 'ticketing-officer').toLowerCase().replace(/\s+/g, '-')}-cv.json`);
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
          alert('Invalid Ticketing Officer CV JSON format.');
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
    'inp-iatacode': cvData.personal?.iataCode || '',
    'inp-linkedin': cvData.personal?.linkedin || '',
    'inp-website': cvData.personal?.website || '',

    'inp-metric-pnrs': cvData.metrics?.pnrs || '',
    'inp-metric-adm': cvData.metrics?.adm || '',
    'inp-metric-bsp': cvData.metrics?.bsp || '',
    'inp-metric-fares': cvData.metrics?.fares || '',

    'inp-summary': cvData.summary || '',

    'inp-gds-systems': cvData.skills?.gds || '',
    'inp-technical-skills': cvData.skills?.technical || '',
    'inp-operational-skills': cvData.skills?.operational || '',

    'inp-languages': cvData.languages || ''
  };

  Object.entries(map).forEach(([id, val]) => {
    const el = document.getElementById(id);
    if (el) el.value = val;
  });

  const selTheme = document.getElementById('sel-theme');
  if (selTheme) selTheme.value = cvData.theme || 'theme-aero';
}

// Live CV preview renderer
function renderPreview() {
  const sheet = document.getElementById('resume-sheet');
  if (!sheet) return;

  sheet.className = `resume-sheet ${cvData.theme || 'theme-aero'}`;

  const { personal, metrics, summary, experience, skills, certifications, education, languages } = cvData;

  const gdsBadges = (skills?.gds || '').split(',').map(s => s.trim()).filter(Boolean);
  const techBadges = (skills?.technical || '').split(',').map(s => s.trim()).filter(Boolean);
  const opBadges = (skills?.operational || '').split(',').map(s => s.trim()).filter(Boolean);

  sheet.innerHTML = `
    <!-- Header -->
    <header class="r-header">
      <div>
        <h1 class="r-name">${escapeHtml(personal?.fullName || 'Full Name')}</h1>
        <div class="r-role">${escapeHtml(personal?.title || 'Airline Ticketing Officer')}</div>
      </div>
      <div class="r-contact-grid">
        ${personal?.email ? `<div class="r-contact-item"><span>✉</span> ${escapeHtml(personal.email)}</div>` : ''}
        ${personal?.phone ? `<div class="r-contact-item"><span>☎</span> ${escapeHtml(personal.phone)}</div>` : ''}
        ${personal?.location ? `<div class="r-contact-item"><span>📍</span> ${escapeHtml(personal.location)}</div>` : ''}
        ${personal?.iataCode ? `<div class="r-contact-item"><span>🎫</span> ${escapeHtml(personal.iataCode)}</div>` : ''}
        ${personal?.linkedin ? `<div class="r-contact-item"><span>🔗</span> ${escapeHtml(personal.linkedin)}</div>` : ''}
        ${personal?.website ? `<div class="r-contact-item"><span>🌐</span> ${escapeHtml(personal.website)}</div>` : ''}
      </div>
    </header>

    <!-- Ticketing Volume Metrics Bar -->
    ${(metrics?.pnrs || metrics?.adm || metrics?.bsp || metrics?.fares) ? `
      <div class="r-metrics-bar">
        <div class="r-metric-box">
          <span class="r-metric-value">${escapeHtml(metrics.pnrs || '—')}</span>
          <span class="r-metric-label">PNRs Issued</span>
        </div>
        <div class="r-metric-box">
          <span class="r-metric-value">${escapeHtml(metrics.adm || '—')}</span>
          <span class="r-metric-label">Debit Memo Record</span>
        </div>
        <div class="r-metric-box">
          <span class="r-metric-value">${escapeHtml(metrics.bsp || '—')}</span>
          <span class="r-metric-label">Annual Settlement</span>
        </div>
        <div class="r-metric-box">
          <span class="r-metric-value">${escapeHtml(metrics.fares || '—')}</span>
          <span class="r-metric-label">Tariff Construction</span>
        </div>
      </div>
    ` : ''}

    <!-- Executive Summary -->
    ${summary ? `
      <section class="r-section">
        <h2 class="r-section-title">Aviation &amp; Reservation Profile</h2>
        <p class="r-summary-text">${escapeHtml(summary)}</p>
      </section>
    ` : ''}

    <!-- Experience -->
    ${experience && experience.length > 0 ? `
      <section class="r-section">
        <h2 class="r-section-title">Ticketing &amp; Aviation Career History</h2>
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

    <!-- GDS & Systems Competencies -->
    ${(gdsBadges.length > 0 || techBadges.length > 0 || opBadges.length > 0) ? `
      <section class="r-section">
        <h2 class="r-section-title">GDS Command &amp; Tariff Proficiencies</h2>
        ${gdsBadges.length > 0 ? `
          <div style="margin-bottom: 0.35rem;">
            <span style="font-size: 0.725rem; font-weight: 700; color: #475569; display: block; margin-bottom: 0.15rem;">GDS &amp; RESERVATION SYSTEMS:</span>
            <div class="r-badge-list">
              ${gdsBadges.map(g => `<span class="r-badge">${escapeHtml(g)}</span>`).join('')}
            </div>
          </div>
        ` : ''}
        ${techBadges.length > 0 ? `
          <div style="margin-bottom: 0.35rem;">
            <span style="font-size: 0.725rem; font-weight: 700; color: #475569; display: block; margin-bottom: 0.15rem;">TICKETING &amp; FARE PRICING:</span>
            <div class="r-badge-list">
              ${techBadges.map(s => `<span class="r-badge">${escapeHtml(s)}</span>`).join('')}
            </div>
          </div>
        ` : ''}
        ${opBadges.length > 0 ? `
          <div>
            <span style="font-size: 0.725rem; font-weight: 700; color: #475569; display: block; margin-bottom: 0.15rem;">IATA &amp; INDUSTRY REGULATIONS:</span>
            <div class="r-badge-list">
              ${opBadges.map(o => `<span class="r-badge">${escapeHtml(o)}</span>`).join('')}
            </div>
          </div>
        ` : ''}
      </section>
    ` : ''}

    <!-- Certifications & Education (Two columns if both exist) -->
    <div class="r-columns-split">
      <!-- Certifications -->
      ${certifications && certifications.length > 0 ? `
        <section class="r-section">
          <h2 class="r-section-title">GDS &amp; Aviation Credentials</h2>
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