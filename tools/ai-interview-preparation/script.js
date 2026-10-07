// AI Interview Preparation - Interactive Mock Interview Simulator
// Features role selection, question bank, Web Speech API audio synthesis,
// digital pacing stopwatch, STAR model answers, and candidate scratchpad.

// 1. Comprehensive Question Knowledgebase
const QUESTION_DATABASE = {
  'software-engineer': {
    behavioral: [
      {
        question: 'Tell me about a time you strongly disagreed with a senior engineer or product manager on an architectural decision. How did you resolve it, and what was the outcome?',
        competency: 'Technical Conflict & Alignment',
        type: 'Behavioral STAR',
        situation: 'Our lead product manager wanted to release an MVP that bypassed asynchronous background processing in favor of synchronous HTTP calls to accelerate our release date by 3 weeks.',
        task: 'As the senior engineer responsible for system reliability, my responsibility was to protect our 99.99% availability SLA while still respecting the urgent commercial timeline.',
        action: 'Rather than arguing in abstract terms, I constructed a quick load test demonstrating that synchronous handling crashed at 400 concurrent checkouts. I then proposed a pragmatic compromise: utilizing an existing lightweight Redis queue that took only 2 additional days to implement.',
        result: 'The product launched within 48 hours of target schedule. During our peak launch surge, the queue seamlessly absorbed 8,500 concurrent orders with zero dropped transactions. The PM praised the data-driven compromise.',
        rubric: 'Emotional intelligence, objective data-driven evidence over dogma, willingness to compromise, and demonstrable focus on business value.'
      },
      {
        question: 'Describe a situation where a major bug or outage occurred in production under your watch. How did you triage, fix, and communicate the incident?',
        competency: 'Crisis Management & SRE',
        type: 'Behavioral STAR',
        situation: 'Following a Friday morning database migration, our checkout service experienced sudden connection pool exhaustion, causing 504 gateway timeouts for 15% of active shoppers.',
        task: 'I stepped up as Incident Commander to stabilize production immediately and communicate clearly with customer support leads.',
        action: 'I immediately initiated a rollback script, drained stuck database connections, and opened an active bridge for live status updates every 10 minutes. Once stable, I isolated an unindexed foreign key in the new schema.',
        result: 'Total downtime was limited to 14 minutes. We conducted a blameless post-mortem on Monday, added automated migration index linters, and prevented similar issues on future releases.',
        rubric: 'Calmness under pressure, prioritization of immediate mitigation over root-cause blame, clear stakeholder communication, and prevention mindset.'
      },
      {
        question: 'Can you share an experience where you had to balance technical debt against urgent feature delivery?',
        competency: 'Pragmatic Tradeoffs',
        type: 'Behavioral STAR',
        situation: 'Our monolithic codebase had severe circular dependencies that slowed down team CI builds from 5 minutes to 45 minutes, frustrating 30 developers.',
        task: 'I needed to persuade engineering leadership to allocate 20% of team sprint capacity to refactor core dependencies without freezing feature work.',
        action: 'I quantified the business cost: 30 developers losing 40 minutes per build equated to 120 lost engineering hours weekly. I framed technical debt reduction as a direct accelerator of feature velocity.',
        result: 'Leadership approved a dedicated 2-week debt sprint. We decoupled core domain boundaries, reducing build times to 6 minutes and accelerating subsequent feature delivery by 25%.',
        rubric: 'Ability to translate engineering friction into business ROI, constructive negotiation, and measured execution.'
      }
    ],
    technical: [
      {
        question: 'How would you architect a globally distributed URL shortening service (like Bitly) handling 100M new links per month with sub-10ms read latency?',
        competency: 'System Design & Scalability',
        type: 'Technical Architecture',
        situation: 'Designing a high-throughput read-heavy URL shortener with 100:1 read-to-write ratio.',
        task: 'Ensure sub-10ms redirect latency, zero key collisions, 99.999% availability, and minimal storage footprint.',
        action: 'Propose Base62 encoding on 64-bit auto-incrementing IDs generated via distributed Snowflake ticket servers. Use Redis clusters at regional CDN edge locations for hot key caching with LRU eviction. Store persistent mappings in a distributed NoSQL key-value store (e.g. Cassandra or DynamoDB) partitioned on key hash.',
        result: 'System achieves 8ms p99 read latency, handles 50,000 read queries/sec at peak, and scales horizontally with zero single points of failure.',
        rubric: 'Back-of-the-envelope estimation, data store selection rationale, cache strategies, distributed key generation, and handling cache invalidation.'
      },
      {
        question: 'Explain how you diagnose and eliminate a slow SQL query bottleneck in a PostgreSQL production cluster with 50M rows.',
        competency: 'Database Optimization',
        type: 'Technical Deep-Dive',
        situation: 'A critical reporting query on a transactions table was taking 8.4 seconds and causing database CPU spikes of 85%.',
        task: 'Identify query execution bottlenecks and optimize query run time to under 100ms.',
        action: 'Ran `EXPLAIN (ANALYZE, BUFFERS)` to inspect query plan, identifying a sequential table scan caused by a missing composite index and implicit type casting on user UUIDs. Added a partial B-Tree composite index on `(user_id, created_at DESC)` and converted query parameters to native types.',
        result: 'Query execution dropped from 8,400ms to 42ms (a 200x speedup), and production DB CPU dropped back to a baseline 18%.',
        rubric: 'Understanding of query execution plans (Seq Scan vs Index Scan), cost modeling, indexing tradeoffs, and read replica strategies.'
      }
    ],
    leadership: [
      {
        question: 'How do you mentor and elevate an underperforming junior engineer on your team without demoralizing them?',
        competency: 'People Mentorship & Coaching',
        type: 'Leadership & Culture',
        situation: 'A junior engineer was missing sprint delivery deadlines and felt overwhelmed by our codebase architecture.',
        task: 'Rebuild the engineer’s technical confidence and elevate their delivery velocity to meet team expectations.',
        action: 'Instituted weekly 1-on-1 pairing sessions to break large user stories into small bite-sized tasks. Identified that their blocker was unfamiliarity with our state management library, so provided targeted learning modules and reviewed drafts before public pull requests.',
        result: 'Within 6 weeks, their PR turnaround improved by 60%, and within 6 months, they independently owned and shipped a core customer-facing feature.',
        rubric: 'Empathy, actionable structured coaching, root-cause identification rather than punitive measures, and long-term talent cultivation.'
      }
    ]
  },

  'marketing-lead': {
    behavioral: [
      {
        question: 'Tell me about a marketing campaign that fell completely flat or missed targets. How did you diagnose the failure and adapt?',
        competency: 'Failure Recovery & Analytics',
        type: 'Behavioral STAR',
        situation: 'We launched a $120K Q2 paid acquisition campaign on LinkedIn targeting mid-market VP personas that yielded only 12 demo bookings against a target of 80.',
        task: 'Diagnose why high ad clicks were not translating into form completions and prevent budget wastage.',
        action: 'Conducted heat-map telemetry and session recordings on the landing page. Discovered that the 7-field form caused an 82% abandonment rate on mobile. Replaced it with an interactive 2-click assessment and adjusted ad copy to focus on cost-savings rather than generic buzzwords.',
        result: 'Relaunched the campaign with remaining budget, lifting landing page conversion rate from 0.8% to 4.2% and ultimately delivering 94 qualified demos.',
        rubric: 'Intellectual honesty, analytical problem diagnosis, agility in pivoting, and accountability.'
      }
    ],
    technical: [
      {
        question: 'How do you model and optimize Customer Acquisition Cost (CAC) payback periods across paid, organic, and referral channels?',
        competency: 'Marketing Economics & Attribution',
        type: 'Technical Analytics',
        situation: 'Company CAC payback period had expanded from 5 months to 11 months during an aggressive scale phase.',
        task: 'Restore blended CAC payback to under 6 months while continuing top-line growth.',
        action: 'Built multi-touch attribution models comparing first-touch and W-shaped conversion weights. Shifted 30% of budget from underperforming programmatic display into high-intent search and customer referral incentives.',
        result: 'Blended CAC payback improved to 4.8 months while preserving 92% of new customer acquisition volume.',
        rubric: 'Grasp of unit economics (LTV:CAC), cohort retention analysis, attribution modeling, and payback cycles.'
      }
    ],
    leadership: [
      {
        question: 'How do you align competing priorities between Marketing, Product, and Sales during a major product launch?',
        competency: 'Cross-Functional Governance',
        type: 'Leadership & Alignment',
        situation: 'Sales wanted immediate demo collateral, Product wanted to delay launch for stability, and Marketing was locked into industry conference timing.',
        task: 'Create unified launch alignment without compromising product quality or commercial momentum.',
        action: 'Established a joint weekly GTM council. Divided launch into a phased rollout: closed beta customer case studies for sales, followed by public PR announcement aligned with product sign-off.',
        result: 'Delivered flawless launch at the industry conference with 6 referenceable customer case studies ready for sales.',
        rubric: 'Diplomacy, stakeholder alignment, tiered milestone planning, and mutual respect.'
      }
    ]
  },

  'sales-exec': {
    behavioral: [
      {
        question: 'Walk me through how you revived and closed a complex 6-figure enterprise deal that had gone completely dark.',
        competency: 'Pipeline Resilience & Deal Revival',
        type: 'Behavioral STAR',
        situation: 'A $350K enterprise prospect stopped responding after procurement reviews due to a sudden executive leadership restructuring.',
        task: 'Re-engage the account and align our solution with the incoming CIO’s new strategic agenda.',
        action: 'Researched the new CIO’s public interviews and identified their mandate was cloud consolidation. Instead of sending generic "checking in" emails, I prepared an executive 1-page financial briefing detailing how our platform would consolidate 3 redundant software vendors and save $180K annually.',
        result: 'The CIO requested a meeting within 48 hours. We restructured the proposal and signed a 3-year contract worth $420K.',
        rubric: 'Tenacity, business value acumen, avoidance of spammy follow-ups, and executive empathy.'
      }
    ],
    technical: [
      {
        question: 'How do you implement the MEDDIC methodology to qualify and de-risk high-stakes enterprise sales opportunities?',
        competency: 'Sales Methodology & Forecasting',
        type: 'Technical Sales',
        situation: 'Sales organization suffered from unpredictable quarter-end deal slippage.',
        task: 'Institute rigorous qualification to ensure 90%+ deal forecast predictability.',
        action: 'Enforced strict MEDDIC qualification milestones: identifying verifiable Metrics, the Economic Buyer, Decision Criteria, Decision Process, Paper Process, and Champion testing.',
        result: 'Forecast variance decreased from 35% to under 6%, and win rates on late-stage enterprise deals climbed by 24%.',
        rubric: 'Thorough understanding of MEDDIC/BANT frameworks, paper process navigation, and qualification rigor.'
      }
    ],
    leadership: [
      {
        question: 'How do you foster a collaborative culture within a competitive enterprise sales floor?',
        competency: 'Sales Culture & Mentorship',
        type: 'Leadership & Team Building',
        situation: 'Sales floor had silos where top performers hoarded deal strategies and junior reps struggled.',
        task: 'Create a culture of knowledge sharing and mutual elevation.',
        action: 'Instituted a weekly "Win & Loss Film Room" where reps walked through real call recordings and objection handles. Paired top senior reps with ramping account executives in deal-coaching pods.',
        result: 'Ramping rep time-to-first-deal dropped by 3 weeks, and overall team quota attainment increased from 68% to 84%.',
        rubric: 'Team-first mindset, vulnerability, coaching, and alignment of incentives.'
      }
    ]
  },

  'project-manager': {
    behavioral: [
      {
        question: 'Tell me about a high-stakes project that was slipping behind schedule. How did you get it back on track?',
        competency: 'Schedule Recovery & Scope Management',
        type: 'Behavioral STAR',
        situation: 'A multi-department ERP migration was 6 weeks behind schedule with 2 months until regulatory deadlines.',
        task: 'Realistically realign scope and resource dependencies to hit the non-negotiable regulatory launch date.',
        action: 'Conducted an urgent critical-path analysis. Discovered that 3 non-essential reporting modules were blocking core financial compliance. Negotiated with stakeholders to defer non-essential reports to Phase 2 and instituted daily 15-minute cross-team blocker triage.',
        result: 'Delivered core regulatory compliance 4 days ahead of deadline with zero penalty infractions. Phase 2 delivered smoothly 4 weeks later.',
        rubric: 'Critical path understanding, ruthless prioritization, stakeholder management, and proactive communication.'
      }
    ],
    technical: [
      {
        question: 'How do you design a comprehensive Risk Register and mitigation matrix for a complex multi-vendor initiative?',
        competency: 'Risk Governance & Contingency',
        type: 'Technical PM',
        situation: 'Initiating a $4M data center consolidation involving 5 third-party vendors.',
        task: 'Anticipate failure modes and institute binding risk mitigation protocols.',
        action: 'Constructed an exhaustive Risk Register categorizing risks by Probability, Impact, and Velocity. Established clear risk owners, predefined trigger thresholds, and contractual vendor SLA breach penalties.',
        result: 'When a primary fiber provider experienced regional delays, pre-negotiated fallback satellite routing activated seamlessly with zero business downtime.',
        rubric: 'Risk identification rigor, mitigation feasibility, ownership accountability, and SLA enforcement.'
      }
    ],
    leadership: [
      {
        question: 'How do you influence executive stakeholders who demand unrealistic delivery timelines without having formal authority over them?',
        competency: 'Executive Influence & Negotiation',
        type: 'Leadership & Influence',
        situation: 'Executive VP insisted on adding 4 major features to an active sprint without extending the fixed launch date.',
        task: 'Maintain delivery feasibility and team morale without outright stonewalling leadership.',
        action: 'Presented an "Iron Triangle" trade-off model (Scope vs Time vs Quality). Transparently showed that adding the 4 features would require either pushing the launch by 5 weeks or increasing critical bug risk by 60%. Offered a tiered compromise of shipping the top-value feature immediately and scheduling the others for sprint +1.',
        result: 'The VP agreed to the staged compromise, praising the clarity and data-driven options presented.',
        rubric: 'Equanimity, visual trade-off presentation, constructive negotiation, and guarding team health.'
      }
    ]
  }
};

