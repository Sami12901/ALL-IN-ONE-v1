// Video Cropper - Interactive Visual Frame & Aspect Ratio Cropper
// ALL IN ONE Platform

let currentFile = null;
let currentFileName = 'sample_video.mp4';
let croppedBlob = null;
let isCropping = false;

// Aspect ratio state
let currentRatio = '16:9'; // 16:9, 9:16, 1:1, 4:5, 4:3, free

// Normalized crop box (0 to 1 relative to video display)
let cropNorm = { x: 0.1, y: 0.1, w: 0.8, h: 0.8 };

// Dragging state
let isDraggingBox = false;
let activeHandle = null;
let dragStartX = 0;
let dragStartY = 0;
let initialCrop = { ...cropNorm };

// DOM
const dropZone = document.getElementById('drop-zone');
const fileInput = document.getElementById('file-input');
const btnLoadDemo = document.getElementById('btn-load-demo');
const workspacePanel = document.getElementById('workspace-panel');

const stageWrapper = document.getElementById('stage-wrapper');
const sourceVideo = document.getElementById('source-video');
const cropBox = document.getElementById('crop-box');
const labelCropDims = document.getElementById('label-crop-dims');
const btnPlayPause = document.getElementById('btn-play-pause');
const btnResetCrop = document.getElementById('btn-reset-crop');

const ratioButtons = document.querySelectorAll('.ratio-btn');
const numCropW = document.getElementById('num-crop-w');
const numCropH = document.getElementById('num-crop-h');
const numCropX = document.getElementById('num-crop-x');
const numCropY = document.getElementById('num-crop-y');
const selectCropFps = document.getElementById('select-crop-fps');

const btnStartCrop = document.getElementById('btn-start-crop');
const progressCard = document.getElementById('progress-card');
const progressFill = document.getElementById('progress-fill');
const progressPct = document.getElementById('progress-pct');
const progressStatus = document.getElementById('progress-status');

const resultCard = document.getElementById('result-card');
const btnDownloadCropped = document.getElementById('btn-download-cropped');
const btnPreviewCropped = document.getElementById('btn-preview-cropped');
const cropRenderCanvas = document.getElementById('crop-render-canvas');

// Ratio values
const ratioMap = {
  '16:9': 16 / 9,
  '9:16': 9 / 16,
  '1:1': 1,
  '4:5': 4 / 5,
  '4:3': 4 / 3,
  'free': null
};

// Update CSS positions of crop box on the video
function updateCropBoxDOM() {
  const vRect = sourceVideo.getBoundingClientRect();
  const sRect = stageWrapper.getBoundingClientRect();

  // Position relative to stageWrapper
  const vOffsetX = vRect.left - sRect.left;
  const vOffsetY = vRect.top - sRect.top;

  const left = vOffsetX + cropNorm.x * vRect.width;
  const top = vOffsetY + cropNorm.y * vRect.height;
  const width = cropNorm.w * vRect.width;
  const height = cropNorm.h * vRect.height;

  cropBox.style.left = `${left}px`;
  cropBox.style.top = `${top}px`;
  cropBox.style.width = `${width}px`;
  cropBox.style.height = `${height}px`;

  // Update actual video pixel inputs
  const actualW = Math.floor(cropNorm.w * sourceVideo.videoWidth / 2) * 2;
  const actualH = Math.floor(cropNorm.h * sourceVideo.videoHeight / 2) * 2;
  const actualX = Math.floor(cropNorm.x * sourceVideo.videoWidth);
  const actualY = Math.floor(cropNorm.y * sourceVideo.videoHeight);

  numCropW.value = actualW;
  numCropH.value = actualH;
  numCropX.value = actualX;
  numCropY.value = actualY;

  labelCropDims.textContent = `${actualW} × ${actualH} px`;
}

// Reset crop box based on current ratio
function applyRatioToCrop(ratioKey) {
  currentRatio = ratioKey;
  const targetRatio = ratioMap[ratioKey];

  if (!targetRatio) {
    cropNorm = { x: 0.1, y: 0.1, w: 0.8, h: 0.8 };
  } else {
    const videoAspect = sourceVideo.videoWidth / sourceVideo.videoHeight;
    if (targetRatio >= videoAspect) {
      // Crop height is constrained
      const w = 0.9;
      const h = (w * videoAspect) / targetRatio;
      cropNorm = {
        x: (1 - w) / 2,
        y: (1 - h) / 2,
        w: w,
        h: h
      };
    } else {
      // Crop width is constrained
      const h = 0.9;
      const w = (h * targetRatio) / videoAspect;
      cropNorm = {
        x: (1 - w) / 2,
        y: (1 - h) / 2,
        w: w,
        h: h
      };
    }
  }

  updateCropBoxDOM();
}

