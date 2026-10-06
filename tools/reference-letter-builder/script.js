// Reference Letter Builder - Interactive Logic

const SAMPLE_DATA = {
  refereeName: "Dr. Marcus Vance",
  refereeTitle: "Vice President of Engineering",
  refereeOrg: "Nexus Cloud Systems",
  refereeContact: "marcus.vance@nexuscloud.io | +1 (555) 019-2834",
  candidateName: "Sophia Chen",
  targetOpportunity: "Lead Solutions Architect",
  relationshipType: "manager",
  yearsTogether: "3 years",
  notableAchievement: "Spearheaded the zero-downtime database migration that reduced server response latencies by 42% while mentoring 4 junior engineers.",
  recommendationReason: "Demonstrated rare ability to blend technical mastery with high-empathy leadership, consistently turning complex architectural ambiguities into resilient, production-ready deliverables.",
  endorsementLevel: "highest",
  strengths: [
    "Leadership & Mentorship",
    "Technical Mastery & Innovation",
    "Clear Communication & Stakeholder Alignment"
  ]
};

document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('ref-form');
  const btnLoadSample = document.getElementById('btn-load-sample');
  const btnReset = document.getElementById('btn-reset');
  const btnCopy = document.getElementById('btn-copy');
  const btnPrint = document.getElementById('btn-print');
  const btnDownload = document.getElementById('btn-download');

  const strengthChips = document.querySelectorAll('.strength-chip');

  // Input listeners
  const inputIds = [
    'refereeName', 'refereeOrg', 'refereeContact', 'candidateName',
    'targetOpportunity', 'relationshipType', 'yearsTogether',
    'notableAchievement', 'recommendationReason', 'endorsementLevel'
  ];

  inputIds.forEach(id => {
    const el = document.getElementById(id);
    if (el) {
      el.addEventListener('input', renderLetter);
      el.addEventListener('change', renderLetter);
    }
  });

  // Strength chips interaction
  strengthChips.forEach(chip => {
    const checkbox = chip.querySelector('input[type="checkbox"]');
    chip.addEventListener('click', (e) => {
      if (e.target !== checkbox) {
        checkbox.checked = !checkbox.checked;
      }
      chip.classList.toggle('selected', checkbox.checked);
      renderLetter();
    });
  });

  // Buttons
  if (btnLoadSample) {
    btnLoadSample.addEventListener('click', () => {
      loadSampleData();
      showToast('Loaded sample recommendation profile.');
    });
  }

  if (btnReset) {
    btnReset.addEventListener('click', () => {
      form.reset();
      strengthChips.forEach(c => {
        c.classList.remove('selected');
        c.querySelector('input').checked = false;
      });
      renderLetter();
      showToast('Cleared recommendation inputs.');
    });
  }

  if (btnCopy) {
    btnCopy.addEventListener('click', copyLetterToClipboard);
  }

  if (btnPrint) {
    btnPrint.addEventListener('click', () => window.print());
  }

  if (btnDownload) {
    btnDownload.addEventListener('click', downloadLetterAsTxt);
  }

  // Initial load
  loadSampleData();
});

function loadSampleData() {
  document.getElementById('refereeName').value = "Dr. Marcus Vance, Vice President of Engineering";
  document.getElementById('refereeOrg').value = SAMPLE_DATA.refereeOrg;
  document.getElementById('refereeContact').value = SAMPLE_DATA.refereeContact;
  document.getElementById('candidateName').value = SAMPLE_DATA.candidateName;
  document.getElementById('targetOpportunity').value = SAMPLE_DATA.targetOpportunity;
  document.getElementById('relationshipType').value = SAMPLE_DATA.relationshipType;
  document.getElementById('yearsTogether').value = SAMPLE_DATA.yearsTogether;
  document.getElementById('notableAchievement').value = SAMPLE_DATA.notableAchievement;
  document.getElementById('recommendationReason').value = SAMPLE_DATA.recommendationReason;
  document.getElementById('endorsementLevel').value = SAMPLE_DATA.endorsementLevel;

  const chips = document.querySelectorAll('.strength-chip');
  chips.forEach(chip => {
    const checkbox = chip.querySelector('input[type="checkbox"]');
    const isChecked = SAMPLE_DATA.strengths.includes(checkbox.value);
    checkbox.checked = isChecked;
    chip.classList.toggle('selected', isChecked);
  });

  renderLetter();
}

