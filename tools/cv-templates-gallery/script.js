// CV Templates Gallery & Interactive Builder Logic

// Default Sample Resume Data
const SAMPLE_RESUME = {
  personal: {
    name: 'Victoria Sterling',
    title: 'Vice President of Engineering',
    email: 'v.sterling@example.com',
    phone: '+1 (555) 349-8201',
    location: 'San Francisco, CA',
    website: 'linkedin.com/in/victoriasterling'
  },
  summary: 'Transformational technology executive with 14+ years of leadership experience scaling hyper-growth SaaS platforms and mission-critical cloud infrastructure. Proven history of leading 90+ distributed engineers, re-architecting legacy monoliths into resilient microservices, and partnering with C-suite stakeholders to deliver $40M+ in ARR expansion.',
  experience: [
    {
      id: 'exp-1',
      role: 'Vice President of Engineering',
      company: 'Apex Cloud Systems',
      location: 'San Francisco, CA',
      startDate: '2021',
      endDate: 'Present',
      bullets: [
        'Direct 5 global engineering divisions totaling 92 software engineers, architects, and DevOps leads.',
        'Spearheaded enterprise infrastructure migration to Kubernetes, decreasing cloud compute overhead by 34% ($2.1M ARR).',
        'Accelerated feature release cadence from monthly to continuous delivery with 99.995% SLA reliability.',
        'Mentored 12 senior engineering managers and instituted transparent career growth frameworks that cut employee attrition to 4%.'
      ]
    },
    {
      id: 'exp-2',
      role: 'Director of Platform Engineering',
      company: 'OmniStream Data Corp',
      location: 'Seattle, WA',
      startDate: '2017',
      endDate: '2021',
      bullets: [
        'Architected real-time streaming ingestion pipeline handling 14B+ daily events using Kafka, Golang, and AWS.',
        'Scaled platform team from 8 to 38 engineers across distributed US and European hubs.',
        'Achieved SOC 2 Type II and ISO 27001 regulatory certifications across all production data planes.'
      ]
    },
    {
      id: 'exp-3',
      role: 'Principal Software Architect',
      company: 'Vanguard Networks',
      location: 'Austin, TX',
      startDate: '2013',
      endDate: '2017',
      bullets: [
        'Designed core multi-tenant security architecture adopted by 65 enterprise Fortune 500 customers.',
        'Reduced p99 API latency from 240ms to 28ms through database query optimization and Redis tiering.'
      ]
    }
  ],
  education: [
    {
      id: 'edu-1',
      degree: 'M.S. in Computer Science (Distributed Systems)',
      school: 'Stanford University',
      location: 'Stanford, CA',
      gradYear: '2013',
      details: 'Honors Fellow, Research in fault-tolerant consensus protocols'
    },
    {
      id: 'edu-2',
      degree: 'B.S. in Computer Engineering',
      school: 'University of Washington',
      location: 'Seattle, WA',
      gradYear: '2011',
      details: 'Magna Cum Laude, President of ACM Chapter'
    }
  ],
  skills: 'Distributed Systems, Cloud Architecture (AWS / GCP), Kubernetes, Microservices, Golang, Python, System Design, Team Leadership, CI/CD Pipelines, High-Availability Systems, SOC2 Compliance, Strategic Roadmapping',
  activeTemplate: 'template-classic'
};

const STORAGE_KEY = 'aio_cv_gallery_data';

// Deep clone helper
function cloneData(obj) {
  return JSON.parse(JSON.stringify(obj));
}

