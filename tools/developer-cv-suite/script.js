// Developer CV Suite - Logic & Interactive Resume Builder

const SENIOR_SAMPLE = {
  personal: {
    fullName: "Alex Chen",
    role: "Staff Software Engineer • Distributed Systems",
    email: "alex.chen.dev@example.com",
    phone: "+1 (415) 555-0192",
    location: "San Francisco, CA (Open to Remote)",
    portfolio: "https://alexchen.dev",
    github: "github.com/alexchen-eng",
    linkedin: "linkedin.com/in/alexchen-eng",
    summary: "High-velocity systems engineer with 10+ years specializing in distributed event streams, resilient microservices, and sub-millisecond cloud pipelines. Proven track record leading architecture transformations at scale (140k+ RPS, 99.999% SLA), reducing AWS infrastructure costs by $1.2M, and mentoring high-output engineering teams."
  },
  skills: {
    languages: "Go, TypeScript, Rust, Python, SQL, C++",
    frameworks: "React 19, Next.js, Node.js, FastAPI, gRPC, Gin, Tailwind CSS",
    cloud: "AWS (EKS, Lambda, SQS, RDS), Docker, Kubernetes, Terraform, ArgoCD, Prometheus",
    databases: "PostgreSQL, Apache Kafka, Redis, ClickHouse, DynamoDB, Elasticsearch",
    tools: "Distributed Systems, Event-Driven Architecture, CQRS, eBPF, CI/CD Pipelines"
  },
  experience: [
    {
      id: "exp-1",
      company: "CloudScale Technologies",
      role: "Staff Software Engineer & Tech Lead",
      location: "San Francisco, CA (Remote)",
      dateRange: "2022 - Present",
      bullets: "Architected real-time event streaming engine processing 140,000 req/sec with P99 latency under 12ms using Go and Kafka.\nReduced multi-region AWS infrastructure expenditure by 38% ($1.2M annual savings) via Kubernetes bin-packing and automated spot fleets.\nSpearheaded engineering standards across 3 squads (24 engineers), introducing strict RFC design audits and zero-downtime canary deploys.",
      techStack: ["Go", "Kafka", "Kubernetes", "AWS EKS", "Terraform", "Prometheus", "Redis"]
    },
    {
      id: "exp-2",
      company: "FinTech Velocity",
      role: "Senior Backend Systems Engineer",
      location: "New York, NY",
      dateRange: "2019 - 2022",
      bullets: "Engineered transactional double-entry ledger handling $450M monthly settlement volume with strict ACID guarantees.\nMigrated monolithic core services into decoupled gRPC microservices, shrinking continuous deployment cycle from 2 weeks to twice daily.\nAchieved SOC2 Type II compliance by implementing end-to-end envelope encryption and automated audit logs.",
      techStack: ["TypeScript", "Node.js", "PostgreSQL", "gRPC", "Docker", "AWS RDS"]
    },
    {
      id: "exp-3",
      company: "DataStream Labs",
      role: "Software Engineer",
      location: "Boston, MA",
      dateRange: "2016 - 2019",
      bullets: "Developed real-time ingestion pipelines supporting 40+ SaaS telemetry integrations.\nOptimized relational indexing and query execution plans, slashing reporting API response times by 65%.",
      techStack: ["Python", "FastAPI", "PostgreSQL", "Redis", "Celery", "Docker"]
    }
  ],
  projects: [
    {
      id: "proj-1",
      name: "ChronoStream",
      role: "Creator & Maintainer",
      repo: "github.com/alexchen-eng/chronostream",
      demo: "https://chronostream.dev",
      summary: "High-throughput log replay engine designed in Rust utilizing zero-copy ring buffers and io_uring for ultra-low latency event replication.",
      techStack: ["Rust", "io_uring", "Tokyo", "WebAssembly", "Docker"]
    },
    {
      id: "proj-2",
      name: "KubeGuard",
      role: "Lead Architect",
      repo: "github.com/alexchen-eng/kubeguard",
      demo: "https://kubeguard.io",
      summary: "Kubernetes security operator that analyzes eBPF kernel hooks to isolate rogue container traffic and mitigate zero-day exploits in under 300ms.",
      techStack: ["Go", "eBPF", "Kubernetes Operator SDK", "Helm"]
    }
  ],
  oss: [
    {
      id: "oss-1",
      org: "CNCF / OpenTelemetry Go",
      title: "Batch Telemetry Exporter Optimization (PR #4812)",
      link: "https://github.com/open-telemetry/opentelemetry-go",
      impact: "Contributed lock-free asynchronous buffer with intelligent backpressure, reducing memory overhead by 22% during peak trace bursts."
    },
    {
      id: "oss-2",
      org: "Confluent Kafka Go Client",
      title: "Consumer Group Rebalance Fix (PR #1042)",
      link: "https://github.com/confluentinc/confluent-kafka-go",
      impact: "Patched critical race condition occurring during simultaneous partition rebalances under severe network jitter."
    }
  ],
  education: [
    {
      id: "edu-1",
      degree: "B.S. in Computer Science & Engineering",
      institution: "University of California, Berkeley",
      dateRange: "2012 - 2016",
      details: "Magna Cum Laude • Specialization in Distributed Computing • President, ACM Student Chapter"
    }
  ]
};