// Fallback generator for other roles
function getFallbackQuestions(roleKey, typeKey) {
  const roleTitle = roleKey.replace(/-/g, ' ').toUpperCase();
  return [
    {
      question: `Describe a challenging high-pressure scenario you navigated as a ${roleTitle}. What strategy did you deploy, and what were the measurable results?`,
      competency: 'Strategic Execution',
      type: `${typeKey.toUpperCase()} • STAR Method`,
      situation: `In my role as a ${roleTitle}, our organization encountered unexpected friction that threatened milestone deliverables and operating margins.`,
      task: `My mandate was to step in, align cross-functional teams, and formulate a high-yield resolution plan.`,
      action: `I conducted root-cause stakeholder interviews, instituted structured daily milestones, and automated repetitive operational friction points.`,
      result: `We resolved the core bottleneck within 3 weeks, improving throughput by 35% and delivering measurable value to leadership.`,
      rubric: 'Clarity of thought, active verb usage, measurable quantified outcomes, and self-awareness.'
    },
    {
      question: `Tell me about a time you identified an operational inefficiency in your workflow. How did you implement innovation to fix it?`,
      competency: 'Continuous Improvement',
      type: `${typeKey.toUpperCase()} • Innovation`,
      situation: `Our team spent 10+ hours per week manually compiling fragmented status reports across spreadsheets.`,
      task: `Eliminate redundant administrative overhead and improve reporting visibility for executives.`,
      action: `Built an automated dashboard unifying operational data feeds in real-time, training team members on the new workflow.`,
      result: `Saved 40+ engineering hours monthly and accelerated executive decision cycles from days to minutes.`,
      rubric: 'Initiative, resourcefulness, technology adoption, and quantifiable time savings.'
    }
  ];
}

