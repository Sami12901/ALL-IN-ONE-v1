// Link Extractor & Anchor Text Auditor - Complete Client-Side Engine
document.addEventListener('DOMContentLoaded', () => {
  // DOM Elements
  const htmlInput = document.getElementById('html-input');
  const baseDomainInput = document.getElementById('base-domain');
  const btnSample = document.getElementById('btn-sample');
  const btnPaste = document.getElementById('btn-paste');
  const btnClear = document.getElementById('btn-clear');
  const charInfo = document.getElementById('char-info');

  // KPI elements
  const kpiTotal = document.getElementById('kpi-total');
  const kpiInternal = document.getElementById('kpi-internal');
  const kpiExternal = document.getElementById('kpi-external');
  const kpiNofollow = document.getElementById('kpi-nofollow');
  const kpiIssues = document.getElementById('kpi-issues');

  // Tab pills and counters
  const tabPills = document.querySelectorAll('.tab-pill');
  const countAll = document.getElementById('count-all');
  const countInternal = document.getElementById('count-internal');
  const countExternal = document.getElementById('count-external');
  const countIssues = document.getElementById('count-issues');

  // Filter & Table
  const searchFilter = document.getElementById('search-filter');
  const tableBody = document.getElementById('table-body');
  const tableSummary = document.getElementById('table-summary');

  // Action Buttons
  const btnCopyUrls = document.getElementById('btn-copy-urls');
  const btnExportCsv = document.getElementById('btn-export-csv');
  const btnExportJson = document.getElementById('btn-export-json');
  const toast = document.getElementById('toast');

  let currentTab = 'all'; // all, internal, external, issues
  let extractedLinks = [];

  const GENERIC_ANCHOR_TEXTS = new Set([
    'click here',
    'click this',
    'here',
    'read more',
    'learn more',
    'more',
    'link',
    'this page',
    'this link',
    'view more',
    'continue reading',
    'check this out',
    'check here',
    'go here',
    'website',
    'site',
    'download now',
    'download',
    'info',
    'details',
    'source'
  ]);

  const SAMPLE_HTML = `<nav class="site-nav">
  <a href="/index.html">Home</a>
  <a href="/about-us">About Us</a>
  <a href="/services/web-development">Services</a>
  <a href="https://example.com/pricing">Pricing Plans</a>
  <a href="/contact">Contact Support</a>
</nav>

<main class="page-content">
  <article>
    <h1>Modern Search Engine Optimization Strategy</h1>
    <p>Comprehensive guide to search crawlability, internal page rank distribution, and anchor relevance.</p>
    
    <p>For official documentation on search ranking signals, <a href="https://developers.google.com/search/docs" target="_blank">click here</a>.</p>
    
    <p>Review the authoritative guidelines from the <a href="https://w3.org/standards" target="_blank" rel="noopener noreferrer">W3C Web Standards Consortium</a>.</p>
    
    <p>Download our legacy analytics whitepaper: <a href="http://insecure-cdn-host.org/download" target="_blank" rel="nofollow">Legacy Network Whitepaper</a>.</p>
    
    <p>Explore detailed technical benchmarks: <a href="/blog/case-studies">read more</a>.</p>
    
    <p>Recommended cloud hosting partner: <a href="https://affiliate-host.com/special-deal" rel="sponsored nofollow" target="_blank">Cloud Hosting Partner</a>.</p>
    
    <p>Open-source contributors can inspect our <a href="https://github.com/example/project" rel="ugc" target="_blank" rel="noopener">GitHub Project Repository</a>.</p>
    
    <p>Direct inquiries: <a href="mailto:support@example.com">Email Technical Support</a> or call <a href="tel:+18005550199">+1 (800) 555-0199</a>.</p>
    
    <p>Interactive dashboard graphic: <a href="/products/analytics"><img src="/img/dashboard.png" alt="Analytics Suite Preview"></a></p>
    
    <p>Interactive trigger: <a href="#"></a></p>
  </article>
</main>`;

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

  function cleanDomain(domainStr) {
    return (domainStr || '')
      .trim()
      .toLowerCase()
      .replace(/^https?:\/\//, '')
      .replace(/\/.*$/, '')
      .replace(/^www\./, '');
  }

  // Extract Links via DOMParser
  function parseLinks(rawHtml, baseDomain) {
    const trimmed = rawHtml.trim();
    if (!trimmed) return [];

    const parser = new DOMParser();
    const doc = parser.parseFromString(trimmed, 'text/html');
    const anchorElements = doc.querySelectorAll('a');

    const links = [];
    const normalizedBaseDomain = cleanDomain(baseDomain);

    anchorElements.forEach((a, idx) => {
      const rawHref = a.getAttribute('href');
      const href = rawHref !== null ? rawHref.trim() : '';

      // Determine Anchor Text
      let anchorText = a.textContent.trim();
      let isImgAnchor = false;
      let imgAlt = '';

      if (!anchorText) {
        const img = a.querySelector('img');
        if (img) {
          isImgAnchor = true;
          imgAlt = (img.getAttribute('alt') || '').trim();
          anchorText = imgAlt ? `[Image: ${imgAlt}]` : '[Image without alt text]';
        }
      }

      // Attributes
      const target = (a.getAttribute('target') || '').trim();
      const rel = (a.getAttribute('rel') || '').trim().toLowerCase();

      // Protocol determination
      let protocol = 'relative';
      let hostname = '';

      if (/^https:\/\//i.test(href)) {
        protocol = 'https';
        try {
          const u = new URL(href);
          hostname = u.hostname.toLowerCase().replace(/^www\./, '');
        } catch {
          hostname = '';
        }
      } else if (/^http:\/\//i.test(href)) {
        protocol = 'http';
        try {
          const u = new URL(href);
          hostname = u.hostname.toLowerCase().replace(/^www\./, '');
        } catch {
          hostname = '';
        }
      } else if (/^mailto:/i.test(href)) {
        protocol = 'mailto';
      } else if (/^tel:/i.test(href)) {
        protocol = 'tel';
      } else if (/^javascript:/i.test(href)) {
        protocol = 'javascript';
      } else if (href.startsWith('#')) {
        protocol = 'hash';
      }

      // Link Type determination (Internal vs External vs Special)
      let type = 'Internal';
      if (['mailto', 'tel', 'javascript'].includes(protocol)) {
        type = 'Special';
      } else if (protocol === 'https' || protocol === 'http') {
        if (normalizedBaseDomain && (hostname === normalizedBaseDomain || hostname.endsWith(`.${normalizedBaseDomain}`))) {
          type = 'Internal';
        } else {
          type = 'External';
        }
      } else {
        // Relative paths or hash links are internal
        type = 'Internal';
      }

      // Rel attributes parsing
      const relTokens = rel ? rel.split(/\s+/).filter(Boolean) : [];
      const isNofollow = relTokens.includes('nofollow');
      const isSponsored = relTokens.includes('sponsored');
      const isUgc = relTokens.includes('ugc');
      const isNoopener = relTokens.includes('noopener');
      const isNoreferrer = relTokens.includes('noreferrer');

      // Auditing & Issues
      const issues = [];

      // 1. Missing anchor text check
      if (!anchorText || anchorText === '[Image without alt text]') {
        issues.push({
          severity: 'err',
          code: 'EMPTY_ANCHOR',
          label: 'Empty Anchor Text',
          description: 'Link has no descriptive text or image alt attribute.'
        });
      } else {
        // 2. Generic anchor text check
        const cleanAnchor = anchorText.toLowerCase().replace(/[^a-z0-9 ]/g, '').trim();
        if (GENERIC_ANCHOR_TEXTS.has(cleanAnchor)) {
          issues.push({
            severity: 'warn',
            code: 'GENERIC_ANCHOR',
            label: 'Generic Anchor Text',
            description: `Generic phrase "${anchorText}" provides weak SEO search context.`
          });
        }
      }

      // 3. Insecure HTTP check
      if (protocol === 'http') {
        issues.push({
          severity: 'warn',
          code: 'INSECURE_HTTP',
          label: 'Insecure HTTP',
          description: 'Link targets unencrypted http: protocol.'
        });
      }

      // 4. Missing noopener on target="_blank"
      if (target === '_blank' && !isNoopener && !isNoreferrer) {
        issues.push({
          severity: 'warn',
          code: 'MISSING_NOOPENER',
          label: 'Missing noopener',
          description: 'Target _blank without rel="noopener" can create security vulnerability.'
        });
      }

      // 5. Empty or placeholder href
      if (!href || href === '#' || href.toLowerCase().startsWith('javascript:void')) {
        issues.push({
          severity: 'warn',
          code: 'VOID_HREF',
          label: 'Empty / Void Link',
          description: 'Link destination is empty, placeholder (#), or void script.'
        });
      }

      links.push({
        id: idx + 1,
        href,
        anchorText,
        isImgAnchor,
        type,
        target,
        rel,
        relTokens,
        isNofollow,
        isSponsored,
        isUgc,
        isNoopener,
        isNoreferrer,
        protocol,
        issues
      });
    });

    return links;
  }

  // Update UI and Statistics
  function updateAudit() {
    const rawHtml = htmlInput.value;
    const baseDomain = baseDomainInput.value;
    charInfo.textContent = `${rawHtml.length.toLocaleString()} characters`;

    extractedLinks = parseLinks(rawHtml, baseDomain);

    // Compute KPIs
    const totalCount = extractedLinks.length;
    const internalCount = extractedLinks.filter(l => l.type === 'Internal').length;
    const externalCount = extractedLinks.filter(l => l.type === 'External').length;
    const nofollowCount = extractedLinks.filter(l => l.isNofollow).length;
    const issuesCount = extractedLinks.filter(l => l.issues.length > 0).length;

    kpiTotal.textContent = totalCount.toLocaleString();
    kpiInternal.textContent = internalCount.toLocaleString();
    kpiExternal.textContent = externalCount.toLocaleString();
    kpiNofollow.textContent = nofollowCount.toLocaleString();
    kpiIssues.textContent = issuesCount.toLocaleString();

    // Tab counts
    countAll.textContent = totalCount.toLocaleString();
    countInternal.textContent = internalCount.toLocaleString();
    countExternal.textContent = externalCount.toLocaleString();
    countIssues.textContent = issuesCount.toLocaleString();

    renderTable();
  }

  // Filter links by active tab & search query
  function getFilteredLinks() {
    const query = (searchFilter.value || '').trim().toLowerCase();

    return extractedLinks.filter(link => {
      // Tab filter
      if (currentTab === 'internal' && link.type !== 'Internal') return false;
      if (currentTab === 'external' && link.type !== 'External') return false;
      if (currentTab === 'issues' && link.issues.length === 0) return false;

      // Search query
      if (query) {
        const matchesHref = link.href.toLowerCase().includes(query);
        const matchesAnchor = link.anchorText.toLowerCase().includes(query);
        const matchesIssues = link.issues.some(i => i.label.toLowerCase().includes(query) || i.description.toLowerCase().includes(query));
        const matchesRel = link.rel.toLowerCase().includes(query);
        if (!matchesHref && !matchesAnchor && !matchesIssues && !matchesRel) return false;
      }

      return true;
    });
  }

  // Render Table
  function renderTable() {
    const filtered = getFilteredLinks();
    tableSummary.textContent = `${filtered.length} link${filtered.length === 1 ? '' : 's'} displayed (${extractedLinks.length} total)`;

    if (filtered.length === 0) {
      if (extractedLinks.length === 0) {
        tableBody.innerHTML = `
          <tr>
            <td colspan="5" style="text-align: center; padding: 3rem 1rem; color: var(--text-tertiary);">
              No links extracted. Paste HTML or click "Sample HTML" to inspect links.
            </td>
          </tr>`;
      } else {
        tableBody.innerHTML = `
          <tr>
            <td colspan="5" style="text-align: center; padding: 2.5rem 1rem; color: var(--text-tertiary);">
              No links matching current filter.
            </td>
          </tr>`;
      }
      return;
    }

    let rowsHtml = '';
    filtered.forEach(link => {
      // Anchor display
      let anchorHtml = escapeHtml(link.anchorText);
      const hasEmptyAnchor = link.issues.some(i => i.code === 'EMPTY_ANCHOR');
      const hasGenericAnchor = link.issues.some(i => i.code === 'GENERIC_ANCHOR');

      if (hasEmptyAnchor) {
        anchorHtml = `<span class="anchor-empty">[Empty Anchor]</span>`;
      } else if (hasGenericAnchor) {
        anchorHtml = `<span class="anchor-generic">${escapeHtml(link.anchorText)}</span>`;
      }

      // Type Badge
      let typeClass = 'type-internal';
      if (link.type === 'External') typeClass = 'type-external';
      if (link.type === 'Special') typeClass = 'type-special';
      const typeBadge = `<span class="type-badge ${typeClass}">${link.type}</span>`;

      // Protocol Badge
      let protoClass = 'proto-other';
      if (link.protocol === 'https') protoClass = 'proto-https';
      if (link.protocol === 'http') protoClass = 'proto-http';
      const protoBadge = `<span class="proto-badge ${protoClass}">${link.protocol.toUpperCase()}</span>`;

      // Rel / Target Pills
      let relPills = [];
      if (link.target) relPills.push(`<span class="proto-badge proto-other">${escapeHtml(link.target)}</span>`);
      if (link.isNofollow) relPills.push(`<span class="proto-badge proto-other" style="color: #f59e0b;">nofollow</span>`);
      if (link.isSponsored) relPills.push(`<span class="proto-badge proto-other" style="color: #c084fc;">sponsored</span>`);
      if (link.isUgc) relPills.push(`<span class="proto-badge proto-other" style="color: #38bdf8;">ugc</span>`);
      if (link.isNoopener) relPills.push(`<span class="proto-badge proto-other">noopener</span>`);
      const relTargetHtml = relPills.length > 0 ? relPills.join(' ') : `<span style="color: var(--text-tertiary); font-size: 0.75rem;">dofollow</span>`;

      // Issues Pills
      let issuesHtml = '';
      if (link.issues.length === 0) {
        issuesHtml = `<span class="issue-pill issue-ok">✓ Clean</span>`;
      } else {
        link.issues.forEach(issue => {
          const cls = issue.severity === 'err' ? 'issue-err' : 'issue-warn';
          issuesHtml += `<span class="issue-pill ${cls}" title="${escapeHtml(issue.description)}">${escapeHtml(issue.label)}</span> `;
        });
      }

      rowsHtml += `
        <tr>
          <td>
            <div class="anchor-text-wrap">
              ${anchorHtml}
            </div>
          </td>
          <td>
            <div style="display: flex; align-items: center; gap: 0.4rem;">
              ${protoBadge}
              <div class="url-cell" title="${escapeHtml(link.href)}">
                <a href="${escapeHtml(link.href)}" target="_blank" rel="noopener noreferrer" class="url-link">
                  ${escapeHtml(link.href || '[no href]')}
                </a>
              </div>
              <button class="btn btn-secondary btn-sm btn-copy-single" data-url="${escapeHtml(link.href)}" title="Copy URL" style="padding: 0.15rem 0.4rem; font-size: 0.72rem; margin-left: auto;">
                Copy
              </button>
            </div>
          </td>
          <td>${typeBadge}</td>
          <td>${relTargetHtml}</td>
          <td>${issuesHtml}</td>
        </tr>`;
    });

    tableBody.innerHTML = rowsHtml;

    // Attach copy buttons
    const copyBtns = tableBody.querySelectorAll('.btn-copy-single');
    copyBtns.forEach(btn => {
      btn.addEventListener('click', async (e) => {
        e.stopPropagation();
        const url = btn.getAttribute('data-url');
        if (url) {
          try {
            await navigator.clipboard.writeText(url);
            showToast('URL copied to clipboard!');
          } catch {
            showToast('Copy failed');
          }
        }
      });
    });
  }

  // Tab Pill Switching
  tabPills.forEach(pill => {
    pill.addEventListener('click', () => {
      tabPills.forEach(p => p.classList.remove('active'));
      pill.classList.add('active');
      currentTab = pill.getAttribute('data-tab');
      renderTable();
    });
  });

  // Event Listeners
  htmlInput.addEventListener('input', () => {
    updateAudit();
  });

  baseDomainInput.addEventListener('input', () => {
    updateAudit();
  });

  searchFilter.addEventListener('input', () => {
    renderTable();
  });

  btnSample.addEventListener('click', () => {
    htmlInput.value = SAMPLE_HTML;
    baseDomainInput.value = 'example.com';
    updateAudit();
    showToast('Sample HTML loaded');
  });

  btnPaste.addEventListener('click', async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text) {
        htmlInput.value = text;
        updateAudit();
        showToast('HTML pasted from clipboard');
      } else {
        showToast('Clipboard is empty');
      }
    } catch {
      showToast('Clipboard permission denied. Please paste manually (Ctrl+V).');
    }
  });

  btnClear.addEventListener('click', () => {
    htmlInput.value = '';
    updateAudit();
    showToast('Input cleared');
  });

  // Copy All URLs
  btnCopyUrls.addEventListener('click', async () => {
    if (extractedLinks.length === 0) {
      showToast('No links to copy');
      return;
    }

    const uniqueUrls = Array.from(new Set(extractedLinks.map(l => l.href).filter(Boolean)));
    const textToCopy = uniqueUrls.join('\n');

    try {
      await navigator.clipboard.writeText(textToCopy);
      showToast(`Copied ${uniqueUrls.length} unique URLs!`);
    } catch {
      showToast('Failed to copy. Please allow clipboard access.');
    }
  });

  // Export CSV
  btnExportCsv.addEventListener('click', () => {
    if (extractedLinks.length === 0) {
      showToast('No links to export');
      return;
    }

    let csv = `Anchor Text,Destination URL,Type,Protocol,Target,Rel,Issues\r\n`;

    extractedLinks.forEach(l => {
      const safeAnchor = `"${(l.anchorText || '').replace(/"/g, '""')}"`;
      const safeUrl = `"${(l.href || '').replace(/"/g, '""')}"`;
      const safeRel = `"${(l.rel || '').replace(/"/g, '""')}"`;
      const safeIssues = `"${l.issues.map(i => i.label).join('; ').replace(/"/g, '""')}"`;

      csv += `${safeAnchor},${safeUrl},${l.type},${l.protocol},${l.target},${safeRel},${safeIssues}\r\n`;
    });

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `links-extracted-report-${Date.now()}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    showToast(`Exported ${extractedLinks.length} links as CSV!`);
  });

  // Export JSON
  btnExportJson.addEventListener('click', () => {
    if (extractedLinks.length === 0) {
      showToast('No links to export');
      return;
    }

    const report = {
      generatedAt: new Date().toISOString(),
      baseDomain: cleanDomain(baseDomainInput.value),
      summary: {
        total: extractedLinks.length,
        internal: extractedLinks.filter(l => l.type === 'Internal').length,
        external: extractedLinks.filter(l => l.type === 'External').length,
        nofollow: extractedLinks.filter(l => l.isNofollow).length,
        issuesFound: extractedLinks.filter(l => l.issues.length > 0).length
      },
      links: extractedLinks.map(l => ({
        id: l.id,
        anchorText: l.anchorText,
        href: l.href,
        type: l.type,
        protocol: l.protocol,
        target: l.target,
        rel: l.rel,
        issues: l.issues.map(i => ({ label: i.label, description: i.description }))
      }))
    };

    const jsonStr = JSON.stringify(report, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `links-extracted-report-${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    showToast('Exported link audit as JSON!');
  });

  // Initial audit
  updateAudit();
});