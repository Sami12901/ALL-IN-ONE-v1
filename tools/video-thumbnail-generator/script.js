// Video Thumbnail Generator Studio Logic
document.addEventListener('DOMContentLoaded', () => {
  // DOM Elements
  const canvas = document.getElementById('thumbnail-canvas');
  const ctx = canvas.getContext('2d');
  const hiddenVideo = document.getElementById('hidden-video');
  const dropZone = document.getElementById('drop-zone');
  const fileInput = document.getElementById('video-file-input');
  const loadSampleBtn = document.getElementById('load-sample-btn');
  
  // Scrubber Elements
  const scrubber = document.getElementById('video-scrubber');
  const timeDisplay = document.getElementById('time-display');
  const playPauseBtn = document.getElementById('btn-play-pause');
  const playPauseIcon = document.getElementById('play-pause-icon');
  const stepBack5 = document.getElementById('step-back-5');
  const stepBack1 = document.getElementById('step-back-1');
  const stepBackFrame = document.getElementById('step-back-frame');
  const stepFwdFrame = document.getElementById('step-fwd-frame');
  const stepFwd1 = document.getElementById('step-fwd-1');
  const stepFwd5 = document.getElementById('step-fwd-5');
  const metaBadge = document.getElementById('video-meta-badge');
  const metaFilename = document.getElementById('meta-filename');
  const metaRes = document.getElementById('meta-res');

  // Text & Title Controls
  const inputTitle = document.getElementById('input-title');
  const fontTitle = document.getElementById('font-family-title');
  const colorTitle = document.getElementById('color-title');
  const colorTitleHex = document.getElementById('color-title-hex');
  const sizeTitle = document.getElementById('size-title');
  const valSizeTitle = document.getElementById('val-size-title');
  const posTitle = document.getElementById('pos-title');
  const valPosTitle = document.getElementById('val-pos-title');

  // Subtitle Controls
  const enableSubtitle = document.getElementById('enable-subtitle');
  const subtitleControlsBody = document.getElementById('subtitle-controls-body');
  const inputSubtitle = document.getElementById('input-subtitle');
  const colorSubtitle = document.getElementById('color-subtitle');
  const colorSubtitleHex = document.getElementById('color-subtitle-hex');
  const sizeSubtitle = document.getElementById('size-subtitle');
  const valSizeSub = document.getElementById('val-size-sub');

  // Badge Controls
  const enableBadge = document.getElementById('enable-badge');
  const badgeControlsBody = document.getElementById('badge-controls-body');
  const inputBadge = document.getElementById('input-badge');
  const badgePosition = document.getElementById('badge-position');
  const colorBadgeBg = document.getElementById('color-badge-bg');
  const colorBadgeBgHex = document.getElementById('color-badge-bg-hex');
  const colorBadgeText = document.getElementById('color-badge-text');
  const colorBadgeTextHex = document.getElementById('color-badge-text-hex');

  // Styling & Contrast
  const enableOutline = document.getElementById('enable-outline');
  const outlineSliderWrap = document.getElementById('outline-slider-wrap');
  const colorOutline = document.getElementById('color-outline');
  const colorOutlineHex = document.getElementById('color-outline-hex');
  const strokeWidth = document.getElementById('stroke-width');
  const valStroke = document.getElementById('val-stroke');

  const enableShadow = document.getElementById('enable-shadow');
  const shadowSliderWrap = document.getElementById('shadow-slider-wrap');
  const colorShadow = document.getElementById('color-shadow');
  const colorShadowHex = document.getElementById('color-shadow-hex');
  const shadowBlur = document.getElementById('shadow-blur');
  const valShadow = document.getElementById('val-shadow');

  const enablePill = document.getElementById('enable-pill');
  const pillSliderWrap = document.getElementById('pill-slider-wrap');
  const colorPill = document.getElementById('color-pill');
  const colorPillHex = document.getElementById('color-pill-hex');
  const pillOpacity = document.getElementById('pill-opacity');
  const valPillOpacity = document.getElementById('val-pill-opacity');

  // Filters
  const enableDarkGrad = document.getElementById('enable-dark-grad');
  const enableVignette = document.getElementById('enable-vignette');
  const filterBrightness = document.getElementById('filter-brightness');
  const valBrightness = document.getElementById('val-brightness');
  const filterContrast = document.getElementById('filter-contrast');
  const valContrast = document.getElementById('val-contrast');

  // Preset Buttons
  const presetBtns = document.querySelectorAll('.preset-card-btn');

  // Export Buttons
  const btnDownloadPng = document.getElementById('btn-download-png');
  const btnDownloadJpg = document.getElementById('btn-download-jpg');
  const btnCopyClipboard = document.getElementById('btn-copy-clipboard');
  const btnReset = document.getElementById('btn-reset');
  const exportStatus = document.getElementById('export-status');

  // State
  let isVideoLoaded = false;
  let videoDuration = 0;
  let isPlaying = false;
  let currentFile = null;
  let currentVideoUrl = null;
  let renderQueued = false;
  let activePreset = 'gaming';

  // Format Seconds to MM:SS.SS
  function formatTime(seconds) {
    if (!Number.isFinite(seconds) || seconds < 0) return '00:00.00';
    const mins = Math.floor(seconds / 60);
    const secs = (seconds % 60).toFixed(2);
    const formattedMins = mins.toString().padStart(2, '0');
    const formattedSecs = secs.padStart(5, '0');
    return `${formattedMins}:${formattedSecs}`;
  }

  // Trigger Debounced Canvas Render
  function requestRender() {
    if (renderQueued) return;
    renderQueued = true;
    requestAnimationFrame(() => {
      renderCanvas();
      renderQueued = false;
    });
  }

  // Draw Rounded Rectangle
  function drawRoundedRect(c, x, y, width, height, radius) {
    c.beginPath();
    c.moveTo(x + radius, y);
    c.lineTo(x + width - radius, y);
    c.quadraticCurveTo(x + width, y, x + width, y + radius);
    c.lineTo(x + width, y + height - radius);
    c.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
    c.lineTo(x + radius, y + height);
    c.quadraticCurveTo(x, y + height, x, y + height - radius);
    c.lineTo(x, y + radius);
    c.quadraticCurveTo(x, y, x + radius, y);
    c.closePath();
  }

  // Convert Hex to RGBA
  function hexToRgba(hex, alpha) {
    let cleanHex = hex.replace('#', '');
    if (cleanHex.length === 3) {
      cleanHex = cleanHex.split('').map(c => c + c).join('');
    }
    const r = parseInt(cleanHex.substring(0, 2), 16) || 0;
    const g = parseInt(cleanHex.substring(2, 4), 16) || 0;
    const b = parseInt(cleanHex.substring(4, 6), 16) || 0;
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  }

  // Draw Procedural Sample Frame when no video is loaded
  function drawProceduralBackground() {
    // Elegant deep gradient backdrop
    const grad = ctx.createLinearGradient(0, 0, 1280, 720);
    if (activePreset === 'gaming') {
      grad.addColorStop(0, '#0a0a23');
      grad.addColorStop(0.5, '#1e0826');
      grad.addColorStop(1, '#050d1a');
    } else if (activePreset === 'podcast') {
      grad.addColorStop(0, '#2d1b16');
      grad.addColorStop(0.5, '#1a1423');
      grad.addColorStop(1, '#0f172a');
    } else if (activePreset === 'tech') {
      grad.addColorStop(0, '#021e38');
      grad.addColorStop(0.5, '#062d3a');
      grad.addColorStop(1, '#030712');
    } else {
      // Vlog
      grad.addColorStop(0, '#3b122d');
      grad.addColorStop(0.5, '#2e1065');
      grad.addColorStop(1, '#1c1917');
    }
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 1280, 720);

    // Decorative geometric neon glow circles
    ctx.save();
    ctx.globalAlpha = 0.35;
    const circleGrad1 = ctx.createRadialGradient(280, 240, 10, 280, 240, 360);
    circleGrad1.addColorStop(0, colorTitle.value);
    circleGrad1.addColorStop(1, 'transparent');
    ctx.fillStyle = circleGrad1;
    ctx.beginPath();
    ctx.arc(280, 240, 360, 0, Math.PI * 2);
    ctx.fill();

    const circleGrad2 = ctx.createRadialGradient(1000, 480, 10, 1000, 480, 400);
    circleGrad2.addColorStop(0, colorBadgeBg.value);
    circleGrad2.addColorStop(1, 'transparent');
    ctx.fillStyle = circleGrad2;
    ctx.beginPath();
    ctx.arc(1000, 480, 400, 0, Math.PI * 2);
    ctx.fill();

    // Studio grid lines
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
    ctx.lineWidth = 1;
    for (let x = 0; x < 1280; x += 80) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, 720);
      ctx.stroke();
    }
    for (let y = 0; y < 720; y += 80) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(1280, y);
      ctx.stroke();
    }
    ctx.restore();
  }

  // Main Render Function
  function renderCanvas() {
    ctx.clearRect(0, 0, 1280, 720);

    // 1. Draw Background (Video or Procedural)
    ctx.save();
    const brightnessVal = filterBrightness.value;
    const contrastVal = filterContrast.value;
    ctx.filter = `brightness(${brightnessVal}%) contrast(${contrastVal}%)`;

    if (isVideoLoaded && hiddenVideo.readyState >= 2 && hiddenVideo.videoWidth > 0) {
      const vw = hiddenVideo.videoWidth;
      const vh = hiddenVideo.videoHeight;
      const targetAspect = 1280 / 720;
      const videoAspect = vw / vh;
      let sx = 0, sy = 0, sWidth = vw, sHeight = vh;

      if (videoAspect > targetAspect) {
        // Video is wider: crop sides
        sWidth = vh * targetAspect;
        sx = (vw - sWidth) / 2;
      } else {
        // Video is taller: crop top/bottom
        sHeight = vw / targetAspect;
        sy = (vh - sHeight) / 2;
      }
      ctx.drawImage(hiddenVideo, sx, sy, sWidth, sHeight, 0, 0, 1280, 720);
    } else {
      drawProceduralBackground();
    }
    ctx.restore();

    // 2. Dark Bottom Fade Gradient
    if (enableDarkGrad.checked) {
      ctx.save();
      const bottomGrad = ctx.createLinearGradient(0, 720 * 0.35, 0, 720);
      bottomGrad.addColorStop(0, 'rgba(0, 0, 0, 0)');
      bottomGrad.addColorStop(0.5, 'rgba(0, 0, 0, 0.45)');
      bottomGrad.addColorStop(1, 'rgba(0, 0, 0, 0.9)');
      ctx.fillStyle = bottomGrad;
      ctx.fillRect(0, 0, 1280, 720);
      ctx.restore();
    }

    // 3. Cinema Vignette
    if (enableVignette.checked) {
      ctx.save();
      const vignette = ctx.createRadialGradient(640, 360, 280, 640, 360, 800);
      vignette.addColorStop(0, 'rgba(0, 0, 0, 0)');
      vignette.addColorStop(0.65, 'rgba(0, 0, 0, 0.35)');
      vignette.addColorStop(1, 'rgba(0, 0, 0, 0.75)');
      ctx.fillStyle = vignette;
      ctx.fillRect(0, 0, 1280, 720);
      ctx.restore();
    }

    // 4. Attention Badge
    if (enableBadge.checked && inputBadge.value.trim() !== '') {
      ctx.save();
      const bText = inputBadge.value.trim().toUpperCase();
      const bFontSize = 26;
      ctx.font = `900 ${bFontSize}px 'Montserrat', 'Inter', sans-serif`;
      const bMetrics = ctx.measureText(bText);
      const bPadX = 22;
      const bPadY = 12;
      const bWidth = bMetrics.width + bPadX * 2;
      const bHeight = bFontSize + bPadY * 2;
      let bx = 60;
      let by = 50;

      const pos = badgePosition.value;
      if (pos === 'top-right') {
        bx = 1280 - 60 - bWidth;
        by = 50;
      } else if (pos === 'bottom-left') {
        bx = 60;
        by = 720 - 50 - bHeight;
      } else if (pos === 'bottom-right') {
        bx = 1280 - 60 - bWidth;
        by = 720 - 50 - bHeight;
      }

      // Badge drop shadow
      ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
      ctx.shadowBlur = 14;
      ctx.shadowOffsetX = 0;
      ctx.shadowOffsetY = 6;

      // Badge pill background
      ctx.fillStyle = colorBadgeBg.value;
      drawRoundedRect(ctx, bx, by, bWidth, bHeight, 10);
      ctx.fill();

      // Badge border stroke
      ctx.shadowColor = 'transparent';
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.35)';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Badge text
      ctx.fillStyle = colorBadgeText.value;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(bText, bx + bWidth / 2, by + bHeight / 2 + 1);
      ctx.restore();
    }

    // 5. Main Title & Subtitle
    const titleText = inputTitle.value.trim();
    const hasSubtitle = enableSubtitle.checked && inputSubtitle.value.trim() !== '';
    const subText = hasSubtitle ? inputSubtitle.value.trim() : '';

    if (titleText) {
      ctx.save();
      const tFontSize = parseInt(sizeTitle.value, 10) || 80;
      const sFontSize = parseInt(sizeSubtitle.value, 10) || 36;
      const fontFam = fontTitle.value;
      
      const titleFontString = `900 ${tFontSize}px "${fontFam}", 'Inter', Impact, sans-serif`;
      const subFontString = `700 ${sFontSize}px "${fontFam}", 'Montserrat', 'Inter', sans-serif`;

      // Calculate Y anchor
      const yPercent = parseInt(posTitle.value, 10) / 100;
      const anchorY = 720 * yPercent;

      // Text measuring
      ctx.font = titleFontString;
      const titleMetrics = ctx.measureText(titleText);
      let subMetrics = { width: 0 };
      if (hasSubtitle) {
        ctx.font = subFontString;
        subMetrics = ctx.measureText(subText);
      }

      const maxTextWidth = Math.max(titleMetrics.width, subMetrics.width);
      const titleCenterX = 1280 / 2;

      // Draw Backdrop Pill Box behind text
      if (enablePill.checked) {
        ctx.save();
        const pillAlpha = parseInt(pillOpacity.value, 10) / 100;
        const pillBgColor = hexToRgba(colorPill.value, pillAlpha);
        const pPadX = 36;
        const pPadY = 24;
        const totalHeight = tFontSize + (hasSubtitle ? sFontSize + 24 : 0) + pPadY * 2;
        const pillW = Math.min(1200, maxTextWidth + pPadX * 2);
        const pillX = titleCenterX - pillW / 2;
        const pillY = anchorY - tFontSize * 0.85 - pPadY;

        ctx.fillStyle = pillBgColor;
        drawRoundedRect(ctx, pillX, pillY, pillW, totalHeight, 18);
        ctx.fill();

        ctx.strokeStyle = 'rgba(255, 255, 255, 0.12)';
        ctx.lineWidth = 1.5;
        ctx.stroke();
        ctx.restore();
      }

      // Configure Shadows
      if (enableShadow.checked) {
        const sBlur = parseInt(shadowBlur.value, 10);
        ctx.shadowColor = colorShadow.value;
        ctx.shadowBlur = sBlur;
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = 6;
      } else {
        ctx.shadowColor = 'transparent';
      }

      // Title Outline / Stroke
      ctx.font = titleFontString;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'alphabetic';

      if (enableOutline.checked) {
        const strokeW = parseInt(strokeWidth.value, 10);
        ctx.strokeStyle = colorOutline.value;
        ctx.lineWidth = strokeW * 2;
        ctx.lineJoin = 'round';
        ctx.miterLimit = 2;
        ctx.strokeText(titleText, titleCenterX, anchorY);
      }

      // Title Fill
      ctx.fillStyle = colorTitle.value;
      ctx.fillText(titleText, titleCenterX, anchorY);

      // Draw Subtitle if present
      if (hasSubtitle) {
        const subY = anchorY + sFontSize * 1.25 + 10;
        ctx.font = subFontString;

        if (enableOutline.checked) {
          const subStrokeW = Math.max(2, Math.round(parseInt(strokeWidth.value, 10) * 0.65));
          ctx.strokeStyle = colorOutline.value;
          ctx.lineWidth = subStrokeW * 2;
          ctx.lineJoin = 'round';
          ctx.strokeText(subText, titleCenterX, subY);
        }

        ctx.fillStyle = colorSubtitle.value;
        ctx.fillText(subText, titleCenterX, subY);
      }

      ctx.restore();
    }
  }

  // Load and decode video file
  function loadVideoFile(file) {
    if (!file) return;
    if (currentVideoUrl) {
      URL.revokeObjectURL(currentVideoUrl);
    }
    currentFile = file;
    currentVideoUrl = URL.createObjectURL(file);
    hiddenVideo.src = currentVideoUrl;
    hiddenVideo.load();

    metaFilename.textContent = file.name;
    metaBadge.style.display = 'block';

    hiddenVideo.onloadedmetadata = () => {
      isVideoLoaded = true;
      videoDuration = hiddenVideo.duration;
      scrubber.disabled = false;
      scrubber.min = 0;
      scrubber.max = videoDuration.toString();
      scrubber.value = '0';
      timeDisplay.textContent = `00:00.00 / ${formatTime(videoDuration)}`;
      metaRes.textContent = `${hiddenVideo.videoWidth} × ${hiddenVideo.videoHeight}`;

      // Enable scrubber buttons
      [stepBack5, stepBack1, stepBackFrame, playPauseBtn, stepFwdFrame, stepFwd1, stepFwd5].forEach(btn => {
        btn.disabled = false;
      });

      // Seek to 10% of video or 1 second to grab a good starting frame
      const initialSeek = Math.min(videoDuration * 0.15, 2.0);
      hiddenVideo.currentTime = initialSeek;
      scrubber.value = initialSeek.toString();
    };

    hiddenVideo.onseeked = () => {
      timeDisplay.textContent = `${formatTime(hiddenVideo.currentTime)} / ${formatTime(videoDuration)}`;
      requestRender();
    };

    hiddenVideo.onerror = () => {
      alert('Unable to load video format in this browser. Please try an MP4 or WebM video file.');
    };
  }

  // Scrubber events
  scrubber.addEventListener('input', () => {
    if (!isVideoLoaded) return;
    hiddenVideo.currentTime = parseFloat(scrubber.value);
  });

  // Play / Pause loop
  function togglePlay() {
    if (!isVideoLoaded) return;
    if (isPlaying) {
      hiddenVideo.pause();
      isPlaying = false;
      playPauseIcon.innerHTML = '&#9658;';
      playPauseBtn.childNodes[2].nodeValue = ' Play';
    } else {
      hiddenVideo.play();
      isPlaying = true;
      playPauseIcon.innerHTML = '&#10074;&#10074;';
      playPauseBtn.childNodes[2].nodeValue = ' Pause';
      trackPlayback();
    }
  }

  function trackPlayback() {
    if (!isPlaying) return;
    scrubber.value = hiddenVideo.currentTime.toString();
    timeDisplay.textContent = `${formatTime(hiddenVideo.currentTime)} / ${formatTime(videoDuration)}`;
    requestRender();
    if (!hiddenVideo.paused && !hiddenVideo.ended) {
      requestAnimationFrame(trackPlayback);
    } else {
      isPlaying = false;
      playPauseIcon.innerHTML = '&#9658;';
      playPauseBtn.childNodes[2].nodeValue = ' Play';
    }
  }

  playPauseBtn.addEventListener('click', togglePlay);

  function stepTime(delta) {
    if (!isVideoLoaded) return;
    if (isPlaying) {
      hiddenVideo.pause();
      isPlaying = false;
      playPauseIcon.innerHTML = '&#9658;';
      playPauseBtn.childNodes[2].nodeValue = ' Play';
    }
    const newTime = Math.max(0, Math.min(videoDuration, hiddenVideo.currentTime + delta));
    hiddenVideo.currentTime = newTime;
    scrubber.value = newTime.toString();
  }

  stepBack5.addEventListener('click', () => stepTime(-5));
  stepBack1.addEventListener('click', () => stepTime(-1));
  stepBackFrame.addEventListener('click', () => stepTime(-0.04));
  stepFwdFrame.addEventListener('click', () => stepTime(0.04));
  stepFwd1.addEventListener('click', () => stepTime(1));
  stepFwd5.addEventListener('click', () => stepTime(5));

  // File drag & drop handling
  dropZone.addEventListener('dragover', (e) => {
    e.preventDefault();
    dropZone.classList.add('dragover');
  });

  dropZone.addEventListener('dragleave', () => {
    dropZone.classList.remove('dragover');
  });

  dropZone.addEventListener('drop', (e) => {
    e.preventDefault();
    dropZone.classList.remove('dragover');
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      if (file.type.startsWith('video/') || /\.(mp4|webm|mov|ogg|mkv)$/i.test(file.name)) {
        loadVideoFile(file);
      } else {
        alert('Please drop a valid video file (MP4, WebM, MOV, etc.).');
      }
    }
  });

  fileInput.addEventListener('change', (e) => {
    if (e.target.files && e.target.files.length > 0) {
      loadVideoFile(e.target.files[0]);
    }
  });

  loadSampleBtn.addEventListener('click', () => {
    isVideoLoaded = false;
    metaBadge.style.display = 'none';
    requestRender();
  });

  // Presets Configuration
  const presets = {
    gaming: {
      title: 'EPIC BOSS BATTLE',
      font: 'Anton',
      colorTitle: '#FFE600',
      sizeTitle: 96,
      posY: 56,
      enableSub: true,
      subText: 'CANNOT BE DEFEATED (UNREAL ENDING)',
      colorSub: '#FFFFFF',
      sizeSub: 38,
      enableBadge: true,
      badgeText: 'LEVEL 100!',
      badgePos: 'top-right',
      badgeBg: '#FF0055',
      badgeTextCol: '#FFFFFF',
      stroke: true,
      strokeColor: '#000000',
      strokeW: 12,
      shadow: true,
      shadowCol: '#000000',
      shadowB: 20,
      pill: true,
      pillColor: '#000000',
      pillOp: 60,
      darkGrad: true,
      vignette: true,
      brightness: 105,
      contrast: 125
    },
    podcast: {
      title: 'THE UNTOLD STORY',
      font: 'Instrument Serif',
      colorTitle: '#FFDF99',
      sizeTitle: 92,
      posY: 58,
      enableSub: true,
      subText: 'EPISODE #42 • THE TRUTH ABOUT AI',
      colorSub: '#E2E8F0',
      sizeSub: 34,
      enableBadge: true,
      badgeText: 'EXCLUSIVE',
      badgePos: 'top-left',
      badgeBg: '#C2410C',
      badgeTextCol: '#FFFFFF',
      stroke: true,
      strokeColor: '#18181B',
      strokeW: 5,
      shadow: true,
      shadowCol: '#000000',
      shadowB: 15,
      pill: true,
      pillColor: '#111827',
      pillOp: 75,
      darkGrad: true,
      vignette: true,
      brightness: 95,
      contrast: 110
    },
    tech: {
      title: 'NEXT-GEN TEST',
      font: 'Montserrat',
      colorTitle: '#38BDF8',
      sizeTitle: 90,
      posY: 56,
      enableSub: true,
      subText: 'M3 ULTRA BENCHMARKS & SPEED TEST',
      colorSub: '#FFFFFF',
      sizeSub: 34,
      enableBadge: true,
      badgeText: '4K HDR',
      badgePos: 'top-right',
      badgeBg: '#2563EB',
      badgeTextCol: '#FFFFFF',
      stroke: true,
      strokeColor: '#020617',
      strokeW: 8,
      shadow: true,
      shadowCol: '#0284C7',
      shadowB: 18,
      pill: true,
      pillColor: '#0F172A',
      pillOp: 70,
      darkGrad: true,
      vignette: true,
      brightness: 100,
      contrast: 115
    },
    vlog: {
      title: '48 HOURS IN TOKYO',
      font: 'Bebas Neue',
      colorTitle: '#FDE047',
      sizeTitle: 104,
      posY: 55,
      enableSub: true,
      subText: 'WE GOT COMPLETELY LOST IN SHIBUYA!',
      colorSub: '#FFFFFF',
      sizeSub: 40,
      enableBadge: true,
      badgeText: 'NEW VLOG',
      badgePos: 'top-right',
      badgeBg: '#F43F5E',
      badgeTextCol: '#FFFFFF',
      stroke: true,
      strokeColor: '#000000',
      strokeW: 10,
      shadow: true,
      shadowCol: '#000000',
      shadowB: 12,
      pill: true,
      pillColor: '#18181B',
      pillOp: 65,
      darkGrad: true,
      vignette: true,
      brightness: 105,
      contrast: 110
    }
  };

  function applyPreset(presetKey) {
    const p = presets[presetKey];
    if (!p) return;
    activePreset = presetKey;

    presetBtns.forEach(btn => {
      if (btn.getAttribute('data-preset') === presetKey) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    });

    inputTitle.value = p.title;
    fontTitle.value = p.font;
    colorTitle.value = p.colorTitle;
    colorTitleHex.textContent = p.colorTitle;
    sizeTitle.value = p.sizeTitle;
    valSizeTitle.textContent = `${p.sizeTitle}px`;
    posTitle.value = p.posY;
    valPosTitle.textContent = `${p.posY}%`;

    enableSubtitle.checked = p.enableSub;
    inputSubtitle.value = p.subText;
    colorSubtitle.value = p.colorSub;
    colorSubtitleHex.textContent = p.colorSub;
    sizeSubtitle.value = p.sizeSub;
    valSizeSub.textContent = `${p.sizeSub}px`;
    subtitleControlsBody.style.display = p.enableSub ? 'flex' : 'none';

    enableBadge.checked = p.enableBadge;
    inputBadge.value = p.badgeText;
    badgePosition.value = p.badgePos;
    colorBadgeBg.value = p.badgeBg;
    colorBadgeBgHex.textContent = p.badgeBg;
    colorBadgeText.value = p.badgeTextCol;
    colorBadgeTextHex.textContent = p.badgeTextCol;
    badgeControlsBody.style.display = p.enableBadge ? 'flex' : 'none';

    enableOutline.checked = p.stroke;
    colorOutline.value = p.strokeColor;
    colorOutlineHex.textContent = p.strokeColor;
    strokeWidth.value = p.strokeW;
    valStroke.textContent = `${p.strokeW}px`;
    outlineSliderWrap.style.display = p.stroke ? 'flex' : 'none';

    enableShadow.checked = p.shadow;
    colorShadow.value = p.shadowCol;
    colorShadowHex.textContent = p.shadowCol;
    shadowBlur.value = p.shadowB;
    valShadow.textContent = `${p.shadowB}px`;
    shadowSliderWrap.style.display = p.shadow ? 'flex' : 'none';

    enablePill.checked = p.pill;
    colorPill.value = p.pillColor;
    colorPillHex.textContent = p.pillColor;
    pillOpacity.value = p.pillOp;
    valPillOpacity.textContent = `${p.pillOp}%`;
    pillSliderWrap.style.display = p.pill ? 'flex' : 'none';

    enableDarkGrad.checked = p.darkGrad;
    enableVignette.checked = p.vignette;
    filterBrightness.value = p.brightness;
    valBrightness.textContent = `${p.brightness}%`;
    filterContrast.value = p.contrast;
    valContrast.textContent = `${p.contrast}%`;

    requestRender();
  }

  presetBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const key = btn.getAttribute('data-preset');
      applyPreset(key);
    });
  });

  // UI Event Bindings
  function syncColorInput(input, label) {
    input.addEventListener('input', () => {
      label.textContent = input.value.toUpperCase();
      requestRender();
    });
  }

  syncColorInput(colorTitle, colorTitleHex);
  syncColorInput(colorSubtitle, colorSubtitleHex);
  syncColorInput(colorBadgeBg, colorBadgeBgHex);
  syncColorInput(colorBadgeText, colorBadgeTextHex);
  syncColorInput(colorOutline, colorOutlineHex);
  syncColorInput(colorShadow, colorShadowHex);
  syncColorInput(colorPill, colorPillHex);

  inputTitle.addEventListener('input', requestRender);
  fontTitle.addEventListener('change', requestRender);
  sizeTitle.addEventListener('input', () => {
    valSizeTitle.textContent = `${sizeTitle.value}px`;
    requestRender();
  });
  posTitle.addEventListener('input', () => {
    valPosTitle.textContent = `${posTitle.value}%`;
    requestRender();
  });

  enableSubtitle.addEventListener('change', () => {
    subtitleControlsBody.style.display = enableSubtitle.checked ? 'flex' : 'none';
    requestRender();
  });
  inputSubtitle.addEventListener('input', requestRender);
  sizeSubtitle.addEventListener('input', () => {
    valSizeSub.textContent = `${sizeSubtitle.value}px`;
    requestRender();
  });

  enableBadge.addEventListener('change', () => {
    badgeControlsBody.style.display = enableBadge.checked ? 'flex' : 'none';
    requestRender();
  });
  inputBadge.addEventListener('input', requestRender);
  badgePosition.addEventListener('change', requestRender);

  enableOutline.addEventListener('change', () => {
    outlineSliderWrap.style.display = enableOutline.checked ? 'flex' : 'none';
    requestRender();
  });
  strokeWidth.addEventListener('input', () => {
    valStroke.textContent = `${strokeWidth.value}px`;
    requestRender();
  });

  enableShadow.addEventListener('change', () => {
    shadowSliderWrap.style.display = enableShadow.checked ? 'flex' : 'none';
    requestRender();
  });
  shadowBlur.addEventListener('input', () => {
    valShadow.textContent = `${shadowBlur.value}px`;
    requestRender();
  });

  enablePill.addEventListener('change', () => {
    pillSliderWrap.style.display = enablePill.checked ? 'flex' : 'none';
    requestRender();
  });
  pillOpacity.addEventListener('input', () => {
    valPillOpacity.textContent = `${pillOpacity.value}%`;
    requestRender();
  });

  enableDarkGrad.addEventListener('change', requestRender);
  enableVignette.addEventListener('change', requestRender);
  filterBrightness.addEventListener('input', () => {
    valBrightness.textContent = `${filterBrightness.value}%`;
    requestRender();
  });
  filterContrast.addEventListener('input', () => {
    valContrast.textContent = `${filterContrast.value}%`;
    requestRender();
  });

  // Export handlers
  function showStatus(msg, isSuccess = true) {
    exportStatus.textContent = msg;
    exportStatus.style.color = isSuccess ? 'var(--accent)' : 'var(--error)';
    exportStatus.style.display = 'block';
    setTimeout(() => {
      exportStatus.style.display = 'none';
    }, 3500);
  }

  function downloadCanvas(mimeType, extension) {
    canvas.toBlob((blob) => {
      if (!blob) {
        showStatus('Failed to generate image file.', false);
        return;
      }
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      const timestamp = new Date().toISOString().slice(0, 10);
      link.download = `youtube-thumbnail-${timestamp}.${extension}`;
      link.href = url;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      showStatus(`Thumbnail downloaded as ${extension.toUpperCase()}!`);
    }, mimeType, 0.95);
  }

  btnDownloadPng.addEventListener('click', () => downloadCanvas('image/png', 'png'));
  btnDownloadJpg.addEventListener('click', () => downloadCanvas('image/jpeg', 'jpg'));

  btnCopyClipboard.addEventListener('click', async () => {
    try {
      canvas.toBlob(async (blob) => {
        if (!blob) {
          showStatus('Could not copy image to clipboard.', false);
          return;
        }
        if (navigator.clipboard && window.ClipboardItem) {
          await navigator.clipboard.write([
            new ClipboardItem({ 'image/png': blob })
          ]);
          showStatus('Thumbnail image copied to clipboard!');
        } else {
          showStatus('Clipboard API not supported in this browser.', false);
        }
      }, 'image/png');
    } catch (err) {
      showStatus('Clipboard access denied.', false);
    }
  });

  btnReset.addEventListener('click', () => {
    applyPreset('gaming');
    showStatus('Settings reset to defaults.');
  });

  // Ensure custom web fonts are loaded, then render
  if (document.fonts) {
    document.fonts.ready.then(() => {
      requestRender();
    });
  }

  // Initial render
  requestRender();
});