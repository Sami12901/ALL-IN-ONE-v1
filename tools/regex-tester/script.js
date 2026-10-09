// Regex Tester - Interactive Regular Expression Playground
document.addEventListener('DOMContentLoaded', () => {
  // DOM References
  const patternInput = document.getElementById('regex-pattern');
  const testStringInput = document.getElementById('test-string');
  const highlightStage = document.getElementById('highlight-stage');
  const regexErrorBox = document.getElementById('regex-error-box');
  const regexErrorMsg = document.getElementById('regex-error-msg');

  // Action Buttons
  const btnSample = document.getElementById('btn-sample');
  const btnClear = document.getElementById('btn-clear');
  const btnCopyRegex = document.getElementById('btn-copy-regex');
  const btnToggleCheatSheet = document.getElementById('btn-toggle-cheatsheet');
  const btnCloseCheatSheet = document.getElementById('btn-close-cheatsheet');
  const cheatSheetDrawer = document.getElementById('cheat-sheet-drawer');
  const cheatSheetGrid = document.getElementById('cheat-sheet-grid');

  // Flag buttons
  const flagButtons = document.querySelectorAll('.flag-toggle');

  // KPI Elements
  const kpiMatchCount = document.getElementById('kpi-match-count');
  const kpiMatchSub = document.getElementById('kpi-match-sub');
  const kpiGroupsCount = document.getElementById('kpi-groups-count');
  const kpiCoverage = document.getElementById('kpi-coverage');
  const kpiCoverageSub = document.getElementById('kpi-coverage-sub');
  const kpiStatus = document.getElementById('kpi-status');
  const kpiStatusSub = document.getElementById('kpi-status-sub');
  const testStats = document.getElementById('test-stats');
  const tableMatchBadge = document.getElementById('table-match-badge');
  const matchesTableBody = document.getElementById('matches-table-body');

  // Cheat Sheet Presets Data
  const CHEAT_SHEET_PRESETS = [
    {
      id: 'email',
      name: 'Email Address',
      pattern: '([a-zA-Z0-9._%+-]+)@([a-zA-Z0-9.-]+\\.[a-zA-Z]{2,})',
      flags: ['g', 'i'],
      sample: `Contact our primary support desk at support@example.com or reach out to sales.lead@example.org.
You can also notify admin@example.com for emergency escalations.`,
      description: 'Matches standard RFC email addresses with separate groups for user and domain.'
    },
    {
      id: 'url',
      name: 'Web URL / Hyperlink',
      pattern: 'https?:\\/\\/([a-zA-Z0-9.-]+)(?::([0-9]+))?(\\/[^\\s]*)?',
      flags: ['g', 'i'],
      sample: `Production gateway: https://api.example.com:8080/v2/telemetry/events?sort=desc
Documentation portal: https://docs.github.com/en/rest and backup service: http://internal.network/status`,
      description: 'Parses HTTP and HTTPS URLs into hostname, optional port, and URI path segments.'
    },
    {
      id: 'ipv4',
      name: 'IPv4 Address',
      pattern: '\\b((?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\\b',
      flags: ['g'],
      sample: `Active routing table:
- Router Gateway: 192.168.1.1
- DNS Primary: 8.8.8.8
- Server Cluster IP: 10.0.4.150
- Invalid test cases to skip: 999.12.34.56 and 192.168.1.300`,
      description: 'Validates strict 0-255 IPv4 dotted-quad numerical addresses.'
    },
    {
      id: 'phone',
      name: 'Phone Number',
      pattern: '(\\+?\\d{1,3}[-.\\s]?)?\\(?(\\d{3})\\)?[-.\\s]?(\\d{3})[-.\\s]?(\\d{4})',
      flags: ['g'],
      sample: `Call dispatch at +1 (555) 234-5678 or regional representative at 800-555-0199.
UK branch office inquiries: +44 20 7946 0919.`,
      description: 'Matches international and North American formatted telephone numbers with optional dialing prefix.'
    },
    {
      id: 'date',
      name: 'ISO Date (YYYY-MM-DD)',
      pattern: '\\b(\\d{4})-(0[1-9]|1[0-2])-(0[1-9]|[12]\\d|3[01])\\b',
      flags: ['g'],
      sample: `Audit trail summary:
- Account created: 2025-04-12
- Subscription renewed: 2026-03-31
- Upcoming milestone: 2026-11-15`,
      description: 'Extracts 4-digit year, 2-digit month, and 2-digit day per ISO-8601.'
    },
    {
      id: 'hex',
      name: 'Hex Color Codes',
      pattern: '#([a-fA-F0-9]{2})([a-fA-F0-9]{2})([a-fA-F0-9]{2})\\b',
      flags: ['g', 'i'],
      sample: `Brand styling guide:
- Accent brand primary: #4e85bf
- Dark surface background: #111827
- Success indicator: #10b981
- Alert danger warning: #ef4444`,
      description: 'Matches 6-character hex colors and extracts separate Red, Green, and Blue hexadecimal channels.'
    },
    {
      id: 'html-tag',
      name: 'HTML Tag & Content',
      pattern: '<([a-zA-Z][a-zA-Z0-9]*)\\b[^>]*>(.*?)<\\/\\1>',
      flags: ['g', 's', 'i'],
      sample: `<header class="hero-box">
  <h1 id="title">Next-Gen Developer Tools</h1>
  <p>Deliver ultra-reliable software applications with zero overhead.</p>
</header>`,
      description: 'Matches balanced opening and closing HTML tags and captures tag name and inner content.'
    }
  ];

  const DEFAULT_SAMPLE_TEXT = `Welcome to the ALL-IN-ONE Regex Playground!
Here are several sample contact records to test:
- Lead Architect: alexandra.reed@example.com (Assigned Team: Infrastructure)
- Senior DevOps: marcus.vance@example.com (Assigned Team: Deployment)
- Support Desk: inquiry-support@example.com (Assigned Team: Operations)
- Security Specialist: sec-officer99@example.org (Assigned Team: SecOps)

Try modifying the expression above or click "Regex Cheat Sheet" for more presets.`;

  // Escape HTML helper
  function escapeHTML(str) {
    if (!str) return '';
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  // Get current active flags string
  function getActiveFlags() {
    let flags = '';
    flagButtons.forEach(btn => {
      if (btn.classList.contains('active')) {
        flags += btn.getAttribute('data-flag');
      }
    });
    return flags;
  }

  // Set flags from array
  function setActiveFlags(flagsArr) {
    flagButtons.forEach(btn => {
      const flagChar = btn.getAttribute('data-flag');
      if (flagsArr.includes(flagChar)) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    });
  }

  // Show / hide error banner
  function showError(msg) {
    regexErrorMsg.textContent = msg;
    regexErrorBox.classList.add('show');
    kpiStatus.textContent = 'Syntax Error';
    kpiStatus.style.color = 'var(--error)';
    kpiStatusSub.textContent = 'Fix regex pattern syntax';
  }

  function hideError() {
    regexErrorBox.classList.remove('show');
    kpiStatus.textContent = 'Valid Pattern';
    kpiStatus.style.color = 'var(--success)';
    kpiStatusSub.textContent = 'Evaluated successfully';
  }

  // Render Cheat Sheet Drawer Grid
  function renderCheatSheet() {
    cheatSheetGrid.innerHTML = CHEAT_SHEET_PRESETS.map(preset => `
      <div class="cheat-card">
        <div class="cheat-title">
          <span>${preset.name}</span>
          <span style="font-size: 0.7rem; font-family: monospace; color: var(--text-tertiary);">/${preset.flags.join('')}</span>
        </div>
        <div class="cheat-code">/${preset.pattern}/${preset.flags.join('')}</div>
        <p class="cheat-desc">${preset.description}</p>
        <button class="btn btn-secondary btn-apply-preset" data-id="${preset.id}" style="margin-top: auto; padding: 0.35rem 0.65rem; font-size: 0.8rem;">
          Test This Pattern &rarr;
        </button>
      </div>
    `).join('');

    // Attach click listeners to preset buttons
    cheatSheetGrid.querySelectorAll('.btn-apply-preset').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-id');
        const preset = CHEAT_SHEET_PRESETS.find(p => p.id === id);
        if (!preset) return;

        patternInput.value = preset.pattern;
        setActiveFlags(preset.flags);
        testStringInput.value = preset.sample;
        evaluateRegex();

        // Close drawer smoothly
        cheatSheetDrawer.classList.remove('open');
      });
    });
  }

  // Main evaluation and highlight rendering logic
  function evaluateRegex() {
    const pattern = patternInput.value;
    const flags = getActiveFlags();
    const text = testStringInput.value;

    // Update test stats
    const lines = text ? text.split(/\r\n|\r|\n/).length : 0;
    const chars = text ? text.length : 0;
    testStats.textContent = `${lines.toLocaleString()} lines • ${chars.toLocaleString()} chars`;

    // Handle empty pattern
    if (!pattern) {
      hideError();
      kpiStatus.textContent = 'No Pattern';
      kpiStatus.style.color = 'var(--text-secondary)';
      kpiStatusSub.textContent = 'Enter expression to begin';
      kpiMatchCount.textContent = '0';
      kpiMatchSub.textContent = 'No pattern specified';
      kpiGroupsCount.textContent = '0';
      kpiCoverage.textContent = '0.0%';
      kpiCoverageSub.textContent = '0 / 0 characters matched';
      tableMatchBadge.textContent = '0 Matches';
      highlightStage.innerHTML = escapeHTML(text);
      matchesTableBody.innerHTML = `<tr><td colspan="4" style="text-align: center; color: var(--text-tertiary); padding: 2rem;">Enter a regular expression pattern to find matches.</td></tr>`;
      return;
    }

    // Try to construct RegExp
    let regex;
    let supportsIndices = false;

    // First attempt: try with 'd' flag for accurate group start/end indexing if supported
    try {
      const flagsWithD = flags.includes('d') ? flags : flags + 'd';
      regex = new RegExp(pattern, flagsWithD);
      supportsIndices = true;
    } catch {
      // Fallback without 'd' flag
      try {
        regex = new RegExp(pattern, flags);
      } catch (err) {
        showError(err.message || 'Invalid regular expression');
        kpiMatchCount.textContent = '0';
        kpiMatchSub.textContent = 'Pattern evaluation aborted';
        kpiGroupsCount.textContent = '0';
        kpiCoverage.textContent = '0.0%';
        kpiCoverageSub.textContent = '0 / 0 characters matched';
        tableMatchBadge.textContent = 'Error';
        highlightStage.innerHTML = escapeHTML(text);
        matchesTableBody.innerHTML = `<tr><td colspan="4" style="text-align: center; color: var(--error); padding: 2rem;">Error: ${escapeHTML(err.message)}</td></tr>`;
        return;
      }
    }

    hideError();

    // If text is empty
    if (!text) {
      kpiMatchCount.textContent = '0';
      kpiMatchSub.textContent = 'Empty test string';
      kpiGroupsCount.textContent = '0';
      kpiCoverage.textContent = '0.0%';
      kpiCoverageSub.textContent = '0 / 0 characters matched';
      tableMatchBadge.textContent = '0 Matches';
      highlightStage.innerHTML = '';
      matchesTableBody.innerHTML = `<tr><td colspan="4" style="text-align: center; color: var(--text-tertiary); padding: 2rem;">No test string provided. Type or paste text to evaluate.</td></tr>`;
      return;
    }

    // Execute regex across text
    const matches = [];
    const isGlobal = flags.includes('g');
    const MAX_MATCHES = 500; // Safeguard against freezing
    let totalMatchedChars = 0;
    let maxGroupsFound = 0;

    if (isGlobal) {
      let m;
      let lastIndex = -1;
      while ((m = regex.exec(text)) !== null) {
        matches.push(m);
        totalMatchedChars += m[0].length;
        if (m.length - 1 > maxGroupsFound) {
          maxGroupsFound = m.length - 1;
        }

        // Avoid infinite loop on zero-length matches (e.g. ^ or \b)
        if (regex.lastIndex === lastIndex || m[0].length === 0) {
          regex.lastIndex++;
        }
        lastIndex = regex.lastIndex;

        if (matches.length >= MAX_MATCHES) {
          break;
        }
      }
    } else {
      const m = regex.exec(text);
      if (m) {
        matches.push(m);
        totalMatchedChars += m[0].length;
        maxGroupsFound = m.length - 1;
      }
    }

    // Update KPI stats
    const matchCount = matches.length;
    kpiMatchCount.textContent = matchCount.toLocaleString();
    kpiMatchSub.textContent = matchCount === 0 ? 'No matches found' : (matchCount === 1 ? '1 match located' : `${matchCount} matches located`);
    kpiGroupsCount.textContent = maxGroupsFound.toString();

    const coveragePct = text.length > 0 ? Math.min(100, (totalMatchedChars / text.length) * 100).toFixed(1) : '0.0';
    kpiCoverage.textContent = `${coveragePct}%`;
    kpiCoverageSub.textContent = `${totalMatchedChars.toLocaleString()} / ${text.length.toLocaleString()} characters matched`;
    tableMatchBadge.textContent = `${matchCount} ${matchCount === 1 ? 'Match' : 'Matches'}`;

    // Render Live Highlight Stage
    renderHighlightStage(text, matches, supportsIndices);

    // Render Matches Summary Table
    renderSummaryTable(matches);
  }

  // Render Highlight Stage HTML
  function renderHighlightStage(text, matches, supportsIndices) {
    if (matches.length === 0) {
      highlightStage.innerHTML = escapeHTML(text);
      return;
    }

    let html = '';
    let cursor = 0;

    matches.forEach((m, matchIndex) => {
      const matchStart = m.index;
      const matchEnd = matchStart + m[0].length;

      // Append un-matched segment preceding this match
      if (matchStart > cursor) {
        html += escapeHTML(text.slice(cursor, matchStart));
      }

      // Check if this match has capture groups
      const hasGroups = m.length > 1;

      if (!hasGroups) {
        // Simple match without groups
        html += `<mark class="match-highlight" title="Match #${matchIndex + 1}: &quot;${escapeHTML(m[0])}&quot;">${escapeHTML(m[0])}</mark>`;
      } else {
        // Match with capture groups
        let matchInner = '';

        if (supportsIndices && m.indices) {
          // Accurate group slicing with RegExp indices
          const groupSpans = [];
          for (let g = 1; g < m.length; g++) {
            if (m.indices[g]) {
              groupSpans.push({
                groupIndex: g,
                start: m.indices[g][0] - matchStart,
                end: m.indices[g][1] - matchStart,
                val: m[g]
              });
            }
          }

          // Sort groups by start index
          groupSpans.sort((a, b) => a.start - b.start);

          let innerCursor = 0;
          groupSpans.forEach(gSpan => {
            if (gSpan.start > innerCursor) {
              matchInner += escapeHTML(m[0].slice(innerCursor, gSpan.start));
            }
            const colorClass = `g${((gSpan.groupIndex - 1) % 5) + 1}`;
            matchInner += `<span class="group-mark ${colorClass}" title="Group ${gSpan.groupIndex}: &quot;${escapeHTML(gSpan.val || '')}&quot;">${escapeHTML(gSpan.val || '')}</span>`;
            innerCursor = Math.max(innerCursor, gSpan.end);
          });

          if (innerCursor < m[0].length) {
            matchInner += escapeHTML(m[0].slice(innerCursor));
          }
        } else {
          // Fallback slice: search group contents in match[0]
          let innerCursor = 0;
          for (let g = 1; g < m.length; g++) {
            const gVal = m[g];
            if (gVal !== undefined) {
              const gIdx = m[0].indexOf(gVal, innerCursor);
              if (gIdx >= 0) {
                if (gIdx > innerCursor) {
                  matchInner += escapeHTML(m[0].slice(innerCursor, gIdx));
                }
                const colorClass = `g${((g - 1) % 5) + 1}`;
                matchInner += `<span class="group-mark ${colorClass}" title="Group ${g}: &quot;${escapeHTML(gVal)}&quot;">${escapeHTML(gVal)}</span>`;
                innerCursor = gIdx + gVal.length;
              }
            }
          }
          if (innerCursor < m[0].length) {
            matchInner += escapeHTML(m[0].slice(innerCursor));
          }
        }

        html += `<mark class="match-highlight" title="Match #${matchIndex + 1}">${matchInner}</mark>`;
      }

      cursor = matchEnd;
    });

    // Append remaining text after last match
    if (cursor < text.length) {
      html += escapeHTML(text.slice(cursor));
    }

    highlightStage.innerHTML = html;
  }

  // Render Matches Summary Table
  function renderSummaryTable(matches) {
    if (matches.length === 0) {
      matchesTableBody.innerHTML = `
        <tr>
          <td colspan="4" style="text-align: center; color: var(--text-tertiary); padding: 2rem;">
            No matches found for current pattern.
          </td>
        </tr>
      `;
      return;
    }

    let rowsHTML = '';
    matches.forEach((m, idx) => {
      const matchNum = idx + 1;
      const fullMatch = m[0];
      const startIndex = m.index;
      const endIndex = startIndex + fullMatch.length;
      const length = fullMatch.length;

      // Build groups display
      let groupsHTML = '';
      if (m.length > 1) {
        for (let g = 1; g < m.length; g++) {
          const gVal = m[g];
          const colorClass = `g${((g - 1) % 5) + 1}`;
          if (gVal !== undefined) {
            groupsHTML += `<span class="group-pill ${colorClass}"><strong>$${g}:</strong> &quot;${escapeHTML(gVal)}&quot;</span>`;
          } else {
            groupsHTML += `<span class="group-pill" style="opacity: 0.6;"><strong>$${g}:</strong> undefined</span>`;
          }
        }
      } else {
        groupsHTML = `<span style="color: var(--text-tertiary); font-size: 0.8rem;">None</span>`;
      }

      rowsHTML += `
        <tr>
          <td><strong style="color: var(--accent);">#${matchNum}</strong></td>
          <td>
            <div style="display: flex; align-items: center; gap: 0.5rem; flex-wrap: wrap;">
              <span class="code-badge">&quot;${escapeHTML(fullMatch)}&quot;</span>
              <button class="btn btn-secondary btn-copy-match" data-val="${escapeHTML(fullMatch)}" style="padding: 0.2rem 0.5rem; font-size: 0.75rem;">Copy</button>
            </div>
          </td>
          <td>${groupsHTML}</td>
          <td>
            <span style="font-family: monospace; font-size: 0.8rem; color: var(--text-secondary);">
              [${startIndex}, ${endIndex}] &bull; ${length} chars
            </span>
          </td>
        </tr>
      `;
    });

    matchesTableBody.innerHTML = rowsHTML;

    // Attach click events for individual copy buttons
    matchesTableBody.querySelectorAll('.btn-copy-match').forEach(btn => {
      btn.addEventListener('click', () => {
        const val = btn.getAttribute('data-val');
        if (!val) return;
        navigator.clipboard.writeText(val).then(() => {
          const orig = btn.textContent;
          btn.textContent = 'Copied!';
          setTimeout(() => { btn.textContent = orig; }, 1500);
        });
      });
    });
  }

  // Event Listeners
  patternInput.addEventListener('input', evaluateRegex);
  testStringInput.addEventListener('input', evaluateRegex);

  // Flags toggles
  flagButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      btn.classList.toggle('active');
      evaluateRegex();
    });
  });

  // Load Sample
  btnSample.addEventListener('click', () => {
    testStringInput.value = DEFAULT_SAMPLE_TEXT;
    evaluateRegex();
  });

  // Clear Text
  btnClear.addEventListener('click', () => {
    testStringInput.value = '';
    evaluateRegex();
    testStringInput.focus();
  });

  // Copy Full Expression (/pattern/flags)
  btnCopyRegex.addEventListener('click', () => {
    const pattern = patternInput.value;
    const flags = getActiveFlags();
    const fullExpr = `/${pattern}/${flags}`;

    navigator.clipboard.writeText(fullExpr).then(() => {
      const orig = btnCopyRegex.textContent;
      btnCopyRegex.textContent = 'Copied /.../!';
      setTimeout(() => { btnCopyRegex.textContent = orig; }, 2000);
    });
  });

  // Toggle Cheat Sheet Drawer
  btnToggleCheatSheet.addEventListener('click', () => {
    cheatSheetDrawer.classList.toggle('open');
    if (cheatSheetDrawer.classList.contains('open')) {
      cheatSheetDrawer.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  });

  btnCloseCheatSheet.addEventListener('click', () => {
    cheatSheetDrawer.classList.remove('open');
  });

  // Initialize
  renderCheatSheet();
  testStringInput.value = DEFAULT_SAMPLE_TEXT;
  evaluateRegex();
});