const STORAGE_KEY = "aio_developer_cv_data_v1";

let cvData = loadInitialData();

function loadInitialData() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      return JSON.parse(saved);
    }
  } catch (err) {
    console.warn("Could not load CV data from localStorage", err);
  }
  return JSON.parse(JSON.stringify(SENIOR_SAMPLE));
}

function saveState() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(cvData));
  } catch (err) {
    console.warn("Could not persist CV data", err);
  }
}

document.addEventListener("DOMContentLoaded", () => {
  initTabs();
  bindPersonalForm();
  bindSkillsForm();
  renderDynamicForms();
  bindActionButtons();
  renderResumePreview();
});

// Tab Switching Logic
function initTabs() {
  const tabs = document.querySelectorAll(".editor-tab-btn");
  tabs.forEach(tab => {
    tab.addEventListener("click", () => {
      tabs.forEach(t => t.classList.remove("active"));
      document.querySelectorAll(".tab-pane").forEach(pane => pane.classList.remove("active"));

      tab.classList.add("active");
      const targetId = tab.getAttribute("data-tab");
      const targetPane = document.getElementById(targetId);
      if (targetPane) targetPane.classList.add("active");
    });
  });
}

// Bind Personal Details
function bindPersonalForm() {
  const fields = [
    { id: "inp-fullname", key: "fullName" },
    { id: "inp-title", key: "role" },
    { id: "inp-email", key: "email" },
    { id: "inp-phone", key: "phone" },
    { id: "inp-location", key: "location" },
    { id: "inp-portfolio", key: "portfolio" },
    { id: "inp-github", key: "github" },
    { id: "inp-linkedin", key: "linkedin" },
    { id: "inp-summary", key: "summary" }
  ];

  fields.forEach(({ id, key }) => {
    const el = document.getElementById(id);
    if (!el) return;
    el.value = cvData.personal[key] || "";
    el.addEventListener("input", () => {
      cvData.personal[key] = el.value.trim();
      saveState();
      renderResumePreview();
    });
  });
}

// Bind Skills Form
function bindSkillsForm() {
  const skillFields = [
    { id: "inp-skills-languages", key: "languages" },
    { id: "inp-skills-frameworks", key: "frameworks" },
    { id: "inp-skills-cloud", key: "cloud" },
    { id: "inp-skills-databases", key: "databases" },
    { id: "inp-skills-tools", key: "tools" }
  ];

  skillFields.forEach(({ id, key }) => {
    const el = document.getElementById(id);
    if (!el) return;
    el.value = cvData.skills[key] || "";
    el.addEventListener("input", () => {
      cvData.skills[key] = el.value.trim();
      saveState();
      renderResumePreview();
    });
  });
}

// Render dynamic form items: Experiences, Projects, OSS, Education
function renderDynamicForms() {
  renderExperienceFormList();
  renderProjectsFormList();
  renderOssFormList();
  renderEducationFormList();
}

