// AI Career Coach & Strategic Advisor - Complete Client-Side Implementation

document.addEventListener('DOMContentLoaded', () => {
  // --- Toast Utility ---
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

  // --- Tab Navigation ---
  const tabButtons = document.querySelectorAll('.coach-tab-btn');
  const tabSections = document.querySelectorAll('.tab-section');

  tabButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      tabButtons.forEach(b => b.classList.remove('active'));
      tabSections.forEach(s => s.classList.remove('active'));

      btn.classList.add('active');
      const targetId = btn.getAttribute('data-tab');
      const targetSec = document.getElementById(targetId);
      if (targetSec) targetSec.classList.add('active');
    });
  });

  // ==========================================
  // SECTION 1: INTERACTIVE ADVISOR CHAT ENGINE
  // ==========================================
  const PERSONAS = {
    elena: {
      name: 'Elena Vance',
      title: 'Executive & VP Mentor',
      initials: 'EV',
      gradient: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
      tone: 'Strategic, executive presence, organizational politics, high-leverage influence.',
      greeting: "Welcome! I'm Elena. I help professionals transition from tactical execution to executive-level leverage and organizational leadership. What career inflection point or challenge are you currently navigating?"
    },
    marcus: {
      name: 'Marcus Chen',
      title: 'Principal / Staff Architect',
      initials: 'MC',
      gradient: 'linear-gradient(135deg, #0ea5e9, #10b981)',
      tone: 'Deep technical leadership, system architecture, cross-team technical consensus, FAANG career ladders.',
      greeting: "Hey there! Marcus here. Making the leap beyond Senior into Staff+ requires multiplying the engineering output of entire teams and driving architectural governance. Let's dig into your technical trajectory."
    },
    maya: {
      name: 'Maya Patel',
      title: 'Career Pivot & Switch Specialist',
      initials: 'MP',
      gradient: 'linear-gradient(135deg, #ec4899, #f43f5e)',
      tone: 'Transferable skills, narrative reframing, bridging experience gaps, rapid career transitions.',
      greeting: "Hello! I'm Maya. Switching industries or pivoting to higher-growth specializations can feel daunting, but your existing track record holds huge transferable value. Tell me about the transition you're envisioning!"
    },
    liam: {
      name: 'Liam Gallagher',
      title: 'Total Comp & Offer Leverage Specialist',
      initials: 'LG',
      gradient: 'linear-gradient(135deg, #f59e0b, #d97706)',
      tone: 'Analytical compensation benchmarks, multi-offer leverage, equity vesting terms, counter-offer psychology.',
      greeting: "Hi! Liam here. Compensation isn't set by what you 'deserve'—it's dictated by your perceived market scarcity and negotiation leverage. Tell me what compensation package or offer negotiation you'd like to dissect."
    }
  };

  let activePersonaKey = 'elena';
  const personaCards = document.querySelectorAll('.persona-card');
  const chatActiveAvatar = document.getElementById('chat-active-avatar');
  const chatActiveName = document.getElementById('chat-active-name');
  const chatActiveTitle = document.getElementById('chat-active-title');
  const chatMessages = document.getElementById('chat-messages');
  const chatInput = document.getElementById('chat-input');
  const btnSendChat = document.getElementById('btn-send-chat');
  const btnClearChat = document.getElementById('btn-clear-chat');
  const btnExportChat = document.getElementById('btn-export-chat');
  const promptPills = document.querySelectorAll('.prompt-pill');

  // Profile Inputs
  const profCurrRole = document.getElementById('prof-curr-role');
  const profTargetRole = document.getElementById('prof-target-role');
  const profYearsExp = document.getElementById('prof-years-exp');
  const profIndustry = document.getElementById('prof-industry');

  function updateActivePersona(key) {
    activePersonaKey = key;
    personaCards.forEach(c => {
      c.classList.toggle('active', c.getAttribute('data-persona') === key);
    });
    const p = PERSONAS[key];
    chatActiveAvatar.textContent = p.initials;
    chatActiveAvatar.style.background = p.gradient;
    chatActiveName.textContent = p.name;
    chatActiveTitle.textContent = `${p.title} • Active Advisor`;

    // Add intro bubble
    appendBotMessage(p.greeting);
  }

  personaCards.forEach(card => {
    card.addEventListener('click', () => {
      const key = card.getAttribute('data-persona');
      if (key !== activePersonaKey) {
        updateActivePersona(key);
      }
    });
  });

  function appendUserMessage(text) {
    const bubble = document.createElement('div');
    bubble.className = 'chat-bubble user';
    bubble.innerHTML = `
      <div class="bubble-sender">You</div>
      <p>${escapeHtml(text)}</p>
    `;
    chatMessages.appendChild(bubble);
    chatMessages.scrollTop = chatMessages.scrollHeight;
  }

  function appendBotMessage(htmlContent) {
    const p = PERSONAS[activePersonaKey];
    const bubble = document.createElement('div');
    bubble.className = 'chat-bubble assistant';
    bubble.innerHTML = `
      <div class="bubble-sender" style="color: var(--accent);">
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>
        ${escapeHtml(p.name)}
      </div>
      <div>${htmlContent}</div>
    `;
    chatMessages.appendChild(bubble);
    chatMessages.scrollTop = chatMessages.scrollHeight;
  }

  function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  // Client-Side AI Response Generator with Deep Domain Intelligence
  function generateAdvisorResponse(query) {
    const q = query.toLowerCase();
    const curr = profCurrRole.value || 'Engineer';
    const target = profTargetRole.value || 'Senior / Staff';
    const persona = PERSONAS[activePersonaKey];

    // Staff / Senior Promotion Question
    if (q.includes('staff') || q.includes('senior') || q.includes('promotion') || q.includes('level') || q.includes('ladder')) {
      return `
        <p>Transitioning from <strong>${escapeHtml(curr)}</strong> to <strong>${escapeHtml(target)}</strong> is a fundamentally qualitative shift, not just doing more tasks faster.</p>
        <p>Here is the proven 3-pillar blueprint for landing the promotion:</p>
        <ul>
          <li><strong>1. Scope of Influence:</strong> Mid/Senior engineers own tickets and modules; Staff engineers own <em>ambiguity and cross-team systems</em>. Identify a high-impact technical friction point that spans 2 or more teams and draft an RFC / Architecture Proposal to resolve it.</li>
          <li><strong>2. Operating at the Next Level Ahead of Time:</strong> Promotion committees reward candidates who have already demonstrated 3–6 months of Staff-level output. Start running blameless post-mortems, mentoring 2 junior engineers, and driving system reliability standards today.</li>
          <li><strong>3. Assembling Your "Brag Document":</strong> Maintain a weekly record of projects, system latency improvements, cost reductions, and cross-functional feedback. Quantifiable metrics are 10x more persuasive than general praise.</li>
        </ul>
        <p><em>Advisor Tip:</em> Schedule a quarterly alignment sync with your manager and explicitly ask: <em>"What are the top two gaps between my current impact and the expectations for ${escapeHtml(target)}?"</em></p>
      `;
    }

    // Salary / Negotiation / Counter-offer Question
    if (q.includes('salary') || q.includes('negotiat') || q.includes('counter') || q.includes('offer') || q.includes('equity') || q.includes('comp')) {
      return `
        <p>In compensation negotiations, <strong>information asymmetry and perceived scarcity</strong> are your greatest levers.</p>
        <p>Here is your tactical framework for maximizing your total package for <strong>${escapeHtml(target)}</strong>:</p>
        <ul>
          <li><strong>Anchor with Total Compensation (TC):</strong> Never negotiate on base salary alone. In senior tech roles, 30% to 60% of upside lives in equity grants and sign-on incentives.</li>
          <li><strong>Use the "Enthusiastic Pivot" Counter Formula:</strong> Express deep excitement about the role first, then pivot to compensation: <em>"I'm completely aligned on the vision and thrilled to join. However, looking at the competing market data for this scope, I'm targeting a total compensation package of $X. Can we bridge this gap through base or an adjusted equity grant?"</em></li>
          <li><strong>Sign-on Bonus as the Secret Weapon:</strong> When HR has rigid band caps on base salary, ask for a one-time signing bonus. Sign-on budgets come from separate pools with much higher recruiter flexibility.</li>
        </ul>
        <p>Would you like me to write a custom negotiation email draft tailored to your current offer numbers?</p>
      `;
    }

    // Imposter Syndrome & Leadership Question
    if (q.includes('imposter') || q.includes('confidence') || q.includes('peers') || q.includes('fear') || q.includes('lead')) {
      return `
        <p>Experiencing imposter syndrome when stepping up to <strong>${escapeHtml(target)}</strong> is completely normal—in fact, it's a reliable leading indicator that you are pushing the boundaries of your comfort zone.</p>
        <p>Here are three cognitive frameworks to convert self-doubt into executive presence:</p>
        <ul>
          <li><strong>Separate Feelings from Competence:</strong> Feeling like you don't know every single detail does not mean you lack competence. Great leaders aren't encyclopedias; they are master facilitators who synthesize inputs and drive decisive outcomes.</li>
          <li><strong>Ask Strategic Clarifying Questions:</strong> When leading senior peers, replace "telling them what to do" with "asking catalytic questions": <em>"What trade-offs are we accepting with architecture Option A vs Option B?"</em> This establishes leadership without confrontation.</li>
          <li><strong>Keep an Evidence Log:</strong> Document peer feedback, solved incidents, and project completions. Review it before high-stakes reviews or architecture meetings to ground your mindset in verified facts.</li>
        </ul>
      `;
    }

    // Behavioral / STAR Interview Question
    if (q.includes('star') || q.includes('interview') || q.includes('behavioral') || q.includes('question') || q.includes('story')) {
      return `
        <p>Top tech companies and executive interviewers use behavioral rounds to probe your <strong>decision velocity, conflict resolution, and ownership</strong> under pressure.</p>
        <p>To deliver a top 1% response, structure every story with the <strong>STAR Method + Reflection</strong>:</p>
        <ul>
          <li><strong>Situation (15%):</strong> Crisp context. <em>"During Q3 at our fintech firm, our transaction ingestion latency spiked by 300% during peak traffic, threatening our SLA."</em></li>
          <li><strong>Task (15%):</strong> Your explicit ownership. <em>"As the tech lead, my mandate was to diagnose root cause and eliminate the bottleneck within 48 hours without dropping transactions."</em></li>
          <li><strong>Action (50%):</strong> Your personal interventions. <em>"I profiled connection pool exhaustion, designed an asynchronous Redis queue buffer, coordinated with the database team, and rolled out a staged migration."</em></li>
          <li><strong>Result &amp; Reflection (20%):</strong> Quantified outcome. <em>"We reduced latency by 68%, saved an estimated $120k in downtime penalties, and codified the architectural pattern into our company-wide runbook."</em></li>
        </ul>
        <p>Check the <strong>Interview Readiness Score</strong> tab to practice with random mock interview flashcards!</p>
      `;
    }

    // Pivot / Switch / Career Transition Question
    if (q.includes('pivot') || q.includes('switch') || q.includes('ai') || q.includes('machine learning') || q.includes('transition') || q.includes('non-tech')) {
      return `
        <p>Pivoting from <strong>${escapeHtml(curr)}</strong> into modern high-growth domains like <strong>${escapeHtml(target)}</strong> is primarily an exercise in <strong>translation and proof of execution</strong>.</p>
        <p>Here is your 4-step strategic roadmap:</p>
        <ul>
          <li><strong>1. Deconstruct the Target Domain:</strong> Hiring managers don't want generic certs; they want real applied problem solvers. In AI/ML, for instance, build a productionized RAG application with vector search and evals, rather than just taking another theoretical course.</li>
          <li><strong>2. Highlight Transferable Superpowers:</strong> Your background in <em>${escapeHtml(curr)}</em> provides unique leverage. Frame yourself as the engineer/specialist who already understands system resilience, production debugging, and business alignment.</li>
          <li><strong>3. Build in Public:</strong> Publish a technical breakdown on LinkedIn or GitHub detailing architectural decisions and performance optimizations. Public proof eliminates hiring hesitation.</li>
        </ul>
      `;
    }

    // Default Contextual Synthesis
    return `
      <p>Thank you for bringing this up. When advancing from <strong>${escapeHtml(curr)}</strong> toward <strong>${escapeHtml(target)}</strong> in the <strong>${escapeHtml(profIndustry.value)}</strong> space, here is how I advise approaching this:</p>
      <ul>
        <li><strong>Clarify the North Star Metric:</strong> Identify the single most critical business or engineering outcome your leadership currently evaluates you on. Maximize visibility around that metric.</li>
        <li><strong>Build Strategic Alliances:</strong> Ensure at least two leaders outside your immediate direct reporting chain can vouch for your strategic competence and cross-functional reliability.</li>
        <li><strong>Continuous Feedback Loops:</strong> Don't wait for annual cycles. Run monthly check-ins with stakeholders to calibrate alignment and remove obstacles before they compound.</li>
      </ul>
      <p>Would you like to focus on: <em>1) Drafting an action plan</em>, <em>2) Reviewing target salary ranges</em>, or <em>3) Preparing interview narrative stories</em>?</p>
    `;
  }

  function handleSendChatMessage() {
    const text = chatInput.value.trim();
    if (!text) return;

    appendUserMessage(text);
    chatInput.value = '';

    // Simulated short advisor typing delay
    const typingIndicator = document.createElement('div');
    typingIndicator.className = 'chat-bubble assistant';
    typingIndicator.innerHTML = '<span style="font-style: italic; color: var(--text-tertiary);">Advisor is typing...</span>';
    chatMessages.appendChild(typingIndicator);
    chatMessages.scrollTop = chatMessages.scrollHeight;

    setTimeout(() => {
      typingIndicator.remove();
      const responseHtml = generateAdvisorResponse(text);
      appendBotMessage(responseHtml);
    }, 450);
  }

  btnSendChat.addEventListener('click', handleSendChatMessage);
  chatInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendChatMessage();
    }
  });

  promptPills.forEach(pill => {
    pill.addEventListener('click', () => {
      chatInput.value = pill.getAttribute('data-prompt');
      handleSendChatMessage();
    });
  });

  btnClearChat.addEventListener('click', () => {
    chatMessages.innerHTML = '';
    const p = PERSONAS[activePersonaKey];
    appendBotMessage(p.greeting);
    showToast('Conversation cleared');
  });

  btnExportChat.addEventListener('click', () => {
    const messages = Array.from(chatMessages.querySelectorAll('.chat-bubble')).map(b => {
      const sender = b.querySelector('.bubble-sender') ? b.querySelector('.bubble-sender').textContent.trim() : 'User';
      const body = b.querySelector('div:not(.bubble-sender)') ? b.querySelector('div:not(.bubble-sender)').innerText : b.innerText;
      return `### ${sender}\n${body.trim()}\n`;
    }).join('\n---\n\n');

    const blob = new Blob([messages], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `career-coach-session-${Date.now()}.md`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('Session exported as Markdown!');
  });

  // ==========================================
  // SECTION 2: CAREER PATH ROADMAP GENERATOR
  // ==========================================
  const rdmCurrRole = document.getElementById('rdm-curr-role');
  const rdmTargetRole = document.getElementById('rdm-target-role');
  const rdmTimeline = document.getElementById('rdm-timeline');
  const rdmTrack = document.getElementById('rdm-track');
  const btnGenerateRoadmap = document.getElementById('btn-generate-roadmap');
  const btnExportRoadmap = document.getElementById('btn-export-roadmap');
  const roadmapContainer = document.getElementById('roadmap-output-container');

  function generateRoadmapData() {
    const curr = rdmCurrRole.value.trim() || 'Software Engineer';
    const target = rdmTargetRole.value.trim() || 'Staff Engineer';
    const months = parseInt(rdmTimeline.value, 10) || 12;
    const track = rdmTrack.value;

    const w1 = Math.round(months * 0.18 * 4.3);
    const w2 = Math.round(months * 0.45 * 4.3);
    const w3 = Math.round(months * 0.75 * 4.3);
    const w4 = Math.round(months * 4.3);

    return [
      {
        phase: 1,
        title: 'Phase 1: Capability Audit & Foundational Gap Elimination',
        timeline: `Weeks 1 - ${w1}`,
        description: `Establish baseline metrics, audit competency delta between ${curr} and ${target}, and align explicit expectations with executive stakeholders.`,
        badge: 'Diagnostic & Groundwork',
        milestones: [
          `Audit competency rubrics for ${target} level at top-tier organizations.`,
          `Set up a bi-weekly alignment cadence with manager focusing specifically on promotion milestones.`,
          `Identify 2 high-leverage architectural or operational bottlenecks in current team workflow.`,
          `Begin maintaining a weekly 'Impact Log' (Brag Sheet) documenting quantifiable project contributions.`
        ],
        deliverable: `Written 6-page Competency Delta Document & Agreed Promotion Criteria Matrix.`,
        kpi: `100% stakeholder buy-in on roadmap objectives and evaluation criteria.`
      },
      {
        phase: 2,
        title: 'Phase 2: High-Visibility Impact Execution & Technical Ownership',
        timeline: `Weeks ${w1 + 1} - ${w2}`,
        description: `Lead an initiative that crosses multi-team boundaries, demonstrates senior domain mastery, and drives measurable revenue or efficiency gains.`,
        badge: 'Strategic Execution',
        milestones: [
          `Author an RFC / Architecture Strategy Proposal addressing key scalability/product requirements.`,
          `Form a working group of 3-5 cross-functional collaborators to drive technical consensus.`,
          `Ship v1 release with robust telemetry, observability, and unit/integration test suites.`,
          `Measure and publish performance metrics (e.g., latency, cost, delivery velocity) to broader org.`
        ],
        deliverable: `Production-deployed strategic system or process innovation with post-launch analytics.`,
        kpi: `Demonstrated >25% improvement in targeted reliability or operational throughput.`
      },
      {
        phase: 3,
        title: 'Phase 3: Force Multiplication, Mentorship & Brand Alignment',
        timeline: `Weeks ${w2 + 1} - ${w3}`,
        description: `Scale personal impact by elevating teammates, codifying institutional knowledge, and demonstrating organizational leadership.`,
        badge: 'Force Multiplication',
        milestones: [
          `Formally mentor 2 junior/mid engineers and guide them through technical roadblocks.`,
          `Present a technical deep-dive or architecture workshop to the engineering/product department.`,
          `Review and standardize code quality, interview rubrics, or CI/CD automated gates.`,
          `Engage with executive leadership and cross-functional directors on next-quarter strategic planning.`
        ],
        deliverable: `Engineering playbook / guidelines adopted across 2 or more business units.`,
        kpi: `Documented positive 360-degree feedback from both senior peers and leadership.`
      },
      {
        phase: 4,
        title: `Phase 4: Executive Promotion Dossier & Transition Finalization`,
        timeline: `Weeks ${w3 + 1} - ${w4}`,
        description: `Package evidence of ${target} competence into an airtight promotion packet or secure competing external offers for maximum market value.`,
        badge: 'Elevation & Negotiation',
        milestones: [
          `Synthesize 52-week Impact Log into executive 3-page Promotion Dossier with quantifiable ROI metrics.`,
          `Gather supporting letters of recommendation from cross-functional partner leads.`,
          `Conduct formal promotion committee review or enter active interview market for external validation.`,
          `Execute compensation negotiation strategy for targeted top-of-band salary and equity package.`
        ],
        deliverable: `Finalized Executive Promotion Packet & Signed Offer Acceptance at Target Level.`,
        kpi: `Promotion approved or validated by competitive external offer in top percentile band.`
      }
    ];
  }

  function renderRoadmap() {
    const phases = generateRoadmapData();
    roadmapContainer.innerHTML = '';

    phases.forEach((p, idx) => {
      const card = document.createElement('div');
      card.className = 'timeline-phase-card';
      card.innerHTML = `
        <div class="timeline-header">
          <div>
            <div class="phase-badge">${escapeHtml(p.badge)} • ${escapeHtml(p.timeline)}</div>
            <h3 style="font-size: 1.2rem; font-weight: 800; color: var(--text-primary); margin-top: 0.5rem; margin-bottom: 0.25rem;">
              ${escapeHtml(p.title)}
            </h3>
            <p style="font-size: 0.88rem; color: var(--text-secondary); margin: 0; line-height: 1.5;">
              ${escapeHtml(p.description)}
            </p>
          </div>
          <span style="font-size: 1.5rem; font-family: var(--font-display); font-weight: 800; color: rgba(255, 255, 255, 0.15);">
            0${p.phase}
          </span>
        </div>

        <div style="margin-top: 1rem;">
          <div style="font-size: 0.8rem; font-weight: 700; color: var(--text-secondary); text-transform: uppercase; margin-bottom: 0.5rem;">Key Milestones &amp; Checkpoints:</div>
          <div class="milestones-list">
            ${p.milestones.map((m, mIdx) => `
              <label class="milestone-item" data-phase="${p.phase}" data-idx="${mIdx}">
                <input type="checkbox" class="milestone-checkbox">
                <span class="milestone-text">${escapeHtml(m)}</span>
              </label>
            `).join('')}
          </div>
        </div>

        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 0.75rem; margin-top: 1rem; padding-top: 1rem; border-top: 1px solid var(--border);">
          <div style="background: var(--bg-tertiary); padding: 0.75rem; border-radius: var(--radius-sm); border: 1px solid var(--border);">
            <span style="font-size: 0.75rem; font-weight: 700; color: var(--accent); text-transform: uppercase; display: block; margin-bottom: 0.2rem;">Artifact Deliverable</span>
            <span style="font-size: 0.83rem; color: var(--text-primary);">${escapeHtml(p.deliverable)}</span>
          </div>
          <div style="background: var(--bg-tertiary); padding: 0.75rem; border-radius: var(--radius-sm); border: 1px solid var(--border);">
            <span style="font-size: 0.75rem; font-weight: 700; color: var(--accent); text-transform: uppercase; display: block; margin-bottom: 0.2rem;">Success Metric (KPI)</span>
            <span style="font-size: 0.83rem; color: var(--text-primary);">${escapeHtml(p.kpi)}</span>
          </div>
        </div>
      `;
      roadmapContainer.appendChild(card);
    });

    // Attach checkbox events
    document.querySelectorAll('.milestone-checkbox').forEach(cb => {
      cb.addEventListener('change', (e) => {
        const item = e.target.closest('.milestone-item');
        if (item) item.classList.toggle('completed', e.target.checked);
      });
    });
  }

  btnGenerateRoadmap.addEventListener('click', () => {
    renderRoadmap();
    showToast('Strategic roadmap generated!');
  });

  btnExportRoadmap.addEventListener('click', () => {
    const phases = generateRoadmapData();
    let md = `# Strategic Career Promotion Roadmap\n\n`;
    md += `**Current Position:** ${rdmCurrRole.value}\n`;
    md += `**Target Role:** ${rdmTargetRole.value}\n`;
    md += `**Target Timeline:** ${rdmTimeline.value} Months\n\n---\n\n`;

    phases.forEach(p => {
      md += `## ${p.title} (${p.timeline})\n`;
      md += `*${p.description}*\n\n`;
      md += `### Milestones:\n`;
      p.milestones.forEach(m => {
        md += `- [ ] ${m}\n`;
      });
      md += `\n**Deliverable:** ${p.deliverable}\n`;
      md += `**Success Metric (KPI):** ${p.kpi}\n\n---\n\n`;
    });

    const blob = new Blob([md], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `career-roadmap-${Date.now()}.md`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('Roadmap downloaded as Markdown!');
  });

  // Initial render
  renderRoadmap();

  // ==========================================
  // SECTION 3: SALARY BENCHMARK EXPLORER
  // ==========================================
  const SALARY_DATABASE = {
    swe: {
      entry:     { base: 125, eq: 25,  bon: 12, p25: 140, p50: 162, p75: 185, p90: 210 },
      mid:       { base: 155, eq: 45,  bon: 18, p25: 185, p50: 218, p75: 250, p90: 285 },
      senior:    { base: 185, eq: 65,  bon: 25, p25: 235, p50: 275, p75: 325, p90: 380 },
      staff:     { base: 225, eq: 120, bon: 35, p25: 320, p50: 380, p75: 450, p90: 520 },
      principal: { base: 265, eq: 220, bon: 50, p25: 430, p50: 535, p75: 650, p90: 780 }
    },
    backend: {
      entry:     { base: 128, eq: 25,  bon: 12, p25: 142, p50: 165, p75: 188, p90: 215 },
      mid:       { base: 158, eq: 48,  bon: 18, p25: 190, p50: 224, p75: 258, p90: 295 },
      senior:    { base: 190, eq: 70,  bon: 28, p25: 245, p50: 288, p75: 340, p90: 395 },
      staff:     { base: 230, eq: 135, bon: 38, p25: 335, p50: 403, p75: 475, p90: 550 },
      principal: { base: 275, eq: 240, bon: 55, p25: 460, p50: 570, p75: 690, p90: 820 }
    },
    frontend: {
      entry:     { base: 120, eq: 20,  bon: 10, p25: 130, p50: 150, p75: 175, p90: 200 },
      mid:       { base: 148, eq: 40,  bon: 16, p25: 175, p50: 204, p75: 238, p90: 270 },
      senior:    { base: 178, eq: 60,  bon: 22, p25: 220, p50: 260, p75: 310, p90: 360 },
      staff:     { base: 215, eq: 110, bon: 30, p25: 295, p50: 355, p75: 420, p90: 485 },
      principal: { base: 250, eq: 190, bon: 45, p25: 390, p50: 485, p75: 590, p90: 690 }
    },
    'ai-ml': {
      entry:     { base: 138, eq: 35,  bon: 15, p25: 155, p50: 188, p75: 215, p90: 245 },
      mid:       { base: 172, eq: 65,  bon: 24, p25: 215, p50: 261, p75: 305, p90: 350 },
      senior:    { base: 210, eq: 105, bon: 35, p25: 290, p50: 350, p75: 420, p90: 495 },
      staff:     { base: 255, eq: 185, bon: 48, p25: 410, p50: 488, p75: 580, p90: 680 },
      principal: { base: 310, eq: 320, bon: 75, p25: 560, p50: 705, p75: 860, p90: 1050 }
    },
    devops: {
      entry:     { base: 122, eq: 22,  bon: 12, p25: 135, p50: 156, p75: 180, p90: 205 },
      mid:       { base: 152, eq: 42,  bon: 18, p25: 180, p50: 212, p75: 245, p90: 280 },
      senior:    { base: 182, eq: 62,  bon: 24, p25: 230, p50: 268, p75: 315, p90: 370 },
      staff:     { base: 220, eq: 115, bon: 32, p25: 305, p50: 367, p75: 435, p90: 505 },
      principal: { base: 255, eq: 200, bon: 48, p25: 410, p50: 503, p75: 610, p90: 720 }
    },
    pm: {
      entry:     { base: 120, eq: 20,  bon: 14, p25: 135, p50: 154, p75: 178, p90: 205 },
      mid:       { base: 150, eq: 40,  bon: 20, p25: 180, p50: 210, p75: 245, p90: 280 },
      senior:    { base: 185, eq: 70,  bon: 30, p25: 240, p50: 285, p75: 335, p90: 390 },
      staff:     { base: 225, eq: 130, bon: 45, p25: 330, p50: 400, p75: 475, p90: 550 },
      principal: { base: 270, eq: 230, bon: 65, p25: 450, p50: 565, p75: 680, p90: 810 }
    },
    design: {
      entry:     { base: 110, eq: 15,  bon: 10, p25: 120, p50: 135, p75: 155, p90: 180 },
      mid:       { base: 135, eq: 30,  bon: 14, p25: 155, p50: 179, p75: 210, p90: 240 },
      senior:    { base: 165, eq: 50,  bon: 20, p25: 205, p50: 235, p75: 275, p90: 320 },
      staff:     { base: 200, eq: 90,  bon: 28, p25: 270, p50: 318, p75: 380, p90: 440 },
      principal: { base: 235, eq: 160, bon: 40, p25: 360, p50: 435, p75: 520, p90: 610 }
    },
    data: {
      entry:     { base: 122, eq: 22,  bon: 12, p25: 135, p50: 156, p75: 180, p90: 205 },
      mid:       { base: 150, eq: 42,  bon: 18, p25: 180, p50: 210, p75: 245, p90: 280 },
      senior:    { base: 180, eq: 65,  bon: 25, p25: 230, p50: 270, p75: 320, p90: 375 },
      staff:     { base: 220, eq: 120, bon: 35, p25: 315, p50: 375, p75: 445, p90: 520 },
      principal: { base: 260, eq: 210, bon: 50, p25: 425, p50: 520, p75: 630, p90: 750 }
    },
    em: {
      entry:     { base: 165, eq: 50,  bon: 25, p25: 205, p50: 240, p75: 280, p90: 325 },
      mid:       { base: 195, eq: 85,  bon: 35, p25: 265, p50: 315, p75: 375, p90: 440 },
      senior:    { base: 230, eq: 130, bon: 45, p25: 335, p50: 405, p75: 485, p90: 570 },
      staff:     { base: 270, eq: 220, bon: 60, p25: 440, p50: 550, p75: 660, p90: 780 },
      principal: { base: 320, eq: 340, bon: 85, p25: 580, p50: 745, p75: 910, p90: 1100 }
    }
  };

  const LOCATION_FACTORS = {
    'us-tier1': 1.0,
    'us-tier2': 0.88,
    'europe':   0.72,
    'canada':   0.78,
    'remote':   0.85
  };

  const salRole = document.getElementById('sal-role');
  const salLevel = document.getElementById('sal-level');
  const salLocation = document.getElementById('sal-location');

  const statBaseSalary = document.getElementById('stat-base-salary');
  const statEquity = document.getElementById('stat-equity');
  const statBonus = document.getElementById('stat-bonus');
  const statTotalComp = document.getElementById('stat-total-comp');
  const rangeBadge = document.getElementById('range-badge');
  const p25Val = document.getElementById('p25-val');
  const p50Val = document.getElementById('p50-val');
  const p75Val = document.getElementById('p75-val');
  const p90Val = document.getElementById('p90-val');
  const salaryProgressBar = document.getElementById('salary-progress-bar');

  function updateSalaryDisplay() {
    const role = salRole.value;
    const level = salLevel.value;
    const loc = salLocation.value;

    const roleData = SALARY_DATABASE[role] || SALARY_DATABASE.swe;
    const levelData = roleData[level] || roleData.senior;
    const factor = LOCATION_FACTORS[loc] || 1.0;

    const base = Math.round(levelData.base * factor);
    const eq = Math.round(levelData.eq * factor);
    const bon = Math.round(levelData.bon * factor);
    const total = base + eq + bon;

    const p25 = Math.round(levelData.p25 * factor);
    const p50 = Math.round(levelData.p50 * factor);
    const p75 = Math.round(levelData.p75 * factor);
    const p90 = Math.round(levelData.p90 * factor);

    statBaseSalary.textContent = `$${base.toLocaleString()},000`;
    statEquity.textContent = `$${eq.toLocaleString()},000`;
    statBonus.textContent = `$${bon.toLocaleString()},000`;
    statTotalComp.textContent = `$${total.toLocaleString()},000`;

    p25Val.textContent = `$${p25}k`;
    p50Val.textContent = `$${p50}k`;
    p75Val.textContent = `$${p75}k`;
    p90Val.textContent = `$${p90}k`;

    rangeBadge.textContent = `Top 25% Earner Target: $${p75}k+`;

    const pct = Math.min(Math.max(Math.round(((total - p25) / (p90 - p25)) * 100), 20), 95);
    salaryProgressBar.style.width = `${pct}%`;
  }

  [salRole, salLevel, salLocation].forEach(el => el.addEventListener('change', updateSalaryDisplay));
  updateSalaryDisplay();

  // Copy Script Buttons
  document.querySelectorAll('.btn-copy-script').forEach(btn => {
    btn.addEventListener('click', () => {
      const targetId = btn.getAttribute('data-target');
      const textElem = document.getElementById(targetId);
      if (textElem) {
        navigator.clipboard.writeText(textElem.innerText).then(() => {
          showToast('Negotiation script copied to clipboard!');
        });
      }
    });
  });

  // ==========================================
  // SECTION 4: INTERVIEW READINESS ASSESSMENT
  // ==========================================
  const QUIZ_QUESTIONS = [
    {
      id: 1,
      category: 'star',
      question: 'When asked behavioral questions (e.g. "Tell me about a conflict with a stakeholder"), how structured is your delivery?',
      options: [
        { text: 'I talk conversationally without a set format and sometimes ramble.', score: 40 },
        { text: 'I loosely describe what happened and what the team did.', score: 65 },
        { text: 'I use Situation, Task, Action, Result and specify my own contribution.', score: 85 },
        { text: 'I deliver crisp STAR with exact metrics, trade-offs, and lessons learned.', score: 100 }
      ]
    },
    {
      id: 2,
      category: 'tech',
      question: 'How do you approach high-level technical problem solving and system design questions?',
      options: [
        { text: 'I jump immediately into database schema and coding details.', score: 45 },
        { text: 'I draw standard architecture blocks but struggle to justify trade-offs.', score: 70 },
        { text: 'I clarify functional/non-functional requirements and bottleneck sizing.', score: 90 },
        { text: 'I drive end-to-end scope, capacity back-of-the-envelope math, and failure modes.', score: 100 }
      ]
    },
    {
      id: 3,
      category: 'exec',
      question: 'How confident are you explaining complex technical decisions to non-technical VP or business leaders?',
      options: [
        { text: 'I struggle to strip out jargon and usually get interrupted.', score: 40 },
        { text: 'I can explain the basics if given sufficient time.', score: 65 },
        { text: 'I anchor discussions around user impact, latency, and business goals.', score: 85 },
        { text: 'I speak fluent executive language: ROI, risk mitigation, and strategic leverage.', score: 100 }
      ]
    },
    {
      id: 4,
      category: 'neg',
      question: 'What is your level of preparation for offer negotiations and compensation alignment?',
      options: [
        { text: 'I accept whatever initial offer the recruiter presents without asking.', score: 35 },
        { text: 'I ask for slightly more base pay if I feel bold, but fold quickly.', score: 60 },
        { text: 'I research Levels.fyi/market percentiles and ask for an adjusted equity or base package.', score: 85 },
        { text: 'I orchestrate multiple competing interview processes and leverage verified benchmarks.', score: 100 }
      ]
    },
    {
      id: 5,
      category: 'star',
      question: 'How many polished, quantifiable stories do you have prepared for behavioral interview rounds?',
      options: [
        { text: '0 to 1 stories; I wing it on the spot.', score: 30 },
        { text: '2 to 3 generic stories that I reuse for every question.', score: 60 },
        { text: '4 to 6 diverse stories mapped to leadership principles and failures.', score: 88 },
        { text: '8+ battle-tested stories with metrics covering failure, leadership, and scale.', score: 100 }
      ]
    },
    {
      id: 6,
      category: 'tech',
      question: 'How comfortably can you discuss trade-offs in distributed systems (CAP theorem, cache invalidation, consensus)?',
      options: [
        { text: 'I know the theoretical definitions but struggle in real scenarios.', score: 50 },
        { text: 'I can discuss Redis vs Memcached and SQL vs NoSQL basics.', score: 70 },
        { text: 'I clearly articulate read/write scaling, replication lags, and consistency trade-offs.', score: 90 },
        { text: 'I have production experience handling multi-region failovers and partitions.', score: 100 }
      ]
    }
  ];

  const quizContainer = document.getElementById('quiz-questions-list');
  const readinessMeter = document.getElementById('readiness-meter');
  const readinessScoreVal = document.getElementById('readiness-score-val');
  const readinessVerdict = document.getElementById('readiness-verdict');
  const readinessSummary = document.getElementById('readiness-summary');
  const catScoreStar = document.getElementById('cat-score-star');
  const catScoreTech = document.getElementById('cat-score-tech');
  const catScoreExec = document.getElementById('cat-score-exec');
  const catScoreNeg = document.getElementById('cat-score-neg');

  // Selected scores state
  const userAnswers = {
    1: 85,
    2: 90,
    3: 85,
    4: 60,
    5: 88,
    6: 70
  };

  function renderQuizQuestions() {
    quizContainer.innerHTML = '';
    QUIZ_QUESTIONS.forEach(q => {
      const qCard = document.createElement('div');
      qCard.className = 'quiz-question-card';
      qCard.innerHTML = `
        <div style="font-weight: 700; font-size: 0.95rem; color: var(--text-primary); margin-bottom: 0.25rem;">
          <span style="color: var(--accent); margin-right: 0.4rem;">Q${q.id}.</span>${escapeHtml(q.question)}
        </div>
        <div class="quiz-options">
          ${q.options.map(opt => `
            <button type="button" class="quiz-opt-btn ${userAnswers[q.id] === opt.score ? 'selected' : ''}" data-qid="${q.id}" data-score="${opt.score}">
              ${escapeHtml(opt.text)}
            </button>
          `).join('')}
        </div>
      `;
      quizContainer.appendChild(qCard);
    });

    // Attach click events
    quizContainer.querySelectorAll('.quiz-opt-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const qid = parseInt(btn.getAttribute('data-qid'), 10);
        const score = parseInt(btn.getAttribute('data-score'), 10);
        userAnswers[qid] = score;

        // Update UI
        const siblingBtns = btn.closest('.quiz-options').querySelectorAll('.quiz-opt-btn');
        siblingBtns.forEach(b => b.classList.remove('selected'));
        btn.classList.add('selected');

        computeReadinessScore();
      });
    });
  }

  function computeReadinessScore() {
    let total = 0;
    let count = 0;

    const catSums = { star: { sum: 0, count: 0 }, tech: { sum: 0, count: 0 }, exec: { sum: 0, count: 0 }, neg: { sum: 0, count: 0 } };

    QUIZ_QUESTIONS.forEach(q => {
      const score = userAnswers[q.id] || 70;
      total += score;
      count++;
      if (catSums[q.category]) {
        catSums[q.category].sum += score;
        catSums[q.category].count++;
      }
    });

    const overallPct = Math.round(total / count);
    readinessScoreVal.textContent = `${overallPct}%`;
    readinessMeter.style.setProperty('--meter-pct', `${overallPct}%`);

    // Category breakdown
    const starAvg = Math.round(catSums.star.sum / (catSums.star.count || 1));
    const techAvg = Math.round(catSums.tech.sum / (catSums.tech.count || 1));
    const execAvg = Math.round(catSums.exec.sum / (catSums.exec.count || 1));
    const negAvg = Math.round(catSums.neg.sum / (catSums.neg.count || 1));

    catScoreStar.textContent = `${starAvg}%`;
    catScoreTech.textContent = `${techAvg}%`;
    catScoreExec.textContent = `${execAvg}%`;
    catScoreNeg.textContent = `${negAvg}%`;

    // Verdict text
    if (overallPct >= 85) {
      readinessVerdict.textContent = 'Tier 1 Offer Ready';
      readinessSummary.textContent = 'Exceptional readiness across technical depth, behavioral storytelling, and executive presence. Focus on orchestrating competitive counter-offers to unlock maximum top-of-band packages.';
    } else if (overallPct >= 70) {
      readinessVerdict.textContent = 'Competitive (Needs Polish)';
      readinessSummary.textContent = 'Strong technical foundation and clear narrative. Sharpen your negotiation levers and drill down on measurable business ROI metrics in your STAR responses.';
    } else {
      readinessVerdict.textContent = 'Development Phase';
      readinessSummary.textContent = 'Solid potential, but responses require tighter structure. Dedicate time to building an 8-story STAR matrix and studying system design capacity trade-offs before interviewing.';
    }
  }

  renderQuizQuestions();
  computeReadinessScore();

  // Mock Interview Flashcards
  const FLASHCARD_QUESTIONS = [
    "Tell me about a time you had to push back on a key product requirement due to technical debt or system scalability limitations.",
    "Describe a production incident or system outage you caused or diagnosed. What was your immediate response, and how did you prevent recurrence?",
    "How have you convinced senior engineers or cross-functional stakeholders who initially disagreed with your technical proposal?",
    "Tell me about a high-ambiguity project where requirements shifted mid-stream. How did you adapt your architecture and team priorities?",
    "Walk me through a project where you balanced short-term delivery speed against long-term engineering maintainability."
  ];

  let flashcardIdx = 0;
  const flashcardBox = document.getElementById('flashcard-box');
  const btnNextQuestion = document.getElementById('btn-next-question');
  const btnShowStarGuide = document.getElementById('btn-show-star-guide');
  const starGuideSnippet = document.getElementById('star-guide-snippet');

  btnNextQuestion.addEventListener('click', () => {
    flashcardIdx = (flashcardIdx + 1) % FLASHCARD_QUESTIONS.length;
    flashcardBox.textContent = `"${FLASHCARD_QUESTIONS[flashcardIdx]}"`;
  });

  btnShowStarGuide.addEventListener('click', () => {
    const isShown = starGuideSnippet.style.display === 'block';
    starGuideSnippet.style.display = isShown ? 'none' : 'block';
    btnShowStarGuide.textContent = isShown ? 'STAR Template' : 'Hide Template';
  });

});