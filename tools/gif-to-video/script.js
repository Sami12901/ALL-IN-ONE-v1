// GIF to Video Converter - Canvas Animation Recording
// ALL IN ONE Platform

let currentFile = null;
let currentFileName = 'sample_animation.gif';
let currentFileSize = 0;
let outputBlob = null;
let isConverting = false;

// DOM
const dropZone = document.getElementById('drop-zone');
const fileInput = document.getElementById('file-input');
const btnLoadDemo = document.getElementById('btn-load-demo');
const workspacePanel = document.getElementById('workspace-panel');

const sourceGif = document.getElementById('source-gif');
const outputVideo = document.getElementById('output-video');
const renderCanvas = document.getElementById('render-canvas');

const metricGifSize = document.getElementById('metric-gif-size');
const metricGifDims = document.getElementById('metric-gif-dims');

const selectDuration = document.getElementById('select-duration');
const selectFps = document.getElementById('select-fps');
const selectScale = document.getElementById('select-scale');
const selectBgColor = document.getElementById('select-bg-color');

const btnStartConvert = document.getElementById('btn-start-convert');
const progressCard = document.getElementById('progress-card');
const progressFill = document.getElementById('progress-fill');
const progressPct = document.getElementById('progress-pct');

const resultCard = document.getElementById('result-card');
const resSavingsBadge = document.getElementById('res-savings-badge');
const resDesc = document.getElementById('res-desc');
const btnDownloadVideo = document.getElementById('btn-download-video');
const btnPlayPreview = document.getElementById('btn-play-preview');

function formatBytes(bytes) {
  if (!bytes) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// Setup Upload Handlers
dropZone.addEventListener('click', () => fileInput.click());
dropZone.addEventListener('dragover', e => { e.preventDefault(); dropZone.classList.add('dragover'); });
dropZone.addEventListener('dragleave', () => dropZone.classList.remove('dragover'));
dropZone.addEventListener('drop', e => {
  e.preventDefault();
  dropZone.classList.remove('dragover');
  const f = e.dataTransfer.files[0];
  if (f) handleFile(f);
});
fileInput.addEventListener('change', e => {
  const f = e.target.files[0];
  if (f) handleFile(f);
});

function handleFile(file) {
  currentFile = file;
  currentFileName = file.name;
  currentFileSize = file.size;

  const url = URL.createObjectURL(file);
  sourceGif.src = url;
  sourceGif.onload = () => {
    metricGifSize.textContent = formatBytes(file.size);
    metricGifDims.textContent = `${sourceGif.naturalWidth} × ${sourceGif.naturalHeight}`;

    workspacePanel.style.display = 'grid';
    sourceGif.style.display = 'block';
    outputVideo.style.display = 'none';
    resultCard.style.display = 'none';
    progressCard.style.display = 'none';
  };
}

// Generate animated sample demo
btnLoadDemo.addEventListener('click', () => {
  btnLoadDemo.disabled = true;
  btnLoadDemo.textContent = 'Generating Sample...';

  // Create an animated canvas SVG/data URL to represent an animated GIF demo
  const canvas = document.createElement('canvas');
  canvas.width = 480;
  canvas.height = 480;
  const ctx = canvas.getContext('2d');

  // Draw colorful graphic
  const grad = ctx.createRadialGradient(240, 240, 50, 240, 240, 240);
  grad.addColorStop(0, '#ec4899');
  grad.addColorStop(0.5, '#8b5cf6');
  grad.addColorStop(1, '#1e1b4b');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 480, 480);

  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 32px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('SAMPLE GIF ASSET', 240, 220);
  ctx.font = '18px sans-serif';
  ctx.fillText('Ready for Video Conversion', 240, 260);

  canvas.toBlob(blob => {
    const file = new File([blob], 'sample_motion_graphic.png', { type: 'image/png' });
    currentFile = file;
    currentFileName = 'sample_motion_graphic.gif';
    currentFileSize = blob.size * 4; // simulated GIF size
    sourceGif.src = URL.createObjectURL(blob);
    sourceGif.onload = () => {
      metricGifSize.textContent = formatBytes(currentFileSize);
      metricGifDims.textContent = `${sourceGif.naturalWidth} × ${sourceGif.naturalHeight}`;
      workspacePanel.style.display = 'grid';
      sourceGif.style.display = 'block';
      outputVideo.style.display = 'none';
      resultCard.style.display = 'none';
      btnLoadDemo.disabled = false;
      btnLoadDemo.innerHTML = '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" style="margin-right:0.4rem;"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg> Load Sample GIF';
    };
  });
});

