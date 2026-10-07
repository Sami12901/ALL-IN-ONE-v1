// AI Video Generator - 100% Client-Side Engine
document.addEventListener('DOMContentLoaded', () => {
  let isPlaying = false;
  let isRecording = false;
  let currentStyle = 'cyber';
  let audioCtx = null;
  let animTimer = null;

  const canvas = document.getElementById('gen-canvas');
  const ctx = canvas.getContext('2d');

  const btnPlayGen = document.getElementById('btn-play-gen');
  const genProgress = document.getElementById('gen-progress');
  const genTime = document.getElementById('gen-time');

  const promptInput = document.getElementById('prompt-input');
  const btnSurprisePrompt = document.getElementById('btn-surprise-prompt');
  const styleCards = document.querySelectorAll('.style-card');
  const selectCamera = document.getElementById('select-camera');
  const selectDuration = document.getElementById('select-duration');
  const checkAmbientAudio = document.getElementById('check-ambient-audio');

  const btnExportGenerated = document.getElementById('btn-export-generated');
  const renderMsg = document.getElementById('render-msg');

  const PROMPTS = [
    'Cinematic drone flight across a cybernetic neon metropolis at dusk with volumetric fog and flying vehicles.',
    'Breathtaking interstellar voyage through an iridescent violet nebula with spiraling cosmic dust.',
    'Aerial golden-hour sweep over tropical turquoise lagoons and volcanic emerald peaks.',
    'Quantum neural mainframe pulsing with holographic matrix lines and glowing data streams.',
    'Futuristic hyper-speed monorail gliding across an illuminated sky-bridge over a glowing city.'
  ];

  function initAudio() {
    if (!audioCtx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      audioCtx = new AudioCtx();
    }
    if (audioCtx.state === 'suspended') {
      audioCtx.resume();
    }
  }

  // Synthesize ambient drone score via Web Audio API
  function playAmbientScore(destNode = null) {
    if (!checkAmbientAudio.checked) return;
    initAudio();

    const dest = destNode || audioCtx.destination;
    const now = audioCtx.currentTime;
    const dur = parseFloat(selectDuration.value);

    // Deep atmospheric chord: C2, G2, D3, A3
    const freqs = [65.41, 98.00, 146.83, 220.00];
    freqs.forEach((f, idx) => {
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(f, now);

      gain.gain.setValueAtTime(0.001, now);
      gain.gain.linearRampToValueAtTime(0.04, now + 1.0 + idx * 0.2);
      gain.gain.setValueAtTime(0.04, now + dur - 1.0);
      gain.gain.linearRampToValueAtTime(0.001, now + dur);

      osc.connect(gain);
      gain.connect(dest);
      osc.start(now);
      osc.stop(now + dur);
    });
  }

  function renderFrame(progress) {
    const w = canvas.width;
    const h = canvas.height;
    ctx.clearRect(0, 0, w, h);

    const camMode = selectCamera.value;
    let camScale = 1.0;
    let camOffsetX = 0;
    let camOffsetY = 0;

    if (camMode === 'forward') {
      camScale = 1.0 + progress * 0.25;
    } else if (camMode === 'orbit') {
      camOffsetX = Math.sin(progress * Math.PI * 2) * 60;
      camOffsetY = Math.cos(progress * Math.PI * 2) * 25;
    } else {
      camOffsetX = (progress - 0.5) * 120;
    }

    ctx.save();
    ctx.translate(w / 2 + camOffsetX, h / 2 + camOffsetY);
    ctx.scale(camScale, camScale);
    ctx.translate(-w / 2, -h / 2);

    if (currentStyle === 'cyber') {
      // Cyber City Scene
      ctx.fillStyle = '#050714';
      ctx.fillRect(0, 0, w, h);

      // Rain streaks
      ctx.strokeStyle = 'rgba(56, 189, 248, 0.2)';
      ctx.lineWidth = 1;
      for (let i = 0; i < 50; i++) {
        const rx = (i * 37) % w;
        const ry = (i * 29 + progress * 800) % h;
        ctx.beginPath();
        ctx.moveTo(rx, ry);
        ctx.lineTo(rx - 5, ry + 25);
        ctx.stroke();
      }

      // Skyline Skyscrapers
      for (let i = 0; i < 16; i++) {
        const bw = 70 + (i % 4) * 20;
        const bh = 220 + (i % 5) * 80;
        const bx = i * 85 - 40;
        const by = h - bh;

        ctx.fillStyle = i % 2 === 0 ? '#0b1329' : '#141e3d';
        ctx.fillRect(bx, by, bw, bh);

        // Windows / Neon Grid
        ctx.fillStyle = i % 3 === 0 ? '#38bdf8' : '#ec4899';
        for (let wy = by + 20; wy < h - 40; wy += 40) {
          ctx.fillRect(bx + 15, wy, 10, 14);
          ctx.fillRect(bx + 35, wy, 10, 14);
        }
      }

      // Flying Vehicles with light trails
      for (let v = 0; v < 4; v++) {
        const vx = ((progress * (400 + v * 150)) + v * 300) % (w + 200) - 100;
        const vy = 160 + v * 80;
        ctx.fillStyle = v % 2 === 0 ? '#f43f5e' : '#38bdf8';
        ctx.fillRect(vx, vy, 40, 6);

        // Trail
        ctx.strokeStyle = ctx.fillStyle;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(vx - 50, vy + 3);
        ctx.lineTo(vx, vy + 3);
        ctx.stroke();
      }

    } else if (currentStyle === 'space') {
      // Cosmic Nebula
      ctx.fillStyle = '#020208';
      ctx.fillRect(0, 0, w, h);

      // Rotating Galactic Core
      const coreGrad = ctx.createRadialGradient(w / 2, h / 2, 20, w / 2, h / 2, 380);
      coreGrad.addColorStop(0, '#f43f5e');
      coreGrad.addColorStop(0.4, '#a855f7');
      coreGrad.addColorStop(0.8, '#3b82f6');
      coreGrad.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = coreGrad;
      ctx.beginPath();
      ctx.arc(w / 2, h / 2, 380, 0, Math.PI * 2);
      ctx.fill();

      // Cosmic dust particles
      for (let i = 0; i < 90; i++) {
        const angle = i * 0.2 + progress * 2;
        const radius = 40 + i * 4;
        const px = w / 2 + Math.cos(angle) * radius;
        const py = h / 2 + Math.sin(angle) * (radius * 0.6);
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(px, py, 2 + (i % 3), 0, Math.PI * 2);
        ctx.fill();
      }

    } else if (currentStyle === 'island') {
      // Tropical Drone
      const sky = ctx.createLinearGradient(0, 0, 0, h);
      sky.addColorStop(0, '#f97316');
      sky.addColorStop(0.5, '#38bdf8');
      sky.addColorStop(1, '#0284c7');
      ctx.fillStyle = sky;
      ctx.fillRect(0, 0, w, h);

      // Turquoise Ocean
      ctx.fillStyle = '#0891b2';
      ctx.fillRect(0, h * 0.55, w, h * 0.45);

      // Volcanic Island Silhouette
      ctx.fillStyle = '#064e3b';
      ctx.beginPath();
      ctx.moveTo(w * 0.2, h * 0.55);
      ctx.lineTo(w * 0.45, h * 0.32);
      ctx.lineTo(w * 0.7, h * 0.55);
      ctx.closePath();
      ctx.fill();

    } else {
      // Quantum Core
      ctx.fillStyle = '#030712';
      ctx.fillRect(0, 0, w, h);

      // Holographic matrix lines
      ctx.strokeStyle = 'rgba(56, 189, 248, 0.3)';
      ctx.lineWidth = 1.5;
      for (let x = 0; x < w; x += 60) {
        ctx.beginPath();
        ctx.moveTo(x, 0); ctx.lineTo(x, h);
        ctx.stroke();
      }
      for (let y = 0; y < h; y += 60) {
        ctx.beginPath();
        ctx.moveTo(0, y); ctx.lineTo(w, y);
        ctx.stroke();
      }

      // Quantum Core Orb
      const orbGrad = ctx.createRadialGradient(w / 2, h / 2, 10, w / 2, h / 2, 160);
      orbGrad.addColorStop(0, '#ffffff');
      orbGrad.addColorStop(0.5, '#38bdf8');
      orbGrad.addColorStop(1, 'rgba(56, 189, 248, 0)');
      ctx.fillStyle = orbGrad;
      ctx.beginPath();
      ctx.arc(w / 2, h / 2, 160, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.restore();

    // Cinematic HUD Overlay (Bottom Prompt Pill)
    ctx.fillStyle = 'rgba(10, 15, 26, 0.75)';
    ctx.beginPath();
    ctx.roundRect(40, h - 70, w - 80, 44, 22);
    ctx.fill();

    ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
    ctx.lineWidth = 1;
    ctx.stroke();

    ctx.font = '600 16px "Inter", sans-serif';
    ctx.fillStyle = '#ffffff';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    const displayPrompt = promptInput.value.length > 80 ? promptInput.value.slice(0, 77) + '...' : promptInput.value;
    ctx.fillText(`PROMPT: "${displayPrompt}"`, w / 2, h - 48);
  }

  function playPreview() {
    if (isPlaying) return;
    isPlaying = true;
    btnPlayGen.textContent = 'Playing...';
    btnPlayGen.disabled = true;

    playAmbientScore();

    const duration = parseFloat(selectDuration.value);
    const fps = 30;
    const totalFrames = fps * duration;
    let frame = 0;

    animTimer = setInterval(() => {
      const progress = frame / totalFrames;
      renderFrame(progress);

      genProgress.value = progress * 100;
      genTime.textContent = `${(progress * duration).toFixed(1)}s / ${duration.toFixed(1)}s`;

      frame++;
      if (frame > totalFrames) {
        clearInterval(animTimer);
        isPlaying = false;
        btnPlayGen.textContent = 'Play Scene';
        btnPlayGen.disabled = false;
      }
    }, 1000 / fps);
  }

  styleCards.forEach(card => {
    card.addEventListener('click', () => {
      styleCards.forEach(c => c.classList.remove('active'));
      card.classList.add('active');
      currentStyle = card.dataset.style;
      renderFrame(0.5);
    });
  });

  btnSurprisePrompt.addEventListener('click', () => {
    const randomPrompt = PROMPTS[Math.floor(Math.random() * PROMPTS.length)];
    promptInput.value = randomPrompt;
    renderFrame(0.5);
  });

  promptInput.addEventListener('input', () => renderFrame(0.5));
  selectCamera.addEventListener('change', () => renderFrame(0.5));

  btnPlayGen.addEventListener('click', playPreview);

  genProgress.addEventListener('input', (e) => {
    if (isPlaying) {
      clearInterval(animTimer);
      isPlaying = false;
      btnPlayGen.textContent = 'Play Scene';
      btnPlayGen.disabled = false;
    }
    const progress = e.target.value / 100;
    const duration = parseFloat(selectDuration.value);
    genTime.textContent = `${(progress * duration).toFixed(1)}s / ${duration.toFixed(1)}s`;
    renderFrame(progress);
  });

  // Export Generated Video
  btnExportGenerated.addEventListener('click', async () => {
    if (isRecording) return;
    isRecording = true;
    btnExportGenerated.disabled = true;
    renderMsg.style.display = 'block';

    initAudio();
    const duration = parseFloat(selectDuration.value);
    const stream = canvas.captureStream(30);

    if (checkAmbientAudio.checked) {
      const audioDest = audioCtx.createMediaStreamDestination();
      playAmbientScore(audioDest);
      audioDest.stream.getAudioTracks().forEach(t => stream.addTrack(t));
    }

    const recorder = new MediaRecorder(stream, { mimeType: 'video/webm' });
    const chunks = [];

    recorder.ondataavailable = e => { if (e.data.size > 0) chunks.push(e.data); };
    recorder.onstop = () => {
      const blob = new Blob(chunks, { type: 'video/webm' });
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = `ai_generated_${currentStyle}.webm`;
      a.click();

      renderMsg.style.display = 'none';
      btnExportGenerated.disabled = false;
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
      genProgress.value = progress * 100;
      genTime.textContent = `${(progress * duration).toFixed(1)}s / ${duration.toFixed(1)}s`;

      frame++;
      if (frame > totalFrames) {
        clearInterval(recordInterval);
        if (recorder.state === 'recording') recorder.stop();
      }
    }, 1000 / fps);
  });

  renderFrame(0.5);
});