// Experience Timeline - Interactive Career & Milestone Builder Logic

const SAMPLE_MILESTONES = [
  {
    id: "m-1",
    year: "2015",
    title: "B.S. in Computer Science",
    org: "UC Berkeley",
    category: "Education",
    desc: "Summa Cum Laude honors. Specialized in distributed consensus algorithms and operating systems."
  },
  {
    id: "m-2",
    year: "2016 - 2018",
    title: "Software Engineer",
    org: "Stripe",
    category: "Work",
    desc: "Engineered high-throughput payment webhook delivery pipelines processing 45k events/sec."
  },
  {
    id: "m-3",
    year: "2018",
    title: "FastRaft Consensus Engine",
    org: "Open Source / GitHub",
    category: "Project",
    desc: "Created zero-allocation Raft consensus library in Go adopted by cloud-native storage operators (3.8k stars)."
  },
  {
    id: "m-4",
    year: "2019 - 2021",
    title: "Senior Distributed Systems Engineer",
    org: "Netflix",
    category: "Work",
    desc: "Architected multi-region cache replication protocol, reducing telemetry failover latency by 72%."
  },
  {
    id: "m-5",
    year: "2021 - 2023",
    title: "Staff Systems Architect",
    org: "Uber Infrastructure",
    category: "Work",
    desc: "Led cluster migration across 18 data centers with zero downtime and strict SOC2 adherence."
  },
  {
    id: "m-6",
    year: "2023",
    title: "Global Systems Innovation Award",
    org: "International Cloud Architecture Summit",
    category: "Award",
    desc: "Recognized for pioneering zero-downtime distributed state machine migrations at scale."
  },
  {
    id: "m-7",
    year: "2024 - Present",
    title: "Principal Infrastructure Architect",
    org: "Apex Cloud Systems",
    category: "Work",
    desc: "Leading strategic platform roadmap for autonomous multi-tenant cloud orchestration serving Fortune 500."
  }
];

const THEMES = {
  "dark-luxury": {
    name: "Dark Luxury",
    primary: "#d4af37",
    secondary: "#f59e0b",
    bg: "#0a0e17",
    cardBg: "#111827",
    cardBorder: "rgba(212, 175, 55, 0.28)",
    spine: "#d4af37",
    textPrimary: "#f8fafc",
    textSecondary: "#94a3b8",
    glow: "rgba(212, 175, 55, 0.4)"
  },
  "emerald-exec": {
    name: "Emerald Executive",
    primary: "#10b981",
    secondary: "#06b6d4",
    bg: "#060f12",
    cardBg: "#0d1f22",
    cardBorder: "rgba(16, 185, 129, 0.28)",
    spine: "#10b981",
    textPrimary: "#f0fdf4",
    textSecondary: "#94a3b8",
    glow: "rgba(16, 185, 129, 0.4)"
  },
  "cyber-neon": {
    name: "Cyber Neon",
    primary: "#06b6d4",
    secondary: "#f43f5e",
    bg: "#080b12",
    cardBg: "#0e1424",
    cardBorder: "rgba(6, 182, 212, 0.35)",
    spine: "#06b6d4",
    textPrimary: "#ffffff",
    textSecondary: "#a5b4fc",
    glow: "rgba(6, 182, 212, 0.45)"
  }
};

const CATEGORY_COLORS = {
  Work: "#3b82f6",
  Education: "#10b981",
  Award: "#f59e0b",
  Project: "#a855f7"
};

const STORAGE_KEY = "aio_experience_timeline_data_v1";

let timelineData = {
  theme: "dark-luxury",
  layout: "vertical",
  filter: "all",
  milestones: JSON.parse(JSON.stringify(SAMPLE_MILESTONES))
};

function loadSavedData() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed.milestones && Array.isArray(parsed.milestones)) {
        timelineData = parsed;
      }
    }
  } catch (err) {
    console.warn("Could not load timeline data", err);
  }
}

function saveState() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(timelineData));
  } catch (err) {
    console.warn("Could not save timeline data", err);
  }
}

document.addEventListener("DOMContentLoaded", () => {
  loadSavedData();
  initThemeButtons();
  initLayoutButtons();
  initFilterButtons();
  initActionButtons();
  initEmbedModal();
  renderMilestoneEditorCards();
  renderTimelineSvg();
});

