// AI Cover Letter Writer - 3-Paragraph Tailored Cover Letter Generator
// Synthesizes Applicant Details, Target Role, Company, Years of Experience, and Key Strengths
// with Tone Controls: Formal, Enthusiastic, and Confident.

// 1. Preset Scenarios
const PRESET_SCENARIOS = {
  stripe: {
    applicantName: 'Sophia Montgomery',
    email: 'sophia.montgomery@example.com',
    phone: '+1 (555) 349-8812',
    location: 'San Francisco, CA • linkedin.com/in/sophiamontgomery',
    targetRole: 'Staff Infrastructure Architect',
    companyName: 'Stripe',
    managerName: 'Infrastructure Engineering Leadership',
    yearsExp: 9,
    strengths: 'multi-region Kubernetes migration, 38% latency reduction on global payment rails, automated FinOps saving $1.2M annually, mentored 14 senior engineers',
    tone: 'confident'
  },
  spotify: {
    applicantName: 'Julian Croft',
    email: 'julian.croft@example.com',
    phone: '+1 (212) 880-9140',
    location: 'New York, NY • linkedin.com/in/juliancroft',
    targetRole: 'Director of Growth Marketing',
    companyName: 'Spotify',
    managerName: 'Global Subscriber Growth Team',
    yearsExp: 8,
    strengths: 'scaled audio subscription acquisition by 34%, managed $12M multi-channel ad budget, engineered viral creator referral loops, boosted 30-day retention from 68% to 84%',
    tone: 'enthusiastic'
  },
  airbnb: {
    applicantName: 'Maya Lin-Torres',
    email: 'maya.lintorres@example.com',
    phone: '+1 (415) 773-6629',
    location: 'Seattle, WA • linkedin.com/in/mayalintorres',
    targetRole: 'Lead Product Manager - Host Community',
    companyName: 'Airbnb',
    managerName: 'Host Experience Product Committee',
    yearsExp: 7,
    strengths: 'redesigned two-sided marketplace onboarding, increased host activation by 28%, led 18-person cross-functional squad, reduced booking friction through localized pricing',
    tone: 'confident'
  },
  goldman: {
    applicantName: 'David Sterling Vance',
    email: 'david.vance@example.org',
    phone: '+1 (212) 555-0188',
    location: 'New York, NY • linkedin.com/in/davidsterlingvance',
    targetRole: 'Vice President - Corporate FP&A & Strategy',
    companyName: 'Goldman Sachs',
    managerName: 'Investment Banking & Corporate Treasury Leadership',
    yearsExp: 11,
    strengths: 'directed $180M liquidity allocation models, structured $45M syndicated debt facilities, eliminated $3.4M in operational variance, led board financial audit presentations',
    tone: 'formal'
  }
};

// 2. Application State
const state = {
  currentTone: 'confident'
};

// 3. DOM Initialization
document.addEventListener('DOMContentLoaded', () => {
  initDOM();
  // Format current date
  setTodayDate();
  // Wire presets
  document.getElementById('scenarioStripe')?.addEventListener('click', () => loadScenario('stripe'));
  document.getElementById('scenarioSpotify')?.addEventListener('click', () => loadScenario('spotify'));
  document.getElementById('scenarioAirbnb')?.addEventListener('click', () => loadScenario('airbnb'));
  document.getElementById('scenarioGoldman')?.addEventListener('click', () => loadScenario('goldman'));

  // Tone chips
  document.querySelectorAll('.tone-chip').forEach(chip => {
    chip.addEventListener('click', () => {
      document.querySelectorAll('.tone-chip').forEach(c => c.classList.remove('active'));
      chip.classList.add('active');
      state.currentTone = chip.dataset.tone;
      generateLetter();
    });
  });

  // Action buttons
  document.getElementById('btnGenerateLetter')?.addEventListener('click', generateLetter);
  document.getElementById('btnCopyLetter')?.addEventListener('click', copyLetterToClipboard);
  document.getElementById('btnDownloadTxt')?.addEventListener('click', downloadLetterAsTxt);
  document.getElementById('btnPrintLetter')?.addEventListener('click', () => window.print());

  // Input listeners for word count updates and live sync
  const contentParagraphs = ['dispParagraph1', 'dispParagraph2', 'dispParagraph3'];
  contentParagraphs.forEach(id => {
    const el = document.getElementById(id);
    if (el) {
      el.addEventListener('input', updateWordCount);
    }
  });

  // Initial calculation
  updateWordCount();
});

function setTodayDate() {
  const dateEl = document.getElementById('dispLetterDate');
  if (dateEl) {
    const now = new Date();
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    dateEl.textContent = now.toLocaleDateString('en-US', options);
  }
}

