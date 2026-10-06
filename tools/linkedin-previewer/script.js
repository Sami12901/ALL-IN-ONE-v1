// LinkedIn Post Previewer - Complete Client-Side Implementation
document.addEventListener('DOMContentLoaded', () => {
  // Elements - Inputs
  const inpAuthorName = document.getElementById('inp-author-name');
  const inpHeadline = document.getElementById('inp-headline');
  const inpAvatarFile = document.getElementById('inp-avatar-file');
  const btnResetAvatar = document.getElementById('btn-reset-avatar');
  const inpTimestamp = document.getElementById('inp-timestamp');
  const inpPostText = document.getElementById('inp-post-text');
  const charCounter = document.getElementById('char-counter');
  const inpMediaFile = document.getElementById('inp-media-file');
  const btnRemoveMedia = document.getElementById('btn-remove-media');
  const inpReactions = document.getElementById('inp-reactions');
  const inpCommentsReposts = document.getElementById('inp-comments-reposts');

  // Elements - Preview Card
  const liCardPreview = document.getElementById('li-card-preview');
  const cardAvatar = document.getElementById('card-avatar');
  const cardAuthorName = document.getElementById('card-author-name');
  const cardHeadline = document.getElementById('card-headline');
  const cardTimestamp = document.getElementById('card-timestamp');
  const cardPostBody = document.getElementById('card-post-body');
  const cardMediaBox = document.getElementById('card-media-box');
  const cardMedia = document.getElementById('card-media');
  const cardReactionsCount = document.getElementById('card-reactions-count');
  const cardCommentsReposts = document.getElementById('card-comments-reposts');

  // Device view switcher
  const btnViewDesktop = document.getElementById('btn-view-desktop');
  const btnViewMobile = document.getElementById('btn-view-mobile');

  // Export buttons
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

  // Default Stylish Avatar SVG Data URL
  const DEFAULT_AVATAR = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="%230a66c2"/><stop offset="100%" stop-color="%2310b981"/></linearGradient></defs><circle cx="50" cy="50" r="50" fill="url(%23g)"/><text x="50" y="58" font-size="34" font-family="-apple-system, sans-serif" font-weight="700" fill="%23ffffff" text-anchor="middle">SJ</text></svg>`;

  // State
  let isExpanded = false;
  let activeAvatarDataUrl = DEFAULT_AVATAR;
  let activeMediaDataUrl = '';
  let activeViewMode = 'desktop'; // 'desktop' | 'mobile'

  cardAvatar.src = activeAvatarDataUrl;

  // Format Text with Mentions and Hashtags
  function formatLinkedInText(text) {
    if (!text) return '';
    let safe = text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');

    // Highlight Hashtags
    safe = safe.replace(/(#[a-zA-Z0-9_]+)/g, '<span class="li-highlight">$1</span>');
    // Highlight Mentions
    safe = safe.replace(/(@[a-zA-Z0-9_\s.]+?)(?=[\s]|$)/g, '<span class="li-highlight">$1</span>');

    return safe;
  }

  // Render Post Text with ~210 characters 3-line truncation
  function renderPostContent() {
    const raw = inpPostText.value || '';
    charCounter.textContent = `${raw.length} characters`;

    const TRUNCATE_LIMIT = activeViewMode === 'mobile' ? 180 : 210;

    if (raw.length <= TRUNCATE_LIMIT) {
      cardPostBody.innerHTML = formatLinkedInText(raw);
    } else {
      if (isExpanded) {
        cardPostBody.innerHTML = `${formatLinkedInText(raw)} <span class="li-see-more-btn" id="btn-see-less">...see less</span>`;
        const btnSeeLess = document.getElementById('btn-see-less');
        if (btnSeeLess) {
          btnSeeLess.addEventListener('click', () => {
            isExpanded = false;
            renderPostContent();
          });
        }
      } else {
        // Find natural word boundary near limit
        let cutoff = TRUNCATE_LIMIT;
        const lastSpace = raw.lastIndexOf(' ', cutoff);
        if (lastSpace > cutoff - 30) {
          cutoff = lastSpace;
        }
        const truncated = raw.substring(0, cutoff);
        cardPostBody.innerHTML = `${formatLinkedInText(truncated)} <span class="li-see-more-btn" id="btn-see-more">...see more</span>`;
        const btnSeeMore = document.getElementById('btn-see-more');
        if (btnSeeMore) {
          btnSeeMore.addEventListener('click', () => {
            isExpanded = true;
            renderPostContent();
          });
        }
      }
    }
  }

  // Update Preview Card
  function updateCardPreview() {
    cardAuthorName.textContent = inpAuthorName.value || 'Author Name';
    cardHeadline.textContent = inpHeadline.value || 'Headline';
    cardTimestamp.textContent = inpTimestamp.value || '2h • Edited • 🌐';
    cardReactionsCount.textContent = inpReactions.value || '0';
    cardCommentsReposts.textContent = inpCommentsReposts.value || '0 comments • 0 reposts';

    if (activeMediaDataUrl) {
      cardMedia.src = activeMediaDataUrl;
      cardMediaBox.style.display = 'block';
    } else {
      cardMediaBox.style.display = 'none';
    }

    renderPostContent();
  }

  // Event Listeners for Live Sync
  [inpAuthorName, inpHeadline, inpTimestamp, inpReactions, inpCommentsReposts].forEach(el => {
    el.addEventListener('input', updateCardPreview);
  });
  inpPostText.addEventListener('input', () => {
    isExpanded = false; // Reset expand on fresh typing
    updateCardPreview();
  });

  // Device View Switching
  btnViewDesktop.addEventListener('click', () => {
    btnViewDesktop.classList.add('active');
    btnViewMobile.classList.remove('active');
    activeViewMode = 'desktop';
    liCardPreview.classList.remove('mode-mobile');
    renderPostContent();
  });

  btnViewMobile.addEventListener('click', () => {
    btnViewMobile.classList.add('active');
    btnViewDesktop.classList.remove('active');
    activeViewMode = 'mobile';
    liCardPreview.classList.add('mode-mobile');
    renderPostContent();
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
        showToast('Media image attached to post!');
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

  // Copy Post Content
  btnCopyText.addEventListener('click', () => {
    const text = inpPostText.value;
    if (!text) return;
    navigator.clipboard.writeText(text).then(() => {
      showToast('LinkedIn post text copied!');
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
    ctx.quadraticCurveTo(x + width, y + width, x + width, y + radius);
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

  // Load Image helper
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

      const cardWidth = activeViewMode === 'mobile' ? 420 : 560;
      const padding = 20;
      const contentWidth = cardWidth - (padding * 2);

      // Measure post text height
      ctx.font = '15px -apple-system, system-ui, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
      const textToRender = isExpanded ? inpPostText.value : inpPostText.value.substring(0, 210) + (inpPostText.value.length > 210 ? ' ...see more' : '');
      const textLines = wrapCanvasText(ctx, textToRender, contentWidth);
      const lineHeight = 22;
      const textBlockHeight = textLines.length * lineHeight;

      // Media attachment height
      let mediaHeight = 0;
      let mediaImgObj = null;
      if (activeMediaDataUrl) {
        try {
          mediaImgObj = await loadImage(activeMediaDataUrl);
          const aspect = mediaImgObj.width / mediaImgObj.height;
          mediaHeight = Math.min(300, Math.round(contentWidth / aspect));
        } catch (e) {
          console.error("Could not load media image for canvas", e);
        }
      }

      // Heights breakdown:
      // Header: 54px + 12px
      // Text: textBlockHeight + 14px
      // Media: mediaHeight + (mediaHeight ? 14px : 0)
      // Engagement: 32px
      // Actions: 40px
      const headerHeight = 60;
      const engagementHeight = 32;
      const actionsHeight = 44;
      const totalCardHeight = padding + headerHeight + textBlockHeight + 16 + (mediaHeight ? mediaHeight + 14 : 0) + engagementHeight + actionsHeight + padding;

      const outerPadding = 24;
      canvas.width = (cardWidth + outerPadding * 2) * scale;
      canvas.height = (totalCardHeight + outerPadding * 2) * scale;

      ctx.scale(scale, scale);

      // Palette
      const canvasBg = '#0a0d10';
      const cardBg = '#1b1f23';
      const textColor = '#ffffff';
      const subTextColor = 'rgba(255, 255, 255, 0.65)';
      const borderColor = 'rgba(255, 255, 255, 0.12)';
      const accentBlue = '#70b5f9';

      // Canvas background
      ctx.fillStyle = canvasBg;
      ctx.fillRect(0, 0, cardWidth + outerPadding * 2, totalCardHeight + outerPadding * 2);

      // Card Container with shadow
      const cardX = outerPadding;
      const cardY = outerPadding;

      ctx.save();
      ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
      ctx.shadowBlur = 18;
      ctx.shadowOffsetY = 6;
      ctx.fillStyle = cardBg;
      drawRoundedRect(ctx, cardX, cardY, cardWidth, totalCardHeight, 12, true, true, borderColor);
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
        ctx.fillStyle = '#0a66c2';
        ctx.beginPath();
        ctx.arc(avatarX + avatarSize / 2, avatarY + avatarSize / 2, avatarSize / 2, 0, Math.PI * 2);
        ctx.fill();
      }

      // Render Author Name + Degree
      const infoX = avatarX + avatarSize + 12;
      let infoY = avatarY + 16;

      ctx.font = 'bold 15px -apple-system, system-ui, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
      ctx.fillStyle = textColor;
      ctx.fillText(inpAuthorName.value || 'Author Name', infoX, infoY);

      const nameWidth = ctx.measureText(inpAuthorName.value || 'Author Name').width;
      ctx.font = '12px -apple-system, system-ui, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
      ctx.fillStyle = subTextColor;
      ctx.fillText(' • 1st', infoX + nameWidth, infoY);

      // Render Follow button on right
      ctx.font = 'bold 14px -apple-system, system-ui, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
      ctx.fillStyle = accentBlue;
      ctx.fillText('+ Follow', cardX + cardWidth - padding - 60, infoY);

      // Render Headline
      infoY += 18;
      ctx.font = '12px -apple-system, system-ui, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
      ctx.fillStyle = subTextColor;
      const headlineText = (inpHeadline.value || 'Headline').substring(0, activeViewMode === 'mobile' ? 36 : 56);
      ctx.fillText(headlineText, infoX, infoY);

      // Render Timestamp
      infoY += 16;
      ctx.font = '11px -apple-system, system-ui, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
      ctx.fillStyle = subTextColor;
      ctx.fillText(inpTimestamp.value || '2h • Edited • 🌐', infoX, infoY);

      // Render Body Text
      let currentY = avatarY + avatarSize + 22;
      ctx.font = '15px -apple-system, system-ui, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';

      textLines.forEach(line => {
        let drawX = cardX + padding;
        const tokens = line.split(' ');
        tokens.forEach((token, idx) => {
          if (/^#[a-zA-Z0-9_]+$/.test(token) || /^@[a-zA-Z0-9_]+$/.test(token)) {
            ctx.fillStyle = accentBlue;
          } else if (token === '...see' || token === 'more' || token === '...see more') {
            ctx.fillStyle = subTextColor;
          } else {
            ctx.fillStyle = textColor;
          }
          const wordToDraw = idx === tokens.length - 1 ? token : token + ' ';
          ctx.fillText(wordToDraw, drawX, currentY);
          drawX += ctx.measureText(wordToDraw).width;
        });
        currentY += lineHeight;
      });

      // Render Attached Media if present
      if (mediaImgObj && mediaHeight > 0) {
        currentY += 8;
        const mediaX = cardX + padding;
        ctx.save();
        ctx.beginPath();
        drawRoundedRect(ctx, mediaX, currentY, contentWidth, mediaHeight, 8, false, false, '');
        ctx.clip();
        ctx.drawImage(mediaImgObj, mediaX, currentY, contentWidth, mediaHeight);
        ctx.restore();

        // Border around media
        ctx.strokeStyle = borderColor;
        ctx.lineWidth = 1;
        drawRoundedRect(ctx, mediaX, currentY, contentWidth, mediaHeight, 8, false, true, borderColor);

        currentY += mediaHeight + 14;
      } else {
        currentY += 10;
      }

      // Render Engagement Stats Row
      // Three overlapping reaction icons (Like, Celebrate, Love)
      const rx = cardX + padding;
      const ry = currentY + 4;

      // Blue Like circle
      ctx.fillStyle = '#0a66c2';
      ctx.beginPath();
      ctx.arc(rx + 7, ry + 7, 7, 0, Math.PI * 2);
      ctx.fill();

      // Green Celebrate circle
      ctx.fillStyle = '#44712e';
      ctx.beginPath();
      ctx.arc(rx + 18, ry + 7, 7, 0, Math.PI * 2);
      ctx.fill();

      // Red Heart circle
      ctx.fillStyle = '#df704d';
      ctx.beginPath();
      ctx.arc(rx + 29, ry + 7, 7, 0, Math.PI * 2);
      ctx.fill();

      // Reaction count
      ctx.font = '12px -apple-system, system-ui, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
      ctx.fillStyle = subTextColor;
      ctx.fillText(inpReactions.value || '0', rx + 42, ry + 11);

      // Comments & Reposts on right
      const commentsText = inpCommentsReposts.value || '0 comments • 0 reposts';
      const commentsWidth = ctx.measureText(commentsText).width;
      ctx.fillText(commentsText, cardX + cardWidth - padding - commentsWidth, ry + 11);

      currentY += 24;

      // Divider Line before actions
      ctx.strokeStyle = borderColor;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(cardX + padding, currentY);
      ctx.lineTo(cardX + cardWidth - padding, currentY);
      ctx.stroke();

      currentY += 20;

      // Action Buttons Row (Like, Comment, Repost, Send)
      const actions = [
        { label: '👍 Like' },
        { label: '💬 Comment' },
        { label: '🔁 Repost' },
        { label: '🚀 Send' }
      ];

      const colWidth = contentWidth / actions.length;
      ctx.font = 'bold 13px -apple-system, system-ui, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
      ctx.fillStyle = subTextColor;

      actions.forEach((act, idx) => {
        const itemX = cardX + padding + (idx * colWidth);
        ctx.fillText(act.label, itemX, currentY);
      });

      // Export image
      const dataUrl = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.download = `linkedin_post_mockup_${activeViewMode}.png`;
      link.href = dataUrl;
      link.click();
      showToast('LinkedIn mockup PNG downloaded!');

    } catch (err) {
      console.error(err);
      showToast('Error generating PNG mockup.');
    } finally {
      btnDownloadPng.innerHTML = originalBtnText;
      btnDownloadPng.disabled = false;
    }
  });

  // Initial render
  updateCardPreview();
});