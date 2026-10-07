// AI Speaker Notes & Rehearsal Studio Engine
// Zero server dependencies. 100% client-side execution.

let speakerSlides = [];
let activeSlideIndex = 0;
let activePersona = 'confident-founder';
let isRehearsing = false;
let teleprompterFontSize = 1.35;
let autoScrollInterval = null;
let isAutoScrolling = false;

// Stopwatch state
let stopwatchTimer = null;
let stopwatchSeconds = 0;
let isStopwatchRunning = false;

// Personas Dictionary
const PERSONA_CONFIGS = {
  'confident-founder': {
    style: 'Bold, urgent, visionary, and commercially driven.',
    hookPrefix: '[Pause 2s, smile confidently, scan the room] ',
    closingCue: ' [Emphasize strongly with forward hand gesture]'
  },
  'technical-architect': {
    style: 'Precise, mathematically grounded, and system-oriented.',
    hookPrefix: '[Deliberate tone, click to diagram] ',
    closingCue: ' [Point to latency benchmark]'
  },
  'keynote-storyteller': {
    style: 'Emotionally evocative, narrative-driven, and memorable.',
    hookPrefix: '[Lower voice slightly, lean in, begin with an anecdote] ',
    closingCue: ' [Pause 3s to let the realization settle]'
  },
  'executive-briefing': {
    style: 'Bottom-line first, risk-mitigated, and ROI-focused.',
    hookPrefix: '[Direct eye contact with executive leadership] ',
    closingCue: ' [Summarize the immediate net impact on EBITDA]'
  }
};

