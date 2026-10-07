// Sales Deck Builder - Client-side Interactive Logic

const SALES_PRESETS = {
  "saas-ai": [
    {
      id: "slide-1",
      type: "problem",
      title: "The Fragmented Enterprise Bottleneck",
      subtitle: "Knowledge workers spend 41% of their week manually coordinating disjointed SaaS silos",
      kicker: "The Burning Problem",
      bgImage: "",
      notes: "Establish alignment: ask the prospect how many internal tickets are delayed due to manual cross-tool data syncs.",
      data: {
        points: [
          {
            title: "Siloed Multi-App Friction",
            desc: "Teams toggle between 14+ disconnected tools (Salesforce, Jira, SAP, Slack), losing context on every handoff."
          },
          {
            title: "Brittle Script Maintenance",
            desc: "Custom RPA scripts and Zapier zaps break constantly whenever target APIs or schemas update."
          },
          {
            title: "Unstructured Data Lockup",
            desc: "Over 80% of corporate knowledge is trapped in PDFs, emails, and ticket threads with zero automated intelligence."
          }
        ]
      }
    },
    {
      id: "slide-2",
      type: "inaction",
      title: "The Staggering Cost of Inaction",
      subtitle: "Delaying automation compounds technical debt and bleeds bottom-line revenue",
      kicker: "Cost of Inaction",
      notes: "Anchor the cost: $4.2M lost annually for a 1,000-person enterprise. Highlight lost deals and employee turnover.",
      data: {
        headlineMetric: "$4.2M",
        headlineLabel: "Average Annual Enterprise Waste in Manual Re-entry & Error Correction",
        consequences: [
          {
            metric: "62 Days",
            title: "Average Deal Delay",
            desc: "Complex quote-to-cash approvals drag due to manual verification between legal, billing, and sales."
          },
          {
            metric: "28% Churn",
            title: "Talent Burnout",
            desc: "Top engineering and operations talent leaves due to repetitive administrative drudgery."
          },
          {
            metric: "3.4x Risk",
            title: "Compliance Exposure",
            desc: "Human data entry error risks severe GDPR, SOC 2, and regulatory audit penalties."
          }
        ]
      }
    },
    {
      id: "slide-3",
      type: "solution",
      title: "The CognitiveFlow Autonomous Solution",
      subtitle: "A deterministic AI orchestration mesh that unifies your systems with zero hallucination",
      kicker: "Our Solution",
      notes: "Frame CognitiveFlow as an intelligence fabric that sits on top of their existing stack without replacing it.",
      data: {
        pillars: [
          {
            title: "Deterministic Reasoning Core",
            desc: "Guarantees 100% compliance with corporate governance policies. Zero hallucinations on critical transactional records."
          },
          {
            title: "Universal Bi-directional Connectors",
            desc: "Connects to 300+ enterprise endpoints (ERP, CRM, SQL) out of the box with sub-second event synchronization."
          },
          {
            title: "Self-Healing Workflows",
            desc: "Autonomous agents dynamically adapt to API updates and schema shifts without breaking downstream automations."
          }
        ]
      }
    },
    {
      id: "slide-4",
      type: "features",
      title: "Product Architecture & Core Capabilities",
      subtitle: "From natural language intent to audited production execution in milliseconds",
      kicker: "Product Demo & Features",
      notes: "Walk through the 3 phases: Ingest, Evaluate against Guardrails, and Atomic API Execution.",
      data: {
        features: [
          {
            title: "1. Visual Canvas & Natural Language",
            badge: "Low-Code / No-Code",
            desc: "Describe desired multi-system workflows in plain English or arrange visual flowchart nodes with drag-and-drop ease."
          },
          {
            title: "2. Real-Time Security Guardrails",
            badge: "SOC 2 & HIPAA",
            desc: "Automated redaction of PII, role-based access tokens, and cryptographic immutable audit trails for every transaction."
          },
          {
            title: "3. Sub-Second Atomic Execution",
            badge: "99.999% SLA",
            desc: "Handles tens of thousands of concurrent operations with instantaneous automated rollback if any step fails."
          }
        ]
      }
    },
    {
      id: "slide-5",
      type: "proof",
      title: "Validated ROI & Enterprise Social Proof",
      subtitle: "Trusted by Fortune 500 engineering and revenue operations leaders worldwide",
      kicker: "Social Proof & Metrics",
      notes: "Quote the Head of Operations at FinTech Global: payback period was reached in under 45 days.",
      data: {
        quote: '"CognitiveFlow replaced 6 months of bespoke integration roadmaps in 12 days. Our operations team automated 140,000 monthly transactions with zero downtime."',
        author: "Sarah Lin &bull; VP Revenue Operations, GlobalFin Corp",
        stats: [
          { val: "78%", label: "Faster Cycle Time" },
          { val: "$1.8M", label: "Year-1 Net Savings" },
          { val: "99.98%", label: "Accuracy Rate" },
          { val: "42 Days", label: "Full Payback Time" }
        ]
      }
    },
    {
      id: "slide-6",
      type: "pricing",
      title: "Enterprise Commercial Packages",
      subtitle: "Predictable value-based pricing designed to scale seamlessly with your workflow volume",
      kicker: "Pricing & Investment",
      notes: "Recommend the Scale tier: it includes dedicated solutions architects and custom connector provisioning.",
      data: {
        tiers: [
          {
            name: "Growth Tier",
            price: "$3,500",
            unit: "per month (billed annually)",
            desc: "Up to 100,000 automated workflow executions, standard connectors, email SLA support."
          },
          {
            name: "Enterprise Scale",
            price: "$8,500",
            unit: "per month (billed annually)",
            featured: true,
            badge: "Recommended",
            desc: "Unlimited workflow executions, dedicated Solutions Architect, SOC 2 Type II audit logs, 99.99% uptime SLA."
          },
          {
            name: "Strategic Sovereign",
            price: "Custom",
            unit: "annual contract",
            desc: "On-premise / VPC air-gapped deployment, custom LLM fine-tuning, 24/7 dedicated incident engineers."
          }
        ],
        terms: "Includes 60-Day Unconditional Money-Back ROI Guarantee &bull; Volume discounting for multi-year contracts.",
        contact: "Enterprise Sales: sales@cognitiveflow.ai &bull; Schedule Deal Desk Call"
      }
    },
    {
      id: "slide-7",
      type: "next-steps",
      title: "Next Steps: 14-Day Pilot Roadmap",
      subtitle: "A low-risk, guided proof-of-concept proving measurable ROI before full commitment",
      kicker: "Call to Action",
      notes: "Close the meeting with a firm commitment to the Day 3 Architecture Workshop.",
      data: {
        steps: [
          {
            day: "Day 1 - 3",
            title: "Architecture & Security Alignment",
            desc: "Review Infosec checklist, configure test environment sandboxes, and map primary bottleneck workflow."
          },
          {
            day: "Day 4 - 8",
            title: "Sandbox Pilot & Integration",
            desc: "Deploy CognitiveFlow on target data stream with your team and run live shadow verification tests."
          },
          {
            day: "Day 9 - 14",
            title: "ROI Review & Production Cutover",
            desc: "Present quantified efficiency report to executive sponsors and transition to full production rollout."
          }
        ],
        ctaText: "Ready to eliminate manual friction? Let's confirm your pilot kickoff date today."
      }
    }
  ],

  "cybersecurity": [
    {
      id: "slide-1",
      type: "problem",
      title: "The Multi-Cloud Attack Surface Explosion",
      subtitle: "Hybrid cloud complexity has rendered perimeter defenses obsolete",
      kicker: "Security Reality",
      notes: "Ask the CISO how many rogue service accounts and unmanaged IAM permissions were created this quarter.",
      data: {
        points: [
          {
            title: "Excessive IAM Entitlements",
            desc: "95% of cloud identities possess permissions they haven't exercised in over 90 days."
          },
          {
            title: "Siloed Alert Fatigue",
            desc: "SecOps teams drown in 3,000+ daily disjointed alerts across AWS, Azure, and Kubernetes."
          },
          {
            title: "Compliance Blind Spots",
            desc: "Audits occur once a quarter while ephemeral cloud infrastructure mutates every single minute."
          }
        ]
      }
    },
    {
      id: "slide-2",
      type: "inaction",
      title: "The Real Cost of a Security Breach",
      subtitle: "A single leaked API credential threatens corporate valuation and customer trust",
      kicker: "Cost of Inaction",
      notes: "The average cost of a critical cloud breach in 2026 reached $4.88M, excluding regulatory fines.",
      data: {
        headlineMetric: "$4.9M",
        headlineLabel: "Average Total Cost of a Cloud Data Breach in Enterprise Infrastructures",
        consequences: [
          {
            metric: "277 Days",
            title: "Breach Lifecycle",
            desc: "Average time required to detect and contain an unauthorized identity movement."
          },
          {
            metric: "-14% Market Cap",
            title: "Valuation Impact",
            desc: "Public brand reputation drop following disclosure of unencrypted customer data."
          },
          {
            metric: "$1.2M Fine",
            title: "Regulatory Penalties",
            desc: "Mandatory statutory penalties under SEC, HIPAA, and GDPR disclosure frameworks."
          }
        ]
      }
    },
    {
      id: "slide-3",
      type: "solution",
      title: "ShieldGuard: Autonomous Zero-Trust Mesh",
      subtitle: "Real-time identity rightsizing, workload shielding, and automated remediation",
      kicker: "The ShieldGuard Mesh",
      notes: "ShieldGuard requires zero agents: it connects purely via native cloud APIs and eBPF kernel telemetry.",
      data: {
        pillars: [
          {
            title: "Continuous Least Privilege",
            desc: "Autonomously strips inactive permissions and enforces just-in-time privilege escalation."
          },
          {
            title: "eBPF Kernel Telemetry",
            desc: "Inspects workload syscalls in real time with sub-1% CPU overhead and zero agent installation."
          },
          {
            title: "Instant 1-Click Remediation",
            desc: "Quarantines anomalous pods and revokes compromised credentials in under 200 milliseconds."
          }
        ]
      }
    },
    {
      id: "slide-4",
      type: "features",
      title: "ShieldGuard Unified Console",
      subtitle: "Single pane of glass across multi-cloud infrastructure and developer pipelines",
      kicker: "Capabilities",
      notes: "Point out our shift-left CI/CD integration blocking vulnerable Terraform code before deployment.",
      data: {
        features: [
          {
            title: "1. Cloud Infrastructure Entitlement (CIEM)",
            badge: "Identity Security",
            desc: "Maps identity relationships across millions of roles, users, and serverless functions."
          },
          {
            title: "2. Cloud Security Posture (CSPM)",
            badge: "Real-time Compliance",
            desc: "Continuous automated benchmarking against SOC 2, ISO 27001, FedRAMP, and NIST 800-53."
          },
          {
            title: "3. Workload Protection (CWPP)",
            badge: "Runtime Defense",
            desc: "Detects cryptominers, container escapes, and reverse shells directly at the kernel layer."
          }
        ]
      }
    },
    {
      id: "slide-5",
      type: "proof",
      title: "Proven Security at Global Scale",
      subtitle: "Protecting over 12 million cloud assets across leading FinTech and SaaS leaders",
      kicker: "Customer Validation",
      notes: "Case study: Apex Health reduced active security alerts by 94% within 14 days of activation.",
      data: {
        quote: '"ShieldGuard eliminated 94% of our false positives on day one. We caught and isolated a supply-chain package vulnerability before it ever reached production."',
        author: "Marcus Vance &bull; Chief Information Security Officer, Apex Health",
        stats: [
          { val: "94%", label: "Alert Noise Reduction" },
          { val: "< 200ms", label: "Remediation Time" },
          { val: "100%", label: "Audit Readiness" },
          { val: "15 min", label: "Zero-Agent Setup" }
        ]
      }
    },
    {
      id: "slide-6",
      type: "pricing",
      title: "Subscription Tiers & Workload Sizing",
      subtitle: "Transparent workload-based pricing without per-user penalties",
      kicker: "Investment",
      notes: "All plans include unlimited users so your entire SecOps, DevOps, and compliance teams can collaborate.",
      data: {
        tiers: [
          {
            name: "Cloud Defense",
            price: "$4,200",
            unit: "per month (up to 500 workloads)",
            desc: "CSPM and CIEM scanning, automated compliance reports, Slack and Jira integrations."
          },
          {
            name: "Complete Mesh",
            price: "$9,800",
            unit: "per month (up to 2,000 workloads)",
            featured: true,
            badge: "Most Popular",
            desc: "Includes CWPP runtime defense, automated 1-click remediation, dedicated technical account manager."
          },
          {
            name: "Enterprise Defense",
            price: "Custom",
            unit: "enterprise volume",
            desc: "Dedicated single-tenant SaaS or on-prem deployment, custom rule authoring, 24/7 SOC incident response."
          }
        ],
        terms: "Annual contract with 99.99% service SLA &bull; Comprehensive SOC 2 audit package provided.",
        contact: "Contact SecOps: security-sales@shieldguard.io &bull; Book Security Architecture Review"
      }
    },
    {
      id: "slide-7",
      type: "next-steps",
      title: "Immediate Risk Assessment: Next Steps",
      subtitle: "Connect your cloud in read-only mode and discover existing blind spots in 15 minutes",
      kicker: "Action Plan",
      notes: "Offer a free 14-day Cloud Security Risk Audit with no obligation to purchase.",
      data: {
        steps: [
          {
            day: "Step 1: Read-Only Connect",
            title: "15-Minute IAM Role Onboarding",
            desc: "Connect your AWS / Azure account via read-only CloudFormation template. Zero agent installation."
          },
          {
            day: "Step 2: Automated Risk Scan",
            title: "Complete Attack Surface Analysis",
            desc: "ShieldGuard scans your identities and workloads, compiling an executive security posture report."
          },
          {
            day: "Step 3: Executive Findings Call",
            title: "Remediation Strategy Review",
            desc: "Walk through high-risk findings together and review automated remediation blueprints."
          }
        ],
        ctaText: "Launch your complimentary Cloud Security Assessment today."
      }
    }
  ],

  "fintech-infra": [
    {
      id: "slide-1",
      type: "problem",
      title: "Legacy Banking Rails Are Choking Global Commerce",
      subtitle: "Batch-processed settlement times and fragmented clearing networks kill growth",
      kicker: "The Fintech Friction",
      notes: "Ask the CFO how many days cash sits locked in transit across international subsidiary accounts.",
      data: {
        points: [
          {
            title: "3 to 5 Day Settlement Lag",
            desc: "Traditional correspondent banking traps working capital in transit and delays payouts."
          },
          {
            title: "Exorbitant Foreign Exchange Spreads",
            desc: "Intermediary bank hops shave 2.5% to 4.5% off every cross-border merchant payout."
          },
          {
            title: "Manual Multi-Currency Reconciliation",
            desc: "Finance teams waste hundreds of hours monthly balancing spreadsheets across 20+ bank portals."
          }
        ]
      }
    },
    {
      id: "slide-2",
      type: "inaction",
      title: "The Financial Drain of Outdated Rails",
      subtitle: "Slow payouts drive merchant churn and strangle operational cash liquidity",
      kicker: "Cost of Inaction",
      notes: "In fast-paced creator and gig economy platforms, payout speed is the number one driver of merchant retention.",
      data: {
        headlineMetric: "$2.1M",
        headlineLabel: "Annual Capital Drag in Idle Float & FX Leakage per $100M Transaction Volume",
        consequences: [
          {
            metric: "34% Churn",
            title: "Merchant Attrition",
            desc: "Marketplace sellers abandon platforms that take longer than 24 hours to settle funds."
          },
          {
            metric: "3.2% Spread",
            title: "Hidden Bank Fees",
            desc: "Unnecessary FX intermediary take-rates reducing your effective gross profit margins."
          },
          {
            metric: "18 Days",
            title: "Month-End Close",
            desc: "Reconciliation gridlock delaying financial reports and strategic board presentations."
          }
        ]
      }
    },
    {
      id: "slide-3",
      type: "solution",
      title: "VelocityPay: Real-Time Programmable Treasury",
      subtitle: "Single API for instant global clearing, automated ledgering, and multi-currency accounts",
      kicker: "The Velocity Engine",
      notes: "Explain that VelocityPay operates direct clearing connections across FedNow, SEPA Instant, and Faster Payments.",
      data: {
        pillars: [
          {
            title: "Sub-Second Global Settlement",
            desc: "Direct integration with instant payment rails enabling real-time 24/7/365 money movement."
          },
          {
            title: "Virtual Multi-Currency IBANs",
            desc: "Issue localized bank accounts in 42 currencies with local domestic clearing."
          },
          {
            title: "Double-Entry Immutable Ledger",
            desc: "Real-time ledger updates that automate 100% of reconciliation with zero human intervention."
          }
        ]
      }
    },
    {
      id: "slide-4",
      type: "features",
      title: "Developer-First Treasury Infrastructure",
      subtitle: "Engineered for 99.999% availability, idempotent transactions, and rapid developer velocity",
      kicker: "API Capabilities",
      notes: "Our sandbox provides live mock rails and webhook generators to build in an afternoon.",
      data: {
        features: [
          {
            title: "1. Unified Payout API",
            badge: "Instant Rails",
            desc: "Execute single or batch payouts worldwide via FedNow, RTP, SEPA, and local ACH in one API call."
          },
          {
            title: "2. Automated FX Routing",
            badge: "Institutional Rates",
            desc: "Dynamic smart routing accesses wholesale interbank FX liquidity with transparent sub-0.2% spreads."
          },
          {
            title: "3. Continuous Compliance & KYC",
            badge: "Real-time AML",
            desc: "Automated sanctions screening, fraud scoring, and transaction monitoring built into the payment flow."
          }
        ]
      }
    },
    {
      id: "slide-5",
      type: "proof",
      title: "Global Scale & Institutional Trust",
      subtitle: "Powering billions in annual volume for world-class marketplaces and platforms",
      kicker: "Traction & Trust",
      notes: "Case study: OmniMarket increased global seller retention by 42% after switching to instant payouts.",
      data: {
        quote: '"VelocityPay transformed our marketplace economics. We cut seller payout times from 4 days to 4 seconds, saving over $1.4M in annual FX intermediary fees."',
        author: "David Chen &bull; Chief Financial Officer, OmniMarket Global",
        stats: [
          { val: "< 4s", label: "Average Settlement Time" },
          { val: "$1.4M", label: "Annual FX Savings" },
          { val: "99.999%", label: "Uptime SLA" },
          { val: "42", label: "Currencies Supported" }
        ]
      }
    },
    {
      id: "slide-6",
      type: "pricing",
      title: "Transparent Volume-Based Pricing",
      subtitle: "Zero hidden intermediary fees with declining basis points as your platform expands",
      kicker: "Commercial Model",
      notes: "Our model scales with your platform volume: no setup fees or maintenance surcharges.",
      data: {
        tiers: [
          {
            name: "Platform Growth",
            price: "0.45% + $0.20",
            unit: "per completed transaction",
            desc: "Access to 42 currencies, domestic ACH/SEPA, standard virtual accounts, webhook alerts."
          },
          {
            name: "Scale Infrastructure",
            price: "0.25% + $0.10",
            unit: "per completed transaction",
            featured: true,
            badge: "Best Value",
            desc: "Instant rails (FedNow/RTP), dedicated virtual IBANs, automated FX hedging, 24/7 API support."
          },
          {
            name: "Global Enterprise",
            price: "Custom BPS",
            unit: "volume pricing (> $50M/mo)",
            desc: "Direct scheme participation, bespoke clearing windows, dedicated Treasury Operations Director."
          }
        ],
        terms: "No monthly account maintenance fees &bull; Real-time balance reporting &bull; Regulatory insured.",
        contact: "Treasury Inquiries: partnerships@velocitypay.io &bull; Talk with Payments Architect"
      }
    },
    {
      id: "slide-7",
      type: "next-steps",
      title: "Deployment Roadmap & Sandbox Access",
      subtitle: "Get your API keys and test instant payouts in sandbox within 30 minutes",
      kicker: "Next Steps",
      notes: "Offer immediate sandbox credentials right on the call.",
      data: {
        steps: [
          {
            day: "Step 1: Sandbox Keys",
            title: "30-Minute API Onboarding",
            desc: "Instant access to sandbox API keys, interactive webhooks, and Postman collection."
          },
          {
            day: "Step 2: Pilot Transactions",
            title: "Treasury Workflow Configuration",
            desc: "Simulate test payouts, foreign exchange conversions, and ledger balances in staging."
          },
          {
            day: "Step 3: Commercial Launch",
            title: "KYC Verification & Production Go-Live",
            desc: "Finalize compliance verification and switch environment credentials to live production rails."
          }
        ],
        ctaText: "Begin your Sandbox integration today: developer.velocitypay.io"
      }
    }
  ]
};

