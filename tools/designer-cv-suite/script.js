// Designer CV Suite - Visual UI/UX & Product Designer Portfolio Resume Logic

const DESIGNER_SAMPLE = {
  accent: {
    color: "#8b5cf6",
    rgb: "139, 92, 246"
  },
  personal: {
    fullName: "Elena Rostova",
    role: "Principal Product Designer & Systems Architect",
    portfolio: "https://elenarostova.design",
    email: "elena@example.org",
    phone: "+1 (415) 890-4421",
    location: "New York, NY (Open to Remote / Relo)",
    dribbble: "dribbble.com/elenarostova",
    linkedin: "linkedin.com/in/elena-rostova",
    philosophy: "Belief in intentional friction reduction: blending tactile visual craft with rigorous user testing to transform multi-layered workflows into calm, intuitive digital environments that drive measurable commercial conversion."
  },
  skills: {
    tools: "Figma (Tokens & Variables), Framer, Adobe After Effects, Spline 3D, Webflow, Blender, Principle",
    methodologies: "Design Systems Architecture, Mixed-Methods User Research, Information Architecture, WCAG AAA Accessibility, Interactive Micro-interactions, Quantitative A/B Testing",
    frontend: "HTML5/CSS3, Tailwind CSS, Token JSON Pipelines, Storybook, React Basics"
  },
  caseStudies: [
    {
      id: "case-1",
      title: "Apex Financial Workspace - 0 to 1 Web Application",
      client: "Apex Capital Management",
      year: "2023 - 2024",
      prototypeUrl: "https://framer.com/share/apex-preview",
      caseStudyUrl: "https://elenarostova.design/work/apex",
      discovery: "Conducted 32 qualitative interviews with institutional traders suffering from cognitive overload across legacy 4-monitor terminal interfaces.",
      ideation: "Synthesized unified high-density workspace with modular widget grids and customizable telemetry docks.",
      execution: "Built comprehensive 400+ token dark-mode design system with 60 FPS charts, sub-pixel alignment, and WCAG AAA contrast.",
      impact: "+44% trader task completion velocity, -38% visual fatigue complaints, and $18M ARR platform adoption within 6 months.",
      tags: ["Design Systems", "FinTech", "Web App", "Figma", "0 to 1"]
    },
    {
      id: "case-2",
      title: "Lumina Mobile Commerce - Frictionless Checkout Overhaul",
      client: "Lumina Luxury Goods",
      year: "2022 - 2023",
      prototypeUrl: "https://figma.com/@elenarostova/lumina",
      caseStudyUrl: "https://elenarostova.design/work/lumina",
      discovery: "Identified high mobile cart drop-off (68%) caused by confusing address validation and multi-step payment screens.",
      ideation: "Prototyped one-thumb micro-checkout experience with haptic progress feedback and native Apple Pay / Google Pay priority.",
      execution: "Delivered interactive Framer prototypes and micro-animations for engineering handoff with 100% component parity.",
      impact: "+26.8% mobile checkout conversion rate and 4.9/5 iOS App Store rating across 12,000+ customer reviews.",
      tags: ["Mobile Design", "E-Commerce", "Interaction Design", "Framer"]
    }
  ],
  experience: [
    {
      id: "exp-1",
      company: "Vesper Design Studio",
      role: "Lead Product Designer & Design Systems Lead",
      location: "New York, NY",
      dateRange: "2021 - Present",
      highlights: "Directed product design for flagship enterprise clients; created scalable design token architectures adopted by 180+ engineers.\nMentored 8 mid & senior UI/UX designers, establishing weekly design critique culture and accessibility audit playbooks.\nPresented quarterly design strategy directly to C-suite executive boards.",
      toolsUsed: "Figma, Framer, Storybook, After Effects"
    },
    {
      id: "exp-2",
      company: "Aura Interactive",
      role: "Senior UX Designer",
      location: "San Francisco, CA",
      dateRange: "2018 - 2021",
      highlights: "Led end-to-end design lifecycle for SaaS subscription portals generating $60M ARR.\nConducted iterative usability tests across 5 continents, reducing onboarding drop-off by 31%.",
      toolsUsed: "Figma, Sketch, Principle, UserTesting"
    }
  ],
  education: [
    {
      id: "edu-1",
      title: "B.F.A. in Interaction Design & Digital Arts",
      org: "Rhode Island School of Design (RISD)",
      dateRange: "2014 - 2018",
      details: "Summa Cum Laude • Honors Thesis: 'Tactile Affordances in Virtual Interfaces'"
    },
    {
      id: "edu-2",
      title: "Awwwards Site of the Month & Developer Award",
      org: "Awwwards International Jury",
      dateRange: "2023",
      details: "Recognized for Apex Financial digital experience and spatial design clarity"
    }
  ]
};