function renderExperienceFormList() {
  const container = document.getElementById("experience-list");
  if (!container) return;
  container.innerHTML = "";

  cvData.experience.forEach((item, index) => {
    const card = document.createElement("div");
    card.className = "dynamic-item-card";
    card.innerHTML = `
      <div class="dynamic-item-header">
        <span class="item-title-badge">Experience #${index + 1}: ${escapeHtml(item.company || "Company")}</span>
        <button type="button" class="btn-remove-item" data-action="remove-exp" data-id="${item.id}">Remove</button>
      </div>
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 0.5rem;">
        <div class="form-group">
          <label>Company / Organization</label>
          <input type="text" class="form-input" data-field="company" data-id="${item.id}" value="${escapeAttr(item.company)}">
        </div>
        <div class="form-group">
          <label>Role / Job Title</label>
          <input type="text" class="form-input" data-field="role" data-id="${item.id}" value="${escapeAttr(item.role)}">
        </div>
      </div>
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 0.5rem;">
        <div class="form-group">
          <label>Location</label>
          <input type="text" class="form-input" data-field="location" data-id="${item.id}" value="${escapeAttr(item.location)}">
        </div>
        <div class="form-group">
          <label>Date Period (e.g. 2022 - Present)</label>
          <input type="text" class="form-input" data-field="dateRange" data-id="${item.id}" value="${escapeAttr(item.dateRange)}">
        </div>
      </div>
      <div class="form-group">
        <label>Key Accomplishments (1 bullet point per line)</label>
        <textarea class="form-input" rows="3" style="resize: vertical;" data-field="bullets" data-id="${item.id}">${escapeHtml(item.bullets)}</textarea>
      </div>
      <div class="form-group">
        <label>Tech Stack Pills (comma-separated)</label>
        <input type="text" class="form-input" data-field="techStack" data-id="${item.id}" value="${escapeAttr((item.techStack || []).join(", "))}">
      </div>
    `;
    container.appendChild(card);
  });

  // Attach listeners to experience card inputs
  container.querySelectorAll("input, textarea").forEach(input => {
    input.addEventListener("input", (e) => {
      const id = e.target.getAttribute("data-id");
      const field = e.target.getAttribute("data-field");
      const targetExp = cvData.experience.find(x => x.id === id);
      if (!targetExp) return;

      if (field === "techStack") {
        targetExp.techStack = e.target.value.split(",").map(s => s.trim()).filter(Boolean);
      } else {
        targetExp[field] = e.target.value;
      }
      saveState();
      renderResumePreview();
    });
  });

  container.querySelectorAll('[data-action="remove-exp"]').forEach(btn => {
    btn.addEventListener("click", () => {
      const id = btn.getAttribute("data-id");
      cvData.experience = cvData.experience.filter(x => x.id !== id);
      saveState();
      renderExperienceFormList();
      renderResumePreview();
    });
  });
}

function renderProjectsFormList() {
  const container = document.getElementById("project-list");
  if (!container) return;
  container.innerHTML = "";

  cvData.projects.forEach((item, index) => {
    const card = document.createElement("div");
    card.className = "dynamic-item-card";
    card.innerHTML = `
      <div class="dynamic-item-header">
        <span class="item-title-badge">Project #${index + 1}: ${escapeHtml(item.name || "Project")}</span>
        <button type="button" class="btn-remove-item" data-action="remove-proj" data-id="${item.id}">Remove</button>
      </div>
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 0.5rem;">
        <div class="form-group">
          <label>Project Name</label>
          <input type="text" class="form-input" data-field="name" data-id="${item.id}" value="${escapeAttr(item.name)}">
        </div>
        <div class="form-group">
          <label>Your Role</label>
          <input type="text" class="form-input" data-field="role" data-id="${item.id}" value="${escapeAttr(item.role)}">
        </div>
      </div>
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 0.5rem;">
        <div class="form-group">
          <label>GitHub Repository URL</label>
          <input type="text" class="form-input" data-field="repo" data-id="${item.id}" value="${escapeAttr(item.repo)}">
        </div>
        <div class="form-group">
          <label>Live Demo URL</label>
          <input type="text" class="form-input" data-field="demo" data-id="${item.id}" value="${escapeAttr(item.demo)}">
        </div>
      </div>
      <div class="form-group">
        <label>Architecture Summary & Technical Highlights</label>
        <textarea class="form-input" rows="2" style="resize: vertical;" data-field="summary" data-id="${item.id}">${escapeHtml(item.summary)}</textarea>
      </div>
      <div class="form-group">
        <label>Technologies Used (comma-separated)</label>
        <input type="text" class="form-input" data-field="techStack" data-id="${item.id}" value="${escapeAttr((item.techStack || []).join(", "))}">
      </div>
    `;
    container.appendChild(card);
  });

  container.querySelectorAll("input, textarea").forEach(input => {
    input.addEventListener("input", (e) => {
      const id = e.target.getAttribute("data-id");
      const field = e.target.getAttribute("data-field");
      const targetProj = cvData.projects.find(x => x.id === id);
      if (!targetProj) return;

      if (field === "techStack") {
        targetProj.techStack = e.target.value.split(",").map(s => s.trim()).filter(Boolean);
      } else {
        targetProj[field] = e.target.value;
      }
      saveState();
      renderResumePreview();
    });
  });

  container.querySelectorAll('[data-action="remove-proj"]').forEach(btn => {
    btn.addEventListener("click", () => {
      const id = btn.getAttribute("data-id");
      cvData.projects = cvData.projects.filter(x => x.id !== id);
      saveState();
      renderProjectsFormList();
      renderResumePreview();
    });
  });
}

