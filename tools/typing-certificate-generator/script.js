// Typing Certificate Generator - Client-side Logic

const THEMES = {
  gold: {
    bg: '#FAF7EE',
    bgSecondary: '#F3EEDB',
    primary: '#1E293B',
    secondary: '#475569',
    accent: '#B48825',
    accentLight: '#E5C058',
    goldDark: '#8A6318',
    border: '#D4AF37',
    borderSecondary: '#EAD797',
    cardBg: '#FFFFFF',
    ribbon: '#991B1B',
    isDark: false
  },
  navy: {
    bg: '#F8FAFC',
    bgSecondary: '#EEF2F6',
    primary: '#0F172A',
    secondary: '#334155',
    accent: '#1E40AF',
    accentLight: '#60A5FA',
    goldDark: '#1E3A8A',
    border: '#1E40AF',
    borderSecondary: '#93C5FD',
    cardBg: '#FFFFFF',
    ribbon: '#1E3A8A',
    isDark: false
  },
  emerald: {
    bg: '#F3F9F6',
    bgSecondary: '#E2F0E8',
    primary: '#064E3B',
    secondary: '#0F766E',
    accent: '#059669',
    accentLight: '#34D399',
    goldDark: '#047857',
    border: '#059669',
    borderSecondary: '#A7F3D0',
    cardBg: '#FFFFFF',
    ribbon: '#065F46',
    isDark: false
  },
  obsidian: {
    bg: '#0F131B',
    bgSecondary: '#181E2B',
    primary: '#F8FAFC',
    secondary: '#94A3B8',
    accent: '#F59E0B',
    accentLight: '#FCD34D',
    goldDark: '#B45309',
    border: '#F59E0B',
    borderSecondary: '#78350F',
    cardBg: '#182030',
    ribbon: '#DC2626',
    isDark: true
  }
};

