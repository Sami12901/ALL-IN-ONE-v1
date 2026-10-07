// Video Compressor - Client-Side Bitrate & Scale Optimizer
// ALL IN ONE Platform

let currentFile = null;
let currentFileName = 'sample_video.mp4';
let currentFileSize = 0;
let compressedBlob = null;
let isCompressing = false;
let shouldCancel = false;

// DOM Elements
const dropZone = document.getElementById('drop-zone');
const fileInput = document.getElementById('file-input');
const btnLoadDemo = document.getElementById('btn-load-demo');
const workspacePanel = document.getElementById('workspace-panel');

const sourceVideo = document.getElementById('source-video');
const compressCanvas = document.getElementById('compress-canvas');

const metricOriginalSize = document.getElementById('metric-original-size');
const metricTargetSize = document.getElementById('metric-target-size');
const metricSaving = document.getElementById('metric-saving');

const presetButtons = document.querySelectorAll('.quick-preset-btn');
const selectQualityTier = document.getElementById('select-quality-tier');
const targetSizeWrap = document.getElementById('target-size-wrap');
const inputTargetMb = document.getElementById('input-target-mb');
const selectScale = document.getElementById('select-scale');
const selectCompressFps = document.getElementById('select-compress-fps');
const selectAudioQuality = document.getElementById('select-audio-quality');

const btnStartCompress = document.getElementById('btn-start-compress');
const btnCancelCompress = document.getElementById('btn-cancel-compress');
const progressCard = document.getElementById('progress-card');
const progressFill = document.getElementById('progress-fill');
const progressPct = document.getElementById('progress-pct');
const progressStatus = document.getElementById('progress-status');
const progressDetail = document.getElementById('progress-detail');
const progressEta = document.getElementById('progress-eta');

const resultCard = document.getElementById('result-card');
const resBadgeSaved = document.getElementById('res-badge-saved');
const resSummary = document.getElementById('res-summary');
const btnDownloadCompressed = document.getElementById('btn-download-compressed');
const btnPlayCompressed = document.getElementById('btn-play-compressed');
const ffmpegCompressCode = document.getElementById('ffmpeg-compress-code');