// 2. Application State
const state = {
  currentRole: 'software-engineer',
  currentType: 'behavioral',
  currentLevel: 'senior',
  questions: [],
  currentIndex: 0,
  
  // Timer state
  timerSeconds: 0,
  timerInterval: null,
  isTimerRunning: false,

  // Notes state
  notesCache: {}
};

// 3. DOM Initialization
document.addEventListener('DOMContentLoaded', () => {
  initDOM();
  loadSessionQuestions();
});

function initDOM() {
  // Session generator button
  document.getElementById('btnGenerateSession')?.addEventListener('click', () => {
    loadSessionQuestions();
  });

  // Navigation
  document.getElementById('btnPrevQuestion')?.addEventListener('click', prevQuestion);
  document.getElementById('btnNextQuestion')?.addEventListener('click', nextQuestion);
  document.getElementById('btnShuffleQuestion')?.addEventListener('click', shuffleQuestions);

  // Audio speech synthesis
  document.getElementById('btnSpeakQuestion')?.addEventListener('click', speakCurrentQuestion);

  // Toggle model answer
  document.getElementById('btnToggleModelAnswer')?.addEventListener('click', toggleModelAnswer);

  // Timer controls
  document.getElementById('btnTimerStart')?.addEventListener('click', startTimer);
  document.getElementById('btnTimerPause')?.addEventListener('click', pauseTimer);
  document.getElementById('btnTimerReset')?.addEventListener('click', resetTimer);

  // Scratchpad scaffolds
  document.getElementById('scaffoldS')?.addEventListener('click', () => insertScaffold('Situation'));
  document.getElementById('scaffoldT')?.addEventListener('click', () => insertScaffold('Task'));
  document.getElementById('scaffoldA')?.addEventListener('click', () => insertScaffold('Action'));
  document.getElementById('scaffoldR')?.addEventListener('click', () => insertScaffold('Result'));

  // Scratchpad auto-save
  const notesArea = document.getElementById('scratchpadNotes');
  if (notesArea) {
    notesArea.addEventListener('input', () => {
      saveCurrentNotes();
    });
  }

  // Export Prep Sheet
  document.getElementById('btnExportPrepSheet')?.addEventListener('click', exportFullPrepSheet);
}

