// Skill Visualizer - Interactive Radar Chart & Competency Matrix

const PRESETS = {
  fullstack: [
    { name: "TypeScript", category: "Frontend", level: 95 },
    { name: "React 19 / Next.js", category: "Frontend", level: 90 },
    { name: "Node.js & Go", category: "Backend", level: 88 },
    { name: "Distributed Systems", category: "Backend", level: 85 },
    { name: "AWS Cloud & Docker", category: "DevOps", level: 82 },
    { name: "Design Systems", category: "Design", level: 78 }
  ],
  designer: [
    { name: "Figma & Prototyping", category: "Design", level: 98 },
    { name: "Design Systems", category: "Design", level: 94 },
    { name: "User Research", category: "Design", level: 90 },
    { name: "CSS Architecture", category: "Frontend", level: 85 },
    { name: "Product Strategy", category: "Management", level: 88 },
    { name: "Interaction Design", category: "Design", level: 92 }
  ],
  leader: [
    { name: "Agile Delivery", category: "Management", level: 95 },
    { name: "Stakeholder Alignment", category: "Management", level: 94 },
    { name: "Mentorship & Hiring", category: "Management", level: 92 },
    { name: "System Architecture", category: "Backend", level: 88 },
    { name: "Strategic Vision", category: "Management", level: 90 },
    { name: "Cloud & Reliability", category: "DevOps", level: 78 }
  ],
  ai: [
    { name: "Python & PyTorch", category: "Data & AI", level: 95 },
    { name: "LLM Orchestration", category: "Data & AI", level: 92 },
    { name: "Vector Databases", category: "Data & AI", level: 88 },
    { name: "Data Pipelines", category: "Backend", level: 85 },
    { name: "Cloud MLOps", category: "DevOps", level: 80 },
    { name: "API Integration", category: "Frontend", level: 78 }
  ]
};

const THEMES = {
  'luxury-gold': {
    primary: '#d4af37',
    secondary: '#f59e0b',
    glow: 'rgba(212, 175, 55, 0.4)',
    fill: 'rgba(212, 175, 55, 0.25)',
    grid: 'rgba(255, 255, 255, 0.12)',
    text: '#f8fafc'
  },
  'cyber-blue': {
    primary: '#06b6d4',
    secondary: '#3b82f6',
    glow: 'rgba(6, 182, 212, 0.4)',
    fill: 'rgba(6, 182, 212, 0.25)',
    grid: 'rgba(255, 255, 255, 0.12)',
    text: '#f8fafc'
  },
  'neon-green': {
    primary: '#10b981',
    secondary: '#22c55e',
    glow: 'rgba(16, 185, 129, 0.4)',
    fill: 'rgba(16, 185, 129, 0.25)',
    grid: 'rgba(255, 255, 255, 0.12)',
    text: '#f8fafc'
  }
};

let currentSkills = JSON.parse(JSON.stringify(PRESETS.fullstack));
let currentTheme = 'luxury-gold';

