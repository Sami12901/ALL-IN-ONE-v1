// Tweet Layout Previewer - Complete Client-Side Implementation
document.addEventListener('DOMContentLoaded', () => {
  // Elements - Inputs
  const inpName = document.getElementById('inp-name');
  const inpHandle = document.getElementById('inp-handle');
  const inpAvatarFile = document.getElementById('inp-avatar-file');
  const btnResetAvatar = document.getElementById('btn-reset-avatar');
  const badgeButtons = document.querySelectorAll('.badge-pill-btn');
  const inpText = document.getElementById('inp-text');
  const inpMediaFile = document.getElementById('inp-media-file');
  const btnRemoveMedia = document.getElementById('btn-remove-media');
  const inpTimestamp = document.getElementById('inp-timestamp');
  const inpViews = document.getElementById('inp-views');
  const inpReplies = document.getElementById('inp-replies');
  const inpRetweets = document.getElementById('inp-retweets');
  const inpLikes = document.getElementById('inp-likes');
  const inpBookmarks = document.getElementById('inp-bookmarks');

  // Gauge Elements
  const charGaugeCircle = document.getElementById('char-gauge-circle');
  const gaugeRemainingText = document.getElementById('gauge-remaining-text');
  const charCountLabel = document.getElementById('char-count-label');

  // Preview Elements
  const xCardPreview = document.getElementById('x-card-preview');
  const cardAvatar = document.getElementById('card-avatar');
  const cardName = document.getElementById('card-name');
  const cardBadge = document.getElementById('card-badge');
  const cardHandle = document.getElementById('card-handle');
  const cardText = document.getElementById('card-text');
  const cardMediaBox = document.getElementById('card-media-box');
  const cardMedia = document.getElementById('card-media');
  const cardTimestamp = document.getElementById('card-timestamp');
  const cardViewsCount = document.getElementById('card-views-count');
  const cardRepliesCount = document.getElementById('card-replies-count');
  const cardRetweetsCount = document.getElementById('card-retweets-count');
  const cardLikesCount = document.getElementById('card-likes-count');
  const cardBookmarksCount = document.getElementById('card-bookmarks-count');

  // Theme Chips
  const themeChips = document.querySelectorAll('.theme-chip');

  // Export Buttons
  const btnDownloadPng = document.getElementById('btn-download-png');
  const btnCopyText = document.getElementById('btn-copy-text');
  const exportCanvas = document.getElementById('export-canvas');

  // Toast
  const appToast = document.getElementById('app-toast');
  const toastMessage = document.getElementById('toast-message');
  let toastTimer = null;

  function showToast(msg) {
    if (toastTimer) clearTimeout(toastTimer);
    toastMessage.textContent = msg;
    appToast.classList.add('show');
    toastTimer = setTimeout(() => {
      appToast.classList.remove('show');
    }, 2500);
  }

  // Verified Badge SVGs
  const BADGE_SVG_BLUE = `<svg width="18" height="18" viewBox="0 0 24 24" fill="#1d9bf0" style="vertical-align: middle;"><path d="M22.5 12.5c0-1.58-.875-2.95-2.148-3.6.154-.435.238-.905.238-1.4 0-2.21-1.79-4-4-4-.495 0-.965.084-1.4.238C14.55 2.475 13.18 1.6 11.6 1.6c-1.58 0-2.95.875-3.6 2.148-.435-.154-.905-.238-1.4-.238-2.21 0-4 1.79-4 4 0 .495.084.965.238 1.4C1.575 9.55.7 10.92.7 12.5c0 1.58.875 2.95 2.148 3.6-.154.435-.238.905-.238 1.4 0 2.21 1.79 4 4 4 .495 0 .965-.084 1.4-.238 1.05 1.273 2.42 2.148 4 2.148 1.58 0 2.95-.875 3.6-2.148.435.154.905.238 1.4.238 2.21 0 4-1.79 4-4 0-.495-.084-.965-.238-1.4 1.273-1.05 2.148-2.42 2.148-4z"/><path d="M10.2 16.2l-3.5-3.5 1.4-1.4 2.1 2.1 5.6-5.6 1.4 1.4-7 7z" fill="#ffffff"/></svg>`;
  const BADGE_SVG_GOLD = `<svg width="18" height="18" viewBox="0 0 24 24" fill="#e2b714" style="vertical-align: middle;"><path d="M22.5 12.5c0-1.58-.875-2.95-2.148-3.6.154-.435.238-.905.238-1.4 0-2.21-1.79-4-4-4-.495 0-.965.084-1.4.238C14.55 2.475 13.18 1.6 11.6 1.6c-1.58 0-2.95.875-3.6 2.148-.435-.154-.905-.238-1.4-.238-2.21 0-4 1.79-4 4 0 .495.084.965.238 1.4C1.575 9.55.7 10.92.7 12.5c0 1.58.875 2.95 2.148 3.6-.154.435-.238.905-.238 1.4 0 2.21 1.79 4 4 4 .495 0 .965-.084 1.4-.238 1.05 1.273 2.42 2.148 4 2.148 1.58 0 2.95-.875 3.6-2.148.435.154.905.238 1.4.238 2.21 0 4-1.79 4-4 0-.495-.084-.965-.238-1.4 1.273-1.05 2.148-2.42 2.148-4z"/><path d="M10.2 16.2l-3.5-3.5 1.4-1.4 2.1 2.1 5.6-5.6 1.4 1.4-7 7z" fill="#000000"/></svg>`;

  // Default Stylish Avatar SVG Data URL
  const DEFAULT_AVATAR = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="%231d9bf0"/><stop offset="100%" stop-color="%237928ca"/></linearGradient></defs><circle cx="50" cy="50" r="50" fill="url(%23g)"/><text x="50" y="58" font-size="34" font-family="-apple-system, sans-serif" font-weight="700" fill="%23ffffff" text-anchor="middle">AR</text></svg>`;

  // State
  let activeBadge = 'blue';
  let activeTheme = 'theme-dark';
  let activeAvatarDataUrl = DEFAULT_AVATAR;
  let activeMediaDataUrl = '';

  // Initialize Avatar
  cardAvatar.src = activeAvatarDataUrl;

  // Format Tweet Text (Mentions, Hashtags, URLs)
  function formatTweetText(text) {
    if (!text) return '';
    // Escape HTML
    let safe = text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');

    // Highlight URLs
    safe = safe.replace(/(https?:\/\/[^\s]+)/g, '<span class="x-highlight">$1</span>');
    // Highlight @Mentions
    safe = safe.replace(/(@[a-zA-Z0-9_]+)/g, '<span class="x-highlight">$1</span>');
    // Highlight #Hashtags
    safe = safe.replace(/(#[a-zA-Z0-9_]+)/g, '<span class="x-highlight">$1</span>');

    return safe;
  }

  // Update Character Counter & Circular Ring Gauge
  function updateCharGauge() {
    const text = inpText.value;
    const len = text.length;
    const maxChars = 280;
    const circumference = 2 * Math.PI * 14; // ~87.96

    charCountLabel.textContent = `${len} / ${maxChars}`;

    if (len <= maxChars) {
      const progress = len / maxChars;
      const offset = circumference * (1 - progress);
      charGaugeCircle.style.strokeDashoffset = offset;

      if (len >= 260) {
        charGaugeCircle.style.stroke = '#f59e0b';
        gaugeRemainingText.textContent = maxChars - len;
        gaugeRemainingText.style.color = '#f59e0b';
      } else {
        charGaugeCircle.style.stroke = '#1d9bf0';
        gaugeRemainingText.textContent = '';
      }
    } else {
      // Over limit
      charGaugeCircle.style.strokeDashoffset = 0;
      charGaugeCircle.style.stroke = '#ef4444';
      gaugeRemainingText.textContent = -(len - maxChars);
      gaugeRemainingText.style.color = '#ef4444';
    }
  }

  // Update Card UI
  function updateCardPreview() {
    cardName.textContent = inpName.value || 'Name';
    
    let handle = inpHandle.value.trim();
    if (handle.startsWith('@')) handle = handle.substring(1);
    cardHandle.textContent = `@${handle || 'handle'}`;

    // Badge
    if (activeBadge === 'blue') {
      cardBadge.innerHTML = BADGE_SVG_BLUE;
      cardBadge.style.display = 'inline-flex';
    } else if (activeBadge === 'gold') {
      cardBadge.innerHTML = BADGE_SVG_GOLD;
      cardBadge.style.display = 'inline-flex';
    } else {
      cardBadge.innerHTML = '';
      cardBadge.style.display = 'none';
    }

    // Text
    cardText.innerHTML = formatTweetText(inpText.value);

    // Media
    if (activeMediaDataUrl) {
      cardMedia.src = activeMediaDataUrl;
      cardMediaBox.style.display = 'block';
    } else {
      cardMediaBox.style.display = 'none';
    }

    // Timestamp & Metrics
    cardTimestamp.textContent = inpTimestamp.value || '10:42 AM · Oct 6, 2026';
    cardViewsCount.textContent = inpViews.value || '0';
    cardRepliesCount.textContent = inpReplies.value || '0';
    cardRetweetsCount.textContent = inpRetweets.value || '0';
    cardLikesCount.textContent = inpLikes.value || '0';
    cardBookmarksCount.textContent = inpBookmarks.value || '0';

    updateCharGauge();
  }

  // Listeners for live sync
  [inpName, inpHandle, inpTimestamp, inpViews, inpReplies, inpRetweets, inpLikes, inpBookmarks].forEach(el => {
    el.addEventListener('input', updateCardPreview);
  });
  inpText.addEventListener('input', updateCardPreview);

  // Badge pills
  badgeButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      badgeButtons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      activeBadge = btn.dataset.badge;
      updateCardPreview();
    });
  });

  // Theme chips
  themeChips.forEach(chip => {
    chip.addEventListener('click', () => {
      themeChips.forEach(c => c.classList.remove('active'));
      chip.classList.add('active');
      activeTheme = chip.dataset.theme;
      xCardPreview.className = `x-card ${activeTheme}`;
    });
  });

  // Avatar Upload Handlers
  inpAvatarFile.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (evt) => {
        activeAvatarDataUrl = evt.target.result;
        cardAvatar.src = activeAvatarDataUrl;
        showToast('Profile avatar updated!');
      };
      reader.readAsDataURL(file);
    }
  });

  btnResetAvatar.addEventListener('click', () => {
    activeAvatarDataUrl = DEFAULT_AVATAR;
    cardAvatar.src = activeAvatarDataUrl;
    inpAvatarFile.value = '';
    showToast('Avatar reset to default.');
  });

  // Media Upload Handlers
  inpMediaFile.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (evt) => {
        activeMediaDataUrl = evt.target.result;
        cardMedia.src = activeMediaDataUrl;
        cardMediaBox.style.display = 'block';
        btnRemoveMedia.style.display = 'inline-block';
        showToast('Media image attached!');
      };
      reader.readAsDataURL(file);
    }
  });

  btnRemoveMedia.addEventListener('click', () => {
    activeMediaDataUrl = '';
    cardMedia.src = '';
    cardMediaBox.style.display = 'none';
    btnRemoveMedia.style.display = 'none';
    inpMediaFile.value = '';
    showToast('Attached media removed.');
  });

  // Copy Tweet Text
  btnCopyText.addEventListener('click', () => {
    const text = inpText.value;
    if (!text) return;
    navigator.clipboard.writeText(text).then(() => {
      showToast('Tweet content copied!');
    });
  });

  // Helper to wrap text for Canvas
  function wrapCanvasText(ctx, text, maxWidth) {
    const lines = [];
    const paragraphs = text.split('\n');
    paragraphs.forEach(p => {
      if (!p) {
        lines.push('');
        return;
      }
      const words = p.split(' ');
      let currentLine = words[0];
      for (let i = 1; i < words.length; i++) {
        const word = words[i];
        const width = ctx.measureText(currentLine + ' ' + word).width;
        if (width < maxWidth) {
          currentLine += ' ' + word;
        } else {
          lines.push(currentLine);
          currentLine = word;
        }
      }
      lines.push(currentLine);
    });
    return lines;
  }

  // Draw rounded rect helper
  function drawRoundedRect(ctx, x, y, width, height, radius, fill, stroke, strokeColor) {
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.lineTo(x + width - radius, y);
    ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
    ctx.lineTo(x + width, y + height - radius);
    ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
    ctx.lineTo(x + radius, y + height);
    ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
    ctx.lineTo(x, y + radius);
    ctx.quadraticCurveTo(x, y, x + radius, y);
    ctx.closePath();
    if (fill) ctx.fill();
    if (stroke) {
      ctx.strokeStyle = strokeColor;
      ctx.stroke();
    }
  }

  // Load Image helper for Canvas
  function loadImage(src) {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => resolve(img);
      img.onerror = reject;
      img.src = src;
    });
  }

  // High-Resolution 2D Canvas Export
  btnDownloadPng.addEventListener('click', async () => {
    const originalBtnText = btnDownloadPng.innerHTML;
    btnDownloadPng.disabled = true;
    btnDownloadPng.textContent = 'Rendering High-Res PNG...';

    try {
      const canvas = exportCanvas;
      const ctx = canvas.getContext('2d');
      const scale = 2; // Retina 2x

      // Card settings
      const cardWidth = 560;
      const padding = 24;
      const contentWidth = cardWidth - (padding * 2);

      // Measure text height
      ctx.font = '16px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
      const textLines = wrapCanvasText(ctx, inpText.value, contentWidth);
      const lineHeight = 24;
      const textBlockHeight = textLines.length * lineHeight;

      // Media height calculation
      let mediaHeight = 0;
      let mediaImgObj = null;
      if (activeMediaDataUrl) {
        try {
          mediaImgObj = await loadImage(activeMediaDataUrl);
          const aspect = mediaImgObj.width / mediaImgObj.height;
          mediaHeight = Math.min(320, Math.round(contentWidth / aspect));
        } catch (e) {
          console.error("Could not load media image for canvas", e);
        }
      }

      // Calculate total height
      // Header: 52px + 12px margin
      // Text block: textBlockHeight + 16px
      // Media block: mediaHeight + (mediaHeight ? 16px : 0)
      // Meta row: 20px + 12px
      // Actions row: 24px + padding
      const headerHeight = 56;
      const metaRowHeight = 32;
      const actionsRowHeight = 36;
      const totalCardHeight = padding + headerHeight + textBlockHeight + 16 + (mediaHeight ? mediaHeight + 16 : 0) + metaRowHeight + actionsRowHeight + padding;

      // Total canvas with surrounding padding/margin for nice aesthetic shadow
      const outerPadding = 30;
      canvas.width = (cardWidth + outerPadding * 2) * scale;
      canvas.height = (totalCardHeight + outerPadding * 2) * scale;

      ctx.scale(scale, scale);

      // Background theme colors
      let bgColor = '#000000';
      let cardBg = '#000000';
      let textColor = '#e7e9ea';
      let subTextColor = '#71767b';
      let borderColor = '#2f3336';
      let canvasOuterBg = '#08090a';

      if (activeTheme === 'theme-dim') {
        cardBg = '#15202b';
        textColor = '#f7f9f9';
        subTextColor = '#8899a6';
        borderColor = '#38444d';
        canvasOuterBg = '#0d1318';
      } else if (activeTheme === 'theme-light') {
        cardBg = '#ffffff';
        textColor = '#0f1419';
        subTextColor = '#536471';
        borderColor = '#cfd9de';
        canvasOuterBg = '#f7f9f9';
      }

      // Fill canvas background
      ctx.fillStyle = canvasOuterBg;
      ctx.fillRect(0, 0, cardWidth + outerPadding * 2, totalCardHeight + outerPadding * 2);

      // Draw Card with shadow & border
      const cardX = outerPadding;
      const cardY = outerPadding;

      ctx.save();
      ctx.shadowColor = 'rgba(0, 0, 0, 0.4)';
      ctx.shadowBlur = 20;
      ctx.shadowOffsetY = 6;
      ctx.fillStyle = cardBg;
      drawRoundedRect(ctx, cardX, cardY, cardWidth, totalCardHeight, 16, true, true, borderColor);
      ctx.restore();

      // Render Avatar
      const avatarSize = 48;
      const avatarX = cardX + padding;
      const avatarY = cardY + padding;

      try {
        const avatarImg = await loadImage(activeAvatarDataUrl);
        ctx.save();
        ctx.beginPath();
        ctx.arc(avatarX + avatarSize / 2, avatarY + avatarSize / 2, avatarSize / 2, 0, Math.PI * 2);
        ctx.closePath();
        ctx.clip();
        ctx.drawImage(avatarImg, avatarX, avatarY, avatarSize, avatarSize);
        ctx.restore();
      } catch (e) {
        // Fallback circle
        ctx.fillStyle = '#1d9bf0';
        ctx.beginPath();
        ctx.arc(avatarX + avatarSize / 2, avatarY + avatarSize / 2, avatarSize / 2, 0, Math.PI * 2);
        ctx.fill();
      }

      // Render Display Name & Handle
      const nameX = avatarX + avatarSize + 12;
      const nameY = avatarY + 18;

      ctx.font = 'bold 16px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
      ctx.fillStyle = textColor;
      ctx.fillText(inpName.value || 'Name', nameX, nameY);

      const nameWidth = ctx.measureText(inpName.value || 'Name').width;

      // Draw badge icon if active
      if (activeBadge !== 'none') {
        const badgeX = nameX + nameWidth + 6;
        const badgeY = nameY - 14;
        ctx.fillStyle = activeBadge === 'gold' ? '#e2b714' : '#1d9bf0';
        ctx.beginPath();
        ctx.arc(badgeX + 8, badgeY + 8, 8, 0, Math.PI * 2);
        ctx.fill();

        // Checkmark
        ctx.strokeStyle = activeBadge === 'gold' ? '#000000' : '#ffffff';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(badgeX + 4.5, badgeY + 8);
        ctx.lineTo(badgeX + 7, badgeY + 11);
        ctx.lineTo(badgeX + 11.5, badgeY + 5.5);
        ctx.stroke();
      }

      // Render Handle
      ctx.font = '14px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
      ctx.fillStyle = subTextColor;
      let cleanHandle = inpHandle.value.trim();
      if (!cleanHandle.startsWith('@')) cleanHandle = `@${cleanHandle}`;
      ctx.fillText(cleanHandle, nameX, nameY + 20);

      // Render Body Text with Word Wrapping & Colored Hashtags
      let currentY = avatarY + avatarSize + 20;
      ctx.font = '16px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';

      textLines.forEach(line => {
        let drawX = cardX + padding;
        const tokens = line.split(' ');
        tokens.forEach((token, idx) => {
          if (/^#[a-zA-Z0-9_]+$/.test(token) || /^@[a-zA-Z0-9_]+$/.test(token) || /^https?:\/\//.test(token)) {
            ctx.fillStyle = '#1d9bf0';
          } else {
            ctx.fillStyle = textColor;
          }
          const wordToDraw = idx === tokens.length - 1 ? token : token + ' ';
          ctx.fillText(wordToDraw, drawX, currentY);
          drawX += ctx.measureText(wordToDraw).width;
        });
        currentY += lineHeight;
      });

      // Render Media Attachment if present
      if (mediaImgObj && mediaHeight > 0) {
        currentY += 8;
        const mediaX = cardX + padding;
        ctx.save();
        ctx.beginPath();
        drawRoundedRect(ctx, mediaX, currentY, contentWidth, mediaHeight, 14, false, false, '');
        ctx.clip();
        ctx.drawImage(mediaImgObj, mediaX, currentY, contentWidth, mediaHeight);
        ctx.restore();

        // Border around media
        ctx.strokeStyle = borderColor;
        ctx.lineWidth = 1;
        drawRoundedRect(ctx, mediaX, currentY, contentWidth, mediaHeight, 14, false, true, borderColor);

        currentY += mediaHeight + 16;
      } else {
        currentY += 12;
      }

      // Render Divider Line
      ctx.strokeStyle = borderColor;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(cardX + padding, currentY);
      ctx.lineTo(cardX + cardWidth - padding, currentY);
      ctx.stroke();

      currentY += 18;

      // Render Timestamp & Views
      ctx.font = '14px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
      ctx.fillStyle = subTextColor;
      const metaText = `${inpTimestamp.value || '10:42 AM · Oct 6, 2026'}  ·  ${inpViews.value || '0'} Views`;
      ctx.fillText(metaText, cardX + padding, currentY);

      currentY += 14;

      // Render Divider Line before actions
      ctx.beginPath();
      ctx.moveTo(cardX + padding, currentY);
      ctx.lineTo(cardX + cardWidth - padding, currentY);
      ctx.stroke();

      currentY += 20;

      // Render Action Metrics Row
      const metrics = [
        { label: '💬', val: inpReplies.value || '0' },
        { label: '🔁', val: inpRetweets.value || '0' },
        { label: '❤️', val: inpLikes.value || '0' },
        { label: '🔖', val: inpBookmarks.value || '0' }
      ];

      const colWidth = contentWidth / metrics.length;
      ctx.font = '13px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';

      metrics.forEach((m, idx) => {
        const itemX = cardX + padding + (idx * colWidth);
        ctx.fillStyle = subTextColor;
        ctx.fillText(`${m.label}  ${m.val}`, itemX, currentY);
      });

      // Export image
      const dataUrl = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.download = `tweet_${cleanHandle.replace('@', '')}_preview.png`;
      link.href = dataUrl;
      link.click();
      showToast('Tweet PNG downloaded successfully!');

    } catch (err) {
      console.error(err);
      showToast('Error generating PNG preview.');
    } finally {
      btnDownloadPng.innerHTML = originalBtnText;
      btnDownloadPng.disabled = false;
    }
  });

  // Initial render
  updateCardPreview();
});