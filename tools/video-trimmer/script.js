// Video Segment Trimmer & Frame Capture - ALL IN ONE

let videoFile = null;
let videoFileName = 'sample_video.mp4';
let videoFileSize = 0;
let duration = 0;
let startTime = 0;
let endTime = 0;
let isPlayingRange = false;

// Boundary preview off-screen videos
let previewVideoStart = null;
let previewVideoEnd = null;

// Timeline Dragging State
let isDraggingStart = false;
let isDraggingEnd = false;

// DOM Elements
const dropZone = document.getElementById('video-drop-zone');
const fileInput = document.getElementById('video-file-input');
const btnLoadDemo = document.getElementById('btn-load-demo');
const studioPanel = document.getElementById('video-studio-panel');

const mainVideo = document.getElementById('main-video');
const badgeResolution = document.getElementById('badge-resolution');
const badgeFilesize = document.getElementById('badge-filesize');

const timelineTrack = document.getElementById('timeline-track');
const trackActiveRange = document.getElementById('track-active-range');
const handleStart = document.getElementById('handle-start');
const handleEnd = document.getElementById('handle-end');
const playheadCursor = document.getElementById('playhead-cursor');

const labelStartTime = document.getElementById('label-start-time');
const labelCurrentTime = document.getElementById('label-current-time');
const labelTotalTime = document.getElementById('label-total-time');
const labelEndTime = document.getElementById('label-end-time');
const timelineMidTick = document.getElementById('timeline-mid-tick');
const timelineEndTick = document.getElementById('timeline-end-tick');

const btnPlayPause = document.getElementById('btn-play-pause');
const textPlay = document.getElementById('text-play');
const iconPlay = document.getElementById('icon-play');
const btnPlayRange = document.getElementById('btn-play-range');
const checkLoopRange = document.getElementById('check-loop-range');
const btnSnapshotFrame = document.getElementById('btn-snapshot-frame');

const inputStartSec = document.getElementById('input-start-sec');
const inputEndSec = document.getElementById('input-end-sec');
const btnSetStartCurr = document.getElementById('btn-set-start-curr');
const btnSetEndCurr = document.getElementById('btn-set-end-curr');

const canvasStartFrame = document.getElementById('canvas-start-frame');
const canvasEndFrame = document.getElementById('canvas-end-frame');
const previewStartTs = document.getElementById('preview-start-ts');
const previewEndTs = document.getElementById('preview-end-ts');
const holderStartFrame = document.getElementById('holder-start-frame');
const holderEndFrame = document.getElementById('holder-end-frame');

const metricOriginal = document.getElementById('metric-original');
const metricTrimmed = document.getElementById('metric-trimmed');
const metricRemoved = document.getElementById('metric-removed');
const metricPercent = document.getElementById('metric-percent');

const codeFfmpeg = document.getElementById('code-ffmpeg');
const btnCopyFfmpeg = document.getElementById('btn-copy-ffmpeg');
const btnExportJson = document.getElementById('btn-export-json');
const btnDownloadClip = document.getElementById('btn-download-clip');

// Format seconds into HH:MM:SS.mmm
function formatTime(sec, includeHours = false) {
  if (isNaN(sec) || sec < 0) sec = 0;
  const h = Math.floor(sec / 3600);
  const m = Math.floor((sec % 3600) / 60);
  const s = Math.floor(sec % 60);
  const ms = Math.floor((sec % 1) * 1000);

  if (includeHours || h > 0) {
    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}.${String(ms).padStart(3, '0')}`;
  }
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}.${String(ms).padStart(3, '0')}`;
}

