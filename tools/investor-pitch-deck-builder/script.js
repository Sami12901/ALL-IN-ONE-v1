// Investor Pitch Deck Builder Studio Logic

const SAMPLE_STARTUP_DECK = {
  startupName: 'CognitiveFlow AI',
  slides: [
    {
      id: 'slide-1',
      type: 'title',
      title: 'CognitiveFlow AI',
      subtitle: 'Autonomous Enterprise Workflow Intelligence Powered by Deterministic Reasoning',
      presenter: 'Dr. Julian Vance (CEO) & Elena Rostova (CTO)',
      date: 'Seed Financing Round • 2026'
    },
    {
      id: 'slide-2',
      type: 'problem',
      title: 'The Problem',
      subtitle: 'Enterprise Teams Lose $3.1T Annually in Fragmented, Manual Coordination',
      points: [
        '40% of knowledge worker hours are lost manually reconciling siloed CRM, ERP, and database systems.',
        'Legacy RPA bots break upon trivial UI modifications, causing severe operational downtime and developer friction.',
        'Over 85% of multi-modal corporate data remains unstructured and locked away from automated decision-making.'
      ]
    },
    {
      id: 'slide-3',
      type: 'solution',
      title: 'The Solution',
      subtitle: 'Self-Healing Autonomous Agentic Workflows for the Fortune 500',
      points: [
        'Deterministic Reasoning Engine: Zero-hallucination workflow execution with 99.98% policy adherence.',
        'Universal Context Mesh: Connects APIs, logs, docs, and communication streams in real time.',
        '10x Faster Time-to-Value: Production ready in under 14 days, eliminating months of custom scripts.'
      ]
    },
    {
      id: 'slide-4',
      type: 'market',
      title: 'Market Opportunity (TAM / SAM / SOM)',
      subtitle: 'Capturing the Global Surge Toward Enterprise Workflow Autonomy',
      tamVal: '$130B',
      tamDesc: 'Global Enterprise Process Automation & Agentic AI Market by 2028',
      samVal: '$28B',
      samDesc: 'Mid-Market & Tier-1 Global Enterprise Knowledge Infrastructure',
      somVal: '$3.4B',
      somDesc: 'Immediate Beachhead: FinTech, HealthTech & Supply Chain Leaders',
      cagr: '38.4% Market CAGR'
    },
    {
      id: 'slide-5',
      type: 'product',
      title: 'Product Architecture & Workflow',
      subtitle: 'From Natural Language Intent to Production-Grade Execution in Milliseconds',
      step1Title: '1. Ingest & Contextualize',
      step1Desc: 'Real-time telemetry and semantic parsing across 300+ pre-built enterprise connectors.',
      step2Title: '2. Deterministic Guardrails',
      step2Desc: 'Automated policy enforcement, SOC 2 / HIPAA compliance audits, and role-based permissions.',
      step3Title: '3. Atomic API Execution',
      step3Desc: 'Sub-30ms mutations and bi-directional workflow synchronization with instant rollback.'
    },
    {
      id: 'slide-6',
      type: 'business',
      title: 'Business Model & Unit Economics',
      subtitle: 'High-Margin Predictable B2B SaaS with Land-and-Expand Flywheel',
      m1Val: '$45k',
      m1Label: 'Average Contract Value (ACV)',
      m2Val: '5.8x',
      m2Label: 'LTV to CAC Ratio',
      m3Val: '142%',
      m3Label: 'Net Dollar Retention (NDR)',
      notes: 'Tiered platform subscription plus volume-based automated execution credits.'
    },
    {
      id: 'slide-7',
      type: 'traction',
      title: 'Traction & Key Growth Metrics',
      subtitle: 'Exponential Adoption Across Global Enterprise Accounts',
      m1Val: '$3.8M',
      m1Label: 'ARR (9x YoY Expansion)',
      m2Val: '68',
      m2Label: 'Enterprise Clients',
      m3Val: '0%',
      m3Label: 'Logo Churn (Trailing 6 Quarters)',
      notes: 'Customers include Fortune 500 leaders across financial services, insurance, and enterprise logistics.'
    },
    {
      id: 'slide-8',
      type: 'moat',
      title: 'Competition & Defensible Moats',
      subtitle: 'Building Irreplaceable Technical Moats Beyond Shallow API Wrappers',
      points: [
        'Proprietary Enterprise Graph: Patent-pending semantic context memory that improves with every workflow run.',
        'High Switching Costs: Deep integration into core production systems creates multi-year contract stickiness.',
        'Enterprise Security & Compliance: Pre-certified for SOC 2 Type II, ISO 27001, and HIPAA from day one.'
      ]
    },
    {
      id: 'slide-9',
      type: 'team',
      title: 'World-Class Founding & Leadership Team',
      subtitle: 'Proven Domain Expertise from DeepMind, Stanford, Stripe, and Datadog',
      m1Name: 'Dr. Julian Vance',
      m1Role: 'Co-Founder & CEO (Ex-DeepMind, PhD Stanford AI)',
      m2Name: 'Elena Rostova',
      m2Role: 'Co-Founder & CTO (Ex-Staff Architect at Stripe & AWS)',
      m3Name: 'Marcus Sterling',
      m3Role: 'VP of Growth (Scaled Datadog Enterprise GTM from $5M to $45M ARR)'
    },
    {
      id: 'slide-10',
      type: 'ask',
      title: 'The Investment Ask',
      subtitle: 'Accelerating Enterprise Go-to-Market & Next-Gen Autonomous Reasoning',
      fundingGoal: '$5,000,000',
      roundType: 'Seed Extension / Series A Financing',
      use1: '55% AI Research & Core Engineering',
      use2: '30% Enterprise Sales, GTM & Customer Success',
      use3: '15% Regulatory Compliance & Operational Expansion',
      milestone: 'Target Milestone: Scale from $3.8M ARR to $12M ARR within 18 months.'
    }
  ]
};

