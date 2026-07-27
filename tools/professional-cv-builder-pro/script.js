// CV Builder Logic
document.addEventListener('DOMContentLoaded', () => {

  // --- Initial State ---
  let cvData = {
    personal: {
      name: 'John Doe',
      title: 'Senior Software Engineer',
      email: 'john@example.com',
      phone: '+1 234 567 890',
      location: 'New York, USA',
      link: 'linkedin.com/in/johndoe'
    },
    summary: 'Passionate and results-driven software engineer with over 5 years of experience in building scalable web applications. Proven ability to lead teams, architect complex systems, and deliver high-quality software on time.',
    experience: [
      {
        id: 'exp-1',
        title: 'Senior Web Developer',
        company: 'Tech Corp Inc.',
        date: 'Jan 2020 - Present',
        description: '- Led the frontend team to rebuild the core SaaS product using React and Redux.\n- Improved application performance by 40%.\n- Mentored junior developers and established coding standards.'
      }
    ],
    education: [
      {
        id: 'edu-1',
        degree: 'Bachelor of Science in Computer Science',
        school: 'University of Technology',
        date: 'Sep 2014 - May 2018',
        description: 'Graduated with Honors. Specialized in Software Engineering and Database Systems.'
      }
    ],
    skills: ['JavaScript', 'React', 'Node.js', 'TypeScript', 'HTML/CSS', 'Git']
  };

  // Load from local storage if exists
  const savedData = localStorage.getItem('cv_builder_data');
  if (savedData) {
    try {
      cvData = JSON.parse(savedData);
    } catch (e) { console.error('Failed to parse saved CV data'); }
  }

  // --- Navigation ---
  const navBtns = document.querySelectorAll('.nav-btn');
  const sections = document.querySelectorAll('.cv-section');

  navBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      navBtns.forEach(b => b.classList.remove('active'));
      sections.forEach(s => s.classList.remove('active'));
      
      btn.classList.add('active');
      document.getElementById(btn.dataset.target).classList.add('active');
    });
  });

  // --- Two-way Binding for Personal Info & Summary ---
  const bindElements = document.querySelectorAll('[data-bind]');
  
  function updateDataFromInput(e) {
    const key = e.target.getAttribute('data-bind');
    if (key === 'summary') {
      cvData.summary = e.target.value;
    } else {
      cvData.personal[key] = e.target.value;
    }
    saveData();
    renderPreview();
  }

  bindElements.forEach(el => {
    el.addEventListener('input', updateDataFromInput);
  });

  // --- Dynamic Lists (Experience & Education) ---
  const expListEl = document.getElementById('experience-list');
  const eduListEl = document.getElementById('education-list');
  const addExpBtn = document.getElementById('add-experience-btn');
  const addEduBtn = document.getElementById('add-education-btn');

  function createExpForm(exp) {
    const div = document.createElement('div');
    div.className = 'dynamic-item form-grid';
    div.dataset.id = exp.id;
    
    div.innerHTML = `
      <div class="dynamic-item-header" style="grid-column: span 2;">
        <h4>Experience Entry</h4>
        <button class="remove-btn remove-exp" title="Remove"><svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg></button>
      </div>
      <div class="form-group">
        <label>Job Title</label>
        <input type="text" class="form-input exp-title" value="${exp.title}" placeholder="e.g. Software Engineer">
      </div>
      <div class="form-group">
        <label>Company</label>
        <input type="text" class="form-input exp-company" value="${exp.company}" placeholder="e.g. Google">
      </div>
      <div class="form-group" style="grid-column: span 2;">
        <label>Date Range</label>
        <input type="text" class="form-input exp-date" value="${exp.date}" placeholder="e.g. Jan 2020 - Present">
      </div>
      <div class="form-group" style="grid-column: span 2;">
        <label>Description</label>
        <textarea class="form-textarea exp-desc" style="min-height: 100px;" placeholder="Describe your responsibilities...">${exp.description}</textarea>
      </div>
    `;

    // Event listeners
    div.querySelectorAll('input, textarea').forEach(input => {
      input.addEventListener('input', updateExperienceData);
    });
    div.querySelector('.remove-exp').addEventListener('click', () => {
      cvData.experience = cvData.experience.filter(e => e.id !== exp.id);
      div.remove();
      saveData();
      renderPreview();
    });

    return div;
  }

  function createEduForm(edu) {
    const div = document.createElement('div');
    div.className = 'dynamic-item form-grid';
    div.dataset.id = edu.id;
    
    div.innerHTML = `
      <div class="dynamic-item-header" style="grid-column: span 2;">
        <h4>Education Entry</h4>
        <button class="remove-btn remove-edu" title="Remove"><svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg></button>
      </div>
      <div class="form-group">
        <label>Degree / Certificate</label>
        <input type="text" class="form-input edu-degree" value="${edu.degree}" placeholder="e.g. BSc Computer Science">
      </div>
      <div class="form-group">
        <label>School / University</label>
        <input type="text" class="form-input edu-school" value="${edu.school}" placeholder="e.g. MIT">
      </div>
      <div class="form-group" style="grid-column: span 2;">
        <label>Date Range</label>
        <input type="text" class="form-input edu-date" value="${edu.date}" placeholder="e.g. Sep 2014 - May 2018">
      </div>
      <div class="form-group" style="grid-column: span 2;">
        <label>Description (Optional)</label>
        <textarea class="form-textarea edu-desc" style="min-height: 80px;" placeholder="Relevant courses, honors...">${edu.description}</textarea>
      </div>
    `;

    // Event listeners
    div.querySelectorAll('input, textarea').forEach(input => {
      input.addEventListener('input', updateEducationData);
    });
    div.querySelector('.remove-edu').addEventListener('click', () => {
      cvData.education = cvData.education.filter(e => e.id !== edu.id);
      div.remove();
      saveData();
      renderPreview();
    });

    return div;
  }

  function updateExperienceData() {
    const items = expListEl.querySelectorAll('.dynamic-item');
    cvData.experience = Array.from(items).map(item => ({
      id: item.dataset.id,
      title: item.querySelector('.exp-title').value,
      company: item.querySelector('.exp-company').value,
      date: item.querySelector('.exp-date').value,
      description: item.querySelector('.exp-desc').value
    }));
    saveData();
    renderPreview();
  }

  function updateEducationData() {
    const items = eduListEl.querySelectorAll('.dynamic-item');
    cvData.education = Array.from(items).map(item => ({
      id: item.dataset.id,
      degree: item.querySelector('.edu-degree').value,
      school: item.querySelector('.edu-school').value,
      date: item.querySelector('.edu-date').value,
      description: item.querySelector('.edu-desc').value
    }));
    saveData();
    renderPreview();
  }

  addExpBtn.addEventListener('click', () => {
    const newExp = { id: 'exp-' + Date.now(), title: '', company: '', date: '', description: '' };
    cvData.experience.push(newExp);
    expListEl.appendChild(createExpForm(newExp));
    saveData();
    renderPreview();
  });

  addEduBtn.addEventListener('click', () => {
    const newEdu = { id: 'edu-' + Date.now(), degree: '', school: '', date: '', description: '' };
    cvData.education.push(newEdu);
    eduListEl.appendChild(createEduForm(newEdu));
    saveData();
    renderPreview();
  });

  // --- Skills ---
  const skillsInput = document.getElementById('cv-skills-input');
  const skillsTags = document.getElementById('skills-tags');

  function renderSkillTags() {
    skillsTags.innerHTML = '';
    cvData.skills.forEach((skill, index) => {
      const tag = document.createElement('div');
      tag.className = 'skill-tag';
      tag.innerHTML = `
        ${skill}
        <button data-index="${index}"><svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg></button>
      `;
      tag.querySelector('button').addEventListener('click', () => {
        cvData.skills.splice(index, 1);
        saveData();
        renderSkillTags();
        renderPreview();
      });
      skillsTags.appendChild(tag);
    });
  }

  skillsInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      const val = skillsInput.value.trim();
      if (val && !cvData.skills.includes(val)) {
        cvData.skills.push(val);
        skillsInput.value = '';
        saveData();
        renderSkillTags();
        renderPreview();
      }
    }
  });

  // --- Initialize Forms ---
  function initForms() {
    // Basic Info
    document.getElementById('cv-name').value = cvData.personal.name;
    document.getElementById('cv-title').value = cvData.personal.title;
    document.getElementById('cv-email').value = cvData.personal.email;
    document.getElementById('cv-phone').value = cvData.personal.phone;
    document.getElementById('cv-location').value = cvData.personal.location;
    document.getElementById('cv-link').value = cvData.personal.link;
    document.getElementById('cv-summary').value = cvData.summary;

    // Dynamic Lists
    expListEl.innerHTML = '';
    cvData.experience.forEach(exp => expListEl.appendChild(createExpForm(exp)));
    
    eduListEl.innerHTML = '';
    cvData.education.forEach(edu => eduListEl.appendChild(createEduForm(edu)));

    // Skills
    renderSkillTags();
  }

  // --- Rendering engine ---
  function setContentAndVisibility(id, content, displayStyle = 'inline') {
    const el = document.getElementById(id);
    if (!el) return;
    if (content.trim() !== '') {
      el.textContent = content;
      el.style.display = displayStyle;
    } else {
      el.style.display = 'none';
    }
  }

  function renderPreview() {
    // Personal Details
    setContentAndVisibility('preview-name', cvData.personal.name, 'block');
    setContentAndVisibility('preview-title', cvData.personal.title, 'block');
    setContentAndVisibility('preview-email', cvData.personal.email);
    setContentAndVisibility('preview-phone', cvData.personal.phone);
    setContentAndVisibility('preview-location', cvData.personal.location);
    setContentAndVisibility('preview-link', cvData.personal.link);

    // Separators Logic
    document.getElementById('sep-phone').style.display = (cvData.personal.email && cvData.personal.phone) ? 'inline' : 'none';
    document.getElementById('sep-location').style.display = ((cvData.personal.email || cvData.personal.phone) && cvData.personal.location) ? 'inline' : 'none';
    document.getElementById('sep-link').style.display = ((cvData.personal.email || cvData.personal.phone || cvData.personal.location) && cvData.personal.link) ? 'inline' : 'none';

    // Summary
    const sumSec = document.getElementById('preview-sec-summary');
    if (cvData.summary.trim()) {
      sumSec.style.display = 'block';
      document.getElementById('preview-summary').textContent = cvData.summary;
    } else {
      sumSec.style.display = 'none';
    }

    // Experience
    const expSec = document.getElementById('preview-sec-experience');
    if (cvData.experience.length > 0) {
      expSec.style.display = 'block';
      const list = document.getElementById('preview-experience-list');
      list.innerHTML = cvData.experience.map(e => `
        <div class="cv-item">
          <div class="cv-item-header">
            <span class="cv-item-title">${e.title || 'Untitled Position'}</span>
            <span class="cv-item-date">${e.date}</span>
          </div>
          ${e.company ? `<div class="cv-item-subtitle">${e.company}</div>` : ''}
          ${e.description ? `<div class="cv-item-desc">${escapeHTML(e.description)}</div>` : ''}
        </div>
      `).join('');
    } else {
      expSec.style.display = 'none';
    }

    // Education
    const eduSec = document.getElementById('preview-sec-education');
    if (cvData.education.length > 0) {
      eduSec.style.display = 'block';
      const list = document.getElementById('preview-education-list');
      list.innerHTML = cvData.education.map(e => `
        <div class="cv-item">
          <div class="cv-item-header">
            <span class="cv-item-title">${e.degree || 'Untitled Degree'}</span>
            <span class="cv-item-date">${e.date}</span>
          </div>
          ${e.school ? `<div class="cv-item-subtitle">${e.school}</div>` : ''}
          ${e.description ? `<div class="cv-item-desc">${escapeHTML(e.description)}</div>` : ''}
        </div>
      `).join('');
    } else {
      eduSec.style.display = 'none';
    }

    // Skills
    const skillSec = document.getElementById('preview-sec-skills');
    if (cvData.skills.length > 0) {
      skillSec.style.display = 'block';
      const list = document.getElementById('preview-skills-list');
      list.innerHTML = cvData.skills.map(s => `<span>${escapeHTML(s)}</span>`).join('');
    } else {
      skillSec.style.display = 'none';
    }
  }

  function escapeHTML(str) {
    return str.replace(/[&<>'"]/g, 
      tag => ({
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        "'": '&#39;',
        '"': '&quot;'
      }[tag])
    );
  }

  function saveData() {
    localStorage.setItem('cv_builder_data', JSON.stringify(cvData));
  }

  // --- PDF Download ---
  document.getElementById('download-pdf-btn').addEventListener('click', () => {
    if (typeof html2pdf === 'undefined') {
      alert("PDF library is still loading. Please try again in a moment.");
      return;
    }

    const element = document.getElementById('cv-document');
    const opt = {
      margin:       0, // margins are handled by CSS padding inside the element
      filename:     `${cvData.personal.name.replace(/\s+/g, '_')}_CV.pdf`,
      image:        { type: 'jpeg', quality: 0.98 },
      html2canvas:  { scale: 2, useCORS: true },
      jsPDF:        { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };

    // Add generating state
    const btn = document.getElementById('download-pdf-btn');
    const originalHTML = btn.innerHTML;
    btn.innerHTML = 'Generating PDF...';
    btn.disabled = true;

    html2pdf().set(opt).from(element).save().then(() => {
      btn.innerHTML = originalHTML;
      btn.disabled = false;
    });
  });

  // --- Clear All ---
  document.getElementById('clear-cv-btn').addEventListener('click', () => {
    if(confirm('Are you sure you want to clear all data? This cannot be undone.')) {
      cvData = {
        personal: { name: '', title: '', email: '', phone: '', location: '', link: '' },
        summary: '',
        experience: [],
        education: [],
        skills: []
      };
      saveData();
      initForms();
      renderPreview();
    }
  });

  // Boot
  initForms();
  renderPreview();
});