// Global App State
let currentPreset = "saas-ai";
let deck = JSON.parse(JSON.stringify(SALES_PRESETS[currentPreset]));
let activeSlideIndex = 0;
let presenterTimerInterval = null;
let presenterSeconds = 0;

document.addEventListener("DOMContentLoaded", () => {
  initDOM();
  renderThumbnails();
  renderActiveSlide();
  renderInspector();
});

function initDOM() {
  // Preset selector
  const select = document.getElementById("sales-preset-select");
  if (select) {
    select.addEventListener("change", (e) => {
      currentPreset = e.target.value;
      if (SALES_PRESETS[currentPreset]) {
        deck = JSON.parse(JSON.stringify(SALES_PRESETS[currentPreset]));
        activeSlideIndex = 0;
        renderThumbnails();
        renderActiveSlide();
        renderInspector();
        showToast("Loaded Sales Pitch Template!");
      }
    });
  }

  // Slide actions
  document.getElementById("btn-add-slide")?.addEventListener("click", handleAddSlide);
  document.getElementById("btn-move-up")?.addEventListener("click", handleMoveUp);
  document.getElementById("btn-move-down")?.addEventListener("click", handleMoveDown);
  document.getElementById("btn-delete-slide")?.addEventListener("click", handleDeleteSlide);

  // Presenter & Print
  document.getElementById("btn-launch-presenter")?.addEventListener("click", startPresenterMode);
  document.getElementById("btn-print-deck")?.addEventListener("click", triggerPrintBrochure);

  // JSON
  document.getElementById("btn-export-json")?.addEventListener("click", exportDeckJSON);
  document.getElementById("input-import-json")?.addEventListener("change", importDeckJSON);

  // Presenter HUD
  document.getElementById("hud-prev")?.addEventListener("click", () => navigatePresenter(-1));
  document.getElementById("hud-next")?.addEventListener("click", () => navigatePresenter(1));
  document.getElementById("hud-exit")?.addEventListener("click", exitPresenterMode);
  document.getElementById("hud-notes-toggle")?.addEventListener("click", togglePresenterNotes);

  // Keyboard navigation
  document.addEventListener("keydown", handleKeyNavigation);

  // Notes listener
  const notesInput = document.getElementById("slide-notes-input");
  if (notesInput) {
    notesInput.addEventListener("input", (e) => {
      if (deck[activeSlideIndex]) {
        deck[activeSlideIndex].notes = e.target.value;
      }
    });
  }
}

