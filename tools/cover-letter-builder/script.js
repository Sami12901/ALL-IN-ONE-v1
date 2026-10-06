// Cover Letter Builder Logic

const SAMPLE_DATA = {
  applicant: {
    name: 'Maya Lin',
    email: 'maya.lin@designer.io',
    phone: '+1 (555) 789-0123',
    location: 'Seattle, WA',
  },
  employer: {
    role: 'Principal Product Designer',
    company: 'Stripe',
    manager: 'Sarah Lin',
    companyLoc: 'San Francisco, CA',
    qualifications: '10+ years scaling design systems, 42% checkout conversion uplift, mentoring cross-functional product squads',
    date: new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
  },
  tone: 'confident',
  p1Variant: 0,
  p2Variant: 0,
  p3Variant: 0,
  p4Variant: 0
};

// Preset Templates by Tone
const PARAGRAPH_TEMPLATES = {
  professional: {
    p1: [
      "I am writing to formally submit my application for the [role] position at [company]. With over a decade of proven experience focused on [qualifications], I have developed a strong foundation of strategic execution and craftsmanship. I have long admired [company]’s industry-leading standards and would welcome the opportunity to contribute directly to your team’s strategic objectives.",
      "Please accept this letter as an expression of my serious interest in the [role] role at [company]. Having reviewed your organization's mission and current trajectory, I am confident that my background in [qualifications] aligns seamlessly with the challenges and responsibilities outlined for this position.",
      "It is with great enthusiasm that I apply for the [role] opening at [company]. Throughout my career, I have prioritized high-quality execution, organizational rigor, and collaborative leadership—strengths I am eager to bring to your esteemed team."
    ],
    p2: [
      "Throughout my professional journey, I have remained focused on delivering measurable business impact. In my previous engagements, I successfully led initiatives that transformed core workflows, highlighted by [qualifications]. My approach combines rigorous problem framing with disciplined execution, ensuring that strategic goals are consistently achieved with excellence.",
      "My background is anchored in turning complex challenges into streamlined, scalable solutions. Most recently, I spearheaded key operational projects that yielded [qualifications]. By fostering strong alignment across engineering, product, and leadership stakeholders, I consistently accelerate project velocity without sacrificing quality.",
      "In previous leadership capacities, I have championed projects that delivered sustained value, including [qualifications]. I take pride in establishing frameworks that not only solve immediate problems but also build long-term institutional capability."
    ],
    p3: [
      "What distinguishes my work is an unwavering commitment to data-driven decision making and cross-functional empathy. [company]’s dedication to thoughtful, high-leverage products resonates deeply with my core values, and I am confident that my background in [qualifications] will enable me to make an immediate, positive contribution.",
      "I am drawn to [company] because of your reputation for technical rigor and customer-centric culture. I believe my expertise in [qualifications] will provide your team with dependable momentum and a fresh strategic perspective.",
      "Joining [company] represents an ideal alignment between your organizational needs and my proven capabilities in [qualifications]. I am excited by the prospect of partnering with your talented team to set new benchmarks of success."
    ],
    p4: [
      "Thank you very much for your time, consideration, and review of my application. I welcome the opportunity to discuss how my background, capabilities, and work ethic can support [company]’s continued success. I look forward to speaking with you soon.",
      "I appreciate your thoughtful consideration of my qualifications. I would be delighted to participate in an interview to explore how my experience directly aligns with your strategic vision for the [role] role.",
      "Thank you for reviewing my background. I look forward to the possibility of discussing this exciting opportunity with you in greater detail. Sincerely,"
    ]
  },
  enthusiastic: {
    p1: [
      "I was thrilled to discover the opening for [role] at [company]! As a dedicated practitioner passionate about [qualifications], I have followed [company]’s visionary journey with immense admiration and would be deeply energized to contribute my creativity and drive to your team.",
      "When I saw that [company] was looking for a [role], I knew I had to apply immediately! Your team's relentless pursuit of exceptional quality and innovation is something I have long celebrated, and I would love nothing more than to bring my experience in [qualifications] to your mission.",
      "I am beyond excited to submit my candidacy for [role] at [company]! Few companies combine visionary ambition with flawless execution quite like [company], and the chance to contribute my skills in [qualifications] is an opportunity I am truly passionate about."
    ],
    p2: [
      "I thrive in environments where creativity meets relentless curiosity. In my recent roles, I threw myself into ambitious challenges—delivering standout milestones such as [qualifications]. I love bringing teams together, celebrating bold experimentation, and turning ambitious concepts into polished reality.",
      "My career has been fueled by a love for high-impact innovation. Whether diving deep into technical problem-solving or driving [qualifications], I bring infectious energy and meticulous attention to detail to every project I touch.",
      "Working on complex problems is what gets me out of bed in the morning. Over the past several years, I have spearheaded creative breakthroughs including [qualifications], always with an eye toward delighting end users and empowering teammates."
    ],
    p3: [
      "[company]’s culture of innovation and fearless creativity is second to none. I know that my background in [qualifications] combined with my positive, high-energy collaboration style will help foster even greater momentum within your group.",
      "What excites me most about [company] is your refusal to settle for conventional answers. I share that exact DNA, and I cannot wait to put my experience in [qualifications] to work building something unforgettable together.",
      "I am genuinely inspired by what your team is building, and I know that my enthusiasm, grit, and specialized background in [qualifications] will make me a fantastic cultural and technical addition."
    ],
    p4: [
      "I would absolutely love the chance to connect and chat about how my energy and skills can help propel [company] forward! Thank you so much for your consideration, and I hope to speak with you soon!",
      "Thank you from the bottom of my heart for considering my application! I am eagerly looking forward to the chance to chat and share more about what we can accomplish together.",
      "I am so excited about this opportunity and would be honored to join the [company] family. Thank you for your time, and I look forward to connecting!"
    ]
  },
  confident: {
    p1: [
      "I am writing to apply for the [role] position at [company]. With an aggressive track record of generating tangible business outcomes across [qualifications], I have the domain expertise and leadership acumen required to execute decisively and drive immediate value for your organization.",
      "If [company] is looking for a battle-tested [role] who can take full ownership of critical initiatives and deliver outsized results, my background in [qualifications] is an exact match for your objectives.",
      "I am submitting my candidacy for [role] at [company] with full confidence that my history of high-velocity execution and proven results in [qualifications] will provide immediate leverage for your strategic priorities."
    ],
    p2: [
      "My track record is defined by measurable performance: architecting solutions that scaled revenue and user adoption, unblocking bottlenecks, and spearheading key initiatives including [qualifications]. I do not wait for instructions; I analyze the landscape, identify high-leverage opportunities, and deliver outcomes that exceed executive expectations.",
      "Throughout my career, I have consistently outpaced benchmarks. By focusing relentlessly on business impact, I successfully delivered [qualifications], establishing reliable systems that continue to perform under heavy scale.",
      "Where others see roadblocks, I see opportunities to optimize. From revamping core systems to delivering [qualifications], I have consistently proven that disciplined strategy combined with rapid execution beats complacency every single time."
    ],
    p3: [
      "Scaling the [role] function at [company] requires an operator who combines strategic foresight with hands-on technical command. My expertise in [qualifications] ensures that I will quickly eliminate inefficiencies and establish enduring competitive advantages.",
      "The challenges [company] faces in today's market demand relentless focus and accountability. Having navigated similar high-stakes environments with [qualifications], I am primed to hit the ground sprinting and deliver an undeniable return on investment.",
      "I know what world-class execution looks like, and I know how to replicate it. My background in [qualifications] makes me uniquely equipped to help [company] dominate its space and exceed its quarterly targets."
    ],
    p4: [
      "I welcome a direct conversation with your leadership team to discuss the strategic value I will bring to [company]. Let us schedule a phone call at your earliest convenience.",
      "I look forward to discussing how my execution capabilities and focus on bottom-line results align with [company]’s goals. Please reach out to arrange a discussion.",
      "Thank you for your consideration. I look forward to connecting soon to discuss how I can immediately accelerate [company]’s performance as your next [role]."
    ]
  }
};