// 4. Load & Render Questions
function loadSessionQuestions() {
  const role = document.getElementById('selectRole')?.value || 'software-engineer';
  const type = document.getElementById('selectType')?.value || 'behavioral';
  const level = document.getElementById('selectLevel')?.value || 'senior';

  state.currentRole = role;
  state.currentType = type;
  state.currentLevel = level;

  const roleBank = QUESTION_DATABASE[role];
  let pool = roleBank && roleBank[type] ? roleBank[type] : null;

  if (!pool || pool.length === 0) {
    pool = getFallbackQuestions(role, type);
  }

  state.questions = pool;
  state.currentIndex = 0;

  renderCurrentQuestion();
  resetTimer();
}

function renderCurrentQuestion() {
  if (state.questions.length === 0) return;

  const q = state.questions[state.currentIndex];

  const dispText = document.getElementById('dispQuestionText');
  const dispCounter = document.getElementById('dispQuestionCounter');
  const dispType = document.getElementById('dispBadgeType');
  const dispComp = document.getElementById('dispBadgeComp');

  const modelSit = document.getElementById('modelSituation');
  const modelTask = document.getElementById('modelTask');
  const modelAct = document.getElementById('modelAction');
  const modelRes = document.getElementById('modelResult');
  const modelRubric = document.getElementById('modelRubric');

  if (dispText) dispText.textContent = q.question;
  if (dispCounter) dispCounter.textContent = `Question ${state.currentIndex + 1} of ${state.questions.length}`;
  if (dispType) dispType.textContent = q.type;
  if (dispComp) dispComp.textContent = q.competency;

  if (modelSit) modelSit.textContent = q.situation;
  if (modelTask) modelTask.textContent = q.task;
  if (modelAct) modelAct.textContent = q.action;
  if (modelRes) modelRes.textContent = q.result;
  if (modelRubric) modelRubric.textContent = q.rubric;

  // Load candidate notes for this question
  loadCurrentNotes();
}

