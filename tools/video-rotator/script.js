// Video Rotator & Orientation Studio - Client-side Canvas & MediaRecorder Engine

let videoFile = null;
let videoFileName = 'sample_video';
let videoFileSize = 0;
let duration = 0;
let originalWidth = 1280;
let originalHeight = 720;

let rotationAngle = 0; // 0, 90, 180, 270
let flipH = false;
let flipV = false;

let isPlaying = false;
let isExporting = false;
let activeSourceUrl = null;
let activeExportUrl = null;

// DOM Elements
const dropZone = document.getElementById('video-drop-zone');
const fileInput = document.getElementById('video-file-input');
const btnLoadDemo = document.getElementById('btn-load-demo');
const studioPanel = document.getElementById('video-studio-panel');
const btnChangeFile = document.getElementById('btn-change-file');

const fileTitle = document.getElementById('file-title');
const badgeResolution = document.getElementById('badge-resolution');
const badgeRotatedResolution = document.getElementById('badge-rotated-resolution');
const badgeDuration = document.getElementById('badge-duration');
const badgeFilesize = document.getElementById('badge-filesize');

const viewportWrapper = document.getElementById('viewport-wrapper');
const previewVideo = document.getElementById('preview-video');
const badgeAngle = document.getElementById('badge-angle');
const badgeMirror = document.getElementById('badge-mirror');

const btnPlayPause = document.getElementById('btn-play-pause');
const playIcon = document.getElementById('play-icon');
const playLabel = document.getElementById('play-label');
const btnStop = document.getElementById('btn-stop');
const checkLoop = document.getElementById('check-loop');
const videoSeekSlider = document.getElementById('video-seek-slider');
const videoTimeReadout = document.getElementById('video-time-readout');
const btnSnapshotFrame = document.getElementById('btn-snapshot-frame');

const btnRotateCcw = document.getElementById('btn-rotate-ccw');
const btnRotateCw = document.getElementById('btn-rotate-cw');
const btnRotate180 = document.getElementById('btn-rotate-180');
const btnRotateReset = document.getElementById('btn-rotate-reset');
const btnFlipH = document.getElementById('btn-flip-h');
const btnFlipV = document.getElementById('btn-flip-v');

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

// Generate animated directional demo video
async function generateDemoVideo() {
  return new Promise((resolve) => {
    const canvas = document.createElement('canvas');
    canvas.width = 640;
    canvas.height = 360;
    const ctx = canvas.getContext('2d');

    // Create audio beep oscillator track
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    const audioCtx = new AudioContextClass();
    const dest = audioCtx.createMediaStreamDestination();
    const osc = audioCtx.createOscillator();
    const oscGain = audioCtx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(440, audioCtx.currentTime);
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
      resolve({ blob, name: 'demo_orientation_test.webm', size: blob.size });
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
        osc.frequency.setValueAtTime(660, audioCtx.currentTime);
      } else if (frame % 30 === 5) {
        osc.frequency.setValueAtTime(440, audioCtx.currentTime);
      }

      // Background gradient
      const grad = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
      grad.addColorStop(0, '#0f172a');
      grad.addColorStop(1, '#1e293b');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Grid
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
      ctx.lineWidth = 1;
      for (let x = 0; x < canvas.width; x += 40) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvas.height);
        ctx.stroke();
      }
      for (let y = 0; y < canvas.height; y += 40) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
        ctx.stroke();
      }

      // Direction labels
      ctx.font = 'bold 18px Inter, sans-serif';
      ctx.fillStyle = '#f43f5e';
      ctx.textAlign = 'center';
      ctx.fillText('▲ TOP / CEILING ▲', canvas.width / 2, 35);

      ctx.fillStyle = '#10b981';
      ctx.fillText('▼ BOTTOM / FLOOR ▼', canvas.width / 2, canvas.height - 20);

      ctx.font = 'bold 16px Inter, sans-serif';
      ctx.fillStyle = '#38bdf8';
      ctx.textAlign = 'left';
      ctx.fillText('◀ LEFT', 20, canvas.height / 2);

      ctx.fillStyle = '#fbbf24';
      ctx.textAlign = 'right';
      ctx.fillText('RIGHT ▶', canvas.width - 20, canvas.height / 2);

      // Center compass rotating radar
      const cx = canvas.width / 2;
      const cy = canvas.height / 2;
      const angle = (t * 2) % (2 * Math.PI);

      ctx.beginPath();
      ctx.arc(cx, cy, 60, 0, 2 * Math.PI);
      ctx.strokeStyle = '#4e85bf';
      ctx.lineWidth = 3;
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.lineTo(cx + Math.cos(angle) * 55, cy + Math.sin(angle) * 55);
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 4;
      ctx.stroke();

      // Timestamp & Timer text
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 24px monospace';
      ctx.textAlign = 'center';
      ctx.fillText(`00:0${Math.floor(t)}.${String(Math.floor((t % 1) * 10)).padStart(2, '0')}`, cx, cy + 90);

      ctx.font = '13px monospace';
      ctx.fillStyle = '#94a3b8';
      ctx.fillText('ORIENTATION TEST PATTERN', cx, cy - 80);

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

  previewVideo.src = activeSourceUrl;
  previewVideo.load();

  previewVideo.onloadedmetadata = () => {
    duration = previewVideo.duration;
    originalWidth = previewVideo.videoWidth || 1280;
    originalHeight = previewVideo.videoHeight || 720;

    fileTitle.textContent = fileName;
    badgeResolution.textContent = `Original: ${originalWidth} x ${originalHeight}`;
    badgeDuration.textContent = `Duration: ${formatTime(duration)}`;
    badgeFilesize.textContent = `Size: ${formatBytes(videoFileSize)}`;

    // Reset rotation & flip
    rotationAngle = 0;
    flipH = false;
    flipV = false;
    btnFlipH.classList.remove('active');
    btnFlipV.classList.remove('active');

    studioPanel.style.display = 'flex';
    exportPanel.style.display = 'none';

    updateTransformPreview();
    updatePlaybackTimeUI();
    statusIndicator.textContent = 'Video loaded. Ready to transform orientation.';
  };
}

