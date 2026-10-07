// Video Slides - Multimedia Presentation Slide Designer
// Complete client-side interactive logic

document.addEventListener('DOMContentLoaded', () => {
  // DOM Elements
  const slidePreviewFrame = document.getElementById('slide-preview-frame');
  const slideVideo = document.getElementById('slide-video-element');
  const deviceMockupWrapper = document.getElementById('device-mockup-wrapper');
  const backdropDimEl = document.getElementById('backdrop-dim-el');
  const currentFrameBadge = document.getElementById('current-frame-badge');

  // Video source controls
  const videoDropzone = document.getElementById('video-dropzone');
  const videoFileInput = document.getElementById('video-file-input');
  const videoBrowseBtn = document.getElementById('video-browse-btn');
  const demoTechBtn = document.getElementById('demo-tech-btn');
  const demoOrbitBtn = document.getElementById('demo-orbit-btn');
  const demoWavesBtn = document.getElementById('demo-waves-btn');

  // Frame chips & layout chips
  const frameChips = document.querySelectorAll('.frame-pill-group .mode-chip');
  const layoutChips = document.querySelectorAll('.layout-pill-group .mode-chip');

  // Text inputs
  const inputBadge = document.getElementById('input-badge');
  const inputTitle = document.getElementById('input-title');
  const inputSubtitle = document.getElementById('input-subtitle');
  const inputBullets = document.getElementById('input-bullets');

  // Slide display elements
  const viewBadge = document.getElementById('view-badge');
  const viewTitle = document.getElementById('view-title');
  const viewSubtitle = document.getElementById('view-subtitle');
  const viewBullets = document.getElementById('view-bullets');

  // Playback controls
  const ctrlAutoplay = document.getElementById('ctrl-autoplay');
  const ctrlLoop = document.getElementById('ctrl-loop');
  const ctrlMuted = document.getElementById('ctrl-muted');
  const playPauseBtn = document.getElementById('play-pause-btn');
  const playPauseText = document.getElementById('play-pause-text');
  const restartVideoBtn = document.getElementById('restart-video-btn');

  // Export & Present
  const exportHtmlBtn = document.getElementById('export-html-btn');
  const exportSnapshotBtn = document.getElementById('export-snapshot-btn');
  const presentFullscreenBtn = document.getElementById('present-fullscreen-btn');
  const fullscreenOverlay = document.getElementById('fullscreen-overlay');
  const fullscreenSlot = document.getElementById('fullscreen-slide-slot');
  const exitFullscreenBtn = document.getElementById('exit-fullscreen-btn');

  // Toast
  const appToast = document.getElementById('app-toast');
  const toastText = document.getElementById('toast-text');
  let toastTimer = null;

  // Active state
  let currentFrame = 'glassmorphic';
  let currentLayout = 'layout-split-left';
  let activeAnimationId = null;
  let activeStreamCanvas = null;

  function showToast(msg) {
    if (toastTimer) clearTimeout(toastTimer);
    toastText.textContent = msg;
    appToast.classList.add('show');
    toastTimer = setTimeout(() => {
      appToast.classList.remove('show');
    }, 2800);
  }

  // --- Dynamic Procedural Video Generators ---
  function stopActiveDemoLoop() {
    if (activeAnimationId) {
      cancelAnimationFrame(activeAnimationId);
      activeAnimationId = null;
    }
  }

  function startDemoStream(type) {
    stopActiveDemoLoop();
    slideVideo.src = '';

    const streamCanvas = document.createElement('canvas');
    streamCanvas.width = 640;
    streamCanvas.height = 360;
    const sctx = streamCanvas.getContext('2d');
    activeStreamCanvas = streamCanvas;

    let tick = 0;

    if (type === 'neural') {
      // Neural network demo
      const nodes = Array.from({ length: 24 }, () => ({
        x: Math.random() * 640,
        y: Math.random() * 360,
        vx: (Math.random() - 0.5) * 1.5,
        vy: (Math.random() - 0.5) * 1.5,
        radius: 3 + Math.random() * 3
      }));

      function drawNeural() {
        tick++;
        sctx.fillStyle = '#060814';
        sctx.fillRect(0, 0, 640, 360);

        // Draw connections
        for (let i = 0; i < nodes.length; i++) {
          for (let j = i + 1; j < nodes.length; j++) {
            const dx = nodes[i].x - nodes[j].x;
            const dy = nodes[i].y - nodes[j].y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < 120) {
              sctx.strokeStyle = `rgba(78, 133, 191, ${(1 - dist / 120) * 0.6})`;
              sctx.lineWidth = 1.2;
              sctx.beginPath();
              sctx.moveTo(nodes[i].x, nodes[i].y);
              sctx.lineTo(nodes[j].x, nodes[j].y);
              sctx.stroke();
            }
          }
        }

        // Draw nodes
        nodes.forEach((n) => {
          n.x += n.vx;
          n.y += n.vy;
          if (n.x < 0 || n.x > 640) n.vx *= -1;
          if (n.y < 0 || n.y > 360) n.vy *= -1;

          sctx.fillStyle = '#89aacc';
          sctx.beginPath();
          sctx.arc(n.x, n.y, n.radius, 0, Math.PI * 2);
          sctx.fill();
        });

        // Glowing center core
        const glow = sctx.createRadialGradient(320, 180, 10, 320, 180, 180);
        glow.addColorStop(0, 'rgba(78, 133, 191, 0.25)');
        glow.addColorStop(1, 'rgba(0, 0, 0, 0)');
        sctx.fillStyle = glow;
        sctx.fillRect(0, 0, 640, 360);

        activeAnimationId = requestAnimationFrame(drawNeural);
      }
      drawNeural();

    } else if (type === 'orbit') {
      // 3D Orbital sphere
      function drawOrbit() {
        tick += 0.02;
        sctx.fillStyle = '#090812';
        sctx.fillRect(0, 0, 640, 360);

        const cx = 320;
        const cy = 180;
        const radius = 90;

        // Draw orbital rings
        for (let r = 0; r < 4; r++) {
          const angleOffset = (r * Math.PI) / 4 + tick * (r % 2 === 0 ? 1 : -1);
          sctx.save();
          sctx.translate(cx, cy);
          sctx.rotate(angleOffset);
          sctx.scale(1, 0.4);
          sctx.strokeStyle = r % 2 === 0 ? 'rgba(124, 58, 237, 0.7)' : 'rgba(6, 182, 212, 0.7)';
          sctx.lineWidth = 2.5;
          sctx.beginPath();
          sctx.arc(0, 0, radius + r * 20, 0, Math.PI * 2);
          sctx.stroke();

          // Satellite dot
          const satAngle = tick * 2 + r;
          const sx = Math.cos(satAngle) * (radius + r * 20);
          const sy = Math.sin(satAngle) * (radius + r * 20);
          sctx.fillStyle = '#ffffff';
          sctx.beginPath();
          sctx.arc(sx, sy, 5, 0, Math.PI * 2);
          sctx.fill();

          sctx.restore();
        }

        // Center orb
        const grad = sctx.createRadialGradient(cx, cy, 5, cx, cy, radius * 0.7);
        grad.addColorStop(0, '#c084fc');
        grad.addColorStop(1, '#1e1b4b');
        sctx.fillStyle = grad;
        sctx.beginPath();
        sctx.arc(cx, cy, radius * 0.5, 0, Math.PI * 2);
        sctx.fill();

        activeAnimationId = requestAnimationFrame(drawOrbit);
      }
      drawOrbit();

    } else {
      // Cyber matrix code rain
      const columns = Math.floor(640 / 18);
      const drops = Array.from({ length: columns }, () => Math.random() * -50);

      function drawMatrix() {
        sctx.fillStyle = 'rgba(5, 7, 15, 0.15)';
        sctx.fillRect(0, 0, 640, 360);

        sctx.fillStyle = '#06b6d4';
        sctx.font = '14px monospace';

        for (let i = 0; i < drops.length; i++) {
          const char = String.fromCharCode(0x30a0 + Math.floor(Math.random() * 96));
          const x = i * 18;
          const y = drops[i] * 18;

          sctx.fillText(char, x, y);

          if (y > 360 && Math.random() > 0.975) {
            drops[i] = 0;
          }
          drops[i]++;
        }

        activeAnimationId = requestAnimationFrame(drawMatrix);
      }
      drawMatrix();
    }

    // Attach stream to video element
    if (streamCanvas.captureStream) {
      try {
        const stream = streamCanvas.captureStream(30);
        slideVideo.srcObject = stream;
        slideVideo.play().catch(() => {});
      } catch {
        // Fallback for environments where captureStream isn't supported
        slideVideo.srcObject = null;
      }
    }
  }

  // --- Frame Mockup Switcher ---
  function applyFrameStyle(frameName) {
    currentFrame = frameName;
    currentFrameBadge.textContent = `Frame: ${frameName.charAt(0).toUpperCase() + frameName.slice(1)}`;

    // Clear outer wrapper content and reconstruct frame
    deviceMockupWrapper.className = '';
    deviceMockupWrapper.innerHTML = '';

    if (frameName === 'glassmorphic') {
      deviceMockupWrapper.className = 'frame-glassmorphic';
      deviceMockupWrapper.appendChild(slideVideo);
    } else if (frameName === 'laptop') {
      deviceMockupWrapper.className = 'frame-laptop';
      const screen = document.createElement('div');
      screen.className = 'laptop-screen';
      const notch = document.createElement('div');
      notch.className = 'laptop-notch';
      screen.appendChild(notch);
      screen.appendChild(slideVideo);

      const base = document.createElement('div');
      base.className = 'laptop-base';
      const cutout = document.createElement('div');
      cutout.className = 'laptop-notch-cutout';
      base.appendChild(cutout);

      deviceMockupWrapper.appendChild(screen);
      deviceMockupWrapper.appendChild(base);
    } else if (frameName === 'phone') {
      deviceMockupWrapper.className = 'frame-phone';
      const island = document.createElement('div');
      island.className = 'phone-island';
      deviceMockupWrapper.appendChild(island);
      deviceMockupWrapper.appendChild(slideVideo);
    } else if (frameName === 'browser') {
      deviceMockupWrapper.className = 'frame-browser';
      const header = document.createElement('div');
      header.className = 'browser-header-bar';
      header.innerHTML = `
        <span class="browser-dot" style="background:#ef4444;"></span>
        <span class="browser-dot" style="background:#f59e0b;"></span>
        <span class="browser-dot" style="background:#10b981;"></span>
        <span style="margin-left: 8px; font-size: 11px; color: #888; font-family: sans-serif;">demo.presentation.ai</span>
      `;
      deviceMockupWrapper.appendChild(header);
      deviceMockupWrapper.appendChild(slideVideo);
    } else {
      // Borderless
      deviceMockupWrapper.className = 'frame-borderless';
      deviceMockupWrapper.appendChild(slideVideo);
    }
  }

  frameChips.forEach((chip) => {
    chip.addEventListener('click', () => {
      frameChips.forEach((c) => c.classList.remove('active'));
      chip.classList.add('active');
      applyFrameStyle(chip.getAttribute('data-frame'));
      showToast(`Frame: ${chip.querySelector('span').textContent}`);
    });
  });

  // --- Layout Switcher ---
  function applyLayout(layoutClass) {
    currentLayout = layoutClass;
    slidePreviewFrame.className = `slide-viewport-16-9 ${layoutClass}`;
    if (layoutClass === 'layout-backdrop') {
      backdropDimEl.style.display = 'block';
    } else {
      backdropDimEl.style.display = 'none';
    }
  }

  layoutChips.forEach((chip) => {
    chip.addEventListener('click', () => {
      layoutChips.forEach((c) => c.classList.remove('active'));
      chip.classList.add('active');
      applyLayout(chip.getAttribute('data-layout'));
      showToast(`Layout updated`);
    });
  });

  // --- Slide Text & Bullet Points Synchronizer ---
  function updateSlideContent() {
    viewBadge.textContent = inputBadge.value.trim() || 'SLIDE OVERVIEW';
    viewTitle.textContent = inputTitle.value.trim() || 'Slide Headline';
    viewSubtitle.textContent = inputSubtitle.value.trim() || '';

    // Bullet points
    const lines = inputBullets.value.split('\n').filter((l) => l.trim().length > 0);
    viewBullets.innerHTML = '';
    lines.forEach((line) => {
      const li = document.createElement('li');
      li.className = 'slide-bullet-item';
      li.innerHTML = `
        <span class="slide-bullet-dot">&#10004;</span>
        <span>${escapeHtml(line.trim())}</span>
      `;
      viewBullets.appendChild(li);
    });
  }

  function escapeHtml(str) {
    return str.replace(/[&<>'"]/g, 
      tag => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[tag] || tag)
    );
  }

  inputBadge.addEventListener('input', updateSlideContent);
  inputTitle.addEventListener('input', updateSlideContent);
  inputSubtitle.addEventListener('input', updateSlideContent);
  inputBullets.addEventListener('input', updateSlideContent);

  // --- Video Controls ---
  ctrlAutoplay.addEventListener('change', () => {
    slideVideo.autoplay = ctrlAutoplay.checked;
  });
  ctrlLoop.addEventListener('change', () => {
    slideVideo.loop = ctrlLoop.checked;
  });
  ctrlMuted.addEventListener('change', () => {
    slideVideo.muted = ctrlMuted.checked;
  });

  playPauseBtn.addEventListener('click', () => {
    if (slideVideo.paused) {
      slideVideo.play();
      playPauseText.textContent = 'Pause Video';
      showToast('Video playing');
    } else {
      slideVideo.pause();
      playPauseText.textContent = 'Play Video';
      showToast('Video paused');
    }
  });

  restartVideoBtn.addEventListener('click', () => {
    slideVideo.currentTime = 0;
    slideVideo.play();
    playPauseText.textContent = 'Pause Video';
    showToast('Video restarted');
  });

  // --- File Upload / Drag & Drop ---
  videoBrowseBtn.addEventListener('click', () => videoFileInput.click());
  videoDropzone.addEventListener('click', (e) => {
    if (e.target !== videoBrowseBtn) videoFileInput.click();
  });

  videoDropzone.addEventListener('dragover', (e) => {
    e.preventDefault();
    videoDropzone.classList.add('dragover');
  });
  videoDropzone.addEventListener('dragleave', () => {
    videoDropzone.classList.remove('dragover');
  });
  videoDropzone.addEventListener('drop', (e) => {
    e.preventDefault();
    videoDropzone.classList.remove('dragover');
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleVideoFile(e.dataTransfer.files[0]);
    }
  });

  videoFileInput.addEventListener('change', (e) => {
    if (e.target.files && e.target.files[0]) {
      handleVideoFile(e.target.files[0]);
    }
  });

  function handleVideoFile(file) {
    if (!file.type.startsWith('video/')) {
      showToast('Please upload a valid video file (.mp4, .webm, .mov)');
      return;
    }
    stopActiveDemoLoop();
    slideVideo.srcObject = null;
    const url = URL.createObjectURL(file);
    slideVideo.src = url;
    slideVideo.play().catch(() => {});
    playPauseText.textContent = 'Pause Video';
    showToast(`Loaded ${file.name}`);
  }

  // Preset demo triggers
  demoTechBtn.addEventListener('click', () => {
    startDemoStream('neural');
    showToast('Loaded AI Neural Network demo clip');
  });
  demoOrbitBtn.addEventListener('click', () => {
    startDemoStream('orbit');
    showToast('Loaded Orbital Sphere demo clip');
  });
  demoWavesBtn.addEventListener('click', () => {
    startDemoStream('waves');
    showToast('Loaded Cyber Matrix demo clip');
  });

  // --- Fullscreen Presentation Mode ---
  presentFullscreenBtn.addEventListener('click', () => {
    fullscreenOverlay.classList.add('active');
    fullscreenSlot.innerHTML = '';
    const clone = slidePreviewFrame.cloneNode(true);
    // Connect video clone
    const clonedVid = clone.querySelector('video');
    if (slideVideo.srcObject) {
      clonedVid.srcObject = slideVideo.srcObject;
    } else {
      clonedVid.src = slideVideo.src;
    }
    clonedVid.currentTime = slideVideo.currentTime;
    clonedVid.play().catch(() => {});

    fullscreenSlot.appendChild(clone);
  });

  exitFullscreenBtn.addEventListener('click', closeFullscreen);
  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && fullscreenOverlay.classList.contains('active')) {
      closeFullscreen();
    }
  });

  function closeFullscreen() {
    fullscreenOverlay.classList.remove('active');
    fullscreenSlot.innerHTML = '';
  }

  // --- Snapshot PNG Capture ---
  exportSnapshotBtn.addEventListener('click', () => {
    const snapCanvas = document.createElement('canvas');
    snapCanvas.width = 1920;
    snapCanvas.height = 1080;
    const sctx = snapCanvas.getContext('2d');

    // Slide Background
    const bgGrad = sctx.createRadialGradient(1300, 300, 50, 960, 540, 1100);
    bgGrad.addColorStop(0, '#151928');
    bgGrad.addColorStop(1, '#07090e');
    sctx.fillStyle = bgGrad;
    sctx.fillRect(0, 0, 1920, 1080);

    // If Backdrop layout: draw video across whole slide
    if (currentLayout === 'layout-backdrop') {
      try {
        if (activeStreamCanvas) {
          sctx.drawImage(activeStreamCanvas, 0, 0, 1920, 1080);
        } else if (slideVideo.videoWidth > 0) {
          sctx.drawImage(slideVideo, 0, 0, 1920, 1080);
        }
      } catch {}

      // Dark scrim
      sctx.fillStyle = 'rgba(0, 0, 0, 0.65)';
      sctx.fillRect(0, 0, 1920, 1080);

      // Glass card on bottom
      sctx.fillStyle = 'rgba(15, 20, 30, 0.85)';
      sctx.fillRect(100, 550, 1000, 430);
    }

    // Typography
    const textX = currentLayout === 'layout-split-right' ? 1050 : 120;
    const textY = 220;

    // Category Pill
    sctx.fillStyle = 'rgba(78, 133, 191, 0.25)';
    sctx.fillRect(textX, textY - 60, 200, 38);
    sctx.fillStyle = '#89aacc';
    sctx.font = '700 18px Inter, sans-serif';
    sctx.fillText(inputBadge.value.toUpperCase(), textX + 16, textY - 34);

    // Headline
    sctx.fillStyle = '#ffffff';
    sctx.font = '800 52px Inter, sans-serif';
    sctx.fillText(inputTitle.value, textX, textY + 20);

    // Subtitle
    sctx.fillStyle = 'rgba(255, 255, 255, 0.75)';
    sctx.font = '400 24px Inter, sans-serif';
    sctx.fillText(inputSubtitle.value.slice(0, 70), textX, textY + 70);

    // Bullets
    const bullets = inputBullets.value.split('\n').filter((l) => l.trim().length > 0);
    let by = textY + 140;
    bullets.forEach((b) => {
      sctx.fillStyle = '#4e85bf';
      sctx.font = '700 24px Inter, sans-serif';
      sctx.fillText('\u2714', textX, by);

      sctx.fillStyle = '#ffffff';
      sctx.font = '500 24px Inter, sans-serif';
      sctx.fillText(b.trim(), textX + 36, by);
      by += 50;
    });

    // Draw video frame if not full backdrop
    if (currentLayout !== 'layout-backdrop') {
      const vidX = currentLayout === 'layout-split-right' ? 120 : 1000;
      const vidY = 250;
      const vidW = 800;
      const vidH = 500;

      // Mockup border
      sctx.fillStyle = '#11131a';
      sctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
      sctx.lineWidth = 4;
      sctx.beginPath();
      sctx.roundRect(vidX, vidY, vidW, vidH, 16);
      sctx.fill();
      sctx.stroke();

      try {
        if (activeStreamCanvas) {
          sctx.drawImage(activeStreamCanvas, vidX + 8, vidY + 8, vidW - 16, vidH - 16);
        } else if (slideVideo.videoWidth > 0) {
          sctx.drawImage(slideVideo, vidX + 8, vidY + 8, vidW - 16, vidH - 16);
        }
      } catch {}
    }

    snapCanvas.toBlob((blob) => {
      if (!blob) return;
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `video-slide-snapshot.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      showToast('1920 \u00D7 1080 slide snapshot downloaded');
    }, 'image/png');
  });

  // --- Standalone HTML Slide Deck Export ---
  exportHtmlBtn.addEventListener('click', () => {
    const slideHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>${escapeHtml(inputTitle.value)} - Interactive Slide</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { background: #000; display: flex; align-items: center; justify-content: center; min-height: 100vh; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; }
    .slide-deck-frame { width: 100vw; height: 56.25vw; max-height: 100vh; max-width: 177.78vh; position: relative; background: radial-gradient(circle at 70% 30%, #151928 0%, #07090e 100%); color: #fff; display: flex; align-items: center; justify-content: space-between; padding: 5vw; overflow: hidden; }
    .slide-col-text { flex: 1; display: flex; flex-direction: column; gap: 1.5vw; z-index: 5; }
    .tag { align-self: flex-start; padding: 0.3vw 0.8vw; border-radius: 999px; background: rgba(78, 133, 191, 0.2); border: 1px solid rgba(78, 133, 191, 0.4); color: #89aacc; font-size: 1vw; font-weight: 600; text-transform: uppercase; }
    h1 { font-size: 3.2vw; font-weight: 800; line-height: 1.15; }
    p { font-size: 1.4vw; color: rgba(255,255,255,0.75); }
    ul { list-style: none; display: flex; flex-direction: column; gap: 0.8vw; margin-top: 0.5vw; }
    li { font-size: 1.25vw; color: #fff; display: flex; gap: 0.8vw; }
    .media-col { flex: 1.2; display: flex; justify-content: center; }
    .video-box { width: 100%; border-radius: 1vw; overflow: hidden; box-shadow: 0 1vw 3vw rgba(0,0,0,0.6); border: 2px solid rgba(255,255,255,0.15); }
    video { width: 100%; display: block; }
  </style>
</head>
<body>
  <div class="slide-deck-frame">
    <div class="slide-col-text">
      <span class="tag">${escapeHtml(inputBadge.value)}</span>
      <h1>${escapeHtml(inputTitle.value)}</h1>
      <p>${escapeHtml(inputSubtitle.value)}</p>
      <ul>
        ${inputBullets.value.split('\n').filter(b => b.trim()).map(b => `<li><span style="color:#89aacc;">&#10004;</span> ${escapeHtml(b.trim())}</li>`).join('')}
      </ul>
    </div>
    <div class="media-col">
      <div class="video-box">
        <video autoplay loop muted playsinline src="${slideVideo.src || ''}"></video>
      </div>
    </div>
  </div>
</body>
</html>`;

    const blob = new Blob([slideHtml], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'presentation-video-slide.html';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showToast('Exported presentation slide HTML file');
  });

  // Start with default Neural demo stream
  startDemoStream('neural');
});