function handleKeyNavigation(e) {
  const presenter = document.getElementById("presenter-fullscreen-container");
  if (presenter && presenter.classList.contains("active")) {
    if (e.key === "ArrowRight" || e.key === " " || e.key === "PageDown") {
      e.preventDefault();
      navigatePresenter(1);
    } else if (e.key === "ArrowLeft" || e.key === "PageUp") {
      e.preventDefault();
      navigatePresenter(-1);
    } else if (e.key === "Escape") {
      e.preventDefault();
      exitPresenterMode();
    }
  }
}

function showToast(msg) {
  const toast = document.getElementById("toast");
  if (!toast) return;
  toast.textContent = msg;
  toast.style.opacity = "1";
  setTimeout(() => {
    toast.style.opacity = "0";
  }, 2200);
}

// -------------------------------------------------------------
// Render Thumbnails
// -------------------------------------------------------------
function renderThumbnails() {
  const thumbList = document.getElementById("slide-thumb-list");
  const slideCountBadge = document.getElementById("slide-count-badge");
  if (!thumbList) return;

  thumbList.innerHTML = "";
  if (slideCountBadge) slideCountBadge.textContent = deck.length;

  deck.forEach((slide, idx) => {
    const card = document.createElement("div");
    card.className = `slide-thumb-card ${idx === activeSlideIndex ? "active" : ""}`;
    card.onclick = () => {
      activeSlideIndex = idx;
      renderThumbnails();
      renderActiveSlide();
      renderInspector();
    };

    const num = document.createElement("div");
    num.className = "slide-thumb-number";
    num.textContent = idx + 1;

    const info = document.createElement("div");
    info.className = "slide-thumb-info";

    const title = document.createElement("div");
    title.className = "slide-thumb-title";
    title.textContent = slide.title || `Slide ${idx + 1}`;

    const type = document.createElement("div");
    type.className = "slide-thumb-type";
    type.textContent = slide.type.toUpperCase();

    info.appendChild(title);
    info.appendChild(type);
    card.appendChild(num);
    card.appendChild(info);
    thumbList.appendChild(card);
  });

  const activeTag = document.getElementById("active-slide-type-tag");
  if (activeTag && deck[activeSlideIndex]) {
    activeTag.textContent = deck[activeSlideIndex].type.toUpperCase();
  }
}