// Update Visual Transform on Preview Stage
function updateTransformPreview() {
  // Normalize angle between 0 and 360
  rotationAngle = ((rotationAngle % 360) + 360) % 360;

  const isPerpendicular = rotationAngle === 90 || rotationAngle === 270;
  const targetW = isPerpendicular ? originalHeight : originalWidth;
  const targetH = isPerpendicular ? originalWidth : originalHeight;

  badgeRotatedResolution.textContent = `Target: ${targetW} x ${targetH}`;
  badgeAngle.textContent = `${rotationAngle}° Rotation`;

  let mirrorStr = 'No Mirror';
  if (flipH && flipV) mirrorStr = 'Flip X + Y';
  else if (flipH) mirrorStr = 'Flip X (Horizontal)';
  else if (flipV) mirrorStr = 'Flip Y (Vertical)';
  badgeMirror.textContent = mirrorStr;

  // Compute scale so rotated video fits nicely inside stage viewport
  const viewportW = viewportWrapper.clientWidth || 800;
  const viewportH = viewportWrapper.clientHeight || 480;

  let fitScale = 1;
  if (isPerpendicular) {
    // When swapped, scale factor fits the rotated height into viewport height and width into viewport width
    const aspect = originalWidth / originalHeight;
    const maxAllowedScale = Math.min((viewportH * 0.9) / originalWidth, (viewportW * 0.9) / originalHeight);
    fitScale = Math.min(1, maxAllowedScale * 1.5);
  }

  const scaleX = (flipH ? -1 : 1) * fitScale;
  const scaleY = (flipV ? -1 : 1) * fitScale;

  previewVideo.style.transform = `rotate(${rotationAngle}deg) scale(${scaleX}, ${scaleY})`;
}

// Rotation Control Actions
btnRotateCw.addEventListener('click', () => {
  rotationAngle = (rotationAngle + 90) % 360;
  updateTransformPreview();
});

btnRotateCcw.addEventListener('click', () => {
  rotationAngle = (rotationAngle - 90 + 360) % 360;
  updateTransformPreview();
});

btnRotate180.addEventListener('click', () => {
  rotationAngle = (rotationAngle + 180) % 360;
  updateTransformPreview();
});

btnRotateReset.addEventListener('click', () => {
  rotationAngle = 0;
  flipH = false;
  flipV = false;
  btnFlipH.classList.remove('active');
  btnFlipV.classList.remove('active');
  updateTransformPreview();
});

