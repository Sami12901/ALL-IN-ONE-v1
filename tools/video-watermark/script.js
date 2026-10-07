// Video Watermark Processor - 100% Client-Side
document.addEventListener('DOMContentLoaded', () => {
  let videoDuration = 0;
  let videoFileName = 'watermarked_video';
  let isPlaying = false;
  let watermarkMode = 'text'; // 'text' | 'image'
  let logoImg = null;
  let selectedPos = 'bottom-right';
  let isExporting = false;
  let animId = null;

  const dropZone = document.getElementById('drop-zone');
  const videoInput = document.getElementById('video-input');
  const btnLoadDemo = document.getElementById('btn-load-demo');
  const studio = document.getElementById('studio');

  const canvas = document.getElementById('stage-canvas');
  const ctx = canvas.getContext('2d');
  const hiddenVideo = document.getElementById('hidden-video');

  const btnPlayPause = document.getElementById('btn-play-pause');
  const seekBar = document.getElementById('seek-bar');
  const timeDisplay = document.getElementById('time-display');

  const tabText = document.getElementById('tab-text');
  const tabImage = document.getElementById('tab-image');
  const textControls = document.getElementById('text-controls');
  const imageControls = document.getElementById('image-controls');

  const watermarkText = document.getElementById('watermark-text');
  const fontSize = document.getElementById('font-size');
  const textColor = document.getElementById('text-color');
  const logoFileInput = document.getElementById('logo-file-input');
  const logoScale = document.getElementById('logo-scale');

  const posBtns = document.querySelectorAll('.pos-btn');
  const watermarkOpacity = document.getElementById('watermark-opacity');
  const opacityVal = document.getElementById('opacity-val');
  const watermarkRotation = document.getElementById('watermark-rotation');
  const rotationVal = document.getElementById('rotation-val');
  const checkTileGrid = document.getElementById('check-tile-grid');

  const btnExportWatermark = document.getElementById('btn-export-watermark');
  const exportMsg = document.getElementById('export-msg');

  function formatSec(s) {
    if (isNaN(s) || s < 0) s = 0;
    const m = Math.floor(s / 60);
    const sec = Math.floor(s % 60);
    return `${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`;
  }

  function getCoordinates(targetW, targetH, elemW, elemH, pos) {
    const margin = 24;
    let x = margin;
    let y = margin;

    if (pos.includes('center')) {
      if (pos === 'top-center' || pos === 'bottom-center' || pos === 'center') {
        x = (targetW - elemW) / 2;
      }
    }
    if (pos.includes('right')) {
      x = targetW - elemW - margin;
    }
    if (pos.includes('center-') || pos === 'center') {
      y = (targetH - elemH) / 2;
    }
    if (pos.includes('bottom')) {
      y = targetH - elemH - margin;
    }

    return { x, y };
  }

  function drawCanvas() {
    if (!hiddenVideo.videoWidth) return;

    if (canvas.width !== hiddenVideo.videoWidth || canvas.height !== hiddenVideo.videoHeight) {
      canvas.width = hiddenVideo.videoWidth || 640;
      canvas.height = hiddenVideo.videoHeight || 360;
    }

    ctx.drawImage(hiddenVideo, 0, 0, canvas.width, canvas.height);

    // Draw Watermark
    ctx.save();
    const opacity = parseFloat(watermarkOpacity.value);
    ctx.globalAlpha = opacity;

    const angle = (parseFloat(watermarkRotation.value) * Math.PI) / 180;

    if (checkTileGrid.checked) {
      // Security Repeat Pattern
      ctx.fillStyle = textColor.value;
      const fSize = parseInt(fontSize.value, 10);
      ctx.font = `bold ${fSize}px sans-serif`;
      ctx.textAlign = 'center';
      ctx.rotate((-25 * Math.PI) / 180);

      const text = watermarkText.value || 'COPYRIGHT';
      for (let y = -canvas.height; y < canvas.height * 2; y += 100) {
        for (let x = -canvas.width; x < canvas.width * 2; x += 260) {
          ctx.fillText(text, x, y);
        }
      }
    } else {
      if (watermarkMode === 'text') {
        const fSize = parseInt(fontSize.value, 10) * (canvas.width / 640);
        ctx.font = `600 ${fSize}px Inter, sans-serif`;
        const text = watermarkText.value || 'WATERMARK';
        const metrics = ctx.measureText(text);
        const textW = metrics.width;
        const textH = fSize;

        const { x, y } = getCoordinates(canvas.width, canvas.height, textW, textH, selectedPos);

        const cx = x + textW / 2;
        const cy = y + textH / 2;

        ctx.translate(cx, cy);
        if (angle !== 0) ctx.rotate(angle);

        // Text shadow
        ctx.shadowColor = 'rgba(0,0,0,0.8)';
        ctx.shadowBlur = 6;
        ctx.shadowOffsetX = 2;
        ctx.shadowOffsetY = 2;

        ctx.fillStyle = textColor.value;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(text, 0, 0);
      } else if (watermarkMode === 'image' && logoImg) {
        const scale = parseFloat(logoScale.value);
        const imgW = logoImg.width * scale * (canvas.width / 640);
        const imgH = logoImg.height * scale * (canvas.width / 640);

        const { x, y } = getCoordinates(canvas.width, canvas.height, imgW, imgH, selectedPos);
        const cx = x + imgW / 2;
        const cy = y + imgH / 2;

        ctx.translate(cx, cy);
        if (angle !== 0) ctx.rotate(angle);
        ctx.drawImage(logoImg, -imgW / 2, -imgH / 2, imgW, imgH);
      }
    }

    ctx.restore();

    // Timeline updates
    if (videoDuration > 0 && !seekBar.matches(':active')) {
      seekBar.value = (hiddenVideo.currentTime / videoDuration) * 100;
    }
    timeDisplay.textContent = `${formatSec(hiddenVideo.currentTime)} / ${formatSec(videoDuration)}`;

    if (isPlaying) {
      animId = requestAnimationFrame(drawCanvas);
    }
  }

  function loadVideo(url, name) {
    videoFileName = (name || 'video').replace(/\.[^/.]+$/, '');
    hiddenVideo.src = url;
    hiddenVideo.onloadedmetadata = () => {
      videoDuration = hiddenVideo.duration;
      canvas.width = hiddenVideo.videoWidth || 640;
      canvas.height = hiddenVideo.videoHeight || 360;
      dropZone.style.display = 'none';
      studio.style.display = 'grid';
      hiddenVideo.currentTime = 0;
      drawCanvas();
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
        dctx.fillStyle = '#0b132b';
        dctx.fillRect(0, 0, 640, 360);

        // Rotating gradient rings
        dctx.strokeStyle = `hsl(${(t * 50) % 360}, 80%, 60%)`;
        dctx.lineWidth = 4;
        dctx.beginPath();
        dctx.arc(320, 180, 80 + Math.sin(t * 3) * 20, 0, Math.PI * 2);
        dctx.stroke();

        dctx.fillStyle = '#ffffff';
        dctx.font = 'bold 24px sans-serif';
        dctx.textAlign = 'center';
        dctx.fillText('ORIGINAL CREATIVE ASSET', 320, 60);

        frame++;
        if (frame >= totalFrames) {
          clearInterval(timer);
          recorder.stop();
        }
      }, 1000 / 30);
    });
  }

  // Events
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
    btnLoadDemo.textContent = 'Generating sample clip...';
    btnLoadDemo.disabled = true;
    const blob = await generateSampleVideo();
    loadVideo(URL.createObjectURL(blob), 'demo_clip.webm');
  });

  btnPlayPause.addEventListener('click', () => {
    if (hiddenVideo.paused) {
      hiddenVideo.play();
      isPlaying = true;
      btnPlayPause.textContent = 'Pause';
      drawCanvas();
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
      drawCanvas();
    }
  });

  tabText.addEventListener('click', () => {
    tabText.classList.add('active');
    tabImage.classList.remove('active');
    textControls.style.display = 'flex';
    imageControls.style.display = 'none';
    watermarkMode = 'text';
    drawCanvas();
  });

  tabImage.addEventListener('click', () => {
    tabImage.classList.add('active');
    tabText.classList.remove('active');
    textControls.style.display = 'none';
    imageControls.style.display = 'flex';
    watermarkMode = 'image';
    drawCanvas();
  });

  logoFileInput.addEventListener('change', (e) => {
    if (e.target.files[0]) {
      const img = new Image();
      img.onload = () => {
        logoImg = img;
        drawCanvas();
      };
      img.src = URL.createObjectURL(e.target.files[0]);
    }
  });

  posBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      posBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      selectedPos = btn.dataset.pos;
      drawCanvas();
    });
  });

  [watermarkText, fontSize, textColor, logoScale, checkTileGrid].forEach(el => {
    el.addEventListener('input', drawCanvas);
  });

  watermarkOpacity.addEventListener('input', (e) => {
    opacityVal.textContent = `${Math.round(e.target.value * 100)}%`;
    drawCanvas();
  });

  watermarkRotation.addEventListener('input', (e) => {
    rotationVal.textContent = `${e.target.value}°`;
    drawCanvas();
  });

  // Export Watermarked Video
  btnExportWatermark.addEventListener('click', async () => {
    if (isExporting) return;
    isExporting = true;
    btnExportWatermark.disabled = true;
    exportMsg.style.display = 'block';

    hiddenVideo.pause();
    isPlaying = false;
    hiddenVideo.currentTime = 0;

    const stream = canvas.captureStream(30);
    const mediaRecorder = new MediaRecorder(stream, { mimeType: 'video/webm' });
    const chunks = [];

    mediaRecorder.ondataavailable = e => { if (e.data.size > 0) chunks.push(e.data); };
    mediaRecorder.onstop = () => {
      const blob = new Blob(chunks, { type: 'video/webm' });
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = `watermarked_${videoFileName}.webm`;
      a.click();

      exportMsg.style.display = 'none';
      btnExportWatermark.disabled = false;
      isExporting = false;
      hiddenVideo.currentTime = 0;
      drawCanvas();
    };

    mediaRecorder.start();
    await hiddenVideo.play();
    isPlaying = true;

    const exportLoop = setInterval(() => {
      drawCanvas();
      if (hiddenVideo.ended || hiddenVideo.currentTime >= videoDuration) {
        clearInterval(exportLoop);
        hiddenVideo.pause();
        isPlaying = false;
        if (mediaRecorder.state === 'recording') mediaRecorder.stop();
      }
    }, 1000 / 30);
  });
});