// -------------------------------------------------------------
// Render Active Slide
// -------------------------------------------------------------
function renderActiveSlide() {
  const canvas = document.getElementById("slide-canvas-stage");
  const content = document.getElementById("slide-canvas-content");
  const slide = deck[activeSlideIndex];
  if (!canvas || !content || !slide) return;

  if (slide.bgImage) {
    canvas.style.backgroundImage = `url('${slide.bgImage}')`;
  } else {
    canvas.style.backgroundImage = "none";
  }

  content.innerHTML = generateSlideHTML(slide);

  // Sync presenter if open
  const presContainer = document.getElementById("presenter-fullscreen-container");
  if (presContainer && presContainer.classList.contains("active")) {
    renderPresenterSlide();
  }
}

// -------------------------------------------------------------
// Generate Slide HTML
// -------------------------------------------------------------
function generateSlideHTML(slide) {
  const kicker = slide.kicker ? `<div class="slide-kicker">${escapeHtml(slide.kicker)}</div>` : "";
  const title = `<h2>${escapeHtml(slide.title || "")}</h2>`;
  const subtitle = slide.subtitle ? `<p>${escapeHtml(slide.subtitle)}</p>` : "";

  let bodyHTML = "";

  switch (slide.type) {
    case "problem": {
      const points = slide.data?.points || [];
      const cards = points.map(pt => `
        <div class="feature-card" style="border-top-color: #ef4444;">
          <h4 style="font-size: 0.95rem; color: #ffffff; margin: 0 0 0.35rem;">⚠️ ${escapeHtml(pt.title || "")}</h4>
          <p style="font-size: 0.76rem; color: rgba(255,255,255,0.75); line-height: 1.4; margin: 0;">${escapeHtml(pt.desc || "")}</p>
        </div>
      `).join("");

      bodyHTML = `
        <div style="flex: 1; display: flex; flex-direction: column; justify-content: center;">
          <div class="split-col-grid">${cards}</div>
        </div>
      `;
      break;
    }

    case "inaction": {
      const d = slide.data || {};
      const conseq = (d.consequences || []).map(c => `
        <div class="canvas-card" style="border-top: 3px solid #f87171;">
          <div style="font-size: 1.25rem; font-weight: 800; color: #f87171; margin-bottom: 0.2rem;">${escapeHtml(c.metric || "")}</div>
          <div style="font-size: 0.85rem; font-weight: 700; color: #ffffff; margin-bottom: 0.25rem;">${escapeHtml(c.title || "")}</div>
          <p style="font-size: 0.73rem; color: rgba(255,255,255,0.7); line-height: 1.35; margin: 0;">${escapeHtml(c.desc || "")}</p>
        </div>
      `).join("");

      bodyHTML = `
        <div style="flex: 1; display: flex; flex-direction: column; justify-content: space-between;">
          <div class="metric-hero-box" style="margin-bottom: 0.65rem;">
            <div class="metric-hero-val">${escapeHtml(d.headlineMetric || "")}</div>
            <div style="font-size: 0.8rem; color: #fca5a5; font-weight: 600;">${escapeHtml(d.headlineLabel || "")}</div>
          </div>
          <div class="split-col-grid" style="margin-top: 0;">${conseq}</div>
        </div>
      `;
      break;
    }

    case "solution": {
      const pillars = slide.data?.pillars || [];
      const cards = pillars.map(pil => `
        <div class="feature-card" style="border-top-color: #3b82f6;">
          <h4 style="font-size: 0.95rem; color: #ffffff; margin: 0 0 0.35rem;">✨ ${escapeHtml(pil.title || "")}</h4>
          <p style="font-size: 0.76rem; color: rgba(255,255,255,0.75); line-height: 1.4; margin: 0;">${escapeHtml(pil.desc || "")}</p>
        </div>
      `).join("");

      bodyHTML = `
        <div style="flex: 1; display: flex; flex-direction: column; justify-content: center;">
          <div class="split-col-grid">${cards}</div>
        </div>
      `;
      break;
    }

    case "features": {
      const features = slide.data?.features || [];
      const cards = features.map(f => `
        <div class="canvas-card" style="border-top: 3px solid #06b6d4; display: flex; flex-direction: column; justify-content: space-between;">
          <div>
            <span style="font-size: 0.68rem; font-weight: 700; background: rgba(6,182,212,0.2); color: #67e8f9; padding: 0.2rem 0.5rem; border-radius: 9999px;">
              ${escapeHtml(f.badge || "")}
            </span>
            <h4 style="font-size: 0.95rem; color: #ffffff; margin: 0.4rem 0 0.35rem;">${escapeHtml(f.title || "")}</h4>
            <p style="font-size: 0.74rem; color: rgba(255,255,255,0.75); line-height: 1.35; margin: 0;">${escapeHtml(f.desc || "")}</p>
          </div>
        </div>
      `).join("");

      bodyHTML = `
        <div style="flex: 1; display: flex; flex-direction: column; justify-content: center;">
          <div class="split-col-grid">${cards}</div>
        </div>
      `;
      break;
    }

    case "proof": {
      const d = slide.data || {};
      const stats = (d.stats || []).map(s => `
        <div style="background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.08); border-radius: 6px; padding: 0.65rem; text-align: center;">
          <div style="font-size: 1.35rem; font-weight: 800; color: #10b981;">${escapeHtml(s.val || "")}</div>
          <div style="font-size: 0.7rem; color: #cbd5e1; text-transform: uppercase;">${escapeHtml(s.label || "")}</div>
        </div>
      `).join("");

      bodyHTML = `
        <div style="flex: 1; display: flex; flex-direction: column; justify-content: space-between;">
          <div class="quote-box" style="margin-bottom: 0.75rem;">
            <p style="font-size: 0.875rem; line-height: 1.45; margin: 0;">${escapeHtml(d.quote || "")}</p>
            <div style="font-size: 0.75rem; color: #a7f3d0; margin-top: 0.5rem; font-weight: 600;">${escapeHtml(d.author || "")}</div>
          </div>
          <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 0.75rem;">
            ${stats}
          </div>
        </div>
      `;
      break;
    }

    case "pricing": {
      const tiers = slide.data?.tiers || [];
      const terms = slide.data?.terms || "";
      const contact = slide.data?.contact || "";

      const cards = tiers.map(t => `
        <div class="canvas-card ${t.featured ? "featured" : ""}" style="position: relative; border-color: ${t.featured ? "#3b82f6" : "rgba(255,255,255,0.1)"}; display: flex; flex-direction: column; justify-content: space-between;">
          ${t.badge ? `<div style="position: absolute; top: -9px; right: 12px; background: #3b82f6; color: #ffffff; font-size: 0.65rem; font-weight: 700; padding: 0.15rem 0.5rem; border-radius: 9999px;">${escapeHtml(t.badge)}</div>` : ""}
          <div>
            <div style="font-size: 0.85rem; font-weight: 700; color: #ffffff;">${escapeHtml(t.name || "")}</div>
            <div style="font-size: 1.35rem; font-weight: 800; color: #3b82f6; margin: 0.35rem 0 0.1rem;">${escapeHtml(t.price || "")}</div>
            <div style="font-size: 0.7rem; color: rgba(255,255,255,0.6); text-transform: uppercase;">${escapeHtml(t.unit || "")}</div>
          </div>
          <div style="font-size: 0.75rem; color: rgba(255,255,255,0.8); margin-top: 0.6rem; line-height: 1.35;">${escapeHtml(t.desc || "")}</div>
        </div>
      `).join("");

      bodyHTML = `
        <div style="flex: 1; display: flex; flex-direction: column; justify-content: space-between;">
          <div class="split-col-grid" style="margin-top: 0.5rem;">${cards}</div>
          <div class="canvas-card" style="margin-top: 0.75rem; padding: 0.6rem 0.9rem; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 0.5rem;">
            <div style="font-size: 0.75rem; color: rgba(255,255,255,0.7);">${escapeHtml(terms)}</div>
            <div style="font-size: 0.8rem; font-weight: 700; color: #38bdf8;">${escapeHtml(contact)}</div>
          </div>
        </div>
      `;
      break;
    }

    case "next-steps": {
      const steps = slide.data?.steps || [];
      const cta = slide.data?.ctaText || "";

      const cards = steps.map(st => `
        <div class="canvas-card" style="border-top: 3px solid #10b981;">
          <span style="font-size: 0.68rem; font-weight: 700; color: #10b981; text-transform: uppercase;">${escapeHtml(st.day || "")}</span>
          <h4 style="font-size: 0.9rem; color: #ffffff; margin: 0.25rem 0 0.35rem;">${escapeHtml(st.title || "")}</h4>
          <p style="font-size: 0.74rem; color: rgba(255,255,255,0.75); line-height: 1.35; margin: 0;">${escapeHtml(st.desc || "")}</p>
        </div>
      `).join("");

      bodyHTML = `
        <div style="flex: 1; display: flex; flex-direction: column; justify-content: space-between;">
          <div class="split-col-grid" style="margin-top: 0.5rem;">${cards}</div>
          <div class="canvas-card" style="margin-top: 0.75rem; text-align: center; background: rgba(59,130,246,0.1); border-color: rgba(59,130,246,0.3); padding: 0.85rem;">
            <div style="font-size: 0.95rem; font-weight: 700; color: #ffffff;">🚀 ${escapeHtml(cta)}</div>
          </div>
        </div>
      `;
      break;
    }

    default: {
      bodyHTML = `<div class="canvas-card"><p>${escapeHtml(JSON.stringify(slide.data || {}))}</p></div>`;
      break;
    }
  }

  return `
    <div class="slide-header-box">
      ${kicker}
      ${title}
      ${subtitle}
    </div>
    ${bodyHTML}
  `;
}