function initThemeButtons() {
  const btns = document.querySelectorAll(".theme-btn-card[data-theme]");
  btns.forEach(btn => {
    if (btn.getAttribute("data-theme") === timelineData.theme) {
      btns.forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
    }
    btn.addEventListener("click", () => {
      btns.forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      timelineData.theme = btn.getAttribute("data-theme");
      saveState();
      renderTimelineSvg();
    });
  });
}

function initLayoutButtons() {
  const btns = document.querySelectorAll(".theme-btn-card[data-layout]");
  btns.forEach(btn => {
    if (btn.getAttribute("data-layout") === timelineData.layout) {
      btns.forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
    }
    btn.addEventListener("click", () => {
      btns.forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      timelineData.layout = btn.getAttribute("data-layout");
      saveState();
      renderTimelineSvg();
    });
  });
}

function initFilterButtons() {
  const btns = document.querySelectorAll(".filter-pill-btn");
  btns.forEach(btn => {
    if (btn.getAttribute("data-filter") === timelineData.filter) {
      btns.forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
    }
    btn.addEventListener("click", () => {
      btns.forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      timelineData.filter = btn.getAttribute("data-filter");
      renderTimelineSvg();
    });
  });
}

function initActionButtons() {
  // Add milestone
  document.getElementById("btn-add-milestone")?.addEventListener("click", () => {
    timelineData.milestones.push({
      id: "m-" + Date.now(),
      year: new Date().getFullYear().toString(),
      title: "New Career Milestone",
      org: "Organization",
      category: "Work",
      desc: "Delivered key contributions and achieved measurable performance metrics."
    });
    saveState();
    renderMilestoneEditorCards();
    renderTimelineSvg();
  });

  // Load sample journey
  document.getElementById("btn-load-sample")?.addEventListener("click", () => {
    timelineData.milestones = JSON.parse(JSON.stringify(SAMPLE_MILESTONES));
    saveState();
    renderMilestoneEditorCards();
    renderTimelineSvg();
    showToast("Loaded Senior Career Milestone Journey.");
  });

  // Clear / Reset
  document.getElementById("btn-reset")?.addEventListener("click", () => {
    if (confirm("Clear all milestone events?")) {
      timelineData.milestones = [];
      saveState();
      renderMilestoneEditorCards();
      renderTimelineSvg();
      showToast("Cleared timeline workspace.");
    }
  });

  // Export JSON
  document.getElementById("btn-export-json")?.addEventListener("click", () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(timelineData, null, 2));
    const a = document.createElement("a");
    a.href = dataStr;
    a.download = `career-timeline-${timelineData.theme}.json`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    showToast("Downloaded Timeline JSON.");
  });

  // Import JSON
  document.getElementById("inp-import-json")?.addEventListener("change", (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const imported = JSON.parse(event.target.result);
        if (imported.milestones && Array.isArray(imported.milestones)) {
          timelineData = imported;
          saveState();
          initThemeButtons();
          initLayoutButtons();
          renderMilestoneEditorCards();
          renderTimelineSvg();
          showToast("Successfully imported timeline data!");
        } else {
          alert("Invalid timeline JSON format.");
        }
      } catch (err) {
        alert("Failed to parse JSON file.");
      }
    };
    reader.readAsText(file);
    e.target.value = "";
  });

  // Download PNG
  document.getElementById("btn-download-png")?.addEventListener("click", downloadTimelinePng);
}

function initEmbedModal() {
  const modal = document.getElementById("embed-modal");
  const btnOpen = document.getElementById("btn-open-embed");
  const btnClose = document.getElementById("btn-close-modal");
  const btnCopy = document.getElementById("btn-copy-embed");
  const codeArea = document.getElementById("embed-code-area");

  btnOpen?.addEventListener("click", () => {
    const svg = document.getElementById("timeline-svg");
    if (!svg) return;
    const serializer = new XMLSerializer();
    let svgString = serializer.serializeToString(svg);

    if (!svgString.includes('xmlns="http://www.w3.org/2000/svg"')) {
      svgString = svgString.replace("<svg", '<svg xmlns="http://www.w3.org/2000/svg"');
    }

    const theme = THEMES[timelineData.theme] || THEMES["dark-luxury"];
    const snippet = `<!-- Interactive Career Milestone Timeline Embed -->
<div class="career-timeline-embed" style="width: 100%; max-width: 960px; margin: 2rem auto; background: ${theme.bg}; border-radius: 16px; padding: 1.5rem; border: 1px solid ${theme.cardBorder}; box-shadow: 0 10px 30px rgba(0,0,0,0.5); overflow-x: auto;">
  ${svgString}
</div>`;

    codeArea.value = snippet;
    modal.style.display = "flex";
  });

  btnClose?.addEventListener("click", () => {
    modal.style.display = "none";
  });

  modal?.addEventListener("click", (e) => {
    if (e.target === modal) modal.style.display = "none";
  });

  btnCopy?.addEventListener("click", () => {
    navigator.clipboard.writeText(codeArea.value).then(() => {
      showToast("Copied Timeline Embed Snippet!");
      modal.style.display = "none";
    }).catch(() => {
      showToast("Could not copy snippet.");
    });
  });
}