function nextQuestion() {
  if (state.currentIndex < state.questions.length - 1) {
    state.currentIndex++;
  } else {
    state.currentIndex = 0; // wrap around
  }
  renderCurrentQuestion();
  resetTimer();
}

function prevQuestion() {
  if (state.currentIndex > 0) {
    state.currentIndex--;
  } else {
    state.currentIndex = state.questions.length - 1; // wrap around
  }
  renderCurrentQuestion();
  resetTimer();
}

function shuffleQuestions() {
  // Fisher-Yates shuffle
  for (let i = state.questions.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [state.questions[i], state.questions[j]] = [state.questions[j], state.questions[i]];
  }
  state.currentIndex = 0;
  renderCurrentQuestion();
  resetTimer();
}

// 5. Web Speech API (Read Aloud)
function speakCurrentQuestion() {
  if (!('speechSynthesis' in window)) {
    alert('Web Speech API is not supported in this browser.');
    return;
  }

  const q = state.questions[state.currentIndex];
  if (!q) return;

  // Cancel any ongoing speech
  window.speechSynthesis.cancel();

  const utterance = new SpeechSynthesisUtterance(q.question);
  utterance.rate = 0.95;
  utterance.pitch = 1.0;

  const btn = document.getElementById('btnSpeakQuestion');
  if (btn) btn.textContent = '🔊 Speaking...';

  utterance.onend = () => {
    if (btn) btn.textContent = '🔊 Read Aloud';
  };

  utterance.onerror = () => {
    if (btn) btn.textContent = '🔊 Read Aloud';
  };

  window.speechSynthesis.speak(utterance);
}