btnFlipH.addEventListener('click', () => {
  flipH = !flipH;
  btnFlipH.classList.toggle('active', flipH);
  updateTransformPreview();
});

btnFlipV.addEventListener('click', () => {
  flipV = !flipV;
  btnFlipV.classList.toggle('active', flipV);
  updateTransformPreview();
});

// Video Playback Controls
btnPlayPause.addEventListener('click', () => {
  if (previewVideo.paused) {
    previewVideo.play();
    isPlaying = true;
    playIcon.innerHTML = '<rect x="6" y="4" width="4" height="16"></rect><rect x="14" y="4" width="4" height="16"></rect>';
    playLabel.textContent = 'Pause';
  } else {
    previewVideo.pause();
    isPlaying = false;
    playIcon.innerHTML = '<polygon points="5 3 19 12 5 21 5 3"></polygon>';
    playLabel.textContent = 'Play';
  }
});

btnStop.addEventListener('click', () => {
  previewVideo.pause();
  previewVideo.currentTime = 0;
  isPlaying = false;
  playIcon.innerHTML = '<polygon points="5 3 19 12 5 21 5 3"></polygon>';
  playLabel.textContent = 'Play';
  updatePlaybackTimeUI();
});

checkLoop.addEventListener('change', () => {
  previewVideo.loop = checkLoop.checked;
});

previewVideo.addEventListener('timeupdate', () => {
  updatePlaybackTimeUI();
});

previewVideo.addEventListener('ended', () => {
  if (!checkLoop.checked) {
    isPlaying = false;
    playIcon.innerHTML = '<polygon points="5 3 19 12 5 21 5 3"></polygon>';
    playLabel.textContent = 'Play';
  }
});

function updatePlaybackTimeUI() {
  const cur = previewVideo.currentTime || 0;
  const tot = previewVideo.duration || 0;
  videoTimeReadout.textContent = `${formatTime(cur)} / ${formatTime(tot)}`;

  if (tot > 0) {
    videoSeekSlider.value = (cur / tot) * 100;
  }
}

videoSeekSlider.addEventListener('input', (e) => {
  if (previewVideo.duration) {
    previewVideo.currentTime = (parseFloat(e.target.value) / 100) * previewVideo.duration;
  }
});

// Snapshot Rotated Frame as PNG
btnSnapshotFrame.addEventListener('click', () => {
  if (!previewVideo || !previewVideo.videoWidth) return;

  const isPerpendicular = rotationAngle === 90 || rotationAngle === 270;
  const targetW = isPerpendicular ? originalHeight : originalWidth;
  const targetH = isPerpendicular ? originalWidth : originalHeight;

  const canvas = document.createElement('canvas');
  canvas.width = targetW;
  canvas.height = targetH;
  const ctx = canvas.getContext('2d');

  ctx.save();
  ctx.translate(targetW / 2, targetH / 2);
  ctx.rotate((rotationAngle * Math.PI) / 180);
  ctx.scale(flipH ? -1 : 1, flipV ? -1 : 1);
  ctx.drawImage(previewVideo, -originalWidth / 2, -originalHeight / 2, originalWidth, originalHeight);
  ctx.restore();

  const dataUrl = canvas.toDataURL('image/png');
  const a = document.createElement('a');
  a.href = dataUrl;
  a.download = `${videoFileName}_rotated_${rotationAngle}deg_snapshot.png`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
});