function getFormData() {
  const refereeFull = document.getElementById('refereeName')?.value.trim() || 'Dr. Marcus Vance, VP of Engineering';
  let refName = refereeFull;
  let refTitle = 'Executive Director';

  if (refereeFull.includes(',')) {
    const parts = refereeFull.split(',');
    refName = parts[0].trim();
    refTitle = parts.slice(1).join(',').trim();
  }

  const selectedStrengths = Array.from(document.querySelectorAll('.strength-chip input:checked'))
    .map(input => input.value);

  return {
    refereeName: refName,
    refereeTitle: refTitle,
    refereeOrg: document.getElementById('refereeOrg')?.value.trim() || 'Nexus Cloud Systems',
    refereeContact: document.getElementById('refereeContact')?.value.trim() || 'marcus.vance@nexuscloud.io',
    candidateName: document.getElementById('candidateName')?.value.trim() || 'Sophia Chen',
    targetOpportunity: document.getElementById('targetOpportunity')?.value.trim() || 'Solutions Architect',
    relationshipType: document.getElementById('relationshipType')?.value || 'manager',
    yearsTogether: document.getElementById('yearsTogether')?.value.trim() || '3 years',
    notableAchievement: document.getElementById('notableAchievement')?.value.trim() || 'Delivered flagship company projects ahead of schedule with exceptional quality.',
    recommendationReason: document.getElementById('recommendationReason')?.value.trim() || 'Consistently demonstrated unparalleled technical rigor and exemplary character.',
    endorsementLevel: document.getElementById('endorsementLevel')?.value || 'highest',
    strengths: selectedStrengths.length > 0 ? selectedStrengths : ['Technical Mastery', 'Leadership', 'Clear Communication']
  };
}

function generateFourParagraphs(data) {
  // Relationship phrasing
  let relationshipPhrase = '';
  switch (data.relationshipType) {
    case 'manager':
      relationshipPhrase = `as ${data.candidateName}'s direct manager and supervisor`;
      break;
    case 'colleague':
      relationshipPhrase = `as a senior colleague and close cross-functional collaborator alongside ${data.candidateName}`;
      break;
    case 'professor':
      relationshipPhrase = `as ${data.candidateName}'s academic professor and research advisor`;
      break;
    case 'director':
      relationshipPhrase = `in my capacity as Department Director overseeing ${data.candidateName}'s division`;
      break;
    default:
      relationshipPhrase = `in my capacity as ${data.candidateName}'s professional manager`;
  }

  // Endorsement phrasing
  let endorsementPhrase = '';
  switch (data.endorsementLevel) {
    case 'highest':
      endorsementPhrase = `my highest and most unreserved recommendation`;
      break;
    case 'enthusiastic':
      endorsementPhrase = `my enthusiastic and absolute recommendation`;
      break;
    case 'strong':
    default:
      endorsementPhrase = `my strong, unequivocal recommendation`;
      break;
  }

  const strengthsJoined = data.strengths.join(', ');

  // Paragraph 1: Relationship, Duration & Opening Recommendation
  const p1 = `It is with immense pleasure and great professional conviction that I write this letter of recommendation on behalf of ${data.candidateName}, who is applying for the position of ${data.targetOpportunity}. I have had the privilege of working closely with ${data.candidateName} for over ${data.yearsTogether} at ${data.refereeOrg}, serving ${relationshipPhrase}. During this period, ${data.candidateName} consistently distinguished themselves as an exceptional talent whose contributions elevated our entire team and organizational deliverables.`;

  // Paragraph 2: Core Competencies & Notable Achievement
  const p2 = `Throughout our collaboration, ${data.candidateName} repeatedly demonstrated extraordinary mastery in ${strengthsJoined}. Their analytical depth, attention to detail, and methodical problem-solving make them an invaluable asset when addressing complex challenges. Most notably, ${data.candidateName} ${data.notableAchievement} Their initiative, technical rigor, and ability to execute under pressure set a remarkable benchmark for performance across our organization.`;

  // Paragraph 3: Interpersonal Dynamics, Leadership & Cultural Impact
  const p3 = `Beyond their exemplary technical capabilities, what truly sets ${data.candidateName} apart is their profound interpersonal leadership, collaborative spirit, and uncompromising professional integrity. ${data.recommendationReason} Whether coordinating cross-functional stakeholder alignments, mentoring junior colleagues, or navigating ambiguous project requirements, ${data.candidateName} routinely fosters an environment of mutual trust, constructive dialogue, and relentless focus on excellence.`;

  // Paragraph 4: Conclusion, Endorsement & Invitation
  const p4 = `In summary, I offer ${data.candidateName} ${endorsementPhrase} for ${data.targetOpportunity}. I am completely confident that they possess the intellect, resilience, and character necessary to make an immediate, transformative impact on your organization. Should you require any further context or wish to discuss ${data.candidateName}'s qualifications in greater detail, please do not hesitate to contact me directly via email at ${data.refereeContact.split('|')[0].trim()} or by phone.`;

  return [p1, p2, p3, p4];
}