// 6. Model Answer Drawer Toggle
function toggleModelAnswer() {
  const body = document.getElementById('modelAnswerBody');
  const btn = document.getElementById('btnToggleModelAnswer');
  if (!body || !btn) return;

  if (body.style.display === 'none') {
    body.style.display = 'flex';
    btn.textContent = 'Hide Answer';
  } else {
    body.style.display = 'none';
    btn.textContent = 'Show Answer';
  }
}

// 7. Interactive Stopwatch Timer
function startTimer() {
  if (state.isTimerRunning) return;

  state.isTimerRunning = true;
  state.timerInterval = setInterval(() => {
    state.timerSeconds++;
    updateTimerDisplay();
  }, 1000);
}

function pauseTimer() {
  if (!state.isTimerRunning) return;

  state.isTimerRunning = false;
  clearInterval(state.timerInterval);
}

function resetTimer() {
  pauseTimer();
  state.timerSeconds = 0;
  updateTimerDisplay();
}

function updateTimerDisplay() {
  const clock = document.getElementById('timerClock');
  const pace = document.getElementById('timerPaceStatus');
  if (!clock) return;

  const mins = Math.floor(state.timerSeconds / 60);
  const secs = state.timerSeconds % 60;
  const formatted = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;

  clock.textContent = formatted;

  // Color & Pacing Indicator
  clock.classList.remove('pace-green', 'pace-amber', 'pace-red');

  if (state.timerSeconds < 120) {
    clock.classList.add('pace-green');
    if (pace) pace.textContent = 'Building Context & Actions (Optimal)';
  } else if (state.timerSeconds <= 180) {
    clock.classList.add('pace-amber');
    if (pace) pace.textContent = 'Delivering Results (Wrap Up)';
  } else {
    clock.classList.add('pace-red');
    if (pace) pace.textContent = 'Over 3:00 Minutes (Answer Too Long)';
  }
}