// Render Editor Milestone Cards
function renderMilestoneEditorCards() {
  const container = document.getElementById("milestones-list-container");
  if (!container) return;
  container.innerHTML = "";

  timelineData.milestones.forEach((item, index) => {
    const card = document.createElement("div");
    card.className = "milestone-item-card";
    card.innerHTML = `
      <div class="milestone-header">
        <span style="font-size: 0.8rem; font-weight: 700; color: var(--accent);">
          #${index + 1} • ${escapeHtml(item.year || "Year")}
        </span>
        <button type="button" class="btn-remove-event" data-action="remove" data-id="${item.id}">Remove</button>
      </div>
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 0.5rem;">
        <div class="form-group">
          <label style="font-size: 0.75rem;">Year / Date Range</label>
          <input type="text" class="form-input" style="padding: 0.45rem 0.65rem; font-size: 0.825rem;" data-field="year" data-id="${item.id}" value="${escapeAttr(item.year)}">
        </div>
        <div class="form-group">
          <label style="font-size: 0.75rem;">Category</label>
          <select class="form-select" style="padding: 0.45rem 0.65rem; font-size: 0.825rem;" data-field="category" data-id="${item.id}">
            <option value="Work" ${item.category === "Work" ? "selected" : ""}>Work</option>
            <option value="Education" ${item.category === "Education" ? "selected" : ""}>Education</option>
            <option value="Award" ${item.category === "Award" ? "selected" : ""}>Award</option>
            <option value="Project" ${item.category === "Project" ? "selected" : ""}>Project</option>
          </select>
        </div>
      </div>
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 0.5rem;">
        <div class="form-group">
          <label style="font-size: 0.75rem;">Title / Role</label>
          <input type="text" class="form-input" style="padding: 0.45rem 0.65rem; font-size: 0.825rem;" data-field="title" data-id="${item.id}" value="${escapeAttr(item.title)}">
        </div>
        <div class="form-group">
          <label style="font-size: 0.75rem;">Organization / Company</label>
          <input type="text" class="form-input" style="padding: 0.45rem 0.65rem; font-size: 0.825rem;" data-field="org" data-id="${item.id}" value="${escapeAttr(item.org)}">
        </div>
      </div>
      <div class="form-group">
        <label style="font-size: 0.75rem;">Description / Highlight</label>
        <textarea class="form-input" rows="2" style="padding: 0.45rem 0.65rem; font-size: 0.825rem; resize: vertical;" data-field="desc" data-id="${item.id}">${escapeHtml(item.desc)}</textarea>
      </div>
    `;
    container.appendChild(card);
  });

  container.querySelectorAll("input, select, textarea").forEach(input => {
    input.addEventListener("input", (e) => {
      const id = e.target.getAttribute("data-id");
      const field = e.target.getAttribute("data-field");
      const target = timelineData.milestones.find(x => x.id === id);
      if (!target) return;
      target[field] = e.target.value;
      saveState();
      renderTimelineSvg();
    });
  });

  container.querySelectorAll('[data-action="remove"]').forEach(btn => {
    btn.addEventListener("click", () => {
      const id = btn.getAttribute("data-id");
      timelineData.milestones = timelineData.milestones.filter(x => x.id !== id);
      saveState();
      renderMilestoneEditorCards();
      renderTimelineSvg();
    });
  });
}

