// AI Video Background Removal & Chroma Key Engine - 100% Client-Side
document.addEventListener('DOMContentLoaded', () => {
  let videoFileName = 'matted_video';
  let videoDuration = 0;
  let isPlaying = false;
  let isExporting = false;
  let showOriginal = false;
  let currentEnv = 'loft';
  let animId = null;

  // Offscreen processing canvas
  const offCanvas = document.createElement('canvas');
  const offCtx = offCanvas.getContext('2d', { willReadFrequently: true });

  const dropZone = document.getElementById('drop-zone');
  const videoInput = document.getElementById('video-input');
  const btnLoadDemo = document.getElementById('btn-load-demo');
  const studioView = document.getElementById('studio-view');

  const canvas = document.getElementById('stage-canvas');
  const ctx = canvas.getContext('2d');
  const hiddenVideo = document.getElementById('hidden-video');

  const btnPlayPause = document.getElementById('btn-play-pause');
  const seekBar = document.getElementById('seek-bar');
  const timeDisplay = document.getElementById('time-display');
  const btnToggleOriginal = document.getElementById('btn-toggle-original');

  const keyColorInput = document.getElementById('key-color');
  const btnPresetGreen = document.getElementById('btn-preset-green');
  const btnPresetBlue = document.getElementById('btn-preset-blue');
  const sliderTolerance = document.getElementById('slider-tolerance');
  const labelTolerance = document.getElementById('label-tolerance');
  const envChips = document.querySelectorAll('.env-chip');

  const btnExportMatted = document.getElementById('btn-export-matted');
  const renderMsg = document.getElementById('render-msg');

  function formatSec(s) {
    if (isNaN(s) || s < 0) s = 0;
    const m = Math.floor(s / 60);
    const sec = Math.floor(s % 60);
    return `${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`;
  }

  function hexToRgb(hex) {
    const val = parseInt(hex.replace('#', ''), 16);
    return {
      r: (val >> 16) & 255,
      g: (val >> 8) & 255,
      b: val & 255
    };
  }

  // Draw procedural virtual environment backdrop
  function drawVirtualEnv(targetCtx, w, h) {
    if (currentEnv === 'loft') {
      // Cyber Loft gradient
      const grad = targetCtx.createLinearGradient(0, 0, w, h);
      grad.addColorStop(0, '#0f172a');
      grad.addColorStop(0.5, '#1e1b4b');
      grad.addColorStop(1, '#312e81');
      targetCtx.fillStyle = grad;
      targetCtx.fillRect(0, 0, w, h);

      // Neon background glow window
      targetCtx.fillStyle = 'rgba(56, 189, 248, 0.15)';
      targetCtx.fillRect(w * 0.1, h * 0.1, w * 0.8, h * 0.7);

    } else if (currentEnv === 'office') {
      // High-rise executive office
      const grad = targetCtx.createLinearGradient(0, 0, w, h);
      grad.addColorStop(0, '#1e293b');
      grad.addColorStop(1, '#0f172a');
      targetCtx.fillStyle = grad;
      targetCtx.fillRect(0, 0, w, h);

      // Window mullions
      targetCtx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
      targetCtx.lineWidth = 4;
      targetCtx.beginPath();
      targetCtx.moveTo(w * 0.33, 0); targetCtx.lineTo(w * 0.33, h);
      targetCtx.moveTo(w * 0.66, 0); targetCtx.lineTo(w * 0.66, h);
      targetCtx.stroke();

    } else if (currentEnv === 'sunset') {
      // Sunset Coast
      const grad = targetCtx.createLinearGradient(0, 0, 0, h);
      grad.addColorStop(0, '#fb923c');
      grad.addColorStop(0.5, '#f43f5e');
      grad.addColorStop(1, '#0284c7');
      targetCtx.fillStyle = grad;
      targetCtx.fillRect(0, 0, w, h);

    } else {
      // Clean Dark Studio
      targetCtx.fillStyle = '#0a0d14';
      targetCtx.fillRect(0, 0, w, h);
    }
  }

  // Chroma key matting loop
  function drawFrame() {
    if (!hiddenVideo.videoWidth) return;

    const w = hiddenVideo.videoWidth || 640;
    const h = hiddenVideo.videoHeight || 360;

    if (canvas.width !== w || canvas.height !== h) {
      canvas.width = w;
      canvas.height = h;
      offCanvas.width = w;
      offCanvas.height = h;
    }

    if (showOriginal) {
      ctx.drawImage(hiddenVideo, 0, 0, w, h);
      ctx.font = 'bold 16px sans-serif';
      ctx.fillStyle = '#ef4444';
      ctx.fillText('ORIGINAL SOURCE (MATTING OFF)', 20, 30);
    } else {
      // 1. Draw Virtual Environment on output canvas
      drawVirtualEnv(ctx, w, h);

      // 2. Draw current video frame to offscreen canvas
      offCtx.drawImage(hiddenVideo, 0, 0, w, h);
      const imgData = offCtx.getImageData(0, 0, w, h);
      const data = imgData.data;

      const keyRgb = hexToRgb(keyColorInput.value);
      const tolerance = (parseFloat(sliderTolerance.value) / 100) * 280;

      // Fast RGB Euclidean Distance Matting
      for (let i = 0; i < data.length; i += 4) {
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];

        const dist = Math.sqrt(
          (r - keyRgb.r) * (r - keyRgb.r) +
          (g - keyRgb.g) * (g - keyRgb.g) +
          (b - keyRgb.b) * (b - keyRgb.b)
        );

        if (dist < tolerance) {
          // Transparent alpha
          data[i + 3] = 0;
        } else if (dist < tolerance + 35) {
          // Soft edge feather
          const alphaFactor = (dist - tolerance) / 35;
          data[i + 3] = Math.floor(data[i + 3] * alphaFactor);
        }
      }

      // Put keyed pixels back to offscreen and composite onto main canvas
      offCtx.putImageData(imgData, 0, 0);
      ctx.drawImage(offCanvas, 0, 0);
    }

    if (videoDuration > 0 && !seekBar.matches(':active')) {
      seekBar.value = (hiddenVideo.currentTime / videoDuration) * 100;
    }
    timeDisplay.textContent = `${formatSec(hiddenVideo.currentTime)} / ${formatSec(videoDuration)}`;

    if (isPlaying) {
      animId = requestAnimationFrame(drawFrame);
    }
  }

  function loadVideo(url, name) {
    videoFileName = (name || 'video').replace(/\.[^/.]+$/, '');
    hiddenVideo.src = url;
    hiddenVideo.onloadedmetadata = () => {
      videoDuration = hiddenVideo.duration;
      canvas.width = hiddenVideo.videoWidth || 640;
      canvas.height = hiddenVideo.videoHeight || 360;
      offCanvas.width = canvas.width;
      offCanvas.height = canvas.height;
      dropZone.style.display = 'none';
      studioView.style.display = 'grid';
      hiddenVideo.currentTime = 0;
      drawFrame();
    };
  }

  // Generate synthetic green screen sample video
  async function generateGreenScreenSample() {
    return new Promise((resolve) => {
      const demoCanvas = document.createElement('canvas');
      demoCanvas.width = 640;
      demoCanvas.height = 360;
      const dctx = demoCanvas.getContext('2d');
      const stream = demoCanvas.captureStream(30);
      const recorder = new MediaRecorder(stream, { mimeType: 'video/webm' });
      const chunks = [];

      recorder.ondataavailable = e => { if (e.data.size > 0) chunks.push(e.data); };
      recorder.onstop = () => resolve(new Blob(chunks, { type: 'video/webm' }));

      recorder.start();
      let frame = 0;
      const totalFrames = 30 * 6; // 6s

      const timer = setInterval(() => {
        const t = frame / 30;
        // Pure Green Screen background
        dctx.fillStyle = '#00ff00';
        dctx.fillRect(0, 0, 640, 360);

        // Moving character silhouette / avatar
        const cx = 320 + Math.sin(t * 3) * 40;
        const cy = 200;

        // Head
        dctx.fillStyle = '#f8fafc';
        dctx.beginPath();
        dctx.arc(cx, cy - 60, 40, 0, Math.PI * 2);
        dctx.fill();

        // Torso
        dctx.fillStyle = '#1e3a8a'; // Navy jacket
        dctx.beginPath();
        dctx.roundRect(cx - 50, cy - 15, 100, 140, 20);
        dctx.fill();

        // Badge
        dctx.fillStyle = '#f59e0b';
        dctx.font = 'bold 14px sans-serif';
        dctx.textAlign = 'center';
        dctx.fillText('PRESENTER', cx, cy + 40);

        frame++;
        if (frame >= totalFrames) {
          clearInterval(timer);
          recorder.stop();
        }
      }, 1000 / 30);
    });
  }

  dropZone.addEventListener('click', (e) => {
    if (e.target !== btnLoadDemo) videoInput.click();
  });
  dropZone.addEventListener('dragover', (e) => { e.preventDefault(); dropZone.style.borderColor = 'var(--accent)'; });
  dropZone.addEventListener('dragleave', () => { dropZone.style.borderColor = 'var(--border)'; });
  dropZone.addEventListener('drop', (e) => {
    e.preventDefault();
    dropZone.style.borderColor = 'var(--border)';
    const file = e.dataTransfer.files[0];
    if (file) loadVideo(URL.createObjectURL(file), file.name);
  });

  videoInput.addEventListener('change', (e) => {
    if (e.target.files[0]) {
      const file = e.target.files[0];
      loadVideo(URL.createObjectURL(file), file.name);
    }
  });

  btnLoadDemo.addEventListener('click', async (e) => {
    e.stopPropagation();
    btnLoadDemo.textContent = 'Generating green screen sample...';
    btnLoadDemo.disabled = true;
    const blob = await generateGreenScreenSample();
    loadVideo(URL.createObjectURL(blob), 'demo_greenscreen.webm');
  });

  btnPlayPause.addEventListener('click', () => {
    if (hiddenVideo.paused) {
      hiddenVideo.play();
      isPlaying = true;
      btnPlayPause.textContent = 'Pause';
      drawFrame();
    } else {
      hiddenVideo.pause();
      isPlaying = false;
      btnPlayPause.textContent = 'Play';
      cancelAnimationFrame(animId);
    }
  });

  hiddenVideo.addEventListener('ended', () => {
    isPlaying = false;
    btnPlayPause.textContent = 'Play';
  });

  seekBar.addEventListener('input', (e) => {
    if (videoDuration > 0) {
      hiddenVideo.currentTime = (e.target.value / 100) * videoDuration;
      drawFrame();
    }
  });

  btnToggleOriginal.addEventListener('click', () => {
    showOriginal = !showOriginal;
    btnToggleOriginal.textContent = showOriginal ? 'Show Matted' : 'Toggle Original';
    drawFrame();
  });

  btnPresetGreen.addEventListener('click', () => {
    keyColorInput.value = '#00ff00';
    drawFrame();
  });

  btnPresetBlue.addEventListener('click', () => {
    keyColorInput.value = '#0000ff';
    drawFrame();
  });

  sliderTolerance.addEventListener('input', (e) => {
    labelTolerance.textContent = `${e.target.value}%`;
    drawFrame();
  });

  keyColorInput.addEventListener('input', drawFrame);

  envChips.forEach(chip => {
    chip.addEventListener('click', () => {
      envChips.forEach(c => c.classList.remove('active'));
      chip.classList.add('active');
      currentEnv = chip.dataset.env;
      drawFrame();
    });
  });

  // Export Matched Video
  btnExportMatted.addEventListener('click', async () => {
    if (isExporting) return;
    isExporting = true;
    btnExportMatted.disabled = true;
    renderMsg.style.display = 'block';

    hiddenVideo.pause();
    isPlaying = false;
    hiddenVideo.currentTime = 0;

    const stream = canvas.captureStream(30);
    const recorder = new MediaRecorder(stream, { mimeType: 'video/webm' });
    const chunks = [];

    recorder.ondataavailable = e => { if (e.data.size > 0) chunks.push(e.data); };
    recorder.onstop = () => {
      const blob = new Blob(chunks, { type: 'video/webm' });
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = `${videoFileName}_background_removed.webm`;
      a.click();

      renderMsg.style.display = 'none';
      btnExportMatted.disabled = false;
      isExporting = false;
      hiddenVideo.currentTime = 0;
      drawFrame();
    };

    recorder.start();
    await hiddenVideo.play();
    isPlaying = true;

    const exportInterval = setInterval(() => {
      drawFrame();
      if (hiddenVideo.ended || hiddenVideo.currentTime >= videoDuration) {
        clearInterval(exportInterval);
        hiddenVideo.pause();
        isPlaying = false;
        if (recorder.state === 'recording') recorder.stop();
      }
    }, 1000 / 30);
  });
});