// Aspect ratio button clicks
ratioButtons.forEach(btn => {
  btn.addEventListener('click', () => {
    ratioButtons.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    applyRatioToCrop(btn.dataset.ratio);
  });
});

// Manual numerical inputs
[numCropW, numCropH, numCropX, numCropY].forEach(inp => {
  inp.addEventListener('change', () => {
    const vw = sourceVideo.videoWidth || 1;
    const vh = sourceVideo.videoHeight || 1;
    cropNorm.w = Math.min(1, Math.max(0.05, parseInt(numCropW.value, 10) / vw));
    cropNorm.h = Math.min(1, Math.max(0.05, parseInt(numCropH.value, 10) / vh));
    cropNorm.x = Math.min(1 - cropNorm.w, Math.max(0, parseInt(numCropX.value, 10) / vw));
    cropNorm.y = Math.min(1 - cropNorm.h, Math.max(0, parseInt(numCropY.value, 10) / vh));
    updateCropBoxDOM();
  });
});

// Dragging logic for crop box
cropBox.addEventListener('mousedown', e => {
  if (e.target.classList.contains('crop-handle')) {
    activeHandle = e.target.dataset.handle;
  } else {
    isDraggingBox = true;
  }
  dragStartX = e.clientX;
  dragStartY = e.clientY;
  initialCrop = { ...cropNorm };
  e.preventDefault();
});

window.addEventListener('mousemove', e => {
  if (!isDraggingBox && !activeHandle) return;

  const vRect = sourceVideo.getBoundingClientRect();
  const dx = (e.clientX - dragStartX) / vRect.width;
  const dy = (e.clientY - dragStartY) / vRect.height;

  if (isDraggingBox) {
    cropNorm.x = Math.max(0, Math.min(1 - initialCrop.w, initialCrop.x + dx));
    cropNorm.y = Math.max(0, Math.min(1 - initialCrop.h, initialCrop.y + dy));
  } else if (activeHandle) {
    let newW = initialCrop.w;
    let newH = initialCrop.h;
    let newX = initialCrop.x;
    let newY = initialCrop.y;

    if (activeHandle === 'se') {
      newW = Math.max(0.05, Math.min(1 - initialCrop.x, initialCrop.w + dx));
      newH = Math.max(0.05, Math.min(1 - initialCrop.y, initialCrop.h + dy));
    } else if (activeHandle === 'sw') {
      const deltaX = Math.min(initialCrop.w - 0.05, Math.max(-initialCrop.x, dx));
      newX = initialCrop.x + deltaX;
      newW = initialCrop.w - deltaX;
      newH = Math.max(0.05, Math.min(1 - initialCrop.y, initialCrop.h + dy));
    } else if (activeHandle === 'ne') {
      newW = Math.max(0.05, Math.min(1 - initialCrop.x, initialCrop.w + dx));
      const deltaY = Math.min(initialCrop.h - 0.05, Math.max(-initialCrop.y, dy));
      newY = initialCrop.y + deltaY;
      newH = initialCrop.h - deltaY;
    } else if (activeHandle === 'nw') {
      const deltaX = Math.min(initialCrop.w - 0.05, Math.max(-initialCrop.x, dx));
      newX = initialCrop.x + deltaX;
      newW = initialCrop.w - deltaX;
      const deltaY = Math.min(initialCrop.h - 0.05, Math.max(-initialCrop.y, dy));
      newY = initialCrop.y + deltaY;
      newH = initialCrop.h - deltaY;
    }

    cropNorm = { x: newX, y: newY, w: newW, h: newH };
  }

  updateCropBoxDOM();
});

window.addEventListener('mouseup', () => {
  isDraggingBox = false;
  activeHandle = null;
});

// Window resize sync
window.addEventListener('resize', () => {
  if (workspacePanel.style.display !== 'none') {
    updateCropBoxDOM();
  }
});

// Play / Pause
btnPlayPause.addEventListener('click', () => {
  if (sourceVideo.paused) {
    sourceVideo.play();
  } else {
    sourceVideo.pause();
  }
});

btnResetCrop.addEventListener('click', () => {
  applyRatioToCrop(currentRatio);
});

// File Loading
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
  const url = URL.createObjectURL(file);
  loadVideo(url);
}

function loadVideo(url) {
  sourceVideo.src = url;
  sourceVideo.load();
  sourceVideo.onloadedmetadata = () => {
    workspacePanel.style.display = 'grid';
    resultCard.style.display = 'none';
    progressCard.style.display = 'none';
    sourceVideo.play();
    setTimeout(() => {
      applyRatioToCrop('16:9');
    }, 100);
  };
}

