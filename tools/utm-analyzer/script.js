// UTM Analyzer & Campaign Link Auditor Logic
// Comprehensive URL validator, parameter extractor, syntax sanitizer, and QR code generator.

(function () {
  'use strict';

  // Sample URLs
  const SAMPLES = {
    google: 'https://yourdomain.com/pricing?utm_source=google&utm_medium=cpc&utm_campaign=summer_sale_2026&utm_term=saas+pricing&utm_content=hero_cta',
    facebook: 'https://yourdomain.com/shop/apparel?utm_source=facebook&utm_medium=paid-social&utm_campaign=q3_retargeting_leads&utm_content=carousel_v2',
    newsletter: 'https://yourdomain.com/blog/growth-guide?utm_source=newsletter&utm_medium=email&utm_campaign=weekly_digest_issue42&utm_content=footer_link',
    flawed: 'http://yourdomain.com/store/item?utm_source=Google Ads&utm_medium=CPC&utm_campaign=Summer Sale 2026&utm_term=Running Shoes'
  };

  // Standard recommended mediums for GA4 & attribution engines
  const STANDARD_MEDIUMS = new Set([
    'cpc', 'cpm', 'cpv', 'email', 'social', 'paid-social', 'organic', 'referral',
    'affiliate', 'display', 'banner', 'video', 'sms', 'push', 'audio', 'qr'
  ]);

  // Standard UTM parameter definitions
  const UTM_DEFINITIONS = {
    utm_source: 'Identifies which site sent the traffic (e.g. google, facebook, newsletter)',
    utm_medium: 'Identifies the marketing medium used (e.g. cpc, email, paid-social)',
    utm_campaign: 'Identifies the specific campaign slogan or promo (e.g. summer_sale)',
    utm_term: 'Identifies paid search keywords or audience targets',
    utm_content: 'Differentiates ads or links that point to the same URL (e.g. hero_cta, text_link)'
  };

  // Toast Notification
  function showToast(message) {
    let toast = document.getElementById('app-toast');
    if (!toast) {
      toast = document.createElement('div');
      toast.id = 'app-toast';
      toast.className = 'toast-popup';
      toast.style.cssText = 'position:fixed;bottom:2rem;right:2rem;background:var(--surface,#1e293b);border:1px solid var(--accent,#4e85bf);box-shadow:0 10px 30px rgba(0,0,0,0.4);color:var(--text-primary,#fff);padding:0.75rem 1.4rem;border-radius:8px;font-size:0.875rem;font-weight:600;opacity:0;transform:translateY(100px);transition:all 0.3s ease;z-index:9999;pointer-events:none;';
      document.body.appendChild(toast);
    }
    toast.textContent = message;
    toast.style.opacity = '1';
    toast.style.transform = 'translateY(0)';
    clearTimeout(toast._timer);
    toast._timer = setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(100px)';
    }, 2400);
  }

  function copyText(text, successMsg = 'Copied to clipboard!') {
    if (!text) return;
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(() => {
        showToast(successMsg);
      }).catch(() => {
        fallbackCopy(text, successMsg);
      });
    } else {
      fallbackCopy(text, successMsg);
    }
  }

  function fallbackCopy(text, successMsg) {
    const ta = document.createElement('textarea');
    ta.value = text;
    ta.style.position = 'fixed';
    ta.style.opacity = '0';
    document.body.appendChild(ta);
    ta.select();
    try {
      document.execCommand('copy');
      showToast(successMsg);
    } catch (e) {
      showToast('Copy failed');
    }
    document.body.removeChild(ta);
  }

  // QR Code Renderer
  function renderQrCode(url) {
    const canvas = document.getElementById('qr-canvas');
    if (!canvas) return;

    if (window.QRious) {
      try {
        new window.QRious({
          element: canvas,
          value: url || 'https://yourdomain.com',
          size: 180,
          background: '#ffffff',
          foreground: '#0f172a',
          level: 'M'
        });
        return;
      } catch (e) {
        console.warn('QRious render error, falling back:', e);
      }
    }

    // Graceful visual QR simulation fallback if library is unavailable
    const ctx = canvas.getContext('2d');
    const size = canvas.width;
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, size, size);

    ctx.fillStyle = '#0f172a';
    // Draw 3 corner locator squares
    function drawMarker(x, y) {
      ctx.fillRect(x, y, 40, 40);
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(x + 6, y + 6, 28, 28);
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(x + 12, y + 12, 16, 16);
    }
    drawMarker(15, 15);
    drawMarker(size - 55, 15);
    drawMarker(15, size - 55);

    // Grid data pseudo-pattern based on URL hash
    let hash = 0;
    for (let i = 0; i < url.length; i++) {
      hash = ((hash << 5) - hash) + url.charCodeAt(i);
      hash |= 0;
    }
    const blockSize = 8;
    for (let r = 8; r < size - 8; r += blockSize) {
      for (let c = 8; c < size - 8; c += blockSize) {
        if ((r < 65 && (c < 65 || c > size - 65)) || (r > size - 65 && c < 65)) continue;
        const rand = Math.sin(hash + r * 13 + c * 37);
        if (rand > 0.1) {
          ctx.fillRect(c, r, blockSize - 1, blockSize - 1);
        }
      }
    }
  }

  // Parse and analyze URL
  function analyzeUrl(rawInput) {
    let cleanInput = (rawInput || '').trim();
    if (!cleanInput) {
      return {
        isValid: false,
        error: 'Please enter a URL to analyze.',
        urlObj: null,
        params: [],
        score: 0,
        checks: []
      };
    }

    // Auto prepend protocol if missing for URL parsing
    let parseCandidate = cleanInput;
    if (!/^https?:\/\//i.test(parseCandidate)) {
      parseCandidate = 'https://' + parseCandidate;
    }

    let urlObj;
    try {
      urlObj = new URL(parseCandidate);
    } catch (err) {
      return {
        isValid: false,
        error: 'Invalid URL format. Check for typos or improper special characters.',
        urlObj: null,
        params: [],
        score: 0,
        checks: [
          { status: 'fail', title: 'Invalid URL Syntax', desc: 'The input cannot be parsed as a standard web address.' }
        ]
      };
    }

    // Extract all search params
    const rawSearch = urlObj.search;
    const params = [];
    const paramKeys = [];
    const checks = [];
    let score = 100;

    // Check raw input for unencoded spaces
    const hasRawSpaces = rawInput.includes(' ');
    const hasHttp = urlObj.protocol === 'http:';

    // Collect query params
    urlObj.searchParams.forEach((val, key) => {
      params.push({ key, value: val });
      paramKeys.push(key.toLowerCase());
    });

    const utmSource = urlObj.searchParams.get('utm_source');
    const utmMedium = urlObj.searchParams.get('utm_medium');
    const utmCampaign = urlObj.searchParams.get('utm_campaign');
    const utmTerm = urlObj.searchParams.get('utm_term');
    const utmContent = urlObj.searchParams.get('utm_content');

    // CHECK 1: HTTPS Security
    if (hasHttp) {
      score -= 15;
      checks.push({
        status: 'warn',
        title: 'Insecure Protocol (HTTP)',
        desc: 'Link uses plain HTTP instead of HTTPS. Many modern browsers and networks strip parameters or trigger security warnings.'
      });
    } else {
      checks.push({
        status: 'pass',
        title: 'Secure Protocol (HTTPS)',
        desc: 'URL uses secure SSL/TLS encryption.'
      });
    }

    // CHECK 2: utm_source presence
    if (!utmSource) {
      score -= 25;
      checks.push({
        status: 'fail',
        title: 'Missing Required: utm_source',
        desc: 'Google Analytics 4 requires utm_source to identify the referring platform (e.g. google, newsletter, linkedin).'
      });
    } else {
      checks.push({
        status: 'pass',
        title: `utm_source: "${utmSource}"`,
        desc: 'Traffic source parameter is properly defined.'
      });
    }

    // CHECK 3: utm_medium presence & standard format
    if (!utmMedium) {
      score -= 25;
      checks.push({
        status: 'fail',
        title: 'Missing Required: utm_medium',
        desc: 'utm_medium is essential for GA4 channel grouping (e.g. cpc, email, paid-social, organic).'
      });
    } else {
      const lowerMed = utmMedium.toLowerCase();
      if (!STANDARD_MEDIUMS.has(lowerMed)) {
        score -= 10;
        checks.push({
          status: 'warn',
          title: `Non-standard medium: "${utmMedium}"`,
          desc: `"${utmMedium}" may be bucketed into "Unassigned" in GA4. Recommended standard channels: ${Array.from(STANDARD_MEDIUMS).slice(0, 8).join(', ')}...`
        });
      } else {
        checks.push({
          status: 'pass',
          title: `Standard utm_medium: "${utmMedium}"`,
          desc: 'Medium matches standard analytics attribution channels.'
        });
      }
    }

    // CHECK 4: utm_campaign presence
    if (!utmCampaign) {
      score -= 15;
      checks.push({
        status: 'warn',
        title: 'Missing Recommended: utm_campaign',
        desc: 'Without a campaign name, performance cannot be grouped under specific marketing initiatives.'
      });
    } else {
      checks.push({
        status: 'pass',
        title: `utm_campaign: "${utmCampaign}"`,
        desc: `Campaign tagged as "${utmCampaign}".`
      });
    }

    // CHECK 5: Casing consistency check
    let hasUppercase = false;
    params.forEach(p => {
      if (p.key.startsWith('utm_') && /[A-Z]/.test(p.value)) {
        hasUppercase = true;
      }
    });
    if (hasUppercase) {
      score -= 15;
      checks.push({
        status: 'warn',
        title: 'Mixed / Uppercase Casing Detected',
        desc: 'Analytics systems treat "Google" and "google" as two separate traffic sources. Always use lowercase for consistent reporting.'
      });
    } else {
      checks.push({
        status: 'pass',
        title: 'Consistent Lowercase Casing',
        desc: 'All UTM parameters are in lowercase, preventing split analytics reporting.'
      });
    }

    // CHECK 6: Spaces or whitespace encoding
    if (hasRawSpaces) {
      score -= 20;
      checks.push({
        status: 'fail',
        title: 'Raw Unencoded Spaces Found',
        desc: 'Raw spaces can break URLs in social media apps, emails, and SMS. Replace spaces with underscores (_) or hyphens (-).'
      });
    } else {
      let hasEncodedSpaces = params.some(p => p.value.includes('%20') || p.value.includes('+'));
      if (hasEncodedSpaces) {
        checks.push({
          status: 'warn',
          title: 'URL Encoded Spaces Found (+ or %20)',
          desc: 'While technically valid, underscores (_) or hyphens (-) provide cleaner attribution and prevent broken links.'
        });
      } else {
        checks.push({
          status: 'pass',
          title: 'No Spaces in Parameter Values',
          desc: 'Clean naming conventions without spacing errors.'
        });
      }
    }

    // CHECK 7: Duplicate parameter keys
    const seen = new Set();
    let hasDuplicates = false;
    paramKeys.forEach(k => {
      if (seen.has(k)) hasDuplicates = true;
      seen.add(k);
    });
    if (hasDuplicates) {
      score -= 10;
      checks.push({
        status: 'warn',
        title: 'Duplicate Query Parameters',
        desc: 'The URL contains duplicate keys. Only the first or last instance will be tracked by most servers.'
      });
    }

    // Ensure score bounded 0-100
    score = Math.max(0, Math.min(100, score));

    return {
      isValid: true,
      error: null,
      urlObj,
      cleanInput,
      params,
      score,
      checks
    };
  }

  // Auto-Fix & Sanitize Function
  function sanitizeUrl(rawUrl) {
    if (!rawUrl) return '';
    let urlStr = rawUrl.trim();

    // Ensure protocol
    if (!/^https?:\/\//i.test(urlStr)) {
      urlStr = 'https://' + urlStr;
    }

    try {
      const parsed = new URL(urlStr);
      // Enforce HTTPS
      parsed.protocol = 'https:';

      const newParams = new URLSearchParams();
      const seenKeys = new Set();

      parsed.searchParams.forEach((val, key) => {
        let cleanKey = key.trim();
        let cleanVal = val.trim();

        // Convert UTM keys to lowercase
        if (cleanKey.toLowerCase().startsWith('utm_')) {
          cleanKey = cleanKey.toLowerCase();
          // Lowercase source and medium for standards
          if (cleanKey === 'utm_source' || cleanKey === 'utm_medium') {
            cleanVal = cleanVal.toLowerCase();
          }
        }

        // Replace spaces with underscores
        cleanVal = cleanVal.replace(/\s+/g, '_');

        if (!seenKeys.has(cleanKey)) {
          seenKeys.add(cleanKey);
          newParams.set(cleanKey, cleanVal);
        }
      });

      parsed.search = newParams.toString();
      return parsed.toString();
    } catch (e) {
      // Fallback regex sanitizer
      return urlStr
        .replace(/^http:\/\//i, 'https://')
        .replace(/\s+/g, '_');
    }
  }

  // Format Audit Report
  function formatAuditReport(analysis, currentUrl) {
    if (!analysis.isValid) return `UTM Audit Report\nURL: ${currentUrl}\nStatus: Invalid URL\nError: ${analysis.error}`;

    const dateStr = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
    let report = `=================================================\n`;
    report += `UTM CAMPAIGN LINK AUDIT REPORT\n`;
    report += `Generated: ${dateStr}\n`;
    report += `=================================================\n\n`;
    report += `Analyzed URL:\n${currentUrl}\n\n`;
    report += `Health Score: ${analysis.score}/100\n`;
    report += `Security Protocol: ${analysis.urlObj.protocol.toUpperCase()}\n`;
    report += `Destination: ${analysis.urlObj.origin}${analysis.urlObj.pathname}\n\n`;

    report += `--- DETECTED PARAMETERS (${analysis.params.length}) ---\n`;
    if (analysis.params.length === 0) {
      report += `No query parameters found.\n`;
    } else {
      analysis.params.forEach(p => {
        report += `• ${p.key}: ${p.value}\n`;
      });
    }

    report += `\n--- DIAGNOSTICS & AUDIT CHECKLIST ---\n`;
    analysis.checks.forEach(c => {
      const tag = c.status === 'pass' ? '[PASS]' : c.status === 'warn' ? '[WARN]' : '[FAIL]';
      report += `${tag} ${c.title}\n   ${c.desc}\n`;
    });

    report += `\n=================================================\n`;
    report += `Audit conducted with ALL IN ONE UTM Analyzer\n`;
    report += `=================================================\n`;

    return report;
  }

  // Initialize UI
  document.addEventListener('DOMContentLoaded', () => {
    const inputUrl = document.getElementById('input-url');
    const btnAutoFix = document.getElementById('btn-autofix');
    const btnCopyClean = document.getElementById('btn-copy-clean');
    const btnCopyReport = document.getElementById('btn-copy-report');
    const btnDownloadQr = document.getElementById('btn-download-qr');

    const paramCount = document.getElementById('param-count');
    const paramSecurityTag = document.getElementById('param-security-tag');
    const paramsTableBody = document.getElementById('params-table-body');
    const lblBaseUrl = document.getElementById('lbl-base-url');
    const lblPath = document.getElementById('lbl-path');

    const badgeScore = document.getElementById('badge-score');
    const lblScoreVerdict = document.getElementById('lbl-score-verdict');
    const lblScoreSub = document.getElementById('lbl-score-sub');
    const auditList = document.getElementById('audit-list');
    const qrCanvas = document.getElementById('qr-canvas');

    let currentAnalysis = null;

    function renderAnalysis() {
      const urlText = inputUrl ? inputUrl.value : '';
      currentAnalysis = analyzeUrl(urlText);

      // Render Parameters Table
      if (paramsTableBody) {
        if (!currentAnalysis.isValid || currentAnalysis.params.length === 0) {
          paramsTableBody.innerHTML = `
            <tr>
              <td colspan="3" style="text-align: center; color: var(--text-tertiary); padding: 1.5rem;">
                ${currentAnalysis.error || 'No tracking parameters detected in URL.'}
              </td>
            </tr>
          `;
        } else {
          paramsTableBody.innerHTML = currentAnalysis.params.map(p => {
            const isUtm = p.key.toLowerCase().startsWith('utm_');
            const hasSpace = /\s|%20|\+/.test(p.value);
            const hasUpper = /[A-Z]/.test(p.value);
            let badgeHtml = '<span style="color:#10b981;font-weight:700;">OK</span>';
            if (hasSpace || (isUtm && hasUpper)) {
              badgeHtml = '<span style="color:#f59e0b;font-weight:700;">Needs Fix</span>';
            }

            const defTooltip = UTM_DEFINITIONS[p.key.toLowerCase()] || 'Custom query tracking parameter';

            return `
              <tr>
                <td>
                  <span class="param-key-tag" title="${defTooltip}">${p.key}</span>
                </td>
                <td>
                  <span class="param-val-text">${escapeHtml(p.value)}</span>
                </td>
                <td style="text-align: right; font-size: 0.775rem;">
                  ${badgeHtml}
                </td>
              </tr>
            `;
          }).join('');
        }
      }

      // Update Meta Tags
      if (paramCount) {
        paramCount.textContent = currentAnalysis.params.length;
      }

      if (paramSecurityTag) {
        if (!currentAnalysis.isValid) {
          paramSecurityTag.textContent = '❌ Invalid URL';
          paramSecurityTag.style.color = '#ef4444';
        } else if (currentAnalysis.urlObj.protocol === 'https:') {
          paramSecurityTag.textContent = '🔒 HTTPS Secure';
          paramSecurityTag.style.color = '#10b981';
        } else {
          paramSecurityTag.textContent = '⚠️ Insecure HTTP';
          paramSecurityTag.style.color = '#f59e0b';
        }
      }

      if (lblBaseUrl) {
        if (currentAnalysis.isValid && currentAnalysis.urlObj) {
          lblBaseUrl.textContent = currentAnalysis.urlObj.origin + currentAnalysis.urlObj.pathname;
        } else {
          lblBaseUrl.textContent = '—';
        }
      }

      if (lblPath) {
        if (currentAnalysis.isValid && currentAnalysis.urlObj) {
          lblPath.textContent = currentAnalysis.urlObj.pathname || '/';
        } else {
          lblPath.textContent = '—';
        }
      }

      // Score and Verdict
      if (badgeScore) {
        badgeScore.textContent = currentAnalysis.score;
        badgeScore.className = 'score-badge-large';
        if (currentAnalysis.score < 70) {
          badgeScore.classList.add('danger');
        } else if (currentAnalysis.score < 90) {
          badgeScore.classList.add('warning');
        }
      }

      if (lblScoreVerdict) {
        if (currentAnalysis.score >= 90) {
          lblScoreVerdict.textContent = 'Clean & Ready';
          lblScoreVerdict.style.color = '#10b981';
        } else if (currentAnalysis.score >= 70) {
          lblScoreVerdict.textContent = 'Minor Syntax Warnings';
          lblScoreVerdict.style.color = '#f59e0b';
        } else {
          lblScoreVerdict.textContent = 'Critical Issues Detected';
          lblScoreVerdict.style.color = '#ef4444';
        }
      }

      if (lblScoreSub) {
        if (currentAnalysis.score >= 90) {
          lblScoreSub.textContent = 'All recommended GA4 tracking standards satisfied.';
        } else if (currentAnalysis.score >= 70) {
          lblScoreSub.textContent = 'Some casing or parameter formatting may split reports.';
        } else {
          lblScoreSub.textContent = 'Missing core parameters or unencoded syntax errors present.';
        }
      }

      // Render Diagnostics Checklist
      if (auditList) {
        auditList.innerHTML = currentAnalysis.checks.map(c => {
          const icon = c.status === 'pass' ? '✅' : c.status === 'warn' ? '⚠️' : '❌';
          return `
            <div class="audit-item ${c.status}">
              <div class="audit-icon">${icon}</div>
              <div>
                <strong style="display:block; color:var(--text-primary); margin-bottom:0.15rem;">${c.title}</strong>
                <span style="color:var(--text-secondary);">${c.desc}</span>
              </div>
            </div>
          `;
        }).join('');
      }

      // Render QR Code
      const qrTarget = currentAnalysis.isValid ? currentAnalysis.cleanInput : 'https://yourdomain.com';
      renderQrCode(qrTarget);
    }

    function escapeHtml(str) {
      if (!str) return '';
      return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
    }

    // Input listeners
    if (inputUrl) {
      inputUrl.addEventListener('input', () => {
        renderAnalysis();
      });
    }

    // Sample Links
    document.querySelectorAll('.sample-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const sampleKey = btn.getAttribute('data-sample');
        if (SAMPLES[sampleKey] && inputUrl) {
          inputUrl.value = SAMPLES[sampleKey];
          renderAnalysis();
          showToast(`Loaded sample link: ${btn.textContent.trim()}`);
        }
      });
    });

    // Auto-fix button
    if (btnAutoFix) {
      btnAutoFix.addEventListener('click', () => {
        if (!inputUrl) return;
        const current = inputUrl.value;
        const fixed = sanitizeUrl(current);
        inputUrl.value = fixed;
        renderAnalysis();
        showToast('URL successfully sanitized & auto-fixed!');
      });
    }

    // Copy Clean URL
    if (btnCopyClean) {
      btnCopyClean.addEventListener('click', () => {
        if (!inputUrl) return;
        const clean = sanitizeUrl(inputUrl.value);
        copyText(clean, 'Clean sanitized URL copied!');
      });
    }

    // Copy Audit Report
    if (btnCopyReport) {
      btnCopyReport.addEventListener('click', () => {
        if (!inputUrl || !currentAnalysis) return;
        const report = formatAuditReport(currentAnalysis, inputUrl.value);
        copyText(report, 'Full UTM audit report copied!');
      });
    }

    // Download QR Code PNG
    if (btnDownloadQr) {
      btnDownloadQr.addEventListener('click', () => {
        if (!qrCanvas) return;
        try {
          const imgData = qrCanvas.toDataURL('image/png');
          const link = document.createElement('a');
          link.download = 'utm-campaign-qr.png';
          link.href = imgData;
          link.click();
          showToast('Downloaded QR Code image!');
        } catch (e) {
          showToast('Failed to export QR image');
        }
      });
    }

    // Initial Execution
    renderAnalysis();
  });
})();