const STORAGE_KEY = "aio_designer_cv_data_v1";

let designerData = loadInitialData();

function loadInitialData() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      return JSON.parse(saved);
    }
  } catch (err) {
    console.warn("Could not load designer CV data", err);
  }
  return JSON.parse(JSON.stringify(DESIGNER_SAMPLE));
}

function saveState() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(designerData));
  } catch (err) {
    console.warn("Could not save designer CV data", err);
  }
}

document.addEventListener("DOMContentLoaded", () => {
  applyAccent(designerData.accent.color, designerData.accent.rgb);
  initPaletteButtons();
  initTabs();
  bindPersonalForm();
  bindToolsForm();
  renderDynamicForms();
  bindActionButtons();
  renderDesignerPreview();
});

function applyAccent(color, rgb) {
  document.documentElement.style.setProperty("--designer-accent", color);
  document.documentElement.style.setProperty("--designer-accent-rgb", rgb);
  designerData.accent = { color, rgb };
  saveState();
}

function initPaletteButtons() {
  const btns = document.querySelectorAll(".palette-circle-btn");
  btns.forEach(btn => {
    const color = btn.getAttribute("data-color");
    if (color === designerData.accent.color) {
      btns.forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
    }
    btn.addEventListener("click", () => {
      btns.forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      const c = btn.getAttribute("data-color");
      const rgb = btn.getAttribute("data-rgb");
      applyAccent(c, rgb);
      renderDesignerPreview();
    });
  });
}

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

function bindPersonalForm() {
  const fields = [
    { id: "inp-fullname", key: "fullName" },
    { id: "inp-title", key: "role" },
    { id: "inp-portfolio", key: "portfolio" },
    { id: "inp-email", key: "email" },
    { id: "inp-phone", key: "phone" },
    { id: "inp-location", key: "location" },
    { id: "inp-dribbble", key: "dribbble" },
    { id: "inp-linkedin", key: "linkedin" },
    { id: "inp-philosophy", key: "philosophy" }
  ];

  fields.forEach(({ id, key }) => {
    const el = document.getElementById(id);
    if (!el) return;
    el.value = designerData.personal[key] || "";
    el.addEventListener("input", () => {
      designerData.personal[key] = el.value.trim();
      saveState();
      renderDesignerPreview();
    });
  });
}

function bindToolsForm() {
  const fields = [
    { id: "inp-design-tools", key: "tools" },
    { id: "inp-methodologies", key: "methodologies" },
    { id: "inp-front-skills", key: "frontend" }
  ];

  fields.forEach(({ id, key }) => {
    const el = document.getElementById(id);
    if (!el) return;
    el.value = designerData.skills[key] || "";
    el.addEventListener("input", () => {
      designerData.skills[key] = el.value.trim();
      saveState();
      renderDesignerPreview();
    });
  });
}

function renderDynamicForms() {
  renderCaseStudiesFormList();
  renderExperienceFormList();
  renderEducationFormList();
}