function loadScenario(key) {
  const s = PRESET_SCENARIOS[key];
  if (!s) return;

  document.getElementById('inputApplicantName').value = s.applicantName;
  document.getElementById('inputEmail').value = s.email;
  document.getElementById('inputPhone').value = s.phone;
  document.getElementById('inputLocation').value = s.location;
  document.getElementById('inputTargetRole').value = s.targetRole;
  document.getElementById('inputCompanyName').value = s.companyName;
  document.getElementById('inputManagerName').value = s.managerName;
  document.getElementById('inputYearsExp').value = s.yearsExp;
  document.getElementById('inputKeyStrengths').value = s.strengths;

  state.currentTone = s.tone;
  document.querySelectorAll('.tone-chip').forEach(c => {
    c.classList.toggle('active', c.dataset.tone === s.tone);
  });

  generateLetter();
}

// 4. Generation Logic
function generateLetter() {
  const name = document.getElementById('inputApplicantName')?.value.trim() || 'Applicant';
  const email = document.getElementById('inputEmail')?.value.trim() || 'email@example.com';
  const phone = document.getElementById('inputPhone')?.value.trim() || '+1 (555) 000-0000';
  const loc = document.getElementById('inputLocation')?.value.trim() || 'Location';
  const role = document.getElementById('inputTargetRole')?.value.trim() || 'Target Position';
  const company = document.getElementById('inputCompanyName')?.value.trim() || 'Target Organization';
  const manager = document.getElementById('inputManagerName')?.value.trim() || 'Hiring Team';
  const years = document.getElementById('inputYearsExp')?.value.trim() || '5';
  const strengths = document.getElementById('inputKeyStrengths')?.value.trim() || 'strategic execution, leadership, and operational optimization';
  const tone = state.currentTone;

  // Update Letterhead Elements
  const dispSenderName = document.getElementById('dispSenderName');
  const dispSenderMeta = document.getElementById('dispSenderMeta');
  const dispRecipientTeam = document.getElementById('dispRecipientTeam');
  const dispCompanyName = document.getElementById('dispCompanyName');
  const dispSalutation = document.getElementById('dispSalutation');
  const dispSignature = document.getElementById('dispSignature');
  const dispSignoffName = document.getElementById('dispSignoffName');
  const dispSignoff = document.getElementById('dispSignoff');

  if (dispSenderName) dispSenderName.textContent = name;
  if (dispSenderMeta) dispSenderMeta.innerHTML = `${escapeHtml(email)} • ${escapeHtml(phone)}<br>${escapeHtml(loc)}`;
  if (dispRecipientTeam) dispRecipientTeam.textContent = manager;
  if (dispCompanyName) dispCompanyName.textContent = company;
  if (dispSalutation) dispSalutation.textContent = `Dear ${manager},`;
  if (dispSignature) dispSignature.textContent = name;
  if (dispSignoffName) dispSignoffName.textContent = name;

  // Format Strengths List for Natural Prose
  const formattedStrengths = formatStrengthsToProse(strengths);

  let p1 = '';
  let p2 = '';
  let p3 = '';

  if (tone === 'confident') {
    dispSignoff.textContent = 'Best regards,';
    p1 = `I am writing to express my strong interest in the ${role} position at ${company}. Having followed ${company}’s leadership in setting the benchmark for industry innovation, I bring ${years}+ years of hands-on expertise architecting high-impact solutions and driving decisive organizational outcomes. I am confident that my proven background and relentless focus on measurable value directly align with ${company}’s strategic priorities.`;
    p2 = `Throughout my career, I have specialized in turning ambitious objectives into repeatable, high-yield results. In my most recent leadership capacities, I have consistently spearheaded key milestones including ${formattedStrengths}. By combining deep domain rigor with cross-functional execution, I ensure that critical initiatives not only meet aggressive milestones but consistently deliver sustainable, long-term ROI.`;
    p3 = `Given ${company}’s continuous expansion and high performance standards, I would welcome the opportunity to discuss how my track record in high-velocity execution and strategic alignment can immediately contribute to your team’s roadmap. Thank you for your time, consideration, and leadership.`;
  } else if (tone === 'enthusiastic') {
    dispSignoff.textContent = 'With warm enthusiasm,';
    p1 = `I was thrilled to discover the opening for the ${role} position at ${company}! As someone who deeply admires ${company}’s mission, vibrant culture, and groundbreaking work, I am genuinely excited by the prospect of contributing my ${years}+ years of passionate experience to such an inspiring team.`;
    p2 = `What excites me most about this role is the opportunity to solve complex challenges that truly matter. In my past work, I have channeled this passion into transformative achievements such as ${formattedStrengths}. I thrive in collaborative, fast-moving environments where creative problem-solving and shared dedication translate into remarkable user and product milestones.`;
    p3 = `I would love the opportunity to share my enthusiasm in person and explore how my experience, energy, and dedication can support ${company}’s next wave of extraordinary achievements. Thank you so much for your time and thoughtful consideration—I look forward to speaking soon!`;
  } else {
    // Formal Tone
    dispSignoff.textContent = 'Respectfully yours,';
    p1 = `Please accept this letter as a formal expression of my candidacy for the ${role} position at ${company}. With over ${years} years of dedicated professional experience in enterprise governance, high-stakes execution, and technical excellence, I have developed an acute appreciation for the institutional caliber that defines ${company}.`;
    p2 = `My background is characterized by structured methodological stewardship and consistent delivery against corporate objectives. Specifically, I have directed initiatives encompassing ${formattedStrengths}. These responsibilities have equipped me with the analytical rigor, fiduciary discipline, and stakeholder leadership required to uphold ${company}’s exacting standards.`;
    p3 = `I welcome the opportunity to discuss my qualifications in greater detail during a formal interview. Thank you for your courtesy, time, and consideration of my application.`;
  }

  const elP1 = document.getElementById('dispParagraph1');
  const elP2 = document.getElementById('dispParagraph2');
  const elP3 = document.getElementById('dispParagraph3');

  if (elP1) elP1.textContent = p1;
  if (elP2) elP2.textContent = p2;
  if (elP3) elP3.textContent = p3;

  updateWordCount();
}

