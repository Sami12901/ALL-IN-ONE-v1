// Resume Generator Logic
document.addEventListener('DOMContentLoaded', () => {

  const inputs = {
    name: document.getElementById('r-name'),
    title: document.getElementById('r-title'),
    email: document.getElementById('r-email'),
    phone: document.getElementById('r-phone'),
    location: document.getElementById('r-location'),
    summary: document.getElementById('r-summary'),
    experience: document.getElementById('r-experience'),
    education: document.getElementById('r-education'),
    skills: document.getElementById('r-skills')
  };

  const outputs = {
    name: document.getElementById('out-name'),
    title: document.getElementById('out-title'),
    email: document.getElementById('out-email'),
    phone: document.getElementById('out-phone'),
    location: document.getElementById('out-location'),
    summary: document.getElementById('out-summary'),
    experience: document.getElementById('out-experience'),
    education: document.getElementById('out-education'),
    skills: document.getElementById('out-skills')
  };

  const resumeDoc = document.getElementById('resume-document');
  let currentLayout = 'layout-classic';

  // Template Switching
  const cards = document.querySelectorAll('.template-card');
  cards.forEach(card => {
    card.addEventListener('click', () => {
      cards.forEach(c => c.classList.remove('active'));
      card.classList.add('active');
      const newLayout = card.dataset.layout;
      resumeDoc.classList.remove(currentLayout);
      resumeDoc.classList.add(newLayout);
      currentLayout = newLayout;
      saveData();
    });
  });

  // Bind inputs to outputs
  function updatePreview() {
    outputs.name.textContent = inputs.name.value || 'Your Name';
    outputs.title.textContent = inputs.title.value || 'Your Title';
    outputs.email.textContent = inputs.email.value || 'email@example.com';
    outputs.phone.textContent = inputs.phone.value || '(123) 456-7890';
    outputs.location.textContent = inputs.location.value || 'City, State';
    
    outputs.summary.textContent = inputs.summary.value || 'Professional summary goes here...';
    outputs.experience.textContent = inputs.experience.value || 'Company | Role | Dates\n- Achievement 1\n- Achievement 2';
    outputs.education.textContent = inputs.education.value || 'University | Degree | Year';

    // Skills handling
    const skillsArray = inputs.skills.value.split(',').map(s => s.trim()).filter(s => s);
    if (skillsArray.length > 0) {
      outputs.skills.innerHTML = skillsArray.map(s => `<span>${escapeHTML(s)}</span>`).join('');
    } else {
      outputs.skills.innerHTML = '<span>Skill 1</span><span>Skill 2</span>';
    }

    saveData();
  }

  // Attach event listeners to all inputs
  Object.values(inputs).forEach(input => {
    input.addEventListener('input', updatePreview);
  });

  function escapeHTML(str) {
    return str.replace(/[&<>'"]/g, 
      tag => ({
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        "'": '&#39;',
        '"': '&quot;'
      }[tag] || tag)
    );
  }

  // Save / Load
  function saveData() {
    const data = { layout: currentLayout };
    Object.keys(inputs).forEach(key => {
      data[key] = inputs[key].value;
    });
    localStorage.setItem('resume_gen_data', JSON.stringify(data));
  }

  function loadData() {
    const saved = localStorage.getItem('resume_gen_data');
    if (saved) {
      try {
        const data = JSON.parse(saved);
        if (data.layout) {
          currentLayout = data.layout;
          resumeDoc.className = 'resume-document ' + currentLayout;
          cards.forEach(c => {
            c.classList.toggle('active', c.dataset.layout === currentLayout);
          });
        }
        Object.keys(inputs).forEach(key => {
          if (data[key] !== undefined) inputs[key].value = data[key];
        });
      } catch(e) {}
    }
    updatePreview();
  }

  // Actions
  document.getElementById('clear-btn').addEventListener('click', () => {
    if(confirm('Clear all data?')) {
      Object.values(inputs).forEach(input => input.value = '');
      updatePreview();
    }
  });

  document.getElementById('load-sample-btn').addEventListener('click', () => {
    inputs.name.value = 'Alex Johnson';
    inputs.title.value = 'Marketing Director';
    inputs.email.value = 'alex.j@example.com';
    inputs.phone.value = '+1 987 654 3210';
    inputs.location.value = 'Austin, TX';
    inputs.summary.value = 'Dynamic marketing director with 8+ years of experience leading cross-functional teams, executing high-ROI campaigns, and growing brand presence in the B2B SaaS space.';
    inputs.experience.value = 'CloudTech Solutions | Marketing Director | 2020 - Present\n- Managed a team of 12 marketers.\n- Increased inbound pipeline by 45%.\n\nInnovate Inc | Digital Marketer | 2016 - 2020\n- Ran paid campaigns generating $2M in ARR.';
    inputs.education.value = 'University of Texas | BBA Marketing | 2012 - 2016';
    inputs.skills.value = 'SEO, Content Strategy, Google Ads, Team Leadership, Data Analysis';
    updatePreview();
  });

  // PDF Export
  document.getElementById('download-pdf-btn').addEventListener('click', () => {
    if (typeof html2pdf === 'undefined') {
      alert("PDF library is still loading. Please try again in a moment.");
      return;
    }

    const element = document.getElementById('resume-document');
    const opt = {
      margin:       0,
      filename:     `${(inputs.name.value || 'Resume').replace(/\s+/g, '_')}.pdf`,
      image:        { type: 'jpeg', quality: 0.98 },
      html2canvas:  { scale: 2, useCORS: true },
      jsPDF:        { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };

    const btn = document.getElementById('download-pdf-btn');
    const originalHTML = btn.innerHTML;
    btn.innerHTML = 'Generating...';
    btn.disabled = true;

    html2pdf().set(opt).from(element).save().then(() => {
      btn.innerHTML = originalHTML;
      btn.disabled = false;
    });
  });

  // Boot
  loadData();
});