// Escape HTML helper
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
  // State initialization
  let resumeState = loadState();

  // Elements
  const inpName = document.getElementById('inp-name');
  const inpTitle = document.getElementById('inp-title');
  const inpEmail = document.getElementById('inp-email');
  const inpPhone = document.getElementById('inp-phone');
  const inpLocation = document.getElementById('inp-location');
  const inpWebsite = document.getElementById('inp-website');
  const inpSummary = document.getElementById('inp-summary');
  const inpSkills = document.getElementById('inp-skills');

  const expContainer = document.getElementById('experience-container');
  const eduContainer = document.getElementById('education-container');
  const resumePaper = document.getElementById('resume-paper');

  const btnAddExp = document.getElementById('btn-add-experience');
  const btnAddEdu = document.getElementById('btn-add-education');
  const btnLoadSample = document.getElementById('btn-load-sample');
  const btnReset = document.getElementById('btn-reset-form');
  const btnPrint = document.getElementById('btn-print-resume');
  const btnCopyText = document.getElementById('btn-copy-text');
  const btnExportJson = document.getElementById('btn-export-json');
  const fileImportJson = document.getElementById('file-import-json');

  const tabButtons = document.querySelectorAll('.tab-btn');
  const formSections = document.querySelectorAll('.form-section');
  const templateChips = document.querySelectorAll('.template-chip');
  const autosaveIndicator = document.getElementById('autosave-indicator');

  // Load state from localStorage or default to sample
  function loadState() {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && parsed.personal && parsed.experience) {
          return parsed;
        }
      }
    } catch (e) {
      console.warn('Could not read saved CV from localStorage:', e);
    }
    return cloneData(SAMPLE_RESUME);
  }

  // Save state to localStorage with debounced indicator
  let saveTimer = null;
  function saveState() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(resumeState));
      if (autosaveIndicator) {
        autosaveIndicator.textContent = 'Saving...';
        clearTimeout(saveTimer);
        saveTimer = setTimeout(() => {
          autosaveIndicator.textContent = 'Saved to browser';
        }, 600);
      }
    } catch (e) {
      console.error('Failed to save CV:', e);
    }
  }

  // Populate editor form inputs from state
  function populateEditor() {
    inpName.value = resumeState.personal.name || '';
    inpTitle.value = resumeState.personal.title || '';
    inpEmail.value = resumeState.personal.email || '';
    inpPhone.value = resumeState.personal.phone || '';
    inpLocation.value = resumeState.personal.location || '';
    inpWebsite.value = resumeState.personal.website || '';
    inpSummary.value = resumeState.summary || '';
    inpSkills.value = resumeState.skills || '';

    renderExperienceForms();
    renderEducationForms();
    updateActiveTemplateChip();
  }

  // Render Experience inputs in editor
  function renderExperienceForms() {
    expContainer.innerHTML = '';
    if (!resumeState.experience || resumeState.experience.length === 0) {
      expContainer.innerHTML = '<p style="color: var(--text-tertiary); font-size: 0.85rem; font-style: italic;">No employment history added yet. Click "+ Add Role" above.</p>';
      return;
    }

    resumeState.experience.forEach((exp, idx) => {
      const itemEl = document.createElement('div');
      itemEl.className = 'repeater-item';
      itemEl.dataset.id = exp.id;
      itemEl.innerHTML = `
        <div class="repeater-header">
          <span style="font-weight: 700; font-size: 0.85rem; color: var(--text-primary);">Role #${idx + 1}: ${escapeHtml(exp.role || 'New Role')}</span>
          <button type="button" class="btn-remove-item btn-del-exp" title="Delete role">Remove</button>
        </div>
        <div class="grid-2">
          <div class="form-group">
            <label style="font-size: 0.75rem;">Job Title</label>
            <input type="text" class="form-input exp-inp-role" value="${escapeHtml(exp.role || '')}" placeholder="e.g. Lead Architect">
          </div>
          <div class="form-group">
            <label style="font-size: 0.75rem;">Company / Organization</label>
            <input type="text" class="form-input exp-inp-company" value="${escapeHtml(exp.company || '')}" placeholder="e.g. Acme Corp">
          </div>
        </div>
        <div class="grid-2">
          <div class="form-group">
            <label style="font-size: 0.75rem;">Dates / Period</label>
            <input type="text" class="form-input exp-inp-dates" value="${escapeHtml((exp.startDate ? exp.startDate + ' - ' + (exp.endDate || 'Present') : ''))}" placeholder="e.g. 2020 - Present">
          </div>
          <div class="form-group">
            <label style="font-size: 0.75rem;">Location</label>
            <input type="text" class="form-input exp-inp-loc" value="${escapeHtml(exp.location || '')}" placeholder="e.g. New York, NY">
          </div>
        </div>
        <div class="form-group">
          <label style="font-size: 0.75rem;">Key Achievements / Bullets (One per line)</label>
          <textarea class="form-textarea exp-inp-bullets" style="min-height: 80px; font-size: 0.85rem;">${(exp.bullets || []).join('\n')}</textarea>
        </div>
      `;

      // Event listeners for this item
      itemEl.querySelector('.btn-del-exp').addEventListener('click', () => {
        resumeState.experience.splice(idx, 1);
        renderExperienceForms();
        renderResumePreview();
        saveState();
      });

      itemEl.querySelector('.exp-inp-role').addEventListener('input', (e) => {
        exp.role = e.target.value;
        const titleSpan = itemEl.querySelector('.repeater-header span');
        if (titleSpan) titleSpan.textContent = `Role #${idx + 1}: ${e.target.value || 'New Role'}`;
        renderResumePreview();
        saveState();
      });

      itemEl.querySelector('.exp-inp-company').addEventListener('input', (e) => {
        exp.company = e.target.value;
        renderResumePreview();
        saveState();
      });

      itemEl.querySelector('.exp-inp-dates').addEventListener('input', (e) => {
        const val = e.target.value;
        const parts = val.split('-').map(s => s.trim());
        exp.startDate = parts[0] || '';
        exp.endDate = parts[1] || '';
        renderResumePreview();
        saveState();
      });

      itemEl.querySelector('.exp-inp-loc').addEventListener('input', (e) => {
        exp.location = e.target.value;
        renderResumePreview();
        saveState();
      });

      itemEl.querySelector('.exp-inp-bullets').addEventListener('input', (e) => {
        exp.bullets = e.target.value
          .split('\n')
          .map(b => b.trim())
          .filter(b => b.length > 0);
        renderResumePreview();
        saveState();
      });

      expContainer.appendChild(itemEl);
    });
  }

  // Render Education inputs in editor
  function renderEducationForms() {
    eduContainer.innerHTML = '';
    if (!resumeState.education || resumeState.education.length === 0) {
      eduContainer.innerHTML = '<p style="color: var(--text-tertiary); font-size: 0.85rem; font-style: italic;">No education credentials added yet. Click "+ Add Degree" above.</p>';
      return;
    }

    resumeState.education.forEach((edu, idx) => {
      const itemEl = document.createElement('div');
      itemEl.className = 'repeater-item';
      itemEl.dataset.id = edu.id;
      itemEl.innerHTML = `
        <div class="repeater-header">
          <span style="font-weight: 700; font-size: 0.85rem; color: var(--text-primary);">Degree #${idx + 1}: ${escapeHtml(edu.degree || 'Degree')}</span>
          <button type="button" class="btn-remove-item btn-del-edu" title="Delete degree">Remove</button>
        </div>
        <div class="form-group">
          <label style="font-size: 0.75rem;">Degree & Major</label>
          <input type="text" class="form-input edu-inp-degree" value="${escapeHtml(edu.degree || '')}" placeholder="e.g. B.S. in Computer Science">
        </div>
        <div class="grid-2">
          <div class="form-group">
            <label style="font-size: 0.75rem;">Institution / University</label>
            <input type="text" class="form-input edu-inp-school" value="${escapeHtml(edu.school || '')}" placeholder="e.g. Stanford University">
          </div>
          <div class="form-group">
            <label style="font-size: 0.75rem;">Graduation Year / Period</label>
            <input type="text" class="form-input edu-inp-year" value="${escapeHtml(edu.gradYear || '')}" placeholder="e.g. 2018">
          </div>
        </div>
        <div class="form-group">
          <label style="font-size: 0.75rem;">Honors / Notes (Optional)</label>
          <input type="text" class="form-input edu-inp-details" value="${escapeHtml(edu.details || '')}" placeholder="e.g. Magna Cum Laude, GPA 3.9/4.0">
        </div>
      `;

      itemEl.querySelector('.btn-del-edu').addEventListener('click', () => {
        resumeState.education.splice(idx, 1);
        renderEducationForms();
        renderResumePreview();
        saveState();
      });

      itemEl.querySelector('.edu-inp-degree').addEventListener('input', (e) => {
        edu.degree = e.target.value;
        const titleSpan = itemEl.querySelector('.repeater-header span');
        if (titleSpan) titleSpan.textContent = `Degree #${idx + 1}: ${e.target.value || 'Degree'}`;
        renderResumePreview();
        saveState();
      });

      itemEl.querySelector('.edu-inp-school').addEventListener('input', (e) => {
        edu.school = e.target.value;
        renderResumePreview();
        saveState();
      });

      itemEl.querySelector('.edu-inp-year').addEventListener('input', (e) => {
        edu.gradYear = e.target.value;
        renderResumePreview();
        saveState();
      });

      itemEl.querySelector('.edu-inp-details').addEventListener('input', (e) => {
        edu.details = e.target.value;
        renderResumePreview();
        saveState();
      });

      eduContainer.appendChild(itemEl);
    });
  }

  // Render the formatted Resume inside #resume-paper based on activeTemplate
  function renderResumePreview() {
    const template = resumeState.activeTemplate || 'template-classic';
    resumePaper.className = `resume-paper ${template}`;

    const p = resumeState.personal || {};
    const hasName = Boolean(p.name && p.name.trim());
    const hasSummary = Boolean(resumeState.summary && resumeState.summary.trim());
    const experiences = resumeState.experience || [];
    const educations = resumeState.education || [];
    const skillList = (resumeState.skills || '')
      .split(',')
      .map(s => s.trim())
      .filter(s => s.length > 0);

    let html = '';

    if (template === 'template-classic') {
      // 1. Executive Classic
      html = `
        <header class="res-header">
          <div class="res-name">${escapeHtml(p.name || 'YOUR NAME')}</div>
          <div class="res-title">${escapeHtml(p.title || 'Professional Title')}</div>
          <div class="res-contact-bar">
            ${p.email ? `<span>${escapeHtml(p.email)}</span>` : ''}
            ${p.phone ? `<span>${escapeHtml(p.phone)}</span>` : ''}
            ${p.location ? `<span>${escapeHtml(p.location)}</span>` : ''}
            ${p.website ? `<span>${escapeHtml(p.website)}</span>` : ''}
          </div>
        </header>

        ${hasSummary ? `
          <section class="res-section">
            <h3 class="res-section-title">Executive Summary</h3>
            <p style="text-align: justify; margin: 0; line-height: 1.6;">${escapeHtml(resumeState.summary)}</p>
          </section>
        ` : ''}

        ${experiences.length > 0 ? `
          <section class="res-section">
            <h3 class="res-section-title">Professional Experience</h3>
            ${experiences.map(exp => `
              <div class="res-item">
                <div class="res-item-header">
                  <span>${escapeHtml(exp.role || '')}</span>
                  <span>${escapeHtml(exp.startDate ? `${exp.startDate} – ${exp.endDate || 'Present'}` : '')}</span>
                </div>
                <div class="res-item-sub">
                  <span>${escapeHtml(exp.company || '')}${exp.location ? `, ${escapeHtml(exp.location)}` : ''}</span>
                </div>
                ${exp.bullets && exp.bullets.length > 0 ? `
                  <ul class="res-bullets">
                    ${exp.bullets.map(b => `<li>${escapeHtml(b)}</li>`).join('')}
                  </ul>
                ` : ''}
              </div>
            `).join('')}
          </section>
        ` : ''}

        ${educations.length > 0 ? `
          <section class="res-section">
            <h3 class="res-section-title">Education & Credentials</h3>
            ${educations.map(edu => `
              <div class="res-item">
                <div class="res-item-header">
                  <span>${escapeHtml(edu.degree || '')}</span>
                  <span>${escapeHtml(edu.gradYear || '')}</span>
                </div>
                <div class="res-item-sub">
                  <span>${escapeHtml(edu.school || '')}${edu.location ? `, ${escapeHtml(edu.location)}` : ''}</span>
                </div>
                ${edu.details ? `<div style="font-size: 0.9rem; color: #52525b; margin-top: 0.15rem;">${escapeHtml(edu.details)}</div>` : ''}
              </div>
            `).join('')}
          </section>
        ` : ''}

        ${skillList.length > 0 ? `
          <section class="res-section">
            <h3 class="res-section-title">Areas of Expertise</h3>
            <div class="res-skills-content">
              <strong>Core Competencies:</strong> ${escapeHtml(skillList.join(' • '))}
            </div>
          </section>
        ` : ''}
      `;
    } else if (template === 'template-modern') {
      // 2. Modern Clean
      html = `
        <header class="res-header">
          <div>
            <div class="res-name">${escapeHtml(p.name || 'YOUR NAME')}</div>
            <div class="res-title">${escapeHtml(p.title || 'Professional Title')}</div>
          </div>
          <div class="res-contact-bar">
            ${p.email ? `<div>✉ ${escapeHtml(p.email)}</div>` : ''}
            ${p.phone ? `<div>☎ ${escapeHtml(p.phone)}</div>` : ''}
            ${p.location ? `<div>📍 ${escapeHtml(p.location)}</div>` : ''}
            ${p.website ? `<div>🌐 ${escapeHtml(p.website)}</div>` : ''}
          </div>
        </header>

        ${hasSummary ? `
          <section class="res-section">
            <h3 class="res-section-title">Professional Summary</h3>
            <p style="margin: 0; line-height: 1.6; color: #334155;">${escapeHtml(resumeState.summary)}</p>
          </section>
        ` : ''}

        ${experiences.length > 0 ? `
          <section class="res-section">
            <h3 class="res-section-title">Experience</h3>
            ${experiences.map(exp => `
              <div class="res-item">
                <div class="res-item-header">
                  <span>${escapeHtml(exp.role || '')}</span>
                  <span style="font-weight: 500; font-size: 0.85rem; color: #64748b;">${escapeHtml(exp.startDate ? `${exp.startDate} – ${exp.endDate || 'Present'}` : '')}</span>
                </div>
                <div class="res-item-sub">
                  <span style="color: #2563eb; font-weight: 600;">${escapeHtml(exp.company || '')}</span>
                  <span>${escapeHtml(exp.location || '')}</span>
                </div>
                ${exp.bullets && exp.bullets.length > 0 ? `
                  <ul class="res-bullets">
                    ${exp.bullets.map(b => `<li>${escapeHtml(b)}</li>`).join('')}
                  </ul>
                ` : ''}
              </div>
            `).join('')}
          </section>
        ` : ''}

        ${educations.length > 0 ? `
          <section class="res-section">
            <h3 class="res-section-title">Education</h3>
            ${educations.map(edu => `
              <div class="res-item">
                <div class="res-item-header">
                  <span>${escapeHtml(edu.degree || '')}</span>
                  <span style="font-weight: 500; font-size: 0.85rem; color: #64748b;">${escapeHtml(edu.gradYear || '')}</span>
                </div>
                <div class="res-item-sub">
                  <span style="color: #0f172a; font-weight: 500;">${escapeHtml(edu.school || '')}</span>
                  <span>${escapeHtml(edu.location || '')}</span>
                </div>
                ${edu.details ? `<div style="font-size: 0.85rem; color: #64748b;">${escapeHtml(edu.details)}</div>` : ''}
              </div>
            `).join('')}
          </section>
        ` : ''}

        ${skillList.length > 0 ? `
          <section class="res-section">
            <h3 class="res-section-title">Skills &amp; Technologies</h3>
            <div class="res-skill-tags">
              ${skillList.map(skill => `<span class="skill-tag">${escapeHtml(skill)}</span>`).join('')}
            </div>
          </section>
        ` : ''}
      `;
    } else {
      // 3. Minimalist Luxury
      html = `
        <header class="res-header">
          <div class="res-name">${escapeHtml(p.name || 'YOUR NAME')}</div>
          <div class="res-title">${escapeHtml(p.title || 'Professional Title')}</div>
          <div class="res-contact-bar">
            ${p.email ? `<span>${escapeHtml(p.email)}</span>` : ''}
            ${p.phone ? `<span>${escapeHtml(p.phone)}</span>` : ''}
            ${p.location ? `<span>${escapeHtml(p.location)}</span>` : ''}
            ${p.website ? `<span>${escapeHtml(p.website)}</span>` : ''}
          </div>
        </header>

        ${hasSummary ? `
          <section class="res-section">
            <h4 class="res-section-title">Profile Overview</h4>
            <p style="margin: 0; font-size: 0.95rem; line-height: 1.7; color: #3f3f46;">${escapeHtml(resumeState.summary)}</p>
          </section>
        ` : ''}

        ${experiences.length > 0 ? `
          <section class="res-section">
            <h4 class="res-section-title">Career Milestones</h4>
            ${experiences.map(exp => `
              <div class="res-item">
                <div class="res-item-header">
                  <span>${escapeHtml(exp.role || '')}</span>
                  <span style="font-size: 0.85rem; font-weight: 400; color: #71717a;">${escapeHtml(exp.startDate ? `${exp.startDate} – ${exp.endDate || 'Present'}` : '')}</span>
                </div>
                <div class="res-item-sub">
                  <span>${escapeHtml(exp.company || '')}${exp.location ? ` / ${escapeHtml(exp.location)}` : ''}</span>
                </div>
                ${exp.bullets && exp.bullets.length > 0 ? `
                  <ul class="res-bullets">
                    ${exp.bullets.map(b => `<li>${escapeHtml(b)}</li>`).join('')}
                  </ul>
                ` : ''}
              </div>
            `).join('')}
          </section>
        ` : ''}

        ${educations.length > 0 ? `
          <section class="res-section">
            <h4 class="res-section-title">Academic Background</h4>
            ${educations.map(edu => `
              <div class="res-item">
                <div class="res-item-header">
                  <span>${escapeHtml(edu.degree || '')}</span>
                  <span style="font-size: 0.85rem; font-weight: 400; color: #71717a;">${escapeHtml(edu.gradYear || '')}</span>
                </div>
                <div class="res-item-sub">
                  <span>${escapeHtml(edu.school || '')}</span>
                </div>
                ${edu.details ? `<div style="font-size: 0.85rem; color: #71717a; margin-top: 0.15rem;">${escapeHtml(edu.details)}</div>` : ''}
              </div>
            `).join('')}
          </section>
        ` : ''}

        ${skillList.length > 0 ? `
          <section class="res-section">
            <h4 class="res-section-title">Core Competencies</h4>
            <div style="font-size: 0.9rem; line-height: 1.8; color: #3f3f46;">
              ${escapeHtml(skillList.join('   |   '))}
            </div>
          </section>
        ` : ''}
      `;
    }

    resumePaper.innerHTML = html;
  }

  // Update active template chip active class
  function updateActiveTemplateChip() {
    templateChips.forEach(chip => {
      if (chip.dataset.template === resumeState.activeTemplate) {
        chip.classList.add('active');
      } else {
        chip.classList.remove('active');
      }
    });
  }

  // Bind Tab Switching
  tabButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      tabButtons.forEach(b => b.classList.remove('active'));
      formSections.forEach(s => s.classList.remove('active'));

      btn.classList.add('active');
      const target = document.getElementById(btn.dataset.tab);
      if (target) target.classList.add('active');
    });
  });

  // Bind Template Chips
  templateChips.forEach(chip => {
    chip.addEventListener('click', () => {
      resumeState.activeTemplate = chip.dataset.template;
      updateActiveTemplateChip();
      renderResumePreview();
      saveState();
    });
  });

  // Input bindings for Personal details
  [inpName, inpTitle, inpEmail, inpPhone, inpLocation, inpWebsite].forEach(input => {
    input.addEventListener('input', () => {
      resumeState.personal.name = inpName.value;
      resumeState.personal.title = inpTitle.value;
      resumeState.personal.email = inpEmail.value;
      resumeState.personal.phone = inpPhone.value;
      resumeState.personal.location = inpLocation.value;
      resumeState.personal.website = inpWebsite.value;
      renderResumePreview();
      saveState();
    });
  });

  inpSummary.addEventListener('input', () => {
    resumeState.summary = inpSummary.value;
    renderResumePreview();
    saveState();
  });

  inpSkills.addEventListener('input', () => {
    resumeState.skills = inpSkills.value;
    renderResumePreview();
    saveState();
  });

  // Add Experience Button
  btnAddExp.addEventListener('click', () => {
    if (!resumeState.experience) resumeState.experience = [];
    resumeState.experience.unshift({
      id: 'exp-' + Date.now(),
      role: 'Senior Role Title',
      company: 'Organization Name',
      location: 'City, State',
      startDate: '2023',
      endDate: 'Present',
      bullets: [
        'Delivered strategic technical initiatives resulting in quantifiable impact.',
        'Collaborated with cross-functional leadership teams.'
      ]
    });
    renderExperienceForms();
    renderResumePreview();
    saveState();
  });

  // Add Education Button
  btnAddEdu.addEventListener('click', () => {
    if (!resumeState.education) resumeState.education = [];
    resumeState.education.unshift({
      id: 'edu-' + Date.now(),
      degree: 'B.S. in Computer Science',
      school: 'University Name',
      location: 'City, State',
      gradYear: '2020',
      details: 'Relevant coursework and honors'
    });
    renderEducationForms();
    renderResumePreview();
    saveState();
  });

  // Load Sample Button
  btnLoadSample.addEventListener('click', () => {
    if (confirm('Load sample executive resume? Any unsaved edits will be replaced.')) {
      resumeState = cloneData(SAMPLE_RESUME);
      populateEditor();
      renderResumePreview();
      saveState();
    }
  });

  // Reset Button
  btnReset.addEventListener('click', () => {
    if (confirm('Are you sure you want to clear this resume?')) {
      resumeState = {
        personal: { name: '', title: '', email: '', phone: '', location: '', website: '' },
        summary: '',
        experience: [],
        education: [],
        skills: '',
        activeTemplate: resumeState.activeTemplate || 'template-classic'
      };
      populateEditor();
      renderResumePreview();
      saveState();
    }
  });

  // Print Action
  btnPrint.addEventListener('click', () => {
    window.print();
  });

  // Copy Plain Text Action
  btnCopyText.addEventListener('click', async () => {
    try {
      const p = resumeState.personal || {};
      let txt = `${p.name || ''}\n${p.title || ''}\n`;
      txt += `Contact: ${[p.email, p.phone, p.location, p.website].filter(Boolean).join(' | ')}\n\n`;

      if (resumeState.summary) {
        txt += `PROFESSIONAL SUMMARY\n${resumeState.summary}\n\n`;
      }

      if (resumeState.experience && resumeState.experience.length > 0) {
        txt += `PROFESSIONAL EXPERIENCE\n`;
        resumeState.experience.forEach(exp => {
          txt += `${exp.role || ''} - ${exp.company || ''} (${exp.startDate || ''} - ${exp.endDate || 'Present'})\n`;
          if (exp.bullets) {
            exp.bullets.forEach(b => {
              txt += `  * ${b}\n`;
            });
          }
          txt += '\n';
        });
      }

      if (resumeState.education && resumeState.education.length > 0) {
        txt += `EDUCATION\n`;
        resumeState.education.forEach(edu => {
          txt += `${edu.degree || ''} - ${edu.school || ''} (${edu.gradYear || ''})\n`;
          if (edu.details) txt += `  ${edu.details}\n`;
        });
        txt += '\n';
      }

      if (resumeState.skills) {
        txt += `CORE SKILLS\n${resumeState.skills}\n`;
      }

      await navigator.clipboard.writeText(txt.trim());
      const oldHtml = btnCopyText.innerHTML;
      btnCopyText.innerHTML = '✓ Copied!';
      setTimeout(() => {
        btnCopyText.innerHTML = oldHtml;
      }, 2000);
    } catch (e) {
      alert('Failed to copy to clipboard.');
    }
  });

  // JSON Export / Import
  btnExportJson.addEventListener('click', () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(resumeState, null, 2));
    const a = document.createElement('a');
    a.setAttribute('href', dataStr);
    a.setAttribute('download', `${(resumeState.personal.name || 'resume').toLowerCase().replace(/\s+/g, '_')}_cv.json`);
    document.body.appendChild(a);
    a.click();
    a.remove();
  });

  fileImportJson.addEventListener('change', (e) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const parsed = JSON.parse(evt.target.result);
        if (parsed && parsed.personal) {
          resumeState = parsed;
          populateEditor();
          renderResumePreview();
          saveState();
        } else {
          alert('Invalid resume JSON file structure.');
        }
      } catch (err) {
        alert('Could not parse JSON file.');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  });

  // Initial Boot
  populateEditor();
  renderResumePreview();
});