function renderCaseStudiesFormList() {
  const container = document.getElementById("case-studies-list");
  if (!container) return;
  container.innerHTML = "";

  designerData.caseStudies.forEach((cs, index) => {
    const card = document.createElement("div");
    card.className = "dynamic-item-card";
    card.innerHTML = `
      <div class="dynamic-item-header">
        <span style="font-weight: 700; font-size: 0.8rem; color: var(--accent);">Case Study #${index + 1}: ${escapeHtml(cs.title || "Project")}</span>
        <button type="button" class="btn-remove-item" data-action="remove-case" data-id="${cs.id}">Remove</button>
      </div>
      <div style="display: grid; grid-template-columns: 2fr 1fr; gap: 0.5rem;">
        <div class="form-group">
          <label>Case Study Project Title</label>
          <input type="text" class="form-input" data-field="title" data-id="${cs.id}" value="${escapeAttr(cs.title)}">
        </div>
        <div class="form-group">
          <label>Client / Company</label>
          <input type="text" class="form-input" data-field="client" data-id="${cs.id}" value="${escapeAttr(cs.client)}">
        </div>
      </div>
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 0.5rem;">
        <div class="form-group">
          <label>Prototype URL</label>
          <input type="text" class="form-input" data-field="prototypeUrl" data-id="${cs.id}" value="${escapeAttr(cs.prototypeUrl)}">
        </div>
        <div class="form-group">
          <label>Deep Dive Case Study URL</label>
          <input type="text" class="form-input" data-field="caseStudyUrl" data-id="${cs.id}" value="${escapeAttr(cs.caseStudyUrl)}">
        </div>
      </div>
      <div class="form-group">
        <label>1. Discovery & Research Insights</label>
        <textarea class="form-input" rows="2" style="resize: vertical;" data-field="discovery" data-id="${cs.id}">${escapeHtml(cs.discovery)}</textarea>
      </div>
      <div class="form-group">
        <label>2. Ideation & System Architecture</label>
        <textarea class="form-input" rows="2" style="resize: vertical;" data-field="ideation" data-id="${cs.id}">${escapeHtml(cs.ideation)}</textarea>
      </div>
      <div class="form-group">
        <label>3. Craft & Execution</label>
        <textarea class="form-input" rows="2" style="resize: vertical;" data-field="execution" data-id="${cs.id}">${escapeHtml(cs.execution)}</textarea>
      </div>
      <div class="form-group">
        <label>4. Measurable Business Impact & Metrics</label>
        <textarea class="form-input" rows="2" style="resize: vertical;" data-field="impact" data-id="${cs.id}">${escapeHtml(cs.impact)}</textarea>
      </div>
      <div class="form-group">
        <label>Disciplines & Tags (comma-separated)</label>
        <input type="text" class="form-input" data-field="tags" data-id="${cs.id}" value="${escapeAttr((cs.tags || []).join(", "))}">
      </div>
    `;
    container.appendChild(card);
  });

  container.querySelectorAll("input, textarea").forEach(input => {
    input.addEventListener("input", (e) => {
      const id = e.target.getAttribute("data-id");
      const field = e.target.getAttribute("data-field");
      const targetCase = designerData.caseStudies.find(x => x.id === id);
      if (!targetCase) return;

      if (field === "tags") {
        targetCase.tags = e.target.value.split(",").map(s => s.trim()).filter(Boolean);
      } else {
        targetCase[field] = e.target.value;
      }
      saveState();
      renderDesignerPreview();
    });
  });

  container.querySelectorAll('[data-action="remove-case"]').forEach(btn => {
    btn.addEventListener("click", () => {
      const id = btn.getAttribute("data-id");
      designerData.caseStudies = designerData.caseStudies.filter(x => x.id !== id);
      saveState();
      renderCaseStudiesFormList();
      renderDesignerPreview();
    });
  });
}