document.addEventListener('DOMContentLoaded', () => {
  // Elements
  const addForm = document.getElementById('add-skill-form');
  const levelSlider = document.getElementById('new-skill-level');
  const sliderValDisplay = document.getElementById('slider-val-display');
  const presetSelector = document.getElementById('preset-selector');
  const themePills = document.querySelectorAll('.theme-pill');
  const btnReset = document.getElementById('btn-reset-skills');
  const btnDownloadPng = document.getElementById('btn-download-png');
  const btnExportEmbed = document.getElementById('btn-export-embed');

  // Embed Modal
  const modal = document.getElementById('embed-modal');
  const modalClose = document.getElementById('modal-close');
  const btnCloseModal = document.getElementById('btn-close-modal');
  const btnCopyEmbed = document.getElementById('btn-copy-embed');

  // Slider value feedback
  if (levelSlider && sliderValDisplay) {
    levelSlider.addEventListener('input', () => {
      sliderValDisplay.textContent = `${levelSlider.value}%`;
    });
  }

  // Add skill submission
  if (addForm) {
    addForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const nameInput = document.getElementById('new-skill-name');
      const categoryInput = document.getElementById('new-skill-category');
      const name = nameInput.value.trim();
      const category = categoryInput.value;
      const level = parseInt(levelSlider.value, 10);

      if (!name) return;

      // Check if skill already exists
      const existing = currentSkills.find(s => s.name.toLowerCase() === name.toLowerCase());
      if (existing) {
        existing.level = level;
        existing.category = category;
        showToast(`Updated existing skill "${name}".`);
      } else {
        currentSkills.push({ name, category, level });
        showToast(`Added skill "${name}".`);
      }

      nameInput.value = '';
      levelSlider.value = 85;
      if (sliderValDisplay) sliderValDisplay.textContent = '85%';

      renderAll();
    });
  }

  // Preset selector
  if (presetSelector) {
    presetSelector.addEventListener('change', () => {
      const selected = presetSelector.value;
      if (PRESETS[selected]) {
        currentSkills = JSON.parse(JSON.stringify(PRESETS[selected]));
        renderAll();
        showToast(`Loaded preset: ${presetSelector.options[presetSelector.selectedIndex].text}`);
      }
    });
  }

  // Theme pills
  themePills.forEach(pill => {
    pill.addEventListener('click', () => {
      themePills.forEach(p => p.classList.remove('active'));
      pill.classList.add('active');
      currentTheme = pill.dataset.theme;
      document.body.setAttribute('data-radar-theme', currentTheme);
      renderAll();
      showToast(`Switched theme to ${pill.textContent.trim()}`);
    });
  });

  // Reset skills
  if (btnReset) {
    btnReset.addEventListener('click', () => {
      currentSkills = [];
      renderAll();
      showToast('Cleared all skills.');
    });
  }

  // PNG Download
  if (btnDownloadPng) {
    btnDownloadPng.addEventListener('click', downloadRadarChartPng);
  }

  // Export HTML Embed
  if (btnExportEmbed) {
    btnExportEmbed.addEventListener('click', () => {
      openEmbedModal();
    });
  }

  // Modal actions
  if (modalClose) modalClose.addEventListener('click', () => modal.style.display = 'none');
  if (btnCloseModal) btnCloseModal.addEventListener('click', () => modal.style.display = 'none');
  if (btnCopyEmbed) {
    btnCopyEmbed.addEventListener('click', () => {
      const codeArea = document.getElementById('embed-code-area');
      navigator.clipboard.writeText(codeArea.value).then(() => {
        showToast('Copied HTML embed snippet!');
      });
    });
  }

  // Initial render
  renderAll();
});

function getProficiencyLabel(level) {
  if (level >= 90) return 'Expert';
  if (level >= 75) return 'Advanced';
  if (level >= 60) return 'Proficient';
  return 'Competent';
}

function renderAll() {
  renderSkillsList();
  renderRadarSvg();
  renderMatrixBars();
}

function renderSkillsList() {
  const container = document.getElementById('skills-list');
  const countEl = document.getElementById('skill-count');
  if (countEl) countEl.textContent = currentSkills.length;
  if (!container) return;

  if (currentSkills.length === 0) {
    container.innerHTML = `
      <div style="text-align: center; color: var(--text-secondary); padding: 2rem 1rem; font-size: 0.85rem;">
        No skills added yet. Use the form above or select a preset to populate.
      </div>
    `;
    return;
  }

  container.innerHTML = currentSkills.map((skill, index) => `
    <div class="skill-item-row">
      <div style="flex: 1; min-width: 0;">
        <div style="display: flex; align-items: center; gap: 0.5rem;">
          <span style="font-weight: 600; font-size: 0.875rem; color: var(--text-primary); white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${skill.name}</span>
          <span class="skill-badge">${skill.category}</span>
        </div>
      </div>
      <div style="display: flex; align-items: center; gap: 0.75rem;">
        <span style="font-size: 0.85rem; font-weight: 700; color: var(--radar-accent);">${skill.level}%</span>
        <button type="button" class="btn btn-secondary" onclick="window.removeSkill(${index})" style="padding: 0.2rem 0.5rem; font-size: 0.75rem; color: var(--error);" title="Remove Skill">
          &times;
        </button>
      </div>
    </div>
  `).join('');
}

// Global hook for inline delete button
window.removeSkill = function(index) {
  if (index >= 0 && index < currentSkills.length) {
    const removed = currentSkills.splice(index, 1)[0];
    renderAll();
    showToast(`Removed "${removed.name}".`);
  }
};