// Render & Export Rotated Video via MediaRecorder
btnExportVideo.addEventListener('click', async () => {
  if (!previewVideo || isExporting) return;

  try {
    isExporting = true;
    btnExportVideo.disabled = true;
    previewVideo.pause();

    progressContainer.style.display = 'block';
    progressFill.style.width = '5%';
    statusIndicator.textContent = 'Initializing canvas rendering pipeline...';

    const isPerpendicular = rotationAngle === 90 || rotationAngle === 270;
    let targetW = isPerpendicular ? originalHeight : originalWidth;
    let targetH = isPerpendicular ? originalWidth : originalHeight;

    // Cap maximum dimensions to 1920 to maintain high framerate
    const maxDim = 1920;
    if (targetW > maxDim || targetH > maxDim) {
      const scale = maxDim / Math.max(targetW, targetH);
      targetW = Math.round(targetW * scale);
      targetH = Math.round(targetH * scale);
    }
    // Canvas dimensions must be even for video codecs
    targetW = targetW % 2 === 0 ? targetW : targetW + 1;
    targetH = targetH % 2 === 0 ? targetH : targetH + 1;

    const renderCanvas = document.createElement('canvas');
    renderCanvas.width = targetW;
    renderCanvas.height = targetH;
    const ctx = renderCanvas.getContext('2d', { alpha: false });

    // Setup Media Stream from Canvas
    const canvasStream = renderCanvas.captureStream(30);

    // Capture audio if available
    try {
      let audioStream = null;
      if (typeof previewVideo.captureStream === 'function') {
        audioStream = previewVideo.captureStream();
      } else if (typeof previewVideo.mozCaptureStream === 'function') {
        audioStream = previewVideo.mozCaptureStream();
      }

      if (audioStream && audioStream.getAudioTracks().length > 0) {
        canvasStream.addTrack(audioStream.getAudioTracks()[0]);
      }
    } catch (e) {
      console.warn('Could not extract direct audio track, proceeding with video stream:', e);
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
    previewVideo.currentTime = 0;
    previewVideo.muted = false; // allow audio stream to play into recorder if needed

    await new Promise((resolve) => {
      previewVideo.addEventListener('seeked', resolve, { once: true });
    });

    recorder.start();
    await previewVideo.play();

    // Render loop
    function drawFrame() {
      if (!isExporting) return;

      // Draw transformed frame
      ctx.fillStyle = '#000000';
      ctx.fillRect(0, 0, targetW, targetH);

      ctx.save();
      ctx.translate(targetW / 2, targetH / 2);
      ctx.rotate((rotationAngle * Math.PI) / 180);
      ctx.scale(flipH ? -1 : 1, flipV ? -1 : 1);

      const drawW = isPerpendicular ? targetH : targetW;
      const drawH = isPerpendicular ? targetW : targetH;
      ctx.drawImage(previewVideo, -drawW / 2, -drawH / 2, drawW, drawH);
      ctx.restore();

      const progress = Math.min(99, Math.round((previewVideo.currentTime / duration) * 100));
      progressFill.style.width = `${progress}%`;
      statusIndicator.textContent = `Rendering frame: ${formatTime(previewVideo.currentTime)} / ${formatTime(duration)} (${progress}%)...`;

      if (previewVideo.ended || previewVideo.currentTime >= duration - 0.05) {
        finishExport();
      } else {
        requestAnimationFrame(drawFrame);
      }
    }

    function finishExport() {
      if (!isExporting) return;
      previewVideo.pause();
      setTimeout(() => {
        if (recorder.state === 'recording') recorder.stop();
      }, 150);
    }

    requestAnimationFrame(drawFrame);

    const resultBlob = await exportPromise;
    progressFill.style.width = '100%';
    statusIndicator.textContent = 'Rotated video exported successfully!';

    if (activeExportUrl) {
      URL.revokeObjectURL(activeExportUrl);
    }
    activeExportUrl = URL.createObjectURL(resultBlob);

    const downloadFileName = `${videoFileName}_rotated_${rotationAngle}deg.webm`;
    exportVideoPlayer.src = activeExportUrl;
    btnDownloadExport.href = activeExportUrl;
    btnDownloadExport.download = downloadFileName;

    exportMetaBadge.textContent = `WebM • ${targetW} x ${targetH} • ${formatBytes(resultBlob.size)}`;
    exportPanel.style.display = 'flex';

    // Auto trigger download
    const autoLink = document.createElement('a');
    autoLink.href = activeExportUrl;
    autoLink.download = downloadFileName;
    document.body.appendChild(autoLink);
    autoLink.click();
    document.body.removeChild(autoLink);

  } catch (err) {
    console.error('Video export error:', err);
    alert('Failed to export rotated video: ' + err.message);
    statusIndicator.textContent = 'Export failed.';
  } finally {
    isExporting = false;
    btnExportVideo.disabled = false;
    previewVideo.currentTime = 0;
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
  statusIndicator.textContent = 'Synthesizing directional compass demo video...';
  progressContainer.style.display = 'block';
  progressFill.style.width = '40%';

  const demo = await generateDemoVideo();
  loadVideoBlob(demo.blob, demo.name, demo.size);

  progressContainer.style.display = 'none';
  progressFill.style.width = '0%';
});