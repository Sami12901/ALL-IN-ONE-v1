// Video Resizer & Aspect Ratio Scaler - Client-side Canvas & MediaRecorder Engine

let videoFile = null;
let videoFileName = 'sample_video';
let videoFileSize = 0;
let duration = 0;
let origWidth = 1920;
let origHeight = 1080;

let targetWidth = 1080;
let targetHeight = 1920;
let fitMode = 'fit'; // 'fit', 'fill', 'stretch'
let lockAspect = true;
let currentAspectRatioNum = 9 / 16;

let isPlaying = false;
let isExporting = false;
let activeSourceUrl = null;
let activeExportUrl = null;
let previewAnimId = null;

// DOM Elements
const dropZone = document.getElementById('video-drop-zone');
const fileInput = document.getElementById('video-file-input');
const btnLoadDemo = document.getElementById('btn-load-demo');
const studioPanel = document.getElementById('video-studio-panel');
const btnChangeFile = document.getElementById('btn-change-file');

const fileTitle = document.getElementById('file-title');
const badgeOrigRes = document.getElementById('badge-orig-res');
const badgeTargetRes = document.getElementById('badge-target-res');
const badgeDuration = document.getElementById('badge-duration');
const badgeFilesize = document.getElementById('badge-filesize');

const sourceVideo = document.getElementById('source-video');
const previewCanvas = document.getElementById('preview-canvas');
const badgeAspectRatio = document.getElementById('badge-aspect-ratio');
const badgeFitMode = document.getElementById('badge-fit-mode');

const btnPlayPause = document.getElementById('btn-play-pause');
const playIcon = document.getElementById('play-icon');
const playLabel = document.getElementById('play-label');
const btnStop = document.getElementById('btn-stop');
const checkLoop = document.getElementById('check-loop');
const videoSeekSlider = document.getElementById('video-seek-slider');
const videoTimeReadout = document.getElementById('video-time-readout');
const btnSnapshotFrame = document.getElementById('btn-snapshot-frame');

const aspectPills = document.querySelectorAll('.aspect-pill');
const inputTargetWidth = document.getElementById('input-target-width');
const inputTargetHeight = document.getElementById('input-target-height');
const checkLockAspect = document.getElementById('check-lock-aspect');
const selectFitMode = document.getElementById('select-fit-mode');

const btnScale100 = document.getElementById('btn-scale-100');
const btnScale75 = document.getElementById('btn-scale-75');
const btnScale50 = document.getElementById('btn-scale-50');

const progressContainer = document.getElementById('progress-container');
const progressFill = document.getElementById('progress-fill');
const statusIndicator = document.getElementById('status-indicator');
const btnExportVideo = document.getElementById('btn-export-video');

const exportPanel = document.getElementById('export-panel');
const exportMetaBadge = document.getElementById('export-meta-badge');
const exportVideoPlayer = document.getElementById('export-video-player');
const btnDownloadExport = document.getElementById('btn-download-export');