function renderRadarSvg() {
  const svg = document.getElementById('radar-svg');
  if (!svg) return;

  const count = currentSkills.length;
  if (count < 3) {
    svg.innerHTML = `
      <text x="270" y="270" text-anchor="middle" fill="var(--text-secondary)" font-size="16" font-family="sans-serif">
        Please add at least 3 skills to render radar spider chart.
      </text>
    `;
    return;
  }

  const cx = 270;
  const cy = 270;
  const radius = 185;
  const theme = THEMES[currentTheme];

  const levels = [0.2, 0.4, 0.6, 0.8, 1.0];
  let svgContent = '';

  // Defs for gradients & filters
  svgContent += `
    <defs>
      <linearGradient id="radarPolyGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="${theme.primary}" stop-opacity="0.6"/>
        <stop offset="100%" stop-color="${theme.secondary}" stop-opacity="0.3"/>
      </linearGradient>
      <filter id="radarGlowFilter" x="-20%" y="-20%" width="140%" height="140%">
        <feGaussianBlur stdDeviation="4" result="blur" />
        <feComposite in="SourceGraphic" in2="blur" operator="over" />
      </filter>
    </defs>
  `;

  // Concentric background polygon webs
  levels.forEach((lvl) => {
    const r = radius * lvl;
    const ringPoints = [];
    for (let i = 0; i < count; i++) {
      const angle = -Math.PI / 2 + (i * 2 * Math.PI) / count;
      const x = cx + r * Math.cos(angle);
      const y = cy + r * Math.sin(angle);
      ringPoints.push(`${x.toFixed(1)},${y.toFixed(1)}`);
    }
    svgContent += `
      <polygon points="${ringPoints.join(' ')}" 
        fill="none" 
        stroke="${theme.grid}" 
        stroke-width="1.2" 
        stroke-dasharray="${lvl === 1 ? 'none' : '3,3'}" />
      <text x="${cx + 4}" y="${(cy - r + 12).toFixed(1)}" fill="rgba(255,255,255,0.3)" font-size="9" font-family="sans-serif">
        ${Math.round(lvl * 100)}%
      </text>
    `;
  });

  // Spokes from center to edge & axis labels
  const dataPoints = [];
  const coordsList = [];

  for (let i = 0; i < count; i++) {
    const skill = currentSkills[i];
    const angle = -Math.PI / 2 + (i * 2 * Math.PI) / count;
    
    // Outer spoke end
    const spokeX = cx + radius * Math.cos(angle);
    const spokeY = cy + radius * Math.sin(angle);
    svgContent += `
      <line x1="${cx}" y1="${cy}" x2="${spokeX.toFixed(1)}" y2="${spokeY.toFixed(1)}" 
        stroke="${theme.grid}" stroke-width="1.2" />
    `;

    // Label coordinates
    const labelDistance = radius + 32;
    const labelX = cx + labelDistance * Math.cos(angle);
    const labelY = cy + labelDistance * Math.sin(angle);

    let textAnchor = 'middle';
    if (Math.abs(Math.cos(angle)) > 0.3) {
      textAnchor = Math.cos(angle) > 0 ? 'start' : 'end';
    }

    svgContent += `
      <text x="${labelX.toFixed(1)}" y="${(labelY + 4).toFixed(1)}" 
        text-anchor="${textAnchor}" 
        fill="${theme.text}" 
        font-size="11" 
        font-weight="600" 
        font-family="system-ui, sans-serif">
        ${skill.name}
      </text>
    `;

    // Data polygon vertex
    const dataR = radius * (Math.max(5, skill.level) / 100);
    const dataX = cx + dataR * Math.cos(angle);
    const dataY = cy + dataR * Math.sin(angle);
    dataPoints.push(`${dataX.toFixed(1)},${dataY.toFixed(1)}`);
    coordsList.push({ x: dataX, y: dataY, skill });
  }

  // Draw Data Polygon
  svgContent += `
    <polygon points="${dataPoints.join(' ')}" 
      fill="url(#radarPolyGrad)" 
      stroke="${theme.primary}" 
      stroke-width="2.5" 
      filter="url(#radarGlowFilter)" />
  `;

  // Draw interactive data vertices with hover handlers
  coordsList.forEach((item, i) => {
    svgContent += `
      <circle cx="${item.x.toFixed(1)}" cy="${item.y.toFixed(1)}" r="5.5" 
        fill="${theme.secondary}" 
        stroke="#ffffff" 
        stroke-width="2" 
        style="cursor: pointer; transition: r 0.2s;"
        onmouseover="window.showRadarTooltip(event, '${escapeHtml(item.skill.name)}', '${escapeHtml(item.skill.category)}', ${item.skill.level})"
        onmouseout="window.hideRadarTooltip()" />
    `;
  });

  svg.innerHTML = svgContent;
}

window.showRadarTooltip = function(event, name, category, level) {
  const tooltip = document.getElementById('radar-tooltip');
  const container = document.getElementById('radar-container');
  if (!tooltip || !container) return;

  const rect = container.getBoundingClientRect();
  const x = event.clientX - rect.left;
  const y = event.clientY - rect.top;

  tooltip.innerHTML = `
    <strong>${name}</strong> <span style="opacity: 0.7; font-size: 0.75rem;">(${category})</span><br>
    Proficiency: <span style="color: var(--radar-accent); font-weight: 700;">${level}%</span> • ${getProficiencyLabel(level)}
  `;
  tooltip.style.left = `${x}px`;
  tooltip.style.top = `${y}px`;
  tooltip.style.display = 'block';
};

