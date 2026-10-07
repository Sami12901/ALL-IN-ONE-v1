// Video Converter - 100% Client-Side Transcoder & Scaler
// ALL IN ONE Platform

let currentFile = null;
let currentFileName = 'sample_video.mp4';
let currentFileSize = 0;
let convertedBlob = null;
let isConverting = false;
let shouldCancel = false;

// DOM Elements
const dropZone = document.getElementById('drop-zone');
const fileInput = document.getElementById('file-input');
const btnLoadDemo = document.getElementById('btn-load-demo');
const workspacePanel = document.getElementById('workspace-panel');

const sourceVideo = document.getElementById('source-video');
const renderCanvas = document.getElementById('hidden-render-canvas');
const sourceName = document.getElementById('source-name');
const badgeSourceRes = document.getElementById('badge-source-res');
const badgeSourceSize = document.getElementById('badge-source-size');
const badgeSourceDur = document.getElementById('badge-source-dur');

const selectFormat = document.getElementById('select-format');
const selectResolution = document.getElementById('select-resolution');
const customResGroup = document.getElementById('custom-res-group');
const customWidth = document.getElementById('custom-width');
const customHeight = document.getElementById('custom-height');
const selectFps = document.getElementById('select-fps');
const selectBitrate = document.getElementById('select-bitrate');
const checkIncludeAudio = document.getElementById('check-include-audio');
const checkMaintainAspect = document.getElementById('check-maintain-aspect');

const btnStartConvert = document.getElementById('btn-start-convert');
const btnCancelConvert = document.getElementById('btn-cancel-convert');
const progressCard = document.getElementById('progress-card');
const progressFill = document.getElementById('progress-fill');
const progressPct = document.getElementById('progress-pct');
const progressStatus = document.getElementById('progress-status');
const progressFrames = document.getElementById('progress-frames');
const progressEta = document.getElementById('progress-eta');

const resultCard = document.getElementById('result-card');
const resFormat = document.getElementById('res-format');
const resResolution = document.getElementById('res-resolution');
const resFilesize = document.getElementById('res-filesize');
const resDuration = document.getElementById('res-duration');
const btnDownloadVideo = document.getElementById('btn-download-video');
const btnPreviewOutput = document.getElementById('btn-preview-output');

const ffmpegCode = document.getElementById('ffmpeg-code');
const btnCopyFfmpeg = document.getElementById('btn-copy-ffmpeg');

// Format helpers
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

// Update FFmpeg preview code
function updateFfmpegCommand() {
  const format = selectFormat.value;
  const res = selectResolution.value;
  const fps = selectFps.value;
  const bitrate = parseInt(selectBitrate.value, 10);
  const audio = checkIncludeAudio.checked;

  let ext = 'webm';
  let vcodec = 'libvpx-vp9';
  if (format === 'webm-vp8') {
    vcodec = 'libvpx';
  } else if (format === 'mp4') {
    vcodec = 'libx264';
    ext = 'mp4';
  }

  let scaleArg = '';
  if (res === '1080p') scaleArg = ' -vf scale=1920:1080';
  else if (res === '720p') scaleArg = ' -vf scale=1280:720';
  else if (res === '480p') scaleArg = ' -vf scale=854:480';
  else if (res === '360p') scaleArg = ' -vf scale=640:360';
  else if (res === 'custom') scaleArg = ` -vf scale=${customWidth.value}:${customHeight.value}`;

  const fpsArg = fps !== 'original' ? ` -r ${fps}` : '';
  const brArg = ` -b:v ${Math.round(bitrate / 1000)}k`;
  const aArg = audio ? ' -c:a libopus -b:a 128k' : ' -an';

  const baseName = currentFileName.replace(/\.[^/.]+$/, '');
  ffmpegCode.textContent = `ffmpeg -i "${currentFileName}" -c:v ${vcodec}${brArg}${scaleArg}${fpsArg}${aArg} "${baseName}_converted.${ext}"`;
}

// Copy FFmpeg Command
btnCopyFfmpeg.addEventListener('click', () => {
  navigator.clipboard.writeText(ffmpegCode.textContent).then(() => {
    const orig = btnCopyFfmpeg.textContent;
    btnCopyFfmpeg.textContent = 'Copied!';
    setTimeout(() => { btnCopyFfmpeg.textContent = orig; }, 1800);
  });
});