function renderExperienceFormList() {
  const container = document.getElementById("experience-list");
  if (!container) return;
  container.innerHTML = "";

  designerData.experience.forEach((item, index) => {
    const card = document.createElement("div");
    card.className = "dynamic-item-card";
    card.innerHTML = `
      <div class="dynamic-item-header">
        <span style="font-weight: 700; font-size: 0.8rem; color: var(--accent);">Role #${index + 1}: ${escapeHtml(item.role || "Role")}</span>
        <button type="button" class="btn-remove-item" data-action="remove-exp" data-id="${item.id}">Remove</button>
      </div>
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 0.5rem;">
        <div class="form-group">
          <label>Company / Studio</label>
          <input type="text" class="form-input" data-field="company" data-id="${item.id}" value="${escapeAttr(item.company)}">
        </div>
        <div class="form-group">
          <label>Role / Position</label>
          <input type="text" class="form-input" data-field="role" data-id="${item.id}" value="${escapeAttr(item.role)}">
        </div>
      </div>
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 0.5rem;">
        <div class="form-group">
          <label>Location</label>
          <input type="text" class="form-input" data-field="location" data-id="${item.id}" value="${escapeAttr(item.location)}">
        </div>
        <div class="form-group">
          <label>Period (e.g. 2021 - Present)</label>
          <input type="text" class="form-input" data-field="dateRange" data-id="${item.id}" value="${escapeAttr(item.dateRange)}">
        </div>
      </div>
      <div class="form-group">
        <label>Key Accomplishments (1 bullet point per line)</label>
        <textarea class="form-input" rows="3" style="resize: vertical;" data-field="highlights" data-id="${item.id}">${escapeHtml(item.highlights)}</textarea>
      </div>
      <div class="form-group">
        <label>Primary Tools & Artifacts</label>
        <input type="text" class="form-input" data-field="toolsUsed" data-id="${item.id}" value="${escapeAttr(item.toolsUsed)}">
      </div>
    `;
    container.appendChild(card);
  });

  container.querySelectorAll("input, textarea").forEach(input => {
    input.addEventListener("input", (e) => {
      const id = e.target.getAttribute("data-id");
      const field = e.target.getAttribute("data-field");
      const targetExp = designerData.experience.find(x => x.id === id);
      if (!targetExp) return;
      targetExp[field] = e.target.value;
      saveState();
      renderDesignerPreview();
    });
  });

  container.querySelectorAll('[data-action="remove-exp"]').forEach(btn => {
    btn.addEventListener("click", () => {
      const id = btn.getAttribute("data-id");
      designerData.experience = designerData.experience.filter(x => x.id !== id);
      saveState();
      renderExperienceFormList();
      renderDesignerPreview();
    });
  });
}

