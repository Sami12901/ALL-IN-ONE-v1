// Email Signature Generator Client Logic

document.addEventListener('DOMContentLoaded', () => {
  // State
  let currentTheme = 'modern';
  let accentColor = '#4e85bf';

  // DOM Elements - Theme & Color
  const themeCards = document.querySelectorAll('#theme-selector .theme-card');
  const colorSwatches = document.querySelectorAll('#color-swatches .color-swatch');

  // DOM Elements - Inputs
  const inpName = document.getElementById('inp-name');
  const inpTitle = document.getElementById('inp-title');
  const inpCompany = document.getElementById('inp-company');
  const inpPhone = document.getElementById('inp-phone');
  const inpEmail = document.getElementById('inp-email');
  const inpWebsite = document.getElementById('inp-website');
  const inpAddress = document.getElementById('inp-address');
  const inpAvatar = document.getElementById('inp-avatar');

  const inpLinkedin = document.getElementById('inp-linkedin');
  const inpTwitter = document.getElementById('inp-twitter');
  const inpGithub = document.getElementById('inp-github');
  const inpFacebook = document.getElementById('inp-facebook');

  // DOM Elements - Actions & Output
  const renderStage = document.getElementById('signature-render-stage');
  const copyFormattedBtn = document.getElementById('copy-formatted-btn');
  const copyHtmlBtn = document.getElementById('copy-html-btn');
  const downloadHtmlBtn = document.getElementById('download-html-btn');
  const loadSampleBtn = document.getElementById('load-sample-btn');
  const clearFormBtn = document.getElementById('clear-form-btn');

  // Toast
  const toastMsg = document.getElementById('toast-msg');
  const toastText = document.getElementById('toast-text');

  let toastTimer = null;
  function showToast(text) {
    if (toastTimer) clearTimeout(toastTimer);
    toastText.textContent = text;
    toastMsg.classList.add('show');
    toastTimer = setTimeout(() => {
      toastMsg.classList.remove('show');
    }, 2800);
  }

  // HTML Generator
  function generateSignatureHtml() {
    const name = inpName.value.trim() || 'Your Name';
    const title = inpTitle.value.trim() || 'Job Title';
    const company = inpCompany.value.trim() || 'Company Name';
    const phone = inpPhone.value.trim();
    const email = inpEmail.value.trim();
    const website = inpWebsite.value.trim();
    const address = inpAddress.value.trim();
    const avatar = inpAvatar.value.trim();

    const linkedin = inpLinkedin.value.trim();
    const twitter = inpTwitter.value.trim();
    const github = inpGithub.value.trim();
    const facebook = inpFacebook.value.trim();

    // Helper for clean URLs
    const cleanWeb = website.replace(/^https?:\/\//, '');

    // Social links pill generator
    const socialLinks = [];
    if (linkedin) socialLinks.push({ label: 'LinkedIn', url: linkedin, color: '#0077b5' });
    if (twitter) socialLinks.push({ label: 'X (Twitter)', url: twitter, color: '#000000' });
    if (github) socialLinks.push({ label: 'GitHub', url: github, color: '#24292e' });
    if (facebook) socialLinks.push({ label: 'Facebook', url: facebook, color: '#1877f2' });

    let socialHtml = '';
    if (socialLinks.length > 0) {
      socialHtml = '<div style="margin-top: 8px;">' + socialLinks.map(s => `
        <a href="${s.url}" target="_blank" style="display: inline-block; font-size: 11px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; font-weight: 600; color: #ffffff; background-color: ${accentColor}; text-decoration: none; padding: 2px 7px; border-radius: 4px; margin-right: 4px; margin-bottom: 2px;">
          ${s.label}
        </a>
      `).join('') + '</div>';
    }

    // THEME 1: Modern Clean
    if (currentTheme === 'modern') {
      return `
<table border="0" cellpadding="0" cellspacing="0" style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #222222; font-size: 13px; line-height: 1.4; border-collapse: collapse;">
  <tr>
    ${avatar ? `
    <td valign="top" style="padding-right: 16px;">
      <img src="${avatar}" alt="${name}" width="72" height="72" style="border-radius: 50%; display: block; object-fit: cover; width: 72px; height: 72px; border: 2px solid ${accentColor};" />
    </td>
    ` : ''}
    <td valign="top" style="border-left: 2px solid ${accentColor}; padding-left: 16px;">
      <div style="font-size: 16px; font-weight: 700; color: #111827; letter-spacing: -0.01em;">${name}</div>
      <div style="font-size: 13px; color: ${accentColor}; font-weight: 600; margin-top: 1px;">${title} <span style="color: #9ca3af; font-weight: 400;">|</span> <span style="color: #4b5563;">${company}</span></div>
      
      <table border="0" cellpadding="0" cellspacing="0" style="margin-top: 8px; font-size: 12px; color: #4b5563;">
        ${phone ? `<tr><td style="padding: 1px 0;"><span style="color: ${accentColor}; font-weight: 700;">p:</span> <a href="tel:${phone}" style="color: #4b5563; text-decoration: none;">${phone}</a></td></tr>` : ''}
        ${email ? `<tr><td style="padding: 1px 0;"><span style="color: ${accentColor}; font-weight: 700;">e:</span> <a href="mailto:${email}" style="color: #4b5563; text-decoration: none;">${email}</a></td></tr>` : ''}
        ${website ? `<tr><td style="padding: 1px 0;"><span style="color: ${accentColor}; font-weight: 700;">w:</span> <a href="${website}" target="_blank" style="color: #4b5563; text-decoration: none;">${cleanWeb}</a></td></tr>` : ''}
        ${address ? `<tr><td style="padding: 1px 0;"><span style="color: ${accentColor}; font-weight: 700;">a:</span> ${address}</td></tr>` : ''}
      </table>

      ${socialHtml}
    </td>
  </tr>
</table>`.trim();
    }

    // THEME 2: Corporate Navy
    if (currentTheme === 'corporate') {
      return `
<table border="0" cellpadding="0" cellspacing="0" style="font-family: Arial, Helvetica, sans-serif; color: #1f2937; font-size: 13px; line-height: 1.45; border-collapse: collapse; min-width: 320px;">
  <tr>
    <td style="border-top: 3px solid ${accentColor}; padding-top: 10px;">
      <table border="0" cellpadding="0" cellspacing="0">
        <tr>
          ${avatar ? `
          <td valign="middle" style="padding-right: 14px;">
            <img src="${avatar}" alt="${name}" width="65" height="65" style="border-radius: 6px; display: block; object-fit: cover; width: 65px; height: 65px;" />
          </td>
          ` : ''}
          <td valign="middle">
            <div style="font-size: 17px; font-weight: 700; color: #0f172a;">${name}</div>
            <div style="font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; color: ${accentColor}; margin-top: 2px;">${title}</div>
            <div style="font-size: 12px; color: #475569; font-weight: 500;">${company}</div>
          </td>
        </tr>
      </table>
      
      <div style="border-top: 1px solid #e2e8f0; margin: 10px 0 8px 0;"></div>

      <table border="0" cellpadding="0" cellspacing="0" style="font-size: 12px; color: #334155;">
        <tr>
          ${phone ? `<td style="padding-right: 12px;"><strong style="color: ${accentColor};">TEL:</strong> <a href="tel:${phone}" style="color: #334155; text-decoration: none;">${phone}</a></td>` : ''}
          ${email ? `<td style="padding-right: 12px;"><strong style="color: ${accentColor};">EMAIL:</strong> <a href="mailto:${email}" style="color: #334155; text-decoration: none;">${email}</a></td>` : ''}
          ${website ? `<td><strong style="color: ${accentColor};">WEB:</strong> <a href="${website}" target="_blank" style="color: ${accentColor}; font-weight: 600; text-decoration: none;">${cleanWeb}</a></td>` : ''}
        </tr>
        ${address ? `<tr><td colspan="3" style="padding-top: 4px; color: #64748b; font-size: 11px;">${address}</td></tr>` : ''}
      </table>

      ${socialHtml}
    </td>
  </tr>
</table>`.trim();
    }

    // THEME 3: Minimal Luxury
    if (currentTheme === 'luxury') {
      return `
<table border="0" cellpadding="0" cellspacing="0" style="font-family: 'Georgia', Times, serif; color: #1c1917; font-size: 13px; line-height: 1.5; border-collapse: collapse;">
  <tr>
    ${avatar ? `
    <td valign="middle" style="padding-right: 18px;">
      <img src="${avatar}" alt="${name}" width="68" height="68" style="border-radius: 50%; display: block; object-fit: cover; width: 68px; height: 68px; border: 1px solid #d6d3d1;" />
    </td>
    ` : ''}
    <td valign="middle" style="padding-left: 4px;">
      <div style="font-size: 18px; font-weight: 400; letter-spacing: 0.04em; color: #1c1917;">${name}</div>
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 11px; text-transform: uppercase; letter-spacing: 0.15em; color: ${accentColor}; margin-top: 2px;">
        ${title} &mdash; ${company}
      </div>

      <div style="width: 40px; height: 1px; background-color: ${accentColor}; margin: 8px 0;"></div>

      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 12px; color: #57534e;">
        ${phone ? `<a href="tel:${phone}" style="color: #57534e; text-decoration: none;">${phone}</a> &bull; ` : ''}
        ${email ? `<a href="mailto:${email}" style="color: #57534e; text-decoration: none;">${email}</a> &bull; ` : ''}
        ${website ? `<a href="${website}" target="_blank" style="color: ${accentColor}; text-decoration: none; font-weight: 500;">${cleanWeb}</a>` : ''}
      </div>
      ${address ? `<div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 11px; color: #a8a29e; margin-top: 3px;">${address}</div>` : ''}

      ${socialHtml}
    </td>
  </tr>
</table>`.trim();
    }

    // THEME 4: Compact Mobile
    if (currentTheme === 'compact') {
      return `
<table border="0" cellpadding="0" cellspacing="0" style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #1f2937; font-size: 12px; line-height: 1.4; border-collapse: collapse;">
  <tr>
    ${avatar ? `
    <td valign="middle" style="padding-right: 10px;">
      <img src="${avatar}" alt="${name}" width="44" height="44" style="border-radius: 50%; display: block; object-fit: cover; width: 44px; height: 44px;" />
    </td>
    ` : ''}
    <td valign="middle">
      <div>
        <strong style="font-size: 13px; color: #111827;">${name}</strong>
        <span style="color: #9ca3af; margin: 0 4px;">&bull;</span>
        <span style="color: ${accentColor}; font-weight: 600;">${title}</span>
        <span style="color: #6b7280;"> @ ${company}</span>
      </div>
      <div style="color: #4b5563; margin-top: 2px;">
        ${phone ? `<a href="tel:${phone}" style="color: #4b5563; text-decoration: none;">${phone}</a> <span style="color: #d1d5db;">|</span> ` : ''}
        ${email ? `<a href="mailto:${email}" style="color: #4b5563; text-decoration: none;">${email}</a> <span style="color: #d1d5db;">|</span> ` : ''}
        ${website ? `<a href="${website}" target="_blank" style="color: ${accentColor}; text-decoration: none;">${cleanWeb}</a>` : ''}
      </div>
      ${address ? `<div style="color: #9ca3af; font-size: 11px; margin-top: 2px;">${address}</div>` : ''}
      ${socialHtml}
    </td>
  </tr>
</table>`.trim();
    }

    return '';
  }

  // Render Signature to preview stage
  function updatePreview() {
    const html = generateSignatureHtml();
    renderStage.innerHTML = html;
  }

  // Theme selection
  themeCards.forEach(card => {
    card.addEventListener('click', () => {
      themeCards.forEach(c => c.classList.remove('active'));
      card.classList.add('active');
      currentTheme = card.dataset.theme;
      updatePreview();
    });
  });

  // Color Swatch selection
  colorSwatches.forEach(swatch => {
    swatch.addEventListener('click', () => {
      colorSwatches.forEach(s => s.classList.remove('active'));
      swatch.classList.add('active');
      accentColor = swatch.dataset.color;
      updatePreview();
    });
  });

  // Input listeners
  const allInputs = [
    inpName,
    inpTitle,
    inpCompany,
    inpPhone,
    inpEmail,
    inpWebsite,
    inpAddress,
    inpAvatar,
    inpLinkedin,
    inpTwitter,
    inpGithub,
    inpFacebook
  ];

  allInputs.forEach(input => {
    input.addEventListener('input', updatePreview);
  });

  // Load Sample Data
  loadSampleBtn.addEventListener('click', () => {
    inpName.value = 'Alex Morgan';
    inpTitle.value = 'Head of Growth & Strategy';
    inpCompany.value = 'Nexus Global Innovations';
    inpPhone.value = '+1 (555) 349-8821';
    inpEmail.value = 'alex.morgan@example.com';
    inpWebsite.value = 'https://nexusglobal.io';
    inpAddress.value = '100 Broadway, Suite 2400, New York, NY';
    inpAvatar.value = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80';
    inpLinkedin.value = 'https://linkedin.com/in/alexmorgan';
    inpTwitter.value = 'https://x.com/alexmorgan';
    inpGithub.value = 'https://github.com/alexmorgan';
    inpFacebook.value = 'https://facebook.com/alexmorgan';
    updatePreview();
    showToast('Loaded sample signature data.');
  });

  // Clear Form Fields
  clearFormBtn.addEventListener('click', () => {
    allInputs.forEach(inp => { inp.value = ''; });
    updatePreview();
    showToast('Cleared all signature fields.');
  });

  // Copy Formatted Rich Signature (for pasting into email clients)
  copyFormattedBtn.addEventListener('click', async () => {
    const html = generateSignatureHtml();
    const plainText = `${inpName.value} | ${inpTitle.value} | ${inpCompany.value}\nPhone: ${inpPhone.value}\nEmail: ${inpEmail.value}\nWebsite: ${inpWebsite.value}`;

    try {
      if (navigator.clipboard && window.ClipboardItem) {
        const blobHtml = new Blob([html], { type: 'text/html' });
        const blobText = new Blob([plainText], { type: 'text/plain' });
        const item = new ClipboardItem({
          'text/html': blobHtml,
          'text/plain': blobText
        });
        await navigator.clipboard.write([item]);
        showToast('Formatted signature copied! Paste directly into Gmail/Outlook.');
        return;
      }
    } catch (err) {
      console.warn('ClipboardItem error, falling back to selection copy:', err);
    }

    // Fallback: Range selection
    try {
      const range = document.createRange();
      range.selectNodeContents(renderStage);
      const sel = window.getSelection();
      sel.removeAllRanges();
      sel.addRange(range);
      document.execCommand('copy');
      sel.removeAllRanges();
      showToast('Formatted signature copied to clipboard!');
    } catch (e) {
      showToast('Please copy using raw HTML button.');
    }
  });

  // Copy Raw HTML Code
  copyHtmlBtn.addEventListener('click', () => {
    const html = generateSignatureHtml();
    navigator.clipboard.writeText(html).then(() => {
      showToast('Raw HTML code copied to clipboard!');
    }).catch(() => {
      showToast('Copied to clipboard.');
    });
  });

  // Download Signature as .html file
  downloadHtmlBtn.addEventListener('click', () => {
    const html = generateSignatureHtml();
    const fullDoc = `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<title>Email Signature - ${inpName.value || 'User'}</title>
</head>
<body style="margin: 20px; background: #ffffff;">
${html}
</body>
</html>`;

    const blob = new Blob([fullDoc], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `email-signature-${(inpName.value || 'export').toLowerCase().replace(/\s+/g, '-')}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showToast('Signature .html file downloaded.');
  });

  // Initial render
  updatePreview();
});