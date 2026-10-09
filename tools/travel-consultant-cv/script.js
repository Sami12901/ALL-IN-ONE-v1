// Travel Consultant & Tourism Specialist CV Builder
// Client-side Reactive Architecture

const STORAGE_KEY = 'aio_travel_cv_data_v1';

const SAMPLE_TRAVEL_CV = {
  personal: {
    fullName: 'Julian Montgomery, CTA',
    title: 'Senior Luxury Travel Consultant & Itinerary Designer',
    email: 'j.montgomery@example.com',
    phone: '+1 (212) 555-0188',
    location: 'New York, NY (Open to Remote / Relocation)',
    linkedin: 'linkedin.com/in/julian-montgomery-travel',
    website: 'julianmontgomerytravel.com'
  },
  summary: 'Distinguished Luxury Travel Consultant and Destination Specialist with 10+ years architecting bespoke luxury expeditions, ultra-VIP itineraries, and private chartered journeys across 55+ countries. Consistently generated $3.4M+ in annual high-yield leisure bookings with a 96% client retention rate. Certified expert in Amadeus and Sabre GDS platforms, luxury hotel consortia (Virtuoso, Four Seasons Preferred Partner), and complex international multi-segment air routing.',
  experience: [
    {
      id: 'exp-1',
      role: 'Lead Luxury Travel Designer',
      company: 'Wanderlust Luxury Journeys',
      location: 'New York, NY',
      dates: '2021 – Present',
      bullets: 'Curated tailored high-end leisure itineraries across Western Europe, East Africa, and East Asia, delivering $3.4M in gross sales annually.\nNegotiated preferred partner amenities with 5-star hotel groups and private aviation charters, securing client upgrades and VIP benefits.\nOrchestrated 24/7 emergency concierge re-routing for 40+ international clients during airspace disruptions without vacation disruption.'
    },
    {
      id: 'exp-2',
      role: 'Senior Corporate & MICE Travel Consultant',
      company: 'Apex Global Travel Management',
      location: 'Boston, MA',
      dates: '2017 – 2021',
      bullets: 'Spearheaded multi-city incentive travel programs and corporate retreats for Fortune 500 tech clients, accommodating up to 350 attendees per event.\nAdministered multi-carrier PNR creation, group fare ticketing, and complex split-ticketing via Sabre GDS, reducing corporate travel spend by 18%.\nManaged destination visa compliance and foreign health advisory requirements across 25+ global jurisdictions.'
    },
    {
      id: 'exp-3',
      role: 'International Travel Specialist',
      company: 'Horizon Explorer Expeditions',
      location: 'Chicago, IL',
      dates: '2014 – 2017',
      bullets: 'Designed custom multi-leg cultural tours and Mediterranean cruise packages for high-net-worth families.\nMaintained a 98% positive client feedback rating across 450+ tailored itineraries.'
    }
  ],
  tours: [
    {
      id: 'tour-1',
      title: 'Serengeti & Zanzibar Private Safari',
      type: 'Bespoke Luxury',
      pax: '14 Guests',
      budget: '$145,000',
      highlights: 'Chartered bush flights, private Singita tented reserve buyout, hot air ballooning, private Swahili chef.'
    },
    {
      id: 'tour-2',
      title: 'Nordic Fjord & Aurora Borealis Expedition',
      type: 'Small Group',
      pax: '28 Guests',
      budget: '$210,000',
      highlights: 'Glass igloo resort buyout, private icebreaker cruise, reindeer dog sledding, private astronomy guide.'
    },
    {
      id: 'tour-3',
      title: 'Grand Kyoto & Tokyo Cultural Immersion',
      type: 'VIP Family',
      pax: '8 Guests',
      budget: '$95,000',
      highlights: 'Private tea ceremonies in 400-year-old temples, Shinkansen Green Car routing, 3-Star Michelin reservations.'
    },
    {
      id: 'tour-4',
      title: 'Swiss Alps Ski & Wellness Retreat',
      type: 'Corporate MICE',
      pax: '60 Guests',
      budget: '$320,000',
      highlights: 'St. Moritz 5-star palace hotel takeover, private heli-skiing, customized gala dinners and logistics.'
    }
  ],
  skills: {
    gds: 'Amadeus GDS, Sabre Red 360, Galileo Travelport, ClientBase CRM, Travefy, AXUS Travel App',
    industry: 'Bespoke Luxury Itinerary Design, IATA Ticketing & BSP Settlement, Luxury Cruise Packages, Visa & Consular Advisory, Multi-Currency Budgeting, VIP Concierge Services, Crisis Re-routing',
    destinations: 'Mediterranean Europe (Italy, France, Greece), Japan & Southeast Asia, East African Safaris (Kenya, Tanzania), Swiss Alps, French Polynesia, GCC & UAE'
  },
  certifications: [
    {
      id: 'cert-1',
      name: 'IATA / UFTAA Travel & Tourism Consultant Diploma',
      issuer: 'IATA International Training Institute',
      year: '2015'
    },
    {
      id: 'cert-2',
      name: 'Certified Travel Associate (CTA)',
      issuer: 'The Travel Institute',
      year: '2018'
    },
    {
      id: 'cert-3',
      name: 'Virtuoso Certified Luxury Travel Advisor',
      issuer: 'Virtuoso Travel Network',
      year: '2020'
    },
    {
      id: 'cert-4',
      name: 'Sabre Red 360 Certified Ticketing Specialist',
      issuer: 'Sabre Global',
      year: '2016'
    }
  ],
  education: [
    {
      id: 'edu-1',
      degree: 'B.S. in Hospitality & Tourism Management',
      institution: 'Cornell University',
      year: '2014',
      honors: 'Magna Cum Laude • Dean’s Honor List'
    }
  ],
  languages: 'English (Native), French (Fluent), Spanish (Conversational), Italian (Basic)',
  theme: 'theme-gold'
};