// -------------------------------------------------------------
// Render Inspector Form
// -------------------------------------------------------------
function renderInspector() {
  const container = document.getElementById("inspector-form-fields");
  const slideLabel = document.getElementById("inspector-slide-label");
  const notesInput = document.getElementById("slide-notes-input");
  const slide = deck[activeSlideIndex];
  if (!container || !slide) return;

  if (slideLabel) {
    slideLabel.textContent = `Slide ${activeSlideIndex + 1}: ${slide.type.toUpperCase()}`;
  }
  if (notesInput) {
    notesInput.value = slide.notes || "";
  }

  container.innerHTML = "";

  // Common Header fields
  const commonRow = document.createElement("div");
  commonRow.className = "inspector-grid two-col";
  commonRow.innerHTML = `
    <div>
      <label style="font-size: 0.78rem; font-weight: 600; color: var(--text-secondary);">Slide Title</label>
      <input type="text" class="form-control" id="inp-title" value="${escapeHtml(slide.title || "")}">
    </div>
    <div>
      <label style="font-size: 0.78rem; font-weight: 600; color: var(--text-secondary);">Subtitle</label>
      <input type="text" class="form-control" id="inp-subtitle" value="${escapeHtml(slide.subtitle || "")}">
    </div>
    <div>
      <label style="font-size: 0.78rem; font-weight: 600; color: var(--text-secondary);">Top Kicker Badge</label>
      <input type="text" class="form-control" id="inp-kicker" value="${escapeHtml(slide.kicker || "")}">
    </div>
    <div>
      <label style="font-size: 0.78rem; font-weight: 600; color: var(--text-secondary);">Background Image URL</label>
      <input type="text" class="form-control" id="inp-bg" value="${escapeHtml(slide.bgImage || "")}">
    </div>
  `;
  container.appendChild(commonRow);

  commonRow.querySelector("#inp-title").addEventListener("input", (e) => {
    slide.title = e.target.value;
    renderActiveSlide();
    renderThumbnails();
  });
  commonRow.querySelector("#inp-subtitle").addEventListener("input", (e) => {
    slide.subtitle = e.target.value;
    renderActiveSlide();
  });
  commonRow.querySelector("#inp-kicker").addEventListener("input", (e) => {
    slide.kicker = e.target.value;
    renderActiveSlide();
  });
  commonRow.querySelector("#inp-bg").addEventListener("input", (e) => {
    slide.bgImage = e.target.value;
    renderActiveSlide();
  });

  // Type specific JSON editor
  const box = document.createElement("div");
  box.style.marginTop = "0.75rem";
  box.innerHTML = `<label style="font-size: 0.78rem; font-weight: 700; color: #3b82f6; display: block; margin-bottom: 0.5rem;">Slide Content Structure (JSON Editable):</label>`;
  const ta = document.createElement("textarea");
  ta.className = "form-control";
  ta.rows = 7;
  ta.style.fontFamily = "monospace";
  ta.style.fontSize = "0.75rem";
  ta.value = JSON.stringify(slide.data || {}, null, 2);
  ta.addEventListener("input", (e) => {
    try {
      slide.data = JSON.parse(e.target.value);
      renderActiveSlide();
    } catch (err) {
      // typing
    }
  });
  box.appendChild(ta);
  container.appendChild(box);
}