const STORAGE_KEY = 'aio_pitch_deck_data';

document.addEventListener('DOMContentLoaded', () => {
  let deckState = loadState();
  let currentStep = 0;
  let isPresenting = false;

  // Header Elements
  const btnLoadSample = document.getElementById('btn-load-sample');
  const btnReset = document.getElementById('btn-reset');
  const btnExportJson = document.getElementById('btn-export-json');
  const fileImportDeck = document.getElementById('file-import-deck');
  const btnPresentFullscreen = document.getElementById('btn-present-fullscreen');

  // Wizard Navigation
  const stepPills = document.querySelectorAll('.wizard-step-pill');
  const wizardFormTitle = document.getElementById('wizard-form-title');
  const slideFormFields = document.getElementById('slide-form-fields');
  const btnWizardPrev = document.getElementById('btn-wizard-prev');
  const btnWizardNext = document.getElementById('btn-wizard-next');
  const autosaveTag = document.getElementById('autosave-tag');

  // Slide Viewer
  const deckSlideFrame = document.getElementById('deck-slide-frame');
  const previewSlideIndicator = document.getElementById('preview-slide-indicator');
  const btnPrevSlideView = document.getElementById('btn-prev-slide-view');
  const btnNextSlideView = document.getElementById('btn-next-slide-view');

  // Fullscreen Presenter
  const pitchPresentModal = document.getElementById('pitch-present-modal');
  const pitchPresentSlideInner = document.getElementById('pitch-present-slide-inner');
  const pitchHudPrev = document.getElementById('pitch-hud-prev');
  const pitchHudNext = document.getElementById('pitch-hud-next');
  const pitchHudCounter = document.getElementById('pitch-hud-counter');
  const pitchHudExit = document.getElementById('pitch-hud-exit');

  function loadState() {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && Array.isArray(parsed.slides) && parsed.slides.length === 10) {
          return parsed;
        }
      }
    } catch (e) {
      console.warn('Could not read saved pitch deck:', e);
    }
    return JSON.parse(JSON.stringify(SAMPLE_STARTUP_DECK));
  }

  function saveState() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(deckState));
      if (autosaveTag) {
        autosaveTag.textContent = 'Auto-saved';
      }
    } catch (e) {
      console.error(e);
    }
  }

  // Set Active Step
  function setStep(idx) {
    if (idx < 0) idx = 0;
    if (idx > 9) idx = 9;
    currentStep = idx;

    stepPills.forEach((pill, i) => {
      if (i === currentStep) pill.classList.add('active');
      else pill.classList.remove('active');
    });

    btnWizardPrev.disabled = currentStep === 0;
    btnWizardNext.textContent = currentStep === 9 ? 'Finish / Present' : 'Next Slide →';

    previewSlideIndicator.textContent = `Slide ${currentStep + 1} of 10`;

    renderWizardForm();
    renderSlideCanvas(deckSlideFrame, currentStep);
  }

  // Render Wizard Form tailored to active slide
  function renderWizardForm() {
    const s = deckState.slides[currentStep];
    wizardFormTitle.textContent = `Slide ${currentStep + 1}: ${s.title}`;
    slideFormFields.innerHTML = '';

    // Standard Headline & Subtitle fields
    const headerFields = document.createElement('div');
    headerFields.innerHTML = `
      <div class="form-group">
        <label style="font-size: 0.75rem;">Slide Headline Title</label>
        <input type="text" class="form-input form-title" value="${escapeHtml(s.title || '')}">
      </div>
      <div class="form-group" style="margin-top: 0.5rem;">
        <label style="font-size: 0.75rem;">Supporting Tagline / Subtitle</label>
        <input type="text" class="form-input form-subtitle" value="${escapeHtml(s.subtitle || '')}">
      </div>
    `;

    headerFields.querySelector('.form-title').addEventListener('input', (e) => {
      s.title = e.target.value;
      renderSlideCanvas(deckSlideFrame, currentStep);
      saveState();
    });
    headerFields.querySelector('.form-subtitle').addEventListener('input', (e) => {
      s.subtitle = e.target.value;
      renderSlideCanvas(deckSlideFrame, currentStep);
      saveState();
    });

    slideFormFields.appendChild(headerFields);

    // Slide specific fields
    const customContainer = document.createElement('div');
    customContainer.style.display = 'flex';
    customContainer.style.flexDirection = 'column';
    customContainer.style.gap = '0.75rem';

    if (s.type === 'title') {
      customContainer.innerHTML = `
        <div class="form-group">
          <label style="font-size: 0.75rem;">Presenter(s) & Founders</label>
          <input type="text" class="form-input inp-presenter" value="${escapeHtml(s.presenter || '')}">
        </div>
        <div class="form-group">
          <label style="font-size: 0.75rem;">Date / Funding Round Label</label>
          <input type="text" class="form-input inp-date" value="${escapeHtml(s.date || '')}">
        </div>
      `;
      customContainer.querySelector('.inp-presenter').addEventListener('input', (e) => {
        s.presenter = e.target.value;
        renderSlideCanvas(deckSlideFrame, currentStep);
        saveState();
      });
      customContainer.querySelector('.inp-date').addEventListener('input', (e) => {
        s.date = e.target.value;
        renderSlideCanvas(deckSlideFrame, currentStep);
        saveState();
      });
    } else if (s.type === 'problem' || s.type === 'solution' || s.type === 'moat') {
      customContainer.innerHTML = `
        <div class="form-group">
          <label style="font-size: 0.75rem;">Key Takeaway Points (One per line)</label>
          <textarea class="form-textarea inp-points" style="min-height: 120px;">${(s.points || []).join('\n')}</textarea>
        </div>
      `;
      customContainer.querySelector('.inp-points').addEventListener('input', (e) => {
        s.points = e.target.value.split('\n').filter(p => p.trim().length > 0);
        renderSlideCanvas(deckSlideFrame, currentStep);
        saveState();
      });
    } else if (s.type === 'market') {
      customContainer.innerHTML = `
        <div class="grid-2">
          <div class="form-group">
            <label style="font-size: 0.75rem;">TAM Value ($)</label>
            <input type="text" class="form-input inp-tam-val" value="${escapeHtml(s.tamVal || '')}">
          </div>
          <div class="form-group">
            <label style="font-size: 0.75rem;">SAM Value ($)</label>
            <input type="text" class="form-input inp-sam-val" value="${escapeHtml(s.samVal || '')}">
          </div>
        </div>
        <div class="grid-2">
          <div class="form-group">
            <label style="font-size: 0.75rem;">SOM Value ($)</label>
            <input type="text" class="form-input inp-som-val" value="${escapeHtml(s.somVal || '')}">
          </div>
          <div class="form-group">
            <label style="font-size: 0.75rem;">Market Growth Rate (CAGR)</label>
            <input type="text" class="form-input inp-cagr" value="${escapeHtml(s.cagr || '')}">
          </div>
        </div>
        <div class="form-group">
          <label style="font-size: 0.75rem;">TAM Definition</label>
          <input type="text" class="form-input inp-tam-desc" value="${escapeHtml(s.tamDesc || '')}">
        </div>
      `;
      customContainer.querySelector('.inp-tam-val').addEventListener('input', (e) => { s.tamVal = e.target.value; renderSlideCanvas(deckSlideFrame, currentStep); saveState(); });
      customContainer.querySelector('.inp-sam-val').addEventListener('input', (e) => { s.samVal = e.target.value; renderSlideCanvas(deckSlideFrame, currentStep); saveState(); });
      customContainer.querySelector('.inp-som-val').addEventListener('input', (e) => { s.somVal = e.target.value; renderSlideCanvas(deckSlideFrame, currentStep); saveState(); });
      customContainer.querySelector('.inp-cagr').addEventListener('input', (e) => { s.cagr = e.target.value; renderSlideCanvas(deckSlideFrame, currentStep); saveState(); });
      customContainer.querySelector('.inp-tam-desc').addEventListener('input', (e) => { s.tamDesc = e.target.value; renderSlideCanvas(deckSlideFrame, currentStep); saveState(); });
    } else if (s.type === 'product') {
      customContainer.innerHTML = `
        <div class="form-group">
          <label style="font-size: 0.75rem;">Step 1 Title &amp; Description</label>
          <input type="text" class="form-input inp-s1-title" value="${escapeHtml(s.step1Title || '')}" style="margin-bottom:0.25rem;">
          <input type="text" class="form-input inp-s1-desc" value="${escapeHtml(s.step1Desc || '')}">
        </div>
        <div class="form-group">
          <label style="font-size: 0.75rem;">Step 2 Title &amp; Description</label>
          <input type="text" class="form-input inp-s2-title" value="${escapeHtml(s.step2Title || '')}" style="margin-bottom:0.25rem;">
          <input type="text" class="form-input inp-s2-desc" value="${escapeHtml(s.step2Desc || '')}">
        </div>
        <div class="form-group">
          <label style="font-size: 0.75rem;">Step 3 Title &amp; Description</label>
          <input type="text" class="form-input inp-s3-title" value="${escapeHtml(s.step3Title || '')}" style="margin-bottom:0.25rem;">
          <input type="text" class="form-input inp-s3-desc" value="${escapeHtml(s.step3Desc || '')}">
        </div>
      `;
      customContainer.querySelector('.inp-s1-title').addEventListener('input', (e) => { s.step1Title = e.target.value; renderSlideCanvas(deckSlideFrame, currentStep); saveState(); });
      customContainer.querySelector('.inp-s1-desc').addEventListener('input', (e) => { s.step1Desc = e.target.value; renderSlideCanvas(deckSlideFrame, currentStep); saveState(); });
      customContainer.querySelector('.inp-s2-title').addEventListener('input', (e) => { s.step2Title = e.target.value; renderSlideCanvas(deckSlideFrame, currentStep); saveState(); });
      customContainer.querySelector('.inp-s2-desc').addEventListener('input', (e) => { s.step2Desc = e.target.value; renderSlideCanvas(deckSlideFrame, currentStep); saveState(); });
      customContainer.querySelector('.inp-s3-title').addEventListener('input', (e) => { s.step3Title = e.target.value; renderSlideCanvas(deckSlideFrame, currentStep); saveState(); });
      customContainer.querySelector('.inp-s3-desc').addEventListener('input', (e) => { s.step3Desc = e.target.value; renderSlideCanvas(deckSlideFrame, currentStep); saveState(); });
    } else if (s.type === 'business' || s.type === 'traction') {
      customContainer.innerHTML = `
        <div class="grid-2">
          <div class="form-group">
            <label style="font-size: 0.75rem;">Metric 1 (Value &amp; Label)</label>
            <input type="text" class="form-input inp-m1-val" value="${escapeHtml(s.m1Val || '')}" style="margin-bottom:0.25rem;">
            <input type="text" class="form-input inp-m1-lbl" value="${escapeHtml(s.m1Label || '')}">
          </div>
          <div class="form-group">
            <label style="font-size: 0.75rem;">Metric 2 (Value &amp; Label)</label>
            <input type="text" class="form-input inp-m2-val" value="${escapeHtml(s.m2Val || '')}" style="margin-bottom:0.25rem;">
            <input type="text" class="form-input inp-m2-lbl" value="${escapeHtml(s.m2Label || '')}">
          </div>
        </div>
        <div class="grid-2">
          <div class="form-group">
            <label style="font-size: 0.75rem;">Metric 3 (Value &amp; Label)</label>
            <input type="text" class="form-input inp-m3-val" value="${escapeHtml(s.m3Val || '')}" style="margin-bottom:0.25rem;">
            <input type="text" class="form-input inp-m3-lbl" value="${escapeHtml(s.m3Label || '')}">
          </div>
          <div class="form-group">
            <label style="font-size: 0.75rem;">Context Notes / Strategy</label>
            <textarea class="form-textarea inp-notes" style="min-height: 60px;">${escapeHtml(s.notes || '')}</textarea>
          </div>
        </div>
      `;
      customContainer.querySelector('.inp-m1-val').addEventListener('input', (e) => { s.m1Val = e.target.value; renderSlideCanvas(deckSlideFrame, currentStep); saveState(); });
      customContainer.querySelector('.inp-m1-lbl').addEventListener('input', (e) => { s.m1Label = e.target.value; renderSlideCanvas(deckSlideFrame, currentStep); saveState(); });
      customContainer.querySelector('.inp-m2-val').addEventListener('input', (e) => { s.m2Val = e.target.value; renderSlideCanvas(deckSlideFrame, currentStep); saveState(); });
      customContainer.querySelector('.inp-m2-lbl').addEventListener('input', (e) => { s.m2Label = e.target.value; renderSlideCanvas(deckSlideFrame, currentStep); saveState(); });
      customContainer.querySelector('.inp-m3-val').addEventListener('input', (e) => { s.m3Val = e.target.value; renderSlideCanvas(deckSlideFrame, currentStep); saveState(); });
      customContainer.querySelector('.inp-m3-lbl').addEventListener('input', (e) => { s.m3Label = e.target.value; renderSlideCanvas(deckSlideFrame, currentStep); saveState(); });
      customContainer.querySelector('.inp-notes').addEventListener('input', (e) => { s.notes = e.target.value; renderSlideCanvas(deckSlideFrame, currentStep); saveState(); });
    } else if (s.type === 'team') {
      customContainer.innerHTML = `
        <div class="form-group">
          <label style="font-size: 0.75rem;">Leader 1 (Name &amp; Pedigree)</label>
          <input type="text" class="form-input inp-t1-name" value="${escapeHtml(s.m1Name || '')}" style="margin-bottom:0.25rem;">
          <input type="text" class="form-input inp-t1-role" value="${escapeHtml(s.m1Role || '')}">
        </div>
        <div class="form-group">
          <label style="font-size: 0.75rem;">Leader 2 (Name &amp; Pedigree)</label>
          <input type="text" class="form-input inp-t2-name" value="${escapeHtml(s.m2Name || '')}" style="margin-bottom:0.25rem;">
          <input type="text" class="form-input inp-t2-role" value="${escapeHtml(s.m2Role || '')}">
        </div>
        <div class="form-group">
          <label style="font-size: 0.75rem;">Leader 3 (Name &amp; Pedigree)</label>
          <input type="text" class="form-input inp-t3-name" value="${escapeHtml(s.m3Name || '')}" style="margin-bottom:0.25rem;">
          <input type="text" class="form-input inp-t3-role" value="${escapeHtml(s.m3Role || '')}">
        </div>
      `;
      customContainer.querySelector('.inp-t1-name').addEventListener('input', (e) => { s.m1Name = e.target.value; renderSlideCanvas(deckSlideFrame, currentStep); saveState(); });
      customContainer.querySelector('.inp-t1-role').addEventListener('input', (e) => { s.m1Role = e.target.value; renderSlideCanvas(deckSlideFrame, currentStep); saveState(); });
      customContainer.querySelector('.inp-t2-name').addEventListener('input', (e) => { s.m2Name = e.target.value; renderSlideCanvas(deckSlideFrame, currentStep); saveState(); });
      customContainer.querySelector('.inp-t2-role').addEventListener('input', (e) => { s.m2Role = e.target.value; renderSlideCanvas(deckSlideFrame, currentStep); saveState(); });
      customContainer.querySelector('.inp-t3-name').addEventListener('input', (e) => { s.m3Name = e.target.value; renderSlideCanvas(deckSlideFrame, currentStep); saveState(); });
      customContainer.querySelector('.inp-t3-role').addEventListener('input', (e) => { s.m3Role = e.target.value; renderSlideCanvas(deckSlideFrame, currentStep); saveState(); });
    } else if (s.type === 'ask') {
      customContainer.innerHTML = `
        <div class="grid-2">
          <div class="form-group">
            <label style="font-size: 0.75rem;">Funding Target Goal</label>
            <input type="text" class="form-input inp-goal" value="${escapeHtml(s.fundingGoal || '')}">
          </div>
          <div class="form-group">
            <label style="font-size: 0.75rem;">Round Financing Terms</label>
            <input type="text" class="form-input inp-round" value="${escapeHtml(s.roundType || '')}">
          </div>
        </div>
        <div class="form-group">
          <label style="font-size: 0.75rem;">Allocation 1</label>
          <input type="text" class="form-input inp-u1" value="${escapeHtml(s.use1 || '')}">
        </div>
        <div class="form-group">
          <label style="font-size: 0.75rem;">Allocation 2</label>
          <input type="text" class="form-input inp-u2" value="${escapeHtml(s.use2 || '')}">
        </div>
        <div class="form-group">
          <label style="font-size: 0.75rem;">Allocation 3</label>
          <input type="text" class="form-input inp-u3" value="${escapeHtml(s.use3 || '')}">
        </div>
        <div class="form-group">
          <label style="font-size: 0.75rem;">18-Month Target Milestone</label>
          <input type="text" class="form-input inp-ms" value="${escapeHtml(s.milestone || '')}">
        </div>
      `;
      customContainer.querySelector('.inp-goal').addEventListener('input', (e) => { s.fundingGoal = e.target.value; renderSlideCanvas(deckSlideFrame, currentStep); saveState(); });
      customContainer.querySelector('.inp-round').addEventListener('input', (e) => { s.roundType = e.target.value; renderSlideCanvas(deckSlideFrame, currentStep); saveState(); });
      customContainer.querySelector('.inp-u1').addEventListener('input', (e) => { s.use1 = e.target.value; renderSlideCanvas(deckSlideFrame, currentStep); saveState(); });
      customContainer.querySelector('.inp-u2').addEventListener('input', (e) => { s.use2 = e.target.value; renderSlideCanvas(deckSlideFrame, currentStep); saveState(); });
      customContainer.querySelector('.inp-u3').addEventListener('input', (e) => { s.use3 = e.target.value; renderSlideCanvas(deckSlideFrame, currentStep); saveState(); });
      customContainer.querySelector('.inp-ms').addEventListener('input', (e) => { s.milestone = e.target.value; renderSlideCanvas(deckSlideFrame, currentStep); saveState(); });
    }

    slideFormFields.appendChild(customContainer);
  }

  // Render Slide into Frame (used for Live Preview and Fullscreen Presenter)
  function renderSlideCanvas(container, idx) {
    const s = deckState.slides[idx];
    if (!s) return;

    let bodyHtml = '';

    if (s.type === 'title') {
      bodyHtml = `
        <div style="text-align: center; margin: auto 0;">
          <div class="slide-header-tag">INVESTOR PITCH DECK</div>
          <h1 class="slide-main-title" style="font-size: clamp(2.5rem, 6vw, 4.2rem);">${escapeHtml(s.title || '')}</h1>
          <p class="slide-tagline" style="max-width: 800px; margin: 0 auto 1.5rem auto;">${escapeHtml(s.subtitle || '')}</p>
          <div style="font-size: 0.9rem; color: #93c5fd; font-weight: 600;">${escapeHtml(s.presenter || '')}</div>
          <div style="font-size: 0.8rem; color: #64748b; margin-top: 0.35rem;">${escapeHtml(s.date || '')}</div>
        </div>
      `;
    } else if (s.type === 'problem' || s.type === 'solution' || s.type === 'moat') {
      const points = s.points || [];
      bodyHtml = `
        <div>
          <div class="slide-header-tag">SLIDE 0${idx + 1} • ${s.type.toUpperCase()}</div>
          <h2 class="slide-main-title">${escapeHtml(s.title || '')}</h2>
          <p class="slide-tagline">${escapeHtml(s.subtitle || '')}</p>
          <div class="slide-body-content">
            <div style="display: flex; flex-direction: column; gap: 0.85rem;">
              ${points.map((p, i) => `
                <div style="display: flex; align-items: flex-start; gap: 0.75rem; background: rgba(255,255,255,0.04); padding: 0.85rem 1.25rem; border-radius: var(--radius-md); border-left: 3px solid ${s.type === 'problem' ? '#ef4444' : '#3b82f6'};">
                  <span style="font-weight: 800; color: ${s.type === 'problem' ? '#f87171' : '#60a5fa'}; font-size: 1.1rem;">0${i + 1}</span>
                  <span style="font-size: clamp(0.9rem, 1.6vw, 1.15rem); color: #e2e8f0; line-height: 1.5;">${escapeHtml(p)}</span>
                </div>
              `).join('')}
            </div>
          </div>
        </div>
      `;
    } else if (s.type === 'market') {
      bodyHtml = `
        <div>
          <div class="slide-header-tag">SLIDE 0${idx + 1} • MARKET SIZING</div>
          <h2 class="slide-main-title">${escapeHtml(s.title || '')}</h2>
          <p class="slide-tagline">${escapeHtml(s.subtitle || '')} • <strong style="color: #60a5fa;">${escapeHtml(s.cagr || '')}</strong></p>
          <div class="card-triad-grid">
            <div class="deck-subcard">
              <span class="subcard-label">Total Addressable Market</span>
              <div class="subcard-val">${escapeHtml(s.tamVal || '')}</div>
              <p class="subcard-desc">${escapeHtml(s.tamDesc || '')}</p>
            </div>
            <div class="deck-subcard" style="border-color: rgba(96, 165, 250, 0.4); background: rgba(96, 165, 250, 0.08);">
              <span class="subcard-label" style="color: #93c5fd;">Serviceable Available (SAM)</span>
              <div class="subcard-val" style="color: #93c5fd;">${escapeHtml(s.samVal || '')}</div>
              <p class="subcard-desc">${escapeHtml(s.samDesc || '')}</p>
            </div>
            <div class="deck-subcard">
              <span class="subcard-label">Serviceable Obtainable (SOM)</span>
              <div class="subcard-val">${escapeHtml(s.somVal || '')}</div>
              <p class="subcard-desc">${escapeHtml(s.somDesc || '')}</p>
            </div>
          </div>
        </div>
      `;
    } else if (s.type === 'product') {
      bodyHtml = `
        <div>
          <div class="slide-header-tag">SLIDE 0${idx + 1} • ARCHITECTURE</div>
          <h2 class="slide-main-title">${escapeHtml(s.title || '')}</h2>
          <p class="slide-tagline">${escapeHtml(s.subtitle || '')}</p>
          <div class="card-triad-grid">
            <div class="deck-subcard">
              <span class="subcard-label" style="color: #60a5fa;">Stage 1</span>
              <strong style="color: #f8fafc; font-size: 1.05rem;">${escapeHtml(s.step1Title || '')}</strong>
              <p class="subcard-desc">${escapeHtml(s.step1Desc || '')}</p>
            </div>
            <div class="deck-subcard">
              <span class="subcard-label" style="color: #60a5fa;">Stage 2</span>
              <strong style="color: #f8fafc; font-size: 1.05rem;">${escapeHtml(s.step2Title || '')}</strong>
              <p class="subcard-desc">${escapeHtml(s.step2Desc || '')}</p>
            </div>
            <div class="deck-subcard">
              <span class="subcard-label" style="color: #60a5fa;">Stage 3</span>
              <strong style="color: #f8fafc; font-size: 1.05rem;">${escapeHtml(s.step3Title || '')}</strong>
              <p class="subcard-desc">${escapeHtml(s.step3Desc || '')}</p>
            </div>
          </div>
        </div>
      `;
    } else if (s.type === 'business' || s.type === 'traction') {
      bodyHtml = `
        <div>
          <div class="slide-header-tag">SLIDE 0${idx + 1} • ${s.type.toUpperCase()}</div>
          <h2 class="slide-main-title">${escapeHtml(s.title || '')}</h2>
          <p class="slide-tagline">${escapeHtml(s.subtitle || '')}</p>
          <div class="card-triad-grid">
            <div class="deck-subcard">
              <div class="subcard-val">${escapeHtml(s.m1Val || '')}</div>
              <span class="subcard-label">${escapeHtml(s.m1Label || '')}</span>
            </div>
            <div class="deck-subcard">
              <div class="subcard-val">${escapeHtml(s.m2Val || '')}</div>
              <span class="subcard-label">${escapeHtml(s.m2Label || '')}</span>
            </div>
            <div class="deck-subcard">
              <div class="subcard-val">${escapeHtml(s.m3Val || '')}</div>
              <span class="subcard-label">${escapeHtml(s.m3Label || '')}</span>
            </div>
          </div>
          ${s.notes ? `<div style="font-size: 0.85rem; color: #94a3b8; margin-top: 1.25rem; font-style: italic;">• ${escapeHtml(s.notes)}</div>` : ''}
        </div>
      `;
    } else if (s.type === 'team') {
      bodyHtml = `
        <div>
          <div class="slide-header-tag">SLIDE 0${idx + 1} • TEAM & PEDIGREE</div>
          <h2 class="slide-main-title">${escapeHtml(s.title || '')}</h2>
          <p class="slide-tagline">${escapeHtml(s.subtitle || '')}</p>
          <div class="card-triad-grid">
            <div class="deck-subcard">
              <div style="width: 48px; height: 48px; border-radius: 50%; background: #2563eb; display: flex; align-items: center; justify-content: center; font-weight: 800; font-size: 1.2rem; color: #fff; margin-bottom: 0.5rem;">JV</div>
              <strong style="color: #f8fafc; font-size: 1.1rem;">${escapeHtml(s.m1Name || '')}</strong>
              <p class="subcard-desc">${escapeHtml(s.m1Role || '')}</p>
            </div>
            <div class="deck-subcard">
              <div style="width: 48px; height: 48px; border-radius: 50%; background: #7c3aed; display: flex; align-items: center; justify-content: center; font-weight: 800; font-size: 1.2rem; color: #fff; margin-bottom: 0.5rem;">ER</div>
              <strong style="color: #f8fafc; font-size: 1.1rem;">${escapeHtml(s.m2Name || '')}</strong>
              <p class="subcard-desc">${escapeHtml(s.m2Role || '')}</p>
            </div>
            <div class="deck-subcard">
              <div style="width: 48px; height: 48px; border-radius: 50%; background: #059669; display: flex; align-items: center; justify-content: center; font-weight: 800; font-size: 1.2rem; color: #fff; margin-bottom: 0.5rem;">MS</div>
              <strong style="color: #f8fafc; font-size: 1.1rem;">${escapeHtml(s.m3Name || '')}</strong>
              <p class="subcard-desc">${escapeHtml(s.m3Role || '')}</p>
            </div>
          </div>
        </div>
      `;
    } else if (s.type === 'ask') {
      bodyHtml = `
        <div>
          <div class="slide-header-tag">SLIDE 10 • THE CAPITAL ASK</div>
          <h2 class="slide-main-title">${escapeHtml(s.title || '')}</h2>
          <p class="slide-tagline">${escapeHtml(s.subtitle || '')}</p>
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1.5rem; margin-top: 1rem;">
            <div class="deck-subcard" style="border-color: rgba(96, 165, 250, 0.4); background: rgba(96, 165, 250, 0.08); justify-content: center; text-align: center;">
              <span class="subcard-label" style="color: #93c5fd;">Target Financing Round</span>
              <div class="subcard-val" style="font-size: clamp(2rem, 3.5vw, 3rem); color: #60a5fa;">${escapeHtml(s.fundingGoal || '$5,000,000')}</div>
              <p style="color: #cbd5e1; font-size: 0.9rem; margin-top: 0.25rem;">${escapeHtml(s.roundType || '')}</p>
            </div>
            <div style="display: flex; flex-direction: column; gap: 0.5rem; justify-content: center;">
              <strong style="font-size: 0.85rem; color: #cbd5e1; text-transform: uppercase;">Use of Funds:</strong>
              <div style="background: rgba(255,255,255,0.05); padding: 0.5rem 0.75rem; border-radius: var(--radius-sm); font-size: 0.85rem;">▸ ${escapeHtml(s.use1 || '')}</div>
              <div style="background: rgba(255,255,255,0.05); padding: 0.5rem 0.75rem; border-radius: var(--radius-sm); font-size: 0.85rem;">▸ ${escapeHtml(s.use2 || '')}</div>
              <div style="background: rgba(255,255,255,0.05); padding: 0.5rem 0.75rem; border-radius: var(--radius-sm); font-size: 0.85rem;">▸ ${escapeHtml(s.use3 || '')}</div>
            </div>
          </div>
          ${s.milestone ? `<div style="font-size: 0.9rem; color: #60a5fa; margin-top: 1.25rem; font-weight: 600;">★ ${escapeHtml(s.milestone)}</div>` : ''}
        </div>
      `;
    }

    container.innerHTML = `
      ${bodyHtml}
      <div class="slide-deck-footer">
        <span>${escapeHtml(deckState.startupName || 'Startup Pitch Deck')}</span>
        <span>Slide ${idx + 1} of 10</span>
      </div>
    `;
  }

  // Wizard Step Buttons
  stepPills.forEach(pill => {
    pill.addEventListener('click', () => {
      setStep(parseInt(pill.dataset.step, 10));
    });
  });

  btnWizardPrev.addEventListener('click', () => {
    if (currentStep > 0) setStep(currentStep - 1);
  });

  btnWizardNext.addEventListener('click', () => {
    if (currentStep < 9) {
      setStep(currentStep + 1);
    } else {
      startPresenting();
    }
  });

  btnPrevSlideView.addEventListener('click', () => {
    if (currentStep > 0) setStep(currentStep - 1);
  });

  btnNextSlideView.addEventListener('click', () => {
    if (currentStep < 9) setStep(currentStep + 1);
  });

  // Load Sample Deck
  btnLoadSample.addEventListener('click', () => {
    if (confirm('Load sample 10-slide VC pitch deck for CognitiveFlow AI?')) {
      deckState = JSON.parse(JSON.stringify(SAMPLE_STARTUP_DECK));
      setStep(0);
      saveState();
    }
  });

  // Reset Deck
  btnReset.addEventListener('click', () => {
    if (confirm('Reset all 10 slides to blank templates?')) {
      deckState.slides.forEach((s) => {
        s.title = `Slide ${s.id}`;
        s.subtitle = '';
        if (s.points) s.points = [];
      });
      setStep(0);
      saveState();
    }
  });

  // Export JSON Deck
  btnExportJson.addEventListener('click', () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(deckState, null, 2));
    const a = document.createElement('a');
    a.href = dataStr;
    a.download = `${(deckState.startupName || 'pitch_deck').toLowerCase().replace(/\s+/g, '_')}_10slides.json`;
    document.body.appendChild(a);
    a.click();
    a.remove();
  });

  // Import JSON Deck
  fileImportDeck.addEventListener('change', (e) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const parsed = JSON.parse(evt.target.result);
        if (parsed && Array.isArray(parsed.slides) && parsed.slides.length === 10) {
          deckState = parsed;
          setStep(0);
          saveState();
        } else {
          alert('Invalid 10-slide pitch deck file.');
        }
      } catch (err) {
        alert('Could not parse JSON file.');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  });

  // Fullscreen Presenter Mode
  function startPresenting() {
    isPresenting = true;
    pitchPresentModal.classList.add('active');
    renderPresentSlide();
    pitchPresentModal.focus();

    try {
      if (document.documentElement.requestFullscreen) {
        document.documentElement.requestFullscreen().catch(() => {});
      }
    } catch (e) {}
  }

  function stopPresenting() {
    isPresenting = false;
    pitchPresentModal.classList.remove('active');
    try {
      if (document.fullscreenElement && document.exitFullscreen) {
        document.exitFullscreen().catch(() => {});
      }
    } catch (e) {}
    setStep(currentStep);
  }

  function renderPresentSlide() {
    renderSlideCanvas(pitchPresentSlideInner, currentStep);
    pitchHudCounter.textContent = `${currentStep + 1} / 10`;
  }

  function presentNext() {
    if (currentStep < 9) {
      currentStep++;
      renderPresentSlide();
    }
  }

  function presentPrev() {
    if (currentStep > 0) {
      currentStep--;
      renderPresentSlide();
    }
  }

  btnPresentFullscreen.addEventListener('click', startPresenting);
  pitchHudExit.addEventListener('click', stopPresenting);
  pitchHudNext.addEventListener('click', presentNext);
  pitchHudPrev.addEventListener('click', presentPrev);

  // Keyboard navigation
  window.addEventListener('keydown', (e) => {
    if (e.key === 'F5') {
      e.preventDefault();
      startPresenting();
      return;
    }

    if (!isPresenting) return;

    if (e.key === 'Escape') {
      stopPresenting();
    } else if (e.key === 'ArrowRight' || e.key === ' ' || e.key === 'PageDown') {
      e.preventDefault();
      presentNext();
    } else if (e.key === 'ArrowLeft' || e.key === 'PageUp') {
      e.preventDefault();
      presentPrev();
    }
  });

  // Touch swipe support for presenter
  let touchStartX = 0;
  pitchPresentModal.addEventListener('touchstart', (e) => {
    touchStartX = e.changedTouches[0].clientX;
  }, { passive: true });

  pitchPresentModal.addEventListener('touchend', (e) => {
    const touchEndX = e.changedTouches[0].clientX;
    const diff = touchEndX - touchStartX;
    if (Math.abs(diff) > 50) {
      if (diff < 0) presentNext();
      else presentPrev();
    }
  }, { passive: true });

  function escapeHtml(str) {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  // Initial Boot
  setStep(0);
});