// Generate Full Presentation with Slides & Speaker Notes
function generateSpeakerDeck(topicText, targetMinutes, slideCount) {
  const avgSecPerSlide = Math.round((targetMinutes * 60) / slideCount);
  const persona = PERSONA_CONFIGS[activePersona] || PERSONA_CONFIGS['confident-founder'];

  const templates = [
    {
      kicker: 'OPENING HOOK',
      title: topicText,
      subtitle: 'The Generational Shift Driving Modern Competitive Advantage',
      bullets: [
        'Fundamental architectural transformation',
        'From manual friction to autonomous execution',
        'Strategic urgency for forward-thinking leadership'
      ],
      targetSec: avgSecPerSlide,
      hook: `${persona.hookPrefix}"Thank you for having me today. Over the next ${targetMinutes} minutes, we are going to unpack a fundamental shift that is redefining our entire sector."`,
      script: `Good morning everyone. When you look at how our industry operated five years ago compared to today, one thing is glaringly obvious: incremental optimization is no longer sufficient.

What we are witnessing is not another marginal software upgrade. It is an architectural paradigm shift. The organizations that adapt to this reality today will own their markets tomorrow; the ones that hesitate will be left maintaining legacy technical debt.

In this session, I will walk you through exactly how we have structured this breakthrough, the empirical evidence backing our claims, and what it means for your strategic roadmap.${persona.closingCue}`,
      qa: 'Q: "Is the market truly ready for this transition now?"\nA: "The early adopters in our pilot cohorts are already capturing 4x efficiency gains, making waiting an active competitive risk."'
    },
    {
      kicker: 'THE CORE CRISIS',
      title: 'The Hidden Toll of Legacy Fragmentation',
      subtitle: 'Manual coordination is quietly consuming 40% of organizational bandwidth.',
      bullets: [
        'Compound latency in cross-functional workflows',
        'Human error introducing compounding systemic risk',
        'Inability to scale without ballooning headcount'
      ],
      targetSec: avgSecPerSlide,
      hook: `${persona.hookPrefix}"Before discussing our solution, let us confront the uncomfortable truth about current operations."`,
      script: `Every single executive I speak with tells me the same frustrating story: their top talent spends nearly half their working hours doing manual translation between disconnected software tools.

Think about what that actually costs you. It is not just the software subscription licenses. It is the decision latency. When a critical workflow takes three days instead of three seconds, you are operating at an insurmountable disadvantage.

The root cause is structural: legacy tools were built for human data entry, not autonomous intelligent execution.${persona.closingCue}`,
      qa: 'Q: "Can we not solve this by integrating our current tools with custom scripts?"\nA: "Custom brittle glue code actually increases technical debt and creates new failure points when vendor APIs inevitably mutate."'
    },
    {
      kicker: 'THE BREAKTHROUGH',
      title: 'Autonomous System Architecture',
      subtitle: 'A self-calibrating intelligent foundation designed for sub-second execution.',
      bullets: [
        'Zero-trust distributed processing pipeline',
        'Self-healing orchestration removing single points of failure',
        'Plug-and-play interoperability across hybrid clouds'
      ],
      targetSec: avgSecPerSlide,
      hook: `${persona.hookPrefix}"Here is the paradigm shift that flips this equation on its head."`,
      script: `Instead of asking human operators to manually coordinate across multiple siloed systems, our architecture introduces autonomous orchestration layers that process, validate, and execute in real-time.

Notice the fundamental simplicity of the pipeline on this slide. Ingestion occurs at the edge. Contextual inference executes within milliseconds under hardware-enforced security boundaries. And the final state change is committed atomically.

What used to require an entire department of coordinators now executes reliably in the background with zero human latency.${persona.closingCue}`,
      qa: 'Q: "How does the system handle unpredictable edge case anomalies?"\nA: "Our confidence-gated guardrails automatically route high-uncertainty transactions to human supervisors with full context pre-assembled."'
    },
    {
      kicker: 'EMPIRICAL PROOF',
      title: 'Quantified Benchmark Validation',
      subtitle: 'Verified performance gains audited across Tier-1 enterprise environments.',
      bullets: [
        '10x acceleration in end-to-end task turnaround',
        '94% reduction in downstream manual error tickets',
        '3.8x ROI realized within the first 90 days'
      ],
      targetSec: avgSecPerSlide,
      hook: `${persona.hookPrefix}"I do not want you to take my word for it. Let us look at the verified audit data."`,
      script: `When we deployed this architecture inside our first Fortune 100 benchmark customer, their technical auditors independently tracked every metric against their baseline.

The results speak for themselves: task completion velocity accelerated by tenfold. Error rates collapsed by ninety-four percent. And most critically, their capital payback occurred in under one calendar quarter.

These are not theoretical lab simulations; these are mission-critical production workloads running under full regulatory scrutiny.${persona.closingCue}`,
      qa: 'Q: "Are these benchmark metrics repeatable across other enterprise verticals?"\nA: "Yes, because the efficiency delta stems from eliminating systemic workflow coordination friction, which exists universally across all modern enterprises."'
    },
    {
      kicker: 'DEFENSIBLE MOATS',
      title: 'Why Our Advantage Compounds Over Time',
      subtitle: 'Network effects and self-reinforcing data flywheels protect our lead.',
      bullets: [
        'Proprietary telemetry generating compounding accuracy',
        'Deep architectural moats preventing commoditization',
        'High switching costs backed by mission-critical reliability'
      ],
      targetSec: avgSecPerSlide,
      hook: `${persona.hookPrefix}"A natural question you should ask is: what stops a well-funded competitor from copying this tomorrow?"`,
      script: `Software features can be duplicated, but foundational architecture and compounding data flywheels cannot.

Every single workflow executed through our engine strengthens the predictive optimization models across the entire network. This creates a self-reinforcing flywheel: higher velocity attracts more volume, which yields richer operational intelligence, creating an ever-widening performance gap.

By the time a legacy competitor attempts to re-architect their stack, our network has already compounded by several orders of magnitude.${persona.closingCue}`,
      qa: 'Q: "Does customer data get commingled across the network?"\nA: "Never. All model refinements utilize privacy-preserving federated telemetry, keeping proprietary customer payloads strictly sovereign and encrypted."'
    },
    {
      kicker: 'STRATEGIC ROADMAP',
      title: 'Phased Horizon & Milestone Schedule',
      subtitle: 'Clear, disciplined execution plan delivering continuous value.',
      bullets: [
        'Phase 1: Zero-friction integration and baseline audit',
        'Phase 2: Automated workload cutover and scale',
        'Phase 3: Autonomous ecosystem optimization'
      ],
      targetSec: avgSecPerSlide,
      hook: `${persona.hookPrefix}"Execution is everything. Here is our precise timeline for delivering this transformation."`,
      script: `We have structured our rollout into three disciplined, risk-mitigated phases.

Phase 1 focuses on non-disruptive parallel monitoring. We prove reliability in your environment without modifying existing core systems.

Phase 2 begins the progressive automated cutover of high-volume repetitive workflows, immediately delivering observable cost reductions.

And Phase 3 unlocks full autonomous orchestration, allowing your teams to redirect their intellectual energy toward high-leverage strategic initiatives.${persona.closingCue}`,
      qa: 'Q: "What happens if a milestone encounters unforeseen legacy friction?"\nA: "Our modular architecture allows each phase to deliver standalone ROI independently, ensuring value is never blocked by downstream dependencies."'
    },
    {
      kicker: 'FINANCIAL IMPACT',
      title: 'The Cost of Inaction vs Transformational ROI',
      subtitle: 'A disciplined capital allocation decision with asymmetrical upside.',
      bullets: [
        'Payback period under 4 months',
        '80%+ sustained operational gross margins',
        'Unlocking non-linear revenue growth per employee'
      ],
      targetSec: avgSecPerSlide,
      hook: `${persona.hookPrefix}"Let us frame this through the lens of pure enterprise capital allocation."`,
      script: `In business, the most dangerous cost is rarely the line item on an invoice; it is the hidden opportunity cost of maintaining an inefficient status quo.

Every month spent operating under legacy constraints represents hundreds of wasted engineering hours and delayed strategic initiatives.

When you weigh an investment with a sub-four-month payback against the existential risk of lagging your industry's fastest innovators, the decision becomes unambiguous.${persona.closingCue}`,
      qa: 'Q: "What is the initial capital commitment required to get started?"\nA: "We structure our pilot agreements on a milestones-gated basis, meaning full enterprise commitments are contingent on verified performance hurdles."'
    },
    {
      kicker: 'THE CALL TO ACTION',
      title: 'Leading The Next Frontier Together',
      subtitle: 'Partner with us to define the next decade of industry leadership.',
      bullets: [
        'Dedicated pilot onboarding squad ready for deployment',
        'White-glove executive sponsorship and governance',
        'Join the vanguard of forward-thinking enterprises'
      ],
      targetSec: avgSecPerSlide,
      hook: `${persona.hookPrefix}"We stand at a rare inflection point. The choices we make in this room will reverberate for years."`,
      script: `Thank you for your time and undivided focus. 

The transition to autonomous enterprise systems is not a matter of if, but when. The forward-thinking leaders who act now will build insurmountable competitive advantages.

Our engineering and executive teams are prepared to partner with you immediately. We invite you to initiate our 30-day proof of concept and experience the transformation firsthand. 

I would now love to open the floor to your questions.${persona.closingCue}`,
      qa: 'Q: "How quickly can our team begin the 30-day sandbox?"\nA: "Our deployment team can provision your dedicated sovereign sandbox within 48 hours of authorization."'
    }
  ];

  return templates.slice(0, slideCount);
}