// -------------------------------------------------------------
// Slide Manipulations
// -------------------------------------------------------------
function handleAddSlide() {
  const newSlide = {
    id: `slide-${Date.now()}`,
    type: "features",
    title: "Additional Architecture Capability",
    subtitle: "Custom workflow feature overview",
    kicker: "Feature Deep-Dive",
    notes: "Present the details of this workflow capability.",
    data: {
      features: [
        {
          title: "Custom Data Sync",
          badge: "Enterprise",
          desc: "Automated continuous sync across proprietary internal database clusters."
        },
        {
          title: "Real-time Telemetry",
          badge: "Observability",
          desc: "Sub-millisecond logs and metrics exported directly into Datadog or Splunk."
        },
        {
          title: "Dedicated Sandbox",
          badge: "Developer Tooling",
          desc: "Zero-risk staging environment to test mutations before production cutover."
        }
      ]
    }
  };
  deck.splice(activeSlideIndex + 1, 0, newSlide);
  activeSlideIndex += 1;
  renderThumbnails();
  renderActiveSlide();
  renderInspector();
  showToast("Slide added!");
}

function handleMoveUp() {
  if (activeSlideIndex > 0) {
    const temp = deck[activeSlideIndex];
    deck[activeSlideIndex] = deck[activeSlideIndex - 1];
    deck[activeSlideIndex - 1] = temp;
    activeSlideIndex -= 1;
    renderThumbnails();
    renderActiveSlide();
    renderInspector();
  }
}

