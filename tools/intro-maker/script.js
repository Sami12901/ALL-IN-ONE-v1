// Video Intro Maker - 100% Client-Side Procedural Animation & Sound Engine
document.addEventListener('DOMContentLoaded', () => {
  let isPlaying = false;
  let isRecording = false;
  let currentTheme = 'luxury';
  let audioCtx = null;
  let animTimer = null;

  const canvas = document.getElementById('intro-canvas');
  const ctx = canvas.getContext('2d');

  const btnPreview = document.getElementById('btn-preview-intro');
  const previewProgress = document.getElementById('preview-progress');
  const durationCounter = document.getElementById('duration-counter');

  const presetCards = document.querySelectorAll('.preset-card');
  const introTitle = document.getElementById('intro-title');
  const introSubtitle = document.getElementById('intro-subtitle');
  const introColor = document.getElementById('intro-color');
  const introDuration = document.getElementById('intro-duration');
  const checkSfx = document.getElementById('check-sfx');

  const btnExportVideo = document.getElementById('btn-export-video');
  const renderMsg = document.getElementById('render-msg');

  function initAudio() {
    if (!audioCtx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      audioCtx = new AudioCtx();
    }
    if (audioCtx.state === 'suspended') {
      audioCtx.resume();
    }
  }

  // Synthesize procedural intro sound FX into destination stream or speakers
  function playIntroAudio(destinationNode = null) {
    if (!checkSfx.checked) return;
    initAudio();

    const dest = destinationNode || audioCtx.destination;
    const now = audioCtx.currentTime;
    const dur = parseFloat(introDuration.value);

    // 1. Sub Bass Riser
    const oscRiser = audioCtx.createOscillator();
    const gainRiser = audioCtx.createGain();
    oscRiser.type = 'sine';
    oscRiser.frequency.setValueAtTime(60, now);
    oscRiser.frequency.exponentialRampToValueAtTime(220, now + dur * 0.7);
    gainRiser.gain.setValueAtTime(0.01, now);
    gainRiser.gain.linearRampToValueAtTime(0.3, now + dur * 0.7);
    gainRiser.gain.exponentialRampToValueAtTime(0.001, now + dur);

    oscRiser.connect(gainRiser);
    gainRiser.connect(dest);
    oscRiser.start(now);
    oscRiser.stop(now + dur);

    // 2. High Shimmer Chime Impact
    const oscChime = audioCtx.createOscillator();
    const gainChime = audioCtx.createGain();
    oscChime.type = 'triangle';
    oscChime.frequency.setValueAtTime(523.25, now + dur * 0.4); // C5
    oscChime.frequency.exponentialRampToValueAtTime(1046.5, now + dur * 0.5); // C6
    gainChime.gain.setValueAtTime(0.001, now);
    gainChime.gain.setValueAtTime(0.4, now + dur * 0.45);
    gainChime.gain.exponentialRampToValueAtTime(0.001, now + dur * 0.95);

    oscChime.connect(gainChime);
    gainChime.connect(dest);
    oscChime.start(now + dur * 0.4);
    oscChime.stop(now + dur);
  }

  // Procedural Frame Renderer
  function renderFrame(progress) {
    const w = canvas.width;
    const h = canvas.height;
    ctx.clearRect(0, 0, w, h);

    const titleText = (introTitle.value || 'ALL IN ONE').toUpperCase();
    const subText = (introSubtitle.value || 'DIGITAL SUITE').toUpperCase();
    const accent = introColor.value || '#4e85bf';

    // Ease in-out progress
    const ease = 0.5 - Math.cos(progress * Math.PI) / 2;

    if (currentTheme === 'luxury') {
      // Dark gold background
      const bg = ctx.createRadialGradient(w / 2, h / 2, 50, w / 2, h / 2, w / 1.5);
      bg.addColorStop(0, '#1c160b');
      bg.addColorStop(1, '#050402');
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, w, h);

      // Golden bokeh particles
      const count = 40;
      for (let i = 0; i < count; i++) {
        const px = (Math.sin(i * 12.3 + progress * 2) * 0.5 + 0.5) * w;
        const py = (Math.cos(i * 7.1 + progress * 1.5) * 0.5 + 0.5) * h;
        const pr = 2 + (i % 5) * 3;
        ctx.fillStyle = `rgba(245, 185, 66, ${0.1 + (i % 4) * 0.08})`;
        ctx.beginPath();
        ctx.arc(px, py, pr, 0, Math.PI * 2);
        ctx.fill();
      }

      // Volumetric Gold Flare Center
      const flare = ctx.createRadialGradient(w / 2, h / 2, 10, w / 2, h / 2, 350 * ease);
      flare.addColorStop(0, 'rgba(255, 215, 0, 0.4)');
      flare.addColorStop(0.5, 'rgba(212, 175, 55, 0.15)');
      flare.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = flare;
      ctx.fillRect(0, 0, w, h);

      // Typography
      const scale = 0.85 + 0.2 * ease;
      ctx.save();
      ctx.translate(w / 2, h / 2);
      ctx.scale(scale, scale);

      ctx.font = 'bold 74px "Instrument Serif", serif, sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      const textGrad = ctx.createLinearGradient(-300, -50, 300, 50);
      textGrad.addColorStop(0, '#fef08a');
      textGrad.addColorStop(0.5, '#eab308');
      textGrad.addColorStop(1, '#ca8a04');
      ctx.fillStyle = textGrad;
      ctx.shadowColor = 'rgba(234, 179, 8, 0.6)';
      ctx.shadowBlur = 24 * ease;
      ctx.fillText(titleText, 0, -25);

      // Subtitle
      ctx.shadowBlur = 0;
      ctx.font = '600 24px "Inter", sans-serif';
      ctx.letterSpacing = '8px';
      ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
      ctx.fillText(subText, 0, 45);
      ctx.restore();

    } else if (currentTheme === 'cyber') {
      // Cyber Neon grid
      ctx.fillStyle = '#030712';
      ctx.fillRect(0, 0, w, h);

      // 3D perspective grid lines
      ctx.strokeStyle = 'rgba(56, 189, 248, 0.25)';
      ctx.lineWidth = 1.5;
      const horizon = h * 0.65;
      for (let x = -w; x <= w * 2; x += 80) {
        ctx.beginPath();
        ctx.moveTo(w / 2, horizon);
        ctx.lineTo(x, h);
        ctx.stroke();
      }
      for (let y = horizon; y <= h; y += 24 + (y - horizon) * 0.2) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(w, y);
        ctx.stroke();
      }

      // Neon pulse sun
      const sunGrad = ctx.createRadialGradient(w / 2, horizon, 10, w / 2, horizon, 160);
      sunGrad.addColorStop(0, '#f43f5e');
      sunGrad.addColorStop(0.6, '#ec4899');
      sunGrad.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = sunGrad;
      ctx.beginPath();
      ctx.arc(w / 2, horizon, 140, Math.PI, 0);
      ctx.fill();

      // Title
      ctx.font = '900 82px "Inter", sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillStyle = '#ffffff';
      ctx.shadowColor = accent;
      ctx.shadowBlur = 32 * ease;
      ctx.fillText(titleText, w / 2, h * 0.38);

      ctx.font = '700 26px monospace';
      ctx.fillStyle = '#38bdf8';
      ctx.shadowColor = '#38bdf8';
      ctx.shadowBlur = 12;
      ctx.fillText(`// ${subText} //`, w / 2, h * 0.38 + 65);

    } else if (currentTheme === 'minimal') {
      // Modern Studio clean
      ctx.fillStyle = '#0a0a0c';
      ctx.fillRect(0, 0, w, h);

      // Expanding accent line
      const lineWidth = Math.min(w * 0.6, w * 0.8 * ease);
      ctx.strokeStyle = accent;
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(w / 2 - lineWidth / 2, h / 2 - 60);
      ctx.lineTo(w / 2 + lineWidth / 2, h / 2 - 60);
      ctx.stroke();

      ctx.font = '800 78px "Inter", sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillStyle = '#f8fafc';
      ctx.fillText(titleText, w / 2, h / 2 + 5);

      ctx.font = '500 22px "Inter", sans-serif';
      ctx.fillStyle = '#94a3b8';
      ctx.fillText(subText, w / 2, h / 2 + 65);

      // Bottom bounding line
      ctx.beginPath();
      ctx.moveTo(w / 2 - lineWidth / 2, h / 2 + 105);
      ctx.lineTo(w / 2 + lineWidth / 2, h / 2 + 105);
      ctx.stroke();

    } else if (currentTheme === 'epic') {
      // Deep Space & Stars
      ctx.fillStyle = '#020205';
      ctx.fillRect(0, 0, w, h);

      // Starfield warp
      for (let i = 0; i < 90; i++) {
        const speed = (i % 5) + 1;
        const angle = i * 2.39;
        const dist = ((progress * speed * 250) + i * 15) % (w * 0.7);
        const sx = w / 2 + Math.cos(angle) * dist;
        const sy = h / 2 + Math.sin(angle) * dist;
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(sx, sy, Math.min(3, dist / 150), 0, Math.PI * 2);
        ctx.fill();
      }

      // Shockwave circle
      if (progress > 0.3) {
        const shockP = (progress - 0.3) / 0.7;
        ctx.strokeStyle = `rgba(78, 133, 191, ${1 - shockP})`;
        ctx.lineWidth = 10 * (1 - shockP);
        ctx.beginPath();
        ctx.arc(w / 2, h / 2, shockP * w * 0.75, 0, Math.PI * 2);
        ctx.stroke();
      }

      // Title
      ctx.font = '900 86px "Inter", sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillStyle = '#ffffff';
      ctx.shadowColor = '#60a5fa';
      ctx.shadowBlur = 36 * ease;
      ctx.fillText(titleText, w / 2, h / 2 - 20);

      ctx.font = '600 24px monospace';
      ctx.fillStyle = '#93c5fd';
      ctx.shadowBlur = 0;
      ctx.fillText(subText, w / 2, h / 2 + 50);
    }
  }

  // Animation Player
  function playPreview() {
    if (isPlaying) return;
    isPlaying = true;
    btnPreview.textContent = 'Playing...';
    btnPreview.disabled = true;

    playIntroAudio();

    const duration = parseFloat(introDuration.value);
    const fps = 30;
    const totalFrames = fps * duration;
    let frame = 0;

    animTimer = setInterval(() => {
      const progress = frame / totalFrames;
      renderFrame(progress);

      previewProgress.value = progress * 100;
      durationCounter.textContent = `${(progress * duration).toFixed(1)}s / ${duration.toFixed(1)}s`;

      frame++;
      if (frame > totalFrames) {
        clearInterval(animTimer);
        isPlaying = false;
        btnPreview.textContent = 'Play Intro';
        btnPreview.disabled = false;
      }
    }, 1000 / fps);
  }

  // Presets click
  presetCards.forEach(card => {
    card.addEventListener('click', () => {
      presetCards.forEach(c => c.classList.remove('active'));
      card.classList.add('active');
      currentTheme = card.dataset.style;
      renderFrame(0.5); // Preview middle frame
    });
  });

  [introTitle, introSubtitle, introColor, introDuration].forEach(el => {
    el.addEventListener('input', () => renderFrame(0.5));
  });

  btnPreview.addEventListener('click', playPreview);

  previewProgress.addEventListener('input', (e) => {
    if (isPlaying) {
      clearInterval(animTimer);
      isPlaying = false;
      btnPreview.textContent = 'Play Intro';
      btnPreview.disabled = false;
    }
    const progress = e.target.value / 100;
    const duration = parseFloat(introDuration.value);
    durationCounter.textContent = `${(progress * duration).toFixed(1)}s / ${duration.toFixed(1)}s`;
    renderFrame(progress);
  });

  // Render & Export Video
  btnExportVideo.addEventListener('click', async () => {
    if (isRecording) return;
    isRecording = true;
    btnExportVideo.disabled = true;
    renderMsg.style.display = 'block';

    initAudio();
    const duration = parseFloat(introDuration.value);
    const stream = canvas.captureStream(30);

    // Audio routing
    if (checkSfx.checked) {
      const audioDest = audioCtx.createMediaStreamDestination();
      playIntroAudio(audioDest);
      audioDest.stream.getAudioTracks().forEach(t => stream.addTrack(t));
    }

    const recorder = new MediaRecorder(stream, { mimeType: 'video/webm' });
    const chunks = [];

    recorder.ondataavailable = e => { if (e.data.size > 0) chunks.push(e.data); };
    recorder.onstop = () => {
      const blob = new Blob(chunks, { type: 'video/webm' });
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      const titleSlug = (introTitle.value || 'intro').toLowerCase().replace(/[^a-z0-9]+/g, '_');
      a.download = `${titleSlug}_intro.webm`;
      a.click();

      renderMsg.style.display = 'none';
      btnExportVideo.disabled = false;
      isRecording = false;
      renderFrame(0.5);
    };

    recorder.start();

    const fps = 30;
    const totalFrames = fps * duration;
    let frame = 0;

    const recordInterval = setInterval(() => {
      const progress = frame / totalFrames;
      renderFrame(progress);
      previewProgress.value = progress * 100;
      durationCounter.textContent = `${(progress * duration).toFixed(1)}s / ${duration.toFixed(1)}s`;

      frame++;
      if (frame > totalFrames) {
        clearInterval(recordInterval);
        if (recorder.state === 'recording') recorder.stop();
      }
    }, 1000 / fps);
  });

  // Initial draw
  renderFrame(0.5);
});