let cvData = loadData();

function loadData() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (e) {
    console.warn('Unable to load travel CV data from localStorage', e);
  }
  return JSON.parse(JSON.stringify(SAMPLE_TRAVEL_CV));
}

function saveData() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(cvData));
  } catch (e) {
    console.warn('Unable to save travel CV data', e);
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
    'inp-linkedin': ['personal', 'linkedin'],
    'inp-website': ['personal', 'website'],
    'inp-summary': ['summary'],
    'inp-gds-skills': ['skills', 'gds'],
    'inp-industry-skills': ['skills', 'industry'],
    'inp-destinations': ['skills', 'destinations'],
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
    selTheme.value = cvData.theme || 'theme-gold';
    selTheme.addEventListener('change', (e) => {
      cvData.theme = e.target.value;
      saveData();
      renderPreview();
    });
  }
}

// Render dynamic lists (Experience, Tours, Certs, Edu)
function renderDynamicLists() {
  renderExperienceList();
  renderTourList();
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
        <span class="item-title">Experience #${index + 1}: ${item.role || 'New Role'}</span>
        <button type="button" class="btn-remove" data-remove-exp="${item.id}">Remove</button>
      </div>
      <div class="form-row two-cols">
        <div class="form-group">
          <label>Job Title</label>
          <input type="text" class="form-input" data-exp-field="role" value="${escapeHtml(item.role || '')}" placeholder="e.g. Luxury Travel Consultant">
        </div>
        <div class="form-group">
          <label>Agency / Company</label>
          <input type="text" class="form-input" data-exp-field="company" value="${escapeHtml(item.company || '')}" placeholder="e.g. Wanderlust Luxury">
        </div>
      </div>
      <div class="form-row two-cols">
        <div class="form-group">
          <label>Location</label>
          <input type="text" class="form-input" data-exp-field="location" value="${escapeHtml(item.location || '')}" placeholder="e.g. New York, NY">
        </div>
        <div class="form-group">
          <label>Dates / Period</label>
          <input type="text" class="form-input" data-exp-field="dates" value="${escapeHtml(item.dates || '')}" placeholder="e.g. 2021 – Present">
        </div>
      </div>
      <div class="form-group">
        <label>Key Achievements &amp; Responsibilities (One per line)</label>
        <textarea class="form-textarea" style="min-height: 80px;" data-exp-field="bullets" placeholder="• Highlight bookings, VIP itineraries, GDS optimizations...">${escapeHtml(item.bullets || '')}</textarea>
      </div>
    `;

    // Bind fields
    card.querySelectorAll('[data-exp-field]').forEach(input => {
      input.addEventListener('input', (e) => {
        const field = e.target.getAttribute('data-exp-field');
        item[field] = e.target.value;
        saveData();
        renderPreview();
      });
    });

    // Remove button
    card.querySelector('[data-remove-exp]').addEventListener('click', () => {
      cvData.experience = cvData.experience.filter(x => x.id !== item.id);
      saveData();
      renderExperienceList();
      renderPreview();
    });

    container.appendChild(card);
  });
}

function renderTourList() {
  const container = document.getElementById('tour-container');
  if (!container) return;
  container.innerHTML = '';

  cvData.tours.forEach((item, index) => {
    const card = document.createElement('div');
    card.className = 'dynamic-item-card';
    card.innerHTML = `
      <div class="item-header">
        <span class="item-title">Tour Project #${index + 1}: ${item.title || 'Untitled Tour'}</span>
        <button type="button" class="btn-remove" data-remove-tour="${item.id}">Remove</button>
      </div>
      <div class="form-row two-cols">
        <div class="form-group">
          <label>Tour Title / Route</label>
          <input type="text" class="form-input" data-tour-field="title" value="${escapeHtml(item.title || '')}" placeholder="e.g. Serengeti Safari &amp; Zanzibar">
        </div>
        <div class="form-group">
          <label>Category / Client Type</label>
          <input type="text" class="form-input" data-tour-field="type" value="${escapeHtml(item.type || '')}" placeholder="e.g. Bespoke Luxury / Corporate MICE">
        </div>
      </div>
      <div class="form-row two-cols">
        <div class="form-group">
          <label>Passenger Count (Pax)</label>
          <input type="text" class="form-input" data-tour-field="pax" value="${escapeHtml(item.pax || '')}" placeholder="e.g. 14 Guests">
        </div>
        <div class="form-group">
          <label>Booking Value / Budget</label>
          <input type="text" class="form-input" data-tour-field="budget" value="${escapeHtml(item.budget || '')}" placeholder="e.g. $145,000">
        </div>
      </div>
      <div class="form-group">
        <label>Key Features &amp; Logistics</label>
        <input type="text" class="form-input" data-tour-field="highlights" value="${escapeHtml(item.highlights || '')}" placeholder="e.g. Bush planes, 5-star private reserves, VIP transfers...">
      </div>
    `;

    card.querySelectorAll('[data-tour-field]').forEach(input => {
      input.addEventListener('input', (e) => {
        const field = e.target.getAttribute('data-tour-field');
        item[field] = e.target.value;
        saveData();
        renderPreview();
      });
    });

    card.querySelector('[data-remove-tour]').addEventListener('click', () => {
      cvData.tours = cvData.tours.filter(x => x.id !== item.id);
      saveData();
      renderTourList();
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
          <input type="text" class="form-input" data-cert-field="name" value="${escapeHtml(item.name || '')}" placeholder="e.g. IATA / UFTAA Consultant Diploma">
        </div>
        <div class="form-group">
          <label>Issuing Body / Institution</label>
          <input type="text" class="form-input" data-cert-field="issuer" value="${escapeHtml(item.issuer || '')}" placeholder="e.g. IATA Training Institute">
        </div>
      </div>
      <div class="form-group">
        <label>Year Acquired / Status</label>
        <input type="text" class="form-input" data-cert-field="year" value="${escapeHtml(item.year || '')}" placeholder="e.g. 2020 / Active">
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
          <input type="text" class="form-input" data-edu-field="degree" value="${escapeHtml(item.degree || '')}" placeholder="e.g. B.S. in Hospitality &amp; Tourism">
        </div>
        <div class="form-group">
          <label>Institution / University</label>
          <input type="text" class="form-input" data-edu-field="institution" value="${escapeHtml(item.institution || '')}" placeholder="e.g. Cornell University">
        </div>
      </div>
      <div class="form-row two-cols">
        <div class="form-group">
          <label>Year Graduated</label>
          <input type="text" class="form-input" data-edu-field="year" value="${escapeHtml(item.year || '')}" placeholder="e.g. 2014">
        </div>
        <div class="form-group">
          <label>Honors / Details</label>
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

// Preset and button helpers
function initPresets() {
  // Summary pills
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

  // GDS pills
  document.querySelectorAll('[data-add-gds]').forEach(btn => {
    btn.addEventListener('click', () => {
      const gds = btn.getAttribute('data-add-gds');
      const el = document.getElementById('inp-gds-skills');
      if (el) {
        const items = el.value.split(',').map(s => s.trim()).filter(Boolean);
        if (!items.includes(gds)) {
          items.push(gds);
          el.value = items.join(', ');
          cvData.skills.gds = el.value;
          saveData();
          renderPreview();
        }
      }
    });
  });

  // Skill pills
  document.querySelectorAll('[data-add-skill]').forEach(btn => {
    btn.addEventListener('click', () => {
      const skill = btn.getAttribute('data-add-skill');
      const el = document.getElementById('inp-industry-skills');
      if (el) {
        const items = el.value.split(',').map(s => s.trim()).filter(Boolean);
        if (!items.includes(skill)) {
          items.push(skill);
          el.value = items.join(', ');
          cvData.skills.industry = el.value;
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

  document.getElementById('btn-add-tour')?.addEventListener('click', () => {
    cvData.tours.push({
      id: 'tour-' + Date.now(),
      title: '',
      type: '',
      pax: '',
      budget: '',
      highlights: ''
    });
    saveData();
    renderTourList();
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
    cvData = JSON.parse(JSON.stringify(SAMPLE_TRAVEL_CV));
    saveData();
    syncAllInputsFromData();
    renderDynamicLists();
    renderPreview();
  });

  document.getElementById('btn-reset')?.addEventListener('click', () => {
    if (confirm('Are you sure you want to clear this CV?')) {
      cvData = {
        personal: { fullName: '', title: '', email: '', phone: '', location: '', linkedin: '', website: '' },
        summary: '',
        experience: [],
        tours: [],
        skills: { gds: '', industry: '', destinations: '' },
        certifications: [],
        education: [],
        languages: '',
        theme: cvData.theme || 'theme-gold'
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
    dlAnchor.setAttribute('download', `${(cvData.personal.fullName || 'travel-consultant').toLowerCase().replace(/\s+/g, '-')}-cv.json`);
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
          alert('Invalid Travel CV JSON structure.');
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
    'inp-website': cvData.personal?.website || '',
    'inp-summary': cvData.summary || '',
    'inp-gds-skills': cvData.skills?.gds || '',
    'inp-industry-skills': cvData.skills?.industry || '',
    'inp-destinations': cvData.skills?.destinations || '',
    'inp-languages': cvData.languages || ''
  };

  Object.entries(map).forEach(([id, val]) => {
    const el = document.getElementById(id);
    if (el) el.value = val;
  });

  const selTheme = document.getElementById('sel-theme');
  if (selTheme) selTheme.value = cvData.theme || 'theme-gold';
}

// Live CV preview renderer
function renderPreview() {
  const sheet = document.getElementById('resume-sheet');
  if (!sheet) return;

  sheet.className = `resume-sheet ${cvData.theme || 'theme-gold'}`;

  const { personal, summary, experience, tours, skills, certifications, education, languages } = cvData;

  // Split skill badges
  const gdsBadges = (skills?.gds || '').split(',').map(s => s.trim()).filter(Boolean);
  const indBadges = (skills?.industry || '').split(',').map(s => s.trim()).filter(Boolean);
  const destList = (skills?.destinations || '').split(',').map(s => s.trim()).filter(Boolean);

  sheet.innerHTML = `
    <!-- Header -->
    <header class="r-header">
      <div>
        <h1 class="r-name">${escapeHtml(personal?.fullName || 'Full Name')}</h1>
        <div class="r-role">${escapeHtml(personal?.title || 'Travel Consultant')}</div>
      </div>
      <div class="r-contact-grid">
        ${personal?.email ? `<div class="r-contact-item"><span>✉</span> ${escapeHtml(personal.email)}</div>` : ''}
        ${personal?.phone ? `<div class="r-contact-item"><span>☎</span> ${escapeHtml(personal.phone)}</div>` : ''}
        ${personal?.location ? `<div class="r-contact-item"><span>📍</span> ${escapeHtml(personal.location)}</div>` : ''}
        ${personal?.linkedin ? `<div class="r-contact-item"><span>🔗</span> ${escapeHtml(personal.linkedin)}</div>` : ''}
        ${personal?.website ? `<div class="r-contact-item"><span>🌐</span> ${escapeHtml(personal.website)}</div>` : ''}
      </div>
    </header>

    <!-- Executive Summary -->
    ${summary ? `
      <section class="r-section">
        <h2 class="r-section-title">Professional Tourism Profile</h2>
        <p class="r-summary-text">${escapeHtml(summary)}</p>
      </section>
    ` : ''}

    <!-- Key Tourism & Agency Experience -->
    ${experience && experience.length > 0 ? `
      <section class="r-section">
        <h2 class="r-section-title">Tourism &amp; Agency Experience</h2>
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

    <!-- Curated Tour Projects & Group Packages -->
    ${tours && tours.length > 0 ? `
      <section class="r-section">
        <h2 class="r-section-title">Curated Tour Projects &amp; High-Yield Operations</h2>
        <div class="r-tour-grid">
          ${tours.map(tour => `
            <div class="r-tour-card">
              <div class="r-tour-card-header">
                <span>${escapeHtml(tour.title || 'Curated Itinerary')}</span>
                ${tour.type ? `<span class="r-tour-tag">${escapeHtml(tour.type)}</span>` : ''}
              </div>
              <div class="r-tour-meta">
                ${tour.pax ? `<span>👥 ${escapeHtml(tour.pax)}</span>` : ''}
                ${tour.budget ? ` • <span>💰 ${escapeHtml(tour.budget)}</span>` : ''}
              </div>
              ${tour.highlights ? `<div class="r-tour-desc">${escapeHtml(tour.highlights)}</div>` : ''}
            </div>
          `).join('')}
        </div>
      </section>
    ` : ''}

    <!-- GDS & Professional Competencies -->
    ${(gdsBadges.length > 0 || indBadges.length > 0 || destList.length > 0) ? `
      <section class="r-section">
        <h2 class="r-section-title">GDS Systems &amp; Technical Competencies</h2>
        ${gdsBadges.length > 0 ? `
          <div style="margin-bottom: 0.4rem;">
            <span style="font-size: 0.75rem; font-weight: 700; color: #475569; display: block; margin-bottom: 0.2rem;">GDS &amp; RESERVATION SOFTWARE:</span>
            <div class="r-badge-list">
              ${gdsBadges.map(g => `<span class="r-badge">${escapeHtml(g)}</span>`).join('')}
            </div>
          </div>
        ` : ''}
        ${indBadges.length > 0 ? `
          <div style="margin-bottom: 0.4rem;">
            <span style="font-size: 0.75rem; font-weight: 700; color: #475569; display: block; margin-bottom: 0.2rem;">INDUSTRY SPECIALIZATIONS:</span>
            <div class="r-badge-list">
              ${indBadges.map(s => `<span class="r-badge">${escapeHtml(s)}</span>`).join('')}
            </div>
          </div>
        ` : ''}
        ${destList.length > 0 ? `
          <div>
            <span style="font-size: 0.75rem; font-weight: 700; color: #475569; display: block; margin-bottom: 0.2rem;">DESTINATION EXPERTISE:</span>
            <div class="r-badge-list">
              ${destList.map(d => `<span class="r-badge">${escapeHtml(d)}</span>`).join('')}
            </div>
          </div>
        ` : ''}
      </section>
    ` : ''}

    <!-- Certifications & Education Split Grid -->
    <div class="r-columns-split">
      <!-- Certifications -->
      <section class="r-section">
        <h2 class="r-section-title">Certifications &amp; Accreditations</h2>
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

      <!-- Education & Languages -->
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
            <strong style="color: #334155;">Languages:</strong> <span style="color: #475569;">${escapeHtml(languages)}</span>
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