function handleMoveDown() {
  if (activeSlideIndex < deck.length - 1) {
    const temp = deck[activeSlideIndex];
    deck[activeSlideIndex] = deck[activeSlideIndex + 1];
    deck[activeSlideIndex + 1] = temp;
    activeSlideIndex += 1;
    renderThumbnails();
    renderActiveSlide();
    renderInspector();
  }
}

function handleDeleteSlide() {
  if (deck.length <= 1) {
    alert("You must keep at least one slide in your presentation.");
    return;
  }
  if (confirm("Delete active slide?")) {
    deck.splice(activeSlideIndex, 1);
    if (activeSlideIndex >= deck.length) {
      activeSlideIndex = deck.length - 1;
    }
    renderThumbnails();
    renderActiveSlide();
    renderInspector();
    showToast("Slide deleted.");
  }
}

// -------------------------------------------------------------
// Presenter Mode
// -------------------------------------------------------------
function startPresenterMode() {
  const container = document.getElementById("presenter-fullscreen-container");
  if (!container) return;
  container.classList.add("active");
  renderPresenterSlide();

  presenterSeconds = 0;
  updateTimerDisplay();
  if (presenterTimerInterval) clearInterval(presenterTimerInterval);
  presenterTimerInterval = setInterval(() => {
    presenterSeconds += 1;
    updateTimerDisplay();
  }, 1000);

  if (container.requestFullscreen) {
    container.requestFullscreen().catch(() => {});
  }
}