// Calculate Speech Pacing and Stats
function updateSpeechMetrics(slide) {
  if (!slide) return;

  const scriptText = (slide.hook || '') + ' ' + (slide.script || '');
  const wordCount = scriptText.trim().split(/\s+/).filter(Boolean).length;
  const targetSec = slide.targetSec || 60;
  const targetMin = targetSec / 60;
  const wpm = targetMin > 0 ? Math.round(wordCount / targetMin) : 0;

  const timeEl = document.getElementById('label-slide-time');
  const countEl = document.getElementById('label-word-count');
  const paceEl = document.getElementById('label-pacing');

  if (timeEl) timeEl.textContent = `${targetSec}s`;
  if (countEl) countEl.textContent = `${wordCount} words`;

  if (paceEl) {
    if (wpm > 160) {
      paceEl.textContent = `${wpm} WPM (A bit fast!)`;
      paceEl.style.color = '#f87171';
    } else if (wpm < 110) {
      paceEl.textContent = `${wpm} WPM (Slow / Deliberate)`;
      paceEl.style.color = '#fbbf24';
    } else {
      paceEl.textContent = `${wpm} WPM (Optimal)`;
      paceEl.style.color = '#4ade80';
    }
  }
}

// Render Thumbnails
function renderThumbnails() {
  const container = document.getElementById('notes-thumbs-container');
  if (!container) return;

  container.innerHTML = '';
  speakerSlides.forEach((slide, idx) => {
    const card = document.createElement('div');
    card.className = `notes-thumb-card ${idx === activeSlideIndex ? 'active' : ''}`;
    card.onclick = () => selectSlide(idx);

    card.innerHTML = `
      <span style="font-weight: 800; font-size: 0.75rem; color: var(--accent);">#${idx + 1}</span>
      <div style="flex: 1; overflow: hidden;">
        <div style="font-size: 0.7rem; color: var(--text-secondary); text-transform: uppercase;">${escapeHtml(slide.kicker || 'SLIDE')} • ${slide.targetSec || 60}s</div>
        <div style="font-size: 0.82rem; font-weight: 600; color: #fff; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${escapeHtml(slide.title || 'Untitled')}</div>
      </div>
    `;
    container.appendChild(card);
  });

  const counter = document.getElementById('counter-active-slide');
  if (counter) counter.textContent = `${activeSlideIndex + 1} / ${speakerSlides.length}`;

  const badgeTotal = document.getElementById('badge-total-slides');
  if (badgeTotal) badgeTotal.textContent = `${speakerSlides.length} Slides`;

  const totalSec = speakerSlides.reduce((acc, s) => acc + (s.targetSec || 60), 0);
  const badgeTime = document.getElementById('badge-total-time');
  if (badgeTime) badgeTime.textContent = `~${Math.round(totalSec / 60)} mins total`;
}

