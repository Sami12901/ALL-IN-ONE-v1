// Professional CV Builder Pro - Script
document.addEventListener('DOMContentLoaded', () => {

  // ===== Section Tabs =====
  const tabs = document.querySelectorAll('.section-tab');
  const sections = document.querySelectorAll('.form-section');
  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      tabs.forEach(t => t.classList.remove('active'));
      sections.forEach(s => s.classList.remove('active'));
      tab.classList.add('active');
      document.querySelector(`.form-section[data-section="${tab.dataset.section}"]`).classList.add('active');
    });
  });

  // ===== Photo Upload =====
  const photoUpload = document.getElementById('photo-upload');
  const photoInput = document.getElementById('photo-input');
  let photoDataURL = null;

  photoUpload.addEventListener('click', () => photoInput.click());
  photoInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        photoDataURL = ev.target.result;
        photoUpload.innerHTML = `<img src="${photoDataURL}" alt="Photo">`;
        renderCV();
      };
      reader.readAsDataURL(file);
    }
  });

  // ===== Template & Color =====
  const templateSelect = document.getElementById('template-select');
  const accentColor = document.getElementById('accent-color');
  const cvPaper = document.getElementById('cv-paper');

  templateSelect.addEventListener('change', () => {
    cvPaper.className = 'cv-paper tpl-' + templateSelect.value;
    renderCV();
  });

  accentColor.addEventListener('input', (e) => {
    document.documentElement.style.setProperty('--cv-accent', e.target.value);
    renderCV();
  });

  // ===== Live Preview Rendering =====
  function getVal(id) { return (document.getElementById(id)?.value || '').trim(); }

  function renderCV() {
    const tpl = templateSelect.value;
    const accent = accentColor.value;

    const firstName = getVal('firstName');
    const lastName = getVal('lastName');
    const fullName = (firstName + ' ' + lastName).trim() || 'Your Name';
    const jobTitle = getVal('jobTitle') || 'Your Job Title';
    const email = getVal('email');
    const phone = getVal('phone');
    const address = getVal('address');
    const linkedin = getVal('linkedin');
    const website = getVal('website');
    const summary = getVal('summary');

    // Contact items
    let contactHTML = '';
    if (email) contactHTML += `<span>✉ ${email}</span>`;
    if (phone) contactHTML += `<span>📱 ${phone}</span>`;
    if (address) contactHTML += `<span>📍 ${address}</span>`;
    if (linkedin) contactHTML += `<span>🔗 ${linkedin}</span>`;
    if (website) contactHTML += `<span>🌐 ${website}</span>`;

    // Photo
    let photoHTML = '';
    if (photoDataURL) {
      photoHTML = `<img class="cv-photo" src="${photoDataURL}" alt="Photo">`;
    }

    // Header
    let headerHTML = `
      <div class="cv-header">
        ${photoHTML}
        <h1>${fullName}</h1>
        <p class="cv-title">${jobTitle}</p>
        <div class="cv-contact">${contactHTML}</div>
      </div>
    `;

    // Body sections
    let bodyHTML = '';

    // Summary
    if (summary) {
      bodyHTML += `
        <div class="cv-section">
          <div class="cv-section-title">Professional Summary</div>
          <div class="cv-summary">${summary.replace(/\n/g, '<br>')}</div>
        </div>
      `;
    }

    // Experience
    const expEntries = collectEntries('experience');
    if (expEntries.length > 0) {
      let entriesHTML = '';
      expEntries.forEach(e => {
        entriesHTML += `
          <div class="cv-entry">
            <div class="cv-entry-header">
              <span class="cv-entry-title">${e.title || 'Position'}</span>
              <span class="cv-entry-date">${e.startDate || ''}${e.endDate ? ' – ' + e.endDate : ''}</span>
            </div>
            <div class="cv-entry-subtitle">${e.company || ''}</div>
            ${e.description ? `<div class="cv-entry-desc">${e.description.replace(/\n/g, '<br>')}</div>` : ''}
          </div>
        `;
      });
      bodyHTML += `<div class="cv-section"><div class="cv-section-title">Experience</div>${entriesHTML}</div>`;
    }

    // Education
    const eduEntries = collectEntries('education');
    if (eduEntries.length > 0) {
      let entriesHTML = '';
      eduEntries.forEach(e => {
        entriesHTML += `
          <div class="cv-entry">
            <div class="cv-entry-header">
              <span class="cv-entry-title">${e.degree || 'Degree'}</span>
              <span class="cv-entry-date">${e.startDate || ''}${e.endDate ? ' – ' + e.endDate : ''}</span>
            </div>
            <div class="cv-entry-subtitle">${e.institution || ''}</div>
            ${e.description ? `<div class="cv-entry-desc">${e.description.replace(/\n/g, '<br>')}</div>` : ''}
          </div>
        `;
      });
      bodyHTML += `<div class="cv-section"><div class="cv-section-title">Education</div>${entriesHTML}</div>`;
    }

    // Skills
    const skillsRaw = getVal('skills');
    if (skillsRaw) {
      const skillsList = skillsRaw.split(',').map(s => s.trim()).filter(s => s);
      let tagsHTML = skillsList.map(s => `<span class="cv-skill-tag">${s}</span>`).join('');
      bodyHTML += `<div class="cv-section"><div class="cv-section-title">Skills</div><div class="cv-skills-grid">${tagsHTML}</div></div>`;
    }

    // Projects
    const projEntries = collectEntries('project');
    if (projEntries.length > 0) {
      let entriesHTML = '';
      projEntries.forEach(e => {
        entriesHTML += `
          <div class="cv-entry">
            <div class="cv-entry-header">
              <span class="cv-entry-title">${e.name || 'Project'}</span>
              <span class="cv-entry-date">${e.link || ''}</span>
            </div>
            ${e.description ? `<div class="cv-entry-desc">${e.description.replace(/\n/g, '<br>')}</div>` : ''}
          </div>
        `;
      });
      bodyHTML += `<div class="cv-section"><div class="cv-section-title">Projects</div>${entriesHTML}</div>`;
    }

    // Certifications
    const certEntries = collectEntries('cert');
    if (certEntries.length > 0) {
      let entriesHTML = '';
      certEntries.forEach(e => {
        entriesHTML += `
          <div class="cv-entry">
            <div class="cv-entry-header">
              <span class="cv-entry-title">${e.name || 'Certification'}</span>
              <span class="cv-entry-date">${e.date || ''}</span>
            </div>
            <div class="cv-entry-subtitle">${e.issuer || ''}</div>
          </div>
        `;
      });
      bodyHTML += `<div class="cv-section"><div class="cv-section-title">Certifications</div>${entriesHTML}</div>`;
    }

    // Languages
    const langEntries = collectEntries('lang');
    if (langEntries.length > 0) {
      let tagsHTML = langEntries.map(e => `<span class="cv-skill-tag">${e.language || 'Language'}${e.level ? ' — ' + e.level : ''}</span>`).join('');
      bodyHTML += `<div class="cv-section"><div class="cv-section-title">Languages</div><div class="cv-skills-grid">${tagsHTML}</div></div>`;
    }

    // References
    const refEntries = collectEntries('ref');
    if (refEntries.length > 0) {
      let entriesHTML = '';
      refEntries.forEach(e => {
        entriesHTML += `
          <div class="cv-entry">
            <div class="cv-entry-title">${e.name || 'Reference'}</div>
            <div class="cv-entry-subtitle">${e.position || ''}</div>
            <div class="cv-entry-desc">${[e.email, e.phone].filter(x => x).join(' | ')}</div>
          </div>
        `;
      });
      bodyHTML += `<div class="cv-section"><div class="cv-section-title">References</div>${entriesHTML}</div>`;
    }

    // Apply accent color to template-specific elements
    cvPaper.innerHTML = headerHTML + `<div class="cv-body">${bodyHTML}</div>`;
    applyAccentColor(accent, tpl);
  }

  function applyAccentColor(color, tpl) {
    if (tpl === 'modern') {
      const header = cvPaper.querySelector('.cv-header');
      if (header) header.style.background = `linear-gradient(135deg, ${color}, ${adjustColor(color, 40)})`;
      cvPaper.querySelectorAll('.cv-section-title').forEach(el => { el.style.color = color; el.style.borderBottomColor = color; });
      cvPaper.querySelectorAll('.cv-skill-tag').forEach(el => { el.style.background = hexToRgba(color, 0.1); el.style.color = color; });
    } else if (tpl === 'developer') {
      cvPaper.querySelectorAll('.cv-section-title').forEach(el => { el.style.color = color; el.style.borderLeftColor = color; });
      const header = cvPaper.querySelector('.cv-header h1');
      if (header) header.style.color = color;
      cvPaper.querySelectorAll('.cv-skill-tag').forEach(el => { el.style.color = color; });
    } else if (tpl === 'executive') {
      const header = cvPaper.querySelector('.cv-header');
      if (header) header.style.background = `linear-gradient(135deg, ${color}, ${adjustColor(color, 30)})`;
      cvPaper.querySelectorAll('.cv-section-title').forEach(el => { el.style.color = color; });
      cvPaper.querySelectorAll('.cv-entry-title').forEach(el => { el.style.color = color; });
      cvPaper.querySelectorAll('.cv-skill-tag').forEach(el => { el.style.background = hexToRgba(color, 0.08); el.style.color = color; });
    } else if (tpl === 'classic') {
      // Classic is mostly neutral
    }
  }

  // ===== Entry Collectors =====
  function collectEntries(type) {
    const container = document.getElementById(type + '-entries');
    if (!container) return [];
    const cards = container.querySelectorAll('.entry-card');
    const results = [];
    cards.forEach(card => {
      const obj = {};
      card.querySelectorAll('[data-field]').forEach(inp => {
        obj[inp.dataset.field] = inp.value.trim();
      });
      results.push(obj);
    });
    return results;
  }

  // ===== Add Entry Functions =====
  window.addEducation = function() {
    const container = document.getElementById('education-entries');
    const card = document.createElement('div');
    card.className = 'entry-card';
    card.innerHTML = `
      <button class="delete-entry" onclick="this.parentElement.remove();renderCV()">✕</button>
      <div class="form-group"><label>Degree</label><input type="text" data-field="degree" placeholder="BSc Computer Science" oninput="renderCV()"></div>
      <div class="form-group"><label>Institution</label><input type="text" data-field="institution" placeholder="University of Dhaka" oninput="renderCV()"></div>
      <div class="form-row">
        <div class="form-group"><label>Start</label><input type="text" data-field="startDate" placeholder="2018" oninput="renderCV()"></div>
        <div class="form-group"><label>End</label><input type="text" data-field="endDate" placeholder="2022" oninput="renderCV()"></div>
      </div>
      <div class="form-group"><label>Details (Optional)</label><textarea data-field="description" rows="2" placeholder="GPA, Achievements..." oninput="renderCV()"></textarea></div>
    `;
    container.appendChild(card);
    renderCV();
  };

  window.addExperience = function() {
    const container = document.getElementById('experience-entries');
    const card = document.createElement('div');
    card.className = 'entry-card';
    card.innerHTML = `
      <button class="delete-entry" onclick="this.parentElement.remove();renderCV()">✕</button>
      <div class="form-group"><label>Job Title</label><input type="text" data-field="title" placeholder="Software Engineer" oninput="renderCV()"></div>
      <div class="form-group"><label>Company</label><input type="text" data-field="company" placeholder="Google" oninput="renderCV()"></div>
      <div class="form-row">
        <div class="form-group"><label>Start</label><input type="text" data-field="startDate" placeholder="Jan 2022" oninput="renderCV()"></div>
        <div class="form-group"><label>End</label><input type="text" data-field="endDate" placeholder="Present" oninput="renderCV()"></div>
      </div>
      <div class="form-group"><label>Description</label><textarea data-field="description" rows="3" placeholder="Key responsibilities and achievements..." oninput="renderCV()"></textarea></div>
    `;
    container.appendChild(card);
    renderCV();
  };

  window.addProject = function() {
    const container = document.getElementById('project-entries');
    const card = document.createElement('div');
    card.className = 'entry-card';
    card.innerHTML = `
      <button class="delete-entry" onclick="this.parentElement.remove();renderCV()">✕</button>
      <div class="form-group"><label>Project Name</label><input type="text" data-field="name" placeholder="E-commerce Platform" oninput="renderCV()"></div>
      <div class="form-group"><label>Link (Optional)</label><input type="text" data-field="link" placeholder="github.com/user/project" oninput="renderCV()"></div>
      <div class="form-group"><label>Description</label><textarea data-field="description" rows="3" placeholder="Technologies used and what it does..." oninput="renderCV()"></textarea></div>
    `;
    container.appendChild(card);
    renderCV();
  };

  window.addCert = function() {
    const container = document.getElementById('cert-entries');
    const card = document.createElement('div');
    card.className = 'entry-card';
    card.innerHTML = `
      <button class="delete-entry" onclick="this.parentElement.remove();renderCV()">✕</button>
      <div class="form-group"><label>Certification Name</label><input type="text" data-field="name" placeholder="AWS Solutions Architect" oninput="renderCV()"></div>
      <div class="form-row">
        <div class="form-group"><label>Issuer</label><input type="text" data-field="issuer" placeholder="Amazon Web Services" oninput="renderCV()"></div>
        <div class="form-group"><label>Date</label><input type="text" data-field="date" placeholder="2023" oninput="renderCV()"></div>
      </div>
    `;
    container.appendChild(card);
    renderCV();
  };

  window.addLang = function() {
    const container = document.getElementById('lang-entries');
    const card = document.createElement('div');
    card.className = 'entry-card';
    card.innerHTML = `
      <button class="delete-entry" onclick="this.parentElement.remove();renderCV()">✕</button>
      <div class="form-row">
        <div class="form-group"><label>Language</label><input type="text" data-field="language" placeholder="English" oninput="renderCV()"></div>
        <div class="form-group"><label>Level</label>
          <select data-field="level" oninput="renderCV()">
            <option value="Native">Native</option>
            <option value="Fluent">Fluent</option>
            <option value="Advanced">Advanced</option>
            <option value="Intermediate">Intermediate</option>
            <option value="Basic">Basic</option>
          </select>
        </div>
      </div>
    `;
    container.appendChild(card);
    renderCV();
  };

  window.addRef = function() {
    const container = document.getElementById('ref-entries');
    const card = document.createElement('div');
    card.className = 'entry-card';
    card.innerHTML = `
      <button class="delete-entry" onclick="this.parentElement.remove();renderCV()">✕</button>
      <div class="form-group"><label>Full Name</label><input type="text" data-field="name" placeholder="Dr. Jane Smith" oninput="renderCV()"></div>
      <div class="form-group"><label>Position</label><input type="text" data-field="position" placeholder="Professor, Computer Science" oninput="renderCV()"></div>
      <div class="form-row">
        <div class="form-group"><label>Email</label><input type="text" data-field="email" placeholder="jane@university.edu" oninput="renderCV()"></div>
        <div class="form-group"><label>Phone</label><input type="text" data-field="phone" placeholder="+880 1234567890" oninput="renderCV()"></div>
      </div>
    `;
    container.appendChild(card);
    renderCV();
  };

  // Make renderCV globally accessible
  window.renderCV = renderCV;

  // ===== Live Input Listeners =====
  const liveFields = ['firstName', 'lastName', 'jobTitle', 'email', 'phone', 'address', 'linkedin', 'website', 'summary', 'skills'];
  liveFields.forEach(id => {
    const el = document.getElementById(id);
    if (el) el.addEventListener('input', renderCV);
  });

  // ===== Export PDF =====
  document.getElementById('export-pdf-btn').addEventListener('click', async () => {
    const btn = document.getElementById('export-pdf-btn');
    btn.disabled = true;
    btn.textContent = 'Generating...';

    try {
      const element = document.getElementById('cv-paper');
      const opt = {
        margin: 0,
        filename: `CV_${getVal('firstName') || 'My'}_${getVal('lastName') || 'CV'}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true, letterRendering: true },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
      };
      await html2pdf().set(opt).from(element).save();
    } catch (err) {
      console.error(err);
      alert('Error generating PDF. Please try again.');
    } finally {
      btn.disabled = false;
      btn.innerHTML = `<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg> Export PDF`;
    }
  });

  // ===== Color Utilities =====
  function hexToRgba(hex, alpha) {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r},${g},${b},${alpha})`;
  }

  function adjustColor(hex, amount) {
    let r = parseInt(hex.slice(1, 3), 16);
    let g = parseInt(hex.slice(3, 5), 16);
    let b = parseInt(hex.slice(5, 7), 16);
    r = Math.min(255, r + amount);
    g = Math.min(255, g + amount);
    b = Math.min(255, b + amount);
    return `#${r.toString(16).padStart(2,'0')}${g.toString(16).padStart(2,'0')}${b.toString(16).padStart(2,'0')}`;
  }

  // ===== Initial Render =====
  renderCV();
});
