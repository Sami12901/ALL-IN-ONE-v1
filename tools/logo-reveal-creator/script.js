// Logo Reveal Video Creator - 100% Client-Side Engine
document.addEventListener('DOMContentLoaded', () => {
  let isPlaying = false;
  let isRecording = false;
  let currentAnim = 'particles';
  let audioCtx = null;
  let logoImg = null;
  let animTimer = null;

  const canvas = document.getElementById('reveal-canvas');
  const ctx = canvas.getContext('2d');

  const btnPlayReveal = document.getElementById('btn-play-reveal');
  const revealProgress = document.getElementById('reveal-progress');
  const revealTime = document.getElementById('reveal-time');

  const animCards = document.querySelectorAll('.anim-card');
  const brandTitle = document.getElementById('brand-title');
  const brandSubtitle = document.getElementById('brand-subtitle');
  const logoUpload = document.getElementById('logo-upload');
  const revealColor = document.getElementById('reveal-color');
  const revealDuration = document.getElementById('reveal-duration');
  const checkSfx = document.getElementById('check-sfx');

  const btnExportReveal = document.getElementById('btn-export-reveal');
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

  // Synthesize logo reveal impact boom & riser sound FX
  function playImpactSfx(destNode = null) {
    if (!checkSfx.checked) return;
    initAudio();

    const dest = destNode || audioCtx.destination;
    const now = audioCtx.currentTime;
    const dur = parseFloat(revealDuration.value);
    const impactTime = now + (dur * 0.45);

    // 1. Pre-impact Riser
    const oscRise = audioCtx.createOscillator();
    const gainRise = audioCtx.createGain();
    oscRise.type = 'sawtooth';
    oscRise.frequency.setValueAtTime(100, now);
    oscRise.frequency.exponentialRampToValueAtTime(800, impactTime);

    gainRise.gain.setValueAtTime(0.001, now);
    gainRise.gain.linearRampToValueAtTime(0.05, impactTime);
    gainRise.gain.exponentialRampToValueAtTime(0.001, impactTime + 0.1);

    oscRise.connect(gainRise);
    gainRise.connect(dest);
    oscRise.start(now);
    oscRise.stop(impactTime + 0.1);

    // 2. Heavy Sub Bass Impact Boom
    const oscBoom = audioCtx.createOscillator();
    const gainBoom = audioCtx.createGain();
    oscBoom.type = 'sine';
    oscBoom.frequency.setValueAtTime(150, impactTime);
    oscBoom.frequency.exponentialRampToValueAtTime(30, impactTime + 1.2);

    gainBoom.gain.setValueAtTime(0.4, impactTime);
    gainBoom.gain.exponentialRampToValueAtTime(0.001, impactTime + 1.2);

    oscBoom.connect(gainBoom);
    gainBoom.connect(dest);
    oscBoom.start(impactTime);
    oscBoom.stop(impactTime + 1.2);
  }

  function renderFrame(progress) {
    const w = canvas.width;
    const h = canvas.height;
    ctx.clearRect(0, 0, w, h);

    const title = (brandTitle.value || 'NEXUS').toUpperCase();
    const sub = (brandSubtitle.value || 'DIGITAL SUITE').toUpperCase();
    const accent = revealColor.value || '#4e85bf';

    const cx = w / 2;
    const cy = h / 2 - 40;

    // Background Dark Studio
    ctx.fillStyle = '#030509';
    ctx.fillRect(0, 0, w, h);

    if (currentAnim === 'particles') {
      // Golden Particles Swarm
      const pCount = 60;
      for (let i = 0; i < pCount; i++) {
        const angle = i * 2.399;
        // Progress 0->0.45: converging inward; 0.45->1: bursting
        let dist = 0;
        if (progress < 0.45) {
          dist = (1 - progress / 0.45) * 400 + 40;
        } else {
          dist = ((progress - 0.45) / 0.55) * 500;
        }

        const px = cx + Math.cos(angle) * dist;
        const py = cy + Math.sin(angle) * dist;
        const alpha = progress < 0.45 ? 0.3 + (i % 5) * 0.1 : Math.max(0, 1 - (progress - 0.45) * 1.8);

        ctx.fillStyle = `rgba(245, 185, 66, ${alpha})`;
        ctx.beginPath();
        ctx.arc(px, py, 3 + (i % 4), 0, Math.PI * 2);
        ctx.fill();
      }

      // Center Flash at impact
      if (progress >= 0.42 && progress <= 0.6) {
        const flashAlpha = 1 - (progress - 0.42) / 0.18;
        const flash = ctx.createRadialGradient(cx, cy, 10, cx, cy, 300);
        flash.addColorStop(0, `rgba(255, 255, 255, ${flashAlpha * 0.8})`);
        flash.addColorStop(0.5, `rgba(245, 185, 66, ${flashAlpha * 0.4})`);
        flash.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = flash;
        ctx.beginPath();
        ctx.arc(cx, cy, 300, 0, Math.PI * 2);
        ctx.fill();
      }

    } else if (currentAnim === 'cyber') {
      // Cyber Glitch
      ctx.strokeStyle = 'rgba(56, 189, 248, 0.2)';
      ctx.lineWidth = 1;
      for (let y = 0; y < h; y += 8) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(w, y);
        ctx.stroke();
      }

      // Glitch displacement
      if (progress < 0.5) {
        ctx.fillStyle = 'rgba(244, 63, 94, 0.4)';
        ctx.fillRect(cx - 80 + Math.sin(progress * 40) * 15, cy - 80, 160, 160);
      }

    } else if (currentAnim === 'shockwave') {
      // Expanding Shockwave Ring
      if (progress > 0.35) {
        const waveP = (progress - 0.35) / 0.65;
        ctx.strokeStyle = `rgba(78, 133, 191, ${1 - waveP})`;
        ctx.lineWidth = 8 * (1 - waveP);
        ctx.beginPath();
        ctx.arc(cx, cy, waveP * 600, 0, Math.PI * 2);
        ctx.stroke();
      }
    } else {
      // Minimalist Clean Drawing circle
      ctx.strokeStyle = accent;
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.arc(cx, cy, 90, 0, progress * Math.PI * 2);
      ctx.stroke();
    }

    // Logo Appearance (Fade & Scale in after impact or progressive)
    const logoScale = Math.min(1.0, progress * 1.8);
    const logoAlpha = Math.min(1.0, progress * 2.2);

    ctx.save();
    ctx.translate(cx, cy);
    ctx.scale(logoScale, logoScale);
    ctx.globalAlpha = logoAlpha;

    if (logoImg) {
      const lw = 140;
      const lh = (logoImg.height / logoImg.width) * 140;
      ctx.drawImage(logoImg, -lw / 2, -lh / 2, lw, lh);
    } else {
      // Vector Monogram Badge
      ctx.fillStyle = accent;
      ctx.beginPath();
      ctx.arc(0, 0, 60, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 44px "Inter", sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(title.charAt(0) || 'A', 0, 0);
    }
    ctx.restore();

    // Brand Title & Subtitle
    if (progress > 0.4) {
      const textAlpha = Math.min(1.0, (progress - 0.4) / 0.3);
      ctx.save();
      ctx.globalAlpha = textAlpha;

      ctx.font = '900 64px "Inter", sans-serif';
      ctx.fillStyle = '#ffffff';
      ctx.textAlign = 'center';
      ctx.shadowColor = accent;
      ctx.shadowBlur = 24;
      ctx.fillText(title, cx, cy + 130);

      ctx.shadowBlur = 0;
      ctx.font = '600 22px monospace';
      ctx.letterSpacing = '6px';
      ctx.fillStyle = '#94a3b8';
      ctx.fillText(sub, cx, cy + 175);
      ctx.restore();
    }
  }

  function playPreview() {
    if (isPlaying) return;
    isPlaying = true;
    btnPlayReveal.textContent = 'Playing...';
    btnPlayReveal.disabled = true;

    playImpactSfx();

    const duration = parseFloat(revealDuration.value);
    const fps = 30;
    const totalFrames = fps * duration;
    let frame = 0;

    animTimer = setInterval(() => {
      const progress = frame / totalFrames;
      renderFrame(progress);

      revealProgress.value = progress * 100;
      revealTime.textContent = `${(progress * duration).toFixed(1)}s / ${duration.toFixed(1)}s`;

      frame++;
      if (frame > totalFrames) {
        clearInterval(animTimer);
        isPlaying = false;
        btnPlayReveal.textContent = 'Play Reveal';
        btnPlayReveal.disabled = false;
      }
    }, 1000 / fps);
  }

  animCards.forEach(card => {
    card.addEventListener('click', () => {
      animCards.forEach(c => c.classList.remove('active'));
      card.classList.add('active');
      currentAnim = card.dataset.anim;
      renderFrame(0.5);
    });
  });

  logoUpload.addEventListener('change', (e) => {
    if (e.target.files[0]) {
      const img = new Image();
      img.onload = () => {
        logoImg = img;
        renderFrame(0.6);
      };
      img.src = URL.createObjectURL(e.target.files[0]);
    }
  });

  [brandTitle, brandSubtitle, revealColor, revealDuration].forEach(el => {
    el.addEventListener('input', () => renderFrame(0.6));
  });

  btnPlayReveal.addEventListener('click', playPreview);

  revealProgress.addEventListener('input', (e) => {
    if (isPlaying) {
      clearInterval(animTimer);
      isPlaying = false;
      btnPlayReveal.textContent = 'Play Reveal';
      btnPlayReveal.disabled = false;
    }
    const progress = e.target.value / 100;
    const duration = parseFloat(revealDuration.value);
    revealTime.textContent = `${(progress * duration).toFixed(1)}s / ${duration.toFixed(1)}s`;
    renderFrame(progress);
  });

  // Export Video
  btnExportReveal.addEventListener('click', async () => {
    if (isRecording) return;
    isRecording = true;
    btnExportReveal.disabled = true;
    renderMsg.style.display = 'block';

    initAudio();
    const duration = parseFloat(revealDuration.value);
    const stream = canvas.captureStream(30);

    if (checkSfx.checked) {
      const audioDest = audioCtx.createMediaStreamDestination();
      playImpactSfx(audioDest);
      audioDest.stream.getAudioTracks().forEach(t => stream.addTrack(t));
    }

    const recorder = new MediaRecorder(stream, { mimeType: 'video/webm' });
    const chunks = [];

    recorder.ondataavailable = e => { if (e.data.size > 0) chunks.push(e.data); };
    recorder.onstop = () => {
      const blob = new Blob(chunks, { type: 'video/webm' });
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      const slug = (brandTitle.value || 'logo').toLowerCase().replace(/[^a-z0-9]+/g, '_');
      a.download = `${slug}_reveal_${currentAnim}.webm`;
      a.click();

      renderMsg.style.display = 'none';
      btnExportReveal.disabled = false;
      isRecording = false;
      renderFrame(0.6);
    };

    recorder.start();

    const fps = 30;
    const totalFrames = fps * duration;
    let frame = 0;

    const recordInterval = setInterval(() => {
      const progress = frame / totalFrames;
      renderFrame(progress);
      revealProgress.value = progress * 100;
      revealTime.textContent = `${(progress * duration).toFixed(1)}s / ${duration.toFixed(1)}s`;

      frame++;
      if (frame > totalFrames) {
        clearInterval(recordInterval);
        if (recorder.state === 'recording') recorder.stop();
      }
    }, 1000 / fps);
  });

  renderFrame(0.6);
});