function renderOssFormList() {
  const container = document.getElementById("oss-list");
  if (!container) return;
  container.innerHTML = "";

  cvData.oss.forEach((item, index) => {
    const card = document.createElement("div");
    card.className = "dynamic-item-card";
    card.innerHTML = `
      <div class="dynamic-item-header">
        <span class="item-title-badge">Contribution #${index + 1}</span>
        <button type="button" class="btn-remove-item" data-action="remove-oss" data-id="${item.id}">Remove</button>
      </div>
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 0.5rem;">
        <div class="form-group">
          <label>Organization / Project</label>
          <input type="text" class="form-input" data-field="org" data-id="${item.id}" value="${escapeAttr(item.org)}">
        </div>
        <div class="form-group">
          <label>PR / Feature Title</label>
          <input type="text" class="form-input" data-field="title" data-id="${item.id}" value="${escapeAttr(item.title)}">
        </div>
      </div>
      <div class="form-group">
        <label>PR / Issue Link</label>
        <input type="text" class="form-input" data-field="link" data-id="${item.id}" value="${escapeAttr(item.link)}">
      </div>
      <div class="form-group">
        <label>Contribution & Architectural Impact</label>
        <textarea class="form-input" rows="2" style="resize: vertical;" data-field="impact" data-id="${item.id}">${escapeHtml(item.impact)}</textarea>
      </div>
    `;
    container.appendChild(card);
  });

  container.querySelectorAll("input, textarea").forEach(input => {
    input.addEventListener("input", (e) => {
      const id = e.target.getAttribute("data-id");
      const field = e.target.getAttribute("data-field");
      const targetOss = cvData.oss.find(x => x.id === id);
      if (!targetOss) return;
      targetOss[field] = e.target.value;
      saveState();
      renderResumePreview();
    });
  });

  container.querySelectorAll('[data-action="remove-oss"]').forEach(btn => {
    btn.addEventListener("click", () => {
      const id = btn.getAttribute("data-id");
      cvData.oss = cvData.oss.filter(x => x.id !== id);
      saveState();
      renderOssFormList();
      renderResumePreview();
    });
  });
}

function renderEducationFormList() {
  const container = document.getElementById("edu-list");
  if (!container) return;
  container.innerHTML = "";

  cvData.education.forEach((item, index) => {
    const card = document.createElement("div");
    card.className = "dynamic-item-card";
    card.innerHTML = `
      <div class="dynamic-item-header">
        <span class="item-title-badge">Education #${index + 1}</span>
        <button type="button" class="btn-remove-item" data-action="remove-edu" data-id="${item.id}">Remove</button>
      </div>
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 0.5rem;">
        <div class="form-group">
          <label>Degree & Major</label>
          <input type="text" class="form-input" data-field="degree" data-id="${item.id}" value="${escapeAttr(item.degree)}">
        </div>
        <div class="form-group">
          <label>Institution / University</label>
          <input type="text" class="form-input" data-field="institution" data-id="${item.id}" value="${escapeAttr(item.institution)}">
        </div>
      </div>
      <div style="display: grid; grid-template-columns: 1fr 2fr; gap: 0.5rem;">
        <div class="form-group">
          <label>Years Attended</label>
          <input type="text" class="form-input" data-field="dateRange" data-id="${item.id}" value="${escapeAttr(item.dateRange)}">
        </div>
        <div class="form-group">
          <label>Honors / Activities</label>
          <input type="text" class="form-input" data-field="details" data-id="${item.id}" value="${escapeAttr(item.details)}">
        </div>
      </div>
    `;
    container.appendChild(card);
  });

  container.querySelectorAll("input").forEach(input => {
    input.addEventListener("input", (e) => {
      const id = e.target.getAttribute("data-id");
      const field = e.target.getAttribute("data-field");
      const targetEdu = cvData.education.find(x => x.id === id);
      if (!targetEdu) return;
      targetEdu[field] = e.target.value;
      saveState();
      renderResumePreview();
    });
  });

  container.querySelectorAll('[data-action="remove-edu"]').forEach(btn => {
    btn.addEventListener("click", () => {
      const id = btn.getAttribute("data-id");
      cvData.education = cvData.education.filter(x => x.id !== id);
      saveState();
      renderEducationFormList();
      renderResumePreview();
    });
  });
}