window.hideRadarTooltip = function() {
  const tooltip = document.getElementById('radar-tooltip');
  if (tooltip) tooltip.style.display = 'none';
};

function renderMatrixBars() {
  const container = document.getElementById('matrix-container');
  if (!container) return;

  if (currentSkills.length === 0) {
    container.innerHTML = `<div style="color: var(--text-secondary); font-size: 0.85rem;">No skills to display.</div>`;
    return;
  }

  // Group by category
  const categories = {};
  currentSkills.forEach(s => {
    if (!categories[s.category]) categories[s.category] = [];
    categories[s.category].push(s);
  });

  container.innerHTML = Object.keys(categories).map(cat => `
    <div style="background: var(--bg-tertiary); padding: 1rem; border-radius: var(--radius-md); border: 1px solid var(--border);">
      <div style="font-size: 0.85rem; font-weight: 700; color: var(--radar-accent); text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 0.75rem; display: flex; justify-content: space-between;">
        <span>${cat}</span>
        <span style="font-size: 0.75rem; color: var(--text-secondary);">${categories[cat].length} Skills</span>
      </div>
      ${categories[cat].map(s => `
        <div class="matrix-bar-item">
          <div class="matrix-bar-meta">
            <span style="font-weight: 500; color: var(--text-primary);">${s.name}</span>
            <span style="color: var(--text-secondary); font-size: 0.8rem;">
              <strong style="color: var(--radar-accent);">${s.level}%</strong> • ${getProficiencyLabel(s.level)}
            </span>
          </div>
          <div class="matrix-bar-track">
            <div class="matrix-bar-fill" style="width: ${s.level}%;"></div>
          </div>
        </div>
      `).join('')}
    </div>
  `).join('');
}

function downloadRadarChartPng() {
  const svg = document.getElementById('radar-svg');
  if (!svg || currentSkills.length < 3) {
    showToast('Add at least 3 skills to export radar chart.');
    return;
  }

  const serializer = new XMLSerializer();
  let svgString = serializer.serializeToString(svg);

  // Ensure svg string has dimensions and namespace
  if (!svgString.includes('xmlns="http://www.w3.org/2000/svg"')) {
    svgString = svgString.replace('<svg', '<svg xmlns="http://www.w3.org/2000/svg"');
  }

  const canvas = document.createElement('canvas');
  const size = 1080;
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');

  // Render high-res background
  const bgGrad = ctx.createRadialGradient(size / 2, size / 2, 50, size / 2, size / 2, size / 2);
  bgGrad.addColorStop(0, '#151d2a');
  bgGrad.addColorStop(1, '#070a0e');
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, size, size);

  // Border & Brand watermark
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
  ctx.lineWidth = 4;
  ctx.strokeRect(20, 20, size - 40, size - 40);

  ctx.font = '600 24px Inter, sans-serif';
  ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
  ctx.textAlign = 'center';
  ctx.fillText('Technical Competency Radar Chart', size / 2, 60);

  const img = new Image();
  const svgBlob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
  const url = URL.createObjectURL(svgBlob);

  img.onload = () => {
    // Draw SVG scaled onto canvas
    const padding = 100;
    ctx.drawImage(img, padding, padding, size - padding * 2, size - padding * 2);
    URL.revokeObjectURL(url);

    // Trigger download
    const link = document.createElement('a');
    link.download = `skill-radar-chart-${currentTheme}.png`;
    link.href = canvas.toDataURL('image/png');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Downloaded High-Res Radar Chart PNG.');
  };

  img.src = url;
}

function openEmbedModal() {
  const modal = document.getElementById('embed-modal');
  const codeArea = document.getElementById('embed-code-area');
  const svg = document.getElementById('radar-svg');
  if (!modal || !codeArea || !svg) return;

  const serializer = new XMLSerializer();
  let svgString = serializer.serializeToString(svg);

  const snippet = `<!-- Technical Skills Radar Chart Embed -->
<div class="skills-radar-widget" style="max-width: 500px; margin: 1.5rem auto; background: #0c0f14; padding: 1.5rem; border-radius: 16px; border: 1px solid rgba(255,255,255,0.1); box-shadow: 0 10px 30px rgba(0,0,0,0.5);">
  ${svgString}
</div>`;

  codeArea.value = snippet;
  modal.style.display = 'flex';
}

function escapeHtml(str) {
  return str.replace(/&/g, '&amp;').replace(/'/g, '&#39;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
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