function exitPresenterMode() {
  const container = document.getElementById("presenter-fullscreen-container");
  if (!container) return;
  container.classList.remove("active");
  if (presenterTimerInterval) clearInterval(presenterTimerInterval);
  if (document.fullscreenElement && document.exitFullscreen) {
    document.exitFullscreen().catch(() => {});
  }
}

function renderPresenterSlide() {
  const content = document.getElementById("presenter-content");
  const stage = document.getElementById("presenter-stage");
  const counter = document.getElementById("hud-counter");
  const notesText = document.getElementById("presenter-notes-text");
  const slide = deck[activeSlideIndex];
  if (!content || !stage || !slide) return;

  if (slide.bgImage) {
    stage.style.backgroundImage = `url('${slide.bgImage}')`;
  } else {
    stage.style.backgroundImage = "none";
  }

  content.innerHTML = generateSlideHTML(slide);

  if (counter) {
    counter.textContent = `${activeSlideIndex + 1} / ${deck.length}`;
  }
  if (notesText) {
    notesText.textContent = slide.notes || "No speaker notes recorded.";
  }
}

function navigatePresenter(dir) {
  const newIndex = activeSlideIndex + dir;
  if (newIndex >= 0 && newIndex < deck.length) {
    activeSlideIndex = newIndex;
    renderPresenterSlide();
    renderThumbnails();
    renderActiveSlide();
    renderInspector();
  }
}

function togglePresenterNotes() {
  const notes = document.getElementById("presenter-speaker-notes");
  if (notes) {
    notes.classList.toggle("active");
  }
}

function updateTimerDisplay() {
  const timer = document.getElementById("hud-timer");
  if (!timer) return;
  const mins = String(Math.floor(presenterSeconds / 60)).padStart(2, "0");
  const secs = String(presenterSeconds % 60).padStart(2, "0");
  timer.textContent = `${mins}:${secs}`;
}

// -------------------------------------------------------------
// Print / PDF Export
// -------------------------------------------------------------
function triggerPrintBrochure() {
  const printContainer = document.getElementById("print-proposal-container");
  if (!printContainer) return;

  let pagesHTML = `
    <div style="text-align: center; margin-bottom: 2.5rem; border-bottom: 2px solid #2563eb; padding-bottom: 1.5rem;">
      <h1 style="color: #2563eb; font-size: 2.2rem; margin: 0;">CognitiveFlow AI &bull; Executive Sales Pitch Deck</h1>
      <p style="color: #475569; font-size: 1rem; margin-top: 0.5rem;">Template: ${escapeHtml(currentPreset.toUpperCase())}</p>
    </div>
  `;

  deck.forEach((slide, idx) => {
    pagesHTML += `
      <div class="print-slide-page">
        <div style="font-size: 0.75rem; text-transform: uppercase; color: #2563eb; font-weight: 700; margin-bottom: 0.35rem;">Slide ${idx + 1} &bull; ${escapeHtml(slide.type.toUpperCase())}</div>
        <h2 style="font-size: 1.6rem; margin: 0 0 0.4rem; color: #0f172a;">${escapeHtml(slide.title || "")}</h2>
        <p style="font-size: 0.95rem; color: #475569; margin: 0 0 1.25rem;">${escapeHtml(slide.subtitle || "")}</p>
        <div style="padding: 1rem; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px;">
          ${generateSlideHTML(slide)}
        </div>
      </div>
    `;
  });

  printContainer.innerHTML = pagesHTML;
  window.print();
}

// -------------------------------------------------------------
// JSON Export & Import
// -------------------------------------------------------------
function exportDeckJSON() {
  const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(deck, null, 2));
  const downloadAnchor = document.createElement("a");
  downloadAnchor.setAttribute("href", dataStr);
  downloadAnchor.setAttribute("download", `sales-deck-${currentPreset}.json`);
  document.body.appendChild(downloadAnchor);
  downloadAnchor.click();
  downloadAnchor.remove();
  showToast("Sales Deck JSON exported!");
}

function importDeckJSON(e) {
  const file = e.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = (event) => {
    try {
      const imported = JSON.parse(event.target.result);
      if (Array.isArray(imported) && imported.length > 0) {
        deck = imported;
        activeSlideIndex = 0;
        renderThumbnails();
        renderActiveSlide();
        renderInspector();
        showToast("Sales Deck JSON loaded successfully!");
      } else {
        alert("Invalid presentation JSON format.");
      }
    } catch (err) {
      alert("Failed to parse JSON file.");
    }
  };
  reader.readAsText(file);
}

// Escape HTML helper
function escapeHtml(str) {
  if (typeof str !== "string") return str;
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}