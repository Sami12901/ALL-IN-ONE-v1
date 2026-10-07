// AI Video Editor Studio - 100% Client-Side Engine
document.addEventListener('DOMContentLoaded', () => {
  let videoFileName = 'edited_video';
  let videoDuration = 0;
  let isPlaying = false;
  let isExporting = false;
  let selectedFilter = 'teal-orange';
  let selectedRatio = '16:9';
  let animId = null;

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
  const checkSplitCompare = document.getElementById('check-split-compare');

  const ratioBtns = document.querySelectorAll('.ratio-btn');
  const filterBtns = document.querySelectorAll('.filter-btn');

  const sliderBrightness = document.getElementById('slider-brightness');
  const sliderContrast = document.getElementById('slider-contrast');
  const sliderSaturate = document.getElementById('slider-saturate');
  const labelBrightness = document.getElementById('label-brightness');
  const labelContrast = document.getElementById('label-contrast');
  const labelSaturate = document.getElementById('label-saturate');

  const btnExportVideo = document.getElementById('btn-export-video');
  const renderMsg = document.getElementById('render-msg');

  function formatSec(s) {
    if (isNaN(s) || s < 0) s = 0;
    const m = Math.floor(s / 60);
    const sec = Math.floor(s % 60);
    return `${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`;
  }

  function getTargetCanvasSize() {
    if (selectedRatio === '9:16') return { width: 360, height: 640 };
    if (selectedRatio === '1:1') return { width: 480, height: 480 };
    if (selectedRatio === '4:5') return { width: 480, height: 600 };
    return { width: 640, height: 360 }; // 16:9 default
  }

  function applyFilterString() {
    const b = sliderBrightness.value;
    const c = sliderContrast.value;
    const s = sliderSaturate.value;

    let baseFilter = `brightness(${b}%) contrast(${c}%) saturate(${s}%)`;

    if (selectedFilter === 'teal-orange') {
      return `${baseFilter} hue-rotate(-15deg) contrast(120%) saturate(135%)`;
    }
    if (selectedFilter === 'golden-hour') {
      return `${baseFilter} sepia(25%) saturate(140%) contrast(110%)`;
    }
    if (selectedFilter === 'cyberpunk') {
      return `${baseFilter} hue-rotate(180deg) saturate(180%) contrast(130%)`;
    }
    if (selectedFilter === 'noir') {
      return `${baseFilter} grayscale(100%) contrast(150%)`;
    }
    if (selectedFilter === 'vintage') {
      return `${baseFilter} sepia(50%) contrast(90%) brightness(95%)`;
    }
    return baseFilter;
  }

  function drawFrame() {
    if (!hiddenVideo.videoWidth) return;

    const targetSize = getTargetCanvasSize();
    if (canvas.width !== targetSize.width || canvas.height !== targetSize.height) {
      canvas.width = targetSize.width;
      canvas.height = targetSize.height;
    }

    const vw = hiddenVideo.videoWidth;
    const vh = hiddenVideo.videoHeight;
    const cw = canvas.width;
    const ch = canvas.height;

    // Center Crop calculation
    const videoAspect = vw / vh;
    const canvasAspect = cw / ch;

    let sx = 0, sy = 0, sWidth = vw, sHeight = vh;
    if (videoAspect > canvasAspect) {
      sWidth = vh * canvasAspect;
      sx = (vw - sWidth) / 2;
    } else {
      sHeight = vw / canvasAspect;
      sy = (vh - sHeight) / 2;
    }

    if (checkSplitCompare.checked) {
      // Split mode: Left side Natural, Right side Filtered
      // 1. Draw natural frame on left
      ctx.save();
      ctx.filter = 'none';
      ctx.beginPath();
      ctx.rect(0, 0, cw / 2, ch);
      ctx.clip();
      ctx.drawImage(hiddenVideo, sx, sy, sWidth, sHeight, 0, 0, cw, ch);
      ctx.restore();

      // 2. Draw filtered frame on right
      ctx.save();
      ctx.filter = applyFilterString();
      ctx.beginPath();
      ctx.rect(cw / 2, 0, cw / 2, ch);
      ctx.clip();
      ctx.drawImage(hiddenVideo, sx, sy, sWidth, sHeight, 0, 0, cw, ch);
      ctx.restore();

      // Divider line
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(cw / 2, 0);
      ctx.lineTo(cw / 2, ch);
      ctx.stroke();

      // Labels
      ctx.font = 'bold 12px sans-serif';
      ctx.fillStyle = '#ffffff';
      ctx.fillText('BEFORE', cw / 2 - 60, 24);
      ctx.fillText('AI GRADED', cw / 2 + 10, 24);

    } else {
      // Full AI Graded frame
      ctx.save();
      ctx.filter = applyFilterString();
      ctx.drawImage(hiddenVideo, sx, sy, sWidth, sHeight, 0, 0, cw, ch);
      ctx.restore();
    }

    // Timeline update
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
      dropZone.style.display = 'none';
      studioView.style.display = 'grid';
      hiddenVideo.currentTime = 0;
      drawFrame();
    };
  }

  // Generate synthetic sample video
  async function generateSampleVideo() {
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
        // Natural landscape simulation
        const grad = dctx.createLinearGradient(0, 0, 0, 360);
        grad.addColorStop(0, '#38bdf8');
        grad.addColorStop(0.6, '#fde047');
        grad.addColorStop(1, '#059669');
        dctx.fillStyle = grad;
        dctx.fillRect(0, 0, 640, 360);

        // Sun
        dctx.fillStyle = '#ffffff';
        dctx.beginPath();
        dctx.arc(320 + Math.sin(t * 2) * 50, 140, 40, 0, Math.PI * 2);
        dctx.fill();

        dctx.fillStyle = '#0f172a';
        dctx.font = 'bold 24px sans-serif';
        dctx.textAlign = 'center';
        dctx.fillText('RAW FOOTAGE SAMPLE', 320, 60);

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
    btnLoadDemo.textContent = 'Generating sample...';
    btnLoadDemo.disabled = true;
    const blob = await generateSampleVideo();
    loadVideo(URL.createObjectURL(blob), 'demo_footage.webm');
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

  checkSplitCompare.addEventListener('change', drawFrame);

  ratioBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      ratioBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      selectedRatio = btn.dataset.ratio;
      drawFrame();
    });
  });

  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      selectedFilter = btn.dataset.filter;
      drawFrame();
    });
  });

  sliderBrightness.addEventListener('input', (e) => {
    labelBrightness.textContent = `${e.target.value}%`;
    drawFrame();
  });

  sliderContrast.addEventListener('input', (e) => {
    labelContrast.textContent = `${e.target.value}%`;
    drawFrame();
  });

  sliderSaturate.addEventListener('input', (e) => {
    labelSaturate.textContent = `${e.target.value}%`;
    drawFrame();
  });

  // Export Graded Video
  btnExportVideo.addEventListener('click', async () => {
    if (isExporting) return;
    isExporting = true;
    btnExportVideo.disabled = true;
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
      a.download = `${videoFileName}_graded_${selectedFilter}.webm`;
      a.click();

      renderMsg.style.display = 'none';
      btnExportVideo.disabled = false;
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