const STORAGE_KEY = 'aio_cover_letter_data';

document.addEventListener('DOMContentLoaded', () => {
  let letterState = loadState();

  // Form Elements
  const inpName = document.getElementById('inp-name');
  const inpEmail = document.getElementById('inp-email');
  const inpPhone = document.getElementById('inp-phone');
  const inpLocation = document.getElementById('inp-location');

  const inpRole = document.getElementById('inp-role');
  const inpCompany = document.getElementById('inp-company');
  const inpManager = document.getElementById('inp-manager');
  const inpCompanyLoc = document.getElementById('inp-company-loc');
  const inpQualifications = document.getElementById('inp-qualifications');

  const tonePills = document.querySelectorAll('.tone-pill');
  const selP1 = document.getElementById('sel-p1-variant');
  const selP2 = document.getElementById('sel-p2-variant');
  const selP3 = document.getElementById('sel-p3-variant');
  const selP4 = document.getElementById('sel-p4-variant');

  const txtP1 = document.getElementById('txt-p1');
  const txtP2 = document.getElementById('txt-p2');
  const txtP3 = document.getElementById('txt-p3');
  const txtP4 = document.getElementById('txt-p4');

  const letterPaper = document.getElementById('letter-paper');
  const btnLoadSample = document.getElementById('btn-load-sample');
  const btnReset = document.getElementById('btn-reset');
  const btnPrint = document.getElementById('btn-print');
  const btnCopyClipboard = document.getElementById('btn-copy-clipboard');
  const btnDownloadTxt = document.getElementById('btn-download-txt');
  const btnRemixAll = document.getElementById('btn-remix-all');
  const autosaveLabel = document.getElementById('autosave-label');

  // Load from localStorage or default
  function loadState() {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && parsed.applicant && parsed.employer) {
          return parsed;
        }
      }
    } catch (e) {
      console.warn('Could not parse saved cover letter:', e);
    }
    return JSON.parse(JSON.stringify(SAMPLE_DATA));
  }

  function saveState() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(letterState));
      if (autosaveLabel) {
        autosaveLabel.textContent = 'Saved to browser';
      }
    } catch (e) {
      console.error(e);
    }
  }

  // Populate UI inputs
  function populateForm() {
    inpName.value = letterState.applicant.name || '';
    inpEmail.value = letterState.applicant.email || '';
    inpPhone.value = letterState.applicant.phone || '';
    inpLocation.value = letterState.applicant.location || '';

    inpRole.value = letterState.employer.role || '';
    inpCompany.value = letterState.employer.company || '';
    inpManager.value = letterState.employer.manager || '';
    inpCompanyLoc.value = letterState.employer.companyLoc || '';
    inpQualifications.value = letterState.employer.qualifications || '';

    updateTonePills();
    updateVariantSelects();
    refreshParagraphTexts();
  }

  function updateTonePills() {
    tonePills.forEach(pill => {
      if (pill.dataset.tone === letterState.tone) {
        pill.classList.add('active');
      } else {
        pill.classList.remove('active');
      }
    });
  }

  function updateVariantSelects() {
    selP1.value = letterState.p1Variant || 0;
    selP2.value = letterState.p2Variant || 0;
    selP3.value = letterState.p3Variant || 0;
    selP4.value = letterState.p4Variant || 0;
  }

  // Replace placeholders in templates
  function interpolate(template) {
    if (!template) return '';
    const role = letterState.employer.role || 'this position';
    const company = letterState.employer.company || 'your organization';
    const manager = letterState.employer.manager || 'Hiring Team';
    const qualifications = letterState.employer.qualifications || 'relevant experience';
    const name = letterState.applicant.name || 'Applicant';

    return template
      .replace(/\[role\]/g, role)
      .replace(/\[company\]/g, company)
      .replace(/\[manager\]/g, manager)
      .replace(/\[qualifications\]/g, qualifications)
      .replace(/\[name\]/g, name);
  }

  // Re-generate paragraph texts from selected tone & variants if not custom-edited
  function refreshParagraphTexts(force = false) {
    const toneData = PARAGRAPH_TEMPLATES[letterState.tone] || PARAGRAPH_TEMPLATES.professional;

    const p1Raw = toneData.p1[letterState.p1Variant || 0];
    const p2Raw = toneData.p2[letterState.p2Variant || 0];
    const p3Raw = toneData.p3[letterState.p3Variant || 0];
    const p4Raw = toneData.p4[letterState.p4Variant || 0];

    if (force || !letterState.customP1) {
      txtP1.value = interpolate(p1Raw);
      letterState.customP1 = txtP1.value;
    } else {
      txtP1.value = letterState.customP1;
    }

    if (force || !letterState.customP2) {
      txtP2.value = interpolate(p2Raw);
      letterState.customP2 = txtP2.value;
    } else {
      txtP2.value = letterState.customP2;
    }

    if (force || !letterState.customP3) {
      txtP3.value = interpolate(p3Raw);
      letterState.customP3 = txtP3.value;
    } else {
      txtP3.value = letterState.customP3;
    }

    if (force || !letterState.customP4) {
      txtP4.value = interpolate(p4Raw);
      letterState.customP4 = txtP4.value;
    } else {
      txtP4.value = letterState.customP4;
    }

    renderLetterPreview();
  }

  // Render Letter inside Stationery Preview
  function renderLetterPreview() {
    const a = letterState.applicant;
    const e = letterState.employer;
    const dateStr = e.date || new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
    const managerGreeting = e.manager ? `Dear ${escapeHtml(e.manager)},` : 'Dear Hiring Team,';

    const p1 = escapeHtml(txtP1.value || '');
    const p2 = escapeHtml(txtP2.value || '');
    const p3 = escapeHtml(txtP3.value || '');
    const p4 = escapeHtml(txtP4.value || '');

    const signoffWord = letterState.tone === 'enthusiastic' ? 'Warmest regards,' : letterState.tone === 'confident' ? 'Best regards,' : 'Sincerely,';

    letterPaper.innerHTML = `
      <header class="letter-header">
        <div class="letter-sender-name">${escapeHtml(a.name || 'YOUR NAME')}</div>
        <div class="letter-sender-contact">
          ${a.email ? `<span>${escapeHtml(a.email)}</span>` : ''}
          ${a.phone ? `<span>${escapeHtml(a.phone)}</span>` : ''}
          ${a.location ? `<span>${escapeHtml(a.location)}</span>` : ''}
        </div>
      </header>

      <div class="letter-meta">
        <div>${escapeHtml(dateStr)}</div>
        <div style="margin-top: 0.5rem; font-weight: 600; color: #111827;">${escapeHtml(e.manager ? e.manager + ' (or Hiring Committee)' : 'Hiring Committee')}</div>
        <div>${escapeHtml(e.company || 'Company Name')}</div>
        ${e.companyLoc ? `<div>${escapeHtml(e.companyLoc)}</div>` : ''}
      </div>

      <div class="letter-salutation">${managerGreeting}</div>

      <div class="letter-body">
        <p>${p1}</p>
        <p>${p2}</p>
        <p>${p3}</p>
        <p>${p4}</p>
      </div>

      <div class="letter-signoff">
        <div>${signoffWord}</div>
        <div class="signature-typed">${escapeHtml(a.name || 'Your Name')}</div>
      </div>
    `;
  }

  // Tone Selection Binding
  tonePills.forEach(pill => {
    pill.addEventListener('click', () => {
      letterState.tone = pill.dataset.tone;
      updateTonePills();
      refreshParagraphTexts(true);
      saveState();
    });
  });

  // Variant Dropdown Bindings
  selP1.addEventListener('change', () => {
    letterState.p1Variant = parseInt(selP1.value, 10);
    letterState.customP1 = null;
    refreshParagraphTexts();
    saveState();
  });
  selP2.addEventListener('change', () => {
    letterState.p2Variant = parseInt(selP2.value, 10);
    letterState.customP2 = null;
    refreshParagraphTexts();
    saveState();
  });
  selP3.addEventListener('change', () => {
    letterState.p3Variant = parseInt(selP3.value, 10);
    letterState.customP3 = null;
    refreshParagraphTexts();
    saveState();
  });
  selP4.addEventListener('change', () => {
    letterState.p4Variant = parseInt(selP4.value, 10);
    letterState.customP4 = null;
    refreshParagraphTexts();
    saveState();
  });

  // Direct Textarea input bindings
  txtP1.addEventListener('input', () => {
    letterState.customP1 = txtP1.value;
    renderLetterPreview();
    saveState();
  });
  txtP2.addEventListener('input', () => {
    letterState.customP2 = txtP2.value;
    renderLetterPreview();
    saveState();
  });
  txtP3.addEventListener('input', () => {
    letterState.customP3 = txtP3.value;
    renderLetterPreview();
    saveState();
  });
  txtP4.addEventListener('input', () => {
    letterState.customP4 = txtP4.value;
    renderLetterPreview();
    saveState();
  });

  // Applicant & Employer inputs
  [inpName, inpEmail, inpPhone, inpLocation].forEach(inp => {
    inp.addEventListener('input', () => {
      letterState.applicant.name = inpName.value;
      letterState.applicant.email = inpEmail.value;
      letterState.applicant.phone = inpPhone.value;
      letterState.applicant.location = inpLocation.value;
      renderLetterPreview();
      saveState();
    });
  });

  [inpRole, inpCompany, inpManager, inpCompanyLoc, inpQualifications].forEach(inp => {
    inp.addEventListener('input', () => {
      letterState.employer.role = inpRole.value;
      letterState.employer.company = inpCompany.value;
      letterState.employer.manager = inpManager.value;
      letterState.employer.companyLoc = inpCompanyLoc.value;
      letterState.employer.qualifications = inpQualifications.value;
      renderLetterPreview();
      saveState();
    });
  });

  // Remix all button
  btnRemixAll.addEventListener('click', () => {
    letterState.p1Variant = (letterState.p1Variant + 1) % 3;
    letterState.p2Variant = (letterState.p2Variant + 1) % 3;
    letterState.p3Variant = (letterState.p3Variant + 1) % 3;
    letterState.p4Variant = (letterState.p4Variant + 1) % 3;
    updateVariantSelects();
    refreshParagraphTexts(true);
    saveState();
  });

  // Load Sample Button
  btnLoadSample.addEventListener('click', () => {
    if (confirm('Load sample cover letter profile for Principal Product Designer?')) {
      letterState = JSON.parse(JSON.stringify(SAMPLE_DATA));
      populateForm();
      refreshParagraphTexts(true);
      saveState();
    }
  });

  // Reset Button
  btnReset.addEventListener('click', () => {
    if (confirm('Are you sure you want to reset all fields?')) {
      letterState = {
        applicant: { name: '', email: '', phone: '', location: '' },
        employer: { role: '', company: '', manager: '', companyLoc: '', qualifications: '', date: '' },
        tone: 'professional',
        p1Variant: 0, p2Variant: 0, p3Variant: 0, p4Variant: 0,
        customP1: '', customP2: '', customP3: '', customP4: ''
      };
      populateForm();
      refreshParagraphTexts(true);
      saveState();
    }
  });

  // Print Action
  btnPrint.addEventListener('click', () => {
    window.print();
  });

  // Copy Plain Text Action
  btnCopyClipboard.addEventListener('click', async () => {
    try {
      const fullText = buildPlainText();
      await navigator.clipboard.writeText(fullText);
      const orig = btnCopyClipboard.innerHTML;
      btnCopyClipboard.innerHTML = '✓ Copied!';
      setTimeout(() => {
        btnCopyClipboard.innerHTML = orig;
      }, 2000);
    } catch (e) {
      alert('Failed to copy to clipboard.');
    }
  });

  // Download .txt
  btnDownloadTxt.addEventListener('click', () => {
    const fullText = buildPlainText();
    const safeName = (letterState.applicant.name || 'applicant').toLowerCase().replace(/\s+/g, '_');
    const safeCompany = (letterState.employer.company || 'company').toLowerCase().replace(/\s+/g, '_');
    const blob = new Blob([fullText], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${safeName}_${safeCompany}_cover_letter.txt`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  });

  function buildPlainText() {
    const a = letterState.applicant;
    const e = letterState.employer;
    const dateStr = e.date || new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
    const managerGreeting = e.manager ? `Dear ${e.manager},` : 'Dear Hiring Team,';
    const signoffWord = letterState.tone === 'enthusiastic' ? 'Warmest regards,' : letterState.tone === 'confident' ? 'Best regards,' : 'Sincerely,';

    return `${a.name || ''}
${[a.email, a.phone, a.location].filter(Boolean).join(' | ')}

${dateStr}

${e.manager ? e.manager + '\n' : ''}${e.company || ''}${e.companyLoc ? '\n' + e.companyLoc : ''}

${managerGreeting}

${txtP1.value}

${txtP2.value}

${txtP3.value}

${txtP4.value}

${signoffWord}
${a.name || ''}
`;
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

  // Initial boot
  populateForm();
});