// Job Application Generator - Interactive Logic

const SAMPLE_DATA = {
  applicantName: "Alex Morgan",
  applicantContact: "alex.morgan@example.com | +1 (555) 019-2834 | San Francisco, CA",
  targetRole: "Staff Full-Stack Engineer",
  companyName: "Starlight Technologies",
  hiringManager: "Dr. Evelyn Vance",
  toneStyle: "modern",
  keySkills: "TypeScript, React 19, Distributed Node.js Microservices, AWS Architecture, GraphQL, High-Throughput APIs",
  experienceSummary: "Over 7 years designing resilient cloud-native web architectures, scaling systems from 50k to 2M+ daily active users with 99.99% availability, and driving cross-functional engineering teams towards rapid, continuous deployment.",
  reasonForApplying: "Starlight Technologies' industry-defining work on real-time autonomous systems and developer productivity tools has continuously set the benchmark. I want to bring my architectural expertise to accelerate your platform initiatives and scale resilient cloud infrastructures."
};

let currentFormat = 'letter'; // 'letter' | 'email' | 'inmail'

document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('app-form');
  const btnLoadSample = document.getElementById('btn-load-sample');
  const btnReset = document.getElementById('btn-reset');
  const btnCopy = document.getElementById('btn-copy');
  const btnPrint = document.getElementById('btn-print');
  const btnDownload = document.getElementById('btn-download');
  const formatTabs = document.querySelectorAll('.format-tab-btn');

  // Input fields
  const inputs = [
    'applicantName', 'applicantContact', 'targetRole', 'companyName',
    'hiringManager', 'toneStyle', 'keySkills', 'experienceSummary', 'reasonForApplying'
  ].map(id => document.getElementById(id));

  // Initialize with sample data
  populateForm(SAMPLE_DATA);
  renderPreview();

  // Listen for real-time input changes
  inputs.forEach(input => {
    if (input) {
      input.addEventListener('input', renderPreview);
      input.addEventListener('change', renderPreview);
    }
  });

  // Format tab switching
  formatTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      formatTabs.forEach(t => {
        t.classList.remove('active');
        t.setAttribute('aria-selected', 'false');
      });
      tab.classList.add('active');
      tab.setAttribute('aria-selected', 'true');
      currentFormat = tab.dataset.format;
      renderPreview();
    });
  });

  // Sample data button
  if (btnLoadSample) {
    btnLoadSample.addEventListener('click', () => {
      populateForm(SAMPLE_DATA);
      renderPreview();
      showToast('Loaded sample job application data.');
    });
  }

  // Reset button
  if (btnReset) {
    btnReset.addEventListener('click', () => {
      form.reset();
      renderPreview();
      showToast('Cleared application inputs.');
    });
  }

  // Copy to clipboard
  if (btnCopy) {
    btnCopy.addEventListener('click', copyCurrentContent);
  }

  // Print button
  if (btnPrint) {
    btnPrint.addEventListener('click', () => {
      window.print();
    });
  }

  // Download TXT
  if (btnDownload) {
    btnDownload.addEventListener('click', downloadAsTxt);
  }
});

function getFormData() {
  return {
    applicantName: document.getElementById('applicantName')?.value.trim() || 'Alex Morgan',
    applicantContact: document.getElementById('applicantContact')?.value.trim() || 'alex.morgan@example.com',
    targetRole: document.getElementById('targetRole')?.value.trim() || 'Software Engineer',
    companyName: document.getElementById('companyName')?.value.trim() || 'Acme Corp',
    hiringManager: document.getElementById('hiringManager')?.value.trim() || 'Hiring Team',
    toneStyle: document.getElementById('toneStyle')?.value || 'modern',
    keySkills: document.getElementById('keySkills')?.value.trim() || 'Software Development, Architecture, Team Leadership',
    experienceSummary: document.getElementById('experienceSummary')?.value.trim() || 'Demonstrated track record of scaling high-impact software systems.',
    reasonForApplying: document.getElementById('reasonForApplying')?.value.trim() || 'Strong passion for company mission and innovative engineering culture.'
  };
}

function populateForm(data) {
  Object.keys(data).forEach(key => {
    const el = document.getElementById(key);
    if (el) el.value = data[key];
  });
}

