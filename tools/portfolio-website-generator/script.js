// Personal Portfolio Website Generator - Engine

const DEFAULT_PROJECTS = [
  {
    title: "NeuroSynth AI Studio",
    desc: "Real-time client-side procedural audio workstation powered by Web Audio API and WebAssembly.",
    tags: "TypeScript, Web Audio API, Canvas, Next.js",
    link: "https://example.com/demo",
    github: "https://github.com"
  },
  {
    title: "Aura Distributed Gateway",
    desc: "Ultra-low-latency reverse proxy and API routing mesh processing over 50,000 requests per second.",
    tags: "Go, Redis, Docker, gRPC, Prometheus",
    link: "https://example.com/demo2",
    github: "https://github.com"
  },
  {
    title: "Verve E-Commerce Platform",
    desc: "Headless luxury commerce storefront featuring sub-second page transitions and seamless payments.",
    tags: "React, GraphQL, TailwindCSS, Stripe",
    link: "https://example.com/demo3",
    github: "https://github.com"
  }
];

document.addEventListener('DOMContentLoaded', () => {
  let selectedTemplate = 'glass_luxe';
  let selectedAccent = '#00e5ff';
  let projects = JSON.parse(JSON.stringify(DEFAULT_PROJECTS));

  // DOM
  const previewIframe = document.getElementById('previewIframe');
  const btnDownloadHtml = document.getElementById('btnDownloadHtml');
  const btnCopyHtml = document.getElementById('btnCopyHtml');
  const btnAddProject = document.getElementById('btnAddProject');
  const projectsList = document.getElementById('projectsList');

  // Input Elements
  const profName = document.getElementById('profName');
  const profTitle = document.getElementById('profTitle');
  const profLocation = document.getElementById('profLocation');
  const profBio = document.getElementById('profBio');
  const profAvatar = document.getElementById('profAvatar');
  const chkAvailableBadge = document.getElementById('chkAvailableBadge');

  const skillsFrontend = document.getElementById('skillsFrontend');
  const skillsBackend = document.getElementById('skillsBackend');
  const skillsAI = document.getElementById('skillsAI');

  const expRole1 = document.getElementById('expRole1');
  const expDesc1 = document.getElementById('expDesc1');
  const expRole2 = document.getElementById('expRole2');
  const expDesc2 = document.getElementById('expDesc2');

  const contEmail = document.getElementById('contEmail');
  const contGithub = document.getElementById('contGithub');
  const contLinkedin = document.getElementById('contLinkedin');
  const contTwitter = document.getElementById('contTwitter');

  // Template select
  document.querySelectorAll('.tpl-card').forEach(card => {
    card.addEventListener('click', () => {
      document.querySelectorAll('.tpl-card').forEach(c => c.classList.remove('active'));
      card.classList.add('active');
      selectedTemplate = card.dataset.tpl;
      updateLivePreview();
    });
  });

  // Color Swatches
  document.querySelectorAll('.color-swatch').forEach(swatch => {
    swatch.addEventListener('click', () => {
      document.querySelectorAll('.color-swatch').forEach(s => s.classList.remove('active'));
      swatch.classList.add('active');
      selectedAccent = swatch.dataset.color;
      updateLivePreview();
    });
  });

  // Section Tabs
  document.querySelectorAll('.tab-btn').forEach(tab => {
    tab.addEventListener('click', () => {
      document.querySelectorAll('.tab-btn').forEach(t => t.classList.remove('active'));
      document.querySelectorAll('.tab-content').forEach(c => c.style.display = 'none');
      tab.classList.add('active');
      const targetContent = document.getElementById(tab.dataset.tab);
      if (targetContent) targetContent.style.display = 'block';
    });
  });

  // Viewport Switcher
  document.querySelectorAll('.viewport-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.viewport-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      previewIframe.style.width = btn.dataset.width;
    });
  });

  // Projects list manager
  function renderProjectsInputs() {
    projectsList.innerHTML = '';
    projects.forEach((proj, idx) => {
      const card = document.createElement('div');
      card.className = 'project-card-item';
      card.innerHTML = `
        <button type="button" class="btn-del-project" data-idx="${idx}">✕ Delete</button>
        <div class="form-group" style="margin-bottom: 0.35rem;">
          <input type="text" class="form-input proj-title" data-idx="${idx}" value="${proj.title}" placeholder="Project Title" style="font-weight: 700;">
        </div>
        <div class="form-group" style="margin-bottom: 0.35rem;">
          <input type="text" class="form-input proj-desc" data-idx="${idx}" value="${proj.desc}" placeholder="Brief Description">
        </div>
        <div class="form-group" style="margin-bottom: 0.35rem;">
          <input type="text" class="form-input proj-tags" data-idx="${idx}" value="${proj.tags}" placeholder="Technologies (e.g. React, Node.js)">
        </div>
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 0.5rem;">
          <input type="text" class="form-input proj-link" data-idx="${idx}" value="${proj.link}" placeholder="Live Demo URL">
          <input type="text" class="form-input proj-github" data-idx="${idx}" value="${proj.github}" placeholder="GitHub URL">
        </div>
      `;
      projectsList.appendChild(card);
    });

    // Listeners for inputs
    projectsList.querySelectorAll('.proj-title').forEach(inp => {
      inp.addEventListener('input', (e) => { projects[e.target.dataset.idx].title = e.target.value; updateLivePreview(); });
    });
    projectsList.querySelectorAll('.proj-desc').forEach(inp => {
      inp.addEventListener('input', (e) => { projects[e.target.dataset.idx].desc = e.target.value; updateLivePreview(); });
    });
    projectsList.querySelectorAll('.proj-tags').forEach(inp => {
      inp.addEventListener('input', (e) => { projects[e.target.dataset.idx].tags = e.target.value; updateLivePreview(); });
    });
    projectsList.querySelectorAll('.proj-link').forEach(inp => {
      inp.addEventListener('input', (e) => { projects[e.target.dataset.idx].link = e.target.value; updateLivePreview(); });
    });
    projectsList.querySelectorAll('.proj-github').forEach(inp => {
      inp.addEventListener('input', (e) => { projects[e.target.dataset.idx].github = e.target.value; updateLivePreview(); });
    });

    // Delete buttons
    projectsList.querySelectorAll('.btn-del-project').forEach(btn => {
      btn.addEventListener('click', (e) => {
        projects.splice(e.target.dataset.idx, 1);
        renderProjectsInputs();
        updateLivePreview();
      });
    });
  }

  btnAddProject.addEventListener('click', () => {
    projects.push({
      title: "New Featured Project",
      desc: "Innovative web application built for high performance and seamless user experience.",
      tags: "TypeScript, Next.js, TailwindCSS",
      link: "https://example.com",
      github: "https://github.com"
    });
    renderProjectsInputs();
    updateLivePreview();
  });

  // Listen for changes on all input fields
  const allInputs = [
    profName, profTitle, profLocation, profBio, profAvatar, chkAvailableBadge,
    skillsFrontend, skillsBackend, skillsAI,
    expRole1, expDesc1, expRole2, expDesc2,
    contEmail, contGithub, contLinkedin, contTwitter
  ];
  allInputs.forEach(el => el.addEventListener('input', updateLivePreview));
  chkAvailableBadge.addEventListener('change', updateLivePreview);

  // Generate Complete Standalone HTML Code
  function generateCompleteHtml() {
    const name = profName.value.trim() || 'Your Name';
    const title = profTitle.value.trim() || 'Software Engineer';
    const loc = profLocation.value.trim() || 'Worldwide';
    const bio = profBio.value.trim() || 'Passionate engineer building the future of software.';
    const avatar = profAvatar.value.trim() || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80';
    const isAvail = chkAvailableBadge.checked;

    const feSkills = skillsFrontend.value.split(',').map(s => s.trim()).filter(Boolean);
    const beSkills = skillsBackend.value.split(',').map(s => s.trim()).filter(Boolean);
    const aiSkills = skillsAI.value.split(',').map(s => s.trim()).filter(Boolean);
    const allSkills = [...feSkills, ...beSkills, ...aiSkills];

    const email = contEmail.value.trim() || 'hello@example.com';
    const github = contGithub.value.trim() || '#';
    const linkedin = contLinkedin.value.trim() || '#';
    const twitter = contTwitter.value.trim() || '#';

    // Font styling according to template
    let fontFamily = "'Inter', -apple-system, BlinkMacSystemFont, sans-serif";
    if (selectedTemplate === 'cyber_dev') {
      fontFamily = "'JetBrains Mono', 'Fira Code', monospace";
    } else if (selectedTemplate === 'executive') {
      fontFamily = "'Playfair Display', Georgia, serif";
    }

    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${name} &mdash; ${title}</title>
  <meta name="description" content="${bio}">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;800&family=JetBrains+Mono:wght@400;700&family=Playfair+Display:ital,wght@0,600;0,800;1,400&display=swap" rel="stylesheet">
  <style>
    :root {
      --bg: #090c15;
      --card-bg: rgba(18, 24, 38, 0.7);
      --border: rgba(255, 255, 255, 0.08);
      --accent: ${selectedAccent};
      --text: #f0f4fc;
      --text-muted: #94a3b8;
      --font-main: ${fontFamily};
    }
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      background-color: var(--bg);
      color: var(--text);
      font-family: var(--font-main);
      line-height: 1.6;
      padding: 0;
      overflow-x: hidden;
    }
    .container {
      max-width: 1040px;
      margin: 0 auto;
      padding: 3rem 1.5rem;
    }
    /* Hero Header */
    .hero-card {
      background: var(--card-bg);
      backdrop-filter: blur(16px);
      border: 1px solid var(--border);
      border-radius: 24px;
      padding: 2.5rem;
      margin-bottom: 2.5rem;
      box-shadow: 0 10px 40px rgba(0, 0, 0, 0.5), inset 0 0 20px rgba(255, 255, 255, 0.02);
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
    }
    @media (min-width: 768px) {
      .hero-card {
        flex-direction: row;
        align-items: center;
        gap: 2.5rem;
      }
    }
    .avatar-img {
      width: 130px;
      height: 130px;
      border-radius: 50%;
      object-fit: cover;
      border: 3px solid var(--accent);
      box-shadow: 0 0 24px rgba(0, 229, 255, 0.35);
      flex-shrink: 0;
    }
    .badge-pill {
      display: inline-flex;
      align-items: center;
      gap: 0.4rem;
      background: rgba(0, 230, 118, 0.15);
      color: #00e676;
      border: 1px solid rgba(0, 230, 118, 0.3);
      padding: 0.25rem 0.75rem;
      border-radius: 9999px;
      font-size: 0.75rem;
      font-weight: 700;
      margin-bottom: 0.75rem;
    }
    .badge-dot {
      width: 6px;
      height: 6px;
      border-radius: 50%;
      background: currentColor;
    }
    h1 {
      font-size: 2.5rem;
      font-weight: 800;
      letter-spacing: -0.5px;
      color: #fff;
      line-height: 1.15;
      margin-bottom: 0.35rem;
    }
    .hero-title {
      font-size: 1.15rem;
      color: var(--accent);
      font-weight: 600;
      margin-bottom: 0.5rem;
    }
    .hero-loc {
      font-size: 0.85rem;
      color: var(--text-muted);
      margin-bottom: 0.75rem;
    }
    .hero-bio {
      font-size: 1rem;
      color: #cbd5e1;
      max-width: 620px;
    }
    .btn-action {
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      background: var(--accent);
      color: #000;
      font-weight: 700;
      padding: 0.65rem 1.4rem;
      border-radius: 9999px;
      text-decoration: none;
      font-size: 0.9rem;
      transition: transform 0.2s, box-shadow 0.2s;
    }
    .btn-action:hover {
      transform: translateY(-2px);
      box-shadow: 0 0 20px var(--accent);
    }
    /* Section Headings */
    .sec-title {
      font-size: 1.5rem;
      font-weight: 800;
      margin-bottom: 1.25rem;
      color: #fff;
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }
    /* Skills Pills */
    .skills-wrap {
      display: flex;
      flex-wrap: wrap;
      gap: 0.5rem;
      margin-bottom: 3rem;
    }
    .skill-pill {
      background: rgba(255, 255, 255, 0.04);
      border: 1px solid var(--border);
      padding: 0.4rem 0.85rem;
      border-radius: 8px;
      font-size: 0.85rem;
      font-weight: 600;
      color: var(--text);
      transition: border-color 0.2s;
    }
    .skill-pill:hover {
      border-color: var(--accent);
      color: #fff;
    }
    /* Projects Grid */
    .projects-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: 1.25rem;
      margin-bottom: 3rem;
    }
    .project-card {
      background: var(--card-bg);
      border: 1px solid var(--border);
      border-radius: 16px;
      padding: 1.5rem;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      transition: transform 0.2s, border-color 0.2s;
    }
    .project-card:hover {
      transform: translateY(-4px);
      border-color: var(--accent);
    }
    .project-card h3 {
      font-size: 1.2rem;
      color: #fff;
      margin-bottom: 0.5rem;
    }
    .project-card p {
      font-size: 0.9rem;
      color: var(--text-muted);
      margin-bottom: 1rem;
    }
    .project-tags {
      font-size: 0.75rem;
      color: var(--accent);
      font-weight: 700;
      margin-bottom: 1rem;
      font-family: monospace;
    }
    .project-links {
      display: flex;
      gap: 0.75rem;
    }
    .project-link-btn {
      color: #fff;
      text-decoration: none;
      font-size: 0.85rem;
      font-weight: 700;
      display: inline-flex;
      align-items: center;
      gap: 0.3rem;
    }
    .project-link-btn:hover {
      color: var(--accent);
    }
    /* Experience Timeline */
    .timeline {
      display: flex;
      flex-direction: column;
      gap: 1.25rem;
      margin-bottom: 3rem;
    }
    .timeline-item {
      background: var(--card-bg);
      border-left: 3px solid var(--accent);
      padding: 1.25rem;
      border-radius: 0 12px 12px 0;
    }
    .timeline-role {
      font-weight: 700;
      color: #fff;
      margin-bottom: 0.25rem;
    }
    .timeline-desc {
      font-size: 0.9rem;
      color: var(--text-muted);
    }
    /* Footer */
    footer {
      border-top: 1px solid var(--border);
      padding-top: 2rem;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 1rem;
      color: var(--text-muted);
      font-size: 0.85rem;
    }
    .social-links {
      display: flex;
      gap: 1.25rem;
    }
    .social-links a {
      color: var(--text);
      text-decoration: none;
      font-weight: 600;
      transition: color 0.2s;
    }
    .social-links a:hover {
      color: var(--accent);
    }
  </style>