// Render Visual Slide
function renderVisualSlide(slide, targetEl, isFullscreen = false) {
  if (!slide || !targetEl) return;

  targetEl.innerHTML = `
    <div>
      <div style="display: inline-block; padding: 0.2rem 0.6rem; background: rgba(255,255,255,0.08); border-radius: 9999px; font-size: 0.72rem; font-weight: 700; color: #cbd5e1; text-transform: uppercase; margin-bottom: 0.5rem;">
        ${escapeHtml(slide.kicker || 'PRESENTATION')}
      </div>
      <h2 style="font-size: ${isFullscreen ? '2.4rem' : '1.8rem'}; font-weight: 800; margin-bottom: 0.4rem; line-height: 1.15; color: #fff;">
        ${escapeHtml(slide.title || 'Slide Title')}
      </h2>
      <p style="font-size: ${isFullscreen ? '1.15rem' : '0.92rem'}; color: #94a3b8; margin-bottom: 1.25rem;">
        ${escapeHtml(slide.subtitle || '')}
      </p>
      <div style="background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.08); border-radius: 12px; padding: 1.25rem;">
        <ul style="margin: 0; padding-left: 1.25rem; display: flex; flex-direction: column; gap: 0.6rem; color: #e2e8f0; font-size: ${isFullscreen ? '1.1rem' : '0.88rem'};">
          ${(slide.bullets || []).map(b => `<li>${escapeHtml(b)}</li>`).join('')}
        </ul>
      </div>
    </div>
    <div style="display: flex; justify-content: space-between; border-top: 1px solid rgba(255,255,255,0.08); padding-top: 0.75rem; font-size: 0.72rem; color: #64748b; margin-top: 1rem;">
      <span>AI Speaker Notes Studio</span>
      <span>Slide ${activeSlideIndex + 1} of ${speakerSlides.length}</span>
    </div>
  `;
}

// Select Slide
function selectSlide(idx) {
  if (idx < 0 || idx >= speakerSlides.length) return;
  activeSlideIndex = idx;
  renderThumbnails();

  const cur = speakerSlides[activeSlideIndex];
  const canvasEl = document.getElementById('notes-slide-canvas');
  if (canvasEl) {
    renderVisualSlide(cur, canvasEl, false);
  }

  // Populate Visual inputs
  const inTitle = document.getElementById('inp-slide-title');
  const inSub = document.getElementById('inp-slide-sub');
  const inBullets = document.getElementById('inp-slide-bullets');

  if (inTitle) inTitle.value = cur.title || '';
  if (inSub) inSub.value = cur.subtitle || '';
  if (inBullets) inBullets.value = (cur.bullets || []).join('\n');

  // Populate Notes inputs
  const inHook = document.getElementById('inp-notes-hook');
  const inScript = document.getElementById('inp-notes-script');
  const inQA = document.getElementById('inp-notes-qa');

  if (inHook) inHook.value = cur.hook || '';
  if (inScript) inScript.value = cur.script || '';
  if (inQA) inQA.value = cur.qa || '';

  updateSpeechMetrics(cur);

  if (isRehearsing) {
    updateRehearsalView();
  }
}

// Sync Editor into Slide
function syncEditorToSlide() {
  const cur = speakerSlides[activeSlideIndex];
  if (!cur) return;

  const inTitle = document.getElementById('inp-slide-title');
  const inSub = document.getElementById('inp-slide-sub');
  const inBullets = document.getElementById('inp-slide-bullets');
  const inHook = document.getElementById('inp-notes-hook');
  const inScript = document.getElementById('inp-notes-script');
  const inQA = document.getElementById('inp-notes-qa');

  if (inTitle) cur.title = inTitle.value;
  if (inSub) cur.subtitle = inSub.value;
  if (inBullets) cur.bullets = inBullets.value.split('\n').map(l => l.trim()).filter(Boolean);
  if (inHook) cur.hook = inHook.value;
  if (inScript) cur.script = inScript.value;
  if (inQA) cur.qa = inQA.value;

  renderThumbnails();
  const canvasEl = document.getElementById('notes-slide-canvas');
  if (canvasEl) renderVisualSlide(cur, canvasEl, false);
  updateSpeechMetrics(cur);
}

// AI Polish Script for Active Slide
function polishScript() {
  const cur = speakerSlides[activeSlideIndex];
  if (!cur) return;

  const persona = PERSONA_CONFIGS[activePersona] || PERSONA_CONFIGS['confident-founder'];
  if (!cur.hook.includes('[Pause')) {
    cur.hook = persona.hookPrefix + cur.hook;
  }
  if (!cur.script.includes('[Emphasize') && !cur.script.includes('[Pause')) {
    cur.script += persona.closingCue;
  }
  selectSlide(activeSlideIndex);
}