function getFormattedDate() {
  const options = { year: 'numeric', month: 'long', day: 'numeric' };
  return new Date().toLocaleDateString('en-US', options);
}

function generateContent(data, format) {
  const salutationName = data.hiringManager.toLowerCase().includes('hiring') || data.hiringManager.toLowerCase().includes('team')
    ? data.hiringManager
    : `Dear ${data.hiringManager}`;

  if (format === 'letter') {
    // 1. Full Formal Letter
    const subject = `Application for ${data.targetRole} – Re: Job Opening`;
    
    let toneOpening = '';
    let toneCloser = '';

    switch (data.toneStyle) {
      case 'executive':
        toneOpening = `I am writing to formally present my candidacy for the ${data.targetRole} position at ${data.companyName}. With a distinguished history of architectural leadership and technical execution, I am eager to contribute strategic guidance and engineering rigor to your organization.`;
        toneCloser = `Given ${data.companyName}'s prominent industry trajectory, I am confident that my executive perspective, engineering acumen, and commitment to operational excellence will yield immediate enterprise value.`;
        break;
      case 'technical':
        toneOpening = `I am writing to submit my application for the ${data.targetRole} role at ${data.companyName}. Having built high-throughput distributed systems and scalable infrastructure, I am energized by the opportunity to engineer robust solutions for your technology stack.`;
        toneCloser = `I welcome the opportunity to dive deep into your architecture, benchmarks, and technical challenges to discuss how my hands-on background can solve core bottlenecks and accelerate deployment velocity.`;
        break;
      case 'warm':
        toneOpening = `I am thrilled to apply for the ${data.targetRole} position at ${data.companyName}. Having closely followed your team's inspiring journey and positive culture, I would be delighted to bring my enthusiasm and experience to your collaborative environment.`;
        toneCloser = `I would love the opportunity to speak with you and the team directly to share how my background aligns with your core values and immediate vision.`;
        break;
      case 'modern':
      default:
        toneOpening = `I am excited to submit my application for the ${data.targetRole} role at ${data.companyName}. Combining deep technical expertise with proven product impact, I am driven to help scale your key initiatives and drive technical velocity.`;
        toneCloser = `I am enthusiastic about the prospect of joining ${data.companyName} at this pivotal stage of growth and look forward to discussing how my experience can deliver rapid, measurable results for your roadmap.`;
        break;
    }

    const body = `${salutationName},

${toneOpening}

${data.experienceSummary} Throughout my career, I have cultivated specialized proficiency across ${data.keySkills}. I thrive in transforming complex specifications into resilient, user-centric software, consistently championing maintainability, high code standards, and seamless cross-functional collaboration.

What uniquely draws me to ${data.companyName} is ${data.reasonForApplying}. Your commitment to high standards aligns seamlessly with my own professional principles, and I am excited by the opportunity to contribute directly to this mission.

${toneCloser}

Thank you for your time, consideration, and review of my application materials. I look forward to the possibility of discussing my background in greater detail during an interview.

Sincerely,

${data.applicantName}
${data.applicantContact}`;

    return { subject, body };

  } else if (format === 'email') {
    // 2. Direct Email Pitch
    const subject = `Application: ${data.targetRole} – ${data.applicantName}`;
    const salutation = data.hiringManager.toLowerCase().includes('team') ? `Hi ${data.hiringManager},` : `Dear ${data.hiringManager},`;

    const body = `${salutation}

I hope this email finds you well. I am reaching out to express my strong enthusiasm for the ${data.targetRole} role currently open at ${data.companyName}.

Here is a quick snapshot of the key strengths and value I bring to the table:

• Core Technical Competencies: Specialized in ${data.keySkills}.
• Proven Impact & Scale: ${data.experienceSummary}
• Alignment with ${data.companyName}: ${data.reasonForApplying}

I have attached my comprehensive resume and portfolio for your convenience. I would welcome the opportunity to connect for a brief 15-minute conversation next week to explore how my qualifications can immediately support your team's goals.

Thank you very much for your time and consideration.

Best regards,

${data.applicantName}
${data.applicantContact}`;

    return { subject, body };

  } else {
    // 3. LinkedIn InMail
    const subject = `${data.targetRole} role @ ${data.companyName} – ${data.applicantName}`;
    const salutation = `Hi ${data.hiringManager.split(' ')[0] || data.hiringManager},`;

    const body = `${salutation}

I noticed the ${data.targetRole} opening at ${data.companyName} and wanted to reach out directly. 

I've been impressed by ${data.reasonForApplying}. With a strong background in ${data.keySkills}, I have spent recent years ${data.experienceSummary.slice(0, 160)}...

Given this overlap, I would love to connect. Would you be open to a brief 10-minute chat this week to see if my background might be a strong match for what you're looking for?

Either way, keep up the fantastic work with ${data.companyName}!

Best,
${data.applicantName}
${data.applicantContact}`;

    return { subject, body };
  }
}