// Action button handlers
function bindActionButtons() {
  // Add Experience
  document.getElementById("btn-add-experience")?.addEventListener("click", () => {
    cvData.experience.push({
      id: "exp-" + Date.now(),
      company: "New Company",
      role: "Software Engineer",
      location: "Remote",
      dateRange: "2023 - Present",
      bullets: "Delivered scalable feature sets driving key metric expansion.",
      techStack: ["TypeScript", "Node.js"]
    });
    saveState();
    renderExperienceFormList();
    renderResumePreview();
  });

  // Add Project
  document.getElementById("btn-add-project")?.addEventListener("click", () => {
    cvData.projects.push({
      id: "proj-" + Date.now(),
      name: "New Software Project",
      role: "Creator",
      repo: "github.com/developer/project",
      demo: "https://project.example.com",
      summary: "Full-stack application delivering real-time workflow performance.",
      techStack: ["TypeScript", "React", "PostgreSQL"]
    });
    saveState();
    renderProjectsFormList();
    renderResumePreview();
  });

  // Add OSS
  document.getElementById("btn-add-oss")?.addEventListener("click", () => {
    cvData.oss.push({
      id: "oss-" + Date.now(),
      org: "Open Source Project",
      title: "Core Feature / Bugfix Contribution",
      link: "https://github.com/project/pull/1",
      impact: "Optimized runtime memory allocation and documented integration tests."
    });
    saveState();
    renderOssFormList();
    renderResumePreview();
  });

  // Add Education
  document.getElementById("btn-add-edu")?.addEventListener("click", () => {
    cvData.education.push({
      id: "edu-" + Date.now(),
      degree: "B.S. in Computer Science",
      institution: "State University",
      dateRange: "2018 - 2022",
      details: "Honors Graduate"
    });
    saveState();
    renderEducationFormList();
    renderResumePreview();
  });

  // Load Senior Profile
  document.getElementById("btn-load-sample")?.addEventListener("click", () => {
    cvData = JSON.parse(JSON.stringify(SENIOR_SAMPLE));
    saveState();
    bindPersonalForm();
    bindSkillsForm();
    renderDynamicForms();
    renderResumePreview();
    showToast("Loaded Senior Engineer Profile Sample.");
  });

  // Reset / Clear
  document.getElementById("btn-reset")?.addEventListener("click", () => {
    if (confirm("Are you sure you want to clear this resume?")) {
      cvData = {
        personal: { fullName: "", role: "", email: "", phone: "", location: "", portfolio: "", github: "", linkedin: "", summary: "" },
        skills: { languages: "", frameworks: "", cloud: "", databases: "", tools: "" },
        experience: [],
        projects: [],
        oss: [],
        education: []
      };
      saveState();
      bindPersonalForm();
      bindSkillsForm();
      renderDynamicForms();
      renderResumePreview();
      showToast("Cleared resume workspace.");
    }
  });

  // Export JSON
  document.getElementById("btn-export-json")?.addEventListener("click", () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(cvData, null, 2));
    const downloadAnchor = document.createElement("a");
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `${(cvData.personal.fullName || "developer").toLowerCase().replace(/\s+/g, "-")}-resume.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    showToast("Downloaded Resume JSON.");
  });

  // Import JSON
  document.getElementById("inp-import-json")?.addEventListener("change", (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const imported = JSON.parse(event.target.result);
        if (imported.personal && imported.skills) {
          cvData = imported;
          saveState();
          bindPersonalForm();
          bindSkillsForm();
          renderDynamicForms();
          renderResumePreview();
          showToast("Successfully imported resume data!");
        } else {
          alert("Invalid resume JSON format.");
        }
      } catch (err) {
        alert("Failed to parse JSON file.");
      }
    };
    reader.readAsText(file);
    e.target.value = "";
  });

  // Copy Markdown
  document.getElementById("btn-copy-markdown")?.addEventListener("click", () => {
    const md = generateMarkdownResume(cvData);
    navigator.clipboard.writeText(md).then(() => {
      showToast("Copied Markdown Resume to clipboard!");
    }).catch(() => {
      showToast("Failed to copy Markdown.");
    });
  });

  // Print / Save PDF
  document.getElementById("btn-print-pdf")?.addEventListener("click", () => {
    window.print();
  });
}

// Render Live Resume Preview Sheet
function renderResumePreview() {
  const sheet = document.getElementById("resume-sheet");
  if (!sheet) return;

  const { personal, skills, experience, projects, oss, education } = cvData;

  // Contact list
  const contacts = [];
  if (personal.email) contacts.push(`<span class="resume-contact-item"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg> <a href="mailto:${escapeAttr(personal.email)}">${escapeHtml(personal.email)}</a></span>`);
  if (personal.phone) contacts.push(`<span class="resume-contact-item"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg> ${escapeHtml(personal.phone)}</span>`);
  if (personal.location) contacts.push(`<span class="resume-contact-item"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg> ${escapeHtml(personal.location)}</span>`);
  if (personal.portfolio) contacts.push(`<span class="resume-contact-item"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="2" y1="12" x2="22" y2="12"></line><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path></svg> <a href="${escapeAttr(formatUrl(personal.portfolio))}" target="_blank" rel="noopener">${escapeHtml(personal.portfolio.replace(/^https?:\/\//, ''))}</a></span>`);
  if (personal.github) contacts.push(`<span class="resume-contact-item"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"></path></svg> <a href="${escapeAttr(formatUrl(personal.github))}" target="_blank" rel="noopener">${escapeHtml(personal.github.replace(/^https?:\/\//, ''))}</a></span>`);
  if (personal.linkedin) contacts.push(`<span class="resume-contact-item"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path><rect x="2" y="9" width="4" height="12"></rect><circle cx="4" cy="4" r="2"></circle></svg> <a href="${escapeAttr(formatUrl(personal.linkedin))}" target="_blank" rel="noopener">${escapeHtml(personal.linkedin.replace(/^https?:\/\//, ''))}</a></span>`);

  let html = `
    <!-- Header -->
    <header class="resume-header">
      <h1 class="resume-name">${escapeHtml(personal.fullName || "Your Full Name")}</h1>
      <div class="resume-target-role">${escapeHtml(personal.role || "Target Engineering Role")}</div>
      ${contacts.length > 0 ? `<div class="resume-contacts-row">${contacts.join(' • ')}</div>` : ''}
    </header>
  `;

  // Summary
  if (personal.summary) {
    html += `
      <section class="resume-section">
        <h2 class="resume-section-heading">Professional Summary</h2>
        <p class="resume-summary-text">${escapeHtml(personal.summary)}</p>
      </section>
    `;
  }

  // Technical Skills
  const hasSkills = Object.values(skills).some(val => val && val.trim().length > 0);
  if (hasSkills) {
    html += `
      <section class="resume-section">
        <h2 class="resume-section-heading">Technical Skills & Competencies</h2>
        <div class="resume-skills-block">
          ${skills.languages ? `<div class="resume-skill-row"><span class="resume-skill-label">Languages:</span><span class="resume-skill-vals">${escapeHtml(skills.languages)}</span></div>` : ''}
          ${skills.frameworks ? `<div class="resume-skill-row"><span class="resume-skill-label">Frameworks / Libs:</span><span class="resume-skill-vals">${escapeHtml(skills.frameworks)}</span></div>` : ''}
          ${skills.cloud ? `<div class="resume-skill-row"><span class="resume-skill-label">Cloud & DevOps:</span><span class="resume-skill-vals">${escapeHtml(skills.cloud)}</span></div>` : ''}
          ${skills.databases ? `<div class="resume-skill-row"><span class="resume-skill-label">Databases & Streams:</span><span class="resume-skill-vals">${escapeHtml(skills.databases)}</span></div>` : ''}
          ${skills.tools ? `<div class="resume-skill-row"><span class="resume-skill-label">Architecture / Core:</span><span class="resume-skill-vals">${escapeHtml(skills.tools)}</span></div>` : ''}
        </div>
      </section>
    `;
  }

  // Work Experience
  if (experience && experience.length > 0) {
    html += `
      <section class="resume-section">
        <h2 class="resume-section-heading">Work Experience</h2>
        ${experience.map(exp => {
          const bulletList = (exp.bullets || "")
            .split("\n")
            .map(b => b.trim())
            .filter(Boolean);
          
          return `
            <div class="resume-entry">
              <div class="resume-entry-header">
                <div>
                  <span class="resume-entry-title">${escapeHtml(exp.role)}</span>
                  <span style="color: #64748b; font-weight: normal;"> at </span>
                  <span class="resume-entry-company">${escapeHtml(exp.company)}</span>
                  ${exp.location ? `<span style="font-size: 0.8rem; color: #64748b;"> • ${escapeHtml(exp.location)}</span>` : ''}
                </div>
                <div class="resume-entry-meta">${escapeHtml(exp.dateRange || "")}</div>
              </div>
              ${bulletList.length > 0 ? `
                <ul class="resume-entry-bullets">
                  ${bulletList.map(b => `<li>${escapeHtml(b)}</li>`).join('')}
                </ul>
              ` : ''}
              ${(exp.techStack && exp.techStack.length > 0) ? `
                <div class="resume-entry-tags">
                  ${exp.techStack.map(t => `<span class="resume-tag-chip">${escapeHtml(t)}</span>`).join('')}
                </div>
              ` : ''}
            </div>
          `;
        }).join('<div style="height: 0.4rem;"></div>')}
      </section>
    `;
  }

  // Key Projects
  if (projects && projects.length > 0) {
    html += `
      <section class="resume-section">
        <h2 class="resume-section-heading">Key Engineering Projects</h2>
        ${projects.map(proj => `
          <div class="resume-entry">
            <div class="resume-entry-header">
              <div>
                <span class="resume-entry-title">${escapeHtml(proj.name)}</span>
                ${proj.role ? `<span style="font-size: 0.8rem; color: #64748b;"> (${escapeHtml(proj.role)})</span>` : ''}
              </div>
              <div class="resume-links-row">
                ${proj.repo ? `<a href="${escapeAttr(formatUrl(proj.repo))}" target="_blank" rel="noopener">Repo ↗</a>` : ''}
                ${proj.demo ? `<a href="${escapeAttr(formatUrl(proj.demo))}" target="_blank" rel="noopener">Live Demo ↗</a>` : ''}
              </div>
            </div>
            ${proj.summary ? `<div style="font-size: 0.85rem; color: #334155; margin-top: 0.15rem;">${escapeHtml(proj.summary)}</div>` : ''}
            ${(proj.techStack && proj.techStack.length > 0) ? `
              <div class="resume-entry-tags">
                ${proj.techStack.map(t => `<span class="resume-tag-chip">${escapeHtml(t)}</span>`).join('')}
              </div>
            ` : ''}
          </div>
        `).join('<div style="height: 0.4rem;"></div>')}
      </section>
    `;
  }

  // Open Source Contributions
  if (oss && oss.length > 0) {
    html += `
      <section class="resume-section">
        <h2 class="resume-section-heading">Open Source Contributions</h2>
        ${oss.map(item => `
          <div class="resume-entry">
            <div class="resume-entry-header">
              <div>
                <strong style="color: #0f172a; font-size: 0.9rem;">${escapeHtml(item.org)}</strong>
                <span style="color: #64748b;">: </span>
                <span style="font-size: 0.875rem; color: #2563eb; font-weight: 600;">${escapeHtml(item.title)}</span>
              </div>
              ${item.link ? `<div class="resume-links-row"><a href="${escapeAttr(formatUrl(item.link))}" target="_blank" rel="noopener">View PR ↗</a></div>` : ''}
            </div>
            ${item.impact ? `<div style="font-size: 0.85rem; color: #334155; margin-top: 0.15rem;">${escapeHtml(item.impact)}</div>` : ''}
          </div>
        `).join('<div style="height: 0.3rem;"></div>')}
      </section>
    `;
  }

  // Education
  if (education && education.length > 0) {
    html += `
      <section class="resume-section">
        <h2 class="resume-section-heading">Education & Certifications</h2>
        ${education.map(edu => `
          <div class="resume-entry">
            <div class="resume-entry-header">
              <div>
                <span class="resume-entry-title">${escapeHtml(edu.degree)}</span>
                <span style="color: #64748b;"> • </span>
                <span class="resume-entry-company">${escapeHtml(edu.institution)}</span>
              </div>
              <div class="resume-entry-meta">${escapeHtml(edu.dateRange || '')}</div>
            </div>
            ${edu.details ? `<div style="font-size: 0.825rem; color: #475569;">${escapeHtml(edu.details)}</div>` : ''}
          </div>
        `).join('')}
      </section>
    `;
  }

  sheet.innerHTML = html;
}

// Markdown resume generator
function generateMarkdownResume(data) {
  let md = `# ${data.personal.fullName || "Developer"}\n`;
  md += `**${data.personal.role || "Software Engineer"}**\n\n`;
  
  const contacts = [];
  if (data.personal.email) contacts.push(`Email: ${data.personal.email}`);
  if (data.personal.phone) contacts.push(`Phone: ${data.personal.phone}`);
  if (data.personal.location) contacts.push(`Location: ${data.personal.location}`);
  if (data.personal.portfolio) contacts.push(`Portfolio: ${data.personal.portfolio}`);
  if (data.personal.github) contacts.push(`GitHub: ${data.personal.github}`);
  if (data.personal.linkedin) contacts.push(`LinkedIn: ${data.personal.linkedin}`);
  md += contacts.join(" | ") + "\n\n";

  if (data.personal.summary) {
    md += `## Professional Summary\n${data.personal.summary}\n\n`;
  }

  md += `## Technical Skills\n`;
  if (data.skills.languages) md += `- **Languages**: ${data.skills.languages}\n`;
  if (data.skills.frameworks) md += `- **Frameworks**: ${data.skills.frameworks}\n`;
  if (data.skills.cloud) md += `- **Cloud & DevOps**: ${data.skills.cloud}\n`;
  if (data.skills.databases) md += `- **Databases**: ${data.skills.databases}\n`;
  if (data.skills.tools) md += `- **Architecture / Tools**: ${data.skills.tools}\n`;
  md += "\n";

  if (data.experience.length > 0) {
    md += `## Experience\n\n`;
    data.experience.forEach(exp => {
      md += `### ${exp.role} - ${exp.company} (${exp.dateRange})\n`;
      if (exp.location) md += `*${exp.location}*\n\n`;
      (exp.bullets || "").split("\n").filter(Boolean).forEach(b => {
        md += `- ${b.trim()}\n`;
      });
      if (exp.techStack && exp.techStack.length > 0) {
        md += `*Tech Stack: ${exp.techStack.join(", ")}*\n`;
      }
      md += "\n";
    });
  }

  if (data.projects.length > 0) {
    md += `## Key Projects\n\n`;
    data.projects.forEach(proj => {
      md += `### ${proj.name}\n`;
      if (proj.repo) md += `- **Repo**: ${proj.repo}\n`;
      if (proj.demo) md += `- **Demo**: ${proj.demo}\n`;
      if (proj.summary) md += `- ${proj.summary}\n`;
      if (proj.techStack && proj.techStack.length > 0) {
        md += `- **Tech Stack**: ${proj.techStack.join(", ")}\n`;
      }
      md += "\n";
    });
  }

  if (data.oss.length > 0) {
    md += `## Open Source Contributions\n\n`;
    data.oss.forEach(item => {
      md += `- **${item.org}** - [${item.title}](${item.link}): ${item.impact}\n`;
    });
    md += "\n";
  }

  if (data.education.length > 0) {
    md += `## Education\n\n`;
    data.education.forEach(edu => {
      md += `- **${edu.degree}**, ${edu.institution} (${edu.dateRange})\n`;
      if (edu.details) md += `  ${edu.details}\n`;
    });
  }

  return md;
}

// Utilities
function escapeHtml(str) {
  if (!str) return "";
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function escapeAttr(str) {
  if (!str) return "";
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function formatUrl(url) {
  if (!url) return "#";
  if (!/^https?:\/\//i.test(url)) {
    return "https://" + url;
  }
  return url;
}

function showToast(message) {
  const toast = document.getElementById("toast");
  if (!toast) return;
  toast.textContent = message;
  toast.style.display = "flex";
  
  clearTimeout(toast._timeout);
  toast._timeout = setTimeout(() => {
    toast.style.display = "none";
  }, 2800);
}