// Blog Outline Generator - Client-Side Interactive Engine

const RANDOM_TOPICS = [
  {
    title: "10 Proven Strategies to Scale Remote Teams in 2026",
    length: "medium",
    tone: "authoritative",
    audience: "Startup Founders & Engineering Leaders",
    keyword: "scale remote teams"
  },
  {
    title: "How to Build an AI-Powered Customer Support Flywheel",
    length: "long",
    tone: "practical",
    audience: "SaaS Product Managers & Operations Executives",
    keyword: "AI customer support automation"
  },
  {
    title: "The Ultimate Guide to B2B Email Cold Outreach That Converts",
    length: "medium",
    tone: "conversational",
    audience: "B2B Sales Reps & Growth Marketers",
    keyword: "B2B cold outreach email"
  },
  {
    title: "5 Habit Stacks to Reclaim 15 Hours of Focus Every Week",
    length: "short",
    tone: "practical",
    audience: "Busy Professionals & Knowledge Workers",
    keyword: "deep work habit stacks"
  },
  {
    title: "A Complete Blueprint to Next-Generation E-Commerce SEO",
    length: "long",
    tone: "authoritative",
    audience: "E-Commerce Founders & Digital Agencies",
    keyword: "ecommerce SEO strategy"
  }
];

document.addEventListener('DOMContentLoaded', () => {
  // Elements
  const titleInput = document.getElementById('title-input');
  const lengthSelect = document.getElementById('length-select');
  const toneSelect = document.getElementById('tone-select');
  const audienceInput = document.getElementById('audience-input');
  const keywordInput = document.getElementById('keyword-input');
  const generateBtn = document.getElementById('generate-btn');
  const randomBtn = document.getElementById('random-btn');
  const copyMarkdownBtn = document.getElementById('copy-markdown-btn');
  const downloadMdBtn = document.getElementById('download-md-btn');
  const appToast = document.getElementById('app-toast');

  // Metrics Elements
  const metricWordCount = document.getElementById('metric-word-count');
  const metricReadingTime = document.getElementById('metric-reading-time');
  const metricH2Count = document.getElementById('metric-h2-count');
  const metricH3Count = document.getElementById('metric-h3-count');

  // Views
  const cardContainer = document.getElementById('outline-card-container');
  const markdownDisplay = document.getElementById('markdown-code-display');
  const viewTabButtons = document.querySelectorAll('.view-tab-btn');
  const viewPanes = document.querySelectorAll('.outline-view-pane');

  let currentOutlineData = null;
  let cachedMarkdown = '';

  // Toast Helper
  let toastTimer = null;
  function showToast(message) {
    if (toastTimer) clearTimeout(toastTimer);
    appToast.textContent = message;
    appToast.classList.add('show');
    toastTimer = setTimeout(() => {
      appToast.classList.remove('show');
    }, 2400);
  }

  // Helper to extract clean topic
  function cleanTitle(str) {
    return (str || 'Complete Guide').trim();
  }

  // Outline Generation Logic
  function buildOutline() {
    const rawTitle = cleanTitle(titleInput.value);
    const lengthType = lengthSelect.value;
    const tone = toneSelect.options[toneSelect.selectedIndex].text;
    const audience = audienceInput.value.trim() || 'Modern Professionals';
    const keyword = keywordInput.value.trim() || rawTitle.split(/\s+/).slice(0, 3).join(' ');

    // Determine section depth and word count
    let targetWords = 2200;
    let h2Target = 5;
    if (lengthType === 'short') {
      targetWords = 1100;
      h2Target = 4;
    } else if (lengthType === 'long') {
      targetWords = 3800;
      h2Target = 7;
    }
    const readingTime = Math.ceil(targetWords / 220);

    // Intro Hook
    const introSection = {
      tag: 'intro',
      title: 'Introduction & Strategic Context',
      hook: `Why ${keyword} has become the make-or-break differentiator for ${audience}.`,
      problem: `Conventional wisdom surrounding ${rawTitle.toLowerCase()} is often outdated, leading to wasted time and missed growth targets.`,
      promise: `In this guide, you will discover the exact frameworks, battle-tested workflows, and action steps to master ${keyword} without fluff.`,
      talkingPoints: [
        `The current landscape and macro shifts affecting ${audience}`,
        `The costly mistakes most practitioners make when starting out`,
        `Roadmap of this guide and what tangible outcomes you will achieve`
      ]
    };

    // Body H2 Sections
    const h2Sections = [];

    // Core H2 Bank tailored dynamically
    const sectionTemplates = [
      {
        title: `1. Foundational Principles: Understanding the Core Pillars of ${keyword}`,
        h3s: [
          {
            title: `Deconstructing the Mechanics of ${keyword}`,
            points: [
              `Core mental models every high performer must internalize`,
              `Key metrics and KPIs to measure baseline performance`,
              `Setting realistic milestones and tracking progress`
            ]
          },
          {
            title: `Essential Tools, Infrastructure & Pre-Requisites`,
            points: [
              `Selecting the right tech stack or operational toolkit`,
              `Minimizing friction during initial setup`,
              `Audit checklist before investing further resources`
            ]
          }
        ]
      },
      {
        title: `2. Strategic Execution: Step-by-Step Implementation Framework`,
        h3s: [
          {
            title: `Phase 1: Diagnostic Assessment & Prioritization`,
            points: [
              `Identifying high-impact bottleneck areas`,
              `Low-hanging fruit vs. long-term compound initiatives`,
              `Structuring team alignment and clear ownership`
            ]
          },
          {
            title: `Phase 2: Executing the Primary Strategy`,
            points: [
              `Daily and weekly operational rhythms for sustainable momentum`,
              `Real-world workflow walkthrough and execution tactics`,
              `Handling edge cases and common roadblocks`
            ]
          },
          {
            title: `Phase 3: Validation & Quality Control`,
            points: [
              `Establishing feedback loops and iterative reviews`,
              `Data-backed signals that confirm you are on the right track`,
              `Adjusting course quickly without losing momentum`
            ]
          }
        ]
      },
      {
        title: `3. Advanced Optimization & High-Impact Acceleration Tactics`,
        h3s: [
          {
            title: `Unlocking 10x Efficiency Through Automation & Smart Systems`,
            points: [
              `Automating recurring, low-value administrative tasks`,
              `Leveraging modern AI tooling to multiply team output`,
              `Protecting creative and strategic headspace`
            ]
          },
          {
            title: `Scalability Playbook: Avoiding the Growth Ceiling`,
            points: [
              `How to scale without proportionally increasing overhead`,
              `Documentation best practices and repeatable SOPs`,
              `Cross-training and delegating with full confidence`
            ]
          }
        ]
      },
      {
        title: `4. Common Pitfalls, Costly Misconceptions & How to Avoid Them`,
        h3s: [
          {
            title: `The Top 3 Traps That Derail Even Experienced ${audience}`,
            points: [
              `Mistake #1: Over-optimizing before establishing consistency`,
              `Mistake #2: Ignoring feedback loops and customer / user signals`,
              `Mistake #3: Burning out by resisting systematization`
            ]
          },
          {
            title: `The Antidote: Risk Mitigation & Resilience Checklists`,
            points: [
              `Early warning signs to monitor before minor bugs become crises`,
              `Emergency pivot protocols when experiments stall`,
              `Building psychological safety and sustainable focus`
            ]
          }
        ]
      },
      {
        title: `5. Real-World Case Studies & Practical Application Examples`,
        h3s: [
          {
            title: `Teardown: How a Top Practitioner Applied This Playbook`,
            points: [
              `The initial situation, constraints, and baseline numbers`,
              `The exact chronological changes deployed over 90 days`,
              `Measurable ROI, qualitative outcomes, and key lessons`
            ]
          },
          {
            title: `Key Takeaways & Replicable Blueprint`,
            points: [
              `What you can copy directly starting this week`,
              `Nuances and variations depending on team or project size`,
              `Adapting the playbook for diverse operating environments`
            ]
          }
        ]
      },
      {
        title: `6. Future Trends & Emerging Paradigms in ${keyword}`,
        h3s: [
          {
            title: `Where the Industry Is Headed in 2026 and Beyond`,
            points: [
              `Shifts in consumer behavior, technology, and compliance`,
              `Preparing your systems today for next year's standards`,
              `How proactive innovators stay ahead of commoditization`
            ]
          },
          {
            title: `Building Long-Term Sustainable Moats`,
            points: [
              `Cultivating proprietary expertise and brand loyalty`,
              `Community-driven feedback loops as unfair competitive advantages`,
              `Future-proofing your skills against automated disruption`
            ]
          }
        ]
      },
      {
        title: `7. Resource Directory, Recommended Tooling & Quick Reference`,
        h3s: [
          {
            title: `Curated Stack of Top Software, Books & Communities`,
            points: [
              `The top 5 must-have tools for modern teams`,
              `Influential books and newsletters for ongoing mastery`,
              `Peer communities and networks to accelerate learning`
            ]
          },
          {
            title: `Frequently Asked Questions (FAQ) Deep Dive`,
            points: [
              `How long does it typically take to see measurable results?`,
              `What budget or resources are required to get started?`,
              `How to sell this initiative internally to senior stakeholders`
            ]
          }
        ]
      }
    ];

    // Pick appropriate number of sections based on length
    for (let i = 0; i < Math.min(h2Target, sectionTemplates.length); i++) {
      h2Sections.push(sectionTemplates[i]);
    }

    // Conclusion & CTA Section
    const conclusionSection = {
      tag: 'conclusion',
      title: 'Conclusion & Next Steps Action Plan',
      summary: `Recap of the core tenets of ${rawTitle.toLowerCase()} and key mindset shifts required for sustainable success.`,
      cta: `Ready to implement? Download our free action checklist, join our private community of ${audience}, and start your 30-day challenge today.`,
      talkingPoints: [
        `Summary checklist of the top 3 action items to execute today`,
        `Mindset shift: Commit to deliberate practice and continuous iteration`,
        `Compelling Call-to-Action (CTA): Invite readers to leave comments or grab the free companion resource`
      ]
    };

    // Calculate total H3s
    let totalH3 = 0;
    h2Sections.forEach(sec => {
      totalH3 += sec.h3s.length;
    });

    currentOutlineData = {
      title: rawTitle,
      lengthType,
      targetWords,
      readingTime,
      tone,
      audience,
      keyword,
      introSection,
      h2Sections,
      conclusionSection,
      totalH2: h2Sections.length,
      totalH3
    };

    renderMetrics();
    renderVisualCardView();
    generateMarkdownString();
  }

  // Update Top Metrics Cards
  function renderMetrics() {
    if (!currentOutlineData) return;
    metricWordCount.textContent = currentOutlineData.targetWords.toLocaleString();
    metricReadingTime.textContent = `${currentOutlineData.readingTime} min`;
    metricH2Count.textContent = currentOutlineData.totalH2;
    metricH3Count.textContent = currentOutlineData.totalH3;
  }

  // Render Visual Card View
  function renderVisualCardView() {
    if (!currentOutlineData) return;

    let html = '';

    // Intro Card
    const intro = currentOutlineData.introSection;
    html += `
      <div class="outline-section-card">
        <div class="outline-section-header">
          <div style="display: flex; align-items: center; gap: 0.6rem;">
            <span class="section-tag-intro">Introduction</span>
            <div class="section-title-text">${escapeHtml(intro.title)}</div>
          </div>
          <button class="mini-btn copy-sec-btn" data-copy-type="intro">
            <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
            Copy
          </button>
        </div>
        
        <div style="font-size: 0.85rem; color: var(--text-primary); margin-bottom: 0.5rem; line-height: 1.5;">
          <strong>Attention Hook:</strong> ${escapeHtml(intro.hook)}
        </div>
        <div style="font-size: 0.85rem; color: var(--text-secondary); margin-bottom: 0.5rem; line-height: 1.5;">
          <strong>Core Problem:</strong> ${escapeHtml(intro.problem)}
        </div>
        <div style="font-size: 0.85rem; color: var(--accent-light); margin-bottom: 0.75rem; line-height: 1.5;">
          <strong>Reader Promise:</strong> ${escapeHtml(intro.promise)}
        </div>

        <div style="font-size: 0.8rem; font-weight: 600; color: var(--text-secondary); margin-top: 0.4rem;">Key Elements to Cover:</div>
        <ul class="talking-points">
          ${intro.talkingPoints.map(tp => `<li>${escapeHtml(tp)}</li>`).join('')}
        </ul>
      </div>
    `;

    // H2 & H3 Cards
    currentOutlineData.h2Sections.forEach((h2, idx) => {
      html += `
        <div class="outline-section-card">
          <div class="outline-section-header">
            <div style="display: flex; align-items: center; gap: 0.6rem; flex: 1;">
              <span class="section-tag-h2">H2 Section</span>
              <div class="section-title-text">${escapeHtml(h2.title)}</div>
            </div>
            <button class="mini-btn copy-sec-btn" data-copy-type="h2" data-index="${idx}">
              <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
              Copy
            </button>
          </div>

          <!-- H3 Subsections -->
          <div style="display: flex; flex-direction: column; gap: 0.6rem; margin-top: 0.5rem;">
            ${h2.h3s.map(h3 => `
              <div class="h3-item">
                <div class="h3-title">
                  <span style="font-size: 0.7rem; color: var(--accent); background: rgba(78, 133, 191, 0.2); padding: 1px 5px; border-radius: 3px;">H3</span>
                  ${escapeHtml(h3.title)}
                </div>
                <ul class="talking-points">
                  ${h3.points.map(pt => `<li>${escapeHtml(pt)}</li>`).join('')}
                </ul>
              </div>
            `).join('')}
          </div>
        </div>
      `;
    });

    // Conclusion Card
    const conc = currentOutlineData.conclusionSection;
    html += `
      <div class="outline-section-card">
        <div class="outline-section-header">
          <div style="display: flex; align-items: center; gap: 0.6rem;">
            <span class="section-tag-conclusion">Conclusion & CTA</span>
            <div class="section-title-text">${escapeHtml(conc.title)}</div>
          </div>
          <button class="mini-btn copy-sec-btn" data-copy-type="conclusion">
            <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
            Copy
          </button>
        </div>

        <div style="font-size: 0.85rem; color: var(--text-primary); margin-bottom: 0.5rem; line-height: 1.5;">
          <strong>Executive Summary:</strong> ${escapeHtml(conc.summary)}
        </div>
        <div style="font-size: 0.85rem; color: #fbbf24; margin-bottom: 0.75rem; line-height: 1.5; background: rgba(245, 158, 11, 0.08); padding: 0.6rem; border-radius: var(--radius-sm); border: 1px solid rgba(245, 158, 11, 0.2);">
          <strong>Call to Action (CTA):</strong> ${escapeHtml(conc.cta)}
        </div>

        <div style="font-size: 0.8rem; font-weight: 600; color: var(--text-secondary); margin-top: 0.4rem;">Final Section Takeaways:</div>
        <ul class="talking-points">
          ${conc.talkingPoints.map(tp => `<li>${escapeHtml(tp)}</li>`).join('')}
        </ul>
      </div>
    `;

    cardContainer.innerHTML = html;

    // Attach individual copy button listeners
    cardContainer.querySelectorAll('.copy-sec-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const type = btn.dataset.copyType;
        let textToCopy = '';
        if (type === 'intro') {
          textToCopy = `## Introduction\n\n- Hook: ${intro.hook}\n- Problem: ${intro.problem}\n- Value Promise: ${intro.promise}\n\nTalking Points:\n` +
            intro.talkingPoints.map(t => `- ${t}`).join('\n');
        } else if (type === 'h2') {
          const idx = parseInt(btn.dataset.index, 10);
          const h2 = currentOutlineData.h2Sections[idx];
          textToCopy = `## ${h2.title}\n\n` + h2.h3s.map(h3 => `### ${h3.title}\n` + h3.points.map(p => `- ${p}`).join('\n')).join('\n\n');
        } else if (type === 'conclusion') {
          textToCopy = `## Conclusion\n\n- Summary: ${conc.summary}\n- Call to Action: ${conc.cta}\n\nFinal Takeaways:\n` +
            conc.talkingPoints.map(t => `- ${t}`).join('\n');
        }

        navigator.clipboard.writeText(textToCopy).then(() => {
          showToast('Copied section to clipboard!');
        });
      });
    });
  }

  // Generate Clean Markdown String
  function generateMarkdownString() {
    if (!currentOutlineData) return;

    let md = `# ${currentOutlineData.title}\n\n`;
    md += `> **Target Word Count:** ${currentOutlineData.targetWords.toLocaleString()} words  \n`;
    md += `> **Estimated Reading Time:** ${currentOutlineData.readingTime} minutes  \n`;
    md += `> **Tone:** ${currentOutlineData.tone}  \n`;
    md += `> **Target Audience:** ${currentOutlineData.audience}  \n`;
    md += `> **Primary Keyword:** ${currentOutlineData.keyword}\n\n`;
    md += `---\n\n`;

    // Intro
    const intro = currentOutlineData.introSection;
    md += `## Introduction\n\n`;
    md += `* **Hook:** ${intro.hook}\n`;
    md += `* **Core Problem:** ${intro.problem}\n`;
    md += `* **Reader Promise:** ${intro.promise}\n\n`;
    md += `**Key Talking Points:**\n`;
    intro.talkingPoints.forEach(p => {
      md += `* ${p}\n`;
    });
    md += `\n---\n\n`;

    // H2 & H3s
    currentOutlineData.h2Sections.forEach(h2 => {
      md += `## ${h2.title}\n\n`;
      h2.h3s.forEach(h3 => {
        md += `### ${h3.title}\n\n`;
        h3.points.forEach(pt => {
          md += `* ${pt}\n`;
        });
        md += `\n`;
      });
      md += `---\n\n`;
    });

    // Conclusion
    const conc = currentOutlineData.conclusionSection;
    md += `## ${conc.title}\n\n`;
    md += `* **Executive Summary:** ${conc.summary}\n`;
    md += `* **Call to Action (CTA):** ${conc.cta}\n\n`;
    md += `**Final Steps:**\n`;
    conc.talkingPoints.forEach(p => {
      md += `* ${p}\n`;
    });

    cachedMarkdown = md;
    markdownDisplay.textContent = md;
  }

  // Escape HTML helper
  function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  // View Tab Switching
  viewTabButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const viewId = btn.dataset.view;
      viewTabButtons.forEach(b => b.classList.remove('active'));
      viewPanes.forEach(p => p.style.display = 'none');

      btn.classList.add('active');
      const targetPane = document.getElementById(viewId);
      if (targetPane) targetPane.style.display = 'block';
    });
  });

  // Copy Full Markdown
  copyMarkdownBtn.addEventListener('click', () => {
    if (!cachedMarkdown) {
      showToast('No outline generated yet');
      return;
    }
    navigator.clipboard.writeText(cachedMarkdown).then(() => {
      showToast('Copied complete Markdown outline!');
    });
  });

  // Download .md File
  downloadMdBtn.addEventListener('click', () => {
    if (!cachedMarkdown) {
      showToast('No outline generated yet');
      return;
    }

    const titleSlug = (titleInput.value.trim() || 'blog-outline')
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '-')
      .replace(/-+/g, '-');

    const blob = new Blob([cachedMarkdown], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${titleSlug}-outline.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showToast('Downloaded .md outline file!');
  });

  // Generate Button Click
  generateBtn.addEventListener('click', () => {
    if (!titleInput.value.trim()) {
      showToast('Please provide an article title or topic');
      titleInput.focus();
      return;
    }
    buildOutline();
    showToast('Generated comprehensive structured outline!');
  });

  // Enter Key on Input
  titleInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      generateBtn.click();
    }
  });

  // Random Topic Button Click
  randomBtn.addEventListener('click', () => {
    const randomItem = RANDOM_TOPICS[Math.floor(Math.random() * RANDOM_TOPICS.length)];
    titleInput.value = randomItem.title;
    lengthSelect.value = randomItem.length;
    toneSelect.value = randomItem.tone;
    audienceInput.value = randomItem.audience;
    keywordInput.value = randomItem.keyword;
    buildOutline();
    showToast(`Loaded: "${randomItem.title}"`);
  });

  // Initial Run on Load
  buildOutline();
});