function formatStrengthsToProse(raw) {
  if (!raw) return 'driving operational efficiency and team leadership';
  const items = raw.split(/[,;\n]+/).map(s => s.trim().replace(/^[-*•]\s*/, '')).filter(s => s.length > 0);
  if (items.length === 0) return 'delivering key project milestones and driving organizational impact';
  if (items.length === 1) return items[0];
  if (items.length === 2) return `${items[0]} and ${items[1]}`;
  const last = items.pop();
  return `${items.join(', ')}, and ${last}`;
}

function updateWordCount() {
  const p1 = document.getElementById('dispParagraph1')?.textContent || '';
  const p2 = document.getElementById('dispParagraph2')?.textContent || '';
  const p3 = document.getElementById('dispParagraph3')?.textContent || '';
  const combined = `${p1} ${p2} ${p3}`.trim();

  const words = combined.length > 0 ? combined.split(/\s+/).filter(w => w.length > 0).length : 0;
  const readTime = (words / 220).toFixed(1);

  const wordEl = document.getElementById('wordCountDisplay');
  const timeEl = document.getElementById('readTimeDisplay');

  if (wordEl) wordEl.textContent = words;
  if (timeEl) timeEl.textContent = readTime;
}

// 5. Export Actions
function copyLetterToClipboard() {
  const text = getFullLetterPlainText();
  navigator.clipboard.writeText(text).then(() => {
    alert('Cover letter copied to clipboard!');
  }).catch(() => {
    alert('Failed to copy to clipboard.');
  });
}

function downloadLetterAsTxt() {
  const text = getFullLetterPlainText();
  const company = document.getElementById('inputCompanyName')?.value.trim() || 'Company';
  const role = document.getElementById('inputTargetRole')?.value.trim() || 'CoverLetter';

  const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `Cover_Letter_${company}_${role}.txt`.replace(/\s+/g, '_');
  a.click();
  URL.revokeObjectURL(url);
}

function getFullLetterPlainText() {
  const name = document.getElementById('dispSenderName')?.textContent || '';
  const meta = (document.getElementById('dispSenderMeta')?.innerText || '').replace(/\n+/g, ' | ');
  const date = document.getElementById('dispLetterDate')?.textContent || '';
  const team = document.getElementById('dispRecipientTeam')?.textContent || '';
  const company = document.getElementById('dispCompanyName')?.textContent || '';
  const salutation = document.getElementById('dispSalutation')?.textContent || '';
  const p1 = document.getElementById('dispParagraph1')?.textContent || '';
  const p2 = document.getElementById('dispParagraph2')?.textContent || '';
  const p3 = document.getElementById('dispParagraph3')?.textContent || '';
  const signoff = document.getElementById('dispSignoff')?.textContent || '';

  return `${name}\n${meta}\n\n${date}\n\nTo: ${team}\n${company}\n\n${salutation}\n\n${p1}\n\n${p2}\n\n${p3}\n\n${signoff}\n${name}\n`;
}

function escapeHtml(str) {
  if (!str) return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}