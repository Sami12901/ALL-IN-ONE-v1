// Resume Generator Script
document.addEventListener('DOMContentLoaded', () => {

  let currentStep = 1;
  const totalSteps = 6;

  const btnPrev = document.getElementById('btn-prev');
  const btnNext = document.getElementById('btn-next');
  const btnExport = document.getElementById('btn-export');
  const indicators = document.querySelectorAll('.step-indicator');
  const steps = document.querySelectorAll('.wizard-step-content');

  // Navigation Logic
  function updateWizard() {
    // Buttons
    btnPrev.style.display = currentStep === 1 ? 'none' : 'block';
    
    if (currentStep === totalSteps) {
      btnNext.style.display = 'none';
      btnExport.style.display = 'block';
      renderResume(); // Render on final step
    } else {
      btnNext.style.display = 'block';
      btnExport.style.display = 'none';
    }

    // Indicators
    indicators.forEach((ind, index) => {
      const stepNum = index + 1;
      ind.classList.remove('active', 'completed');
      if (stepNum < currentStep) {
        ind.classList.add('completed');
      } else if (stepNum === currentStep) {
        ind.classList.add('active');
      }
    });

    // Contents
    steps.forEach((step, index) => {
      if (index + 1 === currentStep) {
        step.classList.add('active');
      } else {
        step.classList.remove('active');
      }
    });
  }

  btnNext.addEventListener('click', () => {
    if (currentStep < totalSteps) {
      currentStep++;
      updateWizard();
    }
  });

  btnPrev.addEventListener('click', () => {
    if (currentStep > 1) {
      currentStep--;
      updateWizard();
    }
  });

  // Dynamic Lists (Experience & Education)
  window.addExperience = function() {
    const list = document.getElementById('exp-list');
    const item = document.createElement('div');
    item.className = 'list-item exp-item';
    item.innerHTML = `
      <button class="remove-btn" onclick="this.parentElement.remove()">✕</button>
      <div class="form-row" style="margin-bottom:0.5rem">
        <div class="form-group" style="margin:0"><input type="text" class="exp-title" placeholder="Job Title"></div>
        <div class="form-group" style="margin:0"><input type="text" class="exp-company" placeholder="Company Name"></div>
      </div>
      <div class="form-row" style="margin-bottom:0.5rem">
        <div class="form-group" style="margin:0"><input type="text" class="exp-date" placeholder="Start - End (e.g. 2020 - Present)"></div>
      </div>
      <div class="form-group" style="margin:0"><textarea class="exp-desc" rows="2" placeholder="Description/Achievements..."></textarea></div>
    `;
    list.appendChild(item);
  };

  window.addEducation = function() {
    const list = document.getElementById('edu-list');
    const item = document.createElement('div');
    item.className = 'list-item edu-item';
    item.innerHTML = `
      <button class="remove-btn" onclick="this.parentElement.remove()">✕</button>
      <div class="form-row" style="margin-bottom:0.5rem">
        <div class="form-group" style="margin:0"><input type="text" class="edu-degree" placeholder="Degree (e.g. BSc Computer Science)"></div>
        <div class="form-group" style="margin:0"><input type="text" class="edu-school" placeholder="School/University"></div>
      </div>
      <div class="form-row">
        <div class="form-group" style="margin:0"><input type="text" class="edu-date" placeholder="Year (e.g. 2018 - 2022)"></div>
      </div>
    `;
    list.appendChild(item);
  };

  window.addProject = function() {
    const list = document.getElementById('proj-list');
    const item = document.createElement('div');
    item.className = 'list-item proj-item';
    item.innerHTML = `
      <button class="remove-btn" onclick="this.parentElement.remove()">✕</button>
      <div class="form-row" style="margin-bottom:0.5rem">
        <div class="form-group" style="margin:0"><input type="text" class="proj-title" placeholder="Project Name"></div>
        <div class="form-group" style="margin:0"><input type="text" class="proj-link" placeholder="Link / GitHub"></div>
      </div>
      <div class="form-group" style="margin:0"><textarea class="proj-desc" rows="2" placeholder="Description/Technologies used..."></textarea></div>
    `;
    list.appendChild(item);
  };

  window.addCertification = function() {
    const list = document.getElementById('cert-list');
    const item = document.createElement('div');
    item.className = 'list-item cert-item';
    item.innerHTML = `
      <button class="remove-btn" onclick="this.parentElement.remove()">✕</button>
      <div class="form-row" style="margin-bottom:0.5rem">
        <div class="form-group" style="margin:0"><input type="text" class="cert-title" placeholder="Certification Name"></div>
        <div class="form-group" style="margin:0"><input type="text" class="cert-issuer" placeholder="Issuer (e.g. Coursera)"></div>
      </div>
      <div class="form-row">
        <div class="form-group" style="margin:0"><input type="text" class="cert-date" placeholder="Year"></div>
      </div>
    `;
    list.appendChild(item);
  };

  window.addLanguage = function() {
    const list = document.getElementById('lang-list');
    const item = document.createElement('div');
    item.className = 'list-item lang-item';
    item.innerHTML = `
      <button class="remove-btn" onclick="this.parentElement.remove()">✕</button>
      <div class="form-row">
        <div class="form-group" style="margin:0"><input type="text" class="lang-name" placeholder="Language (e.g. English)"></div>
        <div class="form-group" style="margin:0"><input type="text" class="lang-level" placeholder="Level (e.g. Native, Fluent)"></div>
      </div>
    `;
    list.appendChild(item);
  };

  window.addReference = function() {
    const list = document.getElementById('ref-list');
    const item = document.createElement('div');
    item.className = 'list-item ref-item';
    item.innerHTML = `
      <button class="remove-btn" onclick="this.parentElement.remove()">✕</button>
      <div class="form-row" style="margin-bottom:0.5rem">
        <div class="form-group" style="margin:0"><input type="text" class="ref-name" placeholder="Reference Name"></div>
        <div class="form-group" style="margin:0"><input type="text" class="ref-pos" placeholder="Position / Company"></div>
      </div>
      <div class="form-row">
        <div class="form-group" style="margin:0"><input type="text" class="ref-contact" placeholder="Email / Phone"></div>
      </div>
    `;
    list.appendChild(item);
  };

  // Pre-fill one of each just for UX
  addExperience();
  addEducation();

  // Rendering the Resume (Reusing CV Builder logic)
  const templateSelect = document.getElementById('template-select');
  const accentColor = document.getElementById('accent-color');
  const cvPaper = document.getElementById('cv-paper');

  // Populate templates
  if (typeof CV_TEMPLATES !== 'undefined') {
    const groups = {};
    CV_TEMPLATES.forEach(t => {
      if (!groups[t.group]) groups[t.group] = [];
      groups[t.group].push(t);
    });
    Object.keys(groups).forEach(groupName => {
      const optgroup = document.createElement('optgroup');
      optgroup.label = groupName;
      groups[groupName].forEach(t => {
        const opt = document.createElement('option');
        opt.value = t.id;
        opt.textContent = t.name;
        optgroup.appendChild(opt);
      });
      templateSelect.appendChild(optgroup);
    });
  }

  templateSelect.addEventListener('change', renderResume);
  accentColor.addEventListener('input', renderResume);

  function renderResume() {
    const tplConfig = (typeof CV_TEMPLATES !== 'undefined') ? 
      (CV_TEMPLATES.find(t => t.id === templateSelect.value) || CV_TEMPLATES[0]) : null;

    if (!tplConfig) return;

    // SVG icons
    const icons = {
      email: '<svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2" style="vertical-align:-2px"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>',
      phone: '<svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2" style="vertical-align:-2px"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>',
      location: '<svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2" style="vertical-align:-2px"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>'
    };

    // Gather data
    const fullName = [document.getElementById('firstName').value.trim(), document.getElementById('lastName').value.trim()].join(' ').trim() || 'Your Name';
    const jobTitle = document.getElementById('jobTitle').value.trim() || 'Professional Title';
    const email = document.getElementById('email').value.trim();
    const phone = document.getElementById('phone').value.trim();
    const address = document.getElementById('address').value.trim();
    const summary = document.getElementById('summary').value.trim();
    
    let contactHTML = '';
    if (email) contactHTML += `<span>${icons.email} ${email}</span>`;
    if (phone) contactHTML += `<span>${icons.phone} ${phone}</span>`;
    if (address) contactHTML += `<span>${icons.location} ${address}</span>`;

    let headerHTML = `
      <div class="cv-header">
        <h1>${fullName}</h1>
        <p class="cv-title">${jobTitle}</p>
        <div class="cv-contact">${contactHTML}</div>
      </div>
    `;

    let bodyHTML = '';

    if (summary) {
      bodyHTML += `
        <div class="cv-section">
          <div class="cv-section-title">Summary</div>
          <div class="cv-summary">${summary.replace(/\n/g, '<br>')}</div>
        </div>
      `;
    }

    // Experience
    const expItems = document.querySelectorAll('.exp-item');
    if (expItems.length > 0) {
      let entriesHTML = '';
      expItems.forEach(item => {
        const title = item.querySelector('.exp-title').value.trim();
        const company = item.querySelector('.exp-company').value.trim();
        const date = item.querySelector('.exp-date').value.trim();
        const desc = item.querySelector('.exp-desc').value.trim();
        if (title || company) {
          entriesHTML += `
            <div class="cv-entry">
              <div class="cv-entry-header">
                <span class="cv-entry-title">${title}</span>
                <span class="cv-entry-date">${date}</span>
              </div>
              <div class="cv-entry-subtitle">${company}</div>
              ${desc ? `<div class="cv-entry-desc">${desc.replace(/\n/g, '<br>')}</div>` : ''}
            </div>
          `;
        }
      });
      if (entriesHTML) {
        bodyHTML += `<div class="cv-section"><div class="cv-section-title">Experience</div>${entriesHTML}</div>`;
      }
    }

    // Projects
    const projItems = document.querySelectorAll('.proj-item');
    if (projItems.length > 0) {
      let entriesHTML = '';
      projItems.forEach(item => {
        const title = item.querySelector('.proj-title').value.trim();
        const link = item.querySelector('.proj-link').value.trim();
        const desc = item.querySelector('.proj-desc').value.trim();
        if (title) {
          entriesHTML += `
            <div class="cv-entry">
              <div class="cv-entry-header">
                <span class="cv-entry-title">${title}</span>
              </div>
              <div class="cv-entry-subtitle">${link}</div>
              ${desc ? `<div class="cv-entry-desc">${desc.replace(/\n/g, '<br>')}</div>` : ''}
            </div>
          `;
        }
      });
      if (entriesHTML) {
        bodyHTML += `<div class="cv-section"><div class="cv-section-title">Projects</div>${entriesHTML}</div>`;
      }
    }

    // Education
    const eduItems = document.querySelectorAll('.edu-item');
    if (eduItems.length > 0) {
      let entriesHTML = '';
      eduItems.forEach(item => {
        const degree = item.querySelector('.edu-degree').value.trim();
        const school = item.querySelector('.edu-school').value.trim();
        const date = item.querySelector('.edu-date').value.trim();
        if (degree || school) {
          entriesHTML += `
            <div class="cv-entry">
              <div class="cv-entry-header">
                <span class="cv-entry-title">${degree}</span>
                <span class="cv-entry-date">${date}</span>
              </div>
              <div class="cv-entry-subtitle">${school}</div>
            </div>
          `;
        }
      });
      if (entriesHTML) {
        bodyHTML += `<div class="cv-section"><div class="cv-section-title">Education</div>${entriesHTML}</div>`;
      }
    }

    // Certifications
    const certItems = document.querySelectorAll('.cert-item');
    if (certItems.length > 0) {
      let entriesHTML = '';
      certItems.forEach(item => {
        const title = item.querySelector('.cert-title').value.trim();
        const issuer = item.querySelector('.cert-issuer').value.trim();
        const date = item.querySelector('.cert-date').value.trim();
        if (title) {
          entriesHTML += `
            <div class="cv-entry">
              <div class="cv-entry-header">
                <span class="cv-entry-title">${title}</span>
                <span class="cv-entry-date">${date}</span>
              </div>
              <div class="cv-entry-subtitle">${issuer}</div>
            </div>
          `;
        }
      });
      if (entriesHTML) {
        bodyHTML += `<div class="cv-section"><div class="cv-section-title">Certifications</div>${entriesHTML}</div>`;
      }
    }

    // Languages
    const langItems = document.querySelectorAll('.lang-item');
    if (langItems.length > 0) {
      let entriesHTML = '';
      langItems.forEach(item => {
        const name = item.querySelector('.lang-name').value.trim();
        const level = item.querySelector('.lang-level').value.trim();
        if (name) {
          entriesHTML += `<span class="cv-skill-tag">${name}${level ? ' — ' + level : ''}</span>`;
        }
      });
      if (entriesHTML) {
        bodyHTML += `<div class="cv-section"><div class="cv-section-title">Languages</div><div class="cv-skills-grid">${entriesHTML}</div></div>`;
      }
    }

    // References
    const refItems = document.querySelectorAll('.ref-item');
    if (refItems.length > 0) {
      let entriesHTML = '';
      refItems.forEach(item => {
        const name = item.querySelector('.ref-name').value.trim();
        const pos = item.querySelector('.ref-pos').value.trim();
        const contact = item.querySelector('.ref-contact').value.trim();
        if (name) {
          entriesHTML += `
            <div class="cv-entry">
              <div class="cv-entry-title">${name}</div>
              <div class="cv-entry-subtitle">${pos}</div>
              <div class="cv-entry-desc">${contact}</div>
            </div>
          `;
        }
      });
      if (entriesHTML) {
        bodyHTML += `<div class="cv-section"><div class="cv-section-title">References</div>${entriesHTML}</div>`;
      }
    }

    // Skills
    const skillsRaw = document.getElementById('skills').value.trim();
    if (skillsRaw) {
      const skillsList = skillsRaw.split(',').map(s => s.trim()).filter(s => s);
      let tagsHTML = skillsList.map(s => `<span class="cv-skill-tag">${s}</span>`).join('');
      bodyHTML += `<div class="cv-section"><div class="cv-section-title">Skills</div><div class="cv-skills-grid">${tagsHTML}</div></div>`;
    }

    cvPaper.innerHTML = headerHTML + `<div class="cv-body">${bodyHTML}</div>`;

    // Apply Styles
    const header = cvPaper.querySelector('.cv-header');
    const nameEl = cvPaper.querySelector('.cv-header h1');
    const contact = cvPaper.querySelector('.cv-contact');

    if (header) {
      header.style.background = tplConfig.headerBg || '#fff';
      header.style.color = tplConfig.headerColor || '#1f2937';
      header.style.fontFamily = tplConfig.headerFont || "'Inter', sans-serif";
      header.style.textAlign = tplConfig.headerAlign || 'left';
      header.style.borderBottom = tplConfig.headerBottomBorder || 'none';
      if (tplConfig.headerAccentBar) {
        const bar = document.createElement('div');
        bar.className = 'cv-header-accent-bar';
        bar.style.background = tplConfig.headerAccentBar;
        header.appendChild(bar);
      }
    }

    if (nameEl && tplConfig.nameColor) nameEl.style.color = tplConfig.nameColor;
    if (contact && tplConfig.headerAlign === 'center') contact.style.justifyContent = 'center';

    cvPaper.style.fontFamily = tplConfig.bodyFont || "'Inter', sans-serif";
    cvPaper.style.background = tplConfig.paperBg || '#fff';

    cvPaper.querySelectorAll('.cv-section-title').forEach(el => {
      el.style.color = tplConfig.titleColor || '#111827';
      el.style.fontFamily = tplConfig.headerFont || "'Inter', sans-serif";
      el.style.borderBottom = 'none';
      el.style.borderLeft = 'none';
      el.style.paddingLeft = '0';
      if (tplConfig.titleBorder === 'bottom') {
        el.style.borderBottom = `2px solid ${tplConfig.titleBorderColor || tplConfig.titleColor}`;
      } else if (tplConfig.titleBorder === 'left') {
        el.style.borderLeft = `4px solid ${tplConfig.titleBorderColor || tplConfig.titleColor}`;
        el.style.paddingLeft = '0.75rem';
      }
    });

    cvPaper.querySelectorAll('.cv-skill-tag').forEach(el => {
      el.style.background = tplConfig.skillBg || '#f3f4f6';
      el.style.color = tplConfig.skillColor || '#374151';
      el.style.border = tplConfig.skillBorder || 'none';
    });

    if (tplConfig.nameColor) {
      cvPaper.querySelectorAll('.cv-entry-title').forEach(el => { el.style.color = tplConfig.titleColor; });
    }
  }

  // Export
  btnExport.addEventListener('click', async () => {
    btnExport.disabled = true;
    btnExport.textContent = 'Generating PDF...';

    // Temporarily remove scaling for crisp export
    cvPaper.style.transform = 'none';
    cvPaper.style.marginBottom = '0';

    try {
      const opt = {
        margin: 0,
        filename: 'Generated_Resume.pdf',
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
      };
      await html2pdf().set(opt).from(cvPaper).save();
    } catch (err) {
      console.error(err);
      alert('Error exporting PDF');
    } finally {
      cvPaper.style.transform = 'scale(0.6)';
      cvPaper.style.marginBottom = '-100mm';
      btnExport.disabled = false;
      btnExport.textContent = 'Export PDF';
    }
  });
});