// Generate animated sample demo video
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

  const total = 30 * 6; // 6 seconds
  let f = 0;
  recorder.start();

  const int = setInterval(() => {
    f++;
    const t = f / 30;

    // Split background
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Subject in middle
    ctx.fillStyle = '#f59e0b';
    ctx.beginPath();
    ctx.arc(canvas.width / 2 + Math.sin(t * 2) * 150, canvas.height / 2, 70, 0, Math.PI * 2);
    ctx.fill();

    // Text instructions
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 36px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('VIDEO CROPPER DEMO', canvas.width / 2, 100);

    ctx.fillStyle = '#94a3b8';
    ctx.font = '22px sans-serif';
    ctx.fillText('Move the crop box over the moving orb', canvas.width / 2, canvas.height - 80);

    if (f >= total) {
      clearInterval(int);
      recorder.stop();
    }
  }, 1000 / 30);

  recorder.onstop = () => {
    const blob = new Blob(chunks, { type: 'video/webm' });
    const url = URL.createObjectURL(blob);
    currentFileName = 'sample_cropper_demo.webm';
    loadVideo(url);
    btnLoadDemo.disabled = false;
    btnLoadDemo.innerHTML = '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" style="margin-right:0.4rem;"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg> Load Sample Video';
  };
});

// Render & Export Cropped Video
btnStartCrop.addEventListener('click', async () => {
  if (isCropping) return;
  isCropping = true;

  btnStartCrop.disabled = true;
  progressCard.style.display = 'block';
  resultCard.style.display = 'none';

  // Calculate actual pixel crop coordinates
  const sx = Math.floor(cropNorm.x * sourceVideo.videoWidth);
  const sy = Math.floor(cropNorm.y * sourceVideo.videoHeight);
  let sw = Math.floor(cropNorm.w * sourceVideo.videoWidth / 2) * 2;
  let sh = Math.floor(cropNorm.h * sourceVideo.videoHeight / 2) * 2;

  sw = Math.max(2, sw);
  sh = Math.max(2, sh);

  cropRenderCanvas.width = sw;
  cropRenderCanvas.height = sh;
  const ctx = cropRenderCanvas.getContext('2d');

  const fps = parseInt(selectCropFps.value, 10) || 30;
  const stream = cropRenderCanvas.captureStream(fps);

  // Audio forward
  try {
    if (sourceVideo.captureStream || sourceVideo.mozCaptureStream) {
      const srcStream = (sourceVideo.captureStream || sourceVideo.mozCaptureStream).call(sourceVideo);
      const audioTracks = srcStream.getAudioTracks();
      if (audioTracks.length > 0) {
        audioTracks.forEach(tr => stream.addTrack(tr));
      }
    }
  } catch (e) {
    console.warn('Audio forward note:', e);
  }

  let recorder;
  try {
    recorder = new MediaRecorder(stream, { mimeType: 'video/webm;codecs=vp9', videoBitsPerSecond: 4500000 });
  } catch (e) {
    recorder = new MediaRecorder(stream);
  }

  const chunks = [];
  recorder.ondataavailable = e => { if (e.data.size > 0) chunks.push(e.data); };

  const totalDur = sourceVideo.duration || 1;

  recorder.onstop = () => {
    isCropping = false;
    btnStartCrop.disabled = false;
    progressCard.style.display = 'none';

    croppedBlob = new Blob(chunks, { type: 'video/webm' });
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
    if (sourceVideo.ended || sourceVideo.currentTime >= totalDur) {
      clearInterval(renderTimer);
      sourceVideo.pause();
      if (recorder.state === 'recording') recorder.stop();
      return;
    }

    // Draw the cropped sub-rectangle
    ctx.drawImage(sourceVideo, sx, sy, sw, sh, 0, 0, sw, sh);

    const pct = Math.min(100, Math.round((sourceVideo.currentTime / totalDur) * 100));
    progressFill.style.width = `${pct}%`;
    progressPct.textContent = `${pct}%`;
  }, 1000 / fps);
});

btnDownloadCropped.addEventListener('click', () => {
  if (!croppedBlob) return;
  const base = currentFileName.replace(/\.[^/.]+$/, '');
  const url = URL.createObjectURL(croppedBlob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${base}_cropped_${currentRatio.replace(':', 'x')}.webm`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 4000);
});

btnPreviewCropped.addEventListener('click', () => {
  if (!croppedBlob) return;
  sourceVideo.src = URL.createObjectURL(croppedBlob);
  sourceVideo.play();
});