function formatBytes(bytes) {
  if (!bytes || bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// Generate animated client-side demo video
async function generateDemoVideo() {
  return new Promise((resolve) => {
    const canvas = document.createElement('canvas');
    canvas.width = 640;
    canvas.height = 360;
    const ctx = canvas.getContext('2d');

    const stream = canvas.captureStream(30);
    const mediaRecorder = new MediaRecorder(stream, { mimeType: 'video/webm' });
    const chunks = [];

    mediaRecorder.ondataavailable = (e) => {
      if (e.data.size > 0) chunks.push(e.data);
    };

    mediaRecorder.onstop = () => {
      const blob = new Blob(chunks, { type: 'video/webm' });
      resolve({ blob, name: 'demo_motion_timer.webm', size: blob.size });
    };

    mediaRecorder.start();

    const fps = 30;
    const totalFrames = fps * 8; // 8 seconds
    let frame = 0;

    const interval = setInterval(() => {
      const t = frame / fps;

      // Dynamic Animated Frame
      ctx.fillStyle = '#0a0e14';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Glowing pulsing rings
      const cx = canvas.width / 2;
      const cy = canvas.height / 2;
      for (let r = 20; r <= 140; r += 30) {
        ctx.strokeStyle = `hsla(${(t * 60 + r) % 360}, 80%, 65%, 0.4)`;
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(cx, cy, r + Math.sin(t * 3 + r) * 10, 0, Math.PI * 2);
        ctx.stroke();
      }

      // Title
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 22px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('ALL IN ONE • VIDEO TRIMMER DEMO', cx, 60);

      // Digital Timestamp Display
      ctx.fillStyle = '#89aacc';
      ctx.font = 'bold 44px monospace';
      ctx.fillText(formatTime(t), cx, cy + 15);

      // Progress bar at bottom
      const progress = frame / totalFrames;
      ctx.fillStyle = '#10b981';
      ctx.fillRect(40, canvas.height - 40, (canvas.width - 80) * progress, 8);

      frame++;
      if (frame >= totalFrames) {
        clearInterval(interval);
        mediaRecorder.stop();
      }
    }, 1000 / fps);
  });
}

// Load Video File or Blob into Player
function loadVideoSource(blobUrl, name, size) {
  videoFileName = name || 'video_clip.mp4';
  videoFileSize = size || 0;

  mainVideo.src = blobUrl;
  mainVideo.load();

  // Create or reuse off-screen preview videos
  if (!previewVideoStart) {
    previewVideoStart = document.createElement('video');
    previewVideoStart.muted = true;
    previewVideoStart.playsInline = true;
  }
  if (!previewVideoEnd) {
    previewVideoEnd = document.createElement('video');
    previewVideoEnd.muted = true;
    previewVideoEnd.playsInline = true;
  }
  previewVideoStart.src = blobUrl;
  previewVideoEnd.src = blobUrl;

  mainVideo.onloadedmetadata = () => {
    duration = mainVideo.duration || 1;
    startTime = 0;
    endTime = duration;

    // Update Video Details
    badgeResolution.textContent = `${mainVideo.videoWidth}x${mainVideo.videoHeight}`;
    badgeFilesize.textContent = formatBytes(videoFileSize);

    labelStartTime.textContent = formatTime(startTime);
    labelEndTime.textContent = formatTime(endTime);
    labelTotalTime.textContent = formatTime(duration);
    timelineMidTick.textContent = formatTime(duration / 2);
    timelineEndTick.textContent = formatTime(duration);

    inputStartSec.max = duration.toFixed(2);
    inputEndSec.max = duration.toFixed(2);
    inputStartSec.value = '0.00';
    inputEndSec.value = duration.toFixed(2);

    studioPanel.style.display = 'block';
    updateTimelineMarkers();
    updateMetrics();
    updateFfmpegCode();
    captureBoundaryFrames();
  };
}

// Update Timeline Handles and Active Track
function updateTimelineMarkers() {
  if (duration <= 0) return;
  const startPct = (startTime / duration) * 100;
  const endPct = (endTime / duration) * 100;

  handleStart.style.left = `calc(${startPct}% - 7px)`;
  handleEnd.style.left = `calc(${endPct}% - 7px)`;

  trackActiveRange.style.left = `${startPct}%`;
  trackActiveRange.style.width = `${Math.max(0, endPct - startPct)}%`;

  labelStartTime.textContent = formatTime(startTime);
  labelEndTime.textContent = formatTime(endTime);
}

// Update Playhead cursor
function updatePlayhead() {
  if (duration <= 0) return;
  const curr = mainVideo.currentTime;
  const currPct = (curr / duration) * 100;
  playheadCursor.style.left = `${currPct}%`;
  labelCurrentTime.textContent = formatTime(curr);
}

// Update Metrics Cards
function updateMetrics() {
  const trimmedDur = Math.max(0, endTime - startTime);
  const removedDur = Math.max(0, duration - trimmedDur);
  const percent = duration > 0 ? ((trimmedDur / duration) * 100).toFixed(1) : '100.0';

  metricOriginal.textContent = formatTime(duration);
  metricTrimmed.textContent = formatTime(trimmedDur);
  metricRemoved.textContent = formatTime(removedDur);
  metricPercent.textContent = `${percent}%`;
}

// Update FFmpeg Code Box
function updateFfmpegCode() {
  const startFormatted = formatTime(startTime, true);
  const endFormatted = formatTime(endTime, true);
  const cleanName = videoFileName.replace(/\.[^/.]+$/, '');
  const outName = `trimmed_${cleanName}.mp4`;
  codeFfmpeg.textContent = `ffmpeg -ss ${startFormatted} -to ${endFormatted} -i "${videoFileName}" -c copy "${outName}"`;
}

// Capture Start & End Boundary Frames
function captureBoundaryFrames() {
  if (!previewVideoStart || !previewVideoEnd || duration <= 0) return;

  previewStartTs.textContent = formatTime(startTime);
  previewEndTs.textContent = formatTime(endTime);

  // Seek start boundary video
  previewVideoStart.currentTime = startTime;
  previewVideoStart.onseeked = () => {
    drawFrameToCanvas(previewVideoStart, canvasStartFrame);
  };

  // Seek end boundary video
  previewVideoEnd.currentTime = endTime;
  previewVideoEnd.onseeked = () => {
    drawFrameToCanvas(previewVideoEnd, canvasEndFrame);
  };
}

function drawFrameToCanvas(srcVideo, targetCanvas) {
  if (!srcVideo || srcVideo.videoWidth === 0) return;
  const dpr = window.devicePixelRatio || 1;
  const width = targetCanvas.parentElement.clientWidth || 240;
  const aspect = srcVideo.videoWidth / srcVideo.videoHeight;
  const height = width / aspect;

  targetCanvas.width = width * dpr;
  targetCanvas.height = height * dpr;
  const ctx = targetCanvas.getContext('2d');
  ctx.resetTransform ? ctx.resetTransform() : ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.scale(dpr, dpr);
  ctx.drawImage(srcVideo, 0, 0, width, height);
}

// Timeline Drag & Scrubbing Interactions
function getTimeFromTimelineEvent(e) {
  const rect = timelineTrack.getBoundingClientRect();
  const clientX = e.touches ? e.touches[0].clientX : e.clientX;
  const relX = Math.max(0, Math.min(clientX - rect.left, rect.width));
  return (relX / rect.width) * duration;
}

handleStart.addEventListener('mousedown', (e) => {
  isDraggingStart = true;
  e.stopPropagation();
});

handleEnd.addEventListener('mousedown', (e) => {
  isDraggingEnd = true;
  e.stopPropagation();
});

handleStart.addEventListener('touchstart', (e) => {
  isDraggingStart = true;
  e.stopPropagation();
}, { passive: true });

handleEnd.addEventListener('touchstart', (e) => {
  isDraggingEnd = true;
  e.stopPropagation();
}, { passive: true });

window.addEventListener('mousemove', (e) => {
  if (!isDraggingStart && !isDraggingEnd) return;
  const t = getTimeFromTimelineEvent(e);

  if (isDraggingStart) {
    startTime = Math.max(0, Math.min(t, endTime - 0.05));
    inputStartSec.value = startTime.toFixed(2);
  } else if (isDraggingEnd) {
    endTime = Math.min(duration, Math.max(t, startTime + 0.05));
    inputEndSec.value = endTime.toFixed(2);
  }

  updateTimelineMarkers();
  updateMetrics();
  updateFfmpegCode();
  captureBoundaryFrames();
});

window.addEventListener('touchmove', (e) => {
  if (!isDraggingStart && !isDraggingEnd) return;
  const t = getTimeFromTimelineEvent(e);

  if (isDraggingStart) {
    startTime = Math.max(0, Math.min(t, endTime - 0.05));
    inputStartSec.value = startTime.toFixed(2);
  } else if (isDraggingEnd) {
    endTime = Math.min(duration, Math.max(t, startTime + 0.05));
    inputEndSec.value = endTime.toFixed(2);
  }

  updateTimelineMarkers();
  updateMetrics();
  updateFfmpegCode();
  captureBoundaryFrames();
}, { passive: true });

window.addEventListener('mouseup', () => {
  isDraggingStart = false;
  isDraggingEnd = false;
});

window.addEventListener('touchend', () => {
  isDraggingStart = false;
  isDraggingEnd = false;
});

// Click anywhere on track to seek main video
timelineTrack.addEventListener('click', (e) => {
  if (e.target === handleStart || e.target === handleEnd) return;
  const t = getTimeFromTimelineEvent(e);
  mainVideo.currentTime = t;
  updatePlayhead();
});

// Main Video Event Listeners
mainVideo.addEventListener('timeupdate', () => {
  updatePlayhead();

  // If playing range and exceeds end time
  if (isPlayingRange && mainVideo.currentTime >= endTime) {
    if (checkLoopRange.checked) {
      mainVideo.currentTime = startTime;
      mainVideo.play();
    } else {
      mainVideo.pause();
      isPlayingRange = false;
    }
  }
});

mainVideo.addEventListener('play', () => {
  textPlay.textContent = 'Pause';
  iconPlay.innerHTML = '<rect x="6" y="4" width="4" height="16"></rect><rect x="14" y="4" width="4" height="16"></rect>';
});

mainVideo.addEventListener('pause', () => {
  textPlay.textContent = 'Play';
  iconPlay.innerHTML = '<polygon points="5 3 19 12 5 21 5 3"></polygon>';
});

// Play / Pause Button
btnPlayPause.addEventListener('click', () => {
  isPlayingRange = false;
  if (mainVideo.paused) {
    mainVideo.play();
  } else {
    mainVideo.pause();
  }
});

// Play Range Button
btnPlayRange.addEventListener('click', () => {
  isPlayingRange = true;
  mainVideo.currentTime = startTime;
  mainVideo.play();
});

// Stepper and Direct Input Changes
inputStartSec.addEventListener('input', (e) => {
  let val = parseFloat(e.target.value) || 0;
  startTime = Math.max(0, Math.min(val, endTime - 0.05));
  updateTimelineMarkers();
  updateMetrics();
  updateFfmpegCode();
  captureBoundaryFrames();
});

inputEndSec.addEventListener('input', (e) => {
  let val = parseFloat(e.target.value) || duration;
  endTime = Math.min(duration, Math.max(val, startTime + 0.05));
  updateTimelineMarkers();
  updateMetrics();
  updateFfmpegCode();
  captureBoundaryFrames();
});

// Fine-tuning Stepper Buttons
document.getElementById('btn-start-sub-1').addEventListener('click', () => {
  startTime = Math.max(0, startTime - 1.0);
  inputStartSec.value = startTime.toFixed(2);
  updateTimelineMarkers();
  updateMetrics();
  updateFfmpegCode();
  captureBoundaryFrames();
});
document.getElementById('btn-start-sub-01').addEventListener('click', () => {
  startTime = Math.max(0, startTime - 0.1);
  inputStartSec.value = startTime.toFixed(2);
  updateTimelineMarkers();
  updateMetrics();
  updateFfmpegCode();
  captureBoundaryFrames();
});
document.getElementById('btn-start-add-01').addEventListener('click', () => {
  startTime = Math.min(endTime - 0.05, startTime + 0.1);
  inputStartSec.value = startTime.toFixed(2);
  updateTimelineMarkers();
  updateMetrics();
  updateFfmpegCode();
  captureBoundaryFrames();
});
document.getElementById('btn-start-add-1').addEventListener('click', () => {
  startTime = Math.min(endTime - 0.05, startTime + 1.0);
  inputStartSec.value = startTime.toFixed(2);
  updateTimelineMarkers();
  updateMetrics();
  updateFfmpegCode();
  captureBoundaryFrames();
});

document.getElementById('btn-end-sub-1').addEventListener('click', () => {
  endTime = Math.max(startTime + 0.05, endTime - 1.0);
  inputEndSec.value = endTime.toFixed(2);
  updateTimelineMarkers();
  updateMetrics();
  updateFfmpegCode();
  captureBoundaryFrames();
});
document.getElementById('btn-end-sub-01').addEventListener('click', () => {
  endTime = Math.max(startTime + 0.05, endTime - 0.1);
  inputEndSec.value = endTime.toFixed(2);
  updateTimelineMarkers();
  updateMetrics();
  updateFfmpegCode();
  captureBoundaryFrames();
});
document.getElementById('btn-end-add-01').addEventListener('click', () => {
  endTime = Math.min(duration, endTime + 0.1);
  inputEndSec.value = endTime.toFixed(2);
  updateTimelineMarkers();
  updateMetrics();
  updateFfmpegCode();
  captureBoundaryFrames();
});
document.getElementById('btn-end-add-1').addEventListener('click', () => {
  endTime = Math.min(duration, endTime + 1.0);
  inputEndSec.value = endTime.toFixed(2);
  updateTimelineMarkers();
  updateMetrics();
  updateFfmpegCode();
  captureBoundaryFrames();
});

// Set to Current
btnSetStartCurr.addEventListener('click', () => {
  const curr = mainVideo.currentTime;
  if (curr < endTime - 0.05) {
    startTime = curr;
    inputStartSec.value = startTime.toFixed(2);
    updateTimelineMarkers();
    updateMetrics();
    updateFfmpegCode();
    captureBoundaryFrames();
  }
});

btnSetEndCurr.addEventListener('click', () => {
  const curr = mainVideo.currentTime;
  if (curr > startTime + 0.05) {
    endTime = curr;
    inputEndSec.value = endTime.toFixed(2);
    updateTimelineMarkers();
    updateMetrics();
    updateFfmpegCode();
    captureBoundaryFrames();
  }
});

// Click Boundary Frame Holders to Seek
holderStartFrame.addEventListener('click', () => {
  mainVideo.currentTime = startTime;
  updatePlayhead();
});

holderEndFrame.addEventListener('click', () => {
  mainVideo.currentTime = endTime;
  updatePlayhead();
});

// Frame Capture Snapshot (Lossless PNG)
btnSnapshotFrame.addEventListener('click', () => {
  if (!mainVideo.videoWidth) return;
  const canvas = document.createElement('canvas');
  canvas.width = mainVideo.videoWidth;
  canvas.height = mainVideo.videoHeight;
  const ctx = canvas.getContext('2d');
  ctx.drawImage(mainVideo, 0, 0, canvas.width, canvas.height);

  canvas.toBlob((blob) => {
    if (!blob) return;
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    const ts = formatTime(mainVideo.currentTime).replace(/[:.]/g, '-');
    a.href = url;
    a.download = `frame_${videoFileName.replace(/\.[^/.]+$/, '')}_${ts}.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  }, 'image/png');
});

// Copy FFmpeg Command
btnCopyFfmpeg.addEventListener('click', () => {
  navigator.clipboard.writeText(codeFfmpeg.textContent).then(() => {
    const orig = btnCopyFfmpeg.textContent;
    btnCopyFfmpeg.textContent = 'Copied to Clipboard!';
    setTimeout(() => { btnCopyFfmpeg.textContent = orig; }, 2000);
  });
});

// Export JSON
btnExportJson.addEventListener('click', () => {
  const data = {
    file: videoFileName,
    resolution: `${mainVideo.videoWidth}x${mainVideo.videoHeight}`,
    originalDuration: duration,
    startTime,
    endTime,
    trimmedDuration: endTime - startTime,
    ffmpegCommand: codeFfmpeg.textContent
  };

  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = `trim_markers_${videoFileName.replace(/\.[^/.]+$/, '')}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
});

// Export Trimmed Video Clip (.webm) directly in browser
btnDownloadClip.addEventListener('click', () => {
  if (mainVideo.paused) {
    mainVideo.currentTime = startTime;
  }
  // Use canvas stream capture
  const canvas = document.createElement('canvas');
  canvas.width = mainVideo.videoWidth || 640;
  canvas.height = mainVideo.videoHeight || 360;
  const ctx = canvas.getContext('2d');

  const stream = canvas.captureStream(30);
  let recorder;
  try {
    recorder = new MediaRecorder(stream, { mimeType: 'video/webm' });
  } catch (e) {
    recorder = new MediaRecorder(stream);
  }

  const chunks = [];
  recorder.ondataavailable = (e) => {
    if (e.data.size > 0) chunks.push(e.data);
  };

  recorder.onstop = () => {
    const clipBlob = new Blob(chunks, { type: 'video/webm' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(clipBlob);
    a.download = `trimmed_${videoFileName.replace(/\.[^/.]+$/, '')}.webm`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    btnDownloadClip.textContent = 'Export Video Clip (.webm)';
  };

  btnDownloadClip.textContent = 'Recording Clip...';
  recorder.start();

  mainVideo.currentTime = startTime;
  mainVideo.play();

  const drawInterval = setInterval(() => {
    if (mainVideo.currentTime >= endTime || mainVideo.paused) {
      clearInterval(drawInterval);
      mainVideo.pause();
      if (recorder.state === 'recording') recorder.stop();
      return;
    }
    ctx.drawImage(mainVideo, 0, 0, canvas.width, canvas.height);
  }, 1000 / 30);
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
  if (file) handleVideoFile(file);
});

fileInput.addEventListener('change', (e) => {
  const file = e.target.files[0];
  if (file) handleVideoFile(file);
});

function handleVideoFile(file) {
  videoFile = file;
  const blobUrl = URL.createObjectURL(file);
  loadVideoSource(blobUrl, file.name, file.size);
}

// Load Demo Video Button
btnLoadDemo.addEventListener('click', async () => {
  btnLoadDemo.textContent = 'Synthesizing Demo...';
  const { blob, name, size } = await generateDemoVideo();
  btnLoadDemo.textContent = 'Load Demo Video';
  const blobUrl = URL.createObjectURL(blob);
  loadVideoSource(blobUrl, name, size);
});