// Resolution preset changed
selectResolution.addEventListener('change', () => {
  if (selectResolution.value === 'custom') {
    customResGroup.style.display = 'grid';
  } else {
    customResGroup.style.display = 'none';
  }
  updateFfmpegCommand();
});

[selectFormat, selectFps, selectBitrate, checkIncludeAudio, checkMaintainAspect, customWidth, customHeight].forEach(el => {
  el.addEventListener('change', updateFfmpegCommand);
});

// Setup File Drag & Drop
dropZone.addEventListener('click', () => fileInput.click());
dropZone.addEventListener('dragover', (e) => {
  e.preventDefault();
  dropZone.classList.add('dragover');
});
dropZone.addEventListener('dragleave', () => dropZone.classList.remove('dragover'));
dropZone.addEventListener('drop', (e) => {
  e.preventDefault();
  dropZone.classList.remove('dragover');
  const file = e.dataTransfer.files[0];
  if (file) handleSelectedFile(file);
});
fileInput.addEventListener('change', (e) => {
  const file = e.target.files[0];
  if (file) handleSelectedFile(file);
});

function handleSelectedFile(file) {
  currentFile = file;
  currentFileName = file.name;
  currentFileSize = file.size;
  const url = URL.createObjectURL(file);
  loadVideoIntoStudio(url, file.name, file.size);
}

function loadVideoIntoStudio(src, name, size) {
  sourceName.textContent = name;
  badgeSourceSize.textContent = formatBytes(size);
  sourceVideo.src = src;
  sourceVideo.load();

  sourceVideo.onloadedmetadata = () => {
    badgeSourceRes.textContent = `${sourceVideo.videoWidth} × ${sourceVideo.videoHeight}`;
    badgeSourceDur.textContent = formatDuration(sourceVideo.duration);

    if (selectResolution.value === 'custom') {
      customWidth.value = sourceVideo.videoWidth;
      customHeight.value = sourceVideo.videoHeight;
    }

    workspacePanel.style.display = 'grid';
    resultCard.style.display = 'none';
    progressCard.style.display = 'none';
    updateFfmpegCommand();
  };
}

// Generate animated sample video
btnLoadDemo.addEventListener('click', async () => {
  btnLoadDemo.disabled = true;
  btnLoadDemo.textContent = 'Synthesizing...';

  try {
    const canvas = document.createElement('canvas');
    canvas.width = 1280;
    canvas.height = 720;
    const ctx = canvas.getContext('2d');
    const stream = canvas.captureStream(30);

    let mime = 'video/webm;codecs=vp9';
    if (!MediaRecorder.isTypeSupported(mime)) mime = 'video/webm';
    const recorder = new MediaRecorder(stream, { mimeType: mime });
    const chunks = [];

    recorder.ondataavailable = e => { if (e.data.size > 0) chunks.push(e.data); };

    const durationSec = 6;
    const fps = 30;
    const totalFrames = durationSec * fps;
    let frame = 0;

    recorder.start();

    const timer = setInterval(() => {
      frame++;
      const t = frame / fps;

      // Luxury animated background
      const grad = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
      grad.addColorStop(0, '#0a0f1d');
      grad.addColorStop(0.5, '#1e1b4b');
      grad.addColorStop(1, '#0f172a');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Rotating glow rings
      ctx.save();
      ctx.translate(canvas.width / 2, canvas.height / 2);
      ctx.rotate(t * 0.8);
      for (let r = 80; r <= 260; r += 45) {
        ctx.strokeStyle = `hsla(${(t * 40 + r) % 360}, 85%, 65%, 0.35)`;
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.arc(0, 0, r + Math.sin(t * 4) * 15, 0, Math.PI * 2);
        ctx.stroke();
      }
      ctx.restore();

      // Center title card
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 44px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('ALL IN ONE 4K DEMO', canvas.width / 2, canvas.height / 2 - 20);

      ctx.fillStyle = '#93c5fd';
      ctx.font = '500 24px sans-serif';
      ctx.fillText(`Sample Render Time: ${t.toFixed(1)}s / ${durationSec}s`, canvas.width / 2, canvas.height / 2 + 30);

      if (frame >= totalFrames) {
        clearInterval(timer);
        recorder.stop();
      }
    }, 1000 / fps);

    recorder.onstop = () => {
      const blob = new Blob(chunks, { type: 'video/webm' });
      const url = URL.createObjectURL(blob);
      loadVideoIntoStudio(url, 'sample_motion_demo.webm', blob.size);
      btnLoadDemo.disabled = false;
      btnLoadDemo.innerHTML = '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" style="margin-right:0.4rem;"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg> Load Sample Video';
    };
  } catch (err) {
    console.error('Demo generation failed:', err);
    btnLoadDemo.disabled = false;
    btnLoadDemo.textContent = 'Load Sample Video';
  }
});