function renderLetter() {
  const data = getFormData();
  const paragraphs = generateFourParagraphs(data);

  // Update Letterhead Display
  const displayRefName = document.getElementById('display-ref-name');
  const displayRefTitle = document.getElementById('display-ref-title');
  const displayRefOrg = document.getElementById('display-ref-org');
  const displayRefContact = document.getElementById('display-ref-contact');
  const displayDate = document.getElementById('display-date');
  const displayCandidateHeader = document.getElementById('display-candidate-header');
  const displayBody = document.getElementById('display-body');

  const displaySigScript = document.getElementById('display-sig-script');
  const displaySigName = document.getElementById('display-sig-name');
  const displaySigRole = document.getElementById('display-sig-role');

  if (displayRefName) displayRefName.textContent = data.refereeName;
  if (displayRefTitle) displayRefTitle.textContent = data.refereeTitle;
  if (displayRefOrg) displayRefOrg.textContent = data.refereeOrg;
  if (displayRefContact) displayRefContact.textContent = data.refereeContact;
  if (displayDate) {
    const opts = { year: 'numeric', month: 'long', day: 'numeric' };
    displayDate.textContent = new Date().toLocaleDateString('en-US', opts);
  }
  if (displayCandidateHeader) displayCandidateHeader.textContent = data.candidateName;

  // Render 4 paragraphs
  if (displayBody) {
    displayBody.innerHTML = paragraphs.map(p => `<p>${p}</p>`).join('');
  }

  // Update Signature Line
  if (displaySigScript) displaySigScript.textContent = data.refereeName.replace(/^Dr\.\s*|^Mr\.\s*|^Ms\.\s*/i, '');
  if (displaySigName) displaySigName.textContent = data.refereeName;
  if (displaySigRole) displaySigRole.textContent = `${data.refereeTitle}, ${data.refereeOrg}`;

  // Word count
  const fullText = paragraphs.join(' ');
  const words = fullText.trim() ? fullText.trim().split(/\s+/).length : 0;
  const statWords = document.getElementById('stat-words');
  if (statWords) statWords.textContent = words;
}

function getFullLetterText() {
  const data = getFormData();
  const paragraphs = generateFourParagraphs(data);
  const dateStr = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

  return `${data.refereeName}
${data.refereeTitle}
${data.refereeOrg}
${data.refereeContact}

Date: ${dateStr}

To Whom It May Concern,
Subject: Formal Letter of Recommendation for ${data.candidateName}

${paragraphs[0]}

${paragraphs[1]}

${paragraphs[2]}

${paragraphs[3]}

Respectfully submitted,

${data.refereeName}
${data.refereeTitle}
${data.refereeOrg}
${data.refereeContact}`;
}

function copyLetterToClipboard() {
  const fullText = getFullLetterText();
  navigator.clipboard.writeText(fullText).then(() => {
    showToast('Copied recommendation letter to clipboard!');
  }).catch(() => {
    const textarea = document.createElement('textarea');
    textarea.value = fullText;
    document.body.appendChild(textarea);
    textarea.select();
    document.execCommand('copy');
    document.body.removeChild(textarea);
    showToast('Copied recommendation letter to clipboard!');
  });
}

function downloadLetterAsTxt() {
  const data = getFormData();
  const fullText = getFullLetterText();
  const blob = new Blob([fullText], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  const safeName = data.candidateName.toLowerCase().replace(/[^a-z0-9]/g, '-');
  a.href = url;
  a.download = `recommendation-letter-${safeName}.txt`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
  showToast('Downloaded recommendation letter file.');
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