// Fullscreen Rehearsal Teleprompter
function openRehearsalMode() {
  const modal = document.getElementById('rehearsal-modal');
  if (!modal) return;
  isRehearsing = true;
  modal.classList.add('active');
  updateRehearsalView();
  startStopwatch();

  if (document.documentElement.requestFullscreen) {
    document.documentElement.requestFullscreen().catch(() => {});
  }
}

function closeRehearsalMode() {
  const modal = document.getElementById('rehearsal-modal');
  if (!modal) return;
  isRehearsing = false;
  modal.classList.remove('active');
  stopStopwatch();
  stopAutoScroll();

  if (document.fullscreenElement && document.exitFullscreen) {
    document.exitFullscreen().catch(() => {});
  }
}

function updateRehearsalView() {
  const slideStage = document.getElementById('rehearsal-slide-view');
  const teleprompterBody = document.getElementById('teleprompter-text-body');
  const rehearsalCount = document.getElementById('rehearsal-count');
  const rehearsalLabel = document.getElementById('rehearsal-slide-label');

  const cur = speakerSlides[activeSlideIndex];
  if (!cur) return;

  if (slideStage) renderVisualSlide(cur, slideStage, true);
  if (rehearsalCount) rehearsalCount.textContent = `${activeSlideIndex + 1} / ${speakerSlides.length}`;
  if (rehearsalLabel) rehearsalLabel.textContent = `Slide ${activeSlideIndex + 1} of ${speakerSlides.length} (${cur.targetSec}s target)`;

  if (teleprompterBody) {
    teleprompterBody.style.fontSize = `${teleprompterFontSize}rem`;
    teleprompterBody.innerHTML = `
      <div style="background: rgba(245, 158, 11, 0.15); border-left: 4px solid #f59e0b; padding: 0.75rem 1rem; border-radius: 6px; margin-bottom: 1.5rem; font-size: ${teleprompterFontSize * 0.85}rem; color: #fbbf24;">
        <strong>STAGE CUE:</strong> ${escapeHtml(cur.hook || 'Deliver opening line with confident cadence.')}
      </div>
      <div style="margin-bottom: 2rem; color: #f8fafc; font-weight: 500;">
        ${escapeHtml(cur.script || 'No script entered.')}
      </div>
      ${cur.qa ? `
        <div style="background: rgba(59, 130, 246, 0.12); border-left: 4px solid #3b82f6; padding: 0.75rem 1rem; border-radius: 6px; font-size: ${teleprompterFontSize * 0.85}rem; color: #93c5fd;">
          <strong>POTENTIAL AUDIENCE OBJECTION:</strong><br>
          ${escapeHtml(cur.qa)}
        </div>
      ` : ''}
    `;
    teleprompterBody.scrollTop = 0;
  }
}

// Teleprompter Auto-Scroll
function toggleAutoScroll() {
  const btn = document.getElementById('btn-toggle-scroll');
  if (isAutoScrolling) {
    stopAutoScroll();
    if (btn) btn.textContent = '▶ Auto-Scroll';
  } else {
    startAutoScroll();
    if (btn) btn.textContent = '⏸ Pause Scroll';
  }
}

function startAutoScroll() {
  const body = document.getElementById('teleprompter-text-body');
  if (!body) return;
  isAutoScrolling = true;
  clearInterval(autoScrollInterval);
  autoScrollInterval = setInterval(() => {
    body.scrollTop += 1;
    if (body.scrollTop + body.clientHeight >= body.scrollHeight) {
      stopAutoScroll();
    }
  }, 45);
}

function stopAutoScroll() {
  isAutoScrolling = false;
  clearInterval(autoScrollInterval);
}

// Stopwatch
function startStopwatch() {
  if (isStopwatchRunning) return;
  isStopwatchRunning = true;
  const toggleBtn = document.getElementById('btn-timer-toggle');
  if (toggleBtn) toggleBtn.textContent = 'Pause Timer';

  stopwatchTimer = setInterval(() => {
    stopwatchSeconds++;
    renderStopwatchTime();
  }, 1000);
}

function stopStopwatch() {
  isStopwatchRunning = false;
  clearInterval(stopwatchTimer);
  const toggleBtn = document.getElementById('btn-timer-toggle');
  if (toggleBtn) toggleBtn.textContent = 'Resume Timer';
}

