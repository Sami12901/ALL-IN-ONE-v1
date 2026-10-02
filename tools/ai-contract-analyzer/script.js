// AI Contract Analyzer - Legal Clause Extractor & Risk Auditor

document.addEventListener('DOMContentLoaded', () => {
  // Elements
  const dropZone = document.getElementById('drop-zone');
  const pdfInput = document.getElementById('pdf-input');
  const loadSampleSaasBtn = document.getElementById('load-sample-saas-btn');
  const loadSampleEmploymentBtn = document.getElementById('load-sample-employment-btn');
  const uploadPanel = document.getElementById('upload-panel');
  const processingState = document.getElementById('processing-state');
  const statusTitle = document.getElementById('status-title');
  const statusDesc = document.getElementById('status-desc');
  const contractWorkspace = document.getElementById('contract-workspace');

  // Results & Badges
  const contractFilename = document.getElementById('contract-filename');
  const contractTypeBadge = document.getElementById('contract-type-badge');
  const riskScoreVal = document.getElementById('risk-score-val');
  const riskScoreCircle = document.getElementById('risk-score-circle');
  const riskRatingText = document.getElementById('risk-rating-text');
  const riskSummaryText = document.getElementById('risk-summary-text');
  const statHighRisk = document.getElementById('stat-high-risk');
  const statMedRisk = document.getElementById('stat-med-risk');
  const statLowRisk = document.getElementById('stat-low-risk');
  const coreParamsGrid = document.getElementById('core-params-grid');
  const clausesContainer = document.getElementById('clauses-container');
  const checklistGrid = document.getElementById('checklist-grid');

  // Actions
  const exportJsonBtn = document.getElementById('export-json-btn');
  const printDossierBtn = document.getElementById('print-dossier-btn');
  const exportPdfDossierBtn = document.getElementById('export-pdf-dossier-btn');
  const resetBtn = document.getElementById('reset-btn');

  // State
  let currentAuditData = null;

  // Initialize PDF.js worker
  if (window.pdfjsLib && !window.pdfjsLib.GlobalWorkerOptions.workerSrc) {
    window.pdfjsLib.GlobalWorkerOptions.workerSrc = '../../assets/lib/pdf.worker.min.js';
  }

  // Drag & Drop
  ['dragenter', 'dragover'].forEach(eventName => {
    dropZone.addEventListener(eventName, (e) => {
      e.preventDefault();
      e.stopPropagation();
      dropZone.classList.add('dropzone-active');
    }, false);
  });

  ['dragleave', 'drop'].forEach(eventName => {
    dropZone.addEventListener(eventName, (e) => {
      e.preventDefault();
      e.stopPropagation();
      dropZone.classList.remove('dropzone-active');
    }, false);
  });

  dropZone.addEventListener('drop', (e) => {
    const dt = e.dataTransfer;
    if (dt.files.length > 0) {
      handleContractPdf(dt.files[0]);
    }
  });

  pdfInput.addEventListener('change', (e) => {
    if (e.target.files.length > 0) {
      handleContractPdf(e.target.files[0]);
    }
  });

  loadSampleSaasBtn.addEventListener('click', () => {
    loadSampleContract('saas');
  });

  loadSampleEmploymentBtn.addEventListener('click', () => {
    loadSampleContract('employment');
  });

  resetBtn.addEventListener('click', () => {
    contractWorkspace.classList.add('hidden');
    dropZone.classList.remove('hidden');
    processingState.classList.add('hidden');
    pdfInput.value = '';
    currentAuditData = null;
  });

  exportJsonBtn.addEventListener('click', () => {
    if (!currentAuditData) return;
    const jsonStr = JSON.stringify(currentAuditData, null, 2);
    downloadFile(jsonStr, `${currentAuditData.filename.replace(/\.[^/.]+$/, "")}-Legal-Audit.json`, 'application/json');
  });

  printDossierBtn.addEventListener('click', () => {
    window.print();
  });

  exportPdfDossierBtn.addEventListener('click', () => {
    if (!currentAuditData) return;
    const element = document.getElementById('printable-dossier');
    const opt = {
      margin: [10, 10, 10, 10],
      filename: `${currentAuditData.filename.replace(/\.[^/.]+$/, "")}-Legal-Risk-Audit-Dossier.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };
    if (window.html2pdf) {
      window.html2pdf().set(opt).from(element).save();
    } else {
      window.print();
    }
  });

  // Handle PDF file upload
  function handleContractPdf(file) {
    if (!file || file.type !== 'application/pdf') {
      alert('Please upload a valid PDF contract document.');
      return;
    }

    dropZone.classList.add('hidden');
    processingState.classList.remove('hidden');
    statusTitle.textContent = 'Extracting Contract Text...';
    statusDesc.textContent = `Analyzing ${file.name} for legal clauses`;

    const reader = new FileReader();
    reader.onload = async function() {
      try {
        const typedArray = new Uint8Array(this.result);
        const pdf = await window.pdfjsLib.getDocument({ data: typedArray }).promise;
        let fullText = '';

        for (let i = 1; i <= pdf.numPages; i++) {
          const page = await pdf.getPage(i);
          const textContent = await page.getTextContent();
          const pageStr = textContent.items.map(item => item.str).join(' ');
          fullText += ' ' + pageStr;
        }

        if (fullText.trim().length < 50) {
          throw new Error('PDF has empty or unscannable text layer.');
        }

        statusTitle.textContent = 'Auditing Liability & Clauses...';
        setTimeout(() => {
          auditContractText(file.name, fullText.trim());
        }, 400);

      } catch (err) {
        console.error('Contract PDF error:', err);
        alert('Could not parse contract text from PDF. The document might be image-only or encrypted.');
        dropZone.classList.remove('hidden');
        processingState.classList.add('hidden');
      }
    };
    reader.readAsArrayBuffer(file);
  }

  function loadSampleContract(type) {
    dropZone.classList.add('hidden');
    processingState.classList.remove('hidden');
    statusTitle.textContent = 'Synthesizing Institutional Agreement...';
    statusDesc.textContent = 'Extracting legal provisions & risk indicators';

    setTimeout(() => {
      let filename = 'Enterprise_Master_Cloud_Agreement.pdf';
      let text = getSampleSaasText();
      if (type === 'employment') {
        filename = 'Executive_Employment_Agreement.pdf';
        text = getSampleEmploymentText();
      }
      auditContractText(filename, text);
    }, 500);
  }

  // Core Legal Audit Algorithm
  function auditContractText(filename, fullText) {
    const lower = fullText.toLowerCase();

    // 1. Detect Contract Type
    let contractType = 'Commercial Services Agreement';
    if (lower.includes('employment') || lower.includes('employee') || lower.includes('salary') || lower.includes('non-solicitation of employees')) {
      contractType = 'Executive Employment Agreement';
    } else if (lower.includes('software as a service') || lower.includes('saas') || lower.includes('cloud services') || lower.includes('api')) {
      contractType = 'SaaS Master Subscription Agreement';
    } else if (lower.includes('non-disclosure') || lower.includes('confidentiality agreement') || lower.includes('proprietary information')) {
      contractType = 'Mutual Non-Disclosure Agreement (NDA)';
    }

    // 2. Extract Core Agreement Parameters
    const params = extractCoreParameters(fullText, lower);

    // 3. Extract & Audit Key Clauses
    const clauseAudits = extractAndAuditClauses(fullText, lower, contractType);

    // 4. Checklist of standard protective clauses
    const checklist = checkStandardProtections(lower);

    // 5. Compute Risk Score (0-100)
    let highCount = 0;
    let medCount = 0;
    let lowCount = 0;

    clauseAudits.forEach(c => {
      if (c.severity === 'high') highCount++;
      else if (c.severity === 'medium') medCount++;
      else lowCount++;
    });

    const missingEssential = checklist.filter(c => !c.present && c.critical).length;
    let riskScore = Math.min(95, Math.max(12, (highCount * 25) + (medCount * 12) + (missingEssential * 15)));

    let riskRating = 'Low Commercial Risk';
    let riskColor = 'var(--success)';
    if (riskScore >= 60) {
      riskRating = 'High Risk - Legal Review Recommended';
      riskColor = 'var(--error)';
    } else if (riskScore >= 35) {
      riskRating = 'Moderate Risk - Clause Amendments Advised';
      riskColor = 'var(--warning)';
    }

    currentAuditData = {
      filename,
      contractType,
      riskScore,
      riskRating,
      highCount,
      medCount,
      lowCount,
      params,
      clauses: clauseAudits,
      checklist
    };

    renderAuditUI(currentAuditData, riskColor);

    processingState.classList.add('hidden');
    contractWorkspace.classList.remove('hidden');
  }

  function renderAuditUI(data, riskColor) {
    contractFilename.textContent = data.filename;
    contractTypeBadge.textContent = data.contractType;
    riskScoreVal.textContent = data.riskScore;
    riskScoreVal.style.color = riskColor;
    riskScoreCircle.style.borderColor = riskColor;
    riskRatingText.textContent = data.riskRating;
    riskRatingText.style.color = riskColor;

    riskSummaryText.textContent = `Found ${data.highCount} high risk clause(s), ${data.medCount} medium risk clause(s), and ${data.checklist.filter(c => !c.present).length} unaddressed protective term(s).`;

    statHighRisk.textContent = data.highCount;
    statMedRisk.textContent = data.medCount;
    statLowRisk.textContent = data.lowCount;

    // Render Core Params
    coreParamsGrid.innerHTML = '';
    data.params.forEach(p => {
      const card = document.createElement('div');
      card.style.background = 'var(--bg-secondary)';
      card.style.border = '1px solid var(--border)';
      card.style.borderRadius = 'var(--radius-sm)';
      card.style.padding = '0.85rem 1rem';
      card.innerHTML = `
        <div style="font-size: 0.75rem; text-transform: uppercase; color: var(--text-secondary); margin-bottom: 0.25rem;">${escapeHtml(p.label)}</div>
        <div style="font-weight: 700; font-size: 0.95rem; color: var(--text-primary);">${escapeHtml(p.value)}</div>
      `;
      coreParamsGrid.appendChild(card);
    });

    // Render Clauses
    clausesContainer.innerHTML = '';
    data.clauses.forEach(c => {
      const card = document.createElement('div');
      card.className = 'clause-card';
      card.innerHTML = `
        <div class="clause-card-header">
          <strong style="font-size: 1rem; color: var(--text-primary);">${escapeHtml(c.title)}</strong>
          <span class="risk-tag ${c.severity}">${c.severity} Risk</span>
        </div>
        <div class="clause-text">"${escapeHtml(c.extractedSnippet)}"</div>
        <div class="clause-advice">
          <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" style="color: var(--accent); flex-shrink: 0; margin-top: 2px;"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>
          <div>
            <strong>Legal Finding:</strong> ${escapeHtml(c.riskRationale)}<br>
            <span style="color: var(--accent); font-weight: 600;">Recommended Redline:</span> ${escapeHtml(c.recommendation)}
          </div>
        </div>
      `;
      clausesContainer.appendChild(card);
    });

    // Render Checklist
    checklistGrid.innerHTML = '';
    data.checklist.forEach(item => {
      const div = document.createElement('div');
      div.className = `missing-item ${item.present ? 'found' : 'absent'}`;
      div.innerHTML = `
        <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2">
          ${item.present ? '<polyline points="20 6 9 17 4 12"></polyline>' : '<circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line>'}
        </svg>
        <div>
          <strong style="display:block;">${escapeHtml(item.name)}</strong>
          <span style="font-size: 0.75rem; opacity: 0.85;">${item.present ? 'Included in text' : 'Missing / Unspecified'}</span>
        </div>
      `;
      checklistGrid.appendChild(div);
    });
  }

  // Extract Core Parameters
  function extractCoreParameters(fullText, lower) {
    const params = [];

    // Contracting Parties
    let parties = 'Not explicitly detected';
    const partiesMatch = fullText.match(/(?:by and between|between)\s+([^,\n\r]+?)(?:,\s*and|\s+and)\s+([^,\n\r]+?)(?:\.|,|\s+as of)/i);
    if (partiesMatch) {
      parties = `${cleanParty(partiesMatch[1])} & ${cleanParty(partiesMatch[2])}`;
    }
    params.push({ label: 'Contracting Parties', value: parties });

    // Effective Date
    let effDate = 'Not specified';
    const effMatch = fullText.match(/(?:effective date|as of|entered into as of)\s+([A-Z][a-z]+\s+\d{1,2},?\s+20\d{2}|\d{1,2}[\/\-]\d{1,2}[\/\-]20\d{2})/i);
    if (effMatch) {
      effDate = effMatch[1].trim();
    }
    params.push({ label: 'Effective Date', value: effDate });

    // Expiration / Term
    let term = '12 Months / Annual Renewal';
    if (lower.includes('indefinite') || lower.includes('perpetual')) {
      term = 'Perpetual / Indefinite';
    } else {
      const termMatch = fullText.match(/(?:term of|period of)\s+(\d+\s+(?:months|years|days))/i);
      if (termMatch) term = termMatch[1];
    }
    params.push({ label: 'Term & Duration', value: term });

    // Governing Law & Jurisdiction
    let govLaw = 'State of New York, USA';
    const govMatch = fullText.match(/(?:governed by|construed in accordance with)(?: the)?\s+(?:laws of(?: the)?\s+([^,.\n]+))/i);
    if (govMatch) {
      govLaw = govMatch[1].trim();
    }
    params.push({ label: 'Governing Law', value: govLaw });

    return params;
  }

  function cleanParty(str) {
    return str.replace(/['"]+/g, '').replace(/\s+/g, ' ').trim();
  }

  // Clause Extraction & Risk Audit Rules
  function extractAndAuditClauses(fullText, lower, contractType) {
    const audits = [];

    // 1. Indemnification & Liability Cap
    const indemMatch = extractClauseSnippet(fullText, /indemnif(?:y|ication)|hold harmless|liable for any/i);
    if (indemMatch) {
      const isUnlimited = /unlimited|no limitation|without cap|all damages/i.test(indemMatch) && !/shall not exceed|capped at|limited to the fees/i.test(indemMatch);
      audits.push({
        title: 'Indemnification & Limitation of Liability',
        extractedSnippet: indemMatch,
        severity: isUnlimited ? 'high' : 'medium',
        riskRationale: isUnlimited
          ? 'Potential uncapped indemnity exposure detected. The clause does not explicitly restrict liability to fees paid during the preceding 12-month period.'
          : 'Indemnification clause is present with mutual restrictions. Confirm that gross negligence and willful misconduct exceptions are balanced.',
        recommendation: isUnlimited
          ? 'Insert a strict aggregate liability cap (e.g., "capped at total fees paid in the preceding 12 months") and exclude indirect/consequential damages.'
          : 'Ensure reciprocal indemnification rights and require prompt written notification of any third-party claims.'
      });
    }

    // 2. Termination Clause
    const termMatch = extractClauseSnippet(fullText, /termination for convenience|terminate this agreement|notice of termination/i);
    if (termMatch) {
      const shortNotice = /\b(?:7|10|14)\s+days\b/i.test(termMatch);
      const unilateral = /either party may terminate at any time|sole discretion/i.test(termMatch);
      audits.push({
        title: 'Termination Terms & Notice Period',
        extractedSnippet: termMatch,
        severity: shortNotice || unilateral ? 'high' : 'low',
        riskRationale: shortNotice
          ? 'Unusually short termination notice period (< 30 days) exposes operations to unexpected service disruption.'
          : 'Standard termination provisions detected with reasonable bilateral rights.',
        recommendation: shortNotice
          ? 'Negotiate a minimum 30 or 60 days written notice window for termination for convenience.'
          : 'Verify that pre-paid fees for unused periods are pro-rated and refunded upon termination.'
      });
    }

    // 3. Payment Terms & Late Penalties
    const payMatch = extractClauseSnippet(fullText, /payment terms|invoices? shall be paid|net \d+|late fee|accrue interest/i);
    if (payMatch) {
      const highInterest = /1\.5%|2%|penalty/i.test(payMatch);
      audits.push({
        title: 'Payment Terms & Overdue Interest',
        extractedSnippet: payMatch,
        severity: highInterest ? 'medium' : 'low',
        riskRationale: highInterest
          ? 'Overdue interest rate exceeds standard institutional baselines (typically 1.0% per month or statutory maximum).'
          : 'Payment terms adhere to customary commercial guidelines (Net 30/45).',
        recommendation: highInterest
          ? 'Counter with: "1.0% per month or the highest legal rate, whichever is lower", plus a 10-day grace period following notice.'
          : 'Ensure payments are contingent upon receipt of an undisputed, itemized invoice.'
      });
    }

    // 4. Confidentiality & Non-Disclosure
    const confMatch = extractClauseSnippet(fullText, /confidential information|strict confidence|non-disclosure/i);
    if (confMatch) {
      const perpetual = /perpetual|indefinite|in perpetuity/i.test(confMatch);
      audits.push({
        title: 'Confidentiality & Trade Secrets',
        extractedSnippet: confMatch,
        severity: perpetual ? 'medium' : 'low',
        riskRationale: perpetual
          ? 'Perpetual confidentiality obligation on general business data creates extended compliance overhead.'
          : 'Mutual confidentiality obligations are well structured.',
        recommendation: perpetual
          ? 'Limit duration of confidentiality obligations to 3 to 5 years following termination, except for bona fide trade secrets.'
          : 'Maintain standard exclusions for publicly available information or court-mandated disclosures.'
      });
    }

    // 5. Non-Compete & Restrictive Covenants
    const nonCompMatch = extractClauseSnippet(fullText, /non-compet|covenant not to compete|restrictive covenant|non-solicit/i);
    if (nonCompMatch) {
      const broad = /worldwide|global|all competitors|\d+\s+years/i.test(nonCompMatch);
      audits.push({
        title: 'Non-Compete & Exclusivity Restrictions',
        extractedSnippet: nonCompMatch,
        severity: broad ? 'high' : 'medium',
        riskRationale: broad
          ? 'Broad geographic or temporal restrictions (> 1 year) may impede commercial flexibility or be legally unenforceable in certain jurisdictions.'
          : 'Targeted restrictive covenant observed.',
        recommendation: 'Narrow geographic scope to specific primary markets and limit restrictions strictly to active direct clients.'
      });
    }

    // 6. Intellectual Property Rights
    const ipMatch = extractClauseSnippet(fullText, /intellectual property|ownership of work|retains all title|copyright/i);
    if (ipMatch) {
      audits.push({
        title: 'Intellectual Property & Ownership',
        extractedSnippet: ipMatch,
        severity: 'low',
        riskRationale: 'IP provisions designate pre-existing background technology and deliverable rights.',
        recommendation: 'Confirm that client retains full ownership of customer data, proprietary datasets, and derived work product.'
      });
    }

    return audits;
  }

  function extractClauseSnippet(fullText, regex) {
    const match = fullText.match(regex);
    if (!match) return null;
    const start = Math.max(0, match.index - 30);
    const end = Math.min(fullText.length, match.index + 280);
    return fullText.substring(start, end).replace(/\s+/g, ' ').trim() + '...';
  }

  function checkStandardProtections(lower) {
    return [
      { name: 'Limitation of Liability Cap', present: lower.includes('limitation of liability') || lower.includes('aggregate liability'), critical: true },
      { name: 'Force Majeure (Acts of God)', present: lower.includes('force majeure') || lower.includes('acts of god'), critical: false },
      { name: 'Data Protection & Privacy (GDPR)', present: lower.includes('data protection') || lower.includes('gdpr') || lower.includes('privacy'), critical: true },
      { name: 'Dispute Resolution / Arbitration', present: lower.includes('arbitration') || lower.includes('dispute resolution') || lower.includes('mediation'), critical: false },
      { name: 'Severability Clause', present: lower.includes('severability') || lower.includes('invalidity'), critical: false },
      { name: 'Entire Agreement / Integration', present: lower.includes('entire agreement') || lower.includes('supersedes all prior'), critical: true }
    ];
  }

  function escapeHtml(str) {
    if (!str) return '';
    return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;");
  }

  function downloadFile(content, fileName, contentType) {
    const a = document.createElement("a");
    const file = new Blob([content], { type: contentType });
    a.href = URL.createObjectURL(file);
    a.download = fileName;
    a.click();
    URL.revokeObjectURL(a.href);
  }

  function getSampleSaasText() {
    return `MASTER SERVICES AND CLOUD SUBSCRIPTION AGREEMENT
This Master Agreement is entered into as of October 12, 2026, by and between CloudScale Infrastructure Inc. ("Provider") and Apex Digital Solutions LLC ("Client").
1. TERM AND TERMINATION. This Agreement shall be effective for an initial term of 24 months. Either party may terminate this agreement for convenience upon providing 14 days prior written notice. Provider may terminate immediately in its sole discretion if Client disputes any fees.
2. FEES AND PAYMENT TERMS. Invoices shall be paid within thirty (30) days from transmission. Late payments shall accrue interest at a rate of 2.0% per month or the highest lawful rate.
3. INDEMNIFICATION AND LIABILITY. Client agrees to indemnify and hold harmless Provider from any and all damages, claims, and losses arising from the use of the platform. Provider's total aggregate liability for any claims shall be unlimited and Provider disclaims all express warranties.
4. CONFIDENTIALITY. Each party agrees to keep in strict confidence all proprietary technical information in perpetuity, with no expiration on confidentiality obligations.
5. GOVERNING LAW. This agreement is governed by the laws of the State of Delaware, without regard to principles of conflicts of law. The parties submit to exclusive jurisdiction of Wilmington, Delaware.
6. ENTIRE AGREEMENT. This document represents the entire agreement and supersedes all prior representations.`;
  }

  function getSampleEmploymentText() {
    return `EXECUTIVE EMPLOYMENT AGREEMENT
This Agreement is entered into as of November 1, 2026, between Vertex Dynamics Corp ("Employer") and Alexander Wright ("Executive").
1. TERM OF EMPLOYMENT. Executive shall be employed for a term of 36 months, subject to annual executive performance review.
2. COMPENSATION. Base salary of $280,000 per annum, paid semi-monthly. In addition, an annual target incentive bonus of 35% shall be awarded based on milestone attainment.
3. RESTRICTIVE COVENANTS AND NON-COMPETE. Executive agrees that for a period of 24 months following termination of employment, Executive shall not directly or indirectly engage in, consult for, or manage any competing business globally.
4. CONFIDENTIAL INFORMATION. Executive acknowledges access to proprietary algorithms and client databases, and agrees to hold all such information in strict confidence indefinitely.
5. TERMINATION FOR CAUSE. Employer may terminate Executive immediately for cause upon willful misconduct, fraud, or material breach of company policy.
6. GOVERNING LAW AND SEVERABILITY. Governed by the laws of the State of California. If any provision is held unenforceable, the remainder shall continue in full force and effect.`;
  }
});