document.addEventListener('DOMContentLoaded', () => {
  // DOM Elements
  const canvas = document.getElementById('certificate-canvas');
  const ctx = canvas.getContext('2d');

  const inputName = document.getElementById('input-name');
  const inputWpm = document.getElementById('input-wpm');
  const inputAccuracy = document.getElementById('input-accuracy');
  const selectTitlePreset = document.getElementById('select-title-preset');
  const groupCustomTitle = document.getElementById('group-custom-title');
  const inputCustomTitle = document.getElementById('input-custom-title');
  const inputDate = document.getElementById('input-date');
  const inputSignatory = document.getElementById('input-signatory');
  const inputCertId = document.getElementById('input-cert-id');
  const btnRefreshId = document.getElementById('btn-refresh-id');

  const themeCards = document.querySelectorAll('#theme-group .theme-card');
  const btnDownloadPng = document.getElementById('btn-download-png');
  const btnCopyImg = document.getElementById('btn-copy-img');
  const btnPrintCert = document.getElementById('btn-print-cert');

  let activeThemeKey = 'gold';

  // Generate Unique Verification ID
  function generateCertId() {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let code = 'AIO-TYP-';
    for (let i = 0; i < 4; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    code += '-';
    for (let i = 0; i < 4; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
  }

  // Format Date Nicely
  function formatDisplayDate(dateVal) {
    if (!dateVal) return new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
    const parts = dateVal.split('-');
    if (parts.length === 3) {
      const d = new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10));
      return d.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
    }
    return dateVal;
  }

  // Get current active title
  function getCertificateTitle() {
    if (selectTitlePreset.value === 'custom') {
      return inputCustomTitle.value.trim() || 'Certificate of Typing Excellence';
    }
    return selectTitlePreset.value;
  }

  // Check URL parameters for pre-filling
  function loadUrlParameters() {
    const urlParams = new URLSearchParams(window.location.search);

    if (urlParams.has('name')) {
      inputName.value = urlParams.get('name');
    }
    if (urlParams.has('wpm')) {
      inputWpm.value = urlParams.get('wpm');
    }
    if (urlParams.has('acc')) {
      inputAccuracy.value = urlParams.get('acc');
    }
    if (urlParams.has('date')) {
      inputDate.value = urlParams.get('date');
    }
    if (urlParams.has('title')) {
      const customT = urlParams.get('title');
      let found = false;
      for (const opt of selectTitlePreset.options) {
        if (opt.value.toLowerCase() === customT.toLowerCase()) {
          opt.selected = true;
          found = true;
          break;
        }
      }
      if (!found) {
        selectTitlePreset.value = 'custom';
        groupCustomTitle.style.display = 'block';
        inputCustomTitle.value = customT;
      }
    }
  }

  // Draw Gold Seal with Starburst and Ribbons
  function drawGoldSeal(x, y, radius, theme) {
    ctx.save();

    // 1. Ribbons hanging down
    const ribbonLen = radius * 1.35;
    const ribbonWidth = radius * 0.45;

    // Left ribbon
    ctx.save();
    ctx.translate(x - radius * 0.35, y + radius * 0.4);
    ctx.rotate(0.22);
    ctx.fillStyle = theme.ribbon;
    ctx.beginPath();
    ctx.moveTo(-ribbonWidth / 2, 0);
    ctx.lineTo(ribbonWidth / 2, 0);
    ctx.lineTo(ribbonWidth / 2, ribbonLen);
    ctx.lineTo(0, ribbonLen - 20); // V-notch
    ctx.lineTo(-ribbonWidth / 2, ribbonLen);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = 'rgba(0, 0, 0, 0.2)';
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.restore();

    // Right ribbon
    ctx.save();
    ctx.translate(x + radius * 0.35, y + radius * 0.4);
    ctx.rotate(-0.22);
    ctx.fillStyle = theme.ribbon;
    ctx.beginPath();
    ctx.moveTo(-ribbonWidth / 2, 0);
    ctx.lineTo(ribbonWidth / 2, 0);
    ctx.lineTo(ribbonWidth / 2, ribbonLen);
    ctx.lineTo(0, ribbonLen - 20);
    ctx.lineTo(-ribbonWidth / 2, ribbonLen);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = 'rgba(0, 0, 0, 0.2)';
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.restore();

    // 2. Starburst Points
    const numPoints = 36;
    const innerRadius = radius * 0.88;
    ctx.beginPath();
    for (let i = 0; i < numPoints * 2; i++) {
      const r = (i % 2 === 0) ? radius : innerRadius;
      const angle = (i * Math.PI) / numPoints;
      const px = x + Math.cos(angle) * r;
      const py = y + Math.sin(angle) * r;
      if (i === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
    ctx.closePath();

    // Radiant Gold Gradient
    const goldGrad = ctx.createRadialGradient(x - radius * 0.25, y - radius * 0.25, 5, x, y, radius);
    goldGrad.addColorStop(0, '#FFF9D2');
    goldGrad.addColorStop(0.35, '#E5C058');
    goldGrad.addColorStop(0.7, '#C59A27');
    goldGrad.addColorStop(1, '#8C6514');
    ctx.fillStyle = goldGrad;
    ctx.fill();
    ctx.strokeStyle = '#6E4D0C';
    ctx.lineWidth = 2.5;
    ctx.stroke();

    // 3. Inner Embossed Circles
    ctx.beginPath();
    ctx.arc(x, y, radius * 0.76, 0, Math.PI * 2);
    ctx.strokeStyle = '#FFF3A1';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Beaded Ring
    const numBeads = 32;
    const beadRadius = radius * 0.72;
    ctx.fillStyle = '#FFF8C4';
    for (let i = 0; i < numBeads; i++) {
      const angle = (i * 2 * Math.PI) / numBeads;
      const bx = x + Math.cos(angle) * beadRadius;
      const by = y + Math.sin(angle) * beadRadius;
      ctx.beginPath();
      ctx.arc(bx, by, 2.5, 0, Math.PI * 2);
      ctx.fill();
    }

    // Inner Center Disc
    ctx.beginPath();
    ctx.arc(x, y, radius * 0.62, 0, Math.PI * 2);
    const innerGrad = ctx.createRadialGradient(x, y, 0, x, y, radius * 0.62);
    innerGrad.addColorStop(0, '#E5C058');
    innerGrad.addColorStop(0.8, '#A07518');
    innerGrad.addColorStop(1, '#6E4D0C');
    ctx.fillStyle = innerGrad;
    ctx.fill();
    ctx.strokeStyle = '#FFE885';
    ctx.lineWidth = 2;
    ctx.stroke();

    // 4. Inscribed Emblem Text & Stars
    ctx.fillStyle = '#FFFFFF';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.font = 'bold 15px Georgia, serif';
    ctx.shadowColor = 'rgba(0, 0, 0, 0.4)';
    ctx.shadowBlur = 4;
    ctx.fillText('★ OFFICIAL ★', x, y - 24);

    ctx.font = 'bold 18px Georgia, serif';
    ctx.fillText('CERTIFIED', x, y);

    ctx.font = 'bold 14px Georgia, serif';
    ctx.fillText('EXCELLENCE', x, y + 22);

    ctx.font = '11px sans-serif';
    ctx.fillText('ALL IN ONE', x, y + 38);

    ctx.restore();
  }

  // Draw Ornate Corner Flourish
  function drawCornerFlourish(x, y, size, dirX, dirY, strokeColor) {
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(dirX, dirY);
    ctx.strokeStyle = strokeColor;
    ctx.lineWidth = 2;

    // Corner right-angle bracket
    ctx.beginPath();
    ctx.moveTo(0, size);
    ctx.lineTo(0, 0);
    ctx.lineTo(size, 0);
    ctx.stroke();

    // Inner decorative curve
    ctx.beginPath();
    ctx.arc(0, 0, size * 0.65, 0, Math.PI / 2);
    ctx.stroke();

    // Little diamond in corner
    ctx.fillStyle = strokeColor;
    ctx.beginPath();
    ctx.moveTo(12, 0);
    ctx.lineTo(16, 4);
    ctx.lineTo(12, 8);
    ctx.lineTo(8, 4);
    ctx.closePath();
    ctx.fill();

    ctx.beginPath();
    ctx.moveTo(0, 12);
    ctx.lineTo(4, 16);
    ctx.lineTo(0, 20);
    ctx.lineTo(-4, 16);
    ctx.closePath();
    ctx.fill();

    ctx.restore();
  }

  // Draw Metric Card
  function drawMetricCard(x, y, w, h, label, value, subtext, theme) {
    ctx.save();

    // Card background
    ctx.fillStyle = theme.cardBg;
    ctx.strokeStyle = theme.border;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.roundRect(x, y, w, h, 12);
    ctx.fill();
    ctx.stroke();

    // Subtle inner hairline
    ctx.strokeStyle = theme.borderSecondary;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.roundRect(x + 5, y + 5, w - 10, h - 10, 8);
    ctx.stroke();

    // Label
    ctx.fillStyle = theme.accent;
    ctx.textAlign = 'center';
    ctx.font = 'bold 16px sans-serif';
    ctx.fillText(label, x + w / 2, y + 38);

    // Big Value
    ctx.fillStyle = theme.primary;
    ctx.font = 'bold 54px Georgia, serif';
    ctx.fillText(value, x + w / 2, y + 96);

    // Subtext
    ctx.fillStyle = theme.secondary;
    ctx.font = '600 13px sans-serif';
    ctx.fillText(subtext, x + w / 2, y + 130);

    ctx.restore();
  }

  // Master Render Certificate Function
  function renderCertificate() {
    const width = 1920;
    const height = 1280;
    const theme = THEMES[activeThemeKey] || THEMES.gold;

    // Reset Canvas
    ctx.clearRect(0, 0, width, height);

    // 1. Background Fill
    ctx.fillStyle = theme.bg;
    ctx.fillRect(0, 0, width, height);

    // Subtle background gradient
    const bgGrad = ctx.createRadialGradient(width / 2, height / 2, 200, width / 2, height / 2, 900);
    bgGrad.addColorStop(0, theme.bg);
    bgGrad.addColorStop(1, theme.bgSecondary);
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, width, height);

    // Subtle guilloche / watermark texture lines
    ctx.save();
    ctx.strokeStyle = theme.isDark ? 'rgba(255, 255, 255, 0.025)' : 'rgba(0, 0, 0, 0.025)';
    ctx.lineWidth = 1;
    for (let r = 80; r < 800; r += 40) {
      ctx.beginPath();
      ctx.arc(width / 2, height / 2, r, 0, Math.PI * 2);
      ctx.stroke();
    }
    ctx.restore();

    // 2. Borders & Ornate Frame
    // Outer Heavy Frame
    ctx.strokeStyle = theme.border;
    ctx.lineWidth = 6;
    ctx.strokeRect(50, 50, width - 100, height - 100);

    // Middle Inset Hairline
    ctx.strokeStyle = theme.borderSecondary;
    ctx.lineWidth = 1.5;
    ctx.strokeRect(62, 62, width - 124, height - 124);

    // Inner Frame
    ctx.strokeStyle = theme.border;
    ctx.lineWidth = 2.5;
    ctx.strokeRect(78, 78, width - 156, height - 156);

    // Corner Ornaments
    drawCornerFlourish(90, 90, 50, 1, 1, theme.border);
    drawCornerFlourish(width - 90, 90, 50, -1, 1, theme.border);
    drawCornerFlourish(90, height - 90, 50, 1, -1, theme.border);
    drawCornerFlourish(width - 90, height - 90, 50, -1, -1, theme.border);

    // 3. Top Organization & Crest
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    ctx.fillStyle = theme.accent;
    ctx.font = 'bold 16px sans-serif';
    ctx.letterSpacing = '5px';
    ctx.fillText('★ ALL IN ONE GLOBAL TOUCH TYPING STANDARDS ★', width / 2, 170);

    // 4. Certificate Title
    const titleText = getCertificateTitle().toUpperCase();
    ctx.fillStyle = theme.primary;
    ctx.font = 'bold 56px Georgia, serif';
    ctx.letterSpacing = '2px';
    ctx.fillText(titleText, width / 2, 255);

    // Title Decorative Divider
    ctx.strokeStyle = theme.border;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(width / 2 - 320, 305);
    ctx.lineTo(width / 2 + 320, 305);
    ctx.stroke();

    // Center Diamond on Divider
    ctx.fillStyle = theme.accent;
    ctx.beginPath();
    ctx.moveTo(width / 2, 297);
    ctx.lineTo(width / 2 + 8, 305);
    ctx.lineTo(width / 2, 313);
    ctx.lineTo(width / 2 - 8, 305);
    ctx.closePath();
    ctx.fill();

    // 5. "THIS IS PROUDLY PRESENTED TO"
    ctx.fillStyle = theme.secondary;
    ctx.font = 'italic 22px Georgia, serif';
    ctx.letterSpacing = '3px';
    ctx.fillText('THIS RECOGNITION IS PROUDLY CONFERRED UPON', width / 2, 360);

    // 6. Recipient Name
    const recipientName = inputName.value.trim() || 'Alex Morgan';
    ctx.fillStyle = theme.primary;
    ctx.font = 'bold italic 70px Georgia, "Times New Roman", serif';
    ctx.letterSpacing = '1px';
    ctx.fillText(recipientName, width / 2, 455);

    // Recipient Underline Accent
    const nameWidth = ctx.measureText(recipientName).width;
    const underlineLen = Math.max(nameWidth * 1.15, 360);
    ctx.strokeStyle = theme.border;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(width / 2 - underlineLen / 2, 502);
    ctx.lineTo(width / 2 + underlineLen / 2, 502);
    ctx.stroke();

    // 7. Citation Text
    ctx.fillStyle = theme.secondary;
    ctx.font = '22px Georgia, serif';
    ctx.letterSpacing = '0.5px';
    ctx.fillText('For exceptional performance and demonstrated mastery in keyboard touch typing and data precision,', width / 2, 560);
    ctx.fillText('achieving verified speeds and high accuracy benchmarks under standardized testing evaluation.', width / 2, 595);

    // 8. Dual Stat Badges (WPM and Accuracy)
    const wpmVal = `${inputWpm.value || 0} WPM`;
    const accVal = `${inputAccuracy.value || 100}%`;
    const plaqueW = 320;
    const plaqueH = 150;
    const plaqueY = 665;

    // Speed Plaque (Left)
    drawMetricCard(width / 2 - plaqueW - 50, plaqueY, plaqueW, plaqueH, 'TYPING SPEED', wpmVal, 'GROSS / NET WORDS PER MINUTE', theme);

    // Accuracy Plaque (Right)
    drawMetricCard(width / 2 + 50, plaqueY, plaqueW, plaqueH, 'ACCURACY RATE', accVal, 'KEYSTROKE PRECISION BENCHMARK', theme);

    // 9. Ornate Gold Seal Badge (Center Bottom)
    const sealX = width / 2;
    const sealY = 990;
    drawGoldSeal(sealX, sealY, 95, theme);

    // 10. Left Footer: Issue Date & Verification Code
    const dateFormatted = formatDisplayDate(inputDate.value);
    const certId = inputCertId.value || 'AIO-TYP-2025-9821';

    ctx.textAlign = 'left';
    ctx.fillStyle = theme.secondary;
    ctx.font = '600 15px sans-serif';
    ctx.fillText(`DATE OF ISSUANCE: ${dateFormatted}`, 160, 960);
    ctx.fillText(`VERIFICATION ID: ${certId}`, 160, 990);

    // Security Verification Micro-Badge
    ctx.fillStyle = theme.accent;
    ctx.font = 'bold 12px sans-serif';
    ctx.fillText('🛡 VERIFIED AUTHENTIC DIGITALLY GENERATED DIPLOMA', 160, 1025);

    // 11. Right Footer: Signature & Official Signatory
    const signatory = inputSignatory.value.trim() || 'ALL IN ONE Examination Board';

    ctx.textAlign = 'center';
    const sigCenterX = width - 360;

    // Simulated Calligraphic Signature
    ctx.fillStyle = theme.isDark ? '#E2E8F0' : '#1E293B';
    ctx.font = 'italic 38px cursive, "Brush Script MT", Georgia';
    ctx.fillText('A. R. Thornton', sigCenterX, 950);

    // Signature Line
    ctx.strokeStyle = theme.border;
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(sigCenterX - 180, 975);
    ctx.lineTo(sigCenterX + 180, 975);
    ctx.stroke();

    // Signatory Title
    ctx.fillStyle = theme.primary;
    ctx.font = 'bold 16px sans-serif';
    ctx.fillText(signatory, sigCenterX, 1005);

    ctx.fillStyle = theme.secondary;
    ctx.font = '13px sans-serif';
    ctx.fillText('Director of Skills & Examination Standards', sigCenterX, 1028);
  }

  // Set default date to today
  const todayIso = new Date().toISOString().split('T')[0];
  inputDate.value = todayIso;
  inputCertId.value = generateCertId();

  // Load URL parameters if navigated from typing tests
  loadUrlParameters();

  // Initial Draw
  renderCertificate();

  // Event Listeners for Live Preview Updating
  [inputName, inputWpm, inputAccuracy, inputCustomTitle, inputDate, inputSignatory].forEach(el => {
    el.addEventListener('input', renderCertificate);
  });

  selectTitlePreset.addEventListener('change', () => {
    if (selectTitlePreset.value === 'custom') {
      groupCustomTitle.style.display = 'block';
      inputCustomTitle.focus();
    } else {
      groupCustomTitle.style.display = 'none';
    }
    renderCertificate();
  });

  btnRefreshId.addEventListener('click', () => {
    inputCertId.value = generateCertId();
    renderCertificate();
  });

  // Theme selection
  themeCards.forEach(card => {
    card.addEventListener('click', () => {
      themeCards.forEach(c => c.classList.remove('active'));
      card.classList.add('active');
      activeThemeKey = card.dataset.theme;
      renderCertificate();
    });
  });

  // Download PNG Button
  btnDownloadPng.addEventListener('click', () => {
    const recipient = (inputName.value.trim() || 'certificate').replace(/\s+/g, '-').toLowerCase();
    const dataUrl = canvas.toDataURL('image/png', 1.0);
    const link = document.createElement('a');
    link.download = `typing-certificate-${recipient}.png`;
    link.href = dataUrl;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  });

  // Copy Image to Clipboard
  btnCopyImg.addEventListener('click', () => {
    canvas.toBlob(blob => {
      if (!blob) return;
      try {
        const item = new ClipboardItem({ 'image/png': blob });
        navigator.clipboard.write([item]).then(() => {
          const original = btnCopyImg.innerHTML;
          btnCopyImg.innerHTML = '<span>&check; Image Copied!</span>';
          setTimeout(() => {
            btnCopyImg.innerHTML = original;
          }, 1800);
        });
      } catch (err) {
        alert('Image copying is not supported by your browser. Please use the Download button.');
      }
    });
  });

  // Print / PDF Button
  btnPrintCert.addEventListener('click', () => {
    window.print();
  });
});