function renderPreview() {
  const data = getFormData();
  const content = generateContent(data, currentFormat);

  // Update header meta
  const nameEl = document.getElementById('display-applicant-name');
  const contactEl = document.getElementById('display-applicant-contact');
  const dateEl = document.getElementById('display-date');
  const companyEl = document.getElementById('display-target-company');
  const subjectContainer = document.getElementById('subject-container');
  const displaySubject = document.getElementById('display-subject');
  const bodyEl = document.getElementById('display-body');

  if (nameEl) nameEl.textContent = data.applicantName;
  if (contactEl) contactEl.textContent = data.applicantContact;
  if (dateEl) dateEl.textContent = getFormattedDate();
  if (companyEl) companyEl.textContent = data.companyName;

  if (subjectContainer && displaySubject) {
    if (currentFormat === 'email' || currentFormat === 'inmail') {
      subjectContainer.style.display = 'block';
      displaySubject.textContent = content.subject;
    } else {
      subjectContainer.style.display = 'none';
    }
  }

  if (bodyEl) {
    bodyEl.textContent = content.body;
  }

  // Update Counters
  const fullText = (content.subject ? `Subject: ${content.subject}\n\n` : '') + content.body;
  const words = fullText.trim() ? fullText.trim().split(/\s+/).length : 0;
  const chars = fullText.length;

  const statWords = document.getElementById('stat-words');
  const statChars = document.getElementById('stat-chars');
  const inmailIndicator = document.getElementById('inmail-indicator');
  const statFit = document.getElementById('stat-fit');

  if (statWords) statWords.textContent = words;
  if (statChars) statChars.textContent = chars;

  if (inmailIndicator && statFit) {
    if (currentFormat === 'inmail') {
      inmailIndicator.style.display = 'block';
      if (words <= 180) {
        statFit.textContent = 'High Response Rate (< 180 words)';
        statFit.style.color = 'var(--success)';
      } else if (words <= 260) {
        statFit.textContent = 'Moderate Length (< 260 words)';
        statFit.style.color = 'var(--warning)';
      } else {
        statFit.textContent = 'Too Long for InMail (> 260 words)';
        statFit.style.color = 'var(--error)';
      }
    } else {
      inmailIndicator.style.display = 'none';
    }
  }
}

function copyCurrentContent() {
  const data = getFormData();
  const content = generateContent(data, currentFormat);
  const fullText = (content.subject ? `Subject: ${content.subject}\n\n` : '') + content.body;

  navigator.clipboard.writeText(fullText).then(() => {
    showToast('Copied application text to clipboard!');
  }).catch(() => {
    // Fallback
    const textarea = document.createElement('textarea');
    textarea.value = fullText;
    document.body.appendChild(textarea);
    textarea.select();
    document.execCommand('copy');
    document.body.removeChild(textarea);
    showToast('Copied application text to clipboard!');
  });
}

function downloadAsTxt() {
  const data = getFormData();
  const content = generateContent(data, currentFormat);
  const fullText = (content.subject ? `Subject: ${content.subject}\n\n` : '') + content.body;

  const blob = new Blob([fullText], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  const safeCompany = data.companyName.toLowerCase().replace(/[^a-z0-9]/g, '-');
  a.href = url;
  a.download = `job-application-${safeCompany}-${currentFormat}.txt`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
  showToast('Downloaded application file.');
}

function showToast(message) {
  const toast = document.getElementById('toast');
  if (!toast) return;
  toast.textContent = message;
  toast.style.display = 'flex';
  toast.style.transform = 'translateY(0)';
  
  clearTimeout(toast._timeout);
  toast._timeout = setTimeout(() => {
    toast.style.transform = 'translateY(10px)';
    toast.style.display = 'none';
  }, 2800);
}