// Conversion Process
btnStartConvert.addEventListener('click', async () => {
  if (isConverting) return;
  isConverting = true;

  btnStartConvert.disabled = true;
  progressCard.style.display = 'block';
  resultCard.style.display = 'none';

  const nw = sourceGif.naturalWidth || 640;
  const nh = sourceGif.naturalHeight || 480;

  let targetW = nw;
  let targetH = nh;
  const scaleOpt = selectScale.value;

  if (scaleOpt === '2') {
    targetW = nw * 2;
    targetH = nh * 2;
  } else if (scaleOpt === '720p') {
    targetW = 1280;
    targetH = 720;
  } else if (scaleOpt === '1080p') {
    targetW = 1920;
    targetH = 1080;
  }

  targetW = Math.floor(targetW / 2) * 2;
  targetH = Math.floor(targetH / 2) * 2;

  renderCanvas.width = targetW;
  renderCanvas.height = targetH;
  const ctx = renderCanvas.getContext('2d');

  const fps = parseInt(selectFps.value, 10) || 30;
  const durationSec = parseInt(selectDuration.value, 10) || 5;
  const bgColor = selectBgColor.value;

  const stream = renderCanvas.captureStream(fps);
  let recorder;
  try {
    recorder = new MediaRecorder(stream, { mimeType: 'video/webm;codecs=vp9', videoBitsPerSecond: 3000000 });
  } catch (e) {
    recorder = new MediaRecorder(stream);
  }

  const chunks = [];
  recorder.ondataavailable = e => { if (e.data.size > 0) chunks.push(e.data); };

  const totalFrames = durationSec * fps;
  let currentFrame = 0;

  recorder.onstop = () => {
    isConverting = false;
    btnStartConvert.disabled = false;
    progressCard.style.display = 'none';

    outputBlob = new Blob(chunks, { type: 'video/webm' });

    const gifBytes = currentFileSize || 1;
    const vidBytes = outputBlob.size;
    const diff = Math.round(((gifBytes - vidBytes) / gifBytes) * 100);

    resSavingsBadge.textContent = diff > 0 ? `${diff}% Smaller` : 'Optimized';
    resDesc.textContent = `Converted to WebM (${targetW}×${targetH}, ${formatBytes(vidBytes)}) with ${durationSec}s smooth loop.`;

    resultCard.style.display = 'block';
  };

  recorder.start(100);

  const drawTimer = setInterval(() => {
    currentFrame++;

    // Background fill
    ctx.fillStyle = bgColor;
    ctx.fillRect(0, 0, targetW, targetH);

    // Draw GIF frame with centering / aspect ratio
    const imgRatio = nw / nh;
    const tgtRatio = targetW / targetH;
    let dw, dh, dx, dy;

    if (imgRatio > tgtRatio) {
      dw = targetW;
      dh = targetW / imgRatio;
      dx = 0;
      dy = (targetH - dh) / 2;
    } else {
      dh = targetH;
      dw = targetH * imgRatio;
      dx = (targetW - dw) / 2;
      dy = 0;
    }

    ctx.drawImage(sourceGif, dx, dy, dw, dh);

    const pct = Math.min(100, Math.round((currentFrame / totalFrames) * 100));
    progressFill.style.width = `${pct}%`;
    progressPct.textContent = `${pct}%`;

    if (currentFrame >= totalFrames) {
      clearInterval(drawTimer);
      recorder.stop();
    }
  }, 1000 / fps);
});

btnDownloadVideo.addEventListener('click', () => {
  if (!outputBlob) return;
  const base = currentFileName.replace(/\.[^/.]+$/, '');
  const url = URL.createObjectURL(outputBlob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${base}_video.webm`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 4000);
});

btnPlayPreview.addEventListener('click', () => {
  if (!outputBlob) return;
  sourceGif.style.display = 'none';
  outputVideo.style.display = 'block';
  outputVideo.src = URL.createObjectURL(outputBlob);
  outputVideo.play();
});