function renderEducationFormList() {
  const container = document.getElementById("edu-list");
  if (!container) return;
  container.innerHTML = "";

  designerData.education.forEach((item, index) => {
    const card = document.createElement("div");
    card.className = "dynamic-item-card";
    card.innerHTML = `
      <div class="dynamic-item-header">
        <span style="font-weight: 700; font-size: 0.8rem; color: var(--accent);">Entry #${index + 1}</span>
        <button type="button" class="btn-remove-item" data-action="remove-edu" data-id="${item.id}">Remove</button>
      </div>
      <div style="display: grid; grid-template-columns: 2fr 1fr; gap: 0.5rem;">
        <div class="form-group">
          <label>Degree / Award Title</label>
          <input type="text" class="form-input" data-field="title" data-id="${item.id}" value="${escapeAttr(item.title)}">
        </div>
        <div class="form-group">
          <label>Institution / Organization</label>
          <input type="text" class="form-input" data-field="org" data-id="${item.id}" value="${escapeAttr(item.org)}">
        </div>
      </div>
      <div style="display: grid; grid-template-columns: 1fr 2fr; gap: 0.5rem;">
        <div class="form-group">
          <label>Year / Period</label>
          <input type="text" class="form-input" data-field="dateRange" data-id="${item.id}" value="${escapeAttr(item.dateRange)}">
        </div>
        <div class="form-group">
          <label>Honors & Context</label>
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
      const targetEdu = designerData.education.find(x => x.id === id);
      if (!targetEdu) return;
      targetEdu[field] = e.target.value;
      saveState();
      renderDesignerPreview();
    });
  });

  container.querySelectorAll('[data-action="remove-edu"]').forEach(btn => {
    btn.addEventListener("click", () => {
      const id = btn.getAttribute("data-id");
      designerData.education = designerData.education.filter(x => x.id !== id);
      saveState();
      renderEducationFormList();
      renderDesignerPreview();
    });
  });
}

function bindActionButtons() {
  document.getElementById("btn-add-case")?.addEventListener("click", () => {
    designerData.caseStudies.push({
      id: "case-" + Date.now(),
      title: "New Product Case Study",
      client: "Client / Studio",
      year: "2024",
      prototypeUrl: "https://figma.com",
      caseStudyUrl: "https://portfolio.design/case",
      discovery: "Uncovered key user obstacles through generative qualitative interviews.",
      ideation: "Explored interaction paradigms and rapid wireframing prototypes.",
      execution: "Engineered scalable design system components and high-fidelity flows.",
      impact: "+30% user engagement metrics and verified positive stakeholder adoption.",
      tags: ["Product Design", "Figma", "Design Systems"]
    });
    saveState();
    renderCaseStudiesFormList();
    renderDesignerPreview();
  });

  document.getElementById("btn-add-experience")?.addEventListener("click", () => {
    designerData.experience.push({
      id: "exp-" + Date.now(),
      company: "Creative Studio",
      role: "Senior UI/UX Designer",
      location: "Remote",
      dateRange: "2023 - Present",
      highlights: "Delivered cohesive digital product ecosystems across multi-platform experiences.",
      toolsUsed: "Figma, Framer"
    });
    saveState();
    renderExperienceFormList();
    renderDesignerPreview();
  });

  document.getElementById("btn-add-edu")?.addEventListener("click", () => {
    designerData.education.push({
      id: "edu-" + Date.now(),
      title: "Design Degree or Recognition",
      org: "Design Institute",
      dateRange: "2020",
      details: "Honors distinction"
    });
    saveState();
    renderEducationFormList();
    renderDesignerPreview();
  });

  document.getElementById("btn-load-sample")?.addEventListener("click", () => {
    designerData = JSON.parse(JSON.stringify(DESIGNER_SAMPLE));
    saveState();
    applyAccent(designerData.accent.color, designerData.accent.rgb);
    initPaletteButtons();
    bindPersonalForm();
    bindToolsForm();
    renderDynamicForms();
    renderDesignerPreview();
    showToast("Loaded Product Designer Profile Sample.");
  });

  document.getElementById("btn-reset")?.addEventListener("click", () => {
    if (confirm("Clear all designer portfolio resume data?")) {
      designerData = {
        accent: { color: "#8b5cf6", rgb: "139, 92, 246" },
        personal: { fullName: "", role: "", portfolio: "", email: "", phone: "", location: "", dribbble: "", linkedin: "", philosophy: "" },
        skills: { tools: "", methodologies: "", frontend: "" },
        caseStudies: [],
        experience: [],
        education: []
      };
      saveState();
      bindPersonalForm();
      bindToolsForm();
      renderDynamicForms();
      renderDesignerPreview();
      showToast("Workspace cleared.");
    }
  });

  document.getElementById("btn-export-json")?.addEventListener("click", () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(designerData, null, 2));
    const a = document.createElement("a");
    a.href = dataStr;
    a.download = `${(designerData.personal.fullName || "designer").toLowerCase().replace(/\s+/g, "-")}-portfolio-cv.json`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    showToast("Exported Designer Profile JSON.");
  });

  document.getElementById("inp-import-json")?.addEventListener("change", (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const imported = JSON.parse(event.target.result);
        if (imported.personal && imported.skills) {
          designerData = imported;
          saveState();
          if (imported.accent) applyAccent(imported.accent.color, imported.accent.rgb);
          initPaletteButtons();
          bindPersonalForm();
          bindToolsForm();
          renderDynamicForms();
          renderDesignerPreview();
          showToast("Imported Designer Resume JSON.");
        } else {
          alert("Invalid JSON format.");
        }
      } catch (err) {
        alert("Failed to parse JSON file.");
      }
    };
    reader.readAsText(file);
    e.target.value = "";
  });

  document.getElementById("btn-copy-markdown")?.addEventListener("click", () => {
    const md = generateDesignerMarkdown(designerData);
    navigator.clipboard.writeText(md).then(() => {
      showToast("Copied Designer Portfolio Markdown!");
    }).catch(() => {
      showToast("Failed to copy Markdown.");
    });
  });

  document.getElementById("btn-print-pdf")?.addEventListener("click", () => {
    window.print();
  });
}

function renderDesignerPreview() {
  const sheet = document.getElementById("designer-sheet");
  if (!sheet) return;

  const { personal, skills, caseStudies, experience, education } = designerData;

  const contactList = [];
  if (personal.portfolio) contactList.push(`<a href="${escapeAttr(formatUrl(personal.portfolio))}" target="_blank" rel="noopener">${escapeHtml(personal.portfolio.replace(/^https?:\/\//, ''))} ↗</a>`);
  if (personal.email) contactList.push(`<a href="mailto:${escapeAttr(personal.email)}">${escapeHtml(personal.email)}</a>`);
  if (personal.phone) contactList.push(`<span>${escapeHtml(personal.phone)}</span>`);
  if (personal.location) contactList.push(`<span>${escapeHtml(personal.location)}</span>`);
  if (personal.dribbble) contactList.push(`<a href="${escapeAttr(formatUrl(personal.dribbble))}" target="_blank" rel="noopener">${escapeHtml(personal.dribbble.replace(/^https?:\/\//, ''))} ↗</a>`);
  if (personal.linkedin) contactList.push(`<a href="${escapeAttr(formatUrl(personal.linkedin))}" target="_blank" rel="noopener">${escapeHtml(personal.linkedin.replace(/^https?:\/\//, ''))} ↗</a>`);

  const toolsArr = (skills.tools || "").split(",").map(s => s.trim()).filter(Boolean);
  const methodArr = (skills.methodologies || "").split(",").map(s => s.trim()).filter(Boolean);
  const frontArr = (skills.frontend || "").split(",").map(s => s.trim()).filter(Boolean);

  let html = `
    <!-- Header -->
    <header class="designer-header">
      <div class="designer-header-top">
        <div class="designer-name-block">
          <h1>${escapeHtml(personal.fullName || "Designer Name")}</h1>
          <div class="designer-role-title">${escapeHtml(personal.role || "Lead Product Designer")}</div>
        </div>
      </div>
      ${contactList.length > 0 ? `<div class="designer-contacts">${contactList.join(' • ')}</div>` : ''}
      ${personal.philosophy ? `<div class="designer-philosophy">"${escapeHtml(personal.philosophy)}"</div>` : ''}
    </header>

    <!-- Meta Grid: Tools & Methodologies -->
    ${(toolsArr.length > 0 || methodArr.length > 0 || frontArr.length > 0) ? `
      <section class="designer-meta-grid">
        ${toolsArr.length > 0 ? `
          <div class="designer-meta-col">
            <h3>Design & Prototyping Tools</h3>
            <div class="designer-pills-wrap">
              ${toolsArr.map(t => `<span class="designer-pill highlight">${escapeHtml(t)}</span>`).join('')}
            </div>
          </div>
        ` : ''}
        ${methodArr.length > 0 ? `
          <div class="designer-meta-col">
            <h3>Methodologies & Systems</h3>
            <div class="designer-pills-wrap">
              ${methodArr.map(m => `<span class="designer-pill">${escapeHtml(m)}</span>`).join('')}
              ${frontArr.map(f => `<span class="designer-pill" style="opacity: 0.85;">${escapeHtml(f)}</span>`).join('')}
            </div>
          </div>
        ` : ''}
      </section>
    ` : ''}

    <!-- Case Studies -->
    ${(caseStudies && caseStudies.length > 0) ? `
      <section>
        <div class="designer-section-title">
          <span>Featured Product Case Studies</span>
          <span style="font-size: 0.7rem; color: #78716c; font-weight: normal; text-transform: none;">Evidence-Based Problem Solving</span>
        </div>
        <div class="case-studies-grid">
          ${caseStudies.map(cs => `
            <div class="case-study-card-preview">
              <div class="case-study-card-header">
                <div>
                  <span class="case-study-title">${escapeHtml(cs.title)}</span>
                  ${cs.client ? `<span style="color: #78716c;"> • </span><span class="case-study-company">${escapeHtml(cs.client)}</span>` : ''}
                </div>
                <div style="display: flex; gap: 0.6rem; font-size: 0.775rem;">
                  ${cs.prototypeUrl ? `<a href="${escapeAttr(formatUrl(cs.prototypeUrl))}" target="_blank" rel="noopener" style="color: var(--designer-accent); font-weight: 600; text-decoration: none;">Prototype ↗</a>` : ''}
                  ${cs.caseStudyUrl ? `<a href="${escapeAttr(formatUrl(cs.caseStudyUrl))}" target="_blank" rel="noopener" style="color: #44403c; font-weight: 600; text-decoration: none;">Case Study ↗</a>` : ''}
                </div>
              </div>

              <div class="case-study-process">
                ${cs.discovery ? `
                  <div class="process-step">
                    <span class="process-step-label">Discovery:</span>
                    <span>${escapeHtml(cs.discovery)}</span>
                  </div>
                ` : ''}
                ${cs.ideation ? `
                  <div class="process-step">
                    <span class="process-step-label">Ideation:</span>
                    <span>${escapeHtml(cs.ideation)}</span>
                  </div>
                ` : ''}
                ${cs.execution ? `
                  <div class="process-step">
                    <span class="process-step-label">Execution:</span>
                    <span>${escapeHtml(cs.execution)}</span>
                  </div>
                ` : ''}
              </div>

              ${cs.impact ? `
                <div class="case-study-impact">
                  <strong>Outcome & Impact:</strong> ${escapeHtml(cs.impact)}
                </div>
              ` : ''}

              ${(cs.tags && cs.tags.length > 0) ? `
                <div class="designer-pills-wrap" style="margin-top: 0.2rem;">
                  ${cs.tags.map(tag => `<span class="designer-pill" style="font-size: 0.7rem; padding: 0.1rem 0.45rem;">${escapeHtml(tag)}</span>`).join('')}
                </div>
              ` : ''}
            </div>
          `).join('')}
        </div>
      </section>
    ` : ''}

    <!-- Experience -->
    ${(experience && experience.length > 0) ? `
      <section>
        <div class="designer-section-title">
          <span>Design Career Experience</span>
        </div>
        <div style="display: flex; flex-direction: column; gap: 0.85rem;">
          ${experience.map(exp => {
            const bullets = (exp.highlights || "").split("\n").map(b => b.trim()).filter(Boolean);
            return `
              <div style="display: flex; flex-direction: column; gap: 0.25rem;">
                <div style="display: flex; justify-content: space-between; align-items: baseline;">
                  <div>
                    <strong style="color: #1c1917; font-size: 0.95rem;">${escapeHtml(exp.role)}</strong>
                    <span style="color: #78716c;"> at </span>
                    <span style="color: var(--designer-accent); font-weight: 600;">${escapeHtml(exp.company)}</span>
                    ${exp.location ? `<span style="font-size: 0.8rem; color: #78716c;"> (${escapeHtml(exp.location)})</span>` : ''}
                  </div>
                  <span style="font-size: 0.8rem; color: #78716c;">${escapeHtml(exp.dateRange || '')}</span>
                </div>
                ${bullets.length > 0 ? `
                  <ul style="margin: 0.2rem 0 0.2rem 1.25rem; font-size: 0.835rem; color: #44403c;">
                    ${bullets.map(b => `<li style="margin-bottom: 0.2rem;">${escapeHtml(b)}</li>`).join('')}
                  </ul>
                ` : ''}
                ${exp.toolsUsed ? `
                  <div style="font-size: 0.75rem; color: #78716c;">
                    <em>Core Tools: ${escapeHtml(exp.toolsUsed)}</em>
                  </div>
                ` : ''}
              </div>
            `;
          }).join('<div style="height: 0.4rem;"></div>')}
        </div>
      </section>
    ` : ''}

    <!-- Education & Awards -->
    ${(education && education.length > 0) ? `
      <section>
        <div class="designer-section-title">
          <span>Education & Industry Recognition</span>
        </div>
        <div style="display: flex; flex-direction: column; gap: 0.6rem;">
          ${education.map(edu => `
            <div style="display: flex; justify-content: space-between; align-items: baseline; font-size: 0.85rem;">
              <div>
                <strong style="color: #1c1917;">${escapeHtml(edu.title)}</strong>
                <span style="color: #78716c;"> • ${escapeHtml(edu.org)}</span>
                ${edu.details ? `<div style="font-size: 0.8rem; color: #57534e;">${escapeHtml(edu.details)}</div>` : ''}
              </div>
              <span style="font-size: 0.8rem; color: #78716c; white-space: nowrap;">${escapeHtml(edu.dateRange || '')}</span>
            </div>
          `).join('')}
        </div>
      </section>
    ` : ''}
  `;

  sheet.innerHTML = html;
}

function generateDesignerMarkdown(data) {
  let md = `# ${data.personal.fullName || "Designer"}\n`;
  md += `**${data.personal.role || "Product Designer"}**\n\n`;

  const contacts = [];
  if (data.personal.portfolio) contacts.push(`Portfolio: ${data.personal.portfolio}`);
  if (data.personal.email) contacts.push(`Email: ${data.personal.email}`);
  if (data.personal.phone) contacts.push(`Phone: ${data.personal.phone}`);
  if (data.personal.location) contacts.push(`Location: ${data.personal.location}`);
  if (data.personal.dribbble) contacts.push(`Dribbble: ${data.personal.dribbble}`);
  if (data.personal.linkedin) contacts.push(`LinkedIn: ${data.personal.linkedin}`);
  md += contacts.join(" | ") + "\n\n";

  if (data.personal.philosophy) {
    md += `> "${data.personal.philosophy}"\n\n`;
  }

  md += `## Design Tools & Methodologies\n`;
  if (data.skills.tools) md += `- **Tools**: ${data.skills.tools}\n`;
  if (data.skills.methodologies) md += `- **Methodologies**: ${data.skills.methodologies}\n`;
  if (data.skills.frontend) md += `- **Technical**: ${data.skills.frontend}\n`;
  md += "\n";

  if (data.caseStudies.length > 0) {
    md += `## Featured Case Studies\n\n`;
    data.caseStudies.forEach(cs => {
      md += `### ${cs.title} (${cs.client})\n`;
      if (cs.prototypeUrl) md += `- Prototype: ${cs.prototypeUrl}\n`;
      if (cs.caseStudyUrl) md += `- Case Study: ${cs.caseStudyUrl}\n`;
      if (cs.discovery) md += `- **Discovery**: ${cs.discovery}\n`;
      if (cs.ideation) md += `- **Ideation**: ${cs.ideation}\n`;
      if (cs.execution) md += `- **Execution**: ${cs.execution}\n`;
      if (cs.impact) md += `- **Outcome**: ${cs.impact}\n`;
      if (cs.tags && cs.tags.length > 0) md += `- *Tags: ${cs.tags.join(", ")}*\n`;
      md += "\n";
    });
  }

  if (data.experience.length > 0) {
    md += `## Career Experience\n\n`;
    data.experience.forEach(exp => {
      md += `### ${exp.role} - ${exp.company} (${exp.dateRange})\n`;
      (exp.highlights || "").split("\n").filter(Boolean).forEach(h => {
        md += `- ${h.trim()}\n`;
      });
      if (exp.toolsUsed) md += `- *Tools: ${exp.toolsUsed}*\n`;
      md += "\n";
    });
  }

  if (data.education.length > 0) {
    md += `## Education & Recognition\n\n`;
    data.education.forEach(edu => {
      md += `- **${edu.title}**, ${edu.org} (${edu.dateRange})\n`;
      if (edu.details) md += `  ${edu.details}\n`;
    });
  }

  return md;
}

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