</head>
<body>
  <div class="container">
    <!-- Hero Profile -->
    <header class="hero-card">
      <img src="${avatar}" alt="${name}" class="avatar-img" onerror="this.src='https://via.placeholder.com/130'">
      <div>
        ${isAvail ? `<div class="badge-pill"><span class="badge-dot"></span> AVAILABLE FOR NEW ROLES</div>` : ''}
        <h1>${name}</h1>
        <div class="hero-title">${title}</div>
        <div class="hero-loc">📍 ${loc}</div>
        <p class="hero-bio">${bio}</p>
        <div style="margin-top: 1.25rem;">
          <a href="mailto:${email}" class="btn-action">Get in Touch &rarr;</a>
        </div>
      </div>
    </header>

    <!-- Tech Stack / Skills -->
    <section>
      <h2 class="sec-title">Tech Stack &amp; Skills</h2>
      <div class="skills-wrap">
        ${allSkills.map(s => `<span class="skill-pill">${s}</span>`).join('\n        ')}
      </div>
    </section>

    <!-- Selected Projects -->
    <section>
      <h2 class="sec-title">Selected Projects</h2>
      <div class="projects-grid">
        ${projects.map(p => `
        <div class="project-card">
          <div>
            <h3>${p.title}</h3>
            <p>${p.desc}</p>
          </div>
          <div>
            <div class="project-tags">${p.tags}</div>
            <div class="project-links">
              ${p.link ? `<a href="${p.link}" target="_blank" rel="noopener" class="project-link-btn">Live Demo &rarr;</a>` : ''}
              ${p.github ? `<a href="${p.github}" target="_blank" rel="noopener" class="project-link-btn">GitHub &rarr;</a>` : ''}
            </div>
          </div>
        </div>`).join('')}
      </div>
    </section>

    <!-- Experience -->
    <section>
      <h2 class="sec-title">Experience &amp; Leadership</h2>
      <div class="timeline">
        <div class="timeline-item">
          <div class="timeline-role">${expRole1.value}</div>
          <div class="timeline-desc">${expDesc1.value}</div>
        </div>
        <div class="timeline-item">
          <div class="timeline-role">${expRole2.value}</div>
          <div class="timeline-desc">${expDesc2.value}</div>
        </div>
      </div>
    </section>

    <!-- Footer -->
    <footer>
      <div class="social-links">
        ${contGithub.value ? `<a href="${contGithub.value}" target="_blank" rel="noopener">GitHub</a>` : ''}
        ${contLinkedin.value ? `<a href="${contLinkedin.value}" target="_blank" rel="noopener">LinkedIn</a>` : ''}
        ${contTwitter.value ? `<a href="${contTwitter.value}" target="_blank" rel="noopener">Twitter / X</a>` : ''}
        <a href="mailto:${email}">Email</a>
      </div>
      <div>&copy; ${new Date().getFullYear()} ${name}. Crafted with ALL IN ONE.</div>
    </footer>
  </div>
</body>
</html>`;
  }

  // Update Live Preview Iframe
  function updateLivePreview() {
    const html = generateCompleteHtml();
    previewIframe.srcdoc = html;
  }

  // Download Single-File HTML
  btnDownloadHtml.addEventListener('click', () => {
    const html = generateCompleteHtml();
    const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `index.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  });

  // Copy HTML
  btnCopyHtml.addEventListener('click', () => {
    const html = generateCompleteHtml();
    navigator.clipboard.writeText(html).then(() => {
      const orig = btnCopyHtml.textContent;
      btnCopyHtml.textContent = '✓ Copied HTML';
      setTimeout(() => btnCopyHtml.textContent = orig, 1800);
    });
  });

  // Init
  renderProjectsInputs();
  updateLivePreview();
});