// Conversion Process
btnStartConvert.addEventListener('click', async () => {
  if (isConverting) return;
  isConverting = true;
  shouldCancel = false;

  btnStartConvert.disabled = true;
  btnCancelConvert.style.display = 'block';
  progressCard.style.display = 'block';
  resultCard.style.display = 'none';

  // Target Dimensions
  let targetWidth = sourceVideo.videoWidth;
  let targetHeight = sourceVideo.videoHeight;
  const resPreset = selectResolution.value;

  if (resPreset === '1080p') { targetWidth = 1920; targetHeight = 1080; }
  else if (resPreset === '720p') { targetWidth = 1280; targetHeight = 720; }
  else if (resPreset === '480p') { targetWidth = 854; targetHeight = 480; }
  else if (resPreset === '360p') { targetWidth = 640; targetHeight = 360; }
  else if (resPreset === 'custom') {
    targetWidth = parseInt(customWidth.value, 10) || sourceVideo.videoWidth;
    targetHeight = parseInt(customHeight.value, 10) || sourceVideo.videoHeight;
  }

  // Ensure even dimensions for codecs
  targetWidth = Math.floor(targetWidth / 2) * 2;
  targetHeight = Math.floor(targetHeight / 2) * 2;

  renderCanvas.width = targetWidth;
  renderCanvas.height = targetHeight;
  const ctx = renderCanvas.getContext('2d');

  // FPS selection
  const fpsSetting = selectFps.value === 'original' ? 30 : parseInt(selectFps.value, 10);
  const bitrate = parseInt(selectBitrate.value, 10);

  // Mime selection
  let selectedMime = 'video/webm;codecs=vp9';
  const formatChoice = selectFormat.value;
  if (formatChoice === 'webm-vp8') {
    selectedMime = 'video/webm;codecs=vp8';
  } else if (formatChoice === 'mp4') {
    if (MediaRecorder.isTypeSupported('video/mp4;codecs=avc1.42E01E,mp4a.40.2')) {
      selectedMime = 'video/mp4;codecs=avc1.42E01E,mp4a.40.2';
    } else if (MediaRecorder.isTypeSupported('video/mp4')) {
      selectedMime = 'video/mp4';
    } else {
      selectedMime = 'video/webm;codecs=vp9';
    }
  }

  if (!MediaRecorder.isTypeSupported(selectedMime)) {
    selectedMime = 'video/webm';
  }

  // Audio stream capture
  let combinedStream;
  const canvasStream = renderCanvas.captureStream(fpsSetting);

  try {
    if (checkIncludeAudio.checked && (sourceVideo.captureStream || sourceVideo.mozCaptureStream)) {
      const srcStream = (sourceVideo.captureStream || sourceVideo.mozCaptureStream).call(sourceVideo);
      const audioTracks = srcStream.getAudioTracks();
      if (audioTracks.length > 0) {
        audioTracks.forEach(track => canvasStream.addTrack(track));
      }
    }
  } catch (audioErr) {
    console.warn('Audio capture stream fallback:', audioErr);
  }
  combinedStream = canvasStream;

  let recorder;
  try {
    recorder = new MediaRecorder(combinedStream, {
      mimeType: selectedMime,
      videoBitsPerSecond: bitrate
    });
  } catch (e) {
    recorder = new MediaRecorder(combinedStream);
  }

  const recordedChunks = [];
  recorder.ondataavailable = e => {
    if (e.data && e.data.size > 0) recordedChunks.push(e.data);
  };

  const startTime = Date.now();
  const totalDuration = sourceVideo.duration || 1;

  recorder.onstop = () => {
    isConverting = false;
    btnStartConvert.disabled = false;
    btnCancelConvert.style.display = 'none';

    if (shouldCancel) {
      progressCard.style.display = 'none';
      return;
    }

    const outType = selectedMime.includes('mp4') ? 'video/mp4' : 'video/webm';
    convertedBlob = new Blob(recordedChunks, { type: outType });

    // Populate result card
    resFormat.textContent = selectedMime.includes('mp4') ? 'MP4' : 'WEBM';
    resResolution.textContent = `${targetWidth} × ${targetHeight} @ ${fpsSetting}fps`;
    resFilesize.textContent = formatBytes(convertedBlob.size);
    resDuration.textContent = formatDuration(sourceVideo.duration);

    progressCard.style.display = 'none';
    resultCard.style.display = 'block';
  };

  recorder.start(100);

  // Play video through and draw frames
  sourceVideo.currentTime = 0;
  await new Promise(r => { sourceVideo.onseeked = r; });

  try {
    await sourceVideo.play();
  } catch (playErr) {
    // If autoplay policy blocks with sound, mute temporarily
    sourceVideo.muted = true;
    await sourceVideo.play();
  }

  const renderInterval = setInterval(() => {
    if (shouldCancel || sourceVideo.ended || sourceVideo.currentTime >= totalDuration) {
      clearInterval(renderInterval);
      sourceVideo.pause();
      if (recorder.state === 'recording') recorder.stop();
      return;
    }

    // Render frame to canvas with aspect ratio handling
    if (checkMaintainAspect.checked) {
      ctx.fillStyle = '#000000';
      ctx.fillRect(0, 0, targetWidth, targetHeight);

      const srcRatio = sourceVideo.videoWidth / sourceVideo.videoHeight;
      const tgtRatio = targetWidth / targetHeight;
      let drawW, drawH, drawX, drawY;

      if (srcRatio > tgtRatio) {
        drawW = targetWidth;
        drawH = targetWidth / srcRatio;
        drawX = 0;
        drawY = (targetHeight - drawH) / 2;
      } else {
        drawH = targetHeight;
        drawW = targetHeight * srcRatio;
        drawX = (targetWidth - drawW) / 2;
        drawY = 0;
      }
      ctx.drawImage(sourceVideo, drawX, drawY, drawW, drawH);
    } else {
      ctx.drawImage(sourceVideo, 0, 0, targetWidth, targetHeight);
    }

    // Progress calculations
    const pct = Math.min(100, Math.round((sourceVideo.currentTime / totalDuration) * 100));
    progressFill.style.width = `${pct}%`;
    progressPct.textContent = `${pct}%`;

    const elapsed = (Date.now() - startTime) / 1000;
    const estTotal = pct > 0 ? (elapsed / (pct / 100)) : 0;
    const remaining = Math.max(0, estTotal - elapsed);

    progressFrames.textContent = `Time: ${formatDuration(sourceVideo.currentTime)} / ${formatDuration(totalDuration)}`;
    progressEta.textContent = `ETA: ~${Math.round(remaining)}s remaining`;
  }, 1000 / fpsSetting);
});

// Cancel Conversion
btnCancelConvert.addEventListener('click', () => {
  shouldCancel = true;
  sourceVideo.pause();
  progressStatus.textContent = 'Cancelling...';
});

// Download Converted File
btnDownloadVideo.addEventListener('click', () => {
  if (!convertedBlob) return;
  const isMp4 = convertedBlob.type.includes('mp4');
  const ext = isMp4 ? 'mp4' : 'webm';
  const baseName = currentFileName.replace(/\.[^/.]+$/, '');
  const downloadName = `${baseName}_converted_${selectResolution.value}.${ext}`;

  const url = URL.createObjectURL(convertedBlob);
  const a = document.createElement('a');
  a.href = url;
  a.download = downloadName;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 4000);
});

// Preview Output in Source Player
btnPreviewOutput.addEventListener('click', () => {
  if (!convertedBlob) return;
  const url = URL.createObjectURL(convertedBlob);
  sourceVideo.src = url;
  sourceVideo.play();
});