function resetStopwatch() {
  stopStopwatch();
  stopwatchSeconds = 0;
  renderStopwatchTime();
  const toggleBtn = document.getElementById('btn-timer-toggle');
  if (toggleBtn) toggleBtn.textContent = 'Start Timer';
}

function renderStopwatchTime() {
  const el = document.getElementById('rehearsal-stopwatch');
  if (!el) return;
  const mins = Math.floor(stopwatchSeconds / 60).toString().padStart(2, '0');
  const secs = (stopwatchSeconds % 60).toString().padStart(2, '0');
  el.textContent = `${mins}:${secs}`;
}

// Slide Management
function addSlide() {
  const newSlide = {
    kicker: 'NEW POINT',
    title: 'New Presentation Slide',
    subtitle: 'Elaborate on this specific concept or milestone.',
    bullets: ['Key talking point alpha', 'Key talking point beta', 'Key talking point gamma'],
    targetSec: 75,
    hook: '[Make eye contact with room] "Moving onto our next critical focus area..."',
    script: 'On this slide, we outline the operational implications of our strategic framework. Every stakeholder in this room understands why execution matters.',
    qa: 'Q: "What are the timeline implications?"\nA: "We are tracking on schedule with no blocking dependencies."'
  };
  speakerSlides.splice(activeSlideIndex + 1, 0, newSlide);
  selectSlide(activeSlideIndex + 1);
}

function deleteSlide() {
  if (speakerSlides.length <= 1) {
    alert('Presentation must contain at least 1 slide.');
    return;
  }
  speakerSlides.splice(activeSlideIndex, 1);
  if (activeSlideIndex >= speakerSlides.length) {
    activeSlideIndex = speakerSlides.length - 1;
  }
  selectSlide(activeSlideIndex);
}

function moveSlideUp() {
  if (activeSlideIndex <= 0) return;
  const temp = speakerSlides[activeSlideIndex];
  speakerSlides[activeSlideIndex] = speakerSlides[activeSlideIndex - 1];
  speakerSlides[activeSlideIndex - 1] = temp;
  selectSlide(activeSlideIndex - 1);
}

function moveSlideDown() {
  if (activeSlideIndex >= speakerSlides.length - 1) return;
  const temp = speakerSlides[activeSlideIndex];
  speakerSlides[activeSlideIndex] = speakerSlides[activeSlideIndex + 1];
  speakerSlides[activeSlideIndex + 1] = temp;
  selectSlide(activeSlideIndex + 1);
}

// Exports
function exportCueCards() {
  const target = document.getElementById('cue-cards-print-target');
  if (!target) return;

  target.innerHTML = '';
  speakerSlides.forEach((slide, idx) => {
    const card = document.createElement('div');
    card.className = 'cue-card-page';
    card.innerHTML = `
      <div style="display: flex; justify-content: space-between; border-bottom: 2px solid #000; padding-bottom: 0.5rem; margin-bottom: 1rem;">
        <span style="font-weight: 800; font-size: 1.1rem;">SPEAKER CUE CARD #${idx + 1}</span>
        <span style="font-weight: 700; color: #4338ca;">Target: ${slide.targetSec || 60} seconds</span>
      </div>
      <h2 style="font-size: 1.5rem; margin-bottom: 0.5rem; color: #000;">${escapeHtml(slide.title || '')}</h2>
      <p style="font-size: 1rem; color: #475569; margin-bottom: 1rem; font-style: italic;">${escapeHtml(slide.subtitle || '')}</p>
      
      <div style="background: #f1f5f9; padding: 0.75rem 1rem; border-left: 4px solid #f59e0b; margin-bottom: 1rem;">
        <strong>STAGE CUE:</strong> ${escapeHtml(slide.hook || '')}
      </div>

      <div style="margin-bottom: 1.25rem;">
        <strong>TALKING POINTS / SCRIPT:</strong>
        <p style="margin-top: 0.5rem; line-height: 1.6; font-size: 1.05rem;">${escapeHtml(slide.script || '')}</p>
      </div>

      ${slide.qa ? `
        <div style="background: #e0f2fe; padding: 0.75rem 1rem; border-left: 4px solid #0284c7;">
          <strong>POTENTIAL OBJECTION / Q&A:</strong>
          <p style="margin: 0.25rem 0 0 0; font-size: 0.95rem;">${escapeHtml(slide.qa)}</p>
        </div>
      ` : ''}
    `;
    target.appendChild(card);
  });

  window.print();
}