// 8. Candidate Scratchpad & Auto-Save
function getKeyForCurrentQuestion() {
  return `interview_notes_${state.currentRole}_${state.currentType}_q${state.currentIndex}`;
}

function saveCurrentNotes() {
  const text = document.getElementById('scratchpadNotes')?.value || '';
  const key = getKeyForCurrentQuestion();
  state.notesCache[key] = text;

  try {
    localStorage.setItem(key, text);
  } catch (e) {
    // ignore
  }

  const indicator = document.getElementById('saveStatusIndicator');
  if (indicator) {
    indicator.textContent = 'Saved';
    setTimeout(() => {
      indicator.textContent = 'Auto-saved';
    }, 1500);
  }
}

function loadCurrentNotes() {
  const key = getKeyForCurrentQuestion();
  let saved = state.notesCache[key];

  if (!saved) {
    try {
      saved = localStorage.getItem(key) || '';
    } catch (e) {
      saved = '';
    }
  }

  const notesArea = document.getElementById('scratchpadNotes');
  if (notesArea) {
    notesArea.value = saved;
  }
}

function insertScaffold(starLetter) {
  const area = document.getElementById('scratchpadNotes');
  if (!area) return;

  const prefix = area.value.trim().length > 0 ? '\n\n' : '';
  area.value += `${prefix}[${starLetter.toUpperCase()}]: `;
  area.focus();
  saveCurrentNotes();
}

// 9. Export Prep Sheet
function exportFullPrepSheet() {
  const roleName = document.getElementById('selectRole')?.selectedOptions[0]?.text || state.currentRole;
  const typeName = document.getElementById('selectType')?.selectedOptions[0]?.text || state.currentType;

  let md = `# Interview Preparation Sheet: ${roleName}\n`;
  md += `Type: ${typeName} | Level: ${state.currentLevel.toUpperCase()}\n`;
  md += `Generated: ${new Date().toLocaleDateString()}\n\n---\n\n`;

  state.questions.forEach((q, idx) => {
    const key = `interview_notes_${state.currentRole}_${state.currentType}_q${idx}`;
    let notes = state.notesCache[key] || '';
    try {
      if (!notes) notes = localStorage.getItem(key) || '';
    } catch (e) {}

    md += `## Question ${idx + 1}: ${q.question}\n`;
    md += `**Competency**: ${q.competency} | **Type**: ${q.type}\n\n`;
    md += `### Model Answer (STAR Framework)\n`;
    md += `- **Situation**: ${q.situation}\n`;
    md += `- **Task**: ${q.task}\n`;
    md += `- **Action**: ${q.action}\n`;
    md += `- **Result**: ${q.result}\n\n`;
    md += `*Interviewer Evaluation*: ${q.rubric}\n\n`;
    md += `### Your Notes & Talking Points\n`;
    md += notes ? `${notes}\n\n` : `_No notes recorded._\n\n`;
    md += `---\n\n`;
  });

  const blob = new Blob([md], { type: 'text/markdown;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `Interview_Prep_${state.currentRole}_${state.currentType}.md`;
  a.click();
  URL.revokeObjectURL(url);
}