// Render SVG Timeline Graphic
function renderTimelineSvg() {
  const svg = document.getElementById("timeline-svg");
  if (!svg) return;

  const theme = THEMES[timelineData.theme] || THEMES["dark-luxury"];
  let items = timelineData.milestones;
  if (timelineData.filter && timelineData.filter !== "all") {
    items = items.filter(m => m.category === timelineData.filter);
  }

  if (items.length === 0) {
    svg.setAttribute("viewBox", "0 0 600 200");
    svg.setAttribute("width", "600");
    svg.setAttribute("height", "200");
    svg.innerHTML = `
      <rect width="600" height="200" fill="${theme.bg}" rx="12" />
      <text x="300" y="105" fill="${theme.textSecondary}" font-family="-apple-system, BlinkMacSystemFont, sans-serif" font-size="16" text-anchor="middle">No milestone events matching this filter. Add milestones in the editor.</text>
    `;
    return;
  }

  if (timelineData.layout === "horizontal") {
    renderHorizontalSvg(svg, items, theme);
  } else {
    renderVerticalSvg(svg, items, theme);
  }
}

// Vertical Layout (Central Spine with Alternating Cards)
function renderVerticalSvg(svg, items, theme) {
  const width = 860;
  const itemHeight = 160;
  const paddingY = 90;
  const height = paddingY * 2 + (items.length - 1) * itemHeight;
  const centerX = width / 2;

  svg.setAttribute("viewBox", `0 0 ${width} ${height}`);
  svg.setAttribute("width", width.toString());
  svg.setAttribute("height", height.toString());

  let svgContent = `
    <defs>
      <linearGradient id="spine-grad" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="${theme.primary}" stop-opacity="0.3" />
        <stop offset="30%" stop-color="${theme.primary}" stop-opacity="1" />
        <stop offset="70%" stop-color="${theme.secondary}" stop-opacity="1" />
        <stop offset="100%" stop-color="${theme.primary}" stop-opacity="0.3" />
      </linearGradient>
      <filter id="card-glow" x="-20%" y="-20%" width="140%" height="140%">
        <feDropShadow dx="0" dy="6" stdDeviation="10" flood-color="rgba(0,0,0,0.5)" />
      </filter>
    </defs>

    <!-- Canvas Background -->
    <rect width="${width}" height="${height}" fill="${theme.bg}" rx="16" />

    <!-- Title Badge -->
    <text x="${centerX}" y="45" fill="${theme.primary}" font-family="-apple-system, BlinkMacSystemFont, sans-serif" font-size="14" font-weight="700" letter-spacing="2" text-anchor="middle">CAREER & EDUCATION MILESTONE TRAJECTORY</text>

    <!-- Central Vertical Spine Line -->
    <line x1="${centerX}" y1="${paddingY - 20}" x2="${centerX}" y2="${height - paddingY + 20}" stroke="url(#spine-grad)" stroke-width="4" stroke-linecap="round" />
  `;

  items.forEach((item, index) => {
    const y = paddingY + index * itemHeight;
    const isLeft = index % 2 === 0;
    const catColor = CATEGORY_COLORS[item.category] || theme.primary;

    const cardWidth = 330;
    const cardHeight = 125;
    const cardX = isLeft ? (centerX - cardWidth - 45) : (centerX + 45);
    const cardY = y - cardHeight / 2;

    // Connector branch
    const branchStartX = centerX;
    const branchEndX = isLeft ? (centerX - 45) : (centerX + 45);

    svgContent += `
      <!-- Connector Branch -->
      <line x1="${branchStartX}" y1="${y}" x2="${branchEndX}" y2="${y}" stroke="${catColor}" stroke-width="2" stroke-dasharray="4,3" opacity="0.8" />

      <!-- Node Center -->
      <g transform="translate(${centerX}, ${y})">
        <!-- Glow Circle -->
        <circle r="18" fill="${theme.bg}" stroke="${theme.primary}" stroke-width="2" />
        <circle r="12" fill="${catColor}" opacity="0.3" />
        <circle r="6" fill="${catColor}" />
      </g>

      <!-- Event Card -->
      <g filter="url(#card-glow)">
        <rect x="${cardX}" y="${cardY}" width="${cardWidth}" height="${cardHeight}" rx="10" fill="${theme.cardBg}" stroke="${theme.cardBorder}" stroke-width="1.5" />
        
        <!-- Category Pill Bar -->
        <rect x="${cardX + 16}" y="${cardY + 14}" width="68" height="20" rx="10" fill="${catColor}" opacity="0.18" />
        <rect x="${cardX + 16}" y="${cardY + 14}" width="68" height="20" rx="10" fill="none" stroke="${catColor}" stroke-width="1" opacity="0.5" />
        <text x="${cardX + 50}" y="${cardY + 28}" fill="${catColor}" font-family="-apple-system, BlinkMacSystemFont, sans-serif" font-size="10" font-weight="700" text-anchor="middle" letter-spacing="0.5">${escapeHtml(item.category)}</text>

        <!-- Date / Year -->
        <text x="${cardX + cardWidth - 16}" y="${cardY + 28}" fill="${theme.primary}" font-family="-apple-system, BlinkMacSystemFont, sans-serif" font-size="11.5" font-weight="700" text-anchor="end">${escapeHtml(item.year)}</text>

        <!-- Title / Role -->
        <text x="${cardX + 16}" y="${cardY + 54}" fill="${theme.textPrimary}" font-family="-apple-system, BlinkMacSystemFont, sans-serif" font-size="13.5" font-weight="700">
          ${truncateSvg(escapeHtml(item.title), 36)}
        </text>

        <!-- Organization -->
        <text x="${cardX + 16}" y="${cardY + 72}" fill="${catColor}" font-family="-apple-system, BlinkMacSystemFont, sans-serif" font-size="11.5" font-weight="600">
          ${truncateSvg(escapeHtml(item.org), 38)}
        </text>

        <!-- Description (2 lines possible) -->
        <text x="${cardX + 16}" y="${cardY + 92}" fill="${theme.textSecondary}" font-family="-apple-system, BlinkMacSystemFont, sans-serif" font-size="11" font-weight="400">
          ${truncateSvg(escapeHtml(item.desc), 46)}
        </text>
        <text x="${cardX + 16}" y="${cardY + 107}" fill="${theme.textSecondary}" font-family="-apple-system, BlinkMacSystemFont, sans-serif" font-size="11" font-weight="400">
          ${truncateSvgSecondLine(escapeHtml(item.desc), 46)}
        </text>
      </g>
    `;
  });

  svg.innerHTML = svgContent;
}