function exportTranscriptMarkdown() {
  let md = `# Presentation Script & Speaker Notes\n\n`;
  speakerSlides.forEach((slide, idx) => {
    md += `## Slide ${idx + 1}: ${slide.title}\n`;
    md += `*Target Duration: ${slide.targetSec || 60}s*\n\n`;
    md += `> **Stage Cue:** ${slide.hook || ''}\n\n`;
    md += `### Speech Transcript:\n${slide.script || ''}\n\n`;
    if (slide.qa) {
      md += `### Anticipated Q&A:\n${slide.qa}\n\n`;
    }
    md += `---\n\n`;
  });

  downloadBlob(md, `presentation_speech_transcript.md`, 'text/markdown');
}

function exportDeckHtml() {
  const jsonStr = JSON.stringify(speakerSlides);
  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Presentation with Embedded Speaker Notes</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { background: #060911; color: #f8fafc; font-family: -apple-system, sans-serif; display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 100vh; padding: 2rem; }
    .layout { display: grid; grid-template-columns: 1.1fr 1fr; gap: 2rem; width: 95vw; max-width: 1400px; }
    .slide-box { aspect-ratio: 16/9; background: #0c101c; border-radius: 16px; padding: 3rem; display: flex; flex-direction: column; justify-content: space-between; border: 1px solid rgba(255,255,255,0.12); }
    .notes-box { background: rgba(15,23,42,0.8); border: 1px solid rgba(255,255,255,0.12); border-radius: 16px; padding: 2rem; max-height: 520px; overflow-y: auto; }
    .badge { font-size: 0.75rem; text-transform: uppercase; color: #818cf8; font-weight: 700; margin-bottom: 0.5rem; }
    h1 { font-size: 2.2rem; margin-bottom: 0.5rem; }
    .sub { font-size: 1.1rem; color: #94a3b8; margin-bottom: 1.5rem; }
    .cue { background: rgba(245,158,11,0.15); border-left: 4px solid #f59e0b; padding: 0.75rem; border-radius: 6px; margin-bottom: 1rem; color: #fbbf24; }
    .script { line-height: 1.7; font-size: 1.1rem; color: #e2e8f0; }
    .nav { margin-top: 1.5rem; display: flex; gap: 1rem; align-items: center; }
    button { background: #3b82f6; color: #fff; border: none; padding: 0.5rem 1.25rem; border-radius: 9999px; cursor: pointer; font-weight: 700; }
  </style>
</head>
<body>
  <div class="layout">
    <div class="slide-box" id="s-root"></div>
    <div class="notes-box" id="n-root"></div>
  </div>
  <div class="nav">
    <button id="p">&larr; Previous</button>
    <span id="c" style="font-weight: 700; color: #818cf8;"></span>
    <button id="n">Next &rarr;</button>
  </div>
  <script>
    const slides = ${jsonStr};
    let cur = 0;
    function render() {
      const s = slides[cur];
      document.getElementById('s-root').innerHTML = '<div><div class="badge">' + (s.kicker||'') + '</div><h1>' + (s.title||'') + '</h1><p class="sub">' + (s.subtitle||'') + '</p><ul style="padding-left:1.5rem;line-height:2;">' + (s.bullets||[]).map(x => '<li>' + x + '</li>').join('') + '</ul></div><div>Slide ' + (cur+1) + ' of ' + slides.length + '</div>';
      document.getElementById('n-root').innerHTML = '<div class="cue"><strong>STAGE CUE:</strong> ' + (s.hook||'') + '</div><div class="script">' + (s.script||'') + '</div>' + (s.qa ? '<div style="margin-top:1.5rem;padding:0.75rem;background:rgba(59,130,246,0.1);border-left:4px solid #3b82f6;color:#93c5fd;"><strong>Q&A:</strong> ' + s.qa + '</div>' : '');
      document.getElementById('c').textContent = (cur+1) + ' / ' + slides.length;
    }
    document.getElementById('p').onclick = () => { if (cur > 0) { cur--; render(); } };
    document.getElementById('n').onclick = () => { if (cur < slides.length - 1) { cur++; render(); } };
    window.addEventListener('keydown', e => {
      if (e.key === 'ArrowRight' || e.key === ' ') { if (cur < slides.length - 1) { cur++; render(); } }
      if (e.key === 'ArrowLeft') { if (cur > 0) { cur--; render(); } }
    });
    render();
  </script>
</body>
</html>`;

  downloadBlob(html, `presentation_with_speaker_notes.html`, 'text/html');
}

function exportDeckJson() {
  const jsonStr = JSON.stringify(speakerSlides, null, 2);
  downloadBlob(jsonStr, `speaker_notes_deck.json`, 'application/json');
}

function downloadBlob(content, filename, type) {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

// Initialization & Event Binding
document.addEventListener('DOMContentLoaded', () => {
  const topicInput = document.getElementById('inp-presentation-topic');
  const durationSelect = document.getElementById('select-duration');
  const countSelect = document.getElementById('select-slide-count');

  // Load initial deck
  speakerSlides = generateSpeakerDeck(
    topicInput ? topicInput.value : 'Autonomous AI Keynote',
    durationSelect ? parseInt(durationSelect.value, 10) : 10,
    countSelect ? parseInt(countSelect.value, 10) : 8
  );

  renderThumbnails();
  selectSlide(0);

  // Generate Deck
  document.getElementById('btn-generate-notes-deck')?.addEventListener('click', () => {
    const t = topicInput ? topicInput.value.trim() : 'AI Presentation';
    const d = durationSelect ? parseInt(durationSelect.value, 10) : 10;
    const c = countSelect ? parseInt(countSelect.value, 10) : 8;
    speakerSlides = generateSpeakerDeck(t, d, c);
    activeSlideIndex = 0;
    renderThumbnails();
    selectSlide(0);
  });

  // Persona Buttons
  const personaPills = document.querySelectorAll('.persona-pill');
  personaPills.forEach(pill => {
    pill.addEventListener('click', () => {
      personaPills.forEach(p => p.classList.remove('active'));
      pill.classList.add('active');
      activePersona = pill.getAttribute('data-persona');
      polishScript();
    });
  });

  // Editor Inputs
  ['inp-slide-title', 'inp-slide-sub', 'inp-slide-bullets', 'inp-notes-hook', 'inp-notes-script', 'inp-notes-qa'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.addEventListener('input', syncEditorToSlide);
  });

  // AI Polish
  document.getElementById('btn-ai-regen-notes')?.addEventListener('click', polishScript);

  // Reordering & Management
  document.getElementById('btn-add-slide')?.addEventListener('click', addSlide);
  document.getElementById('btn-slide-up')?.addEventListener('click', moveSlideUp);
  document.getElementById('btn-slide-down')?.addEventListener('click', moveSlideDown);
  document.getElementById('btn-slide-delete')?.addEventListener('click', deleteSlide);

  // Fullscreen Rehearsal & Teleprompter
  document.getElementById('btn-rehearse-mode')?.addEventListener('click', openRehearsalMode);
  document.getElementById('rehearsal-exit')?.addEventListener('click', closeRehearsalMode);
  document.getElementById('rehearsal-next')?.addEventListener('click', () => {
    if (activeSlideIndex < speakerSlides.length - 1) selectSlide(activeSlideIndex + 1);
  });
  document.getElementById('rehearsal-prev')?.addEventListener('click', () => {
    if (activeSlideIndex > 0) selectSlide(activeSlideIndex - 1);
  });

  // Teleprompter font sizing
  document.getElementById('btn-font-smaller')?.addEventListener('click', () => {
    if (teleprompterFontSize > 0.9) {
      teleprompterFontSize -= 0.15;
      updateRehearsalView();
    }
  });
  document.getElementById('btn-font-larger')?.addEventListener('click', () => {
    if (teleprompterFontSize < 2.5) {
      teleprompterFontSize += 0.15;
      updateRehearsalView();
    }
  });

  // Auto-scroll toggle
  document.getElementById('btn-toggle-scroll')?.addEventListener('click', toggleAutoScroll);

  // Stopwatch controls
  document.getElementById('btn-timer-toggle')?.addEventListener('click', () => {
    if (isStopwatchRunning) stopStopwatch();
    else startStopwatch();
  });
  document.getElementById('btn-timer-reset')?.addEventListener('click', resetStopwatch);

  // Keyboard navigation
  window.addEventListener('keydown', e => {
    if (e.key === 'F5') {
      e.preventDefault();
      openRehearsalMode();
    } else if (e.key === 'Escape' && isRehearsing) {
      closeRehearsalMode();
    } else if (e.key === 'ArrowRight') {
      if (isRehearsing && activeSlideIndex < speakerSlides.length - 1) {
        selectSlide(activeSlideIndex + 1);
      }
    } else if (e.key === 'ArrowLeft') {
      if (isRehearsing && activeSlideIndex > 0) {
        selectSlide(activeSlideIndex - 1);
      }
    } else if (e.key === ' ' && isRehearsing && e.target.tagName !== 'INPUT' && e.target.tagName !== 'TEXTAREA') {
      e.preventDefault();
      toggleAutoScroll();
    }
  });

  // Exports
  document.getElementById('btn-export-cue-cards')?.addEventListener('click', exportCueCards);
  document.getElementById('btn-export-transcript')?.addEventListener('click', exportTranscriptMarkdown);
  document.getElementById('btn-export-html')?.addEventListener('click', exportDeckHtml);
  document.getElementById('btn-export-json')?.addEventListener('click', exportDeckJson);
});