// Helpers
function formatBytes(bytes) {
  if (!bytes || bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

function formatDuration(sec) {
  if (isNaN(sec) || sec < 0) return '00:00';
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

// Calculate target bitrate & update metrics
function updateEstimates() {
  if (!sourceVideo.duration) return;

  const duration = sourceVideo.duration;
  const originalBytes = currentFileSize || 10485760; // 10MB fallback
  let estimatedBytes = 0;
  let targetBitrate = 1500000;
  const audioBps = parseInt(selectAudioQuality.value, 10) * 1000;

  const mode = selectQualityTier.value;
  if (mode === 'custom-size') {
    const targetMb = parseFloat(inputTargetMb.value) || 15;
    estimatedBytes = targetMb * 1024 * 1024;
    const totalBits = estimatedBytes * 8;
    const audioBits = audioBps * duration;
    targetBitrate = Math.max(150000, Math.floor((totalBits - audioBits) / duration));
  } else if (mode === 'high') {
    targetBitrate = 3500000;
    estimatedBytes = Math.floor(((targetBitrate + audioBps) * duration) / 8);
  } else if (mode === 'medium') {
    targetBitrate = 1800000;
    estimatedBytes = Math.floor(((targetBitrate + audioBps) * duration) / 8);
  } else if (mode === 'strong') {
    targetBitrate = 900000;
    estimatedBytes = Math.floor(((targetBitrate + audioBps) * duration) / 8);
  } else if (mode === 'extreme') {
    targetBitrate = 450000;
    estimatedBytes = Math.floor(((targetBitrate + audioBps) * duration) / 8);
  }

  // Cap estimated bytes if greater than original
  estimatedBytes = Math.min(estimatedBytes, originalBytes * 0.95);

  metricOriginalSize.textContent = formatBytes(originalBytes);
  metricTargetSize.textContent = `~${formatBytes(estimatedBytes)}`;

  const savingsPct = Math.max(0, Math.round(((originalBytes - estimatedBytes) / originalBytes) * 100));
  metricSaving.textContent = `-${savingsPct}%`;

  // Update FFmpeg hint
  const scale = selectScale.value;
  const audioArg = audioBps > 0 ? `-c:a libopus -b:a ${audioBps / 1000}k` : '-an';
  ffmpegCompressCode.textContent = `ffmpeg -i "${currentFileName}" -b:v ${Math.round(targetBitrate / 1000)}k -vf "scale=iw*${scale}:ih*${scale}" ${audioArg} output_compressed.webm`;

  return targetBitrate;
}

// Preset Handlers
presetButtons.forEach(btn => {
  btn.addEventListener('click', () => {
    presetButtons.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');

    const preset = btn.dataset.preset;
    if (preset === 'discord') {
      selectQualityTier.value = 'custom-size';
      inputTargetMb.value = '24';
      targetSizeWrap.style.display = 'block';
      selectScale.value = '0.75';
      selectAudioQuality.value = '64';
    } else if (preset === 'whatsapp') {
      selectQualityTier.value = 'custom-size';
      inputTargetMb.value = '15';
      targetSizeWrap.style.display = 'block';
      selectScale.value = '0.75';
      selectAudioQuality.value = '64';
    } else if (preset === 'email') {
      selectQualityTier.value = 'custom-size';
      inputTargetMb.value = '9';
      targetSizeWrap.style.display = 'block';
      selectScale.value = '0.5';
      selectAudioQuality.value = '32';
    } else if (preset === 'balanced') {
      selectQualityTier.value = 'medium';
      targetSizeWrap.style.display = 'none';
      selectScale.value = '0.75';
      selectAudioQuality.value = '64';
    } else if (preset === 'extreme') {
      selectQualityTier.value = 'extreme';
      targetSizeWrap.style.display = 'none';
      selectScale.value = '0.5';
      selectAudioQuality.value = '32';
    }
    updateEstimates();
  });
});

selectQualityTier.addEventListener('change', () => {
  if (selectQualityTier.value === 'custom-size') {
    targetSizeWrap.style.display = 'block';
  } else {
    targetSizeWrap.style.display = 'none';
  }
  updateEstimates();
});

[inputTargetMb, selectScale, selectCompressFps, selectAudioQuality].forEach(el => {
  el.addEventListener('input', updateEstimates);
  el.addEventListener('change', updateEstimates);
});

// File Handling
dropZone.addEventListener('click', () => fileInput.click());
dropZone.addEventListener('dragover', e => { e.preventDefault(); dropZone.classList.add('dragover'); });
dropZone.addEventListener('dragleave', () => dropZone.classList.remove('dragover'));
dropZone.addEventListener('drop', e => {
  e.preventDefault();
  dropZone.classList.remove('dragover');
  const file = e.dataTransfer.files[0];
  if (file) handleVideoFile(file);
});
fileInput.addEventListener('change', e => {
  const file = e.target.files[0];
  if (file) handleVideoFile(file);
});

function handleVideoFile(file) {
  currentFile = file;
  currentFileName = file.name;
  currentFileSize = file.size;
  const url = URL.createObjectURL(file);
  loadVideoIntoPlayer(url, file.name, file.size);
}

function loadVideoIntoPlayer(url, name, size) {
  sourceVideo.src = url;
  sourceVideo.load();
  sourceVideo.onloadedmetadata = () => {
    workspacePanel.style.display = 'grid';
    resultCard.style.display = 'none';
    progressCard.style.display = 'none';
    updateEstimates();
  };
}

// Generate Demo Video
btnLoadDemo.addEventListener('click', async () => {
  btnLoadDemo.disabled = true;
  btnLoadDemo.textContent = 'Generating Demo...';

  const canvas = document.createElement('canvas');
  canvas.width = 1280;
  canvas.height = 720;
  const ctx = canvas.getContext('2d');
  const stream = canvas.captureStream(30);

  const recorder = new MediaRecorder(stream, { mimeType: 'video/webm' });
  const chunks = [];
  recorder.ondataavailable = e => { if (e.data.size > 0) chunks.push(e.data); };

  const totalFrames = 30 * 7; // 7 seconds
  let f = 0;
  recorder.start();

  const timer = setInterval(() => {
    f++;
    const t = f / 30;

    // High detail graphics (causes larger uncompressed stream)
    ctx.fillStyle = '#0b0f19';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    for (let i = 0; i < 40; i++) {
      ctx.fillStyle = `hsla(${(i * 12 + t * 50) % 360}, 80%, 60%, 0.4)`;
      ctx.beginPath();
      const x = (Math.sin(t + i) * 0.4 + 0.5) * canvas.width;
      const y = (Math.cos(t * 1.2 + i) * 0.4 + 0.5) * canvas.height;
      ctx.arc(x, y, 20 + Math.sin(t + i) * 15, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 42px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('VIDEO COMPRESSOR TEST RUN', canvas.width / 2, canvas.height / 2);

    ctx.fillStyle = '#94a3b8';
    ctx.font = '22px monospace';
    ctx.fillText(`Frame ${f} of ${totalFrames} | Time: ${t.toFixed(1)}s`, canvas.width / 2, canvas.height / 2 + 50);

    if (f >= totalFrames) {
      clearInterval(timer);
      recorder.stop();
    }
  }, 1000 / 30);

  recorder.onstop = () => {
    const blob = new Blob(chunks, { type: 'video/webm' });
    const url = URL.createObjectURL(blob);
    currentFile = blob;
    currentFileName = 'sample_high_detail.webm';
    currentFileSize = blob.size;
    loadVideoIntoPlayer(url, currentFileName, currentFileSize);
    btnLoadDemo.disabled = false;
    btnLoadDemo.innerHTML = '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" style="margin-right:0.4rem;"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg> Load Sample Video';
  };
});

// Start Compression Process
btnStartCompress.addEventListener('click', async () => {
  if (isCompressing) return;
  isCompressing = true;
  shouldCancel = false;

  btnStartCompress.disabled = true;
  btnCancelCompress.style.display = 'block';
  progressCard.style.display = 'block';
  resultCard.style.display = 'none';

  const scaleFactor = parseFloat(selectScale.value) || 0.75;
  const targetW = Math.floor((sourceVideo.videoWidth * scaleFactor) / 2) * 2;
  const targetH = Math.floor((sourceVideo.videoHeight * scaleFactor) / 2) * 2;

  compressCanvas.width = targetW;
  compressCanvas.height = targetH;
  const ctx = compressCanvas.getContext('2d');

  const fps = selectCompressFps.value === 'original' ? 30 : parseInt(selectCompressFps.value, 10);
  const targetBitrate = updateEstimates() || 1200000;
  const audioBps = parseInt(selectAudioQuality.value, 10) * 1000;

  const canvasStream = compressCanvas.captureStream(fps);

  // Audio forwarding if requested
  if (audioBps > 0 && (sourceVideo.captureStream || sourceVideo.mozCaptureStream)) {
    try {
      const srcStream = (sourceVideo.captureStream || sourceVideo.mozCaptureStream).call(sourceVideo);
      const audioTracks = srcStream.getAudioTracks();
      if (audioTracks.length > 0) {
        audioTracks.forEach(tr => canvasStream.addTrack(tr));
      }
    } catch (e) {
      console.warn('Audio capture stream fallback:', e);
    }
  }

  let recorder;
  const mimeType = MediaRecorder.isTypeSupported('video/webm;codecs=vp9')
    ? 'video/webm;codecs=vp9'
    : 'video/webm';

  try {
    recorder = new MediaRecorder(canvasStream, {
      mimeType,
      videoBitsPerSecond: targetBitrate,
      audioBitsPerSecond: audioBps > 0 ? audioBps : undefined
    });
  } catch (err) {
    recorder = new MediaRecorder(canvasStream);
  }

  const chunks = [];
  recorder.ondataavailable = e => { if (e.data.size > 0) chunks.push(e.data); };

  const totalDuration = sourceVideo.duration || 1;
  const startTime = Date.now();

  recorder.onstop = () => {
    isCompressing = false;
    btnStartCompress.disabled = false;
    btnCancelCompress.style.display = 'none';

    if (shouldCancel) {
      progressCard.style.display = 'none';
      return;
    }

    compressedBlob = new Blob(chunks, { type: 'video/webm' });
    const originalBytes = currentFileSize || 1;
    const finalBytes = compressedBlob.size;
    const savedPct = Math.round(((originalBytes - finalBytes) / originalBytes) * 100);

    resBadgeSaved.textContent = savedPct > 0 ? `Saved ${savedPct}%` : 'Compressed';
    resSummary.textContent = `Reduced from ${formatBytes(originalBytes)} down to ${formatBytes(finalBytes)} (${targetW}×${targetH} @ ${fps}fps).`;

    progressCard.style.display = 'none';
    resultCard.style.display = 'block';
  };

  recorder.start(100);

  sourceVideo.currentTime = 0;
  await new Promise(r => { sourceVideo.onseeked = r; });

  try {
    await sourceVideo.play();
  } catch (e) {
    sourceVideo.muted = true;
    await sourceVideo.play();
  }

  const renderTimer = setInterval(() => {
    if (shouldCancel || sourceVideo.ended || sourceVideo.currentTime >= totalDuration) {
      clearInterval(renderTimer);
      sourceVideo.pause();
      if (recorder.state === 'recording') recorder.stop();
      return;
    }

    ctx.drawImage(sourceVideo, 0, 0, targetW, targetH);

    const pct = Math.min(100, Math.round((sourceVideo.currentTime / totalDuration) * 100));
    progressFill.style.width = `${pct}%`;
    progressPct.textContent = `${pct}%`;

    const elapsed = (Date.now() - startTime) / 1000;
    const estTotal = pct > 0 ? elapsed / (pct / 100) : 0;
    const remaining = Math.max(0, estTotal - elapsed);

    progressDetail.textContent = `Processed: ${formatDuration(sourceVideo.currentTime)} / ${formatDuration(totalDuration)}`;
    progressEta.textContent = `ETA: ~${Math.round(remaining)}s`;
  }, 1000 / fps);
});

btnCancelCompress.addEventListener('click', () => {
  shouldCancel = true;
  sourceVideo.pause();
  progressStatus.textContent = 'Cancelling...';
});

btnDownloadCompressed.addEventListener('click', () => {
  if (!compressedBlob) return;
  const baseName = currentFileName.replace(/\.[^/.]+$/, '');
  const url = URL.createObjectURL(compressedBlob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${baseName}_compressed.webm`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 4000);
});

btnPlayCompressed.addEventListener('click', () => {
  if (!compressedBlob) return;
  sourceVideo.src = URL.createObjectURL(compressedBlob);
  sourceVideo.play();
});