// Horizontal Layout (Panoramic Track)
function renderHorizontalSvg(svg, items, theme) {
  const itemWidth = 260;
  const paddingX = 80;
  const width = paddingX * 2 + items.length * itemWidth;
  const height = 480;
  const centerY = height / 2;

  svg.setAttribute("viewBox", `0 0 ${width} ${height}`);
  svg.setAttribute("width", width.toString());
  svg.setAttribute("height", height.toString());

  let svgContent = `
    <defs>
      <linearGradient id="h-spine-grad" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0%" stop-color="${theme.primary}" stop-opacity="0.3" />
        <stop offset="30%" stop-color="${theme.primary}" stop-opacity="1" />
        <stop offset="70%" stop-color="${theme.secondary}" stop-opacity="1" />
        <stop offset="100%" stop-color="${theme.primary}" stop-opacity="0.3" />
      </linearGradient>
      <filter id="h-glow" x="-20%" y="-20%" width="140%" height="140%">
        <feDropShadow dx="0" dy="6" stdDeviation="8" flood-color="rgba(0,0,0,0.5)" />
      </filter>
    </defs>

    <!-- Canvas Background -->
    <rect width="${width}" height="${height}" fill="${theme.bg}" rx="16" />

    <!-- Title Badge -->
    <text x="${width / 2}" y="40" fill="${theme.primary}" font-family="-apple-system, BlinkMacSystemFont, sans-serif" font-size="14" font-weight="700" letter-spacing="2" text-anchor="middle">CHRONOLOGICAL CAREER MILESTONES</text>

    <!-- Horizontal Track Spine -->
    <line x1="${paddingX - 30}" y1="${centerY}" x2="${width - paddingX + 30}" y2="${centerY}" stroke="url(#h-spine-grad)" stroke-width="4" stroke-linecap="round" />
  `;

  items.forEach((item, index) => {
    const x = paddingX + index * itemWidth + itemWidth / 2;
    const isTop = index % 2 === 0;
    const catColor = CATEGORY_COLORS[item.category] || theme.primary;

    const cardWidth = 230;
    const cardHeight = 125;
    const cardX = x - cardWidth / 2;
    const cardY = isTop ? (centerY - cardHeight - 40) : (centerY + 40);

    // Connector branch
    const branchEndY = isTop ? (centerY - 40) : (centerY + 40);

    svgContent += `
      <!-- Connector Branch -->
      <line x1="${x}" y1="${centerY}" x2="${x}" y2="${branchEndY}" stroke="${catColor}" stroke-width="2" stroke-dasharray="4,3" opacity="0.8" />

      <!-- Center Node -->
      <g transform="translate(${x}, ${centerY})">
        <circle r="16" fill="${theme.bg}" stroke="${theme.primary}" stroke-width="2" />
        <circle r="10" fill="${catColor}" opacity="0.3" />
        <circle r="5" fill="${catColor}" />
      </g>

      <!-- Card -->
      <g filter="url(#h-glow)">
        <rect x="${cardX}" y="${cardY}" width="${cardWidth}" height="${cardHeight}" rx="10" fill="${theme.cardBg}" stroke="${theme.cardBorder}" stroke-width="1.5" />

        <!-- Category & Date Header -->
        <rect x="${cardX + 12}" y="${cardY + 12}" width="60" height="18" rx="9" fill="${catColor}" opacity="0.18" />
        <text x="${cardX + 42}" y="${cardY + 24}" fill="${catColor}" font-family="-apple-system, BlinkMacSystemFont, sans-serif" font-size="9" font-weight="700" text-anchor="middle">${escapeHtml(item.category)}</text>
        <text x="${cardX + cardWidth - 12}" y="${cardY + 24}" fill="${theme.primary}" font-family="-apple-system, BlinkMacSystemFont, sans-serif" font-size="10.5" font-weight="700" text-anchor="end">${escapeHtml(item.year)}</text>

        <!-- Title -->
        <text x="${cardX + 12}" y="${cardY + 48}" fill="${theme.textPrimary}" font-family="-apple-system, BlinkMacSystemFont, sans-serif" font-size="12" font-weight="700">
          ${truncateSvg(escapeHtml(item.title), 26)}
        </text>

        <!-- Org -->
        <text x="${cardX + 12}" y="${cardY + 65}" fill="${catColor}" font-family="-apple-system, BlinkMacSystemFont, sans-serif" font-size="10.5" font-weight="600">
          ${truncateSvg(escapeHtml(item.org), 28)}
        </text>

        <!-- Description -->
        <text x="${cardX + 12}" y="${cardY + 84}" fill="${theme.textSecondary}" font-family="-apple-system, BlinkMacSystemFont, sans-serif" font-size="10" font-weight="400">
          ${truncateSvg(escapeHtml(item.desc), 32)}
        </text>
        <text x="${cardX + 12}" y="${cardY + 98}" fill="${theme.textSecondary}" font-family="-apple-system, BlinkMacSystemFont, sans-serif" font-size="10" font-weight="400">
          ${truncateSvgSecondLine(escapeHtml(item.desc), 32)}
        </text>
      </g>
    `;
  });

  svg.innerHTML = svgContent;
}