// Format utilities
function formatTime(sec) {
  if (isNaN(sec) || sec < 0) sec = 0;
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

function formatBytes(bytes) {
  if (!bytes || bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// Generate animated 16:9 demo video
async function generateDemoVideo() {
  return new Promise((resolve) => {
    const canvas = document.createElement('canvas');
    canvas.width = 640;
    canvas.height = 360;
    const ctx = canvas.getContext('2d');

    // Create audio chime oscillator track
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    const audioCtx = new AudioContextClass();
    const dest = audioCtx.createMediaStreamDestination();
    const osc = audioCtx.createOscillator();
    const oscGain = audioCtx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(523.25, audioCtx.currentTime); // C5
    oscGain.gain.setValueAtTime(0.08, audioCtx.currentTime);
    osc.connect(oscGain);
    oscGain.connect(dest);
    osc.start();

    const canvasStream = canvas.captureStream(30);
    if (dest.stream.getAudioTracks().length > 0) {
      canvasStream.addTrack(dest.stream.getAudioTracks()[0]);
    }

    let mimeType = 'video/webm;codecs=vp8,opus';
    if (!MediaRecorder.isTypeSupported(mimeType)) {
      mimeType = 'video/webm';
    }

    const mediaRecorder = new MediaRecorder(canvasStream, { mimeType });
    const chunks = [];

    mediaRecorder.ondataavailable = (e) => {
      if (e.data && e.data.size > 0) chunks.push(e.data);
    };

    mediaRecorder.onstop = () => {
      try {
        osc.stop();
        audioCtx.close();
      } catch (_) {}
      const blob = new Blob(chunks, { type: 'video/webm' });
      resolve({ blob, name: 'demo_widescreen_16x9.webm', size: blob.size });
    };

    mediaRecorder.start();

    const fps = 30;
    const durationSec = 6;
    const totalFrames = fps * durationSec;
    let frame = 0;

    const renderTimer = setInterval(() => {
      frame++;
      const t = frame / fps;

      // Pulse audio frequency on beat
      if (frame % 30 === 0) {
        osc.frequency.setValueAtTime(659.25, audioCtx.currentTime); // E5
      } else if (frame % 30 === 8) {
        osc.frequency.setValueAtTime(523.25, audioCtx.currentTime);
      }

      // Background
      const grad = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
      grad.addColorStop(0, '#1e1b4b');
      grad.addColorStop(0.5, '#312e81');
      grad.addColorStop(1, '#0f172a');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Moving animated circle in center
      const cx = canvas.width / 2 + Math.cos(t * 2) * 120;
      const cy = canvas.height / 2 + Math.sin(t * 3) * 50;

      ctx.beginPath();
      ctx.arc(cx, cy, 45, 0, 2 * Math.PI);
      ctx.fillStyle = '#4e85bf';
      ctx.shadowColor = 'rgba(78, 133, 191, 0.8)';
      ctx.shadowBlur = 20;
      ctx.fill();
      ctx.shadowBlur = 0;

      // Text Overlays
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 22px Inter, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('16:9 HD Widescreen Demo', canvas.width / 2, 70);

      ctx.font = 'bold 28px monospace';
      ctx.fillText(`00:0${Math.floor(t)}.${String(Math.floor((t % 1) * 10)).padStart(2, '0')}`, canvas.width / 2, canvas.height - 50);

      ctx.font = '13px monospace';
      ctx.fillStyle = '#a5b4fc';
      ctx.fillText('Aspect Ratio & Dimension Scaler Test', canvas.width / 2, 100);

      if (frame >= totalFrames) {
        clearInterval(renderTimer);
        setTimeout(() => {
          if (mediaRecorder.state === 'recording') mediaRecorder.stop();
        }, 150);
      }
    }, 1000 / fps);
  });
}

// Load Video file
function loadVideoBlob(blob, fileName, fileSize) {
  if (activeSourceUrl) {
    URL.revokeObjectURL(activeSourceUrl);
  }

  activeSourceUrl = URL.createObjectURL(blob);
  videoFile = blob;
  videoFileName = fileName.replace(/\.[^/.]+$/, '');
  videoFileSize = fileSize || blob.size;

  sourceVideo.src = activeSourceUrl;
  sourceVideo.load();

  sourceVideo.onloadedmetadata = () => {
    duration = sourceVideo.duration;
    origWidth = sourceVideo.videoWidth || 1920;
    origHeight = sourceVideo.videoHeight || 1080;

    fileTitle.textContent = fileName;
    const origAspect = (origWidth / origHeight).toFixed(2);
    badgeOrigRes.textContent = `Original: ${origWidth} x ${origHeight} (~${origAspect}:1)`;
    badgeDuration.textContent = `Duration: ${formatTime(duration)}`;
    badgeFilesize.textContent = `Size: ${formatBytes(videoFileSize)}`;

    // Default to 9:16 Vertical (TikTok/Reels)
    targetWidth = 1080;
    targetHeight = 1920;
    inputTargetWidth.value = targetWidth;
    inputTargetHeight.value = targetHeight;
    currentAspectRatioNum = 9 / 16;

    updateActiveAspectPill('9:16');
    syncCanvasDimensions();

    studioPanel.style.display = 'flex';
    exportPanel.style.display = 'none';

    updatePlaybackTimeUI();
    startPreviewLoop();
    statusIndicator.textContent = 'Video loaded. Ready to scale and frame.';
  };
}

// Sync Preview Canvas resolution and aspect ratio
function syncCanvasDimensions() {
  targetWidth = parseInt(inputTargetWidth.value, 10) || 1080;
  targetHeight = parseInt(inputTargetHeight.value, 10) || 1920;

  // Set internal canvas resolution
  previewCanvas.width = targetWidth;
  previewCanvas.height = targetHeight;

  badgeTargetRes.textContent = `Target: ${targetWidth} x ${targetHeight}`;

  // Update Aspect Ratio badge
  const ratioGcd = getSimplifiedRatio(targetWidth, targetHeight);
  badgeAspectRatio.textContent = `${ratioGcd}`;

  // Update fit mode badge
  let fitModeLabel = 'Fit (Letterbox)';
  if (fitMode === 'fill') fitModeLabel = 'Fill (Center Crop)';
  else if (fitMode === 'stretch') fitModeLabel = 'Stretch to Fit';
  badgeFitMode.textContent = fitModeLabel;

  renderFrameToCanvas(previewCanvas);
}

function getSimplifiedRatio(w, h) {
  function gcd(a, b) {
    return b === 0 ? a : gcd(b, a % b);
  }
  const r = gcd(w, h);
  const rw = w / r;
  const rh = h / r;
  if (rw <= 21 && rh <= 21) {
    return `${rw}:${rh}`;
  }
  return `${(w / h).toFixed(2)}:1`;
}

function updateActiveAspectPill(ratioStr) {
  aspectPills.forEach((pill) => {
    if (pill.dataset.ratio === ratioStr) {
      pill.classList.add('active');
    } else {
      pill.classList.remove('active');
    }
  });
}

// Real-time Preview Render Loop
function startPreviewLoop() {
  if (previewAnimId) {
    cancelAnimationFrame(previewAnimId);
  }

  function loop() {
    if (sourceVideo && !sourceVideo.paused && !sourceVideo.ended) {
      renderFrameToCanvas(previewCanvas);
      updatePlaybackTimeUI();
    }
    previewAnimId = requestAnimationFrame(loop);
  }
  previewAnimId = requestAnimationFrame(loop);
}

// Core Canvas Resizing and Framing Algorithm
function renderFrameToCanvas(targetCanvas) {
  if (!sourceVideo || !sourceVideo.videoWidth) return;

  const ctx = targetCanvas.getContext('2d');
  const tw = targetCanvas.width;
  const th = targetCanvas.height;
  const sw = sourceVideo.videoWidth;
  const sh = sourceVideo.videoHeight;

  // Clear canvas background (letterbox matte)
  ctx.fillStyle = '#000000';
  ctx.fillRect(0, 0, tw, th);

  if (fitMode === 'fit') {
    // Fit with Letterbox / Pillarbox
    const scale = Math.min(tw / sw, th / sh);
    const dw = sw * scale;
    const dh = sh * scale;
    const dx = (tw - dw) / 2;
    const dy = (th - dh) / 2;
    ctx.drawImage(sourceVideo, dx, dy, dw, dh);
  } else if (fitMode === 'fill') {
    // Fill and center crop
    const scale = Math.max(tw / sw, th / sh);
    const dw = sw * scale;
    const dh = sh * scale;
    const dx = (tw - dw) / 2;
    const dy = (th - dh) / 2;
    ctx.drawImage(sourceVideo, dx, dy, dw, dh);
  } else if (fitMode === 'stretch') {
    // Stretch to exact dimensions
    ctx.drawImage(sourceVideo, 0, 0, tw, th);
  }
}

// Aspect Ratio Pill Handlers
aspectPills.forEach((pill) => {
  pill.addEventListener('click', () => {
    const pw = parseInt(pill.dataset.w, 10);
    const ph = parseInt(pill.dataset.h, 10);
    inputTargetWidth.value = pw;
    inputTargetHeight.value = ph;
    currentAspectRatioNum = pw / ph;
    updateActiveAspectPill(pill.dataset.ratio);
    syncCanvasDimensions();
  });
});

// Custom Width / Height Inputs
inputTargetWidth.addEventListener('input', () => {
  const w = parseInt(inputTargetWidth.value, 10) || 1080;
  if (checkLockAspect.checked && currentAspectRatioNum > 0) {
    const h = Math.round(w / currentAspectRatioNum);
    inputTargetHeight.value = h % 2 === 0 ? h : h + 1;
  } else {
    currentAspectRatioNum = w / (parseInt(inputTargetHeight.value, 10) || 1080);
  }
  aspectPills.forEach((p) => p.classList.remove('active'));
  syncCanvasDimensions();
});

inputTargetHeight.addEventListener('input', () => {
  const h = parseInt(inputTargetHeight.value, 10) || 1920;
  if (checkLockAspect.checked && currentAspectRatioNum > 0) {
    const w = Math.round(h * currentAspectRatioNum);
    inputTargetWidth.value = w % 2 === 0 ? w : w + 1;
  } else {
    currentAspectRatioNum = (parseInt(inputTargetWidth.value, 10) || 1080) / h;
  }
  aspectPills.forEach((p) => p.classList.remove('active'));
  syncCanvasDimensions();
});

selectFitMode.addEventListener('change', (e) => {
  fitMode = e.target.value;
  syncCanvasDimensions();
});

// Quick Scale Buttons
btnScale100.addEventListener('click', () => {
  inputTargetWidth.value = origWidth;
  inputTargetHeight.value = origHeight;
  currentAspectRatioNum = origWidth / origHeight;
  aspectPills.forEach((p) => p.classList.remove('active'));
  syncCanvasDimensions();
});

btnScale75.addEventListener('click', () => {
  const w = Math.round(origWidth * 0.75);
  const h = Math.round(origHeight * 0.75);
  inputTargetWidth.value = w % 2 === 0 ? w : w + 1;
  inputTargetHeight.value = h % 2 === 0 ? h : h + 1;
  currentAspectRatioNum = origWidth / origHeight;
  aspectPills.forEach((p) => p.classList.remove('active'));
  syncCanvasDimensions();
});

btnScale50.addEventListener('click', () => {
  const w = Math.round(origWidth * 0.5);
  const h = Math.round(origHeight * 0.5);
  inputTargetWidth.value = w % 2 === 0 ? w : w + 1;
  inputTargetHeight.value = h % 2 === 0 ? h : h + 1;
  currentAspectRatioNum = origWidth / origHeight;
  aspectPills.forEach((p) => p.classList.remove('active'));
  syncCanvasDimensions();
});

// Video Playback Controls
btnPlayPause.addEventListener('click', () => {
  if (sourceVideo.paused) {
    sourceVideo.play();
    isPlaying = true;
    playIcon.innerHTML = '<rect x="6" y="4" width="4" height="16"></rect><rect x="14" y="4" width="4" height="16"></rect>';
    playLabel.textContent = 'Pause';
  } else {
    sourceVideo.pause();
    isPlaying = false;
    playIcon.innerHTML = '<polygon points="5 3 19 12 5 21 5 3"></polygon>';
    playLabel.textContent = 'Play';
  }
});

btnStop.addEventListener('click', () => {
  sourceVideo.pause();
  sourceVideo.currentTime = 0;
  isPlaying = false;
  playIcon.innerHTML = '<polygon points="5 3 19 12 5 21 5 3"></polygon>';
  playLabel.textContent = 'Play';
  renderFrameToCanvas(previewCanvas);
  updatePlaybackTimeUI();
});

checkLoop.addEventListener('change', () => {
  sourceVideo.loop = checkLoop.checked;
});

sourceVideo.addEventListener('timeupdate', () => {
  updatePlaybackTimeUI();
});

sourceVideo.addEventListener('ended', () => {
  if (!checkLoop.checked) {
    isPlaying = false;
    playIcon.innerHTML = '<polygon points="5 3 19 12 5 21 5 3"></polygon>';
    playLabel.textContent = 'Play';
  }
});

function updatePlaybackTimeUI() {
  const cur = sourceVideo.currentTime || 0;
  const tot = sourceVideo.duration || 0;
  videoTimeReadout.textContent = `${formatTime(cur)} / ${formatTime(tot)}`;

  if (tot > 0) {
    videoSeekSlider.value = (cur / tot) * 100;
  }
}

videoSeekSlider.addEventListener('input', (e) => {
  if (sourceVideo.duration) {
    sourceVideo.currentTime = (parseFloat(e.target.value) / 100) * sourceVideo.duration;
    renderFrameToCanvas(previewCanvas);
  }
});

// Snapshot Resized Frame as PNG
btnSnapshotFrame.addEventListener('click', () => {
  if (!sourceVideo || !sourceVideo.videoWidth) return;

  const snapCanvas = document.createElement('canvas');
  snapCanvas.width = targetWidth;
  snapCanvas.height = targetHeight;
  renderFrameToCanvas(snapCanvas);

  const dataUrl = snapCanvas.toDataURL('image/png');
  const a = document.createElement('a');
  a.href = dataUrl;
  a.download = `${videoFileName}_resized_${targetWidth}x${targetHeight}_snapshot.png`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
});

// Render & Export Resized Video via MediaRecorder
btnExportVideo.addEventListener('click', async () => {
  if (!sourceVideo || isExporting) return;

  try {
    isExporting = true;
    btnExportVideo.disabled = true;
    sourceVideo.pause();

    progressContainer.style.display = 'block';
    progressFill.style.width = '5%';
    statusIndicator.textContent = 'Setting up video canvas encoder...';

    // Even dimensions are required for WebM / H264
    let exportW = targetWidth % 2 === 0 ? targetWidth : targetWidth + 1;
    let exportH = targetHeight % 2 === 0 ? targetHeight : targetHeight + 1;

    // Cap maximum dimension to 1920 to maintain high framerate
    const maxDim = 1920;
    if (exportW > maxDim || exportH > maxDim) {
      const scale = maxDim / Math.max(exportW, exportH);
      exportW = Math.round(exportW * scale);
      exportH = Math.round(exportH * scale);
      exportW = exportW % 2 === 0 ? exportW : exportW + 1;
      exportH = exportH % 2 === 0 ? exportH : exportH + 1;
    }

    const renderCanvas = document.createElement('canvas');
    renderCanvas.width = exportW;
    renderCanvas.height = exportH;

    const canvasStream = renderCanvas.captureStream(30);

    // Capture audio if available
    try {
      let audioStream = null;
      if (typeof sourceVideo.captureStream === 'function') {
        audioStream = sourceVideo.captureStream();
      } else if (typeof sourceVideo.mozCaptureStream === 'function') {
        audioStream = sourceVideo.mozCaptureStream();
      }

      if (audioStream && audioStream.getAudioTracks().length > 0) {
        canvasStream.addTrack(audioStream.getAudioTracks()[0]);
      }
    } catch (e) {
      console.warn('Could not extract audio track:', e);
    }

    let mimeType = 'video/webm;codecs=vp9,opus';
    if (!MediaRecorder.isTypeSupported(mimeType)) {
      mimeType = 'video/webm;codecs=vp8,opus';
      if (!MediaRecorder.isTypeSupported(mimeType)) {
        mimeType = 'video/webm';
      }
    }

    const recorder = new MediaRecorder(canvasStream, {
      mimeType,
      videoBitsPerSecond: 6000000 // 6 Mbps
    });

    const chunks = [];
    recorder.ondataavailable = (e) => {
      if (e.data && e.data.size > 0) chunks.push(e.data);
    };

    const exportPromise = new Promise((resolve, reject) => {
      recorder.onstop = () => {
        const outBlob = new Blob(chunks, { type: 'video/webm' });
        resolve(outBlob);
      };
      recorder.onerror = reject;
    });

    // Reset video to start
    sourceVideo.currentTime = 0;
    sourceVideo.muted = false;

    await new Promise((resolve) => {
      sourceVideo.addEventListener('seeked', resolve, { once: true });
    });

    recorder.start();
    await sourceVideo.play();

    // Render loop
    function drawFrame() {
      if (!isExporting) return;

      renderFrameToCanvas(renderCanvas);

      const progress = Math.min(99, Math.round((sourceVideo.currentTime / duration) * 100));
      progressFill.style.width = `${progress}%`;
      statusIndicator.textContent = `Encoding resized video: ${formatTime(sourceVideo.currentTime)} / ${formatTime(duration)} (${progress}%)...`;

      if (sourceVideo.ended || sourceVideo.currentTime >= duration - 0.05) {
        finishExport();
      } else {
        requestAnimationFrame(drawFrame);
      }
    }

    function finishExport() {
      if (!isExporting) return;
      sourceVideo.pause();
      setTimeout(() => {
        if (recorder.state === 'recording') recorder.stop();
      }, 150);
    }

    requestAnimationFrame(drawFrame);

    const resultBlob = await exportPromise;
    progressFill.style.width = '100%';
    statusIndicator.textContent = 'Resized video exported successfully!';

    if (activeExportUrl) {
      URL.revokeObjectURL(activeExportUrl);
    }
    activeExportUrl = URL.createObjectURL(resultBlob);

    const downloadFileName = `${videoFileName}_resized_${exportW}x${exportH}.webm`;
    exportVideoPlayer.src = activeExportUrl;
    btnDownloadExport.href = activeExportUrl;
    btnDownloadExport.download = downloadFileName;

    exportMetaBadge.textContent = `WebM • ${exportW} x ${exportH} • ${formatBytes(resultBlob.size)}`;
    exportPanel.style.display = 'flex';

    // Auto trigger download
    const autoLink = document.createElement('a');
    autoLink.href = activeExportUrl;
    autoLink.download = downloadFileName;
    document.body.appendChild(autoLink);
    autoLink.click();
    document.body.removeChild(autoLink);

  } catch (err) {
    console.error('Video resizing error:', err);
    alert('Failed to export resized video: ' + err.message);
    statusIndicator.textContent = 'Export failed.';
  } finally {
    isExporting = false;
    btnExportVideo.disabled = false;
    sourceVideo.currentTime = 0;
    setTimeout(() => {
      progressContainer.style.display = 'none';
      progressFill.style.width = '0%';
    }, 1500);
  }
});

// File Upload Handlers
dropZone.addEventListener('click', () => fileInput.click());

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
  const file = e.dataTransfer.files[0];
  if (file) loadVideoBlob(file, file.name, file.size);
});

fileInput.addEventListener('change', (e) => {
  const file = e.target.files[0];
  if (file) loadVideoBlob(file, file.name, file.size);
});

btnChangeFile.addEventListener('click', () => {
  fileInput.click();
});

// Load Demo Video
btnLoadDemo.addEventListener('click', async () => {
  statusIndicator.textContent = 'Generating 16:9 widescreen demo video...';
  progressContainer.style.display = 'block';
  progressFill.style.width = '40%';

  const demo = await generateDemoVideo();
  loadVideoBlob(demo.blob, demo.name, demo.size);

  progressContainer.style.display = 'none';
  progressFill.style.width = '0%';
});