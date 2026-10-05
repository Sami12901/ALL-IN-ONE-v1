// Heading Outline Checker - On-Page SEO Heading Hierarchy Auditor
document.addEventListener('DOMContentLoaded', () => {
  // DOM Elements
  const htmlInput = document.getElementById('html-input');
  const btnSample = document.getElementById('btn-sample');
  const btnPaste = document.getElementById('btn-paste');
  const btnClear = document.getElementById('btn-clear');

  // KPI elements
  const kpiH1 = document.getElementById('kpi-h1');
  const kpiH2 = document.getElementById('kpi-h2');
  const kpiH3 = document.getElementById('kpi-h3');
  const kpiH46 = document.getElementById('kpi-h46');
  const kpiTotal = document.getElementById('kpi-total');
  const kpiScore = document.getElementById('kpi-score');

  // Checklist & Tree elements
  const checklistItems = document.getElementById('checklist-items');
  const treeContainer = document.getElementById('tree-container');
  const treeSummary = document.getElementById('tree-summary');

  // Actions
  const btnCopyMd = document.getElementById('btn-copy-md');
  const btnCopyText = document.getElementById('btn-copy-text');
  const btnExportJson = document.getElementById('btn-export-json');
  const toast = document.getElementById('toast');

  let currentHeadings = [];
  let currentAudit = null;

  const SAMPLE_DOCUMENT = `<article class="post">
  <header>
    <h1>Architecting Scalable Web Applications: A Complete 2026 Guide</h1>
    <p class="lead">Exploring modern architectural patterns for high-throughput distributed web systems.</p>
  </header>
  
  <section>
    <h2>Understanding Micro-Frontends and Modular Design</h2>
    <p>Choosing between monolithic frontend architectures and modular services requires assessing organizational velocity...</p>
    
    <h3>Decoupling Boundaries with Module Federation</h3>
    <p>How runtime dependency resolution works in modern enterprise tooling...</p>
    
    <h3>Managing Shared State Across Independent Micro-Apps</h3>
    <p>Event buses and reactive state synchronization mechanisms keep interfaces consistent...</p>
  </section>

  <section>
    <h2>Edge Compute and Serverless Performance Optimization</h2>
    <p>Pushing computation to edge locations dramatically decreases latency worldwide...</p>
    
    <h3>Global CDN Edge Workers and Dynamic Routing</h3>
    <p>Executing lightweight JavaScript runtimes closest to your end users...</p>
    
    <h3>Distributed Database Reads and Eventual Consistency</h3>
    <p>Strategies for handling multi-region read replicas with minimal replication lag...</p>
  </section>

  <section>
    <h2>Observability, Reliability, and Core Web Vitals</h2>
    <p>Monitoring critical rendering paths and user engagement indicators...</p>
    
    <h3>Real User Monitoring (RUM) and Synthetic Testing</h3>
    <p>Tracking Largest Contentful Paint (LCP) and Interaction to Next Paint (INP)...</p>
    
    <h3>Distributed Tracing and OpenTelemetry Pipelines</h3>
    <p>Instrumenting distributed traces across asynchronous microservices...</p>
  </section>

  <footer>
    <h2>Conclusion and Next-Generation Strategic Takeaways</h2>
    <p>Summarizing our key architectural recommendations for modern engineering teams.</p>
  </footer>
</article>`;

  function showToast(message) {
    if (!toast) return;
    toast.textContent = message;
    toast.classList.add('show');
    setTimeout(() => {
      toast.classList.remove('show');
    }, 2500);
  }

  function escapeHtml(str) {
    if (!str) return '';
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  // Parse Headings from HTML or Markdown
  function extractHeadings(rawContent) {
    const trimmed = rawContent.trim();
    if (!trimmed) return [];

    const headings = [];

    // Check if content is HTML by testing for HTML tags
    const containsHtmlTags = /<[a-z][\s\S]*>/i.test(trimmed);

    if (containsHtmlTags) {
      try {
        const parser = new DOMParser();
        const doc = parser.parseFromString(trimmed, 'text/html');
        const elements = doc.querySelectorAll('h1, h2, h3, h4, h5, h6');

        elements.forEach((el, index) => {
          const tagName = el.tagName.toLowerCase();
          const level = parseInt(tagName.replace('h', ''), 10);
          const text = el.textContent.trim();
          const id = el.getAttribute('id') || '';

          headings.push({
            index: index + 1,
            level,
            tag: tagName.toUpperCase(),
            text,
            length: text.length,
            id,
            issues: []
          });
        });

        if (headings.length > 0) {
          return headings;
        }
      } catch {
        // Fallback to regex if DOMParser encounters unexpected issue
      }
    }

    // Markdown heading extraction fallback or supplement
    const mdRegex = /^(#{1,6})\s+(.+)$/gm;
    let match;
    let mdIndex = 1;
    while ((match = mdRegex.exec(trimmed)) !== null) {
      const hashes = match[1];
      const level = hashes.length;
      const text = match[2].trim();

      headings.push({
        index: mdIndex++,
        level,
        tag: `H${level}`,
        text,
        length: text.length,
        id: '',
        issues: []
      });
    }

    // If still no headings found and HTML tags present, try a regex scan on HTML tags
    if (headings.length === 0 && containsHtmlTags) {
      const htmlHeadingRegex = /<(h[1-6])(?:\s+[^>]*)?>([\s\S]*?)<\/\1>/gi;
      let htmlMatch;
      let hIndex = 1;
      while ((htmlMatch = htmlHeadingRegex.exec(trimmed)) !== null) {
        const tag = htmlMatch[1].toLowerCase();
        const level = parseInt(tag.charAt(1), 10);
        // Strip inner tags from content
        const cleanText = htmlMatch[2].replace(/<[^>]+>/g, '').trim();

        headings.push({
          index: hIndex++,
          level,
          tag: tag.toUpperCase(),
          text: cleanText,
          length: cleanText.length,
          id: '',
          issues: []
        });
      }
    }

    return headings;
  }

  // Audit Heading SEO Rules & Calculate Score
  function auditHeadings(headings) {
    if (headings.length === 0) {
      return {
        h1Count: 0,
        h2Count: 0,
        h3Count: 0,
        h46Count: 0,
        total: 0,
        score: 100,
        checklist: [
          { status: 'warn', title: 'Single H1 Tag', detail: 'No headings detected. Paste content to audit.' },
          { status: 'warn', title: 'Heading Level Hierarchy', detail: 'Awaiting heading data.' },
          { status: 'warn', title: 'Empty Heading Check', detail: 'Awaiting heading data.' },
          { status: 'warn', title: 'Character Length (20-70 chars)', detail: 'Awaiting heading data.' },
          { status: 'warn', title: 'Document Starts with H1', detail: 'Awaiting heading data.' }
        ]
      };
    }

    let h1Count = 0;
    let h2Count = 0;
    let h3Count = 0;
    let h46Count = 0;
    let emptyCount = 0;
    let skippedLevelsCount = 0;
    let lengthWarningCount = 0;

    let score = 100;

    // First heading check
    const firstIsH1 = headings[0].level === 1;
    if (!firstIsH1) {
      score -= 10;
      headings[0].issues.push({ type: 'warn', msg: `Initial heading is H${headings[0].level}, not H1` });
    }

    // Iterate through headings
    headings.forEach((h, i) => {
      if (h.level === 1) h1Count++;
      else if (h.level === 2) h2Count++;
      else if (h.level === 3) h3Count++;
      else h46Count++;

      // Check for empty heading
      if (h.length === 0) {
        emptyCount++;
        h.issues.push({ type: 'err', msg: 'Empty Heading Tag' });
      } else {
        // Character length check (ideal: 20 - 70)
        if (h.length < 15) {
          lengthWarningCount++;
          h.issues.push({ type: 'warn', msg: `Very Short (${h.length} chars)` });
        } else if (h.length > 70) {
          lengthWarningCount++;
          h.issues.push({ type: 'warn', msg: `Too Long (${h.length} chars)` });
        }
      }

      // Hierarchy sequence check (cannot jump more than 1 level deeper: e.g. H1->H3 or H2->H4)
      if (i > 0) {
        const prev = headings[i - 1];
        if (h.level > prev.level + 1) {
          skippedLevelsCount++;
          h.issues.push({
            type: 'warn',
            msg: `Skipped Level (H${prev.level} → H${h.level})`
          });
        }
      }
    });

    // Score deduction logic
    // H1 check
    let h1Check = { status: 'pass', title: 'Single H1 Tag', detail: 'Optimal. Exactly one H1 tag detected.' };
    if (h1Count === 0) {
      score -= 30;
      h1Check = { status: 'fail', title: 'Single H1 Tag', detail: 'Critical: Missing H1 tag. A page must have an H1 for primary keyword relevance.' };
    } else if (h1Count > 1) {
      score -= 15;
      h1Check = { status: 'warn', title: 'Single H1 Tag', detail: `Warning: Multiple H1 tags found (${h1Count}). Best practice is a single primary H1.` };
    }

    // Hierarchy check
    let hierarchyCheck = { status: 'pass', title: 'Heading Level Flow', detail: 'Optimal. Heading levels progress smoothly without skipped steps.' };
    if (skippedLevelsCount > 0) {
      score -= Math.min(30, skippedLevelsCount * 10);
      hierarchyCheck = { status: 'warn', title: 'Heading Level Flow', detail: `${skippedLevelsCount} skipped heading level jump(s) detected (e.g., H2 directly to H4).` };
    }

    // Empty heading check
    let emptyCheck = { status: 'pass', title: 'Non-Empty Headings', detail: 'Optimal. All headings contain descriptive text.' };
    if (emptyCount > 0) {
      score -= Math.min(30, emptyCount * 15);
      emptyCheck = { status: 'fail', title: 'Non-Empty Headings', detail: `${emptyCount} empty heading tag(s) detected. Empty tags dilute SEO value.` };
    }

    // Length check
    let lengthCheck = { status: 'pass', title: 'Heading Lengths (20-70 chars)', detail: 'Optimal. Headings are concise, descriptive, and within target lengths.' };
    if (lengthWarningCount > 0) {
      score -= Math.min(15, Math.ceil((lengthWarningCount / headings.length) * 15));
      lengthCheck = { status: 'warn', title: 'Heading Lengths (20-70 chars)', detail: `${lengthWarningCount} heading(s) outside recommended 20-70 character range.` };
    }

    // Starts with H1 check
    let startsWithH1Check = { status: 'pass', title: 'First Heading is H1', detail: 'Optimal. The document starts cleanly with an H1 heading.' };
    if (!firstIsH1) {
      startsWithH1Check = { status: 'warn', title: 'First Heading is H1', detail: `Warning: The document begins with an H${headings[0].level} instead of an H1.` };
    }

    // Clamp score
    score = Math.max(0, Math.min(100, Math.round(score)));

    return {
      h1Count,
      h2Count,
      h3Count,
      h46Count,
      total: headings.length,
      score,
      checklist: [
        h1Check,
        hierarchyCheck,
        emptyCheck,
        lengthCheck,
        startsWithH1Check
      ]
    };
  }

  // Update UI with audit results
  function renderAudit() {
    const text = htmlInput.value;
    currentHeadings = extractHeadings(text);
    currentAudit = auditHeadings(currentHeadings);

    // Update KPIs
    kpiH1.textContent = currentAudit.h1Count;
    kpiH2.textContent = currentAudit.h2Count;
    kpiH3.textContent = currentAudit.h3Count;
    kpiH46.textContent = currentAudit.h46Count;
    kpiTotal.textContent = currentAudit.total;

    // Score color & value
    kpiScore.textContent = `${currentAudit.score}%`;
    if (currentAudit.score >= 90) {
      kpiScore.style.color = '#10b981'; // Green
    } else if (currentAudit.score >= 70) {
      kpiScore.style.color = '#f59e0b'; // Amber
    } else {
      kpiScore.style.color = '#ef4444'; // Red
    }

    // Render Checklist
    let checklistHtml = '';
    currentAudit.checklist.forEach(item => {
      let icon = '✓';
      let iconClass = 'check-pass';
      if (item.status === 'warn') {
        icon = '⚠';
        iconClass = 'check-warn';
      } else if (item.status === 'fail') {
        icon = '✗';
        iconClass = 'check-fail';
      }

      checklistHtml += `
        <div class="check-item">
          <span class="check-icon ${iconClass}">${icon}</span>
          <div>
            <strong style="color: var(--text-primary);">${escapeHtml(item.title)}:</strong>
            <span style="display: block; font-size: 0.8rem; color: var(--text-secondary);">${escapeHtml(item.detail)}</span>
          </div>
        </div>`;
    });
    checklistItems.innerHTML = checklistHtml;

    // Render Tree
    treeSummary.textContent = `${currentHeadings.length} headings detected`;

    if (currentHeadings.length === 0) {
      treeContainer.innerHTML = `
        <div style="text-align: center; padding: 3.5rem 1rem; color: var(--text-tertiary);">
          No headings detected in input. Enter HTML markup or click "Sample Doc" to inspect page outline.
        </div>`;
      return;
    }

    let treeHtml = '';
    currentHeadings.forEach(h => {
      const indentRem = (h.level - 1) * 1.25;
      const hasError = h.issues.some(i => i.type === 'err');
      const hasWarn = h.issues.some(i => i.type === 'warn');
      const nodeClass = hasError ? 'has-error' : (hasWarn ? 'has-issue' : '');

      let issuesHtml = '';
      h.issues.forEach(issue => {
        const cls = issue.type === 'err' ? 'err' : 'warn';
        issuesHtml += `<span class="issue-tag ${cls}">${escapeHtml(issue.msg)}</span>`;
      });

      const charWarning = h.length < 15 || h.length > 70;
      const charBadgeClass = charWarning ? 'char-badge warning' : 'char-badge';

      treeHtml += `
        <div class="tree-node ${nodeClass}" style="margin-left: ${indentRem}rem;">
          <div class="tree-node-header">
            <div class="tree-node-meta">
              <span class="badge-h badge-h${h.level}">${h.tag}</span>
              <span class="${charBadgeClass}">${h.length} chars</span>
              ${h.id ? `<span style="font-size: 0.72rem; color: var(--text-tertiary); font-family: monospace;">#${escapeHtml(h.id)}</span>` : ''}
            </div>
            <div style="display: flex; gap: 0.35rem; align-items: center;">
              ${issuesHtml}
            </div>
          </div>
          <div class="tree-node-title ${h.length === 0 ? 'empty-title' : ''}">
            ${h.length === 0 ? '[Empty Heading]' : escapeHtml(h.text)}
          </div>
        </div>`;
    });

    treeContainer.innerHTML = treeHtml;
  }

  // Event Listeners
  htmlInput.addEventListener('input', () => {
    renderAudit();
  });

  btnSample.addEventListener('click', () => {
    htmlInput.value = SAMPLE_DOCUMENT;
    renderAudit();
    showToast('Sample document loaded');
  });

  btnPaste.addEventListener('click', async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text) {
        htmlInput.value = text;
        renderAudit();
        showToast('Pasted from clipboard');
      } else {
        showToast('Clipboard is empty');
      }
    } catch {
      showToast('Clipboard permission denied. Please paste manually (Ctrl+V).');
    }
  });

  btnClear.addEventListener('click', () => {
    htmlInput.value = '';
    renderAudit();
    showToast('Input cleared');
  });

  // Action: Copy Outline as Markdown
  btnCopyMd.addEventListener('click', async () => {
    if (currentHeadings.length === 0) {
      showToast('No headings to copy');
      return;
    }

    let md = '';
    currentHeadings.forEach(h => {
      const prefix = '#'.repeat(h.level);
      md += `${prefix} ${h.text || '[Empty Heading]'}\n`;
    });

    try {
      await navigator.clipboard.writeText(md);
      showToast('Outline copied as Markdown!');
    } catch {
      showToast('Failed to copy. Please allow clipboard access.');
    }
  });

  // Action: Copy as Text
  btnCopyText.addEventListener('click', async () => {
    if (currentHeadings.length === 0) {
      showToast('No headings to copy');
      return;
    }

    let textOutline = '';
    currentHeadings.forEach(h => {
      const indent = '  '.repeat(h.level - 1);
      textOutline += `${indent}${h.tag}: ${h.text || '[Empty Heading]'} (${h.length} chars)\n`;
    });

    try {
      await navigator.clipboard.writeText(textOutline);
      showToast('Outline copied as Text!');
    } catch {
      showToast('Failed to copy. Please allow clipboard access.');
    }
  });

  // Action: Export JSON Report
  btnExportJson.addEventListener('click', () => {
    if (currentHeadings.length === 0) {
      showToast('No heading data to export');
      return;
    }

    const report = {
      generatedAt: new Date().toISOString(),
      seoScore: currentAudit.score,
      summary: {
        totalHeadings: currentAudit.total,
        h1Count: currentAudit.h1Count,
        h2Count: currentAudit.h2Count,
        h3Count: currentAudit.h3Count,
        h4to6Count: currentAudit.h46Count
      },
      auditChecklist: currentAudit.checklist,
      headings: currentHeadings.map(h => ({
        index: h.index,
        tag: h.tag,
        level: h.level,
        text: h.text,
        characterLength: h.length,
        idAttribute: h.id || null,
        issues: h.issues.map(i => i.msg)
      }))
    };

    const jsonStr = JSON.stringify(report, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `heading-outline-audit-${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    showToast('Exported audit report as JSON!');
  });

  // Initial check
  renderAudit();
});