// Download Timeline PNG via Canvas
function downloadTimelinePng() {
  const svg = document.getElementById("timeline-svg");
  if (!svg || timelineData.milestones.length === 0) {
    showToast("Add milestone events to download timeline.");
    return;
  }

  const serializer = new XMLSerializer();
  let svgString = serializer.serializeToString(svg);

  if (!svgString.includes('xmlns="http://www.w3.org/2000/svg"')) {
    svgString = svgString.replace("<svg", '<svg xmlns="http://www.w3.org/2000/svg"');
  }

  const svgWidth = parseFloat(svg.getAttribute("width")) || 860;
  const svgHeight = parseFloat(svg.getAttribute("height")) || 600;

  const scale = 2; // High-resolution 2x rendering
  const canvas = document.createElement("canvas");
  canvas.width = svgWidth * scale;
  canvas.height = svgHeight * scale;
  const ctx = canvas.getContext("2d");

  const theme = THEMES[timelineData.theme] || THEMES["dark-luxury"];
  ctx.fillStyle = theme.bg;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  const img = new Image();
  const svgBlob = new Blob([svgString], { type: "image/svg+xml;charset=utf-8" });
  const url = URL.createObjectURL(svgBlob);

  img.onload = () => {
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    URL.revokeObjectURL(url);

    const link = document.createElement("a");
    link.download = `career-timeline-${timelineData.theme}-${timelineData.layout}.png`;
    link.href = canvas.toDataURL("image/png");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast("Downloaded High-Res Timeline PNG.");
  };

  img.src = url;
}

// String truncate helpers for SVG
function truncateSvg(str, max) {
  if (!str) return "";
  if (str.length <= max) return str;
  return str.substring(0, max) + "…";
}

function truncateSvgSecondLine(str, max) {
  if (!str || str.length <= max) return "";
  const remainder = str.substring(max).trim();
  if (remainder.length <= max) return remainder;
  return remainder.substring(0, max) + "…";
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