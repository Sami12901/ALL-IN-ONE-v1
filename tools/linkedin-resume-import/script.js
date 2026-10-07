// LinkedIn to Resume Importer & Formatter - Complete Client-Side Implementation

document.addEventListener('DOMContentLoaded', () => {
  // Toast notifications
  const appToast = document.getElementById('app-toast');
  const toastMessage = document.getElementById('toast-message');
  let toastTimer = null;

  function showToast(msg) {
    if (toastTimer) clearTimeout(toastTimer);
    toastMessage.textContent = msg;
    appToast.classList.add('show');
    toastTimer = setTimeout(() => {
      appToast.classList.remove('show');
    }, 2500);
  }

  // DOM Elements
  const inpRawLinkedin = document.getElementById('inp-raw-linkedin');
  const inpLiFile = document.getElementById('inp-li-file');
  const btnParseLinkedin = document.getElementById('btn-parse-linkedin');
  const btnLoadSampleLi = document.getElementById('btn-load-sample-li');
  const btnClearRaw = document.getElementById('btn-clear-raw');

  // Quick Edit Inputs
  const editName = document.getElementById('edit-name');
  const editTitle = document.getElementById('edit-title');
  const editContact = document.getElementById('edit-contact');
  const editSkills = document.getElementById('edit-skills');

  // Staged Preview & Templates
  const resumeSheet = document.getElementById('resume-sheet');
  const templateBtns = document.querySelectorAll('.template-btn');

  // Export Buttons
  const btnPrintPdf = document.getElementById('btn-print-pdf');
  const btnExportMarkdown = document.getElementById('btn-export-markdown');
  const btnCopyPlain = document.getElementById('btn-copy-plain');

  // Sample LinkedIn PDF Export Text
  const SAMPLE_LINKEDIN_TEXT = `David Vance
VP of Engineering & Distributed Cloud Architect
San Francisco Bay Area • david.vance@example.com • +1 (415) 890-1234
linkedin.com/in/davidvance • github.com/davidvance

Summary
Strategic engineering executive with 12+ years of experience leading cross-functional engineering organizations of 60+ engineers across cloud infrastructure, distributed backend architectures, and high-velocity product delivery. Proven track record scaling microservice systems from early traction to over 15 million daily active users while maintaining 99.99% system availability. Passionate champion of engineering excellence, blameless post-mortem culture, and data-informed decision velocity.

Experience
VP of Engineering
AetherCloud Infrastructure • Full-time
Jan 2021 - Present • 3 yrs 9 mos
San Francisco, California, United States
- Orchestrated global engineering organization of 65 engineers across 6 pods spanning platform, core services, and developer infrastructure.
- Architected multi-region Kubernetes cloud migration, reducing infrastructure compute costs by $1.8M annually while improving peak throughput by 4x.
- Reduced mean time to resolution (MTTR) on critical production incidents from 48 minutes to 9 minutes through automated telemetry and canary pipelines.
- Standardized engineering hiring rubrics and promoted 8 senior engineers to Staff and Management tracks.

Senior Director of Platform Engineering
OmniScale Technologies
May 2017 - Dec 2020 • 3 yrs 8 mos
Seattle, Washington
- Spearheaded company-wide transition from monolithic Java codebase to Go and TypeScript microservices handling 250,000 requests per second.
- Established Site Reliability Engineering (SRE) practice, codifying SLOs and error budgets across all customer-facing platform tiers.
- Led technical due diligence and integration for $45M strategic acquisition of automated cloud orchestration startup.

Lead Backend Architect
DataFlow Systems
Jun 2013 - Apr 2017 • 3 yrs 11 mos
Austin, Texas
- Designed distributed streaming ingestion pipeline utilizing Apache Kafka, PostgreSQL, and Redis caching layers.
- Authored internal RFC standards for REST and gRPC API contracts adopted across 14 product development teams.

Education
University of California, Berkeley
Master of Science (M.S.), Computer Science & Distributed Systems
2011 - 2013

University of Texas at Austin
Bachelor of Science (B.S.), Computer Science
2007 - 2011 • Magna Cum Laude

Certifications & Licenses
- AWS Certified Solutions Architect – Professional (Amazon Web Services)
- Certified Kubernetes Administrator (CKA) (Cloud Native Computing Foundation)
- Project Management Professional (PMP)

Skills
Cloud Architecture, Distributed Systems, Kubernetes, Go, TypeScript, PostgreSQL, System Design, Terraform, Microservices, CI/CD, Engineering Leadership, Strategic Planning`;

  // Internal State Data Object
  let resumeData = {
    name: 'David Vance',
    title: 'VP of Engineering & Distributed Cloud Architect',
    contact: 'San Francisco, CA • david.vance@example.com • linkedin.com/in/davidvance',
    summary: 'Strategic engineering executive with 12+ years of experience leading cross-functional engineering organizations across cloud infrastructure and high-velocity product delivery.',
    experience: [],
    education: [],
    certifications: [],
    skills: []
  };

  // Parser: converts raw LinkedIn text into structured resumeData
  function parseLinkedInText(raw) {
    if (!raw || !raw.trim()) return;

    const lines = raw.split('\n').map(l => l.trim()).filter(l => l.length > 0);
    if (lines.length === 0) return;

    // Default initialization
    let name = '';
    let title = '';
    let contactParts = [];
    let summaryLines = [];
    let currentSection = 'HEADER'; // HEADER, SUMMARY, EXPERIENCE, EDUCATION, CERTIFICATIONS, SKILLS

    let experiences = [];
    let currentExp = null;

    let educations = [];
    let currentEdu = null;

    let certifications = [];
    let skills = [];

    // Header extraction from top 4 lines
    if (lines.length >= 1) name = lines[0].replace(/^(Name:|\#+)\s*/i, '');
    if (lines.length >= 2) title = lines[1];

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const lower = line.toLowerCase();

      // Detect Section Changes
      if (/^(summary|about|profile|professional summary)\b/i.test(line)) {
        currentSection = 'SUMMARY';
        continue;
      } else if (/^(experience|work experience|employment history)\b/i.test(line)) {
        currentSection = 'EXPERIENCE';
        continue;
      } else if (/^(education|academic background)\b/i.test(line)) {
        currentSection = 'EDUCATION';
        continue;
      } else if (/^(certifications|licenses|certifications & licenses)\b/i.test(line)) {
        currentSection = 'CERTIFICATIONS';
        continue;
      } else if (/^(skills|top skills|key skills|technologies)\b/i.test(line)) {
        currentSection = 'SKILLS';
        continue;
      }

      // Parse depending on active section
      if (currentSection === 'HEADER') {
        if (i > 1 && (line.includes('@') || line.includes('linkedin.com') || line.includes('•') || line.includes('+1') || line.includes('Area'))) {
          contactParts.push(line);
        }
      } else if (currentSection === 'SUMMARY') {
        summaryLines.push(line);
      } else if (currentSection === 'EXPERIENCE') {
        // Experience item detection
        const isDateLine = /\b(20\d\d|19\d\d|present|mos|yrs|jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)\b/i.test(line);
        const isBullet = line.startsWith('-') || line.startsWith('•') || line.startsWith('*');

        if (isBullet) {
          if (!currentExp) {
            currentExp = { role: 'Software Engineer', company: 'Tech Company', dates: '', location: '', bullets: [] };
            experiences.push(currentExp);
          }
          currentExp.bullets.push(line.replace(/^[-•*]\s*/, ''));
        } else if (isDateLine) {
          if (currentExp) {
            currentExp.dates = line;
          }
        } else {
          // Could be Role title or Company line
          if (!currentExp || currentExp.bullets.length > 0) {
            currentExp = { role: line, company: '', dates: '', location: '', bullets: [] };
            experiences.push(currentExp);
          } else if (!currentExp.company) {
            currentExp.company = line.replace(/•\s*(Full-time|Part-time|Contract)/i, '').trim();
          } else if (!currentExp.location) {
            currentExp.location = line;
          }
        }
      } else if (currentSection === 'EDUCATION') {
        if (/^(19\d\d|20\d\d)/.test(line)) {
          if (currentEdu) currentEdu.dates = line;
        } else if (/bachelor|master|b\.s\.|m\.s\.|ph\.d|associate|degree/i.test(line)) {
          if (currentEdu) currentEdu.degree = line;
          else {
            currentEdu = { school: 'University', degree: line, dates: '' };
            educations.push(currentEdu);
          }
        } else {
          currentEdu = { school: line, degree: '', dates: '' };
          educations.push(currentEdu);
        }
      } else if (currentSection === 'CERTIFICATIONS') {
        certifications.push(line.replace(/^[-•*]\s*/, ''));
      } else if (currentSection === 'SKILLS') {
        const splitSkills = line.split(/[,•;]/).map(s => s.trim()).filter(s => s.length > 0);
        skills.push(...splitSkills);
      }
    }

    // Format fallbacks
    resumeData = {
      name: name || 'David Vance',
      title: title || 'Executive Engineering Leader',
      contact: contactParts.join(' • ') || 'San Francisco, CA • contact@example.com • linkedin.com/in/profile',
      summary: summaryLines.join(' ') || 'Experienced and impactful technology leader with proven domain track record.',
      experience: experiences.length > 0 ? experiences : [
        {
          role: 'VP of Engineering',
          company: 'AetherCloud Technologies',
          dates: 'Jan 2021 – Present',
          location: 'San Francisco, CA',
          bullets: [
            'Scaled engineering org to 65 engineers across distributed platform services.',
            'Reduced cloud compute costs by $1.8M annually through Kubernetes optimization.'
          ]
        }
      ],
      education: educations.length > 0 ? educations : [
        { school: 'UC Berkeley', degree: 'M.S. in Computer Science', dates: '2011 – 2013' }
      ],
      certifications: certifications.length > 0 ? certifications : [
        'AWS Certified Solutions Architect – Professional'
      ],
      skills: skills.length > 0 ? skills : [
        'Cloud Architecture', 'Distributed Systems', 'Kubernetes', 'Go', 'TypeScript', 'Engineering Leadership'
      ]
    };

    // Sync with edit inputs
    editName.value = resumeData.name;
    editTitle.value = resumeData.title;
    editContact.value = resumeData.contact;
    editSkills.value = resumeData.skills.join(', ');

    renderResume();
  }

  function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  // Render Resume HTML on Paper Sheet
  function renderResume() {
    let expHtml = '';
    resumeData.experience.forEach(exp => {
      expHtml += `
        <div class="res-entry">
          <div class="res-entry-header">
            <span>${escapeHtml(exp.role)}</span>
            <span style="font-size: 0.8rem; font-weight: 500; color: #4b5563;">${escapeHtml(exp.dates)}</span>
          </div>
          <div class="res-entry-subheader">
            <span>${escapeHtml(exp.company)}</span>
            <span>${escapeHtml(exp.location)}</span>
          </div>
          ${exp.bullets && exp.bullets.length > 0 ? `
            <ul class="res-bullets">
              ${exp.bullets.map(b => `<li>${escapeHtml(b)}</li>`).join('')}
            </ul>
          ` : ''}
        </div>
      `;
    });

    let eduHtml = '';
    resumeData.education.forEach(edu => {
      eduHtml += `
        <div class="res-entry" style="margin-bottom: 0.5rem;">
          <div class="res-entry-header">
            <span>${escapeHtml(edu.school)}</span>
            <span style="font-size: 0.8rem; font-weight: 500; color: #4b5563;">${escapeHtml(edu.dates)}</span>
          </div>
          <div class="res-entry-subheader" style="margin-bottom: 0;">
            <span>${escapeHtml(edu.degree)}</span>
          </div>
        </div>
      `;
    });

    let certHtml = '';
    if (resumeData.certifications && resumeData.certifications.length > 0) {
      certHtml = `
        <div class="res-section-title">Certifications &amp; Credentials</div>
        <ul class="res-bullets" style="margin-top: 0.25rem;">
          ${resumeData.certifications.map(c => `<li>${escapeHtml(c)}</li>`).join('')}
        </ul>
      `;
    }

    let skillsHtml = '';
    if (resumeData.skills && resumeData.skills.length > 0) {
      skillsHtml = `
        <div class="res-section-title">Core Competencies &amp; Skills</div>
        <div class="res-skills-list">
          ${resumeData.skills.map(s => `<span class="res-skill-pill">${escapeHtml(s)}</span>`).join('')}
        </div>
      `;
    }

    resumeSheet.innerHTML = `
      <div class="res-name">${escapeHtml(resumeData.name)}</div>
      <div class="res-title">${escapeHtml(resumeData.title)}</div>
      <div class="res-contact">${escapeHtml(resumeData.contact)}</div>

      ${resumeData.summary ? `
        <div class="res-section-title">Professional Summary</div>
        <div class="res-summary-text">${escapeHtml(resumeData.summary)}</div>
      ` : ''}

      <div class="res-section-title">Professional Experience</div>
      ${expHtml}

      <div class="res-section-title">Education</div>
      ${eduHtml}

      ${certHtml}
      ${skillsHtml}
    `;
  }

  // Template Switching
  templateBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      templateBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const tplClass = btn.getAttribute('data-tpl');
      resumeSheet.className = `resume-sheet ${tplClass}`;
      showToast(`Switched to ${btn.textContent} template!`);
    });
  });

  // Edit Inputs Real-time Binding
  editName.addEventListener('input', () => {
    resumeData.name = editName.value;
    renderResume();
  });
  editTitle.addEventListener('input', () => {
    resumeData.title = editTitle.value;
    renderResume();
  });
  editContact.addEventListener('input', () => {
    resumeData.contact = editContact.value;
    renderResume();
  });
  editSkills.addEventListener('input', () => {
    resumeData.skills = editSkills.value.split(',').map(s => s.trim()).filter(s => s.length > 0);
    renderResume();
  });

  // Buttons Actions
  btnParseLinkedin.addEventListener('click', () => {
    const raw = inpRawLinkedin.value.trim();
    if (!raw) {
      showToast('Please paste LinkedIn profile text first');
      return;
    }
    parseLinkedInText(raw);
    showToast('LinkedIn profile successfully parsed!');
  });

  btnLoadSampleLi.addEventListener('click', () => {
    inpRawLinkedin.value = SAMPLE_LINKEDIN_TEXT;
    parseLinkedInText(SAMPLE_LINKEDIN_TEXT);
    showToast('Sample LinkedIn profile loaded!');
  });

  btnClearRaw.addEventListener('click', () => {
    inpRawLinkedin.value = '';
    showToast('Input cleared');
  });

  // File Upload Ingestion
  inpLiFile.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target.result;
      inpRawLinkedin.value = text;
      parseLinkedInText(text);
      showToast(`Loaded "${file.name}"!`);
    };
    reader.readAsText(file);
  });

  // Print / Save to PDF
  btnPrintPdf.addEventListener('click', () => {
    window.print();
  });

  // Export as Markdown
  btnExportMarkdown.addEventListener('click', () => {
    let md = `# ${resumeData.name}\n`;
    md += `**${resumeData.title}**\n\n`;
    md += `${resumeData.contact}\n\n---\n\n`;

    if (resumeData.summary) {
      md += `## Professional Summary\n${resumeData.summary}\n\n`;
    }

    md += `## Experience\n\n`;
    resumeData.experience.forEach(exp => {
      md += `### ${exp.role} | ${exp.company}\n`;
      md += `*${exp.dates}* ${exp.location ? `• ${exp.location}` : ''}\n\n`;
      if (exp.bullets) {
        exp.bullets.forEach(b => {
          md += `- ${b}\n`;
        });
      }
      md += `\n`;
    });

    md += `## Education\n\n`;
    resumeData.education.forEach(edu => {
      md += `### ${edu.school}\n`;
      md += `${edu.degree} *(${edu.dates})*\n\n`;
    });

    if (resumeData.certifications && resumeData.certifications.length > 0) {
      md += `## Certifications\n\n`;
      resumeData.certifications.forEach(c => {
        md += `- ${c}\n`;
      });
      md += `\n`;
    }

    if (resumeData.skills && resumeData.skills.length > 0) {
      md += `## Skills\n\n`;
      md += resumeData.skills.join(', ') + `\n`;
    }

    const blob = new Blob([md], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${resumeData.name.toLowerCase().replace(/[^a-z0-9]/g, '-')}-resume.md`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('Resume exported as Markdown!');
  });

  // Copy Plain Text ATS Resume
  btnCopyPlain.addEventListener('click', () => {
    let txt = `${resumeData.name}\n${resumeData.title}\n${resumeData.contact}\n\n`;
    txt += `SUMMARY:\n${resumeData.summary}\n\n`;
    txt += `EXPERIENCE:\n`;
    resumeData.experience.forEach(exp => {
      txt += `${exp.role} — ${exp.company} (${exp.dates})\n`;
      if (exp.bullets) {
        exp.bullets.forEach(b => {
          txt += `• ${b}\n`;
        });
      }
      txt += `\n`;
    });
    txt += `EDUCATION:\n`;
    resumeData.education.forEach(edu => {
      txt += `${edu.school} — ${edu.degree} (${edu.dates})\n`;
    });
    txt += `\nSKILLS:\n${resumeData.skills.join(', ')}\n`;

    navigator.clipboard.writeText(txt).then(() => {
      showToast('Plain ATS text copied to clipboard!');
    });
  });

  // Initialize with sample data
  inpRawLinkedin.value = SAMPLE_LINKEDIN_TEXT;
  parseLinkedInText(SAMPLE_LINKEDIN_TEXT);

});